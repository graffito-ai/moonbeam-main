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
