import {aws_appsync, aws_dynamodb, aws_lambda, aws_lambda_nodejs, NestedStack, StackProps} from "aws-cdk-lib";
import {StageConfiguration} from "../models/StageConfiguration";
import {Construct} from "constructs";
import path from "path";
import {Constants} from "@moonbeam/moonbeam-models";
import {Effect, PolicyStatement} from "aws-cdk-lib/aws-iam";

/**
 * File used to define the stack responsible for creating the resources
 * for the linking of bank accounts, used by Amplify.
 */
export class AmplifyAccountLinkingStack extends NestedStack {

    /**
     * Constructor for the account linking stack.
     *
     * @param scope scope to be passed in (usually a CDK App Construct)
     * @param id stack id to be passed in
     * @param props stack properties to be passed in
     */
    constructor(scope: Construct,
                id: string,
                props: StackProps & Pick<StageConfiguration, 'environmentVariables' | 'stage' | 'amplifyConfig'> & { graphqlApiId: string }) {
        super(scope, id, props);

        // create a new Lambda function to be used with the AppSync API for the resolvers
        const accountLinkingLambda = new aws_lambda_nodejs.NodejsFunction(this, `${props.amplifyConfig!.accountLinkingConfig!.accountLinkingFunctionName}-${props.stage}-${props.env!.region}`, {
            functionName: `${props.amplifyConfig!.accountLinkingConfig!.accountLinkingFunctionName}-${props.stage}-${props.env!.region}`,
            entry: path.resolve(path.join(__dirname, '../../../moonbeam-plaid-lambda/src/lambda/main.ts')),
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
            initialPolicy: [
                new PolicyStatement({
                    effect: Effect.ALLOW,
                    actions: [
                        "secretsmanager:GetSecretValue"
                    ],
                    resources: [
                        "arn:aws:secretsmanager:us-west-2:963863720257:secret:plaid-pair-dev-us-west-2-0CCBup" // this ARN is retrieved post secret creation
                    ]
                })
            ]
        });

        // retrieve the GraphQL API created by the other stack
        const graphqlApi = aws_appsync.GraphqlApi.fromGraphqlApiAttributes(this, `${props.amplifyConfig!.appSyncConfig!.graphqlApiName}-${props.stage}-${props.env!.region}`,
            {graphqlApiId: props.graphqlApiId});

        // set the new Lambda function as a data source for the AppSync API
        const accountLinkingLambdaSource = graphqlApi.addLambdaDataSource(`${props.amplifyConfig!.accountLinkingConfig!.accountLinkingFunctionName}-datasource-${props.stage}-${props.env!.region}`, accountLinkingLambda);

        // add resolvers for which Query or Mutation type from the GraphQL schema listed above
        accountLinkingLambdaSource.createResolver(`${props.amplifyConfig!.accountLinkingConfig!.getAccountLink}-${props.stage}-${props.env!.region}`, {
            typeName: "Query",
            fieldName: `${props.amplifyConfig!.accountLinkingConfig!.getAccountLink}`
        });
        accountLinkingLambdaSource.createResolver(`${props.amplifyConfig!.accountLinkingConfig!.listAccounts}-${props.stage}-${props.env!.region}`, {
            typeName: "Query",
            fieldName: `${props.amplifyConfig!.accountLinkingConfig!.listAccounts}`
        });
        accountLinkingLambdaSource.createResolver(`${props.amplifyConfig!.accountLinkingConfig!.createResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Mutation",
            fieldName: `${props.amplifyConfig!.accountLinkingConfig!.createResolverName}`
        });
        accountLinkingLambdaSource.createResolver(`${props.amplifyConfig!.accountLinkingConfig!.updateResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Mutation",
            fieldName: `${props.amplifyConfig!.accountLinkingConfig!.updateResolverName}`
        });
        accountLinkingLambdaSource.createResolver(`${props.amplifyConfig!.accountLinkingConfig!.deleteResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Mutation",
            fieldName: `${props.amplifyConfig!.accountLinkingConfig!.deleteResolverName}`
        });

        // create a new table to be used for Account Links
        const accountLinksTable = new aws_dynamodb.Table(this, `${props.amplifyConfig!.accountLinkingConfig!.accountLinkingTableName}-${props.stage}-${props.env!.region}`, {
            tableName: `${props.amplifyConfig!.accountLinkingConfig!.accountLinkingTableName}-${props.stage}-${props.env!.region}`,
            billingMode: aws_dynamodb.BillingMode.PAY_PER_REQUEST,
            partitionKey: {
                name: 'id',
                type: aws_dynamodb.AttributeType.STRING,
            },
        });

        // enable the Lambda function to access the DynamoDB table (using IAM)
        accountLinksTable.grantFullAccess(accountLinkingLambda);

        // Create environment variables that we will use in the function code
        accountLinkingLambda.addEnvironment(`${Constants.MoonbeamConstants.ACCOUNT_LINKS}`, accountLinksTable.tableName);
        accountLinkingLambda.addEnvironment(`${Constants.MoonbeamConstants.ENV_NAME}`, props.stage);
    }
}
