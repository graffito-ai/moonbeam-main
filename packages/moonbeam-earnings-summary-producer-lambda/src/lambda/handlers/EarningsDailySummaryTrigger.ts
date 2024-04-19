import {
    CreateBulkNotificationResponse,
    CreateNotificationInput,
    DailyEarningsSummaryResponse,
    DailySummaryErrorType,
    MoonbeamClient,
    MoonbeamTransaction,
    NotificationChannelType,
    NotificationStatus,
    NotificationType,
    UserNotificationAssetsResponse
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
     * 3) Create a map of users obtained from daily earnings summaries created and the
     * [dailyEarningsSummaryAmounts, transactions] from the daily earnings summaries created.
     * 4) Call the getUserNotificationAssets AppSync Query API, in order to get a list of the emails and push tokens
     * for the list of users from step 3).
     * 5) Create a list of emailNotifications and a list of pushNotifications to be used in sending bulk notifications.
     * 6) Call the createBulkNotification for emails.
     * 7) Call the createBulkNotification for push notifications.
     *
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
            targetDate: new Date(targetDate.setUTCHours(0, 0, 0, 0)).toISOString()
        });

        // make sure that creating the daily earnings summaries call was successful or not
        if (dailyEarningsSummaryResponse && !dailyEarningsSummaryResponse.errorMessage && !dailyEarningsSummaryResponse.errorType &&
            dailyEarningsSummaryResponse.data && dailyEarningsSummaryResponse.data.length !== 0) {
            /**
             * 3) Create a map of users obtained from daily earnings summaries created and the
             * [dailyEarningsSummaryAmounts, transactions] from the daily earnings summaries created.
             */
            const summariesMap: Map<string, [number, MoonbeamTransaction[]]> = new Map<string, [number, MoonbeamTransaction[]]>();
            // build out a list of ids for faster retrieval
            const userIds: string[] = [];
            for (const dailyEarningsSummary of dailyEarningsSummaryResponse.data) {
                if (dailyEarningsSummary !== null && (dailyEarningsSummary.id === "e1a6afb2-ff4c-40d0-9f4b-b83396b0a966" || dailyEarningsSummary.id === "21204d10-047b-475f-aae0-397016e5f70c")) {
                    // compute the dailyEarningsSummaryAmount from the summary transactions
                    let dailyEarningsSummaryAmount = 0;
                    dailyEarningsSummary.transactions.forEach(transaction => {
                        if (transaction !== null) {
                            dailyEarningsSummaryAmount += transaction.rewardAmount;
                        }
                    });
                    dailyEarningsSummaryAmount = Number(dailyEarningsSummaryAmount.toFixed(2));
                    // store this in the map accordingly
                    // @ts-ignore
                    summariesMap.set(dailyEarningsSummary.id, [dailyEarningsSummaryAmount, dailyEarningsSummary.transactions]);
                    // store the id in the list of userIds for faster retrieval
                    userIds.push(dailyEarningsSummary.id);
                }
            }

            /**
             * 4) Call the getUserNotificationAssets AppSync Query API, in order to get a list of the emails and push tokens
             * for the list of users from step 3).
             */
            const userNotificationAssetsResponse: UserNotificationAssetsResponse = await moonbeamClient.getUserNotificationAssets({
                idList: userIds
            });

            // make sure that the get user notification assets call was successful or not
            if (userNotificationAssetsResponse && !userNotificationAssetsResponse.errorMessage && !userNotificationAssetsResponse.errorType &&
                userNotificationAssetsResponse.data && userNotificationAssetsResponse.data.length !== 0) {
                // 5) Create a list of emailNotifications and a list of pushNotifications to be used in sending bulk notifications.
                const bulkEmailNotifications: CreateNotificationInput[] = [];
                const bulkMobilePushNotifications: CreateNotificationInput[] = [];
                summariesMap.forEach((value, userId) => {
                    // retrieve the corresponding user's notification details
                    const dailyEarningsSummaryAmount: number = value[0];
                    const transactions: MoonbeamTransaction[] = value[1];

                    // retrieve the corresponding user's notification assets
                    const userNotificationAssets = userNotificationAssetsResponse.data!.filter(notificationAssets => notificationAssets !== null && notificationAssets.id === userId);
                    if (userNotificationAssets.length === 1) {
                        // create the bulk email notification list
                        const newBulkEmailNotification: CreateNotificationInput = {
                            id: userId,
                            channelType: NotificationChannelType.Email,
                            status: NotificationStatus.Sent,
                            type: NotificationType.DailyEarningsSummary,
                            dailyEarningsSummaryAmount: dailyEarningsSummaryAmount,
                            emailDestination: userNotificationAssets[0]!.email,
                            transactions: transactions,
                            userFullName: 'Placeholder Name' // for now, we do not need names for this type of notification so we just put a placeholder here instead
                        }
                        bulkEmailNotifications.push(newBulkEmailNotification);

                        // create the bulk mobile push notification list
                        const newMobilePushNotification: CreateNotificationInput = {
                            id: userId,
                            channelType: NotificationChannelType.Push,
                            status: NotificationStatus.Sent,
                            type: NotificationType.DailyEarningsSummary,
                            dailyEarningsSummaryAmount: dailyEarningsSummaryAmount,
                            expoPushTokens: [userNotificationAssets[0]!.pushToken]
                        }
                        bulkMobilePushNotifications.push(newMobilePushNotification);
                    }
                });
                // 6) Call the createBulkNotification for emails.
                const createBulkEmailNotificationResponse: CreateBulkNotificationResponse = await moonbeamClient.createBulkNotification({
                    type: NotificationType.DailyEarningsSummary,
                    channelType: NotificationChannelType.Email,
                    bulkNotifications: bulkEmailNotifications
                });
                // make sure that this bulk notification call was successful
                if (createBulkEmailNotificationResponse && !createBulkEmailNotificationResponse.errorMessage && !createBulkEmailNotificationResponse.errorType &&
                    createBulkEmailNotificationResponse.data && createBulkEmailNotificationResponse.data.length !== 0) {
                    console.log(`Bulk email notification successfully created for ${NotificationType.DailyEarningsSummary}!`);

                    // 7) Call the createBulkNotification for push notifications.
                    const createBulkMobilePushNotificationResponse: CreateBulkNotificationResponse = await moonbeamClient.createBulkNotification({
                        type: NotificationType.DailyEarningsSummary,
                        channelType: NotificationChannelType.Push,
                        bulkNotifications: bulkMobilePushNotifications
                    });
                    // make sure that this bulk notification call was successful
                    if (createBulkMobilePushNotificationResponse && !createBulkMobilePushNotificationResponse.errorMessage && !createBulkMobilePushNotificationResponse.errorType &&
                        createBulkMobilePushNotificationResponse.data && createBulkMobilePushNotificationResponse.data.length !== 0) {
                        console.log(`Bulk mobile push notification successfully created for ${NotificationType.DailyEarningsSummary}!`);
                    } else {
                        /**
                         * no need for further actions, since this error will be logged and nothing will execute further.
                         * in the future we might need some alerts and metrics emitting here
                         */
                        const errorMessage = `Creating a bulk mobile push notification call through the createBulkNotification call failed`;
                        console.log(errorMessage);
                    }
                } else {
                    /**
                     * no need for further actions, since this error will be logged and nothing will execute further.
                     * in the future we might need some alerts and metrics emitting here
                     */
                    const errorMessage = `Creating a bulk email notification call through the createBulkNotification call failed`;
                    console.log(errorMessage);
                }
            } else {
                /**
                 * no need for further actions, since this error will be logged and nothing will execute further.
                 * in the future we might need some alerts and metrics emitting here
                 */
                const errorMessage = `Retrieving user notification assets through the getUserNotificationAssets call failed`;
                console.log(errorMessage);
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
    } catch
        (error) {
        /**
         * no need for further actions, since this error will be logged and nothing will execute further.
         * in the future we might need some alerts and metrics emitting here
         */
        console.log(`Unexpected error while processing the daily earnings summary cron event ${error}`);
    }
}
