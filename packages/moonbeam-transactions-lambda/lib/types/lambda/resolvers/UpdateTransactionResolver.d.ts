import { MoonbeamUpdatedTransactionResponse, UpdateTransactionInput } from "@moonbeam/moonbeam-models";
/**
 * UpdateTransaction resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param updateTransactionInput update transaction input, used to update an existent transaction
 * @returns {@link Promise} of {@link MoonbeamUpdatedTransactionResponse}
 */
export declare const updateTransaction: (fieldName: string, updateTransactionInput: UpdateTransactionInput) => Promise<MoonbeamUpdatedTransactionResponse>;
