"use strict";
// This is a file used to define the all GraphQL query constants
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMilitaryVerificationStatus = exports.createMilitaryVerification = exports.deleteCard = exports.addCard = exports.createCardLink = exports.updateTransaction = exports.createTransaction = exports.createNotification = exports.updateDevice = exports.createDevice = exports.createFAQ = exports.updateUserAuthSession = exports.createUserAuthSession = exports.createNotificationReminder = void 0;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTXV0YXRpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2dyYXBocWwvbXV0YXRpb25zL011dGF0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsZ0VBQWdFOzs7QUFFaEUsdURBQXVEO0FBQzFDLFFBQUEsMEJBQTBCLEdBQWlCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FrQnZELENBQUM7QUFFRixtREFBbUQ7QUFDdEMsUUFBQSxxQkFBcUIsR0FBaUI7Ozs7Ozs7Ozs7Ozs7Q0FhbEQsQ0FBQztBQUVGLG9FQUFvRTtBQUN2RCxRQUFBLHFCQUFxQixHQUFpQjs7Ozs7Ozs7Ozs7OztDQWFsRCxDQUFBO0FBRUQscUNBQXFDO0FBQ3hCLFFBQUEsU0FBUyxHQUFpQjs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQW1CdEMsQ0FBQztBQUVGLG1FQUFtRTtBQUN0RCxRQUFBLFlBQVksR0FBaUI7Ozs7Ozs7Ozs7Ozs7Q0FhekMsQ0FBQztBQUVGLHFFQUFxRTtBQUN4RCxRQUFBLFlBQVksR0FBaUI7Ozs7Ozs7Ozs7Ozs7Q0FhekMsQ0FBQztBQUVGLDhDQUE4QztBQUNqQyxRQUFBLGtCQUFrQixHQUFpQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBd0IvQyxDQUFDO0FBRUYsNkZBQTZGO0FBQ2hGLFFBQUEsaUJBQWlCLEdBQWlCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQWdDOUMsQ0FBQztBQUVGLG1EQUFtRDtBQUN0QyxRQUFBLGlCQUFpQixHQUFpQjs7Ozs7Ozs7Ozs7Ozs7O0NBZTlDLENBQUM7QUFFRixpRkFBaUY7QUFDcEUsUUFBQSxjQUFjLEdBQWlCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXVCM0MsQ0FBQztBQUVGLDJGQUEyRjtBQUM5RSxRQUFBLE9BQU8sR0FBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBdUJwQyxDQUFDO0FBRUYsK0RBQStEO0FBQ2xELFFBQUEsVUFBVSxHQUFpQjs7Ozs7Ozs7Ozs7O0NBWXZDLENBQUM7QUFFRix3RUFBd0U7QUFDM0QsUUFBQSwwQkFBMEIsR0FBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXdCdkQsQ0FBQztBQUVGLHdFQUF3RTtBQUMzRCxRQUFBLGdDQUFnQyxHQUFpQjs7Ozs7Ozs7O0NBUzdELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBUaGlzIGlzIGEgZmlsZSB1c2VkIHRvIGRlZmluZSB0aGUgYWxsIEdyYXBoUUwgcXVlcnkgY29uc3RhbnRzXG5cbi8vIE11dGF0aW9uIHVzZWQgdG8gY3JlYXRlIGEgbmV3IE5vdGlmaWNhdGlvbiBSZW1pbmRlci5cbmV4cG9ydCBjb25zdCBjcmVhdGVOb3RpZmljYXRpb25SZW1pbmRlciA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIG11dGF0aW9uIENyZWF0ZU5vdGlmaWNhdGlvblJlbWluZGVyKCRjcmVhdGVOb3RpZmljYXRpb25SZW1pbmRlcklucHV0OiBDcmVhdGVOb3RpZmljYXRpb25SZW1pbmRlcklucHV0ISkge1xuICAgICAgICBjcmVhdGVOb3RpZmljYXRpb25SZW1pbmRlcihjcmVhdGVOb3RpZmljYXRpb25SZW1pbmRlcklucHV0OiAkY3JlYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uUmVtaW5kZXJUeXBlXG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uUmVtaW5kZXJTdGF0dXNcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25SZW1pbmRlckNhZGVuY2VcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgICAgICBuZXh0VHJpZ2dlckF0XG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uQ2hhbm5lbFR5cGVcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25SZW1pbmRlckNvdW50XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIGNyZWF0ZSBhIG5ldyBVc2VyIEF1dGggU2Vzc2lvbi5cbmV4cG9ydCBjb25zdCBjcmVhdGVVc2VyQXV0aFNlc3Npb24gPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBDcmVhdGVVc2VyQXV0aFNlc3Npb24oJGNyZWF0ZVVzZXJBdXRoU2Vzc2lvbklucHV0OiBDcmVhdGVVc2VyQXV0aFNlc3Npb25JbnB1dCEpIHtcbiAgICAgICAgY3JlYXRlVXNlckF1dGhTZXNzaW9uKGNyZWF0ZVVzZXJBdXRoU2Vzc2lvbklucHV0OiAkY3JlYXRlVXNlckF1dGhTZXNzaW9uSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgIG51bWJlck9mU2Vzc2lvbnNcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIE11dGF0aW9uIHVzZWQgdG8gdXBkYXRlIGEgVXNlciBBdXRoIFNlc3Npb24ncyBkZXRhaWxzIGZvciBhIHVzZXIuXG5leHBvcnQgY29uc3QgdXBkYXRlVXNlckF1dGhTZXNzaW9uID0gLyogR3JhcGhRTCAqLyBgXG4gICAgbXV0YXRpb24gVXBkYXRlVXNlckF1dGhTZXNzaW9uKCR1cGRhdGVVc2VyQXV0aFNlc3Npb25JbnB1dDogVXBkYXRlVXNlckF1dGhTZXNzaW9uSW5wdXQhKSB7XG4gICAgICAgIHVwZGF0ZVVzZXJBdXRoU2Vzc2lvbih1cGRhdGVVc2VyQXV0aFNlc3Npb25JbnB1dDogJHVwZGF0ZVVzZXJBdXRoU2Vzc2lvbklucHV0KSB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgICAgICBudW1iZXJPZlNlc3Npb25zXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gXG5cbi8vIE11dGF0aW9uIHVzZWQgdG8gY3JlYXRlIGEgbmV3IEZBUS5cbmV4cG9ydCBjb25zdCBjcmVhdGVGQVEgPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBDcmVhdGVGQVEoJGNyZWF0ZUZBUUlucHV0OiBDcmVhdGVGQVFJbnB1dCEpIHtcbiAgICAgICAgY3JlYXRlRkFRKGNyZWF0ZUZBUUlucHV0OiAkY3JlYXRlRkFRSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIHRpdGxlXG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgZmFjdHMge1xuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgICAgICBsaW5rYWJsZUtleXdvcmRcbiAgICAgICAgICAgICAgICAgICAgbGlua0xvY2F0aW9uXG4gICAgICAgICAgICAgICAgICAgIHR5cGVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIGNyZWF0ZSBvbmUgb3IgbW9yZSBwaHlzaWNhbCBkZXZpY2VzIGZvciBhIHVzZXIuXG5leHBvcnQgY29uc3QgY3JlYXRlRGV2aWNlID0gLyogR3JhcGhRTCAqLyBgXG4gICAgbXV0YXRpb24gQ3JlYXRlRGV2aWNlKCRjcmVhdGVEZXZpY2VJbnB1dDogQ3JlYXRlRGV2aWNlSW5wdXQhKSB7XG4gICAgICAgIGNyZWF0ZURldmljZShjcmVhdGVEZXZpY2VJbnB1dDogJGNyZWF0ZURldmljZUlucHV0KSB7XG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICB0b2tlbklkXG4gICAgICAgICAgICAgICAgZGV2aWNlU3RhdGVcbiAgICAgICAgICAgICAgICBsYXN0TG9naW5EYXRlXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIHVwZGF0ZSB0aGUgcGh5c2ljYWwgZGV2aWNlcycgZGV0YWlscywgZm9yIGEgdXNlci5cbmV4cG9ydCBjb25zdCB1cGRhdGVEZXZpY2UgPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBVcGRhdGVEZXZpY2UoJHVwZGF0ZURldmljZUlucHV0OiBVcGRhdGVEZXZpY2VJbnB1dCEpIHtcbiAgICAgICAgdXBkYXRlRGV2aWNlKHVwZGF0ZURldmljZUlucHV0OiAkdXBkYXRlRGV2aWNlSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIHRva2VuSWRcbiAgICAgICAgICAgICAgICBkZXZpY2VTdGF0ZVxuICAgICAgICAgICAgICAgIGxhc3RMb2dpbkRhdGVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIE11dGF0aW9uIHVzZWQgdG8gY3JlYXRlIGEgbmV3IG5vdGlmaWNhdGlvbi5cbmV4cG9ydCBjb25zdCBjcmVhdGVOb3RpZmljYXRpb24gPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBDcmVhdGVOb3RpZmljYXRpb24oJGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0OiBDcmVhdGVOb3RpZmljYXRpb25JbnB1dCEpIHtcbiAgICAgICAgY3JlYXRlTm90aWZpY2F0aW9uKGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0OiAkY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBpZFxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXBcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25JZFxuICAgICAgICAgICAgICAgIGVtYWlsRGVzdGluYXRpb25cbiAgICAgICAgICAgICAgICB1c2VyRnVsbE5hbWVcbiAgICAgICAgICAgICAgICB0eXBlXG4gICAgICAgICAgICAgICAgY2hhbm5lbFR5cGVcbiAgICAgICAgICAgICAgICBzdGF0dXNcbiAgICAgICAgICAgICAgICBleHBvUHVzaFRva2Vuc1xuICAgICAgICAgICAgICAgIHBlbmRpbmdDYXNoYmFja1xuICAgICAgICAgICAgICAgIG1lcmNoYW50TmFtZVxuICAgICAgICAgICAgICAgIGFjdGlvblVybFxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gTXV0YXRpb24gdXNlZCB0byBjcmVhdGUgYSBuZXcgdHJhbnNhY3Rpb24sIGJhc2VkIG9uIGFuIGluY29taW5nIHRyYW5zYWN0aW9uIG1lc3NhZ2UvZXZlbnQuXG5leHBvcnQgY29uc3QgY3JlYXRlVHJhbnNhY3Rpb24gPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBDcmVhdGVUcmFuc2FjdGlvbigkY3JlYXRlVHJhbnNhY3Rpb25JbnB1dDogQ3JlYXRlVHJhbnNhY3Rpb25JbnB1dCEpIHtcbiAgICAgICAgY3JlYXRlVHJhbnNhY3Rpb24oY3JlYXRlVHJhbnNhY3Rpb25JbnB1dDogJGNyZWF0ZVRyYW5zYWN0aW9uSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBpZFxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXBcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbklkXG4gICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25TdGF0dXNcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvblR5cGVcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgICAgICBtZW1iZXJJZFxuICAgICAgICAgICAgICAgIGNhcmRJZFxuICAgICAgICAgICAgICAgIGJyYW5kSWRcbiAgICAgICAgICAgICAgICBzdG9yZUlkXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnlcbiAgICAgICAgICAgICAgICBjdXJyZW5jeUNvZGVcbiAgICAgICAgICAgICAgICByZXdhcmRBbW91bnRcbiAgICAgICAgICAgICAgICB0b3RhbEFtb3VudFxuICAgICAgICAgICAgICAgIHBlbmRpbmdDYXNoYmFja0Ftb3VudFxuICAgICAgICAgICAgICAgIGNyZWRpdGVkQ2FzaGJhY2tBbW91bnRcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbkJyYW5kTmFtZVxuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uQnJhbmRBZGRyZXNzXG4gICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25CcmFuZExvZ29VcmxcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbkJyYW5kVVJMQWRkcmVzc1xuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uSXNPbmxpbmVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIE11dGF0aW9uIHVzZWQgdG8gdXBkYXRlIGEgdHJhbnNhY3Rpb24ncyBkZXRhaWxzLlxuZXhwb3J0IGNvbnN0IHVwZGF0ZVRyYW5zYWN0aW9uID0gLyogR3JhcGhRTCAqLyBgXG4gICAgbXV0YXRpb24gVXBkYXRlVHJhbnNhY3Rpb24oJHVwZGF0ZVRyYW5zYWN0aW9uSW5wdXQ6IFVwZGF0ZVRyYW5zYWN0aW9uSW5wdXQhKSB7XG4gICAgICAgIHVwZGF0ZVRyYW5zYWN0aW9uKHVwZGF0ZVRyYW5zYWN0aW9uSW5wdXQ6ICR1cGRhdGVUcmFuc2FjdGlvbklucHV0KSB7XG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgaWRcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgdGltZXN0YW1wXG4gICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25JZFxuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uU3RhdHVzXG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIGNyZWF0ZSBhIG5ldyBjYXJkIGxpbmsgZm9yIGEgYnJhbmQtbmV3IHVzZXIsIHdpdGggYSBuZXcgY2FyZC5cbmV4cG9ydCBjb25zdCBjcmVhdGVDYXJkTGluayA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIG11dGF0aW9uIENyZWF0ZUNhcmRMaW5rKCRjcmVhdGVDYXJkTGlua0lucHV0OiBDcmVhdGVDYXJkTGlua0lucHV0ISkge1xuICAgICAgICBjcmVhdGVDYXJkTGluayhjcmVhdGVDYXJkTGlua0lucHV0OiAkY3JlYXRlQ2FyZExpbmtJbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgbWVtYmVySWRcbiAgICAgICAgICAgICAgICBjYXJkcyB7XG4gICAgICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgICAgIGFwcGxpY2F0aW9uSURcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5cbiAgICAgICAgICAgICAgICAgICAgdHlwZVxuICAgICAgICAgICAgICAgICAgICBuYW1lXG4gICAgICAgICAgICAgICAgICAgIGxhc3Q0XG4gICAgICAgICAgICAgICAgICAgIGFkZGl0aW9uYWxQcm9ncmFtSURcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgc3RhdHVzXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIGFkZCBhIG5ldyBjYXJkLCB0byBhbiBleGlzdGluZyB1c2VyLCB3aXRob3V0IGNyZWF0aW5nIGEgYnJhbmQtbmV3IHVzZXIuXG5leHBvcnQgY29uc3QgYWRkQ2FyZCA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIG11dGF0aW9uIEFkZENhcmQoJGFkZENhcmRJbnB1dDogQWRkQ2FyZElucHV0ISkge1xuICAgICAgICBhZGRDYXJkKGFkZENhcmRJbnB1dDogJGFkZENhcmRJbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgbWVtYmVySWRcbiAgICAgICAgICAgICAgICBjYXJkcyB7XG4gICAgICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgICAgIGFwcGxpY2F0aW9uSURcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5cbiAgICAgICAgICAgICAgICAgICAgdHlwZVxuICAgICAgICAgICAgICAgICAgICBuYW1lXG4gICAgICAgICAgICAgICAgICAgIGxhc3Q0XG4gICAgICAgICAgICAgICAgICAgIGFkZGl0aW9uYWxQcm9ncmFtSURcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgc3RhdHVzXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIHJlbW92ZSBhIGNhcmQgbGluayBmcm9tIGEgdXNlcidzIGNhcmQgbGluay5cbmV4cG9ydCBjb25zdCBkZWxldGVDYXJkID0gLyogR3JhcGhRTCAqLyBgXG4gICAgbXV0YXRpb24gRGVsZXRlQ2FyZCgkZGVsZXRlQ2FyZElucHV0OiBEZWxldGVDYXJkSW5wdXQhKSB7XG4gICAgICAgIGRlbGV0ZUNhcmQoZGVsZXRlQ2FyZElucHV0OiAkZGVsZXRlQ2FyZElucHV0KSB7XG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICBjYXJkSWRcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIE11dGF0aW9uIHVzZWQgdG8gY3JlYXRlIGFuIGluZGl2aWR1YWwncyBtaWxpdGFyeSB2ZXJpZmljYXRpb24gb2JqZWN0LlxuZXhwb3J0IGNvbnN0IGNyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uID0gLyogR3JhcGhRTCAqLyBgXG4gICAgbXV0YXRpb24gQ3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb24oJGNyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQ6IENyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQhKSB7XG4gICAgICAgIGNyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uKGNyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQ6ICRjcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0KSB7XG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICBmaXJzdE5hbWVcbiAgICAgICAgICAgICAgICBsYXN0TmFtZVxuICAgICAgICAgICAgICAgIGRhdGVPZkJpcnRoXG4gICAgICAgICAgICAgICAgZW5saXN0bWVudFllYXJcbiAgICAgICAgICAgICAgICBhZGRyZXNzTGluZVxuICAgICAgICAgICAgICAgIGNpdHlcbiAgICAgICAgICAgICAgICBzdGF0ZVxuICAgICAgICAgICAgICAgIHppcENvZGVcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgICAgICBtaWxpdGFyeUR1dHlTdGF0dXNcbiAgICAgICAgICAgICAgICBtaWxpdGFyeUJyYW5jaFxuICAgICAgICAgICAgICAgIG1pbGl0YXJ5QWZmaWxpYXRpb25cbiAgICAgICAgICAgICAgICBtaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gTXV0YXRpb24gdXNlZCB0byB1cGRhdGUgYW4gaW5kaXZpZHVhbCdzIG1pbGl0YXJ5IHZlcmlmaWNhdGlvbiBzdGF0dXMuXG5leHBvcnQgY29uc3QgdXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXMgPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBVcGRhdGVNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1cygkdXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dDogVXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dCEpIHtcbiAgICAgICAgdXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXModXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dDogJHVwZGF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBpZFxuICAgICAgICAgICAgbWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNcbiAgICAgICAgfVxuICAgIH1cbmA7XG4iXX0=