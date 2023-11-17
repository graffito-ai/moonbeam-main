import { SQSBatchResponse, SQSEvent } from 'aws-lambda';
import { DynamoDBClient, GetItemCommandInput } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import {
    GetDocumentTextDetectionCommand,
    GetDocumentTextDetectionCommandInput,
    StartDocumentTextDetectionCommand,
    StartDocumentTextDetectionCommandInput,
    TextractClient
} from '@aws-sdk/client-textract';
import { MilitaryVerificationStatusType } from '@moonbeam/moonbeam-models';
import { updateMilitaryVerificationStatus } from '../../../moonbeam-military-verification-lambda/src/lambda/resolvers/UpdateMilitaryVerificationStatusResolver';

const ddbClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const textractClient = new TextractClient({});
const tableName = process.env.MILITARY_VERIFICATION_TABLE!;

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

    const eventBody = JSON.parse(event.Records[0].body);

    const objectKey = eventBody.detail.object.key;
    const bucketName = eventBody.detail.bucket.name;

    const fileName = objectKey.split('/')[1]
    const userId = fileName.split('-').slice(0, 5).join('-')

    const getMilitaryVerificationCommandInput: GetItemCommandInput = {
        TableName: tableName,
        Key: { id: userId },
    };
    console.log('getMilitaryVerificationCommandInput', JSON.stringify(getMilitaryVerificationCommandInput));
    const getMilitaryVerificationResponse = await ddbClient.send(new GetCommand(getMilitaryVerificationCommandInput));
    console.log('getMilitaryVerificationResponse', JSON.stringify(getMilitaryVerificationResponse))

    const startTextractInput: StartDocumentTextDetectionCommandInput = {
        DocumentLocation: { S3Object: { Bucket: bucketName, Name: objectKey } },
    };
    console.log('startTextractInput', JSON.stringify(startTextractInput));
    const startTextractResponse = await textractClient.send(new StartDocumentTextDetectionCommand(startTextractInput));
    console.log('startTextractResponse', JSON.stringify(startTextractResponse));

    // Poll job status until it finished
    let isJobComplete = false;
    let imageText = '';
    let numIterations = 0;

    const textractStatusInput: GetDocumentTextDetectionCommandInput = {
        JobId: startTextractResponse.JobId
    };
    console.log('textractStatusInput', JSON.stringify(textractStatusInput));

    while (!isJobComplete) {
        const textractStatusResponse = await textractClient.send(new GetDocumentTextDetectionCommand(textractStatusInput));
        console.log(`textractStatusResponse #${++numIterations}`, JSON.stringify(textractStatusResponse));

        const jobStatus = textractStatusResponse.JobStatus || 'IN_PROGRESS';

        if (jobStatus === 'SUCCEEDED' || jobStatus === 'FAILED') {
            isJobComplete = true;

            if (jobStatus === 'SUCCEEDED') {
                imageText = textractStatusResponse.Blocks!
                    .filter(block => block.BlockType === 'LINE')
                    .map((line) => line.Text || '')
                    .join(' ')
                    .toLowerCase();
            } else {
                console.error('Textract job failed.');
            }
        } else {
            console.log("Waiting 10 seconds until checking job status again...")
            await wait(10 * 1000); // wait 10 seconds between poll
        }
    }

    console.log('imageText:', imageText)
    if (imageText) {
        const { lastName, firstName, state, city, zipCode, addressLine, militaryDutyStatus } = getMilitaryVerificationResponse.Item;
        const validationInfo = [lastName, firstName, state, city, zipCode, addressLine, militaryDutyStatus] as string[];
        console.log('validationInfo:', validationInfo)

        const isVerified = validationInfo.every((info) => {
            const isIncluded = imageText.includes(info.toLowerCase())
            if (!isIncluded) console.log(`Missing info: ${info} not in provided document!`)
            return isIncluded
        });
        console.log('isVerified:', isVerified);

        await updateMilitaryVerificationStatus('updateMilitaryVerificationStatus', {
            id: userId,
            militaryVerificationStatus: isVerified ? MilitaryVerificationStatusType.Verified : MilitaryVerificationStatusType.Rejected,
            updatedAt: new Date().toISOString()
        });
    } else {
        console.log('Missing imageText...')
    }
    
    // Return a Promise that includes the expected properties
    return Promise.resolve({
        batchItemFailures: [], // You can populate this array with appropriate data if needed
    });
};