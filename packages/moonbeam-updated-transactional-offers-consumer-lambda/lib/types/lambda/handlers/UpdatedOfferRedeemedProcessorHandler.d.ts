import { SQSBatchResponse, SQSEvent } from "aws-lambda";
/**
 * UpdatedOfferRedeemedProcessorHandler handler
 *
 * @param event the {@link SQSEvent} to be processed, containing the updated transaction
 * message information
 * @returns {@link Promise} of {@link SQSBatchResponse}
 */
export declare const processUpdatedOfferRedeemedTransactions: (event: SQSEvent) => Promise<SQSBatchResponse>;
