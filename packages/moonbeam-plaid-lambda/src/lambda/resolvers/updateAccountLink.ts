import * as AWS from 'aws-sdk';
import {AccountLink, AccountLinkResponse, LinkErrorType, UpdateAccountLinkInput} from "@moonbeam/moonbeam-models";
import {PlaidUtils} from "../utils/plaidUtils";

/**
 * UpdateAccountLink resolver
 *
 * @param updateAccountLinkInput input to update an account link to
 * @returns {@link Promise} of {@link ReferralResponse}
 */
export const updateAccountLink = async (updateAccountLinkInput: UpdateAccountLinkInput): Promise<AccountLinkResponse> => {
    // initializing the DynamoDB document client
    const docClient = new AWS.DynamoDB.DocumentClient();

    try {
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

            // retrieve the specific link which we are running updates for
            for (const link of retrievedAccountLink.links) {
                if (link!.linkToken === updateAccountLinkInput.accountLinkDetails.linkToken) {
                    link!.updatedAt = new Date().toISOString();

                    // identity whether this is an update for which a token exchange is needed
                    if (updateAccountLinkInput.accountLinkDetails.publicToken) {
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
                    if (updateAccountLinkInput.accountLinkDetails.accounts) {
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
            errorMessage: `Unexpected error while executing updateAccountLink mutation. ${err}`,
            errorType: LinkErrorType.UnexpectedError
        };
    }
}
