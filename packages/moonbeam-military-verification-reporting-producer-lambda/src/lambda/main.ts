import {EventBridgeEvent} from "aws-lambda";
import {triggerMilitaryVerificationReport} from "./handlers/MilitaryVerificationReportTrigger";

/**
 * Lambda Function handler, handling incoming cron military verification reporting events,
 * to be used to then trigger the military verification reporting process.
 *
 * @param event EventBridge cron-based event to be passed in the handler
 */
exports.handler = async (event: EventBridgeEvent<'Scheduled Event', {eventType: 'MilitaryVerificationReportingReminderEvent'}>): Promise<void> => {
    // information on the event bridge trigger event
    console.log(`Received new military verification reporting schedule cron trigger event, through EventBridge, with event detail [${JSON.stringify(event["detail-type"])}] and event type [${event["detail"].eventType}]`);

    // handle the military incoming verification reporting triggered event
    switch (event["detail"].eventType) {
        case "MilitaryVerificationReportingReminderEvent":
            await triggerMilitaryVerificationReport();
            break;
        default:
            console.log(`Unknown event type received ${event["detail"].eventType}.\nUnable to trigger any military verification reporting process!`);
            break;
    }
}
