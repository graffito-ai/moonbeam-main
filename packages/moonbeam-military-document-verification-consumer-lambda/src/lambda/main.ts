import { SQSBatchResponse, SQSEvent } from 'aws-lambda';

/**
 * Lambda Function handler, handling incoming events, from the military verification updates/
 * notifications SQS queue, and thus, processing incoming military verification update-related messages.
 *
 * @param event SQS event to be passed in the handler
 * @returns a {@link Promise} containing a {@link SQSBatchResponse}
 */
exports.handler = async (event: SQSEvent): Promise<SQSBatchResponse> => {
    console.log(`Received new military document for verification, with number of records ${event.Records.length}, id: ${event.Records[0].messageId}, contents: ${event.Records[0].body}`);
    console.log(`Object key is: ${JSON.parse(event.Records[0].body)['detail']['object']['key']}`)
    // Return a Promise that includes the expected properties
    return Promise.resolve({
        batchItemFailures: [], // You can populate this array with appropriate data if needed
    });
};