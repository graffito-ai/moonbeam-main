import * as AWS from 'aws-sdk';
import {
    AccountDetails,
    AccountLink,
    AccountResponse,
    LinkErrorType,
    ListAccountsInput
} from "@moonbeam/moonbeam-models";

/**
 * ListAccounts resolver
 *
 * @param filter filters to be passed in, which will help filter through all the accounts in the links
 * @returns {@link Promise} of {@link AccountResponse}
 */
export const listAccounts = async (filter: ListAccountsInput): Promise<AccountResponse> => {
    // initializing the DynamoDB document client
    const docClient = new AWS.DynamoDB.DocumentClient();

    try {
        // retrieve the account link object given the account link id (user id)
        const {Item} = await docClient.get({
            TableName: process.env.ACCOUNT_LINKS!,
            Key: {id: filter.id}
        }).promise();

        // result to return
        const accounts: AccountDetails[] = [];

        // retrieved account, based on the link id (user id)
        const retrievedAccountLink = Item! as AccountLink;

        // loop through each one of the links
        retrievedAccountLink.links.forEach(link => {
            // for each link, filter the accounts only, in order to return them, and also filter them based on status, if applicable
            if (link!.accounts && link!.accounts.length !== 0) {
                if (filter.status) {
                    link!.accounts
                        .filter((account) => account!.verificationStatus === filter.status)
                        .map((account) => accounts.push({
                            id: account!.id,
                            type: account!.type,
                            name: account!.name,
                            mask: account!.mask,
                            verificationStatus: account!.verificationStatus,
                            institution: link!.institution!
                        }));
                } else {
                    // used a for each here, instead of a spread operator, since the account can be Maybe<Account> inside the array
                    link!.accounts.forEach(account => {
                        accounts.push({
                            id: account!.id,
                            type: account!.type,
                            name: account!.name,
                            mask: account!.mask,
                            verificationStatus: account!.verificationStatus,
                            institution: link!.institution!
                        })
                    })
                }
            }
        });

        // returns the filtered accounts as data
        return {
            data: accounts
        };
    } catch (err) {
        console.log(`Unexpected error while executing listAccounts query {}`, err);

        return {
            errorMessage: `Unexpected error while executing listAccounts query. ${err}`,
            errorType: LinkErrorType.UnexpectedError
        };
    }
}
