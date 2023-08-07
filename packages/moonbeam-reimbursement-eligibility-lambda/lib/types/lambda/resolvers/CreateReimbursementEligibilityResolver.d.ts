import { CreateReimbursementEligibilityInput, ReimbursementEligibilityResponse } from "@moonbeam/moonbeam-models";
/**
 * CreateReimbursementEligibility resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param createReimbursementEligibilityInput create reimbursement eligibility input object, used to create a reimbursement
 * eligibility based on a triggered cron event.
 * @returns {@link Promise} of {@link ReimbursementEligibilityResponse}
 */
export declare const createReimbursementEligibility: (fieldName: string, createReimbursementEligibilityInput: CreateReimbursementEligibilityInput) => Promise<ReimbursementEligibilityResponse>;
