// This is a file used to define the all GraphQL query constants

// Query used to retrieve a referral based on its id
export const getReferral = /* GraphQL */ `
    query GetReferral($id: String!) {
        getReferral(id: $id) {
            errorMessage
            errorType
            data {
                id
                inviterName
                status
            }
        }
    }
`;

// Query used to retrieve a list of referrals, based on some filters
export const listReferrals = /* GraphQL */ `
    query ListReferrals($filter: ListReferralInput!) {
        listReferrals(filter: $filter) {
            errorMessage
            errorType
            data {
                id
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

// Query used to retrieve a bank account link based on its id (user id)
export const getAccountLink = /* GraphQL */ `
    query GetAccountLink($id: String!) {
        getAccountLink(id: $id) {
            errorMessage
            errorType
            data {
                id
                links {
                    accounts {
                        id
                    }
                    publicToken
                    accessToken
                    linkToken
                }
            }
        }
    }
`;

// Query used to retrieve a list of accounts, based on some filters
export const listAccounts = /* GraphQL */ `
    query ListAccounts($filter: ListAccountsInput!) {
        listAccounts(filter: $filter) {
            errorMessage
            errorType
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

// Query used to retrieve a list of FAQs, based on their type
export const listFAQs = /* GraphQL */ `
    query ListFAQs($listFAQInput: ListFAQInput!) {
        listFAQs(listFAQInput: $listFAQInput) {
            errorMessage
            errorType
            data {
                id
                createdAt
                updatedAt
                title
                type
                facts {
                    title
                    description
                    link
                    linkTitle
                }
                applicationLink
            }
        }
    }
`;
