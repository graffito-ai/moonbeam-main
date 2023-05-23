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
