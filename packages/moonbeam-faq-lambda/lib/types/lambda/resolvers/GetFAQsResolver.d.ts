import { FaqResponse } from "@moonbeam/moonbeam-models";
/**
 * GetFAQs resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @returns {@link Promise} of {@link FaqResponse}
 */
export declare const getFAQs: (fieldName: string) => Promise<FaqResponse>;
