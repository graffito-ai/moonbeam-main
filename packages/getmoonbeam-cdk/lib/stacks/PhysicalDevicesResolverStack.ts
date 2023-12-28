import {aws_appsync, aws_dynamodb, aws_lambda, aws_lambda_nodejs, Duration, Stack, StackProps} from "aws-cdk-lib";
import {StageConfiguration} from "../models/StageConfiguration";
import {Construct} from "constructs";
import path from "path";
import {Constants} from "@moonbeam/moonbeam-models";
import {Effect, PolicyStatement} from "aws-cdk-lib/aws-iam";
import {Alias} from "aws-cdk-lib/aws-lambda";

/**
 * File used to define the Physical Devices resolver stack, responsible for handling
 * various types of physical (phones, tables, laptops, etc.) device-related data,
 * for different users, in order to help with things such as notifications, user-sessions, etc.
 */
export class PhysicalDevicesResolverStack extends Stack {

    /**
     * Constructor for the Physical Devices resolver stack.
     *
     * @param scope scope to be passed in (usually a CDK App Construct)
     * @param id stack id to be passed in
     * @param props stack properties to be passed in
     */
    constructor(scope: Construct, id: string, props: StackProps & Pick<StageConfiguration, 'environmentVariables' | 'stage' | 'physicalDevicesConfig'> & { graphqlApiId: string, graphqlApiName: string }) {
        super(scope, id, props);

        // create a new Lambda function to be used with the AppSync API for the resolvers
        const devicesLambda = new aws_lambda_nodejs.NodejsFunction(this, `${props.physicalDevicesConfig.devicesFunctionName}-${props.stage}-${props.env!.region}`, {
            functionName: `${props.physicalDevicesConfig.devicesFunctionName}-${props.stage}-${props.env!.region}`,
            entry: path.resolve(path.join(__dirname, '../../../moonbeam-physical-devices-lambda/src/lambda/main.ts')),
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
            reservedConcurrentExecutions: 145
        });
        new Alias(this, `${props.physicalDevicesConfig.devicesFunctionName}-current-version-alias`, {
            aliasName: `${props.physicalDevicesConfig.devicesFunctionName}-current-version-alias`,
            version: devicesLambda.currentVersion,
            provisionedConcurrentExecutions: 2
        });

        // retrieve the GraphQL API created by the other stack
        const graphqlApi = aws_appsync.GraphqlApi.fromGraphqlApiAttributes(this, `${props.graphqlApiName}-${props.stage}-${props.env!.region}`,
            {graphqlApiId: props.graphqlApiId});

        // set the new Lambda function as a data source for the AppSync API
        const devicesLambdaSource = graphqlApi.addLambdaDataSource(`${props.physicalDevicesConfig.devicesFunctionName}-datasource-${props.stage}-${props.env!.region}`,
            devicesLambda);

        // add resolvers for which Query or Mutation type from the GraphQL schema listed above
        devicesLambdaSource.createResolver(`${props.physicalDevicesConfig.getDeviceResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Query",
            fieldName: `${props.physicalDevicesConfig.getDeviceResolverName}`
        });
        devicesLambdaSource.createResolver(`${props.physicalDevicesConfig.getDeviceByTokenResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Query",
            fieldName: `${props.physicalDevicesConfig.getDeviceByTokenResolverName}`
        });
        devicesLambdaSource.createResolver(`${props.physicalDevicesConfig.getDevicesForUserResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Query",
            fieldName: `${props.physicalDevicesConfig.getDevicesForUserResolverName}`
        });
        devicesLambdaSource.createResolver(`${props.physicalDevicesConfig.createDeviceResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Mutation",
            fieldName: `${props.physicalDevicesConfig.createDeviceResolverName}`
        });
        devicesLambdaSource.createResolver(`${props.physicalDevicesConfig.updateDeviceResolverName}-${props.stage}-${props.env!.region}`, {
            typeName: "Mutation",
            fieldName: `${props.physicalDevicesConfig.updateDeviceResolverName}`
        });

        // create a new table to be used for Physical Device-tracking purposes
        const physicalDevicesTable = new aws_dynamodb.Table(this, `${props.physicalDevicesConfig.devicesTableName}-${props.stage}-${props.env!.region}`, {
            tableName: `${props.physicalDevicesConfig.devicesTableName}-${props.stage}-${props.env!.region}`,
            billingMode: aws_dynamodb.BillingMode.PAY_PER_REQUEST,
            /**
             * the primary key of this table, will be a composite key [id, tokenId], where the id represents the user id,
             * and the tokenId represents a physical device (identified through Expo).
             *
             * This will allow us to sort through physical devices for a particular user by their physical ID.
             */
            partitionKey: {
                name: 'id',
                type: aws_dynamodb.AttributeType.STRING
            },
            sortKey: {
                name: 'tokenId',
                type: aws_dynamodb.AttributeType.STRING
            }
        });
        /**
         * creates a global secondary index for the table, so we can retrieve all devices for a particular user ID.
         * {@link https://www.dynamodbguide.com/key-concepts/}
         * {@link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GSI.html}
         */
        physicalDevicesTable.addGlobalSecondaryIndex({
            indexName: `${props.physicalDevicesConfig.devicesIdGlobalIndex}-${props.stage}-${props.env!.region}`,
            partitionKey: {
                name: 'id',
                type: aws_dynamodb.AttributeType.STRING
            }
        });
        /**
         * creates a global secondary index for the table, so we can retrieve the device associated with a particular token id.
         * {@link https://www.dynamodbguide.com/key-concepts/}
         * {@link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GSI.html}
         */
        physicalDevicesTable.addGlobalSecondaryIndex({
            indexName: `${props.physicalDevicesConfig.deviceTokenIdGlobalIndex}-${props.stage}-${props.env!.region}`,
            partitionKey: {
                name: 'tokenId',
                type: aws_dynamodb.AttributeType.STRING
            }
        });

        // enable the Lambda function to access the DynamoDB table (using IAM)
        physicalDevicesTable.grantFullAccess(devicesLambda);
        devicesLambda.addToRolePolicy(
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
                        `${physicalDevicesTable.tableArn}`
                    ]
                }
            )
        );

        // Create environment variables that we will use in the function code
        devicesLambda.addEnvironment(`${Constants.MoonbeamConstants.PHYSICAL_DEVICES_TABLE}`, physicalDevicesTable.tableName);
        devicesLambda.addEnvironment(`${Constants.MoonbeamConstants.PHYSICAL_DEVICES_ID_GLOBAL_INDEX}`, props.physicalDevicesConfig.devicesIdGlobalIndex);
        devicesLambda.addEnvironment(`${Constants.MoonbeamConstants.PHYSICAL_DEVICES_TOKEN_ID_GLOBAL_INDEX}`, props.physicalDevicesConfig.deviceTokenIdGlobalIndex);
        devicesLambda.addEnvironment(`${Constants.MoonbeamConstants.ENV_NAME}`, props.stage);
    }
}
