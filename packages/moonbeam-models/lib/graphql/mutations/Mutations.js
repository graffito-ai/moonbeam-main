"use strict";
// This is a file used to define the all GraphQL query constants
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMilitaryVerificationStatus = exports.createMilitaryVerification = exports.deleteCard = exports.addCard = exports.createCardLink = exports.updateTransaction = exports.createTransaction = exports.updateReimbursement = exports.createReimbursement = exports.updateReimbursementEligibility = exports.createReimbursementEligibility = exports.createNotification = exports.updateDevice = exports.createDevice = exports.createFAQ = void 0;
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
// Mutation used to create a new reimbursement eligibility.
exports.createReimbursementEligibility = `
    mutation CreateReimbursementEligibility($createReimbursementEligibilityInput: CreateReimbursementEligibilityInput!) {
        createReimbursementEligibility(createReimbursementEligibilityInput: $createReimbursementEligibilityInput) {
            errorType
            errorMessage
            id
            data {
                id
                eligibilityStatus
                createdAt
                updatedAt
            }
        }
    }
`;
// Mutation used to update a reimbursement eligibility's details.
exports.updateReimbursementEligibility = `
    mutation UpdateReimbursementEligibility($updateReimbursementEligibilityInput: UpdateReimbursementEligibilityInput!) {
        updateReimbursementEligibility(updateReimbursementEligibilityInput: $updateReimbursementEligibilityInput) {
            errorType
            errorMessage
            id
            data {
                id
                eligibilityStatus
                updatedAt
            }
        }
    }
`;
// Mutation used to create a new reimbursement.
exports.createReimbursement = `
    mutation CreateReimbursement($createReimbursementInput: CreateReimbursementInput!) {
        createReimbursement(createReimbursementInput: $createReimbursementInput) {
            errorType
            errorMessage
            id
            data {
                id
                timestamp
                reimbursementId
                clientId
                paymentGatewayId
                succeeded
                processingMessage
                cardId
                reimbursementStatus
                pendingCashbackAmount
                creditedCashbackAmount
                currencyCode
                transactions {
                    id
                    timestamp
                    transactionId
                    transactionStatus
                }
                createdAt
                updatedAt
            }
        }
    }
`;
// Mutation used to update a reimbursement's details.
exports.updateReimbursement = `
    mutation UpdateReimbursement($updateReimbursementInput: UpdateReimbursementInput!) {
        updateReimbursement(updateReimbursementInput: $updateReimbursementInput) {
            errorType
            errorMessage
            id
            data {
                id
                timestamp
                reimbursementId
                clientId
                paymentGatewayId
                succeeded
                processingMessage
                cardId
                reimbursementStatus
                pendingCashbackAmount
                creditedCashbackAmount
                currencyCode
                transactions {
                    id
                    timestamp
                    transactionId
                    transactionStatus
                }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTXV0YXRpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2dyYXBocWwvbXV0YXRpb25zL011dGF0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsZ0VBQWdFOzs7QUFFaEUscUNBQXFDO0FBQ3hCLFFBQUEsU0FBUyxHQUFpQjs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQW1CdEMsQ0FBQztBQUVGLG1FQUFtRTtBQUN0RCxRQUFBLFlBQVksR0FBaUI7Ozs7Ozs7Ozs7Ozs7Q0FhekMsQ0FBQztBQUVGLHFFQUFxRTtBQUN4RCxRQUFBLFlBQVksR0FBaUI7Ozs7Ozs7Ozs7Ozs7Q0FhekMsQ0FBQztBQUVGLDhDQUE4QztBQUNqQyxRQUFBLGtCQUFrQixHQUFpQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBd0IvQyxDQUFDO0FBRUYsMkRBQTJEO0FBQzlDLFFBQUEsOEJBQThCLEdBQWlCOzs7Ozs7Ozs7Ozs7OztDQWMzRCxDQUFDO0FBRUYsaUVBQWlFO0FBQ3BELFFBQUEsOEJBQThCLEdBQWlCOzs7Ozs7Ozs7Ozs7O0NBYTNELENBQUM7QUFFRiwrQ0FBK0M7QUFDbEMsUUFBQSxtQkFBbUIsR0FBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQThCaEQsQ0FBQztBQUVGLHFEQUFxRDtBQUN4QyxRQUFBLG1CQUFtQixHQUFpQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBOEJoRCxDQUFDO0FBRUYsNkZBQTZGO0FBQ2hGLFFBQUEsaUJBQWlCLEdBQWlCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQWdDOUMsQ0FBQztBQUVGLG1EQUFtRDtBQUN0QyxRQUFBLGlCQUFpQixHQUFpQjs7Ozs7Ozs7Ozs7Ozs7O0NBZTlDLENBQUM7QUFFRixpRkFBaUY7QUFDcEUsUUFBQSxjQUFjLEdBQWlCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXVCM0MsQ0FBQztBQUVGLDJGQUEyRjtBQUM5RSxRQUFBLE9BQU8sR0FBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBdUJwQyxDQUFDO0FBRUYsK0RBQStEO0FBQ2xELFFBQUEsVUFBVSxHQUFpQjs7Ozs7Ozs7Ozs7O0NBWXZDLENBQUM7QUFFRix3RUFBd0U7QUFDM0QsUUFBQSwwQkFBMEIsR0FBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXdCdkQsQ0FBQztBQUVGLHdFQUF3RTtBQUMzRCxRQUFBLGdDQUFnQyxHQUFpQjs7Ozs7Ozs7O0NBUzdELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBUaGlzIGlzIGEgZmlsZSB1c2VkIHRvIGRlZmluZSB0aGUgYWxsIEdyYXBoUUwgcXVlcnkgY29uc3RhbnRzXG5cbi8vIE11dGF0aW9uIHVzZWQgdG8gY3JlYXRlIGEgbmV3IEZBUS5cbmV4cG9ydCBjb25zdCBjcmVhdGVGQVEgPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBDcmVhdGVGQVEoJGNyZWF0ZUZBUUlucHV0OiBDcmVhdGVGQVFJbnB1dCEpIHtcbiAgICAgICAgY3JlYXRlRkFRKGNyZWF0ZUZBUUlucHV0OiAkY3JlYXRlRkFRSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIHRpdGxlXG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgZmFjdHMge1xuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgICAgICBsaW5rYWJsZUtleXdvcmRcbiAgICAgICAgICAgICAgICAgICAgbGlua0xvY2F0aW9uXG4gICAgICAgICAgICAgICAgICAgIHR5cGVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIGNyZWF0ZSBvbmUgb3IgbW9yZSBwaHlzaWNhbCBkZXZpY2VzIGZvciBhIHVzZXIuXG5leHBvcnQgY29uc3QgY3JlYXRlRGV2aWNlID0gLyogR3JhcGhRTCAqLyBgXG4gICAgbXV0YXRpb24gQ3JlYXRlRGV2aWNlKCRjcmVhdGVEZXZpY2VJbnB1dDogQ3JlYXRlRGV2aWNlSW5wdXQhKSB7XG4gICAgICAgIGNyZWF0ZURldmljZShjcmVhdGVEZXZpY2VJbnB1dDogJGNyZWF0ZURldmljZUlucHV0KSB7XG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICB0b2tlbklkXG4gICAgICAgICAgICAgICAgZGV2aWNlU3RhdGVcbiAgICAgICAgICAgICAgICBsYXN0TG9naW5EYXRlXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIHVwZGF0ZSB0aGUgcGh5c2ljYWwgZGV2aWNlcycgZGV0YWlscywgZm9yIGEgdXNlci5cbmV4cG9ydCBjb25zdCB1cGRhdGVEZXZpY2UgPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBVcGRhdGVEZXZpY2UoJHVwZGF0ZURldmljZUlucHV0OiBVcGRhdGVEZXZpY2VJbnB1dCEpIHtcbiAgICAgICAgdXBkYXRlRGV2aWNlKHVwZGF0ZURldmljZUlucHV0OiAkdXBkYXRlRGV2aWNlSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIHRva2VuSWRcbiAgICAgICAgICAgICAgICBkZXZpY2VTdGF0ZVxuICAgICAgICAgICAgICAgIGxhc3RMb2dpbkRhdGVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIE11dGF0aW9uIHVzZWQgdG8gY3JlYXRlIGEgbmV3IG5vdGlmaWNhdGlvbi5cbmV4cG9ydCBjb25zdCBjcmVhdGVOb3RpZmljYXRpb24gPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBDcmVhdGVOb3RpZmljYXRpb24oJGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0OiBDcmVhdGVOb3RpZmljYXRpb25JbnB1dCEpIHtcbiAgICAgICAgY3JlYXRlTm90aWZpY2F0aW9uKGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0OiAkY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBpZFxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXBcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25JZFxuICAgICAgICAgICAgICAgIGVtYWlsRGVzdGluYXRpb25cbiAgICAgICAgICAgICAgICB1c2VyRnVsbE5hbWVcbiAgICAgICAgICAgICAgICB0eXBlXG4gICAgICAgICAgICAgICAgY2hhbm5lbFR5cGVcbiAgICAgICAgICAgICAgICBzdGF0dXNcbiAgICAgICAgICAgICAgICBleHBvUHVzaFRva2Vuc1xuICAgICAgICAgICAgICAgIHBlbmRpbmdDYXNoYmFja1xuICAgICAgICAgICAgICAgIG1lcmNoYW50TmFtZVxuICAgICAgICAgICAgICAgIGFjdGlvblVybFxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gTXV0YXRpb24gdXNlZCB0byBjcmVhdGUgYSBuZXcgcmVpbWJ1cnNlbWVudCBlbGlnaWJpbGl0eS5cbmV4cG9ydCBjb25zdCBjcmVhdGVSZWltYnVyc2VtZW50RWxpZ2liaWxpdHkgPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBDcmVhdGVSZWltYnVyc2VtZW50RWxpZ2liaWxpdHkoJGNyZWF0ZVJlaW1idXJzZW1lbnRFbGlnaWJpbGl0eUlucHV0OiBDcmVhdGVSZWltYnVyc2VtZW50RWxpZ2liaWxpdHlJbnB1dCEpIHtcbiAgICAgICAgY3JlYXRlUmVpbWJ1cnNlbWVudEVsaWdpYmlsaXR5KGNyZWF0ZVJlaW1idXJzZW1lbnRFbGlnaWJpbGl0eUlucHV0OiAkY3JlYXRlUmVpbWJ1cnNlbWVudEVsaWdpYmlsaXR5SW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBpZFxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICBlbGlnaWJpbGl0eVN0YXR1c1xuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gTXV0YXRpb24gdXNlZCB0byB1cGRhdGUgYSByZWltYnVyc2VtZW50IGVsaWdpYmlsaXR5J3MgZGV0YWlscy5cbmV4cG9ydCBjb25zdCB1cGRhdGVSZWltYnVyc2VtZW50RWxpZ2liaWxpdHkgPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBVcGRhdGVSZWltYnVyc2VtZW50RWxpZ2liaWxpdHkoJHVwZGF0ZVJlaW1idXJzZW1lbnRFbGlnaWJpbGl0eUlucHV0OiBVcGRhdGVSZWltYnVyc2VtZW50RWxpZ2liaWxpdHlJbnB1dCEpIHtcbiAgICAgICAgdXBkYXRlUmVpbWJ1cnNlbWVudEVsaWdpYmlsaXR5KHVwZGF0ZVJlaW1idXJzZW1lbnRFbGlnaWJpbGl0eUlucHV0OiAkdXBkYXRlUmVpbWJ1cnNlbWVudEVsaWdpYmlsaXR5SW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBpZFxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICBlbGlnaWJpbGl0eVN0YXR1c1xuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gTXV0YXRpb24gdXNlZCB0byBjcmVhdGUgYSBuZXcgcmVpbWJ1cnNlbWVudC5cbmV4cG9ydCBjb25zdCBjcmVhdGVSZWltYnVyc2VtZW50ID0gLyogR3JhcGhRTCAqLyBgXG4gICAgbXV0YXRpb24gQ3JlYXRlUmVpbWJ1cnNlbWVudCgkY3JlYXRlUmVpbWJ1cnNlbWVudElucHV0OiBDcmVhdGVSZWltYnVyc2VtZW50SW5wdXQhKSB7XG4gICAgICAgIGNyZWF0ZVJlaW1idXJzZW1lbnQoY3JlYXRlUmVpbWJ1cnNlbWVudElucHV0OiAkY3JlYXRlUmVpbWJ1cnNlbWVudElucHV0KSB7XG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgaWRcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgdGltZXN0YW1wXG4gICAgICAgICAgICAgICAgcmVpbWJ1cnNlbWVudElkXG4gICAgICAgICAgICAgICAgY2xpZW50SWRcbiAgICAgICAgICAgICAgICBwYXltZW50R2F0ZXdheUlkXG4gICAgICAgICAgICAgICAgc3VjY2VlZGVkXG4gICAgICAgICAgICAgICAgcHJvY2Vzc2luZ01lc3NhZ2VcbiAgICAgICAgICAgICAgICBjYXJkSWRcbiAgICAgICAgICAgICAgICByZWltYnVyc2VtZW50U3RhdHVzXG4gICAgICAgICAgICAgICAgcGVuZGluZ0Nhc2hiYWNrQW1vdW50XG4gICAgICAgICAgICAgICAgY3JlZGl0ZWRDYXNoYmFja0Ftb3VudFxuICAgICAgICAgICAgICAgIGN1cnJlbmN5Q29kZVxuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9ucyB7XG4gICAgICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcFxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbklkXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uU3RhdHVzXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gTXV0YXRpb24gdXNlZCB0byB1cGRhdGUgYSByZWltYnVyc2VtZW50J3MgZGV0YWlscy5cbmV4cG9ydCBjb25zdCB1cGRhdGVSZWltYnVyc2VtZW50ID0gLyogR3JhcGhRTCAqLyBgXG4gICAgbXV0YXRpb24gVXBkYXRlUmVpbWJ1cnNlbWVudCgkdXBkYXRlUmVpbWJ1cnNlbWVudElucHV0OiBVcGRhdGVSZWltYnVyc2VtZW50SW5wdXQhKSB7XG4gICAgICAgIHVwZGF0ZVJlaW1idXJzZW1lbnQodXBkYXRlUmVpbWJ1cnNlbWVudElucHV0OiAkdXBkYXRlUmVpbWJ1cnNlbWVudElucHV0KSB7XG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgaWRcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgdGltZXN0YW1wXG4gICAgICAgICAgICAgICAgcmVpbWJ1cnNlbWVudElkXG4gICAgICAgICAgICAgICAgY2xpZW50SWRcbiAgICAgICAgICAgICAgICBwYXltZW50R2F0ZXdheUlkXG4gICAgICAgICAgICAgICAgc3VjY2VlZGVkXG4gICAgICAgICAgICAgICAgcHJvY2Vzc2luZ01lc3NhZ2VcbiAgICAgICAgICAgICAgICBjYXJkSWRcbiAgICAgICAgICAgICAgICByZWltYnVyc2VtZW50U3RhdHVzXG4gICAgICAgICAgICAgICAgcGVuZGluZ0Nhc2hiYWNrQW1vdW50XG4gICAgICAgICAgICAgICAgY3JlZGl0ZWRDYXNoYmFja0Ftb3VudFxuICAgICAgICAgICAgICAgIGN1cnJlbmN5Q29kZVxuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9ucyB7XG4gICAgICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcFxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbklkXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uU3RhdHVzXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gTXV0YXRpb24gdXNlZCB0byBjcmVhdGUgYSBuZXcgdHJhbnNhY3Rpb24sIGJhc2VkIG9uIGFuIGluY29taW5nIHRyYW5zYWN0aW9uIG1lc3NhZ2UvZXZlbnQuXG5leHBvcnQgY29uc3QgY3JlYXRlVHJhbnNhY3Rpb24gPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBDcmVhdGVUcmFuc2FjdGlvbigkY3JlYXRlVHJhbnNhY3Rpb25JbnB1dDogQ3JlYXRlVHJhbnNhY3Rpb25JbnB1dCEpIHtcbiAgICAgICAgY3JlYXRlVHJhbnNhY3Rpb24oY3JlYXRlVHJhbnNhY3Rpb25JbnB1dDogJGNyZWF0ZVRyYW5zYWN0aW9uSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBpZFxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXBcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbklkXG4gICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25TdGF0dXNcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvblR5cGVcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgICAgICBtZW1iZXJJZFxuICAgICAgICAgICAgICAgIGNhcmRJZFxuICAgICAgICAgICAgICAgIGJyYW5kSWRcbiAgICAgICAgICAgICAgICBzdG9yZUlkXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnlcbiAgICAgICAgICAgICAgICBjdXJyZW5jeUNvZGVcbiAgICAgICAgICAgICAgICByZXdhcmRBbW91bnRcbiAgICAgICAgICAgICAgICB0b3RhbEFtb3VudFxuICAgICAgICAgICAgICAgIHBlbmRpbmdDYXNoYmFja0Ftb3VudFxuICAgICAgICAgICAgICAgIGNyZWRpdGVkQ2FzaGJhY2tBbW91bnRcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbkJyYW5kTmFtZVxuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uQnJhbmRBZGRyZXNzXG4gICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25CcmFuZExvZ29VcmxcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbkJyYW5kVVJMQWRkcmVzc1xuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uSXNPbmxpbmVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIE11dGF0aW9uIHVzZWQgdG8gdXBkYXRlIGEgdHJhbnNhY3Rpb24ncyBkZXRhaWxzLlxuZXhwb3J0IGNvbnN0IHVwZGF0ZVRyYW5zYWN0aW9uID0gLyogR3JhcGhRTCAqLyBgXG4gICAgbXV0YXRpb24gVXBkYXRlVHJhbnNhY3Rpb24oJHVwZGF0ZVRyYW5zYWN0aW9uSW5wdXQ6IFVwZGF0ZVRyYW5zYWN0aW9uSW5wdXQhKSB7XG4gICAgICAgIHVwZGF0ZVRyYW5zYWN0aW9uKHVwZGF0ZVRyYW5zYWN0aW9uSW5wdXQ6ICR1cGRhdGVUcmFuc2FjdGlvbklucHV0KSB7XG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgaWRcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgdGltZXN0YW1wXG4gICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25JZFxuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uU3RhdHVzXG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIGNyZWF0ZSBhIG5ldyBjYXJkIGxpbmsgZm9yIGEgYnJhbmQtbmV3IHVzZXIsIHdpdGggYSBuZXcgY2FyZC5cbmV4cG9ydCBjb25zdCBjcmVhdGVDYXJkTGluayA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIG11dGF0aW9uIENyZWF0ZUNhcmRMaW5rKCRjcmVhdGVDYXJkTGlua0lucHV0OiBDcmVhdGVDYXJkTGlua0lucHV0ISkge1xuICAgICAgICBjcmVhdGVDYXJkTGluayhjcmVhdGVDYXJkTGlua0lucHV0OiAkY3JlYXRlQ2FyZExpbmtJbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgbWVtYmVySWRcbiAgICAgICAgICAgICAgICBjYXJkcyB7XG4gICAgICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgICAgIGFwcGxpY2F0aW9uSURcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5cbiAgICAgICAgICAgICAgICAgICAgdHlwZVxuICAgICAgICAgICAgICAgICAgICBuYW1lXG4gICAgICAgICAgICAgICAgICAgIGxhc3Q0XG4gICAgICAgICAgICAgICAgICAgIGFkZGl0aW9uYWxQcm9ncmFtSURcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgc3RhdHVzXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIGFkZCBhIG5ldyBjYXJkLCB0byBhbiBleGlzdGluZyB1c2VyLCB3aXRob3V0IGNyZWF0aW5nIGEgYnJhbmQtbmV3IHVzZXIuXG5leHBvcnQgY29uc3QgYWRkQ2FyZCA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIG11dGF0aW9uIEFkZENhcmQoJGFkZENhcmRJbnB1dDogQWRkQ2FyZElucHV0ISkge1xuICAgICAgICBhZGRDYXJkKGFkZENhcmRJbnB1dDogJGFkZENhcmRJbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgbWVtYmVySWRcbiAgICAgICAgICAgICAgICBjYXJkcyB7XG4gICAgICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgICAgIGFwcGxpY2F0aW9uSURcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5cbiAgICAgICAgICAgICAgICAgICAgdHlwZVxuICAgICAgICAgICAgICAgICAgICBuYW1lXG4gICAgICAgICAgICAgICAgICAgIGxhc3Q0XG4gICAgICAgICAgICAgICAgICAgIGFkZGl0aW9uYWxQcm9ncmFtSURcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgc3RhdHVzXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBNdXRhdGlvbiB1c2VkIHRvIHJlbW92ZSBhIGNhcmQgbGluayBmcm9tIGEgdXNlcidzIGNhcmQgbGluay5cbmV4cG9ydCBjb25zdCBkZWxldGVDYXJkID0gLyogR3JhcGhRTCAqLyBgXG4gICAgbXV0YXRpb24gRGVsZXRlQ2FyZCgkZGVsZXRlQ2FyZElucHV0OiBEZWxldGVDYXJkSW5wdXQhKSB7XG4gICAgICAgIGRlbGV0ZUNhcmQoZGVsZXRlQ2FyZElucHV0OiAkZGVsZXRlQ2FyZElucHV0KSB7XG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICBjYXJkSWRcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIE11dGF0aW9uIHVzZWQgdG8gY3JlYXRlIGFuIGluZGl2aWR1YWwncyBtaWxpdGFyeSB2ZXJpZmljYXRpb24gb2JqZWN0LlxuZXhwb3J0IGNvbnN0IGNyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uID0gLyogR3JhcGhRTCAqLyBgXG4gICAgbXV0YXRpb24gQ3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb24oJGNyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQ6IENyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQhKSB7XG4gICAgICAgIGNyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uKGNyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQ6ICRjcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0KSB7XG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICBmaXJzdE5hbWVcbiAgICAgICAgICAgICAgICBsYXN0TmFtZVxuICAgICAgICAgICAgICAgIGRhdGVPZkJpcnRoXG4gICAgICAgICAgICAgICAgZW5saXN0bWVudFllYXJcbiAgICAgICAgICAgICAgICBhZGRyZXNzTGluZVxuICAgICAgICAgICAgICAgIGNpdHlcbiAgICAgICAgICAgICAgICBzdGF0ZVxuICAgICAgICAgICAgICAgIHppcENvZGVcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgICAgICBtaWxpdGFyeUR1dHlTdGF0dXNcbiAgICAgICAgICAgICAgICBtaWxpdGFyeUJyYW5jaFxuICAgICAgICAgICAgICAgIG1pbGl0YXJ5QWZmaWxpYXRpb25cbiAgICAgICAgICAgICAgICBtaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gTXV0YXRpb24gdXNlZCB0byB1cGRhdGUgYW4gaW5kaXZpZHVhbCdzIG1pbGl0YXJ5IHZlcmlmaWNhdGlvbiBzdGF0dXMuXG5leHBvcnQgY29uc3QgdXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXMgPSAvKiBHcmFwaFFMICovIGBcbiAgICBtdXRhdGlvbiBVcGRhdGVNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1cygkdXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dDogVXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dCEpIHtcbiAgICAgICAgdXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXModXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dDogJHVwZGF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBpZFxuICAgICAgICAgICAgbWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNcbiAgICAgICAgfVxuICAgIH1cbmA7XG4iXX0=