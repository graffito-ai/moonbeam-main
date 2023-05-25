import {CfnOutput, Stack, StackProps} from "aws-cdk-lib";
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
                }
            },
        });
        this.graphqlApiId = appSyncApi.apiId;

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
