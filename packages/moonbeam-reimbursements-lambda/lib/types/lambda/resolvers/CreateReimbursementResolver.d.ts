import { CreateReimbursementInput, ReimbursementResponse } from "@moonbeam/moonbeam-models";
/**
 * CreateReimbursement resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param createReimbursementInput create reimbursement input object, used to create a reimbursement
 * based on a triggered cron event.
 * @returns {@link Promise} of {@link ReimbursementResponse}
 */
export declare const createReimbursement: (fieldName: string, createReimbursementInput: CreateReimbursementInput) => Promise<ReimbursementResponse>;
