import {InfrastructureConfiguration} from "../models/InfrastructureConfiguration";
import {App, Environment} from "aws-cdk-lib";
import {AmplifyStack} from "../stacks/AmplifyStack";
import {SESStack} from "../stacks/SESStack";
import {AppSyncStack} from "../stacks/AppSyncStack";
import {StorageResolverStack} from "../stacks/StorageResolverStack";
import {MilitaryVerificationResolverStack} from "../stacks/MilitaryVerificationResolverStack";
import {CardLinkingResolverStack} from "../stacks/CardLinkingResolverStack";
import {CardLinkingServiceStack} from "../stacks/CardLinkingServiceStack";
import {WebhookTransactionsLambdaStack} from "../stacks/WebhookTransactionsLambdaStack";

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
                        emailAddress: stageConfiguration.sesConfig.emailAddress,
                        created: stageConfiguration.sesConfig.created
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
                        amplifyAppName: stageConfiguration.amplifyConfig.amplifyAppName,
                        amplifyServiceRoleName: stageConfiguration.amplifyConfig.amplifyServiceRoleName,
                        amplifyAuthConfig: {
                            userPoolName: stageConfiguration.amplifyConfig.amplifyAuthConfig.userPoolName,
                            userPoolFrontendClientName: stageConfiguration.amplifyConfig.amplifyAuthConfig.userPoolFrontendClientName,
                            userPoolIdentityFrontendPoolName: stageConfiguration.amplifyConfig.amplifyAuthConfig.userPoolIdentityFrontendPoolName,
                            authenticatedRoleName: stageConfiguration.amplifyConfig.amplifyAuthConfig.authenticatedRoleName,
                            unauthenticatedRoleName: stageConfiguration.amplifyConfig.amplifyAuthConfig.unauthenticatedRoleName,
                        },
                    },
                    environmentVariables: stageConfiguration.environmentVariables
                });
                amplifyStack.addDependency(sesStack);

                // create the AppSync stack && add it to the CDK App
                const appSyncStack = new AppSyncStack(this.app, `moonbeam-appsync-${stageKey}`, {
                    stackName: `moonbeam-appsync-${stageKey}`,
                    description: 'This stack will contain all the AppSync related resources for the GetMoonbeam Application',
                    env: stageEnv,
                    stage: stageConfiguration.stage,
                    userPoolId: amplifyStack.userPoolId,
                    userPoolName: `${stageConfiguration.amplifyConfig.amplifyAuthConfig.userPoolName}-${stageKey}-${stageEnv.region}`,
                    appSyncConfig: {
                        graphqlApiName: stageConfiguration.appSyncConfig.graphqlApiName
                    },
                    environmentVariables: stageConfiguration.environmentVariables
                });
                appSyncStack.addDependency(amplifyStack);

                // create the AppSync/Lambda storage resolver stack && add it to the CDK app
                const storageStack = new StorageResolverStack(this.app, `moonbeam-storage-resolver-${stageKey}`,
                    amplifyStack.authenticatedRole, amplifyStack.unauthenticatedRole, {
                        stackName: `moonbeam-storage-resolver-${stageKey}`,
                        description: 'This stack will contain all the AppSync related resources needed by the Lambda storage resolver',
                        env: stageEnv,
                        stage: stageConfiguration.stage,
                        graphqlApiId: appSyncStack.graphqlApiId,
                        graphqlApiName: stageConfiguration.appSyncConfig.graphqlApiName,
                        storageConfig: stageConfiguration.storageConfig,
                        environmentVariables: stageConfiguration.environmentVariables
                    });
                storageStack.addDependency(appSyncStack);

                // create the Military Verification resolver stack && add it to the CDK app
                const militaryVerificationStack = new MilitaryVerificationResolverStack(this.app, `moonbeam-military-verification-resolver-${stageKey}`, {
                    stackName: `moonbeam-military-verification-resolver-${stageKey}`,
                    description: 'This stack will contain all the AppSync related resources needed by the Lambda military verification resolver',
                    env: stageEnv,
                    stage: stageConfiguration.stage,
                    graphqlApiId: appSyncStack.graphqlApiId,
                    graphqlApiName: stageConfiguration.appSyncConfig.graphqlApiName,
                    militaryVerificationConfig: stageConfiguration.militaryVerificationConfig,
                    environmentVariables: stageConfiguration.environmentVariables
                });
                militaryVerificationStack.addDependency(appSyncStack);

                // create the Card Linking resolver stack && add it to the CDK app
                const cardLinkingStack = new CardLinkingResolverStack(this.app, `moonbeam-card-linking-resolver-${stageKey}`, {
                    stackName: `moonbeam-card-linking-resolver-${stageKey}`,
                    description: 'This stack will contain all the AppSync related resources needed by the Lambda card linking resolver',
                    env: stageEnv,
                    stage: stageConfiguration.stage,
                    graphqlApiId: appSyncStack.graphqlApiId,
                    graphqlApiName: stageConfiguration.appSyncConfig.graphqlApiName,
                    cardLinkingConfig: stageConfiguration.cardLinkingConfig,
                    environmentVariables: stageConfiguration.environmentVariables
                });
                cardLinkingStack.addDependency(appSyncStack);

                // create the Webhook Transactions Lambda stack && add it to the CDK app
                const webhookTransactionsLambdaStack = new WebhookTransactionsLambdaStack(this.app, `moonbeam-webhook-transactions-handler-${stageKey}`, {
                    stackName: `moonbeam-webhook-transactions-handler-${stageKey}`,
                    description: 'This stack will contain all the Lambda related resources needed webhook transaction handlers',
                    env: stageEnv,
                    stage: stageConfiguration.stage,
                    webhookTransactionsConfig: stageConfiguration.webhookTransactionsConfig,
                    environmentVariables: stageConfiguration.environmentVariables
                });

                // create the Card Linking service API stack && add it to the CDK app
                const cardLinkingServiceStack = new CardLinkingServiceStack(this.app, `moonbeam-card-linking-service-${stageKey}`, {
                    stackName: `moonbeam-card-linking-service-${stageKey}`,
                    description: 'This stack will contain all the API Gateway related resources for the GetMoonbeam Application',
                    env: stageEnv,
                    stage: stageConfiguration.stage,
                    webhookTransactionsLambda: webhookTransactionsLambdaStack.webhookTransactionsLambda,
                    cardLinkingServiceConfig: stageConfiguration.cardLinkingServiceConfig,
                    environmentVariables: stageConfiguration.environmentVariables,
                });
                cardLinkingServiceStack.addDependency(webhookTransactionsLambdaStack);
            }
        }
    };
}
