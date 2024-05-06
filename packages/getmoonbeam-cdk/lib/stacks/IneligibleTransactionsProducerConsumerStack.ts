import {aws_lambda, aws_lambda_nodejs, aws_sns, aws_sqs, Duration, Stack, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {StageConfiguration} from "../models/StageConfiguration";
import path from "path";
import {Effect, PolicyStatement} from "aws-cdk-lib/aws-iam";
import {Constants, Stages} from "@moonbeam/moonbeam-models";
import {SqsSubscription} from "aws-cdk-lib/aws-sns-subscriptions";
import {EventSourceMapping} from "aws-cdk-lib/aws-lambda";

/**
 * File used to define the IneligibleTransactionsProducerConsumerStack stack, used to create all the necessary resources
 * involved around handling incoming ineligible transactional data in an async fashion (Lambdas, etc.), as well as
 * around the ineligible transactions-related fan-out pattern, composed of an event-based process, driven by SNS and SQS. This
 * will help build the infrastructure for the acknowledgment service, or producer, as well as any of its consumers.
 *
 * This will be mainly used for our 1 cent feature or whenever we want to build features around Olive-driven/based transactions
 * that are not eligible for Offer matching.
 */
export class IneligibleTransactionsProducerConsumerStack extends Stack {

    /**
     * the ineligible transactions consumer Lambda Function, acting as the
     * ineligible transactions consumer, to be used during the whole
     * ineligible transactions process, by consuming dropped messages from the appropriate topic and queue.
     */
    readonly ineligibleTransactionsConsumerLambda: aws_lambda_nodejs.NodejsFunction;

    /**
     * the ineligible transactions notifications consumer Lambda Function, acting as the
     * ineligible transactions notifications consumer, to be used during the whole
     * ineligible transactions notifications process, by consuming dropped messages from the appropriate topic and queue.
     */
    readonly ineligibleTransactionsNotificationsConsumerLambda: aws_lambda_nodejs.NodejsFunction;

    /**
     * the ineligible transactions processing topic, to be used when granting the transactions
     * producer lambda permissions.
     */
    readonly ineligibleTransactionsProcessingTopic: aws_sns.Topic;

    /**
     * Constructor for the IneligibleTransactionsProducerConsumer resolver stack.
     *
     * @param scope scope to be passed in (usually a CDK App Construct)
     * @param id stack id to be passed in
     * @param props stack properties to be passed in
     */
    constructor(scope: Construct, id: string, props: StackProps & Pick<StageConfiguration, 'environmentVariables' | 'stage' | 'ineligibleTransactionsProducerConsumerConfig'>) {
        super(scope, id, props);

        // create a new Lambda function to be used as a consumer for ineligible transactional data, acting as the ineligible transaction processor.
        this.ineligibleTransactionsConsumerLambda = new aws_lambda_nodejs.NodejsFunction(this, `${props.ineligibleTransactionsProducerConsumerConfig.ineligibleTransactionsConsumerFunctionName}-${props.stage}-${props.env!.region}`, {
            functionName: `${props.ineligibleTransactionsProducerConsumerConfig.ineligibleTransactionsConsumerFunctionName}-${props.stage}-${props.env!.region}`,
            entry: path.resolve(path.join(__dirname, '../../../moonbeam-ineligible-transactions-consumer-lambda/src/lambda/main.ts')),
            handler: 'handler',
            runtime: aws_lambda.Runtime.NODEJS_18_X,
            // we add a timeout here different from the default of 3 seconds, since we expect these API calls to take longer
            timeout: Duration.seconds(900),
            bundling: {
                minify: true, // minify code, defaults to false
                sourceMap: true, // include source map, defaults to false
                sourceMapMode: aws_lambda_nodejs.SourceMapMode.BOTH, // defaults to SourceMapMode.DEFAULT
                sourcesContent: false, // do not include original source into source map, defaults to true
                target: 'esnext', // target environment for the generated JavaScript code
            }
        });
        // enable the Lambda function the retrieval of the Olive API secrets
        this.ineligibleTransactionsConsumerLambda.addToRolePolicy(
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
        this.ineligibleTransactionsConsumerLambda.addToRolePolicy(
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
        this.ineligibleTransactionsConsumerLambda.addToRolePolicy(
            new PolicyStatement({
                effect: Effect.ALLOW,
                actions: [
                    "appsync:GraphQL"
                ],
                resources: [
                    // this ARN is retrieved post GraphQL API creation
                    ...props.stage === Stages.DEV ? ["arn:aws:appsync:us-west-2:963863720257:apis/pkr6ygyik5bqjigb6nd57jl2cm/types/Mutation/*"] : [],
                    ...props.stage === Stages.PROD ? ["arn:aws:appsync:us-west-2:251312580862:apis/p3a4pwssi5dejox33pvznpvz4u/types/Mutation/*"] : []
                ]
            })
        );
        this.ineligibleTransactionsConsumerLambda.addToRolePolicy(
            new PolicyStatement({
                effect: Effect.ALLOW,
                actions: [
                    "appsync:GraphQL"
                ],
                resources: [
                    // this ARN is retrieved post GraphQL API creation
                    ...props.stage === Stages.DEV ? [ "arn:aws:appsync:us-west-2:963863720257:apis/pkr6ygyik5bqjigb6nd57jl2cm/types/Query/*"] : [],
                    ...props.stage === Stages.PROD ? ["arn:aws:appsync:us-west-2:251312580862:apis/p3a4pwssi5dejox33pvznpvz4u/types/Query/*"] : []
                ]
            })
        );

        // create a new Lambda function to be used as a consumer for notifications for ineligible transactions, acting as the ineligible transactions notifications processor.
        this.ineligibleTransactionsNotificationsConsumerLambda = new aws_lambda_nodejs.NodejsFunction(this, `${props.ineligibleTransactionsProducerConsumerConfig.ineligibleTransactionsNotificationsConsumerFunctionName}-${props.stage}-${props.env!.region}`, {
            functionName: `${props.ineligibleTransactionsProducerConsumerConfig.ineligibleTransactionsNotificationsConsumerFunctionName}-${props.stage}-${props.env!.region}`,
            entry: path.resolve(path.join(__dirname, '../../../moonbeam-ineligible-transactions-notifications-consumer-lambda/src/lambda/main.ts')),
            handler: 'handler',
            runtime: aws_lambda.Runtime.NODEJS_18_X,
            // we add a timeout here different from the default of 3 seconds, since we expect these API calls to take longer
            timeout: Duration.seconds(900),
            bundling: {
                minify: true, // minify code, defaults to false
                sourceMap: true, // include source map, defaults to false
                sourceMapMode: aws_lambda_nodejs.SourceMapMode.BOTH, // defaults to SourceMapMode.DEFAULT
                sourcesContent: false, // do not include original source into source map, defaults to true
                target: 'esnext', // target environment for the generated JavaScript code
            }
        });
        // enable the Lambda function the retrieval of the Olive API secrets
        this.ineligibleTransactionsNotificationsConsumerLambda.addToRolePolicy(
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
        this.ineligibleTransactionsNotificationsConsumerLambda.addToRolePolicy(
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
        this.ineligibleTransactionsNotificationsConsumerLambda.addToRolePolicy(
            new PolicyStatement({
                effect: Effect.ALLOW,
                actions: [
                    "appsync:GraphQL"
                ],
                resources: [
                    // this ARN is retrieved post GraphQL API creation
                    ...props.stage === Stages.DEV ? ["arn:aws:appsync:us-west-2:963863720257:apis/pkr6ygyik5bqjigb6nd57jl2cm/types/Mutation/*"] : [],
                    ...props.stage === Stages.PROD ? ["arn:aws:appsync:us-west-2:251312580862:apis/p3a4pwssi5dejox33pvznpvz4u/types/Mutation/*"] : []
                ]
            })
        );
        this.ineligibleTransactionsNotificationsConsumerLambda.addToRolePolicy(
            new PolicyStatement({
                effect: Effect.ALLOW,
                actions: [
                    "appsync:GraphQL"
                ],
                resources: [
                    // this ARN is retrieved post GraphQL API creation
                    ...props.stage === Stages.DEV ? [ "arn:aws:appsync:us-west-2:963863720257:apis/pkr6ygyik5bqjigb6nd57jl2cm/types/Query/*"] : [],
                    ...props.stage === Stages.PROD ? ["arn:aws:appsync:us-west-2:251312580862:apis/p3a4pwssi5dejox33pvznpvz4u/types/Query/*"] : []
                ]
            })
        );

        // Create environment variables that we will use in the consumers function code
        this.ineligibleTransactionsConsumerLambda.addEnvironment(`${Constants.MoonbeamConstants.ENV_NAME}`, props.stage);
        this.ineligibleTransactionsNotificationsConsumerLambda.addEnvironment(`${Constants.MoonbeamConstants.ENV_NAME}`, props.stage);

        // create a new FIFO SNS topic, with deduplication enabled based on the message contents, used for ineligible transaction message processing
        this.ineligibleTransactionsProcessingTopic = new aws_sns.Topic(this, `${props.ineligibleTransactionsProducerConsumerConfig.ineligibleTransactionsFanOutConfig.ineligibleTransactionsProcessingTopicName}-${props.stage}-${props.env!.region}`, {
            displayName: `${props.ineligibleTransactionsProducerConsumerConfig.ineligibleTransactionsFanOutConfig.ineligibleTransactionsProcessingTopicName}`,
            topicName: `${props.ineligibleTransactionsProducerConsumerConfig.ineligibleTransactionsFanOutConfig.ineligibleTransactionsProcessingTopicName}-${props.stage}-${props.env!.region}`,
            fifo: true,
            // we are guaranteed that for messages with a same content, to be dropped in the topic, that the deduplication id will be based on the content
            contentBasedDeduplication: true
        });

        /**
         * create a new FIFO SQS queue, with deduplication enabled based on the message contents,
         * that will be subscribed to the SNS topic above, used for ineligible transactions processing.
         *
         * This will be used for processing incoming transactions ineligible to be redeemed as offers.
         */
        const ineligibleTransactionalOffersProcessingQueue = new aws_sqs.Queue(this, `${props.ineligibleTransactionsProducerConsumerConfig.ineligibleTransactionsFanOutConfig.ineligibleTransactionsProcessingQueueName}-${props.stage}-${props.env!.region}.fifo`, {
            queueName: `${props.ineligibleTransactionsProducerConsumerConfig.ineligibleTransactionsFanOutConfig.ineligibleTransactionsProcessingQueueName}-${props.stage}-${props.env!.region}.fifo`,
            // long-polling enabled here, waits to receive a message for 10 seconds
            receiveMessageWaitTime: Duration.seconds(10),
            /**
             * the time that a message will wait to be deleted by one of the queue subscribers (aka how much time to we have to process an ineligible transaction)
             * since this message will be "invisible" to other consumers during this time.
             */
            visibilityTimeout: Duration.seconds(900),
            fifo: true,
            // we are guaranteed that for messages with a same content, to be dropped in the queue, that the deduplication id will be based on the content
            contentBasedDeduplication: true,
            // creates a dead-letter-queue (DLQ) here, in order to handle any failed messages, that cannot be processed by the consumers of the ineligible transactions queue
            deadLetterQueue: {
                queue: new aws_sqs.Queue(this, `${props.ineligibleTransactionsProducerConsumerConfig.ineligibleTransactionsFanOutConfig.ineligibleTransactionsProcessingDLQName}-${props.stage}-${props.env!.region}.fifo`, {
                    queueName: `${props.ineligibleTransactionsProducerConsumerConfig.ineligibleTransactionsFanOutConfig.ineligibleTransactionsProcessingDLQName}-${props.stage}-${props.env!.region}.fifo`,
                    fifo: true,
                    contentBasedDeduplication: true,
                    /**
                     * we want to add the maximum retention period for messages in the dead-letter queue which is 1209600 seconds or 14 days,
                     * just to ensure that we have enough time to re-process any failures. For the ineligible transactions queue, this will be set to
                     * the default of 4 days.
                     */
                    retentionPeriod: Duration.seconds(1209600)
                }),
                // another way of essentially deleting message from the queue, is specifying after how many retries a message will be moved to the dead-letter queue
                maxReceiveCount: 3
            }
        });

        // create a subscription for the ineligible transactions processing SQS queue, to the SNS ineligible transactions topic
        this.ineligibleTransactionsProcessingTopic.addSubscription(new SqsSubscription(ineligibleTransactionalOffersProcessingQueue, {
            // the message to the queue is the same as it was sent to the topic
            rawMessageDelivery: true,
            // creates a dead-letter-queue (DLQ) here, in order to handle any failed messages, that cannot be sent from SNS to SQS
            deadLetterQueue: new aws_sqs.Queue(this, `${props.ineligibleTransactionsProducerConsumerConfig.ineligibleTransactionsFanOutConfig.ineligibleTransactionsProcessingTopicDLQName}-${props.stage}-${props.env!.region}.fifo`, {
                queueName: `${props.ineligibleTransactionsProducerConsumerConfig.ineligibleTransactionsFanOutConfig.ineligibleTransactionsProcessingTopicDLQName}-${props.stage}-${props.env!.region}.fifo`,
                fifo: true,
                contentBasedDeduplication: true,
                /**
                 * we want to add the maximum retention period for messages in the dead-letter queue which is 1209600 seconds or 14 days,
                 * just to ensure that we have enough time to re-process any failures. For the ineligible transactions queue, this will be set to
                 * the default of 4 days.
                 */
                retentionPeriod: Duration.seconds(1209600)
            })
        }));

        /**
         * give the ineligible transactions consumer Lambda, acting as the processing service or one of the consumers,
         * permissions to consume messages from the SQS ineligible transactions queue.
         */
        ineligibleTransactionalOffersProcessingQueue.grantConsumeMessages(this.ineligibleTransactionsConsumerLambda);

        /**
         * create the event source mapping/trigger for the ineligible transactions consumer Lambda, which will trigger this Lambda,
         * every time one and/or multiple new SQS event representing ineligible transactions are added in the queue, ready to be processed.
         */
        new EventSourceMapping(this, `${props.ineligibleTransactionsProducerConsumerConfig.ineligibleTransactionsFanOutConfig.ineligibleTransactionsProcessingEventSourceMapping}-${props.stage}-${props.env!.region}`, {
            target: this.ineligibleTransactionsConsumerLambda,
            eventSourceArn: ineligibleTransactionalOffersProcessingQueue.queueArn,
            /**
             * we do not want the lambda to batch more than 1 records at a time from the queue, we want it to process 1 ineligible transaction at a time instead.
             * for future purposes, we might want to save cost by increasing this number somewhere between 1-10 (10 max for FIFO queues), in order to process
             * more messages at the same time
             */
            batchSize: 1,
            reportBatchItemFailures: true
        });

        /**
         * create a new FIFO SQS queue, with deduplication enabled based on the message contents,
         * that will be subscribed to the SNS topic above, used for ineligible transactions notifications processing.
         *
         * This will be used for processing notifications for incoming ineligible transactions.
         */
        const ineligibleTransactionsNotificationsProcessingQueue = new aws_sqs.Queue(this, `${props.ineligibleTransactionsProducerConsumerConfig.ineligibleTransactionsFanOutConfig.ineligibleTransactionsNotificationsProcessingQueueName}-${props.stage}-${props.env!.region}.fifo`, {
            queueName: `${props.ineligibleTransactionsProducerConsumerConfig.ineligibleTransactionsFanOutConfig.ineligibleTransactionsNotificationsProcessingQueueName}-${props.stage}-${props.env!.region}.fifo`,
            // long-polling enabled here, waits to receive a message for 10 seconds
            receiveMessageWaitTime: Duration.seconds(10),
            /**
             * the time that a message will wait to be deleted by one of the queue subscribers (aka how much time to we have to process a notification for an ineligible transaction)
             * since this message will be "invisible" to other consumers during this time.
             */
            visibilityTimeout: Duration.seconds(900),
            fifo: true,
            // we are guaranteed that for messages with a same content, to be dropped in the queue, that the deduplication id will be based on the content
            contentBasedDeduplication: true,
            // creates a dead-letter-queue (DLQ) here, in order to handle any failed messages, that cannot be processed by the consumers of the ineligible transactions notifications  queue
            deadLetterQueue: {
                queue: new aws_sqs.Queue(this, `${props.ineligibleTransactionsProducerConsumerConfig.ineligibleTransactionsFanOutConfig.ineligibleTransactionsNotificationsProcessingDLQName}-${props.stage}-${props.env!.region}.fifo`, {
                    queueName: `${props.ineligibleTransactionsProducerConsumerConfig.ineligibleTransactionsFanOutConfig.ineligibleTransactionsNotificationsProcessingDLQName}-${props.stage}-${props.env!.region}.fifo`,
                    fifo: true,
                    contentBasedDeduplication: true,
                    /**
                     * we want to add the maximum retention period for messages in the dead-letter queue which is 1209600 seconds or 14 days,
                     * just to ensure that we have enough time to re-process any failures. For the ineligible transactions notifications queue, this will be set to
                     * the default of 4 days.
                     */
                    retentionPeriod: Duration.seconds(1209600)
                }),
                // another way of essentially deleting message from the queue, is specifying after how many retries a message will be moved to the dead-letter queue
                maxReceiveCount: 3
            }
        });

        // create a subscription for the ineligible transactions notifications processing SQS queue, to the SNS ineligible transactions topic
        this.ineligibleTransactionsProcessingTopic.addSubscription(new SqsSubscription(ineligibleTransactionsNotificationsProcessingQueue, {
            // the message to the queue is the same as it was sent to the topic
            rawMessageDelivery: true,
            // creates a dead-letter-queue (DLQ) here, in order to handle any failed messages, that cannot be sent from SNS to SQS
            deadLetterQueue: new aws_sqs.Queue(this, `${props.ineligibleTransactionsProducerConsumerConfig.ineligibleTransactionsFanOutConfig.ineligibleTransactionsNotificationsTopicDLQName}-${props.stage}-${props.env!.region}.fifo`, {
                queueName: `${props.ineligibleTransactionsProducerConsumerConfig.ineligibleTransactionsFanOutConfig.ineligibleTransactionsNotificationsTopicDLQName}-${props.stage}-${props.env!.region}.fifo`,
                fifo: true,
                contentBasedDeduplication: true,
                /**
                 * we want to add the maximum retention period for messages in the dead-letter queue which is 1209600 seconds or 14 days,
                 * just to ensure that we have enough time to re-process any failures. For the transactions queue, this will be set to
                 * the default of 4 days.
                 */
                retentionPeriod: Duration.seconds(1209600)
            })
        }));

        /**
         * give the ineligible notifications consumer Lambda, acting as the processing service or one of the consumers,
         * permissions to consume messages from the SQS ineligible transactions notifications offers queue.
         */
        ineligibleTransactionsNotificationsProcessingQueue.grantConsumeMessages(this.ineligibleTransactionsNotificationsConsumerLambda);

        /**
         * create the event source mapping/trigger for the ineligible transactions notifications consumer Lambda, which will trigger this Lambda,
         * every time one and/or multiple new SQS event representing notifications for ineligible transactions are added in the queue, ready to be processed.
         */
        new EventSourceMapping(this, `${props.ineligibleTransactionsProducerConsumerConfig.ineligibleTransactionsFanOutConfig.ineligibleTransactionsNotificationsProcessingEventSourceMapping}-${props.stage}-${props.env!.region}`, {
            target: this.ineligibleTransactionsNotificationsConsumerLambda,
            eventSourceArn: ineligibleTransactionsNotificationsProcessingQueue.queueArn,
            /**
             * we do not want the lambda to batch more than 1 records at a time from the queue, we want it to process 1 ineligible notification transaction at a time instead.
             * for future purposes, we might want to save cost by increasing this number somewhere between 1-10 (10 max for FIFO queues), in order to process
             * more messages at the same time
             */
            batchSize: 1,
            reportBatchItemFailures: true
        });
    }
}
