import {aws_appsync, aws_dynamodb, aws_lambda, aws_lambda_nodejs, Stack, StackProps} from "aws-cdk-lib";
import {StageConfiguration} from "../models/StageConfiguration";
import {Construct} from "constructs";
import path from "path";
import {Constants} from "@moonbeam/moonbeam-models";
import {Effect, PolicyStatement} from "aws-cdk-lib/aws-iam";
import {Alias} from "aws-cdk-lib/aws-lambda";

/**
 * File used to define the User Auth Session resolver stack, used by Amplify.
 */
export class UserAuthSessionResolverStack extends Stack {

    /**
     * Constructor for the User Auth Session resolver stack.
     *
     * @param scope scope to be passed in (usually a CDK App Construct)
     * @param id stack id to be passed in
     * @param props stack properties to be passed in
     */
    constructor(scope: Construct, id: string, props: StackProps & Pick<StageConfiguration, 'environmentVariables' | 'stage' | 'userAuthSessionConfig'> & { graphqlApiId: string, graphqlApiName: string }) {
        super(scope, id, props);

        // create a new Lambda function to be used with the AppSync API for the resolvers
        const userAuthSessionLambda = new aws_lambda_nodejs.NodejsFunction(this, `${props.userAuthSessionConfig.userAuthSessionFunctionName}-${props.stage}-${props.env!.region}`, {
            functionName: `${props.userAuthSessionConfig.userAuthSessionFunctionName}-${props.stage}-${props.env!.region}`,
            entry: path.resolve(path.join(__dirname, '../../../moonbeam-user-auth-session-lambda/src/lambda/main.ts')),
            handler: 'handler',
            runtime: aws_lambda.Runtime.NODEJS_18_X,
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
        new Alias(this, `${props.userAuthSessionConfig.userAuthSessionFunctionName}-current-version-alias`, {
            aliasName: `${props.userAuthSessionConfig.userAuthSessionFunctionName}-current-version-alias`,
            version: userAuthSessionLambda.currentVersion,
            provisionedConcurrentExecutions: 2
        });

        // retrieve the GraphQL API created by the other stack
        const graphqlApi = aws_appsync.GraphqlApi.fromGraphqlApiAttributes(this, `${props.graphqlApiName}-${props.stage}-${props.env!.region}`,
            {graphqlApiId: props.graphqlApiId});

        // set the new Lambda function as a data source for the AppSync API
        const userAuthSessionLambdaDataSource = graphqlApi.addLambdaDataSource(`${props.userAuthSessionConfig.userAuthSessionFunctionName}-datasource-${props.stage}-${props.env!.region}`, userAuthSessionLambda);

        // add resolvers for which Query or Mutation type from the GraphQL schema listed above
        userAuthSessionLambdaDataSource.createResolver(`${props.userAuthSessionConfig.getUserAuthSessionResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Query",
            fieldName: `${props.userAuthSessionConfig.getUserAuthSessionResolverName}`
        });
        userAuthSessionLambdaDataSource.createResolver(`${props.userAuthSessionConfig.updateUserAuthSessionResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Mutation",
            fieldName: `${props.userAuthSessionConfig.updateUserAuthSessionResolverName}`
        });
        userAuthSessionLambdaDataSource.createResolver(`${props.userAuthSessionConfig.createUserAuthSessionResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Mutation",
            fieldName: `${props.userAuthSessionConfig.createUserAuthSessionResolverName}`
        });

        // create a new table to be used for User Auth Sessions
        const userAuthSessionTable = new aws_dynamodb.Table(this, `${props.userAuthSessionConfig.userAuthSessionTableName}-${props.stage}-${props.env!.region}`, {
            tableName: `${props.userAuthSessionConfig.userAuthSessionTableName}-${props.stage}-${props.env!.region}`,
            billingMode: aws_dynamodb.BillingMode.PAY_PER_REQUEST,
            partitionKey: {
                name: 'id',
                type: aws_dynamodb.AttributeType.STRING,
            },
        });

        // enable the Lambda function to access the DynamoDB table (using IAM)
        userAuthSessionTable.grantFullAccess(userAuthSessionLambda);
        userAuthSessionLambda.addToRolePolicy(
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
                        `${userAuthSessionTable.tableArn}`
                    ]
                }
            )
        );

        // Create an environment variable that we will use in the function code
        userAuthSessionLambda.addEnvironment(`${Constants.MoonbeamConstants.ENV_NAME}`, props.stage);
        userAuthSessionLambda.addEnvironment(`${Constants.MoonbeamConstants.USER_AUTH_SESSION_TABLE}`, userAuthSessionTable.tableName);
    }
}
