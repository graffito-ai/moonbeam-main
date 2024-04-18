import {
    GetUserNotificationAssetsInput,
    MoonbeamClient,
    NotificationsErrorType,
    RetrieveUserDetailsForNotifications,
    UserDeviceErrorType,
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
     * 1) Call the getDevicesForUser Moonbeam Appsync API endpoint.
     * 2) Filter obtained devices based on their status (only consider the ones that are ACTIVE for the user).
     * 3) Retrieve the email of a user based on their userId from the list of getAllUsersForNotificationReminders call.
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
            // list of all users to be user for notifications
            // @ts-ignore
            const userDetailsForNotifications: RetrieveUserDetailsForNotifications[] = userForNotificationReminderResponse.data!;

            // loop through all the incoming users received in the input
            for (const userId of getUserNotificationAssetsInput.idList) {
                if (userId !== null && userId.length !== 0) {
                    // 1) Call the getDevicesForUser Moonbeam Appsync API endpoint.
                    const devicesForUserResponse: UserDevicesResponse = await moonbeamClient.getDevicesForUser({
                        id: userId
                    });

                    if ((devicesForUserResponse && !devicesForUserResponse.errorMessage && !devicesForUserResponse.errorType &&
                            devicesForUserResponse.data && devicesForUserResponse.data.length !== 0) ||
                        (devicesForUserResponse && devicesForUserResponse.errorType !== null && devicesForUserResponse.errorType !== undefined &&
                            devicesForUserResponse.errorType === UserDeviceErrorType.NoneOrAbsent)) {
                        const deviceTokenIds: string[] = [];
                        if (devicesForUserResponse && devicesForUserResponse.errorType !== null && devicesForUserResponse.errorType !== undefined &&
                            devicesForUserResponse.errorType === UserDeviceErrorType.NoneOrAbsent) {
                            console.log(`No physical devices found for user ${userId}`);
                        } else {
                            if (devicesForUserResponse.data !== null && devicesForUserResponse.data !== undefined) {
                                // we know that for now this returns exactly one device.
                                deviceTokenIds.push(devicesForUserResponse.data[0]!.tokenId);
                            }
                        }
                        // retrieve the email details
                        const matchedUserDetail = userDetailsForNotifications.filter(userDetails => userDetails.id === userId);
                        const email = matchedUserDetail.length !== 1 ? 'placeholderemail@moonbeam.vet' : matchedUserDetail[0].email;

                        // at this point we know that both calls were successful, so we will just set the user's details accordingly
                        results.push({
                            id: userId,
                            email: email,
                            pushToken: deviceTokenIds.length > 0 ? deviceTokenIds[0] : "Placeholder_Token"
                        });
                    } else {
                        console.log(`Physical Devices mapping through GET devices for user call failed`);
                    }
                }
            }
            // return the generated user notification assets for all inputted users
            return {
                data: results
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
