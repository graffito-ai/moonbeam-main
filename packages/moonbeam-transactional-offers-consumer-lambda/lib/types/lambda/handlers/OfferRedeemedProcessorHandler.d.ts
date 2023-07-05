import { SQSBatchResponse, SQSEvent } from "aws-lambda";
/**
 * OfferRedeemedProcessorHandler handler
 *
 * @param event the {@link SQSEvent} to be processed, containing the transaction
 * message information
 * @returns {@link Promise} of {@link SQSBatchResponse}
 */
export declare const processOfferRedeemedTransactions: (event: SQSEvent) => Promise<SQSBatchResponse>;
