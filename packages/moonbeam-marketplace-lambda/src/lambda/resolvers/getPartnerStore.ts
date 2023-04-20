import * as AWS from 'aws-sdk';
import {MarketplaceErrorType, PartnerStore, PartnerStoreResponse} from "@moonbeam/moonbeam-models";

/**
 * GetPartnerStore resolver
 *
 * @param id id, for the Partner Store to be retrieved
 * @returns {@link Promise} of {@link PartnerStoreResponse}
 */
export const getPartnerStore = async (id: string): Promise<PartnerStoreResponse> => {
    try {
        // initializing the DynamoDB document client
        const docClient = new AWS.DynamoDB.DocumentClient();

        // retrieve the Partner Store object given id
        const {Item} = await docClient.get({
            TableName: process.env.PARTNER_MERCHANT_TABLE!,
            Key: {id: id}
        }).promise();

        // return the retrieved Partner Store
        return {
            data: [Item as PartnerStore]
        }
    } catch (err) {
        console.log(`Unexpected error while executing getPartnerStore query {}`, err);
        return {
            errorMessage: `Unexpected error while executing getPartnerStore query ${err}`,
            errorType: MarketplaceErrorType.UnexpectedError
        };
    }
}
