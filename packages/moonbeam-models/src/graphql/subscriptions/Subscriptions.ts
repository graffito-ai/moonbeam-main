// This is a file used to define the all GraphQL subscription constants

// Subscription used to subscribe to a Plaid Linking session update for a particular user it, timestamp and link token.
export const updatedPlaidLinkingSession = /* GraphQL */ `
    subscription UpdatedPlaidLinkingSession($id: ID!, $link_token: String!, $timestamp: AWSTimestamp!) {
        updatedPlaidLinkingSession(id: $id, link_token: $link_token, timestamp: $timestamp) {
            errorType
            errorMessage
            id
            link_token
            timestamp
            data {
                id
                createdAt
                updatedAt
                expiration
                hosted_link_url
                link_token
                request_id
                session_id
                status
            }
        }
    }
`;

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

// Subscription used to subscribe to any transaction updates for a particular user id.
export const updatedTransaction = /* GraphQL */ `
    subscription UpdatedTransaction($id: ID!) {
        updatedTransaction(id: $id) {
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
                transactionBrandAddress
                transactionBrandLogoUrl
                transactionBrandURLAddress
                transactionIsOnline
            }
        }
    }
`;
