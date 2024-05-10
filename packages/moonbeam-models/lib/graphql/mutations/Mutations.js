"use strict";
/**
 * This is a file used to define the all GraphQL mutation constants
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMilitaryVerificationStatus = exports.createMilitaryVerification = exports.updateCard = exports.deleteCard = exports.addCard = exports.createCardLink = exports.updateTransaction = exports.createTransaction = exports.createNotification = exports.createBulkNotification = exports.createDevice = exports.createFAQ = exports.updateUserAuthSession = exports.createUserAuthSession = exports.updateNotificationReminder = exports.createNotificationReminder = exports.updateReferral = exports.createReferral = exports.createLogEvent = exports.putMilitaryVerificationReport = exports.createAppReview = exports.createReimbursement = exports.createServicePartner = exports.createEventSeries = exports.acknowledgeLocationUpdate = exports.createDailyEarningsSummary = exports.updateDailyEarningsSummary = exports.createPlaidLinkingSession = exports.updatePlaidLinkingSession = exports.createBankingItem = exports.updateBankingItem = void 0;
// Mutation used to update an existing Banking Item's information
exports.updateBankingItem = `
    mutation updateBankingItem($updateBankingItemInput: UpdateBankingItemInput!) {
        updateBankingItem(updateBankingItemInput: $updateBankingItemInput) {
            errorMessage
            errorType
            data {
                id
                timestamp
                createdAt
                updatedAt
                itemId
                institutionId
                name
                accessToken
                publicToken
                linkToken
                status
                accounts {
                    id
                    accountId
                    persistentAccountId
                    accountNumber
                    routingNumber
                    wireRoutingNumber
                    accountMask
                    accountName
                    accountOfficialName
                    type
                    subType
                    createdAt
                    updatedAt
                    status
                }
            }
        }
    }
`;
// Mutation used to create a new Banking Item
exports.createBankingItem = `
    mutation createBankingItem($createBankingItemInput: CreateBankingItemInput!) {
        createBankingItem(createBankingItemInput: $createBankingItemInput) {
            errorMessage
            errorType
            data {
                id
                timestamp
                createdAt
                updatedAt
                itemId
                institutionId
                name
                accessToken
                publicToken
                linkToken
                status
                accounts {
                    id
                    accountId
                    persistentAccountId
                    accountNumber
                    routingNumber
                    wireRoutingNumber
                    accountMask
                    accountName
                    accountOfficialName
                    type
                    subType
                    createdAt
                    updatedAt
                    status
                }
            }
        }
    }
`;
// Mutation used to update an existing Plaid linking session
exports.updatePlaidLinkingSession = `
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
exports.createPlaidLinkingSession = `
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
exports.updateDailyEarningsSummary = `
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
exports.createDailyEarningsSummary = `
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
exports.acknowledgeLocationUpdate = `
    mutation AcknowledgeLocationUpdate($createLocationBasedOfferReminderInput: CreateLocationBasedOfferReminderInput!) {
        acknowledgeLocationUpdate(createLocationBasedOfferReminderInput: $createLocationBasedOfferReminderInput) {
            errorMessage
            errorType
            data
        }
    }
`;
// Mutation used to create a new Event Series for a particular partner organization
exports.createEventSeries = `
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
exports.createServicePartner = `
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
exports.createReimbursement = `
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
exports.createAppReview = `
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
exports.putMilitaryVerificationReport = `
    mutation PutMilitaryVerificationReport($putMilitaryVerificationReportInput: PutMilitaryVerificationReportInput!) {
        putMilitaryVerificationReport(putMilitaryVerificationReportInput: $putMilitaryVerificationReportInput) {
            errorMessage
            errorType
            data
        }
    }
`;
// Mutation used to create a new Log Event.
exports.createLogEvent = `
    mutation CreateLogEvent($createLogEventInput: CreateLogEventInput!) {
        createLogEvent(createLogEventInput: $createLogEventInput) {
            errorMessage
            errorType
            data
        }
    }
`;
// Mutation used to create a Referral.
exports.createReferral = `
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
exports.updateReferral = `
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
exports.createNotificationReminder = `
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
exports.updateNotificationReminder = `
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
exports.createUserAuthSession = `
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
exports.updateUserAuthSession = `
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
`;
// Mutation used to create a new FAQ.
exports.createFAQ = `
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
exports.createDevice = `
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
exports.createBulkNotification = `
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
exports.createNotification = `
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
exports.createTransaction = `
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
exports.updateTransaction = `
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
exports.createCardLink = `
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
exports.addCard = `
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
exports.deleteCard = `
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
exports.updateCard = `
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
exports.createMilitaryVerification = `
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
exports.updateMilitaryVerificationStatus = `
    mutation UpdateMilitaryVerificationStatus($updateMilitaryVerificationInput: UpdateMilitaryVerificationInput!) {
        updateMilitaryVerificationStatus(updateMilitaryVerificationInput: $updateMilitaryVerificationInput) {
            errorType
            errorMessage
            id
            militaryVerificationStatus
        }
    }
`;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTXV0YXRpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2dyYXBocWwvbXV0YXRpb25zL011dGF0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7OztBQUVILGlFQUFpRTtBQUNwRCxRQUFBLGlCQUFpQixHQUFpQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBb0M5QyxDQUFDO0FBRUYsNkNBQTZDO0FBQ2hDLFFBQUEsaUJBQWlCLEdBQWlCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FvQzlDLENBQUM7QUFFRiw0REFBNEQ7QUFDL0MsUUFBQSx5QkFBeUIsR0FBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXFCdEQsQ0FBQztBQUVGLGtEQUFrRDtBQUNyQyxRQUFBLHlCQUF5QixHQUFpQjs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBa0J0RCxDQUFDO0FBRUYsMElBQTBJO0FBQzdILFFBQUEsMEJBQTBCLEdBQWlCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXNDdkQsQ0FBQztBQUVGLHVGQUF1RjtBQUMxRSxRQUFBLDBCQUEwQixHQUFpQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FzQ3ZELENBQUM7QUFFRixrRkFBa0Y7QUFDckUsUUFBQSx5QkFBeUIsR0FBaUI7Ozs7Ozs7O0NBUXRELENBQUM7QUFFRixtRkFBbUY7QUFDdEUsUUFBQSxpQkFBaUIsR0FBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXVDOUMsQ0FBQztBQUVGLGlEQUFpRDtBQUNwQyxRQUFBLG9CQUFvQixHQUFpQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0E2QmpELENBQUM7QUFFRixxRUFBcUU7QUFDeEQsUUFBQSxtQkFBbUIsR0FBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0EyQ2hELENBQUM7QUFFRixnR0FBZ0c7QUFDbkYsUUFBQSxlQUFlLEdBQWlCOzs7Ozs7Ozs7Ozs7Q0FZNUMsQ0FBQztBQUVGLDJGQUEyRjtBQUM5RSxRQUFBLDZCQUE2QixHQUFpQjs7Ozs7Ozs7Q0FRMUQsQ0FBQztBQUVGLDJDQUEyQztBQUM5QixRQUFBLGNBQWMsR0FBaUI7Ozs7Ozs7O0NBUTNDLENBQUM7QUFFRixzQ0FBc0M7QUFDekIsUUFBQSxjQUFjLEdBQWlCOzs7Ozs7Ozs7Ozs7Ozs7O0NBZ0IzQyxDQUFDO0FBRUYsZ0RBQWdEO0FBQ25DLFFBQUEsY0FBYyxHQUFpQjs7Ozs7Ozs7Ozs7Ozs7OztDQWdCM0MsQ0FBQztBQUVGLHVEQUF1RDtBQUMxQyxRQUFBLDBCQUEwQixHQUFpQjs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQW1CdkQsQ0FBQztBQUVGLDZEQUE2RDtBQUNoRCxRQUFBLDBCQUEwQixHQUFpQjs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQW1CdkQsQ0FBQztBQUVGLG1EQUFtRDtBQUN0QyxRQUFBLHFCQUFxQixHQUFpQjs7Ozs7Ozs7Ozs7OztDQWFsRCxDQUFDO0FBRUYsb0VBQW9FO0FBQ3ZELFFBQUEscUJBQXFCLEdBQWlCOzs7Ozs7Ozs7Ozs7O0NBYWxELENBQUE7QUFFRCxxQ0FBcUM7QUFDeEIsUUFBQSxTQUFTLEdBQWlCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBbUJ0QyxDQUFDO0FBRUYsbUVBQW1FO0FBQ3RELFFBQUEsWUFBWSxHQUFpQjs7Ozs7Ozs7Ozs7OztDQWF6QyxDQUFDO0FBRUYsK0NBQStDO0FBQ2xDLFFBQUEsc0JBQXNCLEdBQWlCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXVCbkQsQ0FBQztBQUVGLDhDQUE4QztBQUNqQyxRQUFBLGtCQUFrQixHQUFpQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBd0IvQyxDQUFDO0FBRUYsNkZBQTZGO0FBQ2hGLFFBQUEsaUJBQWlCLEdBQWlCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQWdDOUMsQ0FBQztBQUVGLG1EQUFtRDtBQUN0QyxRQUFBLGlCQUFpQixHQUFpQjs7Ozs7Ozs7Ozs7Ozs7O0NBZTlDLENBQUM7QUFFRixpRkFBaUY7QUFDcEUsUUFBQSxjQUFjLEdBQWlCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0F3QjNDLENBQUM7QUFFRiwyRkFBMkY7QUFDOUUsUUFBQSxPQUFPLEdBQWlCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0F3QnBDLENBQUM7QUFFRiwrREFBK0Q7QUFDbEQsUUFBQSxVQUFVLEdBQWlCOzs7Ozs7Ozs7Ozs7Q0FZdkMsQ0FBQztBQUVGLG1EQUFtRDtBQUN0QyxRQUFBLFVBQVUsR0FBaUI7Ozs7Ozs7Ozs7OztDQVl2QyxDQUFDO0FBRUYsd0VBQXdFO0FBQzNELFFBQUEsMEJBQTBCLEdBQWlCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0F3QnZELENBQUM7QUFFRix3RUFBd0U7QUFDM0QsUUFBQSxnQ0FBZ0MsR0FBaUI7Ozs7Ozs7OztDQVM3RCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBUaGlzIGlzIGEgZmlsZSB1c2VkIHRvIGRlZmluZSB0aGUgYWxsIEdyYXBoUUwgbXV0YXRpb24gY29uc3RhbnRzXG4gKi9cblxuLy8gTXV0YXRpb24gdXNlZCB0byB1cGRhdGUgYW4gZXhpc3RpbmcgQmFua2luZyBJdGVtJ3MgaW5mb3JtYXRpb25cbmV4cG9ydCBjb25zdCB1cGRhdGVCYW5raW5nSXRlbSA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIG11dGF0aW9uIHVwZGF0ZUJhbmtpbmdJdGVtKCR1cGRhdGVCYW5raW5nSXRlbUlucHV0OiBVcGRhdGVCYW5raW5nSXRlbUlucHV0ISkge1xuICAgICAgICB1cGRhdGVCYW5raW5nSXRlbSh1cGRhdGVCYW5raW5nSXRlbUlucHV0OiAkdXBkYXRlQmFua2luZ0l0ZW1JbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgdGltZXN0YW1wXG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgaXRlbUlkXG4gICAgICAgICAgICAgICAgaW5zdGl0dXRpb25JZFxuICAgICAgICAgICAgICAgIG5hbWVcbiAgICAgICAgICAgICAgICBhY2Nlc3NUb2tlblxuICAgICAgICAgICAgICAgIHB1YmxpY1Rva2VuXG4gICAgICAgICAgICAgICAgbGlua1Rva2VuXG4gICAgICAgICAgICAgICAgc3RhdHVzXG4gICAgICAgICAgICAgICAgYWNjb3VudHMge1xuICAgICAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgICAgICBhY2NvdW50SWRcbiAgICAgICAgICAgICAgICAgICAgcGVyc2lzdGVudEFjY291bnRJZFxuICAgICAgICAgICAgICAgICAgICBhY2NvdW50TnVtYmVyXG4gICAgICAgICAgICAgICAgICAgIHJvdXRpbmdOdW1iZXJcbiAgICAgICAgICAgICAgICAgICAgd2lyZVJvdXRpbmdOdW1iZXJcbiAgICAgICAgICAgICAgICAgICAgYWNjb3VudE1hc2tcbiAgICAgICAgICAgICAgICAgICAgYWNjb3VudE5hbWVcbiAgICAgICAgICAgICAgICAgICAgYWNjb3VudE9mZmljaWFsTmFtZVxuICAgICAgICAgICAgICAgICAgICB0eXBlXG4gICAgICAgICAgICAgICAgICAgIHN1YlR5cGVcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgICAgICBzdGF0dXNcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIGNyZWF0ZSBhIG5ldyBCYW5raW5nIEl0ZW1cbmV4cG9ydCBjb25zdCBjcmVhdGVCYW5raW5nSXRlbSA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIG11dGF0aW9uIGNyZWF0ZUJhbmtpbmdJdGVtKCRjcmVhdGVCYW5raW5nSXRlbUlucHV0OiBDcmVhdGVCYW5raW5nSXRlbUlucHV0ISkge1xuICAgICAgICBjcmVhdGVCYW5raW5nSXRlbShjcmVhdGVCYW5raW5nSXRlbUlucHV0OiAkY3JlYXRlQmFua2luZ0l0ZW1JbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgdGltZXN0YW1wXG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgaXRlbUlkXG4gICAgICAgICAgICAgICAgaW5zdGl0dXRpb25JZFxuICAgICAgICAgICAgICAgIG5hbWVcbiAgICAgICAgICAgICAgICBhY2Nlc3NUb2tlblxuICAgICAgICAgICAgICAgIHB1YmxpY1Rva2VuXG4gICAgICAgICAgICAgICAgbGlua1Rva2VuXG4gICAgICAgICAgICAgICAgc3RhdHVzXG4gICAgICAgICAgICAgICAgYWNjb3VudHMge1xuICAgICAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgICAgICBhY2NvdW50SWRcbiAgICAgICAgICAgICAgICAgICAgcGVyc2lzdGVudEFjY291bnRJZFxuICAgICAgICAgICAgICAgICAgICBhY2NvdW50TnVtYmVyXG4gICAgICAgICAgICAgICAgICAgIHJvdXRpbmdOdW1iZXJcbiAgICAgICAgICAgICAgICAgICAgd2lyZVJvdXRpbmdOdW1iZXJcbiAgICAgICAgICAgICAgICAgICAgYWNjb3VudE1hc2tcbiAgICAgICAgICAgICAgICAgICAgYWNjb3VudE5hbWVcbiAgICAgICAgICAgICAgICAgICAgYWNjb3VudE9mZmljaWFsTmFtZVxuICAgICAgICAgICAgICAgICAgICB0eXBlXG4gICAgICAgICAgICAgICAgICAgIHN1YlR5cGVcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgICAgICBzdGF0dXNcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIHVwZGF0ZSBhbiBleGlzdGluZyBQbGFpZCBsaW5raW5nIHNlc3Npb25cbmV4cG9ydCBjb25zdCB1cGRhdGVQbGFpZExpbmtpbmdTZXNzaW9uID0gLyogR3JhcGhRTCAqLyBgXG4gICAgbXV0YXRpb24gdXBkYXRlUGxhaWRMaW5raW5nU2Vzc2lvbigkdXBkYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0OiBVcGRhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQhKSB7XG4gICAgICAgIHVwZGF0ZVBsYWlkTGlua2luZ1Nlc3Npb24odXBkYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0OiAkdXBkYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0KSB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgaWRcbiAgICAgICAgICAgIGxpbmtfdG9rZW5cbiAgICAgICAgICAgIHRpbWVzdGFtcFxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgICAgICBleHBpcmF0aW9uXG4gICAgICAgICAgICAgICAgaG9zdGVkX2xpbmtfdXJsXG4gICAgICAgICAgICAgICAgbGlua190b2tlblxuICAgICAgICAgICAgICAgIHJlcXVlc3RfaWRcbiAgICAgICAgICAgICAgICBzZXNzaW9uX2lkXG4gICAgICAgICAgICAgICAgc3RhdHVzXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIGNyZWF0ZSBhIFBsYWlkIGxpbmtpbmcgc2Vzc2lvblxuZXhwb3J0IGNvbnN0IGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb24gPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBjcmVhdGVQbGFpZExpbmtpbmdTZXNzaW9uKCRjcmVhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQ6IENyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dCEpIHtcbiAgICAgICAgY3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvbihjcmVhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQ6ICRjcmVhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgIGV4cGlyYXRpb25cbiAgICAgICAgICAgICAgICBob3N0ZWRfbGlua191cmxcbiAgICAgICAgICAgICAgICBsaW5rX3Rva2VuXG4gICAgICAgICAgICAgICAgcmVxdWVzdF9pZFxuICAgICAgICAgICAgICAgIHNlc3Npb25faWRcbiAgICAgICAgICAgICAgICBzdGF0dXNcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIE11dGF0aW9uIHVzZWQgdG8gdXBkYXRlIGFuIGV4aXN0aW5nIGRhaWx5IGVhcm5pbmdzIHN1bW1hcnkgZm9yIGEgcGFydGljdWxhciB1c2VyIGFuZCBkYXRlICh1c2VkIG9ubHkgdG8gdXBkYXRlIGl0IHN0YXR1cyBhdCB0aGUgbW9tZW50KVxuZXhwb3J0IGNvbnN0IHVwZGF0ZURhaWx5RWFybmluZ3NTdW1tYXJ5ID0gLyogR3JhcGhRTCAqLyBgXG4gICAgbXV0YXRpb24gdXBkYXRlRGFpbHlFYXJuaW5nc1N1bW1hcnkoJHVwZGF0ZURhaWx5RWFybmluZ3NTdW1tYXJ5SW5wdXQ6IFVwZGF0ZURhaWx5RWFybmluZ3NTdW1tYXJ5SW5wdXQhKSB7XG4gICAgICAgIHVwZGF0ZURhaWx5RWFybmluZ3NTdW1tYXJ5KHVwZGF0ZURhaWx5RWFybmluZ3NTdW1tYXJ5SW5wdXQ6ICR1cGRhdGVEYWlseUVhcm5pbmdzU3VtbWFyeUlucHV0KSB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICBkYWlseUVhcm5pbmdzU3VtbWFyeUlEXG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgc3RhdHVzXG4gICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25zIHtcbiAgICAgICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uSWRcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25TdGF0dXNcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25UeXBlXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgICAgICAgICAgbWVtYmVySWRcbiAgICAgICAgICAgICAgICAgICAgY2FyZElkXG4gICAgICAgICAgICAgICAgICAgIGJyYW5kSWRcbiAgICAgICAgICAgICAgICAgICAgc3RvcmVJZFxuICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeVxuICAgICAgICAgICAgICAgICAgICBjdXJyZW5jeUNvZGVcbiAgICAgICAgICAgICAgICAgICAgcmV3YXJkQW1vdW50XG4gICAgICAgICAgICAgICAgICAgIHRvdGFsQW1vdW50XG4gICAgICAgICAgICAgICAgICAgIHBlbmRpbmdDYXNoYmFja0Ftb3VudFxuICAgICAgICAgICAgICAgICAgICBjcmVkaXRlZENhc2hiYWNrQW1vdW50XG4gICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uQnJhbmROYW1lXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uQnJhbmRBZGRyZXNzXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uQnJhbmRMb2dvVXJsXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uQnJhbmRVUkxBZGRyZXNzXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uSXNPbmxpbmVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIGNyZWF0ZSBhIG5ldyBkYWlseSBlYXJuaW5ncyBzdW1tYXJ5IGZvciBhIHBhcnRpY3VsYXIgdXNlciBhbmQgZGF0ZS5cbmV4cG9ydCBjb25zdCBjcmVhdGVEYWlseUVhcm5pbmdzU3VtbWFyeSA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIG11dGF0aW9uIGNyZWF0ZURhaWx5RWFybmluZ3NTdW1tYXJ5KCRjcmVhdGVEYWlseUVhcm5pbmdzU3VtbWFyeUlucHV0OiBDcmVhdGVEYWlseUVhcm5pbmdzU3VtbWFyeUlucHV0ISkge1xuICAgICAgICBjcmVhdGVEYWlseUVhcm5pbmdzU3VtbWFyeShjcmVhdGVEYWlseUVhcm5pbmdzU3VtbWFyeUlucHV0OiAkY3JlYXRlRGFpbHlFYXJuaW5nc1N1bW1hcnlJbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgZGFpbHlFYXJuaW5nc1N1bW1hcnlJRFxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgIHN0YXR1c1xuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9ucyB7XG4gICAgICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcFxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbklkXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uU3RhdHVzXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uVHlwZVxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgICAgIG1lbWJlcklkXG4gICAgICAgICAgICAgICAgICAgIGNhcmRJZFxuICAgICAgICAgICAgICAgICAgICBicmFuZElkXG4gICAgICAgICAgICAgICAgICAgIHN0b3JlSWRcbiAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnlcbiAgICAgICAgICAgICAgICAgICAgY3VycmVuY3lDb2RlXG4gICAgICAgICAgICAgICAgICAgIHJld2FyZEFtb3VudFxuICAgICAgICAgICAgICAgICAgICB0b3RhbEFtb3VudFxuICAgICAgICAgICAgICAgICAgICBwZW5kaW5nQ2FzaGJhY2tBbW91bnRcbiAgICAgICAgICAgICAgICAgICAgY3JlZGl0ZWRDYXNoYmFja0Ftb3VudFxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbkJyYW5kTmFtZVxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbkJyYW5kQWRkcmVzc1xuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbkJyYW5kTG9nb1VybFxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbkJyYW5kVVJMQWRkcmVzc1xuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbklzT25saW5lXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gTXV0YXRpb24gdXNlZCB0byBjcmVhdGUgYSBuZXcgbm90aWZpY2F0aW9uIGJhc2VkIG9uIGFuIGluY29taW5nIGxvY2F0aW9uIHVwZGF0ZVxuZXhwb3J0IGNvbnN0IGFja25vd2xlZGdlTG9jYXRpb25VcGRhdGUgPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBBY2tub3dsZWRnZUxvY2F0aW9uVXBkYXRlKCRjcmVhdGVMb2NhdGlvbkJhc2VkT2ZmZXJSZW1pbmRlcklucHV0OiBDcmVhdGVMb2NhdGlvbkJhc2VkT2ZmZXJSZW1pbmRlcklucHV0ISkge1xuICAgICAgICBhY2tub3dsZWRnZUxvY2F0aW9uVXBkYXRlKGNyZWF0ZUxvY2F0aW9uQmFzZWRPZmZlclJlbWluZGVySW5wdXQ6ICRjcmVhdGVMb2NhdGlvbkJhc2VkT2ZmZXJSZW1pbmRlcklucHV0KSB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gTXV0YXRpb24gdXNlZCB0byBjcmVhdGUgYSBuZXcgRXZlbnQgU2VyaWVzIGZvciBhIHBhcnRpY3VsYXIgcGFydG5lciBvcmdhbml6YXRpb25cbmV4cG9ydCBjb25zdCBjcmVhdGVFdmVudFNlcmllcyA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIG11dGF0aW9uIENyZWF0ZUV2ZW50U2VyaWVzKCRjcmVhdGVFdmVudFNlcmllc0lucHV0OiBDcmVhdGVFdmVudFNlcmllc0lucHV0ISkge1xuICAgICAgICBjcmVhdGVFdmVudFNlcmllcyhjcmVhdGVFdmVudFNlcmllc0lucHV0OiAkY3JlYXRlRXZlbnRTZXJpZXNJbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgZXh0ZXJuYWxTZXJpZXNJRFxuICAgICAgICAgICAgICAgIGV4dGVybmFsT3JnSURcbiAgICAgICAgICAgICAgICBuYW1lXG4gICAgICAgICAgICAgICAgdGl0bGVcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgIGV2ZW50cyB7XG4gICAgICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgICAgIGV4dGVybmFsRXZlbnRJRFxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgICAgICB0aXRsZVxuICAgICAgICAgICAgICAgICAgICBldmVudExvZ29VcmxTbVxuICAgICAgICAgICAgICAgICAgICBldmVudExvZ29VcmxCZ1xuICAgICAgICAgICAgICAgICAgICBzdGFydFRpbWUge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGltZXpvbmVcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0c0F0TG9jYWxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0c0F0VVRDXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZW5kVGltZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lem9uZVxuICAgICAgICAgICAgICAgICAgICAgICAgZW5kc0F0TG9jYWxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZHNBdFVUQ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJlZ2lzdHJhdGlvblVybFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzZXJpZXNMb2dvVXJsU21cbiAgICAgICAgICAgICAgICBzZXJpZXNMb2dvVXJsQmdcbiAgICAgICAgICAgICAgICBzdGF0dXNcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIE11dGF0aW9uIHVzZWQgdG8gY3JlYXRlIGEgbmV3IHNlcnZpY2UgcGFydG5lci5cbmV4cG9ydCBjb25zdCBjcmVhdGVTZXJ2aWNlUGFydG5lciA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIG11dGF0aW9uIENyZWF0ZVNlcnZpY2VQYXJ0bmVyKCRjcmVhdGVQYXJ0bmVySW5wdXQ6IENyZWF0ZVBhcnRuZXJJbnB1dCEpIHtcbiAgICAgICAgY3JlYXRlU2VydmljZVBhcnRuZXIoY3JlYXRlUGFydG5lcklucHV0OiAkY3JlYXRlUGFydG5lcklucHV0KSB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICBzdGF0dXNcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgICAgICBuYW1lXG4gICAgICAgICAgICAgICAgc2hvcnREZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAgaXNPbmxpbmVcbiAgICAgICAgICAgICAgICBsb2dvVXJsXG4gICAgICAgICAgICAgICAgYWRkcmVzc0xpbmVcbiAgICAgICAgICAgICAgICBjaXR5XG4gICAgICAgICAgICAgICAgc3RhdGVcbiAgICAgICAgICAgICAgICB6aXBDb2RlXG4gICAgICAgICAgICAgICAgd2Vic2l0ZVxuICAgICAgICAgICAgICAgIHNlcnZpY2VzIHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGVcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZW1haWxcbiAgICAgICAgICAgICAgICBwaG9uZU51bWJlclxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gTXV0YXRpb24gdXNlZCB0byBjcmVhdGUgYSBuZXcgcmVpbWJ1cnNlbWVudCBmb3IgYSBwYXJ0aWN1bGFyIHVzZXIuXG5leHBvcnQgY29uc3QgY3JlYXRlUmVpbWJ1cnNlbWVudCA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIG11dGF0aW9uIENyZWF0ZVJlaW1idXJzZW1lbnQoJGNyZWF0ZVJlaW1idXJzZW1lbnRJbnB1dDogQ3JlYXRlUmVpbWJ1cnNlbWVudElucHV0ISkge1xuICAgICAgICBjcmVhdGVSZWltYnVyc2VtZW50KGNyZWF0ZVJlaW1idXJzZW1lbnRJbnB1dDogJGNyZWF0ZVJlaW1idXJzZW1lbnRJbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgdGltZXN0YW1wXG4gICAgICAgICAgICAgICAgcmVpbWJ1cnNlbWVudElkXG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgc3RhdHVzXG4gICAgICAgICAgICAgICAgYW1vdW50XG4gICAgICAgICAgICAgICAgY2FyZElkXG4gICAgICAgICAgICAgICAgY2FyZExhc3Q0XG4gICAgICAgICAgICAgICAgY2FyZFR5cGVcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbnMge1xuICAgICAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXBcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25JZFxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvblN0YXR1c1xuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvblR5cGVcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgICAgICBtZW1iZXJJZFxuICAgICAgICAgICAgICAgICAgICBjYXJkSWRcbiAgICAgICAgICAgICAgICAgICAgYnJhbmRJZFxuICAgICAgICAgICAgICAgICAgICBzdG9yZUlkXG4gICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbmN5Q29kZVxuICAgICAgICAgICAgICAgICAgICByZXdhcmRBbW91bnRcbiAgICAgICAgICAgICAgICAgICAgdG90YWxBbW91bnRcbiAgICAgICAgICAgICAgICAgICAgcGVuZGluZ0Nhc2hiYWNrQW1vdW50XG4gICAgICAgICAgICAgICAgICAgIGNyZWRpdGVkQ2FzaGJhY2tBbW91bnRcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25CcmFuZE5hbWVcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25CcmFuZEFkZHJlc3NcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25CcmFuZExvZ29VcmxcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25CcmFuZFVSTEFkZHJlc3NcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25Jc09ubGluZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIE11dGF0aW9uIHVzZWQgdG8gY3JlYXRlIGFuZC9vciB1cGRhdGUgYSBuZXcgYW5kL29yIGV4aXN0aW5nIGFwcCByZXZpZXcgZm9yIGEgcGFydGljdWxhciB1c2VyLlxuZXhwb3J0IGNvbnN0IGNyZWF0ZUFwcFJldmlldyA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIG11dGF0aW9uIENyZWF0ZUFwcFJldmlldygkY3JlYXRlQXBwUmV2aWV3SW5wdXQ6IENyZWF0ZUFwcFJldmlld0lucHV0ISkge1xuICAgICAgICBjcmVhdGVBcHBSZXZpZXcoY3JlYXRlQXBwUmV2aWV3SW5wdXQ6ICRjcmVhdGVBcHBSZXZpZXdJbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIGNyZWF0ZSBhbmQvb3IgdXBkYXRlIGEgbmV3IGFuZC9vciBleGlzdGluZyBtaWxpdGFyeSB2ZXJpZmljYXRpb24gcmVwb3J0XG5leHBvcnQgY29uc3QgcHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnQgPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBQdXRNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydCgkcHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRJbnB1dDogUHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRJbnB1dCEpIHtcbiAgICAgICAgcHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnQocHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRJbnB1dDogJHB1dE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0SW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhXG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIGNyZWF0ZSBhIG5ldyBMb2cgRXZlbnQuXG5leHBvcnQgY29uc3QgY3JlYXRlTG9nRXZlbnQgPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBDcmVhdGVMb2dFdmVudCgkY3JlYXRlTG9nRXZlbnRJbnB1dDogQ3JlYXRlTG9nRXZlbnRJbnB1dCEpIHtcbiAgICAgICAgY3JlYXRlTG9nRXZlbnQoY3JlYXRlTG9nRXZlbnRJbnB1dDogJGNyZWF0ZUxvZ0V2ZW50SW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhXG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIGNyZWF0ZSBhIFJlZmVycmFsLlxuZXhwb3J0IGNvbnN0IGNyZWF0ZVJlZmVycmFsID0gLyogR3JhcGhRTCAqLyBgXG4gICAgbXV0YXRpb24gQ3JlYXRlUmVmZXJyYWwoJGNyZWF0ZVJlZmVycmFsSW5wdXQ6IENyZWF0ZVJlZmVycmFsSW5wdXQhKSB7XG4gICAgICAgIGNyZWF0ZVJlZmVycmFsKGNyZWF0ZVJlZmVycmFsSW5wdXQ6ICRjcmVhdGVSZWZlcnJhbElucHV0KSB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgZnJvbUlkXG4gICAgICAgICAgICAgICAgdGltZXN0YW1wXG4gICAgICAgICAgICAgICAgdG9JZFxuICAgICAgICAgICAgICAgIGNhbXBhaWduQ29kZVxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgIHN0YXR1c1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gTXV0YXRpb24gdXNlZCB0byB1cGRhdGUgYSBSZWZlcnJhbCdzIGRldGFpbHMuXG5leHBvcnQgY29uc3QgdXBkYXRlUmVmZXJyYWwgPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBVcGRhdGVSZWZlcnJhbCgkdXBkYXRlUmVmZXJyYWxJbnB1dDogVXBkYXRlUmVmZXJyYWxJbnB1dCEpIHtcbiAgICAgICAgdXBkYXRlUmVmZXJyYWwodXBkYXRlUmVmZXJyYWxJbnB1dDogJHVwZGF0ZVJlZmVycmFsSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBmcm9tSWRcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXBcbiAgICAgICAgICAgICAgICB0b0lkXG4gICAgICAgICAgICAgICAgY2FtcGFpZ25Db2RlXG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgc3RhdHVzXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIGNyZWF0ZSBhIG5ldyBOb3RpZmljYXRpb24gUmVtaW5kZXIuXG5leHBvcnQgY29uc3QgY3JlYXRlTm90aWZpY2F0aW9uUmVtaW5kZXIgPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBDcmVhdGVOb3RpZmljYXRpb25SZW1pbmRlcigkY3JlYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dDogQ3JlYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dCEpIHtcbiAgICAgICAgY3JlYXRlTm90aWZpY2F0aW9uUmVtaW5kZXIoY3JlYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dDogJGNyZWF0ZU5vdGlmaWNhdGlvblJlbWluZGVySW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvblJlbWluZGVyVHlwZVxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvblJlbWluZGVyU3RhdHVzXG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uUmVtaW5kZXJDYWRlbmNlXG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgbmV4dFRyaWdnZXJBdFxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlXG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uUmVtaW5kZXJDb3VudFxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvblJlbWluZGVyTWF4Q291bnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIE11dGF0aW9uIHVzZWQgdG8gdXBkYXRlIGEgTm90aWZpY2F0aW9uIFJlbWluZGVyJ3MgZGV0YWlscy5cbmV4cG9ydCBjb25zdCB1cGRhdGVOb3RpZmljYXRpb25SZW1pbmRlciA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIG11dGF0aW9uIFVwZGF0ZU5vdGlmaWNhdGlvblJlbWluZGVyKCR1cGRhdGVOb3RpZmljYXRpb25SZW1pbmRlcklucHV0OiBVcGRhdGVOb3RpZmljYXRpb25SZW1pbmRlcklucHV0ISkge1xuICAgICAgICB1cGRhdGVOb3RpZmljYXRpb25SZW1pbmRlcih1cGRhdGVOb3RpZmljYXRpb25SZW1pbmRlcklucHV0OiAkdXBkYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uUmVtaW5kZXJUeXBlXG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uUmVtaW5kZXJTdGF0dXNcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25SZW1pbmRlckNhZGVuY2VcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgICAgICBuZXh0VHJpZ2dlckF0XG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uQ2hhbm5lbFR5cGVcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25SZW1pbmRlckNvdW50XG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uUmVtaW5kZXJNYXhDb3VudFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gTXV0YXRpb24gdXNlZCB0byBjcmVhdGUgYSBuZXcgVXNlciBBdXRoIFNlc3Npb24uXG5leHBvcnQgY29uc3QgY3JlYXRlVXNlckF1dGhTZXNzaW9uID0gLyogR3JhcGhRTCAqLyBgXG4gICAgbXV0YXRpb24gQ3JlYXRlVXNlckF1dGhTZXNzaW9uKCRjcmVhdGVVc2VyQXV0aFNlc3Npb25JbnB1dDogQ3JlYXRlVXNlckF1dGhTZXNzaW9uSW5wdXQhKSB7XG4gICAgICAgIGNyZWF0ZVVzZXJBdXRoU2Vzc2lvbihjcmVhdGVVc2VyQXV0aFNlc3Npb25JbnB1dDogJGNyZWF0ZVVzZXJBdXRoU2Vzc2lvbklucHV0KSB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgICAgICBudW1iZXJPZlNlc3Npb25zXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIHVwZGF0ZSBhIFVzZXIgQXV0aCBTZXNzaW9uJ3MgZGV0YWlscyBmb3IgYSB1c2VyLlxuZXhwb3J0IGNvbnN0IHVwZGF0ZVVzZXJBdXRoU2Vzc2lvbiA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIG11dGF0aW9uIFVwZGF0ZVVzZXJBdXRoU2Vzc2lvbigkdXBkYXRlVXNlckF1dGhTZXNzaW9uSW5wdXQ6IFVwZGF0ZVVzZXJBdXRoU2Vzc2lvbklucHV0ISkge1xuICAgICAgICB1cGRhdGVVc2VyQXV0aFNlc3Npb24odXBkYXRlVXNlckF1dGhTZXNzaW9uSW5wdXQ6ICR1cGRhdGVVc2VyQXV0aFNlc3Npb25JbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgbnVtYmVyT2ZTZXNzaW9uc1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYFxuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIGNyZWF0ZSBhIG5ldyBGQVEuXG5leHBvcnQgY29uc3QgY3JlYXRlRkFRID0gLyogR3JhcGhRTCAqLyBgXG4gICAgbXV0YXRpb24gQ3JlYXRlRkFRKCRjcmVhdGVGQVFJbnB1dDogQ3JlYXRlRkFRSW5wdXQhKSB7XG4gICAgICAgIGNyZWF0ZUZBUShjcmVhdGVGQVFJbnB1dDogJGNyZWF0ZUZBUUlucHV0KSB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICB0aXRsZVxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgIGZhY3RzIHtcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICAgICAgbGlua2FibGVLZXl3b3JkXG4gICAgICAgICAgICAgICAgICAgIGxpbmtMb2NhdGlvblxuICAgICAgICAgICAgICAgICAgICB0eXBlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gTXV0YXRpb24gdXNlZCB0byBjcmVhdGUgb25lIG9yIG1vcmUgcGh5c2ljYWwgZGV2aWNlcyBmb3IgYSB1c2VyLlxuZXhwb3J0IGNvbnN0IGNyZWF0ZURldmljZSA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIG11dGF0aW9uIENyZWF0ZURldmljZSgkY3JlYXRlRGV2aWNlSW5wdXQ6IENyZWF0ZURldmljZUlucHV0ISkge1xuICAgICAgICBjcmVhdGVEZXZpY2UoY3JlYXRlRGV2aWNlSW5wdXQ6ICRjcmVhdGVEZXZpY2VJbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgdG9rZW5JZFxuICAgICAgICAgICAgICAgIGRldmljZVN0YXRlXG4gICAgICAgICAgICAgICAgbGFzdExvZ2luRGF0ZVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gTXV0YXRpb24gdXNlZCB0byBjcmVhdGUgYSBidWxrIG5vdGlmaWNhdGlvbi5cbmV4cG9ydCBjb25zdCBjcmVhdGVCdWxrTm90aWZpY2F0aW9uID0gLyogR3JhcGhRTCAqLyBgXG4gICAgbXV0YXRpb24gQ3JlYXRlQnVsa05vdGlmaWNhdGlvbigkY3JlYXRlQnVsa05vdGlmaWNhdGlvbklucHV0OiBDcmVhdGVCdWxrTm90aWZpY2F0aW9uSW5wdXQhKSB7XG4gICAgICAgIGNyZWF0ZUJ1bGtOb3RpZmljYXRpb24oY3JlYXRlQnVsa05vdGlmaWNhdGlvbklucHV0OiAkY3JlYXRlQnVsa05vdGlmaWNhdGlvbklucHV0KSB7XG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXBcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25JZFxuICAgICAgICAgICAgICAgIGVtYWlsRGVzdGluYXRpb25cbiAgICAgICAgICAgICAgICB1c2VyRnVsbE5hbWVcbiAgICAgICAgICAgICAgICB0eXBlXG4gICAgICAgICAgICAgICAgY2hhbm5lbFR5cGVcbiAgICAgICAgICAgICAgICBzdGF0dXNcbiAgICAgICAgICAgICAgICBleHBvUHVzaFRva2Vuc1xuICAgICAgICAgICAgICAgIHBlbmRpbmdDYXNoYmFja1xuICAgICAgICAgICAgICAgIG1lcmNoYW50TmFtZVxuICAgICAgICAgICAgICAgIGFjdGlvblVybFxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gTXV0YXRpb24gdXNlZCB0byBjcmVhdGUgYSBuZXcgbm90aWZpY2F0aW9uLlxuZXhwb3J0IGNvbnN0IGNyZWF0ZU5vdGlmaWNhdGlvbiA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIG11dGF0aW9uIENyZWF0ZU5vdGlmaWNhdGlvbigkY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQ6IENyZWF0ZU5vdGlmaWNhdGlvbklucHV0ISkge1xuICAgICAgICBjcmVhdGVOb3RpZmljYXRpb24oY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQ6ICRjcmVhdGVOb3RpZmljYXRpb25JbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGlkXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIHRpbWVzdGFtcFxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbklkXG4gICAgICAgICAgICAgICAgZW1haWxEZXN0aW5hdGlvblxuICAgICAgICAgICAgICAgIHVzZXJGdWxsTmFtZVxuICAgICAgICAgICAgICAgIHR5cGVcbiAgICAgICAgICAgICAgICBjaGFubmVsVHlwZVxuICAgICAgICAgICAgICAgIHN0YXR1c1xuICAgICAgICAgICAgICAgIGV4cG9QdXNoVG9rZW5zXG4gICAgICAgICAgICAgICAgcGVuZGluZ0Nhc2hiYWNrXG4gICAgICAgICAgICAgICAgbWVyY2hhbnROYW1lXG4gICAgICAgICAgICAgICAgYWN0aW9uVXJsXG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIGNyZWF0ZSBhIG5ldyB0cmFuc2FjdGlvbiwgYmFzZWQgb24gYW4gaW5jb21pbmcgdHJhbnNhY3Rpb24gbWVzc2FnZS9ldmVudC5cbmV4cG9ydCBjb25zdCBjcmVhdGVUcmFuc2FjdGlvbiA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIG11dGF0aW9uIENyZWF0ZVRyYW5zYWN0aW9uKCRjcmVhdGVUcmFuc2FjdGlvbklucHV0OiBDcmVhdGVUcmFuc2FjdGlvbklucHV0ISkge1xuICAgICAgICBjcmVhdGVUcmFuc2FjdGlvbihjcmVhdGVUcmFuc2FjdGlvbklucHV0OiAkY3JlYXRlVHJhbnNhY3Rpb25JbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGlkXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIHRpbWVzdGFtcFxuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uSWRcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvblN0YXR1c1xuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uVHlwZVxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgIG1lbWJlcklkXG4gICAgICAgICAgICAgICAgY2FyZElkXG4gICAgICAgICAgICAgICAgYnJhbmRJZFxuICAgICAgICAgICAgICAgIHN0b3JlSWRcbiAgICAgICAgICAgICAgICBjYXRlZ29yeVxuICAgICAgICAgICAgICAgIGN1cnJlbmN5Q29kZVxuICAgICAgICAgICAgICAgIHJld2FyZEFtb3VudFxuICAgICAgICAgICAgICAgIHRvdGFsQW1vdW50XG4gICAgICAgICAgICAgICAgcGVuZGluZ0Nhc2hiYWNrQW1vdW50XG4gICAgICAgICAgICAgICAgY3JlZGl0ZWRDYXNoYmFja0Ftb3VudFxuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uQnJhbmROYW1lXG4gICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25CcmFuZEFkZHJlc3NcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbkJyYW5kTG9nb1VybFxuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uQnJhbmRVUkxBZGRyZXNzXG4gICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25Jc09ubGluZVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gTXV0YXRpb24gdXNlZCB0byB1cGRhdGUgYSB0cmFuc2FjdGlvbidzIGRldGFpbHMuXG5leHBvcnQgY29uc3QgdXBkYXRlVHJhbnNhY3Rpb24gPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBVcGRhdGVUcmFuc2FjdGlvbigkdXBkYXRlVHJhbnNhY3Rpb25JbnB1dDogVXBkYXRlVHJhbnNhY3Rpb25JbnB1dCEpIHtcbiAgICAgICAgdXBkYXRlVHJhbnNhY3Rpb24odXBkYXRlVHJhbnNhY3Rpb25JbnB1dDogJHVwZGF0ZVRyYW5zYWN0aW9uSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBpZFxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXBcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbklkXG4gICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25TdGF0dXNcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIE11dGF0aW9uIHVzZWQgdG8gY3JlYXRlIGEgbmV3IGNhcmQgbGluayBmb3IgYSBicmFuZC1uZXcgdXNlciwgd2l0aCBhIG5ldyBjYXJkLlxuZXhwb3J0IGNvbnN0IGNyZWF0ZUNhcmRMaW5rID0gLyogR3JhcGhRTCAqLyBgXG4gICAgbXV0YXRpb24gQ3JlYXRlQ2FyZExpbmsoJGNyZWF0ZUNhcmRMaW5rSW5wdXQ6IENyZWF0ZUNhcmRMaW5rSW5wdXQhKSB7XG4gICAgICAgIGNyZWF0ZUNhcmRMaW5rKGNyZWF0ZUNhcmRMaW5rSW5wdXQ6ICRjcmVhdGVDYXJkTGlua0lucHV0KSB7XG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICBtZW1iZXJJZFxuICAgICAgICAgICAgICAgIGNhcmRzIHtcbiAgICAgICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICAgICAgYXBwbGljYXRpb25JRFxuICAgICAgICAgICAgICAgICAgICB0b2tlblxuICAgICAgICAgICAgICAgICAgICB0eXBlXG4gICAgICAgICAgICAgICAgICAgIG5hbWVcbiAgICAgICAgICAgICAgICAgICAgbGFzdDRcbiAgICAgICAgICAgICAgICAgICAgZXhwaXJhdGlvblxuICAgICAgICAgICAgICAgICAgICBhZGRpdGlvbmFsUHJvZ3JhbUlEXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgIHN0YXR1c1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gTXV0YXRpb24gdXNlZCB0byBhZGQgYSBuZXcgY2FyZCwgdG8gYW4gZXhpc3RpbmcgdXNlciwgd2l0aG91dCBjcmVhdGluZyBhIGJyYW5kLW5ldyB1c2VyLlxuZXhwb3J0IGNvbnN0IGFkZENhcmQgPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBBZGRDYXJkKCRhZGRDYXJkSW5wdXQ6IEFkZENhcmRJbnB1dCEpIHtcbiAgICAgICAgYWRkQ2FyZChhZGRDYXJkSW5wdXQ6ICRhZGRDYXJkSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIG1lbWJlcklkXG4gICAgICAgICAgICAgICAgY2FyZHMge1xuICAgICAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgICAgICBhcHBsaWNhdGlvbklEXG4gICAgICAgICAgICAgICAgICAgIHRva2VuXG4gICAgICAgICAgICAgICAgICAgIHR5cGVcbiAgICAgICAgICAgICAgICAgICAgbmFtZVxuICAgICAgICAgICAgICAgICAgICBsYXN0NFxuICAgICAgICAgICAgICAgICAgICBleHBpcmF0aW9uXG4gICAgICAgICAgICAgICAgICAgIGFkZGl0aW9uYWxQcm9ncmFtSURcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgc3RhdHVzXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIHJlbW92ZSBhIGNhcmQgbGluayBmcm9tIGEgdXNlcidzIGNhcmQgbGluay5cbmV4cG9ydCBjb25zdCBkZWxldGVDYXJkID0gLyogR3JhcGhRTCAqLyBgXG4gICAgbXV0YXRpb24gRGVsZXRlQ2FyZCgkZGVsZXRlQ2FyZElucHV0OiBEZWxldGVDYXJkSW5wdXQhKSB7XG4gICAgICAgIGRlbGV0ZUNhcmQoZGVsZXRlQ2FyZElucHV0OiAkZGVsZXRlQ2FyZElucHV0KSB7XG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICBjYXJkSWRcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIE11dGF0aW9uIHVzZWQgdG8gdXBkYXRlIGEgbWVtYmVyJ3MgY2FyZCBkZXRhaWxzLlxuZXhwb3J0IGNvbnN0IHVwZGF0ZUNhcmQgPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBVcGRhdGVDYXJkKCR1cGRhdGVDYXJkSW5wdXQ6IFVwZGF0ZUNhcmRJbnB1dCEpIHtcbiAgICAgICAgdXBkYXRlQ2FyZCh1cGRhdGVDYXJkSW5wdXQ6ICR1cGRhdGVDYXJkSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIGNhcmRJZHNcbiAgICAgICAgICAgICAgICBtZW1iZXJJZFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gTXV0YXRpb24gdXNlZCB0byBjcmVhdGUgYW4gaW5kaXZpZHVhbCdzIG1pbGl0YXJ5IHZlcmlmaWNhdGlvbiBvYmplY3QuXG5leHBvcnQgY29uc3QgY3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb24gPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBDcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbigkY3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dDogQ3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dCEpIHtcbiAgICAgICAgY3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb24oY3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dDogJGNyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIGZpcnN0TmFtZVxuICAgICAgICAgICAgICAgIGxhc3ROYW1lXG4gICAgICAgICAgICAgICAgZGF0ZU9mQmlydGhcbiAgICAgICAgICAgICAgICBlbmxpc3RtZW50WWVhclxuICAgICAgICAgICAgICAgIGFkZHJlc3NMaW5lXG4gICAgICAgICAgICAgICAgY2l0eVxuICAgICAgICAgICAgICAgIHN0YXRlXG4gICAgICAgICAgICAgICAgemlwQ29kZVxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgIG1pbGl0YXJ5RHV0eVN0YXR1c1xuICAgICAgICAgICAgICAgIG1pbGl0YXJ5QnJhbmNoXG4gICAgICAgICAgICAgICAgbWlsaXRhcnlBZmZpbGlhdGlvblxuICAgICAgICAgICAgICAgIG1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIHVwZGF0ZSBhbiBpbmRpdmlkdWFsJ3MgbWlsaXRhcnkgdmVyaWZpY2F0aW9uIHN0YXR1cy5cbmV4cG9ydCBjb25zdCB1cGRhdGVNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1cyA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIG11dGF0aW9uIFVwZGF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzKCR1cGRhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0OiBVcGRhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0ISkge1xuICAgICAgICB1cGRhdGVNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1cyh1cGRhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0OiAkdXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGlkXG4gICAgICAgICAgICBtaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1xuICAgICAgICB9XG4gICAgfVxuYDtcbiJdfQ==