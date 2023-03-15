import * as AWS from 'aws-sdk';
import {
    AccountLink,
    AccountLinkResponse,
    Constants,
    CreateAccountLinkInput,
    LinkErrorType
} from "@moonbeam/moonbeam-models";
import {CountryCode, Products} from 'plaid';
import {DepositoryAccountSubtype} from "plaid/api";
import {PlaidUtils} from "../utils/plaidUtils";
import MOONBEAM_DEPLOYMENT_BUCKET_NAME = Constants.MoonbeamConstants.MOONBEAM_DEPLOYMENT_BUCKET_NAME;
import MOONBEAM_PLAID_OAUTH_FILE_NAME = Constants.MoonbeamConstants.MOONBEAM_PLAID_OAUTH_FILE_NAME;

/**
 * CreateAccountLink resolver
 *
 * @param createAccountLinkInput object to be used for linking a user with Plaid
 * @returns {@link Promise} of {@link AccountLinkResponse}
 */
export const createAccountLink = async (createAccountLinkInput: CreateAccountLinkInput): Promise<AccountLinkResponse> => {
    // initializing the DynamoDB document client
    const docClient = new AWS.DynamoDB.DocumentClient();

    try {
        // initialize the Plaid Utils
        const plaidUtils = await PlaidUtils.setup();

        // call the Plaid API to create a Link Token
        const createTokenResponse = await plaidUtils.plaidClient!.linkTokenCreate({
            user: {
                client_user_id: createAccountLinkInput.id,
            },
            client_name: 'Moonbeam',
            products: [Products.Auth],
            language: 'en',
            country_codes: [CountryCode.Us],
            account_filters: {
                depository: {
                    account_subtypes: [DepositoryAccountSubtype.Checking, DepositoryAccountSubtype.Savings]
                }
            },
            redirect_uri: `https://${MOONBEAM_DEPLOYMENT_BUCKET_NAME}-${process.env.ENV_NAME!}-${process.env.AWS_REGION!}.s3.${process.env.AWS_REGION!}.amazonaws.com/${MOONBEAM_PLAID_OAUTH_FILE_NAME}-${process.env.ENV_NAME!}.html`
        });

        // retrieve the account link object given the account link id (user id)
        const {Item} = await docClient.get({
            TableName: process.env.ACCOUNT_LINKS!,
            Key: {id: createAccountLinkInput.id}
        }).promise();

        // create the account link object to return and store
        const createdAt = new Date().toISOString();
        const accountLink: AccountLink = {
            id: createAccountLinkInput.id,
            userEmail: createAccountLinkInput.userEmail,
            userName: createAccountLinkInput.userName,
            links: []
        };

        // if an account does not exist, then create a new account link object with a new link
        if (!Item) {
            accountLink.links.push({
                linkToken: createTokenResponse.data.link_token,
                requestId: createTokenResponse.data.request_id,
                createdAt: createdAt,
                updatedAt: createdAt
            });
        } else {
            // otherwise get the existing account and add a new link in it
            const retrievedAccountLink = Item! as AccountLink;
            accountLink.links = [
                ...retrievedAccountLink.links,
                {
                    linkToken: createTokenResponse.data.link_token,
                    requestId: createTokenResponse.data.request_id,
                    createdAt: createdAt,
                    updatedAt: createdAt
                }
            ]
        }

        // store the account link object
        await docClient.put({
            TableName: process.env.ACCOUNT_LINKS!,
            Item: accountLink
        }).promise();

        // return the account link object
        return {
            data: accountLink
        }
    } catch
        (err) {
        console.log(`Unexpected error while executing createAccountLink mutation {}`, err);
        return {
            errorMessage: `Unexpected error while executing createAccountLink mutation. ${err}`,
            errorType: LinkErrorType.UnexpectedError
        };
    }
}
