// This is a file used to define the all GraphQL query constants

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

// Query used to retrieve reimbursements for a particular user, in a particular status
export const getReimbursementByStatus = /* GraphQL */ `
    query GetReimbursementByStatus($getReimbursementByStatusInput: GetReimbursementByStatusInput!) {
        getReimbursementByStatus(getReimbursementByStatusInput: $getReimbursementByStatusInput) {
            errorMessage
            errorType
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

// Query used to retrieve transactions for a particular user, in a particular status
export const getTransactionByStatus = /* GraphQL */ `
    query GetTransactionByStatus($getTransactionByStatusInput: GetTransactionByStatusInput!) {
        getTransactionByStatus(getTransactionByStatusInput: $getTransactionByStatusInput) {
            errorMessage
            errorType
            data {
                id
                transactionStatus
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
                    additionalProgramID
                }
                createdAt
                updatedAt
                status
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
                cardId
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
