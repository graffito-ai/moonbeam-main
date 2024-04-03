import {
    CreateLocationBasedOfferReminderInput,
    LocationBasedOfferReminderResponse,
    NotificationsErrorType,
    NotificationStatus
} from "@moonbeam/moonbeam-models";

/**
 * AcknowledgeLocationUpdate resolver
 *
 * @param createLocationBasedOfferReminderInput the input needed to acknowledge a new location update
 * and/or acknowledge a location change.
 * @param fieldName name of the resolver path from the AppSync event
 * @returns {@link Promise} of {@link LocationBasedOfferReminderResponse}
 */
export const acknowledgeLocationUpdate = async (fieldName: string, createLocationBasedOfferReminderInput: CreateLocationBasedOfferReminderInput): Promise<LocationBasedOfferReminderResponse> => {
    try {
        console.log(JSON.stringify(createLocationBasedOfferReminderInput));

        return {
            data: NotificationStatus.Acknowledged
        }
    } catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} mutation ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: NotificationsErrorType.UnexpectedError
        }
    }
}
