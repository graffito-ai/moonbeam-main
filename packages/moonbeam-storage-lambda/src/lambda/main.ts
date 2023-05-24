import {GetStorageInput, PutStorageInput, StorageErrorType, StorageResponse} from "@moonbeam/moonbeam-models";
import {getStorage} from "./resolvers/GetStorageResolver";
import {putStorage} from "./resolvers/PutStorageResolver";

/**
 * Mapping out the App Sync event type, so we can use it as a type in the Lambda Handler
 */
type AppSyncEvent = {
    info: {
        fieldName: string
    },
    arguments: {
        getStorageInput: GetStorageInput,
        putStorageInput: PutStorageInput
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
 * @param event AppSync event to be passed in the handler
 */
exports.handler = async (event: AppSyncEvent): Promise<StorageResponse> => {
    console.log(`Received new storage event for operation [${event.info.fieldName}], with arguments ${JSON.stringify(event.arguments)}`);
    switch (event.info.fieldName) {
        case "getStorage":
            return await getStorage(event.arguments.getStorageInput, event.identity.sub);
        case "putStorage":
            return await putStorage(event.arguments.putStorageInput, event.identity.sub);
        default:
            const errorMessage = `Unexpected field name: ${event.info.fieldName}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: StorageErrorType.UnexpectedError
            };
    }
}

