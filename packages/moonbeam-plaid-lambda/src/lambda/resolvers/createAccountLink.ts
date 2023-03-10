import * as AWS from 'aws-sdk';
import {
    AccountLinkDetails,
    AccountLinkResponse,
    Constants,
    CreateAccountLinkInput,
    LinkErrorType,
    ReferralResponse
} from "@moonbeam/moonbeam-models";
import {Configuration, CountryCode, PlaidApi, PlaidEnvironments, Products} from 'plaid';

/**
 * CreateAccountLink resolver
 *
 * @param createAccountLinkInput object to be used for linking a user with Plaid
 * @returns {@link Promise} of {@link ReferralResponse}
 */
export const createAccountLink = async (createAccountLinkInput: CreateAccountLinkInput): Promise<AccountLinkResponse> => {
    // initializing the DynamoDB document client
    const docClient = new AWS.DynamoDB.DocumentClient();

    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initializing the AWS Secrets Manager client
        const secretsClient = new AWS.SecretsManager({
            region: region,
        });

        // retrieve the Plaid related secrets for Moonbeam, depending on the current region and environment
        const plaidPair = await secretsClient
            .getSecretValue({SecretId: `${Constants.AWSPairConstants.PLAID_SECRET_NAME}-${process.env.ENV_NAME!}-${region}`}).promise();
        if (plaidPair.SecretString) {
            // convert the retrieved secrets pair value, as a JSON object
            const plaidPairAsJson = JSON.parse(plaidPair.SecretString!);

            // filter out the necessary Plaid credentials
            const plaidClientId = plaidPairAsJson[Constants.AWSPairConstants.PLAID_CLIENT_ID];
            const plaidSecret = plaidPairAsJson[Constants.AWSPairConstants.PLAID_SECRET];

            // use the Plaid library, in order to initialize a Plaid client
            const plaidConfig = new Configuration({
                basePath: PlaidEnvironments.sandbox, // this needs to change in the future depending on the environment
                baseOptions: {
                    headers: {
                        [Constants.AWSPairConstants.PLAID_CLIENT_ID]: plaidClientId,
                        [Constants.AWSPairConstants.PLAID_SECRET]: plaidSecret,
                    },
                },
            });
            const plaidClient = new PlaidApi(plaidConfig);

            // call the Plaid API to create a Link Token
            const createTokenResponse = await plaidClient.linkTokenCreate({
                user: {
                    client_user_id: createAccountLinkInput.id,
                },
                client_name: 'Moonbeam',
                products: [Products.Auth],
                language: 'en',
                country_codes: [CountryCode.Us],
            });

            // create the account link details object to return and store
            const accountLinkDetails: AccountLinkDetails = {
                id: createAccountLinkInput.id,
                linkToken: createTokenResponse.data.link_token,
                requestId: createTokenResponse.data.request_id,
                userEmail: createAccountLinkInput.userEmail,
                userName: createAccountLinkInput.userName
            }

            // store the account link object
            await docClient.put({
                TableName: process.env.ACCOUNT_LINKS!,
                Item: accountLinkDetails
            }).promise();

            // return the account link object
            return {
                data: accountLinkDetails
            }
        } else {
            console.log(`Unexpected error while retrieving secrets for Plaid {}`, plaidPair);
            return {
                errorMessage: `Unexpected error while executing createAccountLink mutation.`,
                errorType: LinkErrorType.UnexpectedError
            };
        }
    } catch (err) {
        console.log(`Unexpected error while executing createAccountLink mutation {}`, err);
        return {
            errorMessage: `Unexpected error while executing createAccountLink mutation. ${err}`,
            errorType: LinkErrorType.UnexpectedError
        };
    }
}
