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
     * Function used to verify an individuals military service status.
     *
     * @return a {@link Promise} of {@link MilitaryVerificationStatusType} representing the
     * military verification status obtained from the client verification call
     */
    async verify() {
        try {
            // retrieve the API Key and Base URL, needed in order to make the verification call through the client
            const [quandisBaseURL, quandisAPIKey] = await super.retrieveServiceCredentials(moonbeam_models_1.Constants.AWSPairConstants.QUANDIS_SECRET_NAME);
            // check to see if we obtained any invalid secret values from the call above
            if (quandisBaseURL === null || quandisBaseURL.length === 0 ||
                quandisAPIKey === null || quandisAPIKey.length === 0) {
                // for invalid secrets, return a Pending status, for a better customer experience
                console.log('Invalid Secrets obtained for Quandis call!');
                return moonbeam_models_1.MilitaryVerificationStatusType.Pending;
            }
            // convert the date of birth into the appropriate format (YYYY-MM-DD), accepted by Quandis
            let dob = this.verificationInformation.dateOfBirth;
            dob = `${dob.split('/')[2]}-${dob.split('/')[0]}-${dob.split('/')[1]}`;
            // convert the date of interest from the enlistment year into the appropriate format (YYYY-12-31), accepted by Quandis
            let dateOfInterest = `${this.verificationInformation.enlistmentYear}-12-31`;
            /**
             * POST /api/military/scra/instant/{clientID}
             * @link https://uatservices.quandis.io/api/military/documentation/index.html
             *
             * build the Quandis API request body to be passed in, and perform a POST to it with the appropriate information
             * Note that the client_id, appended to the base URL, is the uuid for the user, which will be used for tracking purposes in case of any issues
             * we imply that if the API does not respond in 4 seconds, that we automatically catch that, and return a Pending status
             * for a better customer experience.
             */
            const verificationResponse = await axios_1.default.post(`${quandisBaseURL}/${this.verificationInformation.id}`, {
                certificate: false,
                firstName: this.verificationInformation.firstName,
                lastName: this.verificationInformation.lastName,
                birthDate: dob,
                dateOfInterest: dateOfInterest
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "X-ApiKey": quandisAPIKey
                },
                timeout: 4000,
                timeoutErrorMessage: 'Quandis API timed out after 4000ms!'
            });
            // check the status of the response, and act appropriately
            if (verificationResponse.status === 200) {
                if (verificationResponse.data["covered"] === true) {
                    return moonbeam_models_1.MilitaryVerificationStatusType.Verified;
                }
                else {
                    return moonbeam_models_1.MilitaryVerificationStatusType.Pending;
                }
            }
            // return a Pending status for status codes that are not 200, in case the error block doesn't catch it
            const errorMessage = `Unexpected error while calling the Quandis API, with status ${verificationResponse.status}, and response ${verificationResponse.data}`;
            console.log(errorMessage);
            return moonbeam_models_1.MilitaryVerificationStatusType.Pending;
        }
        catch (err) {
            // for any error caught here, return a Pending status, for a better customer experience
            const errorMessage = `Unexpected error while verifying military status through Quandis ${err}`;
            console.log(errorMessage);
            return moonbeam_models_1.MilitaryVerificationStatusType.Pending;
        }
    }
}
exports.QuandisClient = QuandisClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUXVhbmRpc0NsaWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvY2xpZW50cy9RdWFuZGlzQ2xpZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLCtEQUttQztBQUNuQyxrREFBMEI7QUFFMUI7O0dBRUc7QUFDSCxNQUFhLGFBQWMsU0FBUSwrQkFBYTtJQUM1Qzs7O09BR0c7SUFDYyx1QkFBdUIsQ0FBa0M7SUFFMUU7Ozs7Ozs7T0FPRztJQUNILFlBQVksdUJBQXdELEVBQUUsV0FBbUIsRUFBRSxNQUFjO1FBQ3JHLEtBQUssQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFFM0IsSUFBSSxDQUFDLHVCQUF1QixHQUFHLHVCQUF1QixDQUFDO0lBQzNELENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILEtBQUssQ0FBQyxNQUFNO1FBQ1IsSUFBSTtZQUNBLHNHQUFzRztZQUN0RyxNQUFNLENBQUMsY0FBYyxFQUFFLGFBQWEsQ0FBQyxHQUFHLE1BQU0sS0FBSyxDQUFDLDBCQUEwQixDQUFDLDJCQUFTLENBQUMsZ0JBQWdCLENBQUMsbUJBQW1CLENBQUMsQ0FBQztZQUUvSCw0RUFBNEU7WUFDNUUsSUFBSSxjQUFjLEtBQUssSUFBSSxJQUFJLGNBQWMsQ0FBQyxNQUFNLEtBQUssQ0FBQztnQkFDdEQsYUFBYSxLQUFLLElBQUksSUFBSSxhQUFhLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDdEQsaUZBQWlGO2dCQUNqRixPQUFPLENBQUMsR0FBRyxDQUFDLDRDQUE0QyxDQUFDLENBQUM7Z0JBRTFELE9BQU8sZ0RBQThCLENBQUMsT0FBTyxDQUFDO2FBQ2pEO1lBRUQsMEZBQTBGO1lBQzFGLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxXQUFXLENBQUM7WUFDbkQsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUV2RSxzSEFBc0g7WUFDdEgsSUFBSSxjQUFjLEdBQUcsR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUMsY0FBYyxRQUFRLENBQUM7WUFFNUU7Ozs7Ozs7O2VBUUc7WUFDSCxNQUFNLG9CQUFvQixHQUFHLE1BQU0sZUFBSyxDQUFDLElBQUksQ0FBQyxHQUFHLGNBQWMsSUFBSSxJQUFJLENBQUMsdUJBQXVCLENBQUMsRUFBRSxFQUFFLEVBQUU7Z0JBQ2xHLFdBQVcsRUFBRSxLQUFLO2dCQUNsQixTQUFTLEVBQUUsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFNBQVM7Z0JBQ2pELFFBQVEsRUFBRSxJQUFJLENBQUMsdUJBQXVCLENBQUMsUUFBUTtnQkFDL0MsU0FBUyxFQUFFLEdBQUc7Z0JBQ2QsY0FBYyxFQUFFLGNBQWM7YUFDakMsRUFBRTtnQkFDQyxPQUFPLEVBQUU7b0JBQ0wsY0FBYyxFQUFFLGtCQUFrQjtvQkFDbEMsVUFBVSxFQUFFLGFBQWE7aUJBQzVCO2dCQUNELE9BQU8sRUFBRSxJQUFJO2dCQUNiLG1CQUFtQixFQUFFLHFDQUFxQzthQUM3RCxDQUFDLENBQUM7WUFFSCwwREFBMEQ7WUFDMUQsSUFBSSxvQkFBb0IsQ0FBQyxNQUFNLEtBQUssR0FBRyxFQUFFO2dCQUNyQyxJQUFJLG9CQUFvQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxJQUFJLEVBQUU7b0JBQy9DLE9BQU8sZ0RBQThCLENBQUMsUUFBUSxDQUFDO2lCQUNsRDtxQkFBTTtvQkFDSCxPQUFPLGdEQUE4QixDQUFDLE9BQU8sQ0FBQztpQkFDakQ7YUFDSjtZQUVELHNHQUFzRztZQUN0RyxNQUFNLFlBQVksR0FBRywrREFBK0Qsb0JBQW9CLENBQUMsTUFBTSxrQkFBa0Isb0JBQW9CLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDN0osT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUUxQixPQUFPLGdEQUE4QixDQUFDLE9BQU8sQ0FBQztTQUNqRDtRQUFDLE9BQU8sR0FBRyxFQUFFO1lBQ1YsdUZBQXVGO1lBQ3ZGLE1BQU0sWUFBWSxHQUFHLG9FQUFvRSxHQUFHLEVBQUUsQ0FBQztZQUMvRixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRTFCLE9BQU8sZ0RBQThCLENBQUMsT0FBTyxDQUFDO1NBQ2pEO0lBQ0wsQ0FBQztDQUNKO0FBOUZELHNDQThGQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gICAgQmFzZUFQSUNsaWVudCxcbiAgICBDb25zdGFudHMsXG4gICAgTWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbixcbiAgICBNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1R5cGVcbn0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcbmltcG9ydCBheGlvcyBmcm9tIFwiYXhpb3NcIjtcblxuLyoqXG4gKiBDbGFzcyB1c2VkIGFzIHRoZSBiYXNlL2dlbmVyaWMgY2xpZW50IGZvciBhbGwgUXVhbmRpcyB2ZXJpZmljYXRpb24gY2FsbHMuXG4gKi9cbmV4cG9ydCBjbGFzcyBRdWFuZGlzQ2xpZW50IGV4dGVuZHMgQmFzZUFQSUNsaWVudCB7XG4gICAgLyoqXG4gICAgICogVGhlIHZlcmlmaWNhdGlvbiBpbmZvcm1hdGlvbiBwcm92aWRlZCBieSB0aGUgY3VzdG9tZXIsIHdoaWNoIHRoZXkgd2lsbFxuICAgICAqIGdldCB2ZXJpZmllZCB1cG9uLlxuICAgICAqL1xuICAgIHByaXZhdGUgcmVhZG9ubHkgdmVyaWZpY2F0aW9uSW5mb3JtYXRpb246IE1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5mb3JtYXRpb247XG5cbiAgICAvKipcbiAgICAgKiBHZW5lcmljIGNvbnN0cnVjdG9yIGZvciB0aGUgdmVyaWZpY2F0aW9uIGNsaWVudC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB2ZXJpZmljYXRpb25JbmZvcm1hdGlvbiB2ZXJpZmljYXRpb24gaW5mb3JtYXRpb24gcHJvdmlkZWQgYnkgdGhlXG4gICAgICogY3VzdG9tZXIuXG4gICAgICogQHBhcmFtIHJlZ2lvbiB0aGUgQVdTIHJlZ2lvbiBwYXNzZWQgaW4gZnJvbSB0aGUgTGFtYmRhIHJlc29sdmVyLlxuICAgICAqIEBwYXJhbSBlbnZpcm9ubWVudCB0aGUgQVdTIGVudmlyb25tZW50IHBhc3NlZCBpbiBmcm9tIHRoZSBMYW1iZGEgcmVzb2x2ZXIuXG4gICAgICovXG4gICAgY29uc3RydWN0b3IodmVyaWZpY2F0aW9uSW5mb3JtYXRpb246IE1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5mb3JtYXRpb24sIGVudmlyb25tZW50OiBzdHJpbmcsIHJlZ2lvbjogc3RyaW5nKSB7XG4gICAgICAgIHN1cGVyKHJlZ2lvbiwgZW52aXJvbm1lbnQpO1xuXG4gICAgICAgIHRoaXMudmVyaWZpY2F0aW9uSW5mb3JtYXRpb24gPSB2ZXJpZmljYXRpb25JbmZvcm1hdGlvbjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB1c2VkIHRvIHZlcmlmeSBhbiBpbmRpdmlkdWFscyBtaWxpdGFyeSBzZXJ2aWNlIHN0YXR1cy5cbiAgICAgKlxuICAgICAqIEByZXR1cm4gYSB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZX0gcmVwcmVzZW50aW5nIHRoZVxuICAgICAqIG1pbGl0YXJ5IHZlcmlmaWNhdGlvbiBzdGF0dXMgb2J0YWluZWQgZnJvbSB0aGUgY2xpZW50IHZlcmlmaWNhdGlvbiBjYWxsXG4gICAgICovXG4gICAgYXN5bmMgdmVyaWZ5KCk6IFByb21pc2U8TWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNUeXBlPiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgQVBJIEtleSBhbmQgQmFzZSBVUkwsIG5lZWRlZCBpbiBvcmRlciB0byBtYWtlIHRoZSB2ZXJpZmljYXRpb24gY2FsbCB0aHJvdWdoIHRoZSBjbGllbnRcbiAgICAgICAgICAgIGNvbnN0IFtxdWFuZGlzQmFzZVVSTCwgcXVhbmRpc0FQSUtleV0gPSBhd2FpdCBzdXBlci5yZXRyaWV2ZVNlcnZpY2VDcmVkZW50aWFscyhDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5RVUFORElTX1NFQ1JFVF9OQU1FKTtcblxuICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHdlIG9idGFpbmVkIGFueSBpbnZhbGlkIHNlY3JldCB2YWx1ZXMgZnJvbSB0aGUgY2FsbCBhYm92ZVxuICAgICAgICAgICAgaWYgKHF1YW5kaXNCYXNlVVJMID09PSBudWxsIHx8IHF1YW5kaXNCYXNlVVJMLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIHF1YW5kaXNBUElLZXkgPT09IG51bGwgfHwgcXVhbmRpc0FQSUtleS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAvLyBmb3IgaW52YWxpZCBzZWNyZXRzLCByZXR1cm4gYSBQZW5kaW5nIHN0YXR1cywgZm9yIGEgYmV0dGVyIGN1c3RvbWVyIGV4cGVyaWVuY2VcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnSW52YWxpZCBTZWNyZXRzIG9idGFpbmVkIGZvciBRdWFuZGlzIGNhbGwhJyk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNUeXBlLlBlbmRpbmc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGNvbnZlcnQgdGhlIGRhdGUgb2YgYmlydGggaW50byB0aGUgYXBwcm9wcmlhdGUgZm9ybWF0IChZWVlZLU1NLUREKSwgYWNjZXB0ZWQgYnkgUXVhbmRpc1xuICAgICAgICAgICAgbGV0IGRvYiA9IHRoaXMudmVyaWZpY2F0aW9uSW5mb3JtYXRpb24uZGF0ZU9mQmlydGg7XG4gICAgICAgICAgICBkb2IgPSBgJHtkb2Iuc3BsaXQoJy8nKVsyXX0tJHtkb2Iuc3BsaXQoJy8nKVswXX0tJHtkb2Iuc3BsaXQoJy8nKVsxXX1gO1xuXG4gICAgICAgICAgICAvLyBjb252ZXJ0IHRoZSBkYXRlIG9mIGludGVyZXN0IGZyb20gdGhlIGVubGlzdG1lbnQgeWVhciBpbnRvIHRoZSBhcHByb3ByaWF0ZSBmb3JtYXQgKFlZWVktMTItMzEpLCBhY2NlcHRlZCBieSBRdWFuZGlzXG4gICAgICAgICAgICBsZXQgZGF0ZU9mSW50ZXJlc3QgPSBgJHt0aGlzLnZlcmlmaWNhdGlvbkluZm9ybWF0aW9uLmVubGlzdG1lbnRZZWFyfS0xMi0zMWA7XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogUE9TVCAvYXBpL21pbGl0YXJ5L3NjcmEvaW5zdGFudC97Y2xpZW50SUR9XG4gICAgICAgICAgICAgKiBAbGluayBodHRwczovL3VhdHNlcnZpY2VzLnF1YW5kaXMuaW8vYXBpL21pbGl0YXJ5L2RvY3VtZW50YXRpb24vaW5kZXguaHRtbFxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIGJ1aWxkIHRoZSBRdWFuZGlzIEFQSSByZXF1ZXN0IGJvZHkgdG8gYmUgcGFzc2VkIGluLCBhbmQgcGVyZm9ybSBhIFBPU1QgdG8gaXQgd2l0aCB0aGUgYXBwcm9wcmlhdGUgaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAqIE5vdGUgdGhhdCB0aGUgY2xpZW50X2lkLCBhcHBlbmRlZCB0byB0aGUgYmFzZSBVUkwsIGlzIHRoZSB1dWlkIGZvciB0aGUgdXNlciwgd2hpY2ggd2lsbCBiZSB1c2VkIGZvciB0cmFja2luZyBwdXJwb3NlcyBpbiBjYXNlIG9mIGFueSBpc3N1ZXNcbiAgICAgICAgICAgICAqIHdlIGltcGx5IHRoYXQgaWYgdGhlIEFQSSBkb2VzIG5vdCByZXNwb25kIGluIDQgc2Vjb25kcywgdGhhdCB3ZSBhdXRvbWF0aWNhbGx5IGNhdGNoIHRoYXQsIGFuZCByZXR1cm4gYSBQZW5kaW5nIHN0YXR1c1xuICAgICAgICAgICAgICogZm9yIGEgYmV0dGVyIGN1c3RvbWVyIGV4cGVyaWVuY2UuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGNvbnN0IHZlcmlmaWNhdGlvblJlc3BvbnNlID0gYXdhaXQgYXhpb3MucG9zdChgJHtxdWFuZGlzQmFzZVVSTH0vJHt0aGlzLnZlcmlmaWNhdGlvbkluZm9ybWF0aW9uLmlkfWAsIHtcbiAgICAgICAgICAgICAgICBjZXJ0aWZpY2F0ZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgZmlyc3ROYW1lOiB0aGlzLnZlcmlmaWNhdGlvbkluZm9ybWF0aW9uLmZpcnN0TmFtZSxcbiAgICAgICAgICAgICAgICBsYXN0TmFtZTogdGhpcy52ZXJpZmljYXRpb25JbmZvcm1hdGlvbi5sYXN0TmFtZSxcbiAgICAgICAgICAgICAgICBiaXJ0aERhdGU6IGRvYixcbiAgICAgICAgICAgICAgICBkYXRlT2ZJbnRlcmVzdDogZGF0ZU9mSW50ZXJlc3RcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgICAgICBcIlgtQXBpS2V5XCI6IHF1YW5kaXNBUElLZXlcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDQwMDAsIC8vIGluIG1pbGxpc2Vjb25kcyBoZXJlXG4gICAgICAgICAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZTogJ1F1YW5kaXMgQVBJIHRpbWVkIG91dCBhZnRlciA0MDAwbXMhJ1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRoZSBzdGF0dXMgb2YgdGhlIHJlc3BvbnNlLCBhbmQgYWN0IGFwcHJvcHJpYXRlbHlcbiAgICAgICAgICAgIGlmICh2ZXJpZmljYXRpb25SZXNwb25zZS5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgICAgIGlmICh2ZXJpZmljYXRpb25SZXNwb25zZS5kYXRhW1wiY292ZXJlZFwiXSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNUeXBlLlZlcmlmaWVkO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1R5cGUuUGVuZGluZztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHJldHVybiBhIFBlbmRpbmcgc3RhdHVzIGZvciBzdGF0dXMgY29kZXMgdGhhdCBhcmUgbm90IDIwMCwgaW4gY2FzZSB0aGUgZXJyb3IgYmxvY2sgZG9lc24ndCBjYXRjaCBpdFxuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgY2FsbGluZyB0aGUgUXVhbmRpcyBBUEksIHdpdGggc3RhdHVzICR7dmVyaWZpY2F0aW9uUmVzcG9uc2Uuc3RhdHVzfSwgYW5kIHJlc3BvbnNlICR7dmVyaWZpY2F0aW9uUmVzcG9uc2UuZGF0YX1gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgcmV0dXJuIE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZS5QZW5kaW5nO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIC8vIGZvciBhbnkgZXJyb3IgY2F1Z2h0IGhlcmUsIHJldHVybiBhIFBlbmRpbmcgc3RhdHVzLCBmb3IgYSBiZXR0ZXIgY3VzdG9tZXIgZXhwZXJpZW5jZVxuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgdmVyaWZ5aW5nIG1pbGl0YXJ5IHN0YXR1cyB0aHJvdWdoIFF1YW5kaXMgJHtlcnJ9YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgIHJldHVybiBNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1R5cGUuUGVuZGluZztcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==