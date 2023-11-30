"use strict";
// This is a file used to define the all GraphQL query constants
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMilitaryVerificationStatus = exports.createMilitaryVerification = exports.deleteCard = exports.addCard = exports.createCardLink = exports.updateTransaction = exports.createTransaction = exports.createNotification = exports.updateDevice = exports.createDevice = exports.createFAQ = exports.updateUserAuthSession = exports.createUserAuthSession = exports.updateNotificationReminder = exports.createNotificationReminder = exports.updateReferral = exports.createReferral = void 0;
// Mutation used to create a Referral.
exports.createReferral = `
    mutation CreateReferral($createReferralInput: CreateReferralInput!) {
        createReferral(createReferralInput: $createReferralInput) {
            errorMessage
            errorType
            data {
                fromId
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTXV0YXRpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2dyYXBocWwvbXV0YXRpb25zL011dGF0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsZ0VBQWdFOzs7QUFFaEUsc0NBQXNDO0FBQ3pCLFFBQUEsY0FBYyxHQUFpQjs7Ozs7Ozs7Ozs7Ozs7O0NBZTNDLENBQUM7QUFFRixnREFBZ0Q7QUFDbkMsUUFBQSxjQUFjLEdBQWlCOzs7Ozs7Ozs7Ozs7Ozs7Q0FlM0MsQ0FBQztBQUVGLHVEQUF1RDtBQUMxQyxRQUFBLDBCQUEwQixHQUFpQjs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQW1CdkQsQ0FBQztBQUVGLDZEQUE2RDtBQUNoRCxRQUFBLDBCQUEwQixHQUFpQjs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQW1CdkQsQ0FBQztBQUVGLG1EQUFtRDtBQUN0QyxRQUFBLHFCQUFxQixHQUFpQjs7Ozs7Ozs7Ozs7OztDQWFsRCxDQUFDO0FBRUYsb0VBQW9FO0FBQ3ZELFFBQUEscUJBQXFCLEdBQWlCOzs7Ozs7Ozs7Ozs7O0NBYWxELENBQUE7QUFFRCxxQ0FBcUM7QUFDeEIsUUFBQSxTQUFTLEdBQWlCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBbUJ0QyxDQUFDO0FBRUYsbUVBQW1FO0FBQ3RELFFBQUEsWUFBWSxHQUFpQjs7Ozs7Ozs7Ozs7OztDQWF6QyxDQUFDO0FBRUYscUVBQXFFO0FBQ3hELFFBQUEsWUFBWSxHQUFpQjs7Ozs7Ozs7Ozs7OztDQWF6QyxDQUFDO0FBRUYsOENBQThDO0FBQ2pDLFFBQUEsa0JBQWtCLEdBQWlCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0F3Qi9DLENBQUM7QUFFRiw2RkFBNkY7QUFDaEYsUUFBQSxpQkFBaUIsR0FBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBZ0M5QyxDQUFDO0FBRUYsbURBQW1EO0FBQ3RDLFFBQUEsaUJBQWlCLEdBQWlCOzs7Ozs7Ozs7Ozs7Ozs7Q0FlOUMsQ0FBQztBQUVGLGlGQUFpRjtBQUNwRSxRQUFBLGNBQWMsR0FBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBdUIzQyxDQUFDO0FBRUYsMkZBQTJGO0FBQzlFLFFBQUEsT0FBTyxHQUFpQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0F1QnBDLENBQUM7QUFFRiwrREFBK0Q7QUFDbEQsUUFBQSxVQUFVLEdBQWlCOzs7Ozs7Ozs7Ozs7Q0FZdkMsQ0FBQztBQUVGLHdFQUF3RTtBQUMzRCxRQUFBLDBCQUEwQixHQUFpQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBd0J2RCxDQUFDO0FBRUYsd0VBQXdFO0FBQzNELFFBQUEsZ0NBQWdDLEdBQWlCOzs7Ozs7Ozs7Q0FTN0QsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8vIFRoaXMgaXMgYSBmaWxlIHVzZWQgdG8gZGVmaW5lIHRoZSBhbGwgR3JhcGhRTCBxdWVyeSBjb25zdGFudHNcblxuLy8gTXV0YXRpb24gdXNlZCB0byBjcmVhdGUgYSBSZWZlcnJhbC5cbmV4cG9ydCBjb25zdCBjcmVhdGVSZWZlcnJhbCA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIG11dGF0aW9uIENyZWF0ZVJlZmVycmFsKCRjcmVhdGVSZWZlcnJhbElucHV0OiBDcmVhdGVSZWZlcnJhbElucHV0ISkge1xuICAgICAgICBjcmVhdGVSZWZlcnJhbChjcmVhdGVSZWZlcnJhbElucHV0OiAkY3JlYXRlUmVmZXJyYWxJbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGZyb21JZFxuICAgICAgICAgICAgICAgIHRvSWRcbiAgICAgICAgICAgICAgICBjYW1wYWlnbkNvZGVcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgICAgICBzdGF0dXNcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIE11dGF0aW9uIHVzZWQgdG8gdXBkYXRlIGEgUmVmZXJyYWwncyBkZXRhaWxzLlxuZXhwb3J0IGNvbnN0IHVwZGF0ZVJlZmVycmFsID0gLyogR3JhcGhRTCAqLyBgXG4gICAgbXV0YXRpb24gVXBkYXRlUmVmZXJyYWwoJHVwZGF0ZVJlZmVycmFsSW5wdXQ6IFVwZGF0ZVJlZmVycmFsSW5wdXQhKSB7XG4gICAgICAgIHVwZGF0ZVJlZmVycmFsKHVwZGF0ZVJlZmVycmFsSW5wdXQ6ICR1cGRhdGVSZWZlcnJhbElucHV0KSB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgZnJvbUlkXG4gICAgICAgICAgICAgICAgdG9JZFxuICAgICAgICAgICAgICAgIGNhbXBhaWduQ29kZVxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgIHN0YXR1c1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gTXV0YXRpb24gdXNlZCB0byBjcmVhdGUgYSBuZXcgTm90aWZpY2F0aW9uIFJlbWluZGVyLlxuZXhwb3J0IGNvbnN0IGNyZWF0ZU5vdGlmaWNhdGlvblJlbWluZGVyID0gLyogR3JhcGhRTCAqLyBgXG4gICAgbXV0YXRpb24gQ3JlYXRlTm90aWZpY2F0aW9uUmVtaW5kZXIoJGNyZWF0ZU5vdGlmaWNhdGlvblJlbWluZGVySW5wdXQ6IENyZWF0ZU5vdGlmaWNhdGlvblJlbWluZGVySW5wdXQhKSB7XG4gICAgICAgIGNyZWF0ZU5vdGlmaWNhdGlvblJlbWluZGVyKGNyZWF0ZU5vdGlmaWNhdGlvblJlbWluZGVySW5wdXQ6ICRjcmVhdGVOb3RpZmljYXRpb25SZW1pbmRlcklucHV0KSB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25SZW1pbmRlclR5cGVcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25SZW1pbmRlclN0YXR1c1xuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvblJlbWluZGVyQ2FkZW5jZVxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgIG5leHRUcmlnZ2VyQXRcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25DaGFubmVsVHlwZVxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvblJlbWluZGVyQ291bnRcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25SZW1pbmRlck1heENvdW50XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIHVwZGF0ZSBhIE5vdGlmaWNhdGlvbiBSZW1pbmRlcidzIGRldGFpbHMuXG5leHBvcnQgY29uc3QgdXBkYXRlTm90aWZpY2F0aW9uUmVtaW5kZXIgPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBVcGRhdGVOb3RpZmljYXRpb25SZW1pbmRlcigkdXBkYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dDogVXBkYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dCEpIHtcbiAgICAgICAgdXBkYXRlTm90aWZpY2F0aW9uUmVtaW5kZXIodXBkYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dDogJHVwZGF0ZU5vdGlmaWNhdGlvblJlbWluZGVySW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvblJlbWluZGVyVHlwZVxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvblJlbWluZGVyU3RhdHVzXG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uUmVtaW5kZXJDYWRlbmNlXG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgbmV4dFRyaWdnZXJBdFxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlXG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uUmVtaW5kZXJDb3VudFxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvblJlbWluZGVyTWF4Q291bnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIE11dGF0aW9uIHVzZWQgdG8gY3JlYXRlIGEgbmV3IFVzZXIgQXV0aCBTZXNzaW9uLlxuZXhwb3J0IGNvbnN0IGNyZWF0ZVVzZXJBdXRoU2Vzc2lvbiA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIG11dGF0aW9uIENyZWF0ZVVzZXJBdXRoU2Vzc2lvbigkY3JlYXRlVXNlckF1dGhTZXNzaW9uSW5wdXQ6IENyZWF0ZVVzZXJBdXRoU2Vzc2lvbklucHV0ISkge1xuICAgICAgICBjcmVhdGVVc2VyQXV0aFNlc3Npb24oY3JlYXRlVXNlckF1dGhTZXNzaW9uSW5wdXQ6ICRjcmVhdGVVc2VyQXV0aFNlc3Npb25JbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgbnVtYmVyT2ZTZXNzaW9uc1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gTXV0YXRpb24gdXNlZCB0byB1cGRhdGUgYSBVc2VyIEF1dGggU2Vzc2lvbidzIGRldGFpbHMgZm9yIGEgdXNlci5cbmV4cG9ydCBjb25zdCB1cGRhdGVVc2VyQXV0aFNlc3Npb24gPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBVcGRhdGVVc2VyQXV0aFNlc3Npb24oJHVwZGF0ZVVzZXJBdXRoU2Vzc2lvbklucHV0OiBVcGRhdGVVc2VyQXV0aFNlc3Npb25JbnB1dCEpIHtcbiAgICAgICAgdXBkYXRlVXNlckF1dGhTZXNzaW9uKHVwZGF0ZVVzZXJBdXRoU2Vzc2lvbklucHV0OiAkdXBkYXRlVXNlckF1dGhTZXNzaW9uSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgIG51bWJlck9mU2Vzc2lvbnNcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmBcblxuLy8gTXV0YXRpb24gdXNlZCB0byBjcmVhdGUgYSBuZXcgRkFRLlxuZXhwb3J0IGNvbnN0IGNyZWF0ZUZBUSA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIG11dGF0aW9uIENyZWF0ZUZBUSgkY3JlYXRlRkFRSW5wdXQ6IENyZWF0ZUZBUUlucHV0ISkge1xuICAgICAgICBjcmVhdGVGQVEoY3JlYXRlRkFRSW5wdXQ6ICRjcmVhdGVGQVFJbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgdGl0bGVcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgICAgICBmYWN0cyB7XG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAgICAgIGxpbmthYmxlS2V5d29yZFxuICAgICAgICAgICAgICAgICAgICBsaW5rTG9jYXRpb25cbiAgICAgICAgICAgICAgICAgICAgdHlwZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIE11dGF0aW9uIHVzZWQgdG8gY3JlYXRlIG9uZSBvciBtb3JlIHBoeXNpY2FsIGRldmljZXMgZm9yIGEgdXNlci5cbmV4cG9ydCBjb25zdCBjcmVhdGVEZXZpY2UgPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBDcmVhdGVEZXZpY2UoJGNyZWF0ZURldmljZUlucHV0OiBDcmVhdGVEZXZpY2VJbnB1dCEpIHtcbiAgICAgICAgY3JlYXRlRGV2aWNlKGNyZWF0ZURldmljZUlucHV0OiAkY3JlYXRlRGV2aWNlSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIHRva2VuSWRcbiAgICAgICAgICAgICAgICBkZXZpY2VTdGF0ZVxuICAgICAgICAgICAgICAgIGxhc3RMb2dpbkRhdGVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIE11dGF0aW9uIHVzZWQgdG8gdXBkYXRlIHRoZSBwaHlzaWNhbCBkZXZpY2VzJyBkZXRhaWxzLCBmb3IgYSB1c2VyLlxuZXhwb3J0IGNvbnN0IHVwZGF0ZURldmljZSA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIG11dGF0aW9uIFVwZGF0ZURldmljZSgkdXBkYXRlRGV2aWNlSW5wdXQ6IFVwZGF0ZURldmljZUlucHV0ISkge1xuICAgICAgICB1cGRhdGVEZXZpY2UodXBkYXRlRGV2aWNlSW5wdXQ6ICR1cGRhdGVEZXZpY2VJbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgdG9rZW5JZFxuICAgICAgICAgICAgICAgIGRldmljZVN0YXRlXG4gICAgICAgICAgICAgICAgbGFzdExvZ2luRGF0ZVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gTXV0YXRpb24gdXNlZCB0byBjcmVhdGUgYSBuZXcgbm90aWZpY2F0aW9uLlxuZXhwb3J0IGNvbnN0IGNyZWF0ZU5vdGlmaWNhdGlvbiA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIG11dGF0aW9uIENyZWF0ZU5vdGlmaWNhdGlvbigkY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQ6IENyZWF0ZU5vdGlmaWNhdGlvbklucHV0ISkge1xuICAgICAgICBjcmVhdGVOb3RpZmljYXRpb24oY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQ6ICRjcmVhdGVOb3RpZmljYXRpb25JbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGlkXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIHRpbWVzdGFtcFxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbklkXG4gICAgICAgICAgICAgICAgZW1haWxEZXN0aW5hdGlvblxuICAgICAgICAgICAgICAgIHVzZXJGdWxsTmFtZVxuICAgICAgICAgICAgICAgIHR5cGVcbiAgICAgICAgICAgICAgICBjaGFubmVsVHlwZVxuICAgICAgICAgICAgICAgIHN0YXR1c1xuICAgICAgICAgICAgICAgIGV4cG9QdXNoVG9rZW5zXG4gICAgICAgICAgICAgICAgcGVuZGluZ0Nhc2hiYWNrXG4gICAgICAgICAgICAgICAgbWVyY2hhbnROYW1lXG4gICAgICAgICAgICAgICAgYWN0aW9uVXJsXG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIGNyZWF0ZSBhIG5ldyB0cmFuc2FjdGlvbiwgYmFzZWQgb24gYW4gaW5jb21pbmcgdHJhbnNhY3Rpb24gbWVzc2FnZS9ldmVudC5cbmV4cG9ydCBjb25zdCBjcmVhdGVUcmFuc2FjdGlvbiA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIG11dGF0aW9uIENyZWF0ZVRyYW5zYWN0aW9uKCRjcmVhdGVUcmFuc2FjdGlvbklucHV0OiBDcmVhdGVUcmFuc2FjdGlvbklucHV0ISkge1xuICAgICAgICBjcmVhdGVUcmFuc2FjdGlvbihjcmVhdGVUcmFuc2FjdGlvbklucHV0OiAkY3JlYXRlVHJhbnNhY3Rpb25JbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGlkXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIHRpbWVzdGFtcFxuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uSWRcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvblN0YXR1c1xuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uVHlwZVxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgIG1lbWJlcklkXG4gICAgICAgICAgICAgICAgY2FyZElkXG4gICAgICAgICAgICAgICAgYnJhbmRJZFxuICAgICAgICAgICAgICAgIHN0b3JlSWRcbiAgICAgICAgICAgICAgICBjYXRlZ29yeVxuICAgICAgICAgICAgICAgIGN1cnJlbmN5Q29kZVxuICAgICAgICAgICAgICAgIHJld2FyZEFtb3VudFxuICAgICAgICAgICAgICAgIHRvdGFsQW1vdW50XG4gICAgICAgICAgICAgICAgcGVuZGluZ0Nhc2hiYWNrQW1vdW50XG4gICAgICAgICAgICAgICAgY3JlZGl0ZWRDYXNoYmFja0Ftb3VudFxuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uQnJhbmROYW1lXG4gICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25CcmFuZEFkZHJlc3NcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbkJyYW5kTG9nb1VybFxuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uQnJhbmRVUkxBZGRyZXNzXG4gICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25Jc09ubGluZVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gTXV0YXRpb24gdXNlZCB0byB1cGRhdGUgYSB0cmFuc2FjdGlvbidzIGRldGFpbHMuXG5leHBvcnQgY29uc3QgdXBkYXRlVHJhbnNhY3Rpb24gPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBVcGRhdGVUcmFuc2FjdGlvbigkdXBkYXRlVHJhbnNhY3Rpb25JbnB1dDogVXBkYXRlVHJhbnNhY3Rpb25JbnB1dCEpIHtcbiAgICAgICAgdXBkYXRlVHJhbnNhY3Rpb24odXBkYXRlVHJhbnNhY3Rpb25JbnB1dDogJHVwZGF0ZVRyYW5zYWN0aW9uSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBpZFxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXBcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbklkXG4gICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25TdGF0dXNcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIE11dGF0aW9uIHVzZWQgdG8gY3JlYXRlIGEgbmV3IGNhcmQgbGluayBmb3IgYSBicmFuZC1uZXcgdXNlciwgd2l0aCBhIG5ldyBjYXJkLlxuZXhwb3J0IGNvbnN0IGNyZWF0ZUNhcmRMaW5rID0gLyogR3JhcGhRTCAqLyBgXG4gICAgbXV0YXRpb24gQ3JlYXRlQ2FyZExpbmsoJGNyZWF0ZUNhcmRMaW5rSW5wdXQ6IENyZWF0ZUNhcmRMaW5rSW5wdXQhKSB7XG4gICAgICAgIGNyZWF0ZUNhcmRMaW5rKGNyZWF0ZUNhcmRMaW5rSW5wdXQ6ICRjcmVhdGVDYXJkTGlua0lucHV0KSB7XG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICBtZW1iZXJJZFxuICAgICAgICAgICAgICAgIGNhcmRzIHtcbiAgICAgICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICAgICAgYXBwbGljYXRpb25JRFxuICAgICAgICAgICAgICAgICAgICB0b2tlblxuICAgICAgICAgICAgICAgICAgICB0eXBlXG4gICAgICAgICAgICAgICAgICAgIG5hbWVcbiAgICAgICAgICAgICAgICAgICAgbGFzdDRcbiAgICAgICAgICAgICAgICAgICAgYWRkaXRpb25hbFByb2dyYW1JRFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgICAgICBzdGF0dXNcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIE11dGF0aW9uIHVzZWQgdG8gYWRkIGEgbmV3IGNhcmQsIHRvIGFuIGV4aXN0aW5nIHVzZXIsIHdpdGhvdXQgY3JlYXRpbmcgYSBicmFuZC1uZXcgdXNlci5cbmV4cG9ydCBjb25zdCBhZGRDYXJkID0gLyogR3JhcGhRTCAqLyBgXG4gICAgbXV0YXRpb24gQWRkQ2FyZCgkYWRkQ2FyZElucHV0OiBBZGRDYXJkSW5wdXQhKSB7XG4gICAgICAgIGFkZENhcmQoYWRkQ2FyZElucHV0OiAkYWRkQ2FyZElucHV0KSB7XG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICBtZW1iZXJJZFxuICAgICAgICAgICAgICAgIGNhcmRzIHtcbiAgICAgICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICAgICAgYXBwbGljYXRpb25JRFxuICAgICAgICAgICAgICAgICAgICB0b2tlblxuICAgICAgICAgICAgICAgICAgICB0eXBlXG4gICAgICAgICAgICAgICAgICAgIG5hbWVcbiAgICAgICAgICAgICAgICAgICAgbGFzdDRcbiAgICAgICAgICAgICAgICAgICAgYWRkaXRpb25hbFByb2dyYW1JRFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgICAgICBzdGF0dXNcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIE11dGF0aW9uIHVzZWQgdG8gcmVtb3ZlIGEgY2FyZCBsaW5rIGZyb20gYSB1c2VyJ3MgY2FyZCBsaW5rLlxuZXhwb3J0IGNvbnN0IGRlbGV0ZUNhcmQgPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBEZWxldGVDYXJkKCRkZWxldGVDYXJkSW5wdXQ6IERlbGV0ZUNhcmRJbnB1dCEpIHtcbiAgICAgICAgZGVsZXRlQ2FyZChkZWxldGVDYXJkSW5wdXQ6ICRkZWxldGVDYXJkSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIGNhcmRJZFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gTXV0YXRpb24gdXNlZCB0byBjcmVhdGUgYW4gaW5kaXZpZHVhbCdzIG1pbGl0YXJ5IHZlcmlmaWNhdGlvbiBvYmplY3QuXG5leHBvcnQgY29uc3QgY3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb24gPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBDcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbigkY3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dDogQ3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dCEpIHtcbiAgICAgICAgY3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb24oY3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dDogJGNyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIGZpcnN0TmFtZVxuICAgICAgICAgICAgICAgIGxhc3ROYW1lXG4gICAgICAgICAgICAgICAgZGF0ZU9mQmlydGhcbiAgICAgICAgICAgICAgICBlbmxpc3RtZW50WWVhclxuICAgICAgICAgICAgICAgIGFkZHJlc3NMaW5lXG4gICAgICAgICAgICAgICAgY2l0eVxuICAgICAgICAgICAgICAgIHN0YXRlXG4gICAgICAgICAgICAgICAgemlwQ29kZVxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgIG1pbGl0YXJ5RHV0eVN0YXR1c1xuICAgICAgICAgICAgICAgIG1pbGl0YXJ5QnJhbmNoXG4gICAgICAgICAgICAgICAgbWlsaXRhcnlBZmZpbGlhdGlvblxuICAgICAgICAgICAgICAgIG1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIHVwZGF0ZSBhbiBpbmRpdmlkdWFsJ3MgbWlsaXRhcnkgdmVyaWZpY2F0aW9uIHN0YXR1cy5cbmV4cG9ydCBjb25zdCB1cGRhdGVNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1cyA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIG11dGF0aW9uIFVwZGF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzKCR1cGRhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0OiBVcGRhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0ISkge1xuICAgICAgICB1cGRhdGVNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1cyh1cGRhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0OiAkdXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGlkXG4gICAgICAgICAgICBtaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1xuICAgICAgICB9XG4gICAgfVxuYDtcbiJdfQ==