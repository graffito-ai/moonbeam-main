// This is a file used to define the all GraphQL query constants

// Mutation used to create a new card link for a user, with a new card.
export const createCardLink = /* GraphQL */ `
    mutation CreateCardLink($createCardLinkInput: CreateCardLinkInput!) {
        createCardLink(createCardLinkInput: $createCardLinkInput) {
            errorType
            errorMessage
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
                    createdAt
                    updatedAt
                }
            }
        }
    }
`;

// Mutation used to remove a card link from a user's card link.
export const deleteCard = /* GraphQL */ `
    mutation DeleteCard($deleteCardInput: DeleteCardInput!) {
        deleteCard(deleteCardInput: $deleteCardInput) {
            errorType
            errorMessage
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
                enlistmentYear
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
                militaryVerificationStatus
            }
        }
    }
`;
