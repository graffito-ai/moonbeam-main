import { SQSBatchResponse, SQSEvent } from "aws-lambda";
/**
 * MilitaryVerificationUpdatesProcessorHandler handler
 *
 * @param event the {@link SQSEvent} to be processed, containing the military verification update
 * message information
 * @returns {@link Promise} of {@link SQSBatchResponse}
 */
export declare const processMilitaryVerificationUpdate: (event: SQSEvent) => Promise<SQSBatchResponse>;
