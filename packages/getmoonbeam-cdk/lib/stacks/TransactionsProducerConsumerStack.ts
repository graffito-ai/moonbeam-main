import {aws_lambda, aws_lambda_nodejs, aws_sns, aws_sqs, Duration, Stack, StackProps} from "aws-cdk-lib";
import {StageConfiguration} from "../models/StageConfiguration";
import {Construct} from "constructs";
import path from "path";
import {Effect, PolicyStatement} from "aws-cdk-lib/aws-iam";
import {Constants, Stages} from "@moonbeam/moonbeam-models";
import {SqsSubscription} from "aws-cdk-lib/aws-sns-subscriptions";
import {EventSourceMapping} from "aws-cdk-lib/aws-lambda";

/**
 * File used to define the TransactionsProducerConsumerStack stack, used to create all the necessary resources
 * involved around handling incoming transactional data in an async fashion (Lambdas, etc.), aws well as
 * around the transactions-related fan-out pattern, composed of an event-based process, driven by SNS and SQS. This
 * will help build the infrastructure for the acknowledgment service, or producer, as well as any of its consumers.
 */
export class TransactionsProducerConsumerStack extends Stack {

    /**
     * the webhook transactions Lambda Function, acting as the acknowledgment service/producer,
     * to be used in configuring REST API Gateway endpoints in dependent stacks, as well as setting up
     * the fan-out mechanism for transactions.
     */
    readonly transactionsProducerLambda: aws_lambda_nodejs.NodejsFunction;

    /**
     * the consumer for transactional offers Lambda Function, to be used in setting up the fan-out
     * mechanism for transactions eligible to be redeemed as offers.
     */
    readonly transactionalOffersConsumerLambda: aws_lambda_nodejs.NodejsFunction;

    /**
     * the consumer for notifications used for transactional offers Lambda Function, to be used in setting up the fan-out
     * mechanism for notifications for transactions eligible to be redeemed as offers.
     */
    readonly notificationsTransactionalOffersConsumerLambda: aws_lambda_nodejs.NodejsFunction;

    /**
     * Constructor for the TransactionsProducerConsumerStack stack.
     *
     * @param scope scope to be passed in (usually a CDK App Construct)
     * @param id stack id to be passed in
     * @param props stack properties to be passed in
     */
    constructor(scope: Construct, id: string, props: StackProps & Pick<StageConfiguration, 'environmentVariables' | 'stage' | 'transactionsProducerConsumerConfig'>) {
        super(scope, id, props);

        // create a new Lambda function to be used with the Card Linking Webhook service for transaction purposes, acting as the acknowledgment service or producer
        this.transactionsProducerLambda = new aws_lambda_nodejs.NodejsFunction(this, `${props.transactionsProducerConsumerConfig.transactionsProducerFunctionName}-${props.stage}-${props.env!.region}`, {
            functionName: `${props.transactionsProducerConsumerConfig.transactionsProducerFunctionName}-${props.stage}-${props.env!.region}`,
            entry: path.resolve(path.join(__dirname, '../../../moonbeam-transactions-producer-lambda/src/lambda/main.ts')),
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

        // create a new Lambda function to be used as a consumer for transactional data, acting as the transaction processor for offers eligible to be redeemed.
        this.transactionalOffersConsumerLambda = new aws_lambda_nodejs.NodejsFunction(this, `${props.transactionsProducerConsumerConfig.transactionalOffersConsumerFunctionName}-${props.stage}-${props.env!.region}`, {
            functionName: `${props.transactionsProducerConsumerConfig.transactionalOffersConsumerFunctionName}-${props.stage}-${props.env!.region}`,
            entry: path.resolve(path.join(__dirname, '../../../moonbeam-transactional-offers-consumer-lambda/src/lambda/main.ts')),
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

        // create a new Lambda function to be used as a consumer for notifications transactional data, acting as the notifications transaction processor for offers eligible to be redeemed.
        this.notificationsTransactionalOffersConsumerLambda = new aws_lambda_nodejs.NodejsFunction(this, `${props.transactionsProducerConsumerConfig.transactionalOffersNotificationsConsumerFunctionName}-${props.stage}-${props.env!.region}`, {
            functionName: `${props.transactionsProducerConsumerConfig.transactionalOffersNotificationsConsumerFunctionName}-${props.stage}-${props.env!.region}`,
            entry: path.resolve(path.join(__dirname, '../../../moonbeam-transactional-notifications-offers-consumer-lambda/src/lambda/main.ts')),
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

        // enable the Lambda function the retrieval of the Olive API secrets
        this.transactionalOffersConsumerLambda.addToRolePolicy(
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
        this.transactionalOffersConsumerLambda.addToRolePolicy(
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
        this.transactionalOffersConsumerLambda.addToRolePolicy(
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
        this.transactionalOffersConsumerLambda.addToRolePolicy(
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
        this.notificationsTransactionalOffersConsumerLambda.addToRolePolicy(
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
        this.notificationsTransactionalOffersConsumerLambda.addToRolePolicy(
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
        this.notificationsTransactionalOffersConsumerLambda.addToRolePolicy(
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
        this.transactionalOffersConsumerLambda.addEnvironment(`${Constants.MoonbeamConstants.ENV_NAME}`, props.stage);
        this.notificationsTransactionalOffersConsumerLambda.addEnvironment(`${Constants.MoonbeamConstants.ENV_NAME}`, props.stage);

        // create a new FIFO SNS topic, with deduplication enabled based on the message contents, used for transaction message processing
        const transactionsProcessingTopic = new aws_sns.Topic(this, `${props.transactionsProducerConsumerConfig.transactionsFanOutConfig.transactionsProcessingTopicName}-${props.stage}-${props.env!.region}`, {
            displayName: `${props.transactionsProducerConsumerConfig.transactionsFanOutConfig.transactionsProcessingTopicName}`,
            topicName: `${props.transactionsProducerConsumerConfig.transactionsFanOutConfig.transactionsProcessingTopicName}-${props.stage}-${props.env!.region}`,
            fifo: true,
            // we are guaranteed that for messages with a same content, to be dropped in the topic, that the deduplication id will be based on the content
            contentBasedDeduplication: true
        });

        // give the webhook transactions Lambda, acting as the acknowledgment service or producer, permissions to publish messages in the transactions SNS topic
        transactionsProcessingTopic.grantPublish(this.transactionsProducerLambda);

        // Create environment variables that we will use in the producer function code
        this.transactionsProducerLambda.addEnvironment(`${Constants.MoonbeamConstants.TRANSACTIONS_PROCESSING_TOPIC_ARN}`, transactionsProcessingTopic.topicArn);
        this.transactionsProducerLambda.addEnvironment(`${Constants.MoonbeamConstants.ENV_NAME}`, props.stage);

        /**
         * create a new FIFO SQS queue, with deduplication enabled based on the message contents,
         * that will be subscribed to the SNS topic above, used for transactions processing.
         *
         * This will be used for processing incoming transactions eligible to be redeemed as offers.
         */
        const transactionalOffersProcessingQueue = new aws_sqs.Queue(this, `${props.transactionsProducerConsumerConfig.transactionsFanOutConfig.transactionalOffersProcessingQueueName}-${props.stage}-${props.env!.region}.fifo`, {
            queueName: `${props.transactionsProducerConsumerConfig.transactionsFanOutConfig.transactionalOffersProcessingQueueName}-${props.stage}-${props.env!.region}.fifo`,
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
            // creates a dead-letter-queue (DLQ) here, in order to handle any failed messages, that cannot be processed by the consumers of the transactional offers queue
            deadLetterQueue: {
                queue: new aws_sqs.Queue(this, `${props.transactionsProducerConsumerConfig.transactionsFanOutConfig.transactionalOffersProcessingDLQName}-${props.stage}-${props.env!.region}.fifo`, {
                    queueName: `${props.transactionsProducerConsumerConfig.transactionsFanOutConfig.transactionalOffersProcessingDLQName}-${props.stage}-${props.env!.region}.fifo`,
                    fifo: true,
                    contentBasedDeduplication: true,
                    /**
                     * we want to add the maximum retention period for messages in the dead-letter queue which is 1209600 seconds or 14 days,
                     * just to ensure that we have enough time to re-process any failures. For the transactions queue, this will be set to
                     * the default of 4 days.
                     */
                    retentionPeriod: Duration.seconds(1209600)
                }),
                // another way of essentially deleting message from the queue, is specifying after how many retries a message will be moved to the dead-letter queue
                maxReceiveCount: 3
            }
        });

        // create a subscription for the transactional offers processing SQS queue, to the SNS transactions topic
        transactionsProcessingTopic.addSubscription(new SqsSubscription(transactionalOffersProcessingQueue, {
            // the message to the queue is the same as it was sent to the topic
            rawMessageDelivery: true,
            // creates a dead-letter-queue (DLQ) here, in order to handle any failed messages, that cannot be sent from SNS to SQS
            deadLetterQueue: new aws_sqs.Queue(this, `${props.transactionsProducerConsumerConfig.transactionsFanOutConfig.transactionsProcessingTopicDLQName}-${props.stage}-${props.env!.region}.fifo`, {
                queueName: `${props.transactionsProducerConsumerConfig.transactionsFanOutConfig.transactionsProcessingTopicDLQName}-${props.stage}-${props.env!.region}.fifo`,
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
         * give the transactional offers consumer Lambda, acting as the processing service or one of the consumers,
         * permissions to consume messages from the SQS transactional offers queue.
         */
        transactionalOffersProcessingQueue.grantConsumeMessages(this.transactionalOffersConsumerLambda);

        /**
         * create the event source mapping/trigger for the transactional offers consumer Lambda, which will trigger this Lambda,
         * every time one and/or multiple new SQS event representing offers eligible to be redeemed are added in the queue, ready to be processed.
         */
        new EventSourceMapping(this, `${props.transactionsProducerConsumerConfig.transactionsFanOutConfig.transactionalOffersProcessingEventSourceMapping}-${props.stage}-${props.env!.region}`, {
            target: this.transactionalOffersConsumerLambda,
            eventSourceArn: transactionalOffersProcessingQueue.queueArn,
            /**
             * we do not want the lambda to batch more than 1 records at a time from the queue, we want it to process 1 transactional offers at a time instead.
             * for future purposes, we might want to save cost by increasing this number somewhere between 1-10 (10 max for FIFO queues), in order to process
             * more messages at the same time
             */
            batchSize: 1,
            reportBatchItemFailures: true
        });

        /**
         * create a new FIFO SQS queue, with deduplication enabled based on the message contents,
         * that will be subscribed to the SNS topic above, used for transaction notifications processing.
         *
         * This will be used for processing notifications for incoming transactions eligible to be redeemed as offers.
         */
        const notificationsTransactionalOffersProcessingQueue = new aws_sqs.Queue(this, `${props.transactionsProducerConsumerConfig.transactionsFanOutConfig.notificationsTransactionalOffersProcessingQueueName}-${props.stage}-${props.env!.region}.fifo`, {
            queueName: `${props.transactionsProducerConsumerConfig.transactionsFanOutConfig.notificationsTransactionalOffersProcessingQueueName}-${props.stage}-${props.env!.region}.fifo`,
            // long-polling enabled here, waits to receive a message for 10 seconds
            receiveMessageWaitTime: Duration.seconds(10),
            /**
             * the time that a message will wait to be deleted by one of the queue subscribers (aka how much time to we have to process a notification for a transaction)
             * since this message will be "invisible" to other consumers during this time.
             */
            visibilityTimeout: Duration.seconds(50),
            fifo: true,
            // we are guaranteed that for messages with a same content, to be dropped in the queue, that the deduplication id will be based on the content
            contentBasedDeduplication: true,
            // creates a dead-letter-queue (DLQ) here, in order to handle any failed messages, that cannot be processed by the consumers of the notifications transactional offers queue
            deadLetterQueue: {
                queue: new aws_sqs.Queue(this, `${props.transactionsProducerConsumerConfig.transactionsFanOutConfig.notificationsTransactionalOffersProcessingDLQName}-${props.stage}-${props.env!.region}.fifo`, {
                    queueName: `${props.transactionsProducerConsumerConfig.transactionsFanOutConfig.notificationsTransactionalOffersProcessingDLQName}-${props.stage}-${props.env!.region}.fifo`,
                    fifo: true,
                    contentBasedDeduplication: true,
                    /**
                     * we want to add the maximum retention period for messages in the dead-letter queue which is 1209600 seconds or 14 days,
                     * just to ensure that we have enough time to re-process any failures. For the transactions queue, this will be set to
                     * the default of 4 days.
                     */
                    retentionPeriod: Duration.seconds(1209600)
                }),
                // another way of essentially deleting message from the queue, is specifying after how many retries a message will be moved to the dead-letter queue
                maxReceiveCount: 3
            }
        });

        // create a subscription for the notifications transactional offers processing SQS queue, to the SNS transactions topic
        transactionsProcessingTopic.addSubscription(new SqsSubscription(notificationsTransactionalOffersProcessingQueue, {
            // the message to the queue is the same as it was sent to the topic
            rawMessageDelivery: true,
            // creates a dead-letter-queue (DLQ) here, in order to handle any failed messages, that cannot be sent from SNS to SQS
            deadLetterQueue: new aws_sqs.Queue(this, `${props.transactionsProducerConsumerConfig.transactionsFanOutConfig.notificationTransactionsProcessingTopicDLQName}-${props.stage}-${props.env!.region}.fifo`, {
                queueName: `${props.transactionsProducerConsumerConfig.transactionsFanOutConfig.notificationTransactionsProcessingTopicDLQName}-${props.stage}-${props.env!.region}.fifo`,
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
         * give the notifications transactional offers consumer Lambda, acting as the processing service or one of the consumers,
         * permissions to consume messages from the SQS notifications transactional offers queue.
         */
        notificationsTransactionalOffersProcessingQueue.grantConsumeMessages(this.notificationsTransactionalOffersConsumerLambda);

        /**
         * create the event source mapping/trigger for the notifications transactional offers consumer Lambda, which will trigger this Lambda,
         * every time one and/or multiple new SQS event representing a notifications for an offer eligible to be redeemed are added in the queue, ready to be processed.
         */
        new EventSourceMapping(this, `${props.transactionsProducerConsumerConfig.transactionsFanOutConfig.notificationsTransactionalOffersProcessingEventSourceMapping}-${props.stage}-${props.env!.region}`, {
            target: this.notificationsTransactionalOffersConsumerLambda,
            eventSourceArn: notificationsTransactionalOffersProcessingQueue.queueArn,
            /**
             * we do not want the lambda to batch more than 1 records at a time from the queue, we want it to process 1 transactional offers at a time instead.
             * for future purposes, we might want to save cost by increasing this number somewhere between 1-10 (10 max for FIFO queues), in order to process
             * more messages at the same time
             */
            batchSize: 1,
            reportBatchItemFailures: true
        });
    }
}
