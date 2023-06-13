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
