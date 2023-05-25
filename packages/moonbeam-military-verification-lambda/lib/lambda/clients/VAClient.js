"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VAClient = void 0;
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const VerificationClient_1 = require("./VerificationClient");
const axios_1 = __importDefault(require("axios"));
/**
 * Class used as the base/generic client for all VA Lighthouse verification calls.
 */
class VAClient extends VerificationClient_1.VerificationClient {
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
                throw new Error(`invalid secrets obtained`);
            }
            // convert the date of birth into the appropriate format (YYYY-MM-DD), accepted by Lighthouse
            let dob = this.verificationInformation.dateOfBirth;
            dob = `${dob.split('/')[2]}-${dob.split('/')[0]}-${dob.split('/')[1]}`;
            // build the Lighthouse API request body to be passed in, and perform a POST to it with the appropriate information
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
                }
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
            // throw an error for status codes that are not 200
            const errorMessage = `Unexpected error while calling the Lighthouse API, with status ${verificationResponse.status}, and response ${verificationResponse.data}`;
            console.log(errorMessage);
            throw new Error(errorMessage);
        }
        catch (err) {
            const errorMessage = `Unexpected error while verifying military status ${err}`;
            console.log(errorMessage);
            throw new Error(errorMessage);
        }
    }
}
exports.VAClient = VAClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkFDbGllbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL2NsaWVudHMvVkFDbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsK0RBQXFIO0FBQ3JILDZEQUF3RDtBQUN4RCxrREFBMEI7QUFFMUI7O0dBRUc7QUFDSCxNQUFhLFFBQVMsU0FBUSx1Q0FBa0I7SUFDNUM7OztPQUdHO0lBQ2MsdUJBQXVCLENBQWtDO0lBRTFFOzs7Ozs7O09BT0c7SUFDSCxZQUFZLHVCQUF3RCxFQUFFLFdBQW1CLEVBQUUsTUFBYztRQUNyRyxLQUFLLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBRTNCLElBQUksQ0FBQyx1QkFBdUIsR0FBRyx1QkFBdUIsQ0FBQztJQUMzRCxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxLQUFLLENBQUMsTUFBTTtRQUNSLElBQUk7WUFDQSxzR0FBc0c7WUFDdEcsTUFBTSxDQUFDLGlCQUFpQixFQUFFLGdCQUFnQixDQUFDLEdBQUcsTUFBTSxLQUFLLENBQUMsMEJBQTBCLENBQUMsMkJBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1lBRXhJLDRFQUE0RTtZQUM1RSxJQUFJLGlCQUFpQixLQUFLLElBQUksSUFBSSxpQkFBaUIsQ0FBQyxNQUFNLEtBQUssQ0FBQztnQkFDNUQsZ0JBQWdCLEtBQUssSUFBSSxJQUFJLGdCQUFnQixDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQzVELE1BQU0sSUFBSSxLQUFLLENBQUMsMEJBQTBCLENBQUMsQ0FBQzthQUMvQztZQUVELDZGQUE2RjtZQUM3RixJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUMsV0FBVyxDQUFDO1lBQ25ELEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFFdkUsbUhBQW1IO1lBQ25ILE1BQU0sb0JBQW9CLEdBQUcsTUFBTSxlQUFLLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFO2dCQUM3RCxTQUFTLEVBQUUsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFNBQVM7Z0JBQ2pELFFBQVEsRUFBRSxJQUFJLENBQUMsdUJBQXVCLENBQUMsUUFBUTtnQkFDL0MsU0FBUyxFQUFFLEdBQUc7Z0JBQ2Qsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFdBQVc7Z0JBQzVELElBQUksRUFBRSxJQUFJLENBQUMsdUJBQXVCLENBQUMsSUFBSTtnQkFDdkMsS0FBSyxFQUFFLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxLQUFLO2dCQUN6QyxPQUFPLEVBQUUsSUFBSSxDQUFDLHVCQUF1QixDQUFDLE9BQU87Z0JBQzdDLE9BQU8sRUFBRSxLQUFLO2FBQ2pCLEVBQUU7Z0JBQ0MsT0FBTyxFQUFFO29CQUNMLGNBQWMsRUFBRSxrQkFBa0I7b0JBQ2xDLFFBQVEsRUFBRSxnQkFBZ0I7aUJBQzdCO2FBQ0osQ0FBQyxDQUFDO1lBRUgsMERBQTBEO1lBQzFELElBQUksb0JBQW9CLENBQUMsTUFBTSxLQUFLLEdBQUcsRUFBRTtnQkFDckMsSUFBSSxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxXQUFXLEVBQUU7b0JBQzdELE9BQU8sZ0RBQThCLENBQUMsUUFBUSxDQUFDO2lCQUNsRDtxQkFBTTtvQkFDSCxPQUFPLGdEQUE4QixDQUFDLE9BQU8sQ0FBQztpQkFDakQ7YUFDSjtZQUVELG1EQUFtRDtZQUNuRCxNQUFNLFlBQVksR0FBRyxrRUFBa0Usb0JBQW9CLENBQUMsTUFBTSxrQkFBa0Isb0JBQW9CLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDaEssT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUUxQixNQUFNLElBQUksS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO1NBQ2pDO1FBQUMsT0FBTyxHQUFHLEVBQUU7WUFDVixNQUFNLFlBQVksR0FBRyxvREFBb0QsR0FBRyxFQUFFLENBQUM7WUFDL0UsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUUxQixNQUFNLElBQUksS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO1NBQ2pDO0lBQ0wsQ0FBQztDQUNKO0FBaEZELDRCQWdGQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q29uc3RhbnRzLCBNaWxpdGFyeVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uLCBNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1R5cGV9IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5pbXBvcnQge1ZlcmlmaWNhdGlvbkNsaWVudH0gZnJvbSBcIi4vVmVyaWZpY2F0aW9uQ2xpZW50XCI7XG5pbXBvcnQgYXhpb3MgZnJvbSBcImF4aW9zXCI7XG5cbi8qKlxuICogQ2xhc3MgdXNlZCBhcyB0aGUgYmFzZS9nZW5lcmljIGNsaWVudCBmb3IgYWxsIFZBIExpZ2h0aG91c2UgdmVyaWZpY2F0aW9uIGNhbGxzLlxuICovXG5leHBvcnQgY2xhc3MgVkFDbGllbnQgZXh0ZW5kcyBWZXJpZmljYXRpb25DbGllbnQge1xuICAgIC8qKlxuICAgICAqIFRoZSB2ZXJpZmljYXRpb24gaW5mb3JtYXRpb24gcHJvdmlkZWQgYnkgdGhlIGN1c3RvbWVyLCB3aGljaCB0aGV5IHdpbGxcbiAgICAgKiBnZXQgdmVyaWZpZWQgdXBvbi5cbiAgICAgKi9cbiAgICBwcml2YXRlIHJlYWRvbmx5IHZlcmlmaWNhdGlvbkluZm9ybWF0aW9uOiBNaWxpdGFyeVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uO1xuXG4gICAgLyoqXG4gICAgICogR2VuZXJpYyBjb25zdHJ1Y3RvciBmb3IgdGhlIHZlcmlmaWNhdGlvbiBjbGllbnQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gdmVyaWZpY2F0aW9uSW5mb3JtYXRpb24gdmVyaWZpY2F0aW9uIGluZm9ybWF0aW9uIHByb3ZpZGVkIGJ5IHRoZVxuICAgICAqIGN1c3RvbWVyLlxuICAgICAqIEBwYXJhbSByZWdpb24gdGhlIEFXUyByZWdpb24gcGFzc2VkIGluIGZyb20gdGhlIExhbWJkYSByZXNvbHZlci5cbiAgICAgKiBAcGFyYW0gZW52aXJvbm1lbnQgdGhlIEFXUyBlbnZpcm9ubWVudCBwYXNzZWQgaW4gZnJvbSB0aGUgTGFtYmRhIHJlc29sdmVyLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHZlcmlmaWNhdGlvbkluZm9ybWF0aW9uOiBNaWxpdGFyeVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uLCBlbnZpcm9ubWVudDogc3RyaW5nLCByZWdpb246IHN0cmluZykge1xuICAgICAgICBzdXBlcihyZWdpb24sIGVudmlyb25tZW50KTtcblxuICAgICAgICB0aGlzLnZlcmlmaWNhdGlvbkluZm9ybWF0aW9uID0gdmVyaWZpY2F0aW9uSW5mb3JtYXRpb247XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdXNlZCB0byB2ZXJpZnkgYW4gaW5kaXZpZHVhbHMgbWlsaXRhcnkgc2VydmljZSBzdGF0dXMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIGEge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1R5cGV9IHJlcHJlc2VudGluZyB0aGVcbiAgICAgKiBtaWxpdGFyeSB2ZXJpZmljYXRpb24gc3RhdHVzIG9idGFpbmVkIGZyb20gdGhlIGNsaWVudCB2ZXJpZmljYXRpb24gY2FsbFxuICAgICAqL1xuICAgIGFzeW5jIHZlcmlmeSgpOiBQcm9taXNlPE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIEFQSSBLZXkgYW5kIEJhc2UgVVJMLCBuZWVkZWQgaW4gb3JkZXIgdG8gbWFrZSB0aGUgdmVyaWZpY2F0aW9uIGNhbGwgdGhyb3VnaCB0aGUgY2xpZW50XG4gICAgICAgICAgICBjb25zdCBbbGlnaHRob3VzZUJhc2VVUkwsIGxpZ2h0aG91c2VBUElLZXldID0gYXdhaXQgc3VwZXIucmV0cmlldmVTZXJ2aWNlQ3JlZGVudGlhbHMoQ29uc3RhbnRzLkFXU1BhaXJDb25zdGFudHMuTElHSFRIT1VTRV9TRUNSRVRfTkFNRSk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB3ZSBvYnRhaW5lZCBhbnkgaW52YWxpZCBzZWNyZXQgdmFsdWVzIGZyb20gdGhlIGNhbGwgYWJvdmVcbiAgICAgICAgICAgIGlmIChsaWdodGhvdXNlQmFzZVVSTCA9PT0gbnVsbCB8fCBsaWdodGhvdXNlQmFzZVVSTC5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBsaWdodGhvdXNlQVBJS2V5ID09PSBudWxsIHx8IGxpZ2h0aG91c2VBUElLZXkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBpbnZhbGlkIHNlY3JldHMgb2J0YWluZWRgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gY29udmVydCB0aGUgZGF0ZSBvZiBiaXJ0aCBpbnRvIHRoZSBhcHByb3ByaWF0ZSBmb3JtYXQgKFlZWVktTU0tREQpLCBhY2NlcHRlZCBieSBMaWdodGhvdXNlXG4gICAgICAgICAgICBsZXQgZG9iID0gdGhpcy52ZXJpZmljYXRpb25JbmZvcm1hdGlvbi5kYXRlT2ZCaXJ0aDtcbiAgICAgICAgICAgIGRvYiA9IGAke2RvYi5zcGxpdCgnLycpWzJdfS0ke2RvYi5zcGxpdCgnLycpWzBdfS0ke2RvYi5zcGxpdCgnLycpWzFdfWA7XG5cbiAgICAgICAgICAgIC8vIGJ1aWxkIHRoZSBMaWdodGhvdXNlIEFQSSByZXF1ZXN0IGJvZHkgdG8gYmUgcGFzc2VkIGluLCBhbmQgcGVyZm9ybSBhIFBPU1QgdG8gaXQgd2l0aCB0aGUgYXBwcm9wcmlhdGUgaW5mb3JtYXRpb25cbiAgICAgICAgICAgIGNvbnN0IHZlcmlmaWNhdGlvblJlc3BvbnNlID0gYXdhaXQgYXhpb3MucG9zdChsaWdodGhvdXNlQmFzZVVSTCwge1xuICAgICAgICAgICAgICAgIGZpcnN0TmFtZTogdGhpcy52ZXJpZmljYXRpb25JbmZvcm1hdGlvbi5maXJzdE5hbWUsXG4gICAgICAgICAgICAgICAgbGFzdE5hbWU6IHRoaXMudmVyaWZpY2F0aW9uSW5mb3JtYXRpb24ubGFzdE5hbWUsXG4gICAgICAgICAgICAgICAgYmlydGhEYXRlOiBkb2IsXG4gICAgICAgICAgICAgICAgc3RyZWV0QWRkcmVzc0xpbmUxOiB0aGlzLnZlcmlmaWNhdGlvbkluZm9ybWF0aW9uLmFkZHJlc3NMaW5lLFxuICAgICAgICAgICAgICAgIGNpdHk6IHRoaXMudmVyaWZpY2F0aW9uSW5mb3JtYXRpb24uY2l0eSxcbiAgICAgICAgICAgICAgICBzdGF0ZTogdGhpcy52ZXJpZmljYXRpb25JbmZvcm1hdGlvbi5zdGF0ZSxcbiAgICAgICAgICAgICAgICB6aXBDb2RlOiB0aGlzLnZlcmlmaWNhdGlvbkluZm9ybWF0aW9uLnppcENvZGUsXG4gICAgICAgICAgICAgICAgY291bnRyeTogXCJVU0FcIlxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiYXBpS2V5XCI6IGxpZ2h0aG91c2VBUElLZXlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gY2hlY2sgdGhlIHN0YXR1cyBvZiB0aGUgcmVzcG9uc2UsIGFuZCBhY3QgYXBwcm9wcmlhdGVseVxuICAgICAgICAgICAgaWYgKHZlcmlmaWNhdGlvblJlc3BvbnNlLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgaWYgKHZlcmlmaWNhdGlvblJlc3BvbnNlLmRhdGFbXCJ2ZXRlcmFuX3N0YXR1c1wiXSA9PT0gXCJjb25maXJtZWRcIikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNUeXBlLlZlcmlmaWVkO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1R5cGUuUGVuZGluZztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHRocm93IGFuIGVycm9yIGZvciBzdGF0dXMgY29kZXMgdGhhdCBhcmUgbm90IDIwMFxuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgY2FsbGluZyB0aGUgTGlnaHRob3VzZSBBUEksIHdpdGggc3RhdHVzICR7dmVyaWZpY2F0aW9uUmVzcG9uc2Uuc3RhdHVzfSwgYW5kIHJlc3BvbnNlICR7dmVyaWZpY2F0aW9uUmVzcG9uc2UuZGF0YX1gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yTWVzc2FnZSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgdmVyaWZ5aW5nIG1pbGl0YXJ5IHN0YXR1cyAke2Vycn1gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yTWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=