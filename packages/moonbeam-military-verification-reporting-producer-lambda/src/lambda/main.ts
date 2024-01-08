import {EventBridgeEvent} from "aws-lambda";
import {triggerMilitaryVerificationReport} from "./handlers/MilitaryVerificationReportTrigger";

/**
 * Lambda Function handler, handling incoming cron military verification reporting events,
 * to be used to then trigger the military verification reporting process.
 *
 * @param event EventBridge cron-based event to be passed in the handler
 */
exports.handler = async (event: EventBridgeEvent<'NotificationReminderEvent', 'NotificationReminderReplay'>): Promise<void> => {
    // information on the event bridge trigger event
    console.log(`Received new military verification reporting schedule cron trigger event, through EventBridge, with event detail [${JSON.stringify(event["detail-type"])}] and event replay [${JSON.stringify(event["replay-name"])}]`);

    // handle the military verification reporting triggered event
    await triggerMilitaryVerificationReport();
}
