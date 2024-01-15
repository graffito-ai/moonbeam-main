import { SQSBatchResponse, SQSEvent } from "aws-lambda";
/**
 * ReferralProcessor handler
 *
 * @param event the {@link SQSEvent} to be processed, containing the referral information
 * @returns {@link Promise} of {@link SQSBatchResponse}
 */
export declare const processReferral: (event: SQSEvent) => Promise<SQSBatchResponse>;
