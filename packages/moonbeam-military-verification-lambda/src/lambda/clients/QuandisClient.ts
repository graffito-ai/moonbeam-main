import {
    BaseAPIClient,
    Constants,
    MilitaryVerificationInformation,
    MilitaryVerificationStatusType
} from "@moonbeam/moonbeam-models";
import axios from "axios";

/**
 * Class used as the base/generic client for all Quandis verification calls.
 */
export class QuandisClient extends BaseAPIClient {
    /**
     * The verification information provided by the customer, which they will
     * get verified upon.
     */
    private readonly verificationInformation: MilitaryVerificationInformation & {personalIdentifier: string | undefined};

    /**
     * Generic constructor for the verification client.
     *
     * @param verificationInformation verification information provided by the
     * customer.
     * @param region the AWS region passed in from the Lambda resolver.
     * @param environment the AWS environment passed in from the Lambda resolver.
     */
    constructor(verificationInformation: MilitaryVerificationInformation & {personalIdentifier: string | undefined}, environment: string, region: string) {
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
    async verifyServiceMember(numberOfCalls?: number, newEnlistmentYear?: number): Promise<MilitaryVerificationStatusType> {
        try {
            // retrieve the API Key and Base URL, needed in order to make the verification call through the client
            const [quandisBaseURL, quandisAPIKey] = await super.retrieveServiceCredentials(Constants.AWSPairConstants.QUANDIS_SECRET_NAME);

            // check to see if we obtained any invalid secret values from the call above
            if (quandisBaseURL === null || quandisBaseURL.length === 0 ||
                quandisAPIKey === null || quandisAPIKey.length === 0) {
                // for invalid secrets, return a Pending status, for a better customer experience
                console.log(`Invalid Secrets obtained for ${this.verificationInformation.militaryAffiliation} Quandis call!`);

                return MilitaryVerificationStatusType.Pending;
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
            return axios.post(`${quandisBaseURL}/scra/instant/${this.verificationInformation.id}`, requestData, {
                headers: {
                    "Content-Type": "application/json",
                    "X-ApiKey": quandisAPIKey
                },
                timeout: 10000, // in milliseconds here
                timeoutErrorMessage: `Quandis API for ${this.verificationInformation.militaryAffiliation} timed out after 4000ms!`
            }).then(async verificationResponse => {
                /**
                 * if we reached this, then we assume that a 2xx response code was returned.
                 * check the contents of the response, and act appropriately.
                 */
                if (verificationResponse.data && verificationResponse.data["covered"] === true) {
                    return MilitaryVerificationStatusType.Verified;
                } else {
                    /**
                     * In some instances, users provide Moonbeam with their commission/enlistment year. However, Quandis fails to verify them because their true EAD date is a year later.
                     * In most cases, we believe this is due to users who entered into Delayed Entry Programs or who had "sworn in" at the end of a given year, but did not report to basic
                     * training until the following year
                     */
                    if (numberOfCalls === undefined) {
                        await delay(2000); // delay 2 seconds between calls
                        const newEnlistmentYear = Number(this.verificationInformation.enlistmentYear) + 1;
                        console.log(`Re-attempting to verify user ${this.verificationInformation.id} with new enlistment year ${newEnlistmentYear}`)
                        return this.verifyServiceMember(1, newEnlistmentYear); // only calls this function once
                    } else {
                        return MilitaryVerificationStatusType.Pending;
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

                    return MilitaryVerificationStatusType.Pending;
                } else if (error.request) {
                    /**
                     * The request was made but no response was received
                     * `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                     *  http.ClientRequest in node.js.
                     */
                    const errorMessage = `No response received while calling the Quandis API, for ${this.verificationInformation.militaryAffiliation} request ${error.request}`;
                    console.log(errorMessage);

                    return MilitaryVerificationStatusType.Pending;
                } else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the ${this.verificationInformation.militaryAffiliation} request for the Quandis API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);

                    return MilitaryVerificationStatusType.Pending;
                }
            });
        } catch (err) {
            // for any error caught here, return a PENDING status, for a better customer experience
            const errorMessage = `Unexpected error while verifying ${this.verificationInformation.militaryAffiliation} military status through Quandis ${err}`;
            console.log(errorMessage);

            return MilitaryVerificationStatusType.Pending;
        }
    }

    /**
     * Function used to verify an individual's spouse's military service status.
     *
     * @return a {@link Promise} of {@link MilitaryVerificationStatusType} representing the
     * military verification status obtained from the client verification call
     */
    async verifyMemberSpouse(): Promise<MilitaryVerificationStatusType> {
        try {
            // retrieve the API Key and Base URL, needed in order to make the verification call through the client
            const [quandisBaseURL, quandisAPIKey] = await super.retrieveServiceCredentials(Constants.AWSPairConstants.QUANDIS_SECRET_NAME);

            // check to see if we obtained any invalid secret values from the call above
            if (quandisBaseURL === null || quandisBaseURL.length === 0 ||
                quandisAPIKey === null || quandisAPIKey.length === 0) {
                // for invalid secrets, return a Pending status, for a better customer experience
                console.log(`Invalid Secrets obtained for ${this.verificationInformation.militaryAffiliation} Quandis call!`);

                return MilitaryVerificationStatusType.Pending;
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
                ssn: this.verificationInformation.personalIdentifier!,
                birthDate: dob
            };
            console.log(`Calling Quandis API for ${this.verificationInformation.militaryAffiliation}, for ${requestData.firstName} ${requestData.lastName}`);
            return axios.post(`${quandisBaseURL}/mla/instant/${this.verificationInformation.id}`, requestData, {
                headers: {
                    "Content-Type": "application/json",
                    "X-ApiKey": quandisAPIKey
                },
                timeout: 10000, // in milliseconds here
                timeoutErrorMessage: `Quandis API for ${this.verificationInformation.militaryAffiliation} timed out after 10000ms!`
            }).then(async verificationResponse => {
                /**
                 * if we reached this, then we assume that a 2xx response code was returned.
                 * check the contents of the response, and act appropriately.
                 */
                if (verificationResponse.data && verificationResponse.data["covered"] === true) {
                    return MilitaryVerificationStatusType.Verified;
                } else {
                    return MilitaryVerificationStatusType.Pending;
                }
            }).catch(error => {
                if (error.response) {
                    /**
                     * The request was made and the server responded with a status code
                     * that falls out of the range of 2xx.
                     */
                    const errorMessage = `Non 2xxx response while calling the ${this.verificationInformation.militaryAffiliation} Quandis API, with status ${error.response.status}, and response ${JSON.stringify(error.response.data)}`;
                    console.log(errorMessage);

                    return MilitaryVerificationStatusType.Pending;
                } else if (error.request) {
                    /**
                     * The request was made but no response was received
                     * `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                     *  http.ClientRequest in node.js.
                     */
                    const errorMessage = `No response received while calling the Quandis API, for ${this.verificationInformation.militaryAffiliation} request ${error.request}`;
                    console.log(errorMessage);

                    return MilitaryVerificationStatusType.Pending;
                } else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the ${this.verificationInformation.militaryAffiliation} request for the Quandis API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);

                    return MilitaryVerificationStatusType.Pending;
                }
            });
        } catch (err) {
            // for any error caught here, return a Pending status, for a better customer experience
            const errorMessage = `Unexpected error while verifying ${this.verificationInformation.militaryAffiliation} military status through Quandis ${err}`;
            console.log(errorMessage);

            return MilitaryVerificationStatusType.Pending;
        }
    }
}

/**
 * Function used as a delay
 *
 * @param ms number of milliseconds to delay by
 *
 * @returns a {@link Promise}
 */
const delay = (ms: number): Promise<any> => {
    return new Promise( resolve => setTimeout(resolve, ms) );
}
