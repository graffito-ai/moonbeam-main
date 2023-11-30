import {aws_appsync, aws_dynamodb, aws_lambda, aws_lambda_nodejs, Duration, Stack, StackProps} from "aws-cdk-lib";
import {StageConfiguration} from "../models/StageConfiguration";
import {Construct} from "constructs";
import path from "path";
import {Constants, Stages} from "@moonbeam/moonbeam-models";
import {Effect, PolicyStatement} from "aws-cdk-lib/aws-iam";

/**
 * File used to define the Referral resolver stack, used by Amplify.
 */
export class ReferralResolverStack extends Stack {

    /**
     * Constructor for the Referral resolver stack.
     *
     * @param scope scope to be passed in (usually a CDK App Construct)
     * @param id stack id to be passed in
     * @param props stack properties to be passed in
     */
    constructor(scope: Construct, id: string, props: StackProps & Pick<StageConfiguration, 'environmentVariables' | 'stage' | 'referralConfig'> & { graphqlApiId: string, graphqlApiName: string }) {
        super(scope, id, props);

        // create a new Lambda function to be used with the AppSync API for the resolvers
        const referralLambda = new aws_lambda_nodejs.NodejsFunction(this, `${props.referralConfig.referralFunctionName}-${props.stage}-${props.env!.region}`, {
            functionName: `${props.referralConfig.referralFunctionName}-${props.stage}-${props.env!.region}`,
            entry: path.resolve(path.join(__dirname, '../../../moonbeam-referral-lambda/src/lambda/main.ts')),
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
        const referralLambdaDataSource = graphqlApi.addLambdaDataSource(`${props.referralConfig.referralFunctionName}-datasource-${props.stage}-${props.env!.region}`,
            referralLambda);

        // add resolvers for which Query or Mutation type from the GraphQL schema listed above
        referralLambdaDataSource.createResolver(`${props.referralConfig.getReferralsByStatusResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Query",
            fieldName: `${props.referralConfig.getReferralsByStatusResolverName}`
        });
        referralLambdaDataSource.createResolver(`${props.referralConfig.getUserFromReferralResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Query",
            fieldName: `${props.referralConfig.getUserFromReferralResolverName}`
        });
        referralLambdaDataSource.createResolver(`${props.referralConfig.createReferralResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Mutation",
            fieldName: `${props.referralConfig.createReferralResolverName}`
        });
        referralLambdaDataSource.createResolver(`${props.referralConfig.updateReferralResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Mutation",
            fieldName: `${props.referralConfig.updateReferralResolverName}`
        });

        // create a new table to be used for Referral storing purposes
        const referralTable = new aws_dynamodb.Table(this, `${props.referralConfig.referralTableName}-${props.stage}-${props.env!.region}`, {
            tableName: `${props.referralConfig.referralTableName}-${props.stage}-${props.env!.region}`,
            billingMode: aws_dynamodb.BillingMode.PAY_PER_REQUEST,
            /**
             * the primary key of this table, will be a composite key [fromId, timestamp], where the fromId represents the
             * id of the person who initiated the referral, and the timestamp represents the creation time of a
             * referral (aka when the person who was referred signed up, in a UNIX format).
             *
             * This will allow us to sort through referrals for a particular user during a specific timeframe.
             */
            partitionKey: {
                name: 'fromId',
                type: aws_dynamodb.AttributeType.STRING
            },
            sortKey: {
                name: 'timestamp',
                type: aws_dynamodb.AttributeType.NUMBER
            }
        });
        /**
         * creates a global secondary index for the table, so we can retrieve referrals, sorted by their status.
         * {@link https://www.dynamodbguide.com/key-concepts/}
         * {@link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GSI.html}
         */
        referralTable.addGlobalSecondaryIndex({
            indexName: `${props.referralConfig.referralStatusGlobalIndex}-${props.stage}-${props.env!.region}`,
            partitionKey: {
                name: 'status',
                type: aws_dynamodb.AttributeType.STRING
            }
        });

        // enable the Lambda function to access the DynamoDB table (using IAM)
        referralTable.grantFullAccess(referralLambda);
        referralLambda.addToRolePolicy(
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
                            `${referralTable.tableArn}`
                        ]
                    }
                )
            ));
        // enable the Lambda function the retrieval of the Moonbeam internal API secrets
        referralLambda.addToRolePolicy(
            new PolicyStatement({
                effect: Effect.ALLOW,
                actions: [
                    "secretsmanager:GetSecretValue"
                ],
                resources: [
                    // this ARN is retrieved post secret creation
                    ...props.stage === Stages.DEV ? ["arn:aws:secretsmanager:us-west-2:963863720257:secret:moonbeam-internal-secret-pair-dev-us-west-2-vgMpp2"] : [],
                    ...props.stage === Stages.PROD ? ["arn:aws:secretsmanager:us-west-2:251312580862:secret:moonbeam-internal-secret-pair-prod-us-west-2-9xP6tj"] : []
                ]
            })
        );

        // Create environment variables that we will use in the function code
        referralLambda.addEnvironment(`${Constants.MoonbeamConstants.REFERRAL_TABLE}`, referralTable.tableName);
        referralLambda.addEnvironment(`${Constants.MoonbeamConstants.REFERRAL_STATUS_GLOBAL_INDEX}`, props.referralConfig.referralStatusGlobalIndex);
        referralLambda.addEnvironment(`${Constants.MoonbeamConstants.ENV_NAME}`, props.stage);
    }
}
