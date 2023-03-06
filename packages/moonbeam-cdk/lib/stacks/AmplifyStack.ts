import {aws_amplify, CfnOutput, Stack, StackProps} from "aws-cdk-lib";
import {StageConfiguration} from "../models/StageConfiguration";
import {Construct} from "constructs";
import {AmplifyAuthStack} from "./AmplifyAuthStack";
import {ReferralApiStack} from "./ReferralApiStack";
import {Constants, Stages} from "@moonbeam/moonbeam-models";

/**
 * File used to define the Amplify stack, used to deploy all Amplify related functionality.
 */
export class AmplifyStack extends Stack {
    /**
     * Constructor for the Amplify stack
     *
     * @param scope scope to be passed in (usually a CDK App Construct)
     * @param id stack id to be passed in
     * @param props stack properties to be passed in
     */
    constructor(scope: Construct, id: string, props: StackProps & Pick<StageConfiguration, 'environmentVariables' | 'stage' | 'amplifyConfig'>) {
        super(scope, id, props);

        /**
         * we check against the DEV stage so that we only create
         * the Amplify app (as well as the deployment) once.
         */
        const amplifyApp = props.stage === Stages.DEV && new aws_amplify.CfnApp(this, `${props.amplifyConfig!.amplifyAppName!}`, {
            name: `${props.amplifyConfig!.amplifyAppName!}`,
            iamServiceRole: `${props.amplifyConfig!.amplifyServiceRoleName!}`
        });

        // add the authentication resources through a nested auth stack
        const amplifyAuthStack = new AmplifyAuthStack(this, `amplify-auth-${props.stage}-${props.env!.region}`, {
            stackName: `amplify-auth-${props.stage}-${props.env!.region}`,
            description: 'This stack will contain all the Amplify Auth related resources',
            env: props.env,
            stage: props.stage,
            amplifyConfig: {
                amplifyAuthConfig: {
                    userPoolName: props.amplifyConfig!.amplifyAuthConfig!.userPoolName,
                    userPoolFrontendClientName: props.amplifyConfig!.amplifyAuthConfig!.userPoolFrontendClientName,
                    userPoolIdentityFrontendPoolName: props.amplifyConfig!.amplifyAuthConfig!.userPoolIdentityFrontendPoolName,
                    authenticatedRoleName: props.amplifyConfig!.amplifyAuthConfig!.authenticatedRoleName,
                    unauthenticatedRoleName: props.amplifyConfig!.amplifyAuthConfig!.unauthenticatedRoleName,
                },
            },
            environmentVariables: props.environmentVariables
        });

        // add the resources meant to capture the referral program
        const referralApiStack = new ReferralApiStack(this, `amplify-referral-${props.stage}-${props.env!.region}`, {
            stackName: `amplify-referral-${props.stage}-${props.env!.region}`,
            description: 'This stack will contain all the referral program related resources for Amplify',
            env: props.env,
            stage: props.stage,
            userPoolId: amplifyAuthStack.outputs[2],
            amplifyConfig: {
                amplifyAuthConfig: {
                    userPoolName: props.amplifyConfig!.amplifyAuthConfig!.userPoolName,
                    userPoolFrontendClientName: props.amplifyConfig!.amplifyAuthConfig!.userPoolFrontendClientName,
                    userPoolIdentityFrontendPoolName: props.amplifyConfig!.amplifyAuthConfig!.userPoolIdentityFrontendPoolName,
                    authenticatedRoleName: props.amplifyConfig!.amplifyAuthConfig!.authenticatedRoleName,
                    unauthenticatedRoleName: props.amplifyConfig!.amplifyAuthConfig!.unauthenticatedRoleName,
                },
                referralConfig: {
                    referralGraphqlApiName: props.amplifyConfig!.referralConfig!.referralGraphqlApiName,
                    referralFunctionName: props.amplifyConfig!.referralConfig!.referralFunctionName,
                    referralTableName: props.amplifyConfig!.referralConfig!.referralTableName,
                    getResolverName: props.amplifyConfig!.referralConfig!.getResolverName,
                    listResolverName: props.amplifyConfig!.referralConfig!.listResolverName,
                    createResolverName: props.amplifyConfig!.referralConfig!.createResolverName,
                    updateResolverName: props.amplifyConfig!.referralConfig!.updateResolverName
                }
            },
            environmentVariables: props.environmentVariables
        });
        referralApiStack.addDependency(amplifyAuthStack);

        // creates the Cfn Outputs, to be added to the resulting file, which will be used by the Amplify frontend
        amplifyApp && new CfnOutput(this, Constants.AmplifyConstants.AMPLIFY_ID, {
            exportName: Constants.AmplifyConstants.AMPLIFY_ID.replaceAll('_', '-'),
            value: amplifyApp.attrAppId
        });
        amplifyApp && new CfnOutput(this, Constants.AmplifyConstants.REGION, {
            exportName: Constants.AmplifyConstants.REGION.replaceAll('_', '-'),
            value: props.env!.region!
        });
        new CfnOutput(this, Constants.AmplifyConstants.COGNITO_REGION, {
            exportName: Constants.AmplifyConstants.COGNITO_REGION.replaceAll('_', '-'),
            value: amplifyAuthStack.outputs[0]
        });
        new CfnOutput(this, Constants.AmplifyConstants.COGNITO_IDENTITY_POOL_ID, {
            exportName: Constants.AmplifyConstants.COGNITO_IDENTITY_POOL_ID.replaceAll('_', '-'),
            value: amplifyAuthStack.outputs[1]
        });
        new CfnOutput(this, Constants.AmplifyConstants.USER_POOLS_ID, {
            exportName: Constants.AmplifyConstants.USER_POOLS_ID.replaceAll('_', '-'),
            value: amplifyAuthStack.outputs[2]
        });
        new CfnOutput(this, Constants.AmplifyConstants.USER_POOLS_WEB_CLIENT_ID, {
            exportName: Constants.AmplifyConstants.USER_POOLS_WEB_CLIENT_ID.replaceAll('_', '-'),
            value: amplifyAuthStack.outputs[3]
        });
        new CfnOutput(this, Constants.AmplifyConstants.APPSYNC_REGION, {
            exportName: Constants.AmplifyConstants.APPSYNC_REGION.replaceAll('_', '-'),
            value: referralApiStack.outputs[0]
        });
        new CfnOutput(this, Constants.AmplifyConstants.APPSYNC_AUTH_TYPE, {
            exportName: Constants.AmplifyConstants.APPSYNC_AUTH_TYPE.replaceAll('_', '-'),
            value: Constants.AmplifyConstants.ATTRIBUTE_COGNITO_USER_POOLS
        });
        new CfnOutput(this, Constants.AmplifyConstants.APPSYNC_ENDPOINT, {
            exportName: Constants.AmplifyConstants.APPSYNC_ENDPOINT.replaceAll('_', '-'),
            value: referralApiStack.outputs[1]
        });
    }
}
