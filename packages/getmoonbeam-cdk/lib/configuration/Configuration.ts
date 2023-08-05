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
                internalApiKeyName: 'moonbeamInternalApiKey',
                graphqlApiName: 'getMoonbeamGraphqlApi'
            },
            storageConfig: {
                publicFilesBucketName: Constants.StorageConstants.MOONBEAM_PUBLIC_FILES_BUCKET_NAME,
                mainFilesBucketName: Constants.StorageConstants.MOONBEAM_MAIN_FILES_BUCKET_NAME,
                mainFilesCloudFrontDistributionName: `cloudfront-distribution-${Constants.StorageConstants.MOONBEAM_MAIN_FILES_BUCKET_NAME}`,
                mainFilesCloudFrontTrustedPublicKeyName: `cloudfront-public-key-${Constants.StorageConstants.MOONBEAM_MAIN_FILES_BUCKET_NAME}`,
                mainFilesCloudFrontTrustedKeyGroupName: `cloudfront-key-group-${Constants.StorageConstants.MOONBEAM_MAIN_FILES_BUCKET_NAME}`,
                mainFilesCloudFrontAccessIdentityName: `cloudfront-access-identity-${Constants.StorageConstants.MOONBEAM_MAIN_FILES_BUCKET_NAME}`,
                mainFilesCloudFrontCachePolicyName: `cloudfront-cache-policy-${Constants.StorageConstants.MOONBEAM_MAIN_FILES_BUCKET_NAME}`,
                storageFunctionName: 'storageLambdaFunction',
                getResolverName: 'getStorage'
            },
            militaryVerificationConfig: {
                militaryVerificationFunctionName: 'militaryVerificationLambdaFunction',
                militaryVerificationTableName: 'militaryVerificationTable',
                getMilitaryVerificationStatusResolverName: 'getMilitaryVerificationStatus',
                updateMilitaryVerificationStatusResolverName: 'updateMilitaryVerificationStatus',
                createMilitaryVerificationResolverName: 'createMilitaryVerification'
            },
            cardLinkingConfig: {
                cardLinkingFunctionName: 'cardLinkingLambdaFunction',
                cardLinkingTableName: 'cardLinkingTable',
                cardLinkingStatusGlobalIndex: 'cardLinkingStatusGlobalIndex',
                getCardLinkResolverName: 'getCardLink',
                createCardLinkResolverName: 'createCardLink',
                deleteCardResolverName: 'deleteCard',
                addCardResolverName: 'addCard',
                getEligibleLinkedUsersResolverName: 'getEligibleLinkedUsers'
            },
            apiGatewayServiceConfig: {
                cardLinkingServiceAPIName: 'cardLinkingServiceAPI',
                apiDeploymentGroupName: 'cardLinkingAPILogGroup',
                oliveSharedAPIKeyName: 'cardLinkingOliveSharedAPIKey',
                oliveUsagePlan: `cardLinkingOliveUsagePlan`,
                internallySharedAPIKeyName: `internallySharedAPIKey`,
                internalUsagePlan: `internalUsagePlan`,
                transactionsAcknowledgmentMethodName: `transactionsAcknowledgment`,
                reimbursementsAcknowledgmentMethodName: `reimbursementsAcknowledgment`
            },
            reimbursementsProducerConsumerConfig: {
                reimbursementsProducerFunctionName: 'reimbursementsProducerLambdaFunction',
                reimbursementsConsumerFunctionName: 'reimbursementsConsumerLambdaFunction',
                reimbursementsCronRuleName: 'reimbursementsCronRule',
                reimbursementsCronTriggerFunctionName: 'reimbursementsCronTriggerFunction',
                reimbursementsFanOutConfig: {
                    reimbursementsProcessingTopicName: 'reimbursementsProcessingTopic',
                    reimbursementsProcessingQueueName: 'reimbursementsProcessingQueue',
                    reimbursementsProcessingDLQName: 'reimbursementsProcessingDLQ',
                    reimbursementsProcessingTopicDLQName: 'reimbursementsProcessingTopicDLQ',
                    reimbursementsProcessingEventSourceMapping: 'reimbursementsProcessingEventSourceMapping'
                }
            },
            reimbursementsConfig: {
                reimbursementsFunctionName: 'reimbursementsLambdaFunction',
                reimbursementsTableName: 'reimbursementsTable',
                reimbursementsPrimaryKey: 'reimbursementsPrimaryKey',
                reimbursementsIdGlobalIndex: 'reimbursementsIdGlobalIndex',
                reimbursementsStatusLocalIndex: 'reimbursementsStatusLocalIndex',
                createReimbursementResolverName: 'createReimbursement',
                updateReimbursementResolverName: 'updateReimbursement'
            },
            transactionsProducerConsumerConfig: {
                transactionsProducerFunctionName: 'transactionsProducerLambdaFunction',
                transactionalOffersConsumerFunctionName: 'transactionalOffersConsumerLambdaFunction',
                transactionsFanOutConfig: {
                    transactionsProcessingTopicName: 'transactionsProcessingTopic',
                    transactionalOffersProcessingQueueName: 'transactionalOffersProcessingQueue',
                    transactionalOffersProcessingDLQName: 'transactionalOffersProcessingDLQ',
                    transactionsProcessingTopicDLQName: 'transactionsProcessingTopicDLQ',
                    transactionalOffersProcessingEventSourceMapping: 'transactionalOffersProcessingEventSourceMapping'
                }
            },
            transactionsConfig: {
                transactionsFunctionName: 'transactionsLambdaFunction',
                transactionsTableName: 'transactionsTable',
                transactionsPrimaryKey: 'transactionsPrimaryKey',
                transactionsIdGlobalIndex: 'transactionsIdGlobalIndex',
                transactionsStatusLocalIndex: 'transactionsStatusLocalIndex',
                createTransactionResolverName: 'createTransaction',
                getTransactionResolverName: 'getTransaction',
                getTransactionByStatusResolverName: 'getTransactionByStatus',
                updateTransactionResolverName: 'updateTransaction'
            },
            sesConfig: {
                emailAddress: `noreply-${Stages.DEV}@moonbeam.vet`
            },
            environmentVariables: new Map<string, string>([])
        },
        [`${Stages.PROD}-${Regions.PDX}`]: {
            stage: Stages.PROD,
            awsAccountId: '251312580862',
            amplifyConfig: {
                amplifyAppName: 'getmoonbeamapp',
                amplifyServiceRoleName: 'getmoonbeam-application-service-role',
                amplifyAuthConfig: {
                    userPoolName: 'getmoonbeam-application-pool',
                    userPoolFrontendClientName: 'getmoonbeam-application-pool-client',
                    userPoolIdentityFrontendPoolName: 'getmoonbeam-application-frontend-pool-identity',
                    authenticatedRoleName: 'amplify-getmoonbeamapp-prod-authRole', // this role's policies needs to be translated into the role created by amplify via the app
                    unauthenticatedRoleName: 'amplify-getmoonbeamapp-prod-unauthRole' // this role's policies needs to be translated into the role created by amplify via the app
                },
            },
            appSyncConfig: {
                internalApiKeyName: 'moonbeamInternalApiKey',
                graphqlApiName: 'getMoonbeamGraphqlApi'
            },
            storageConfig: {
                publicFilesBucketName: Constants.StorageConstants.MOONBEAM_PUBLIC_FILES_BUCKET_NAME,
                mainFilesBucketName: Constants.StorageConstants.MOONBEAM_MAIN_FILES_BUCKET_NAME,
                mainFilesCloudFrontDistributionName: `cloudfront-distribution-${Constants.StorageConstants.MOONBEAM_MAIN_FILES_BUCKET_NAME}`,
                mainFilesCloudFrontTrustedPublicKeyName: `cloudfront-public-key-${Constants.StorageConstants.MOONBEAM_MAIN_FILES_BUCKET_NAME}`,
                mainFilesCloudFrontTrustedKeyGroupName: `cloudfront-key-group-${Constants.StorageConstants.MOONBEAM_MAIN_FILES_BUCKET_NAME}`,
                mainFilesCloudFrontAccessIdentityName: `cloudfront-access-identity-${Constants.StorageConstants.MOONBEAM_MAIN_FILES_BUCKET_NAME}`,
                mainFilesCloudFrontCachePolicyName: `cloudfront-cache-policy-${Constants.StorageConstants.MOONBEAM_MAIN_FILES_BUCKET_NAME}`,
                storageFunctionName: 'storageLambdaFunction',
                getResolverName: 'getStorage'
            },
            militaryVerificationConfig: {
                militaryVerificationFunctionName: 'militaryVerificationLambdaFunction',
                militaryVerificationTableName: 'militaryVerificationTable',
                getMilitaryVerificationStatusResolverName: 'getMilitaryVerificationStatus',
                updateMilitaryVerificationStatusResolverName: 'updateMilitaryVerificationStatus',
                createMilitaryVerificationResolverName: 'createMilitaryVerification'
            },
            cardLinkingConfig: {
                cardLinkingFunctionName: 'cardLinkingLambdaFunction',
                cardLinkingTableName: 'cardLinkingTable',
                cardLinkingStatusGlobalIndex: 'cardLinkingStatusGlobalIndex',
                getCardLinkResolverName: 'getCardLink',
                createCardLinkResolverName: 'createCardLink',
                deleteCardResolverName: 'deleteCard',
                addCardResolverName: 'addCard',
                getEligibleLinkedUsersResolverName: 'getEligibleLinkedUsers'
            },
            apiGatewayServiceConfig: {
                cardLinkingServiceAPIName: 'cardLinkingServiceAPI',
                apiDeploymentGroupName: 'cardLinkingAPILogGroup',
                oliveSharedAPIKeyName: 'cardLinkingOliveSharedAPIKey',
                oliveUsagePlan: `cardLinkingOliveUsagePlan`,
                internallySharedAPIKeyName: `internallySharedAPIKey`,
                internalUsagePlan: `internalUsagePlan`,
                transactionsAcknowledgmentMethodName: `transactionsAcknowledgment`,
                reimbursementsAcknowledgmentMethodName: `reimbursementsAcknowledgment`
            },
            reimbursementsProducerConsumerConfig: {
                reimbursementsProducerFunctionName: 'reimbursementsProducerLambdaFunction',
                reimbursementsConsumerFunctionName: 'reimbursementsConsumerLambdaFunction',
                reimbursementsCronRuleName: 'reimbursementsCronRule',
                reimbursementsCronTriggerFunctionName: 'reimbursementsCronTriggerFunction',
                reimbursementsFanOutConfig: {
                    reimbursementsProcessingTopicName: 'reimbursementsProcessingTopic',
                    reimbursementsProcessingQueueName: 'reimbursementsProcessingQueue',
                    reimbursementsProcessingDLQName: 'reimbursementsProcessingDLQ',
                    reimbursementsProcessingTopicDLQName: 'reimbursementsProcessingTopicDLQ',
                    reimbursementsProcessingEventSourceMapping: 'reimbursementsProcessingEventSourceMapping'
                }
            },
            reimbursementsConfig: {
                reimbursementsFunctionName: 'reimbursementsLambdaFunction',
                reimbursementsTableName: 'reimbursementsTable',
                reimbursementsPrimaryKey: 'reimbursementsPrimaryKey',
                reimbursementsIdGlobalIndex: 'reimbursementsIdGlobalIndex',
                reimbursementsStatusLocalIndex: 'reimbursementsStatusLocalIndex',
                createReimbursementResolverName: 'createReimbursement',
                updateReimbursementResolverName: 'updateReimbursement'
            },
            transactionsProducerConsumerConfig: {
                transactionsProducerFunctionName: 'transactionsProducerLambdaFunction',
                transactionalOffersConsumerFunctionName: 'transactionalOffersConsumerLambdaFunction',
                transactionsFanOutConfig: {
                    transactionsProcessingTopicName: 'transactionsProcessingTopic',
                    transactionalOffersProcessingQueueName: 'transactionalOffersProcessingQueue',
                    transactionalOffersProcessingDLQName: 'transactionalOffersProcessingDLQ',
                    transactionsProcessingTopicDLQName: 'transactionsProcessingTopicDLQ',
                    transactionalOffersProcessingEventSourceMapping: 'transactionalOffersProcessingEventSourceMapping'
                }
            },
            transactionsConfig: {
                transactionsFunctionName: 'transactionsLambdaFunction',
                transactionsTableName: 'transactionsTable',
                transactionsPrimaryKey: 'transactionsPrimaryKey',
                transactionsIdGlobalIndex: 'transactionsIdGlobalIndex',
                transactionsStatusLocalIndex: 'transactionsStatusLocalIndex',
                createTransactionResolverName: 'createTransaction',
                getTransactionResolverName: 'getTransaction',
                getTransactionByStatusResolverName: 'getTransactionByStatus',
                updateTransactionResolverName: 'updateTransaction'
            },
            sesConfig: {
                emailAddress: `noreply@moonbeam.vet`
            },
            environmentVariables: new Map<string, string>([])
        },
        // ToDo: add more stages in here
    }
}
