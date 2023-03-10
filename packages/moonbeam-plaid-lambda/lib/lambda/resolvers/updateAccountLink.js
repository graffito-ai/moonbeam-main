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
exports.updateAccountLink = void 0;
const AWS = __importStar(require("aws-sdk"));
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const plaidUtils_1 = require("../utils/plaidUtils");
/**
 * UpdateAccountLink resolver
 *
 * @param updateAccountLinkInput input to update an account link to
 * @returns {@link Promise} of {@link ReferralResponse}
 */
const updateAccountLink = async (updateAccountLinkInput) => {
    // initializing the DynamoDB document client
    const docClient = new AWS.DynamoDB.DocumentClient();
    try {
        // validating that the appropriate update link parameters are passed in
        if (!updateAccountLinkInput.accountLinkDetails.accountLinkError &&
            ((!updateAccountLinkInput.accountLinkDetails.accounts && !updateAccountLinkInput.accountLinkDetails.publicToken) ||
                (!updateAccountLinkInput.accountLinkDetails.accounts && updateAccountLinkInput.accountLinkDetails.publicToken) ||
                (updateAccountLinkInput.accountLinkDetails.accounts && !updateAccountLinkInput.accountLinkDetails.publicToken)) &&
            ((!updateAccountLinkInput.accountLinkDetails.accounts && !updateAccountLinkInput.accountLinkDetails.institution) ||
                (!updateAccountLinkInput.accountLinkDetails.accounts && updateAccountLinkInput.accountLinkDetails.institution) ||
                (updateAccountLinkInput.accountLinkDetails.accounts && !updateAccountLinkInput.accountLinkDetails.institution)) &&
            ((!updateAccountLinkInput.accountLinkDetails.linkSessionId && !updateAccountLinkInput.accountLinkDetails.requestId) ||
                (!updateAccountLinkInput.accountLinkDetails.linkSessionId && updateAccountLinkInput.accountLinkDetails.requestId) ||
                (updateAccountLinkInput.accountLinkDetails.linkSessionId && !updateAccountLinkInput.accountLinkDetails.requestId)) &&
            ((!updateAccountLinkInput.accountLinkDetails.itemId && !updateAccountLinkInput.accountLinkDetails.accessToken) ||
                (!updateAccountLinkInput.accountLinkDetails.itemId && updateAccountLinkInput.accountLinkDetails.accessToken) ||
                (updateAccountLinkInput.accountLinkDetails.itemId && !updateAccountLinkInput.accountLinkDetails.accessToken))) {
            console.log(`Invalid link parameters to update account link with ${updateAccountLinkInput}`);
            return {
                errorMessage: `Invalid link parameters to update account link with`,
                errorType: moonbeam_models_1.LinkErrorType.ValidationError
            };
        }
        // retrieve the account link object given the account link id (user id)
        const { Item } = await docClient.get({
            TableName: process.env.ACCOUNT_LINKS,
            Key: { id: updateAccountLinkInput.id }
        }).promise();
        // otherwise get the existing account and add a new link in it
        let retrievedAccountLink;
        // if an account does not exist, then return an error, since we're attempting to update something that does not exist
        if (!Item) {
            const errorMessage = `Update triggered for non existent account link ${updateAccountLinkInput.id}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.LinkErrorType.NoneOrAbsent
            };
        }
        else {
            // otherwise get the existing account and add a new link in it
            retrievedAccountLink = Item;
            // retrieve the specific link which we are running updates for
            for (const link of retrievedAccountLink.links) {
                if (link.linkToken === updateAccountLinkInput.accountLinkDetails.linkToken) {
                    link.updatedAt = new Date().toISOString();
                    // identity whether this is an update for which a token exchange is needed
                    if (updateAccountLinkInput.accountLinkDetails.publicToken) {
                        console.log('Performing a token exchange for {}', updateAccountLinkInput.id);
                        // initialize the Plaid Utils
                        const plaidUtils = await plaidUtils_1.PlaidUtils.setup();
                        // call the Plaid API to exchange the Public Token, for an Access Token
                        const exchangeTokenResponse = await plaidUtils.plaidClient.itemPublicTokenExchange({
                            client_id: plaidUtils.plaidClientId,
                            secret: plaidUtils.plaidSecret,
                            public_token: updateAccountLinkInput.accountLinkDetails.publicToken
                        });
                        // update the access token information exchanged
                        link.accessToken = exchangeTokenResponse.data.access_token;
                        link.requestId = exchangeTokenResponse.data.request_id;
                        link.itemId = exchangeTokenResponse.data.item_id;
                    }
                    // identify what other attributes we need to update based on the input
                    if (updateAccountLinkInput.accountLinkDetails.accountLinkError) {
                        link.accountLinkError = updateAccountLinkInput.accountLinkDetails.accountLinkError;
                    }
                    if (updateAccountLinkInput.accountLinkDetails.accounts) {
                        link.accounts = updateAccountLinkInput.accountLinkDetails.accounts;
                    }
                    if (updateAccountLinkInput.accountLinkDetails.institution) {
                        link.institution = updateAccountLinkInput.accountLinkDetails.institution;
                    }
                    if (updateAccountLinkInput.accountLinkDetails.requestId) {
                        link.requestId = updateAccountLinkInput.accountLinkDetails.requestId;
                    }
                    if (updateAccountLinkInput.accountLinkDetails.linkSessionId) {
                        link.linkSessionId = updateAccountLinkInput.accountLinkDetails.linkSessionId;
                    }
                    if (updateAccountLinkInput.accountLinkDetails.itemId) {
                        link.itemId = updateAccountLinkInput.accountLinkDetails.itemId;
                    }
                    if (updateAccountLinkInput.accountLinkDetails.accessToken) {
                        link.accessToken = updateAccountLinkInput.accountLinkDetails.accessToken;
                    }
                    break;
                }
            }
            // update the account link based on the passed in object
            await docClient.put({
                TableName: process.env.ACCOUNT_LINKS,
                Item: retrievedAccountLink
            }).promise();
            // return the updated link object
            return {
                data: retrievedAccountLink
            };
        }
    }
    catch (err) {
        console.log(`Unexpected error while executing updateAccountLink mutation {}`, err);
        return {
            errorMessage: `Unexpected error while executing updateAccountLink mutation. ${err}`,
            errorType: moonbeam_models_1.LinkErrorType.UnexpectedError
        };
    }
};
exports.updateAccountLink = updateAccountLink;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlQWNjb3VudExpbmsuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL3Jlc29sdmVycy91cGRhdGVBY2NvdW50TGluay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDZDQUErQjtBQUMvQiwrREFBa0g7QUFDbEgsb0RBQStDO0FBRS9DOzs7OztHQUtHO0FBQ0ksTUFBTSxpQkFBaUIsR0FBRyxLQUFLLEVBQUUsc0JBQThDLEVBQWdDLEVBQUU7SUFDcEgsNENBQTRDO0lBQzVDLE1BQU0sU0FBUyxHQUFHLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsQ0FBQztJQUVwRCxJQUFJO1FBQ0EsdUVBQXVFO1FBQ3ZFLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxrQkFBa0IsQ0FBQyxnQkFBZ0I7WUFDM0QsQ0FDSSxDQUFDLENBQUMsc0JBQXNCLENBQUMsa0JBQWtCLENBQUMsUUFBUSxJQUFJLENBQUMsc0JBQXNCLENBQUMsa0JBQWtCLENBQUMsV0FBVyxDQUFDO2dCQUMvRyxDQUFDLENBQUMsc0JBQXNCLENBQUMsa0JBQWtCLENBQUMsUUFBUSxJQUFJLHNCQUFzQixDQUFDLGtCQUFrQixDQUFDLFdBQVcsQ0FBQztnQkFDOUcsQ0FBQyxzQkFBc0IsQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLENBQUMsQ0FDakg7WUFDRCxDQUNJLENBQUMsQ0FBQyxzQkFBc0IsQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLENBQUM7Z0JBQy9HLENBQUMsQ0FBQyxzQkFBc0IsQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLElBQUksc0JBQXNCLENBQUMsa0JBQWtCLENBQUMsV0FBVyxDQUFDO2dCQUM5RyxDQUFDLHNCQUFzQixDQUFDLGtCQUFrQixD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cUJBQ25FO29CQUNELElBQUksc0JBQXNCLENBQUMsa0JBQWtCLENBQUMsV0FBVyxFQUFFO3dCQUN2RCxJQUFLLENBQUMsV0FBVyxHQUFHLHNCQUFzQixDQUFDLGtCQUFrQixDQUFDLFdBQVcsQ0FBQztxQkFDN0U7b0JBQ0QsTUFBTTtpQkFDVDthQUNKO1lBQ0Qsd0RBQXdEO1lBQ3hELE1BQU0sU0FBUyxDQUFDLEdBQUcsQ0FBQztnQkFDaEIsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYztnQkFDckMsSUFBSSxFQUFFLG9CQUFvQjthQUM3QixDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7WUFFYixpQ0FBaUM7WUFDakMsT0FBTztnQkFDSCxJQUFJLEVBQUUsb0JBQW9CO2FBQzdCLENBQUE7U0FDSjtLQUNKO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDVixPQUFPLENBQUMsR0FBRyxDQUFDLGdFQUFnRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ25GLE9BQU87WUFDSCxZQUFZLEVBQUUsZ0VBQWdFLEdBQUcsRUFBRTtZQUNuRixTQUFTLEVBQUUsK0JBQWEsQ0FBQyxlQUFlO1NBQzNDLENBQUM7S0FDTDtBQUNMLENBQUMsQ0FBQTtBQTVIWSxRQUFBLGlCQUFpQixxQkE0SDdCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgQVdTIGZyb20gJ2F3cy1zZGsnO1xuaW1wb3J0IHtBY2NvdW50TGluaywgQWNjb3VudExpbmtSZXNwb25zZSwgTGlua0Vycm9yVHlwZSwgVXBkYXRlQWNjb3VudExpbmtJbnB1dH0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcbmltcG9ydCB7UGxhaWRVdGlsc30gZnJvbSBcIi4uL3V0aWxzL3BsYWlkVXRpbHNcIjtcblxuLyoqXG4gKiBVcGRhdGVBY2NvdW50TGluayByZXNvbHZlclxuICpcbiAqIEBwYXJhbSB1cGRhdGVBY2NvdW50TGlua0lucHV0IGlucHV0IHRvIHVwZGF0ZSBhbiBhY2NvdW50IGxpbmsgdG9cbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgUmVmZXJyYWxSZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IHVwZGF0ZUFjY291bnRMaW5rID0gYXN5bmMgKHVwZGF0ZUFjY291bnRMaW5rSW5wdXQ6IFVwZGF0ZUFjY291bnRMaW5rSW5wdXQpOiBQcm9taXNlPEFjY291bnRMaW5rUmVzcG9uc2U+ID0+IHtcbiAgICAvLyBpbml0aWFsaXppbmcgdGhlIER5bmFtb0RCIGRvY3VtZW50IGNsaWVudFxuICAgIGNvbnN0IGRvY0NsaWVudCA9IG5ldyBBV1MuRHluYW1vREIuRG9jdW1lbnRDbGllbnQoKTtcblxuICAgIHRyeSB7XG4gICAgICAgIC8vIHZhbGlkYXRpbmcgdGhhdCB0aGUgYXBwcm9wcmlhdGUgdXBkYXRlIGxpbmsgcGFyYW1ldGVycyBhcmUgcGFzc2VkIGluXG4gICAgICAgIGlmICghdXBkYXRlQWNjb3VudExpbmtJbnB1dC5hY2NvdW50TGlua0RldGFpbHMuYWNjb3VudExpbmtFcnJvciAmJlxuICAgICAgICAgICAgKFxuICAgICAgICAgICAgICAgICghdXBkYXRlQWNjb3VudExpbmtJbnB1dC5hY2NvdW50TGlua0RldGFpbHMuYWNjb3VudHMgJiYgIXVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLnB1YmxpY1Rva2VuKSB8fFxuICAgICAgICAgICAgICAgICghdXBkYXRlQWNjb3VudExpbmtJbnB1dC5hY2NvdW50TGlua0RldGFpbHMuYWNjb3VudHMgJiYgdXBkYXRlQWNjb3VudExpbmtJbnB1dC5hY2NvdW50TGlua0RldGFpbHMucHVibGljVG9rZW4pIHx8XG4gICAgICAgICAgICAgICAgKHVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLmFjY291bnRzICYmICF1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5wdWJsaWNUb2tlbilcbiAgICAgICAgICAgICkgJiZcbiAgICAgICAgICAgIChcbiAgICAgICAgICAgICAgICAoIXVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLmFjY291bnRzICYmICF1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5pbnN0aXR1dGlvbikgfHxcbiAgICAgICAgICAgICAgICAoIXVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLmFjY291bnRzICYmIHVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLmluc3RpdHV0aW9uKSB8fFxuICAgICAgICAgICAgICAgICh1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5hY2NvdW50cyAmJiAhdXBkYXRlQWNjb3VudExpbmtJbnB1dC5hY2NvdW50TGlua0RldGFpbHMuaW5zdGl0dXRpb24pXG4gICAgICAgICAgICApICYmXG4gICAgICAgICAgICAoXG4gICAgICAgICAgICAgICAgKCF1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5saW5rU2Vzc2lvbklkICYmICF1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5yZXF1ZXN0SWQpIHx8XG4gICAgICAgICAgICAgICAgKCF1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5saW5rU2Vzc2lvbklkICYmIHVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLnJlcXVlc3RJZCkgfHxcbiAgICAgICAgICAgICAgICAodXBkYXRlQWNjb3VudExpbmtJbnB1dC5hY2NvdW50TGlua0RldGFpbHMubGlua1Nlc3Npb25JZCAmJiAhdXBkYXRlQWNjb3VudExpbmtJbnB1dC5hY2NvdW50TGlua0RldGFpbHMucmVxdWVzdElkKVxuICAgICAgICAgICAgKSAmJlxuICAgICAgICAgICAgKFxuICAgICAgICAgICAgICAgICghdXBkYXRlQWNjb3VudExpbmtJbnB1dC5hY2NvdW50TGlua0RldGFpbHMuaXRlbUlkICYmICF1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5hY2Nlc3NUb2tlbikgfHxcbiAgICAgICAgICAgICAgICAoIXVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLml0ZW1JZCAmJiB1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5hY2Nlc3NUb2tlbikgfHxcbiAgICAgICAgICAgICAgICAodXBkYXRlQWNjb3VudExpbmtJbnB1dC5hY2NvdW50TGlua0RldGFpbHMuaXRlbUlkICYmICF1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5hY2Nlc3NUb2tlbilcbiAgICAgICAgICAgIClcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgSW52YWxpZCBsaW5rIHBhcmFtZXRlcnMgdG8gdXBkYXRlIGFjY291bnQgbGluayB3aXRoICR7dXBkYXRlQWNjb3VudExpbmtJbnB1dH1gKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgSW52YWxpZCBsaW5rIHBhcmFtZXRlcnMgdG8gdXBkYXRlIGFjY291bnQgbGluayB3aXRoYCxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IExpbmtFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gcmV0cmlldmUgdGhlIGFjY291bnQgbGluayBvYmplY3QgZ2l2ZW4gdGhlIGFjY291bnQgbGluayBpZCAodXNlciBpZClcbiAgICAgICAgY29uc3Qge0l0ZW19ID0gYXdhaXQgZG9jQ2xpZW50LmdldCh7XG4gICAgICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52LkFDQ09VTlRfTElOS1MhLFxuICAgICAgICAgICAgS2V5OiB7aWQ6IHVwZGF0ZUFjY291bnRMaW5rSW5wdXQuaWR9XG4gICAgICAgIH0pLnByb21pc2UoKTtcblxuICAgICAgICAvLyBvdGhlcndpc2UgZ2V0IHRoZSBleGlzdGluZyBhY2NvdW50IGFuZCBhZGQgYSBuZXcgbGluayBpbiBpdFxuICAgICAgICBsZXQgcmV0cmlldmVkQWNjb3VudExpbms6IEFjY291bnRMaW5rXG5cbiAgICAgICAgLy8gaWYgYW4gYWNjb3VudCBkb2VzIG5vdCBleGlzdCwgdGhlbiByZXR1cm4gYW4gZXJyb3IsIHNpbmNlIHdlJ3JlIGF0dGVtcHRpbmcgdG8gdXBkYXRlIHNvbWV0aGluZyB0aGF0IGRvZXMgbm90IGV4aXN0XG4gICAgICAgIGlmICghSXRlbSkge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVwZGF0ZSB0cmlnZ2VyZWQgZm9yIG5vbiBleGlzdGVudCBhY2NvdW50IGxpbmsgJHt1cGRhdGVBY2NvdW50TGlua0lucHV0LmlkfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IExpbmtFcnJvclR5cGUuTm9uZU9yQWJzZW50XG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gb3RoZXJ3aXNlIGdldCB0aGUgZXhpc3RpbmcgYWNjb3VudCBhbmQgYWRkIGEgbmV3IGxpbmsgaW4gaXRcbiAgICAgICAgICAgIHJldHJpZXZlZEFjY291bnRMaW5rID0gSXRlbSEgYXMgQWNjb3VudExpbms7XG5cbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBzcGVjaWZpYyBsaW5rIHdoaWNoIHdlIGFyZSBydW5uaW5nIHVwZGF0ZXMgZm9yXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGxpbmsgb2YgcmV0cmlldmVkQWNjb3VudExpbmsubGlua3MpIHtcbiAgICAgICAgICAgICAgICBpZiAobGluayEubGlua1Rva2VuID09PSB1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5saW5rVG9rZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgbGluayEudXBkYXRlZEF0ID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGlkZW50aXR5IHdoZXRoZXIgdGhpcyBpcyBhbiB1cGRhdGUgZm9yIHdoaWNoIGEgdG9rZW4gZXhjaGFuZ2UgaXMgbmVlZGVkXG4gICAgICAgICAgICAgICAgICAgIGlmICh1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5wdWJsaWNUb2tlbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1BlcmZvcm1pbmcgYSB0b2tlbiBleGNoYW5nZSBmb3Ige30nLCB1cGRhdGVBY2NvdW50TGlua0lucHV0LmlkKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaW5pdGlhbGl6ZSB0aGUgUGxhaWQgVXRpbHNcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBsYWlkVXRpbHMgPSBhd2FpdCBQbGFpZFV0aWxzLnNldHVwKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNhbGwgdGhlIFBsYWlkIEFQSSB0byBleGNoYW5nZSB0aGUgUHVibGljIFRva2VuLCBmb3IgYW4gQWNjZXNzIFRva2VuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBleGNoYW5nZVRva2VuUmVzcG9uc2UgPSBhd2FpdCBwbGFpZFV0aWxzLnBsYWlkQ2xpZW50IS5pdGVtUHVibGljVG9rZW5FeGNoYW5nZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xpZW50X2lkOiBwbGFpZFV0aWxzLnBsYWlkQ2xpZW50SWQhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlY3JldDogcGxhaWRVdGlscy5wbGFpZFNlY3JldCEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHVibGljX3Rva2VuOiB1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5wdWJsaWNUb2tlblxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHVwZGF0ZSB0aGUgYWNjZXNzIHRva2VuIGluZm9ybWF0aW9uIGV4Y2hhbmdlZFxuICAgICAgICAgICAgICAgICAgICAgICAgbGluayEuYWNjZXNzVG9rZW4gPSBleGNoYW5nZVRva2VuUmVzcG9uc2UuZGF0YS5hY2Nlc3NfdG9rZW47XG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5rIS5yZXF1ZXN0SWQgPSBleGNoYW5nZVRva2VuUmVzcG9uc2UuZGF0YS5yZXF1ZXN0X2lkO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGluayEuaXRlbUlkID0gZXhjaGFuZ2VUb2tlblJlc3BvbnNlLmRhdGEuaXRlbV9pZDtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIGlkZW50aWZ5IHdoYXQgb3RoZXIgYXR0cmlidXRlcyB3ZSBuZWVkIHRvIHVwZGF0ZSBiYXNlZCBvbiB0aGUgaW5wdXRcbiAgICAgICAgICAgICAgICAgICAgaWYgKHVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLmFjY291bnRMaW5rRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmshLmFjY291bnRMaW5rRXJyb3IgPSB1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5hY2NvdW50TGlua0Vycm9yO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5hY2NvdW50cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGluayEuYWNjb3VudHMgPSB1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscyEuYWNjb3VudHM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLmluc3RpdHV0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5rIS5pbnN0aXR1dGlvbiA9IHVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLmluc3RpdHV0aW9uO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5yZXF1ZXN0SWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmshLnJlcXVlc3RJZCA9IHVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLnJlcXVlc3RJZDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAodXBkYXRlQWNjb3VudExpbmtJbnB1dC5hY2NvdW50TGlua0RldGFpbHMubGlua1Nlc3Npb25JZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGluayEubGlua1Nlc3Npb25JZCA9IHVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLmxpbmtTZXNzaW9uSWQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLml0ZW1JZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGluayEuaXRlbUlkID0gdXBkYXRlQWNjb3VudExpbmtJbnB1dC5hY2NvdW50TGlua0RldGFpbHMuaXRlbUlkO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5hY2Nlc3NUb2tlbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGluayEuYWNjZXNzVG9rZW4gPSB1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5hY2Nlc3NUb2tlbjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyB1cGRhdGUgdGhlIGFjY291bnQgbGluayBiYXNlZCBvbiB0aGUgcGFzc2VkIGluIG9iamVjdFxuICAgICAgICAgICAgYXdhaXQgZG9jQ2xpZW50LnB1dCh7XG4gICAgICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5BQ0NPVU5UX0xJTktTISxcbiAgICAgICAgICAgICAgICBJdGVtOiByZXRyaWV2ZWRBY2NvdW50TGlua1xuICAgICAgICAgICAgfSkucHJvbWlzZSgpO1xuXG4gICAgICAgICAgICAvLyByZXR1cm4gdGhlIHVwZGF0ZWQgbGluayBvYmplY3RcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZGF0YTogcmV0cmlldmVkQWNjb3VudExpbmtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zb2xlLmxvZyhgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgdXBkYXRlQWNjb3VudExpbmsgbXV0YXRpb24ge31gLCBlcnIpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgdXBkYXRlQWNjb3VudExpbmsgbXV0YXRpb24uICR7ZXJyfWAsXG4gICAgICAgICAgICBlcnJvclR5cGU6IExpbmtFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgIH07XG4gICAgfVxufVxuIl19