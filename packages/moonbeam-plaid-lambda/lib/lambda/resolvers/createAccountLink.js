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
            redirect_uri: `https://moonbeam-application-deployment-bucket.s3.us-west-2.amazonaws.com/moonbeam-plaid-oauth-${process.env.ENV_NAME}.html`
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlQWNjb3VudExpbmsuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL3Jlc29sdmVycy9jcmVhdGVBY2NvdW50TGluay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDZDQUErQjtBQUMvQiwrREFNbUM7QUFDbkMsaUNBQTRDO0FBQzVDLG1DQUFtRDtBQUNuRCxvREFBK0M7QUFFL0M7Ozs7O0dBS0c7QUFDSSxNQUFNLGlCQUFpQixHQUFHLEtBQUssRUFBRSxzQkFBOEMsRUFBZ0MsRUFBRTtJQUNwSCw0Q0FBNEM7SUFDNUMsTUFBTSxTQUFTLEdBQUcsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBRXBELElBQUk7UUFDQSw2QkFBNkI7UUFDN0IsTUFBTSxVQUFVLEdBQUcsTUFBTSx1QkFBVSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBRTVDLDRDQUE0QztRQUM1QyxNQUFNLG1CQUFtQixHQUFHLE1BQU0sVUFBVSxDQUFDLFdBQVksQ0FBQyxlQUFlLENBQUM7WUFDdEUsSUFBSSxFQUFFO2dCQUNGLGNBQWMsRUFBRSxzQkFBc0IsQ0FBQyxFQUFFO2FBQzVDO1lBQ0QsV0FBVyxFQUFFLFVBQVU7WUFDdkIsUUFBUSxFQUFFLENBQUMsZ0JBQVEsQ0FBQyxJQUFJLENBQUM7WUFDekIsUUFBUSxFQUFFLElBQUk7WUFDZCxhQUFhLEVBQUUsQ0FBQyxtQkFBVyxDQUFDLEVBQUUsQ0FBQztZQUMvQixlQUFlLEVBQUU7Z0JBQ2IsVUFBVSxFQUFFO29CQUNSLGdCQUFnQixFQUFFLENBQUMsOEJBQXdCLENBQUMsUUFBUSxFQUFFLDhCQUF3QixDQUFDLE9BQU8sQ0FBQztpQkFDMUY7YUFDSjtZQUNELFlBQVksRUFBRSxrR0FBa0csT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFTLE9BQU87U0FDL0ksQ0FBQyxDQUFDO1FBRUgsdUVBQXVFO1FBQ3ZFLE1BQU0sRUFBQyxJQUFJLEVBQUMsR0FBRyxNQUFNLFNBQVMsQ0FBQyxHQUFHLENBQUM7WUFDL0IsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYztZQUNyQyxHQUFHLEVBQUUsRUFBQyxFQUFFLEVBQUUsc0JBQXNCLENBQUMsRUFBRSxFQUFDO1NBQ3ZDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUViLHFEQUFxRDtRQUNyRCxNQUFNLFNBQVMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzNDLE1BQU0sV0FBVyxHQUFnQjtZQUM3QixFQUFFLEVBQUUsc0JBQXNCLENBQUMsRUFBRTtZQUM3QixTQUFTLEVBQUUsc0JBQXNCLENBQUMsU0FBUztZQUMzQyxRQUFRLEVBQUUsc0JBQXNCLENBQUMsUUFBUTtZQUN6QyxLQUFLLEVBQUUsRUFBRTtTQUNaLENBQUM7UUFFRixzRkFBc0Y7UUFDdEYsSUFBSSxDQUFDLElBQUksRUFBRTtZQUNQLFdBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO2dCQUNuQixTQUFTLEVBQUUsbUJBQW1CLENBQUMsSUFBSSxDQUFDLFVBQVU7Z0JBQzlDLFNBQVMsRUFBRSxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsVUFBVTtnQkFDOUMsU0FBUyxFQUFFLFNBQVM7Z0JBQ3BCLFNBQVMsRUFBRSxTQUFTO2FBQ3ZCLENBQUMsQ0FBQztTQUNOO2FBQU07WUFDSCw4REFBOEQ7WUFDOUQsTUFBTSxvQkFBb0IsR0FBRyxJQUFvQixDQUFDO1lBQ2xELFdBQVcsQ0FBQyxLQUFLLEdBQUc7Z0JBQ2hCLEdBQUcsb0JBQW9CLENBQUMsS0FBSztnQkFDN0I7b0JBQ0ksU0FBUyxFQUFFLG1CQUFtQixDQUFDLElBQUksQ0FBQyxVQUFVO29CQUM5QyxTQUFTLEVBQUUsbUJBQW1CLENBQUMsSUFBSSxDQUFDLFVBQVU7b0JBQzlDLFNBQVMsRUFBRSxTQUFTO29CQUNwQixTQUFTLEVBQUUsU0FBUztpQkFDdkI7YUFDSixDQUFBO1NBQ0o7UUFFRCxnQ0FBZ0M7UUFDaEMsTUFBTSxTQUFTLENBQUMsR0FBRyxDQUFDO1lBQ2hCLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWM7WUFDckMsSUFBSSxFQUFFLFdBQVc7U0FDcEIsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBRWIsaUNBQWlDO1FBQ2pDLE9BQU87WUFDSCxJQUFJLEVBQUUsV0FBVztTQUNwQixDQUFBO0tBQ0o7SUFBQyxPQUNHLEdBQUcsRUFBRTtRQUNOLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0VBQWdFLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDbkYsT0FBTztZQUNILFlBQVksRUFBRSxnRUFBZ0UsR0FBRyxFQUFFO1lBQ25GLFNBQVMsRUFBRSwrQkFBYSxDQUFDLGVBQWU7U0FDM0MsQ0FBQztLQUNMO0FBQ0wsQ0FBQyxDQUFBO0FBaEZZLFFBQUEsaUJBQWlCLHFCQWdGN0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBBV1MgZnJvbSAnYXdzLXNkayc7XG5pbXBvcnQge1xuICAgIEFjY291bnRMaW5rLFxuICAgIEFjY291bnRMaW5rUmVzcG9uc2UsXG4gICAgQ3JlYXRlQWNjb3VudExpbmtJbnB1dCxcbiAgICBMaW5rRXJyb3JUeXBlLFxuICAgIFJlZmVycmFsUmVzcG9uc2Vcbn0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcbmltcG9ydCB7Q291bnRyeUNvZGUsIFByb2R1Y3RzfSBmcm9tICdwbGFpZCc7XG5pbXBvcnQge0RlcG9zaXRvcnlBY2NvdW50U3VidHlwZX0gZnJvbSBcInBsYWlkL2FwaVwiO1xuaW1wb3J0IHtQbGFpZFV0aWxzfSBmcm9tIFwiLi4vdXRpbHMvcGxhaWRVdGlsc1wiO1xuXG4vKipcbiAqIENyZWF0ZUFjY291bnRMaW5rIHJlc29sdmVyXG4gKlxuICogQHBhcmFtIGNyZWF0ZUFjY291bnRMaW5rSW5wdXQgb2JqZWN0IHRvIGJlIHVzZWQgZm9yIGxpbmtpbmcgYSB1c2VyIHdpdGggUGxhaWRcbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgUmVmZXJyYWxSZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IGNyZWF0ZUFjY291bnRMaW5rID0gYXN5bmMgKGNyZWF0ZUFjY291bnRMaW5rSW5wdXQ6IENyZWF0ZUFjY291bnRMaW5rSW5wdXQpOiBQcm9taXNlPEFjY291bnRMaW5rUmVzcG9uc2U+ID0+IHtcbiAgICAvLyBpbml0aWFsaXppbmcgdGhlIER5bmFtb0RCIGRvY3VtZW50IGNsaWVudFxuICAgIGNvbnN0IGRvY0NsaWVudCA9IG5ldyBBV1MuRHluYW1vREIuRG9jdW1lbnRDbGllbnQoKTtcblxuICAgIHRyeSB7XG4gICAgICAgIC8vIGluaXRpYWxpemUgdGhlIFBsYWlkIFV0aWxzXG4gICAgICAgIGNvbnN0IHBsYWlkVXRpbHMgPSBhd2FpdCBQbGFpZFV0aWxzLnNldHVwKCk7XG5cbiAgICAgICAgLy8gY2FsbCB0aGUgUGxhaWQgQVBJIHRvIGNyZWF0ZSBhIExpbmsgVG9rZW5cbiAgICAgICAgY29uc3QgY3JlYXRlVG9rZW5SZXNwb25zZSA9IGF3YWl0IHBsYWlkVXRpbHMucGxhaWRDbGllbnQhLmxpbmtUb2tlbkNyZWF0ZSh7XG4gICAgICAgICAgICB1c2VyOiB7XG4gICAgICAgICAgICAgICAgY2xpZW50X3VzZXJfaWQ6IGNyZWF0ZUFjY291bnRMaW5rSW5wdXQuaWQsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY2xpZW50X25hbWU6ICdNb29uYmVhbScsXG4gICAgICAgICAgICBwcm9kdWN0czogW1Byb2R1Y3RzLkF1dGhdLFxuICAgICAgICAgICAgbGFuZ3VhZ2U6ICdlbicsXG4gICAgICAgICAgICBjb3VudHJ5X2NvZGVzOiBbQ291bnRyeUNvZGUuVXNdLFxuICAgICAgICAgICAgYWNjb3VudF9maWx0ZXJzOiB7XG4gICAgICAgICAgICAgICAgZGVwb3NpdG9yeToge1xuICAgICAgICAgICAgICAgICAgICBhY2NvdW50X3N1YnR5cGVzOiBbRGVwb3NpdG9yeUFjY291bnRTdWJ0eXBlLkNoZWNraW5nLCBEZXBvc2l0b3J5QWNjb3VudFN1YnR5cGUuU2F2aW5nc11cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVkaXJlY3RfdXJpOiBgaHR0cHM6Ly9tb29uYmVhbS1hcHBsaWNhdGlvbi1kZXBsb3ltZW50LWJ1Y2tldC5zMy51cy13ZXN0LTIuYW1hem9uYXdzLmNvbS9tb29uYmVhbS1wbGFpZC1vYXV0aC0ke3Byb2Nlc3MuZW52LkVOVl9OQU1FIX0uaHRtbGBcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gcmV0cmlldmUgdGhlIGFjY291bnQgbGluayBvYmplY3QgZ2l2ZW4gdGhlIGFjY291bnQgbGluayBpZCAodXNlciBpZClcbiAgICAgICAgY29uc3Qge0l0ZW19ID0gYXdhaXQgZG9jQ2xpZW50LmdldCh7XG4gICAgICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52LkFDQ09VTlRfTElOS1MhLFxuICAgICAgICAgICAgS2V5OiB7aWQ6IGNyZWF0ZUFjY291bnRMaW5rSW5wdXQuaWR9XG4gICAgICAgIH0pLnByb21pc2UoKTtcblxuICAgICAgICAvLyBjcmVhdGUgdGhlIGFjY291bnQgbGluayBvYmplY3QgdG8gcmV0dXJuIGFuZCBzdG9yZVxuICAgICAgICBjb25zdCBjcmVhdGVkQXQgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgICAgIGNvbnN0IGFjY291bnRMaW5rOiBBY2NvdW50TGluayA9IHtcbiAgICAgICAgICAgIGlkOiBjcmVhdGVBY2NvdW50TGlua0lucHV0LmlkLFxuICAgICAgICAgICAgdXNlckVtYWlsOiBjcmVhdGVBY2NvdW50TGlua0lucHV0LnVzZXJFbWFpbCxcbiAgICAgICAgICAgIHVzZXJOYW1lOiBjcmVhdGVBY2NvdW50TGlua0lucHV0LnVzZXJOYW1lLFxuICAgICAgICAgICAgbGlua3M6IFtdXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gaWYgYW4gYWNjb3VudCBkb2VzIG5vdCBleGlzdCwgdGhlbiBjcmVhdGUgYSBuZXcgYWNjb3VudCBsaW5rIG9iamVjdCB3aXRoIGEgbmV3IGxpbmtcbiAgICAgICAgaWYgKCFJdGVtKSB7XG4gICAgICAgICAgICBhY2NvdW50TGluay5saW5rcy5wdXNoKHtcbiAgICAgICAgICAgICAgICBsaW5rVG9rZW46IGNyZWF0ZVRva2VuUmVzcG9uc2UuZGF0YS5saW5rX3Rva2VuLFxuICAgICAgICAgICAgICAgIHJlcXVlc3RJZDogY3JlYXRlVG9rZW5SZXNwb25zZS5kYXRhLnJlcXVlc3RfaWQsXG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0OiBjcmVhdGVkQXQsXG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0OiBjcmVhdGVkQXRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gb3RoZXJ3aXNlIGdldCB0aGUgZXhpc3RpbmcgYWNjb3VudCBhbmQgYWRkIGEgbmV3IGxpbmsgaW4gaXRcbiAgICAgICAgICAgIGNvbnN0IHJldHJpZXZlZEFjY291bnRMaW5rID0gSXRlbSEgYXMgQWNjb3VudExpbms7XG4gICAgICAgICAgICBhY2NvdW50TGluay5saW5rcyA9IFtcbiAgICAgICAgICAgICAgICAuLi5yZXRyaWV2ZWRBY2NvdW50TGluay5saW5rcyxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGxpbmtUb2tlbjogY3JlYXRlVG9rZW5SZXNwb25zZS5kYXRhLmxpbmtfdG9rZW4sXG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3RJZDogY3JlYXRlVG9rZW5SZXNwb25zZS5kYXRhLnJlcXVlc3RfaWQsXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDogY3JlYXRlZEF0LFxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVkQXQ6IGNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHN0b3JlIHRoZSBhY2NvdW50IGxpbmsgb2JqZWN0XG4gICAgICAgIGF3YWl0IGRvY0NsaWVudC5wdXQoe1xuICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5BQ0NPVU5UX0xJTktTISxcbiAgICAgICAgICAgIEl0ZW06IGFjY291bnRMaW5rXG4gICAgICAgIH0pLnByb21pc2UoKTtcblxuICAgICAgICAvLyByZXR1cm4gdGhlIGFjY291bnQgbGluayBvYmplY3RcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRhdGE6IGFjY291bnRMaW5rXG4gICAgICAgIH1cbiAgICB9IGNhdGNoXG4gICAgICAgIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5sb2coYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgZXhlY3V0aW5nIGNyZWF0ZUFjY291bnRMaW5rIG11dGF0aW9uIHt9YCwgZXJyKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgZXhlY3V0aW5nIGNyZWF0ZUFjY291bnRMaW5rIG11dGF0aW9uLiAke2Vycn1gLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBMaW5rRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICB9O1xuICAgIH1cbn1cbiJdfQ==