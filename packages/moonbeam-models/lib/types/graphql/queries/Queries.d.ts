/**
 * This is a file used to define the all GraphQL query constants
 */
export declare const getAppReviewEligibility = "\n    query GetAppReviewEligibility($getAppReviewEligibilityInput: GetAppReviewEligibilityInput!) {\n        getAppReviewEligibility(getAppReviewEligibilityInput: $getAppReviewEligibilityInput) {\n            errorMessage\n            errorType\n            data\n        }\n    }\n";
export declare const getFilesForUser = "\n    query GetFilesForUser($getFilesForUserInput: GetFilesForUserInput!) {\n        getFilesForUser(getFilesForUserInput: $getFilesForUserInput) {\n            errorMessage\n            errorType\n            data\n        }\n    }\n";
export declare const getMilitaryVerificationInformation = "\n    query GetMilitaryVerificationInformation($getMilitaryVerificationInformationInput: GetMilitaryVerificationInformationInput!) {\n        getMilitaryVerificationInformation(getMilitaryVerificationInformationInput: $getMilitaryVerificationInformationInput) {\n            errorMessage\n            errorType\n            data {\n                id,\n                firstName,\n                lastName,\n                dateOfBirth,\n                enlistmentYear,\n                addressLine,\n                city,\n                state,\n                zipCode,\n                createdAt,\n                updatedAt,\n                militaryDutyStatus,\n                militaryBranch,\n                militaryAffiliation,\n                militaryVerificationStatus\n            }\n        }\n    }\n";
export declare const getUserCardLinkingId = "\n    query GetUserCardLinkingId($getUserCardLinkingIdInput: GetUserCardLinkingIdInput!) {\n        getUserCardLinkingId(getUserCardLinkingIdInput: $getUserCardLinkingIdInput) {\n            errorMessage\n            errorType\n            data\n        }\n    }\n";
export declare const getUserFromReferral = "\n    query GetUserFromReferral($getUserFromRefferalInput: UserFromReferralInput!) {\n        getUserFromReferral(userFromReferralInput: $getUserFromRefferalInput) {\n            errorMessage\n            errorType\n            data\n        }\n    }\n";
export declare const getReferralsByStatus = "\n    query GetReferralsByStatus($getReferralsByStatusInput: GetReferralsByStatusInput!) {\n        getReferralsByStatus(getReferralsByStatusInput: $getReferralsByStatusInput) {\n            errorMessage\n            errorType\n            data {\n                fromId\n                timestamp\n                toId\n                campaignCode\n                createdAt\n                updatedAt\n                status\n            }\n        }\n    }\n";
export declare const getAppUpgradeCredentials = "\n    query GetAppUpgradeCredentials {\n        getAppUpgradeCredentials {\n            errorMessage\n            errorType\n            data\n        }\n    }\n";
export declare const getUserAuthSession = "\n    query GetUserAuthSession($getUserAuthSessionInput: GetUserAuthSessionInput!) {\n        getUserAuthSession(getUserAuthSessionInput: $getUserAuthSessionInput) {\n            errorMessage\n            errorType\n            data {\n                id\n                createdAt\n                updatedAt\n                numberOfSessions\n            }\n        }\n    }\n";
export declare const getNotificationReminders = "\n    query GetNotificationReminders {\n        getNotificationReminders {\n            errorMessage\n            errorType\n            data {\n                id\n                notificationReminderType\n                notificationReminderStatus\n                notificationReminderCadence\n                createdAt\n                updatedAt\n                nextTriggerAt\n                notificationChannelType\n                notificationReminderCount\n                notificationReminderMaxCount\n            }\n        }\n    }\n";
export declare const getAllUsersForNotificationReminders = "\n    query GetAllUsersForNotificationReminders {\n        getAllUsersForNotificationReminders {\n            errorMessage\n            errorType\n            data {\n                id\n                email\n                firstName\n                lastName\n            }\n        }\n    }\n";
export declare const getFAQs = "\n    query GetFAQs {\n        getFAQs {\n            errorMessage\n            errorType\n            data {\n                id\n                title\n                createdAt\n                updatedAt\n                facts {\n                    description\n                    linkableKeyword\n                    linkLocation\n                    type\n                }\n            }\n        }\n    }\n";
export declare const getFidelisPartners = "\n    query GetFidelisPartners {\n        getFidelisPartners {\n            errorMessage\n            errorType\n            data {\n                brandName\n                veteranOwned\n                numberOfOffers\n                offers {\n                    id\n                    corporateId\n                    created\n                    offerState\n                    availability\n                    brandId\n                    brandDba\n                    brandLogo\n                    brandLogoSm\n                    brandBanner\n                    brandParentCategory\n                    brandStubCopy\n                    brandWebsite\n                    storeDetails {\n                        id\n                        name\n                        phone\n                        address1\n                        city\n                        state\n                        countryCode\n                        postCode\n                        geoLocation {\n                            latitude\n                            longitude\n                        }\n                        isOnline\n                        distance\n                    }\n                    description\n                    reach\n                    title\n                    qualifier\n                    tile\n                    startDate\n                    endDate\n                    currency\n                    extOfferId\n                    supplierOfferKey\n                    redemptionType\n                    redemptionInstructionUrl\n                    redemptionTrigger\n                    budget\n                    daysAvailability\n                    stores\n                    totalRedeemLimit\n                    redeemLimitPerUser\n                    purchaseAmount\n                    purchaseFrequency\n                    reward {\n                        type\n                        value\n                        maxValue\n                    }\n                }\n            }\n        }\n    }\n";
export declare const searchOffers = "\n    query SearchOffers($searchOffersInput: SearchOffersInput!) {\n        searchOffers(searchOffersInput: $searchOffersInput) {\n            errorMessage\n            errorType\n            data {\n                totalNumberOfPages\n                totalNumberOfRecords\n                offers {\n                    id\n                    corporateId\n                    created\n                    offerState\n                    availability\n                    brandId\n                    brandDba\n                    brandLogo\n                    brandLogoSm\n                    brandBanner\n                    brandParentCategory\n                    brandStubCopy\n                    brandWebsite\n                    storeDetails {\n                        id\n                        name\n                        phone\n                        address1\n                        city\n                        state\n                        countryCode\n                        postCode\n                        geoLocation {\n                            latitude\n                            longitude\n                        }\n                        isOnline\n                        distance\n                    }\n                    description\n                    reach\n                    title\n                    qualifier\n                    tile\n                    startDate\n                    endDate\n                    currency\n                    extOfferId\n                    supplierOfferKey\n                    redemptionType\n                    redemptionInstructionUrl\n                    redemptionTrigger\n                    budget\n                    daysAvailability\n                    stores\n                    totalRedeemLimit\n                    redeemLimitPerUser\n                    purchaseAmount\n                    purchaseFrequency\n                    reward {\n                        type\n                        value\n                        maxValue\n                    }\n                }\n            }\n        }\n    }\n";
export declare const getOffers = "\n    query GetOffers($getOffersInput: GetOffersInput!) {\n        getOffers(getOffersInput: $getOffersInput) {\n            errorMessage\n            errorType\n            data {\n                totalNumberOfPages\n                totalNumberOfRecords\n                offers {\n                    id\n                    corporateId\n                    created\n                    offerState\n                    availability\n                    brandId\n                    brandDba\n                    brandLogo\n                    brandLogoSm\n                    brandBanner\n                    brandParentCategory\n                    brandStubCopy\n                    brandWebsite\n                    storeDetails {\n                        id\n                        name\n                        phone\n                        address1\n                        city\n                        state\n                        countryCode\n                        postCode\n                        geoLocation {\n                            latitude\n                            longitude\n                        }\n                        isOnline\n                        distance\n                    }\n                    description\n                    reach\n                    title\n                    qualifier\n                    tile\n                    startDate\n                    endDate\n                    currency\n                    extOfferId\n                    supplierOfferKey\n                    redemptionType\n                    redemptionInstructionUrl\n                    redemptionTrigger\n                    budget\n                    daysAvailability\n                    stores\n                    totalRedeemLimit\n                    redeemLimitPerUser\n                    purchaseAmount\n                    purchaseFrequency\n                    reward {\n                        type\n                        value\n                        maxValue\n                    }\n                }\n            }\n        }\n    }\n";
export declare const getSeasonalOffers = "\n    query GetSeasonalOffers($getOffersInput: GetOffersInput!) {\n        getSeasonalOffers(getOffersInput: $getOffersInput) {\n            errorMessage\n            errorType\n            data {\n                totalNumberOfPages\n                totalNumberOfRecords\n                offers {\n                    id\n                    corporateId\n                    created\n                    offerState\n                    availability\n                    brandId\n                    brandDba\n                    brandLogo\n                    brandLogoSm\n                    brandBanner\n                    brandParentCategory\n                    brandStubCopy\n                    brandWebsite\n                    storeDetails {\n                        id\n                        name\n                        phone\n                        address1\n                        city\n                        state\n                        countryCode\n                        postCode\n                        geoLocation {\n                            latitude\n                            longitude\n                        }\n                        isOnline\n                        distance\n                    }\n                    description\n                    reach\n                    title\n                    qualifier\n                    tile\n                    startDate\n                    endDate\n                    currency\n                    extOfferId\n                    supplierOfferKey\n                    redemptionType\n                    redemptionInstructionUrl\n                    redemptionTrigger\n                    budget\n                    daysAvailability\n                    stores\n                    totalRedeemLimit\n                    redeemLimitPerUser\n                    purchaseAmount\n                    purchaseFrequency\n                    reward {\n                        type\n                        value\n                        maxValue\n                    }\n                }\n            }\n        }\n    }\n";
export declare const getPremierOffers = "\n    query GetPremierOffers($getOffersInput: GetOffersInput!) {\n        getPremierOffers(getOffersInput: $getOffersInput) {\n            errorMessage\n            errorType\n            data {\n                totalNumberOfPages\n                totalNumberOfRecords\n                offers {\n                    id\n                    corporateId\n                    created\n                    offerState\n                    availability\n                    brandId\n                    brandDba\n                    brandLogo\n                    brandLogoSm\n                    brandBanner\n                    brandParentCategory\n                    brandStubCopy\n                    brandWebsite\n                    storeDetails {\n                        id\n                        name\n                        phone\n                        address1\n                        city\n                        state\n                        countryCode\n                        postCode\n                        geoLocation {\n                            latitude\n                            longitude\n                        }\n                        isOnline\n                        distance\n                    }\n                    description\n                    reach\n                    title\n                    qualifier\n                    tile\n                    startDate\n                    endDate\n                    currency\n                    extOfferId\n                    supplierOfferKey\n                    redemptionType\n                    redemptionInstructionUrl\n                    redemptionTrigger\n                    budget\n                    daysAvailability\n                    stores\n                    totalRedeemLimit\n                    redeemLimitPerUser\n                    purchaseAmount\n                    purchaseFrequency\n                    reward {\n                        type\n                        value\n                        maxValue\n                    }\n                }\n            }\n        }\n    }\n";
export declare const getDevicesForUser = "\n    query GetDevicesForUser($getDevicesForUserInput: GetDevicesForUserInput!) {\n        getDevicesForUser(getDevicesForUserInput: $getDevicesForUserInput) {\n            errorMessage\n            errorType\n            data {\n                id\n                tokenId\n                deviceState\n                lastLoginDate\n            }\n        }\n    }\n";
export declare const getDevice = "\n    query GetDevice($getDeviceInput: GetDeviceInput!) {\n        getDevice(getDeviceInput: $getDeviceInput) {\n            errorMessage\n            errorType\n            data {\n                id\n                tokenId\n                deviceState\n                lastLoginDate\n            }\n        }\n    }\n";
export declare const getDeviceByToken = "\n    query GetDeviceByToken($getDeviceByTokenInput: GetDeviceByTokenInput!) {\n        getDeviceByToken(getDeviceByTokenInput: $getDeviceByTokenInput) {\n            errorMessage\n            errorType\n            data {\n                id\n                tokenId\n                deviceState\n                lastLoginDate\n            }\n        }\n    }\n";
export declare const getTransaction = "\n    query GetTransaction($getTransactionInput: GetTransactionInput!) {\n        getTransaction(getTransactionInput: $getTransactionInput) {\n            errorMessage\n            errorType\n            data {\n                id\n                timestamp\n                transactionId\n                transactionStatus\n                transactionType\n                createdAt\n                updatedAt\n                memberId\n                cardId\n                brandId\n                storeId\n                category\n                currencyCode\n                rewardAmount\n                totalAmount\n                pendingCashbackAmount\n                creditedCashbackAmount\n                transactionBrandName\n                transactionBrandAddress\n                transactionBrandLogoUrl\n                transactionBrandURLAddress\n                transactionIsOnline\n            }\n        }\n    }\n";
export declare const getTransactionByStatus = "\n    query GetTransactionByStatus($getTransactionByStatusInput: GetTransactionByStatusInput!) {\n        getTransactionByStatus(getTransactionByStatusInput: $getTransactionByStatusInput) {\n            errorMessage\n            errorType\n            data {\n                id\n                timestamp\n                transactionId\n                transactionStatus\n                creditedCashbackAmount\n                pendingCashbackAmount\n                rewardAmount\n                totalAmount\n            }\n        }\n    }\n";
export declare const getCardLink = "\n    query GetCardLink($getCardLinkInput: GetCardLinkInput!) {\n        getCardLink(getCardLinkInput: $getCardLinkInput) {\n            errorMessage\n            errorType\n            data {\n                id\n                memberId\n                cards {\n                    id\n                    applicationID\n                    token\n                    type\n                    name\n                    last4\n                    additionalProgramID\n                }\n                createdAt\n                updatedAt\n                status\n            }\n        }\n    }\n";
export declare const getUsersWithNoCards = "\n    query GetUsersWithNoCards {\n        getUsersWithNoCards {\n            errorMessage\n            errorType\n            data {\n                id\n                email\n                firstName\n                lastName\n            }\n        }\n    }\n";
export declare const getEligibleLinkedUsers = "\n    query GetEligibleLinkedUsers {\n        getEligibleLinkedUsers {\n            errorMessage\n            errorType\n            data {\n                id\n                cardIds\n                memberId\n            }\n        }\n    }\n";
export declare const getStorage = "\n    query GetStorage($getStorageInput: GetStorageInput!) {\n        getStorage(getStorageInput: $getStorageInput) {\n            errorMessage\n            errorType\n            data {\n                url\n            }\n        }\n    }\n";
export declare const getMilitaryVerificationStatus = "\n    query GetMilitaryVerificationStatus($getMilitaryVerificationInput: GetMilitaryVerificationInput!) {\n        getMilitaryVerificationStatus(getMilitaryVerificationInput: $getMilitaryVerificationInput) {\n            errorMessage\n            errorType\n            data {\n                id\n                militaryVerificationStatus\n            }\n        }\n    }\n";
