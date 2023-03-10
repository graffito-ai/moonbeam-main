// This is a file used to define the all GraphQL mutation examples

// Mutation used to create a referral
export const createReferral = /* GraphQL */ `
    mutation CreateReferral($createInput: CreateReferralInput!) {
        createReferral(createReferralInput: $createInput) {
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
        updateReferral(updateReferralInput: $updateInput) {
            errorType
            errorMessage
            data {
                id
            }
        }
    }
`;
