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
exports.deleteAccount = void 0;
const AWS = __importStar(require("aws-sdk"));
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const plaidUtils_1 = require("../utils/plaidUtils");
/**
 * DeleteAccount resolver
 *
 * @param deleteAccountInput object to be used for deleting and un-linking one more moe accounts from a link object
 * @returns {@link Promise} of {@link AccountResponse}
 */
const deleteAccount = async (deleteAccountInput) => {
    try {
        // initializing the DynamoDB document client
        const docClient = new AWS.DynamoDB.DocumentClient();
        // retrieve the account link object given the account link id (user id)
        const { Item } = await docClient.get({
            TableName: process.env.ACCOUNT_LINKS,
            Key: { id: deleteAccountInput.id }
        }).promise();
        // if an account does not exist, then return an error, since we're attempting to delete something that does not exist
        if (!Item) {
            const errorMessage = `Delete triggered for non existent account link ${deleteAccountInput.id}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.LinkErrorType.NoneOrAbsent
            };
        }
        else {
            // otherwise get the existing account and add a new link in it
            const retrievedAccountLink = Item;
            // compare the accounts in the matching link, as well as the ones in the input, and delete the ones that match
            const resultedAccounts = [];
            let linkFound = false;
            let matchedLink = undefined;
            for (const link of retrievedAccountLink.links) {
                // match the links for the given account link, based on the link token
                if (link.linkToken === deleteAccountInput.linkToken) {
                    linkFound = true;
                    matchedLink = link;
                    if (matchedLink.accounts && matchedLink.accounts.length !== 0 && matchedLink.institution) {
                        const remainingAccounts = matchedLink.accounts;
                        const retrievedFinancialInstitution = matchedLink.institution;
                        let checkedIndex = 0;
                        for (const matchedAccount of matchedLink.accounts) {
                            for (const targetAccount of deleteAccountInput.accounts) {
                                if ((retrievedFinancialInstitution.id === targetAccount.institution.id)
                                    && (retrievedFinancialInstitution.name === targetAccount.institution.name)
                                    && (matchedAccount.mask === targetAccount.mask
                                        && matchedAccount.name === targetAccount.name
                                        && matchedAccount.type === targetAccount.type)) {
                                    remainingAccounts.splice(checkedIndex, 1);
                                }
                            }
                            checkedIndex++;
                        }
                        // modify the updated timestamp
                        matchedLink.updatedAt = deleteAccountInput.updatedAt ? deleteAccountInput.updatedAt : new Date().toISOString();
                        /**
                         * if the link does not have any accounts left in it, remove all accounts for the link, remove the link, and unlink the access token for them
                         */
                        if (remainingAccounts && remainingAccounts.length === 0) {
                            // initialize the Plaid Utils
                            const plaidUtils = await plaidUtils_1.PlaidUtils.setup();
                            // call the Plaid API to unlink the access token
                            const removedItemResponse = await plaidUtils.plaidClient.itemRemove({
                                client_id: plaidUtils.plaidClientId,
                                secret: plaidUtils.plaidSecret,
                                access_token: matchedLink.accessToken
                            });
                            // override/change the request id for the matched link, for debugging purposes
                            matchedLink.requestId = removedItemResponse.data.request_id;
                            // set the link accounts to an empty accounts list, since we removed all of them from the link
                            matchedLink.accounts = [];
                        }
                        else {
                            /**
                             * if the link does have some accounts left in it, just set the accounts for the link, as the remaining accounts
                             */
                            matchedLink.accounts = remainingAccounts;
                            // add the remaining accounts to the resulting object
                            for (const remainingAccount of remainingAccounts) {
                                resultedAccounts.push({
                                    id: remainingAccount.id,
                                    name: remainingAccount.name,
                                    mask: remainingAccount.mask,
                                    type: remainingAccount.type,
                                    verificationStatus: remainingAccount.verificationStatus,
                                    institution: retrievedFinancialInstitution,
                                    linkToken: matchedLink.linkToken
                                });
                            }
                        }
                    }
                    else {
                        // no existing accounts to delete from
                        const errorMessage = `Delete triggered for non existent accounts, for ${deleteAccountInput.id}, ${deleteAccountInput.linkToken}`;
                        console.log(errorMessage);
                        return {
                            errorMessage: errorMessage,
                            errorType: moonbeam_models_1.LinkErrorType.NoneOrAbsent
                        };
                    }
                }
                else {
                    // for the remainder of the links, just used those to build the return object
                    const unmatchedLink = link;
                    if (unmatchedLink.accounts && unmatchedLink.accounts.length !== 0) {
                        for (const unmatchedAccount of unmatchedLink.accounts) {
                            resultedAccounts.push({
                                id: unmatchedAccount.id,
                                name: unmatchedAccount.name,
                                mask: unmatchedAccount.mask,
                                type: unmatchedAccount.type,
                                verificationStatus: unmatchedAccount.verificationStatus,
                                institution: unmatchedLink.institution,
                                linkToken: unmatchedLink.linkToken
                            });
                        }
                    }
                }
            }
            if (!linkFound || !matchedLink) {
                // no existing links to delete from
                const errorMessage = `Delete triggered for non existent link, for ${deleteAccountInput.id}, ${deleteAccountInput.linkToken}`;
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: moonbeam_models_1.LinkErrorType.NoneOrAbsent
                };
            }
            else {
                // update the links in the database
                await docClient.put({
                    TableName: process.env.ACCOUNT_LINKS,
                    Item: retrievedAccountLink
                }).promise();
                // return the remaining accounts for account link object
                return {
                    data: resultedAccounts
                };
            }
        }
    }
    catch (err) {
        console.log(`Unexpected error while executing deleteAccount mutation {}`, err);
        return {
            errorMessage: `Unexpected error while executing deleteAccount mutation ${err}`,
            errorType: moonbeam_models_1.LinkErrorType.UnexpectedError
        };
    }
};
exports.deleteAccount = deleteAccount;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVsZXRlQWNjb3VudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL2RlbGV0ZUFjY291bnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSw2Q0FBK0I7QUFDL0IsK0RBT21DO0FBQ25DLG9EQUErQztBQUUvQzs7Ozs7R0FLRztBQUNJLE1BQU0sYUFBYSxHQUFHLEtBQUssRUFBRSxrQkFBc0MsRUFBNEIsRUFBRTtJQUNwRyxJQUFJO1FBQ0EsNENBQTRDO1FBQzVDLE1BQU0sU0FBUyxHQUFHLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUVwRCx1RUFBdUU7UUFDdkUsTUFBTSxFQUFDLElBQUksRUFBQyxHQUFHLE1BQU0sU0FBUyxDQUFDLEdBQUcsQ0FBQztZQUMvQixTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFjO1lBQ3JDLEdBQUcsRUFBRSxFQUFDLEVBQUUsRUFBRSxrQkFBa0IsQ0FBQyxFQUFFLEVBQUM7U0FDbkMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBRWIscUhBQXFIO1FBQ3JILElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDUCxNQUFNLFlBQVksR0FBRyxrREFBa0Qsa0JBQWtCLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDL0YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUMxQixPQUFPO2dCQUNILFlBQVksRUFBRSxZQUFZO2dCQUMxQixTQUFTLEVBQUUsK0JBQWEsQ0FBQyxZQUFZO2FBQ3hDLENBQUM7U0FDTDthQUFNO1lBQ0gsOERBQThEO1lBQzlELE1BQU0sb0JBQW9CLEdBQUcsSUFBb0IsQ0FBQztZQUVsRCw4R0FBOEc7WUFDOUcsTUFBTSxnQkFBZ0IsR0FBcUIsRUFBRSxDQUFDO1lBQzlDLElBQUksU0FBUyxHQUFZLEtBQUssQ0FBQztZQUMvQixJQUFJLFdB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QUFDO2dCQUM3SCxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUMxQixPQUFPO29CQUNILFlBQVksRUFBRSxZQUFZO29CQUMxQixTQUFTLEVBQUUsK0JBQWEsQ0FBQyxZQUFZO2lCQUN4QyxDQUFDO2FBQ0w7aUJBQU07Z0JBQ0gsbUNBQW1DO2dCQUNuQyxNQUFNLFNBQVMsQ0FBQyxHQUFHLENBQUM7b0JBQ2hCLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWM7b0JBQ3JDLElBQUksRUFBRSxvQkFBb0I7aUJBQzdCLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFFYix3REFBd0Q7Z0JBQ3hELE9BQU87b0JBQ0gsSUFBSSxFQUFFLGdCQUFnQjtpQkFDekIsQ0FBQTthQUNKO1NBQ0o7S0FDSjtJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1YsT0FBTyxDQUFDLEdBQUcsQ0FBQyw0REFBNEQsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUMvRSxPQUFPO1lBQ0gsWUFBWSxFQUFFLDJEQUEyRCxHQUFHLEVBQUU7WUFDOUUsU0FBUyxFQUFFLCtCQUFhLENBQUMsZUFBZTtTQUMzQyxDQUFDO0tBQ0w7QUFDTCxDQUFDLENBQUE7QUFsSlksUUFBQSxhQUFhLGlCQWtKekIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBBV1MgZnJvbSAnYXdzLXNkayc7XG5pbXBvcnQge1xuICAgIEFjY291bnREZXRhaWxzLFxuICAgIEFjY291bnRMaW5rLFxuICAgIEFjY291bnRMaW5rRGV0YWlscyxcbiAgICBBY2NvdW50UmVzcG9uc2UsXG4gICAgRGVsZXRlQWNjb3VudElucHV0LFxuICAgIExpbmtFcnJvclR5cGVcbn0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcbmltcG9ydCB7UGxhaWRVdGlsc30gZnJvbSBcIi4uL3V0aWxzL3BsYWlkVXRpbHNcIjtcblxuLyoqXG4gKiBEZWxldGVBY2NvdW50IHJlc29sdmVyXG4gKlxuICogQHBhcmFtIGRlbGV0ZUFjY291bnRJbnB1dCBvYmplY3QgdG8gYmUgdXNlZCBmb3IgZGVsZXRpbmcgYW5kIHVuLWxpbmtpbmcgb25lIG1vcmUgbW9lIGFjY291bnRzIGZyb20gYSBsaW5rIG9iamVjdFxuICogQHJldHVybnMge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBBY2NvdW50UmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCBkZWxldGVBY2NvdW50ID0gYXN5bmMgKGRlbGV0ZUFjY291bnRJbnB1dDogRGVsZXRlQWNjb3VudElucHV0KTogUHJvbWlzZTxBY2NvdW50UmVzcG9uc2U+ID0+IHtcbiAgICB0cnkge1xuICAgICAgICAvLyBpbml0aWFsaXppbmcgdGhlIER5bmFtb0RCIGRvY3VtZW50IGNsaWVudFxuICAgICAgICBjb25zdCBkb2NDbGllbnQgPSBuZXcgQVdTLkR5bmFtb0RCLkRvY3VtZW50Q2xpZW50KCk7XG5cbiAgICAgICAgLy8gcmV0cmlldmUgdGhlIGFjY291bnQgbGluayBvYmplY3QgZ2l2ZW4gdGhlIGFjY291bnQgbGluayBpZCAodXNlciBpZClcbiAgICAgICAgY29uc3Qge0l0ZW19ID0gYXdhaXQgZG9jQ2xpZW50LmdldCh7XG4gICAgICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52LkFDQ09VTlRfTElOS1MhLFxuICAgICAgICAgICAgS2V5OiB7aWQ6IGRlbGV0ZUFjY291bnRJbnB1dC5pZH1cbiAgICAgICAgfSkucHJvbWlzZSgpO1xuXG4gICAgICAgIC8vIGlmIGFuIGFjY291bnQgZG9lcyBub3QgZXhpc3QsIHRoZW4gcmV0dXJuIGFuIGVycm9yLCBzaW5jZSB3ZSdyZSBhdHRlbXB0aW5nIHRvIGRlbGV0ZSBzb21ldGhpbmcgdGhhdCBkb2VzIG5vdCBleGlzdFxuICAgICAgICBpZiAoIUl0ZW0pIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBEZWxldGUgdHJpZ2dlcmVkIGZvciBub24gZXhpc3RlbnQgYWNjb3VudCBsaW5rICR7ZGVsZXRlQWNjb3VudElucHV0LmlkfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IExpbmtFcnJvclR5cGUuTm9uZU9yQWJzZW50XG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gb3RoZXJ3aXNlIGdldCB0aGUgZXhpc3RpbmcgYWNjb3VudCBhbmQgYWRkIGEgbmV3IGxpbmsgaW4gaXRcbiAgICAgICAgICAgIGNvbnN0IHJldHJpZXZlZEFjY291bnRMaW5rID0gSXRlbSEgYXMgQWNjb3VudExpbms7XG5cbiAgICAgICAgICAgIC8vIGNvbXBhcmUgdGhlIGFjY291bnRzIGluIHRoZSBtYXRjaGluZyBsaW5rLCBhcyB3ZWxsIGFzIHRoZSBvbmVzIGluIHRoZSBpbnB1dCwgYW5kIGRlbGV0ZSB0aGUgb25lcyB0aGF0IG1hdGNoXG4gICAgICAgICAgICBjb25zdCByZXN1bHRlZEFjY291bnRzOiBBY2NvdW50RGV0YWlsc1tdID0gW107XG4gICAgICAgICAgICBsZXQgbGlua0ZvdW5kOiBib29sZWFuID0gZmFsc2U7XG4gICAgICAgICAgICBsZXQgbWF0Y2hlZExpbms6IEFjY291bnRMaW5rRGV0YWlscyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGZvciAoY29uc3QgbGluayBvZiByZXRyaWV2ZWRBY2NvdW50TGluay5saW5rcykge1xuICAgICAgICAgICAgICAgIC8vIG1hdGNoIHRoZSBsaW5rcyBmb3IgdGhlIGdpdmVuIGFjY291bnQgbGluaywgYmFzZWQgb24gdGhlIGxpbmsgdG9rZW5cbiAgICAgICAgICAgICAgICBpZiAobGluayEubGlua1Rva2VuID09PSBkZWxldGVBY2NvdW50SW5wdXQubGlua1Rva2VuKSB7XG4gICAgICAgICAgICAgICAgICAgIGxpbmtGb3VuZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIG1hdGNoZWRMaW5rID0gbGluayE7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKG1hdGNoZWRMaW5rLmFjY291bnRzICYmIG1hdGNoZWRMaW5rLmFjY291bnRzLmxlbmd0aCAhPT0gMCAmJiBtYXRjaGVkTGluay5pbnN0aXR1dGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVtYWluaW5nQWNjb3VudHMgPSBtYXRjaGVkTGluay5hY2NvdW50cztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJldHJpZXZlZEZpbmFuY2lhbEluc3RpdHV0aW9uID0gbWF0Y2hlZExpbmsuaW5zdGl0dXRpb247XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY2hlY2tlZEluZGV4OiBudW1iZXIgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBtYXRjaGVkQWNjb3VudCBvZiBtYXRjaGVkTGluay5hY2NvdW50cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgdGFyZ2V0QWNjb3VudCBvZiBkZWxldGVBY2NvdW50SW5wdXQuYWNjb3VudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKChyZXRyaWV2ZWRGaW5hbmNpYWxJbnN0aXR1dGlvbiEuaWQgPT09IHRhcmdldEFjY291bnQhLmluc3RpdHV0aW9uLmlkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJiYgKHJldHJpZXZlZEZpbmFuY2lhbEluc3RpdHV0aW9uIS5uYW1lID09PSB0YXJnZXRBY2NvdW50IS5pbnN0aXR1dGlvbi5uYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJiYgKG1hdGNoZWRBY2NvdW50IS5tYXNrID09PSB0YXJnZXRBY2NvdW50IS5tYXNrXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJiYgbWF0Y2hlZEFjY291bnQhLm5hbWUgPT09IHRhcmdldEFjY291bnQhLm5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAmJiBtYXRjaGVkQWNjb3VudCEudHlwZSA9PT0gdGFyZ2V0QWNjb3VudCEudHlwZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbWFpbmluZ0FjY291bnRzLnNwbGljZShjaGVja2VkSW5kZXgsIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrZWRJbmRleCsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBtb2RpZnkgdGhlIHVwZGF0ZWQgdGltZXN0YW1wXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXRjaGVkTGluay51cGRhdGVkQXQgPSBkZWxldGVBY2NvdW50SW5wdXQudXBkYXRlZEF0ID8gZGVsZXRlQWNjb3VudElucHV0LnVwZGF0ZWRBdCA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBpZiB0aGUgbGluayBkb2VzIG5vdCBoYXZlIGFueSBhY2NvdW50cyBsZWZ0IGluIGl0LCByZW1vdmUgYWxsIGFjY291bnRzIGZvciB0aGUgbGluaywgcmVtb3ZlIHRoZSBsaW5rLCBhbmQgdW5saW5rIHRoZSBhY2Nlc3MgdG9rZW4gZm9yIHRoZW1cbiAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlbWFpbmluZ0FjY291bnRzICYmIHJlbWFpbmluZ0FjY291bnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGluaXRpYWxpemUgdGhlIFBsYWlkIFV0aWxzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcGxhaWRVdGlscyA9IGF3YWl0IFBsYWlkVXRpbHMuc2V0dXAoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNhbGwgdGhlIFBsYWlkIEFQSSB0byB1bmxpbmsgdGhlIGFjY2VzcyB0b2tlblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlbW92ZWRJdGVtUmVzcG9uc2UgPSBhd2FpdCBwbGFpZFV0aWxzLnBsYWlkQ2xpZW50IS5pdGVtUmVtb3ZlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xpZW50X2lkOiBwbGFpZFV0aWxzLnBsYWlkQ2xpZW50SWQhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWNyZXQ6IHBsYWlkVXRpbHMucGxhaWRTZWNyZXQhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY2Nlc3NfdG9rZW46IG1hdGNoZWRMaW5rLmFjY2Vzc1Rva2VuIVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gb3ZlcnJpZGUvY2hhbmdlIHRoZSByZXF1ZXN0IGlkIGZvciB0aGUgbWF0Y2hlZCBsaW5rLCBmb3IgZGVidWdnaW5nIHB1cnBvc2VzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2hlZExpbmsucmVxdWVzdElkID0gcmVtb3ZlZEl0ZW1SZXNwb25zZS5kYXRhLnJlcXVlc3RfaWQ7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzZXQgdGhlIGxpbmsgYWNjb3VudHMgdG8gYW4gZW1wdHkgYWNjb3VudHMgbGlzdCwgc2luY2Ugd2UgcmVtb3ZlZCBhbGwgb2YgdGhlbSBmcm9tIHRoZSBsaW5rXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2hlZExpbmsuYWNjb3VudHMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICogaWYgdGhlIGxpbmsgZG9lcyBoYXZlIHNvbWUgYWNjb3VudHMgbGVmdCBpbiBpdCwganVzdCBzZXQgdGhlIGFjY291bnRzIGZvciB0aGUgbGluaywgYXMgdGhlIHJlbWFpbmluZyBhY2NvdW50c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoZWRMaW5rLmFjY291bnRzID0gcmVtYWluaW5nQWNjb3VudHM7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhZGQgdGhlIHJlbWFpbmluZyBhY2NvdW50cyB0byB0aGUgcmVzdWx0aW5nIG9iamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgcmVtYWluaW5nQWNjb3VudCBvZiByZW1haW5pbmdBY2NvdW50cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRlZEFjY291bnRzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHJlbWFpbmluZ0FjY291bnQhLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogcmVtYWluaW5nQWNjb3VudCEubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hc2s6IHJlbWFpbmluZ0FjY291bnQhLm1hc2ssXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiByZW1haW5pbmdBY2NvdW50IS50eXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmVyaWZpY2F0aW9uU3RhdHVzOiByZW1haW5pbmdBY2NvdW50IS52ZXJpZmljYXRpb25TdGF0dXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnN0aXR1dGlvbjogcmV0cmlldmVkRmluYW5jaWFsSW5zdGl0dXRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5rVG9rZW46IG1hdGNoZWRMaW5rLmxpbmtUb2tlblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBubyBleGlzdGluZyBhY2NvdW50cyB0byBkZWxldGUgZnJvbVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYERlbGV0ZSB0cmlnZ2VyZWQgZm9yIG5vbiBleGlzdGVudCBhY2NvdW50cywgZm9yICR7ZGVsZXRlQWNjb3VudElucHV0LmlkfSwgJHtkZWxldGVBY2NvdW50SW5wdXQubGlua1Rva2VufWA7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IExpbmtFcnJvclR5cGUuTm9uZU9yQWJzZW50XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBmb3IgdGhlIHJlbWFpbmRlciBvZiB0aGUgbGlua3MsIGp1c3QgdXNlZCB0aG9zZSB0byBidWlsZCB0aGUgcmV0dXJuIG9iamVjdFxuICAgICAgICAgICAgICAgICAgICBjb25zdCB1bm1hdGNoZWRMaW5rOiBBY2NvdW50TGlua0RldGFpbHMgPSBsaW5rITtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHVubWF0Y2hlZExpbmsuYWNjb3VudHMgJiYgdW5tYXRjaGVkTGluay5hY2NvdW50cy5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgdW5tYXRjaGVkQWNjb3VudCBvZiB1bm1hdGNoZWRMaW5rLmFjY291bnRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ZWRBY2NvdW50cy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHVubWF0Y2hlZEFjY291bnQhLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiB1bm1hdGNoZWRBY2NvdW50IS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXNrOiB1bm1hdGNoZWRBY2NvdW50IS5tYXNrLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiB1bm1hdGNoZWRBY2NvdW50IS50eXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2ZXJpZmljYXRpb25TdGF0dXM6IHVubWF0Y2hlZEFjY291bnQhLnZlcmlmaWNhdGlvblN0YXR1cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGl0dXRpb246IHVubWF0Y2hlZExpbmshLmluc3RpdHV0aW9uISxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlua1Rva2VuOiB1bm1hdGNoZWRMaW5rIS5saW5rVG9rZW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFsaW5rRm91bmQgfHwgIW1hdGNoZWRMaW5rKSB7XG4gICAgICAgICAgICAgICAgLy8gbm8gZXhpc3RpbmcgbGlua3MgdG8gZGVsZXRlIGZyb21cbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgRGVsZXRlIHRyaWdnZXJlZCBmb3Igbm9uIGV4aXN0ZW50IGxpbmssIGZvciAke2RlbGV0ZUFjY291bnRJbnB1dC5pZH0sICR7ZGVsZXRlQWNjb3VudElucHV0LmxpbmtUb2tlbn1gO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTGlua0Vycm9yVHlwZS5Ob25lT3JBYnNlbnRcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyB1cGRhdGUgdGhlIGxpbmtzIGluIHRoZSBkYXRhYmFzZVxuICAgICAgICAgICAgICAgIGF3YWl0IGRvY0NsaWVudC5wdXQoe1xuICAgICAgICAgICAgICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52LkFDQ09VTlRfTElOS1MhLFxuICAgICAgICAgICAgICAgICAgICBJdGVtOiByZXRyaWV2ZWRBY2NvdW50TGlua1xuICAgICAgICAgICAgICAgIH0pLnByb21pc2UoKTtcblxuICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgcmVtYWluaW5nIGFjY291bnRzIGZvciBhY2NvdW50IGxpbmsgb2JqZWN0XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogcmVzdWx0ZWRBY2NvdW50c1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zb2xlLmxvZyhgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgZGVsZXRlQWNjb3VudCBtdXRhdGlvbiB7fWAsIGVycik7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyBkZWxldGVBY2NvdW50IG11dGF0aW9uICR7ZXJyfWAsXG4gICAgICAgICAgICBlcnJvclR5cGU6IExpbmtFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgIH07XG4gICAgfVxufVxuIl19