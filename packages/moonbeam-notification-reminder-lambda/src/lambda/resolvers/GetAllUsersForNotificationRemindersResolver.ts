import {NotificationReminderErrorType, MoonbeamClient, UserForNotificationReminderResponse} from "@moonbeam/moonbeam-models";

/**
 * GetAllUsersForNotificationReminders resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @returns {@link Promise} of {@link UserForNotificationReminderResponse}
 */
export const getAllUsersForNotificationReminders = async (fieldName: string): Promise<UserForNotificationReminderResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        /**
         * retrieve the list of all existent users from our Cognito user pool
         *
         * first, initialize the Moonbeam Client API here, in order to call the appropriate endpoints for this handler
         */
        const moonbeamClient = new MoonbeamClient(process.env.ENV_NAME!, region);
        const usersForNotificationReminderResponse: UserForNotificationReminderResponse = await moonbeamClient.getAllUsersForNotificationReminders();

        // check to see if the get all users call was successful or not
        if (usersForNotificationReminderResponse && !usersForNotificationReminderResponse.errorMessage && !usersForNotificationReminderResponse.errorType &&
            usersForNotificationReminderResponse.data && usersForNotificationReminderResponse.data.length !== 0) {
            // return all the users accordingly
            return {
                data: usersForNotificationReminderResponse.data
            };
        } else {
            const errorMessage = `Retrieving all users through the getAllUsersForNotificationReminders call failed`;
            console.log(errorMessage);

            return {
                errorMessage: errorMessage,
                errorType: NotificationReminderErrorType.UnexpectedError
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
