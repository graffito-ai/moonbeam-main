import {SQSBatchResponse, SQSEvent} from 'aws-lambda';
import {processReimbursements} from "./handlers/ReimbursementProcessorHandler";

/**
 * Lambda Function handler, handling incoming events, from the reimbursements SQS
 * queue, and thus, processing incoming reimbursement related messages.
 *
 * @param event SQS event to be passed in the handler
 * @returns a {@link Promise} containing a {@link SQSBatchResponse}
 */
exports.handler = async (event: SQSEvent): Promise<SQSBatchResponse> => {
    console.log(`Received new reimbursement message from reimbursements SQS queue, with number of records ${event.Records.length}, id: ${event.Records[0].messageId}, contents: ${event.Records[0].body}`);

    // process reimbursements
    return await processReimbursements(event);
}
