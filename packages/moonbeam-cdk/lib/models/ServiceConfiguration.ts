import {RemovalPolicy} from "aws-cdk-lib";

/**
 * Interface used to define the configuration for Amplify
 */
export interface AWSAmplifyConfiguration {
    readonly amplifyAppName?: string;
    readonly amplifyServiceRoleName?: string;
    readonly amplifyAuthConfig?: AmplifyAuthConfig;
    readonly referralConfig?: ReferralConfiguration;
}

/**
 * Interface used to define the configuration for the referral program stack
 */
export interface ReferralConfiguration {
    readonly referralGraphqlApiName: string;
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
