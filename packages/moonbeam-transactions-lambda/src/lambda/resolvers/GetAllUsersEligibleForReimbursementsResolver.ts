import {
    MoonbeamClient,
    MoonbeamTransactionByStatus,
    MoonbeamTransactionsByStatusResponse,
    NotificationReminderErrorType,
    TransactionsErrorType,
    TransactionsStatus,
    UserForNotificationReminderResponse
} from "@moonbeam/moonbeam-models";
import {AttributeValue, DynamoDBClient, QueryCommand} from "@aws-sdk/client-dynamodb";
import { RetrieveUserDetailsForNotifications } from "@moonbeam/moonbeam-models";

/**
 * GetAllUsersEligibleForReimbursements resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @returns {@link Promise} of {@link UserForNotificationReminderResponse}
 */
export const getAllUsersEligibleForReimbursements = async (fieldName: string): Promise<UserForNotificationReminderResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        /**
         * first, retrieve the list of all existent users from our Cognito user pool
         *
         * first, initialize the Moonbeam Client API here, in order to call the appropriate endpoints for this handler
         */
        const moonbeamClient = new MoonbeamClient(process.env.ENV_NAME!, region);
        const usersForNotificationReminderResponse: UserForNotificationReminderResponse = await moonbeamClient.getAllUsersForNotificationReminders();

        // check to see if the get all users call was successful or not
        if (usersForNotificationReminderResponse && !usersForNotificationReminderResponse.errorMessage && !usersForNotificationReminderResponse.errorType &&
            usersForNotificationReminderResponse.data && usersForNotificationReminderResponse.data.length !== 0) {
            // flags to indicate whether there are any processed or funded transactions in the DB
            let processedTransactionsAvailable: boolean = false;
            let fundedTransactionsAvailable: boolean = false;
            // array of PROCESSED and FUNDED transactions
            let processedTransactions: MoonbeamTransactionByStatus[] = [];
            let fundedTransactions: MoonbeamTransactionByStatus[] = [];

            // first retrieve the PROCESSED transactions
            const processedTransactionsResponse: MoonbeamTransactionsByStatusResponse = await getAllTransactionsForStatus(TransactionsStatus.Processed);
            // check to see if the call was successful and if we have any PROCESSED transactions
            if (processedTransactionsResponse && !processedTransactionsResponse.errorMessage && !processedTransactionsResponse.errorType &&
                processedTransactionsResponse.data !== undefined && processedTransactionsResponse.data !== null && processedTransactionsResponse.data.length !== 0) {
                processedTransactionsAvailable = true;
                processedTransactions = processedTransactionsResponse.data! as MoonbeamTransactionByStatus[];
            } else {
                console.log(`PROCESSED transactions call failed, or no PROCESSED transactions available`);
                processedTransactionsAvailable = false;
            }

            // retrieve the FUNDED transactions
            const fundedTransactionsResponse: MoonbeamTransactionsByStatusResponse = await getAllTransactionsForStatus(TransactionsStatus.Funded);

            // check to see if the call was successful and if we have any FUNDED transactions
            if (fundedTransactionsResponse && !fundedTransactionsResponse.errorMessage && !fundedTransactionsResponse.errorType &&
                fundedTransactionsResponse.data !== undefined && fundedTransactionsResponse.data !== null && fundedTransactionsResponse.data.length !== 0) {
                fundedTransactionsAvailable = true;
                fundedTransactions = fundedTransactionsResponse.data! as MoonbeamTransactionByStatus[];
            } else {
                console.log(`FUNDED transactions call failed, or no FUNDED transactions available`);
                fundedTransactionsAvailable = false;
            }

            // for each user in the list of users, call the getTransactionByStatus in order to see if they are eligible for a reimbursement
            const usersToNotify: RetrieveUserDetailsForNotifications[] = [];
            for (const eligibleUser of usersForNotificationReminderResponse.data) {
                if (eligibleUser !== null) {
                    /**
                     * at this point if the flag above is true, then we know we must have a valid list of 0 or more PROCESSED and/or FUNDED transactions.
                     * Loop through all these transactions and see if their total pendingCashbackAmount is $20 or more. If so add them in the list, otherwise
                     * do not.
                     */
                    if (processedTransactionsAvailable || fundedTransactionsAvailable) {
                        let pendingCashbackAmount = 0.00;
                        // loop through PROCESSED transactions and add up
                        const processedTransactionsForUser = processedTransactions.filter(processedTransaction => processedTransaction !== null && processedTransaction.id === eligibleUser.id);
                        const fundedTransactionsForUser = fundedTransactions.filter(fundedTransaction => fundedTransaction !== null && fundedTransaction.id == eligibleUser.id);
                        processedTransactionsForUser.forEach(processedTransaction => {
                            if (processedTransaction !== null) {
                                pendingCashbackAmount += processedTransaction.pendingCashbackAmount;
                            }
                        });
                        // loop through FUNDED transactions and add up
                        fundedTransactionsForUser.forEach(fundedTransaction => {
                            if (fundedTransaction !== null) {
                                pendingCashbackAmount += fundedTransaction.pendingCashbackAmount;
                            }
                        });
                        if (pendingCashbackAmount >= 20.00) {
                            usersToNotify.push(eligibleUser);
                        }
                    }
                }
            }
            // return all eligible users for reimbursements, needing to get notified.
            return {
                data: usersToNotify
            }
        } else {
            const errorMessage = `Retrieving all users through the getAllUsersForNotificationReminders call failed`;
            console.log(errorMessage);

            return {
                errorMessage: errorMessage,
                errorType: NotificationReminderErrorType.UnexpectedError
            }
        }
    } catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} query ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: NotificationReminderErrorType.UnexpectedError
        };
    }
}

/**
 * Function used to get all transactions, sorted by their status.
 *
 * @param transactionStatusInput input passed in, to filter transactions by.
 *
 * @return {@link MoonbeamTransactionsByStatusResponse} representing the list of transactions
 * filtered by their status.
 */
const getAllTransactionsForStatus = async (transactionStatusInput: TransactionsStatus): Promise<MoonbeamTransactionsByStatusResponse> => {
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
             * Limit of 1 MB per paginated response data (in our case 3,800 items). An average size for an Item is about 111 bytes, which means that we won't
             * need to do pagination here, since we actually retrieve all transactions in a looped format, and we account for paginated responses.
             *
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.Pagination.html}
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.html}
             */
            retrievedData = await dynamoDbClient.send(new QueryCommand({
                TableName: process.env.TRANSACTIONS_TABLE!,
                IndexName: `${process.env.TRANSACTIONS_STATUS_GLOBAL_INDEX!}-${process.env.ENV_NAME!}-${region}`,
                ...(exclusiveStartKey && {ExclusiveStartKey: exclusiveStartKey}),
                Limit: 3800, // 3800 * 111 bytes = 779,000 bytes = 0.779 MB (leave a margin of error here up to 1 MB)
                /**
                 * we're not interested in getting all the data for this call, just the minimum for us to return the necessary information
                 *
                 * @link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html
                 * @link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ExpressionAttributeNames.html
                 */
                ProjectionExpression: '#id, #st, #pcamt, #rwamt, #total',
                ExpressionAttributeNames: {
                    '#id': 'id',
                    '#st': 'transactionStatus',
                    '#pcamt': 'pendingCashbackAmount',
                    '#rwamt': 'rewardAmount',
                    '#total': 'totalAmount'
                },
                ExpressionAttributeValues: {
                    ":st": {
                        S: transactionStatusInput
                    }
                },
                KeyConditionExpression: '#st = :st'
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
                    timestamp: Number(0), // not interested, not retrieving
                    transactionId: '000000', // not interested, not retrieving
                    transactionStatus: moonbeamTransactionByStatusResult.transactionStatus.S! as TransactionsStatus,
                    creditedCashbackAmount: Number(0), // not interested, not retrieving
                    pendingCashbackAmount: Number(moonbeamTransactionByStatusResult.pendingCashbackAmount.N!),
                    rewardAmount: Number(moonbeamTransactionByStatusResult.rewardAmount.N!),
                    totalAmount: Number(moonbeamTransactionByStatusResult.totalAmount.N!)
                };
                moonbeamTransactionByStatusData.push(moonbeamTransactionByStatus);
            });
            // return the list of filtered transactions
            return {
                data: moonbeamTransactionByStatusData
            }
        } else {
            const errorMessage = `Transactions with status ${transactionStatusInput} not found!`;
            console.log(errorMessage);

            return {
                data: [],
                errorMessage: errorMessage,
                errorType: TransactionsErrorType.NoneOrAbsent
            }
        }
    } catch (err) {
        const errorMessage = `Unexpected error while executing the getAllTransactionsForStatus query operation ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: TransactionsErrorType.UnexpectedError
        };
    }
}
