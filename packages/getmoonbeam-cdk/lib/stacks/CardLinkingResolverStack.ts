import {aws_appsync, aws_dynamodb, aws_lambda, aws_lambda_nodejs, Duration, Stack, StackProps} from "aws-cdk-lib";
import {StageConfiguration} from "../models/StageConfiguration";
import {Construct} from "constructs";
import path from "path";
import {Constants} from "@moonbeam/moonbeam-models";
import {Effect, PolicyStatement} from "aws-cdk-lib/aws-iam";

/**
 * File used to define the Card Linking resolver stack, used by Amplify.
 */
export class CardLinkingResolverStack extends Stack {

    /**
     * Constructor for the Card Linking resolver stack.
     *
     * @param scope scope to be passed in (usually a CDK App Construct)
     * @param id stack id to be passed in
     * @param props stack properties to be passed in
     */
    constructor(scope: Construct, id: string, props: StackProps & Pick<StageConfiguration, 'environmentVariables' | 'stage' | 'cardLinkingConfig'> & { graphqlApiId: string, graphqlApiName: string }) {
        super(scope, id, props);

        // create a new Lambda function to be used with the AppSync API for the resolvers
        const cardLinkingLambda = new aws_lambda_nodejs.NodejsFunction(this, `${props.cardLinkingConfig.cardLinkingFunctionName}-${props.stage}-${props.env!.region}`, {
            functionName: `${props.cardLinkingConfig.cardLinkingFunctionName}-${props.stage}-${props.env!.region}`,
            entry: path.resolve(path.join(__dirname, '../../../moonbeam-card-linking-lambda/src/lambda/main.ts')),
            handler: 'handler',
            runtime: aws_lambda.Runtime.NODEJS_18_X,
            // we add a timeout here different from the default of 3 seconds, since we expect these API calls to take longer
            timeout: Duration.seconds(20),
            memorySize: 512,
            bundling: {
                minify: true, // minify code, defaults to false
                sourceMap: true, // include source map, defaults to false
                sourceMapMode: aws_lambda_nodejs.SourceMapMode.BOTH, // defaults to SourceMapMode.DEFAULT
                sourcesContent: false, // do not include original source into source map, defaults to true
                target: 'esnext', // target environment for the generated JavaScript code
            },
            initialPolicy: [
                // policy used to allow the retrieval of the Olive API secrets
                new PolicyStatement({
                    effect: Effect.ALLOW,
                    actions: [
                        "secretsmanager:GetSecretValue"
                    ],
                    resources: [
                        "arn:aws:secretsmanager:us-west-2:963863720257:secret:olive-secret-pair-dev-us-west-2-OTgCOk" // this ARN is retrieved post secret creation
                    ]
                })
            ]
        });

        // retrieve the GraphQL API created by the other stack
        const graphqlApi = aws_appsync.GraphqlApi.fromGraphqlApiAttributes(this, `${props.graphqlApiName}-${props.stage}-${props.env!.region}`,
            {graphqlApiId: props.graphqlApiId});

        // set the new Lambda function as a data source for the AppSync API
        const cardLinkingLambdaDataSource = graphqlApi.addLambdaDataSource(`${props.cardLinkingConfig.cardLinkingFunctionName}-datasource-${props.stage}-${props.env!.region}`,
            cardLinkingLambda);

        // add resolvers for which Query or Mutation type from the GraphQL schema listed above
        cardLinkingLambdaDataSource.createResolver(`${props.cardLinkingConfig.createCardLinkResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Mutation",
            fieldName: `${props.cardLinkingConfig.createCardLinkResolverName}`
        });
        cardLinkingLambdaDataSource.createResolver(`${props.cardLinkingConfig.deleteCardResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Mutation",
            fieldName: `${props.cardLinkingConfig.deleteCardResolverName}`
        });
        cardLinkingLambdaDataSource.createResolver(`${props.cardLinkingConfig.getCardLinkResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Query",
            fieldName: `${props.cardLinkingConfig.getCardLinkResolverName}`
        });

        // create a new table to be used for the Card Linking purposes
        const cardLinkingTable = new aws_dynamodb.Table(this, `${props.cardLinkingConfig.cardLinkingTableName}-${props.stage}-${props.env!.region}`, {
            tableName: `${props.cardLinkingConfig.cardLinkingTableName}-${props.stage}-${props.env!.region}`,
            billingMode: aws_dynamodb.BillingMode.PAY_PER_REQUEST,
            partitionKey: {
                name: 'id',
                type: aws_dynamodb.AttributeType.STRING,
            },
        });

        // enable the Lambda function to access the DynamoDB table (using IAM)
        cardLinkingTable.grantFullAccess(cardLinkingLambdaDataSource);
        cardLinkingLambda.addToRolePolicy(
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
                            `${cardLinkingTable.tableArn}`
                        ]
                    }
                )
            ));

        // Create environment variables that we will use in the function code
        cardLinkingLambda.addEnvironment(`${Constants.MoonbeamConstants.CARD_LINKING_TABLE}`, cardLinkingTable.tableName);
        cardLinkingLambda.addEnvironment(`${Constants.MoonbeamConstants.ENV_NAME}`, props.stage);
    }
}
