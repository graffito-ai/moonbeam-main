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
 * File used to define the NotificationReminderProducerConsumer stack, used to create all the necessary resources
 * involved around handling incoming notification reminders in an async fashion (Lambdas, etc.), as well as
 * around the notification reminder related fan-out pattern, composed of an event-based process, driven by SNS and SQS.
 * This will help build the infrastructure for the acknowledgment service, or producer, as well as any of its consumers.
 */
export class NotificationReminderProducerConsumerStack extends Stack {

    /**
     * the notification reminder producer Lambda Function, acting as the
     * notification reminder producer, to be used in kick-starting the whole notification
     * reminder process, by dropping messages in the appropriate topic and queue.
     */
    readonly notificationReminderProducerLambda: aws_lambda_nodejs.NodejsFunction;

    /**
     * the notification reminder consumer Lambda Function, acting as the notification
     * reminder consumer, to be used during the whole notification reminder
     * process, by consuming dropped messages from the appropriate topic and queue.
     */
    readonly notificationReminderConsumerLambda: aws_lambda_nodejs.NodejsFunction;

    /**
     * Constructor for the NotificationReminderProducerConsumerStack stack.
     *
     * @param scope scope to be passed in (usually a CDK App Construct)
     * @param id stack id to be passed in
     * @param props stack properties to be passed in
     */
    constructor(scope: Construct, id: string, props: StackProps & Pick<StageConfiguration, 'environmentVariables' | 'stage' | 'notificationReminderProducerConsumerConfig'>) {
        super(scope, id, props);

        // create a new Lambda function to be used for notification reminder purposes, acting as the acknowledgment service or producer
        this.notificationReminderProducerLambda = new aws_lambda_nodejs.NodejsFunction(this, `${props.notificationReminderProducerConsumerConfig.notificationReminderProducerFunctionName}-${props.stage}-${props.env!.region}`, {
            functionName: `${props.notificationReminderProducerConsumerConfig.notificationReminderProducerFunctionName}-${props.stage}-${props.env!.region}`,
            entry: path.resolve(path.join(__dirname, '../../../moonbeam-notification-reminder-producer-lambda/src/lambda/main.ts')),
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
        // create a CRON expression trigger that will enable running the notification reminder producer lambda to run at 11 PM every day
        new Rule(this, `${props.notificationReminderProducerConsumerConfig.notificationReminderCronRuleName}-${props.stage}-${props.env!.region}`, {
            ruleName: `${props.notificationReminderProducerConsumerConfig.notificationReminderCronRuleName}-${props.stage}-${props.env!.region}`,
            description: "Schedule the Notification Reminder Trigger Lambda which initiates the notification reminder Lambda/process daily, at 7PM CST",
            // set the CRON timezone to the UTC time to match 7 PM CST, 12 PM MST/ 2 PM CST / 3 PM EST
            schedule: Schedule.cron({
                day: '*',
                minute: '10',
                hour: '18'
            }),
            targets: [new LambdaFunction(this.notificationReminderProducerLambda)],
        });

        // create a new Lambda function to be used as a consumer for notification reminder purposes, acting as the consuming service or consumer
        this.notificationReminderConsumerLambda = new aws_lambda_nodejs.NodejsFunction(this, `${props.notificationReminderProducerConsumerConfig.notificationReminderConsumerFunctionName}-${props.stage}-${props.env!.region}`, {
            functionName: `${props.notificationReminderProducerConsumerConfig.notificationReminderConsumerFunctionName}-${props.stage}-${props.env!.region}`,
            entry: path.resolve(path.join(__dirname, '../../../moonbeam-notification-reminder-consumer-lambda/src/lambda/main.ts')),
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
        this.notificationReminderProducerLambda.addToRolePolicy(
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
        this.notificationReminderProducerLambda.addToRolePolicy(
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
        this.notificationReminderProducerLambda.addToRolePolicy(
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
        this.notificationReminderConsumerLambda.addToRolePolicy(
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
        this.notificationReminderConsumerLambda.addToRolePolicy(
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
        this.notificationReminderConsumerLambda.addToRolePolicy(
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
        this.notificationReminderConsumerLambda.addEnvironment(`${Constants.MoonbeamConstants.ENV_NAME}`, props.stage);

        // create a new FIFO SNS topic, with deduplication enabled based on the message contents, used for notification reminder message processing
        const notificationReminderProcessingTopic = new aws_sns.Topic(this, `${props.notificationReminderProducerConsumerConfig.notificationReminderFanOutConfig.notificationReminderProcessingTopicName}-${props.stage}-${props.env!.region}`, {
            displayName: `${props.notificationReminderProducerConsumerConfig.notificationReminderFanOutConfig.notificationReminderProcessingTopicName}`,
            topicName: `${props.notificationReminderProducerConsumerConfig.notificationReminderFanOutConfig.notificationReminderProcessingTopicName}-${props.stage}-${props.env!.region}`,
            fifo: true,
            // we are guaranteed that for messages with a same content, to be dropped in the topic, that the deduplication id will be based on the content
            contentBasedDeduplication: true
        });

        // give the notification reminder producer Lambda, permissions to publish messages in the notification reminder processing SNS topic
        notificationReminderProcessingTopic.grantPublish(this.notificationReminderProducerLambda);

        // Create environment variables that we will use in the producer function code
        this.notificationReminderProducerLambda.addEnvironment(`${Constants.MoonbeamConstants.NOTIFICATION_REMINDER_PROCESSING_TOPIC_ARN}`, notificationReminderProcessingTopic.topicArn);
        this.notificationReminderProducerLambda.addEnvironment(`${Constants.MoonbeamConstants.ENV_NAME}`, props.stage);

        /**
         * create a new FIFO SQS queue, with deduplication enabled based on the message contents,
         * that will be subscribed to the SNS topic above, used for notification reminder processing.
         *
         * This will be used for processing incoming notification reminders.
         */
        const notificationReminderProcessingQueue = new aws_sqs.Queue(this, `${props.notificationReminderProducerConsumerConfig.notificationReminderFanOutConfig.notificationReminderProcessingQueueName}-${props.stage}-${props.env!.region}.fifo`, {
            queueName: `${props.notificationReminderProducerConsumerConfig.notificationReminderFanOutConfig.notificationReminderProcessingQueueName}-${props.stage}-${props.env!.region}.fifo`,
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
            // creates a dead-letter-queue (DLQ) here, in order to handle any failed messages, that cannot be processed by the consumers of the notification reminders queue
            deadLetterQueue: {
                queue: new aws_sqs.Queue(this, `${props.notificationReminderProducerConsumerConfig.notificationReminderFanOutConfig.notificationReminderProcessingDLQName}-${props.stage}-${props.env!.region}.fifo`, {
                    queueName: `${props.notificationReminderProducerConsumerConfig.notificationReminderFanOutConfig.notificationReminderProcessingDLQName}-${props.stage}-${props.env!.region}.fifo`,
                    fifo: true,
                    contentBasedDeduplication: true,
                    /**
                     * we want to add the maximum retention period for messages in the dead-letter queue which is 1209600 seconds or 14 days,
                     * just to ensure that we have enough time to re-process any failures. For the notification reminders queue, this will be set to
                     * the default of 4 days.
                     */
                    retentionPeriod: Duration.seconds(1209600)
                }),
                // another way of essentially deleting message from the queue, is specifying after how many retries a message will be moved to the dead-letter queue
                maxReceiveCount: 3
            }
        });

        // create a subscription for the notification reminder processing SQS queue, to the SNS notification reminder processing topic
        notificationReminderProcessingTopic.addSubscription(new SqsSubscription(notificationReminderProcessingQueue, {
            // the message to the queue is the same as it was sent to the topic
            rawMessageDelivery: true,
            // creates a dead-letter-queue (DLQ) here, in order to handle any failed messages, that cannot be sent from SNS to SQS
            deadLetterQueue: new aws_sqs.Queue(this, `${props.notificationReminderProducerConsumerConfig.notificationReminderFanOutConfig.notificationReminderProcessingTopicDLQName}-${props.stage}-${props.env!.region}.fifo`, {
                queueName: `${props.notificationReminderProducerConsumerConfig.notificationReminderFanOutConfig.notificationReminderProcessingTopicDLQName}-${props.stage}-${props.env!.region}.fifo`,
                fifo: true,
                contentBasedDeduplication: true,
                /**
                 * we want to add the maximum retention period for messages in the dead-letter queue which is 1209600 seconds or 14 days,
                 * just to ensure that we have enough time to re-process any failures. For the notification reminder queue, this will be set to
                 * the default of 4 days.
                 */
                retentionPeriod: Duration.seconds(1209600)
            })
        }));

        /**
         * give the notification reminder consumer Lambda, permissions to consume messages from the SQS
         * notification reminder queue.
         */
        notificationReminderProcessingQueue.grantConsumeMessages(this.notificationReminderConsumerLambda);

        /**
         * create the event source mapping/trigger for the notification reminder consumer Lambda, which will trigger this Lambda,
         * every time one and/or multiple new SQS event representing notification reminders are added in the queue, ready to be processed.
         */
        new EventSourceMapping(this, `${props.notificationReminderProducerConsumerConfig.notificationReminderFanOutConfig.notificationReminderProcessingEventSourceMapping}-${props.stage}-${props.env!.region}`, {
            target: this.notificationReminderConsumerLambda,
            eventSourceArn: notificationReminderProcessingQueue.queueArn,
            /**
             * we do not want the lambda to batch more than 1 records at a time from the queue, we want it to process 1 notification reminder at a time instead.
             * for future purposes, we might want to save cost by increasing this number somewhere between 1-10 (10 max for FIFO queues), in order to process
             * more messages at the same time
             */
            batchSize: 1,
            reportBatchItemFailures: true
        });
    }
}
