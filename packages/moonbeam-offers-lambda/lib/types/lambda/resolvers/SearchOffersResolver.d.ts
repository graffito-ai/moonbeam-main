import { OffersResponse, SearchOffersInput } from "@moonbeam/moonbeam-models";
/**
 * SearchOffers resolver - used for searching offers, based
 * on a specific input
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param searchOffersInput offers input used for the offers objects to be searched
 * and returned
 *
 * @returns {@link Promise} of {@link OffersResponse}
 */
export declare const searchOffers: (fieldName: string, searchOffersInput: SearchOffersInput) => Promise<OffersResponse>;
