import {aws_lambda, aws_lambda_nodejs, aws_sns, aws_sqs, Duration, Stack, StackProps} from "aws-cdk-lib";
import {StageConfiguration} from "../models/StageConfiguration";
import {Construct} from "constructs";
import path from "path";
import {Effect, PolicyStatement} from "aws-cdk-lib/aws-iam";
import {Constants, Stages} from "@moonbeam/moonbeam-models";
import {SqsSubscription} from "aws-cdk-lib/aws-sns-subscriptions";
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';

export class MilitaryDocumentVerificationStack extends Stack {

    // Producer lambda from team 1. Will extract ID from document and put in SNS topic.
    readonly militaryDocumentVerificationProducerLambda: aws_lambda_nodejs.NodejsFunction;

    // Consumer lambda for team 2: Will get document and ID from consumer queue 
    readonly militaryDocumentVerificationConsumerLambda: aws_lambda_nodejs.NodejsFunction;

    constructor(scope: Construct, id: string, props: StackProps & Pick<StageConfiguration, 'environmentVariables' | 'stage' | 'militaryDocumentVerificationConfig'>) {
        super(scope, id, props);

        // Producer lambda does not need access to internal api secrets, event bridge handles payload.
        this.militaryDocumentVerificationProducerLambda = new aws_lambda_nodejs.NodejsFunction(this, `${props.militaryDocumentVerificationConfig.militaryDocumentVerificationProducerFunctionName}-${props.stage}-${props.env!.region}`, {
            functionName: `${props.militaryDocumentVerificationConfig.militaryDocumentVerificationProducerFunctionName}-${props.stage}-${props.env!.region}`,
            entry: path.resolve(path.join(__dirname, '../../../moonbeam-military-document-verification-producer-lambda/src/lambda/main.ts')),
            handler: 'handler',
            runtime: aws_lambda.Runtime.NODEJS_18_X,
            // we add a timeout here different from the default of 3 seconds, since we expect these API calls to take longer
            timeout: Duration.seconds(50),
            bundling: {
                minify: true, // minify code, defaults to false
                sourceMap: true, // include source map, defaults to false
                sourceMapMode: aws_lambda_nodejs.SourceMapMode.BOTH, // defaults to SourceMapMode.DEFAULT
                sourcesContent: false, // do not include original source into source map, defaults to true
                target: 'esnext', // target environment for the generated JavaScript code
            }
        });

        // Consumer lambda for team 2.
        this.militaryDocumentVerificationConsumerLambda = new aws_lambda_nodejs.NodejsFunction(this, `${props.militaryDocumentVerificationConfig.militaryDocumentVerificationConsumerFunctionName}-${props.stage}-${props.env!.region}`, {
            functionName: `${props.militaryDocumentVerificationConfig.militaryDocumentVerificationConsumerFunctionName}-${props.stage}-${props.env!.region}`,
            entry: path.resolve(path.join(__dirname, '../../../moonbeam-military-document-verification-producer-lambda/src/lambda/main.ts')),
            handler: 'handler',
            runtime: aws_lambda.Runtime.NODEJS_18_X,
            // we add a timeout here different from the default of 3 seconds, since we expect these API calls to take longer
            timeout: Duration.seconds(50),
            bundling: {
                minify: true, // minify code, defaults to false
                sourceMap: true, // include source map, defaults to false
                sourceMapMode: aws_lambda_nodejs.SourceMapMode.BOTH, // defaults to SourceMapMode.DEFAULT
                sourcesContent: false, // do not include original source into source map, defaults to true
                target: 'esnext', // target environment for the generated JavaScript code
            }
        });
        
        // Give the consumer lambda access to api secrets.
        this.militaryDocumentVerificationConsumerLambda.addToRolePolicy(
            new PolicyStatement({
                effect: Effect.ALLOW,
                actions: [
                    "secretsmanager:GetSecretValue"
                ],
                resources: [
                    // this ARN is retrieved post secret creation
                    ...props.stage === Stages.DEV ? ["arn:aws:secretsmanager:us-west-2:963863720257:secret:moonbeam-internal-secret-pair-dev-us-west-2-vgMpp2"] : [],
                    ...props.stage === Stages.PROD ? ["arn:aws:secretsmanager:us-west-2:251312580862:secret:moonbeam-internal-secret-pair-prod-us-west-2-9xP6tj"] : []
                ]
            })
        );

        // Given the consumer lambda access to mutations and queries.
        this.militaryDocumentVerificationConsumerLambda.addToRolePolicy(
            new PolicyStatement({
                effect: Effect.ALLOW,
                actions: [
                    "appsync:GraphQL"
                ],
                resources: [
                    // this ARN is retrieved post secret creation
                    ...props.stage === Stages.DEV ? ["arn:aws:appsync:us-west-2:963863720257:apis/pkr6ygyik5bqjigb6nd57jl2cm/types/Mutation/*"] : [],
                    ...props.stage === Stages.PROD ? ["arn:aws:appsync:us-west-2:251312580862:apis/p3a4pwssi5dejox33pvznpvz4u/types/Mutation/*"] : []
                ]
            })
        );

        // Fifo SNS topic that will come before the queue.
        const militaryDocumentVerificationProcessingTopic = new aws_sns.Topic(this, `${props.militaryDocumentVerificationConfig.militaryDocumentVerificationFanOutConfig.militaryDocumentVerificationProcessingTopicName}-${props.stage}-${props.env!.region}`, {
            displayName: `${props.militaryDocumentVerificationConfig.militaryDocumentVerificationFanOutConfig.militaryDocumentVerificationProcessingTopicName}`,
            topicName: `${props.militaryDocumentVerificationConfig.militaryDocumentVerificationFanOutConfig.militaryDocumentVerificationProcessingTopicName}-${props.stage}-${props.env!.region}`,
            fifo: true,
            // we are guaranteed that for messages with a same content, to be dropped in the topic, that the deduplication id will be based on the content
            contentBasedDeduplication: true
        });

        // Allow the producer lambda rights to publishing to the SNS topic.
        militaryDocumentVerificationProcessingTopic.grantPublish(this.militaryDocumentVerificationProducerLambda)

        // Create environment variables that we will use in the producer function code
        this.militaryDocumentVerificationProducerLambda.addEnvironment(`${Constants.MoonbeamConstants.MILITARY_VERIFICATION_NOTIFICATION_PROCESSING_TOPIC_ARN}`, militaryDocumentVerificationProcessingTopic.topicArn);
        this.militaryDocumentVerificationProducerLambda.addEnvironment(`${Constants.MoonbeamConstants.ENV_NAME}`, props.stage);

        // Queue that follows the SNS topic.
        const militaryDocumentVerificationProcessingQueue = new aws_sqs.Queue(this, `${props.militaryDocumentVerificationConfig.militaryDocumentVerificationFanOutConfig.militaryDocumentVerificationProcessingQueueName}-${props.stage}-${props.env!.region}.fifo`, {
            queueName: `${props.militaryDocumentVerificationConfig.militaryDocumentVerificationFanOutConfig.militaryDocumentVerificationProcessingQueueName}-${props.stage}-${props.env!.region}.fifo`,
            // long-polling enabled here, waits to receive a message for 10 seconds
            receiveMessageWaitTime: Duration.seconds(10),
            /**
             * the time that a message will wait to be deleted by one of the queue subscribers (aka how much time to we have to process a transaction)
             * since this message will be "invisible" to other consumers during this time.
             */
            visibilityTimeout: Duration.seconds(50),
            fifo: true,
            // we are guaranteed that for messages with a same content, to be dropped in the queue, that the deduplication id will be based on the content
            contentBasedDeduplication: true,
            // creates a dead-letter-queue (DLQ) here, in order to handle any failed messages, that cannot be processed by the consumers of the military verification updates queue
            deadLetterQueue: {
                queue: new aws_sqs.Queue(this, `${props.militaryDocumentVerificationConfig.militaryDocumentVerificationFanOutConfig.militaryDocumentVerificationProcessingDLQName}-${props.stage}-${props.env!.region}.fifo`, {
                    queueName: `${props.militaryDocumentVerificationConfig.militaryDocumentVerificationFanOutConfig.militaryDocumentVerificationProcessingDLQName}-${props.stage}-${props.env!.region}.fifo`,
                    fifo: true,
                    contentBasedDeduplication: true,
                    /**
                     * we want to add the maximum retention period for messages in the dead-letter queue which is 1209600 seconds or 14 days,
                     * just to ensure that we have enough time to re-process any failures. For the military verification notification queue, this will be set to
                     * the default of 4 days.
                     */
                    retentionPeriod: Duration.seconds(1209600)
                }),
                // another way of essentially deleting message from the queue, is specifying after how many retries a message will be moved to the dead-letter queue
                maxReceiveCount: 3
            }
        });

        // Add subscription from SNS topic to queue.
        militaryDocumentVerificationProcessingTopic.addSubscription(new SqsSubscription(militaryDocumentVerificationProcessingQueue, {
            // the message to the queue is the same as it was sent to the topic
            rawMessageDelivery: true,
            // creates a dead-letter-queue (DLQ) here, in order to handle any failed messages, that cannot be sent from SNS to SQS
            deadLetterQueue: new aws_sqs.Queue(this, `${props.militaryDocumentVerificationConfig.militaryDocumentVerificationFanOutConfig.militaryDocumentVerificationProcessingDLQTopicName}-${props.stage}-${props.env!.region}.fifo`, {
                queueName: `${props.militaryDocumentVerificationConfig.militaryDocumentVerificationFanOutConfig.militaryDocumentVerificationProcessingDLQTopicName}-${props.stage}-${props.env!.region}.fifo`,
                fifo: true,
                contentBasedDeduplication: true,
                /**
                 * we want to add the maximum retention period for messages in the dead-letter queue which is 1209600 seconds or 14 days,
                 * just to ensure that we have enough time to re-process any failures. For the military verification notification queue, this will be set to
                 * the default of 4 days.
                 */
                retentionPeriod: Duration.seconds(1209600)
            })
        }));

        // Allow consumer lambda to get messages from the team 1 queue.
        militaryDocumentVerificationProcessingQueue.grantConsumeMessages(this.militaryDocumentVerificationConsumerLambda);

        // Get files bucket name for the event bridge.
        const mainFilesBucketName = `${Constants.StorageConstants.MOONBEAM_MAIN_FILES_BUCKET_NAME}-${props.stage}-${props.env!.region}`;

        // Create the S3 event bridge.
        const S3EventRule = new events.Rule(this, `${props.militaryDocumentVerificationConfig.militaryDocumentVerificationFanOutConfig.militaryDocumentVerificationProcessingEventRule}`, {
            eventPattern: {
                source: ['aws.s3'],
                detailType: ['Take document from S3 bucket and send to producer lambda in document verification stack.'],
                detail: {
                    eeventSource: ['s3.amazonaws.com'],
                    eventName: ['PutObject'],
                    requestParameters: {
                      bucketName: [mainFilesBucketName],
                      key: { 'prefix': ['public/'] },
                }
            }
        }});

        // Add the producer lambda function as a target for this event.
        S3EventRule.addTarget(new targets.LambdaFunction(this.militaryDocumentVerificationProducerLambda));

        // Add the consumer lambda function as a target for this event.
        S3EventRule.addTarget(new targets.LambdaFunction(this.militaryDocumentVerificationConsumerLambda));
    }

}