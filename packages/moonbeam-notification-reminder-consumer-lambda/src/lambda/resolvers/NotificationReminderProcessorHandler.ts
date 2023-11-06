import {SQSBatchResponse, SQSEvent} from "aws-lambda";
import {SQSBatchItemFailure} from "aws-lambda/trigger/sqs";
import {
    CreateNotificationResponse,
    MoonbeamClient,
    NotificationChannelType,
    NotificationStatus,
    UserDetailsForNotifications,
    UserDeviceErrorType,
    UserDevicesResponse,
    UserDeviceState
} from "@moonbeam/moonbeam-models";

/**
 * NotificationReminderProcessor handler
 *
 * @param event the {@link SQSEvent} to be processed, containing the notification
 * reminder message information
 * @returns {@link Promise} of {@link SQSBatchResponse}
 */
export const processNotificationReminder = async (event: SQSEvent): Promise<SQSBatchResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        /**
         * initializing the batch response, as an empty array, that will be populated with errors, if any throughout the processing
         *
         * for the Lambda to indicate SQS that there have been no failures, and thus enable the deletion of all processed messages
         * from the queue, we have to return an empty batchItemFailures array. If we want to indicate that there have been errors,
         * for each individual message, based on its ID, we have to add it in the final batch response
         *
         * @link https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html
         */
        const itemFailures: SQSBatchItemFailure[] = [];

        // for each record in the incoming event, repeat the notification reminder processing steps
        for (const userNotificationReminderRecord of event.Records) {
            // first, convert the incoming event message body, into a user's details for notification reminder object
            const userDetailsReminder: UserDetailsForNotifications = JSON.parse(userNotificationReminderRecord.body) as UserDetailsForNotifications;

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
            const moonbeamClient = new MoonbeamClient(process.env.ENV_NAME!, region);

            // 1) Call the getDevicesForUser Moonbeam Appsync API endpoint.
            const devicesForUserResponse: UserDevicesResponse = await moonbeamClient.getDevicesForUser({
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
                    devicesForUserResponse.errorType === UserDeviceErrorType.NoneOrAbsent)) {

                const deviceTokenIds: string[] = [];
                if (devicesForUserResponse.errorType !== null && devicesForUserResponse.errorType !== undefined &&
                    devicesForUserResponse.errorType === UserDeviceErrorType.NoneOrAbsent) {
                    console.log(`No physical devices found for user ${userDetailsReminder.id}`);
                } else {
                    if (devicesForUserResponse.data !== null && devicesForUserResponse.data !== undefined) {
                        // 2) Filter obtained devices based on their status (only consider the ones that are ACTIVE for the user).
                        for (const userDevice of devicesForUserResponse.data) {
                            userDevice!.deviceState === UserDeviceState.Active && deviceTokenIds.push(userDevice!.tokenId);
                        }
                    }
                }
                // determine what type of notification we have, and act accordingly
                for (const notificationChannel of userDetailsReminder.notificationChannelType) {
                    switch (notificationChannel as NotificationChannelType) {
                        case NotificationChannelType.Email:
                            // 3) Call the createNotification Moonbeam AppSync API endpoint to create an email notification reminder
                            const createEmailNotificationResponse: CreateNotificationResponse = await moonbeamClient.createNotification({
                                id: userDetailsReminder.id,
                                type: userDetailsReminder.notificationType,
                                channelType: NotificationChannelType.Email,
                                userFullName: `${userDetailsReminder.firstName} ${userDetailsReminder.lastName}`,
                                emailDestination: userDetailsReminder.email,
                                status: NotificationStatus.Sent
                            });

                            // check to see if the email notification call was successful or not
                            if (!createEmailNotificationResponse || createEmailNotificationResponse.errorMessage || createEmailNotificationResponse.errorType || !createEmailNotificationResponse.data) {
                                console.log(`Notification email event through Create Notification call failed`);

                                // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                                itemFailures.push({
                                    itemIdentifier: userNotificationReminderRecord.messageId
                                });
                            } else {
                                console.log(`${userDetailsReminder.notificationType} notification email successfully sent to ${userDetailsReminder.id}`);
                            }
                            break;
                        case NotificationChannelType.Push:
                            // if there are user associated physical devices that are active, to send notifications to, then proceed accordingly
                            if (deviceTokenIds.length !== 0) {
                                // 3) Call the createNotification Moonbeam AppSync API endpoint to create a push notification reminder
                                const createPushNotificationResponse: CreateNotificationResponse = await moonbeamClient.createNotification({
                                    id: userDetailsReminder.id,
                                    type: userDetailsReminder.notificationType,
                                    expoPushTokens: deviceTokenIds,
                                    channelType: NotificationChannelType.Push,
                                    status: NotificationStatus.Sent
                                });

                                // check to see if the email notification call was successful or not
                                if (!createPushNotificationResponse || createPushNotificationResponse.errorMessage || createPushNotificationResponse.errorType || !createPushNotificationResponse.data) {
                                    console.log(`Notification push event through Create Notification call failed`);

                                    // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                                    itemFailures.push({
                                        itemIdentifier: userNotificationReminderRecord.messageId
                                    });
                                } else {
                                    console.log(`${userDetailsReminder.notificationType} notification push event successfully sent to ${userDetailsReminder.id}`);
                                }
                            }
                            break;
                        case NotificationChannelType.Sms:
                            break;
                        default:
                            console.log(`Unknown notification channel type passed in ${notificationChannel}`)
                            // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                            itemFailures.push({
                                itemIdentifier: userNotificationReminderRecord.messageId
                            });
                            break;
                    }
                }
            } else {
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
        }
    } catch (error) {
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
        }
    }
}
