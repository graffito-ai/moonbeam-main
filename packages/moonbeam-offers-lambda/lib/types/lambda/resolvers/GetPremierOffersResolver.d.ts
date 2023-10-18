import { GetOffersInput, OffersResponse } from "@moonbeam/moonbeam-models";
/**
 * GetPremierOffers resolver - used mainly for returning premier nearby,
 * as well as premier online offers
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getOffersInput offers input used for the offers objects to be retrieved
 * @returns {@link Promise} of {@link OffersResponse}
 */
export declare const getPremierOffers: (fieldName: string, getOffersInput: GetOffersInput) => Promise<OffersResponse>;
