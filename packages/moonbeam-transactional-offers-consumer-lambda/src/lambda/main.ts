import {SQSBatchResponse, SQSEvent} from 'aws-lambda';
import {processOfferRedeemedTransactions} from "./handlers/OfferRedeemedProcessorHandler";

/**
 * Lambda Function handler, handling incoming events, from the transactions SQS
 * queue, and thus, processing incoming offer redeemed transactional messages.
 *
 * @param event SQS event to be passed in the handler
 * @returns a {@link Promise} containing a {@link SQSBatchResponse}
 */
exports.handler = async (event: SQSEvent): Promise<SQSBatchResponse> => {
    console.log(`Received new transaction message from transactions SQS queue, with number of records ${event.Records.length}, id: ${event.Records[0].messageId}, contents: ${event.Records[0].body}`);

    // process offer redeemed based transactions
    return await processOfferRedeemedTransactions(event);
}
