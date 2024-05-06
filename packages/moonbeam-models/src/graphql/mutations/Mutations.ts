/**
 * This is a file used to define the all GraphQL mutation constants
 */

// Mutation used to update an existing Plaid linking session
export const updatePlaidLinkingSession = /* GraphQL */ `
    mutation updatePlaidLinkingSession($updatePlaidLinkingSessionInput: UpdatePlaidLinkingSessionInput!) {
        updatePlaidLinkingSession(updatePlaidLinkingSessionInput: $updatePlaidLinkingSessionInput) {
            errorMessage
            errorType
            id
            link_token
            timestamp
            data {
                id
                createdAt
                updatedAt
                expiration
                hosted_link_url
                link_token
                request_id
                session_id
                status
            }
        }
    }
`;

// Mutation used to create a Plaid linking session
export const createPlaidLinkingSession = /* GraphQL */ `
    mutation createPlaidLinkingSession($createPlaidLinkingSessionInput: CreatePlaidLinkingSessionInput!) {
        createPlaidLinkingSession(createPlaidLinkingSessionInput: $createPlaidLinkingSessionInput) {
            errorMessage
            errorType
            data {
                id
                createdAt
                updatedAt
                expiration
                hosted_link_url
                link_token
                request_id
                session_id
                status
            }
        }
    }
`;

// Mutation used to update an existing daily earnings summary for a particular user and date (used only to update it status at the moment)
export const updateDailyEarningsSummary = /* GraphQL */ `
    mutation updateDailyEarningsSummary($updateDailyEarningsSummaryInput: UpdateDailyEarningsSummaryInput!) {
        updateDailyEarningsSummary(updateDailyEarningsSummaryInput: $updateDailyEarningsSummaryInput) {
            errorMessage
            errorType
            data {
                id
                dailyEarningsSummaryID
                createdAt
                updatedAt
                status
                transactions {
                    id
                    timestamp
                    transactionId
                    transactionStatus
                    transactionType
                    createdAt
                    updatedAt
                    memberId
                    cardId
                    brandId
                    storeId
                    category
                    currencyCode
                    rewardAmount
                    totalAmount
                    pendingCashbackAmount
                    creditedCashbackAmount
                    transactionBrandName
                    transactionBrandAddress
                    transactionBrandLogoUrl
                    transactionBrandURLAddress
                    transactionIsOnline
                }
            }
        }
    }
`;

// Mutation used to create a new daily earnings summary for a particular user and date.
export const createDailyEarningsSummary = /* GraphQL */ `
    mutation createDailyEarningsSummary($createDailyEarningsSummaryInput: CreateDailyEarningsSummaryInput!) {
        createDailyEarningsSummary(createDailyEarningsSummaryInput: $createDailyEarningsSummaryInput) {
            errorMessage
            errorType
            data {
                id
                dailyEarningsSummaryID
                createdAt
                updatedAt
                status
                transactions {
                    id
                    timestamp
                    transactionId
                    transactionStatus
                    transactionType
                    createdAt
                    updatedAt
                    memberId
                    cardId
                    brandId
                    storeId
                    category
                    currencyCode
                    rewardAmount
                    totalAmount
                    pendingCashbackAmount
                    creditedCashbackAmount
                    transactionBrandName
                    transactionBrandAddress
                    transactionBrandLogoUrl
                    transactionBrandURLAddress
                    transactionIsOnline
                }
            }
        }
    }
`;

// Mutation used to create a new notification based on an incoming location update
export const acknowledgeLocationUpdate = /* GraphQL */ `
    mutation AcknowledgeLocationUpdate($createLocationBasedOfferReminderInput: CreateLocationBasedOfferReminderInput!) {
        acknowledgeLocationUpdate(createLocationBasedOfferReminderInput: $createLocationBasedOfferReminderInput) {
            errorMessage
            errorType
            data
        }
    }
`;

// Mutation used to create a new Event Series for a particular partner organization
export const createEventSeries = /* GraphQL */ `
    mutation CreateEventSeries($createEventSeriesInput: CreateEventSeriesInput!) {
        createEventSeries(createEventSeriesInput: $createEventSeriesInput) {
            errorMessage
            errorType
            data {
                id
                externalSeriesID
                externalOrgID
                name
                title
                description
                createdAt
                updatedAt
                events {
                    id
                    externalEventID
                    description
                    title
                    eventLogoUrlSm
                    eventLogoUrlBg
                    startTime {
                        timezone
                        startsAtLocal
                        startsAtUTC
                    }
                    endTime {
                        timezone
                        endsAtLocal
                        endsAtUTC
                    }
                    registrationUrl
                }
                seriesLogoUrlSm
                seriesLogoUrlBg
                status
            }
        }
    }
`;

// Mutation used to create a new service partner.
export const createServicePartner = /* GraphQL */ `
    mutation CreateServicePartner($createPartnerInput: CreatePartnerInput!) {
        createServicePartner(createPartnerInput: $createPartnerInput) {
            errorMessage
            errorType
            data {
                id
                status
                createdAt
                updatedAt
                name
                shortDescription
                description
                isOnline
                logoUrl
                addressLine
                city
                state
                zipCode
                website
                services {
                    title
                    description
                }
                email
                phoneNumber
            }
        }
    }
`;

// Mutation used to create a new reimbursement for a particular user.
export const createReimbursement = /* GraphQL */ `
    mutation CreateReimbursement($createReimbursementInput: CreateReimbursementInput!) {
        createReimbursement(createReimbursementInput: $createReimbursementInput) {
            errorMessage
            errorType
            data {
                id
                timestamp
                reimbursementId
                createdAt
                updatedAt
                status
                amount
                cardId
                cardLast4
                cardType
                transactions {
                    id
                    timestamp
                    transactionId
                    transactionStatus
                    transactionType
                    createdAt
                    updatedAt
                    memberId
                    cardId
                    brandId
                    storeId
                    category
                    currencyCode
                    rewardAmount
                    totalAmount
                    pendingCashbackAmount
                    creditedCashbackAmount
                    transactionBrandName
                    transactionBrandAddress
                    transactionBrandLogoUrl
                    transactionBrandURLAddress
                    transactionIsOnline
                }
            }
        }
    }
`;

// Mutation used to create and/or update a new and/or existing app review for a particular user.
export const createAppReview = /* GraphQL */ `
    mutation CreateAppReview($createAppReviewInput: CreateAppReviewInput!) {
        createAppReview(createAppReviewInput: $createAppReviewInput) {
            errorMessage
            errorType
            data {
                id
                createdAt
                updatedAt
            }
        }
    }
`;

// Mutation used to create and/or update a new and/or existing military verification report
export const putMilitaryVerificationReport = /* GraphQL */ `
    mutation PutMilitaryVerificationReport($putMilitaryVerificationReportInput: PutMilitaryVerificationReportInput!) {
        putMilitaryVerificationReport(putMilitaryVerificationReportInput: $putMilitaryVerificationReportInput) {
            errorMessage
            errorType
            data
        }
    }
`;

// Mutation used to create a new Log Event.
export const createLogEvent = /* GraphQL */ `
    mutation CreateLogEvent($createLogEventInput: CreateLogEventInput!) {
        createLogEvent(createLogEventInput: $createLogEventInput) {
            errorMessage
            errorType
            data
        }
    }
`;

// Mutation used to create a Referral.
export const createReferral = /* GraphQL */ `
    mutation CreateReferral($createReferralInput: CreateReferralInput!) {
        createReferral(createReferralInput: $createReferralInput) {
            errorMessage
            errorType
            data {
                fromId
                timestamp
                toId
                campaignCode
                createdAt
                updatedAt
                status
            }
        }
    }
`;

// Mutation used to update a Referral's details.
export const updateReferral = /* GraphQL */ `
    mutation UpdateReferral($updateReferralInput: UpdateReferralInput!) {
        updateReferral(updateReferralInput: $updateReferralInput) {
            errorMessage
            errorType
            data {
                fromId
                timestamp
                toId
                campaignCode
                createdAt
                updatedAt
                status
            }
        }
    }
`;

// Mutation used to create a new Notification Reminder.
export const createNotificationReminder = /* GraphQL */ `
    mutation CreateNotificationReminder($createNotificationReminderInput: CreateNotificationReminderInput!) {
        createNotificationReminder(createNotificationReminderInput: $createNotificationReminderInput) {
            errorMessage
            errorType
            data {
                id
                notificationReminderType
                notificationReminderStatus
                notificationReminderCadence
                createdAt
                updatedAt
                nextTriggerAt
                notificationChannelType
                notificationReminderCount
                notificationReminderMaxCount
            }
        }
    }
`;

// Mutation used to update a Notification Reminder's details.
export const updateNotificationReminder = /* GraphQL */ `
    mutation UpdateNotificationReminder($updateNotificationReminderInput: UpdateNotificationReminderInput!) {
        updateNotificationReminder(updateNotificationReminderInput: $updateNotificationReminderInput) {
            errorMessage
            errorType
            data {
                id
                notificationReminderType
                notificationReminderStatus
                notificationReminderCadence
                createdAt
                updatedAt
                nextTriggerAt
                notificationChannelType
                notificationReminderCount
                notificationReminderMaxCount
            }
        }
    }
`;

// Mutation used to create a new User Auth Session.
export const createUserAuthSession = /* GraphQL */ `
    mutation CreateUserAuthSession($createUserAuthSessionInput: CreateUserAuthSessionInput!) {
        createUserAuthSession(createUserAuthSessionInput: $createUserAuthSessionInput) {
            errorMessage
            errorType
            data {
                id
                createdAt
                updatedAt
                numberOfSessions
            }
        }
    }
`;

// Mutation used to update a User Auth Session's details for a user.
export const updateUserAuthSession = /* GraphQL */ `
    mutation UpdateUserAuthSession($updateUserAuthSessionInput: UpdateUserAuthSessionInput!) {
        updateUserAuthSession(updateUserAuthSessionInput: $updateUserAuthSessionInput) {
            errorMessage
            errorType
            data {
                id
                createdAt
                updatedAt
                numberOfSessions
            }
        }
    }
`

// Mutation used to create a new FAQ.
export const createFAQ = /* GraphQL */ `
    mutation CreateFAQ($createFAQInput: CreateFAQInput!) {
        createFAQ(createFAQInput: $createFAQInput) {
            errorMessage
            errorType
            data {
                id
                title
                createdAt
                updatedAt
                facts {
                    description
                    linkableKeyword
                    linkLocation
                    type
                }
            }
        }
    }
`;

// Mutation used to create one or more physical devices for a user.
export const createDevice = /* GraphQL */ `
    mutation CreateDevice($createDeviceInput: CreateDeviceInput!) {
        createDevice(createDeviceInput: $createDeviceInput) {
            errorType
            errorMessage
            data {
                id
                tokenId
                deviceState
                lastLoginDate
            }
        }
    }
`;

// Mutation used to create a bulk notification.
export const createBulkNotification = /* GraphQL */ `
    mutation CreateBulkNotification($createBulkNotificationInput: CreateBulkNotificationInput!) {
        createBulkNotification(createBulkNotificationInput: $createBulkNotificationInput) {
            errorType
            errorMessage
            data {
                id
                timestamp
                notificationId
                emailDestination
                userFullName
                type
                channelType
                status
                expoPushTokens
                pendingCashback
                merchantName
                actionUrl
                createdAt
                updatedAt
            }
        }
    }
`;

// Mutation used to create a new notification.
export const createNotification = /* GraphQL */ `
    mutation CreateNotification($createNotificationInput: CreateNotificationInput!) {
        createNotification(createNotificationInput: $createNotificationInput) {
            errorType
            errorMessage
            id
            data {
                id
                timestamp
                notificationId
                emailDestination
                userFullName
                type
                channelType
                status
                expoPushTokens
                pendingCashback
                merchantName
                actionUrl
                createdAt
                updatedAt
            }
        }
    }
`;

// Mutation used to create a new transaction, based on an incoming transaction message/event.
export const createTransaction = /* GraphQL */ `
    mutation CreateTransaction($createTransactionInput: CreateTransactionInput!) {
        createTransaction(createTransactionInput: $createTransactionInput) {
            errorType
            errorMessage
            id
            data {
                id
                timestamp
                transactionId
                transactionStatus
                transactionType
                createdAt
                updatedAt
                memberId
                cardId
                brandId
                storeId
                category
                currencyCode
                rewardAmount
                totalAmount
                pendingCashbackAmount
                creditedCashbackAmount
                transactionBrandName
                transactionBrandAddress
                transactionBrandLogoUrl
                transactionBrandURLAddress
                transactionIsOnline
            }
        }
    }
`;

// Mutation used to update a transaction's details.
export const updateTransaction = /* GraphQL */ `
    mutation UpdateTransaction($updateTransactionInput: UpdateTransactionInput!) {
        updateTransaction(updateTransactionInput: $updateTransactionInput) {
            errorType
            errorMessage
            id
            data {
                id
                timestamp
                transactionId
                transactionStatus
                updatedAt
            }
        }
    }
`;

// Mutation used to create a new card link for a brand-new user, with a new card.
export const createCardLink = /* GraphQL */ `
    mutation CreateCardLink($createCardLinkInput: CreateCardLinkInput!) {
        createCardLink(createCardLinkInput: $createCardLinkInput) {
            errorType
            errorMessage
            data {
                id
                memberId
                cards {
                    id
                    applicationID
                    token
                    type
                    name
                    last4
                    expiration
                    additionalProgramID
                }
                createdAt
                updatedAt
                status
            }
        }
    }
`;

// Mutation used to add a new card, to an existing user, without creating a brand-new user.
export const addCard = /* GraphQL */ `
    mutation AddCard($addCardInput: AddCardInput!) {
        addCard(addCardInput: $addCardInput) {
            errorType
            errorMessage
            data {
                id
                memberId
                cards {
                    id
                    applicationID
                    token
                    type
                    name
                    last4
                    expiration
                    additionalProgramID
                }
                createdAt
                updatedAt
                status
            }
        }
    }
`;

// Mutation used to remove a card link from a user's card link.
export const deleteCard = /* GraphQL */ `
    mutation DeleteCard($deleteCardInput: DeleteCardInput!) {
        deleteCard(deleteCardInput: $deleteCardInput) {
            errorType
            errorMessage
            data {
                id
                cardId
                updatedAt
            }
        }
    }
`;

// Mutation used to update a member's card details.
export const updateCard = /* GraphQL */ `
    mutation UpdateCard($updateCardInput: UpdateCardInput!) {
        updateCard(updateCardInput: $updateCardInput) {
            errorMessage
            errorType
            data {
                id
                cardIds
                memberId
            }
        }
    }
`;

// Mutation used to create an individual's military verification object.
export const createMilitaryVerification = /* GraphQL */ `
    mutation CreateMilitaryVerification($createMilitaryVerificationInput: CreateMilitaryVerificationInput!) {
        createMilitaryVerification(createMilitaryVerificationInput: $createMilitaryVerificationInput) {
            errorType
            errorMessage
            data {
                id
                firstName
                lastName
                dateOfBirth
                enlistmentYear
                addressLine
                city
                state
                zipCode
                createdAt
                updatedAt
                militaryDutyStatus
                militaryBranch
                militaryAffiliation
                militaryVerificationStatus
            }
        }
    }
`;

// Mutation used to update an individual's military verification status.
export const updateMilitaryVerificationStatus = /* GraphQL */ `
    mutation UpdateMilitaryVerificationStatus($updateMilitaryVerificationInput: UpdateMilitaryVerificationInput!) {
        updateMilitaryVerificationStatus(updateMilitaryVerificationInput: $updateMilitaryVerificationInput) {
            errorType
            errorMessage
            id
            militaryVerificationStatus
        }
    }
`;
