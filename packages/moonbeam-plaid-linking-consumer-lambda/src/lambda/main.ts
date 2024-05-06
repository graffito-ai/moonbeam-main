import {SQSBatchResponse, SQSEvent} from 'aws-lambda';
import { processPlaidLink } from './resolvers/PlaidLinkEventsProcessorHandler';

/**
 * Lambda Function handler, handling incoming events, from the PLaid Linking SQS
 * queue, and thus, processing incoming Plaid Link events for various reminder messages purposes.
 *
 * @param event SQS event to be passed in the handler
 * @returns a {@link Promise} containing a {@link SQSBatchResponse}
 */
exports.handler = async (event: SQSEvent): Promise<SQSBatchResponse> => {
    console.log(`Received new Plaid Link message from reminders SQS queue, with number of records ${event.Records.length}, id: ${event.Records[0].messageId}, contents: ${event.Records[0].body}`);

    // process Plaid Link events
    return await processPlaidLink(event);
}
