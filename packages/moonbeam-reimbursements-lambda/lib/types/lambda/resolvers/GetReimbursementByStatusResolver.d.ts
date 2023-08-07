import { GetReimbursementByStatusInput, ReimbursementByStatusResponse } from "@moonbeam/moonbeam-models";
/**
 * GetReimbursementByStatus resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getReimbursementByStatusInput get reimbursement by status input object, used to retrieve reimbursement information,
 *                                    based on status.
 *
 * @returns {@link Promise} of {@link ReimbursementByStatusResponse}
 */
export declare const getReimbursementByStatus: (fieldName: string, getReimbursementByStatusInput: GetReimbursementByStatusInput) => Promise<ReimbursementByStatusResponse>;
