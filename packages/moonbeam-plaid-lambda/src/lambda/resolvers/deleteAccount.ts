import * as AWS from 'aws-sdk';
import {
    AccountDetails,
    AccountLink,
    AccountLinkDetails,
    AccountResponse,
    DeleteAccountInput,
    LinkErrorType
} from "@moonbeam/moonbeam-models";
import {PlaidUtils} from "../utils/plaidUtils";

/**
 * DeleteAccount resolver
 *
 * @param deleteAccountInput object to be used for deleting and un-linking one more moe accounts from a link object
 * @returns {@link Promise} of {@link AccountResponse}
 */
export const deleteAccount = async (deleteAccountInput: DeleteAccountInput): Promise<AccountResponse> => {
    try {
        // initializing the DynamoDB document client
        const docClient = new AWS.DynamoDB.DocumentClient();

        // retrieve the account link object given the account link id (user id)
        const {Item} = await docClient.get({
            TableName: process.env.ACCOUNT_LINKS!,
            Key: {id: deleteAccountInput.id}
        }).promise();

        // if an account does not exist, then return an error, since we're attempting to delete something that does not exist
        if (!Item) {
            const errorMessage = `Delete triggered for non existent account link ${deleteAccountInput.id}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: LinkErrorType.NoneOrAbsent
            };
        } else {
            // otherwise get the existing account and add a new link in it
            const retrievedAccountLink = Item! as AccountLink;

            // compare the accounts in the matching link, as well as the ones in the input, and delete the ones that match
            const resultedAccounts: AccountDetails[] = [];
            let linkFound: boolean = false;
            let matchedLink: AccountLinkDetails | undefined = undefined;
            for (const link of retrievedAccountLink.links) {
                // match the links for the given account link, based on the link token
                if (link!.linkToken === deleteAccountInput.linkToken) {
                    linkFound = true;
                    matchedLink = link!;

                    if (matchedLink.accounts && matchedLink.accounts.length !== 0 && matchedLink.institution) {
                        const remainingAccounts = matchedLink.accounts;
                        const retrievedFinancialInstitution = matchedLink.institution;
                        let checkedIndex: number = 0;
                        for (const matchedAccount of matchedLink.accounts) {
                            for (const targetAccount of deleteAccountInput.accounts) {
                                if ((retrievedFinancialInstitution!.id === targetAccount!.institution.id)
                                    && (retrievedFinancialInstitution!.name === targetAccount!.institution.name)
                                    && (matchedAccount!.mask === targetAccount!.mask
                                        && matchedAccount!.name === targetAccount!.name
                                        && matchedAccount!.type === targetAccount!.type)) {
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
                            const plaidUtils = await PlaidUtils.setup();

                            // call the Plaid API to unlink the access token
                            const removedItemResponse = await plaidUtils.plaidClient!.itemRemove({
                                client_id: plaidUtils.plaidClientId!,
                                secret: plaidUtils.plaidSecret!,
                                access_token: matchedLink.accessToken!
                            });

                            // override/change the request id for the matched link, for debugging purposes
                            matchedLink.requestId = removedItemResponse.data.request_id;

                            // set the link accounts to an empty accounts list, since we removed all of them from the link
                            matchedLink.accounts = [];
                        } else {
                            /**
                             * if the link does have some accounts left in it, just set the accounts for the link, as the remaining accounts
                             */
                            matchedLink.accounts = remainingAccounts;

                            // add the remaining accounts to the resulting object
                            for (const remainingAccount of remainingAccounts) {
                                resultedAccounts.push({
                                    id: remainingAccount!.id,
                                    name: remainingAccount!.name,
                                    mask: remainingAccount!.mask,
                                    type: remainingAccount!.type,
                                    verificationStatus: remainingAccount!.verificationStatus,
                                    institution: retrievedFinancialInstitution,
                                    linkToken: matchedLink.linkToken
                                });
                            }
                        }
                    } else {
                        // no existing accounts to delete from
                        const errorMessage = `Delete triggered for non existent accounts, for ${deleteAccountInput.id}, ${deleteAccountInput.linkToken}`;
                        console.log(errorMessage);
                        return {
                            errorMessage: errorMessage,
                            errorType: LinkErrorType.NoneOrAbsent
                        }
                    }
                } else {
                    // for the remainder of the links, just used those to build the return object
                    const unmatchedLink: AccountLinkDetails = link!;
                    if (unmatchedLink.accounts && unmatchedLink.accounts.length !== 0) {
                        for (const unmatchedAccount of unmatchedLink.accounts) {
                            resultedAccounts.push({
                                id: unmatchedAccount!.id,
                                name: unmatchedAccount!.name,
                                mask: unmatchedAccount!.mask,
                                type: unmatchedAccount!.type,
                                verificationStatus: unmatchedAccount!.verificationStatus,
                                institution: unmatchedLink!.institution!,
                                linkToken: unmatchedLink!.linkToken
                            })
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
                    errorType: LinkErrorType.NoneOrAbsent
                };
            } else {
                // update the links in the database
                await docClient.put({
                    TableName: process.env.ACCOUNT_LINKS!,
                    Item: retrievedAccountLink
                }).promise();

                // return the remaining accounts for account link object
                return {
                    data: resultedAccounts
                }
            }
        }
    } catch (err) {
        console.log(`Unexpected error while executing deleteAccount mutation {}`, err);
        return {
            errorMessage: `Unexpected error while executing deleteAccount mutation ${err}`,
            errorType: LinkErrorType.UnexpectedError
        };
    }
}
