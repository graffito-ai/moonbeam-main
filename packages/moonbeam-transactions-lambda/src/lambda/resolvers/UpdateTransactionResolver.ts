import {DynamoDBClient, GetItemCommand, UpdateItemCommand} from "@aws-sdk/client-dynamodb";
import {
    MoonbeamUpdatedTransactionResponse,
    TransactionsErrorType,
    TransactionsStatus,
    UpdateTransactionInput,
} from "@moonbeam/moonbeam-models";

/**
 * UpdateTransaction resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param updateTransactionInput update transaction input, used to update an existent transaction
 * @returns {@link Promise} of {@link MoonbeamUpdatedTransactionResponse}
 */
export const updateTransaction = async (fieldName: string, updateTransactionInput: UpdateTransactionInput): Promise<MoonbeamUpdatedTransactionResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initializing the DynamoDB document client
        const dynamoDbClient = new DynamoDBClient({region: region});

        // update the timestamps accordingly
        const updatedAt = new Date().toISOString();
        updateTransactionInput.updatedAt = updateTransactionInput.updatedAt ? updateTransactionInput.updatedAt : updatedAt;

        // check to see if there is a transaction object to update. If there's none, then return an error accordingly.
        const preExistingTransactionObject = await dynamoDbClient.send(new GetItemCommand({
            TableName: process.env.TRANSACTIONS_TABLE!,
            Key: {
                id: {
                    S: updateTransactionInput.id
                },
                timestamp: {
                    N: updateTransactionInput.timestamp.toString()
                }
            }
        }));

        // if there is an item retrieved to be updated, then we proceed accordingly. Otherwise, we throw an error.
        if (preExistingTransactionObject && preExistingTransactionObject.Item) {
            /**
             *  For incoming FRONTED or CREDITED transaction statuses we know that they are resulted from a cash-out/reimbursement
             *  action on the front-end. Therefore, only in those cases, we need to update the following properties of a transaction
             *  as well:
             * - pendingCashbackAmount:
             *   this will have to be reduced to 0.00 for each transaction, specifying that there are $0.00 pending to credit for that transaction
             * - creditedCashbackAmount:
             *   this will have to be equal to the 'rewardAmount', specifying the amount that has been credited to the end-user
             */
            const isCashOutOriginatingTransaction = updateTransactionInput.transactionStatus === TransactionsStatus.Fronted
                || updateTransactionInput.transactionStatus === TransactionsStatus.Credited;

            // update the transaction object based on the passed in object - for now only containing the status details
            await dynamoDbClient.send(new UpdateItemCommand({
                TableName: process.env.TRANSACTIONS_TABLE!,
                Key: {
                    id: {
                        S: updateTransactionInput.id
                    },
                    timestamp: {
                        N: updateTransactionInput.timestamp.toString()
                    }
                },
                ExpressionAttributeNames: {
                    "#tstat": "transactionStatus",
                    "#uat": "updatedAt",
                    ...(isCashOutOriginatingTransaction && {
                        "#pendingCash": "pendingCashbackAmount",
                        "#creditedCash": "creditedCashbackAmount"
                    })
                },
                ExpressionAttributeValues: {
                    ":stat": {
                        S: updateTransactionInput.transactionStatus
                    },
                    ":at": {
                        S: updateTransactionInput.updatedAt
                    },
                    ...(isCashOutOriginatingTransaction && {
                        ":pendingCash": {
                            N: Number(0.00).toFixed(2).toString()
                        },
                        ":creditedCash": {
                            N: Number(preExistingTransactionObject.Item.rewardAmount.N!).toFixed(2).toString()
                        }
                    })
                },
                UpdateExpression: isCashOutOriginatingTransaction
                    ? "SET #tstat = :stat, #uat = :at, #pendingCash = :pendingCash, #creditedCash = :creditedCash"
                    : "SET #tstat = :stat, #uat = :at",
                ReturnValues: "UPDATED_NEW"
            }));

            // return the updated transaction details
            return {
                id: updateTransactionInput.id,
                data: {
                    id: updateTransactionInput.id,
                    timestamp: updateTransactionInput.timestamp,
                    transactionId: updateTransactionInput.transactionId,
                    transactionStatus: updateTransactionInput.transactionStatus,
                    updatedAt: updateTransactionInput.updatedAt
                }
            }
        } else {
            const errorMessage = `Unknown transaction object to update!`;
            console.log(errorMessage);

            return {
                errorMessage: errorMessage,
                errorType: TransactionsErrorType.NoneOrAbsent
            }
        }
    } catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} mutation ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: TransactionsErrorType.UnexpectedError
        }
    }
}
