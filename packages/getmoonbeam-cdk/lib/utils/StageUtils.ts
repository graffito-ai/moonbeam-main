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
import {NotificationReminderProducerConsumerStack} from "../stacks/NotificationReminderProducerConsumerStack";
import {AppUpgradeResolverStack} from "../stacks/AppUpgradeResolverStack";
import {ReferralResolverStack} from "../stacks/ReferralResolverStack";
import {ReferralProducerConsumerStack} from "../stacks/ReferralProducerConsumerStack";
import {LoggingResolverStack} from "../stacks/LoggingResolverStack";
import {
    MilitaryVerificationReportingProducerConsumerStack
} from "../stacks/MilitaryVerificationReportingProducerConsumerStack";
import {AppReviewResolverStack} from "../stacks/AppReviewResolverStack";
import {UtilitiesResolverStack} from "../stacks/UtilitiesResolverStack";
import {ReimbursementsResolverStack} from "../stacks/ReimbursementsResolverStack";
import {ScriptsResolverStack} from "../stacks/ScriptsResolverStack";
import {ServicesResolverStack} from "../stacks/ServicesResolverStack";
import {EventsResolverStack} from "../stacks/EventsResolverStack";
import {LocationBasedReminderProducerConsumerStack} from "../stacks/LocationBasedReminderProducerConsumerStack";
import {IneligibleTransactionsProducerConsumerStack} from "../stacks/IneligibleTransactionsProducerConsumerStack";
import {EarningsSummaryResolverStack} from "../stacks/EarningsSummaryResolverStack";

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

                // create the Reimbursements resolver stack && add it to the CDK app
                const reimbursementsStack = new ReimbursementsResolverStack(this.app, `moonbeam-reimbursements-resolver-${stageKey}`, {
                    stackName: `moonbeam-reimbursements-resolver-${stageKey}`,
                    description: 'This stack will contain all the AppSync related resources needed by the Lambda reimbursements resolver',
                    env: stageEnv,
                    stage: stageConfiguration.stage,
                    graphqlApiId: appSyncStack.graphqlApiId,
                    graphqlApiName: stageConfiguration.appSyncConfig.graphqlApiName,
                    reimbursementsConfig: stageConfiguration.reimbursementsConfig,
                    environmentVariables: stageConfiguration.environmentVariables
                });
                reimbursementsStack.addDependency(appSyncStack);

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

                // create the Ineligible Transaction Producer Consumer stack && add it to the CDK app
                const ineligibleTransactionsProducerConsumerStack = new IneligibleTransactionsProducerConsumerStack(this.app, `moonbeam-ineligible-transactions-producer-consumer-${stageKey}`, {
                    stackName: `moonbeam-ineligible-transactions-producer-consumer-${stageKey}`,
                    description: 'This stack will contain all the resources needed for the async ineligible transactional consumers, as well as producers',
                    env: stageEnv,
                    stage: stageConfiguration.stage,
                    ineligibleTransactionsProducerConsumerConfig: stageConfiguration.ineligibleTransactionsProducerConsumerConfig,
                    environmentVariables: stageConfiguration.environmentVariables
                });
                ineligibleTransactionsProducerConsumerStack.addDependency(appSyncStack);

                // create the Transaction Producer Consumer stack && add it to the CDK app
                const transactionsProducerConsumerStack = new TransactionsProducerConsumerStack(this.app, `moonbeam-transactions-producer-consumer-${stageKey}`, {
                    stackName: `moonbeam-transactions-producer-consumer-${stageKey}`,
                    description: 'This stack will contain all the resources needed for the async transactional consumers, as well as producers',
                    env: stageEnv,
                    stage: stageConfiguration.stage,
                    transactionsProducerConsumerConfig: stageConfiguration.transactionsProducerConsumerConfig,
                    ineligibleTransactionsProcessingTopic: ineligibleTransactionsProducerConsumerStack.ineligibleTransactionsProcessingTopic,
                    environmentVariables: stageConfiguration.environmentVariables
                });
                transactionsProducerConsumerStack.addDependency(appSyncStack);
                transactionsProducerConsumerStack.addDependency(ineligibleTransactionsProducerConsumerStack);

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

                // create the Military Verification Reporting/Updates Producer Consumer stack && add it to the CDK app
                const militaryVerificationReportingProducerConsumerStack = new MilitaryVerificationReportingProducerConsumerStack(this.app, `moonbeam-military-verification-reporting-producer-consumer-${stageKey}`, {
                    stackName: `moonbeam-military-verification-reporting-producer-consumer-${stageKey}`,
                    description: 'This stack will contain all the resources needed for the military verification reporting-related consumers, as well as producers',
                    env: stageEnv,
                    stage: stageConfiguration.stage,
                    militaryVerificationReportingProducerConsumerConfig: stageConfiguration.militaryVerificationReportingProducerConsumerConfig,
                    environmentVariables: stageConfiguration.environmentVariables
                });
                militaryVerificationReportingProducerConsumerStack.addDependency(appSyncStack);

                // create the Notification Reminder Producer Consumer stack && add it to the CDK app
                const notificationReminderProducerConsumerStack = new NotificationReminderProducerConsumerStack(this.app, `moonbeam-notification-reminder-producer-consumer-${stageKey}`, {
                    stackName: `moonbeam-notification-reminder-producer-consumer-${stageKey}`,
                    description: 'This stack will contain all the resources needed for the notification reminder consumers, as well as producers',
                    env: stageEnv,
                    stage: stageConfiguration.stage,
                    notificationReminderProducerConsumerConfig: stageConfiguration.notificationReminderProducerConsumerConfig,
                    environmentVariables: stageConfiguration.environmentVariables
                });
                notificationReminderProducerConsumerStack.addDependency(appSyncStack);

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

                // create the App Storage resolver stack && add it to the CDK app
                const appUpgradeResolverStack = new AppUpgradeResolverStack(this.app, `moonbeam-app-upgrade-resolver-${stageKey}`, {
                    stackName: `moonbeam-app-upgrade-resolver-${stageKey}`,
                    description: 'This stack will contain all the AppSync related resources needed by the Lambda App Upgrade resolver',
                    env: stageEnv,
                    stage: stageConfiguration.stage,
                    graphqlApiId: appSyncStack.graphqlApiId,
                    graphqlApiName: stageConfiguration.appSyncConfig.graphqlApiName,
                    appUpgradeConfig: stageConfiguration.appUpgradeConfig,
                    environmentVariables: stageConfiguration.environmentVariables
                });
                appUpgradeResolverStack.addDependency(appSyncStack);

                // create the Utilities resolver stack && add it to the CDK app
                const utilitiesResolverStack = new UtilitiesResolverStack(this.app, `moonbeam-utilities-resolver-${stageKey}`,
                    amplifyStack.authenticatedRole, amplifyStack.unauthenticatedRole,
                    {
                        stackName: `moonbeam-utilities-resolver-${stageKey}`,
                        description: 'This stack will contain all the AppSync related resources needed by the Lambda Utilities resolver',
                        env: stageEnv,
                        stage: stageConfiguration.stage,
                        graphqlApiId: appSyncStack.graphqlApiId,
                        graphqlApiName: stageConfiguration.appSyncConfig.graphqlApiName,
                        utilitiesConfig: stageConfiguration.utilitiesConfig,
                        environmentVariables: stageConfiguration.environmentVariables
                    });
                utilitiesResolverStack.addDependency(appSyncStack);

                // create the Referral Producer Consumer stack && add it to the CDK app
                const referralProducerConsumerStack = new ReferralProducerConsumerStack(this.app, `moonbeam-referral-producer-consumer-${stageKey}`, {
                    stackName: `moonbeam-referral-producer-consumer-${stageKey}`,
                    description: 'This stack will contain all the resources needed for the referral consumers, as well as producers',
                    env: stageEnv,
                    stage: stageConfiguration.stage,
                    referralProducerConsumerConfig: stageConfiguration.referralProducerConsumerConfig,
                    environmentVariables: stageConfiguration.environmentVariables
                });
                referralProducerConsumerStack.addDependency(appSyncStack);

                // create the Location Based Reminder Producer Consumer stack && add it to the CDK app
                const locationBasedReminderProducerConsumerStack = new LocationBasedReminderProducerConsumerStack(this.app, `moonbeam-location-based-reminder-producer-consumer-${stageKey}`,
                    amplifyStack.authenticatedRole, amplifyStack.unauthenticatedRole, {
                        stackName: `moonbeam-location-based-reminder-producer-consumer-${stageKey}`,
                        description: 'This stack will contain all the AppSync related resources needed for the location based reminder consumers, as well as producers',
                        env: stageEnv,
                        stage: stageConfiguration.stage,
                        graphqlApiId: appSyncStack.graphqlApiId,
                        graphqlApiName: stageConfiguration.appSyncConfig.graphqlApiName,
                        locationBasedReminderProducerConsumerConfig: stageConfiguration.locationBasedReminderProducerConsumerConfig,
                        environmentVariables: stageConfiguration.environmentVariables
                    });
                locationBasedReminderProducerConsumerStack.addDependency(appSyncStack);

                // create the Referral resolver stack && add it to the CDK app
                const referralResolverStack = new ReferralResolverStack(this.app, `moonbeam-referral-resolver-${stageKey}`, {
                    stackName: `moonbeam-referral-resolver-${stageKey}`,
                    description: 'This stack will contain all the AppSync related resources needed by the Lambda Referral resolver',
                    env: stageEnv,
                    stage: stageConfiguration.stage,
                    graphqlApiId: appSyncStack.graphqlApiId,
                    graphqlApiName: stageConfiguration.appSyncConfig.graphqlApiName,
                    referralConfig: stageConfiguration.referralConfig,
                    environmentVariables: stageConfiguration.environmentVariables
                });
                referralResolverStack.addDependency(appSyncStack);

                // create the Services resolver stack && add it to the CDK app
                const servicesResolverStack = new ServicesResolverStack(this.app, `moonbeam-services-resolver-${stageKey}`, {
                    stackName: `moonbeam-services-resolver-${stageKey}`,
                    description: 'This stack will contain all the AppSync related resources needed by the Lambda Services resolver',
                    env: stageEnv,
                    stage: stageConfiguration.stage,
                    graphqlApiId: appSyncStack.graphqlApiId,
                    graphqlApiName: stageConfiguration.appSyncConfig.graphqlApiName,
                    servicePartnersConfig: stageConfiguration.servicePartnersConfig,
                    environmentVariables: stageConfiguration.environmentVariables
                });
                servicesResolverStack.addDependency(appSyncStack);

                // create the Events resolver stack && add it to the CDK app
                const eventsResolverStack = new EventsResolverStack(this.app, `moonbeam-events-resolver-${stageKey}`, {
                    stackName: `moonbeam-events-resolver-${stageKey}`,
                    description: 'This stack will contain all the AppSync related resources needed by the Lambda Events resolver',
                    env: stageEnv,
                    stage: stageConfiguration.stage,
                    graphqlApiId: appSyncStack.graphqlApiId,
                    graphqlApiName: stageConfiguration.appSyncConfig.graphqlApiName,
                    eventsConfig: stageConfiguration.eventsConfig,
                    environmentVariables: stageConfiguration.environmentVariables
                });
                eventsResolverStack.addDependency(appSyncStack);

                // create the Logging resolver stack && add it to the CDK app
                const loggingResolverStack = new LoggingResolverStack(this.app, `moonbeam-logging-resolver-${stageKey}`,
                    amplifyStack.authenticatedRole, amplifyStack.unauthenticatedRole, {
                        stackName: `moonbeam-logging-resolver-${stageKey}`,
                        description: 'This stack will contain all the AppSync related resources needed by the Lambda Logging resolver',
                        env: stageEnv,
                        stage: stageConfiguration.stage,
                        graphqlApiId: appSyncStack.graphqlApiId,
                        graphqlApiName: stageConfiguration.appSyncConfig.graphqlApiName,
                        loggingConfig: stageConfiguration.loggingConfig,
                        environmentVariables: stageConfiguration.environmentVariables
                    });
                loggingResolverStack.addDependency(appSyncStack);

                // create the Logging resolver stack && add it to the CDK app
                const appReviewResolverStack = new AppReviewResolverStack(this.app, `moonbeam-app-review-resolver-${stageKey}`, {
                    stackName: `moonbeam-app-review-resolver-${stageKey}`,
                    description: 'This stack will contain all the AppSync related resources needed by the Lambda App Review resolver',
                    env: stageEnv,
                    stage: stageConfiguration.stage,
                    graphqlApiId: appSyncStack.graphqlApiId,
                    graphqlApiName: stageConfiguration.appSyncConfig.graphqlApiName,
                    appReviewConfig: stageConfiguration.appReviewConfig,
                    environmentVariables: stageConfiguration.environmentVariables
                });
                appReviewResolverStack.addDependency(appSyncStack);

                // create the Scripts resolver stack && add it to the CDK app
                const scriptsResolverStack = new ScriptsResolverStack(this.app, `moonbeam-scripts-resolver-${stageKey}`, {
                    stackName: `moonbeam-scripts-resolver-${stageKey}`,
                    description: 'This stack will contain all the AppSync related resources needed by the Lambda Scripts resolver',
                    env: stageEnv,
                    stage: stageConfiguration.stage,
                    scriptsConfig: stageConfiguration.scriptsConfig,
                    environmentVariables: stageConfiguration.environmentVariables
                });
                scriptsResolverStack.addDependency(appSyncStack);

                // create the Earnings Summary resolver stack && add it to the CDK app
                const earningsSummaryStack = new EarningsSummaryResolverStack(this.app, `moonbeam-earnings-summary-resolver-${stageKey}`, {
                    stackName: `moonbeam-earnings-summary-resolver-${stageKey}`,
                    description: 'This stack will contain all the AppSync related resources needed by the Lambda Earnings Summary resolver',
                    env: stageEnv,
                    stage: stageConfiguration.stage,
                    graphqlApiId: appSyncStack.graphqlApiId,
                    graphqlApiName: stageConfiguration.appSyncConfig.graphqlApiName,
                    earningsSummaryConfig: stageConfiguration.earningsSummaryConfig,
                    environmentVariables: stageConfiguration.environmentVariables
                });
                earningsSummaryStack.addDependency(appSyncStack);

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
