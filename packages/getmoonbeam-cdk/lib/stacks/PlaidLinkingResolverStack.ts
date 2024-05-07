import {aws_appsync, aws_dynamodb, aws_lambda, aws_lambda_nodejs, Duration, Stack, StackProps} from "aws-cdk-lib";
import {StageConfiguration} from "../models/StageConfiguration";
import {Construct} from "constructs";
import path from "path";
import {Constants, Stages} from "@moonbeam/moonbeam-models";
import {Effect, PolicyStatement} from "aws-cdk-lib/aws-iam";

/**
 * File used to define the Plaid Linking resolver stack, used by Amplify.
 */
export class PlaidLinkingResolverStack extends Stack {

    /**
     * Constructor for the Plaid Linking resolver stack.
     *
     * @param scope scope to be passed in (usually a CDK App Construct)
     * @param id stack id to be passed in
     * @param props stack properties to be passed in
     */
    constructor(scope: Construct, id: string, props: StackProps & Pick<StageConfiguration, 'environmentVariables' | 'stage' | 'plaidLinkingConfig'> & { graphqlApiId: string, graphqlApiName: string }) {
        super(scope, id, props);

        // create a new Lambda function to be used with the AppSync API for the resolvers
        const plaidLinkingLambda = new aws_lambda_nodejs.NodejsFunction(this, `${props.plaidLinkingConfig.plaidLinkingFunctionName}-${props.stage}-${props.env!.region}`, {
            functionName: `${props.plaidLinkingConfig.plaidLinkingFunctionName}-${props.stage}-${props.env!.region}`,
            entry: path.resolve(path.join(__dirname, '../../../moonbeam-plaid-linking-lambda/src/lambda/main.ts')),
            handler: 'handler',
            runtime: aws_lambda.Runtime.NODEJS_18_X,
            // we add a timeout here different from the default of 3 seconds, since we expect these API calls to take longer
            timeout: Duration.seconds(900),
            memorySize: 512,
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
        const plaidLinkingLambdaDataSource = graphqlApi.addLambdaDataSource(`${props.plaidLinkingConfig.plaidLinkingFunctionName}-datasource-${props.stage}-${props.env!.region}`,
            plaidLinkingLambda);

        // add resolvers for which Query or Mutation type from the GraphQL schema listed above
        plaidLinkingLambdaDataSource.createResolver(`${props.plaidLinkingConfig.getPlaidLinkingSessionByTokenResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Query",
            fieldName: `${props.plaidLinkingConfig.getPlaidLinkingSessionByTokenResolverName}`
        });
        plaidLinkingLambdaDataSource.createResolver(`${props.plaidLinkingConfig.createPlaidLinkingSessionResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Mutation",
            fieldName: `${props.plaidLinkingConfig.createPlaidLinkingSessionResolverName}`
        });
        plaidLinkingLambdaDataSource.createResolver(`${props.plaidLinkingConfig.updatePlaidLinkingSessionResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Mutation",
            fieldName: `${props.plaidLinkingConfig.updatePlaidLinkingSessionResolverName}`
        });

        // create a new table to be used for the Plaid Linking Session Creation purposes
        const plaidLinkingSessionsTable = new aws_dynamodb.Table(this, `${props.plaidLinkingConfig.plaidLinkingSessionsTableName}-${props.stage}-${props.env!.region}`, {
            tableName: `${props.plaidLinkingConfig.plaidLinkingSessionsTableName}-${props.stage}-${props.env!.region}`,
            billingMode: aws_dynamodb.BillingMode.PAY_PER_REQUEST,
            /**
             * the primary key of this table, will be a composite key [id, timestamp], where the id represents the user id,
             * and the timestamp represents the creation time of a plaid linking session (aka when it occurred, in a UNIX format).
             * The timestamp will be the same as `createdAt` property, only that the `createdAt` will be in EPOCH time format
             * instead.
             *
             * This will allow us to sort through plaid linking sessions for a particular user during a specific timeframe.
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
         * creates a local secondary index for the table, so we can retrieve Plaid Linking sessions for a particular user, sorted
         * by their link_token.
         * {@link https://www.dynamodbguide.com/key-concepts/}
         * {@link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GSI.html}
         */
        plaidLinkingSessionsTable.addLocalSecondaryIndex({
            indexName: `${props.plaidLinkingConfig.plaidLinkTokenLocalIndex}-${props.stage}-${props.env!.region}`,
            sortKey: {
                name: 'link_token',
                type: aws_dynamodb.AttributeType.STRING
            }
        });
        /**
         * creates a global secondary index for the table, so we can retrieve Plaid Linking sessions for a particular link_token.
         * {@link https://www.dynamodbguide.com/key-concepts/}
         * {@link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GSI.html}
         */
        plaidLinkingSessionsTable.addGlobalSecondaryIndex({
            indexName: `${props.plaidLinkingConfig.plaidLinkTokenGlobalIndex}-${props.stage}-${props.env!.region}`,
            partitionKey: {
                name: 'link_token',
                type: aws_dynamodb.AttributeType.STRING
            }
        });

        // enable the Lambda function to access the DynamoDB table (using IAM)
        plaidLinkingSessionsTable.grantFullAccess(plaidLinkingLambda);
        plaidLinkingLambda.addToRolePolicy(
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
                        `${plaidLinkingSessionsTable.tableArn}`,
                        `${plaidLinkingSessionsTable.tableArn}/index/${props.plaidLinkingConfig.plaidLinkTokenLocalIndex}-${props.stage}-${props.env!.region}`,
                        `${plaidLinkingSessionsTable.tableArn}/index/${props.plaidLinkingConfig.plaidLinkTokenGlobalIndex}-${props.stage}-${props.env!.region}`,
                    ]
                }
            )
        );
        // enable the Lambda function the retrieval of the Plaid API secrets
        plaidLinkingLambda.addToRolePolicy(
            new PolicyStatement({
                effect: Effect.ALLOW,
                actions: [
                    "secretsmanager:GetSecretValue"
                ],
                resources: [
                    // this ARN is retrieved post secret creation
                    ...props.stage === Stages.DEV ? ["arn:aws:secretsmanager:us-west-2:963863720257:secret:plaid-secret-pair-dev-us-west-2-wwMgcC"] : [],
                    ...props.stage === Stages.PROD ? ["arn:aws:secretsmanager:us-west-2:251312580862:secret:plaid-secret-pair-prod-us-west-2-XXmqfi"] : []
                ]
            })
        );

        // Create environment variables that we will use in the function code
        plaidLinkingLambda.addEnvironment(`${Constants.MoonbeamConstants.PLAID_LINKING_SESSIONS_TABLE}`, plaidLinkingSessionsTable.tableName);
        plaidLinkingLambda.addEnvironment(`${Constants.MoonbeamConstants.PLAID_LINK_TOKEN_LOCAL_INDEX}`, props.plaidLinkingConfig.plaidLinkTokenLocalIndex);
        plaidLinkingLambda.addEnvironment(`${Constants.MoonbeamConstants.PLAID_LINK_TOKEN_GLOBAL_INDEX}`, props.plaidLinkingConfig.plaidLinkTokenGlobalIndex);
        plaidLinkingLambda.addEnvironment(`${Constants.MoonbeamConstants.ENV_NAME}`, props.stage);
    }
}
