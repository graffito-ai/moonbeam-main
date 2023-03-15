import { AccountLinkResponse } from "@moonbeam/moonbeam-models";
/**
 * GetAccountLink resolver
 *
 * @param id account link id (user id), for the account link to be retrieved
 * @returns {@link Promise} of {@link AccountLinkResponse}
 */
export declare const getAccountLink: (id: string) => Promise<AccountLinkResponse>;
