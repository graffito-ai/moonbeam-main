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
     * 3) Call the
     *
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
            // For each one of the summary reports created that day proceed to steps 3,4,5,6 and 7
            for (const dailyEarningsSummary of dailyEarningsSummaryResponse.data) {
                if (dailyEarningsSummary !== null) {
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
                            dailyEarningsSummaryAmount = Number(dailyEarningsSummaryAmount.toFixed(2));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRWFybmluZ3NEYWlseVN1bW1hcnlUcmlnZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9oYW5kbGVycy9FYXJuaW5nc0RhaWx5U3VtbWFyeVRyaWdnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsK0RBWW1DO0FBRW5DOzs7Ozs7O0dBT0c7QUFDSSxNQUFNLHFDQUFxQyxHQUFHLEtBQUssSUFBbUIsRUFBRTtJQUMzRTs7Ozs7Ozs7Ozs7Ozs7O09BZUc7SUFDSCxJQUFJO1FBQ0EseUNBQXlDO1FBQ3pDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVyxDQUFDO1FBRXZDLCtGQUErRjtRQUMvRixNQUFNLFNBQVMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1FBQzdCLE1BQU0sVUFBVSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7UUFFOUIsMERBQTBEO1FBQzFELFVBQVUsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzVDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkIsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN6QixVQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pCLFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFOUIsdUdBQXVHO1FBQ3ZHLE1BQU0sY0FBYyxHQUFHLElBQUksZ0NBQWMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUV6RTs7O1dBR0c7UUFDSCxNQUFNLDRCQUE0QixHQUFpQyxNQUFNLGNBQWMsQ0FBQywwQkFBMEIsQ0FBQztZQUMvRyxVQUFVLEVBQUUsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRTtTQUN0RSxDQUFDLENBQUM7UUFFSCxrRkFBa0Y7UUFDbEYsSUFBSSw0QkFBNEIsSUFBSSxDQUFDLDRCQUE0QixDQUFDLFlBQVksSUFBSSxDQUFDLDRCQUE0QixDQUFDLFNBQVM7WUFDckgsNEJBQTRCLENBQUMsSUFBSSxJQUFJLDRCQUE0QixDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ3JGLHNGQUFzRjtZQUN0RixLQUFLLE1BQU0sb0JBQW9CLElBQUksNEJBQTRCLENBQUMsSUFBSSxFQUFFO2dCQUNsRSxJQUFJLG9CQUFvQixLQUFLLElBQUksRUFBRTtvQkFDL0IsK0RBQStEO29CQUMvRCxNQUFNLHNCQUFzQixHQUF3QixNQUFNLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQzt3QkFDdkYsRUFBRSxFQUFFLG9CQUFvQixDQUFDLEVBQUU7cUJBQzlCLENBQUMsQ0FBQztvQkFFSDs7Ozs7dUJBS0c7b0JBQ0gsSUFBSSxDQUFDLHNCQUFzQixJQUFJLENBQUMsc0JBQXNCLENBQUMsWUFBWSxJQUFJLENBQUMsc0JBQXNCLENBQUMsU0FBUzt3QkFDaEcsc0JBQXNCLENBQUMsSUFBSSxJQUFJLHNCQUFzQixDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO3dCQUM1RSxDQUFDLHNCQUFzQixJQUFJLHNCQUFzQixDQUFDLFNBQVMsS0FBSyxJQUFJLElBQUksc0JBQXNCLENBQUMsU0FBUyxLQUFLLFNBQVM7NEJBQ2xILHNCQUFzQixDQUFDLFNBQVMsS0FBSyxxQ0FBbUIsQ0FBQyxZQUFZLENBQUMsRUFBRTt3QkFFNUUsTUFBTSxjQUFjLEdBQWEsRUFBRSxDQUFDO3dCQUNwQyxJQUFJLHNCQUFzQixJQUFJLHNCQUFzQixDQUFDLFNBQVMsS0FBSyxJQUFJLElBQUksc0JBQXNCLENBQUMsU0FBUyxLQUFLLFNBQVM7NEJBQ3JILHNCQUFzQixDQUFDLFNBQVMsS0FBSyxxQ0FBbUIsQ0FBQyxZQUFZLEVBQUU7NEJBQ3ZFLE9BQU8sQ0FBQyxHQUFHLENBQUMsc0NBQXNDLG9CQUFvQixDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7eUJBQ2hGOzZCQUFNOzRCQUNILElBQUksc0JBQXNCLENBQUMsSUFBSSxLQUFLLElBQUksSUFBSSxzQkFBc0IsQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFO2dDQUNuRiwwR0FBMEc7Z0NBQzFHLEtBQUssTUFBTSxVQUFVLElBQUksc0JBQXNCLENBQUMsSUFBSSxFQUFFO29DQUNsRCxVQUFXLENBQUMsV0FBVyxLQUFLLGlDQUFlLENBQUMsTUFBTSxJQUFJLGNBQWMsQ0FBQyxJQUFJLENBQUMsVUFBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2lDQUNsRzs2QkFDSjt5QkFDSjt3QkFFRCx5REFBeUQ7d0JBQ3pELE1BQU0sZ0NBQWdDLEdBQTZCLE1BQU0sY0FBYyxDQUFDLGdCQUFnQixDQUFDLG9CQUFvQixDQUFDLEVBQUUsQ0FBQyxDQUFDO3dCQUVsSSxvRUFBb0U7d0JBQ3BFLElBQUksZ0NBQWdDLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxZQUFZLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxTQUFTOzRCQUNqSSxnQ0FBZ0MsQ0FBQyxJQUFJLElBQUksZ0NBQWdDLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7NEJBQzdGLHVFQUF1RTs0QkFDdkUsSUFBSSwwQkFBMEIsR0FBRyxDQUFDLENBQUM7NEJBQ25DLG9CQUFvQixDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEVBQUU7Z0NBQ3BELElBQUksV0FBVyxLQUFLLElBQUksRUFBRTtvQ0FDdEIsMEJBQTBCLElBQUksV0FBVyxDQUFDLFlBQVksQ0FBQztpQ0FDMUQ7NEJBQ0wsQ0FBQyxDQUFDLENBQUM7NEJBQ0gsMEJBQTBCLEdBQUcsTUFBTSxDQUFDLDBCQUEwQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUUzRSxxSUFBcUk7NEJBQ3JJLE1BQU0sK0JBQStCLEdBQStCLE1BQU0sY0FBYyxDQUFDLGtCQUFrQixDQUFDO2dDQUN4RyxFQUFFLEVBQUUsb0JBQW9CLENBQUMsRUFBRTtnQ0FDM0IsSUFBSSxFQUFFLGtDQUFnQixDQUFDLG9CQUFvQjtnQ0FDM0MsV0FBVyxFQUFFLHlDQUF1QixDQUFDLEtBQUs7Z0NBQzFDLFlBQVksRUFBRSxhQUFhO2dDQUMzQixnQkFBZ0IsRUFBRSxnQ0FBZ0MsQ0FBQyxJQUFLO2dDQUN4RCwwQkFBMEIsRUFBRSwwQkFBMEI7Z0NBQ3RELFlBQVksRUFBRSxvQkFBb0IsQ0FBQyxZQUFZO2dDQUMvQyxNQUFNLEVBQUUsb0NBQWtCLENBQUMsSUFBSTs2QkFDbEMsQ0FBQyxDQUFDOzRCQUVILG9FQUFvRTs0QkFDcEUsSUFBSSwrQkFBK0IsSUFBSSxDQUFDLCtCQUErQixDQUFDLFlBQVksSUFBSSxDQUFDLCtCQUErQixDQUFDLFNBQVMsSUFBSSwrQkFBK0IsQ0FBQyxJQUFJLEVBQUU7Z0NBQ3hLLE9BQU8sQ0FBQyxHQUFHLENBQUMseUVBQXlFLCtCQUErQixDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDO2dDQUU1SSxvSEFBb0g7Z0NBQ3BILElBQUksY0FBYyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7b0NBQzdCLG1JQUFtSTtvQ0FDbkksTUFBTSw4QkFBOEIsR0FBK0IsTUFBTSxjQUFjLENBQUMsa0JBQWtCLENBQUM7d0NBQ3ZHLEVBQUUsRUFBRSxvQkFBb0IsQ0FBQyxFQUFFO3dDQUMzQixJQUFJLEVBQUUsa0NBQWdCLENBQUMsb0JBQW9CO3dDQUMzQyxjQUFjLEVBQUUsY0FBYzt3Q0FDOUIsV0FBVyxFQUFFLHlDQUF1QixDQUFDLElBQUk7d0NBQ3pDLDBCQUEwQixFQUFFLDBCQUEwQjt3Q0FDdEQsTUFBTSxFQUFFLG9DQUFrQixDQUFDLElBQUk7cUNBQ2xDLENBQUMsQ0FBQztvQ0FFSCxvRUFBb0U7b0NBQ3BFLElBQUksOEJBQThCLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxZQUFZLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxTQUFTLElBQUksOEJBQThCLENBQUMsSUFBSSxFQUFFO3dDQUNwSyxPQUFPLENBQUMsR0FBRyxDQUFDLHdFQUF3RSw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQztxQ0FDN0k7eUNBQU07d0NBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpRUFBaUUsQ0FBQyxDQUFDO3FDQUNsRjtpQ0FDSjs2QkFDSjtpQ0FBTTtnQ0FDSCxPQUFPLENBQUMsR0FBRyxDQUFDLGtFQUFrRSxDQUFDLENBQUM7NkJBQ25GO3lCQUVKOzZCQUFNOzRCQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsMkRBQTJELENBQUMsQ0FBQzt5QkFDNUU7cUJBQ0o7eUJBQU07d0JBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtRUFBbUUsQ0FBQyxDQUFDO3FCQUNwRjtpQkFDSjthQUNKO1NBQ0o7YUFBTTtZQUNILHNFQUFzRTtZQUN0RSxJQUFJLDRCQUE0QixDQUFDLFNBQVMsSUFBSSw0QkFBNEIsQ0FBQyxTQUFTLEtBQUssdUNBQXFCLENBQUMsWUFBWTtnQkFDdkgsNEJBQTRCLENBQUMsSUFBSSxJQUFJLDRCQUE0QixDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUNyRjs7O21CQUdHO2dCQUNILE1BQU0sWUFBWSxHQUFHLDZFQUE2RSxDQUFDO2dCQUNuRyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO2FBQzdCO2lCQUFNO2dCQUNIOzs7bUJBR0c7Z0JBQ0gsTUFBTSxZQUFZLEdBQUcsNkVBQTZFLENBQUM7Z0JBQ25HLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7YUFDN0I7U0FDSjtLQUNKO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDWjs7O1dBR0c7UUFDSCxPQUFPLENBQUMsR0FBRyxDQUFDLDJFQUEyRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0tBQ25HO0FBQ0wsQ0FBQyxDQUFBO0FBdEtZLFFBQUEscUNBQXFDLHlDQXNLakQiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICAgIENyZWF0ZU5vdGlmaWNhdGlvblJlc3BvbnNlLFxuICAgIERhaWx5RWFybmluZ3NTdW1tYXJ5UmVzcG9uc2UsXG4gICAgRGFpbHlTdW1tYXJ5RXJyb3JUeXBlLFxuICAgIEVtYWlsRnJvbUNvZ25pdG9SZXNwb25zZSxcbiAgICBNb29uYmVhbUNsaWVudCxcbiAgICBOb3RpZmljYXRpb25DaGFubmVsVHlwZSxcbiAgICBOb3RpZmljYXRpb25TdGF0dXMsXG4gICAgTm90aWZpY2F0aW9uVHlwZSxcbiAgICBVc2VyRGV2aWNlRXJyb3JUeXBlLFxuICAgIFVzZXJEZXZpY2VzUmVzcG9uc2UsXG4gICAgVXNlckRldmljZVN0YXRlXG59IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5cbi8qKlxuICogRnVuY3Rpb24gdXNlZCB0byBoYW5kbGUgdGhlIGVhcm5pbmdzIGRhaWx5IHN1bW1hcnkgdHJpZ2dlciwgYnkgZGV0ZXJtaW5pbmdcbiAqIHdoaWNoIHVzZXJzIHNwZW50IGluIGEgcGFydGljdWxhciBkYXksIGNyZWF0aW5nIGEgc3VtbWFyeSBmb3IgdGhlbSwgYW5kIHRoZW4gc2VuZGluZ1xuICogdGhlbSBhIFBVU0ggYW5kIEVNQUlMIG5vdGlmaWNhdGlvbi5cbiAqXG4gKiBAcmV0dXJucyBhIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgdm9pZH0sIHNpbmNlIHRoZSBFdmVudEJyaWRnZXJcbiAqIGV2ZW50IHRyaWdnZXIsIHdpbGwgZXhlY3V0ZSBhIGNyb24gam9iIGFuZCBub3QgcmV0dXJuIGFueXRoaW5nLlxuICovXG5leHBvcnQgY29uc3QgdHJpZ2dlckVhcm5pbmdzRGFpbHlTdW1tYXJpZXNDcmVhdGlvbiA9IGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICAvKipcbiAgICAgKiBUaGUgb3ZlcmFsbCBkYWlseSBlYXJuaW5ncyBzdW1tYXJ5IGNyb24gdHJpZ2dlcmluZywgd2lsbCBiZSBtYWRlIHVwIG9mIHRoZSBmb2xsb3dpbmcgc3RlcHM6XG4gICAgICpcbiAgICAgKiAxKSBXZSB3YW50IHRvIGdldCB0aGUgcHJldmlvdXMgZGF5J3MgZGF0ZSwgYW5kIHNldCB0aGF0IGFzIG91ciB0YXJnZXQgZGF0ZSBpbiB0aGUgbmV4dCBzdGVwLlxuICAgICAqIDIpIENhbGwgdGhlIGNyZWF0ZURhaWx5RWFybmluZ3NTdW1tYXJ5IEFwcFN5bmMgTXV0YXRpb24gQVBJIGluIG9yZGVyIHRvIGRldGVybWluZSB3aGljaCB1c2Vyc1xuICAgICAqIHNwZW50IGluIHRoZSBwcmV2aW91cyBkYXksIGFuZCBjcmVhdGUgYSBzdW1tYXJ5IGZvciB0aGVtLlxuICAgICAqIDMpIENhbGwgdGhlIFxuICAgICAqXG4gICAgICpcbiAgICAgKiBGb3IgZWFjaCBvbmUgb2YgdGhlIHN1bW1hcnkgcmVwb3J0cyBjcmVhdGVkIHRoYXQgZGF5OlxuICAgICAqIDMpIENhbGwgdGhlIGdldERldmljZXNGb3JVc2VyIE1vb25iZWFtIEFwcHN5bmMgQVBJIGVuZHBvaW50LlxuICAgICAqIDQpIEZpbHRlciBvYnRhaW5lZCBkZXZpY2VzIGJhc2VkIG9uIHRoZWlyIHN0YXR1cyAob25seSBjb25zaWRlciB0aGUgb25lcyB0aGF0IGFyZSBBQ1RJVkUgZm9yIHRoZSB1c2VyKS5cbiAgICAgKiA1KSBSZXRyaWV2ZSB0aGUgZW1haWwgb2YgYSB1c2VyIGJhc2VkIG9uIHRoZWlyIHVzZXJJZC5cbiAgICAgKiA2KSBDYWxsIHRoZSBjcmVhdGVOb3RpZmljYXRpb24gTW9vbmJlYW0gQXBwU3luYyBBUEkgZW5kcG9pbnQgdG8gY3JlYXRlIGFuIGVtYWlsIG5vdGlmaWNhdGlvbiBmb3IgdGhlIGRhaWx5IGVhcm5pbmdzIHN1bW1hcnkgdXBkYXRlLlxuICAgICAqIDcpIENhbGwgdGhlIGNyZWF0ZU5vdGlmaWNhdGlvbiBNb29uYmVhbSBBcHBTeW5jIEFQSSBlbmRwb2ludCB0byBjcmVhdGUgYSBwdXNoIG5vdGlmaWNhdGlvbiBmb3IgdGhlIGRhaWx5IGVhcm5pbmdzIHN1bW1hcnkgdXBkYXRlLlxuICAgICAqL1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgIC8vIDEpIFdlIHdhbnQgdG8gZ2V0IHRoZSBwcmV2aW91cyBkYXkncyBkYXRlLCBhbmQgc2V0IHRoYXQgYXMgb3VyIHRhcmdldCBkYXRlIGluIHRoZSBuZXh0IHN0ZXAuXG4gICAgICAgIGNvbnN0IHRvZGF5RGF0ZSA9IG5ldyBEYXRlKCk7XG4gICAgICAgIGNvbnN0IHRhcmdldERhdGUgPSBuZXcgRGF0ZSgpO1xuXG4gICAgICAgIC8vIHNldCB0aGUgdGFyZ2V0RGF0ZSBhcyB5ZXN0ZXJkYXkncyBkYXRlIGF0IDAwOjAwOjAwLjAwMFpcbiAgICAgICAgdGFyZ2V0RGF0ZS5zZXREYXRlKHRvZGF5RGF0ZS5nZXREYXRlKCkgLSAxKTtcbiAgICAgICAgdGFyZ2V0RGF0ZS5zZXRIb3VycygwKTtcbiAgICAgICAgdGFyZ2V0RGF0ZS5zZXRNaW51dGVzKDApO1xuICAgICAgICB0YXJnZXREYXRlLnNldFNlY29uZHMoMCk7XG4gICAgICAgIHRhcmdldERhdGUuc2V0TWlsbGlzZWNvbmRzKDApO1xuXG4gICAgICAgIC8vIGluaXRpYWxpemUgdGhlIE1vb25iZWFtIENsaWVudCBBUEkgaGVyZSwgaW4gb3JkZXIgdG8gY2FsbCB0aGUgYXBwcm9wcmlhdGUgZW5kcG9pbnRzIGZvciB0aGlzIGhhbmRsZXJcbiAgICAgICAgY29uc3QgbW9vbmJlYW1DbGllbnQgPSBuZXcgTW9vbmJlYW1DbGllbnQocHJvY2Vzcy5lbnYuRU5WX05BTUUhLCByZWdpb24pO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiAyKSBDYWxsIHRoZSBjcmVhdGVEYWlseUVhcm5pbmdzU3VtbWFyeSBBcHBTeW5jIE11dGF0aW9uIEFQSSBpbiBvcmRlciB0byBkZXRlcm1pbmUgd2hpY2ggdXNlcnNcbiAgICAgICAgICogc3BlbnQgaW4gdGhlIHByZXZpb3VzIGRheSwgYW5kIGNyZWF0ZSBhIHN1bW1hcnkgZm9yIHRoZW0uXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBkYWlseUVhcm5pbmdzU3VtbWFyeVJlc3BvbnNlOiBEYWlseUVhcm5pbmdzU3VtbWFyeVJlc3BvbnNlID0gYXdhaXQgbW9vbmJlYW1DbGllbnQuY3JlYXRlRGFpbHlFYXJuaW5nc1N1bW1hcnkoe1xuICAgICAgICAgICAgdGFyZ2V0RGF0ZTogbmV3IERhdGUodGFyZ2V0RGF0ZS5zZXRVVENIb3VycygwLDAsMCwwKSkudG9JU09TdHJpbmcoKVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBtYWtlIHN1cmUgdGhhdCBjcmVhdGluZyB0aGUgZGFpbHkgZWFybmluZ3Mgc3VtbWFyaWVzIGNhbGwgd2FzIHN1Y2Nlc3NmdWwgb3Igbm90XG4gICAgICAgIGlmIChkYWlseUVhcm5pbmdzU3VtbWFyeVJlc3BvbnNlICYmICFkYWlseUVhcm5pbmdzU3VtbWFyeVJlc3BvbnNlLmVycm9yTWVzc2FnZSAmJiAhZGFpbHlFYXJuaW5nc1N1bW1hcnlSZXNwb25zZS5lcnJvclR5cGUgJiZcbiAgICAgICAgICAgIGRhaWx5RWFybmluZ3NTdW1tYXJ5UmVzcG9uc2UuZGF0YSAmJiBkYWlseUVhcm5pbmdzU3VtbWFyeVJlc3BvbnNlLmRhdGEubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAvLyBGb3IgZWFjaCBvbmUgb2YgdGhlIHN1bW1hcnkgcmVwb3J0cyBjcmVhdGVkIHRoYXQgZGF5IHByb2NlZWQgdG8gc3RlcHMgMyw0LDUsNiBhbmQgN1xuICAgICAgICAgICAgZm9yIChjb25zdCBkYWlseUVhcm5pbmdzU3VtbWFyeSBvZiBkYWlseUVhcm5pbmdzU3VtbWFyeVJlc3BvbnNlLmRhdGEpIHtcbiAgICAgICAgICAgICAgICBpZiAoZGFpbHlFYXJuaW5nc1N1bW1hcnkgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gMykgQ2FsbCB0aGUgZ2V0RGV2aWNlc0ZvclVzZXIgTW9vbmJlYW0gQXBwc3luYyBBUEkgZW5kcG9pbnQuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRldmljZXNGb3JVc2VyUmVzcG9uc2U6IFVzZXJEZXZpY2VzUmVzcG9uc2UgPSBhd2FpdCBtb29uYmVhbUNsaWVudC5nZXREZXZpY2VzRm9yVXNlcih7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogZGFpbHlFYXJuaW5nc1N1bW1hcnkuaWRcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIGNoZWNrIHRvIHNlZSBpZiB0aGUgZ2V0IGRldmljZXMgZm9yIHVzZXIgY2FsbCB3YXMgc3VjY2Vzc2Z1bCBvciBub3QuXG4gICAgICAgICAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgICAgICAgICAqIHdlIGFsc28gY29uc2lkZXIgdGhlIGZhaWx1cmUgbWVzc2FnZSwgZm9yIHVzZXJzIHdpdGggbm8gcGh5c2ljYWwgZGV2aWNlcy4gSW4gdGhhdCBjYXNlIHdlIG9ubHkgc2VuZCBhblxuICAgICAgICAgICAgICAgICAgICAgKiBlbWFpbC5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGlmICgoZGV2aWNlc0ZvclVzZXJSZXNwb25zZSAmJiAhZGV2aWNlc0ZvclVzZXJSZXNwb25zZS5lcnJvck1lc3NhZ2UgJiYgIWRldmljZXNGb3JVc2VyUmVzcG9uc2UuZXJyb3JUeXBlICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGV2aWNlc0ZvclVzZXJSZXNwb25zZS5kYXRhICYmIGRldmljZXNGb3JVc2VyUmVzcG9uc2UuZGF0YS5sZW5ndGggIT09IDApIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAoZGV2aWNlc0ZvclVzZXJSZXNwb25zZSAmJiBkZXZpY2VzRm9yVXNlclJlc3BvbnNlLmVycm9yVHlwZSAhPT0gbnVsbCAmJiBkZXZpY2VzRm9yVXNlclJlc3BvbnNlLmVycm9yVHlwZSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGV2aWNlc0ZvclVzZXJSZXNwb25zZS5lcnJvclR5cGUgPT09IFVzZXJEZXZpY2VFcnJvclR5cGUuTm9uZU9yQWJzZW50KSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkZXZpY2VUb2tlbklkczogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkZXZpY2VzRm9yVXNlclJlc3BvbnNlICYmIGRldmljZXNGb3JVc2VyUmVzcG9uc2UuZXJyb3JUeXBlICE9PSBudWxsICYmIGRldmljZXNGb3JVc2VyUmVzcG9uc2UuZXJyb3JUeXBlICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXZpY2VzRm9yVXNlclJlc3BvbnNlLmVycm9yVHlwZSA9PT0gVXNlckRldmljZUVycm9yVHlwZS5Ob25lT3JBYnNlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgTm8gcGh5c2ljYWwgZGV2aWNlcyBmb3VuZCBmb3IgdXNlciAke2RhaWx5RWFybmluZ3NTdW1tYXJ5LmlkfWApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGV2aWNlc0ZvclVzZXJSZXNwb25zZS5kYXRhICE9PSBudWxsICYmIGRldmljZXNGb3JVc2VyUmVzcG9uc2UuZGF0YSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDQpIEZpbHRlciBvYnRhaW5lZCBkZXZpY2VzIGJhc2VkIG9uIHRoZWlyIHN0YXR1cyAob25seSBjb25zaWRlciB0aGUgb25lcyB0aGF0IGFyZSBBQ1RJVkUgZm9yIHRoZSB1c2VyKS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCB1c2VyRGV2aWNlIG9mIGRldmljZXNGb3JVc2VyUmVzcG9uc2UuZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlckRldmljZSEuZGV2aWNlU3RhdGUgPT09IFVzZXJEZXZpY2VTdGF0ZS5BY3RpdmUgJiYgZGV2aWNlVG9rZW5JZHMucHVzaCh1c2VyRGV2aWNlIS50b2tlbklkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gNSkgUmV0cmlldmUgdGhlIGVtYWlsIG9mIGEgdXNlciBiYXNlZCBvbiB0aGVpciB1c2VySWQuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlbWFpbEZyb21Vc2VySW5mb3JtYXRpb25SZXNwb25zZTogRW1haWxGcm9tQ29nbml0b1Jlc3BvbnNlID0gYXdhaXQgbW9vbmJlYW1DbGllbnQuZ2V0RW1haWxCeVVzZXJJZChkYWlseUVhcm5pbmdzU3VtbWFyeS5pZCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGUgZ2V0IGVtYWlsIGZvciB1c2VyIGNhbGwgd2FzIHN1Y2Nlc3NmdWwgb3Igbm90XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZW1haWxGcm9tVXNlckluZm9ybWF0aW9uUmVzcG9uc2UgJiYgIWVtYWlsRnJvbVVzZXJJbmZvcm1hdGlvblJlc3BvbnNlLmVycm9yTWVzc2FnZSAmJiAhZW1haWxGcm9tVXNlckluZm9ybWF0aW9uUmVzcG9uc2UuZXJyb3JUeXBlICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW1haWxGcm9tVXNlckluZm9ybWF0aW9uUmVzcG9uc2UuZGF0YSAmJiBlbWFpbEZyb21Vc2VySW5mb3JtYXRpb25SZXNwb25zZS5kYXRhLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbXB1dGUgdGhlIGRhaWx5RWFybmluZ3NTdW1tYXJ5QW1vdW50IGZyb20gdGhlIHN1bW1hcnkgdHJhbnNhY3Rpb25zXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGRhaWx5RWFybmluZ3NTdW1tYXJ5QW1vdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYWlseUVhcm5pbmdzU3VtbWFyeS50cmFuc2FjdGlvbnMuZm9yRWFjaCh0cmFuc2FjdGlvbiA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0cmFuc2FjdGlvbiAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGFpbHlFYXJuaW5nc1N1bW1hcnlBbW91bnQgKz0gdHJhbnNhY3Rpb24ucmV3YXJkQW1vdW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGFpbHlFYXJuaW5nc1N1bW1hcnlBbW91bnQgPSBOdW1iZXIoZGFpbHlFYXJuaW5nc1N1bW1hcnlBbW91bnQudG9GaXhlZCgyKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyA2KSBDYWxsIHRoZSBjcmVhdGVOb3RpZmljYXRpb24gTW9vbmJlYW0gQXBwU3luYyBBUEkgZW5kcG9pbnQgdG8gY3JlYXRlIGFuIGVtYWlsIG5vdGlmaWNhdGlvbiBmb3IgdGhlIGRhaWx5IGVhcm5pbmdzIHN1bW1hcnkgdXBkYXRlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY3JlYXRlRW1haWxOb3RpZmljYXRpb25SZXNwb25zZTogQ3JlYXRlTm90aWZpY2F0aW9uUmVzcG9uc2UgPSBhd2FpdCBtb29uYmVhbUNsaWVudC5jcmVhdGVOb3RpZmljYXRpb24oe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogZGFpbHlFYXJuaW5nc1N1bW1hcnkuaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IE5vdGlmaWNhdGlvblR5cGUuRGFpbHlFYXJuaW5nc1N1bW1hcnksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5uZWxUeXBlOiBOb3RpZmljYXRpb25DaGFubmVsVHlwZS5FbWFpbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlckZ1bGxOYW1lOiBgUGxhY2Vob2xkZXJgLCAvLyB3ZSBiYWNrLWZpbGwgdGhpcyBhcyBhIHBsYWNlaG9sZGVyLCBhcyBpdCB3b24ndCBiZSBuZWVkZWQgZm9yIHRoaXMgdHlwZSBvZiBlbWFpbCBub3RpZmljYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW1haWxEZXN0aW5hdGlvbjogZW1haWxGcm9tVXNlckluZm9ybWF0aW9uUmVzcG9uc2UuZGF0YSEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhaWx5RWFybmluZ3NTdW1tYXJ5QW1vdW50OiBkYWlseUVhcm5pbmdzU3VtbWFyeUFtb3VudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25zOiBkYWlseUVhcm5pbmdzU3VtbWFyeS50cmFuc2FjdGlvbnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1czogTm90aWZpY2F0aW9uU3RhdHVzLlNlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGUgZW1haWwgbm90aWZpY2F0aW9uIGNhbGwgd2FzIHN1Y2Nlc3NmdWwgb3Igbm90XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNyZWF0ZUVtYWlsTm90aWZpY2F0aW9uUmVzcG9uc2UgJiYgIWNyZWF0ZUVtYWlsTm90aWZpY2F0aW9uUmVzcG9uc2UuZXJyb3JNZXNzYWdlICYmICFjcmVhdGVFbWFpbE5vdGlmaWNhdGlvblJlc3BvbnNlLmVycm9yVHlwZSAmJiBjcmVhdGVFbWFpbE5vdGlmaWNhdGlvblJlc3BvbnNlLmRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYE5vdGlmaWNhdGlvbiBlbWFpbCBldmVudCBzdWNjZXNzZnVsbHkgcHJvY2Vzc2VkLCB3aXRoIG5vdGlmaWNhdGlvbiBpZCAke2NyZWF0ZUVtYWlsTm90aWZpY2F0aW9uUmVzcG9uc2UuZGF0YS5ub3RpZmljYXRpb25JZH1gKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpZiB0aGVyZSBhcmUgdXNlciBhc3NvY2lhdGVkIHBoeXNpY2FsIGRldmljZXMgdGhhdCBhcmUgYWN0aXZlLCB0byBzZW5kIG5vdGlmaWNhdGlvbnMgdG8sIHRoZW4gcHJvY2VlZCBhY2NvcmRpbmdseVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGV2aWNlVG9rZW5JZHMubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyA3KSBDYWxsIHRoZSBjcmVhdGVOb3RpZmljYXRpb24gTW9vbmJlYW0gQXBwU3luYyBBUEkgZW5kcG9pbnQgdG8gY3JlYXRlIGEgcHVzaCBub3RpZmljYXRpb24gZm9yIHRoZSBkYWlseSBlYXJuaW5ncyBzdW1tYXJ5IHVwZGF0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY3JlYXRlUHVzaE5vdGlmaWNhdGlvblJlc3BvbnNlOiBDcmVhdGVOb3RpZmljYXRpb25SZXNwb25zZSA9IGF3YWl0IG1vb25iZWFtQ2xpZW50LmNyZWF0ZU5vdGlmaWNhdGlvbih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGRhaWx5RWFybmluZ3NTdW1tYXJ5LmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IE5vdGlmaWNhdGlvblR5cGUuRGFpbHlFYXJuaW5nc1N1bW1hcnksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwb1B1c2hUb2tlbnM6IGRldmljZVRva2VuSWRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5uZWxUeXBlOiBOb3RpZmljYXRpb25DaGFubmVsVHlwZS5QdXNoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhaWx5RWFybmluZ3NTdW1tYXJ5QW1vdW50OiBkYWlseUVhcm5pbmdzU3VtbWFyeUFtb3VudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IE5vdGlmaWNhdGlvblN0YXR1cy5TZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSBlbWFpbCBub3RpZmljYXRpb24gY2FsbCB3YXMgc3VjY2Vzc2Z1bCBvciBub3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjcmVhdGVQdXNoTm90aWZpY2F0aW9uUmVzcG9uc2UgJiYgIWNyZWF0ZVB1c2hOb3RpZmljYXRpb25SZXNwb25zZS5lcnJvck1lc3NhZ2UgJiYgIWNyZWF0ZVB1c2hOb3RpZmljYXRpb25SZXNwb25zZS5lcnJvclR5cGUgJiYgY3JlYXRlUHVzaE5vdGlmaWNhdGlvblJlc3BvbnNlLmRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgTm90aWZpY2F0aW9uIHB1c2ggZXZlbnQgc3VjY2Vzc2Z1bGx5IHByb2Nlc3NlZCwgd2l0aCBub3RpZmljYXRpb24gaWQgJHtjcmVhdGVQdXNoTm90aWZpY2F0aW9uUmVzcG9uc2UuZGF0YS5ub3RpZmljYXRpb25JZH1gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYE5vdGlmaWNhdGlvbiBwdXNoIGV2ZW50IHRocm91Z2ggQ3JlYXRlIE5vdGlmaWNhdGlvbiBjYWxsIGZhaWxlZGApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYE5vdGlmaWNhdGlvbiBlbWFpbCBldmVudCB0aHJvdWdoIENyZWF0ZSBOb3RpZmljYXRpb24gY2FsbCBmYWlsZWRgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFVzZXIgZW1haWwgbWFwcGluZyB0aHJvdWdoIEdFVCBlbWFpbCBmb3IgdXNlciBjYWxsIGZhaWxlZGApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFBoeXNpY2FsIERldmljZXMgbWFwcGluZyB0aHJvdWdoIEdFVCBkZXZpY2VzIGZvciB1c2VyIGNhbGwgZmFpbGVkYCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBjaGVjayBpZiB0aGVyZSBhcmUgbm8gZGFpbHkgc3VtbWFyaWVzIG5lZWRlZCB0byBnZXQgZ2VuZXJhdGVkIGZpcnN0XG4gICAgICAgICAgICBpZiAoZGFpbHlFYXJuaW5nc1N1bW1hcnlSZXNwb25zZS5lcnJvclR5cGUgJiYgZGFpbHlFYXJuaW5nc1N1bW1hcnlSZXNwb25zZS5lcnJvclR5cGUgPT09IERhaWx5U3VtbWFyeUVycm9yVHlwZS5Ob25lT3JBYnNlbnQgJiZcbiAgICAgICAgICAgICAgICBkYWlseUVhcm5pbmdzU3VtbWFyeVJlc3BvbnNlLmRhdGEgJiYgZGFpbHlFYXJuaW5nc1N1bW1hcnlSZXNwb25zZS5kYXRhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIG5vIG5lZWQgZm9yIGZ1cnRoZXIgYWN0aW9ucywgc2luY2UgdGhpcyBlcnJvciB3aWxsIGJlIGxvZ2dlZCBhbmQgbm90aGluZyB3aWxsIGV4ZWN1dGUgZnVydGhlci5cbiAgICAgICAgICAgICAgICAgKiBpbiB0aGUgZnV0dXJlIHdlIG1pZ2h0IG5lZWQgc29tZSBhbGVydHMgYW5kIG1ldHJpY3MgZW1pdHRpbmcgaGVyZVxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBDcmVhdGluZyBkYWlseSBzdW1tYXJpZXMgdGhyb3VnaCB0aGUgY3JlYXRlRGFpbHlFYXJuaW5nc1N1bW1hcnkgY2FsbCBmYWlsZWRgO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIG5vIG5lZWQgZm9yIGZ1cnRoZXIgYWN0aW9ucywgc2luY2UgdGhpcyBlcnJvciB3aWxsIGJlIGxvZ2dlZCBhbmQgbm90aGluZyB3aWxsIGV4ZWN1dGUgZnVydGhlci5cbiAgICAgICAgICAgICAgICAgKiBpbiB0aGUgZnV0dXJlIHdlIG1pZ2h0IG5lZWQgc29tZSBhbGVydHMgYW5kIG1ldHJpY3MgZW1pdHRpbmcgaGVyZVxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBDcmVhdGluZyBkYWlseSBzdW1tYXJpZXMgdGhyb3VnaCB0aGUgY3JlYXRlRGFpbHlFYXJuaW5nc1N1bW1hcnkgY2FsbCBmYWlsZWRgO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAvKipcbiAgICAgICAgICogbm8gbmVlZCBmb3IgZnVydGhlciBhY3Rpb25zLCBzaW5jZSB0aGlzIGVycm9yIHdpbGwgYmUgbG9nZ2VkIGFuZCBub3RoaW5nIHdpbGwgZXhlY3V0ZSBmdXJ0aGVyLlxuICAgICAgICAgKiBpbiB0aGUgZnV0dXJlIHdlIG1pZ2h0IG5lZWQgc29tZSBhbGVydHMgYW5kIG1ldHJpY3MgZW1pdHRpbmcgaGVyZVxuICAgICAgICAgKi9cbiAgICAgICAgY29uc29sZS5sb2coYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgcHJvY2Vzc2luZyB0aGUgZGFpbHkgZWFybmluZ3Mgc3VtbWFyeSBjcm9uIGV2ZW50ICR7ZXJyb3J9YCk7XG4gICAgfVxufVxuIl19