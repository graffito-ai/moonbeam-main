import {aws_appsync, aws_dynamodb, aws_lambda, aws_lambda_nodejs, Duration, Stack, StackProps} from "aws-cdk-lib";
import {StageConfiguration} from "../models/StageConfiguration";
import {Construct} from "constructs";
import path from "path";
import {Constants, Stages} from "@moonbeam/moonbeam-models";
import {Effect, PolicyStatement} from "aws-cdk-lib/aws-iam";
import {Alias} from "aws-cdk-lib/aws-lambda";

/**
 * File used to define the Transactions resolver stack, used by Amplify, as well
 * as any other dependent services, such as our transactions consumer service.
 */
export class TransactionsResolverStack extends Stack {

    /**
     * Constructor for the Transactions resolver stack.
     *
     * @param scope scope to be passed in (usually a CDK App Construct)
     * @param id stack id to be passed in
     * @param props stack properties to be passed in
     */
    constructor(scope: Construct, id: string, props: StackProps & Pick<StageConfiguration, 'environmentVariables' | 'stage' | 'transactionsConfig'> & { graphqlApiId: string, graphqlApiName: string }) {
        super(scope, id, props);

        // create a new Lambda function to be used with the AppSync API for the resolvers
        const transactionsLambda = new aws_lambda_nodejs.NodejsFunction(this, `${props.transactionsConfig.transactionsFunctionName}-${props.stage}-${props.env!.region}`, {
            functionName: `${props.transactionsConfig.transactionsFunctionName}-${props.stage}-${props.env!.region}`,
            entry: path.resolve(path.join(__dirname, '../../../moonbeam-transactions-lambda/src/lambda/main.ts')),
            handler: 'handler',
            runtime: aws_lambda.Runtime.NODEJS_18_X,
            // we add a timeout here different from the default of 3 seconds, since we expect queries and filtering calls to take longer
            timeout: Duration.seconds(900),
            memorySize: 512,
            bundling: {
                minify: true, // minify code, defaults to false
                sourceMap: true, // include source map, defaults to false
                sourceMapMode: aws_lambda_nodejs.SourceMapMode.BOTH, // defaults to SourceMapMode.DEFAULT
                sourcesContent: false, // do not include original source into source map, defaults to true
                target: 'esnext', // target environment for the generated JavaScript code
            },
            reservedConcurrentExecutions: 145
        });
        new Alias(this, `${props.transactionsConfig.transactionsFunctionName}-current-version-alias`, {
            aliasName: `${props.transactionsConfig.transactionsFunctionName}-current-version-alias`,
            version: transactionsLambda.currentVersion,
            provisionedConcurrentExecutions: 3
        });

        // retrieve the GraphQL API created by the other stack
        const graphqlApi = aws_appsync.GraphqlApi.fromGraphqlApiAttributes(this, `${props.graphqlApiName}-${props.stage}-${props.env!.region}`,
            {graphqlApiId: props.graphqlApiId});

        // set the new Lambda function as a data source for the AppSync API
        const transactionsLambdaSource = graphqlApi.addLambdaDataSource(`${props.transactionsConfig.transactionsFunctionName}-datasource-${props.stage}-${props.env!.region}`,
            transactionsLambda);

        // add resolvers for which Query or Mutation type from the GraphQL schema listed above
        transactionsLambdaSource.createResolver(`${props.transactionsConfig.createTransactionResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Mutation",
            fieldName: `${props.transactionsConfig.createTransactionResolverName}`
        });
        transactionsLambdaSource.createResolver(`${props.transactionsConfig.updateTransactionResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Mutation",
            fieldName: `${props.transactionsConfig.updateTransactionResolverName}`
        });
        transactionsLambdaSource.createResolver(`${props.transactionsConfig.getTransactionResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Query",
            fieldName: `${props.transactionsConfig.getTransactionResolverName}`
        });
        transactionsLambdaSource.createResolver(`${props.transactionsConfig.getTransactionByStatusResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Query",
            fieldName: `${props.transactionsConfig.getTransactionByStatusResolverName}`
        });
        transactionsLambdaSource.createResolver(`${props.transactionsConfig.getAllUsersEligibleForReimbursementsResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Query",
            fieldName: `${props.transactionsConfig.getAllUsersEligibleForReimbursementsResolverName}`
        });

        // create a new table to be used for Transactions purposes
        const transactionsTable = new aws_dynamodb.Table(this, `${props.transactionsConfig.transactionsTableName}-${props.stage}-${props.env!.region}`, {
            tableName: `${props.transactionsConfig.transactionsTableName}-${props.stage}-${props.env!.region}`,
            billingMode: aws_dynamodb.BillingMode.PAY_PER_REQUEST,
            /**
             * the primary key of this table, will be a composite key [id, timestamp], where the id represents the user id,
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
            indexName: `${props.transactionsConfig.transactionsIdGlobalIndex}-${props.stage}-${props.env!.region}`,
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
            indexName: `${props.transactionsConfig.transactionsStatusLocalIndex}-${props.stage}-${props.env!.region}`,
            sortKey: {
                name: 'transactionStatus',
                type: aws_dynamodb.AttributeType.STRING
            }
        });
        /**
         * creates a local secondary index for the table, so we can retrieve transactions by their status.
         * {@link https://www.dynamodbguide.com/key-concepts/}
         * {@link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GSI.html}
         */
        transactionsTable.addGlobalSecondaryIndex({
            indexName: `${props.transactionsConfig.transactionStatusGlobalIndex}-${props.stage}-${props.env!.region}`,
            partitionKey: {
                name: 'transactionStatus',
                type: aws_dynamodb.AttributeType.STRING
            }
        });

        // enable the Lambda function to access the DynamoDB table (using IAM)
        transactionsTable.grantFullAccess(transactionsLambda);
        transactionsLambda.addToRolePolicy(
            /**
             * policy used to allow full Dynamo DB access for the Lambda, added again on top of the lines above, since they sometimes don't work
             * Note: by "they" meaning "grantFullAccess" above.
             */
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
                        `${transactionsTable.tableArn}`,
                        `${transactionsTable.tableArn}/index/${props.transactionsConfig.transactionsStatusLocalIndex}-${props.stage}-${props.env!.region}`,
                        `${transactionsTable.tableArn}/index/${props.transactionsConfig.transactionsIdGlobalIndex}-${props.stage}-${props.env!.region}`,
                        `${transactionsTable.tableArn}/index/${props.transactionsConfig.transactionStatusGlobalIndex}-${props.stage}-${props.env!.region}`
                    ]
                }
            )
        );
        // enable the Lambda function the retrieval of the Moonbeam internal API secrets
        transactionsLambda.addToRolePolicy(
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

        // Create environment variables that we will use in the function code
        transactionsLambda.addEnvironment(`${Constants.MoonbeamConstants.TRANSACTIONS_TABLE}`, transactionsTable.tableName);
        transactionsLambda.addEnvironment(`${Constants.MoonbeamConstants.TRANSACTIONS_STATUS_LOCAL_INDEX}`, props.transactionsConfig.transactionsStatusLocalIndex);
        transactionsLambda.addEnvironment(`${Constants.MoonbeamConstants.TRANSACTIONS_ID_GLOBAL_INDEX}`, props.transactionsConfig.transactionsIdGlobalIndex);
        transactionsLambda.addEnvironment(`${Constants.MoonbeamConstants.TRANSACTIONS_STATUS_GLOBAL_INDEX}`, props.transactionsConfig.transactionStatusGlobalIndex);
        transactionsLambda.addEnvironment(`${Constants.MoonbeamConstants.ENV_NAME}`, props.stage);
    }
}
