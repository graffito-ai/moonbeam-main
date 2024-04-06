import { RemovalPolicy } from "aws-cdk-lib";

/**
 * Interface used to define the configuration for Amplify
 */
export interface AmplifyConfiguration {
    readonly amplifyAppName: string;
    readonly amplifyServiceRoleName: string;
    readonly amplifyAuthConfig: AmplifyAuthConfig;
}

/**
 * Interface used to define the configuration for Amplify Auth
 */
export interface AmplifyAuthConfig {
    readonly userPoolName: string;
    readonly userPoolFrontendClientName: string;
    readonly userPoolIdentityFrontendPoolName: string;
    readonly authenticatedRoleName: string;
    readonly unauthenticatedRoleName: string;
}

/**
 * Interface used to define the configuration for SES
 */
export interface SESConfiguration {
    readonly emailAddress: string;
    readonly removalPolicy?: RemovalPolicy;
}

/**
 * Interface used to define the configuration for AppSync
 */
export interface AppSyncConfiguration {
    readonly internalApiKeyName: string;
    readonly graphqlApiName: string;
}

/**
 * Interface used to define the configuration for the Storage resolvers
 * (used to retrieve and store from S3) (GraphQL based)
 */
export interface StorageConfiguration {
    readonly publicFilesBucketName: string;
    readonly militaryVerificationReportingBucketName: string;

    readonly mainFilesBucketName: string;
    readonly mainFilesCloudFrontDistributionName: string;
    readonly mainFilesCloudFrontTrustedPublicKeyName: string;
    readonly mainFilesCloudFrontTrustedKeyGroupName: string;
    readonly mainFilesCloudFrontAccessIdentityName: string;
    readonly mainFilesCloudFrontCachePolicyName: string;

    readonly logoFilesBucketName: string;
    readonly logoFilesCloudFrontDistributionName: string;
    readonly logoFilesCloudFrontTrustedPublicKeyName: string;
    readonly logoFilesCloudFrontTrustedKeyGroupName: string;
    readonly logoFilesCloudFrontAccessIdentityName: string;
    readonly logoFilesCloudFrontCachePolicyName: string;

    readonly storageFunctionName: string;
    readonly getResolverName: string;
    readonly putMilitaryVerificationReportResolverName: string;
    readonly getFilesForUserResolverName: string;
}

/**
 * Interface used to define the configuration for the referral service resolvers (GraphQL based),
 * and other afferent data stores.
 */
export interface ReferralConfiguration {
    readonly referralFunctionName: string;
    readonly referralTableName: string;
    readonly referralStatusGlobalIndex: string;
    readonly getReferralsByStatusResolverName: string;
    readonly getUserFromReferralResolverName: string;
    readonly createReferralResolverName: string;
    readonly updateReferralResolverName: string;
}

/**
 * Interface used to define the configuration for the event service resolvers (GraphQL based), and
 * other afferent data stores.
 */
export interface EventsConfiguration {
    readonly eventsFunctionName: string;
    readonly eventSeriesTableName: string;
    readonly eventSeriesCreateTimeGlobalIndex: string;
    readonly createEventSeriesResolverName: string;
    readonly getEventSeriesResolverName: string;
}

/**
 * Interface used to define the configuration for the service partners service resolvers (GraphQL based),
 * and other afferent data stores.
 */
export interface ServicePartnersConfiguration {
    readonly servicePartnersFunctionName: string;
    readonly servicePartnersTableName: string;
    readonly servicesPartnersCreateTimeGlobalIndex: string;
    readonly createServicePartnerResolverName: string;
    readonly getServicePartnersResolverName: string;
}


/**
 * Interface used to define the configuration for the Military verification service resolvers
 * (GraphQL based), and other afferent data stores.
 */
export interface MilitaryVerificationConfiguration {
    readonly militaryVerificationFunctionName: string;
    readonly militaryVerificationTableName: string;
    readonly getMilitaryVerificationStatusResolverName: string;
    readonly updateMilitaryVerificationStatusResolverName: string;
    readonly createMilitaryVerificationResolverName: string;
    readonly getMilitaryVerificationInformationResolverName: string;
    readonly militaryVerificationStatusGlobalIndex: string;
}

/**
 * Interface used to define the configuration for the card linking service resolvers
 * (GraphQL based), and other afferent data stores.
 */
export interface CardLinkingConfiguration {
    readonly cardLinkingFunctionName: string;
    readonly cardLinkingTableName: string;
    readonly cardLinkingStatusGlobalIndex: string;
    readonly getCardLinkResolverName: string;
    readonly createCardLinkResolverName: string;
    readonly deleteCardResolverName: string;
    readonly addCardResolverName: string;
    readonly getEligibleLinkedUsersResolverName: string;
    readonly getUsersWithNoCardsResolverName: string;
    readonly getUserCardLinkingIdResolverName: string;
    readonly updateCardResolverName: string;
}

/**
 * Interface used to define the configuration for the card linking webhook service
 * API (REST based), which will handle incoming requests for Olive-based events,
 * such as: transactions, offers, reimbursements/credits, etc.
 */
export interface APIGatewayServiceConfiguration {
    readonly cardLinkingServiceAPIName: string;
    readonly apiDeploymentGroupName: string;
    readonly oliveSharedAPIKeyName: string;
    readonly oliveUsagePlan: string;
    readonly internallySharedAPIKeyName: string;
    readonly internalUsagePlan: string;
    readonly transactionsAcknowledgmentMethodName: string;
    readonly updatedTransactionsAcknowledgmentMethodName: string;
    readonly militaryVerificationUpdatesAcknowledgmentMethodName: string;
}

/**
 * Interface used to define the configuration for the notification reminder-related
 * fan-out pattern, composed of an event-based process, driven by SNS and SQS.
 */
export interface NotificationReminderFanOutConfiguration {
    readonly notificationReminderProcessingTopicName: string;
    readonly notificationReminderProcessingQueueName: string;
    readonly notificationReminderProcessingDLQName: string;
    readonly notificationReminderProcessingTopicDLQName: string;
    readonly notificationReminderProcessingEventSourceMapping: string;
}

/**
 * Interface used to define all the resources for the producer and consumers, taking advantage
 * of the async notification reminder data.
 */
export interface NotificationReminderProducerConsumerConfiguration {
    readonly notificationReminderProducerFunctionName: string;
    readonly notificationReminderConsumerFunctionName: string;
    readonly notificationReminderCronRuleName: string;
    readonly notificationReminderFanOutConfig: NotificationReminderFanOutConfiguration;
}

/**
 * Interface used to define the configuration for the referral-related fan-out pattern, composed
 * of an event-based process, driven by SNS and SQS.
 */
export interface ReferralFanOutConfiguration {
    readonly referralProcessingTopicName: string;
    readonly referralProcessingQueueName: string;
    readonly referralProcessingDLQName: string;
    readonly referralProcessingTopicDLQName: string;
    readonly referralProcessingEventSourceMapping: string;
}

/**
 * Interface used to define all the resources for the producer and consumers, taking advantage
 * of the async referral data.
 */
export interface ReferralProducerConsumerConfiguration {
    readonly referralProducerFunctionName: string;
    readonly referralConsumerFunctionName: string;
    readonly referralProducerCronRuleName: string;
    readonly referralFanOutConfig: ReferralFanOutConfiguration;
}

/**
 * Interface used to define the configuration for the transactions-related fan-out pattern, composed
 * of an event-based process, driven by SNS and SQS.
 */
export interface TransactionsFanOutConfiguration {
    readonly transactionsProcessingTopicName: string;
    readonly notificationsTransactionalOffersProcessingQueueName: string;
    readonly notificationsTransactionalOffersProcessingDLQName: string;
    readonly transactionalOffersProcessingQueueName: string;
    readonly transactionalOffersProcessingDLQName: string;
    readonly notificationTransactionsProcessingTopicDLQName: string;
    readonly transactionsProcessingTopicDLQName: string;
    readonly notificationsTransactionalOffersProcessingEventSourceMapping: string;
    readonly transactionalOffersProcessingEventSourceMapping: string;
}

/**
 * Interface used to define all the resources for the producer and consumers, taking advantage
 * of the async transactional data.
 */
export interface TransactionsProducerConsumerConfiguration {
    readonly transactionsProducerFunctionName: string;
    readonly transactionalOffersConsumerFunctionName: string;
    readonly transactionalOffersNotificationsConsumerFunctionName: string;
    readonly transactionsFanOutConfig: TransactionsFanOutConfiguration;
}

/**
 * Interface used to define the configuration for the update transaction-related fan-out pattern, composed
 * of an event-based process, driven by SNS and SQS.
 */
export interface UpdatedTransactionsFanOutConfiguration {
    readonly updatedTransactionalOffersProcessingTopicName: string;
    readonly updatedTransactionalOffersProcessingQueueName: string;
    readonly updatedTransactionalOffersProcessingDLQName: string;
    readonly updatedTransactionalOffersProcessingTopicDLQName: string;
    readonly updatedTransactionalOffersProcessingEventSourceMapping: string;
}

/**
 * Interface used to define all the resources for the producer and consumers, taking advantage
 * of the async update transactional data.
 */
export interface UpdatedTransactionsProducerConsumerConfiguration {
    readonly updatedTransactionsProducerFunctionName: string;
    readonly updatedTransactionsConsumerFunctionName: string;
    readonly updatedTransactionsFanOutConfig: UpdatedTransactionsFanOutConfiguration;
}

/**
 * Interface used to define the configuration for the military verifications-related fan-out pattern, composed
 * of an event-based process, driven by SNS and SQS, used for verification notifications.
 */
export interface MilitaryVerificationNotificationFanOutConfiguration {
    readonly militaryVerificationNotificationProcessingTopicName: string;
    readonly militaryVerificationNotificationProcessingQueueName: string;
    readonly militaryVerificationNotificationProcessingDLQName: string;
    readonly militaryVerificationNotificationProcessingTopicDLQName: string;
    readonly militaryVerificationNotificationProcessingEventSourceMapping: string;
}

/**
 * Interface used to define all the resources for the producer and consumers, taking advantage
 * of the async military verification notifications data, used for verification notifications.
 */
export interface MilitaryVerificationProducerConsumerConfiguration {
    readonly militaryVerificationNotificationProducerFunctionName: string;
    readonly militaryVerificationNotificationConsumerFunctionName: string;
    readonly militaryVerificationNotificationFanOutConfig: MilitaryVerificationNotificationFanOutConfiguration;
}

/**
 * Interface used to define the configuration for the location-based notification fan-out pattern, composed
 * of an event-based process, driven by SNS and SQS, used for location-based notification updates.
 */
export interface LocationBasedReminderFanOutConfiguration {
    readonly locationBasedReminderProcessingTopicName: string;
    readonly locationBasedReminderProcessingQueueName: string;
    readonly locationBasedReminderProcessingDLQName: string;
    readonly locationBasedReminderProcessingTopicDLQName: string;
    readonly locationBasedReminderProcessingEventSourceMapping: string;
}

/**
 * Interface used to define all the resources for the producer and consumers, taking advantage
 * of the async location updates data, used for location-based notification updates.
 */
export interface LocationBasedReminderProducerConsumerConfiguration {
    readonly locationBasedReminderProducerFunctionName: string;
    readonly acknowledgeLocationUpdateResolverName: string;
    readonly locationBasedReminderConsumerFunctionName: string;
    readonly locationBasedReminderFanOutConfig: LocationBasedReminderFanOutConfiguration;
}

/**
 * Interface used to define the configuration for the military verifications-related fan-out pattern, composed
 * of an event-based process, driven by SNS and SQS, used for military verification reporting.
 */
export interface MilitaryVerificationReportingFanOutConfiguration {
    readonly militaryVerificationReportingProcessingTopicName: string;
    readonly militaryVerificationReportingProcessingQueueName: string;
    readonly militaryVerificationReportingProcessingDLQName: string;
    readonly militaryVerificationReportingProcessingTopicDLQName: string;
    readonly militaryVerificationReportingProcessingEventSourceMapping: string;
}

/**
 * Interface used to define all the resources for the producer and consumers, taking advantage
 * of the async military verification notifications data, used for military verification reporting.
 */
export interface MilitaryVerificationReportingProducerConsumerConfiguration {
    readonly militaryVerificationReportingProducerFunctionName: string;
    readonly militaryVerificationReportingConsumerFunctionName: string;
    readonly militaryVerificationReportingCronRuleName: string;
    readonly militaryVerificationReportingFanOutConfig: MilitaryVerificationReportingFanOutConfiguration;
}

/**
 * Interface used to define the configuration for the transactions service resolvers
 * (GraphQL based), and other afferent data stores.
 */
export interface TransactionsConfiguration {
    readonly transactionsFunctionName: string;
    readonly createTransactionResolverName: string;
    readonly getTransactionResolverName: string;
    readonly getTransactionByStatusResolverName: string;
    readonly updateTransactionResolverName: string;
    readonly getAllUsersEligibleForReimbursementsResolverName: string;
    readonly transactionsTableName: string;
    readonly transactionsIdGlobalIndex: string;
    readonly transactionsStatusLocalIndex: string;
    readonly transactionStatusGlobalIndex: string;
}

/**
 * Interface used to define the configuration for the notifications service resolvers
 * (GraphQL based), and other afferent data stores.
 */
export interface NotificationsConfiguration {
    readonly notificationsFunctionName: string;
    readonly createNotificationResolverName: string;
    readonly getNotificationByTypeResolverName: string;
    readonly notificationsTableName: string;
    readonly notificationsChannelTypeLocalIndex: string;
    readonly notificationsTypeLocalIndex: string;
    readonly notificationsStatusLocalIndex: string;
    readonly notificationsTypeAndTimeGlobalIndex: string;
}

/**
 * Interface used to define the configuration for the user physical devices service resolvers
 * (GraphQL based), and other afferent data stores.
 */
export interface PhysicalDevicesConfiguration {
    readonly devicesFunctionName: string;
    readonly createDeviceResolverName: string;
    readonly updateDeviceResolverName: string;
    readonly getDevicesForUserResolverName: string;
    readonly getDeviceByTokenResolverName: string;
    readonly getDeviceResolverName: string;
    readonly devicesTableName: string;
    readonly devicesIdGlobalIndex: string;
    readonly deviceTokenIdGlobalIndex: string;
}

/**
 * Interface used to define the configuration for the offers service resolvers
 * (GraphQL based), and other afferent data stores.
 */
export interface OffersConfiguration {
    readonly offersFunctionName: string;
    readonly getOffersResolverName: string;
    readonly getFidelisPartnersResolverName: string;
    readonly getPremierOffersResolverName: string;
    readonly getSeasonalOffersResolverName: string;
    readonly searchOffersResolverName: string;
}

/**
 * Interface used to define the configuration for the FAQ service resolvers
 * (GraphQL based), and other afferent data stores.
 */
export interface FAQConfiguration {
    readonly faqFunctionName: string;
    readonly faqTableName: string;
    readonly createFAQResolverName: string;
    readonly getFAQsResolverName: string;
}

/**
 * Interface used to define the configuration for the User Auth service resolvers
 * (GraphQL based), and other afferent data stores.
 */
export interface UserAuthSessionConfiguration {
    readonly userAuthSessionFunctionName: string;
    readonly userAuthSessionTableName: string;
    readonly createUserAuthSessionResolverName: string;
    readonly updateUserAuthSessionResolverName: string;
    readonly getUserAuthSessionResolverName: string;
}

/**
 * Interface used to define the configuration for the notification reminder service resolvers
 * (GraphQL based), and other afferent data stores.
 */
export interface NotificationReminderConfiguration {
    readonly notificationReminderFunctionName: string;
    readonly notificationReminderTableName: string;
    readonly createNotificationReminderResolverName: string;
    readonly getNotificationRemindersResolverName: string;
    readonly getUsersByGeographyForNotificationRemindersResolverName: string;
    readonly updateNotificationReminderResolverName: string;
    readonly getAllUsersForNotificationRemindersResolverName: string;
}

/**
 * Interface used to define the configuration for the app review service resolvers (GraphQL based),
 * and other afferent data stores.
 */
export interface AppReviewConfiguration {
    readonly appReviewFunctionName: string;
    readonly appReviewTableName: string;
    readonly getAppReviewEligibilityResolverName: string;
    readonly createAppReviewResolverName: string;
}

/**
 * Interface used to define the configuration for the app upgrade service resolvers (GraphQL based),
 * and other afferent data stores.
 */
export interface AppUpgradeConfiguration {
    readonly appUpgradeFunctionName: string;
    readonly getAppUpgradeCredentialsResolverName: string;
}

/**
 * Interface used to define the configuration for the utilities service resolvers (GraphQL based),
 * and other afferent data stores.
 */
export interface UtilitiesConfiguration {
    readonly utilitiesFunctionName: string;
    readonly geoCodeAsyncResolverName: string;
    readonly getLocationPredictionsResolverName: string;
}

/**
 * Interface used to define the configuration used for logging purposes.
 */
export interface LoggingConfiguration {
    readonly loggingFunctionName: string;
    readonly createLogEventResolverName: string;
    readonly frontEndLogGroupName: string;
}

/**
 * Interface used to define the configuration for the reimbursements service resolvers
 * (GraphQL based), and other afferent data stores.
 */
export interface ReimbursementsConfiguration {
    readonly reimbursementsFunctionName: string;
    readonly createReimbursementResolverName: string;
    readonly getReimbursementsResolverName: string;
    readonly reimbursementsTableName: string;
    readonly reimbursementsIdGlobalIndex: string;
    readonly reimbursementsStatusLocalIndex: string;
}

/**
 * Interface used to define the configuration for the scripts service resolver.
 */
export interface ScriptsConfiguration {
    readonly scriptsFunctionName: string;
    readonly cardExpirationBackFillCronRuleName: string;
    readonly offerBackFillCronRuleName: string;
}
