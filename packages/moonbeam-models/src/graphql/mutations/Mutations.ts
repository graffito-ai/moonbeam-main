// This is a file used to define the all GraphQL mutations

// Mutation used to create a referral
export const createReferral = /* GraphQL */ `
    mutation CreateReferral($createInput: CreateReferralInput!) {
        createReferral(createInput: $createInput) {
            errorType
            errorMessage
            data {
                id
            }
        }
    }
`;

// Mutation used to update a referral
export const updateReferral = /* GraphQL */ `
    mutation UpdateReferral($updateInput: UpdateReferralInput!) {
        updateReferral(updateInput: $updateInput) {
            errorType
            errorMessage
            data {
                id
            }
        }
    }
`;
