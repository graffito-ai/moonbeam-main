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
    /**
     * this flag will need to be updated once the email address has been verified,
     * and/or any time we want to verify another email address
     */
    readonly created: boolean;
}

/**
 * Interface used to define the configuration for AppSync
 */
export interface AppSyncConfiguration {
    readonly graphqlApiName: string;
}

/**
 * Interface used to define the configuration for the Storage resolvers
 * (used to retrieve and store from S3) (GraphQL based)
 */
export interface StorageConfiguration {
    readonly publicFilesBucketName: string;
    readonly mainFilesBucketName: string;
    readonly mainFilesCloudFrontDistributionName: string;
    readonly mainFilesCloudFrontTrustedPublicKeyName: string;
    readonly mainFilesCloudFrontTrustedKeyGroupName: string;
    readonly mainFilesCloudFrontAccessIdentityName: string;
    readonly mainFilesCloudFrontCachePolicyName: string;
    readonly storageFunctionName: string;
    readonly getResolverName: string;
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
}

/**
 * Interface used to define the configuration for the card linking service resolvers
 * (GraphQL based), and other afferent data stores.
 */
export interface CardLinkingConfiguration {
    readonly cardLinkingFunctionName: string;
    readonly cardLinkingTableName: string;
    readonly getCardLinkResolverName: string;
    readonly createCardLinkResolverName: string;
    readonly deleteCardResolverName: string;
    readonly addCardResolverName: string;
}

/**
 * Interface used to define the configuration for the card linking webhook service
 * API (REST based), which will handle incoming requests for Olive-based events,
 * such as: transactions, offers, reimbursements/credits, etc.
 */
export interface CardLinkingServiceConfiguration {
    readonly cardLinkingServiceAPIName: string;
    readonly apiDeploymentGroupName: string;
    readonly oliveSharedAPIKeyName: string;
    readonly oliveUsagePlan: string;
    readonly transactionsAcknowledgmentMethodName: string;
}

/**
 * Interface used to define the configuration for the transactions-related fan-out pattern, composed
 * of an event-based process, driven by SNS and SQS.
 */
export interface TransactionsFanOutConfiguration {
    readonly transactionsProcessingTopicName: string;
    readonly transactionalOffersProcessingQueueName: string;
    readonly transactionalOffersProcessingDLQName: string;
    readonly transactionsProcessingTopicDLQName: string;
    readonly transactionalOffersProcessingEventSourceMapping: string;
}

/**
 * Interface used to define all the resources for the producer and consumers, taking advantage
 * of the async transactional data.
 */
export interface TransactionsProducerConsumerConfiguration {
    readonly transactionsProducerFunctionName: string;
    readonly transactionsTableName: string;
    readonly transactionsPrimaryKey: string;
    readonly transactionsIdGlobalIndex: string;
    readonly transactionsStatusLocalIndex: string;
    readonly transactionalOffersConsumerFunctionName: string;
    readonly transactionsFanOutConfig: TransactionsFanOutConfiguration;
}
