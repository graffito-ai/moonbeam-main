import {
    CourierClient,
    CreateBulkNotificationInput,
    CreateBulkNotificationResponse,
    CreateNotificationResponse,
    Notification,
    NotificationChannelType,
    NotificationResponse,
    NotificationsErrorType,
    NotificationStatus,
    NotificationType,
    SendEmailNotificationInput,
    SendMobilePushNotificationInput
} from "@moonbeam/moonbeam-models";

/**
 * CreateBulkNotification resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param createBulkNotificationInput create bulk notification input object, used to create a bulk notification
 * based on an event (reimbursement, transaction, card expiration, successful registration, etc.).
 * @returns {@link Promise} of {@link CreateNotificationResponse}
 */
export const createBulkNotification = async (fieldName: string, createBulkNotificationInput: CreateBulkNotificationInput): Promise<CreateBulkNotificationResponse> => {
    // for now, we won't store bulk notifications in our DB. Whenever we introduce a bulk type deemed to be stored in the DB, we can modify this accordingly
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        /**
         * first, we need to call the appropriate Courier API (with the appropriate implementation), depending on the bulk Notification
         * type, as well as the channel, to be passed in.
         *
         * initialize the Courier Client API here, in order to call the appropriate endpoints for this handler
         */
        const courierClient = new CourierClient(process.env.ENV_NAME!, region);
        // switch based on the type first
        switch (createBulkNotificationInput.type) {
            case NotificationType.DailyEarningsSummary:
                return newBulkDailyEarningsSummaryNotification(createBulkNotificationInput, courierClient);
            default:
                const errorMessage = `Unexpected bulk notification type ${createBulkNotificationInput.type}`;
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: NotificationsErrorType.ValidationError
                }
        }
    } catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} mutation ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: NotificationsErrorType.UnexpectedError
        }
    }
}

/**
 * Function used to notify users when they get a new daily earnings summary generated.
 *
 * @param createBulkNotificationInput create bulk notification input object, used to create a bulk notification
 * for all users' daily earnings summary generations.
 * @param courierClient Courier client used to send notifications
 *
 * @returns {@link Promise} of {@link CreateNotificationResponse}
 */
const newBulkDailyEarningsSummaryNotification = async (createBulkNotificationInput: CreateBulkNotificationInput, courierClient: CourierClient): Promise<CreateBulkNotificationResponse> => {
    console.log('Sending bulk daily earnings summary notification');
    switch (createBulkNotificationInput.channelType) {
        case NotificationChannelType.Email:
            /**
             * first loop through all the notifications in the bulk, and build out the list to send
             * to the bulk email notification function.
             *
             * we also want to build out our return/response list of notifications accordingly.
             */
            let validNotificationsInBulk: boolean = true;
            const notificationResults: Notification[] = [];
            const sendEmailNotificationInputs: SendEmailNotificationInput[] = [];
            createBulkNotificationInput.bulkNotifications.forEach(notification => {
                if (notification !== null) {
                    // validate that we have the necessary information to send an email
                    if (notification.emailDestination && notification.emailDestination.length !== 0 &&
                        notification.userFullName && notification.userFullName.length !== 0 &&
                        notification.transactions && notification.transactions !== null && notification.transactions.length !== 0 &&
                        notification.dailyEarningsSummaryAmount && notification.dailyEarningsSummaryAmount !== null) {
                        // build the notification results and sendEmailNotificationInputs array
                        const sendEmailNotificationInput: SendEmailNotificationInput = {
                            emailDestination: notification.emailDestination!,
                            userFullName: notification.userFullName!,
                            transactions: notification.transactions!,
                            dailyEarningsSummaryAmount: notification.dailyEarningsSummaryAmount!
                        }
                        sendEmailNotificationInputs.push(sendEmailNotificationInput);

                        const createdAt = new Date().toISOString();
                        const notificationResult: Notification = {
                            channelType: NotificationChannelType.Email,
                            createdAt: createdAt,
                            emailDestination: notification.emailDestination!,
                            id: notification.id,
                            notificationId: "abc123",
                            status: NotificationStatus.Sent,
                            timestamp: Date.parse(createdAt),
                            type: NotificationType.DailyEarningsSummary,
                            updatedAt: createdAt,
                            userFullName: notification.userFullName!
                        }
                        notificationResults.push(notificationResult);
                    } else {
                        validNotificationsInBulk = false;
                    }
                }
            });

            // if we have any invalid notifications in the bulk, then we cannot proceed
            if (!validNotificationsInBulk && sendEmailNotificationInputs.length !== 0 && notificationResults.length !== 0) {
                const errorMessage = `Invalid information passed in, to process a bulk notification through ${createBulkNotificationInput.channelType}, for bulk notification type ${createBulkNotificationInput.type}`;
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: NotificationsErrorType.ValidationError
                }
            } else {
                // attempt to send a bulk email notification through Courier
                const sendBulkEmailNotificationResponse: NotificationResponse = await courierClient.sendBulkEmailNotification({
                    emailNotificationInputs: sendEmailNotificationInputs
                }, NotificationType.DailyEarningsSummary);

                // check to see if the bulk email notification was successfully sent or not
                if (!sendBulkEmailNotificationResponse || sendBulkEmailNotificationResponse.errorMessage ||
                    sendBulkEmailNotificationResponse.errorType || !sendBulkEmailNotificationResponse.requestId) {
                    const errorMessage = `Bulk email notification sending through the POST Courier send bulk push notification message call failed ${JSON.stringify(sendBulkEmailNotificationResponse)}`
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: NotificationsErrorType.UnexpectedError
                    }
                } else {
                    // return the created notification results
                    return {
                        data: notificationResults
                    }
                }
            }
        case NotificationChannelType.Push:
            /**
             * first loop through all the notifications in the bulk, and build out the list to send
             * to the bulk email notification function.
             *
             * we also want to build out our return/response list of notifications accordingly.
             */
            let mobilePushValidNotificationsInBulk: boolean = true;
            const mobilePushNotificationResults: Notification[] = [];
            const sendMobilePushNotificationInputs: SendMobilePushNotificationInput[] = [];
            createBulkNotificationInput.bulkNotifications.forEach(notification => {
                if (notification !== null) {
                    // validate that we have the necessary information to send a mobile push
                    if (notification.expoPushTokens && notification.expoPushTokens.length !== 0 &&
                        notification.dailyEarningsSummaryAmount && notification.dailyEarningsSummaryAmount !== null) {
                        // build the notification results and sendMobilePushNotificationInputs array
                        const sendMobilePushNotificationInput: SendMobilePushNotificationInput = {
                            expoPushTokens: notification.expoPushTokens!,
                            dailyEarningsSummaryAmount: notification.dailyEarningsSummaryAmount!
                        }
                        sendMobilePushNotificationInputs.push(sendMobilePushNotificationInput);

                        const createdAt = new Date().toISOString();
                        const mobilePushNotificationResult: Notification = {
                            channelType: NotificationChannelType.Push,
                            createdAt: createdAt,
                            expoPushTokens: notification.expoPushTokens,
                            id: notification.id,
                            notificationId: "abc123",
                            status: NotificationStatus.Sent,
                            timestamp: Date.parse(createdAt),
                            type: NotificationType.DailyEarningsSummary,
                            updatedAt: createdAt
                        }
                        mobilePushNotificationResults.push(mobilePushNotificationResult);
                    } else {
                        mobilePushValidNotificationsInBulk = false;
                    }
                }
            });

            // if we have any invalid notifications in the bulk, then we cannot proceed
            if (!mobilePushValidNotificationsInBulk && sendMobilePushNotificationInputs.length !== 0 && mobilePushNotificationResults.length !== 0) {
                const errorMessage = `Invalid information passed in, to process a bulk notification through ${createBulkNotificationInput.channelType}, for bulk notification type ${createBulkNotificationInput.type}`;
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: NotificationsErrorType.ValidationError
                }
            } else {
                // attempt to send a bulk mobile push notification through Courier
                const sendBulkMobilePushNotificationResponse: NotificationResponse = await courierClient.sendBulkMobilePushNotification({
                    mobilePushNotificationInputs: sendMobilePushNotificationInputs
                }, NotificationType.DailyEarningsSummary);

                // check to see if the bulk mobile push notification was successfully sent or not
                if (!sendBulkMobilePushNotificationResponse || sendBulkMobilePushNotificationResponse.errorMessage ||
                    sendBulkMobilePushNotificationResponse.errorType || !sendBulkMobilePushNotificationResponse.requestId) {
                    const errorMessage = `Bulk mobile push notification sending through the POST Courier send bulk push notification message call failed ${JSON.stringify(sendBulkMobilePushNotificationResponse)}`
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: NotificationsErrorType.UnexpectedError
                    }
                } else {
                    // return the created notification results
                    return {
                        data: mobilePushNotificationResults
                    }
                }
            }
        default:
            const errorMessage = `Unsupported bulk notification channel ${createBulkNotificationInput.channelType}, for bulk notification type ${createBulkNotificationInput.type}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: NotificationsErrorType.ValidationError
            }
    }
}
