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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkFDbGllbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL2NsaWVudHMvVkFDbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsK0RBQXFIO0FBQ3JILGtEQUEwQjtBQUMxQiwrREFBd0Q7QUFFeEQ7O0dBRUc7QUFDSCxNQUFhLFFBQVMsU0FBUSwrQkFBYTtJQUN2Qzs7O09BR0c7SUFDYyx1QkFBdUIsQ0FBNkU7SUFFckg7Ozs7Ozs7T0FPRztJQUNILFlBQVksdUJBQW1HLEVBQUUsV0FBbUIsRUFBRSxNQUFjO1FBQ2hKLEtBQUssQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFFM0IsSUFBSSxDQUFDLHVCQUF1QixHQUFHLHVCQUF1QixDQUFDO0lBQzNELENBQUM7SUFFRDs7Ozs7Ozs7Ozs7O09BWUc7SUFDSCxhQUFhO0lBQ2IsS0FBSyxDQUFDLG1CQUFtQixDQUFDLGFBQXNCLEVBQUUsaUJBQTBCO1FBQ3hFLElBQUk7WUFDQSxzR0FBc0c7WUFDdEcsTUFBTSxDQUFDLGlCQUFpQixFQUFFLGdCQUFnQixDQUFDLEdBQUcsTUFBTSxLQUFLLENBQUMsMEJBQTBCLENBQUMsMkJBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1lBRXhJLDRFQUE0RTtZQUM1RSxJQUFJLGlCQUFpQixLQUFLLElBQUksSUFBSSxpQkFBaUIsQ0FBQyxNQUFNLEtBQUssQ0FBQztnQkFDNUQsZ0JBQWdCLEtBQUssSUFBSSxJQUFJLGdCQUFnQixDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQzVELGlGQUFpRjtnQkFDakYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQ0FBZ0MsSUFBSSxDQUFDLHVCQUF1QixDQUFDLG1CQUFtQix1QkFBdUIsQ0FBQyxDQUFDO2dCQUVySCxPQUFPLGdEQUE4QixDQUFDLE9BQU8sQ0FBQzthQUNqRDtZQUVELDZGQUE2RjtZQUM3RixJQUFJLEdBQUcsR0FBRyxJ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QixDQUFDLG1CQUFtQiwrQ0FBK0MsR0FBRyxFQUFFLENBQUM7WUFDOUosT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUUxQixPQUFPLGdEQUE4QixDQUFDLE9BQU8sQ0FBQztTQUNqRDtJQUNMLENBQUM7Q0FDSjtBQXZJRCw0QkF1SUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NvbnN0YW50cywgTWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbiwgTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNUeXBlfSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuaW1wb3J0IGF4aW9zIGZyb20gXCJheGlvc1wiO1xuaW1wb3J0IHtCYXNlQVBJQ2xpZW50fSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuXG4vKipcbiAqIENsYXNzIHVzZWQgYXMgdGhlIGJhc2UvZ2VuZXJpYyBjbGllbnQgZm9yIGFsbCBWQSBMaWdodGhvdXNlIHZlcmlmaWNhdGlvbiBjYWxscy5cbiAqL1xuZXhwb3J0IGNsYXNzIFZBQ2xpZW50IGV4dGVuZHMgQmFzZUFQSUNsaWVudCB7XG4gICAgLyoqXG4gICAgICogVGhlIHZlcmlmaWNhdGlvbiBpbmZvcm1hdGlvbiBwcm92aWRlZCBieSB0aGUgY3VzdG9tZXIsIHdoaWNoIHRoZXkgd2lsbFxuICAgICAqIGdldCB2ZXJpZmllZCB1cG9uLlxuICAgICAqL1xuICAgIHByaXZhdGUgcmVhZG9ubHkgdmVyaWZpY2F0aW9uSW5mb3JtYXRpb246IE1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5mb3JtYXRpb24gJiB7cGVyc29uYWxJZGVudGlmaWVyOiBzdHJpbmcgfCB1bmRlZmluZWR9O1xuXG4gICAgLyoqXG4gICAgICogR2VuZXJpYyBjb25zdHJ1Y3RvciBmb3IgdGhlIHZlcmlmaWNhdGlvbiBjbGllbnQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gdmVyaWZpY2F0aW9uSW5mb3JtYXRpb24gdmVyaWZpY2F0aW9uIGluZm9ybWF0aW9uIHByb3ZpZGVkIGJ5IHRoZVxuICAgICAqIGN1c3RvbWVyLlxuICAgICAqIEBwYXJhbSByZWdpb24gdGhlIEFXUyByZWdpb24gcGFzc2VkIGluIGZyb20gdGhlIExhbWJkYSByZXNvbHZlci5cbiAgICAgKiBAcGFyYW0gZW52aXJvbm1lbnQgdGhlIEFXUyBlbnZpcm9ubWVudCBwYXNzZWQgaW4gZnJvbSB0aGUgTGFtYmRhIHJlc29sdmVyLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHZlcmlmaWNhdGlvbkluZm9ybWF0aW9uOiBNaWxpdGFyeVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uICYge3BlcnNvbmFsSWRlbnRpZmllcjogc3RyaW5nIHwgdW5kZWZpbmVkfSwgZW52aXJvbm1lbnQ6IHN0cmluZywgcmVnaW9uOiBzdHJpbmcpIHtcbiAgICAgICAgc3VwZXIocmVnaW9uLCBlbnZpcm9ubWVudCk7XG5cbiAgICAgICAgdGhpcy52ZXJpZmljYXRpb25JbmZvcm1hdGlvbiA9IHZlcmlmaWNhdGlvbkluZm9ybWF0aW9uO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHVzZWQgdG8gdmVyaWZ5IGFuIGluZGl2aWR1YWwncyBtaWxpdGFyeSBzZXJ2aWNlIHN0YXR1cy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBudW1iZXJPZkNhbGxzIG9wdGlvbmFsIHBhcmFtLCB1c2VkIGZvciB1c2UgY2FzZXMgd2hlbiB3ZSByZWN1cnNpdmVseSBjYWxsXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgdGhpcyBmdW5jdGlvbiBpbiBvcmRlciB0byBtYWtlIGFkZGl0aW9uYWwgY2FsbHMgdG8gUXVhbmRpc1xuICAgICAqICAgICAgICAgICAgICAgICAgICAgIGZvciB1c2VycyB3aG8gbGlzdCBhbiBpbmNvcnJlY3QgZW5saXN0bWVudCB5ZWFyIGF0IGZpcnN0XG4gICAgICogICAgICAgICAgICAgICAgICAgICAgKG5vdCBhcHBsaWNhYmxlIGZvciB0aGUgVkEpXG4gICAgICogQHBhcmFtIG5ld0VubGlzdG1lbnRZZWFyIG9wdGlvbmFsIHBhcmFtLCByZXByZXNlbnRpbmcgbmV3IGVubGlzdG1lbnQgeWVhciBmb3IgdGhlXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgIHJlY3Vyc2l2ZSBjYWxsIChub3QgYXBwbGljYWJsZSBmb3IgdGhlIFZBKS5cbiAgICAgKlxuICAgICAqIEByZXR1cm4gYSB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZX0gcmVwcmVzZW50aW5nIHRoZVxuICAgICAqIG1pbGl0YXJ5IHZlcmlmaWNhdGlvbiBzdGF0dXMgb2J0YWluZWQgZnJvbSB0aGUgY2xpZW50IHZlcmlmaWNhdGlvbiBjYWxsXG4gICAgICovXG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIGFzeW5jIHZlcmlmeVNlcnZpY2VNZW1iZXIobnVtYmVyT2ZDYWxscz86IG51bWJlciwgbmV3RW5saXN0bWVudFllYXI/OiBudW1iZXIpOiBQcm9taXNlPE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIEFQSSBLZXkgYW5kIEJhc2UgVVJMLCBuZWVkZWQgaW4gb3JkZXIgdG8gbWFrZSB0aGUgdmVyaWZpY2F0aW9uIGNhbGwgdGhyb3VnaCB0aGUgY2xpZW50XG4gICAgICAgICAgICBjb25zdCBbbGlnaHRob3VzZUJhc2VVUkwsIGxpZ2h0aG91c2VBUElLZXldID0gYXdhaXQgc3VwZXIucmV0cmlldmVTZXJ2aWNlQ3JlZGVudGlhbHMoQ29uc3RhbnRzLkFXU1BhaXJDb25zdGFudHMuTElHSFRIT1VTRV9TRUNSRVRfTkFNRSk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB3ZSBvYnRhaW5lZCBhbnkgaW52YWxpZCBzZWNyZXQgdmFsdWVzIGZyb20gdGhlIGNhbGwgYWJvdmVcbiAgICAgICAgICAgIGlmIChsaWdodGhvdXNlQmFzZVVSTCA9PT0gbnVsbCB8fCBsaWdodGhvdXNlQmFzZVVSTC5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBsaWdodGhvdXNlQVBJS2V5ID09PSBudWxsIHx8IGxpZ2h0aG91c2VBUElLZXkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgLy8gZm9yIGludmFsaWQgc2VjcmV0cywgcmV0dXJuIGEgUGVuZGluZyBzdGF0dXMsIGZvciBhIGJldHRlciBjdXN0b21lciBleHBlcmllbmNlXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYEludmFsaWQgU2VjcmV0cyBvYnRhaW5lZCBmb3IgJHt0aGlzLnZlcmlmaWNhdGlvbkluZm9ybWF0aW9uLm1pbGl0YXJ5QWZmaWxpYXRpb259IExpZ2h0aG91c2UgQVBJIGNhbGwhYCk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNUeXBlLlBlbmRpbmc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGNvbnZlcnQgdGhlIGRhdGUgb2YgYmlydGggaW50byB0aGUgYXBwcm9wcmlhdGUgZm9ybWF0IChZWVlZLU1NLUREKSwgYWNjZXB0ZWQgYnkgTGlnaHRob3VzZVxuICAgICAgICAgICAgbGV0IGRvYiA9IHRoaXMudmVyaWZpY2F0aW9uSW5mb3JtYXRpb24uZGF0ZU9mQmlydGg7XG4gICAgICAgICAgICBkb2IgPSBgJHtkb2Iuc3BsaXQoJy8nKVsyXX0tJHtkb2Iuc3BsaXQoJy8nKVswXX0tJHtkb2Iuc3BsaXQoJy8nKVsxXX1gO1xuXG4gICAgICAgICAgICAvLyBpZiB0aGUgdXNlciBsaXN0cyBtb3JlIHRoYW4gMSBuYW1lIGZvciB0aGVpciBmaXJzdCBuYW1lLCBhbmQgaXQncyBzZXBhcmF0ZWQgYnkgYSBzcGFjZSwgdGhlbiByZXBsYWNlIHRoZSBzcGFjZXMgd2l0aCBcIi1cIlxuICAgICAgICAgICAgbGV0IGZpcnN0TmFtZUZvcm1hdHRlZCA9IHRoaXMudmVyaWZpY2F0aW9uSW5mb3JtYXRpb24uZmlyc3ROYW1lLmluY2x1ZGVzKCcgJylcbiAgICAgICAgICAgICAgICA/IHRoaXMudmVyaWZpY2F0aW9uSW5mb3JtYXRpb24uZmlyc3ROYW1lLnJlcGxhY2UoJyAnLCAnLScpXG4gICAgICAgICAgICAgICAgOiB0aGlzLnZlcmlmaWNhdGlvbkluZm9ybWF0aW9uLmZpcnN0TmFtZTtcblxuICAgICAgICAgICAgLy8gaWYgdGhlIHVzZXIgbGlzdHMgbW9yZSB0aGFuIDEgbmFtZSBmb3IgdGhlaXIgbGFzdCBuYW1lLCBhbmQgaXQncyBzZXBhcmF0ZWQgYnkgYSBzcGFjZSwgdGhlbiByZXBsYWNlIHRoZSBzcGFjZXMgd2l0aCBcIi1cIlxuICAgICAgICAgICAgbGV0IGxhc3ROYW1lRm9ybWF0dGVkID0gdGhpcy52ZXJpZmljYXRpb25JbmZvcm1hdGlvbi5sYXN0TmFtZS5pbmNsdWRlcygnICcpXG4gICAgICAgICAgICAgICAgPyB0aGlzLnZlcmlmaWNhdGlvbkluZm9ybWF0aW9uLmxhc3ROYW1lLnJlcGxhY2UoJyAnLCAnLScpXG4gICAgICAgICAgICAgICAgOiB0aGlzLnZlcmlmaWNhdGlvbkluZm9ybWF0aW9uLmxhc3ROYW1lO1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFBPU1QgL3N0YXR1c1xuICAgICAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIudmEuZ292L2V4cGxvcmUvdmVyaWZpY2F0aW9uL2RvY3MvdmV0ZXJhbl9jb25maXJtYXRpb24/dmVyc2lvbj1jdXJyZW50XG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogYnVpbGQgdGhlIExpZ2h0aG91c2UgQVBJIHJlcXVlc3QgYm9keSB0byBiZSBwYXNzZWQgaW4sIGFuZCBwZXJmb3JtIGEgUE9TVCB0byBpdCB3aXRoIHRoZSBhcHByb3ByaWF0ZSBpbmZvcm1hdGlvblxuICAgICAgICAgICAgICogd2UgaW1wbHkgdGhhdCBpZiB0aGUgQVBJIGRvZXMgbm90IHJlc3BvbmQgaW4gMTAgc2Vjb25kcywgdGhlbiB3ZSBhdXRvbWF0aWNhbGx5IGNhdGNoIHRoYXQsIGFuZCByZXR1cm4gYSBQZW5kaW5nIHN0YXR1c1xuICAgICAgICAgICAgICogZm9yIGEgYmV0dGVyIGN1c3RvbWVyIGV4cGVyaWVuY2UuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGNvbnN0IHJlcXVlc3REYXRhID0ge1xuICAgICAgICAgICAgICAgIGZpcnN0TmFtZTogZmlyc3ROYW1lRm9ybWF0dGVkLnRyaW1TdGFydCgpLnRyaW1FbmQoKS50cmltKCksXG4gICAgICAgICAgICAgICAgbGFzdE5hbWU6IGxhc3ROYW1lRm9ybWF0dGVkLnRyaW1TdGFydCgpLnRyaW1FbmQoKS50cmltKCksXG4gICAgICAgICAgICAgICAgYmlydGhEYXRlOiBkb2IudHJpbVN0YXJ0KCkudHJpbUVuZCgpLnRyaW0oKSxcbiAgICAgICAgICAgICAgICBzdHJlZXRBZGRyZXNzTGluZTE6IHRoaXMudmVyaWZpY2F0aW9uSW5mb3JtYXRpb24uYWRkcmVzc0xpbmUudHJpbVN0YXJ0KCkudHJpbUVuZCgpLnRyaW0oKSxcbiAgICAgICAgICAgICAgICBjaXR5OiB0aGlzLnZlcmlmaWNhdGlvbkluZm9ybWF0aW9uLmNpdHkudHJpbVN0YXJ0KCkudHJpbUVuZCgpLnRyaW0oKSxcbiAgICAgICAgICAgICAgICBzdGF0ZTogdGhpcy52ZXJpZmljYXRpb25JbmZvcm1hdGlvbi5zdGF0ZS50cmltU3RhcnQoKS50cmltRW5kKCkudHJpbSgpLFxuICAgICAgICAgICAgICAgIHppcENvZGU6IHRoaXMudmVyaWZpY2F0aW9uSW5mb3JtYXRpb24uemlwQ29kZS50cmltU3RhcnQoKS50cmltRW5kKCkudHJpbSgpLFxuICAgICAgICAgICAgICAgIGNvdW50cnk6IFwiVVNBXCJcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgQ2FsbGluZyBMaWdodGhvdXNlIEFQSSBmb3IgJHt0aGlzLnZlcmlmaWNhdGlvbkluZm9ybWF0aW9uLm1pbGl0YXJ5QWZmaWxpYXRpb259LCBmb3IgJHtyZXF1ZXN0RGF0YS5maXJzdE5hbWV9ICR7cmVxdWVzdERhdGEubGFzdE5hbWV9YCk7XG4gICAgICAgICAgICByZXR1cm4gYXhpb3MucG9zdChsaWdodGhvdXNlQmFzZVVSTCwgcmVxdWVzdERhdGEsIHtcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgICAgICBcImFwaUtleVwiOiBsaWdodGhvdXNlQVBJS2V5XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiAxMDAwMCwgLy8gaW4gbWlsbGlzZWNvbmRzIGhlcmVcbiAgICAgICAgICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlOiBgTGlnaHRob3VzZSBBUEkgZm9yICR7dGhpcy52ZXJpZmljYXRpb25JbmZvcm1hdGlvbi5taWxpdGFyeUFmZmlsaWF0aW9ufSB0aW1lZCBvdXQgYWZ0ZXIgMTAwMDBtcyFgXG4gICAgICAgICAgICB9KS50aGVuKHZlcmlmaWNhdGlvblJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiBpZiB3ZSByZWFjaGVkIHRoaXMsIHRoZW4gd2UgYXNzdW1lIHRoYXQgYSAyeHggcmVzcG9uc2UgY29kZSB3YXMgcmV0dXJuZWQuXG4gICAgICAgICAgICAgICAgICogY2hlY2sgdGhlIGNvbnRlbnRzIG9mIHRoZSByZXNwb25zZSwgYW5kIGFjdCBhcHByb3ByaWF0ZWx5LlxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGlmICh2ZXJpZmljYXRpb25SZXNwb25zZS5kYXRhICYmIHZlcmlmaWNhdGlvblJlc3BvbnNlLmRhdGFbXCJ2ZXRlcmFuX3N0YXR1c1wiXSA9PT0gXCJjb25maXJtZWRcIikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNUeXBlLlZlcmlmaWVkO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1R5cGUuUGVuZGluZztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yLnJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBhbmQgdGhlIHNlcnZlciByZXNwb25kZWQgd2l0aCBhIHN0YXR1cyBjb2RlXG4gICAgICAgICAgICAgICAgICAgICAqIHRoYXQgZmFsbHMgb3V0IG9mIHRoZSByYW5nZSBvZiAyeHguXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm9uIDJ4eHggcmVzcG9uc2Ugd2hpbGUgY2FsbGluZyB0aGUgJHt0aGlzLnZlcmlmaWNhdGlvbkluZm9ybWF0aW9uLm1pbGl0YXJ5QWZmaWxpYXRpb259IExpZ2h0aG91c2UgQVBJLCB3aXRoIHN0YXR1cyAke2Vycm9yLnJlc3BvbnNlLnN0YXR1c30sIGFuZCByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGVycm9yLnJlc3BvbnNlLmRhdGEpfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZS5QZW5kaW5nO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3IucmVxdWVzdCkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYnV0IG5vIHJlc3BvbnNlIHdhcyByZWNlaXZlZFxuICAgICAgICAgICAgICAgICAgICAgKiBgZXJyb3IucmVxdWVzdGAgaXMgYW4gaW5zdGFuY2Ugb2YgWE1MSHR0cFJlcXVlc3QgaW4gdGhlIGJyb3dzZXIgYW5kIGFuIGluc3RhbmNlIG9mXG4gICAgICAgICAgICAgICAgICAgICAqICBodHRwLkNsaWVudFJlcXVlc3QgaW4gbm9kZS5qcy5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBObyByZXNwb25zZSByZWNlaXZlZCB3aGlsZSBjYWxsaW5nIHRoZSBMaWdodGhvdXNlIEFQSSwgZm9yICR7dGhpcy52ZXJpZmljYXRpb25JbmZvcm1hdGlvbi5taWxpdGFyeUFmZmlsaWF0aW9ufSByZXF1ZXN0ICR7ZXJyb3IucmVxdWVzdH1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1R5cGUuUGVuZGluZztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBTb21ldGhpbmcgaGFwcGVuZWQgaW4gc2V0dGluZyB1cCB0aGUgcmVxdWVzdCB0aGF0IHRyaWdnZXJlZCBhbiBFcnJvclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBzZXR0aW5nIHVwIHRoZSAke3RoaXMudmVyaWZpY2F0aW9uSW5mb3JtYXRpb24ubWlsaXRhcnlBZmZpbGlhdGlvbn0gcmVxdWVzdCBmb3IgdGhlIExpZ2h0aG91c2UgQVBJLCAkeyhlcnJvciAmJiBlcnJvci5tZXNzYWdlKSAmJiBlcnJvci5tZXNzYWdlfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZS5QZW5kaW5nO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIC8vIGZvciBhbnkgZXJyb3IgY2F1Z2h0IGhlcmUsIHJldHVybiBhIFBlbmRpbmcgc3RhdHVzLCBmb3IgYSBiZXR0ZXIgY3VzdG9tZXIgZXhwZXJpZW5jZVxuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgdmVyaWZ5aW5nICR7dGhpcy52ZXJpZmljYXRpb25JbmZvcm1hdGlvbi5taWxpdGFyeUFmZmlsaWF0aW9ufSBtaWxpdGFyeSBzdGF0dXMgdGhyb3VnaCB0aGUgTGlnaHRob3VzZSBBUEkgJHtlcnJ9YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgIHJldHVybiBNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1R5cGUuUGVuZGluZztcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==