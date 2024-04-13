import {aws_appsync, aws_dynamodb, aws_lambda, aws_lambda_nodejs, Duration, Stack, StackProps} from "aws-cdk-lib";
import {StageConfiguration} from "../models/StageConfiguration";
import {Construct} from "constructs";
import path from "path";
import {Constants, Stages} from "@moonbeam/moonbeam-models";
import {Effect, PolicyStatement} from "aws-cdk-lib/aws-iam";

/**
 * File used to define the Earnings Summary resolver stack, used by Amplify.
 */
export class EarningsSummaryResolverStack extends Stack {

    /**
     * Constructor for the Earnings Summary resolver stack.
     *
     * @param scope scope to be passed in (usually a CDK App Construct)
     * @param id stack id to be passed in
     * @param props stack properties to be passed in
     */
    constructor(scope: Construct, id: string, props: StackProps & Pick<StageConfiguration, 'environmentVariables' | 'stage' | 'earningsSummaryConfig'> & { graphqlApiId: string, graphqlApiName: string }) {
        super(scope, id, props);

        // create a new Lambda function to be used with the AppSync API for the resolvers
        const earningsSummaryLambda = new aws_lambda_nodejs.NodejsFunction(this, `${props.earningsSummaryConfig.earningsSummaryFunctionName}-${props.stage}-${props.env!.region}`, {
            functionName: `${props.earningsSummaryConfig.earningsSummaryFunctionName}-${props.stage}-${props.env!.region}`,
            entry: path.resolve(path.join(__dirname, '../../../moonbeam-earnings-summary-lambda/src/lambda/main.ts')),
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
        const earningsSummaryLambdaDataSource = graphqlApi.addLambdaDataSource(`${props.earningsSummaryConfig.earningsSummaryFunctionName}-datasource-${props.stage}-${props.env!.region}`,
            earningsSummaryLambda);

        // add resolvers for which Query or Mutation type from the GraphQL schema listed above
        earningsSummaryLambdaDataSource.createResolver(`${props.earningsSummaryConfig.getDailyEarningsSummaryResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Query",
            fieldName: `${props.earningsSummaryConfig.getDailyEarningsSummaryResolverName}`
        });
        earningsSummaryLambdaDataSource.createResolver(`${props.earningsSummaryConfig.createDailyEarningsSummaryResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Mutation",
            fieldName: `${props.earningsSummaryConfig.createDailyEarningsSummaryResolverName}`
        });

        // create a new table to be used for Daily Earnings Summary storing purposes
        const dailyEarningsSummaryTable = new aws_dynamodb.Table(this, `${props.earningsSummaryConfig.dailyEarningsSummaryTableName}-${props.stage}-${props.env!.region}`, {
            tableName: `${props.earningsSummaryConfig.dailyEarningsSummaryTableName}-${props.stage}-${props.env!.region}`,
            billingMode: aws_dynamodb.BillingMode.PAY_PER_REQUEST,
            /**
             * the primary key of this table, will be a composite key [id, timestamp], where the id represents the
             * id of the person whom the summary report was generated for, and the timestamp represents the creation time of a
             * summary.
             * This will allow us to sort through daily summaries for a particular user during a specific timeframe.
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

        // enable the Lambda function to access the DynamoDB table (using IAM)
        dailyEarningsSummaryTable.grantFullAccess(earningsSummaryLambda);
        earningsSummaryLambda.addToRolePolicy(
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
                        `${dailyEarningsSummaryTable.tableArn}`
                    ]
                }
            )
        );
        // enable the Lambda function the retrieval of the Moonbeam internal API secrets
        earningsSummaryLambda.addToRolePolicy(
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
        earningsSummaryLambda.addToRolePolicy(
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
        earningsSummaryLambda.addToRolePolicy(
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

        // Create environment variables that we will use in the function code
        earningsSummaryLambda.addEnvironment(`${Constants.MoonbeamConstants.DAILY_EARNINGS_SUMMARY_TABLE}`, dailyEarningsSummaryTable.tableName);
        earningsSummaryLambda.addEnvironment(`${Constants.MoonbeamConstants.ENV_NAME}`, props.stage);
    }
}
