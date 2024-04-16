import {AttributeValue, DynamoDBClient, QueryCommand} from "@aws-sdk/client-dynamodb";
import {
    CurrencyCodeType,
    DailyEarningsSummary,
    DailyEarningsSummaryResponse,
    DailyEarningsSummaryStatus,
    DailySummaryErrorType,
    GetDailyEarningsSummaryInput,
    MoonbeamTransaction,
    TransactionsStatus,
    TransactionType
} from "@moonbeam/moonbeam-models";

/**
 * GetDailyEarningsSummary resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getDailyEarningsSummaryInput get daily earnings input object, used to retrieve the daily earnings summary information.
 *
 * @returns {@link Promise} of {@link DailyEarningsSummaryResponse}
 */
export const getDailyEarningsSummary = async (fieldName: string, getDailyEarningsSummaryInput: GetDailyEarningsSummaryInput): Promise<DailyEarningsSummaryResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initializing the DynamoDB document client
        const dynamoDbClient = new DynamoDBClient({region: region});

        // converting the AWSDateTime to Timestamp, for the purposes of using that to retrieve the appropriate daily earnings summary as a sort key
        const targetTimestamp = Date.parse(getDailyEarningsSummaryInput.targetDate);

        /**
         * the data to be retrieved from the Query Command
         * the reimbursement Items returned from the Query Command, all aggregated together
         * the last evaluated key, to help with the pagination of results
         */
        let result: Record<string, AttributeValue>[] = [];
        let exclusiveStartKey, retrievedData;
        do {
            /**
             * retrieve the daily earnings summary data, given the input filtering/information
             *
             * Limit of 1 MB per paginated response data (in our case 300 items). We cannot really determine the average size for an Item,
             * because a daily earnings summary can have multiple potential transactions. Nevertheless, we do not need to do pagination, until we actually
             * decide to display daily earnings in a statement format.
             *
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.Pagination.html}
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.html}
             */
            retrievedData = await dynamoDbClient.send(new QueryCommand({
                TableName: process.env.DAILY_EARNINGS_SUMMARY_TABLE!,
                ...(exclusiveStartKey && {ExclusiveStartKey: exclusiveStartKey}),
                Limit: 300,
                ExpressionAttributeNames: {
                    '#idf': 'id',
                    '#t': 'timestamp'
                },
                ExpressionAttributeValues: {
                    ":idf": {
                        S: getDailyEarningsSummaryInput.id
                    },
                    ":t": {
                        N: targetTimestamp.toString()
                    }
                },
                KeyConditionExpression: '#idf = :idf AND #t = :t'
            }));

            exclusiveStartKey = retrievedData.LastEvaluatedKey;
            result = result.concat(retrievedData.Items);
        } while (retrievedData && retrievedData.Count && retrievedData.Items &&
        retrievedData.Items.length && retrievedData.Count !== 0 &&
        retrievedData.Items.length !== 0 && retrievedData.LastEvaluatedKey);

        // if there is exactly one daily earnings summary retrieved, then return it accordingly
        if (result && result.length === 1) {
            // convert the Dynamo DB data from Dynamo DB JSON format to a Moonbeam Reimbursement data format
            const dailyEarningsSummaryData: DailyEarningsSummary[] = [];
            result.forEach(dailyEarningsSummaryResult => {
                // first build the transaction array data to return for the daily earnings summary
                const transactions: MoonbeamTransaction[] = [];
                dailyEarningsSummaryResult.transactions.L && dailyEarningsSummaryResult.transactions.L!.forEach(transactionResult => {
                    const newTransaction: MoonbeamTransaction = {
                        brandId: transactionResult.M!.brandId.S!,
                        cardId: transactionResult.M!.cardId.S!,
                        category: transactionResult.M!.category.S!,
                        createdAt: transactionResult.M!.createdAt.S!,
                        creditedCashbackAmount: Number(transactionResult.M!.creditedCashbackAmount.N!),
                        currencyCode: transactionResult.M!.currencyCode.S! as CurrencyCodeType,
                        id: transactionResult.M!.id.S!,
                        memberId: transactionResult.M!.memberId.S!,
                        pendingCashbackAmount: Number(transactionResult.M!.pendingCashbackAmount.N!),
                        rewardAmount: Number(transactionResult.M!.rewardAmount.N!),
                        storeId: transactionResult.M!.storeId.S!,
                        timestamp: Number(transactionResult.M!.timestamp.N!),
                        totalAmount: Number(transactionResult.M!.totalAmount.N!),
                        transactionBrandAddress: transactionResult.M!.transactionBrandAddress.S!,
                        transactionBrandLogoUrl: transactionResult.M!.transactionBrandLogoUrl.S!,
                        transactionBrandName: transactionResult.M!.transactionBrandName.S!,
                        transactionBrandURLAddress: transactionResult.M!.transactionBrandURLAddress.S!,
                        transactionId: transactionResult.M!.transactionId.S!,
                        transactionIsOnline: transactionResult.M!.transactionIsOnline.BOOL!,
                        transactionStatus: transactionResult.M!.transactionStatus.S! as TransactionsStatus,
                        transactionType: transactionResult.M!.transactionType.S! as TransactionType,
                        updatedAt: transactionResult.M!.updatedAt.S!
                    }
                    transactions.push(newTransaction);
                });
                // build out each daily earnings summary object to return
                const dailyEarningsSummary: DailyEarningsSummary = {
                    createdAt: dailyEarningsSummaryResult.createdAt.S!,
                    dailyEarningsSummaryID: dailyEarningsSummaryResult.dailyEarningsSummaryID.S!,
                    id: dailyEarningsSummaryResult.id.S!,
                    status: dailyEarningsSummaryResult.status.S! as DailyEarningsSummaryStatus,
                    timestamp: Number(dailyEarningsSummaryResult.timestamp.N!),
                    transactions: transactions,
                    updatedAt: dailyEarningsSummaryResult.updatedAt.S!
                }
                // add each daily earnings summary object to the daily earnings summary array to be returned
                dailyEarningsSummaryData.push(dailyEarningsSummary);
            });
            // return the retrieved daily earnings summary
            return {
                data: dailyEarningsSummaryData
            }
        } else {
            const errorMessage = `Daily Earnings summary data not found for ${getDailyEarningsSummaryInput.id}, and ${getDailyEarningsSummaryInput.targetDate}`;
            console.log(errorMessage);

            return {
                errorMessage: errorMessage,
                errorType: DailySummaryErrorType.NoneOrAbsent
            }
        }

    } catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} query ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: DailySummaryErrorType.UnexpectedError
        };
    }
}
