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
        const region = process.env.AWS_REGION;
        // 1) We want to get the previous day's date, and set that as our target date in the next step.
        const todayDate = new Date();
        const targetDate = new Date();
        // set the targetDate as yesterday's date at 00:00:00.0000Z
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
            targetDate: targetDate.toISOString()
        });
        // make sure that creating the daily earnings summaries call was successful or not
        if (dailyEarningsSummaryResponse && !dailyEarningsSummaryResponse.errorMessage && !dailyEarningsSummaryResponse.errorType &&
            dailyEarningsSummaryResponse.data && dailyEarningsSummaryResponse.data.length !== 0) {
            // For each one of the summary reports created that day proceed to steps 3,4,5,6 and 7
            for (const dailyEarningsSummary of dailyEarningsSummaryResponse.data) {
                // ToDo: remove once we roll it out to everyone
                if (dailyEarningsSummary !== null && dailyEarningsSummary.id === 'e1a6afb2-ff4c-40d0-9f4b-b83396b0a966') {
                    // 3) Call the getDevicesForUser Moonbeam Appsync API endpoint.
                    const devicesForUserResponse = await moonbeamClient.getDevicesForUser({
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
                            devicesForUserResponse.errorType === moonbeam_models_1.UserDeviceErrorType.NoneOrAbsent)) {
                        const deviceTokenIds = [];
                        if (devicesForUserResponse && devicesForUserResponse.errorType !== null && devicesForUserResponse.errorType !== undefined &&
                            devicesForUserResponse.errorType === moonbeam_models_1.UserDeviceErrorType.NoneOrAbsent) {
                            console.log(`No physical devices found for user ${dailyEarningsSummary.id}`);
                        }
                        else {
                            if (devicesForUserResponse.data !== null && devicesForUserResponse.data !== undefined) {
                                // 4) Filter obtained devices based on their status (only consider the ones that are ACTIVE for the user).
                                for (const userDevice of devicesForUserResponse.data) {
                                    userDevice.deviceState === moonbeam_models_1.UserDeviceState.Active && deviceTokenIds.push(userDevice.tokenId);
                                }
                            }
                        }
                        // 5) Retrieve the email of a user based on their userId.
                        const emailFromUserInformationResponse = await moonbeamClient.getEmailByUserId(dailyEarningsSummary.id);
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
                            // 6) Call the createNotification Moonbeam AppSync API endpoint to create an email notification for the daily earnings summary update
                            const createEmailNotificationResponse = await moonbeamClient.createNotification({
                                id: dailyEarningsSummary.id,
                                type: moonbeam_models_1.NotificationType.DailyEarningsSummary,
                                channelType: moonbeam_models_1.NotificationChannelType.Email,
                                userFullName: `Placeholder`,
                                emailDestination: emailFromUserInformationResponse.data,
                                dailyEarningsSummaryAmount: dailyEarningsSummaryAmount,
                                transactions: dailyEarningsSummary.transactions,
                                status: moonbeam_models_1.NotificationStatus.Sent
                            });
                            // check to see if the email notification call was successful or not
                            if (createEmailNotificationResponse && !createEmailNotificationResponse.errorMessage && !createEmailNotificationResponse.errorType && createEmailNotificationResponse.data) {
                                console.log(`Notification email event successfully processed, with notification id ${createEmailNotificationResponse.data.notificationId}`);
                                // if there are user associated physical devices that are active, to send notifications to, then proceed accordingly
                                if (deviceTokenIds.length !== 0) {
                                    // 7) Call the createNotification Moonbeam AppSync API endpoint to create a push notification for the daily earnings summary update
                                    const createPushNotificationResponse = await moonbeamClient.createNotification({
                                        id: dailyEarningsSummary.id,
                                        type: moonbeam_models_1.NotificationType.DailyEarningsSummary,
                                        expoPushTokens: deviceTokenIds,
                                        channelType: moonbeam_models_1.NotificationChannelType.Push,
                                        dailyEarningsSummaryAmount: dailyEarningsSummaryAmount,
                                        status: moonbeam_models_1.NotificationStatus.Sent
                                    });
                                    // check to see if the email notification call was successful or not
                                    if (createPushNotificationResponse && !createPushNotificationResponse.errorMessage && !createPushNotificationResponse.errorType && createPushNotificationResponse.data) {
                                        console.log(`Notification push event successfully processed, with notification id ${createPushNotificationResponse.data.notificationId}`);
                                    }
                                    else {
                                        console.log(`Notification push event through Create Notification call failed`);
                                    }
                                }
                            }
                            else {
                                console.log(`Notification email event through Create Notification call failed`);
                            }
                        }
                        else {
                            console.log(`User email mapping through GET email for user call failed`);
                        }
                    }
                    else {
                        console.log(`Physical Devices mapping through GET devices for user call failed`);
                    }
                }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRWFybmluZ3NEYWlseVN1bW1hcnlUcmlnZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9oYW5kbGVycy9FYXJuaW5nc0RhaWx5U3VtbWFyeVRyaWdnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsK0RBWW1DO0FBRW5DOzs7Ozs7O0dBT0c7QUFDSSxNQUFNLHFDQUFxQyxHQUFHLEtBQUssSUFBbUIsRUFBRTtJQUMzRTs7Ozs7Ozs7Ozs7OztPQWFHO0lBQ0gsSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2QywrRkFBK0Y7UUFDL0YsTUFBTSxTQUFTLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUM3QixNQUFNLFVBQVUsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1FBRTlCLDJEQUEyRDtRQUMzRCxVQUFVLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUM1QyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZCLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekIsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN6QixVQUFVLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTlCLHVHQUF1RztRQUN2RyxNQUFNLGNBQWMsR0FBRyxJQUFJLGdDQUFjLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFFekU7OztXQUdHO1FBQ0gsTUFBTSw0QkFBNEIsR0FBaUMsTUFBTSxjQUFjLENBQUMsMEJBQTBCLENBQUM7WUFDL0csVUFBVSxFQUFFLFVBQVUsQ0FBQyxXQUFXLEVBQUU7U0FDdkMsQ0FBQyxDQUFDO1FBRUgsa0ZBQWtGO1FBQ2xGLElB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Q0FDSCxPQUFPLENBQUMsR0FBRyxDQUFDLGlFQUFpRSxDQUFDLENBQUM7cUNBQ2xGO2lDQUNKOzZCQUNKO2lDQUFNO2dDQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsa0VBQWtFLENBQUMsQ0FBQzs2QkFDbkY7eUJBRUo7NkJBQU07NEJBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQywyREFBMkQsQ0FBQyxDQUFDO3lCQUM1RTtxQkFDSjt5QkFBTTt3QkFDSCxPQUFPLENBQUMsR0FBRyxDQUFDLG1FQUFtRSxDQUFDLENBQUM7cUJBQ3BGO2lCQUNKO2FBQ0o7U0FDSjthQUFNO1lBQ0gsc0VBQXNFO1lBQ3RFLElBQUksNEJBQTRCLENBQUMsU0FBUyxJQUFJLDRCQUE0QixDQUFDLFNBQVMsS0FBSyx1Q0FBcUIsQ0FBQyxZQUFZO2dCQUN2SCw0QkFBNEIsQ0FBQyxJQUFJLElBQUksNEJBQTRCLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQ3JGOzs7bUJBR0c7Z0JBQ0gsTUFBTSxZQUFZLEdBQUcsNkVBQTZFLENBQUM7Z0JBQ25HLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7YUFDN0I7aUJBQU07Z0JBQ0g7OzttQkFHRztnQkFDSCxNQUFNLFlBQVksR0FBRyw2RUFBNkUsQ0FBQztnQkFDbkcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQzthQUM3QjtTQUNKO0tBQ0o7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNaOzs7V0FHRztRQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsMkVBQTJFLEtBQUssRUFBRSxDQUFDLENBQUM7S0FDbkc7QUFDTCxDQUFDLENBQUE7QUFyS1ksUUFBQSxxQ0FBcUMseUNBcUtqRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gICAgQ3JlYXRlTm90aWZpY2F0aW9uUmVzcG9uc2UsXG4gICAgRGFpbHlFYXJuaW5nc1N1bW1hcnlSZXNwb25zZSxcbiAgICBEYWlseVN1bW1hcnlFcnJvclR5cGUsXG4gICAgRW1haWxGcm9tQ29nbml0b1Jlc3BvbnNlLFxuICAgIE1vb25iZWFtQ2xpZW50LFxuICAgIE5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlLFxuICAgIE5vdGlmaWNhdGlvblN0YXR1cyxcbiAgICBOb3RpZmljYXRpb25UeXBlLFxuICAgIFVzZXJEZXZpY2VFcnJvclR5cGUsXG4gICAgVXNlckRldmljZXNSZXNwb25zZSxcbiAgICBVc2VyRGV2aWNlU3RhdGVcbn0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcblxuLyoqXG4gKiBGdW5jdGlvbiB1c2VkIHRvIGhhbmRsZSB0aGUgZWFybmluZ3MgZGFpbHkgc3VtbWFyeSB0cmlnZ2VyLCBieSBkZXRlcm1pbmluZ1xuICogd2hpY2ggdXNlcnMgc3BlbnQgaW4gYSBwYXJ0aWN1bGFyIGRheSwgY3JlYXRpbmcgYSBzdW1tYXJ5IGZvciB0aGVtLCBhbmQgdGhlbiBzZW5kaW5nXG4gKiB0aGVtIGEgUFVTSCBhbmQgRU1BSUwgbm90aWZpY2F0aW9uLlxuICpcbiAqIEByZXR1cm5zIGEge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayB2b2lkfSwgc2luY2UgdGhlIEV2ZW50QnJpZGdlclxuICogZXZlbnQgdHJpZ2dlciwgd2lsbCBleGVjdXRlIGEgY3JvbiBqb2IgYW5kIG5vdCByZXR1cm4gYW55dGhpbmcuXG4gKi9cbmV4cG9ydCBjb25zdCB0cmlnZ2VyRWFybmluZ3NEYWlseVN1bW1hcmllc0NyZWF0aW9uID0gYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgIC8qKlxuICAgICAqIFRoZSBvdmVyYWxsIGRhaWx5IGVhcm5pbmdzIHN1bW1hcnkgY3JvbiB0cmlnZ2VyaW5nLCB3aWxsIGJlIG1hZGUgdXAgb2YgdGhlIGZvbGxvd2luZyBzdGVwczpcbiAgICAgKlxuICAgICAqIDEpIFdlIHdhbnQgdG8gZ2V0IHRoZSBwcmV2aW91cyBkYXkncyBkYXRlLCBhbmQgc2V0IHRoYXQgYXMgb3VyIHRhcmdldCBkYXRlIGluIHRoZSBuZXh0IHN0ZXAuXG4gICAgICogMikgQ2FsbCB0aGUgY3JlYXRlRGFpbHlFYXJuaW5nc1N1bW1hcnkgQXBwU3luYyBNdXRhdGlvbiBBUEkgaW4gb3JkZXIgdG8gZGV0ZXJtaW5lIHdoaWNoIHVzZXJzXG4gICAgICogc3BlbnQgaW4gdGhlIHByZXZpb3VzIGRheSwgYW5kIGNyZWF0ZSBhIHN1bW1hcnkgZm9yIHRoZW0uXG4gICAgICpcbiAgICAgKiBGb3IgZWFjaCBvbmUgb2YgdGhlIHN1bW1hcnkgcmVwb3J0cyBjcmVhdGVkIHRoYXQgZGF5OlxuICAgICAqIDMpIENhbGwgdGhlIGdldERldmljZXNGb3JVc2VyIE1vb25iZWFtIEFwcHN5bmMgQVBJIGVuZHBvaW50LlxuICAgICAqIDQpIEZpbHRlciBvYnRhaW5lZCBkZXZpY2VzIGJhc2VkIG9uIHRoZWlyIHN0YXR1cyAob25seSBjb25zaWRlciB0aGUgb25lcyB0aGF0IGFyZSBBQ1RJVkUgZm9yIHRoZSB1c2VyKS5cbiAgICAgKiA1KSBSZXRyaWV2ZSB0aGUgZW1haWwgb2YgYSB1c2VyIGJhc2VkIG9uIHRoZWlyIHVzZXJJZC5cbiAgICAgKiA2KSBDYWxsIHRoZSBjcmVhdGVOb3RpZmljYXRpb24gTW9vbmJlYW0gQXBwU3luYyBBUEkgZW5kcG9pbnQgdG8gY3JlYXRlIGFuIGVtYWlsIG5vdGlmaWNhdGlvbiBmb3IgdGhlIGRhaWx5IGVhcm5pbmdzIHN1bW1hcnkgdXBkYXRlLlxuICAgICAqIDcpIENhbGwgdGhlIGNyZWF0ZU5vdGlmaWNhdGlvbiBNb29uYmVhbSBBcHBTeW5jIEFQSSBlbmRwb2ludCB0byBjcmVhdGUgYSBwdXNoIG5vdGlmaWNhdGlvbiBmb3IgdGhlIGRhaWx5IGVhcm5pbmdzIHN1bW1hcnkgdXBkYXRlLlxuICAgICAqL1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgIC8vIDEpIFdlIHdhbnQgdG8gZ2V0IHRoZSBwcmV2aW91cyBkYXkncyBkYXRlLCBhbmQgc2V0IHRoYXQgYXMgb3VyIHRhcmdldCBkYXRlIGluIHRoZSBuZXh0IHN0ZXAuXG4gICAgICAgIGNvbnN0IHRvZGF5RGF0ZSA9IG5ldyBEYXRlKCk7XG4gICAgICAgIGNvbnN0IHRhcmdldERhdGUgPSBuZXcgRGF0ZSgpO1xuXG4gICAgICAgIC8vIHNldCB0aGUgdGFyZ2V0RGF0ZSBhcyB5ZXN0ZXJkYXkncyBkYXRlIGF0IDAwOjAwOjAwLjAwMDBaXG4gICAgICAgIHRhcmdldERhdGUuc2V0RGF0ZSh0b2RheURhdGUuZ2V0RGF0ZSgpIC0gMSk7XG4gICAgICAgIHRhcmdldERhdGUuc2V0SG91cnMoMCk7XG4gICAgICAgIHRhcmdldERhdGUuc2V0TWludXRlcygwKTtcbiAgICAgICAgdGFyZ2V0RGF0ZS5zZXRTZWNvbmRzKDApO1xuICAgICAgICB0YXJnZXREYXRlLnNldE1pbGxpc2Vjb25kcygwKTtcblxuICAgICAgICAvLyBpbml0aWFsaXplIHRoZSBNb29uYmVhbSBDbGllbnQgQVBJIGhlcmUsIGluIG9yZGVyIHRvIGNhbGwgdGhlIGFwcHJvcHJpYXRlIGVuZHBvaW50cyBmb3IgdGhpcyBoYW5kbGVyXG4gICAgICAgIGNvbnN0IG1vb25iZWFtQ2xpZW50ID0gbmV3IE1vb25iZWFtQ2xpZW50KHByb2Nlc3MuZW52LkVOVl9OQU1FISwgcmVnaW9uKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogMikgQ2FsbCB0aGUgY3JlYXRlRGFpbHlFYXJuaW5nc1N1bW1hcnkgQXBwU3luYyBNdXRhdGlvbiBBUEkgaW4gb3JkZXIgdG8gZGV0ZXJtaW5lIHdoaWNoIHVzZXJzXG4gICAgICAgICAqIHNwZW50IGluIHRoZSBwcmV2aW91cyBkYXksIGFuZCBjcmVhdGUgYSBzdW1tYXJ5IGZvciB0aGVtLlxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3QgZGFpbHlFYXJuaW5nc1N1bW1hcnlSZXNwb25zZTogRGFpbHlFYXJuaW5nc1N1bW1hcnlSZXNwb25zZSA9IGF3YWl0IG1vb25iZWFtQ2xpZW50LmNyZWF0ZURhaWx5RWFybmluZ3NTdW1tYXJ5KHtcbiAgICAgICAgICAgIHRhcmdldERhdGU6IHRhcmdldERhdGUudG9JU09TdHJpbmcoKVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBtYWtlIHN1cmUgdGhhdCBjcmVhdGluZyB0aGUgZGFpbHkgZWFybmluZ3Mgc3VtbWFyaWVzIGNhbGwgd2FzIHN1Y2Nlc3NmdWwgb3Igbm90XG4gICAgICAgIGlmIChkYWlseUVhcm5pbmdzU3VtbWFyeVJlc3BvbnNlICYmICFkYWlseUVhcm5pbmdzU3VtbWFyeVJlc3BvbnNlLmVycm9yTWVzc2FnZSAmJiAhZGFpbHlFYXJuaW5nc1N1bW1hcnlSZXNwb25zZS5lcnJvclR5cGUgJiZcbiAgICAgICAgICAgIGRhaWx5RWFybmluZ3NTdW1tYXJ5UmVzcG9uc2UuZGF0YSAmJiBkYWlseUVhcm5pbmdzU3VtbWFyeVJlc3BvbnNlLmRhdGEubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAvLyBGb3IgZWFjaCBvbmUgb2YgdGhlIHN1bW1hcnkgcmVwb3J0cyBjcmVhdGVkIHRoYXQgZGF5IHByb2NlZWQgdG8gc3RlcHMgMyw0LDUsNiBhbmQgN1xuICAgICAgICAgICAgZm9yIChjb25zdCBkYWlseUVhcm5pbmdzU3VtbWFyeSBvZiBkYWlseUVhcm5pbmdzU3VtbWFyeVJlc3BvbnNlLmRhdGEpIHtcbiAgICAgICAgICAgICAgICAvLyBUb0RvOiByZW1vdmUgb25jZSB3ZSByb2xsIGl0IG91dCB0byBldmVyeW9uZVxuICAgICAgICAgICAgICAgIGlmIChkYWlseUVhcm5pbmdzU3VtbWFyeSAhPT0gbnVsbCAmJiBkYWlseUVhcm5pbmdzU3VtbWFyeS5pZCA9PT0gJ2UxYTZhZmIyLWZmNGMtNDBkMC05ZjRiLWI4MzM5NmIwYTk2NicpIHtcblxuICAgICAgICAgICAgICAgICAgICAvLyAzKSBDYWxsIHRoZSBnZXREZXZpY2VzRm9yVXNlciBNb29uYmVhbSBBcHBzeW5jIEFQSSBlbmRwb2ludC5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZGV2aWNlc0ZvclVzZXJSZXNwb25zZTogVXNlckRldmljZXNSZXNwb25zZSA9IGF3YWl0IG1vb25iZWFtQ2xpZW50LmdldERldmljZXNGb3JVc2VyKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBkYWlseUVhcm5pbmdzU3VtbWFyeS5pZFxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogY2hlY2sgdG8gc2VlIGlmIHRoZSBnZXQgZGV2aWNlcyBmb3IgdXNlciBjYWxsIHdhcyBzdWNjZXNzZnVsIG9yIG5vdC5cbiAgICAgICAgICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAgICAgICAgICogd2UgYWxzbyBjb25zaWRlciB0aGUgZmFpbHVyZSBtZXNzYWdlLCBmb3IgdXNlcnMgd2l0aCBubyBwaHlzaWNhbCBkZXZpY2VzLiBJbiB0aGF0IGNhc2Ugd2Ugb25seSBzZW5kIGFuXG4gICAgICAgICAgICAgICAgICAgICAqIGVtYWlsLlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgaWYgKChkZXZpY2VzRm9yVXNlclJlc3BvbnNlICYmICFkZXZpY2VzRm9yVXNlclJlc3BvbnNlLmVycm9yTWVzc2FnZSAmJiAhZGV2aWNlc0ZvclVzZXJSZXNwb25zZS5lcnJvclR5cGUgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXZpY2VzRm9yVXNlclJlc3BvbnNlLmRhdGEgJiYgZGV2aWNlc0ZvclVzZXJSZXNwb25zZS5kYXRhLmxlbmd0aCAhPT0gMCkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIChkZXZpY2VzRm9yVXNlclJlc3BvbnNlICYmIGRldmljZXNGb3JVc2VyUmVzcG9uc2UuZXJyb3JUeXBlICE9PSBudWxsICYmIGRldmljZXNGb3JVc2VyUmVzcG9uc2UuZXJyb3JUeXBlICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXZpY2VzRm9yVXNlclJlc3BvbnNlLmVycm9yVHlwZSA9PT0gVXNlckRldmljZUVycm9yVHlwZS5Ob25lT3JBYnNlbnQpKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRldmljZVRva2VuSWRzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRldmljZXNGb3JVc2VyUmVzcG9uc2UgJiYgZGV2aWNlc0ZvclVzZXJSZXNwb25zZS5lcnJvclR5cGUgIT09IG51bGwgJiYgZGV2aWNlc0ZvclVzZXJSZXNwb25zZS5lcnJvclR5cGUgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRldmljZXNGb3JVc2VyUmVzcG9uc2UuZXJyb3JUeXBlID09PSBVc2VyRGV2aWNlRXJyb3JUeXBlLk5vbmVPckFic2VudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBObyBwaHlzaWNhbCBkZXZpY2VzIGZvdW5kIGZvciB1c2VyICR7ZGFpbHlFYXJuaW5nc1N1bW1hcnkuaWR9YCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkZXZpY2VzRm9yVXNlclJlc3BvbnNlLmRhdGEgIT09IG51bGwgJiYgZGV2aWNlc0ZvclVzZXJSZXNwb25zZS5kYXRhICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gNCkgRmlsdGVyIG9idGFpbmVkIGRldmljZXMgYmFzZWQgb24gdGhlaXIgc3RhdHVzIChvbmx5IGNvbnNpZGVyIHRoZSBvbmVzIHRoYXQgYXJlIEFDVElWRSBmb3IgdGhlIHVzZXIpLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHVzZXJEZXZpY2Ugb2YgZGV2aWNlc0ZvclVzZXJSZXNwb25zZS5kYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VyRGV2aWNlIS5kZXZpY2VTdGF0ZSA9PT0gVXNlckRldmljZVN0YXRlLkFjdGl2ZSAmJiBkZXZpY2VUb2tlbklkcy5wdXNoKHVzZXJEZXZpY2UhLnRva2VuSWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyA1KSBSZXRyaWV2ZSB0aGUgZW1haWwgb2YgYSB1c2VyIGJhc2VkIG9uIHRoZWlyIHVzZXJJZC5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVtYWlsRnJvbVVzZXJJbmZvcm1hdGlvblJlc3BvbnNlOiBFbWFpbEZyb21Db2duaXRvUmVzcG9uc2UgPSBhd2FpdCBtb29uYmVhbUNsaWVudC5nZXRFbWFpbEJ5VXNlcklkKGRhaWx5RWFybmluZ3NTdW1tYXJ5LmlkKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSBnZXQgZW1haWwgZm9yIHVzZXIgY2FsbCB3YXMgc3VjY2Vzc2Z1bCBvciBub3RcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbWFpbEZyb21Vc2VySW5mb3JtYXRpb25SZXNwb25zZSAmJiAhZW1haWxGcm9tVXNlckluZm9ybWF0aW9uUmVzcG9uc2UuZXJyb3JNZXNzYWdlICYmICFlbWFpbEZyb21Vc2VySW5mb3JtYXRpb25SZXNwb25zZS5lcnJvclR5cGUgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbWFpbEZyb21Vc2VySW5mb3JtYXRpb25SZXNwb25zZS5kYXRhICYmIGVtYWlsRnJvbVVzZXJJbmZvcm1hdGlvblJlc3BvbnNlLmRhdGEubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29tcHV0ZSB0aGUgZGFpbHlFYXJuaW5nc1N1bW1hcnlBbW91bnQgZnJvbSB0aGUgc3VtbWFyeSB0cmFuc2FjdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgZGFpbHlFYXJuaW5nc1N1bW1hcnlBbW91bnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhaWx5RWFybmluZ3NTdW1tYXJ5LnRyYW5zYWN0aW9ucy5mb3JFYWNoKHRyYW5zYWN0aW9uID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRyYW5zYWN0aW9uICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYWlseUVhcm5pbmdzU3VtbWFyeUFtb3VudCArPSB0cmFuc2FjdGlvbi5yZXdhcmRBbW91bnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDYpIENhbGwgdGhlIGNyZWF0ZU5vdGlmaWNhdGlvbiBNb29uYmVhbSBBcHBTeW5jIEFQSSBlbmRwb2ludCB0byBjcmVhdGUgYW4gZW1haWwgbm90aWZpY2F0aW9uIGZvciB0aGUgZGFpbHkgZWFybmluZ3Mgc3VtbWFyeSB1cGRhdGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjcmVhdGVFbWFpbE5vdGlmaWNhdGlvblJlc3BvbnNlOiBDcmVhdGVOb3RpZmljYXRpb25SZXNwb25zZSA9IGF3YWl0IG1vb25iZWFtQ2xpZW50LmNyZWF0ZU5vdGlmaWNhdGlvbih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBkYWlseUVhcm5pbmdzU3VtbWFyeS5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogTm90aWZpY2F0aW9uVHlwZS5EYWlseUVhcm5pbmdzU3VtbWFyeSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhbm5lbFR5cGU6IE5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlLkVtYWlsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VyRnVsbE5hbWU6IGBQbGFjZWhvbGRlcmAsIC8vIHdlIGJhY2stZmlsbCB0aGlzIGFzIGEgcGxhY2Vob2xkZXIsIGFzIGl0IHdvbid0IGJlIG5lZWRlZCBmb3IgdGhpcyB0eXBlIG9mIGVtYWlsIG5vdGlmaWNhdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbWFpbERlc3RpbmF0aW9uOiBlbWFpbEZyb21Vc2VySW5mb3JtYXRpb25SZXNwb25zZS5kYXRhISxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGFpbHlFYXJuaW5nc1N1bW1hcnlBbW91bnQ6IGRhaWx5RWFybmluZ3NTdW1tYXJ5QW1vdW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbnM6IGRhaWx5RWFybmluZ3NTdW1tYXJ5LnRyYW5zYWN0aW9ucyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiBOb3RpZmljYXRpb25TdGF0dXMuU2VudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSBlbWFpbCBub3RpZmljYXRpb24gY2FsbCB3YXMgc3VjY2Vzc2Z1bCBvciBub3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3JlYXRlRW1haWxOb3RpZmljYXRpb25SZXNwb25zZSAmJiAhY3JlYXRlRW1haWxOb3RpZmljYXRpb25SZXNwb25zZS5lcnJvck1lc3NhZ2UgJiYgIWNyZWF0ZUVtYWlsTm90aWZpY2F0aW9uUmVzcG9uc2UuZXJyb3JUeXBlICYmIGNyZWF0ZUVtYWlsTm90aWZpY2F0aW9uUmVzcG9uc2UuZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgTm90aWZpY2F0aW9uIGVtYWlsIGV2ZW50IHN1Y2Nlc3NmdWxseSBwcm9jZXNzZWQsIHdpdGggbm90aWZpY2F0aW9uIGlkICR7Y3JlYXRlRW1haWxOb3RpZmljYXRpb25SZXNwb25zZS5kYXRhLm5vdGlmaWNhdGlvbklkfWApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIHRoZXJlIGFyZSB1c2VyIGFzc29jaWF0ZWQgcGh5c2ljYWwgZGV2aWNlcyB0aGF0IGFyZSBhY3RpdmUsIHRvIHNlbmQgbm90aWZpY2F0aW9ucyB0bywgdGhlbiBwcm9jZWVkIGFjY29yZGluZ2x5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkZXZpY2VUb2tlbklkcy5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDcpIENhbGwgdGhlIGNyZWF0ZU5vdGlmaWNhdGlvbiBNb29uYmVhbSBBcHBTeW5jIEFQSSBlbmRwb2ludCB0byBjcmVhdGUgYSBwdXNoIG5vdGlmaWNhdGlvbiBmb3IgdGhlIGRhaWx5IGVhcm5pbmdzIHN1bW1hcnkgdXBkYXRlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjcmVhdGVQdXNoTm90aWZpY2F0aW9uUmVzcG9uc2U6IENyZWF0ZU5vdGlmaWNhdGlvblJlc3BvbnNlID0gYXdhaXQgbW9vbmJlYW1DbGllbnQuY3JlYXRlTm90aWZpY2F0aW9uKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogZGFpbHlFYXJuaW5nc1N1bW1hcnkuaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogTm90aWZpY2F0aW9uVHlwZS5EYWlseUVhcm5pbmdzU3VtbWFyeSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHBvUHVzaFRva2VuczogZGV2aWNlVG9rZW5JZHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhbm5lbFR5cGU6IE5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlLlB1c2gsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGFpbHlFYXJuaW5nc1N1bW1hcnlBbW91bnQ6IGRhaWx5RWFybmluZ3NTdW1tYXJ5QW1vdW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1czogTm90aWZpY2F0aW9uU3RhdHVzLlNlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIGVtYWlsIG5vdGlmaWNhdGlvbiBjYWxsIHdhcyBzdWNjZXNzZnVsIG9yIG5vdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNyZWF0ZVB1c2hOb3RpZmljYXRpb25SZXNwb25zZSAmJiAhY3JlYXRlUHVzaE5vdGlmaWNhdGlvblJlc3BvbnNlLmVycm9yTWVzc2FnZSAmJiAhY3JlYXRlUHVzaE5vdGlmaWNhdGlvblJlc3BvbnNlLmVycm9yVHlwZSAmJiBjcmVhdGVQdXNoTm90aWZpY2F0aW9uUmVzcG9uc2UuZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBOb3RpZmljYXRpb24gcHVzaCBldmVudCBzdWNjZXNzZnVsbHkgcHJvY2Vzc2VkLCB3aXRoIG5vdGlmaWNhdGlvbiBpZCAke2NyZWF0ZVB1c2hOb3RpZmljYXRpb25SZXNwb25zZS5kYXRhLm5vdGlmaWNhdGlvbklkfWApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgTm90aWZpY2F0aW9uIHB1c2ggZXZlbnQgdGhyb3VnaCBDcmVhdGUgTm90aWZpY2F0aW9uIGNhbGwgZmFpbGVkYCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgTm90aWZpY2F0aW9uIGVtYWlsIGV2ZW50IHRocm91Z2ggQ3JlYXRlIE5vdGlmaWNhdGlvbiBjYWxsIGZhaWxlZGApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgVXNlciBlbWFpbCBtYXBwaW5nIHRocm91Z2ggR0VUIGVtYWlsIGZvciB1c2VyIGNhbGwgZmFpbGVkYCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgUGh5c2ljYWwgRGV2aWNlcyBtYXBwaW5nIHRocm91Z2ggR0VUIGRldmljZXMgZm9yIHVzZXIgY2FsbCBmYWlsZWRgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGNoZWNrIGlmIHRoZXJlIGFyZSBubyBkYWlseSBzdW1tYXJpZXMgbmVlZGVkIHRvIGdldCBnZW5lcmF0ZWQgZmlyc3RcbiAgICAgICAgICAgIGlmIChkYWlseUVhcm5pbmdzU3VtbWFyeVJlc3BvbnNlLmVycm9yVHlwZSAmJiBkYWlseUVhcm5pbmdzU3VtbWFyeVJlc3BvbnNlLmVycm9yVHlwZSA9PT0gRGFpbHlTdW1tYXJ5RXJyb3JUeXBlLk5vbmVPckFic2VudCAmJlxuICAgICAgICAgICAgICAgIGRhaWx5RWFybmluZ3NTdW1tYXJ5UmVzcG9uc2UuZGF0YSAmJiBkYWlseUVhcm5pbmdzU3VtbWFyeVJlc3BvbnNlLmRhdGEubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogbm8gbmVlZCBmb3IgZnVydGhlciBhY3Rpb25zLCBzaW5jZSB0aGlzIGVycm9yIHdpbGwgYmUgbG9nZ2VkIGFuZCBub3RoaW5nIHdpbGwgZXhlY3V0ZSBmdXJ0aGVyLlxuICAgICAgICAgICAgICAgICAqIGluIHRoZSBmdXR1cmUgd2UgbWlnaHQgbmVlZCBzb21lIGFsZXJ0cyBhbmQgbWV0cmljcyBlbWl0dGluZyBoZXJlXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYENyZWF0aW5nIGRhaWx5IHN1bW1hcmllcyB0aHJvdWdoIHRoZSBjcmVhdGVEYWlseUVhcm5pbmdzU3VtbWFyeSBjYWxsIGZhaWxlZGA7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogbm8gbmVlZCBmb3IgZnVydGhlciBhY3Rpb25zLCBzaW5jZSB0aGlzIGVycm9yIHdpbGwgYmUgbG9nZ2VkIGFuZCBub3RoaW5nIHdpbGwgZXhlY3V0ZSBmdXJ0aGVyLlxuICAgICAgICAgICAgICAgICAqIGluIHRoZSBmdXR1cmUgd2UgbWlnaHQgbmVlZCBzb21lIGFsZXJ0cyBhbmQgbWV0cmljcyBlbWl0dGluZyBoZXJlXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYENyZWF0aW5nIGRhaWx5IHN1bW1hcmllcyB0aHJvdWdoIHRoZSBjcmVhdGVEYWlseUVhcm5pbmdzU3VtbWFyeSBjYWxsIGZhaWxlZGA7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBubyBuZWVkIGZvciBmdXJ0aGVyIGFjdGlvbnMsIHNpbmNlIHRoaXMgZXJyb3Igd2lsbCBiZSBsb2dnZWQgYW5kIG5vdGhpbmcgd2lsbCBleGVjdXRlIGZ1cnRoZXIuXG4gICAgICAgICAqIGluIHRoZSBmdXR1cmUgd2UgbWlnaHQgbmVlZCBzb21lIGFsZXJ0cyBhbmQgbWV0cmljcyBlbWl0dGluZyBoZXJlXG4gICAgICAgICAqL1xuICAgICAgICBjb25zb2xlLmxvZyhgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBwcm9jZXNzaW5nIHRoZSBkYWlseSBlYXJuaW5ncyBzdW1tYXJ5IGNyb24gZXZlbnQgJHtlcnJvcn1gKTtcbiAgICB9XG59XG4iXX0=