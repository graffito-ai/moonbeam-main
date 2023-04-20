import {
    CreatePartnerStoreInput,
    ListPartnerStoresInput,
    MarketplaceErrorType,
    PartnerStoreResponse
} from "@moonbeam/moonbeam-models";
import {createPartnerStore} from "./resolvers/createPartnerStore";
import { getPartnerStore } from "./resolvers/getPartnerStore";
import { listPartnerStores } from "./resolvers/listPartnerStores";

/**
 * Mapping out the App Sync event type, so we can use it as a type in the Lambda Handler
 */
type AppSyncEvent = {
    info: {
        fieldName: string
    },
    arguments: {
        id: string
        createPartnerStoreInput: CreatePartnerStoreInput
        listPartnerStoresInput: ListPartnerStoresInput
    },
    identity: {
        sub : string;
        username : string;
    }
}

/**
 * Lambda Function handler, handling incoming events,
 * depending on the AppSync field name.
 *
 * @param event AppSync even to be passed in the handler
 */
exports.handler = async (event: AppSyncEvent): Promise<PartnerStoreResponse> => {
    console.log(`Received new storage event for operation [${event.info.fieldName}], with arguments ${JSON.stringify(event.arguments)}`);
    switch (event.info.fieldName) {
        case "createPartnerStore":
            return await createPartnerStore(event.arguments.createPartnerStoreInput);
        case "listPartnerStores":
            return await listPartnerStores(event.arguments.listPartnerStoresInput);
        case "getPartnerStore":
            return await getPartnerStore(event.arguments.id);
        default:
            console.log(`Unexpected field name: {}`, event.info.fieldName);
            return {
                errorMessage: `Unexpected field name: ${event.info.fieldName}`,
                errorType: MarketplaceErrorType.UnexpectedError
            };
    }
}

