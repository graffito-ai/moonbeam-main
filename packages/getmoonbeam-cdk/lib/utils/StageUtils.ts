import {InfrastructureConfiguration} from "../models/InfrastructureConfiguration";
import {App, Environment} from "aws-cdk-lib";
import {AmplifyStack} from "../stacks/AmplifyStack";
import { SESStack } from "../stacks/SESStack";

/**
 * File used as a utility class, for defining and setting up all infrastructure-based stages
 */
export class StageUtils {
    // infrastructure configuration to be used for defining and setting up all stages
    private readonly configuration: InfrastructureConfiguration;

    // CDK app, passed in
    private readonly app: App;

    // target environment, passed in
    private readonly targetEnvironment: string;

    /**
     * Utility constructor
     *
     * @param app cdk application to be passed in
     * @param configuration infrastructure configuration to be passed in
     * @param targetEnvironment a combination of stage and region arguments, obtained from the CDK app context
     */
    constructor(app: App, configuration: InfrastructureConfiguration, targetEnvironment: string) {
        this.app = app;
        this.configuration = configuration;
        this.targetEnvironment = targetEnvironment;
    }

    /**
     * Function used to set up all the stages, depending on the infrastructure configuration passed in
     */
    setupStages = () => {
        // loop through all stages
        for (const stageKey in this.configuration.stages) {
            // only target stages which match with the target environment provided through the CLI, in the App context
            if (stageKey === this.targetEnvironment) {
                const stageConfiguration = this.configuration.stages[stageKey];

                // define the AWS Environment that the stacks will be deployed in
                const stageEnv: Environment = {
                    account: stageConfiguration.awsAccountId,
                    region: stageKey.split(/-(.*)/s)[1]
                }

                // create the SES stack used to verify the SES email address identity used by Amplify Auth
                const sesStack = new SESStack(this.app, `moonbeam-ses-${stageKey}`, {
                    stackName: `moonbeam-ses-${stageKey}`,
                    description: 'This stack will contain all the SES resources used by GetMoonbeam Amplify Auth',
                    env: stageEnv,
                    stage: stageConfiguration.stage,
                    sesConfig: {
                        emailAddress: stageConfiguration.sesConfig!.emailAddress,
                        created: stageConfiguration.sesConfig!.created
                    },
                    environmentVariables: stageConfiguration.environmentVariables
                });

                // create the Amplify stack for all stages & add it to the CDK App
                const amplifyStack = new AmplifyStack(this.app, `moonbeam-amplify-${stageKey}`, {
                    stackName: `moonbeam-amplify-${stageKey}`,
                    description: 'This stack will contain all the Amplify resources needed for our GetMoonbeam Amplify Application',
                    env: stageEnv,
                    stage: stageConfiguration.stage,
                    amplifyConfig: {
                        amplifyAppName: stageConfiguration.amplifyConfig!.amplifyAppName!,
                        amplifyServiceRoleName: stageConfiguration.amplifyConfig!.amplifyServiceRoleName!,
                        amplifyAuthConfig: {
                            userPoolName: stageConfiguration.amplifyConfig!.amplifyAuthConfig!.userPoolName,
                            userPoolFrontendClientName: stageConfiguration.amplifyConfig!.amplifyAuthConfig!.userPoolFrontendClientName,
                            userPoolIdentityFrontendPoolName: stageConfiguration.amplifyConfig!.amplifyAuthConfig!.userPoolIdentityFrontendPoolName,
                            authenticatedRoleName: stageConfiguration.amplifyConfig!.amplifyAuthConfig!.authenticatedRoleName,
                            unauthenticatedRoleName: stageConfiguration.amplifyConfig!.amplifyAuthConfig!.unauthenticatedRoleName,
                        },
                    },
                    environmentVariables: stageConfiguration.environmentVariables
                });
                amplifyStack.addDependency(sesStack);
            }
        }
    };
}
