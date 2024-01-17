"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VAClient = void 0;
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const axios_1 = __importDefault(require("axios"));
const moonbeam_models_2 = require("@moonbeam/moonbeam-models");
/**
 * Class used as the base/generic client for all VA Lighthouse verification calls.
 */
class VAClient extends moonbeam_models_2.BaseAPIClient {
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
    // @ts-ignore
    async verifyServiceMember(numberOfCalls, newEnlistmentYear) {
        try {
            // retrieve the API Key and Base URL, needed in order to make the verification call through the client
            const [lighthouseBaseURL, lighthouseAPIKey] = await super.retrieveServiceCredentials(moonbeam_models_1.Constants.AWSPairConstants.LIGHTHOUSE_SECRET_NAME);
            // check to see if we obtained any invalid secret values from the call above
            if (lighthouseBaseURL === null || lighthouseBaseURL.length === 0 ||
                lighthouseAPIKey === null || lighthouseAPIKey.length === 0) {
                // for invalid secrets, return a Pending status, for a better customer experience
                console.log(`Invalid Secrets obtained for ${this.verificationInformation.militaryAffiliation} Lighthouse API call!`);
                return moonbeam_models_1.MilitaryVerificationStatusType.Pending;
            }
            // convert the date of birth into the appropriate format (YYYY-MM-DD), accepted by Lighthouse
            let dob = this.verificationInformation.dateOfBirth;
            dob = `${dob.split('/')[2]}-${dob.split('/')[0]}-${dob.split('/')[1]}`;
            // if the user lists more than 1 name for their first name, and it's separated by a space, then replace the spaces with "-"
            let firstNameFormatted = this.verificationInformation.firstName.includes(' ')
                ? this.verificationInformation.firstName.replace(' ', '-')
                : this.verificationInformation.firstName;
            /**
             * POST /status
             * @link https://developer.va.gov/explore/verification/docs/veteran_confirmation?version=current
             *
             * build the Lighthouse API request body to be passed in, and perform a POST to it with the appropriate information
             * we imply that if the API does not respond in 10 seconds, then we automatically catch that, and return a Pending status
             * for a better customer experience.
             */
            const requestData = {
                firstName: firstNameFormatted,
                lastName: this.verificationInformation.lastName,
                birthDate: dob,
                streetAddressLine1: this.verificationInformation.addressLine,
                city: this.verificationInformation.city,
                state: this.verificationInformation.state,
                zipCode: this.verificationInformation.zipCode,
                country: "USA"
            };
            console.log(`Calling Lighthouse API for ${this.verificationInformation.militaryAffiliation}, for ${requestData.firstName} ${requestData.lastName}`);
            return axios_1.default.post(lighthouseBaseURL, requestData, {
                headers: {
                    "Content-Type": "application/json",
                    "apiKey": lighthouseAPIKey
                },
                timeout: 10000,
                timeoutErrorMessage: `Lighthouse API for ${this.verificationInformation.militaryAffiliation} timed out after 10000ms!`
            }).then(verificationResponse => {
                /**
                 * if we reached this, then we assume that a 2xx response code was returned.
                 * check the contents of the response, and act appropriately.
                 */
                if (verificationResponse.data && verificationResponse.data["veteran_status"] === "confirmed") {
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
                    const errorMessage = `Non 2xxx response while calling the ${this.verificationInformation.militaryAffiliation} Lighthouse API, with status ${error.response.status}, and response ${JSON.stringify(error.response.data)}`;
                    console.log(errorMessage);
                    return moonbeam_models_1.MilitaryVerificationStatusType.Pending;
                }
                else if (error.request) {
                    /**
                     * The request was made but no response was received
                     * `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                     *  http.ClientRequest in node.js.
                     */
                    const errorMessage = `No response received while calling the Lighthouse API, for ${this.verificationInformation.militaryAffiliation} request ${error.request}`;
                    console.log(errorMessage);
                    return moonbeam_models_1.MilitaryVerificationStatusType.Pending;
                }
                else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the ${this.verificationInformation.militaryAffiliation} request for the Lighthouse API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);
                    return moonbeam_models_1.MilitaryVerificationStatusType.Pending;
                }
            });
        }
        catch (err) {
            // for any error caught here, return a Pending status, for a better customer experience
            const errorMessage = `Unexpected error while verifying ${this.verificationInformation.militaryAffiliation} military status through the Lighthouse API ${err}`;
            console.log(errorMessage);
            return moonbeam_models_1.MilitaryVerificationStatusType.Pending;
        }
    }
}
exports.VAClient = VAClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkFDbGllbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL2NsaWVudHMvVkFDbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsK0RBQXFIO0FBQ3JILGtEQUEwQjtBQUMxQiwrREFBd0Q7QUFFeEQ7O0dBRUc7QUFDSCxNQUFhLFFBQVMsU0FBUSwrQkFBYTtJQUN2Qzs7O09BR0c7SUFDYyx1QkFBdUIsQ0FBNkU7SUFFckg7Ozs7Ozs7T0FPRztJQUNILFlBQVksdUJBQW1HLEVBQUUsV0FBbUIsRUFBRSxNQUFjO1FBQ2hKLEtBQUssQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFFM0IsSUFBSSxDQUFDLHVCQUF1QixHQUFHLHVCQUF1QixDQUFDO0lBQzNELENBQUM7SUFFRDs7Ozs7Ozs7Ozs7O09BWUc7SUFDSCxhQUFhO0lBQ2IsS0FBSyxDQUFDLG1CQUFtQixDQUFDLGFBQXNCLEVBQUUsaUJBQTBCO1FBQ3hFLElBQUk7WUFDQSxzR0FBc0c7WUFDdEcsTUFBTSxDQUFDLGlCQUFpQixFQUFFLGdCQUFnQixDQUFDLEdBQUcsTUFBTSxLQUFLLENBQUMsMEJBQTBCLENBQUMsMkJBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1lBRXhJLDRFQUE0RTtZQUM1RSxJQUFJLGlCQUFpQixLQUFLLElBQUksSUFBSSxpQkFBaUIsQ0FBQyxNQUFNLEtBQUssQ0FBQztnQkFDNUQsZ0JBQWdCLEtBQUssSUFBSSxJQUFJLGdCQUFnQixDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQzVELGlGQUFpRjtnQkFDakYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQ0FBZ0MsSUFBSSxDQUFDLHVCQUF1QixDQUFDLG1CQUFtQix1QkFBdUIsQ0FBQyxDQUFDO2dCQUVySCxPQUFPLGdEQUE4QixDQUFDLE9BQU8sQ0FBQzthQUNqRDtZQUVELDZGQUE2RjtZQUM3RixJQUFJLEdBQUcsR0FBRyxJ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WUFBWSxDQUFDLENBQUM7b0JBRTFCLE9BQU8sZ0RBQThCLENBQUMsT0FBTyxDQUFDO2lCQUNqRDtxQkFBTTtvQkFDSCx1RUFBdUU7b0JBQ3ZFLE1BQU0sWUFBWSxHQUFHLHlDQUF5QyxJQUFJLENBQUMsdUJBQXVCLENBQUMsbUJBQW1CLG9DQUFvQyxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO29CQUM5TCxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO29CQUUxQixPQUFPLGdEQUE4QixDQUFDLE9BQU8sQ0FBQztpQkFDakQ7WUFDTCxDQUFDLENBQUMsQ0FBQztTQUNOO1FBQUMsT0FBTyxHQUFHLEVBQUU7WUFDVix1RkFBdUY7WUFDdkYsTUFBTSxZQUFZLEdBQUcsb0NBQW9DLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxtQkFBbUIsK0NBQStDLEdBQUcsRUFBRSxDQUFDO1lBQzlKLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7WUFFMUIsT0FBTyxnREFBOEIsQ0FBQyxPQUFPLENBQUM7U0FDakQ7SUFDTCxDQUFDO0NBQ0o7QUFsSUQsNEJBa0lDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDb25zdGFudHMsIE1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5mb3JtYXRpb24sIE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZX0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcbmltcG9ydCBheGlvcyBmcm9tIFwiYXhpb3NcIjtcbmltcG9ydCB7QmFzZUFQSUNsaWVudH0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcblxuLyoqXG4gKiBDbGFzcyB1c2VkIGFzIHRoZSBiYXNlL2dlbmVyaWMgY2xpZW50IGZvciBhbGwgVkEgTGlnaHRob3VzZSB2ZXJpZmljYXRpb24gY2FsbHMuXG4gKi9cbmV4cG9ydCBjbGFzcyBWQUNsaWVudCBleHRlbmRzIEJhc2VBUElDbGllbnQge1xuICAgIC8qKlxuICAgICAqIFRoZSB2ZXJpZmljYXRpb24gaW5mb3JtYXRpb24gcHJvdmlkZWQgYnkgdGhlIGN1c3RvbWVyLCB3aGljaCB0aGV5IHdpbGxcbiAgICAgKiBnZXQgdmVyaWZpZWQgdXBvbi5cbiAgICAgKi9cbiAgICBwcml2YXRlIHJlYWRvbmx5IHZlcmlmaWNhdGlvbkluZm9ybWF0aW9uOiBNaWxpdGFyeVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uICYge3BlcnNvbmFsSWRlbnRpZmllcjogc3RyaW5nIHwgdW5kZWZpbmVkfTtcblxuICAgIC8qKlxuICAgICAqIEdlbmVyaWMgY29uc3RydWN0b3IgZm9yIHRoZSB2ZXJpZmljYXRpb24gY2xpZW50LlxuICAgICAqXG4gICAgICogQHBhcmFtIHZlcmlmaWNhdGlvbkluZm9ybWF0aW9uIHZlcmlmaWNhdGlvbiBpbmZvcm1hdGlvbiBwcm92aWRlZCBieSB0aGVcbiAgICAgKiBjdXN0b21lci5cbiAgICAgKiBAcGFyYW0gcmVnaW9uIHRoZSBBV1MgcmVnaW9uIHBhc3NlZCBpbiBmcm9tIHRoZSBMYW1iZGEgcmVzb2x2ZXIuXG4gICAgICogQHBhcmFtIGVudmlyb25tZW50IHRoZSBBV1MgZW52aXJvbm1lbnQgcGFzc2VkIGluIGZyb20gdGhlIExhbWJkYSByZXNvbHZlci5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcih2ZXJpZmljYXRpb25JbmZvcm1hdGlvbjogTWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbiAmIHtwZXJzb25hbElkZW50aWZpZXI6IHN0cmluZyB8IHVuZGVmaW5lZH0sIGVudmlyb25tZW50OiBzdHJpbmcsIHJlZ2lvbjogc3RyaW5nKSB7XG4gICAgICAgIHN1cGVyKHJlZ2lvbiwgZW52aXJvbm1lbnQpO1xuXG4gICAgICAgIHRoaXMudmVyaWZpY2F0aW9uSW5mb3JtYXRpb24gPSB2ZXJpZmljYXRpb25JbmZvcm1hdGlvbjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB1c2VkIHRvIHZlcmlmeSBhbiBpbmRpdmlkdWFsJ3MgbWlsaXRhcnkgc2VydmljZSBzdGF0dXMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gbnVtYmVyT2ZDYWxscyBvcHRpb25hbCBwYXJhbSwgdXNlZCBmb3IgdXNlIGNhc2VzIHdoZW4gd2UgcmVjdXJzaXZlbHkgY2FsbFxuICAgICAqICAgICAgICAgICAgICAgICAgICAgIHRoaXMgZnVuY3Rpb24gaW4gb3JkZXIgdG8gbWFrZSBhZGRpdGlvbmFsIGNhbGxzIHRvIFF1YW5kaXNcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICBmb3IgdXNlcnMgd2hvIGxpc3QgYW4gaW5jb3JyZWN0IGVubGlzdG1lbnQgeWVhciBhdCBmaXJzdFxuICAgICAqICAgICAgICAgICAgICAgICAgICAgIChub3QgYXBwbGljYWJsZSBmb3IgdGhlIFZBKVxuICAgICAqIEBwYXJhbSBuZXdFbmxpc3RtZW50WWVhciBvcHRpb25hbCBwYXJhbSwgcmVwcmVzZW50aW5nIG5ldyBlbmxpc3RtZW50IHllYXIgZm9yIHRoZVxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICByZWN1cnNpdmUgY2FsbCAobm90IGFwcGxpY2FibGUgZm9yIHRoZSBWQSkuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIGEge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1R5cGV9IHJlcHJlc2VudGluZyB0aGVcbiAgICAgKiBtaWxpdGFyeSB2ZXJpZmljYXRpb24gc3RhdHVzIG9idGFpbmVkIGZyb20gdGhlIGNsaWVudCB2ZXJpZmljYXRpb24gY2FsbFxuICAgICAqL1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBhc3luYyB2ZXJpZnlTZXJ2aWNlTWVtYmVyKG51bWJlck9mQ2FsbHM/OiBudW1iZXIsIG5ld0VubGlzdG1lbnRZZWFyPzogbnVtYmVyKTogUHJvbWlzZTxNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1R5cGU+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBBUEkgS2V5IGFuZCBCYXNlIFVSTCwgbmVlZGVkIGluIG9yZGVyIHRvIG1ha2UgdGhlIHZlcmlmaWNhdGlvbiBjYWxsIHRocm91Z2ggdGhlIGNsaWVudFxuICAgICAgICAgICAgY29uc3QgW2xpZ2h0aG91c2VCYXNlVVJMLCBsaWdodGhvdXNlQVBJS2V5XSA9IGF3YWl0IHN1cGVyLnJldHJpZXZlU2VydmljZUNyZWRlbnRpYWxzKENvbnN0YW50cy5BV1NQYWlyQ29uc3RhbnRzLkxJR0hUSE9VU0VfU0VDUkVUX05BTUUpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgd2Ugb2J0YWluZWQgYW55IGludmFsaWQgc2VjcmV0IHZhbHVlcyBmcm9tIHRoZSBjYWxsIGFib3ZlXG4gICAgICAgICAgICBpZiAobGlnaHRob3VzZUJhc2VVUkwgPT09IG51bGwgfHwgbGlnaHRob3VzZUJhc2VVUkwubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgbGlnaHRob3VzZUFQSUtleSA9PT0gbnVsbCB8fCBsaWdodGhvdXNlQVBJS2V5Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIC8vIGZvciBpbnZhbGlkIHNlY3JldHMsIHJldHVybiBhIFBlbmRpbmcgc3RhdHVzLCBmb3IgYSBiZXR0ZXIgY3VzdG9tZXIgZXhwZXJpZW5jZVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBJbnZhbGlkIFNlY3JldHMgb2J0YWluZWQgZm9yICR7dGhpcy52ZXJpZmljYXRpb25JbmZvcm1hdGlvbi5taWxpdGFyeUFmZmlsaWF0aW9ufSBMaWdodGhvdXNlIEFQSSBjYWxsIWApO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZS5QZW5kaW5nO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBjb252ZXJ0IHRoZSBkYXRlIG9mIGJpcnRoIGludG8gdGhlIGFwcHJvcHJpYXRlIGZvcm1hdCAoWVlZWS1NTS1ERCksIGFjY2VwdGVkIGJ5IExpZ2h0aG91c2VcbiAgICAgICAgICAgIGxldCBkb2IgPSB0aGlzLnZlcmlmaWNhdGlvbkluZm9ybWF0aW9uLmRhdGVPZkJpcnRoO1xuICAgICAgICAgICAgZG9iID0gYCR7ZG9iLnNwbGl0KCcvJylbMl19LSR7ZG9iLnNwbGl0KCcvJylbMF19LSR7ZG9iLnNwbGl0KCcvJylbMV19YDtcblxuICAgICAgICAgICAgLy8gaWYgdGhlIHVzZXIgbGlzdHMgbW9yZSB0aGFuIDEgbmFtZSBmb3IgdGhlaXIgZmlyc3QgbmFtZSwgYW5kIGl0J3Mgc2VwYXJhdGVkIGJ5IGEgc3BhY2UsIHRoZW4gcmVwbGFjZSB0aGUgc3BhY2VzIHdpdGggXCItXCJcbiAgICAgICAgICAgIGxldCBmaXJzdE5hbWVGb3JtYXR0ZWQgPSB0aGlzLnZlcmlmaWNhdGlvbkluZm9ybWF0aW9uLmZpcnN0TmFtZS5pbmNsdWRlcygnICcpXG4gICAgICAgICAgICAgICAgPyB0aGlzLnZlcmlmaWNhdGlvbkluZm9ybWF0aW9uLmZpcnN0TmFtZS5yZXBsYWNlKCcgJywgJy0nKVxuICAgICAgICAgICAgICAgIDogdGhpcy52ZXJpZmljYXRpb25JbmZvcm1hdGlvbi5maXJzdE5hbWU7XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogUE9TVCAvc3RhdHVzXG4gICAgICAgICAgICAgKiBAbGluayBodHRwczovL2RldmVsb3Blci52YS5nb3YvZXhwbG9yZS92ZXJpZmljYXRpb24vZG9jcy92ZXRlcmFuX2NvbmZpcm1hdGlvbj92ZXJzaW9uPWN1cnJlbnRcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBidWlsZCB0aGUgTGlnaHRob3VzZSBBUEkgcmVxdWVzdCBib2R5IHRvIGJlIHBhc3NlZCBpbiwgYW5kIHBlcmZvcm0gYSBQT1NUIHRvIGl0IHdpdGggdGhlIGFwcHJvcHJpYXRlIGluZm9ybWF0aW9uXG4gICAgICAgICAgICAgKiB3ZSBpbXBseSB0aGF0IGlmIHRoZSBBUEkgZG9lcyBub3QgcmVzcG9uZCBpbiAxMCBzZWNvbmRzLCB0aGVuIHdlIGF1dG9tYXRpY2FsbHkgY2F0Y2ggdGhhdCwgYW5kIHJldHVybiBhIFBlbmRpbmcgc3RhdHVzXG4gICAgICAgICAgICAgKiBmb3IgYSBiZXR0ZXIgY3VzdG9tZXIgZXhwZXJpZW5jZS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgY29uc3QgcmVxdWVzdERhdGEgPSB7XG4gICAgICAgICAgICAgICAgZmlyc3ROYW1lOiBmaXJzdE5hbWVGb3JtYXR0ZWQsXG4gICAgICAgICAgICAgICAgbGFzdE5hbWU6IHRoaXMudmVyaWZpY2F0aW9uSW5mb3JtYXRpb24ubGFzdE5hbWUsXG4gICAgICAgICAgICAgICAgYmlydGhEYXRlOiBkb2IsXG4gICAgICAgICAgICAgICAgc3RyZWV0QWRkcmVzc0xpbmUxOiB0aGlzLnZlcmlmaWNhdGlvbkluZm9ybWF0aW9uLmFkZHJlc3NMaW5lLFxuICAgICAgICAgICAgICAgIGNpdHk6IHRoaXMudmVyaWZpY2F0aW9uSW5mb3JtYXRpb24uY2l0eSxcbiAgICAgICAgICAgICAgICBzdGF0ZTogdGhpcy52ZXJpZmljYXRpb25JbmZvcm1hdGlvbi5zdGF0ZSxcbiAgICAgICAgICAgICAgICB6aXBDb2RlOiB0aGlzLnZlcmlmaWNhdGlvbkluZm9ybWF0aW9uLnppcENvZGUsXG4gICAgICAgICAgICAgICAgY291bnRyeTogXCJVU0FcIlxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBDYWxsaW5nIExpZ2h0aG91c2UgQVBJIGZvciAke3RoaXMudmVyaWZpY2F0aW9uSW5mb3JtYXRpb24ubWlsaXRhcnlBZmZpbGlhdGlvbn0sIGZvciAke3JlcXVlc3REYXRhLmZpcnN0TmFtZX0gJHtyZXF1ZXN0RGF0YS5sYXN0TmFtZX1gKTtcbiAgICAgICAgICAgIHJldHVybiBheGlvcy5wb3N0KGxpZ2h0aG91c2VCYXNlVVJMLCByZXF1ZXN0RGF0YSwge1xuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiYXBpS2V5XCI6IGxpZ2h0aG91c2VBUElLZXlcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDEwMDAwLCAvLyBpbiBtaWxsaXNlY29uZHMgaGVyZVxuICAgICAgICAgICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2U6IGBMaWdodGhvdXNlIEFQSSBmb3IgJHt0aGlzLnZlcmlmaWNhdGlvbkluZm9ybWF0aW9uLm1pbGl0YXJ5QWZmaWxpYXRpb259IHRpbWVkIG91dCBhZnRlciAxMDAwMG1zIWBcbiAgICAgICAgICAgIH0pLnRoZW4odmVyaWZpY2F0aW9uUmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIGlmIHdlIHJlYWNoZWQgdGhpcywgdGhlbiB3ZSBhc3N1bWUgdGhhdCBhIDJ4eCByZXNwb25zZSBjb2RlIHdhcyByZXR1cm5lZC5cbiAgICAgICAgICAgICAgICAgKiBjaGVjayB0aGUgY29udGVudHMgb2YgdGhlIHJlc3BvbnNlLCBhbmQgYWN0IGFwcHJvcHJpYXRlbHkuXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgaWYgKHZlcmlmaWNhdGlvblJlc3BvbnNlLmRhdGEgJiYgdmVyaWZpY2F0aW9uUmVzcG9uc2UuZGF0YVtcInZldGVyYW5fc3RhdHVzXCJdID09PSBcImNvbmZpcm1lZFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1R5cGUuVmVyaWZpZWQ7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZS5QZW5kaW5nO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IucmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGFuZCB0aGUgc2VydmVyIHJlc3BvbmRlZCB3aXRoIGEgc3RhdHVzIGNvZGVcbiAgICAgICAgICAgICAgICAgICAgICogdGhhdCBmYWxscyBvdXQgb2YgdGhlIHJhbmdlIG9mIDJ4eC5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBOb24gMnh4eCByZXNwb25zZSB3aGlsZSBjYWxsaW5nIHRoZSAke3RoaXMudmVyaWZpY2F0aW9uSW5mb3JtYXRpb24ubWlsaXRhcnlBZmZpbGlhdGlvbn0gTGlnaHRob3VzZSBBUEksIHdpdGggc3RhdHVzICR7ZXJyb3IucmVzcG9uc2Uuc3RhdHVzfSwgYW5kIHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZXJyb3IucmVzcG9uc2UuZGF0YSl9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNUeXBlLlBlbmRpbmc7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5yZXF1ZXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBidXQgbm8gcmVzcG9uc2Ugd2FzIHJlY2VpdmVkXG4gICAgICAgICAgICAgICAgICAgICAqIGBlcnJvci5yZXF1ZXN0YCBpcyBhbiBpbnN0YW5jZSBvZiBYTUxIdHRwUmVxdWVzdCBpbiB0aGUgYnJvd3NlciBhbmQgYW4gaW5zdGFuY2Ugb2ZcbiAgICAgICAgICAgICAgICAgICAgICogIGh0dHAuQ2xpZW50UmVxdWVzdCBpbiBub2RlLmpzLlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vIHJlc3BvbnNlIHJlY2VpdmVkIHdoaWxlIGNhbGxpbmcgdGhlIExpZ2h0aG91c2UgQVBJLCBmb3IgJHt0aGlzLnZlcmlmaWNhdGlvbkluZm9ybWF0aW9uLm1pbGl0YXJ5QWZmaWxpYXRpb259IHJlcXVlc3QgJHtlcnJvci5yZXF1ZXN0fWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZS5QZW5kaW5nO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNvbWV0aGluZyBoYXBwZW5lZCBpbiBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IHRoYXQgdHJpZ2dlcmVkIGFuIEVycm9yXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHNldHRpbmcgdXAgdGhlICR7dGhpcy52ZXJpZmljYXRpb25JbmZvcm1hdGlvbi5taWxpdGFyeUFmZmlsaWF0aW9ufSByZXF1ZXN0IGZvciB0aGUgTGlnaHRob3VzZSBBUEksICR7KGVycm9yICYmIGVycm9yLm1lc3NhZ2UpICYmIGVycm9yLm1lc3NhZ2V9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNUeXBlLlBlbmRpbmc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgLy8gZm9yIGFueSBlcnJvciBjYXVnaHQgaGVyZSwgcmV0dXJuIGEgUGVuZGluZyBzdGF0dXMsIGZvciBhIGJldHRlciBjdXN0b21lciBleHBlcmllbmNlXG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSB2ZXJpZnlpbmcgJHt0aGlzLnZlcmlmaWNhdGlvbkluZm9ybWF0aW9uLm1pbGl0YXJ5QWZmaWxpYXRpb259IG1pbGl0YXJ5IHN0YXR1cyB0aHJvdWdoIHRoZSBMaWdodGhvdXNlIEFQSSAke2Vycn1gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgcmV0dXJuIE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZS5QZW5kaW5nO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19