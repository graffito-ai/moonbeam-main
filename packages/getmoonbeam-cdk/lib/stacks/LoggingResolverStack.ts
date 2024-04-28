import {aws_appsync, aws_lambda, aws_lambda_nodejs, Stack, StackProps} from "aws-cdk-lib";
import {StageConfiguration} from "../models/StageConfiguration";
import {Construct} from "constructs";
import {Effect, PolicyStatement, Role} from "aws-cdk-lib/aws-iam";
import path from "path";
import {Constants, Stages} from "@moonbeam/moonbeam-models";
import {LogGroup, RetentionDays} from "aws-cdk-lib/aws-logs";
import {Alias} from "aws-cdk-lib/aws-lambda";

/**
 * File used to define the AppSync/Lambda logging resolver stack, used by Amplify,
 * containing all the infrastructure revolved around logging such as log groups,
 * AppSync resolver as well as any IAM permissions.
 */
export class LoggingResolverStack extends Stack {

    /**
     * Constructor for the AppSync/Lambda logging resolver stack.
     *
     * @param scope scope to be passed in (usually a CDK App Construct)
     * @param id stack id to be passed in
     * @param authenticatedRole authenticated role to be passed in, used by Amplify
     * @param unauthenticatedRole unauthenticated role to be passed in, used by Amplify
     * @param props stack properties to be passed in
     */
    constructor(scope: Construct, id: string, authenticatedRole: Role, unauthenticatedRole: Role,
                props: StackProps & Pick<StageConfiguration, 'environmentVariables' | 'stage' | 'loggingConfig'> & { graphqlApiId: string, graphqlApiName: string }) {
        super(scope, id, props);

        // create a new Lambda function to be used with the AppSync API for the resolvers
        const loggingLambda = new aws_lambda_nodejs.NodejsFunction(this, `${props.loggingConfig.loggingFunctionName}-${props.stage}-${props.env!.region}`, {
            functionName: `${props.loggingConfig.loggingFunctionName}-${props.stage}-${props.env!.region}`,
            entry: path.resolve(path.join(__dirname, '../../../moonbeam-logging-lambda/src/lambda/main.ts')),
            handler: 'handler',
            runtime: aws_lambda.Runtime.NODEJS_18_X,
            memorySize: 512,
            bundling: {
                minify: true, // minify code, defaults to false
                sourceMap: true, // include source map, defaults to false
                sourceMapMode: aws_lambda_nodejs.SourceMapMode.BOTH, // defaults to SourceMapMode.DEFAULT
                sourcesContent: false, // do not include original source into source map, defaults to true
                target: 'esnext', // target environment for the generated JavaScript code
            }
        });
        new Alias(this, `${props.loggingConfig.loggingFunctionName}-current-version-alias`, {
            aliasName: `${props.loggingConfig.loggingFunctionName}-current-version-alias`,
            version: loggingLambda.currentVersion,
            provisionedConcurrentExecutions: 2
        });

        // retrieve the GraphQL API created by the other stack
        const graphqlApi = aws_appsync.GraphqlApi.fromGraphqlApiAttributes(this, `${props.graphqlApiName}-${props.stage}-${props.env!.region}`,
            {graphqlApiId: props.graphqlApiId});

        // set the new Lambda function as a data source for the AppSync API
        const loggingLambdaDataSource = graphqlApi.addLambdaDataSource(`${props.loggingConfig.loggingFunctionName}-datasource-${props.stage}-${props.env!.region}`, loggingLambda);

        // add resolvers for which Query or Mutation type from the GraphQL schema listed above
        loggingLambdaDataSource.createResolver(`${props.loggingConfig.createLogEventResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Mutation",
            fieldName: `${props.loggingConfig.createLogEventResolverName}`
        });

        // enable the Lambda function to create new Cloudwatch log group, log stream as well as push new log events
        loggingLambda.addToRolePolicy(
            new PolicyStatement({
                    effect: Effect.ALLOW,
                    actions: [
                        "logs:CreateLogGroup",
                        "logs:CreateLogStream",
                        "logs:PutLogEvents",
                        "logs:DescribeLogGroups",
                        "logs:DescribeLogStreams",
                    ],
                    resources: [
                        "arn:aws:logs:*:*:*"
                    ]
                }
            )
        );

        // enable the auth and unauthenticated AWS Amplify role to call the specific Mutation Lambda resolver, used for storing logs
        authenticatedRole.addToPrincipalPolicy(
            new PolicyStatement({
                effect: Effect.ALLOW,
                actions: [
                    "appsync:GraphQL"
                ],
                resources: [
                    // this ARN is retrieved post GraphQL API creation
                    ...props.stage === Stages.DEV ? [`arn:aws:appsync:us-west-2:963863720257:apis/pkr6ygyik5bqjigb6nd57jl2cm/types/Mutation/fields/${props.loggingConfig.createLogEventResolverName}`] : [],
                    ...props.stage === Stages.PROD ? [`arn:aws:appsync:us-west-2:251312580862:apis/p3a4pwssi5dejox33pvznpvz4u/types/Mutation/fields/${props.loggingConfig.createLogEventResolverName}`] : []
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
                    ...props.stage === Stages.DEV ? [`arn:aws:appsync:us-west-2:963863720257:apis/pkr6ygyik5bqjigb6nd57jl2cm/types/Mutation/fields/${props.loggingConfig.createLogEventResolverName}`] : [],
                    ...props.stage === Stages.PROD ? [`arn:aws:appsync:us-west-2:251312580862:apis/p3a4pwssi5dejox33pvznpvz4u/types/Mutation/fields/${props.loggingConfig.createLogEventResolverName}`] : []
                ]
            })
        );

        // create a new CloudWatch Log Group that will be associated with the FrontEnd logs for the mobile app
        const frontEndLogGroup = new LogGroup(this, `${props.loggingConfig.frontEndLogGroupName}-${props.stage}-${props.env!.region}`, {
            logGroupName: `${props.loggingConfig.frontEndLogGroupName}-${props.stage}-${props.env!.region}`,
            retention: RetentionDays.SIX_MONTHS
        });

        // Create an environment variable that we will use in the function code
        loggingLambda.addEnvironment(`${Constants.MoonbeamConstants.ENV_NAME}`, props.stage);
        loggingLambda.addEnvironment(`${Constants.MoonbeamConstants.MOONBEAM_FRONTEND_LOG_GROUP_NAME}`, frontEndLogGroup.logGroupName);
    }
}
