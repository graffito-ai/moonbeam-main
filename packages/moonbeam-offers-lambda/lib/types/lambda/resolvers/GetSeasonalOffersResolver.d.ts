import { GetOffersInput, OffersResponse } from "@moonbeam/moonbeam-models";
/**
 * GetSeasonalOffers resolver - used mainly for returning seasonal nearby,
 * as well as seasonal online offers.
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getOffersInput offers input used for the offers objects to be retrieved
 * @returns {@link Promise} of {@link OffersResponse}
 */
export declare const getSeasonalOffers: (fieldName: string, getOffersInput: GetOffersInput) => Promise<OffersResponse>;
