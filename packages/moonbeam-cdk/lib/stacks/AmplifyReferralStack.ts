import {aws_appsync, aws_dynamodb, aws_lambda, aws_lambda_nodejs, NestedStack, StackProps} from "aws-cdk-lib";
import {StageConfiguration} from "../models/StageConfiguration";
import {Construct} from "constructs";
import path from "path";
import {Constants} from "@moonbeam/moonbeam-models";

/**
 * File used to define the stack responsible for creating the resources
 * for the referral program, used by Amplify.
 */
export class AmplifyReferralStack extends NestedStack {

    /**
     * Constructor for the referral program stack.
     *
     * @param scope scope to be passed in (usually a CDK App Construct)
     * @param id stack id to be passed in
     * @param props stack properties to be passed in
     */
    constructor(scope: Construct,
                id: string,
                props: StackProps & Pick<StageConfiguration, 'environmentVariables' | 'stage' | 'amplifyConfig'> & { userPoolId: string, graphqlApiId: string }) {
        super(scope, id, props);

        // create a new Lambda function to be used with the AppSync API for the resolvers
        const referralLambda = new aws_lambda_nodejs.NodejsFunction(this, `${props.amplifyConfig!.referralConfig!.referralFunctionName}-${props.stage}-${props.env!.region}`, {
            functionName: `${props.amplifyConfig!.referralConfig!.referralFunctionName}-${props.stage}-${props.env!.region}`,
            entry: path.resolve(path.join(__dirname, '../../../moonbeam-referral-lambda/src/lambda/main.ts')),
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
        const referralLambdaDataSource = graphqlApi.addLambdaDataSource(`${props.amplifyConfig!.referralConfig!.referralFunctionName}-datasource-${props.stage}-${props.env!.region}`, referralLambda);

        // add resolvers for which Query or Mutation type from the GraphQL schema listed above
        referralLambdaDataSource.createResolver(`${props.amplifyConfig!.referralConfig!.getResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Query",
            fieldName: `${props.amplifyConfig!.referralConfig!.getResolverName}`
        });
        referralLambdaDataSource.createResolver(`${props.amplifyConfig!.referralConfig!.listResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Query",
            fieldName: `${props.amplifyConfig!.referralConfig!.listResolverName}`
        });
        referralLambdaDataSource.createResolver(`${props.amplifyConfig!.referralConfig!.createResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Mutation",
            fieldName: `${props.amplifyConfig!.referralConfig!.createResolverName}`
        });
        referralLambdaDataSource.createResolver(`${props.amplifyConfig!.referralConfig!.updateResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Mutation",
            fieldName: `${props.amplifyConfig!.referralConfig!.updateResolverName}`
        });

        // create a new table to be used for referrals
        const referralTable = new aws_dynamodb.Table(this, `${props.amplifyConfig!.referralConfig!.referralTableName}-${props.stage}-${props.env!.region}`, {
            tableName: `${props.amplifyConfig!.referralConfig!.referralTableName}-${props.stage}-${props.env!.region}`,
            billingMode: aws_dynamodb.BillingMode.PAY_PER_REQUEST,
            partitionKey: {
                name: 'id',
                type: aws_dynamodb.AttributeType.STRING,
            },
        });

        // enable the Lambda function to access the DynamoDB table (using IAM)
        referralTable.grantFullAccess(referralLambda);

        // Create an environment variable that we will use in the function code
        referralLambda.addEnvironment(`${Constants.MoonbeamConstants.REFERRAL_TABLE}`, referralTable.tableName);
    }
}
