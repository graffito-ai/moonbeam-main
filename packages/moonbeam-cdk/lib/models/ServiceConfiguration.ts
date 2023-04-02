import {RemovalPolicy} from "aws-cdk-lib";

/**
 * Interface used to define the configuration for Amplify
 */
export interface AWSAmplifyConfiguration {
    readonly amplifyAppName?: string;
    readonly amplifyServiceRoleName?: string;
    readonly amplifyAuthConfig?: AmplifyAuthConfig;
    readonly appSyncConfig?: AppSyncConfiguration;
    readonly referralConfig?: ReferralConfiguration;
    readonly accountLinkingConfig?: AccountLinkingConfiguration;
    readonly storageConfig?: StorageConfiguration;
    readonly faqConfig?: FAQConfiguration;
}

/**
 * Interface used to define the configuration for AppSync
 */
export interface AppSyncConfiguration {
    readonly graphqlApiName: string;
}

/**
 * Interface used to define the configuration for the Storage service
 * (used to retrieve and store from S3)
 */
export interface StorageConfiguration {
    readonly deploymentBucketName: string;
    readonly mainFilesBucketName: string;
    readonly mainFilesCloudFrontDistributionName: string;
    readonly mainFilesCloudFrontTrustedPublicKeyName: string;
    readonly mainFilesCloudFrontTrustedKeyGroupName: string;
    readonly mainFilesCloudFrontAccessIdentityName: string;
    readonly mainFilesCloudFrontCachePolicyName: string;
    readonly storageFunctionName: string;
    readonly getResolverName: string;
    readonly putResolverName: string;
}

/**
 * Interface used to define the configuration for the FAQ stack
 */
export interface FAQConfiguration {
    readonly faqFunctionName: string;
    readonly faqTableName: string;
    readonly createResolverName: string;
    readonly listResolverName: string;
}

/**
 * Interface used to define the configuration for the account linking stack
 */
export interface AccountLinkingConfiguration {
    readonly accountLinkingFunctionName: string;
    readonly accountLinkingTableName: string;
    readonly getAccountLink: string;
    readonly listAccounts: string;
    readonly createResolverName: string;
    readonly updateResolverName: string;
    readonly deleteResolverName: string;
}

/**
 * Interface used to define the configuration for the referral program stack
 */
export interface ReferralConfiguration {
    readonly referralFunctionName: string;
    readonly referralTableName: string;
    readonly getResolverName: string;
    readonly listResolverName: string;
    readonly createResolverName: string;
    readonly updateResolverName: string;
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
 * Interface used to define the configuration for Amplify Auth
 */
export interface AmplifyAuthConfig {
    readonly userPoolName: string;
    readonly userPoolFrontendClientName: string;
    readonly userPoolIdentityFrontendPoolName: string;
    readonly authenticatedRoleName: string;
    readonly unauthenticatedRoleName: string;
}
