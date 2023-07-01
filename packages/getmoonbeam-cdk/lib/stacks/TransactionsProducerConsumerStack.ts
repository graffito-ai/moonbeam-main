import {aws_dynamodb, aws_lambda, aws_lambda_nodejs, Duration, Stack, StackProps} from "aws-cdk-lib";
import {StageConfiguration} from "../models/StageConfiguration";
import {Construct} from "constructs";
import path from "path";
import {Effect, PolicyStatement} from "aws-cdk-lib/aws-iam";
import { Constants } from "@moonbeam/moonbeam-models";

/**
 * File used to define the TransactionsProducerConsumerStack stack, used to create all the necessary resources
 * involved around handling incoming transactional data in an async fashion (Lambdas, DynamoDB tables, etc.). This
 * will help build the infrastructure for the acknowledgment service, or producer, as well as any of its consumers.
 */
export class TransactionsProducerConsumerStack extends Stack {

    /**
     * the webhook transactions Lambda Function, acting as the acknowledgment service/producer,
     * to be used in configuring REST API Gateway endpoints in dependent stacks, as well as setting up
     * the fan-out mechanism form transactions.
     */
    readonly webhookTransactionsLambda: aws_lambda_nodejs.NodejsFunction;

    /**
     * the consumer transactions Lambda Function, to be used in setting up the fan-out mechanism form transactions.
     */
    readonly transactionsProcessingLambda: aws_lambda_nodejs.NodejsFunction;

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
        this.webhookTransactionsLambda = new aws_lambda_nodejs.NodejsFunction(this, `${props.transactionsProducerConsumerConfig.transactionsFunctionName}-${props.stage}-${props.env!.region}`, {
            functionName: `${props.transactionsProducerConsumerConfig.transactionsFunctionName}-${props.stage}-${props.env!.region}`,
            entry: path.resolve(path.join(__dirname, '../../../moonbeam-webhook-transactions-lambda/src/lambda/main.ts')),
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
            },
            initialPolicy: [
                // policy used to allow the retrieval of the Olive API secrets
                new PolicyStatement({
                    effect: Effect.ALLOW,
                    actions: [
                        "secretsmanager:GetSecretValue"
                    ],
                    resources: [
                        "arn:aws:secretsmanager:us-west-2:963863720257:secret:olive-secret-pair-dev-us-west-2-OTgCOk" // this ARN is retrieved post secret creation
                    ]
                })
            ]
        });

        // create a new Lambda function to be used as a consumer for transactional data, acting as the transaction processor.
        this.transactionsProcessingLambda = new aws_lambda_nodejs.NodejsFunction(this, `${props.transactionsProducerConsumerConfig.transactionsProcessingFunctionName}-${props.stage}-${props.env!.region}`, {
            functionName: `${props.transactionsProducerConsumerConfig.transactionsProcessingFunctionName}-${props.stage}-${props.env!.region}`,
            entry: path.resolve(path.join(__dirname, '../../../moonbeam-transactions-processor-lambda/src/lambda/main.ts')),
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
            },
            initialPolicy: [
                // policy used to allow the retrieval of the Olive API secrets
                new PolicyStatement({
                    effect: Effect.ALLOW,
                    actions: [
                        "secretsmanager:GetSecretValue"
                    ],
                    resources: [
                        "arn:aws:secretsmanager:us-west-2:963863720257:secret:olive-secret-pair-dev-us-west-2-OTgCOk" // this ARN is retrieved post secret creation
                    ]
                })
                // ToDo: will probably need to add a policy to also retrieve the internal Moonbeam secrets pair, holding APIKeys for the APPSync API resolvers for transactions
            ]
        });

        // create a new table to be used for Transactions purposes
        const transactionsTable = new aws_dynamodb.Table(this, `${props.transactionsProducerConsumerConfig.transactionsTableName}-${props.stage}-${props.env!.region}`, {
            tableName: `${props.transactionsProducerConsumerConfig.transactionsTableName}-${props.stage}-${props.env!.region}`,
            billingMode: aws_dynamodb.BillingMode.PAY_PER_REQUEST,
            /**
             * the primary key of this table, will be a composite key [id, createdAt], where the id represents the user id,
             * and the timestamp represents the creation time of a transaction (aka when it occurred, in a UNIX format).
             * The timestamp will be the same as `createdAt` property, only that the `createdAt` will be in EPOCH time format
             * instead.
             *
             * This will allow us to sort through transactions for a particular user during a specific timeframe.
             */
            partitionKey: {
                name: 'id',
                type: aws_dynamodb.AttributeType.STRING
            },
            sortKey: {
                name: 'timestamp',
                type: aws_dynamodb.AttributeType.NUMBER
            }
        });
        /**
         * creates a global secondary index for the table, so we can retrieve transactions by their ID.
         * {@link https://www.dynamodbguide.com/key-concepts/}
         * {@link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GSI.html}
         */
        transactionsTable.addGlobalSecondaryIndex({
            indexName: `${props.transactionsProducerConsumerConfig.transactionIdGlobalIndex}-${props.stage}-${props.env!.region}`,
            partitionKey: {
                name: 'transactionId',
                type: aws_dynamodb.AttributeType.STRING
            }
        });
        /**
         * creates a local secondary index for the table, so we can retrieve transactions for a particular user, sorted
         * by their status.
         * {@link https://www.dynamodbguide.com/key-concepts/}
         * {@link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GSI.html}
         */
        transactionsTable.addLocalSecondaryIndex({
            indexName: `${props.transactionsProducerConsumerConfig.transactionStatusLocalIndex}-${props.stage}-${props.env!.region}`,
            sortKey: {
                name: 'status',
                type: aws_dynamodb.AttributeType.STRING
            }
        });

        // enable the webhook transactions Lambda function to access the DynamoDB table (using IAM)
        transactionsTable.grantFullAccess(this.webhookTransactionsLambda);
        this.webhookTransactionsLambda.addToRolePolicy(
            /**
             * policy used to allow full Dynamo DB access for the Lambda, added again on top of the lines above, since they sometimes don't work
             * Note: by "they" meaning "grantFullAccess" above.
             */
            new PolicyStatement(
                new PolicyStatement({
                        effect: Effect.ALLOW,
                        actions: [
                            "dynamodb:GetItem",
                            "dynamodb:PutItem",
                            "dynamodb:Query",
                            "dynamodb:UpdateItem",
                            "dynamodb:DeleteItem"
                        ],
                        resources: [
                            `${transactionsTable.tableArn}`
                        ]
                    }
                )
            ));

        // Create environment variables that we will use in the producer function code
        this.webhookTransactionsLambda.addEnvironment(`${Constants.MoonbeamConstants.TRANSACTIONS_TABLE}`, transactionsTable.tableName);
        this.webhookTransactionsLambda.addEnvironment(`${Constants.MoonbeamConstants.TRANSACTION_STATUS_LOCAL_INDEX}`, props.transactionsProducerConsumerConfig.transactionStatusLocalIndex);
        this.webhookTransactionsLambda.addEnvironment(`${Constants.MoonbeamConstants.TRANSACTION_ID_GLOBAL_INDEX}`, props.transactionsProducerConsumerConfig.transactionIdGlobalIndex);

        // enable the transactions consumer services, to access the DynamoDB table (using IAM)
        transactionsTable.grantFullAccess(this.transactionsProcessingLambda);
        this.transactionsProcessingLambda.addToRolePolicy(
            /**
             * policy used to allow full Dynamo DB access for the Lambda, added again on top of the lines above, since they sometimes don't work
             * Note: by "they" meaning "grantFullAccess" above.
             */
            new PolicyStatement(
                new PolicyStatement({
                        effect: Effect.ALLOW,
                        actions: [
                            "dynamodb:GetItem",
                            "dynamodb:PutItem",
                            "dynamodb:Query",
                            "dynamodb:UpdateItem",
                            "dynamodb:DeleteItem"
                        ],
                        resources: [
                            `${transactionsTable.tableArn}`
                        ]
                    }
                )
            ));

        // Create environment variables that we will use in the consumer function code
        this.transactionsProcessingLambda.addEnvironment(`${Constants.MoonbeamConstants.TRANSACTIONS_TABLE}`, transactionsTable.tableName);
        this.transactionsProcessingLambda.addEnvironment(`${Constants.MoonbeamConstants.TRANSACTION_STATUS_LOCAL_INDEX}`, props.transactionsProducerConsumerConfig.transactionStatusLocalIndex);
        this.transactionsProcessingLambda.addEnvironment(`${Constants.MoonbeamConstants.TRANSACTION_ID_GLOBAL_INDEX}`, props.transactionsProducerConsumerConfig.transactionIdGlobalIndex);
    }
}
