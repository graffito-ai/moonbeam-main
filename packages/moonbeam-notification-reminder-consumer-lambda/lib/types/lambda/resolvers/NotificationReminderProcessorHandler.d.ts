import { SQSBatchResponse, SQSEvent } from "aws-lambda";
/**
 * NotificationReminderProcessor handler
 *
 * @param event the {@link SQSEvent} to be processed, containing the notification
 * reminder message information
 * @returns {@link Promise} of {@link SQSBatchResponse}
 */
export declare const processNotificationReminder: (event: SQSEvent) => Promise<SQSBatchResponse>;
