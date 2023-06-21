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
    private readonly verificationInformation: MilitaryVerificationInformation;

    /**
     * Generic constructor for the verification client.
     *
     * @param verificationInformation verification information provided by the
     * customer.
     * @param region the AWS region passed in from the Lambda resolver.
     * @param environment the AWS environment passed in from the Lambda resolver.
     */
    constructor(verificationInformation: MilitaryVerificationInformation, environment: string, region: string) {
        super(region, environment);

        this.verificationInformation = verificationInformation;
    }

    /**
     * Function used to verify an individuals military service status.
     *
     * @return a {@link Promise} of {@link MilitaryVerificationStatusType} representing the
     * military verification status obtained from the client verification call
     */
    async verify(): Promise<MilitaryVerificationStatusType> {
        try {
            // retrieve the API Key and Base URL, needed in order to make the verification call through the client
            const [lighthouseBaseURL, lighthouseAPIKey] = await super.retrieveServiceCredentials(Constants.AWSPairConstants.LIGHTHOUSE_SECRET_NAME);

            // check to see if we obtained any invalid secret values from the call above
            if (lighthouseBaseURL === null || lighthouseBaseURL.length === 0 ||
                lighthouseAPIKey === null || lighthouseAPIKey.length === 0) {
                // for invalid secrets, return a Pending status, for a better customer experience
                console.log('Invalid Secrets obtained for Lighthouse API call!');

                return MilitaryVerificationStatusType.Pending;
            }

            // convert the date of birth into the appropriate format (YYYY-MM-DD), accepted by Lighthouse
            let dob = this.verificationInformation.dateOfBirth;
            dob = `${dob.split('/')[2]}-${dob.split('/')[0]}-${dob.split('/')[1]}`;

            /**
             * POST /status
             * @link https://developer.va.gov/explore/verification/docs/veteran_confirmation?version=current
             *
             * build the Lighthouse API request body to be passed in, and perform a POST to it with the appropriate information
             * we imply that if the API does not respond in 10 seconds, then we automatically catch that, and return a Pending status
             * for a better customer experience.
             */
            const requestData = {
                firstName: this.verificationInformation.firstName,
                lastName: this.verificationInformation.lastName,
                birthDate: dob,
                streetAddressLine1: this.verificationInformation.addressLine,
                city: this.verificationInformation.city,
                state: this.verificationInformation.state,
                zipCode: this.verificationInformation.zipCode,
                country: "USA"
            };
            console.log(`Lighthouse API request Object: ${JSON.stringify(requestData)}`);
            return axios.post(lighthouseBaseURL, requestData, {
                headers: {
                    "Content-Type": "application/json",
                    "apiKey": lighthouseAPIKey
                },
                timeout: 10000, // in milliseconds here
                timeoutErrorMessage: 'Lighthouse API timed out after 2000ms!'
            }).then(verificationResponse => {
                console.log(`Lighthouse API response ${JSON.stringify(verificationResponse.data)}`);

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
                    const errorMessage = `Non 2xxx response while calling the Lighthouse API, with status ${error.response.status}, and response ${JSON.stringify(error.response.data)}`;
                    console.log(errorMessage);

                    return MilitaryVerificationStatusType.Pending;
                } else if (error.request) {
                    /**
                     * The request was made but no response was received
                     * `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                     *  http.ClientRequest in node.js.
                     */
                    const errorMessage = `No response received while calling the Lighthouse API, for request ${error.request}`;
                    console.log(errorMessage);

                    return MilitaryVerificationStatusType.Pending;
                } else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the Lighthouse API, ${error.message}`;
                    console.log(errorMessage);

                    return MilitaryVerificationStatusType.Pending;
                }
            });
        } catch (err) {
            // for any error caught here, return a Pending status, for a better customer experience
            const errorMessage = `Unexpected error while verifying military status through Lighthouse API ${err}`;
            console.log(errorMessage);

            return MilitaryVerificationStatusType.Pending;
        }
    }
}
