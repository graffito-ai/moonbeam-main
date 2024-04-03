import {SQSBatchResponse, SQSEvent} from 'aws-lambda';
import {processLocationUpdates} from "./handlers/LocationUpdatesProcessorHandler";

/**
 * Lambda Function handler, handling incoming events, from the location updates
 * SQS queue, and thus, processing incoming location update-related messages.
 *
 * @param event SQS event to be passed in the handler
 * @returns a {@link Promise} containing a {@link SQSBatchResponse}
 */
exports.handler = async (event: SQSEvent): Promise<SQSBatchResponse> => {
    console.log(`Received new location update message from location updates SQS queue, with number of records ${event.Records.length}, id: ${event.Records[0].messageId}, contents: ${event.Records[0].body}`);

    // process incoming location updates
    return await processLocationUpdates(event);
}
