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
 * (used to retrieve and store from S3)
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
 */
export interface MilitaryVerificationConfiguration {
    readonly militaryVerificationFunctionName: string;
    readonly militaryVerificationTableName: string;
    readonly getMilitaryVerificationStatusResolverName: string;
    readonly updateMilitaryVerificationStatusResolverName: string;
    readonly createMilitaryVerificationResolverName: string;
}
