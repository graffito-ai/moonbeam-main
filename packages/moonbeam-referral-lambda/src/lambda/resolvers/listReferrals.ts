import * as AWS from 'aws-sdk'
import {ListReferralInput, Referral, ReferralErrorType, ReferralResponse} from "@moonbeam/moonbeam-models";
import {ReferralFiltering} from "@moonbeam/moonbeam-models";

/**
 * ListReferrals resolver
 *
 * @param filter filters to be passed in, which will help filter through all referrals
 * @returns {@link Promise} of {@link ReferralResponse}
 */
export const listReferrals = async (filter: ListReferralInput): Promise<ReferralResponse> => {
    // initializing the DynamoDB document client
    const docClient = new AWS.DynamoDB.DocumentClient();

    const params = {
        TableName: process.env.REFERRAL_TABLE!,
    };

    try {
        // constants to keep track of the type of filtering being done
        let referralFilterType: ReferralFiltering | null = null;

        // set type of filtering depending on the parameters to be passed in
        referralFilterType = (filter.inviterEmail && filter.statusInviter && filter.status)
            ? ReferralFiltering.INVITER_FILTER
            : ((filter.inviteeEmail && filter.statusInvitee && filter.status) ? ReferralFiltering.INVITEE_FILTER : referralFilterType)

        const result = await docClient.scan(params).promise();
        // build referral data response
        const referrals: Referral[] = [];
        result.Items!.forEach((item) => {
            referrals.push(item as Referral)
        });

        // filter the results according to the passed in filters
        const filteredReferrals: Referral[] = [];
        switch (referralFilterType) {
            case ReferralFiltering.INVITEE_FILTER:
                referrals
                    .filter((referral) => referral.inviteeEmail === filter.inviteeEmail! && referral.statusInvitee === filter.statusInvitee!)
                    .map((referral) => filteredReferrals.push(referral));
                break;
            case ReferralFiltering.INVITER_FILTER:
                referrals
                    .filter((referral) => referral.inviterEmail === filter.inviterEmail! && referral.statusInviter === filter.statusInviter!)
                    .map((referral) => filteredReferrals.push(referral));
                break;
            default:
                console.log(`Invalid type of filtering to be executed {}`, JSON.stringify(filter));
                return {
                    errorMessage: `Invalid type of filtering to be executed ${JSON.stringify(filter)}`,
                    errorType: ReferralErrorType.ValidationError
                };
        }
        // returns the filtered referrals as data
        return {
            data: filteredReferrals
        };
    } catch (err) {
        console.log(`Unexpected error while executing listReferrals query {}`, err);

        return {
            errorMessage: `Unexpected error while executing listReferrals query. ${err}`,
            errorType: ReferralErrorType.UnexpectedError
        };
    }
}
