import {SQSBatchResponse, SQSEvent} from 'aws-lambda';
import {processNotificationReminder} from "./resolvers/NotificationReminderProcessorHandler";

/**
 * Lambda Function handler, handling incoming events, from the notification reminder SQS
 * queue, and thus, processing incoming notification reminders for various reminder messages purposes.
 *
 * @param event SQS event to be passed in the handler
 * @returns a {@link Promise} containing a {@link SQSBatchResponse}
 */
exports.handler = async (event: SQSEvent): Promise<SQSBatchResponse> => {
    console.log(`Received new notification reminder message from reminders SQS queue, with number of records ${event.Records.length}, id: ${event.Records[0].messageId}, contents: ${event.Records[0].body}`);

    // process notification reminders
    return await processNotificationReminder(event);
}
