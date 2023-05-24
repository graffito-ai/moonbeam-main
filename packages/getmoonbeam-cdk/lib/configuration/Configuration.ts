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
                amplifyAppName: 'getmoonbeamapp',
                amplifyServiceRoleName: 'getmoonbeam-application-service-role',
                amplifyAuthConfig: {
                    userPoolName: 'getmoonbeam-application-pool',
                    userPoolFrontendClientName: 'getmoonbeam-application-pool-client',
                    userPoolIdentityFrontendPoolName: 'getmoonbeam-application-frontend-pool-identity',
                    authenticatedRoleName: 'amplify-getmoonbeamapp-dev-authRole', // this role's policies needs to be translated into the role created by amplify via the app
                    unauthenticatedRoleName: 'amplify-getmoonbeamapp-dev-unauthRole' // this role's policies needs to be translated into the role created by amplify via the app
                },
            },
            appSyncConfig: {
                graphqlApiName: 'getMoonbeamGraphqlApi'
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
            militaryVerificationConfig: {
                militaryVerificationFunctionName: 'militaryVerificationLambdaFunction',
                militaryVerificationTableName: 'militaryVerificationTable',
                getMilitaryVerificationStatusResolverName: 'getMilitaryVerificationStatus',
                updateMilitaryVerificationStatusResolverName: 'updateMilitaryVerificationStatus',
                createMilitaryVerificationResolverName: 'createMilitaryVerification'
            },
            sesConfig: {
                emailAddress: `noreply-${Stages.DEV}@moonbeam.vet`,
                /**
                 * this flag will need to be updated to true once the email address has been verified,
                 * and/or to false, any time we want to re-verify, or verify another email address
                 */
                created: true
            },
            environmentVariables: new Map<string, string>([])
        },
        // ToDo: add more stages in here
    }
}
