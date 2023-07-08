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
     * Function used to verify an individuals military service status.
     *
     * @return a {@link Promise} of {@link MilitaryVerificationStatusType} representing the
     * military verification status obtained from the client verification call
     */
    async verify() {
        try {
            // retrieve the API Key and Base URL, needed in order to make the verification call through the client
            const [lighthouseBaseURL, lighthouseAPIKey] = await super.retrieveServiceCredentials(moonbeam_models_1.Constants.AWSPairConstants.LIGHTHOUSE_SECRET_NAME);
            // check to see if we obtained any invalid secret values from the call above
            if (lighthouseBaseURL === null || lighthouseBaseURL.length === 0 ||
                lighthouseAPIKey === null || lighthouseAPIKey.length === 0) {
                // for invalid secrets, return a Pending status, for a better customer experience
                console.log('Invalid Secrets obtained for Lighthouse API call!');
                return moonbeam_models_1.MilitaryVerificationStatusType.Pending;
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
            return axios_1.default.post(lighthouseBaseURL, requestData, {
                headers: {
                    "Content-Type": "application/json",
                    "apiKey": lighthouseAPIKey
                },
                timeout: 10000,
                timeoutErrorMessage: 'Lighthouse API timed out after 2000ms!'
            }).then(verificationResponse => {
                console.log(`Lighthouse API response ${JSON.stringify(verificationResponse.data)}`);
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
                    const errorMessage = `Non 2xxx response while calling the Lighthouse API, with status ${error.response.status}, and response ${JSON.stringify(error.response.data)}`;
                    console.log(errorMessage);
                    return moonbeam_models_1.MilitaryVerificationStatusType.Pending;
                }
                else if (error.request) {
                    /**
                     * The request was made but no response was received
                     * `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                     *  http.ClientRequest in node.js.
                     */
                    const errorMessage = `No response received while calling the Lighthouse API, for request ${error.request}`;
                    console.log(errorMessage);
                    return moonbeam_models_1.MilitaryVerificationStatusType.Pending;
                }
                else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the Lighthouse API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);
                    return moonbeam_models_1.MilitaryVerificationStatusType.Pending;
                }
            });
        }
        catch (err) {
            // for any error caught here, return a Pending status, for a better customer experience
            const errorMessage = `Unexpected error while verifying military status through Lighthouse API ${err}`;
            console.log(errorMessage);
            return moonbeam_models_1.MilitaryVerificationStatusType.Pending;
        }
    }
}
exports.VAClient = VAClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkFDbGllbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL2NsaWVudHMvVkFDbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsK0RBQXFIO0FBQ3JILGtEQUEwQjtBQUMxQiwrREFBd0Q7QUFFeEQ7O0dBRUc7QUFDSCxNQUFhLFFBQVMsU0FBUSwrQkFBYTtJQUN2Qzs7O09BR0c7SUFDYyx1QkFBdUIsQ0FBa0M7SUFFMUU7Ozs7Ozs7T0FPRztJQUNILFlBQVksdUJBQXdELEVBQUUsV0FBbUIsRUFBRSxNQUFjO1FBQ3JHLEtBQUssQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFFM0IsSUFBSSxDQUFDLHVCQUF1QixHQUFHLHVCQUF1QixDQUFDO0lBQzNELENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILEtBQUssQ0FBQyxNQUFNO1FBQ1IsSUFBSTtZQUNBLHNHQUFzRztZQUN0RyxNQUFNLENBQUMsaUJBQWlCLEVBQUUsZ0JBQWdCLENBQUMsR0FBRyxNQUFNLEtBQUssQ0FBQywwQkFBMEIsQ0FBQywyQkFBUyxDQUFDLGdCQUFnQixDQUFDLHNCQUFzQixDQUFDLENBQUM7WUFFeEksNEVBQTRFO1lBQzVFLElBQUksaUJBQWlCLEtBQUssSUFBSSxJQUFJLGlCQUFpQixDQUFDLE1BQU0sS0FBSyxDQUFDO2dCQUM1RCxnQkFBZ0IsS0FBSyxJQUFJLElBQUksZ0JBQWdCLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDNUQsaUZBQWlGO2dCQUNqRixPQUFPLENBQUMsR0FBRyxDQUFDLG1EQUFtRCxDQUFDLENBQUM7Z0JBRWpFLE9BQU8sZ0RBQThCLENBQUMsT0FBTyxDQUFDO2FBQ2pEO1lBRUQsNkZBQTZGO1lBQzdGLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxXQUFXLENBQUM7WUFDbkQsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENB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LDJFQUEyRSxHQUFHLEVBQUUsQ0FBQztZQUN0RyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRTFCLE9BQU8sZ0RBQThCLENBQUMsT0FBTyxDQUFDO1NBQ2pEO0lBQ0wsQ0FBQztDQUNKO0FBdkhELDRCQXVIQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q29uc3RhbnRzLCBNaWxpdGFyeVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uLCBNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1R5cGV9IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5pbXBvcnQgYXhpb3MgZnJvbSBcImF4aW9zXCI7XG5pbXBvcnQge0Jhc2VBUElDbGllbnR9IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5cbi8qKlxuICogQ2xhc3MgdXNlZCBhcyB0aGUgYmFzZS9nZW5lcmljIGNsaWVudCBmb3IgYWxsIFZBIExpZ2h0aG91c2UgdmVyaWZpY2F0aW9uIGNhbGxzLlxuICovXG5leHBvcnQgY2xhc3MgVkFDbGllbnQgZXh0ZW5kcyBCYXNlQVBJQ2xpZW50IHtcbiAgICAvKipcbiAgICAgKiBUaGUgdmVyaWZpY2F0aW9uIGluZm9ybWF0aW9uIHByb3ZpZGVkIGJ5IHRoZSBjdXN0b21lciwgd2hpY2ggdGhleSB3aWxsXG4gICAgICogZ2V0IHZlcmlmaWVkIHVwb24uXG4gICAgICovXG4gICAgcHJpdmF0ZSByZWFkb25seSB2ZXJpZmljYXRpb25JbmZvcm1hdGlvbjogTWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbjtcblxuICAgIC8qKlxuICAgICAqIEdlbmVyaWMgY29uc3RydWN0b3IgZm9yIHRoZSB2ZXJpZmljYXRpb24gY2xpZW50LlxuICAgICAqXG4gICAgICogQHBhcmFtIHZlcmlmaWNhdGlvbkluZm9ybWF0aW9uIHZlcmlmaWNhdGlvbiBpbmZvcm1hdGlvbiBwcm92aWRlZCBieSB0aGVcbiAgICAgKiBjdXN0b21lci5cbiAgICAgKiBAcGFyYW0gcmVnaW9uIHRoZSBBV1MgcmVnaW9uIHBhc3NlZCBpbiBmcm9tIHRoZSBMYW1iZGEgcmVzb2x2ZXIuXG4gICAgICogQHBhcmFtIGVudmlyb25tZW50IHRoZSBBV1MgZW52aXJvbm1lbnQgcGFzc2VkIGluIGZyb20gdGhlIExhbWJkYSByZXNvbHZlci5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcih2ZXJpZmljYXRpb25JbmZvcm1hdGlvbjogTWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbiwgZW52aXJvbm1lbnQ6IHN0cmluZywgcmVnaW9uOiBzdHJpbmcpIHtcbiAgICAgICAgc3VwZXIocmVnaW9uLCBlbnZpcm9ubWVudCk7XG5cbiAgICAgICAgdGhpcy52ZXJpZmljYXRpb25JbmZvcm1hdGlvbiA9IHZlcmlmaWNhdGlvbkluZm9ybWF0aW9uO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHVzZWQgdG8gdmVyaWZ5IGFuIGluZGl2aWR1YWxzIG1pbGl0YXJ5IHNlcnZpY2Ugc3RhdHVzLlxuICAgICAqXG4gICAgICogQHJldHVybiBhIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNUeXBlfSByZXByZXNlbnRpbmcgdGhlXG4gICAgICogbWlsaXRhcnkgdmVyaWZpY2F0aW9uIHN0YXR1cyBvYnRhaW5lZCBmcm9tIHRoZSBjbGllbnQgdmVyaWZpY2F0aW9uIGNhbGxcbiAgICAgKi9cbiAgICBhc3luYyB2ZXJpZnkoKTogUHJvbWlzZTxNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1R5cGU+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBBUEkgS2V5IGFuZCBCYXNlIFVSTCwgbmVlZGVkIGluIG9yZGVyIHRvIG1ha2UgdGhlIHZlcmlmaWNhdGlvbiBjYWxsIHRocm91Z2ggdGhlIGNsaWVudFxuICAgICAgICAgICAgY29uc3QgW2xpZ2h0aG91c2VCYXNlVVJMLCBsaWdodGhvdXNlQVBJS2V5XSA9IGF3YWl0IHN1cGVyLnJldHJpZXZlU2VydmljZUNyZWRlbnRpYWxzKENvbnN0YW50cy5BV1NQYWlyQ29uc3RhbnRzLkxJR0hUSE9VU0VfU0VDUkVUX05BTUUpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgd2Ugb2J0YWluZWQgYW55IGludmFsaWQgc2VjcmV0IHZhbHVlcyBmcm9tIHRoZSBjYWxsIGFib3ZlXG4gICAgICAgICAgICBpZiAobGlnaHRob3VzZUJhc2VVUkwgPT09IG51bGwgfHwgbGlnaHRob3VzZUJhc2VVUkwubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgbGlnaHRob3VzZUFQSUtleSA9PT0gbnVsbCB8fCBsaWdodGhvdXNlQVBJS2V5Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIC8vIGZvciBpbnZhbGlkIHNlY3JldHMsIHJldHVybiBhIFBlbmRpbmcgc3RhdHVzLCBmb3IgYSBiZXR0ZXIgY3VzdG9tZXIgZXhwZXJpZW5jZVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdJbnZhbGlkIFNlY3JldHMgb2J0YWluZWQgZm9yIExpZ2h0aG91c2UgQVBJIGNhbGwhJyk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNUeXBlLlBlbmRpbmc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGNvbnZlcnQgdGhlIGRhdGUgb2YgYmlydGggaW50byB0aGUgYXBwcm9wcmlhdGUgZm9ybWF0IChZWVlZLU1NLUREKSwgYWNjZXB0ZWQgYnkgTGlnaHRob3VzZVxuICAgICAgICAgICAgbGV0IGRvYiA9IHRoaXMudmVyaWZpY2F0aW9uSW5mb3JtYXRpb24uZGF0ZU9mQmlydGg7XG4gICAgICAgICAgICBkb2IgPSBgJHtkb2Iuc3BsaXQoJy8nKVsyXX0tJHtkb2Iuc3BsaXQoJy8nKVswXX0tJHtkb2Iuc3BsaXQoJy8nKVsxXX1gO1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFBPU1QgL3N0YXR1c1xuICAgICAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIudmEuZ292L2V4cGxvcmUvdmVyaWZpY2F0aW9uL2RvY3MvdmV0ZXJhbl9jb25maXJtYXRpb24/dmVyc2lvbj1jdXJyZW50XG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogYnVpbGQgdGhlIExpZ2h0aG91c2UgQVBJIHJlcXVlc3QgYm9keSB0byBiZSBwYXNzZWQgaW4sIGFuZCBwZXJmb3JtIGEgUE9TVCB0byBpdCB3aXRoIHRoZSBhcHByb3ByaWF0ZSBpbmZvcm1hdGlvblxuICAgICAgICAgICAgICogd2UgaW1wbHkgdGhhdCBpZiB0aGUgQVBJIGRvZXMgbm90IHJlc3BvbmQgaW4gMTAgc2Vjb25kcywgdGhlbiB3ZSBhdXRvbWF0aWNhbGx5IGNhdGNoIHRoYXQsIGFuZCByZXR1cm4gYSBQZW5kaW5nIHN0YXR1c1xuICAgICAgICAgICAgICogZm9yIGEgYmV0dGVyIGN1c3RvbWVyIGV4cGVyaWVuY2UuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGNvbnN0IHJlcXVlc3REYXRhID0ge1xuICAgICAgICAgICAgICAgIGZpcnN0TmFtZTogdGhpcy52ZXJpZmljYXRpb25JbmZvcm1hdGlvbi5maXJzdE5hbWUsXG4gICAgICAgICAgICAgICAgbGFzdE5hbWU6IHRoaXMudmVyaWZpY2F0aW9uSW5mb3JtYXRpb24ubGFzdE5hbWUsXG4gICAgICAgICAgICAgICAgYmlydGhEYXRlOiBkb2IsXG4gICAgICAgICAgICAgICAgc3RyZWV0QWRkcmVzc0xpbmUxOiB0aGlzLnZlcmlmaWNhdGlvbkluZm9ybWF0aW9uLmFkZHJlc3NMaW5lLFxuICAgICAgICAgICAgICAgIGNpdHk6IHRoaXMudmVyaWZpY2F0aW9uSW5mb3JtYXRpb24uY2l0eSxcbiAgICAgICAgICAgICAgICBzdGF0ZTogdGhpcy52ZXJpZmljYXRpb25JbmZvcm1hdGlvbi5zdGF0ZSxcbiAgICAgICAgICAgICAgICB6aXBDb2RlOiB0aGlzLnZlcmlmaWNhdGlvbkluZm9ybWF0aW9uLnppcENvZGUsXG4gICAgICAgICAgICAgICAgY291bnRyeTogXCJVU0FcIlxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBMaWdodGhvdXNlIEFQSSByZXF1ZXN0IE9iamVjdDogJHtKU09OLnN0cmluZ2lmeShyZXF1ZXN0RGF0YSl9YCk7XG4gICAgICAgICAgICByZXR1cm4gYXhpb3MucG9zdChsaWdodGhvdXNlQmFzZVVSTCwgcmVxdWVzdERhdGEsIHtcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgICAgICBcImFwaUtleVwiOiBsaWdodGhvdXNlQVBJS2V5XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiAxMDAwMCwgLy8gaW4gbWlsbGlzZWNvbmRzIGhlcmVcbiAgICAgICAgICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlOiAnTGlnaHRob3VzZSBBUEkgdGltZWQgb3V0IGFmdGVyIDIwMDBtcyEnXG4gICAgICAgICAgICB9KS50aGVuKHZlcmlmaWNhdGlvblJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgTGlnaHRob3VzZSBBUEkgcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeSh2ZXJpZmljYXRpb25SZXNwb25zZS5kYXRhKX1gKTtcblxuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIGlmIHdlIHJlYWNoZWQgdGhpcywgdGhlbiB3ZSBhc3N1bWUgdGhhdCBhIDJ4eCByZXNwb25zZSBjb2RlIHdhcyByZXR1cm5lZC5cbiAgICAgICAgICAgICAgICAgKiBjaGVjayB0aGUgY29udGVudHMgb2YgdGhlIHJlc3BvbnNlLCBhbmQgYWN0IGFwcHJvcHJpYXRlbHkuXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgaWYgKHZlcmlmaWNhdGlvblJlc3BvbnNlLmRhdGEgJiYgdmVyaWZpY2F0aW9uUmVzcG9uc2UuZGF0YVtcInZldGVyYW5fc3RhdHVzXCJdID09PSBcImNvbmZpcm1lZFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1R5cGUuVmVyaWZpZWQ7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZS5QZW5kaW5nO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IucmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGFuZCB0aGUgc2VydmVyIHJlc3BvbmRlZCB3aXRoIGEgc3RhdHVzIGNvZGVcbiAgICAgICAgICAgICAgICAgICAgICogdGhhdCBmYWxscyBvdXQgb2YgdGhlIHJhbmdlIG9mIDJ4eC5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBOb24gMnh4eCByZXNwb25zZSB3aGlsZSBjYWxsaW5nIHRoZSBMaWdodGhvdXNlIEFQSSwgd2l0aCBzdGF0dXMgJHtlcnJvci5yZXNwb25zZS5zdGF0dXN9LCBhbmQgcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShlcnJvci5yZXNwb25zZS5kYXRhKX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1R5cGUuUGVuZGluZztcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVycm9yLnJlcXVlc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGJ1dCBubyByZXNwb25zZSB3YXMgcmVjZWl2ZWRcbiAgICAgICAgICAgICAgICAgICAgICogYGVycm9yLnJlcXVlc3RgIGlzIGFuIGluc3RhbmNlIG9mIFhNTEh0dHBSZXF1ZXN0IGluIHRoZSBicm93c2VyIGFuZCBhbiBpbnN0YW5jZSBvZlxuICAgICAgICAgICAgICAgICAgICAgKiAgaHR0cC5DbGllbnRSZXF1ZXN0IGluIG5vZGUuanMuXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm8gcmVzcG9uc2UgcmVjZWl2ZWQgd2hpbGUgY2FsbGluZyB0aGUgTGlnaHRob3VzZSBBUEksIGZvciByZXF1ZXN0ICR7ZXJyb3IucmVxdWVzdH1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1R5cGUuUGVuZGluZztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBTb21ldGhpbmcgaGFwcGVuZWQgaW4gc2V0dGluZyB1cCB0aGUgcmVxdWVzdCB0aGF0IHRyaWdnZXJlZCBhbiBFcnJvclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IGZvciB0aGUgTGlnaHRob3VzZSBBUEksICR7KGVycm9yICYmIGVycm9yLm1lc3NhZ2UpICYmIGVycm9yLm1lc3NhZ2V9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNUeXBlLlBlbmRpbmc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgLy8gZm9yIGFueSBlcnJvciBjYXVnaHQgaGVyZSwgcmV0dXJuIGEgUGVuZGluZyBzdGF0dXMsIGZvciBhIGJldHRlciBjdXN0b21lciBleHBlcmllbmNlXG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSB2ZXJpZnlpbmcgbWlsaXRhcnkgc3RhdHVzIHRocm91Z2ggTGlnaHRob3VzZSBBUEkgJHtlcnJ9YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgIHJldHVybiBNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1R5cGUuUGVuZGluZztcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==