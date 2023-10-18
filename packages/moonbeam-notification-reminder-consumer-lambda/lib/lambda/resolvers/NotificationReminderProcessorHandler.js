"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processNotificationReminder = void 0;
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * NotificationReminderProcessor handler
 *
 * @param event the {@link SQSEvent} to be processed, containing the notification
 * reminder message information
 * @returns {@link Promise} of {@link SQSBatchResponse}
 */
const processNotificationReminder = async (event) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        /**
         * initializing the batch response, as an empty array, that will be populated with errors, if any throughout the processing
         *
         * for the Lambda to indicate SQS that there have been no failures, and thus enable the deletion of all processed messages
         * from the queue, we have to return an empty batchItemFailures array. If we want to indicate that there have been errors,
         * for each individual message, based on its ID, we have to add it in the final batch response
         *
         * @link https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html
         */
        const itemFailures = [];
        // for each record in the incoming event, repeat the notification reminder processing steps
        for (const userNotificationReminderRecord of event.Records) {
            // first, convert the incoming event message body, into a user's details for notification reminder object
            const userDetailsReminder = JSON.parse(userNotificationReminderRecord.body);
            /**
             * The overall notification reminder processing, will be made up of the following steps:
             *
             * 1) Call the getDevicesForUser Moonbeam AppSync API endpoint, to retrieve all physical devices associated with an
             * incoming user.
             * 2) Filter obtained devices based on their status (only consider the ones that are ACTIVE for the user).
             * 3) Call the createNotification Moonbeam AppSync API endpoint, to send the appropriate notification through
             * Courier accordingly (email + push notification or other channels, accordingly).
             *
             */
            // initialize the Moonbeam Client API here, in order to call the appropriate endpoints for this handler
            const moonbeamClient = new moonbeam_models_1.MoonbeamClient(process.env.ENV_NAME, region);
            // 1) Call the getDevicesForUser Moonbeam Appsync API endpoint.
            const devicesForUserResponse = await moonbeamClient.getDevicesForUser({
                id: userDetailsReminder.id
            });
            /**
             * check to see if the get devices for user call was successful or not.
             *
             * we also consider the failure message, for users with no physical devices. In that case we only send an
             * email.
             */
            if ((devicesForUserResponse !== null && devicesForUserResponse !== undefined && !devicesForUserResponse.errorMessage && !devicesForUserResponse.errorType
                && devicesForUserResponse.data && devicesForUserResponse.data.length !== 0) ||
                (devicesForUserResponse !== null && devicesForUserResponse !== undefined && devicesForUserResponse.errorType !== null && devicesForUserResponse.errorType !== undefined &&
                    devicesForUserResponse.errorType === moonbeam_models_1.UserDeviceErrorType.NoneOrAbsent)) {
                const deviceTokenIds = [];
                if (devicesForUserResponse.errorType !== null && devicesForUserResponse.errorType !== undefined &&
                    devicesForUserResponse.errorType === moonbeam_models_1.UserDeviceErrorType.NoneOrAbsent) {
                    console.log(`No physical devices found for user ${userDetailsReminder.id}`);
                }
                else {
                    if (devicesForUserResponse.data !== null && devicesForUserResponse.data !== undefined) {
                        // 2) Filter obtained devices based on their status (only consider the ones that are ACTIVE for the user).
                        for (const userDevice of devicesForUserResponse.data) {
                            userDevice.deviceState === moonbeam_models_1.UserDeviceState.Active && deviceTokenIds.push(userDevice.tokenId);
                        }
                    }
                }
                // determine what type of notification we have, and act accordingly
                for (const notificationChannel of userDetailsReminder.notificationChannelType) {
                    switch (notificationChannel) {
                        case moonbeam_models_1.NotificationChannelType.Email:
                            // 3) Call the createNotification Moonbeam AppSync API endpoint to create an email notification reminder
                            const createEmailNotificationResponse = await moonbeamClient.createNotification({
                                id: userDetailsReminder.id,
                                type: userDetailsReminder.notificationType,
                                channelType: moonbeam_models_1.NotificationChannelType.Email,
                                userFullName: `${userDetailsReminder.firstName} ${userDetailsReminder.lastName}`,
                                emailDestination: userDetailsReminder.email,
                                status: moonbeam_models_1.NotificationStatus.Sent
                            });
                            // check to see if the email notification call was successful or not
                            if (!createEmailNotificationResponse || createEmailNotificationResponse.errorMessage || createEmailNotificationResponse.errorType || !createEmailNotificationResponse.data) {
                                console.log(`Notification email event through Create Notification call failed`);
                                // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                                itemFailures.push({
                                    itemIdentifier: userNotificationReminderRecord.messageId
                                });
                            }
                            else {
                                console.log(`${moonbeam_models_1.NotificationType.CardLinkingReminder} notification email successfully sent to ${userDetailsReminder.id}`);
                            }
                            break;
                        case moonbeam_models_1.NotificationChannelType.Push:
                            // if there are user associated physical devices that are active, to send notifications to, then proceed accordingly
                            if (deviceTokenIds.length !== 0) {
                                // 3) Call the createNotification Moonbeam AppSync API endpoint to create a push notification reminder
                                const createPushNotificationResponse = await moonbeamClient.createNotification({
                                    id: userDetailsReminder.id,
                                    type: userDetailsReminder.notificationType,
                                    expoPushTokens: deviceTokenIds,
                                    channelType: moonbeam_models_1.NotificationChannelType.Push,
                                    status: moonbeam_models_1.NotificationStatus.Sent
                                });
                                // check to see if the email notification call was successful or not
                                if (!createPushNotificationResponse || createPushNotificationResponse.errorMessage || createPushNotificationResponse.errorType || !createPushNotificationResponse.data) {
                                    console.log(`Notification push event through Create Notification call failed`);
                                    // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                                    itemFailures.push({
                                        itemIdentifier: userNotificationReminderRecord.messageId
                                    });
                                }
                                else {
                                    console.log(`${moonbeam_models_1.NotificationType.CardLinkingReminder} notification push event successfully sent to ${userDetailsReminder.id}`);
                                }
                            }
                            break;
                        case moonbeam_models_1.NotificationChannelType.Sms:
                            break;
                        default:
                            console.log(`Unknown notification channel type passed in ${notificationChannel}`);
                            // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                            itemFailures.push({
                                itemIdentifier: userNotificationReminderRecord.messageId
                            });
                            break;
                    }
                }
            }
            else {
                console.log(`Physical Devices mapping through GET devices for user call failed`);
                // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                itemFailures.push({
                    itemIdentifier: userNotificationReminderRecord.messageId
                });
            }
        }
        /**
         * for the Lambda to indicate SQS that there have been no failures, and thus enable the deletion of all processed messages
         * from the queue, we have to return an empty batchItemFailures array here.
         *
         * @link https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html
         */
        return {
            batchItemFailures: itemFailures
        };
    }
    catch (error) {
        console.log(`Unexpected error while processing ${JSON.stringify(event)} notification reminder event ${error}`);
        /**
         * returns a batch response failure for the particular message IDs which failed
         * in this case, the Lambda function DOES NOT delete the incoming messages from the queue, and it makes it available/visible again
         *
         * @link https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html
         */
        return {
            batchItemFailures: [{
                    // for this case, we only process 1 record at a time, we might need to change this in the future
                    itemIdentifier: event.Records[0].messageId
                }]
        };
    }
};
exports.processNotificationReminder = processNotificationReminder;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTm90aWZpY2F0aW9uUmVtaW5kZXJQcm9jZXNzb3JIYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9yZXNvbHZlcnMvTm90aWZpY2F0aW9uUmVtaW5kZXJQcm9jZXNzb3JIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLCtEQVVtQztBQUVuQzs7Ozs7O0dBTUc7QUFDSSxNQUFNLDJCQUEyQixHQUFHLEtBQUssRUFBRSxLQUFlLEVBQTZCLEVBQUU7SUFDNUYsSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2Qzs7Ozs7Ozs7V0FRRztRQUNILE1BQU0sWUFBWSxHQUEwQixFQUFFLENBQUM7UUFFL0MsMkZBQTJGO1FBQzNGLEtBQUssTUFBTSw4QkFBOEIsSUFBSSxLQUFLLENBQUMsT0FBTyxFQUFFO1lBQ3hELHlHQUF5RztZQUN6RyxNQUFNLG1CQUFtQixHQUFnQyxJQUFJLENBQUMsS0FBSyxDQUFDLDhCQUE4QixDQUFDLElBQUksQ0FBZ0MsQ0FBQztZQUV4STs7Ozs7Ozs7O2VBU0c7WUFDQyx1R0FBdUc7WUFDM0csTUFBTSxjQUFjLEdBQUcsSUFBSSxnQ0FBYyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBRXpFLCtEQUErRDtZQUMvRCxNQUFNLHNCQUFzQixHQUF3QixNQUFNLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQztnQkFDdkYsRUFBRSxFQUFFLG1CQUFtQixDQUFDLEVBQUU7YUFDN0IsQ0FBQyxDQUFDO1lBRUg7Ozs7O2VBS0c7WUFDSCxJQUFJLENBQUMsc0JBQXNCLEtBQUssSUFBSSxJQUFJLHNCQUFzQixLQUFLLFNBQVMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLFlBQVksSUFBSSxDQUFDLHNCQUFzQixDQUFDLFNBQVM7bUJBQzlJLHNCQUFzQixDQUFD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SUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsZ0NBQWdDLEtBQUssRUFBRSxDQUFDLENBQUM7UUFFL0c7Ozs7O1dBS0c7UUFDSCxPQUFPO1lBQ0gsaUJBQWlCLEVBQUUsQ0FBQztvQkFDaEIsZ0dBQWdHO29CQUNoRyxjQUFjLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTO2lCQUM3QyxDQUFDO1NBQ0wsQ0FBQTtLQUNKO0FBQ0wsQ0FBQyxDQUFBO0FBL0pZLFFBQUEsMkJBQTJCLCtCQStKdkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1NRU0JhdGNoUmVzcG9uc2UsIFNRU0V2ZW50fSBmcm9tIFwiYXdzLWxhbWJkYVwiO1xuaW1wb3J0IHtTUVNCYXRjaEl0ZW1GYWlsdXJlfSBmcm9tIFwiYXdzLWxhbWJkYS90cmlnZ2VyL3Nxc1wiO1xuaW1wb3J0IHtcbiAgICBDcmVhdGVOb3RpZmljYXRpb25SZXNwb25zZSxcbiAgICBNb29uYmVhbUNsaWVudCxcbiAgICBOb3RpZmljYXRpb25DaGFubmVsVHlwZSxcbiAgICBOb3RpZmljYXRpb25TdGF0dXMsXG4gICAgTm90aWZpY2F0aW9uVHlwZSxcbiAgICBVc2VyRGV0YWlsc0Zvck5vdGlmaWNhdGlvbnMsXG4gICAgVXNlckRldmljZUVycm9yVHlwZSxcbiAgICBVc2VyRGV2aWNlc1Jlc3BvbnNlLFxuICAgIFVzZXJEZXZpY2VTdGF0ZVxufSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuXG4vKipcbiAqIE5vdGlmaWNhdGlvblJlbWluZGVyUHJvY2Vzc29yIGhhbmRsZXJcbiAqXG4gKiBAcGFyYW0gZXZlbnQgdGhlIHtAbGluayBTUVNFdmVudH0gdG8gYmUgcHJvY2Vzc2VkLCBjb250YWluaW5nIHRoZSBub3RpZmljYXRpb25cbiAqIHJlbWluZGVyIG1lc3NhZ2UgaW5mb3JtYXRpb25cbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgU1FTQmF0Y2hSZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IHByb2Nlc3NOb3RpZmljYXRpb25SZW1pbmRlciA9IGFzeW5jIChldmVudDogU1FTRXZlbnQpOiBQcm9taXNlPFNRU0JhdGNoUmVzcG9uc2U+ID0+IHtcbiAgICB0cnkge1xuICAgICAgICAvLyByZXRyaWV2aW5nIHRoZSBjdXJyZW50IGZ1bmN0aW9uIHJlZ2lvblxuICAgICAgICBjb25zdCByZWdpb24gPSBwcm9jZXNzLmVudi5BV1NfUkVHSU9OITtcblxuICAgICAgICAvKipcbiAgICAgICAgICogaW5pdGlhbGl6aW5nIHRoZSBiYXRjaCByZXNwb25zZSwgYXMgYW4gZW1wdHkgYXJyYXksIHRoYXQgd2lsbCBiZSBwb3B1bGF0ZWQgd2l0aCBlcnJvcnMsIGlmIGFueSB0aHJvdWdob3V0IHRoZSBwcm9jZXNzaW5nXG4gICAgICAgICAqXG4gICAgICAgICAqIGZvciB0aGUgTGFtYmRhIHRvIGluZGljYXRlIFNRUyB0aGF0IHRoZXJlIGhhdmUgYmVlbiBubyBmYWlsdXJlcywgYW5kIHRodXMgZW5hYmxlIHRoZSBkZWxldGlvbiBvZiBhbGwgcHJvY2Vzc2VkIG1lc3NhZ2VzXG4gICAgICAgICAqIGZyb20gdGhlIHF1ZXVlLCB3ZSBoYXZlIHRvIHJldHVybiBhbiBlbXB0eSBiYXRjaEl0ZW1GYWlsdXJlcyBhcnJheS4gSWYgd2Ugd2FudCB0byBpbmRpY2F0ZSB0aGF0IHRoZXJlIGhhdmUgYmVlbiBlcnJvcnMsXG4gICAgICAgICAqIGZvciBlYWNoIGluZGl2aWR1YWwgbWVzc2FnZSwgYmFzZWQgb24gaXRzIElELCB3ZSBoYXZlIHRvIGFkZCBpdCBpbiB0aGUgZmluYWwgYmF0Y2ggcmVzcG9uc2VcbiAgICAgICAgICpcbiAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2xhbWJkYS9sYXRlc3QvZGcvd2l0aC1zcXMuaHRtbFxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3QgaXRlbUZhaWx1cmVzOiBTUVNCYXRjaEl0ZW1GYWlsdXJlW10gPSBbXTtcblxuICAgICAgICAvLyBmb3IgZWFjaCByZWNvcmQgaW4gdGhlIGluY29taW5nIGV2ZW50LCByZXBlYXQgdGhlIG5vdGlmaWNhdGlvbiByZW1pbmRlciBwcm9jZXNzaW5nIHN0ZXBzXG4gICAgICAgIGZvciAoY29uc3QgdXNlck5vdGlmaWNhdGlvblJlbWluZGVyUmVjb3JkIG9mIGV2ZW50LlJlY29yZHMpIHtcbiAgICAgICAgICAgIC8vIGZpcnN0LCBjb252ZXJ0IHRoZSBpbmNvbWluZyBldmVudCBtZXNzYWdlIGJvZHksIGludG8gYSB1c2VyJ3MgZGV0YWlscyBmb3Igbm90aWZpY2F0aW9uIHJlbWluZGVyIG9iamVjdFxuICAgICAgICAgICAgY29uc3QgdXNlckRldGFpbHNSZW1pbmRlcjogVXNlckRldGFpbHNGb3JOb3RpZmljYXRpb25zID0gSlNPTi5wYXJzZSh1c2VyTm90aWZpY2F0aW9uUmVtaW5kZXJSZWNvcmQuYm9keSkgYXMgVXNlckRldGFpbHNGb3JOb3RpZmljYXRpb25zO1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFRoZSBvdmVyYWxsIG5vdGlmaWNhdGlvbiByZW1pbmRlciBwcm9jZXNzaW5nLCB3aWxsIGJlIG1hZGUgdXAgb2YgdGhlIGZvbGxvd2luZyBzdGVwczpcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiAxKSBDYWxsIHRoZSBnZXREZXZpY2VzRm9yVXNlciBNb29uYmVhbSBBcHBTeW5jIEFQSSBlbmRwb2ludCwgdG8gcmV0cmlldmUgYWxsIHBoeXNpY2FsIGRldmljZXMgYXNzb2NpYXRlZCB3aXRoIGFuXG4gICAgICAgICAgICAgKiBpbmNvbWluZyB1c2VyLlxuICAgICAgICAgICAgICogMikgRmlsdGVyIG9idGFpbmVkIGRldmljZXMgYmFzZWQgb24gdGhlaXIgc3RhdHVzIChvbmx5IGNvbnNpZGVyIHRoZSBvbmVzIHRoYXQgYXJlIEFDVElWRSBmb3IgdGhlIHVzZXIpLlxuICAgICAgICAgICAgICogMykgQ2FsbCB0aGUgY3JlYXRlTm90aWZpY2F0aW9uIE1vb25iZWFtIEFwcFN5bmMgQVBJIGVuZHBvaW50LCB0byBzZW5kIHRoZSBhcHByb3ByaWF0ZSBub3RpZmljYXRpb24gdGhyb3VnaFxuICAgICAgICAgICAgICogQ291cmllciBhY2NvcmRpbmdseSAoZW1haWwgKyBwdXNoIG5vdGlmaWNhdGlvbiBvciBvdGhlciBjaGFubmVscywgYWNjb3JkaW5nbHkpLlxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIC8vIGluaXRpYWxpemUgdGhlIE1vb25iZWFtIENsaWVudCBBUEkgaGVyZSwgaW4gb3JkZXIgdG8gY2FsbCB0aGUgYXBwcm9wcmlhdGUgZW5kcG9pbnRzIGZvciB0aGlzIGhhbmRsZXJcbiAgICAgICAgICAgIGNvbnN0IG1vb25iZWFtQ2xpZW50ID0gbmV3IE1vb25iZWFtQ2xpZW50KHByb2Nlc3MuZW52LkVOVl9OQU1FISwgcmVnaW9uKTtcblxuICAgICAgICAgICAgLy8gMSkgQ2FsbCB0aGUgZ2V0RGV2aWNlc0ZvclVzZXIgTW9vbmJlYW0gQXBwc3luYyBBUEkgZW5kcG9pbnQuXG4gICAgICAgICAgICBjb25zdCBkZXZpY2VzRm9yVXNlclJlc3BvbnNlOiBVc2VyRGV2aWNlc1Jlc3BvbnNlID0gYXdhaXQgbW9vbmJlYW1DbGllbnQuZ2V0RGV2aWNlc0ZvclVzZXIoe1xuICAgICAgICAgICAgICAgIGlkOiB1c2VyRGV0YWlsc1JlbWluZGVyLmlkXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBjaGVjayB0byBzZWUgaWYgdGhlIGdldCBkZXZpY2VzIGZvciB1c2VyIGNhbGwgd2FzIHN1Y2Nlc3NmdWwgb3Igbm90LlxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIHdlIGFsc28gY29uc2lkZXIgdGhlIGZhaWx1cmUgbWVzc2FnZSwgZm9yIHVzZXJzIHdpdGggbm8gcGh5c2ljYWwgZGV2aWNlcy4gSW4gdGhhdCBjYXNlIHdlIG9ubHkgc2VuZCBhblxuICAgICAgICAgICAgICogZW1haWwuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGlmICgoZGV2aWNlc0ZvclVzZXJSZXNwb25zZSAhPT0gbnVsbCAmJiBkZXZpY2VzRm9yVXNlclJlc3BvbnNlICE9PSB1bmRlZmluZWQgJiYgIWRldmljZXNGb3JVc2VyUmVzcG9uc2UuZXJyb3JNZXNzYWdlICYmICFkZXZpY2VzRm9yVXNlclJlc3BvbnNlLmVycm9yVHlwZVxuICAgICAgICAgICAgICAgICAgICAmJiBkZXZpY2VzRm9yVXNlclJlc3BvbnNlLmRhdGEgJiYgZGV2aWNlc0ZvclVzZXJSZXNwb25zZS5kYXRhLmxlbmd0aCAhPT0gMCkgfHxcbiAgICAgICAgICAgICAgICAoZGV2aWNlc0ZvclVzZXJSZXNwb25zZSAhPT0gbnVsbCAmJiBkZXZpY2VzRm9yVXNlclJlc3BvbnNlICE9PSB1bmRlZmluZWQgJiYgZGV2aWNlc0ZvclVzZXJSZXNwb25zZS5lcnJvclR5cGUgIT09IG51bGwgJiYgZGV2aWNlc0ZvclVzZXJSZXNwb25zZS5lcnJvclR5cGUgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgICAgICAgICBkZXZpY2VzRm9yVXNlclJlc3BvbnNlLmVycm9yVHlwZSA9PT0gVXNlckRldmljZUVycm9yVHlwZS5Ob25lT3JBYnNlbnQpKSB7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBkZXZpY2VUb2tlbklkczogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgICAgICAgICBpZiAoZGV2aWNlc0ZvclVzZXJSZXNwb25zZS5lcnJvclR5cGUgIT09IG51bGwgJiYgZGV2aWNlc0ZvclVzZXJSZXNwb25zZS5lcnJvclR5cGUgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgICAgICAgICBkZXZpY2VzRm9yVXNlclJlc3BvbnNlLmVycm9yVHlwZSA9PT0gVXNlckRldmljZUVycm9yVHlwZS5Ob25lT3JBYnNlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYE5vIHBoeXNpY2FsIGRldmljZXMgZm91bmQgZm9yIHVzZXIgJHt1c2VyRGV0YWlsc1JlbWluZGVyLmlkfWApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkZXZpY2VzRm9yVXNlclJlc3BvbnNlLmRhdGEgIT09IG51bGwgJiYgZGV2aWNlc0ZvclVzZXJSZXNwb25zZS5kYXRhICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIDIpIEZpbHRlciBvYnRhaW5lZCBkZXZpY2VzIGJhc2VkIG9uIHRoZWlyIHN0YXR1cyAob25seSBjb25zaWRlciB0aGUgb25lcyB0aGF0IGFyZSBBQ1RJVkUgZm9yIHRoZSB1c2VyKS5cbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgdXNlckRldmljZSBvZiBkZXZpY2VzRm9yVXNlclJlc3BvbnNlLmRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VyRGV2aWNlIS5kZXZpY2VTdGF0ZSA9PT0gVXNlckRldmljZVN0YXRlLkFjdGl2ZSAmJiBkZXZpY2VUb2tlbklkcy5wdXNoKHVzZXJEZXZpY2UhLnRva2VuSWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGRldGVybWluZSB3aGF0IHR5cGUgb2Ygbm90aWZpY2F0aW9uIHdlIGhhdmUsIGFuZCBhY3QgYWNjb3JkaW5nbHlcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IG5vdGlmaWNhdGlvbkNoYW5uZWwgb2YgdXNlckRldGFpbHNSZW1pbmRlci5ub3RpZmljYXRpb25DaGFubmVsVHlwZSkge1xuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKG5vdGlmaWNhdGlvbkNoYW5uZWwgYXMgTm90aWZpY2F0aW9uQ2hhbm5lbFR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgTm90aWZpY2F0aW9uQ2hhbm5lbFR5cGUuRW1haWw6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gMykgQ2FsbCB0aGUgY3JlYXRlTm90aWZpY2F0aW9uIE1vb25iZWFtIEFwcFN5bmMgQVBJIGVuZHBvaW50IHRvIGNyZWF0ZSBhbiBlbWFpbCBub3RpZmljYXRpb24gcmVtaW5kZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjcmVhdGVFbWFpbE5vdGlmaWNhdGlvblJlc3BvbnNlOiBDcmVhdGVOb3RpZmljYXRpb25SZXNwb25zZSA9IGF3YWl0IG1vb25iZWFtQ2xpZW50LmNyZWF0ZU5vdGlmaWNhdGlvbih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB1c2VyRGV0YWlsc1JlbWluZGVyLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiB1c2VyRGV0YWlsc1JlbWluZGVyLm5vdGlmaWNhdGlvblR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5uZWxUeXBlOiBOb3RpZmljYXRpb25DaGFubmVsVHlwZS5FbWFpbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlckZ1bGxOYW1lOiBgJHt1c2VyRGV0YWlsc1JlbWluZGVyLmZpcnN0TmFtZX0gJHt1c2VyRGV0YWlsc1JlbWluZGVyLmxhc3ROYW1lfWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVtYWlsRGVzdGluYXRpb246IHVzZXJEZXRhaWxzUmVtaW5kZXIuZW1haWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1czogTm90aWZpY2F0aW9uU3RhdHVzLlNlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGUgZW1haWwgbm90aWZpY2F0aW9uIGNhbGwgd2FzIHN1Y2Nlc3NmdWwgb3Igbm90XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFjcmVhdGVFbWFpbE5vdGlmaWNhdGlvblJlc3BvbnNlIHx8IGNyZWF0ZUVtYWlsTm90aWZpY2F0aW9uUmVzcG9uc2UuZXJyb3JNZXNzYWdlIHx8IGNyZWF0ZUVtYWlsTm90aWZpY2F0aW9uUmVzcG9uc2UuZXJyb3JUeXBlIHx8ICFjcmVhdGVFbWFpbE5vdGlmaWNhdGlvblJlc3BvbnNlLmRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYE5vdGlmaWNhdGlvbiBlbWFpbCBldmVudCB0aHJvdWdoIENyZWF0ZSBOb3RpZmljYXRpb24gY2FsbCBmYWlsZWRgKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhZGRzIGFuIGl0ZW0gZmFpbHVyZSwgZm9yIHRoZSBTUVMgbWVzc2FnZSB3aGljaCBmYWlsZWQgcHJvY2Vzc2luZywgYXMgcGFydCBvZiB0aGUgaW5jb21pbmcgZXZlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbUZhaWx1cmVzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbUlkZW50aWZpZXI6IHVzZXJOb3RpZmljYXRpb25SZW1pbmRlclJlY29yZC5tZXNzYWdlSWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCR7Tm90aWZpY2F0aW9uVHlwZS5DYXJkTGlua2luZ1JlbWluZGVyfSBub3RpZmljYXRpb24gZW1haWwgc3VjY2Vzc2Z1bGx5IHNlbnQgdG8gJHt1c2VyRGV0YWlsc1JlbWluZGVyLmlkfWApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgTm90aWZpY2F0aW9uQ2hhbm5lbFR5cGUuUHVzaDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpZiB0aGVyZSBhcmUgdXNlciBhc3NvY2lhdGVkIHBoeXNpY2FsIGRldmljZXMgdGhhdCBhcmUgYWN0aXZlLCB0byBzZW5kIG5vdGlmaWNhdGlvbnMgdG8sIHRoZW4gcHJvY2VlZCBhY2NvcmRpbmdseVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkZXZpY2VUb2tlbklkcy5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gMykgQ2FsbCB0aGUgY3JlYXRlTm90aWZpY2F0aW9uIE1vb25iZWFtIEFwcFN5bmMgQVBJIGVuZHBvaW50IHRvIGNyZWF0ZSBhIHB1c2ggbm90aWZpY2F0aW9uIHJlbWluZGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNyZWF0ZVB1c2hOb3RpZmljYXRpb25SZXNwb25zZTogQ3JlYXRlTm90aWZpY2F0aW9uUmVzcG9uc2UgPSBhd2FpdCBtb29uYmVhbUNsaWVudC5jcmVhdGVOb3RpZmljYXRpb24oe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHVzZXJEZXRhaWxzUmVtaW5kZXIuaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiB1c2VyRGV0YWlsc1JlbWluZGVyLm5vdGlmaWNhdGlvblR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHBvUHVzaFRva2VuczogZGV2aWNlVG9rZW5JZHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFubmVsVHlwZTogTm90aWZpY2F0aW9uQ2hhbm5lbFR5cGUuUHVzaCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1czogTm90aWZpY2F0aW9uU3RhdHVzLlNlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSBlbWFpbCBub3RpZmljYXRpb24gY2FsbCB3YXMgc3VjY2Vzc2Z1bCBvciBub3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFjcmVhdGVQdXNoTm90aWZpY2F0aW9uUmVzcG9uc2UgfHwgY3JlYXRlUHVzaE5vdGlmaWNhdGlvblJlc3BvbnNlLmVycm9yTWVzc2FnZSB8fCBjcmVhdGVQdXNoTm90aWZpY2F0aW9uUmVzcG9uc2UuZXJyb3JUeXBlIHx8ICFjcmVhdGVQdXNoTm90aWZpY2F0aW9uUmVzcG9uc2UuZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYE5vdGlmaWNhdGlvbiBwdXNoIGV2ZW50IHRocm91Z2ggQ3JlYXRlIE5vdGlmaWNhdGlvbiBjYWxsIGZhaWxlZGApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhZGRzIGFuIGl0ZW0gZmFpbHVyZSwgZm9yIHRoZSBTUVMgbWVzc2FnZSB3aGljaCBmYWlsZWQgcHJvY2Vzc2luZywgYXMgcGFydCBvZiB0aGUgaW5jb21pbmcgZXZlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1GYWlsdXJlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtSWRlbnRpZmllcjogdXNlck5vdGlmaWNhdGlvblJlbWluZGVyUmVjb3JkLm1lc3NhZ2VJZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtOb3RpZmljYXRpb25UeXBlLkNhcmRMaW5raW5nUmVtaW5kZXJ9IG5vdGlmaWNhdGlvbiBwdXNoIGV2ZW50IHN1Y2Nlc3NmdWxseSBzZW50IHRvICR7dXNlckRldGFpbHNSZW1pbmRlci5pZH1gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgTm90aWZpY2F0aW9uQ2hhbm5lbFR5cGUuU21zOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgVW5rbm93biBub3RpZmljYXRpb24gY2hhbm5lbCB0eXBlIHBhc3NlZCBpbiAke25vdGlmaWNhdGlvbkNoYW5uZWx9YClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhZGRzIGFuIGl0ZW0gZmFpbHVyZSwgZm9yIHRoZSBTUVMgbWVzc2FnZSB3aGljaCBmYWlsZWQgcHJvY2Vzc2luZywgYXMgcGFydCBvZiB0aGUgaW5jb21pbmcgZXZlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtRmFpbHVyZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1JZGVudGlmaWVyOiB1c2VyTm90aWZpY2F0aW9uUmVtaW5kZXJSZWNvcmQubWVzc2FnZUlkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBQaHlzaWNhbCBEZXZpY2VzIG1hcHBpbmcgdGhyb3VnaCBHRVQgZGV2aWNlcyBmb3IgdXNlciBjYWxsIGZhaWxlZGApO1xuXG4gICAgICAgICAgICAgICAgLy8gYWRkcyBhbiBpdGVtIGZhaWx1cmUsIGZvciB0aGUgU1FTIG1lc3NhZ2Ugd2hpY2ggZmFpbGVkIHByb2Nlc3NpbmcsIGFzIHBhcnQgb2YgdGhlIGluY29taW5nIGV2ZW50XG4gICAgICAgICAgICAgICAgaXRlbUZhaWx1cmVzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBpdGVtSWRlbnRpZmllcjogdXNlck5vdGlmaWNhdGlvblJlbWluZGVyUmVjb3JkLm1lc3NhZ2VJZFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIGZvciB0aGUgTGFtYmRhIHRvIGluZGljYXRlIFNRUyB0aGF0IHRoZXJlIGhhdmUgYmVlbiBubyBmYWlsdXJlcywgYW5kIHRodXMgZW5hYmxlIHRoZSBkZWxldGlvbiBvZiBhbGwgcHJvY2Vzc2VkIG1lc3NhZ2VzXG4gICAgICAgICAqIGZyb20gdGhlIHF1ZXVlLCB3ZSBoYXZlIHRvIHJldHVybiBhbiBlbXB0eSBiYXRjaEl0ZW1GYWlsdXJlcyBhcnJheSBoZXJlLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAbGluayBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vbGFtYmRhL2xhdGVzdC9kZy93aXRoLXNxcy5odG1sXG4gICAgICAgICAqL1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYmF0Y2hJdGVtRmFpbHVyZXM6IGl0ZW1GYWlsdXJlc1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5sb2coYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgcHJvY2Vzc2luZyAke0pTT04uc3RyaW5naWZ5KGV2ZW50KX0gbm90aWZpY2F0aW9uIHJlbWluZGVyIGV2ZW50ICR7ZXJyb3J9YCk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIHJldHVybnMgYSBiYXRjaCByZXNwb25zZSBmYWlsdXJlIGZvciB0aGUgcGFydGljdWxhciBtZXNzYWdlIElEcyB3aGljaCBmYWlsZWRcbiAgICAgICAgICogaW4gdGhpcyBjYXNlLCB0aGUgTGFtYmRhIGZ1bmN0aW9uIERPRVMgTk9UIGRlbGV0ZSB0aGUgaW5jb21pbmcgbWVzc2FnZXMgZnJvbSB0aGUgcXVldWUsIGFuZCBpdCBtYWtlcyBpdCBhdmFpbGFibGUvdmlzaWJsZSBhZ2FpblxuICAgICAgICAgKlxuICAgICAgICAgKiBAbGluayBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vbGFtYmRhL2xhdGVzdC9kZy93aXRoLXNxcy5odG1sXG4gICAgICAgICAqL1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYmF0Y2hJdGVtRmFpbHVyZXM6IFt7XG4gICAgICAgICAgICAgICAgLy8gZm9yIHRoaXMgY2FzZSwgd2Ugb25seSBwcm9jZXNzIDEgcmVjb3JkIGF0IGEgdGltZSwgd2UgbWlnaHQgbmVlZCB0byBjaGFuZ2UgdGhpcyBpbiB0aGUgZnV0dXJlXG4gICAgICAgICAgICAgICAgaXRlbUlkZW50aWZpZXI6IGV2ZW50LlJlY29yZHNbMF0ubWVzc2FnZUlkXG4gICAgICAgICAgICB9XVxuICAgICAgICB9XG4gICAgfVxufVxuIl19