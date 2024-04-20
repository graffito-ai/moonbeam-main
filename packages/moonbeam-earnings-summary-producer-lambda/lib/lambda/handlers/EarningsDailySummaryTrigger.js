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
     *
     * For the following steps we will chunk the requests in chunks of 250 items, so we can fit everything in the Lambda requests
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
                if (dailyEarningsSummary !== null) {
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
                // Bulk Email: For the following steps we will chunk the requests in chunks of 250 items, so we can fit everything in the Lambda requests
                let bulkEmailCounter = 0;
                while (bulkEmailNotifications.slice(bulkEmailCounter, bulkEmailCounter + 250).length !== 0) {
                    const bulkEmailNotificationsSliced = bulkEmailNotifications.slice(bulkEmailCounter, bulkEmailCounter + 250);
                    // 6) Call the createBulkNotification for emails.
                    const createBulkEmailNotificationResponse = await moonbeamClient.createBulkNotification({
                        type: moonbeam_models_1.NotificationType.DailyEarningsSummary,
                        channelType: moonbeam_models_1.NotificationChannelType.Email,
                        bulkNotifications: bulkEmailNotificationsSliced
                    });
                    // make sure that this bulk notification call was successful
                    if (createBulkEmailNotificationResponse && !createBulkEmailNotificationResponse.errorMessage && !createBulkEmailNotificationResponse.errorType &&
                        createBulkEmailNotificationResponse.data && createBulkEmailNotificationResponse.data.length !== 0) {
                        console.log(`Bulk email notification successfully created for ${moonbeam_models_1.NotificationType.DailyEarningsSummary} for ${bulkEmailNotificationsSliced.length} notifications!`);
                    }
                    else {
                        /**
                         * no need for further actions, since this error will be logged and nothing will execute further.
                         * in the future we might need some alerts and metrics emitting here
                         */
                        const errorMessage = `Creating a bulk email notification call through the createBulkNotification call failed`;
                        console.log(errorMessage);
                    }
                    bulkEmailCounter += 250;
                }
                // Mobile Push: For the following steps we will chunk the requests in chunks of 250 items, so we can fit everything in the Lambda requests
                let bulkMobilePushCounter = 0;
                while (bulkMobilePushNotifications.slice(bulkMobilePushCounter, bulkMobilePushCounter + 250).length !== 0) {
                    const bulkMobilePushNotificationsSliced = bulkMobilePushNotifications.slice(bulkMobilePushCounter, bulkMobilePushCounter + 250);
                    // 7) Call the createBulkNotification for push notifications.
                    const createBulkMobilePushNotificationResponse = await moonbeamClient.createBulkNotification({
                        type: moonbeam_models_1.NotificationType.DailyEarningsSummary,
                        channelType: moonbeam_models_1.NotificationChannelType.Push,
                        bulkNotifications: bulkMobilePushNotificationsSliced
                    });
                    // make sure that this bulk notification call was successful
                    if (createBulkMobilePushNotificationResponse && !createBulkMobilePushNotificationResponse.errorMessage && !createBulkMobilePushNotificationResponse.errorType &&
                        createBulkMobilePushNotificationResponse.data && createBulkMobilePushNotificationResponse.data.length !== 0) {
                        console.log(`Bulk mobile push notification successfully created for ${moonbeam_models_1.NotificationType.DailyEarningsSummary} for ${bulkMobilePushNotificationsSliced.length} notifications!`);
                    }
                    else {
                        /**
                         * no need for further actions, since this error will be logged and nothing will execute further.
                         * in the future we might need some alerts and metrics emitting here
                         */
                        const errorMessage = `Creating a bulk mobile push notification call through the createBulkNotification call failed`;
                        console.log(errorMessage);
                    }
                    bulkMobilePushCounter += 250;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRWFybmluZ3NEYWlseVN1bW1hcnlUcmlnZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9oYW5kbGVycy9FYXJuaW5nc0RhaWx5U3VtbWFyeVRyaWdnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsK0RBV21DO0FBRW5DOzs7Ozs7O0dBT0c7QUFDSSxNQUFNLHFDQUFxQyxHQUFHLEtBQUssSUFBbUIsRUFBRTtJQUMzRTs7Ozs7Ozs7Ozs7Ozs7OztPQWdCRztJQUNILElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsK0ZBQStGO1FBQy9GLE1BQU0sU0FBUyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7UUFDN0IsTUFBTSxVQUFVLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUU5QiwwREFBMEQ7UUFDMUQsVUFBVSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDNUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2QixVQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pCLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekIsVUFBVSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUU5Qix1R0FBdUc7UUFDdkcsTUFBTSxjQUFjLEdBQUcsSUFBSSxnQ0FBYyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRXpFOzs7V0FHRztRQUNILE1BQU0sNEJBQTRCLEdBQWlDLE1BQU0sY0FBYyxDQUFDLDBCQUEwQixDQUFDO1lBQy9HLFVBQVUsRUFBRSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLEVB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cmVhdGVCdWxrTm90aWZpY2F0aW9uUmVzcG9uc2UsXG4gICAgQ3JlYXRlTm90aWZpY2F0aW9uSW5wdXQsXG4gICAgRGFpbHlFYXJuaW5nc1N1bW1hcnlSZXNwb25zZSxcbiAgICBEYWlseVN1bW1hcnlFcnJvclR5cGUsXG4gICAgTW9vbmJlYW1DbGllbnQsXG4gICAgTW9vbmJlYW1UcmFuc2FjdGlvbixcbiAgICBOb3RpZmljYXRpb25DaGFubmVsVHlwZSxcbiAgICBOb3RpZmljYXRpb25TdGF0dXMsXG4gICAgTm90aWZpY2F0aW9uVHlwZSxcbiAgICBVc2VyTm90aWZpY2F0aW9uQXNzZXRzUmVzcG9uc2Vcbn0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcblxuLyoqXG4gKiBGdW5jdGlvbiB1c2VkIHRvIGhhbmRsZSB0aGUgZWFybmluZ3MgZGFpbHkgc3VtbWFyeSB0cmlnZ2VyLCBieSBkZXRlcm1pbmluZ1xuICogd2hpY2ggdXNlcnMgc3BlbnQgaW4gYSBwYXJ0aWN1bGFyIGRheSwgY3JlYXRpbmcgYSBzdW1tYXJ5IGZvciB0aGVtLCBhbmQgdGhlbiBzZW5kaW5nXG4gKiB0aGVtIGEgUFVTSCBhbmQgRU1BSUwgbm90aWZpY2F0aW9uLlxuICpcbiAqIEByZXR1cm5zIGEge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayB2b2lkfSwgc2luY2UgdGhlIEV2ZW50QnJpZGdlclxuICogZXZlbnQgdHJpZ2dlciwgd2lsbCBleGVjdXRlIGEgY3JvbiBqb2IgYW5kIG5vdCByZXR1cm4gYW55dGhpbmcuXG4gKi9cbmV4cG9ydCBjb25zdCB0cmlnZ2VyRWFybmluZ3NEYWlseVN1bW1hcmllc0NyZWF0aW9uID0gYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgIC8qKlxuICAgICAqIFRoZSBvdmVyYWxsIGRhaWx5IGVhcm5pbmdzIHN1bW1hcnkgY3JvbiB0cmlnZ2VyaW5nLCB3aWxsIGJlIG1hZGUgdXAgb2YgdGhlIGZvbGxvd2luZyBzdGVwczpcbiAgICAgKlxuICAgICAqIDEpIFdlIHdhbnQgdG8gZ2V0IHRoZSBwcmV2aW91cyBkYXkncyBkYXRlLCBhbmQgc2V0IHRoYXQgYXMgb3VyIHRhcmdldCBkYXRlIGluIHRoZSBuZXh0IHN0ZXAuXG4gICAgICogMikgQ2FsbCB0aGUgY3JlYXRlRGFpbHlFYXJuaW5nc1N1bW1hcnkgQXBwU3luYyBNdXRhdGlvbiBBUEkgaW4gb3JkZXIgdG8gZGV0ZXJtaW5lIHdoaWNoIHVzZXJzXG4gICAgICogc3BlbnQgaW4gdGhlIHByZXZpb3VzIGRheSwgYW5kIGNyZWF0ZSBhIHN1bW1hcnkgZm9yIHRoZW0uXG4gICAgICogMykgQ3JlYXRlIGEgbWFwIG9mIHVzZXJzIG9idGFpbmVkIGZyb20gZGFpbHkgZWFybmluZ3Mgc3VtbWFyaWVzIGNyZWF0ZWQgYW5kIHRoZVxuICAgICAqIFtkYWlseUVhcm5pbmdzU3VtbWFyeUFtb3VudHMsIHRyYW5zYWN0aW9uc10gZnJvbSB0aGUgZGFpbHkgZWFybmluZ3Mgc3VtbWFyaWVzIGNyZWF0ZWQuXG4gICAgICogNCkgQ2FsbCB0aGUgZ2V0VXNlck5vdGlmaWNhdGlvbkFzc2V0cyBBcHBTeW5jIFF1ZXJ5IEFQSSwgaW4gb3JkZXIgdG8gZ2V0IGEgbGlzdCBvZiB0aGUgZW1haWxzIGFuZCBwdXNoIHRva2Vuc1xuICAgICAqIGZvciB0aGUgbGlzdCBvZiB1c2VycyBmcm9tIHN0ZXAgMykuXG4gICAgICogNSkgQ3JlYXRlIGEgbGlzdCBvZiBlbWFpbE5vdGlmaWNhdGlvbnMgYW5kIGEgbGlzdCBvZiBwdXNoTm90aWZpY2F0aW9ucyB0byBiZSB1c2VkIGluIHNlbmRpbmcgYnVsayBub3RpZmljYXRpb25zLlxuICAgICAqXG4gICAgICogRm9yIHRoZSBmb2xsb3dpbmcgc3RlcHMgd2Ugd2lsbCBjaHVuayB0aGUgcmVxdWVzdHMgaW4gY2h1bmtzIG9mIDI1MCBpdGVtcywgc28gd2UgY2FuIGZpdCBldmVyeXRoaW5nIGluIHRoZSBMYW1iZGEgcmVxdWVzdHNcbiAgICAgKiA2KSBDYWxsIHRoZSBjcmVhdGVCdWxrTm90aWZpY2F0aW9uIGZvciBlbWFpbHMuXG4gICAgICogNykgQ2FsbCB0aGUgY3JlYXRlQnVsa05vdGlmaWNhdGlvbiBmb3IgcHVzaCBub3RpZmljYXRpb25zLlxuICAgICAqXG4gICAgICovXG4gICAgdHJ5IHtcbiAgICAgICAgLy8gcmV0cmlldmluZyB0aGUgY3VycmVudCBmdW5jdGlvbiByZWdpb25cbiAgICAgICAgY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiE7XG5cbiAgICAgICAgLy8gMSkgV2Ugd2FudCB0byBnZXQgdGhlIHByZXZpb3VzIGRheSdzIGRhdGUsIGFuZCBzZXQgdGhhdCBhcyBvdXIgdGFyZ2V0IGRhdGUgaW4gdGhlIG5leHQgc3RlcC5cbiAgICAgICAgY29uc3QgdG9kYXlEYXRlID0gbmV3IERhdGUoKTtcbiAgICAgICAgY29uc3QgdGFyZ2V0RGF0ZSA9IG5ldyBEYXRlKCk7XG5cbiAgICAgICAgLy8gc2V0IHRoZSB0YXJnZXREYXRlIGFzIHllc3RlcmRheSdzIGRhdGUgYXQgMDA6MDA6MDAuMDAwWlxuICAgICAgICB0YXJnZXREYXRlLnNldERhdGUodG9kYXlEYXRlLmdldERhdGUoKSAtIDEpO1xuICAgICAgICB0YXJnZXREYXRlLnNldEhvdXJzKDApO1xuICAgICAgICB0YXJnZXREYXRlLnNldE1pbnV0ZXMoMCk7XG4gICAgICAgIHRhcmdldERhdGUuc2V0U2Vjb25kcygwKTtcbiAgICAgICAgdGFyZ2V0RGF0ZS5zZXRNaWxsaXNlY29uZHMoMCk7XG5cbiAgICAgICAgLy8gaW5pdGlhbGl6ZSB0aGUgTW9vbmJlYW0gQ2xpZW50IEFQSSBoZXJlLCBpbiBvcmRlciB0byBjYWxsIHRoZSBhcHByb3ByaWF0ZSBlbmRwb2ludHMgZm9yIHRoaXMgaGFuZGxlclxuICAgICAgICBjb25zdCBtb29uYmVhbUNsaWVudCA9IG5ldyBNb29uYmVhbUNsaWVudChwcm9jZXNzLmVudi5FTlZfTkFNRSEsIHJlZ2lvbik7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIDIpIENhbGwgdGhlIGNyZWF0ZURhaWx5RWFybmluZ3NTdW1tYXJ5IEFwcFN5bmMgTXV0YXRpb24gQVBJIGluIG9yZGVyIHRvIGRldGVybWluZSB3aGljaCB1c2Vyc1xuICAgICAgICAgKiBzcGVudCBpbiB0aGUgcHJldmlvdXMgZGF5LCBhbmQgY3JlYXRlIGEgc3VtbWFyeSBmb3IgdGhlbS5cbiAgICAgICAgICovXG4gICAgICAgIGNvbnN0IGRhaWx5RWFybmluZ3NTdW1tYXJ5UmVzcG9uc2U6IERhaWx5RWFybmluZ3NTdW1tYXJ5UmVzcG9uc2UgPSBhd2FpdCBtb29uYmVhbUNsaWVudC5jcmVhdGVEYWlseUVhcm5pbmdzU3VtbWFyeSh7XG4gICAgICAgICAgICB0YXJnZXREYXRlOiBuZXcgRGF0ZSh0YXJnZXREYXRlLnNldFVUQ0hvdXJzKDAsIDAsIDAsIDApKS50b0lTT1N0cmluZygpXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIG1ha2Ugc3VyZSB0aGF0IGNyZWF0aW5nIHRoZSBkYWlseSBlYXJuaW5ncyBzdW1tYXJpZXMgY2FsbCB3YXMgc3VjY2Vzc2Z1bCBvciBub3RcbiAgICAgICAgaWYgKGRhaWx5RWFybmluZ3NTdW1tYXJ5UmVzcG9uc2UgJiYgIWRhaWx5RWFybmluZ3NTdW1tYXJ5UmVzcG9uc2UuZXJyb3JNZXNzYWdlICYmICFkYWlseUVhcm5pbmdzU3VtbWFyeVJlc3BvbnNlLmVycm9yVHlwZSAmJlxuICAgICAgICAgICAgZGFpbHlFYXJuaW5nc1N1bW1hcnlSZXNwb25zZS5kYXRhICYmIGRhaWx5RWFybmluZ3NTdW1tYXJ5UmVzcG9uc2UuZGF0YS5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogMykgQ3JlYXRlIGEgbWFwIG9mIHVzZXJzIG9idGFpbmVkIGZyb20gZGFpbHkgZWFybmluZ3Mgc3VtbWFyaWVzIGNyZWF0ZWQgYW5kIHRoZVxuICAgICAgICAgICAgICogW2RhaWx5RWFybmluZ3NTdW1tYXJ5QW1vdW50cywgdHJhbnNhY3Rpb25zXSBmcm9tIHRoZSBkYWlseSBlYXJuaW5ncyBzdW1tYXJpZXMgY3JlYXRlZC5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgY29uc3Qgc3VtbWFyaWVzTWFwOiBNYXA8c3RyaW5nLCBbbnVtYmVyLCBNb29uYmVhbVRyYW5zYWN0aW9uW11dPiA9IG5ldyBNYXA8c3RyaW5nLCBbbnVtYmVyLCBNb29uYmVhbVRyYW5zYWN0aW9uW11dPigpO1xuICAgICAgICAgICAgLy8gYnVpbGQgb3V0IGEgbGlzdCBvZiBpZHMgZm9yIGZhc3RlciByZXRyaWV2YWxcbiAgICAgICAgICAgIGNvbnN0IHVzZXJJZHM6IHN0cmluZ1tdID0gW107XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGRhaWx5RWFybmluZ3NTdW1tYXJ5IG9mIGRhaWx5RWFybmluZ3NTdW1tYXJ5UmVzcG9uc2UuZGF0YSkge1xuICAgICAgICAgICAgICAgIGlmIChkYWlseUVhcm5pbmdzU3VtbWFyeSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBjb21wdXRlIHRoZSBkYWlseUVhcm5pbmdzU3VtbWFyeUFtb3VudCBmcm9tIHRoZSBzdW1tYXJ5IHRyYW5zYWN0aW9uc1xuICAgICAgICAgICAgICAgICAgICBsZXQgZGFpbHlFYXJuaW5nc1N1bW1hcnlBbW91bnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICBkYWlseUVhcm5pbmdzU3VtbWFyeS50cmFuc2FjdGlvbnMuZm9yRWFjaCh0cmFuc2FjdGlvbiA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHJhbnNhY3Rpb24gIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYWlseUVhcm5pbmdzU3VtbWFyeUFtb3VudCArPSB0cmFuc2FjdGlvbi5yZXdhcmRBbW91bnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBkYWlseUVhcm5pbmdzU3VtbWFyeUFtb3VudCA9IE51bWJlcihkYWlseUVhcm5pbmdzU3VtbWFyeUFtb3VudC50b0ZpeGVkKDIpKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gc3RvcmUgdGhpcyBpbiB0aGUgbWFwIGFjY29yZGluZ2x5XG4gICAgICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgICAgICAgICAgc3VtbWFyaWVzTWFwLnNldChkYWlseUVhcm5pbmdzU3VtbWFyeS5pZCwgW2RhaWx5RWFybmluZ3NTdW1tYXJ5QW1vdW50LCBkYWlseUVhcm5pbmdzU3VtbWFyeS50cmFuc2FjdGlvbnNdKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gc3RvcmUgdGhlIGlkIGluIHRoZSBsaXN0IG9mIHVzZXJJZHMgZm9yIGZhc3RlciByZXRyaWV2YWxcbiAgICAgICAgICAgICAgICAgICAgdXNlcklkcy5wdXNoKGRhaWx5RWFybmluZ3NTdW1tYXJ5LmlkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogNCkgQ2FsbCB0aGUgZ2V0VXNlck5vdGlmaWNhdGlvbkFzc2V0cyBBcHBTeW5jIFF1ZXJ5IEFQSSwgaW4gb3JkZXIgdG8gZ2V0IGEgbGlzdCBvZiB0aGUgZW1haWxzIGFuZCBwdXNoIHRva2Vuc1xuICAgICAgICAgICAgICogZm9yIHRoZSBsaXN0IG9mIHVzZXJzIGZyb20gc3RlcCAzKS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgY29uc3QgdXNlck5vdGlmaWNhdGlvbkFzc2V0c1Jlc3BvbnNlOiBVc2VyTm90aWZpY2F0aW9uQXNzZXRzUmVzcG9uc2UgPSBhd2FpdCBtb29uYmVhbUNsaWVudC5nZXRVc2VyTm90aWZpY2F0aW9uQXNzZXRzKHtcbiAgICAgICAgICAgICAgICBpZExpc3Q6IHVzZXJJZHNcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBtYWtlIHN1cmUgdGhhdCB0aGUgZ2V0IHVzZXIgbm90aWZpY2F0aW9uIGFzc2V0cyBjYWxsIHdhcyBzdWNjZXNzZnVsIG9yIG5vdFxuICAgICAgICAgICAgaWYgKHVzZXJOb3RpZmljYXRpb25Bc3NldHNSZXNwb25zZSAmJiAhdXNlck5vdGlmaWNhdGlvbkFzc2V0c1Jlc3BvbnNlLmVycm9yTWVzc2FnZSAmJiAhdXNlck5vdGlmaWNhdGlvbkFzc2V0c1Jlc3BvbnNlLmVycm9yVHlwZSAmJlxuICAgICAgICAgICAgICAgIHVzZXJOb3RpZmljYXRpb25Bc3NldHNSZXNwb25zZS5kYXRhICYmIHVzZXJOb3RpZmljYXRpb25Bc3NldHNSZXNwb25zZS5kYXRhLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgICAgIC8vIDUpIENyZWF0ZSBhIGxpc3Qgb2YgZW1haWxOb3RpZmljYXRpb25zIGFuZCBhIGxpc3Qgb2YgcHVzaE5vdGlmaWNhdGlvbnMgdG8gYmUgdXNlZCBpbiBzZW5kaW5nIGJ1bGsgbm90aWZpY2F0aW9ucy5cbiAgICAgICAgICAgICAgICBjb25zdCBidWxrRW1haWxOb3RpZmljYXRpb25zOiBDcmVhdGVOb3RpZmljYXRpb25JbnB1dFtdID0gW107XG4gICAgICAgICAgICAgICAgY29uc3QgYnVsa01vYmlsZVB1c2hOb3RpZmljYXRpb25zOiBDcmVhdGVOb3RpZmljYXRpb25JbnB1dFtdID0gW107XG4gICAgICAgICAgICAgICAgc3VtbWFyaWVzTWFwLmZvckVhY2goKHZhbHVlLCB1c2VySWQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIGNvcnJlc3BvbmRpbmcgdXNlcidzIG5vdGlmaWNhdGlvbiBkZXRhaWxzXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRhaWx5RWFybmluZ3NTdW1tYXJ5QW1vdW50OiBudW1iZXIgPSB2YWx1ZVswXTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdHJhbnNhY3Rpb25zOiBNb29uYmVhbVRyYW5zYWN0aW9uW10gPSB2YWx1ZVsxXTtcblxuICAgICAgICAgICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgY29ycmVzcG9uZGluZyB1c2VyJ3Mgbm90aWZpY2F0aW9uIGFzc2V0c1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB1c2VyTm90aWZpY2F0aW9uQXNzZXRzID0gdXNlck5vdGlmaWNhdGlvbkFzc2V0c1Jlc3BvbnNlLmRhdGEhLmZpbHRlcihub3RpZmljYXRpb25Bc3NldHMgPT4gbm90aWZpY2F0aW9uQXNzZXRzICE9PSBudWxsICYmIG5vdGlmaWNhdGlvbkFzc2V0cy5pZCA9PT0gdXNlcklkKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHVzZXJOb3RpZmljYXRpb25Bc3NldHMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjcmVhdGUgdGhlIGJ1bGsgZW1haWwgbm90aWZpY2F0aW9uIGxpc3RcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld0J1bGtFbWFpbE5vdGlmaWNhdGlvbjogQ3JlYXRlTm90aWZpY2F0aW9uSW5wdXQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHVzZXJJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFubmVsVHlwZTogTm90aWZpY2F0aW9uQ2hhbm5lbFR5cGUuRW1haWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiBOb3RpZmljYXRpb25TdGF0dXMuU2VudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBOb3RpZmljYXRpb25UeXBlLkRhaWx5RWFybmluZ3NTdW1tYXJ5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhaWx5RWFybmluZ3NTdW1tYXJ5QW1vdW50OiBkYWlseUVhcm5pbmdzU3VtbWFyeUFtb3VudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbWFpbERlc3RpbmF0aW9uOiB1c2VyTm90aWZpY2F0aW9uQXNzZXRzWzBdIS5lbWFpbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbnM6IHRyYW5zYWN0aW9ucyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VyRnVsbE5hbWU6ICdQbGFjZWhvbGRlciBOYW1lJyAvLyBmb3Igbm93LCB3ZSBkbyBub3QgbmVlZCBuYW1lcyBmb3IgdGhpcyB0eXBlIG9mIG5vdGlmaWNhdGlvbiBzbyB3ZSBqdXN0IHB1dCBhIHBsYWNlaG9sZGVyIGhlcmUgaW5zdGVhZFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgYnVsa0VtYWlsTm90aWZpY2F0aW9ucy5wdXNoKG5ld0J1bGtFbWFpbE5vdGlmaWNhdGlvbik7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNyZWF0ZSB0aGUgYnVsayBtb2JpbGUgcHVzaCBub3RpZmljYXRpb24gbGlzdFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV3TW9iaWxlUHVzaE5vdGlmaWNhdGlvbjogQ3JlYXRlTm90aWZpY2F0aW9uSW5wdXQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHVzZXJJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFubmVsVHlwZTogTm90aWZpY2F0aW9uQ2hhbm5lbFR5cGUuUHVzaCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IE5vdGlmaWNhdGlvblN0YXR1cy5TZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IE5vdGlmaWNhdGlvblR5cGUuRGFpbHlFYXJuaW5nc1N1bW1hcnksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGFpbHlFYXJuaW5nc1N1bW1hcnlBbW91bnQ6IGRhaWx5RWFybmluZ3NTdW1tYXJ5QW1vdW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cG9QdXNoVG9rZW5zOiBbdXNlck5vdGlmaWNhdGlvbkFzc2V0c1swXSEucHVzaFRva2VuXVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgYnVsa01vYmlsZVB1c2hOb3RpZmljYXRpb25zLnB1c2gobmV3TW9iaWxlUHVzaE5vdGlmaWNhdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vIEJ1bGsgRW1haWw6IEZvciB0aGUgZm9sbG93aW5nIHN0ZXBzIHdlIHdpbGwgY2h1bmsgdGhlIHJlcXVlc3RzIGluIGNodW5rcyBvZiAyNTAgaXRlbXMsIHNvIHdlIGNhbiBmaXQgZXZlcnl0aGluZyBpbiB0aGUgTGFtYmRhIHJlcXVlc3RzXG4gICAgICAgICAgICAgICAgbGV0IGJ1bGtFbWFpbENvdW50ZXIgPSAwO1xuICAgICAgICAgICAgICAgIHdoaWxlIChidWxrRW1haWxOb3RpZmljYXRpb25zLnNsaWNlKGJ1bGtFbWFpbENvdW50ZXIsIGJ1bGtFbWFpbENvdW50ZXIgKyAyNTApLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBidWxrRW1haWxOb3RpZmljYXRpb25zU2xpY2VkID0gYnVsa0VtYWlsTm90aWZpY2F0aW9ucy5zbGljZShidWxrRW1haWxDb3VudGVyLCBidWxrRW1haWxDb3VudGVyICsgMjUwKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyA2KSBDYWxsIHRoZSBjcmVhdGVCdWxrTm90aWZpY2F0aW9uIGZvciBlbWFpbHMuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNyZWF0ZUJ1bGtFbWFpbE5vdGlmaWNhdGlvblJlc3BvbnNlOiBDcmVhdGVCdWxrTm90aWZpY2F0aW9uUmVzcG9uc2UgPSBhd2FpdCBtb29uYmVhbUNsaWVudC5jcmVhdGVCdWxrTm90aWZpY2F0aW9uKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IE5vdGlmaWNhdGlvblR5cGUuRGFpbHlFYXJuaW5nc1N1bW1hcnksXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGFubmVsVHlwZTogTm90aWZpY2F0aW9uQ2hhbm5lbFR5cGUuRW1haWwsXG4gICAgICAgICAgICAgICAgICAgICAgICBidWxrTm90aWZpY2F0aW9uczogYnVsa0VtYWlsTm90aWZpY2F0aW9uc1NsaWNlZFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgLy8gbWFrZSBzdXJlIHRoYXQgdGhpcyBidWxrIG5vdGlmaWNhdGlvbiBjYWxsIHdhcyBzdWNjZXNzZnVsXG4gICAgICAgICAgICAgICAgICAgIGlmIChjcmVhdGVCdWxrRW1haWxOb3RpZmljYXRpb25SZXNwb25zZSAmJiAhY3JlYXRlQnVsa0VtYWlsTm90aWZpY2F0aW9uUmVzcG9uc2UuZXJyb3JNZXNzYWdlICYmICFjcmVhdGVCdWxrRW1haWxOb3RpZmljYXRpb25SZXNwb25zZS5lcnJvclR5cGUgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZUJ1bGtFbWFpbE5vdGlmaWNhdGlvblJlc3BvbnNlLmRhdGEgJiYgY3JlYXRlQnVsa0VtYWlsTm90aWZpY2F0aW9uUmVzcG9uc2UuZGF0YS5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBCdWxrIGVtYWlsIG5vdGlmaWNhdGlvbiBzdWNjZXNzZnVsbHkgY3JlYXRlZCBmb3IgJHtOb3RpZmljYXRpb25UeXBlLkRhaWx5RWFybmluZ3NTdW1tYXJ5fSBmb3IgJHtidWxrRW1haWxOb3RpZmljYXRpb25zU2xpY2VkLmxlbmd0aH0gbm90aWZpY2F0aW9ucyFgKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogbm8gbmVlZCBmb3IgZnVydGhlciBhY3Rpb25zLCBzaW5jZSB0aGlzIGVycm9yIHdpbGwgYmUgbG9nZ2VkIGFuZCBub3RoaW5nIHdpbGwgZXhlY3V0ZSBmdXJ0aGVyLlxuICAgICAgICAgICAgICAgICAgICAgICAgICogaW4gdGhlIGZ1dHVyZSB3ZSBtaWdodCBuZWVkIHNvbWUgYWxlcnRzIGFuZCBtZXRyaWNzIGVtaXR0aW5nIGhlcmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYENyZWF0aW5nIGEgYnVsayBlbWFpbCBub3RpZmljYXRpb24gY2FsbCB0aHJvdWdoIHRoZSBjcmVhdGVCdWxrTm90aWZpY2F0aW9uIGNhbGwgZmFpbGVkYDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnVsa0VtYWlsQ291bnRlciArPSAyNTA7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gTW9iaWxlIFB1c2g6IEZvciB0aGUgZm9sbG93aW5nIHN0ZXBzIHdlIHdpbGwgY2h1bmsgdGhlIHJlcXVlc3RzIGluIGNodW5rcyBvZiAyNTAgaXRlbXMsIHNvIHdlIGNhbiBmaXQgZXZlcnl0aGluZyBpbiB0aGUgTGFtYmRhIHJlcXVlc3RzXG4gICAgICAgICAgICAgICAgbGV0IGJ1bGtNb2JpbGVQdXNoQ291bnRlciA9IDA7XG4gICAgICAgICAgICAgICAgd2hpbGUgKGJ1bGtNb2JpbGVQdXNoTm90aWZpY2F0aW9ucy5zbGljZShidWxrTW9iaWxlUHVzaENvdW50ZXIsIGJ1bGtNb2JpbGVQdXNoQ291bnRlciArIDI1MCkubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGJ1bGtNb2JpbGVQdXNoTm90aWZpY2F0aW9uc1NsaWNlZCA9IGJ1bGtNb2JpbGVQdXNoTm90aWZpY2F0aW9ucy5zbGljZShidWxrTW9iaWxlUHVzaENvdW50ZXIsIGJ1bGtNb2JpbGVQdXNoQ291bnRlciArIDI1MCk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gNykgQ2FsbCB0aGUgY3JlYXRlQnVsa05vdGlmaWNhdGlvbiBmb3IgcHVzaCBub3RpZmljYXRpb25zLlxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjcmVhdGVCdWxrTW9iaWxlUHVzaE5vdGlmaWNhdGlvblJlc3BvbnNlOiBDcmVhdGVCdWxrTm90aWZpY2F0aW9uUmVzcG9uc2UgPSBhd2FpdCBtb29uYmVhbUNsaWVudC5jcmVhdGVCdWxrTm90aWZpY2F0aW9uKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IE5vdGlmaWNhdGlvblR5cGUuRGFpbHlFYXJuaW5nc1N1bW1hcnksXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGFubmVsVHlwZTogTm90aWZpY2F0aW9uQ2hhbm5lbFR5cGUuUHVzaCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1bGtOb3RpZmljYXRpb25zOiBidWxrTW9iaWxlUHVzaE5vdGlmaWNhdGlvbnNTbGljZWRcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIC8vIG1ha2Ugc3VyZSB0aGF0IHRoaXMgYnVsayBub3RpZmljYXRpb24gY2FsbCB3YXMgc3VjY2Vzc2Z1bFxuICAgICAgICAgICAgICAgICAgICBpZiAoY3JlYXRlQnVsa01vYmlsZVB1c2hOb3RpZmljYXRpb25SZXNwb25zZSAmJiAhY3JlYXRlQnVsa01vYmlsZVB1c2hOb3RpZmljYXRpb25SZXNwb25zZS5lcnJvck1lc3NhZ2UgJiYgIWNyZWF0ZUJ1bGtNb2JpbGVQdXNoTm90aWZpY2F0aW9uUmVzcG9uc2UuZXJyb3JUeXBlICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVCdWxrTW9iaWxlUHVzaE5vdGlmaWNhdGlvblJlc3BvbnNlLmRhdGEgJiYgY3JlYXRlQnVsa01vYmlsZVB1c2hOb3RpZmljYXRpb25SZXNwb25zZS5kYXRhLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYEJ1bGsgbW9iaWxlIHB1c2ggbm90aWZpY2F0aW9uIHN1Y2Nlc3NmdWxseSBjcmVhdGVkIGZvciAke05vdGlmaWNhdGlvblR5cGUuRGFpbHlFYXJuaW5nc1N1bW1hcnl9IGZvciAke2J1bGtNb2JpbGVQdXNoTm90aWZpY2F0aW9uc1NsaWNlZC5sZW5ndGh9IG5vdGlmaWNhdGlvbnMhYCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIG5vIG5lZWQgZm9yIGZ1cnRoZXIgYWN0aW9ucywgc2luY2UgdGhpcyBlcnJvciB3aWxsIGJlIGxvZ2dlZCBhbmQgbm90aGluZyB3aWxsIGV4ZWN1dGUgZnVydGhlci5cbiAgICAgICAgICAgICAgICAgICAgICAgICAqIGluIHRoZSBmdXR1cmUgd2UgbWlnaHQgbmVlZCBzb21lIGFsZXJ0cyBhbmQgbWV0cmljcyBlbWl0dGluZyBoZXJlXG4gICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBDcmVhdGluZyBhIGJ1bGsgbW9iaWxlIHB1c2ggbm90aWZpY2F0aW9uIGNhbGwgdGhyb3VnaCB0aGUgY3JlYXRlQnVsa05vdGlmaWNhdGlvbiBjYWxsIGZhaWxlZGA7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgYnVsa01vYmlsZVB1c2hDb3VudGVyICs9IDI1MDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIG5vIG5lZWQgZm9yIGZ1cnRoZXIgYWN0aW9ucywgc2luY2UgdGhpcyBlcnJvciB3aWxsIGJlIGxvZ2dlZCBhbmQgbm90aGluZyB3aWxsIGV4ZWN1dGUgZnVydGhlci5cbiAgICAgICAgICAgICAgICAgKiBpbiB0aGUgZnV0dXJlIHdlIG1pZ2h0IG5lZWQgc29tZSBhbGVydHMgYW5kIG1ldHJpY3MgZW1pdHRpbmcgaGVyZVxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBSZXRyaWV2aW5nIHVzZXIgbm90aWZpY2F0aW9uIGFzc2V0cyB0aHJvdWdoIHRoZSBnZXRVc2VyTm90aWZpY2F0aW9uQXNzZXRzIGNhbGwgZmFpbGVkYDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gY2hlY2sgaWYgdGhlcmUgYXJlIG5vIGRhaWx5IHN1bW1hcmllcyBuZWVkZWQgdG8gZ2V0IGdlbmVyYXRlZCBmaXJzdFxuICAgICAgICAgICAgaWYgKGRhaWx5RWFybmluZ3NTdW1tYXJ5UmVzcG9uc2UuZXJyb3JUeXBlICYmIGRhaWx5RWFybmluZ3NTdW1tYXJ5UmVzcG9uc2UuZXJyb3JUeXBlID09PSBEYWlseVN1bW1hcnlFcnJvclR5cGUuTm9uZU9yQWJzZW50ICYmXG4gICAgICAgICAgICAgICAgZGFpbHlFYXJuaW5nc1N1bW1hcnlSZXNwb25zZS5kYXRhICYmIGRhaWx5RWFybmluZ3NTdW1tYXJ5UmVzcG9uc2UuZGF0YS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiBubyBuZWVkIGZvciBmdXJ0aGVyIGFjdGlvbnMsIHNpbmNlIHRoaXMgZXJyb3Igd2lsbCBiZSBsb2dnZWQgYW5kIG5vdGhpbmcgd2lsbCBleGVjdXRlIGZ1cnRoZXIuXG4gICAgICAgICAgICAgICAgICogaW4gdGhlIGZ1dHVyZSB3ZSBtaWdodCBuZWVkIHNvbWUgYWxlcnRzIGFuZCBtZXRyaWNzIGVtaXR0aW5nIGhlcmVcbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgQ3JlYXRpbmcgZGFpbHkgc3VtbWFyaWVzIHRocm91Z2ggdGhlIGNyZWF0ZURhaWx5RWFybmluZ3NTdW1tYXJ5IGNhbGwgZmFpbGVkYDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiBubyBuZWVkIGZvciBmdXJ0aGVyIGFjdGlvbnMsIHNpbmNlIHRoaXMgZXJyb3Igd2lsbCBiZSBsb2dnZWQgYW5kIG5vdGhpbmcgd2lsbCBleGVjdXRlIGZ1cnRoZXIuXG4gICAgICAgICAgICAgICAgICogaW4gdGhlIGZ1dHVyZSB3ZSBtaWdodCBuZWVkIHNvbWUgYWxlcnRzIGFuZCBtZXRyaWNzIGVtaXR0aW5nIGhlcmVcbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgQ3JlYXRpbmcgZGFpbHkgc3VtbWFyaWVzIHRocm91Z2ggdGhlIGNyZWF0ZURhaWx5RWFybmluZ3NTdW1tYXJ5IGNhbGwgZmFpbGVkYDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBjYXRjaFxuICAgICAgICAoZXJyb3IpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIG5vIG5lZWQgZm9yIGZ1cnRoZXIgYWN0aW9ucywgc2luY2UgdGhpcyBlcnJvciB3aWxsIGJlIGxvZ2dlZCBhbmQgbm90aGluZyB3aWxsIGV4ZWN1dGUgZnVydGhlci5cbiAgICAgICAgICogaW4gdGhlIGZ1dHVyZSB3ZSBtaWdodCBuZWVkIHNvbWUgYWxlcnRzIGFuZCBtZXRyaWNzIGVtaXR0aW5nIGhlcmVcbiAgICAgICAgICovXG4gICAgICAgIGNvbnNvbGUubG9nKGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHByb2Nlc3NpbmcgdGhlIGRhaWx5IGVhcm5pbmdzIHN1bW1hcnkgY3JvbiBldmVudCAke2Vycm9yfWApO1xuICAgIH1cbn1cbiJdfQ==