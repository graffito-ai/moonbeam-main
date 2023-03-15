import { AccountLinkResponse, CreateAccountLinkInput } from "@moonbeam/moonbeam-models";
/**
 * CreateAccountLink resolver
 *
 * @param createAccountLinkInput object to be used for linking a user with Plaid
 * @returns {@link Promise} of {@link AccountLinkResponse}
 */
export declare const createAccountLink: (createAccountLinkInput: CreateAccountLinkInput) => Promise<AccountLinkResponse>;
