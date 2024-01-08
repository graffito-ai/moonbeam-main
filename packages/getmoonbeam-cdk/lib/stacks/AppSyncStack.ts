import {aws_appsync as appsync, CfnOutput, Duration, Expiration, Stack, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {StageConfiguration} from "../models/StageConfiguration";
import path from "path";
import {AuthorizationType, FieldLogLevel, GraphqlApi, SchemaFile} from "aws-cdk-lib/aws-appsync";
import {UserPool} from "aws-cdk-lib/aws-cognito";
import {AmplifyAuthConfig} from "../models/ServiceConfiguration";
import {Constants} from "@moonbeam/moonbeam-models";
import {RetentionDays} from "aws-cdk-lib/aws-logs";

/**
 * File used to define the stack responsible for creating the resources
 * for the AppSync API used by various Lambda resolvers and services.
 */
export class AppSyncStack extends Stack {

    // the created AppSync API id, to be used in retrieving the AppSync API in dependent Lambda resolver stacks
    readonly graphqlApiId: string;

    // the create AppSync API endpoint URL, to be used in calling this AppSync API in dependent Lambda stacks
    readonly graphqlApiEndpoint: string;

    /**
     * Constructor for the app sync stack.
     *
     * @param scope scope to be passed in (usually a CDK App Construct)
     * @param id stack id to be passed in
     * @param props stack properties to be passed in
     */
    constructor(scope: Construct, id: string, props: StackProps &
        Pick<StageConfiguration, 'environmentVariables' | 'stage' | 'appSyncConfig'> &
        Pick<AmplifyAuthConfig, 'userPoolName'> & { userPoolId: string }) {
        super(scope, id, props);

        // create the AppSync GraphQL API
        const appSyncApi = new GraphqlApi(this, `${props.appSyncConfig.graphqlApiName}-${props.stage}-${props.env!.region}`, {
            name: `${props.appSyncConfig.graphqlApiName}-${props.stage}-${props.env!.region}`,
            schema: SchemaFile.fromAsset(path.join(__dirname, '../../graphql/schema.graphql')),
            logConfig: {
                retention: RetentionDays.SIX_MONTHS,
                excludeVerboseContent: false,
                fieldLogLevel: FieldLogLevel.ALL
            },
            authorizationConfig: {
                defaultAuthorization: {
                    authorizationType: AuthorizationType.USER_POOL,
                    userPoolConfig: {
                        userPool: UserPool.fromUserPoolId(
                            this,
                            `${props.userPoolName}-${props.stage}-${props.env!.region}`,
                            props.userPoolId
                        )
                    }
                },
                additionalAuthorizationModes: [
                    /**
                     * for some specific use-cases, such as the transaction consumer, we will need to allow access via an API Key instead.
                     *
                     * ToDo: in the future we will need to make a AWS::SecretsManager::Secret and a AWS::SecretsManager::RotationSchedule.
                     *       The RotationSchedule will let us use a lambda to automatically rotate the ApiKey and store it in the Secret.
                     *       For now, we will rotate this key manually.
                     */
                    {
                        authorizationType: AuthorizationType.API_KEY,
                        apiKeyConfig: {
                            name: `${props.appSyncConfig.internalApiKeyName}-${props.stage}-${props.env!.region}`,
                            description: 'API Key to be used internally, in order to access the AppSync endpoints.',
                            expires: Expiration.after(Duration.days(365))
                        }
                    },
                    /**
                     * for some other use-cases such as the frontend logging one, we will need to allow access via the AWS IAM role instead.
                     *
                     * This is usually accessible via the Auth and Unauthorized roles in Amplify
                     */
                    {
                        authorizationType: AuthorizationType.IAM
                    }
                ]
            }
        });

        /**
         * create caching for this AppSync API, to be configured for each resolver, with a default TTL
         * of 3600 seconds or 1 hour, which is the max
         */
        new appsync.CfnApiCache(this, `${props.appSyncConfig.graphqlApiName}-${props.stage}-${props.env!.region}-caching`, {
            /**
             * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-appsync-apicache.html#cfn-appsync-apicache-apicachingbehavior
             */
            apiCachingBehavior: 'PER_RESOLVER_CACHING',
            apiId: appSyncApi.apiId,
            ttl: Duration.seconds(3600).toSeconds(),
            /**
             * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-appsync-apicache.html#cfn-appsync-apicache-type
             */
            type: 'R4_LARGE',
            /**
             * Enabling or disabling these encryption options can only be done at the creation of the cache. For our purposes, we chose to disable this for now,
             * since it will affect the performance of the cache, and we do not have any sensitive data that will get cached anyway (on top of us having all of
             * our endpoints protected).
             *
             * We will re-evaluate this choice as needed, and destroy and/or re-create the cache as applicable if these options need changing/adjusting.
             *
             * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-appsync-apicache.html#cfn-appsync-apicache-atrestencryptionenabled
             * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-appsync-apicache.html#cfn-appsync-apicache-transitencryptionenabled
             */
            atRestEncryptionEnabled: false,
            transitEncryptionEnabled: false,
        });

        // setting the global variable values, so we can re-use them in subsequent stacks.
        this.graphqlApiId = appSyncApi.apiId;
        this.graphqlApiEndpoint = appSyncApi.graphqlUrl;

        // creates the Cfn Outputs, to be added to the resulting file, which will be used by the Amplify frontend
        new CfnOutput(this, Constants.AppSyncConstants.APPSYNC_ENDPOINT, {
            exportName: Constants.AppSyncConstants.APPSYNC_ENDPOINT.replaceAll('_', '-'),
            value: appSyncApi.graphqlUrl
        });
        new CfnOutput(this, Constants.AppSyncConstants.APPSYNC_REGION, {
            exportName: Constants.AppSyncConstants.APPSYNC_REGION.replaceAll('_', '-'),
            value: props.env!.region!
        });
        new CfnOutput(this, Constants.AppSyncConstants.APPSYNC_AUTH_TYPE, {
            exportName: Constants.AppSyncConstants.APPSYNC_AUTH_TYPE.replaceAll('_', '-'),
            value: Constants.AmplifyConstants.ATTRIBUTE_COGNITO_USER_POOLS
        });
    }
}
