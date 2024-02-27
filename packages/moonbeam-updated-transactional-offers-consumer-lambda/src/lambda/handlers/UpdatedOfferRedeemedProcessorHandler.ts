import {APIGatewayProxyResult, SQSBatchResponse, SQSEvent} from "aws-lambda";
import {SQSBatchItemFailure} from "aws-lambda/trigger/sqs";
import {
    MemberDetailsResponse,
    MoonbeamClient,
    MoonbeamTransactionsResponse,
    MoonbeamUpdatedTransactionResponse,
    OliveClient,
    TransactionResponse,
    TransactionsErrorType,
    TransactionsStatus,
    UpdatedTransactionEvent,
    UpdatedTransactionEventResponse
} from "@moonbeam/moonbeam-models";
import {CurrencyCodeType} from "@moonbeam/moonbeam-models/lib";

/**
 * UpdatedOfferRedeemedProcessorHandler handler
 *
 * @param event the {@link SQSEvent} to be processed, containing the updated transaction
 * message information
 * @returns {@link Promise} of {@link SQSBatchResponse}
 */
export const processUpdatedOfferRedeemedTransactions = async (event: SQSEvent): Promise<SQSBatchResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        /**
         * initializing the batch response, as an empty array, that will be populated with errors, if any throughout the processing
         *
         * for the Lambda to indicate SQS that there have been no failures, and thus enable the deletion of all processed messages
         * from the queue, we have to return an empty batchItemFailures array. If we want to indicate that there have been errors,
         * for each individual message, based on its ID, we have to add it in the final batch response
         *
         * @link https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html
         */
        const itemFailures: SQSBatchItemFailure[] = [];

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
             * Note: any other statuses such as (PROCESSED, FUNDED, or REJECTED) will be updated by the updated transaction workflow accordingly, by
             * directly calling our AppSync transaction endpoints, instead of going through this flow.
             *
             * Note: The CREDITED status is a Moonbeam internal update-only status, that will ONLY get updated when we pay out a customer.
             */
            let moonbeamTransactionStatus: TransactionsStatus | null = null;
            if (requestBodyParsed["data"]["status"] === "rejected") {
                moonbeamTransactionStatus = TransactionsStatus.Rejected;
            }
            if (requestBodyParsed["data"]["status"] === "pending_merchant_funding" ||
                requestBodyParsed["data"]["status"] === "pending_transfer_to_publisher" ||
                requestBodyParsed["data"]["status"] === "distributed_to_publisher" ||
                requestBodyParsed["data"]["status"] === "distributed_to_olive") {
                moonbeamTransactionStatus = TransactionsStatus.Processed;
            }
            if (requestBodyParsed["data"]["status"] === "distributed_to_member_distributor") {
                moonbeamTransactionStatus = TransactionsStatus.Funded;
            }
            const updatedTransactionEvent: UpdatedTransactionEvent = {
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
                        currencyCode: CurrencyCodeType.Usd,
                        rewardAmount: requestBodyParsed["data"]["amount"],
                        ...(moonbeamTransactionStatus !== null && {
                            moonbeamTransactionStatus: moonbeamTransactionStatus
                        })
                    }
                }
            }

            // initialize the Olive Client API here, in order to call the appropriate endpoints for this handler
            const oliveClient = new OliveClient(process.env.ENV_NAME!, region);

            // 1) Call the GET member details Olive API to retrieve the member details (extMemberID) for member
            const memberDetailsResponse: MemberDetailsResponse = await getMemberDetails(oliveClient, updatedTransactionEvent.data.memberId);

            // check to see if the member details call was successful or not
            if (memberDetailsResponse && !memberDetailsResponse.errorMessage && !memberDetailsResponse.errorType && memberDetailsResponse.data) {
                // initialize the Moonbeam Client API here, in order to call the appropriate endpoints for this resolver
                const moonbeamClient = new MoonbeamClient(process.env.ENV_NAME!, region);

                // 2) Call the getTransaction Moonbeam AppSync API endpoint, to determine whether there is an existent transaction to update the status for.
                const retrievedTransactionsResponse: MoonbeamTransactionsResponse = await getTransaction(moonbeamClient, memberDetailsResponse.data);

                // check to see if the get transaction call was successful or not
                if (retrievedTransactionsResponse && !retrievedTransactionsResponse.errorMessage && !retrievedTransactionsResponse.errorType && retrievedTransactionsResponse.data) {
                    // filter the transactions to ensure whether this transaction is available in the DB or not.
                    const filteredTransaction = retrievedTransactionsResponse.data!.filter(transaction => transaction!.transactionId === updatedTransactionEvent.data.transaction.id
                        && transaction!.id === memberDetailsResponse.data);

                    // 3A) If there is an existent transaction, call the updateTransaction AppSync API endpoint, if needed, to update its status accordingly.
                    if (filteredTransaction!.length !== 0) {
                        // ensure that we only get one matched transaction with the appropriate information
                        if (filteredTransaction!.length === 1 &&
                            filteredTransaction[0]!.timestamp !== undefined && filteredTransaction[0]!.timestamp !== null &&
                            filteredTransaction[0]!.id != undefined && filteredTransaction[0]!.id != null &&
                            filteredTransaction[0]!.transactionStatus != undefined && filteredTransaction[0]!.transactionStatus != null) {
                            /**
                             * internally update this transaction's status accordingly (if needed).
                             *
                             * Note that we cannot update a transaction's status which has been marked as CREDITED. Once a transaction is marked
                             * as credited internally, and a person has cashed-out, there is no way we can go back and revert that status.
                             */
                            let needsToUpdateStatus = false;
                            if (requestBodyParsed["data"]["status"] === "rejected" && filteredTransaction[0]!.transactionStatus !== TransactionsStatus.Rejected) {
                                needsToUpdateStatus = true;
                            }
                            if ((requestBodyParsed["data"]["status"] === "pending_merchant_funding" ||
                                requestBodyParsed["data"]["status"] === "pending_transfer_to_publisher" ||
                                requestBodyParsed["data"]["status"] === "distributed_to_publisher" ||
                                requestBodyParsed["data"]["status"] === "distributed_to_olive") &&
                                filteredTransaction[0]!.transactionStatus !== TransactionsStatus.Processed) {
                                needsToUpdateStatus = true;
                            }
                            if (requestBodyParsed["data"]["status"] === "distributed_to_member_distributor" && filteredTransaction[0]!.transactionStatus !== TransactionsStatus.Funded) {
                                needsToUpdateStatus = true;
                            }
                            if (filteredTransaction[0]!.transactionStatus === TransactionsStatus.Credited) {
                                needsToUpdateStatus = false;
                            }

                            // update the transaction status internally accordingly.
                            if (needsToUpdateStatus) {
                                console.log(`Existent transaction ${updatedTransactionEvent.data.transaction.id}, needs to have its status updated to - ${moonbeamTransactionStatus}`);
                                const updatedTransactionResponse: MoonbeamUpdatedTransactionResponse = await moonbeamClient.updateTransaction({
                                    id: filteredTransaction[0]!.id,
                                    timestamp: filteredTransaction[0]!.timestamp,
                                    transactionId: updatedTransactionEvent.data.transaction.id,
                                    transactionStatus: moonbeamTransactionStatus === null ? TransactionsStatus.Pending : moonbeamTransactionStatus
                                });
                                // check to see if the update transaction call was successful or not
                                if (!updatedTransactionResponse || updatedTransactionResponse.errorType || updatedTransactionResponse.errorMessage || !updatedTransactionResponse.data) {
                                    console.log(`Unexpected error and/or response structure returned from the updateTransaction call ${JSON.stringify(updatedTransactionResponse)}!`);

                                    // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                                    itemFailures.push({
                                        itemIdentifier: updatedTransactionalRecord.messageId
                                    });
                                }
                            } else {
                                console.log(`Existent transaction ${updatedTransactionEvent.data.transaction.id}, already has its status up to date - ${filteredTransaction[0]!.transactionStatus}`);
                            }
                        } else {
                            console.log(`Invalid filtered/matched transaction details returned ${JSON.stringify(filteredTransaction)}`);

                            // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                            itemFailures.push({
                                itemIdentifier: updatedTransactionalRecord.messageId
                            });
                        }
                    } else {
                        /**
                         * 3B) If there is no existent transaction, then:
                         * 4) Call the GET transaction details Olive API to retrieve the additional information needed for the transaction from Olive.
                         */
                        const updatedTransactionEventResponse: UpdatedTransactionEventResponse = await getUpdatedTransactionDetails(oliveClient, updatedTransactionEvent);

                        // check to see if the updated transaction details call was successful or not
                        if (updatedTransactionEventResponse && !updatedTransactionEventResponse.errorMessage && !updatedTransactionEventResponse.errorType && updatedTransactionEventResponse.data) {
                            // 5) call the POST/transactionsAcknowledgment Moonbeam internal endpoint, to acknowledge the transaction as a qualifying offer.
                            const response: APIGatewayProxyResult = await moonbeamClient.transactionsAcknowledgment(updatedTransactionEvent);

                            // check to see if the transaction acknowledgment call was executed successfully
                            if (response.statusCode === 202 && response.body !== null && response.body !== undefined &&
                                response.body === "Transaction acknowledged!") {
                                console.log(`Successfully acknowledged transaction update for transaction - ${updatedTransactionEvent.data.transaction.id}!`);
                            } else {
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
                        } else {
                            console.log(`Transaction Details mapping through GET update transaction details call failed`);

                            // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                            itemFailures.push({
                                itemIdentifier: updatedTransactionalRecord.messageId
                            });
                        }
                    }
                } else {
                    console.log(`Transaction retrieval for member call failed`);

                    // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                    itemFailures.push({
                        itemIdentifier: updatedTransactionalRecord.messageId
                    });
                }
            } else {
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
        }
    } catch (error) {
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
        }
    }
}

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
const getMemberDetails = async (oliveClient: OliveClient, memberId: string): Promise<MemberDetailsResponse> => {
    // execute the member details retrieval call, in order to get the Moonbeam userId to be used in associating a transaction with a Moonbeam user
    const response: MemberDetailsResponse = await oliveClient.getMemberDetails(memberId);

    // check to see if the member details call was executed successfully
    if (response !== undefined && response !== null && !response.errorMessage && !response.errorType &&
        response.data !== undefined && response.data !== null && response.data.length !== 0) {
        // returns the response data with the member's external ID, to be mapped to Moonbeam's userId
        return {
            data: response.data
        }
    } else {
        const errorMessage = `Unexpected response structure returned from the member details call!`;
        console.log(errorMessage);

        // if there are errors associated with the call, just return the error message and error type from the upstream client
        return {
            data: null,
            errorType: TransactionsErrorType.ValidationError,
            errorMessage: errorMessage
        }
    }
}

/**
 * Function used to retrieve the transactions, for the current user and timestamp.
 *
 * @param moonbeamClient client used to make Moonbeam API calls
 * @param userId the user id which we are retrieving transactions for
 *
 * @returns a {@link Promise} of {@link TransactionResponse} representing the transaction information passed
 * in through the SQS message, alongside the additional transaction details retrieved through this call.
 */
const getTransaction = async (moonbeamClient: MoonbeamClient, userId: string): Promise<MoonbeamTransactionsResponse> => {
    // execute the get transactions call, to retrieve the transactions for a particular user
    const response: MoonbeamTransactionsResponse = await moonbeamClient.getTransaction({
        id: userId,
        // retrieve the current date and time to filter transactions by
        endDate: new Date().toISOString()
    });

    // check to see if the transaction details call was executed successfully
    if (response !== undefined && response !== null && !response.errorMessage  && !response.errorType &&
        response.data !== undefined && response.data !== null && response.data.length !== 0) {
        // returns the updated transaction data
        return {
            data: response.data
        }
    } else {
        // filter the error message for cases in which there are no transactions found for this user
        if (response.errorType !== undefined && response.errorType !== null && response.errorType === TransactionsErrorType.NoneOrAbsent) {
            // returns the updated transaction data
            return {
                data: []
            }
        } else {
            const errorMessage = `Unexpected response structure returned from the get transaction call!`;
            console.log(errorMessage);

            // if there are errors associated with the call, just return the error message and error type from the upstream client
            return {
                data: null,
                errorType: TransactionsErrorType.ValidationError,
                errorMessage: errorMessage
            }
        }
    }
}

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
const getUpdatedTransactionDetails = async (oliveClient: OliveClient, updatedTransactionEvent: UpdatedTransactionEvent): Promise<UpdatedTransactionEventResponse> => {
    // execute the transaction details retrieval call, in order to get additional transaction details for the incoming updated transaction event object
    const response: UpdatedTransactionEventResponse = await oliveClient.getUpdatedTransactionDetails(updatedTransactionEvent);

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
        }
    } else {
        const errorMessage = `Unexpected response structure returned from the updated transaction details call!`;
        console.log(errorMessage);

        // if there are errors associated with the call, just return the error message and error type from the upstream client
        return {
            data: null,
            errorType: TransactionsErrorType.ValidationError,
            errorMessage: errorMessage
        }
    }
}

