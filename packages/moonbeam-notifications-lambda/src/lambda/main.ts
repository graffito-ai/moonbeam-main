import {
    CreateNotificationInput,
    CreateNotificationResponse,
    GetNotificationByTypeInput, GetNotificationByTypeResponse,
    NotificationsErrorType
} from "@moonbeam/moonbeam-models";
import {createNotification} from "./resolvers/CreateNotificationResolver";
import { getNotificationByType } from "./resolvers/GetNotificationByTypeResolver";

/**
 * Mapping out the App Sync event type, so we can use it as a type in the Lambda Handler
 */
type AppSyncEvent = {
    info: {
        fieldName: string
    },
    arguments: {
        createNotificationInput: CreateNotificationInput,
        getNotificationByTypeInput: GetNotificationByTypeInput
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
 * @returns a {@link Promise} containing a {@link CreateNotificationResponse} or {@link GetNotificationByTypeResponse}
 */
exports.handler = async (event: AppSyncEvent): Promise<CreateNotificationResponse | GetNotificationByTypeResponse> => {
    console.log(`Received new notification event for operation [${event.info.fieldName}], with arguments ${JSON.stringify(event.arguments)}`);
    switch (event.info.fieldName) {
        case "createNotification":
            return await createNotification(event.info.fieldName, event.arguments.createNotificationInput);
        case "getNotificationByType":
            return await getNotificationByType(event.info.fieldName, event.arguments.getNotificationByTypeInput);
        default:
            const errorMessage = `Unexpected field name: ${event.info.fieldName}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: NotificationsErrorType.UnexpectedError
            };
    }
}

