import { ListReferralInput, ReferralResponse } from "@moonbeam/moonbeam-models";
/**
 * ListReferrals resolver
 *
 * @param filter filters to be passed in, which will help filter through all referrals
 * @returns {@link Promise} of {@link ReferralResponse}
 */
export declare const listReferrals: (filter: ListReferralInput) => Promise<ReferralResponse>;
