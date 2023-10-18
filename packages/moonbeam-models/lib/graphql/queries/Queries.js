"use strict";
// This is a file used to define the all GraphQL query constants
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMilitaryVerificationStatus = exports.getStorage = exports.getEligibleLinkedUsers = exports.getUsersWithNoCards = exports.getCardLink = exports.getTransactionByStatus = exports.getTransaction = exports.getDeviceByToken = exports.getDevice = exports.getDevicesForUser = exports.getPremierOffers = exports.getOffers = exports.getFidelisPartners = exports.getFAQs = exports.getNotificationReminders = exports.getUserAuthSession = void 0;
// Query used to retrieve a User Auth Session, for a particular user
exports.getUserAuthSession = `
    query GetUserAuthSession($getUserAuthSessionInput: GetUserAuthSessionInput!) {
        getUserAuthSession(getUserAuthSessionInput: $getUserAuthSessionInput) {
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
// Query used to retrieve all Notification Reminders
exports.getNotificationReminders = `
    query GetNotificationReminders {
        getNotificationReminders {
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
// Query used to retrieve all the FAQs
exports.getFAQs = `
    query GetFAQs {
        getFAQs {
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
// Query used to retrieve all the Fidelis partner offers, filtered by brand/partner (so we can display them as featured in the store)
exports.getFidelisPartners = `
    query GetFidelisPartners {
        getFidelisPartners {
            errorMessage
            errorType
            data {
                brandName
                veteranOwned
                numberOfOffers
                offers {
                    id
                    corporateId
                    created
                    offerState
                    availability
                    brandId
                    brandDba
                    brandLogo
                    brandLogoSm
                    brandBanner
                    brandParentCategory
                    brandStubCopy
                    brandWebsite
                    storeDetails {
                        id
                        name
                        phone
                        address1
                        city
                        state
                        countryCode
                        postCode
                        geoLocation {
                            latitude
                            longitude
                        }
                        isOnline
                        distance
                    }
                    description
                    reach
                    title
                    qualifier
                    tile
                    startDate
                    endDate
                    currency
                    extOfferId
                    supplierOfferKey
                    redemptionType
                    redemptionInstructionUrl
                    redemptionTrigger
                    budget
                    daysAvailability
                    stores
                    totalRedeemLimit
                    redeemLimitPerUser
                    purchaseAmount
                    purchaseFrequency
                    reward {
                        type
                        value
                        maxValue
                    }
                }
            }
        }
    }
`;
// Query used to retrieve available offers using certain filtering (this will pass through offers from Olive directly)
exports.getOffers = `
    query GetOffers($getOffersInput: GetOffersInput!) {
        getOffers(getOffersInput: $getOffersInput) {
            errorMessage
            errorType
            data {
                totalNumberOfPages
                totalNumberOfRecords
                offers {
                    id
                    corporateId
                    created
                    offerState
                    availability
                    brandId
                    brandDba
                    brandLogo
                    brandLogoSm
                    brandBanner
                    brandParentCategory
                    brandStubCopy
                    brandWebsite
                    storeDetails {
                        id
                        name
                        phone
                        address1
                        city
                        state
                        countryCode
                        postCode
                        geoLocation {
                            latitude
                            longitude
                        }
                        isOnline
                        distance
                    }
                    description
                    reach
                    title
                    qualifier
                    tile
                    startDate
                    endDate
                    currency
                    extOfferId
                    supplierOfferKey
                    redemptionType
                    redemptionInstructionUrl
                    redemptionTrigger
                    budget
                    daysAvailability
                    stores
                    totalRedeemLimit
                    redeemLimitPerUser
                    purchaseAmount
                    purchaseFrequency
                    reward {
                        type
                        value
                        maxValue
                    }
                }
            }
        }
    }
`;
// Query used to retrieve available premier offers using certain filtering (this will pass through premier offers from Olive directly)
exports.getPremierOffers = `
    query GetPremierOffers($getOffersInput: GetOffersInput!) {
        getPremierOffers(getOffersInput: $getOffersInput) {
            errorMessage
            errorType
            data {
                totalNumberOfPages
                totalNumberOfRecords
                offers {
                    id
                    corporateId
                    created
                    offerState
                    availability
                    brandId
                    brandDba
                    brandLogo
                    brandLogoSm
                    brandBanner
                    brandParentCategory
                    brandStubCopy
                    brandWebsite
                    storeDetails {
                        id
                        name
                        phone
                        address1
                        city
                        state
                        countryCode
                        postCode
                        geoLocation {
                            latitude
                            longitude
                        }
                        isOnline
                        distance
                    }
                    description
                    reach
                    title
                    qualifier
                    tile
                    startDate
                    endDate
                    currency
                    extOfferId
                    supplierOfferKey
                    redemptionType
                    redemptionInstructionUrl
                    redemptionTrigger
                    budget
                    daysAvailability
                    stores
                    totalRedeemLimit
                    redeemLimitPerUser
                    purchaseAmount
                    purchaseFrequency
                    reward {
                        type
                        value
                        maxValue
                    }
                }
            }
        }
    }
`;
// Query used to retrieve a particular physical device for a user, based on a user ID and device token.
exports.getDevicesForUser = `
    query GetDevicesForUser($getDevicesForUserInput: GetDevicesForUserInput!) {
        getDevicesForUser(getDevicesForUserInput: $getDevicesForUserInput) {
            errorMessage
            errorType
            data {
                id
                tokenId
                deviceState
                lastLoginDate
            }
        }
    }
`;
// Query used to retrieve a particular physical device for a user, based on a user ID and device token.
exports.getDevice = `
    query GetDevice($getDeviceInput: GetDeviceInput!) {
        getDevice(getDeviceInput: $getDeviceInput) {
            errorMessage
            errorType
            data {
                id
                tokenId
                deviceState
                lastLoginDate
            }
        }
    }
`;
// Query used to retrieve a particular physical device, based its token.
exports.getDeviceByToken = `
    query GetDeviceByToken($getDeviceByTokenInput: GetDeviceByTokenInput!) {
        getDeviceByToken(getDeviceByTokenInput: $getDeviceByTokenInput) {
            errorMessage
            errorType
            data {
                id
                tokenId
                deviceState
                lastLoginDate
            }
        }
    }
`;
// Query used to retrieve transactions for a particular user, within a specific timeframe
exports.getTransaction = `
    query GetTransaction($getTransactionInput: GetTransactionInput!) {
        getTransaction(getTransactionInput: $getTransactionInput) {
            errorMessage
            errorType
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
// Query used to retrieve transactions for a particular user, in a particular status
exports.getTransactionByStatus = `
    query GetTransactionByStatus($getTransactionByStatusInput: GetTransactionByStatusInput!) {
        getTransactionByStatus(getTransactionByStatusInput: $getTransactionByStatusInput) {
            errorMessage
            errorType
            data {
                id
                timestamp
                transactionId
                transactionStatus
                creditedCashbackAmount
                pendingCashbackAmount
                rewardAmount
                totalAmount
            }
        }
    }
`;
// Query used to retrieve a card link for a particular user
exports.getCardLink = `
    query GetCardLink($getCardLinkInput: GetCardLinkInput!) {
        getCardLink(getCardLinkInput: $getCardLinkInput) {
            errorMessage
            errorType
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
// Query used to retrieve all users with no linked cards
exports.getUsersWithNoCards = `
    query GetUsersWithNoCards {
        getUsersWithNoCards {
            errorMessage
            errorType
            data {
                id
                email
                firstName
                lastName
            }
        }
    }
`;
// Query used to retrieve all users with linked cards, eligible for reimbursements
exports.getEligibleLinkedUsers = `
    query GetEligibleLinkedUsers {
        getEligibleLinkedUsers {
            errorMessage
            errorType
            data {
                id
                cardId
                memberId
            }
        }
    }
`;
// Query used to retrieve a file from storage
exports.getStorage = `
    query GetStorage($getStorageInput: GetStorageInput!) {
        getStorage(getStorageInput: $getStorageInput) {
            errorMessage
            errorType
            data {
                url
            }
        }
    }
`;
// Query used to get the verification status of a particular individual
exports.getMilitaryVerificationStatus = `
    query GetMilitaryVerificationStatus($getMilitaryVerificationInput: GetMilitaryVerificationInput!) {
        getMilitaryVerificationStatus(getMilitaryVerificationInput: $getMilitaryVerificationInput) {
            errorMessage
            errorType
            data {
                id
                militaryVerificationStatus
            }
        }
    }
`;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUXVlcmllcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9ncmFwaHFsL3F1ZXJpZXMvUXVlcmllcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsZ0VBQWdFOzs7QUFFaEUsb0VBQW9FO0FBQ3ZELFFBQUEsa0JBQWtCLEdBQWlCOzs7Ozs7Ozs7Ozs7O0NBYS9DLENBQUM7QUFFRixvREFBb0Q7QUFDdkMsUUFBQSx3QkFBd0IsR0FBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQWtCckQsQ0FBQztBQUVGLHNDQUFzQztBQUN6QixRQUFBLE9BQU8sR0FBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FtQnBDLENBQUM7QUFFRixxSUFBcUk7QUFDeEgsUUFBQSxrQkFBa0IsR0FBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBb0UvQyxDQUFDO0FBRUYsc0hBQXNIO0FBQ3pHLFFBQUEsU0FBUyxHQUFpQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQW1FdEMsQ0FBQztBQUVGLHNJQUFzSTtBQUN6SCxRQUFBLGdCQUFnQixHQUFpQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQW1FN0MsQ0FBQztBQUVGLHVHQUF1RztBQUMxRixRQUFBLGlCQUFpQixHQUFpQjs7Ozs7Ozs7Ozs7OztDQWE5QyxDQUFDO0FBRUYsdUdBQXVHO0FBQzFGLFFBQUEsU0FBUyxHQUFpQjs7Ozs7Ozs7Ozs7OztDQWF0QyxDQUFDO0FBRUYsd0VBQXdFO0FBQzNELFFBQUEsZ0JBQWdCLEdBQWlCOzs7Ozs7Ozs7Ozs7O0NBYTdDLENBQUM7QUFFRix5RkFBeUY7QUFDNUUsUUFBQSxjQUFjLEdBQWlCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBK0IzQyxDQUFDO0FBRUYsb0ZBQW9GO0FBQ3ZFLFFBQUEsc0JBQXNCLEdBQWlCOzs7Ozs7Ozs7Ozs7Ozs7OztDQWlCbkQsQ0FBQztBQUVGLDJEQUEyRDtBQUM5QyxRQUFBLFdBQVcsR0FBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBdUJ4QyxDQUFDO0FBRUYsd0RBQXdEO0FBQzNDLFFBQUEsbUJBQW1CLEdBQWlCOzs7Ozs7Ozs7Ozs7O0NBYWhELENBQUM7QUFFRixrRkFBa0Y7QUFDckUsUUFBQSxzQkFBc0IsR0FBaUI7Ozs7Ozs7Ozs7OztDQVluRCxDQUFDO0FBR0YsNkNBQTZDO0FBQ2hDLFFBQUEsVUFBVSxHQUFpQjs7Ozs7Ozs7OztDQVV2QyxDQUFDO0FBRUYsdUVBQXVFO0FBQzFELFFBQUEsNkJBQTZCLEdBQWlCOzs7Ozs7Ozs7OztDQVcxRCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLy8gVGhpcyBpcyBhIGZpbGUgdXNlZCB0byBkZWZpbmUgdGhlIGFsbCBHcmFwaFFMIHF1ZXJ5IGNvbnN0YW50c1xuXG4vLyBRdWVyeSB1c2VkIHRvIHJldHJpZXZlIGEgVXNlciBBdXRoIFNlc3Npb24sIGZvciBhIHBhcnRpY3VsYXIgdXNlclxuZXhwb3J0IGNvbnN0IGdldFVzZXJBdXRoU2Vzc2lvbiA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIHF1ZXJ5IEdldFVzZXJBdXRoU2Vzc2lvbigkZ2V0VXNlckF1dGhTZXNzaW9uSW5wdXQ6IEdldFVzZXJBdXRoU2Vzc2lvbklucHV0ISkge1xuICAgICAgICBnZXRVc2VyQXV0aFNlc3Npb24oZ2V0VXNlckF1dGhTZXNzaW9uSW5wdXQ6ICRnZXRVc2VyQXV0aFNlc3Npb25JbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgbnVtYmVyT2ZTZXNzaW9uc1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gUXVlcnkgdXNlZCB0byByZXRyaWV2ZSBhbGwgTm90aWZpY2F0aW9uIFJlbWluZGVyc1xuZXhwb3J0IGNvbnN0IGdldE5vdGlmaWNhdGlvblJlbWluZGVycyA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIHF1ZXJ5IEdldE5vdGlmaWNhdGlvblJlbWluZGVycyB7XG4gICAgICAgIGdldE5vdGlmaWNhdGlvblJlbWluZGVycyB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25SZW1pbmRlclR5cGVcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25SZW1pbmRlclN0YXR1c1xuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvblJlbWluZGVyQ2FkZW5jZVxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgIG5leHRUcmlnZ2VyQXRcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25DaGFubmVsVHlwZVxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvblJlbWluZGVyQ291bnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIFF1ZXJ5IHVzZWQgdG8gcmV0cmlldmUgYWxsIHRoZSBGQVFzXG5leHBvcnQgY29uc3QgZ2V0RkFRcyA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIHF1ZXJ5IEdldEZBUXMge1xuICAgICAgICBnZXRGQVFzIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIHRpdGxlXG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgZmFjdHMge1xuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgICAgICBsaW5rYWJsZUtleXdvcmRcbiAgICAgICAgICAgICAgICAgICAgbGlua0xvY2F0aW9uXG4gICAgICAgICAgICAgICAgICAgIHR5cGVcbiAgICAgICAgICAgICAgICB9ICAgXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBRdWVyeSB1c2VkIHRvIHJldHJpZXZlIGFsbCB0aGUgRmlkZWxpcyBwYXJ0bmVyIG9mZmVycywgZmlsdGVyZWQgYnkgYnJhbmQvcGFydG5lciAoc28gd2UgY2FuIGRpc3BsYXkgdGhlbSBhcyBmZWF0dXJlZCBpbiB0aGUgc3RvcmUpXG5leHBvcnQgY29uc3QgZ2V0RmlkZWxpc1BhcnRuZXJzID0gLyogR3JhcGhRTCAqLyBgXG4gICAgcXVlcnkgR2V0RmlkZWxpc1BhcnRuZXJzIHtcbiAgICAgICAgZ2V0RmlkZWxpc1BhcnRuZXJzIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBicmFuZE5hbWVcbiAgICAgICAgICAgICAgICB2ZXRlcmFuT3duZWRcbiAgICAgICAgICAgICAgICBudW1iZXJPZk9mZmVyc1xuICAgICAgICAgICAgICAgIG9mZmVycyB7XG4gICAgICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgICAgIGNvcnBvcmF0ZUlkXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRcbiAgICAgICAgICAgICAgICAgICAgb2ZmZXJTdGF0ZVxuICAgICAgICAgICAgICAgICAgICBhdmFpbGFiaWxpdHlcbiAgICAgICAgICAgICAgICAgICAgYnJhbmRJZFxuICAgICAgICAgICAgICAgICAgICBicmFuZERiYVxuICAgICAgICAgICAgICAgICAgICBicmFuZExvZ29cbiAgICAgICAgICAgICAgICAgICAgYnJhbmRMb2dvU21cbiAgICAgICAgICAgICAgICAgICAgYnJhbmRCYW5uZXJcbiAgICAgICAgICAgICAgICAgICAgYnJhbmRQYXJlbnRDYXRlZ29yeVxuICAgICAgICAgICAgICAgICAgICBicmFuZFN0dWJDb3B5XG4gICAgICAgICAgICAgICAgICAgIGJyYW5kV2Vic2l0ZVxuICAgICAgICAgICAgICAgICAgICBzdG9yZURldGFpbHMge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIHBob25lXG4gICAgICAgICAgICAgICAgICAgICAgICBhZGRyZXNzMVxuICAgICAgICAgICAgICAgICAgICAgICAgY2l0eVxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGVcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50cnlDb2RlXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3N0Q29kZVxuICAgICAgICAgICAgICAgICAgICAgICAgZ2VvTG9jYXRpb24ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhdGl0dWRlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9uZ2l0dWRlXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpc09ubGluZVxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzdGFuY2VcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgICAgICByZWFjaFxuICAgICAgICAgICAgICAgICAgICB0aXRsZVxuICAgICAgICAgICAgICAgICAgICBxdWFsaWZpZXJcbiAgICAgICAgICAgICAgICAgICAgdGlsZVxuICAgICAgICAgICAgICAgICAgICBzdGFydERhdGVcbiAgICAgICAgICAgICAgICAgICAgZW5kRGF0ZVxuICAgICAgICAgICAgICAgICAgICBjdXJyZW5jeVxuICAgICAgICAgICAgICAgICAgICBleHRPZmZlcklkXG4gICAgICAgICAgICAgICAgICAgIHN1cHBsaWVyT2ZmZXJLZXlcbiAgICAgICAgICAgICAgICAgICAgcmVkZW1wdGlvblR5cGVcbiAgICAgICAgICAgICAgICAgICAgcmVkZW1wdGlvbkluc3RydWN0aW9uVXJsXG4gICAgICAgICAgICAgICAgICAgIHJlZGVtcHRpb25UcmlnZ2VyXG4gICAgICAgICAgICAgICAgICAgIGJ1ZGdldFxuICAgICAgICAgICAgICAgICAgICBkYXlzQXZhaWxhYmlsaXR5XG4gICAgICAgICAgICAgICAgICAgIHN0b3Jlc1xuICAgICAgICAgICAgICAgICAgICB0b3RhbFJlZGVlbUxpbWl0XG4gICAgICAgICAgICAgICAgICAgIHJlZGVlbUxpbWl0UGVyVXNlclxuICAgICAgICAgICAgICAgICAgICBwdXJjaGFzZUFtb3VudFxuICAgICAgICAgICAgICAgICAgICBwdXJjaGFzZUZyZXF1ZW5jeVxuICAgICAgICAgICAgICAgICAgICByZXdhcmQge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heFZhbHVlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBRdWVyeSB1c2VkIHRvIHJldHJpZXZlIGF2YWlsYWJsZSBvZmZlcnMgdXNpbmcgY2VydGFpbiBmaWx0ZXJpbmcgKHRoaXMgd2lsbCBwYXNzIHRocm91Z2ggb2ZmZXJzIGZyb20gT2xpdmUgZGlyZWN0bHkpXG5leHBvcnQgY29uc3QgZ2V0T2ZmZXJzID0gLyogR3JhcGhRTCAqLyBgXG4gICAgcXVlcnkgR2V0T2ZmZXJzKCRnZXRPZmZlcnNJbnB1dDogR2V0T2ZmZXJzSW5wdXQhKSB7XG4gICAgICAgIGdldE9mZmVycyhnZXRPZmZlcnNJbnB1dDogJGdldE9mZmVyc0lucHV0KSB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgdG90YWxOdW1iZXJPZlBhZ2VzXG4gICAgICAgICAgICAgICAgdG90YWxOdW1iZXJPZlJlY29yZHNcbiAgICAgICAgICAgICAgICBvZmZlcnMge1xuICAgICAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgICAgICBjb3Jwb3JhdGVJZFxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVkXG4gICAgICAgICAgICAgICAgICAgIG9mZmVyU3RhdGVcbiAgICAgICAgICAgICAgICAgICAgYXZhaWxhYmlsaXR5XG4gICAgICAgICAgICAgICAgICAgIGJyYW5kSWRcbiAgICAgICAgICAgICAgICAgICAgYnJhbmREYmFcbiAgICAgICAgICAgICAgICAgICAgYnJhbmRMb2dvXG4gICAgICAgICAgICAgICAgICAgIGJyYW5kTG9nb1NtXG4gICAgICAgICAgICAgICAgICAgIGJyYW5kQmFubmVyXG4gICAgICAgICAgICAgICAgICAgIGJyYW5kUGFyZW50Q2F0ZWdvcnlcbiAgICAgICAgICAgICAgICAgICAgYnJhbmRTdHViQ29weVxuICAgICAgICAgICAgICAgICAgICBicmFuZFdlYnNpdGVcbiAgICAgICAgICAgICAgICAgICAgc3RvcmVEZXRhaWxzIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICBwaG9uZVxuICAgICAgICAgICAgICAgICAgICAgICAgYWRkcmVzczFcbiAgICAgICAgICAgICAgICAgICAgICAgIGNpdHlcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlXG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudHJ5Q29kZVxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zdENvZGVcbiAgICAgICAgICAgICAgICAgICAgICAgIGdlb0xvY2F0aW9uIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXRpdHVkZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvbmdpdHVkZVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaXNPbmxpbmVcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3RhbmNlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICAgICAgcmVhY2hcbiAgICAgICAgICAgICAgICAgICAgdGl0bGVcbiAgICAgICAgICAgICAgICAgICAgcXVhbGlmaWVyXG4gICAgICAgICAgICAgICAgICAgIHRpbGVcbiAgICAgICAgICAgICAgICAgICAgc3RhcnREYXRlXG4gICAgICAgICAgICAgICAgICAgIGVuZERhdGVcbiAgICAgICAgICAgICAgICAgICAgY3VycmVuY3lcbiAgICAgICAgICAgICAgICAgICAgZXh0T2ZmZXJJZFxuICAgICAgICAgICAgICAgICAgICBzdXBwbGllck9mZmVyS2V5XG4gICAgICAgICAgICAgICAgICAgIHJlZGVtcHRpb25UeXBlXG4gICAgICAgICAgICAgICAgICAgIHJlZGVtcHRpb25JbnN0cnVjdGlvblVybFxuICAgICAgICAgICAgICAgICAgICByZWRlbXB0aW9uVHJpZ2dlclxuICAgICAgICAgICAgICAgICAgICBidWRnZXRcbiAgICAgICAgICAgICAgICAgICAgZGF5c0F2YWlsYWJpbGl0eVxuICAgICAgICAgICAgICAgICAgICBzdG9yZXNcbiAgICAgICAgICAgICAgICAgICAgdG90YWxSZWRlZW1MaW1pdFxuICAgICAgICAgICAgICAgICAgICByZWRlZW1MaW1pdFBlclVzZXJcbiAgICAgICAgICAgICAgICAgICAgcHVyY2hhc2VBbW91bnRcbiAgICAgICAgICAgICAgICAgICAgcHVyY2hhc2VGcmVxdWVuY3lcbiAgICAgICAgICAgICAgICAgICAgcmV3YXJkIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhWYWx1ZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gUXVlcnkgdXNlZCB0byByZXRyaWV2ZSBhdmFpbGFibGUgcHJlbWllciBvZmZlcnMgdXNpbmcgY2VydGFpbiBmaWx0ZXJpbmcgKHRoaXMgd2lsbCBwYXNzIHRocm91Z2ggcHJlbWllciBvZmZlcnMgZnJvbSBPbGl2ZSBkaXJlY3RseSlcbmV4cG9ydCBjb25zdCBnZXRQcmVtaWVyT2ZmZXJzID0gLyogR3JhcGhRTCAqLyBgXG4gICAgcXVlcnkgR2V0UHJlbWllck9mZmVycygkZ2V0T2ZmZXJzSW5wdXQ6IEdldE9mZmVyc0lucHV0ISkge1xuICAgICAgICBnZXRQcmVtaWVyT2ZmZXJzKGdldE9mZmVyc0lucHV0OiAkZ2V0T2ZmZXJzSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICB0b3RhbE51bWJlck9mUGFnZXNcbiAgICAgICAgICAgICAgICB0b3RhbE51bWJlck9mUmVjb3Jkc1xuICAgICAgICAgICAgICAgIG9mZmVycyB7XG4gICAgICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgICAgIGNvcnBvcmF0ZUlkXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRcbiAgICAgICAgICAgICAgICAgICAgb2ZmZXJTdGF0ZVxuICAgICAgICAgICAgICAgICAgICBhdmFpbGFiaWxpdHlcbiAgICAgICAgICAgICAgICAgICAgYnJhbmRJZFxuICAgICAgICAgICAgICAgICAgICBicmFuZERiYVxuICAgICAgICAgICAgICAgICAgICBicmFuZExvZ29cbiAgICAgICAgICAgICAgICAgICAgYnJhbmRMb2dvU21cbiAgICAgICAgICAgICAgICAgICAgYnJhbmRCYW5uZXJcbiAgICAgICAgICAgICAgICAgICAgYnJhbmRQYXJlbnRDYXRlZ29yeVxuICAgICAgICAgICAgICAgICAgICBicmFuZFN0dWJDb3B5XG4gICAgICAgICAgICAgICAgICAgIGJyYW5kV2Vic2l0ZVxuICAgICAgICAgICAgICAgICAgICBzdG9yZURldGFpbHMge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIHBob25lXG4gICAgICAgICAgICAgICAgICAgICAgICBhZGRyZXNzMVxuICAgICAgICAgICAgICAgICAgICAgICAgY2l0eVxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGVcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50cnlDb2RlXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3N0Q29kZVxuICAgICAgICAgICAgICAgICAgICAgICAgZ2VvTG9jYXRpb24ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhdGl0dWRlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9uZ2l0dWRlXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpc09ubGluZVxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzdGFuY2VcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgICAgICByZWFjaFxuICAgICAgICAgICAgICAgICAgICB0aXRsZVxuICAgICAgICAgICAgICAgICAgICBxdWFsaWZpZXJcbiAgICAgICAgICAgICAgICAgICAgdGlsZVxuICAgICAgICAgICAgICAgICAgICBzdGFydERhdGVcbiAgICAgICAgICAgICAgICAgICAgZW5kRGF0ZVxuICAgICAgICAgICAgICAgICAgICBjdXJyZW5jeVxuICAgICAgICAgICAgICAgICAgICBleHRPZmZlcklkXG4gICAgICAgICAgICAgICAgICAgIHN1cHBsaWVyT2ZmZXJLZXlcbiAgICAgICAgICAgICAgICAgICAgcmVkZW1wdGlvblR5cGVcbiAgICAgICAgICAgICAgICAgICAgcmVkZW1wdGlvbkluc3RydWN0aW9uVXJsXG4gICAgICAgICAgICAgICAgICAgIHJlZGVtcHRpb25UcmlnZ2VyXG4gICAgICAgICAgICAgICAgICAgIGJ1ZGdldFxuICAgICAgICAgICAgICAgICAgICBkYXlzQXZhaWxhYmlsaXR5XG4gICAgICAgICAgICAgICAgICAgIHN0b3Jlc1xuICAgICAgICAgICAgICAgICAgICB0b3RhbFJlZGVlbUxpbWl0XG4gICAgICAgICAgICAgICAgICAgIHJlZGVlbUxpbWl0UGVyVXNlclxuICAgICAgICAgICAgICAgICAgICBwdXJjaGFzZUFtb3VudFxuICAgICAgICAgICAgICAgICAgICBwdXJjaGFzZUZyZXF1ZW5jeVxuICAgICAgICAgICAgICAgICAgICByZXdhcmQge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heFZhbHVlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBRdWVyeSB1c2VkIHRvIHJldHJpZXZlIGEgcGFydGljdWxhciBwaHlzaWNhbCBkZXZpY2UgZm9yIGEgdXNlciwgYmFzZWQgb24gYSB1c2VyIElEIGFuZCBkZXZpY2UgdG9rZW4uXG5leHBvcnQgY29uc3QgZ2V0RGV2aWNlc0ZvclVzZXIgPSAvKiBHcmFwaFFMICovIGBcbiAgICBxdWVyeSBHZXREZXZpY2VzRm9yVXNlcigkZ2V0RGV2aWNlc0ZvclVzZXJJbnB1dDogR2V0RGV2aWNlc0ZvclVzZXJJbnB1dCEpIHtcbiAgICAgICAgZ2V0RGV2aWNlc0ZvclVzZXIoZ2V0RGV2aWNlc0ZvclVzZXJJbnB1dDogJGdldERldmljZXNGb3JVc2VySW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIHRva2VuSWRcbiAgICAgICAgICAgICAgICBkZXZpY2VTdGF0ZVxuICAgICAgICAgICAgICAgIGxhc3RMb2dpbkRhdGVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIFF1ZXJ5IHVzZWQgdG8gcmV0cmlldmUgYSBwYXJ0aWN1bGFyIHBoeXNpY2FsIGRldmljZSBmb3IgYSB1c2VyLCBiYXNlZCBvbiBhIHVzZXIgSUQgYW5kIGRldmljZSB0b2tlbi5cbmV4cG9ydCBjb25zdCBnZXREZXZpY2UgPSAvKiBHcmFwaFFMICovIGBcbiAgICBxdWVyeSBHZXREZXZpY2UoJGdldERldmljZUlucHV0OiBHZXREZXZpY2VJbnB1dCEpIHtcbiAgICAgICAgZ2V0RGV2aWNlKGdldERldmljZUlucHV0OiAkZ2V0RGV2aWNlSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIHRva2VuSWRcbiAgICAgICAgICAgICAgICBkZXZpY2VTdGF0ZVxuICAgICAgICAgICAgICAgIGxhc3RMb2dpbkRhdGVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIFF1ZXJ5IHVzZWQgdG8gcmV0cmlldmUgYSBwYXJ0aWN1bGFyIHBoeXNpY2FsIGRldmljZSwgYmFzZWQgaXRzIHRva2VuLlxuZXhwb3J0IGNvbnN0IGdldERldmljZUJ5VG9rZW4gPSAvKiBHcmFwaFFMICovIGBcbiAgICBxdWVyeSBHZXREZXZpY2VCeVRva2VuKCRnZXREZXZpY2VCeVRva2VuSW5wdXQ6IEdldERldmljZUJ5VG9rZW5JbnB1dCEpIHtcbiAgICAgICAgZ2V0RGV2aWNlQnlUb2tlbihnZXREZXZpY2VCeVRva2VuSW5wdXQ6ICRnZXREZXZpY2VCeVRva2VuSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIHRva2VuSWRcbiAgICAgICAgICAgICAgICBkZXZpY2VTdGF0ZVxuICAgICAgICAgICAgICAgIGxhc3RMb2dpbkRhdGVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIFF1ZXJ5IHVzZWQgdG8gcmV0cmlldmUgdHJhbnNhY3Rpb25zIGZvciBhIHBhcnRpY3VsYXIgdXNlciwgd2l0aGluIGEgc3BlY2lmaWMgdGltZWZyYW1lXG5leHBvcnQgY29uc3QgZ2V0VHJhbnNhY3Rpb24gPSAvKiBHcmFwaFFMICovIGBcbiAgICBxdWVyeSBHZXRUcmFuc2FjdGlvbigkZ2V0VHJhbnNhY3Rpb25JbnB1dDogR2V0VHJhbnNhY3Rpb25JbnB1dCEpIHtcbiAgICAgICAgZ2V0VHJhbnNhY3Rpb24oZ2V0VHJhbnNhY3Rpb25JbnB1dDogJGdldFRyYW5zYWN0aW9uSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIHRpbWVzdGFtcFxuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uSWRcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvblN0YXR1c1xuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uVHlwZVxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgIG1lbWJlcklkXG4gICAgICAgICAgICAgICAgY2FyZElkXG4gICAgICAgICAgICAgICAgYnJhbmRJZFxuICAgICAgICAgICAgICAgIHN0b3JlSWRcbiAgICAgICAgICAgICAgICBjYXRlZ29yeVxuICAgICAgICAgICAgICAgIGN1cnJlbmN5Q29kZVxuICAgICAgICAgICAgICAgIHJld2FyZEFtb3VudFxuICAgICAgICAgICAgICAgIHRvdGFsQW1vdW50XG4gICAgICAgICAgICAgICAgcGVuZGluZ0Nhc2hiYWNrQW1vdW50XG4gICAgICAgICAgICAgICAgY3JlZGl0ZWRDYXNoYmFja0Ftb3VudFxuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uQnJhbmROYW1lXG4gICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25CcmFuZEFkZHJlc3NcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbkJyYW5kTG9nb1VybFxuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uQnJhbmRVUkxBZGRyZXNzXG4gICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25Jc09ubGluZVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gUXVlcnkgdXNlZCB0byByZXRyaWV2ZSB0cmFuc2FjdGlvbnMgZm9yIGEgcGFydGljdWxhciB1c2VyLCBpbiBhIHBhcnRpY3VsYXIgc3RhdHVzXG5leHBvcnQgY29uc3QgZ2V0VHJhbnNhY3Rpb25CeVN0YXR1cyA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIHF1ZXJ5IEdldFRyYW5zYWN0aW9uQnlTdGF0dXMoJGdldFRyYW5zYWN0aW9uQnlTdGF0dXNJbnB1dDogR2V0VHJhbnNhY3Rpb25CeVN0YXR1c0lucHV0ISkge1xuICAgICAgICBnZXRUcmFuc2FjdGlvbkJ5U3RhdHVzKGdldFRyYW5zYWN0aW9uQnlTdGF0dXNJbnB1dDogJGdldFRyYW5zYWN0aW9uQnlTdGF0dXNJbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgdGltZXN0YW1wXG4gICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25JZFxuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uU3RhdHVzXG4gICAgICAgICAgICAgICAgY3JlZGl0ZWRDYXNoYmFja0Ftb3VudFxuICAgICAgICAgICAgICAgIHBlbmRpbmdDYXNoYmFja0Ftb3VudFxuICAgICAgICAgICAgICAgIHJld2FyZEFtb3VudFxuICAgICAgICAgICAgICAgIHRvdGFsQW1vdW50XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBRdWVyeSB1c2VkIHRvIHJldHJpZXZlIGEgY2FyZCBsaW5rIGZvciBhIHBhcnRpY3VsYXIgdXNlclxuZXhwb3J0IGNvbnN0IGdldENhcmRMaW5rID0gLyogR3JhcGhRTCAqLyBgXG4gICAgcXVlcnkgR2V0Q2FyZExpbmsoJGdldENhcmRMaW5rSW5wdXQ6IEdldENhcmRMaW5rSW5wdXQhKSB7XG4gICAgICAgIGdldENhcmRMaW5rKGdldENhcmRMaW5rSW5wdXQ6ICRnZXRDYXJkTGlua0lucHV0KSB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICBtZW1iZXJJZFxuICAgICAgICAgICAgICAgIGNhcmRzIHtcbiAgICAgICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICAgICAgYXBwbGljYXRpb25JRFxuICAgICAgICAgICAgICAgICAgICB0b2tlblxuICAgICAgICAgICAgICAgICAgICB0eXBlXG4gICAgICAgICAgICAgICAgICAgIG5hbWVcbiAgICAgICAgICAgICAgICAgICAgbGFzdDRcbiAgICAgICAgICAgICAgICAgICAgYWRkaXRpb25hbFByb2dyYW1JRFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgICAgICBzdGF0dXNcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIFF1ZXJ5IHVzZWQgdG8gcmV0cmlldmUgYWxsIHVzZXJzIHdpdGggbm8gbGlua2VkIGNhcmRzXG5leHBvcnQgY29uc3QgZ2V0VXNlcnNXaXRoTm9DYXJkcyA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIHF1ZXJ5IEdldFVzZXJzV2l0aE5vQ2FyZHMge1xuICAgICAgICBnZXRVc2Vyc1dpdGhOb0NhcmRzIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIGVtYWlsXG4gICAgICAgICAgICAgICAgZmlyc3ROYW1lXG4gICAgICAgICAgICAgICAgbGFzdE5hbWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIFF1ZXJ5IHVzZWQgdG8gcmV0cmlldmUgYWxsIHVzZXJzIHdpdGggbGlua2VkIGNhcmRzLCBlbGlnaWJsZSBmb3IgcmVpbWJ1cnNlbWVudHNcbmV4cG9ydCBjb25zdCBnZXRFbGlnaWJsZUxpbmtlZFVzZXJzID0gLyogR3JhcGhRTCAqLyBgXG4gICAgcXVlcnkgR2V0RWxpZ2libGVMaW5rZWRVc2VycyB7XG4gICAgICAgIGdldEVsaWdpYmxlTGlua2VkVXNlcnMge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgY2FyZElkXG4gICAgICAgICAgICAgICAgbWVtYmVySWRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cblxuLy8gUXVlcnkgdXNlZCB0byByZXRyaWV2ZSBhIGZpbGUgZnJvbSBzdG9yYWdlXG5leHBvcnQgY29uc3QgZ2V0U3RvcmFnZSA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIHF1ZXJ5IEdldFN0b3JhZ2UoJGdldFN0b3JhZ2VJbnB1dDogR2V0U3RvcmFnZUlucHV0ISkge1xuICAgICAgICBnZXRTdG9yYWdlKGdldFN0b3JhZ2VJbnB1dDogJGdldFN0b3JhZ2VJbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIHVybFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gUXVlcnkgdXNlZCB0byBnZXQgdGhlIHZlcmlmaWNhdGlvbiBzdGF0dXMgb2YgYSBwYXJ0aWN1bGFyIGluZGl2aWR1YWxcbmV4cG9ydCBjb25zdCBnZXRNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1cyA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIHF1ZXJ5IEdldE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzKCRnZXRNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0OiBHZXRNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0ISkge1xuICAgICAgICBnZXRNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1cyhnZXRNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0OiAkZ2V0TWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgbWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG4iXX0=