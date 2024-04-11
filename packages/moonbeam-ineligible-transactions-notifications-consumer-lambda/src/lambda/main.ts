import {SQSBatchResponse, SQSEvent} from 'aws-lambda';
import {
    processIneligibleTransactionsNotifications
} from "./handlers/IneligibleTransactionsNotificationsProcessorHandler";

/**
 * Lambda Function handler, handling incoming events, from the transactions notifications SQS
 * queue, and thus, processing incoming notifications for offer redeemed transactional messages.
 *
 * @param event SQS event to be passed in the handler
 * @returns a {@link Promise} containing a {@link SQSBatchResponse}
 */
exports.handler = async (event: SQSEvent): Promise<SQSBatchResponse> => {
    console.log(`Received new ineligible transaction notification message from the ineligible transactions SQS queue, with number of records ${event.Records.length}, id: ${event.Records[0].messageId}, contents: ${event.Records[0].body}`);

    // process incoming ineligible transactions notifications
    return await processIneligibleTransactionsNotifications(event);
}
