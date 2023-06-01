import {Constants, MilitaryVerificationInformation, MilitaryVerificationStatusType} from "@moonbeam/moonbeam-models";
import {VerificationClient} from "./VerificationClient";
import axios from "axios";

/**
 * Class used as the base/generic client for all VA Lighthouse verification calls.
 */
export class VAClient extends VerificationClient {
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
             * build the Lighthouse API request body to be passed in, and perform a POST to it with the appropriate information
             * we imply that if the API does not respond in 2 seconds, that we automatically catch that, and return a Pending status
             * for a better customer experience.
             */
            const verificationResponse = await axios.post(lighthouseBaseURL, {
                firstName: this.verificationInformation.firstName,
                lastName: this.verificationInformation.lastName,
                birthDate: dob,
                streetAddressLine1: this.verificationInformation.addressLine,
                city: this.verificationInformation.city,
                state: this.verificationInformation.state,
                zipCode: this.verificationInformation.zipCode,
                country: "USA"
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "apiKey": lighthouseAPIKey
                },
                timeout: 2000, // in milliseconds here
                timeoutErrorMessage: 'Lighthouse API timed out after 2000ms!'
            });

            // check the status of the response, and act appropriately
            if (verificationResponse.status === 200) {
                if (verificationResponse.data["veteran_status"] === "confirmed") {
                    return MilitaryVerificationStatusType.Verified;
                } else {
                    return MilitaryVerificationStatusType.Pending;
                }
            }

            // return a Pending status for status codes that are not 200
            const errorMessage = `Unexpected error while calling the Lighthouse API, with status ${verificationResponse.status}, and response ${verificationResponse.data}`;
            console.log(errorMessage);

            return MilitaryVerificationStatusType.Pending;
        } catch (err) {
            // for any error caught here, return a Pending status, for a better customer experience
            const errorMessage = `Unexpected error while verifying military status through Lighthouse API ${err}`;
            console.log(errorMessage);

            return MilitaryVerificationStatusType.Pending;
        }
    }
}
