import {aws_appsync, aws_dynamodb, aws_lambda, aws_lambda_nodejs, Duration, Stack, StackProps} from "aws-cdk-lib";
import {StageConfiguration} from "../models/StageConfiguration";
import {Construct} from "constructs";
import path from "path";
import {Constants} from "@moonbeam/moonbeam-models";
import {Effect, PolicyStatement} from "aws-cdk-lib/aws-iam";

/**
 * File used to define the Reimbursements resolver stack, used by Amplify, as well
 * as any other dependent services, such as our reimbursements consumer service.
 */
export class ReimbursementsResolverStack extends Stack {

    /**
     * Constructor for the Reimbursements resolver stack.
     *
     * @param scope scope to be passed in (usually a CDK App Construct)
     * @param id stack id to be passed in
     * @param props stack properties to be passed in
     */
    constructor(scope: Construct, id: string, props: StackProps & Pick<StageConfiguration, 'environmentVariables' | 'stage' | 'reimbursementsConfig'> & { graphqlApiId: string, graphqlApiName: string }) {
        super(scope, id, props);

        // create a new Lambda function to be used with the AppSync API for the resolvers
        const reimbursementsLambda = new aws_lambda_nodejs.NodejsFunction(this, `${props.reimbursementsConfig.reimbursementsFunctionName}-${props.stage}-${props.env!.region}`, {
            functionName: `${props.reimbursementsConfig.reimbursementsFunctionName}-${props.stage}-${props.env!.region}`,
            entry: path.resolve(path.join(__dirname, '../../../moonbeam-reimbursements-lambda/src/lambda/main.ts')),
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
        const reimbursementsLambdaSource = graphqlApi.addLambdaDataSource(`${props.reimbursementsConfig.reimbursementsFunctionName}-datasource-${props.stage}-${props.env!.region}`,
            reimbursementsLambda);

        // add resolvers for which Query or Mutation type from the GraphQL schema listed above
        reimbursementsLambdaSource.createResolver(`${props.reimbursementsConfig.createReimbursementResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Mutation",
            fieldName: `${props.reimbursementsConfig.createReimbursementResolverName}`
        });
        reimbursementsLambdaSource.createResolver(`${props.reimbursementsConfig.updateReimbursementResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Mutation",
            fieldName: `${props.reimbursementsConfig.updateReimbursementResolverName}`
        });
        reimbursementsLambdaSource.createResolver(`${props.reimbursementsConfig.getReimbursementByStatusResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Query",
            fieldName: `${props.reimbursementsConfig.getReimbursementByStatusResolverName}`
        });

        // create a new table to be used for Reimbursements purposes
        const reimbursementsTable = new aws_dynamodb.Table(this, `${props.reimbursementsConfig.reimbursementsTableName}-${props.stage}-${props.env!.region}`, {
            tableName: `${props.reimbursementsConfig.reimbursementsTableName}-${props.stage}-${props.env!.region}`,
            billingMode: aws_dynamodb.BillingMode.PAY_PER_REQUEST,
            /**
             * the primary key of this table, will be a composite key [id, createdAt], where the id represents the user id,
             * and the timestamp represents the creation time of a reimbursement (in a UNIX format).
             * The timestamp will be the same as `createdAt` property, only that the `createdAt` will be in EPOCH time format
             * instead.
             *
             * This will allow us to sort through reimbursements for a particular user during a specific timeframe.
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
        /**
         * creates a global secondary index for the table, so we can retrieve reimbursements by their ID.
         * {@link https://www.dynamodbguide.com/key-concepts/}
         * {@link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GSI.html}
         */
        reimbursementsTable.addGlobalSecondaryIndex({
            indexName: `${props.reimbursementsConfig.reimbursementsIdGlobalIndex}-${props.stage}-${props.env!.region}`,
            partitionKey: {
                name: 'reimbursementId',
                type: aws_dynamodb.AttributeType.STRING
            }
        });
        /**
         * creates a local secondary index for the table, so we can retrieve reimbursements for a particular user, sorted
         * by their status.
         * {@link https://www.dynamodbguide.com/key-concepts/}
         * {@link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GSI.html}
         */
        reimbursementsTable.addLocalSecondaryIndex({
            indexName: `${props.reimbursementsConfig.reimbursementsStatusLocalIndex}-${props.stage}-${props.env!.region}`,
            sortKey: {
                name: 'reimbursementStatus',
                type: aws_dynamodb.AttributeType.STRING
            }
        });

        // enable the Lambda function to access the DynamoDB table (using IAM)
        reimbursementsTable.grantFullAccess(reimbursementsLambda);
        reimbursementsLambda.addToRolePolicy(
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
                            `${reimbursementsTable.tableArn}`
                        ]
                    }
                )
            ));

        // Create environment variables that we will use in the function code
        reimbursementsLambda.addEnvironment(`${Constants.MoonbeamConstants.REIMBURSEMENTS_TABLE}`, reimbursementsTable.tableName);
        reimbursementsLambda.addEnvironment(`${Constants.MoonbeamConstants.REIMBURSEMENTS_STATUS_LOCAL_INDEX}`, props.reimbursementsConfig.reimbursementsStatusLocalIndex);
        reimbursementsLambda.addEnvironment(`${Constants.MoonbeamConstants.REIMBURSEMENTS_ID_GLOBAL_INDEX}`, props.reimbursementsConfig.reimbursementsIdGlobalIndex);
        reimbursementsLambda.addEnvironment(`${Constants.MoonbeamConstants.ENV_NAME}`, props.stage);
    }
}
