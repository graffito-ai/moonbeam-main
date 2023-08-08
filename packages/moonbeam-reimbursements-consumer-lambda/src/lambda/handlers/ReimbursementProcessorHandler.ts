import {SQSBatchResponse, SQSEvent, SQSRecord} from "aws-lambda";
import {SQSBatchItemFailure} from "aws-lambda/trigger/sqs";
import {
    CurrencyCodeType,
    EligibleLinkedUser,
    MoonbeamClient,
    MoonbeamTransactionByStatus,
    MoonbeamTransactionsByStatusResponse,
    MoonbeamUpdatedTransactionResponse,
    OliveClient,
    Reimbursement,
    ReimbursementByStatusResponse,
    ReimbursementEligibilityResponse, ReimbursementEligibilityStatus,
    ReimbursementResponse,
    ReimbursementsErrorType,
    ReimbursementStatus,
    ReimbursementTransactionInput,
    TransactionsErrorType,
    TransactionsStatus,
    TransactionStatusDetailsResponse
} from "@moonbeam/moonbeam-models";

/**
 * ReimbursementProcessorHandler handler
 *
 * @param event the {@link SQSEvent} to be processed, containing the reimbursement
 * message information
 * @returns {@link Promise} of {@link SQSBatchResponse}
 */
export const processReimbursements = async (event: SQSEvent): Promise<SQSBatchResponse> => {
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

        // for each record in the incoming event, repeat the reimbursement processing steps
        for (const reimbursementRecord of event.Records) {
            /**
             * global amount to keep track of pending amounts for reimbursements for record/user
             * (made up of incoming qualifying transaction pending amounts, as well as any existent reimbursement's pending amount)
             */
            const globalCashbackPendingAmount: number = 0;

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
            const eligibleLinkedUser: EligibleLinkedUser = JSON.parse(reimbursementRecord.body) as EligibleLinkedUser;

            // initialize the Moonbeam Client API here, in order to call the appropriate endpoints for this resolver
            const moonbeamClient = new MoonbeamClient(process.env.ENV_NAME!, region);

            /**
             * ________________________________________________________________________________________
             * 1) Execute step 1 - retrieve PENDING transactions for eligible incoming users
             */
            const getTransactionByStatusResponse: MoonbeamTransactionsByStatusResponse = await moonbeamClient.getTransactionByStatus({
                id: eligibleLinkedUser.id,
                status: TransactionsStatus.Pending
            });
            // check to see if the transaction by status call was successful or not
            if (getTransactionByStatusResponse && !getTransactionByStatusResponse.errorMessage && !getTransactionByStatusResponse.errorType
                && getTransactionByStatusResponse.data && getTransactionByStatusResponse.data.length !== 0) {

                // the list of transactions to be considered for reimbursement (depending on the processing step)
                const transactionsForReimbursement: ReimbursementTransactionInput[] = [];

                // loop through all the pending transactions obtained for the users eligible for reimbursements (with linked cards)
                for (const pendingTransaction of getTransactionByStatusResponse.data) {
                    // initialize the Olive Client API here, in order to call the appropriate endpoints for this handler
                    const oliveClient = new OliveClient(process.env.ENV_NAME!, region);

                    /**
                     * ________________________________________________________________________________________
                     * 2) Execute step 2 - process the PENDING transaction accordingly
                     */
                    const transactionForReimbursement = await processPendingTransaction(itemFailures, pendingTransaction!, oliveClient,
                        moonbeamClient, reimbursementRecord, globalCashbackPendingAmount);
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
                    const reimbursementProcessingFlag = await processReimbursement(itemFailures, moonbeamClient, reimbursementRecord,
                        eligibleLinkedUser, globalCashbackPendingAmount, transactionsForReimbursement);
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
            } else {
                /**
                 * filter through the errors, since if a member does not have any pending transactions,
                 * then we won't need to reprocess this message
                 */
                if (getTransactionByStatusResponse.errorType !== TransactionsErrorType.NoneOrAbsent) {
                    console.log(`Unexpected error and/or response structure returned from the getTransactionByStatus call ${JSON.stringify(getTransactionByStatusResponse)}!`);

                    // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                    itemFailures.push({
                        itemIdentifier: reimbursementRecord.messageId
                    });
                } else {
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
        }
    } catch (error) {
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
        }
    }
}

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
const processReimbursementEligibility = async (itemFailures: SQSBatchItemFailure[], moonbeamClient: MoonbeamClient,
                                               reimbursementRecord: SQSRecord, userId: string, globalCashbackPendingAmount: number): Promise<void> => {
    // attempt the creation of a new reimbursement eligibility flag for the eligible user - $20 minimum threshold for eligibility
    const createReimbursementEligibilityResponse: ReimbursementEligibilityResponse = await moonbeamClient.createReimbursementEligibility({
        id: userId,
        eligibilityStatus: globalCashbackPendingAmount >= 20 ? ReimbursementEligibilityStatus.Eligible : ReimbursementEligibilityStatus.Ineligible,
    });

    // check to see if the reimbursement creation call was successful or not
    if (createReimbursementEligibilityResponse && !createReimbursementEligibilityResponse.errorMessage &&
        !createReimbursementEligibilityResponse.errorType && createReimbursementEligibilityResponse.data) {
        console.log(`Reimbursement Eligibility successfully created for user ${userId}`);
    } else {
        /**
         * filter through the errors, since if a member already has a reimbursement eligibility flag,
         * associated with then, then we will need to UPDATE it, based on the gathered information.
         * Otherwise, we will return an error accordingly.
         */
        if (createReimbursementEligibilityResponse.errorType === ReimbursementsErrorType.DuplicateObjectFound) {
            // update the existent reimbursement eligibility information accordingly - $20 minimum threshold for eligibility
            const updateReimbursementEligibilityResponse: ReimbursementEligibilityResponse = await moonbeamClient.updateReimbursementEligibility({
                id: userId,
                eligibilityStatus: globalCashbackPendingAmount >= 20 ? ReimbursementEligibilityStatus.Eligible : ReimbursementEligibilityStatus.Ineligible,
            });

            // check to see if the reimbursement update call was successful or not
            if (updateReimbursementEligibilityResponse && !updateReimbursementEligibilityResponse.errorMessage &&
                !updateReimbursementEligibilityResponse.errorType && updateReimbursementEligibilityResponse.data) {
                console.log(`Reimbursement Eligibility successfully updated for user ${userId}`);
            } else {
                console.log(`Unexpected error and/or response structure returned from the updateReimbursementEligibility call ${JSON.stringify(updateReimbursementEligibilityResponse)}!`);

                // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                itemFailures.push({
                    itemIdentifier: reimbursementRecord.messageId
                });
            }
        } else {
            console.log(`Unexpected error and/or response structure returned from the createReimbursementEligibility call ${JSON.stringify(createReimbursementEligibilityResponse)}!`);

            // adds an item failure, for the SQS message which failed processing, as part of the incoming event
            itemFailures.push({
                itemIdentifier: reimbursementRecord.messageId
            });
        }
    }
}

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
const processReimbursement = async (itemFailures: SQSBatchItemFailure[], moonbeamClient: MoonbeamClient,
                                    reimbursementRecord: SQSRecord, eligibleLinkedUser: EligibleLinkedUser,
                                    globalCashbackPendingAmount: number, transactionsForReimbursement: ReimbursementTransactionInput[]): Promise<boolean> => {
    // retrieve the PENDING reimbursement for the eligible user (will never be more than 1 at a time)
    const reimbursementByStatusResponse: ReimbursementByStatusResponse = await moonbeamClient.getReimbursementByStatus({
        id: eligibleLinkedUser.id,
        reimbursementStatus: ReimbursementStatus.Pending
    });

    // check to see if the reimbursement retrieval by status call was successful or not
    if (reimbursementByStatusResponse && !reimbursementByStatusResponse.errorMessage && !reimbursementByStatusResponse.errorType && reimbursementByStatusResponse.data) {
        // there is an existent PENDING reimbursement for this eligible user, which we will need to UPDATE
        const pendingMatchedReimbursement: Reimbursement = reimbursementByStatusResponse.data[0]!;

        // set the globalCashbackPendingAmount accordingly (add the incoming reimbursement's pending amount to it)
        globalCashbackPendingAmount += pendingMatchedReimbursement.pendingCashbackAmount;

        // update the incoming reimbursement accordingly
        const updateReimbursementResponse: ReimbursementResponse = await moonbeamClient.updateReimbursement({
            id: pendingMatchedReimbursement.id,
            timestamp: pendingMatchedReimbursement.timestamp,
            pendingCashbackAmount: globalCashbackPendingAmount,
            transactions:transactionsForReimbursement
        });

        // check to see if the reimbursement update call was successful or not
        if (updateReimbursementResponse && !updateReimbursementResponse.errorMessage && !updateReimbursementResponse.errorType && updateReimbursementResponse.data) {
            console.log(`Reimbursement ${pendingMatchedReimbursement.reimbursementId} successfully updated for user ${eligibleLinkedUser.id}`);
            return true;
        } else {
            console.log(`Unexpected error and/or response structure returned from the updateReimbursement call ${JSON.stringify(updateReimbursementResponse)}!`);

            // adds an item failure, for the SQS message which failed processing, as part of the incoming event
            itemFailures.push({
                itemIdentifier: reimbursementRecord.messageId
            });

            return false;
        }
    } else {
        /**
         * filter through the errors, since if a member does not have any PENDING reimbursement,
         * then we will need to CREATE a new one, based on the gathered information. Otherwise,
         * we will return an error accordingly.
         */
        if (reimbursementByStatusResponse.errorType === ReimbursementsErrorType.NoneOrAbsent) {
            // create a new reimbursement accordingly
            const createReimbursementResponse: ReimbursementResponse = await moonbeamClient.createReimbursement({
                cardId: eligibleLinkedUser.cardId,
                creditedCashbackAmount: 0,
                currencyCode: CurrencyCodeType.Usd,
                id: eligibleLinkedUser.id,
                pendingCashbackAmount: globalCashbackPendingAmount,
                /**
                 * create a new temporary reimbursement ID, which will have to be modified at the time of customer credit to an Olive credit id,
                 * so we can correlate between our internal system and Olive's
                 */
                reimbursementId: 'temp_reimbursement_id',
                reimbursementStatus: ReimbursementStatus.Pending,
                transactions: transactionsForReimbursement
            });

            // check to see if the reimbursement creation call was successful or not
            if (createReimbursementResponse && !createReimbursementResponse.errorMessage && !createReimbursementResponse.errorType && createReimbursementResponse.data) {
                console.log(`Reimbursement ${createReimbursementResponse.data.reimbursementId} successfully created for user ${eligibleLinkedUser.id}`);
                return true;
            } else {
                console.log(`Unexpected error and/or response structure returned from the createReimbursement call ${JSON.stringify(createReimbursementResponse)}!`);

                // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                itemFailures.push({
                    itemIdentifier: reimbursementRecord.messageId
                });

                return false;
            }
        } else {
            console.log(`Unexpected error and/or response structure returned from the getReimbursementByStatus call ${JSON.stringify(reimbursementByStatusResponse)}!`);

            // adds an item failure, for the SQS message which failed processing, as part of the incoming event
            itemFailures.push({
                itemIdentifier: reimbursementRecord.messageId
            });

            return false;
        }
    }
}

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
const processPendingTransaction = async (itemFailures: SQSBatchItemFailure[], pendingTransaction: MoonbeamTransactionByStatus,
                                         oliveClient: OliveClient, moonbeamClient: MoonbeamClient, reimbursementRecord: SQSRecord,
                                         // @ts-ignore
                                         globalCashbackPendingAmount: number): Promise<ReimbursementTransactionInput | null> => {
    // retrieve the Olive status of the incoming internally PENDING transaction
    const oliveTransactionStatusResponse: TransactionStatusDetailsResponse = await oliveClient.getTransactionStatus(pendingTransaction!.transactionId);

    // check to see if the Olive transaction status call was successful or not
    if (oliveTransactionStatusResponse && !oliveTransactionStatusResponse.errorMessage && !oliveTransactionStatusResponse.errorType && oliveTransactionStatusResponse.data) {
        console.log(`this is the status of this transaction : ${oliveTransactionStatusResponse.data.oliveTransactionStatus}`);

        // decide on how to proceed for each transaction, depending on the retrieved Olive status
        switch (oliveTransactionStatusResponse.data.oliveTransactionStatus) {
            case 'rejected':
                // internally update this transaction's status to rejected accordingly
                const updatedTransactionResponse: MoonbeamUpdatedTransactionResponse = await moonbeamClient.updateTransaction({
                    id: pendingTransaction!.id,
                    timestamp: pendingTransaction!.timestamp,
                    transactionId: pendingTransaction!.transactionId,
                    transactionStatus: TransactionsStatus.Rejected
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
                if ((
                        (pendingTransaction!.totalAmount !== oliveTransactionStatusResponse.data.totalAmount) ||
                        ((Math.round((pendingTransaction!.totalAmount + Number.EPSILON) * 100) / 100) !== (Math.round((oliveTransactionStatusResponse.data.totalAmount + Number.EPSILON) * 100) / 100))
                    ) ||
                    (
                        (pendingTransaction!.pendingCashbackAmount !== oliveTransactionStatusResponse.data.pendingCashbackAmount) ||
                        ((Math.round((pendingTransaction!.pendingCashbackAmount + Number.EPSILON) * 100) / 100) !== (Math.round((oliveTransactionStatusResponse.data.pendingCashbackAmount + Number.EPSILON) * 100) / 100))
                    ) ||
                    (
                        (pendingTransaction!.creditedCashbackAmount !== oliveTransactionStatusResponse.data.creditedCashbackAmount) ||
                        ((Math.round((pendingTransaction!.creditedCashbackAmount + Number.EPSILON) * 100) / 100) !== (Math.round((oliveTransactionStatusResponse.data.creditedCashbackAmount + Number.EPSILON) * 100) / 100)) ||
                        pendingTransaction!.creditedCashbackAmount !== 0
                    )) {
                    /**
                     * reconciliation failed, we will add an item failure, for the SQS message which failed processing, as part of the incoming event
                     * this will trigger a re-processing of the whole reimbursement for this user, however, it should not affect other transactions other
                     * than this one, because the other transactions will already have their statuses updated, and if not, once re-processed, they will
                     * not be added as duplicates in the list of reimbursement transactions - since that API prohibits it.
                     */
                    console.log(`Reconciliation failed for transaction ${pendingTransaction!.transactionId}, with information: ${JSON.stringify(pendingTransaction)}, ${JSON.stringify(oliveTransactionStatusResponse)}`);

                    // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                    itemFailures.push({
                        itemIdentifier: reimbursementRecord.messageId
                    });

                    /**
                     * do not do anything for statuses outside the ones that we want to observe
                     * we don't need to consider this transaction as part of the reimbursement process
                     */
                    return null;
                } else {
                    /**
                     * reconciliation done, we can proceed to considering this transaction as eligible for reimbursement, by
                     * adding this transaction's pending amount to the incoming globalCashbackPendingAmount
                     */
                    globalCashbackPendingAmount += pendingTransaction!.pendingCashbackAmount;

                    return {
                        id: pendingTransaction.id,
                        timestamp: pendingTransaction.timestamp,
                        transactionId: pendingTransaction.transactionId,
                        transactionStatus: pendingTransaction.transactionStatus
                    }
                }
            default:
                /**
                 * do not do anything for statuses outside the ones that we want to observe
                 * we don't need to consider this transaction as part of the reimbursement process
                 */
                return null;
        }
    } else {
        console.log(`Transaction Details mapping through GET Olive transaction status from transaction details call failed`);

        // adds an item failure, for the SQS message which failed processing, as part of the incoming event
        itemFailures.push({
            itemIdentifier: reimbursementRecord.messageId
        });

        // we don't need to consider this transaction as part of the reimbursement process
        return null;
    }
}
