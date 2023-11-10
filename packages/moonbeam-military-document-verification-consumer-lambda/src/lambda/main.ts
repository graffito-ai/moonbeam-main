import { SQSBatchResponse, SQSEvent } from 'aws-lambda';

/**
 * Lambda Function handler, handling incoming events, from the military verification updates/
 * notifications SQS queue, and thus, processing incoming military verification update-related messages.
 *
 * @param event SQS event to be passed in the handler
 * @returns a {@link Promise} containing a {@link SQSBatchResponse}
 */
exports.handler = async (event: SQSEvent): Promise<SQSBatchResponse> => {
    console.log(event[0])

    // Return a Promise that includes the expected properties
    return Promise.resolve({
        batchItemFailures: [], // You can populate this array with appropriate data if needed
    });
};