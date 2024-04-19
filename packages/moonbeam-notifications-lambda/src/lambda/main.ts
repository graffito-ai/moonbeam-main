import {
    CreateBulkNotificationInput, CreateBulkNotificationResponse,
    CreateNotificationInput,
    CreateNotificationResponse,
    GetNotificationByTypeInput,
    GetNotificationByTypeResponse,
    GetUserNotificationAssetsInput,
    NotificationsErrorType, UserNotificationAssetsResponse
} from "@moonbeam/moonbeam-models";
import {createNotification} from "./resolvers/CreateNotificationResolver";
import { getNotificationByType } from "./resolvers/GetNotificationByTypeResolver";
import { getUserNotificationAssets } from "./resolvers/GetUserNotificationAssetsResolver";
import {createBulkNotification} from "./resolvers/CreateBulkNotificationResolver";

/**
 * Mapping out the App Sync event type, so we can use it as a type in the Lambda Handler
 */
type AppSyncEvent = {
    info: {
        fieldName: string
    },
    arguments: {
        createBulkNotificationInput: CreateBulkNotificationInput,
        createNotificationInput: CreateNotificationInput,
        getNotificationByTypeInput: GetNotificationByTypeInput,
        getUserNotificationAssetsInput: GetUserNotificationAssetsInput
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
 * @returns a {@link Promise} containing a {@link CreateBulkNotificationResponse}, {@link CreateNotificationResponse},
 * {@link UserNotificationAssetsResponse} or {@link GetNotificationByTypeResponse}
 */
exports.handler = async (event: AppSyncEvent): Promise<CreateBulkNotificationResponse | CreateNotificationResponse | GetNotificationByTypeResponse | UserNotificationAssetsResponse> => {
    console.log(`Received new notification event for operation [${event.info.fieldName}], with arguments ${JSON.stringify(event.arguments)}`);
    switch (event.info.fieldName) {
        case "createBulkNotification":
            return await createBulkNotification(event.info.fieldName, event.arguments.createBulkNotificationInput);
        case "createNotification":
            return await createNotification(event.info.fieldName, event.arguments.createNotificationInput);
        case "getNotificationByType":
            return await getNotificationByType(event.info.fieldName, event.arguments.getNotificationByTypeInput);
        case "getUserNotificationAssets":
            return await getUserNotificationAssets(event.info.fieldName, event.arguments.getUserNotificationAssetsInput);
        default:
            const errorMessage = `Unexpected field name: ${event.info.fieldName}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: NotificationsErrorType.UnexpectedError
            };
    }
}

