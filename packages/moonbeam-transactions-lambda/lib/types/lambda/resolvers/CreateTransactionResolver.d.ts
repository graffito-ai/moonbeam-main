import { CreateTransactionInput, MoonbeamTransactionResponse } from "@moonbeam/moonbeam-models";
/**
 * CreateTransaction resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param createTransactionInput transaction input object, used to create a transaction based on an incoming
 * transaction event/message from SQS.
 * @returns {@link Promise} of {@link CardLinkResponse}
 */
export declare const createTransaction: (fieldName: string, createTransactionInput: CreateTransactionInput) => Promise<MoonbeamTransactionResponse>;
