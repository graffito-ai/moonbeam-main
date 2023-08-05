import {DynamoDBClient, GetItemCommand, UpdateItemCommand} from "@aws-sdk/client-dynamodb";
import {
    CurrencyCodeType,
    ReimbursementResponse,
    ReimbursementsErrorType,
    ReimbursementStatus,
    ReimbursementTransaction,
    UpdateReimbursementInput,
} from "@moonbeam/moonbeam-models";
import {unmarshall} from "@aws-sdk/util-dynamodb";

/**
 * UpdateReimbursement resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param updateReimbursementInput update reimbursement input, used to update an existent reimbursement
 * @returns {@link Promise} of {@link ReimbursementResponse}
 */
export const updateReimbursement = async (fieldName: string, updateReimbursementInput: UpdateReimbursementInput): Promise<ReimbursementResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initializing the DynamoDB document client
        const dynamoDbClient = new DynamoDBClient({region: region});

        // update the timestamps accordingly
        const updatedAt = new Date().toISOString();
        updateReimbursementInput.updatedAt = updateReimbursementInput.updatedAt ? updateReimbursementInput.updatedAt : updatedAt;

        // check to see if there is a reimbursement object to update. If there's none, then return an error accordingly.
        const preExistingReimbursementObject = await dynamoDbClient.send(new GetItemCommand({
            TableName: process.env.REIMBURSEMENTS_TABLE!,
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
            const unmarshalledReimbursement = unmarshall(preExistingReimbursementObject.Item);
            const unmarshalledUpdatedTransactionsList: ReimbursementTransaction[] = unmarshalledReimbursement.transactions;
            // retrieve the old transactions for the retrieved item's transaction list
            const updatedTransactionsList: any[] = preExistingReimbursementObject.Item.transactions.L!;
            // update the existing transaction list, given the retrieve reimbursement information, as well as the incoming transaction updates
            let updateExpression = "SET #uat = :uat";
            if (updateReimbursementInput.transactions && updateReimbursementInput.transactions.length !== 0) {
                // add the new transactions in the list of existing transactions as well as the list of unmarshalled transactions
                for (const transaction of updateReimbursementInput.transactions) {
                    // check to see if this is a duplicate transaction first, before adding it anywhere
                    const duplicateElements = unmarshalledUpdatedTransactionsList
                        .filter(matchedTransaction => transaction!.id === matchedTransaction.id
                            && transaction!.transactionId === matchedTransaction.transactionId);
                    if (duplicateElements.length === 0) {
                        updatedTransactionsList.push({
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
                                }
                            }
                        });
                        unmarshalledUpdatedTransactionsList.push(transaction!);
                    }
                }
                updateExpression += ", #tran = :tran";
                updateReimbursementInput.transactions = unmarshalledUpdatedTransactionsList;
            }
            if (updateReimbursementInput.clientId) {
                updateExpression += ", #cid = :cid";
            } else if (updateReimbursementInput.paymentGatewayId) {
                updateExpression += ", #pgid = :pgid";
            } else if (updateReimbursementInput.succeeded !== undefined && updateReimbursementInput.succeeded !== null) {
                updateExpression += ", #succ = :succ";
            } else if (updateReimbursementInput.processingMessage) {
                updateExpression += ", #pgid = :pgid";
            } else if (updateReimbursementInput.reimbursementStatus) {
                updateExpression += ", #rstat = :rstat";
            } else if (updateReimbursementInput.pendingCashbackAmount) {
                updateExpression += ", #pca = :pca";
            } else if (updateReimbursementInput.creditedCashbackAmount) {
                updateExpression += ", #cca = :cca";
            }
            // update the reimbursement object based on the passed in object
            await dynamoDbClient.send(new UpdateItemCommand({
                TableName: process.env.REIMBURSEMENTS_TABLE!,
                Key: {
                    id: {
                        S: updateReimbursementInput.id
                    },
                    timestamp: {
                        N: updateReimbursementInput.timestamp.toString()
                    }
                },
                ExpressionAttributeNames: {
                    ...(updateReimbursementInput.clientId && {"#cid": "clientId"}),
                    ...(updateReimbursementInput.paymentGatewayId && {"#pgid": "paymentGatewayId"}),
                    ...(updateReimbursementInput.succeeded !== undefined && updateReimbursementInput.succeeded !== null && {"#succ": "succeeded"}),
                    ...(updateReimbursementInput.processingMessage && {"#pmsg": "processingMessage"}),
                    ...(updateReimbursementInput.reimbursementStatus && {"#rstat": "reimbursementStatus"}),
                    ...(updateReimbursementInput.pendingCashbackAmount && {"#pca": "pendingCashbackAmount"}),
                    ...(updateReimbursementInput.creditedCashbackAmount && {"#cca": "creditedCashbackAmount"}),
                    ...(updateReimbursementInput.transactions && updateReimbursementInput.transactions.length !== 0 && {"#tran": "transactions"}),
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
                    reimbursementId: preExistingReimbursementObject.Item.reimbursementId.S!,
                    ...((updateReimbursementInput.clientId || preExistingReimbursementObject.Item.clientId) && {
                        clientId: updateReimbursementInput.clientId
                            ? updateReimbursementInput.clientId
                            : preExistingReimbursementObject.Item.clientId.S!
                    }),
                    ...((updateReimbursementInput.paymentGatewayId || preExistingReimbursementObject.Item.paymentGatewayId) && {
                        paymentGatewayId: updateReimbursementInput.paymentGatewayId
                            ? updateReimbursementInput.paymentGatewayId
                            : preExistingReimbursementObject.Item.paymentGatewayId.S!
                    }),
                    ...(((updateReimbursementInput.succeeded !== undefined && updateReimbursementInput.succeeded !== null)
                        || (preExistingReimbursementObject.Item.succeeded && preExistingReimbursementObject.Item.succeeded.BOOL! !== undefined && preExistingReimbursementObject.Item.succeeded.BOOL! !== null)) && {
                        succeeded: updateReimbursementInput.succeeded
                            ? updateReimbursementInput.succeeded
                            : preExistingReimbursementObject.Item.succeeded.BOOL!
                    }),
                    ...((updateReimbursementInput.processingMessage || preExistingReimbursementObject.Item.processingMessage) && {
                        paymentGatewayId: updateReimbursementInput.processingMessage
                            ? updateReimbursementInput.processingMessage
                            : preExistingReimbursementObject.Item.processingMessage.S!
                    }),
                    cardId: preExistingReimbursementObject.Item.cardId.S!,
                    reimbursementStatus: updateReimbursementInput.reimbursementStatus
                        ? updateReimbursementInput.reimbursementStatus as ReimbursementStatus
                        : preExistingReimbursementObject.Item.reimbursementStatus.S! as ReimbursementStatus,
                    pendingCashbackAmount: updateReimbursementInput.pendingCashbackAmount
                        ? updateReimbursementInput.pendingCashbackAmount
                        : Number(preExistingReimbursementObject.Item.pendingCashbackAmount.N!),
                    creditedCashbackAmount: updateReimbursementInput.creditedCashbackAmount
                        ? updateReimbursementInput.creditedCashbackAmount
                        : Number(preExistingReimbursementObject.Item.creditedCashbackAmount.N!),
                    currencyCode: preExistingReimbursementObject.Item.currencyCode.S! as CurrencyCodeType,
                    transactions: unmarshalledUpdatedTransactionsList,
                    createdAt: preExistingReimbursementObject.Item.createdAt.S!,
                    updatedAt: updateReimbursementInput.updatedAt
                }
            }
        } else {
            const errorMessage = `Unknown reimbursement object to update!`;
            console.log(errorMessage);

            return {
                errorMessage: errorMessage,
                errorType: ReimbursementsErrorType.NoneOrAbsent
            }
        }
    } catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} mutation ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: ReimbursementsErrorType.UnexpectedError
        }
    }
}
