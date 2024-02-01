import {aws_appsync, aws_dynamodb, aws_lambda, aws_lambda_nodejs, Duration, Stack, StackProps} from "aws-cdk-lib";
import {StageConfiguration} from "../models/StageConfiguration";
import {Construct} from "constructs";
import path from "path";
import {Constants} from "@moonbeam/moonbeam-models";
import {Effect, PolicyStatement} from "aws-cdk-lib/aws-iam";
import {Alias} from "aws-cdk-lib/aws-lambda";

/**
 * File used to define the App Review resolver stack, responsible for users' actions
 * in reviewing our app, in the App Stores.
 */
export class AppReviewResolverStack extends Stack {

    /**
     * Constructor for the App Review resolver stack.
     *
     * @param scope scope to be passed in (usually a CDK App Construct)
     * @param id stack id to be passed in
     * @param props stack properties to be passed in
     */
    constructor(scope: Construct, id: string, props: StackProps & Pick<StageConfiguration, 'environmentVariables' | 'stage' | 'appReviewConfig'> & { graphqlApiId: string, graphqlApiName: string }) {
        super(scope, id, props);

        // create a new Lambda function to be used with the AppSync API for the resolvers
        const appReviewLambda = new aws_lambda_nodejs.NodejsFunction(this, `${props.appReviewConfig.appReviewFunctionName}-${props.stage}-${props.env!.region}`, {
            functionName: `${props.appReviewConfig.appReviewFunctionName}-${props.stage}-${props.env!.region}`,
            entry: path.resolve(path.join(__dirname, '../../../moonbeam-app-review-lambda/src/lambda/main.ts')),
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
            reservedConcurrentExecutions: 10
        });
        new Alias(this, `${props.appReviewConfig.appReviewFunctionName}-current-version-alias`, {
            aliasName: `${props.appReviewConfig.appReviewFunctionName}-current-version-alias`,
            version: appReviewLambda.currentVersion,
            provisionedConcurrentExecutions: 2
        });

        // retrieve the GraphQL API created by the other stack
        const graphqlApi = aws_appsync.GraphqlApi.fromGraphqlApiAttributes(this, `${props.graphqlApiName}-${props.stage}-${props.env!.region}`,
            {graphqlApiId: props.graphqlApiId});

        // set the new Lambda function as a data source for the AppSync API
        const appReviewLambdaSource = graphqlApi.addLambdaDataSource(`${props.appReviewConfig.appReviewFunctionName}-datasource-${props.stage}-${props.env!.region}`,
            appReviewLambda);

        // add resolvers for which Query or Mutation type from the GraphQL schema listed above
        appReviewLambdaSource.createResolver(`${props.appReviewConfig.getAppReviewEligibilityResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Query",
            fieldName: `${props.appReviewConfig.getAppReviewEligibilityResolverName}`
        });
        appReviewLambdaSource.createResolver(`${props.appReviewConfig.createAppReviewResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Mutation",
            fieldName: `${props.appReviewConfig.createAppReviewResolverName}`
        });

        // create a new table to be used for AppReviews
        const appReviewTable = new aws_dynamodb.Table(this, `${props.appReviewConfig.appReviewTableName}-${props.stage}-${props.env!.region}`, {
            tableName: `${props.appReviewConfig.appReviewTableName}-${props.stage}-${props.env!.region}`,
            billingMode: aws_dynamodb.BillingMode.PAY_PER_REQUEST,
            partitionKey: {
                name: 'id',
                type: aws_dynamodb.AttributeType.STRING,
            },
        });

        // enable the Lambda function to access the DynamoDB table (using IAM)
        appReviewTable.grantFullAccess(appReviewLambda);
        appReviewLambda.addToRolePolicy(
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
                        `${appReviewTable.tableArn}`
                    ]
                }
            )
        );

        // Create environment variables that we will use in the function code
        appReviewLambda.addEnvironment(`${Constants.MoonbeamConstants.ENV_NAME}`, props.stage);
        appReviewLambda.addEnvironment(`${Constants.MoonbeamConstants.APP_REVIEW_TABLE}`, appReviewTable.tableName);
    }
}
