import {aws_appsync, aws_dynamodb, aws_lambda, aws_lambda_nodejs, Duration, Stack, StackProps} from "aws-cdk-lib";
import {StageConfiguration} from "../models/StageConfiguration";
import {Construct} from "constructs";
import path from "path";
import {Constants, Stages} from "@moonbeam/moonbeam-models";
import {Effect, PolicyStatement} from "aws-cdk-lib/aws-iam";
import {Alias} from "aws-cdk-lib/aws-lambda";

/**
 * File used to define the Services resolver stack, used by Amplify.
 */
export class ServicesResolverStack extends Stack {

    /**
     * Constructor for the Services resolver stack.
     *
     * @param scope scope to be passed in (usually a CDK App Construct)
     * @param id stack id to be passed in
     * @param props stack properties to be passed in
     */
    constructor(scope: Construct, id: string, props: StackProps & Pick<StageConfiguration, 'environmentVariables' | 'stage' | 'servicePartnersConfig'> & { graphqlApiId: string, graphqlApiName: string }) {
        super(scope, id, props);

        // create a new Lambda function to be used with the AppSync API for the resolvers
        const servicePartnersLambda = new aws_lambda_nodejs.NodejsFunction(this, `${props.servicePartnersConfig.servicePartnersFunctionName}-${props.stage}-${props.env!.region}`, {
            functionName: `${props.servicePartnersConfig.servicePartnersFunctionName}-${props.stage}-${props.env!.region}`,
            entry: path.resolve(path.join(__dirname, '../../../moonbeam-service-partners-lambda/src/lambda/main.ts')),
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
            },
            reservedConcurrentExecutions: 100
        });
        new Alias(this, `${props.servicePartnersConfig.servicePartnersFunctionName}-current-version-alias`, {
            aliasName: `${props.servicePartnersConfig.servicePartnersFunctionName}-current-version-alias`,
            version: servicePartnersLambda.currentVersion,
            provisionedConcurrentExecutions: 2
        });

        // retrieve the GraphQL API created by the other stack
        const graphqlApi = aws_appsync.GraphqlApi.fromGraphqlApiAttributes(this, `${props.graphqlApiName}-${props.stage}-${props.env!.region}`,
            {graphqlApiId: props.graphqlApiId});

        // set the new Lambda function as a data source for the AppSync API
        const servicePartnersLambdaDataSource = graphqlApi.addLambdaDataSource(`${props.servicePartnersConfig.servicePartnersFunctionName}-datasource-${props.stage}-${props.env!.region}`,
            servicePartnersLambda);

        // add resolvers for which Query or Mutation type from the GraphQL schema listed above
        servicePartnersLambdaDataSource.createResolver(`${props.servicePartnersConfig.getServicePartnersResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Query",
            fieldName: `${props.servicePartnersConfig.getServicePartnersResolverName}`
        });
        servicePartnersLambdaDataSource.createResolver(`${props.servicePartnersConfig.createServicePartnerResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Mutation",
            fieldName: `${props.servicePartnersConfig.createServicePartnerResolverName}`
        });

        // create a new table to be used for Service Partners storing purposes
        const servicePartnersTable = new aws_dynamodb.Table(this, `${props.servicePartnersConfig.servicePartnersTableName}-${props.stage}-${props.env!.region}`, {
            tableName: `${props.servicePartnersConfig.servicePartnersTableName}-${props.stage}-${props.env!.region}`,
            billingMode: aws_dynamodb.BillingMode.PAY_PER_REQUEST,
            partitionKey: {
                name: 'name',
                type: aws_dynamodb.AttributeType.STRING,
            },
        });
        /**
         * creates a global secondary index for the table, so we can retrieve service partners, sorted by their creation date,
         * given their activation status
         * {@link https://www.dynamodbguide.com/key-concepts/}
         * {@link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GSI.html}
         */
        servicePartnersTable.addGlobalSecondaryIndex({
            indexName: `${props.servicePartnersConfig.servicesPartnersCreateTimeGlobalIndex}-${props.stage}-${props.env!.region}`,
            partitionKey: {
                name: 'status',
                type: aws_dynamodb.AttributeType.STRING
            },
            sortKey: {
                name: 'createdAt',
                type: aws_dynamodb.AttributeType.STRING
            }
        });

        // enable the Lambda function to access the DynamoDB table (using IAM)
        servicePartnersTable.grantFullAccess(servicePartnersLambda);
        servicePartnersLambda.addToRolePolicy(
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
                        `${servicePartnersTable.tableArn}`,
                        `${servicePartnersTable.tableArn}/index/${props.servicePartnersConfig.servicesPartnersCreateTimeGlobalIndex}-${props.stage}-${props.env!.region}`
                    ]
                }
            )
        );
        // enable the Lambda function the retrieval of the Moonbeam internal API secrets
        servicePartnersLambda.addToRolePolicy(
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
        // enable the Lambda function to access the AppSync mutations and queries
        servicePartnersLambda.addToRolePolicy(
            new PolicyStatement({
                effect: Effect.ALLOW,
                actions: [
                    "appsync:GraphQL"
                ],
                resources: [
                    // this ARN is retrieved post GraphQL API creation
                    ...props.stage === Stages.DEV ? ["arn:aws:appsync:us-west-2:963863720257:apis/pkr6ygyik5bqjigb6nd57jl2cm/types/Mutation/*"] : [],
                    ...props.stage === Stages.PROD ? ["arn:aws:appsync:us-west-2:251312580862:apis/p3a4pwssi5dejox33pvznpvz4u/types/Mutation/*"] : []
                ]
            })
        );
        servicePartnersLambda.addToRolePolicy(
            new PolicyStatement({
                effect: Effect.ALLOW,
                actions: [
                    "appsync:GraphQL"
                ],
                resources: [
                    // this ARN is retrieved post GraphQL API creation
                    ...props.stage === Stages.DEV ? [ "arn:aws:appsync:us-west-2:963863720257:apis/pkr6ygyik5bqjigb6nd57jl2cm/types/Query/*"] : [],
                    ...props.stage === Stages.PROD ? ["arn:aws:appsync:us-west-2:251312580862:apis/p3a4pwssi5dejox33pvznpvz4u/types/Query/*"] : []
                ]
            })
        );

        // Create environment variables that we will use in the function code
        servicePartnersLambda.addEnvironment(`${Constants.MoonbeamConstants.SERVICES_PARTNERS_TABLE}`, servicePartnersTable.tableName);
        servicePartnersLambda.addEnvironment(`${Constants.MoonbeamConstants.SERVICES_PARTNERS_CREATE_TIME_GLOBAL_INDEX}`, props.servicePartnersConfig.servicesPartnersCreateTimeGlobalIndex);
        servicePartnersLambda.addEnvironment(`${Constants.MoonbeamConstants.ENV_NAME}`, props.stage);
    }
}
