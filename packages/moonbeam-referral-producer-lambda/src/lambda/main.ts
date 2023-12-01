import {EventBridgeEvent} from "aws-lambda";
import {triggerReferral} from "./resolvers/ReferralTrigger";

/**
 * Lambda Function handler, handling incoming cron referral events,
 * to be used to then trigger the referral process.
 *
 * @param event EventBridge cron-based event to be passed in the handler
 */
exports.handler = async (event: EventBridgeEvent<'ReferralEvent', 'ReferralReplay'>): Promise<void> => {
    // information on the event bridge trigger event
    console.log(`Received new referral schedule cron trigger event, through EventBridge, with event detail [${JSON.stringify(event["detail-type"])}] and event replay [${JSON.stringify(event["replay-name"])}]`);

    // handle the referral triggered event
    await triggerReferral();
}
