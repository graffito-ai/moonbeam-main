import { AccountResponse, DeleteAccountInput } from "@moonbeam/moonbeam-models";
/**
 * DeleteAccount resolver
 *
 * @param deleteAccountInput object to be used for deleting and un-linking one more moe accounts from a link object
 * @returns {@link Promise} of {@link AccountResponse}
 */
export declare const deleteAccount: (deleteAccountInput: DeleteAccountInput) => Promise<AccountResponse>;
