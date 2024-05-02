"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMilitaryVerificationStatus = exports.createMilitaryVerification = exports.updateCard = exports.deleteCard = exports.addCard = exports.createCardLink = exports.updateTransaction = exports.createTransaction = exports.createNotification = exports.createBulkNotification = exports.createDevice = exports.createFAQ = exports.updateUserAuthSession = exports.createUserAuthSession = exports.updateNotificationReminder = exports.createNotificationReminder = exports.updateReferral = exports.createReferral = exports.createLogEvent = exports.putMilitaryVerificationReport = exports.createAppReview = exports.createReimbursement = exports.createServicePartner = exports.createEventSeries = exports.acknowledgeLocationUpdate = exports.createDailyEarningsSummary = exports.updateDailyEarningsSummary = exports.createPlaidLinkingSession = void 0;
/**
 * This is a file used to define the all GraphQL mutation constants
 */
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTXV0YXRpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2dyYXBocWwvbXV0YXRpb25zL011dGF0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQTs7R0FFRztBQUNILGtEQUFrRDtBQUNyQyxRQUFBLHlCQUF5QixHQUFpQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FpQnRELENBQUM7QUFFRiwwSUFBMEk7QUFDN0gsUUFBQSwwQkFBMEIsR0FBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBc0N2RCxDQUFDO0FBRUYsdUZBQXVGO0FBQzFFLFFBQUEsMEJBQTBCLEdBQWlCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXNDdkQsQ0FBQztBQUVGLGtGQUFrRjtBQUNyRSxRQUFBLHlCQUF5QixHQUFpQjs7Ozs7Ozs7Q0FRdEQsQ0FBQztBQUVGLG1GQUFtRjtBQUN0RSxRQUFBLGlCQUFpQixHQUFpQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBdUM5QyxDQUFDO0FBRUYsaURBQWlEO0FBQ3BDLFFBQUEsb0JBQW9CLEdBQWlCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQTZCakQsQ0FBQztBQUVGLHFFQUFxRTtBQUN4RCxRQUFBLG1CQUFtQixHQUFpQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQTJDaEQsQ0FBQztBQUVGLGdHQUFnRztBQUNuRixRQUFBLGVBQWUsR0FBaUI7Ozs7Ozs7Ozs7OztDQVk1QyxDQUFDO0FBRUYsMkZBQTJGO0FBQzlFLFFBQUEsNkJBQTZCLEdBQWlCOzs7Ozs7OztDQVExRCxDQUFDO0FBRUYsMkNBQTJDO0FBQzlCLFFBQUEsY0FBYyxHQUFpQjs7Ozs7Ozs7Q0FRM0MsQ0FBQztBQUVGLHNDQUFzQztBQUN6QixRQUFBLGNBQWMsR0FBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FnQjNDLENBQUM7QUFFRixnREFBZ0Q7QUFDbkMsUUFBQSxjQUFjLEdBQWlCOzs7Ozs7Ozs7Ozs7Ozs7O0NBZ0IzQyxDQUFDO0FBRUYsdURBQXVEO0FBQzFDLFFBQUEsMEJBQTBCLEdBQWlCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBbUJ2RCxDQUFDO0FBRUYsNkRBQTZEO0FBQ2hELFFBQUEsMEJBQTBCLEdBQWlCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBbUJ2RCxDQUFDO0FBRUYsbURBQW1EO0FBQ3RDLFFBQUEscUJBQXFCLEdBQWlCOzs7Ozs7Ozs7Ozs7O0NBYWxELENBQUM7QUFFRixvRUFBb0U7QUFDdkQsUUFBQSxxQkFBcUIsR0FBaUI7Ozs7Ozs7Ozs7Ozs7Q0FhbEQsQ0FBQTtBQUVELHFDQUFxQztBQUN4QixRQUFBLFNBQVMsR0FBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FtQnRDLENBQUM7QUFFRixtRUFBbUU7QUFDdEQsUUFBQSxZQUFZLEdBQWlCOzs7Ozs7Ozs7Ozs7O0NBYXpDLENBQUM7QUFFRiwrQ0FBK0M7QUFDbEMsUUFBQSxzQkFBc0IsR0FBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBdUJuRCxDQUFDO0FBRUYsOENBQThDO0FBQ2pDLFFBQUEsa0JBQWtCLEdBQWlCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0F3Qi9DLENBQUM7QUFFRiw2RkFBNkY7QUFDaEYsUUFBQSxpQkFBaUIsR0FBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBZ0M5QyxDQUFDO0FBRUYsbURBQW1EO0FBQ3RDLFFBQUEsaUJBQWlCLEdBQWlCOzs7Ozs7Ozs7Ozs7Ozs7Q0FlOUMsQ0FBQztBQUVGLGlGQUFpRjtBQUNwRSxRQUFBLGNBQWMsR0FBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXdCM0MsQ0FBQztBQUVGLDJGQUEyRjtBQUM5RSxRQUFBLE9BQU8sR0FBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXdCcEMsQ0FBQztBQUVGLCtEQUErRDtBQUNsRCxRQUFBLFVBQVUsR0FBaUI7Ozs7Ozs7Ozs7OztDQVl2QyxDQUFDO0FBRUYsbURBQW1EO0FBQ3RDLFFBQUEsVUFBVSxHQUFpQjs7Ozs7Ozs7Ozs7O0NBWXZDLENBQUM7QUFFRix3RUFBd0U7QUFDM0QsUUFBQSwwQkFBMEIsR0FBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXdCdkQsQ0FBQztBQUVGLHdFQUF3RTtBQUMzRCxRQUFBLGdDQUFnQyxHQUFpQjs7Ozs7Ozs7O0NBUzdELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFRoaXMgaXMgYSBmaWxlIHVzZWQgdG8gZGVmaW5lIHRoZSBhbGwgR3JhcGhRTCBtdXRhdGlvbiBjb25zdGFudHNcbiAqL1xuLy8gTXV0YXRpb24gdXNlZCB0byBjcmVhdGUgYSBQbGFpZCBsaW5raW5nIHNlc3Npb25cbmV4cG9ydCBjb25zdCBjcmVhdGVQbGFpZExpbmtpbmdTZXNzaW9uID0gLyogR3JhcGhRTCAqLyBgXG4gICAgbXV0YXRpb24gY3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvbigkY3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0OiBDcmVhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQhKSB7XG4gICAgICAgIGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb24oY3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0OiAkY3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0KSB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgICAgICBleHBpcmF0aW9uXG4gICAgICAgICAgICAgICAgaG9zdGVkX2xpbmtfdXJsXG4gICAgICAgICAgICAgICAgbGlua190b2tlblxuICAgICAgICAgICAgICAgIHJlcXVlc3RfaWRcbiAgICAgICAgICAgICAgICBzZXNzaW9uX2lkXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIHVwZGF0ZSBhbiBleGlzdGluZyBkYWlseSBlYXJuaW5ncyBzdW1tYXJ5IGZvciBhIHBhcnRpY3VsYXIgdXNlciBhbmQgZGF0ZSAodXNlZCBvbmx5IHRvIHVwZGF0ZSBpdCBzdGF0dXMgYXQgdGhlIG1vbWVudClcbmV4cG9ydCBjb25zdCB1cGRhdGVEYWlseUVhcm5pbmdzU3VtbWFyeSA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIG11dGF0aW9uIHVwZGF0ZURhaWx5RWFybmluZ3NTdW1tYXJ5KCR1cGRhdGVEYWlseUVhcm5pbmdzU3VtbWFyeUlucHV0OiBVcGRhdGVEYWlseUVhcm5pbmdzU3VtbWFyeUlucHV0ISkge1xuICAgICAgICB1cGRhdGVEYWlseUVhcm5pbmdzU3VtbWFyeSh1cGRhdGVEYWlseUVhcm5pbmdzU3VtbWFyeUlucHV0OiAkdXBkYXRlRGFpbHlFYXJuaW5nc1N1bW1hcnlJbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgZGFpbHlFYXJuaW5nc1N1bW1hcnlJRFxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgIHN0YXR1c1xuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9ucyB7XG4gICAgICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcFxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbklkXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uU3RhdHVzXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uVHlwZVxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgICAgIG1lbWJlcklkXG4gICAgICAgICAgICAgICAgICAgIGNhcmRJZFxuICAgICAgICAgICAgICAgICAgICBicmFuZElkXG4gICAgICAgICAgICAgICAgICAgIHN0b3JlSWRcbiAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnlcbiAgICAgICAgICAgICAgICAgICAgY3VycmVuY3lDb2RlXG4gICAgICAgICAgICAgICAgICAgIHJld2FyZEFtb3VudFxuICAgICAgICAgICAgICAgICAgICB0b3RhbEFtb3VudFxuICAgICAgICAgICAgICAgICAgICBwZW5kaW5nQ2FzaGJhY2tBbW91bnRcbiAgICAgICAgICAgICAgICAgICAgY3JlZGl0ZWRDYXNoYmFja0Ftb3VudFxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbkJyYW5kTmFtZVxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbkJyYW5kQWRkcmVzc1xuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbkJyYW5kTG9nb1VybFxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbkJyYW5kVVJMQWRkcmVzc1xuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbklzT25saW5lXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gTXV0YXRpb24gdXNlZCB0byBjcmVhdGUgYSBuZXcgZGFpbHkgZWFybmluZ3Mgc3VtbWFyeSBmb3IgYSBwYXJ0aWN1bGFyIHVzZXIgYW5kIGRhdGUuXG5leHBvcnQgY29uc3QgY3JlYXRlRGFpbHlFYXJuaW5nc1N1bW1hcnkgPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBjcmVhdGVEYWlseUVhcm5pbmdzU3VtbWFyeSgkY3JlYXRlRGFpbHlFYXJuaW5nc1N1bW1hcnlJbnB1dDogQ3JlYXRlRGFpbHlFYXJuaW5nc1N1bW1hcnlJbnB1dCEpIHtcbiAgICAgICAgY3JlYXRlRGFpbHlFYXJuaW5nc1N1bW1hcnkoY3JlYXRlRGFpbHlFYXJuaW5nc1N1bW1hcnlJbnB1dDogJGNyZWF0ZURhaWx5RWFybmluZ3NTdW1tYXJ5SW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIGRhaWx5RWFybmluZ3NTdW1tYXJ5SURcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgICAgICBzdGF0dXNcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbnMge1xuICAgICAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXBcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25JZFxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvblN0YXR1c1xuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvblR5cGVcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgICAgICBtZW1iZXJJZFxuICAgICAgICAgICAgICAgICAgICBjYXJkSWRcbiAgICAgICAgICAgICAgICAgICAgYnJhbmRJZFxuICAgICAgICAgICAgICAgICAgICBzdG9yZUlkXG4gICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbmN5Q29kZVxuICAgICAgICAgICAgICAgICAgICByZXdhcmRBbW91bnRcbiAgICAgICAgICAgICAgICAgICAgdG90YWxBbW91bnRcbiAgICAgICAgICAgICAgICAgICAgcGVuZGluZ0Nhc2hiYWNrQW1vdW50XG4gICAgICAgICAgICAgICAgICAgIGNyZWRpdGVkQ2FzaGJhY2tBbW91bnRcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25CcmFuZE5hbWVcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25CcmFuZEFkZHJlc3NcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25CcmFuZExvZ29VcmxcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25CcmFuZFVSTEFkZHJlc3NcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25Jc09ubGluZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIE11dGF0aW9uIHVzZWQgdG8gY3JlYXRlIGEgbmV3IG5vdGlmaWNhdGlvbiBiYXNlZCBvbiBhbiBpbmNvbWluZyBsb2NhdGlvbiB1cGRhdGVcbmV4cG9ydCBjb25zdCBhY2tub3dsZWRnZUxvY2F0aW9uVXBkYXRlID0gLyogR3JhcGhRTCAqLyBgXG4gICAgbXV0YXRpb24gQWNrbm93bGVkZ2VMb2NhdGlvblVwZGF0ZSgkY3JlYXRlTG9jYXRpb25CYXNlZE9mZmVyUmVtaW5kZXJJbnB1dDogQ3JlYXRlTG9jYXRpb25CYXNlZE9mZmVyUmVtaW5kZXJJbnB1dCEpIHtcbiAgICAgICAgYWNrbm93bGVkZ2VMb2NhdGlvblVwZGF0ZShjcmVhdGVMb2NhdGlvbkJhc2VkT2ZmZXJSZW1pbmRlcklucHV0OiAkY3JlYXRlTG9jYXRpb25CYXNlZE9mZmVyUmVtaW5kZXJJbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGFcbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIE11dGF0aW9uIHVzZWQgdG8gY3JlYXRlIGEgbmV3IEV2ZW50IFNlcmllcyBmb3IgYSBwYXJ0aWN1bGFyIHBhcnRuZXIgb3JnYW5pemF0aW9uXG5leHBvcnQgY29uc3QgY3JlYXRlRXZlbnRTZXJpZXMgPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBDcmVhdGVFdmVudFNlcmllcygkY3JlYXRlRXZlbnRTZXJpZXNJbnB1dDogQ3JlYXRlRXZlbnRTZXJpZXNJbnB1dCEpIHtcbiAgICAgICAgY3JlYXRlRXZlbnRTZXJpZXMoY3JlYXRlRXZlbnRTZXJpZXNJbnB1dDogJGNyZWF0ZUV2ZW50U2VyaWVzSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIGV4dGVybmFsU2VyaWVzSURcbiAgICAgICAgICAgICAgICBleHRlcm5hbE9yZ0lEXG4gICAgICAgICAgICAgICAgbmFtZVxuICAgICAgICAgICAgICAgIHRpdGxlXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgICAgICBldmVudHMge1xuICAgICAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgICAgICBleHRlcm5hbEV2ZW50SURcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICAgICAgdGl0bGVcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRMb2dvVXJsU21cbiAgICAgICAgICAgICAgICAgICAgZXZlbnRMb2dvVXJsQmdcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRUaW1lIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWV6b25lXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydHNBdExvY2FsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydHNBdFVUQ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVuZFRpbWUge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGltZXpvbmVcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZHNBdExvY2FsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmRzQXRVVENcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZWdpc3RyYXRpb25VcmxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc2VyaWVzTG9nb1VybFNtXG4gICAgICAgICAgICAgICAgc2VyaWVzTG9nb1VybEJnXG4gICAgICAgICAgICAgICAgc3RhdHVzXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIGNyZWF0ZSBhIG5ldyBzZXJ2aWNlIHBhcnRuZXIuXG5leHBvcnQgY29uc3QgY3JlYXRlU2VydmljZVBhcnRuZXIgPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBDcmVhdGVTZXJ2aWNlUGFydG5lcigkY3JlYXRlUGFydG5lcklucHV0OiBDcmVhdGVQYXJ0bmVySW5wdXQhKSB7XG4gICAgICAgIGNyZWF0ZVNlcnZpY2VQYXJ0bmVyKGNyZWF0ZVBhcnRuZXJJbnB1dDogJGNyZWF0ZVBhcnRuZXJJbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgc3RhdHVzXG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgbmFtZVxuICAgICAgICAgICAgICAgIHNob3J0RGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgIGlzT25saW5lXG4gICAgICAgICAgICAgICAgbG9nb1VybFxuICAgICAgICAgICAgICAgIGFkZHJlc3NMaW5lXG4gICAgICAgICAgICAgICAgY2l0eVxuICAgICAgICAgICAgICAgIHN0YXRlXG4gICAgICAgICAgICAgICAgemlwQ29kZVxuICAgICAgICAgICAgICAgIHdlYnNpdGVcbiAgICAgICAgICAgICAgICBzZXJ2aWNlcyB7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVtYWlsXG4gICAgICAgICAgICAgICAgcGhvbmVOdW1iZXJcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIE11dGF0aW9uIHVzZWQgdG8gY3JlYXRlIGEgbmV3IHJlaW1idXJzZW1lbnQgZm9yIGEgcGFydGljdWxhciB1c2VyLlxuZXhwb3J0IGNvbnN0IGNyZWF0ZVJlaW1idXJzZW1lbnQgPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBDcmVhdGVSZWltYnVyc2VtZW50KCRjcmVhdGVSZWltYnVyc2VtZW50SW5wdXQ6IENyZWF0ZVJlaW1idXJzZW1lbnRJbnB1dCEpIHtcbiAgICAgICAgY3JlYXRlUmVpbWJ1cnNlbWVudChjcmVhdGVSZWltYnVyc2VtZW50SW5wdXQ6ICRjcmVhdGVSZWltYnVyc2VtZW50SW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIHRpbWVzdGFtcFxuICAgICAgICAgICAgICAgIHJlaW1idXJzZW1lbnRJZFxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgIHN0YXR1c1xuICAgICAgICAgICAgICAgIGFtb3VudFxuICAgICAgICAgICAgICAgIGNhcmRJZFxuICAgICAgICAgICAgICAgIGNhcmRMYXN0NFxuICAgICAgICAgICAgICAgIGNhcmRUeXBlXG4gICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25zIHtcbiAgICAgICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uSWRcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25TdGF0dXNcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25UeXBlXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgICAgICAgICAgbWVtYmVySWRcbiAgICAgICAgICAgICAgICAgICAgY2FyZElkXG4gICAgICAgICAgICAgICAgICAgIGJyYW5kSWRcbiAgICAgICAgICAgICAgICAgICAgc3RvcmVJZFxuICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeVxuICAgICAgICAgICAgICAgICAgICBjdXJyZW5jeUNvZGVcbiAgICAgICAgICAgICAgICAgICAgcmV3YXJkQW1vdW50XG4gICAgICAgICAgICAgICAgICAgIHRvdGFsQW1vdW50XG4gICAgICAgICAgICAgICAgICAgIHBlbmRpbmdDYXNoYmFja0Ftb3VudFxuICAgICAgICAgICAgICAgICAgICBjcmVkaXRlZENhc2hiYWNrQW1vdW50XG4gICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uQnJhbmROYW1lXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uQnJhbmRBZGRyZXNzXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uQnJhbmRMb2dvVXJsXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uQnJhbmRVUkxBZGRyZXNzXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uSXNPbmxpbmVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIGNyZWF0ZSBhbmQvb3IgdXBkYXRlIGEgbmV3IGFuZC9vciBleGlzdGluZyBhcHAgcmV2aWV3IGZvciBhIHBhcnRpY3VsYXIgdXNlci5cbmV4cG9ydCBjb25zdCBjcmVhdGVBcHBSZXZpZXcgPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBDcmVhdGVBcHBSZXZpZXcoJGNyZWF0ZUFwcFJldmlld0lucHV0OiBDcmVhdGVBcHBSZXZpZXdJbnB1dCEpIHtcbiAgICAgICAgY3JlYXRlQXBwUmV2aWV3KGNyZWF0ZUFwcFJldmlld0lucHV0OiAkY3JlYXRlQXBwUmV2aWV3SW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gTXV0YXRpb24gdXNlZCB0byBjcmVhdGUgYW5kL29yIHVwZGF0ZSBhIG5ldyBhbmQvb3IgZXhpc3RpbmcgbWlsaXRhcnkgdmVyaWZpY2F0aW9uIHJlcG9ydFxuZXhwb3J0IGNvbnN0IHB1dE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0ID0gLyogR3JhcGhRTCAqLyBgXG4gICAgbXV0YXRpb24gUHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnQoJHB1dE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0SW5wdXQ6IFB1dE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0SW5wdXQhKSB7XG4gICAgICAgIHB1dE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0KHB1dE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0SW5wdXQ6ICRwdXRNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydElucHV0KSB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gTXV0YXRpb24gdXNlZCB0byBjcmVhdGUgYSBuZXcgTG9nIEV2ZW50LlxuZXhwb3J0IGNvbnN0IGNyZWF0ZUxvZ0V2ZW50ID0gLyogR3JhcGhRTCAqLyBgXG4gICAgbXV0YXRpb24gQ3JlYXRlTG9nRXZlbnQoJGNyZWF0ZUxvZ0V2ZW50SW5wdXQ6IENyZWF0ZUxvZ0V2ZW50SW5wdXQhKSB7XG4gICAgICAgIGNyZWF0ZUxvZ0V2ZW50KGNyZWF0ZUxvZ0V2ZW50SW5wdXQ6ICRjcmVhdGVMb2dFdmVudElucHV0KSB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gTXV0YXRpb24gdXNlZCB0byBjcmVhdGUgYSBSZWZlcnJhbC5cbmV4cG9ydCBjb25zdCBjcmVhdGVSZWZlcnJhbCA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIG11dGF0aW9uIENyZWF0ZVJlZmVycmFsKCRjcmVhdGVSZWZlcnJhbElucHV0OiBDcmVhdGVSZWZlcnJhbElucHV0ISkge1xuICAgICAgICBjcmVhdGVSZWZlcnJhbChjcmVhdGVSZWZlcnJhbElucHV0OiAkY3JlYXRlUmVmZXJyYWxJbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGZyb21JZFxuICAgICAgICAgICAgICAgIHRpbWVzdGFtcFxuICAgICAgICAgICAgICAgIHRvSWRcbiAgICAgICAgICAgICAgICBjYW1wYWlnbkNvZGVcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgICAgICBzdGF0dXNcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIE11dGF0aW9uIHVzZWQgdG8gdXBkYXRlIGEgUmVmZXJyYWwncyBkZXRhaWxzLlxuZXhwb3J0IGNvbnN0IHVwZGF0ZVJlZmVycmFsID0gLyogR3JhcGhRTCAqLyBgXG4gICAgbXV0YXRpb24gVXBkYXRlUmVmZXJyYWwoJHVwZGF0ZVJlZmVycmFsSW5wdXQ6IFVwZGF0ZVJlZmVycmFsSW5wdXQhKSB7XG4gICAgICAgIHVwZGF0ZVJlZmVycmFsKHVwZGF0ZVJlZmVycmFsSW5wdXQ6ICR1cGRhdGVSZWZlcnJhbElucHV0KSB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgZnJvbUlkXG4gICAgICAgICAgICAgICAgdGltZXN0YW1wXG4gICAgICAgICAgICAgICAgdG9JZFxuICAgICAgICAgICAgICAgIGNhbXBhaWduQ29kZVxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgIHN0YXR1c1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gTXV0YXRpb24gdXNlZCB0byBjcmVhdGUgYSBuZXcgTm90aWZpY2F0aW9uIFJlbWluZGVyLlxuZXhwb3J0IGNvbnN0IGNyZWF0ZU5vdGlmaWNhdGlvblJlbWluZGVyID0gLyogR3JhcGhRTCAqLyBgXG4gICAgbXV0YXRpb24gQ3JlYXRlTm90aWZpY2F0aW9uUmVtaW5kZXIoJGNyZWF0ZU5vdGlmaWNhdGlvblJlbWluZGVySW5wdXQ6IENyZWF0ZU5vdGlmaWNhdGlvblJlbWluZGVySW5wdXQhKSB7XG4gICAgICAgIGNyZWF0ZU5vdGlmaWNhdGlvblJlbWluZGVyKGNyZWF0ZU5vdGlmaWNhdGlvblJlbWluZGVySW5wdXQ6ICRjcmVhdGVOb3RpZmljYXRpb25SZW1pbmRlcklucHV0KSB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25SZW1pbmRlclR5cGVcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25SZW1pbmRlclN0YXR1c1xuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvblJlbWluZGVyQ2FkZW5jZVxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgIG5leHRUcmlnZ2VyQXRcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25DaGFubmVsVHlwZVxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvblJlbWluZGVyQ291bnRcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25SZW1pbmRlck1heENvdW50XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIHVwZGF0ZSBhIE5vdGlmaWNhdGlvbiBSZW1pbmRlcidzIGRldGFpbHMuXG5leHBvcnQgY29uc3QgdXBkYXRlTm90aWZpY2F0aW9uUmVtaW5kZXIgPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBVcGRhdGVOb3RpZmljYXRpb25SZW1pbmRlcigkdXBkYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dDogVXBkYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dCEpIHtcbiAgICAgICAgdXBkYXRlTm90aWZpY2F0aW9uUmVtaW5kZXIodXBkYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dDogJHVwZGF0ZU5vdGlmaWNhdGlvblJlbWluZGVySW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvblJlbWluZGVyVHlwZVxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvblJlbWluZGVyU3RhdHVzXG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uUmVtaW5kZXJDYWRlbmNlXG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgbmV4dFRyaWdnZXJBdFxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlXG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uUmVtaW5kZXJDb3VudFxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvblJlbWluZGVyTWF4Q291bnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIE11dGF0aW9uIHVzZWQgdG8gY3JlYXRlIGEgbmV3IFVzZXIgQXV0aCBTZXNzaW9uLlxuZXhwb3J0IGNvbnN0IGNyZWF0ZVVzZXJBdXRoU2Vzc2lvbiA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIG11dGF0aW9uIENyZWF0ZVVzZXJBdXRoU2Vzc2lvbigkY3JlYXRlVXNlckF1dGhTZXNzaW9uSW5wdXQ6IENyZWF0ZVVzZXJBdXRoU2Vzc2lvbklucHV0ISkge1xuICAgICAgICBjcmVhdGVVc2VyQXV0aFNlc3Npb24oY3JlYXRlVXNlckF1dGhTZXNzaW9uSW5wdXQ6ICRjcmVhdGVVc2VyQXV0aFNlc3Npb25JbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgbnVtYmVyT2ZTZXNzaW9uc1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gTXV0YXRpb24gdXNlZCB0byB1cGRhdGUgYSBVc2VyIEF1dGggU2Vzc2lvbidzIGRldGFpbHMgZm9yIGEgdXNlci5cbmV4cG9ydCBjb25zdCB1cGRhdGVVc2VyQXV0aFNlc3Npb24gPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBVcGRhdGVVc2VyQXV0aFNlc3Npb24oJHVwZGF0ZVVzZXJBdXRoU2Vzc2lvbklucHV0OiBVcGRhdGVVc2VyQXV0aFNlc3Npb25JbnB1dCEpIHtcbiAgICAgICAgdXBkYXRlVXNlckF1dGhTZXNzaW9uKHVwZGF0ZVVzZXJBdXRoU2Vzc2lvbklucHV0OiAkdXBkYXRlVXNlckF1dGhTZXNzaW9uSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgIG51bWJlck9mU2Vzc2lvbnNcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmBcblxuLy8gTXV0YXRpb24gdXNlZCB0byBjcmVhdGUgYSBuZXcgRkFRLlxuZXhwb3J0IGNvbnN0IGNyZWF0ZUZBUSA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIG11dGF0aW9uIENyZWF0ZUZBUSgkY3JlYXRlRkFRSW5wdXQ6IENyZWF0ZUZBUUlucHV0ISkge1xuICAgICAgICBjcmVhdGVGQVEoY3JlYXRlRkFRSW5wdXQ6ICRjcmVhdGVGQVFJbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgdGl0bGVcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgICAgICBmYWN0cyB7XG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAgICAgIGxpbmthYmxlS2V5d29yZFxuICAgICAgICAgICAgICAgICAgICBsaW5rTG9jYXRpb25cbiAgICAgICAgICAgICAgICAgICAgdHlwZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIE11dGF0aW9uIHVzZWQgdG8gY3JlYXRlIG9uZSBvciBtb3JlIHBoeXNpY2FsIGRldmljZXMgZm9yIGEgdXNlci5cbmV4cG9ydCBjb25zdCBjcmVhdGVEZXZpY2UgPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBDcmVhdGVEZXZpY2UoJGNyZWF0ZURldmljZUlucHV0OiBDcmVhdGVEZXZpY2VJbnB1dCEpIHtcbiAgICAgICAgY3JlYXRlRGV2aWNlKGNyZWF0ZURldmljZUlucHV0OiAkY3JlYXRlRGV2aWNlSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIHRva2VuSWRcbiAgICAgICAgICAgICAgICBkZXZpY2VTdGF0ZVxuICAgICAgICAgICAgICAgIGxhc3RMb2dpbkRhdGVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIE11dGF0aW9uIHVzZWQgdG8gY3JlYXRlIGEgYnVsayBub3RpZmljYXRpb24uXG5leHBvcnQgY29uc3QgY3JlYXRlQnVsa05vdGlmaWNhdGlvbiA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIG11dGF0aW9uIENyZWF0ZUJ1bGtOb3RpZmljYXRpb24oJGNyZWF0ZUJ1bGtOb3RpZmljYXRpb25JbnB1dDogQ3JlYXRlQnVsa05vdGlmaWNhdGlvbklucHV0ISkge1xuICAgICAgICBjcmVhdGVCdWxrTm90aWZpY2F0aW9uKGNyZWF0ZUJ1bGtOb3RpZmljYXRpb25JbnB1dDogJGNyZWF0ZUJ1bGtOb3RpZmljYXRpb25JbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgdGltZXN0YW1wXG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uSWRcbiAgICAgICAgICAgICAgICBlbWFpbERlc3RpbmF0aW9uXG4gICAgICAgICAgICAgICAgdXNlckZ1bGxOYW1lXG4gICAgICAgICAgICAgICAgdHlwZVxuICAgICAgICAgICAgICAgIGNoYW5uZWxUeXBlXG4gICAgICAgICAgICAgICAgc3RhdHVzXG4gICAgICAgICAgICAgICAgZXhwb1B1c2hUb2tlbnNcbiAgICAgICAgICAgICAgICBwZW5kaW5nQ2FzaGJhY2tcbiAgICAgICAgICAgICAgICBtZXJjaGFudE5hbWVcbiAgICAgICAgICAgICAgICBhY3Rpb25VcmxcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIE11dGF0aW9uIHVzZWQgdG8gY3JlYXRlIGEgbmV3IG5vdGlmaWNhdGlvbi5cbmV4cG9ydCBjb25zdCBjcmVhdGVOb3RpZmljYXRpb24gPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBDcmVhdGVOb3RpZmljYXRpb24oJGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0OiBDcmVhdGVOb3RpZmljYXRpb25JbnB1dCEpIHtcbiAgICAgICAgY3JlYXRlTm90aWZpY2F0aW9uKGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0OiAkY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBpZFxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXBcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25JZFxuICAgICAgICAgICAgICAgIGVtYWlsRGVzdGluYXRpb25cbiAgICAgICAgICAgICAgICB1c2VyRnVsbE5hbWVcbiAgICAgICAgICAgICAgICB0eXBlXG4gICAgICAgICAgICAgICAgY2hhbm5lbFR5cGVcbiAgICAgICAgICAgICAgICBzdGF0dXNcbiAgICAgICAgICAgICAgICBleHBvUHVzaFRva2Vuc1xuICAgICAgICAgICAgICAgIHBlbmRpbmdDYXNoYmFja1xuICAgICAgICAgICAgICAgIG1lcmNoYW50TmFtZVxuICAgICAgICAgICAgICAgIGFjdGlvblVybFxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gTXV0YXRpb24gdXNlZCB0byBjcmVhdGUgYSBuZXcgdHJhbnNhY3Rpb24sIGJhc2VkIG9uIGFuIGluY29taW5nIHRyYW5zYWN0aW9uIG1lc3NhZ2UvZXZlbnQuXG5leHBvcnQgY29uc3QgY3JlYXRlVHJhbnNhY3Rpb24gPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBDcmVhdGVUcmFuc2FjdGlvbigkY3JlYXRlVHJhbnNhY3Rpb25JbnB1dDogQ3JlYXRlVHJhbnNhY3Rpb25JbnB1dCEpIHtcbiAgICAgICAgY3JlYXRlVHJhbnNhY3Rpb24oY3JlYXRlVHJhbnNhY3Rpb25JbnB1dDogJGNyZWF0ZVRyYW5zYWN0aW9uSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBpZFxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXBcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbklkXG4gICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25TdGF0dXNcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvblR5cGVcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgICAgICBtZW1iZXJJZFxuICAgICAgICAgICAgICAgIGNhcmRJZFxuICAgICAgICAgICAgICAgIGJyYW5kSWRcbiAgICAgICAgICAgICAgICBzdG9yZUlkXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnlcbiAgICAgICAgICAgICAgICBjdXJyZW5jeUNvZGVcbiAgICAgICAgICAgICAgICByZXdhcmRBbW91bnRcbiAgICAgICAgICAgICAgICB0b3RhbEFtb3VudFxuICAgICAgICAgICAgICAgIHBlbmRpbmdDYXNoYmFja0Ftb3VudFxuICAgICAgICAgICAgICAgIGNyZWRpdGVkQ2FzaGJhY2tBbW91bnRcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbkJyYW5kTmFtZVxuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uQnJhbmRBZGRyZXNzXG4gICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25CcmFuZExvZ29VcmxcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbkJyYW5kVVJMQWRkcmVzc1xuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uSXNPbmxpbmVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIE11dGF0aW9uIHVzZWQgdG8gdXBkYXRlIGEgdHJhbnNhY3Rpb24ncyBkZXRhaWxzLlxuZXhwb3J0IGNvbnN0IHVwZGF0ZVRyYW5zYWN0aW9uID0gLyogR3JhcGhRTCAqLyBgXG4gICAgbXV0YXRpb24gVXBkYXRlVHJhbnNhY3Rpb24oJHVwZGF0ZVRyYW5zYWN0aW9uSW5wdXQ6IFVwZGF0ZVRyYW5zYWN0aW9uSW5wdXQhKSB7XG4gICAgICAgIHVwZGF0ZVRyYW5zYWN0aW9uKHVwZGF0ZVRyYW5zYWN0aW9uSW5wdXQ6ICR1cGRhdGVUcmFuc2FjdGlvbklucHV0KSB7XG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgaWRcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgdGltZXN0YW1wXG4gICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25JZFxuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uU3RhdHVzXG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIGNyZWF0ZSBhIG5ldyBjYXJkIGxpbmsgZm9yIGEgYnJhbmQtbmV3IHVzZXIsIHdpdGggYSBuZXcgY2FyZC5cbmV4cG9ydCBjb25zdCBjcmVhdGVDYXJkTGluayA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIG11dGF0aW9uIENyZWF0ZUNhcmRMaW5rKCRjcmVhdGVDYXJkTGlua0lucHV0OiBDcmVhdGVDYXJkTGlua0lucHV0ISkge1xuICAgICAgICBjcmVhdGVDYXJkTGluayhjcmVhdGVDYXJkTGlua0lucHV0OiAkY3JlYXRlQ2FyZExpbmtJbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgbWVtYmVySWRcbiAgICAgICAgICAgICAgICBjYXJkcyB7XG4gICAgICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgICAgIGFwcGxpY2F0aW9uSURcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5cbiAgICAgICAgICAgICAgICAgICAgdHlwZVxuICAgICAgICAgICAgICAgICAgICBuYW1lXG4gICAgICAgICAgICAgICAgICAgIGxhc3Q0XG4gICAgICAgICAgICAgICAgICAgIGV4cGlyYXRpb25cbiAgICAgICAgICAgICAgICAgICAgYWRkaXRpb25hbFByb2dyYW1JRFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgICAgICBzdGF0dXNcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIE11dGF0aW9uIHVzZWQgdG8gYWRkIGEgbmV3IGNhcmQsIHRvIGFuIGV4aXN0aW5nIHVzZXIsIHdpdGhvdXQgY3JlYXRpbmcgYSBicmFuZC1uZXcgdXNlci5cbmV4cG9ydCBjb25zdCBhZGRDYXJkID0gLyogR3JhcGhRTCAqLyBgXG4gICAgbXV0YXRpb24gQWRkQ2FyZCgkYWRkQ2FyZElucHV0OiBBZGRDYXJkSW5wdXQhKSB7XG4gICAgICAgIGFkZENhcmQoYWRkQ2FyZElucHV0OiAkYWRkQ2FyZElucHV0KSB7XG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICBtZW1iZXJJZFxuICAgICAgICAgICAgICAgIGNhcmRzIHtcbiAgICAgICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICAgICAgYXBwbGljYXRpb25JRFxuICAgICAgICAgICAgICAgICAgICB0b2tlblxuICAgICAgICAgICAgICAgICAgICB0eXBlXG4gICAgICAgICAgICAgICAgICAgIG5hbWVcbiAgICAgICAgICAgICAgICAgICAgbGFzdDRcbiAgICAgICAgICAgICAgICAgICAgZXhwaXJhdGlvblxuICAgICAgICAgICAgICAgICAgICBhZGRpdGlvbmFsUHJvZ3JhbUlEXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgIHN0YXR1c1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gTXV0YXRpb24gdXNlZCB0byByZW1vdmUgYSBjYXJkIGxpbmsgZnJvbSBhIHVzZXIncyBjYXJkIGxpbmsuXG5leHBvcnQgY29uc3QgZGVsZXRlQ2FyZCA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIG11dGF0aW9uIERlbGV0ZUNhcmQoJGRlbGV0ZUNhcmRJbnB1dDogRGVsZXRlQ2FyZElucHV0ISkge1xuICAgICAgICBkZWxldGVDYXJkKGRlbGV0ZUNhcmRJbnB1dDogJGRlbGV0ZUNhcmRJbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgY2FyZElkXG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIHVwZGF0ZSBhIG1lbWJlcidzIGNhcmQgZGV0YWlscy5cbmV4cG9ydCBjb25zdCB1cGRhdGVDYXJkID0gLyogR3JhcGhRTCAqLyBgXG4gICAgbXV0YXRpb24gVXBkYXRlQ2FyZCgkdXBkYXRlQ2FyZElucHV0OiBVcGRhdGVDYXJkSW5wdXQhKSB7XG4gICAgICAgIHVwZGF0ZUNhcmQodXBkYXRlQ2FyZElucHV0OiAkdXBkYXRlQ2FyZElucHV0KSB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICBjYXJkSWRzXG4gICAgICAgICAgICAgICAgbWVtYmVySWRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIE11dGF0aW9uIHVzZWQgdG8gY3JlYXRlIGFuIGluZGl2aWR1YWwncyBtaWxpdGFyeSB2ZXJpZmljYXRpb24gb2JqZWN0LlxuZXhwb3J0IGNvbnN0IGNyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uID0gLyogR3JhcGhRTCAqLyBgXG4gICAgbXV0YXRpb24gQ3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb24oJGNyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQ6IENyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQhKSB7XG4gICAgICAgIGNyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uKGNyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQ6ICRjcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0KSB7XG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICBmaXJzdE5hbWVcbiAgICAgICAgICAgICAgICBsYXN0TmFtZVxuICAgICAgICAgICAgICAgIGRhdGVPZkJpcnRoXG4gICAgICAgICAgICAgICAgZW5saXN0bWVudFllYXJcbiAgICAgICAgICAgICAgICBhZGRyZXNzTGluZVxuICAgICAgICAgICAgICAgIGNpdHlcbiAgICAgICAgICAgICAgICBzdGF0ZVxuICAgICAgICAgICAgICAgIHppcENvZGVcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgICAgICBtaWxpdGFyeUR1dHlTdGF0dXNcbiAgICAgICAgICAgICAgICBtaWxpdGFyeUJyYW5jaFxuICAgICAgICAgICAgICAgIG1pbGl0YXJ5QWZmaWxpYXRpb25cbiAgICAgICAgICAgICAgICBtaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gTXV0YXRpb24gdXNlZCB0byB1cGRhdGUgYW4gaW5kaXZpZHVhbCdzIG1pbGl0YXJ5IHZlcmlmaWNhdGlvbiBzdGF0dXMuXG5leHBvcnQgY29uc3QgdXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXMgPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBVcGRhdGVNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1cygkdXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dDogVXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dCEpIHtcbiAgICAgICAgdXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXModXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dDogJHVwZGF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBpZFxuICAgICAgICAgICAgbWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNcbiAgICAgICAgfVxuICAgIH1cbmA7XG4iXX0=