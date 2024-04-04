import {
    CreateLocationBasedOfferReminderInput,
    LocationBasedOfferReminderResponse,
    NotificationsErrorType
} from "@moonbeam/moonbeam-models";
import {acknowledgeLocationUpdate} from "./resolvers/AcknowledgeLocationUpdateResolver";

/**
 * Mapping out the App Sync event type, so we can use it as a type in the Lambda Handler
 */
type AppSyncEvent = {
    info: {
        fieldName: string
    },
    arguments: {
        createLocationBasedOfferReminderInput: CreateLocationBasedOfferReminderInput
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
 * @returns a {@link Promise} containing a {@link LocationBasedOfferReminderResponse}
 */
exports.handler = async (event: AppSyncEvent): Promise<LocationBasedOfferReminderResponse> => {
    console.log(`Received new location update event for operation [${event.info.fieldName}], with arguments ${JSON.stringify(event.arguments)}`);
    switch (event.info.fieldName) {
        case "acknowledgeLocationUpdate":
            return await acknowledgeLocationUpdate(event.info.fieldName, event.arguments.createLocationBasedOfferReminderInput);
        default:
            const errorMessage = `Unexpected field name: ${event.info.fieldName}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: NotificationsErrorType.UnexpectedError
            };
    }
}

