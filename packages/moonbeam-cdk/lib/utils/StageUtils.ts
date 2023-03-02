import {InfrastructureConfiguration} from "../models/InfrastructureConfiguration";
import {App, Environment} from "aws-cdk-lib";
import {AmplifyStack} from "../stacks/AmplifyStack";
import {Stages} from "../models/enum/Stages";
import {SESStack} from "../stacks/SESStack";

/**
 * File used as a utility class, for defining and setting up all infrastructure-based stages
 */
export class StageUtils {
    // infrastructure configuration to be used for defining and setting up all stages
    private readonly configuration: InfrastructureConfiguration;

    // CDK app, passed in
    private readonly app: App;

    /**
     * Utility constructor
     *
     * @param app cdk application to be passed in
     * @param configuration infrastructure configuration to be passed in
     */
    constructor(app: App, configuration: InfrastructureConfiguration) {
        this.app = app;
        this.configuration = configuration;
    }

    /**
     * Function used to set up all the stages, depending on the infrastructure configuration passed in
     */
    setupStages = () => {
        // loop through all stages
        for (const stageKey in this.configuration.stages) {
            const stageConfiguration = this.configuration.stages[stageKey];

            // define the AWS Environment that the stacks will be deployed in
            const stageEnv: Environment = {
                account: stageConfiguration.awsAccountId,
                region: stageKey.split(/-(.*)/s)[1]
            }

            // create the SES stack used to verify the SES email address identity used by Amplify Auth
            const sesStack = new SESStack(this.app, `ses-${stageKey}`, {
                stackName: `ses-${stageKey}`,
                description: 'This stack will contain all the SES resources used by Amplify Auth',
                env: stageEnv,
                stage: stageConfiguration.stage,
                sesConfig: {
                    emailAddress: stageConfiguration.sesConfig!.emailAddress,
                    created: stageConfiguration.sesConfig!.created
                },
                environmentVariables: stageConfiguration.environmentVariables
            })

            // create the Amplify stack for all stages & add it to the CDK App
            const amplifyStack = new AmplifyStack(this.app, `amplify-${stageKey}`, {
                stackName: `amplify-${stageKey}`,
                description: 'This stack will contain all the Amplify resources needed for our Amplify Application',
                env: stageEnv,
                stage: stageConfiguration.stage,
                amplifyConfig: {
                    ...(stageConfiguration.stage === Stages.DEV && {
                        amplifyAppName: stageConfiguration.amplifyConfig!.amplifyAppName!,
                        amplifyServiceRoleName: stageConfiguration.amplifyConfig!.amplifyServiceRoleName!
                    }),
                    amplifyAuthConfig: {
                        userPoolName: stageConfiguration.amplifyConfig!.amplifyAuthConfig.userPoolName,
                        userPoolFrontendClientName: stageConfiguration.amplifyConfig!.amplifyAuthConfig.userPoolFrontendClientName,
                        userPoolIdentityFrontendPoolName: stageConfiguration.amplifyConfig!.amplifyAuthConfig.userPoolIdentityFrontendPoolName,
                        authenticatedRoleName: stageConfiguration.amplifyConfig!.amplifyAuthConfig.authenticatedRoleName,
                        unauthenticatedRoleName: stageConfiguration.amplifyConfig!.amplifyAuthConfig.unauthenticatedRoleName,
                    }
                },
                environmentVariables: stageConfiguration.environmentVariables
            });
            amplifyStack.addDependency(sesStack);
        }
    };
}
