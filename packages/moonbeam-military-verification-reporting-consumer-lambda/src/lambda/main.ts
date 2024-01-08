import {SQSBatchResponse, SQSEvent} from 'aws-lambda';
import {processMilitaryVerificationReport} from "./handlers/MilitaryVerificationReportingProcessorHandler";

/**
 * Lambda Function handler, handling incoming events, from the military verification updates/
 * reporting SQS queue, and thus, processing incoming military verification reporting-related messages.
 *
 * @param event SQS event to be passed in the handler
 * @returns a {@link Promise} containing a {@link SQSBatchResponse}
 */
exports.handler = async (event: SQSEvent): Promise<SQSBatchResponse> => {
    console.log(`Received new military verification reporting message from military verification reporting SQS queue, with number of records ${event.Records.length}, id: ${event.Records[0].messageId}, contents: ${event.Records[0].body}`);

    // process incoming military verification reporting message
    return await processMilitaryVerificationReport(event);
}
