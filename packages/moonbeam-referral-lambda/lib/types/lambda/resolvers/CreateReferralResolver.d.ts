import { CreateReferralInput, ReferralResponse } from "@moonbeam/moonbeam-models";
/**
 * CreateReferral resolver
 *
 * @param createReferralInput the input needed to create a new referral
 * @param fieldName name of the resolver path from the AppSync event
 * @returns {@link Promise} of {@link ReferralResponse}
 */
export declare const createReferral: (fieldName: string, createReferralInput: CreateReferralInput) => Promise<ReferralResponse>;
