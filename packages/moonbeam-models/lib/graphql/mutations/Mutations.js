"use strict";
/**
 * This is a file used to define the all GraphQL mutation constants
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMilitaryVerificationStatus = exports.createMilitaryVerification = exports.updateCard = exports.deleteCard = exports.addCard = exports.createCardLink = exports.updateTransaction = exports.createTransaction = exports.createNotification = exports.updateDevice = exports.createDevice = exports.createFAQ = exports.updateUserAuthSession = exports.createUserAuthSession = exports.updateNotificationReminder = exports.createNotificationReminder = exports.updateReferral = exports.createReferral = exports.createLogEvent = exports.putMilitaryVerificationReport = exports.createAppReview = exports.createReimbursement = exports.createServicePartner = exports.createEventSeries = void 0;
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
                description
                createdAt
                updatedAt
                events {
                    id
                    externalEventID
                    description
                    eventLogoUrlSm
                    eventLogoUrlBg
                    startTime {
                        timezone
                        startsAtLocal
                        startsAtUTC
                    }
                    endTime {
                        timezone
                        startsAtLocal
                        startsAtUTC
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTXV0YXRpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2dyYXBocWwvbXV0YXRpb25zL011dGF0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7OztBQUVILG1GQUFtRjtBQUN0RSxRQUFBLGlCQUFpQixHQUFpQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXFDOUMsQ0FBQztBQUVGLGlEQUFpRDtBQUNwQyxRQUFBLG9CQUFvQixHQUFpQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0EwQmpELENBQUM7QUFFRixxRUFBcUU7QUFDeEQsUUFBQSxtQkFBbUIsR0FBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0EyQ2hELENBQUM7QUFFRixnR0FBZ0c7QUFDbkYsUUFBQSxlQUFlLEdBQWlCOzs7Ozs7Ozs7Ozs7Q0FZNUMsQ0FBQztBQUVGLDJGQUEyRjtBQUM5RSxRQUFBLDZCQUE2QixHQUFpQjs7Ozs7Ozs7Q0FRMUQsQ0FBQztBQUVGLDJDQUEyQztBQUM5QixRQUFBLGNBQWMsR0FBaUI7Ozs7Ozs7O0NBUTNDLENBQUM7QUFFRixzQ0FBc0M7QUFDekIsUUFBQSxjQUFjLEdBQWlCOzs7Ozs7Ozs7Ozs7Ozs7O0NBZ0IzQyxDQUFDO0FBRUYsZ0RBQWdEO0FBQ25DLFFBQUEsY0FBYyxHQUFpQjs7Ozs7Ozs7Ozs7Ozs7OztDQWdCM0MsQ0FBQztBQUVGLHVEQUF1RDtBQUMxQyxRQUFBLDBCQUEwQixHQUFpQjs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQW1CdkQsQ0FBQztBQUVGLDZEQUE2RDtBQUNoRCxRQUFBLDBCQUEwQixHQUFpQjs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQW1CdkQsQ0FBQztBQUVGLG1EQUFtRDtBQUN0QyxRQUFBLHFCQUFxQixHQUFpQjs7Ozs7Ozs7Ozs7OztDQWFsRCxDQUFDO0FBRUYsb0VBQW9FO0FBQ3ZELFFBQUEscUJBQXFCLEdBQWlCOzs7Ozs7Ozs7Ozs7O0NBYWxELENBQUE7QUFFRCxxQ0FBcUM7QUFDeEIsUUFBQSxTQUFTLEdBQWlCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBbUJ0QyxDQUFDO0FBRUYsbUVBQW1FO0FBQ3RELFFBQUEsWUFBWSxHQUFpQjs7Ozs7Ozs7Ozs7OztDQWF6QyxDQUFDO0FBRUYscUVBQXFFO0FBQ3hELFFBQUEsWUFBWSxHQUFpQjs7Ozs7Ozs7Ozs7OztDQWF6QyxDQUFDO0FBRUYsOENBQThDO0FBQ2pDLFFBQUEsa0JBQWtCLEdBQWlCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0F3Qi9DLENBQUM7QUFFRiw2RkFBNkY7QUFDaEYsUUFBQSxpQkFBaUIsR0FBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBZ0M5QyxDQUFDO0FBRUYsbURBQW1EO0FBQ3RDLFFBQUEsaUJBQWlCLEdBQWlCOzs7Ozs7Ozs7Ozs7Ozs7Q0FlOUMsQ0FBQztBQUVGLGlGQUFpRjtBQUNwRSxRQUFBLGNBQWMsR0FBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXdCM0MsQ0FBQztBQUVGLDJGQUEyRjtBQUM5RSxRQUFBLE9BQU8sR0FBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXdCcEMsQ0FBQztBQUVGLCtEQUErRDtBQUNsRCxRQUFBLFVBQVUsR0FBaUI7Ozs7Ozs7Ozs7OztDQVl2QyxDQUFDO0FBRUYsbURBQW1EO0FBQ3RDLFFBQUEsVUFBVSxHQUFpQjs7Ozs7Ozs7Ozs7O0NBWXZDLENBQUM7QUFFRix3RUFBd0U7QUFDM0QsUUFBQSwwQkFBMEIsR0FBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXdCdkQsQ0FBQztBQUVGLHdFQUF3RTtBQUMzRCxRQUFBLGdDQUFnQyxHQUFpQjs7Ozs7Ozs7O0NBUzdELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFRoaXMgaXMgYSBmaWxlIHVzZWQgdG8gZGVmaW5lIHRoZSBhbGwgR3JhcGhRTCBtdXRhdGlvbiBjb25zdGFudHNcbiAqL1xuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIGNyZWF0ZSBhIG5ldyBFdmVudCBTZXJpZXMgZm9yIGEgcGFydGljdWxhciBwYXJ0bmVyIG9yZ2FuaXphdGlvblxuZXhwb3J0IGNvbnN0IGNyZWF0ZUV2ZW50U2VyaWVzID0gLyogR3JhcGhRTCAqLyBgXG4gICAgbXV0YXRpb24gQ3JlYXRlRXZlbnRTZXJpZXMoJGNyZWF0ZUV2ZW50U2VyaWVzSW5wdXQ6IENyZWF0ZUV2ZW50U2VyaWVzSW5wdXQhKSB7XG4gICAgICAgIGNyZWF0ZUV2ZW50U2VyaWVzKGNyZWF0ZUV2ZW50U2VyaWVzSW5wdXQ6ICRjcmVhdGVFdmVudFNlcmllc0lucHV0KSB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICBleHRlcm5hbFNlcmllc0lEXG4gICAgICAgICAgICAgICAgZXh0ZXJuYWxPcmdJRFxuICAgICAgICAgICAgICAgIG5hbWVcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgIGV2ZW50cyB7XG4gICAgICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgICAgIGV4dGVybmFsRXZlbnRJRFxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgICAgICBldmVudExvZ29VcmxTbVxuICAgICAgICAgICAgICAgICAgICBldmVudExvZ29VcmxCZ1xuICAgICAgICAgICAgICAgICAgICBzdGFydFRpbWUge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGltZXpvbmVcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0c0F0TG9jYWxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0c0F0VVRDXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZW5kVGltZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lem9uZVxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRzQXRMb2NhbFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRzQXRVVENcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZWdpc3RyYXRpb25VcmxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc2VyaWVzTG9nb1VybFNtXG4gICAgICAgICAgICAgICAgc2VyaWVzTG9nb1VybEJnXG4gICAgICAgICAgICAgICAgc3RhdHVzXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIGNyZWF0ZSBhIG5ldyBzZXJ2aWNlIHBhcnRuZXIuXG5leHBvcnQgY29uc3QgY3JlYXRlU2VydmljZVBhcnRuZXIgPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBDcmVhdGVTZXJ2aWNlUGFydG5lcigkY3JlYXRlUGFydG5lcklucHV0OiBDcmVhdGVQYXJ0bmVySW5wdXQhKSB7XG4gICAgICAgIGNyZWF0ZVNlcnZpY2VQYXJ0bmVyKGNyZWF0ZVBhcnRuZXJJbnB1dDogJGNyZWF0ZVBhcnRuZXJJbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgc3RhdHVzXG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgbmFtZVxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAgaXNPbmxpbmVcbiAgICAgICAgICAgICAgICBsb2dvVXJsXG4gICAgICAgICAgICAgICAgYWRkcmVzc0xpbmVcbiAgICAgICAgICAgICAgICBjaXR5XG4gICAgICAgICAgICAgICAgc3RhdGVcbiAgICAgICAgICAgICAgICB6aXBDb2RlXG4gICAgICAgICAgICAgICAgd2Vic2l0ZVxuICAgICAgICAgICAgICAgIHNlcnZpY2VzIHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGVcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIGNyZWF0ZSBhIG5ldyByZWltYnVyc2VtZW50IGZvciBhIHBhcnRpY3VsYXIgdXNlci5cbmV4cG9ydCBjb25zdCBjcmVhdGVSZWltYnVyc2VtZW50ID0gLyogR3JhcGhRTCAqLyBgXG4gICAgbXV0YXRpb24gQ3JlYXRlUmVpbWJ1cnNlbWVudCgkY3JlYXRlUmVpbWJ1cnNlbWVudElucHV0OiBDcmVhdGVSZWltYnVyc2VtZW50SW5wdXQhKSB7XG4gICAgICAgIGNyZWF0ZVJlaW1idXJzZW1lbnQoY3JlYXRlUmVpbWJ1cnNlbWVudElucHV0OiAkY3JlYXRlUmVpbWJ1cnNlbWVudElucHV0KSB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXBcbiAgICAgICAgICAgICAgICByZWltYnVyc2VtZW50SWRcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgICAgICBzdGF0dXNcbiAgICAgICAgICAgICAgICBhbW91bnRcbiAgICAgICAgICAgICAgICBjYXJkSWRcbiAgICAgICAgICAgICAgICBjYXJkTGFzdDRcbiAgICAgICAgICAgICAgICBjYXJkVHlwZVxuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9ucyB7XG4gICAgICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcFxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbklkXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uU3RhdHVzXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uVHlwZVxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgICAgIG1lbWJlcklkXG4gICAgICAgICAgICAgICAgICAgIGNhcmRJZFxuICAgICAgICAgICAgICAgICAgICBicmFuZElkXG4gICAgICAgICAgICAgICAgICAgIHN0b3JlSWRcbiAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnlcbiAgICAgICAgICAgICAgICAgICAgY3VycmVuY3lDb2RlXG4gICAgICAgICAgICAgICAgICAgIHJld2FyZEFtb3VudFxuICAgICAgICAgICAgICAgICAgICB0b3RhbEFtb3VudFxuICAgICAgICAgICAgICAgICAgICBwZW5kaW5nQ2FzaGJhY2tBbW91bnRcbiAgICAgICAgICAgICAgICAgICAgY3JlZGl0ZWRDYXNoYmFja0Ftb3VudFxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbkJyYW5kTmFtZVxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbkJyYW5kQWRkcmVzc1xuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbkJyYW5kTG9nb1VybFxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbkJyYW5kVVJMQWRkcmVzc1xuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbklzT25saW5lXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gTXV0YXRpb24gdXNlZCB0byBjcmVhdGUgYW5kL29yIHVwZGF0ZSBhIG5ldyBhbmQvb3IgZXhpc3RpbmcgYXBwIHJldmlldyBmb3IgYSBwYXJ0aWN1bGFyIHVzZXIuXG5leHBvcnQgY29uc3QgY3JlYXRlQXBwUmV2aWV3ID0gLyogR3JhcGhRTCAqLyBgXG4gICAgbXV0YXRpb24gQ3JlYXRlQXBwUmV2aWV3KCRjcmVhdGVBcHBSZXZpZXdJbnB1dDogQ3JlYXRlQXBwUmV2aWV3SW5wdXQhKSB7XG4gICAgICAgIGNyZWF0ZUFwcFJldmlldyhjcmVhdGVBcHBSZXZpZXdJbnB1dDogJGNyZWF0ZUFwcFJldmlld0lucHV0KSB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIE11dGF0aW9uIHVzZWQgdG8gY3JlYXRlIGFuZC9vciB1cGRhdGUgYSBuZXcgYW5kL29yIGV4aXN0aW5nIG1pbGl0YXJ5IHZlcmlmaWNhdGlvbiByZXBvcnRcbmV4cG9ydCBjb25zdCBwdXRNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydCA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIG11dGF0aW9uIFB1dE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0KCRwdXRNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydElucHV0OiBQdXRNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydElucHV0ISkge1xuICAgICAgICBwdXRNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydChwdXRNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydElucHV0OiAkcHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRJbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGFcbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIE11dGF0aW9uIHVzZWQgdG8gY3JlYXRlIGEgbmV3IExvZyBFdmVudC5cbmV4cG9ydCBjb25zdCBjcmVhdGVMb2dFdmVudCA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIG11dGF0aW9uIENyZWF0ZUxvZ0V2ZW50KCRjcmVhdGVMb2dFdmVudElucHV0OiBDcmVhdGVMb2dFdmVudElucHV0ISkge1xuICAgICAgICBjcmVhdGVMb2dFdmVudChjcmVhdGVMb2dFdmVudElucHV0OiAkY3JlYXRlTG9nRXZlbnRJbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGFcbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIE11dGF0aW9uIHVzZWQgdG8gY3JlYXRlIGEgUmVmZXJyYWwuXG5leHBvcnQgY29uc3QgY3JlYXRlUmVmZXJyYWwgPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBDcmVhdGVSZWZlcnJhbCgkY3JlYXRlUmVmZXJyYWxJbnB1dDogQ3JlYXRlUmVmZXJyYWxJbnB1dCEpIHtcbiAgICAgICAgY3JlYXRlUmVmZXJyYWwoY3JlYXRlUmVmZXJyYWxJbnB1dDogJGNyZWF0ZVJlZmVycmFsSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBmcm9tSWRcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXBcbiAgICAgICAgICAgICAgICB0b0lkXG4gICAgICAgICAgICAgICAgY2FtcGFpZ25Db2RlXG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgc3RhdHVzXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIHVwZGF0ZSBhIFJlZmVycmFsJ3MgZGV0YWlscy5cbmV4cG9ydCBjb25zdCB1cGRhdGVSZWZlcnJhbCA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIG11dGF0aW9uIFVwZGF0ZVJlZmVycmFsKCR1cGRhdGVSZWZlcnJhbElucHV0OiBVcGRhdGVSZWZlcnJhbElucHV0ISkge1xuICAgICAgICB1cGRhdGVSZWZlcnJhbCh1cGRhdGVSZWZlcnJhbElucHV0OiAkdXBkYXRlUmVmZXJyYWxJbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGZyb21JZFxuICAgICAgICAgICAgICAgIHRpbWVzdGFtcFxuICAgICAgICAgICAgICAgIHRvSWRcbiAgICAgICAgICAgICAgICBjYW1wYWlnbkNvZGVcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgICAgICBzdGF0dXNcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIE11dGF0aW9uIHVzZWQgdG8gY3JlYXRlIGEgbmV3IE5vdGlmaWNhdGlvbiBSZW1pbmRlci5cbmV4cG9ydCBjb25zdCBjcmVhdGVOb3RpZmljYXRpb25SZW1pbmRlciA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIG11dGF0aW9uIENyZWF0ZU5vdGlmaWNhdGlvblJlbWluZGVyKCRjcmVhdGVOb3RpZmljYXRpb25SZW1pbmRlcklucHV0OiBDcmVhdGVOb3RpZmljYXRpb25SZW1pbmRlcklucHV0ISkge1xuICAgICAgICBjcmVhdGVOb3RpZmljYXRpb25SZW1pbmRlcihjcmVhdGVOb3RpZmljYXRpb25SZW1pbmRlcklucHV0OiAkY3JlYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uUmVtaW5kZXJUeXBlXG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uUmVtaW5kZXJTdGF0dXNcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25SZW1pbmRlckNhZGVuY2VcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgICAgICBuZXh0VHJpZ2dlckF0XG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uQ2hhbm5lbFR5cGVcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25SZW1pbmRlckNvdW50XG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uUmVtaW5kZXJNYXhDb3VudFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gTXV0YXRpb24gdXNlZCB0byB1cGRhdGUgYSBOb3RpZmljYXRpb24gUmVtaW5kZXIncyBkZXRhaWxzLlxuZXhwb3J0IGNvbnN0IHVwZGF0ZU5vdGlmaWNhdGlvblJlbWluZGVyID0gLyogR3JhcGhRTCAqLyBgXG4gICAgbXV0YXRpb24gVXBkYXRlTm90aWZpY2F0aW9uUmVtaW5kZXIoJHVwZGF0ZU5vdGlmaWNhdGlvblJlbWluZGVySW5wdXQ6IFVwZGF0ZU5vdGlmaWNhdGlvblJlbWluZGVySW5wdXQhKSB7XG4gICAgICAgIHVwZGF0ZU5vdGlmaWNhdGlvblJlbWluZGVyKHVwZGF0ZU5vdGlmaWNhdGlvblJlbWluZGVySW5wdXQ6ICR1cGRhdGVOb3RpZmljYXRpb25SZW1pbmRlcklucHV0KSB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25SZW1pbmRlclR5cGVcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25SZW1pbmRlclN0YXR1c1xuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvblJlbWluZGVyQ2FkZW5jZVxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgIG5leHRUcmlnZ2VyQXRcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25DaGFubmVsVHlwZVxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvblJlbWluZGVyQ291bnRcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25SZW1pbmRlck1heENvdW50XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIGNyZWF0ZSBhIG5ldyBVc2VyIEF1dGggU2Vzc2lvbi5cbmV4cG9ydCBjb25zdCBjcmVhdGVVc2VyQXV0aFNlc3Npb24gPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBDcmVhdGVVc2VyQXV0aFNlc3Npb24oJGNyZWF0ZVVzZXJBdXRoU2Vzc2lvbklucHV0OiBDcmVhdGVVc2VyQXV0aFNlc3Npb25JbnB1dCEpIHtcbiAgICAgICAgY3JlYXRlVXNlckF1dGhTZXNzaW9uKGNyZWF0ZVVzZXJBdXRoU2Vzc2lvbklucHV0OiAkY3JlYXRlVXNlckF1dGhTZXNzaW9uSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgIG51bWJlck9mU2Vzc2lvbnNcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIE11dGF0aW9uIHVzZWQgdG8gdXBkYXRlIGEgVXNlciBBdXRoIFNlc3Npb24ncyBkZXRhaWxzIGZvciBhIHVzZXIuXG5leHBvcnQgY29uc3QgdXBkYXRlVXNlckF1dGhTZXNzaW9uID0gLyogR3JhcGhRTCAqLyBgXG4gICAgbXV0YXRpb24gVXBkYXRlVXNlckF1dGhTZXNzaW9uKCR1cGRhdGVVc2VyQXV0aFNlc3Npb25JbnB1dDogVXBkYXRlVXNlckF1dGhTZXNzaW9uSW5wdXQhKSB7XG4gICAgICAgIHVwZGF0ZVVzZXJBdXRoU2Vzc2lvbih1cGRhdGVVc2VyQXV0aFNlc3Npb25JbnB1dDogJHVwZGF0ZVVzZXJBdXRoU2Vzc2lvbklucHV0KSB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgICAgICBudW1iZXJPZlNlc3Npb25zXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gXG5cbi8vIE11dGF0aW9uIHVzZWQgdG8gY3JlYXRlIGEgbmV3IEZBUS5cbmV4cG9ydCBjb25zdCBjcmVhdGVGQVEgPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBDcmVhdGVGQVEoJGNyZWF0ZUZBUUlucHV0OiBDcmVhdGVGQVFJbnB1dCEpIHtcbiAgICAgICAgY3JlYXRlRkFRKGNyZWF0ZUZBUUlucHV0OiAkY3JlYXRlRkFRSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIHRpdGxlXG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgZmFjdHMge1xuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgICAgICBsaW5rYWJsZUtleXdvcmRcbiAgICAgICAgICAgICAgICAgICAgbGlua0xvY2F0aW9uXG4gICAgICAgICAgICAgICAgICAgIHR5cGVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIGNyZWF0ZSBvbmUgb3IgbW9yZSBwaHlzaWNhbCBkZXZpY2VzIGZvciBhIHVzZXIuXG5leHBvcnQgY29uc3QgY3JlYXRlRGV2aWNlID0gLyogR3JhcGhRTCAqLyBgXG4gICAgbXV0YXRpb24gQ3JlYXRlRGV2aWNlKCRjcmVhdGVEZXZpY2VJbnB1dDogQ3JlYXRlRGV2aWNlSW5wdXQhKSB7XG4gICAgICAgIGNyZWF0ZURldmljZShjcmVhdGVEZXZpY2VJbnB1dDogJGNyZWF0ZURldmljZUlucHV0KSB7XG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICB0b2tlbklkXG4gICAgICAgICAgICAgICAgZGV2aWNlU3RhdGVcbiAgICAgICAgICAgICAgICBsYXN0TG9naW5EYXRlXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIHVwZGF0ZSB0aGUgcGh5c2ljYWwgZGV2aWNlcycgZGV0YWlscywgZm9yIGEgdXNlci5cbmV4cG9ydCBjb25zdCB1cGRhdGVEZXZpY2UgPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBVcGRhdGVEZXZpY2UoJHVwZGF0ZURldmljZUlucHV0OiBVcGRhdGVEZXZpY2VJbnB1dCEpIHtcbiAgICAgICAgdXBkYXRlRGV2aWNlKHVwZGF0ZURldmljZUlucHV0OiAkdXBkYXRlRGV2aWNlSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIHRva2VuSWRcbiAgICAgICAgICAgICAgICBkZXZpY2VTdGF0ZVxuICAgICAgICAgICAgICAgIGxhc3RMb2dpbkRhdGVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIE11dGF0aW9uIHVzZWQgdG8gY3JlYXRlIGEgbmV3IG5vdGlmaWNhdGlvbi5cbmV4cG9ydCBjb25zdCBjcmVhdGVOb3RpZmljYXRpb24gPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBDcmVhdGVOb3RpZmljYXRpb24oJGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0OiBDcmVhdGVOb3RpZmljYXRpb25JbnB1dCEpIHtcbiAgICAgICAgY3JlYXRlTm90aWZpY2F0aW9uKGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0OiAkY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBpZFxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXBcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25JZFxuICAgICAgICAgICAgICAgIGVtYWlsRGVzdGluYXRpb25cbiAgICAgICAgICAgICAgICB1c2VyRnVsbE5hbWVcbiAgICAgICAgICAgICAgICB0eXBlXG4gICAgICAgICAgICAgICAgY2hhbm5lbFR5cGVcbiAgICAgICAgICAgICAgICBzdGF0dXNcbiAgICAgICAgICAgICAgICBleHBvUHVzaFRva2Vuc1xuICAgICAgICAgICAgICAgIHBlbmRpbmdDYXNoYmFja1xuICAgICAgICAgICAgICAgIG1lcmNoYW50TmFtZVxuICAgICAgICAgICAgICAgIGFjdGlvblVybFxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gTXV0YXRpb24gdXNlZCB0byBjcmVhdGUgYSBuZXcgdHJhbnNhY3Rpb24sIGJhc2VkIG9uIGFuIGluY29taW5nIHRyYW5zYWN0aW9uIG1lc3NhZ2UvZXZlbnQuXG5leHBvcnQgY29uc3QgY3JlYXRlVHJhbnNhY3Rpb24gPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBDcmVhdGVUcmFuc2FjdGlvbigkY3JlYXRlVHJhbnNhY3Rpb25JbnB1dDogQ3JlYXRlVHJhbnNhY3Rpb25JbnB1dCEpIHtcbiAgICAgICAgY3JlYXRlVHJhbnNhY3Rpb24oY3JlYXRlVHJhbnNhY3Rpb25JbnB1dDogJGNyZWF0ZVRyYW5zYWN0aW9uSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBpZFxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXBcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbklkXG4gICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25TdGF0dXNcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvblR5cGVcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgICAgICBtZW1iZXJJZFxuICAgICAgICAgICAgICAgIGNhcmRJZFxuICAgICAgICAgICAgICAgIGJyYW5kSWRcbiAgICAgICAgICAgICAgICBzdG9yZUlkXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnlcbiAgICAgICAgICAgICAgICBjdXJyZW5jeUNvZGVcbiAgICAgICAgICAgICAgICByZXdhcmRBbW91bnRcbiAgICAgICAgICAgICAgICB0b3RhbEFtb3VudFxuICAgICAgICAgICAgICAgIHBlbmRpbmdDYXNoYmFja0Ftb3VudFxuICAgICAgICAgICAgICAgIGNyZWRpdGVkQ2FzaGJhY2tBbW91bnRcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbkJyYW5kTmFtZVxuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uQnJhbmRBZGRyZXNzXG4gICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25CcmFuZExvZ29VcmxcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbkJyYW5kVVJMQWRkcmVzc1xuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uSXNPbmxpbmVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIE11dGF0aW9uIHVzZWQgdG8gdXBkYXRlIGEgdHJhbnNhY3Rpb24ncyBkZXRhaWxzLlxuZXhwb3J0IGNvbnN0IHVwZGF0ZVRyYW5zYWN0aW9uID0gLyogR3JhcGhRTCAqLyBgXG4gICAgbXV0YXRpb24gVXBkYXRlVHJhbnNhY3Rpb24oJHVwZGF0ZVRyYW5zYWN0aW9uSW5wdXQ6IFVwZGF0ZVRyYW5zYWN0aW9uSW5wdXQhKSB7XG4gICAgICAgIHVwZGF0ZVRyYW5zYWN0aW9uKHVwZGF0ZVRyYW5zYWN0aW9uSW5wdXQ6ICR1cGRhdGVUcmFuc2FjdGlvbklucHV0KSB7XG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgaWRcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgdGltZXN0YW1wXG4gICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25JZFxuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uU3RhdHVzXG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIGNyZWF0ZSBhIG5ldyBjYXJkIGxpbmsgZm9yIGEgYnJhbmQtbmV3IHVzZXIsIHdpdGggYSBuZXcgY2FyZC5cbmV4cG9ydCBjb25zdCBjcmVhdGVDYXJkTGluayA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIG11dGF0aW9uIENyZWF0ZUNhcmRMaW5rKCRjcmVhdGVDYXJkTGlua0lucHV0OiBDcmVhdGVDYXJkTGlua0lucHV0ISkge1xuICAgICAgICBjcmVhdGVDYXJkTGluayhjcmVhdGVDYXJkTGlua0lucHV0OiAkY3JlYXRlQ2FyZExpbmtJbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgbWVtYmVySWRcbiAgICAgICAgICAgICAgICBjYXJkcyB7XG4gICAgICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgICAgIGFwcGxpY2F0aW9uSURcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5cbiAgICAgICAgICAgICAgICAgICAgdHlwZVxuICAgICAgICAgICAgICAgICAgICBuYW1lXG4gICAgICAgICAgICAgICAgICAgIGxhc3Q0XG4gICAgICAgICAgICAgICAgICAgIGV4cGlyYXRpb25cbiAgICAgICAgICAgICAgICAgICAgYWRkaXRpb25hbFByb2dyYW1JRFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgICAgICBzdGF0dXNcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIE11dGF0aW9uIHVzZWQgdG8gYWRkIGEgbmV3IGNhcmQsIHRvIGFuIGV4aXN0aW5nIHVzZXIsIHdpdGhvdXQgY3JlYXRpbmcgYSBicmFuZC1uZXcgdXNlci5cbmV4cG9ydCBjb25zdCBhZGRDYXJkID0gLyogR3JhcGhRTCAqLyBgXG4gICAgbXV0YXRpb24gQWRkQ2FyZCgkYWRkQ2FyZElucHV0OiBBZGRDYXJkSW5wdXQhKSB7XG4gICAgICAgIGFkZENhcmQoYWRkQ2FyZElucHV0OiAkYWRkQ2FyZElucHV0KSB7XG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICBtZW1iZXJJZFxuICAgICAgICAgICAgICAgIGNhcmRzIHtcbiAgICAgICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICAgICAgYXBwbGljYXRpb25JRFxuICAgICAgICAgICAgICAgICAgICB0b2tlblxuICAgICAgICAgICAgICAgICAgICB0eXBlXG4gICAgICAgICAgICAgICAgICAgIG5hbWVcbiAgICAgICAgICAgICAgICAgICAgbGFzdDRcbiAgICAgICAgICAgICAgICAgICAgZXhwaXJhdGlvblxuICAgICAgICAgICAgICAgICAgICBhZGRpdGlvbmFsUHJvZ3JhbUlEXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgIHN0YXR1c1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gTXV0YXRpb24gdXNlZCB0byByZW1vdmUgYSBjYXJkIGxpbmsgZnJvbSBhIHVzZXIncyBjYXJkIGxpbmsuXG5leHBvcnQgY29uc3QgZGVsZXRlQ2FyZCA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIG11dGF0aW9uIERlbGV0ZUNhcmQoJGRlbGV0ZUNhcmRJbnB1dDogRGVsZXRlQ2FyZElucHV0ISkge1xuICAgICAgICBkZWxldGVDYXJkKGRlbGV0ZUNhcmRJbnB1dDogJGRlbGV0ZUNhcmRJbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgY2FyZElkXG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIHVwZGF0ZSBhIG1lbWJlcidzIGNhcmQgZGV0YWlscy5cbmV4cG9ydCBjb25zdCB1cGRhdGVDYXJkID0gLyogR3JhcGhRTCAqLyBgXG4gICAgbXV0YXRpb24gVXBkYXRlQ2FyZCgkdXBkYXRlQ2FyZElucHV0OiBVcGRhdGVDYXJkSW5wdXQhKSB7XG4gICAgICAgIHVwZGF0ZUNhcmQodXBkYXRlQ2FyZElucHV0OiAkdXBkYXRlQ2FyZElucHV0KSB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICBjYXJkSWRzXG4gICAgICAgICAgICAgICAgbWVtYmVySWRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIE11dGF0aW9uIHVzZWQgdG8gY3JlYXRlIGFuIGluZGl2aWR1YWwncyBtaWxpdGFyeSB2ZXJpZmljYXRpb24gb2JqZWN0LlxuZXhwb3J0IGNvbnN0IGNyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uID0gLyogR3JhcGhRTCAqLyBgXG4gICAgbXV0YXRpb24gQ3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb24oJGNyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQ6IENyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQhKSB7XG4gICAgICAgIGNyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uKGNyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQ6ICRjcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0KSB7XG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICBmaXJzdE5hbWVcbiAgICAgICAgICAgICAgICBsYXN0TmFtZVxuICAgICAgICAgICAgICAgIGRhdGVPZkJpcnRoXG4gICAgICAgICAgICAgICAgZW5saXN0bWVudFllYXJcbiAgICAgICAgICAgICAgICBhZGRyZXNzTGluZVxuICAgICAgICAgICAgICAgIGNpdHlcbiAgICAgICAgICAgICAgICBzdGF0ZVxuICAgICAgICAgICAgICAgIHppcENvZGVcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgICAgICBtaWxpdGFyeUR1dHlTdGF0dXNcbiAgICAgICAgICAgICAgICBtaWxpdGFyeUJyYW5jaFxuICAgICAgICAgICAgICAgIG1pbGl0YXJ5QWZmaWxpYXRpb25cbiAgICAgICAgICAgICAgICBtaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gTXV0YXRpb24gdXNlZCB0byB1cGRhdGUgYW4gaW5kaXZpZHVhbCdzIG1pbGl0YXJ5IHZlcmlmaWNhdGlvbiBzdGF0dXMuXG5leHBvcnQgY29uc3QgdXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXMgPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBVcGRhdGVNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1cygkdXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dDogVXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dCEpIHtcbiAgICAgICAgdXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXModXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dDogJHVwZGF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBpZFxuICAgICAgICAgICAgbWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNcbiAgICAgICAgfVxuICAgIH1cbmA7XG4iXX0=