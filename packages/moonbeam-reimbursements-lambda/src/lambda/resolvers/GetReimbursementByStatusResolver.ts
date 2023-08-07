import {AttributeValue, DynamoDBClient, QueryCommand} from "@aws-sdk/client-dynamodb";
import {
    CurrencyCodeType,
    GetReimbursementByStatusInput,
    Reimbursement,
    ReimbursementByStatusResponse,
    ReimbursementsErrorType,
    ReimbursementStatus, ReimbursementTransaction
} from "@moonbeam/moonbeam-models";
import {unmarshall} from "@aws-sdk/util-dynamodb";

/**
 * GetReimbursementByStatus resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getReimbursementByStatusInput get reimbursement by status input object, used to retrieve reimbursement information,
 *                                    based on status.
 *
 * @returns {@link Promise} of {@link ReimbursementByStatusResponse}
 */
export const getReimbursementByStatus = async (fieldName: string, getReimbursementByStatusInput: GetReimbursementByStatusInput): Promise<ReimbursementByStatusResponse> => {
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
             * retrieve all the reimbursements with a specific status, given the global secondary index
             *
             * Limit of 1 MB per paginated response data (in our case 55 items). An average size for an Item is about 13674 bytes, for a
             * reimbursement containing about 100 transactions (with an average of .20 cents earned per transaction), which means that we
             * won't need to do pagination here, since we actually retrieve all users in a looped format, and we account for
             * paginated responses.
             *
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.Pagination.html}
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.html}
             */
            retrievedData = await dynamoDbClient.send(new QueryCommand({
                TableName: process.env.REIMBURSEMENTS_TABLE!,
                IndexName: `${process.env.REIMBURSEMENTS_STATUS_LOCAL_INDEX!}-${process.env.ENV_NAME!}-${region}`,
                ...(exclusiveStartKey && {ExclusiveStartKey: exclusiveStartKey}),
                Limit: 55, // 55 * 13,674  bytes = 752,070 bytes = 0.752 MB (leave a margin of error here up to 1 MB)
                ExpressionAttributeNames: {
                    '#id': 'id',
                    '#st': 'reimbursementStatus'
                },
                ExpressionAttributeValues: {
                    ":id": {
                        S: getReimbursementByStatusInput.id
                    },
                    ":st": {
                        S: getReimbursementByStatusInput.reimbursementStatus
                    }
                },
                KeyConditionExpression: '#id = :id AND #st = :st'
            }));

            exclusiveStartKey = retrievedData.LastEvaluatedKey;
            result = result.concat(retrievedData.Items);
        } while (retrievedData && retrievedData.Count && retrievedData.Items &&
        retrievedData.Items.length && retrievedData.Count !== 0 &&
        retrievedData.Items.length !== 0 && retrievedData.LastEvaluatedKey);

        // if there are eligible reimbursements retrieved, then return them accordingly
        if (result && result.length !== 0) {
            // convert the Dynamo DB data from Dynamo DB JSON format to a Moonbeam reimbursement by status object
            const reimbursementByStatusData: Reimbursement[] = [];
            result.forEach(reimbursementByStatusResult => {
                // unmarshall the DynamoDB record to an actual Reimbursement object, to be user later
                const unmarshalledReimbursement = unmarshall(reimbursementByStatusResult);
                const unmarshalledTransactionsList: ReimbursementTransaction[] = unmarshalledReimbursement.transactions;
                const reimbursement: Reimbursement = {
                    cardId: reimbursementByStatusResult.cardId.S!,
                    ...(reimbursementByStatusResult.clientId && {
                        clientId: reimbursementByStatusResult.clientId.S!
                    }),
                    createdAt: reimbursementByStatusResult.createdAt.S!,
                    creditedCashbackAmount: Number(reimbursementByStatusResult.creditedCashbackAmount.N!),
                    currencyCode: reimbursementByStatusResult.currencyCode.S! as CurrencyCodeType,
                    id: reimbursementByStatusResult.id.S!,
                    ...(reimbursementByStatusResult.paymentGatewayId && {
                        paymentGatewayId: reimbursementByStatusResult.paymentGatewayId.S!
                    }),
                    pendingCashbackAmount: Number(reimbursementByStatusResult.pendingCashbackAmount.N!),
                    ...(reimbursementByStatusResult.processingMessage && {
                        processingMessage: reimbursementByStatusResult.processingMessage.S!
                    }),
                    reimbursementId: reimbursementByStatusResult.reimbursementId.S!,
                    reimbursementStatus: reimbursementByStatusResult.reimbursementStatus.S! as ReimbursementStatus,
                    ...(reimbursementByStatusResult.succeeded !== undefined && reimbursementByStatusResult.succeeded !== null && {
                        succeeded: reimbursementByStatusResult.succeeded.BOOL!
                    }),
                    timestamp: Number(reimbursementByStatusResult.timestamp.N!),
                    transactions: unmarshalledTransactionsList,
                    updatedAt: reimbursementByStatusResult.createdAt.S!
                };
                reimbursementByStatusData.push(reimbursement);
            });
            // return the list of filtered reimbursements
            return {
                data: reimbursementByStatusData
            }
        } else {
            const errorMessage = `Transactions with status ${getReimbursementByStatusInput.reimbursementStatus} for user ${getReimbursementByStatusInput.id} not found!`;
            console.log(errorMessage);

            return {
                errorMessage: errorMessage,
                errorType: ReimbursementsErrorType.NoneOrAbsent
            }
        }
    } catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} query ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: ReimbursementsErrorType.UnexpectedError
        };
    }
}
