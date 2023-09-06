"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processReimbursements = void 0;
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const uuid_1 = require("uuid");
/**
 * ReimbursementProcessorHandler handler
 *
 * @param event the {@link SQSEvent} to be processed, containing the reimbursement
 * message information
 * @returns {@link Promise} of {@link SQSBatchResponse}
 */
const processReimbursements = async (event) => {
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
        // for each record in the incoming event, repeat the reimbursement processing steps
        for (const reimbursementRecord of event.Records) {
            /**
             * global amount to keep track of pending amounts for reimbursements for record/user
             * (made up of incoming qualifying transaction pending amounts, as well as any existent reimbursement's pending amount)
             */
            const globalCashbackPendingAmount = 0;
            /**
             * The overall reimbursement processing, will be made up of the following steps:
             *
             * 1) Call the getTransactionByStatus Moonbeam AppSync API endpoint, to retrieve all PENDING transactions,
             *    for each member corresponding to an incoming message.
             * 2) Call the GET transaction details Olive API to retrieve the updated transaction status from Olive,
             *    for each transaction that's PENDING on the Moonbeam side:
             *    - if status == rejected, then call the updateTransaction Moonbeam AppSync API endpoint, to internally
             *       update this transaction's status.
             *    - if status == distributed_to_publisher (funds have been sent to our bank account for distribution to the member),
             *      then add transaction amount (pending) to a GLOBAL AMOUNT to keep track of
             *    - if status not changed/applicable (meaning not the ones above), then do nothing with transaction as we don't care
             *      about other statuses
             *
             * If there is a GLOBAL AMOUNT (> 0), then there are several transactions which can qualify as part of a reimbursement.
             * Therefore, proceed to the steps below:
             *
             * 3) Call the getReimbursementByStatus Moonbeam AppSync API endpoint, to check if there is an existing PENDING reimbursement,
             *    for the member corresponding to the incoming message (if there are any eligible transactions).
             *    - If existing PENDING, call the updateReimbursement Moonbeam AppSync API endpoint, to add all transactions making up the
             *       global amount to it, and update reimbursement's amounts.
             *    - If non-existing PENDING, call the createReimbursement Moonbeam AppSync API endpoint, to create a new PENDING reimbursement,
             *       with all transactions making up the global amount, and the appropriate amounts.
             * 4) Call the createReimbursementEligibility and (if applicable) the updateReimbursementEligibility Moonbeam AppSync API endpoint accordingly, in
             *    order to manipulate the member's reimbursement eligibility flag. Set the status to ELIGIBLE only if:
             *    - reimbursement (created or updated) pending amount + the global amount >= $20
             */
            // convert the incoming event message body, into an eligible linked user object
            const eligibleLinkedUser = JSON.parse(reimbursementRecord.body);
            // initialize the Moonbeam Client API here, in order to call the appropriate endpoints for this resolver
            const moonbeamClient = new moonbeam_models_1.MoonbeamClient(process.env.ENV_NAME, region);
            /**
             * ________________________________________________________________________________________
             * 1) Execute step 1 - retrieve PENDING transactions for eligible incoming users
             */
            const getTransactionByStatusResponse = await moonbeamClient.getTransactionByStatus({
                id: eligibleLinkedUser.id,
                status: moonbeam_models_1.TransactionsStatus.Pending
            });
            // check to see if the transaction by status call was successful or not
            if (getTransactionByStatusResponse && !getTransactionByStatusResponse.errorMessage && !getTransactionByStatusResponse.errorType
                && getTransactionByStatusResponse.data && getTransactionByStatusResponse.data.length !== 0) {
                // the list of transactions to be considered for reimbursement (depending on the processing step)
                const transactionsForReimbursement = [];
                // loop through all the pending transactions obtained for the users eligible for reimbursements (with linked cards)
                for (const pendingTransaction of getTransactionByStatusResponse.data) {
                    // initialize the Olive Client API here, in order to call the appropriate endpoints for this handler
                    const oliveClient = new moonbeam_models_1.OliveClient(process.env.ENV_NAME, region);
                    /**
                     * ________________________________________________________________________________________
                     * 2) Execute step 2 - process the PENDING transaction accordingly
                     */
                    const transactionForReimbursement = await processPendingTransaction(itemFailures, pendingTransaction, oliveClient, moonbeamClient, reimbursementRecord, globalCashbackPendingAmount);
                    // add the processed transaction (if applicable) to the list of transactions to be considered for reimbursement
                    transactionForReimbursement && transactionsForReimbursement.push(transactionForReimbursement);
                }
                /**
                 * if there are any reimbursement eligible transactions and therefore a globalCashbackPending amount, then proceed with the next steps
                 * , otherwise move to the next reimbursement eligible user
                 */
                if (globalCashbackPendingAmount > 0 && transactionsForReimbursement.length !== 0) {
                    /**
                     * ________________________________________________________________________________________
                     * 3) Execute step 3 - process the reimbursement for the eligible user accordingly
                     */
                    const reimbursementProcessingFlag = await processReimbursement(itemFailures, moonbeamClient, reimbursementRecord, eligibleLinkedUser, globalCashbackPendingAmount, transactionsForReimbursement);
                    /**
                     * if the reimbursement was successfully processed, then proceed accordingly, otherwise do nothing as all was handled by
                     * reimbursement processing call.
                     */
                    if (reimbursementProcessingFlag) {
                        /**
                         * ________________________________________________________________________________________
                         * 4) Execute step 4 - process the reimbursement eligibility for the eligible user accordingly
                         * (so, in the future, we flag the enablement of the "cash-out" button on the front-end through the AppSync subscriptions
                         * for creating/updating a reimbursement eligibility)
                         */
                        await processReimbursementEligibility(itemFailures, moonbeamClient, reimbursementRecord, eligibleLinkedUser.id, globalCashbackPendingAmount);
                    }
                }
            }
            else {
                /**
                 * filter through the errors, since if a member does not have any pending transactions,
                 * then we won't need to reprocess this message
                 */
                if (getTransactionByStatusResponse.errorType !== moonbeam_models_1.TransactionsErrorType.NoneOrAbsent) {
                    console.log(`Unexpected error and/or response structure returned from the getTransactionByStatus call ${JSON.stringify(getTransactionByStatusResponse)}!`);
                    // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                    itemFailures.push({
                        itemIdentifier: reimbursementRecord.messageId
                    });
                }
                else {
                    console.log(`No PENDING transactions found for user ${eligibleLinkedUser.id}`);
                }
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
        console.log(`Unexpected error while processing ${JSON.stringify(event)} reimbursement event ${error}`);
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
exports.processReimbursements = processReimbursements;
/**
 * Function used to process the reimbursement eligibility for an incoming user accordingly (either by creating a new
 * eligibility flag, or by updating an existing one).
 *
 * @param itemFailures the batch response, as an array, that will be populated with errors, if any throughout the processing
 * @param moonbeamClient client used to make internal Moonbeam API calls
 * @param reimbursementRecord reimbursement record to be passed in, as an SQS record
 * @param userId eligible user id, to create and/or update an eligibility flag for
 * @param globalCashbackPendingAmount global amount to keep track of pending amounts for reimbursements for record/user
 *
 * @returns a {@link Promise} of {@link void}, since there is nothing to be returned when a reimbursement eligibility flag
 * is processed, given that any failures will be handled by adding them to the {@link SQSBatchItemFailure} array.
 */
const processReimbursementEligibility = async (itemFailures, moonbeamClient, reimbursementRecord, userId, globalCashbackPendingAmount) => {
    // attempt the creation of a new reimbursement eligibility flag for the eligible user - $20 minimum threshold for eligibility
    const createReimbursementEligibilityResponse = await moonbeamClient.createReimbursementEligibility({
        id: userId,
        eligibilityStatus: globalCashbackPendingAmount >= 20 ? moonbeam_models_1.ReimbursementEligibilityStatus.Eligible : moonbeam_models_1.ReimbursementEligibilityStatus.Ineligible,
    });
    // check to see if the reimbursement creation call was successful or not
    if (createReimbursementEligibilityResponse && !createReimbursementEligibilityResponse.errorMessage &&
        !createReimbursementEligibilityResponse.errorType && createReimbursementEligibilityResponse.data) {
        console.log(`Reimbursement Eligibility successfully created for user ${userId}`);
    }
    else {
        /**
         * filter through the errors, since if a member already has a reimbursement eligibility flag,
         * associated with then, then we will need to UPDATE it, based on the gathered information.
         * Otherwise, we will return an error accordingly.
         */
        if (createReimbursementEligibilityResponse.errorType === moonbeam_models_1.ReimbursementsErrorType.DuplicateObjectFound) {
            // update the existent reimbursement eligibility information accordingly - $20 minimum threshold for eligibility
            const updateReimbursementEligibilityResponse = await moonbeamClient.updateReimbursementEligibility({
                id: userId,
                eligibilityStatus: globalCashbackPendingAmount >= 20 ? moonbeam_models_1.ReimbursementEligibilityStatus.Eligible : moonbeam_models_1.ReimbursementEligibilityStatus.Ineligible,
            });
            // check to see if the reimbursement update call was successful or not
            if (updateReimbursementEligibilityResponse && !updateReimbursementEligibilityResponse.errorMessage &&
                !updateReimbursementEligibilityResponse.errorType && updateReimbursementEligibilityResponse.data) {
                console.log(`Reimbursement Eligibility successfully updated for user ${userId}`);
            }
            else {
                console.log(`Unexpected error and/or response structure returned from the updateReimbursementEligibility call ${JSON.stringify(updateReimbursementEligibilityResponse)}!`);
                // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                itemFailures.push({
                    itemIdentifier: reimbursementRecord.messageId
                });
            }
        }
        else {
            console.log(`Unexpected error and/or response structure returned from the createReimbursementEligibility call ${JSON.stringify(createReimbursementEligibilityResponse)}!`);
            // adds an item failure, for the SQS message which failed processing, as part of the incoming event
            itemFailures.push({
                itemIdentifier: reimbursementRecord.messageId
            });
        }
    }
};
/**
 * Function used to process the reimbursement for an incoming user accordingly (either by creating a new one,
 * or by updating an existing PENDING reimbursement object).
 *
 * @param itemFailures the batch response, as an array, that will be populated with errors, if any throughout the processing
 * @param moonbeamClient client used to make internal Moonbeam API calls
 * @param reimbursementRecord reimbursement record to be passed in, as an SQS record
 * @param eligibleLinkedUser eligible linked obtained from the reimbursement record
 * @param globalCashbackPendingAmount global amount to keep track of pending amounts for reimbursements for record/user
 * @param transactionsForReimbursement transactions eligible for reimbursement (to be included in the new and/or existing
 * reimbursement object)
 *
 * @returns {@link Promise} of a {@link Boolean} flag indicating whether a reimbursement was processed successfully or not
 * for this eligible user.
 */
const processReimbursement = async (itemFailures, moonbeamClient, reimbursementRecord, eligibleLinkedUser, globalCashbackPendingAmount, transactionsForReimbursement) => {
    // retrieve the PENDING reimbursement for the eligible user (will never be more than 1 at a time)
    const reimbursementByStatusResponse = await moonbeamClient.getReimbursementByStatus({
        id: eligibleLinkedUser.id,
        reimbursementStatus: moonbeam_models_1.ReimbursementStatus.Pending
    });
    // check to see if the reimbursement retrieval by status call was successful or not
    if (reimbursementByStatusResponse && !reimbursementByStatusResponse.errorMessage && !reimbursementByStatusResponse.errorType && reimbursementByStatusResponse.data) {
        // there is an existent PENDING reimbursement for this eligible user, which we will need to UPDATE
        const pendingMatchedReimbursement = reimbursementByStatusResponse.data[0];
        // set the globalCashbackPendingAmount accordingly (add the incoming reimbursement's pending amount to it)
        globalCashbackPendingAmount += pendingMatchedReimbursement.pendingCashbackAmount;
        // update the incoming reimbursement accordingly
        const updateReimbursementResponse = await moonbeamClient.updateReimbursement({
            id: pendingMatchedReimbursement.id,
            timestamp: pendingMatchedReimbursement.timestamp,
            pendingCashbackAmount: globalCashbackPendingAmount,
            transactions: transactionsForReimbursement
        });
        // check to see if the reimbursement update call was successful or not
        if (updateReimbursementResponse && !updateReimbursementResponse.errorMessage && !updateReimbursementResponse.errorType && updateReimbursementResponse.data) {
            console.log(`Reimbursement ${pendingMatchedReimbursement.reimbursementId} successfully updated for user ${eligibleLinkedUser.id}`);
            return true;
        }
        else {
            console.log(`Unexpected error and/or response structure returned from the updateReimbursement call ${JSON.stringify(updateReimbursementResponse)}!`);
            // adds an item failure, for the SQS message which failed processing, as part of the incoming event
            itemFailures.push({
                itemIdentifier: reimbursementRecord.messageId
            });
            return false;
        }
    }
    else {
        /**
         * filter through the errors, since if a member does not have any PENDING reimbursement,
         * then we will need to CREATE a new one, based on the gathered information. Otherwise,
         * we will return an error accordingly.
         */
        if (reimbursementByStatusResponse.errorType === moonbeam_models_1.ReimbursementsErrorType.NoneOrAbsent) {
            // create a new reimbursement accordingly
            const createReimbursementResponse = await moonbeamClient.createReimbursement({
                cardId: eligibleLinkedUser.cardId,
                creditedCashbackAmount: 0,
                currencyCode: moonbeam_models_1.CurrencyCodeType.Usd,
                id: eligibleLinkedUser.id,
                pendingCashbackAmount: globalCashbackPendingAmount,
                /**
                 * create a new temporary reimbursement ID, which will have to be modified at the time of customer credit to an Olive credit id,
                 * so we can correlate between our internal system and Olive's
                 */
                reimbursementId: (0, uuid_1.v4)(),
                reimbursementStatus: moonbeam_models_1.ReimbursementStatus.Pending,
                transactions: transactionsForReimbursement
            });
            // check to see if the reimbursement creation call was successful or not
            if (createReimbursementResponse && !createReimbursementResponse.errorMessage && !createReimbursementResponse.errorType && createReimbursementResponse.data) {
                console.log(`Reimbursement ${createReimbursementResponse.data.reimbursementId} successfully created for user ${eligibleLinkedUser.id}`);
                return true;
            }
            else {
                console.log(`Unexpected error and/or response structure returned from the createReimbursement call ${JSON.stringify(createReimbursementResponse)}!`);
                // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                itemFailures.push({
                    itemIdentifier: reimbursementRecord.messageId
                });
                return false;
            }
        }
        else {
            console.log(`Unexpected error and/or response structure returned from the getReimbursementByStatus call ${JSON.stringify(reimbursementByStatusResponse)}!`);
            // adds an item failure, for the SQS message which failed processing, as part of the incoming event
            itemFailures.push({
                itemIdentifier: reimbursementRecord.messageId
            });
            return false;
        }
    }
};
/**
 * Function used to process any incoming pending transactions, possibility eligible for reimbursement,
 * identified for a particular user.
 *
 * @param itemFailures the batch response, as an array, that will be populated with errors, if any throughout the processing
 * @param pendingTransaction pending transaction which needs to be processed, in order to determine if it is eligible for a
 * reimbursement or not
 * @param oliveClient client used to make Olive API calls
 * @param moonbeamClient client used to make internal Moonbeam API calls
 * @param reimbursementRecord reimbursement record to be passed in, as an SQS record
 * @param globalCashbackPendingAmount global amount to keep track of pending amounts for reimbursements for record/user
 *
 * @returns {@link Promise} of {@link null} or {@link ReimbursementTransactionInput} since:
 * - in case of errors and/or unprocessable transactions, there is nothing to be returned while processing, besides adding any applicable
 * errors in the list of {@link SQSBatchItemFailure}
 * - in case of identify a transaction eligible for reimbursement, we will need to return it accordingly, so we can process it later.
 */
const processPendingTransaction = async (itemFailures, pendingTransaction, oliveClient, moonbeamClient, reimbursementRecord, 
// @ts-ignore
globalCashbackPendingAmount) => {
    // retrieve the Olive status of the incoming internally PENDING transaction
    const oliveTransactionStatusResponse = await oliveClient.getTransactionStatus(pendingTransaction.transactionId);
    // check to see if the Olive transaction status call was successful or not
    if (oliveTransactionStatusResponse && !oliveTransactionStatusResponse.errorMessage && !oliveTransactionStatusResponse.errorType && oliveTransactionStatusResponse.data) {
        console.log(`this is the status of this transaction : ${oliveTransactionStatusResponse.data.oliveTransactionStatus}`);
        // decide on how to proceed for each transaction, depending on the retrieved Olive status
        switch (oliveTransactionStatusResponse.data.oliveTransactionStatus) {
            case 'rejected':
                // internally update this transaction's status to rejected accordingly
                const updatedTransactionResponse = await moonbeamClient.updateTransaction({
                    id: pendingTransaction.id,
                    timestamp: pendingTransaction.timestamp,
                    transactionId: pendingTransaction.transactionId,
                    transactionStatus: moonbeam_models_1.TransactionsStatus.Rejected
                });
                // check to see if the update transaction call was successful or not
                if (!updatedTransactionResponse || updatedTransactionResponse.errorType || updatedTransactionResponse.errorType || !updatedTransactionResponse.data) {
                    console.log(`Unexpected error and/or response structure returned from the updateTransaction call ${JSON.stringify(updatedTransactionResponse)}!`);
                    // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                    itemFailures.push({
                        itemIdentifier: reimbursementRecord.messageId
                    });
                }
                // we don't need to consider this transaction as part of the reimbursement process
                return null;
            case 'distributed_to_publisher':
                /**
                 * do some reconciliation between the amounts that we have stored for the transactions vs the ones that Olive has stored.
                 * In case these do not match up, throw an error and do not proceed with this transaction as our "books" will be off.
                 *
                 * In addition, we need to ensure that credited amounts are equal to 0 in all cases, since we won't want to partially credit
                 * customers.
                 *
                 * Note: for the reconciliation we will consider comparing amounts as is, as well as their rounded up values, up to two decimal
                 *       places.
                 */
                if (((pendingTransaction.totalAmount !== oliveTransactionStatusResponse.data.totalAmount) ||
                    (pendingTransaction.totalAmount.toFixed(2) !== oliveTransactionStatusResponse.data.totalAmount.toFixed(2))) ||
                    ((pendingTransaction.pendingCashbackAmount !== oliveTransactionStatusResponse.data.pendingCashbackAmount) ||
                        (pendingTransaction.pendingCashbackAmount.toFixed(2) !== oliveTransactionStatusResponse.data.pendingCashbackAmount.toFixed(2))) ||
                    ((pendingTransaction.creditedCashbackAmount !== oliveTransactionStatusResponse.data.creditedCashbackAmount) ||
                        (pendingTransaction.creditedCashbackAmount.toFixed(2) !== oliveTransactionStatusResponse.data.creditedCashbackAmount.toFixed(2)) ||
                        pendingTransaction.creditedCashbackAmount !== 0)) {
                    /**
                     * reconciliation failed, we will add an item failure, for the SQS message which failed processing, as part of the incoming event
                     * this will trigger a re-processing of the whole reimbursement for this user, however, it should not affect other transactions other
                     * than this one, because the other transactions will already have their statuses updated, and if not, once re-processed, they will
                     * not be added as duplicates in the list of reimbursement transactions - since that API prohibits it.
                     */
                    console.log(`Reconciliation failed for transaction ${pendingTransaction.transactionId}, with information: ${JSON.stringify(pendingTransaction)}, ${JSON.stringify(oliveTransactionStatusResponse)}`);
                    // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                    itemFailures.push({
                        itemIdentifier: reimbursementRecord.messageId
                    });
                    /**
                     * do not do anything for statuses outside the ones that we want to observe
                     * we don't need to consider this transaction as part of the reimbursement process
                     */
                    return null;
                }
                else {
                    /**
                     * reconciliation done, we can proceed to considering this transaction as eligible for reimbursement, by
                     * adding this transaction's pending amount to the incoming globalCashbackPendingAmount
                     */
                    globalCashbackPendingAmount += pendingTransaction.pendingCashbackAmount;
                    return {
                        id: pendingTransaction.id,
                        timestamp: pendingTransaction.timestamp,
                        transactionId: pendingTransaction.transactionId,
                        transactionStatus: pendingTransaction.transactionStatus
                    };
                }
            default:
                /**
                 * do not do anything for statuses outside the ones that we want to observe
                 * we don't need to consider this transaction as part of the reimbursement process
                 */
                return null;
        }
    }
    else {
        console.log(`Transaction Details mapping through GET Olive transaction status from transaction details call failed`);
        // adds an item failure, for the SQS message which failed processing, as part of the incoming event
        itemFailures.push({
            itemIdentifier: reimbursementRecord.messageId
        });
        // we don't need to consider this transaction as part of the reimbursement process
        return null;
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVpbWJ1cnNlbWVudFByb2Nlc3NvckhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL2hhbmRsZXJzL1JlaW1idXJzZW1lbnRQcm9jZXNzb3JIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLCtEQWtCbUM7QUFDbkMsK0JBQWtDO0FBRWxDOzs7Ozs7R0FNRztBQUNJLE1BQU0scUJBQXFCLEdBQUcsS0FBSyxFQUFFLEtBQWUsRUFBNkIsRUFBRTtJQUN0RixJQUFJO1FBQ0EseUNBQXlDO1FBQ3pDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVyxDQUFDO1FBRXZDOzs7Ozs7OztXQVFHO1FBQ0gsTUFBTSxZQUFZLEdBQTBCLEVBQUUsQ0FBQztRQUUvQyxtRkFBbUY7UUFDbkYsS0FBSyxNQUFNLG1CQUFtQixJQUFJLEtBQUssQ0FBQyxPQUFPLEVBQUU7WUFDN0M7OztlQUdHO1lBQ0gsTUFBTSwyQkFBMkIsR0FBVyxDQUFDLENBQUM7WUFFOUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O2VBMEJHO1lBQ0MsK0VBQStFO1lBQ25GLE1BQU0sa0JBQWtCLEdBQXVCLElBQUksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUF1QixDQUFDO1lBRTFHLHdHQUF3RztZQUN4RyxNQUFNLGNBQWMsR0FBRyxJQUFJLGdDQUFjLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFFekU7OztlQUdHO1lBQ0gsTUFBTSw4QkFBOEIsR0FBeUMsTUFBTSxjQUFjLENBQUMsc0JBQXNCLENBQUM7Z0JBQ3JILEVBQUUsRUFBRSxrQkFBa0IsQ0FBQyxFQUFFO2dCQUN6QixNQUFNLEVBQUUsb0NBQWtCLENBQUMsT0FBTzthQUNyQyxDQUFDLENBQUM7WUFDSCx1RUFBdUU7WUFDdkUsSUFBSSw4QkFBOEIsSUFBSSxDQUFDLDhCQUE4QixDQUFDLFlBQVksSUFBSSxDQUFDLDhCQUE4QixDQUFDLFNBQVM7bUJBQ3hILDhCQUE4QixDQUFDLElBQUksSUFBSSw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFFNUYsaUdBQWlHO2dCQUNqRyxNQUFNLDRCQUE0QixHQUFvQyxFQUFFLENBQUM7Z0JBRXpFLG1IQUFtSDtnQkFDbkgsS0FBSyxNQUFNLGtCQUFrQixJQUFJLDhCQUE4QixDQUFDLElBQUksRUFBRTtvQkFDbEUsb0dBQW9HO29CQUNwRyxNQUFNLFdBQVcsR0FBRyxJQUFJLDZCQUFXLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7b0JBRW5FOzs7dUJBR0c7b0JBQ0gsTUFBTSwyQkFBMkIsR0FBRyxNQUFNLHlCQUF5QixDQUFDLFlBQVksRUFBRSxrQkFBbUIsRUFBRSxXQUFXLEVBQzlHLGNBQWMsRUFBRSxtQkFBbUIsRUFBRSwyQkFBMkIsQ0FBQyxDQUFDO29CQUN0RSwrR0FBK0c7b0JBQy9HLDJCQUEyQixJQUFJLDRCQUE0QixDQUFDLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO2lCQUNqRztnQkFFRDs7O21CQUdHO2dCQUNILElBQUksMkJBQTJCLEdBQUcsQ0FBQyxJQUFJLDRCQUE0QixDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7b0JBQzlFOzs7dUJBR0c7b0JBQ0gsTUFBTSwyQkFBMkIsR0FBRyxNQUFNLG9CQUFvQixDQUFDLFlBQVksRUFBRSxjQUFjLEVBQUUsbUJBQW1CLEVBQzVHLGtCQUFrQixFQUFFLDJCQUEyQixFQUFFLDRCQUE0QixDQUFDLENBQUM7b0JBQ25GOzs7dUJBR0c7b0JBQ0gsSUFBSSwyQkFBMkIsRUFBRTt3QkFDN0I7Ozs7OzJCQUtHO3dCQUNILE1BQU0sK0JBQStCLENBQUMsWUFBWSxFQUFFLGNBQWMsRUFBRSxtQkFBbUIsRUFBRSxrQkFBa0IsQ0FBQyxFQUFFLEVBQUUsMkJBQTJCLENBQUMsQ0FBQztxQkFDaEo7aUJBQ0o7YUFDSjtpQkFBTTtnQkFDSDs7O21CQUdHO2dCQUNILElBQUksOEJBQThCLENBQUMsU0FBUyxLQUFLLHVDQUFxQixDQUFDLFlBQVksRUFBRTtvQkFDakYsT0FBTyxDQUFDLEdBQUcsQ0FBQyw0RkFBNEYsSUFBSSxDQUFDLFNBQVMsQ0FBQyw4QkFBOEIsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFFM0osbUdBQW1HO29CQUNuRyxZQUFZLENBQUMsSUFBSSxDQUFDO3dCQUNkLGNBQWMsRUFBRSxtQkFBbUIsQ0FBQyxTQUFTO3FCQUNoRCxDQUFDLENBQUM7aUJBQ047cUJBQU07b0JBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQ0FBMEMsa0JBQWtCLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztpQkFDbEY7YUFDSjtTQUNKO1FBRUQ7Ozs7O1dBS0c7UUFDSCxPQUFPO1lBQ0gsaUJBQWlCLEVBQUUsWUFBWTtTQUNsQyxDQUFBO0tBQ0o7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNaLE9BQU8sQ0FBQyxHQUFHLENBQUMscUNBQXFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLHdCQUF3QixLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBRXZHOzs7OztXQUtHO1FBQ0gsT0FBTztZQUNILGlCQUFpQixFQUFFLENBQUM7b0JBQ2hCLGdHQUFnRztvQkFDaEcsY0FBYyxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUztpQkFDN0MsQ0FBQztTQUNMLENBQUE7S0FDSjtBQUNMLENBQUMsQ0FBQTtBQTNKWSxRQUFBLHFCQUFxQix5QkEySmpDO0FBRUQ7Ozs7Ozs7Ozs7OztHQVlHO0FBQ0gsTUFBTSwrQkFBK0IsR0FBRyxLQUFLLEVBQUUsWUFBbUMsRUFBRSxjQUE4QixFQUNuRSxtQkFBOEIsRUFBRSxNQUFjLEVBQUUsMkJBQW1DLEVBQWlCLEVBQUU7SUFDakosNkhBQTZIO0lBQzdILE1BQU0sc0NBQXNDLEdBQXFDLE1BQU0sY0FBYyxDQUFDLDhCQUE4QixDQUFDO1FBQ2pJLEVBQUUsRUFBRSxNQUFNO1FBQ1YsaUJBQWlCLEVBQUUsMkJBQTJCLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxnREFBOEIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLGdEQUE4QixDQUFDLFVBQVU7S0FDN0ksQ0FBQyxDQUFDO0lBRUgsd0VBQXdFO0lBQ3hFLElBQUksc0NBQXNDLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxZQUFZO1FBQzlGLENBQUMsc0NBQXNDLENBQUMsU0FBUyxJQUFJLHNDQUFzQyxDQUFDLElBQUksRUFBRTtRQUNsRyxPQUFPLENBQUMsR0FBRyxDQUFDLDJEQUEyRCxNQUFNLEVBQUUsQ0FBQyxDQUFDO0tBQ3BGO1NBQU07UUFDSDs7OztXQUlHO1FBQ0gsSUFBSSxzQ0FBc0MsQ0FBQyxTQUFTLEtBQUsseUNBQXVCLENBQUMsb0JBQW9CLEVBQUU7WUFDbkcsZ0hBQWdIO1lBQ2hILE1BQU0sc0NBQXNDLEdBQXFDLE1BQU0sY0FBYyxDQUFDLDhCQUE4QixDQUFDO2dCQUNqSSxFQUFFLEVBQUUsTUFBTTtnQkFDVixpQkFBaUIsRUFBRSwyQkFBMkIsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLGdEQUE4QixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsZ0RBQThCLENBQUMsVUFBVTthQUM3SSxDQUFDLENBQUM7WUFFSCxzRUFBc0U7WUFDdEUsSUFBSSxzQ0FBc0MsSUFBSSxDQUFDLHNDQUFzQyxDQUFDLFlBQVk7Z0JBQzlGLENBQUMsc0NBQXNDLENBQUMsU0FBUyxJQUFJLHNDQUFzQyxDQUFDLElBQUksRUFBRTtnQkFDbEcsT0FBTyxDQUFDLEdBQUcsQ0FBQywyREFBMkQsTUFBTSxFQUFFLENBQUMsQ0FBQzthQUNwRjtpQkFBTTtnQkFDSCxPQUFPLENBQUMsR0FBRyxDQUFDLG9HQUFvRyxJQUFJLENBQUMsU0FBUyxDQUFDLHNDQUFzQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUUzSyxtR0FBbUc7Z0JBQ25HLFlBQVksQ0FBQyxJQUFJLENBQUM7b0JBQ2QsY0FBYyxFQUFFLG1CQUFtQixDQUFDLFNBQVM7aUJBQ2hELENBQUMsQ0FBQzthQUNOO1NBQ0o7YUFBTTtZQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsb0dBQW9HLElBQUksQ0FBQyxTQUFTLENBQUMsc0NBQXNDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFM0ssbUdBQW1HO1lBQ25HLFlBQVksQ0FBQyxJQUFJLENBQUM7Z0JBQ2QsY0FBYyxFQUFFLG1CQUFtQixDQUFDLFNBQVM7YUFDaEQsQ0FBQyxDQUFDO1NBQ047S0FDSjtBQUNMLENBQUMsQ0FBQTtBQUVEOzs7Ozs7Ozs7Ozs7OztHQWNHO0FBQ0gsTUFBTSxvQkFBb0IsR0FBRyxLQUFLLEVBQUUsWUFBbUMsRUFBRSxjQUE4QixFQUNuRSxtQkFBOEIsRUFBRSxrQkFBc0MsRUFDdEUsMkJBQW1DLEVBQUUsNEJBQTZELEVBQW9CLEVBQUU7SUFDeEosaUdBQWlHO0lBQ2pHLE1BQU0sNkJBQTZCLEdBQWtDLE1BQU0sY0FBYyxDQUFDLHdCQUF3QixDQUFDO1FBQy9HLEVBQUUsRUFBRSxrQkFBa0IsQ0FBQyxFQUFFO1FBQ3pCLG1CQUFtQixFQUFFLHFDQUFtQixDQUFDLE9BQU87S0FDbkQsQ0FBQyxDQUFDO0lBRUgsbUZBQW1GO0lBQ25GLElBQUksNkJBQTZCLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxZQUFZLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxTQUFTLElBQUksNkJBQTZCLENBQUMsSUFBSSxFQUFFO1FBQ2hLLGtHQUFrRztRQUNsRyxNQUFNLDJCQUEyQixHQUFrQiw2QkFBNkIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFFLENBQUM7UUFFMUYsMEdBQTBHO1FBQzFHLDJCQUEyQixJQUFJLDJCQUEyQixDQUFDLHFCQUFxQixDQUFDO1FBRWpGLGdEQUFnRDtRQUNoRCxNQUFNLDJCQUEyQixHQUEwQixNQUFNLGNBQWMsQ0FBQyxtQkFBbUIsQ0FBQztZQUNoRyxFQUFFLEVBQUUsMkJBQTJCLENBQUMsRUFBRTtZQUNsQyxTQUFTLEVBQUUsMkJBQTJCLENBQUMsU0FBUztZQUNoRCxxQkFBcUIsRUFBRSwyQkFBMkI7WUFDbEQsWUFBWSxFQUFDLDRCQUE0QjtTQUM1QyxDQUFDLENBQUM7UUFFSCxzRUFBc0U7UUFDdEUsSUFBSSwyQkFBMkIsSUFBSSxDQUFDLDJCQUEyQixDQUFDLFlBQVksSUFBSSxDQUFDLDJCQUEyQixDQUFDLFNBQVMsSUFBSSwyQkFBMkIsQ0FBQyxJQUFJLEVBQUU7WUFDeEosT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsMkJBQTJCLENBQUMsZUFBZSxrQ0FBa0Msa0JBQWtCLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNuSSxPQUFPLElBQUksQ0FBQztTQUNmO2FBQU07WUFDSCxPQUFPLENBQUMsR0FBRyxDQUFDLHlGQUF5RixJQUFJLENBQUMsU0FBUyxDQUFDLDJCQUEyQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRXJKLG1HQUFtRztZQUNuRyxZQUFZLENBQUMsSUFBSSxDQUFDO2dCQUNkLGNBQWMsRUFBRSxtQkFBbUIsQ0FBQyxTQUFTO2FBQ2hELENBQUMsQ0FBQztZQUVILE9BQU8sS0FBSyxDQUFDO1NBQ2hCO0tBQ0o7U0FBTTtRQUNIOzs7O1dBSUc7UUFDSCxJQUFJLDZCQUE2QixDQUFDLFNBQVMsS0FBSyx5Q0FBdUIsQ0FBQyxZQUFZLEVBQUU7WUFDbEYseUNBQXlDO1lBQ3pDLE1BQU0sMkJBQTJCLEdBQTBCLE1BQU0sY0FBYyxDQUFDLG1CQUFtQixDQUFDO2dCQUNoRyxNQUFNLEVBQUUsa0JBQWtCLENBQUMsTUFBTTtnQkFDakMsc0JBQXNCLEVBQUUsQ0FBQztnQkFDekIsWUFBWSxFQUFFLGtDQUFnQixDQUFDLEdBQUc7Z0JBQ2xDLEVBQUUsRUFBRSxrQkFBa0IsQ0FBQyxFQUFFO2dCQUN6QixxQkFBcUIsRUFBRSwyQkFBMkI7Z0JBQ2xEOzs7bUJBR0c7Z0JBQ0gsZUFBZSxFQUFFLElBQUEsU0FBTSxHQUFFO2dCQUN6QixtQkFBbUIsRUFBRSxxQ0FBbUIsQ0FBQyxPQUFPO2dCQUNoRCxZQUFZLEVBQUUsNEJBQTRCO2FBQzdDLENBQUMsQ0FBQztZQUVILHdFQUF3RTtZQUN4RSxJQUFJLDJCQUEyQixJQUFJLENBQUMsMkJBQTJCLENBQUMsWUFBWSxJQUFJLENBQUMsMkJBQTJCLENBQUMsU0FBUyxJQUFJLDJCQUEyQixDQUFDLElBQUksRUFBRTtnQkFDeEosT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsMkJBQTJCLENBQUMsSUFBSSxDQUFDLGVBQWUsa0NBQWtDLGtCQUFrQixDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQ3hJLE9BQU8sSUFBSSxDQUFDO2FBQ2Y7aUJBQU07Z0JBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyx5RkFBeUYsSUFBSSxDQUFDLFNBQVMsQ0FBQywyQkFBMkIsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFFckosbUdBQW1HO2dCQUNuRyxZQUFZLENBQUMsSUFBSSxDQUFDO29CQUNkLGNBQWMsRUFBRSxtQkFBbUIsQ0FBQyxTQUFTO2lCQUNoRCxDQUFDLENBQUM7Z0JBRUgsT0FBTyxLQUFLLENBQUM7YUFDaEI7U0FDSjthQUFNO1lBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyw4RkFBOEYsSUFBSSxDQUFDLFNBQVMsQ0FBQyw2QkFBNkIsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUU1SixtR0FBbUc7WUFDbkcsWUFBWSxDQUFDLElBQUksQ0FBQztnQkFDZCxjQUFjLEVBQUUsbUJBQW1CLENBQUMsU0FBUzthQUNoRCxDQUFDLENBQUM7WUFFSCxPQUFPLEtBQUssQ0FBQztTQUNoQjtLQUNKO0FBQ0wsQ0FBQyxDQUFBO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7R0FnQkc7QUFDSCxNQUFNLHlCQUF5QixHQUFHLEtBQUssRUFBRSxZQUFtQyxFQUFFLGtCQUErQyxFQUNwRixXQUF3QixFQUFFLGNBQThCLEVBQUUsbUJBQThCO0FBQ3hGLGFBQWE7QUFDYiwyQkFBbUMsRUFBaUQsRUFBRTtJQUMzSCwyRUFBMkU7SUFDM0UsTUFBTSw4QkFBOEIsR0FBcUMsTUFBTSxXQUFXLENBQUMsb0JBQW9CLENBQUMsa0JBQW1CLENBQUMsYUFBYSxDQUFDLENBQUM7SUFFbkosMEVBQTBFO0lBQzFFLElBQUksOEJBQThCLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxZQUFZLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxTQUFTLElBQUksOEJBQThCLENBQUMsSUFBSSxFQUFFO1FBQ3BLLE9BQU8sQ0FBQyxHQUFHLENBQUMsNENBQTRDLDhCQUE4QixDQUFDLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLENBQUM7UUFFdEgseUZBQXlGO1FBQ3pGLFFBQVEsOEJBQThCLENBQUMsSUFBSSxDQUFDLHNCQUFzQixFQUFFO1lBQ2hFLEtBQUssVUFBVTtnQkFDWCxzRUFBc0U7Z0JBQ3RFLE1BQU0sMEJBQTBCLEdBQXVDLE1BQU0sY0FBYyxDQUFDLGlCQUFpQixDQUFDO29CQUMxRyxFQUFFLEVBQUUsa0JBQW1CLENBQUMsRUFBRTtvQkFDMUIsU0FBUyxFQUFFLGtCQUFtQixDQUFDLFNBQVM7b0JBQ3hDLGFBQWEsRUFBRSxrQkFBbUIsQ0FBQyxhQUFhO29CQUNoRCxpQkFBaUIsRUFBRSxvQ0FBa0IsQ0FBQyxRQUFRO2lCQUNqRCxDQUFDLENBQUM7Z0JBQ0gsb0VBQW9FO2dCQUNwRSxJQUFJLENBQUMsMEJBQTBCLElBQUksMEJBQTBCLENBQUMsU0FBUyxJQUFJLDBCQUEwQixDQUFDLFNBQVMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLElBQUksRUFBRTtvQkFDakosT0FBTyxDQUFDLEdBQUcsQ0FBQyx1RkFBdUYsSUFBSSxDQUFDLFNBQVMsQ0FBQywwQkFBMEIsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFFbEosbUdBQW1HO29CQUNuRyxZQUFZLENBQUMsSUFBSSxDQUFDO3dCQUNkLGNBQWMsRUFBRSxtQkFBbUIsQ0FBQyxTQUFTO3FCQUNoRCxDQUFDLENBQUM7aUJBQ047Z0JBQ0Qsa0ZBQWtGO2dCQUNsRixPQUFPLElBQUksQ0FBQztZQUNoQixLQUFLLDBCQUEwQjtnQkFDM0I7Ozs7Ozs7OzttQkFTRztnQkFDSCxJQUFJLENBQ0ksQ0FBQyxrQkFBbUIsQ0FBQyxXQUFXLEtBQUssOEJBQThCLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQztvQkFDckYsQ0FBQyxrQkFBbUIsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLDhCQUE4QixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQzlHO29CQUNELENBQ0ksQ0FBQyxrQkFBbUIsQ0FBQyxxQkFBcUIsS0FBSyw4QkFBOEIsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUM7d0JBQ3pHLENBQUMsa0JBQW1CLENBQUMscUJBQXFCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLDhCQUE4QixDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDbEk7b0JBQ0QsQ0FDSSxDQUFDLGtCQUFtQixDQUFDLHNCQUFzQixLQUFLLDhCQUE4QixDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQzt3QkFDM0csQ0FBQyxrQkFBbUIsQ0FBQyxzQkFBc0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssOEJBQThCLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDakksa0JBQW1CLENBQUMsc0JBQXNCLEtBQUssQ0FBQyxDQUNuRCxFQUFFO29CQUNIOzs7Ozt1QkFLRztvQkFDSCxPQUFPLENBQUMsR0FBRyxDQUFDLHlDQUF5QyxrQkFBbUIsQ0FBQyxhQUFhLHVCQUF1QixJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFrQixDQUFDLEtBQUssSUFBSSxDQUFDLFNBQVMsQ0FBQyw4QkFBOEIsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFFdE0sbUdBQW1HO29CQUNuRyxZQUFZLENBQUMsSUFBSSxDQUFDO3dCQUNkLGNBQWMsRUFBRSxtQkFBbUIsQ0FBQyxTQUFTO3FCQUNoRCxDQUFDLENBQUM7b0JBRUg7Ozt1QkFHRztvQkFDSCxPQUFPLElBQUksQ0FBQztpQkFDZjtxQkFBTTtvQkFDSDs7O3VCQUdHO29CQUNILDJCQUEyQixJQUFJLGtCQUFtQixDQUFDLHFCQUFxQixDQUFDO29CQUV6RSxPQUFPO3dCQUNILEVBQUUsRUFBRSxrQkFBa0IsQ0FBQyxFQUFFO3dCQUN6QixTQUFTLEVBQUUsa0JBQWtCLENBQUMsU0FBUzt3QkFDdkMsYUFBYSxFQUFFLGtCQUFrQixDQUFDLGFBQWE7d0JBQy9DLGlCQUFpQixFQUFFLGtCQUFrQixDQUFDLGlCQUFpQjtxQkFDMUQsQ0FBQTtpQkFDSjtZQUNMO2dCQUNJOzs7bUJBR0c7Z0JBQ0gsT0FBTyxJQUFJLENBQUM7U0FDbkI7S0FDSjtTQUFNO1FBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1R0FBdUcsQ0FBQyxDQUFDO1FBRXJILG1HQUFtRztRQUNuRyxZQUFZLENBQUMsSUFBSSxDQUFDO1lBQ2QsY0FBYyxFQUFFLG1CQUFtQixDQUFDLFNBQVM7U0FDaEQsQ0FBQyxDQUFDO1FBRUgsa0ZBQWtGO1FBQ2xGLE9BQU8sSUFBSSxDQUFDO0tBQ2Y7QUFDTCxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1NRU0JhdGNoUmVzcG9uc2UsIFNRU0V2ZW50LCBTUVNSZWNvcmR9IGZyb20gXCJhd3MtbGFtYmRhXCI7XG5pbXBvcnQge1NRU0JhdGNoSXRlbUZhaWx1cmV9IGZyb20gXCJhd3MtbGFtYmRhL3RyaWdnZXIvc3FzXCI7XG5pbXBvcnQge1xuICAgIEN1cnJlbmN5Q29kZVR5cGUsXG4gICAgRWxpZ2libGVMaW5rZWRVc2VyLFxuICAgIE1vb25iZWFtQ2xpZW50LFxuICAgIE1vb25iZWFtVHJhbnNhY3Rpb25CeVN0YXR1cyxcbiAgICBNb29uYmVhbVRyYW5zYWN0aW9uc0J5U3RhdHVzUmVzcG9uc2UsXG4gICAgTW9vbmJlYW1VcGRhdGVkVHJhbnNhY3Rpb25SZXNwb25zZSxcbiAgICBPbGl2ZUNsaWVudCxcbiAgICBSZWltYnVyc2VtZW50LFxuICAgIFJlaW1idXJzZW1lbnRCeVN0YXR1c1Jlc3BvbnNlLFxuICAgIFJlaW1idXJzZW1lbnRFbGlnaWJpbGl0eVJlc3BvbnNlLCBSZWltYnVyc2VtZW50RWxpZ2liaWxpdHlTdGF0dXMsXG4gICAgUmVpbWJ1cnNlbWVudFJlc3BvbnNlLFxuICAgIFJlaW1idXJzZW1lbnRzRXJyb3JUeXBlLFxuICAgIFJlaW1idXJzZW1lbnRTdGF0dXMsXG4gICAgUmVpbWJ1cnNlbWVudFRyYW5zYWN0aW9uSW5wdXQsXG4gICAgVHJhbnNhY3Rpb25zRXJyb3JUeXBlLFxuICAgIFRyYW5zYWN0aW9uc1N0YXR1cyxcbiAgICBUcmFuc2FjdGlvblN0YXR1c0RldGFpbHNSZXNwb25zZVxufSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuaW1wb3J0IHt2NCBhcyB1dWlkdjR9IGZyb20gJ3V1aWQnO1xuXG4vKipcbiAqIFJlaW1idXJzZW1lbnRQcm9jZXNzb3JIYW5kbGVyIGhhbmRsZXJcbiAqXG4gKiBAcGFyYW0gZXZlbnQgdGhlIHtAbGluayBTUVNFdmVudH0gdG8gYmUgcHJvY2Vzc2VkLCBjb250YWluaW5nIHRoZSByZWltYnVyc2VtZW50XG4gKiBtZXNzYWdlIGluZm9ybWF0aW9uXG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIFNRU0JhdGNoUmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCBwcm9jZXNzUmVpbWJ1cnNlbWVudHMgPSBhc3luYyAoZXZlbnQ6IFNRU0V2ZW50KTogUHJvbWlzZTxTUVNCYXRjaFJlc3BvbnNlPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gcmV0cmlldmluZyB0aGUgY3VycmVudCBmdW5jdGlvbiByZWdpb25cbiAgICAgICAgY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiE7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIGluaXRpYWxpemluZyB0aGUgYmF0Y2ggcmVzcG9uc2UsIGFzIGFuIGVtcHR5IGFycmF5LCB0aGF0IHdpbGwgYmUgcG9wdWxhdGVkIHdpdGggZXJyb3JzLCBpZiBhbnkgdGhyb3VnaG91dCB0aGUgcHJvY2Vzc2luZ1xuICAgICAgICAgKlxuICAgICAgICAgKiBmb3IgdGhlIExhbWJkYSB0byBpbmRpY2F0ZSBTUVMgdGhhdCB0aGVyZSBoYXZlIGJlZW4gbm8gZmFpbHVyZXMsIGFuZCB0aHVzIGVuYWJsZSB0aGUgZGVsZXRpb24gb2YgYWxsIHByb2Nlc3NlZCBtZXNzYWdlc1xuICAgICAgICAgKiBmcm9tIHRoZSBxdWV1ZSwgd2UgaGF2ZSB0byByZXR1cm4gYW4gZW1wdHkgYmF0Y2hJdGVtRmFpbHVyZXMgYXJyYXkuIElmIHdlIHdhbnQgdG8gaW5kaWNhdGUgdGhhdCB0aGVyZSBoYXZlIGJlZW4gZXJyb3JzLFxuICAgICAgICAgKiBmb3IgZWFjaCBpbmRpdmlkdWFsIG1lc3NhZ2UsIGJhc2VkIG9uIGl0cyBJRCwgd2UgaGF2ZSB0byBhZGQgaXQgaW4gdGhlIGZpbmFsIGJhdGNoIHJlc3BvbnNlXG4gICAgICAgICAqXG4gICAgICAgICAqIEBsaW5rIGh0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9sYW1iZGEvbGF0ZXN0L2RnL3dpdGgtc3FzLmh0bWxcbiAgICAgICAgICovXG4gICAgICAgIGNvbnN0IGl0ZW1GYWlsdXJlczogU1FTQmF0Y2hJdGVtRmFpbHVyZVtdID0gW107XG5cbiAgICAgICAgLy8gZm9yIGVhY2ggcmVjb3JkIGluIHRoZSBpbmNvbWluZyBldmVudCwgcmVwZWF0IHRoZSByZWltYnVyc2VtZW50IHByb2Nlc3Npbmcgc3RlcHNcbiAgICAgICAgZm9yIChjb25zdCByZWltYnVyc2VtZW50UmVjb3JkIG9mIGV2ZW50LlJlY29yZHMpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogZ2xvYmFsIGFtb3VudCB0byBrZWVwIHRyYWNrIG9mIHBlbmRpbmcgYW1vdW50cyBmb3IgcmVpbWJ1cnNlbWVudHMgZm9yIHJlY29yZC91c2VyXG4gICAgICAgICAgICAgKiAobWFkZSB1cCBvZiBpbmNvbWluZyBxdWFsaWZ5aW5nIHRyYW5zYWN0aW9uIHBlbmRpbmcgYW1vdW50cywgYXMgd2VsbCBhcyBhbnkgZXhpc3RlbnQgcmVpbWJ1cnNlbWVudCdzIHBlbmRpbmcgYW1vdW50KVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBjb25zdCBnbG9iYWxDYXNoYmFja1BlbmRpbmdBbW91bnQ6IG51bWJlciA9IDA7XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogVGhlIG92ZXJhbGwgcmVpbWJ1cnNlbWVudCBwcm9jZXNzaW5nLCB3aWxsIGJlIG1hZGUgdXAgb2YgdGhlIGZvbGxvd2luZyBzdGVwczpcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiAxKSBDYWxsIHRoZSBnZXRUcmFuc2FjdGlvbkJ5U3RhdHVzIE1vb25iZWFtIEFwcFN5bmMgQVBJIGVuZHBvaW50LCB0byByZXRyaWV2ZSBhbGwgUEVORElORyB0cmFuc2FjdGlvbnMsXG4gICAgICAgICAgICAgKiAgICBmb3IgZWFjaCBtZW1iZXIgY29ycmVzcG9uZGluZyB0byBhbiBpbmNvbWluZyBtZXNzYWdlLlxuICAgICAgICAgICAgICogMikgQ2FsbCB0aGUgR0VUIHRyYW5zYWN0aW9uIGRldGFpbHMgT2xpdmUgQVBJIHRvIHJldHJpZXZlIHRoZSB1cGRhdGVkIHRyYW5zYWN0aW9uIHN0YXR1cyBmcm9tIE9saXZlLFxuICAgICAgICAgICAgICogICAgZm9yIGVhY2ggdHJhbnNhY3Rpb24gdGhhdCdzIFBFTkRJTkcgb24gdGhlIE1vb25iZWFtIHNpZGU6XG4gICAgICAgICAgICAgKiAgICAtIGlmIHN0YXR1cyA9PSByZWplY3RlZCwgdGhlbiBjYWxsIHRoZSB1cGRhdGVUcmFuc2FjdGlvbiBNb29uYmVhbSBBcHBTeW5jIEFQSSBlbmRwb2ludCwgdG8gaW50ZXJuYWxseVxuICAgICAgICAgICAgICogICAgICAgdXBkYXRlIHRoaXMgdHJhbnNhY3Rpb24ncyBzdGF0dXMuXG4gICAgICAgICAgICAgKiAgICAtIGlmIHN0YXR1cyA9PSBkaXN0cmlidXRlZF90b19wdWJsaXNoZXIgKGZ1bmRzIGhhdmUgYmVlbiBzZW50IHRvIG91ciBiYW5rIGFjY291bnQgZm9yIGRpc3RyaWJ1dGlvbiB0byB0aGUgbWVtYmVyKSxcbiAgICAgICAgICAgICAqICAgICAgdGhlbiBhZGQgdHJhbnNhY3Rpb24gYW1vdW50IChwZW5kaW5nKSB0byBhIEdMT0JBTCBBTU9VTlQgdG8ga2VlcCB0cmFjayBvZlxuICAgICAgICAgICAgICogICAgLSBpZiBzdGF0dXMgbm90IGNoYW5nZWQvYXBwbGljYWJsZSAobWVhbmluZyBub3QgdGhlIG9uZXMgYWJvdmUpLCB0aGVuIGRvIG5vdGhpbmcgd2l0aCB0cmFuc2FjdGlvbiBhcyB3ZSBkb24ndCBjYXJlXG4gICAgICAgICAgICAgKiAgICAgIGFib3V0IG90aGVyIHN0YXR1c2VzXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogSWYgdGhlcmUgaXMgYSBHTE9CQUwgQU1PVU5UICg+IDApLCB0aGVuIHRoZXJlIGFyZSBzZXZlcmFsIHRyYW5zYWN0aW9ucyB3aGljaCBjYW4gcXVhbGlmeSBhcyBwYXJ0IG9mIGEgcmVpbWJ1cnNlbWVudC5cbiAgICAgICAgICAgICAqIFRoZXJlZm9yZSwgcHJvY2VlZCB0byB0aGUgc3RlcHMgYmVsb3c6XG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogMykgQ2FsbCB0aGUgZ2V0UmVpbWJ1cnNlbWVudEJ5U3RhdHVzIE1vb25iZWFtIEFwcFN5bmMgQVBJIGVuZHBvaW50LCB0byBjaGVjayBpZiB0aGVyZSBpcyBhbiBleGlzdGluZyBQRU5ESU5HIHJlaW1idXJzZW1lbnQsXG4gICAgICAgICAgICAgKiAgICBmb3IgdGhlIG1lbWJlciBjb3JyZXNwb25kaW5nIHRvIHRoZSBpbmNvbWluZyBtZXNzYWdlIChpZiB0aGVyZSBhcmUgYW55IGVsaWdpYmxlIHRyYW5zYWN0aW9ucykuXG4gICAgICAgICAgICAgKiAgICAtIElmIGV4aXN0aW5nIFBFTkRJTkcsIGNhbGwgdGhlIHVwZGF0ZVJlaW1idXJzZW1lbnQgTW9vbmJlYW0gQXBwU3luYyBBUEkgZW5kcG9pbnQsIHRvIGFkZCBhbGwgdHJhbnNhY3Rpb25zIG1ha2luZyB1cCB0aGVcbiAgICAgICAgICAgICAqICAgICAgIGdsb2JhbCBhbW91bnQgdG8gaXQsIGFuZCB1cGRhdGUgcmVpbWJ1cnNlbWVudCdzIGFtb3VudHMuXG4gICAgICAgICAgICAgKiAgICAtIElmIG5vbi1leGlzdGluZyBQRU5ESU5HLCBjYWxsIHRoZSBjcmVhdGVSZWltYnVyc2VtZW50IE1vb25iZWFtIEFwcFN5bmMgQVBJIGVuZHBvaW50LCB0byBjcmVhdGUgYSBuZXcgUEVORElORyByZWltYnVyc2VtZW50LFxuICAgICAgICAgICAgICogICAgICAgd2l0aCBhbGwgdHJhbnNhY3Rpb25zIG1ha2luZyB1cCB0aGUgZ2xvYmFsIGFtb3VudCwgYW5kIHRoZSBhcHByb3ByaWF0ZSBhbW91bnRzLlxuICAgICAgICAgICAgICogNCkgQ2FsbCB0aGUgY3JlYXRlUmVpbWJ1cnNlbWVudEVsaWdpYmlsaXR5IGFuZCAoaWYgYXBwbGljYWJsZSkgdGhlIHVwZGF0ZVJlaW1idXJzZW1lbnRFbGlnaWJpbGl0eSBNb29uYmVhbSBBcHBTeW5jIEFQSSBlbmRwb2ludCBhY2NvcmRpbmdseSwgaW5cbiAgICAgICAgICAgICAqICAgIG9yZGVyIHRvIG1hbmlwdWxhdGUgdGhlIG1lbWJlcidzIHJlaW1idXJzZW1lbnQgZWxpZ2liaWxpdHkgZmxhZy4gU2V0IHRoZSBzdGF0dXMgdG8gRUxJR0lCTEUgb25seSBpZjpcbiAgICAgICAgICAgICAqICAgIC0gcmVpbWJ1cnNlbWVudCAoY3JlYXRlZCBvciB1cGRhdGVkKSBwZW5kaW5nIGFtb3VudCArIHRoZSBnbG9iYWwgYW1vdW50ID49ICQyMFxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgLy8gY29udmVydCB0aGUgaW5jb21pbmcgZXZlbnQgbWVzc2FnZSBib2R5LCBpbnRvIGFuIGVsaWdpYmxlIGxpbmtlZCB1c2VyIG9iamVjdFxuICAgICAgICAgICAgY29uc3QgZWxpZ2libGVMaW5rZWRVc2VyOiBFbGlnaWJsZUxpbmtlZFVzZXIgPSBKU09OLnBhcnNlKHJlaW1idXJzZW1lbnRSZWNvcmQuYm9keSkgYXMgRWxpZ2libGVMaW5rZWRVc2VyO1xuXG4gICAgICAgICAgICAvLyBpbml0aWFsaXplIHRoZSBNb29uYmVhbSBDbGllbnQgQVBJIGhlcmUsIGluIG9yZGVyIHRvIGNhbGwgdGhlIGFwcHJvcHJpYXRlIGVuZHBvaW50cyBmb3IgdGhpcyByZXNvbHZlclxuICAgICAgICAgICAgY29uc3QgbW9vbmJlYW1DbGllbnQgPSBuZXcgTW9vbmJlYW1DbGllbnQocHJvY2Vzcy5lbnYuRU5WX05BTUUhLCByZWdpb24pO1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIF9fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19cbiAgICAgICAgICAgICAqIDEpIEV4ZWN1dGUgc3RlcCAxIC0gcmV0cmlldmUgUEVORElORyB0cmFuc2FjdGlvbnMgZm9yIGVsaWdpYmxlIGluY29taW5nIHVzZXJzXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGNvbnN0IGdldFRyYW5zYWN0aW9uQnlTdGF0dXNSZXNwb25zZTogTW9vbmJlYW1UcmFuc2FjdGlvbnNCeVN0YXR1c1Jlc3BvbnNlID0gYXdhaXQgbW9vbmJlYW1DbGllbnQuZ2V0VHJhbnNhY3Rpb25CeVN0YXR1cyh7XG4gICAgICAgICAgICAgICAgaWQ6IGVsaWdpYmxlTGlua2VkVXNlci5pZCxcbiAgICAgICAgICAgICAgICBzdGF0dXM6IFRyYW5zYWN0aW9uc1N0YXR1cy5QZW5kaW5nXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGUgdHJhbnNhY3Rpb24gYnkgc3RhdHVzIGNhbGwgd2FzIHN1Y2Nlc3NmdWwgb3Igbm90XG4gICAgICAgICAgICBpZiAoZ2V0VHJhbnNhY3Rpb25CeVN0YXR1c1Jlc3BvbnNlICYmICFnZXRUcmFuc2FjdGlvbkJ5U3RhdHVzUmVzcG9uc2UuZXJyb3JNZXNzYWdlICYmICFnZXRUcmFuc2FjdGlvbkJ5U3RhdHVzUmVzcG9uc2UuZXJyb3JUeXBlXG4gICAgICAgICAgICAgICAgJiYgZ2V0VHJhbnNhY3Rpb25CeVN0YXR1c1Jlc3BvbnNlLmRhdGEgJiYgZ2V0VHJhbnNhY3Rpb25CeVN0YXR1c1Jlc3BvbnNlLmRhdGEubGVuZ3RoICE9PSAwKSB7XG5cbiAgICAgICAgICAgICAgICAvLyB0aGUgbGlzdCBvZiB0cmFuc2FjdGlvbnMgdG8gYmUgY29uc2lkZXJlZCBmb3IgcmVpbWJ1cnNlbWVudCAoZGVwZW5kaW5nIG9uIHRoZSBwcm9jZXNzaW5nIHN0ZXApXG4gICAgICAgICAgICAgICAgY29uc3QgdHJhbnNhY3Rpb25zRm9yUmVpbWJ1cnNlbWVudDogUmVpbWJ1cnNlbWVudFRyYW5zYWN0aW9uSW5wdXRbXSA9IFtdO1xuXG4gICAgICAgICAgICAgICAgLy8gbG9vcCB0aHJvdWdoIGFsbCB0aGUgcGVuZGluZyB0cmFuc2FjdGlvbnMgb2J0YWluZWQgZm9yIHRoZSB1c2VycyBlbGlnaWJsZSBmb3IgcmVpbWJ1cnNlbWVudHMgKHdpdGggbGlua2VkIGNhcmRzKVxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgcGVuZGluZ1RyYW5zYWN0aW9uIG9mIGdldFRyYW5zYWN0aW9uQnlTdGF0dXNSZXNwb25zZS5kYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGluaXRpYWxpemUgdGhlIE9saXZlIENsaWVudCBBUEkgaGVyZSwgaW4gb3JkZXIgdG8gY2FsbCB0aGUgYXBwcm9wcmlhdGUgZW5kcG9pbnRzIGZvciB0aGlzIGhhbmRsZXJcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgb2xpdmVDbGllbnQgPSBuZXcgT2xpdmVDbGllbnQocHJvY2Vzcy5lbnYuRU5WX05BTUUhLCByZWdpb24pO1xuXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBfX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fXG4gICAgICAgICAgICAgICAgICAgICAqIDIpIEV4ZWN1dGUgc3RlcCAyIC0gcHJvY2VzcyB0aGUgUEVORElORyB0cmFuc2FjdGlvbiBhY2NvcmRpbmdseVxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdHJhbnNhY3Rpb25Gb3JSZWltYnVyc2VtZW50ID0gYXdhaXQgcHJvY2Vzc1BlbmRpbmdUcmFuc2FjdGlvbihpdGVtRmFpbHVyZXMsIHBlbmRpbmdUcmFuc2FjdGlvbiEsIG9saXZlQ2xpZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgbW9vbmJlYW1DbGllbnQsIHJlaW1idXJzZW1lbnRSZWNvcmQsIGdsb2JhbENhc2hiYWNrUGVuZGluZ0Ftb3VudCk7XG4gICAgICAgICAgICAgICAgICAgIC8vIGFkZCB0aGUgcHJvY2Vzc2VkIHRyYW5zYWN0aW9uIChpZiBhcHBsaWNhYmxlKSB0byB0aGUgbGlzdCBvZiB0cmFuc2FjdGlvbnMgdG8gYmUgY29uc2lkZXJlZCBmb3IgcmVpbWJ1cnNlbWVudFxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbkZvclJlaW1idXJzZW1lbnQgJiYgdHJhbnNhY3Rpb25zRm9yUmVpbWJ1cnNlbWVudC5wdXNoKHRyYW5zYWN0aW9uRm9yUmVpbWJ1cnNlbWVudCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogaWYgdGhlcmUgYXJlIGFueSByZWltYnVyc2VtZW50IGVsaWdpYmxlIHRyYW5zYWN0aW9ucyBhbmQgdGhlcmVmb3JlIGEgZ2xvYmFsQ2FzaGJhY2tQZW5kaW5nIGFtb3VudCwgdGhlbiBwcm9jZWVkIHdpdGggdGhlIG5leHQgc3RlcHNcbiAgICAgICAgICAgICAgICAgKiAsIG90aGVyd2lzZSBtb3ZlIHRvIHRoZSBuZXh0IHJlaW1idXJzZW1lbnQgZWxpZ2libGUgdXNlclxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGlmIChnbG9iYWxDYXNoYmFja1BlbmRpbmdBbW91bnQgPiAwICYmIHRyYW5zYWN0aW9uc0ZvclJlaW1idXJzZW1lbnQubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBfX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fXG4gICAgICAgICAgICAgICAgICAgICAqIDMpIEV4ZWN1dGUgc3RlcCAzIC0gcHJvY2VzcyB0aGUgcmVpbWJ1cnNlbWVudCBmb3IgdGhlIGVsaWdpYmxlIHVzZXIgYWNjb3JkaW5nbHlcbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlaW1idXJzZW1lbnRQcm9jZXNzaW5nRmxhZyA9IGF3YWl0IHByb2Nlc3NSZWltYnVyc2VtZW50KGl0ZW1GYWlsdXJlcywgbW9vbmJlYW1DbGllbnQsIHJlaW1idXJzZW1lbnRSZWNvcmQsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGlnaWJsZUxpbmtlZFVzZXIsIGdsb2JhbENhc2hiYWNrUGVuZGluZ0Ftb3VudCwgdHJhbnNhY3Rpb25zRm9yUmVpbWJ1cnNlbWVudCk7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBpZiB0aGUgcmVpbWJ1cnNlbWVudCB3YXMgc3VjY2Vzc2Z1bGx5IHByb2Nlc3NlZCwgdGhlbiBwcm9jZWVkIGFjY29yZGluZ2x5LCBvdGhlcndpc2UgZG8gbm90aGluZyBhcyBhbGwgd2FzIGhhbmRsZWQgYnlcbiAgICAgICAgICAgICAgICAgICAgICogcmVpbWJ1cnNlbWVudCBwcm9jZXNzaW5nIGNhbGwuXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVpbWJ1cnNlbWVudFByb2Nlc3NpbmdGbGFnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIF9fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19cbiAgICAgICAgICAgICAgICAgICAgICAgICAqIDQpIEV4ZWN1dGUgc3RlcCA0IC0gcHJvY2VzcyB0aGUgcmVpbWJ1cnNlbWVudCBlbGlnaWJpbGl0eSBmb3IgdGhlIGVsaWdpYmxlIHVzZXIgYWNjb3JkaW5nbHlcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIChzbywgaW4gdGhlIGZ1dHVyZSwgd2UgZmxhZyB0aGUgZW5hYmxlbWVudCBvZiB0aGUgXCJjYXNoLW91dFwiIGJ1dHRvbiBvbiB0aGUgZnJvbnQtZW5kIHRocm91Z2ggdGhlIEFwcFN5bmMgc3Vic2NyaXB0aW9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgICogZm9yIGNyZWF0aW5nL3VwZGF0aW5nIGEgcmVpbWJ1cnNlbWVudCBlbGlnaWJpbGl0eSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgcHJvY2Vzc1JlaW1idXJzZW1lbnRFbGlnaWJpbGl0eShpdGVtRmFpbHVyZXMsIG1vb25iZWFtQ2xpZW50LCByZWltYnVyc2VtZW50UmVjb3JkLCBlbGlnaWJsZUxpbmtlZFVzZXIuaWQsIGdsb2JhbENhc2hiYWNrUGVuZGluZ0Ftb3VudCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIGZpbHRlciB0aHJvdWdoIHRoZSBlcnJvcnMsIHNpbmNlIGlmIGEgbWVtYmVyIGRvZXMgbm90IGhhdmUgYW55IHBlbmRpbmcgdHJhbnNhY3Rpb25zLFxuICAgICAgICAgICAgICAgICAqIHRoZW4gd2Ugd29uJ3QgbmVlZCB0byByZXByb2Nlc3MgdGhpcyBtZXNzYWdlXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgaWYgKGdldFRyYW5zYWN0aW9uQnlTdGF0dXNSZXNwb25zZS5lcnJvclR5cGUgIT09IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5Ob25lT3JBYnNlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFVuZXhwZWN0ZWQgZXJyb3IgYW5kL29yIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tIHRoZSBnZXRUcmFuc2FjdGlvbkJ5U3RhdHVzIGNhbGwgJHtKU09OLnN0cmluZ2lmeShnZXRUcmFuc2FjdGlvbkJ5U3RhdHVzUmVzcG9uc2UpfSFgKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBhZGRzIGFuIGl0ZW0gZmFpbHVyZSwgZm9yIHRoZSBTUVMgbWVzc2FnZSB3aGljaCBmYWlsZWQgcHJvY2Vzc2luZywgYXMgcGFydCBvZiB0aGUgaW5jb21pbmcgZXZlbnRcbiAgICAgICAgICAgICAgICAgICAgaXRlbUZhaWx1cmVzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbUlkZW50aWZpZXI6IHJlaW1idXJzZW1lbnRSZWNvcmQubWVzc2FnZUlkXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBObyBQRU5ESU5HIHRyYW5zYWN0aW9ucyBmb3VuZCBmb3IgdXNlciAke2VsaWdpYmxlTGlua2VkVXNlci5pZH1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogZm9yIHRoZSBMYW1iZGEgdG8gaW5kaWNhdGUgU1FTIHRoYXQgdGhlcmUgaGF2ZSBiZWVuIG5vIGZhaWx1cmVzLCBhbmQgdGh1cyBlbmFibGUgdGhlIGRlbGV0aW9uIG9mIGFsbCBwcm9jZXNzZWQgbWVzc2FnZXNcbiAgICAgICAgICogZnJvbSB0aGUgcXVldWUsIHdlIGhhdmUgdG8gcmV0dXJuIGFuIGVtcHR5IGJhdGNoSXRlbUZhaWx1cmVzIGFycmF5IGhlcmUuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBsaW5rIGh0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9sYW1iZGEvbGF0ZXN0L2RnL3dpdGgtc3FzLmh0bWxcbiAgICAgICAgICovXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBiYXRjaEl0ZW1GYWlsdXJlczogaXRlbUZhaWx1cmVzXG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmxvZyhgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBwcm9jZXNzaW5nICR7SlNPTi5zdHJpbmdpZnkoZXZlbnQpfSByZWltYnVyc2VtZW50IGV2ZW50ICR7ZXJyb3J9YCk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIHJldHVybnMgYSBiYXRjaCByZXNwb25zZSBmYWlsdXJlIGZvciB0aGUgcGFydGljdWxhciBtZXNzYWdlIElEcyB3aGljaCBmYWlsZWRcbiAgICAgICAgICogaW4gdGhpcyBjYXNlLCB0aGUgTGFtYmRhIGZ1bmN0aW9uIERPRVMgTk9UIGRlbGV0ZSB0aGUgaW5jb21pbmcgbWVzc2FnZXMgZnJvbSB0aGUgcXVldWUsIGFuZCBpdCBtYWtlcyBpdCBhdmFpbGFibGUvdmlzaWJsZSBhZ2FpblxuICAgICAgICAgKlxuICAgICAgICAgKiBAbGluayBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vbGFtYmRhL2xhdGVzdC9kZy93aXRoLXNxcy5odG1sXG4gICAgICAgICAqL1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYmF0Y2hJdGVtRmFpbHVyZXM6IFt7XG4gICAgICAgICAgICAgICAgLy8gZm9yIHRoaXMgY2FzZSwgd2Ugb25seSBwcm9jZXNzIDEgcmVjb3JkIGF0IGEgdGltZSwgd2UgbWlnaHQgbmVlZCB0byBjaGFuZ2UgdGhpcyBpbiB0aGUgZnV0dXJlXG4gICAgICAgICAgICAgICAgaXRlbUlkZW50aWZpZXI6IGV2ZW50LlJlY29yZHNbMF0ubWVzc2FnZUlkXG4gICAgICAgICAgICB9XVxuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHVzZWQgdG8gcHJvY2VzcyB0aGUgcmVpbWJ1cnNlbWVudCBlbGlnaWJpbGl0eSBmb3IgYW4gaW5jb21pbmcgdXNlciBhY2NvcmRpbmdseSAoZWl0aGVyIGJ5IGNyZWF0aW5nIGEgbmV3XG4gKiBlbGlnaWJpbGl0eSBmbGFnLCBvciBieSB1cGRhdGluZyBhbiBleGlzdGluZyBvbmUpLlxuICpcbiAqIEBwYXJhbSBpdGVtRmFpbHVyZXMgdGhlIGJhdGNoIHJlc3BvbnNlLCBhcyBhbiBhcnJheSwgdGhhdCB3aWxsIGJlIHBvcHVsYXRlZCB3aXRoIGVycm9ycywgaWYgYW55IHRocm91Z2hvdXQgdGhlIHByb2Nlc3NpbmdcbiAqIEBwYXJhbSBtb29uYmVhbUNsaWVudCBjbGllbnQgdXNlZCB0byBtYWtlIGludGVybmFsIE1vb25iZWFtIEFQSSBjYWxsc1xuICogQHBhcmFtIHJlaW1idXJzZW1lbnRSZWNvcmQgcmVpbWJ1cnNlbWVudCByZWNvcmQgdG8gYmUgcGFzc2VkIGluLCBhcyBhbiBTUVMgcmVjb3JkXG4gKiBAcGFyYW0gdXNlcklkIGVsaWdpYmxlIHVzZXIgaWQsIHRvIGNyZWF0ZSBhbmQvb3IgdXBkYXRlIGFuIGVsaWdpYmlsaXR5IGZsYWcgZm9yXG4gKiBAcGFyYW0gZ2xvYmFsQ2FzaGJhY2tQZW5kaW5nQW1vdW50IGdsb2JhbCBhbW91bnQgdG8ga2VlcCB0cmFjayBvZiBwZW5kaW5nIGFtb3VudHMgZm9yIHJlaW1idXJzZW1lbnRzIGZvciByZWNvcmQvdXNlclxuICpcbiAqIEByZXR1cm5zIGEge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayB2b2lkfSwgc2luY2UgdGhlcmUgaXMgbm90aGluZyB0byBiZSByZXR1cm5lZCB3aGVuIGEgcmVpbWJ1cnNlbWVudCBlbGlnaWJpbGl0eSBmbGFnXG4gKiBpcyBwcm9jZXNzZWQsIGdpdmVuIHRoYXQgYW55IGZhaWx1cmVzIHdpbGwgYmUgaGFuZGxlZCBieSBhZGRpbmcgdGhlbSB0byB0aGUge0BsaW5rIFNRU0JhdGNoSXRlbUZhaWx1cmV9IGFycmF5LlxuICovXG5jb25zdCBwcm9jZXNzUmVpbWJ1cnNlbWVudEVsaWdpYmlsaXR5ID0gYXN5bmMgKGl0ZW1GYWlsdXJlczogU1FTQmF0Y2hJdGVtRmFpbHVyZVtdLCBtb29uYmVhbUNsaWVudDogTW9vbmJlYW1DbGllbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlaW1idXJzZW1lbnRSZWNvcmQ6IFNRU1JlY29yZCwgdXNlcklkOiBzdHJpbmcsIGdsb2JhbENhc2hiYWNrUGVuZGluZ0Ftb3VudDogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgLy8gYXR0ZW1wdCB0aGUgY3JlYXRpb24gb2YgYSBuZXcgcmVpbWJ1cnNlbWVudCBlbGlnaWJpbGl0eSBmbGFnIGZvciB0aGUgZWxpZ2libGUgdXNlciAtICQyMCBtaW5pbXVtIHRocmVzaG9sZCBmb3IgZWxpZ2liaWxpdHlcbiAgICBjb25zdCBjcmVhdGVSZWltYnVyc2VtZW50RWxpZ2liaWxpdHlSZXNwb25zZTogUmVpbWJ1cnNlbWVudEVsaWdpYmlsaXR5UmVzcG9uc2UgPSBhd2FpdCBtb29uYmVhbUNsaWVudC5jcmVhdGVSZWltYnVyc2VtZW50RWxpZ2liaWxpdHkoe1xuICAgICAgICBpZDogdXNlcklkLFxuICAgICAgICBlbGlnaWJpbGl0eVN0YXR1czogZ2xvYmFsQ2FzaGJhY2tQZW5kaW5nQW1vdW50ID49IDIwID8gUmVpbWJ1cnNlbWVudEVsaWdpYmlsaXR5U3RhdHVzLkVsaWdpYmxlIDogUmVpbWJ1cnNlbWVudEVsaWdpYmlsaXR5U3RhdHVzLkluZWxpZ2libGUsXG4gICAgfSk7XG5cbiAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIHJlaW1idXJzZW1lbnQgY3JlYXRpb24gY2FsbCB3YXMgc3VjY2Vzc2Z1bCBvciBub3RcbiAgICBpZiAoY3JlYXRlUmVpbWJ1cnNlbWVudEVsaWdpYmlsaXR5UmVzcG9uc2UgJiYgIWNyZWF0ZVJlaW1idXJzZW1lbnRFbGlnaWJpbGl0eVJlc3BvbnNlLmVycm9yTWVzc2FnZSAmJlxuICAgICAgICAhY3JlYXRlUmVpbWJ1cnNlbWVudEVsaWdpYmlsaXR5UmVzcG9uc2UuZXJyb3JUeXBlICYmIGNyZWF0ZVJlaW1idXJzZW1lbnRFbGlnaWJpbGl0eVJlc3BvbnNlLmRhdGEpIHtcbiAgICAgICAgY29uc29sZS5sb2coYFJlaW1idXJzZW1lbnQgRWxpZ2liaWxpdHkgc3VjY2Vzc2Z1bGx5IGNyZWF0ZWQgZm9yIHVzZXIgJHt1c2VySWR9YCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIGZpbHRlciB0aHJvdWdoIHRoZSBlcnJvcnMsIHNpbmNlIGlmIGEgbWVtYmVyIGFscmVhZHkgaGFzIGEgcmVpbWJ1cnNlbWVudCBlbGlnaWJpbGl0eSBmbGFnLFxuICAgICAgICAgKiBhc3NvY2lhdGVkIHdpdGggdGhlbiwgdGhlbiB3ZSB3aWxsIG5lZWQgdG8gVVBEQVRFIGl0LCBiYXNlZCBvbiB0aGUgZ2F0aGVyZWQgaW5mb3JtYXRpb24uXG4gICAgICAgICAqIE90aGVyd2lzZSwgd2Ugd2lsbCByZXR1cm4gYW4gZXJyb3IgYWNjb3JkaW5nbHkuXG4gICAgICAgICAqL1xuICAgICAgICBpZiAoY3JlYXRlUmVpbWJ1cnNlbWVudEVsaWdpYmlsaXR5UmVzcG9uc2UuZXJyb3JUeXBlID09PSBSZWltYnVyc2VtZW50c0Vycm9yVHlwZS5EdXBsaWNhdGVPYmplY3RGb3VuZCkge1xuICAgICAgICAgICAgLy8gdXBkYXRlIHRoZSBleGlzdGVudCByZWltYnVyc2VtZW50IGVsaWdpYmlsaXR5IGluZm9ybWF0aW9uIGFjY29yZGluZ2x5IC0gJDIwIG1pbmltdW0gdGhyZXNob2xkIGZvciBlbGlnaWJpbGl0eVxuICAgICAgICAgICAgY29uc3QgdXBkYXRlUmVpbWJ1cnNlbWVudEVsaWdpYmlsaXR5UmVzcG9uc2U6IFJlaW1idXJzZW1lbnRFbGlnaWJpbGl0eVJlc3BvbnNlID0gYXdhaXQgbW9vbmJlYW1DbGllbnQudXBkYXRlUmVpbWJ1cnNlbWVudEVsaWdpYmlsaXR5KHtcbiAgICAgICAgICAgICAgICBpZDogdXNlcklkLFxuICAgICAgICAgICAgICAgIGVsaWdpYmlsaXR5U3RhdHVzOiBnbG9iYWxDYXNoYmFja1BlbmRpbmdBbW91bnQgPj0gMjAgPyBSZWltYnVyc2VtZW50RWxpZ2liaWxpdHlTdGF0dXMuRWxpZ2libGUgOiBSZWltYnVyc2VtZW50RWxpZ2liaWxpdHlTdGF0dXMuSW5lbGlnaWJsZSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIHJlaW1idXJzZW1lbnQgdXBkYXRlIGNhbGwgd2FzIHN1Y2Nlc3NmdWwgb3Igbm90XG4gICAgICAgICAgICBpZiAodXBkYXRlUmVpbWJ1cnNlbWVudEVsaWdpYmlsaXR5UmVzcG9uc2UgJiYgIXVwZGF0ZVJlaW1idXJzZW1lbnRFbGlnaWJpbGl0eVJlc3BvbnNlLmVycm9yTWVzc2FnZSAmJlxuICAgICAgICAgICAgICAgICF1cGRhdGVSZWltYnVyc2VtZW50RWxpZ2liaWxpdHlSZXNwb25zZS5lcnJvclR5cGUgJiYgdXBkYXRlUmVpbWJ1cnNlbWVudEVsaWdpYmlsaXR5UmVzcG9uc2UuZGF0YSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBSZWltYnVyc2VtZW50IEVsaWdpYmlsaXR5IHN1Y2Nlc3NmdWxseSB1cGRhdGVkIGZvciB1c2VyICR7dXNlcklkfWApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgVW5leHBlY3RlZCBlcnJvciBhbmQvb3IgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gdGhlIHVwZGF0ZVJlaW1idXJzZW1lbnRFbGlnaWJpbGl0eSBjYWxsICR7SlNPTi5zdHJpbmdpZnkodXBkYXRlUmVpbWJ1cnNlbWVudEVsaWdpYmlsaXR5UmVzcG9uc2UpfSFgKTtcblxuICAgICAgICAgICAgICAgIC8vIGFkZHMgYW4gaXRlbSBmYWlsdXJlLCBmb3IgdGhlIFNRUyBtZXNzYWdlIHdoaWNoIGZhaWxlZCBwcm9jZXNzaW5nLCBhcyBwYXJ0IG9mIHRoZSBpbmNvbWluZyBldmVudFxuICAgICAgICAgICAgICAgIGl0ZW1GYWlsdXJlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbUlkZW50aWZpZXI6IHJlaW1idXJzZW1lbnRSZWNvcmQubWVzc2FnZUlkXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgVW5leHBlY3RlZCBlcnJvciBhbmQvb3IgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gdGhlIGNyZWF0ZVJlaW1idXJzZW1lbnRFbGlnaWJpbGl0eSBjYWxsICR7SlNPTi5zdHJpbmdpZnkoY3JlYXRlUmVpbWJ1cnNlbWVudEVsaWdpYmlsaXR5UmVzcG9uc2UpfSFgKTtcblxuICAgICAgICAgICAgLy8gYWRkcyBhbiBpdGVtIGZhaWx1cmUsIGZvciB0aGUgU1FTIG1lc3NhZ2Ugd2hpY2ggZmFpbGVkIHByb2Nlc3NpbmcsIGFzIHBhcnQgb2YgdGhlIGluY29taW5nIGV2ZW50XG4gICAgICAgICAgICBpdGVtRmFpbHVyZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgaXRlbUlkZW50aWZpZXI6IHJlaW1idXJzZW1lbnRSZWNvcmQubWVzc2FnZUlkXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB1c2VkIHRvIHByb2Nlc3MgdGhlIHJlaW1idXJzZW1lbnQgZm9yIGFuIGluY29taW5nIHVzZXIgYWNjb3JkaW5nbHkgKGVpdGhlciBieSBjcmVhdGluZyBhIG5ldyBvbmUsXG4gKiBvciBieSB1cGRhdGluZyBhbiBleGlzdGluZyBQRU5ESU5HIHJlaW1idXJzZW1lbnQgb2JqZWN0KS5cbiAqXG4gKiBAcGFyYW0gaXRlbUZhaWx1cmVzIHRoZSBiYXRjaCByZXNwb25zZSwgYXMgYW4gYXJyYXksIHRoYXQgd2lsbCBiZSBwb3B1bGF0ZWQgd2l0aCBlcnJvcnMsIGlmIGFueSB0aHJvdWdob3V0IHRoZSBwcm9jZXNzaW5nXG4gKiBAcGFyYW0gbW9vbmJlYW1DbGllbnQgY2xpZW50IHVzZWQgdG8gbWFrZSBpbnRlcm5hbCBNb29uYmVhbSBBUEkgY2FsbHNcbiAqIEBwYXJhbSByZWltYnVyc2VtZW50UmVjb3JkIHJlaW1idXJzZW1lbnQgcmVjb3JkIHRvIGJlIHBhc3NlZCBpbiwgYXMgYW4gU1FTIHJlY29yZFxuICogQHBhcmFtIGVsaWdpYmxlTGlua2VkVXNlciBlbGlnaWJsZSBsaW5rZWQgb2J0YWluZWQgZnJvbSB0aGUgcmVpbWJ1cnNlbWVudCByZWNvcmRcbiAqIEBwYXJhbSBnbG9iYWxDYXNoYmFja1BlbmRpbmdBbW91bnQgZ2xvYmFsIGFtb3VudCB0byBrZWVwIHRyYWNrIG9mIHBlbmRpbmcgYW1vdW50cyBmb3IgcmVpbWJ1cnNlbWVudHMgZm9yIHJlY29yZC91c2VyXG4gKiBAcGFyYW0gdHJhbnNhY3Rpb25zRm9yUmVpbWJ1cnNlbWVudCB0cmFuc2FjdGlvbnMgZWxpZ2libGUgZm9yIHJlaW1idXJzZW1lbnQgKHRvIGJlIGluY2x1ZGVkIGluIHRoZSBuZXcgYW5kL29yIGV4aXN0aW5nXG4gKiByZWltYnVyc2VtZW50IG9iamVjdClcbiAqXG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2YgYSB7QGxpbmsgQm9vbGVhbn0gZmxhZyBpbmRpY2F0aW5nIHdoZXRoZXIgYSByZWltYnVyc2VtZW50IHdhcyBwcm9jZXNzZWQgc3VjY2Vzc2Z1bGx5IG9yIG5vdFxuICogZm9yIHRoaXMgZWxpZ2libGUgdXNlci5cbiAqL1xuY29uc3QgcHJvY2Vzc1JlaW1idXJzZW1lbnQgPSBhc3luYyAoaXRlbUZhaWx1cmVzOiBTUVNCYXRjaEl0ZW1GYWlsdXJlW10sIG1vb25iZWFtQ2xpZW50OiBNb29uYmVhbUNsaWVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlaW1idXJzZW1lbnRSZWNvcmQ6IFNRU1JlY29yZCwgZWxpZ2libGVMaW5rZWRVc2VyOiBFbGlnaWJsZUxpbmtlZFVzZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBnbG9iYWxDYXNoYmFja1BlbmRpbmdBbW91bnQ6IG51bWJlciwgdHJhbnNhY3Rpb25zRm9yUmVpbWJ1cnNlbWVudDogUmVpbWJ1cnNlbWVudFRyYW5zYWN0aW9uSW5wdXRbXSk6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICAgIC8vIHJldHJpZXZlIHRoZSBQRU5ESU5HIHJlaW1idXJzZW1lbnQgZm9yIHRoZSBlbGlnaWJsZSB1c2VyICh3aWxsIG5ldmVyIGJlIG1vcmUgdGhhbiAxIGF0IGEgdGltZSlcbiAgICBjb25zdCByZWltYnVyc2VtZW50QnlTdGF0dXNSZXNwb25zZTogUmVpbWJ1cnNlbWVudEJ5U3RhdHVzUmVzcG9uc2UgPSBhd2FpdCBtb29uYmVhbUNsaWVudC5nZXRSZWltYnVyc2VtZW50QnlTdGF0dXMoe1xuICAgICAgICBpZDogZWxpZ2libGVMaW5rZWRVc2VyLmlkLFxuICAgICAgICByZWltYnVyc2VtZW50U3RhdHVzOiBSZWltYnVyc2VtZW50U3RhdHVzLlBlbmRpbmdcbiAgICB9KTtcblxuICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGUgcmVpbWJ1cnNlbWVudCByZXRyaWV2YWwgYnkgc3RhdHVzIGNhbGwgd2FzIHN1Y2Nlc3NmdWwgb3Igbm90XG4gICAgaWYgKHJlaW1idXJzZW1lbnRCeVN0YXR1c1Jlc3BvbnNlICYmICFyZWltYnVyc2VtZW50QnlTdGF0dXNSZXNwb25zZS5lcnJvck1lc3NhZ2UgJiYgIXJlaW1idXJzZW1lbnRCeVN0YXR1c1Jlc3BvbnNlLmVycm9yVHlwZSAmJiByZWltYnVyc2VtZW50QnlTdGF0dXNSZXNwb25zZS5kYXRhKSB7XG4gICAgICAgIC8vIHRoZXJlIGlzIGFuIGV4aXN0ZW50IFBFTkRJTkcgcmVpbWJ1cnNlbWVudCBmb3IgdGhpcyBlbGlnaWJsZSB1c2VyLCB3aGljaCB3ZSB3aWxsIG5lZWQgdG8gVVBEQVRFXG4gICAgICAgIGNvbnN0IHBlbmRpbmdNYXRjaGVkUmVpbWJ1cnNlbWVudDogUmVpbWJ1cnNlbWVudCA9IHJlaW1idXJzZW1lbnRCeVN0YXR1c1Jlc3BvbnNlLmRhdGFbMF0hO1xuXG4gICAgICAgIC8vIHNldCB0aGUgZ2xvYmFsQ2FzaGJhY2tQZW5kaW5nQW1vdW50IGFjY29yZGluZ2x5IChhZGQgdGhlIGluY29taW5nIHJlaW1idXJzZW1lbnQncyBwZW5kaW5nIGFtb3VudCB0byBpdClcbiAgICAgICAgZ2xvYmFsQ2FzaGJhY2tQZW5kaW5nQW1vdW50ICs9IHBlbmRpbmdNYXRjaGVkUmVpbWJ1cnNlbWVudC5wZW5kaW5nQ2FzaGJhY2tBbW91bnQ7XG5cbiAgICAgICAgLy8gdXBkYXRlIHRoZSBpbmNvbWluZyByZWltYnVyc2VtZW50IGFjY29yZGluZ2x5XG4gICAgICAgIGNvbnN0IHVwZGF0ZVJlaW1idXJzZW1lbnRSZXNwb25zZTogUmVpbWJ1cnNlbWVudFJlc3BvbnNlID0gYXdhaXQgbW9vbmJlYW1DbGllbnQudXBkYXRlUmVpbWJ1cnNlbWVudCh7XG4gICAgICAgICAgICBpZDogcGVuZGluZ01hdGNoZWRSZWltYnVyc2VtZW50LmlkLFxuICAgICAgICAgICAgdGltZXN0YW1wOiBwZW5kaW5nTWF0Y2hlZFJlaW1idXJzZW1lbnQudGltZXN0YW1wLFxuICAgICAgICAgICAgcGVuZGluZ0Nhc2hiYWNrQW1vdW50OiBnbG9iYWxDYXNoYmFja1BlbmRpbmdBbW91bnQsXG4gICAgICAgICAgICB0cmFuc2FjdGlvbnM6dHJhbnNhY3Rpb25zRm9yUmVpbWJ1cnNlbWVudFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIHJlaW1idXJzZW1lbnQgdXBkYXRlIGNhbGwgd2FzIHN1Y2Nlc3NmdWwgb3Igbm90XG4gICAgICAgIGlmICh1cGRhdGVSZWltYnVyc2VtZW50UmVzcG9uc2UgJiYgIXVwZGF0ZVJlaW1idXJzZW1lbnRSZXNwb25zZS5lcnJvck1lc3NhZ2UgJiYgIXVwZGF0ZVJlaW1idXJzZW1lbnRSZXNwb25zZS5lcnJvclR5cGUgJiYgdXBkYXRlUmVpbWJ1cnNlbWVudFJlc3BvbnNlLmRhdGEpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBSZWltYnVyc2VtZW50ICR7cGVuZGluZ01hdGNoZWRSZWltYnVyc2VtZW50LnJlaW1idXJzZW1lbnRJZH0gc3VjY2Vzc2Z1bGx5IHVwZGF0ZWQgZm9yIHVzZXIgJHtlbGlnaWJsZUxpbmtlZFVzZXIuaWR9YCk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBVbmV4cGVjdGVkIGVycm9yIGFuZC9vciByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSB0aGUgdXBkYXRlUmVpbWJ1cnNlbWVudCBjYWxsICR7SlNPTi5zdHJpbmdpZnkodXBkYXRlUmVpbWJ1cnNlbWVudFJlc3BvbnNlKX0hYCk7XG5cbiAgICAgICAgICAgIC8vIGFkZHMgYW4gaXRlbSBmYWlsdXJlLCBmb3IgdGhlIFNRUyBtZXNzYWdlIHdoaWNoIGZhaWxlZCBwcm9jZXNzaW5nLCBhcyBwYXJ0IG9mIHRoZSBpbmNvbWluZyBldmVudFxuICAgICAgICAgICAgaXRlbUZhaWx1cmVzLnB1c2goe1xuICAgICAgICAgICAgICAgIGl0ZW1JZGVudGlmaWVyOiByZWltYnVyc2VtZW50UmVjb3JkLm1lc3NhZ2VJZFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBmaWx0ZXIgdGhyb3VnaCB0aGUgZXJyb3JzLCBzaW5jZSBpZiBhIG1lbWJlciBkb2VzIG5vdCBoYXZlIGFueSBQRU5ESU5HIHJlaW1idXJzZW1lbnQsXG4gICAgICAgICAqIHRoZW4gd2Ugd2lsbCBuZWVkIHRvIENSRUFURSBhIG5ldyBvbmUsIGJhc2VkIG9uIHRoZSBnYXRoZXJlZCBpbmZvcm1hdGlvbi4gT3RoZXJ3aXNlLFxuICAgICAgICAgKiB3ZSB3aWxsIHJldHVybiBhbiBlcnJvciBhY2NvcmRpbmdseS5cbiAgICAgICAgICovXG4gICAgICAgIGlmIChyZWltYnVyc2VtZW50QnlTdGF0dXNSZXNwb25zZS5lcnJvclR5cGUgPT09IFJlaW1idXJzZW1lbnRzRXJyb3JUeXBlLk5vbmVPckFic2VudCkge1xuICAgICAgICAgICAgLy8gY3JlYXRlIGEgbmV3IHJlaW1idXJzZW1lbnQgYWNjb3JkaW5nbHlcbiAgICAgICAgICAgIGNvbnN0IGNyZWF0ZVJlaW1idXJzZW1lbnRSZXNwb25zZTogUmVpbWJ1cnNlbWVudFJlc3BvbnNlID0gYXdhaXQgbW9vbmJlYW1DbGllbnQuY3JlYXRlUmVpbWJ1cnNlbWVudCh7XG4gICAgICAgICAgICAgICAgY2FyZElkOiBlbGlnaWJsZUxpbmtlZFVzZXIuY2FyZElkLFxuICAgICAgICAgICAgICAgIGNyZWRpdGVkQ2FzaGJhY2tBbW91bnQ6IDAsXG4gICAgICAgICAgICAgICAgY3VycmVuY3lDb2RlOiBDdXJyZW5jeUNvZGVUeXBlLlVzZCxcbiAgICAgICAgICAgICAgICBpZDogZWxpZ2libGVMaW5rZWRVc2VyLmlkLFxuICAgICAgICAgICAgICAgIHBlbmRpbmdDYXNoYmFja0Ftb3VudDogZ2xvYmFsQ2FzaGJhY2tQZW5kaW5nQW1vdW50LFxuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIGNyZWF0ZSBhIG5ldyB0ZW1wb3JhcnkgcmVpbWJ1cnNlbWVudCBJRCwgd2hpY2ggd2lsbCBoYXZlIHRvIGJlIG1vZGlmaWVkIGF0IHRoZSB0aW1lIG9mIGN1c3RvbWVyIGNyZWRpdCB0byBhbiBPbGl2ZSBjcmVkaXQgaWQsXG4gICAgICAgICAgICAgICAgICogc28gd2UgY2FuIGNvcnJlbGF0ZSBiZXR3ZWVuIG91ciBpbnRlcm5hbCBzeXN0ZW0gYW5kIE9saXZlJ3NcbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICByZWltYnVyc2VtZW50SWQ6IHV1aWR2NCgpLFxuICAgICAgICAgICAgICAgIHJlaW1idXJzZW1lbnRTdGF0dXM6IFJlaW1idXJzZW1lbnRTdGF0dXMuUGVuZGluZyxcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbnM6IHRyYW5zYWN0aW9uc0ZvclJlaW1idXJzZW1lbnRcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIHJlaW1idXJzZW1lbnQgY3JlYXRpb24gY2FsbCB3YXMgc3VjY2Vzc2Z1bCBvciBub3RcbiAgICAgICAgICAgIGlmIChjcmVhdGVSZWltYnVyc2VtZW50UmVzcG9uc2UgJiYgIWNyZWF0ZVJlaW1idXJzZW1lbnRSZXNwb25zZS5lcnJvck1lc3NhZ2UgJiYgIWNyZWF0ZVJlaW1idXJzZW1lbnRSZXNwb25zZS5lcnJvclR5cGUgJiYgY3JlYXRlUmVpbWJ1cnNlbWVudFJlc3BvbnNlLmRhdGEpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgUmVpbWJ1cnNlbWVudCAke2NyZWF0ZVJlaW1idXJzZW1lbnRSZXNwb25zZS5kYXRhLnJlaW1idXJzZW1lbnRJZH0gc3VjY2Vzc2Z1bGx5IGNyZWF0ZWQgZm9yIHVzZXIgJHtlbGlnaWJsZUxpbmtlZFVzZXIuaWR9YCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBVbmV4cGVjdGVkIGVycm9yIGFuZC9vciByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSB0aGUgY3JlYXRlUmVpbWJ1cnNlbWVudCBjYWxsICR7SlNPTi5zdHJpbmdpZnkoY3JlYXRlUmVpbWJ1cnNlbWVudFJlc3BvbnNlKX0hYCk7XG5cbiAgICAgICAgICAgICAgICAvLyBhZGRzIGFuIGl0ZW0gZmFpbHVyZSwgZm9yIHRoZSBTUVMgbWVzc2FnZSB3aGljaCBmYWlsZWQgcHJvY2Vzc2luZywgYXMgcGFydCBvZiB0aGUgaW5jb21pbmcgZXZlbnRcbiAgICAgICAgICAgICAgICBpdGVtRmFpbHVyZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1JZGVudGlmaWVyOiByZWltYnVyc2VtZW50UmVjb3JkLm1lc3NhZ2VJZFxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYFVuZXhwZWN0ZWQgZXJyb3IgYW5kL29yIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tIHRoZSBnZXRSZWltYnVyc2VtZW50QnlTdGF0dXMgY2FsbCAke0pTT04uc3RyaW5naWZ5KHJlaW1idXJzZW1lbnRCeVN0YXR1c1Jlc3BvbnNlKX0hYCk7XG5cbiAgICAgICAgICAgIC8vIGFkZHMgYW4gaXRlbSBmYWlsdXJlLCBmb3IgdGhlIFNRUyBtZXNzYWdlIHdoaWNoIGZhaWxlZCBwcm9jZXNzaW5nLCBhcyBwYXJ0IG9mIHRoZSBpbmNvbWluZyBldmVudFxuICAgICAgICAgICAgaXRlbUZhaWx1cmVzLnB1c2goe1xuICAgICAgICAgICAgICAgIGl0ZW1JZGVudGlmaWVyOiByZWltYnVyc2VtZW50UmVjb3JkLm1lc3NhZ2VJZFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB1c2VkIHRvIHByb2Nlc3MgYW55IGluY29taW5nIHBlbmRpbmcgdHJhbnNhY3Rpb25zLCBwb3NzaWJpbGl0eSBlbGlnaWJsZSBmb3IgcmVpbWJ1cnNlbWVudCxcbiAqIGlkZW50aWZpZWQgZm9yIGEgcGFydGljdWxhciB1c2VyLlxuICpcbiAqIEBwYXJhbSBpdGVtRmFpbHVyZXMgdGhlIGJhdGNoIHJlc3BvbnNlLCBhcyBhbiBhcnJheSwgdGhhdCB3aWxsIGJlIHBvcHVsYXRlZCB3aXRoIGVycm9ycywgaWYgYW55IHRocm91Z2hvdXQgdGhlIHByb2Nlc3NpbmdcbiAqIEBwYXJhbSBwZW5kaW5nVHJhbnNhY3Rpb24gcGVuZGluZyB0cmFuc2FjdGlvbiB3aGljaCBuZWVkcyB0byBiZSBwcm9jZXNzZWQsIGluIG9yZGVyIHRvIGRldGVybWluZSBpZiBpdCBpcyBlbGlnaWJsZSBmb3IgYVxuICogcmVpbWJ1cnNlbWVudCBvciBub3RcbiAqIEBwYXJhbSBvbGl2ZUNsaWVudCBjbGllbnQgdXNlZCB0byBtYWtlIE9saXZlIEFQSSBjYWxsc1xuICogQHBhcmFtIG1vb25iZWFtQ2xpZW50IGNsaWVudCB1c2VkIHRvIG1ha2UgaW50ZXJuYWwgTW9vbmJlYW0gQVBJIGNhbGxzXG4gKiBAcGFyYW0gcmVpbWJ1cnNlbWVudFJlY29yZCByZWltYnVyc2VtZW50IHJlY29yZCB0byBiZSBwYXNzZWQgaW4sIGFzIGFuIFNRUyByZWNvcmRcbiAqIEBwYXJhbSBnbG9iYWxDYXNoYmFja1BlbmRpbmdBbW91bnQgZ2xvYmFsIGFtb3VudCB0byBrZWVwIHRyYWNrIG9mIHBlbmRpbmcgYW1vdW50cyBmb3IgcmVpbWJ1cnNlbWVudHMgZm9yIHJlY29yZC91c2VyXG4gKlxuICogQHJldHVybnMge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBudWxsfSBvciB7QGxpbmsgUmVpbWJ1cnNlbWVudFRyYW5zYWN0aW9uSW5wdXR9IHNpbmNlOlxuICogLSBpbiBjYXNlIG9mIGVycm9ycyBhbmQvb3IgdW5wcm9jZXNzYWJsZSB0cmFuc2FjdGlvbnMsIHRoZXJlIGlzIG5vdGhpbmcgdG8gYmUgcmV0dXJuZWQgd2hpbGUgcHJvY2Vzc2luZywgYmVzaWRlcyBhZGRpbmcgYW55IGFwcGxpY2FibGVcbiAqIGVycm9ycyBpbiB0aGUgbGlzdCBvZiB7QGxpbmsgU1FTQmF0Y2hJdGVtRmFpbHVyZX1cbiAqIC0gaW4gY2FzZSBvZiBpZGVudGlmeSBhIHRyYW5zYWN0aW9uIGVsaWdpYmxlIGZvciByZWltYnVyc2VtZW50LCB3ZSB3aWxsIG5lZWQgdG8gcmV0dXJuIGl0IGFjY29yZGluZ2x5LCBzbyB3ZSBjYW4gcHJvY2VzcyBpdCBsYXRlci5cbiAqL1xuY29uc3QgcHJvY2Vzc1BlbmRpbmdUcmFuc2FjdGlvbiA9IGFzeW5jIChpdGVtRmFpbHVyZXM6IFNRU0JhdGNoSXRlbUZhaWx1cmVbXSwgcGVuZGluZ1RyYW5zYWN0aW9uOiBNb29uYmVhbVRyYW5zYWN0aW9uQnlTdGF0dXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9saXZlQ2xpZW50OiBPbGl2ZUNsaWVudCwgbW9vbmJlYW1DbGllbnQ6IE1vb25iZWFtQ2xpZW50LCByZWltYnVyc2VtZW50UmVjb3JkOiBTUVNSZWNvcmQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2xvYmFsQ2FzaGJhY2tQZW5kaW5nQW1vdW50OiBudW1iZXIpOiBQcm9taXNlPFJlaW1idXJzZW1lbnRUcmFuc2FjdGlvbklucHV0IHwgbnVsbD4gPT4ge1xuICAgIC8vIHJldHJpZXZlIHRoZSBPbGl2ZSBzdGF0dXMgb2YgdGhlIGluY29taW5nIGludGVybmFsbHkgUEVORElORyB0cmFuc2FjdGlvblxuICAgIGNvbnN0IG9saXZlVHJhbnNhY3Rpb25TdGF0dXNSZXNwb25zZTogVHJhbnNhY3Rpb25TdGF0dXNEZXRhaWxzUmVzcG9uc2UgPSBhd2FpdCBvbGl2ZUNsaWVudC5nZXRUcmFuc2FjdGlvblN0YXR1cyhwZW5kaW5nVHJhbnNhY3Rpb24hLnRyYW5zYWN0aW9uSWQpO1xuXG4gICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSBPbGl2ZSB0cmFuc2FjdGlvbiBzdGF0dXMgY2FsbCB3YXMgc3VjY2Vzc2Z1bCBvciBub3RcbiAgICBpZiAob2xpdmVUcmFuc2FjdGlvblN0YXR1c1Jlc3BvbnNlICYmICFvbGl2ZVRyYW5zYWN0aW9uU3RhdHVzUmVzcG9uc2UuZXJyb3JNZXNzYWdlICYmICFvbGl2ZVRyYW5zYWN0aW9uU3RhdHVzUmVzcG9uc2UuZXJyb3JUeXBlICYmIG9saXZlVHJhbnNhY3Rpb25TdGF0dXNSZXNwb25zZS5kYXRhKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGB0aGlzIGlzIHRoZSBzdGF0dXMgb2YgdGhpcyB0cmFuc2FjdGlvbiA6ICR7b2xpdmVUcmFuc2FjdGlvblN0YXR1c1Jlc3BvbnNlLmRhdGEub2xpdmVUcmFuc2FjdGlvblN0YXR1c31gKTtcblxuICAgICAgICAvLyBkZWNpZGUgb24gaG93IHRvIHByb2NlZWQgZm9yIGVhY2ggdHJhbnNhY3Rpb24sIGRlcGVuZGluZyBvbiB0aGUgcmV0cmlldmVkIE9saXZlIHN0YXR1c1xuICAgICAgICBzd2l0Y2ggKG9saXZlVHJhbnNhY3Rpb25TdGF0dXNSZXNwb25zZS5kYXRhLm9saXZlVHJhbnNhY3Rpb25TdGF0dXMpIHtcbiAgICAgICAgICAgIGNhc2UgJ3JlamVjdGVkJzpcbiAgICAgICAgICAgICAgICAvLyBpbnRlcm5hbGx5IHVwZGF0ZSB0aGlzIHRyYW5zYWN0aW9uJ3Mgc3RhdHVzIHRvIHJlamVjdGVkIGFjY29yZGluZ2x5XG4gICAgICAgICAgICAgICAgY29uc3QgdXBkYXRlZFRyYW5zYWN0aW9uUmVzcG9uc2U6IE1vb25iZWFtVXBkYXRlZFRyYW5zYWN0aW9uUmVzcG9uc2UgPSBhd2FpdCBtb29uYmVhbUNsaWVudC51cGRhdGVUcmFuc2FjdGlvbih7XG4gICAgICAgICAgICAgICAgICAgIGlkOiBwZW5kaW5nVHJhbnNhY3Rpb24hLmlkLFxuICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IHBlbmRpbmdUcmFuc2FjdGlvbiEudGltZXN0YW1wLFxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbklkOiBwZW5kaW5nVHJhbnNhY3Rpb24hLnRyYW5zYWN0aW9uSWQsXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uU3RhdHVzOiBUcmFuc2FjdGlvbnNTdGF0dXMuUmVqZWN0ZWRcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIHVwZGF0ZSB0cmFuc2FjdGlvbiBjYWxsIHdhcyBzdWNjZXNzZnVsIG9yIG5vdFxuICAgICAgICAgICAgICAgIGlmICghdXBkYXRlZFRyYW5zYWN0aW9uUmVzcG9uc2UgfHwgdXBkYXRlZFRyYW5zYWN0aW9uUmVzcG9uc2UuZXJyb3JUeXBlIHx8IHVwZGF0ZWRUcmFuc2FjdGlvblJlc3BvbnNlLmVycm9yVHlwZSB8fCAhdXBkYXRlZFRyYW5zYWN0aW9uUmVzcG9uc2UuZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgVW5leHBlY3RlZCBlcnJvciBhbmQvb3IgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gdGhlIHVwZGF0ZVRyYW5zYWN0aW9uIGNhbGwgJHtKU09OLnN0cmluZ2lmeSh1cGRhdGVkVHJhbnNhY3Rpb25SZXNwb25zZSl9IWApO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGFkZHMgYW4gaXRlbSBmYWlsdXJlLCBmb3IgdGhlIFNRUyBtZXNzYWdlIHdoaWNoIGZhaWxlZCBwcm9jZXNzaW5nLCBhcyBwYXJ0IG9mIHRoZSBpbmNvbWluZyBldmVudFxuICAgICAgICAgICAgICAgICAgICBpdGVtRmFpbHVyZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtSWRlbnRpZmllcjogcmVpbWJ1cnNlbWVudFJlY29yZC5tZXNzYWdlSWRcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIHdlIGRvbid0IG5lZWQgdG8gY29uc2lkZXIgdGhpcyB0cmFuc2FjdGlvbiBhcyBwYXJ0IG9mIHRoZSByZWltYnVyc2VtZW50IHByb2Nlc3NcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIGNhc2UgJ2Rpc3RyaWJ1dGVkX3RvX3B1Ymxpc2hlcic6XG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogZG8gc29tZSByZWNvbmNpbGlhdGlvbiBiZXR3ZWVuIHRoZSBhbW91bnRzIHRoYXQgd2UgaGF2ZSBzdG9yZWQgZm9yIHRoZSB0cmFuc2FjdGlvbnMgdnMgdGhlIG9uZXMgdGhhdCBPbGl2ZSBoYXMgc3RvcmVkLlxuICAgICAgICAgICAgICAgICAqIEluIGNhc2UgdGhlc2UgZG8gbm90IG1hdGNoIHVwLCB0aHJvdyBhbiBlcnJvciBhbmQgZG8gbm90IHByb2NlZWQgd2l0aCB0aGlzIHRyYW5zYWN0aW9uIGFzIG91ciBcImJvb2tzXCIgd2lsbCBiZSBvZmYuXG4gICAgICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAgICAgKiBJbiBhZGRpdGlvbiwgd2UgbmVlZCB0byBlbnN1cmUgdGhhdCBjcmVkaXRlZCBhbW91bnRzIGFyZSBlcXVhbCB0byAwIGluIGFsbCBjYXNlcywgc2luY2Ugd2Ugd29uJ3Qgd2FudCB0byBwYXJ0aWFsbHkgY3JlZGl0XG4gICAgICAgICAgICAgICAgICogY3VzdG9tZXJzLlxuICAgICAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgICAgICogTm90ZTogZm9yIHRoZSByZWNvbmNpbGlhdGlvbiB3ZSB3aWxsIGNvbnNpZGVyIGNvbXBhcmluZyBhbW91bnRzIGFzIGlzLCBhcyB3ZWxsIGFzIHRoZWlyIHJvdW5kZWQgdXAgdmFsdWVzLCB1cCB0byB0d28gZGVjaW1hbFxuICAgICAgICAgICAgICAgICAqICAgICAgIHBsYWNlcy5cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBpZiAoKFxuICAgICAgICAgICAgICAgICAgICAgICAgKHBlbmRpbmdUcmFuc2FjdGlvbiEudG90YWxBbW91bnQgIT09IG9saXZlVHJhbnNhY3Rpb25TdGF0dXNSZXNwb25zZS5kYXRhLnRvdGFsQW1vdW50KSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgKHBlbmRpbmdUcmFuc2FjdGlvbiEudG90YWxBbW91bnQudG9GaXhlZCgyKSAhPT0gb2xpdmVUcmFuc2FjdGlvblN0YXR1c1Jlc3BvbnNlLmRhdGEudG90YWxBbW91bnQudG9GaXhlZCgyKSlcbiAgICAgICAgICAgICAgICAgICAgKSB8fFxuICAgICAgICAgICAgICAgICAgICAoXG4gICAgICAgICAgICAgICAgICAgICAgICAocGVuZGluZ1RyYW5zYWN0aW9uIS5wZW5kaW5nQ2FzaGJhY2tBbW91bnQgIT09IG9saXZlVHJhbnNhY3Rpb25TdGF0dXNSZXNwb25zZS5kYXRhLnBlbmRpbmdDYXNoYmFja0Ftb3VudCkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIChwZW5kaW5nVHJhbnNhY3Rpb24hLnBlbmRpbmdDYXNoYmFja0Ftb3VudC50b0ZpeGVkKDIpICE9PSBvbGl2ZVRyYW5zYWN0aW9uU3RhdHVzUmVzcG9uc2UuZGF0YS5wZW5kaW5nQ2FzaGJhY2tBbW91bnQudG9GaXhlZCgyKSlcbiAgICAgICAgICAgICAgICAgICAgKSB8fFxuICAgICAgICAgICAgICAgICAgICAoXG4gICAgICAgICAgICAgICAgICAgICAgICAocGVuZGluZ1RyYW5zYWN0aW9uIS5jcmVkaXRlZENhc2hiYWNrQW1vdW50ICE9PSBvbGl2ZVRyYW5zYWN0aW9uU3RhdHVzUmVzcG9uc2UuZGF0YS5jcmVkaXRlZENhc2hiYWNrQW1vdW50KSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgKHBlbmRpbmdUcmFuc2FjdGlvbiEuY3JlZGl0ZWRDYXNoYmFja0Ftb3VudC50b0ZpeGVkKDIpICE9PSBvbGl2ZVRyYW5zYWN0aW9uU3RhdHVzUmVzcG9uc2UuZGF0YS5jcmVkaXRlZENhc2hiYWNrQW1vdW50LnRvRml4ZWQoMikpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICBwZW5kaW5nVHJhbnNhY3Rpb24hLmNyZWRpdGVkQ2FzaGJhY2tBbW91bnQgIT09IDBcbiAgICAgICAgICAgICAgICAgICAgKSkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogcmVjb25jaWxpYXRpb24gZmFpbGVkLCB3ZSB3aWxsIGFkZCBhbiBpdGVtIGZhaWx1cmUsIGZvciB0aGUgU1FTIG1lc3NhZ2Ugd2hpY2ggZmFpbGVkIHByb2Nlc3NpbmcsIGFzIHBhcnQgb2YgdGhlIGluY29taW5nIGV2ZW50XG4gICAgICAgICAgICAgICAgICAgICAqIHRoaXMgd2lsbCB0cmlnZ2VyIGEgcmUtcHJvY2Vzc2luZyBvZiB0aGUgd2hvbGUgcmVpbWJ1cnNlbWVudCBmb3IgdGhpcyB1c2VyLCBob3dldmVyLCBpdCBzaG91bGQgbm90IGFmZmVjdCBvdGhlciB0cmFuc2FjdGlvbnMgb3RoZXJcbiAgICAgICAgICAgICAgICAgICAgICogdGhhbiB0aGlzIG9uZSwgYmVjYXVzZSB0aGUgb3RoZXIgdHJhbnNhY3Rpb25zIHdpbGwgYWxyZWFkeSBoYXZlIHRoZWlyIHN0YXR1c2VzIHVwZGF0ZWQsIGFuZCBpZiBub3QsIG9uY2UgcmUtcHJvY2Vzc2VkLCB0aGV5IHdpbGxcbiAgICAgICAgICAgICAgICAgICAgICogbm90IGJlIGFkZGVkIGFzIGR1cGxpY2F0ZXMgaW4gdGhlIGxpc3Qgb2YgcmVpbWJ1cnNlbWVudCB0cmFuc2FjdGlvbnMgLSBzaW5jZSB0aGF0IEFQSSBwcm9oaWJpdHMgaXQuXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgUmVjb25jaWxpYXRpb24gZmFpbGVkIGZvciB0cmFuc2FjdGlvbiAke3BlbmRpbmdUcmFuc2FjdGlvbiEudHJhbnNhY3Rpb25JZH0sIHdpdGggaW5mb3JtYXRpb246ICR7SlNPTi5zdHJpbmdpZnkocGVuZGluZ1RyYW5zYWN0aW9uKX0sICR7SlNPTi5zdHJpbmdpZnkob2xpdmVUcmFuc2FjdGlvblN0YXR1c1Jlc3BvbnNlKX1gKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBhZGRzIGFuIGl0ZW0gZmFpbHVyZSwgZm9yIHRoZSBTUVMgbWVzc2FnZSB3aGljaCBmYWlsZWQgcHJvY2Vzc2luZywgYXMgcGFydCBvZiB0aGUgaW5jb21pbmcgZXZlbnRcbiAgICAgICAgICAgICAgICAgICAgaXRlbUZhaWx1cmVzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbUlkZW50aWZpZXI6IHJlaW1idXJzZW1lbnRSZWNvcmQubWVzc2FnZUlkXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBkbyBub3QgZG8gYW55dGhpbmcgZm9yIHN0YXR1c2VzIG91dHNpZGUgdGhlIG9uZXMgdGhhdCB3ZSB3YW50IHRvIG9ic2VydmVcbiAgICAgICAgICAgICAgICAgICAgICogd2UgZG9uJ3QgbmVlZCB0byBjb25zaWRlciB0aGlzIHRyYW5zYWN0aW9uIGFzIHBhcnQgb2YgdGhlIHJlaW1idXJzZW1lbnQgcHJvY2Vzc1xuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIHJlY29uY2lsaWF0aW9uIGRvbmUsIHdlIGNhbiBwcm9jZWVkIHRvIGNvbnNpZGVyaW5nIHRoaXMgdHJhbnNhY3Rpb24gYXMgZWxpZ2libGUgZm9yIHJlaW1idXJzZW1lbnQsIGJ5XG4gICAgICAgICAgICAgICAgICAgICAqIGFkZGluZyB0aGlzIHRyYW5zYWN0aW9uJ3MgcGVuZGluZyBhbW91bnQgdG8gdGhlIGluY29taW5nIGdsb2JhbENhc2hiYWNrUGVuZGluZ0Ftb3VudFxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgZ2xvYmFsQ2FzaGJhY2tQZW5kaW5nQW1vdW50ICs9IHBlbmRpbmdUcmFuc2FjdGlvbiEucGVuZGluZ0Nhc2hiYWNrQW1vdW50O1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogcGVuZGluZ1RyYW5zYWN0aW9uLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiBwZW5kaW5nVHJhbnNhY3Rpb24udGltZXN0YW1wLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25JZDogcGVuZGluZ1RyYW5zYWN0aW9uLnRyYW5zYWN0aW9uSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvblN0YXR1czogcGVuZGluZ1RyYW5zYWN0aW9uLnRyYW5zYWN0aW9uU3RhdHVzXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIGRvIG5vdCBkbyBhbnl0aGluZyBmb3Igc3RhdHVzZXMgb3V0c2lkZSB0aGUgb25lcyB0aGF0IHdlIHdhbnQgdG8gb2JzZXJ2ZVxuICAgICAgICAgICAgICAgICAqIHdlIGRvbid0IG5lZWQgdG8gY29uc2lkZXIgdGhpcyB0cmFuc2FjdGlvbiBhcyBwYXJ0IG9mIHRoZSByZWltYnVyc2VtZW50IHByb2Nlc3NcbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBUcmFuc2FjdGlvbiBEZXRhaWxzIG1hcHBpbmcgdGhyb3VnaCBHRVQgT2xpdmUgdHJhbnNhY3Rpb24gc3RhdHVzIGZyb20gdHJhbnNhY3Rpb24gZGV0YWlscyBjYWxsIGZhaWxlZGApO1xuXG4gICAgICAgIC8vIGFkZHMgYW4gaXRlbSBmYWlsdXJlLCBmb3IgdGhlIFNRUyBtZXNzYWdlIHdoaWNoIGZhaWxlZCBwcm9jZXNzaW5nLCBhcyBwYXJ0IG9mIHRoZSBpbmNvbWluZyBldmVudFxuICAgICAgICBpdGVtRmFpbHVyZXMucHVzaCh7XG4gICAgICAgICAgICBpdGVtSWRlbnRpZmllcjogcmVpbWJ1cnNlbWVudFJlY29yZC5tZXNzYWdlSWRcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gd2UgZG9uJ3QgbmVlZCB0byBjb25zaWRlciB0aGlzIHRyYW5zYWN0aW9uIGFzIHBhcnQgb2YgdGhlIHJlaW1idXJzZW1lbnQgcHJvY2Vzc1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG4iXX0=