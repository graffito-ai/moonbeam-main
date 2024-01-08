import { SQSBatchResponse, SQSEvent } from "aws-lambda";
/**
 * MilitaryVerificationReportingProcessorHandler handler
 *
 * @param event the {@link SQSEvent} to be processed, containing the military verification reporting
 * message information
 * @returns {@link Promise} of {@link SQSBatchResponse}
 */
export declare const processMilitaryVerificationReport: (event: SQSEvent) => Promise<SQSBatchResponse>;
