import { ReimbursementEligibilityResponse, UpdateReimbursementEligibilityInput } from "@moonbeam/moonbeam-models";
/**
 * UpdateReimbursementEligibility resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param updateReimbursementEligibilityInput update reimbursement eligibility input, used to update an existent reimbursement eligibility
 * @returns {@link Promise} of {@link ReimbursementResponse}
 */
export declare const updateReimbursementEligibility: (fieldName: string, updateReimbursementEligibilityInput: UpdateReimbursementEligibilityInput) => Promise<ReimbursementEligibilityResponse>;
