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
             * we imply that if the API does not respond in 2 seconds, that we automatically catch that, and return a Pending status
             * for a better customer experience.
             */
            const verificationResponse = await axios_1.default.post(lighthouseBaseURL, {
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
                timeout: 2000,
                timeoutErrorMessage: 'Lighthouse API timed out after 2000ms!'
            });
            // check the status of the response, and act appropriately
            if (verificationResponse.status === 200) {
                if (verificationResponse.data["veteran_status"] === "confirmed") {
                    return moonbeam_models_1.MilitaryVerificationStatusType.Verified;
                }
                else {
                    return moonbeam_models_1.MilitaryVerificationStatusType.Pending;
                }
            }
            // return a Pending status for status codes that are not 200, in case the error block doesn't catch it
            const errorMessage = `Unexpected error while calling the Lighthouse API, with status ${verificationResponse.status}, and response ${verificationResponse.data}`;
            console.log(errorMessage);
            return moonbeam_models_1.MilitaryVerificationStatusType.Pending;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkFDbGllbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL2NsaWVudHMvVkFDbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsK0RBQXFIO0FBQ3JILGtEQUEwQjtBQUMxQiwrREFBd0Q7QUFFeEQ7O0dBRUc7QUFDSCxNQUFhLFFBQVMsU0FBUSwrQkFBYTtJQUN2Qzs7O09BR0c7SUFDYyx1QkFBdUIsQ0FBa0M7SUFFMUU7Ozs7Ozs7T0FPRztJQUNILFlBQVksdUJBQXdELEVBQUUsV0FBbUIsRUFBRSxNQUFjO1FBQ3JHLEtBQUssQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFFM0IsSUFBSSxDQUFDLHVCQUF1QixHQUFHLHVCQUF1QixDQUFDO0lBQzNELENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILEtBQUssQ0FBQyxNQUFNO1FBQ1IsSUFBSTtZQUNBLHNHQUFzRztZQUN0RyxNQUFNLENBQUMsaUJBQWlCLEVBQUUsZ0JBQWdCLENBQUMsR0FBRyxNQUFNLEtBQUssQ0FBQywwQkFBMEIsQ0FBQywyQkFBUyxDQUFDLGdCQUFnQixDQUFDLHNCQUFzQixDQUFDLENBQUM7WUFFeEksNEVBQTRFO1lBQzVFLElBQUksaUJBQWlCLEtBQUssSUFBSSxJQUFJLGlCQUFpQixDQUFDLE1BQU0sS0FBSyxDQUFDO2dCQUM1RCxnQkFBZ0IsS0FBSyxJQUFJLElBQUksZ0JBQWdCLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDNUQsaUZBQWlGO2dCQUNqRixPQUFPLENBQUMsR0FBRyxDQUFDLG1EQUFtRCxDQUFDLENBQUM7Z0JBRWpFLE9BQU8sZ0RBQThCLENBQUMsT0FBTyxDQUFDO2FBQ2pEO1lBRUQsNkZBQTZGO1lBQzdGLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxXQUFXLENBQUM7WUFDbkQsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUV2RTs7Ozs7OztlQU9HO1lBQ0gsTUFBTSxvQkFBb0IsR0FBRyxNQUFNLGVBQUssQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUU7Z0JBQzdELFNBQVMsRUFBRSxJQUFJLENBQUMsdUJBQXVCLENBQUMsU0FBUztnQkFDakQsUUFBUSxFQUFFLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxRQUFRO2dCQUMvQyxTQUFTLEVBQUUsR0FBRztnQkFDZCxrQkFBa0IsRUFBRSxJQUFJLENBQUMsdUJBQXVCLENBQUMsV0FBVztnQkFDNUQsSUFBSSxFQUFFLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJO2dCQUN2QyxLQUFLLEVBQUUsSUFBSSxDQUFDLHVCQUF1QixDQUFDLEtBQUs7Z0JBQ3pDLE9BQU8sRUFBRSxJQUFJLENBQUMsdUJBQXVCLENBQUMsT0FBTztnQkFDN0MsT0FBTyxFQUFFLEtBQUs7YUFDakIsRUFBRTtnQkFDQyxPQUFPLEVBQUU7b0JBQ0wsY0FBYyxFQUFFLGtCQUFrQjtvQkFDbEMsUUFBUSxFQUFFLGdCQUFnQjtpQkFDN0I7Z0JBQ0QsT0FBTyxFQUFFLElBQUk7Z0JBQ2IsbUJBQW1CLEVBQUUsd0NBQXdDO2FBQ2hFLENBQUMsQ0FBQztZQUVILDBEQUEwRDtZQUMxRCxJQUFJLG9CQUFvQixDQUFDLE1BQU0sS0FBSyxHQUFHLEVBQUU7Z0JBQ3JDLElBQUksb0JBQW9CLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssV0FBVyxFQUFFO29CQUM3RCxPQUFPLGdEQUE4QixDQUFDLFFBQVEsQ0FBQztpQkFDbEQ7cUJBQU07b0JBQ0gsT0FBTyxnREFBOEIsQ0FBQyxPQUFPLENBQUM7aUJBQ2pEO2FBQ0o7WUFFRCxzR0FBc0c7WUFDdEcsTUFBTSxZQUFZLEdBQUcsa0VBQWtFLG9CQUFvQixDQUFDLE1BQU0sa0JBQWtCLG9CQUFvQixDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2hLLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7WUFFMUIsT0FBTyxnREFBOEIsQ0FBQyxPQUFPLENBQUM7U0FDakQ7UUFBQyxPQUFPLEdBQUcsRUFBRTtZQUNWLHVGQUF1RjtZQUN2RixNQUFNLFlBQVksR0FBRywyRUFBMkUsR0FBRyxFQUFFLENBQUM7WUFDdEcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUUxQixPQUFPLGdEQUE4QixDQUFDLE9BQU8sQ0FBQztTQUNqRDtJQUNMLENBQUM7Q0FDSjtBQTdGRCw0QkE2RkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NvbnN0YW50cywgTWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbiwgTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNUeXBlfSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuaW1wb3J0IGF4aW9zIGZyb20gXCJheGlvc1wiO1xuaW1wb3J0IHtCYXNlQVBJQ2xpZW50fSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuXG4vKipcbiAqIENsYXNzIHVzZWQgYXMgdGhlIGJhc2UvZ2VuZXJpYyBjbGllbnQgZm9yIGFsbCBWQSBMaWdodGhvdXNlIHZlcmlmaWNhdGlvbiBjYWxscy5cbiAqL1xuZXhwb3J0IGNsYXNzIFZBQ2xpZW50IGV4dGVuZHMgQmFzZUFQSUNsaWVudCB7XG4gICAgLyoqXG4gICAgICogVGhlIHZlcmlmaWNhdGlvbiBpbmZvcm1hdGlvbiBwcm92aWRlZCBieSB0aGUgY3VzdG9tZXIsIHdoaWNoIHRoZXkgd2lsbFxuICAgICAqIGdldCB2ZXJpZmllZCB1cG9uLlxuICAgICAqL1xuICAgIHByaXZhdGUgcmVhZG9ubHkgdmVyaWZpY2F0aW9uSW5mb3JtYXRpb246IE1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5mb3JtYXRpb247XG5cbiAgICAvKipcbiAgICAgKiBHZW5lcmljIGNvbnN0cnVjdG9yIGZvciB0aGUgdmVyaWZpY2F0aW9uIGNsaWVudC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB2ZXJpZmljYXRpb25JbmZvcm1hdGlvbiB2ZXJpZmljYXRpb24gaW5mb3JtYXRpb24gcHJvdmlkZWQgYnkgdGhlXG4gICAgICogY3VzdG9tZXIuXG4gICAgICogQHBhcmFtIHJlZ2lvbiB0aGUgQVdTIHJlZ2lvbiBwYXNzZWQgaW4gZnJvbSB0aGUgTGFtYmRhIHJlc29sdmVyLlxuICAgICAqIEBwYXJhbSBlbnZpcm9ubWVudCB0aGUgQVdTIGVudmlyb25tZW50IHBhc3NlZCBpbiBmcm9tIHRoZSBMYW1iZGEgcmVzb2x2ZXIuXG4gICAgICovXG4gICAgY29uc3RydWN0b3IodmVyaWZpY2F0aW9uSW5mb3JtYXRpb246IE1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5mb3JtYXRpb24sIGVudmlyb25tZW50OiBzdHJpbmcsIHJlZ2lvbjogc3RyaW5nKSB7XG4gICAgICAgIHN1cGVyKHJlZ2lvbiwgZW52aXJvbm1lbnQpO1xuXG4gICAgICAgIHRoaXMudmVyaWZpY2F0aW9uSW5mb3JtYXRpb24gPSB2ZXJpZmljYXRpb25JbmZvcm1hdGlvbjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB1c2VkIHRvIHZlcmlmeSBhbiBpbmRpdmlkdWFscyBtaWxpdGFyeSBzZXJ2aWNlIHN0YXR1cy5cbiAgICAgKlxuICAgICAqIEByZXR1cm4gYSB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZX0gcmVwcmVzZW50aW5nIHRoZVxuICAgICAqIG1pbGl0YXJ5IHZlcmlmaWNhdGlvbiBzdGF0dXMgb2J0YWluZWQgZnJvbSB0aGUgY2xpZW50IHZlcmlmaWNhdGlvbiBjYWxsXG4gICAgICovXG4gICAgYXN5bmMgdmVyaWZ5KCk6IFByb21pc2U8TWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNUeXBlPiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgQVBJIEtleSBhbmQgQmFzZSBVUkwsIG5lZWRlZCBpbiBvcmRlciB0byBtYWtlIHRoZSB2ZXJpZmljYXRpb24gY2FsbCB0aHJvdWdoIHRoZSBjbGllbnRcbiAgICAgICAgICAgIGNvbnN0IFtsaWdodGhvdXNlQmFzZVVSTCwgbGlnaHRob3VzZUFQSUtleV0gPSBhd2FpdCBzdXBlci5yZXRyaWV2ZVNlcnZpY2VDcmVkZW50aWFscyhDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5MSUdIVEhPVVNFX1NFQ1JFVF9OQU1FKTtcblxuICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHdlIG9idGFpbmVkIGFueSBpbnZhbGlkIHNlY3JldCB2YWx1ZXMgZnJvbSB0aGUgY2FsbCBhYm92ZVxuICAgICAgICAgICAgaWYgKGxpZ2h0aG91c2VCYXNlVVJMID09PSBudWxsIHx8IGxpZ2h0aG91c2VCYXNlVVJMLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIGxpZ2h0aG91c2VBUElLZXkgPT09IG51bGwgfHwgbGlnaHRob3VzZUFQSUtleS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAvLyBmb3IgaW52YWxpZCBzZWNyZXRzLCByZXR1cm4gYSBQZW5kaW5nIHN0YXR1cywgZm9yIGEgYmV0dGVyIGN1c3RvbWVyIGV4cGVyaWVuY2VcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnSW52YWxpZCBTZWNyZXRzIG9idGFpbmVkIGZvciBMaWdodGhvdXNlIEFQSSBjYWxsIScpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZS5QZW5kaW5nO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBjb252ZXJ0IHRoZSBkYXRlIG9mIGJpcnRoIGludG8gdGhlIGFwcHJvcHJpYXRlIGZvcm1hdCAoWVlZWS1NTS1ERCksIGFjY2VwdGVkIGJ5IExpZ2h0aG91c2VcbiAgICAgICAgICAgIGxldCBkb2IgPSB0aGlzLnZlcmlmaWNhdGlvbkluZm9ybWF0aW9uLmRhdGVPZkJpcnRoO1xuICAgICAgICAgICAgZG9iID0gYCR7ZG9iLnNwbGl0KCcvJylbMl19LSR7ZG9iLnNwbGl0KCcvJylbMF19LSR7ZG9iLnNwbGl0KCcvJylbMV19YDtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBQT1NUIC9zdGF0dXNcbiAgICAgICAgICAgICAqIEBsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLnZhLmdvdi9leHBsb3JlL3ZlcmlmaWNhdGlvbi9kb2NzL3ZldGVyYW5fY29uZmlybWF0aW9uP3ZlcnNpb249Y3VycmVudFxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIGJ1aWxkIHRoZSBMaWdodGhvdXNlIEFQSSByZXF1ZXN0IGJvZHkgdG8gYmUgcGFzc2VkIGluLCBhbmQgcGVyZm9ybSBhIFBPU1QgdG8gaXQgd2l0aCB0aGUgYXBwcm9wcmlhdGUgaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAqIHdlIGltcGx5IHRoYXQgaWYgdGhlIEFQSSBkb2VzIG5vdCByZXNwb25kIGluIDIgc2Vjb25kcywgdGhhdCB3ZSBhdXRvbWF0aWNhbGx5IGNhdGNoIHRoYXQsIGFuZCByZXR1cm4gYSBQZW5kaW5nIHN0YXR1c1xuICAgICAgICAgICAgICogZm9yIGEgYmV0dGVyIGN1c3RvbWVyIGV4cGVyaWVuY2UuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGNvbnN0IHZlcmlmaWNhdGlvblJlc3BvbnNlID0gYXdhaXQgYXhpb3MucG9zdChsaWdodGhvdXNlQmFzZVVSTCwge1xuICAgICAgICAgICAgICAgIGZpcnN0TmFtZTogdGhpcy52ZXJpZmljYXRpb25JbmZvcm1hdGlvbi5maXJzdE5hbWUsXG4gICAgICAgICAgICAgICAgbGFzdE5hbWU6IHRoaXMudmVyaWZpY2F0aW9uSW5mb3JtYXRpb24ubGFzdE5hbWUsXG4gICAgICAgICAgICAgICAgYmlydGhEYXRlOiBkb2IsXG4gICAgICAgICAgICAgICAgc3RyZWV0QWRkcmVzc0xpbmUxOiB0aGlzLnZlcmlmaWNhdGlvbkluZm9ybWF0aW9uLmFkZHJlc3NMaW5lLFxuICAgICAgICAgICAgICAgIGNpdHk6IHRoaXMudmVyaWZpY2F0aW9uSW5mb3JtYXRpb24uY2l0eSxcbiAgICAgICAgICAgICAgICBzdGF0ZTogdGhpcy52ZXJpZmljYXRpb25JbmZvcm1hdGlvbi5zdGF0ZSxcbiAgICAgICAgICAgICAgICB6aXBDb2RlOiB0aGlzLnZlcmlmaWNhdGlvbkluZm9ybWF0aW9uLnppcENvZGUsXG4gICAgICAgICAgICAgICAgY291bnRyeTogXCJVU0FcIlxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiYXBpS2V5XCI6IGxpZ2h0aG91c2VBUElLZXlcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDIwMDAsIC8vIGluIG1pbGxpc2Vjb25kcyBoZXJlXG4gICAgICAgICAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZTogJ0xpZ2h0aG91c2UgQVBJIHRpbWVkIG91dCBhZnRlciAyMDAwbXMhJ1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRoZSBzdGF0dXMgb2YgdGhlIHJlc3BvbnNlLCBhbmQgYWN0IGFwcHJvcHJpYXRlbHlcbiAgICAgICAgICAgIGlmICh2ZXJpZmljYXRpb25SZXNwb25zZS5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgICAgIGlmICh2ZXJpZmljYXRpb25SZXNwb25zZS5kYXRhW1widmV0ZXJhbl9zdGF0dXNcIl0gPT09IFwiY29uZmlybWVkXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZS5WZXJpZmllZDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNUeXBlLlBlbmRpbmc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyByZXR1cm4gYSBQZW5kaW5nIHN0YXR1cyBmb3Igc3RhdHVzIGNvZGVzIHRoYXQgYXJlIG5vdCAyMDAsIGluIGNhc2UgdGhlIGVycm9yIGJsb2NrIGRvZXNuJ3QgY2F0Y2ggaXRcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGNhbGxpbmcgdGhlIExpZ2h0aG91c2UgQVBJLCB3aXRoIHN0YXR1cyAke3ZlcmlmaWNhdGlvblJlc3BvbnNlLnN0YXR1c30sIGFuZCByZXNwb25zZSAke3ZlcmlmaWNhdGlvblJlc3BvbnNlLmRhdGF9YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgIHJldHVybiBNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1R5cGUuUGVuZGluZztcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAvLyBmb3IgYW55IGVycm9yIGNhdWdodCBoZXJlLCByZXR1cm4gYSBQZW5kaW5nIHN0YXR1cywgZm9yIGEgYmV0dGVyIGN1c3RvbWVyIGV4cGVyaWVuY2VcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHZlcmlmeWluZyBtaWxpdGFyeSBzdGF0dXMgdGhyb3VnaCBMaWdodGhvdXNlIEFQSSAke2Vycn1gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgcmV0dXJuIE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZS5QZW5kaW5nO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19