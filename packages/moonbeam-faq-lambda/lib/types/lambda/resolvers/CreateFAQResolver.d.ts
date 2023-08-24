import { CreateFaqInput, FaqResponse } from "@moonbeam/moonbeam-models";
/**
 * CreateFAQ resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param createFAQInput FAQS input object, used to create a new FAQ object.
 * @returns {@link Promise} of {@link FaqResponse}
 */
export declare const createFAQ: (fieldName: string, createFAQInput: CreateFaqInput) => Promise<FaqResponse>;
