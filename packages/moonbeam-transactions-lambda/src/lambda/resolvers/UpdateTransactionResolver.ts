import {DynamoDBClient, GetItemCommand, UpdateItemCommand} from "@aws-sdk/client-dynamodb";
import {
    MoonbeamUpdatedTransactionResponse,
    TransactionsErrorType,
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
                    "#uat": "updatedAt"
                },
                ExpressionAttributeValues: {
                    ":stat": {
                        S: updateTransactionInput.transactionStatus
                    },
                    ":at": {
                        S: updateTransactionInput.updatedAt
                    }
                },
                UpdateExpression: "SET #tstat = :stat, #uat = :at",
                ReturnValues: "UPDATED_NEW"
            }));

            // return the updated transaction details
            return {
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
