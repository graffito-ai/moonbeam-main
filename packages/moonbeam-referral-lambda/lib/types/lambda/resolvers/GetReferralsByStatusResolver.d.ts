import { GetReferralsByStatusInput, ReferralResponse } from "@moonbeam/moonbeam-models";
/**
 * GetReferralsByStatus resolver
 *
 * @param getReferralsByStatusInput the input needed to create a new referral
 * @param fieldName name of the resolver path from the AppSync event
 * @returns {@link Promise} of {@link ReferralResponse}
 */
export declare const getReferralsByStatus: (fieldName: string, getReferralsByStatusInput: GetReferralsByStatusInput) => Promise<ReferralResponse>;
