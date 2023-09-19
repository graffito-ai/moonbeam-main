import {aws_appsync, aws_dynamodb, aws_lambda, aws_lambda_nodejs, Duration, Stack, StackProps} from "aws-cdk-lib";
import {StageConfiguration} from "../models/StageConfiguration";
import {Construct} from "constructs";
import path from "path";
import {Constants} from "@moonbeam/moonbeam-models";
import {Effect, PolicyStatement} from "aws-cdk-lib/aws-iam";

/**
 * File used to define the Reimbursement Eligibility resolver stack, used by Amplify, as well
 * as any other dependent services, such as our reimbursements consumer service.
 */
export class ReimbursementEligibilityResolverStack extends Stack {

    /**
     * Constructor for the Reimbursement Eligibility resolver stack.
     *
     * @param scope scope to be passed in (usually a CDK App Construct)
     * @param id stack id to be passed in
     * @param props stack properties to be passed in
     */
    constructor(scope: Construct, id: string, props: StackProps & Pick<StageConfiguration, 'environmentVariables' | 'stage' | 'reimbursementEligibilityConfig'> & { graphqlApiId: string, graphqlApiName: string }) {
        super(scope, id, props);

        // create a new Lambda function to be used with the AppSync API for the resolvers
        const reimbursementEligibilityLambda = new aws_lambda_nodejs.NodejsFunction(this, `${props.reimbursementEligibilityConfig.reimbursementEligibilityFunctionName}-${props.stage}-${props.env!.region}`, {
            functionName: `${props.reimbursementEligibilityConfig.reimbursementEligibilityFunctionName}-${props.stage}-${props.env!.region}`,
            entry: path.resolve(path.join(__dirname, '../../../moonbeam-reimbursement-eligibility-lambda/src/lambda/main.ts')),
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
        const reimbursementEligibilityLambdaSource = graphqlApi.addLambdaDataSource(`${props.reimbursementEligibilityConfig.reimbursementEligibilityFunctionName}-datasource-${props.stage}-${props.env!.region}`,
            reimbursementEligibilityLambda);

        // add resolvers for which Query or Mutation type from the GraphQL schema listed above
        reimbursementEligibilityLambdaSource.createResolver(`${props.reimbursementEligibilityConfig.createReimbursementEligibilityResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Mutation",
            fieldName: `${props.reimbursementEligibilityConfig.createReimbursementEligibilityResolverName}`
        });
        reimbursementEligibilityLambdaSource.createResolver(`${props.reimbursementEligibilityConfig.updateReimbursementEligibilityResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Mutation",
            fieldName: `${props.reimbursementEligibilityConfig.updateReimbursementEligibilityResolverName}`
        });

        // create a new table to be used for Reimbursement Eligibility purposes
        const reimbursementEligibilityTable = new aws_dynamodb.Table(this, `${props.reimbursementEligibilityConfig.reimbursementEligibilityTableName}-${props.stage}-${props.env!.region}`, {
            tableName: `${props.reimbursementEligibilityConfig.reimbursementEligibilityTableName}-${props.stage}-${props.env!.region}`,
            billingMode: aws_dynamodb.BillingMode.PAY_PER_REQUEST,
            partitionKey: {
                name: 'id',
                type: aws_dynamodb.AttributeType.STRING
            }
        });

        // enable the Lambda function to access the DynamoDB table (using IAM)
        reimbursementEligibilityTable.grantFullAccess(reimbursementEligibilityLambda);
        reimbursementEligibilityLambda.addToRolePolicy(
            /**
             * policy used to allow full Dynamo DB access for the Lambda, added again on top of the lines above, since they sometimes don't work
             * Note: by "they" meaning "grantFullAccess" above.
             */
            new PolicyStatement(
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
                            `${reimbursementEligibilityTable.tableArn}`
                        ]
                    }
                )
            ));

        // Create environment variables that we will use in the function code
        reimbursementEligibilityLambda.addEnvironment(`${Constants.MoonbeamConstants.REIMBURSEMENT_ELIGIBILITY_TABLE}`, reimbursementEligibilityTable.tableName);
        reimbursementEligibilityLambda.addEnvironment(`${Constants.MoonbeamConstants.ENV_NAME}`, props.stage);
    }
}
