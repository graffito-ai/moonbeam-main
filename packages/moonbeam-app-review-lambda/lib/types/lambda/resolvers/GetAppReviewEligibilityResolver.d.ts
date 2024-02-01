import { GetAppReviewEligibilityInput, GetAppReviewEligibilityResponse } from "@moonbeam/moonbeam-models";
/**
 * GetAppReviewEligibility resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getAppReviewEligibilityInput the input passed in, used to retrieve a user's
 * eligibility in terms of App Store reviews.
 *
 * @returns {@link Promise} of {@link GetAppReviewEligibilityResponse}
 */
export declare const getAppReviewEligibility: (fieldName: string, getAppReviewEligibilityInput: GetAppReviewEligibilityInput) => Promise<GetAppReviewEligibilityResponse>;
