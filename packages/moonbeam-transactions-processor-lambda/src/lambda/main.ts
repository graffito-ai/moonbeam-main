import {SQSEvent} from 'aws-lambda';

/**
 * Lambda Function handler, handling incoming events, from the transactions SQS
 * queue, and thus, processing incoming transactions.
 *
 * @param event APIGateway event to be passed in the handler
 * @returns a {@link Promise} containing a {@link APIGatewayProxyResult}
 */
exports.handler = async (event: SQSEvent): Promise<void> => {
    console.log(`Received new transaction message from transactions SQS queue, with number of records ${event.Records.length} and message id ${event.Records[0].messageId}`);
}
