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
    try {
        // initializing the DynamoDB document client
        const docClient = new AWS.DynamoDB.DocumentClient();
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
                    link.updatedAt = updateAccountLinkInput.updatedAt ? updateAccountLinkInput.updatedAt : new Date().toISOString();
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
            errorMessage: `Unexpected error while executing updateAccountLink mutation ${err}`,
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
                    let checkedIndex = 0;
                    for (const updateAccount of updateAccountLinkInput.accountLinkDetails.accounts) {
                        for (const comparableAccount of comparableAccounts) {
                            if (comparableAccount.mask === updateAccount.mask
                                && comparableAccount.name === updateAccount.name
                                && comparableAccount.type === updateAccount.type) {
                                // delete the element from the list of accounts
                                updatedAccounts.splice(checkedIndex, 1);
                            }
                        }
                        checkedIndex++;
                    }
                }
            }
        }
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlQWNjb3VudExpbmsuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL3Jlc29sdmVycy91cGRhdGVBY2NvdW50TGluay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDZDQUErQjtBQUMvQiwrREFBa0g7QUFDbEgsb0RBQStDO0FBRS9DOzs7OztHQUtHO0FBQ0ksTUFBTSxpQkFBaUIsR0FBRyxLQUFLLEVBQUUsc0JBQThDLEVBQWdDLEVBQUU7SUFDcEgsSUFBSTtRQUNBLDRDQUE0QztRQUM1QyxNQUFNLFNBQVMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLENBQUM7UUFFcEQsdUVBQXVFO1FBQ3ZFLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxrQkFBa0IsQ0FBQyxnQkFBZ0I7WUFDM0QsQ0FDSSxDQUFDLENBQUMsc0JBQXNCLENBQUMsa0JBQWtCLENBQUMsUUFBUSxJQUFJLENBQUMsc0JBQXNCLENBQUMsa0JBQWtCLENBQUMsV0FBVyxDQUFDO2dCQUMvRyxDQUFDLENBQUMsc0JBQXNCLENBQUMsa0JBQWtCLENBQUMsUUFBUSxJQUFJLHNCQUFzQixDQUFDLGtCQUFrQixDQUFDLFdBQVcsQ0FBQztnQkFDOUcsQ0FBQyxzQkFBc0IsQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLENBQUMsQ0FDakg7WUFDRCxDQUNJLENBQUMsQ0FBQyxzQkFBc0IsQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLENBQUM7Z0JBQy9HLENBQUMsQ0FBQyxzQkFBc0IsQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLElBQUksc0JBQXNCLENBQUMsa0JBQWtCLENBQUMsV0FBVyxDQUFDO2dCQUM5RyxDQUFDLHNCQUFzQixDQUFDLGtCQUFrQixD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RUFBRSxDQUFDO3FCQUNsQjtpQkFDSjthQUNKO1NBQ0o7S0FDSjtBQUNMLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIEFXUyBmcm9tICdhd3Mtc2RrJztcbmltcG9ydCB7QWNjb3VudExpbmssIEFjY291bnRMaW5rUmVzcG9uc2UsIExpbmtFcnJvclR5cGUsIFVwZGF0ZUFjY291bnRMaW5rSW5wdXR9IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5pbXBvcnQge1BsYWlkVXRpbHN9IGZyb20gXCIuLi91dGlscy9wbGFpZFV0aWxzXCI7XG5cbi8qKlxuICogVXBkYXRlQWNjb3VudExpbmsgcmVzb2x2ZXJcbiAqXG4gKiBAcGFyYW0gdXBkYXRlQWNjb3VudExpbmtJbnB1dCBpbnB1dCB0byB1cGRhdGUgYW4gYWNjb3VudCBsaW5rIHRvXG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIEFjY291bnRMaW5rUmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCB1cGRhdGVBY2NvdW50TGluayA9IGFzeW5jICh1cGRhdGVBY2NvdW50TGlua0lucHV0OiBVcGRhdGVBY2NvdW50TGlua0lucHV0KTogUHJvbWlzZTxBY2NvdW50TGlua1Jlc3BvbnNlPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gaW5pdGlhbGl6aW5nIHRoZSBEeW5hbW9EQiBkb2N1bWVudCBjbGllbnRcbiAgICAgICAgY29uc3QgZG9jQ2xpZW50ID0gbmV3IEFXUy5EeW5hbW9EQi5Eb2N1bWVudENsaWVudCgpO1xuXG4gICAgICAgIC8vIHZhbGlkYXRpbmcgdGhhdCB0aGUgYXBwcm9wcmlhdGUgdXBkYXRlIGxpbmsgcGFyYW1ldGVycyBhcmUgcGFzc2VkIGluXG4gICAgICAgIGlmICghdXBkYXRlQWNjb3VudExpbmtJbnB1dC5hY2NvdW50TGlua0RldGFpbHMuYWNjb3VudExpbmtFcnJvciAmJlxuICAgICAgICAgICAgKFxuICAgICAgICAgICAgICAgICghdXBkYXRlQWNjb3VudExpbmtJbnB1dC5hY2NvdW50TGlua0RldGFpbHMuYWNjb3VudHMgJiYgIXVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLnB1YmxpY1Rva2VuKSB8fFxuICAgICAgICAgICAgICAgICghdXBkYXRlQWNjb3VudExpbmtJbnB1dC5hY2NvdW50TGlua0RldGFpbHMuYWNjb3VudHMgJiYgdXBkYXRlQWNjb3VudExpbmtJbnB1dC5hY2NvdW50TGlua0RldGFpbHMucHVibGljVG9rZW4pIHx8XG4gICAgICAgICAgICAgICAgKHVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLmFjY291bnRzICYmICF1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5wdWJsaWNUb2tlbilcbiAgICAgICAgICAgICkgJiZcbiAgICAgICAgICAgIChcbiAgICAgICAgICAgICAgICAoIXVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLmFjY291bnRzICYmICF1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5pbnN0aXR1dGlvbikgfHxcbiAgICAgICAgICAgICAgICAoIXVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLmFjY291bnRzICYmIHVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLmluc3RpdHV0aW9uKSB8fFxuICAgICAgICAgICAgICAgICh1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5hY2NvdW50cyAmJiAhdXBkYXRlQWNjb3VudExpbmtJbnB1dC5hY2NvdW50TGlua0RldGFpbHMuaW5zdGl0dXRpb24pXG4gICAgICAgICAgICApICYmXG4gICAgICAgICAgICAoXG4gICAgICAgICAgICAgICAgKCF1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5saW5rU2Vzc2lvbklkICYmICF1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5yZXF1ZXN0SWQpIHx8XG4gICAgICAgICAgICAgICAgKCF1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5saW5rU2Vzc2lvbklkICYmIHVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLnJlcXVlc3RJZCkgfHxcbiAgICAgICAgICAgICAgICAodXBkYXRlQWNjb3VudExpbmtJbnB1dC5hY2NvdW50TGlua0RldGFpbHMubGlua1Nlc3Npb25JZCAmJiAhdXBkYXRlQWNjb3VudExpbmtJbnB1dC5hY2NvdW50TGlua0RldGFpbHMucmVxdWVzdElkKVxuICAgICAgICAgICAgKSAmJlxuICAgICAgICAgICAgKFxuICAgICAgICAgICAgICAgICghdXBkYXRlQWNjb3VudExpbmtJbnB1dC5hY2NvdW50TGlua0RldGFpbHMuaXRlbUlkICYmICF1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5hY2Nlc3NUb2tlbikgfHxcbiAgICAgICAgICAgICAgICAoIXVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLml0ZW1JZCAmJiB1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5hY2Nlc3NUb2tlbikgfHxcbiAgICAgICAgICAgICAgICAodXBkYXRlQWNjb3VudExpbmtJbnB1dC5hY2NvdW50TGlua0RldGFpbHMuaXRlbUlkICYmICF1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5hY2Nlc3NUb2tlbilcbiAgICAgICAgICAgIClcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgSW52YWxpZCBsaW5rIHBhcmFtZXRlcnMgdG8gdXBkYXRlIGFjY291bnQgbGluayB3aXRoICR7dXBkYXRlQWNjb3VudExpbmtJbnB1dH1gKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgSW52YWxpZCBsaW5rIHBhcmFtZXRlcnMgdG8gdXBkYXRlIGFjY291bnQgbGluayB3aXRoYCxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IExpbmtFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gcmV0cmlldmUgdGhlIGFjY291bnQgbGluayBvYmplY3QgZ2l2ZW4gdGhlIGFjY291bnQgbGluayBpZCAodXNlciBpZClcbiAgICAgICAgY29uc3Qge0l0ZW19ID0gYXdhaXQgZG9jQ2xpZW50LmdldCh7XG4gICAgICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52LkFDQ09VTlRfTElOS1MhLFxuICAgICAgICAgICAgS2V5OiB7aWQ6IHVwZGF0ZUFjY291bnRMaW5rSW5wdXQuaWR9XG4gICAgICAgIH0pLnByb21pc2UoKTtcblxuICAgICAgICAvLyBvdGhlcndpc2UgZ2V0IHRoZSBleGlzdGluZyBhY2NvdW50IGFuZCBhZGQgYSBuZXcgbGluayBpbiBpdFxuICAgICAgICBsZXQgcmV0cmlldmVkQWNjb3VudExpbms6IEFjY291bnRMaW5rXG5cbiAgICAgICAgLy8gaWYgYW4gYWNjb3VudCBkb2VzIG5vdCBleGlzdCwgdGhlbiByZXR1cm4gYW4gZXJyb3IsIHNpbmNlIHdlJ3JlIGF0dGVtcHRpbmcgdG8gdXBkYXRlIHNvbWV0aGluZyB0aGF0IGRvZXMgbm90IGV4aXN0XG4gICAgICAgIGlmICghSXRlbSkge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVwZGF0ZSB0cmlnZ2VyZWQgZm9yIG5vbiBleGlzdGVudCBhY2NvdW50IGxpbmsgJHt1cGRhdGVBY2NvdW50TGlua0lucHV0LmlkfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IExpbmtFcnJvclR5cGUuTm9uZU9yQWJzZW50XG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gb3RoZXJ3aXNlIGdldCB0aGUgZXhpc3RpbmcgYWNjb3VudCBhbmQgYWRkIGEgbmV3IGxpbmsgaW4gaXRcbiAgICAgICAgICAgIHJldHJpZXZlZEFjY291bnRMaW5rID0gSXRlbSEgYXMgQWNjb3VudExpbms7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIGFnYWluc3QgZHVwbGljYXRlIGFjY291bnRzLCBieSBjaGVja2luZyBpZiB0aGUgc2FtZSBhY2NvdW50IG51bWJlciB3YXMgYWRkZWQgYmVmb3JlLCBmb3IgdGhlIHNhbWUgaW5zdGl0dXRpb25cbiAgICAgICAgICAgIGNoZWNrQWNjb3VudER1cGxpY2F0ZXModXBkYXRlQWNjb3VudExpbmtJbnB1dCwgcmV0cmlldmVkQWNjb3VudExpbmspO1xuXG4gICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgc3BlY2lmaWMgbGluayB3aGljaCB3ZSBhcmUgcnVubmluZyB1cGRhdGVzIGZvclxuICAgICAgICAgICAgZm9yIChjb25zdCBsaW5rIG9mIHJldHJpZXZlZEFjY291bnRMaW5rLmxpbmtzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGxpbmshLmxpbmtUb2tlbiA9PT0gdXBkYXRlQWNjb3VudExpbmtJbnB1dC5hY2NvdW50TGlua0RldGFpbHMubGlua1Rva2VuKSB7XG4gICAgICAgICAgICAgICAgICAgIGxpbmshLnVwZGF0ZWRBdCA9IHVwZGF0ZUFjY291bnRMaW5rSW5wdXQudXBkYXRlZEF0ID8gdXBkYXRlQWNjb3VudExpbmtJbnB1dC51cGRhdGVkQXQgOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gaWRlbnRpdHkgd2hldGhlciB0aGlzIGlzIGFuIHVwZGF0ZSBmb3Igd2hpY2ggYSB0b2tlbiBleGNoYW5nZSBpcyBuZWVkZWQgKGRvIG5vdCBleGNoYW5nZSBmb3IgZHVwbGljYXRlIGFjY291bnRzKVxuICAgICAgICAgICAgICAgICAgICBpZiAodXBkYXRlQWNjb3VudExpbmtJbnB1dC5hY2NvdW50TGlua0RldGFpbHMucHVibGljVG9rZW4gJiYgdXBkYXRlQWNjb3VudExpbmtJbnB1dC5hY2NvdW50TGlua0RldGFpbHMuYWNjb3VudHNcbiAgICAgICAgICAgICAgICAgICAgICAgICYmIHVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLmFjY291bnRzLmxlbmd0aCAhPT0gMCAmJiB1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5pbnN0aXR1dGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1BlcmZvcm1pbmcgYSB0b2tlbiBleGNoYW5nZSBmb3Ige30nLCB1cGRhdGVBY2NvdW50TGlua0lucHV0LmlkKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaW5pdGlhbGl6ZSB0aGUgUGxhaWQgVXRpbHNcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBsYWlkVXRpbHMgPSBhd2FpdCBQbGFpZFV0aWxzLnNldHVwKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNhbGwgdGhlIFBsYWlkIEFQSSB0byBleGNoYW5nZSB0aGUgUHVibGljIFRva2VuLCBmb3IgYW4gQWNjZXNzIFRva2VuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBleGNoYW5nZVRva2VuUmVzcG9uc2UgPSBhd2FpdCBwbGFpZFV0aWxzLnBsYWlkQ2xpZW50IS5pdGVtUHVibGljVG9rZW5FeGNoYW5nZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xpZW50X2lkOiBwbGFpZFV0aWxzLnBsYWlkQ2xpZW50SWQhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlY3JldDogcGxhaWRVdGlscy5wbGFpZFNlY3JldCEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHVibGljX3Rva2VuOiB1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5wdWJsaWNUb2tlblxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHVwZGF0ZSB0aGUgYWNjZXNzIHRva2VuIGluZm9ybWF0aW9uIGV4Y2hhbmdlZFxuICAgICAgICAgICAgICAgICAgICAgICAgbGluayEuYWNjZXNzVG9rZW4gPSBleGNoYW5nZVRva2VuUmVzcG9uc2UuZGF0YS5hY2Nlc3NfdG9rZW47XG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5rIS5yZXF1ZXN0SWQgPSBleGNoYW5nZVRva2VuUmVzcG9uc2UuZGF0YS5yZXF1ZXN0X2lkO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGluayEuaXRlbUlkID0gZXhjaGFuZ2VUb2tlblJlc3BvbnNlLmRhdGEuaXRlbV9pZDtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIGlkZW50aWZ5IHdoYXQgb3RoZXIgYXR0cmlidXRlcyB3ZSBuZWVkIHRvIHVwZGF0ZSBiYXNlZCBvbiB0aGUgaW5wdXRcbiAgICAgICAgICAgICAgICAgICAgaWYgKHVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLmFjY291bnRMaW5rRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmshLmFjY291bnRMaW5rRXJyb3IgPSB1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5hY2NvdW50TGlua0Vycm9yO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5hY2NvdW50cyAmJiB1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5hY2NvdW50cy5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmshLmFjY291bnRzID0gdXBkYXRlQWNjb3VudExpbmtJbnB1dC5hY2NvdW50TGlua0RldGFpbHMhLmFjY291bnRzO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5pbnN0aXR1dGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGluayEuaW5zdGl0dXRpb24gPSB1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5pbnN0aXR1dGlvbjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAodXBkYXRlQWNjb3VudExpbmtJbnB1dC5hY2NvdW50TGlua0RldGFpbHMucmVxdWVzdElkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5rIS5yZXF1ZXN0SWQgPSB1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5yZXF1ZXN0SWQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLmxpbmtTZXNzaW9uSWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmshLmxpbmtTZXNzaW9uSWQgPSB1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5saW5rU2Vzc2lvbklkO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5pdGVtSWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmshLml0ZW1JZCA9IHVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLml0ZW1JZDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAodXBkYXRlQWNjb3VudExpbmtJbnB1dC5hY2NvdW50TGlua0RldGFpbHMuYWNjZXNzVG9rZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmshLmFjY2Vzc1Rva2VuID0gdXBkYXRlQWNjb3VudExpbmtJbnB1dC5hY2NvdW50TGlua0RldGFpbHMuYWNjZXNzVG9rZW47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gdXBkYXRlIHRoZSBhY2NvdW50IGxpbmsgYmFzZWQgb24gdGhlIHBhc3NlZCBpbiBvYmplY3RcbiAgICAgICAgICAgIGF3YWl0IGRvY0NsaWVudC5wdXQoe1xuICAgICAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuQUNDT1VOVF9MSU5LUyEsXG4gICAgICAgICAgICAgICAgSXRlbTogcmV0cmlldmVkQWNjb3VudExpbmtcbiAgICAgICAgICAgIH0pLnByb21pc2UoKTtcblxuICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSB1cGRhdGVkIGxpbmsgb2JqZWN0XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRhdGE6IHJldHJpZXZlZEFjY291bnRMaW5rXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5sb2coYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgZXhlY3V0aW5nIHVwZGF0ZUFjY291bnRMaW5rIG11dGF0aW9uIHt9YCwgZXJyKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgZXhlY3V0aW5nIHVwZGF0ZUFjY291bnRMaW5rIG11dGF0aW9uICR7ZXJyfWAsXG4gICAgICAgICAgICBlcnJvclR5cGU6IExpbmtFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgIH07XG4gICAgfVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHVzZWQgdG8gY2hlY2sgZm9yIGFjY291bnQgZHVwbGljYXRlcyBhbmQgdXBkYXRlIHRoZW0gYWNjb3JkaW5nbHlcbiAqXG4gKiBAcGFyYW0gdXBkYXRlQWNjb3VudExpbmtJbnB1dCB0aGUgYWNjb3VudCBsaW5rIHRvIHVwZGF0ZVxuICogQHBhcmFtIHJldHJpZXZlZEFjY291bnRMaW5rIHRoZSBhY2NvdW50IGxpbmsgb2JqZWN0IHJldHJpZXZlZFxuICovXG5jb25zdCBjaGVja0FjY291bnREdXBsaWNhdGVzID0gKHVwZGF0ZUFjY291bnRMaW5rSW5wdXQ6IFVwZGF0ZUFjY291bnRMaW5rSW5wdXQsIHJldHJpZXZlZEFjY291bnRMaW5rOiBBY2NvdW50TGluayk6IHZvaWQgPT4ge1xuICAgIGNvbnN0IHVwZGF0ZWRBY2NvdW50cyA9IHVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLmFjY291bnRzO1xuICAgIGNvbnN0IHVwZGF0ZWRJbnN0aXR1dGlvbiA9IHVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLmluc3RpdHV0aW9uO1xuXG4gICAgaWYgKHVwZGF0ZWRBY2NvdW50cyAmJiB1cGRhdGVkQWNjb3VudHMubGVuZ3RoICE9PSAwICYmIHVwZGF0ZWRJbnN0aXR1dGlvbikge1xuICAgICAgICBmb3IgKGNvbnN0IGxpbmsgb2YgcmV0cmlldmVkQWNjb3VudExpbmsubGlua3MpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbXBhcmFibGVBY2NvdW50cyA9IGxpbmshLmFjY291bnRzO1xuICAgICAgICAgICAgY29uc3QgY29tcGFyYWJsZUluc3RpdHV0aW9uID0gbGluayEuaW5zdGl0dXRpb247XG5cbiAgICAgICAgICAgIC8vIHBlcmZvcm0gY29tcGFyaXNvbiBhbmQgcmVtb3ZlIGZyb20gdGhlIGxpc3Qgb2ZyIHVwZGF0ZWRBY2NvdW50cyBpZiBpdCBleGlzdHMgYWxyZWFkeSBpbiB0aGUgc2FtZSBsaW5rIG9yIGluIGFub3RoZXIgb25lXG4gICAgICAgICAgICBpZiAoY29tcGFyYWJsZUluc3RpdHV0aW9uICYmIGNvbXBhcmFibGVBY2NvdW50cyAmJiBjb21wYXJhYmxlQWNjb3VudHMubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgaWYgKCh1cGRhdGVkSW5zdGl0dXRpb24ubmFtZSA9PT0gY29tcGFyYWJsZUluc3RpdHV0aW9uLm5hbWUpICYmICh1cGRhdGVkSW5zdGl0dXRpb24uaWQgPT09IGNvbXBhcmFibGVJbnN0aXR1dGlvbi5pZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNoZWNrZWRJbmRleDogbnVtYmVyID0gMDtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCB1cGRhdGVBY2NvdW50IG9mIHVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzIS5hY2NvdW50cyEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgY29tcGFyYWJsZUFjY291bnQgb2YgY29tcGFyYWJsZUFjY291bnRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbXBhcmFibGVBY2NvdW50IS5tYXNrID09PSB1cGRhdGVBY2NvdW50IS5tYXNrXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICYmIGNvbXBhcmFibGVBY2NvdW50IS5uYW1lID09PSB1cGRhdGVBY2NvdW50IS5uYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICYmIGNvbXBhcmFibGVBY2NvdW50IS50eXBlID09PSB1cGRhdGVBY2NvdW50IS50eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGRlbGV0ZSB0aGUgZWxlbWVudCBmcm9tIHRoZSBsaXN0IG9mIGFjY291bnRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRBY2NvdW50cy5zcGxpY2UoY2hlY2tlZEluZGV4LCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjaGVja2VkSW5kZXgrKztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==