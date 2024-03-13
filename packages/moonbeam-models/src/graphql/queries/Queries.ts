/**
 * This is a file used to define the all GraphQL query constants
 */

// Query used to retrieve the reimbursements for a particular user
export const getReimbursements = /* GraphQL */ `
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
export const getLocationPredictions = /* GraphQL */ `
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
export const getAppReviewEligibility = /* GraphQL */ `
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
export const getFilesForUser = /* GraphQL */ `
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
export const getMilitaryVerificationInformation = /* GraphQL */ `
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
export const getUserCardLinkingId = /* GraphQL */ `
    query GetUserCardLinkingId($getUserCardLinkingIdInput: GetUserCardLinkingIdInput!) {
        getUserCardLinkingId(getUserCardLinkingIdInput: $getUserCardLinkingIdInput) {
            errorMessage
            errorType
            data
        }
    }
`;

// Query used to retrieve a user's details from a referral code
export const getUserFromReferral = /* GraphQL */ `
    query GetUserFromReferral($getUserFromRefferalInput: UserFromReferralInput!) {
        getUserFromReferral(userFromReferralInput: $getUserFromRefferalInput) {
            errorMessage
            errorType
            data
        }
    }
`;

// Query used to get referrals filtered by a particular status
export const getReferralsByStatus = /* GraphQL */ `
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
export const getAppUpgradeCredentials = /* GraphQL */ `
    query GetAppUpgradeCredentials {
        getAppUpgradeCredentials {
            errorMessage
            errorType
            data
        }
    }
`;

// Query used to retrieve a User Auth Session, for a particular user
export const getUserAuthSession = /* GraphQL */ `
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
export const getNotificationReminders = /* GraphQL */ `
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
export const getAllUsersForNotificationReminders = /* GraphQL */ `
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

// Query used to GeoCode and address using Google's APIs
export const geoCodeAsync = /* GraphQL */ `
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
export const getFAQs = /* GraphQL */ `
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
export const getEventSeries = /* GraphQL */ `
    query GetEventSeries {
        getEventSeries {
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

// Query used to retrieve all the Service partner organizations
export const getServicePartners = /* GraphQL */ `
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

// Query used to retrieve all the Fidelis partner offers, filtered by brand/partner (so we can display them as featured in the store)
export const getFidelisPartners = /* GraphQL */ `
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
export const searchOffers = /* GraphQL */ `
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
export const getOffers = /* GraphQL */ `
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
export const getSeasonalOffers = /* GraphQL */ `
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
export const getPremierOffers = /* GraphQL */ `
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
export const getDevicesForUser = /* GraphQL */ `
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
export const getDevice = /* GraphQL */ `
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
export const getDeviceByToken = /* GraphQL */ `
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
export const getTransaction = /* GraphQL */ `
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
export const getTransactionByStatus = /* GraphQL */ `
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
export const getCardLink = /* GraphQL */ `
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
export const getUsersWithNoCards = /* GraphQL */ `
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
export const getEligibleLinkedUsers = /* GraphQL */ `
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
export const getStorage = /* GraphQL */ `
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
export const getMilitaryVerificationStatus = /* GraphQL */ `
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
