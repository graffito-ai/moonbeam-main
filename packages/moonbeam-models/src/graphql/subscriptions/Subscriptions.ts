// This is a file used to define the all GraphQL subscription constants

// Subscription used to subscribe to a military status update for a particular user id.
export const updatedMilitaryVerificationStatus = /* GraphQL */ `
    subscription UpdatedMilitaryVerificationStatus($id: ID!) {
        updatedMilitaryVerificationStatus(id: $id) {
            errorType
            errorMessage
            id
            militaryVerificationStatus
        }
    }
`;

// Subscription used to subscribe to a transaction creation for a particular user id.
export const createdTransaction = /* GraphQL */ `
    subscription CreatedTransaction($id: ID!) {
        createdTransaction(id: $id) {
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
                transactionBrandDescription
                transactionBrandAddress
                transactionBrandLogoUrl
            }
        }
    }
`;
