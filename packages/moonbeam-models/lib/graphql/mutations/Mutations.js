"use strict";
// This is a file used to define the all GraphQL query constants
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMilitaryVerificationStatus = exports.createMilitaryVerification = exports.deleteCard = exports.addCard = exports.createCardLink = exports.updateTransaction = exports.createTransaction = exports.createNotification = exports.updateDevice = exports.createDevice = exports.createFAQ = exports.updateUserAuthSession = exports.createUserAuthSession = exports.updateNotificationReminder = exports.createNotificationReminder = void 0;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTXV0YXRpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2dyYXBocWwvbXV0YXRpb25zL011dGF0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsZ0VBQWdFOzs7QUFFaEUsdURBQXVEO0FBQzFDLFFBQUEsMEJBQTBCLEdBQWlCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBbUJ2RCxDQUFDO0FBRUYsNkRBQTZEO0FBQ2hELFFBQUEsMEJBQTBCLEdBQWlCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBbUJ2RCxDQUFDO0FBRUYsbURBQW1EO0FBQ3RDLFFBQUEscUJBQXFCLEdBQWlCOzs7Ozs7Ozs7Ozs7O0NBYWxELENBQUM7QUFFRixvRUFBb0U7QUFDdkQsUUFBQSxxQkFBcUIsR0FBaUI7Ozs7Ozs7Ozs7Ozs7Q0FhbEQsQ0FBQTtBQUVELHFDQUFxQztBQUN4QixRQUFBLFNBQVMsR0FBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FtQnRDLENBQUM7QUFFRixtRUFBbUU7QUFDdEQsUUFBQSxZQUFZLEdBQWlCOzs7Ozs7Ozs7Ozs7O0NBYXpDLENBQUM7QUFFRixxRUFBcUU7QUFDeEQsUUFBQSxZQUFZLEdBQWlCOzs7Ozs7Ozs7Ozs7O0NBYXpDLENBQUM7QUFFRiw4Q0FBOEM7QUFDakMsUUFBQSxrQkFBa0IsR0FBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXdCL0MsQ0FBQztBQUVGLDZGQUE2RjtBQUNoRixRQUFBLGlCQUFpQixHQUFpQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FnQzlDLENBQUM7QUFFRixtREFBbUQ7QUFDdEMsUUFBQSxpQkFBaUIsR0FBaUI7Ozs7Ozs7Ozs7Ozs7OztDQWU5QyxDQUFDO0FBRUYsaUZBQWlGO0FBQ3BFLFFBQUEsY0FBYyxHQUFpQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0F1QjNDLENBQUM7QUFFRiwyRkFBMkY7QUFDOUUsUUFBQSxPQUFPLEdBQWlCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXVCcEMsQ0FBQztBQUVGLCtEQUErRDtBQUNsRCxRQUFBLFVBQVUsR0FBaUI7Ozs7Ozs7Ozs7OztDQVl2QyxDQUFDO0FBRUYsd0VBQXdFO0FBQzNELFFBQUEsMEJBQTBCLEdBQWlCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0F3QnZELENBQUM7QUFFRix3RUFBd0U7QUFDM0QsUUFBQSxnQ0FBZ0MsR0FBaUI7Ozs7Ozs7OztDQVM3RCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLy8gVGhpcyBpcyBhIGZpbGUgdXNlZCB0byBkZWZpbmUgdGhlIGFsbCBHcmFwaFFMIHF1ZXJ5IGNvbnN0YW50c1xuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIGNyZWF0ZSBhIG5ldyBOb3RpZmljYXRpb24gUmVtaW5kZXIuXG5leHBvcnQgY29uc3QgY3JlYXRlTm90aWZpY2F0aW9uUmVtaW5kZXIgPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBDcmVhdGVOb3RpZmljYXRpb25SZW1pbmRlcigkY3JlYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dDogQ3JlYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dCEpIHtcbiAgICAgICAgY3JlYXRlTm90aWZpY2F0aW9uUmVtaW5kZXIoY3JlYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dDogJGNyZWF0ZU5vdGlmaWNhdGlvblJlbWluZGVySW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvblJlbWluZGVyVHlwZVxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvblJlbWluZGVyU3RhdHVzXG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uUmVtaW5kZXJDYWRlbmNlXG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgbmV4dFRyaWdnZXJBdFxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlXG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uUmVtaW5kZXJDb3VudFxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvblJlbWluZGVyTWF4Q291bnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIE11dGF0aW9uIHVzZWQgdG8gdXBkYXRlIGEgTm90aWZpY2F0aW9uIFJlbWluZGVyJ3MgZGV0YWlscy5cbmV4cG9ydCBjb25zdCB1cGRhdGVOb3RpZmljYXRpb25SZW1pbmRlciA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIG11dGF0aW9uIFVwZGF0ZU5vdGlmaWNhdGlvblJlbWluZGVyKCR1cGRhdGVOb3RpZmljYXRpb25SZW1pbmRlcklucHV0OiBVcGRhdGVOb3RpZmljYXRpb25SZW1pbmRlcklucHV0ISkge1xuICAgICAgICB1cGRhdGVOb3RpZmljYXRpb25SZW1pbmRlcih1cGRhdGVOb3RpZmljYXRpb25SZW1pbmRlcklucHV0OiAkdXBkYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uUmVtaW5kZXJUeXBlXG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uUmVtaW5kZXJTdGF0dXNcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25SZW1pbmRlckNhZGVuY2VcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgICAgICBuZXh0VHJpZ2dlckF0XG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uQ2hhbm5lbFR5cGVcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25SZW1pbmRlckNvdW50XG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uUmVtaW5kZXJNYXhDb3VudFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gTXV0YXRpb24gdXNlZCB0byBjcmVhdGUgYSBuZXcgVXNlciBBdXRoIFNlc3Npb24uXG5leHBvcnQgY29uc3QgY3JlYXRlVXNlckF1dGhTZXNzaW9uID0gLyogR3JhcGhRTCAqLyBgXG4gICAgbXV0YXRpb24gQ3JlYXRlVXNlckF1dGhTZXNzaW9uKCRjcmVhdGVVc2VyQXV0aFNlc3Npb25JbnB1dDogQ3JlYXRlVXNlckF1dGhTZXNzaW9uSW5wdXQhKSB7XG4gICAgICAgIGNyZWF0ZVVzZXJBdXRoU2Vzc2lvbihjcmVhdGVVc2VyQXV0aFNlc3Npb25JbnB1dDogJGNyZWF0ZVVzZXJBdXRoU2Vzc2lvbklucHV0KSB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgICAgICBudW1iZXJPZlNlc3Npb25zXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIHVwZGF0ZSBhIFVzZXIgQXV0aCBTZXNzaW9uJ3MgZGV0YWlscyBmb3IgYSB1c2VyLlxuZXhwb3J0IGNvbnN0IHVwZGF0ZVVzZXJBdXRoU2Vzc2lvbiA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIG11dGF0aW9uIFVwZGF0ZVVzZXJBdXRoU2Vzc2lvbigkdXBkYXRlVXNlckF1dGhTZXNzaW9uSW5wdXQ6IFVwZGF0ZVVzZXJBdXRoU2Vzc2lvbklucHV0ISkge1xuICAgICAgICB1cGRhdGVVc2VyQXV0aFNlc3Npb24odXBkYXRlVXNlckF1dGhTZXNzaW9uSW5wdXQ6ICR1cGRhdGVVc2VyQXV0aFNlc3Npb25JbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgbnVtYmVyT2ZTZXNzaW9uc1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYFxuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIGNyZWF0ZSBhIG5ldyBGQVEuXG5leHBvcnQgY29uc3QgY3JlYXRlRkFRID0gLyogR3JhcGhRTCAqLyBgXG4gICAgbXV0YXRpb24gQ3JlYXRlRkFRKCRjcmVhdGVGQVFJbnB1dDogQ3JlYXRlRkFRSW5wdXQhKSB7XG4gICAgICAgIGNyZWF0ZUZBUShjcmVhdGVGQVFJbnB1dDogJGNyZWF0ZUZBUUlucHV0KSB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICB0aXRsZVxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgIGZhY3RzIHtcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICAgICAgbGlua2FibGVLZXl3b3JkXG4gICAgICAgICAgICAgICAgICAgIGxpbmtMb2NhdGlvblxuICAgICAgICAgICAgICAgICAgICB0eXBlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gTXV0YXRpb24gdXNlZCB0byBjcmVhdGUgb25lIG9yIG1vcmUgcGh5c2ljYWwgZGV2aWNlcyBmb3IgYSB1c2VyLlxuZXhwb3J0IGNvbnN0IGNyZWF0ZURldmljZSA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIG11dGF0aW9uIENyZWF0ZURldmljZSgkY3JlYXRlRGV2aWNlSW5wdXQ6IENyZWF0ZURldmljZUlucHV0ISkge1xuICAgICAgICBjcmVhdGVEZXZpY2UoY3JlYXRlRGV2aWNlSW5wdXQ6ICRjcmVhdGVEZXZpY2VJbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgdG9rZW5JZFxuICAgICAgICAgICAgICAgIGRldmljZVN0YXRlXG4gICAgICAgICAgICAgICAgbGFzdExvZ2luRGF0ZVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gTXV0YXRpb24gdXNlZCB0byB1cGRhdGUgdGhlIHBoeXNpY2FsIGRldmljZXMnIGRldGFpbHMsIGZvciBhIHVzZXIuXG5leHBvcnQgY29uc3QgdXBkYXRlRGV2aWNlID0gLyogR3JhcGhRTCAqLyBgXG4gICAgbXV0YXRpb24gVXBkYXRlRGV2aWNlKCR1cGRhdGVEZXZpY2VJbnB1dDogVXBkYXRlRGV2aWNlSW5wdXQhKSB7XG4gICAgICAgIHVwZGF0ZURldmljZSh1cGRhdGVEZXZpY2VJbnB1dDogJHVwZGF0ZURldmljZUlucHV0KSB7XG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICB0b2tlbklkXG4gICAgICAgICAgICAgICAgZGV2aWNlU3RhdGVcbiAgICAgICAgICAgICAgICBsYXN0TG9naW5EYXRlXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIGNyZWF0ZSBhIG5ldyBub3RpZmljYXRpb24uXG5leHBvcnQgY29uc3QgY3JlYXRlTm90aWZpY2F0aW9uID0gLyogR3JhcGhRTCAqLyBgXG4gICAgbXV0YXRpb24gQ3JlYXRlTm90aWZpY2F0aW9uKCRjcmVhdGVOb3RpZmljYXRpb25JbnB1dDogQ3JlYXRlTm90aWZpY2F0aW9uSW5wdXQhKSB7XG4gICAgICAgIGNyZWF0ZU5vdGlmaWNhdGlvbihjcmVhdGVOb3RpZmljYXRpb25JbnB1dDogJGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0KSB7XG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgaWRcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgdGltZXN0YW1wXG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uSWRcbiAgICAgICAgICAgICAgICBlbWFpbERlc3RpbmF0aW9uXG4gICAgICAgICAgICAgICAgdXNlckZ1bGxOYW1lXG4gICAgICAgICAgICAgICAgdHlwZVxuICAgICAgICAgICAgICAgIGNoYW5uZWxUeXBlXG4gICAgICAgICAgICAgICAgc3RhdHVzXG4gICAgICAgICAgICAgICAgZXhwb1B1c2hUb2tlbnNcbiAgICAgICAgICAgICAgICBwZW5kaW5nQ2FzaGJhY2tcbiAgICAgICAgICAgICAgICBtZXJjaGFudE5hbWVcbiAgICAgICAgICAgICAgICBhY3Rpb25VcmxcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIE11dGF0aW9uIHVzZWQgdG8gY3JlYXRlIGEgbmV3IHRyYW5zYWN0aW9uLCBiYXNlZCBvbiBhbiBpbmNvbWluZyB0cmFuc2FjdGlvbiBtZXNzYWdlL2V2ZW50LlxuZXhwb3J0IGNvbnN0IGNyZWF0ZVRyYW5zYWN0aW9uID0gLyogR3JhcGhRTCAqLyBgXG4gICAgbXV0YXRpb24gQ3JlYXRlVHJhbnNhY3Rpb24oJGNyZWF0ZVRyYW5zYWN0aW9uSW5wdXQ6IENyZWF0ZVRyYW5zYWN0aW9uSW5wdXQhKSB7XG4gICAgICAgIGNyZWF0ZVRyYW5zYWN0aW9uKGNyZWF0ZVRyYW5zYWN0aW9uSW5wdXQ6ICRjcmVhdGVUcmFuc2FjdGlvbklucHV0KSB7XG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgaWRcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgdGltZXN0YW1wXG4gICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25JZFxuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uU3RhdHVzXG4gICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25UeXBlXG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgbWVtYmVySWRcbiAgICAgICAgICAgICAgICBjYXJkSWRcbiAgICAgICAgICAgICAgICBicmFuZElkXG4gICAgICAgICAgICAgICAgc3RvcmVJZFxuICAgICAgICAgICAgICAgIGNhdGVnb3J5XG4gICAgICAgICAgICAgICAgY3VycmVuY3lDb2RlXG4gICAgICAgICAgICAgICAgcmV3YXJkQW1vdW50XG4gICAgICAgICAgICAgICAgdG90YWxBbW91bnRcbiAgICAgICAgICAgICAgICBwZW5kaW5nQ2FzaGJhY2tBbW91bnRcbiAgICAgICAgICAgICAgICBjcmVkaXRlZENhc2hiYWNrQW1vdW50XG4gICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25CcmFuZE5hbWVcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbkJyYW5kQWRkcmVzc1xuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uQnJhbmRMb2dvVXJsXG4gICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25CcmFuZFVSTEFkZHJlc3NcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbklzT25saW5lXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIHVwZGF0ZSBhIHRyYW5zYWN0aW9uJ3MgZGV0YWlscy5cbmV4cG9ydCBjb25zdCB1cGRhdGVUcmFuc2FjdGlvbiA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIG11dGF0aW9uIFVwZGF0ZVRyYW5zYWN0aW9uKCR1cGRhdGVUcmFuc2FjdGlvbklucHV0OiBVcGRhdGVUcmFuc2FjdGlvbklucHV0ISkge1xuICAgICAgICB1cGRhdGVUcmFuc2FjdGlvbih1cGRhdGVUcmFuc2FjdGlvbklucHV0OiAkdXBkYXRlVHJhbnNhY3Rpb25JbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGlkXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIHRpbWVzdGFtcFxuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uSWRcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvblN0YXR1c1xuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gTXV0YXRpb24gdXNlZCB0byBjcmVhdGUgYSBuZXcgY2FyZCBsaW5rIGZvciBhIGJyYW5kLW5ldyB1c2VyLCB3aXRoIGEgbmV3IGNhcmQuXG5leHBvcnQgY29uc3QgY3JlYXRlQ2FyZExpbmsgPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBDcmVhdGVDYXJkTGluaygkY3JlYXRlQ2FyZExpbmtJbnB1dDogQ3JlYXRlQ2FyZExpbmtJbnB1dCEpIHtcbiAgICAgICAgY3JlYXRlQ2FyZExpbmsoY3JlYXRlQ2FyZExpbmtJbnB1dDogJGNyZWF0ZUNhcmRMaW5rSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIG1lbWJlcklkXG4gICAgICAgICAgICAgICAgY2FyZHMge1xuICAgICAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgICAgICBhcHBsaWNhdGlvbklEXG4gICAgICAgICAgICAgICAgICAgIHRva2VuXG4gICAgICAgICAgICAgICAgICAgIHR5cGVcbiAgICAgICAgICAgICAgICAgICAgbmFtZVxuICAgICAgICAgICAgICAgICAgICBsYXN0NFxuICAgICAgICAgICAgICAgICAgICBhZGRpdGlvbmFsUHJvZ3JhbUlEXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgIHN0YXR1c1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gTXV0YXRpb24gdXNlZCB0byBhZGQgYSBuZXcgY2FyZCwgdG8gYW4gZXhpc3RpbmcgdXNlciwgd2l0aG91dCBjcmVhdGluZyBhIGJyYW5kLW5ldyB1c2VyLlxuZXhwb3J0IGNvbnN0IGFkZENhcmQgPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBBZGRDYXJkKCRhZGRDYXJkSW5wdXQ6IEFkZENhcmRJbnB1dCEpIHtcbiAgICAgICAgYWRkQ2FyZChhZGRDYXJkSW5wdXQ6ICRhZGRDYXJkSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIG1lbWJlcklkXG4gICAgICAgICAgICAgICAgY2FyZHMge1xuICAgICAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgICAgICBhcHBsaWNhdGlvbklEXG4gICAgICAgICAgICAgICAgICAgIHRva2VuXG4gICAgICAgICAgICAgICAgICAgIHR5cGVcbiAgICAgICAgICAgICAgICAgICAgbmFtZVxuICAgICAgICAgICAgICAgICAgICBsYXN0NFxuICAgICAgICAgICAgICAgICAgICBhZGRpdGlvbmFsUHJvZ3JhbUlEXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgIHN0YXR1c1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gTXV0YXRpb24gdXNlZCB0byByZW1vdmUgYSBjYXJkIGxpbmsgZnJvbSBhIHVzZXIncyBjYXJkIGxpbmsuXG5leHBvcnQgY29uc3QgZGVsZXRlQ2FyZCA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIG11dGF0aW9uIERlbGV0ZUNhcmQoJGRlbGV0ZUNhcmRJbnB1dDogRGVsZXRlQ2FyZElucHV0ISkge1xuICAgICAgICBkZWxldGVDYXJkKGRlbGV0ZUNhcmRJbnB1dDogJGRlbGV0ZUNhcmRJbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgY2FyZElkXG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIGNyZWF0ZSBhbiBpbmRpdmlkdWFsJ3MgbWlsaXRhcnkgdmVyaWZpY2F0aW9uIG9iamVjdC5cbmV4cG9ydCBjb25zdCBjcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbiA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIG11dGF0aW9uIENyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uKCRjcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0OiBDcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0ISkge1xuICAgICAgICBjcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbihjcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0OiAkY3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgZmlyc3ROYW1lXG4gICAgICAgICAgICAgICAgbGFzdE5hbWVcbiAgICAgICAgICAgICAgICBkYXRlT2ZCaXJ0aFxuICAgICAgICAgICAgICAgIGVubGlzdG1lbnRZZWFyXG4gICAgICAgICAgICAgICAgYWRkcmVzc0xpbmVcbiAgICAgICAgICAgICAgICBjaXR5XG4gICAgICAgICAgICAgICAgc3RhdGVcbiAgICAgICAgICAgICAgICB6aXBDb2RlXG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgbWlsaXRhcnlEdXR5U3RhdHVzXG4gICAgICAgICAgICAgICAgbWlsaXRhcnlCcmFuY2hcbiAgICAgICAgICAgICAgICBtaWxpdGFyeUFmZmlsaWF0aW9uXG4gICAgICAgICAgICAgICAgbWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIE11dGF0aW9uIHVzZWQgdG8gdXBkYXRlIGFuIGluZGl2aWR1YWwncyBtaWxpdGFyeSB2ZXJpZmljYXRpb24gc3RhdHVzLlxuZXhwb3J0IGNvbnN0IHVwZGF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzID0gLyogR3JhcGhRTCAqLyBgXG4gICAgbXV0YXRpb24gVXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXMoJHVwZGF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQ6IFVwZGF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQhKSB7XG4gICAgICAgIHVwZGF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzKHVwZGF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQ6ICR1cGRhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0KSB7XG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgaWRcbiAgICAgICAgICAgIG1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzXG4gICAgICAgIH1cbiAgICB9XG5gO1xuIl19