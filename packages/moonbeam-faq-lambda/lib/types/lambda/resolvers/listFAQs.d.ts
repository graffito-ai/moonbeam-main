import { FaqResponse, ListFaqInput } from "@moonbeam/moonbeam-models";
/**
 * ListFAQs resolver
 *
 * @param listFaqInput input to be passed in, which will help filter through all the FAQs
 * @returns {@link Promise} of {@link AccountResponse}
 */
export declare const listFAQs: (listFaqInput: ListFaqInput) => Promise<FaqResponse>;
