import {Constants, Regions, Stages} from "@moonbeam/moonbeam-models";
import {InfrastructureConfiguration} from "../models/InfrastructureConfiguration";

/**
 * Infrastructure configuration file, for all stages and regions
 */
export const INFRA_CONFIG: InfrastructureConfiguration = {
    stages: {
        [`${Stages.DEV}-${Regions.PDX}`]: {
            stage: Stages.DEV,
            awsAccountId: '963863720257',
            amplifyConfig: {
                amplifyAppName: 'moonbeam-application',
                amplifyServiceRoleName: 'moonbeam-application-service-role',
                amplifyAuthConfig: {
                    userPoolName: 'moonbeam-application-pool',
                    userPoolFrontendClientName: 'moonbeam-application-pool-client',
                    userPoolIdentityFrontendPoolName: 'moonbeam-application-frontend-pool-identity',
                    authenticatedRoleName: 'amplify-moonbeamapp-dev-160903-authRole', // this role name is obtained after creating an Amplify environment
                    unauthenticatedRoleName: 'amplify-moonbeamapp-dev-160903-unauthRole' // this role name is obtained after creating an Amplify environment
                },
                appSyncConfig: {
                    graphqlApiName: 'moonbeamGraphqlApi'
                },
                referralConfig: {
                    referralFunctionName: 'referralLambdaFunction',
                    referralTableName: 'referralTable',
                    getResolverName: 'getReferral',
                    listResolverName: 'listReferrals',
                    createResolverName: 'createReferral',
                    updateResolverName: 'updateReferral'
                },
                accountLinkingConfig: {
                    accountLinkingFunctionName: 'accountLinkingLambdaFunction',
                    accountLinkingTableName: 'accountLinks',
                    getAccountLink: 'getAccountLink',
                    listAccounts: 'listAccounts',
                    createResolverName: 'createAccountLink',
                    updateResolverName: 'updateAccountLink',
                    deleteResolverName: 'deleteAccount'
                },
                storageConfig: {
                    deploymentBucketName: Constants.MoonbeamConstants.MOONBEAM_DEPLOYMENT_BUCKET_NAME,
                    mainFilesBucketName: Constants.MoonbeamConstants.MOONBEAM_MAIN_FILES_BUCKET_NAME,
                    mainFilesCloudFrontDistributionName: `cloudfront-distribution-${Constants.MoonbeamConstants.MOONBEAM_MAIN_FILES_BUCKET_NAME}`,
                    mainFilesCloudFrontTrustedPublicKeyName: `cloudfront-public-key-${Constants.MoonbeamConstants.MOONBEAM_MAIN_FILES_BUCKET_NAME}`,
                    mainFilesCloudFrontTrustedKeyGroupName: `cloudfront-key-group-${Constants.MoonbeamConstants.MOONBEAM_MAIN_FILES_BUCKET_NAME}`,
                    mainFilesCloudFrontAccessIdentityName: `cloudfront-access-identity-${Constants.MoonbeamConstants.MOONBEAM_MAIN_FILES_BUCKET_NAME}`,
                    mainFilesCloudFrontCachePolicyName: `cloudfront-cache-policy-${Constants.MoonbeamConstants.MOONBEAM_MAIN_FILES_BUCKET_NAME}`,
                    storageFunctionName: 'storageLambdaFunction',
                    getResolverName: 'getStorage',
                    putResolverName: 'putStorage'
                },
                faqConfig: {
                    faqFunctionName: 'faqLambdaFunction',
                    faqTableName: 'faqs',
                    createResolverName: 'createFAQ',
                    listResolverName: 'listFAQs'
                },
                marketplaceConfig: {
                    marketplaceFunctionName: 'marketplaceLambdaFunction',
                    marketplaceTableName: 'partnerStores',
                    createResolverName: 'createPartnerStore',
                    getResolverName: 'getPartnerStore',
                    listResolverName: 'listPartnerStores'
                }
            },
            sesConfig: {
                emailAddress: `cloudservices-${Stages.DEV}@moonbeam.vet`,
                /**
                 * this flag will need to be updated to true once the email address has been verified,
                 * and/or to false, any time we want to re-verify, or verify another email address
                 */
                created: true
            },
            environmentVariables: new Map<string, string>([])
        },
        // [`${Stages.STAGING}-${Regions.PDX}`]: {
        //     stage: Stages.STAGING,
        //     awsAccountId: '507419278294',
        //     environmentVariables: new Map<string, string>([])
        // },
        // [`${Stages.PREVIEW}-${Regions.PDX}`]: {
        //     stage: Stages.STAGING,
        //     awsAccountId: '407863107367',
        //     environmentVariables: new Map<string, string>([])
        // },
    }
}
