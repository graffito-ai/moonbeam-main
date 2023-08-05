import { ReimbursementResponse, UpdateReimbursementInput } from "@moonbeam/moonbeam-models";
/**
 * UpdateReimbursement resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param updateReimbursementInput update reimbursement input, used to update an existent reimbursement
 * @returns {@link Promise} of {@link ReimbursementResponse}
 */
export declare const updateReimbursement: (fieldName: string, updateReimbursementInput: UpdateReimbursementInput) => Promise<ReimbursementResponse>;
