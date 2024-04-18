"use strict";
/**
 * This is a file used to define the all GraphQL query constants
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMilitaryVerificationStatus = exports.getStorage = exports.getEligibleLinkedUsers = exports.getUsersWithNoCards = exports.getCardLink = exports.getTransactionByStatus = exports.getTransaction = exports.getTransactionsInRange = exports.getDeviceByToken = exports.getDevice = exports.getDevicesForUser = exports.getPremierOffers = exports.getSeasonalOffers = exports.getOffers = exports.searchOffers = exports.getFidelisPartners = exports.getServicePartners = exports.getEventSeries = exports.getFAQs = exports.geoCodeAsync = exports.getUsersByGeographyForNotificationReminders = exports.getAllUsersIneligibleForReimbursements = exports.getAllUsersEligibleForReimbursements = exports.getAllUsersForNotificationReminders = exports.getNotificationReminders = exports.getUserAuthSession = exports.getAppUpgradeCredentials = exports.getReferralsByStatus = exports.getUserFromReferral = exports.getUserCardLinkingId = exports.getMilitaryVerificationInformation = exports.getFilesForUser = exports.getAppReviewEligibility = exports.getLocationPredictions = exports.getReimbursements = exports.getNotificationByType = exports.getDailyEarningsSummary = exports.getUserNotificationAssets = void 0;
/**
 * Query used to retrieve a user's notification assets (such as email address and push token),
 * used when sending notifications
  */
exports.getUserNotificationAssets = `
    query getUserNotificationAssets($getUserNotificationAssetsInput: GetUserNotificationAssetsInput!) {
        getUserNotificationAssets(getUserNotificationAssetsInput: $getUserNotificationAssetsInput) {
            errorMessage
            errorType
            data {
                id
                email
                pushToken
            }
        }
    }
`;
// Query used to retrieve a daily earnings summary for a particular user and date.
exports.getDailyEarningsSummary = `
    query GetDailyEarningsSummary($getDailyEarningsSummaryInput: GetDailyEarningsSummaryInput!) {
        getDailyEarningsSummary(getDailyEarningsSummaryInput: $getDailyEarningsSummaryInput) {
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
// Query used to retrieve notifications sorted by their creation date, given their type
exports.getNotificationByType = `
    query GetNotificationByType($getNotificationByTypeInput: GetNotificationByTypeInput!) {
        getNotificationByType(getNotificationByTypeInput: $getNotificationByTypeInput) {
            errorMessage
            errorType
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
// Query used to retrieve the reimbursements for a particular user
exports.getReimbursements = `
    query GetReimbursements($getReimbursementsInput: GetReimbursementsInput!) {
        getReimbursements(getReimbursementsInput: $getReimbursementsInput) {
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
// Query used to retrieve location predictions given an address
exports.getLocationPredictions = `
    query GetLocationPredictions($getLocationPredictionsInput: GetLocationPredictionsInput!) {
        getLocationPredictions(getLocationPredictionsInput: $getLocationPredictionsInput) {
            errorMessage
            errorType
            data {
                description
                place_id
                reference
                matched_substrings
                structured_formatting
                address_components
                terms
                types
            }
        }
    }
`;
// Query used to retrieve the app review eligibility for a particular user
exports.getAppReviewEligibility = `
    query GetAppReviewEligibility($getAppReviewEligibilityInput: GetAppReviewEligibilityInput!) {
        getAppReviewEligibility(getAppReviewEligibilityInput: $getAppReviewEligibilityInput) {
            errorMessage
            errorType
            data
        }
    }
`;
// Query used to retrieve the files for a particular user from a bucket, if existent,
// so we can see if a user has uploaded any documentation and/or files.
exports.getFilesForUser = `
    query GetFilesForUser($getFilesForUserInput: GetFilesForUserInput!) {
        getFilesForUser(getFilesForUserInput: $getFilesForUserInput) {
            errorMessage
            errorType
            data
        }
    }
`;
// Query used to retrieve a user's military verification information, based on their ID
// or based on a particular date-based filter
exports.getMilitaryVerificationInformation = `
    query GetMilitaryVerificationInformation($getMilitaryVerificationInformationInput: GetMilitaryVerificationInformationInput!) {
        getMilitaryVerificationInformation(getMilitaryVerificationInformationInput: $getMilitaryVerificationInformationInput) {
            errorMessage
            errorType
            data {
                id,
                firstName,
                lastName,
                dateOfBirth,
                enlistmentYear,
                addressLine,
                city,
                state,
                zipCode,
                createdAt,
                updatedAt,
                militaryDutyStatus,
                militaryBranch,
                militaryAffiliation,
                militaryVerificationStatus
            }
        }
    }
`;
// Query used to retrieve a user's card linking ID obtained from an internal Moonbeam ID
exports.getUserCardLinkingId = `
    query GetUserCardLinkingId($getUserCardLinkingIdInput: GetUserCardLinkingIdInput!) {
        getUserCardLinkingId(getUserCardLinkingIdInput: $getUserCardLinkingIdInput) {
            errorMessage
            errorType
            data
        }
    }
`;
// Query used to retrieve a user's details from a referral code
exports.getUserFromReferral = `
    query GetUserFromReferral($getUserFromRefferalInput: UserFromReferralInput!) {
        getUserFromReferral(userFromReferralInput: $getUserFromRefferalInput) {
            errorMessage
            errorType
            data
        }
    }
`;
// Query used to get referrals filtered by a particular status
exports.getReferralsByStatus = `
    query GetReferralsByStatus($getReferralsByStatusInput: GetReferralsByStatusInput!) {
        getReferralsByStatus(getReferralsByStatusInput: $getReferralsByStatusInput) {
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
// Query used to retrieve the App Upgrade credentials/details
exports.getAppUpgradeCredentials = `
    query GetAppUpgradeCredentials {
        getAppUpgradeCredentials {
            errorMessage
            errorType
            data
        }
    }
`;
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
// Query used to retrieve all Users eligible for Reimbursements
exports.getAllUsersEligibleForReimbursements = `
    query GetAllUsersEligibleForReimbursements {
        getAllUsersEligibleForReimbursements {
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
// Query used to retrieve all Users ineligible for Reimbursements
exports.getAllUsersIneligibleForReimbursements = `
    query GetAllUsersIneligibleForReimbursements {
        getAllUsersIneligibleForReimbursements {
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
// Query used to retrieve all Users for Notification Reminders sorted by a geographical location
exports.getUsersByGeographyForNotificationReminders = `
    query GetUsersByGeographyForNotificationReminders($getUsersByGeographicalLocationInput: GetUsersByGeographicalLocationInput!) {
        getUsersByGeographyForNotificationReminders(getUsersByGeographicalLocationInput: $getUsersByGeographicalLocationInput) {
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
// Query used to GeoCode and address using Google's APIs
exports.geoCodeAsync = `
    query GeoCodeAsync($geocodeAsyncInput: GeocodeAsyncInput!) {
        geoCodeAsync(geocodeAsyncInput: $geocodeAsyncInput) {
            errorMessage
            errorType
            data {
                latitude
                longitude
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
// Query used to retrieve all Event Series for various partner organizations
exports.getEventSeries = `
    query GetEventSeries {
        getEventSeries {
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
// Query used to retrieve all the Service partner organizations
exports.getServicePartners = `
    query GetServicePartners {
        getServicePartners {
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
// Query used to search an offer based on certain filtering (this will pas through offers from Olive directly)
exports.searchOffers = `
    query SearchOffers($searchOffersInput: SearchOffersInput!) {
        searchOffers(searchOffersInput: $searchOffersInput) {
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
// Query used to retrieve available seasonal offers using certain filtering (this will pass through seasonal offers from Olive directly)
exports.getSeasonalOffers = `
    query GetSeasonalOffers($getOffersInput: GetOffersInput!) {
        getSeasonalOffers(getOffersInput: $getOffersInput) {
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
// Query used to retrieve transactions within a specific timeframe
exports.getTransactionsInRange = `
    query getTransactionsInRange($getTransactionsInRangeInput: GetTransactionsInRangeInput!) {
        getTransactionsInRange(getTransactionsInRangeInput: $getTransactionsInRangeInput) {
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
                cardIds
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUXVlcmllcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9ncmFwaHFsL3F1ZXJpZXMvUXVlcmllcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7OztBQUVIOzs7SUFHSTtBQUNTLFFBQUEseUJBQXlCLEdBQWlCOzs7Ozs7Ozs7Ozs7Q0FZdEQsQ0FBQztBQUVGLGtGQUFrRjtBQUNyRSxRQUFBLHVCQUF1QixHQUFpQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FzQ3BELENBQUM7QUFFRix1RkFBdUY7QUFDMUUsUUFBQSxxQkFBcUIsR0FBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBdUJsRCxDQUFDO0FBRUYsa0VBQWtFO0FBQ3JELFFBQUEsaUJBQWlCLEdBQWlCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBMkM5QyxDQUFDO0FBRUYsK0RBQStEO0FBQ2xELFFBQUEsc0JBQXNCLEdBQWlCOzs7Ozs7Ozs7Ozs7Ozs7OztDQWlCbkQsQ0FBQztBQUVGLDBFQUEwRTtBQUM3RCxRQUFBLHVCQUF1QixHQUFpQjs7Ozs7Ozs7Q0FRcEQsQ0FBQztBQUVGLHFGQUFxRjtBQUNyRix1RUFBdUU7QUFDMUQsUUFBQSxlQUFlLEdBQWlCOzs7Ozs7OztDQVE1QyxDQUFDO0FBRUYsdUZBQXVGO0FBQ3ZGLDZDQUE2QztBQUNoQyxRQUFBLGtDQUFrQyxHQUFpQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBd0IvRCxDQUFDO0FBRUYsd0ZBQXdGO0FBQzNFLFFBQUEsb0JBQW9CLEdBQWlCOzs7Ozs7OztDQVFqRCxDQUFDO0FBRUYsK0RBQStEO0FBQ2xELFFBQUEsbUJBQW1CLEdBQWlCOzs7Ozs7OztDQVFoRCxDQUFDO0FBRUYsOERBQThEO0FBQ2pELFFBQUEsb0JBQW9CLEdBQWlCOzs7Ozs7Ozs7Ozs7Ozs7O0NBZ0JqRCxDQUFDO0FBRUYsNkRBQTZEO0FBQ2hELFFBQUEsd0JBQXdCLEdBQWlCOzs7Ozs7OztDQVFyRCxDQUFDO0FBRUYsb0VBQW9FO0FBQ3ZELFFBQUEsa0JBQWtCLEdBQWlCOzs7Ozs7Ozs7Ozs7O0NBYS9DLENBQUM7QUFFRixvREFBb0Q7QUFDdkMsUUFBQSx3QkFBd0IsR0FBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FtQnJELENBQUM7QUFFRiw4REFBOEQ7QUFDakQsUUFBQSxtQ0FBbUMsR0FBaUI7Ozs7Ozs7Ozs7Ozs7Q0FhaEUsQ0FBQztBQUVGLCtEQUErRDtBQUNsRCxRQUFBLG9DQUFvQyxHQUFpQjs7Ozs7Ozs7Ozs7OztDQWFqRSxDQUFDO0FBRUYsaUVBQWlFO0FBQ3BELFFBQUEsc0NBQXNDLEdBQWlCOzs7Ozs7Ozs7Ozs7O0NBYW5FLENBQUM7QUFFRixnR0FBZ0c7QUFDbkYsUUFBQSwyQ0FBMkMsR0FBaUI7Ozs7Ozs7Ozs7Ozs7Q0FheEUsQ0FBQztBQUVGLHdEQUF3RDtBQUMzQyxRQUFBLFlBQVksR0FBaUI7Ozs7Ozs7Ozs7O0NBV3pDLENBQUM7QUFFRixzQ0FBc0M7QUFDekIsUUFBQSxPQUFPLEdBQWlCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBbUJwQyxDQUFDO0FBRUYsNEVBQTRFO0FBQy9ELFFBQUEsY0FBYyxHQUFpQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBdUMzQyxDQUFDO0FBRUYsK0RBQStEO0FBQ2xELFFBQUEsa0JBQWtCLEdBQWlCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQTZCL0MsQ0FBQztBQUVGLHFJQUFxSTtBQUN4SCxRQUFBLGtCQUFrQixHQUFpQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FvRS9DLENBQUM7QUFFRiw4R0FBOEc7QUFDakcsUUFBQSxZQUFZLEdBQWlCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBbUV6QyxDQUFDO0FBRUYsc0hBQXNIO0FBQ3pHLFFBQUEsU0FBUyxHQUFpQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQW1FdEMsQ0FBQztBQUVGLHdJQUF3STtBQUMzSCxRQUFBLGlCQUFpQixHQUFpQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQW1FOUMsQ0FBQztBQUVGLHNJQUFzSTtBQUN6SCxRQUFBLGdCQUFnQixHQUFpQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQW1FN0MsQ0FBQztBQUVGLHVHQUF1RztBQUMxRixRQUFBLGlCQUFpQixHQUFpQjs7Ozs7Ozs7Ozs7OztDQWE5QyxDQUFDO0FBRUYsdUdBQXVHO0FBQzFGLFFBQUEsU0FBUyxHQUFpQjs7Ozs7Ozs7Ozs7OztDQWF0QyxDQUFDO0FBRUYsd0VBQXdFO0FBQzNELFFBQUEsZ0JBQWdCLEdBQWlCOzs7Ozs7Ozs7Ozs7O0NBYTdDLENBQUM7QUFFRixrRUFBa0U7QUFDckQsUUFBQSxzQkFBc0IsR0FBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0ErQm5ELENBQUM7QUFFRix5RkFBeUY7QUFDNUUsUUFBQSxjQUFjLEdBQWlCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBK0IzQyxDQUFDO0FBRUYsb0ZBQW9GO0FBQ3ZFLFFBQUEsc0JBQXNCLEdBQWlCOzs7Ozs7Ozs7Ozs7Ozs7OztDQWlCbkQsQ0FBQztBQUVGLDJEQUEyRDtBQUM5QyxRQUFBLFdBQVcsR0FBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXdCeEMsQ0FBQztBQUVGLHdEQUF3RDtBQUMzQyxRQUFBLG1CQUFtQixHQUFpQjs7Ozs7Ozs7Ozs7OztDQWFoRCxDQUFDO0FBRUYsa0ZBQWtGO0FBQ3JFLFFBQUEsc0JBQXNCLEdBQWlCOzs7Ozs7Ozs7Ozs7Q0FZbkQsQ0FBQztBQUdGLDZDQUE2QztBQUNoQyxRQUFBLFVBQVUsR0FBaUI7Ozs7Ozs7Ozs7Q0FVdkMsQ0FBQztBQUVGLHVFQUF1RTtBQUMxRCxRQUFBLDZCQUE2QixHQUFpQjs7Ozs7Ozs7Ozs7Q0FXMUQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogVGhpcyBpcyBhIGZpbGUgdXNlZCB0byBkZWZpbmUgdGhlIGFsbCBHcmFwaFFMIHF1ZXJ5IGNvbnN0YW50c1xuICovXG5cbi8qKlxuICogUXVlcnkgdXNlZCB0byByZXRyaWV2ZSBhIHVzZXIncyBub3RpZmljYXRpb24gYXNzZXRzIChzdWNoIGFzIGVtYWlsIGFkZHJlc3MgYW5kIHB1c2ggdG9rZW4pLFxuICogdXNlZCB3aGVuIHNlbmRpbmcgbm90aWZpY2F0aW9uc1xuICAqL1xuZXhwb3J0IGNvbnN0IGdldFVzZXJOb3RpZmljYXRpb25Bc3NldHMgPSAvKiBHcmFwaFFMICovIGBcbiAgICBxdWVyeSBnZXRVc2VyTm90aWZpY2F0aW9uQXNzZXRzKCRnZXRVc2VyTm90aWZpY2F0aW9uQXNzZXRzSW5wdXQ6IEdldFVzZXJOb3RpZmljYXRpb25Bc3NldHNJbnB1dCEpIHtcbiAgICAgICAgZ2V0VXNlck5vdGlmaWNhdGlvbkFzc2V0cyhnZXRVc2VyTm90aWZpY2F0aW9uQXNzZXRzSW5wdXQ6ICRnZXRVc2VyTm90aWZpY2F0aW9uQXNzZXRzSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIGVtYWlsXG4gICAgICAgICAgICAgICAgcHVzaFRva2VuXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBRdWVyeSB1c2VkIHRvIHJldHJpZXZlIGEgZGFpbHkgZWFybmluZ3Mgc3VtbWFyeSBmb3IgYSBwYXJ0aWN1bGFyIHVzZXIgYW5kIGRhdGUuXG5leHBvcnQgY29uc3QgZ2V0RGFpbHlFYXJuaW5nc1N1bW1hcnkgPSAvKiBHcmFwaFFMICovIGBcbiAgICBxdWVyeSBHZXREYWlseUVhcm5pbmdzU3VtbWFyeSgkZ2V0RGFpbHlFYXJuaW5nc1N1bW1hcnlJbnB1dDogR2V0RGFpbHlFYXJuaW5nc1N1bW1hcnlJbnB1dCEpIHtcbiAgICAgICAgZ2V0RGFpbHlFYXJuaW5nc1N1bW1hcnkoZ2V0RGFpbHlFYXJuaW5nc1N1bW1hcnlJbnB1dDogJGdldERhaWx5RWFybmluZ3NTdW1tYXJ5SW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIGRhaWx5RWFybmluZ3NTdW1tYXJ5SURcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgICAgICBzdGF0dXNcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbnMge1xuICAgICAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXBcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25JZFxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvblN0YXR1c1xuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvblR5cGVcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgICAgICBtZW1iZXJJZFxuICAgICAgICAgICAgICAgICAgICBjYXJkSWRcbiAgICAgICAgICAgICAgICAgICAgYnJhbmRJZFxuICAgICAgICAgICAgICAgICAgICBzdG9yZUlkXG4gICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbmN5Q29kZVxuICAgICAgICAgICAgICAgICAgICByZXdhcmRBbW91bnRcbiAgICAgICAgICAgICAgICAgICAgdG90YWxBbW91bnRcbiAgICAgICAgICAgICAgICAgICAgcGVuZGluZ0Nhc2hiYWNrQW1vdW50XG4gICAgICAgICAgICAgICAgICAgIGNyZWRpdGVkQ2FzaGJhY2tBbW91bnRcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25CcmFuZE5hbWVcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25CcmFuZEFkZHJlc3NcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25CcmFuZExvZ29VcmxcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25CcmFuZFVSTEFkZHJlc3NcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25Jc09ubGluZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIFF1ZXJ5IHVzZWQgdG8gcmV0cmlldmUgbm90aWZpY2F0aW9ucyBzb3J0ZWQgYnkgdGhlaXIgY3JlYXRpb24gZGF0ZSwgZ2l2ZW4gdGhlaXIgdHlwZVxuZXhwb3J0IGNvbnN0IGdldE5vdGlmaWNhdGlvbkJ5VHlwZSA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIHF1ZXJ5IEdldE5vdGlmaWNhdGlvbkJ5VHlwZSgkZ2V0Tm90aWZpY2F0aW9uQnlUeXBlSW5wdXQ6IEdldE5vdGlmaWNhdGlvbkJ5VHlwZUlucHV0ISkge1xuICAgICAgICBnZXROb3RpZmljYXRpb25CeVR5cGUoZ2V0Tm90aWZpY2F0aW9uQnlUeXBlSW5wdXQ6ICRnZXROb3RpZmljYXRpb25CeVR5cGVJbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgdGltZXN0YW1wXG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uSWRcbiAgICAgICAgICAgICAgICBlbWFpbERlc3RpbmF0aW9uXG4gICAgICAgICAgICAgICAgdXNlckZ1bGxOYW1lXG4gICAgICAgICAgICAgICAgdHlwZVxuICAgICAgICAgICAgICAgIGNoYW5uZWxUeXBlXG4gICAgICAgICAgICAgICAgc3RhdHVzXG4gICAgICAgICAgICAgICAgZXhwb1B1c2hUb2tlbnNcbiAgICAgICAgICAgICAgICBwZW5kaW5nQ2FzaGJhY2tcbiAgICAgICAgICAgICAgICBtZXJjaGFudE5hbWVcbiAgICAgICAgICAgICAgICBhY3Rpb25VcmxcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIFF1ZXJ5IHVzZWQgdG8gcmV0cmlldmUgdGhlIHJlaW1idXJzZW1lbnRzIGZvciBhIHBhcnRpY3VsYXIgdXNlclxuZXhwb3J0IGNvbnN0IGdldFJlaW1idXJzZW1lbnRzID0gLyogR3JhcGhRTCAqLyBgXG4gICAgcXVlcnkgR2V0UmVpbWJ1cnNlbWVudHMoJGdldFJlaW1idXJzZW1lbnRzSW5wdXQ6IEdldFJlaW1idXJzZW1lbnRzSW5wdXQhKSB7XG4gICAgICAgIGdldFJlaW1idXJzZW1lbnRzKGdldFJlaW1idXJzZW1lbnRzSW5wdXQ6ICRnZXRSZWltYnVyc2VtZW50c0lucHV0KSB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXBcbiAgICAgICAgICAgICAgICByZWltYnVyc2VtZW50SWRcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgICAgICBzdGF0dXNcbiAgICAgICAgICAgICAgICBhbW91bnRcbiAgICAgICAgICAgICAgICBjYXJkSWRcbiAgICAgICAgICAgICAgICBjYXJkTGFzdDRcbiAgICAgICAgICAgICAgICBjYXJkVHlwZVxuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9ucyB7XG4gICAgICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcFxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbklkXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uU3RhdHVzXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uVHlwZVxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgICAgIG1lbWJlcklkXG4gICAgICAgICAgICAgICAgICAgIGNhcmRJZFxuICAgICAgICAgICAgICAgICAgICBicmFuZElkXG4gICAgICAgICAgICAgICAgICAgIHN0b3JlSWRcbiAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnlcbiAgICAgICAgICAgICAgICAgICAgY3VycmVuY3lDb2RlXG4gICAgICAgICAgICAgICAgICAgIHJld2FyZEFtb3VudFxuICAgICAgICAgICAgICAgICAgICB0b3RhbEFtb3VudFxuICAgICAgICAgICAgICAgICAgICBwZW5kaW5nQ2FzaGJhY2tBbW91bnRcbiAgICAgICAgICAgICAgICAgICAgY3JlZGl0ZWRDYXNoYmFja0Ftb3VudFxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbkJyYW5kTmFtZVxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbkJyYW5kQWRkcmVzc1xuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbkJyYW5kTG9nb1VybFxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbkJyYW5kVVJMQWRkcmVzc1xuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbklzT25saW5lXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gUXVlcnkgdXNlZCB0byByZXRyaWV2ZSBsb2NhdGlvbiBwcmVkaWN0aW9ucyBnaXZlbiBhbiBhZGRyZXNzXG5leHBvcnQgY29uc3QgZ2V0TG9jYXRpb25QcmVkaWN0aW9ucyA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIHF1ZXJ5IEdldExvY2F0aW9uUHJlZGljdGlvbnMoJGdldExvY2F0aW9uUHJlZGljdGlvbnNJbnB1dDogR2V0TG9jYXRpb25QcmVkaWN0aW9uc0lucHV0ISkge1xuICAgICAgICBnZXRMb2NhdGlvblByZWRpY3Rpb25zKGdldExvY2F0aW9uUHJlZGljdGlvbnNJbnB1dDogJGdldExvY2F0aW9uUHJlZGljdGlvbnNJbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAgcGxhY2VfaWRcbiAgICAgICAgICAgICAgICByZWZlcmVuY2VcbiAgICAgICAgICAgICAgICBtYXRjaGVkX3N1YnN0cmluZ3NcbiAgICAgICAgICAgICAgICBzdHJ1Y3R1cmVkX2Zvcm1hdHRpbmdcbiAgICAgICAgICAgICAgICBhZGRyZXNzX2NvbXBvbmVudHNcbiAgICAgICAgICAgICAgICB0ZXJtc1xuICAgICAgICAgICAgICAgIHR5cGVzXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBRdWVyeSB1c2VkIHRvIHJldHJpZXZlIHRoZSBhcHAgcmV2aWV3IGVsaWdpYmlsaXR5IGZvciBhIHBhcnRpY3VsYXIgdXNlclxuZXhwb3J0IGNvbnN0IGdldEFwcFJldmlld0VsaWdpYmlsaXR5ID0gLyogR3JhcGhRTCAqLyBgXG4gICAgcXVlcnkgR2V0QXBwUmV2aWV3RWxpZ2liaWxpdHkoJGdldEFwcFJldmlld0VsaWdpYmlsaXR5SW5wdXQ6IEdldEFwcFJldmlld0VsaWdpYmlsaXR5SW5wdXQhKSB7XG4gICAgICAgIGdldEFwcFJldmlld0VsaWdpYmlsaXR5KGdldEFwcFJldmlld0VsaWdpYmlsaXR5SW5wdXQ6ICRnZXRBcHBSZXZpZXdFbGlnaWJpbGl0eUlucHV0KSB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gUXVlcnkgdXNlZCB0byByZXRyaWV2ZSB0aGUgZmlsZXMgZm9yIGEgcGFydGljdWxhciB1c2VyIGZyb20gYSBidWNrZXQsIGlmIGV4aXN0ZW50LFxuLy8gc28gd2UgY2FuIHNlZSBpZiBhIHVzZXIgaGFzIHVwbG9hZGVkIGFueSBkb2N1bWVudGF0aW9uIGFuZC9vciBmaWxlcy5cbmV4cG9ydCBjb25zdCBnZXRGaWxlc0ZvclVzZXIgPSAvKiBHcmFwaFFMICovIGBcbiAgICBxdWVyeSBHZXRGaWxlc0ZvclVzZXIoJGdldEZpbGVzRm9yVXNlcklucHV0OiBHZXRGaWxlc0ZvclVzZXJJbnB1dCEpIHtcbiAgICAgICAgZ2V0RmlsZXNGb3JVc2VyKGdldEZpbGVzRm9yVXNlcklucHV0OiAkZ2V0RmlsZXNGb3JVc2VySW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhXG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBRdWVyeSB1c2VkIHRvIHJldHJpZXZlIGEgdXNlcidzIG1pbGl0YXJ5IHZlcmlmaWNhdGlvbiBpbmZvcm1hdGlvbiwgYmFzZWQgb24gdGhlaXIgSURcbi8vIG9yIGJhc2VkIG9uIGEgcGFydGljdWxhciBkYXRlLWJhc2VkIGZpbHRlclxuZXhwb3J0IGNvbnN0IGdldE1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5mb3JtYXRpb24gPSAvKiBHcmFwaFFMICovIGBcbiAgICBxdWVyeSBHZXRNaWxpdGFyeVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uKCRnZXRNaWxpdGFyeVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uSW5wdXQ6IEdldE1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5mb3JtYXRpb25JbnB1dCEpIHtcbiAgICAgICAgZ2V0TWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbihnZXRNaWxpdGFyeVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uSW5wdXQ6ICRnZXRNaWxpdGFyeVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZCxcbiAgICAgICAgICAgICAgICBmaXJzdE5hbWUsXG4gICAgICAgICAgICAgICAgbGFzdE5hbWUsXG4gICAgICAgICAgICAgICAgZGF0ZU9mQmlydGgsXG4gICAgICAgICAgICAgICAgZW5saXN0bWVudFllYXIsXG4gICAgICAgICAgICAgICAgYWRkcmVzc0xpbmUsXG4gICAgICAgICAgICAgICAgY2l0eSxcbiAgICAgICAgICAgICAgICBzdGF0ZSxcbiAgICAgICAgICAgICAgICB6aXBDb2RlLFxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdCxcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXQsXG4gICAgICAgICAgICAgICAgbWlsaXRhcnlEdXR5U3RhdHVzLFxuICAgICAgICAgICAgICAgIG1pbGl0YXJ5QnJhbmNoLFxuICAgICAgICAgICAgICAgIG1pbGl0YXJ5QWZmaWxpYXRpb24sXG4gICAgICAgICAgICAgICAgbWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIFF1ZXJ5IHVzZWQgdG8gcmV0cmlldmUgYSB1c2VyJ3MgY2FyZCBsaW5raW5nIElEIG9idGFpbmVkIGZyb20gYW4gaW50ZXJuYWwgTW9vbmJlYW0gSURcbmV4cG9ydCBjb25zdCBnZXRVc2VyQ2FyZExpbmtpbmdJZCA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIHF1ZXJ5IEdldFVzZXJDYXJkTGlua2luZ0lkKCRnZXRVc2VyQ2FyZExpbmtpbmdJZElucHV0OiBHZXRVc2VyQ2FyZExpbmtpbmdJZElucHV0ISkge1xuICAgICAgICBnZXRVc2VyQ2FyZExpbmtpbmdJZChnZXRVc2VyQ2FyZExpbmtpbmdJZElucHV0OiAkZ2V0VXNlckNhcmRMaW5raW5nSWRJbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGFcbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIFF1ZXJ5IHVzZWQgdG8gcmV0cmlldmUgYSB1c2VyJ3MgZGV0YWlscyBmcm9tIGEgcmVmZXJyYWwgY29kZVxuZXhwb3J0IGNvbnN0IGdldFVzZXJGcm9tUmVmZXJyYWwgPSAvKiBHcmFwaFFMICovIGBcbiAgICBxdWVyeSBHZXRVc2VyRnJvbVJlZmVycmFsKCRnZXRVc2VyRnJvbVJlZmZlcmFsSW5wdXQ6IFVzZXJGcm9tUmVmZXJyYWxJbnB1dCEpIHtcbiAgICAgICAgZ2V0VXNlckZyb21SZWZlcnJhbCh1c2VyRnJvbVJlZmVycmFsSW5wdXQ6ICRnZXRVc2VyRnJvbVJlZmZlcmFsSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhXG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBRdWVyeSB1c2VkIHRvIGdldCByZWZlcnJhbHMgZmlsdGVyZWQgYnkgYSBwYXJ0aWN1bGFyIHN0YXR1c1xuZXhwb3J0IGNvbnN0IGdldFJlZmVycmFsc0J5U3RhdHVzID0gLyogR3JhcGhRTCAqLyBgXG4gICAgcXVlcnkgR2V0UmVmZXJyYWxzQnlTdGF0dXMoJGdldFJlZmVycmFsc0J5U3RhdHVzSW5wdXQ6IEdldFJlZmVycmFsc0J5U3RhdHVzSW5wdXQhKSB7XG4gICAgICAgIGdldFJlZmVycmFsc0J5U3RhdHVzKGdldFJlZmVycmFsc0J5U3RhdHVzSW5wdXQ6ICRnZXRSZWZlcnJhbHNCeVN0YXR1c0lucHV0KSB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgZnJvbUlkXG4gICAgICAgICAgICAgICAgdGltZXN0YW1wXG4gICAgICAgICAgICAgICAgdG9JZFxuICAgICAgICAgICAgICAgIGNhbXBhaWduQ29kZVxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgIHN0YXR1c1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gUXVlcnkgdXNlZCB0byByZXRyaWV2ZSB0aGUgQXBwIFVwZ3JhZGUgY3JlZGVudGlhbHMvZGV0YWlsc1xuZXhwb3J0IGNvbnN0IGdldEFwcFVwZ3JhZGVDcmVkZW50aWFscyA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIHF1ZXJ5IEdldEFwcFVwZ3JhZGVDcmVkZW50aWFscyB7XG4gICAgICAgIGdldEFwcFVwZ3JhZGVDcmVkZW50aWFscyB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gUXVlcnkgdXNlZCB0byByZXRyaWV2ZSBhIFVzZXIgQXV0aCBTZXNzaW9uLCBmb3IgYSBwYXJ0aWN1bGFyIHVzZXJcbmV4cG9ydCBjb25zdCBnZXRVc2VyQXV0aFNlc3Npb24gPSAvKiBHcmFwaFFMICovIGBcbiAgICBxdWVyeSBHZXRVc2VyQXV0aFNlc3Npb24oJGdldFVzZXJBdXRoU2Vzc2lvbklucHV0OiBHZXRVc2VyQXV0aFNlc3Npb25JbnB1dCEpIHtcbiAgICAgICAgZ2V0VXNlckF1dGhTZXNzaW9uKGdldFVzZXJBdXRoU2Vzc2lvbklucHV0OiAkZ2V0VXNlckF1dGhTZXNzaW9uSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgIG51bWJlck9mU2Vzc2lvbnNcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIFF1ZXJ5IHVzZWQgdG8gcmV0cmlldmUgYWxsIE5vdGlmaWNhdGlvbiBSZW1pbmRlcnNcbmV4cG9ydCBjb25zdCBnZXROb3RpZmljYXRpb25SZW1pbmRlcnMgPSAvKiBHcmFwaFFMICovIGBcbiAgICBxdWVyeSBHZXROb3RpZmljYXRpb25SZW1pbmRlcnMge1xuICAgICAgICBnZXROb3RpZmljYXRpb25SZW1pbmRlcnMge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uUmVtaW5kZXJUeXBlXG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uUmVtaW5kZXJTdGF0dXNcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25SZW1pbmRlckNhZGVuY2VcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgICAgICBuZXh0VHJpZ2dlckF0XG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uQ2hhbm5lbFR5cGVcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25SZW1pbmRlckNvdW50XG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uUmVtaW5kZXJNYXhDb3VudFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gUXVlcnkgdXNlZCB0byByZXRyaWV2ZSBhbGwgVXNlcnMgZm9yIE5vdGlmaWNhdGlvbiBSZW1pbmRlcnNcbmV4cG9ydCBjb25zdCBnZXRBbGxVc2Vyc0Zvck5vdGlmaWNhdGlvblJlbWluZGVycyA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIHF1ZXJ5IEdldEFsbFVzZXJzRm9yTm90aWZpY2F0aW9uUmVtaW5kZXJzIHtcbiAgICAgICAgZ2V0QWxsVXNlcnNGb3JOb3RpZmljYXRpb25SZW1pbmRlcnMge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgZW1haWxcbiAgICAgICAgICAgICAgICBmaXJzdE5hbWVcbiAgICAgICAgICAgICAgICBsYXN0TmFtZVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gUXVlcnkgdXNlZCB0byByZXRyaWV2ZSBhbGwgVXNlcnMgZWxpZ2libGUgZm9yIFJlaW1idXJzZW1lbnRzXG5leHBvcnQgY29uc3QgZ2V0QWxsVXNlcnNFbGlnaWJsZUZvclJlaW1idXJzZW1lbnRzID0gLyogR3JhcGhRTCAqLyBgXG4gICAgcXVlcnkgR2V0QWxsVXNlcnNFbGlnaWJsZUZvclJlaW1idXJzZW1lbnRzIHtcbiAgICAgICAgZ2V0QWxsVXNlcnNFbGlnaWJsZUZvclJlaW1idXJzZW1lbnRzIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIGVtYWlsXG4gICAgICAgICAgICAgICAgZmlyc3ROYW1lXG4gICAgICAgICAgICAgICAgbGFzdE5hbWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIFF1ZXJ5IHVzZWQgdG8gcmV0cmlldmUgYWxsIFVzZXJzIGluZWxpZ2libGUgZm9yIFJlaW1idXJzZW1lbnRzXG5leHBvcnQgY29uc3QgZ2V0QWxsVXNlcnNJbmVsaWdpYmxlRm9yUmVpbWJ1cnNlbWVudHMgPSAvKiBHcmFwaFFMICovIGBcbiAgICBxdWVyeSBHZXRBbGxVc2Vyc0luZWxpZ2libGVGb3JSZWltYnVyc2VtZW50cyB7XG4gICAgICAgIGdldEFsbFVzZXJzSW5lbGlnaWJsZUZvclJlaW1idXJzZW1lbnRzIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIGVtYWlsXG4gICAgICAgICAgICAgICAgZmlyc3ROYW1lXG4gICAgICAgICAgICAgICAgbGFzdE5hbWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIFF1ZXJ5IHVzZWQgdG8gcmV0cmlldmUgYWxsIFVzZXJzIGZvciBOb3RpZmljYXRpb24gUmVtaW5kZXJzIHNvcnRlZCBieSBhIGdlb2dyYXBoaWNhbCBsb2NhdGlvblxuZXhwb3J0IGNvbnN0IGdldFVzZXJzQnlHZW9ncmFwaHlGb3JOb3RpZmljYXRpb25SZW1pbmRlcnMgPSAvKiBHcmFwaFFMICovIGBcbiAgICBxdWVyeSBHZXRVc2Vyc0J5R2VvZ3JhcGh5Rm9yTm90aWZpY2F0aW9uUmVtaW5kZXJzKCRnZXRVc2Vyc0J5R2VvZ3JhcGhpY2FsTG9jYXRpb25JbnB1dDogR2V0VXNlcnNCeUdlb2dyYXBoaWNhbExvY2F0aW9uSW5wdXQhKSB7XG4gICAgICAgIGdldFVzZXJzQnlHZW9ncmFwaHlGb3JOb3RpZmljYXRpb25SZW1pbmRlcnMoZ2V0VXNlcnNCeUdlb2dyYXBoaWNhbExvY2F0aW9uSW5wdXQ6ICRnZXRVc2Vyc0J5R2VvZ3JhcGhpY2FsTG9jYXRpb25JbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgZW1haWxcbiAgICAgICAgICAgICAgICBmaXJzdE5hbWVcbiAgICAgICAgICAgICAgICBsYXN0TmFtZVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gUXVlcnkgdXNlZCB0byBHZW9Db2RlIGFuZCBhZGRyZXNzIHVzaW5nIEdvb2dsZSdzIEFQSXNcbmV4cG9ydCBjb25zdCBnZW9Db2RlQXN5bmMgPSAvKiBHcmFwaFFMICovIGBcbiAgICBxdWVyeSBHZW9Db2RlQXN5bmMoJGdlb2NvZGVBc3luY0lucHV0OiBHZW9jb2RlQXN5bmNJbnB1dCEpIHtcbiAgICAgICAgZ2VvQ29kZUFzeW5jKGdlb2NvZGVBc3luY0lucHV0OiAkZ2VvY29kZUFzeW5jSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBsYXRpdHVkZVxuICAgICAgICAgICAgICAgIGxvbmdpdHVkZVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gUXVlcnkgdXNlZCB0byByZXRyaWV2ZSBhbGwgdGhlIEZBUXNcbmV4cG9ydCBjb25zdCBnZXRGQVFzID0gLyogR3JhcGhRTCAqLyBgXG4gICAgcXVlcnkgR2V0RkFRcyB7XG4gICAgICAgIGdldEZBUXMge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgdGl0bGVcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgICAgICBmYWN0cyB7XG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAgICAgIGxpbmthYmxlS2V5d29yZFxuICAgICAgICAgICAgICAgICAgICBsaW5rTG9jYXRpb25cbiAgICAgICAgICAgICAgICAgICAgdHlwZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIFF1ZXJ5IHVzZWQgdG8gcmV0cmlldmUgYWxsIEV2ZW50IFNlcmllcyBmb3IgdmFyaW91cyBwYXJ0bmVyIG9yZ2FuaXphdGlvbnNcbmV4cG9ydCBjb25zdCBnZXRFdmVudFNlcmllcyA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIHF1ZXJ5IEdldEV2ZW50U2VyaWVzIHtcbiAgICAgICAgZ2V0RXZlbnRTZXJpZXMge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgZXh0ZXJuYWxTZXJpZXNJRFxuICAgICAgICAgICAgICAgIGV4dGVybmFsT3JnSURcbiAgICAgICAgICAgICAgICBuYW1lXG4gICAgICAgICAgICAgICAgdGl0bGVcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgIGV2ZW50cyB7XG4gICAgICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgICAgIGV4dGVybmFsRXZlbnRJRFxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgICAgICB0aXRsZVxuICAgICAgICAgICAgICAgICAgICBldmVudExvZ29VcmxTbVxuICAgICAgICAgICAgICAgICAgICBldmVudExvZ29VcmxCZ1xuICAgICAgICAgICAgICAgICAgICBzdGFydFRpbWUge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGltZXpvbmVcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0c0F0TG9jYWxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0c0F0VVRDXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZW5kVGltZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lem9uZVxuICAgICAgICAgICAgICAgICAgICAgICAgZW5kc0F0TG9jYWxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZHNBdFVUQ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJlZ2lzdHJhdGlvblVybFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzZXJpZXNMb2dvVXJsU21cbiAgICAgICAgICAgICAgICBzZXJpZXNMb2dvVXJsQmdcbiAgICAgICAgICAgICAgICBzdGF0dXNcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIFF1ZXJ5IHVzZWQgdG8gcmV0cmlldmUgYWxsIHRoZSBTZXJ2aWNlIHBhcnRuZXIgb3JnYW5pemF0aW9uc1xuZXhwb3J0IGNvbnN0IGdldFNlcnZpY2VQYXJ0bmVycyA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIHF1ZXJ5IEdldFNlcnZpY2VQYXJ0bmVycyB7XG4gICAgICAgIGdldFNlcnZpY2VQYXJ0bmVycyB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICBzdGF0dXNcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgICAgICBuYW1lXG4gICAgICAgICAgICAgICAgc2hvcnREZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAgaXNPbmxpbmVcbiAgICAgICAgICAgICAgICBsb2dvVXJsXG4gICAgICAgICAgICAgICAgYWRkcmVzc0xpbmVcbiAgICAgICAgICAgICAgICBjaXR5XG4gICAgICAgICAgICAgICAgc3RhdGVcbiAgICAgICAgICAgICAgICB6aXBDb2RlXG4gICAgICAgICAgICAgICAgd2Vic2l0ZVxuICAgICAgICAgICAgICAgIHNlcnZpY2VzIHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGVcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZW1haWxcbiAgICAgICAgICAgICAgICBwaG9uZU51bWJlclxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSAgXG5gO1xuXG4vLyBRdWVyeSB1c2VkIHRvIHJldHJpZXZlIGFsbCB0aGUgRmlkZWxpcyBwYXJ0bmVyIG9mZmVycywgZmlsdGVyZWQgYnkgYnJhbmQvcGFydG5lciAoc28gd2UgY2FuIGRpc3BsYXkgdGhlbSBhcyBmZWF0dXJlZCBpbiB0aGUgc3RvcmUpXG5leHBvcnQgY29uc3QgZ2V0RmlkZWxpc1BhcnRuZXJzID0gLyogR3JhcGhRTCAqLyBgXG4gICAgcXVlcnkgR2V0RmlkZWxpc1BhcnRuZXJzIHtcbiAgICAgICAgZ2V0RmlkZWxpc1BhcnRuZXJzIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBicmFuZE5hbWVcbiAgICAgICAgICAgICAgICB2ZXRlcmFuT3duZWRcbiAgICAgICAgICAgICAgICBudW1iZXJPZk9mZmVyc1xuICAgICAgICAgICAgICAgIG9mZmVycyB7XG4gICAgICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgICAgIGNvcnBvcmF0ZUlkXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRcbiAgICAgICAgICAgICAgICAgICAgb2ZmZXJTdGF0ZVxuICAgICAgICAgICAgICAgICAgICBhdmFpbGFiaWxpdHlcbiAgICAgICAgICAgICAgICAgICAgYnJhbmRJZFxuICAgICAgICAgICAgICAgICAgICBicmFuZERiYVxuICAgICAgICAgICAgICAgICAgICBicmFuZExvZ29cbiAgICAgICAgICAgICAgICAgICAgYnJhbmRMb2dvU21cbiAgICAgICAgICAgICAgICAgICAgYnJhbmRCYW5uZXJcbiAgICAgICAgICAgICAgICAgICAgYnJhbmRQYXJlbnRDYXRlZ29yeVxuICAgICAgICAgICAgICAgICAgICBicmFuZFN0dWJDb3B5XG4gICAgICAgICAgICAgICAgICAgIGJyYW5kV2Vic2l0ZVxuICAgICAgICAgICAgICAgICAgICBzdG9yZURldGFpbHMge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIHBob25lXG4gICAgICAgICAgICAgICAgICAgICAgICBhZGRyZXNzMVxuICAgICAgICAgICAgICAgICAgICAgICAgY2l0eVxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGVcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50cnlDb2RlXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3N0Q29kZVxuICAgICAgICAgICAgICAgICAgICAgICAgZ2VvTG9jYXRpb24ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhdGl0dWRlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9uZ2l0dWRlXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpc09ubGluZVxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzdGFuY2VcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgICAgICByZWFjaFxuICAgICAgICAgICAgICAgICAgICB0aXRsZVxuICAgICAgICAgICAgICAgICAgICBxdWFsaWZpZXJcbiAgICAgICAgICAgICAgICAgICAgdGlsZVxuICAgICAgICAgICAgICAgICAgICBzdGFydERhdGVcbiAgICAgICAgICAgICAgICAgICAgZW5kRGF0ZVxuICAgICAgICAgICAgICAgICAgICBjdXJyZW5jeVxuICAgICAgICAgICAgICAgICAgICBleHRPZmZlcklkXG4gICAgICAgICAgICAgICAgICAgIHN1cHBsaWVyT2ZmZXJLZXlcbiAgICAgICAgICAgICAgICAgICAgcmVkZW1wdGlvblR5cGVcbiAgICAgICAgICAgICAgICAgICAgcmVkZW1wdGlvbkluc3RydWN0aW9uVXJsXG4gICAgICAgICAgICAgICAgICAgIHJlZGVtcHRpb25UcmlnZ2VyXG4gICAgICAgICAgICAgICAgICAgIGJ1ZGdldFxuICAgICAgICAgICAgICAgICAgICBkYXlzQXZhaWxhYmlsaXR5XG4gICAgICAgICAgICAgICAgICAgIHN0b3Jlc1xuICAgICAgICAgICAgICAgICAgICB0b3RhbFJlZGVlbUxpbWl0XG4gICAgICAgICAgICAgICAgICAgIHJlZGVlbUxpbWl0UGVyVXNlclxuICAgICAgICAgICAgICAgICAgICBwdXJjaGFzZUFtb3VudFxuICAgICAgICAgICAgICAgICAgICBwdXJjaGFzZUZyZXF1ZW5jeVxuICAgICAgICAgICAgICAgICAgICByZXdhcmQge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heFZhbHVlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBRdWVyeSB1c2VkIHRvIHNlYXJjaCBhbiBvZmZlciBiYXNlZCBvbiBjZXJ0YWluIGZpbHRlcmluZyAodGhpcyB3aWxsIHBhcyB0aHJvdWdoIG9mZmVycyBmcm9tIE9saXZlIGRpcmVjdGx5KVxuZXhwb3J0IGNvbnN0IHNlYXJjaE9mZmVycyA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIHF1ZXJ5IFNlYXJjaE9mZmVycygkc2VhcmNoT2ZmZXJzSW5wdXQ6IFNlYXJjaE9mZmVyc0lucHV0ISkge1xuICAgICAgICBzZWFyY2hPZmZlcnMoc2VhcmNoT2ZmZXJzSW5wdXQ6ICRzZWFyY2hPZmZlcnNJbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIHRvdGFsTnVtYmVyT2ZQYWdlc1xuICAgICAgICAgICAgICAgIHRvdGFsTnVtYmVyT2ZSZWNvcmRzXG4gICAgICAgICAgICAgICAgb2ZmZXJzIHtcbiAgICAgICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICAgICAgY29ycG9yYXRlSWRcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlZFxuICAgICAgICAgICAgICAgICAgICBvZmZlclN0YXRlXG4gICAgICAgICAgICAgICAgICAgIGF2YWlsYWJpbGl0eVxuICAgICAgICAgICAgICAgICAgICBicmFuZElkXG4gICAgICAgICAgICAgICAgICAgIGJyYW5kRGJhXG4gICAgICAgICAgICAgICAgICAgIGJyYW5kTG9nb1xuICAgICAgICAgICAgICAgICAgICBicmFuZExvZ29TbVxuICAgICAgICAgICAgICAgICAgICBicmFuZEJhbm5lclxuICAgICAgICAgICAgICAgICAgICBicmFuZFBhcmVudENhdGVnb3J5XG4gICAgICAgICAgICAgICAgICAgIGJyYW5kU3R1YkNvcHlcbiAgICAgICAgICAgICAgICAgICAgYnJhbmRXZWJzaXRlXG4gICAgICAgICAgICAgICAgICAgIHN0b3JlRGV0YWlscyB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgcGhvbmVcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkZHJlc3MxXG4gICAgICAgICAgICAgICAgICAgICAgICBjaXR5XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgY291bnRyeUNvZGVcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc3RDb2RlXG4gICAgICAgICAgICAgICAgICAgICAgICBnZW9Mb2NhdGlvbiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGF0aXR1ZGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb25naXR1ZGVcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlzT25saW5lXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXN0YW5jZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAgICAgIHJlYWNoXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlXG4gICAgICAgICAgICAgICAgICAgIHF1YWxpZmllclxuICAgICAgICAgICAgICAgICAgICB0aWxlXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0RGF0ZVxuICAgICAgICAgICAgICAgICAgICBlbmREYXRlXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbmN5XG4gICAgICAgICAgICAgICAgICAgIGV4dE9mZmVySWRcbiAgICAgICAgICAgICAgICAgICAgc3VwcGxpZXJPZmZlcktleVxuICAgICAgICAgICAgICAgICAgICByZWRlbXB0aW9uVHlwZVxuICAgICAgICAgICAgICAgICAgICByZWRlbXB0aW9uSW5zdHJ1Y3Rpb25VcmxcbiAgICAgICAgICAgICAgICAgICAgcmVkZW1wdGlvblRyaWdnZXJcbiAgICAgICAgICAgICAgICAgICAgYnVkZ2V0XG4gICAgICAgICAgICAgICAgICAgIGRheXNBdmFpbGFiaWxpdHlcbiAgICAgICAgICAgICAgICAgICAgc3RvcmVzXG4gICAgICAgICAgICAgICAgICAgIHRvdGFsUmVkZWVtTGltaXRcbiAgICAgICAgICAgICAgICAgICAgcmVkZWVtTGltaXRQZXJVc2VyXG4gICAgICAgICAgICAgICAgICAgIHB1cmNoYXNlQW1vdW50XG4gICAgICAgICAgICAgICAgICAgIHB1cmNoYXNlRnJlcXVlbmN5XG4gICAgICAgICAgICAgICAgICAgIHJld2FyZCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4VmFsdWVcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIFF1ZXJ5IHVzZWQgdG8gcmV0cmlldmUgYXZhaWxhYmxlIG9mZmVycyB1c2luZyBjZXJ0YWluIGZpbHRlcmluZyAodGhpcyB3aWxsIHBhc3MgdGhyb3VnaCBvZmZlcnMgZnJvbSBPbGl2ZSBkaXJlY3RseSlcbmV4cG9ydCBjb25zdCBnZXRPZmZlcnMgPSAvKiBHcmFwaFFMICovIGBcbiAgICBxdWVyeSBHZXRPZmZlcnMoJGdldE9mZmVyc0lucHV0OiBHZXRPZmZlcnNJbnB1dCEpIHtcbiAgICAgICAgZ2V0T2ZmZXJzKGdldE9mZmVyc0lucHV0OiAkZ2V0T2ZmZXJzSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICB0b3RhbE51bWJlck9mUGFnZXNcbiAgICAgICAgICAgICAgICB0b3RhbE51bWJlck9mUmVjb3Jkc1xuICAgICAgICAgICAgICAgIG9mZmVycyB7XG4gICAgICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgICAgIGNvcnBvcmF0ZUlkXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRcbiAgICAgICAgICAgICAgICAgICAgb2ZmZXJTdGF0ZVxuICAgICAgICAgICAgICAgICAgICBhdmFpbGFiaWxpdHlcbiAgICAgICAgICAgICAgICAgICAgYnJhbmRJZFxuICAgICAgICAgICAgICAgICAgICBicmFuZERiYVxuICAgICAgICAgICAgICAgICAgICBicmFuZExvZ29cbiAgICAgICAgICAgICAgICAgICAgYnJhbmRMb2dvU21cbiAgICAgICAgICAgICAgICAgICAgYnJhbmRCYW5uZXJcbiAgICAgICAgICAgICAgICAgICAgYnJhbmRQYXJlbnRDYXRlZ29yeVxuICAgICAgICAgICAgICAgICAgICBicmFuZFN0dWJDb3B5XG4gICAgICAgICAgICAgICAgICAgIGJyYW5kV2Vic2l0ZVxuICAgICAgICAgICAgICAgICAgICBzdG9yZURldGFpbHMge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIHBob25lXG4gICAgICAgICAgICAgICAgICAgICAgICBhZGRyZXNzMVxuICAgICAgICAgICAgICAgICAgICAgICAgY2l0eVxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGVcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50cnlDb2RlXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3N0Q29kZVxuICAgICAgICAgICAgICAgICAgICAgICAgZ2VvTG9jYXRpb24ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhdGl0dWRlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9uZ2l0dWRlXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpc09ubGluZVxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzdGFuY2VcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgICAgICByZWFjaFxuICAgICAgICAgICAgICAgICAgICB0aXRsZVxuICAgICAgICAgICAgICAgICAgICBxdWFsaWZpZXJcbiAgICAgICAgICAgICAgICAgICAgdGlsZVxuICAgICAgICAgICAgICAgICAgICBzdGFydERhdGVcbiAgICAgICAgICAgICAgICAgICAgZW5kRGF0ZVxuICAgICAgICAgICAgICAgICAgICBjdXJyZW5jeVxuICAgICAgICAgICAgICAgICAgICBleHRPZmZlcklkXG4gICAgICAgICAgICAgICAgICAgIHN1cHBsaWVyT2ZmZXJLZXlcbiAgICAgICAgICAgICAgICAgICAgcmVkZW1wdGlvblR5cGVcbiAgICAgICAgICAgICAgICAgICAgcmVkZW1wdGlvbkluc3RydWN0aW9uVXJsXG4gICAgICAgICAgICAgICAgICAgIHJlZGVtcHRpb25UcmlnZ2VyXG4gICAgICAgICAgICAgICAgICAgIGJ1ZGdldFxuICAgICAgICAgICAgICAgICAgICBkYXlzQXZhaWxhYmlsaXR5XG4gICAgICAgICAgICAgICAgICAgIHN0b3Jlc1xuICAgICAgICAgICAgICAgICAgICB0b3RhbFJlZGVlbUxpbWl0XG4gICAgICAgICAgICAgICAgICAgIHJlZGVlbUxpbWl0UGVyVXNlclxuICAgICAgICAgICAgICAgICAgICBwdXJjaGFzZUFtb3VudFxuICAgICAgICAgICAgICAgICAgICBwdXJjaGFzZUZyZXF1ZW5jeVxuICAgICAgICAgICAgICAgICAgICByZXdhcmQge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heFZhbHVlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBRdWVyeSB1c2VkIHRvIHJldHJpZXZlIGF2YWlsYWJsZSBzZWFzb25hbCBvZmZlcnMgdXNpbmcgY2VydGFpbiBmaWx0ZXJpbmcgKHRoaXMgd2lsbCBwYXNzIHRocm91Z2ggc2Vhc29uYWwgb2ZmZXJzIGZyb20gT2xpdmUgZGlyZWN0bHkpXG5leHBvcnQgY29uc3QgZ2V0U2Vhc29uYWxPZmZlcnMgPSAvKiBHcmFwaFFMICovIGBcbiAgICBxdWVyeSBHZXRTZWFzb25hbE9mZmVycygkZ2V0T2ZmZXJzSW5wdXQ6IEdldE9mZmVyc0lucHV0ISkge1xuICAgICAgICBnZXRTZWFzb25hbE9mZmVycyhnZXRPZmZlcnNJbnB1dDogJGdldE9mZmVyc0lucHV0KSB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgdG90YWxOdW1iZXJPZlBhZ2VzXG4gICAgICAgICAgICAgICAgdG90YWxOdW1iZXJPZlJlY29yZHNcbiAgICAgICAgICAgICAgICBvZmZlcnMge1xuICAgICAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgICAgICBjb3Jwb3JhdGVJZFxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVkXG4gICAgICAgICAgICAgICAgICAgIG9mZmVyU3RhdGVcbiAgICAgICAgICAgICAgICAgICAgYXZhaWxhYmlsaXR5XG4gICAgICAgICAgICAgICAgICAgIGJyYW5kSWRcbiAgICAgICAgICAgICAgICAgICAgYnJhbmREYmFcbiAgICAgICAgICAgICAgICAgICAgYnJhbmRMb2dvXG4gICAgICAgICAgICAgICAgICAgIGJyYW5kTG9nb1NtXG4gICAgICAgICAgICAgICAgICAgIGJyYW5kQmFubmVyXG4gICAgICAgICAgICAgICAgICAgIGJyYW5kUGFyZW50Q2F0ZWdvcnlcbiAgICAgICAgICAgICAgICAgICAgYnJhbmRTdHViQ29weVxuICAgICAgICAgICAgICAgICAgICBicmFuZFdlYnNpdGVcbiAgICAgICAgICAgICAgICAgICAgc3RvcmVEZXRhaWxzIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICBwaG9uZVxuICAgICAgICAgICAgICAgICAgICAgICAgYWRkcmVzczFcbiAgICAgICAgICAgICAgICAgICAgICAgIGNpdHlcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlXG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudHJ5Q29kZVxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zdENvZGVcbiAgICAgICAgICAgICAgICAgICAgICAgIGdlb0xvY2F0aW9uIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXRpdHVkZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvbmdpdHVkZVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaXNPbmxpbmVcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3RhbmNlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICAgICAgcmVhY2hcbiAgICAgICAgICAgICAgICAgICAgdGl0bGVcbiAgICAgICAgICAgICAgICAgICAgcXVhbGlmaWVyXG4gICAgICAgICAgICAgICAgICAgIHRpbGVcbiAgICAgICAgICAgICAgICAgICAgc3RhcnREYXRlXG4gICAgICAgICAgICAgICAgICAgIGVuZERhdGVcbiAgICAgICAgICAgICAgICAgICAgY3VycmVuY3lcbiAgICAgICAgICAgICAgICAgICAgZXh0T2ZmZXJJZFxuICAgICAgICAgICAgICAgICAgICBzdXBwbGllck9mZmVyS2V5XG4gICAgICAgICAgICAgICAgICAgIHJlZGVtcHRpb25UeXBlXG4gICAgICAgICAgICAgICAgICAgIHJlZGVtcHRpb25JbnN0cnVjdGlvblVybFxuICAgICAgICAgICAgICAgICAgICByZWRlbXB0aW9uVHJpZ2dlclxuICAgICAgICAgICAgICAgICAgICBidWRnZXRcbiAgICAgICAgICAgICAgICAgICAgZGF5c0F2YWlsYWJpbGl0eVxuICAgICAgICAgICAgICAgICAgICBzdG9yZXNcbiAgICAgICAgICAgICAgICAgICAgdG90YWxSZWRlZW1MaW1pdFxuICAgICAgICAgICAgICAgICAgICByZWRlZW1MaW1pdFBlclVzZXJcbiAgICAgICAgICAgICAgICAgICAgcHVyY2hhc2VBbW91bnRcbiAgICAgICAgICAgICAgICAgICAgcHVyY2hhc2VGcmVxdWVuY3lcbiAgICAgICAgICAgICAgICAgICAgcmV3YXJkIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhWYWx1ZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gUXVlcnkgdXNlZCB0byByZXRyaWV2ZSBhdmFpbGFibGUgcHJlbWllciBvZmZlcnMgdXNpbmcgY2VydGFpbiBmaWx0ZXJpbmcgKHRoaXMgd2lsbCBwYXNzIHRocm91Z2ggcHJlbWllciBvZmZlcnMgZnJvbSBPbGl2ZSBkaXJlY3RseSlcbmV4cG9ydCBjb25zdCBnZXRQcmVtaWVyT2ZmZXJzID0gLyogR3JhcGhRTCAqLyBgXG4gICAgcXVlcnkgR2V0UHJlbWllck9mZmVycygkZ2V0T2ZmZXJzSW5wdXQ6IEdldE9mZmVyc0lucHV0ISkge1xuICAgICAgICBnZXRQcmVtaWVyT2ZmZXJzKGdldE9mZmVyc0lucHV0OiAkZ2V0T2ZmZXJzSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICB0b3RhbE51bWJlck9mUGFnZXNcbiAgICAgICAgICAgICAgICB0b3RhbE51bWJlck9mUmVjb3Jkc1xuICAgICAgICAgICAgICAgIG9mZmVycyB7XG4gICAgICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgICAgIGNvcnBvcmF0ZUlkXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRcbiAgICAgICAgICAgICAgICAgICAgb2ZmZXJTdGF0ZVxuICAgICAgICAgICAgICAgICAgICBhdmFpbGFiaWxpdHlcbiAgICAgICAgICAgICAgICAgICAgYnJhbmRJZFxuICAgICAgICAgICAgICAgICAgICBicmFuZERiYVxuICAgICAgICAgICAgICAgICAgICBicmFuZExvZ29cbiAgICAgICAgICAgICAgICAgICAgYnJhbmRMb2dvU21cbiAgICAgICAgICAgICAgICAgICAgYnJhbmRCYW5uZXJcbiAgICAgICAgICAgICAgICAgICAgYnJhbmRQYXJlbnRDYXRlZ29yeVxuICAgICAgICAgICAgICAgICAgICBicmFuZFN0dWJDb3B5XG4gICAgICAgICAgICAgICAgICAgIGJyYW5kV2Vic2l0ZVxuICAgICAgICAgICAgICAgICAgICBzdG9yZURldGFpbHMge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIHBob25lXG4gICAgICAgICAgICAgICAgICAgICAgICBhZGRyZXNzMVxuICAgICAgICAgICAgICAgICAgICAgICAgY2l0eVxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGVcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50cnlDb2RlXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3N0Q29kZVxuICAgICAgICAgICAgICAgICAgICAgICAgZ2VvTG9jYXRpb24ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhdGl0dWRlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9uZ2l0dWRlXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpc09ubGluZVxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzdGFuY2VcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgICAgICByZWFjaFxuICAgICAgICAgICAgICAgICAgICB0aXRsZVxuICAgICAgICAgICAgICAgICAgICBxdWFsaWZpZXJcbiAgICAgICAgICAgICAgICAgICAgdGlsZVxuICAgICAgICAgICAgICAgICAgICBzdGFydERhdGVcbiAgICAgICAgICAgICAgICAgICAgZW5kRGF0ZVxuICAgICAgICAgICAgICAgICAgICBjdXJyZW5jeVxuICAgICAgICAgICAgICAgICAgICBleHRPZmZlcklkXG4gICAgICAgICAgICAgICAgICAgIHN1cHBsaWVyT2ZmZXJLZXlcbiAgICAgICAgICAgICAgICAgICAgcmVkZW1wdGlvblR5cGVcbiAgICAgICAgICAgICAgICAgICAgcmVkZW1wdGlvbkluc3RydWN0aW9uVXJsXG4gICAgICAgICAgICAgICAgICAgIHJlZGVtcHRpb25UcmlnZ2VyXG4gICAgICAgICAgICAgICAgICAgIGJ1ZGdldFxuICAgICAgICAgICAgICAgICAgICBkYXlzQXZhaWxhYmlsaXR5XG4gICAgICAgICAgICAgICAgICAgIHN0b3Jlc1xuICAgICAgICAgICAgICAgICAgICB0b3RhbFJlZGVlbUxpbWl0XG4gICAgICAgICAgICAgICAgICAgIHJlZGVlbUxpbWl0UGVyVXNlclxuICAgICAgICAgICAgICAgICAgICBwdXJjaGFzZUFtb3VudFxuICAgICAgICAgICAgICAgICAgICBwdXJjaGFzZUZyZXF1ZW5jeVxuICAgICAgICAgICAgICAgICAgICByZXdhcmQge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heFZhbHVlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBRdWVyeSB1c2VkIHRvIHJldHJpZXZlIGEgcGFydGljdWxhciBwaHlzaWNhbCBkZXZpY2UgZm9yIGEgdXNlciwgYmFzZWQgb24gYSB1c2VyIElEIGFuZCBkZXZpY2UgdG9rZW4uXG5leHBvcnQgY29uc3QgZ2V0RGV2aWNlc0ZvclVzZXIgPSAvKiBHcmFwaFFMICovIGBcbiAgICBxdWVyeSBHZXREZXZpY2VzRm9yVXNlcigkZ2V0RGV2aWNlc0ZvclVzZXJJbnB1dDogR2V0RGV2aWNlc0ZvclVzZXJJbnB1dCEpIHtcbiAgICAgICAgZ2V0RGV2aWNlc0ZvclVzZXIoZ2V0RGV2aWNlc0ZvclVzZXJJbnB1dDogJGdldERldmljZXNGb3JVc2VySW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIHRva2VuSWRcbiAgICAgICAgICAgICAgICBkZXZpY2VTdGF0ZVxuICAgICAgICAgICAgICAgIGxhc3RMb2dpbkRhdGVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIFF1ZXJ5IHVzZWQgdG8gcmV0cmlldmUgYSBwYXJ0aWN1bGFyIHBoeXNpY2FsIGRldmljZSBmb3IgYSB1c2VyLCBiYXNlZCBvbiBhIHVzZXIgSUQgYW5kIGRldmljZSB0b2tlbi5cbmV4cG9ydCBjb25zdCBnZXREZXZpY2UgPSAvKiBHcmFwaFFMICovIGBcbiAgICBxdWVyeSBHZXREZXZpY2UoJGdldERldmljZUlucHV0OiBHZXREZXZpY2VJbnB1dCEpIHtcbiAgICAgICAgZ2V0RGV2aWNlKGdldERldmljZUlucHV0OiAkZ2V0RGV2aWNlSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIHRva2VuSWRcbiAgICAgICAgICAgICAgICBkZXZpY2VTdGF0ZVxuICAgICAgICAgICAgICAgIGxhc3RMb2dpbkRhdGVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIFF1ZXJ5IHVzZWQgdG8gcmV0cmlldmUgYSBwYXJ0aWN1bGFyIHBoeXNpY2FsIGRldmljZSwgYmFzZWQgaXRzIHRva2VuLlxuZXhwb3J0IGNvbnN0IGdldERldmljZUJ5VG9rZW4gPSAvKiBHcmFwaFFMICovIGBcbiAgICBxdWVyeSBHZXREZXZpY2VCeVRva2VuKCRnZXREZXZpY2VCeVRva2VuSW5wdXQ6IEdldERldmljZUJ5VG9rZW5JbnB1dCEpIHtcbiAgICAgICAgZ2V0RGV2aWNlQnlUb2tlbihnZXREZXZpY2VCeVRva2VuSW5wdXQ6ICRnZXREZXZpY2VCeVRva2VuSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIHRva2VuSWRcbiAgICAgICAgICAgICAgICBkZXZpY2VTdGF0ZVxuICAgICAgICAgICAgICAgIGxhc3RMb2dpbkRhdGVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIFF1ZXJ5IHVzZWQgdG8gcmV0cmlldmUgdHJhbnNhY3Rpb25zIHdpdGhpbiBhIHNwZWNpZmljIHRpbWVmcmFtZVxuZXhwb3J0IGNvbnN0IGdldFRyYW5zYWN0aW9uc0luUmFuZ2UgPSAvKiBHcmFwaFFMICovIGBcbiAgICBxdWVyeSBnZXRUcmFuc2FjdGlvbnNJblJhbmdlKCRnZXRUcmFuc2FjdGlvbnNJblJhbmdlSW5wdXQ6IEdldFRyYW5zYWN0aW9uc0luUmFuZ2VJbnB1dCEpIHtcbiAgICAgICAgZ2V0VHJhbnNhY3Rpb25zSW5SYW5nZShnZXRUcmFuc2FjdGlvbnNJblJhbmdlSW5wdXQ6ICRnZXRUcmFuc2FjdGlvbnNJblJhbmdlSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIHRpbWVzdGFtcFxuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uSWRcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvblN0YXR1c1xuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uVHlwZVxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgIG1lbWJlcklkXG4gICAgICAgICAgICAgICAgY2FyZElkXG4gICAgICAgICAgICAgICAgYnJhbmRJZFxuICAgICAgICAgICAgICAgIHN0b3JlSWRcbiAgICAgICAgICAgICAgICBjYXRlZ29yeVxuICAgICAgICAgICAgICAgIGN1cnJlbmN5Q29kZVxuICAgICAgICAgICAgICAgIHJld2FyZEFtb3VudFxuICAgICAgICAgICAgICAgIHRvdGFsQW1vdW50XG4gICAgICAgICAgICAgICAgcGVuZGluZ0Nhc2hiYWNrQW1vdW50XG4gICAgICAgICAgICAgICAgY3JlZGl0ZWRDYXNoYmFja0Ftb3VudFxuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uQnJhbmROYW1lXG4gICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25CcmFuZEFkZHJlc3NcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbkJyYW5kTG9nb1VybFxuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uQnJhbmRVUkxBZGRyZXNzXG4gICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25Jc09ubGluZVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gUXVlcnkgdXNlZCB0byByZXRyaWV2ZSB0cmFuc2FjdGlvbnMgZm9yIGEgcGFydGljdWxhciB1c2VyLCB3aXRoaW4gYSBzcGVjaWZpYyB0aW1lZnJhbWVcbmV4cG9ydCBjb25zdCBnZXRUcmFuc2FjdGlvbiA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIHF1ZXJ5IEdldFRyYW5zYWN0aW9uKCRnZXRUcmFuc2FjdGlvbklucHV0OiBHZXRUcmFuc2FjdGlvbklucHV0ISkge1xuICAgICAgICBnZXRUcmFuc2FjdGlvbihnZXRUcmFuc2FjdGlvbklucHV0OiAkZ2V0VHJhbnNhY3Rpb25JbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgdGltZXN0YW1wXG4gICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25JZFxuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uU3RhdHVzXG4gICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25UeXBlXG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgbWVtYmVySWRcbiAgICAgICAgICAgICAgICBjYXJkSWRcbiAgICAgICAgICAgICAgICBicmFuZElkXG4gICAgICAgICAgICAgICAgc3RvcmVJZFxuICAgICAgICAgICAgICAgIGNhdGVnb3J5XG4gICAgICAgICAgICAgICAgY3VycmVuY3lDb2RlXG4gICAgICAgICAgICAgICAgcmV3YXJkQW1vdW50XG4gICAgICAgICAgICAgICAgdG90YWxBbW91bnRcbiAgICAgICAgICAgICAgICBwZW5kaW5nQ2FzaGJhY2tBbW91bnRcbiAgICAgICAgICAgICAgICBjcmVkaXRlZENhc2hiYWNrQW1vdW50XG4gICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25CcmFuZE5hbWVcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbkJyYW5kQWRkcmVzc1xuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uQnJhbmRMb2dvVXJsXG4gICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25CcmFuZFVSTEFkZHJlc3NcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbklzT25saW5lXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBRdWVyeSB1c2VkIHRvIHJldHJpZXZlIHRyYW5zYWN0aW9ucyBmb3IgYSBwYXJ0aWN1bGFyIHVzZXIsIGluIGEgcGFydGljdWxhciBzdGF0dXNcbmV4cG9ydCBjb25zdCBnZXRUcmFuc2FjdGlvbkJ5U3RhdHVzID0gLyogR3JhcGhRTCAqLyBgXG4gICAgcXVlcnkgR2V0VHJhbnNhY3Rpb25CeVN0YXR1cygkZ2V0VHJhbnNhY3Rpb25CeVN0YXR1c0lucHV0OiBHZXRUcmFuc2FjdGlvbkJ5U3RhdHVzSW5wdXQhKSB7XG4gICAgICAgIGdldFRyYW5zYWN0aW9uQnlTdGF0dXMoZ2V0VHJhbnNhY3Rpb25CeVN0YXR1c0lucHV0OiAkZ2V0VHJhbnNhY3Rpb25CeVN0YXR1c0lucHV0KSB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXBcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbklkXG4gICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25TdGF0dXNcbiAgICAgICAgICAgICAgICBjcmVkaXRlZENhc2hiYWNrQW1vdW50XG4gICAgICAgICAgICAgICAgcGVuZGluZ0Nhc2hiYWNrQW1vdW50XG4gICAgICAgICAgICAgICAgcmV3YXJkQW1vdW50XG4gICAgICAgICAgICAgICAgdG90YWxBbW91bnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIFF1ZXJ5IHVzZWQgdG8gcmV0cmlldmUgYSBjYXJkIGxpbmsgZm9yIGEgcGFydGljdWxhciB1c2VyXG5leHBvcnQgY29uc3QgZ2V0Q2FyZExpbmsgPSAvKiBHcmFwaFFMICovIGBcbiAgICBxdWVyeSBHZXRDYXJkTGluaygkZ2V0Q2FyZExpbmtJbnB1dDogR2V0Q2FyZExpbmtJbnB1dCEpIHtcbiAgICAgICAgZ2V0Q2FyZExpbmsoZ2V0Q2FyZExpbmtJbnB1dDogJGdldENhcmRMaW5rSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIG1lbWJlcklkXG4gICAgICAgICAgICAgICAgY2FyZHMge1xuICAgICAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgICAgICBhcHBsaWNhdGlvbklEXG4gICAgICAgICAgICAgICAgICAgIHRva2VuXG4gICAgICAgICAgICAgICAgICAgIHR5cGVcbiAgICAgICAgICAgICAgICAgICAgbmFtZVxuICAgICAgICAgICAgICAgICAgICBsYXN0NFxuICAgICAgICAgICAgICAgICAgICBleHBpcmF0aW9uXG4gICAgICAgICAgICAgICAgICAgIGFkZGl0aW9uYWxQcm9ncmFtSURcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgc3RhdHVzXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBRdWVyeSB1c2VkIHRvIHJldHJpZXZlIGFsbCB1c2VycyB3aXRoIG5vIGxpbmtlZCBjYXJkc1xuZXhwb3J0IGNvbnN0IGdldFVzZXJzV2l0aE5vQ2FyZHMgPSAvKiBHcmFwaFFMICovIGBcbiAgICBxdWVyeSBHZXRVc2Vyc1dpdGhOb0NhcmRzIHtcbiAgICAgICAgZ2V0VXNlcnNXaXRoTm9DYXJkcyB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICBlbWFpbFxuICAgICAgICAgICAgICAgIGZpcnN0TmFtZVxuICAgICAgICAgICAgICAgIGxhc3ROYW1lXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBRdWVyeSB1c2VkIHRvIHJldHJpZXZlIGFsbCB1c2VycyB3aXRoIGxpbmtlZCBjYXJkcywgZWxpZ2libGUgZm9yIHJlaW1idXJzZW1lbnRzXG5leHBvcnQgY29uc3QgZ2V0RWxpZ2libGVMaW5rZWRVc2VycyA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIHF1ZXJ5IEdldEVsaWdpYmxlTGlua2VkVXNlcnMge1xuICAgICAgICBnZXRFbGlnaWJsZUxpbmtlZFVzZXJzIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIGNhcmRJZHNcbiAgICAgICAgICAgICAgICBtZW1iZXJJZFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuXG4vLyBRdWVyeSB1c2VkIHRvIHJldHJpZXZlIGEgZmlsZSBmcm9tIHN0b3JhZ2VcbmV4cG9ydCBjb25zdCBnZXRTdG9yYWdlID0gLyogR3JhcGhRTCAqLyBgXG4gICAgcXVlcnkgR2V0U3RvcmFnZSgkZ2V0U3RvcmFnZUlucHV0OiBHZXRTdG9yYWdlSW5wdXQhKSB7XG4gICAgICAgIGdldFN0b3JhZ2UoZ2V0U3RvcmFnZUlucHV0OiAkZ2V0U3RvcmFnZUlucHV0KSB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgdXJsXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBRdWVyeSB1c2VkIHRvIGdldCB0aGUgdmVyaWZpY2F0aW9uIHN0YXR1cyBvZiBhIHBhcnRpY3VsYXIgaW5kaXZpZHVhbFxuZXhwb3J0IGNvbnN0IGdldE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzID0gLyogR3JhcGhRTCAqLyBgXG4gICAgcXVlcnkgR2V0TWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXMoJGdldE1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQ6IEdldE1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQhKSB7XG4gICAgICAgIGdldE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzKGdldE1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQ6ICRnZXRNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0KSB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICBtaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcbiJdfQ==