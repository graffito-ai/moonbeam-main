import {CreateNotificationInput, CreateNotificationResponse, NotificationsErrorType} from "@moonbeam/moonbeam-models";
import {createNotification} from "./resolvers/CreateNotificationResolver";

/**
 * Mapping out the App Sync event type, so we can use it as a type in the Lambda Handler
 */
type AppSyncEvent = {
    info: {
        fieldName: string
    },
    arguments: {
        createNotificationInput: CreateNotificationInput
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
 * @returns a {@link Promise} containing a {@link CreateNotificationResponse}
 */
exports.handler = async (event: AppSyncEvent): Promise<CreateNotificationResponse> => {
    console.log(`Received new notification event for operation [${event.info.fieldName}], with arguments ${JSON.stringify(event.arguments)}`);
    switch (event.info.fieldName) {
        case "createNotification":
            return await createNotification(event.info.fieldName, event.arguments.createNotificationInput);
        default:
            const errorMessage = `Unexpected field name: ${event.info.fieldName}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: NotificationsErrorType.UnexpectedError
            };
    }
}

