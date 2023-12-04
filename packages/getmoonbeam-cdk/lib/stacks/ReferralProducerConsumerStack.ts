import {aws_lambda, aws_lambda_nodejs, aws_sns, aws_sqs, Duration, Stack, StackProps} from "aws-cdk-lib";
import {StageConfiguration} from "../models/StageConfiguration";
import {Construct} from "constructs";
import path from "path";
import {Effect, PolicyStatement} from "aws-cdk-lib/aws-iam";
import {Constants, Stages} from "@moonbeam/moonbeam-models";
import {SqsSubscription} from "aws-cdk-lib/aws-sns-subscriptions";
import {EventSourceMapping} from "aws-cdk-lib/aws-lambda";
import {Rule, Schedule} from "aws-cdk-lib/aws-events";
import {LambdaFunction} from "aws-cdk-lib/aws-events-targets";

/**
 * File used to define the ReferralProducerConsumerStack stack, used to create all the necessary resources
 * involved around handling incoming referral data in an async fashion (Lambdas, etc.), as well as
 * around the referral-related fan-out pattern, composed of an event-based process, driven by SNS and SQS. This
 * will help build the infrastructure for the acknowledgment service, or producer, as well as any of its consumers.
 */
export class ReferralProducerConsumerStack extends Stack {

    /**
     * the referral producer Lambda Function, acting as the
     * referral producer, to be used in kick-starting the whole
     * referral eligibility process, by dropping messages in the appropriate topic and queue.
     */
    readonly referralProducerLambda: aws_lambda_nodejs.NodejsFunction;

    /**
     * the referral consumer Lambda Function, acting as the
     * referral consumer, to be used during the whole referral eligibility
     * process, by consuming dropped messages from the appropriate topic and queue.
     */
    readonly referralConsumerLambda: aws_lambda_nodejs.NodejsFunction;

    /**
     * Constructor for the ReferralProducerConsumerStack stack.
     *
     * @param scope scope to be passed in (usually a CDK App Construct)
     * @param id stack id to be passed in
     * @param props stack properties to be passed in
     */
    constructor(scope: Construct, id: string, props: StackProps & Pick<StageConfiguration, 'environmentVariables' | 'stage' | 'referralProducerConsumerConfig'>) {
        super(scope, id, props);

        // create a new Lambda function to be used with the for referral purposes, acting as the acknowledgment service or producer
        this.referralProducerLambda = new aws_lambda_nodejs.NodejsFunction(this, `${props.referralProducerConsumerConfig.referralProducerFunctionName}-${props.stage}-${props.env!.region}`, {
            functionName: `${props.referralProducerConsumerConfig.referralProducerFunctionName}-${props.stage}-${props.env!.region}`,
            entry: path.resolve(path.join(__dirname, '../../../moonbeam-referral-producer-lambda/src/lambda/main.ts')),
            handler: 'handler',
            runtime: aws_lambda.Runtime.NODEJS_18_X,
            // we add a timeout here different from the default of 3 seconds, since we expect these API calls to take longer
            timeout: Duration.seconds(30),
            bundling: {
                minify: true, // minify code, defaults to false
                sourceMap: true, // include source map, defaults to false
                sourceMapMode: aws_lambda_nodejs.SourceMapMode.BOTH, // defaults to SourceMapMode.DEFAULT
                sourcesContent: false, // do not include original source into source map, defaults to true
                target: 'esnext', // target environment for the generated JavaScript code
            }
        });
        // create a CRON expression trigger that will enable running the referral producer lambda to run on a schedule
        new Rule(this, `${props.referralProducerConsumerConfig.referralProducerCronRuleName}-${props.stage}-${props.env!.region}`, {
            ruleName: `${props.referralProducerConsumerConfig.referralProducerCronRuleName}-${props.stage}-${props.env!.region}`,
            description: "Schedule the Referral Trigger Lambda which initiates the referral Lambda/process daily, at 10PM UTC",
            // set the CRON timezone to the UTC time to match 10:00 PM UTC, 3:00 PM MST
            schedule: Schedule.cron({
                day: '*',
                minute: '00',
                hour: '22'
            }),
            targets: [new LambdaFunction(this.referralProducerLambda)],
        });

        // create a new Lambda function to be used as a consumer for referral data, acting as the referral processor for referrals eligible to be redeemed.
        this.referralConsumerLambda = new aws_lambda_nodejs.NodejsFunction(this, `${props.referralProducerConsumerConfig.referralConsumerFunctionName}-${props.stage}-${props.env!.region}`, {
            functionName: `${props.referralProducerConsumerConfig.referralConsumerFunctionName}-${props.stage}-${props.env!.region}`,
            entry: path.resolve(path.join(__dirname, '../../../moonbeam-referral-consumer-lambda/src/lambda/main.ts')),
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

        // enable the Lambda function the retrieval of the Moonbeam internal API secrets
        this.referralConsumerLambda.addToRolePolicy(
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
        // enable the Lambda function to access the AppSync mutations and queries
        this.referralConsumerLambda.addToRolePolicy(
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
        this.referralConsumerLambda.addToRolePolicy(
            new PolicyStatement({
                effect: Effect.ALLOW,
                actions: [
                    "appsync:GraphQL"
                ],
                resources: [
                    // this ARN is retrieved post secret creation
                    ...props.stage === Stages.DEV ? [ "arn:aws:appsync:us-west-2:963863720257:apis/pkr6ygyik5bqjigb6nd57jl2cm/types/Query/*"] : [],
                    ...props.stage === Stages.PROD ? ["arn:aws:appsync:us-west-2:251312580862:apis/p3a4pwssi5dejox33pvznpvz4u/types/Query/*"] : []
                ]
            })
        );
        // enable the Lambda function the retrieval of the Moonbeam internal API secrets
        this.referralProducerLambda.addToRolePolicy(
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
        // enable the Lambda function to access the AppSync mutations and queries
        this.referralProducerLambda.addToRolePolicy(
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
        this.referralProducerLambda.addToRolePolicy(
            new PolicyStatement({
                effect: Effect.ALLOW,
                actions: [
                    "appsync:GraphQL"
                ],
                resources: [
                    // this ARN is retrieved post secret creation
                    ...props.stage === Stages.DEV ? [ "arn:aws:appsync:us-west-2:963863720257:apis/pkr6ygyik5bqjigb6nd57jl2cm/types/Query/*"] : [],
                    ...props.stage === Stages.PROD ? ["arn:aws:appsync:us-west-2:251312580862:apis/p3a4pwssi5dejox33pvznpvz4u/types/Query/*"] : []
                ]
            })
        );

        // Create environment variables that we will use in the consumers function code
        this.referralConsumerLambda.addEnvironment(`${Constants.MoonbeamConstants.ENV_NAME}`, props.stage);

        // create a new FIFO SNS topic, with deduplication enabled based on the message contents, used for referral message processing
        const referralProcessingTopic = new aws_sns.Topic(this, `${props.referralProducerConsumerConfig.referralFanOutConfig.referralProcessingTopicName}-${props.stage}-${props.env!.region}`, {
            displayName: `${props.referralProducerConsumerConfig.referralFanOutConfig.referralProcessingTopicName}`,
            topicName: `${props.referralProducerConsumerConfig.referralFanOutConfig.referralProcessingTopicName}-${props.stage}-${props.env!.region}`,
            fifo: true,
            // we are guaranteed that for messages with a same content, to be dropped in the topic, that the deduplication id will be based on the content
            contentBasedDeduplication: true
        });

        // give the referral producer Lambda, acting as the acknowledgment service or producer, permissions to publish messages in the referral SNS topic
        referralProcessingTopic.grantPublish(this.referralProducerLambda);

        // Create environment variables that we will use in the producer function code
        this.referralProducerLambda.addEnvironment(`${Constants.MoonbeamConstants.REFERRAL_PROCESSING_TOPIC_ARN}`, referralProcessingTopic.topicArn);
        this.referralProducerLambda.addEnvironment(`${Constants.MoonbeamConstants.ENV_NAME}`, props.stage);

        /**
         * create a new FIFO SQS queue, with deduplication enabled based on the message contents,
         * that will be subscribed to the SNS topic above, used for referral processing.
         *
         * This will be used for processing incoming referrals eligible to be redeemed.
         */
        const referralProcessingQueue = new aws_sqs.Queue(this, `${props.referralProducerConsumerConfig.referralFanOutConfig.referralProcessingQueueName}-${props.stage}-${props.env!.region}.fifo`, {
            queueName: `${props.referralProducerConsumerConfig.referralFanOutConfig.referralProcessingQueueName}-${props.stage}-${props.env!.region}.fifo`,
            // long-polling enabled here, waits to receive a message for 10 seconds
            receiveMessageWaitTime: Duration.seconds(10),
            /**
             * the time that a message will wait to be deleted by one of the queue subscribers (aka how much time to we have to process a referral)
             * since this message will be "invisible" to other consumers during this time.
             */
            visibilityTimeout: Duration.seconds(50),
            fifo: true,
            // we are guaranteed that for messages with a same content, to be dropped in the queue, that the deduplication id will be based on the content
            contentBasedDeduplication: true,
            // creates a dead-letter-queue (DLQ) here, in order to handle any failed messages, that cannot be processed by the consumers of the referral queue
            deadLetterQueue: {
                queue: new aws_sqs.Queue(this, `${props.referralProducerConsumerConfig.referralFanOutConfig.referralProcessingDLQName}-${props.stage}-${props.env!.region}.fifo`, {
                    queueName: `${props.referralProducerConsumerConfig.referralFanOutConfig.referralProcessingDLQName}-${props.stage}-${props.env!.region}.fifo`,
                    fifo: true,
                    contentBasedDeduplication: true,
                    /**
                     * we want to add the maximum retention period for messages in the dead-letter queue which is 1209600 seconds or 14 days,
                     * just to ensure that we have enough time to re-process any failures. For the referral queue, this will be set to
                     * the default of 4 days.
                     */
                    retentionPeriod: Duration.seconds(1209600)
                }),
                // another way of essentially deleting message from the queue, is specifying after how many retries a message will be moved to the dead-letter queue
                maxReceiveCount: 3
            }
        });

        // create a subscription for the referral processing SQS queue, to the SNS referral topic
        referralProcessingTopic.addSubscription(new SqsSubscription(referralProcessingQueue, {
            // the message to the queue is the same as it was sent to the topic
            rawMessageDelivery: true,
            // creates a dead-letter-queue (DLQ) here, in order to handle any failed messages, that cannot be sent from SNS to SQS
            deadLetterQueue: new aws_sqs.Queue(this, `${props.referralProducerConsumerConfig.referralFanOutConfig.referralProcessingTopicDLQName}-${props.stage}-${props.env!.region}.fifo`, {
                queueName: `${props.referralProducerConsumerConfig.referralFanOutConfig.referralProcessingTopicDLQName}-${props.stage}-${props.env!.region}.fifo`,
                fifo: true,
                contentBasedDeduplication: true,
                /**
                 * we want to add the maximum retention period for messages in the dead-letter queue which is 1209600 seconds or 14 days,
                 * just to ensure that we have enough time to re-process any failures. For the referral queue, this will be set to
                 * the default of 4 days.
                 */
                retentionPeriod: Duration.seconds(1209600)
            })
        }));

        /**
         * give the referral consumer Lambda, acting as the processing service or one of the consumers,
         * permissions to consume messages from the SQS referral queue.
         */
        referralProcessingQueue.grantConsumeMessages(this.referralConsumerLambda);

        /**
         * create the event source mapping/trigger for the referral consumer Lambda, which will trigger this Lambda,
         * every time one and/or multiple new SQS event representing referrals eligible to be redeemed are added in the queue, ready to be processed.
         */
        new EventSourceMapping(this, `${props.referralProducerConsumerConfig.referralFanOutConfig.referralProcessingEventSourceMapping}-${props.stage}-${props.env!.region}`, {
            target: this.referralConsumerLambda,
            eventSourceArn: referralProcessingQueue.queueArn,
            /**
             * we do not want the lambda to batch more than 1 records at a time from the queue, we want it to process 1 referral at a time instead.
             * for future purposes, we might want to save cost by increasing this number somewhere between 1-10 (10 max for FIFO queues), in order to process
             * more messages at the same time
             */
            batchSize: 1,
            reportBatchItemFailures: true
        });
    }
}
