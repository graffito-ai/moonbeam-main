import {EventBridgeEvent} from "aws-lambda";
import {triggerReimbursementHandler} from "./handlers/TriggerReimbursementHandler";

/**
 * Lambda Function handler, handling incoming cron reimbursement events,
 * to be used to then trigger the reimbursements Lambda producer.
 *
 * @param event EventBridge cron-based event to be passed in the handler
 */
exports.handler = async (event: EventBridgeEvent<'ReimbursementEvent', 'ReimbursementReplay'>): Promise<void> => {
    // information on the event bridge trigger event
    console.log(`Received new reimbursement schedule cron trigger event, through EventBridge, with event detail [${JSON.stringify(event["detail-type"])}] and event replay [${JSON.stringify(event["replay-name"])}]`);

    // handle the incoming reimbursement event
    await triggerReimbursementHandler();
}

