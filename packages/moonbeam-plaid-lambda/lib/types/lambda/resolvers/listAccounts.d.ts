import { AccountResponse, ListAccountsInput } from "@moonbeam/moonbeam-models";
/**
 * ListAccounts resolver
 *
 * @param filter filters to be passed in, which will help filter through all the accounts in the links
 * @returns {@link Promise} of {@link AccountResponse}
 */
export declare const listAccounts: (filter: ListAccountsInput) => Promise<AccountResponse>;
