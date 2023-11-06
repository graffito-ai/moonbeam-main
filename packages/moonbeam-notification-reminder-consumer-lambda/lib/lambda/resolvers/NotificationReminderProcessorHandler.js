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
                                console.log(`${userDetailsReminder.notificationType} notification email successfully sent to ${userDetailsReminder.id}`);
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
                                    console.log(`${userDetailsReminder.notificationType} notification push event successfully sent to ${userDetailsReminder.id}`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTm90aWZpY2F0aW9uUmVtaW5kZXJQcm9jZXNzb3JIYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9yZXNvbHZlcnMvTm90aWZpY2F0aW9uUmVtaW5kZXJQcm9jZXNzb3JIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLCtEQVNtQztBQUVuQzs7Ozs7O0dBTUc7QUFDSSxNQUFNLDJCQUEyQixHQUFHLEtBQUssRUFBRSxLQUFlLEVBQTZCLEVBQUU7SUFDNUYsSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2Qzs7Ozs7Ozs7V0FRRztRQUNILE1BQU0sWUFBWSxHQUEwQixFQUFFLENBQUM7UUFFL0MsMkZBQTJGO1FBQzNGLEtBQUssTUFBTSw4QkFBOEIsSUFBSSxLQUFLLENBQUMsT0FBTyxFQUFFO1lBQ3hELHlHQUF5RztZQUN6RyxNQUFNLG1CQUFtQixHQUFnQyxJQUFJLENBQUMsS0FBSyxDQUFDLDhCQUE4QixDQUFDLElBQUksQ0FBZ0MsQ0FBQztZQUV4STs7Ozs7Ozs7O2VBU0c7WUFDQyx1R0FBdUc7WUFDM0csTUFBTSxjQUFjLEdBQUcsSUFBSSxnQ0FBYyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBRXpFLCtEQUErRDtZQUMvRCxNQUFNLHNCQUFzQixHQUF3QixNQUFNLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQztnQkFDdkYsRUFBRSxFQUFFLG1CQUFtQixDQUFDLEVBQUU7YUFDN0IsQ0FBQyxDQUFDO1lBRUg7Ozs7O2VBS0c7WUFDSCxJQUFJLENBQUMsc0JBQXNCLEtBQUssSUFBSSxJQUFJLHNCQUFzQixLQUFLLFNBQVMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLFlBQVksSUFBSSxDQUFDLHNCQUFzQixDQUFDLFNBQVM7bUJBQzlJLHNCQUFzQixDQUFD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SUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsZ0NBQWdDLEtBQUssRUFBRSxDQUFDLENBQUM7UUFFL0c7Ozs7O1dBS0c7UUFDSCxPQUFPO1lBQ0gsaUJBQWlCLEVBQUUsQ0FBQztvQkFDaEIsZ0dBQWdHO29CQUNoRyxjQUFjLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTO2lCQUM3QyxDQUFDO1NBQ0wsQ0FBQTtLQUNKO0FBQ0wsQ0FBQyxDQUFBO0FBL0pZLFFBQUEsMkJBQTJCLCtCQStKdkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1NRU0JhdGNoUmVzcG9uc2UsIFNRU0V2ZW50fSBmcm9tIFwiYXdzLWxhbWJkYVwiO1xuaW1wb3J0IHtTUVNCYXRjaEl0ZW1GYWlsdXJlfSBmcm9tIFwiYXdzLWxhbWJkYS90cmlnZ2VyL3Nxc1wiO1xuaW1wb3J0IHtcbiAgICBDcmVhdGVOb3RpZmljYXRpb25SZXNwb25zZSxcbiAgICBNb29uYmVhbUNsaWVudCxcbiAgICBOb3RpZmljYXRpb25DaGFubmVsVHlwZSxcbiAgICBOb3RpZmljYXRpb25TdGF0dXMsXG4gICAgVXNlckRldGFpbHNGb3JOb3RpZmljYXRpb25zLFxuICAgIFVzZXJEZXZpY2VFcnJvclR5cGUsXG4gICAgVXNlckRldmljZXNSZXNwb25zZSxcbiAgICBVc2VyRGV2aWNlU3RhdGVcbn0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcblxuLyoqXG4gKiBOb3RpZmljYXRpb25SZW1pbmRlclByb2Nlc3NvciBoYW5kbGVyXG4gKlxuICogQHBhcmFtIGV2ZW50IHRoZSB7QGxpbmsgU1FTRXZlbnR9IHRvIGJlIHByb2Nlc3NlZCwgY29udGFpbmluZyB0aGUgbm90aWZpY2F0aW9uXG4gKiByZW1pbmRlciBtZXNzYWdlIGluZm9ybWF0aW9uXG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIFNRU0JhdGNoUmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCBwcm9jZXNzTm90aWZpY2F0aW9uUmVtaW5kZXIgPSBhc3luYyAoZXZlbnQ6IFNRU0V2ZW50KTogUHJvbWlzZTxTUVNCYXRjaFJlc3BvbnNlPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gcmV0cmlldmluZyB0aGUgY3VycmVudCBmdW5jdGlvbiByZWdpb25cbiAgICAgICAgY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiE7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIGluaXRpYWxpemluZyB0aGUgYmF0Y2ggcmVzcG9uc2UsIGFzIGFuIGVtcHR5IGFycmF5LCB0aGF0IHdpbGwgYmUgcG9wdWxhdGVkIHdpdGggZXJyb3JzLCBpZiBhbnkgdGhyb3VnaG91dCB0aGUgcHJvY2Vzc2luZ1xuICAgICAgICAgKlxuICAgICAgICAgKiBmb3IgdGhlIExhbWJkYSB0byBpbmRpY2F0ZSBTUVMgdGhhdCB0aGVyZSBoYXZlIGJlZW4gbm8gZmFpbHVyZXMsIGFuZCB0aHVzIGVuYWJsZSB0aGUgZGVsZXRpb24gb2YgYWxsIHByb2Nlc3NlZCBtZXNzYWdlc1xuICAgICAgICAgKiBmcm9tIHRoZSBxdWV1ZSwgd2UgaGF2ZSB0byByZXR1cm4gYW4gZW1wdHkgYmF0Y2hJdGVtRmFpbHVyZXMgYXJyYXkuIElmIHdlIHdhbnQgdG8gaW5kaWNhdGUgdGhhdCB0aGVyZSBoYXZlIGJlZW4gZXJyb3JzLFxuICAgICAgICAgKiBmb3IgZWFjaCBpbmRpdmlkdWFsIG1lc3NhZ2UsIGJhc2VkIG9uIGl0cyBJRCwgd2UgaGF2ZSB0byBhZGQgaXQgaW4gdGhlIGZpbmFsIGJhdGNoIHJlc3BvbnNlXG4gICAgICAgICAqXG4gICAgICAgICAqIEBsaW5rIGh0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9sYW1iZGEvbGF0ZXN0L2RnL3dpdGgtc3FzLmh0bWxcbiAgICAgICAgICovXG4gICAgICAgIGNvbnN0IGl0ZW1GYWlsdXJlczogU1FTQmF0Y2hJdGVtRmFpbHVyZVtdID0gW107XG5cbiAgICAgICAgLy8gZm9yIGVhY2ggcmVjb3JkIGluIHRoZSBpbmNvbWluZyBldmVudCwgcmVwZWF0IHRoZSBub3RpZmljYXRpb24gcmVtaW5kZXIgcHJvY2Vzc2luZyBzdGVwc1xuICAgICAgICBmb3IgKGNvbnN0IHVzZXJOb3RpZmljYXRpb25SZW1pbmRlclJlY29yZCBvZiBldmVudC5SZWNvcmRzKSB7XG4gICAgICAgICAgICAvLyBmaXJzdCwgY29udmVydCB0aGUgaW5jb21pbmcgZXZlbnQgbWVzc2FnZSBib2R5LCBpbnRvIGEgdXNlcidzIGRldGFpbHMgZm9yIG5vdGlmaWNhdGlvbiByZW1pbmRlciBvYmplY3RcbiAgICAgICAgICAgIGNvbnN0IHVzZXJEZXRhaWxzUmVtaW5kZXI6IFVzZXJEZXRhaWxzRm9yTm90aWZpY2F0aW9ucyA9IEpTT04ucGFyc2UodXNlck5vdGlmaWNhdGlvblJlbWluZGVyUmVjb3JkLmJvZHkpIGFzIFVzZXJEZXRhaWxzRm9yTm90aWZpY2F0aW9ucztcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBUaGUgb3ZlcmFsbCBub3RpZmljYXRpb24gcmVtaW5kZXIgcHJvY2Vzc2luZywgd2lsbCBiZSBtYWRlIHVwIG9mIHRoZSBmb2xsb3dpbmcgc3RlcHM6XG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogMSkgQ2FsbCB0aGUgZ2V0RGV2aWNlc0ZvclVzZXIgTW9vbmJlYW0gQXBwU3luYyBBUEkgZW5kcG9pbnQsIHRvIHJldHJpZXZlIGFsbCBwaHlzaWNhbCBkZXZpY2VzIGFzc29jaWF0ZWQgd2l0aCBhblxuICAgICAgICAgICAgICogaW5jb21pbmcgdXNlci5cbiAgICAgICAgICAgICAqIDIpIEZpbHRlciBvYnRhaW5lZCBkZXZpY2VzIGJhc2VkIG9uIHRoZWlyIHN0YXR1cyAob25seSBjb25zaWRlciB0aGUgb25lcyB0aGF0IGFyZSBBQ1RJVkUgZm9yIHRoZSB1c2VyKS5cbiAgICAgICAgICAgICAqIDMpIENhbGwgdGhlIGNyZWF0ZU5vdGlmaWNhdGlvbiBNb29uYmVhbSBBcHBTeW5jIEFQSSBlbmRwb2ludCwgdG8gc2VuZCB0aGUgYXBwcm9wcmlhdGUgbm90aWZpY2F0aW9uIHRocm91Z2hcbiAgICAgICAgICAgICAqIENvdXJpZXIgYWNjb3JkaW5nbHkgKGVtYWlsICsgcHVzaCBub3RpZmljYXRpb24gb3Igb3RoZXIgY2hhbm5lbHMsIGFjY29yZGluZ2x5KS5cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAvLyBpbml0aWFsaXplIHRoZSBNb29uYmVhbSBDbGllbnQgQVBJIGhlcmUsIGluIG9yZGVyIHRvIGNhbGwgdGhlIGFwcHJvcHJpYXRlIGVuZHBvaW50cyBmb3IgdGhpcyBoYW5kbGVyXG4gICAgICAgICAgICBjb25zdCBtb29uYmVhbUNsaWVudCA9IG5ldyBNb29uYmVhbUNsaWVudChwcm9jZXNzLmVudi5FTlZfTkFNRSEsIHJlZ2lvbik7XG5cbiAgICAgICAgICAgIC8vIDEpIENhbGwgdGhlIGdldERldmljZXNGb3JVc2VyIE1vb25iZWFtIEFwcHN5bmMgQVBJIGVuZHBvaW50LlxuICAgICAgICAgICAgY29uc3QgZGV2aWNlc0ZvclVzZXJSZXNwb25zZTogVXNlckRldmljZXNSZXNwb25zZSA9IGF3YWl0IG1vb25iZWFtQ2xpZW50LmdldERldmljZXNGb3JVc2VyKHtcbiAgICAgICAgICAgICAgICBpZDogdXNlckRldGFpbHNSZW1pbmRlci5pZFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogY2hlY2sgdG8gc2VlIGlmIHRoZSBnZXQgZGV2aWNlcyBmb3IgdXNlciBjYWxsIHdhcyBzdWNjZXNzZnVsIG9yIG5vdC5cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiB3ZSBhbHNvIGNvbnNpZGVyIHRoZSBmYWlsdXJlIG1lc3NhZ2UsIGZvciB1c2VycyB3aXRoIG5vIHBoeXNpY2FsIGRldmljZXMuIEluIHRoYXQgY2FzZSB3ZSBvbmx5IHNlbmQgYW5cbiAgICAgICAgICAgICAqIGVtYWlsLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBpZiAoKGRldmljZXNGb3JVc2VyUmVzcG9uc2UgIT09IG51bGwgJiYgZGV2aWNlc0ZvclVzZXJSZXNwb25zZSAhPT0gdW5kZWZpbmVkICYmICFkZXZpY2VzRm9yVXNlclJlc3BvbnNlLmVycm9yTWVzc2FnZSAmJiAhZGV2aWNlc0ZvclVzZXJSZXNwb25zZS5lcnJvclR5cGVcbiAgICAgICAgICAgICAgICAgICAgJiYgZGV2aWNlc0ZvclVzZXJSZXNwb25zZS5kYXRhICYmIGRldmljZXNGb3JVc2VyUmVzcG9uc2UuZGF0YS5sZW5ndGggIT09IDApIHx8XG4gICAgICAgICAgICAgICAgKGRldmljZXNGb3JVc2VyUmVzcG9uc2UgIT09IG51bGwgJiYgZGV2aWNlc0ZvclVzZXJSZXNwb25zZSAhPT0gdW5kZWZpbmVkICYmIGRldmljZXNGb3JVc2VyUmVzcG9uc2UuZXJyb3JUeXBlICE9PSBudWxsICYmIGRldmljZXNGb3JVc2VyUmVzcG9uc2UuZXJyb3JUeXBlICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgZGV2aWNlc0ZvclVzZXJSZXNwb25zZS5lcnJvclR5cGUgPT09IFVzZXJEZXZpY2VFcnJvclR5cGUuTm9uZU9yQWJzZW50KSkge1xuXG4gICAgICAgICAgICAgICAgY29uc3QgZGV2aWNlVG9rZW5JZHM6IHN0cmluZ1tdID0gW107XG4gICAgICAgICAgICAgICAgaWYgKGRldmljZXNGb3JVc2VyUmVzcG9uc2UuZXJyb3JUeXBlICE9PSBudWxsICYmIGRldmljZXNGb3JVc2VyUmVzcG9uc2UuZXJyb3JUeXBlICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgZGV2aWNlc0ZvclVzZXJSZXNwb25zZS5lcnJvclR5cGUgPT09IFVzZXJEZXZpY2VFcnJvclR5cGUuTm9uZU9yQWJzZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBObyBwaHlzaWNhbCBkZXZpY2VzIGZvdW5kIGZvciB1c2VyICR7dXNlckRldGFpbHNSZW1pbmRlci5pZH1gKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZGV2aWNlc0ZvclVzZXJSZXNwb25zZS5kYXRhICE9PSBudWxsICYmIGRldmljZXNGb3JVc2VyUmVzcG9uc2UuZGF0YSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAyKSBGaWx0ZXIgb2J0YWluZWQgZGV2aWNlcyBiYXNlZCBvbiB0aGVpciBzdGF0dXMgKG9ubHkgY29uc2lkZXIgdGhlIG9uZXMgdGhhdCBhcmUgQUNUSVZFIGZvciB0aGUgdXNlcikuXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHVzZXJEZXZpY2Ugb2YgZGV2aWNlc0ZvclVzZXJSZXNwb25zZS5kYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlckRldmljZSEuZGV2aWNlU3RhdGUgPT09IFVzZXJEZXZpY2VTdGF0ZS5BY3RpdmUgJiYgZGV2aWNlVG9rZW5JZHMucHVzaCh1c2VyRGV2aWNlIS50b2tlbklkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBkZXRlcm1pbmUgd2hhdCB0eXBlIG9mIG5vdGlmaWNhdGlvbiB3ZSBoYXZlLCBhbmQgYWN0IGFjY29yZGluZ2x5XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBub3RpZmljYXRpb25DaGFubmVsIG9mIHVzZXJEZXRhaWxzUmVtaW5kZXIubm90aWZpY2F0aW9uQ2hhbm5lbFR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChub3RpZmljYXRpb25DaGFubmVsIGFzIE5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIE5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlLkVtYWlsOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDMpIENhbGwgdGhlIGNyZWF0ZU5vdGlmaWNhdGlvbiBNb29uYmVhbSBBcHBTeW5jIEFQSSBlbmRwb2ludCB0byBjcmVhdGUgYW4gZW1haWwgbm90aWZpY2F0aW9uIHJlbWluZGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY3JlYXRlRW1haWxOb3RpZmljYXRpb25SZXNwb25zZTogQ3JlYXRlTm90aWZpY2F0aW9uUmVzcG9uc2UgPSBhd2FpdCBtb29uYmVhbUNsaWVudC5jcmVhdGVOb3RpZmljYXRpb24oe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogdXNlckRldGFpbHNSZW1pbmRlci5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogdXNlckRldGFpbHNSZW1pbmRlci5ub3RpZmljYXRpb25UeXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFubmVsVHlwZTogTm90aWZpY2F0aW9uQ2hhbm5lbFR5cGUuRW1haWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJGdWxsTmFtZTogYCR7dXNlckRldGFpbHNSZW1pbmRlci5maXJzdE5hbWV9ICR7dXNlckRldGFpbHNSZW1pbmRlci5sYXN0TmFtZX1gLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbWFpbERlc3RpbmF0aW9uOiB1c2VyRGV0YWlsc1JlbWluZGVyLmVtYWlsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IE5vdGlmaWNhdGlvblN0YXR1cy5TZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIGVtYWlsIG5vdGlmaWNhdGlvbiBjYWxsIHdhcyBzdWNjZXNzZnVsIG9yIG5vdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghY3JlYXRlRW1haWxOb3RpZmljYXRpb25SZXNwb25zZSB8fCBjcmVhdGVFbWFpbE5vdGlmaWNhdGlvblJlc3BvbnNlLmVycm9yTWVzc2FnZSB8fCBjcmVhdGVFbWFpbE5vdGlmaWNhdGlvblJlc3BvbnNlLmVycm9yVHlwZSB8fCAhY3JlYXRlRW1haWxOb3RpZmljYXRpb25SZXNwb25zZS5kYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBOb3RpZmljYXRpb24gZW1haWwgZXZlbnQgdGhyb3VnaCBDcmVhdGUgTm90aWZpY2F0aW9uIGNhbGwgZmFpbGVkYCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYWRkcyBhbiBpdGVtIGZhaWx1cmUsIGZvciB0aGUgU1FTIG1lc3NhZ2Ugd2hpY2ggZmFpbGVkIHByb2Nlc3NpbmcsIGFzIHBhcnQgb2YgdGhlIGluY29taW5nIGV2ZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1GYWlsdXJlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1JZGVudGlmaWVyOiB1c2VyTm90aWZpY2F0aW9uUmVtaW5kZXJSZWNvcmQubWVzc2FnZUlkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke3VzZXJEZXRhaWxzUmVtaW5kZXIubm90aWZpY2F0aW9uVHlwZX0gbm90aWZpY2F0aW9uIGVtYWlsIHN1Y2Nlc3NmdWxseSBzZW50IHRvICR7dXNlckRldGFpbHNSZW1pbmRlci5pZH1gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIE5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlLlB1c2g6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWYgdGhlcmUgYXJlIHVzZXIgYXNzb2NpYXRlZCBwaHlzaWNhbCBkZXZpY2VzIHRoYXQgYXJlIGFjdGl2ZSwgdG8gc2VuZCBub3RpZmljYXRpb25zIHRvLCB0aGVuIHByb2NlZWQgYWNjb3JkaW5nbHlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGV2aWNlVG9rZW5JZHMubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDMpIENhbGwgdGhlIGNyZWF0ZU5vdGlmaWNhdGlvbiBNb29uYmVhbSBBcHBTeW5jIEFQSSBlbmRwb2ludCB0byBjcmVhdGUgYSBwdXNoIG5vdGlmaWNhdGlvbiByZW1pbmRlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjcmVhdGVQdXNoTm90aWZpY2F0aW9uUmVzcG9uc2U6IENyZWF0ZU5vdGlmaWNhdGlvblJlc3BvbnNlID0gYXdhaXQgbW9vbmJlYW1DbGllbnQuY3JlYXRlTm90aWZpY2F0aW9uKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB1c2VyRGV0YWlsc1JlbWluZGVyLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogdXNlckRldGFpbHNSZW1pbmRlci5ub3RpZmljYXRpb25UeXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwb1B1c2hUb2tlbnM6IGRldmljZVRva2VuSWRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhbm5lbFR5cGU6IE5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlLlB1c2gsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IE5vdGlmaWNhdGlvblN0YXR1cy5TZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGUgZW1haWwgbm90aWZpY2F0aW9uIGNhbGwgd2FzIHN1Y2Nlc3NmdWwgb3Igbm90XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghY3JlYXRlUHVzaE5vdGlmaWNhdGlvblJlc3BvbnNlIHx8IGNyZWF0ZVB1c2hOb3RpZmljYXRpb25SZXNwb25zZS5lcnJvck1lc3NhZ2UgfHwgY3JlYXRlUHVzaE5vdGlmaWNhdGlvblJlc3BvbnNlLmVycm9yVHlwZSB8fCAhY3JlYXRlUHVzaE5vdGlmaWNhdGlvblJlc3BvbnNlLmRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBOb3RpZmljYXRpb24gcHVzaCBldmVudCB0aHJvdWdoIENyZWF0ZSBOb3RpZmljYXRpb24gY2FsbCBmYWlsZWRgKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYWRkcyBhbiBpdGVtIGZhaWx1cmUsIGZvciB0aGUgU1FTIG1lc3NhZ2Ugd2hpY2ggZmFpbGVkIHByb2Nlc3NpbmcsIGFzIHBhcnQgb2YgdGhlIGluY29taW5nIGV2ZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtRmFpbHVyZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbUlkZW50aWZpZXI6IHVzZXJOb3RpZmljYXRpb25SZW1pbmRlclJlY29yZC5tZXNzYWdlSWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCR7dXNlckRldGFpbHNSZW1pbmRlci5ub3RpZmljYXRpb25UeXBlfSBub3RpZmljYXRpb24gcHVzaCBldmVudCBzdWNjZXNzZnVsbHkgc2VudCB0byAke3VzZXJEZXRhaWxzUmVtaW5kZXIuaWR9YCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIE5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlLlNtczpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFVua25vd24gbm90aWZpY2F0aW9uIGNoYW5uZWwgdHlwZSBwYXNzZWQgaW4gJHtub3RpZmljYXRpb25DaGFubmVsfWApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYWRkcyBhbiBpdGVtIGZhaWx1cmUsIGZvciB0aGUgU1FTIG1lc3NhZ2Ugd2hpY2ggZmFpbGVkIHByb2Nlc3NpbmcsIGFzIHBhcnQgb2YgdGhlIGluY29taW5nIGV2ZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbUZhaWx1cmVzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtSWRlbnRpZmllcjogdXNlck5vdGlmaWNhdGlvblJlbWluZGVyUmVjb3JkLm1lc3NhZ2VJZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgUGh5c2ljYWwgRGV2aWNlcyBtYXBwaW5nIHRocm91Z2ggR0VUIGRldmljZXMgZm9yIHVzZXIgY2FsbCBmYWlsZWRgKTtcblxuICAgICAgICAgICAgICAgIC8vIGFkZHMgYW4gaXRlbSBmYWlsdXJlLCBmb3IgdGhlIFNRUyBtZXNzYWdlIHdoaWNoIGZhaWxlZCBwcm9jZXNzaW5nLCBhcyBwYXJ0IG9mIHRoZSBpbmNvbWluZyBldmVudFxuICAgICAgICAgICAgICAgIGl0ZW1GYWlsdXJlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbUlkZW50aWZpZXI6IHVzZXJOb3RpZmljYXRpb25SZW1pbmRlclJlY29yZC5tZXNzYWdlSWRcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBmb3IgdGhlIExhbWJkYSB0byBpbmRpY2F0ZSBTUVMgdGhhdCB0aGVyZSBoYXZlIGJlZW4gbm8gZmFpbHVyZXMsIGFuZCB0aHVzIGVuYWJsZSB0aGUgZGVsZXRpb24gb2YgYWxsIHByb2Nlc3NlZCBtZXNzYWdlc1xuICAgICAgICAgKiBmcm9tIHRoZSBxdWV1ZSwgd2UgaGF2ZSB0byByZXR1cm4gYW4gZW1wdHkgYmF0Y2hJdGVtRmFpbHVyZXMgYXJyYXkgaGVyZS5cbiAgICAgICAgICpcbiAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2xhbWJkYS9sYXRlc3QvZGcvd2l0aC1zcXMuaHRtbFxuICAgICAgICAgKi9cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGJhdGNoSXRlbUZhaWx1cmVzOiBpdGVtRmFpbHVyZXNcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHByb2Nlc3NpbmcgJHtKU09OLnN0cmluZ2lmeShldmVudCl9IG5vdGlmaWNhdGlvbiByZW1pbmRlciBldmVudCAke2Vycm9yfWApO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiByZXR1cm5zIGEgYmF0Y2ggcmVzcG9uc2UgZmFpbHVyZSBmb3IgdGhlIHBhcnRpY3VsYXIgbWVzc2FnZSBJRHMgd2hpY2ggZmFpbGVkXG4gICAgICAgICAqIGluIHRoaXMgY2FzZSwgdGhlIExhbWJkYSBmdW5jdGlvbiBET0VTIE5PVCBkZWxldGUgdGhlIGluY29taW5nIG1lc3NhZ2VzIGZyb20gdGhlIHF1ZXVlLCBhbmQgaXQgbWFrZXMgaXQgYXZhaWxhYmxlL3Zpc2libGUgYWdhaW5cbiAgICAgICAgICpcbiAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2xhbWJkYS9sYXRlc3QvZGcvd2l0aC1zcXMuaHRtbFxuICAgICAgICAgKi9cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGJhdGNoSXRlbUZhaWx1cmVzOiBbe1xuICAgICAgICAgICAgICAgIC8vIGZvciB0aGlzIGNhc2UsIHdlIG9ubHkgcHJvY2VzcyAxIHJlY29yZCBhdCBhIHRpbWUsIHdlIG1pZ2h0IG5lZWQgdG8gY2hhbmdlIHRoaXMgaW4gdGhlIGZ1dHVyZVxuICAgICAgICAgICAgICAgIGl0ZW1JZGVudGlmaWVyOiBldmVudC5SZWNvcmRzWzBdLm1lc3NhZ2VJZFxuICAgICAgICAgICAgfV1cbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==