"use strict";
/**
 * This is a file used to define the all GraphQL query constants
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMilitaryVerificationStatus = exports.getStorage = exports.getEligibleLinkedUsers = exports.getUsersWithNoCards = exports.getCardLink = exports.getTransactionByStatus = exports.getTransaction = exports.getDeviceByToken = exports.getDevice = exports.getDevicesForUser = exports.getPremierOffers = exports.getSeasonalOffers = exports.getOffers = exports.searchOffers = exports.getFidelisPartners = exports.getServicePartners = exports.getEventSeries = exports.getFAQs = exports.geoCodeAsync = exports.getUsersByGeographyForNotificationReminders = exports.getAllUsersForNotificationReminders = exports.getNotificationReminders = exports.getUserAuthSession = exports.getAppUpgradeCredentials = exports.getReferralsByStatus = exports.getUserFromReferral = exports.getUserCardLinkingId = exports.getMilitaryVerificationInformation = exports.getFilesForUser = exports.getAppReviewEligibility = exports.getLocationPredictions = exports.getReimbursements = exports.getNotificationByType = void 0;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUXVlcmllcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9ncmFwaHFsL3F1ZXJpZXMvUXVlcmllcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7OztBQUVILHVGQUF1RjtBQUMxRSxRQUFBLHFCQUFxQixHQUFpQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0F1QmxELENBQUM7QUFFRixrRUFBa0U7QUFDckQsUUFBQSxpQkFBaUIsR0FBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0EyQzlDLENBQUM7QUFFRiwrREFBK0Q7QUFDbEQsUUFBQSxzQkFBc0IsR0FBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBaUJuRCxDQUFDO0FBRUYsMEVBQTBFO0FBQzdELFFBQUEsdUJBQXVCLEdBQWlCOzs7Ozs7OztDQVFwRCxDQUFDO0FBRUYscUZBQXFGO0FBQ3JGLHVFQUF1RTtBQUMxRCxRQUFBLGVBQWUsR0FBaUI7Ozs7Ozs7O0NBUTVDLENBQUM7QUFFRix1RkFBdUY7QUFDdkYsNkNBQTZDO0FBQ2hDLFFBQUEsa0NBQWtDLEdBQWlCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0F3Qi9ELENBQUM7QUFFRix3RkFBd0Y7QUFDM0UsUUFBQSxvQkFBb0IsR0FBaUI7Ozs7Ozs7O0NBUWpELENBQUM7QUFFRiwrREFBK0Q7QUFDbEQsUUFBQSxtQkFBbUIsR0FBaUI7Ozs7Ozs7O0NBUWhELENBQUM7QUFFRiw4REFBOEQ7QUFDakQsUUFBQSxvQkFBb0IsR0FBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FnQmpELENBQUM7QUFFRiw2REFBNkQ7QUFDaEQsUUFBQSx3QkFBd0IsR0FBaUI7Ozs7Ozs7O0NBUXJELENBQUM7QUFFRixvRUFBb0U7QUFDdkQsUUFBQSxrQkFBa0IsR0FBaUI7Ozs7Ozs7Ozs7Ozs7Q0FhL0MsQ0FBQztBQUVGLG9EQUFvRDtBQUN2QyxRQUFBLHdCQUF3QixHQUFpQjs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQW1CckQsQ0FBQztBQUVGLDhEQUE4RDtBQUNqRCxRQUFBLG1DQUFtQyxHQUFpQjs7Ozs7Ozs7Ozs7OztDQWFoRSxDQUFDO0FBRUYsZ0dBQWdHO0FBQ25GLFFBQUEsMkNBQTJDLEdBQWlCOzs7Ozs7Ozs7Ozs7O0NBYXhFLENBQUM7QUFFRix3REFBd0Q7QUFDM0MsUUFBQSxZQUFZLEdBQWlCOzs7Ozs7Ozs7OztDQVd6QyxDQUFDO0FBRUYsc0NBQXNDO0FBQ3pCLFFBQUEsT0FBTyxHQUFpQjs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQW1CcEMsQ0FBQztBQUVGLDRFQUE0RTtBQUMvRCxRQUFBLGNBQWMsR0FBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXVDM0MsQ0FBQztBQUVGLCtEQUErRDtBQUNsRCxRQUFBLGtCQUFrQixHQUFpQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0E2Qi9DLENBQUM7QUFFRixxSUFBcUk7QUFDeEgsUUFBQSxrQkFBa0IsR0FBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBb0UvQyxDQUFDO0FBRUYsOEdBQThHO0FBQ2pHLFFBQUEsWUFBWSxHQUFpQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQW1FekMsQ0FBQztBQUVGLHNIQUFzSDtBQUN6RyxRQUFBLFNBQVMsR0FBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FtRXRDLENBQUM7QUFFRix3SUFBd0k7QUFDM0gsUUFBQSxpQkFBaUIsR0FBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FtRTlDLENBQUM7QUFFRixzSUFBc0k7QUFDekgsUUFBQSxnQkFBZ0IsR0FBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FtRTdDLENBQUM7QUFFRix1R0FBdUc7QUFDMUYsUUFBQSxpQkFBaUIsR0FBaUI7Ozs7Ozs7Ozs7Ozs7Q0FhOUMsQ0FBQztBQUVGLHVHQUF1RztBQUMxRixRQUFBLFNBQVMsR0FBaUI7Ozs7Ozs7Ozs7Ozs7Q0FhdEMsQ0FBQztBQUVGLHdFQUF3RTtBQUMzRCxRQUFBLGdCQUFnQixHQUFpQjs7Ozs7Ozs7Ozs7OztDQWE3QyxDQUFDO0FBRUYseUZBQXlGO0FBQzVFLFFBQUEsY0FBYyxHQUFpQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQStCM0MsQ0FBQztBQUVGLG9GQUFvRjtBQUN2RSxRQUFBLHNCQUFzQixHQUFpQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FpQm5ELENBQUM7QUFFRiwyREFBMkQ7QUFDOUMsUUFBQSxXQUFXLEdBQWlCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0F3QnhDLENBQUM7QUFFRix3REFBd0Q7QUFDM0MsUUFBQSxtQkFBbUIsR0FBaUI7Ozs7Ozs7Ozs7Ozs7Q0FhaEQsQ0FBQztBQUVGLGtGQUFrRjtBQUNyRSxRQUFBLHNCQUFzQixHQUFpQjs7Ozs7Ozs7Ozs7O0NBWW5ELENBQUM7QUFHRiw2Q0FBNkM7QUFDaEMsUUFBQSxVQUFVLEdBQWlCOzs7Ozs7Ozs7O0NBVXZDLENBQUM7QUFFRix1RUFBdUU7QUFDMUQsUUFBQSw2QkFBNkIsR0FBaUI7Ozs7Ozs7Ozs7O0NBVzFELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFRoaXMgaXMgYSBmaWxlIHVzZWQgdG8gZGVmaW5lIHRoZSBhbGwgR3JhcGhRTCBxdWVyeSBjb25zdGFudHNcbiAqL1xuXG4vLyBRdWVyeSB1c2VkIHRvIHJldHJpZXZlIG5vdGlmaWNhdGlvbnMgc29ydGVkIGJ5IHRoZWlyIGNyZWF0aW9uIGRhdGUsIGdpdmVuIHRoZWlyIHR5cGVcbmV4cG9ydCBjb25zdCBnZXROb3RpZmljYXRpb25CeVR5cGUgPSAvKiBHcmFwaFFMICovIGBcbiAgICBxdWVyeSBHZXROb3RpZmljYXRpb25CeVR5cGUoJGdldE5vdGlmaWNhdGlvbkJ5VHlwZUlucHV0OiBHZXROb3RpZmljYXRpb25CeVR5cGVJbnB1dCEpIHtcbiAgICAgICAgZ2V0Tm90aWZpY2F0aW9uQnlUeXBlKGdldE5vdGlmaWNhdGlvbkJ5VHlwZUlucHV0OiAkZ2V0Tm90aWZpY2F0aW9uQnlUeXBlSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIHRpbWVzdGFtcFxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbklkXG4gICAgICAgICAgICAgICAgZW1haWxEZXN0aW5hdGlvblxuICAgICAgICAgICAgICAgIHVzZXJGdWxsTmFtZVxuICAgICAgICAgICAgICAgIHR5cGVcbiAgICAgICAgICAgICAgICBjaGFubmVsVHlwZVxuICAgICAgICAgICAgICAgIHN0YXR1c1xuICAgICAgICAgICAgICAgIGV4cG9QdXNoVG9rZW5zXG4gICAgICAgICAgICAgICAgcGVuZGluZ0Nhc2hiYWNrXG4gICAgICAgICAgICAgICAgbWVyY2hhbnROYW1lXG4gICAgICAgICAgICAgICAgYWN0aW9uVXJsXG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBRdWVyeSB1c2VkIHRvIHJldHJpZXZlIHRoZSByZWltYnVyc2VtZW50cyBmb3IgYSBwYXJ0aWN1bGFyIHVzZXJcbmV4cG9ydCBjb25zdCBnZXRSZWltYnVyc2VtZW50cyA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIHF1ZXJ5IEdldFJlaW1idXJzZW1lbnRzKCRnZXRSZWltYnVyc2VtZW50c0lucHV0OiBHZXRSZWltYnVyc2VtZW50c0lucHV0ISkge1xuICAgICAgICBnZXRSZWltYnVyc2VtZW50cyhnZXRSZWltYnVyc2VtZW50c0lucHV0OiAkZ2V0UmVpbWJ1cnNlbWVudHNJbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgdGltZXN0YW1wXG4gICAgICAgICAgICAgICAgcmVpbWJ1cnNlbWVudElkXG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgc3RhdHVzXG4gICAgICAgICAgICAgICAgYW1vdW50XG4gICAgICAgICAgICAgICAgY2FyZElkXG4gICAgICAgICAgICAgICAgY2FyZExhc3Q0XG4gICAgICAgICAgICAgICAgY2FyZFR5cGVcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbnMge1xuICAgICAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXBcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25JZFxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvblN0YXR1c1xuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvblR5cGVcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgICAgICBtZW1iZXJJZFxuICAgICAgICAgICAgICAgICAgICBjYXJkSWRcbiAgICAgICAgICAgICAgICAgICAgYnJhbmRJZFxuICAgICAgICAgICAgICAgICAgICBzdG9yZUlkXG4gICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbmN5Q29kZVxuICAgICAgICAgICAgICAgICAgICByZXdhcmRBbW91bnRcbiAgICAgICAgICAgICAgICAgICAgdG90YWxBbW91bnRcbiAgICAgICAgICAgICAgICAgICAgcGVuZGluZ0Nhc2hiYWNrQW1vdW50XG4gICAgICAgICAgICAgICAgICAgIGNyZWRpdGVkQ2FzaGJhY2tBbW91bnRcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25CcmFuZE5hbWVcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25CcmFuZEFkZHJlc3NcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25CcmFuZExvZ29VcmxcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25CcmFuZFVSTEFkZHJlc3NcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25Jc09ubGluZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIFF1ZXJ5IHVzZWQgdG8gcmV0cmlldmUgbG9jYXRpb24gcHJlZGljdGlvbnMgZ2l2ZW4gYW4gYWRkcmVzc1xuZXhwb3J0IGNvbnN0IGdldExvY2F0aW9uUHJlZGljdGlvbnMgPSAvKiBHcmFwaFFMICovIGBcbiAgICBxdWVyeSBHZXRMb2NhdGlvblByZWRpY3Rpb25zKCRnZXRMb2NhdGlvblByZWRpY3Rpb25zSW5wdXQ6IEdldExvY2F0aW9uUHJlZGljdGlvbnNJbnB1dCEpIHtcbiAgICAgICAgZ2V0TG9jYXRpb25QcmVkaWN0aW9ucyhnZXRMb2NhdGlvblByZWRpY3Rpb25zSW5wdXQ6ICRnZXRMb2NhdGlvblByZWRpY3Rpb25zSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgIHBsYWNlX2lkXG4gICAgICAgICAgICAgICAgcmVmZXJlbmNlXG4gICAgICAgICAgICAgICAgbWF0Y2hlZF9zdWJzdHJpbmdzXG4gICAgICAgICAgICAgICAgc3RydWN0dXJlZF9mb3JtYXR0aW5nXG4gICAgICAgICAgICAgICAgYWRkcmVzc19jb21wb25lbnRzXG4gICAgICAgICAgICAgICAgdGVybXNcbiAgICAgICAgICAgICAgICB0eXBlc1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gUXVlcnkgdXNlZCB0byByZXRyaWV2ZSB0aGUgYXBwIHJldmlldyBlbGlnaWJpbGl0eSBmb3IgYSBwYXJ0aWN1bGFyIHVzZXJcbmV4cG9ydCBjb25zdCBnZXRBcHBSZXZpZXdFbGlnaWJpbGl0eSA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIHF1ZXJ5IEdldEFwcFJldmlld0VsaWdpYmlsaXR5KCRnZXRBcHBSZXZpZXdFbGlnaWJpbGl0eUlucHV0OiBHZXRBcHBSZXZpZXdFbGlnaWJpbGl0eUlucHV0ISkge1xuICAgICAgICBnZXRBcHBSZXZpZXdFbGlnaWJpbGl0eShnZXRBcHBSZXZpZXdFbGlnaWJpbGl0eUlucHV0OiAkZ2V0QXBwUmV2aWV3RWxpZ2liaWxpdHlJbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGFcbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIFF1ZXJ5IHVzZWQgdG8gcmV0cmlldmUgdGhlIGZpbGVzIGZvciBhIHBhcnRpY3VsYXIgdXNlciBmcm9tIGEgYnVja2V0LCBpZiBleGlzdGVudCxcbi8vIHNvIHdlIGNhbiBzZWUgaWYgYSB1c2VyIGhhcyB1cGxvYWRlZCBhbnkgZG9jdW1lbnRhdGlvbiBhbmQvb3IgZmlsZXMuXG5leHBvcnQgY29uc3QgZ2V0RmlsZXNGb3JVc2VyID0gLyogR3JhcGhRTCAqLyBgXG4gICAgcXVlcnkgR2V0RmlsZXNGb3JVc2VyKCRnZXRGaWxlc0ZvclVzZXJJbnB1dDogR2V0RmlsZXNGb3JVc2VySW5wdXQhKSB7XG4gICAgICAgIGdldEZpbGVzRm9yVXNlcihnZXRGaWxlc0ZvclVzZXJJbnB1dDogJGdldEZpbGVzRm9yVXNlcklucHV0KSB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gUXVlcnkgdXNlZCB0byByZXRyaWV2ZSBhIHVzZXIncyBtaWxpdGFyeSB2ZXJpZmljYXRpb24gaW5mb3JtYXRpb24sIGJhc2VkIG9uIHRoZWlyIElEXG4vLyBvciBiYXNlZCBvbiBhIHBhcnRpY3VsYXIgZGF0ZS1iYXNlZCBmaWx0ZXJcbmV4cG9ydCBjb25zdCBnZXRNaWxpdGFyeVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uID0gLyogR3JhcGhRTCAqLyBgXG4gICAgcXVlcnkgR2V0TWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbigkZ2V0TWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbklucHV0OiBHZXRNaWxpdGFyeVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uSW5wdXQhKSB7XG4gICAgICAgIGdldE1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5mb3JtYXRpb24oZ2V0TWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbklucHV0OiAkZ2V0TWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbklucHV0KSB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWQsXG4gICAgICAgICAgICAgICAgZmlyc3ROYW1lLFxuICAgICAgICAgICAgICAgIGxhc3ROYW1lLFxuICAgICAgICAgICAgICAgIGRhdGVPZkJpcnRoLFxuICAgICAgICAgICAgICAgIGVubGlzdG1lbnRZZWFyLFxuICAgICAgICAgICAgICAgIGFkZHJlc3NMaW5lLFxuICAgICAgICAgICAgICAgIGNpdHksXG4gICAgICAgICAgICAgICAgc3RhdGUsXG4gICAgICAgICAgICAgICAgemlwQ29kZSxcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXQsXG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0LFxuICAgICAgICAgICAgICAgIG1pbGl0YXJ5RHV0eVN0YXR1cyxcbiAgICAgICAgICAgICAgICBtaWxpdGFyeUJyYW5jaCxcbiAgICAgICAgICAgICAgICBtaWxpdGFyeUFmZmlsaWF0aW9uLFxuICAgICAgICAgICAgICAgIG1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBRdWVyeSB1c2VkIHRvIHJldHJpZXZlIGEgdXNlcidzIGNhcmQgbGlua2luZyBJRCBvYnRhaW5lZCBmcm9tIGFuIGludGVybmFsIE1vb25iZWFtIElEXG5leHBvcnQgY29uc3QgZ2V0VXNlckNhcmRMaW5raW5nSWQgPSAvKiBHcmFwaFFMICovIGBcbiAgICBxdWVyeSBHZXRVc2VyQ2FyZExpbmtpbmdJZCgkZ2V0VXNlckNhcmRMaW5raW5nSWRJbnB1dDogR2V0VXNlckNhcmRMaW5raW5nSWRJbnB1dCEpIHtcbiAgICAgICAgZ2V0VXNlckNhcmRMaW5raW5nSWQoZ2V0VXNlckNhcmRMaW5raW5nSWRJbnB1dDogJGdldFVzZXJDYXJkTGlua2luZ0lkSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhXG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBRdWVyeSB1c2VkIHRvIHJldHJpZXZlIGEgdXNlcidzIGRldGFpbHMgZnJvbSBhIHJlZmVycmFsIGNvZGVcbmV4cG9ydCBjb25zdCBnZXRVc2VyRnJvbVJlZmVycmFsID0gLyogR3JhcGhRTCAqLyBgXG4gICAgcXVlcnkgR2V0VXNlckZyb21SZWZlcnJhbCgkZ2V0VXNlckZyb21SZWZmZXJhbElucHV0OiBVc2VyRnJvbVJlZmVycmFsSW5wdXQhKSB7XG4gICAgICAgIGdldFVzZXJGcm9tUmVmZXJyYWwodXNlckZyb21SZWZlcnJhbElucHV0OiAkZ2V0VXNlckZyb21SZWZmZXJhbElucHV0KSB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gUXVlcnkgdXNlZCB0byBnZXQgcmVmZXJyYWxzIGZpbHRlcmVkIGJ5IGEgcGFydGljdWxhciBzdGF0dXNcbmV4cG9ydCBjb25zdCBnZXRSZWZlcnJhbHNCeVN0YXR1cyA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIHF1ZXJ5IEdldFJlZmVycmFsc0J5U3RhdHVzKCRnZXRSZWZlcnJhbHNCeVN0YXR1c0lucHV0OiBHZXRSZWZlcnJhbHNCeVN0YXR1c0lucHV0ISkge1xuICAgICAgICBnZXRSZWZlcnJhbHNCeVN0YXR1cyhnZXRSZWZlcnJhbHNCeVN0YXR1c0lucHV0OiAkZ2V0UmVmZXJyYWxzQnlTdGF0dXNJbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGZyb21JZFxuICAgICAgICAgICAgICAgIHRpbWVzdGFtcFxuICAgICAgICAgICAgICAgIHRvSWRcbiAgICAgICAgICAgICAgICBjYW1wYWlnbkNvZGVcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgICAgICBzdGF0dXNcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIFF1ZXJ5IHVzZWQgdG8gcmV0cmlldmUgdGhlIEFwcCBVcGdyYWRlIGNyZWRlbnRpYWxzL2RldGFpbHNcbmV4cG9ydCBjb25zdCBnZXRBcHBVcGdyYWRlQ3JlZGVudGlhbHMgPSAvKiBHcmFwaFFMICovIGBcbiAgICBxdWVyeSBHZXRBcHBVcGdyYWRlQ3JlZGVudGlhbHMge1xuICAgICAgICBnZXRBcHBVcGdyYWRlQ3JlZGVudGlhbHMge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGFcbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIFF1ZXJ5IHVzZWQgdG8gcmV0cmlldmUgYSBVc2VyIEF1dGggU2Vzc2lvbiwgZm9yIGEgcGFydGljdWxhciB1c2VyXG5leHBvcnQgY29uc3QgZ2V0VXNlckF1dGhTZXNzaW9uID0gLyogR3JhcGhRTCAqLyBgXG4gICAgcXVlcnkgR2V0VXNlckF1dGhTZXNzaW9uKCRnZXRVc2VyQXV0aFNlc3Npb25JbnB1dDogR2V0VXNlckF1dGhTZXNzaW9uSW5wdXQhKSB7XG4gICAgICAgIGdldFVzZXJBdXRoU2Vzc2lvbihnZXRVc2VyQXV0aFNlc3Npb25JbnB1dDogJGdldFVzZXJBdXRoU2Vzc2lvbklucHV0KSB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgICAgICBudW1iZXJPZlNlc3Npb25zXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBRdWVyeSB1c2VkIHRvIHJldHJpZXZlIGFsbCBOb3RpZmljYXRpb24gUmVtaW5kZXJzXG5leHBvcnQgY29uc3QgZ2V0Tm90aWZpY2F0aW9uUmVtaW5kZXJzID0gLyogR3JhcGhRTCAqLyBgXG4gICAgcXVlcnkgR2V0Tm90aWZpY2F0aW9uUmVtaW5kZXJzIHtcbiAgICAgICAgZ2V0Tm90aWZpY2F0aW9uUmVtaW5kZXJzIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvblJlbWluZGVyVHlwZVxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvblJlbWluZGVyU3RhdHVzXG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uUmVtaW5kZXJDYWRlbmNlXG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgbmV4dFRyaWdnZXJBdFxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlXG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uUmVtaW5kZXJDb3VudFxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvblJlbWluZGVyTWF4Q291bnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIFF1ZXJ5IHVzZWQgdG8gcmV0cmlldmUgYWxsIFVzZXJzIGZvciBOb3RpZmljYXRpb24gUmVtaW5kZXJzXG5leHBvcnQgY29uc3QgZ2V0QWxsVXNlcnNGb3JOb3RpZmljYXRpb25SZW1pbmRlcnMgPSAvKiBHcmFwaFFMICovIGBcbiAgICBxdWVyeSBHZXRBbGxVc2Vyc0Zvck5vdGlmaWNhdGlvblJlbWluZGVycyB7XG4gICAgICAgIGdldEFsbFVzZXJzRm9yTm90aWZpY2F0aW9uUmVtaW5kZXJzIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIGVtYWlsXG4gICAgICAgICAgICAgICAgZmlyc3ROYW1lXG4gICAgICAgICAgICAgICAgbGFzdE5hbWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIFF1ZXJ5IHVzZWQgdG8gcmV0cmlldmUgYWxsIFVzZXJzIGZvciBOb3RpZmljYXRpb24gUmVtaW5kZXJzIHNvcnRlZCBieSBhIGdlb2dyYXBoaWNhbCBsb2NhdGlvblxuZXhwb3J0IGNvbnN0IGdldFVzZXJzQnlHZW9ncmFwaHlGb3JOb3RpZmljYXRpb25SZW1pbmRlcnMgPSAvKiBHcmFwaFFMICovIGBcbiAgICBxdWVyeSBHZXRVc2Vyc0J5R2VvZ3JhcGh5Rm9yTm90aWZpY2F0aW9uUmVtaW5kZXJzKCRnZXRVc2Vyc0J5R2VvZ3JhcGhpY2FsTG9jYXRpb25JbnB1dDogR2V0VXNlcnNCeUdlb2dyYXBoaWNhbExvY2F0aW9uSW5wdXQhKSB7XG4gICAgICAgIGdldFVzZXJzQnlHZW9ncmFwaHlGb3JOb3RpZmljYXRpb25SZW1pbmRlcnMoZ2V0VXNlcnNCeUdlb2dyYXBoaWNhbExvY2F0aW9uSW5wdXQ6ICRnZXRVc2Vyc0J5R2VvZ3JhcGhpY2FsTG9jYXRpb25JbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgZW1haWxcbiAgICAgICAgICAgICAgICBmaXJzdE5hbWVcbiAgICAgICAgICAgICAgICBsYXN0TmFtZVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gUXVlcnkgdXNlZCB0byBHZW9Db2RlIGFuZCBhZGRyZXNzIHVzaW5nIEdvb2dsZSdzIEFQSXNcbmV4cG9ydCBjb25zdCBnZW9Db2RlQXN5bmMgPSAvKiBHcmFwaFFMICovIGBcbiAgICBxdWVyeSBHZW9Db2RlQXN5bmMoJGdlb2NvZGVBc3luY0lucHV0OiBHZW9jb2RlQXN5bmNJbnB1dCEpIHtcbiAgICAgICAgZ2VvQ29kZUFzeW5jKGdlb2NvZGVBc3luY0lucHV0OiAkZ2VvY29kZUFzeW5jSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBsYXRpdHVkZVxuICAgICAgICAgICAgICAgIGxvbmdpdHVkZVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gUXVlcnkgdXNlZCB0byByZXRyaWV2ZSBhbGwgdGhlIEZBUXNcbmV4cG9ydCBjb25zdCBnZXRGQVFzID0gLyogR3JhcGhRTCAqLyBgXG4gICAgcXVlcnkgR2V0RkFRcyB7XG4gICAgICAgIGdldEZBUXMge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgdGl0bGVcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgICAgICBmYWN0cyB7XG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAgICAgIGxpbmthYmxlS2V5d29yZFxuICAgICAgICAgICAgICAgICAgICBsaW5rTG9jYXRpb25cbiAgICAgICAgICAgICAgICAgICAgdHlwZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIFF1ZXJ5IHVzZWQgdG8gcmV0cmlldmUgYWxsIEV2ZW50IFNlcmllcyBmb3IgdmFyaW91cyBwYXJ0bmVyIG9yZ2FuaXphdGlvbnNcbmV4cG9ydCBjb25zdCBnZXRFdmVudFNlcmllcyA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIHF1ZXJ5IEdldEV2ZW50U2VyaWVzIHtcbiAgICAgICAgZ2V0RXZlbnRTZXJpZXMge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgZXh0ZXJuYWxTZXJpZXNJRFxuICAgICAgICAgICAgICAgIGV4dGVybmFsT3JnSURcbiAgICAgICAgICAgICAgICBuYW1lXG4gICAgICAgICAgICAgICAgdGl0bGVcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgIGV2ZW50cyB7XG4gICAgICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgICAgIGV4dGVybmFsRXZlbnRJRFxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgICAgICB0aXRsZVxuICAgICAgICAgICAgICAgICAgICBldmVudExvZ29VcmxTbVxuICAgICAgICAgICAgICAgICAgICBldmVudExvZ29VcmxCZ1xuICAgICAgICAgICAgICAgICAgICBzdGFydFRpbWUge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGltZXpvbmVcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0c0F0TG9jYWxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0c0F0VVRDXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZW5kVGltZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lem9uZVxuICAgICAgICAgICAgICAgICAgICAgICAgZW5kc0F0TG9jYWxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZHNBdFVUQ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJlZ2lzdHJhdGlvblVybFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzZXJpZXNMb2dvVXJsU21cbiAgICAgICAgICAgICAgICBzZXJpZXNMb2dvVXJsQmdcbiAgICAgICAgICAgICAgICBzdGF0dXNcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIFF1ZXJ5IHVzZWQgdG8gcmV0cmlldmUgYWxsIHRoZSBTZXJ2aWNlIHBhcnRuZXIgb3JnYW5pemF0aW9uc1xuZXhwb3J0IGNvbnN0IGdldFNlcnZpY2VQYXJ0bmVycyA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIHF1ZXJ5IEdldFNlcnZpY2VQYXJ0bmVycyB7XG4gICAgICAgIGdldFNlcnZpY2VQYXJ0bmVycyB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICBzdGF0dXNcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgICAgICBuYW1lXG4gICAgICAgICAgICAgICAgc2hvcnREZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAgaXNPbmxpbmVcbiAgICAgICAgICAgICAgICBsb2dvVXJsXG4gICAgICAgICAgICAgICAgYWRkcmVzc0xpbmVcbiAgICAgICAgICAgICAgICBjaXR5XG4gICAgICAgICAgICAgICAgc3RhdGVcbiAgICAgICAgICAgICAgICB6aXBDb2RlXG4gICAgICAgICAgICAgICAgd2Vic2l0ZVxuICAgICAgICAgICAgICAgIHNlcnZpY2VzIHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGVcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZW1haWxcbiAgICAgICAgICAgICAgICBwaG9uZU51bWJlclxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSAgXG5gO1xuXG4vLyBRdWVyeSB1c2VkIHRvIHJldHJpZXZlIGFsbCB0aGUgRmlkZWxpcyBwYXJ0bmVyIG9mZmVycywgZmlsdGVyZWQgYnkgYnJhbmQvcGFydG5lciAoc28gd2UgY2FuIGRpc3BsYXkgdGhlbSBhcyBmZWF0dXJlZCBpbiB0aGUgc3RvcmUpXG5leHBvcnQgY29uc3QgZ2V0RmlkZWxpc1BhcnRuZXJzID0gLyogR3JhcGhRTCAqLyBgXG4gICAgcXVlcnkgR2V0RmlkZWxpc1BhcnRuZXJzIHtcbiAgICAgICAgZ2V0RmlkZWxpc1BhcnRuZXJzIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBicmFuZE5hbWVcbiAgICAgICAgICAgICAgICB2ZXRlcmFuT3duZWRcbiAgICAgICAgICAgICAgICBudW1iZXJPZk9mZmVyc1xuICAgICAgICAgICAgICAgIG9mZmVycyB7XG4gICAgICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgICAgIGNvcnBvcmF0ZUlkXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRcbiAgICAgICAgICAgICAgICAgICAgb2ZmZXJTdGF0ZVxuICAgICAgICAgICAgICAgICAgICBhdmFpbGFiaWxpdHlcbiAgICAgICAgICAgICAgICAgICAgYnJhbmRJZFxuICAgICAgICAgICAgICAgICAgICBicmFuZERiYVxuICAgICAgICAgICAgICAgICAgICBicmFuZExvZ29cbiAgICAgICAgICAgICAgICAgICAgYnJhbmRMb2dvU21cbiAgICAgICAgICAgICAgICAgICAgYnJhbmRCYW5uZXJcbiAgICAgICAgICAgICAgICAgICAgYnJhbmRQYXJlbnRDYXRlZ29yeVxuICAgICAgICAgICAgICAgICAgICBicmFuZFN0dWJDb3B5XG4gICAgICAgICAgICAgICAgICAgIGJyYW5kV2Vic2l0ZVxuICAgICAgICAgICAgICAgICAgICBzdG9yZURldGFpbHMge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIHBob25lXG4gICAgICAgICAgICAgICAgICAgICAgICBhZGRyZXNzMVxuICAgICAgICAgICAgICAgICAgICAgICAgY2l0eVxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGVcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50cnlDb2RlXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3N0Q29kZVxuICAgICAgICAgICAgICAgICAgICAgICAgZ2VvTG9jYXRpb24ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhdGl0dWRlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9uZ2l0dWRlXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpc09ubGluZVxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzdGFuY2VcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgICAgICByZWFjaFxuICAgICAgICAgICAgICAgICAgICB0aXRsZVxuICAgICAgICAgICAgICAgICAgICBxdWFsaWZpZXJcbiAgICAgICAgICAgICAgICAgICAgdGlsZVxuICAgICAgICAgICAgICAgICAgICBzdGFydERhdGVcbiAgICAgICAgICAgICAgICAgICAgZW5kRGF0ZVxuICAgICAgICAgICAgICAgICAgICBjdXJyZW5jeVxuICAgICAgICAgICAgICAgICAgICBleHRPZmZlcklkXG4gICAgICAgICAgICAgICAgICAgIHN1cHBsaWVyT2ZmZXJLZXlcbiAgICAgICAgICAgICAgICAgICAgcmVkZW1wdGlvblR5cGVcbiAgICAgICAgICAgICAgICAgICAgcmVkZW1wdGlvbkluc3RydWN0aW9uVXJsXG4gICAgICAgICAgICAgICAgICAgIHJlZGVtcHRpb25UcmlnZ2VyXG4gICAgICAgICAgICAgICAgICAgIGJ1ZGdldFxuICAgICAgICAgICAgICAgICAgICBkYXlzQXZhaWxhYmlsaXR5XG4gICAgICAgICAgICAgICAgICAgIHN0b3Jlc1xuICAgICAgICAgICAgICAgICAgICB0b3RhbFJlZGVlbUxpbWl0XG4gICAgICAgICAgICAgICAgICAgIHJlZGVlbUxpbWl0UGVyVXNlclxuICAgICAgICAgICAgICAgICAgICBwdXJjaGFzZUFtb3VudFxuICAgICAgICAgICAgICAgICAgICBwdXJjaGFzZUZyZXF1ZW5jeVxuICAgICAgICAgICAgICAgICAgICByZXdhcmQge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heFZhbHVlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBRdWVyeSB1c2VkIHRvIHNlYXJjaCBhbiBvZmZlciBiYXNlZCBvbiBjZXJ0YWluIGZpbHRlcmluZyAodGhpcyB3aWxsIHBhcyB0aHJvdWdoIG9mZmVycyBmcm9tIE9saXZlIGRpcmVjdGx5KVxuZXhwb3J0IGNvbnN0IHNlYXJjaE9mZmVycyA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIHF1ZXJ5IFNlYXJjaE9mZmVycygkc2VhcmNoT2ZmZXJzSW5wdXQ6IFNlYXJjaE9mZmVyc0lucHV0ISkge1xuICAgICAgICBzZWFyY2hPZmZlcnMoc2VhcmNoT2ZmZXJzSW5wdXQ6ICRzZWFyY2hPZmZlcnNJbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIHRvdGFsTnVtYmVyT2ZQYWdlc1xuICAgICAgICAgICAgICAgIHRvdGFsTnVtYmVyT2ZSZWNvcmRzXG4gICAgICAgICAgICAgICAgb2ZmZXJzIHtcbiAgICAgICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICAgICAgY29ycG9yYXRlSWRcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlZFxuICAgICAgICAgICAgICAgICAgICBvZmZlclN0YXRlXG4gICAgICAgICAgICAgICAgICAgIGF2YWlsYWJpbGl0eVxuICAgICAgICAgICAgICAgICAgICBicmFuZElkXG4gICAgICAgICAgICAgICAgICAgIGJyYW5kRGJhXG4gICAgICAgICAgICAgICAgICAgIGJyYW5kTG9nb1xuICAgICAgICAgICAgICAgICAgICBicmFuZExvZ29TbVxuICAgICAgICAgICAgICAgICAgICBicmFuZEJhbm5lclxuICAgICAgICAgICAgICAgICAgICBicmFuZFBhcmVudENhdGVnb3J5XG4gICAgICAgICAgICAgICAgICAgIGJyYW5kU3R1YkNvcHlcbiAgICAgICAgICAgICAgICAgICAgYnJhbmRXZWJzaXRlXG4gICAgICAgICAgICAgICAgICAgIHN0b3JlRGV0YWlscyB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgcGhvbmVcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkZHJlc3MxXG4gICAgICAgICAgICAgICAgICAgICAgICBjaXR5XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgY291bnRyeUNvZGVcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc3RDb2RlXG4gICAgICAgICAgICAgICAgICAgICAgICBnZW9Mb2NhdGlvbiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGF0aXR1ZGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb25naXR1ZGVcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlzT25saW5lXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXN0YW5jZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAgICAgIHJlYWNoXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlXG4gICAgICAgICAgICAgICAgICAgIHF1YWxpZmllclxuICAgICAgICAgICAgICAgICAgICB0aWxlXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0RGF0ZVxuICAgICAgICAgICAgICAgICAgICBlbmREYXRlXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbmN5XG4gICAgICAgICAgICAgICAgICAgIGV4dE9mZmVySWRcbiAgICAgICAgICAgICAgICAgICAgc3VwcGxpZXJPZmZlcktleVxuICAgICAgICAgICAgICAgICAgICByZWRlbXB0aW9uVHlwZVxuICAgICAgICAgICAgICAgICAgICByZWRlbXB0aW9uSW5zdHJ1Y3Rpb25VcmxcbiAgICAgICAgICAgICAgICAgICAgcmVkZW1wdGlvblRyaWdnZXJcbiAgICAgICAgICAgICAgICAgICAgYnVkZ2V0XG4gICAgICAgICAgICAgICAgICAgIGRheXNBdmFpbGFiaWxpdHlcbiAgICAgICAgICAgICAgICAgICAgc3RvcmVzXG4gICAgICAgICAgICAgICAgICAgIHRvdGFsUmVkZWVtTGltaXRcbiAgICAgICAgICAgICAgICAgICAgcmVkZWVtTGltaXRQZXJVc2VyXG4gICAgICAgICAgICAgICAgICAgIHB1cmNoYXNlQW1vdW50XG4gICAgICAgICAgICAgICAgICAgIHB1cmNoYXNlRnJlcXVlbmN5XG4gICAgICAgICAgICAgICAgICAgIHJld2FyZCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4VmFsdWVcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIFF1ZXJ5IHVzZWQgdG8gcmV0cmlldmUgYXZhaWxhYmxlIG9mZmVycyB1c2luZyBjZXJ0YWluIGZpbHRlcmluZyAodGhpcyB3aWxsIHBhc3MgdGhyb3VnaCBvZmZlcnMgZnJvbSBPbGl2ZSBkaXJlY3RseSlcbmV4cG9ydCBjb25zdCBnZXRPZmZlcnMgPSAvKiBHcmFwaFFMICovIGBcbiAgICBxdWVyeSBHZXRPZmZlcnMoJGdldE9mZmVyc0lucHV0OiBHZXRPZmZlcnNJbnB1dCEpIHtcbiAgICAgICAgZ2V0T2ZmZXJzKGdldE9mZmVyc0lucHV0OiAkZ2V0T2ZmZXJzSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICB0b3RhbE51bWJlck9mUGFnZXNcbiAgICAgICAgICAgICAgICB0b3RhbE51bWJlck9mUmVjb3Jkc1xuICAgICAgICAgICAgICAgIG9mZmVycyB7XG4gICAgICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgICAgIGNvcnBvcmF0ZUlkXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRcbiAgICAgICAgICAgICAgICAgICAgb2ZmZXJTdGF0ZVxuICAgICAgICAgICAgICAgICAgICBhdmFpbGFiaWxpdHlcbiAgICAgICAgICAgICAgICAgICAgYnJhbmRJZFxuICAgICAgICAgICAgICAgICAgICBicmFuZERiYVxuICAgICAgICAgICAgICAgICAgICBicmFuZExvZ29cbiAgICAgICAgICAgICAgICAgICAgYnJhbmRMb2dvU21cbiAgICAgICAgICAgICAgICAgICAgYnJhbmRCYW5uZXJcbiAgICAgICAgICAgICAgICAgICAgYnJhbmRQYXJlbnRDYXRlZ29yeVxuICAgICAgICAgICAgICAgICAgICBicmFuZFN0dWJDb3B5XG4gICAgICAgICAgICAgICAgICAgIGJyYW5kV2Vic2l0ZVxuICAgICAgICAgICAgICAgICAgICBzdG9yZURldGFpbHMge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIHBob25lXG4gICAgICAgICAgICAgICAgICAgICAgICBhZGRyZXNzMVxuICAgICAgICAgICAgICAgICAgICAgICAgY2l0eVxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGVcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50cnlDb2RlXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3N0Q29kZVxuICAgICAgICAgICAgICAgICAgICAgICAgZ2VvTG9jYXRpb24ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhdGl0dWRlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9uZ2l0dWRlXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpc09ubGluZVxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzdGFuY2VcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgICAgICByZWFjaFxuICAgICAgICAgICAgICAgICAgICB0aXRsZVxuICAgICAgICAgICAgICAgICAgICBxdWFsaWZpZXJcbiAgICAgICAgICAgICAgICAgICAgdGlsZVxuICAgICAgICAgICAgICAgICAgICBzdGFydERhdGVcbiAgICAgICAgICAgICAgICAgICAgZW5kRGF0ZVxuICAgICAgICAgICAgICAgICAgICBjdXJyZW5jeVxuICAgICAgICAgICAgICAgICAgICBleHRPZmZlcklkXG4gICAgICAgICAgICAgICAgICAgIHN1cHBsaWVyT2ZmZXJLZXlcbiAgICAgICAgICAgICAgICAgICAgcmVkZW1wdGlvblR5cGVcbiAgICAgICAgICAgICAgICAgICAgcmVkZW1wdGlvbkluc3RydWN0aW9uVXJsXG4gICAgICAgICAgICAgICAgICAgIHJlZGVtcHRpb25UcmlnZ2VyXG4gICAgICAgICAgICAgICAgICAgIGJ1ZGdldFxuICAgICAgICAgICAgICAgICAgICBkYXlzQXZhaWxhYmlsaXR5XG4gICAgICAgICAgICAgICAgICAgIHN0b3Jlc1xuICAgICAgICAgICAgICAgICAgICB0b3RhbFJlZGVlbUxpbWl0XG4gICAgICAgICAgICAgICAgICAgIHJlZGVlbUxpbWl0UGVyVXNlclxuICAgICAgICAgICAgICAgICAgICBwdXJjaGFzZUFtb3VudFxuICAgICAgICAgICAgICAgICAgICBwdXJjaGFzZUZyZXF1ZW5jeVxuICAgICAgICAgICAgICAgICAgICByZXdhcmQge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heFZhbHVlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBRdWVyeSB1c2VkIHRvIHJldHJpZXZlIGF2YWlsYWJsZSBzZWFzb25hbCBvZmZlcnMgdXNpbmcgY2VydGFpbiBmaWx0ZXJpbmcgKHRoaXMgd2lsbCBwYXNzIHRocm91Z2ggc2Vhc29uYWwgb2ZmZXJzIGZyb20gT2xpdmUgZGlyZWN0bHkpXG5leHBvcnQgY29uc3QgZ2V0U2Vhc29uYWxPZmZlcnMgPSAvKiBHcmFwaFFMICovIGBcbiAgICBxdWVyeSBHZXRTZWFzb25hbE9mZmVycygkZ2V0T2ZmZXJzSW5wdXQ6IEdldE9mZmVyc0lucHV0ISkge1xuICAgICAgICBnZXRTZWFzb25hbE9mZmVycyhnZXRPZmZlcnNJbnB1dDogJGdldE9mZmVyc0lucHV0KSB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgdG90YWxOdW1iZXJPZlBhZ2VzXG4gICAgICAgICAgICAgICAgdG90YWxOdW1iZXJPZlJlY29yZHNcbiAgICAgICAgICAgICAgICBvZmZlcnMge1xuICAgICAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgICAgICBjb3Jwb3JhdGVJZFxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVkXG4gICAgICAgICAgICAgICAgICAgIG9mZmVyU3RhdGVcbiAgICAgICAgICAgICAgICAgICAgYXZhaWxhYmlsaXR5XG4gICAgICAgICAgICAgICAgICAgIGJyYW5kSWRcbiAgICAgICAgICAgICAgICAgICAgYnJhbmREYmFcbiAgICAgICAgICAgICAgICAgICAgYnJhbmRMb2dvXG4gICAgICAgICAgICAgICAgICAgIGJyYW5kTG9nb1NtXG4gICAgICAgICAgICAgICAgICAgIGJyYW5kQmFubmVyXG4gICAgICAgICAgICAgICAgICAgIGJyYW5kUGFyZW50Q2F0ZWdvcnlcbiAgICAgICAgICAgICAgICAgICAgYnJhbmRTdHViQ29weVxuICAgICAgICAgICAgICAgICAgICBicmFuZFdlYnNpdGVcbiAgICAgICAgICAgICAgICAgICAgc3RvcmVEZXRhaWxzIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICBwaG9uZVxuICAgICAgICAgICAgICAgICAgICAgICAgYWRkcmVzczFcbiAgICAgICAgICAgICAgICAgICAgICAgIGNpdHlcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlXG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudHJ5Q29kZVxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zdENvZGVcbiAgICAgICAgICAgICAgICAgICAgICAgIGdlb0xvY2F0aW9uIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXRpdHVkZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvbmdpdHVkZVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaXNPbmxpbmVcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3RhbmNlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICAgICAgcmVhY2hcbiAgICAgICAgICAgICAgICAgICAgdGl0bGVcbiAgICAgICAgICAgICAgICAgICAgcXVhbGlmaWVyXG4gICAgICAgICAgICAgICAgICAgIHRpbGVcbiAgICAgICAgICAgICAgICAgICAgc3RhcnREYXRlXG4gICAgICAgICAgICAgICAgICAgIGVuZERhdGVcbiAgICAgICAgICAgICAgICAgICAgY3VycmVuY3lcbiAgICAgICAgICAgICAgICAgICAgZXh0T2ZmZXJJZFxuICAgICAgICAgICAgICAgICAgICBzdXBwbGllck9mZmVyS2V5XG4gICAgICAgICAgICAgICAgICAgIHJlZGVtcHRpb25UeXBlXG4gICAgICAgICAgICAgICAgICAgIHJlZGVtcHRpb25JbnN0cnVjdGlvblVybFxuICAgICAgICAgICAgICAgICAgICByZWRlbXB0aW9uVHJpZ2dlclxuICAgICAgICAgICAgICAgICAgICBidWRnZXRcbiAgICAgICAgICAgICAgICAgICAgZGF5c0F2YWlsYWJpbGl0eVxuICAgICAgICAgICAgICAgICAgICBzdG9yZXNcbiAgICAgICAgICAgICAgICAgICAgdG90YWxSZWRlZW1MaW1pdFxuICAgICAgICAgICAgICAgICAgICByZWRlZW1MaW1pdFBlclVzZXJcbiAgICAgICAgICAgICAgICAgICAgcHVyY2hhc2VBbW91bnRcbiAgICAgICAgICAgICAgICAgICAgcHVyY2hhc2VGcmVxdWVuY3lcbiAgICAgICAgICAgICAgICAgICAgcmV3YXJkIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhWYWx1ZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gUXVlcnkgdXNlZCB0byByZXRyaWV2ZSBhdmFpbGFibGUgcHJlbWllciBvZmZlcnMgdXNpbmcgY2VydGFpbiBmaWx0ZXJpbmcgKHRoaXMgd2lsbCBwYXNzIHRocm91Z2ggcHJlbWllciBvZmZlcnMgZnJvbSBPbGl2ZSBkaXJlY3RseSlcbmV4cG9ydCBjb25zdCBnZXRQcmVtaWVyT2ZmZXJzID0gLyogR3JhcGhRTCAqLyBgXG4gICAgcXVlcnkgR2V0UHJlbWllck9mZmVycygkZ2V0T2ZmZXJzSW5wdXQ6IEdldE9mZmVyc0lucHV0ISkge1xuICAgICAgICBnZXRQcmVtaWVyT2ZmZXJzKGdldE9mZmVyc0lucHV0OiAkZ2V0T2ZmZXJzSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICB0b3RhbE51bWJlck9mUGFnZXNcbiAgICAgICAgICAgICAgICB0b3RhbE51bWJlck9mUmVjb3Jkc1xuICAgICAgICAgICAgICAgIG9mZmVycyB7XG4gICAgICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgICAgIGNvcnBvcmF0ZUlkXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRcbiAgICAgICAgICAgICAgICAgICAgb2ZmZXJTdGF0ZVxuICAgICAgICAgICAgICAgICAgICBhdmFpbGFiaWxpdHlcbiAgICAgICAgICAgICAgICAgICAgYnJhbmRJZFxuICAgICAgICAgICAgICAgICAgICBicmFuZERiYVxuICAgICAgICAgICAgICAgICAgICBicmFuZExvZ29cbiAgICAgICAgICAgICAgICAgICAgYnJhbmRMb2dvU21cbiAgICAgICAgICAgICAgICAgICAgYnJhbmRCYW5uZXJcbiAgICAgICAgICAgICAgICAgICAgYnJhbmRQYXJlbnRDYXRlZ29yeVxuICAgICAgICAgICAgICAgICAgICBicmFuZFN0dWJDb3B5XG4gICAgICAgICAgICAgICAgICAgIGJyYW5kV2Vic2l0ZVxuICAgICAgICAgICAgICAgICAgICBzdG9yZURldGFpbHMge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIHBob25lXG4gICAgICAgICAgICAgICAgICAgICAgICBhZGRyZXNzMVxuICAgICAgICAgICAgICAgICAgICAgICAgY2l0eVxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGVcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50cnlDb2RlXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3N0Q29kZVxuICAgICAgICAgICAgICAgICAgICAgICAgZ2VvTG9jYXRpb24ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhdGl0dWRlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9uZ2l0dWRlXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpc09ubGluZVxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzdGFuY2VcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgICAgICByZWFjaFxuICAgICAgICAgICAgICAgICAgICB0aXRsZVxuICAgICAgICAgICAgICAgICAgICBxdWFsaWZpZXJcbiAgICAgICAgICAgICAgICAgICAgdGlsZVxuICAgICAgICAgICAgICAgICAgICBzdGFydERhdGVcbiAgICAgICAgICAgICAgICAgICAgZW5kRGF0ZVxuICAgICAgICAgICAgICAgICAgICBjdXJyZW5jeVxuICAgICAgICAgICAgICAgICAgICBleHRPZmZlcklkXG4gICAgICAgICAgICAgICAgICAgIHN1cHBsaWVyT2ZmZXJLZXlcbiAgICAgICAgICAgICAgICAgICAgcmVkZW1wdGlvblR5cGVcbiAgICAgICAgICAgICAgICAgICAgcmVkZW1wdGlvbkluc3RydWN0aW9uVXJsXG4gICAgICAgICAgICAgICAgICAgIHJlZGVtcHRpb25UcmlnZ2VyXG4gICAgICAgICAgICAgICAgICAgIGJ1ZGdldFxuICAgICAgICAgICAgICAgICAgICBkYXlzQXZhaWxhYmlsaXR5XG4gICAgICAgICAgICAgICAgICAgIHN0b3Jlc1xuICAgICAgICAgICAgICAgICAgICB0b3RhbFJlZGVlbUxpbWl0XG4gICAgICAgICAgICAgICAgICAgIHJlZGVlbUxpbWl0UGVyVXNlclxuICAgICAgICAgICAgICAgICAgICBwdXJjaGFzZUFtb3VudFxuICAgICAgICAgICAgICAgICAgICBwdXJjaGFzZUZyZXF1ZW5jeVxuICAgICAgICAgICAgICAgICAgICByZXdhcmQge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heFZhbHVlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBRdWVyeSB1c2VkIHRvIHJldHJpZXZlIGEgcGFydGljdWxhciBwaHlzaWNhbCBkZXZpY2UgZm9yIGEgdXNlciwgYmFzZWQgb24gYSB1c2VyIElEIGFuZCBkZXZpY2UgdG9rZW4uXG5leHBvcnQgY29uc3QgZ2V0RGV2aWNlc0ZvclVzZXIgPSAvKiBHcmFwaFFMICovIGBcbiAgICBxdWVyeSBHZXREZXZpY2VzRm9yVXNlcigkZ2V0RGV2aWNlc0ZvclVzZXJJbnB1dDogR2V0RGV2aWNlc0ZvclVzZXJJbnB1dCEpIHtcbiAgICAgICAgZ2V0RGV2aWNlc0ZvclVzZXIoZ2V0RGV2aWNlc0ZvclVzZXJJbnB1dDogJGdldERldmljZXNGb3JVc2VySW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIHRva2VuSWRcbiAgICAgICAgICAgICAgICBkZXZpY2VTdGF0ZVxuICAgICAgICAgICAgICAgIGxhc3RMb2dpbkRhdGVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIFF1ZXJ5IHVzZWQgdG8gcmV0cmlldmUgYSBwYXJ0aWN1bGFyIHBoeXNpY2FsIGRldmljZSBmb3IgYSB1c2VyLCBiYXNlZCBvbiBhIHVzZXIgSUQgYW5kIGRldmljZSB0b2tlbi5cbmV4cG9ydCBjb25zdCBnZXREZXZpY2UgPSAvKiBHcmFwaFFMICovIGBcbiAgICBxdWVyeSBHZXREZXZpY2UoJGdldERldmljZUlucHV0OiBHZXREZXZpY2VJbnB1dCEpIHtcbiAgICAgICAgZ2V0RGV2aWNlKGdldERldmljZUlucHV0OiAkZ2V0RGV2aWNlSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIHRva2VuSWRcbiAgICAgICAgICAgICAgICBkZXZpY2VTdGF0ZVxuICAgICAgICAgICAgICAgIGxhc3RMb2dpbkRhdGVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIFF1ZXJ5IHVzZWQgdG8gcmV0cmlldmUgYSBwYXJ0aWN1bGFyIHBoeXNpY2FsIGRldmljZSwgYmFzZWQgaXRzIHRva2VuLlxuZXhwb3J0IGNvbnN0IGdldERldmljZUJ5VG9rZW4gPSAvKiBHcmFwaFFMICovIGBcbiAgICBxdWVyeSBHZXREZXZpY2VCeVRva2VuKCRnZXREZXZpY2VCeVRva2VuSW5wdXQ6IEdldERldmljZUJ5VG9rZW5JbnB1dCEpIHtcbiAgICAgICAgZ2V0RGV2aWNlQnlUb2tlbihnZXREZXZpY2VCeVRva2VuSW5wdXQ6ICRnZXREZXZpY2VCeVRva2VuSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIHRva2VuSWRcbiAgICAgICAgICAgICAgICBkZXZpY2VTdGF0ZVxuICAgICAgICAgICAgICAgIGxhc3RMb2dpbkRhdGVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIFF1ZXJ5IHVzZWQgdG8gcmV0cmlldmUgdHJhbnNhY3Rpb25zIGZvciBhIHBhcnRpY3VsYXIgdXNlciwgd2l0aGluIGEgc3BlY2lmaWMgdGltZWZyYW1lXG5leHBvcnQgY29uc3QgZ2V0VHJhbnNhY3Rpb24gPSAvKiBHcmFwaFFMICovIGBcbiAgICBxdWVyeSBHZXRUcmFuc2FjdGlvbigkZ2V0VHJhbnNhY3Rpb25JbnB1dDogR2V0VHJhbnNhY3Rpb25JbnB1dCEpIHtcbiAgICAgICAgZ2V0VHJhbnNhY3Rpb24oZ2V0VHJhbnNhY3Rpb25JbnB1dDogJGdldFRyYW5zYWN0aW9uSW5wdXQpIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIHRpbWVzdGFtcFxuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uSWRcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvblN0YXR1c1xuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uVHlwZVxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgIG1lbWJlcklkXG4gICAgICAgICAgICAgICAgY2FyZElkXG4gICAgICAgICAgICAgICAgYnJhbmRJZFxuICAgICAgICAgICAgICAgIHN0b3JlSWRcbiAgICAgICAgICAgICAgICBjYXRlZ29yeVxuICAgICAgICAgICAgICAgIGN1cnJlbmN5Q29kZVxuICAgICAgICAgICAgICAgIHJld2FyZEFtb3VudFxuICAgICAgICAgICAgICAgIHRvdGFsQW1vdW50XG4gICAgICAgICAgICAgICAgcGVuZGluZ0Nhc2hiYWNrQW1vdW50XG4gICAgICAgICAgICAgICAgY3JlZGl0ZWRDYXNoYmFja0Ftb3VudFxuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uQnJhbmROYW1lXG4gICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25CcmFuZEFkZHJlc3NcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbkJyYW5kTG9nb1VybFxuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uQnJhbmRVUkxBZGRyZXNzXG4gICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25Jc09ubGluZVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gUXVlcnkgdXNlZCB0byByZXRyaWV2ZSB0cmFuc2FjdGlvbnMgZm9yIGEgcGFydGljdWxhciB1c2VyLCBpbiBhIHBhcnRpY3VsYXIgc3RhdHVzXG5leHBvcnQgY29uc3QgZ2V0VHJhbnNhY3Rpb25CeVN0YXR1cyA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIHF1ZXJ5IEdldFRyYW5zYWN0aW9uQnlTdGF0dXMoJGdldFRyYW5zYWN0aW9uQnlTdGF0dXNJbnB1dDogR2V0VHJhbnNhY3Rpb25CeVN0YXR1c0lucHV0ISkge1xuICAgICAgICBnZXRUcmFuc2FjdGlvbkJ5U3RhdHVzKGdldFRyYW5zYWN0aW9uQnlTdGF0dXNJbnB1dDogJGdldFRyYW5zYWN0aW9uQnlTdGF0dXNJbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgdGltZXN0YW1wXG4gICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25JZFxuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uU3RhdHVzXG4gICAgICAgICAgICAgICAgY3JlZGl0ZWRDYXNoYmFja0Ftb3VudFxuICAgICAgICAgICAgICAgIHBlbmRpbmdDYXNoYmFja0Ftb3VudFxuICAgICAgICAgICAgICAgIHJld2FyZEFtb3VudFxuICAgICAgICAgICAgICAgIHRvdGFsQW1vdW50XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBRdWVyeSB1c2VkIHRvIHJldHJpZXZlIGEgY2FyZCBsaW5rIGZvciBhIHBhcnRpY3VsYXIgdXNlclxuZXhwb3J0IGNvbnN0IGdldENhcmRMaW5rID0gLyogR3JhcGhRTCAqLyBgXG4gICAgcXVlcnkgR2V0Q2FyZExpbmsoJGdldENhcmRMaW5rSW5wdXQ6IEdldENhcmRMaW5rSW5wdXQhKSB7XG4gICAgICAgIGdldENhcmRMaW5rKGdldENhcmRMaW5rSW5wdXQ6ICRnZXRDYXJkTGlua0lucHV0KSB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICBtZW1iZXJJZFxuICAgICAgICAgICAgICAgIGNhcmRzIHtcbiAgICAgICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICAgICAgYXBwbGljYXRpb25JRFxuICAgICAgICAgICAgICAgICAgICB0b2tlblxuICAgICAgICAgICAgICAgICAgICB0eXBlXG4gICAgICAgICAgICAgICAgICAgIG5hbWVcbiAgICAgICAgICAgICAgICAgICAgbGFzdDRcbiAgICAgICAgICAgICAgICAgICAgZXhwaXJhdGlvblxuICAgICAgICAgICAgICAgICAgICBhZGRpdGlvbmFsUHJvZ3JhbUlEXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgIHN0YXR1c1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gUXVlcnkgdXNlZCB0byByZXRyaWV2ZSBhbGwgdXNlcnMgd2l0aCBubyBsaW5rZWQgY2FyZHNcbmV4cG9ydCBjb25zdCBnZXRVc2Vyc1dpdGhOb0NhcmRzID0gLyogR3JhcGhRTCAqLyBgXG4gICAgcXVlcnkgR2V0VXNlcnNXaXRoTm9DYXJkcyB7XG4gICAgICAgIGdldFVzZXJzV2l0aE5vQ2FyZHMge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgZW1haWxcbiAgICAgICAgICAgICAgICBmaXJzdE5hbWVcbiAgICAgICAgICAgICAgICBsYXN0TmFtZVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gUXVlcnkgdXNlZCB0byByZXRyaWV2ZSBhbGwgdXNlcnMgd2l0aCBsaW5rZWQgY2FyZHMsIGVsaWdpYmxlIGZvciByZWltYnVyc2VtZW50c1xuZXhwb3J0IGNvbnN0IGdldEVsaWdpYmxlTGlua2VkVXNlcnMgPSAvKiBHcmFwaFFMICovIGBcbiAgICBxdWVyeSBHZXRFbGlnaWJsZUxpbmtlZFVzZXJzIHtcbiAgICAgICAgZ2V0RWxpZ2libGVMaW5rZWRVc2VycyB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICBjYXJkSWRzXG4gICAgICAgICAgICAgICAgbWVtYmVySWRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cblxuLy8gUXVlcnkgdXNlZCB0byByZXRyaWV2ZSBhIGZpbGUgZnJvbSBzdG9yYWdlXG5leHBvcnQgY29uc3QgZ2V0U3RvcmFnZSA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIHF1ZXJ5IEdldFN0b3JhZ2UoJGdldFN0b3JhZ2VJbnB1dDogR2V0U3RvcmFnZUlucHV0ISkge1xuICAgICAgICBnZXRTdG9yYWdlKGdldFN0b3JhZ2VJbnB1dDogJGdldFN0b3JhZ2VJbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIHVybFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gUXVlcnkgdXNlZCB0byBnZXQgdGhlIHZlcmlmaWNhdGlvbiBzdGF0dXMgb2YgYSBwYXJ0aWN1bGFyIGluZGl2aWR1YWxcbmV4cG9ydCBjb25zdCBnZXRNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1cyA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIHF1ZXJ5IEdldE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzKCRnZXRNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0OiBHZXRNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0ISkge1xuICAgICAgICBnZXRNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1cyhnZXRNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0OiAkZ2V0TWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dCkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgbWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG4iXX0=