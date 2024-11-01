import {
    IneligibleLinkedUsersResponse,
    MoonbeamClient,
    NotificationReminderResponse,
    NotificationReminderStatus,
    NotificationReminderType,
    NotificationType,
    UserDetailsForNotifications,
    UserForNotificationReminderResponse,
    ZipCodesByGeo
} from "@moonbeam/moonbeam-models";
import {PublishCommand, SNSClient} from "@aws-sdk/client-sns";

/**
 * Function used to handle the daily notification reminder trigger, by first
 * determining whether a notification reminder needs to be sent out, and by
 * kick-starting that process for any applicable users, accordingly.
 *
 * @returns a {@link Promise} of {@link void}, since the EventBridger
 * event trigger, will execute a cron job and not return anything.
 */
export const triggerNotificationReminder = async (): Promise<void> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        /**
         * The overall notification reminder cron triggering, will be made up of the following steps:
         *
         * 1) Call the getNotificationReminders AppSync Query API in order to:
         *    - get any ACTIVE REMINDERS
         *    - for any ACTIVE reminders, sort through the ones that need to get triggered
         *
         * 2) For the reminders that are of:
         *    - CARD_LINKING_REMINDER type, call the getUsersWithNoCards
         *    AppSync Query API, in order to get all users to send notification reminders to.
         *
         *    - NEW_MAP_FEATURE_REMINDER type, call the getAllUsersForNotificationReminders AppSync Query
         *    API, in order to get all the users to send notification reminders to.
         *
         *    - VETERANS_DAY_TEMPLATE_1_REMINDER, 2 and 3 Template types, call the getAllUsersForNotificationReminders
         *    AppSync Query API, in order to get all the users to send notification reminders to.
         *
         *    - REFERRAL_TEMPLATE_LAUNCH, REFERRAL_TEMPLATE_1_REMINDER, 2 and 3 Template types, call the getAllUsersForNotificationReminders
         *    AppSync Query API, in order to get all the users to send notification reminders to.
         *
         *    - SAN_ANTONIO_REFERRAL_TEMPLATE_1_REMINDER, call the getUsersByGeographyForNotificationReminders AppSync Query API, in order to
         *    get all the users in San Antonio to send notification reminders to.
         *
         *    - REIMBURSEMENTS_REMINDER, call the getAllUsersEligibleForReimbursements AppSync Query API, in order to get all users eligible for
         *    reimbursements to send notification reminders to.
         *
         *    - SPENDING_TEMPLATE_1_REMINDER, call the getAllUsersIneligibleForReimbursements AppSync Query API, in order to get all users ineligible for
         *    reimbursements to send notification reminders to.
         *
         *    - ROUNDUPS_WAITLIST_TEMPLATE_1_REMINDER, call the getAllUsersForNotificationReminders AppSync Query API, in order to get all the users to send
         *    notification reminders to.
         *
         * 3) For each applicable user from step 2) drop a message into the appropriate SNS topic.
         *
         * 4) Once all users have been notified, then update the card linking reminder accordingly,
         * by calling the updateNotificationReminder AppSync Mutation API.
         *
         */
        const moonbeamClient = new MoonbeamClient(process.env.ENV_NAME!, region);

        // 1) Call the getNotificationReminders Moonbeam AppSync Query API endpoint.
        const notificationReminders: NotificationReminderResponse = await moonbeamClient.getNotificationReminders();

        // check to see if the get notification reminders call was successful or not.
        if (notificationReminders !== null && notificationReminders !== undefined && !notificationReminders.errorMessage &&
            !notificationReminders.errorType && notificationReminders.data !== null && notificationReminders.data !== undefined &&
            notificationReminders.data.length !== 0) {
            // filter through each ACTIVE notification reminder
            let activeReminderCount = 0;
            for (const reminder of notificationReminders.data) {
                if (reminder!.notificationReminderStatus == NotificationReminderStatus.Active) {
                    //  sort through the ones that need to get triggered
                    const nextTriggerDate: Date = new Date(Date.parse(reminder!.nextTriggerAt));
                    const currentDate: Date = new Date(Date.now());
                    if (nextTriggerDate.getDate() === currentDate.getDate() && nextTriggerDate.getMonth() === currentDate.getMonth() &&
                        nextTriggerDate.getFullYear() === currentDate.getFullYear()) {
                        // depending on the type of notifications that we're sending, act accordingly
                        switch (reminder!.notificationReminderType) {
                            case NotificationReminderType.CardLinkingReminder:
                                console.log(`__________________________________________________________________________________________________________________________________`);
                                console.log(`Found new ACTIVE notification reminder ${reminder!.id} of type ${NotificationReminderType.CardLinkingReminder}`);

                                // 2) For any ACTIVE reminders of type CARD_LINKING_REMINDER, call the getUsersWithNoCards Moonbeam AppSync Query API endpoint.
                                const usersWithNoCards: IneligibleLinkedUsersResponse = await moonbeamClient.getUsersWithNoCards();

                                // check if the get users with no card call was successful or not.
                                if (usersWithNoCards !== null && usersWithNoCards !== undefined && !usersWithNoCards.errorMessage &&
                                    !usersWithNoCards.errorType && usersWithNoCards.data !== null && usersWithNoCards.data !== undefined &&
                                    usersWithNoCards.data.length !== 0) {
                                    // 3) For each applicable user from step 2) drop a message into the appropriate SNS topic.
                                    let successfulUserMessagesSent = 0;

                                    // initializing the SNS Client
                                    const snsClient = new SNSClient({region: region});

                                    for (const ineligibleUser of usersWithNoCards.data) {
                                        /**
                                         * batch out the notifications in groups of 90, so we don't exceed the maximum SNS send limits per second quota
                                         * currently we can send 100 emails per second.
                                         */
                                        successfulUserMessagesSent % 90 === 0 && await sleep(1500); // sleep for 1.5 seconds for every 90 messages

                                        /**
                                         * drop the ineligible user input as a message to the notification reminder processing topic
                                         */
                                        const userDetailsForNotifications: UserDetailsForNotifications = {
                                            id: ineligibleUser!.id,
                                            email: ineligibleUser!.email,
                                            firstName: ineligibleUser!.firstName,
                                            lastName: ineligibleUser!.lastName,
                                            notificationChannelType: reminder!.notificationChannelType,
                                            notificationType: NotificationType.CardLinkingReminder
                                        }
                                        const notificationReminderReceipt = await snsClient.send(new PublishCommand({
                                            TopicArn: process.env.NOTIFICATION_REMINDER_PROCESSING_TOPIC_ARN!,
                                            Message: JSON.stringify(userDetailsForNotifications),
                                            /**
                                             * the message group id, will be represented by the Moonbeam internal user id, so that we can group the notification reminder update messages for a particular
                                             * user id, and sort them in the FIFO processing topic accordingly.
                                             */
                                            MessageGroupId: ineligibleUser!.id
                                        }));

                                        // ensure that the notification reminder message was properly sent to the appropriate processing topic
                                        if (notificationReminderReceipt !== null && notificationReminderReceipt !== undefined && notificationReminderReceipt.MessageId &&
                                            notificationReminderReceipt.MessageId.length !== 0 && notificationReminderReceipt.SequenceNumber && notificationReminderReceipt.SequenceNumber.length !== 0) {
                                            // the notification reminder message has been successfully dropped into the topic, and will be picked up by the notification reminder consumer
                                            console.log(`Notification reminder successfully sent to topic for processing with receipt information: ${notificationReminderReceipt.MessageId} ${notificationReminderReceipt.SequenceNumber}`);
                                            // increase the number of messages sent to the topic
                                            successfulUserMessagesSent += 1;
                                        } else {
                                            /**
                                             * no need for further actions, since this error will be logged and nothing will execute further.
                                             * in the future we might need some alerts and metrics emitting here
                                             */
                                            console.log(`Unexpected error while sending the notification reminder for user ${ineligibleUser!.id}`);
                                        }
                                    }
                                    // check if all applicable users have had successful messages dropped in the notification reminder topic
                                    if (successfulUserMessagesSent === usersWithNoCards.data.length) {
                                        console.log(`__________________________________________________________________________________________________________________________________`);
                                        console.log(`Notification reminder successfully sent for users:\n${JSON.stringify(usersWithNoCards.data)}`);
                                        /**
                                         * 4) Once all users have been notified, then update the card linking reminder accordingly,
                                         * by calling the updateNotificationReminder AppSync Mutation API.
                                         */
                                        const updateNotificationReminderResponse: NotificationReminderResponse = await moonbeamClient.updateNotificationReminder({
                                            id: reminder!.id,
                                            notificationReminderStatus: NotificationReminderStatus.Active
                                        });

                                        // check if the update notification reminder call was successful or not.
                                        if (updateNotificationReminderResponse !== null && updateNotificationReminderResponse !== undefined &&
                                            !updateNotificationReminderResponse.errorMessage && !updateNotificationReminderResponse.errorType &&
                                            updateNotificationReminderResponse.data !== undefined && updateNotificationReminderResponse.data !== null &&
                                            updateNotificationReminderResponse.data.length !== 0) {
                                            console.log(`Notification reminder ${reminder!.id} successfully updated`);
                                        } else {
                                            /**
                                             * no need for further actions, since this error will be logged and nothing will execute further.
                                             * in the future we might need some alerts and metrics emitting here
                                             */
                                            console.log(`Update notification reminder through UPDATE notification reminder call failed`);
                                        }
                                    } else {
                                        /**
                                         * no need for further actions, since this error will be logged and nothing will execute further.
                                         * in the future we might need some alerts and metrics emitting here
                                         */
                                        console.log(`Not all applicable users have had notification events dropped in the appropriate topic. Re-process these failed messages accordingly.`);
                                    }
                                } else {
                                    /**
                                     * no need for further actions, since this error will be logged and nothing will execute further.
                                     * in the future we might need some alerts and metrics emitting here
                                     */
                                    console.log(`Users with no cards retrieval through GET users with no cards call failed`);
                                }
                                break;
                            case NotificationReminderType.VeteransDayTemplate_1Reminder:
                                console.log(`__________________________________________________________________________________________________________________________________`);
                                console.log(`Found new ACTIVE notification reminder ${reminder!.id} of type ${NotificationReminderType.VeteransDayTemplate_1Reminder}`);

                                // 2) For any ACTIVE reminders of type VETERANS_DAY_TEMPLATE_1_REMINDER, call the getAllUsersForNotificationReminders Moonbeam AppSync Query API endpoint.
                                const allUsersForNotificationReminderVeteransDay1: UserForNotificationReminderResponse = await moonbeamClient.getAllUsersForNotificationReminders();

                                // check if the get all users for notification reminders call was successful or not.
                                if (allUsersForNotificationReminderVeteransDay1 !== null && allUsersForNotificationReminderVeteransDay1 !== undefined && !allUsersForNotificationReminderVeteransDay1.errorMessage &&
                                    !allUsersForNotificationReminderVeteransDay1.errorType && allUsersForNotificationReminderVeteransDay1.data !== null && allUsersForNotificationReminderVeteransDay1.data !== undefined &&
                                    allUsersForNotificationReminderVeteransDay1.data.length !== 0) {

                                    // 3) For each applicable user from step 2) drop a message into the appropriate SNS topic.
                                    let successfulUserMessagesSent = 0;

                                    // initializing the SNS Client
                                    const snsClient = new SNSClient({region: region});

                                    for (const user of allUsersForNotificationReminderVeteransDay1.data) {
                                        /**
                                         * batch out the notifications in groups of 90, so we don't exceed the maximum SNS send limits per second quota
                                         * currently we can send 100 emails per second.
                                         */
                                        successfulUserMessagesSent % 90 === 0 && await sleep(1500); // sleep for 1.5 seconds for every 90 messages

                                        /**
                                         * drop the ineligible user input as a message to the notification reminder processing topic
                                         */
                                        const userDetailsForNotifications: UserDetailsForNotifications = {
                                            id: user!.id,
                                            email: user!.email,
                                            firstName: user!.firstName,
                                            lastName: user!.lastName,
                                            notificationChannelType: reminder!.notificationChannelType,
                                            notificationType: NotificationType.VeteransDayTemplate_1Reminder
                                        }
                                        const notificationReminderReceipt = await snsClient.send(new PublishCommand({
                                            TopicArn: process.env.NOTIFICATION_REMINDER_PROCESSING_TOPIC_ARN!,
                                            Message: JSON.stringify(userDetailsForNotifications),
                                            /**
                                             * the message group id, will be represented by the Moonbeam internal user id, so that we can group the notification reminder update messages for a particular
                                             * user id, and sort them in the FIFO processing topic accordingly.
                                             */
                                            MessageGroupId: user!.id
                                        }));

                                        // ensure that the notification reminder message was properly sent to the appropriate processing topic
                                        if (notificationReminderReceipt !== null && notificationReminderReceipt !== undefined && notificationReminderReceipt.MessageId &&
                                            notificationReminderReceipt.MessageId.length !== 0 && notificationReminderReceipt.SequenceNumber && notificationReminderReceipt.SequenceNumber.length !== 0) {
                                            // the notification reminder message has been successfully dropped into the topic, and will be picked up by the notification reminder consumer
                                            console.log(`Notification reminder successfully sent to topic for processing with receipt information: ${notificationReminderReceipt.MessageId} ${notificationReminderReceipt.SequenceNumber}`);
                                            // increase the number of messages sent to the topic
                                            successfulUserMessagesSent += 1;
                                        } else {
                                            /**
                                             * no need for further actions, since this error will be logged and nothing will execute further.
                                             * in the future we might need some alerts and metrics emitting here
                                             */
                                            console.log(`Unexpected error while sending the notification reminder for user ${user!.id}`);
                                        }
                                    }
                                    // check if all applicable users have had successful messages dropped in the notification reminder topic
                                    if (successfulUserMessagesSent === allUsersForNotificationReminderVeteransDay1.data.length) {
                                        console.log(`__________________________________________________________________________________________________________________________________`);
                                        console.log(`Notification reminder successfully sent for users:\n${JSON.stringify(allUsersForNotificationReminderVeteransDay1.data)}`);
                                        /**
                                         * 4) Once all users have been notified, then update the card linking reminder accordingly,
                                         * by calling the updateNotificationReminder AppSync Mutation API.
                                         */
                                        const updateNotificationReminderResponse: NotificationReminderResponse = await moonbeamClient.updateNotificationReminder({
                                            id: reminder!.id,
                                            notificationReminderStatus: NotificationReminderStatus.Active
                                        });

                                        // check if the update notification reminder call was successful or not.
                                        if (updateNotificationReminderResponse !== null && updateNotificationReminderResponse !== undefined &&
                                            !updateNotificationReminderResponse.errorMessage && !updateNotificationReminderResponse.errorType &&
                                            updateNotificationReminderResponse.data !== undefined && updateNotificationReminderResponse.data !== null &&
                                            updateNotificationReminderResponse.data.length !== 0) {
                                            console.log(`Notification reminder ${reminder!.id} successfully updated`);
                                        } else {
                                            /**
                                             * no need for further actions, since this error will be logged and nothing will execute further.
                                             * in the future we might need some alerts and metrics emitting here
                                             */
                                            console.log(`Update notification reminder through UPDATE notification reminder call failed`);
                                        }
                                    } else {
                                        /**
                                         * no need for further actions, since this error will be logged and nothing will execute further.
                                         * in the future we might need some alerts and metrics emitting here
                                         */
                                        console.log(`Not all applicable users have had notification events dropped in the appropriate topic. Re-process these failed messages accordingly.`);
                                    }
                                } else {
                                    /**
                                     * no need for further actions, since this error will be logged and nothing will execute further.
                                     * in the future we might need some alerts and metrics emitting here
                                     */
                                    console.log(`Users for notification reminders retrieval through GET all users for notification reminders call failed`);
                                }
                                break;
                            case NotificationReminderType.VeteransDayTemplate_2Reminder:
                                console.log(`__________________________________________________________________________________________________________________________________`);
                                console.log(`Found new ACTIVE notification reminder ${reminder!.id} of type ${NotificationReminderType.VeteransDayTemplate_2Reminder}`);

                                // 2) For any ACTIVE reminders of type VETERANS_DAY_TEMPLATE_2_REMINDER, call the getAllUsersForNotificationReminders Moonbeam AppSync Query API endpoint.
                                const allUsersForNotificationReminderVeteransDay2: UserForNotificationReminderResponse = await moonbeamClient.getAllUsersForNotificationReminders();

                                // check if the get all users for notification reminders call was successful or not.
                                if (allUsersForNotificationReminderVeteransDay2 !== null && allUsersForNotificationReminderVeteransDay2 !== undefined && !allUsersForNotificationReminderVeteransDay2.errorMessage &&
                                    !allUsersForNotificationReminderVeteransDay2.errorType && allUsersForNotificationReminderVeteransDay2.data !== null && allUsersForNotificationReminderVeteransDay2.data !== undefined &&
                                    allUsersForNotificationReminderVeteransDay2.data.length !== 0) {

                                    // 3) For each applicable user from step 2) drop a message into the appropriate SNS topic.
                                    let successfulUserMessagesSent = 0;

                                    // initializing the SNS Client
                                    const snsClient = new SNSClient({region: region});

                                    for (const user of allUsersForNotificationReminderVeteransDay2.data) {
                                        /**
                                         * batch out the notifications in groups of 90, so we don't exceed the maximum SNS send limits per second quota
                                         * currently we can send 100 emails per second.
                                         */
                                        successfulUserMessagesSent % 90 === 0 && await sleep(1500); // sleep for 1.5 seconds for every 90 messages

                                        /**
                                         * drop the ineligible user input as a message to the notification reminder processing topic
                                         */
                                        const userDetailsForNotifications: UserDetailsForNotifications = {
                                            id: user!.id,
                                            email: user!.email,
                                            firstName: user!.firstName,
                                            lastName: user!.lastName,
                                            notificationChannelType: reminder!.notificationChannelType,
                                            notificationType: NotificationType.VeteransDayTemplate_2Reminder
                                        }
                                        const notificationReminderReceipt = await snsClient.send(new PublishCommand({
                                            TopicArn: process.env.NOTIFICATION_REMINDER_PROCESSING_TOPIC_ARN!,
                                            Message: JSON.stringify(userDetailsForNotifications),
                                            /**
                                             * the message group id, will be represented by the Moonbeam internal user id, so that we can group the notification reminder update messages for a particular
                                             * user id, and sort them in the FIFO processing topic accordingly.
                                             */
                                            MessageGroupId: user!.id
                                        }));

                                        // ensure that the notification reminder message was properly sent to the appropriate processing topic
                                        if (notificationReminderReceipt !== null && notificationReminderReceipt !== undefined && notificationReminderReceipt.MessageId &&
                                            notificationReminderReceipt.MessageId.length !== 0 && notificationReminderReceipt.SequenceNumber && notificationReminderReceipt.SequenceNumber.length !== 0) {
                                            // the notification reminder message has been successfully dropped into the topic, and will be picked up by the notification reminder consumer
                                            console.log(`Notification reminder successfully sent to topic for processing with receipt information: ${notificationReminderReceipt.MessageId} ${notificationReminderReceipt.SequenceNumber}`);
                                            // increase the number of messages sent to the topic
                                            successfulUserMessagesSent += 1;
                                        } else {
                                            /**
                                             * no need for further actions, since this error will be logged and nothing will execute further.
                                             * in the future we might need some alerts and metrics emitting here
                                             */
                                            console.log(`Unexpected error while sending the notification reminder for user ${user!.id}`);
                                        }
                                    }
                                    // check if all applicable users have had successful messages dropped in the notification reminder topic
                                    if (successfulUserMessagesSent === allUsersForNotificationReminderVeteransDay2.data.length) {
                                        console.log(`__________________________________________________________________________________________________________________________________`);
                                        console.log(`Notification reminder successfully sent for users:\n${JSON.stringify(allUsersForNotificationReminderVeteransDay2.data)}`);
                                        /**
                                         * 4) Once all users have been notified, then update the card linking reminder accordingly,
                                         * by calling the updateNotificationReminder AppSync Mutation API.
                                         */
                                        const updateNotificationReminderResponse: NotificationReminderResponse = await moonbeamClient.updateNotificationReminder({
                                            id: reminder!.id,
                                            notificationReminderStatus: NotificationReminderStatus.Active
                                        });

                                        // check if the update notification reminder call was successful or not.
                                        if (updateNotificationReminderResponse !== null && updateNotificationReminderResponse !== undefined &&
                                            !updateNotificationReminderResponse.errorMessage && !updateNotificationReminderResponse.errorType &&
                                            updateNotificationReminderResponse.data !== undefined && updateNotificationReminderResponse.data !== null &&
                                            updateNotificationReminderResponse.data.length !== 0) {
                                            console.log(`Notification reminder ${reminder!.id} successfully updated`);
                                        } else {
                                            /**
                                             * no need for further actions, since this error will be logged and nothing will execute further.
                                             * in the future we might need some alerts and metrics emitting here
                                             */
                                            console.log(`Update notification reminder through UPDATE notification reminder call failed`);
                                        }
                                    } else {
                                        /**
                                         * no need for further actions, since this error will be logged and nothing will execute further.
                                         * in the future we might need some alerts and metrics emitting here
                                         */
                                        console.log(`Not all applicable users have had notification events dropped in the appropriate topic. Re-process these failed messages accordingly.`);
                                    }
                                } else {
                                    /**
                                     * no need for further actions, since this error will be logged and nothing will execute further.
                                     * in the future we might need some alerts and metrics emitting here
                                     */
                                    console.log(`Users for notification reminders retrieval through GET all users for notification reminders call failed`);
                                }
                                break;
                            case NotificationReminderType.VeteransDayTemplate_3Reminder:
                                console.log(`__________________________________________________________________________________________________________________________________`);
                                console.log(`Found new ACTIVE notification reminder ${reminder!.id} of type ${NotificationReminderType.VeteransDayTemplate_3Reminder}`);

                                // 2) For any ACTIVE reminders of type VETERANS_DAY_TEMPLATE_3_REMINDER, call the getAllUsersForNotificationReminders Moonbeam AppSync Query API endpoint.
                                const allUsersForNotificationReminderVeteransDay3: UserForNotificationReminderResponse = await moonbeamClient.getAllUsersForNotificationReminders();

                                // check if the get all users for notification reminders call was successful or not.
                                if (allUsersForNotificationReminderVeteransDay3 !== null && allUsersForNotificationReminderVeteransDay3 !== undefined && !allUsersForNotificationReminderVeteransDay3.errorMessage &&
                                    !allUsersForNotificationReminderVeteransDay3.errorType && allUsersForNotificationReminderVeteransDay3.data !== null && allUsersForNotificationReminderVeteransDay3.data !== undefined &&
                                    allUsersForNotificationReminderVeteransDay3.data.length !== 0) {

                                    // 3) For each applicable user from step 2) drop a message into the appropriate SNS topic.
                                    let successfulUserMessagesSent = 0;

                                    // initializing the SNS Client
                                    const snsClient = new SNSClient({region: region});

                                    for (const user of allUsersForNotificationReminderVeteransDay3.data) {
                                        /**
                                         * batch out the notifications in groups of 90, so we don't exceed the maximum SNS send limits per second quota
                                         * currently we can send 100 emails per second.
                                         */
                                        successfulUserMessagesSent % 90 === 0 && await sleep(1500); // sleep for 1.5 seconds for every 90 messages

                                        /**
                                         * drop the ineligible user input as a message to the notification reminder processing topic
                                         */
                                        const userDetailsForNotifications: UserDetailsForNotifications = {
                                            id: user!.id,
                                            email: user!.email,
                                            firstName: user!.firstName,
                                            lastName: user!.lastName,
                                            notificationChannelType: reminder!.notificationChannelType,
                                            notificationType: NotificationType.VeteransDayTemplate_3Reminder
                                        }
                                        const notificationReminderReceipt = await snsClient.send(new PublishCommand({
                                            TopicArn: process.env.NOTIFICATION_REMINDER_PROCESSING_TOPIC_ARN!,
                                            Message: JSON.stringify(userDetailsForNotifications),
                                            /**
                                             * the message group id, will be represented by the Moonbeam internal user id, so that we can group the notification reminder update messages for a particular
                                             * user id, and sort them in the FIFO processing topic accordingly.
                                             */
                                            MessageGroupId: user!.id
                                        }));

                                        // ensure that the notification reminder message was properly sent to the appropriate processing topic
                                        if (notificationReminderReceipt !== null && notificationReminderReceipt !== undefined && notificationReminderReceipt.MessageId &&
                                            notificationReminderReceipt.MessageId.length !== 0 && notificationReminderReceipt.SequenceNumber && notificationReminderReceipt.SequenceNumber.length !== 0) {
                                            // the notification reminder message has been successfully dropped into the topic, and will be picked up by the notification reminder consumer
                                            console.log(`Notification reminder successfully sent to topic for processing with receipt information: ${notificationReminderReceipt.MessageId} ${notificationReminderReceipt.SequenceNumber}`);
                                            // increase the number of messages sent to the topic
                                            successfulUserMessagesSent += 1;
                                        } else {
                                            /**
                                             * no need for further actions, since this error will be logged and nothing will execute further.
                                             * in the future we might need some alerts and metrics emitting here
                                             */
                                            console.log(`Unexpected error while sending the notification reminder for user ${user!.id}`);
                                        }
                                    }
                                    // check if all applicable users have had successful messages dropped in the notification reminder topic
                                    if (successfulUserMessagesSent === allUsersForNotificationReminderVeteransDay3.data.length) {
                                        console.log(`__________________________________________________________________________________________________________________________________`);
                                        console.log(`Notification reminder successfully sent for users:\n${JSON.stringify(allUsersForNotificationReminderVeteransDay3.data)}`);
                                        /**
                                         * 4) Once all users have been notified, then update the card linking reminder accordingly,
                                         * by calling the updateNotificationReminder AppSync Mutation API.
                                         */
                                        const updateNotificationReminderResponse: NotificationReminderResponse = await moonbeamClient.updateNotificationReminder({
                                            id: reminder!.id,
                                            notificationReminderStatus: NotificationReminderStatus.Active
                                        });

                                        // check if the update notification reminder call was successful or not.
                                        if (updateNotificationReminderResponse !== null && updateNotificationReminderResponse !== undefined &&
                                            !updateNotificationReminderResponse.errorMessage && !updateNotificationReminderResponse.errorType &&
                                            updateNotificationReminderResponse.data !== undefined && updateNotificationReminderResponse.data !== null &&
                                            updateNotificationReminderResponse.data.length !== 0) {
                                            console.log(`Notification reminder ${reminder!.id} successfully updated`);
                                        } else {
                                            /**
                                             * no need for further actions, since this error will be logged and nothing will execute further.
                                             * in the future we might need some alerts and metrics emitting here
                                             */
                                            console.log(`Update notification reminder through UPDATE notification reminder call failed`);
                                        }
                                    } else {
                                        /**
                                         * no need for further actions, since this error will be logged and nothing will execute further.
                                         * in the future we might need some alerts and metrics emitting here
                                         */
                                        console.log(`Not all applicable users have had notification events dropped in the appropriate topic. Re-process these failed messages accordingly.`);
                                    }
                                } else {
                                    /**
                                     * no need for further actions, since this error will be logged and nothing will execute further.
                                     * in the future we might need some alerts and metrics emitting here
                                     */
                                    console.log(`Users for notification reminders retrieval through GET all users for notification reminders call failed`);
                                }
                                break;
                            case NotificationReminderType.NewMapFeatureReminder:
                                console.log(`__________________________________________________________________________________________________________________________________`);
                                console.log(`Found new ACTIVE notification reminder ${reminder!.id} of type ${NotificationReminderType.NewMapFeatureReminder}`);

                                // 2) For any ACTIVE reminders of type NEW_MAP_FEATURE_REMINDER, call the getAllUsersForNotificationReminders Moonbeam AppSync Query API endpoint.
                                const allUsersForNewMapFeatureReminder: UserForNotificationReminderResponse = await moonbeamClient.getAllUsersForNotificationReminders();

                                // check if the get all users for notification reminders call was successful or not.
                                if (allUsersForNewMapFeatureReminder !== null && allUsersForNewMapFeatureReminder !== undefined && !allUsersForNewMapFeatureReminder.errorMessage &&
                                    !allUsersForNewMapFeatureReminder.errorType && allUsersForNewMapFeatureReminder.data !== null && allUsersForNewMapFeatureReminder.data !== undefined &&
                                    allUsersForNewMapFeatureReminder.data.length !== 0) {

                                    // 3) For each applicable user from step 2) drop a message into the appropriate SNS topic.
                                    let successfulUserMessagesSent = 0;

                                    // initializing the SNS Client
                                    const snsClient = new SNSClient({region: region});

                                    for (const user of allUsersForNewMapFeatureReminder.data) {
                                        /**
                                         * batch out the notifications in groups of 90, so we don't exceed the maximum SNS send limits per second quota
                                         * currently we can send 100 emails per second.
                                         */
                                        successfulUserMessagesSent % 90 === 0 && await sleep(1500); // sleep for 1.5 seconds for every 90 messages

                                        /**
                                         * drop the ineligible user input as a message to the notification reminder processing topic
                                         */
                                        const userDetailsForNotifications: UserDetailsForNotifications = {
                                            id: user!.id,
                                            email: user!.email,
                                            firstName: user!.firstName,
                                            lastName: user!.lastName,
                                            notificationChannelType: reminder!.notificationChannelType,
                                            notificationType: NotificationType.NewMapFeatureReminder
                                        }
                                        const notificationReminderReceipt = await snsClient.send(new PublishCommand({
                                            TopicArn: process.env.NOTIFICATION_REMINDER_PROCESSING_TOPIC_ARN!,
                                            Message: JSON.stringify(userDetailsForNotifications),
                                            /**
                                             * the message group id, will be represented by the Moonbeam internal user id, so that we can group the notification reminder update messages for a particular
                                             * user id, and sort them in the FIFO processing topic accordingly.
                                             */
                                            MessageGroupId: user!.id
                                        }));

                                        // ensure that the notification reminder message was properly sent to the appropriate processing topic
                                        if (notificationReminderReceipt !== null && notificationReminderReceipt !== undefined && notificationReminderReceipt.MessageId &&
                                            notificationReminderReceipt.MessageId.length !== 0 && notificationReminderReceipt.SequenceNumber && notificationReminderReceipt.SequenceNumber.length !== 0) {
                                            // the notification reminder message has been successfully dropped into the topic, and will be picked up by the notification reminder consumer
                                            console.log(`Notification reminder successfully sent to topic for processing with receipt information: ${notificationReminderReceipt.MessageId} ${notificationReminderReceipt.SequenceNumber}`);
                                            // increase the number of messages sent to the topic
                                            successfulUserMessagesSent += 1;
                                        } else {
                                            /**
                                             * no need for further actions, since this error will be logged and nothing will execute further.
                                             * in the future we might need some alerts and metrics emitting here
                                             */
                                            console.log(`Unexpected error while sending the notification reminder for user ${user!.id}`);
                                        }
                                    }
                                    // check if all applicable users have had successful messages dropped in the notification reminder topic
                                    if (successfulUserMessagesSent === allUsersForNewMapFeatureReminder.data.length) {
                                        console.log(`__________________________________________________________________________________________________________________________________`);
                                        console.log(`Notification reminder successfully sent for users:\n${JSON.stringify(allUsersForNewMapFeatureReminder.data)}`);
                                        /**
                                         * 4) Once all users have been notified, then update the card linking reminder accordingly,
                                         * by calling the updateNotificationReminder AppSync Mutation API.
                                         */
                                        const updateNotificationReminderResponse: NotificationReminderResponse = await moonbeamClient.updateNotificationReminder({
                                            id: reminder!.id,
                                            notificationReminderStatus: NotificationReminderStatus.Active
                                        });

                                        // check if the update notification reminder call was successful or not.
                                        if (updateNotificationReminderResponse !== null && updateNotificationReminderResponse !== undefined &&
                                            !updateNotificationReminderResponse.errorMessage && !updateNotificationReminderResponse.errorType &&
                                            updateNotificationReminderResponse.data !== undefined && updateNotificationReminderResponse.data !== null &&
                                            updateNotificationReminderResponse.data.length !== 0) {
                                            console.log(`Notification reminder ${reminder!.id} successfully updated`);
                                        } else {
                                            /**
                                             * no need for further actions, since this error will be logged and nothing will execute further.
                                             * in the future we might need some alerts and metrics emitting here
                                             */
                                            console.log(`Update notification reminder through UPDATE notification reminder call failed`);
                                        }
                                    } else {
                                        /**
                                         * no need for further actions, since this error will be logged and nothing will execute further.
                                         * in the future we might need some alerts and metrics emitting here
                                         */
                                        console.log(`Not all applicable users have had notification events dropped in the appropriate topic. Re-process these failed messages accordingly.`);
                                    }
                                } else {
                                    /**
                                     * no need for further actions, since this error will be logged and nothing will execute further.
                                     * in the future we might need some alerts and metrics emitting here
                                     */
                                    console.log(`Users for notification reminders retrieval through GET all users for notification reminders call failed`);
                                }
                                break;
                            case NotificationReminderType.RoundupsWaitlistTemplate_1Reminder:
                                console.log(`__________________________________________________________________________________________________________________________________`);
                                console.log(`Found new ACTIVE notification reminder ${reminder!.id} of type ${NotificationReminderType.RoundupsWaitlistTemplate_1Reminder}`);

                                /**
                                 *  2) ROUNDUPS_WAITLIST_TEMPLATE_1_REMINDER, call the getAllUsersForNotificationReminders AppSync Query API, in order to get all the users to send
                                 *  notification reminders to.
                                 */
                                const allUsersForRoundupsWaitlistReminder: UserForNotificationReminderResponse = await moonbeamClient.getAllUsersForNotificationReminders();

                                // check if the get all users for notification reminders call was successful or not.
                                if (allUsersForRoundupsWaitlistReminder !== null && allUsersForRoundupsWaitlistReminder !== undefined && !allUsersForRoundupsWaitlistReminder.errorMessage &&
                                    !allUsersForRoundupsWaitlistReminder.errorType && allUsersForRoundupsWaitlistReminder.data !== null && allUsersForRoundupsWaitlistReminder.data !== undefined &&
                                    allUsersForRoundupsWaitlistReminder.data.length !== 0) {

                                    // 3) For each applicable user from step 2) drop a message into the appropriate SNS topic.
                                    let successfulUserMessagesSent = 0;

                                    // initializing the SNS Client
                                    const snsClient = new SNSClient({region: region});

                                    for (const user of allUsersForRoundupsWaitlistReminder.data) {
                                        if (user !== null) {
                                            /**
                                             * batch out the notifications in groups of 90, so we don't exceed the maximum SNS send limits per second quota
                                             * currently we can send 100 emails per second.
                                             */
                                            successfulUserMessagesSent % 90 === 0 && await sleep(1500); // sleep for 1.5 seconds for every 90 messages

                                            /**
                                             * drop the ineligible user input as a message to the notification reminder processing topic
                                             */
                                            const userDetailsForNotifications: UserDetailsForNotifications = {
                                                id: user!.id,
                                                email: user!.email,
                                                firstName: user!.firstName,
                                                lastName: user!.lastName,
                                                notificationChannelType: reminder!.notificationChannelType,
                                                notificationType: NotificationType.RoundupsWaitlistTemplate_1Reminder
                                            }
                                            const notificationReminderReceipt = await snsClient.send(new PublishCommand({
                                                TopicArn: process.env.NOTIFICATION_REMINDER_PROCESSING_TOPIC_ARN!,
                                                Message: JSON.stringify(userDetailsForNotifications),
                                                /**
                                                 * the message group id, will be represented by the Moonbeam internal user id, so that we can group the notification reminder update messages for a particular
                                                 * user id, and sort them in the FIFO processing topic accordingly.
                                                 */
                                                MessageGroupId: user!.id
                                            }));

                                            // ensure that the notification reminder message was properly sent to the appropriate processing topic
                                            if (notificationReminderReceipt !== null && notificationReminderReceipt !== undefined && notificationReminderReceipt.MessageId &&
                                                notificationReminderReceipt.MessageId.length !== 0 && notificationReminderReceipt.SequenceNumber && notificationReminderReceipt.SequenceNumber.length !== 0) {
                                                // the notification reminder message has been successfully dropped into the topic, and will be picked up by the notification reminder consumer
                                                console.log(`Notification reminder successfully sent to topic for processing with receipt information: ${notificationReminderReceipt.MessageId} ${notificationReminderReceipt.SequenceNumber}`);
                                                // increase the number of messages sent to the topic
                                                successfulUserMessagesSent += 1;
                                            } else {
                                                /**
                                                 * no need for further actions, since this error will be logged and nothing will execute further.
                                                 * in the future we might need some alerts and metrics emitting here
                                                 */
                                                console.log(`Unexpected error while sending the notification reminder for user ${user!.id}`);
                                            }
                                        }
                                    }
                                    // check if all applicable users have had successful messages dropped in the notification reminder topic
                                    if (successfulUserMessagesSent === allUsersForRoundupsWaitlistReminder.data.length) {
                                        console.log(`__________________________________________________________________________________________________________________________________`);
                                        console.log(`Notification reminder successfully sent for users:\n${JSON.stringify(allUsersForRoundupsWaitlistReminder.data)}`);
                                        /**
                                         * 4) Once all users have been notified, then update the card linking reminder accordingly,
                                         * by calling the updateNotificationReminder AppSync Mutation API.
                                         */
                                        const updateNotificationReminderResponse: NotificationReminderResponse = await moonbeamClient.updateNotificationReminder({
                                            id: reminder!.id,
                                            notificationReminderStatus: NotificationReminderStatus.Active
                                        });

                                        // check if the update notification reminder call was successful or not.
                                        if (updateNotificationReminderResponse !== null && updateNotificationReminderResponse !== undefined &&
                                            !updateNotificationReminderResponse.errorMessage && !updateNotificationReminderResponse.errorType &&
                                            updateNotificationReminderResponse.data !== undefined && updateNotificationReminderResponse.data !== null &&
                                            updateNotificationReminderResponse.data.length !== 0) {
                                            console.log(`Notification reminder ${reminder!.id} successfully updated`);
                                        } else {
                                            /**
                                             * no need for further actions, since this error will be logged and nothing will execute further.
                                             * in the future we might need some alerts and metrics emitting here
                                             */
                                            console.log(`Update notification reminder through UPDATE notification reminder call failed`);
                                        }
                                    } else {
                                        /**
                                         * no need for further actions, since this error will be logged and nothing will execute further.
                                         * in the future we might need some alerts and metrics emitting here
                                         */
                                        console.log(`Not all applicable users have had notification events dropped in the appropriate topic. Re-process these failed messages accordingly.`);
                                    }
                                } else {
                                    /**
                                     * no need for further actions, since this error will be logged and nothing will execute further.
                                     * in the future we might need some alerts and metrics emitting here
                                     */
                                    console.log(`Users for notification reminders retrieval through GET all users for notification reminders call failed`);
                                }
                                break;
                            case NotificationReminderType.SanAntonioReferralTemplate_1Reminder:
                                console.log(`__________________________________________________________________________________________________________________________________`);
                                console.log(`Found new ACTIVE notification reminder ${reminder!.id} of type ${NotificationReminderType.SanAntonioReferralTemplate_1Reminder}`);

                                // 2) For any ACTIVE reminders of type SAN_ANTONIO_REFERRAL_TEMPLATE_1_REMINDER, call the getUsersByGeographyForNotificationReminders Moonbeam AppSync Query API endpoint.
                                const allUsersInSanAntonioForReferralLaunchReminder: UserForNotificationReminderResponse = await moonbeamClient.getUsersByGeographyForNotificationReminders({
                                    zipCodes: ZipCodesByGeo.get("San Antonio") !== undefined ? ZipCodesByGeo.get("San Antonio")! : []
                                });

                                // check if the get users by geography for notification reminders call was successful or not.
                                if (allUsersInSanAntonioForReferralLaunchReminder !== null && allUsersInSanAntonioForReferralLaunchReminder !== undefined && !allUsersInSanAntonioForReferralLaunchReminder.errorMessage &&
                                    !allUsersInSanAntonioForReferralLaunchReminder.errorType && allUsersInSanAntonioForReferralLaunchReminder.data !== null && allUsersInSanAntonioForReferralLaunchReminder.data !== undefined &&
                                    allUsersInSanAntonioForReferralLaunchReminder.data.length !== 0) {

                                    // 3) For each applicable user from step 2) drop a message into the appropriate SNS topic.
                                    let successfulUserMessagesSent = 0;

                                    // initializing the SNS Client
                                    const snsClient = new SNSClient({region: region});

                                    for (const user of allUsersInSanAntonioForReferralLaunchReminder.data) {
                                        /**
                                         * batch out the notifications in groups of 90, so we don't exceed the maximum SNS send limits per second quota
                                         * currently we can send 100 emails per second.
                                         */
                                        successfulUserMessagesSent % 90 === 0 && await sleep(1500); // sleep for 1.5 seconds for every 90 messages

                                        /**
                                         * drop the ineligible user input as a message to the notification reminder processing topic
                                         */
                                        const userDetailsForNotifications: UserDetailsForNotifications = {
                                            id: user!.id,
                                            email: user!.email,
                                            firstName: user!.firstName,
                                            lastName: user!.lastName,
                                            notificationChannelType: reminder!.notificationChannelType,
                                            notificationType: NotificationType.SanAntonioReferralTemplate_1Reminder
                                        }
                                        const notificationReminderReceipt = await snsClient.send(new PublishCommand({
                                            TopicArn: process.env.NOTIFICATION_REMINDER_PROCESSING_TOPIC_ARN!,
                                            Message: JSON.stringify(userDetailsForNotifications),
                                            /**
                                             * the message group id, will be represented by the Moonbeam internal user id, so that we can group the notification reminder update messages for a particular
                                             * user id, and sort them in the FIFO processing topic accordingly.
                                             */
                                            MessageGroupId: user!.id
                                        }));

                                        // ensure that the notification reminder message was properly sent to the appropriate processing topic
                                        if (notificationReminderReceipt !== null && notificationReminderReceipt !== undefined && notificationReminderReceipt.MessageId &&
                                            notificationReminderReceipt.MessageId.length !== 0 && notificationReminderReceipt.SequenceNumber && notificationReminderReceipt.SequenceNumber.length !== 0) {
                                            // the notification reminder message has been successfully dropped into the topic, and will be picked up by the notification reminder consumer
                                            console.log(`Notification reminder successfully sent to topic for processing with receipt information: ${notificationReminderReceipt.MessageId} ${notificationReminderReceipt.SequenceNumber}`);
                                            // increase the number of messages sent to the topic
                                            successfulUserMessagesSent += 1;
                                        } else {
                                            /**
                                             * no need for further actions, since this error will be logged and nothing will execute further.
                                             * in the future we might need some alerts and metrics emitting here
                                             */
                                            console.log(`Unexpected error while sending the notification reminder for user ${user!.id}`);
                                        }
                                    }
                                    // check if all applicable users have had successful messages dropped in the notification reminder topic
                                    if (successfulUserMessagesSent === allUsersInSanAntonioForReferralLaunchReminder.data.length) {
                                        console.log(`__________________________________________________________________________________________________________________________________`);
                                        console.log(`Notification reminder successfully sent for users:\n${JSON.stringify(allUsersInSanAntonioForReferralLaunchReminder.data)}`);
                                        /**
                                         * 4) Once all users have been notified, then update the card linking reminder accordingly,
                                         * by calling the updateNotificationReminder AppSync Mutation API.
                                         */
                                        const updateNotificationReminderResponse: NotificationReminderResponse = await moonbeamClient.updateNotificationReminder({
                                            id: reminder!.id,
                                            notificationReminderStatus: NotificationReminderStatus.Active
                                        });

                                        // check if the update notification reminder call was successful or not.
                                        if (updateNotificationReminderResponse !== null && updateNotificationReminderResponse !== undefined &&
                                            !updateNotificationReminderResponse.errorMessage && !updateNotificationReminderResponse.errorType &&
                                            updateNotificationReminderResponse.data !== undefined && updateNotificationReminderResponse.data !== null &&
                                            updateNotificationReminderResponse.data.length !== 0) {
                                            console.log(`Notification reminder ${reminder!.id} successfully updated`);
                                        } else {
                                            /**
                                             * no need for further actions, since this error will be logged and nothing will execute further.
                                             * in the future we might need some alerts and metrics emitting here
                                             */
                                            console.log(`Update notification reminder through UPDATE notification reminder call failed`);
                                        }
                                    } else {
                                        /**
                                         * no need for further actions, since this error will be logged and nothing will execute further.
                                         * in the future we might need some alerts and metrics emitting here
                                         */
                                        console.log(`Not all applicable users have had notification events dropped in the appropriate topic. Re-process these failed messages accordingly.`);
                                    }
                                } else {
                                    /**
                                     * no need for further actions, since this error will be logged and nothing will execute further.
                                     * in the future we might need some alerts and metrics emitting here
                                     */
                                    console.log(`Users for notification reminders retrieval through GET users by geography for notification reminders call failed`);
                                }
                                break;
                            case NotificationReminderType.SpendingTemplate_1Reminder:
                                console.log(`__________________________________________________________________________________________________________________________________`);
                                console.log(`Found new ACTIVE notification reminder ${reminder!.id} of type ${NotificationReminderType.SpendingTemplate_1Reminder}`);

                                /**
                                 * 2) For any ACTIVE reminders of type call the getAllUsersIneligibleForReimbursements AppSync Query API, in order to get all users ineligible for
                                 *    reimbursements to send notification reminders to.
                                 */
                                const allUsersIneligibleForReimbursementsReminder: UserForNotificationReminderResponse = await moonbeamClient.getAllUsersIneligibleForReimbursements();

                                // check if the get users ineligible for reimbursements notification reminders call was successful or not.
                                if (allUsersIneligibleForReimbursementsReminder !== null && allUsersIneligibleForReimbursementsReminder !== undefined && !allUsersIneligibleForReimbursementsReminder.errorMessage &&
                                    !allUsersIneligibleForReimbursementsReminder.errorType && allUsersIneligibleForReimbursementsReminder.data !== null && allUsersIneligibleForReimbursementsReminder.data !== undefined &&
                                    allUsersIneligibleForReimbursementsReminder.data.length !== 0) {

                                    // 3) For each applicable user from step 2) drop a message into the appropriate SNS topic.
                                    let successfulUserMessagesSent = 0;

                                    // initializing the SNS Client
                                    const snsClient = new SNSClient({region: region});

                                    for (const user of allUsersIneligibleForReimbursementsReminder.data) {
                                        /**
                                         * batch out the notifications in groups of 90, so we don't exceed the maximum SNS send limits per second quota
                                         * currently we can send 100 emails per second.
                                         */
                                        successfulUserMessagesSent % 90 === 0 && await sleep(1500); // sleep for 1.5 seconds for every 90 messages

                                        /**
                                         * drop the ineligible user input as a message to the notification reminder processing topic
                                         */
                                        const userDetailsForNotifications: UserDetailsForNotifications = {
                                            id: user!.id,
                                            email: user!.email,
                                            firstName: user!.firstName,
                                            lastName: user!.lastName,
                                            notificationChannelType: reminder!.notificationChannelType,
                                            notificationType: NotificationType.SpendingTemplate_1Reminder
                                        }
                                        const notificationReminderReceipt = await snsClient.send(new PublishCommand({
                                            TopicArn: process.env.NOTIFICATION_REMINDER_PROCESSING_TOPIC_ARN!,
                                            Message: JSON.stringify(userDetailsForNotifications),
                                            /**
                                             * the message group id, will be represented by the Moonbeam internal user id, so that we can group the notification reminder update messages for a particular
                                             * user id, and sort them in the FIFO processing topic accordingly.
                                             */
                                            MessageGroupId: user!.id
                                        }));

                                        // ensure that the notification reminder message was properly sent to the appropriate processing topic
                                        if (notificationReminderReceipt !== null && notificationReminderReceipt !== undefined && notificationReminderReceipt.MessageId &&
                                            notificationReminderReceipt.MessageId.length !== 0 && notificationReminderReceipt.SequenceNumber && notificationReminderReceipt.SequenceNumber.length !== 0) {
                                            // the notification reminder message has been successfully dropped into the topic, and will be picked up by the notification reminder consumer
                                            console.log(`Notification reminder successfully sent to topic for processing with receipt information: ${notificationReminderReceipt.MessageId} ${notificationReminderReceipt.SequenceNumber}`);
                                            // increase the number of messages sent to the topic
                                            successfulUserMessagesSent += 1;
                                        } else {
                                            /**
                                             * no need for further actions, since this error will be logged and nothing will execute further.
                                             * in the future we might need some alerts and metrics emitting here
                                             */
                                            console.log(`Unexpected error while sending the notification reminder for user ${user!.id}`);
                                        }
                                    }
                                    // check if all applicable users have had successful messages dropped in the notification reminder topic
                                    if (successfulUserMessagesSent === allUsersIneligibleForReimbursementsReminder.data.length) {
                                        console.log(`__________________________________________________________________________________________________________________________________`);
                                        console.log(`Notification reminder successfully sent for users:\n${JSON.stringify(allUsersIneligibleForReimbursementsReminder.data)}`);
                                        /**
                                         * 4) Once all users have been notified, then update the card linking reminder accordingly,
                                         * by calling the updateNotificationReminder AppSync Mutation API.
                                         */
                                        const updateNotificationReminderResponse: NotificationReminderResponse = await moonbeamClient.updateNotificationReminder({
                                            id: reminder!.id,
                                            notificationReminderStatus: NotificationReminderStatus.Active
                                        });

                                        // check if the update notification reminder call was successful or not.
                                        if (updateNotificationReminderResponse !== null && updateNotificationReminderResponse !== undefined &&
                                            !updateNotificationReminderResponse.errorMessage && !updateNotificationReminderResponse.errorType &&
                                            updateNotificationReminderResponse.data !== undefined && updateNotificationReminderResponse.data !== null &&
                                            updateNotificationReminderResponse.data.length !== 0) {
                                            console.log(`Notification reminder ${reminder!.id} successfully updated`);
                                        } else {
                                            /**
                                             * no need for further actions, since this error will be logged and nothing will execute further.
                                             * in the future we might need some alerts and metrics emitting here
                                             */
                                            console.log(`Update notification reminder through UPDATE notification reminder call failed`);
                                        }
                                    } else {
                                        /**
                                         * no need for further actions, since this error will be logged and nothing will execute further.
                                         * in the future we might need some alerts and metrics emitting here
                                         */
                                        console.log(`Not all applicable users have had notification events dropped in the appropriate topic. Re-process these failed messages accordingly.`);
                                    }
                                } else {
                                    /**
                                     * no need for further actions, since this error will be logged and nothing will execute further.
                                     * in the future we might need some alerts and metrics emitting here
                                     */
                                    console.log(`Users for notification reminders retrieval through GET users ineligible for reimbursements call failed`);
                                }
                                break;
                            case NotificationReminderType.ReimbursementsReminder:
                                console.log(`__________________________________________________________________________________________________________________________________`);
                                console.log(`Found new ACTIVE notification reminder ${reminder!.id} of type ${NotificationReminderType.ReimbursementsReminder}`);

                                /**
                                 * 2) For any ACTIVE reminders of type call the getAllUsersEligibleForReimbursements AppSync Query API, in order to get all users eligible for
                                 *    reimbursements to send notification reminders to.
                                 */
                                const allUsersEligibleForReimbursementsReminder: UserForNotificationReminderResponse = await moonbeamClient.getAllUsersEligibleForReimbursements();

                                // check if the get users eligible for reimbursements notification reminders call was successful or not.
                                if (allUsersEligibleForReimbursementsReminder !== null && allUsersEligibleForReimbursementsReminder !== undefined && !allUsersEligibleForReimbursementsReminder.errorMessage &&
                                    !allUsersEligibleForReimbursementsReminder.errorType && allUsersEligibleForReimbursementsReminder.data !== null && allUsersEligibleForReimbursementsReminder.data !== undefined &&
                                    allUsersEligibleForReimbursementsReminder.data.length !== 0) {

                                    // 3) For each applicable user from step 2) drop a message into the appropriate SNS topic.
                                    let successfulUserMessagesSent = 0;

                                    // initializing the SNS Client
                                    const snsClient = new SNSClient({region: region});

                                    for (const user of allUsersEligibleForReimbursementsReminder.data) {
                                        /**
                                         * batch out the notifications in groups of 90, so we don't exceed the maximum SNS send limits per second quota
                                         * currently we can send 100 emails per second.
                                         */
                                        successfulUserMessagesSent % 90 === 0 && await sleep(1500); // sleep for 1.5 seconds for every 90 messages

                                        /**
                                         * drop the ineligible user input as a message to the notification reminder processing topic
                                         */
                                        const userDetailsForNotifications: UserDetailsForNotifications = {
                                            id: user!.id,
                                            email: user!.email,
                                            firstName: user!.firstName,
                                            lastName: user!.lastName,
                                            notificationChannelType: reminder!.notificationChannelType,
                                            notificationType: NotificationType.ReimbursementsReminder
                                        }
                                        const notificationReminderReceipt = await snsClient.send(new PublishCommand({
                                            TopicArn: process.env.NOTIFICATION_REMINDER_PROCESSING_TOPIC_ARN!,
                                            Message: JSON.stringify(userDetailsForNotifications),
                                            /**
                                             * the message group id, will be represented by the Moonbeam internal user id, so that we can group the notification reminder update messages for a particular
                                             * user id, and sort them in the FIFO processing topic accordingly.
                                             */
                                            MessageGroupId: user!.id
                                        }));

                                        // ensure that the notification reminder message was properly sent to the appropriate processing topic
                                        if (notificationReminderReceipt !== null && notificationReminderReceipt !== undefined && notificationReminderReceipt.MessageId &&
                                            notificationReminderReceipt.MessageId.length !== 0 && notificationReminderReceipt.SequenceNumber && notificationReminderReceipt.SequenceNumber.length !== 0) {
                                            // the notification reminder message has been successfully dropped into the topic, and will be picked up by the notification reminder consumer
                                            console.log(`Notification reminder successfully sent to topic for processing with receipt information: ${notificationReminderReceipt.MessageId} ${notificationReminderReceipt.SequenceNumber}`);
                                            // increase the number of messages sent to the topic
                                            successfulUserMessagesSent += 1;
                                        } else {
                                            /**
                                             * no need for further actions, since this error will be logged and nothing will execute further.
                                             * in the future we might need some alerts and metrics emitting here
                                             */
                                            console.log(`Unexpected error while sending the notification reminder for user ${user!.id}`);
                                        }
                                    }
                                    // check if all applicable users have had successful messages dropped in the notification reminder topic
                                    if (successfulUserMessagesSent === allUsersEligibleForReimbursementsReminder.data.length) {
                                        console.log(`__________________________________________________________________________________________________________________________________`);
                                        console.log(`Notification reminder successfully sent for users:\n${JSON.stringify(allUsersEligibleForReimbursementsReminder.data)}`);
                                        /**
                                         * 4) Once all users have been notified, then update the card linking reminder accordingly,
                                         * by calling the updateNotificationReminder AppSync Mutation API.
                                         */
                                        const updateNotificationReminderResponse: NotificationReminderResponse = await moonbeamClient.updateNotificationReminder({
                                            id: reminder!.id,
                                            notificationReminderStatus: NotificationReminderStatus.Active
                                        });

                                        // check if the update notification reminder call was successful or not.
                                        if (updateNotificationReminderResponse !== null && updateNotificationReminderResponse !== undefined &&
                                            !updateNotificationReminderResponse.errorMessage && !updateNotificationReminderResponse.errorType &&
                                            updateNotificationReminderResponse.data !== undefined && updateNotificationReminderResponse.data !== null &&
                                            updateNotificationReminderResponse.data.length !== 0) {
                                            console.log(`Notification reminder ${reminder!.id} successfully updated`);
                                        } else {
                                            /**
                                             * no need for further actions, since this error will be logged and nothing will execute further.
                                             * in the future we might need some alerts and metrics emitting here
                                             */
                                            console.log(`Update notification reminder through UPDATE notification reminder call failed`);
                                        }
                                    } else {
                                        /**
                                         * no need for further actions, since this error will be logged and nothing will execute further.
                                         * in the future we might need some alerts and metrics emitting here
                                         */
                                        console.log(`Not all applicable users have had notification events dropped in the appropriate topic. Re-process these failed messages accordingly.`);
                                    }
                                } else {
                                    /**
                                     * no need for further actions, since this error will be logged and nothing will execute further.
                                     * in the future we might need some alerts and metrics emitting here
                                     */
                                    console.log(`Users for notification reminders retrieval through GET users eligible for reimbursements call failed`);
                                }
                                break;
                            case NotificationReminderType.ReferralTemplateLaunch:
                                console.log(`__________________________________________________________________________________________________________________________________`);
                                console.log(`Found new ACTIVE notification reminder ${reminder!.id} of type ${NotificationReminderType.ReferralTemplateLaunch}`);

                                // 2) For any ACTIVE reminders of type REFERRAL_TEMPLATE_LAUNCH, call the getAllUsersForNotificationReminders Moonbeam AppSync Query API endpoint.
                                const allUsersForReferralLaunchReminder: UserForNotificationReminderResponse = await moonbeamClient.getAllUsersForNotificationReminders();

                                // check if the get all users for notification reminders call was successful or not.
                                if (allUsersForReferralLaunchReminder !== null && allUsersForReferralLaunchReminder !== undefined && !allUsersForReferralLaunchReminder.errorMessage &&
                                    !allUsersForReferralLaunchReminder.errorType && allUsersForReferralLaunchReminder.data !== null && allUsersForReferralLaunchReminder.data !== undefined &&
                                    allUsersForReferralLaunchReminder.data.length !== 0) {

                                    // 3) For each applicable user from step 2) drop a message into the appropriate SNS topic.
                                    let successfulUserMessagesSent = 0;

                                    // initializing the SNS Client
                                    const snsClient = new SNSClient({region: region});

                                    for (const user of allUsersForReferralLaunchReminder.data) {
                                        /**
                                         * batch out the notifications in groups of 90, so we don't exceed the maximum SNS send limits per second quota
                                         * currently we can send 100 emails per second.
                                         */
                                        successfulUserMessagesSent % 90 === 0 && await sleep(1500); // sleep for 1.5 seconds for every 90 messages

                                        /**
                                         * drop the ineligible user input as a message to the notification reminder processing topic
                                         */
                                        const userDetailsForNotifications: UserDetailsForNotifications = {
                                            id: user!.id,
                                            email: user!.email,
                                            firstName: user!.firstName,
                                            lastName: user!.lastName,
                                            notificationChannelType: reminder!.notificationChannelType,
                                            notificationType: NotificationType.ReferralTemplateLaunch
                                        }
                                        const notificationReminderReceipt = await snsClient.send(new PublishCommand({
                                            TopicArn: process.env.NOTIFICATION_REMINDER_PROCESSING_TOPIC_ARN!,
                                            Message: JSON.stringify(userDetailsForNotifications),
                                            /**
                                             * the message group id, will be represented by the Moonbeam internal user id, so that we can group the notification reminder update messages for a particular
                                             * user id, and sort them in the FIFO processing topic accordingly.
                                             */
                                            MessageGroupId: user!.id
                                        }));

                                        // ensure that the notification reminder message was properly sent to the appropriate processing topic
                                        if (notificationReminderReceipt !== null && notificationReminderReceipt !== undefined && notificationReminderReceipt.MessageId &&
                                            notificationReminderReceipt.MessageId.length !== 0 && notificationReminderReceipt.SequenceNumber && notificationReminderReceipt.SequenceNumber.length !== 0) {
                                            // the notification reminder message has been successfully dropped into the topic, and will be picked up by the notification reminder consumer
                                            console.log(`Notification reminder successfully sent to topic for processing with receipt information: ${notificationReminderReceipt.MessageId} ${notificationReminderReceipt.SequenceNumber}`);
                                            // increase the number of messages sent to the topic
                                            successfulUserMessagesSent += 1;
                                        } else {
                                            /**
                                             * no need for further actions, since this error will be logged and nothing will execute further.
                                             * in the future we might need some alerts and metrics emitting here
                                             */
                                            console.log(`Unexpected error while sending the notification reminder for user ${user!.id}`);
                                        }
                                    }
                                    // check if all applicable users have had successful messages dropped in the notification reminder topic
                                    if (successfulUserMessagesSent === allUsersForReferralLaunchReminder.data.length) {
                                        console.log(`__________________________________________________________________________________________________________________________________`);
                                        console.log(`Notification reminder successfully sent for users:\n${JSON.stringify(allUsersForReferralLaunchReminder.data)}`);
                                        /**
                                         * 4) Once all users have been notified, then update the card linking reminder accordingly,
                                         * by calling the updateNotificationReminder AppSync Mutation API.
                                         */
                                        const updateNotificationReminderResponse: NotificationReminderResponse = await moonbeamClient.updateNotificationReminder({
                                            id: reminder!.id,
                                            notificationReminderStatus: NotificationReminderStatus.Active
                                        });

                                        // check if the update notification reminder call was successful or not.
                                        if (updateNotificationReminderResponse !== null && updateNotificationReminderResponse !== undefined &&
                                            !updateNotificationReminderResponse.errorMessage && !updateNotificationReminderResponse.errorType &&
                                            updateNotificationReminderResponse.data !== undefined && updateNotificationReminderResponse.data !== null &&
                                            updateNotificationReminderResponse.data.length !== 0) {
                                            console.log(`Notification reminder ${reminder!.id} successfully updated`);
                                        } else {
                                            /**
                                             * no need for further actions, since this error will be logged and nothing will execute further.
                                             * in the future we might need some alerts and metrics emitting here
                                             */
                                            console.log(`Update notification reminder through UPDATE notification reminder call failed`);
                                        }
                                    } else {
                                        /**
                                         * no need for further actions, since this error will be logged and nothing will execute further.
                                         * in the future we might need some alerts and metrics emitting here
                                         */
                                        console.log(`Not all applicable users have had notification events dropped in the appropriate topic. Re-process these failed messages accordingly.`);
                                    }
                                } else {
                                    /**
                                     * no need for further actions, since this error will be logged and nothing will execute further.
                                     * in the future we might need some alerts and metrics emitting here
                                     */
                                    console.log(`Users for notification reminders retrieval through GET all users for notification reminders call failed`);
                                }
                                break;
                            case NotificationReminderType.ReferralTemplate_1Reminder:
                                console.log(`__________________________________________________________________________________________________________________________________`);
                                console.log(`Found new ACTIVE notification reminder ${reminder!.id} of type ${NotificationReminderType.ReferralTemplate_1Reminder}`);

                                // 2) For any ACTIVE reminders of type REFERRAL_TEMPLATE_1, call the getAllUsersForNotificationReminders Moonbeam AppSync Query API endpoint.
                                const allUsersForReferralTemplate1Reminder: UserForNotificationReminderResponse = await moonbeamClient.getAllUsersForNotificationReminders();

                                // check if the get all users for notification reminders call was successful or not.
                                if (allUsersForReferralTemplate1Reminder !== null && allUsersForReferralTemplate1Reminder !== undefined && !allUsersForReferralTemplate1Reminder.errorMessage &&
                                    !allUsersForReferralTemplate1Reminder.errorType && allUsersForReferralTemplate1Reminder.data !== null && allUsersForReferralTemplate1Reminder.data !== undefined &&
                                    allUsersForReferralTemplate1Reminder.data.length !== 0) {

                                    // 3) For each applicable user from step 2) drop a message into the appropriate SNS topic.
                                    let successfulUserMessagesSent = 0;

                                    // initializing the SNS Client
                                    const snsClient = new SNSClient({region: region});

                                    for (const user of allUsersForReferralTemplate1Reminder.data) {
                                        /**
                                         * batch out the notifications in groups of 90, so we don't exceed the maximum SNS send limits per second quota
                                         * currently we can send 100 emails per second.
                                         */
                                        successfulUserMessagesSent % 90 === 0 && await sleep(1500); // sleep for 1.5 seconds for every 90 messages

                                        /**
                                         * drop the ineligible user input as a message to the notification reminder processing topic
                                         */
                                        const userDetailsForNotifications: UserDetailsForNotifications = {
                                            id: user!.id,
                                            email: user!.email,
                                            firstName: user!.firstName,
                                            lastName: user!.lastName,
                                            notificationChannelType: reminder!.notificationChannelType,
                                            notificationType: NotificationType.ReferralTemplate_1Reminder
                                        }
                                        const notificationReminderReceipt = await snsClient.send(new PublishCommand({
                                            TopicArn: process.env.NOTIFICATION_REMINDER_PROCESSING_TOPIC_ARN!,
                                            Message: JSON.stringify(userDetailsForNotifications),
                                            /**
                                             * the message group id, will be represented by the Moonbeam internal user id, so that we can group the notification reminder update messages for a particular
                                             * user id, and sort them in the FIFO processing topic accordingly.
                                             */
                                            MessageGroupId: user!.id
                                        }));

                                        // ensure that the notification reminder message was properly sent to the appropriate processing topic
                                        if (notificationReminderReceipt !== null && notificationReminderReceipt !== undefined && notificationReminderReceipt.MessageId &&
                                            notificationReminderReceipt.MessageId.length !== 0 && notificationReminderReceipt.SequenceNumber && notificationReminderReceipt.SequenceNumber.length !== 0) {
                                            // the notification reminder message has been successfully dropped into the topic, and will be picked up by the notification reminder consumer
                                            console.log(`Notification reminder successfully sent to topic for processing with receipt information: ${notificationReminderReceipt.MessageId} ${notificationReminderReceipt.SequenceNumber}`);
                                            // increase the number of messages sent to the topic
                                            successfulUserMessagesSent += 1;
                                        } else {
                                            /**
                                             * no need for further actions, since this error will be logged and nothing will execute further.
                                             * in the future we might need some alerts and metrics emitting here
                                             */
                                            console.log(`Unexpected error while sending the notification reminder for user ${user!.id}`);
                                        }
                                    }
                                    // check if all applicable users have had successful messages dropped in the notification reminder topic
                                    if (successfulUserMessagesSent === allUsersForReferralTemplate1Reminder.data.length) {
                                        console.log(`__________________________________________________________________________________________________________________________________`);
                                        console.log(`Notification reminder successfully sent for users:\n${JSON.stringify(allUsersForReferralTemplate1Reminder.data)}`);
                                        /**
                                         * 4) Once all users have been notified, then update the card linking reminder accordingly,
                                         * by calling the updateNotificationReminder AppSync Mutation API.
                                         */
                                        const updateNotificationReminderResponse: NotificationReminderResponse = await moonbeamClient.updateNotificationReminder({
                                            id: reminder!.id,
                                            notificationReminderStatus: NotificationReminderStatus.Active
                                        });

                                        // check if the update notification reminder call was successful or not.
                                        if (updateNotificationReminderResponse !== null && updateNotificationReminderResponse !== undefined &&
                                            !updateNotificationReminderResponse.errorMessage && !updateNotificationReminderResponse.errorType &&
                                            updateNotificationReminderResponse.data !== undefined && updateNotificationReminderResponse.data !== null &&
                                            updateNotificationReminderResponse.data.length !== 0) {
                                            console.log(`Notification reminder ${reminder!.id} successfully updated`);
                                        } else {
                                            /**
                                             * no need for further actions, since this error will be logged and nothing will execute further.
                                             * in the future we might need some alerts and metrics emitting here
                                             */
                                            console.log(`Update notification reminder through UPDATE notification reminder call failed`);
                                        }
                                    } else {
                                        /**
                                         * no need for further actions, since this error will be logged and nothing will execute further.
                                         * in the future we might need some alerts and metrics emitting here
                                         */
                                        console.log(`Not all applicable users have had notification events dropped in the appropriate topic. Re-process these failed messages accordingly.`);
                                    }
                                } else {
                                    /**
                                     * no need for further actions, since this error will be logged and nothing will execute further.
                                     * in the future we might need some alerts and metrics emitting here
                                     */
                                    console.log(`Users for notification reminders retrieval through GET all users for notification reminders call failed`);
                                }
                                break;
                            case NotificationReminderType.MultipleCardFeatureReminder:
                                console.log(`__________________________________________________________________________________________________________________________________`);
                                console.log(`Found new ACTIVE notification reminder ${reminder!.id} of type ${NotificationReminderType.MultipleCardFeatureReminder}`);

                                // 2) For any ACTIVE reminders of type MULTIPLE_CARD_FEATURE_REMINDER, call the getAllUsersForNotificationReminders Moonbeam AppSync Query API endpoint.
                                const multipleCardsForReferralReminder: UserForNotificationReminderResponse = await moonbeamClient.getAllUsersForNotificationReminders();

                                // check if the get all users for notification reminders call was successful or not.
                                if (multipleCardsForReferralReminder !== null && multipleCardsForReferralReminder !== undefined && !multipleCardsForReferralReminder.errorMessage &&
                                    !multipleCardsForReferralReminder.errorType && multipleCardsForReferralReminder.data !== null && multipleCardsForReferralReminder.data !== undefined &&
                                    multipleCardsForReferralReminder.data.length !== 0) {

                                    // 3) For each applicable user from step 2) drop a message into the appropriate SNS topic.
                                    let successfulUserMessagesSent = 0;

                                    // initializing the SNS Client
                                    const snsClient = new SNSClient({region: region});

                                    for (const user of multipleCardsForReferralReminder.data) {
                                        /**
                                         * batch out the notifications in groups of 90, so we don't exceed the maximum SNS send limits per second quota
                                         * currently we can send 100 emails per second.
                                         */
                                        successfulUserMessagesSent % 90 === 0 && await sleep(1500); // sleep for 1.5 seconds for every 90 messages

                                        /**
                                         * drop the ineligible user input as a message to the notification reminder processing topic
                                         */
                                        const userDetailsForNotifications: UserDetailsForNotifications = {
                                            id: user!.id,
                                            email: user!.email,
                                            firstName: user!.firstName,
                                            lastName: user!.lastName,
                                            notificationChannelType: reminder!.notificationChannelType,
                                            notificationType: NotificationType.MultipleCardFeatureReminder
                                        }
                                        const notificationReminderReceipt = await snsClient.send(new PublishCommand({
                                            TopicArn: process.env.NOTIFICATION_REMINDER_PROCESSING_TOPIC_ARN!,
                                            Message: JSON.stringify(userDetailsForNotifications),
                                            /**
                                             * the message group id, will be represented by the Moonbeam internal user id, so that we can group the notification reminder update messages for a particular
                                             * user id, and sort them in the FIFO processing topic accordingly.
                                             */
                                            MessageGroupId: user!.id
                                        }));

                                        // ensure that the notification reminder message was properly sent to the appropriate processing topic
                                        if (notificationReminderReceipt !== null && notificationReminderReceipt !== undefined && notificationReminderReceipt.MessageId &&
                                            notificationReminderReceipt.MessageId.length !== 0 && notificationReminderReceipt.SequenceNumber && notificationReminderReceipt.SequenceNumber.length !== 0) {
                                            // the notification reminder message has been successfully dropped into the topic, and will be picked up by the notification reminder consumer
                                            console.log(`Notification reminder successfully sent to topic for processing with receipt information: ${notificationReminderReceipt.MessageId} ${notificationReminderReceipt.SequenceNumber}`);
                                            // increase the number of messages sent to the topic
                                            successfulUserMessagesSent += 1;
                                        } else {
                                            /**
                                             * no need for further actions, since this error will be logged and nothing will execute further.
                                             * in the future we might need some alerts and metrics emitting here
                                             */
                                            console.log(`Unexpected error while sending the notification reminder for user ${user!.id}`);
                                        }
                                    }
                                    // check if all applicable users have had successful messages dropped in the notification reminder topic
                                    if (successfulUserMessagesSent === multipleCardsForReferralReminder.data.length) {
                                        console.log(`__________________________________________________________________________________________________________________________________`);
                                        console.log(`Notification reminder successfully sent for users:\n${JSON.stringify(multipleCardsForReferralReminder.data)}`);
                                        /**
                                         * 4) Once all users have been notified, then update the card linking reminder accordingly,
                                         * by calling the updateNotificationReminder AppSync Mutation API.
                                         */
                                        const updateNotificationReminderResponse: NotificationReminderResponse = await moonbeamClient.updateNotificationReminder({
                                            id: reminder!.id,
                                            notificationReminderStatus: NotificationReminderStatus.Active
                                        });

                                        // check if the update notification reminder call was successful or not.
                                        if (updateNotificationReminderResponse !== null && updateNotificationReminderResponse !== undefined &&
                                            !updateNotificationReminderResponse.errorMessage && !updateNotificationReminderResponse.errorType &&
                                            updateNotificationReminderResponse.data !== undefined && updateNotificationReminderResponse.data !== null &&
                                            updateNotificationReminderResponse.data.length !== 0) {
                                            console.log(`Notification reminder ${reminder!.id} successfully updated`);
                                        } else {
                                            /**
                                             * no need for further actions, since this error will be logged and nothing will execute further.
                                             * in the future we might need some alerts and metrics emitting here
                                             */
                                            console.log(`Update notification reminder through UPDATE notification reminder call failed`);
                                        }
                                    } else {
                                        /**
                                         * no need for further actions, since this error will be logged and nothing will execute further.
                                         * in the future we might need some alerts and metrics emitting here
                                         */
                                        console.log(`Not all applicable users have had notification events dropped in the appropriate topic. Re-process these failed messages accordingly.`);
                                    }
                                } else {
                                    /**
                                     * no need for further actions, since this error will be logged and nothing will execute further.
                                     * in the future we might need some alerts and metrics emitting here
                                     */
                                    console.log(`Users for notification reminders retrieval through GET all users for notification reminders call failed`);
                                }
                                break;
                            case NotificationReminderType.SpouseFeatureReminder:
                                console.log(`__________________________________________________________________________________________________________________________________`);
                                console.log(`Found new ACTIVE notification reminder ${reminder!.id} of type ${NotificationReminderType.SpouseFeatureReminder}`);

                                // 2) For any ACTIVE reminders of type SPOUSE_FEATURE_REMINDER, call the getAllUsersForNotificationReminders Moonbeam AppSync Query API endpoint.
                                const spouseFeatureReminder: UserForNotificationReminderResponse = await moonbeamClient.getAllUsersForNotificationReminders();

                                // check if the get all users for notification reminders call was successful or not.
                                if (spouseFeatureReminder !== null && spouseFeatureReminder !== undefined && !spouseFeatureReminder.errorMessage &&
                                    !spouseFeatureReminder.errorType && spouseFeatureReminder.data !== null && spouseFeatureReminder.data !== undefined &&
                                    spouseFeatureReminder.data.length !== 0) {

                                    // 3) For each applicable user from step 2) drop a message into the appropriate SNS topic.
                                    let successfulUserMessagesSent = 0;

                                    // initializing the SNS Client
                                    const snsClient = new SNSClient({region: region});

                                    for (const user of spouseFeatureReminder.data) {
                                        /**
                                         * batch out the notifications in groups of 90, so we don't exceed the maximum SNS send limits per second quota
                                         * currently we can send 100 emails per second.
                                         */
                                        successfulUserMessagesSent % 90 === 0 && await sleep(1500); // sleep for 1.5 seconds for every 90 messages

                                        /**
                                         * drop the ineligible user input as a message to the notification reminder processing topic
                                         */
                                        const userDetailsForNotifications: UserDetailsForNotifications = {
                                            id: user!.id,
                                            email: user!.email,
                                            firstName: user!.firstName,
                                            lastName: user!.lastName,
                                            notificationChannelType: reminder!.notificationChannelType,
                                            notificationType: NotificationType.SpouseFeatureReminder
                                        }
                                        const notificationReminderReceipt = await snsClient.send(new PublishCommand({
                                            TopicArn: process.env.NOTIFICATION_REMINDER_PROCESSING_TOPIC_ARN!,
                                            Message: JSON.stringify(userDetailsForNotifications),
                                            /**
                                             * the message group id, will be represented by the Moonbeam internal user id, so that we can group the notification reminder update messages for a particular
                                             * user id, and sort them in the FIFO processing topic accordingly.
                                             */
                                            MessageGroupId: user!.id
                                        }));

                                        // ensure that the notification reminder message was properly sent to the appropriate processing topic
                                        if (notificationReminderReceipt !== null && notificationReminderReceipt !== undefined && notificationReminderReceipt.MessageId &&
                                            notificationReminderReceipt.MessageId.length !== 0 && notificationReminderReceipt.SequenceNumber && notificationReminderReceipt.SequenceNumber.length !== 0) {
                                            // the notification reminder message has been successfully dropped into the topic, and will be picked up by the notification reminder consumer
                                            console.log(`Notification reminder successfully sent to topic for processing with receipt information: ${notificationReminderReceipt.MessageId} ${notificationReminderReceipt.SequenceNumber}`);
                                            // increase the number of messages sent to the topic
                                            successfulUserMessagesSent += 1;
                                        } else {
                                            /**
                                             * no need for further actions, since this error will be logged and nothing will execute further.
                                             * in the future we might need some alerts and metrics emitting here
                                             */
                                            console.log(`Unexpected error while sending the notification reminder for user ${user!.id}`);
                                        }
                                    }
                                    // check if all applicable users have had successful messages dropped in the notification reminder topic
                                    if (successfulUserMessagesSent === spouseFeatureReminder.data.length) {
                                        console.log(`__________________________________________________________________________________________________________________________________`);
                                        console.log(`Notification reminder successfully sent for users:\n${JSON.stringify(spouseFeatureReminder.data)}`);
                                        /**
                                         * 4) Once all users have been notified, then update the card linking reminder accordingly,
                                         * by calling the updateNotificationReminder AppSync Mutation API.
                                         */
                                        const updateNotificationReminderResponse: NotificationReminderResponse = await moonbeamClient.updateNotificationReminder({
                                            id: reminder!.id,
                                            notificationReminderStatus: NotificationReminderStatus.Active
                                        });

                                        // check if the update notification reminder call was successful or not.
                                        if (updateNotificationReminderResponse !== null && updateNotificationReminderResponse !== undefined &&
                                            !updateNotificationReminderResponse.errorMessage && !updateNotificationReminderResponse.errorType &&
                                            updateNotificationReminderResponse.data !== undefined && updateNotificationReminderResponse.data !== null &&
                                            updateNotificationReminderResponse.data.length !== 0) {
                                            console.log(`Notification reminder ${reminder!.id} successfully updated`);
                                        } else {
                                            /**
                                             * no need for further actions, since this error will be logged and nothing will execute further.
                                             * in the future we might need some alerts and metrics emitting here
                                             */
                                            console.log(`Update notification reminder through UPDATE notification reminder call failed`);
                                        }
                                    } else {
                                        /**
                                         * no need for further actions, since this error will be logged and nothing will execute further.
                                         * in the future we might need some alerts and metrics emitting here
                                         */
                                        console.log(`Not all applicable users have had notification events dropped in the appropriate topic. Re-process these failed messages accordingly.`);
                                    }
                                } else {
                                    /**
                                     * no need for further actions, since this error will be logged and nothing will execute further.
                                     * in the future we might need some alerts and metrics emitting here
                                     */
                                    console.log(`Users for notification reminders retrieval through GET all users for notification reminders call failed`);
                                }
                                break;
                            case NotificationReminderType.FeedbackTemplate_1Reminder:
                                console.log(`__________________________________________________________________________________________________________________________________`);
                                console.log(`Found new ACTIVE notification reminder ${reminder!.id} of type ${NotificationReminderType.FeedbackTemplate_1Reminder}`);

                                // 2) For any ACTIVE reminders of type FEEDBACK_TEMPLATE_1_REMINDER, call the getAllUsersForNotificationReminders Moonbeam AppSync Query API endpoint.
                                const feedbackTemplateReminder: UserForNotificationReminderResponse = await moonbeamClient.getAllUsersForNotificationReminders();

                                // check if the get all users for notification reminders call was successful or not.
                                if (feedbackTemplateReminder !== null && feedbackTemplateReminder !== undefined && !feedbackTemplateReminder.errorMessage &&
                                    !feedbackTemplateReminder.errorType && feedbackTemplateReminder.data !== null && feedbackTemplateReminder.data !== undefined &&
                                    feedbackTemplateReminder.data.length !== 0) {

                                    // 3) For each applicable user from step 2) drop a message into the appropriate SNS topic.
                                    let successfulUserMessagesSent = 0;

                                    // initializing the SNS Client
                                    const snsClient = new SNSClient({region: region});

                                    for (const user of feedbackTemplateReminder.data) {
                                        /**
                                         * batch out the notifications in groups of 90, so we don't exceed the maximum SNS send limits per second quota
                                         * currently we can send 100 emails per second.
                                         */
                                        successfulUserMessagesSent % 90 === 0 && await sleep(1500); // sleep for 1.5 seconds for every 90 messages

                                        /**
                                         * drop the ineligible user input as a message to the notification reminder processing topic
                                         */
                                        const userDetailsForNotifications: UserDetailsForNotifications = {
                                            id: user!.id,
                                            email: user!.email,
                                            firstName: user!.firstName,
                                            lastName: user!.lastName,
                                            notificationChannelType: reminder!.notificationChannelType,
                                            notificationType: NotificationType.FeedbackTemplate_1Reminder
                                        }
                                        const notificationReminderReceipt = await snsClient.send(new PublishCommand({
                                            TopicArn: process.env.NOTIFICATION_REMINDER_PROCESSING_TOPIC_ARN!,
                                            Message: JSON.stringify(userDetailsForNotifications),
                                            /**
                                             * the message group id, will be represented by the Moonbeam internal user id, so that we can group the notification reminder update messages for a particular
                                             * user id, and sort them in the FIFO processing topic accordingly.
                                             */
                                            MessageGroupId: user!.id
                                        }));

                                        // ensure that the notification reminder message was properly sent to the appropriate processing topic
                                        if (notificationReminderReceipt !== null && notificationReminderReceipt !== undefined && notificationReminderReceipt.MessageId &&
                                            notificationReminderReceipt.MessageId.length !== 0 && notificationReminderReceipt.SequenceNumber && notificationReminderReceipt.SequenceNumber.length !== 0) {
                                            // the notification reminder message has been successfully dropped into the topic, and will be picked up by the notification reminder consumer
                                            console.log(`Notification reminder successfully sent to topic for processing with receipt information: ${notificationReminderReceipt.MessageId} ${notificationReminderReceipt.SequenceNumber}`);
                                            // increase the number of messages sent to the topic
                                            successfulUserMessagesSent += 1;
                                        } else {
                                            /**
                                             * no need for further actions, since this error will be logged and nothing will execute further.
                                             * in the future we might need some alerts and metrics emitting here
                                             */
                                            console.log(`Unexpected error while sending the notification reminder for user ${user!.id}`);
                                        }
                                    }
                                    // check if all applicable users have had successful messages dropped in the notification reminder topic
                                    if (successfulUserMessagesSent === feedbackTemplateReminder.data.length) {
                                        console.log(`__________________________________________________________________________________________________________________________________`);
                                        console.log(`Notification reminder successfully sent for users:\n${JSON.stringify(feedbackTemplateReminder.data)}`);
                                        /**
                                         * 4) Once all users have been notified, then update the card linking reminder accordingly,
                                         * by calling the updateNotificationReminder AppSync Mutation API.
                                         */
                                        const updateNotificationReminderResponse: NotificationReminderResponse = await moonbeamClient.updateNotificationReminder({
                                            id: reminder!.id,
                                            notificationReminderStatus: NotificationReminderStatus.Active
                                        });

                                        // check if the update notification reminder call was successful or not.
                                        if (updateNotificationReminderResponse !== null && updateNotificationReminderResponse !== undefined &&
                                            !updateNotificationReminderResponse.errorMessage && !updateNotificationReminderResponse.errorType &&
                                            updateNotificationReminderResponse.data !== undefined && updateNotificationReminderResponse.data !== null &&
                                            updateNotificationReminderResponse.data.length !== 0) {
                                            console.log(`Notification reminder ${reminder!.id} successfully updated`);
                                        } else {
                                            /**
                                             * no need for further actions, since this error will be logged and nothing will execute further.
                                             * in the future we might need some alerts and metrics emitting here
                                             */
                                            console.log(`Update notification reminder through UPDATE notification reminder call failed`);
                                        }
                                    } else {
                                        /**
                                         * no need for further actions, since this error will be logged and nothing will execute further.
                                         * in the future we might need some alerts and metrics emitting here
                                         */
                                        console.log(`Not all applicable users have had notification events dropped in the appropriate topic. Re-process these failed messages accordingly.`);
                                    }
                                } else {
                                    /**
                                     * no need for further actions, since this error will be logged and nothing will execute further.
                                     * in the future we might need some alerts and metrics emitting here
                                     */
                                    console.log(`Users for notification reminders retrieval through GET all users for notification reminders call failed`);
                                }
                                break;
                            default:
                                console.log(`Unknown notification reminder type passed in for ACTIVE reminder ${reminder!.notificationReminderType}`);
                        }
                        activeReminderCount += 1;
                    }
                }
            }
            console.log(`__________________________________________________________________________________________________________________________________`);
            console.log(`Ran trigger for Notification Reminders at ${new Date(Date.now()).toISOString()}, and found ${activeReminderCount} ACTIVE reminders`);
        } else {
            /**
             * no need for further actions, since this error will be logged and nothing will execute further.
             * in the future we might need some alerts and metrics emitting here
             */
            console.log(`Notification Reminder retrieval through GET notification reminders call failed`);
        }
    } catch (error) {
        /**
         * no need for further actions, since this error will be logged and nothing will execute further.
         * in the future we might need some alerts and metrics emitting here
         */
        console.log(`Unexpected error while processing the notification reminder cron event ${error}`);
    }
}

/**
 * Function used to timeout/sleep for a particular number of milliseconds
 *
 * @param ms number of milliseconds to timeout for.
 */
export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
