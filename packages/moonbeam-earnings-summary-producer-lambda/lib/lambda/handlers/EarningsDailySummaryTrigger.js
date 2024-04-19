"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerEarningsDailySummariesCreation = void 0;
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * Function used to handle the earnings daily summary trigger, by determining
 * which users spent in a particular day, creating a summary for them, and then sending
 * them a PUSH and EMAIL notification.
 *
 * @returns a {@link Promise} of {@link void}, since the EventBridger
 * event trigger, will execute a cron job and not return anything.
 */
const triggerEarningsDailySummariesCreation = async () => {
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
        const region = process.env.AWS_REGION;
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
        const moonbeamClient = new moonbeam_models_1.MoonbeamClient(process.env.ENV_NAME, region);
        /**
         * 2) Call the createDailyEarningsSummary AppSync Mutation API in order to determine which users
         * spent in the previous day, and create a summary for them.
         */
        const dailyEarningsSummaryResponse = await moonbeamClient.createDailyEarningsSummary({
            targetDate: new Date(targetDate.setUTCHours(0, 0, 0, 0)).toISOString()
        });
        // make sure that creating the daily earnings summaries call was successful or not
        if (dailyEarningsSummaryResponse && !dailyEarningsSummaryResponse.errorMessage && !dailyEarningsSummaryResponse.errorType &&
            dailyEarningsSummaryResponse.data && dailyEarningsSummaryResponse.data.length !== 0) {
            /**
             * 3) Create a map of users obtained from daily earnings summaries created and the
             * [dailyEarningsSummaryAmounts, transactions] from the daily earnings summaries created.
             */
            const summariesMap = new Map();
            // build out a list of ids for faster retrieval
            const userIds = [];
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
            const userNotificationAssetsResponse = await moonbeamClient.getUserNotificationAssets({
                idList: userIds
            });
            // make sure that the get user notification assets call was successful or not
            if (userNotificationAssetsResponse && !userNotificationAssetsResponse.errorMessage && !userNotificationAssetsResponse.errorType &&
                userNotificationAssetsResponse.data && userNotificationAssetsResponse.data.length !== 0) {
                // 5) Create a list of emailNotifications and a list of pushNotifications to be used in sending bulk notifications.
                const bulkEmailNotifications = [];
                const bulkMobilePushNotifications = [];
                summariesMap.forEach((value, userId) => {
                    // retrieve the corresponding user's notification details
                    const dailyEarningsSummaryAmount = value[0];
                    const transactions = value[1];
                    // retrieve the corresponding user's notification assets
                    const userNotificationAssets = userNotificationAssetsResponse.data.filter(notificationAssets => notificationAssets !== null && notificationAssets.id === userId);
                    if (userNotificationAssets.length === 1) {
                        // create the bulk email notification list
                        const newBulkEmailNotification = {
                            id: userId,
                            channelType: moonbeam_models_1.NotificationChannelType.Email,
                            status: moonbeam_models_1.NotificationStatus.Sent,
                            type: moonbeam_models_1.NotificationType.DailyEarningsSummary,
                            dailyEarningsSummaryAmount: dailyEarningsSummaryAmount,
                            emailDestination: userNotificationAssets[0].email,
                            transactions: transactions,
                            userFullName: 'Placeholder Name' // for now, we do not need names for this type of notification so we just put a placeholder here instead
                        };
                        bulkEmailNotifications.push(newBulkEmailNotification);
                        // create the bulk mobile push notification list
                        const newMobilePushNotification = {
                            id: userId,
                            channelType: moonbeam_models_1.NotificationChannelType.Push,
                            status: moonbeam_models_1.NotificationStatus.Sent,
                            type: moonbeam_models_1.NotificationType.DailyEarningsSummary,
                            dailyEarningsSummaryAmount: dailyEarningsSummaryAmount,
                            expoPushTokens: [userNotificationAssets[0].pushToken]
                        };
                        bulkMobilePushNotifications.push(newMobilePushNotification);
                    }
                });
                // 6) Call the createBulkNotification for emails.
                const createBulkEmailNotificationResponse = await moonbeamClient.createBulkNotification({
                    type: moonbeam_models_1.NotificationType.DailyEarningsSummary,
                    channelType: moonbeam_models_1.NotificationChannelType.Email,
                    bulkNotifications: bulkEmailNotifications
                });
                // make sure that this bulk notification call was successful
                if (createBulkEmailNotificationResponse && !createBulkEmailNotificationResponse.errorMessage && !createBulkEmailNotificationResponse.errorType &&
                    createBulkEmailNotificationResponse.data && createBulkEmailNotificationResponse.data.length !== 0) {
                    console.log(`Bulk email notification successfully created for ${moonbeam_models_1.NotificationType.DailyEarningsSummary}!`);
                    // 7) Call the createBulkNotification for push notifications.
                    const createBulkMobilePushNotificationResponse = await moonbeamClient.createBulkNotification({
                        type: moonbeam_models_1.NotificationType.DailyEarningsSummary,
                        channelType: moonbeam_models_1.NotificationChannelType.Push,
                        bulkNotifications: bulkMobilePushNotifications
                    });
                    // make sure that this bulk notification call was successful
                    if (createBulkMobilePushNotificationResponse && !createBulkMobilePushNotificationResponse.errorMessage && !createBulkMobilePushNotificationResponse.errorType &&
                        createBulkMobilePushNotificationResponse.data && createBulkMobilePushNotificationResponse.data.length !== 0) {
                        console.log(`Bulk mobile push notification successfully created for ${moonbeam_models_1.NotificationType.DailyEarningsSummary}!`);
                    }
                    else {
                        /**
                         * no need for further actions, since this error will be logged and nothing will execute further.
                         * in the future we might need some alerts and metrics emitting here
                         */
                        const errorMessage = `Creating a bulk mobile push notification call through the createBulkNotification call failed`;
                        console.log(errorMessage);
                    }
                }
                else {
                    /**
                     * no need for further actions, since this error will be logged and nothing will execute further.
                     * in the future we might need some alerts and metrics emitting here
                     */
                    const errorMessage = `Creating a bulk email notification call through the createBulkNotification call failed`;
                    console.log(errorMessage);
                }
            }
            else {
                /**
                 * no need for further actions, since this error will be logged and nothing will execute further.
                 * in the future we might need some alerts and metrics emitting here
                 */
                const errorMessage = `Retrieving user notification assets through the getUserNotificationAssets call failed`;
                console.log(errorMessage);
            }
        }
        else {
            // check if there are no daily summaries needed to get generated first
            if (dailyEarningsSummaryResponse.errorType && dailyEarningsSummaryResponse.errorType === moonbeam_models_1.DailySummaryErrorType.NoneOrAbsent &&
                dailyEarningsSummaryResponse.data && dailyEarningsSummaryResponse.data.length === 0) {
                /**
                 * no need for further actions, since this error will be logged and nothing will execute further.
                 * in the future we might need some alerts and metrics emitting here
                 */
                const errorMessage = `Creating daily summaries through the createDailyEarningsSummary call failed`;
                console.log(errorMessage);
            }
            else {
                /**
                 * no need for further actions, since this error will be logged and nothing will execute further.
                 * in the future we might need some alerts and metrics emitting here
                 */
                const errorMessage = `Creating daily summaries through the createDailyEarningsSummary call failed`;
                console.log(errorMessage);
            }
        }
    }
    catch (error) {
        /**
         * no need for further actions, since this error will be logged and nothing will execute further.
         * in the future we might need some alerts and metrics emitting here
         */
        console.log(`Unexpected error while processing the daily earnings summary cron event ${error}`);
    }
};
exports.triggerEarningsDailySummariesCreation = triggerEarningsDailySummariesCreation;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRWFybmluZ3NEYWlseVN1bW1hcnlUcmlnZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9oYW5kbGVycy9FYXJuaW5nc0RhaWx5U3VtbWFyeVRyaWdnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsK0RBV21DO0FBRW5DOzs7Ozs7O0dBT0c7QUFDSSxNQUFNLHFDQUFxQyxHQUFHLEtBQUssSUFBbUIsRUFBRTtJQUMzRTs7Ozs7Ozs7Ozs7Ozs7T0FjRztJQUNILElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsK0ZBQStGO1FBQy9GLE1BQU0sU0FBUyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7UUFDN0IsTUFBTSxVQUFVLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUU5QiwwREFBMEQ7UUFDMUQsVUFBVSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDNUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2QixVQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pCLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekIsVUFBVSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUU5Qix1R0FBdUc7UUFDdkcsTUFBTSxjQUFjLEdBQUcsSUFBSSxnQ0FBYyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRXpFOzs7V0FHRztRQUNILE1BQU0sNEJBQTRCLEdBQWlDLE1BQU0sY0FBYyxDQUFDLDBCQUEwQixDQUFDO1lBQy9HLFVBQVUsRUFBRSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUs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QyxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDckY7OzttQkFHRztnQkFDSCxNQUFNLFlBQVksR0FBRyw2RUFBNkUsQ0FBQztnQkFDbkcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQzthQUM3QjtpQkFBTTtnQkFDSDs7O21CQUdHO2dCQUNILE1BQU0sWUFBWSxHQUFHLDZFQUE2RSxDQUFDO2dCQUNuRyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO2FBQzdCO1NBQ0o7S0FDSjtJQUFDLE9BQ0csS0FBSyxFQUFFO1FBQ1I7OztXQUdHO1FBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQywyRUFBMkUsS0FBSyxFQUFFLENBQUMsQ0FBQztLQUNuRztBQUNMLENBQUMsQ0FBQTtBQTdMWSxRQUFBLHFDQUFxQyx5Q0E2TGpEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgICBDcmVhdGVCdWxrTm90aWZpY2F0aW9uUmVzcG9uc2UsXG4gICAgQ3JlYXRlTm90aWZpY2F0aW9uSW5wdXQsXG4gICAgRGFpbHlFYXJuaW5nc1N1bW1hcnlSZXNwb25zZSxcbiAgICBEYWlseVN1bW1hcnlFcnJvclR5cGUsXG4gICAgTW9vbmJlYW1DbGllbnQsXG4gICAgTW9vbmJlYW1UcmFuc2FjdGlvbixcbiAgICBOb3RpZmljYXRpb25DaGFubmVsVHlwZSxcbiAgICBOb3RpZmljYXRpb25TdGF0dXMsXG4gICAgTm90aWZpY2F0aW9uVHlwZSxcbiAgICBVc2VyTm90aWZpY2F0aW9uQXNzZXRzUmVzcG9uc2Vcbn0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcblxuLyoqXG4gKiBGdW5jdGlvbiB1c2VkIHRvIGhhbmRsZSB0aGUgZWFybmluZ3MgZGFpbHkgc3VtbWFyeSB0cmlnZ2VyLCBieSBkZXRlcm1pbmluZ1xuICogd2hpY2ggdXNlcnMgc3BlbnQgaW4gYSBwYXJ0aWN1bGFyIGRheSwgY3JlYXRpbmcgYSBzdW1tYXJ5IGZvciB0aGVtLCBhbmQgdGhlbiBzZW5kaW5nXG4gKiB0aGVtIGEgUFVTSCBhbmQgRU1BSUwgbm90aWZpY2F0aW9uLlxuICpcbiAqIEByZXR1cm5zIGEge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayB2b2lkfSwgc2luY2UgdGhlIEV2ZW50QnJpZGdlclxuICogZXZlbnQgdHJpZ2dlciwgd2lsbCBleGVjdXRlIGEgY3JvbiBqb2IgYW5kIG5vdCByZXR1cm4gYW55dGhpbmcuXG4gKi9cbmV4cG9ydCBjb25zdCB0cmlnZ2VyRWFybmluZ3NEYWlseVN1bW1hcmllc0NyZWF0aW9uID0gYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgIC8qKlxuICAgICAqIFRoZSBvdmVyYWxsIGRhaWx5IGVhcm5pbmdzIHN1bW1hcnkgY3JvbiB0cmlnZ2VyaW5nLCB3aWxsIGJlIG1hZGUgdXAgb2YgdGhlIGZvbGxvd2luZyBzdGVwczpcbiAgICAgKlxuICAgICAqIDEpIFdlIHdhbnQgdG8gZ2V0IHRoZSBwcmV2aW91cyBkYXkncyBkYXRlLCBhbmQgc2V0IHRoYXQgYXMgb3VyIHRhcmdldCBkYXRlIGluIHRoZSBuZXh0IHN0ZXAuXG4gICAgICogMikgQ2FsbCB0aGUgY3JlYXRlRGFpbHlFYXJuaW5nc1N1bW1hcnkgQXBwU3luYyBNdXRhdGlvbiBBUEkgaW4gb3JkZXIgdG8gZGV0ZXJtaW5lIHdoaWNoIHVzZXJzXG4gICAgICogc3BlbnQgaW4gdGhlIHByZXZpb3VzIGRheSwgYW5kIGNyZWF0ZSBhIHN1bW1hcnkgZm9yIHRoZW0uXG4gICAgICogMykgQ3JlYXRlIGEgbWFwIG9mIHVzZXJzIG9idGFpbmVkIGZyb20gZGFpbHkgZWFybmluZ3Mgc3VtbWFyaWVzIGNyZWF0ZWQgYW5kIHRoZVxuICAgICAqIFtkYWlseUVhcm5pbmdzU3VtbWFyeUFtb3VudHMsIHRyYW5zYWN0aW9uc10gZnJvbSB0aGUgZGFpbHkgZWFybmluZ3Mgc3VtbWFyaWVzIGNyZWF0ZWQuXG4gICAgICogNCkgQ2FsbCB0aGUgZ2V0VXNlck5vdGlmaWNhdGlvbkFzc2V0cyBBcHBTeW5jIFF1ZXJ5IEFQSSwgaW4gb3JkZXIgdG8gZ2V0IGEgbGlzdCBvZiB0aGUgZW1haWxzIGFuZCBwdXNoIHRva2Vuc1xuICAgICAqIGZvciB0aGUgbGlzdCBvZiB1c2VycyBmcm9tIHN0ZXAgMykuXG4gICAgICogNSkgQ3JlYXRlIGEgbGlzdCBvZiBlbWFpbE5vdGlmaWNhdGlvbnMgYW5kIGEgbGlzdCBvZiBwdXNoTm90aWZpY2F0aW9ucyB0byBiZSB1c2VkIGluIHNlbmRpbmcgYnVsayBub3RpZmljYXRpb25zLlxuICAgICAqIDYpIENhbGwgdGhlIGNyZWF0ZUJ1bGtOb3RpZmljYXRpb24gZm9yIGVtYWlscy5cbiAgICAgKiA3KSBDYWxsIHRoZSBjcmVhdGVCdWxrTm90aWZpY2F0aW9uIGZvciBwdXNoIG5vdGlmaWNhdGlvbnMuXG4gICAgICpcbiAgICAgKi9cbiAgICB0cnkge1xuICAgICAgICAvLyByZXRyaWV2aW5nIHRoZSBjdXJyZW50IGZ1bmN0aW9uIHJlZ2lvblxuICAgICAgICBjb25zdCByZWdpb24gPSBwcm9jZXNzLmVudi5BV1NfUkVHSU9OITtcblxuICAgICAgICAvLyAxKSBXZSB3YW50IHRvIGdldCB0aGUgcHJldmlvdXMgZGF5J3MgZGF0ZSwgYW5kIHNldCB0aGF0IGFzIG91ciB0YXJnZXQgZGF0ZSBpbiB0aGUgbmV4dCBzdGVwLlxuICAgICAgICBjb25zdCB0b2RheURhdGUgPSBuZXcgRGF0ZSgpO1xuICAgICAgICBjb25zdCB0YXJnZXREYXRlID0gbmV3IERhdGUoKTtcblxuICAgICAgICAvLyBzZXQgdGhlIHRhcmdldERhdGUgYXMgeWVzdGVyZGF5J3MgZGF0ZSBhdCAwMDowMDowMC4wMDBaXG4gICAgICAgIHRhcmdldERhdGUuc2V0RGF0ZSh0b2RheURhdGUuZ2V0RGF0ZSgpIC0gMSk7XG4gICAgICAgIHRhcmdldERhdGUuc2V0SG91cnMoMCk7XG4gICAgICAgIHRhcmdldERhdGUuc2V0TWludXRlcygwKTtcbiAgICAgICAgdGFyZ2V0RGF0ZS5zZXRTZWNvbmRzKDApO1xuICAgICAgICB0YXJnZXREYXRlLnNldE1pbGxpc2Vjb25kcygwKTtcblxuICAgICAgICAvLyBpbml0aWFsaXplIHRoZSBNb29uYmVhbSBDbGllbnQgQVBJIGhlcmUsIGluIG9yZGVyIHRvIGNhbGwgdGhlIGFwcHJvcHJpYXRlIGVuZHBvaW50cyBmb3IgdGhpcyBoYW5kbGVyXG4gICAgICAgIGNvbnN0IG1vb25iZWFtQ2xpZW50ID0gbmV3IE1vb25iZWFtQ2xpZW50KHByb2Nlc3MuZW52LkVOVl9OQU1FISwgcmVnaW9uKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogMikgQ2FsbCB0aGUgY3JlYXRlRGFpbHlFYXJuaW5nc1N1bW1hcnkgQXBwU3luYyBNdXRhdGlvbiBBUEkgaW4gb3JkZXIgdG8gZGV0ZXJtaW5lIHdoaWNoIHVzZXJzXG4gICAgICAgICAqIHNwZW50IGluIHRoZSBwcmV2aW91cyBkYXksIGFuZCBjcmVhdGUgYSBzdW1tYXJ5IGZvciB0aGVtLlxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3QgZGFpbHlFYXJuaW5nc1N1bW1hcnlSZXNwb25zZTogRGFpbHlFYXJuaW5nc1N1bW1hcnlSZXNwb25zZSA9IGF3YWl0IG1vb25iZWFtQ2xpZW50LmNyZWF0ZURhaWx5RWFybmluZ3NTdW1tYXJ5KHtcbiAgICAgICAgICAgIHRhcmdldERhdGU6IG5ldyBEYXRlKHRhcmdldERhdGUuc2V0VVRDSG91cnMoMCwgMCwgMCwgMCkpLnRvSVNPU3RyaW5nKClcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gbWFrZSBzdXJlIHRoYXQgY3JlYXRpbmcgdGhlIGRhaWx5IGVhcm5pbmdzIHN1bW1hcmllcyBjYWxsIHdhcyBzdWNjZXNzZnVsIG9yIG5vdFxuICAgICAgICBpZiAoZGFpbHlFYXJuaW5nc1N1bW1hcnlSZXNwb25zZSAmJiAhZGFpbHlFYXJuaW5nc1N1bW1hcnlSZXNwb25zZS5lcnJvck1lc3NhZ2UgJiYgIWRhaWx5RWFybmluZ3NTdW1tYXJ5UmVzcG9uc2UuZXJyb3JUeXBlICYmXG4gICAgICAgICAgICBkYWlseUVhcm5pbmdzU3VtbWFyeVJlc3BvbnNlLmRhdGEgJiYgZGFpbHlFYXJuaW5nc1N1bW1hcnlSZXNwb25zZS5kYXRhLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiAzKSBDcmVhdGUgYSBtYXAgb2YgdXNlcnMgb2J0YWluZWQgZnJvbSBkYWlseSBlYXJuaW5ncyBzdW1tYXJpZXMgY3JlYXRlZCBhbmQgdGhlXG4gICAgICAgICAgICAgKiBbZGFpbHlFYXJuaW5nc1N1bW1hcnlBbW91bnRzLCB0cmFuc2FjdGlvbnNdIGZyb20gdGhlIGRhaWx5IGVhcm5pbmdzIHN1bW1hcmllcyBjcmVhdGVkLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBjb25zdCBzdW1tYXJpZXNNYXA6IE1hcDxzdHJpbmcsIFtudW1iZXIsIE1vb25iZWFtVHJhbnNhY3Rpb25bXV0+ID0gbmV3IE1hcDxzdHJpbmcsIFtudW1iZXIsIE1vb25iZWFtVHJhbnNhY3Rpb25bXV0+KCk7XG4gICAgICAgICAgICAvLyBidWlsZCBvdXQgYSBsaXN0IG9mIGlkcyBmb3IgZmFzdGVyIHJldHJpZXZhbFxuICAgICAgICAgICAgY29uc3QgdXNlcklkczogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgZGFpbHlFYXJuaW5nc1N1bW1hcnkgb2YgZGFpbHlFYXJuaW5nc1N1bW1hcnlSZXNwb25zZS5kYXRhKSB7XG4gICAgICAgICAgICAgICAgaWYgKGRhaWx5RWFybmluZ3NTdW1tYXJ5ICE9PSBudWxsICYmIChkYWlseUVhcm5pbmdzU3VtbWFyeS5pZCA9PT0gXCJlMWE2YWZiMi1mZjRjLTQwZDAtOWY0Yi1iODMzOTZiMGE5NjZcIiB8fCBkYWlseUVhcm5pbmdzU3VtbWFyeS5pZCA9PT0gXCIyMTIwNGQxMC0wNDdiLTQ3NWYtYWFlMC0zOTcwMTZlNWY3MGNcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gY29tcHV0ZSB0aGUgZGFpbHlFYXJuaW5nc1N1bW1hcnlBbW91bnQgZnJvbSB0aGUgc3VtbWFyeSB0cmFuc2FjdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgbGV0IGRhaWx5RWFybmluZ3NTdW1tYXJ5QW1vdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgZGFpbHlFYXJuaW5nc1N1bW1hcnkudHJhbnNhY3Rpb25zLmZvckVhY2godHJhbnNhY3Rpb24gPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRyYW5zYWN0aW9uICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGFpbHlFYXJuaW5nc1N1bW1hcnlBbW91bnQgKz0gdHJhbnNhY3Rpb24ucmV3YXJkQW1vdW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgZGFpbHlFYXJuaW5nc1N1bW1hcnlBbW91bnQgPSBOdW1iZXIoZGFpbHlFYXJuaW5nc1N1bW1hcnlBbW91bnQudG9GaXhlZCgyKSk7XG4gICAgICAgICAgICAgICAgICAgIC8vIHN0b3JlIHRoaXMgaW4gdGhlIG1hcCBhY2NvcmRpbmdseVxuICAgICAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAgICAgICAgIHN1bW1hcmllc01hcC5zZXQoZGFpbHlFYXJuaW5nc1N1bW1hcnkuaWQsIFtkYWlseUVhcm5pbmdzU3VtbWFyeUFtb3VudCwgZGFpbHlFYXJuaW5nc1N1bW1hcnkudHJhbnNhY3Rpb25zXSk7XG4gICAgICAgICAgICAgICAgICAgIC8vIHN0b3JlIHRoZSBpZCBpbiB0aGUgbGlzdCBvZiB1c2VySWRzIGZvciBmYXN0ZXIgcmV0cmlldmFsXG4gICAgICAgICAgICAgICAgICAgIHVzZXJJZHMucHVzaChkYWlseUVhcm5pbmdzU3VtbWFyeS5pZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIDQpIENhbGwgdGhlIGdldFVzZXJOb3RpZmljYXRpb25Bc3NldHMgQXBwU3luYyBRdWVyeSBBUEksIGluIG9yZGVyIHRvIGdldCBhIGxpc3Qgb2YgdGhlIGVtYWlscyBhbmQgcHVzaCB0b2tlbnNcbiAgICAgICAgICAgICAqIGZvciB0aGUgbGlzdCBvZiB1c2VycyBmcm9tIHN0ZXAgMykuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGNvbnN0IHVzZXJOb3RpZmljYXRpb25Bc3NldHNSZXNwb25zZTogVXNlck5vdGlmaWNhdGlvbkFzc2V0c1Jlc3BvbnNlID0gYXdhaXQgbW9vbmJlYW1DbGllbnQuZ2V0VXNlck5vdGlmaWNhdGlvbkFzc2V0cyh7XG4gICAgICAgICAgICAgICAgaWRMaXN0OiB1c2VySWRzXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gbWFrZSBzdXJlIHRoYXQgdGhlIGdldCB1c2VyIG5vdGlmaWNhdGlvbiBhc3NldHMgY2FsbCB3YXMgc3VjY2Vzc2Z1bCBvciBub3RcbiAgICAgICAgICAgIGlmICh1c2VyTm90aWZpY2F0aW9uQXNzZXRzUmVzcG9uc2UgJiYgIXVzZXJOb3RpZmljYXRpb25Bc3NldHNSZXNwb25zZS5lcnJvck1lc3NhZ2UgJiYgIXVzZXJOb3RpZmljYXRpb25Bc3NldHNSZXNwb25zZS5lcnJvclR5cGUgJiZcbiAgICAgICAgICAgICAgICB1c2VyTm90aWZpY2F0aW9uQXNzZXRzUmVzcG9uc2UuZGF0YSAmJiB1c2VyTm90aWZpY2F0aW9uQXNzZXRzUmVzcG9uc2UuZGF0YS5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgICAgICAvLyA1KSBDcmVhdGUgYSBsaXN0IG9mIGVtYWlsTm90aWZpY2F0aW9ucyBhbmQgYSBsaXN0IG9mIHB1c2hOb3RpZmljYXRpb25zIHRvIGJlIHVzZWQgaW4gc2VuZGluZyBidWxrIG5vdGlmaWNhdGlvbnMuXG4gICAgICAgICAgICAgICAgY29uc3QgYnVsa0VtYWlsTm90aWZpY2F0aW9uczogQ3JlYXRlTm90aWZpY2F0aW9uSW5wdXRbXSA9IFtdO1xuICAgICAgICAgICAgICAgIGNvbnN0IGJ1bGtNb2JpbGVQdXNoTm90aWZpY2F0aW9uczogQ3JlYXRlTm90aWZpY2F0aW9uSW5wdXRbXSA9IFtdO1xuICAgICAgICAgICAgICAgIHN1bW1hcmllc01hcC5mb3JFYWNoKCh2YWx1ZSwgdXNlcklkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBjb3JyZXNwb25kaW5nIHVzZXIncyBub3RpZmljYXRpb24gZGV0YWlsc1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBkYWlseUVhcm5pbmdzU3VtbWFyeUFtb3VudDogbnVtYmVyID0gdmFsdWVbMF07XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRyYW5zYWN0aW9uczogTW9vbmJlYW1UcmFuc2FjdGlvbltdID0gdmFsdWVbMV07XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIGNvcnJlc3BvbmRpbmcgdXNlcidzIG5vdGlmaWNhdGlvbiBhc3NldHNcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdXNlck5vdGlmaWNhdGlvbkFzc2V0cyA9IHVzZXJOb3RpZmljYXRpb25Bc3NldHNSZXNwb25zZS5kYXRhIS5maWx0ZXIobm90aWZpY2F0aW9uQXNzZXRzID0+IG5vdGlmaWNhdGlvbkFzc2V0cyAhPT0gbnVsbCAmJiBub3RpZmljYXRpb25Bc3NldHMuaWQgPT09IHVzZXJJZCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh1c2VyTm90aWZpY2F0aW9uQXNzZXRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY3JlYXRlIHRoZSBidWxrIGVtYWlsIG5vdGlmaWNhdGlvbiBsaXN0XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdCdWxrRW1haWxOb3RpZmljYXRpb246IENyZWF0ZU5vdGlmaWNhdGlvbklucHV0ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB1c2VySWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhbm5lbFR5cGU6IE5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlLkVtYWlsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1czogTm90aWZpY2F0aW9uU3RhdHVzLlNlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogTm90aWZpY2F0aW9uVHlwZS5EYWlseUVhcm5pbmdzU3VtbWFyeSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYWlseUVhcm5pbmdzU3VtbWFyeUFtb3VudDogZGFpbHlFYXJuaW5nc1N1bW1hcnlBbW91bnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW1haWxEZXN0aW5hdGlvbjogdXNlck5vdGlmaWNhdGlvbkFzc2V0c1swXSEuZW1haWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25zOiB0cmFuc2FjdGlvbnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlckZ1bGxOYW1lOiAnUGxhY2Vob2xkZXIgTmFtZScgLy8gZm9yIG5vdywgd2UgZG8gbm90IG5lZWQgbmFtZXMgZm9yIHRoaXMgdHlwZSBvZiBub3RpZmljYXRpb24gc28gd2UganVzdCBwdXQgYSBwbGFjZWhvbGRlciBoZXJlIGluc3RlYWRcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1bGtFbWFpbE5vdGlmaWNhdGlvbnMucHVzaChuZXdCdWxrRW1haWxOb3RpZmljYXRpb24pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjcmVhdGUgdGhlIGJ1bGsgbW9iaWxlIHB1c2ggbm90aWZpY2F0aW9uIGxpc3RcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld01vYmlsZVB1c2hOb3RpZmljYXRpb246IENyZWF0ZU5vdGlmaWNhdGlvbklucHV0ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB1c2VySWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhbm5lbFR5cGU6IE5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlLlB1c2gsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiBOb3RpZmljYXRpb25TdGF0dXMuU2VudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBOb3RpZmljYXRpb25UeXBlLkRhaWx5RWFybmluZ3NTdW1tYXJ5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhaWx5RWFybmluZ3NTdW1tYXJ5QW1vdW50OiBkYWlseUVhcm5pbmdzU3VtbWFyeUFtb3VudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHBvUHVzaFRva2VuczogW3VzZXJOb3RpZmljYXRpb25Bc3NldHNbMF0hLnB1c2hUb2tlbl1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1bGtNb2JpbGVQdXNoTm90aWZpY2F0aW9ucy5wdXNoKG5ld01vYmlsZVB1c2hOb3RpZmljYXRpb24pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgLy8gNikgQ2FsbCB0aGUgY3JlYXRlQnVsa05vdGlmaWNhdGlvbiBmb3IgZW1haWxzLlxuICAgICAgICAgICAgICAgIGNvbnN0IGNyZWF0ZUJ1bGtFbWFpbE5vdGlmaWNhdGlvblJlc3BvbnNlOiBDcmVhdGVCdWxrTm90aWZpY2F0aW9uUmVzcG9uc2UgPSBhd2FpdCBtb29uYmVhbUNsaWVudC5jcmVhdGVCdWxrTm90aWZpY2F0aW9uKHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogTm90aWZpY2F0aW9uVHlwZS5EYWlseUVhcm5pbmdzU3VtbWFyeSxcbiAgICAgICAgICAgICAgICAgICAgY2hhbm5lbFR5cGU6IE5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlLkVtYWlsLFxuICAgICAgICAgICAgICAgICAgICBidWxrTm90aWZpY2F0aW9uczogYnVsa0VtYWlsTm90aWZpY2F0aW9uc1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIC8vIG1ha2Ugc3VyZSB0aGF0IHRoaXMgYnVsayBub3RpZmljYXRpb24gY2FsbCB3YXMgc3VjY2Vzc2Z1bFxuICAgICAgICAgICAgICAgIGlmIChjcmVhdGVCdWxrRW1haWxOb3RpZmljYXRpb25SZXNwb25zZSAmJiAhY3JlYXRlQnVsa0VtYWlsTm90aWZpY2F0aW9uUmVzcG9uc2UuZXJyb3JNZXNzYWdlICYmICFjcmVhdGVCdWxrRW1haWxOb3RpZmljYXRpb25SZXNwb25zZS5lcnJvclR5cGUgJiZcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlQnVsa0VtYWlsTm90aWZpY2F0aW9uUmVzcG9uc2UuZGF0YSAmJiBjcmVhdGVCdWxrRW1haWxOb3RpZmljYXRpb25SZXNwb25zZS5kYXRhLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgQnVsayBlbWFpbCBub3RpZmljYXRpb24gc3VjY2Vzc2Z1bGx5IGNyZWF0ZWQgZm9yICR7Tm90aWZpY2F0aW9uVHlwZS5EYWlseUVhcm5pbmdzU3VtbWFyeX0hYCk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gNykgQ2FsbCB0aGUgY3JlYXRlQnVsa05vdGlmaWNhdGlvbiBmb3IgcHVzaCBub3RpZmljYXRpb25zLlxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjcmVhdGVCdWxrTW9iaWxlUHVzaE5vdGlmaWNhdGlvblJlc3BvbnNlOiBDcmVhdGVCdWxrTm90aWZpY2F0aW9uUmVzcG9uc2UgPSBhd2FpdCBtb29uYmVhbUNsaWVudC5jcmVhdGVCdWxrTm90aWZpY2F0aW9uKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IE5vdGlmaWNhdGlvblR5cGUuRGFpbHlFYXJuaW5nc1N1bW1hcnksXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGFubmVsVHlwZTogTm90aWZpY2F0aW9uQ2hhbm5lbFR5cGUuUHVzaCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1bGtOb3RpZmljYXRpb25zOiBidWxrTW9iaWxlUHVzaE5vdGlmaWNhdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIC8vIG1ha2Ugc3VyZSB0aGF0IHRoaXMgYnVsayBub3RpZmljYXRpb24gY2FsbCB3YXMgc3VjY2Vzc2Z1bFxuICAgICAgICAgICAgICAgICAgICBpZiAoY3JlYXRlQnVsa01vYmlsZVB1c2hOb3RpZmljYXRpb25SZXNwb25zZSAmJiAhY3JlYXRlQnVsa01vYmlsZVB1c2hOb3RpZmljYXRpb25SZXNwb25zZS5lcnJvck1lc3NhZ2UgJiYgIWNyZWF0ZUJ1bGtNb2JpbGVQdXNoTm90aWZpY2F0aW9uUmVzcG9uc2UuZXJyb3JUeXBlICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVCdWxrTW9iaWxlUHVzaE5vdGlmaWNhdGlvblJlc3BvbnNlLmRhdGEgJiYgY3JlYXRlQnVsa01vYmlsZVB1c2hOb3RpZmljYXRpb25SZXNwb25zZS5kYXRhLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYEJ1bGsgbW9iaWxlIHB1c2ggbm90aWZpY2F0aW9uIHN1Y2Nlc3NmdWxseSBjcmVhdGVkIGZvciAke05vdGlmaWNhdGlvblR5cGUuRGFpbHlFYXJuaW5nc1N1bW1hcnl9IWApO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBubyBuZWVkIGZvciBmdXJ0aGVyIGFjdGlvbnMsIHNpbmNlIHRoaXMgZXJyb3Igd2lsbCBiZSBsb2dnZWQgYW5kIG5vdGhpbmcgd2lsbCBleGVjdXRlIGZ1cnRoZXIuXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBpbiB0aGUgZnV0dXJlIHdlIG1pZ2h0IG5lZWQgc29tZSBhbGVydHMgYW5kIG1ldHJpY3MgZW1pdHRpbmcgaGVyZVxuICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgQ3JlYXRpbmcgYSBidWxrIG1vYmlsZSBwdXNoIG5vdGlmaWNhdGlvbiBjYWxsIHRocm91Z2ggdGhlIGNyZWF0ZUJ1bGtOb3RpZmljYXRpb24gY2FsbCBmYWlsZWRgO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBubyBuZWVkIGZvciBmdXJ0aGVyIGFjdGlvbnMsIHNpbmNlIHRoaXMgZXJyb3Igd2lsbCBiZSBsb2dnZWQgYW5kIG5vdGhpbmcgd2lsbCBleGVjdXRlIGZ1cnRoZXIuXG4gICAgICAgICAgICAgICAgICAgICAqIGluIHRoZSBmdXR1cmUgd2UgbWlnaHQgbmVlZCBzb21lIGFsZXJ0cyBhbmQgbWV0cmljcyBlbWl0dGluZyBoZXJlXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgQ3JlYXRpbmcgYSBidWxrIGVtYWlsIG5vdGlmaWNhdGlvbiBjYWxsIHRocm91Z2ggdGhlIGNyZWF0ZUJ1bGtOb3RpZmljYXRpb24gY2FsbCBmYWlsZWRgO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogbm8gbmVlZCBmb3IgZnVydGhlciBhY3Rpb25zLCBzaW5jZSB0aGlzIGVycm9yIHdpbGwgYmUgbG9nZ2VkIGFuZCBub3RoaW5nIHdpbGwgZXhlY3V0ZSBmdXJ0aGVyLlxuICAgICAgICAgICAgICAgICAqIGluIHRoZSBmdXR1cmUgd2UgbWlnaHQgbmVlZCBzb21lIGFsZXJ0cyBhbmQgbWV0cmljcyBlbWl0dGluZyBoZXJlXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFJldHJpZXZpbmcgdXNlciBub3RpZmljYXRpb24gYXNzZXRzIHRocm91Z2ggdGhlIGdldFVzZXJOb3RpZmljYXRpb25Bc3NldHMgY2FsbCBmYWlsZWRgO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBjaGVjayBpZiB0aGVyZSBhcmUgbm8gZGFpbHkgc3VtbWFyaWVzIG5lZWRlZCB0byBnZXQgZ2VuZXJhdGVkIGZpcnN0XG4gICAgICAgICAgICBpZiAoZGFpbHlFYXJuaW5nc1N1bW1hcnlSZXNwb25zZS5lcnJvclR5cGUgJiYgZGFpbHlFYXJuaW5nc1N1bW1hcnlSZXNwb25zZS5lcnJvclR5cGUgPT09IERhaWx5U3VtbWFyeUVycm9yVHlwZS5Ob25lT3JBYnNlbnQgJiZcbiAgICAgICAgICAgICAgICBkYWlseUVhcm5pbmdzU3VtbWFyeVJlc3BvbnNlLmRhdGEgJiYgZGFpbHlFYXJuaW5nc1N1bW1hcnlSZXNwb25zZS5kYXRhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIG5vIG5lZWQgZm9yIGZ1cnRoZXIgYWN0aW9ucywgc2luY2UgdGhpcyBlcnJvciB3aWxsIGJlIGxvZ2dlZCBhbmQgbm90aGluZyB3aWxsIGV4ZWN1dGUgZnVydGhlci5cbiAgICAgICAgICAgICAgICAgKiBpbiB0aGUgZnV0dXJlIHdlIG1pZ2h0IG5lZWQgc29tZSBhbGVydHMgYW5kIG1ldHJpY3MgZW1pdHRpbmcgaGVyZVxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBDcmVhdGluZyBkYWlseSBzdW1tYXJpZXMgdGhyb3VnaCB0aGUgY3JlYXRlRGFpbHlFYXJuaW5nc1N1bW1hcnkgY2FsbCBmYWlsZWRgO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIG5vIG5lZWQgZm9yIGZ1cnRoZXIgYWN0aW9ucywgc2luY2UgdGhpcyBlcnJvciB3aWxsIGJlIGxvZ2dlZCBhbmQgbm90aGluZyB3aWxsIGV4ZWN1dGUgZnVydGhlci5cbiAgICAgICAgICAgICAgICAgKiBpbiB0aGUgZnV0dXJlIHdlIG1pZ2h0IG5lZWQgc29tZSBhbGVydHMgYW5kIG1ldHJpY3MgZW1pdHRpbmcgaGVyZVxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBDcmVhdGluZyBkYWlseSBzdW1tYXJpZXMgdGhyb3VnaCB0aGUgY3JlYXRlRGFpbHlFYXJuaW5nc1N1bW1hcnkgY2FsbCBmYWlsZWRgO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGNhdGNoXG4gICAgICAgIChlcnJvcikge1xuICAgICAgICAvKipcbiAgICAgICAgICogbm8gbmVlZCBmb3IgZnVydGhlciBhY3Rpb25zLCBzaW5jZSB0aGlzIGVycm9yIHdpbGwgYmUgbG9nZ2VkIGFuZCBub3RoaW5nIHdpbGwgZXhlY3V0ZSBmdXJ0aGVyLlxuICAgICAgICAgKiBpbiB0aGUgZnV0dXJlIHdlIG1pZ2h0IG5lZWQgc29tZSBhbGVydHMgYW5kIG1ldHJpY3MgZW1pdHRpbmcgaGVyZVxuICAgICAgICAgKi9cbiAgICAgICAgY29uc29sZS5sb2coYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgcHJvY2Vzc2luZyB0aGUgZGFpbHkgZWFybmluZ3Mgc3VtbWFyeSBjcm9uIGV2ZW50ICR7ZXJyb3J9YCk7XG4gICAgfVxufVxuIl19