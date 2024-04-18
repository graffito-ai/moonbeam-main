import {
    CreateNotificationResponse,
    DailyEarningsSummaryResponse,
    DailySummaryErrorType,
    EmailFromCognitoResponse,
    MoonbeamClient,
    NotificationChannelType,
    NotificationStatus,
    NotificationType,
    UserDeviceErrorType,
    UserDevicesResponse,
    UserDeviceState
} from "@moonbeam/moonbeam-models";

/**
 * Function used to handle the earnings daily summary trigger, by determining
 * which users spent in a particular day, creating a summary for them, and then sending
 * them a PUSH and EMAIL notification.
 *
 * @returns a {@link Promise} of {@link void}, since the EventBridger
 * event trigger, will execute a cron job and not return anything.
 */
export const triggerEarningsDailySummariesCreation = async (): Promise<void> => {
    /**
     * The overall daily earnings summary cron triggering, will be made up of the following steps:
     *
     * 1) We want to get the previous day's date, and set that as our target date in the next step.
     * 2) Call the createDailyEarningsSummary AppSync Mutation API in order to determine which users
     * spent in the previous day, and create a summary for them.
     *
     * For each one of the summary reports created that day:
     * 3) Call the getDevicesForUser Moonbeam Appsync API endpoint.
     * 4) Filter obtained devices based on their status (only consider the ones that are ACTIVE for the user).
     * 5) Retrieve the email of a user based on their userId.
     * 6) Call the createNotification Moonbeam AppSync API endpoint to create an email notification for the daily earnings summary update.
     * 7) Call the createNotification Moonbeam AppSync API endpoint to create a push notification for the daily earnings summary update.
     */
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // 1) We want to get the previous day's date, and set that as our target date in the next step.
        const todayDate = new Date();
        const targetDate = new Date();

        // set the targetDate as yesterday's date at 00:00:00.000Z
        targetDate.setDate(todayDate.getDate() - 1);
        targetDate.setHours(0);
        targetDate.setMinutes(0);
        targetDate.setSeconds(0);
        targetDate.setMilliseconds(0);

        // initialize the Moonbeam Client API here, in order to call the appropriate endpoints for this handler
        const moonbeamClient = new MoonbeamClient(process.env.ENV_NAME!, region);

        /**
         * 2) Call the createDailyEarningsSummary AppSync Mutation API in order to determine which users
         * spent in the previous day, and create a summary for them.
         */
        const dailyEarningsSummaryResponse: DailyEarningsSummaryResponse = await moonbeamClient.createDailyEarningsSummary({
            targetDate: new Date(targetDate.setUTCHours(0,0,0,0)).toISOString()
        });

        // make sure that creating the daily earnings summaries call was successful or not
        if (dailyEarningsSummaryResponse && !dailyEarningsSummaryResponse.errorMessage && !dailyEarningsSummaryResponse.errorType &&
            dailyEarningsSummaryResponse.data && dailyEarningsSummaryResponse.data.length !== 0) {
            // For each one of the summary reports created that day proceed to steps 3,4,5,6 and 7
            for (const dailyEarningsSummary of dailyEarningsSummaryResponse.data) {
                if (dailyEarningsSummary !== null) {
                    // 3) Call the getDevicesForUser Moonbeam Appsync API endpoint.
                    const devicesForUserResponse: UserDevicesResponse = await moonbeamClient.getDevicesForUser({
                        id: dailyEarningsSummary.id
                    });

                    /**
                     * check to see if the get devices for user call was successful or not.
                     *
                     * we also consider the failure message, for users with no physical devices. In that case we only send an
                     * email.
                     */
                    if ((devicesForUserResponse && !devicesForUserResponse.errorMessage && !devicesForUserResponse.errorType &&
                            devicesForUserResponse.data && devicesForUserResponse.data.length !== 0) ||
                        (devicesForUserResponse && devicesForUserResponse.errorType !== null && devicesForUserResponse.errorType !== undefined &&
                            devicesForUserResponse.errorType === UserDeviceErrorType.NoneOrAbsent)) {

                        const deviceTokenIds: string[] = [];
                        if (devicesForUserResponse && devicesForUserResponse.errorType !== null && devicesForUserResponse.errorType !== undefined &&
                            devicesForUserResponse.errorType === UserDeviceErrorType.NoneOrAbsent) {
                            console.log(`No physical devices found for user ${dailyEarningsSummary.id}`);
                        } else {
                            if (devicesForUserResponse.data !== null && devicesForUserResponse.data !== undefined) {
                                // 4) Filter obtained devices based on their status (only consider the ones that are ACTIVE for the user).
                                for (const userDevice of devicesForUserResponse.data) {
                                    userDevice!.deviceState === UserDeviceState.Active && deviceTokenIds.push(userDevice!.tokenId);
                                }
                            }
                        }

                        // 5) Retrieve the email of a user based on their userId.
                        const emailFromUserInformationResponse: EmailFromCognitoResponse = await moonbeamClient.getEmailByUserId(dailyEarningsSummary.id);

                        // check to see if the get email for user call was successful or not
                        if (emailFromUserInformationResponse && !emailFromUserInformationResponse.errorMessage && !emailFromUserInformationResponse.errorType &&
                            emailFromUserInformationResponse.data && emailFromUserInformationResponse.data.length !== 0) {
                            // compute the dailyEarningsSummaryAmount from the summary transactions
                            let dailyEarningsSummaryAmount = 0;
                            dailyEarningsSummary.transactions.forEach(transaction => {
                                if (transaction !== null) {
                                    dailyEarningsSummaryAmount += transaction.rewardAmount;
                                }
                            });
                            dailyEarningsSummaryAmount = Number(dailyEarningsSummaryAmount.toFixed(2));

                            // 6) Call the createNotification Moonbeam AppSync API endpoint to create an email notification for the daily earnings summary update
                            const createEmailNotificationResponse: CreateNotificationResponse = await moonbeamClient.createNotification({
                                id: dailyEarningsSummary.id,
                                type: NotificationType.DailyEarningsSummary,
                                channelType: NotificationChannelType.Email,
                                userFullName: `Placeholder`, // we back-fill this as a placeholder, as it won't be needed for this type of email notification
                                emailDestination: emailFromUserInformationResponse.data!,
                                dailyEarningsSummaryAmount: dailyEarningsSummaryAmount,
                                transactions: dailyEarningsSummary.transactions,
                                status: NotificationStatus.Sent
                            });

                            // check to see if the email notification call was successful or not
                            if (createEmailNotificationResponse && !createEmailNotificationResponse.errorMessage && !createEmailNotificationResponse.errorType && createEmailNotificationResponse.data) {
                                console.log(`Notification email event successfully processed, with notification id ${createEmailNotificationResponse.data.notificationId}`);

                                // if there are user associated physical devices that are active, to send notifications to, then proceed accordingly
                                if (deviceTokenIds.length !== 0) {
                                    // 7) Call the createNotification Moonbeam AppSync API endpoint to create a push notification for the daily earnings summary update
                                    const createPushNotificationResponse: CreateNotificationResponse = await moonbeamClient.createNotification({
                                        id: dailyEarningsSummary.id,
                                        type: NotificationType.DailyEarningsSummary,
                                        expoPushTokens: deviceTokenIds,
                                        channelType: NotificationChannelType.Push,
                                        dailyEarningsSummaryAmount: dailyEarningsSummaryAmount,
                                        status: NotificationStatus.Sent
                                    });

                                    // check to see if the email notification call was successful or not
                                    if (createPushNotificationResponse && !createPushNotificationResponse.errorMessage && !createPushNotificationResponse.errorType && createPushNotificationResponse.data) {
                                        console.log(`Notification push event successfully processed, with notification id ${createPushNotificationResponse.data.notificationId}`);
                                    } else {
                                        console.log(`Notification push event through Create Notification call failed`);
                                    }
                                }
                            } else {
                                console.log(`Notification email event through Create Notification call failed`);
                            }

                        } else {
                            console.log(`User email mapping through GET email for user call failed`);
                        }
                    } else {
                        console.log(`Physical Devices mapping through GET devices for user call failed`);
                    }
                }
            }
        } else {
            // check if there are no daily summaries needed to get generated first
            if (dailyEarningsSummaryResponse.errorType && dailyEarningsSummaryResponse.errorType === DailySummaryErrorType.NoneOrAbsent &&
                dailyEarningsSummaryResponse.data && dailyEarningsSummaryResponse.data.length === 0) {
                /**
                 * no need for further actions, since this error will be logged and nothing will execute further.
                 * in the future we might need some alerts and metrics emitting here
                 */
                const errorMessage = `Creating daily summaries through the createDailyEarningsSummary call failed`;
                console.log(errorMessage);
            } else {
                /**
                 * no need for further actions, since this error will be logged and nothing will execute further.
                 * in the future we might need some alerts and metrics emitting here
                 */
                const errorMessage = `Creating daily summaries through the createDailyEarningsSummary call failed`;
                console.log(errorMessage);
            }
        }
    } catch (error) {
        /**
         * no need for further actions, since this error will be logged and nothing will execute further.
         * in the future we might need some alerts and metrics emitting here
         */
        console.log(`Unexpected error while processing the daily earnings summary cron event ${error}`);
    }
}
