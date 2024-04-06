import {aws_appsync, aws_dynamodb, aws_lambda, aws_lambda_nodejs, Duration, Stack, StackProps} from "aws-cdk-lib";
import {StageConfiguration} from "../models/StageConfiguration";
import {Construct} from "constructs";
import path from "path";
import {Constants, Stages} from "@moonbeam/moonbeam-models";
import {Effect, PolicyStatement} from "aws-cdk-lib/aws-iam";
import {Alias} from "aws-cdk-lib/aws-lambda";

/**
 * File used to define the Notification Reminder resolver stack, responsible for handling
 * various types of notification reminders.
 */
export class NotificationReminderResolverStack extends Stack {

    /**
     * Constructor for the Notifications Reminder resolver stack.
     *
     * @param scope scope to be passed in (usually a CDK App Construct)
     * @param id stack id to be passed in
     * @param props stack properties to be passed in
     */
    constructor(scope: Construct, id: string, props: StackProps & Pick<StageConfiguration, 'environmentVariables' | 'stage' | 'notificationReminderConfig'> & { graphqlApiId: string, graphqlApiName: string }) {
        super(scope, id, props);

        // create a new Lambda function to be used with the AppSync API for the resolvers
        const notificationReminderLambda = new aws_lambda_nodejs.NodejsFunction(this, `${props.notificationReminderConfig.notificationReminderFunctionName}-${props.stage}-${props.env!.region}`, {
            functionName: `${props.notificationReminderConfig.notificationReminderFunctionName}-${props.stage}-${props.env!.region}`,
            entry: path.resolve(path.join(__dirname, '../../../moonbeam-notification-reminder-lambda/src/lambda/main.ts')),
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
            },
            reservedConcurrentExecutions: 145
        });
        new Alias(this, `${props.notificationReminderConfig.notificationReminderFunctionName}-alias`, {
            aliasName: `${props.notificationReminderConfig.notificationReminderFunctionName}-alias`,
            version: notificationReminderLambda.currentVersion,
            provisionedConcurrentExecutions: 2
        });

        // retrieve the GraphQL API created by the other stack
        const graphqlApi = aws_appsync.GraphqlApi.fromGraphqlApiAttributes(this, `${props.graphqlApiName}-${props.stage}-${props.env!.region}`,
            {graphqlApiId: props.graphqlApiId});

        // set the new Lambda function as a data source for the AppSync API
        const notificationReminderLambdaSource = graphqlApi.addLambdaDataSource(`${props.notificationReminderConfig.notificationReminderFunctionName}-datasource-${props.stage}-${props.env!.region}`,
            notificationReminderLambda);

        // add resolvers for which Query or Mutation type from the GraphQL schema listed above
        notificationReminderLambdaSource.createResolver(`${props.notificationReminderConfig.getNotificationRemindersResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Query",
            fieldName: `${props.notificationReminderConfig.getNotificationRemindersResolverName}`
        });
        notificationReminderLambdaSource.createResolver(`${props.notificationReminderConfig.createNotificationReminderResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Mutation",
            fieldName: `${props.notificationReminderConfig.createNotificationReminderResolverName}`
        });
        notificationReminderLambdaSource.createResolver(`${props.notificationReminderConfig.updateNotificationReminderResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Mutation",
            fieldName: `${props.notificationReminderConfig.updateNotificationReminderResolverName}`
        });
        notificationReminderLambdaSource.createResolver(`${props.notificationReminderConfig.getAllUsersForNotificationRemindersResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Query",
            fieldName: `${props.notificationReminderConfig.getAllUsersForNotificationRemindersResolverName}`
        });
        notificationReminderLambdaSource.createResolver(`${props.notificationReminderConfig.getUsersByGeographyForNotificationRemindersResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Query",
            fieldName: `${props.notificationReminderConfig.getUsersByGeographyForNotificationRemindersResolverName}`
        });

        // create a new table to be used for Notification Reminder purposes
        const notificationReminderTable = new aws_dynamodb.Table(this, `${props.notificationReminderConfig.notificationReminderTableName}-${props.stage}-${props.env!.region}`, {
            tableName: `${props.notificationReminderConfig.notificationReminderTableName}-${props.stage}-${props.env!.region}`,
            billingMode: aws_dynamodb.BillingMode.PAY_PER_REQUEST,
            partitionKey: {
                name: 'id',
                type: aws_dynamodb.AttributeType.STRING,
            },
        });
        // enable the Lambda function to access the DynamoDB table (using IAM)
        notificationReminderTable.grantFullAccess(notificationReminderLambda);
        notificationReminderLambda.addToRolePolicy(
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
                        `${notificationReminderTable.tableArn}`
                    ]
                }
            )
        );
        // enable the Lambda function the retrieval of the Moonbeam internal API secrets
        notificationReminderLambda.addToRolePolicy(
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
        notificationReminderLambda.addEnvironment(`${Constants.MoonbeamConstants.ENV_NAME}`, props.stage);
        notificationReminderLambda.addEnvironment(`${Constants.MoonbeamConstants.NOTIFICATION_REMINDER_TABLE}`, notificationReminderTable.tableName);
    }
}
