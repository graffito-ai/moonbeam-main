import {aws_appsync, aws_dynamodb, aws_lambda, aws_lambda_nodejs, Duration, Stack, StackProps} from "aws-cdk-lib";
import {StageConfiguration} from "../models/StageConfiguration";
import {Construct} from "constructs";
import path from "path";
import {Constants} from "@moonbeam/moonbeam-models";
import {Effect, PolicyStatement} from "aws-cdk-lib/aws-iam";

/**
 * File used to define the FAQ resolver stack, used by Amplify.
 */
export class FAQResolverStack extends Stack {

    /**
     * Constructor for the Card Linking resolver stack.
     *
     * @param scope scope to be passed in (usually a CDK App Construct)
     * @param id stack id to be passed in
     * @param props stack properties to be passed in
     */
    constructor(scope: Construct, id: string, props: StackProps & Pick<StageConfiguration, 'environmentVariables' | 'stage' | 'faqConfig'> & { graphqlApiId: string, graphqlApiName: string }) {
        super(scope, id, props);

        // create a new Lambda function to be used with the AppSync API for the resolvers
        const faqLambda = new aws_lambda_nodejs.NodejsFunction(this, `${props.faqConfig.faqFunctionName}-${props.stage}-${props.env!.region}`, {
            functionName: `${props.faqConfig.faqFunctionName}-${props.stage}-${props.env!.region}`,
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
        const graphqlApi = aws_appsync.GraphqlApi.fromGraphqlApiAttributes(this, `${props.graphqlApiName}-${props.stage}-${props.env!.region}`,
            {graphqlApiId: props.graphqlApiId});

        // set the new Lambda function as a data source for the AppSync API
        const faqLambdaDataSource = graphqlApi.addLambdaDataSource(`${props.faqConfig.faqFunctionName}-datasource-${props.stage}-${props.env!.region}`, faqLambda);

        // add resolvers for which Query or Mutation type from the GraphQL schema listed above
        faqLambdaDataSource.createResolver(`${props.faqConfig.getFAQsResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Query",
            fieldName: `${props.faqConfig.getFAQsResolverName}`,
            /**
             * Per-resolver caching enabled here
             *
             * https://docs.aws.amazon.com/appsync/latest/devguide/enabling-caching.html
             */
            cachingConfig: {
                ttl: Duration.seconds(3600) // 1 hour caching enabled
            }
        });
        faqLambdaDataSource.createResolver(`${props.faqConfig.createFAQResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Mutation",
            fieldName: `${props.faqConfig.createFAQResolverName}`
        });

        // create a new table to be used for FAQs
        const faqTable = new aws_dynamodb.Table(this, `${props.faqConfig.faqTableName}-${props.stage}-${props.env!.region}`, {
            tableName: `${props.faqConfig.faqTableName}-${props.stage}-${props.env!.region}`,
            billingMode: aws_dynamodb.BillingMode.PAY_PER_REQUEST,
            partitionKey: {
                name: 'id',
                type: aws_dynamodb.AttributeType.STRING,
            },
        });

        // enable the Lambda function to access the DynamoDB table (using IAM)
        faqTable.grantFullAccess(faqLambda);
        faqLambda.addToRolePolicy(
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
                        `${faqTable.tableArn}`
                    ]
                }
            )
        );

        // Create an environment variable that we will use in the function code
        faqLambda.addEnvironment(`${Constants.MoonbeamConstants.ENV_NAME}`, props.stage);
        faqLambda.addEnvironment(`${Constants.MoonbeamConstants.FAQ_TABLE}`, faqTable.tableName);
    }
}
