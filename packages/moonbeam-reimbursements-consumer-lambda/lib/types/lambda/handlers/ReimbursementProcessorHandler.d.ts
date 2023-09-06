import { SQSBatchResponse, SQSEvent } from "aws-lambda";
/**
 * ReimbursementProcessorHandler handler
 *
 * @param event the {@link SQSEvent} to be processed, containing the reimbursement
 * message information
 * @returns {@link Promise} of {@link SQSBatchResponse}
 */
export declare const processReimbursements: (event: SQSEvent) => Promise<SQSBatchResponse>;
