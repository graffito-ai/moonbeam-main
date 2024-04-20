import {
    GetUserNotificationAssetsInput,
    MoonbeamClient,
    NotificationsErrorType,
    PushDevice,
    RetrieveUserDetailsForNotifications,
    UserDevicesResponse,
    UserForNotificationReminderResponse,
    UserNotificationAssetsResponse,
    UserNotificationsAssets,
} from "@moonbeam/moonbeam-models";

/**
 * GetUserNotificationAssets resolver
 *
 * @param getUserNotificationAssetsInput the input needed to retrieve the notification assets
 * @param fieldName name of the resolver path from the AppSync event
 * @returns {@link Promise} of {@link UserNotificationAssetsResponse}
 */
export const getUserNotificationAssets = async (fieldName: string, getUserNotificationAssetsInput: GetUserNotificationAssetsInput): Promise<UserNotificationAssetsResponse> => {
    /**
     * Retrieving a user's notification assets, comprises the following steps:
     *
     * 0) Get All users for notification reminders by calling getAllUsersForNotificationReminders Moonbeam Appsync API Endpoint.
     * 1) Get All user devices by calling the getAllDevices Moonbeam Appsync API endpoint.
     * 2) Retrieve the email of a user based on their userId from the list of getAllUsersForNotificationReminders call.
     * 3) Retrieve the push token of a suer based on their tokenId from the list of getAllDevices call.
     */
    try {
        const results: UserNotificationsAssets[] = [];

        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initialize the Moonbeam Client API here, in order to call the appropriate endpoints for this handler
        const moonbeamClient = new MoonbeamClient(process.env.ENV_NAME!, region);

        // 0) Get All users for notification reminders by calling getAllUsersForNotificationReminders Moonbeam Appsync API Endpoint.
        const userForNotificationReminderResponse: UserForNotificationReminderResponse = await moonbeamClient.getAllUsersForNotificationReminders();

        // check to see if the get email for user call was successful or not
        if (userForNotificationReminderResponse && !userForNotificationReminderResponse.errorMessage && !userForNotificationReminderResponse.errorType &&
            userForNotificationReminderResponse.data && userForNotificationReminderResponse.data.length !== 0) {
            // list of all users to be used for notifications
            // @ts-ignore
            const userDetailsForNotifications: RetrieveUserDetailsForNotifications[] = userForNotificationReminderResponse.data!;

            // 1) Get All user devices by calling the getAllDevices Moonbeam Appsync API endpoint.
            const getAllDevicesResponse: UserDevicesResponse = await moonbeamClient.getAllDevices();

            // check to see if the get all devices call was successful or not
            if (getAllDevicesResponse && !getAllDevicesResponse.errorMessage && !getAllDevicesResponse.errorType &&
                getAllDevicesResponse.data && getAllDevicesResponse.data.length !== 0) {

                // list of all devices to be used for retrieving tokens
                // @ts-ignore
                const physicalDevicesForNotifications: PushDevice[] = getAllDevicesResponse.data!;

                // loop through all the incoming users received in the input
                for (const userId of getUserNotificationAssetsInput.idList) {
                    if (userId !== null && userId.length !== 0) {
                        // 2) Retrieve the email of a user based on their userId from the list of getAllUsersForNotificationReminders call.
                        const matchedUserDetail = userDetailsForNotifications.filter(userDetails => userDetails.id === userId);
                        const email = matchedUserDetail.length !== 1 ? 'placeholderemail@moonbeam.vet' : matchedUserDetail[0].email;

                        // 3) Retrieve the push token of a suer based on their tokenId from the list of getAllDevices call.
                        const matchedDeviceDetail = physicalDevicesForNotifications.filter(deviceDetails => deviceDetails.id === userId);
                        const pushToken = matchedDeviceDetail.length !== 1 ? 'Expo[PlaceHolderTokenMoonbeam]' : matchedDeviceDetail[0].tokenId;

                        // at this point we know that both calls were successful, so we will just set the user's notification assets/details accordingly
                        results.push({
                            id: userId,
                            email: email,
                            pushToken: pushToken
                        });
                    }
                }
                // return the generated user notification assets for all inputted users
                return {
                    data: results
                }
            } else {
                const errorMessage = `User devices mapping through GET all devices call failed`;
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: NotificationsErrorType.UnexpectedError
                };
            }
        } else {
            const errorMessage = `User email mapping through GET all users for notification reminders call failed`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: NotificationsErrorType.UnexpectedError
            };
        }
    } catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} query ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: NotificationsErrorType.UnexpectedError
        };
    }
}
