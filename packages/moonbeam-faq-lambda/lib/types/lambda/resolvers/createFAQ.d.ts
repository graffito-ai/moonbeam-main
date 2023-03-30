import { CreateFaqInput, FaqResponse } from "@moonbeam/moonbeam-models";
/**
 * CreateFAQ resolver
 *
 * @param createFaqInput object to be used when creating a new FAQ object
 * @returns {@link Promise} of {@link FaqResponse}
 */
export declare const createFAQ: (createFaqInput: CreateFaqInput) => Promise<FaqResponse>;
