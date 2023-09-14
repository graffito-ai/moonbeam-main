import {SQSBatchResponse, SQSEvent} from "aws-lambda";
import {SQSBatchItemFailure} from "aws-lambda/trigger/sqs";
import {
    CreateNotificationResponse,
    EmailFromCognitoResponse,
    MilitaryVerificationNotificationUpdate,
    MilitaryVerificationStatusType,
    MoonbeamClient, NotificationChannelType, NotificationStatus,
    NotificationType,
    UserDevicesResponse,
    UserDeviceState
} from "@moonbeam/moonbeam-models";

/**
 * MilitaryVerificationUpdatesProcessorHandler handler
 *
 * @param event the {@link SQSEvent} to be processed, containing the military verification update
 * message information
 * @returns {@link Promise} of {@link SQSBatchResponse}
 */
export const processMilitaryVerificationUpdate = async (event: SQSEvent): Promise<SQSBatchResponse> => {
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

        // for each record in the incoming event, repeat the military verification update/notification steps
        for (const militaryVerificationUpdateRecord of event.Records) {
            // first, convert the incoming event message body, into a MilitaryVerificationNotificationUpdate object
            const militaryVerificationNotificationUpdate: MilitaryVerificationNotificationUpdate = JSON.parse(militaryVerificationUpdateRecord.body) as MilitaryVerificationNotificationUpdate;

            /**
             * The overall military verification update/notification event processing, will be made up of the following steps:
             *
             * 1) Call the getDevicesForUser Moonbeam AppSync API endpoint, to retrieve all physical devices associated with an
             * incoming user.
             * 2) Filter obtained devices based on their status (only consider the ones that are ACTIVE for the user).
             * 3) Retrieve the email of a user based on their id
             * 4) Call the createNotification Moonbeam AppSync API endpoint, to store the military verification update transaction in Dynamo DB
             * and send the appropriate notification through Courier accordingly (email + push notification).
             */
                // initialize the Moonbeam Client API here, in order to call the appropriate endpoints for this handler
            const moonbeamClient = new MoonbeamClient(process.env.ENV_NAME!, region);

            // 1) Call the getDevicesForUser Moonbeam Appsync API endpoint.
            const devicesForUserResponse: UserDevicesResponse = await moonbeamClient.getDevicesForUser({
                id: militaryVerificationNotificationUpdate.id
            });

            // check to see if the get devices for user call was successful or not
            if (devicesForUserResponse && !devicesForUserResponse.errorMessage && !devicesForUserResponse.errorType &&
                devicesForUserResponse.data && devicesForUserResponse.data.length !== 0) {

                // 2) Filter obtained devices based on their status (only consider the ones that are ACTIVE for the user).
                const deviceTokenIds: string[] = [];
                for (const userDevice of devicesForUserResponse.data) {
                    userDevice!.deviceState === UserDeviceState.Active && deviceTokenIds.push(userDevice!.tokenId);
                }

                // 3) Retrieve the email of a user based on their information (name, address, and birthday)
                const emailFromUserInformationResponse: EmailFromCognitoResponse = await moonbeamClient.getEmailForUser(militaryVerificationNotificationUpdate);

                // check to see if the get email for user call was successful or not
                if (emailFromUserInformationResponse && !emailFromUserInformationResponse.errorMessage && !emailFromUserInformationResponse.errorType &&
                    emailFromUserInformationResponse.data && emailFromUserInformationResponse.data.length !== 0) {

                    // determine what type of notification we have, depending on the military verification status that we're transitioning to
                    const notificationType: NotificationType | null = (
                        militaryVerificationNotificationUpdate.originalMilitaryVerificationStatus === MilitaryVerificationStatusType.Pending &&
                        militaryVerificationNotificationUpdate.newMilitaryVerificationStatus === MilitaryVerificationStatusType.Verified
                    ) ? NotificationType.MilitaryStatusChangedPendingToVerified :
                        (
                            militaryVerificationNotificationUpdate.originalMilitaryVerificationStatus === MilitaryVerificationStatusType.Pending &&
                            militaryVerificationNotificationUpdate.newMilitaryVerificationStatus === MilitaryVerificationStatusType.Rejected
                        ) ? NotificationType.MilitaryStatusChangedPendingToRejected : null;

                    if (notificationType !== null) {
                        // 4) Call the createNotification Moonbeam AppSync API endpoint to create an email notification for the military status update
                        const createEmailNotificationResponse: CreateNotificationResponse = await moonbeamClient.createNotification({
                            id: militaryVerificationNotificationUpdate.id,
                            type: notificationType,
                            channelType: NotificationChannelType.Email,
                            userFullName: `${militaryVerificationNotificationUpdate.firstName} ${militaryVerificationNotificationUpdate.lastName}`,
                            emailDestination: emailFromUserInformationResponse.data!,
                            status: NotificationStatus.Sent
                        });

                        // check to see if the email notification call was successful or not
                        if (createEmailNotificationResponse && !createEmailNotificationResponse.errorMessage && !createEmailNotificationResponse.errorType && createEmailNotificationResponse.data) {
                            console.log(`Notification email event successfully processed, with notification id ${createEmailNotificationResponse.data.notificationId}`);

                            // if there are user associated physical devices that are active, to send notifications to, then proceed accordingly
                            if (deviceTokenIds.length !== 0) {
                                // 4) Call the createNotification Moonbeam AppSync API endpoint to create a push notification for the military status update
                                const createPushNotificationResponse: CreateNotificationResponse = await moonbeamClient.createNotification({
                                    id: militaryVerificationNotificationUpdate.id,
                                    type: notificationType,
                                    expoPushTokens: deviceTokenIds,
                                    channelType: NotificationChannelType.Push,
                                    status: NotificationStatus.Sent
                                });

                                // check to see if the email notification call was successful or not
                                if (createPushNotificationResponse && !createPushNotificationResponse.errorMessage && !createPushNotificationResponse.errorType && createPushNotificationResponse.data) {
                                    console.log(`Notification push event successfully processed, with notification id ${createPushNotificationResponse.data.notificationId}`);
                                } else {
                                    console.log(`Notification push event through Create Notification call failed`);

                                    // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                                    itemFailures.push({
                                        itemIdentifier: militaryVerificationUpdateRecord.messageId
                                    });
                                }
                            }
                        } else {
                            console.log(`Notification email event through Create Notification call failed`);

                            // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                            itemFailures.push({
                                itemIdentifier: militaryVerificationUpdateRecord.messageId
                            });
                        }
                    } else {
                        console.log(`Invalid notification verification status transition - ${militaryVerificationNotificationUpdate.originalMilitaryVerificationStatus} to
                        ${militaryVerificationNotificationUpdate.newMilitaryVerificationStatus}!`);

                        // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                        itemFailures.push({
                            itemIdentifier: militaryVerificationUpdateRecord.messageId
                        });
                    }
                } else {
                    console.log(`User email mapping through GET email for user call failed`);

                    // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                    itemFailures.push({
                        itemIdentifier: militaryVerificationUpdateRecord.messageId
                    });
                }
            } else {
                console.log(`Physical Devices mapping through GET devices for user call failed`);

                // adds an item failure, for the SQS message which failed processing, as part of the incoming event
                itemFailures.push({
                    itemIdentifier: militaryVerificationUpdateRecord.messageId
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
        console.log(`Unexpected error while processing ${JSON.stringify(event)} military verification update event ${error}`);

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
