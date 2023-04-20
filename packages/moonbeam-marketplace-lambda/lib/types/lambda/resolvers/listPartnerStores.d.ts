import { ListPartnerStoresInput, PartnerStoreResponse } from "@moonbeam/moonbeam-models";
/**
 * ListPartnerStores resolver
 *
 * @param listPartnerStoresInput input to be passed in, which will help filter through all the Partner Stores
 * @returns {@link Promise} of {@link PartnerStoreResponse}
 */
export declare const listPartnerStores: (listPartnerStoresInput: ListPartnerStoresInput) => Promise<PartnerStoreResponse>;
