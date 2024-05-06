import {
    PlaidLinkingErrorType,
    UpdatePlaidLinkingSessionInput,
    UpdatePlaidLinkingSessionResponse
} from "@moonbeam/moonbeam-models";
import {AttributeValue, DynamoDBClient, QueryCommand, UpdateItemCommand} from "@aws-sdk/client-dynamodb";

/**
 * UpdatePlaidLinkingSessionResolver resolver
 *
 * @param updatePlaidLinkingSessionInput the input needed to update an existing plaid linking session's data
 * @param fieldName name of the resolver path from the AppSync event
 * @returns {@link Promise} of {@link UpdatePlaidLinkingSessionResponse}
 */
export const updatePlaidLinkingSession = async (fieldName: string, updatePlaidLinkingSessionInput: UpdatePlaidLinkingSessionInput): Promise<UpdatePlaidLinkingSessionResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initializing the DynamoDB document client
        const dynamoDbClient = new DynamoDBClient({region: region});

        // update the timestamps accordingly
        const updatedAt = new Date().toISOString();
        updatePlaidLinkingSessionInput.updatedAt = updatePlaidLinkingSessionInput.updatedAt ? updatePlaidLinkingSessionInput.updatedAt : updatedAt;

        /**
         * the data to be retrieved from the Query Command
         * the eligible user Items returned from the Query Command, all aggregated together
         * the last evaluated key, to help with the pagination of results
         */
        let result: Record<string, AttributeValue>[] = [];
        let exclusiveStartKey, retrievedData;

        do {
            /**
             * retrieve the Plaid Linking Session for a particular user, given the local secondary index and the link token observed.
             *
             * Limit of 1 MB per paginated response data (in our case 1 item). It does not matter what the average size for an item is,
             * since we only will have 1 item stored per link token anyway.
             *
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.Pagination.html}
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.html}
             */
            retrievedData = await dynamoDbClient.send(new QueryCommand({
                TableName: process.env.PLAID_LINKING_SESSIONS_TABLE!,
                IndexName: `${process.env.PLAID_LINK_TOKEN_LOCAL_INDEX!}-${process.env.ENV_NAME!}-${region}`,
                ...(exclusiveStartKey && {ExclusiveStartKey: exclusiveStartKey}),
                Limit: 1,
                ExpressionAttributeNames: {
                    '#idf': 'id',
                    '#lTk': 'link_token'
                },
                ExpressionAttributeValues: {
                    ":idf": {
                        S: updatePlaidLinkingSessionInput.id
                    },
                    ':lTk': {
                        S: updatePlaidLinkingSessionInput.link_token
                    }
                },
                KeyConditionExpression: '#idf = :idf AND #lTk = :lTk'
            }));

            exclusiveStartKey = retrievedData.LastEvaluatedKey;
            result = result.concat(retrievedData.Items);
        } while (retrievedData && retrievedData.Count && retrievedData.Items &&
        retrievedData.Items.length && retrievedData.Count !== 0 &&
        retrievedData.Items.length !== 0 && retrievedData.LastEvaluatedKey);

        // if there is a Plaid Link Session retrieved, then return them accordingly
        if (result && result.length === 1) {
            // update the Plaid Linking Session object based on the passed in object
            await dynamoDbClient.send(new UpdateItemCommand({
                TableName: process.env.PLAID_LINKING_SESSIONS_TABLE!,
                Key: {
                    id: {
                        S: updatePlaidLinkingSessionInput.id
                    },
                    timestamp: {
                        N: result[0].timestamp.N!
                    }
                },
                ExpressionAttributeNames: {
                    "#stat": "status",
                    "#sId": "sessionId",
                    "#pTk": "public_token",
                    "#uat": "updatedAt"
                },
                ExpressionAttributeValues: {
                    ":stat": {
                        S: updatePlaidLinkingSessionInput.status
                    },
                    ":sId": {
                        S: updatePlaidLinkingSessionInput.session_id
                    },
                    ":pTk": {
                        S: updatePlaidLinkingSessionInput.public_token
                    },
                    ":at": {
                        S: updatePlaidLinkingSessionInput.updatedAt
                    }
                },
                UpdateExpression: "SET #stat = :stat, #sId = :sId, #pTk = :pTk, #uat = :at",
                ReturnValues: "UPDATED_NEW"
            }));

            // return the updated PLaid Linking Session's details
            return {
                id: updatePlaidLinkingSessionInput.id,
                timestamp: Number(result[0].timestamp.N!),
                link_token: result[0].link_token.S!,
                data: {
                    createdAt: result[0].createdAt.S!,
                    expiration: result[0].expiration.S!,
                    hosted_link_url: result[0].hosted_link_url.S!,
                    id: result[0].id.S!,
                    link_token: result[0].link_token.S!,
                    public_token: updatePlaidLinkingSessionInput.public_token,
                    request_id: result[0].request_id.S!,
                    session_id: updatePlaidLinkingSessionInput.session_id,
                    status: updatePlaidLinkingSessionInput.status,
                    timestamp: Number(result[0].timestamp.N!),
                    updatedAt: updatePlaidLinkingSessionInput.updatedAt
                }
            }
        } else {
            const errorMessage = `Unknown Plaid Link Session object to update, for user ${updatePlaidLinkingSessionInput.id} and token ${updatePlaidLinkingSessionInput.link_token}!`;
            console.log(errorMessage);

            return {
                errorMessage: errorMessage,
                errorType: PlaidLinkingErrorType.NoneOrAbsent
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
