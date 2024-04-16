import {
    CreateDailyEarningsSummaryInput,
    DailyEarningsSummary,
    DailyEarningsSummaryResponse, DailyEarningsSummaryStatus,
    DailySummaryErrorType, Maybe,
    MoonbeamClient,
    MoonbeamTransaction,
    MoonbeamTransactionsResponse,
    TransactionsErrorType,
    TransactionsStatus
} from "@moonbeam/moonbeam-models";
import {AttributeValue, DynamoDBClient, PutItemCommand} from "@aws-sdk/client-dynamodb";
import {v4 as uuidv4} from 'uuid';

/**
 * CreateDailyEarningsSummary resolver
 *
 * @param createDailyEarningsSummaryInput the input needed to create a new earnings summary
 * @param fieldName name of the resolver path from the AppSync event
 * @returns {@link Promise} of {@link DailyEarningsSummaryResponse}
 */
export const createDailyEarningsSummary = async (fieldName: string, createDailyEarningsSummaryInput: CreateDailyEarningsSummaryInput): Promise<DailyEarningsSummaryResponse> => {
    /**
     * The following process is done when creating daily earnings summaries:
     *
     * 1) Given the inputted target date, we need to create a start and end date that we would then
     * use in step 2. The start and end dates are for the particular day of the given target date.
     * 2) Call the getTransactionsInRange Moonbeam AppSync API, which returns all transactions for
     * that given day.
     * 3) Filter the transactions from step number 2, so we do not include the REJECTED ones. Then,
     * filter these transactions by user, so that each observed user has a list of transactions associated
     * with them.
     * 4) For each user-transaction list map, create a new daily earnings summary by storing it in
     * Dynamo DB, in the Daily Earnings Summary table.
     */
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        /**
         * 1) Given the inputted target date, we need to create a start and end date that we would then
         * use in step 2. The start and end dates are for the particular day of the given target date.
         */
        const inputTargetStartDate: Date = new Date(createDailyEarningsSummaryInput.targetDate);
        const inputTargetEndDate: Date = new Date(createDailyEarningsSummaryInput.targetDate);

        // the start date will be at 00:00:00.000Z
        inputTargetStartDate.setHours(0);
        inputTargetStartDate.setMinutes(0);
        inputTargetStartDate.setSeconds(0);
        inputTargetStartDate.setMilliseconds(0);

        // the end date will be at 23:59:59.999Z
        inputTargetEndDate.setHours(23);
        inputTargetEndDate.setMinutes(59);
        inputTargetEndDate.setSeconds(59);
        inputTargetEndDate.setMilliseconds(999);

        // initialize the Moonbeam Client API here, in order to call the appropriate endpoints for this handler
        const moonbeamClient = new MoonbeamClient(process.env.ENV_NAME!, region);

        /**
         * 2) Call the getTransactionsInRange Moonbeam AppSync API, which returns all transactions for
         * that given day.
         */
        const transactionsInRangeResponse: MoonbeamTransactionsResponse = await moonbeamClient.getTransactionsInRange({
            startDate: new Date(inputTargetStartDate.setUTCHours(0,0,0,0)).toISOString(),
            endDate: new Date(inputTargetEndDate.setUTCHours(23,59,59,999)).toISOString()
        });

        // check to see if the get all transactions in range call was successful or not
        if (transactionsInRangeResponse && !transactionsInRangeResponse.errorMessage && !transactionsInRangeResponse.errorType &&
            transactionsInRangeResponse.data && transactionsInRangeResponse.data.length !== 0) {
            /**
             * 3) Filter the transactions from step number 2, so we do not include the REJECTED ones.Then,
             * filter these transactions by user, so that each observed user has a list of transactions associated
             * with them.
             */
            // @ts-ignore
            const nonRejectedTransactionData: Maybe<MoonbeamTransaction[]> | null = transactionsInRangeResponse.data.filter(transaction => transaction !== null && transaction.transactionStatus !== TransactionsStatus.Rejected);
            // @ts-ignore
            const nonRejectedTransactions: MoonbeamTransaction[] = (nonRejectedTransactionData !== null && nonRejectedTransactionData.length !== 0) ? nonRejectedTransactionData! : [];
            if (nonRejectedTransactions.length !== 0) {
                /**
                 * 4) For each user-transaction list map, create a new daily earnings summary by storing it in
                 * Dynamo DB, in the Daily Earnings Summary table.
                 */
                return buildTransactionsByUser(nonRejectedTransactions).then(transactionsSummaryByUser => {
                    return storeDailyEarningsSummary(region, transactionsSummaryByUser, inputTargetStartDate).then(results => {
                        // ensure that if there are any successfully generate earnings summary, that we return them accordingly
                        if (results.length !== 0) {
                            return {
                                data: results
                            }
                        } else {
                            const errorMessage = `All earnings summaries have failed to generate!`;
                            console.log(errorMessage);

                            return {
                                data: [],
                                errorMessage: errorMessage,
                                errorType: DailySummaryErrorType.UnexpectedError
                            }
                        }
                    });
                });
            } else {
                const errorMessage = `No earnings summaries needed to be created (2)!`;
                console.log(errorMessage);

                return {
                    data: [],
                    errorMessage: errorMessage,
                    errorType: DailySummaryErrorType.NoneOrAbsent
                }
            }
        } else {
            // make sure that if we do not have any transactions in that date range, that we return a NoneOrAbsent error accordingly
            if (transactionsInRangeResponse.errorType && transactionsInRangeResponse.errorType === TransactionsErrorType.NoneOrAbsent &&
                transactionsInRangeResponse.data && transactionsInRangeResponse.data.length === 0) {
                const errorMessage = `No earnings summaries needed to be created (3)!`;
                console.log(errorMessage);

                return {
                    data: [],
                    errorMessage: errorMessage,
                    errorType: DailySummaryErrorType.NoneOrAbsent
                }
            } else {
                const errorMessage = `Retrieving all transactions through the getTransactionsInRange call failed`;
                console.log(errorMessage);

                return {
                    data: [],
                    errorMessage: errorMessage,
                    errorType: DailySummaryErrorType.UnexpectedError
                }
            }
        }
    } catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} mutation ${err}`;
        console.log(errorMessage);
        return {
            data: [],
            errorMessage: errorMessage,
            errorType: DailySummaryErrorType.UnexpectedError
        }
    }
}

/**
 * Function used to build the earning summary Dynamo DB Items to be stored
 *
 * @param transactionsSummaryByUser the map containing the transactions summary built by user.
 * @param inputTargetStartDate the input start date, in the appropriate format.
 *
 * @return a {@link Promise} of {@link any} Array representing the DynamoDB Items to be stored.
 */
const buildDailyEarningsSummariesForDB = async (transactionsSummaryByUser: Map<string, MoonbeamTransaction[]>, inputTargetStartDate: Date): Promise<any[]> => {
    const itemsForDB: any[] = [];
    // only proceed if we accurately built the transactions summary by user.
    transactionsSummaryByUser.forEach((transactionList, userId) => {
        // create the transaction array pertaining to the daily earnings summary, to store
        const transactions: AttributeValue[] = [];
        transactionList.forEach(transaction => {
            // push the transaction in the list of transactions to be stored
            transactions.push({
                M: {
                    id: {
                        S: transaction!.id
                    },
                    timestamp: {
                        N: transaction!.timestamp.toString()
                    },
                    transactionId: {
                        S: transaction!.transactionId
                    },
                    transactionStatus: {
                        S: transaction!.transactionStatus
                    },
                    transactionType: {
                        S: transaction!.transactionType
                    },
                    createdAt: {
                        S: transaction!.createdAt
                    },
                    updatedAt: {
                        S: transaction!.updatedAt
                    },
                    cardId: {
                        S: transaction!.cardId
                    },
                    memberId: {
                        S: transaction!.memberId
                    },
                    brandId: {
                        S: transaction!.brandId
                    },
                    storeId: {
                        S: transaction!.storeId
                    },
                    category: {
                        S: transaction!.category
                    },
                    currencyCode: {
                        S: transaction!.currencyCode
                    },
                    rewardAmount: {
                        N: transaction!.rewardAmount.toFixed(2).toString()
                    },
                    totalAmount: {
                        N: transaction!.totalAmount.toFixed(2).toString()
                    },
                    pendingCashbackAmount: {
                        N: transaction!.pendingCashbackAmount.toFixed(2).toString()
                    },
                    creditedCashbackAmount: {
                        N: transaction!.creditedCashbackAmount.toFixed(2).toString()
                    },
                    transactionBrandName: {
                        S: transaction!.transactionBrandName
                    },
                    transactionBrandAddress: {
                        S: transaction!.transactionBrandAddress
                    },
                    transactionBrandLogoUrl: {
                        S: transaction!.transactionBrandLogoUrl
                    },
                    transactionBrandURLAddress: {
                        S: transaction!.transactionBrandURLAddress
                    },
                    transactionIsOnline: {
                        BOOL: transaction!.transactionIsOnline
                    }
                }
            })
        });

        // store the reimbursements object
        const createdAt = new Date().toISOString();
        const timestamp = Date.parse(inputTargetStartDate.toISOString());
        itemsForDB.push({
            itemToStore: {
                id: {
                    S: userId
                },
                timestamp: {
                    N: timestamp.toString()
                },
                dailyEarningsSummaryID: {
                    S: uuidv4()
                },
                createdAt: {
                    S: createdAt
                },
                updatedAt: {
                    S: createdAt
                },
                status: {
                    S: DailyEarningsSummaryStatus.Sent
                },
                transactions: {
                    L: transactions
                }
            },
            transactionList: transactionList
        });
    })
    return Promise.resolve(itemsForDB);
}

const storeDailySummariesInDB = async(region: string, inputTargetStartDate: Date, itemsToBeStored: any[]): Promise<DailyEarningsSummary[]> => {
    const results: DailyEarningsSummary[] = [];

    // start by initializing the DynamoDB document client.
    const dynamoDbClient = new DynamoDBClient({region: region});

    for (const item of itemsToBeStored) {
        const storedItem =  await dynamoDbClient.send(new PutItemCommand({
            TableName: process.env.DAILY_EARNINGS_SUMMARY_TABLE!,
            Item: item.itemToStore,
        }));

        if (storedItem.$metadata.httpStatusCode && storedItem.$metadata.httpStatusCode === 200) {
            results.push({
                id: item.itemToStore.id.S!,
                timestamp: Date.parse(inputTargetStartDate.toISOString()),
                dailyEarningsSummaryID: item.itemToStore.dailyEarningsSummaryID.S!,
                createdAt: item.itemToStore.createdAt.S!,
                updatedAt: item.itemToStore.updatedAt.S!,
                status: item.itemToStore.status.S! as DailyEarningsSummaryStatus,
                transactions: item.transactionList
            });
        } else {
            console.log(`Failed to generate daily earnings summary: ${{
                id: item.itemToStore.id,
                timestamp: Date.parse(inputTargetStartDate.toISOString()),
                dailyEarningsSummaryID: item.itemToStore.dailyEarningsSummaryID,
                createdAt: item.itemToStore.createdAt,
                updatedAt: item.itemToStore.updatedAt,
                status: item.itemToStore.status as DailyEarningsSummaryStatus,
                transactions: item.transactionList
            }}`);
        }
    }
    return Promise.resolve(results);
}

/**
 * Function used to store all daily earnings summaries, and return whatever it stored
 * in the appropriate format, so we can then use it as our return list.
 *
 * @param region AWS Region the function is deployed in
 * @param transactionsSummaryByUser the map containing the transactions summary built by user.
 * @param inputTargetStartDate the input start date, in the appropriate format.
 *
 * @return a {@link Promise} of {@link DailyEarningsSummary} Array, representing the stored
 * daily summaries.
 */
const storeDailyEarningsSummary = async (region: string, transactionsSummaryByUser: Map<string, MoonbeamTransaction[]>, inputTargetStartDate: Date): Promise<DailyEarningsSummary[]> => {
    return buildDailyEarningsSummariesForDB(transactionsSummaryByUser, inputTargetStartDate).then(itemsToBeStored => {
        return storeDailySummariesInDB(region, inputTargetStartDate, itemsToBeStored).then(results => {
            return results;
        })
    });
}

/**
 * Function used to build transaction summary by user.
 *
 * @param nonRejectedTransactions non REJECTED transactions to build the summary from.
 *
 * @return a {@link Promise} of a {@link Map} containing: key {@link string} representing the user id,
 * and value {@link MoonbeamTransaction} Array, representing the transaction summary for that user.
 */
const buildTransactionsByUser = async (nonRejectedTransactions: MoonbeamTransaction[]): Promise<Map<string, MoonbeamTransaction[]>> => {
    // map to store the transactions summary by user.
    const transactionsSummaryByUser: Map<string, MoonbeamTransaction[]> = new Map<string, MoonbeamTransaction[]>();
    // build out the transaction summary by user map.
    for (const transaction of nonRejectedTransactions) {
        if (transaction !== null) {
            // see if this user is already in the map of transactions summary by user.
            if (transactionsSummaryByUser.has(transaction.id)) {
                transactionsSummaryByUser.get(transaction.id)!.push(transaction);
                // add to the existing entry in the map
                transactionsSummaryByUser.set(transaction.id, transactionsSummaryByUser.get(transaction.id)!);
            } else {
                // create a new entry in the map
                transactionsSummaryByUser.set(transaction.id, [transaction]);
            }
        }
    }
    return Promise.resolve(transactionsSummaryByUser);
}

