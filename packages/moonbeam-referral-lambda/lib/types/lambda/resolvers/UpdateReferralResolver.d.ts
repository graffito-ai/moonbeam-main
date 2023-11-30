import { ReferralResponse, UpdateReferralInput } from "@moonbeam/moonbeam-models";
/**
 * UpdateReferral resolver
 *
 * @param updateReferralInput the input needed to update an existing referral's data
 * @param fieldName name of the resolver path from the AppSync event
 * @returns {@link Promise} of {@link ReferralResponse}
 */
export declare const updateReferral: (fieldName: string, updateReferralInput: UpdateReferralInput) => Promise<ReferralResponse>;
