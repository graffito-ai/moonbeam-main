import * as AWS from 'aws-sdk';
import {
    CreatePartnerStoreInput,
    MarketplaceErrorType,
    PartnerMerchantType,
    PartnerStore,
    PartnerStoreResponse
} from "@moonbeam/moonbeam-models";

/**
 * CreatePartnerStore resolver
 *
 * @param createPartnerStoreInput object to be used when creating a new Partner Store object
 * @returns {@link Promise} of {@link PartnerStoreResponse}
 */
export const createPartnerStore = async (createPartnerStoreInput: CreatePartnerStoreInput): Promise<PartnerStoreResponse> => {
    try {
        // initializing the DynamoDB document client
        const docClient = new AWS.DynamoDB.DocumentClient();

        // update the timestamps accordingly
        const createdAt = new Date().toISOString();
        createPartnerStoreInput.createdAt = createdAt;
        createPartnerStoreInput.updatedAt = createdAt

        // validating that the appropriate input object parameters are passed in according to the type of FAQ to be created
        switch (createPartnerStoreInput.type) {
            case PartnerMerchantType.NonFeatured:
                // do any future validations in here for non-featured products
                break;
            case PartnerMerchantType.Featured:
                // validate that there is a description for featured partner stores
                if (!createPartnerStoreInput.description || createPartnerStoreInput.description.length === 0) {
                    const invalidFeaturedPartnerStoreInputMessage = `Invalid ${PartnerMerchantType.Featured} input passed in!`;
                    return {
                        errorMessage: invalidFeaturedPartnerStoreInputMessage,
                        errorType: MarketplaceErrorType.ValidationError
                    }
                }
                break;
            default:
                const invalidPartnerStoreTypeMessage = `Invalid Partner Store type passed in ${createPartnerStoreInput.type}`;
                console.log(invalidPartnerStoreTypeMessage);
                return {
                    errorMessage: invalidPartnerStoreTypeMessage,
                    errorType: MarketplaceErrorType.ValidationError
                }
        }

        // store the FAQ object
        await docClient.put({
            TableName: process.env.PARTNER_MERCHANT_TABLE!,
            Item: createPartnerStoreInput
        }).promise();

        // return the FAQS object
        return {
            data: [createPartnerStoreInput as PartnerStore]
        }
    } catch (err) {
        console.log(`Unexpected error while executing createPartnerStore mutation {}`, err);
        return {
            errorMessage: `Unexpected error while executing createPartnerStore mutation ${err}`,
            errorType: MarketplaceErrorType.UnexpectedError
        };
    }
}
