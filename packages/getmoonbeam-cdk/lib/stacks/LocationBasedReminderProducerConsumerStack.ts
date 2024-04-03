import {aws_appsync, aws_lambda, aws_lambda_nodejs, aws_sns, aws_sqs, Duration, Stack, StackProps} from "aws-cdk-lib";
import {StageConfiguration} from "../models/StageConfiguration";
import {Construct} from "constructs";
import path from "path";
import {Effect, PolicyStatement, Role} from "aws-cdk-lib/aws-iam";
import {Constants, Stages} from "@moonbeam/moonbeam-models";
import {SqsSubscription} from "aws-cdk-lib/aws-sns-subscriptions";
import {EventSourceMapping} from "aws-cdk-lib/aws-lambda";

/**
 * File used to define the LocationBasedReminderProducerConsumerStack stack, used to create all the necessary resources
 * involved around handling incoming location updates data in an async fashion (Lambdas, etc.), as well as
 * around the location based offer reminder fan-out pattern, composed of an event-based process, driven by SNS and SQS.
 * This will help build the infrastructure for the acknowledgment service, or producer, as well as any of its consumers.
 */
export class LocationBasedReminderProducerConsumerStack extends Stack {

    /**
     * the location updates producer Lambda Function, acting as the location updates producer,
     * to be used in kick-starting the location updates reminder/notification process, by dropping
     * messages in the appropriate topic and queue.
     */
    readonly locationBasedReminderProducerLambda: aws_lambda_nodejs.NodejsFunction;

    /**
     * the location updates consumer Lambda Function, acting as the location updates consumer,
     * to be used during the whole location updates reminder/notification process, by consuming dropped
     * messages from the appropriate topic and queue.
     */
    readonly locationBasedReminderConsumerLambda: aws_lambda_nodejs.NodejsFunction;

    /**
     * Constructor for the LocationBasedReminderProducerConsumerStack stack.
     *
     * @param scope scope to be passed in (usually a CDK App Construct)
     * @param id stack id to be passed in
     * @param authenticatedRole authenticated role to be passed in, used by Amplify
     * @param unauthenticatedRole unauthenticated role to be passed in, used by Amplify
     * @param props stack properties to be passed in
     */
    constructor(scope: Construct, id: string, authenticatedRole: Role, unauthenticatedRole: Role,
                props: StackProps & Pick<StageConfiguration, 'environmentVariables' | 'stage' | 'locationBasedReminderProducerConsumerConfig'> & { graphqlApiId: string, graphqlApiName: string }) {
        super(scope, id, props);

        // create a new Lambda function to be used with the location update subscriptions for location-based notification purposes, acting as the acknowledgment service or producer
        this.locationBasedReminderProducerLambda = new aws_lambda_nodejs.NodejsFunction(this, `${props.locationBasedReminderProducerConsumerConfig.locationBasedReminderProducerFunctionName}-${props.stage}-${props.env!.region}`, {
            functionName: `${props.locationBasedReminderProducerConsumerConfig.locationBasedReminderProducerFunctionName}-${props.stage}-${props.env!.region}`,
            entry: path.resolve(path.join(__dirname, '../../../moonbeam-location-reminders-producer-lambda/src/lambda/main.ts')),
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

        // retrieve the GraphQL API created by the other stack
        const graphqlApi = aws_appsync.GraphqlApi.fromGraphqlApiAttributes(this, `${props.graphqlApiName}-${props.stage}-${props.env!.region}`,
            {graphqlApiId: props.graphqlApiId});

        // set the new Lambda function as a data source for the AppSync API
        const locationBasedReminderProducerLambdaDataSource = graphqlApi.addLambdaDataSource(`${props.locationBasedReminderProducerConsumerConfig.locationBasedReminderProducerFunctionName}-datasource-${props.stage}-${props.env!.region}`,
            this.locationBasedReminderProducerLambda);

        // add resolvers for which Query or Mutation type from the GraphQL schema listed above
        locationBasedReminderProducerLambdaDataSource.createResolver(`${props.locationBasedReminderProducerConsumerConfig.acknowledgeLocationUpdateResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Mutation",
            fieldName: `${props.locationBasedReminderProducerConsumerConfig.acknowledgeLocationUpdateResolverName}`
        });

        // create a new Lambda function to be used as a consumer for location-based subscription data, acting as the location-based updates/notification processor.
        this.locationBasedReminderConsumerLambda = new aws_lambda_nodejs.NodejsFunction(this, `${props.locationBasedReminderProducerConsumerConfig.locationBasedReminderConsumerFunctionName}-${props.stage}-${props.env!.region}`, {
            functionName: `${props.locationBasedReminderProducerConsumerConfig.locationBasedReminderConsumerFunctionName}-${props.stage}-${props.env!.region}`,
            entry: path.resolve(path.join(__dirname, '../../../moonbeam-location-reminders-consumer-lambda/src/lambda/main.ts')),
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

        // enable the auth and unauthenticated AWS Amplify role to call the specific Mutation Lambda resolver, used for acknowledging location updates
        authenticatedRole.addToPrincipalPolicy(
            new PolicyStatement({
                effect: Effect.ALLOW,
                actions: [
                    "appsync:GraphQL"
                ],
                resources: [
                    // this ARN is retrieved post GraphQL API creation
                    ...props.stage === Stages.DEV ? [`arn:aws:appsync:us-west-2:963863720257:apis/pkr6ygyik5bqjigb6nd57jl2cm/types/Mutation/fields/${props.locationBasedReminderProducerConsumerConfig.acknowledgeLocationUpdateResolverName}`] : [],
                    ...props.stage === Stages.PROD ? [`arn:aws:appsync:us-west-2:251312580862:apis/p3a4pwssi5dejox33pvznpvz4u/types/Mutation/fields/${props.locationBasedReminderProducerConsumerConfig.acknowledgeLocationUpdateResolverName}`] : []
                ]
            })
        );
        unauthenticatedRole.addToPrincipalPolicy(
            new PolicyStatement({
                effect: Effect.ALLOW,
                actions: [
                    "appsync:GraphQL"
                ],
                resources: [
                    // this ARN is retrieved post GraphQL API creation
                    ...props.stage === Stages.DEV ? [`arn:aws:appsync:us-west-2:963863720257:apis/pkr6ygyik5bqjigb6nd57jl2cm/types/Mutation/fields/${props.locationBasedReminderProducerConsumerConfig.acknowledgeLocationUpdateResolverName}`] : [],
                    ...props.stage === Stages.PROD ? [`arn:aws:appsync:us-west-2:251312580862:apis/p3a4pwssi5dejox33pvznpvz4u/types/Mutation/fields/${props.locationBasedReminderProducerConsumerConfig.acknowledgeLocationUpdateResolverName}`] : []
                ]
            })
        );

        // enable the Lambda function the retrieval of the Moonbeam internal API secrets
        this.locationBasedReminderProducerLambda.addToRolePolicy(
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

        // enable the Lambda function the retrieval of the Moonbeam internal API secrets
        this.locationBasedReminderConsumerLambda.addToRolePolicy(
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
        this.locationBasedReminderConsumerLambda.addToRolePolicy(
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
        this.locationBasedReminderConsumerLambda.addToRolePolicy(
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
        this.locationBasedReminderConsumerLambda.addEnvironment(`${Constants.MoonbeamConstants.ENV_NAME}`, props.stage);

        // create a new FIFO SNS topic, with deduplication enabled based on the message contents, used for location based message processing
        const locationBasedReminderProcessingTopic = new aws_sns.Topic(this, `${props.locationBasedReminderProducerConsumerConfig.locationBasedReminderFanOutConfig.locationBasedReminderProcessingTopicName}-${props.stage}-${props.env!.region}`, {
            displayName: `${props.locationBasedReminderProducerConsumerConfig.locationBasedReminderFanOutConfig.locationBasedReminderProcessingTopicName}`,
            topicName: `${props.locationBasedReminderProducerConsumerConfig.locationBasedReminderFanOutConfig.locationBasedReminderProcessingTopicName}-${props.stage}-${props.env!.region}`,
            fifo: true,
            // we are guaranteed that for messages with a same content, to be dropped in the topic, that the deduplication id will be based on the content
            contentBasedDeduplication: true
        });

        // give the webhook location-based notification Lambda, acting as the acknowledgment service or producer, permissions to publish messages in the location-based notification processing SNS topic
        locationBasedReminderProcessingTopic.grantPublish(this.locationBasedReminderProducerLambda);

        // Create environment variables that we will use in the producer function code
        this.locationBasedReminderProducerLambda.addEnvironment(`${Constants.MoonbeamConstants.LOCATION_BASED_REMINDERS_PROCESSING_TOPIC_ARN}`, locationBasedReminderProcessingTopic.topicArn);
        this.locationBasedReminderProducerLambda.addEnvironment(`${Constants.MoonbeamConstants.ENV_NAME}`, props.stage);

        /**
         * create a new FIFO SQS queue, with deduplication enabled based on the message contents,
         * that will be subscribed to the SNS topic above, used for location-based notification processing.
         *
         * This will be used for processing incoming location-based updates.
         */
        const locationBasedReminderProcessingQueue = new aws_sqs.Queue(this, `${props.locationBasedReminderProducerConsumerConfig.locationBasedReminderFanOutConfig.locationBasedReminderProcessingQueueName}-${props.stage}-${props.env!.region}.fifo`, {
            queueName: `${props.locationBasedReminderProducerConsumerConfig.locationBasedReminderFanOutConfig.locationBasedReminderProcessingQueueName}-${props.stage}-${props.env!.region}.fifo`,
            // long-polling enabled here, waits to receive a message for 10 seconds
            receiveMessageWaitTime: Duration.seconds(10),
            /**
             * the time that a message will wait to be deleted by one of the queue subscribers (aka how much time to we have to process a location-based update)
             * since this message will be "invisible" to other consumers during this time.
             */
            visibilityTimeout: Duration.seconds(50),
            fifo: true,
            // we are guaranteed that for messages with a same content, to be dropped in the queue, that the deduplication id will be based on the content
            contentBasedDeduplication: true,
            // creates a dead-letter-queue (DLQ) here, in order to handle any failed messages, that cannot be processed by the consumers of the location-based reminder queue
            deadLetterQueue: {
                queue: new aws_sqs.Queue(this, `${props.locationBasedReminderProducerConsumerConfig.locationBasedReminderFanOutConfig.locationBasedReminderProcessingDLQName}-${props.stage}-${props.env!.region}.fifo`, {
                    queueName: `${props.locationBasedReminderProducerConsumerConfig.locationBasedReminderFanOutConfig.locationBasedReminderProcessingDLQName}-${props.stage}-${props.env!.region}.fifo`,
                    fifo: true,
                    contentBasedDeduplication: true,
                    /**
                     * we want to add the maximum retention period for messages in the dead-letter queue which is 1209600 seconds or 14 days,
                     * just to ensure that we have enough time to re-process any failures. For the location-based reminder queue, this will be set to
                     * the default of 4 days.
                     */
                    retentionPeriod: Duration.seconds(1209600)
                }),
                // another way of essentially deleting message from the queue, is specifying after how many retries a message will be moved to the dead-letter queue
                maxReceiveCount: 3
            }
        });

        // create a subscription for the location-based updates/notification processing SQS queue, to the SNS location-based notification updates processing topic
        locationBasedReminderProcessingTopic.addSubscription(new SqsSubscription(locationBasedReminderProcessingQueue, {
            // the message to the queue is the same as it was sent to the topic
            rawMessageDelivery: true,
            // creates a dead-letter-queue (DLQ) here, in order to handle any failed messages, that cannot be sent from SNS to SQS
            deadLetterQueue: new aws_sqs.Queue(this, `${props.locationBasedReminderProducerConsumerConfig.locationBasedReminderFanOutConfig.locationBasedReminderProcessingTopicDLQName}-${props.stage}-${props.env!.region}.fifo`, {
                queueName: `${props.locationBasedReminderProducerConsumerConfig.locationBasedReminderFanOutConfig.locationBasedReminderProcessingTopicDLQName}-${props.stage}-${props.env!.region}.fifo`,
                fifo: true,
                contentBasedDeduplication: true,
                /**
                 * we want to add the maximum retention period for messages in the dead-letter queue which is 1209600 seconds or 14 days,
                 * just to ensure that we have enough time to re-process any failures. For the location-updates notification queue, this will be set to
                 * the default of 4 days.
                 */
                retentionPeriod: Duration.seconds(1209600)
            })
        }));

        /**
         * give the location-updates notification consumer Lambda, acting as the processing service or one of the consumers,
         * permissions to consume messages from the SQS location-updates notification queue.
         */
        locationBasedReminderProcessingQueue.grantConsumeMessages(this.locationBasedReminderConsumerLambda);

        /**
         * create the event source mapping/trigger for the location-based notification consumer Lambda, which will trigger this Lambda,
         * every time one and/or multiple new SQS event representing location-based updates are added in the queue, ready to be processed.
         */
        new EventSourceMapping(this, `${props.locationBasedReminderProducerConsumerConfig.locationBasedReminderFanOutConfig.locationBasedReminderProcessingEventSourceMapping}-${props.stage}-${props.env!.region}`, {
            target: this.locationBasedReminderConsumerLambda,
            eventSourceArn: locationBasedReminderProcessingQueue.queueArn,
            /**
             * we do not want the lambda to batch more than 1 records at a time from the queue, we want it to process 1 location-based update at a time instead.
             * for future purposes, we might want to save cost by increasing this number somewhere between 1-10 (10 max for FIFO queues), in order to process
             * more messages at the same time
             */
            batchSize: 1,
            reportBatchItemFailures: true
        });
    }
}
