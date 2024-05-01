import {
    CreatePlaidLinkingSessionInput,
    PlaidClient,
    PlaidCountryCodes,
    PlaidLanguages,
    PlaidLinkingErrorType,
    PlaidLinkingSession,
    PlaidLinkingSessionResponse,
    PlaidProducts,
    Stages
} from "@moonbeam/moonbeam-models";
import {DynamoDBClient, GetItemCommand, PutItemCommand} from "@aws-sdk/client-dynamodb";

/**
 * CreatePlaidLinkingSession resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param createPlaidLinkingSessionInput plaid session linking input object, used to create a plaid linking
 * session object
 * @returns {@link Promise} of {@link PlaidLinkingSessionResponse}
 */
export const createPlaidLinkingSession = async (fieldName: string, createPlaidLinkingSessionInput: CreatePlaidLinkingSessionInput): Promise<PlaidLinkingSessionResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initializing the DynamoDB document client
        const dynamoDbClient = new DynamoDBClient({region: region});

        // update the appropriate parameters in the session input
        const createdAt = new Date().toISOString();
        createPlaidLinkingSessionInput.client_name = 'Moonbeam Finance';
        createPlaidLinkingSessionInput.link_customization_name = 'moonbeam_plaid_link';
        createPlaidLinkingSessionInput.createdAt = createPlaidLinkingSessionInput.createdAt ? createPlaidLinkingSessionInput.createdAt : createdAt;
        createPlaidLinkingSessionInput.updatedAt = createPlaidLinkingSessionInput.updatedAt ? createPlaidLinkingSessionInput.updatedAt : createdAt;
        createPlaidLinkingSessionInput.country_codes = [PlaidCountryCodes.Us];
        createPlaidLinkingSessionInput.webhook = process.env.ENV_NAME! === Stages.DEV
            ? "https://api-plaid-dev.moonbeam.vet/plaidAcknowledgment"
            : "https://api-plaid.moonbeam.vet/plaidAcknowledgment";
        createPlaidLinkingSessionInput.language = PlaidLanguages.En;
        createPlaidLinkingSessionInput.products = [PlaidProducts.Auth, PlaidProducts.Transactions];
        createPlaidLinkingSessionInput.transactions = {
            days_requested: 1
        }
        /**
         * If using Hosted Link, the redirect_uri must be set to https://hosted.plaid.com/oauth/redirect
         * {@link https://plaid.com/docs/api/tokens/#linktokencreate}
         */
        createPlaidLinkingSessionInput.redirect_uri = 'https://hosted.plaid.com/oauth/redirect';

        /**
         * check to see if the linking session already exists. If it does, then return an error.
         */
        const preExistingPlaidLinkingSession = await dynamoDbClient.send(new GetItemCommand({
            TableName: process.env.PLAID_LINKING_SESSIONS_TABLE!,
            Key: {
                id: {
                    S: createPlaidLinkingSessionInput.user.client_user_id
                },
                timestamp: {
                    N: Date.parse(createdAt).toString()
                }
            },
            /**
             * we're not interested in getting all the data for this call, just the minimum for us to determine whether this is a duplicate or not
             *
             * @link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html
             * @link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ExpressionAttributeNames.html
             */
            ProjectionExpression: '#idf',
            ExpressionAttributeNames: {
                '#idf': 'id'
            }
        }));

        // if there is an item retrieved, then we return an error
        if (preExistingPlaidLinkingSession && preExistingPlaidLinkingSession.Item) {
            // if there is an existent link object, then we cannot duplicate that, so we will return an error
            const errorMessage = `Pre-existing Plaid linking session object. Delete it before adding a new one!`;
            console.log(errorMessage);

            return {
                errorMessage: errorMessage,
                errorType: PlaidLinkingErrorType.DuplicateObjectFound
            }
        } else {
            // initialize the Plaid Client API here, in order to call the appropriate endpoints for this resolver
            const plaidClient = new PlaidClient(process.env.ENV_NAME!, region);

            // execute the member linking session creation call
            const response: PlaidLinkingSessionResponse = await plaidClient.createPlaidLinkSession(createPlaidLinkingSessionInput);

            // check to see if the linking session creation call was executed successfully
            if (response && !response.errorMessage && !response.errorType && response.data) {
                // convert the incoming linked session data into a PlaidLinkingSession object
                const plaidLinkingSession = response.data as PlaidLinkingSession;

                // store the Plaid linking session object
                await dynamoDbClient.send(new PutItemCommand({
                    TableName: process.env.PLAID_LINKING_SESSIONS_TABLE!,
                    Item: {
                        id: {
                            S: plaidLinkingSession.id
                        },
                        expiration: {
                            S: plaidLinkingSession.expiration
                        },
                        createdAt: {
                            S: plaidLinkingSession.createdAt
                        },
                        updatedAt: {
                            S: plaidLinkingSession.updatedAt
                        },
                        hosted_link_url: {
                            S: plaidLinkingSession.hosted_link_url
                        },
                        link_token: {
                            S: plaidLinkingSession.link_token
                        },
                        request_id: {
                            S: plaidLinkingSession.request_id
                        },
                        timestamp: {
                            N: Date.parse(createdAt).toString()
                        }
                    },
                }));

                // return the plaid linking session object
                return {
                    data: plaidLinkingSession
                }
            } else {
                console.log(`Unexpected error returned from the linking session creation call!`);

                // if there are errors associated with the call, just return the error message and error type from the upstream client
                return {
                    errorMessage: response.errorMessage,
                    errorType: PlaidLinkingErrorType.ValidationError
                }
            }
        }
    } catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} mutation ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: PlaidLinkingErrorType.UnexpectedError
        }
    }
}
