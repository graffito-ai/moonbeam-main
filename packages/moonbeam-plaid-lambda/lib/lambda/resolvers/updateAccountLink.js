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
 * @returns {@link Promise} of {@link AccountLinkResponse}
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
            // check against duplicate accounts, by checking if the same account number was added before, for the same institution
            checkAccountDuplicates(updateAccountLinkInput, retrievedAccountLink);
            // retrieve the specific link which we are running updates for
            for (const link of retrievedAccountLink.links) {
                if (link.linkToken === updateAccountLinkInput.accountLinkDetails.linkToken) {
                    link.updatedAt = new Date().toISOString();
                    // identity whether this is an update for which a token exchange is needed (do not exchange for duplicate accounts)
                    if (updateAccountLinkInput.accountLinkDetails.publicToken && updateAccountLinkInput.accountLinkDetails.accounts
                        && updateAccountLinkInput.accountLinkDetails.accounts.length !== 0 && updateAccountLinkInput.accountLinkDetails.institution) {
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
                    if (updateAccountLinkInput.accountLinkDetails.accounts && updateAccountLinkInput.accountLinkDetails.accounts.length !== 0) {
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
/**
 * Function used to check for account duplicates and update them accordingly
 *
 * @param updateAccountLinkInput the account link to update
 * @param retrievedAccountLink the account link object retrieved
 */
const checkAccountDuplicates = (updateAccountLinkInput, retrievedAccountLink) => {
    const updatedAccounts = updateAccountLinkInput.accountLinkDetails.accounts;
    const updatedInstitution = updateAccountLinkInput.accountLinkDetails.institution;
    if (updatedAccounts && updatedAccounts.length !== 0 && updatedInstitution) {
        for (const link of retrievedAccountLink.links) {
            const comparableAccounts = link.accounts;
            const comparableInstitution = link.institution;
            // perform comparison and remove from the list ofr updatedAccounts if it exists already in the same link or in another one
            if (comparableInstitution && comparableAccounts && comparableAccounts.length !== 0) {
                if ((updatedInstitution.name === comparableInstitution.name) && (updatedInstitution.id === comparableInstitution.id)) {
                    updatedAccounts.forEach(updateAccount => {
                        let checkedIndex = 0;
                        comparableAccounts.forEach(comparableAccount => {
                            if (comparableAccount.mask === updateAccount.mask && comparableAccount.name === updateAccount.name) {
                                // delete the element from the list of accounts
                                updatedAccounts.splice(checkedIndex, 1);
                            }
                        });
                        checkedIndex++;
                    });
                }
            }
        }
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlQWNjb3VudExpbmsuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL3Jlc29sdmVycy91cGRhdGVBY2NvdW50TGluay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDZDQUErQjtBQUMvQiwrREFBa0g7QUFDbEgsb0RBQStDO0FBRS9DOzs7OztHQUtHO0FBQ0ksTUFBTSxpQkFBaUIsR0FBRyxLQUFLLEVBQUUsc0JBQThDLEVBQWdDLEVBQUU7SUFDcEgsNENBQTRDO0lBQzVDLE1BQU0sU0FBUyxHQUFHLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsQ0FBQztJQUVwRCxJQUFJO1FBQ0EsdUVBQXVFO1FBQ3ZFLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxrQkFBa0IsQ0FBQyxnQkFBZ0I7WUFDM0QsQ0FDSSxDQUFDLENBQUMsc0JBQXNCLENBQUMsa0JBQWtCLENBQUMsUUFBUSxJQUFJLENBQUMsc0JBQXNCLENBQUMsa0JBQWtCLENBQUMsV0FBVyxDQUFDO2dCQUMvRyxDQUFDLENBQUMsc0JBQXNCLENBQUMsa0JBQWtCLENBQUMsUUFBUSxJQUFJLHNCQUFzQixDQUFDLGtCQUFrQixDQUFDLFdBQVcsQ0FBQztnQkFDOUcsQ0FBQyxzQkFBc0IsQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLENBQUMsQ0FDakg7WUFDRCxDQUNJLENBQUMsQ0FBQyxzQkFBc0IsQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLENBQUM7Z0JBQy9HLENBQUMsQ0FBQyxzQkFBc0IsQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLElBQUksc0JBQXNCLENBQUMsa0JBQWtCLENBQUMsV0FBVyxDQUFDO2dCQUM5RyxDQUFDLHNCQUFzQixDQUFDLGtCQUFrQixD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J2F3cy1zZGsnO1xuaW1wb3J0IHtBY2NvdW50TGluaywgQWNjb3VudExpbmtSZXNwb25zZSwgTGlua0Vycm9yVHlwZSwgVXBkYXRlQWNjb3VudExpbmtJbnB1dH0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcbmltcG9ydCB7UGxhaWRVdGlsc30gZnJvbSBcIi4uL3V0aWxzL3BsYWlkVXRpbHNcIjtcblxuLyoqXG4gKiBVcGRhdGVBY2NvdW50TGluayByZXNvbHZlclxuICpcbiAqIEBwYXJhbSB1cGRhdGVBY2NvdW50TGlua0lucHV0IGlucHV0IHRvIHVwZGF0ZSBhbiBhY2NvdW50IGxpbmsgdG9cbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgQWNjb3VudExpbmtSZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IHVwZGF0ZUFjY291bnRMaW5rID0gYXN5bmMgKHVwZGF0ZUFjY291bnRMaW5rSW5wdXQ6IFVwZGF0ZUFjY291bnRMaW5rSW5wdXQpOiBQcm9taXNlPEFjY291bnRMaW5rUmVzcG9uc2U+ID0+IHtcbiAgICAvLyBpbml0aWFsaXppbmcgdGhlIER5bmFtb0RCIGRvY3VtZW50IGNsaWVudFxuICAgIGNvbnN0IGRvY0NsaWVudCA9IG5ldyBBV1MuRHluYW1vREIuRG9jdW1lbnRDbGllbnQoKTtcblxuICAgIHRyeSB7XG4gICAgICAgIC8vIHZhbGlkYXRpbmcgdGhhdCB0aGUgYXBwcm9wcmlhdGUgdXBkYXRlIGxpbmsgcGFyYW1ldGVycyBhcmUgcGFzc2VkIGluXG4gICAgICAgIGlmICghdXBkYXRlQWNjb3VudExpbmtJbnB1dC5hY2NvdW50TGlua0RldGFpbHMuYWNjb3VudExpbmtFcnJvciAmJlxuICAgICAgICAgICAgKFxuICAgICAgICAgICAgICAgICghdXBkYXRlQWNjb3VudExpbmtJbnB1dC5hY2NvdW50TGlua0RldGFpbHMuYWNjb3VudHMgJiYgIXVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLnB1YmxpY1Rva2VuKSB8fFxuICAgICAgICAgICAgICAgICghdXBkYXRlQWNjb3VudExpbmtJbnB1dC5hY2NvdW50TGlua0RldGFpbHMuYWNjb3VudHMgJiYgdXBkYXRlQWNjb3VudExpbmtJbnB1dC5hY2NvdW50TGlua0RldGFpbHMucHVibGljVG9rZW4pIHx8XG4gICAgICAgICAgICAgICAgKHVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLmFjY291bnRzICYmICF1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5wdWJsaWNUb2tlbilcbiAgICAgICAgICAgICkgJiZcbiAgICAgICAgICAgIChcbiAgICAgICAgICAgICAgICAoIXVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLmFjY291bnRzICYmICF1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5pbnN0aXR1dGlvbikgfHxcbiAgICAgICAgICAgICAgICAoIXVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLmFjY291bnRzICYmIHVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLmluc3RpdHV0aW9uKSB8fFxuICAgICAgICAgICAgICAgICh1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5hY2NvdW50cyAmJiAhdXBkYXRlQWNjb3VudExpbmtJbnB1dC5hY2NvdW50TGlua0RldGFpbHMuaW5zdGl0dXRpb24pXG4gICAgICAgICAgICApICYmXG4gICAgICAgICAgICAoXG4gICAgICAgICAgICAgICAgKCF1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5saW5rU2Vzc2lvbklkICYmICF1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5yZXF1ZXN0SWQpIHx8XG4gICAgICAgICAgICAgICAgKCF1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5saW5rU2Vzc2lvbklkICYmIHVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLnJlcXVlc3RJZCkgfHxcbiAgICAgICAgICAgICAgICAodXBkYXRlQWNjb3VudExpbmtJbnB1dC5hY2NvdW50TGlua0RldGFpbHMubGlua1Nlc3Npb25JZCAmJiAhdXBkYXRlQWNjb3VudExpbmtJbnB1dC5hY2NvdW50TGlua0RldGFpbHMucmVxdWVzdElkKVxuICAgICAgICAgICAgKSAmJlxuICAgICAgICAgICAgKFxuICAgICAgICAgICAgICAgICghdXBkYXRlQWNjb3VudExpbmtJbnB1dC5hY2NvdW50TGlua0RldGFpbHMuaXRlbUlkICYmICF1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5hY2Nlc3NUb2tlbikgfHxcbiAgICAgICAgICAgICAgICAoIXVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLml0ZW1JZCAmJiB1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5hY2Nlc3NUb2tlbikgfHxcbiAgICAgICAgICAgICAgICAodXBkYXRlQWNjb3VudExpbmtJbnB1dC5hY2NvdW50TGlua0RldGFpbHMuaXRlbUlkICYmICF1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5hY2Nlc3NUb2tlbilcbiAgICAgICAgICAgIClcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgSW52YWxpZCBsaW5rIHBhcmFtZXRlcnMgdG8gdXBkYXRlIGFjY291bnQgbGluayB3aXRoICR7dXBkYXRlQWNjb3VudExpbmtJbnB1dH1gKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgSW52YWxpZCBsaW5rIHBhcmFtZXRlcnMgdG8gdXBkYXRlIGFjY291bnQgbGluayB3aXRoYCxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IExpbmtFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gcmV0cmlldmUgdGhlIGFjY291bnQgbGluayBvYmplY3QgZ2l2ZW4gdGhlIGFjY291bnQgbGluayBpZCAodXNlciBpZClcbiAgICAgICAgY29uc3Qge0l0ZW19ID0gYXdhaXQgZG9jQ2xpZW50LmdldCh7XG4gICAgICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52LkFDQ09VTlRfTElOS1MhLFxuICAgICAgICAgICAgS2V5OiB7aWQ6IHVwZGF0ZUFjY291bnRMaW5rSW5wdXQuaWR9XG4gICAgICAgIH0pLnByb21pc2UoKTtcblxuICAgICAgICAvLyBvdGhlcndpc2UgZ2V0IHRoZSBleGlzdGluZyBhY2NvdW50IGFuZCBhZGQgYSBuZXcgbGluayBpbiBpdFxuICAgICAgICBsZXQgcmV0cmlldmVkQWNjb3VudExpbms6IEFjY291bnRMaW5rXG5cbiAgICAgICAgLy8gaWYgYW4gYWNjb3VudCBkb2VzIG5vdCBleGlzdCwgdGhlbiByZXR1cm4gYW4gZXJyb3IsIHNpbmNlIHdlJ3JlIGF0dGVtcHRpbmcgdG8gdXBkYXRlIHNvbWV0aGluZyB0aGF0IGRvZXMgbm90IGV4aXN0XG4gICAgICAgIGlmICghSXRlbSkge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVwZGF0ZSB0cmlnZ2VyZWQgZm9yIG5vbiBleGlzdGVudCBhY2NvdW50IGxpbmsgJHt1cGRhdGVBY2NvdW50TGlua0lucHV0LmlkfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IExpbmtFcnJvclR5cGUuTm9uZU9yQWJzZW50XG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gb3RoZXJ3aXNlIGdldCB0aGUgZXhpc3RpbmcgYWNjb3VudCBhbmQgYWRkIGEgbmV3IGxpbmsgaW4gaXRcbiAgICAgICAgICAgIHJldHJpZXZlZEFjY291bnRMaW5rID0gSXRlbSEgYXMgQWNjb3VudExpbms7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIGFnYWluc3QgZHVwbGljYXRlIGFjY291bnRzLCBieSBjaGVja2luZyBpZiB0aGUgc2FtZSBhY2NvdW50IG51bWJlciB3YXMgYWRkZWQgYmVmb3JlLCBmb3IgdGhlIHNhbWUgaW5zdGl0dXRpb25cbiAgICAgICAgICAgIGNoZWNrQWNjb3VudER1cGxpY2F0ZXModXBkYXRlQWNjb3VudExpbmtJbnB1dCwgcmV0cmlldmVkQWNjb3VudExpbmspO1xuXG4gICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgc3BlY2lmaWMgbGluayB3aGljaCB3ZSBhcmUgcnVubmluZyB1cGRhdGVzIGZvclxuICAgICAgICAgICAgZm9yIChjb25zdCBsaW5rIG9mIHJldHJpZXZlZEFjY291bnRMaW5rLmxpbmtzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGxpbmshLmxpbmtUb2tlbiA9PT0gdXBkYXRlQWNjb3VudExpbmtJbnB1dC5hY2NvdW50TGlua0RldGFpbHMubGlua1Rva2VuKSB7XG4gICAgICAgICAgICAgICAgICAgIGxpbmshLnVwZGF0ZWRBdCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBpZGVudGl0eSB3aGV0aGVyIHRoaXMgaXMgYW4gdXBkYXRlIGZvciB3aGljaCBhIHRva2VuIGV4Y2hhbmdlIGlzIG5lZWRlZCAoZG8gbm90IGV4Y2hhbmdlIGZvciBkdXBsaWNhdGUgYWNjb3VudHMpXG4gICAgICAgICAgICAgICAgICAgIGlmICh1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5wdWJsaWNUb2tlbiAmJiB1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5hY2NvdW50c1xuICAgICAgICAgICAgICAgICAgICAgICAgJiYgdXBkYXRlQWNjb3VudExpbmtJbnB1dC5hY2NvdW50TGlua0RldGFpbHMuYWNjb3VudHMubGVuZ3RoICE9PSAwICYmIHVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLmluc3RpdHV0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnUGVyZm9ybWluZyBhIHRva2VuIGV4Y2hhbmdlIGZvciB7fScsIHVwZGF0ZUFjY291bnRMaW5rSW5wdXQuaWQpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpbml0aWFsaXplIHRoZSBQbGFpZCBVdGlsc1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcGxhaWRVdGlscyA9IGF3YWl0IFBsYWlkVXRpbHMuc2V0dXAoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2FsbCB0aGUgUGxhaWQgQVBJIHRvIGV4Y2hhbmdlIHRoZSBQdWJsaWMgVG9rZW4sIGZvciBhbiBBY2Nlc3MgVG9rZW5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGV4Y2hhbmdlVG9rZW5SZXNwb25zZSA9IGF3YWl0IHBsYWlkVXRpbHMucGxhaWRDbGllbnQhLml0ZW1QdWJsaWNUb2tlbkV4Y2hhbmdlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGllbnRfaWQ6IHBsYWlkVXRpbHMucGxhaWRDbGllbnRJZCEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VjcmV0OiBwbGFpZFV0aWxzLnBsYWlkU2VjcmV0ISxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwdWJsaWNfdG9rZW46IHVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLnB1YmxpY1Rva2VuXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdXBkYXRlIHRoZSBhY2Nlc3MgdG9rZW4gaW5mb3JtYXRpb24gZXhjaGFuZ2VkXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5rIS5hY2Nlc3NUb2tlbiA9IGV4Y2hhbmdlVG9rZW5SZXNwb25zZS5kYXRhLmFjY2Vzc190b2tlbjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmshLnJlcXVlc3RJZCA9IGV4Y2hhbmdlVG9rZW5SZXNwb25zZS5kYXRhLnJlcXVlc3RfaWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5rIS5pdGVtSWQgPSBleGNoYW5nZVRva2VuUmVzcG9uc2UuZGF0YS5pdGVtX2lkO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gaWRlbnRpZnkgd2hhdCBvdGhlciBhdHRyaWJ1dGVzIHdlIG5lZWQgdG8gdXBkYXRlIGJhc2VkIG9uIHRoZSBpbnB1dFxuICAgICAgICAgICAgICAgICAgICBpZiAodXBkYXRlQWNjb3VudExpbmtJbnB1dC5hY2NvdW50TGlua0RldGFpbHMuYWNjb3VudExpbmtFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGluayEuYWNjb3VudExpbmtFcnJvciA9IHVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLmFjY291bnRMaW5rRXJyb3I7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLmFjY291bnRzICYmIHVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLmFjY291bnRzLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGluayEuYWNjb3VudHMgPSB1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscyEuYWNjb3VudHM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLmluc3RpdHV0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5rIS5pbnN0aXR1dGlvbiA9IHVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLmluc3RpdHV0aW9uO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5yZXF1ZXN0SWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmshLnJlcXVlc3RJZCA9IHVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLnJlcXVlc3RJZDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAodXBkYXRlQWNjb3VudExpbmtJbnB1dC5hY2NvdW50TGlua0RldGFpbHMubGlua1Nlc3Npb25JZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGluayEubGlua1Nlc3Npb25JZCA9IHVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLmxpbmtTZXNzaW9uSWQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLml0ZW1JZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGluayEuaXRlbUlkID0gdXBkYXRlQWNjb3VudExpbmtJbnB1dC5hY2NvdW50TGlua0RldGFpbHMuaXRlbUlkO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5hY2Nlc3NUb2tlbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGluayEuYWNjZXNzVG9rZW4gPSB1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5hY2Nlc3NUb2tlbjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyB1cGRhdGUgdGhlIGFjY291bnQgbGluayBiYXNlZCBvbiB0aGUgcGFzc2VkIGluIG9iamVjdFxuICAgICAgICAgICAgYXdhaXQgZG9jQ2xpZW50LnB1dCh7XG4gICAgICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5BQ0NPVU5UX0xJTktTISxcbiAgICAgICAgICAgICAgICBJdGVtOiByZXRyaWV2ZWRBY2NvdW50TGlua1xuICAgICAgICAgICAgfSkucHJvbWlzZSgpO1xuXG4gICAgICAgICAgICAvLyByZXR1cm4gdGhlIHVwZGF0ZWQgbGluayBvYmplY3RcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZGF0YTogcmV0cmlldmVkQWNjb3VudExpbmtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zb2xlLmxvZyhgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgdXBkYXRlQWNjb3VudExpbmsgbXV0YXRpb24ge31gLCBlcnIpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgdXBkYXRlQWNjb3VudExpbmsgbXV0YXRpb24uICR7ZXJyfWAsXG4gICAgICAgICAgICBlcnJvclR5cGU6IExpbmtFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgIH07XG4gICAgfVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHVzZWQgdG8gY2hlY2sgZm9yIGFjY291bnQgZHVwbGljYXRlcyBhbmQgdXBkYXRlIHRoZW0gYWNjb3JkaW5nbHlcbiAqXG4gKiBAcGFyYW0gdXBkYXRlQWNjb3VudExpbmtJbnB1dCB0aGUgYWNjb3VudCBsaW5rIHRvIHVwZGF0ZVxuICogQHBhcmFtIHJldHJpZXZlZEFjY291bnRMaW5rIHRoZSBhY2NvdW50IGxpbmsgb2JqZWN0IHJldHJpZXZlZFxuICovXG5jb25zdCBjaGVja0FjY291bnREdXBsaWNhdGVzID0gKHVwZGF0ZUFjY291bnRMaW5rSW5wdXQ6IFVwZGF0ZUFjY291bnRMaW5rSW5wdXQsIHJldHJpZXZlZEFjY291bnRMaW5rOiBBY2NvdW50TGluayk6IHZvaWQgPT4ge1xuICAgIGNvbnN0IHVwZGF0ZWRBY2NvdW50cyA9IHVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLmFjY291bnRzO1xuICAgIGNvbnN0IHVwZGF0ZWRJbnN0aXR1dGlvbiA9IHVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLmluc3RpdHV0aW9uO1xuXG4gICAgaWYgKHVwZGF0ZWRBY2NvdW50cyAmJiB1cGRhdGVkQWNjb3VudHMubGVuZ3RoICE9PSAwICYmIHVwZGF0ZWRJbnN0aXR1dGlvbikge1xuICAgICAgICBmb3IgKGNvbnN0IGxpbmsgb2YgcmV0cmlldmVkQWNjb3VudExpbmsubGlua3MpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbXBhcmFibGVBY2NvdW50cyA9IGxpbmshLmFjY291bnRzO1xuICAgICAgICAgICAgY29uc3QgY29tcGFyYWJsZUluc3RpdHV0aW9uID0gbGluayEuaW5zdGl0dXRpb247XG5cbiAgICAgICAgICAgIC8vIHBlcmZvcm0gY29tcGFyaXNvbiBhbmQgcmVtb3ZlIGZyb20gdGhlIGxpc3Qgb2ZyIHVwZGF0ZWRBY2NvdW50cyBpZiBpdCBleGlzdHMgYWxyZWFkeSBpbiB0aGUgc2FtZSBsaW5rIG9yIGluIGFub3RoZXIgb25lXG4gICAgICAgICAgICBpZiAoY29tcGFyYWJsZUluc3RpdHV0aW9uICYmIGNvbXBhcmFibGVBY2NvdW50cyAmJiBjb21wYXJhYmxlQWNjb3VudHMubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgaWYgKCh1cGRhdGVkSW5zdGl0dXRpb24ubmFtZSA9PT0gY29tcGFyYWJsZUluc3RpdHV0aW9uLm5hbWUpICYmICh1cGRhdGVkSW5zdGl0dXRpb24uaWQgPT09IGNvbXBhcmFibGVJbnN0aXR1dGlvbi5pZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlZEFjY291bnRzLmZvckVhY2godXBkYXRlQWNjb3VudCA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY2hlY2tlZEluZGV4OiBudW1iZXIgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGFyYWJsZUFjY291bnRzLmZvckVhY2goY29tcGFyYWJsZUFjY291bnQgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb21wYXJhYmxlQWNjb3VudCEubWFzayA9PT0gdXBkYXRlQWNjb3VudCEubWFzayAmJiBjb21wYXJhYmxlQWNjb3VudCEubmFtZSA9PT0gdXBkYXRlQWNjb3VudCEubmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBkZWxldGUgdGhlIGVsZW1lbnQgZnJvbSB0aGUgbGlzdCBvZiBhY2NvdW50c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVkQWNjb3VudHMuc3BsaWNlKGNoZWNrZWRJbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrZWRJbmRleCsrO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==