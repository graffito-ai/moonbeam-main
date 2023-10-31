import {
    CreateNotificationReminderInput,
    NotificationReminderErrorType,
    NotificationReminderResponse, UpdateNotificationReminderInput, UserForNotificationReminderResponse
} from "@moonbeam/moonbeam-models";
import {createNotificationReminder} from "./resolvers/CreateNotificationReminderResolver";
import { getAllUsersForNotificationReminders } from "./resolvers/GetAllUsersForNotificationRemindersResolver";
import {getNotificationReminders} from "./resolvers/GetNotificationReminderResolver";
import { updateNotificationReminder } from "./resolvers/UpdateNotificationReminderResolver";

/**
 * Mapping out the App Sync event type, so we can use it as a type in the Lambda Handler
 */
type AppSyncEvent = {
    info: {
        fieldName: string
    },
    arguments: {
        createNotificationReminderInput: CreateNotificationReminderInput
        updateNotificationReminderInput: UpdateNotificationReminderInput
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
 * @param event AppSync even to be passed in the handler
 * @returns a {@link Promise} containing a {@link NotificationReminderResponse} or {@link UserForNotificationReminderResponse}
 */
exports.handler = async (event: AppSyncEvent): Promise<NotificationReminderResponse | UserForNotificationReminderResponse> => {
    console.log(`Received new Notification Reminder event for operation [${event.info.fieldName}], with arguments ${JSON.stringify(event.arguments)}`);
    switch (event.info.fieldName) {
        case "getNotificationReminders":
            return await getNotificationReminders(event.info.fieldName);
        case 'getAllUsersForNotificationReminders':
            return await getAllUsersForNotificationReminders(event.info.fieldName);
        case "createNotificationReminder":
            return await createNotificationReminder(event.info.fieldName, event.arguments.createNotificationReminderInput);
        case "updateNotificationReminder":
            return await updateNotificationReminder(event.info.fieldName, event.arguments.updateNotificationReminderInput);
        default:
            const errorMessage = `Unexpected field name: ${event.info.fieldName}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: NotificationReminderErrorType.UnexpectedError
            };
    }
}

