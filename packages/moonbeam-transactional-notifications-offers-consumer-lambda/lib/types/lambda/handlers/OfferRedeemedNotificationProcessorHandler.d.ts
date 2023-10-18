import { SQSBatchResponse, SQSEvent } from "aws-lambda";
/**
 * OfferRedeemedNotificationProcessorHandler handler
 *
 * @param event the {@link SQSEvent} to be processed, containing the transaction
 * message information
 * @returns {@link Promise} of {@link SQSBatchResponse}
 */
export declare const processOfferRedeemedTransactionNotifications: (event: SQSEvent) => Promise<SQSBatchResponse>;
