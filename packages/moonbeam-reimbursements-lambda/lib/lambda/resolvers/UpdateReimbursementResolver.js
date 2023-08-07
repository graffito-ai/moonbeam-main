"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReimbursement = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const util_dynamodb_1 = require("@aws-sdk/util-dynamodb");
/**
 * UpdateReimbursement resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param updateReimbursementInput update reimbursement input, used to update an existent reimbursement
 * @returns {@link Promise} of {@link ReimbursementResponse}
 */
const updateReimbursement = async (fieldName, updateReimbursementInput) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        // initializing the DynamoDB document client
        const dynamoDbClient = new client_dynamodb_1.DynamoDBClient({ region: region });
        // update the timestamps accordingly
        const updatedAt = new Date().toISOString();
        updateReimbursementInput.updatedAt = updateReimbursementInput.updatedAt ? updateReimbursementInput.updatedAt : updatedAt;
        // check to see if there is a reimbursement object to update. If there's none, then return an error accordingly.
        const preExistingReimbursementObject = await dynamoDbClient.send(new client_dynamodb_1.GetItemCommand({
            TableName: process.env.REIMBURSEMENTS_TABLE,
            Key: {
                id: {
                    S: updateReimbursementInput.id
                },
                timestamp: {
                    N: updateReimbursementInput.timestamp.toString()
                }
            }
        }));
        // if there is an item retrieved to be updated, then we proceed accordingly. Otherwise, we throw an error.
        if (preExistingReimbursementObject && preExistingReimbursementObject.Item) {
            // unmarshall the DynamoDB record to an actual Reimbursement object, to be user later
            const unmarshalledReimbursement = (0, util_dynamodb_1.unmarshall)(preExistingReimbursementObject.Item);
            const unmarshalledUpdatedTransactionsList = unmarshalledReimbursement.transactions;
            // retrieve the old transactions for the retrieved item's transaction list
            const updatedTransactionsList = preExistingReimbursementObject.Item.transactions.L;
            // update the existing transaction list, given the retrieve reimbursement information, as well as the incoming transaction updates
            let updateExpression = "SET #uat = :uat";
            if (updateReimbursementInput.transactions && updateReimbursementInput.transactions.length !== 0) {
                // add the new transactions in the list of existing transactions as well as the list of unmarshalled transactions
                for (const transaction of updateReimbursementInput.transactions) {
                    // check to see if this is a duplicate transaction first, before adding it anywhere
                    const duplicateElements = unmarshalledUpdatedTransactionsList
                        .filter(matchedTransaction => transaction.id === matchedTransaction.id
                        && transaction.transactionId === matchedTransaction.transactionId);
                    if (duplicateElements.length === 0) {
                        updatedTransactionsList.push({
                            M: {
                                id: {
                                    S: transaction.id
                                },
                                timestamp: {
                                    N: transaction.timestamp.toString()
                                },
                                transactionId: {
                                    S: transaction.transactionId
                                },
                                transactionStatus: {
                                    S: transaction.transactionStatus
                                }
                            }
                        });
                        unmarshalledUpdatedTransactionsList.push(transaction);
                    }
                }
                updateExpression += ", #tran = :tran";
                updateReimbursementInput.transactions = unmarshalledUpdatedTransactionsList;
            }
            if (updateReimbursementInput.clientId) {
                updateExpression += ", #cid = :cid";
            }
            else if (updateReimbursementInput.paymentGatewayId) {
                updateExpression += ", #pgid = :pgid";
            }
            else if (updateReimbursementInput.succeeded !== undefined && updateReimbursementInput.succeeded !== null) {
                updateExpression += ", #succ = :succ";
            }
            else if (updateReimbursementInput.processingMessage) {
                updateExpression += ", #pgid = :pgid";
            }
            else if (updateReimbursementInput.reimbursementStatus) {
                updateExpression += ", #rstat = :rstat";
            }
            else if (updateReimbursementInput.pendingCashbackAmount) {
                updateExpression += ", #pca = :pca";
            }
            else if (updateReimbursementInput.creditedCashbackAmount) {
                updateExpression += ", #cca = :cca";
            }
            // update the reimbursement object based on the passed in object
            await dynamoDbClient.send(new client_dynamodb_1.UpdateItemCommand({
                TableName: process.env.REIMBURSEMENTS_TABLE,
                Key: {
                    id: {
                        S: updateReimbursementInput.id
                    },
                    timestamp: {
                        N: updateReimbursementInput.timestamp.toString()
                    }
                },
                ExpressionAttributeNames: {
                    ...(updateReimbursementInput.clientId && { "#cid": "clientId" }),
                    ...(updateReimbursementInput.paymentGatewayId && { "#pgid": "paymentGatewayId" }),
                    ...(updateReimbursementInput.succeeded !== undefined && updateReimbursementInput.succeeded !== null && { "#succ": "succeeded" }),
                    ...(updateReimbursementInput.processingMessage && { "#pmsg": "processingMessage" }),
                    ...(updateReimbursementInput.reimbursementStatus && { "#rstat": "reimbursementStatus" }),
                    ...(updateReimbursementInput.pendingCashbackAmount && { "#pca": "pendingCashbackAmount" }),
                    ...(updateReimbursementInput.creditedCashbackAmount && { "#cca": "creditedCashbackAmount" }),
                    ...(updateReimbursementInput.transactions && updateReimbursementInput.transactions.length !== 0 && { "#tran": "transactions" }),
                    "#uat": "updatedAt"
                },
                ExpressionAttributeValues: {
                    ...(updateReimbursementInput.clientId && {
                        ":cid": {
                            S: updateReimbursementInput.clientId
                        }
                    }),
                    ...(updateReimbursementInput.paymentGatewayId && {
                        ":pgid": {
                            S: updateReimbursementInput.paymentGatewayId
                        }
                    }),
                    ...(updateReimbursementInput.succeeded !== undefined && updateReimbursementInput.succeeded !== null && {
                        ":succ": {
                            BOOL: updateReimbursementInput.succeeded
                        }
                    }),
                    ...(updateReimbursementInput.processingMessage && {
                        ":pmsg": {
                            S: updateReimbursementInput.processingMessage
                        }
                    }),
                    ...(updateReimbursementInput.reimbursementStatus && {
                        ":rstat": {
                            S: updateReimbursementInput.reimbursementStatus
                        }
                    }),
                    ...(updateReimbursementInput.pendingCashbackAmount && {
                        ":pca": {
                            N: updateReimbursementInput.pendingCashbackAmount.toString()
                        }
                    }),
                    ...(updateReimbursementInput.creditedCashbackAmount && {
                        ":cca": {
                            N: updateReimbursementInput.creditedCashbackAmount.toString()
                        }
                    }),
                    ...(updateReimbursementInput.transactions && updateReimbursementInput.transactions.length !== 0 && {
                        ":tran": {
                            L: updatedTransactionsList
                        }
                    }),
                    ":uat": {
                        S: updateReimbursementInput.updatedAt
                    }
                },
                UpdateExpression: updateExpression,
                ReturnValues: "UPDATED_NEW"
            }));
            // return the updated transaction details
            return {
                id: updateReimbursementInput.id,
                data: {
                    id: updateReimbursementInput.id,
                    timestamp: Number(updateReimbursementInput.timestamp),
                    reimbursementId: preExistingReimbursementObject.Item.reimbursementId.S,
                    ...((updateReimbursementInput.clientId || preExistingReimbursementObject.Item.clientId) && {
                        clientId: updateReimbursementInput.clientId
                            ? updateReimbursementInput.clientId
                            : preExistingReimbursementObject.Item.clientId.S
                    }),
                    ...((updateReimbursementInput.paymentGatewayId || preExistingReimbursementObject.Item.paymentGatewayId) && {
                        paymentGatewayId: updateReimbursementInput.paymentGatewayId
                            ? updateReimbursementInput.paymentGatewayId
                            : preExistingReimbursementObject.Item.paymentGatewayId.S
                    }),
                    ...(((updateReimbursementInput.succeeded !== undefined && updateReimbursementInput.succeeded !== null)
                        || (preExistingReimbursementObject.Item.succeeded && preExistingReimbursementObject.Item.succeeded.BOOL !== undefined && preExistingReimbursementObject.Item.succeeded.BOOL !== null)) && {
                        succeeded: updateReimbursementInput.succeeded
                            ? updateReimbursementInput.succeeded
                            : preExistingReimbursementObject.Item.succeeded.BOOL
                    }),
                    ...((updateReimbursementInput.processingMessage || preExistingReimbursementObject.Item.processingMessage) && {
                        paymentGatewayId: updateReimbursementInput.processingMessage
                            ? updateReimbursementInput.processingMessage
                            : preExistingReimbursementObject.Item.processingMessage.S
                    }),
                    cardId: preExistingReimbursementObject.Item.cardId.S,
                    reimbursementStatus: updateReimbursementInput.reimbursementStatus
                        ? updateReimbursementInput.reimbursementStatus
                        : preExistingReimbursementObject.Item.reimbursementStatus.S,
                    pendingCashbackAmount: updateReimbursementInput.pendingCashbackAmount
                        ? updateReimbursementInput.pendingCashbackAmount
                        : Number(preExistingReimbursementObject.Item.pendingCashbackAmount.N),
                    creditedCashbackAmount: updateReimbursementInput.creditedCashbackAmount
                        ? updateReimbursementInput.creditedCashbackAmount
                        : Number(preExistingReimbursementObject.Item.creditedCashbackAmount.N),
                    currencyCode: preExistingReimbursementObject.Item.currencyCode.S,
                    transactions: unmarshalledUpdatedTransactionsList,
                    createdAt: preExistingReimbursementObject.Item.createdAt.S,
                    updatedAt: updateReimbursementInput.updatedAt
                }
            };
        }
        else {
            const errorMessage = `Unknown reimbursement object to update!`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.ReimbursementsErrorType.NoneOrAbsent
            };
        }
    }
    catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} mutation ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: moonbeam_models_1.ReimbursementsErrorType.UnexpectedError
        };
    }
};
exports.updateReimbursement = updateReimbursement;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXBkYXRlUmVpbWJ1cnNlbWVudFJlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9yZXNvbHZlcnMvVXBkYXRlUmVpbWJ1cnNlbWVudFJlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDhEQUEyRjtBQUMzRiwrREFPbUM7QUFDbkMsMERBQWtEO0FBRWxEOzs7Ozs7R0FNRztBQUNJLE1BQU0sbUJBQW1CLEdBQUcsS0FBSyxFQUFFLFNBQWlCLEVBQUUsd0JBQWtELEVBQWtDLEVBQUU7SUFDL0ksSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2Qyw0Q0FBNEM7UUFDNUMsTUFBTSxjQUFjLEdBQUcsSUFBSSxnQ0FBYyxDQUFDLEVBQUMsTUFBTSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7UUFFNUQsb0NBQW9DO1FBQ3BDLE1BQU0sU0FBUyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDM0Msd0JBQXdCLENBQUMsU0FBUyxHQUFHLHdCQUF3QixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsd0JBQXdCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFFekgsZ0hBQWdIO1FBQ2hILE1BQU0sOEJBQThCLEdBQUcsTUFBTSxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksZ0NBQWMsQ0FBQztZQUNoRixTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBcUI7WUFDNUMsR0FBRyxFQUFFO2dCQUNELEVBQUUsRUFBRTtvQkFDQSxDQUFDLEVBQUUsd0JBQXdCLENBQUMsRUFBRTtpQkFDakM7Z0JBQ0QsU0FBUyxFQUFFO29CQUNQLENBQUMsRUFBRSx3QkFBd0IsQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFO2lCQUNuRDthQUNKO1NBQ0osQ0FBQyxDQUFDLENB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Q0FBQyw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBRSxDQUFDO29CQUMzRSxZQUFZLEVBQUUsOEJBQThCLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFzQjtvQkFDckYsWUFBWSxFQUFFLG1DQUFtQztvQkFDakQsU0FBUyxFQUFFLDhCQUE4QixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBRTtvQkFDM0QsU0FBUyxFQUFFLHdCQUF3QixDQUFDLFNBQVM7aUJBQ2hEO2FBQ0osQ0FBQTtTQUNKO2FBQU07WUFDSCxNQUFNLFlBQVksR0FBRyx5Q0FBeUMsQ0FBQztZQUMvRCxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRTFCLE9BQU87Z0JBQ0gsWUFBWSxFQUFFLFlBQVk7Z0JBQzFCLFNBQVMsRUFBRSx5Q0FBdUIsQ0FBQyxZQUFZO2FBQ2xELENBQUE7U0FDSjtLQUNKO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDVixNQUFNLFlBQVksR0FBRyxvQ0FBb0MsU0FBUyxhQUFhLEdBQUcsRUFBRSxDQUFDO1FBQ3JGLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDMUIsT0FBTztZQUNILFlBQVksRUFBRSxZQUFZO1lBQzFCLFNBQVMsRUFBRSx5Q0FBdUIsQ0FBQyxlQUFlO1NBQ3JELENBQUE7S0FDSjtBQUNMLENBQUMsQ0FBQTtBQW5OWSxRQUFBLG1CQUFtQix1QkFtTi9CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtEeW5hbW9EQkNsaWVudCwgR2V0SXRlbUNvbW1hbmQsIFVwZGF0ZUl0ZW1Db21tYW5kfSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LWR5bmFtb2RiXCI7XG5pbXBvcnQge1xuICAgIEN1cnJlbmN5Q29kZVR5cGUsXG4gICAgUmVpbWJ1cnNlbWVudFJlc3BvbnNlLFxuICAgIFJlaW1idXJzZW1lbnRzRXJyb3JUeXBlLFxuICAgIFJlaW1idXJzZW1lbnRTdGF0dXMsXG4gICAgUmVpbWJ1cnNlbWVudFRyYW5zYWN0aW9uLFxuICAgIFVwZGF0ZVJlaW1idXJzZW1lbnRJbnB1dCxcbn0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcbmltcG9ydCB7dW5tYXJzaGFsbH0gZnJvbSBcIkBhd3Mtc2RrL3V0aWwtZHluYW1vZGJcIjtcblxuLyoqXG4gKiBVcGRhdGVSZWltYnVyc2VtZW50IHJlc29sdmVyXG4gKlxuICogQHBhcmFtIGZpZWxkTmFtZSBuYW1lIG9mIHRoZSByZXNvbHZlciBwYXRoIGZyb20gdGhlIEFwcFN5bmMgZXZlbnRcbiAqIEBwYXJhbSB1cGRhdGVSZWltYnVyc2VtZW50SW5wdXQgdXBkYXRlIHJlaW1idXJzZW1lbnQgaW5wdXQsIHVzZWQgdG8gdXBkYXRlIGFuIGV4aXN0ZW50IHJlaW1idXJzZW1lbnRcbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgUmVpbWJ1cnNlbWVudFJlc3BvbnNlfVxuICovXG5leHBvcnQgY29uc3QgdXBkYXRlUmVpbWJ1cnNlbWVudCA9IGFzeW5jIChmaWVsZE5hbWU6IHN0cmluZywgdXBkYXRlUmVpbWJ1cnNlbWVudElucHV0OiBVcGRhdGVSZWltYnVyc2VtZW50SW5wdXQpOiBQcm9taXNlPFJlaW1idXJzZW1lbnRSZXNwb25zZT4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgIC8vIGluaXRpYWxpemluZyB0aGUgRHluYW1vREIgZG9jdW1lbnQgY2xpZW50XG4gICAgICAgIGNvbnN0IGR5bmFtb0RiQ2xpZW50ID0gbmV3IER5bmFtb0RCQ2xpZW50KHtyZWdpb246IHJlZ2lvbn0pO1xuXG4gICAgICAgIC8vIHVwZGF0ZSB0aGUgdGltZXN0YW1wcyBhY2NvcmRpbmdseVxuICAgICAgICBjb25zdCB1cGRhdGVkQXQgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgICAgIHVwZGF0ZVJlaW1idXJzZW1lbnRJbnB1dC51cGRhdGVkQXQgPSB1cGRhdGVSZWltYnVyc2VtZW50SW5wdXQudXBkYXRlZEF0ID8gdXBkYXRlUmVpbWJ1cnNlbWVudElucHV0LnVwZGF0ZWRBdCA6IHVwZGF0ZWRBdDtcblxuICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlcmUgaXMgYSByZWltYnVyc2VtZW50IG9iamVjdCB0byB1cGRhdGUuIElmIHRoZXJlJ3Mgbm9uZSwgdGhlbiByZXR1cm4gYW4gZXJyb3IgYWNjb3JkaW5nbHkuXG4gICAgICAgIGNvbnN0IHByZUV4aXN0aW5nUmVpbWJ1cnNlbWVudE9iamVjdCA9IGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IEdldEl0ZW1Db21tYW5kKHtcbiAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuUkVJTUJVUlNFTUVOVFNfVEFCTEUhLFxuICAgICAgICAgICAgS2V5OiB7XG4gICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgUzogdXBkYXRlUmVpbWJ1cnNlbWVudElucHV0LmlkXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IHtcbiAgICAgICAgICAgICAgICAgICAgTjogdXBkYXRlUmVpbWJ1cnNlbWVudElucHV0LnRpbWVzdGFtcC50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG5cbiAgICAgICAgLy8gaWYgdGhlcmUgaXMgYW4gaXRlbSByZXRyaWV2ZWQgdG8gYmUgdXBkYXRlZCwgdGhlbiB3ZSBwcm9jZWVkIGFjY29yZGluZ2x5LiBPdGhlcndpc2UsIHdlIHRocm93IGFuIGVycm9yLlxuICAgICAgICBpZiAocHJlRXhpc3RpbmdSZWltYnVyc2VtZW50T2JqZWN0ICYmIHByZUV4aXN0aW5nUmVpbWJ1cnNlbWVudE9iamVjdC5JdGVtKSB7XG4gICAgICAgICAgICAvLyB1bm1hcnNoYWxsIHRoZSBEeW5hbW9EQiByZWNvcmQgdG8gYW4gYWN0dWFsIFJlaW1idXJzZW1lbnQgb2JqZWN0LCB0byBiZSB1c2VyIGxhdGVyXG4gICAgICAgICAgICBjb25zdCB1bm1hcnNoYWxsZWRSZWltYnVyc2VtZW50ID0gdW5tYXJzaGFsbChwcmVFeGlzdGluZ1JlaW1idXJzZW1lbnRPYmplY3QuSXRlbSk7XG4gICAgICAgICAgICBjb25zdCB1bm1hcnNoYWxsZWRVcGRhdGVkVHJhbnNhY3Rpb25zTGlzdDogUmVpbWJ1cnNlbWVudFRyYW5zYWN0aW9uW10gPSB1bm1hcnNoYWxsZWRSZWltYnVyc2VtZW50LnRyYW5zYWN0aW9ucztcbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBvbGQgdHJhbnNhY3Rpb25zIGZvciB0aGUgcmV0cmlldmVkIGl0ZW0ncyB0cmFuc2FjdGlvbiBsaXN0XG4gICAgICAgICAgICBjb25zdCB1cGRhdGVkVHJhbnNhY3Rpb25zTGlzdDogYW55W10gPSBwcmVFeGlzdGluZ1JlaW1idXJzZW1lbnRPYmplY3QuSXRlbS50cmFuc2FjdGlvbnMuTCE7XG4gICAgICAgICAgICAvLyB1cGRhdGUgdGhlIGV4aXN0aW5nIHRyYW5zYWN0aW9uIGxpc3QsIGdpdmVuIHRoZSByZXRyaWV2ZSByZWltYnVyc2VtZW50IGluZm9ybWF0aW9uLCBhcyB3ZWxsIGFzIHRoZSBpbmNvbWluZyB0cmFuc2FjdGlvbiB1cGRhdGVzXG4gICAgICAgICAgICBsZXQgdXBkYXRlRXhwcmVzc2lvbiA9IFwiU0VUICN1YXQgPSA6dWF0XCI7XG4gICAgICAgICAgICBpZiAodXBkYXRlUmVpbWJ1cnNlbWVudElucHV0LnRyYW5zYWN0aW9ucyAmJiB1cGRhdGVSZWltYnVyc2VtZW50SW5wdXQudHJhbnNhY3Rpb25zLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgICAgIC8vIGFkZCB0aGUgbmV3IHRyYW5zYWN0aW9ucyBpbiB0aGUgbGlzdCBvZiBleGlzdGluZyB0cmFuc2FjdGlvbnMgYXMgd2VsbCBhcyB0aGUgbGlzdCBvZiB1bm1hcnNoYWxsZWQgdHJhbnNhY3Rpb25zXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCB0cmFuc2FjdGlvbiBvZiB1cGRhdGVSZWltYnVyc2VtZW50SW5wdXQudHJhbnNhY3Rpb25zKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGlzIGlzIGEgZHVwbGljYXRlIHRyYW5zYWN0aW9uIGZpcnN0LCBiZWZvcmUgYWRkaW5nIGl0IGFueXdoZXJlXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGR1cGxpY2F0ZUVsZW1lbnRzID0gdW5tYXJzaGFsbGVkVXBkYXRlZFRyYW5zYWN0aW9uc0xpc3RcbiAgICAgICAgICAgICAgICAgICAgICAgIC5maWx0ZXIobWF0Y2hlZFRyYW5zYWN0aW9uID0+IHRyYW5zYWN0aW9uIS5pZCA9PT0gbWF0Y2hlZFRyYW5zYWN0aW9uLmlkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJiYgdHJhbnNhY3Rpb24hLnRyYW5zYWN0aW9uSWQgPT09IG1hdGNoZWRUcmFuc2FjdGlvbi50cmFuc2FjdGlvbklkKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGR1cGxpY2F0ZUVsZW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlZFRyYW5zYWN0aW9uc0xpc3QucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogdHJhbnNhY3Rpb24hLmlkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTjogdHJhbnNhY3Rpb24hLnRpbWVzdGFtcC50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uSWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IHRyYW5zYWN0aW9uIS50cmFuc2FjdGlvbklkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uU3RhdHVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiB0cmFuc2FjdGlvbiEudHJhbnNhY3Rpb25TdGF0dXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdW5tYXJzaGFsbGVkVXBkYXRlZFRyYW5zYWN0aW9uc0xpc3QucHVzaCh0cmFuc2FjdGlvbiEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHVwZGF0ZUV4cHJlc3Npb24gKz0gXCIsICN0cmFuID0gOnRyYW5cIjtcbiAgICAgICAgICAgICAgICB1cGRhdGVSZWltYnVyc2VtZW50SW5wdXQudHJhbnNhY3Rpb25zID0gdW5tYXJzaGFsbGVkVXBkYXRlZFRyYW5zYWN0aW9uc0xpc3Q7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodXBkYXRlUmVpbWJ1cnNlbWVudElucHV0LmNsaWVudElkKSB7XG4gICAgICAgICAgICAgICAgdXBkYXRlRXhwcmVzc2lvbiArPSBcIiwgI2NpZCA9IDpjaWRcIjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodXBkYXRlUmVpbWJ1cnNlbWVudElucHV0LnBheW1lbnRHYXRld2F5SWQpIHtcbiAgICAgICAgICAgICAgICB1cGRhdGVFeHByZXNzaW9uICs9IFwiLCAjcGdpZCA9IDpwZ2lkXCI7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHVwZGF0ZVJlaW1idXJzZW1lbnRJbnB1dC5zdWNjZWVkZWQgIT09IHVuZGVmaW5lZCAmJiB1cGRhdGVSZWltYnVyc2VtZW50SW5wdXQuc3VjY2VlZGVkICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdXBkYXRlRXhwcmVzc2lvbiArPSBcIiwgI3N1Y2MgPSA6c3VjY1wiO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh1cGRhdGVSZWltYnVyc2VtZW50SW5wdXQucHJvY2Vzc2luZ01lc3NhZ2UpIHtcbiAgICAgICAgICAgICAgICB1cGRhdGVFeHByZXNzaW9uICs9IFwiLCAjcGdpZCA9IDpwZ2lkXCI7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHVwZGF0ZVJlaW1idXJzZW1lbnRJbnB1dC5yZWltYnVyc2VtZW50U3RhdHVzKSB7XG4gICAgICAgICAgICAgICAgdXBkYXRlRXhwcmVzc2lvbiArPSBcIiwgI3JzdGF0ID0gOnJzdGF0XCI7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHVwZGF0ZVJlaW1idXJzZW1lbnRJbnB1dC5wZW5kaW5nQ2FzaGJhY2tBbW91bnQpIHtcbiAgICAgICAgICAgICAgICB1cGRhdGVFeHByZXNzaW9uICs9IFwiLCAjcGNhID0gOnBjYVwiO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh1cGRhdGVSZWltYnVyc2VtZW50SW5wdXQuY3JlZGl0ZWRDYXNoYmFja0Ftb3VudCkge1xuICAgICAgICAgICAgICAgIHVwZGF0ZUV4cHJlc3Npb24gKz0gXCIsICNjY2EgPSA6Y2NhXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyB1cGRhdGUgdGhlIHJlaW1idXJzZW1lbnQgb2JqZWN0IGJhc2VkIG9uIHRoZSBwYXNzZWQgaW4gb2JqZWN0XG4gICAgICAgICAgICBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBVcGRhdGVJdGVtQ29tbWFuZCh7XG4gICAgICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5SRUlNQlVSU0VNRU5UU19UQUJMRSEsXG4gICAgICAgICAgICAgICAgS2V5OiB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTOiB1cGRhdGVSZWltYnVyc2VtZW50SW5wdXQuaWRcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBOOiB1cGRhdGVSZWltYnVyc2VtZW50SW5wdXQudGltZXN0YW1wLnRvU3RyaW5nKClcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzOiB7XG4gICAgICAgICAgICAgICAgICAgIC4uLih1cGRhdGVSZWltYnVyc2VtZW50SW5wdXQuY2xpZW50SWQgJiYge1wiI2NpZFwiOiBcImNsaWVudElkXCJ9KSxcbiAgICAgICAgICAgICAgICAgICAgLi4uKHVwZGF0ZVJlaW1idXJzZW1lbnRJbnB1dC5wYXltZW50R2F0ZXdheUlkICYmIHtcIiNwZ2lkXCI6IFwicGF5bWVudEdhdGV3YXlJZFwifSksXG4gICAgICAgICAgICAgICAgICAgIC4uLih1cGRhdGVSZWltYnVyc2VtZW50SW5wdXQuc3VjY2VlZGVkICE9PSB1bmRlZmluZWQgJiYgdXBkYXRlUmVpbWJ1cnNlbWVudElucHV0LnN1Y2NlZWRlZCAhPT0gbnVsbCAmJiB7XCIjc3VjY1wiOiBcInN1Y2NlZWRlZFwifSksXG4gICAgICAgICAgICAgICAgICAgIC4uLih1cGRhdGVSZWltYnVyc2VtZW50SW5wdXQucHJvY2Vzc2luZ01lc3NhZ2UgJiYge1wiI3Btc2dcIjogXCJwcm9jZXNzaW5nTWVzc2FnZVwifSksXG4gICAgICAgICAgICAgICAgICAgIC4uLih1cGRhdGVSZWltYnVyc2VtZW50SW5wdXQucmVpbWJ1cnNlbWVudFN0YXR1cyAmJiB7XCIjcnN0YXRcIjogXCJyZWltYnVyc2VtZW50U3RhdHVzXCJ9KSxcbiAgICAgICAgICAgICAgICAgICAgLi4uKHVwZGF0ZVJlaW1idXJzZW1lbnRJbnB1dC5wZW5kaW5nQ2FzaGJhY2tBbW91bnQgJiYge1wiI3BjYVwiOiBcInBlbmRpbmdDYXNoYmFja0Ftb3VudFwifSksXG4gICAgICAgICAgICAgICAgICAgIC4uLih1cGRhdGVSZWltYnVyc2VtZW50SW5wdXQuY3JlZGl0ZWRDYXNoYmFja0Ftb3VudCAmJiB7XCIjY2NhXCI6IFwiY3JlZGl0ZWRDYXNoYmFja0Ftb3VudFwifSksXG4gICAgICAgICAgICAgICAgICAgIC4uLih1cGRhdGVSZWltYnVyc2VtZW50SW5wdXQudHJhbnNhY3Rpb25zICYmIHVwZGF0ZVJlaW1idXJzZW1lbnRJbnB1dC50cmFuc2FjdGlvbnMubGVuZ3RoICE9PSAwICYmIHtcIiN0cmFuXCI6IFwidHJhbnNhY3Rpb25zXCJ9KSxcbiAgICAgICAgICAgICAgICAgICAgXCIjdWF0XCI6IFwidXBkYXRlZEF0XCJcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgLi4uKHVwZGF0ZVJlaW1idXJzZW1lbnRJbnB1dC5jbGllbnRJZCAmJiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcIjpjaWRcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IHVwZGF0ZVJlaW1idXJzZW1lbnRJbnB1dC5jbGllbnRJZFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgLi4uKHVwZGF0ZVJlaW1idXJzZW1lbnRJbnB1dC5wYXltZW50R2F0ZXdheUlkICYmIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiOnBnaWRcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IHVwZGF0ZVJlaW1idXJzZW1lbnRJbnB1dC5wYXltZW50R2F0ZXdheUlkXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAuLi4odXBkYXRlUmVpbWJ1cnNlbWVudElucHV0LnN1Y2NlZWRlZCAhPT0gdW5kZWZpbmVkICYmIHVwZGF0ZVJlaW1idXJzZW1lbnRJbnB1dC5zdWNjZWVkZWQgIT09IG51bGwgJiYge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCI6c3VjY1wiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQk9PTDogdXBkYXRlUmVpbWJ1cnNlbWVudElucHV0LnN1Y2NlZWRlZFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgLi4uKHVwZGF0ZVJlaW1idXJzZW1lbnRJbnB1dC5wcm9jZXNzaW5nTWVzc2FnZSAmJiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcIjpwbXNnXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiB1cGRhdGVSZWltYnVyc2VtZW50SW5wdXQucHJvY2Vzc2luZ01lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIC4uLih1cGRhdGVSZWltYnVyc2VtZW50SW5wdXQucmVpbWJ1cnNlbWVudFN0YXR1cyAmJiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcIjpyc3RhdFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogdXBkYXRlUmVpbWJ1cnNlbWVudElucHV0LnJlaW1idXJzZW1lbnRTdGF0dXNcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIC4uLih1cGRhdGVSZWltYnVyc2VtZW50SW5wdXQucGVuZGluZ0Nhc2hiYWNrQW1vdW50ICYmIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiOnBjYVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTjogdXBkYXRlUmVpbWJ1cnNlbWVudElucHV0LnBlbmRpbmdDYXNoYmFja0Ftb3VudC50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAuLi4odXBkYXRlUmVpbWJ1cnNlbWVudElucHV0LmNyZWRpdGVkQ2FzaGJhY2tBbW91bnQgJiYge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCI6Y2NhXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBOOiB1cGRhdGVSZWltYnVyc2VtZW50SW5wdXQuY3JlZGl0ZWRDYXNoYmFja0Ftb3VudC50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAuLi4odXBkYXRlUmVpbWJ1cnNlbWVudElucHV0LnRyYW5zYWN0aW9ucyAmJiB1cGRhdGVSZWltYnVyc2VtZW50SW5wdXQudHJhbnNhY3Rpb25zLmxlbmd0aCAhPT0gMCAmJiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcIjp0cmFuXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBMOiB1cGRhdGVkVHJhbnNhY3Rpb25zTGlzdFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgXCI6dWF0XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IHVwZGF0ZVJlaW1idXJzZW1lbnRJbnB1dC51cGRhdGVkQXRcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgVXBkYXRlRXhwcmVzc2lvbjogdXBkYXRlRXhwcmVzc2lvbixcbiAgICAgICAgICAgICAgICBSZXR1cm5WYWx1ZXM6IFwiVVBEQVRFRF9ORVdcIlxuICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICAvLyByZXR1cm4gdGhlIHVwZGF0ZWQgdHJhbnNhY3Rpb24gZGV0YWlsc1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBpZDogdXBkYXRlUmVpbWJ1cnNlbWVudElucHV0LmlkLFxuICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6IHVwZGF0ZVJlaW1idXJzZW1lbnRJbnB1dC5pZCxcbiAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiBOdW1iZXIodXBkYXRlUmVpbWJ1cnNlbWVudElucHV0LnRpbWVzdGFtcCksXG4gICAgICAgICAgICAgICAgICAgIHJlaW1idXJzZW1lbnRJZDogcHJlRXhpc3RpbmdSZWltYnVyc2VtZW50T2JqZWN0Lkl0ZW0ucmVpbWJ1cnNlbWVudElkLlMhLFxuICAgICAgICAgICAgICAgICAgICAuLi4oKHVwZGF0ZVJlaW1idXJzZW1lbnRJbnB1dC5jbGllbnRJZCB8fCBwcmVFeGlzdGluZ1JlaW1idXJzZW1lbnRPYmplY3QuSXRlbS5jbGllbnRJZCkgJiYge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xpZW50SWQ6IHVwZGF0ZVJlaW1idXJzZW1lbnRJbnB1dC5jbGllbnRJZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gdXBkYXRlUmVpbWJ1cnNlbWVudElucHV0LmNsaWVudElkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBwcmVFeGlzdGluZ1JlaW1idXJzZW1lbnRPYmplY3QuSXRlbS5jbGllbnRJZC5TIVxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgLi4uKCh1cGRhdGVSZWltYnVyc2VtZW50SW5wdXQucGF5bWVudEdhdGV3YXlJZCB8fCBwcmVFeGlzdGluZ1JlaW1idXJzZW1lbnRPYmplY3QuSXRlbS5wYXltZW50R2F0ZXdheUlkKSAmJiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXltZW50R2F0ZXdheUlkOiB1cGRhdGVSZWltYnVyc2VtZW50SW5wdXQucGF5bWVudEdhdGV3YXlJZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gdXBkYXRlUmVpbWJ1cnNlbWVudElucHV0LnBheW1lbnRHYXRld2F5SWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IHByZUV4aXN0aW5nUmVpbWJ1cnNlbWVudE9iamVjdC5JdGVtLnBheW1lbnRHYXRld2F5SWQuUyFcbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIC4uLigoKHVwZGF0ZVJlaW1idXJzZW1lbnRJbnB1dC5zdWNjZWVkZWQgIT09IHVuZGVmaW5lZCAmJiB1cGRhdGVSZWltYnVyc2VtZW50SW5wdXQuc3VjY2VlZGVkICE9PSBudWxsKVxuICAgICAgICAgICAgICAgICAgICAgICAgfHwgKHByZUV4aXN0aW5nUmVpbWJ1cnNlbWVudE9iamVjdC5JdGVtLnN1Y2NlZWRlZCAmJiBwcmVFeGlzdGluZ1JlaW1idXJzZW1lbnRPYmplY3QuSXRlbS5zdWNjZWVkZWQuQk9PTCEgIT09IHVuZGVmaW5lZCAmJiBwcmVFeGlzdGluZ1JlaW1idXJzZW1lbnRPYmplY3QuSXRlbS5zdWNjZWVkZWQuQk9PTCEgIT09IG51bGwpKSAmJiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZWVkZWQ6IHVwZGF0ZVJlaW1idXJzZW1lbnRJbnB1dC5zdWNjZWVkZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IHVwZGF0ZVJlaW1idXJzZW1lbnRJbnB1dC5zdWNjZWVkZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IHByZUV4aXN0aW5nUmVpbWJ1cnNlbWVudE9iamVjdC5JdGVtLnN1Y2NlZWRlZC5CT09MIVxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgLi4uKCh1cGRhdGVSZWltYnVyc2VtZW50SW5wdXQucHJvY2Vzc2luZ01lc3NhZ2UgfHwgcHJlRXhpc3RpbmdSZWltYnVyc2VtZW50T2JqZWN0Lkl0ZW0ucHJvY2Vzc2luZ01lc3NhZ2UpICYmIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBheW1lbnRHYXRld2F5SWQ6IHVwZGF0ZVJlaW1idXJzZW1lbnRJbnB1dC5wcm9jZXNzaW5nTWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gdXBkYXRlUmVpbWJ1cnNlbWVudElucHV0LnByb2Nlc3NpbmdNZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBwcmVFeGlzdGluZ1JlaW1idXJzZW1lbnRPYmplY3QuSXRlbS5wcm9jZXNzaW5nTWVzc2FnZS5TIVxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgY2FyZElkOiBwcmVFeGlzdGluZ1JlaW1idXJzZW1lbnRPYmplY3QuSXRlbS5jYXJkSWQuUyEsXG4gICAgICAgICAgICAgICAgICAgIHJlaW1idXJzZW1lbnRTdGF0dXM6IHVwZGF0ZVJlaW1idXJzZW1lbnRJbnB1dC5yZWltYnVyc2VtZW50U3RhdHVzXG4gICAgICAgICAgICAgICAgICAgICAgICA/IHVwZGF0ZVJlaW1idXJzZW1lbnRJbnB1dC5yZWltYnVyc2VtZW50U3RhdHVzIGFzIFJlaW1idXJzZW1lbnRTdGF0dXNcbiAgICAgICAgICAgICAgICAgICAgICAgIDogcHJlRXhpc3RpbmdSZWltYnVyc2VtZW50T2JqZWN0Lkl0ZW0ucmVpbWJ1cnNlbWVudFN0YXR1cy5TISBhcyBSZWltYnVyc2VtZW50U3RhdHVzLFxuICAgICAgICAgICAgICAgICAgICBwZW5kaW5nQ2FzaGJhY2tBbW91bnQ6IHVwZGF0ZVJlaW1idXJzZW1lbnRJbnB1dC5wZW5kaW5nQ2FzaGJhY2tBbW91bnRcbiAgICAgICAgICAgICAgICAgICAgICAgID8gdXBkYXRlUmVpbWJ1cnNlbWVudElucHV0LnBlbmRpbmdDYXNoYmFja0Ftb3VudFxuICAgICAgICAgICAgICAgICAgICAgICAgOiBOdW1iZXIocHJlRXhpc3RpbmdSZWltYnVyc2VtZW50T2JqZWN0Lkl0ZW0ucGVuZGluZ0Nhc2hiYWNrQW1vdW50Lk4hKSxcbiAgICAgICAgICAgICAgICAgICAgY3JlZGl0ZWRDYXNoYmFja0Ftb3VudDogdXBkYXRlUmVpbWJ1cnNlbWVudElucHV0LmNyZWRpdGVkQ2FzaGJhY2tBbW91bnRcbiAgICAgICAgICAgICAgICAgICAgICAgID8gdXBkYXRlUmVpbWJ1cnNlbWVudElucHV0LmNyZWRpdGVkQ2FzaGJhY2tBbW91bnRcbiAgICAgICAgICAgICAgICAgICAgICAgIDogTnVtYmVyKHByZUV4aXN0aW5nUmVpbWJ1cnNlbWVudE9iamVjdC5JdGVtLmNyZWRpdGVkQ2FzaGJhY2tBbW91bnQuTiEpLFxuICAgICAgICAgICAgICAgICAgICBjdXJyZW5jeUNvZGU6IHByZUV4aXN0aW5nUmVpbWJ1cnNlbWVudE9iamVjdC5JdGVtLmN1cnJlbmN5Q29kZS5TISBhcyBDdXJyZW5jeUNvZGVUeXBlLFxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbnM6IHVubWFyc2hhbGxlZFVwZGF0ZWRUcmFuc2FjdGlvbnNMaXN0LFxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IHByZUV4aXN0aW5nUmVpbWJ1cnNlbWVudE9iamVjdC5JdGVtLmNyZWF0ZWRBdC5TISxcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlZEF0OiB1cGRhdGVSZWltYnVyc2VtZW50SW5wdXQudXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVua25vd24gcmVpbWJ1cnNlbWVudCBvYmplY3QgdG8gdXBkYXRlIWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogUmVpbWJ1cnNlbWVudHNFcnJvclR5cGUuTm9uZU9yQWJzZW50XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgZXhlY3V0aW5nICR7ZmllbGROYW1lfSBtdXRhdGlvbiAke2Vycn1gO1xuICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICBlcnJvclR5cGU6IFJlaW1idXJzZW1lbnRzRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICB9XG4gICAgfVxufVxuIl19