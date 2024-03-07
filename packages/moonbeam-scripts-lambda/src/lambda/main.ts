import {EventBridgeEvent} from "aws-lambda";
import {triggerCardExpirationBackFill} from "./resolvers/CardExpirationBackfillTrigger";

/**
 * Lambda Function handler, handling incoming cron notification reminder events,
 * to be used to then trigger the notification reminder process.
 *
 * @param event EventBridge cron-based event to be passed in the handler
 */
exports.handler = async (event: EventBridgeEvent<'Scheduled Event', {eventType: 'CardExpirationBackFillScriptReminderEvent' | 'OfferBackFillScriptReminderEvent'}>): Promise<void> => {
    // information on the event bridge trigger event
    console.log(`Received new moonbeam script schedule cron trigger event, through EventBridge, with event detail [${JSON.stringify(event["detail-type"])}] and event type [${event["detail"].eventType}]`);

    // handle the incoming script triggered event
    switch (event["detail"].eventType) {
        case "CardExpirationBackFillScriptReminderEvent":
            await triggerCardExpirationBackFill();
            break;
        case "OfferBackFillScriptReminderEvent":
            break;
        default:
            console.log(`Unknown event type received ${event["detail"].eventType}.\nUnable to trigger any script!`);
            break;
    }
}
