import {aws_appsync, aws_dynamodb, aws_lambda, aws_lambda_nodejs, Duration, Stack, StackProps} from "aws-cdk-lib";
import {StageConfiguration} from "../models/StageConfiguration";
import {Construct} from "constructs";
import path from "path";
import {Constants, Stages} from "@moonbeam/moonbeam-models";
import {Effect, PolicyStatement} from "aws-cdk-lib/aws-iam";

/**
 * File used to define the Military Verification resolver stack, used by Amplify.
 */
export class MilitaryVerificationResolverStack extends Stack {

    /**
     * Constructor for the Military Verification resolver stack.
     *
     * @param scope scope to be passed in (usually a CDK App Construct)
     * @param id stack id to be passed in
     * @param props stack properties to be passed in
     */
    constructor(scope: Construct, id: string, props: StackProps & Pick<StageConfiguration, 'environmentVariables' | 'stage' | 'militaryVerificationConfig'> & { graphqlApiId: string, graphqlApiName: string }) {
        super(scope, id, props);

        // create a new Lambda function to be used with the AppSync API for the resolvers
        const militaryVerificationLambda = new aws_lambda_nodejs.NodejsFunction(this, `${props.militaryVerificationConfig.militaryVerificationFunctionName}-${props.stage}-${props.env!.region}`, {
            functionName: `${props.militaryVerificationConfig.militaryVerificationFunctionName}-${props.stage}-${props.env!.region}`,
            entry: path.resolve(path.join(__dirname, '../../../moonbeam-military-verification-lambda/src/lambda/main.ts')),
            handler: 'handler',
            runtime: aws_lambda.Runtime.NODEJS_18_X,
            // we add a timeout here different from the default of 3 seconds, since we expect these API calls to take longer
            timeout: Duration.seconds(25),
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
        const militaryVerificationLambdaDataSource = graphqlApi.addLambdaDataSource(`${props.militaryVerificationConfig.militaryVerificationFunctionName}-datasource-${props.stage}-${props.env!.region}`,
            militaryVerificationLambda);

        // add resolvers for which Query or Mutation type from the GraphQL schema listed above
        militaryVerificationLambdaDataSource.createResolver(`${props.militaryVerificationConfig.getMilitaryVerificationStatusResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Query",
            fieldName: `${props.militaryVerificationConfig.getMilitaryVerificationStatusResolverName}`
        });
        militaryVerificationLambdaDataSource.createResolver(`${props.militaryVerificationConfig.updateMilitaryVerificationStatusResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Mutation",
            fieldName: `${props.militaryVerificationConfig.updateMilitaryVerificationStatusResolverName}`
        });
        militaryVerificationLambdaDataSource.createResolver(`${props.militaryVerificationConfig.createMilitaryVerificationResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Mutation",
            fieldName: `${props.militaryVerificationConfig.createMilitaryVerificationResolverName}`
        });

        // create a new table to be used for the Military Verification
        const militaryVerificationTable = new aws_dynamodb.Table(this, `${props.militaryVerificationConfig.militaryVerificationTableName}-${props.stage}-${props.env!.region}`, {
            tableName: `${props.militaryVerificationConfig.militaryVerificationTableName}-${props.stage}-${props.env!.region}`,
            billingMode: aws_dynamodb.BillingMode.PAY_PER_REQUEST,
            partitionKey: {
                name: 'id',
                type: aws_dynamodb.AttributeType.STRING,
            },
        });

        // enable the Lambda function to access the DynamoDB table (using IAM)
        militaryVerificationLambda.addToRolePolicy(
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
                    `${militaryVerificationTable.tableArn}`
                ]
            })
        );
        // enable the Lambda function the retrieval of the Quandis API secrets
        militaryVerificationLambda.addToRolePolicy(
            new PolicyStatement({
                effect: Effect.ALLOW,
                actions: [
                    "secretsmanager:GetSecretValue"
                ],
                resources: [
                    // this ARN is retrieved post secret creation
                    ...props.stage === Stages.DEV ? ["arn:aws:secretsmanager:us-west-2:963863720257:secret:quandis-secret-pair-dev-us-west-2-mJ84LF"] : [],
                    ...props.stage === Stages.PROD ? ["arn:aws:secretsmanager:us-west-2:251312580862:secret:quandis-secret-pair-prod-us-west-2-ebWbNz"] : []
                ]
            })
        );
        // enable the Lambda function the retrieval of the Lighthouse API secrets
        militaryVerificationLambda.addToRolePolicy(
            new PolicyStatement({
                effect: Effect.ALLOW,
                actions: [
                    "secretsmanager:GetSecretValue"
                ],
                resources: [
                    // this ARN is retrieved post secret creation
                    ...props.stage === Stages.DEV ? ["arn:aws:secretsmanager:us-west-2:963863720257:secret:lighthouse-secret-pair-dev-us-west-2-UxNuez"] : [],
                    ...props.stage === Stages.PROD ? ["arn:aws:secretsmanager:us-west-2:251312580862:secret:lighthouse-secret-pair-prod-us-west-2-Ga4Ski"] : []
                ]
            }),
        );

        // Create environment variables that we will use in the function code
        militaryVerificationLambda.addEnvironment(`${Constants.MoonbeamConstants.MILITARY_VERIFICATION_TABLE}`, militaryVerificationTable.tableName);
        militaryVerificationLambda.addEnvironment(`${Constants.MoonbeamConstants.ENV_NAME}`, props.stage);
    }
}
