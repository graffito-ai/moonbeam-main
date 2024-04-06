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
                militaryVerificationReportingBucketName: Constants.StorageConstants.MOONBEAM_MILITARY_VERIFICATION_REPORTING_BUCKET_NAME,

                mainFilesBucketName: Constants.StorageConstants.MOONBEAM_MAIN_FILES_BUCKET_NAME,
                mainFilesCloudFrontDistributionName: `cloudfront-distribution-${Constants.StorageConstants.MOONBEAM_MAIN_FILES_BUCKET_NAME}`,
                mainFilesCloudFrontTrustedPublicKeyName: `cloudfront-public-key-${Constants.StorageConstants.MOONBEAM_MAIN_FILES_BUCKET_NAME}`,
                mainFilesCloudFrontTrustedKeyGroupName: `cloudfront-key-group-${Constants.StorageConstants.MOONBEAM_MAIN_FILES_BUCKET_NAME}`,
                mainFilesCloudFrontAccessIdentityName: `cloudfront-access-identity-${Constants.StorageConstants.MOONBEAM_MAIN_FILES_BUCKET_NAME}`,
                mainFilesCloudFrontCachePolicyName: `cloudfront-cache-policy-${Constants.StorageConstants.MOONBEAM_MAIN_FILES_BUCKET_NAME}`,

                logoFilesBucketName: Constants.StorageConstants.MOONBEAM_LOGO_FILES_BUCKET_NAME,
                logoFilesCloudFrontDistributionName: `cloudfront-distribution-${Constants.StorageConstants.MOONBEAM_LOGO_FILES_BUCKET_NAME}`,
                logoFilesCloudFrontTrustedPublicKeyName: `cloudfront-public-key-${Constants.StorageConstants.MOONBEAM_LOGO_FILES_BUCKET_NAME}`,
                logoFilesCloudFrontTrustedKeyGroupName: `cloudfront-key-group-${Constants.StorageConstants.MOONBEAM_LOGO_FILES_BUCKET_NAME}`,
                logoFilesCloudFrontAccessIdentityName: `cloudfront-access-identity-${Constants.StorageConstants.MOONBEAM_LOGO_FILES_BUCKET_NAME}`,
                logoFilesCloudFrontCachePolicyName: `cloudfront-cache-policy-${Constants.StorageConstants.MOONBEAM_LOGO_FILES_BUCKET_NAME}`,

                storageFunctionName: 'storageLambdaFunction',
                getResolverName: 'getStorage',
                putMilitaryVerificationReportResolverName: 'putMilitaryVerificationReport',
                getFilesForUserResolverName: 'getFilesForUser'
            },
            militaryVerificationConfig: {
                militaryVerificationFunctionName: 'militaryVerificationLambdaFunction',
                militaryVerificationTableName: 'militaryVerificationTable',
                getMilitaryVerificationStatusResolverName: 'getMilitaryVerificationStatus',
                updateMilitaryVerificationStatusResolverName: 'updateMilitaryVerificationStatus',
                createMilitaryVerificationResolverName: 'createMilitaryVerification',
                getMilitaryVerificationInformationResolverName: 'getMilitaryVerificationInformation',
                militaryVerificationStatusGlobalIndex: 'militaryVerificationStatusGlobalIndex'
            },
            cardLinkingConfig: {
                cardLinkingFunctionName: 'cardLinkingLambdaFunction',
                cardLinkingTableName: 'cardLinkingTable',
                cardLinkingStatusGlobalIndex: 'cardLinkingStatusGlobalIndex',
                getCardLinkResolverName: 'getCardLink',
                createCardLinkResolverName: 'createCardLink',
                deleteCardResolverName: 'deleteCard',
                addCardResolverName: 'addCard',
                getEligibleLinkedUsersResolverName: 'getEligibleLinkedUsers',
                getUsersWithNoCardsResolverName: 'getUsersWithNoCards',
                getUserCardLinkingIdResolverName: 'getUserCardLinkingId',
                updateCardResolverName: 'updateCard'
            },
            apiGatewayServiceConfig: {
                cardLinkingServiceAPIName: 'cardLinkingServiceAPI',
                apiDeploymentGroupName: 'cardLinkingAPILogGroup',
                oliveSharedAPIKeyName: 'cardLinkingOliveSharedAPIKey',
                oliveUsagePlan: `cardLinkingOliveUsagePlan`,
                internallySharedAPIKeyName: `internallySharedAPIKey`,
                internalUsagePlan: `internalUsagePlan`,
                transactionsAcknowledgmentMethodName: `transactionsAcknowledgment`,
                updatedTransactionsAcknowledgmentMethodName: `updatedTransactionsAcknowledgment`,
                militaryVerificationUpdatesAcknowledgmentMethodName: `militaryVerificationUpdatesAcknowledgment`
            },
            referralProducerConsumerConfig: {
                referralProducerFunctionName: 'referralProducerFunction',
                referralConsumerFunctionName: 'referralConsumerFunction',
                referralProducerCronRuleName: 'referralProducerCronRule',
                referralFanOutConfig: {
                    referralProcessingTopicName: 'referralProcessingTopic',
                    referralProcessingQueueName: 'referralProcessingQueue',
                    referralProcessingDLQName: 'referralProcessingDLQ',
                    referralProcessingTopicDLQName: 'referralProcessingTopicDLQ',
                    referralProcessingEventSourceMapping: 'referralProcessingEventSourceMapping',
                }
            },
            transactionsProducerConsumerConfig: {
                transactionsProducerFunctionName: 'transactionsProducerLambdaFunction',
                transactionalOffersNotificationsConsumerFunctionName: 'transactionalOffersNotificationsConsumerFunction',
                transactionalOffersConsumerFunctionName: 'transactionalOffersConsumerLambdaFunction',
                transactionsFanOutConfig: {
                    transactionsProcessingTopicName: 'transactionsProcessingTopic',
                    notificationsTransactionalOffersProcessingQueueName: 'notificationsTransactionalOffersProcessingQueue',
                    notificationsTransactionalOffersProcessingDLQName: 'notificationsTransactionalOffersProcessingDLQ',
                    transactionalOffersProcessingQueueName: 'transactionalOffersProcessingQueue',
                    notificationTransactionsProcessingTopicDLQName: 'notificationTransactionsProcessingTopicDLQ',
                    transactionalOffersProcessingDLQName: 'transactionalOffersProcessingDLQ',
                    transactionsProcessingTopicDLQName: 'transactionsProcessingTopicDLQ',
                    transactionalOffersProcessingEventSourceMapping: 'transactionalOffersProcessingEventSourceMapping',
                    notificationsTransactionalOffersProcessingEventSourceMapping: 'notificationsTransactionalOffersProcessingEventSourceMapping'
                }
            },
            notificationReminderProducerConsumerConfig: {
                notificationReminderProducerFunctionName: 'notificationReminderProducerLambdaFunction',
                notificationReminderConsumerFunctionName: 'notificationReminderConsumerLambdaFunction',
                notificationReminderCronRuleName: 'notificationReminderCronRule',
                notificationReminderFanOutConfig: {
                    notificationReminderProcessingTopicName: 'notificationReminderProcessingTopic',
                    notificationReminderProcessingQueueName: 'notificationReminderProcessingQueue',
                    notificationReminderProcessingDLQName: 'notificationReminderProcessingDLQ',
                    notificationReminderProcessingTopicDLQName: 'notificationReminderProcessingTopicDLQ',
                    notificationReminderProcessingEventSourceMapping: 'notificationReminderProcessingEventSourceMapping'
                }
            },
            updatedTransactionsProducerConsumerConfig: {
                updatedTransactionsProducerFunctionName: 'updatedTransactionsProducerLambdaFunction',
                updatedTransactionsConsumerFunctionName: 'updatedTransactionsConsumerLambdaFunction',
                updatedTransactionsFanOutConfig: {
                    updatedTransactionalOffersProcessingTopicName: 'updatedTransactionalOffersProcessingTopic',
                    updatedTransactionalOffersProcessingTopicDLQName: 'updatedTransactionalOffersProcessingTopicDLQ',
                    updatedTransactionalOffersProcessingQueueName: 'updatedTransactionalOffersProcessingQueue',
                    updatedTransactionalOffersProcessingDLQName: 'updateTransactionalOffersProcessingDLQ',
                    updatedTransactionalOffersProcessingEventSourceMapping: 'updateTransactionalOffersProcessingEventSourceMapping'
                }
            },
            locationBasedReminderProducerConsumerConfig: {
                locationBasedReminderProducerFunctionName: 'locationBasedReminderProducerFunction',
                locationBasedReminderConsumerFunctionName: 'locationBasedReminderConsumerFunction',
                acknowledgeLocationUpdateResolverName: 'acknowledgeLocationUpdate',
                locationBasedReminderFanOutConfig: {
                    locationBasedReminderProcessingTopicName: 'locationBasedReminderProcessingTopic',
                    locationBasedReminderProcessingTopicDLQName: 'locationBasedReminderProcessingTopicDLQ',
                    locationBasedReminderProcessingQueueName: 'locationBasedReminderProcessingQueue',
                    locationBasedReminderProcessingDLQName: 'locationBasedReminderProcessingDLQ',
                    locationBasedReminderProcessingEventSourceMapping: 'locationBasedReminderProcessingEventSourceMapping'
                }
            },
            transactionsConfig: {
                transactionsFunctionName: 'transactionsLambdaFunction',
                transactionsTableName: 'transactionsTable',
                transactionsIdGlobalIndex: 'transactionsIdGlobalIndex',
                transactionsStatusLocalIndex: 'transactionsStatusLocalIndex',
                transactionStatusGlobalIndex: 'transactionStatusGlobalIndex',
                createTransactionResolverName: 'createTransaction',
                getTransactionResolverName: 'getTransaction',
                getTransactionByStatusResolverName: 'getTransactionByStatus',
                getAllUsersEligibleForReimbursementsResolverName: 'getAllUsersEligibleForReimbursements',
                getAllUsersIneligibleForReimbursementsResolverName: 'getAllUsersIneligibleForReimbursements',
                updateTransactionResolverName: 'updateTransaction'
            },
            notificationsConfig: {
                notificationsFunctionName: 'notificationsLambdaFunction',
                notificationsTableName: 'notificationsTable',
                createNotificationResolverName: 'createNotification',
                getNotificationByTypeResolverName: 'getNotificationByType',
                notificationsChannelTypeLocalIndex: 'notificationsChannelTypeLocalIndex',
                notificationsTypeLocalIndex: 'notificationsTypeLocalIndex',
                notificationsStatusLocalIndex: 'notificationsStatusLocalIndex',
                notificationsTypeAndTimeGlobalIndex: 'notificationsTypeAndTimeGlobalIndex'
            },
            physicalDevicesConfig: {
                devicesFunctionName: 'devicesLambdaFunction',
                createDeviceResolverName: 'createDevice',
                updateDeviceResolverName: 'updateDevice',
                getDevicesForUserResolverName: 'getDevicesForUser',
                getDeviceByTokenResolverName: 'getDeviceByToken',
                getDeviceResolverName: 'getDevice',
                devicesTableName: 'physicalDevicesTable',
                devicesIdGlobalIndex: 'devicesIdGlobalIndex',
                deviceTokenIdGlobalIndex: 'deviceTokenIdGlobalIndex'
            },
            offersConfig: {
                offersFunctionName: 'offersLambdaFunction',
                getOffersResolverName: 'getOffers',
                getFidelisPartnersResolverName: 'getFidelisPartners',
                getPremierOffersResolverName: 'getPremierOffers',
                getSeasonalOffersResolverName: 'getSeasonalOffers',
                searchOffersResolverName: 'searchOffers'
            },
            faqConfig: {
                faqFunctionName: 'faqLambdaFunction',
                faqTableName: 'faqsTable',
                createFAQResolverName: 'createFAQ',
                getFAQsResolverName: 'getFAQs'
            },
            sesConfig: {
                emailAddress: `noreply-${Stages.DEV}@moonbeam.vet`
            },
            militaryVerificationProducerConsumerConfig: {
                militaryVerificationNotificationProducerFunctionName: 'militaryVerificationNotificationProducerFunction',
                militaryVerificationNotificationConsumerFunctionName: 'militaryVerificationNotificationConsumerFunction',
                militaryVerificationNotificationFanOutConfig: {
                    militaryVerificationNotificationProcessingTopicName: 'militaryVerificationNotificationProcessingTopic',
                    militaryVerificationNotificationProcessingQueueName: 'militaryVerificationNotificationProcessingQueue',
                    militaryVerificationNotificationProcessingDLQName: 'militaryVerificationNotificationProcessingQueueDLQ',
                    militaryVerificationNotificationProcessingTopicDLQName: 'militaryVerificationNotificationProcessingTopicDLQ',
                    militaryVerificationNotificationProcessingEventSourceMapping: 'militaryVerificationNotificationProcessingEventSourceMapping'
                }
            },
            militaryVerificationReportingProducerConsumerConfig: {
                militaryVerificationReportingProducerFunctionName: 'militaryVerificationReportingProducerFunction',
                militaryVerificationReportingConsumerFunctionName: 'militaryVerificationReportingConsumerFunction',
                militaryVerificationReportingCronRuleName: 'militaryVerificationReportingCronRule',
                militaryVerificationReportingFanOutConfig: {
                    militaryVerificationReportingProcessingTopicName: 'militaryVerificationReportingProcessingTopic',
                    militaryVerificationReportingProcessingQueueName: 'militaryVerificationReportingProcessingQueue',
                    militaryVerificationReportingProcessingDLQName: 'militaryVerificationReportingProcessingQueueDLQ',
                    militaryVerificationReportingProcessingTopicDLQName: 'militaryVerificationReportingProcessingTopicDLQ',
                    militaryVerificationReportingProcessingEventSourceMapping: 'militaryVerificationReportingProcessingEventSourceMapping'
                }
            },
            userAuthSessionConfig: {
                userAuthSessionFunctionName: 'userAuthSessionFunction',
                userAuthSessionTableName: 'userAuthSessionTable',
                createUserAuthSessionResolverName: 'createUserAuthSession',
                updateUserAuthSessionResolverName: 'updateUserAuthSession',
                getUserAuthSessionResolverName: 'getUserAuthSession'
            },
            notificationReminderConfig: {
                notificationReminderFunctionName: 'notificationReminderFunction',
                notificationReminderTableName: 'notificationReminderTable',
                createNotificationReminderResolverName: 'createNotificationReminder',
                getNotificationRemindersResolverName: 'getNotificationReminders',
                updateNotificationReminderResolverName: 'updateNotificationReminder',
                getAllUsersForNotificationRemindersResolverName: 'getAllUsersForNotificationReminders',
                getUsersByGeographyForNotificationRemindersResolverName: 'getUsersByGeographyForNotificationReminders'
            },
            appUpgradeConfig: {
                appUpgradeFunctionName: 'appUpgradeFunction',
                getAppUpgradeCredentialsResolverName: 'getAppUpgradeCredentials'
            },
            referralConfig: {
                referralFunctionName: 'referralFunction',
                referralTableName: 'referralTable',
                referralStatusGlobalIndex: 'referralStatusGlobalIndex',
                getReferralsByStatusResolverName: 'getReferralsByStatus',
                getUserFromReferralResolverName: 'getUserFromReferral',
                createReferralResolverName: 'createReferral',
                updateReferralResolverName: 'updateReferral'
            },
            loggingConfig: {
                loggingFunctionName: 'loggingFunction',
                createLogEventResolverName: 'createLogEvent',
                frontEndLogGroupName: 'moonbeam-frontend'
            },
            appReviewConfig: {
                appReviewFunctionName: 'appReviewFunction',
                appReviewTableName: 'appReviewTable',
                createAppReviewResolverName: 'createAppReview',
                getAppReviewEligibilityResolverName: 'getAppReviewEligibility'
            },
            utilitiesConfig: {
                utilitiesFunctionName: 'utilitiesFunction',
                geoCodeAsyncResolverName: 'geoCodeAsync',
                getLocationPredictionsResolverName: 'getLocationPredictions'
            },
            reimbursementsConfig: {
                reimbursementsFunctionName: "reimbursementsFunction",
                createReimbursementResolverName: "createReimbursement",
                getReimbursementsResolverName: "getReimbursements",
                reimbursementsTableName: "reimbursementsTable",
                reimbursementsIdGlobalIndex: "reimbursementsIdGlobalIndex",
                reimbursementsStatusLocalIndex: "reimbursementsStatusLocalIndex"
            },
            servicePartnersConfig: {
                servicePartnersFunctionName: "servicePartnersFunction",
                servicePartnersTableName: "servicePartnersTable",
                servicesPartnersCreateTimeGlobalIndex: "servicesPartnersCreateTimeGlobalIndex",
                createServicePartnerResolverName: "createServicePartner",
                getServicePartnersResolverName: "getServicePartners"
            },
            eventsConfig: {
                eventsFunctionName: "eventsFunction",
                eventSeriesTableName: "eventsSeriesTable",
                eventSeriesCreateTimeGlobalIndex: "eventSeriesCreateTimeGlobalIndex",
                createEventSeriesResolverName: "createEventSeries",
                getEventSeriesResolverName: "getEventSeries"
            },
            scriptsConfig: {
                scriptsFunctionName: "scriptsFunction",
                cardExpirationBackFillCronRuleName: "cardExpirationBackFillRule",
                offerBackFillCronRuleName: "offerBackFillRule"
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
                militaryVerificationReportingBucketName: Constants.StorageConstants.MOONBEAM_MILITARY_VERIFICATION_REPORTING_BUCKET_NAME,

                mainFilesBucketName: Constants.StorageConstants.MOONBEAM_MAIN_FILES_BUCKET_NAME,
                mainFilesCloudFrontDistributionName: `cloudfront-distribution-${Constants.StorageConstants.MOONBEAM_MAIN_FILES_BUCKET_NAME}`,
                mainFilesCloudFrontTrustedPublicKeyName: `cloudfront-public-key-${Constants.StorageConstants.MOONBEAM_MAIN_FILES_BUCKET_NAME}`,
                mainFilesCloudFrontTrustedKeyGroupName: `cloudfront-key-group-${Constants.StorageConstants.MOONBEAM_MAIN_FILES_BUCKET_NAME}`,
                mainFilesCloudFrontAccessIdentityName: `cloudfront-access-identity-${Constants.StorageConstants.MOONBEAM_MAIN_FILES_BUCKET_NAME}`,
                mainFilesCloudFrontCachePolicyName: `cloudfront-cache-policy-${Constants.StorageConstants.MOONBEAM_MAIN_FILES_BUCKET_NAME}`,

                logoFilesBucketName: Constants.StorageConstants.MOONBEAM_LOGO_FILES_BUCKET_NAME,
                logoFilesCloudFrontDistributionName: `cloudfront-distribution-${Constants.StorageConstants.MOONBEAM_LOGO_FILES_BUCKET_NAME}`,
                logoFilesCloudFrontTrustedPublicKeyName: `cloudfront-public-key-${Constants.StorageConstants.MOONBEAM_LOGO_FILES_BUCKET_NAME}`,
                logoFilesCloudFrontTrustedKeyGroupName: `cloudfront-key-group-${Constants.StorageConstants.MOONBEAM_LOGO_FILES_BUCKET_NAME}`,
                logoFilesCloudFrontAccessIdentityName: `cloudfront-access-identity-${Constants.StorageConstants.MOONBEAM_LOGO_FILES_BUCKET_NAME}`,
                logoFilesCloudFrontCachePolicyName: `cloudfront-cache-policy-${Constants.StorageConstants.MOONBEAM_LOGO_FILES_BUCKET_NAME}`,

                storageFunctionName: 'storageLambdaFunction',
                getResolverName: 'getStorage',
                putMilitaryVerificationReportResolverName: 'putMilitaryVerificationReport',
                getFilesForUserResolverName: 'getFilesForUser'
            },
            militaryVerificationConfig: {
                militaryVerificationFunctionName: 'militaryVerificationLambdaFunction',
                militaryVerificationTableName: 'militaryVerificationTable',
                getMilitaryVerificationStatusResolverName: 'getMilitaryVerificationStatus',
                updateMilitaryVerificationStatusResolverName: 'updateMilitaryVerificationStatus',
                createMilitaryVerificationResolverName: 'createMilitaryVerification',
                getMilitaryVerificationInformationResolverName: 'getMilitaryVerificationInformation',
                militaryVerificationStatusGlobalIndex: 'militaryVerificationStatusGlobalIndex'
            },
            cardLinkingConfig: {
                cardLinkingFunctionName: 'cardLinkingLambdaFunction',
                cardLinkingTableName: 'cardLinkingTable',
                cardLinkingStatusGlobalIndex: 'cardLinkingStatusGlobalIndex',
                getCardLinkResolverName: 'getCardLink',
                createCardLinkResolverName: 'createCardLink',
                deleteCardResolverName: 'deleteCard',
                addCardResolverName: 'addCard',
                getEligibleLinkedUsersResolverName: 'getEligibleLinkedUsers',
                getUsersWithNoCardsResolverName: 'getUsersWithNoCards',
                getUserCardLinkingIdResolverName: 'getUserCardLinkingId',
                updateCardResolverName: 'updateCard'
            },
            apiGatewayServiceConfig: {
                cardLinkingServiceAPIName: 'cardLinkingServiceAPI',
                apiDeploymentGroupName: 'cardLinkingAPILogGroup',
                oliveSharedAPIKeyName: 'cardLinkingOliveSharedAPIKey',
                oliveUsagePlan: `cardLinkingOliveUsagePlan`,
                internallySharedAPIKeyName: `internallySharedAPIKey`,
                internalUsagePlan: `internalUsagePlan`,
                transactionsAcknowledgmentMethodName: `transactionsAcknowledgment`,
                updatedTransactionsAcknowledgmentMethodName: `updatedTransactionsAcknowledgment`,
                militaryVerificationUpdatesAcknowledgmentMethodName: `militaryVerificationUpdatesAcknowledgment`
            },
            referralProducerConsumerConfig: {
                referralProducerFunctionName: 'referralProducerFunction',
                referralConsumerFunctionName: 'referralConsumerFunction',
                referralProducerCronRuleName: 'referralProducerCronRule',
                referralFanOutConfig: {
                    referralProcessingTopicName: 'referralProcessingTopic',
                    referralProcessingQueueName: 'referralProcessingQueue',
                    referralProcessingDLQName: 'referralProcessingDLQ',
                    referralProcessingTopicDLQName: 'referralProcessingTopicDLQ',
                    referralProcessingEventSourceMapping: 'referralProcessingEventSourceMapping',
                }
            },
            transactionsProducerConsumerConfig: {
                transactionsProducerFunctionName: 'transactionsProducerLambdaFunction',
                transactionalOffersNotificationsConsumerFunctionName: 'transactionalOffersNotificationsConsumerFunction',
                transactionalOffersConsumerFunctionName: 'transactionalOffersConsumerLambdaFunction',
                transactionsFanOutConfig: {
                    transactionsProcessingTopicName: 'transactionsProcessingTopic',
                    notificationsTransactionalOffersProcessingQueueName: 'notificationsTransactionalOffersProcessingQueue',
                    notificationsTransactionalOffersProcessingDLQName: 'notificationsTransactionalOffersProcessingDLQ',
                    transactionalOffersProcessingQueueName: 'transactionalOffersProcessingQueue',
                    transactionalOffersProcessingDLQName: 'transactionalOffersProcessingDLQ',
                    notificationTransactionsProcessingTopicDLQName: 'notificationTransactionsProcessingTopicDLQ',
                    transactionsProcessingTopicDLQName: 'transactionsProcessingTopicDLQ',
                    transactionalOffersProcessingEventSourceMapping: 'transactionalOffersProcessingEventSourceMapping',
                    notificationsTransactionalOffersProcessingEventSourceMapping: 'notificationsTransactionalOffersProcessingEventSourceMapping'
                }
            },
            updatedTransactionsProducerConsumerConfig: {
                updatedTransactionsProducerFunctionName: 'updatedTransactionsProducerLambdaFunction',
                updatedTransactionsConsumerFunctionName: 'updatedTransactionsConsumerLambdaFunction',
                updatedTransactionsFanOutConfig: {
                    updatedTransactionalOffersProcessingTopicName: 'updatedTransactionalOffersProcessingTopic',
                    updatedTransactionalOffersProcessingTopicDLQName: 'updatedTransactionalOffersProcessingTopicDLQ',
                    updatedTransactionalOffersProcessingQueueName: 'updatedTransactionalOffersProcessingQueue',
                    updatedTransactionalOffersProcessingDLQName: 'updateTransactionalOffersProcessingDLQ',
                    updatedTransactionalOffersProcessingEventSourceMapping: 'updateTransactionalOffersProcessingEventSourceMapping'
                }
            },
            locationBasedReminderProducerConsumerConfig: {
                locationBasedReminderProducerFunctionName: 'locationBasedReminderProducerFunction',
                locationBasedReminderConsumerFunctionName: 'locationBasedReminderConsumerFunction',
                acknowledgeLocationUpdateResolverName: 'acknowledgeLocationUpdate',
                locationBasedReminderFanOutConfig: {
                    locationBasedReminderProcessingTopicName: 'locationBasedReminderProcessingTopic',
                    locationBasedReminderProcessingTopicDLQName: 'locationBasedReminderProcessingTopicDLQ',
                    locationBasedReminderProcessingQueueName: 'locationBasedReminderProcessingQueue',
                    locationBasedReminderProcessingDLQName: 'locationBasedReminderProcessingDLQ',
                    locationBasedReminderProcessingEventSourceMapping: 'locationBasedReminderProcessingEventSourceMapping'
                }
            },
            notificationReminderProducerConsumerConfig: {
                notificationReminderProducerFunctionName: 'notificationReminderProducerLambdaFunction',
                notificationReminderConsumerFunctionName: 'notificationReminderConsumerLambdaFunction',
                notificationReminderCronRuleName: 'notificationReminderCronRule',
                notificationReminderFanOutConfig: {
                    notificationReminderProcessingTopicName: 'notificationReminderProcessingTopic',
                    notificationReminderProcessingQueueName: 'notificationReminderProcessingQueue',
                    notificationReminderProcessingDLQName: 'notificationReminderProcessingDLQ',
                    notificationReminderProcessingTopicDLQName: 'notificationReminderProcessingTopicDLQ',
                    notificationReminderProcessingEventSourceMapping: 'notificationReminderProcessingEventSourceMapping'
                }
            },
            transactionsConfig: {
                transactionsFunctionName: 'transactionsLambdaFunction',
                transactionsTableName: 'transactionsTable',
                transactionsIdGlobalIndex: 'transactionsIdGlobalIndex',
                transactionsStatusLocalIndex: 'transactionsStatusLocalIndex',
                transactionStatusGlobalIndex: 'transactionStatusGlobalIndex',
                createTransactionResolverName: 'createTransaction',
                getTransactionResolverName: 'getTransaction',
                getTransactionByStatusResolverName: 'getTransactionByStatus',
                getAllUsersEligibleForReimbursementsResolverName: 'getAllUsersEligibleForReimbursements',
                getAllUsersIneligibleForReimbursementsResolverName: 'getAllUsersIneligibleForReimbursements',
                updateTransactionResolverName: 'updateTransaction'
            },
            notificationsConfig: {
                notificationsFunctionName: 'notificationsLambdaFunction',
                notificationsTableName: 'notificationsTable',
                createNotificationResolverName: 'createNotification',
                getNotificationByTypeResolverName: 'getNotificationByType',
                notificationsChannelTypeLocalIndex: 'notificationsChannelTypeLocalIndex',
                notificationsTypeLocalIndex: 'notificationsTypeLocalIndex',
                notificationsStatusLocalIndex: 'notificationsStatusLocalIndex',
                notificationsTypeAndTimeGlobalIndex: 'notificationsTypeAndTimeGlobalIndex'
            },
            physicalDevicesConfig: {
                devicesFunctionName: 'devicesLambdaFunction',
                createDeviceResolverName: 'createDevice',
                updateDeviceResolverName: 'updateDevice',
                getDevicesForUserResolverName: 'getDevicesForUser',
                getDeviceByTokenResolverName: 'getDeviceByToken',
                getDeviceResolverName: 'getDevice',
                devicesTableName: 'physicalDevicesTable',
                devicesIdGlobalIndex: 'devicesIdGlobalIndex',
                deviceTokenIdGlobalIndex: 'deviceTokenIdGlobalIndex'
            },
            offersConfig: {
                offersFunctionName: 'offersLambdaFunction',
                getOffersResolverName: 'getOffers',
                getFidelisPartnersResolverName: 'getFidelisPartners',
                getPremierOffersResolverName: 'getPremierOffers',
                getSeasonalOffersResolverName: 'getSeasonalOffers',
                searchOffersResolverName: 'searchOffers'
            },
            faqConfig: {
                faqFunctionName: 'faqLambdaFunction',
                faqTableName: 'faqsTable',
                createFAQResolverName: 'createFAQ',
                getFAQsResolverName: 'getFAQs'
            },
            sesConfig: {
                emailAddress: `noreply@moonbeam.vet`
            },
            militaryVerificationProducerConsumerConfig: {
                militaryVerificationNotificationProducerFunctionName: 'militaryVerificationNotificationProducerFunction',
                militaryVerificationNotificationConsumerFunctionName: 'militaryVerificationNotificationConsumerFunction',
                militaryVerificationNotificationFanOutConfig: {
                    militaryVerificationNotificationProcessingTopicName: 'militaryVerificationNotificationProcessingTopic',
                    militaryVerificationNotificationProcessingQueueName: 'militaryVerificationNotificationProcessingQueue',
                    militaryVerificationNotificationProcessingDLQName: 'militaryVerificationNotificationProcessingQueueDLQ',
                    militaryVerificationNotificationProcessingTopicDLQName: 'militaryVerificationNotificationProcessingTopicDLQ',
                    militaryVerificationNotificationProcessingEventSourceMapping: 'militaryVerificationNotificationProcessingEventSourceMapping'
                }
            },
            militaryVerificationReportingProducerConsumerConfig: {
                militaryVerificationReportingProducerFunctionName: 'militaryVerificationReportingProducerFunction',
                militaryVerificationReportingConsumerFunctionName: 'militaryVerificationReportingConsumerFunction',
                militaryVerificationReportingCronRuleName: 'militaryVerificationReportingCronRule',
                militaryVerificationReportingFanOutConfig: {
                    militaryVerificationReportingProcessingTopicName: 'militaryVerificationReportingProcessingTopic',
                    militaryVerificationReportingProcessingQueueName: 'militaryVerificationReportingProcessingQueue',
                    militaryVerificationReportingProcessingDLQName: 'militaryVerificationReportingProcessingQueueDLQ',
                    militaryVerificationReportingProcessingTopicDLQName: 'militaryVerificationReportingProcessingTopicDLQ',
                    militaryVerificationReportingProcessingEventSourceMapping: 'militaryVerificationReportingProcessingEventSourceMapping'
                }
            },
            userAuthSessionConfig: {
                userAuthSessionFunctionName: 'userAuthSessionFunction',
                userAuthSessionTableName: 'userAuthSessionTable',
                createUserAuthSessionResolverName: 'createUserAuthSession',
                updateUserAuthSessionResolverName: 'updateUserAuthSession',
                getUserAuthSessionResolverName: 'getUserAuthSession'
            },
            notificationReminderConfig: {
                notificationReminderFunctionName: 'notificationReminderFunction',
                notificationReminderTableName: 'notificationReminderTable',
                createNotificationReminderResolverName: 'createNotificationReminder',
                getNotificationRemindersResolverName: 'getNotificationReminders',
                updateNotificationReminderResolverName: 'updateNotificationReminder',
                getAllUsersForNotificationRemindersResolverName: 'getAllUsersForNotificationReminders',
                getUsersByGeographyForNotificationRemindersResolverName: 'getUsersByGeographyForNotificationReminders'
            },
            appUpgradeConfig: {
                appUpgradeFunctionName: 'appUpgradeFunction',
                getAppUpgradeCredentialsResolverName: 'getAppUpgradeCredentials'
            },
            referralConfig: {
                referralFunctionName: 'referralFunction',
                referralTableName: 'referralTable',
                referralStatusGlobalIndex: 'referralStatusGlobalIndex',
                getReferralsByStatusResolverName: 'getReferralsByStatus',
                getUserFromReferralResolverName: 'getUserFromReferral',
                createReferralResolverName: 'createReferral',
                updateReferralResolverName: 'updateReferral'
            },
            loggingConfig: {
                loggingFunctionName: 'loggingFunction',
                createLogEventResolverName: 'createLogEvent',
                frontEndLogGroupName: 'moonbeam-frontend'
            },
            appReviewConfig: {
                appReviewFunctionName: 'appReviewFunction',
                appReviewTableName: 'appReviewTable',
                createAppReviewResolverName: 'createAppReview',
                getAppReviewEligibilityResolverName: 'getAppReviewEligibility'
            },
            utilitiesConfig: {
                utilitiesFunctionName: 'utilitiesFunction',
                geoCodeAsyncResolverName: 'geoCodeAsync',
                getLocationPredictionsResolverName: 'getLocationPredictions'
            },
            reimbursementsConfig: {
                reimbursementsFunctionName: "reimbursementsFunction",
                createReimbursementResolverName: "createReimbursement",
                getReimbursementsResolverName: "getReimbursements",
                reimbursementsTableName: "reimbursementsTable",
                reimbursementsIdGlobalIndex: "reimbursementsIdGlobalIndex",
                reimbursementsStatusLocalIndex: "reimbursementsStatusLocalIndex"
            },
            servicePartnersConfig: {
                servicePartnersFunctionName: "servicePartnersFunction",
                servicePartnersTableName: "servicePartnersTable",
                servicesPartnersCreateTimeGlobalIndex: "servicesPartnersCreateTimeGlobalIndex",
                createServicePartnerResolverName: "createServicePartner",
                getServicePartnersResolverName: "getServicePartners"
            },
            eventsConfig: {
                eventsFunctionName: "eventsFunction",
                eventSeriesTableName: "eventsSeriesTable",
                eventSeriesCreateTimeGlobalIndex: "eventSeriesCreateTimeGlobalIndex",
                createEventSeriesResolverName: "createEventSeries",
                getEventSeriesResolverName: "getEventSeries"
            },
            scriptsConfig: {
                scriptsFunctionName: "scriptsFunction",
                cardExpirationBackFillCronRuleName: "cardExpirationBackFillRule",
                offerBackFillCronRuleName: "offerBackFillRule"
            },
            environmentVariables: new Map<string, string>([])
        },
        // ToDo: add more stages in here
    }
}
