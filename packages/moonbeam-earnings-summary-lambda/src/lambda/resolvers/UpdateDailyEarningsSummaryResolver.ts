import {DynamoDBClient, GetItemCommand, UpdateItemCommand} from "@aws-sdk/client-dynamodb";
import {
    CurrencyCodeType,
    DailyEarningsSummary,
    DailyEarningsSummaryResponse,
    DailySummaryErrorType,
    MoonbeamTransaction,
    TransactionsStatus,
    TransactionType,
    UpdateDailyEarningsSummaryInput
} from "@moonbeam/moonbeam-models";

/**
 * UpdateDailyEarningsSummary resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param updateDailyEarningsSummaryInput daily earnings summary input used for updating a specific summary's details
 * @returns {@link Promise} of {@link DailyEarningsSummaryResponse}
 */
export const updateDailyEarningsSummary = async (fieldName: string, updateDailyEarningsSummaryInput: UpdateDailyEarningsSummaryInput): Promise<DailyEarningsSummaryResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initializing the DynamoDB document client
        const dynamoDbClient = new DynamoDBClient({region: region});

        // converting the AWSDateTime to Timestamp, for the purposes of using that to retrieve the appropriate daily earnings summary as a sort key
        const targetTimestamp = Date.parse(updateDailyEarningsSummaryInput.targetDate);

        // retrieve the daily earnings summary object, given the update daily earnings summary input object
        const retrievedData = await dynamoDbClient.send(new GetItemCommand({
            TableName: process.env.DAILY_EARNINGS_SUMMARY_TABLE!,
            Key: {
                id: {
                    S: updateDailyEarningsSummaryInput.id
                },
                timestamp: {
                    N: targetTimestamp.toString()
                }
            }
        }));

        // if there is an item retrieved, then proceed to update it accordingly
        if (retrievedData && retrievedData.Item) {
            // the datetime that this daily earnings summary was updated at
            const updatedAt = new Date().toISOString();

            // finally, update the daily earnings summary object, by adding/removing appropriate details to/from it
            await dynamoDbClient.send(new UpdateItemCommand({
                TableName: process.env.DAILY_EARNINGS_SUMMARY_TABLE!,
                Key: {
                    id: {
                        S: updateDailyEarningsSummaryInput.id
                    },
                    timestamp: {
                        N: targetTimestamp.toString()
                    }
                },
                ExpressionAttributeNames: {
                    '#ua': 'updatedAt',
                    '#st': 'status'
                },
                ExpressionAttributeValues: {
                    ":ua": {
                        S: updatedAt
                    },
                    ":st": {
                        S: updateDailyEarningsSummaryInput.status
                    }
                },
                UpdateExpression: "SET #st = :st, #ua = :ua",
                ReturnValues: "UPDATED_NEW"
            }));

            // first build out the list of transactions in the appropriate format
            const transactions: MoonbeamTransaction[] = [];
            retrievedData.Item.transactions.L && retrievedData.Item.transactions.L!.forEach(transactionResult => {
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
                createdAt: retrievedData.Item.createdAt.S!,
                dailyEarningsSummaryID: retrievedData.Item.dailyEarningsSummaryID.S!,
                id: retrievedData.Item.id.S!,
                status: updateDailyEarningsSummaryInput.status,
                timestamp: Number(retrievedData.Item.timestamp.N!),
                transactions: transactions,
                updatedAt: updatedAt
            }

            // return the updated daily earnings summary details
            return {
                data: [dailyEarningsSummary]
            }
        } else {
            const errorMessage = `No Daily Earnings Summary object to update for ${updateDailyEarningsSummaryInput.id} and ${updateDailyEarningsSummaryInput.targetDate}`;
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
