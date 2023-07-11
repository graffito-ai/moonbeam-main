import { GetTransactionInput, MoonbeamTransactionsResponse } from "@moonbeam/moonbeam-models";
/**
 * GetTransactionResolver resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getTransactionInput get transaction input object, used to retrieve transactional information,
 * based on particular filters.
 * @returns {@link Promise} of {@link MoonbeamTransactionResponse}
 */
export declare const getTransaction: (fieldName: string, getTransactionInput: GetTransactionInput) => Promise<MoonbeamTransactionsResponse>;
