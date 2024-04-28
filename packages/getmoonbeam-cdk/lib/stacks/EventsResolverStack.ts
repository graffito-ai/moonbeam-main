import {aws_appsync, aws_dynamodb, aws_lambda, aws_lambda_nodejs, Duration, Stack, StackProps} from "aws-cdk-lib";
import {StageConfiguration} from "../models/StageConfiguration";
import {Construct} from "constructs";
import path from "path";
import {Constants, Stages} from "@moonbeam/moonbeam-models";
import {Effect, PolicyStatement} from "aws-cdk-lib/aws-iam";

/**
 * File used to define the Events resolver stack, used by Amplify.
 */
export class EventsResolverStack extends Stack {

    /**
     * Constructor for the Events resolver stack.
     *
     * @param scope scope to be passed in (usually a CDK App Construct)
     * @param id stack id to be passed in
     * @param props stack properties to be passed in
     */
    constructor(scope: Construct, id: string, props: StackProps & Pick<StageConfiguration, 'environmentVariables' | 'stage' | 'eventsConfig'> & { graphqlApiId: string, graphqlApiName: string }) {
        super(scope, id, props);

        // create a new Lambda function to be used with the AppSync API for the resolvers
        const eventsLambda = new aws_lambda_nodejs.NodejsFunction(this, `${props.eventsConfig.eventsFunctionName}-${props.stage}-${props.env!.region}`, {
            functionName: `${props.eventsConfig.eventsFunctionName}-${props.stage}-${props.env!.region}`,
            entry: path.resolve(path.join(__dirname, '../../../moonbeam-events-lambda/src/lambda/main.ts')),
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
            }
        });

        // retrieve the GraphQL API created by the other stack
        const graphqlApi = aws_appsync.GraphqlApi.fromGraphqlApiAttributes(this, `${props.graphqlApiName}-${props.stage}-${props.env!.region}`,
            {graphqlApiId: props.graphqlApiId});

        // set the new Lambda function as a data source for the AppSync API
        const eventsLambdaDataSource = graphqlApi.addLambdaDataSource(`${props.eventsConfig.eventsFunctionName}-datasource-${props.stage}-${props.env!.region}`,
            eventsLambda);

        // add resolvers for which Query or Mutation type from the GraphQL schema listed above
        eventsLambdaDataSource.createResolver(`${props.eventsConfig.getEventSeriesResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Query",
            fieldName: `${props.eventsConfig.getEventSeriesResolverName}`
        });
        eventsLambdaDataSource.createResolver(`${props.eventsConfig.createEventSeriesResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Mutation",
            fieldName: `${props.eventsConfig.createEventSeriesResolverName}`
        });

        // create a new table to be used for Event Series storing purposes
        const eventSeriesTable = new aws_dynamodb.Table(this, `${props.eventsConfig.eventSeriesTableName}-${props.stage}-${props.env!.region}`, {
            tableName: `${props.eventsConfig.eventSeriesTableName}-${props.stage}-${props.env!.region}`,
            billingMode: aws_dynamodb.BillingMode.PAY_PER_REQUEST,
            partitionKey: {
                name: 'name',
                type: aws_dynamodb.AttributeType.STRING,
            },
            sortKey: {
                name: 'externalSeriesID',
                type: aws_dynamodb.AttributeType.STRING,
            }
        });
        /**
         * creates a global secondary index for the table, so we can retrieve event series, sorted by their creation date,
         * given their activation status.
         * {@link https://www.dynamodbguide.com/key-concepts/}
         * {@link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GSI.html}
         */
        eventSeriesTable.addGlobalSecondaryIndex({
            indexName: `${props.eventsConfig.eventSeriesCreateTimeGlobalIndex}-${props.stage}-${props.env!.region}`,
            partitionKey: {
                name: 'status',
                type: aws_dynamodb.AttributeType.STRING
            },
            sortKey: {
                name: 'createdAt',
                type: aws_dynamodb.AttributeType.STRING
            }
        });

        // enable the Lambda function to access the DynamoDB table (using IAM)
        eventSeriesTable.grantFullAccess(eventsLambda);
        eventsLambda.addToRolePolicy(
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
                        `${eventSeriesTable.tableArn}`,
                        `${eventSeriesTable.tableArn}/index/${props.eventsConfig.eventSeriesCreateTimeGlobalIndex}-${props.stage}-${props.env!.region}`
                    ]
                }
            )
        );
        // enable the Lambda function the retrieval of the EventBrite internal API secrets
        eventsLambda.addToRolePolicy(
            new PolicyStatement({
                effect: Effect.ALLOW,
                actions: [
                    "secretsmanager:GetSecretValue"
                ],
                resources: [
                    // this ARN is retrieved post secret creation
                    ...props.stage === Stages.DEV ? ["arn:aws:secretsmanager:us-west-2:963863720257:secret:eventbrite-secret-pair-dev-us-west-2-UnIhMp"] : [],
                    ...props.stage === Stages.PROD ? ["arn:aws:secretsmanager:us-west-2:251312580862:secret:eventbrite-secret-pair-prod-us-west-2-HKs3u6"] : []
                ]
            })
        );

        // Create environment variables that we will use in the function code
        eventsLambda.addEnvironment(`${Constants.MoonbeamConstants.EVENT_SERIES_TABLE}`, eventSeriesTable.tableName);
        eventsLambda.addEnvironment(`${Constants.MoonbeamConstants.EVENT_SERIES_CREATE_TIME_GLOBAL_INDEX}`, props.eventsConfig.eventSeriesCreateTimeGlobalIndex);
        eventsLambda.addEnvironment(`${Constants.MoonbeamConstants.ENV_NAME}`, props.stage);
    }
}
