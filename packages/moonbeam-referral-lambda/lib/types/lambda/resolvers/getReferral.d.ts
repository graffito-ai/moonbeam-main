import { ReferralResponse } from "@moonbeam/moonbeam-models";
/**
 * GetReferral resolver
 *
 * @param id referral id, for the referral to be retrieved
 * @returns {@link Promise} of {@link ReferralResponse}
 */
export declare const getReferral: (id: string) => Promise<ReferralResponse>;
