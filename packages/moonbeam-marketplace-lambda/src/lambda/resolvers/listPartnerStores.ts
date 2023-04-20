import * as AWS from 'aws-sdk';
import {
    ListPartnerStoresInput,
    MarketplaceErrorType,
    PartnerStore,
    PartnerStoreResponse
} from "@moonbeam/moonbeam-models";

/**
 * ListPartnerStores resolver
 *
 * @param listPartnerStoresInput input to be passed in, which will help filter through all the Partner Stores
 * @returns {@link Promise} of {@link PartnerStoreResponse}
 */
export const listPartnerStores = async (listPartnerStoresInput: ListPartnerStoresInput): Promise<PartnerStoreResponse> => {
    try {
        // initializing the DynamoDB document client
        const docClient = new AWS.DynamoDB.DocumentClient();

        // retrieving all Partner Stores in the database
        const result = await docClient.scan({
            TableName: process.env.PARTNER_MERCHANT_TABLE!,
        }).promise();

        // build Partner Stores data response
        const partnerStores: PartnerStore[] = [];
        result.Items!.forEach((item) => {
            partnerStores.push(item as PartnerStore)
        });

        // check to see if there is a type passed in, to filter by, and filter the retrieved Partner Stores by it
        if (listPartnerStoresInput.type) {
            const filteredPartnerStores: PartnerStore[] = [];
            partnerStores.filter((partnerStore) => partnerStore.type === listPartnerStoresInput.type).map((partnerStore) => filteredPartnerStores.push(partnerStore));

            // returns the filtered Partner Stores as data
            return {
                data: filteredPartnerStores
            }
        } else {
            // returns all Partner Stores as data
            return {
                data: partnerStores
            }
        }
    } catch (err) {
        console.log(`Unexpected error while executing listPartnerStores query {}`, err);

        return {
            errorMessage: `Unexpected error while executing listPartnerStores query. ${err}`,
            errorType: MarketplaceErrorType.UnexpectedError
        };
    }
}
