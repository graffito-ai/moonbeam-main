import {AttributeValue, DynamoDBClient, QueryCommand} from "@aws-sdk/client-dynamodb";
import {
    GetTransactionByStatusInput,
    MoonbeamTransactionByStatus,
    MoonbeamTransactionsByStatusResponse,
    TransactionsErrorType,
    TransactionsStatus
} from "@moonbeam/moonbeam-models";

/**
 * GetTransactionByStatusResolver resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getTransactionByStatusInput get transaction by status input object, used to retrieve transactional information,
 *                                    based on status.
 *
 * @returns {@link Promise} of {@link MoonbeamTransactionsByStatusResponse}
 */
export const getTransactionByStatus = async (fieldName: string, getTransactionByStatusInput: GetTransactionByStatusInput): Promise<MoonbeamTransactionsByStatusResponse> => {
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
             * retrieve all the transactions with a specific status, given the global secondary index
             *
             * Limit of 1 MB per paginated response data (in our case 7,000 items). An average size for an Item is about 111 bytes, which means that we won't
             * need to do pagination here, since we actually retrieve all users in a looped format, and we account for
             * paginated responses.
             *
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.Pagination.html}
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.html}
             */
            retrievedData = await dynamoDbClient.send(new QueryCommand({
                TableName: process.env.TRANSACTIONS_TABLE!,
                IndexName: `${process.env.TRANSACTIONS_STATUS_LOCAL_INDEX!}-${process.env.ENV_NAME!}-${region}`,
                ...(exclusiveStartKey && {ExclusiveStartKey: exclusiveStartKey}),
                Limit: 7000, // 7,000 * 111 bytes = 777,000 bytes = 0.7777 MB (leave a margin of error here up to 1 MB)
                /**
                 * we're not interested in getting all the data for this call, just the minimum for us to return the necessary information
                 *
                 * @link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html
                 * @link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ExpressionAttributeNames.html
                 */
                ProjectionExpression: '#id, #time, #idt, #st',
                ExpressionAttributeNames: {
                    '#id': 'id',
                    '#idt': 'transactionId',
                    '#time': 'timestamp',
                    '#st': 'transactionStatus'
                },
                ExpressionAttributeValues: {
                    ":id": {
                        S: getTransactionByStatusInput.id
                    },
                    ":st": {
                        S: getTransactionByStatusInput.status
                    }
                },
                KeyConditionExpression: '#id = :id AND #st = :st'
            }));

            exclusiveStartKey = retrievedData.LastEvaluatedKey;
            result = result.concat(retrievedData.Items);
        } while (retrievedData && retrievedData.Count && retrievedData.Items &&
        retrievedData.Items.length && retrievedData.Count !== 0 &&
        retrievedData.Items.length !== 0 && retrievedData.LastEvaluatedKey);

        // if there are eligible transactions retrieved, then return them accordingly
        if (result && result.length !== 0) {
            // convert the Dynamo DB data from Dynamo DB JSON format to a Moonbeam transaction by status object
            const moonbeamTransactionByStatusData: MoonbeamTransactionByStatus[] = [];
            result.forEach(moonbeamTransactionByStatusResult => {
                const moonbeamTransactionByStatus: MoonbeamTransactionByStatus = {
                    id: moonbeamTransactionByStatusResult.id.S!,
                    timestamp: Number(moonbeamTransactionByStatusResult.timestamp.N!),
                    transactionId: moonbeamTransactionByStatusResult.transactionId.S!,
                    transactionStatus: moonbeamTransactionByStatusResult.transactionStatus.S! as TransactionsStatus
                };
                moonbeamTransactionByStatusData.push(moonbeamTransactionByStatus);
            });
            // return the list of filtered transactions
            return {
                data: moonbeamTransactionByStatusData
            }
        } else {
            const errorMessage = `Transactions with status ${getTransactionByStatusInput.status} for user ${getTransactionByStatusInput.id}  not found!`;
            console.log(errorMessage);

            return {
                errorMessage: errorMessage,
                errorType: TransactionsErrorType.NoneOrAbsent
            }
        }
    } catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} query ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: TransactionsErrorType.UnexpectedError
        };
    }
}
