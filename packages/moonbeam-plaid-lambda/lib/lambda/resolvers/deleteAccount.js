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
            let linkIndex = 0;
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
                                    && (matchedAccount.mask === targetAccount.mask && matchedAccount.name === targetAccount.name)) {
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
                linkIndex++;
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
                // set the link in the list of links, to the updated link
                retrievedAccountLink.links[linkIndex] = matchedLink;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVsZXRlQWNjb3VudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL2RlbGV0ZUFjY291bnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSw2Q0FBK0I7QUFDL0IsK0RBT21DO0FBQ25DLG9EQUErQztBQUUvQzs7Ozs7R0FLRztBQUNJLE1BQU0sYUFBYSxHQUFHLEtBQUssRUFBRSxrQkFBc0MsRUFBNEIsRUFBRTtJQUNwRyxJQUFJO1FBQ0EsNENBQTRDO1FBQzVDLE1BQU0sU0FBUyxHQUFHLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUVwRCx1RUFBdUU7UUFDdkUsTUFBTSxFQUFDLElBQUksRUFBQyxHQUFHLE1BQU0sU0FBUyxDQUFDLEdBQUcsQ0FBQztZQUMvQixTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFjO1lBQ3JDLEdBQUcsRUFBRSxFQUFDLEVBQUUsRUFBRSxrQkFBa0IsQ0FBQyxFQUFFLEVBQUM7U0FDbkMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBRWIscUhBQXFIO1FBQ3JILElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDUCxNQUFNLFlBQVksR0FBRyxrREFBa0Qsa0JBQWtCLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDL0YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUMxQixPQUFPO2dCQUNILFlBQVksRUFBRSxZQUFZO2dCQUMxQixTQUFTLEVBQUUsK0JBQWEsQ0FBQyxZQUFZO2FBQ3hDLENBQUM7U0FDTDthQUFNO1lBQ0gsOERBQThEO1lBQzlELE1BQU0sb0JBQW9CLEdBQUcsSUFBb0IsQ0FBQztZQUVsRCw4R0FBOEc7WUFDOUcsTUFBTSxnQkFBZ0IsR0FBcUIsRUFBRSxDQUFDO1lBQzlDLElBQUksU0FBUyxHQUFZLEtBQUssQ0FBQztZQUMvQixJQUFJLFNB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REFBNEQsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUMvRSxPQUFPO1lBQ0gsWUFBWSxFQUFFLDJEQUEyRCxHQUFHLEVBQUU7WUFDOUUsU0FBUyxFQUFFLCtCQUFhLENBQUMsZUFBZTtTQUMzQyxDQUFDO0tBQ0w7QUFDTCxDQUFDLENBQUE7QUFySVksUUFBQSxhQUFhLGlCQXFJekIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBBV1MgZnJvbSAnYXdzLXNkayc7XG5pbXBvcnQge1xuICAgIEFjY291bnREZXRhaWxzLFxuICAgIEFjY291bnRMaW5rLFxuICAgIEFjY291bnRMaW5rRGV0YWlscyxcbiAgICBBY2NvdW50UmVzcG9uc2UsXG4gICAgRGVsZXRlQWNjb3VudElucHV0LFxuICAgIExpbmtFcnJvclR5cGVcbn0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcbmltcG9ydCB7UGxhaWRVdGlsc30gZnJvbSBcIi4uL3V0aWxzL3BsYWlkVXRpbHNcIjtcblxuLyoqXG4gKiBEZWxldGVBY2NvdW50IHJlc29sdmVyXG4gKlxuICogQHBhcmFtIGRlbGV0ZUFjY291bnRJbnB1dCBvYmplY3QgdG8gYmUgdXNlZCBmb3IgZGVsZXRpbmcgYW5kIHVuLWxpbmtpbmcgb25lIG1vcmUgbW9lIGFjY291bnRzIGZyb20gYSBsaW5rIG9iamVjdFxuICogQHJldHVybnMge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBBY2NvdW50UmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCBkZWxldGVBY2NvdW50ID0gYXN5bmMgKGRlbGV0ZUFjY291bnRJbnB1dDogRGVsZXRlQWNjb3VudElucHV0KTogUHJvbWlzZTxBY2NvdW50UmVzcG9uc2U+ID0+IHtcbiAgICB0cnkge1xuICAgICAgICAvLyBpbml0aWFsaXppbmcgdGhlIER5bmFtb0RCIGRvY3VtZW50IGNsaWVudFxuICAgICAgICBjb25zdCBkb2NDbGllbnQgPSBuZXcgQVdTLkR5bmFtb0RCLkRvY3VtZW50Q2xpZW50KCk7XG5cbiAgICAgICAgLy8gcmV0cmlldmUgdGhlIGFjY291bnQgbGluayBvYmplY3QgZ2l2ZW4gdGhlIGFjY291bnQgbGluayBpZCAodXNlciBpZClcbiAgICAgICAgY29uc3Qge0l0ZW19ID0gYXdhaXQgZG9jQ2xpZW50LmdldCh7XG4gICAgICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52LkFDQ09VTlRfTElOS1MhLFxuICAgICAgICAgICAgS2V5OiB7aWQ6IGRlbGV0ZUFjY291bnRJbnB1dC5pZH1cbiAgICAgICAgfSkucHJvbWlzZSgpO1xuXG4gICAgICAgIC8vIGlmIGFuIGFjY291bnQgZG9lcyBub3QgZXhpc3QsIHRoZW4gcmV0dXJuIGFuIGVycm9yLCBzaW5jZSB3ZSdyZSBhdHRlbXB0aW5nIHRvIGRlbGV0ZSBzb21ldGhpbmcgdGhhdCBkb2VzIG5vdCBleGlzdFxuICAgICAgICBpZiAoIUl0ZW0pIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBEZWxldGUgdHJpZ2dlcmVkIGZvciBub24gZXhpc3RlbnQgYWNjb3VudCBsaW5rICR7ZGVsZXRlQWNjb3VudElucHV0LmlkfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IExpbmtFcnJvclR5cGUuTm9uZU9yQWJzZW50XG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gb3RoZXJ3aXNlIGdldCB0aGUgZXhpc3RpbmcgYWNjb3VudCBhbmQgYWRkIGEgbmV3IGxpbmsgaW4gaXRcbiAgICAgICAgICAgIGNvbnN0IHJldHJpZXZlZEFjY291bnRMaW5rID0gSXRlbSEgYXMgQWNjb3VudExpbms7XG5cbiAgICAgICAgICAgIC8vIGNvbXBhcmUgdGhlIGFjY291bnRzIGluIHRoZSBtYXRjaGluZyBsaW5rLCBhcyB3ZWxsIGFzIHRoZSBvbmVzIGluIHRoZSBpbnB1dCwgYW5kIGRlbGV0ZSB0aGUgb25lcyB0aGF0IG1hdGNoXG4gICAgICAgICAgICBjb25zdCByZXN1bHRlZEFjY291bnRzOiBBY2NvdW50RGV0YWlsc1tdID0gW107XG4gICAgICAgICAgICBsZXQgbGlua0ZvdW5kOiBib29sZWFuID0gZmFsc2U7XG4gICAgICAgICAgICBsZXQgbGlua0luZGV4OiBudW1iZXIgPSAwO1xuICAgICAgICAgICAgbGV0IG1hdGNoZWRMaW5rOiBBY2NvdW50TGlua0RldGFpbHMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGxpbmsgb2YgcmV0cmlldmVkQWNjb3VudExpbmsubGlua3MpIHtcbiAgICAgICAgICAgICAgICAvLyBtYXRjaCB0aGUgbGlua3MgZm9yIHRoZSBnaXZlbiBhY2NvdW50IGxpbmssIGJhc2VkIG9uIHRoZSBsaW5rIHRva2VuXG4gICAgICAgICAgICAgICAgaWYgKGxpbmshLmxpbmtUb2tlbiA9PT0gZGVsZXRlQWNjb3VudElucHV0LmxpbmtUb2tlbikge1xuICAgICAgICAgICAgICAgICAgICBsaW5rRm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBtYXRjaGVkTGluayA9IGxpbmshO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChtYXRjaGVkTGluay5hY2NvdW50cyAmJiBtYXRjaGVkTGluay5hY2NvdW50cy5sZW5ndGggIT09IDAgJiYgbWF0Y2hlZExpbmsuaW5zdGl0dXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlbWFpbmluZ0FjY291bnRzID0gbWF0Y2hlZExpbmsuYWNjb3VudHM7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZXRyaWV2ZWRGaW5hbmNpYWxJbnN0aXR1dGlvbiA9IG1hdGNoZWRMaW5rLmluc3RpdHV0aW9uO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNoZWNrZWRJbmRleDogbnVtYmVyID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgbWF0Y2hlZEFjY291bnQgb2YgbWF0Y2hlZExpbmsuYWNjb3VudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHRhcmdldEFjY291bnQgb2YgZGVsZXRlQWNjb3VudElucHV0LmFjY291bnRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICgocmV0cmlldmVkRmluYW5jaWFsSW5zdGl0dXRpb24hLmlkID09PSB0YXJnZXRBY2NvdW50IS5pbnN0aXR1dGlvbi5pZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICYmIChyZXRyaWV2ZWRGaW5hbmNpYWxJbnN0aXR1dGlvbiEubmFtZSA9PT0gdGFyZ2V0QWNjb3VudCEuaW5zdGl0dXRpb24ubmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICYmIChtYXRjaGVkQWNjb3VudCEubWFzayA9PT0gdGFyZ2V0QWNjb3VudCEubWFzayAmJiBtYXRjaGVkQWNjb3VudCEubmFtZSA9PT0gdGFyZ2V0QWNjb3VudCEubmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbWFpbmluZ0FjY291bnRzLnNwbGljZShjaGVja2VkSW5kZXgsIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrZWRJbmRleCsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBtb2RpZnkgdGhlIHVwZGF0ZWQgdGltZXN0YW1wXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXRjaGVkTGluay51cGRhdGVkQXQgPSBkZWxldGVBY2NvdW50SW5wdXQudXBkYXRlZEF0ID8gZGVsZXRlQWNjb3VudElucHV0LnVwZGF0ZWRBdCA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBpZiB0aGUgbGluayBkb2VzIG5vdCBoYXZlIGFueSBhY2NvdW50cyBsZWZ0IGluIGl0LCByZW1vdmUgYWxsIGFjY291bnRzIGZvciB0aGUgbGluaywgcmVtb3ZlIHRoZSBsaW5rLCBhbmQgdW5saW5rIHRoZSBhY2Nlc3MgdG9rZW4gZm9yIHRoZW1cbiAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlbWFpbmluZ0FjY291bnRzICYmIHJlbWFpbmluZ0FjY291bnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGluaXRpYWxpemUgdGhlIFBsYWlkIFV0aWxzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcGxhaWRVdGlscyA9IGF3YWl0IFBsYWlkVXRpbHMuc2V0dXAoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNhbGwgdGhlIFBsYWlkIEFQSSB0byB1bmxpbmsgdGhlIGFjY2VzcyB0b2tlblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlbW92ZWRJdGVtUmVzcG9uc2UgPSBhd2FpdCBwbGFpZFV0aWxzLnBsYWlkQ2xpZW50IS5pdGVtUmVtb3ZlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xpZW50X2lkOiBwbGFpZFV0aWxzLnBsYWlkQ2xpZW50SWQhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWNyZXQ6IHBsYWlkVXRpbHMucGxhaWRTZWNyZXQhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY2Nlc3NfdG9rZW46IG1hdGNoZWRMaW5rLmFjY2Vzc1Rva2VuIVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gb3ZlcnJpZGUvY2hhbmdlIHRoZSByZXF1ZXN0IGlkIGZvciB0aGUgbWF0Y2hlZCBsaW5rLCBmb3IgZGVidWdnaW5nIHB1cnBvc2VzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2hlZExpbmsucmVxdWVzdElkID0gcmVtb3ZlZEl0ZW1SZXNwb25zZS5kYXRhLnJlcXVlc3RfaWQ7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzZXQgdGhlIGxpbmsgYWNjb3VudHMgdG8gYW4gZW1wdHkgYWNjb3VudHMgbGlzdCwgc2luY2Ugd2UgcmVtb3ZlZCBhbGwgb2YgdGhlbSBmcm9tIHRoZSBsaW5rXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2hlZExpbmsuYWNjb3VudHMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICogaWYgdGhlIGxpbmsgZG9lcyBoYXZlIHNvbWUgYWNjb3VudHMgbGVmdCBpbiBpdCwganVzdCBzZXQgdGhlIGFjY291bnRzIGZvciB0aGUgbGluaywgYXMgdGhlIHJlbWFpbmluZyBhY2NvdW50c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoZWRMaW5rLmFjY291bnRzID0gcmVtYWluaW5nQWNjb3VudHM7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhZGQgdGhlIHJlbWFpbmluZyBhY2NvdW50cyB0byB0aGUgcmVzdWx0aW5nIG9iamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgcmVtYWluaW5nQWNjb3VudCBvZiByZW1haW5pbmdBY2NvdW50cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRlZEFjY291bnRzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHJlbWFpbmluZ0FjY291bnQhLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogcmVtYWluaW5nQWNjb3VudCEubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hc2s6IHJlbWFpbmluZ0FjY291bnQhLm1hc2ssXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiByZW1haW5pbmdBY2NvdW50IS50eXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmVyaWZpY2F0aW9uU3RhdHVzOiByZW1haW5pbmdBY2NvdW50IS52ZXJpZmljYXRpb25TdGF0dXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnN0aXR1dGlvbjogcmV0cmlldmVkRmluYW5jaWFsSW5zdGl0dXRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5rVG9rZW46IG1hdGNoZWRMaW5rLmxpbmtUb2tlblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBubyBleGlzdGluZyBhY2NvdW50cyB0byBkZWxldGUgZnJvbVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYERlbGV0ZSB0cmlnZ2VyZWQgZm9yIG5vbiBleGlzdGVudCBhY2NvdW50cywgZm9yICR7ZGVsZXRlQWNjb3VudElucHV0LmlkfSwgJHtkZWxldGVBY2NvdW50SW5wdXQubGlua1Rva2VufWA7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IExpbmtFcnJvclR5cGUuTm9uZU9yQWJzZW50XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbGlua0luZGV4Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWxpbmtGb3VuZCB8fCAhbWF0Y2hlZExpbmspIHtcbiAgICAgICAgICAgICAgICAvLyBubyBleGlzdGluZyBsaW5rcyB0byBkZWxldGUgZnJvbVxuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBEZWxldGUgdHJpZ2dlcmVkIGZvciBub24gZXhpc3RlbnQgbGluaywgZm9yICR7ZGVsZXRlQWNjb3VudElucHV0LmlkfSwgJHtkZWxldGVBY2NvdW50SW5wdXQubGlua1Rva2VufWA7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBMaW5rRXJyb3JUeXBlLk5vbmVPckFic2VudFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIHNldCB0aGUgbGluayBpbiB0aGUgbGlzdCBvZiBsaW5rcywgdG8gdGhlIHVwZGF0ZWQgbGlua1xuICAgICAgICAgICAgICAgIHJldHJpZXZlZEFjY291bnRMaW5rLmxpbmtzW2xpbmtJbmRleF0gPSBtYXRjaGVkTGluaztcblxuICAgICAgICAgICAgICAgIC8vIHVwZGF0ZSB0aGUgbGlua3MgaW4gdGhlIGRhdGFiYXNlXG4gICAgICAgICAgICAgICAgYXdhaXQgZG9jQ2xpZW50LnB1dCh7XG4gICAgICAgICAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuQUNDT1VOVF9MSU5LUyEsXG4gICAgICAgICAgICAgICAgICAgIEl0ZW06IHJldHJpZXZlZEFjY291bnRMaW5rXG4gICAgICAgICAgICAgICAgfSkucHJvbWlzZSgpO1xuXG4gICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSByZW1haW5pbmcgYWNjb3VudHMgZm9yIGFjY291bnQgbGluayBvYmplY3RcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiByZXN1bHRlZEFjY291bnRzXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyBkZWxldGVBY2NvdW50IG11dGF0aW9uIHt9YCwgZXJyKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgZXhlY3V0aW5nIGRlbGV0ZUFjY291bnQgbXV0YXRpb24gJHtlcnJ9YCxcbiAgICAgICAgICAgIGVycm9yVHlwZTogTGlua0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgfTtcbiAgICB9XG59XG4iXX0=