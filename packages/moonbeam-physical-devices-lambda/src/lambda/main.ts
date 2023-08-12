import {
    CreateDeviceInput, GetDeviceByTokenInput, GetDevicesForUserInput, UpdateDeviceInput,
    GetDeviceInput,
    UserDeviceErrorType,
    UserDeviceResponse,
    UserDevicesResponse
} from "@moonbeam/moonbeam-models";
import { createDevice } from "./resolvers/CreateDeviceResolver";
import { getDevice } from "./resolvers/GetDeviceResolver";
import { getDevicesForUser } from "./resolvers/GetDevicesForUserResolver";
import {updateDevice} from "./resolvers/UpdateDeviceResolver";
import {getDeviceByToken} from "./resolvers/GetDeviceByTokenResolver";

/**
 * Mapping out the App Sync event type, so we can use it as a type in the Lambda Handler
 */
type AppSyncEvent = {
    info: {
        fieldName: string
    },
    arguments: {
        createDeviceInput: CreateDeviceInput,
        updateDeviceInput: UpdateDeviceInput,
        getDeviceInput: GetDeviceInput,
        getDeviceByTokenInput: GetDeviceByTokenInput,
        getDevicesForUserInput: GetDevicesForUserInput
    },
    identity: {
        sub: string;
        username: string;
    }
}


/**
 * Lambda Function handler, handling incoming events,
 * depending on the AppSync field name.
 *
 * @param event AppSync event to be passed in the handler
 * @returns a {@link Promise} containing a {@link UserDeviceResponse} or {@link UserDevicesResponse}
 */
exports.handler = async (event: AppSyncEvent): Promise<UserDeviceResponse | UserDevicesResponse> => {
    console.log(`Received new physical device event for operation [${event.info.fieldName}], with arguments ${JSON.stringify(event.arguments)}`);
    switch (event.info.fieldName) {
        case "getDevice":
            return await getDevice(event.info.fieldName, event.arguments.getDeviceInput);
        case "getDeviceByToken":
            return await getDeviceByToken(event.info.fieldName, event.arguments.getDeviceByTokenInput);
        case "getDevicesForUser":
            return await getDevicesForUser(event.info.fieldName, event.arguments.getDevicesForUserInput);
        case "createDevice":
            return await createDevice(event.info.fieldName, event.arguments.createDeviceInput);
        case "updateDevice":
            return await updateDevice(event.info.fieldName, event.arguments.updateDeviceInput);
        default:
            const errorMessage = `Unexpected field name: ${event.info.fieldName}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: UserDeviceErrorType.UnexpectedError
            };
    }
}
