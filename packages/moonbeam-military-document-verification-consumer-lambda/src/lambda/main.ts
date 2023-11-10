import { SQSBatchResponse, SQSEvent } from 'aws-lambda';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";


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

    const client = new DynamoDBClient({});
    const docClient = DynamoDBDocumentClient.from(client);
    const tableName = "militaryVerificationTable-dev-us-west-2"

    const command = new GetCommand({
        TableName: tableName,
        Key: {
            id: "84d088f2-3514-4e92-babb-31812c462ac7",
        },
    });
    const response = await docClient.send(command);
    console.log(response)

    // Return a Promise that includes the expected properties
    return Promise.resolve({
        batchItemFailures: [], // You can populate this array with appropriate data if needed
    });
};