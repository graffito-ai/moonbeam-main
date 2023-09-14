import {SQSBatchResponse, SQSEvent} from 'aws-lambda';
import {processMilitaryVerificationUpdate} from "./handlers/MilitaryVerificationUpdatesProcessorHandler";

/**
 * Lambda Function handler, handling incoming events, from the military verification updates/
 * notifications SQS queue, and thus, processing incoming military verification update-related messages.
 *
 * @param event SQS event to be passed in the handler
 * @returns a {@link Promise} containing a {@link SQSBatchResponse}
 */
exports.handler = async (event: SQSEvent): Promise<SQSBatchResponse> => {
    console.log(`Received new military verification update message from military verification updates SQS queue, with number of records ${event.Records.length}, id: ${event.Records[0].messageId}, contents: ${event.Records[0].body}`);

    // process incoming military verification updates
    return await processMilitaryVerificationUpdate(event);
}
