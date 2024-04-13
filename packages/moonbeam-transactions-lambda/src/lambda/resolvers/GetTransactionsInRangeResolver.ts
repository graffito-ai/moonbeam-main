import {AttributeValue, DynamoDBClient, QueryCommand} from "@aws-sdk/client-dynamodb";
import {
    CurrencyCodeType,
    GetTransactionsInRangeInput,
    MoonbeamTransaction,
    MoonbeamTransactionsResponse,
    TransactionsErrorType,
    TransactionsStatus,
    TransactionType
} from "@moonbeam/moonbeam-models";

/**
 * GetTransactionsInRangeResolver resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getTransactionsInRangeInput get transactions in range input object, used to retrieve transactional information.
 *
 * @returns {@link Promise} of {@link MoonbeamTransactionResponse}
 */
export const getTransactionsInRange = async (fieldName: string, getTransactionsInRangeInput: GetTransactionsInRangeInput): Promise<MoonbeamTransactionsResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initializing the DynamoDB document client
        const dynamoDbClient = new DynamoDBClient({region: region});

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
                IndexName: `${process.env.TRANSACTIONS_IN_RANGE_GLOBAL_INDEX!}-${process.env.ENV_NAME!}-${region}`,
                ...(exclusiveStartKey && {ExclusiveStartKey: exclusiveStartKey}),
                Limit: 1500, // 1,500 * 500 bytes = 750,000 bytes = 0.75 MB (leave a margin of error here up to 1 MB)
                ExpressionAttributeNames: {
                    '#cCode': 'currencyCode',
                    '#cAt': 'createdAt'
                },
                ExpressionAttributeValues: {
                    ":cCode": {
                        S: CurrencyCodeType.Usd
                    },
                    ":cAtEnd": {
                        S: getTransactionsInRangeInput.endDate.toString()
                    },
                    ":cAtStart": {
                        S: getTransactionsInRangeInput.startDate.toString()
                    }
                },
                KeyConditionExpression: '#cCode = :cCode AND #cAt BETWEEN :cAtStart AND :cAtEnd'
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


            // return the retrieved transactional data
            return {
                data: transactionalData
            }
        } else {
            const errorMessage = `Transactional data not found for range ${getTransactionsInRangeInput.startDate} - ${getTransactionsInRangeInput.endDate}`;
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
