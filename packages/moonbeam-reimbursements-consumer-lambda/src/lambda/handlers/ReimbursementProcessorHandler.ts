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
