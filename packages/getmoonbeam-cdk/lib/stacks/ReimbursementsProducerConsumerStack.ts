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
 * File used to define the ReimbursementsProducerConsumerStack stack, used to create all the necessary resources
 * involved around handling incoming reimbursement-related data in an async fashion (Lambdas, etc.), aws well as
 * around the reimbursement-related fan-out pattern, composed of an event-based process, driven by SNS and SQS. This
 * will help build the infrastructure for the acknowledgment service, or producer, as well as any of its consumers.
 */
export class ReimbursementsProducerConsumerStack extends Stack {

    /**
     * the reimbursements Lambda Function, acting as the acknowledgment service/producer,
     * to be used in configuring REST API Gateway endpoints in dependent stacks, as well as setting up
     * the fan-out mechanism for reimbursements.
     */
    readonly reimbursementsProducerLambda: aws_lambda_nodejs.NodejsFunction;

    /**
     * the consumer for reimbursements Lambda Function, to be used in setting up the fan-out
     * mechanism for incoming reimbursements.
     */
    readonly reimbursementsConsumerLambda: aws_lambda_nodejs.NodejsFunction;

    /**
     * Constructor for the ReimbursementsProducerConsumerStack stack.
     *
     * @param scope scope to be passed in (usually a CDK App Construct)
     * @param id stack id to be passed in
     * @param props stack properties to be passed in
     */
    constructor(scope: Construct, id: string, props: StackProps & Pick<StageConfiguration, 'environmentVariables' | 'stage' | 'reimbursementsProducerConsumerConfig'>) {
        super(scope, id, props);

        // create a new Lambda function, to be used as a trigger for this whole process
        const reimbursementsCronTriggerLambda = new aws_lambda_nodejs.NodejsFunction(this, `${props.reimbursementsProducerConsumerConfig.reimbursementsCronTriggerFunctionName}-${props.stage}-${props.env!.region}`, {
            functionName: `${props.reimbursementsProducerConsumerConfig.reimbursementsCronTriggerFunctionName}-${props.stage}-${props.env!.region}`,
            entry: path.resolve(path.join(__dirname, '../../../moonbeam-reimbursements-cron-trigger-lambda/src/lambda/main.ts')),
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

        // create a new Lambda function to be used with the Card Linking Webhook service for reimbursement purposes, acting as the acknowledgment service or producer
        this.reimbursementsProducerLambda = new aws_lambda_nodejs.NodejsFunction(this, `${props.reimbursementsProducerConsumerConfig.reimbursementsProducerFunctionName}-${props.stage}-${props.env!.region}`, {
            functionName: `${props.reimbursementsProducerConsumerConfig.reimbursementsProducerFunctionName}-${props.stage}-${props.env!.region}`,
            entry: path.resolve(path.join(__dirname, '../../../moonbeam-reimbursements-producer-lambda/src/lambda/main.ts')),
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

        // create a new Lambda function to be used as a consumer for reimbursement data, acting as the reimbursements' processor.
        this.reimbursementsConsumerLambda = new aws_lambda_nodejs.NodejsFunction(this, `${props.reimbursementsProducerConsumerConfig.reimbursementsConsumerFunctionName}-${props.stage}-${props.env!.region}`, {
            functionName: `${props.reimbursementsProducerConsumerConfig.reimbursementsConsumerFunctionName}-${props.stage}-${props.env!.region}`,
            entry: path.resolve(path.join(__dirname, '../../../moonbeam-reimbursements-consumer-lambda/src/lambda/main.ts')),
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

        // create a CRON expression trigger that will enable running the reimbursement producer lambda to run at 11 PM every day
        new Rule(this, `${props.reimbursementsProducerConsumerConfig.reimbursementsCronRuleName}-${props.stage}-${props.env!.region}`, {
            ruleName: `${props.reimbursementsProducerConsumerConfig.reimbursementsCronRuleName}-${props.stage}-${props.env!.region}`,
            description: "Schedule the Reimbursements Trigger Lambda which initiates the reimbursement process daily, at 11PM",
            // the timezone for this cron expression is in UTC (for now schedule this to run on the 1st of December 2023, so we can avoid reimbursing anyone)
            schedule: Schedule.cron({
                month: '12',
                day: '1',
                year: '2023',
                minute: '30',
                hour: '08'
            }),
            targets: [new LambdaFunction(reimbursementsCronTriggerLambda)],
        });

        // enable the Lambda function the retrieval of the Moonbeam internal API secrets
        reimbursementsCronTriggerLambda.addToRolePolicy(
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
        reimbursementsCronTriggerLambda.addToRolePolicy(
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
        reimbursementsCronTriggerLambda.addToRolePolicy(
            new PolicyStatement({
                effect: Effect.ALLOW,
                actions: [
                    "appsync:GraphQL"
                ],
                resources: [
                    // this ARN is retrieved post secret creation
                    ...props.stage === Stages.DEV ? ["arn:aws:appsync:us-west-2:963863720257:apis/pkr6ygyik5bqjigb6nd57jl2cm/types/Query/*"] : [],
                    ...props.stage === Stages.PROD ? ["arn:aws:appsync:us-west-2:251312580862:apis/p3a4pwssi5dejox33pvznpvz4u/types/Query/*"] : []
                ]
            })
        );
        // enable the Lambda function the retrieval of the Olive API secrets
        this.reimbursementsConsumerLambda.addToRolePolicy(
            new PolicyStatement({
                effect: Effect.ALLOW,
                actions: [
                    "secretsmanager:GetSecretValue"
                ],
                resources: [
                    // this ARN is retrieved post secret creation
                    ...props.stage === Stages.DEV ? ["arn:aws:secretsmanager:us-west-2:963863720257:secret:olive-secret-pair-dev-us-west-2-OTgCOk"] : [],
                    ...props.stage === Stages.PROD ? ["arn:aws:secretsmanager:us-west-2:251312580862:secret:olive-secret-pair-prod-us-west-2-gIvRt8"] : []
                ]
            })
        );
        // enable the Lambda function the retrieval of the Moonbeam internal API secrets
        this.reimbursementsConsumerLambda.addToRolePolicy(
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
        this.reimbursementsConsumerLambda.addToRolePolicy(
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
        this.reimbursementsConsumerLambda.addToRolePolicy(
            new PolicyStatement({
                effect: Effect.ALLOW,
                actions: [
                    "appsync:GraphQL"
                ],
                resources: [
                    // this ARN is retrieved post secret creation
                    ...props.stage === Stages.DEV ? ["arn:aws:appsync:us-west-2:963863720257:apis/pkr6ygyik5bqjigb6nd57jl2cm/types/Query/*"] : [],
                    ...props.stage === Stages.PROD ? ["arn:aws:appsync:us-west-2:251312580862:apis/p3a4pwssi5dejox33pvznpvz4u/types/Query/*"] : []
                ]
            })
        );

        // Create environment variables that we will use in the cron function code
        reimbursementsCronTriggerLambda.addEnvironment(`${Constants.MoonbeamConstants.ENV_NAME}`, props.stage);

        // Create environment variables that we will use in the consumer function code
        this.reimbursementsConsumerLambda.addEnvironment(`${Constants.MoonbeamConstants.ENV_NAME}`, props.stage);

        // create a new FIFO SNS topic, with deduplication enabled based on the message contents, used for reimbursements message processing
        const reimbursementsProcessingTopic = new aws_sns.Topic(this, `${props.reimbursementsProducerConsumerConfig.reimbursementsFanOutConfig.reimbursementsProcessingTopicName}-${props.stage}-${props.env!.region}`, {
            displayName: `${props.reimbursementsProducerConsumerConfig.reimbursementsFanOutConfig.reimbursementsProcessingTopicName}`,
            topicName: `${props.reimbursementsProducerConsumerConfig.reimbursementsFanOutConfig.reimbursementsProcessingTopicName}-${props.stage}-${props.env!.region}`,
            fifo: true,
            // we are guaranteed that for messages with a same content, to be dropped in the topic, that the deduplication id will be based on the content
            contentBasedDeduplication: true
        });

        // give the reimbursements producer Lambda, acting as the acknowledgment service or producer, permissions to publish messages in the reimbursements SNS topic
        reimbursementsProcessingTopic.grantPublish(this.reimbursementsProducerLambda);

        // Create environment variables that we will use in the producer function code
        this.reimbursementsProducerLambda.addEnvironment(`${Constants.MoonbeamConstants.REIMBURSEMENTS_PROCESSING_TOPIC_ARN}`, reimbursementsProcessingTopic.topicArn);
        this.reimbursementsConsumerLambda.addEnvironment(`${Constants.MoonbeamConstants.ENV_NAME}`, props.stage);

        /**
         * create a new FIFO SQS queue, with deduplication enabled based on the message contents,
         * that will be subscribed to the SNS topic above, used for reimbursements processing.
         *
         * This will be used for processing incoming reimbursements.
         */
        const reimbursementsProcessingQueue = new aws_sqs.Queue(this, `${props.reimbursementsProducerConsumerConfig.reimbursementsFanOutConfig.reimbursementsProcessingQueueName}-${props.stage}-${props.env!.region}.fifo`, {
            queueName: `${props.reimbursementsProducerConsumerConfig.reimbursementsFanOutConfig.reimbursementsProcessingQueueName}-${props.stage}-${props.env!.region}.fifo`,
            // long-polling enabled here, waits to receive a message for 10 seconds
            receiveMessageWaitTime: Duration.seconds(10),
            /**
             * the time that a message will wait to be deleted by one of the queue subscribers (aka how much time to we have to process a reimbursement)
             * since this message will be "invisible" to other consumers during this time.
             */
            visibilityTimeout: Duration.seconds(50),
            fifo: true,
            // we are guaranteed that for messages with a same content, to be dropped in the queue, that the deduplication id will be based on the content
            contentBasedDeduplication: true,
            // creates a dead-letter-queue (DLQ) here, in order to handle any failed messages, that cannot be processed by the consumers of the reimbursements queue
            deadLetterQueue: {
                queue: new aws_sqs.Queue(this, `${props.reimbursementsProducerConsumerConfig.reimbursementsFanOutConfig.reimbursementsProcessingDLQName}-${props.stage}-${props.env!.region}.fifo`, {
                    queueName: `${props.reimbursementsProducerConsumerConfig.reimbursementsFanOutConfig.reimbursementsProcessingDLQName}-${props.stage}-${props.env!.region}.fifo`,
                    fifo: true,
                    contentBasedDeduplication: true,
                    /**
                     * we want to add the maximum retention period for messages in the dead-letter queue which is 1209600 seconds or 14 days,
                     * just to ensure that we have enough time to re-process any failures. For the reimbursements queue, this will be set to
                     * the default of 4 days.
                     */
                    retentionPeriod: Duration.seconds(1209600)
                }),
                // another way of essentially deleting message from the queue, is specifying after how many retries a message will be moved to the dead-letter queue
                maxReceiveCount: 3
            }
        });

        // ToDo: when notifications will be implemented, we will need to create another queue, responsible for processing notifications,
        //  as well as a corresponding subscription and service

        // create a subscription for the reimbursements processing SQS queue, to the SNS reimbursements topic
        reimbursementsProcessingTopic.addSubscription(new SqsSubscription(reimbursementsProcessingQueue, {
            // the message to the queue is the same as it was sent to the topic
            rawMessageDelivery: true,
            // creates a dead-letter-queue (DLQ) here, in order to handle any failed messages, that cannot be sent from SNS to SQS
            deadLetterQueue: new aws_sqs.Queue(this, `${props.reimbursementsProducerConsumerConfig.reimbursementsFanOutConfig.reimbursementsProcessingTopicDLQName}-${props.stage}-${props.env!.region}.fifo`, {
                queueName: `${props.reimbursementsProducerConsumerConfig.reimbursementsFanOutConfig.reimbursementsProcessingTopicDLQName}-${props.stage}-${props.env!.region}.fifo`,
                fifo: true,
                contentBasedDeduplication: true,
                /**
                 * we want to add the maximum retention period for messages in the dead-letter queue which is 1209600 seconds or 14 days,
                 * just to ensure that we have enough time to re-process any failures. For the reimbursements queue, this will be set to
                 * the default of 4 days.
                 */
                retentionPeriod: Duration.seconds(1209600)
            })
        }));

        /**
         * give the reimbursements consumer Lambda, acting as the processing service or one of the consumers,
         * permissions to consume messages from the SQS reimbursements processing queue.
         */
        reimbursementsProcessingQueue.grantConsumeMessages(this.reimbursementsConsumerLambda);

        /**
         * create the event source mapping/trigger for the reimbursements consumer Lambda, which will trigger this Lambda,
         * every time one and/or multiple new SQS event representing reimbursement events are added in the queue, ready to be processed.
         */
        new EventSourceMapping(this, `${props.reimbursementsProducerConsumerConfig.reimbursementsFanOutConfig.reimbursementsProcessingEventSourceMapping}-${props.stage}-${props.env!.region}`, {
            target: this.reimbursementsConsumerLambda,
            eventSourceArn: reimbursementsProcessingQueue.queueArn,
            /**
             * we do not want the lambda to batch more than 1 records at a time from the queue, we want it to process 1 reimbursement event at a time instead.
             * for future purposes, we might want to save cost by increasing this number somewhere between 1-10 (10 max for FIFO queues), in order to process
             * more messages at the same time
             */
            batchSize: 1,
            reportBatchItemFailures: true
        });
    }
}
