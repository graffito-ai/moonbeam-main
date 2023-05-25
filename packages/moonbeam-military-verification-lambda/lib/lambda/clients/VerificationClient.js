"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationClient = void 0;
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const client_secrets_manager_1 = require("@aws-sdk/client-secrets-manager");
/**
 * Class used as the base/generic client for all verification clients that
 * we will be connecting to.
 */
class VerificationClient {
    // The Secrets Manager client, to be used while retrieving secrets related to clients.
    secretsClient;
    // The AWS region that the verification client will be initialized in
    region;
    // The AWS environment that the verification client will be initialized in
    environment;
    /**
     * Generic constructor for the verification client.
     *
     * @param region the AWS region passed in from the Lambda resolver.
     * @param environment the AWS environment passed in from the Lambda resolver.
     */
    constructor(region, environment) {
        this.region = region;
        this.environment = environment;
        this.secretsClient = new client_secrets_manager_1.SecretsManagerClient({ region: region });
    }
    /**
     * Function used to retrieve an API Key and a base URL, used by a verification client, through the
     * Secrets Manager client.
     *
     * @param verificationClientSecretsName the name of the verification client's secrets pair
     *
     * @return a {@link Promise} of a {@link string} pair, containing the baseURL and apiKey to be used
     */
    async retrieveServiceCredentials(verificationClientSecretsName) {
        try {
            // retrieve the secrets pair for the Verification client, depending on the current environment and region
            const verificationClientAPIPair = await this.secretsClient
                .send(new client_secrets_manager_1.GetSecretValueCommand(({ SecretId: `${verificationClientSecretsName}-${this.environment}-${this.region}` })));
            // check if the secrets for the verification Client exist
            if (verificationClientAPIPair.SecretString) {
                // convert the retrieved secrets pair value, as a JSON object
                const clientPairAsJson = JSON.parse(verificationClientAPIPair.SecretString);
                // filter out and set the necessary Verification Client API credentials, depending on the client secret name passed in
                switch (verificationClientSecretsName) {
                    case moonbeam_models_1.Constants.AWSPairConstants.QUANDIS_SECRET_NAME:
                        return [clientPairAsJson[moonbeam_models_1.Constants.AWSPairConstants.QUANDIS_BASE_URL], clientPairAsJson[moonbeam_models_1.Constants.AWSPairConstants.QUANDIS_API_KEY]];
                    case moonbeam_models_1.Constants.AWSPairConstants.LIGHTHOUSE_SECRET_NAME:
                        return [clientPairAsJson[moonbeam_models_1.Constants.AWSPairConstants.LIGHTHOUSE_BASE_URL], clientPairAsJson[moonbeam_models_1.Constants.AWSPairConstants.LIGHTHOUSE_API_KEY]];
                    default:
                        console.log(`Unknown verification client secrets name passed in ${verificationClientSecretsName}`);
                        return [null, null];
                }
            }
            else {
                console.log(`Verification client secrets pair not available for ${verificationClientSecretsName}, ${verificationClientAPIPair}`);
                return [null, null];
            }
        }
        catch (err) {
            const errorMessage = `Unexpected error while retrieving an API Key ${err}`;
            console.log(errorMessage);
            throw new Error(errorMessage);
        }
    }
}
exports.VerificationClient = VerificationClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmVyaWZpY2F0aW9uQ2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9jbGllbnRzL1ZlcmlmaWNhdGlvbkNsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwrREFBb0Y7QUFDcEYsNEVBQTRGO0FBRTVGOzs7R0FHRztBQUNILE1BQXNCLGtCQUFrQjtJQUNwQyxzRkFBc0Y7SUFDbkUsYUFBYSxDQUF1QjtJQUV2RCxxRUFBcUU7SUFDbEQsTUFBTSxDQUFTO0lBRWxDLDBFQUEwRTtJQUN2RCxXQUFXLENBQVM7SUFFdkM7Ozs7O09BS0c7SUFDSCxZQUFzQixNQUFjLEVBQUUsV0FBbUI7UUFDckQsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7UUFFL0IsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLDZDQUFvQixDQUFDLEVBQUMsTUFBTSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7SUFDcEUsQ0FBQztJQUVEOzs7Ozs7O09BT0c7SUFDTyxLQUFLLENBQUMsMEJBQTBCLENBQUMsNkJBQXFDO1FBQzVFLElBQUk7WUFDQSx5R0FBeUc7WUFDekcsTUFBTSx5QkFBeUIsR0FBRyxNQUFNLElBQUksQ0FBQyxhQUFhO2lCQUNyRCxJQUFJLENBQUMsSUFBSSw4Q0FBcUIsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFFLEdBQUcsNkJBQTZCLElBQUksSUFBSSxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUUxSCx5REFBeUQ7WUFDekQsSUFBSSx5QkFBeUIsQ0FBQyxZQUFZLEVBQUU7Z0JBQ3hDLDZEQUE2RDtnQkFDN0QsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLHlCQUF5QixDQUFDLFlBQWEsQ0FBQyxDQUFDO2dCQUU3RSxzSEFBc0g7Z0JBQ3RILFFBQVEsNkJBQTZCLEVBQUU7b0JBQ25DLEtBQUssMkJBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxtQkFBbUI7d0JBQy9DLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQywyQkFBUyxDQUFDLGdCQUFnQixDQUFDLGdCQUFnQixDQUFDLEVBQUUsZ0JBQWdCLENBQUMsMkJBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO29CQUN6SSxLQUFLLDJCQUFTLENBQUMsZ0JBQWdCLENBQUMsc0JBQXNCO3dCQUNsRCxPQUFPLENBQUMsZ0JBQWdCLENBQUMsMkJBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLGdCQUFnQixDQUFDLDJCQUFTLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO29CQUMvSTt3QkFDSSxPQUFPLENBQUMsR0FBRyxDQUFDLHNEQUFzRCw2QkFBNkIsRUFBRSxDQUFDLENBQUM7d0JBQ25HLE9BQU8sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7aUJBQzNCO2FBQ0o7aUJBQU07Z0JBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzREFBc0QsNkJBQTZCLEtBQUsseUJBQXlCLEVBQUUsQ0FBQyxDQUFDO2dCQUVqSSxPQUFPLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO2FBQ3ZCO1NBQ0o7UUFBQyxPQUFPLEdBQUcsRUFBRTtZQUNWLE1BQU0sWUFBWSxHQUFHLGdEQUFnRCxHQUFHLEVBQUUsQ0FBQztZQUMzRSxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRTFCLE1BQU0sSUFBSSxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7U0FDakM7SUFDTCxDQUFDO0NBU0o7QUF4RUQsZ0RBd0VDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDb25zdGFudHMsIE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZX0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcbmltcG9ydCB7R2V0U2VjcmV0VmFsdWVDb21tYW5kLCBTZWNyZXRzTWFuYWdlckNsaWVudH0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1zZWNyZXRzLW1hbmFnZXJcIjtcblxuLyoqXG4gKiBDbGFzcyB1c2VkIGFzIHRoZSBiYXNlL2dlbmVyaWMgY2xpZW50IGZvciBhbGwgdmVyaWZpY2F0aW9uIGNsaWVudHMgdGhhdFxuICogd2Ugd2lsbCBiZSBjb25uZWN0aW5nIHRvLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgVmVyaWZpY2F0aW9uQ2xpZW50IHtcbiAgICAvLyBUaGUgU2VjcmV0cyBNYW5hZ2VyIGNsaWVudCwgdG8gYmUgdXNlZCB3aGlsZSByZXRyaWV2aW5nIHNlY3JldHMgcmVsYXRlZCB0byBjbGllbnRzLlxuICAgIHByb3RlY3RlZCByZWFkb25seSBzZWNyZXRzQ2xpZW50OiBTZWNyZXRzTWFuYWdlckNsaWVudDtcblxuICAgIC8vIFRoZSBBV1MgcmVnaW9uIHRoYXQgdGhlIHZlcmlmaWNhdGlvbiBjbGllbnQgd2lsbCBiZSBpbml0aWFsaXplZCBpblxuICAgIHByb3RlY3RlZCByZWFkb25seSByZWdpb246IHN0cmluZztcblxuICAgIC8vIFRoZSBBV1MgZW52aXJvbm1lbnQgdGhhdCB0aGUgdmVyaWZpY2F0aW9uIGNsaWVudCB3aWxsIGJlIGluaXRpYWxpemVkIGluXG4gICAgcHJvdGVjdGVkIHJlYWRvbmx5IGVudmlyb25tZW50OiBzdHJpbmc7XG5cbiAgICAvKipcbiAgICAgKiBHZW5lcmljIGNvbnN0cnVjdG9yIGZvciB0aGUgdmVyaWZpY2F0aW9uIGNsaWVudC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSByZWdpb24gdGhlIEFXUyByZWdpb24gcGFzc2VkIGluIGZyb20gdGhlIExhbWJkYSByZXNvbHZlci5cbiAgICAgKiBAcGFyYW0gZW52aXJvbm1lbnQgdGhlIEFXUyBlbnZpcm9ubWVudCBwYXNzZWQgaW4gZnJvbSB0aGUgTGFtYmRhIHJlc29sdmVyLlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBjb25zdHJ1Y3RvcihyZWdpb246IHN0cmluZywgZW52aXJvbm1lbnQ6IHN0cmluZykge1xuICAgICAgICB0aGlzLnJlZ2lvbiA9IHJlZ2lvbjtcbiAgICAgICAgdGhpcy5lbnZpcm9ubWVudCA9IGVudmlyb25tZW50O1xuXG4gICAgICAgIHRoaXMuc2VjcmV0c0NsaWVudCA9IG5ldyBTZWNyZXRzTWFuYWdlckNsaWVudCh7cmVnaW9uOiByZWdpb259KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB1c2VkIHRvIHJldHJpZXZlIGFuIEFQSSBLZXkgYW5kIGEgYmFzZSBVUkwsIHVzZWQgYnkgYSB2ZXJpZmljYXRpb24gY2xpZW50LCB0aHJvdWdoIHRoZVxuICAgICAqIFNlY3JldHMgTWFuYWdlciBjbGllbnQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gdmVyaWZpY2F0aW9uQ2xpZW50U2VjcmV0c05hbWUgdGhlIG5hbWUgb2YgdGhlIHZlcmlmaWNhdGlvbiBjbGllbnQncyBzZWNyZXRzIHBhaXJcbiAgICAgKlxuICAgICAqIEByZXR1cm4gYSB7QGxpbmsgUHJvbWlzZX0gb2YgYSB7QGxpbmsgc3RyaW5nfSBwYWlyLCBjb250YWluaW5nIHRoZSBiYXNlVVJMIGFuZCBhcGlLZXkgdG8gYmUgdXNlZFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBhc3luYyByZXRyaWV2ZVNlcnZpY2VDcmVkZW50aWFscyh2ZXJpZmljYXRpb25DbGllbnRTZWNyZXRzTmFtZTogc3RyaW5nKTogUHJvbWlzZTxbc3RyaW5nIHwgbnVsbCwgc3RyaW5nIHwgbnVsbF0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBzZWNyZXRzIHBhaXIgZm9yIHRoZSBWZXJpZmljYXRpb24gY2xpZW50LCBkZXBlbmRpbmcgb24gdGhlIGN1cnJlbnQgZW52aXJvbm1lbnQgYW5kIHJlZ2lvblxuICAgICAgICAgICAgY29uc3QgdmVyaWZpY2F0aW9uQ2xpZW50QVBJUGFpciA9IGF3YWl0IHRoaXMuc2VjcmV0c0NsaWVudFxuICAgICAgICAgICAgICAgIC5zZW5kKG5ldyBHZXRTZWNyZXRWYWx1ZUNvbW1hbmQoKHtTZWNyZXRJZDogYCR7dmVyaWZpY2F0aW9uQ2xpZW50U2VjcmV0c05hbWV9LSR7dGhpcy5lbnZpcm9ubWVudH0tJHt0aGlzLnJlZ2lvbn1gfSkpKTtcblxuICAgICAgICAgICAgLy8gY2hlY2sgaWYgdGhlIHNlY3JldHMgZm9yIHRoZSB2ZXJpZmljYXRpb24gQ2xpZW50IGV4aXN0XG4gICAgICAgICAgICBpZiAodmVyaWZpY2F0aW9uQ2xpZW50QVBJUGFpci5TZWNyZXRTdHJpbmcpIHtcbiAgICAgICAgICAgICAgICAvLyBjb252ZXJ0IHRoZSByZXRyaWV2ZWQgc2VjcmV0cyBwYWlyIHZhbHVlLCBhcyBhIEpTT04gb2JqZWN0XG4gICAgICAgICAgICAgICAgY29uc3QgY2xpZW50UGFpckFzSnNvbiA9IEpTT04ucGFyc2UodmVyaWZpY2F0aW9uQ2xpZW50QVBJUGFpci5TZWNyZXRTdHJpbmchKTtcblxuICAgICAgICAgICAgICAgIC8vIGZpbHRlciBvdXQgYW5kIHNldCB0aGUgbmVjZXNzYXJ5IFZlcmlmaWNhdGlvbiBDbGllbnQgQVBJIGNyZWRlbnRpYWxzLCBkZXBlbmRpbmcgb24gdGhlIGNsaWVudCBzZWNyZXQgbmFtZSBwYXNzZWQgaW5cbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHZlcmlmaWNhdGlvbkNsaWVudFNlY3JldHNOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgQ29uc3RhbnRzLkFXU1BhaXJDb25zdGFudHMuUVVBTkRJU19TRUNSRVRfTkFNRTpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbY2xpZW50UGFpckFzSnNvbltDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5RVUFORElTX0JBU0VfVVJMXSwgY2xpZW50UGFpckFzSnNvbltDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5RVUFORElTX0FQSV9LRVldXTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5MSUdIVEhPVVNFX1NFQ1JFVF9OQU1FOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFtjbGllbnRQYWlyQXNKc29uW0NvbnN0YW50cy5BV1NQYWlyQ29uc3RhbnRzLkxJR0hUSE9VU0VfQkFTRV9VUkxdLCBjbGllbnRQYWlyQXNKc29uW0NvbnN0YW50cy5BV1NQYWlyQ29uc3RhbnRzLkxJR0hUSE9VU0VfQVBJX0tFWV1dO1xuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFVua25vd24gdmVyaWZpY2F0aW9uIGNsaWVudCBzZWNyZXRzIG5hbWUgcGFzc2VkIGluICR7dmVyaWZpY2F0aW9uQ2xpZW50U2VjcmV0c05hbWV9YCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gW251bGwsIG51bGxdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFZlcmlmaWNhdGlvbiBjbGllbnQgc2VjcmV0cyBwYWlyIG5vdCBhdmFpbGFibGUgZm9yICR7dmVyaWZpY2F0aW9uQ2xpZW50U2VjcmV0c05hbWV9LCAke3ZlcmlmaWNhdGlvbkNsaWVudEFQSVBhaXJ9YCk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gW251bGwsIG51bGxdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHJldHJpZXZpbmcgYW4gQVBJIEtleSAke2Vycn1gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yTWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB1c2VkIHRvIHZlcmlmeSBhbiBpbmRpdmlkdWFscyBtaWxpdGFyeSBzZXJ2aWNlIHN0YXR1cy5cbiAgICAgKlxuICAgICAqIEByZXR1cm4gYSB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZX0gcmVwcmVzZW50aW5nIHRoZVxuICAgICAqIG1pbGl0YXJ5IHZlcmlmaWNhdGlvbiBzdGF0dXMgb2J0YWluZWQgZnJvbSB0aGUgY2xpZW50IHZlcmlmaWNhdGlvbiBjYWxsXG4gICAgICovXG4gICAgYWJzdHJhY3QgdmVyaWZ5KCk6IFByb21pc2U8TWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNUeXBlPjtcbn1cbiJdfQ==