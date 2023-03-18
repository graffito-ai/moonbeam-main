import * as AWS from 'aws-sdk';
import {AccountLink, AccountLinkResponse, LinkErrorType, UpdateAccountLinkInput} from "@moonbeam/moonbeam-models";
import {PlaidUtils} from "../utils/plaidUtils";

/**
 * UpdateAccountLink resolver
 *
 * @param updateAccountLinkInput input to update an account link to
 * @returns {@link Promise} of {@link AccountLinkResponse}
 */
export const updateAccountLink = async (updateAccountLinkInput: UpdateAccountLinkInput): Promise<AccountLinkResponse> => {
    try {
        // initializing the DynamoDB document client
        const docClient = new AWS.DynamoDB.DocumentClient();

        // validating that the appropriate update link parameters are passed in
        if (!updateAccountLinkInput.accountLinkDetails.accountLinkError &&
            (
                (!updateAccountLinkInput.accountLinkDetails.accounts && !updateAccountLinkInput.accountLinkDetails.publicToken) ||
                (!updateAccountLinkInput.accountLinkDetails.accounts && updateAccountLinkInput.accountLinkDetails.publicToken) ||
                (updateAccountLinkInput.accountLinkDetails.accounts && !updateAccountLinkInput.accountLinkDetails.publicToken)
            ) &&
            (
                (!updateAccountLinkInput.accountLinkDetails.accounts && !updateAccountLinkInput.accountLinkDetails.institution) ||
                (!updateAccountLinkInput.accountLinkDetails.accounts && updateAccountLinkInput.accountLinkDetails.institution) ||
                (updateAccountLinkInput.accountLinkDetails.accounts && !updateAccountLinkInput.accountLinkDetails.institution)
            ) &&
            (
                (!updateAccountLinkInput.accountLinkDetails.linkSessionId && !updateAccountLinkInput.accountLinkDetails.requestId) ||
                (!updateAccountLinkInput.accountLinkDetails.linkSessionId && updateAccountLinkInput.accountLinkDetails.requestId) ||
                (updateAccountLinkInput.accountLinkDetails.linkSessionId && !updateAccountLinkInput.accountLinkDetails.requestId)
            ) &&
            (
                (!updateAccountLinkInput.accountLinkDetails.itemId && !updateAccountLinkInput.accountLinkDetails.accessToken) ||
                (!updateAccountLinkInput.accountLinkDetails.itemId && updateAccountLinkInput.accountLinkDetails.accessToken) ||
                (updateAccountLinkInput.accountLinkDetails.itemId && !updateAccountLinkInput.accountLinkDetails.accessToken)
            )
        ) {
            console.log(`Invalid link parameters to update account link with ${updateAccountLinkInput}`);
            return {
                errorMessage: `Invalid link parameters to update account link with`,
                errorType: LinkErrorType.ValidationError
            };
        }

        // retrieve the account link object given the account link id (user id)
        const {Item} = await docClient.get({
            TableName: process.env.ACCOUNT_LINKS!,
            Key: {id: updateAccountLinkInput.id}
        }).promise();

        // otherwise get the existing account and add a new link in it
        let retrievedAccountLink: AccountLink

        // if an account does not exist, then return an error, since we're attempting to update something that does not exist
        if (!Item) {
            const errorMessage = `Update triggered for non existent account link ${updateAccountLinkInput.id}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: LinkErrorType.NoneOrAbsent
            };
        } else {
            // otherwise get the existing account and add a new link in it
            retrievedAccountLink = Item! as AccountLink;

            // check against duplicate accounts, by checking if the same account number was added before, for the same institution
            checkAccountDuplicates(updateAccountLinkInput, retrievedAccountLink);

            // retrieve the specific link which we are running updates for
            for (const link of retrievedAccountLink.links) {
                if (link!.linkToken === updateAccountLinkInput.accountLinkDetails.linkToken) {
                    link!.updatedAt = updateAccountLinkInput.updatedAt ? updateAccountLinkInput.updatedAt : new Date().toISOString();

                    // identity whether this is an update for which a token exchange is needed (do not exchange for duplicate accounts)
                    if (updateAccountLinkInput.accountLinkDetails.publicToken && updateAccountLinkInput.accountLinkDetails.accounts
                        && updateAccountLinkInput.accountLinkDetails.accounts.length !== 0 && updateAccountLinkInput.accountLinkDetails.institution) {
                        console.log('Performing a token exchange for {}', updateAccountLinkInput.id);

                        // initialize the Plaid Utils
                        const plaidUtils = await PlaidUtils.setup();

                        // call the Plaid API to exchange the Public Token, for an Access Token
                        const exchangeTokenResponse = await plaidUtils.plaidClient!.itemPublicTokenExchange({
                            client_id: plaidUtils.plaidClientId!,
                            secret: plaidUtils.plaidSecret!,
                            public_token: updateAccountLinkInput.accountLinkDetails.publicToken
                        });

                        // update the access token information exchanged
                        link!.accessToken = exchangeTokenResponse.data.access_token;
                        link!.requestId = exchangeTokenResponse.data.request_id;
                        link!.itemId = exchangeTokenResponse.data.item_id;
                    }

                    // identify what other attributes we need to update based on the input
                    if (updateAccountLinkInput.accountLinkDetails.accountLinkError) {
                        link!.accountLinkError = updateAccountLinkInput.accountLinkDetails.accountLinkError;
                    }
                    if (updateAccountLinkInput.accountLinkDetails.accounts && updateAccountLinkInput.accountLinkDetails.accounts.length !== 0) {
                        link!.accounts = updateAccountLinkInput.accountLinkDetails!.accounts;
                    }
                    if (updateAccountLinkInput.accountLinkDetails.institution) {
                        link!.institution = updateAccountLinkInput.accountLinkDetails.institution;
                    }
                    if (updateAccountLinkInput.accountLinkDetails.requestId) {
                        link!.requestId = updateAccountLinkInput.accountLinkDetails.requestId;
                    }
                    if (updateAccountLinkInput.accountLinkDetails.linkSessionId) {
                        link!.linkSessionId = updateAccountLinkInput.accountLinkDetails.linkSessionId;
                    }
                    if (updateAccountLinkInput.accountLinkDetails.itemId) {
                        link!.itemId = updateAccountLinkInput.accountLinkDetails.itemId;
                    }
                    if (updateAccountLinkInput.accountLinkDetails.accessToken) {
                        link!.accessToken = updateAccountLinkInput.accountLinkDetails.accessToken;
                    }
                    break;
                }
            }
            // update the account link based on the passed in object
            await docClient.put({
                TableName: process.env.ACCOUNT_LINKS!,
                Item: retrievedAccountLink
            }).promise();

            // return the updated link object
            return {
                data: retrievedAccountLink
            }
        }
    } catch (err) {
        console.log(`Unexpected error while executing updateAccountLink mutation {}`, err);
        return {
            errorMessage: `Unexpected error while executing updateAccountLink mutation ${err}`,
            errorType: LinkErrorType.UnexpectedError
        };
    }
}

/**
 * Function used to check for account duplicates and update them accordingly
 *
 * @param updateAccountLinkInput the account link to update
 * @param retrievedAccountLink the account link object retrieved
 */
const checkAccountDuplicates = (updateAccountLinkInput: UpdateAccountLinkInput, retrievedAccountLink: AccountLink): void => {
    const updatedAccounts = updateAccountLinkInput.accountLinkDetails.accounts;
    const updatedInstitution = updateAccountLinkInput.accountLinkDetails.institution;

    if (updatedAccounts && updatedAccounts.length !== 0 && updatedInstitution) {
        for (const link of retrievedAccountLink.links) {
            const comparableAccounts = link!.accounts;
            const comparableInstitution = link!.institution;

            // perform comparison and remove from the list ofr updatedAccounts if it exists already in the same link or in another one
            if (comparableInstitution && comparableAccounts && comparableAccounts.length !== 0) {
                if ((updatedInstitution.name === comparableInstitution.name) && (updatedInstitution.id === comparableInstitution.id)) {
                    let checkedIndex: number = 0;
                    for (const updateAccount of updateAccountLinkInput.accountLinkDetails!.accounts!) {
                        for (const comparableAccount of comparableAccounts) {
                            if (comparableAccount!.mask === updateAccount!.mask
                                && comparableAccount!.name === updateAccount!.name
                                && comparableAccount!.type === updateAccount!.type) {
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
}
