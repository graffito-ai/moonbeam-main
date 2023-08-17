import {aws_appsync, aws_dynamodb, aws_lambda, aws_lambda_nodejs, Duration, Stack, StackProps} from "aws-cdk-lib";
import {StageConfiguration} from "../models/StageConfiguration";
import {Construct} from "constructs";
import path from "path";
import {Constants, Stages} from "@moonbeam/moonbeam-models";
import {Effect, PolicyStatement} from "aws-cdk-lib/aws-iam";

/**
 * File used to define the Notifications resolver stack, responsible for handling
 * various types of notifications (sign-up, transactional, reimbursement, etc. related),
 * through the notifications service via Courier, given multiple channels (SMS, Email or
 * push-based).
 */
export class NotificationsResolverStack extends Stack {

    /**
     * Constructor for the Notifications resolver stack.
     *
     * @param scope scope to be passed in (usually a CDK App Construct)
     * @param id stack id to be passed in
     * @param props stack properties to be passed in
     */
    constructor(scope: Construct, id: string, props: StackProps & Pick<StageConfiguration, 'environmentVariables' | 'stage' | 'notificationsConfig'> & { graphqlApiId: string, graphqlApiName: string }) {
        super(scope, id, props);

        // create a new Lambda function to be used with the AppSync API for the resolvers
        const notificationsLambda = new aws_lambda_nodejs.NodejsFunction(this, `${props.notificationsConfig.notificationsFunctionName}-${props.stage}-${props.env!.region}`, {
            functionName: `${props.notificationsConfig.notificationsFunctionName}-${props.stage}-${props.env!.region}`,
            entry: path.resolve(path.join(__dirname, '../../../moonbeam-notifications-lambda/src/lambda/main.ts')),
            handler: 'handler',
            runtime: aws_lambda.Runtime.NODEJS_18_X,
            // we add a timeout here different from the default of 3 seconds, since we expect queries and filtering calls to take longer
            timeout: Duration.seconds(20),
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
        const notificationsLambdaSource = graphqlApi.addLambdaDataSource(`${props.notificationsConfig.notificationsFunctionName}-datasource-${props.stage}-${props.env!.region}`,
            notificationsLambda);

        // add resolvers for which Query or Mutation type from the GraphQL schema listed above
        notificationsLambdaSource.createResolver(`${props.notificationsConfig.createNotificationResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Mutation",
            fieldName: `${props.notificationsConfig.createNotificationResolverName}`
        });

        // create a new table to be used for Notifications purposes
        const notificationsTable = new aws_dynamodb.Table(this, `${props.notificationsConfig.notificationsTableName}-${props.stage}-${props.env!.region}`, {
            tableName: `${props.notificationsConfig.notificationsTableName}-${props.stage}-${props.env!.region}`,
            billingMode: aws_dynamodb.BillingMode.PAY_PER_REQUEST,
            /**
             * the primary key of this table, will be a composite key [id, timestamp], where the id represents the user id,
             * and the timestamp represents the creation time of a notifications (in a UNIX format).
             * The timestamp will be the same as `createdAt` property, only that the `createdAt` will be in EPOCH time format
             * instead.
             *
             * This will allow us to sort through notifications for a particular user during a specific timeframe.
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
         * creates a local secondary index for the table, so we can retrieve notifications for a particular user, sorted
         * by their channel type.
         * {@link https://www.dynamodbguide.com/key-concepts/}
         * {@link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GSI.html}
         */
        notificationsTable.addLocalSecondaryIndex({
            indexName: `${props.notificationsConfig.notificationsChannelTypeLocalIndex}-${props.stage}-${props.env!.region}`,
            sortKey: {
                name: 'channelType',
                type: aws_dynamodb.AttributeType.STRING
            }
        });
        /**
         * creates a local secondary index for the table, so we can retrieve notifications for a particular user, sorted
         * by their type.
         * {@link https://www.dynamodbguide.com/key-concepts/}
         * {@link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GSI.html}
         */
        notificationsTable.addLocalSecondaryIndex({
            indexName: `${props.notificationsConfig.notificationsTypeLocalIndex}-${props.stage}-${props.env!.region}`,
            sortKey: {
                name: 'type',
                type: aws_dynamodb.AttributeType.STRING
            }
        });
        /**
         * creates a local secondary index for the table, so we can retrieve notifications for a particular user, sorted
         * by their status.
         * {@link https://www.dynamodbguide.com/key-concepts/}
         * {@link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GSI.html}
         */
        notificationsTable.addLocalSecondaryIndex({
            indexName: `${props.notificationsConfig.notificationsStatusLocalIndex}-${props.stage}-${props.env!.region}`,
            sortKey: {
                name: 'status',
                type: aws_dynamodb.AttributeType.STRING
            }
        });

        // enable the Lambda function to access the DynamoDB table (using IAM)
        notificationsTable.grantFullAccess(notificationsLambda);
        notificationsLambda.addToRolePolicy(
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
                            `${notificationsTable.tableArn}`
                        ]
                    }
                )
            ));
        // enable the Lambda function the retrieval of the Courier internal API secrets
        notificationsLambda.addToRolePolicy(
            new PolicyStatement({
                effect: Effect.ALLOW,
                actions: [
                    "secretsmanager:GetSecretValue"
                ],
                resources: [
                    // this ARN is retrieved post secret creation
                    ...props.stage === Stages.DEV ? ["arn:aws:secretsmanager:us-west-2:963863720257:secret:courier-internal-secret-pair-dev-us-west-2-cPEXmP"] : [],
                    ...props.stage === Stages.PROD ? [""] : []
                ]
            })
        );

        // Create environment variables that we will use in the function code
        notificationsLambda.addEnvironment(`${Constants.MoonbeamConstants.NOTIFICATIONS_TABLE}`, notificationsTable.tableName);
        notificationsLambda.addEnvironment(`${Constants.MoonbeamConstants.NOTIFICATIONS_CHANNEL_TYPE_LOCAL_INDEX}`, props.notificationsConfig.notificationsChannelTypeLocalIndex);
        notificationsLambda.addEnvironment(`${Constants.MoonbeamConstants.NOTIFICATIONS_TYPE_LOCAL_INDEX}`, props.notificationsConfig.notificationsTypeLocalIndex);
        notificationsLambda.addEnvironment(`${Constants.MoonbeamConstants.NOTIFICATIONS_STATUS_LOCAL_INDEX}`, props.notificationsConfig.notificationsStatusLocalIndex);
        notificationsLambda.addEnvironment(`${Constants.MoonbeamConstants.ENV_NAME}`, props.stage);
    }
}