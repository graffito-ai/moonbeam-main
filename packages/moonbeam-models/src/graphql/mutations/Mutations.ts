// This is a file used to define the all GraphQL query constants

// Mutation used to upload a file in storage
export const putStorage = /* GraphQL */ `
    mutation PutStorage($putStorageInput: PutStorageInput!) {
        putStorage(putStorageInput: $putStorageInput) {
            errorType
            errorMessage
            data {
                url
            }
        }
    }
`;

// Mutation used to create an individual's military verification object
export const createMilitaryVerification = /* GraphQL */ `
    mutation CreateMilitaryVerification($createMilitaryVerificationInput: CreateMilitaryVerificationInput!) {
        createMilitaryVerification(createMilitaryVerificationInput: $createMilitaryVerificationInput) {
            errorType
            errorMessage
            data {
                id
                firstName
                lastName
                dateOfBirth
                addressLine
                city
                state
                zipCode
                createdAt
                updatedAt
                militaryDutyStatus
                militaryBranch
                militaryAffiliation
                militaryVerificationStatus
            }
        }
    }
`;

// Mutation used to update an individual's military verification status
export const updateMilitaryVerificationStatus = /* GraphQL */ `
    mutation UpdateMilitaryVerificationStatus($updateMilitaryVerificationInput: UpdateMilitaryVerificationInput!) {
        updateMilitaryVerificationStatus(updateMilitaryVerificationInput: $updateMilitaryVerificationInput) {
            errorType
            errorMessage
            data {
                id
                firstName
                lastName
                dateOfBirth
                addressLine
                city
                state
                zipCode
                createdAt
                updatedAt
                militaryDutyStatus
                militaryBranch
                militaryAffiliation
                militaryVerificationStatus
            }
        }
    }
`;
