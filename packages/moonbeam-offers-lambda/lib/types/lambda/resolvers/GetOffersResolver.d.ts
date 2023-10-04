import { GetOffersInput, OffersResponse } from "@moonbeam/moonbeam-models";
/**
 * GetOffers resolver - used mainly for returning nearby as well as online offers
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getOffersInput offers input used for the offers objects to be retrieved
 * @returns {@link Promise} of {@link OffersResponse}
 */
export declare const getOffers: (fieldName: string, getOffersInput: GetOffersInput) => Promise<OffersResponse>;
