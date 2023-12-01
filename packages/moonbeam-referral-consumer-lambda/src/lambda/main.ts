import {SQSBatchResponse, SQSEvent} from 'aws-lambda';
import {processReferral} from "./resolvers/ReferralProcessorHandler";

/**
 * Lambda Function handler, handling incoming events, from the referral SQS queue, and thus,
 * processing incoming referrals needed processing so they can be redeemed and accounted for
 * by users.
 *
 * @param event SQS event to be passed in the handler
 * @returns a {@link Promise} containing a {@link SQSBatchResponse}
 */
exports.handler = async (event: SQSEvent): Promise<SQSBatchResponse> => {
    console.log(`Received new referral message from reminders SQS queue, with number of records ${event.Records.length}, id: ${event.Records[0].messageId}, contents: ${event.Records[0].body}`);

    // process referrals
    return await processReferral(event);
}
