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
    try {
        // initializing the DynamoDB document client
        const docClient = new AWS.DynamoDB.DocumentClient();
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
        const createdAt = createAccountLinkInput.createdAt && new Date().toISOString();
        const updatedAt = createAccountLinkInput.updatedAt && createdAt;
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
                updatedAt: updatedAt
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
                    updatedAt: updatedAt
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
            errorMessage: `Unexpected error while executing createAccountLink mutation ${err}`,
            errorType: moonbeam_models_1.LinkErrorType.UnexpectedError
        };
    }
};
exports.createAccountLink = createAccountLink;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlQWNjb3VudExpbmsuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL3Jlc29sdmVycy9jcmVhdGVBY2NvdW50TGluay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDZDQUErQjtBQUMvQiwrREFNbUM7QUFDbkMsaUNBQTRDO0FBQzVDLG1DQUFtRDtBQUNuRCxvREFBK0M7QUFDL0MsSUFBTywrQkFBK0IsR0FBRywyQkFBUyxDQUFDLGlCQUFpQixDQUFDLCtCQUErQixDQUFDO0FBQ3JHLElBQU8sOEJBQThCLEdBQUcsMkJBQVMsQ0FBQyxpQkFBaUIsQ0FBQyw4QkFBOEIsQ0FBQztBQUVuRzs7Ozs7R0FLRztBQUNJLE1BQU0saUJBQWlCLEdBQUcsS0FBSyxFQUFFLHNCQUE4QyxFQUFnQyxFQUFFO0lBQ3BILElBQUk7UUFDQSw0Q0FBNEM7UUFDNUMsTUFBTSxTQUFTLEdBQUcsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBRXBELDZCQUE2QjtRQUM3QixNQUFNLFVBQVUsR0FBRyxNQUFNLHVCQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7UUFFNUMsNENBQTRDO1FBQzVDLE1BQU0sbUJBQW1CLEdBQUcsTUFBTSxVQUFVLENBQUMsV0FBWSxDQUFDLGVBQWUsQ0FBQztZQUN0RSxJQUFJLEVBQUU7Z0JBQ0YsY0FBYyxFQUFFLHNCQUFzQixDQUFDLEVBQUU7YUFDNUM7WUFDRCxXQUFXLEVBQUUsVUFBVTtZQUN2QixRQUFRLEVBQUUsQ0FBQyxnQkFBUSxDQUFDLElBQUksQ0FBQztZQUN6QixRQUFRLEVBQUUsSUFBSTtZQUNkLGFBQWEsRUFBRSxDQUFDLG1CQUFXLENBQUMsRUFBRSxDQUFDO1lBQy9CLGVBQWUsRUFBRTtnQkFDYixVQUFVLEVBQUU7b0JBQ1IsZ0JBQWdCLEVBQUUsQ0FBQyw4QkFBd0IsQ0FBQyxRQUFRLEVBQUUsOEJBQXdCLENBQUMsT0FBTyxDQUFDO2lCQUMxRjthQUNKO1lBQ0QsWUFBWSxFQUFFLFdBQVcsK0JBQStCLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFTLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLGtCQUFrQiw4QkFBOEIsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVMsT0FBTztTQUM3TixDQUFDLENBQUM7UUFFSCx1RUFBdUU7UUFDdkUsTUFBTSxFQUFDLElBQUksRUFBQyxHQUFHLE1BQU0sU0FBUyxDQUFDLEdBQUcsQ0FBQztZQUMvQixTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFjO1lBQ3JDLEdBQUcsRUFBRSxFQUFDLEVBQUUsRUFBRSxzQkFBc0IsQ0FBQyxFQUFFLEVBQUM7U0FDdkMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBRWIscURBQXFEO1FBQ3JELE1BQU0sU0FBUyxHQUFHLHNCQUFzQixDQUFDLFNBQVMsSUFBSSxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQy9FLE1BQU0sU0FBUyxHQUFHLHNCQUFzQixDQUFDLFNBQVMsSUFBSSxTQUFTLENBQUM7UUFDaEUsTUFBTSxXQUFXLEdBQWdCO1lBQzdCLEVBQUUsRUFBRSxzQkFBc0IsQ0FBQyxFQUFFO1lBQzdCLFNBQVMsRUFBRSxzQkFBc0IsQ0FBQyxTQUFTO1lBQzNDLFFBQVEsRUFBRSxzQkFBc0IsQ0FBQyxRQUFRO1lBQ3pDLEtBQUssRUFBRSxFQUFFO1NBQ1osQ0FBQztRQUVGLHNGQUFzRjtRQUN0RixJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ1AsV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7Z0JBQ25CLFNBQVMsRUFBRSxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsVUFBVTtnQkFDOUMsU0FBUyxFQUFFLG1CQUFtQixDQUFDLElBQUksQ0FBQyxVQUFVO2dCQUM5QyxTQUFTLEVBQUUsU0FBVTtnQkFDckIsU0FBUyxFQUFFLFNBQVU7YUFDeEIsQ0FBQyxDQUFDO1NBQ047YUFBTTtZQUNILDhEQUE4RDtZQUM5RCxNQUFNLG9CQUFvQixHQUFHLElBQW9CLENBQUM7WUFDbEQsV0FBVyxDQUFDLEtBQUssR0FBRztnQkFDaEIsR0FBRyxvQkFBb0IsQ0FBQyxLQUFLO2dCQUM3QjtvQkFDSSxTQUFTLEVBQUUsbUJBQW1CLENBQUMsSUFBSSxDQUFDLFVBQVU7b0JBQzlDLFNBQVMsRUFBRSxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsVUFBVTtvQkFDOUMsU0FBUyxFQUFFLFNBQVU7b0JBQ3JCLFNBQVMsRUFBRSxTQUFVO2lCQUN4QjthQUNKLENBQUE7U0FDSjtRQUVELGdDQUFnQztRQUNoQyxNQUFNLFNBQVMsQ0FBQyxHQUFHLENBQUM7WUFDaEIsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYztZQUNyQyxJQUFJLEVBQUUsV0FBVztTQUNwQixDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFYixpQ0FBaUM7UUFDakMsT0FBTztZQUNILElBQUksRUFBRSxXQUFXO1NBQ3BCLENBQUE7S0FDSjtJQUFDLE9BQ0csR0FBRyxFQUFFO1FBQ04sT0FBTyxDQUFDLEdBQUcsQ0FBQyxnRUFBZ0UsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNuRixPQUFPO1lBQ0gsWUFBWSxFQUFFLCtEQUErRCxHQUFHLEVBQUU7WUFDbEYsU0FBUyxFQUFFLCtCQUFhLENBQUMsZUFBZTtTQUMzQyxDQUFDO0tBQ0w7QUFDTCxDQUFDLENBQUE7QUFqRlksUUFBQSxpQkFBaUIscUJBaUY3QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIEFXUyBmcm9tICdhd3Mtc2RrJztcbmltcG9ydCB7XG4gICAgQWNjb3VudExpbmssXG4gICAgQWNjb3VudExpbmtSZXNwb25zZSxcbiAgICBDb25zdGFudHMsXG4gICAgQ3JlYXRlQWNjb3VudExpbmtJbnB1dCxcbiAgICBMaW5rRXJyb3JUeXBlXG59IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5pbXBvcnQge0NvdW50cnlDb2RlLCBQcm9kdWN0c30gZnJvbSAncGxhaWQnO1xuaW1wb3J0IHtEZXBvc2l0b3J5QWNjb3VudFN1YnR5cGV9IGZyb20gXCJwbGFpZC9hcGlcIjtcbmltcG9ydCB7UGxhaWRVdGlsc30gZnJvbSBcIi4uL3V0aWxzL3BsYWlkVXRpbHNcIjtcbmltcG9ydCBNT09OQkVBTV9ERVBMT1lNRU5UX0JVQ0tFVF9OQU1FID0gQ29uc3RhbnRzLk1vb25iZWFtQ29uc3RhbnRzLk1PT05CRUFNX0RFUExPWU1FTlRfQlVDS0VUX05BTUU7XG5pbXBvcnQgTU9PTkJFQU1fUExBSURfT0FVVEhfRklMRV9OQU1FID0gQ29uc3RhbnRzLk1vb25iZWFtQ29uc3RhbnRzLk1PT05CRUFNX1BMQUlEX09BVVRIX0ZJTEVfTkFNRTtcblxuLyoqXG4gKiBDcmVhdGVBY2NvdW50TGluayByZXNvbHZlclxuICpcbiAqIEBwYXJhbSBjcmVhdGVBY2NvdW50TGlua0lucHV0IG9iamVjdCB0byBiZSB1c2VkIGZvciBsaW5raW5nIGEgdXNlciB3aXRoIFBsYWlkXG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIEFjY291bnRMaW5rUmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCBjcmVhdGVBY2NvdW50TGluayA9IGFzeW5jIChjcmVhdGVBY2NvdW50TGlua0lucHV0OiBDcmVhdGVBY2NvdW50TGlua0lucHV0KTogUHJvbWlzZTxBY2NvdW50TGlua1Jlc3BvbnNlPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gaW5pdGlhbGl6aW5nIHRoZSBEeW5hbW9EQiBkb2N1bWVudCBjbGllbnRcbiAgICAgICAgY29uc3QgZG9jQ2xpZW50ID0gbmV3IEFXUy5EeW5hbW9EQi5Eb2N1bWVudENsaWVudCgpO1xuXG4gICAgICAgIC8vIGluaXRpYWxpemUgdGhlIFBsYWlkIFV0aWxzXG4gICAgICAgIGNvbnN0IHBsYWlkVXRpbHMgPSBhd2FpdCBQbGFpZFV0aWxzLnNldHVwKCk7XG5cbiAgICAgICAgLy8gY2FsbCB0aGUgUGxhaWQgQVBJIHRvIGNyZWF0ZSBhIExpbmsgVG9rZW5cbiAgICAgICAgY29uc3QgY3JlYXRlVG9rZW5SZXNwb25zZSA9IGF3YWl0IHBsYWlkVXRpbHMucGxhaWRDbGllbnQhLmxpbmtUb2tlbkNyZWF0ZSh7XG4gICAgICAgICAgICB1c2VyOiB7XG4gICAgICAgICAgICAgICAgY2xpZW50X3VzZXJfaWQ6IGNyZWF0ZUFjY291bnRMaW5rSW5wdXQuaWQsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY2xpZW50X25hbWU6ICdNb29uYmVhbScsXG4gICAgICAgICAgICBwcm9kdWN0czogW1Byb2R1Y3RzLkF1dGhdLFxuICAgICAgICAgICAgbGFuZ3VhZ2U6ICdlbicsXG4gICAgICAgICAgICBjb3VudHJ5X2NvZGVzOiBbQ291bnRyeUNvZGUuVXNdLFxuICAgICAgICAgICAgYWNjb3VudF9maWx0ZXJzOiB7XG4gICAgICAgICAgICAgICAgZGVwb3NpdG9yeToge1xuICAgICAgICAgICAgICAgICAgICBhY2NvdW50X3N1YnR5cGVzOiBbRGVwb3NpdG9yeUFjY291bnRTdWJ0eXBlLkNoZWNraW5nLCBEZXBvc2l0b3J5QWNjb3VudFN1YnR5cGUuU2F2aW5nc11cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVkaXJlY3RfdXJpOiBgaHR0cHM6Ly8ke01PT05CRUFNX0RFUExPWU1FTlRfQlVDS0VUX05BTUV9LSR7cHJvY2Vzcy5lbnYuRU5WX05BTUUhfS0ke3Byb2Nlc3MuZW52LkFXU19SRUdJT04hfS5zMy4ke3Byb2Nlc3MuZW52LkFXU19SRUdJT04hfS5hbWF6b25hd3MuY29tLyR7TU9PTkJFQU1fUExBSURfT0FVVEhfRklMRV9OQU1FfS0ke3Byb2Nlc3MuZW52LkVOVl9OQU1FIX0uaHRtbGBcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gcmV0cmlldmUgdGhlIGFjY291bnQgbGluayBvYmplY3QgZ2l2ZW4gdGhlIGFjY291bnQgbGluayBpZCAodXNlciBpZClcbiAgICAgICAgY29uc3Qge0l0ZW19ID0gYXdhaXQgZG9jQ2xpZW50LmdldCh7XG4gICAgICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52LkFDQ09VTlRfTElOS1MhLFxuICAgICAgICAgICAgS2V5OiB7aWQ6IGNyZWF0ZUFjY291bnRMaW5rSW5wdXQuaWR9XG4gICAgICAgIH0pLnByb21pc2UoKTtcblxuICAgICAgICAvLyBjcmVhdGUgdGhlIGFjY291bnQgbGluayBvYmplY3QgdG8gcmV0dXJuIGFuZCBzdG9yZVxuICAgICAgICBjb25zdCBjcmVhdGVkQXQgPSBjcmVhdGVBY2NvdW50TGlua0lucHV0LmNyZWF0ZWRBdCAmJiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgICAgIGNvbnN0IHVwZGF0ZWRBdCA9IGNyZWF0ZUFjY291bnRMaW5rSW5wdXQudXBkYXRlZEF0ICYmIGNyZWF0ZWRBdDtcbiAgICAgICAgY29uc3QgYWNjb3VudExpbms6IEFjY291bnRMaW5rID0ge1xuICAgICAgICAgICAgaWQ6IGNyZWF0ZUFjY291bnRMaW5rSW5wdXQuaWQsXG4gICAgICAgICAgICB1c2VyRW1haWw6IGNyZWF0ZUFjY291bnRMaW5rSW5wdXQudXNlckVtYWlsLFxuICAgICAgICAgICAgdXNlck5hbWU6IGNyZWF0ZUFjY291bnRMaW5rSW5wdXQudXNlck5hbWUsXG4gICAgICAgICAgICBsaW5rczogW11cbiAgICAgICAgfTtcblxuICAgICAgICAvLyBpZiBhbiBhY2NvdW50IGRvZXMgbm90IGV4aXN0LCB0aGVuIGNyZWF0ZSBhIG5ldyBhY2NvdW50IGxpbmsgb2JqZWN0IHdpdGggYSBuZXcgbGlua1xuICAgICAgICBpZiAoIUl0ZW0pIHtcbiAgICAgICAgICAgIGFjY291bnRMaW5rLmxpbmtzLnB1c2goe1xuICAgICAgICAgICAgICAgIGxpbmtUb2tlbjogY3JlYXRlVG9rZW5SZXNwb25zZS5kYXRhLmxpbmtfdG9rZW4sXG4gICAgICAgICAgICAgICAgcmVxdWVzdElkOiBjcmVhdGVUb2tlblJlc3BvbnNlLmRhdGEucmVxdWVzdF9pZCxcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IGNyZWF0ZWRBdCEsXG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0OiB1cGRhdGVkQXQhXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIG90aGVyd2lzZSBnZXQgdGhlIGV4aXN0aW5nIGFjY291bnQgYW5kIGFkZCBhIG5ldyBsaW5rIGluIGl0XG4gICAgICAgICAgICBjb25zdCByZXRyaWV2ZWRBY2NvdW50TGluayA9IEl0ZW0hIGFzIEFjY291bnRMaW5rO1xuICAgICAgICAgICAgYWNjb3VudExpbmsubGlua3MgPSBbXG4gICAgICAgICAgICAgICAgLi4ucmV0cmlldmVkQWNjb3VudExpbmsubGlua3MsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBsaW5rVG9rZW46IGNyZWF0ZVRva2VuUmVzcG9uc2UuZGF0YS5saW5rX3Rva2VuLFxuICAgICAgICAgICAgICAgICAgICByZXF1ZXN0SWQ6IGNyZWF0ZVRva2VuUmVzcG9uc2UuZGF0YS5yZXF1ZXN0X2lkLFxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IGNyZWF0ZWRBdCEsXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRBdDogdXBkYXRlZEF0IVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHN0b3JlIHRoZSBhY2NvdW50IGxpbmsgb2JqZWN0XG4gICAgICAgIGF3YWl0IGRvY0NsaWVudC5wdXQoe1xuICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5BQ0NPVU5UX0xJTktTISxcbiAgICAgICAgICAgIEl0ZW06IGFjY291bnRMaW5rXG4gICAgICAgIH0pLnByb21pc2UoKTtcblxuICAgICAgICAvLyByZXR1cm4gdGhlIGFjY291bnQgbGluayBvYmplY3RcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRhdGE6IGFjY291bnRMaW5rXG4gICAgICAgIH1cbiAgICB9IGNhdGNoXG4gICAgICAgIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5sb2coYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgZXhlY3V0aW5nIGNyZWF0ZUFjY291bnRMaW5rIG11dGF0aW9uIHt9YCwgZXJyKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgZXhlY3V0aW5nIGNyZWF0ZUFjY291bnRMaW5rIG11dGF0aW9uICR7ZXJyfWAsXG4gICAgICAgICAgICBlcnJvclR5cGU6IExpbmtFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgIH07XG4gICAgfVxufVxuIl19