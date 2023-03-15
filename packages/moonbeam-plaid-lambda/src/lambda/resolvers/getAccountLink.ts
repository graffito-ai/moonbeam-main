import * as AWS from 'aws-sdk';
import {AccountLink, AccountLinkResponse, LinkErrorType} from "@moonbeam/moonbeam-models";

/**
 * GetAccountLink resolver
 *
 * @param id account link id (user id), for the account link to be retrieved
 * @returns {@link Promise} of {@link AccountLinkResponse}
 */
export const getAccountLink = async (id: string): Promise<AccountLinkResponse> => {
    // initializing the DynamoDB document client
    const docClient = new AWS.DynamoDB.DocumentClient();

    try {
        // retrieve the account link object given the account link id (user id)
        const {Item} = await docClient.get({
            TableName: process.env.ACCOUNT_LINKS!,
            Key: {id: id}
        }).promise();

        // return the retrieved account link
        return {
            data: Item as AccountLink
        }
    } catch (err) {
        console.log(`Unexpected error while executing getAccountLink query {}`, err);
        return {
            errorMessage: `Unexpected error while executing getAccountLink query. ${err}`,
            errorType: LinkErrorType.UnexpectedError
        };
    }
}
