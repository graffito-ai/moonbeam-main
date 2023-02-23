export const listReferralsForSignIn = /* GraphQL */ `
    query ListReferrals(
        $filter: ModelReferralFilterInput
    ) {
        listReferrals(filter: $filter) {
            items {
                id
                _version
            }
        }
    }
`;
