// This is a file used to define the all GraphQL query constants

// Mutation used to create a referral
export const createReferral = /* GraphQL */ `
    mutation CreateReferral($createReferralInput: CreateReferralInput!) {
        createReferral(createReferralInput: $createReferralInput) {
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
    mutation UpdateReferral($updateReferralInput: UpdateReferralInput!) {
        updateReferral(updateReferralInput: $updateReferralInput) {
            errorType
            errorMessage
            data {
                id
            }
        }
    }
`;

// Mutation used to create an account link
export const createAccountLink = /* GraphQL */ `
    mutation CreateAccountLink($createAccountLinkInput: CreateAccountLinkInput!) {
        createAccountLink(createAccountLinkInput: $createAccountLinkInput) {
            errorType
            errorMessage
            data {
                id
                links {
                    linkToken
                    accessToken
                }
            }
        }
    }
`;

// Mutation used to update an account link
export const updateAccountLink = /* GraphQL */ `
    mutation UpdateAccountLink($updateAccountLinkInput: UpdateAccountLinkInput!) {
        updateAccountLink(updateAccountLinkInput: $updateAccountLinkInput) {
            errorType
            errorMessage
            data {
                id
                links {
                    accounts {
                        id
                        name
                        mask
                        type
                        verificationStatus
                    }
                    institution {
                        name
                        id
                    }
                }
            }
        }
    }
`;


// Mutation used to delete one or more accounts from an account link
export const deleteAccount = /* GraphQL */ `
    mutation DeleteAccount($deleteAccountInput: DeleteAccountInput!) {
        deleteAccount(deleteAccountInput: $deleteAccountInput) {
            errorType
            errorMessage
            data {
                id
                name
                mask
                type
                verificationStatus
                institution {
                    id
                    name
                }
                linkToken
            }
        }
    }
`;
