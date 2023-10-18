import {EventBridgeEvent} from "aws-lambda";
import {triggerNotificationReminder} from "./resolvers/NotificationReminderTrigger";

/**
 * Lambda Function handler, handling incoming cron notification reminder events,
 * to be used to then trigger the notification reminder process.
 *
 * @param event EventBridge cron-based event to be passed in the handler
 */
exports.handler = async (event: EventBridgeEvent<'ReimbursementEvent', 'ReimbursementReplay'>): Promise<void> => {
    // information on the event bridge trigger event
    console.log(`Received new notification reminder schedule cron trigger event, through EventBridge, with event detail [${JSON.stringify(event["detail-type"])}] and event replay [${JSON.stringify(event["replay-name"])}]`);

    // handle the notification reminder triggered event
    await triggerNotificationReminder();
}
