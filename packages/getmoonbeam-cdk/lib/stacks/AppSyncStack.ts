import {CfnOutput, Duration, Expiration, Stack, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {StageConfiguration} from "../models/StageConfiguration";
import path from "path";
import {AuthorizationType, GraphqlApi, SchemaFile} from "aws-cdk-lib/aws-appsync";
import {UserPool} from "aws-cdk-lib/aws-cognito";
import {AmplifyAuthConfig} from "../models/ServiceConfiguration";
import {Constants} from "@moonbeam/moonbeam-models";

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
                /**
                 * for some specific use-case, such as the transaction consumer, we will need to allow access via an API Key instead
                 *
                 * ToDo: in the future we will need to make a AWS::SecretsManager::Secret and a AWS::SecretsManager::RotationSchedule.
                 *       The RotationSchedule will let us use a lambda to automatically rotate the ApiKey and store it in the Secret.
                 *       For now we will rotate this key manually.
                 */
                additionalAuthorizationModes: [
                    {
                        authorizationType: AuthorizationType.API_KEY,
                        apiKeyConfig: {
                            name: `${props.appSyncConfig.internalApiKeyName}-${props.stage}-${props.env!.region}`,
                            description: 'API Key to be used internally, in order to access the AppSync endpoints.',
                            expires: Expiration.after(Duration.days(365))
                        }
                    }
                ]
            },
        });

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
