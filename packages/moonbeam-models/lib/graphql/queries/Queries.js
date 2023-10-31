"use strict";
// This is a file used to define the all GraphQL query constants
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMilitaryVerificationStatus = exports.getStorage = exports.getEligibleLinkedUsers = exports.getUsersWithNoCards = exports.getCardLink = exports.getTransactionByStatus = exports.getTransaction = exports.getDeviceByToken = exports.getDevice = exports.getDevicesForUser = exports.getPremierOffers = exports.getOffers = exports.getFidelisPartners = exports.getFAQs = exports.getAllUsersForNotificationReminders = exports.getNotificationReminders = exports.getUserAuthSession = void 0;
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
                notificationReminderMaxCount
            }
        }
    }
`;
// Query used to retrieve all Users for Notification Reminders
exports.getAllUsersForNotificationReminders = `
    query GetAllUsersForNotificationReminders {
        getAllUsersForNotificationReminders {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUXVlcmllcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9ncmFwaHFsL3F1ZXJpZXMvUXVlcmllcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsZ0VBQWdFOzs7QUFFaEUsb0VBQW9FO0FBQ3ZELFFBQUEsa0JBQWtCLEdBQWlCOzs7Ozs7Ozs7Ozs7O0NBYS9DLENBQUM7QUFFRixvREFBb0Q7QUFDdkMsUUFBQSx3QkFBd0IsR0FBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FtQnJELENBQUM7QUFFRiw4REFBOEQ7QUFDakQsUUFBQSxtQ0FBbUMsR0FBaUI7Ozs7Ozs7Ozs7Ozs7Q0FhaEUsQ0FBQztBQUVGLHNDQUFzQztBQUN6QixRQUFBLE9BQU8sR0FBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FtQnBDLENBQUM7QUFFRixxSUFBcUk7QUFDeEgsUUFBQSxrQkFBa0IsR0FBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBb0UvQyxDQUFDO0FBRUYsc0hBQXNIO0FBQ3pHLFFBQUEsU0FBUyxHQUFpQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQW1FdEMsQ0FBQztBQUVGLHNJQUFzSTtBQUN6SCxRQUFBLGdCQUFnQixHQUFpQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQW1FN0MsQ0FBQztBQUVGLHVHQUF1RztBQUMxRixRQUFBLGlCQUFpQixHQUFpQjs7Ozs7Ozs7Ozs7OztDQWE5QyxDQUFDO0FBRUYsdUdBQXVHO0FBQzFGLFFBQUEsU0FBUyxHQUFpQjs7Ozs7Ozs7Ozs7OztDQWF0QyxDQUFDO0FBRUYsd0VBQXdFO0FBQzNELFFBQUEsZ0JBQWdCLEdBQWlCOzs7Ozs7Ozs7Ozs7O0NBYTdDLENBQUM7QUFFRix5RkFBeUY7QUFDNUUsUUFBQSxjQUFjLEdBQWlCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBK0IzQyxDQUFDO0FBRUYsb0ZBQW9GO0FBQ3ZFLFFBQUEsc0JBQXNCLEdBQWlCOzs7Ozs7Ozs7Ozs7Ozs7OztDQWlCbkQsQ0FBQztBQUVGLDJEQUEyRDtBQUM5QyxRQUFBLFdBQVcsR0FBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBdUJ4QyxDQUFDO0FBRUYsd0RBQXdEO0FBQzNDLFFBQUEsbUJBQW1CLEdBQWlCOzs7Ozs7Ozs7Ozs7O0NBYWhELENBQUM7QUFFRixrRkFBa0Y7QUFDckUsUUFBQSxzQkFBc0IsR0FBaUI7Ozs7Ozs7Ozs7OztDQVluRCxDQUFDO0FBR0YsNkNBQTZDO0FBQ2hDLFFBQUEsVUFBVSxHQUFpQjs7Ozs7Ozs7OztDQVV2QyxDQUFDO0FBRUYsdUVBQXVFO0FBQzFELFFBQUEsNkJBQTZCLEdBQWlCOzs7Ozs7Ozs7OztDQVcxRCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLy8gVGhpcyBpcyBhIGZpbGUgdXNlZCB0byBkZWZpbmUgdGhlIGFsbCBHcmFwaFFMIHF1ZXJ5IGNvbnN0YW50c1xuXG4vLyBRdWVyeSB1c2VkIHRvIHJldHJpZXZlIGEgVXNlciBBdXRoIFNlc3Npb24sIGZvciBhIHBhcnRpY3VsYXIgdXNlclxuZXhwb3J0IGNvbnN0IGdldFVzZXJBdXRoU2Vzc2lvbiA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIHF1ZXJ5IEdldFVzZXJBdXRoU2Vzc2lvbigkZ2V0VXNlckF1dGhTZXNzaW9uSW5wdXQ6IEdldFVzZXJBdXRoU2Vzc2lvbklucHV0ISkge1xuICAgICAgICBnZXRVc2VyQXV0aFNlc3Npb24oZ2V0VXNlckF1dGhTZXNzaW9uSW5wdXQ6ICRnZXRVc2VyQXV0aFNlc3Npb25JbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgbnVtYmVyT2ZTZXNzaW9uc1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gUXVlcnkgdXNlZCB0byByZXRyaWV2ZSBhbGwgTm90aWZpY2F0aW9uIFJlbWluZGVyc1xuZXhwb3J0IGNvbnN0IGdldE5vdGlmaWNhdGlvblJlbWluZGVycyA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIHF1ZXJ5IEdldE5vdGlmaWNhdGlvblJlbWluZGVycyB7XG4gICAgICAgIGdldE5vdGlmaWNhdGlvblJlbWluZGVycyB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25SZW1pbmRlclR5cGVcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25SZW1pbmRlclN0YXR1c1xuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvblJlbWluZGVyQ2FkZW5jZVxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgIG5leHRUcmlnZ2VyQXRcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25DaGFubmVsVHlwZVxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvblJlbWluZGVyQ291bnRcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25SZW1pbmRlck1heENvdW50XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBRdWVyeSB1c2VkIHRvIHJldHJpZXZlIGFsbCBVc2VycyBmb3IgTm90aWZpY2F0aW9uIFJlbWluZGVyc1xuZXhwb3J0IGNvbnN0IGdldEFsbFVzZXJzRm9yTm90aWZpY2F0aW9uUmVtaW5kZXJzID0gLyogR3JhcGhRTCAqLyBgXG4gICAgcXVlcnkgR2V0QWxsVXNlcnNGb3JOb3RpZmljYXRpb25SZW1pbmRlcnMge1xuICAgICAgICBnZXRBbGxVc2Vyc0Zvck5vdGlmaWNhdGlvblJlbWluZGVycyB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICBlbWFpbFxuICAgICAgICAgICAgICAgIGZpcnN0TmFtZVxuICAgICAgICAgICAgICAgIGxhc3ROYW1lXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBRdWVyeSB1c2VkIHRvIHJldHJpZXZlIGFsbCB0aGUgRkFRc1xuZXhwb3J0IGNvbnN0IGdldEZBUXMgPSAvKiBHcmFwaFFMICovIGBcbiAgICBxdWVyeSBHZXRGQVFzIHtcbiAgICAgICAgZ2V0RkFRcyB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICB0aXRsZVxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgIGZhY3RzIHtcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICAgICAgbGlua2FibGVLZXl3b3JkXG4gICAgICAgICAgICAgICAgICAgIGxpbmtMb2NhdGlvblxuICAgICAgICAgICAgICAgICAgICB0eXBlXG4gICAgICAgICAgICAgICAgfSAgIFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gUXVlcnkgdXNlZCB0byByZXRyaWV2ZSBhbGwgdGhlIEZpZGVsaXMgcGFydG5lciBvZmZlcnMsIGZpbHRlcmVkIGJ5IGJyYW5kL3BhcnRuZXIgKHNvIHdlIGNhbiBkaXNwbGF5IHRoZW0gYXMgZmVhdHVyZWQgaW4gdGhlIHN0b3JlKVxuZXhwb3J0IGNvbnN0IGdldEZpZGVsaXNQYXJ0bmVycyA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIHF1ZXJ5IEdldEZpZGVsaXNQYXJ0bmVycyB7XG4gICAgICAgIGdldEZpZGVsaXNQYXJ0bmVycyB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgYnJhbmROYW1lXG4gICAgICAgICAgICAgICAgdmV0ZXJhbk93bmVkXG4gICAgICAgICAgICAgICAgbnVtYmVyT2ZPZmZlcnNcbiAgICAgICAgICAgICAgICBvZmZlcnMge1xuICAgICAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgICAgICBjb3Jwb3JhdGVJZFxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVkXG4gICAgICAgICAgICAgICAgICAgIG9mZmVyU3RhdGVcbiAgICAgICAgICAgICAgICAgICAgYXZhaWxhYmlsaXR5XG4gICAgICAgICAgICAgICAgICAgIGJyYW5kSWRcbiAgICAgICAgICAgICAgICAgICAgYnJhbmREYmFcbiAgICAgICAgICAgICAgICAgICAgYnJhbmRMb2dvXG4gICAgICAgICAgICAgICAgICAgIGJyYW5kTG9nb1NtXG4gICAgICAgICAgICAgICAgICAgIGJyYW5kQmFubmVyXG4gICAgICAgICAgICAgICAgICAgIGJyYW5kUGFyZW50Q2F0ZWdvcnlcbiAgICAgICAgICAgICAgICAgICAgYnJhbmRTdHViQ29weVxuICAgICAgICAgICAgICAgICAgICBicmFuZFdlYnNpdGVcbiAgICAgICAgICAgICAgICAgICAgc3RvcmVEZXRhaWxzIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICBwaG9uZVxuICAgICAgICAgICAgICAgICAgICAgICAgYWRkcmVzczFcbiAgICAgICAgICAgICAgICAgICAgICAgIGNpdHlcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlXG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudHJ5Q29kZVxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zdENvZGVcbiAgICAgICAgICAgICAgICAgICAgICAgIGdlb0xvY2F0aW9uIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXRpdHVkZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvbmdpdHVkZVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaXNPbmxpbmVcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3RhbmNlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICAgICAgcmVhY2hcbiAgICAgICAgICAgICAgICAgICAgdGl0bGVcbiAgICAgICAgICAgICAgICAgICAgcXVhbGlmaWVyXG4gICAgICAgICAgICAgICAgICAgIHRpbGVcbiAgICAgICAgICAgICAgICAgICAgc3RhcnREYXRlXG4gICAgICAgICAgICAgICAgICAgIGVuZERhdGVcbiAgICAgICAgICAgICAgICAgICAgY3VycmVuY3lcbiAgICAgICAgICAgICAgICAgICAgZXh0T2ZmZXJJZFxuICAgICAgICAgICAgICAgICAgICBzdXBwbGllck9mZmVyS2V5XG4gICAgICAgICAgICAgICAgICAgIHJlZGVtcHRpb25UeXBlXG4gICAgICAgICAgICAgICAgICAgIHJlZGVtcHRpb25JbnN0cnVjdGlvblVybFxuICAgICAgICAgICAgICAgICAgICByZWRlbXB0aW9uVHJpZ2dlclxuICAgICAgICAgICAgICAgICAgICBidWRnZXRcbiAgICAgICAgICAgICAgICAgICAgZGF5c0F2YWlsYWJpbGl0eVxuICAgICAgICAgICAgICAgICAgICBzdG9yZXNcbiAgICAgICAgICAgICAgICAgICAgdG90YWxSZWRlZW1MaW1pdFxuICAgICAgICAgICAgICAgICAgICByZWRlZW1MaW1pdFBlclVzZXJcbiAgICAgICAgICAgICAgICAgICAgcHVyY2hhc2VBbW91bnRcbiAgICAgICAgICAgICAgICAgICAgcHVyY2hhc2VGcmVxdWVuY3lcbiAgICAgICAgICAgICAgICAgICAgcmV3YXJkIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhWYWx1ZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gUXVlcnkgdXNlZCB0byByZXRyaWV2ZSBhdmFpbGFibGUgb2ZmZXJzIHVzaW5nIGNlcnRhaW4gZmlsdGVyaW5nICh0aGlzIHdpbGwgcGFzcyB0aHJvdWdoIG9mZmVycyBmcm9tIE9saXZlIGRpcmVjdGx5KVxuZXhwb3J0IGNvbnN0IGdldE9mZmVycyA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIHF1ZXJ5IEdldE9mZmVycygkZ2V0T2ZmZXJzSW5wdXQ6IEdldE9mZmVyc0lucHV0ISkge1xuICAgICAgICBnZXRPZmZlcnMoZ2V0T2ZmZXJzSW5wdXQ6ICRnZXRPZmZlcnNJbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIHRvdGFsTnVtYmVyT2ZQYWdlc1xuICAgICAgICAgICAgICAgIHRvdGFsTnVtYmVyT2ZSZWNvcmRzXG4gICAgICAgICAgICAgICAgb2ZmZXJzIHtcbiAgICAgICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICAgICAgY29ycG9yYXRlSWRcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlZFxuICAgICAgICAgICAgICAgICAgICBvZmZlclN0YXRlXG4gICAgICAgICAgICAgICAgICAgIGF2YWlsYWJpbGl0eVxuICAgICAgICAgICAgICAgICAgICBicmFuZElkXG4gICAgICAgICAgICAgICAgICAgIGJyYW5kRGJhXG4gICAgICAgICAgICAgICAgICAgIGJyYW5kTG9nb1xuICAgICAgICAgICAgICAgICAgICBicmFuZExvZ29TbVxuICAgICAgICAgICAgICAgICAgICBicmFuZEJhbm5lclxuICAgICAgICAgICAgICAgICAgICBicmFuZFBhcmVudENhdGVnb3J5XG4gICAgICAgICAgICAgICAgICAgIGJyYW5kU3R1YkNvcHlcbiAgICAgICAgICAgICAgICAgICAgYnJhbmRXZWJzaXRlXG4gICAgICAgICAgICAgICAgICAgIHN0b3JlRGV0YWlscyB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgcGhvbmVcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkZHJlc3MxXG4gICAgICAgICAgICAgICAgICAgICAgICBjaXR5XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgY291bnRyeUNvZGVcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc3RDb2RlXG4gICAgICAgICAgICAgICAgICAgICAgICBnZW9Mb2NhdGlvbiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGF0aXR1ZGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb25naXR1ZGVcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlzT25saW5lXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXN0YW5jZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAgICAgIHJlYWNoXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlXG4gICAgICAgICAgICAgICAgICAgIHF1YWxpZmllclxuICAgICAgICAgICAgICAgICAgICB0aWxlXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0RGF0ZVxuICAgICAgICAgICAgICAgICAgICBlbmREYXRlXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbmN5XG4gICAgICAgICAgICAgICAgICAgIGV4dE9mZmVySWRcbiAgICAgICAgICAgICAgICAgICAgc3VwcGxpZXJPZmZlcktleVxuICAgICAgICAgICAgICAgICAgICByZWRlbXB0aW9uVHlwZVxuICAgICAgICAgICAgICAgICAgICByZWRlbXB0aW9uSW5zdHJ1Y3Rpb25VcmxcbiAgICAgICAgICAgICAgICAgICAgcmVkZW1wdGlvblRyaWdnZXJcbiAgICAgICAgICAgICAgICAgICAgYnVkZ2V0XG4gICAgICAgICAgICAgICAgICAgIGRheXNBdmFpbGFiaWxpdHlcbiAgICAgICAgICAgICAgICAgICAgc3RvcmVzXG4gICAgICAgICAgICAgICAgICAgIHRvdGFsUmVkZWVtTGltaXRcbiAgICAgICAgICAgICAgICAgICAgcmVkZWVtTGltaXRQZXJVc2VyXG4gICAgICAgICAgICAgICAgICAgIHB1cmNoYXNlQW1vdW50XG4gICAgICAgICAgICAgICAgICAgIHB1cmNoYXNlRnJlcXVlbmN5XG4gICAgICAgICAgICAgICAgICAgIHJld2FyZCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4VmFsdWVcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIFF1ZXJ5IHVzZWQgdG8gcmV0cmlldmUgYXZhaWxhYmxlIHByZW1pZXIgb2ZmZXJzIHVzaW5nIGNlcnRhaW4gZmlsdGVyaW5nICh0aGlzIHdpbGwgcGFzcyB0aHJvdWdoIHByZW1pZXIgb2ZmZXJzIGZyb20gT2xpdmUgZGlyZWN0bHkpXG5leHBvcnQgY29uc3QgZ2V0UHJlbWllck9mZmVycyA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIHF1ZXJ5IEdldFByZW1pZXJPZmZlcnMoJGdldE9mZmVyc0lucHV0OiBHZXRPZmZlcnNJbnB1dCEpIHtcbiAgICAgICAgZ2V0UHJlbWllck9mZmVycyhnZXRPZmZlcnNJbnB1dDogJGdldE9mZmVyc0lucHV0KSB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgdG90YWxOdW1iZXJPZlBhZ2VzXG4gICAgICAgICAgICAgICAgdG90YWxOdW1iZXJPZlJlY29yZHNcbiAgICAgICAgICAgICAgICBvZmZlcnMge1xuICAgICAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgICAgICBjb3Jwb3JhdGVJZFxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVkXG4gICAgICAgICAgICAgICAgICAgIG9mZmVyU3RhdGVcbiAgICAgICAgICAgICAgICAgICAgYXZhaWxhYmlsaXR5XG4gICAgICAgICAgICAgICAgICAgIGJyYW5kSWRcbiAgICAgICAgICAgICAgICAgICAgYnJhbmREYmFcbiAgICAgICAgICAgICAgICAgICAgYnJhbmRMb2dvXG4gICAgICAgICAgICAgICAgICAgIGJyYW5kTG9nb1NtXG4gICAgICAgICAgICAgICAgICAgIGJyYW5kQmFubmVyXG4gICAgICAgICAgICAgICAgICAgIGJyYW5kUGFyZW50Q2F0ZWdvcnlcbiAgICAgICAgICAgICAgICAgICAgYnJhbmRTdHViQ29weVxuICAgICAgICAgICAgICAgICAgICBicmFuZFdlYnNpdGVcbiAgICAgICAgICAgICAgICAgICAgc3RvcmVEZXRhaWxzIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICBwaG9uZVxuICAgICAgICAgICAgICAgICAgICAgICAgYWRkcmVzczFcbiAgICAgICAgICAgICAgICAgICAgICAgIGNpdHlcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlXG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudHJ5Q29kZVxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zdENvZGVcbiAgICAgICAgICAgICAgICAgICAgICAgIGdlb0xvY2F0aW9uIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXRpdHVkZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvbmdpdHVkZVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaXNPbmxpbmVcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3RhbmNlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICAgICAgcmVhY2hcbiAgICAgICAgICAgICAgICAgICAgdGl0bGVcbiAgICAgICAgICAgICAgICAgICAgcXVhbGlmaWVyXG4gICAgICAgICAgICAgICAgICAgIHRpbGVcbiAgICAgICAgICAgICAgICAgICAgc3RhcnREYXRlXG4gICAgICAgICAgICAgICAgICAgIGVuZERhdGVcbiAgICAgICAgICAgICAgICAgICAgY3VycmVuY3lcbiAgICAgICAgICAgICAgICAgICAgZXh0T2ZmZXJJZFxuICAgICAgICAgICAgICAgICAgICBzdXBwbGllck9mZmVyS2V5XG4gICAgICAgICAgICAgICAgICAgIHJlZGVtcHRpb25UeXBlXG4gICAgICAgICAgICAgICAgICAgIHJlZGVtcHRpb25JbnN0cnVjdGlvblVybFxuICAgICAgICAgICAgICAgICAgICByZWRlbXB0aW9uVHJpZ2dlclxuICAgICAgICAgICAgICAgICAgICBidWRnZXRcbiAgICAgICAgICAgICAgICAgICAgZGF5c0F2YWlsYWJpbGl0eVxuICAgICAgICAgICAgICAgICAgICBzdG9yZXNcbiAgICAgICAgICAgICAgICAgICAgdG90YWxSZWRlZW1MaW1pdFxuICAgICAgICAgICAgICAgICAgICByZWRlZW1MaW1pdFBlclVzZXJcbiAgICAgICAgICAgICAgICAgICAgcHVyY2hhc2VBbW91bnRcbiAgICAgICAgICAgICAgICAgICAgcHVyY2hhc2VGcmVxdWVuY3lcbiAgICAgICAgICAgICAgICAgICAgcmV3YXJkIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhWYWx1ZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gUXVlcnkgdXNlZCB0byByZXRyaWV2ZSBhIHBhcnRpY3VsYXIgcGh5c2ljYWwgZGV2aWNlIGZvciBhIHVzZXIsIGJhc2VkIG9uIGEgdXNlciBJRCBhbmQgZGV2aWNlIHRva2VuLlxuZXhwb3J0IGNvbnN0IGdldERldmljZXNGb3JVc2VyID0gLyogR3JhcGhRTCAqLyBgXG4gICAgcXVlcnkgR2V0RGV2aWNlc0ZvclVzZXIoJGdldERldmljZXNGb3JVc2VySW5wdXQ6IEdldERldmljZXNGb3JVc2VySW5wdXQhKSB7XG4gICAgICAgIGdldERldmljZXNGb3JVc2VyKGdldERldmljZXNGb3JVc2VySW5wdXQ6ICRnZXREZXZpY2VzRm9yVXNlcklucHV0KSB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICB0b2tlbklkXG4gICAgICAgICAgICAgICAgZGV2aWNlU3RhdGVcbiAgICAgICAgICAgICAgICBsYXN0TG9naW5EYXRlXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBRdWVyeSB1c2VkIHRvIHJldHJpZXZlIGEgcGFydGljdWxhciBwaHlzaWNhbCBkZXZpY2UgZm9yIGEgdXNlciwgYmFzZWQgb24gYSB1c2VyIElEIGFuZCBkZXZpY2UgdG9rZW4uXG5leHBvcnQgY29uc3QgZ2V0RGV2aWNlID0gLyogR3JhcGhRTCAqLyBgXG4gICAgcXVlcnkgR2V0RGV2aWNlKCRnZXREZXZpY2VJbnB1dDogR2V0RGV2aWNlSW5wdXQhKSB7XG4gICAgICAgIGdldERldmljZShnZXREZXZpY2VJbnB1dDogJGdldERldmljZUlucHV0KSB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICB0b2tlbklkXG4gICAgICAgICAgICAgICAgZGV2aWNlU3RhdGVcbiAgICAgICAgICAgICAgICBsYXN0TG9naW5EYXRlXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBRdWVyeSB1c2VkIHRvIHJldHJpZXZlIGEgcGFydGljdWxhciBwaHlzaWNhbCBkZXZpY2UsIGJhc2VkIGl0cyB0b2tlbi5cbmV4cG9ydCBjb25zdCBnZXREZXZpY2VCeVRva2VuID0gLyogR3JhcGhRTCAqLyBgXG4gICAgcXVlcnkgR2V0RGV2aWNlQnlUb2tlbigkZ2V0RGV2aWNlQnlUb2tlbklucHV0OiBHZXREZXZpY2VCeVRva2VuSW5wdXQhKSB7XG4gICAgICAgIGdldERldmljZUJ5VG9rZW4oZ2V0RGV2aWNlQnlUb2tlbklucHV0OiAkZ2V0RGV2aWNlQnlUb2tlbklucHV0KSB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICB0b2tlbklkXG4gICAgICAgICAgICAgICAgZGV2aWNlU3RhdGVcbiAgICAgICAgICAgICAgICBsYXN0TG9naW5EYXRlXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBRdWVyeSB1c2VkIHRvIHJldHJpZXZlIHRyYW5zYWN0aW9ucyBmb3IgYSBwYXJ0aWN1bGFyIHVzZXIsIHdpdGhpbiBhIHNwZWNpZmljIHRpbWVmcmFtZVxuZXhwb3J0IGNvbnN0IGdldFRyYW5zYWN0aW9uID0gLyogR3JhcGhRTCAqLyBgXG4gICAgcXVlcnkgR2V0VHJhbnNhY3Rpb24oJGdldFRyYW5zYWN0aW9uSW5wdXQ6IEdldFRyYW5zYWN0aW9uSW5wdXQhKSB7XG4gICAgICAgIGdldFRyYW5zYWN0aW9uKGdldFRyYW5zYWN0aW9uSW5wdXQ6ICRnZXRUcmFuc2FjdGlvbklucHV0KSB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXBcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbklkXG4gICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25TdGF0dXNcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvblR5cGVcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgICAgICBtZW1iZXJJZFxuICAgICAgICAgICAgICAgIGNhcmRJZFxuICAgICAgICAgICAgICAgIGJyYW5kSWRcbiAgICAgICAgICAgICAgICBzdG9yZUlkXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnlcbiAgICAgICAgICAgICAgICBjdXJyZW5jeUNvZGVcbiAgICAgICAgICAgICAgICByZXdhcmRBbW91bnRcbiAgICAgICAgICAgICAgICB0b3RhbEFtb3VudFxuICAgICAgICAgICAgICAgIHBlbmRpbmdDYXNoYmFja0Ftb3VudFxuICAgICAgICAgICAgICAgIGNyZWRpdGVkQ2FzaGJhY2tBbW91bnRcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbkJyYW5kTmFtZVxuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uQnJhbmRBZGRyZXNzXG4gICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25CcmFuZExvZ29VcmxcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbkJyYW5kVVJMQWRkcmVzc1xuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uSXNPbmxpbmVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIFF1ZXJ5IHVzZWQgdG8gcmV0cmlldmUgdHJhbnNhY3Rpb25zIGZvciBhIHBhcnRpY3VsYXIgdXNlciwgaW4gYSBwYXJ0aWN1bGFyIHN0YXR1c1xuZXhwb3J0IGNvbnN0IGdldFRyYW5zYWN0aW9uQnlTdGF0dXMgPSAvKiBHcmFwaFFMICovIGBcbiAgICBxdWVyeSBHZXRUcmFuc2FjdGlvbkJ5U3RhdHVzKCRnZXRUcmFuc2FjdGlvbkJ5U3RhdHVzSW5wdXQ6IEdldFRyYW5zYWN0aW9uQnlTdGF0dXNJbnB1dCEpIHtcbiAgICAgICAgZ2V0VHJhbnNhY3Rpb25CeVN0YXR1cyhnZXRUcmFuc2FjdGlvbkJ5U3RhdHVzSW5wdXQ6ICRnZXRUcmFuc2FjdGlvbkJ5U3RhdHVzSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIHRpbWVzdGFtcFxuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uSWRcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvblN0YXR1c1xuICAgICAgICAgICAgICAgIGNyZWRpdGVkQ2FzaGJhY2tBbW91bnRcbiAgICAgICAgICAgICAgICBwZW5kaW5nQ2FzaGJhY2tBbW91bnRcbiAgICAgICAgICAgICAgICByZXdhcmRBbW91bnRcbiAgICAgICAgICAgICAgICB0b3RhbEFtb3VudFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gUXVlcnkgdXNlZCB0byByZXRyaWV2ZSBhIGNhcmQgbGluayBmb3IgYSBwYXJ0aWN1bGFyIHVzZXJcbmV4cG9ydCBjb25zdCBnZXRDYXJkTGluayA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIHF1ZXJ5IEdldENhcmRMaW5rKCRnZXRDYXJkTGlua0lucHV0OiBHZXRDYXJkTGlua0lucHV0ISkge1xuICAgICAgICBnZXRDYXJkTGluayhnZXRDYXJkTGlua0lucHV0OiAkZ2V0Q2FyZExpbmtJbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgbWVtYmVySWRcbiAgICAgICAgICAgICAgICBjYXJkcyB7XG4gICAgICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgICAgIGFwcGxpY2F0aW9uSURcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5cbiAgICAgICAgICAgICAgICAgICAgdHlwZVxuICAgICAgICAgICAgICAgICAgICBuYW1lXG4gICAgICAgICAgICAgICAgICAgIGxhc3Q0XG4gICAgICAgICAgICAgICAgICAgIGFkZGl0aW9uYWxQcm9ncmFtSURcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgc3RhdHVzXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBRdWVyeSB1c2VkIHRvIHJldHJpZXZlIGFsbCB1c2VycyB3aXRoIG5vIGxpbmtlZCBjYXJkc1xuZXhwb3J0IGNvbnN0IGdldFVzZXJzV2l0aE5vQ2FyZHMgPSAvKiBHcmFwaFFMICovIGBcbiAgICBxdWVyeSBHZXRVc2Vyc1dpdGhOb0NhcmRzIHtcbiAgICAgICAgZ2V0VXNlcnNXaXRoTm9DYXJkcyB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICBlbWFpbFxuICAgICAgICAgICAgICAgIGZpcnN0TmFtZVxuICAgICAgICAgICAgICAgIGxhc3ROYW1lXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBRdWVyeSB1c2VkIHRvIHJldHJpZXZlIGFsbCB1c2VycyB3aXRoIGxpbmtlZCBjYXJkcywgZWxpZ2libGUgZm9yIHJlaW1idXJzZW1lbnRzXG5leHBvcnQgY29uc3QgZ2V0RWxpZ2libGVMaW5rZWRVc2VycyA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIHF1ZXJ5IEdldEVsaWdpYmxlTGlua2VkVXNlcnMge1xuICAgICAgICBnZXRFbGlnaWJsZUxpbmtlZFVzZXJzIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIGNhcmRJZFxuICAgICAgICAgICAgICAgIG1lbWJlcklkXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG5cbi8vIFF1ZXJ5IHVzZWQgdG8gcmV0cmlldmUgYSBmaWxlIGZyb20gc3RvcmFnZVxuZXhwb3J0IGNvbnN0IGdldFN0b3JhZ2UgPSAvKiBHcmFwaFFMICovIGBcbiAgICBxdWVyeSBHZXRTdG9yYWdlKCRnZXRTdG9yYWdlSW5wdXQ6IEdldFN0b3JhZ2VJbnB1dCEpIHtcbiAgICAgICAgZ2V0U3RvcmFnZShnZXRTdG9yYWdlSW5wdXQ6ICRnZXRTdG9yYWdlSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICB1cmxcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIFF1ZXJ5IHVzZWQgdG8gZ2V0IHRoZSB2ZXJpZmljYXRpb24gc3RhdHVzIG9mIGEgcGFydGljdWxhciBpbmRpdmlkdWFsXG5leHBvcnQgY29uc3QgZ2V0TWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXMgPSAvKiBHcmFwaFFMICovIGBcbiAgICBxdWVyeSBHZXRNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1cygkZ2V0TWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dDogR2V0TWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dCEpIHtcbiAgICAgICAgZ2V0TWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXMoZ2V0TWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dDogJGdldE1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIG1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuIl19