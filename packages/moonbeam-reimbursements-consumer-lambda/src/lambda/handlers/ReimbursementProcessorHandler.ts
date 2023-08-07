import {SQSBatchResponse, SQSEvent} from "aws-lambda";
import {SQSBatchItemFailure} from "aws-lambda/trigger/sqs";

/**
 * ReimbursementProcessorHandler handler
 *
 * @param event the {@link SQSEvent} to be processed, containing the reimbursement
 * message information
 * @returns {@link Promise} of {@link SQSBatchResponse}
 */
export const processReimbursements = async (event: SQSEvent): Promise<SQSBatchResponse> => {
    try {
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
        for (const {} of event.Records) {
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
             * 3) If there is a GLOBAL AMOUNT (> 0), then there are several transactions which can qualify as part of a reimbursement.
             *    Therefore, proceed to the steps below.
             * 4) Call the getReimbursementByStatus Moonbeam AppSync API endpoint, to check if there is an existing PENDING reimbursement,
             *    for the member corresponding to the incoming message.
             *    - If existing PENDING, call the updateReimbursement Moonbeam AppSync API endpoint, to add all transactions making up the
             *       global amount to it, and update reimbursement's amounts.
             *    - If non-existing PENDING, call the createReimbursement Moonbeam AppSync API endpoint, to create a new PENDING reimbursement,
             *       with all transactions making up the global amount, and the appropriate amounts.
             * 5) If reimbursement (created or updated) pending amount + the global amount >= $20 then:
             *    - call the createReimbursementEligibility and (if applicable) the updateReimbursementEligibility Moonbeam AppSync API endpoint accordingly, in
             *      order to manipulate the member's reimbursement eligibility flag.
             */
            break;
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
