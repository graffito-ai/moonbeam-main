import {
    GetUsersByGeographicalLocationInput,
    MoonbeamClient,
    NotificationReminderErrorType,
    UserForNotificationReminderResponse
} from "@moonbeam/moonbeam-models";

/**
 * GetUsersByGeographyForNotificationReminders resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getUsersByGeographicalLocationInput the geolocation input to filter users by
 *
 * @returns {@link Promise} of {@link UserForNotificationReminderResponse}
 */
export const getUsersByGeographyForNotificationReminders = async (fieldName: string, getUsersByGeographicalLocationInput: GetUsersByGeographicalLocationInput): Promise<UserForNotificationReminderResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        /**
         * retrieve the list of all existent users from our Cognito user pool, sorted
         * by their specific geographical location (city and state).
         *
         * first, initialize the Moonbeam Client API here, in order to call the appropriate endpoints for this handler
         */
        const moonbeamClient = new MoonbeamClient(process.env.ENV_NAME!, region);
        const usersForNotificationReminderResponse: UserForNotificationReminderResponse = await moonbeamClient.getUsersByGeographyForNotificationReminders(getUsersByGeographicalLocationInput);

        // check to see if the get all users call was successful or not
        if (usersForNotificationReminderResponse && !usersForNotificationReminderResponse.errorMessage && !usersForNotificationReminderResponse.errorType &&
            usersForNotificationReminderResponse.data && usersForNotificationReminderResponse.data.length !== 0) {
            // return all the users accordingly
            return {
                data: usersForNotificationReminderResponse.data
            };
        } else {
            // make sure that if we do not have any users filtered geographically that we do not return an error
            if (usersForNotificationReminderResponse.data && usersForNotificationReminderResponse.data.length === 0) {
                const message = `No available users for geolocation ${JSON.stringify(getUsersByGeographicalLocationInput.zipCodes)}!`;
                console.log(message);

                return {
                    data: [],
                    errorMessage: message,
                    errorType: NotificationReminderErrorType.NoneOrAbsent
                }
            } else {
                const errorMessage = `Retrieving all users through the getUsersByGeographyForNotificationReminders call failed`;
                console.log(errorMessage);

                return {
                    errorMessage: errorMessage,
                    errorType: NotificationReminderErrorType.UnexpectedError
                }
            }
        }
    } catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} query ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: NotificationReminderErrorType.UnexpectedError
        };
    }
}
