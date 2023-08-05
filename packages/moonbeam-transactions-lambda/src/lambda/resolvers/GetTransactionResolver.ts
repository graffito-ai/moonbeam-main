import {AttributeValue, DynamoDBClient, QueryCommand} from "@aws-sdk/client-dynamodb";
import {
    CurrencyCodeType,
    GetTransactionInput,
    MoonbeamTransaction,
    MoonbeamTransactionsResponse,
    TransactionsErrorType, TransactionsStatus, TransactionType
} from "@moonbeam/moonbeam-models";

/**
 * GetTransactionResolver resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getTransactionInput get transaction input object, used to retrieve transactional information,
 *
 * @returns {@link Promise} of {@link MoonbeamTransactionResponse}
 */
export const getTransaction = async (fieldName: string, getTransactionInput: GetTransactionInput): Promise<MoonbeamTransactionsResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initializing the DynamoDB document client
        const dynamoDbClient = new DynamoDBClient({region: region});

        // converting the AWSDateTime to Timestamp, for comparison and sorting purposes, based on the primary key's sort key
        const startDateTimestamp = getTransactionInput.startDate && Date.parse(new Date(getTransactionInput.startDate).toISOString());
        const endDateTimestamp = Date.parse(new Date(getTransactionInput.endDate).toISOString());

        /**
         * determine whether this range of creation time of a transaction, falls within particular
         * upper and lower bounds, or just within a particular bound.
         */
        const conditionalExpression = startDateTimestamp
            ? '#idf = :idf and #t BETWEEN :tStart and :tEnd'
            : '#idf = :idf and #t <= :tEnd';

        /**
         * the data to be retrieved from the Query Command
         * the transactional Items returned from the Query Command, all aggregated together
         * the last evaluated key, to help with the pagination of results
         */
        let result: Record<string, AttributeValue>[] = [];
        let exclusiveStartKey, retrievedData;

        do {
            /**
             * retrieve the transactional data, given the get transactional input filtering/information
             *
             * Limit of 1 MB per paginated response data (in our case 1,500 items). An average size for an Item is about 500 bytes, which means that we won't
             * need to do pagination, until we actually decide to display transactions in a statement format.
             *
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.Pagination.html}
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.html}
             */
            retrievedData = await dynamoDbClient.send(new QueryCommand({
                TableName: process.env.TRANSACTIONS_TABLE!,
                ...(exclusiveStartKey && {ExclusiveStartKey: exclusiveStartKey}),
                Limit: 1500, // 1,500 * 500 bytes = 750,000 bytes = 0.75 MB (leave a margin of error here up to 1 MB)
                ExpressionAttributeNames: {
                    '#idf': 'id',
                    '#t': 'timestamp'
                },
                ExpressionAttributeValues: {
                    ":idf": {
                        S: getTransactionInput.id
                    },
                    ":tEnd": {
                        N: endDateTimestamp.toString()
                    },
                    ...(startDateTimestamp && {
                        ":tStart": {
                            N: startDateTimestamp.toString()
                        }
                    })
                },
                KeyConditionExpression: conditionalExpression
            }));

            exclusiveStartKey = retrievedData.LastEvaluatedKey;
            result = result.concat(retrievedData.Items);
        } while (retrievedData && retrievedData.Count && retrievedData.Items &&
        retrievedData.Items.length && retrievedData.Count !== 0 &&
        retrievedData.Items.length !== 0 && retrievedData.LastEvaluatedKey);

        // if there is any transactional data retrieved, then return it accordingly
        if (result && result.length !== 0) {
            // convert the Dynamo DB data from Dynamo DB JSON format to a Moonbeam transactional data format
           const transactionalData: MoonbeamTransaction[] = [];
           result.forEach(transactionResult => {
                const transaction: MoonbeamTransaction = {
                    brandId: transactionResult.brandId.S!,
                    cardId: transactionResult.cardId.S!,
                    category: transactionResult.category.S!,
                    createdAt: transactionResult.createdAt.S!,
                    creditedCashbackAmount: Number(transactionResult.creditedCashbackAmount.N!),
                    currencyCode: transactionResult.currencyCode.S! as CurrencyCodeType,
                    id: transactionResult.id.S!,
                    memberId: transactionResult.memberId.S!,
                    pendingCashbackAmount: Number(transactionResult.pendingCashbackAmount.N!),
                    rewardAmount: Number(transactionResult.rewardAmount.N!),
                    storeId: transactionResult.storeId.S!,
                    timestamp: Number(transactionResult.timestamp.N!),
                    totalAmount: Number(transactionResult.totalAmount.N!),
                    transactionBrandAddress: transactionResult.transactionBrandAddress.S!,
                    transactionBrandLogoUrl: transactionResult.transactionBrandLogoUrl.S!,
                    transactionBrandName: transactionResult.transactionBrandName.S!,
                    transactionBrandURLAddress: transactionResult.transactionBrandURLAddress.S!,
                    transactionId: transactionResult.transactionId.S!,
                    transactionIsOnline: transactionResult.transactionIsOnline.BOOL!,
                    transactionStatus: transactionResult.transactionStatus.S! as TransactionsStatus,
                    transactionType: transactionResult.transactionType.S! as TransactionType,
                    updatedAt: transactionResult.updatedAt.S!
                }
                transactionalData.push(transaction);
            });


            // return the retrieved card linking object
            return {
                data: transactionalData
            }
        } else {
            const errorMessage = `Transactional data not found for ${getTransactionInput.id}, and ${JSON.stringify(getTransactionInput)}`;
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
