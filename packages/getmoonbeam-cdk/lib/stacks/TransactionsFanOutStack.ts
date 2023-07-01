import {aws_lambda_nodejs, aws_sns, aws_sqs, Duration, Stack, StackProps} from "aws-cdk-lib";
import {StageConfiguration} from "../models/StageConfiguration";
import {Construct} from "constructs";
import {SqsSubscription} from "aws-cdk-lib/aws-sns-subscriptions";
import {EventSourceMapping} from "aws-cdk-lib/aws-lambda";

/**
 * File used to define the TransactionsFanOut stack, used to create all the necessary resources
 * involved around the transactions-related fan-out pattern, composed of an event-based process,
 * driven by SNS and SQS.
 */
export class TransactionsFanOutStack extends Stack {

    /**
     * Constructor for the TransactionsFanOutStack stack.
     *
     * @param scope scope to be passed in (usually a CDK App Construct)
     * @param id stack id to be passed in
     * @param props stack properties to be passed in
     */
    constructor(scope: Construct, id: string, props: StackProps & Pick<StageConfiguration, 'environmentVariables' | 'stage' | 'transactionsFanOutConfig'>
        & { webhookTransactionsLambda: aws_lambda_nodejs.NodejsFunction, transactionsProcessingLambda: aws_lambda_nodejs.NodejsFunction }) {
        super(scope, id, props);

        // create a new FIFO SNS topic, with deduplication enabled based on the message contents, used for transaction message processing
        const transactionsProcessingTopic = new aws_sns.Topic(this, `${props.transactionsFanOutConfig.transactionsProcessingTopicName}-${props.stage}-${props.env!.region}`, {
            displayName: `${props.transactionsFanOutConfig.transactionsProcessingTopicName}`,
            topicName: `${props.transactionsFanOutConfig.transactionsProcessingTopicName}-${props.stage}-${props.env!.region}`,
            fifo: true,
            contentBasedDeduplication: true
        });

        // give the webhook transactions Lambda, acting as the acknowledgment service or producer, permissions to publish messages in the transactions SNS topic
        transactionsProcessingTopic.grantPublish(props.webhookTransactionsLambda);

        /**
         * create a new FIFO SQS queue, with deduplication enabled based on the message contents,
         * that will be subscribed to the SNS topic above, used for transactions processing.
         */
        const transactionsProcessingQueue = new aws_sqs.Queue(this, `${props.transactionsFanOutConfig.transactionsProcessingQueueName}-${props.stage}-${props.env!.region}.fifo`, {
            queueName: `${props.transactionsFanOutConfig.transactionsProcessingQueueName}-${props.stage}-${props.env!.region}.fifo`,
            // long-polling enabled here, waits to receive a message for 10 seconds
            receiveMessageWaitTime: Duration.seconds(10),
            /**
             * the time that a message will wait to be deleted by one of the queue subscribers (aka how much time to we have to process a transaction)
             * since this message will be "invisible" to other consumers during this time.
             */
            visibilityTimeout: Duration.seconds(50),
            fifo: true,
            contentBasedDeduplication: true,
            // creates a dead-letter-queue (DLQ) here, in order to handle any failed messages, that cannot be processed by the consumers of the transactions queue
            deadLetterQueue: {
                queue: new aws_sqs.Queue(this, `${props.transactionsFanOutConfig.transactionsProcessingDLQName}-${props.stage}-${props.env!.region}.fifo`, {
                    queueName: `${props.transactionsFanOutConfig.transactionsProcessingDLQName}-${props.stage}-${props.env!.region}.fifo`,
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

        // ToDo: when notifications will be implemented, we will need to create another queue, responsible for processing notifications,
        //  as well as a corresponding subscription and service

        // create a subscription for the transactions processing SQS queue, to the SNS transactions topic
        transactionsProcessingTopic.addSubscription(new SqsSubscription(transactionsProcessingQueue, {
            // the message to the queue is the same as it was sent to the topic
            rawMessageDelivery: true,
            // creates a dead-letter-queue (DLQ) here, in order to handle any failed messages, that cannot be sent from SNS to SQS
            deadLetterQueue: new aws_sqs.Queue(this, `${props.transactionsFanOutConfig.transactionsProcessingTopicDLQName}-${props.stage}-${props.env!.region}.fifo`, {
                queueName: `${props.transactionsFanOutConfig.transactionsProcessingTopicDLQName}-${props.stage}-${props.env!.region}.fifo`,
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
         * give the transactions processing Lambda, acting as the processing service or one of the consumers,
         * permissions to consume messages from the SQS transactions queue
         */
        transactionsProcessingQueue.grantConsumeMessages(props.transactionsProcessingLambda);

        /**
         * create the event source mapping/trigger for the transactions processing Lambda, which will trigger this Lambda,
         * every time one and/or multiple new SQS event/s is/are added in the queue, ready to be processed.
         */
        new EventSourceMapping(this, `${props.transactionsFanOutConfig.transactionsProcessingEventSourceMapping}-${props.stage}-${props.env!.region}`, {
            target: props.transactionsProcessingLambda,
            eventSourceArn: transactionsProcessingQueue.queueArn,
            // we do not want the lambda to batch more than 1 records at a time from the queue, we want it to process 1 transaction at a time instead.
            batchSize: 1
        });
    }
}
