import {aws_appsync, aws_lambda, aws_lambda_nodejs, Duration, Stack, StackProps} from "aws-cdk-lib";
import {StageConfiguration} from "../models/StageConfiguration";
import {Construct} from "constructs";
import path from "path";
import {Constants, Stages} from "@moonbeam/moonbeam-models";
import {Effect, PolicyStatement} from "aws-cdk-lib/aws-iam";

/**
 * File used to define the App Upgrade resolver stack, responsible for handling
 * various types of App Upgrade related configuration.
 */
export class AppUpgradeResolverStack extends Stack {

    /**
     * Constructor for the App Upgrade resolver stack.
     *
     * @param scope scope to be passed in (usually a CDK App Construct)
     * @param id stack id to be passed in
     * @param props stack properties to be passed in
     */
    constructor(scope: Construct, id: string, props: StackProps & Pick<StageConfiguration, 'environmentVariables' | 'stage' | 'appUpgradeConfig'> & { graphqlApiId: string, graphqlApiName: string }) {
        super(scope, id, props);

        // create a new Lambda function to be used with the AppSync API for the resolvers
        const appUpgradeLambda = new aws_lambda_nodejs.NodejsFunction(this, `${props.appUpgradeConfig.appUpgradeFunctionName}-${props.stage}-${props.env!.region}`, {
            functionName: `${props.appUpgradeConfig.appUpgradeFunctionName}-${props.stage}-${props.env!.region}`,
            entry: path.resolve(path.join(__dirname, '../../../moonbeam-app-upgrade-lambda/src/lambda/main.ts')),
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
        const appUpgradeLambdaSource = graphqlApi.addLambdaDataSource(`${props.appUpgradeConfig.appUpgradeFunctionName}-datasource-${props.stage}-${props.env!.region}`,
            appUpgradeLambda);

        // add resolvers for which Query or Mutation type from the GraphQL schema listed above
        appUpgradeLambdaSource.createResolver(`${props.appUpgradeConfig.getAppUpgradeCredentialsResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Query",
            fieldName: `${props.appUpgradeConfig.getAppUpgradeCredentialsResolverName}`
        });

        // enable the Lambda function the retrieval of the App Upgrade internal API secrets
        appUpgradeLambda.addToRolePolicy(
            new PolicyStatement({
                effect: Effect.ALLOW,
                actions: [
                    "secretsmanager:GetSecretValue"
                ],
                resources: [
                    // this ARN is retrieved post secret creation
                    ...props.stage === Stages.DEV ? ["arn:aws:secretsmanager:us-west-2:963863720257:secret:app-upgrade-secret-pair-dev-us-west-2-sdKkTJ"] : [],
                    ...props.stage === Stages.PROD ? ["arn:aws:secretsmanager:us-west-2:251312580862:secret:app-upgrade-secret-pair-prod-us-west-2-WxcmFX"] : []
                ]
            })
        );

        // Create environment variables that we will use in the function code
        appUpgradeLambda.addEnvironment(`${Constants.MoonbeamConstants.ENV_NAME}`, props.stage);
    }
}
