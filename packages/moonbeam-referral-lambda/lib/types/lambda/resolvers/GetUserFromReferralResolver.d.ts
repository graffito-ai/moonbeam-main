import { UserFromReferralInput, UserFromReferralResponse } from "@moonbeam/moonbeam-models";
/**
 * GetUserFromReferral resolver
 *
 * @param userFromReferralInput the input needed to retrieve a user's details from a referral code
 * @param fieldName name of the resolver path from the AppSync event
 * @returns {@link Promise} of {@link UserFromReferralResponse}
 */
export declare const getUserFromReferral: (fieldName: string, userFromReferralInput: UserFromReferralInput) => Promise<UserFromReferralResponse>;
