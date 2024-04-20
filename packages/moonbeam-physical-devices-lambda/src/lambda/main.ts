import {
    CreateDeviceInput,
    GetDevicesForUserInput,
    UserDeviceErrorType,
    UserDeviceResponse,
    UserDevicesResponse
} from "@moonbeam/moonbeam-models";
import {createDevice} from "./resolvers/CreateDeviceResolver";
import {getDevicesForUser} from "./resolvers/GetDevicesForUserResolver";
import {getAllDevices} from "./resolvers/GetAllDevicesResolver";

/**
 * Mapping out the App Sync event type, so we can use it as a type in the Lambda Handler
 */
type AppSyncEvent = {
    info: {
        fieldName: string
    },
    arguments: {
        createDeviceInput: CreateDeviceInput,
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
        case "getAllDevices":
            return await getAllDevices(event.info.fieldName);
        case "getDevicesForUser":
            return await getDevicesForUser(event.info.fieldName, event.arguments.getDevicesForUserInput);
        case "createDevice":
            return await createDevice(event.info.fieldName, event.arguments.createDeviceInput);
        default:
            const errorMessage = `Unexpected field name: ${event.info.fieldName}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: UserDeviceErrorType.UnexpectedError
            };
    }
}
