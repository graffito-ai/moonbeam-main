import {aws_amplify, Stack, StackProps} from "aws-cdk-lib";
import {StageConfiguration} from "../models/StageConfiguration";
import {Construct} from "constructs";
import {Stages} from "../models/enum/Stages";
import { AmplifyAuthStack } from "./AmplifyAuthStack";

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
    constructor (scope: Construct, id: string, props: StackProps & Pick<StageConfiguration, 'environmentVariables' | 'stage' | 'amplifyConfig'>) {
        super(scope, id, props);

        // first create the actual Amplify App - only for one stage (since we only want to create this once)
        props.stage == Stages.DEV && new aws_amplify.CfnApp(this, `${props.amplifyConfig!.amplifyAppName}`, {
            name: `${props.amplifyConfig!.amplifyAppName}`,
            iamServiceRole: `${props.amplifyConfig!.amplifyServiceRoleName}`
        });

        // add the authentication resources through a nested auth stack
        new AmplifyAuthStack(this,`amplify-auth-${props.stage}-${props.env!.region}`, {
            stackName: `amplify-auth-${props.stage}-${props.env!.region}`,
            description: 'This stack will contain all the Amplify Auth related resources',
            env: props.env,
            stage: props.stage,
            amplifyConfig: {
                amplifyAuthConfig: {
                    userPoolName: props.amplifyConfig!.amplifyAuthConfig.userPoolName,
                    userPoolFrontendClientName: props.amplifyConfig!.amplifyAuthConfig.userPoolFrontendClientName,
                    userPoolIdentityFrontendPoolName: props.amplifyConfig!.amplifyAuthConfig.userPoolIdentityFrontendPoolName,
                    authenticatedRoleName: props.amplifyConfig!.amplifyAuthConfig.authenticatedRoleName,
                    unauthenticatedRoleName: props.amplifyConfig!.amplifyAuthConfig.unauthenticatedRoleName,
                }
            },
            environmentVariables: props.environmentVariables
        })
    }
}
