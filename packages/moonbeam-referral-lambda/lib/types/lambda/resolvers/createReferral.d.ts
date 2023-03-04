import { CreateReferralInput, ReferralResponse } from "@moonbeam/moonbeam-models";
/**
 * CreateReferral resolver
 *
 * @param createInput referral object to be created
 * @returns {@link Promise} of {@link ReferralResponse}
 */
export declare const createReferral: (createInput: CreateReferralInput) => Promise<ReferralResponse>;
