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
                            if (comparableAccount.mask === updateAccount.mask && comparableAccount.name === updateAccount.name) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlQWNjb3VudExpbmsuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL3Jlc29sdmVycy91cGRhdGVBY2NvdW50TGluay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDZDQUErQjtBQUMvQiwrREFBa0g7QUFDbEgsb0RBQStDO0FBRS9DOzs7OztHQUtHO0FBQ0ksTUFBTSxpQkFBaUIsR0FBRyxLQUFLLEVBQUUsc0JBQThDLEVBQWdDLEVBQUU7SUFDcEgsSUFBSTtRQUNBLDRDQUE0QztRQUM1QyxNQUFNLFNBQVMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLENBQUM7UUFFcEQsdUVBQXVFO1FBQ3ZFLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxrQkFBa0IsQ0FBQyxnQkFBZ0I7WUFDM0QsQ0FDSSxDQUFDLENBQUMsc0JBQXNCLENBQUMsa0JBQWtCLENBQUMsUUFBUSxJQUFJLENBQUMsc0JBQXNCLENBQUMsa0JBQWtCLENBQUMsV0FBVyxDQUFDO2dCQUMvRyxDQUFDLENBQUMsc0JBQXNCLENBQUMsa0JBQWtCLENBQUMsUUFBUSxJQUFJLHNCQUFzQixDQUFDLGtCQUFrQixDQUFDLFdBQVcsQ0FBQztnQkFDOUcsQ0FBQyxzQkFBc0IsQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLENBQUMsQ0FDakg7WUFDRCxDQUNJLENBQUMsQ0FBQyxzQkFBc0IsQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLENBQUM7Z0JBQy9HLENBQUMsQ0FBQyxzQkFBc0IsQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLElBQUksc0JBQXNCLENBQUMsa0JBQWtCLENBQUMsV0FBVyxDQUFDO2dCQUM5RyxDQUFDLHNCQUFzQixDQUFDLGtCQUFrQixD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QyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgQVdTIGZyb20gJ2F3cy1zZGsnO1xuaW1wb3J0IHtBY2NvdW50TGluaywgQWNjb3VudExpbmtSZXNwb25zZSwgTGlua0Vycm9yVHlwZSwgVXBkYXRlQWNjb3VudExpbmtJbnB1dH0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcbmltcG9ydCB7UGxhaWRVdGlsc30gZnJvbSBcIi4uL3V0aWxzL3BsYWlkVXRpbHNcIjtcblxuLyoqXG4gKiBVcGRhdGVBY2NvdW50TGluayByZXNvbHZlclxuICpcbiAqIEBwYXJhbSB1cGRhdGVBY2NvdW50TGlua0lucHV0IGlucHV0IHRvIHVwZGF0ZSBhbiBhY2NvdW50IGxpbmsgdG9cbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgQWNjb3VudExpbmtSZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IHVwZGF0ZUFjY291bnRMaW5rID0gYXN5bmMgKHVwZGF0ZUFjY291bnRMaW5rSW5wdXQ6IFVwZGF0ZUFjY291bnRMaW5rSW5wdXQpOiBQcm9taXNlPEFjY291bnRMaW5rUmVzcG9uc2U+ID0+IHtcbiAgICB0cnkge1xuICAgICAgICAvLyBpbml0aWFsaXppbmcgdGhlIER5bmFtb0RCIGRvY3VtZW50IGNsaWVudFxuICAgICAgICBjb25zdCBkb2NDbGllbnQgPSBuZXcgQVdTLkR5bmFtb0RCLkRvY3VtZW50Q2xpZW50KCk7XG5cbiAgICAgICAgLy8gdmFsaWRhdGluZyB0aGF0IHRoZSBhcHByb3ByaWF0ZSB1cGRhdGUgbGluayBwYXJhbWV0ZXJzIGFyZSBwYXNzZWQgaW5cbiAgICAgICAgaWYgKCF1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5hY2NvdW50TGlua0Vycm9yICYmXG4gICAgICAgICAgICAoXG4gICAgICAgICAgICAgICAgKCF1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5hY2NvdW50cyAmJiAhdXBkYXRlQWNjb3VudExpbmtJbnB1dC5hY2NvdW50TGlua0RldGFpbHMucHVibGljVG9rZW4pIHx8XG4gICAgICAgICAgICAgICAgKCF1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5hY2NvdW50cyAmJiB1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5wdWJsaWNUb2tlbikgfHxcbiAgICAgICAgICAgICAgICAodXBkYXRlQWNjb3VudExpbmtJbnB1dC5hY2NvdW50TGlua0RldGFpbHMuYWNjb3VudHMgJiYgIXVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLnB1YmxpY1Rva2VuKVxuICAgICAgICAgICAgKSAmJlxuICAgICAgICAgICAgKFxuICAgICAgICAgICAgICAgICghdXBkYXRlQWNjb3VudExpbmtJbnB1dC5hY2NvdW50TGlua0RldGFpbHMuYWNjb3VudHMgJiYgIXVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLmluc3RpdHV0aW9uKSB8fFxuICAgICAgICAgICAgICAgICghdXBkYXRlQWNjb3VudExpbmtJbnB1dC5hY2NvdW50TGlua0RldGFpbHMuYWNjb3VudHMgJiYgdXBkYXRlQWNjb3VudExpbmtJbnB1dC5hY2NvdW50TGlua0RldGFpbHMuaW5zdGl0dXRpb24pIHx8XG4gICAgICAgICAgICAgICAgKHVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLmFjY291bnRzICYmICF1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5pbnN0aXR1dGlvbilcbiAgICAgICAgICAgICkgJiZcbiAgICAgICAgICAgIChcbiAgICAgICAgICAgICAgICAoIXVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLmxpbmtTZXNzaW9uSWQgJiYgIXVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLnJlcXVlc3RJZCkgfHxcbiAgICAgICAgICAgICAgICAoIXVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLmxpbmtTZXNzaW9uSWQgJiYgdXBkYXRlQWNjb3VudExpbmtJbnB1dC5hY2NvdW50TGlua0RldGFpbHMucmVxdWVzdElkKSB8fFxuICAgICAgICAgICAgICAgICh1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5saW5rU2Vzc2lvbklkICYmICF1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5yZXF1ZXN0SWQpXG4gICAgICAgICAgICApICYmXG4gICAgICAgICAgICAoXG4gICAgICAgICAgICAgICAgKCF1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5pdGVtSWQgJiYgIXVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLmFjY2Vzc1Rva2VuKSB8fFxuICAgICAgICAgICAgICAgICghdXBkYXRlQWNjb3VudExpbmtJbnB1dC5hY2NvdW50TGlua0RldGFpbHMuaXRlbUlkICYmIHVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLmFjY2Vzc1Rva2VuKSB8fFxuICAgICAgICAgICAgICAgICh1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5pdGVtSWQgJiYgIXVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLmFjY2Vzc1Rva2VuKVxuICAgICAgICAgICAgKVxuICAgICAgICApIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBJbnZhbGlkIGxpbmsgcGFyYW1ldGVycyB0byB1cGRhdGUgYWNjb3VudCBsaW5rIHdpdGggJHt1cGRhdGVBY2NvdW50TGlua0lucHV0fWApO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBJbnZhbGlkIGxpbmsgcGFyYW1ldGVycyB0byB1cGRhdGUgYWNjb3VudCBsaW5rIHdpdGhgLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTGlua0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyByZXRyaWV2ZSB0aGUgYWNjb3VudCBsaW5rIG9iamVjdCBnaXZlbiB0aGUgYWNjb3VudCBsaW5rIGlkICh1c2VyIGlkKVxuICAgICAgICBjb25zdCB7SXRlbX0gPSBhd2FpdCBkb2NDbGllbnQuZ2V0KHtcbiAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuQUNDT1VOVF9MSU5LUyEsXG4gICAgICAgICAgICBLZXk6IHtpZDogdXBkYXRlQWNjb3VudExpbmtJbnB1dC5pZH1cbiAgICAgICAgfSkucHJvbWlzZSgpO1xuXG4gICAgICAgIC8vIG90aGVyd2lzZSBnZXQgdGhlIGV4aXN0aW5nIGFjY291bnQgYW5kIGFkZCBhIG5ldyBsaW5rIGluIGl0XG4gICAgICAgIGxldCByZXRyaWV2ZWRBY2NvdW50TGluazogQWNjb3VudExpbmtcblxuICAgICAgICAvLyBpZiBhbiBhY2NvdW50IGRvZXMgbm90IGV4aXN0LCB0aGVuIHJldHVybiBhbiBlcnJvciwgc2luY2Ugd2UncmUgYXR0ZW1wdGluZyB0byB1cGRhdGUgc29tZXRoaW5nIHRoYXQgZG9lcyBub3QgZXhpc3RcbiAgICAgICAgaWYgKCFJdGVtKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVXBkYXRlIHRyaWdnZXJlZCBmb3Igbm9uIGV4aXN0ZW50IGFjY291bnQgbGluayAke3VwZGF0ZUFjY291bnRMaW5rSW5wdXQuaWR9YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTGlua0Vycm9yVHlwZS5Ob25lT3JBYnNlbnRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBvdGhlcndpc2UgZ2V0IHRoZSBleGlzdGluZyBhY2NvdW50IGFuZCBhZGQgYSBuZXcgbGluayBpbiBpdFxuICAgICAgICAgICAgcmV0cmlldmVkQWNjb3VudExpbmsgPSBJdGVtISBhcyBBY2NvdW50TGluaztcblxuICAgICAgICAgICAgLy8gY2hlY2sgYWdhaW5zdCBkdXBsaWNhdGUgYWNjb3VudHMsIGJ5IGNoZWNraW5nIGlmIHRoZSBzYW1lIGFjY291bnQgbnVtYmVyIHdhcyBhZGRlZCBiZWZvcmUsIGZvciB0aGUgc2FtZSBpbnN0aXR1dGlvblxuICAgICAgICAgICAgY2hlY2tBY2NvdW50RHVwbGljYXRlcyh1cGRhdGVBY2NvdW50TGlua0lucHV0LCByZXRyaWV2ZWRBY2NvdW50TGluayk7XG5cbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBzcGVjaWZpYyBsaW5rIHdoaWNoIHdlIGFyZSBydW5uaW5nIHVwZGF0ZXMgZm9yXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGxpbmsgb2YgcmV0cmlldmVkQWNjb3VudExpbmsubGlua3MpIHtcbiAgICAgICAgICAgICAgICBpZiAobGluayEubGlua1Rva2VuID09PSB1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5saW5rVG9rZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgbGluayEudXBkYXRlZEF0ID0gdXBkYXRlQWNjb3VudExpbmtJbnB1dC51cGRhdGVkQXQgPyB1cGRhdGVBY2NvdW50TGlua0lucHV0LnVwZGF0ZWRBdCA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBpZGVudGl0eSB3aGV0aGVyIHRoaXMgaXMgYW4gdXBkYXRlIGZvciB3aGljaCBhIHRva2VuIGV4Y2hhbmdlIGlzIG5lZWRlZCAoZG8gbm90IGV4Y2hhbmdlIGZvciBkdXBsaWNhdGUgYWNjb3VudHMpXG4gICAgICAgICAgICAgICAgICAgIGlmICh1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5wdWJsaWNUb2tlbiAmJiB1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5hY2NvdW50c1xuICAgICAgICAgICAgICAgICAgICAgICAgJiYgdXBkYXRlQWNjb3VudExpbmtJbnB1dC5hY2NvdW50TGlua0RldGFpbHMuYWNjb3VudHMubGVuZ3RoICE9PSAwICYmIHVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLmluc3RpdHV0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnUGVyZm9ybWluZyBhIHRva2VuIGV4Y2hhbmdlIGZvciB7fScsIHVwZGF0ZUFjY291bnRMaW5rSW5wdXQuaWQpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpbml0aWFsaXplIHRoZSBQbGFpZCBVdGlsc1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcGxhaWRVdGlscyA9IGF3YWl0IFBsYWlkVXRpbHMuc2V0dXAoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2FsbCB0aGUgUGxhaWQgQVBJIHRvIGV4Y2hhbmdlIHRoZSBQdWJsaWMgVG9rZW4sIGZvciBhbiBBY2Nlc3MgVG9rZW5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGV4Y2hhbmdlVG9rZW5SZXNwb25zZSA9IGF3YWl0IHBsYWlkVXRpbHMucGxhaWRDbGllbnQhLml0ZW1QdWJsaWNUb2tlbkV4Y2hhbmdlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGllbnRfaWQ6IHBsYWlkVXRpbHMucGxhaWRDbGllbnRJZCEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VjcmV0OiBwbGFpZFV0aWxzLnBsYWlkU2VjcmV0ISxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwdWJsaWNfdG9rZW46IHVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLnB1YmxpY1Rva2VuXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdXBkYXRlIHRoZSBhY2Nlc3MgdG9rZW4gaW5mb3JtYXRpb24gZXhjaGFuZ2VkXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5rIS5hY2Nlc3NUb2tlbiA9IGV4Y2hhbmdlVG9rZW5SZXNwb25zZS5kYXRhLmFjY2Vzc190b2tlbjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmshLnJlcXVlc3RJZCA9IGV4Y2hhbmdlVG9rZW5SZXNwb25zZS5kYXRhLnJlcXVlc3RfaWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5rIS5pdGVtSWQgPSBleGNoYW5nZVRva2VuUmVzcG9uc2UuZGF0YS5pdGVtX2lkO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gaWRlbnRpZnkgd2hhdCBvdGhlciBhdHRyaWJ1dGVzIHdlIG5lZWQgdG8gdXBkYXRlIGJhc2VkIG9uIHRoZSBpbnB1dFxuICAgICAgICAgICAgICAgICAgICBpZiAodXBkYXRlQWNjb3VudExpbmtJbnB1dC5hY2NvdW50TGlua0RldGFpbHMuYWNjb3VudExpbmtFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGluayEuYWNjb3VudExpbmtFcnJvciA9IHVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLmFjY291bnRMaW5rRXJyb3I7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLmFjY291bnRzICYmIHVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLmFjY291bnRzLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGluayEuYWNjb3VudHMgPSB1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscyEuYWNjb3VudHM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLmluc3RpdHV0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5rIS5pbnN0aXR1dGlvbiA9IHVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLmluc3RpdHV0aW9uO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5yZXF1ZXN0SWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmshLnJlcXVlc3RJZCA9IHVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLnJlcXVlc3RJZDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAodXBkYXRlQWNjb3VudExpbmtJbnB1dC5hY2NvdW50TGlua0RldGFpbHMubGlua1Nlc3Npb25JZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGluayEubGlua1Nlc3Npb25JZCA9IHVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLmxpbmtTZXNzaW9uSWQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjb3VudExpbmtEZXRhaWxzLml0ZW1JZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGluayEuaXRlbUlkID0gdXBkYXRlQWNjb3VudExpbmtJbnB1dC5hY2NvdW50TGlua0RldGFpbHMuaXRlbUlkO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5hY2Nlc3NUb2tlbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGluayEuYWNjZXNzVG9rZW4gPSB1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRMaW5rRGV0YWlscy5hY2Nlc3NUb2tlbjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyB1cGRhdGUgdGhlIGFjY291bnQgbGluayBiYXNlZCBvbiB0aGUgcGFzc2VkIGluIG9iamVjdFxuICAgICAgICAgICAgYXdhaXQgZG9jQ2xpZW50LnB1dCh7XG4gICAgICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5BQ0NPVU5UX0xJTktTISxcbiAgICAgICAgICAgICAgICBJdGVtOiByZXRyaWV2ZWRBY2NvdW50TGlua1xuICAgICAgICAgICAgfSkucHJvbWlzZSgpO1xuXG4gICAgICAgICAgICAvLyByZXR1cm4gdGhlIHVwZGF0ZWQgbGluayBvYmplY3RcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZGF0YTogcmV0cmlldmVkQWNjb3VudExpbmtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zb2xlLmxvZyhgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgdXBkYXRlQWNjb3VudExpbmsgbXV0YXRpb24ge31gLCBlcnIpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgdXBkYXRlQWNjb3VudExpbmsgbXV0YXRpb24gJHtlcnJ9YCxcbiAgICAgICAgICAgIGVycm9yVHlwZTogTGlua0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgfTtcbiAgICB9XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdXNlZCB0byBjaGVjayBmb3IgYWNjb3VudCBkdXBsaWNhdGVzIGFuZCB1cGRhdGUgdGhlbSBhY2NvcmRpbmdseVxuICpcbiAqIEBwYXJhbSB1cGRhdGVBY2NvdW50TGlua0lucHV0IHRoZSBhY2NvdW50IGxpbmsgdG8gdXBkYXRlXG4gKiBAcGFyYW0gcmV0cmlldmVkQWNjb3VudExpbmsgdGhlIGFjY291bnQgbGluayBvYmplY3QgcmV0cmlldmVkXG4gKi9cbmNvbnN0IGNoZWNrQWNjb3VudER1cGxpY2F0ZXMgPSAodXBkYXRlQWNjb3VudExpbmtJbnB1dDogVXBkYXRlQWNjb3VudExpbmtJbnB1dCwgcmV0cmlldmVkQWNjb3VudExpbms6IEFjY291bnRMaW5rKTogdm9pZCA9PiB7XG4gICAgY29uc3QgdXBkYXRlZEFjY291bnRzID0gdXBkYXRlQWNjb3VudExpbmtJbnB1dC5hY2NvdW50TGlua0RldGFpbHMuYWNjb3VudHM7XG4gICAgY29uc3QgdXBkYXRlZEluc3RpdHV0aW9uID0gdXBkYXRlQWNjb3VudExpbmtJbnB1dC5hY2NvdW50TGlua0RldGFpbHMuaW5zdGl0dXRpb247XG5cbiAgICBpZiAodXBkYXRlZEFjY291bnRzICYmIHVwZGF0ZWRBY2NvdW50cy5sZW5ndGggIT09IDAgJiYgdXBkYXRlZEluc3RpdHV0aW9uKSB7XG4gICAgICAgIGZvciAoY29uc3QgbGluayBvZiByZXRyaWV2ZWRBY2NvdW50TGluay5saW5rcykge1xuICAgICAgICAgICAgY29uc3QgY29tcGFyYWJsZUFjY291bnRzID0gbGluayEuYWNjb3VudHM7XG4gICAgICAgICAgICBjb25zdCBjb21wYXJhYmxlSW5zdGl0dXRpb24gPSBsaW5rIS5pbnN0aXR1dGlvbjtcblxuICAgICAgICAgICAgLy8gcGVyZm9ybSBjb21wYXJpc29uIGFuZCByZW1vdmUgZnJvbSB0aGUgbGlzdCBvZnIgdXBkYXRlZEFjY291bnRzIGlmIGl0IGV4aXN0cyBhbHJlYWR5IGluIHRoZSBzYW1lIGxpbmsgb3IgaW4gYW5vdGhlciBvbmVcbiAgICAgICAgICAgIGlmIChjb21wYXJhYmxlSW5zdGl0dXRpb24gJiYgY29tcGFyYWJsZUFjY291bnRzICYmIGNvbXBhcmFibGVBY2NvdW50cy5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgICAgICBpZiAoKHVwZGF0ZWRJbnN0aXR1dGlvbi5uYW1lID09PSBjb21wYXJhYmxlSW5zdGl0dXRpb24ubmFtZSkgJiYgKHVwZGF0ZWRJbnN0aXR1dGlvbi5pZCA9PT0gY29tcGFyYWJsZUluc3RpdHV0aW9uLmlkKSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgY2hlY2tlZEluZGV4OiBudW1iZXIgPSAwO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHVwZGF0ZUFjY291bnQgb2YgdXBkYXRlQWNjb3VudExpbmtJbnB1dC5hY2NvdW50TGlua0RldGFpbHMhLmFjY291bnRzISkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBjb21wYXJhYmxlQWNjb3VudCBvZiBjb21wYXJhYmxlQWNjb3VudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29tcGFyYWJsZUFjY291bnQhLm1hc2sgPT09IHVwZGF0ZUFjY291bnQhLm1hc2sgJiYgY29tcGFyYWJsZUFjY291bnQhLm5hbWUgPT09IHVwZGF0ZUFjY291bnQhLm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZGVsZXRlIHRoZSBlbGVtZW50IGZyb20gdGhlIGxpc3Qgb2YgYWNjb3VudHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlZEFjY291bnRzLnNwbGljZShjaGVja2VkSW5kZXgsIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrZWRJbmRleCsrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuIl19