"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuandisClient = void 0;
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const VerificationClient_1 = require("./VerificationClient");
const axios_1 = __importDefault(require("axios"));
/**
 * Class used as the base/generic client for all Quandis verification calls.
 */
class QuandisClient extends VerificationClient_1.VerificationClient {
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
             * build the Quandis API request body to be passed in, and perform a POST to it with the appropriate information
             * Note that the client_id, appended to the base URL, is the uuid for the user, which will be used for tracking purposes in case of any issues
             * we imply that if the API does not respond in 2 seconds, that we automatically catch that, and return a Pending status
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
                timeout: 2000,
                timeoutErrorMessage: 'Quandis API timed out after 2000ms!'
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
            // return a Pending status for status codes that are not 200
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUXVhbmRpc0NsaWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvY2xpZW50cy9RdWFuZGlzQ2xpZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLCtEQUFxSDtBQUNySCw2REFBd0Q7QUFDeEQsa0RBQTBCO0FBRTFCOztHQUVHO0FBQ0gsTUFBYSxhQUFjLFNBQVEsdUNBQWtCO0lBQ2pEOzs7T0FHRztJQUNjLHVCQUF1QixDQUFrQztJQUUxRTs7Ozs7OztPQU9HO0lBQ0gsWUFBWSx1QkFBd0QsRUFBRSxXQUFtQixFQUFFLE1BQWM7UUFDckcsS0FBSyxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQztRQUUzQixJQUFJLENBQUMsdUJBQXVCLEdBQUcsdUJBQXVCLENBQUM7SUFDM0QsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsS0FBSyxDQUFDLE1BQU07UUFDUixJQUFJO1lBQ0Esc0dBQXNHO1lBQ3RHLE1BQU0sQ0FBQyxjQUFjLEVBQUUsYUFBYSxDQUFDLEdBQUcsTUFBTSxLQUFLLENBQUMsMEJBQTBCLENBQUMsMkJBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1lBRS9ILDRFQUE0RTtZQUM1RSxJQUFJLGNBQWMsS0FBSyxJQUFJLElBQUksY0FBYyxDQUFDLE1BQU0sS0FBSyxDQUFDO2dCQUN0RCxhQUFhLEtBQUssSUFBSSxJQUFJLGFBQWEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUN0RCxpRkFBaUY7Z0JBQ2pGLE9BQU8sQ0FBQyxHQUFHLENBQUMsNENBQTRDLENBQUMsQ0FBQztnQkFFMUQsT0FBTyxnREFBOEIsQ0FBQyxPQUFPLENBQUM7YUFDakQ7WUFFRCwwRkFBMEY7WUFDMUYsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFdBQVcsQ0FBQztZQUNuRCxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBRXZFLHNIQUFzSDtZQUN0SCxJQUFJLGNBQWMsR0FBRyxHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxjQUFjLFFBQVEsQ0FBQztZQUU1RTs7Ozs7ZUFLRztZQUNILE1BQU0sb0JBQW9CLEdBQUcsTUFBTSxlQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsY0FBYyxJQUFJLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLEVBQUUsRUFBRTtnQkFDbEcsV0FBVyxFQUFFLEtBQUs7Z0JBQ2xCLFNBQVMsRUFBRSxJQUFJLENBQUMsdUJBQXVCLENBQUMsU0FBUztnQkFDakQsUUFBUSxFQUFFLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxRQUFRO2dCQUMvQyxTQUFTLEVBQUUsR0FBRztnQkFDZCxjQUFjLEVBQUUsY0FBYzthQUNqQyxFQUFFO2dCQUNDLE9BQU8sRUFBRTtvQkFDTCxjQUFjLEVBQUUsa0JBQWtCO29CQUNsQyxVQUFVLEVBQUUsYUFBYTtpQkFDNUI7Z0JBQ0QsT0FBTyxFQUFFLElBQUk7Z0JBQ2IsbUJBQW1CLEVBQUUscUNBQXFDO2FBQzdELENBQUMsQ0FBQztZQUVILDBEQUEwRDtZQUMxRCxJQUFJLG9CQUFvQixDQUFDLE1BQU0sS0FBSyxHQUFHLEVBQUU7Z0JBQ3JDLElBQUksb0JBQW9CLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLElBQUksRUFBRTtvQkFDL0MsT0FBTyxnREFBOEIsQ0FBQyxRQUFRLENBQUM7aUJBQ2xEO3FCQUFNO29CQUNILE9BQU8sZ0RBQThCLENBQUMsT0FBTyxDQUFDO2lCQUNqRDthQUNKO1lBRUQsNERBQTREO1lBQzVELE1BQU0sWUFBWSxHQUFHLCtEQUErRCxvQkFBb0IsQ0FBQyxNQUFNLGtCQUFrQixvQkFBb0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUM3SixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRTFCLE9BQU8sZ0RBQThCLENBQUMsT0FBTyxDQUFDO1NBQ2pEO1FBQUMsT0FBTyxHQUFHLEVBQUU7WUFDVix1RkFBdUY7WUFDdkYsTUFBTSxZQUFZLEdBQUcsb0VBQW9FLEdBQUcsRUFBRSxDQUFDO1lBQy9GLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7WUFFMUIsT0FBTyxnREFBOEIsQ0FBQyxPQUFPLENBQUM7U0FDakQ7SUFDTCxDQUFDO0NBQ0o7QUEzRkQsc0NBMkZDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDb25zdGFudHMsIE1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5mb3JtYXRpb24sIE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZX0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcbmltcG9ydCB7VmVyaWZpY2F0aW9uQ2xpZW50fSBmcm9tIFwiLi9WZXJpZmljYXRpb25DbGllbnRcIjtcbmltcG9ydCBheGlvcyBmcm9tIFwiYXhpb3NcIjtcblxuLyoqXG4gKiBDbGFzcyB1c2VkIGFzIHRoZSBiYXNlL2dlbmVyaWMgY2xpZW50IGZvciBhbGwgUXVhbmRpcyB2ZXJpZmljYXRpb24gY2FsbHMuXG4gKi9cbmV4cG9ydCBjbGFzcyBRdWFuZGlzQ2xpZW50IGV4dGVuZHMgVmVyaWZpY2F0aW9uQ2xpZW50IHtcbiAgICAvKipcbiAgICAgKiBUaGUgdmVyaWZpY2F0aW9uIGluZm9ybWF0aW9uIHByb3ZpZGVkIGJ5IHRoZSBjdXN0b21lciwgd2hpY2ggdGhleSB3aWxsXG4gICAgICogZ2V0IHZlcmlmaWVkIHVwb24uXG4gICAgICovXG4gICAgcHJpdmF0ZSByZWFkb25seSB2ZXJpZmljYXRpb25JbmZvcm1hdGlvbjogTWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbjtcblxuICAgIC8qKlxuICAgICAqIEdlbmVyaWMgY29uc3RydWN0b3IgZm9yIHRoZSB2ZXJpZmljYXRpb24gY2xpZW50LlxuICAgICAqXG4gICAgICogQHBhcmFtIHZlcmlmaWNhdGlvbkluZm9ybWF0aW9uIHZlcmlmaWNhdGlvbiBpbmZvcm1hdGlvbiBwcm92aWRlZCBieSB0aGVcbiAgICAgKiBjdXN0b21lci5cbiAgICAgKiBAcGFyYW0gcmVnaW9uIHRoZSBBV1MgcmVnaW9uIHBhc3NlZCBpbiBmcm9tIHRoZSBMYW1iZGEgcmVzb2x2ZXIuXG4gICAgICogQHBhcmFtIGVudmlyb25tZW50IHRoZSBBV1MgZW52aXJvbm1lbnQgcGFzc2VkIGluIGZyb20gdGhlIExhbWJkYSByZXNvbHZlci5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcih2ZXJpZmljYXRpb25JbmZvcm1hdGlvbjogTWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbiwgZW52aXJvbm1lbnQ6IHN0cmluZywgcmVnaW9uOiBzdHJpbmcpIHtcbiAgICAgICAgc3VwZXIocmVnaW9uLCBlbnZpcm9ubWVudCk7XG5cbiAgICAgICAgdGhpcy52ZXJpZmljYXRpb25JbmZvcm1hdGlvbiA9IHZlcmlmaWNhdGlvbkluZm9ybWF0aW9uO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHVzZWQgdG8gdmVyaWZ5IGFuIGluZGl2aWR1YWxzIG1pbGl0YXJ5IHNlcnZpY2Ugc3RhdHVzLlxuICAgICAqXG4gICAgICogQHJldHVybiBhIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNUeXBlfSByZXByZXNlbnRpbmcgdGhlXG4gICAgICogbWlsaXRhcnkgdmVyaWZpY2F0aW9uIHN0YXR1cyBvYnRhaW5lZCBmcm9tIHRoZSBjbGllbnQgdmVyaWZpY2F0aW9uIGNhbGxcbiAgICAgKi9cbiAgICBhc3luYyB2ZXJpZnkoKTogUHJvbWlzZTxNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1R5cGU+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBBUEkgS2V5IGFuZCBCYXNlIFVSTCwgbmVlZGVkIGluIG9yZGVyIHRvIG1ha2UgdGhlIHZlcmlmaWNhdGlvbiBjYWxsIHRocm91Z2ggdGhlIGNsaWVudFxuICAgICAgICAgICAgY29uc3QgW3F1YW5kaXNCYXNlVVJMLCBxdWFuZGlzQVBJS2V5XSA9IGF3YWl0IHN1cGVyLnJldHJpZXZlU2VydmljZUNyZWRlbnRpYWxzKENvbnN0YW50cy5BV1NQYWlyQ29uc3RhbnRzLlFVQU5ESVNfU0VDUkVUX05BTUUpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgd2Ugb2J0YWluZWQgYW55IGludmFsaWQgc2VjcmV0IHZhbHVlcyBmcm9tIHRoZSBjYWxsIGFib3ZlXG4gICAgICAgICAgICBpZiAocXVhbmRpc0Jhc2VVUkwgPT09IG51bGwgfHwgcXVhbmRpc0Jhc2VVUkwubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgcXVhbmRpc0FQSUtleSA9PT0gbnVsbCB8fCBxdWFuZGlzQVBJS2V5Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIC8vIGZvciBpbnZhbGlkIHNlY3JldHMsIHJldHVybiBhIFBlbmRpbmcgc3RhdHVzLCBmb3IgYSBiZXR0ZXIgY3VzdG9tZXIgZXhwZXJpZW5jZVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdJbnZhbGlkIFNlY3JldHMgb2J0YWluZWQgZm9yIFF1YW5kaXMgY2FsbCEnKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1R5cGUuUGVuZGluZztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gY29udmVydCB0aGUgZGF0ZSBvZiBiaXJ0aCBpbnRvIHRoZSBhcHByb3ByaWF0ZSBmb3JtYXQgKFlZWVktTU0tREQpLCBhY2NlcHRlZCBieSBRdWFuZGlzXG4gICAgICAgICAgICBsZXQgZG9iID0gdGhpcy52ZXJpZmljYXRpb25JbmZvcm1hdGlvbi5kYXRlT2ZCaXJ0aDtcbiAgICAgICAgICAgIGRvYiA9IGAke2RvYi5zcGxpdCgnLycpWzJdfS0ke2RvYi5zcGxpdCgnLycpWzBdfS0ke2RvYi5zcGxpdCgnLycpWzFdfWA7XG5cbiAgICAgICAgICAgIC8vIGNvbnZlcnQgdGhlIGRhdGUgb2YgaW50ZXJlc3QgZnJvbSB0aGUgZW5saXN0bWVudCB5ZWFyIGludG8gdGhlIGFwcHJvcHJpYXRlIGZvcm1hdCAoWVlZWS0xMi0zMSksIGFjY2VwdGVkIGJ5IFF1YW5kaXNcbiAgICAgICAgICAgIGxldCBkYXRlT2ZJbnRlcmVzdCA9IGAke3RoaXMudmVyaWZpY2F0aW9uSW5mb3JtYXRpb24uZW5saXN0bWVudFllYXJ9LTEyLTMxYDtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBidWlsZCB0aGUgUXVhbmRpcyBBUEkgcmVxdWVzdCBib2R5IHRvIGJlIHBhc3NlZCBpbiwgYW5kIHBlcmZvcm0gYSBQT1NUIHRvIGl0IHdpdGggdGhlIGFwcHJvcHJpYXRlIGluZm9ybWF0aW9uXG4gICAgICAgICAgICAgKiBOb3RlIHRoYXQgdGhlIGNsaWVudF9pZCwgYXBwZW5kZWQgdG8gdGhlIGJhc2UgVVJMLCBpcyB0aGUgdXVpZCBmb3IgdGhlIHVzZXIsIHdoaWNoIHdpbGwgYmUgdXNlZCBmb3IgdHJhY2tpbmcgcHVycG9zZXMgaW4gY2FzZSBvZiBhbnkgaXNzdWVzXG4gICAgICAgICAgICAgKiB3ZSBpbXBseSB0aGF0IGlmIHRoZSBBUEkgZG9lcyBub3QgcmVzcG9uZCBpbiAyIHNlY29uZHMsIHRoYXQgd2UgYXV0b21hdGljYWxseSBjYXRjaCB0aGF0LCBhbmQgcmV0dXJuIGEgUGVuZGluZyBzdGF0dXNcbiAgICAgICAgICAgICAqIGZvciBhIGJldHRlciBjdXN0b21lciBleHBlcmllbmNlLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBjb25zdCB2ZXJpZmljYXRpb25SZXNwb25zZSA9IGF3YWl0IGF4aW9zLnBvc3QoYCR7cXVhbmRpc0Jhc2VVUkx9LyR7dGhpcy52ZXJpZmljYXRpb25JbmZvcm1hdGlvbi5pZH1gLCB7XG4gICAgICAgICAgICAgICAgY2VydGlmaWNhdGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGZpcnN0TmFtZTogdGhpcy52ZXJpZmljYXRpb25JbmZvcm1hdGlvbi5maXJzdE5hbWUsXG4gICAgICAgICAgICAgICAgbGFzdE5hbWU6IHRoaXMudmVyaWZpY2F0aW9uSW5mb3JtYXRpb24ubGFzdE5hbWUsXG4gICAgICAgICAgICAgICAgYmlydGhEYXRlOiBkb2IsXG4gICAgICAgICAgICAgICAgZGF0ZU9mSW50ZXJlc3Q6IGRhdGVPZkludGVyZXN0XG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAgICAgXCJYLUFwaUtleVwiOiBxdWFuZGlzQVBJS2V5XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiAyMDAwLCAvLyBpbiBtaWxsaXNlY29uZHMgaGVyZVxuICAgICAgICAgICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2U6ICdRdWFuZGlzIEFQSSB0aW1lZCBvdXQgYWZ0ZXIgMjAwMG1zISdcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0aGUgc3RhdHVzIG9mIHRoZSByZXNwb25zZSwgYW5kIGFjdCBhcHByb3ByaWF0ZWx5XG4gICAgICAgICAgICBpZiAodmVyaWZpY2F0aW9uUmVzcG9uc2Uuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgICAgICBpZiAodmVyaWZpY2F0aW9uUmVzcG9uc2UuZGF0YVtcImNvdmVyZWRcIl0gPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZS5WZXJpZmllZDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNUeXBlLlBlbmRpbmc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyByZXR1cm4gYSBQZW5kaW5nIHN0YXR1cyBmb3Igc3RhdHVzIGNvZGVzIHRoYXQgYXJlIG5vdCAyMDBcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGNhbGxpbmcgdGhlIFF1YW5kaXMgQVBJLCB3aXRoIHN0YXR1cyAke3ZlcmlmaWNhdGlvblJlc3BvbnNlLnN0YXR1c30sIGFuZCByZXNwb25zZSAke3ZlcmlmaWNhdGlvblJlc3BvbnNlLmRhdGF9YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgIHJldHVybiBNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1R5cGUuUGVuZGluZztcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAvLyBmb3IgYW55IGVycm9yIGNhdWdodCBoZXJlLCByZXR1cm4gYSBQZW5kaW5nIHN0YXR1cywgZm9yIGEgYmV0dGVyIGN1c3RvbWVyIGV4cGVyaWVuY2VcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHZlcmlmeWluZyBtaWxpdGFyeSBzdGF0dXMgdGhyb3VnaCBRdWFuZGlzICR7ZXJyfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICByZXR1cm4gTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNUeXBlLlBlbmRpbmc7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=