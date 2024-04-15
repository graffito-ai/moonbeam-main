import {EventBridgeEvent} from "aws-lambda";
import { triggerEarningsDailySummariesCreation } from "./handlers/EarningsDailySummaryTrigger";

/**
 * Lambda Function handler, handling incoming cron earnings summary events,
 * to be used to then trigger the earnings summary processing/creation process.
 *
 * @param event EventBridge cron-based event to be passed in the handler
 */
exports.handler = async (event: EventBridgeEvent<'Scheduled Event', {eventType: 'EarningsDailySummaryEvent'}>): Promise<void> => {
    // information on the event bridge trigger event
    console.log(`Received new earnings daily summary schedule cron trigger event, through EventBridge, with event detail [${JSON.stringify(event["detail-type"])}] and event type [${event["detail"].eventType}]`);

    // handle the earnings daily summary triggered event
    switch (event["detail"].eventType) {
        case "EarningsDailySummaryEvent":
            await triggerEarningsDailySummariesCreation();
            break;
        default:
            console.log(`Unknown event type received ${event["detail"].eventType}.\nUnable to trigger any earnings daily summary process!`);
            break;
    }
}
