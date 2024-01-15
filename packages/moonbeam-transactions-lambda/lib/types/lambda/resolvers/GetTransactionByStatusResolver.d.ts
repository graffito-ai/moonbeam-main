import { GetTransactionByStatusInput, MoonbeamTransactionsByStatusResponse } from "@moonbeam/moonbeam-models";
/**
 * GetTransactionByStatusResolver resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getTransactionByStatusInput get transaction by status input object, used to retrieve transactional information,
 *                                    based on status.
 *
 * @returns {@link Promise} of {@link MoonbeamTransactionsByStatusResponse}
 */
export declare const getTransactionByStatus: (fieldName: string, getTransactionByStatusInput: GetTransactionByStatusInput) => Promise<MoonbeamTransactionsByStatusResponse>;
