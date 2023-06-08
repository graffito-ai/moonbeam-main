// This is a file used to define the all GraphQL query constants

// Query used to retrieve a card link for a particular user
export const getCardLink = /* GraphQL */ `
    query GetCardLink($getCardLinkInput: GetCardLinkInput!) {
        getCardLink(getCardLinkInput: $getCardLinkInput) {
            errorMessage
            errorType
            data {
                id
                cards {
                    id
                    token
                    type
                    name
                    last4
                    additionalProgramID
                    createdAt
                    updatedAt
                }
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
                militaryVerificationStatus
            }
        }
    }
`;
