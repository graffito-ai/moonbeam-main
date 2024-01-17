"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuandisClient = void 0;
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const axios_1 = __importDefault(require("axios"));
/**
 * Class used as the base/generic client for all Quandis verification calls.
 */
class QuandisClient extends moonbeam_models_1.BaseAPIClient {
    /**
     * The verification information provided by the customer, which they will
     * get verified upon.
     */
    verificationInformation;
    /**
     * Generic constructor for the verification client.
     *
     * @param verificationInformation verification information provided by the
     * customer.
     * @param region the AWS region passed in from the Lambda resolver.
     * @param environment the AWS environment passed in from the Lambda resolver.
     */
    constructor(verificationInformation, environment, region) {
        super(region, environment);
        this.verificationInformation = verificationInformation;
    }
    /**
     * Function used to verify an individual's military service status.
     *
     * @param numberOfCalls optional param, used for use cases when we recursively call
     *                      this function in order to make additional calls to Quandis
     *                      for users who list an incorrect enlistment year at first
     *                      (not applicable for the VA)
     * @param newEnlistmentYear optional param, representing new enlistment year for the
     *                          recursive call (not applicable for the VA).
     *
     * @return a {@link Promise} of {@link MilitaryVerificationStatusType} representing the
     * military verification status obtained from the client verification call
     */
    async verifyServiceMember(numberOfCalls, newEnlistmentYear) {
        try {
            // retrieve the API Key and Base URL, needed in order to make the verification call through the client
            const [quandisBaseURL, quandisAPIKey] = await super.retrieveServiceCredentials(moonbeam_models_1.Constants.AWSPairConstants.QUANDIS_SECRET_NAME);
            // check to see if we obtained any invalid secret values from the call above
            if (quandisBaseURL === null || quandisBaseURL.length === 0 ||
                quandisAPIKey === null || quandisAPIKey.length === 0) {
                // for invalid secrets, return a Pending status, for a better customer experience
                console.log(`Invalid Secrets obtained for ${this.verificationInformation.militaryAffiliation} Quandis call!`);
                return moonbeam_models_1.MilitaryVerificationStatusType.Pending;
            }
            // convert the date of birth into the appropriate format (YYYY-MM-DD), accepted by Quandis
            let dob = this.verificationInformation.dateOfBirth;
            dob = `${dob.split('/')[2]}-${dob.split('/')[0]}-${dob.split('/')[1]}`;
            // convert the date of interest from the enlistment year into the appropriate format (YYYY-12-31), accepted by Quandis
            let dateOfInterest = newEnlistmentYear === undefined
                ? `${this.verificationInformation.enlistmentYear}-12-31`
                : `${newEnlistmentYear}-12-31`;
            /**
             * POST /api/military/scra/instant/{clientID}
             * @link https://uatservices.quandis.io/api/military/documentation/openapi/index.html?url=/api/military/documentation/v1/swagger.json#tag/SCRA
             *
             * build the Quandis API request body to be passed in, and perform a POST to it with the appropriate information
             * Note that the client_id, appended to the base URL, is the uuid for the user, which will be used for tracking purposes in case of any issues
             * we imply that if the API does not respond in 10 seconds, then we automatically catch that, and return a Pending status
             * for a better customer experience.
             */
            const requestData = {
                certificate: false,
                firstName: this.verificationInformation.firstName,
                lastName: this.verificationInformation.lastName,
                birthDate: dob,
                dateOfInterest: dateOfInterest
            };
            console.log(`Calling Quandis API for ${this.verificationInformation.militaryAffiliation}, for ${requestData.firstName} ${requestData.lastName}`);
            return axios_1.default.post(`${quandisBaseURL}/scra/instant/${this.verificationInformation.id}`, requestData, {
                headers: {
                    "Content-Type": "application/json",
                    "X-ApiKey": quandisAPIKey
                },
                timeout: 10000,
                timeoutErrorMessage: `Quandis API for ${this.verificationInformation.militaryAffiliation} timed out after 4000ms!`
            }).then(async (verificationResponse) => {
                /**
                 * if we reached this, then we assume that a 2xx response code was returned.
                 * check the contents of the response, and act appropriately.
                 */
                if (verificationResponse.data && verificationResponse.data["covered"] === true) {
                    return moonbeam_models_1.MilitaryVerificationStatusType.Verified;
                }
                else {
                    /**
                     * In some instances, users provide Moonbeam with their commission/enlistment year. However, Quandis fails to verify them because their true EAD date is a year later.
                     * In most cases, we believe this is due to users who entered into Delayed Entry Programs or who had "sworn in" at the end of a given year, but did not report to basic
                     * training until the following year
                     */
                    if (numberOfCalls === undefined) {
                        await delay(2000); // delay 2 seconds between calls
                        const newEnlistmentYear = Number(this.verificationInformation.enlistmentYear) + 1;
                        console.log(`Re-attempting to verify user ${this.verificationInformation.id} with new enlistment year ${newEnlistmentYear}`);
                        return this.verifyServiceMember(1, newEnlistmentYear); // only calls this function once
                    }
                    else {
                        return moonbeam_models_1.MilitaryVerificationStatusType.Pending;
                    }
                }
            }).catch(error => {
                if (error.response) {
                    /**
                     * The request was made and the server responded with a status code
                     * that falls out of the range of 2xx.
                     */
                    const errorMessage = `Non 2xxx response while calling the ${this.verificationInformation.militaryAffiliation} Quandis API, with status ${error.response.status}, and response ${JSON.stringify(error.response.data)}`;
                    console.log(errorMessage);
                    return moonbeam_models_1.MilitaryVerificationStatusType.Pending;
                }
                else if (error.request) {
                    /**
                     * The request was made but no response was received
                     * `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                     *  http.ClientRequest in node.js.
                     */
                    const errorMessage = `No response received while calling the Quandis API, for ${this.verificationInformation.militaryAffiliation} request ${error.request}`;
                    console.log(errorMessage);
                    return moonbeam_models_1.MilitaryVerificationStatusType.Pending;
                }
                else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the ${this.verificationInformation.militaryAffiliation} request for the Quandis API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);
                    return moonbeam_models_1.MilitaryVerificationStatusType.Pending;
                }
            });
        }
        catch (err) {
            // for any error caught here, return a PENDING status, for a better customer experience
            const errorMessage = `Unexpected error while verifying ${this.verificationInformation.militaryAffiliation} military status through Quandis ${err}`;
            console.log(errorMessage);
            return moonbeam_models_1.MilitaryVerificationStatusType.Pending;
        }
    }
    /**
     * Function used to verify an individual's spouse's military service status.
     *
     * @return a {@link Promise} of {@link MilitaryVerificationStatusType} representing the
     * military verification status obtained from the client verification call
     */
    async verifyMemberSpouse() {
        try {
            // retrieve the API Key and Base URL, needed in order to make the verification call through the client
            const [quandisBaseURL, quandisAPIKey] = await super.retrieveServiceCredentials(moonbeam_models_1.Constants.AWSPairConstants.QUANDIS_SECRET_NAME);
            // check to see if we obtained any invalid secret values from the call above
            if (quandisBaseURL === null || quandisBaseURL.length === 0 ||
                quandisAPIKey === null || quandisAPIKey.length === 0) {
                // for invalid secrets, return a Pending status, for a better customer experience
                console.log(`Invalid Secrets obtained for ${this.verificationInformation.militaryAffiliation} Quandis call!`);
                return moonbeam_models_1.MilitaryVerificationStatusType.Pending;
            }
            // convert the date of birth into the appropriate format (YYYY-MM-DD), accepted by Quandis
            let dob = this.verificationInformation.dateOfBirth;
            dob = `${dob.split('/')[2]}-${dob.split('/')[0]}-${dob.split('/')[1]}`;
            /**
             * POST /api/military/mla/instant/{clientID}
             * @link https://uatservices.quandis.io/api/military/documentation/openapi/index.html?url=/api/military/documentation/v1/swagger.json#tag/MLA
             *
             * build the Quandis API request body to be passed in, and perform a POST to it with the appropriate information
             * Note that the client_id, appended to the base URL, is the uuid for the user, which will be used for tracking purposes in case of any issues
             * we imply that if the API does not respond in 10 seconds, then we automatically catch that, and return a Pending status
             * for a better customer experience.
             */
            const requestData = {
                certificate: false,
                firstName: this.verificationInformation.firstName,
                lastName: this.verificationInformation.lastName,
                ssn: this.verificationInformation.personalIdentifier,
                birthDate: dob
            };
            console.log(`Calling Quandis API for ${this.verificationInformation.militaryAffiliation}, for ${requestData.firstName} ${requestData.lastName}`);
            return axios_1.default.post(`${quandisBaseURL}/mla/instant/${this.verificationInformation.id}`, requestData, {
                headers: {
                    "Content-Type": "application/json",
                    "X-ApiKey": quandisAPIKey
                },
                timeout: 10000,
                timeoutErrorMessage: `Quandis API for ${this.verificationInformation.militaryAffiliation} timed out after 10000ms!`
            }).then(async (verificationResponse) => {
                /**
                 * if we reached this, then we assume that a 2xx response code was returned.
                 * check the contents of the response, and act appropriately.
                 */
                if (verificationResponse.data && verificationResponse.data["covered"] === true) {
                    return moonbeam_models_1.MilitaryVerificationStatusType.Verified;
                }
                else {
                    return moonbeam_models_1.MilitaryVerificationStatusType.Pending;
                }
            }).catch(error => {
                if (error.response) {
                    /**
                     * The request was made and the server responded with a status code
                     * that falls out of the range of 2xx.
                     */
                    const errorMessage = `Non 2xxx response while calling the ${this.verificationInformation.militaryAffiliation} Quandis API, with status ${error.response.status}, and response ${JSON.stringify(error.response.data)}`;
                    console.log(errorMessage);
                    return moonbeam_models_1.MilitaryVerificationStatusType.Pending;
                }
                else if (error.request) {
                    /**
                     * The request was made but no response was received
                     * `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                     *  http.ClientRequest in node.js.
                     */
                    const errorMessage = `No response received while calling the Quandis API, for ${this.verificationInformation.militaryAffiliation} request ${error.request}`;
                    console.log(errorMessage);
                    return moonbeam_models_1.MilitaryVerificationStatusType.Pending;
                }
                else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the ${this.verificationInformation.militaryAffiliation} request for the Quandis API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);
                    return moonbeam_models_1.MilitaryVerificationStatusType.Pending;
                }
            });
        }
        catch (err) {
            // for any error caught here, return a Pending status, for a better customer experience
            const errorMessage = `Unexpected error while verifying ${this.verificationInformation.militaryAffiliation} military status through Quandis ${err}`;
            console.log(errorMessage);
            return moonbeam_models_1.MilitaryVerificationStatusType.Pending;
        }
    }
}
exports.QuandisClient = QuandisClient;
/**
 * Function used as a delay
 *
 * @param ms number of milliseconds to delay by
 *
 * @returns a {@link Promise}
 */
const delay = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUXVhbmRpc0NsaWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvY2xpZW50cy9RdWFuZGlzQ2xpZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLCtEQUttQztBQUNuQyxrREFBMEI7QUFFMUI7O0dBRUc7QUFDSCxNQUFhLGFBQWMsU0FBUSwrQkFBYTtJQUM1Qzs7O09BR0c7SUFDYyx1QkFBdUIsQ0FBNkU7SUFFckg7Ozs7Ozs7T0FPRztJQUNILFlBQVksdUJBQW1HLEVBQUUsV0FBbUIsRUFBRSxNQUFjO1FBQ2hKLEtBQUssQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDM0IsSUFBSSxDQUFDLHVCQUF1QixHQUFHLHVCQUF1QixDQUFDO0lBQzNELENBQUM7SUFFRDs7Ozs7Ozs7Ozs7O09BWUc7SUFDSCxLQUFLLENBQUMsbUJBQW1CLENBQUMsYUFBc0IsRUFBRSxpQkFBMEI7UUFDeEUsSUFBSTtZQUNBLHNHQUFzRztZQUN0RyxNQUFNLENBQUMsY0FBYyxFQUFFLGFBQWEsQ0FBQyxHQUFHLE1BQU0sS0FBSyxDQUFDLDBCQUEwQixDQUFDLDJCQUFTLENBQUMsZ0JBQWdCLENBQUMsbUJBQW1CLENBQUMsQ0FBQztZQUUvSCw0RUFBNEU7WUFDNUUsSUFBSSxjQUFjLEtBQUssSUFBSSxJQUFJLGNBQWMsQ0FBQyxNQUFNLEtBQUssQ0FBQztnQkFDdEQsYUFBYSxLQUFLLElBQUksSUFBSSxhQUFhLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDdEQsaUZBQWlGO2dCQUNqRixPQUFPLENBQUMsR0FBRyxDQUFDLGdDQUFnQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsbUJBQW1CLGdCQUFnQixDQUFDLENBQUM7Z0JBRTlHLE9BQU8sZ0RBQThCLENBQUMsT0FBTyxDQUFDO2FBQ2pEO1lBRUQsMEZBQTBGO1lBQzFGLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxXQUFX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QUE4QixDQUFDLE9BQU8sQ0FBQztpQkFDakQ7cUJBQU07b0JBQ0gsdUVBQXVFO29CQUN2RSxNQUFNLFlBQVksR0FBRyx5Q0FBeUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLG1CQUFtQixpQ0FBaUMsQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztvQkFDM0wsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztvQkFFMUIsT0FBTyxnREFBOEIsQ0FBQyxPQUFPLENBQUM7aUJBQ2pEO1lBQ0wsQ0FBQyxDQUFDLENBQUM7U0FDTjtRQUFDLE9BQU8sR0FBRyxFQUFFO1lBQ1YsdUZBQXVGO1lBQ3ZGLE1BQU0sWUFBWSxHQUFHLG9DQUFvQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsbUJBQW1CLG9DQUFvQyxHQUFHLEVBQUUsQ0FBQztZQUNuSixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRTFCLE9BQU8sZ0RBQThCLENBQUMsT0FBTyxDQUFDO1NBQ2pEO0lBQ0wsQ0FBQztDQUNKO0FBek9ELHNDQXlPQztBQUVEOzs7Ozs7R0FNRztBQUNILE1BQU0sS0FBSyxHQUFHLENBQUMsRUFBVSxFQUFnQixFQUFFO0lBQ3ZDLE9BQU8sSUFBSSxPQUFPLENBQUUsT0FBTyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFFLENBQUM7QUFDN0QsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgICBCYXNlQVBJQ2xpZW50LFxuICAgIENvbnN0YW50cyxcbiAgICBNaWxpdGFyeVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uLFxuICAgIE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZVxufSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuaW1wb3J0IGF4aW9zIGZyb20gXCJheGlvc1wiO1xuXG4vKipcbiAqIENsYXNzIHVzZWQgYXMgdGhlIGJhc2UvZ2VuZXJpYyBjbGllbnQgZm9yIGFsbCBRdWFuZGlzIHZlcmlmaWNhdGlvbiBjYWxscy5cbiAqL1xuZXhwb3J0IGNsYXNzIFF1YW5kaXNDbGllbnQgZXh0ZW5kcyBCYXNlQVBJQ2xpZW50IHtcbiAgICAvKipcbiAgICAgKiBUaGUgdmVyaWZpY2F0aW9uIGluZm9ybWF0aW9uIHByb3ZpZGVkIGJ5IHRoZSBjdXN0b21lciwgd2hpY2ggdGhleSB3aWxsXG4gICAgICogZ2V0IHZlcmlmaWVkIHVwb24uXG4gICAgICovXG4gICAgcHJpdmF0ZSByZWFkb25seSB2ZXJpZmljYXRpb25JbmZvcm1hdGlvbjogTWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbiAmIHtwZXJzb25hbElkZW50aWZpZXI6IHN0cmluZyB8IHVuZGVmaW5lZH07XG5cbiAgICAvKipcbiAgICAgKiBHZW5lcmljIGNvbnN0cnVjdG9yIGZvciB0aGUgdmVyaWZpY2F0aW9uIGNsaWVudC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB2ZXJpZmljYXRpb25JbmZvcm1hdGlvbiB2ZXJpZmljYXRpb24gaW5mb3JtYXRpb24gcHJvdmlkZWQgYnkgdGhlXG4gICAgICogY3VzdG9tZXIuXG4gICAgICogQHBhcmFtIHJlZ2lvbiB0aGUgQVdTIHJlZ2lvbiBwYXNzZWQgaW4gZnJvbSB0aGUgTGFtYmRhIHJlc29sdmVyLlxuICAgICAqIEBwYXJhbSBlbnZpcm9ubWVudCB0aGUgQVdTIGVudmlyb25tZW50IHBhc3NlZCBpbiBmcm9tIHRoZSBMYW1iZGEgcmVzb2x2ZXIuXG4gICAgICovXG4gICAgY29uc3RydWN0b3IodmVyaWZpY2F0aW9uSW5mb3JtYXRpb246IE1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5mb3JtYXRpb24gJiB7cGVyc29uYWxJZGVudGlmaWVyOiBzdHJpbmcgfCB1bmRlZmluZWR9LCBlbnZpcm9ubWVudDogc3RyaW5nLCByZWdpb246IHN0cmluZykge1xuICAgICAgICBzdXBlcihyZWdpb24sIGVudmlyb25tZW50KTtcbiAgICAgICAgdGhpcy52ZXJpZmljYXRpb25JbmZvcm1hdGlvbiA9IHZlcmlmaWNhdGlvbkluZm9ybWF0aW9uO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHVzZWQgdG8gdmVyaWZ5IGFuIGluZGl2aWR1YWwncyBtaWxpdGFyeSBzZXJ2aWNlIHN0YXR1cy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBudW1iZXJPZkNhbGxzIG9wdGlvbmFsIHBhcmFtLCB1c2VkIGZvciB1c2UgY2FzZXMgd2hlbiB3ZSByZWN1cnNpdmVseSBjYWxsXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgdGhpcyBmdW5jdGlvbiBpbiBvcmRlciB0byBtYWtlIGFkZGl0aW9uYWwgY2FsbHMgdG8gUXVhbmRpc1xuICAgICAqICAgICAgICAgICAgICAgICAgICAgIGZvciB1c2VycyB3aG8gbGlzdCBhbiBpbmNvcnJlY3QgZW5saXN0bWVudCB5ZWFyIGF0IGZpcnN0XG4gICAgICogICAgICAgICAgICAgICAgICAgICAgKG5vdCBhcHBsaWNhYmxlIGZvciB0aGUgVkEpXG4gICAgICogQHBhcmFtIG5ld0VubGlzdG1lbnRZZWFyIG9wdGlvbmFsIHBhcmFtLCByZXByZXNlbnRpbmcgbmV3IGVubGlzdG1lbnQgeWVhciBmb3IgdGhlXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgIHJlY3Vyc2l2ZSBjYWxsIChub3QgYXBwbGljYWJsZSBmb3IgdGhlIFZBKS5cbiAgICAgKlxuICAgICAqIEByZXR1cm4gYSB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZX0gcmVwcmVzZW50aW5nIHRoZVxuICAgICAqIG1pbGl0YXJ5IHZlcmlmaWNhdGlvbiBzdGF0dXMgb2J0YWluZWQgZnJvbSB0aGUgY2xpZW50IHZlcmlmaWNhdGlvbiBjYWxsXG4gICAgICovXG4gICAgYXN5bmMgdmVyaWZ5U2VydmljZU1lbWJlcihudW1iZXJPZkNhbGxzPzogbnVtYmVyLCBuZXdFbmxpc3RtZW50WWVhcj86IG51bWJlcik6IFByb21pc2U8TWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNUeXBlPiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgQVBJIEtleSBhbmQgQmFzZSBVUkwsIG5lZWRlZCBpbiBvcmRlciB0byBtYWtlIHRoZSB2ZXJpZmljYXRpb24gY2FsbCB0aHJvdWdoIHRoZSBjbGllbnRcbiAgICAgICAgICAgIGNvbnN0IFtxdWFuZGlzQmFzZVVSTCwgcXVhbmRpc0FQSUtleV0gPSBhd2FpdCBzdXBlci5yZXRyaWV2ZVNlcnZpY2VDcmVkZW50aWFscyhDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5RVUFORElTX1NFQ1JFVF9OQU1FKTtcblxuICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHdlIG9idGFpbmVkIGFueSBpbnZhbGlkIHNlY3JldCB2YWx1ZXMgZnJvbSB0aGUgY2FsbCBhYm92ZVxuICAgICAgICAgICAgaWYgKHF1YW5kaXNCYXNlVVJMID09PSBudWxsIHx8IHF1YW5kaXNCYXNlVVJMLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIHF1YW5kaXNBUElLZXkgPT09IG51bGwgfHwgcXVhbmRpc0FQSUtleS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAvLyBmb3IgaW52YWxpZCBzZWNyZXRzLCByZXR1cm4gYSBQZW5kaW5nIHN0YXR1cywgZm9yIGEgYmV0dGVyIGN1c3RvbWVyIGV4cGVyaWVuY2VcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgSW52YWxpZCBTZWNyZXRzIG9idGFpbmVkIGZvciAke3RoaXMudmVyaWZpY2F0aW9uSW5mb3JtYXRpb24ubWlsaXRhcnlBZmZpbGlhdGlvbn0gUXVhbmRpcyBjYWxsIWApO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZS5QZW5kaW5nO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBjb252ZXJ0IHRoZSBkYXRlIG9mIGJpcnRoIGludG8gdGhlIGFwcHJvcHJpYXRlIGZvcm1hdCAoWVlZWS1NTS1ERCksIGFjY2VwdGVkIGJ5IFF1YW5kaXNcbiAgICAgICAgICAgIGxldCBkb2IgPSB0aGlzLnZlcmlmaWNhdGlvbkluZm9ybWF0aW9uLmRhdGVPZkJpcnRoO1xuICAgICAgICAgICAgZG9iID0gYCR7ZG9iLnNwbGl0KCcvJylbMl19LSR7ZG9iLnNwbGl0KCcvJylbMF19LSR7ZG9iLnNwbGl0KCcvJylbMV19YDtcblxuICAgICAgICAgICAgLy8gY29udmVydCB0aGUgZGF0ZSBvZiBpbnRlcmVzdCBmcm9tIHRoZSBlbmxpc3RtZW50IHllYXIgaW50byB0aGUgYXBwcm9wcmlhdGUgZm9ybWF0IChZWVlZLTEyLTMxKSwgYWNjZXB0ZWQgYnkgUXVhbmRpc1xuICAgICAgICAgICAgbGV0IGRhdGVPZkludGVyZXN0ID0gbmV3RW5saXN0bWVudFllYXIgPT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgID8gYCR7dGhpcy52ZXJpZmljYXRpb25JbmZvcm1hdGlvbi5lbmxpc3RtZW50WWVhcn0tMTItMzFgXG4gICAgICAgICAgICAgICAgOiBgJHtuZXdFbmxpc3RtZW50WWVhcn0tMTItMzFgO1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFBPU1QgL2FwaS9taWxpdGFyeS9zY3JhL2luc3RhbnQve2NsaWVudElEfVxuICAgICAgICAgICAgICogQGxpbmsgaHR0cHM6Ly91YXRzZXJ2aWNlcy5xdWFuZGlzLmlvL2FwaS9taWxpdGFyeS9kb2N1bWVudGF0aW9uL29wZW5hcGkvaW5kZXguaHRtbD91cmw9L2FwaS9taWxpdGFyeS9kb2N1bWVudGF0aW9uL3YxL3N3YWdnZXIuanNvbiN0YWcvU0NSQVxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIGJ1aWxkIHRoZSBRdWFuZGlzIEFQSSByZXF1ZXN0IGJvZHkgdG8gYmUgcGFzc2VkIGluLCBhbmQgcGVyZm9ybSBhIFBPU1QgdG8gaXQgd2l0aCB0aGUgYXBwcm9wcmlhdGUgaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAqIE5vdGUgdGhhdCB0aGUgY2xpZW50X2lkLCBhcHBlbmRlZCB0byB0aGUgYmFzZSBVUkwsIGlzIHRoZSB1dWlkIGZvciB0aGUgdXNlciwgd2hpY2ggd2lsbCBiZSB1c2VkIGZvciB0cmFja2luZyBwdXJwb3NlcyBpbiBjYXNlIG9mIGFueSBpc3N1ZXNcbiAgICAgICAgICAgICAqIHdlIGltcGx5IHRoYXQgaWYgdGhlIEFQSSBkb2VzIG5vdCByZXNwb25kIGluIDEwIHNlY29uZHMsIHRoZW4gd2UgYXV0b21hdGljYWxseSBjYXRjaCB0aGF0LCBhbmQgcmV0dXJuIGEgUGVuZGluZyBzdGF0dXNcbiAgICAgICAgICAgICAqIGZvciBhIGJldHRlciBjdXN0b21lciBleHBlcmllbmNlLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBjb25zdCByZXF1ZXN0RGF0YSA9IHtcbiAgICAgICAgICAgICAgICBjZXJ0aWZpY2F0ZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgZmlyc3ROYW1lOiB0aGlzLnZlcmlmaWNhdGlvbkluZm9ybWF0aW9uLmZpcnN0TmFtZSxcbiAgICAgICAgICAgICAgICBsYXN0TmFtZTogdGhpcy52ZXJpZmljYXRpb25JbmZvcm1hdGlvbi5sYXN0TmFtZSxcbiAgICAgICAgICAgICAgICBiaXJ0aERhdGU6IGRvYixcbiAgICAgICAgICAgICAgICBkYXRlT2ZJbnRlcmVzdDogZGF0ZU9mSW50ZXJlc3RcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgQ2FsbGluZyBRdWFuZGlzIEFQSSBmb3IgJHt0aGlzLnZlcmlmaWNhdGlvbkluZm9ybWF0aW9uLm1pbGl0YXJ5QWZmaWxpYXRpb259LCBmb3IgJHtyZXF1ZXN0RGF0YS5maXJzdE5hbWV9ICR7cmVxdWVzdERhdGEubGFzdE5hbWV9YCk7XG4gICAgICAgICAgICByZXR1cm4gYXhpb3MucG9zdChgJHtxdWFuZGlzQmFzZVVSTH0vc2NyYS9pbnN0YW50LyR7dGhpcy52ZXJpZmljYXRpb25JbmZvcm1hdGlvbi5pZH1gLCByZXF1ZXN0RGF0YSwge1xuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiWC1BcGlLZXlcIjogcXVhbmRpc0FQSUtleVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGltZW91dDogMTAwMDAsIC8vIGluIG1pbGxpc2Vjb25kcyBoZXJlXG4gICAgICAgICAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZTogYFF1YW5kaXMgQVBJIGZvciAke3RoaXMudmVyaWZpY2F0aW9uSW5mb3JtYXRpb24ubWlsaXRhcnlBZmZpbGlhdGlvbn0gdGltZWQgb3V0IGFmdGVyIDQwMDBtcyFgXG4gICAgICAgICAgICB9KS50aGVuKGFzeW5jIHZlcmlmaWNhdGlvblJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiBpZiB3ZSByZWFjaGVkIHRoaXMsIHRoZW4gd2UgYXNzdW1lIHRoYXQgYSAyeHggcmVzcG9uc2UgY29kZSB3YXMgcmV0dXJuZWQuXG4gICAgICAgICAgICAgICAgICogY2hlY2sgdGhlIGNvbnRlbnRzIG9mIHRoZSByZXNwb25zZSwgYW5kIGFjdCBhcHByb3ByaWF0ZWx5LlxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGlmICh2ZXJpZmljYXRpb25SZXNwb25zZS5kYXRhICYmIHZlcmlmaWNhdGlvblJlc3BvbnNlLmRhdGFbXCJjb3ZlcmVkXCJdID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1R5cGUuVmVyaWZpZWQ7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIEluIHNvbWUgaW5zdGFuY2VzLCB1c2VycyBwcm92aWRlIE1vb25iZWFtIHdpdGggdGhlaXIgY29tbWlzc2lvbi9lbmxpc3RtZW50IHllYXIuIEhvd2V2ZXIsIFF1YW5kaXMgZmFpbHMgdG8gdmVyaWZ5IHRoZW0gYmVjYXVzZSB0aGVpciB0cnVlIEVBRCBkYXRlIGlzIGEgeWVhciBsYXRlci5cbiAgICAgICAgICAgICAgICAgICAgICogSW4gbW9zdCBjYXNlcywgd2UgYmVsaWV2ZSB0aGlzIGlzIGR1ZSB0byB1c2VycyB3aG8gZW50ZXJlZCBpbnRvIERlbGF5ZWQgRW50cnkgUHJvZ3JhbXMgb3Igd2hvIGhhZCBcInN3b3JuIGluXCIgYXQgdGhlIGVuZCBvZiBhIGdpdmVuIHllYXIsIGJ1dCBkaWQgbm90IHJlcG9ydCB0byBiYXNpY1xuICAgICAgICAgICAgICAgICAgICAgKiB0cmFpbmluZyB1bnRpbCB0aGUgZm9sbG93aW5nIHllYXJcbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGlmIChudW1iZXJPZkNhbGxzID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IGRlbGF5KDIwMDApOyAvLyBkZWxheSAyIHNlY29uZHMgYmV0d2VlbiBjYWxsc1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV3RW5saXN0bWVudFllYXIgPSBOdW1iZXIodGhpcy52ZXJpZmljYXRpb25JbmZvcm1hdGlvbi5lbmxpc3RtZW50WWVhcikgKyAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFJlLWF0dGVtcHRpbmcgdG8gdmVyaWZ5IHVzZXIgJHt0aGlzLnZlcmlmaWNhdGlvbkluZm9ybWF0aW9uLmlkfSB3aXRoIG5ldyBlbmxpc3RtZW50IHllYXIgJHtuZXdFbmxpc3RtZW50WWVhcn1gKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudmVyaWZ5U2VydmljZU1lbWJlcigxLCBuZXdFbmxpc3RtZW50WWVhcik7IC8vIG9ubHkgY2FsbHMgdGhpcyBmdW5jdGlvbiBvbmNlXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNUeXBlLlBlbmRpbmc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yLnJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBhbmQgdGhlIHNlcnZlciByZXNwb25kZWQgd2l0aCBhIHN0YXR1cyBjb2RlXG4gICAgICAgICAgICAgICAgICAgICAqIHRoYXQgZmFsbHMgb3V0IG9mIHRoZSByYW5nZSBvZiAyeHguXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm9uIDJ4eHggcmVzcG9uc2Ugd2hpbGUgY2FsbGluZyB0aGUgJHt0aGlzLnZlcmlmaWNhdGlvbkluZm9ybWF0aW9uLm1pbGl0YXJ5QWZmaWxpYXRpb259IFF1YW5kaXMgQVBJLCB3aXRoIHN0YXR1cyAke2Vycm9yLnJlc3BvbnNlLnN0YXR1c30sIGFuZCByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGVycm9yLnJlc3BvbnNlLmRhdGEpfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZS5QZW5kaW5nO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3IucmVxdWVzdCkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYnV0IG5vIHJlc3BvbnNlIHdhcyByZWNlaXZlZFxuICAgICAgICAgICAgICAgICAgICAgKiBgZXJyb3IucmVxdWVzdGAgaXMgYW4gaW5zdGFuY2Ugb2YgWE1MSHR0cFJlcXVlc3QgaW4gdGhlIGJyb3dzZXIgYW5kIGFuIGluc3RhbmNlIG9mXG4gICAgICAgICAgICAgICAgICAgICAqICBodHRwLkNsaWVudFJlcXVlc3QgaW4gbm9kZS5qcy5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBObyByZXNwb25zZSByZWNlaXZlZCB3aGlsZSBjYWxsaW5nIHRoZSBRdWFuZGlzIEFQSSwgZm9yICR7dGhpcy52ZXJpZmljYXRpb25JbmZvcm1hdGlvbi5taWxpdGFyeUFmZmlsaWF0aW9ufSByZXF1ZXN0ICR7ZXJyb3IucmVxdWVzdH1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1R5cGUuUGVuZGluZztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBTb21ldGhpbmcgaGFwcGVuZWQgaW4gc2V0dGluZyB1cCB0aGUgcmVxdWVzdCB0aGF0IHRyaWdnZXJlZCBhbiBFcnJvclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBzZXR0aW5nIHVwIHRoZSAke3RoaXMudmVyaWZpY2F0aW9uSW5mb3JtYXRpb24ubWlsaXRhcnlBZmZpbGlhdGlvbn0gcmVxdWVzdCBmb3IgdGhlIFF1YW5kaXMgQVBJLCAkeyhlcnJvciAmJiBlcnJvci5tZXNzYWdlKSAmJiBlcnJvci5tZXNzYWdlfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZS5QZW5kaW5nO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIC8vIGZvciBhbnkgZXJyb3IgY2F1Z2h0IGhlcmUsIHJldHVybiBhIFBFTkRJTkcgc3RhdHVzLCBmb3IgYSBiZXR0ZXIgY3VzdG9tZXIgZXhwZXJpZW5jZVxuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgdmVyaWZ5aW5nICR7dGhpcy52ZXJpZmljYXRpb25JbmZvcm1hdGlvbi5taWxpdGFyeUFmZmlsaWF0aW9ufSBtaWxpdGFyeSBzdGF0dXMgdGhyb3VnaCBRdWFuZGlzICR7ZXJyfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICByZXR1cm4gTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNUeXBlLlBlbmRpbmc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB1c2VkIHRvIHZlcmlmeSBhbiBpbmRpdmlkdWFsJ3Mgc3BvdXNlJ3MgbWlsaXRhcnkgc2VydmljZSBzdGF0dXMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIGEge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1R5cGV9IHJlcHJlc2VudGluZyB0aGVcbiAgICAgKiBtaWxpdGFyeSB2ZXJpZmljYXRpb24gc3RhdHVzIG9idGFpbmVkIGZyb20gdGhlIGNsaWVudCB2ZXJpZmljYXRpb24gY2FsbFxuICAgICAqL1xuICAgIGFzeW5jIHZlcmlmeU1lbWJlclNwb3VzZSgpOiBQcm9taXNlPE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIEFQSSBLZXkgYW5kIEJhc2UgVVJMLCBuZWVkZWQgaW4gb3JkZXIgdG8gbWFrZSB0aGUgdmVyaWZpY2F0aW9uIGNhbGwgdGhyb3VnaCB0aGUgY2xpZW50XG4gICAgICAgICAgICBjb25zdCBbcXVhbmRpc0Jhc2VVUkwsIHF1YW5kaXNBUElLZXldID0gYXdhaXQgc3VwZXIucmV0cmlldmVTZXJ2aWNlQ3JlZGVudGlhbHMoQ29uc3RhbnRzLkFXU1BhaXJDb25zdGFudHMuUVVBTkRJU19TRUNSRVRfTkFNRSk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB3ZSBvYnRhaW5lZCBhbnkgaW52YWxpZCBzZWNyZXQgdmFsdWVzIGZyb20gdGhlIGNhbGwgYWJvdmVcbiAgICAgICAgICAgIGlmIChxdWFuZGlzQmFzZVVSTCA9PT0gbnVsbCB8fCBxdWFuZGlzQmFzZVVSTC5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBxdWFuZGlzQVBJS2V5ID09PSBudWxsIHx8IHF1YW5kaXNBUElLZXkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgLy8gZm9yIGludmFsaWQgc2VjcmV0cywgcmV0dXJuIGEgUGVuZGluZyBzdGF0dXMsIGZvciBhIGJldHRlciBjdXN0b21lciBleHBlcmllbmNlXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYEludmFsaWQgU2VjcmV0cyBvYnRhaW5lZCBmb3IgJHt0aGlzLnZlcmlmaWNhdGlvbkluZm9ybWF0aW9uLm1pbGl0YXJ5QWZmaWxpYXRpb259IFF1YW5kaXMgY2FsbCFgKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1R5cGUuUGVuZGluZztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gY29udmVydCB0aGUgZGF0ZSBvZiBiaXJ0aCBpbnRvIHRoZSBhcHByb3ByaWF0ZSBmb3JtYXQgKFlZWVktTU0tREQpLCBhY2NlcHRlZCBieSBRdWFuZGlzXG4gICAgICAgICAgICBsZXQgZG9iID0gdGhpcy52ZXJpZmljYXRpb25JbmZvcm1hdGlvbi5kYXRlT2ZCaXJ0aDtcbiAgICAgICAgICAgIGRvYiA9IGAke2RvYi5zcGxpdCgnLycpWzJdfS0ke2RvYi5zcGxpdCgnLycpWzBdfS0ke2RvYi5zcGxpdCgnLycpWzFdfWA7XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogUE9TVCAvYXBpL21pbGl0YXJ5L21sYS9pbnN0YW50L3tjbGllbnRJRH1cbiAgICAgICAgICAgICAqIEBsaW5rIGh0dHBzOi8vdWF0c2VydmljZXMucXVhbmRpcy5pby9hcGkvbWlsaXRhcnkvZG9jdW1lbnRhdGlvbi9vcGVuYXBpL2luZGV4Lmh0bWw/dXJsPS9hcGkvbWlsaXRhcnkvZG9jdW1lbnRhdGlvbi92MS9zd2FnZ2VyLmpzb24jdGFnL01MQVxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIGJ1aWxkIHRoZSBRdWFuZGlzIEFQSSByZXF1ZXN0IGJvZHkgdG8gYmUgcGFzc2VkIGluLCBhbmQgcGVyZm9ybSBhIFBPU1QgdG8gaXQgd2l0aCB0aGUgYXBwcm9wcmlhdGUgaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAqIE5vdGUgdGhhdCB0aGUgY2xpZW50X2lkLCBhcHBlbmRlZCB0byB0aGUgYmFzZSBVUkwsIGlzIHRoZSB1dWlkIGZvciB0aGUgdXNlciwgd2hpY2ggd2lsbCBiZSB1c2VkIGZvciB0cmFja2luZyBwdXJwb3NlcyBpbiBjYXNlIG9mIGFueSBpc3N1ZXNcbiAgICAgICAgICAgICAqIHdlIGltcGx5IHRoYXQgaWYgdGhlIEFQSSBkb2VzIG5vdCByZXNwb25kIGluIDEwIHNlY29uZHMsIHRoZW4gd2UgYXV0b21hdGljYWxseSBjYXRjaCB0aGF0LCBhbmQgcmV0dXJuIGEgUGVuZGluZyBzdGF0dXNcbiAgICAgICAgICAgICAqIGZvciBhIGJldHRlciBjdXN0b21lciBleHBlcmllbmNlLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBjb25zdCByZXF1ZXN0RGF0YSA9IHtcbiAgICAgICAgICAgICAgICBjZXJ0aWZpY2F0ZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgZmlyc3ROYW1lOiB0aGlzLnZlcmlmaWNhdGlvbkluZm9ybWF0aW9uLmZpcnN0TmFtZSxcbiAgICAgICAgICAgICAgICBsYXN0TmFtZTogdGhpcy52ZXJpZmljYXRpb25JbmZvcm1hdGlvbi5sYXN0TmFtZSxcbiAgICAgICAgICAgICAgICBzc246IHRoaXMudmVyaWZpY2F0aW9uSW5mb3JtYXRpb24ucGVyc29uYWxJZGVudGlmaWVyISxcbiAgICAgICAgICAgICAgICBiaXJ0aERhdGU6IGRvYlxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBDYWxsaW5nIFF1YW5kaXMgQVBJIGZvciAke3RoaXMudmVyaWZpY2F0aW9uSW5mb3JtYXRpb24ubWlsaXRhcnlBZmZpbGlhdGlvbn0sIGZvciAke3JlcXVlc3REYXRhLmZpcnN0TmFtZX0gJHtyZXF1ZXN0RGF0YS5sYXN0TmFtZX1gKTtcbiAgICAgICAgICAgIHJldHVybiBheGlvcy5wb3N0KGAke3F1YW5kaXNCYXNlVVJMfS9tbGEvaW5zdGFudC8ke3RoaXMudmVyaWZpY2F0aW9uSW5mb3JtYXRpb24uaWR9YCwgcmVxdWVzdERhdGEsIHtcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgICAgICBcIlgtQXBpS2V5XCI6IHF1YW5kaXNBUElLZXlcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDEwMDAwLCAvLyBpbiBtaWxsaXNlY29uZHMgaGVyZVxuICAgICAgICAgICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2U6IGBRdWFuZGlzIEFQSSBmb3IgJHt0aGlzLnZlcmlmaWNhdGlvbkluZm9ybWF0aW9uLm1pbGl0YXJ5QWZmaWxpYXRpb259IHRpbWVkIG91dCBhZnRlciAxMDAwMG1zIWBcbiAgICAgICAgICAgIH0pLnRoZW4oYXN5bmMgdmVyaWZpY2F0aW9uUmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIGlmIHdlIHJlYWNoZWQgdGhpcywgdGhlbiB3ZSBhc3N1bWUgdGhhdCBhIDJ4eCByZXNwb25zZSBjb2RlIHdhcyByZXR1cm5lZC5cbiAgICAgICAgICAgICAgICAgKiBjaGVjayB0aGUgY29udGVudHMgb2YgdGhlIHJlc3BvbnNlLCBhbmQgYWN0IGFwcHJvcHJpYXRlbHkuXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgaWYgKHZlcmlmaWNhdGlvblJlc3BvbnNlLmRhdGEgJiYgdmVyaWZpY2F0aW9uUmVzcG9uc2UuZGF0YVtcImNvdmVyZWRcIl0gPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZS5WZXJpZmllZDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNUeXBlLlBlbmRpbmc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvci5yZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYW5kIHRoZSBzZXJ2ZXIgcmVzcG9uZGVkIHdpdGggYSBzdGF0dXMgY29kZVxuICAgICAgICAgICAgICAgICAgICAgKiB0aGF0IGZhbGxzIG91dCBvZiB0aGUgcmFuZ2Ugb2YgMnh4LlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vbiAyeHh4IHJlc3BvbnNlIHdoaWxlIGNhbGxpbmcgdGhlICR7dGhpcy52ZXJpZmljYXRpb25JbmZvcm1hdGlvbi5taWxpdGFyeUFmZmlsaWF0aW9ufSBRdWFuZGlzIEFQSSwgd2l0aCBzdGF0dXMgJHtlcnJvci5yZXNwb25zZS5zdGF0dXN9LCBhbmQgcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShlcnJvci5yZXNwb25zZS5kYXRhKX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1R5cGUuUGVuZGluZztcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVycm9yLnJlcXVlc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGJ1dCBubyByZXNwb25zZSB3YXMgcmVjZWl2ZWRcbiAgICAgICAgICAgICAgICAgICAgICogYGVycm9yLnJlcXVlc3RgIGlzIGFuIGluc3RhbmNlIG9mIFhNTEh0dHBSZXF1ZXN0IGluIHRoZSBicm93c2VyIGFuZCBhbiBpbnN0YW5jZSBvZlxuICAgICAgICAgICAgICAgICAgICAgKiAgaHR0cC5DbGllbnRSZXF1ZXN0IGluIG5vZGUuanMuXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm8gcmVzcG9uc2UgcmVjZWl2ZWQgd2hpbGUgY2FsbGluZyB0aGUgUXVhbmRpcyBBUEksIGZvciAke3RoaXMudmVyaWZpY2F0aW9uSW5mb3JtYXRpb24ubWlsaXRhcnlBZmZpbGlhdGlvbn0gcmVxdWVzdCAke2Vycm9yLnJlcXVlc3R9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNUeXBlLlBlbmRpbmc7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU29tZXRoaW5nIGhhcHBlbmVkIGluIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgdGhhdCB0cmlnZ2VyZWQgYW4gRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgc2V0dGluZyB1cCB0aGUgJHt0aGlzLnZlcmlmaWNhdGlvbkluZm9ybWF0aW9uLm1pbGl0YXJ5QWZmaWxpYXRpb259IHJlcXVlc3QgZm9yIHRoZSBRdWFuZGlzIEFQSSwgJHsoZXJyb3IgJiYgZXJyb3IubWVzc2FnZSkgJiYgZXJyb3IubWVzc2FnZX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1R5cGUuUGVuZGluZztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAvLyBmb3IgYW55IGVycm9yIGNhdWdodCBoZXJlLCByZXR1cm4gYSBQZW5kaW5nIHN0YXR1cywgZm9yIGEgYmV0dGVyIGN1c3RvbWVyIGV4cGVyaWVuY2VcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHZlcmlmeWluZyAke3RoaXMudmVyaWZpY2F0aW9uSW5mb3JtYXRpb24ubWlsaXRhcnlBZmZpbGlhdGlvbn0gbWlsaXRhcnkgc3RhdHVzIHRocm91Z2ggUXVhbmRpcyAke2Vycn1gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgcmV0dXJuIE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZS5QZW5kaW5nO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHVzZWQgYXMgYSBkZWxheVxuICpcbiAqIEBwYXJhbSBtcyBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRvIGRlbGF5IGJ5XG4gKlxuICogQHJldHVybnMgYSB7QGxpbmsgUHJvbWlzZX1cbiAqL1xuY29uc3QgZGVsYXkgPSAobXM6IG51bWJlcik6IFByb21pc2U8YW55PiA9PiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKCByZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgbXMpICk7XG59XG4iXX0=