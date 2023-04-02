import {aws_appsync, aws_dynamodb, aws_lambda, aws_lambda_nodejs, NestedStack, StackProps} from "aws-cdk-lib";
import {StageConfiguration} from "../models/StageConfiguration";
import {Construct} from "constructs";
import path from "path";
import {Constants} from "@moonbeam/moonbeam-models";

/**
 * File used to define the FAQ stack, used by Amplify.
 */
export class AmplifyFAQStack extends NestedStack {

    /**
     * Constructor for the FAQ stack.
     *
     * @param scope scope to be passed in (usually a CDK App Construct)
     * @param id stack id to be passed in
     * @param props stack properties to be passed in
     */
    constructor(scope: Construct, id: string, props: StackProps & Pick<StageConfiguration, 'environmentVariables' | 'stage' | 'amplifyConfig'> & { graphqlApiId: string }) {
        super(scope, id, props);

        // create a new Lambda function to be used with the AppSync API for the resolvers
        const faqLambda = new aws_lambda_nodejs.NodejsFunction(this, `${props.amplifyConfig!.faqConfig!.faqFunctionName}-${props.stage}-${props.env!.region}`, {
            functionName: `${props.amplifyConfig!.faqConfig!.faqFunctionName}-${props.stage}-${props.env!.region}`,
            entry: path.resolve(path.join(__dirname, '../../../moonbeam-faq-lambda/src/lambda/main.ts')),
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

        // retrieve the GraphQL API created by the other stack
        const graphqlApi = aws_appsync.GraphqlApi.fromGraphqlApiAttributes(this, `${props.amplifyConfig!.appSyncConfig!.graphqlApiName}-${props.stage}-${props.env!.region}`,
            {graphqlApiId: props.graphqlApiId});

        // set the new Lambda function as a data source for the AppSync API
        const faqLambdaDataSource = graphqlApi.addLambdaDataSource(`${props.amplifyConfig!.faqConfig!.faqFunctionName}-datasource-${props.stage}-${props.env!.region}`, faqLambda);

        // add resolvers for which Query or Mutation type from the GraphQL schema listed above
        faqLambdaDataSource.createResolver(`${props.amplifyConfig!.faqConfig!.listResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Query",
            fieldName: `${props.amplifyConfig!.faqConfig!.listResolverName}`
        });
        faqLambdaDataSource.createResolver(`${props.amplifyConfig!.faqConfig!.createResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Mutation",
            fieldName: `${props.amplifyConfig!.faqConfig!.createResolverName}`
        });

        // create a new table to be used for FAQs
        const faqTable = new aws_dynamodb.Table(this, `${props.amplifyConfig!.faqConfig!.faqTableName}-${props.stage}-${props.env!.region}`, {
            tableName: `${props.amplifyConfig!.faqConfig!.faqTableName}-${props.stage}-${props.env!.region}`,
            billingMode: aws_dynamodb.BillingMode.PAY_PER_REQUEST,
            partitionKey: {
                name: 'id',
                type: aws_dynamodb.AttributeType.STRING,
            },
        });

        // enable the Lambda function to access the DynamoDB table (using IAM)
        faqTable.grantFullAccess(faqLambda);

        // Create an environment variable that we will use in the function code
        faqLambda.addEnvironment(`${Constants.MoonbeamConstants.FAQ_TABLE}`, faqTable.tableName);
    }
}
