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
const api_1 = require("plaid/api");
const plaidUtils_1 = require("../utils/plaidUtils");
var MOONBEAM_DEPLOYMENT_BUCKET_NAME = moonbeam_models_1.Constants.MoonbeamConstants.MOONBEAM_DEPLOYMENT_BUCKET_NAME;
var MOONBEAM_PLAID_OAUTH_FILE_NAME = moonbeam_models_1.Constants.MoonbeamConstants.MOONBEAM_PLAID_OAUTH_FILE_NAME;
/**
 * CreateAccountLink resolver
 *
 * @param createAccountLinkInput object to be used for linking a user with Plaid
 * @returns {@link Promise} of {@link AccountLinkResponse}
 */
const createAccountLink = async (createAccountLinkInput) => {
    // initializing the DynamoDB document client
    const docClient = new AWS.DynamoDB.DocumentClient();
    try {
        // initialize the Plaid Utils
        const plaidUtils = await plaidUtils_1.PlaidUtils.setup();
        // call the Plaid API to create a Link Token
        const createTokenResponse = await plaidUtils.plaidClient.linkTokenCreate({
            user: {
                client_user_id: createAccountLinkInput.id,
            },
            client_name: 'Moonbeam',
            products: [plaid_1.Products.Auth],
            language: 'en',
            country_codes: [plaid_1.CountryCode.Us],
            account_filters: {
                depository: {
                    account_subtypes: [api_1.DepositoryAccountSubtype.Checking, api_1.DepositoryAccountSubtype.Savings]
                }
            },
            redirect_uri: `https://${MOONBEAM_DEPLOYMENT_BUCKET_NAME}-${process.env.ENV_NAME}-${process.env.AWS_REGION}.s3.${process.env.AWS_REGION}.amazonaws.com/${MOONBEAM_PLAID_OAUTH_FILE_NAME}-${process.env.ENV_NAME}.html`
        });
        // retrieve the account link object given the account link id (user id)
        const { Item } = await docClient.get({
            TableName: process.env.ACCOUNT_LINKS,
            Key: { id: createAccountLinkInput.id }
        }).promise();
        // create the account link object to return and store
        const createdAt = new Date().toISOString();
        const accountLink = {
            id: createAccountLinkInput.id,
            userEmail: createAccountLinkInput.userEmail,
            userName: createAccountLinkInput.userName,
            links: []
        };
        // if an account does not exist, then create a new account link object with a new link
        if (!Item) {
            accountLink.links.push({
                linkToken: createTokenResponse.data.link_token,
                requestId: createTokenResponse.data.request_id,
                createdAt: createdAt,
                updatedAt: createdAt
            });
        }
        else {
            // otherwise get the existing account and add a new link in it
            const retrievedAccountLink = Item;
            accountLink.links = [
                ...retrievedAccountLink.links,
                {
                    linkToken: createTokenResponse.data.link_token,
                    requestId: createTokenResponse.data.request_id,
                    createdAt: createdAt,
                    updatedAt: createdAt
                }
            ];
        }
        // store the account link object
        await docClient.put({
            TableName: process.env.ACCOUNT_LINKS,
            Item: accountLink
        }).promise();
        // return the account link object
        return {
            data: accountLink
        };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlQWNjb3VudExpbmsuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL3Jlc29sdmVycy9jcmVhdGVBY2NvdW50TGluay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDZDQUErQjtBQUMvQiwrREFNbUM7QUFDbkMsaUNBQTRDO0FBQzVDLG1DQUFtRDtBQUNuRCxvREFBK0M7QUFDL0MsSUFBTywrQkFBK0IsR0FBRywyQkFBUyxDQUFDLGlCQUFpQixDQUFDLCtCQUErQixDQUFDO0FBQ3JHLElBQU8sOEJBQThCLEdBQUcsMkJBQVMsQ0FBQyxpQkFBaUIsQ0FBQyw4QkFBOEIsQ0FBQztBQUVuRzs7Ozs7R0FLRztBQUNJLE1BQU0saUJBQWlCLEdBQUcsS0FBSyxFQUFFLHNCQUE4QyxFQUFnQyxFQUFFO0lBQ3BILDRDQUE0QztJQUM1QyxNQUFNLFNBQVMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLENBQUM7SUFFcEQsSUFBSTtRQUNBLDZCQUE2QjtRQUM3QixNQUFNLFVBQVUsR0FBRyxNQUFNLHVCQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7UUFFNUMsNENBQTRDO1FBQzVDLE1BQU0sbUJBQW1CLEdBQUcsTUFBTSxVQUFVLENBQUMsV0FBWSxDQUFDLGVBQWUsQ0FBQztZQUN0RSxJQUFJLEVBQUU7Z0JBQ0YsY0FBYyxFQUFFLHNCQUFzQixDQUFDLEVBQUU7YUFDNUM7WUFDRCxXQUFXLEVBQUUsVUFBVTtZQUN2QixRQUFRLEVBQUUsQ0FBQyxnQkFBUSxDQUFDLElBQUksQ0FBQztZQUN6QixRQUFRLEVBQUUsSUFBSTtZQUNkLGFBQWEsRUFBRSxDQUFDLG1CQUFXLENBQUMsRUFBRSxDQUFDO1lBQy9CLGVBQWUsRUFBRTtnQkFDYixVQUFVLEVBQUU7b0JBQ1IsZ0JBQWdCLEVBQUUsQ0FBQyw4QkFBd0IsQ0FBQyxRQUFRLEVBQUUsOEJBQXdCLENBQUMsT0FBTyxDQUFDO2lCQUMxRjthQUNKO1lBQ0QsWUFBWSxFQUFFLFdBQVcsK0JBQStCLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFTLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLGtCQUFrQiw4QkFBOEIsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVMsT0FBTztTQUM3TixDQUFDLENBQUM7UUFFSCx1RUFBdUU7UUFDdkUsTUFBTSxFQUFDLElBQUksRUFBQyxHQUFHLE1BQU0sU0FBUyxDQUFDLEdBQUcsQ0FBQztZQUMvQixTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFjO1lBQ3JDLEdBQUcsRUFBRSxFQUFDLEVBQUUsRUFBRSxzQkFBc0IsQ0FBQyxFQUFFLEVBQUM7U0FDdkMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBRWIscURBQXFEO1FBQ3JELE1BQU0sU0FBUyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDM0MsTUFBTSxXQUFXLEdBQWdCO1lBQzdCLEVBQUUsRUFBRSxzQkFBc0IsQ0FBQyxFQUFFO1lBQzdCLFNBQVMsRUFBRSxzQkFBc0IsQ0FBQyxTQUFTO1lBQzNDLFFBQVEsRUFBRSxzQkFBc0IsQ0FBQyxRQUFRO1lBQ3pDLEtBQUssRUFBRSxFQUFFO1NBQ1osQ0FBQztRQUVGLHNGQUFzRjtRQUN0RixJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ1AsV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7Z0JBQ25CLFNBQVMsRUFBRSxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsVUFBVTtnQkFDOUMsU0FBUyxFQUFFLG1CQUFtQixDQUFDLElBQUksQ0FBQyxVQUFVO2dCQUM5QyxTQUFTLEVBQUUsU0FBUztnQkFDcEIsU0FBUyxFQUFFLFNBQVM7YUFDdkIsQ0FBQyxDQUFDO1NBQ047YUFBTTtZQUNILDhEQUE4RDtZQUM5RCxNQUFNLG9CQUFvQixHQUFHLElBQW9CLENBQUM7WUFDbEQsV0FBVyxDQUFDLEtBQUssR0FBRztnQkFDaEIsR0FBRyxvQkFBb0IsQ0FBQyxLQUFLO2dCQUM3QjtvQkFDSSxTQUFTLEVBQUUsbUJBQW1CLENBQUMsSUFBSSxDQUFDLFVBQVU7b0JBQzlDLFNBQVMsRUFBRSxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsVUFBVTtvQkFDOUMsU0FBUyxFQUFFLFNBQVM7b0JBQ3BCLFNBQVMsRUFBRSxTQUFTO2lCQUN2QjthQUNKLENBQUE7U0FDSjtRQUVELGdDQUFnQztRQUNoQyxNQUFNLFNBQVMsQ0FBQyxHQUFHLENBQUM7WUFDaEIsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYztZQUNyQyxJQUFJLEVBQUUsV0FBVztTQUNwQixDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFYixpQ0FBaUM7UUFDakMsT0FBTztZQUNILElBQUksRUFBRSxXQUFXO1NBQ3BCLENBQUE7S0FDSjtJQUFDLE9BQ0csR0FBRyxFQUFFO1FBQ04sT0FBTyxDQUFDLEdBQUcsQ0FBQyxnRUFBZ0UsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNuRixPQUFPO1lBQ0gsWUFBWSxFQUFFLGdFQUFnRSxHQUFHLEVBQUU7WUFDbkYsU0FBUyxFQUFFLCtCQUFhLENBQUMsZUFBZTtTQUMzQyxDQUFDO0tBQ0w7QUFDTCxDQUFDLENBQUE7QUFoRlksUUFBQSxpQkFBaUIscUJBZ0Y3QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIEFXUyBmcm9tICdhd3Mtc2RrJztcbmltcG9ydCB7XG4gICAgQWNjb3VudExpbmssXG4gICAgQWNjb3VudExpbmtSZXNwb25zZSxcbiAgICBDb25zdGFudHMsXG4gICAgQ3JlYXRlQWNjb3VudExpbmtJbnB1dCxcbiAgICBMaW5rRXJyb3JUeXBlXG59IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5pbXBvcnQge0NvdW50cnlDb2RlLCBQcm9kdWN0c30gZnJvbSAncGxhaWQnO1xuaW1wb3J0IHtEZXBvc2l0b3J5QWNjb3VudFN1YnR5cGV9IGZyb20gXCJwbGFpZC9hcGlcIjtcbmltcG9ydCB7UGxhaWRVdGlsc30gZnJvbSBcIi4uL3V0aWxzL3BsYWlkVXRpbHNcIjtcbmltcG9ydCBNT09OQkVBTV9ERVBMT1lNRU5UX0JVQ0tFVF9OQU1FID0gQ29uc3RhbnRzLk1vb25iZWFtQ29uc3RhbnRzLk1PT05CRUFNX0RFUExPWU1FTlRfQlVDS0VUX05BTUU7XG5pbXBvcnQgTU9PTkJFQU1fUExBSURfT0FVVEhfRklMRV9OQU1FID0gQ29uc3RhbnRzLk1vb25iZWFtQ29uc3RhbnRzLk1PT05CRUFNX1BMQUlEX09BVVRIX0ZJTEVfTkFNRTtcblxuLyoqXG4gKiBDcmVhdGVBY2NvdW50TGluayByZXNvbHZlclxuICpcbiAqIEBwYXJhbSBjcmVhdGVBY2NvdW50TGlua0lucHV0IG9iamVjdCB0byBiZSB1c2VkIGZvciBsaW5raW5nIGEgdXNlciB3aXRoIFBsYWlkXG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIEFjY291bnRMaW5rUmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCBjcmVhdGVBY2NvdW50TGluayA9IGFzeW5jIChjcmVhdGVBY2NvdW50TGlua0lucHV0OiBDcmVhdGVBY2NvdW50TGlua0lucHV0KTogUHJvbWlzZTxBY2NvdW50TGlua1Jlc3BvbnNlPiA9PiB7XG4gICAgLy8gaW5pdGlhbGl6aW5nIHRoZSBEeW5hbW9EQiBkb2N1bWVudCBjbGllbnRcbiAgICBjb25zdCBkb2NDbGllbnQgPSBuZXcgQVdTLkR5bmFtb0RCLkRvY3VtZW50Q2xpZW50KCk7XG5cbiAgICB0cnkge1xuICAgICAgICAvLyBpbml0aWFsaXplIHRoZSBQbGFpZCBVdGlsc1xuICAgICAgICBjb25zdCBwbGFpZFV0aWxzID0gYXdhaXQgUGxhaWRVdGlscy5zZXR1cCgpO1xuXG4gICAgICAgIC8vIGNhbGwgdGhlIFBsYWlkIEFQSSB0byBjcmVhdGUgYSBMaW5rIFRva2VuXG4gICAgICAgIGNvbnN0IGNyZWF0ZVRva2VuUmVzcG9uc2UgPSBhd2FpdCBwbGFpZFV0aWxzLnBsYWlkQ2xpZW50IS5saW5rVG9rZW5DcmVhdGUoe1xuICAgICAgICAgICAgdXNlcjoge1xuICAgICAgICAgICAgICAgIGNsaWVudF91c2VyX2lkOiBjcmVhdGVBY2NvdW50TGlua0lucHV0LmlkLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNsaWVudF9uYW1lOiAnTW9vbmJlYW0nLFxuICAgICAgICAgICAgcHJvZHVjdHM6IFtQcm9kdWN0cy5BdXRoXSxcbiAgICAgICAgICAgIGxhbmd1YWdlOiAnZW4nLFxuICAgICAgICAgICAgY291bnRyeV9jb2RlczogW0NvdW50cnlDb2RlLlVzXSxcbiAgICAgICAgICAgIGFjY291bnRfZmlsdGVyczoge1xuICAgICAgICAgICAgICAgIGRlcG9zaXRvcnk6IHtcbiAgICAgICAgICAgICAgICAgICAgYWNjb3VudF9zdWJ0eXBlczogW0RlcG9zaXRvcnlBY2NvdW50U3VidHlwZS5DaGVja2luZywgRGVwb3NpdG9yeUFjY291bnRTdWJ0eXBlLlNhdmluZ3NdXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlZGlyZWN0X3VyaTogYGh0dHBzOi8vJHtNT09OQkVBTV9ERVBMT1lNRU5UX0JVQ0tFVF9OQU1FfS0ke3Byb2Nlc3MuZW52LkVOVl9OQU1FIX0tJHtwcm9jZXNzLmVudi5BV1NfUkVHSU9OIX0uczMuJHtwcm9jZXNzLmVudi5BV1NfUkVHSU9OIX0uYW1hem9uYXdzLmNvbS8ke01PT05CRUFNX1BMQUlEX09BVVRIX0ZJTEVfTkFNRX0tJHtwcm9jZXNzLmVudi5FTlZfTkFNRSF9Lmh0bWxgXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIHJldHJpZXZlIHRoZSBhY2NvdW50IGxpbmsgb2JqZWN0IGdpdmVuIHRoZSBhY2NvdW50IGxpbmsgaWQgKHVzZXIgaWQpXG4gICAgICAgIGNvbnN0IHtJdGVtfSA9IGF3YWl0IGRvY0NsaWVudC5nZXQoe1xuICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5BQ0NPVU5UX0xJTktTISxcbiAgICAgICAgICAgIEtleToge2lkOiBjcmVhdGVBY2NvdW50TGlua0lucHV0LmlkfVxuICAgICAgICB9KS5wcm9taXNlKCk7XG5cbiAgICAgICAgLy8gY3JlYXRlIHRoZSBhY2NvdW50IGxpbmsgb2JqZWN0IHRvIHJldHVybiBhbmQgc3RvcmVcbiAgICAgICAgY29uc3QgY3JlYXRlZEF0ID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgICAgICBjb25zdCBhY2NvdW50TGluazogQWNjb3VudExpbmsgPSB7XG4gICAgICAgICAgICBpZDogY3JlYXRlQWNjb3VudExpbmtJbnB1dC5pZCxcbiAgICAgICAgICAgIHVzZXJFbWFpbDogY3JlYXRlQWNjb3VudExpbmtJbnB1dC51c2VyRW1haWwsXG4gICAgICAgICAgICB1c2VyTmFtZTogY3JlYXRlQWNjb3VudExpbmtJbnB1dC51c2VyTmFtZSxcbiAgICAgICAgICAgIGxpbmtzOiBbXVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIGlmIGFuIGFjY291bnQgZG9lcyBub3QgZXhpc3QsIHRoZW4gY3JlYXRlIGEgbmV3IGFjY291bnQgbGluayBvYmplY3Qgd2l0aCBhIG5ldyBsaW5rXG4gICAgICAgIGlmICghSXRlbSkge1xuICAgICAgICAgICAgYWNjb3VudExpbmsubGlua3MucHVzaCh7XG4gICAgICAgICAgICAgICAgbGlua1Rva2VuOiBjcmVhdGVUb2tlblJlc3BvbnNlLmRhdGEubGlua190b2tlbixcbiAgICAgICAgICAgICAgICByZXF1ZXN0SWQ6IGNyZWF0ZVRva2VuUmVzcG9uc2UuZGF0YS5yZXF1ZXN0X2lkLFxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDogY3JlYXRlZEF0LFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdDogY3JlYXRlZEF0XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIG90aGVyd2lzZSBnZXQgdGhlIGV4aXN0aW5nIGFjY291bnQgYW5kIGFkZCBhIG5ldyBsaW5rIGluIGl0XG4gICAgICAgICAgICBjb25zdCByZXRyaWV2ZWRBY2NvdW50TGluayA9IEl0ZW0hIGFzIEFjY291bnRMaW5rO1xuICAgICAgICAgICAgYWNjb3VudExpbmsubGlua3MgPSBbXG4gICAgICAgICAgICAgICAgLi4ucmV0cmlldmVkQWNjb3VudExpbmsubGlua3MsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBsaW5rVG9rZW46IGNyZWF0ZVRva2VuUmVzcG9uc2UuZGF0YS5saW5rX3Rva2VuLFxuICAgICAgICAgICAgICAgICAgICByZXF1ZXN0SWQ6IGNyZWF0ZVRva2VuUmVzcG9uc2UuZGF0YS5yZXF1ZXN0X2lkLFxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IGNyZWF0ZWRBdCxcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlZEF0OiBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdXG4gICAgICAgIH1cblxuICAgICAgICAvLyBzdG9yZSB0aGUgYWNjb3VudCBsaW5rIG9iamVjdFxuICAgICAgICBhd2FpdCBkb2NDbGllbnQucHV0KHtcbiAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuQUNDT1VOVF9MSU5LUyEsXG4gICAgICAgICAgICBJdGVtOiBhY2NvdW50TGlua1xuICAgICAgICB9KS5wcm9taXNlKCk7XG5cbiAgICAgICAgLy8gcmV0dXJuIHRoZSBhY2NvdW50IGxpbmsgb2JqZWN0XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkYXRhOiBhY2NvdW50TGlua1xuICAgICAgICB9XG4gICAgfSBjYXRjaFxuICAgICAgICAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyBjcmVhdGVBY2NvdW50TGluayBtdXRhdGlvbiB7fWAsIGVycik7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyBjcmVhdGVBY2NvdW50TGluayBtdXRhdGlvbi4gJHtlcnJ9YCxcbiAgICAgICAgICAgIGVycm9yVHlwZTogTGlua0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgfTtcbiAgICB9XG59XG4iXX0=