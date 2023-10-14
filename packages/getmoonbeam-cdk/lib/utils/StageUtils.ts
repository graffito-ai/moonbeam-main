import {InfrastructureConfiguration} from "../models/InfrastructureConfiguration";
import {App, Environment} from "aws-cdk-lib";
import {AmplifyStack} from "../stacks/AmplifyStack";
import {SESStack} from "../stacks/SESStack";
import {AppSyncStack} from "../stacks/AppSyncStack";
import {StorageResolverStack} from "../stacks/StorageResolverStack";
import {MilitaryVerificationResolverStack} from "../stacks/MilitaryVerificationResolverStack";
import {CardLinkingResolverStack} from "../stacks/CardLinkingResolverStack";
import {TransactionsResolverStack} from "../stacks/TransactionsResolverStack";
import {TransactionsProducerConsumerStack} from "../stacks/TransactionsProducerConsumerStack";
import {APIGatewayServiceStack} from "../stacks/APIGatewayServiceStack";
import {NotificationsResolverStack} from "../stacks/NotificationsResolverStack";
import {PhysicalDevicesResolverStack} from "../stacks/PhysicalDevicesResolverStack";
import {OffersResolverStack} from "../stacks/OffersResolverStack";
import {FAQResolverStack} from "../stacks/FAQResolverStack";
import {UpdateTransactionsProducerConsumerStack} from "../stacks/UpdateTransactionsProducerConsumerStack";
import {MilitaryVerificationProducerConsumerStack} from "../stacks/MilitaryVerificationProducerConsumerStack";
import {UserAuthSessionResolverStack} from "../stacks/UserAuthSessionResolverStack";
import {NotificationReminderResolverStack} from "../stacks/NotificationReminderResolverStack";

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
                        emailAddress: stageConfiguration.sesConfig.emailAddress
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
                        internalApiKeyName: stageConfiguration.appSyncConfig.internalApiKeyName,
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

                // create the Transactions resolver stack && add it to the CDK app
                const transactionsStack = new TransactionsResolverStack(this.app, `moonbeam-transactions-resolver-${stageKey}`, {
                    stackName: `moonbeam-transactions-resolver-${stageKey}`,
                    description: 'This stack will contain all the AppSync related resources needed by the Lambda transactions resolver',
                    env: stageEnv,
                    stage: stageConfiguration.stage,
                    graphqlApiId: appSyncStack.graphqlApiId,
                    graphqlApiName: stageConfiguration.appSyncConfig.graphqlApiName,
                    transactionsConfig: stageConfiguration.transactionsConfig,
                    environmentVariables: stageConfiguration.environmentVariables
                });
                transactionsStack.addDependency(appSyncStack);

                // create the Transaction Producer Consumer stack && add it to the CDK app
                const transactionsProducerConsumerStack = new TransactionsProducerConsumerStack(this.app, `moonbeam-transactions-producer-consumer-${stageKey}`, {
                    stackName: `moonbeam-transactions-producer-consumer-${stageKey}`,
                    description: 'This stack will contain all the resources needed for the async transactional consumers, as well as producers',
                    env: stageEnv,
                    stage: stageConfiguration.stage,
                    transactionsProducerConsumerConfig: stageConfiguration.transactionsProducerConsumerConfig,
                    environmentVariables: stageConfiguration.environmentVariables
                });
                transactionsProducerConsumerStack.addDependency(appSyncStack);

                // create the Updated Transaction Producer Consumer stack && add it to the CDK app
                const updatedTransactionsProducerConsumerStack = new UpdateTransactionsProducerConsumerStack(this.app, `moonbeam-updated-transactions-producer-consumer-${stageKey}`, {
                    stackName: `moonbeam-updated-transactions-producer-consumer-${stageKey}`,
                    description: 'This stack will contain all the resources needed for the async updated transactional consumers, as well as producers',
                    env: stageEnv,
                    stage: stageConfiguration.stage,
                    updatedTransactionsProducerConsumerConfig: stageConfiguration.updatedTransactionsProducerConsumerConfig,
                    environmentVariables: stageConfiguration.environmentVariables
                });
                updatedTransactionsProducerConsumerStack.addDependency(appSyncStack);

                // create the Notifications resolver stack && add it to the CDK app
                const notificationsStack = new NotificationsResolverStack(this.app, `moonbeam-notifications-resolver-${stageKey}`, {
                    stackName: `moonbeam-notifications-resolver-${stageKey}`,
                    description: 'This stack will contain all the AppSync related resources needed by the Lambda notifications resolver',
                    env: stageEnv,
                    stage: stageConfiguration.stage,
                    graphqlApiId: appSyncStack.graphqlApiId,
                    graphqlApiName: stageConfiguration.appSyncConfig.graphqlApiName,
                    notificationsConfig: stageConfiguration.notificationsConfig,
                    environmentVariables: stageConfiguration.environmentVariables
                });
                notificationsStack.addDependency(appSyncStack);

                // create the Physical Devices resolver stack && add it to the CDK app
                const physicalDevicesStack = new PhysicalDevicesResolverStack(this.app, `moonbeam-physical-devices-resolver-${stageKey}`, {
                    stackName: `moonbeam-physical-devices-resolver-${stageKey}`,
                    description: 'This stack will contain all the AppSync related resources needed by the Lambda physical devices resolver',
                    env: stageEnv,
                    stage: stageConfiguration.stage,
                    graphqlApiId: appSyncStack.graphqlApiId,
                    graphqlApiName: stageConfiguration.appSyncConfig.graphqlApiName,
                    physicalDevicesConfig: stageConfiguration.physicalDevicesConfig,
                    environmentVariables: stageConfiguration.environmentVariables
                });
                physicalDevicesStack.addDependency(appSyncStack);

                // create the Offers resolver stack && add it to the CDK app
                const offersStack = new OffersResolverStack(this.app, `moonbeam-offers-resolver-${stageKey}`, {
                    stackName: `moonbeam-offers-resolver-${stageKey}`,
                    description: 'This stack will contain all the AppSync related resources needed by the Lambda offers resolver',
                    env: stageEnv,
                    stage: stageConfiguration.stage,
                    graphqlApiId: appSyncStack.graphqlApiId,
                    graphqlApiName: stageConfiguration.appSyncConfig.graphqlApiName,
                    offersConfig: stageConfiguration.offersConfig,
                    environmentVariables: stageConfiguration.environmentVariables
                });
                offersStack.addDependency(appSyncStack);

                // create the FAQ resolver stack && add it to the CDK app
                const faqStack = new FAQResolverStack(this.app, `moonbeam-faq-resolver-${stageKey}`, {
                    stackName: `moonbeam-faq-resolver-${stageKey}`,
                    description: 'This stack will contain all the AppSync related resources needed by the Lambda FAQ resolver',
                    env: stageEnv,
                    stage: stageConfiguration.stage,
                    graphqlApiId: appSyncStack.graphqlApiId,
                    graphqlApiName: stageConfiguration.appSyncConfig.graphqlApiName,
                    faqConfig: stageConfiguration.faqConfig,
                    environmentVariables: stageConfiguration.environmentVariables
                });
                faqStack.addDependency(appSyncStack);

                // create the User Auth Session resolver stack && add it to the CDK app
                const userAuthSessionStack = new UserAuthSessionResolverStack(this.app, `moonbeam-user-auth-session-resolver-${stageKey}`, {
                    stackName: `moonbeam-user-auth-session-resolver-${stageKey}`,
                    description: 'This stack will contain all the AppSync related resources needed by the Lambda User Auth Session resolver',
                    env: stageEnv,
                    stage: stageConfiguration.stage,
                    graphqlApiId: appSyncStack.graphqlApiId,
                    graphqlApiName: stageConfiguration.appSyncConfig.graphqlApiName,
                    userAuthSessionConfig: stageConfiguration.userAuthSessionConfig,
                    environmentVariables: stageConfiguration.environmentVariables
                });
                userAuthSessionStack.addDependency(appSyncStack);

                // create the Military Verification Notification/Updates Producer Consumer stack && add it to the CDK app
                const militaryVerificationUpdatesProducerConsumerStack = new MilitaryVerificationProducerConsumerStack(this.app, `moonbeam-military-verification-updates-producer-consumer-${stageKey}`, {
                    stackName: `moonbeam-military-verification-updates-producer-consumer-${stageKey}`,
                    description: 'This stack will contain all the resources needed for the military verification update-related consumers, as well as producers',
                    env: stageEnv,
                    stage: stageConfiguration.stage,
                    militaryVerificationProducerConsumerConfig: stageConfiguration.militaryVerificationProducerConsumerConfig,
                    environmentVariables: stageConfiguration.environmentVariables
                });
                militaryVerificationUpdatesProducerConsumerStack.addDependency(appSyncStack);

                // create the Notification Reminder resolver stack && add it to the CDK app
                const notificationReminderStack = new NotificationReminderResolverStack(this.app, `moonbeam-notification-reminder-resolver-${stageKey}`, {
                    stackName: `moonbeam-notification-reminder-resolver-${stageKey}`,
                    description: 'This stack will contain all the AppSync related resources needed by the Lambda Notification Reminder resolver',
                    env: stageEnv,
                    stage: stageConfiguration.stage,
                    graphqlApiId: appSyncStack.graphqlApiId,
                    graphqlApiName: stageConfiguration.appSyncConfig.graphqlApiName,
                    notificationReminderConfig: stageConfiguration.notificationReminderConfig,
                    environmentVariables: stageConfiguration.environmentVariables
                });
                notificationReminderStack.addDependency(appSyncStack);

                // create the API Gateway Service API stack && add it to the CDK app
                const apiGatewayStack = new APIGatewayServiceStack(this.app, `moonbeam-api-gateway-${stageKey}`, {
                    stackName: `moonbeam-api-gateway-${stageKey}`,
                    description: 'This stack will contain all the API Gateway related resources for the GetMoonbeam Application',
                    env: stageEnv,
                    stage: stageConfiguration.stage,
                    transactionsProducerLambda: transactionsProducerConsumerStack.transactionsProducerLambda,
                    updatedTransactionsProducerLambda: updatedTransactionsProducerConsumerStack.updatedTransactionalOffersProducerLambda,
                    militaryVerificationNotificationProducerLambda: militaryVerificationUpdatesProducerConsumerStack.militaryVerificationNotificationProducerLambda,
                    apiGatewayServiceConfig: stageConfiguration.apiGatewayServiceConfig,
                    environmentVariables: stageConfiguration.environmentVariables,
                });
                apiGatewayStack.addDependency(transactionsProducerConsumerStack);
                apiGatewayStack.addDependency(updatedTransactionsProducerConsumerStack);
                apiGatewayStack.addDependency(militaryVerificationUpdatesProducerConsumerStack);
            }
        }
    };
}
