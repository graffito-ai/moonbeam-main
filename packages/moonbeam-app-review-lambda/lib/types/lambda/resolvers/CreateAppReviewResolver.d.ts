import { AppReviewResponse, CreateAppReviewInput } from "@moonbeam/moonbeam-models";
/**
 * CreateAppReview resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param createAppReviewInput the input passed in, used to create and/or update
 * an existing user's App Review record/eligibility.
 *
 * @returns {@link Promise} of {@link AppReviewResponse}
 */
export declare const createAppReview: (fieldName: string, createAppReviewInput: CreateAppReviewInput) => Promise<AppReviewResponse>;
