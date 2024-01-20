import {Constants, MilitaryVerificationInformation, MilitaryVerificationStatusType} from "@moonbeam/moonbeam-models";
import axios from "axios";
import {BaseAPIClient} from "@moonbeam/moonbeam-models";

/**
 * Class used as the base/generic client for all VA Lighthouse verification calls.
 */
export class VAClient extends BaseAPIClient {
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
    // @ts-ignore
    async verifyServiceMember(numberOfCalls?: number, newEnlistmentYear?: number): Promise<MilitaryVerificationStatusType> {
        try {
            // retrieve the API Key and Base URL, needed in order to make the verification call through the client
            const [lighthouseBaseURL, lighthouseAPIKey] = await super.retrieveServiceCredentials(Constants.AWSPairConstants.LIGHTHOUSE_SECRET_NAME);

            // check to see if we obtained any invalid secret values from the call above
            if (lighthouseBaseURL === null || lighthouseBaseURL.length === 0 ||
                lighthouseAPIKey === null || lighthouseAPIKey.length === 0) {
                // for invalid secrets, return a Pending status, for a better customer experience
                console.log(`Invalid Secrets obtained for ${this.verificationInformation.militaryAffiliation} Lighthouse API call!`);

                return MilitaryVerificationStatusType.Pending;
            }

            // convert the date of birth into the appropriate format (YYYY-MM-DD), accepted by Lighthouse
            let dob = this.verificationInformation.dateOfBirth;
            dob = `${dob.split('/')[2]}-${dob.split('/')[0]}-${dob.split('/')[1]}`;

            // if the user lists more than 1 name for their first name, and it's separated by a space, then replace the spaces with "-"
            let firstNameFormatted = this.verificationInformation.firstName.includes(' ')
                ? this.verificationInformation.firstName.replace(' ', '-')
                : this.verificationInformation.firstName;

            // if the user lists more than 1 name for their last name, and it's separated by a space, then replace the spaces with "-"
            let lastNameFormatted = this.verificationInformation.lastName.includes(' ')
                ? this.verificationInformation.lastName.replace(' ', '-')
                : this.verificationInformation.lastName;

            /**
             * POST /status
             * @link https://developer.va.gov/explore/verification/docs/veteran_confirmation?version=current
             *
             * build the Lighthouse API request body to be passed in, and perform a POST to it with the appropriate information
             * we imply that if the API does not respond in 10 seconds, then we automatically catch that, and return a Pending status
             * for a better customer experience.
             */
            const requestData = {
                firstName: firstNameFormatted.trimStart().trimEnd().trim(),
                lastName: lastNameFormatted.trimStart().trimEnd().trim(),
                birthDate: dob.trimStart().trimEnd().trim(),
                streetAddressLine1: this.verificationInformation.addressLine.trimStart().trimEnd().trim(),
                city: this.verificationInformation.city.trimStart().trimEnd().trim(),
                state: this.verificationInformation.state.trimStart().trimEnd().trim(),
                zipCode: this.verificationInformation.zipCode.trimStart().trimEnd().trim(),
                country: "USA"
            };
            console.log(`Calling Lighthouse API for ${this.verificationInformation.militaryAffiliation}, for ${requestData.firstName} ${requestData.lastName}`);
            return axios.post(lighthouseBaseURL, requestData, {
                headers: {
                    "Content-Type": "application/json",
                    "apiKey": lighthouseAPIKey
                },
                timeout: 10000, // in milliseconds here
                timeoutErrorMessage: `Lighthouse API for ${this.verificationInformation.militaryAffiliation} timed out after 10000ms!`
            }).then(verificationResponse => {
                /**
                 * if we reached this, then we assume that a 2xx response code was returned.
                 * check the contents of the response, and act appropriately.
                 */
                if (verificationResponse.data && verificationResponse.data["veteran_status"] === "confirmed") {
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
                    const errorMessage = `Non 2xxx response while calling the ${this.verificationInformation.militaryAffiliation} Lighthouse API, with status ${error.response.status}, and response ${JSON.stringify(error.response.data)}`;
                    console.log(errorMessage);

                    return MilitaryVerificationStatusType.Pending;
                } else if (error.request) {
                    /**
                     * The request was made but no response was received
                     * `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                     *  http.ClientRequest in node.js.
                     */
                    const errorMessage = `No response received while calling the Lighthouse API, for ${this.verificationInformation.militaryAffiliation} request ${error.request}`;
                    console.log(errorMessage);

                    return MilitaryVerificationStatusType.Pending;
                } else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the ${this.verificationInformation.militaryAffiliation} request for the Lighthouse API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);

                    return MilitaryVerificationStatusType.Pending;
                }
            });
        } catch (err) {
            // for any error caught here, return a Pending status, for a better customer experience
            const errorMessage = `Unexpected error while verifying ${this.verificationInformation.militaryAffiliation} military status through the Lighthouse API ${err}`;
            console.log(errorMessage);

            return MilitaryVerificationStatusType.Pending;
        }
    }
}
