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
                    updatedTransactionsList.push({
                        M: {
                            id: {
                                S: transaction.id
                            },
                            timestamp: {
                                N: Number(transaction.timestamp)
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
                updateExpression += ", #tran = :tran";
                updateReimbursementInput.transactions = updatedTransactionsList;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXBkYXRlUmVpbWJ1cnNlbWVudFJlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9yZXNvbHZlcnMvVXBkYXRlUmVpbWJ1cnNlbWVudFJlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDhEQUEyRjtBQUMzRiwrREFPbUM7QUFDbkMsMERBQWtEO0FBRWxEOzs7Ozs7R0FNRztBQUNJLE1BQU0sbUJBQW1CLEdBQUcsS0FBSyxFQUFFLFNBQWlCLEVBQUUsd0JBQWtELEVBQWtDLEVBQUU7SUFDL0ksSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2Qyw0Q0FBNEM7UUFDNUMsTUFBTSxjQUFjLEdBQUcsSUFBSSxnQ0FBYyxDQUFDLEVBQUMsTUFBTSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7UUFFNUQsb0NBQW9DO1FBQ3BDLE1BQU0sU0FBUyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDM0Msd0JBQXdCLENBQUMsU0FBUyxHQUFHLHdCQUF3QixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsd0JBQXdCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFFekgsZ0hBQWdIO1FBQ2hILE1BQU0sOEJBQThCLEdBQUcsTUFBTSxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksZ0NBQWMsQ0FBQztZQUNoRixTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBcUI7WUFDNUMsR0FBRyxFQUFFO2dCQUNELEVBQUUsRUFBRTtvQkFDQSxDQUFDLEVBQUUsd0JBQXdCLENBQUMsRUFBRTtpQkFDakM7Z0JBQ0QsU0FBUyxFQUFFO29CQUNQLENBQUMsRUFBRSx3QkFBd0IsQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFO2lCQUNuRDthQUNKO1NBQ0osQ0FBQyxDQUFDLENBQUM7UUFFSiwwR0FBMEc7UUFDMUcsSUFBSSw4QkFBOEIsSUFBSSw4QkFBOEIsQ0FBQyxJQUFJLEVBQUU7WUFDdkUscUZBQXFGO1lBQ3JGLE1BQU0seUJBQXlCLEdBQUcsSUFBQSwwQkFBVSxFQUFDLDhCQUE4QixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2xGLE1BQU0sbUNBQW1DLEdBQStCLHlCQUF5QixDQUFDLFlBQVksQ0FBQztZQUMvRywwRUFBMEU7WUFDMUUsTUFBTSx1QkFBdUIsR0FBVSw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUUsQ0FBQztZQUMzRixrSUFBa0k7WUFDbEksSUFBSSxnQkFBZ0IsR0FBRyxpQkFBaUIsQ0FBQztZQUN6QyxJQUFJLHdCQUF3QixDQUFDLFlBQVksSUFBSSx3QkFBd0IsQ0FBQyxZQUFZLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDN0YsaUhBQWlIO2dCQUNqSCxLQUFLLE1BQU0sV0FBVyxJQUFJLHdCQUF3QixDQUFDLFlBQVksRUFBRTtvQkFDN0QsdUJBQXVCLENBQUMsSUFBSSxDQUFDO3dCQUN6QixDQUFDLEVBQUU7NEJBQ0MsRUFBRSxFQUFFO2dDQUNBLENBQUMsRUFBRSxXQUFZLENBQUMsRUFBRTs2QkFDckI7NEJBQ0QsU0FBUyxFQUFFO2dDQUNQLENBQUMsRUFBRSxNQUFNLENBQUMsV0FBWSxDQUFDLFNBQVMsQ0FBQzs2QkFDcEM7NEJBQ0QsYUFBYSxFQUFFO2dDQUNYLENBQUMsRUFBRSxXQUFZLENBQUMsYUFBYTs2QkFDaEM7NEJBQ0QsaUJBQWlCLEVBQUU7Z0NBQ2YsQ0FBQyxFQUFFLFdBQVksQ0FBQyxpQkFBaUI7NkJBQ3BDO3lCQUNKO3FCQUNKLENBQUMsQ0FBQztvQkFDSCxtQ0FBbUMsQ0FBQyxJQUFJLENBQUMsV0FBWSxDQUFDLENBQUM7aUJBQzFEO2dCQUNELGdCQUFnQixJQUFJLGlCQUFpQixDQUFDO2dCQUN0Qyx3QkFBd0IsQ0FBQyxZQUFZLEdBQUcsdUJBQXVCLENBQUM7YUFDbkU7WUFDRCxJQUFJLHdCQUF3QixDQUFDLFFBQVEsRUFBRTtnQkFDbkMsZ0JBQWdCLElBQUksZUFBZSxDQUFDO2FBQ3ZDO2lCQUFNLElBQUksd0JBQXdCLENBQUMsZ0JBQWdCLEVBQUU7Z0JBQ2xELGdCQUFnQixJQUFJLGlCQUFpQixDQUFDO2FBQ3pDO2lCQUFNLElBQUksd0JBQXdCLENBQUMsU0FBUyxLQUFLLFNBQVMsSUFBSSx3QkFBd0IsQ0FBQyxTQUFTLEtBQUssSUFBSSxFQUFFO2dCQUN4RyxnQkFBZ0IsSUFBSSxpQkFBaUIsQ0FBQzthQUN6QztpQkFBTSxJQUFJLHdCQUF3QixDQUFDLGlCQUFpQixFQUFFO2dCQUNuRCxnQkFBZ0IsSUFBSSxpQkFBaUIsQ0FBQzthQUN6QztpQkFBTSxJQUFJLHdCQUF3QixDQUFDLG1CQUFtQixFQUFFO2dCQUNyRCxnQkFBZ0IsSUFBSSxtQkFBbUIsQ0FBQzthQUMzQztpQkFBTSxJQUFJLHdCQUF3QixDQUFDLHFCQUFxQixFQUFFO2dCQUN2RCxnQkFBZ0IsSUFBSSxlQUFlLENBQUM7YUFDdkM7aUJBQU0sSUFBSSx3QkFBd0IsQ0FBQyxzQkFBc0IsRUFBRTtnQkFDeEQsZ0JBQWdCLElBQUksZUFBZSxDQUFDO2FBQ3ZDO1lBQ0QsZ0VBQWdFO1lBQ2hFLE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLG1DQUFpQixDQUFDO2dCQUM1QyxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBcUI7Z0JBQzVDLEdBQUcsRUFBRTtvQkFDRCxFQUFFLEVBQUU7d0JBQ0EsQ0FBQyxFQUFFLHdCQUF3QixDQUFDLEVBQUU7cUJBQ2pDO29CQUNELFNBQVMsRUFBRTt3QkFDUCxDQUFDLEVBQUUsd0JBQXdCLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRTtxQkFDbkQ7aUJBQ0o7Z0JBQ0Qsd0JBQXdCLEVBQUU7b0JBQ3RCLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxRQUFRLElBQUksRUFBQyxNQUFNLEVBQUUsVUFBVSxFQUFDLENBQUM7b0JBQzlELEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxnQkFBZ0IsSUFBSSxFQUFDLE9BQU8sRUFBRSxrQkFBa0IsRUFBQyxDQUFDO29CQUMvRSxHQUFHLENBQUMsd0JBQXdCLENBQUMsU0FBUyxLQUFLLFNBQVMsSUFBSSx3QkFBd0IsQ0FBQyxTQUFTLEtBQUssSUFBSSxJQUFJLEVBQUMsT0FBTyxFQUFFLFdBQVcsRUFBQyxDQUFDO29CQUM5SCxHQUFHLENBQUMsd0JBQXdCLENBQUMsaUJBQWlCLElBQUksRUFBQyxPQUFPLEVBQUUsbUJBQW1CLEVBQUMsQ0FBQztvQkFDakYsR0FBRyxDQUFDLHdCQUF3QixDQUFDLG1CQUFtQixJQUFJLEVBQUMsUUFBUSxFQUFFLHFCQUFxQixFQUFDLENBQUM7b0JBQ3RGLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxxQkFBcUIsSUFBSSxFQUFDLE1BQU0sRUFBRSx1QkFBdUIsRUFBQyxDQUFDO29CQUN4RixHQUFHLENBQUMsd0JBQXdCLENBQUMsc0JBQXNCLElBQUksRUFBQyxNQUFNLEVBQUUsd0JBQXdCLEVBQUMsQ0FBQztvQkFDMUYsR0FBRyxDQUFDLHdCQUF3QixDQUFDLFlBQVksSUFBSSx3QkFBd0IsQ0FBQyxZQUFZLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxFQUFDLE9BQU8sRUFBRSxjQUFjLEVBQUMsQ0FBQztvQkFDN0gsTUFBTSxFQUFFLFdBQVc7aUJBQ3RCO2dCQUNELHlCQUF5QixFQUFFO29CQUN2QixHQUFHLENBQUMsd0JBQXdCLENBQUMsUUFBUSxJQUFJO3dCQUNyQyxNQUFNLEVBQUU7NEJBQ0osQ0FBQyxFQUFFLHdCQUF3QixDQUFDLFFBQVE7eUJBQ3ZDO3FCQUNKLENBQUM7b0JBQ0YsR0FBRyxDQUFDLHdCQUF3QixDQUFDLGdCQUFnQixJQUFJO3dCQUM3QyxPQUFPLEVBQUU7NEJBQ0wsQ0FBQyxFQUFFLHdCQUF3QixDQUFDLGdCQUFnQjt5QkFDL0M7cUJBQ0osQ0FBQztvQkFDRixHQUFHLENBQUMsd0JBQXdCLENBQUMsU0FBUyxLQUFLLFNBQVMsSUFBSSx3QkFBd0IsQ0FBQyxTQUFTLEtBQUssSUFBSSxJQUFJO3dCQUNuRyxPQUFPLEVBQUU7NEJBQ0wsSUFBSSxFQUFFLHdCQUF3QixDQUFDLFNBQVM7eUJBQzNDO3FCQUNKLENBQUM7b0JBQ0YsR0FBRyxDQUFDLHdCQUF3QixDQUFDLGlCQUFpQixJQUFJO3dCQUM5QyxPQUFPLEVBQUU7NEJBQ0wsQ0FBQyxFQUFFLHdCQUF3QixDQUFDLGlCQUFpQjt5QkFDaEQ7cUJBQ0osQ0FBQztvQkFDRixHQUFHLENBQUMsd0JBQXdCLENBQUMsbUJBQW1CLElBQUk7d0JBQ2hELFFBQVEsRUFBRTs0QkFDTixDQUFDLEVBQUUsd0JBQXdCLENBQUMsbUJBQW1CO3lCQUNsRDtxQkFDSixDQUFDO29CQUNGLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxxQkFBcUIsSUFBSTt3QkFDbEQsTUFBTSxFQUFFOzRCQUNKLENBQUMsRUFBRSx3QkFBd0IsQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLEVBQUU7eUJBQy9EO3FCQUNKLENBQUM7b0JBQ0YsR0FBRyxDQUFDLHdCQUF3QixDQUFDLHNCQUFzQixJQUFJO3dCQUNuRCxNQUFNLEVBQUU7NEJBQ0osQ0FBQyxFQUFFLHdCQUF3QixDQUFDLHNCQUFzQixDQUFDLFFBQVEsRUFBRTt5QkFDaEU7cUJBQ0osQ0FBQztvQkFDRixHQUFHLENBQUMsd0JBQXdCLENBQUMsWUFBWSxJQUFJLHdCQUF3QixDQUFDLFlBQVksQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJO3dCQUMvRixPQUFPLEVBQUU7NEJBQ0wsQ0FBQyxFQUFFLHVCQUF1Qjt5QkFDN0I7cUJBQ0osQ0FBQztvQkFDRixNQUFNLEVBQUU7d0JBQ0osQ0FBQyxFQUFFLHdCQUF3QixDQUFDLFNBQVM7cUJBQ3hDO2lCQUNKO2dCQUNELGdCQUFnQixFQUFFLGdCQUFnQjtnQkFDbEMsWUFBWSxFQUFFLGFBQWE7YUFDOUIsQ0FBQyxDQUFDLENBQUM7WUFFSix5Q0FBeUM7WUFDekMsT0FBTztnQkFDSCxFQUFFLEVBQUUsd0JBQXdCLENBQUMsRUFBRTtnQkFDL0IsSUFBSSxFQUFFO29CQUNGLEVBQUUsRUFBRSx3QkFBd0IsQ0FBQyxFQUFFO29CQUMvQixTQUFTLEVBQUUsTUFBTSxDQUFDLHdCQUF3QixDQUFDLFNBQVMsQ0FBQztvQkFDckQsZUFBZSxFQUFFLDhCQUE4QixDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBRTtvQkFDdkUsR0FBRyxDQUFDLENBQUMsd0JBQXdCLENBQUMsUUFBUSxJQUFJLDhCQUE4QixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSTt3QkFDdkYsUUFBUSxFQUFFLHdCQUF3QixDQUFDLFFBQVE7NEJBQ3ZDLENBQUMsQ0FBQyx3QkFBd0IsQ0FBQyxRQUFROzRCQUNuQyxDQUFDLENBQUMsOEJBQThCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFFO3FCQUN4RCxDQUFDO29CQUNGLEdBQUcsQ0FBQyxDQUFDLHdCQUF3QixDQUFDLGdCQUFnQixJQUFJLDhCQUE4QixDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJO3dCQUN2RyxnQkFBZ0IsRUFBRSx3QkFBd0IsQ0FBQyxnQkFBZ0I7NEJBQ3ZELENBQUMsQ0FBQyx3QkFBd0IsQ0FBQyxnQkFBZ0I7NEJBQzNDLENBQUMsQ0FBQyw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBRTtxQkFDaEUsQ0FBQztvQkFDRixHQUFHLENBQUMsQ0FBQyxDQUFDLHdCQUF3QixDQUFDLFNBQVMsS0FBSyxTQUFTLElBQUksd0JBQXdCLENBQUMsU0FBUyxLQUFLLElBQUksQ0FBQzsyQkFDL0YsQ0FBQyw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsU0FBUyxJQUFJLDhCQUE4QixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSyxLQUFLLFNBQVMsSUFBSSw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUssS0FBSyxJQUFJLENBQUMsQ0FBQyxJQUFJO3dCQUM1TCxTQUFTLEVBQUUsd0JBQXdCLENBQUMsU0FBUzs0QkFDekMsQ0FBQyxDQUFDLHdCQUF3QixDQUFDLFNBQVM7NEJBQ3BDLENBQUMsQ0FBQyw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUs7cUJBQzVELENBQUM7b0JBQ0YsR0FBRyxDQUFDLENBQUMsd0JBQXdCLENBQUMsaUJBQWlCLElBQUksOEJBQThCLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUk7d0JBQ3pHLGdCQUFnQixFQUFFLHdCQUF3QixDQUFDLGlCQUFpQjs0QkFDeEQsQ0FBQyxDQUFDLHdCQUF3QixDQUFDLGlCQUFpQjs0QkFDNUMsQ0FBQyxDQUFDLDhCQUE4QixDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFFO3FCQUNqRSxDQUFDO29CQUNGLE1BQU0sRUFBRSw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUU7b0JBQ3JELG1CQUFtQixFQUFFLHdCQUF3QixDQUFDLG1CQUFtQjt3QkFDN0QsQ0FBQyxDQUFDLHdCQUF3QixDQUFDLG1CQUEwQzt3QkFDckUsQ0FBQyxDQUFDLDhCQUE4QixDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUF5QjtvQkFDdkYscUJBQXFCLEVBQUUsd0JBQXdCLENBQUMscUJBQXFCO3dCQUNqRSxDQUFDLENBQUMsd0JBQXdCLENBQUMscUJBQXFCO3dCQUNoRCxDQUFDLENBQUMsTUFBTSxDQUFDLDhCQUE4QixDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFFLENBQUM7b0JBQzFFLHNCQUFzQixFQUFFLHdCQUF3QixDQUFDLHNCQUFzQjt3QkFDbkUsQ0FBQyxDQUFDLHdCQUF3QixDQUFDLHNCQUFzQjt3QkFDakQsQ0FBQyxDQUFDLE1BQU0sQ0FBQyw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBRSxDQUFDO29CQUMzRSxZQUFZLEVBQUUsOEJBQThCLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFzQjtvQkFDckYsWUFBWSxFQUFFLG1DQUFtQztvQkFDakQsU0FBUyxFQUFFLDhCQUE4QixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBRTtvQkFDM0QsU0FBUyxFQUFFLHdCQUF3QixDQUFDLFNBQVM7aUJBQ2hEO2FBQ0osQ0FBQTtTQUNKO2FBQU07WUFDSCxNQUFNLFlBQVksR0FBRyx5Q0FBeUMsQ0FBQztZQUMvRCxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRTFCLE9BQU87Z0JBQ0gsWUFBWSxFQUFFLFlBQVk7Z0JBQzFCLFNBQVMsRUFBRSx5Q0FBdUIsQ0FBQyxZQUFZO2FBQ2xELENBQUE7U0FDSjtLQUNKO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDVixNQUFNLFlBQVksR0FBRyxvQ0FBb0MsU0FBUyxhQUFhLEdBQUcsRUFBRSxDQUFDO1FBQ3JGLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDMUIsT0FBTztZQUNILFlBQVksRUFBRSxZQUFZO1lBQzFCLFNBQVMsRUFBRSx5Q0FBdUIsQ0FBQyxlQUFlO1NBQ3JELENBQUE7S0FDSjtBQUNMLENBQUMsQ0FBQTtBQTdNWSxRQUFBLG1CQUFtQix1QkE2TS9CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtEeW5hbW9EQkNsaWVudCwgR2V0SXRlbUNvbW1hbmQsIFVwZGF0ZUl0ZW1Db21tYW5kfSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LWR5bmFtb2RiXCI7XG5pbXBvcnQge1xuICAgIEN1cnJlbmN5Q29kZVR5cGUsXG4gICAgUmVpbWJ1cnNlbWVudFJlc3BvbnNlLFxuICAgIFJlaW1idXJzZW1lbnRzRXJyb3JUeXBlLFxuICAgIFJlaW1idXJzZW1lbnRTdGF0dXMsXG4gICAgUmVpbWJ1cnNlbWVudFRyYW5zYWN0aW9uLFxuICAgIFVwZGF0ZVJlaW1idXJzZW1lbnRJbnB1dCxcbn0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcbmltcG9ydCB7dW5tYXJzaGFsbH0gZnJvbSBcIkBhd3Mtc2RrL3V0aWwtZHluYW1vZGJcIjtcblxuLyoqXG4gKiBVcGRhdGVSZWltYnVyc2VtZW50IHJlc29sdmVyXG4gKlxuICogQHBhcmFtIGZpZWxkTmFtZSBuYW1lIG9mIHRoZSByZXNvbHZlciBwYXRoIGZyb20gdGhlIEFwcFN5bmMgZXZlbnRcbiAqIEBwYXJhbSB1cGRhdGVSZWltYnVyc2VtZW50SW5wdXQgdXBkYXRlIHJlaW1idXJzZW1lbnQgaW5wdXQsIHVzZWQgdG8gdXBkYXRlIGFuIGV4aXN0ZW50IHJlaW1idXJzZW1lbnRcbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgUmVpbWJ1cnNlbWVudFJlc3BvbnNlfVxuICovXG5leHBvcnQgY29uc3QgdXBkYXRlUmVpbWJ1cnNlbWVudCA9IGFzeW5jIChmaWVsZE5hbWU6IHN0cmluZywgdXBkYXRlUmVpbWJ1cnNlbWVudElucHV0OiBVcGRhdGVSZWltYnVyc2VtZW50SW5wdXQpOiBQcm9taXNlPFJlaW1idXJzZW1lbnRSZXNwb25zZT4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgIC8vIGluaXRpYWxpemluZyB0aGUgRHluYW1vREIgZG9jdW1lbnQgY2xpZW50XG4gICAgICAgIGNvbnN0IGR5bmFtb0RiQ2xpZW50ID0gbmV3IER5bmFtb0RCQ2xpZW50KHtyZWdpb246IHJlZ2lvbn0pO1xuXG4gICAgICAgIC8vIHVwZGF0ZSB0aGUgdGltZXN0YW1wcyBhY2NvcmRpbmdseVxuICAgICAgICBjb25zdCB1cGRhdGVkQXQgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgICAgIHVwZGF0ZVJlaW1idXJzZW1lbnRJbnB1dC51cGRhdGVkQXQgPSB1cGRhdGVSZWltYnVyc2VtZW50SW5wdXQudXBkYXRlZEF0ID8gdXBkYXRlUmVpbWJ1cnNlbWVudElucHV0LnVwZGF0ZWRBdCA6IHVwZGF0ZWRBdDtcblxuICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlcmUgaXMgYSByZWltYnVyc2VtZW50IG9iamVjdCB0byB1cGRhdGUuIElmIHRoZXJlJ3Mgbm9uZSwgdGhlbiByZXR1cm4gYW4gZXJyb3IgYWNjb3JkaW5nbHkuXG4gICAgICAgIGNvbnN0IHByZUV4aXN0aW5nUmVpbWJ1cnNlbWVudE9iamVjdCA9IGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IEdldEl0ZW1Db21tYW5kKHtcbiAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuUkVJTUJVUlNFTUVOVFNfVEFCTEUhLFxuICAgICAgICAgICAgS2V5OiB7XG4gICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgUzogdXBkYXRlUmVpbWJ1cnNlbWVudElucHV0LmlkXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IHtcbiAgICAgICAgICAgICAgICAgICAgTjogdXBkYXRlUmVpbWJ1cnNlbWVudElucHV0LnRpbWVzdGFtcC50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG5cbiAgICAgICAgLy8gaWYgdGhlcmUgaXMgYW4gaXRlbSByZXRyaWV2ZWQgdG8gYmUgdXBkYXRlZCwgdGhlbiB3ZSBwcm9jZWVkIGFjY29yZGluZ2x5LiBPdGhlcndpc2UsIHdlIHRocm93IGFuIGVycm9yLlxuICAgICAgICBpZiAocHJlRXhpc3RpbmdSZWltYnVyc2VtZW50T2JqZWN0ICYmIHByZUV4aXN0aW5nUmVpbWJ1cnNlbWVudE9iamVjdC5JdGVtKSB7XG4gICAgICAgICAgICAvLyB1bm1hcnNoYWxsIHRoZSBEeW5hbW9EQiByZWNvcmQgdG8gYW4gYWN0dWFsIFJlaW1idXJzZW1lbnQgb2JqZWN0LCB0byBiZSB1c2VyIGxhdGVyXG4gICAgICAgICAgICBjb25zdCB1bm1hcnNoYWxsZWRSZWltYnVyc2VtZW50ID0gdW5tYXJzaGFsbChwcmVFeGlzdGluZ1JlaW1idXJzZW1lbnRPYmplY3QuSXRlbSk7XG4gICAgICAgICAgICBjb25zdCB1bm1hcnNoYWxsZWRVcGRhdGVkVHJhbnNhY3Rpb25zTGlzdDogUmVpbWJ1cnNlbWVudFRyYW5zYWN0aW9uW10gPSB1bm1hcnNoYWxsZWRSZWltYnVyc2VtZW50LnRyYW5zYWN0aW9ucztcbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBvbGQgdHJhbnNhY3Rpb25zIGZvciB0aGUgcmV0cmlldmVkIGl0ZW0ncyB0cmFuc2FjdGlvbiBsaXN0XG4gICAgICAgICAgICBjb25zdCB1cGRhdGVkVHJhbnNhY3Rpb25zTGlzdDogYW55W10gPSBwcmVFeGlzdGluZ1JlaW1idXJzZW1lbnRPYmplY3QuSXRlbS50cmFuc2FjdGlvbnMuTCE7XG4gICAgICAgICAgICAvLyB1cGRhdGUgdGhlIGV4aXN0aW5nIHRyYW5zYWN0aW9uIGxpc3QsIGdpdmVuIHRoZSByZXRyaWV2ZSByZWltYnVyc2VtZW50IGluZm9ybWF0aW9uLCBhcyB3ZWxsIGFzIHRoZSBpbmNvbWluZyB0cmFuc2FjdGlvbiB1cGRhdGVzXG4gICAgICAgICAgICBsZXQgdXBkYXRlRXhwcmVzc2lvbiA9IFwiU0VUICN1YXQgPSA6dWF0XCI7XG4gICAgICAgICAgICBpZiAodXBkYXRlUmVpbWJ1cnNlbWVudElucHV0LnRyYW5zYWN0aW9ucyAmJiB1cGRhdGVSZWltYnVyc2VtZW50SW5wdXQudHJhbnNhY3Rpb25zLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgICAgIC8vIGFkZCB0aGUgbmV3IHRyYW5zYWN0aW9ucyBpbiB0aGUgbGlzdCBvZiBleGlzdGluZyB0cmFuc2FjdGlvbnMgYXMgd2VsbCBhcyB0aGUgbGlzdCBvZiB1bm1hcnNoYWxsZWQgdHJhbnNhY3Rpb25zXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCB0cmFuc2FjdGlvbiBvZiB1cGRhdGVSZWltYnVyc2VtZW50SW5wdXQudHJhbnNhY3Rpb25zKSB7XG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRUcmFuc2FjdGlvbnNMaXN0LnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgTToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IHRyYW5zYWN0aW9uIS5pZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE46IE51bWJlcih0cmFuc2FjdGlvbiEudGltZXN0YW1wKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25JZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiB0cmFuc2FjdGlvbiEudHJhbnNhY3Rpb25JZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25TdGF0dXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogdHJhbnNhY3Rpb24hLnRyYW5zYWN0aW9uU3RhdHVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgdW5tYXJzaGFsbGVkVXBkYXRlZFRyYW5zYWN0aW9uc0xpc3QucHVzaCh0cmFuc2FjdGlvbiEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB1cGRhdGVFeHByZXNzaW9uICs9IFwiLCAjdHJhbiA9IDp0cmFuXCI7XG4gICAgICAgICAgICAgICAgdXBkYXRlUmVpbWJ1cnNlbWVudElucHV0LnRyYW5zYWN0aW9ucyA9IHVwZGF0ZWRUcmFuc2FjdGlvbnNMaXN0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHVwZGF0ZVJlaW1idXJzZW1lbnRJbnB1dC5jbGllbnRJZCkge1xuICAgICAgICAgICAgICAgIHVwZGF0ZUV4cHJlc3Npb24gKz0gXCIsICNjaWQgPSA6Y2lkXCI7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHVwZGF0ZVJlaW1idXJzZW1lbnRJbnB1dC5wYXltZW50R2F0ZXdheUlkKSB7XG4gICAgICAgICAgICAgICAgdXBkYXRlRXhwcmVzc2lvbiArPSBcIiwgI3BnaWQgPSA6cGdpZFwiO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh1cGRhdGVSZWltYnVyc2VtZW50SW5wdXQuc3VjY2VlZGVkICE9PSB1bmRlZmluZWQgJiYgdXBkYXRlUmVpbWJ1cnNlbWVudElucHV0LnN1Y2NlZWRlZCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHVwZGF0ZUV4cHJlc3Npb24gKz0gXCIsICNzdWNjID0gOnN1Y2NcIjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodXBkYXRlUmVpbWJ1cnNlbWVudElucHV0LnByb2Nlc3NpbmdNZXNzYWdlKSB7XG4gICAgICAgICAgICAgICAgdXBkYXRlRXhwcmVzc2lvbiArPSBcIiwgI3BnaWQgPSA6cGdpZFwiO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh1cGRhdGVSZWltYnVyc2VtZW50SW5wdXQucmVpbWJ1cnNlbWVudFN0YXR1cykge1xuICAgICAgICAgICAgICAgIHVwZGF0ZUV4cHJlc3Npb24gKz0gXCIsICNyc3RhdCA9IDpyc3RhdFwiO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh1cGRhdGVSZWltYnVyc2VtZW50SW5wdXQucGVuZGluZ0Nhc2hiYWNrQW1vdW50KSB7XG4gICAgICAgICAgICAgICAgdXBkYXRlRXhwcmVzc2lvbiArPSBcIiwgI3BjYSA9IDpwY2FcIjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodXBkYXRlUmVpbWJ1cnNlbWVudElucHV0LmNyZWRpdGVkQ2FzaGJhY2tBbW91bnQpIHtcbiAgICAgICAgICAgICAgICB1cGRhdGVFeHByZXNzaW9uICs9IFwiLCAjY2NhID0gOmNjYVwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gdXBkYXRlIHRoZSByZWltYnVyc2VtZW50IG9iamVjdCBiYXNlZCBvbiB0aGUgcGFzc2VkIGluIG9iamVjdFxuICAgICAgICAgICAgYXdhaXQgZHluYW1vRGJDbGllbnQuc2VuZChuZXcgVXBkYXRlSXRlbUNvbW1hbmQoe1xuICAgICAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuUkVJTUJVUlNFTUVOVFNfVEFCTEUhLFxuICAgICAgICAgICAgICAgIEtleToge1xuICAgICAgICAgICAgICAgICAgICBpZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogdXBkYXRlUmVpbWJ1cnNlbWVudElucHV0LmlkXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgTjogdXBkYXRlUmVpbWJ1cnNlbWVudElucHV0LnRpbWVzdGFtcC50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lczoge1xuICAgICAgICAgICAgICAgICAgICAuLi4odXBkYXRlUmVpbWJ1cnNlbWVudElucHV0LmNsaWVudElkICYmIHtcIiNjaWRcIjogXCJjbGllbnRJZFwifSksXG4gICAgICAgICAgICAgICAgICAgIC4uLih1cGRhdGVSZWltYnVyc2VtZW50SW5wdXQucGF5bWVudEdhdGV3YXlJZCAmJiB7XCIjcGdpZFwiOiBcInBheW1lbnRHYXRld2F5SWRcIn0pLFxuICAgICAgICAgICAgICAgICAgICAuLi4odXBkYXRlUmVpbWJ1cnNlbWVudElucHV0LnN1Y2NlZWRlZCAhPT0gdW5kZWZpbmVkICYmIHVwZGF0ZVJlaW1idXJzZW1lbnRJbnB1dC5zdWNjZWVkZWQgIT09IG51bGwgJiYge1wiI3N1Y2NcIjogXCJzdWNjZWVkZWRcIn0pLFxuICAgICAgICAgICAgICAgICAgICAuLi4odXBkYXRlUmVpbWJ1cnNlbWVudElucHV0LnByb2Nlc3NpbmdNZXNzYWdlICYmIHtcIiNwbXNnXCI6IFwicHJvY2Vzc2luZ01lc3NhZ2VcIn0pLFxuICAgICAgICAgICAgICAgICAgICAuLi4odXBkYXRlUmVpbWJ1cnNlbWVudElucHV0LnJlaW1idXJzZW1lbnRTdGF0dXMgJiYge1wiI3JzdGF0XCI6IFwicmVpbWJ1cnNlbWVudFN0YXR1c1wifSksXG4gICAgICAgICAgICAgICAgICAgIC4uLih1cGRhdGVSZWltYnVyc2VtZW50SW5wdXQucGVuZGluZ0Nhc2hiYWNrQW1vdW50ICYmIHtcIiNwY2FcIjogXCJwZW5kaW5nQ2FzaGJhY2tBbW91bnRcIn0pLFxuICAgICAgICAgICAgICAgICAgICAuLi4odXBkYXRlUmVpbWJ1cnNlbWVudElucHV0LmNyZWRpdGVkQ2FzaGJhY2tBbW91bnQgJiYge1wiI2NjYVwiOiBcImNyZWRpdGVkQ2FzaGJhY2tBbW91bnRcIn0pLFxuICAgICAgICAgICAgICAgICAgICAuLi4odXBkYXRlUmVpbWJ1cnNlbWVudElucHV0LnRyYW5zYWN0aW9ucyAmJiB1cGRhdGVSZWltYnVyc2VtZW50SW5wdXQudHJhbnNhY3Rpb25zLmxlbmd0aCAhPT0gMCAmJiB7XCIjdHJhblwiOiBcInRyYW5zYWN0aW9uc1wifSksXG4gICAgICAgICAgICAgICAgICAgIFwiI3VhdFwiOiBcInVwZGF0ZWRBdFwiXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBFeHByZXNzaW9uQXR0cmlidXRlVmFsdWVzOiB7XG4gICAgICAgICAgICAgICAgICAgIC4uLih1cGRhdGVSZWltYnVyc2VtZW50SW5wdXQuY2xpZW50SWQgJiYge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCI6Y2lkXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiB1cGRhdGVSZWltYnVyc2VtZW50SW5wdXQuY2xpZW50SWRcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIC4uLih1cGRhdGVSZWltYnVyc2VtZW50SW5wdXQucGF5bWVudEdhdGV3YXlJZCAmJiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcIjpwZ2lkXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiB1cGRhdGVSZWltYnVyc2VtZW50SW5wdXQucGF5bWVudEdhdGV3YXlJZFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgLi4uKHVwZGF0ZVJlaW1idXJzZW1lbnRJbnB1dC5zdWNjZWVkZWQgIT09IHVuZGVmaW5lZCAmJiB1cGRhdGVSZWltYnVyc2VtZW50SW5wdXQuc3VjY2VlZGVkICE9PSBudWxsICYmIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiOnN1Y2NcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEJPT0w6IHVwZGF0ZVJlaW1idXJzZW1lbnRJbnB1dC5zdWNjZWVkZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIC4uLih1cGRhdGVSZWltYnVyc2VtZW50SW5wdXQucHJvY2Vzc2luZ01lc3NhZ2UgJiYge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCI6cG1zZ1wiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogdXBkYXRlUmVpbWJ1cnNlbWVudElucHV0LnByb2Nlc3NpbmdNZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAuLi4odXBkYXRlUmVpbWJ1cnNlbWVudElucHV0LnJlaW1idXJzZW1lbnRTdGF0dXMgJiYge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCI6cnN0YXRcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IHVwZGF0ZVJlaW1idXJzZW1lbnRJbnB1dC5yZWltYnVyc2VtZW50U3RhdHVzXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAuLi4odXBkYXRlUmVpbWJ1cnNlbWVudElucHV0LnBlbmRpbmdDYXNoYmFja0Ftb3VudCAmJiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcIjpwY2FcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE46IHVwZGF0ZVJlaW1idXJzZW1lbnRJbnB1dC5wZW5kaW5nQ2FzaGJhY2tBbW91bnQudG9TdHJpbmcoKVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgLi4uKHVwZGF0ZVJlaW1idXJzZW1lbnRJbnB1dC5jcmVkaXRlZENhc2hiYWNrQW1vdW50ICYmIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiOmNjYVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTjogdXBkYXRlUmVpbWJ1cnNlbWVudElucHV0LmNyZWRpdGVkQ2FzaGJhY2tBbW91bnQudG9TdHJpbmcoKVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgLi4uKHVwZGF0ZVJlaW1idXJzZW1lbnRJbnB1dC50cmFuc2FjdGlvbnMgJiYgdXBkYXRlUmVpbWJ1cnNlbWVudElucHV0LnRyYW5zYWN0aW9ucy5sZW5ndGggIT09IDAgJiYge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCI6dHJhblwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTDogdXBkYXRlZFRyYW5zYWN0aW9uc0xpc3RcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIFwiOnVhdFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTOiB1cGRhdGVSZWltYnVyc2VtZW50SW5wdXQudXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIFVwZGF0ZUV4cHJlc3Npb246IHVwZGF0ZUV4cHJlc3Npb24sXG4gICAgICAgICAgICAgICAgUmV0dXJuVmFsdWVzOiBcIlVQREFURURfTkVXXCJcbiAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSB1cGRhdGVkIHRyYW5zYWN0aW9uIGRldGFpbHNcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgaWQ6IHVwZGF0ZVJlaW1idXJzZW1lbnRJbnB1dC5pZCxcbiAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiB1cGRhdGVSZWltYnVyc2VtZW50SW5wdXQuaWQsXG4gICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogTnVtYmVyKHVwZGF0ZVJlaW1idXJzZW1lbnRJbnB1dC50aW1lc3RhbXApLFxuICAgICAgICAgICAgICAgICAgICByZWltYnVyc2VtZW50SWQ6IHByZUV4aXN0aW5nUmVpbWJ1cnNlbWVudE9iamVjdC5JdGVtLnJlaW1idXJzZW1lbnRJZC5TISxcbiAgICAgICAgICAgICAgICAgICAgLi4uKCh1cGRhdGVSZWltYnVyc2VtZW50SW5wdXQuY2xpZW50SWQgfHwgcHJlRXhpc3RpbmdSZWltYnVyc2VtZW50T2JqZWN0Lkl0ZW0uY2xpZW50SWQpICYmIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsaWVudElkOiB1cGRhdGVSZWltYnVyc2VtZW50SW5wdXQuY2xpZW50SWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IHVwZGF0ZVJlaW1idXJzZW1lbnRJbnB1dC5jbGllbnRJZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogcHJlRXhpc3RpbmdSZWltYnVyc2VtZW50T2JqZWN0Lkl0ZW0uY2xpZW50SWQuUyFcbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIC4uLigodXBkYXRlUmVpbWJ1cnNlbWVudElucHV0LnBheW1lbnRHYXRld2F5SWQgfHwgcHJlRXhpc3RpbmdSZWltYnVyc2VtZW50T2JqZWN0Lkl0ZW0ucGF5bWVudEdhdGV3YXlJZCkgJiYge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGF5bWVudEdhdGV3YXlJZDogdXBkYXRlUmVpbWJ1cnNlbWVudElucHV0LnBheW1lbnRHYXRld2F5SWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IHVwZGF0ZVJlaW1idXJzZW1lbnRJbnB1dC5wYXltZW50R2F0ZXdheUlkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBwcmVFeGlzdGluZ1JlaW1idXJzZW1lbnRPYmplY3QuSXRlbS5wYXltZW50R2F0ZXdheUlkLlMhXG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAuLi4oKCh1cGRhdGVSZWltYnVyc2VtZW50SW5wdXQuc3VjY2VlZGVkICE9PSB1bmRlZmluZWQgJiYgdXBkYXRlUmVpbWJ1cnNlbWVudElucHV0LnN1Y2NlZWRlZCAhPT0gbnVsbClcbiAgICAgICAgICAgICAgICAgICAgICAgIHx8IChwcmVFeGlzdGluZ1JlaW1idXJzZW1lbnRPYmplY3QuSXRlbS5zdWNjZWVkZWQgJiYgcHJlRXhpc3RpbmdSZWltYnVyc2VtZW50T2JqZWN0Lkl0ZW0uc3VjY2VlZGVkLkJPT0whICE9PSB1bmRlZmluZWQgJiYgcHJlRXhpc3RpbmdSZWltYnVyc2VtZW50T2JqZWN0Lkl0ZW0uc3VjY2VlZGVkLkJPT0whICE9PSBudWxsKSkgJiYge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VlZGVkOiB1cGRhdGVSZWltYnVyc2VtZW50SW5wdXQuc3VjY2VlZGVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyB1cGRhdGVSZWltYnVyc2VtZW50SW5wdXQuc3VjY2VlZGVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBwcmVFeGlzdGluZ1JlaW1idXJzZW1lbnRPYmplY3QuSXRlbS5zdWNjZWVkZWQuQk9PTCFcbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIC4uLigodXBkYXRlUmVpbWJ1cnNlbWVudElucHV0LnByb2Nlc3NpbmdNZXNzYWdlIHx8IHByZUV4aXN0aW5nUmVpbWJ1cnNlbWVudE9iamVjdC5JdGVtLnByb2Nlc3NpbmdNZXNzYWdlKSAmJiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXltZW50R2F0ZXdheUlkOiB1cGRhdGVSZWltYnVyc2VtZW50SW5wdXQucHJvY2Vzc2luZ01lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IHVwZGF0ZVJlaW1idXJzZW1lbnRJbnB1dC5wcm9jZXNzaW5nTWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogcHJlRXhpc3RpbmdSZWltYnVyc2VtZW50T2JqZWN0Lkl0ZW0ucHJvY2Vzc2luZ01lc3NhZ2UuUyFcbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIGNhcmRJZDogcHJlRXhpc3RpbmdSZWltYnVyc2VtZW50T2JqZWN0Lkl0ZW0uY2FyZElkLlMhLFxuICAgICAgICAgICAgICAgICAgICByZWltYnVyc2VtZW50U3RhdHVzOiB1cGRhdGVSZWltYnVyc2VtZW50SW5wdXQucmVpbWJ1cnNlbWVudFN0YXR1c1xuICAgICAgICAgICAgICAgICAgICAgICAgPyB1cGRhdGVSZWltYnVyc2VtZW50SW5wdXQucmVpbWJ1cnNlbWVudFN0YXR1cyBhcyBSZWltYnVyc2VtZW50U3RhdHVzXG4gICAgICAgICAgICAgICAgICAgICAgICA6IHByZUV4aXN0aW5nUmVpbWJ1cnNlbWVudE9iamVjdC5JdGVtLnJlaW1idXJzZW1lbnRTdGF0dXMuUyEgYXMgUmVpbWJ1cnNlbWVudFN0YXR1cyxcbiAgICAgICAgICAgICAgICAgICAgcGVuZGluZ0Nhc2hiYWNrQW1vdW50OiB1cGRhdGVSZWltYnVyc2VtZW50SW5wdXQucGVuZGluZ0Nhc2hiYWNrQW1vdW50XG4gICAgICAgICAgICAgICAgICAgICAgICA/IHVwZGF0ZVJlaW1idXJzZW1lbnRJbnB1dC5wZW5kaW5nQ2FzaGJhY2tBbW91bnRcbiAgICAgICAgICAgICAgICAgICAgICAgIDogTnVtYmVyKHByZUV4aXN0aW5nUmVpbWJ1cnNlbWVudE9iamVjdC5JdGVtLnBlbmRpbmdDYXNoYmFja0Ftb3VudC5OISksXG4gICAgICAgICAgICAgICAgICAgIGNyZWRpdGVkQ2FzaGJhY2tBbW91bnQ6IHVwZGF0ZVJlaW1idXJzZW1lbnRJbnB1dC5jcmVkaXRlZENhc2hiYWNrQW1vdW50XG4gICAgICAgICAgICAgICAgICAgICAgICA/IHVwZGF0ZVJlaW1idXJzZW1lbnRJbnB1dC5jcmVkaXRlZENhc2hiYWNrQW1vdW50XG4gICAgICAgICAgICAgICAgICAgICAgICA6IE51bWJlcihwcmVFeGlzdGluZ1JlaW1idXJzZW1lbnRPYmplY3QuSXRlbS5jcmVkaXRlZENhc2hiYWNrQW1vdW50Lk4hKSxcbiAgICAgICAgICAgICAgICAgICAgY3VycmVuY3lDb2RlOiBwcmVFeGlzdGluZ1JlaW1idXJzZW1lbnRPYmplY3QuSXRlbS5jdXJyZW5jeUNvZGUuUyEgYXMgQ3VycmVuY3lDb2RlVHlwZSxcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25zOiB1bm1hcnNoYWxsZWRVcGRhdGVkVHJhbnNhY3Rpb25zTGlzdCxcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEF0OiBwcmVFeGlzdGluZ1JlaW1idXJzZW1lbnRPYmplY3QuSXRlbS5jcmVhdGVkQXQuUyEsXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRBdDogdXBkYXRlUmVpbWJ1cnNlbWVudElucHV0LnVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmtub3duIHJlaW1idXJzZW1lbnQgb2JqZWN0IHRvIHVwZGF0ZSFgO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFJlaW1idXJzZW1lbnRzRXJyb3JUeXBlLk5vbmVPckFic2VudFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyAke2ZpZWxkTmFtZX0gbXV0YXRpb24gJHtlcnJ9YDtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBSZWltYnVyc2VtZW50c0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==