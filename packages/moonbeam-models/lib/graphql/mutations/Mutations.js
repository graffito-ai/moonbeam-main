"use strict";
/**
 * This is a file used to define the all GraphQL mutation constants
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMilitaryVerificationStatus = exports.createMilitaryVerification = exports.updateCard = exports.deleteCard = exports.addCard = exports.createCardLink = exports.updateTransaction = exports.createTransaction = exports.createNotification = exports.updateDevice = exports.createDevice = exports.createFAQ = exports.updateUserAuthSession = exports.createUserAuthSession = exports.updateNotificationReminder = exports.createNotificationReminder = exports.updateReferral = exports.createReferral = exports.createLogEvent = exports.putMilitaryVerificationReport = exports.createAppReview = exports.createReimbursement = exports.createServicePartner = exports.createEventSeries = exports.acknowledgeLocationUpdate = exports.createDailyEarningsSummary = void 0;
// Query used to create a new daily earnings summary for a particular user and date.
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
// Mutation used to update the physical devices' details, for a user.
exports.updateDevice = `
    mutation UpdateDevice($updateDeviceInput: UpdateDeviceInput!) {
        updateDevice(updateDeviceInput: $updateDeviceInput) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTXV0YXRpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2dyYXBocWwvbXV0YXRpb25zL011dGF0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7OztBQUVILG9GQUFvRjtBQUN2RSxRQUFBLDBCQUEwQixHQUFpQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FzQ3ZELENBQUM7QUFFRixrRkFBa0Y7QUFDckUsUUFBQSx5QkFBeUIsR0FBaUI7Ozs7Ozs7O0NBUXRELENBQUM7QUFFRixtRkFBbUY7QUFDdEUsUUFBQSxpQkFBaUIsR0FBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXVDOUMsQ0FBQztBQUVGLGlEQUFpRDtBQUNwQyxRQUFBLG9CQUFvQixHQUFpQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0E2QmpELENBQUM7QUFFRixxRUFBcUU7QUFDeEQsUUFBQSxtQkFBbUIsR0FBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0EyQ2hELENBQUM7QUFFRixnR0FBZ0c7QUFDbkYsUUFBQSxlQUFlLEdBQWlCOzs7Ozs7Ozs7Ozs7Q0FZNUMsQ0FBQztBQUVGLDJGQUEyRjtBQUM5RSxRQUFBLDZCQUE2QixHQUFpQjs7Ozs7Ozs7Q0FRMUQsQ0FBQztBQUVGLDJDQUEyQztBQUM5QixRQUFBLGNBQWMsR0FBaUI7Ozs7Ozs7O0NBUTNDLENBQUM7QUFFRixzQ0FBc0M7QUFDekIsUUFBQSxjQUFjLEdBQWlCOzs7Ozs7Ozs7Ozs7Ozs7O0NBZ0IzQyxDQUFDO0FBRUYsZ0RBQWdEO0FBQ25DLFFBQUEsY0FBYyxHQUFpQjs7Ozs7Ozs7Ozs7Ozs7OztDQWdCM0MsQ0FBQztBQUVGLHVEQUF1RDtBQUMxQyxRQUFBLDBCQUEwQixHQUFpQjs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQW1CdkQsQ0FBQztBQUVGLDZEQUE2RDtBQUNoRCxRQUFBLDBCQUEwQixHQUFpQjs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQW1CdkQsQ0FBQztBQUVGLG1EQUFtRDtBQUN0QyxRQUFBLHFCQUFxQixHQUFpQjs7Ozs7Ozs7Ozs7OztDQWFsRCxDQUFDO0FBRUYsb0VBQW9FO0FBQ3ZELFFBQUEscUJBQXFCLEdBQWlCOzs7Ozs7Ozs7Ozs7O0NBYWxELENBQUE7QUFFRCxxQ0FBcUM7QUFDeEIsUUFBQSxTQUFTLEdBQWlCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBbUJ0QyxDQUFDO0FBRUYsbUVBQW1FO0FBQ3RELFFBQUEsWUFBWSxHQUFpQjs7Ozs7Ozs7Ozs7OztDQWF6QyxDQUFDO0FBRUYscUVBQXFFO0FBQ3hELFFBQUEsWUFBWSxHQUFpQjs7Ozs7Ozs7Ozs7OztDQWF6QyxDQUFDO0FBRUYsOENBQThDO0FBQ2pDLFFBQUEsa0JBQWtCLEdBQWlCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0F3Qi9DLENBQUM7QUFFRiw2RkFBNkY7QUFDaEYsUUFBQSxpQkFBaUIsR0FBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBZ0M5QyxDQUFDO0FBRUYsbURBQW1EO0FBQ3RDLFFBQUEsaUJBQWlCLEdBQWlCOzs7Ozs7Ozs7Ozs7Ozs7Q0FlOUMsQ0FBQztBQUVGLGlGQUFpRjtBQUNwRSxRQUFBLGNBQWMsR0FBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXdCM0MsQ0FBQztBQUVGLDJGQUEyRjtBQUM5RSxRQUFBLE9BQU8sR0FBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXdCcEMsQ0FBQztBQUVGLCtEQUErRDtBQUNsRCxRQUFBLFVBQVUsR0FBaUI7Ozs7Ozs7Ozs7OztDQVl2QyxDQUFDO0FBRUYsbURBQW1EO0FBQ3RDLFFBQUEsVUFBVSxHQUFpQjs7Ozs7Ozs7Ozs7O0NBWXZDLENBQUM7QUFFRix3RUFBd0U7QUFDM0QsUUFBQSwwQkFBMEIsR0FBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXdCdkQsQ0FBQztBQUVGLHdFQUF3RTtBQUMzRCxRQUFBLGdDQUFnQyxHQUFpQjs7Ozs7Ozs7O0NBUzdELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFRoaXMgaXMgYSBmaWxlIHVzZWQgdG8gZGVmaW5lIHRoZSBhbGwgR3JhcGhRTCBtdXRhdGlvbiBjb25zdGFudHNcbiAqL1xuXG4vLyBRdWVyeSB1c2VkIHRvIGNyZWF0ZSBhIG5ldyBkYWlseSBlYXJuaW5ncyBzdW1tYXJ5IGZvciBhIHBhcnRpY3VsYXIgdXNlciBhbmQgZGF0ZS5cbmV4cG9ydCBjb25zdCBjcmVhdGVEYWlseUVhcm5pbmdzU3VtbWFyeSA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIG11dGF0aW9uIGNyZWF0ZURhaWx5RWFybmluZ3NTdW1tYXJ5KCRjcmVhdGVEYWlseUVhcm5pbmdzU3VtbWFyeUlucHV0OiBDcmVhdGVEYWlseUVhcm5pbmdzU3VtbWFyeUlucHV0ISkge1xuICAgICAgICBjcmVhdGVEYWlseUVhcm5pbmdzU3VtbWFyeShjcmVhdGVEYWlseUVhcm5pbmdzU3VtbWFyeUlucHV0OiAkY3JlYXRlRGFpbHlFYXJuaW5nc1N1bW1hcnlJbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgZGFpbHlFYXJuaW5nc1N1bW1hcnlJRFxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgIHN0YXR1c1xuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9ucyB7XG4gICAgICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcFxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbklkXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uU3RhdHVzXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uVHlwZVxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgICAgIG1lbWJlcklkXG4gICAgICAgICAgICAgICAgICAgIGNhcmRJZFxuICAgICAgICAgICAgICAgICAgICBicmFuZElkXG4gICAgICAgICAgICAgICAgICAgIHN0b3JlSWRcbiAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnlcbiAgICAgICAgICAgICAgICAgICAgY3VycmVuY3lDb2RlXG4gICAgICAgICAgICAgICAgICAgIHJld2FyZEFtb3VudFxuICAgICAgICAgICAgICAgICAgICB0b3RhbEFtb3VudFxuICAgICAgICAgICAgICAgICAgICBwZW5kaW5nQ2FzaGJhY2tBbW91bnRcbiAgICAgICAgICAgICAgICAgICAgY3JlZGl0ZWRDYXNoYmFja0Ftb3VudFxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbkJyYW5kTmFtZVxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbkJyYW5kQWRkcmVzc1xuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbkJyYW5kTG9nb1VybFxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbkJyYW5kVVJMQWRkcmVzc1xuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbklzT25saW5lXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gTXV0YXRpb24gdXNlZCB0byBjcmVhdGUgYSBuZXcgbm90aWZpY2F0aW9uIGJhc2VkIG9uIGFuIGluY29taW5nIGxvY2F0aW9uIHVwZGF0ZVxuZXhwb3J0IGNvbnN0IGFja25vd2xlZGdlTG9jYXRpb25VcGRhdGUgPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBBY2tub3dsZWRnZUxvY2F0aW9uVXBkYXRlKCRjcmVhdGVMb2NhdGlvbkJhc2VkT2ZmZXJSZW1pbmRlcklucHV0OiBDcmVhdGVMb2NhdGlvbkJhc2VkT2ZmZXJSZW1pbmRlcklucHV0ISkge1xuICAgICAgICBhY2tub3dsZWRnZUxvY2F0aW9uVXBkYXRlKGNyZWF0ZUxvY2F0aW9uQmFzZWRPZmZlclJlbWluZGVySW5wdXQ6ICRjcmVhdGVMb2NhdGlvbkJhc2VkT2ZmZXJSZW1pbmRlcklucHV0KSB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gTXV0YXRpb24gdXNlZCB0byBjcmVhdGUgYSBuZXcgRXZlbnQgU2VyaWVzIGZvciBhIHBhcnRpY3VsYXIgcGFydG5lciBvcmdhbml6YXRpb25cbmV4cG9ydCBjb25zdCBjcmVhdGVFdmVudFNlcmllcyA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIG11dGF0aW9uIENyZWF0ZUV2ZW50U2VyaWVzKCRjcmVhdGVFdmVudFNlcmllc0lucHV0OiBDcmVhdGVFdmVudFNlcmllc0lucHV0ISkge1xuICAgICAgICBjcmVhdGVFdmVudFNlcmllcyhjcmVhdGVFdmVudFNlcmllc0lucHV0OiAkY3JlYXRlRXZlbnRTZXJpZXNJbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgZXh0ZXJuYWxTZXJpZXNJRFxuICAgICAgICAgICAgICAgIGV4dGVybmFsT3JnSURcbiAgICAgICAgICAgICAgICBuYW1lXG4gICAgICAgICAgICAgICAgdGl0bGVcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgIGV2ZW50cyB7XG4gICAgICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgICAgIGV4dGVybmFsRXZlbnRJRFxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgICAgICB0aXRsZVxuICAgICAgICAgICAgICAgICAgICBldmVudExvZ29VcmxTbVxuICAgICAgICAgICAgICAgICAgICBldmVudExvZ29VcmxCZ1xuICAgICAgICAgICAgICAgICAgICBzdGFydFRpbWUge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGltZXpvbmVcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0c0F0TG9jYWxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0c0F0VVRDXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZW5kVGltZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lem9uZVxuICAgICAgICAgICAgICAgICAgICAgICAgZW5kc0F0TG9jYWxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZHNBdFVUQ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJlZ2lzdHJhdGlvblVybFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzZXJpZXNMb2dvVXJsU21cbiAgICAgICAgICAgICAgICBzZXJpZXNMb2dvVXJsQmdcbiAgICAgICAgICAgICAgICBzdGF0dXNcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIE11dGF0aW9uIHVzZWQgdG8gY3JlYXRlIGEgbmV3IHNlcnZpY2UgcGFydG5lci5cbmV4cG9ydCBjb25zdCBjcmVhdGVTZXJ2aWNlUGFydG5lciA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIG11dGF0aW9uIENyZWF0ZVNlcnZpY2VQYXJ0bmVyKCRjcmVhdGVQYXJ0bmVySW5wdXQ6IENyZWF0ZVBhcnRuZXJJbnB1dCEpIHtcbiAgICAgICAgY3JlYXRlU2VydmljZVBhcnRuZXIoY3JlYXRlUGFydG5lcklucHV0OiAkY3JlYXRlUGFydG5lcklucHV0KSB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICBzdGF0dXNcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgICAgICBuYW1lXG4gICAgICAgICAgICAgICAgc2hvcnREZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAgaXNPbmxpbmVcbiAgICAgICAgICAgICAgICBsb2dvVXJsXG4gICAgICAgICAgICAgICAgYWRkcmVzc0xpbmVcbiAgICAgICAgICAgICAgICBjaXR5XG4gICAgICAgICAgICAgICAgc3RhdGVcbiAgICAgICAgICAgICAgICB6aXBDb2RlXG4gICAgICAgICAgICAgICAgd2Vic2l0ZVxuICAgICAgICAgICAgICAgIHNlcnZpY2VzIHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGVcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZW1haWxcbiAgICAgICAgICAgICAgICBwaG9uZU51bWJlclxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gTXV0YXRpb24gdXNlZCB0byBjcmVhdGUgYSBuZXcgcmVpbWJ1cnNlbWVudCBmb3IgYSBwYXJ0aWN1bGFyIHVzZXIuXG5leHBvcnQgY29uc3QgY3JlYXRlUmVpbWJ1cnNlbWVudCA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIG11dGF0aW9uIENyZWF0ZVJlaW1idXJzZW1lbnQoJGNyZWF0ZVJlaW1idXJzZW1lbnRJbnB1dDogQ3JlYXRlUmVpbWJ1cnNlbWVudElucHV0ISkge1xuICAgICAgICBjcmVhdGVSZWltYnVyc2VtZW50KGNyZWF0ZVJlaW1idXJzZW1lbnRJbnB1dDogJGNyZWF0ZVJlaW1idXJzZW1lbnRJbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgdGltZXN0YW1wXG4gICAgICAgICAgICAgICAgcmVpbWJ1cnNlbWVudElkXG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgc3RhdHVzXG4gICAgICAgICAgICAgICAgYW1vdW50XG4gICAgICAgICAgICAgICAgY2FyZElkXG4gICAgICAgICAgICAgICAgY2FyZExhc3Q0XG4gICAgICAgICAgICAgICAgY2FyZFR5cGVcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbnMge1xuICAgICAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXBcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25JZFxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvblN0YXR1c1xuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvblR5cGVcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgICAgICBtZW1iZXJJZFxuICAgICAgICAgICAgICAgICAgICBjYXJkSWRcbiAgICAgICAgICAgICAgICAgICAgYnJhbmRJZFxuICAgICAgICAgICAgICAgICAgICBzdG9yZUlkXG4gICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbmN5Q29kZVxuICAgICAgICAgICAgICAgICAgICByZXdhcmRBbW91bnRcbiAgICAgICAgICAgICAgICAgICAgdG90YWxBbW91bnRcbiAgICAgICAgICAgICAgICAgICAgcGVuZGluZ0Nhc2hiYWNrQW1vdW50XG4gICAgICAgICAgICAgICAgICAgIGNyZWRpdGVkQ2FzaGJhY2tBbW91bnRcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25CcmFuZE5hbWVcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25CcmFuZEFkZHJlc3NcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25CcmFuZExvZ29VcmxcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25CcmFuZFVSTEFkZHJlc3NcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25Jc09ubGluZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIE11dGF0aW9uIHVzZWQgdG8gY3JlYXRlIGFuZC9vciB1cGRhdGUgYSBuZXcgYW5kL29yIGV4aXN0aW5nIGFwcCByZXZpZXcgZm9yIGEgcGFydGljdWxhciB1c2VyLlxuZXhwb3J0IGNvbnN0IGNyZWF0ZUFwcFJldmlldyA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIG11dGF0aW9uIENyZWF0ZUFwcFJldmlldygkY3JlYXRlQXBwUmV2aWV3SW5wdXQ6IENyZWF0ZUFwcFJldmlld0lucHV0ISkge1xuICAgICAgICBjcmVhdGVBcHBSZXZpZXcoY3JlYXRlQXBwUmV2aWV3SW5wdXQ6ICRjcmVhdGVBcHBSZXZpZXdJbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIGNyZWF0ZSBhbmQvb3IgdXBkYXRlIGEgbmV3IGFuZC9vciBleGlzdGluZyBtaWxpdGFyeSB2ZXJpZmljYXRpb24gcmVwb3J0XG5leHBvcnQgY29uc3QgcHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnQgPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBQdXRNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydCgkcHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRJbnB1dDogUHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRJbnB1dCEpIHtcbiAgICAgICAgcHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnQocHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRJbnB1dDogJHB1dE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0SW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhXG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIGNyZWF0ZSBhIG5ldyBMb2cgRXZlbnQuXG5leHBvcnQgY29uc3QgY3JlYXRlTG9nRXZlbnQgPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBDcmVhdGVMb2dFdmVudCgkY3JlYXRlTG9nRXZlbnRJbnB1dDogQ3JlYXRlTG9nRXZlbnRJbnB1dCEpIHtcbiAgICAgICAgY3JlYXRlTG9nRXZlbnQoY3JlYXRlTG9nRXZlbnRJbnB1dDogJGNyZWF0ZUxvZ0V2ZW50SW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhXG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIGNyZWF0ZSBhIFJlZmVycmFsLlxuZXhwb3J0IGNvbnN0IGNyZWF0ZVJlZmVycmFsID0gLyogR3JhcGhRTCAqLyBgXG4gICAgbXV0YXRpb24gQ3JlYXRlUmVmZXJyYWwoJGNyZWF0ZVJlZmVycmFsSW5wdXQ6IENyZWF0ZVJlZmVycmFsSW5wdXQhKSB7XG4gICAgICAgIGNyZWF0ZVJlZmVycmFsKGNyZWF0ZVJlZmVycmFsSW5wdXQ6ICRjcmVhdGVSZWZlcnJhbElucHV0KSB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgZnJvbUlkXG4gICAgICAgICAgICAgICAgdGltZXN0YW1wXG4gICAgICAgICAgICAgICAgdG9JZFxuICAgICAgICAgICAgICAgIGNhbXBhaWduQ29kZVxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgIHN0YXR1c1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gTXV0YXRpb24gdXNlZCB0byB1cGRhdGUgYSBSZWZlcnJhbCdzIGRldGFpbHMuXG5leHBvcnQgY29uc3QgdXBkYXRlUmVmZXJyYWwgPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBVcGRhdGVSZWZlcnJhbCgkdXBkYXRlUmVmZXJyYWxJbnB1dDogVXBkYXRlUmVmZXJyYWxJbnB1dCEpIHtcbiAgICAgICAgdXBkYXRlUmVmZXJyYWwodXBkYXRlUmVmZXJyYWxJbnB1dDogJHVwZGF0ZVJlZmVycmFsSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBmcm9tSWRcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXBcbiAgICAgICAgICAgICAgICB0b0lkXG4gICAgICAgICAgICAgICAgY2FtcGFpZ25Db2RlXG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgc3RhdHVzXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIGNyZWF0ZSBhIG5ldyBOb3RpZmljYXRpb24gUmVtaW5kZXIuXG5leHBvcnQgY29uc3QgY3JlYXRlTm90aWZpY2F0aW9uUmVtaW5kZXIgPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBDcmVhdGVOb3RpZmljYXRpb25SZW1pbmRlcigkY3JlYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dDogQ3JlYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dCEpIHtcbiAgICAgICAgY3JlYXRlTm90aWZpY2F0aW9uUmVtaW5kZXIoY3JlYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dDogJGNyZWF0ZU5vdGlmaWNhdGlvblJlbWluZGVySW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvblJlbWluZGVyVHlwZVxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvblJlbWluZGVyU3RhdHVzXG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uUmVtaW5kZXJDYWRlbmNlXG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgbmV4dFRyaWdnZXJBdFxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlXG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uUmVtaW5kZXJDb3VudFxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvblJlbWluZGVyTWF4Q291bnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIE11dGF0aW9uIHVzZWQgdG8gdXBkYXRlIGEgTm90aWZpY2F0aW9uIFJlbWluZGVyJ3MgZGV0YWlscy5cbmV4cG9ydCBjb25zdCB1cGRhdGVOb3RpZmljYXRpb25SZW1pbmRlciA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIG11dGF0aW9uIFVwZGF0ZU5vdGlmaWNhdGlvblJlbWluZGVyKCR1cGRhdGVOb3RpZmljYXRpb25SZW1pbmRlcklucHV0OiBVcGRhdGVOb3RpZmljYXRpb25SZW1pbmRlcklucHV0ISkge1xuICAgICAgICB1cGRhdGVOb3RpZmljYXRpb25SZW1pbmRlcih1cGRhdGVOb3RpZmljYXRpb25SZW1pbmRlcklucHV0OiAkdXBkYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uUmVtaW5kZXJUeXBlXG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uUmVtaW5kZXJTdGF0dXNcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25SZW1pbmRlckNhZGVuY2VcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgICAgICBuZXh0VHJpZ2dlckF0XG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uQ2hhbm5lbFR5cGVcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25SZW1pbmRlckNvdW50XG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uUmVtaW5kZXJNYXhDb3VudFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gTXV0YXRpb24gdXNlZCB0byBjcmVhdGUgYSBuZXcgVXNlciBBdXRoIFNlc3Npb24uXG5leHBvcnQgY29uc3QgY3JlYXRlVXNlckF1dGhTZXNzaW9uID0gLyogR3JhcGhRTCAqLyBgXG4gICAgbXV0YXRpb24gQ3JlYXRlVXNlckF1dGhTZXNzaW9uKCRjcmVhdGVVc2VyQXV0aFNlc3Npb25JbnB1dDogQ3JlYXRlVXNlckF1dGhTZXNzaW9uSW5wdXQhKSB7XG4gICAgICAgIGNyZWF0ZVVzZXJBdXRoU2Vzc2lvbihjcmVhdGVVc2VyQXV0aFNlc3Npb25JbnB1dDogJGNyZWF0ZVVzZXJBdXRoU2Vzc2lvbklucHV0KSB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgICAgICBudW1iZXJPZlNlc3Npb25zXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIHVwZGF0ZSBhIFVzZXIgQXV0aCBTZXNzaW9uJ3MgZGV0YWlscyBmb3IgYSB1c2VyLlxuZXhwb3J0IGNvbnN0IHVwZGF0ZVVzZXJBdXRoU2Vzc2lvbiA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIG11dGF0aW9uIFVwZGF0ZVVzZXJBdXRoU2Vzc2lvbigkdXBkYXRlVXNlckF1dGhTZXNzaW9uSW5wdXQ6IFVwZGF0ZVVzZXJBdXRoU2Vzc2lvbklucHV0ISkge1xuICAgICAgICB1cGRhdGVVc2VyQXV0aFNlc3Npb24odXBkYXRlVXNlckF1dGhTZXNzaW9uSW5wdXQ6ICR1cGRhdGVVc2VyQXV0aFNlc3Npb25JbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgbnVtYmVyT2ZTZXNzaW9uc1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYFxuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIGNyZWF0ZSBhIG5ldyBGQVEuXG5leHBvcnQgY29uc3QgY3JlYXRlRkFRID0gLyogR3JhcGhRTCAqLyBgXG4gICAgbXV0YXRpb24gQ3JlYXRlRkFRKCRjcmVhdGVGQVFJbnB1dDogQ3JlYXRlRkFRSW5wdXQhKSB7XG4gICAgICAgIGNyZWF0ZUZBUShjcmVhdGVGQVFJbnB1dDogJGNyZWF0ZUZBUUlucHV0KSB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICB0aXRsZVxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgIGZhY3RzIHtcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICAgICAgbGlua2FibGVLZXl3b3JkXG4gICAgICAgICAgICAgICAgICAgIGxpbmtMb2NhdGlvblxuICAgICAgICAgICAgICAgICAgICB0eXBlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gTXV0YXRpb24gdXNlZCB0byBjcmVhdGUgb25lIG9yIG1vcmUgcGh5c2ljYWwgZGV2aWNlcyBmb3IgYSB1c2VyLlxuZXhwb3J0IGNvbnN0IGNyZWF0ZURldmljZSA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIG11dGF0aW9uIENyZWF0ZURldmljZSgkY3JlYXRlRGV2aWNlSW5wdXQ6IENyZWF0ZURldmljZUlucHV0ISkge1xuICAgICAgICBjcmVhdGVEZXZpY2UoY3JlYXRlRGV2aWNlSW5wdXQ6ICRjcmVhdGVEZXZpY2VJbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgdG9rZW5JZFxuICAgICAgICAgICAgICAgIGRldmljZVN0YXRlXG4gICAgICAgICAgICAgICAgbGFzdExvZ2luRGF0ZVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gTXV0YXRpb24gdXNlZCB0byB1cGRhdGUgdGhlIHBoeXNpY2FsIGRldmljZXMnIGRldGFpbHMsIGZvciBhIHVzZXIuXG5leHBvcnQgY29uc3QgdXBkYXRlRGV2aWNlID0gLyogR3JhcGhRTCAqLyBgXG4gICAgbXV0YXRpb24gVXBkYXRlRGV2aWNlKCR1cGRhdGVEZXZpY2VJbnB1dDogVXBkYXRlRGV2aWNlSW5wdXQhKSB7XG4gICAgICAgIHVwZGF0ZURldmljZSh1cGRhdGVEZXZpY2VJbnB1dDogJHVwZGF0ZURldmljZUlucHV0KSB7XG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICB0b2tlbklkXG4gICAgICAgICAgICAgICAgZGV2aWNlU3RhdGVcbiAgICAgICAgICAgICAgICBsYXN0TG9naW5EYXRlXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIGNyZWF0ZSBhIG5ldyBub3RpZmljYXRpb24uXG5leHBvcnQgY29uc3QgY3JlYXRlTm90aWZpY2F0aW9uID0gLyogR3JhcGhRTCAqLyBgXG4gICAgbXV0YXRpb24gQ3JlYXRlTm90aWZpY2F0aW9uKCRjcmVhdGVOb3RpZmljYXRpb25JbnB1dDogQ3JlYXRlTm90aWZpY2F0aW9uSW5wdXQhKSB7XG4gICAgICAgIGNyZWF0ZU5vdGlmaWNhdGlvbihjcmVhdGVOb3RpZmljYXRpb25JbnB1dDogJGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0KSB7XG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgaWRcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgdGltZXN0YW1wXG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uSWRcbiAgICAgICAgICAgICAgICBlbWFpbERlc3RpbmF0aW9uXG4gICAgICAgICAgICAgICAgdXNlckZ1bGxOYW1lXG4gICAgICAgICAgICAgICAgdHlwZVxuICAgICAgICAgICAgICAgIGNoYW5uZWxUeXBlXG4gICAgICAgICAgICAgICAgc3RhdHVzXG4gICAgICAgICAgICAgICAgZXhwb1B1c2hUb2tlbnNcbiAgICAgICAgICAgICAgICBwZW5kaW5nQ2FzaGJhY2tcbiAgICAgICAgICAgICAgICBtZXJjaGFudE5hbWVcbiAgICAgICAgICAgICAgICBhY3Rpb25VcmxcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIE11dGF0aW9uIHVzZWQgdG8gY3JlYXRlIGEgbmV3IHRyYW5zYWN0aW9uLCBiYXNlZCBvbiBhbiBpbmNvbWluZyB0cmFuc2FjdGlvbiBtZXNzYWdlL2V2ZW50LlxuZXhwb3J0IGNvbnN0IGNyZWF0ZVRyYW5zYWN0aW9uID0gLyogR3JhcGhRTCAqLyBgXG4gICAgbXV0YXRpb24gQ3JlYXRlVHJhbnNhY3Rpb24oJGNyZWF0ZVRyYW5zYWN0aW9uSW5wdXQ6IENyZWF0ZVRyYW5zYWN0aW9uSW5wdXQhKSB7XG4gICAgICAgIGNyZWF0ZVRyYW5zYWN0aW9uKGNyZWF0ZVRyYW5zYWN0aW9uSW5wdXQ6ICRjcmVhdGVUcmFuc2FjdGlvbklucHV0KSB7XG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgaWRcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgdGltZXN0YW1wXG4gICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25JZFxuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uU3RhdHVzXG4gICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25UeXBlXG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgbWVtYmVySWRcbiAgICAgICAgICAgICAgICBjYXJkSWRcbiAgICAgICAgICAgICAgICBicmFuZElkXG4gICAgICAgICAgICAgICAgc3RvcmVJZFxuICAgICAgICAgICAgICAgIGNhdGVnb3J5XG4gICAgICAgICAgICAgICAgY3VycmVuY3lDb2RlXG4gICAgICAgICAgICAgICAgcmV3YXJkQW1vdW50XG4gICAgICAgICAgICAgICAgdG90YWxBbW91bnRcbiAgICAgICAgICAgICAgICBwZW5kaW5nQ2FzaGJhY2tBbW91bnRcbiAgICAgICAgICAgICAgICBjcmVkaXRlZENhc2hiYWNrQW1vdW50XG4gICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25CcmFuZE5hbWVcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbkJyYW5kQWRkcmVzc1xuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uQnJhbmRMb2dvVXJsXG4gICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25CcmFuZFVSTEFkZHJlc3NcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbklzT25saW5lXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIHVwZGF0ZSBhIHRyYW5zYWN0aW9uJ3MgZGV0YWlscy5cbmV4cG9ydCBjb25zdCB1cGRhdGVUcmFuc2FjdGlvbiA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIG11dGF0aW9uIFVwZGF0ZVRyYW5zYWN0aW9uKCR1cGRhdGVUcmFuc2FjdGlvbklucHV0OiBVcGRhdGVUcmFuc2FjdGlvbklucHV0ISkge1xuICAgICAgICB1cGRhdGVUcmFuc2FjdGlvbih1cGRhdGVUcmFuc2FjdGlvbklucHV0OiAkdXBkYXRlVHJhbnNhY3Rpb25JbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGlkXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIHRpbWVzdGFtcFxuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uSWRcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvblN0YXR1c1xuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gTXV0YXRpb24gdXNlZCB0byBjcmVhdGUgYSBuZXcgY2FyZCBsaW5rIGZvciBhIGJyYW5kLW5ldyB1c2VyLCB3aXRoIGEgbmV3IGNhcmQuXG5leHBvcnQgY29uc3QgY3JlYXRlQ2FyZExpbmsgPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBDcmVhdGVDYXJkTGluaygkY3JlYXRlQ2FyZExpbmtJbnB1dDogQ3JlYXRlQ2FyZExpbmtJbnB1dCEpIHtcbiAgICAgICAgY3JlYXRlQ2FyZExpbmsoY3JlYXRlQ2FyZExpbmtJbnB1dDogJGNyZWF0ZUNhcmRMaW5rSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIG1lbWJlcklkXG4gICAgICAgICAgICAgICAgY2FyZHMge1xuICAgICAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgICAgICBhcHBsaWNhdGlvbklEXG4gICAgICAgICAgICAgICAgICAgIHRva2VuXG4gICAgICAgICAgICAgICAgICAgIHR5cGVcbiAgICAgICAgICAgICAgICAgICAgbmFtZVxuICAgICAgICAgICAgICAgICAgICBsYXN0NFxuICAgICAgICAgICAgICAgICAgICBleHBpcmF0aW9uXG4gICAgICAgICAgICAgICAgICAgIGFkZGl0aW9uYWxQcm9ncmFtSURcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgc3RhdHVzXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIGFkZCBhIG5ldyBjYXJkLCB0byBhbiBleGlzdGluZyB1c2VyLCB3aXRob3V0IGNyZWF0aW5nIGEgYnJhbmQtbmV3IHVzZXIuXG5leHBvcnQgY29uc3QgYWRkQ2FyZCA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIG11dGF0aW9uIEFkZENhcmQoJGFkZENhcmRJbnB1dDogQWRkQ2FyZElucHV0ISkge1xuICAgICAgICBhZGRDYXJkKGFkZENhcmRJbnB1dDogJGFkZENhcmRJbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgbWVtYmVySWRcbiAgICAgICAgICAgICAgICBjYXJkcyB7XG4gICAgICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgICAgIGFwcGxpY2F0aW9uSURcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5cbiAgICAgICAgICAgICAgICAgICAgdHlwZVxuICAgICAgICAgICAgICAgICAgICBuYW1lXG4gICAgICAgICAgICAgICAgICAgIGxhc3Q0XG4gICAgICAgICAgICAgICAgICAgIGV4cGlyYXRpb25cbiAgICAgICAgICAgICAgICAgICAgYWRkaXRpb25hbFByb2dyYW1JRFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgICAgICBzdGF0dXNcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIE11dGF0aW9uIHVzZWQgdG8gcmVtb3ZlIGEgY2FyZCBsaW5rIGZyb20gYSB1c2VyJ3MgY2FyZCBsaW5rLlxuZXhwb3J0IGNvbnN0IGRlbGV0ZUNhcmQgPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBEZWxldGVDYXJkKCRkZWxldGVDYXJkSW5wdXQ6IERlbGV0ZUNhcmRJbnB1dCEpIHtcbiAgICAgICAgZGVsZXRlQ2FyZChkZWxldGVDYXJkSW5wdXQ6ICRkZWxldGVDYXJkSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIGNhcmRJZFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gTXV0YXRpb24gdXNlZCB0byB1cGRhdGUgYSBtZW1iZXIncyBjYXJkIGRldGFpbHMuXG5leHBvcnQgY29uc3QgdXBkYXRlQ2FyZCA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIG11dGF0aW9uIFVwZGF0ZUNhcmQoJHVwZGF0ZUNhcmRJbnB1dDogVXBkYXRlQ2FyZElucHV0ISkge1xuICAgICAgICB1cGRhdGVDYXJkKHVwZGF0ZUNhcmRJbnB1dDogJHVwZGF0ZUNhcmRJbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgY2FyZElkc1xuICAgICAgICAgICAgICAgIG1lbWJlcklkXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIGNyZWF0ZSBhbiBpbmRpdmlkdWFsJ3MgbWlsaXRhcnkgdmVyaWZpY2F0aW9uIG9iamVjdC5cbmV4cG9ydCBjb25zdCBjcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbiA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIG11dGF0aW9uIENyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uKCRjcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0OiBDcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0ISkge1xuICAgICAgICBjcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbihjcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0OiAkY3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgZmlyc3ROYW1lXG4gICAgICAgICAgICAgICAgbGFzdE5hbWVcbiAgICAgICAgICAgICAgICBkYXRlT2ZCaXJ0aFxuICAgICAgICAgICAgICAgIGVubGlzdG1lbnRZZWFyXG4gICAgICAgICAgICAgICAgYWRkcmVzc0xpbmVcbiAgICAgICAgICAgICAgICBjaXR5XG4gICAgICAgICAgICAgICAgc3RhdGVcbiAgICAgICAgICAgICAgICB6aXBDb2RlXG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgbWlsaXRhcnlEdXR5U3RhdHVzXG4gICAgICAgICAgICAgICAgbWlsaXRhcnlCcmFuY2hcbiAgICAgICAgICAgICAgICBtaWxpdGFyeUFmZmlsaWF0aW9uXG4gICAgICAgICAgICAgICAgbWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIE11dGF0aW9uIHVzZWQgdG8gdXBkYXRlIGFuIGluZGl2aWR1YWwncyBtaWxpdGFyeSB2ZXJpZmljYXRpb24gc3RhdHVzLlxuZXhwb3J0IGNvbnN0IHVwZGF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzID0gLyogR3JhcGhRTCAqLyBgXG4gICAgbXV0YXRpb24gVXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXMoJHVwZGF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQ6IFVwZGF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQhKSB7XG4gICAgICAgIHVwZGF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzKHVwZGF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQ6ICR1cGRhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0KSB7XG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgaWRcbiAgICAgICAgICAgIG1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzXG4gICAgICAgIH1cbiAgICB9XG5gO1xuIl19