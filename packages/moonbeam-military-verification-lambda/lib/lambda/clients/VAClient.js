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
                    const errorMessage = `Unexpected error while setting up the request for the Lighthouse API, ${error.message}`;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkFDbGllbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL2NsaWVudHMvVkFDbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsK0RBQXFIO0FBQ3JILGtEQUEwQjtBQUMxQiwrREFBd0Q7QUFFeEQ7O0dBRUc7QUFDSCxNQUFhLFFBQVMsU0FBUSwrQkFBYTtJQUN2Qzs7O09BR0c7SUFDYyx1QkFBdUIsQ0FBa0M7SUFFMUU7Ozs7Ozs7T0FPRztJQUNILFlBQVksdUJBQXdELEVBQUUsV0FBbUIsRUFBRSxNQUFjO1FBQ3JHLEtBQUssQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFFM0IsSUFBSSxDQUFDLHVCQUF1QixHQUFHLHVCQUF1QixDQUFDO0lBQzNELENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILEtBQUssQ0FBQyxNQUFNO1FBQ1IsSUFBSTtZQUNBLHNHQUFzRztZQUN0RyxNQUFNLENBQUMsaUJBQWlCLEVBQUUsZ0JBQWdCLENBQUMsR0FBRyxNQUFNLEtBQUssQ0FBQywwQkFBMEIsQ0FBQywyQkFBUyxDQUFDLGdCQUFnQixDQUFDLHNCQUFzQixDQUFDLENBQUM7WUFFeEksNEVBQTRFO1lBQzVFLElBQUksaUJBQWlCLEtBQUssSUFBSSxJQUFJLGlCQUFpQixDQUFDLE1BQU0sS0FBSyxDQUFDO2dCQUM1RCxnQkFBZ0IsS0FBSyxJQUFJLElBQUksZ0JBQWdCLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDNUQsaUZBQWlGO2dCQUNqRixPQUFPLENBQUMsR0FBRyxDQUFDLG1EQUFtRCxDQUFDLENBQUM7Z0JBRWpFLE9BQU8sZ0RBQThCLENBQUMsT0FBTyxDQUFDO2FBQ2pEO1lBRUQsNkZBQTZGO1lBQzdGLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxXQUFXLENBQUM7WUFDbkQsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENB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LCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NvbnN0YW50cywgTWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbiwgTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNUeXBlfSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuaW1wb3J0IGF4aW9zIGZyb20gXCJheGlvc1wiO1xuaW1wb3J0IHtCYXNlQVBJQ2xpZW50fSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuXG4vKipcbiAqIENsYXNzIHVzZWQgYXMgdGhlIGJhc2UvZ2VuZXJpYyBjbGllbnQgZm9yIGFsbCBWQSBMaWdodGhvdXNlIHZlcmlmaWNhdGlvbiBjYWxscy5cbiAqL1xuZXhwb3J0IGNsYXNzIFZBQ2xpZW50IGV4dGVuZHMgQmFzZUFQSUNsaWVudCB7XG4gICAgLyoqXG4gICAgICogVGhlIHZlcmlmaWNhdGlvbiBpbmZvcm1hdGlvbiBwcm92aWRlZCBieSB0aGUgY3VzdG9tZXIsIHdoaWNoIHRoZXkgd2lsbFxuICAgICAqIGdldCB2ZXJpZmllZCB1cG9uLlxuICAgICAqL1xuICAgIHByaXZhdGUgcmVhZG9ubHkgdmVyaWZpY2F0aW9uSW5mb3JtYXRpb246IE1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5mb3JtYXRpb247XG5cbiAgICAvKipcbiAgICAgKiBHZW5lcmljIGNvbnN0cnVjdG9yIGZvciB0aGUgdmVyaWZpY2F0aW9uIGNsaWVudC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB2ZXJpZmljYXRpb25JbmZvcm1hdGlvbiB2ZXJpZmljYXRpb24gaW5mb3JtYXRpb24gcHJvdmlkZWQgYnkgdGhlXG4gICAgICogY3VzdG9tZXIuXG4gICAgICogQHBhcmFtIHJlZ2lvbiB0aGUgQVdTIHJlZ2lvbiBwYXNzZWQgaW4gZnJvbSB0aGUgTGFtYmRhIHJlc29sdmVyLlxuICAgICAqIEBwYXJhbSBlbnZpcm9ubWVudCB0aGUgQVdTIGVudmlyb25tZW50IHBhc3NlZCBpbiBmcm9tIHRoZSBMYW1iZGEgcmVzb2x2ZXIuXG4gICAgICovXG4gICAgY29uc3RydWN0b3IodmVyaWZpY2F0aW9uSW5mb3JtYXRpb246IE1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5mb3JtYXRpb24sIGVudmlyb25tZW50OiBzdHJpbmcsIHJlZ2lvbjogc3RyaW5nKSB7XG4gICAgICAgIHN1cGVyKHJlZ2lvbiwgZW52aXJvbm1lbnQpO1xuXG4gICAgICAgIHRoaXMudmVyaWZpY2F0aW9uSW5mb3JtYXRpb24gPSB2ZXJpZmljYXRpb25JbmZvcm1hdGlvbjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB1c2VkIHRvIHZlcmlmeSBhbiBpbmRpdmlkdWFscyBtaWxpdGFyeSBzZXJ2aWNlIHN0YXR1cy5cbiAgICAgKlxuICAgICAqIEByZXR1cm4gYSB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZX0gcmVwcmVzZW50aW5nIHRoZVxuICAgICAqIG1pbGl0YXJ5IHZlcmlmaWNhdGlvbiBzdGF0dXMgb2J0YWluZWQgZnJvbSB0aGUgY2xpZW50IHZlcmlmaWNhdGlvbiBjYWxsXG4gICAgICovXG4gICAgYXN5bmMgdmVyaWZ5KCk6IFByb21pc2U8TWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNUeXBlPiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgQVBJIEtleSBhbmQgQmFzZSBVUkwsIG5lZWRlZCBpbiBvcmRlciB0byBtYWtlIHRoZSB2ZXJpZmljYXRpb24gY2FsbCB0aHJvdWdoIHRoZSBjbGllbnRcbiAgICAgICAgICAgIGNvbnN0IFtsaWdodGhvdXNlQmFzZVVSTCwgbGlnaHRob3VzZUFQSUtleV0gPSBhd2FpdCBzdXBlci5yZXRyaWV2ZVNlcnZpY2VDcmVkZW50aWFscyhDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5MSUdIVEhPVVNFX1NFQ1JFVF9OQU1FKTtcblxuICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHdlIG9idGFpbmVkIGFueSBpbnZhbGlkIHNlY3JldCB2YWx1ZXMgZnJvbSB0aGUgY2FsbCBhYm92ZVxuICAgICAgICAgICAgaWYgKGxpZ2h0aG91c2VCYXNlVVJMID09PSBudWxsIHx8IGxpZ2h0aG91c2VCYXNlVVJMLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIGxpZ2h0aG91c2VBUElLZXkgPT09IG51bGwgfHwgbGlnaHRob3VzZUFQSUtleS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAvLyBmb3IgaW52YWxpZCBzZWNyZXRzLCByZXR1cm4gYSBQZW5kaW5nIHN0YXR1cywgZm9yIGEgYmV0dGVyIGN1c3RvbWVyIGV4cGVyaWVuY2VcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnSW52YWxpZCBTZWNyZXRzIG9idGFpbmVkIGZvciBMaWdodGhvdXNlIEFQSSBjYWxsIScpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZS5QZW5kaW5nO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBjb252ZXJ0IHRoZSBkYXRlIG9mIGJpcnRoIGludG8gdGhlIGFwcHJvcHJpYXRlIGZvcm1hdCAoWVlZWS1NTS1ERCksIGFjY2VwdGVkIGJ5IExpZ2h0aG91c2VcbiAgICAgICAgICAgIGxldCBkb2IgPSB0aGlzLnZlcmlmaWNhdGlvbkluZm9ybWF0aW9uLmRhdGVPZkJpcnRoO1xuICAgICAgICAgICAgZG9iID0gYCR7ZG9iLnNwbGl0KCcvJylbMl19LSR7ZG9iLnNwbGl0KCcvJylbMF19LSR7ZG9iLnNwbGl0KCcvJylbMV19YDtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBQT1NUIC9zdGF0dXNcbiAgICAgICAgICAgICAqIEBsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLnZhLmdvdi9leHBsb3JlL3ZlcmlmaWNhdGlvbi9kb2NzL3ZldGVyYW5fY29uZmlybWF0aW9uP3ZlcnNpb249Y3VycmVudFxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIGJ1aWxkIHRoZSBMaWdodGhvdXNlIEFQSSByZXF1ZXN0IGJvZHkgdG8gYmUgcGFzc2VkIGluLCBhbmQgcGVyZm9ybSBhIFBPU1QgdG8gaXQgd2l0aCB0aGUgYXBwcm9wcmlhdGUgaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAqIHdlIGltcGx5IHRoYXQgaWYgdGhlIEFQSSBkb2VzIG5vdCByZXNwb25kIGluIDEwIHNlY29uZHMsIHRoZW4gd2UgYXV0b21hdGljYWxseSBjYXRjaCB0aGF0LCBhbmQgcmV0dXJuIGEgUGVuZGluZyBzdGF0dXNcbiAgICAgICAgICAgICAqIGZvciBhIGJldHRlciBjdXN0b21lciBleHBlcmllbmNlLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBjb25zdCByZXF1ZXN0RGF0YSA9IHtcbiAgICAgICAgICAgICAgICBmaXJzdE5hbWU6IHRoaXMudmVyaWZpY2F0aW9uSW5mb3JtYXRpb24uZmlyc3ROYW1lLFxuICAgICAgICAgICAgICAgIGxhc3ROYW1lOiB0aGlzLnZlcmlmaWNhdGlvbkluZm9ybWF0aW9uLmxhc3ROYW1lLFxuICAgICAgICAgICAgICAgIGJpcnRoRGF0ZTogZG9iLFxuICAgICAgICAgICAgICAgIHN0cmVldEFkZHJlc3NMaW5lMTogdGhpcy52ZXJpZmljYXRpb25JbmZvcm1hdGlvbi5hZGRyZXNzTGluZSxcbiAgICAgICAgICAgICAgICBjaXR5OiB0aGlzLnZlcmlmaWNhdGlvbkluZm9ybWF0aW9uLmNpdHksXG4gICAgICAgICAgICAgICAgc3RhdGU6IHRoaXMudmVyaWZpY2F0aW9uSW5mb3JtYXRpb24uc3RhdGUsXG4gICAgICAgICAgICAgICAgemlwQ29kZTogdGhpcy52ZXJpZmljYXRpb25JbmZvcm1hdGlvbi56aXBDb2RlLFxuICAgICAgICAgICAgICAgIGNvdW50cnk6IFwiVVNBXCJcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgTGlnaHRob3VzZSBBUEkgcmVxdWVzdCBPYmplY3Q6ICR7SlNPTi5zdHJpbmdpZnkocmVxdWVzdERhdGEpfWApO1xuICAgICAgICAgICAgcmV0dXJuIGF4aW9zLnBvc3QobGlnaHRob3VzZUJhc2VVUkwsIHJlcXVlc3REYXRhLCB7XG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAgICAgXCJhcGlLZXlcIjogbGlnaHRob3VzZUFQSUtleVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGltZW91dDogMTAwMDAsIC8vIGluIG1pbGxpc2Vjb25kcyBoZXJlXG4gICAgICAgICAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZTogJ0xpZ2h0aG91c2UgQVBJIHRpbWVkIG91dCBhZnRlciAyMDAwbXMhJ1xuICAgICAgICAgICAgfSkudGhlbih2ZXJpZmljYXRpb25SZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogaWYgd2UgcmVhY2hlZCB0aGlzLCB0aGVuIHdlIGFzc3VtZSB0aGF0IGEgMnh4IHJlc3BvbnNlIGNvZGUgd2FzIHJldHVybmVkLlxuICAgICAgICAgICAgICAgICAqIGNoZWNrIHRoZSBjb250ZW50cyBvZiB0aGUgcmVzcG9uc2UsIGFuZCBhY3QgYXBwcm9wcmlhdGVseS5cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBpZiAodmVyaWZpY2F0aW9uUmVzcG9uc2UuZGF0YSAmJiB2ZXJpZmljYXRpb25SZXNwb25zZS5kYXRhW1widmV0ZXJhbl9zdGF0dXNcIl0gPT09IFwiY29uZmlybWVkXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZS5WZXJpZmllZDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNUeXBlLlBlbmRpbmc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvci5yZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYW5kIHRoZSBzZXJ2ZXIgcmVzcG9uZGVkIHdpdGggYSBzdGF0dXMgY29kZVxuICAgICAgICAgICAgICAgICAgICAgKiB0aGF0IGZhbGxzIG91dCBvZiB0aGUgcmFuZ2Ugb2YgMnh4LlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vbiAyeHh4IHJlc3BvbnNlIHdoaWxlIGNhbGxpbmcgdGhlIExpZ2h0aG91c2UgQVBJLCB3aXRoIHN0YXR1cyAke2Vycm9yLnJlc3BvbnNlLnN0YXR1c30sIGFuZCByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGVycm9yLnJlc3BvbnNlLmRhdGEpfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZS5QZW5kaW5nO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3IucmVxdWVzdCkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYnV0IG5vIHJlc3BvbnNlIHdhcyByZWNlaXZlZFxuICAgICAgICAgICAgICAgICAgICAgKiBgZXJyb3IucmVxdWVzdGAgaXMgYW4gaW5zdGFuY2Ugb2YgWE1MSHR0cFJlcXVlc3QgaW4gdGhlIGJyb3dzZXIgYW5kIGFuIGluc3RhbmNlIG9mXG4gICAgICAgICAgICAgICAgICAgICAqICBodHRwLkNsaWVudFJlcXVlc3QgaW4gbm9kZS5qcy5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBObyByZXNwb25zZSByZWNlaXZlZCB3aGlsZSBjYWxsaW5nIHRoZSBMaWdodGhvdXNlIEFQSSwgZm9yIHJlcXVlc3QgJHtlcnJvci5yZXF1ZXN0fWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZS5QZW5kaW5nO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNvbWV0aGluZyBoYXBwZW5lZCBpbiBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IHRoYXQgdHJpZ2dlcmVkIGFuIEVycm9yXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgZm9yIHRoZSBMaWdodGhvdXNlIEFQSSwgJHtlcnJvci5tZXNzYWdlfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZS5QZW5kaW5nO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIC8vIGZvciBhbnkgZXJyb3IgY2F1Z2h0IGhlcmUsIHJldHVybiBhIFBlbmRpbmcgc3RhdHVzLCBmb3IgYSBiZXR0ZXIgY3VzdG9tZXIgZXhwZXJpZW5jZVxuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgdmVyaWZ5aW5nIG1pbGl0YXJ5IHN0YXR1cyB0aHJvdWdoIExpZ2h0aG91c2UgQVBJICR7ZXJyfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICByZXR1cm4gTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNUeXBlLlBlbmRpbmc7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=