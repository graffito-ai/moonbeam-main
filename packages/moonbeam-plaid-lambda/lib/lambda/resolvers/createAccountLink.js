"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAccountLink = void 0;
const AWS = __importStar(require("aws-sdk"));
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const plaid_1 = require("plaid");
/**
 * CreateAccountLink resolver
 *
 * @param createAccountLinkInput object to be used for linking a user with Plaid
 * @returns {@link Promise} of {@link ReferralResponse}
 */
const createAccountLink = async (createAccountLinkInput) => {
    // initializing the DynamoDB document client
    const docClient = new AWS.DynamoDB.DocumentClient();
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        // initializing the AWS Secrets Manager client
        const secretsClient = new AWS.SecretsManager({
            region: region,
        });
        // retrieve the Plaid related secrets for Moonbeam, depending on the current region and environment
        const plaidPair = await secretsClient
            .getSecretValue({ SecretId: `${moonbeam_models_1.Constants.AWSPairConstants.PLAID_SECRET_NAME}-${process.env.ENV_NAME}-${region}` }).promise();
        if (plaidPair.SecretString) {
            // convert the retrieved secrets pair value, as a JSON object
            const plaidPairAsJson = JSON.parse(plaidPair.SecretString);
            // filter out the necessary Plaid credentials
            const plaidClientId = plaidPairAsJson[moonbeam_models_1.Constants.AWSPairConstants.PLAID_CLIENT_ID];
            const plaidSecret = plaidPairAsJson[moonbeam_models_1.Constants.AWSPairConstants.PLAID_SECRET];
            // use the Plaid library, in order to initialize a Plaid client
            const plaidConfig = new plaid_1.Configuration({
                basePath: plaid_1.PlaidEnvironments.sandbox,
                baseOptions: {
                    headers: {
                        [moonbeam_models_1.Constants.AWSPairConstants.PLAID_CLIENT_ID]: plaidClientId,
                        [moonbeam_models_1.Constants.AWSPairConstants.PLAID_SECRET]: plaidSecret,
                    },
                },
            });
            const plaidClient = new plaid_1.PlaidApi(plaidConfig);
            // call the Plaid API to create a Link Token
            const createTokenResponse = await plaidClient.linkTokenCreate({
                user: {
                    client_user_id: createAccountLinkInput.id,
                },
                client_name: 'Moonbeam',
                products: [plaid_1.Products.Auth],
                language: 'en',
                country_codes: [plaid_1.CountryCode.Us],
            });
            // create the account link details object to return and store
            const accountLinkDetails = {
                id: createAccountLinkInput.id,
                linkToken: createTokenResponse.data.link_token,
                requestId: createTokenResponse.data.request_id,
                userEmail: createAccountLinkInput.userEmail,
                userName: createAccountLinkInput.userName
            };
            // store the account link object
            await docClient.put({
                TableName: process.env.ACCOUNT_LINKS,
                Item: accountLinkDetails
            }).promise();
            // return the account link object
            return {
                data: accountLinkDetails
            };
        }
        else {
            console.log(`Unexpected error while retrieving secrets for Plaid {}`, plaidPair);
            return {
                errorMessage: `Unexpected error while executing createAccountLink mutation.`,
                errorType: moonbeam_models_1.LinkErrorType.UnexpectedError
            };
        }
    }
    catch (err) {
        console.log(`Unexpected error while executing createAccountLink mutation {}`, err);
        return {
            errorMessage: `Unexpected error while executing createAccountLink mutation. ${err}`,
            errorType: moonbeam_models_1.LinkErrorType.UnexpectedError
        };
    }
};
exports.createAccountLink = createAccountLink;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlQWNjb3VudExpbmsuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL3Jlc29sdmVycy9jcmVhdGVBY2NvdW50TGluay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDZDQUErQjtBQUMvQiwrREFPbUM7QUFDbkMsaUNBQXdGO0FBRXhGOzs7OztHQUtHO0FBQ0ksTUFBTSxpQkFBaUIsR0FBRyxLQUFLLEVBQUUsc0JBQThDLEVBQWdDLEVBQUU7SUFDcEgsNENBQTRDO0lBQzVDLE1BQU0sU0FBUyxHQUFHLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsQ0FBQztJQUVwRCxJQUFJO1FBQ0EseUNBQXlDO1FBQ3pDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVyxDQUFDO1FBRXZDLDhDQUE4QztRQUM5QyxNQUFNLGFBQWEsR0FBRyxJQUFJLEdBQUcsQ0FBQyxjQUFjLENBQUM7WUFDekMsTUFBTSxFQUFFLE1BQU07U0FDakIsQ0FBQyxDQUFDO1FBRUgsbUdBQW1HO1FBQ25HLE1BQU0sU0FBUyxHQUFHLE1BQU0sYUFBYTthQUNoQyxjQUFjLENBQUMsRUFBQyxRQUFRLEVBQUUsR0FBRywyQkFBUyxDQUFDLGdCQUFnQixDQUFDLGlCQUFpQixJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUyxJQUFJLE1BQU0sRUFBRSxFQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNoSSxJQUFJLFNBQVMsQ0FBQyxZQUFZLEVBQUU7WUFDeEIsNkRBQTZEO1lBQzdELE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLFlBQWEsQ0FBQyxDQUFDO1lBRTVELDZDQUE2QztZQUM3QyxNQUFNLGFBQWEsR0FBRyxlQUFlLENBQUMsMkJBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUNsRixNQUFNLFdBQVcsR0FBRyxlQUFlLENBQUMsMkJBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUU3RSwrREFBK0Q7WUFDL0QsTUFBTSxXQUFXLEdBQUcsSUFBSSxxQkFBYSxDQUFDO2dCQUNsQyxRQUFRLEVBQUUseUJBQWlCLENBQUMsT0FBTztnQkFDbkMsV0FBVyxFQUFFO29CQUNULE9BQU8sRUFBRTt3QkFDTCxDQUFDLDJCQUFTLENBQUMsZ0JBQWdCLENBQUMsZUFBZSxDQUFDLEVBQUUsYUFBYTt3QkFDM0QsQ0FBQywyQkFBUyxDQUFDLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxFQUFFLFdBQVc7cUJBQ3pEO2lCQUNKO2FBQ0osQ0FBQyxDQUFDO1lBQ0gsTUFBTSxXQUFXLEdBQUcsSUFBSSxnQkFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBRTlDLDRDQUE0QztZQUM1QyxNQUFNLG1CQUFtQixHQUFHLE1BQU0sV0FBVyxDQUFDLGVBQWUsQ0FBQztnQkFDMUQsSUFBSSxFQUFFO29CQUNGLGNBQWMsRUFBRSxzQkFBc0IsQ0FBQyxFQUFFO2lCQUM1QztnQkFDRCxXQUFXLEVBQUUsVUFBVTtnQkFDdkIsUUFBUSxFQUFFLENBQUMsZ0JBQVEsQ0FBQyxJQUFJLENBQUM7Z0JBQ3pCLFFBQVEsRUFBRSxJQUFJO2dCQUNkLGFBQWEsRUFBRSxDQUFDLG1CQUFXLENBQUMsRUFBRSxDQUFDO2FBQ2xDLENBQUMsQ0FBQztZQUVILDZEQUE2RDtZQUM3RCxNQUFNLGtCQUFrQixHQUF1QjtnQkFDM0MsRUFBRSxFQUFFLHNCQUFzQixDQUFDLEVBQUU7Z0JBQzdCLFNBQVMsRUFBRSxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsVUFBVTtnQkFDOUMsU0FBUyxFQUFFLG1CQUFtQixDQUFDLElBQUksQ0FBQyxVQUFVO2dCQUM5QyxTQUFTLEVBQUUsc0JBQXNCLENBQUMsU0FBUztnQkFDM0MsUUFBUSxFQUFFLHNCQUFzQixDQUFDLFFBQVE7YUFDNUMsQ0FBQTtZQUVELGdDQUFnQztZQUNoQyxNQUFNLFNBQVMsQ0FBQyxHQUFHLENBQUM7Z0JBQ2hCLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWM7Z0JBQ3JDLElBQUksRUFBRSxrQkFBa0I7YUFDM0IsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBRWIsaUNBQWlDO1lBQ2pDLE9BQU87Z0JBQ0gsSUFBSSxFQUFFLGtCQUFrQjthQUMzQixDQUFBO1NBQ0o7YUFBTTtZQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsd0RBQXdELEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDakYsT0FBTztnQkFDSCxZQUFZLEVBQUUsOERBQThEO2dCQUM1RSxTQUFTLEVBQUUsK0JBQWEsQ0FBQyxlQUFlO2FBQzNDLENBQUM7U0FDTDtLQUNKO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDVixPQUFPLENBQUMsR0FBRyxDQUFDLGdFQUFnRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ25GLE9BQU87WUFDSCxZQUFZLEVBQUUsZ0VBQWdFLEdBQUcsRUFBRTtZQUNuRixTQUFTLEVBQUUsK0JBQWEsQ0FBQyxlQUFlO1NBQzNDLENBQUM7S0FDTDtBQUNMLENBQUMsQ0FBQTtBQWhGWSxRQUFBLGlCQUFpQixxQkFnRjdCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgQVdTIGZyb20gJ2F3cy1zZGsnO1xuaW1wb3J0IHtcbiAgICBBY2NvdW50TGlua0RldGFpbHMsXG4gICAgQWNjb3VudExpbmtSZXNwb25zZSxcbiAgICBDb25zdGFudHMsXG4gICAgQ3JlYXRlQWNjb3VudExpbmtJbnB1dCxcbiAgICBMaW5rRXJyb3JUeXBlLFxuICAgIFJlZmVycmFsUmVzcG9uc2Vcbn0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcbmltcG9ydCB7Q29uZmlndXJhdGlvbiwgQ291bnRyeUNvZGUsIFBsYWlkQXBpLCBQbGFpZEVudmlyb25tZW50cywgUHJvZHVjdHN9IGZyb20gJ3BsYWlkJztcblxuLyoqXG4gKiBDcmVhdGVBY2NvdW50TGluayByZXNvbHZlclxuICpcbiAqIEBwYXJhbSBjcmVhdGVBY2NvdW50TGlua0lucHV0IG9iamVjdCB0byBiZSB1c2VkIGZvciBsaW5raW5nIGEgdXNlciB3aXRoIFBsYWlkXG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIFJlZmVycmFsUmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCBjcmVhdGVBY2NvdW50TGluayA9IGFzeW5jIChjcmVhdGVBY2NvdW50TGlua0lucHV0OiBDcmVhdGVBY2NvdW50TGlua0lucHV0KTogUHJvbWlzZTxBY2NvdW50TGlua1Jlc3BvbnNlPiA9PiB7XG4gICAgLy8gaW5pdGlhbGl6aW5nIHRoZSBEeW5hbW9EQiBkb2N1bWVudCBjbGllbnRcbiAgICBjb25zdCBkb2NDbGllbnQgPSBuZXcgQVdTLkR5bmFtb0RCLkRvY3VtZW50Q2xpZW50KCk7XG5cbiAgICB0cnkge1xuICAgICAgICAvLyByZXRyaWV2aW5nIHRoZSBjdXJyZW50IGZ1bmN0aW9uIHJlZ2lvblxuICAgICAgICBjb25zdCByZWdpb24gPSBwcm9jZXNzLmVudi5BV1NfUkVHSU9OITtcblxuICAgICAgICAvLyBpbml0aWFsaXppbmcgdGhlIEFXUyBTZWNyZXRzIE1hbmFnZXIgY2xpZW50XG4gICAgICAgIGNvbnN0IHNlY3JldHNDbGllbnQgPSBuZXcgQVdTLlNlY3JldHNNYW5hZ2VyKHtcbiAgICAgICAgICAgIHJlZ2lvbjogcmVnaW9uLFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyByZXRyaWV2ZSB0aGUgUGxhaWQgcmVsYXRlZCBzZWNyZXRzIGZvciBNb29uYmVhbSwgZGVwZW5kaW5nIG9uIHRoZSBjdXJyZW50IHJlZ2lvbiBhbmQgZW52aXJvbm1lbnRcbiAgICAgICAgY29uc3QgcGxhaWRQYWlyID0gYXdhaXQgc2VjcmV0c0NsaWVudFxuICAgICAgICAgICAgLmdldFNlY3JldFZhbHVlKHtTZWNyZXRJZDogYCR7Q29uc3RhbnRzLkFXU1BhaXJDb25zdGFudHMuUExBSURfU0VDUkVUX05BTUV9LSR7cHJvY2Vzcy5lbnYuRU5WX05BTUUhfS0ke3JlZ2lvbn1gfSkucHJvbWlzZSgpO1xuICAgICAgICBpZiAocGxhaWRQYWlyLlNlY3JldFN0cmluZykge1xuICAgICAgICAgICAgLy8gY29udmVydCB0aGUgcmV0cmlldmVkIHNlY3JldHMgcGFpciB2YWx1ZSwgYXMgYSBKU09OIG9iamVjdFxuICAgICAgICAgICAgY29uc3QgcGxhaWRQYWlyQXNKc29uID0gSlNPTi5wYXJzZShwbGFpZFBhaXIuU2VjcmV0U3RyaW5nISk7XG5cbiAgICAgICAgICAgIC8vIGZpbHRlciBvdXQgdGhlIG5lY2Vzc2FyeSBQbGFpZCBjcmVkZW50aWFsc1xuICAgICAgICAgICAgY29uc3QgcGxhaWRDbGllbnRJZCA9IHBsYWlkUGFpckFzSnNvbltDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5QTEFJRF9DTElFTlRfSURdO1xuICAgICAgICAgICAgY29uc3QgcGxhaWRTZWNyZXQgPSBwbGFpZFBhaXJBc0pzb25bQ29uc3RhbnRzLkFXU1BhaXJDb25zdGFudHMuUExBSURfU0VDUkVUXTtcblxuICAgICAgICAgICAgLy8gdXNlIHRoZSBQbGFpZCBsaWJyYXJ5LCBpbiBvcmRlciB0byBpbml0aWFsaXplIGEgUGxhaWQgY2xpZW50XG4gICAgICAgICAgICBjb25zdCBwbGFpZENvbmZpZyA9IG5ldyBDb25maWd1cmF0aW9uKHtcbiAgICAgICAgICAgICAgICBiYXNlUGF0aDogUGxhaWRFbnZpcm9ubWVudHMuc2FuZGJveCwgLy8gdGhpcyBuZWVkcyB0byBjaGFuZ2UgaW4gdGhlIGZ1dHVyZSBkZXBlbmRpbmcgb24gdGhlIGVudmlyb25tZW50XG4gICAgICAgICAgICAgICAgYmFzZU9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgW0NvbnN0YW50cy5BV1NQYWlyQ29uc3RhbnRzLlBMQUlEX0NMSUVOVF9JRF06IHBsYWlkQ2xpZW50SWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBbQ29uc3RhbnRzLkFXU1BhaXJDb25zdGFudHMuUExBSURfU0VDUkVUXTogcGxhaWRTZWNyZXQsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29uc3QgcGxhaWRDbGllbnQgPSBuZXcgUGxhaWRBcGkocGxhaWRDb25maWcpO1xuXG4gICAgICAgICAgICAvLyBjYWxsIHRoZSBQbGFpZCBBUEkgdG8gY3JlYXRlIGEgTGluayBUb2tlblxuICAgICAgICAgICAgY29uc3QgY3JlYXRlVG9rZW5SZXNwb25zZSA9IGF3YWl0IHBsYWlkQ2xpZW50LmxpbmtUb2tlbkNyZWF0ZSh7XG4gICAgICAgICAgICAgICAgdXNlcjoge1xuICAgICAgICAgICAgICAgICAgICBjbGllbnRfdXNlcl9pZDogY3JlYXRlQWNjb3VudExpbmtJbnB1dC5pZCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNsaWVudF9uYW1lOiAnTW9vbmJlYW0nLFxuICAgICAgICAgICAgICAgIHByb2R1Y3RzOiBbUHJvZHVjdHMuQXV0aF0sXG4gICAgICAgICAgICAgICAgbGFuZ3VhZ2U6ICdlbicsXG4gICAgICAgICAgICAgICAgY291bnRyeV9jb2RlczogW0NvdW50cnlDb2RlLlVzXSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBjcmVhdGUgdGhlIGFjY291bnQgbGluayBkZXRhaWxzIG9iamVjdCB0byByZXR1cm4gYW5kIHN0b3JlXG4gICAgICAgICAgICBjb25zdCBhY2NvdW50TGlua0RldGFpbHM6IEFjY291bnRMaW5rRGV0YWlscyA9IHtcbiAgICAgICAgICAgICAgICBpZDogY3JlYXRlQWNjb3VudExpbmtJbnB1dC5pZCxcbiAgICAgICAgICAgICAgICBsaW5rVG9rZW46IGNyZWF0ZVRva2VuUmVzcG9uc2UuZGF0YS5saW5rX3Rva2VuLFxuICAgICAgICAgICAgICAgIHJlcXVlc3RJZDogY3JlYXRlVG9rZW5SZXNwb25zZS5kYXRhLnJlcXVlc3RfaWQsXG4gICAgICAgICAgICAgICAgdXNlckVtYWlsOiBjcmVhdGVBY2NvdW50TGlua0lucHV0LnVzZXJFbWFpbCxcbiAgICAgICAgICAgICAgICB1c2VyTmFtZTogY3JlYXRlQWNjb3VudExpbmtJbnB1dC51c2VyTmFtZVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBzdG9yZSB0aGUgYWNjb3VudCBsaW5rIG9iamVjdFxuICAgICAgICAgICAgYXdhaXQgZG9jQ2xpZW50LnB1dCh7XG4gICAgICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5BQ0NPVU5UX0xJTktTISxcbiAgICAgICAgICAgICAgICBJdGVtOiBhY2NvdW50TGlua0RldGFpbHNcbiAgICAgICAgICAgIH0pLnByb21pc2UoKTtcblxuICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBhY2NvdW50IGxpbmsgb2JqZWN0XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRhdGE6IGFjY291bnRMaW5rRGV0YWlsc1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgcmV0cmlldmluZyBzZWNyZXRzIGZvciBQbGFpZCB7fWAsIHBsYWlkUGFpcik7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgZXhlY3V0aW5nIGNyZWF0ZUFjY291bnRMaW5rIG11dGF0aW9uLmAsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBMaW5rRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zb2xlLmxvZyhgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgY3JlYXRlQWNjb3VudExpbmsgbXV0YXRpb24ge31gLCBlcnIpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgY3JlYXRlQWNjb3VudExpbmsgbXV0YXRpb24uICR7ZXJyfWAsXG4gICAgICAgICAgICBlcnJvclR5cGU6IExpbmtFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgIH07XG4gICAgfVxufVxuIl19