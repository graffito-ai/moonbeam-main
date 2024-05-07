import {
    GetPlaidLinkingSessionByTokenInput,
    PlaidLinkingErrorType,
    PlaidLinkingSessionResponse,
    PlaidLinkingSessionStatus
} from "@moonbeam/moonbeam-models";
import {AttributeValue, DynamoDBClient, QueryCommand} from "@aws-sdk/client-dynamodb";

/**
 * GetPlaidLinkingSessionByToken resolver
 *
 * @param getPlaidLinkingSessionByTokenInput the input needed to update an existing plaid linking session's data
 * @param fieldName name of the resolver path from the AppSync event
 * @returns {@link Promise} of {@link PlaidLinkingSessionResponse}
 */
export const getPlaidLinkingSessionByToken = async (fieldName: string, getPlaidLinkingSessionByTokenInput: GetPlaidLinkingSessionByTokenInput): Promise<PlaidLinkingSessionResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initializing the DynamoDB document client
        const dynamoDbClient = new DynamoDBClient({region: region});

        /**
         * the data to be retrieved from the Query Command
         * the eligible user Items returned from the Query Command, all aggregated together
         * the last evaluated key, to help with the pagination of results
         */
        let result: Record<string, AttributeValue>[] = [];
        let exclusiveStartKey, retrievedData;

        do {
            /**
             * retrieve the Link Session by the link token, given the global secondary index to be queried by.
             *
             * Limit of 1 MB per paginated response data (in our case 2,000 items). An average size for an Item is about 365 bytes, which means that we won't
             * need to do pagination here, since we actually retrieve all Link Sessions in a looped format, and we account for
             * paginated responses.
             *
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.Pagination.html}
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.html}
             */
            retrievedData = await dynamoDbClient.send(new QueryCommand({
                TableName: process.env.PLAID_LINKING_SESSIONS_TABLE!,
                IndexName: `${process.env.PLAID_LINK_TOKEN_GLOBAL_INDEX!}-${process.env.ENV_NAME!}-${region}`,
                ...(exclusiveStartKey && {ExclusiveStartKey: exclusiveStartKey}),
                Limit: 2000, // 2,000 * 365 bytes = 730,000 bytes = 0.73 MB (leave a margin of error here up to 1 MB)
                ExpressionAttributeNames: {
                    '#lTk': 'link_token'
                },
                ExpressionAttributeValues: {
                    ':lTk': {
                        S: getPlaidLinkingSessionByTokenInput.link_token
                    }
                },
                KeyConditionExpression: '#lTk = :lTk'
            }));

            exclusiveStartKey = retrievedData.LastEvaluatedKey;
            result = result.concat(retrievedData.Items);
        } while (retrievedData && retrievedData.Count && retrievedData.Items &&
        retrievedData.Items.length && retrievedData.Count !== 0 &&
        retrievedData.Items.length !== 0 && retrievedData.LastEvaluatedKey);

        // there needs to be only 1 Plaid Link session returned. For more than one, return an error accordingly
        if (result && result.length === 1) {
            // return the queried PLaid Linking Session's details
            return {
                data: {
                    createdAt: result[0].createdAt.S!,
                    expiration: result[0].expiration.S!,
                    hosted_link_url: result[0].hosted_link_url.S!,
                    id: result[0].id.S!,
                    link_token: result[0].link_token.S!,
                    ...(result[0].public_token && result[0].public_token.S && {
                        public_token: result[0].public_token.S!,
                    }),
                    request_id: result[0].request_id.S!,
                    ...(result[0].session_id && result[0].session_id.S && {
                        public_token: result[0].session_id.S!,
                    }),
                    status: result[0].status.S! as PlaidLinkingSessionStatus,
                    timestamp: Number(result[0].timestamp.N!),
                    updatedAt: result[0].updatedAt.S!
                }
            }
        } else {
            // see if we have no or more than one Sessions retrieved and return the appropriate error and message
            if (result.length === 0) {
                const errorMessage = `No Plaid Link Session found for token ${getPlaidLinkingSessionByTokenInput.link_token}!`;
                console.log(errorMessage);

                return {
                    errorMessage: errorMessage,
                    errorType: PlaidLinkingErrorType.NoneOrAbsent
                }
            } else if (result.length > 1) {
                const errorMessage = `More than one Plaid Link Session retrieved for token ${getPlaidLinkingSessionByTokenInput.link_token}!`;
                console.log(errorMessage);

                return {
                    errorMessage: errorMessage,
                    errorType: PlaidLinkingErrorType.DuplicateObjectFound
                }
            } else {
                const errorMessage = `Issues while retrieving Plaid Link Session for token ${getPlaidLinkingSessionByTokenInput.link_token}!`;
                console.log(errorMessage);

                return {
                    errorMessage: errorMessage,
                    errorType: PlaidLinkingErrorType.UnexpectedError
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
