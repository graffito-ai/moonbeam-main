"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processUpdatedOfferRedeemedTransactions = void 0;
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const lib_1 = require("@moonbeam/moonbeam-models/lib");
/**
 * UpdatedOfferRedeemedProcessorHandler handler
 *
 * @param event the {@link SQSEvent} to be processed, containing the updated transaction
 * message information
 * @returns {@link Promise} of {@link SQSBatchResponse}
 */
const processUpdatedOfferRedeemedTransactions = async (event) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        /**
         * initializing the batch response, as an empty array, that will be populated with errors, if any throughout the processing
         *
         * for the Lambda to indicate SQS that there have been no failures, and thus enable the deletion of all processed messages
         * from the queue, we have to return an empty batchItemFailures array. If we want to indicate that there have been errors,
         * for each individual message, based on its ID, we have to add it in the final batch response
         *
         * @link https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html
         */
        const itemFailures = [];
        // for each record in the incoming event, repeat the updated transaction processing steps
        for (const updatedTransactionalRecord of event.Records) {
            /**
             * The overall updated transactional event processing, will be made up of the following steps:
             *
             * 1) Call the GET member details Olive API to retrieve the member details (extMemberID) for member.
             * 2) Call the getTransaction Moonbeam AppSync API endpoint, to determine whether there is an existent transaction to update the status for.
             * 3A) If there is an existent transaction, call the updateTransaction AppSync API endpoint, if needed, to update its status accordingly.
             * 3B) If there is no existent transaction, then:
             * 4) Call the GET transaction details Olive API to retrieve the additional information needed for the transaction from Olive.
             * 5) call the POST/transactionsAcknowledgment Moonbeam internal endpoint, to acknowledge the transaction as a qualifying offer.
             */
            // first, convert the incoming event message body, into an updated transaction event object
            const requestBodyParsed = JSON.parse(updatedTransactionalRecord.body);
            /**
             * determine if we want to pass in a status to any of these subsequent calls
             *
             * From the transaction processor, we do the following:
             *
             * set the status of all incoming transactions:
             * - to PENDING if there is no status passed in the ["transaction"]["moonbeamTransactionStatus"] parameter, since then we know that this
             * got invoked directly by Olive on card swipe, or by our update transactions workflow, when an ineligible transaction became an eligible offer.
             * - if the updated transaction workflow passes a status in the ["transaction"]["moonbeamTransactionStatus"] , pass that accordingly.
             *
             * Note: any other statuses such as (PROCESSED, CREDITED or REJECTED) will be updated by the updated transaction workflow accordingly, by
             * directly calling our AppSync transaction endpoints, instead of going through this flow.
             */
            let moonbeamTransactionStatus = null;
            if (requestBodyParsed["data"]["status"] === "rejected") {
                moonbeamTransactionStatus = moonbeam_models_1.TransactionsStatus.Rejected;
            }
            if (requestBodyParsed["data"]["status"] === "distributed_to_publisher") {
                moonbeamTransactionStatus = moonbeam_models_1.TransactionsStatus.Processed;
            }
            if (requestBodyParsed["data"]["status"] === "distributed_to_member_distributor") {
                moonbeamTransactionStatus = moonbeam_models_1.TransactionsStatus.Credited;
            }
            const updatedTransactionEvent = {
                id: requestBodyParsed["id"],
                subscriptionId: requestBodyParsed["subscriptionId"],
                timestamp: requestBodyParsed["timestamp"],
                callbackUrl: requestBodyParsed["callbackUrl"],
                topic: requestBodyParsed["topic"],
                data: {
                    webhookEventType: requestBodyParsed["data"]["webhookEventType"],
                    cardId: requestBodyParsed["data"]["cardId"],
                    memberId: requestBodyParsed["data"]["memberId"],
                    redeemedMatchings: [],
                    transaction: {
                        id: requestBodyParsed["data"]["transactionId"],
                        cardId: requestBodyParsed["data"]["cardId"],
                        currencyCode: lib_1.CurrencyCodeType.Usd,
                        rewardAmount: requestBodyParsed["data"]["amount"],
                        ...(moonbeamTransactionStatus !== null && {
                            moonbeamTransactionStatus: moonbeamTransactionStatus
                        })
                    }
                }
            };
            // initialize the Olive Client API here, in order to call the appropriate endpoints for this handler
            const oliveClient = new moonbeam_models_1.OliveClient(process.env.ENV_NAME, region);
            // 1_ Call the GET member details Olive API to retrieve the member details (extMemberID) for member
            const memberDetailsResponse = await getMemberDetails(oliveClient, updatedTransactionEvent.data.memberId);
            // check to see if the member details call was successful or not
            if (memberDetailsResponse && !memberDetailsResponse.errorMessage && !memberDetailsResponse.errorType && memberDetailsResponse.data) {
                // initialize the Moonbeam Client API here, in order to call the appropriate endpoints for this resolver
                const moonbeamClient = new moonbeam_models_1.MoonbeamClient(process.env.ENV_NAME, region);
                // 2) Call the getTransaction Moonbeam AppSync API endpoint, to determine whether there is an existent transaction to update the status for.
                const retrievedTransactionsResponse = await getTransaction(moonbeamClient, memberDetailsResponse.data);
                // check to see if the get transaction call was successful or not
                if (retrievedTransactionsResponse && !retrievedTransactionsResponse.errorMessage && !retrievedTransactionsResponse.errorType && retrievedTransactionsResponse.data) {
                    // filter the transactions to ensure whether this transaction is available in the DB or not.
                    const filteredTransaction = retrievedTransactionsResponse.data.filter(transaction => transaction.transactionId === updatedTransactionEvent.data.transaction.id
                        && transaction.id === memberDetailsResponse.data);
                    // 3A) If there is an existent transaction, call the updateTransaction AppSync API endpoint, if needed, to update its status accordingly.
                    if (filteredTransaction.length !== 0) {
                        // ensure that we only get one matched transaction with the appropriate information
                        if (filteredTransaction.length === 1 &&
                            filteredTransaction[0].timestamp !== undefined && filteredTransaction[0].timestamp !== null &&
                            filteredTransaction[0].id != undefined && filteredTransaction[0].id != null &&
                            filteredTransaction[0].transactionStatus != undefined && filteredTransaction[0].transactionStatus != null) {
                            // internally update this transaction's status accordingly (if needed)
                            let needsToUpdateStatus = false;
                            if (requestBodyParsed["data"]["status"] === "rejected" && filteredTransaction[0].transactionStatus !== moonbeam_models_1.TransactionsStatus.Rejected) {
                                needsToUpdateStatus = true;
                            }
                            if (requestBodyParsed["data"]["status"] === "distributed_to_publisher" && filteredTransaction[0].transactionStatus !== moonbeam_models_1.TransactionsStatus.Processed) {
                                needsToUpdateStatus = true;
                            }
                            if (requestBodyParsed["data"]["status"] === "distributed_to_member_distributor" && filteredTransaction[0].transactionStatus !== moonbeam_models_1.TransactionsStatus.Credited) {
                                needsToUpdateStatus = true;
                            }
                            if (needsToUpdateStatus) {
                                console.log(`Existent transaction ${updatedTransactionEvent.data.transaction.id}, needs to have its status updated to - ${moonbeamTransactionStatus}`);
                                const updatedTransactionResponse = await moonbeamClient.updateTransaction({
                                    id: filteredTransaction[0].id,
                                    timestamp: filteredTransaction[0].timestamp,
                                    transactionId: updatedTransactionEvent.data.transaction.id,
                                    transactionStatus: moonbeamTransactionStatus === null ? moonbeam_models_1.TransactionsStatus.Pending : moonbeamTransactionStatus
                                });
                                // check to see if the update transaction call was successful or not
                                if (!updatedTransactionResponse || updatedTransactionResponse.errorType || updatedTransactionResponse.errorType || !updatedTransactionResponse.data) {
                                    console.log(`Unexpected error and/or response structure returned from the updateTransaction call ${JSON.stringify(updatedTransactionResponse)}!`);
                                    // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                                    itemFailures.push({
                                        itemIdentifier: updatedTransactionalRecord.messageId
                                    });
                                }
                            }
                            else {
                                console.log(`Existent transaction ${updatedTransactionEvent.data.transaction.id}, already has its status up to date - ${filteredTransaction[0].transactionStatus}`);
                            }
                        }
                        else {
                            console.log(`Invalid filtered/matched transaction details returned ${JSON.stringify(filteredTransaction)}`);
                            // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                            itemFailures.push({
                                itemIdentifier: updatedTransactionalRecord.messageId
                            });
                        }
                    }
                    else {
                        /**
                         * 3B) If there is no existent transaction, then:
                         * 4) Call the GET transaction details Olive API to retrieve the additional information needed for the transaction from Olive.
                         */
                        const updatedTransactionEventResponse = await getUpdatedTransactionDetails(oliveClient, updatedTransactionEvent);
                        // check to see if the updated transaction details call was successful or not
                        if (updatedTransactionEventResponse && !updatedTransactionEventResponse.errorMessage && !updatedTransactionEventResponse.errorType && updatedTransactionEventResponse.data) {
                            // 5) call the POST/transactionsAcknowledgment Moonbeam internal endpoint, to acknowledge the transaction as a qualifying offer.
                            const response = await moonbeamClient.transactionsAcknowledgment(updatedTransactionEvent);
                            // check to see if the transaction acknowledgment call was executed successfully
                            if (response.statusCode === 202 && response.body !== null && response.body !== undefined &&
                                response.body === "Transaction acknowledged!") {
                                console.log(`Successfully acknowledged transaction update for transaction - ${updatedTransactionEvent.data.transaction.id}!`);
                            }
                            else {
                                /**
                                 * for any users for which the reimbursement has not been acknowledged, do nothing other than logging the errors
                                 * for the ones for which this info is not, do nothing other than logging the errors.
                                 */
                                const errorMessage = `Unexpected response structure returned from the transaction acknowledgment call!`;
                                console.log(`${errorMessage} ${response && JSON.stringify(response)}`);
                                // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                                itemFailures.push({
                                    itemIdentifier: updatedTransactionalRecord.messageId
                                });
                            }
                        }
                        else {
                            console.log(`Transaction Details mapping through GET update transaction details call failed`);
                            // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                            itemFailures.push({
                                itemIdentifier: updatedTransactionalRecord.messageId
                            });
                        }
                    }
                }
                else {
                    console.log(`Transaction retrieval for member call failed`);
                    // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                    itemFailures.push({
                        itemIdentifier: updatedTransactionalRecord.messageId
                    });
                }
            }
            else {
                console.log(`UserID mapping through GET member details call failed`);
                // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                itemFailures.push({
                    itemIdentifier: updatedTransactionalRecord.messageId
                });
            }
        }
        /**
         * for the Lambda to indicate SQS that there have been no failures, and thus enable the deletion of all processed messages
         * from the queue, we have to return an empty batchItemFailures array here.
         *
         * @link https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html
         */
        return {
            batchItemFailures: itemFailures
        };
    }
    catch (error) {
        console.log(`Unexpected error while processing ${JSON.stringify(event)} updated transactional event ${error}`);
        /**
         * returns a batch response failure for the particular message IDs which failed
         * in this case, the Lambda function DOES NOT delete the incoming messages from the queue, and it makes it available/visible again
         *
         * @link https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html
         */
        return {
            batchItemFailures: [{
                    // for this case, we only process 1 record at a time, we might need to change this in the future
                    itemIdentifier: event.Records[0].messageId
                }]
        };
    }
};
exports.processUpdatedOfferRedeemedTransactions = processUpdatedOfferRedeemedTransactions;
/**
 * Function used to retrieve the member details of a user, which includes the extMemberId
 * of a member, directly mapped to a Moonbeam userId, to be used when storing an updated transaction event.
 *
 * @param oliveClient client used to make Olive API calls
 * @param memberId the id of the member, obtained from Olive through the transaction message,
 * which details are retrieved for
 *
 * @returns a {@link Promise} of {@link MemberDetailsResponse} representing the details of a member
 * in the form of either an error, or a valid string-based response signifying the member's external id
 */
const getMemberDetails = async (oliveClient, memberId) => {
    // execute the member details retrieval call, in order to get the Moonbeam userId to be used in associating a transaction with a Moonbeam user
    const response = await oliveClient.getMemberDetails(memberId);
    // check to see if the member details call was executed successfully
    if (response !== undefined && response !== null && !response.errorMessage && !response.errorType &&
        response.data !== undefined && response.data !== null && response.data.length !== 0) {
        // returns the response data with the member's external ID, to be mapped to Moonbeam's userId
        return {
            data: response.data
        };
    }
    else {
        const errorMessage = `Unexpected response structure returned from the member details call!`;
        console.log(errorMessage);
        // if there are errors associated with the call, just return the error message and error type from the upstream client
        return {
            data: null,
            errorType: moonbeam_models_1.TransactionsErrorType.ValidationError,
            errorMessage: errorMessage
        };
    }
};
/**
 * Function used to retrieve the transactions, for the current user and timestamp.
 *
 * @param moonbeamClient client used to make Moonbeam API calls
 * @param userId the user id which we are retrieving transactions for
 *
 * @returns a {@link Promise} of {@link TransactionResponse} representing the transaction information passed
 * in through the SQS message, alongside the additional transaction details retrieved through this call.
 */
const getTransaction = async (moonbeamClient, userId) => {
    // execute the get transactions call, to retrieve the transactions for a particular user
    const response = await moonbeamClient.getTransaction({
        id: userId,
        // retrieve the current date and time to filter transactions by
        endDate: new Date().toISOString()
    });
    // check to see if the transaction details call was executed successfully
    if (response !== undefined && response !== null && !response.errorMessage && !response.errorType &&
        response.data !== undefined && response.data !== null && response.data.length !== 0) {
        // returns the updated transaction data
        return {
            data: response.data
        };
    }
    else {
        // filter the error message for cases in which there are no transactions found for this user
        if (response.errorType !== undefined && response.errorType !== null && response.errorType === moonbeam_models_1.TransactionsErrorType.NoneOrAbsent) {
            // returns the updated transaction data
            return {
                data: []
            };
        }
        else {
            const errorMessage = `Unexpected response structure returned from the get transaction call!`;
            console.log(errorMessage);
            // if there are errors associated with the call, just return the error message and error type from the upstream client
            return {
                data: null,
                errorType: moonbeam_models_1.TransactionsErrorType.ValidationError,
                errorMessage: errorMessage
            };
        }
    }
};
/**
 * Function used to retrieve the transaction details, which mainly include the time of purchase, associated
 * with the transaction event, to be used when storing the transaction in the DB.
 *
 * @param oliveClient client used to make Olive API calls
 * @param updatedTransactionEvent the updated transaction object obtained from Olive through the updated transaction message,
 * which additional transaction details obtained through this call are appended to.
 *
 * @returns a {@link Promise} of {@link TransactionResponse} representing the updated transaction information passed
 * in through the SQS message, alongside the additional transaction details retrieved through this call.
 */
const getUpdatedTransactionDetails = async (oliveClient, updatedTransactionEvent) => {
    // execute the transaction details retrieval call, in order to get additional transaction details for the incoming updated transaction event object
    const response = await oliveClient.getUpdatedTransactionDetails(updatedTransactionEvent);
    // check to see if the transaction details call was executed successfully
    if (response !== undefined && response !== null && !response.errorMessage && !response.errorType &&
        response.data !== undefined && response.data !== null &&
        response.data.data.transaction.storeId !== undefined && response.data.data.transaction.storeId !== null &&
        response.data.data.transaction.brandId !== undefined && response.data.data.transaction.brandId !== null &&
        response.data.data.transaction.loyaltyProgramId !== undefined && response.data.data.transaction.loyaltyProgramId !== null &&
        response.data.data.transaction.roundingRuleId !== undefined && response.data.data.transaction.roundingRuleId !== null &&
        response.data.data.transaction.merchantCategoryCode !== undefined && response.data.data.transaction.merchantCategoryCode !== null &&
        response.data.data.transaction.amount !== undefined && response.data.data.transaction.amount !== null &&
        response.data.data.transaction.roundedAmount !== undefined && response.data.data.transaction.roundedAmount !== null &&
        response.data.data.transaction.matchingAmount !== undefined && response.data.data.transaction.matchingAmount !== null &&
        response.data.data.transaction.created !== undefined && response.data.data.transaction.created !== null) {
        // returns the updated transaction data
        return {
            data: response.data
        };
    }
    else {
        const errorMessage = `Unexpected response structure returned from the updated transaction details call!`;
        console.log(errorMessage);
        // if there are errors associated with the call, just return the error message and error type from the upstream client
        return {
            data: null,
            errorType: moonbeam_models_1.TransactionsErrorType.ValidationError,
            errorMessage: errorMessage
        };
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXBkYXRlZE9mZmVyUmVkZWVtZWRQcm9jZXNzb3JIYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9oYW5kbGVycy9VcGRhdGVkT2ZmZXJSZWRlZW1lZFByb2Nlc3NvckhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUEsK0RBV21DO0FBQ25DLHVEQUErRDtBQUUvRDs7Ozs7O0dBTUc7QUFDSSxNQUFNLHVDQUF1QyxHQUFHLEtBQUssRUFBRSxLQUFlLEVBQTZCLEVBQUU7SUFDeEcsSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2Qzs7Ozs7Ozs7V0FRRztRQUNILE1BQU0sWUFBWSxHQUEwQixFQUFFLENBQUM7UUFFL0MseUZBQXlGO1FBQ3pGLEtBQUssTUFBTSwwQkFBMEIsSUFBSSxLQUFLLENBQUMsT0FBTyxFQUFFO1lBQ3BEOzs7Ozs7Ozs7ZUFTRztZQUNDLDJGQUEyRjtZQUMvRixNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFdEU7Ozs7Ozs7Ozs7OztlQVlHO1lBQ0gsSUFBSSx5QkFBeUIsR0FBOEIsSUFBSSxDQUFDO1lBQ2hFLElBQUksaUJBQWlCLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssVUFBVSxFQUFFO2dCQUNwRCx5QkFBeUIsR0FBRyxvQ0FBa0IsQ0FBQyxRQUFRLENBQUM7YUFDM0Q7WUFDRCxJQUFJLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLDBCQUEwQixFQUFFO2dCQUNwRSx5QkFBeUIsR0FBRyxvQ0FBa0IsQ0FBQyxTQUFTLENBQUM7YUFDNUQ7WUFDRCxJQUFJLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLG1DQUFtQyxFQUFFO2dCQUM3RSx5QkFBeUIsR0FBRyxvQ0FBa0IsQ0FBQyxRQUFRLENBQUM7YUFDM0Q7WUFDRCxNQUFNLHVCQUF1QixHQUE0QjtnQkFDckQsRUFBRSxFQUFFLGlCQUFpQixDQUFDLElBQUksQ0FBQztnQkFDM0IsY0FBYyxFQUFFLGlCQUFpQixDQUFDLGdCQUFnQixDQUFDO2dCQUNuRCxTQUFTLEVBQUUsaUJBQWlCLENBQUMsV0FBVyxDQUFDO2dCQUN6QyxXQUFXLEVBQUUsaUJBQWlCLENBQUMsYUFBYSxDQUFDO2dCQUM3QyxLQUFLLEVBQUUsaUJBQWlCLENBQUMsT0FBTyxDQUFDO2dCQUNqQyxJQUFJLEVBQUU7b0JBQ0YsZ0JBQWdCLEVBQUUsaUJBQWlCLENBQUMsTUFBTSxDQUFDLENBQUMsa0JBQWtCLENBQUM7b0JBQy9ELE1BQU0sRUFBRSxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLENBQUM7b0JBQzNDLFFBQVEsRUFBRSxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxVQUFVLENBQUM7b0JBQy9DLGlCQUFpQixFQUFFLEVBQUU7b0JBQ3JCLFdBQVcsRUFBRTt3QkFDVCxFQUFFLEVBQUUsaUJBQWlCLENBQUMsTUFBTSxDQUFDLENBQUMsZUFBZSxDQUFDO3dCQUM5QyxNQUFNLEVBQUUsaUJBQWlCLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxDQUFDO3dCQUMzQyxZQUFZLEVBQUUsc0JBQWdCLENBQUMsR0FBRzt3QkFDbEMsWUFBWSxFQUFFLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsQ0FBQzt3QkFDakQsR0FBRyxDQUFDLHlCQUF5QixLQUFLLElBQUksSUFBSTs0QkFDdEMseUJBQXlCLEVBQUUseUJBQXlCO3lCQUN2RCxDQUFDO3FCQUNMO2lCQUNKO2FBQ0osQ0FBQTtZQUVELG9HQUFvRztZQUNwRyxNQUFNLFdBQVcsR0FBRyxJQUFJLDZCQUFXLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFFbkUsbUdBQW1HO1lBQ25HLE1BQU0scUJBQXFCLEdBQTBCLE1BQU0sZ0JBQWdCLENBQUMsV0FBVyxFQUFFLHVCQUF1QixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUVoSSxnRUFBZ0U7WUFDaEUsSUFBSSxxQkFBcUIsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFlBQVksSUFBSSxDQUFDLHFCQUFxQixDQUFDLFNBQVMsSUFBSSxxQkFBcUIsQ0FBQyxJQUFJLEVBQUU7Z0JBQ2hJLHdHQUF3RztnQkFDeEcsTUFBTSxjQUFjLEdBQUcsSUFBSSxnQ0FBYyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUV6RSw0SUFBNEk7Z0JBQzVJLE1BQU0sNkJBQTZCLEdBQWlDLE1BQU0sY0FBYyxDQUFDLGNBQWMsRUFBRSxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFFckksaUVBQWlFO2dCQUNqRSxJQUFJLDZCQUE2QixJQUFJLENBQUMsNkJBQTZCLENBQUMsWUFBWSxJQUFJLENBQUMsNkJBQTZCLENBQUMsU0FBUyxJQUFJLDZCQUE2QixDQUFDLElBQUksRUFBRTtvQkFDaEssNEZBQTRGO29CQUM1RixNQUFNLG1CQUFtQixHQUFHLDZCQUE2QixDQUFDLElBQUssQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxXQUFZLENBQUMsYUFBYSxLQUFLLHVCQUF1QixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRTsyQkFDekosV0FBWSxDQUFDLEVBQUUsS0FBSyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFFdkQseUlBQXlJO29CQUN6SSxJQUFJLG1CQUFvQixDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7d0JBQ25DLG1GQUFtRjt3QkFDbkYsSUFBSSxtQkFBb0IsQ0FBQyxNQUFNLEtBQUssQ0FBQzs0QkFDakMsbUJBQW1CLENBQUMsQ0FBQyxDQUFFLENBQUMsU0FBUyxLQUFLLFNBQVMsSUFBSSxtQkFBbUIsQ0FBQyxDQUFDLENBQUUsQ0FBQyxTQUFTLEtBQUssSUFBSTs0QkFDN0YsbUJBQW1CLENBQUMsQ0FBQyxDQUFFLENBQUMsRUFBRSxJQUFJLFNBQVMsSUFBSSxtQkFBbUIsQ0FBQyxDQUFDLENBQUUsQ0FBQyxFQUFFLElBQUksSUFBSTs0QkFDN0UsbUJBQW1CLENBQUMsQ0FBQyxDQUFFLENBQUMsaUJBQWlCLElBQUksU0FBUyxJQUFJLG1CQUFtQixDQUFDLENBQUMsQ0FBRSxDQUFDLGlCQUFpQixJQUFJLElBQUksRUFBRTs0QkFDN0csc0VBQXNFOzRCQUN0RSxJQUFJLG1CQUFtQixHQUFHLEtBQUssQ0FBQzs0QkFDaEMsSUFBSSxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxVQUFVLElBQUksbUJBQW1CLENBQUMsQ0FBQyxDQUFFLENBQUMsaUJBQWlCLEtBQUssb0NBQWtCLENBQUMsUUFBUSxFQUFFO2dDQUNqSSxtQkFBbUIsR0FBRyxJQUFJLENBQUM7NkJBQzlCOzRCQUNELElBQUksaUJBQWlCLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssMEJBQTBCLElBQUksbUJBQW1CLENBQUMsQ0FBQyxDQUFFLENBQUMsaUJBQWlCLEtBQUssb0NBQWtCLENBQUMsU0FBUyxFQUFFO2dDQUNsSixtQkFBbUIsR0FBRyxJQUFJLENBQUM7NkJBQzlCOzRCQUNELElBQUksaUJBQWlCLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssbUNBQW1DLElBQUksbUJBQW1CLENBQUMsQ0FBQyxDQUFFLENBQUMsaUJBQWlCLEtBQUssb0NBQWtCLENBQUMsUUFBUSxFQUFFO2dDQUMxSixtQkFBbUIsR0FBRyxJQUFJLENBQUM7NkJBQzlCOzRCQUNELElBQUksbUJBQW1CLEVBQUU7Z0NBQ3JCLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLHVCQUF1QixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSwyQ0FBMkMseUJBQXlCLEVBQUUsQ0FBQyxDQUFDO2dDQUN2SixNQUFNLDBCQUEwQixHQUF1QyxNQUFNLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQztvQ0FDMUcsRUFBRSxFQUFFLG1CQUFtQixDQUFDLENBQUMsQ0FBRSxDQUFDLEVBQUU7b0NBQzlCLFNBQVMsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDLENBQUUsQ0FBQyxTQUFTO29DQUM1QyxhQUFhLEVBQUUsdUJBQXVCLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFO29DQUMxRCxpQkFBaUIsRUFBRSx5QkFBeUIsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLG9DQUFrQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMseUJBQXlCO2lDQUNqSCxDQUFDLENBQUM7Z0NBQ0gsb0VBQW9FO2dDQUNwRSxJQUFJLENBQUMsMEJBQTBCLElBQUksMEJBQTBCLENBQUMsU0FBUyxJQUFJLDBCQUEwQixDQUFDLFNBQVMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLElBQUksRUFBRTtvQ0FDakosT0FBTyxDQUFDLEdBQUcsQ0FBQyx1RkFBdUYsSUFBSSxDQUFDLFNBQVMsQ0FBQywwQkFBMEIsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQ0FFbEosbUdBQW1HO29DQUNuRyxZQUFZLENBQUMsSUFBSSxDQUFDO3dDQUNkLGNBQWMsRUFBRSwwQkFBMEIsQ0FBQyxTQUFTO3FDQUN2RCxDQUFDLENBQUM7aUNBQ047NkJBQ0o7aUNBQU07Z0NBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsdUJBQXVCLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLHlDQUF5QyxtQkFBbUIsQ0FBQyxDQUFDLENBQUUsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUM7NkJBQ3hLO3lCQUNKOzZCQUFNOzRCQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMseURBQXlELElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLENBQUMsRUFBRSxDQUFDLENBQUM7NEJBRTVHLG1HQUFtRzs0QkFDbkcsWUFBWSxDQUFDLElBQUksQ0FBQztnQ0FDZCxjQUFjLEVBQUUsMEJBQTBCLENBQUMsU0FBUzs2QkFDdkQsQ0FBQyxDQUFDO3lCQUNOO3FCQUNKO3lCQUFNO3dCQUNIOzs7MkJBR0c7d0JBQ0gsTUFBTSwrQkFBK0IsR0FBb0MsTUFBTSw0QkFBNEIsQ0FBQyxXQUFXLEVBQUUsdUJBQXVCLENBQUMsQ0FBQzt3QkFFbEosNkVBQTZFO3dCQUM3RSxJQUFJLCtCQUErQixJQUFJLENBQUMsK0JBQStCLENBQUMsWUFBWSxJQUFJLENBQUMsK0JBQStCLENBQUMsU0FBUyxJQUFJLCtCQUErQixDQUFDLElBQUksRUFBRTs0QkFDeEssZ0lBQWdJOzRCQUNoSSxNQUFNLFFBQVEsR0FBMEIsTUFBTSxjQUFjLENBQUMsMEJBQTBCLENBQUMsdUJBQXVCLENBQUMsQ0FBQzs0QkFFakgsZ0ZBQWdGOzRCQUNoRixJQUFJLFFBQVEsQ0FBQyxVQUFVLEtBQUssR0FBRyxJQUFJLFFBQVEsQ0FBQyxJQUFJLEtBQUssSUFBSSxJQUFJLFFBQVEsQ0FBQyxJQUFJLEtBQUssU0FBUztnQ0FDcEYsUUFBUSxDQUFDLElBQUksS0FBSywyQkFBMkIsRUFBRTtnQ0FDL0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrRUFBa0UsdUJBQXVCLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDOzZCQUNqSTtpQ0FBTTtnQ0FDSDs7O21DQUdHO2dDQUNILE1BQU0sWUFBWSxHQUFHLGtGQUFrRixDQUFDO2dDQUN4RyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsWUFBWSxJQUFJLFFBQVEsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQ0FFdkUsbUdBQW1HO2dDQUNuRyxZQUFZLENBQUMsSUFBSSxDQUFDO29DQUNkLGNBQWMsRUFBRSwwQkFBMEIsQ0FBQyxTQUFTO2lDQUN2RCxDQUFDLENBQUM7NkJBQ047eUJBQ0o7NkJBQU07NEJBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnRkFBZ0YsQ0FBQyxDQUFDOzRCQUU5RixtR0FBbUc7NEJBQ25HLFlBQVksQ0FBQyxJQUFJLENBQUM7Z0NBQ2QsY0FBYyxFQUFFLDBCQUEwQixDQUFDLFNBQVM7NkJBQ3ZELENBQUMsQ0FBQzt5QkFDTjtxQkFDSjtpQkFDSjtxQkFBTTtvQkFDSCxPQUFPLENBQUMsR0FBRyxDQUFDLDhDQUE4QyxDQUFDLENBQUM7b0JBRTVELG1HQUFtRztvQkFDbkcsWUFBWSxDQUFDLElBQUksQ0FBQzt3QkFDZCxjQUFjLEVBQUUsMEJBQTBCLENBQUMsU0FBUztxQkFDdkQsQ0FBQyxDQUFDO2lCQUNOO2FBQ0o7aUJBQU07Z0JBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1REFBdUQsQ0FBQyxDQUFDO2dCQUVyRSxtR0FBbUc7Z0JBQ25HLFlBQVksQ0FBQyxJQUFJLENBQUM7b0JBQ2QsY0FBYyxFQUFFLDBCQUEwQixDQUFDLFNBQVM7aUJBQ3ZELENBQUMsQ0FBQzthQUNOO1NBQ0o7UUFFRDs7Ozs7V0FLRztRQUNILE9BQU87WUFDSCxpQkFBaUIsRUFBRSxZQUFZO1NBQ2xDLENBQUE7S0FDSjtJQUFDLE9BQU8sS0FBSyxFQUFFO1FBQ1osT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQ0FBcUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsZ0NBQWdDLEtBQUssRUFBRSxDQUFDLENBQUM7UUFFL0c7Ozs7O1dBS0c7UUFDSCxPQUFPO1lBQ0gsaUJBQWlCLEVBQUUsQ0FBQztvQkFDaEIsZ0dBQWdHO29CQUNoRyxjQUFjLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTO2lCQUM3QyxDQUFDO1NBQ0wsQ0FBQTtLQUNKO0FBQ0wsQ0FBQyxDQUFBO0FBaE9ZLFFBQUEsdUNBQXVDLDJDQWdPbkQ7QUFFRDs7Ozs7Ozs7OztHQVVHO0FBQ0gsTUFBTSxnQkFBZ0IsR0FBRyxLQUFLLEVBQUUsV0FBd0IsRUFBRSxRQUFnQixFQUFrQyxFQUFFO0lBQzFHLDhJQUE4STtJQUM5SSxNQUFNLFFBQVEsR0FBMEIsTUFBTSxXQUFXLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUM7SUFFckYsb0VBQW9FO0lBQ3BFLElBQUksUUFBUSxLQUFLLFNBQVMsSUFBSSxRQUFRLEtBQUssSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTO1FBQzVGLFFBQVEsQ0FBQyxJQUFJLEtBQUssU0FBUyxJQUFJLFFBQVEsQ0FBQyxJQUFJLEtBQUssSUFBSSxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUNyRiw2RkFBNkY7UUFDN0YsT0FBTztZQUNILElBQUksRUFBRSxRQUFRLENBQUMsSUFBSTtTQUN0QixDQUFBO0tBQ0o7U0FBTTtRQUNILE1BQU0sWUFBWSxHQUFHLHNFQUFzRSxDQUFDO1FBQzVGLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7UUFFMUIsc0hBQXNIO1FBQ3RILE9BQU87WUFDSCxJQUFJLEVBQUUsSUFBSTtZQUNWLFNBQVMsRUFBRSx1Q0FBcUIsQ0FBQyxlQUFlO1lBQ2hELFlBQVksRUFBRSxZQUFZO1NBQzdCLENBQUE7S0FDSjtBQUNMLENBQUMsQ0FBQTtBQUVEOzs7Ozs7OztHQVFHO0FBQ0gsTUFBTSxjQUFjLEdBQUcsS0FBSyxFQUFFLGNBQThCLEVBQUUsTUFBYyxFQUF5QyxFQUFFO0lBQ25ILHdGQUF3RjtJQUN4RixNQUFNLFFBQVEsR0FBaUMsTUFBTSxjQUFjLENBQUMsY0FBYyxDQUFDO1FBQy9FLEVBQUUsRUFBRSxNQUFNO1FBQ1YsK0RBQStEO1FBQy9ELE9BQU8sRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRTtLQUNwQyxDQUFDLENBQUM7SUFFSCx5RUFBeUU7SUFDekUsSUFBSSxRQUFRLEtBQUssU0FBUyxJQUFJLFFBQVEsS0FBSyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxJQUFLLENBQUMsUUFBUSxDQUFDLFNBQVM7UUFDN0YsUUFBUSxDQUFDLElBQUksS0FBSyxTQUFTLElBQUksUUFBUSxDQUFDLElBQUksS0FBSyxJQUFJLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1FBQ3JGLHVDQUF1QztRQUN2QyxPQUFPO1lBQ0gsSUFBSSxFQUFFLFFBQVEsQ0FBQyxJQUFJO1NBQ3RCLENBQUE7S0FDSjtTQUFNO1FBQ0gsNEZBQTRGO1FBQzVGLElBQUksUUFBUSxDQUFDLFNBQVMsS0FBSyxTQUFTLElBQUksUUFBUSxDQUFDLFNBQVMsS0FBSyxJQUFJLElBQUksUUFBUSxDQUFDLFNBQVMsS0FBSyx1Q0FBcUIsQ0FBQyxZQUFZLEVBQUU7WUFDOUgsdUNBQXVDO1lBQ3ZDLE9BQU87Z0JBQ0gsSUFBSSxFQUFFLEVBQUU7YUFDWCxDQUFBO1NBQ0o7YUFBTTtZQUNILE1BQU0sWUFBWSxHQUFHLHVFQUF1RSxDQUFDO1lBQzdGLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7WUFFMUIsc0hBQXNIO1lBQ3RILE9BQU87Z0JBQ0gsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsU0FBUyxFQUFFLHVDQUFxQixDQUFDLGVBQWU7Z0JBQ2hELFlBQVksRUFBRSxZQUFZO2FBQzdCLENBQUE7U0FDSjtLQUNKO0FBQ0wsQ0FBQyxDQUFBO0FBRUQ7Ozs7Ozs7Ozs7R0FVRztBQUNILE1BQU0sNEJBQTRCLEdBQUcsS0FBSyxFQUFFLFdBQXdCLEVBQUUsdUJBQWdELEVBQTRDLEVBQUU7SUFDaEssbUpBQW1KO0lBQ25KLE1BQU0sUUFBUSxHQUFvQyxNQUFNLFdBQVcsQ0FBQyw0QkFBNEIsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0lBRTFILHlFQUF5RTtJQUN6RSxJQUFJLFFBQVEsS0FBSyxTQUFTLElBQUksUUFBUSxLQUFLLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUztRQUM1RixRQUFRLENBQUMsSUFBSSxLQUFLLFNBQVMsSUFBSSxRQUFRLENBQUMsSUFBSSxLQUFLLElBQUk7UUFDckQsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sS0FBSyxTQUFTLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sS0FBSyxJQUFJO1FBQ3ZHLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEtBQUssU0FBUyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEtBQUssSUFBSTtRQUN2RyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLEtBQUssU0FBUyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsS0FBSyxJQUFJO1FBQ3pILFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxjQUFjLEtBQUssU0FBUyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxjQUFjLEtBQUssSUFBSTtRQUNySCxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsb0JBQW9CLEtBQUssU0FBUyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxvQkFBb0IsS0FBSyxJQUFJO1FBQ2pJLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEtBQUssU0FBUyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEtBQUssSUFBSTtRQUNyRyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxLQUFLLFNBQVMsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxLQUFLLElBQUk7UUFDbkgsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLGNBQWMsS0FBSyxTQUFTLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLGNBQWMsS0FBSyxJQUFJO1FBQ3JILFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEtBQUssU0FBUyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEtBQUssSUFBSSxFQUFFO1FBQ3pHLHVDQUF1QztRQUN2QyxPQUFPO1lBQ0gsSUFBSSxFQUFFLFFBQVEsQ0FBQyxJQUFJO1NBQ3RCLENBQUE7S0FDSjtTQUFNO1FBQ0gsTUFBTSxZQUFZLEdBQUcsbUZBQW1GLENBQUM7UUFDekcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUUxQixzSEFBc0g7UUFDdEgsT0FBTztZQUNILElBQUksRUFBRSxJQUFJO1lBQ1YsU0FBUyxFQUFFLHVDQUFxQixDQUFDLGVBQWU7WUFDaEQsWUFBWSxFQUFFLFlBQVk7U0FDN0IsQ0FBQTtLQUNKO0FBQ0wsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtBUElHYXRld2F5UHJveHlSZXN1bHQsIFNRU0JhdGNoUmVzcG9uc2UsIFNRU0V2ZW50fSBmcm9tIFwiYXdzLWxhbWJkYVwiO1xuaW1wb3J0IHtTUVNCYXRjaEl0ZW1GYWlsdXJlfSBmcm9tIFwiYXdzLWxhbWJkYS90cmlnZ2VyL3Nxc1wiO1xuaW1wb3J0IHtcbiAgICBNZW1iZXJEZXRhaWxzUmVzcG9uc2UsXG4gICAgTW9vbmJlYW1DbGllbnQsXG4gICAgTW9vbmJlYW1UcmFuc2FjdGlvbnNSZXNwb25zZSxcbiAgICBNb29uYmVhbVVwZGF0ZWRUcmFuc2FjdGlvblJlc3BvbnNlLFxuICAgIE9saXZlQ2xpZW50LFxuICAgIFRyYW5zYWN0aW9uUmVzcG9uc2UsXG4gICAgVHJhbnNhY3Rpb25zRXJyb3JUeXBlLFxuICAgIFRyYW5zYWN0aW9uc1N0YXR1cyxcbiAgICBVcGRhdGVkVHJhbnNhY3Rpb25FdmVudCxcbiAgICBVcGRhdGVkVHJhbnNhY3Rpb25FdmVudFJlc3BvbnNlXG59IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5pbXBvcnQge0N1cnJlbmN5Q29kZVR5cGV9IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzL2xpYlwiO1xuXG4vKipcbiAqIFVwZGF0ZWRPZmZlclJlZGVlbWVkUHJvY2Vzc29ySGFuZGxlciBoYW5kbGVyXG4gKlxuICogQHBhcmFtIGV2ZW50IHRoZSB7QGxpbmsgU1FTRXZlbnR9IHRvIGJlIHByb2Nlc3NlZCwgY29udGFpbmluZyB0aGUgdXBkYXRlZCB0cmFuc2FjdGlvblxuICogbWVzc2FnZSBpbmZvcm1hdGlvblxuICogQHJldHVybnMge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBTUVNCYXRjaFJlc3BvbnNlfVxuICovXG5leHBvcnQgY29uc3QgcHJvY2Vzc1VwZGF0ZWRPZmZlclJlZGVlbWVkVHJhbnNhY3Rpb25zID0gYXN5bmMgKGV2ZW50OiBTUVNFdmVudCk6IFByb21pc2U8U1FTQmF0Y2hSZXNwb25zZT4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBpbml0aWFsaXppbmcgdGhlIGJhdGNoIHJlc3BvbnNlLCBhcyBhbiBlbXB0eSBhcnJheSwgdGhhdCB3aWxsIGJlIHBvcHVsYXRlZCB3aXRoIGVycm9ycywgaWYgYW55IHRocm91Z2hvdXQgdGhlIHByb2Nlc3NpbmdcbiAgICAgICAgICpcbiAgICAgICAgICogZm9yIHRoZSBMYW1iZGEgdG8gaW5kaWNhdGUgU1FTIHRoYXQgdGhlcmUgaGF2ZSBiZWVuIG5vIGZhaWx1cmVzLCBhbmQgdGh1cyBlbmFibGUgdGhlIGRlbGV0aW9uIG9mIGFsbCBwcm9jZXNzZWQgbWVzc2FnZXNcbiAgICAgICAgICogZnJvbSB0aGUgcXVldWUsIHdlIGhhdmUgdG8gcmV0dXJuIGFuIGVtcHR5IGJhdGNoSXRlbUZhaWx1cmVzIGFycmF5LiBJZiB3ZSB3YW50IHRvIGluZGljYXRlIHRoYXQgdGhlcmUgaGF2ZSBiZWVuIGVycm9ycyxcbiAgICAgICAgICogZm9yIGVhY2ggaW5kaXZpZHVhbCBtZXNzYWdlLCBiYXNlZCBvbiBpdHMgSUQsIHdlIGhhdmUgdG8gYWRkIGl0IGluIHRoZSBmaW5hbCBiYXRjaCByZXNwb25zZVxuICAgICAgICAgKlxuICAgICAgICAgKiBAbGluayBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vbGFtYmRhL2xhdGVzdC9kZy93aXRoLXNxcy5odG1sXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBpdGVtRmFpbHVyZXM6IFNRU0JhdGNoSXRlbUZhaWx1cmVbXSA9IFtdO1xuXG4gICAgICAgIC8vIGZvciBlYWNoIHJlY29yZCBpbiB0aGUgaW5jb21pbmcgZXZlbnQsIHJlcGVhdCB0aGUgdXBkYXRlZCB0cmFuc2FjdGlvbiBwcm9jZXNzaW5nIHN0ZXBzXG4gICAgICAgIGZvciAoY29uc3QgdXBkYXRlZFRyYW5zYWN0aW9uYWxSZWNvcmQgb2YgZXZlbnQuUmVjb3Jkcykge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBUaGUgb3ZlcmFsbCB1cGRhdGVkIHRyYW5zYWN0aW9uYWwgZXZlbnQgcHJvY2Vzc2luZywgd2lsbCBiZSBtYWRlIHVwIG9mIHRoZSBmb2xsb3dpbmcgc3RlcHM6XG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogMSkgQ2FsbCB0aGUgR0VUIG1lbWJlciBkZXRhaWxzIE9saXZlIEFQSSB0byByZXRyaWV2ZSB0aGUgbWVtYmVyIGRldGFpbHMgKGV4dE1lbWJlcklEKSBmb3IgbWVtYmVyLlxuICAgICAgICAgICAgICogMikgQ2FsbCB0aGUgZ2V0VHJhbnNhY3Rpb24gTW9vbmJlYW0gQXBwU3luYyBBUEkgZW5kcG9pbnQsIHRvIGRldGVybWluZSB3aGV0aGVyIHRoZXJlIGlzIGFuIGV4aXN0ZW50IHRyYW5zYWN0aW9uIHRvIHVwZGF0ZSB0aGUgc3RhdHVzIGZvci5cbiAgICAgICAgICAgICAqIDNBKSBJZiB0aGVyZSBpcyBhbiBleGlzdGVudCB0cmFuc2FjdGlvbiwgY2FsbCB0aGUgdXBkYXRlVHJhbnNhY3Rpb24gQXBwU3luYyBBUEkgZW5kcG9pbnQsIGlmIG5lZWRlZCwgdG8gdXBkYXRlIGl0cyBzdGF0dXMgYWNjb3JkaW5nbHkuXG4gICAgICAgICAgICAgKiAzQikgSWYgdGhlcmUgaXMgbm8gZXhpc3RlbnQgdHJhbnNhY3Rpb24sIHRoZW46XG4gICAgICAgICAgICAgKiA0KSBDYWxsIHRoZSBHRVQgdHJhbnNhY3Rpb24gZGV0YWlscyBPbGl2ZSBBUEkgdG8gcmV0cmlldmUgdGhlIGFkZGl0aW9uYWwgaW5mb3JtYXRpb24gbmVlZGVkIGZvciB0aGUgdHJhbnNhY3Rpb24gZnJvbSBPbGl2ZS5cbiAgICAgICAgICAgICAqIDUpIGNhbGwgdGhlIFBPU1QvdHJhbnNhY3Rpb25zQWNrbm93bGVkZ21lbnQgTW9vbmJlYW0gaW50ZXJuYWwgZW5kcG9pbnQsIHRvIGFja25vd2xlZGdlIHRoZSB0cmFuc2FjdGlvbiBhcyBhIHF1YWxpZnlpbmcgb2ZmZXIuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAvLyBmaXJzdCwgY29udmVydCB0aGUgaW5jb21pbmcgZXZlbnQgbWVzc2FnZSBib2R5LCBpbnRvIGFuIHVwZGF0ZWQgdHJhbnNhY3Rpb24gZXZlbnQgb2JqZWN0XG4gICAgICAgICAgICBjb25zdCByZXF1ZXN0Qm9keVBhcnNlZCA9IEpTT04ucGFyc2UodXBkYXRlZFRyYW5zYWN0aW9uYWxSZWNvcmQuYm9keSk7XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogZGV0ZXJtaW5lIGlmIHdlIHdhbnQgdG8gcGFzcyBpbiBhIHN0YXR1cyB0byBhbnkgb2YgdGhlc2Ugc3Vic2VxdWVudCBjYWxsc1xuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIEZyb20gdGhlIHRyYW5zYWN0aW9uIHByb2Nlc3Nvciwgd2UgZG8gdGhlIGZvbGxvd2luZzpcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBzZXQgdGhlIHN0YXR1cyBvZiBhbGwgaW5jb21pbmcgdHJhbnNhY3Rpb25zOlxuICAgICAgICAgICAgICogLSB0byBQRU5ESU5HIGlmIHRoZXJlIGlzIG5vIHN0YXR1cyBwYXNzZWQgaW4gdGhlIFtcInRyYW5zYWN0aW9uXCJdW1wibW9vbmJlYW1UcmFuc2FjdGlvblN0YXR1c1wiXSBwYXJhbWV0ZXIsIHNpbmNlIHRoZW4gd2Uga25vdyB0aGF0IHRoaXNcbiAgICAgICAgICAgICAqIGdvdCBpbnZva2VkIGRpcmVjdGx5IGJ5IE9saXZlIG9uIGNhcmQgc3dpcGUsIG9yIGJ5IG91ciB1cGRhdGUgdHJhbnNhY3Rpb25zIHdvcmtmbG93LCB3aGVuIGFuIGluZWxpZ2libGUgdHJhbnNhY3Rpb24gYmVjYW1lIGFuIGVsaWdpYmxlIG9mZmVyLlxuICAgICAgICAgICAgICogLSBpZiB0aGUgdXBkYXRlZCB0cmFuc2FjdGlvbiB3b3JrZmxvdyBwYXNzZXMgYSBzdGF0dXMgaW4gdGhlIFtcInRyYW5zYWN0aW9uXCJdW1wibW9vbmJlYW1UcmFuc2FjdGlvblN0YXR1c1wiXSAsIHBhc3MgdGhhdCBhY2NvcmRpbmdseS5cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBOb3RlOiBhbnkgb3RoZXIgc3RhdHVzZXMgc3VjaCBhcyAoUFJPQ0VTU0VELCBDUkVESVRFRCBvciBSRUpFQ1RFRCkgd2lsbCBiZSB1cGRhdGVkIGJ5IHRoZSB1cGRhdGVkIHRyYW5zYWN0aW9uIHdvcmtmbG93IGFjY29yZGluZ2x5LCBieVxuICAgICAgICAgICAgICogZGlyZWN0bHkgY2FsbGluZyBvdXIgQXBwU3luYyB0cmFuc2FjdGlvbiBlbmRwb2ludHMsIGluc3RlYWQgb2YgZ29pbmcgdGhyb3VnaCB0aGlzIGZsb3cuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGxldCBtb29uYmVhbVRyYW5zYWN0aW9uU3RhdHVzOiBUcmFuc2FjdGlvbnNTdGF0dXMgfCBudWxsID0gbnVsbDtcbiAgICAgICAgICAgIGlmIChyZXF1ZXN0Qm9keVBhcnNlZFtcImRhdGFcIl1bXCJzdGF0dXNcIl0gPT09IFwicmVqZWN0ZWRcIikge1xuICAgICAgICAgICAgICAgIG1vb25iZWFtVHJhbnNhY3Rpb25TdGF0dXMgPSBUcmFuc2FjdGlvbnNTdGF0dXMuUmVqZWN0ZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocmVxdWVzdEJvZHlQYXJzZWRbXCJkYXRhXCJdW1wic3RhdHVzXCJdID09PSBcImRpc3RyaWJ1dGVkX3RvX3B1Ymxpc2hlclwiKSB7XG4gICAgICAgICAgICAgICAgbW9vbmJlYW1UcmFuc2FjdGlvblN0YXR1cyA9IFRyYW5zYWN0aW9uc1N0YXR1cy5Qcm9jZXNzZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocmVxdWVzdEJvZHlQYXJzZWRbXCJkYXRhXCJdW1wic3RhdHVzXCJdID09PSBcImRpc3RyaWJ1dGVkX3RvX21lbWJlcl9kaXN0cmlidXRvclwiKSB7XG4gICAgICAgICAgICAgICAgbW9vbmJlYW1UcmFuc2FjdGlvblN0YXR1cyA9IFRyYW5zYWN0aW9uc1N0YXR1cy5DcmVkaXRlZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHVwZGF0ZWRUcmFuc2FjdGlvbkV2ZW50OiBVcGRhdGVkVHJhbnNhY3Rpb25FdmVudCA9IHtcbiAgICAgICAgICAgICAgICBpZDogcmVxdWVzdEJvZHlQYXJzZWRbXCJpZFwiXSxcbiAgICAgICAgICAgICAgICBzdWJzY3JpcHRpb25JZDogcmVxdWVzdEJvZHlQYXJzZWRbXCJzdWJzY3JpcHRpb25JZFwiXSxcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IHJlcXVlc3RCb2R5UGFyc2VkW1widGltZXN0YW1wXCJdLFxuICAgICAgICAgICAgICAgIGNhbGxiYWNrVXJsOiByZXF1ZXN0Qm9keVBhcnNlZFtcImNhbGxiYWNrVXJsXCJdLFxuICAgICAgICAgICAgICAgIHRvcGljOiByZXF1ZXN0Qm9keVBhcnNlZFtcInRvcGljXCJdLFxuICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgd2ViaG9va0V2ZW50VHlwZTogcmVxdWVzdEJvZHlQYXJzZWRbXCJkYXRhXCJdW1wid2ViaG9va0V2ZW50VHlwZVwiXSxcbiAgICAgICAgICAgICAgICAgICAgY2FyZElkOiByZXF1ZXN0Qm9keVBhcnNlZFtcImRhdGFcIl1bXCJjYXJkSWRcIl0sXG4gICAgICAgICAgICAgICAgICAgIG1lbWJlcklkOiByZXF1ZXN0Qm9keVBhcnNlZFtcImRhdGFcIl1bXCJtZW1iZXJJZFwiXSxcbiAgICAgICAgICAgICAgICAgICAgcmVkZWVtZWRNYXRjaGluZ3M6IFtdLFxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHJlcXVlc3RCb2R5UGFyc2VkW1wiZGF0YVwiXVtcInRyYW5zYWN0aW9uSWRcIl0sXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXJkSWQ6IHJlcXVlc3RCb2R5UGFyc2VkW1wiZGF0YVwiXVtcImNhcmRJZFwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbmN5Q29kZTogQ3VycmVuY3lDb2RlVHlwZS5Vc2QsXG4gICAgICAgICAgICAgICAgICAgICAgICByZXdhcmRBbW91bnQ6IHJlcXVlc3RCb2R5UGFyc2VkW1wiZGF0YVwiXVtcImFtb3VudFwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLihtb29uYmVhbVRyYW5zYWN0aW9uU3RhdHVzICE9PSBudWxsICYmIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb29uYmVhbVRyYW5zYWN0aW9uU3RhdHVzOiBtb29uYmVhbVRyYW5zYWN0aW9uU3RhdHVzXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBpbml0aWFsaXplIHRoZSBPbGl2ZSBDbGllbnQgQVBJIGhlcmUsIGluIG9yZGVyIHRvIGNhbGwgdGhlIGFwcHJvcHJpYXRlIGVuZHBvaW50cyBmb3IgdGhpcyBoYW5kbGVyXG4gICAgICAgICAgICBjb25zdCBvbGl2ZUNsaWVudCA9IG5ldyBPbGl2ZUNsaWVudChwcm9jZXNzLmVudi5FTlZfTkFNRSEsIHJlZ2lvbik7XG5cbiAgICAgICAgICAgIC8vIDFfIENhbGwgdGhlIEdFVCBtZW1iZXIgZGV0YWlscyBPbGl2ZSBBUEkgdG8gcmV0cmlldmUgdGhlIG1lbWJlciBkZXRhaWxzIChleHRNZW1iZXJJRCkgZm9yIG1lbWJlclxuICAgICAgICAgICAgY29uc3QgbWVtYmVyRGV0YWlsc1Jlc3BvbnNlOiBNZW1iZXJEZXRhaWxzUmVzcG9uc2UgPSBhd2FpdCBnZXRNZW1iZXJEZXRhaWxzKG9saXZlQ2xpZW50LCB1cGRhdGVkVHJhbnNhY3Rpb25FdmVudC5kYXRhLm1lbWJlcklkKTtcblxuICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSBtZW1iZXIgZGV0YWlscyBjYWxsIHdhcyBzdWNjZXNzZnVsIG9yIG5vdFxuICAgICAgICAgICAgaWYgKG1lbWJlckRldGFpbHNSZXNwb25zZSAmJiAhbWVtYmVyRGV0YWlsc1Jlc3BvbnNlLmVycm9yTWVzc2FnZSAmJiAhbWVtYmVyRGV0YWlsc1Jlc3BvbnNlLmVycm9yVHlwZSAmJiBtZW1iZXJEZXRhaWxzUmVzcG9uc2UuZGF0YSkge1xuICAgICAgICAgICAgICAgIC8vIGluaXRpYWxpemUgdGhlIE1vb25iZWFtIENsaWVudCBBUEkgaGVyZSwgaW4gb3JkZXIgdG8gY2FsbCB0aGUgYXBwcm9wcmlhdGUgZW5kcG9pbnRzIGZvciB0aGlzIHJlc29sdmVyXG4gICAgICAgICAgICAgICAgY29uc3QgbW9vbmJlYW1DbGllbnQgPSBuZXcgTW9vbmJlYW1DbGllbnQocHJvY2Vzcy5lbnYuRU5WX05BTUUhLCByZWdpb24pO1xuXG4gICAgICAgICAgICAgICAgLy8gMikgQ2FsbCB0aGUgZ2V0VHJhbnNhY3Rpb24gTW9vbmJlYW0gQXBwU3luYyBBUEkgZW5kcG9pbnQsIHRvIGRldGVybWluZSB3aGV0aGVyIHRoZXJlIGlzIGFuIGV4aXN0ZW50IHRyYW5zYWN0aW9uIHRvIHVwZGF0ZSB0aGUgc3RhdHVzIGZvci5cbiAgICAgICAgICAgICAgICBjb25zdCByZXRyaWV2ZWRUcmFuc2FjdGlvbnNSZXNwb25zZTogTW9vbmJlYW1UcmFuc2FjdGlvbnNSZXNwb25zZSA9IGF3YWl0IGdldFRyYW5zYWN0aW9uKG1vb25iZWFtQ2xpZW50LCBtZW1iZXJEZXRhaWxzUmVzcG9uc2UuZGF0YSk7XG5cbiAgICAgICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIGdldCB0cmFuc2FjdGlvbiBjYWxsIHdhcyBzdWNjZXNzZnVsIG9yIG5vdFxuICAgICAgICAgICAgICAgIGlmIChyZXRyaWV2ZWRUcmFuc2FjdGlvbnNSZXNwb25zZSAmJiAhcmV0cmlldmVkVHJhbnNhY3Rpb25zUmVzcG9uc2UuZXJyb3JNZXNzYWdlICYmICFyZXRyaWV2ZWRUcmFuc2FjdGlvbnNSZXNwb25zZS5lcnJvclR5cGUgJiYgcmV0cmlldmVkVHJhbnNhY3Rpb25zUmVzcG9uc2UuZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBmaWx0ZXIgdGhlIHRyYW5zYWN0aW9ucyB0byBlbnN1cmUgd2hldGhlciB0aGlzIHRyYW5zYWN0aW9uIGlzIGF2YWlsYWJsZSBpbiB0aGUgREIgb3Igbm90LlxuICAgICAgICAgICAgICAgICAgICBjb25zdCBmaWx0ZXJlZFRyYW5zYWN0aW9uID0gcmV0cmlldmVkVHJhbnNhY3Rpb25zUmVzcG9uc2UuZGF0YSEuZmlsdGVyKHRyYW5zYWN0aW9uID0+IHRyYW5zYWN0aW9uIS50cmFuc2FjdGlvbklkID09PSB1cGRhdGVkVHJhbnNhY3Rpb25FdmVudC5kYXRhLnRyYW5zYWN0aW9uLmlkXG4gICAgICAgICAgICAgICAgICAgICAgICAmJiB0cmFuc2FjdGlvbiEuaWQgPT09IG1lbWJlckRldGFpbHNSZXNwb25zZS5kYXRhKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyAzQSkgSWYgdGhlcmUgaXMgYW4gZXhpc3RlbnQgdHJhbnNhY3Rpb24sIGNhbGwgdGhlIHVwZGF0ZVRyYW5zYWN0aW9uIEFwcFN5bmMgQVBJIGVuZHBvaW50LCBpZiBuZWVkZWQsIHRvIHVwZGF0ZSBpdHMgc3RhdHVzIGFjY29yZGluZ2x5LlxuICAgICAgICAgICAgICAgICAgICBpZiAoZmlsdGVyZWRUcmFuc2FjdGlvbiEubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBlbnN1cmUgdGhhdCB3ZSBvbmx5IGdldCBvbmUgbWF0Y2hlZCB0cmFuc2FjdGlvbiB3aXRoIHRoZSBhcHByb3ByaWF0ZSBpbmZvcm1hdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZpbHRlcmVkVHJhbnNhY3Rpb24hLmxlbmd0aCA9PT0gMSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlcmVkVHJhbnNhY3Rpb25bMF0hLnRpbWVzdGFtcCAhPT0gdW5kZWZpbmVkICYmIGZpbHRlcmVkVHJhbnNhY3Rpb25bMF0hLnRpbWVzdGFtcCAhPT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlcmVkVHJhbnNhY3Rpb25bMF0hLmlkICE9IHVuZGVmaW5lZCAmJiBmaWx0ZXJlZFRyYW5zYWN0aW9uWzBdIS5pZCAhPSBudWxsICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyZWRUcmFuc2FjdGlvblswXSEudHJhbnNhY3Rpb25TdGF0dXMgIT0gdW5kZWZpbmVkICYmIGZpbHRlcmVkVHJhbnNhY3Rpb25bMF0hLnRyYW5zYWN0aW9uU3RhdHVzICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpbnRlcm5hbGx5IHVwZGF0ZSB0aGlzIHRyYW5zYWN0aW9uJ3Mgc3RhdHVzIGFjY29yZGluZ2x5IChpZiBuZWVkZWQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG5lZWRzVG9VcGRhdGVTdGF0dXMgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVxdWVzdEJvZHlQYXJzZWRbXCJkYXRhXCJdW1wic3RhdHVzXCJdID09PSBcInJlamVjdGVkXCIgJiYgZmlsdGVyZWRUcmFuc2FjdGlvblswXSEudHJhbnNhY3Rpb25TdGF0dXMgIT09IFRyYW5zYWN0aW9uc1N0YXR1cy5SZWplY3RlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZWVkc1RvVXBkYXRlU3RhdHVzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlcXVlc3RCb2R5UGFyc2VkW1wiZGF0YVwiXVtcInN0YXR1c1wiXSA9PT0gXCJkaXN0cmlidXRlZF90b19wdWJsaXNoZXJcIiAmJiBmaWx0ZXJlZFRyYW5zYWN0aW9uWzBdIS50cmFuc2FjdGlvblN0YXR1cyAhPT0gVHJhbnNhY3Rpb25zU3RhdHVzLlByb2Nlc3NlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZWVkc1RvVXBkYXRlU3RhdHVzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlcXVlc3RCb2R5UGFyc2VkW1wiZGF0YVwiXVtcInN0YXR1c1wiXSA9PT0gXCJkaXN0cmlidXRlZF90b19tZW1iZXJfZGlzdHJpYnV0b3JcIiAmJiBmaWx0ZXJlZFRyYW5zYWN0aW9uWzBdIS50cmFuc2FjdGlvblN0YXR1cyAhPT0gVHJhbnNhY3Rpb25zU3RhdHVzLkNyZWRpdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5lZWRzVG9VcGRhdGVTdGF0dXMgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmVlZHNUb1VwZGF0ZVN0YXR1cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgRXhpc3RlbnQgdHJhbnNhY3Rpb24gJHt1cGRhdGVkVHJhbnNhY3Rpb25FdmVudC5kYXRhLnRyYW5zYWN0aW9uLmlkfSwgbmVlZHMgdG8gaGF2ZSBpdHMgc3RhdHVzIHVwZGF0ZWQgdG8gLSAke21vb25iZWFtVHJhbnNhY3Rpb25TdGF0dXN9YCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVwZGF0ZWRUcmFuc2FjdGlvblJlc3BvbnNlOiBNb29uYmVhbVVwZGF0ZWRUcmFuc2FjdGlvblJlc3BvbnNlID0gYXdhaXQgbW9vbmJlYW1DbGllbnQudXBkYXRlVHJhbnNhY3Rpb24oe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGZpbHRlcmVkVHJhbnNhY3Rpb25bMF0hLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiBmaWx0ZXJlZFRyYW5zYWN0aW9uWzBdIS50aW1lc3RhbXAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbklkOiB1cGRhdGVkVHJhbnNhY3Rpb25FdmVudC5kYXRhLnRyYW5zYWN0aW9uLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25TdGF0dXM6IG1vb25iZWFtVHJhbnNhY3Rpb25TdGF0dXMgPT09IG51bGwgPyBUcmFuc2FjdGlvbnNTdGF0dXMuUGVuZGluZyA6IG1vb25iZWFtVHJhbnNhY3Rpb25TdGF0dXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGUgdXBkYXRlIHRyYW5zYWN0aW9uIGNhbGwgd2FzIHN1Y2Nlc3NmdWwgb3Igbm90XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghdXBkYXRlZFRyYW5zYWN0aW9uUmVzcG9uc2UgfHwgdXBkYXRlZFRyYW5zYWN0aW9uUmVzcG9uc2UuZXJyb3JUeXBlIHx8IHVwZGF0ZWRUcmFuc2FjdGlvblJlc3BvbnNlLmVycm9yVHlwZSB8fCAhdXBkYXRlZFRyYW5zYWN0aW9uUmVzcG9uc2UuZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFVuZXhwZWN0ZWQgZXJyb3IgYW5kL29yIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tIHRoZSB1cGRhdGVUcmFuc2FjdGlvbiBjYWxsICR7SlNPTi5zdHJpbmdpZnkodXBkYXRlZFRyYW5zYWN0aW9uUmVzcG9uc2UpfSFgKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYWRkcyBhbiBpdGVtIGZhaWx1cmUsIGZvciB0aGUgU1FTIG1lc3NhZ2Ugd2hpY2ggZmFpbGVkIHByb2Nlc3NpbmcsIGFzIHBhcnQgb2YgdGhlIGluY29taW5nIGV2ZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtRmFpbHVyZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbUlkZW50aWZpZXI6IHVwZGF0ZWRUcmFuc2FjdGlvbmFsUmVjb3JkLm1lc3NhZ2VJZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgRXhpc3RlbnQgdHJhbnNhY3Rpb24gJHt1cGRhdGVkVHJhbnNhY3Rpb25FdmVudC5kYXRhLnRyYW5zYWN0aW9uLmlkfSwgYWxyZWFkeSBoYXMgaXRzIHN0YXR1cyB1cCB0byBkYXRlIC0gJHtmaWx0ZXJlZFRyYW5zYWN0aW9uWzBdIS50cmFuc2FjdGlvblN0YXR1c31gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBJbnZhbGlkIGZpbHRlcmVkL21hdGNoZWQgdHJhbnNhY3Rpb24gZGV0YWlscyByZXR1cm5lZCAke0pTT04uc3RyaW5naWZ5KGZpbHRlcmVkVHJhbnNhY3Rpb24pfWApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYWRkcyBhbiBpdGVtIGZhaWx1cmUsIGZvciB0aGUgU1FTIG1lc3NhZ2Ugd2hpY2ggZmFpbGVkIHByb2Nlc3NpbmcsIGFzIHBhcnQgb2YgdGhlIGluY29taW5nIGV2ZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbUZhaWx1cmVzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtSWRlbnRpZmllcjogdXBkYXRlZFRyYW5zYWN0aW9uYWxSZWNvcmQubWVzc2FnZUlkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIDNCKSBJZiB0aGVyZSBpcyBubyBleGlzdGVudCB0cmFuc2FjdGlvbiwgdGhlbjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIDQpIENhbGwgdGhlIEdFVCB0cmFuc2FjdGlvbiBkZXRhaWxzIE9saXZlIEFQSSB0byByZXRyaWV2ZSB0aGUgYWRkaXRpb25hbCBpbmZvcm1hdGlvbiBuZWVkZWQgZm9yIHRoZSB0cmFuc2FjdGlvbiBmcm9tIE9saXZlLlxuICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1cGRhdGVkVHJhbnNhY3Rpb25FdmVudFJlc3BvbnNlOiBVcGRhdGVkVHJhbnNhY3Rpb25FdmVudFJlc3BvbnNlID0gYXdhaXQgZ2V0VXBkYXRlZFRyYW5zYWN0aW9uRGV0YWlscyhvbGl2ZUNsaWVudCwgdXBkYXRlZFRyYW5zYWN0aW9uRXZlbnQpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIHVwZGF0ZWQgdHJhbnNhY3Rpb24gZGV0YWlscyBjYWxsIHdhcyBzdWNjZXNzZnVsIG9yIG5vdFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHVwZGF0ZWRUcmFuc2FjdGlvbkV2ZW50UmVzcG9uc2UgJiYgIXVwZGF0ZWRUcmFuc2FjdGlvbkV2ZW50UmVzcG9uc2UuZXJyb3JNZXNzYWdlICYmICF1cGRhdGVkVHJhbnNhY3Rpb25FdmVudFJlc3BvbnNlLmVycm9yVHlwZSAmJiB1cGRhdGVkVHJhbnNhY3Rpb25FdmVudFJlc3BvbnNlLmRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyA1KSBjYWxsIHRoZSBQT1NUL3RyYW5zYWN0aW9uc0Fja25vd2xlZGdtZW50IE1vb25iZWFtIGludGVybmFsIGVuZHBvaW50LCB0byBhY2tub3dsZWRnZSB0aGUgdHJhbnNhY3Rpb24gYXMgYSBxdWFsaWZ5aW5nIG9mZmVyLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlOiBBUElHYXRld2F5UHJveHlSZXN1bHQgPSBhd2FpdCBtb29uYmVhbUNsaWVudC50cmFuc2FjdGlvbnNBY2tub3dsZWRnbWVudCh1cGRhdGVkVHJhbnNhY3Rpb25FdmVudCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIHRyYW5zYWN0aW9uIGFja25vd2xlZGdtZW50IGNhbGwgd2FzIGV4ZWN1dGVkIHN1Y2Nlc3NmdWxseVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5zdGF0dXNDb2RlID09PSAyMDIgJiYgcmVzcG9uc2UuYm9keSAhPT0gbnVsbCAmJiByZXNwb25zZS5ib2R5ICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2UuYm9keSA9PT0gXCJUcmFuc2FjdGlvbiBhY2tub3dsZWRnZWQhXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFN1Y2Nlc3NmdWxseSBhY2tub3dsZWRnZWQgdHJhbnNhY3Rpb24gdXBkYXRlIGZvciB0cmFuc2FjdGlvbiAtICR7dXBkYXRlZFRyYW5zYWN0aW9uRXZlbnQuZGF0YS50cmFuc2FjdGlvbi5pZH0hYCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIGZvciBhbnkgdXNlcnMgZm9yIHdoaWNoIHRoZSByZWltYnVyc2VtZW50IGhhcyBub3QgYmVlbiBhY2tub3dsZWRnZWQsIGRvIG5vdGhpbmcgb3RoZXIgdGhhbiBsb2dnaW5nIHRoZSBlcnJvcnNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICogZm9yIHRoZSBvbmVzIGZvciB3aGljaCB0aGlzIGluZm8gaXMgbm90LCBkbyBub3RoaW5nIG90aGVyIHRoYW4gbG9nZ2luZyB0aGUgZXJyb3JzLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gdGhlIHRyYW5zYWN0aW9uIGFja25vd2xlZGdtZW50IGNhbGwhYDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfSAke3Jlc3BvbnNlICYmIEpTT04uc3RyaW5naWZ5KHJlc3BvbnNlKX1gKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhZGRzIGFuIGl0ZW0gZmFpbHVyZSwgZm9yIHRoZSBTUVMgbWVzc2FnZSB3aGljaCBmYWlsZWQgcHJvY2Vzc2luZywgYXMgcGFydCBvZiB0aGUgaW5jb21pbmcgZXZlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbUZhaWx1cmVzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbUlkZW50aWZpZXI6IHVwZGF0ZWRUcmFuc2FjdGlvbmFsUmVjb3JkLm1lc3NhZ2VJZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBUcmFuc2FjdGlvbiBEZXRhaWxzIG1hcHBpbmcgdGhyb3VnaCBHRVQgdXBkYXRlIHRyYW5zYWN0aW9uIGRldGFpbHMgY2FsbCBmYWlsZWRgKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFkZHMgYW4gaXRlbSBmYWlsdXJlLCBmb3IgdGhlIFNRUyBtZXNzYWdlIHdoaWNoIGZhaWxlZCBwcm9jZXNzaW5nLCBhcyBwYXJ0IG9mIHRoZSBpbmNvbWluZyBldmVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1GYWlsdXJlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbUlkZW50aWZpZXI6IHVwZGF0ZWRUcmFuc2FjdGlvbmFsUmVjb3JkLm1lc3NhZ2VJZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFRyYW5zYWN0aW9uIHJldHJpZXZhbCBmb3IgbWVtYmVyIGNhbGwgZmFpbGVkYCk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gYWRkcyBhbiBpdGVtIGZhaWx1cmUsIGZvciB0aGUgU1FTIG1lc3NhZ2Ugd2hpY2ggZmFpbGVkIHByb2Nlc3NpbmcsIGFzIHBhcnQgb2YgdGhlIGluY29taW5nIGV2ZW50XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1GYWlsdXJlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1JZGVudGlmaWVyOiB1cGRhdGVkVHJhbnNhY3Rpb25hbFJlY29yZC5tZXNzYWdlSWRcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgVXNlcklEIG1hcHBpbmcgdGhyb3VnaCBHRVQgbWVtYmVyIGRldGFpbHMgY2FsbCBmYWlsZWRgKTtcblxuICAgICAgICAgICAgICAgIC8vIGFkZHMgYW4gaXRlbSBmYWlsdXJlLCBmb3IgdGhlIFNRUyBtZXNzYWdlIHdoaWNoIGZhaWxlZCBwcm9jZXNzaW5nLCBhcyBwYXJ0IG9mIHRoZSBpbmNvbWluZyBldmVudFxuICAgICAgICAgICAgICAgIGl0ZW1GYWlsdXJlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbUlkZW50aWZpZXI6IHVwZGF0ZWRUcmFuc2FjdGlvbmFsUmVjb3JkLm1lc3NhZ2VJZFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIGZvciB0aGUgTGFtYmRhIHRvIGluZGljYXRlIFNRUyB0aGF0IHRoZXJlIGhhdmUgYmVlbiBubyBmYWlsdXJlcywgYW5kIHRodXMgZW5hYmxlIHRoZSBkZWxldGlvbiBvZiBhbGwgcHJvY2Vzc2VkIG1lc3NhZ2VzXG4gICAgICAgICAqIGZyb20gdGhlIHF1ZXVlLCB3ZSBoYXZlIHRvIHJldHVybiBhbiBlbXB0eSBiYXRjaEl0ZW1GYWlsdXJlcyBhcnJheSBoZXJlLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAbGluayBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vbGFtYmRhL2xhdGVzdC9kZy93aXRoLXNxcy5odG1sXG4gICAgICAgICAqL1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYmF0Y2hJdGVtRmFpbHVyZXM6IGl0ZW1GYWlsdXJlc1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5sb2coYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgcHJvY2Vzc2luZyAke0pTT04uc3RyaW5naWZ5KGV2ZW50KX0gdXBkYXRlZCB0cmFuc2FjdGlvbmFsIGV2ZW50ICR7ZXJyb3J9YCk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIHJldHVybnMgYSBiYXRjaCByZXNwb25zZSBmYWlsdXJlIGZvciB0aGUgcGFydGljdWxhciBtZXNzYWdlIElEcyB3aGljaCBmYWlsZWRcbiAgICAgICAgICogaW4gdGhpcyBjYXNlLCB0aGUgTGFtYmRhIGZ1bmN0aW9uIERPRVMgTk9UIGRlbGV0ZSB0aGUgaW5jb21pbmcgbWVzc2FnZXMgZnJvbSB0aGUgcXVldWUsIGFuZCBpdCBtYWtlcyBpdCBhdmFpbGFibGUvdmlzaWJsZSBhZ2FpblxuICAgICAgICAgKlxuICAgICAgICAgKiBAbGluayBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vbGFtYmRhL2xhdGVzdC9kZy93aXRoLXNxcy5odG1sXG4gICAgICAgICAqL1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYmF0Y2hJdGVtRmFpbHVyZXM6IFt7XG4gICAgICAgICAgICAgICAgLy8gZm9yIHRoaXMgY2FzZSwgd2Ugb25seSBwcm9jZXNzIDEgcmVjb3JkIGF0IGEgdGltZSwgd2UgbWlnaHQgbmVlZCB0byBjaGFuZ2UgdGhpcyBpbiB0aGUgZnV0dXJlXG4gICAgICAgICAgICAgICAgaXRlbUlkZW50aWZpZXI6IGV2ZW50LlJlY29yZHNbMF0ubWVzc2FnZUlkXG4gICAgICAgICAgICB9XVxuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHVzZWQgdG8gcmV0cmlldmUgdGhlIG1lbWJlciBkZXRhaWxzIG9mIGEgdXNlciwgd2hpY2ggaW5jbHVkZXMgdGhlIGV4dE1lbWJlcklkXG4gKiBvZiBhIG1lbWJlciwgZGlyZWN0bHkgbWFwcGVkIHRvIGEgTW9vbmJlYW0gdXNlcklkLCB0byBiZSB1c2VkIHdoZW4gc3RvcmluZyBhbiB1cGRhdGVkIHRyYW5zYWN0aW9uIGV2ZW50LlxuICpcbiAqIEBwYXJhbSBvbGl2ZUNsaWVudCBjbGllbnQgdXNlZCB0byBtYWtlIE9saXZlIEFQSSBjYWxsc1xuICogQHBhcmFtIG1lbWJlcklkIHRoZSBpZCBvZiB0aGUgbWVtYmVyLCBvYnRhaW5lZCBmcm9tIE9saXZlIHRocm91Z2ggdGhlIHRyYW5zYWN0aW9uIG1lc3NhZ2UsXG4gKiB3aGljaCBkZXRhaWxzIGFyZSByZXRyaWV2ZWQgZm9yXG4gKlxuICogQHJldHVybnMgYSB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIE1lbWJlckRldGFpbHNSZXNwb25zZX0gcmVwcmVzZW50aW5nIHRoZSBkZXRhaWxzIG9mIGEgbWVtYmVyXG4gKiBpbiB0aGUgZm9ybSBvZiBlaXRoZXIgYW4gZXJyb3IsIG9yIGEgdmFsaWQgc3RyaW5nLWJhc2VkIHJlc3BvbnNlIHNpZ25pZnlpbmcgdGhlIG1lbWJlcidzIGV4dGVybmFsIGlkXG4gKi9cbmNvbnN0IGdldE1lbWJlckRldGFpbHMgPSBhc3luYyAob2xpdmVDbGllbnQ6IE9saXZlQ2xpZW50LCBtZW1iZXJJZDogc3RyaW5nKTogUHJvbWlzZTxNZW1iZXJEZXRhaWxzUmVzcG9uc2U+ID0+IHtcbiAgICAvLyBleGVjdXRlIHRoZSBtZW1iZXIgZGV0YWlscyByZXRyaWV2YWwgY2FsbCwgaW4gb3JkZXIgdG8gZ2V0IHRoZSBNb29uYmVhbSB1c2VySWQgdG8gYmUgdXNlZCBpbiBhc3NvY2lhdGluZyBhIHRyYW5zYWN0aW9uIHdpdGggYSBNb29uYmVhbSB1c2VyXG4gICAgY29uc3QgcmVzcG9uc2U6IE1lbWJlckRldGFpbHNSZXNwb25zZSA9IGF3YWl0IG9saXZlQ2xpZW50LmdldE1lbWJlckRldGFpbHMobWVtYmVySWQpO1xuXG4gICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSBtZW1iZXIgZGV0YWlscyBjYWxsIHdhcyBleGVjdXRlZCBzdWNjZXNzZnVsbHlcbiAgICBpZiAocmVzcG9uc2UgIT09IHVuZGVmaW5lZCAmJiByZXNwb25zZSAhPT0gbnVsbCAmJiAhcmVzcG9uc2UuZXJyb3JNZXNzYWdlICYmICFyZXNwb25zZS5lcnJvclR5cGUgJiZcbiAgICAgICAgcmVzcG9uc2UuZGF0YSAhPT0gdW5kZWZpbmVkICYmIHJlc3BvbnNlLmRhdGEgIT09IG51bGwgJiYgcmVzcG9uc2UuZGF0YS5sZW5ndGggIT09IDApIHtcbiAgICAgICAgLy8gcmV0dXJucyB0aGUgcmVzcG9uc2UgZGF0YSB3aXRoIHRoZSBtZW1iZXIncyBleHRlcm5hbCBJRCwgdG8gYmUgbWFwcGVkIHRvIE1vb25iZWFtJ3MgdXNlcklkXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkYXRhOiByZXNwb25zZS5kYXRhXG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSB0aGUgbWVtYmVyIGRldGFpbHMgY2FsbCFgO1xuICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgIC8vIGlmIHRoZXJlIGFyZSBlcnJvcnMgYXNzb2NpYXRlZCB3aXRoIHRoZSBjYWxsLCBqdXN0IHJldHVybiB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgZXJyb3IgdHlwZSBmcm9tIHRoZSB1cHN0cmVhbSBjbGllbnRcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3IsXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHVzZWQgdG8gcmV0cmlldmUgdGhlIHRyYW5zYWN0aW9ucywgZm9yIHRoZSBjdXJyZW50IHVzZXIgYW5kIHRpbWVzdGFtcC5cbiAqXG4gKiBAcGFyYW0gbW9vbmJlYW1DbGllbnQgY2xpZW50IHVzZWQgdG8gbWFrZSBNb29uYmVhbSBBUEkgY2FsbHNcbiAqIEBwYXJhbSB1c2VySWQgdGhlIHVzZXIgaWQgd2hpY2ggd2UgYXJlIHJldHJpZXZpbmcgdHJhbnNhY3Rpb25zIGZvclxuICpcbiAqIEByZXR1cm5zIGEge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBUcmFuc2FjdGlvblJlc3BvbnNlfSByZXByZXNlbnRpbmcgdGhlIHRyYW5zYWN0aW9uIGluZm9ybWF0aW9uIHBhc3NlZFxuICogaW4gdGhyb3VnaCB0aGUgU1FTIG1lc3NhZ2UsIGFsb25nc2lkZSB0aGUgYWRkaXRpb25hbCB0cmFuc2FjdGlvbiBkZXRhaWxzIHJldHJpZXZlZCB0aHJvdWdoIHRoaXMgY2FsbC5cbiAqL1xuY29uc3QgZ2V0VHJhbnNhY3Rpb24gPSBhc3luYyAobW9vbmJlYW1DbGllbnQ6IE1vb25iZWFtQ2xpZW50LCB1c2VySWQ6IHN0cmluZyk6IFByb21pc2U8TW9vbmJlYW1UcmFuc2FjdGlvbnNSZXNwb25zZT4gPT4ge1xuICAgIC8vIGV4ZWN1dGUgdGhlIGdldCB0cmFuc2FjdGlvbnMgY2FsbCwgdG8gcmV0cmlldmUgdGhlIHRyYW5zYWN0aW9ucyBmb3IgYSBwYXJ0aWN1bGFyIHVzZXJcbiAgICBjb25zdCByZXNwb25zZTogTW9vbmJlYW1UcmFuc2FjdGlvbnNSZXNwb25zZSA9IGF3YWl0IG1vb25iZWFtQ2xpZW50LmdldFRyYW5zYWN0aW9uKHtcbiAgICAgICAgaWQ6IHVzZXJJZCxcbiAgICAgICAgLy8gcmV0cmlldmUgdGhlIGN1cnJlbnQgZGF0ZSBhbmQgdGltZSB0byBmaWx0ZXIgdHJhbnNhY3Rpb25zIGJ5XG4gICAgICAgIGVuZERhdGU6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgIH0pO1xuXG4gICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSB0cmFuc2FjdGlvbiBkZXRhaWxzIGNhbGwgd2FzIGV4ZWN1dGVkIHN1Y2Nlc3NmdWxseVxuICAgIGlmIChyZXNwb25zZSAhPT0gdW5kZWZpbmVkICYmIHJlc3BvbnNlICE9PSBudWxsICYmICFyZXNwb25zZS5lcnJvck1lc3NhZ2UgICYmICFyZXNwb25zZS5lcnJvclR5cGUgJiZcbiAgICAgICAgcmVzcG9uc2UuZGF0YSAhPT0gdW5kZWZpbmVkICYmIHJlc3BvbnNlLmRhdGEgIT09IG51bGwgJiYgcmVzcG9uc2UuZGF0YS5sZW5ndGggIT09IDApIHtcbiAgICAgICAgLy8gcmV0dXJucyB0aGUgdXBkYXRlZCB0cmFuc2FjdGlvbiBkYXRhXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkYXRhOiByZXNwb25zZS5kYXRhXG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBmaWx0ZXIgdGhlIGVycm9yIG1lc3NhZ2UgZm9yIGNhc2VzIGluIHdoaWNoIHRoZXJlIGFyZSBubyB0cmFuc2FjdGlvbnMgZm91bmQgZm9yIHRoaXMgdXNlclxuICAgICAgICBpZiAocmVzcG9uc2UuZXJyb3JUeXBlICE9PSB1bmRlZmluZWQgJiYgcmVzcG9uc2UuZXJyb3JUeXBlICE9PSBudWxsICYmIHJlc3BvbnNlLmVycm9yVHlwZSA9PT0gVHJhbnNhY3Rpb25zRXJyb3JUeXBlLk5vbmVPckFic2VudCkge1xuICAgICAgICAgICAgLy8gcmV0dXJucyB0aGUgdXBkYXRlZCB0cmFuc2FjdGlvbiBkYXRhXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRhdGE6IFtdXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSB0aGUgZ2V0IHRyYW5zYWN0aW9uIGNhbGwhYDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgIC8vIGlmIHRoZXJlIGFyZSBlcnJvcnMgYXNzb2NpYXRlZCB3aXRoIHRoZSBjYWxsLCBqdXN0IHJldHVybiB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgZXJyb3IgdHlwZSBmcm9tIHRoZSB1cHN0cmVhbSBjbGllbnRcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3IsXG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB1c2VkIHRvIHJldHJpZXZlIHRoZSB0cmFuc2FjdGlvbiBkZXRhaWxzLCB3aGljaCBtYWlubHkgaW5jbHVkZSB0aGUgdGltZSBvZiBwdXJjaGFzZSwgYXNzb2NpYXRlZFxuICogd2l0aCB0aGUgdHJhbnNhY3Rpb24gZXZlbnQsIHRvIGJlIHVzZWQgd2hlbiBzdG9yaW5nIHRoZSB0cmFuc2FjdGlvbiBpbiB0aGUgREIuXG4gKlxuICogQHBhcmFtIG9saXZlQ2xpZW50IGNsaWVudCB1c2VkIHRvIG1ha2UgT2xpdmUgQVBJIGNhbGxzXG4gKiBAcGFyYW0gdXBkYXRlZFRyYW5zYWN0aW9uRXZlbnQgdGhlIHVwZGF0ZWQgdHJhbnNhY3Rpb24gb2JqZWN0IG9idGFpbmVkIGZyb20gT2xpdmUgdGhyb3VnaCB0aGUgdXBkYXRlZCB0cmFuc2FjdGlvbiBtZXNzYWdlLFxuICogd2hpY2ggYWRkaXRpb25hbCB0cmFuc2FjdGlvbiBkZXRhaWxzIG9idGFpbmVkIHRocm91Z2ggdGhpcyBjYWxsIGFyZSBhcHBlbmRlZCB0by5cbiAqXG4gKiBAcmV0dXJucyBhIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgVHJhbnNhY3Rpb25SZXNwb25zZX0gcmVwcmVzZW50aW5nIHRoZSB1cGRhdGVkIHRyYW5zYWN0aW9uIGluZm9ybWF0aW9uIHBhc3NlZFxuICogaW4gdGhyb3VnaCB0aGUgU1FTIG1lc3NhZ2UsIGFsb25nc2lkZSB0aGUgYWRkaXRpb25hbCB0cmFuc2FjdGlvbiBkZXRhaWxzIHJldHJpZXZlZCB0aHJvdWdoIHRoaXMgY2FsbC5cbiAqL1xuY29uc3QgZ2V0VXBkYXRlZFRyYW5zYWN0aW9uRGV0YWlscyA9IGFzeW5jIChvbGl2ZUNsaWVudDogT2xpdmVDbGllbnQsIHVwZGF0ZWRUcmFuc2FjdGlvbkV2ZW50OiBVcGRhdGVkVHJhbnNhY3Rpb25FdmVudCk6IFByb21pc2U8VXBkYXRlZFRyYW5zYWN0aW9uRXZlbnRSZXNwb25zZT4gPT4ge1xuICAgIC8vIGV4ZWN1dGUgdGhlIHRyYW5zYWN0aW9uIGRldGFpbHMgcmV0cmlldmFsIGNhbGwsIGluIG9yZGVyIHRvIGdldCBhZGRpdGlvbmFsIHRyYW5zYWN0aW9uIGRldGFpbHMgZm9yIHRoZSBpbmNvbWluZyB1cGRhdGVkIHRyYW5zYWN0aW9uIGV2ZW50IG9iamVjdFxuICAgIGNvbnN0IHJlc3BvbnNlOiBVcGRhdGVkVHJhbnNhY3Rpb25FdmVudFJlc3BvbnNlID0gYXdhaXQgb2xpdmVDbGllbnQuZ2V0VXBkYXRlZFRyYW5zYWN0aW9uRGV0YWlscyh1cGRhdGVkVHJhbnNhY3Rpb25FdmVudCk7XG5cbiAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIHRyYW5zYWN0aW9uIGRldGFpbHMgY2FsbCB3YXMgZXhlY3V0ZWQgc3VjY2Vzc2Z1bGx5XG4gICAgaWYgKHJlc3BvbnNlICE9PSB1bmRlZmluZWQgJiYgcmVzcG9uc2UgIT09IG51bGwgJiYgIXJlc3BvbnNlLmVycm9yTWVzc2FnZSAmJiAhcmVzcG9uc2UuZXJyb3JUeXBlICYmXG4gICAgICAgIHJlc3BvbnNlLmRhdGEgIT09IHVuZGVmaW5lZCAmJiByZXNwb25zZS5kYXRhICE9PSBudWxsICYmXG4gICAgICAgIHJlc3BvbnNlLmRhdGEuZGF0YS50cmFuc2FjdGlvbi5zdG9yZUlkICE9PSB1bmRlZmluZWQgJiYgcmVzcG9uc2UuZGF0YS5kYXRhLnRyYW5zYWN0aW9uLnN0b3JlSWQgIT09IG51bGwgJiZcbiAgICAgICAgcmVzcG9uc2UuZGF0YS5kYXRhLnRyYW5zYWN0aW9uLmJyYW5kSWQgIT09IHVuZGVmaW5lZCAmJiByZXNwb25zZS5kYXRhLmRhdGEudHJhbnNhY3Rpb24uYnJhbmRJZCAhPT0gbnVsbCAmJlxuICAgICAgICByZXNwb25zZS5kYXRhLmRhdGEudHJhbnNhY3Rpb24ubG95YWx0eVByb2dyYW1JZCAhPT0gdW5kZWZpbmVkICYmIHJlc3BvbnNlLmRhdGEuZGF0YS50cmFuc2FjdGlvbi5sb3lhbHR5UHJvZ3JhbUlkICE9PSBudWxsICYmXG4gICAgICAgIHJlc3BvbnNlLmRhdGEuZGF0YS50cmFuc2FjdGlvbi5yb3VuZGluZ1J1bGVJZCAhPT0gdW5kZWZpbmVkICYmIHJlc3BvbnNlLmRhdGEuZGF0YS50cmFuc2FjdGlvbi5yb3VuZGluZ1J1bGVJZCAhPT0gbnVsbCAmJlxuICAgICAgICByZXNwb25zZS5kYXRhLmRhdGEudHJhbnNhY3Rpb24ubWVyY2hhbnRDYXRlZ29yeUNvZGUgIT09IHVuZGVmaW5lZCAmJiByZXNwb25zZS5kYXRhLmRhdGEudHJhbnNhY3Rpb24ubWVyY2hhbnRDYXRlZ29yeUNvZGUgIT09IG51bGwgJiZcbiAgICAgICAgcmVzcG9uc2UuZGF0YS5kYXRhLnRyYW5zYWN0aW9uLmFtb3VudCAhPT0gdW5kZWZpbmVkICYmIHJlc3BvbnNlLmRhdGEuZGF0YS50cmFuc2FjdGlvbi5hbW91bnQgIT09IG51bGwgJiZcbiAgICAgICAgcmVzcG9uc2UuZGF0YS5kYXRhLnRyYW5zYWN0aW9uLnJvdW5kZWRBbW91bnQgIT09IHVuZGVmaW5lZCAmJiByZXNwb25zZS5kYXRhLmRhdGEudHJhbnNhY3Rpb24ucm91bmRlZEFtb3VudCAhPT0gbnVsbCAmJlxuICAgICAgICByZXNwb25zZS5kYXRhLmRhdGEudHJhbnNhY3Rpb24ubWF0Y2hpbmdBbW91bnQgIT09IHVuZGVmaW5lZCAmJiByZXNwb25zZS5kYXRhLmRhdGEudHJhbnNhY3Rpb24ubWF0Y2hpbmdBbW91bnQgIT09IG51bGwgJiZcbiAgICAgICAgcmVzcG9uc2UuZGF0YS5kYXRhLnRyYW5zYWN0aW9uLmNyZWF0ZWQgIT09IHVuZGVmaW5lZCAmJiByZXNwb25zZS5kYXRhLmRhdGEudHJhbnNhY3Rpb24uY3JlYXRlZCAhPT0gbnVsbCkge1xuICAgICAgICAvLyByZXR1cm5zIHRoZSB1cGRhdGVkIHRyYW5zYWN0aW9uIGRhdGFcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRhdGE6IHJlc3BvbnNlLmRhdGFcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tIHRoZSB1cGRhdGVkIHRyYW5zYWN0aW9uIGRldGFpbHMgY2FsbCFgO1xuICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgIC8vIGlmIHRoZXJlIGFyZSBlcnJvcnMgYXNzb2NpYXRlZCB3aXRoIHRoZSBjYWxsLCBqdXN0IHJldHVybiB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgZXJyb3IgdHlwZSBmcm9tIHRoZSB1cHN0cmVhbSBjbGllbnRcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3IsXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICB9XG4gICAgfVxufVxuXG4iXX0=