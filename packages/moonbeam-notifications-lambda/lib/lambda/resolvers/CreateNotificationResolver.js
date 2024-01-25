"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotification = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * CreateNotification resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param createNotificationInput create notifications input object, used to create a notification
 * based on an event (reimbursement, transaction, card expiration, successful registration).
 * @returns {@link Promise} of {@link CreateNotificationResponse}
 */
const createNotification = async (fieldName, createNotificationInput) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        // initializing the DynamoDB document client
        const dynamoDbClient = new client_dynamodb_1.DynamoDBClient({ region: region });
        // update the timestamps accordingly
        const createdAt = new Date().toISOString();
        createNotificationInput.timestamp = createNotificationInput.timestamp ? createNotificationInput.timestamp : Date.parse(createdAt);
        createNotificationInput.createdAt = createNotificationInput.createdAt ? createNotificationInput.createdAt : createdAt;
        createNotificationInput.updatedAt = createNotificationInput.updatedAt ? createNotificationInput.updatedAt : createdAt;
        /**
         * check to see if the same notifications already exists in the DB. Although this is a very rare situation (if at all),
         * we want to put a safeguard around duplicates even here.
         */
        const preExistingNotification = await dynamoDbClient.send(new client_dynamodb_1.GetItemCommand({
            TableName: process.env.NOTIFICATIONS_TABLE,
            Key: {
                id: {
                    S: createNotificationInput.id
                },
                timestamp: {
                    N: createNotificationInput.timestamp.toString()
                }
            },
            /**
             * we're not interested in getting all the data for this call, just the minimum for us to determine whether this is a duplicate or not
             *
             * @link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html
             * @link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ExpressionAttributeNames.html
             */
            ProjectionExpression: '#idf, #t',
            ExpressionAttributeNames: {
                '#idf': 'id',
                '#t': 'timestamp'
            }
        }));
        // if there is an item retrieved, then we return an error
        if (preExistingNotification && preExistingNotification.Item) {
            /**
             * if there is a pre-existing notification with the same composite primary key (userId/id, timestamp) combination,
             * then we cannot duplicate that, so we will return an error.
             */
            const errorMessage = `Duplicate notification found!`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.NotificationsErrorType.DuplicateObjectFound
            };
        }
        else {
            /**
             * first, we need to call the appropriate Courier API (with the appropriate implementation), depending on the Notification
             * type, as well as the channel, to be passed in.
             *
             * initialize the Courier Client API here, in order to call the appropriate endpoints for this handler
             */
            const courierClient = new moonbeam_models_1.CourierClient(process.env.ENV_NAME, region);
            // switch based on the type first
            switch (createNotificationInput.type) {
                case moonbeam_models_1.NotificationType.NewUserSignup:
                    return newUserSignUpNotification(createNotificationInput, courierClient, dynamoDbClient);
                case moonbeam_models_1.NotificationType.NewQualifyingOfferAvailable:
                    return newUserQualifyingOfferNotification(createNotificationInput, courierClient, dynamoDbClient);
                case moonbeam_models_1.NotificationType.MilitaryStatusChangedPendingToRejected:
                    return militaryStatusUpdateNotification(createNotificationInput, courierClient, dynamoDbClient, moonbeam_models_1.NotificationType.MilitaryStatusChangedPendingToRejected);
                case moonbeam_models_1.NotificationType.MilitaryStatusChangedPendingToVerified:
                    return militaryStatusUpdateNotification(createNotificationInput, courierClient, dynamoDbClient, moonbeam_models_1.NotificationType.MilitaryStatusChangedPendingToVerified);
                case moonbeam_models_1.NotificationType.CardLinkingReminder:
                    return standardEmailAndPushNotification(createNotificationInput, courierClient, dynamoDbClient, moonbeam_models_1.NotificationType.CardLinkingReminder);
                case moonbeam_models_1.NotificationType.NewMapFeatureReminder:
                    return standardEmailAndPushNotification(createNotificationInput, courierClient, dynamoDbClient, moonbeam_models_1.NotificationType.NewMapFeatureReminder);
                case moonbeam_models_1.NotificationType.VeteransDayTemplate_1Reminder:
                    return standardPushNotification(createNotificationInput, courierClient, dynamoDbClient, moonbeam_models_1.NotificationType.VeteransDayTemplate_1Reminder);
                case moonbeam_models_1.NotificationType.VeteransDayTemplate_2Reminder:
                    return standardPushNotification(createNotificationInput, courierClient, dynamoDbClient, moonbeam_models_1.NotificationType.VeteransDayTemplate_2Reminder);
                case moonbeam_models_1.NotificationType.VeteransDayTemplate_3Reminder:
                    return standardEmailAndPushNotification(createNotificationInput, courierClient, dynamoDbClient, moonbeam_models_1.NotificationType.VeteransDayTemplate_3Reminder);
                case moonbeam_models_1.NotificationType.ReferralTemplateLaunch:
                    return standardEmailAndPushNotification(createNotificationInput, courierClient, dynamoDbClient, moonbeam_models_1.NotificationType.ReferralTemplateLaunch);
                case moonbeam_models_1.NotificationType.ReferralTemplate_1Reminder:
                    return standardEmailAndPushNotification(createNotificationInput, courierClient, dynamoDbClient, moonbeam_models_1.NotificationType.ReferralTemplate_1Reminder);
                case moonbeam_models_1.NotificationType.MultipleCardFeatureReminder:
                    return standardEmailAndPushNotification(createNotificationInput, courierClient, dynamoDbClient, moonbeam_models_1.NotificationType.MultipleCardFeatureReminder);
                case moonbeam_models_1.NotificationType.SpouseFeatureReminder:
                    return standardEmailNotification(createNotificationInput, courierClient, dynamoDbClient, moonbeam_models_1.NotificationType.SpouseFeatureReminder);
                case moonbeam_models_1.NotificationType.FeedbackTemplate_1Reminder:
                    return standardEmailNotification(createNotificationInput, courierClient, dynamoDbClient, moonbeam_models_1.NotificationType.FeedbackTemplate_1Reminder);
                default:
                    const errorMessage = `Unexpected notification type ${createNotificationInput.type}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: moonbeam_models_1.NotificationsErrorType.ValidationError
                    };
            }
        }
    }
    catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} mutation ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: moonbeam_models_1.NotificationsErrorType.UnexpectedError
        };
    }
};
exports.createNotification = createNotification;
/**
 * Function used for standard email notification reminders.
 *
 * @param createNotificationInput create notifications input object, used to create a notification
 * for a user card linking reminder.
 * @param courierClient Courier client used to send notifications
 * @param dynamoDbClient Dynamo DB client used to store the notification internally
 * @param notificationType type of notification passed in, used to determine the status update types that we are performing
 *
 * @returns {@link Promise} of {@link CreateNotificationResponse}
 */
const standardEmailNotification = async (createNotificationInput, courierClient, dynamoDbClient, notificationType) => {
    console.log(`Sending standard email notification reminder for ${notificationType}`);
    switch (createNotificationInput.channelType) {
        case moonbeam_models_1.NotificationChannelType.Email:
            // validate that we have the necessary information to send an email
            if (createNotificationInput.emailDestination && createNotificationInput.emailDestination.length !== 0 &&
                createNotificationInput.userFullName && createNotificationInput.userFullName.length !== 0) {
                // attempt to send an email notification first through Courier
                const sendEmailNotificationResponse = await courierClient.sendEmailNotification({
                    emailDestination: createNotificationInput.emailDestination,
                    userFullName: createNotificationInput.userFullName
                }, notificationType);
                // check to see if the email notification was successfully sent or not
                if (!sendEmailNotificationResponse || sendEmailNotificationResponse.errorMessage ||
                    sendEmailNotificationResponse.errorType || !sendEmailNotificationResponse.requestId) {
                    const errorMessage = `Email notification sending through the POST Courier send email message call failed ${JSON.stringify(sendEmailNotificationResponse)}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: moonbeam_models_1.NotificationsErrorType.UnexpectedError
                    };
                }
                else {
                    // set the notification id, from the Courier call response
                    createNotificationInput.notificationId = sendEmailNotificationResponse.requestId;
                    // store the successfully sent notification object
                    await dynamoDbClient.send(new client_dynamodb_1.PutItemCommand({
                        TableName: process.env.NOTIFICATIONS_TABLE,
                        Item: {
                            id: {
                                S: createNotificationInput.id
                            },
                            timestamp: {
                                N: createNotificationInput.timestamp.toString()
                            },
                            notificationId: {
                                S: createNotificationInput.notificationId
                            },
                            emailDestination: {
                                S: createNotificationInput.emailDestination
                            },
                            userFullName: {
                                S: createNotificationInput.userFullName
                            },
                            status: {
                                S: createNotificationInput.status
                            },
                            channelType: {
                                S: createNotificationInput.channelType
                            },
                            type: {
                                S: createNotificationInput.type
                            },
                            createdAt: {
                                S: createNotificationInput.createdAt
                            },
                            updatedAt: {
                                S: createNotificationInput.updatedAt
                            },
                            ...(createNotificationInput.actionUrl && {
                                actionUrl: {
                                    S: createNotificationInput.actionUrl
                                }
                            })
                        },
                    }));
                    // return the successfully sent notification information
                    return {
                        id: createNotificationInput.id,
                        data: createNotificationInput
                    };
                }
            }
            else {
                const errorMessage = `Invalid information passed in, to process a notification through ${createNotificationInput.channelType}, for notification type ${createNotificationInput.type}`;
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: moonbeam_models_1.NotificationsErrorType.ValidationError
                };
            }
        default:
            const errorMessage = `Unsupported notification channel ${createNotificationInput.channelType}, for notification type ${createNotificationInput.type}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.NotificationsErrorType.ValidationError
            };
    }
};
/**
 * Function used for push notification reminders.
 *
 * @param createNotificationInput create notifications input object, used to create a notification
 * for a user card linking reminder.
 * @param courierClient Courier client used to send notifications
 * @param dynamoDbClient Dynamo DB client used to store the notification internally
 * @param notificationType type of notification passed in, used to determine the status update types that we are performing
 *
 * @returns {@link Promise} of {@link CreateNotificationResponse}
 */
const standardPushNotification = async (createNotificationInput, courierClient, dynamoDbClient, notificationType) => {
    console.log(`Sending standard push notification reminder for ${notificationType}`);
    switch (createNotificationInput.channelType) {
        case moonbeam_models_1.NotificationChannelType.Push:
            // validate that we have the necessary information to send a mobile push
            if (createNotificationInput.expoPushTokens && createNotificationInput.expoPushTokens.length !== 0) {
                // attempt to send a mobile push notification first through Courier
                const sendMobilePushNotificationResponse = await courierClient.sendMobilePushNotification({
                    expoPushTokens: createNotificationInput.expoPushTokens
                }, notificationType);
                // check to see if the mobile push notification was successfully sent or not
                if (!sendMobilePushNotificationResponse || sendMobilePushNotificationResponse.errorMessage ||
                    sendMobilePushNotificationResponse.errorType || !sendMobilePushNotificationResponse.requestId) {
                    const errorMessage = `Mobile push notification sending through the POST Courier send push notification message call failed ${JSON.stringify(sendMobilePushNotificationResponse)}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: moonbeam_models_1.NotificationsErrorType.UnexpectedError
                    };
                }
                else {
                    // set the notification id, from the Courier call response
                    createNotificationInput.notificationId = sendMobilePushNotificationResponse.requestId;
                    // create a Dynamo DB structure array, to hold the incoming expo push tokens
                    const expoPushTokens = [];
                    for (const pushToken of createNotificationInput.expoPushTokens) {
                        expoPushTokens.push({
                            M: {
                                tokenId: {
                                    S: pushToken
                                }
                            }
                        });
                    }
                    // store the successfully sent notification object
                    await dynamoDbClient.send(new client_dynamodb_1.PutItemCommand({
                        TableName: process.env.NOTIFICATIONS_TABLE,
                        Item: {
                            id: {
                                S: createNotificationInput.id
                            },
                            timestamp: {
                                N: createNotificationInput.timestamp.toString()
                            },
                            notificationId: {
                                S: createNotificationInput.notificationId
                            },
                            expoPushTokens: {
                                L: expoPushTokens
                            },
                            status: {
                                S: createNotificationInput.status
                            },
                            channelType: {
                                S: createNotificationInput.channelType
                            },
                            type: {
                                S: createNotificationInput.type
                            },
                            createdAt: {
                                S: createNotificationInput.createdAt
                            },
                            updatedAt: {
                                S: createNotificationInput.updatedAt
                            },
                            ...(createNotificationInput.actionUrl && {
                                actionUrl: {
                                    S: createNotificationInput.actionUrl
                                }
                            })
                        },
                    }));
                    // return the successfully sent notification information
                    return {
                        id: createNotificationInput.id,
                        data: createNotificationInput
                    };
                }
            }
            else {
                const errorMessage = `Invalid information passed in, to process a notification through ${createNotificationInput.channelType}, for notification type ${createNotificationInput.type}`;
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: moonbeam_models_1.NotificationsErrorType.ValidationError
                };
            }
        default:
            const errorMessage = `Unsupported notification channel ${createNotificationInput.channelType}, for notification type ${createNotificationInput.type}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.NotificationsErrorType.ValidationError
            };
    }
};
/**
 * Function used for standard email and push notification reminders.
 *
 * @param createNotificationInput create notifications input object, used to create a notification
 * for a user card linking reminder.
 * @param courierClient Courier client used to send notifications
 * @param dynamoDbClient Dynamo DB client used to store the notification internally
 * @param notificationType type of notification passed in, used to determine the status update types that we are performing
 *
 * @returns {@link Promise} of {@link CreateNotificationResponse}
 */
const standardEmailAndPushNotification = async (createNotificationInput, courierClient, dynamoDbClient, notificationType) => {
    console.log(`Sending standard email and push notification reminder for ${notificationType}`);
    switch (createNotificationInput.channelType) {
        case moonbeam_models_1.NotificationChannelType.Email:
            // validate that we have the necessary information to send an email
            if (createNotificationInput.emailDestination && createNotificationInput.emailDestination.length !== 0 &&
                createNotificationInput.userFullName && createNotificationInput.userFullName.length !== 0) {
                // attempt to send an email notification first through Courier
                const sendEmailNotificationResponse = await courierClient.sendEmailNotification({
                    emailDestination: createNotificationInput.emailDestination,
                    userFullName: createNotificationInput.userFullName
                }, notificationType);
                // check to see if the email notification was successfully sent or not
                if (!sendEmailNotificationResponse || sendEmailNotificationResponse.errorMessage ||
                    sendEmailNotificationResponse.errorType || !sendEmailNotificationResponse.requestId) {
                    const errorMessage = `Email notification sending through the POST Courier send email message call failed ${JSON.stringify(sendEmailNotificationResponse)}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: moonbeam_models_1.NotificationsErrorType.UnexpectedError
                    };
                }
                else {
                    // set the notification id, from the Courier call response
                    createNotificationInput.notificationId = sendEmailNotificationResponse.requestId;
                    // store the successfully sent notification object
                    await dynamoDbClient.send(new client_dynamodb_1.PutItemCommand({
                        TableName: process.env.NOTIFICATIONS_TABLE,
                        Item: {
                            id: {
                                S: createNotificationInput.id
                            },
                            timestamp: {
                                N: createNotificationInput.timestamp.toString()
                            },
                            notificationId: {
                                S: createNotificationInput.notificationId
                            },
                            emailDestination: {
                                S: createNotificationInput.emailDestination
                            },
                            userFullName: {
                                S: createNotificationInput.userFullName
                            },
                            status: {
                                S: createNotificationInput.status
                            },
                            channelType: {
                                S: createNotificationInput.channelType
                            },
                            type: {
                                S: createNotificationInput.type
                            },
                            createdAt: {
                                S: createNotificationInput.createdAt
                            },
                            updatedAt: {
                                S: createNotificationInput.updatedAt
                            },
                            ...(createNotificationInput.actionUrl && {
                                actionUrl: {
                                    S: createNotificationInput.actionUrl
                                }
                            })
                        },
                    }));
                    // return the successfully sent notification information
                    return {
                        id: createNotificationInput.id,
                        data: createNotificationInput
                    };
                }
            }
            else {
                const errorMessage = `Invalid information passed in, to process a notification through ${createNotificationInput.channelType}, for notification type ${createNotificationInput.type}`;
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: moonbeam_models_1.NotificationsErrorType.ValidationError
                };
            }
        case moonbeam_models_1.NotificationChannelType.Push:
            // validate that we have the necessary information to send a mobile push
            if (createNotificationInput.expoPushTokens && createNotificationInput.expoPushTokens.length !== 0) {
                // attempt to send a mobile push notification first through Courier
                const sendMobilePushNotificationResponse = await courierClient.sendMobilePushNotification({
                    expoPushTokens: createNotificationInput.expoPushTokens
                }, notificationType);
                // check to see if the mobile push notification was successfully sent or not
                if (!sendMobilePushNotificationResponse || sendMobilePushNotificationResponse.errorMessage ||
                    sendMobilePushNotificationResponse.errorType || !sendMobilePushNotificationResponse.requestId) {
                    const errorMessage = `Mobile push notification sending through the POST Courier send push notification message call failed ${JSON.stringify(sendMobilePushNotificationResponse)}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: moonbeam_models_1.NotificationsErrorType.UnexpectedError
                    };
                }
                else {
                    // set the notification id, from the Courier call response
                    createNotificationInput.notificationId = sendMobilePushNotificationResponse.requestId;
                    // create a Dynamo DB structure array, to hold the incoming expo push tokens
                    const expoPushTokens = [];
                    for (const pushToken of createNotificationInput.expoPushTokens) {
                        expoPushTokens.push({
                            M: {
                                tokenId: {
                                    S: pushToken
                                }
                            }
                        });
                    }
                    // store the successfully sent notification object
                    await dynamoDbClient.send(new client_dynamodb_1.PutItemCommand({
                        TableName: process.env.NOTIFICATIONS_TABLE,
                        Item: {
                            id: {
                                S: createNotificationInput.id
                            },
                            timestamp: {
                                N: createNotificationInput.timestamp.toString()
                            },
                            notificationId: {
                                S: createNotificationInput.notificationId
                            },
                            expoPushTokens: {
                                L: expoPushTokens
                            },
                            status: {
                                S: createNotificationInput.status
                            },
                            channelType: {
                                S: createNotificationInput.channelType
                            },
                            type: {
                                S: createNotificationInput.type
                            },
                            createdAt: {
                                S: createNotificationInput.createdAt
                            },
                            updatedAt: {
                                S: createNotificationInput.updatedAt
                            },
                            ...(createNotificationInput.actionUrl && {
                                actionUrl: {
                                    S: createNotificationInput.actionUrl
                                }
                            })
                        },
                    }));
                    // return the successfully sent notification information
                    return {
                        id: createNotificationInput.id,
                        data: createNotificationInput
                    };
                }
            }
            else {
                const errorMessage = `Invalid information passed in, to process a notification through ${createNotificationInput.channelType}, for notification type ${createNotificationInput.type}`;
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: moonbeam_models_1.NotificationsErrorType.ValidationError
                };
            }
        default:
            const errorMessage = `Unsupported notification channel ${createNotificationInput.channelType}, for notification type ${createNotificationInput.type}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.NotificationsErrorType.ValidationError
            };
    }
};
/**
 * Function used to notify users when they get their military verification status updated.
 *
 * @param createNotificationInput create notifications input object, used to create a notification
 * for a user military verification status update.
 * @param courierClient Courier client used to send notifications
 * @param dynamoDbClient Dynamo DB client used to store the notification internally
 * @param notificationType type of notification passed in, used to determine the status update types that we are performing
 *
 * @returns {@link Promise} of {@link CreateNotificationResponse}
 */
const militaryStatusUpdateNotification = async (createNotificationInput, courierClient, dynamoDbClient, notificationType) => {
    console.log('Sending military status update notifications');
    switch (createNotificationInput.channelType) {
        case moonbeam_models_1.NotificationChannelType.Email:
            // validate that we have the necessary information to send an email
            if (createNotificationInput.emailDestination && createNotificationInput.emailDestination.length !== 0 &&
                createNotificationInput.userFullName && createNotificationInput.userFullName.length !== 0) {
                // attempt to send an email notification first through Courier
                const sendEmailNotificationResponse = await courierClient.sendEmailNotification({
                    emailDestination: createNotificationInput.emailDestination,
                    userFullName: createNotificationInput.userFullName
                }, notificationType);
                // check to see if the email notification was successfully sent or not
                if (!sendEmailNotificationResponse || sendEmailNotificationResponse.errorMessage ||
                    sendEmailNotificationResponse.errorType || !sendEmailNotificationResponse.requestId) {
                    const errorMessage = `Email notification sending through the POST Courier send email message call failed ${JSON.stringify(sendEmailNotificationResponse)}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: moonbeam_models_1.NotificationsErrorType.UnexpectedError
                    };
                }
                else {
                    // set the notification id, from the Courier call response
                    createNotificationInput.notificationId = sendEmailNotificationResponse.requestId;
                    // store the successfully sent notification object
                    await dynamoDbClient.send(new client_dynamodb_1.PutItemCommand({
                        TableName: process.env.NOTIFICATIONS_TABLE,
                        Item: {
                            id: {
                                S: createNotificationInput.id
                            },
                            timestamp: {
                                N: createNotificationInput.timestamp.toString()
                            },
                            notificationId: {
                                S: createNotificationInput.notificationId
                            },
                            emailDestination: {
                                S: createNotificationInput.emailDestination
                            },
                            userFullName: {
                                S: createNotificationInput.userFullName
                            },
                            status: {
                                S: createNotificationInput.status
                            },
                            channelType: {
                                S: createNotificationInput.channelType
                            },
                            type: {
                                S: createNotificationInput.type
                            },
                            createdAt: {
                                S: createNotificationInput.createdAt
                            },
                            updatedAt: {
                                S: createNotificationInput.updatedAt
                            },
                            ...(createNotificationInput.actionUrl && {
                                actionUrl: {
                                    S: createNotificationInput.actionUrl
                                }
                            })
                        },
                    }));
                    // return the successfully sent notification information
                    return {
                        id: createNotificationInput.id,
                        data: createNotificationInput
                    };
                }
            }
            else {
                const errorMessage = `Invalid information passed in, to process a notification through ${createNotificationInput.channelType}, for notification type ${createNotificationInput.type}`;
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: moonbeam_models_1.NotificationsErrorType.ValidationError
                };
            }
        case moonbeam_models_1.NotificationChannelType.Push:
            // validate that we have the necessary information to send a mobile push
            if (createNotificationInput.expoPushTokens && createNotificationInput.expoPushTokens.length !== 0) {
                // attempt to send a mobile push notification first through Courier
                const sendMobilePushNotificationResponse = await courierClient.sendMobilePushNotification({
                    expoPushTokens: createNotificationInput.expoPushTokens
                }, notificationType);
                // check to see if the mobile push notification was successfully sent or not
                if (!sendMobilePushNotificationResponse || sendMobilePushNotificationResponse.errorMessage ||
                    sendMobilePushNotificationResponse.errorType || !sendMobilePushNotificationResponse.requestId) {
                    const errorMessage = `Mobile push notification sending through the POST Courier send push notification message call failed ${JSON.stringify(sendMobilePushNotificationResponse)}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: moonbeam_models_1.NotificationsErrorType.UnexpectedError
                    };
                }
                else {
                    // set the notification id, from the Courier call response
                    createNotificationInput.notificationId = sendMobilePushNotificationResponse.requestId;
                    // create a Dynamo DB structure array, to hold the incoming expo push tokens
                    const expoPushTokens = [];
                    for (const pushToken of createNotificationInput.expoPushTokens) {
                        expoPushTokens.push({
                            M: {
                                tokenId: {
                                    S: pushToken
                                }
                            }
                        });
                    }
                    // store the successfully sent notification object
                    await dynamoDbClient.send(new client_dynamodb_1.PutItemCommand({
                        TableName: process.env.NOTIFICATIONS_TABLE,
                        Item: {
                            id: {
                                S: createNotificationInput.id
                            },
                            timestamp: {
                                N: createNotificationInput.timestamp.toString()
                            },
                            notificationId: {
                                S: createNotificationInput.notificationId
                            },
                            expoPushTokens: {
                                L: expoPushTokens
                            },
                            status: {
                                S: createNotificationInput.status
                            },
                            channelType: {
                                S: createNotificationInput.channelType
                            },
                            type: {
                                S: createNotificationInput.type
                            },
                            createdAt: {
                                S: createNotificationInput.createdAt
                            },
                            updatedAt: {
                                S: createNotificationInput.updatedAt
                            },
                            ...(createNotificationInput.actionUrl && {
                                actionUrl: {
                                    S: createNotificationInput.actionUrl
                                }
                            })
                        },
                    }));
                    // return the successfully sent notification information
                    return {
                        id: createNotificationInput.id,
                        data: createNotificationInput
                    };
                }
            }
            else {
                const errorMessage = `Invalid information passed in, to process a notification through ${createNotificationInput.channelType}, for notification type ${createNotificationInput.type}`;
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: moonbeam_models_1.NotificationsErrorType.ValidationError
                };
            }
        default:
            const errorMessage = `Unsupported notification channel ${createNotificationInput.channelType}, for notification type ${createNotificationInput.type}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.NotificationsErrorType.ValidationError
            };
    }
};
/**
 * Function used to notify users when they successfully qualify for an offer.
 *
 * @param createNotificationInput create notifications input object, used to create a notification
 * for a new user qualifying offer.
 * @param courierClient Courier client used to send notifications
 * @param dynamoDbClient Dynamo DB client used to store the notification internally
 *
 * @returns {@link Promise} of {@link CreateNotificationResponse}
 */
const newUserQualifyingOfferNotification = async (createNotificationInput, courierClient, dynamoDbClient) => {
    console.log('Sending new user qualifying offer notifications');
    switch (createNotificationInput.channelType) {
        case moonbeam_models_1.NotificationChannelType.Push:
            // validate that we have the necessary information to send a mobile push
            if (createNotificationInput.expoPushTokens && createNotificationInput.expoPushTokens.length !== 0 &&
                createNotificationInput.pendingCashback && createNotificationInput.merchantName && createNotificationInput.merchantName.length !== 0) {
                // attempt to send a mobile push notification first through Courier
                const sendMobilePushNotificationResponse = await courierClient.sendMobilePushNotification({
                    expoPushTokens: createNotificationInput.expoPushTokens,
                    merchantName: createNotificationInput.merchantName,
                    pendingCashback: Number(createNotificationInput.pendingCashback.toFixed(2))
                }, moonbeam_models_1.NotificationType.NewQualifyingOfferAvailable);
                // check to see if the mobile push notification was successfully sent or not
                if (!sendMobilePushNotificationResponse || sendMobilePushNotificationResponse.errorMessage ||
                    sendMobilePushNotificationResponse.errorType || !sendMobilePushNotificationResponse.requestId) {
                    const errorMessage = `Mobile push notification sending through the POST Courier send push notification message call failed ${JSON.stringify(sendMobilePushNotificationResponse)}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: moonbeam_models_1.NotificationsErrorType.UnexpectedError
                    };
                }
                else {
                    // set the notification id, from the Courier call response
                    createNotificationInput.notificationId = sendMobilePushNotificationResponse.requestId;
                    // create a Dynamo DB structure array, to hold the incoming expo push tokens
                    const expoPushTokens = [];
                    for (const pushToken of createNotificationInput.expoPushTokens) {
                        expoPushTokens.push({
                            M: {
                                tokenId: {
                                    S: pushToken
                                }
                            }
                        });
                    }
                    // store the successfully sent notification object
                    await dynamoDbClient.send(new client_dynamodb_1.PutItemCommand({
                        TableName: process.env.NOTIFICATIONS_TABLE,
                        Item: {
                            id: {
                                S: createNotificationInput.id
                            },
                            timestamp: {
                                N: createNotificationInput.timestamp.toString()
                            },
                            notificationId: {
                                S: createNotificationInput.notificationId
                            },
                            expoPushTokens: {
                                L: expoPushTokens
                            },
                            status: {
                                S: createNotificationInput.status
                            },
                            channelType: {
                                S: createNotificationInput.channelType
                            },
                            type: {
                                S: createNotificationInput.type
                            },
                            createdAt: {
                                S: createNotificationInput.createdAt
                            },
                            updatedAt: {
                                S: createNotificationInput.updatedAt
                            },
                            ...(createNotificationInput.actionUrl && {
                                actionUrl: {
                                    S: createNotificationInput.actionUrl
                                }
                            })
                        },
                    }));
                    // return the successfully sent notification information
                    return {
                        id: createNotificationInput.id,
                        data: createNotificationInput
                    };
                }
            }
            else {
                const errorMessage = `Invalid information passed in, to process a notification through ${createNotificationInput.channelType}, for notification type ${createNotificationInput.type}`;
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: moonbeam_models_1.NotificationsErrorType.ValidationError
                };
            }
        default:
            const errorMessage = `Unsupported notification channel ${createNotificationInput.channelType}, for notification type ${createNotificationInput.type}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.NotificationsErrorType.ValidationError
            };
    }
};
/**
 * Function used to notify users when they successfully complete a signup process.
 *
 * @param createNotificationInput create notifications input object, used to create a notification
 * for a new user signup/registration event.
 * @param courierClient Courier client used to send notifications
 * @param dynamoDbClient Dynamo DB client used to store the notification internally
 *
 * @returns {@link Promise} of {@link CreateNotificationResponse}
 */
const newUserSignUpNotification = async (createNotificationInput, courierClient, dynamoDbClient) => {
    console.log('Sending new user signup notifications');
    switch (createNotificationInput.channelType) {
        case moonbeam_models_1.NotificationChannelType.Email:
            // validate that we have the necessary information to send an email
            if (createNotificationInput.emailDestination && createNotificationInput.emailDestination.length !== 0 &&
                createNotificationInput.userFullName && createNotificationInput.userFullName.length !== 0) {
                // attempt to send an email notification first through Courier
                const sendEmailNotificationResponse = await courierClient.sendEmailNotification({
                    emailDestination: createNotificationInput.emailDestination,
                    userFullName: createNotificationInput.userFullName
                }, moonbeam_models_1.NotificationType.NewUserSignup);
                // check to see if the email notification was successfully sent or not
                if (!sendEmailNotificationResponse || sendEmailNotificationResponse.errorMessage ||
                    sendEmailNotificationResponse.errorType || !sendEmailNotificationResponse.requestId) {
                    const errorMessage = `Email notification sending through the POST Courier send email message call failed ${JSON.stringify(sendEmailNotificationResponse)}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: moonbeam_models_1.NotificationsErrorType.UnexpectedError
                    };
                }
                else {
                    // set the notification id, from the Courier call response
                    createNotificationInput.notificationId = sendEmailNotificationResponse.requestId;
                    // store the successfully sent notification object
                    await dynamoDbClient.send(new client_dynamodb_1.PutItemCommand({
                        TableName: process.env.NOTIFICATIONS_TABLE,
                        Item: {
                            id: {
                                S: createNotificationInput.id
                            },
                            timestamp: {
                                N: createNotificationInput.timestamp.toString()
                            },
                            notificationId: {
                                S: createNotificationInput.notificationId
                            },
                            emailDestination: {
                                S: createNotificationInput.emailDestination
                            },
                            userFullName: {
                                S: createNotificationInput.userFullName
                            },
                            status: {
                                S: createNotificationInput.status
                            },
                            channelType: {
                                S: createNotificationInput.channelType
                            },
                            type: {
                                S: createNotificationInput.type
                            },
                            createdAt: {
                                S: createNotificationInput.createdAt
                            },
                            updatedAt: {
                                S: createNotificationInput.updatedAt
                            },
                            ...(createNotificationInput.actionUrl && {
                                actionUrl: {
                                    S: createNotificationInput.actionUrl
                                }
                            })
                        },
                    }));
                    // return the successfully sent notification information
                    return {
                        id: createNotificationInput.id,
                        data: createNotificationInput
                    };
                }
            }
            else {
                const errorMessage = `Invalid information passed in, to process a notification through ${createNotificationInput.channelType}, for notification type ${createNotificationInput.type}`;
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: moonbeam_models_1.NotificationsErrorType.ValidationError
                };
            }
        default:
            const errorMessage = `Unsupported notification channel ${createNotificationInput.channelType}, for notification type ${createNotificationInput.type}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.NotificationsErrorType.ValidationError
            };
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXRlTm90aWZpY2F0aW9uUmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL3Jlc29sdmVycy9DcmVhdGVOb3RpZmljYXRpb25SZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw4REFBd0c7QUFDeEcsK0RBU21DO0FBRW5DOzs7Ozs7O0dBT0c7QUFDSSxNQUFNLGtCQUFrQixHQUFHLEtBQUssRUFBRSxTQUFpQixFQUFFLHVCQUFnRCxFQUF1QyxFQUFFO0lBQ2pKLElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsNENBQTRDO1FBQzVDLE1BQU0sY0FBYyxHQUFHLElBQUksZ0NBQWMsQ0FBQyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBRTVELG9DQUFvQztRQUNwQyxNQUFNLFNBQVMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzNDLHVCQUF1QixDQUFDLFNBQVMsR0FBRyx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLHVCQUF1QixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNsSSx1QkFBdUIsQ0FBQyxTQUFTLEdBQUcsdUJBQXVCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUN0SCx1QkFBdUIsQ0FBQyxTQUFTLEdBQUcsdUJBQXVCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUV0SDs7O1dBR0c7UUFDSCxNQUFNLHVCQUF1QixHQUFHLE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLGdDQUFjLENBQUM7WUFDekUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW9CO1lBQzNDLEdBQUcsRUFBRTtnQkFDRCxFQUFFLEVBQUU7b0JBQ0EsQ0FBQyxFQUFFLHVCQUF1QixDQUFDLEVBQUU7aUJBQ2hDO2dCQUNELFNBQVMsRUFBRTtvQkFDUCxDQUFDLEVBQUUsdUJBQXVCLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRTtpQkFDbEQ7YUFDSjtZQUNEOzs7OztlQUtHO1lBQ0gsb0JBQW9CLEVBQUUsVUFBVTtZQUNoQyx3QkFBd0IsRUFBRTtnQkFDdEIsTUFBTSxFQUFFLElBQUk7Z0JBQ1osSUFBSSxFQUFFLFdBQVc7YUFDcEI7U0FDSixDQUFDLENBQUMsQ0FBQztRQUVKLHlEQUF5RDtRQUN6RCxJQUFJLHVCQUF1QixJQUFJLHVCQUF1QixDQUFDLElBQUksRUFBRTtZQUN6RDs7O2VBR0c7WUFDSCxNQUFNLFlBQVksR0FBRywrQkFBK0IsQ0FBQztZQUNyRCxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRTFCLE9BQU87Z0JBQ0gsWUFBWSxFQUFFLFlBQVk7Z0JBQzFCLFNBQVMsRUFBRSx3Q0FBc0IsQ0FBQyxvQkFBb0I7YUFDekQsQ0FBQTtTQUNKO2FBQU07WUFDSDs7Ozs7ZUFLRztZQUNILE1BQU0sYUFBYSxHQUFHLElBQUksK0JBQWEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUN2RSxpQ0FBaUM7WUFDakMsUUFBUSx1QkFBdUIsQ0FBQyxJQUFJLEVBQUU7Z0JBQ2xDLEtBQUssa0NBQWdCLENBQUMsYUFBYTtvQkFDL0IsT0FBTyx5QkFBeUIsQ0FBQyx1QkFBdUIsRUFBRSxhQUFhLEVBQUUsY0FBYyxDQUFDLENBQUM7Z0JBQzdGLEtBQUssa0NBQWdCLENBQUMsMkJBQTJCO29CQUM3QyxPQUFPLGtDQUFrQyxDQUFDLHVCQUF1QixFQUFFLGFBQWEsRUFBRSxjQUFjLENBQUMsQ0FBQztnQkFDdEcsS0FBSyxrQ0FBZ0IsQ0FBQyxzQ0FBc0M7b0JBQ3hELE9BQU8sZ0NBQWdDLENBQUMsdUJBQXVCLEVBQUUsYUFBYSxFQUMxRSxjQUFjLEVBQUUsa0NBQWdCLENBQUMsc0NBQXNDLENBQUMsQ0FBQztnQkFDakYsS0FBSyxrQ0FBZ0IsQ0FBQyxzQ0FBc0M7b0JBQ3hELE9BQU8sZ0NBQWdDLENBQUMsdUJBQXVCLEVBQUUsYUFBYSxFQUFFLGNBQWMsRUFDMUYsa0NBQWdCLENBQUMsc0NBQXNDLENBQUMsQ0FBQztnQkFDakUsS0FBSyxrQ0FBZ0IsQ0FBQyxtQkFBbUI7b0JBQ3JDLE9BQU8sZ0NBQWdDLENBQUMsdUJBQXVCLEVBQUUsYUFBYSxFQUFFLGNBQWMsRUFDMUYsa0NBQWdCLENBQUMsbUJBQW1CLENBQUMsQ0FBQztnQkFDOUMsS0FBSyxrQ0FBZ0IsQ0FBQyxxQkFBcUI7b0JBQ3ZDLE9BQU8sZ0NBQWdDLENBQUMsdUJBQXVCLEVBQUUsYUFBYSxFQUFFLGNBQWMsRUFDMUYsa0NBQWdCLENBQUMscUJBQXFCLENBQUMsQ0FBQztnQkFDaEQsS0FBSyxrQ0FBZ0IsQ0FBQyw2QkFBNkI7b0JBQy9DLE9BQU8sd0JBQXdCLENBQUMsdUJBQXVCLEVBQUUsYUFBYSxFQUFFLGNBQWMsRUFDbEYsa0NBQWdCLENBQUMsNkJBQTZCLENBQUMsQ0FBQztnQkFDeEQsS0FBSyxrQ0FBZ0IsQ0FBQyw2QkFBNkI7b0JBQy9DLE9BQU8sd0JBQXdCLENBQUMsdUJBQXVCLEVBQUUsYUFBYSxFQUFFLGNBQWMsRUFDbEYsa0NBQWdCLENBQUMsNkJBQTZCLENBQUMsQ0FBQztnQkFDeEQsS0FBSyxrQ0FBZ0IsQ0FBQyw2QkFBNkI7b0JBQy9DLE9BQU8sZ0NBQWdDLENBQUMsdUJBQXVCLEVBQUUsYUFBYSxFQUFFLGNBQWMsRUFDMUYsa0NBQWdCLENBQUMsNkJBQTZCLENBQUMsQ0FBQztnQkFDeEQsS0FBSyxrQ0FBZ0IsQ0FBQyxzQkFBc0I7b0JBQ3hDLE9BQU8sZ0NBQWdDLENBQUMsdUJBQXVCLEVBQUUsYUFBYSxFQUFFLGNBQWMsRUFDMUYsa0NBQWdCLENBQUMsc0JBQXNCLENBQUMsQ0FBQztnQkFDakQsS0FBSyxrQ0FBZ0IsQ0FBQywwQkFBMEI7b0JBQzVDLE9BQU8sZ0NBQWdDLENBQUMsdUJBQXVCLEVBQUUsYUFBYSxFQUFFLGNBQWMsRUFDMUYsa0NBQWdCLENBQUMsMEJBQTBCLENBQUMsQ0FBQztnQkFDckQsS0FBSyxrQ0FBZ0IsQ0FBQywyQkFBMkI7b0JBQzdDLE9BQU8sZ0NBQWdDLENBQUMsdUJBQXVCLEVBQUUsYUFBYSxFQUFFLGNBQWMsRUFDMUYsa0NBQWdCLENBQUMsMkJBQTJCLENBQUMsQ0FBQztnQkFDdEQsS0FBSyxrQ0FBZ0IsQ0FBQyxxQkFBcUI7b0JBQ3ZDLE9BQU8seUJBQXlCLENBQUMsdUJBQXVCLEVBQUUsYUFBYSxFQUFFLGNBQWMsRUFDbkYsa0NBQWdCLENBQUMscUJBQXFCLENBQUMsQ0FBQztnQkFDaEQsS0FBSyxrQ0FBZ0IsQ0FBQywwQkFBMEI7b0JBQzVDLE9BQU8seUJBQXlCLENBQUMsdUJBQXVCLEVBQUUsYUFBYSxFQUFFLGNBQWMsRUFDbkYsa0NBQWdCLENBQUMsMEJBQTBCLENBQUMsQ0FBQztnQkFDckQ7b0JBQ0ksTUFBTSxZQUFZLEdBQUcsZ0NBQWdDLHVCQUF1QixDQUFDLElBQUksRUFBRSxDQUFDO29CQUNwRixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO29CQUMxQixPQUFPO3dCQUNILFlBQVksRUFBRSxZQUFZO3dCQUMxQixTQUFTLEVBQUUsd0NBQXNCLENBQUMsZUFBZTtxQkFDcEQsQ0FBQTthQUNSO1NBQ0o7S0FDSjtJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1YsTUFBTSxZQUFZLEdBQUcsb0NBQW9DLFNBQVMsYUFBYSxHQUFHLEVBQUUsQ0FBQztRQUNyRixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzFCLE9BQU87WUFDSCxZQUFZLEVBQUUsWUFBWTtZQUMxQixTQUFTLEVBQUUsd0NBQXNCLENBQUMsZUFBZTtTQUNwRCxDQUFBO0tBQ0o7QUFDTCxDQUFDLENBQUE7QUF6SFksUUFBQSxrQkFBa0Isc0JBeUg5QjtBQUVEOzs7Ozs7Ozs7O0dBVUc7QUFDSCxNQUFNLHlCQUF5QixHQUFHLEtBQUssRUFBRSx1QkFBZ0QsRUFBRSxhQUE0QixFQUN2RSxjQUE4QixFQUFFLGdCQUFrQyxFQUF1QyxFQUFFO0lBQ3ZKLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0RBQW9ELGdCQUFnQixFQUFFLENBQUMsQ0FBQztJQUNwRixRQUFRLHVCQUF1QixDQUFDLFdBQVcsRUFBRTtRQUN6QyxLQUFLLHlDQUF1QixDQUFDLEtBQUs7WUFDOUIsbUVBQW1FO1lBQ25FLElBQUksdUJBQXVCLENBQUMsZ0JBQWdCLElBQUksdUJBQXVCLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxLQUFLLENBQUM7Z0JBQ2pHLHVCQUF1QixDQUFDLFlBQVksSUFBSSx1QkFBdUIsQ0FBQyxZQUFZLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDM0YsOERBQThEO2dCQUM5RCxNQUFNLDZCQUE2QixHQUF5QixNQUFNLGFBQWEsQ0FBQyxxQkFBcUIsQ0FBQztvQkFDbEcsZ0JBQWdCLEVBQUUsdUJBQXVCLENBQUMsZ0JBQWlCO29CQUMzRCxZQUFZLEVBQUUsdUJBQXVCLENBQUMsWUFBYTtpQkFDdEQsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUVyQixzRUFBc0U7Z0JBQ3RFLElBQUksQ0FBQyw2QkFBNkIsSUFBSSw2QkFBNkIsQ0FBQyxZQUFZO29CQUM1RSw2QkFBNkIsQ0FBQyxTQUFTLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxTQUFTLEVBQUU7b0JBQ3JGLE1BQU0sWUFBWSxHQUFHLHNGQUFzRixJQUFJLENBQUMsU0FBUyxDQUFDLDZCQUE2QixDQUFDLEVBQUUsQ0FBQTtvQkFDMUosT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztvQkFDMUIsT0FBTzt3QkFDSCxZQUFZLEVBQUUsWUFBWTt3QkFDMUIsU0FBUyxFQUFFLHdDQUFzQixDQUFDLGVBQWU7cUJBQ3BELENBQUE7aUJBQ0o7cUJBQU07b0JBQ0gsMERBQTBEO29CQUMxRCx1QkFBdUIsQ0FBQyxjQUFjLEdBQUcsNkJBQTZCLENBQUMsU0FBVSxDQUFDO29CQUVsRixrREFBa0Q7b0JBQ2xELE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLGdDQUFjLENBQUM7d0JBQ3pDLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFvQjt3QkFDM0MsSUFBSSxFQUFFOzRCQUNGLEVBQUUsRUFBRTtnQ0FDQSxDQUFDLEVBQUUsdUJBQXVCLENBQUMsRUFBRTs2QkFDaEM7NEJBQ0QsU0FBUyxFQUFFO2dDQUNQLENBQUMsRUFBRSx1QkFBdUIsQ0FBQyxTQUFVLENBQUMsUUFBUSxFQUFFOzZCQUNuRDs0QkFDRCxjQUFjLEVBQUU7Z0NBQ1osQ0FBQyxFQUFFLHVCQUF1QixDQUFDLGNBQWU7NkJBQzdDOzRCQUNELGdCQUFnQixFQUFFO2dDQUNkLENBQUMsRUFBRSx1QkFBdUIsQ0FBQyxnQkFBaUI7NkJBQy9DOzRCQUNELFlBQVksRUFBRTtnQ0FDVixDQUFDLEVBQUUsdUJBQXVCLENBQUMsWUFBYTs2QkFDM0M7NEJBQ0QsTUFBTSxFQUFFO2dDQUNKLENBQUMsRUFBRSx1QkFBdUIsQ0FBQyxNQUFNOzZCQUNwQzs0QkFDRCxXQUFXLEVBQUU7Z0NBQ1QsQ0FBQyxFQUFFLHVCQUF1QixDQUFDLFdBQVc7NkJBQ3pDOzRCQUNELElBQUksRUFBRTtnQ0FDRixDQUFDLEVBQUUsdUJBQXVCLENBQUMsSUFBSTs2QkFDbEM7NEJBQ0QsU0FBUyxFQUFFO2dDQUNQLENBQUMsRUFBRSx1QkFBdUIsQ0FBQyxTQUFVOzZCQUN4Qzs0QkFDRCxTQUFTLEVBQUU7Z0NBQ1AsQ0FBQyxFQUFFLHVCQUF1QixDQUFDLFNBQVU7NkJBQ3hDOzRCQUNELEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLElBQUk7Z0NBQ3JDLFNBQVMsRUFBRTtvQ0FDUCxDQUFDLEVBQUUsdUJBQXVCLENBQUMsU0FBUztpQ0FDdkM7NkJBQ0osQ0FBQzt5QkFDTDtxQkFDSixDQUFDLENBQUMsQ0FBQztvQkFFSix3REFBd0Q7b0JBQ3hELE9BQU87d0JBQ0gsRUFBRSxFQUFFLHVCQUF1QixDQUFDLEVBQUU7d0JBQzlCLElBQUksRUFBRSx1QkFBdUM7cUJBQ2hELENBQUE7aUJBQ0o7YUFDSjtpQkFBTTtnQkFDSCxNQUFNLFlBQVksR0FBRyxvRUFBb0UsdUJBQXVCLENBQUMsV0FBVywyQkFBMkIsdUJBQXVCLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ3RMLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQzFCLE9BQU87b0JBQ0gsWUFBWSxFQUFFLFlBQVk7b0JBQzFCLFNBQVMsRUFBRSx3Q0FBc0IsQ0FBQyxlQUFlO2lCQUNwRCxDQUFBO2FBQ0o7UUFDTDtZQUNJLE1BQU0sWUFBWSxHQUFHLG9DQUFvQyx1QkFBdUIsQ0FBQyxXQUFXLDJCQUEyQix1QkFBdUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUN0SixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQzFCLE9BQU87Z0JBQ0gsWUFBWSxFQUFFLFlBQVk7Z0JBQzFCLFNBQVMsRUFBRSx3Q0FBc0IsQ0FBQyxlQUFlO2FBQ3BELENBQUE7S0FDUjtBQUNMLENBQUMsQ0FBQTtBQUlEOzs7Ozs7Ozs7O0dBVUc7QUFDSCxNQUFNLHdCQUF3QixHQUFHLEtBQUssRUFBRSx1QkFBZ0QsRUFBRSxhQUE0QixFQUN0RSxjQUE4QixFQUFFLGdCQUFrQyxFQUF1QyxFQUFFO0lBQ3ZKLE9BQU8sQ0FBQyxHQUFHLENBQUMsbURBQW1ELGdCQUFnQixFQUFFLENBQUMsQ0FBQztJQUNuRixRQUFRLHVCQUF1QixDQUFDLFdBQVcsRUFBRTtRQUN6QyxLQUFLLHlDQUF1QixDQUFDLElBQUk7WUFDN0Isd0VBQXdFO1lBQ3hFLElBQUksdUJBQXVCLENBQUMsY0FBYyxJQUFJLHVCQUF1QixDQUFDLGNBQWMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUMvRixtRUFBbUU7Z0JBQ25FLE1BQU0sa0NBQWtDLEdBQXlCLE1BQU0sYUFBYSxDQUFDLDBCQUEwQixDQUFDO29CQUM1RyxjQUFjLEVBQUUsdUJBQXVCLENBQUMsY0FBZTtpQkFDMUQsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUVyQiw0RUFBNEU7Z0JBQzVFLElBQUksQ0FBQyxrQ0FBa0MsSUFBSSxrQ0FBa0MsQ0FBQyxZQUFZO29CQUN0RixrQ0FBa0MsQ0FBQyxTQUFTLElBQUksQ0FBQyxrQ0FBa0MsQ0FBQyxTQUFTLEVBQUU7b0JBQy9GLE1BQU0sWUFBWSxHQUFHLHdHQUF3RyxJQUFJLENBQUMsU0FBUyxDQUFDLGtDQUFrQyxDQUFDLEVBQUUsQ0FBQTtvQkFDakwsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztvQkFDMUIsT0FBTzt3QkFDSCxZQUFZLEVBQUUsWUFBWTt3QkFDMUIsU0FBUyxFQUFFLHdDQUFzQixDQUFDLGVBQWU7cUJBQ3BELENBQUE7aUJBQ0o7cUJBQU07b0JBQ0gsMERBQTBEO29CQUMxRCx1QkFBdUIsQ0FBQyxjQUFjLEdBQUcsa0NBQWtDLENBQUMsU0FBVSxDQUFDO29CQUV2Riw0RUFBNEU7b0JBQzVFLE1BQU0sY0FBYyxHQUFxQixFQUFFLENBQUM7b0JBQzVDLEtBQUssTUFBTSxTQUFTLElBQUksdUJBQXVCLENBQUMsY0FBYyxFQUFFO3dCQUM1RCxjQUFjLENBQUMsSUFBSSxDQUFDOzRCQUNoQixDQUFDLEVBQUU7Z0NBQ0MsT0FBTyxFQUFFO29DQUNMLENBQUMsRUFBRSxTQUFVO2lDQUNoQjs2QkFDSjt5QkFDSixDQUFDLENBQUE7cUJBQ0w7b0JBQ0Qsa0RBQWtEO29CQUNsRCxNQUFNLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxnQ0FBYyxDQUFDO3dCQUN6QyxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBb0I7d0JBQzNDLElBQUksRUFBRTs0QkFDRixFQUFFLEVBQUU7Z0NBQ0EsQ0FBQyxFQUFFLHVCQUF1QixDQUFDLEVBQUU7NkJBQ2hDOzRCQUNELFNBQVMsRUFBRTtnQ0FDUCxDQUFDLEVBQUUsdUJBQXVCLENBQUMsU0FBVSxDQUFDLFFBQVEsRUFBRTs2QkFDbkQ7NEJBQ0QsY0FBYyxFQUFFO2dDQUNaLENBQUMsRUFBRSx1QkFBdUIsQ0FBQyxjQUFlOzZCQUM3Qzs0QkFDRCxjQUFjLEVBQUU7Z0NBQ1osQ0FBQyxFQUFFLGNBQWM7NkJBQ3BCOzRCQUNELE1BQU0sRUFBRTtnQ0FDSixDQUFDLEVBQUUsdUJBQXVCLENBQUMsTUFBTTs2QkFDcEM7NEJBQ0QsV0FBVyxFQUFFO2dDQUNULENBQUMsRUFBRSx1QkFBdUIsQ0FBQyxXQUFXOzZCQUN6Qzs0QkFDRCxJQUFJLEVBQUU7Z0NBQ0YsQ0FBQyxFQUFFLHVCQUF1QixDQUFDLElBQUk7NkJBQ2xDOzRCQUNELFNBQVMsRUFBRTtnQ0FDUCxDQUFDLEVBQUUsdUJBQXVCLENBQUMsU0FBVTs2QkFDeEM7NEJBQ0QsU0FBUyxFQUFFO2dDQUNQLENBQUMsRUFBRSx1QkFBdUIsQ0FBQyxTQUFVOzZCQUN4Qzs0QkFDRCxHQUFHLENBQUMsdUJBQXVCLENBQUMsU0FBUyxJQUFJO2dDQUNyQyxTQUFTLEVBQUU7b0NBQ1AsQ0FBQyxFQUFFLHVCQUF1QixDQUFDLFNBQVM7aUNBQ3ZDOzZCQUNKLENBQUM7eUJBQ0w7cUJBQ0osQ0FBQyxDQUFDLENBQUM7b0JBRUosd0RBQXdEO29CQUN4RCxPQUFPO3dCQUNILEVBQUUsRUFBRSx1QkFBdUIsQ0FBQyxFQUFFO3dCQUM5QixJQUFJLEVBQUUsdUJBQXVDO3FCQUNoRCxDQUFBO2lCQUNKO2FBQ0o7aUJBQU07Z0JBQ0gsTUFBTSxZQUFZLEdBQUcsb0VBQW9FLHVCQUF1QixDQUFDLFdBQVcsMkJBQTJCLHVCQUF1QixDQUFDLElBQUksRUFBRSxDQUFDO2dCQUN0TCxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUMxQixPQUFPO29CQUNILFlBQVksRUFBRSxZQUFZO29CQUMxQixTQUFTLEVBQUUsd0NBQXNCLENBQUMsZUFBZTtpQkFDcEQsQ0FBQTthQUNKO1FBQ0w7WUFDSSxNQUFNLFlBQVksR0FBRyxvQ0FBb0MsdUJBQXVCLENBQUMsV0FBVywyQkFBMkIsdUJBQXVCLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDdEosT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUMxQixPQUFPO2dCQUNILFlBQVksRUFBRSxZQUFZO2dCQUMxQixTQUFTLEVBQUUsd0NBQXNCLENBQUMsZUFBZTthQUNwRCxDQUFBO0tBQ1I7QUFDTCxDQUFDLENBQUE7QUFFRDs7Ozs7Ozs7OztHQVVHO0FBQ0gsTUFBTSxnQ0FBZ0MsR0FBRyxLQUFLLEVBQUUsdUJBQWdELEVBQUUsYUFBNEIsRUFDOUUsY0FBOEIsRUFBRSxnQkFBa0MsRUFBdUMsRUFBRTtJQUN2SixPQUFPLENBQUMsR0FBRyxDQUFDLDZEQUE2RCxnQkFBZ0IsRUFBRSxDQUFDLENBQUM7SUFDN0YsUUFBUSx1QkFBdUIsQ0FBQyxXQUFXLEVBQUU7UUFDekMsS0FBSyx5Q0FBdUIsQ0FBQyxLQUFLO1lBQzlCLG1FQUFtRTtZQUNuRSxJQUFJLHVCQUF1QixDQUFDLGdCQUFnQixJQUFJLHVCQUF1QixDQUFDLGdCQUFnQixDQUFDLE1BQU0sS0FBSyxDQUFDO2dCQUNqRyx1QkFBdUIsQ0FBQyxZQUFZLElBQUksdUJBQXVCLENBQUMsWUFBWSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQzNGLDhEQUE4RDtnQkFDOUQsTUFBTSw2QkFBNkIsR0FBeUIsTUFBTSxhQUFhLENBQUMscUJBQXFCLENBQUM7b0JBQ2xHLGdCQUFnQixFQUFFLHVCQUF1QixDQUFDLGdCQUFpQjtvQkFDM0QsWUFBWSxFQUFFLHVCQUF1QixDQUFDLFlBQWE7aUJBQ3RELEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztnQkFFckIsc0VBQXNFO2dCQUN0RSxJQUFJLENBQUMsNkJBQTZCLElBQUksNkJBQTZCLENBQUMsWUFBWTtvQkFDNUUsNkJBQTZCLENBQUMsU0FBUyxJQUFJLENBQUMsNkJBQTZCLENBQUMsU0FBUyxFQUFFO29CQUNyRixNQUFNLFlBQVksR0FBRyxzRkFBc0YsSUFBSSxDQUFDLFNBQVMsQ0FBQyw2QkFBNkIsQ0FBQyxFQUFFLENBQUE7b0JBQzFKLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7b0JBQzFCLE9BQU87d0JBQ0gsWUFBWSxFQUFFLFlBQVk7d0JBQzFCLFNBQVMsRUFBRSx3Q0FBc0IsQ0FBQyxlQUFlO3FCQUNwRCxDQUFBO2lCQUNKO3FCQUFNO29CQUNILDBEQUEwRDtvQkFDMUQsdUJBQXVCLENBQUMsY0FBYyxHQUFHLDZCQUE2QixDQUFDLFNBQVUsQ0FBQztvQkFFbEYsa0RBQWtEO29CQUNsRCxNQUFNLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxnQ0FBYyxDQUFDO3dCQUN6QyxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBb0I7d0JBQzNDLElBQUksRUFBRTs0QkFDRixFQUFFLEVBQUU7Z0NBQ0EsQ0FBQyxFQUFFLHVCQUF1QixDQUFDLEVBQUU7NkJBQ2hDOzRCQUNELFNBQVMsRUFBRTtnQ0FDUCxDQUFDLEVBQUUsdUJBQXVCLENBQUMsU0FBVSxDQUFDLFFBQVEsRUFBRTs2QkFDbkQ7NEJBQ0QsY0FBYyxFQUFFO2dDQUNaLENBQUMsRUFBRSx1QkFBdUIsQ0FBQyxjQUFlOzZCQUM3Qzs0QkFDRCxnQkFBZ0IsRUFBRTtnQ0FDZCxDQUFDLEVBQUUsdUJBQXVCLENBQUMsZ0JBQWlCOzZCQUMvQzs0QkFDRCxZQUFZLEVBQUU7Z0NBQ1YsQ0FBQyxFQUFFLHVCQUF1QixDQUFDLFlBQWE7NkJBQzNDOzRCQUNELE1BQU0sRUFBRTtnQ0FDSixDQUFDLEVBQUUsdUJBQXVCLENBQUMsTUFBTTs2QkFDcEM7NEJBQ0QsV0FBVyxFQUFFO2dDQUNULENBQUMsRUFBRSx1QkFBdUIsQ0FBQyxXQUFXOzZCQUN6Qzs0QkFDRCxJQUFJLEVBQUU7Z0NBQ0YsQ0FBQyxFQUFFLHVCQUF1QixDQUFDLElBQUk7NkJBQ2xDOzRCQUNELFNBQVMsRUFBRTtnQ0FDUCxDQUFDLEVBQUUsdUJBQXVCLENBQUMsU0FBVTs2QkFDeEM7NEJBQ0QsU0FBUyxFQUFFO2dDQUNQLENBQUMsRUFBRSx1QkFBdUIsQ0FBQyxTQUFVOzZCQUN4Qzs0QkFDRCxHQUFHLENBQUMsdUJBQXVCLENBQUMsU0FBUyxJQUFJO2dDQUNyQyxTQUFTLEVBQUU7b0NBQ1AsQ0FBQyxFQUFFLHVCQUF1QixDQUFDLFNBQVM7aUNBQ3ZDOzZCQUNKLENBQUM7eUJBQ0w7cUJBQ0osQ0FBQyxDQUFDLENBQUM7b0JBRUosd0RBQXdEO29CQUN4RCxPQUFPO3dCQUNILEVBQUUsRUFBRSx1QkFBdUIsQ0FBQyxFQUFFO3dCQUM5QixJQUFJLEVBQUUsdUJBQXVDO3FCQUNoRCxDQUFBO2lCQUNKO2FBQ0o7aUJBQU07Z0JBQ0gsTUFBTSxZQUFZLEdBQUcsb0VBQW9FLHVCQUF1QixDQUFDLFdBQVcsMkJBQTJCLHVCQUF1QixDQUFDLElBQUksRUFBRSxDQUFDO2dCQUN0TCxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUMxQixPQUFPO29CQUNILFlBQVksRUFBRSxZQUFZO29CQUMxQixTQUFTLEVBQUUsd0NBQXNCLENBQUMsZUFBZTtpQkFDcEQsQ0FBQTthQUNKO1FBQ0wsS0FBSyx5Q0FBdUIsQ0FBQyxJQUFJO1lBQzdCLHdFQUF3RTtZQUN4RSxJQUFJLHVCQUF1QixDQUFDLGNBQWMsSUFBSSx1QkFBdUIsQ0FBQyxjQUFjLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDL0YsbUVBQW1FO2dCQUNuRSxNQUFNLGtDQUFrQyxHQUF5QixNQUFNLGFBQWEsQ0FBQywwQkFBMEIsQ0FBQztvQkFDNUcsY0FBYyxFQUFFLHVCQUF1QixDQUFDLGNBQWU7aUJBQzFELEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztnQkFFckIsNEVBQTRFO2dCQUM1RSxJQUFJLENBQUMsa0NBQWtDLElBQUksa0NBQWtDLENBQUMsWUFBWTtvQkFDdEYsa0NBQWtDLENBQUMsU0FBUyxJQUFJLENBQUMsa0NBQWtDLENBQUMsU0FBUyxFQUFFO29CQUMvRixNQUFNLFlBQVksR0FBRyx3R0FBd0csSUFBSSxDQUFDLFNBQVMsQ0FBQyxrQ0FBa0MsQ0FBQyxFQUFFLENBQUE7b0JBQ2pMLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7b0JBQzFCLE9BQU87d0JBQ0gsWUFBWSxFQUFFLFlBQVk7d0JBQzFCLFNBQVMsRUFBRSx3Q0FBc0IsQ0FBQyxlQUFlO3FCQUNwRCxDQUFBO2lCQUNKO3FCQUFNO29CQUNILDBEQUEwRDtvQkFDMUQsdUJBQXVCLENBQUMsY0FBYyxHQUFHLGtDQUFrQyxDQUFDLFNBQVUsQ0FBQztvQkFFdkYsNEVBQTRFO29CQUM1RSxNQUFNLGNBQWMsR0FBcUIsRUFBRSxDQUFDO29CQUM1QyxLQUFLLE1BQU0sU0FBUyxJQUFJLHVCQUF1QixDQUFDLGNBQWMsRUFBRTt3QkFDNUQsY0FBYyxDQUFDLElBQUksQ0FBQzs0QkFDaEIsQ0FBQyxFQUFFO2dDQUNDLE9BQU8sRUFBRTtvQ0FDTCxDQUFDLEVBQUUsU0FBVTtpQ0FDaEI7NkJBQ0o7eUJBQ0osQ0FBQyxDQUFBO3FCQUNMO29CQUNELGtEQUFrRDtvQkFDbEQsTUFBTSxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksZ0NBQWMsQ0FBQzt3QkFDekMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW9CO3dCQUMzQyxJQUFJLEVBQUU7NEJBQ0YsRUFBRSxFQUFFO2dDQUNBLENBQUMsRUFBRSx1QkFBdUIsQ0FBQyxFQUFFOzZCQUNoQzs0QkFDRCxTQUFTLEVBQUU7Z0NBQ1AsQ0FBQyxFQUFFLHVCQUF1QixDQUFDLFNBQVUsQ0FBQyxRQUFRLEVBQUU7NkJBQ25EOzRCQUNELGNBQWMsRUFBRTtnQ0FDWixDQUFDLEVBQUUsdUJBQXVCLENBQUMsY0FBZTs2QkFDN0M7NEJBQ0QsY0FBYyxFQUFFO2dDQUNaLENBQUMsRUFBRSxjQUFjOzZCQUNwQjs0QkFDRCxNQUFNLEVBQUU7Z0NBQ0osQ0FBQyxFQUFFLHVCQUF1QixDQUFDLE1BQU07NkJBQ3BDOzRCQUNELFdBQVcsRUFBRTtnQ0FDVCxDQUFDLEVBQUUsdUJBQXVCLENBQUMsV0FBVzs2QkFDekM7NEJBQ0QsSUFBSSxFQUFFO2dDQUNGLENBQUMsRUFBRSx1QkFBdUIsQ0FBQyxJQUFJOzZCQUNsQzs0QkFDRCxTQUFTLEVBQUU7Z0NBQ1AsQ0FBQyxFQUFFLHVCQUF1QixDQUFDLFNBQVU7NkJBQ3hDOzRCQUNELFNBQVMsRUFBRTtnQ0FDUCxDQUFDLEVBQUUsdUJBQXVCLENBQUMsU0FBVTs2QkFDeEM7NEJBQ0QsR0FBRyxDQUFDLHVCQUF1QixDQUFDLFNBQVMsSUFBSTtnQ0FDckMsU0FBUyxFQUFFO29DQUNQLENBQUMsRUFBRSx1QkFBdUIsQ0FBQyxTQUFTO2lDQUN2Qzs2QkFDSixDQUFDO3lCQUNMO3FCQUNKLENBQUMsQ0FBQyxDQUFDO29CQUVKLHdEQUF3RDtvQkFDeEQsT0FBTzt3QkFDSCxFQUFFLEVBQUUsdUJBQXVCLENBQUMsRUFBRTt3QkFDOUIsSUFBSSxFQUFFLHVCQUF1QztxQkFDaEQsQ0FBQTtpQkFDSjthQUNKO2lCQUFNO2dCQUNILE1BQU0sWUFBWSxHQUFHLG9FQUFvRSx1QkFBdUIsQ0FBQyxXQUFXLDJCQUEyQix1QkFBdUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDdEwsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDMUIsT0FBTztvQkFDSCxZQUFZLEVBQUUsWUFBWTtvQkFDMUIsU0FBUyxFQUFFLHdDQUFzQixDQUFDLGVBQWU7aUJBQ3BELENBQUE7YUFDSjtRQUNMO1lBQ0ksTUFBTSxZQUFZLEdBQUcsb0NBQW9DLHVCQUF1QixDQUFDLFdBQVcsMkJBQTJCLHVCQUF1QixDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3RKLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDMUIsT0FBTztnQkFDSCxZQUFZLEVBQUUsWUFBWTtnQkFDMUIsU0FBUyxFQUFFLHdDQUFzQixDQUFDLGVBQWU7YUFDcEQsQ0FBQTtLQUNSO0FBQ0wsQ0FBQyxDQUFBO0FBRUQ7Ozs7Ozs7Ozs7R0FVRztBQUNILE1BQU0sZ0NBQWdDLEdBQUcsS0FBSyxFQUFFLHVCQUFnRCxFQUFFLGFBQTRCLEVBQzlFLGNBQThCLEVBQUUsZ0JBQWtDLEVBQXVDLEVBQUU7SUFDdkosT0FBTyxDQUFDLEdBQUcsQ0FBQyw4Q0FBOEMsQ0FBQyxDQUFDO0lBQzVELFFBQVEsdUJBQXVCLENBQUMsV0FBVyxFQUFFO1FBQ3pDLEtBQUsseUNBQXVCLENBQUMsS0FBSztZQUM5QixtRUFBbUU7WUFDbkUsSUFBSSx1QkFBdUIsQ0FBQyxnQkFBZ0IsSUFBSSx1QkFBdUIsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEtBQUssQ0FBQztnQkFDakcsdUJBQXVCLENBQUMsWUFBWSxJQUFJLHVCQUF1QixDQUFDLFlBQVksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUMzRiw4REFBOEQ7Z0JBQzlELE1BQU0sNkJBQTZCLEdBQXlCLE1BQU0sYUFBYSxDQUFDLHFCQUFxQixDQUFDO29CQUNsRyxnQkFBZ0IsRUFBRSx1QkFBdUIsQ0FBQyxnQkFBaUI7b0JBQzNELFlBQVksRUFBRSx1QkFBdUIsQ0FBQyxZQUFhO2lCQUN0RCxFQUFFLGdCQUFnQixDQUFDLENBQUM7Z0JBRXJCLHNFQUFzRTtnQkFDdEUsSUFBSSxDQUFDLDZCQUE2QixJQUFJLDZCQUE2QixDQUFDLFlBQVk7b0JBQzVFLDZCQUE2QixDQUFDLFNBQVMsSUFBSSxDQUFDLDZCQUE2QixDQUFDLFNBQVMsRUFBRTtvQkFDckYsTUFBTSxZQUFZLEdBQUcsc0ZBQXNGLElBQUksQ0FBQyxTQUFTLENBQUMsNkJBQTZCLENBQUMsRUFBRSxDQUFBO29CQUMxSixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO29CQUMxQixPQUFPO3dCQUNILFlBQVksRUFBRSxZQUFZO3dCQUMxQixTQUFTLEVBQUUsd0NBQXNCLENBQUMsZUFBZTtxQkFDcEQsQ0FBQTtpQkFDSjtxQkFBTTtvQkFDSCwwREFBMEQ7b0JBQzFELHVCQUF1QixDQUFDLGNBQWMsR0FBRyw2QkFBNkIsQ0FBQyxTQUFVLENBQUM7b0JBRWxGLGtEQUFrRDtvQkFDbEQsTUFBTSxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksZ0NBQWMsQ0FBQzt3QkFDekMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW9CO3dCQUMzQyxJQUFJLEVBQUU7NEJBQ0YsRUFBRSxFQUFFO2dDQUNBLENBQUMsRUFBRSx1QkFBdUIsQ0FBQyxFQUFFOzZCQUNoQzs0QkFDRCxTQUFTLEVBQUU7Z0NBQ1AsQ0FBQyxFQUFFLHVCQUF1QixDQUFDLFNBQVUsQ0FBQyxRQUFRLEVBQUU7NkJBQ25EOzRCQUNELGNBQWMsRUFBRTtnQ0FDWixDQUFDLEVBQUUsdUJBQXVCLENBQUMsY0FBZTs2QkFDN0M7NEJBQ0QsZ0JBQWdCLEVBQUU7Z0NBQ2QsQ0FBQyxFQUFFLHVCQUF1QixDQUFDLGdCQUFpQjs2QkFDL0M7NEJBQ0QsWUFBWSxFQUFFO2dDQUNWLENBQUMsRUFBRSx1QkFBdUIsQ0FBQyxZQUFhOzZCQUMzQzs0QkFDRCxNQUFNLEVBQUU7Z0NBQ0osQ0FBQyxFQUFFLHVCQUF1QixDQUFDLE1BQU07NkJBQ3BDOzRCQUNELFdBQVcsRUFBRTtnQ0FDVCxDQUFDLEVBQUUsdUJBQXVCLENBQUMsV0FBVzs2QkFDekM7NEJBQ0QsSUFBSSxFQUFFO2dDQUNGLENBQUMsRUFBRSx1QkFBdUIsQ0FBQyxJQUFJOzZCQUNsQzs0QkFDRCxTQUFTLEVBQUU7Z0NBQ1AsQ0FBQyxFQUFFLHVCQUF1QixDQUFDLFNBQVU7NkJBQ3hDOzRCQUNELFNBQVMsRUFBRTtnQ0FDUCxDQUFDLEVBQUUsdUJBQXVCLENBQUMsU0FBVTs2QkFDeEM7NEJBQ0QsR0FBRyxDQUFDLHVCQUF1QixDQUFDLFNBQVMsSUFBSTtnQ0FDckMsU0FBUyxFQUFFO29DQUNQLENBQUMsRUFBRSx1QkFBdUIsQ0FBQyxTQUFTO2lDQUN2Qzs2QkFDSixDQUFDO3lCQUNMO3FCQUNKLENBQUMsQ0FBQyxDQUFDO29CQUVKLHdEQUF3RDtvQkFDeEQsT0FBTzt3QkFDSCxFQUFFLEVBQUUsdUJBQXVCLENBQUMsRUFBRTt3QkFDOUIsSUFBSSxFQUFFLHVCQUF1QztxQkFDaEQsQ0FBQTtpQkFDSjthQUNKO2lCQUFNO2dCQUNILE1BQU0sWUFBWSxHQUFHLG9FQUFvRSx1QkFBdUIsQ0FBQyxXQUFXLDJCQUEyQix1QkFBdUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDdEwsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDMUIsT0FBTztvQkFDSCxZQUFZLEVBQUUsWUFBWTtvQkFDMUIsU0FBUyxFQUFFLHdDQUFzQixDQUFDLGVBQWU7aUJBQ3BELENBQUE7YUFDSjtRQUNMLEtBQUsseUNBQXVCLENBQUMsSUFBSTtZQUM3Qix3RUFBd0U7WUFDeEUsSUFBSSx1QkFBdUIsQ0FBQyxjQUFjLElBQUksdUJBQXVCLENBQUMsY0FBYyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQy9GLG1FQUFtRTtnQkFDbkUsTUFBTSxrQ0FBa0MsR0FBeUIsTUFBTSxhQUFhLENBQUMsMEJBQTBCLENBQUM7b0JBQzVHLGNBQWMsRUFBRSx1QkFBdUIsQ0FBQyxjQUFlO2lCQUMxRCxFQUFFLGdCQUFnQixDQUFDLENBQUM7Z0JBRXJCLDRFQUE0RTtnQkFDNUUsSUFBSSxDQUFDLGtDQUFrQyxJQUFJLGtDQUFrQyxDQUFDLFlBQVk7b0JBQ3RGLGtDQUFrQyxDQUFDLFNBQVMsSUFBSSxDQUFDLGtDQUFrQyxDQUFDLFNBQVMsRUFBRTtvQkFDL0YsTUFBTSxZQUFZLEdBQUcsd0dBQXdHLElBQUksQ0FBQyxTQUFTLENBQUMsa0NBQWtDLENBQUMsRUFBRSxDQUFBO29CQUNqTCxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO29CQUMxQixPQUFPO3dCQUNILFlBQVksRUFBRSxZQUFZO3dCQUMxQixTQUFTLEVBQUUsd0NBQXNCLENBQUMsZUFBZTtxQkFDcEQsQ0FBQTtpQkFDSjtxQkFBTTtvQkFDSCwwREFBMEQ7b0JBQzFELHVCQUF1QixDQUFDLGNBQWMsR0FBRyxrQ0FBa0MsQ0FBQyxTQUFVLENBQUM7b0JBRXZGLDRFQUE0RTtvQkFDNUUsTUFBTSxjQUFjLEdBQXFCLEVBQUUsQ0FBQztvQkFDNUMsS0FBSyxNQUFNLFNBQVMsSUFBSSx1QkFBdUIsQ0FBQyxjQUFjLEVBQUU7d0JBQzVELGNBQWMsQ0FBQyxJQUFJLENBQUM7NEJBQ2hCLENBQUMsRUFBRTtnQ0FDQyxPQUFPLEVBQUU7b0NBQ0wsQ0FBQyxFQUFFLFNBQVU7aUNBQ2hCOzZCQUNKO3lCQUNKLENBQUMsQ0FBQTtxQkFDTDtvQkFDRCxrREFBa0Q7b0JBQ2xELE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLGdDQUFjLENBQUM7d0JBQ3pDLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFvQjt3QkFDM0MsSUFBSSxFQUFFOzRCQUNGLEVBQUUsRUFBRTtnQ0FDQSxDQUFDLEVBQUUsdUJBQXVCLENBQUMsRUFBRTs2QkFDaEM7NEJBQ0QsU0FBUyxFQUFFO2dDQUNQLENBQUMsRUFBRSx1QkFBdUIsQ0FBQyxTQUFVLENBQUMsUUFBUSxFQUFFOzZCQUNuRDs0QkFDRCxjQUFjLEVBQUU7Z0NBQ1osQ0FBQyxFQUFFLHVCQUF1QixDQUFDLGNBQWU7NkJBQzdDOzRCQUNELGNBQWMsRUFBRTtnQ0FDWixDQUFDLEVBQUUsY0FBYzs2QkFDcEI7NEJBQ0QsTUFBTSxFQUFFO2dDQUNKLENBQUMsRUFBRSx1QkFBdUIsQ0FBQyxNQUFNOzZCQUNwQzs0QkFDRCxXQUFXLEVBQUU7Z0NBQ1QsQ0FBQyxFQUFFLHVCQUF1QixDQUFDLFdBQVc7NkJBQ3pDOzRCQUNELElBQUksRUFBRTtnQ0FDRixDQUFDLEVBQUUsdUJBQXVCLENBQUMsSUFBSTs2QkFDbEM7NEJBQ0QsU0FBUyxFQUFFO2dDQUNQLENBQUMsRUFBRSx1QkFBdUIsQ0FBQyxTQUFVOzZCQUN4Qzs0QkFDRCxTQUFTLEVBQUU7Z0NBQ1AsQ0FBQyxFQUFFLHVCQUF1QixDQUFDLFNBQVU7NkJBQ3hDOzRCQUNELEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLElBQUk7Z0NBQ3JDLFNBQVMsRUFBRTtvQ0FDUCxDQUFDLEVBQUUsdUJBQXVCLENBQUMsU0FBUztpQ0FDdkM7NkJBQ0osQ0FBQzt5QkFDTDtxQkFDSixDQUFDLENBQUMsQ0FBQztvQkFFSix3REFBd0Q7b0JBQ3hELE9BQU87d0JBQ0gsRUFBRSxFQUFFLHVCQUF1QixDQUFDLEVBQUU7d0JBQzlCLElBQUksRUFBRSx1QkFBdUM7cUJBQ2hELENBQUE7aUJBQ0o7YUFDSjtpQkFBTTtnQkFDSCxNQUFNLFlBQVksR0FBRyxvRUFBb0UsdUJBQXVCLENBQUMsV0FBVywyQkFBMkIsdUJBQXVCLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ3RMLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQzFCLE9BQU87b0JBQ0gsWUFBWSxFQUFFLFlBQVk7b0JBQzFCLFNBQVMsRUFBRSx3Q0FBc0IsQ0FBQyxlQUFlO2lCQUNwRCxDQUFBO2FBQ0o7UUFDTDtZQUNJLE1BQU0sWUFBWSxHQUFHLG9DQUFvQyx1QkFBdUIsQ0FBQyxXQUFXLDJCQUEyQix1QkFBdUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUN0SixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQzFCLE9BQU87Z0JBQ0gsWUFBWSxFQUFFLFlBQVk7Z0JBQzFCLFNBQVMsRUFBRSx3Q0FBc0IsQ0FBQyxlQUFlO2FBQ3BELENBQUE7S0FDUjtBQUNMLENBQUMsQ0FBQTtBQUVEOzs7Ozs7Ozs7R0FTRztBQUNILE1BQU0sa0NBQWtDLEdBQUcsS0FBSyxFQUFFLHVCQUFnRCxFQUFFLGFBQTRCLEVBQUUsY0FBOEIsRUFBdUMsRUFBRTtJQUNyTSxPQUFPLENBQUMsR0FBRyxDQUFDLGlEQUFpRCxDQUFDLENBQUM7SUFDL0QsUUFBUSx1QkFBdUIsQ0FBQyxXQUFXLEVBQUU7UUFDekMsS0FBSyx5Q0FBdUIsQ0FBQyxJQUFJO1lBQzdCLHdFQUF3RTtZQUN4RSxJQUFJLHVCQUF1QixDQUFDLGNBQWMsSUFBSSx1QkFBdUIsQ0FBQyxjQUFjLENBQUMsTUFBTSxLQUFLLENBQUM7Z0JBQzdGLHVCQUF1QixDQUFDLGVBQWUsSUFBSSx1QkFBdUIsQ0FBQyxZQUFZLElBQUksdUJBQXVCLENBQUMsWUFBWSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQ3RJLG1FQUFtRTtnQkFDbkUsTUFBTSxrQ0FBa0MsR0FBeUIsTUFBTSxhQUFhLENBQUMsMEJBQTBCLENBQUM7b0JBQzVHLGNBQWMsRUFBRSx1QkFBdUIsQ0FBQyxjQUFlO29CQUN2RCxZQUFZLEVBQUUsdUJBQXVCLENBQUMsWUFBYTtvQkFDbkQsZUFBZSxFQUFFLE1BQU0sQ0FBQyx1QkFBdUIsQ0FBQyxlQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDL0UsRUFBRSxrQ0FBZ0IsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO2dCQUVqRCw0RUFBNEU7Z0JBQzVFLElBQUksQ0FBQyxrQ0FBa0MsSUFBSSxrQ0FBa0MsQ0FBQyxZQUFZO29CQUN0RixrQ0FBa0MsQ0FBQyxTQUFTLElBQUksQ0FBQyxrQ0FBa0MsQ0FBQyxTQUFTLEVBQUU7b0JBQy9GLE1BQU0sWUFBWSxHQUFHLHdHQUF3RyxJQUFJLENBQUMsU0FBUyxDQUFDLGtDQUFrQyxDQUFDLEVBQUUsQ0FBQTtvQkFDakwsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztvQkFDMUIsT0FBTzt3QkFDSCxZQUFZLEVBQUUsWUFBWTt3QkFDMUIsU0FBUyxFQUFFLHdDQUFzQixDQUFDLGVBQWU7cUJBQ3BELENBQUE7aUJBQ0o7cUJBQU07b0JBQ0gsMERBQTBEO29CQUMxRCx1QkFBdUIsQ0FBQyxjQUFjLEdBQUcsa0NBQWtDLENBQUMsU0FBVSxDQUFDO29CQUV2Riw0RUFBNEU7b0JBQzVFLE1BQU0sY0FBYyxHQUFxQixFQUFFLENBQUM7b0JBQzVDLEtBQUssTUFBTSxTQUFTLElBQUksdUJBQXVCLENBQUMsY0FBYyxFQUFFO3dCQUM1RCxjQUFjLENBQUMsSUFBSSxDQUFDOzRCQUNoQixDQUFDLEVBQUU7Z0NBQ0MsT0FBTyxFQUFFO29DQUNMLENBQUMsRUFBRSxTQUFVO2lDQUNoQjs2QkFDSjt5QkFDSixDQUFDLENBQUE7cUJBQ0w7b0JBQ0Qsa0RBQWtEO29CQUNsRCxNQUFNLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxnQ0FBYyxDQUFDO3dCQUN6QyxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBb0I7d0JBQzNDLElBQUksRUFBRTs0QkFDRixFQUFFLEVBQUU7Z0NBQ0EsQ0FBQyxFQUFFLHVCQUF1QixDQUFDLEVBQUU7NkJBQ2hDOzRCQUNELFNBQVMsRUFBRTtnQ0FDUCxDQUFDLEVBQUUsdUJBQXVCLENBQUMsU0FBVSxDQUFDLFFBQVEsRUFBRTs2QkFDbkQ7NEJBQ0QsY0FBYyxFQUFFO2dDQUNaLENBQUMsRUFBRSx1QkFBdUIsQ0FBQyxjQUFlOzZCQUM3Qzs0QkFDRCxjQUFjLEVBQUU7Z0NBQ1osQ0FBQyxFQUFFLGNBQWM7NkJBQ3BCOzRCQUNELE1BQU0sRUFBRTtnQ0FDSixDQUFDLEVBQUUsdUJBQXVCLENBQUMsTUFBTTs2QkFDcEM7NEJBQ0QsV0FBVyxFQUFFO2dDQUNULENBQUMsRUFBRSx1QkFBdUIsQ0FBQyxXQUFXOzZCQUN6Qzs0QkFDRCxJQUFJLEVBQUU7Z0NBQ0YsQ0FBQyxFQUFFLHVCQUF1QixDQUFDLElBQUk7NkJBQ2xDOzRCQUNELFNBQVMsRUFBRTtnQ0FDUCxDQUFDLEVBQUUsdUJBQXVCLENBQUMsU0FBVTs2QkFDeEM7NEJBQ0QsU0FBUyxFQUFFO2dDQUNQLENBQUMsRUFBRSx1QkFBdUIsQ0FBQyxTQUFVOzZCQUN4Qzs0QkFDRCxHQUFHLENBQUMsdUJBQXVCLENBQUMsU0FBUyxJQUFJO2dDQUNyQyxTQUFTLEVBQUU7b0NBQ1AsQ0FBQyxFQUFFLHVCQUF1QixDQUFDLFNBQVM7aUNBQ3ZDOzZCQUNKLENBQUM7eUJBQ0w7cUJBQ0osQ0FBQyxDQUFDLENBQUM7b0JBRUosd0RBQXdEO29CQUN4RCxPQUFPO3dCQUNILEVBQUUsRUFBRSx1QkFBdUIsQ0FBQyxFQUFFO3dCQUM5QixJQUFJLEVBQUUsdUJBQXVDO3FCQUNoRCxDQUFBO2lCQUNKO2FBQ0o7aUJBQU07Z0JBQ0gsTUFBTSxZQUFZLEdBQUcsb0VBQW9FLHVCQUF1QixDQUFDLFdBQVcsMkJBQTJCLHVCQUF1QixDQUFDLElBQUksRUFBRSxDQUFDO2dCQUN0TCxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUMxQixPQUFPO29CQUNILFlBQVksRUFBRSxZQUFZO29CQUMxQixTQUFTLEVBQUUsd0NBQXNCLENBQUMsZUFBZTtpQkFDcEQsQ0FBQTthQUNKO1FBQ0w7WUFDSSxNQUFNLFlBQVksR0FBRyxvQ0FBb0MsdUJBQXVCLENBQUMsV0FBVywyQkFBMkIsdUJBQXVCLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDdEosT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUMxQixPQUFPO2dCQUNILFlBQVksRUFBRSxZQUFZO2dCQUMxQixTQUFTLEVBQUUsd0NBQXNCLENBQUMsZUFBZTthQUNwRCxDQUFBO0tBQ1I7QUFDTCxDQUFDLENBQUE7QUFFRDs7Ozs7Ozs7O0dBU0c7QUFDSCxNQUFNLHlCQUF5QixHQUFHLEtBQUssRUFBRSx1QkFBZ0QsRUFBRSxhQUE0QixFQUFFLGNBQThCLEVBQXVDLEVBQUU7SUFDNUwsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO0lBQ3JELFFBQVEsdUJBQXVCLENBQUMsV0FBVyxFQUFFO1FBQ3pDLEtBQUsseUNBQXVCLENBQUMsS0FBSztZQUM5QixtRUFBbUU7WUFDbkUsSUFBSSx1QkFBdUIsQ0FBQyxnQkFBZ0IsSUFBSSx1QkFBdUIsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEtBQUssQ0FBQztnQkFDakcsdUJBQXVCLENBQUMsWUFBWSxJQUFJLHVCQUF1QixDQUFDLFlBQVksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUMzRiw4REFBOEQ7Z0JBQzlELE1BQU0sNkJBQTZCLEdBQXlCLE1BQU0sYUFBYSxDQUFDLHFCQUFxQixDQUFDO29CQUNsRyxnQkFBZ0IsRUFBRSx1QkFBdUIsQ0FBQyxnQkFBaUI7b0JBQzNELFlBQVksRUFBRSx1QkFBdUIsQ0FBQyxZQUFhO2lCQUN0RCxFQUFFLGtDQUFnQixDQUFDLGFBQWEsQ0FBQyxDQUFDO2dCQUVuQyxzRUFBc0U7Z0JBQ3RFLElBQUksQ0FBQyw2QkFBNkIsSUFBSSw2QkFBNkIsQ0FBQyxZQUFZO29CQUM1RSw2QkFBNkIsQ0FBQyxTQUFTLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxTQUFTLEVBQUU7b0JBQ3JGLE1BQU0sWUFBWSxHQUFHLHNGQUFzRixJQUFJLENBQUMsU0FBUyxDQUFDLDZCQUE2QixDQUFDLEVBQUUsQ0FBQTtvQkFDMUosT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztvQkFDMUIsT0FBTzt3QkFDSCxZQUFZLEVBQUUsWUFBWTt3QkFDMUIsU0FBUyxFQUFFLHdDQUFzQixDQUFDLGVBQWU7cUJBQ3BELENBQUE7aUJBQ0o7cUJBQU07b0JBQ0gsMERBQTBEO29CQUMxRCx1QkFBdUIsQ0FBQyxjQUFjLEdBQUcsNkJBQTZCLENBQUMsU0FBVSxDQUFDO29CQUVsRixrREFBa0Q7b0JBQ2xELE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLGdDQUFjLENBQUM7d0JBQ3pDLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFvQjt3QkFDM0MsSUFBSSxFQUFFOzRCQUNGLEVBQUUsRUFBRTtnQ0FDQSxDQUFDLEVBQUUsdUJBQXVCLENBQUMsRUFBRTs2QkFDaEM7NEJBQ0QsU0FBUyxFQUFFO2dDQUNQLENBQUMsRUFBRSx1QkFBdUIsQ0FBQyxTQUFVLENBQUMsUUFBUSxFQUFFOzZCQUNuRDs0QkFDRCxjQUFjLEVBQUU7Z0NBQ1osQ0FBQyxFQUFFLHVCQUF1QixDQUFDLGNBQWU7NkJBQzdDOzRCQUNELGdCQUFnQixFQUFFO2dDQUNkLENBQUMsRUFBRSx1QkFBdUIsQ0FBQyxnQkFBaUI7NkJBQy9DOzRCQUNELFlBQVksRUFBRTtnQ0FDVixDQUFDLEVBQUUsdUJBQXVCLENBQUMsWUFBYTs2QkFDM0M7NEJBQ0QsTUFBTSxFQUFFO2dDQUNKLENBQUMsRUFBRSx1QkFBdUIsQ0FBQyxNQUFNOzZCQUNwQzs0QkFDRCxXQUFXLEVBQUU7Z0NBQ1QsQ0FBQyxFQUFFLHVCQUF1QixDQUFDLFdBQVc7NkJBQ3pDOzRCQUNELElBQUksRUFBRTtnQ0FDRixDQUFDLEVBQUUsdUJBQXVCLENBQUMsSUFBSTs2QkFDbEM7NEJBQ0QsU0FBUyxFQUFFO2dDQUNQLENBQUMsRUFBRSx1QkFBdUIsQ0FBQyxTQUFVOzZCQUN4Qzs0QkFDRCxTQUFTLEVBQUU7Z0NBQ1AsQ0FBQyxFQUFFLHVCQUF1QixDQUFDLFNBQVU7NkJBQ3hDOzRCQUNELEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLElBQUk7Z0NBQ3JDLFNBQVMsRUFBRTtvQ0FDUCxDQUFDLEVBQUUsdUJBQXVCLENBQUMsU0FBUztpQ0FDdkM7NkJBQ0osQ0FBQzt5QkFDTDtxQkFDSixDQUFDLENBQUMsQ0FBQztvQkFFSix3REFBd0Q7b0JBQ3hELE9BQU87d0JBQ0gsRUFBRSxFQUFFLHVCQUF1QixDQUFDLEVBQUU7d0JBQzlCLElBQUksRUFBRSx1QkFBdUM7cUJBQ2hELENBQUE7aUJBQ0o7YUFDSjtpQkFBTTtnQkFDSCxNQUFNLFlBQVksR0FBRyxvRUFBb0UsdUJBQXVCLENBQUMsV0FBVywyQkFBMkIsdUJBQXVCLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ3RMLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQzFCLE9BQU87b0JBQ0gsWUFBWSxFQUFFLFlBQVk7b0JBQzFCLFNBQVMsRUFBRSx3Q0FBc0IsQ0FBQyxlQUFlO2lCQUNwRCxDQUFBO2FBQ0o7UUFDTDtZQUNJLE1BQU0sWUFBWSxHQUFHLG9DQUFvQyx1QkFBdUIsQ0FBQyxXQUFXLDJCQUEyQix1QkFBdUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUN0SixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQzFCLE9BQU87Z0JBQ0gsWUFBWSxFQUFFLFlBQVk7Z0JBQzFCLFNBQVMsRUFBRSx3Q0FBc0IsQ0FBQyxlQUFlO2FBQ3BELENBQUE7S0FDUjtBQUNMLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7QXR0cmlidXRlVmFsdWUsIER5bmFtb0RCQ2xpZW50LCBHZXRJdGVtQ29tbWFuZCwgUHV0SXRlbUNvbW1hbmR9IGZyb20gXCJAYXdzLXNkay9jbGllbnQtZHluYW1vZGJcIjtcbmltcG9ydCB7XG4gICAgQ291cmllckNsaWVudCxcbiAgICBDcmVhdGVOb3RpZmljYXRpb25JbnB1dCxcbiAgICBDcmVhdGVOb3RpZmljYXRpb25SZXNwb25zZSxcbiAgICBOb3RpZmljYXRpb24sXG4gICAgTm90aWZpY2F0aW9uQ2hhbm5lbFR5cGUsXG4gICAgTm90aWZpY2F0aW9uUmVzcG9uc2UsXG4gICAgTm90aWZpY2F0aW9uc0Vycm9yVHlwZSxcbiAgICBOb3RpZmljYXRpb25UeXBlXG59IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5cbi8qKlxuICogQ3JlYXRlTm90aWZpY2F0aW9uIHJlc29sdmVyXG4gKlxuICogQHBhcmFtIGZpZWxkTmFtZSBuYW1lIG9mIHRoZSByZXNvbHZlciBwYXRoIGZyb20gdGhlIEFwcFN5bmMgZXZlbnRcbiAqIEBwYXJhbSBjcmVhdGVOb3RpZmljYXRpb25JbnB1dCBjcmVhdGUgbm90aWZpY2F0aW9ucyBpbnB1dCBvYmplY3QsIHVzZWQgdG8gY3JlYXRlIGEgbm90aWZpY2F0aW9uXG4gKiBiYXNlZCBvbiBhbiBldmVudCAocmVpbWJ1cnNlbWVudCwgdHJhbnNhY3Rpb24sIGNhcmQgZXhwaXJhdGlvbiwgc3VjY2Vzc2Z1bCByZWdpc3RyYXRpb24pLlxuICogQHJldHVybnMge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBDcmVhdGVOb3RpZmljYXRpb25SZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IGNyZWF0ZU5vdGlmaWNhdGlvbiA9IGFzeW5jIChmaWVsZE5hbWU6IHN0cmluZywgY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQ6IENyZWF0ZU5vdGlmaWNhdGlvbklucHV0KTogUHJvbWlzZTxDcmVhdGVOb3RpZmljYXRpb25SZXNwb25zZT4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgIC8vIGluaXRpYWxpemluZyB0aGUgRHluYW1vREIgZG9jdW1lbnQgY2xpZW50XG4gICAgICAgIGNvbnN0IGR5bmFtb0RiQ2xpZW50ID0gbmV3IER5bmFtb0RCQ2xpZW50KHtyZWdpb246IHJlZ2lvbn0pO1xuXG4gICAgICAgIC8vIHVwZGF0ZSB0aGUgdGltZXN0YW1wcyBhY2NvcmRpbmdseVxuICAgICAgICBjb25zdCBjcmVhdGVkQXQgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgICAgIGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnRpbWVzdGFtcCA9IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnRpbWVzdGFtcCA/IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnRpbWVzdGFtcCA6IERhdGUucGFyc2UoY3JlYXRlZEF0KTtcbiAgICAgICAgY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuY3JlYXRlZEF0ID0gY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuY3JlYXRlZEF0ID8gY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuY3JlYXRlZEF0IDogY3JlYXRlZEF0O1xuICAgICAgICBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC51cGRhdGVkQXQgPSBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC51cGRhdGVkQXQgPyBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC51cGRhdGVkQXQgOiBjcmVhdGVkQXQ7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIGNoZWNrIHRvIHNlZSBpZiB0aGUgc2FtZSBub3RpZmljYXRpb25zIGFscmVhZHkgZXhpc3RzIGluIHRoZSBEQi4gQWx0aG91Z2ggdGhpcyBpcyBhIHZlcnkgcmFyZSBzaXR1YXRpb24gKGlmIGF0IGFsbCksXG4gICAgICAgICAqIHdlIHdhbnQgdG8gcHV0IGEgc2FmZWd1YXJkIGFyb3VuZCBkdXBsaWNhdGVzIGV2ZW4gaGVyZS5cbiAgICAgICAgICovXG4gICAgICAgIGNvbnN0IHByZUV4aXN0aW5nTm90aWZpY2F0aW9uID0gYXdhaXQgZHluYW1vRGJDbGllbnQuc2VuZChuZXcgR2V0SXRlbUNvbW1hbmQoe1xuICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5OT1RJRklDQVRJT05TX1RBQkxFISxcbiAgICAgICAgICAgIEtleToge1xuICAgICAgICAgICAgICAgIGlkOiB7XG4gICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmlkXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IHtcbiAgICAgICAgICAgICAgICAgICAgTjogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQudGltZXN0YW1wLnRvU3RyaW5nKClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiB3ZSdyZSBub3QgaW50ZXJlc3RlZCBpbiBnZXR0aW5nIGFsbCB0aGUgZGF0YSBmb3IgdGhpcyBjYWxsLCBqdXN0IHRoZSBtaW5pbXVtIGZvciB1cyB0byBkZXRlcm1pbmUgd2hldGhlciB0aGlzIGlzIGEgZHVwbGljYXRlIG9yIG5vdFxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIEBsaW5rIGh0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9hbWF6b25keW5hbW9kYi9sYXRlc3QvZGV2ZWxvcGVyZ3VpZGUvUmVzZXJ2ZWRXb3Jkcy5odG1sXG4gICAgICAgICAgICAgKiBAbGluayBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vYW1hem9uZHluYW1vZGIvbGF0ZXN0L2RldmVsb3Blcmd1aWRlL0V4cHJlc3Npb25zLkV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lcy5odG1sXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIFByb2plY3Rpb25FeHByZXNzaW9uOiAnI2lkZiwgI3QnLFxuICAgICAgICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzOiB7XG4gICAgICAgICAgICAgICAgJyNpZGYnOiAnaWQnLFxuICAgICAgICAgICAgICAgICcjdCc6ICd0aW1lc3RhbXAnXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKTtcblxuICAgICAgICAvLyBpZiB0aGVyZSBpcyBhbiBpdGVtIHJldHJpZXZlZCwgdGhlbiB3ZSByZXR1cm4gYW4gZXJyb3JcbiAgICAgICAgaWYgKHByZUV4aXN0aW5nTm90aWZpY2F0aW9uICYmIHByZUV4aXN0aW5nTm90aWZpY2F0aW9uLkl0ZW0pIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogaWYgdGhlcmUgaXMgYSBwcmUtZXhpc3Rpbmcgbm90aWZpY2F0aW9uIHdpdGggdGhlIHNhbWUgY29tcG9zaXRlIHByaW1hcnkga2V5ICh1c2VySWQvaWQsIHRpbWVzdGFtcCkgY29tYmluYXRpb24sXG4gICAgICAgICAgICAgKiB0aGVuIHdlIGNhbm5vdCBkdXBsaWNhdGUgdGhhdCwgc28gd2Ugd2lsbCByZXR1cm4gYW4gZXJyb3IuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBEdXBsaWNhdGUgbm90aWZpY2F0aW9uIGZvdW5kIWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5EdXBsaWNhdGVPYmplY3RGb3VuZFxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBmaXJzdCwgd2UgbmVlZCB0byBjYWxsIHRoZSBhcHByb3ByaWF0ZSBDb3VyaWVyIEFQSSAod2l0aCB0aGUgYXBwcm9wcmlhdGUgaW1wbGVtZW50YXRpb24pLCBkZXBlbmRpbmcgb24gdGhlIE5vdGlmaWNhdGlvblxuICAgICAgICAgICAgICogdHlwZSwgYXMgd2VsbCBhcyB0aGUgY2hhbm5lbCwgdG8gYmUgcGFzc2VkIGluLlxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIGluaXRpYWxpemUgdGhlIENvdXJpZXIgQ2xpZW50IEFQSSBoZXJlLCBpbiBvcmRlciB0byBjYWxsIHRoZSBhcHByb3ByaWF0ZSBlbmRwb2ludHMgZm9yIHRoaXMgaGFuZGxlclxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBjb25zdCBjb3VyaWVyQ2xpZW50ID0gbmV3IENvdXJpZXJDbGllbnQocHJvY2Vzcy5lbnYuRU5WX05BTUUhLCByZWdpb24pO1xuICAgICAgICAgICAgLy8gc3dpdGNoIGJhc2VkIG9uIHRoZSB0eXBlIGZpcnN0XG4gICAgICAgICAgICBzd2l0Y2ggKGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIE5vdGlmaWNhdGlvblR5cGUuTmV3VXNlclNpZ251cDpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ld1VzZXJTaWduVXBOb3RpZmljYXRpb24oY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQsIGNvdXJpZXJDbGllbnQsIGR5bmFtb0RiQ2xpZW50KTtcbiAgICAgICAgICAgICAgICBjYXNlIE5vdGlmaWNhdGlvblR5cGUuTmV3UXVhbGlmeWluZ09mZmVyQXZhaWxhYmxlOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3VXNlclF1YWxpZnlpbmdPZmZlck5vdGlmaWNhdGlvbihjcmVhdGVOb3RpZmljYXRpb25JbnB1dCwgY291cmllckNsaWVudCwgZHluYW1vRGJDbGllbnQpO1xuICAgICAgICAgICAgICAgIGNhc2UgTm90aWZpY2F0aW9uVHlwZS5NaWxpdGFyeVN0YXR1c0NoYW5nZWRQZW5kaW5nVG9SZWplY3RlZDpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1pbGl0YXJ5U3RhdHVzVXBkYXRlTm90aWZpY2F0aW9uKGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LCBjb3VyaWVyQ2xpZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgZHluYW1vRGJDbGllbnQsIE5vdGlmaWNhdGlvblR5cGUuTWlsaXRhcnlTdGF0dXNDaGFuZ2VkUGVuZGluZ1RvUmVqZWN0ZWQpO1xuICAgICAgICAgICAgICAgIGNhc2UgTm90aWZpY2F0aW9uVHlwZS5NaWxpdGFyeVN0YXR1c0NoYW5nZWRQZW5kaW5nVG9WZXJpZmllZDpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1pbGl0YXJ5U3RhdHVzVXBkYXRlTm90aWZpY2F0aW9uKGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LCBjb3VyaWVyQ2xpZW50LCBkeW5hbW9EYkNsaWVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIE5vdGlmaWNhdGlvblR5cGUuTWlsaXRhcnlTdGF0dXNDaGFuZ2VkUGVuZGluZ1RvVmVyaWZpZWQpO1xuICAgICAgICAgICAgICAgIGNhc2UgTm90aWZpY2F0aW9uVHlwZS5DYXJkTGlua2luZ1JlbWluZGVyOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RhbmRhcmRFbWFpbEFuZFB1c2hOb3RpZmljYXRpb24oY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQsIGNvdXJpZXJDbGllbnQsIGR5bmFtb0RiQ2xpZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgTm90aWZpY2F0aW9uVHlwZS5DYXJkTGlua2luZ1JlbWluZGVyKTtcbiAgICAgICAgICAgICAgICBjYXNlIE5vdGlmaWNhdGlvblR5cGUuTmV3TWFwRmVhdHVyZVJlbWluZGVyOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RhbmRhcmRFbWFpbEFuZFB1c2hOb3RpZmljYXRpb24oY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQsIGNvdXJpZXJDbGllbnQsIGR5bmFtb0RiQ2xpZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgTm90aWZpY2F0aW9uVHlwZS5OZXdNYXBGZWF0dXJlUmVtaW5kZXIpO1xuICAgICAgICAgICAgICAgIGNhc2UgTm90aWZpY2F0aW9uVHlwZS5WZXRlcmFuc0RheVRlbXBsYXRlXzFSZW1pbmRlcjpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0YW5kYXJkUHVzaE5vdGlmaWNhdGlvbihjcmVhdGVOb3RpZmljYXRpb25JbnB1dCwgY291cmllckNsaWVudCwgZHluYW1vRGJDbGllbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBOb3RpZmljYXRpb25UeXBlLlZldGVyYW5zRGF5VGVtcGxhdGVfMVJlbWluZGVyKTtcbiAgICAgICAgICAgICAgICBjYXNlIE5vdGlmaWNhdGlvblR5cGUuVmV0ZXJhbnNEYXlUZW1wbGF0ZV8yUmVtaW5kZXI6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdGFuZGFyZFB1c2hOb3RpZmljYXRpb24oY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQsIGNvdXJpZXJDbGllbnQsIGR5bmFtb0RiQ2xpZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgTm90aWZpY2F0aW9uVHlwZS5WZXRlcmFuc0RheVRlbXBsYXRlXzJSZW1pbmRlcik7XG4gICAgICAgICAgICAgICAgY2FzZSBOb3RpZmljYXRpb25UeXBlLlZldGVyYW5zRGF5VGVtcGxhdGVfM1JlbWluZGVyOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RhbmRhcmRFbWFpbEFuZFB1c2hOb3RpZmljYXRpb24oY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQsIGNvdXJpZXJDbGllbnQsIGR5bmFtb0RiQ2xpZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgTm90aWZpY2F0aW9uVHlwZS5WZXRlcmFuc0RheVRlbXBsYXRlXzNSZW1pbmRlcik7XG4gICAgICAgICAgICAgICAgY2FzZSBOb3RpZmljYXRpb25UeXBlLlJlZmVycmFsVGVtcGxhdGVMYXVuY2g6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdGFuZGFyZEVtYWlsQW5kUHVzaE5vdGlmaWNhdGlvbihjcmVhdGVOb3RpZmljYXRpb25JbnB1dCwgY291cmllckNsaWVudCwgZHluYW1vRGJDbGllbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBOb3RpZmljYXRpb25UeXBlLlJlZmVycmFsVGVtcGxhdGVMYXVuY2gpO1xuICAgICAgICAgICAgICAgIGNhc2UgTm90aWZpY2F0aW9uVHlwZS5SZWZlcnJhbFRlbXBsYXRlXzFSZW1pbmRlcjpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0YW5kYXJkRW1haWxBbmRQdXNoTm90aWZpY2F0aW9uKGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LCBjb3VyaWVyQ2xpZW50LCBkeW5hbW9EYkNsaWVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIE5vdGlmaWNhdGlvblR5cGUuUmVmZXJyYWxUZW1wbGF0ZV8xUmVtaW5kZXIpO1xuICAgICAgICAgICAgICAgIGNhc2UgTm90aWZpY2F0aW9uVHlwZS5NdWx0aXBsZUNhcmRGZWF0dXJlUmVtaW5kZXI6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdGFuZGFyZEVtYWlsQW5kUHVzaE5vdGlmaWNhdGlvbihjcmVhdGVOb3RpZmljYXRpb25JbnB1dCwgY291cmllckNsaWVudCwgZHluYW1vRGJDbGllbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBOb3RpZmljYXRpb25UeXBlLk11bHRpcGxlQ2FyZEZlYXR1cmVSZW1pbmRlcik7XG4gICAgICAgICAgICAgICAgY2FzZSBOb3RpZmljYXRpb25UeXBlLlNwb3VzZUZlYXR1cmVSZW1pbmRlcjpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0YW5kYXJkRW1haWxOb3RpZmljYXRpb24oY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQsIGNvdXJpZXJDbGllbnQsIGR5bmFtb0RiQ2xpZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgTm90aWZpY2F0aW9uVHlwZS5TcG91c2VGZWF0dXJlUmVtaW5kZXIpO1xuICAgICAgICAgICAgICAgIGNhc2UgTm90aWZpY2F0aW9uVHlwZS5GZWVkYmFja1RlbXBsYXRlXzFSZW1pbmRlcjpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0YW5kYXJkRW1haWxOb3RpZmljYXRpb24oY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQsIGNvdXJpZXJDbGllbnQsIGR5bmFtb0RiQ2xpZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgTm90aWZpY2F0aW9uVHlwZS5GZWVkYmFja1RlbXBsYXRlXzFSZW1pbmRlcik7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgbm90aWZpY2F0aW9uIHR5cGUgJHtjcmVhdGVOb3RpZmljYXRpb25JbnB1dC50eXBlfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyAke2ZpZWxkTmFtZX0gbXV0YXRpb24gJHtlcnJ9YDtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHVzZWQgZm9yIHN0YW5kYXJkIGVtYWlsIG5vdGlmaWNhdGlvbiByZW1pbmRlcnMuXG4gKlxuICogQHBhcmFtIGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0IGNyZWF0ZSBub3RpZmljYXRpb25zIGlucHV0IG9iamVjdCwgdXNlZCB0byBjcmVhdGUgYSBub3RpZmljYXRpb25cbiAqIGZvciBhIHVzZXIgY2FyZCBsaW5raW5nIHJlbWluZGVyLlxuICogQHBhcmFtIGNvdXJpZXJDbGllbnQgQ291cmllciBjbGllbnQgdXNlZCB0byBzZW5kIG5vdGlmaWNhdGlvbnNcbiAqIEBwYXJhbSBkeW5hbW9EYkNsaWVudCBEeW5hbW8gREIgY2xpZW50IHVzZWQgdG8gc3RvcmUgdGhlIG5vdGlmaWNhdGlvbiBpbnRlcm5hbGx5XG4gKiBAcGFyYW0gbm90aWZpY2F0aW9uVHlwZSB0eXBlIG9mIG5vdGlmaWNhdGlvbiBwYXNzZWQgaW4sIHVzZWQgdG8gZGV0ZXJtaW5lIHRoZSBzdGF0dXMgdXBkYXRlIHR5cGVzIHRoYXQgd2UgYXJlIHBlcmZvcm1pbmdcbiAqXG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIENyZWF0ZU5vdGlmaWNhdGlvblJlc3BvbnNlfVxuICovXG5jb25zdCBzdGFuZGFyZEVtYWlsTm90aWZpY2F0aW9uID0gYXN5bmMgKGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0OiBDcmVhdGVOb3RpZmljYXRpb25JbnB1dCwgY291cmllckNsaWVudDogQ291cmllckNsaWVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGR5bmFtb0RiQ2xpZW50OiBEeW5hbW9EQkNsaWVudCwgbm90aWZpY2F0aW9uVHlwZTogTm90aWZpY2F0aW9uVHlwZSk6IFByb21pc2U8Q3JlYXRlTm90aWZpY2F0aW9uUmVzcG9uc2U+ID0+IHtcbiAgICBjb25zb2xlLmxvZyhgU2VuZGluZyBzdGFuZGFyZCBlbWFpbCBub3RpZmljYXRpb24gcmVtaW5kZXIgZm9yICR7bm90aWZpY2F0aW9uVHlwZX1gKTtcbiAgICBzd2l0Y2ggKGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmNoYW5uZWxUeXBlKSB7XG4gICAgICAgIGNhc2UgTm90aWZpY2F0aW9uQ2hhbm5lbFR5cGUuRW1haWw6XG4gICAgICAgICAgICAvLyB2YWxpZGF0ZSB0aGF0IHdlIGhhdmUgdGhlIG5lY2Vzc2FyeSBpbmZvcm1hdGlvbiB0byBzZW5kIGFuIGVtYWlsXG4gICAgICAgICAgICBpZiAoY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuZW1haWxEZXN0aW5hdGlvbiAmJiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5lbWFpbERlc3RpbmF0aW9uLmxlbmd0aCAhPT0gMCAmJlxuICAgICAgICAgICAgICAgIGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnVzZXJGdWxsTmFtZSAmJiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC51c2VyRnVsbE5hbWUubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgLy8gYXR0ZW1wdCB0byBzZW5kIGFuIGVtYWlsIG5vdGlmaWNhdGlvbiBmaXJzdCB0aHJvdWdoIENvdXJpZXJcbiAgICAgICAgICAgICAgICBjb25zdCBzZW5kRW1haWxOb3RpZmljYXRpb25SZXNwb25zZTogTm90aWZpY2F0aW9uUmVzcG9uc2UgPSBhd2FpdCBjb3VyaWVyQ2xpZW50LnNlbmRFbWFpbE5vdGlmaWNhdGlvbih7XG4gICAgICAgICAgICAgICAgICAgIGVtYWlsRGVzdGluYXRpb246IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmVtYWlsRGVzdGluYXRpb24hLFxuICAgICAgICAgICAgICAgICAgICB1c2VyRnVsbE5hbWU6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnVzZXJGdWxsTmFtZSFcbiAgICAgICAgICAgICAgICB9LCBub3RpZmljYXRpb25UeXBlKTtcblxuICAgICAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGUgZW1haWwgbm90aWZpY2F0aW9uIHdhcyBzdWNjZXNzZnVsbHkgc2VudCBvciBub3RcbiAgICAgICAgICAgICAgICBpZiAoIXNlbmRFbWFpbE5vdGlmaWNhdGlvblJlc3BvbnNlIHx8IHNlbmRFbWFpbE5vdGlmaWNhdGlvblJlc3BvbnNlLmVycm9yTWVzc2FnZSB8fFxuICAgICAgICAgICAgICAgICAgICBzZW5kRW1haWxOb3RpZmljYXRpb25SZXNwb25zZS5lcnJvclR5cGUgfHwgIXNlbmRFbWFpbE5vdGlmaWNhdGlvblJlc3BvbnNlLnJlcXVlc3RJZCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgRW1haWwgbm90aWZpY2F0aW9uIHNlbmRpbmcgdGhyb3VnaCB0aGUgUE9TVCBDb3VyaWVyIHNlbmQgZW1haWwgbWVzc2FnZSBjYWxsIGZhaWxlZCAke0pTT04uc3RyaW5naWZ5KHNlbmRFbWFpbE5vdGlmaWNhdGlvblJlc3BvbnNlKX1gXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHNldCB0aGUgbm90aWZpY2F0aW9uIGlkLCBmcm9tIHRoZSBDb3VyaWVyIGNhbGwgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQubm90aWZpY2F0aW9uSWQgPSBzZW5kRW1haWxOb3RpZmljYXRpb25SZXNwb25zZS5yZXF1ZXN0SWQhO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIHN0b3JlIHRoZSBzdWNjZXNzZnVsbHkgc2VudCBub3RpZmljYXRpb24gb2JqZWN0XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IFB1dEl0ZW1Db21tYW5kKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuTk9USUZJQ0FUSU9OU19UQUJMRSEsXG4gICAgICAgICAgICAgICAgICAgICAgICBJdGVtOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuaWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBOOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC50aW1lc3RhbXAhLnRvU3RyaW5nKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbklkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0Lm5vdGlmaWNhdGlvbklkIVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW1haWxEZXN0aW5hdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5lbWFpbERlc3RpbmF0aW9uIVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlckZ1bGxOYW1lOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnVzZXJGdWxsTmFtZSFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1czoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5zdGF0dXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5uZWxUeXBlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmNoYW5uZWxUeXBlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5jcmVhdGVkQXQhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVkQXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQudXBkYXRlZEF0IVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uKGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmFjdGlvblVybCAmJiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvblVybDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuYWN0aW9uVXJsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgc3VjY2Vzc2Z1bGx5IHNlbnQgbm90aWZpY2F0aW9uIGluZm9ybWF0aW9uXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dCBhcyBOb3RpZmljYXRpb25cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYEludmFsaWQgaW5mb3JtYXRpb24gcGFzc2VkIGluLCB0byBwcm9jZXNzIGEgbm90aWZpY2F0aW9uIHRocm91Z2ggJHtjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5jaGFubmVsVHlwZX0sIGZvciBub3RpZmljYXRpb24gdHlwZSAke2NyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnR5cGV9YDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuc3VwcG9ydGVkIG5vdGlmaWNhdGlvbiBjaGFubmVsICR7Y3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuY2hhbm5lbFR5cGV9LCBmb3Igbm90aWZpY2F0aW9uIHR5cGUgJHtjcmVhdGVOb3RpZmljYXRpb25JbnB1dC50eXBlfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICB9XG4gICAgfVxufVxuXG5cblxuLyoqXG4gKiBGdW5jdGlvbiB1c2VkIGZvciBwdXNoIG5vdGlmaWNhdGlvbiByZW1pbmRlcnMuXG4gKlxuICogQHBhcmFtIGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0IGNyZWF0ZSBub3RpZmljYXRpb25zIGlucHV0IG9iamVjdCwgdXNlZCB0byBjcmVhdGUgYSBub3RpZmljYXRpb25cbiAqIGZvciBhIHVzZXIgY2FyZCBsaW5raW5nIHJlbWluZGVyLlxuICogQHBhcmFtIGNvdXJpZXJDbGllbnQgQ291cmllciBjbGllbnQgdXNlZCB0byBzZW5kIG5vdGlmaWNhdGlvbnNcbiAqIEBwYXJhbSBkeW5hbW9EYkNsaWVudCBEeW5hbW8gREIgY2xpZW50IHVzZWQgdG8gc3RvcmUgdGhlIG5vdGlmaWNhdGlvbiBpbnRlcm5hbGx5XG4gKiBAcGFyYW0gbm90aWZpY2F0aW9uVHlwZSB0eXBlIG9mIG5vdGlmaWNhdGlvbiBwYXNzZWQgaW4sIHVzZWQgdG8gZGV0ZXJtaW5lIHRoZSBzdGF0dXMgdXBkYXRlIHR5cGVzIHRoYXQgd2UgYXJlIHBlcmZvcm1pbmdcbiAqXG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIENyZWF0ZU5vdGlmaWNhdGlvblJlc3BvbnNlfVxuICovXG5jb25zdCBzdGFuZGFyZFB1c2hOb3RpZmljYXRpb24gPSBhc3luYyAoY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQ6IENyZWF0ZU5vdGlmaWNhdGlvbklucHV0LCBjb3VyaWVyQ2xpZW50OiBDb3VyaWVyQ2xpZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZHluYW1vRGJDbGllbnQ6IER5bmFtb0RCQ2xpZW50LCBub3RpZmljYXRpb25UeXBlOiBOb3RpZmljYXRpb25UeXBlKTogUHJvbWlzZTxDcmVhdGVOb3RpZmljYXRpb25SZXNwb25zZT4gPT4ge1xuICAgIGNvbnNvbGUubG9nKGBTZW5kaW5nIHN0YW5kYXJkIHB1c2ggbm90aWZpY2F0aW9uIHJlbWluZGVyIGZvciAke25vdGlmaWNhdGlvblR5cGV9YCk7XG4gICAgc3dpdGNoIChjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5jaGFubmVsVHlwZSkge1xuICAgICAgICBjYXNlIE5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlLlB1c2g6XG4gICAgICAgICAgICAvLyB2YWxpZGF0ZSB0aGF0IHdlIGhhdmUgdGhlIG5lY2Vzc2FyeSBpbmZvcm1hdGlvbiB0byBzZW5kIGEgbW9iaWxlIHB1c2hcbiAgICAgICAgICAgIGlmIChjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5leHBvUHVzaFRva2VucyAmJiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5leHBvUHVzaFRva2Vucy5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgICAgICAvLyBhdHRlbXB0IHRvIHNlbmQgYSBtb2JpbGUgcHVzaCBub3RpZmljYXRpb24gZmlyc3QgdGhyb3VnaCBDb3VyaWVyXG4gICAgICAgICAgICAgICAgY29uc3Qgc2VuZE1vYmlsZVB1c2hOb3RpZmljYXRpb25SZXNwb25zZTogTm90aWZpY2F0aW9uUmVzcG9uc2UgPSBhd2FpdCBjb3VyaWVyQ2xpZW50LnNlbmRNb2JpbGVQdXNoTm90aWZpY2F0aW9uKHtcbiAgICAgICAgICAgICAgICAgICAgZXhwb1B1c2hUb2tlbnM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmV4cG9QdXNoVG9rZW5zIVxuICAgICAgICAgICAgICAgIH0sIG5vdGlmaWNhdGlvblR5cGUpO1xuXG4gICAgICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSBtb2JpbGUgcHVzaCBub3RpZmljYXRpb24gd2FzIHN1Y2Nlc3NmdWxseSBzZW50IG9yIG5vdFxuICAgICAgICAgICAgICAgIGlmICghc2VuZE1vYmlsZVB1c2hOb3RpZmljYXRpb25SZXNwb25zZSB8fCBzZW5kTW9iaWxlUHVzaE5vdGlmaWNhdGlvblJlc3BvbnNlLmVycm9yTWVzc2FnZSB8fFxuICAgICAgICAgICAgICAgICAgICBzZW5kTW9iaWxlUHVzaE5vdGlmaWNhdGlvblJlc3BvbnNlLmVycm9yVHlwZSB8fCAhc2VuZE1vYmlsZVB1c2hOb3RpZmljYXRpb25SZXNwb25zZS5yZXF1ZXN0SWQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE1vYmlsZSBwdXNoIG5vdGlmaWNhdGlvbiBzZW5kaW5nIHRocm91Z2ggdGhlIFBPU1QgQ291cmllciBzZW5kIHB1c2ggbm90aWZpY2F0aW9uIG1lc3NhZ2UgY2FsbCBmYWlsZWQgJHtKU09OLnN0cmluZ2lmeShzZW5kTW9iaWxlUHVzaE5vdGlmaWNhdGlvblJlc3BvbnNlKX1gXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHNldCB0aGUgbm90aWZpY2F0aW9uIGlkLCBmcm9tIHRoZSBDb3VyaWVyIGNhbGwgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQubm90aWZpY2F0aW9uSWQgPSBzZW5kTW9iaWxlUHVzaE5vdGlmaWNhdGlvblJlc3BvbnNlLnJlcXVlc3RJZCE7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gY3JlYXRlIGEgRHluYW1vIERCIHN0cnVjdHVyZSBhcnJheSwgdG8gaG9sZCB0aGUgaW5jb21pbmcgZXhwbyBwdXNoIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBleHBvUHVzaFRva2VuczogQXR0cmlidXRlVmFsdWVbXSA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHB1c2hUb2tlbiBvZiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5leHBvUHVzaFRva2Vucykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXhwb1B1c2hUb2tlbnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b2tlbklkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBwdXNoVG9rZW4hXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIHN0b3JlIHRoZSBzdWNjZXNzZnVsbHkgc2VudCBub3RpZmljYXRpb24gb2JqZWN0XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IFB1dEl0ZW1Db21tYW5kKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuTk9USUZJQ0FUSU9OU19UQUJMRSEsXG4gICAgICAgICAgICAgICAgICAgICAgICBJdGVtOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuaWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBOOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC50aW1lc3RhbXAhLnRvU3RyaW5nKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbklkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0Lm5vdGlmaWNhdGlvbklkIVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwb1B1c2hUb2tlbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTDogZXhwb1B1c2hUb2tlbnNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1czoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5zdGF0dXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5uZWxUeXBlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmNoYW5uZWxUeXBlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5jcmVhdGVkQXQhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVkQXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQudXBkYXRlZEF0IVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uKGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmFjdGlvblVybCAmJiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvblVybDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuYWN0aW9uVXJsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgc3VjY2Vzc2Z1bGx5IHNlbnQgbm90aWZpY2F0aW9uIGluZm9ybWF0aW9uXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dCBhcyBOb3RpZmljYXRpb25cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYEludmFsaWQgaW5mb3JtYXRpb24gcGFzc2VkIGluLCB0byBwcm9jZXNzIGEgbm90aWZpY2F0aW9uIHRocm91Z2ggJHtjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5jaGFubmVsVHlwZX0sIGZvciBub3RpZmljYXRpb24gdHlwZSAke2NyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnR5cGV9YDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuc3VwcG9ydGVkIG5vdGlmaWNhdGlvbiBjaGFubmVsICR7Y3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuY2hhbm5lbFR5cGV9LCBmb3Igbm90aWZpY2F0aW9uIHR5cGUgJHtjcmVhdGVOb3RpZmljYXRpb25JbnB1dC50eXBlfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHVzZWQgZm9yIHN0YW5kYXJkIGVtYWlsIGFuZCBwdXNoIG5vdGlmaWNhdGlvbiByZW1pbmRlcnMuXG4gKlxuICogQHBhcmFtIGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0IGNyZWF0ZSBub3RpZmljYXRpb25zIGlucHV0IG9iamVjdCwgdXNlZCB0byBjcmVhdGUgYSBub3RpZmljYXRpb25cbiAqIGZvciBhIHVzZXIgY2FyZCBsaW5raW5nIHJlbWluZGVyLlxuICogQHBhcmFtIGNvdXJpZXJDbGllbnQgQ291cmllciBjbGllbnQgdXNlZCB0byBzZW5kIG5vdGlmaWNhdGlvbnNcbiAqIEBwYXJhbSBkeW5hbW9EYkNsaWVudCBEeW5hbW8gREIgY2xpZW50IHVzZWQgdG8gc3RvcmUgdGhlIG5vdGlmaWNhdGlvbiBpbnRlcm5hbGx5XG4gKiBAcGFyYW0gbm90aWZpY2F0aW9uVHlwZSB0eXBlIG9mIG5vdGlmaWNhdGlvbiBwYXNzZWQgaW4sIHVzZWQgdG8gZGV0ZXJtaW5lIHRoZSBzdGF0dXMgdXBkYXRlIHR5cGVzIHRoYXQgd2UgYXJlIHBlcmZvcm1pbmdcbiAqXG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIENyZWF0ZU5vdGlmaWNhdGlvblJlc3BvbnNlfVxuICovXG5jb25zdCBzdGFuZGFyZEVtYWlsQW5kUHVzaE5vdGlmaWNhdGlvbiA9IGFzeW5jIChjcmVhdGVOb3RpZmljYXRpb25JbnB1dDogQ3JlYXRlTm90aWZpY2F0aW9uSW5wdXQsIGNvdXJpZXJDbGllbnQ6IENvdXJpZXJDbGllbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkeW5hbW9EYkNsaWVudDogRHluYW1vREJDbGllbnQsIG5vdGlmaWNhdGlvblR5cGU6IE5vdGlmaWNhdGlvblR5cGUpOiBQcm9taXNlPENyZWF0ZU5vdGlmaWNhdGlvblJlc3BvbnNlPiA9PiB7XG4gICAgY29uc29sZS5sb2coYFNlbmRpbmcgc3RhbmRhcmQgZW1haWwgYW5kIHB1c2ggbm90aWZpY2F0aW9uIHJlbWluZGVyIGZvciAke25vdGlmaWNhdGlvblR5cGV9YCk7XG4gICAgc3dpdGNoIChjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5jaGFubmVsVHlwZSkge1xuICAgICAgICBjYXNlIE5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlLkVtYWlsOlxuICAgICAgICAgICAgLy8gdmFsaWRhdGUgdGhhdCB3ZSBoYXZlIHRoZSBuZWNlc3NhcnkgaW5mb3JtYXRpb24gdG8gc2VuZCBhbiBlbWFpbFxuICAgICAgICAgICAgaWYgKGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmVtYWlsRGVzdGluYXRpb24gJiYgY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuZW1haWxEZXN0aW5hdGlvbi5sZW5ndGggIT09IDAgJiZcbiAgICAgICAgICAgICAgICBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC51c2VyRnVsbE5hbWUgJiYgY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQudXNlckZ1bGxOYW1lLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgICAgIC8vIGF0dGVtcHQgdG8gc2VuZCBhbiBlbWFpbCBub3RpZmljYXRpb24gZmlyc3QgdGhyb3VnaCBDb3VyaWVyXG4gICAgICAgICAgICAgICAgY29uc3Qgc2VuZEVtYWlsTm90aWZpY2F0aW9uUmVzcG9uc2U6IE5vdGlmaWNhdGlvblJlc3BvbnNlID0gYXdhaXQgY291cmllckNsaWVudC5zZW5kRW1haWxOb3RpZmljYXRpb24oe1xuICAgICAgICAgICAgICAgICAgICBlbWFpbERlc3RpbmF0aW9uOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5lbWFpbERlc3RpbmF0aW9uISxcbiAgICAgICAgICAgICAgICAgICAgdXNlckZ1bGxOYW1lOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC51c2VyRnVsbE5hbWUhXG4gICAgICAgICAgICAgICAgfSwgbm90aWZpY2F0aW9uVHlwZSk7XG5cbiAgICAgICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIGVtYWlsIG5vdGlmaWNhdGlvbiB3YXMgc3VjY2Vzc2Z1bGx5IHNlbnQgb3Igbm90XG4gICAgICAgICAgICAgICAgaWYgKCFzZW5kRW1haWxOb3RpZmljYXRpb25SZXNwb25zZSB8fCBzZW5kRW1haWxOb3RpZmljYXRpb25SZXNwb25zZS5lcnJvck1lc3NhZ2UgfHxcbiAgICAgICAgICAgICAgICAgICAgc2VuZEVtYWlsTm90aWZpY2F0aW9uUmVzcG9uc2UuZXJyb3JUeXBlIHx8ICFzZW5kRW1haWxOb3RpZmljYXRpb25SZXNwb25zZS5yZXF1ZXN0SWQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYEVtYWlsIG5vdGlmaWNhdGlvbiBzZW5kaW5nIHRocm91Z2ggdGhlIFBPU1QgQ291cmllciBzZW5kIGVtYWlsIG1lc3NhZ2UgY2FsbCBmYWlsZWQgJHtKU09OLnN0cmluZ2lmeShzZW5kRW1haWxOb3RpZmljYXRpb25SZXNwb25zZSl9YFxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBzZXQgdGhlIG5vdGlmaWNhdGlvbiBpZCwgZnJvbSB0aGUgQ291cmllciBjYWxsIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0Lm5vdGlmaWNhdGlvbklkID0gc2VuZEVtYWlsTm90aWZpY2F0aW9uUmVzcG9uc2UucmVxdWVzdElkITtcblxuICAgICAgICAgICAgICAgICAgICAvLyBzdG9yZSB0aGUgc3VjY2Vzc2Z1bGx5IHNlbnQgbm90aWZpY2F0aW9uIG9iamVjdFxuICAgICAgICAgICAgICAgICAgICBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBQdXRJdGVtQ29tbWFuZCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52Lk5PVElGSUNBVElPTlNfVEFCTEUhLFxuICAgICAgICAgICAgICAgICAgICAgICAgSXRlbToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmlkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTjogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQudGltZXN0YW1wIS50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3RpZmljYXRpb25JZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5ub3RpZmljYXRpb25JZCFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVtYWlsRGVzdGluYXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuZW1haWxEZXN0aW5hdGlvbiFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJGdWxsTmFtZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC51c2VyRnVsbE5hbWUhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuc3RhdHVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFubmVsVHlwZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5jaGFubmVsVHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC50eXBlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuY3JlYXRlZEF0IVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlZEF0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnVwZGF0ZWRBdCFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLihjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5hY3Rpb25VcmwgJiYge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb25Vcmw6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmFjdGlvblVybFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIHN1Y2Nlc3NmdWxseSBzZW50IG5vdGlmaWNhdGlvbiBpbmZvcm1hdGlvblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQgYXMgTm90aWZpY2F0aW9uXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBJbnZhbGlkIGluZm9ybWF0aW9uIHBhc3NlZCBpbiwgdG8gcHJvY2VzcyBhIG5vdGlmaWNhdGlvbiB0aHJvdWdoICR7Y3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuY2hhbm5lbFR5cGV9LCBmb3Igbm90aWZpY2F0aW9uIHR5cGUgJHtjcmVhdGVOb3RpZmljYXRpb25JbnB1dC50eXBlfWA7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvclxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgY2FzZSBOb3RpZmljYXRpb25DaGFubmVsVHlwZS5QdXNoOlxuICAgICAgICAgICAgLy8gdmFsaWRhdGUgdGhhdCB3ZSBoYXZlIHRoZSBuZWNlc3NhcnkgaW5mb3JtYXRpb24gdG8gc2VuZCBhIG1vYmlsZSBwdXNoXG4gICAgICAgICAgICBpZiAoY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuZXhwb1B1c2hUb2tlbnMgJiYgY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuZXhwb1B1c2hUb2tlbnMubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgLy8gYXR0ZW1wdCB0byBzZW5kIGEgbW9iaWxlIHB1c2ggbm90aWZpY2F0aW9uIGZpcnN0IHRocm91Z2ggQ291cmllclxuICAgICAgICAgICAgICAgIGNvbnN0IHNlbmRNb2JpbGVQdXNoTm90aWZpY2F0aW9uUmVzcG9uc2U6IE5vdGlmaWNhdGlvblJlc3BvbnNlID0gYXdhaXQgY291cmllckNsaWVudC5zZW5kTW9iaWxlUHVzaE5vdGlmaWNhdGlvbih7XG4gICAgICAgICAgICAgICAgICAgIGV4cG9QdXNoVG9rZW5zOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5leHBvUHVzaFRva2VucyFcbiAgICAgICAgICAgICAgICB9LCBub3RpZmljYXRpb25UeXBlKTtcblxuICAgICAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGUgbW9iaWxlIHB1c2ggbm90aWZpY2F0aW9uIHdhcyBzdWNjZXNzZnVsbHkgc2VudCBvciBub3RcbiAgICAgICAgICAgICAgICBpZiAoIXNlbmRNb2JpbGVQdXNoTm90aWZpY2F0aW9uUmVzcG9uc2UgfHwgc2VuZE1vYmlsZVB1c2hOb3RpZmljYXRpb25SZXNwb25zZS5lcnJvck1lc3NhZ2UgfHxcbiAgICAgICAgICAgICAgICAgICAgc2VuZE1vYmlsZVB1c2hOb3RpZmljYXRpb25SZXNwb25zZS5lcnJvclR5cGUgfHwgIXNlbmRNb2JpbGVQdXNoTm90aWZpY2F0aW9uUmVzcG9uc2UucmVxdWVzdElkKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBNb2JpbGUgcHVzaCBub3RpZmljYXRpb24gc2VuZGluZyB0aHJvdWdoIHRoZSBQT1NUIENvdXJpZXIgc2VuZCBwdXNoIG5vdGlmaWNhdGlvbiBtZXNzYWdlIGNhbGwgZmFpbGVkICR7SlNPTi5zdHJpbmdpZnkoc2VuZE1vYmlsZVB1c2hOb3RpZmljYXRpb25SZXNwb25zZSl9YFxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBzZXQgdGhlIG5vdGlmaWNhdGlvbiBpZCwgZnJvbSB0aGUgQ291cmllciBjYWxsIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0Lm5vdGlmaWNhdGlvbklkID0gc2VuZE1vYmlsZVB1c2hOb3RpZmljYXRpb25SZXNwb25zZS5yZXF1ZXN0SWQhO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGNyZWF0ZSBhIER5bmFtbyBEQiBzdHJ1Y3R1cmUgYXJyYXksIHRvIGhvbGQgdGhlIGluY29taW5nIGV4cG8gcHVzaCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXhwb1B1c2hUb2tlbnM6IEF0dHJpYnV0ZVZhbHVlW10gPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBwdXNoVG9rZW4gb2YgY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuZXhwb1B1c2hUb2tlbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4cG9QdXNoVG9rZW5zLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE06IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW5JZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogcHVzaFRva2VuIVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBzdG9yZSB0aGUgc3VjY2Vzc2Z1bGx5IHNlbnQgbm90aWZpY2F0aW9uIG9iamVjdFxuICAgICAgICAgICAgICAgICAgICBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBQdXRJdGVtQ29tbWFuZCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52Lk5PVElGSUNBVElPTlNfVEFCTEUhLFxuICAgICAgICAgICAgICAgICAgICAgICAgSXRlbToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmlkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTjogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQudGltZXN0YW1wIS50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3RpZmljYXRpb25JZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5ub3RpZmljYXRpb25JZCFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cG9QdXNoVG9rZW5zOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEw6IGV4cG9QdXNoVG9rZW5zXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuc3RhdHVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFubmVsVHlwZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5jaGFubmVsVHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC50eXBlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuY3JlYXRlZEF0IVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlZEF0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnVwZGF0ZWRBdCFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLihjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5hY3Rpb25VcmwgJiYge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb25Vcmw6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmFjdGlvblVybFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIHN1Y2Nlc3NmdWxseSBzZW50IG5vdGlmaWNhdGlvbiBpbmZvcm1hdGlvblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQgYXMgTm90aWZpY2F0aW9uXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBJbnZhbGlkIGluZm9ybWF0aW9uIHBhc3NlZCBpbiwgdG8gcHJvY2VzcyBhIG5vdGlmaWNhdGlvbiB0aHJvdWdoICR7Y3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuY2hhbm5lbFR5cGV9LCBmb3Igbm90aWZpY2F0aW9uIHR5cGUgJHtjcmVhdGVOb3RpZmljYXRpb25JbnB1dC50eXBlfWA7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvclxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbnN1cHBvcnRlZCBub3RpZmljYXRpb24gY2hhbm5lbCAke2NyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmNoYW5uZWxUeXBlfSwgZm9yIG5vdGlmaWNhdGlvbiB0eXBlICR7Y3JlYXRlTm90aWZpY2F0aW9uSW5wdXQudHlwZX1gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvclxuICAgICAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB1c2VkIHRvIG5vdGlmeSB1c2VycyB3aGVuIHRoZXkgZ2V0IHRoZWlyIG1pbGl0YXJ5IHZlcmlmaWNhdGlvbiBzdGF0dXMgdXBkYXRlZC5cbiAqXG4gKiBAcGFyYW0gY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQgY3JlYXRlIG5vdGlmaWNhdGlvbnMgaW5wdXQgb2JqZWN0LCB1c2VkIHRvIGNyZWF0ZSBhIG5vdGlmaWNhdGlvblxuICogZm9yIGEgdXNlciBtaWxpdGFyeSB2ZXJpZmljYXRpb24gc3RhdHVzIHVwZGF0ZS5cbiAqIEBwYXJhbSBjb3VyaWVyQ2xpZW50IENvdXJpZXIgY2xpZW50IHVzZWQgdG8gc2VuZCBub3RpZmljYXRpb25zXG4gKiBAcGFyYW0gZHluYW1vRGJDbGllbnQgRHluYW1vIERCIGNsaWVudCB1c2VkIHRvIHN0b3JlIHRoZSBub3RpZmljYXRpb24gaW50ZXJuYWxseVxuICogQHBhcmFtIG5vdGlmaWNhdGlvblR5cGUgdHlwZSBvZiBub3RpZmljYXRpb24gcGFzc2VkIGluLCB1c2VkIHRvIGRldGVybWluZSB0aGUgc3RhdHVzIHVwZGF0ZSB0eXBlcyB0aGF0IHdlIGFyZSBwZXJmb3JtaW5nXG4gKlxuICogQHJldHVybnMge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBDcmVhdGVOb3RpZmljYXRpb25SZXNwb25zZX1cbiAqL1xuY29uc3QgbWlsaXRhcnlTdGF0dXNVcGRhdGVOb3RpZmljYXRpb24gPSBhc3luYyAoY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQ6IENyZWF0ZU5vdGlmaWNhdGlvbklucHV0LCBjb3VyaWVyQ2xpZW50OiBDb3VyaWVyQ2xpZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZHluYW1vRGJDbGllbnQ6IER5bmFtb0RCQ2xpZW50LCBub3RpZmljYXRpb25UeXBlOiBOb3RpZmljYXRpb25UeXBlKTogUHJvbWlzZTxDcmVhdGVOb3RpZmljYXRpb25SZXNwb25zZT4gPT4ge1xuICAgIGNvbnNvbGUubG9nKCdTZW5kaW5nIG1pbGl0YXJ5IHN0YXR1cyB1cGRhdGUgbm90aWZpY2F0aW9ucycpO1xuICAgIHN3aXRjaCAoY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuY2hhbm5lbFR5cGUpIHtcbiAgICAgICAgY2FzZSBOb3RpZmljYXRpb25DaGFubmVsVHlwZS5FbWFpbDpcbiAgICAgICAgICAgIC8vIHZhbGlkYXRlIHRoYXQgd2UgaGF2ZSB0aGUgbmVjZXNzYXJ5IGluZm9ybWF0aW9uIHRvIHNlbmQgYW4gZW1haWxcbiAgICAgICAgICAgIGlmIChjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5lbWFpbERlc3RpbmF0aW9uICYmIGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmVtYWlsRGVzdGluYXRpb24ubGVuZ3RoICE9PSAwICYmXG4gICAgICAgICAgICAgICAgY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQudXNlckZ1bGxOYW1lICYmIGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnVzZXJGdWxsTmFtZS5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgICAgICAvLyBhdHRlbXB0IHRvIHNlbmQgYW4gZW1haWwgbm90aWZpY2F0aW9uIGZpcnN0IHRocm91Z2ggQ291cmllclxuICAgICAgICAgICAgICAgIGNvbnN0IHNlbmRFbWFpbE5vdGlmaWNhdGlvblJlc3BvbnNlOiBOb3RpZmljYXRpb25SZXNwb25zZSA9IGF3YWl0IGNvdXJpZXJDbGllbnQuc2VuZEVtYWlsTm90aWZpY2F0aW9uKHtcbiAgICAgICAgICAgICAgICAgICAgZW1haWxEZXN0aW5hdGlvbjogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuZW1haWxEZXN0aW5hdGlvbiEsXG4gICAgICAgICAgICAgICAgICAgIHVzZXJGdWxsTmFtZTogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQudXNlckZ1bGxOYW1lIVxuICAgICAgICAgICAgICAgIH0sIG5vdGlmaWNhdGlvblR5cGUpO1xuXG4gICAgICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSBlbWFpbCBub3RpZmljYXRpb24gd2FzIHN1Y2Nlc3NmdWxseSBzZW50IG9yIG5vdFxuICAgICAgICAgICAgICAgIGlmICghc2VuZEVtYWlsTm90aWZpY2F0aW9uUmVzcG9uc2UgfHwgc2VuZEVtYWlsTm90aWZpY2F0aW9uUmVzcG9uc2UuZXJyb3JNZXNzYWdlIHx8XG4gICAgICAgICAgICAgICAgICAgIHNlbmRFbWFpbE5vdGlmaWNhdGlvblJlc3BvbnNlLmVycm9yVHlwZSB8fCAhc2VuZEVtYWlsTm90aWZpY2F0aW9uUmVzcG9uc2UucmVxdWVzdElkKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBFbWFpbCBub3RpZmljYXRpb24gc2VuZGluZyB0aHJvdWdoIHRoZSBQT1NUIENvdXJpZXIgc2VuZCBlbWFpbCBtZXNzYWdlIGNhbGwgZmFpbGVkICR7SlNPTi5zdHJpbmdpZnkoc2VuZEVtYWlsTm90aWZpY2F0aW9uUmVzcG9uc2UpfWBcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gc2V0IHRoZSBub3RpZmljYXRpb24gaWQsIGZyb20gdGhlIENvdXJpZXIgY2FsbCByZXNwb25zZVxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5ub3RpZmljYXRpb25JZCA9IHNlbmRFbWFpbE5vdGlmaWNhdGlvblJlc3BvbnNlLnJlcXVlc3RJZCE7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gc3RvcmUgdGhlIHN1Y2Nlc3NmdWxseSBzZW50IG5vdGlmaWNhdGlvbiBvYmplY3RcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgZHluYW1vRGJDbGllbnQuc2VuZChuZXcgUHV0SXRlbUNvbW1hbmQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5OT1RJRklDQVRJT05TX1RBQkxFISxcbiAgICAgICAgICAgICAgICAgICAgICAgIEl0ZW06IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5pZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE46IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnRpbWVzdGFtcCEudG9TdHJpbmcoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uSWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQubm90aWZpY2F0aW9uSWQhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbWFpbERlc3RpbmF0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmVtYWlsRGVzdGluYXRpb24hXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VyRnVsbE5hbWU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQudXNlckZ1bGxOYW1lIVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnN0YXR1c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhbm5lbFR5cGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuY2hhbm5lbFR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQudHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEF0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmNyZWF0ZWRBdCFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRBdDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC51cGRhdGVkQXQhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi4oY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuYWN0aW9uVXJsICYmIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uVXJsOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5hY3Rpb25VcmxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBzdWNjZXNzZnVsbHkgc2VudCBub3RpZmljYXRpb24gaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0IGFzIE5vdGlmaWNhdGlvblxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgSW52YWxpZCBpbmZvcm1hdGlvbiBwYXNzZWQgaW4sIHRvIHByb2Nlc3MgYSBub3RpZmljYXRpb24gdGhyb3VnaCAke2NyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmNoYW5uZWxUeXBlfSwgZm9yIG5vdGlmaWNhdGlvbiB0eXBlICR7Y3JlYXRlTm90aWZpY2F0aW9uSW5wdXQudHlwZX1gO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIGNhc2UgTm90aWZpY2F0aW9uQ2hhbm5lbFR5cGUuUHVzaDpcbiAgICAgICAgICAgIC8vIHZhbGlkYXRlIHRoYXQgd2UgaGF2ZSB0aGUgbmVjZXNzYXJ5IGluZm9ybWF0aW9uIHRvIHNlbmQgYSBtb2JpbGUgcHVzaFxuICAgICAgICAgICAgaWYgKGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmV4cG9QdXNoVG9rZW5zICYmIGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmV4cG9QdXNoVG9rZW5zLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgICAgIC8vIGF0dGVtcHQgdG8gc2VuZCBhIG1vYmlsZSBwdXNoIG5vdGlmaWNhdGlvbiBmaXJzdCB0aHJvdWdoIENvdXJpZXJcbiAgICAgICAgICAgICAgICBjb25zdCBzZW5kTW9iaWxlUHVzaE5vdGlmaWNhdGlvblJlc3BvbnNlOiBOb3RpZmljYXRpb25SZXNwb25zZSA9IGF3YWl0IGNvdXJpZXJDbGllbnQuc2VuZE1vYmlsZVB1c2hOb3RpZmljYXRpb24oe1xuICAgICAgICAgICAgICAgICAgICBleHBvUHVzaFRva2VuczogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuZXhwb1B1c2hUb2tlbnMhXG4gICAgICAgICAgICAgICAgfSwgbm90aWZpY2F0aW9uVHlwZSk7XG5cbiAgICAgICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIG1vYmlsZSBwdXNoIG5vdGlmaWNhdGlvbiB3YXMgc3VjY2Vzc2Z1bGx5IHNlbnQgb3Igbm90XG4gICAgICAgICAgICAgICAgaWYgKCFzZW5kTW9iaWxlUHVzaE5vdGlmaWNhdGlvblJlc3BvbnNlIHx8IHNlbmRNb2JpbGVQdXNoTm90aWZpY2F0aW9uUmVzcG9uc2UuZXJyb3JNZXNzYWdlIHx8XG4gICAgICAgICAgICAgICAgICAgIHNlbmRNb2JpbGVQdXNoTm90aWZpY2F0aW9uUmVzcG9uc2UuZXJyb3JUeXBlIHx8ICFzZW5kTW9iaWxlUHVzaE5vdGlmaWNhdGlvblJlc3BvbnNlLnJlcXVlc3RJZCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTW9iaWxlIHB1c2ggbm90aWZpY2F0aW9uIHNlbmRpbmcgdGhyb3VnaCB0aGUgUE9TVCBDb3VyaWVyIHNlbmQgcHVzaCBub3RpZmljYXRpb24gbWVzc2FnZSBjYWxsIGZhaWxlZCAke0pTT04uc3RyaW5naWZ5KHNlbmRNb2JpbGVQdXNoTm90aWZpY2F0aW9uUmVzcG9uc2UpfWBcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gc2V0IHRoZSBub3RpZmljYXRpb24gaWQsIGZyb20gdGhlIENvdXJpZXIgY2FsbCByZXNwb25zZVxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5ub3RpZmljYXRpb25JZCA9IHNlbmRNb2JpbGVQdXNoTm90aWZpY2F0aW9uUmVzcG9uc2UucmVxdWVzdElkITtcblxuICAgICAgICAgICAgICAgICAgICAvLyBjcmVhdGUgYSBEeW5hbW8gREIgc3RydWN0dXJlIGFycmF5LCB0byBob2xkIHRoZSBpbmNvbWluZyBleHBvIHB1c2ggdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGV4cG9QdXNoVG9rZW5zOiBBdHRyaWJ1dGVWYWx1ZVtdID0gW107XG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgcHVzaFRva2VuIG9mIGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmV4cG9QdXNoVG9rZW5zKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBleHBvUHVzaFRva2Vucy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRva2VuSWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IHB1c2hUb2tlbiFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gc3RvcmUgdGhlIHN1Y2Nlc3NmdWxseSBzZW50IG5vdGlmaWNhdGlvbiBvYmplY3RcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgZHluYW1vRGJDbGllbnQuc2VuZChuZXcgUHV0SXRlbUNvbW1hbmQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5OT1RJRklDQVRJT05TX1RBQkxFISxcbiAgICAgICAgICAgICAgICAgICAgICAgIEl0ZW06IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5pZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE46IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnRpbWVzdGFtcCEudG9TdHJpbmcoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uSWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQubm90aWZpY2F0aW9uSWQhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHBvUHVzaFRva2Vuczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBMOiBleHBvUHVzaFRva2Vuc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnN0YXR1c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhbm5lbFR5cGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuY2hhbm5lbFR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQudHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEF0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmNyZWF0ZWRBdCFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRBdDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC51cGRhdGVkQXQhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi4oY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuYWN0aW9uVXJsICYmIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uVXJsOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5hY3Rpb25VcmxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBzdWNjZXNzZnVsbHkgc2VudCBub3RpZmljYXRpb24gaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0IGFzIE5vdGlmaWNhdGlvblxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgSW52YWxpZCBpbmZvcm1hdGlvbiBwYXNzZWQgaW4sIHRvIHByb2Nlc3MgYSBub3RpZmljYXRpb24gdGhyb3VnaCAke2NyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmNoYW5uZWxUeXBlfSwgZm9yIG5vdGlmaWNhdGlvbiB0eXBlICR7Y3JlYXRlTm90aWZpY2F0aW9uSW5wdXQudHlwZX1gO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5zdXBwb3J0ZWQgbm90aWZpY2F0aW9uIGNoYW5uZWwgJHtjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5jaGFubmVsVHlwZX0sIGZvciBub3RpZmljYXRpb24gdHlwZSAke2NyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnR5cGV9YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdXNlZCB0byBub3RpZnkgdXNlcnMgd2hlbiB0aGV5IHN1Y2Nlc3NmdWxseSBxdWFsaWZ5IGZvciBhbiBvZmZlci5cbiAqXG4gKiBAcGFyYW0gY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQgY3JlYXRlIG5vdGlmaWNhdGlvbnMgaW5wdXQgb2JqZWN0LCB1c2VkIHRvIGNyZWF0ZSBhIG5vdGlmaWNhdGlvblxuICogZm9yIGEgbmV3IHVzZXIgcXVhbGlmeWluZyBvZmZlci5cbiAqIEBwYXJhbSBjb3VyaWVyQ2xpZW50IENvdXJpZXIgY2xpZW50IHVzZWQgdG8gc2VuZCBub3RpZmljYXRpb25zXG4gKiBAcGFyYW0gZHluYW1vRGJDbGllbnQgRHluYW1vIERCIGNsaWVudCB1c2VkIHRvIHN0b3JlIHRoZSBub3RpZmljYXRpb24gaW50ZXJuYWxseVxuICpcbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgQ3JlYXRlTm90aWZpY2F0aW9uUmVzcG9uc2V9XG4gKi9cbmNvbnN0IG5ld1VzZXJRdWFsaWZ5aW5nT2ZmZXJOb3RpZmljYXRpb24gPSBhc3luYyAoY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQ6IENyZWF0ZU5vdGlmaWNhdGlvbklucHV0LCBjb3VyaWVyQ2xpZW50OiBDb3VyaWVyQ2xpZW50LCBkeW5hbW9EYkNsaWVudDogRHluYW1vREJDbGllbnQpOiBQcm9taXNlPENyZWF0ZU5vdGlmaWNhdGlvblJlc3BvbnNlPiA9PiB7XG4gICAgY29uc29sZS5sb2coJ1NlbmRpbmcgbmV3IHVzZXIgcXVhbGlmeWluZyBvZmZlciBub3RpZmljYXRpb25zJyk7XG4gICAgc3dpdGNoIChjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5jaGFubmVsVHlwZSkge1xuICAgICAgICBjYXNlIE5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlLlB1c2g6XG4gICAgICAgICAgICAvLyB2YWxpZGF0ZSB0aGF0IHdlIGhhdmUgdGhlIG5lY2Vzc2FyeSBpbmZvcm1hdGlvbiB0byBzZW5kIGEgbW9iaWxlIHB1c2hcbiAgICAgICAgICAgIGlmIChjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5leHBvUHVzaFRva2VucyAmJiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5leHBvUHVzaFRva2Vucy5sZW5ndGggIT09IDAgJiZcbiAgICAgICAgICAgICAgICBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5wZW5kaW5nQ2FzaGJhY2sgJiYgY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQubWVyY2hhbnROYW1lICYmIGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0Lm1lcmNoYW50TmFtZS5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgICAgICAvLyBhdHRlbXB0IHRvIHNlbmQgYSBtb2JpbGUgcHVzaCBub3RpZmljYXRpb24gZmlyc3QgdGhyb3VnaCBDb3VyaWVyXG4gICAgICAgICAgICAgICAgY29uc3Qgc2VuZE1vYmlsZVB1c2hOb3RpZmljYXRpb25SZXNwb25zZTogTm90aWZpY2F0aW9uUmVzcG9uc2UgPSBhd2FpdCBjb3VyaWVyQ2xpZW50LnNlbmRNb2JpbGVQdXNoTm90aWZpY2F0aW9uKHtcbiAgICAgICAgICAgICAgICAgICAgZXhwb1B1c2hUb2tlbnM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmV4cG9QdXNoVG9rZW5zISxcbiAgICAgICAgICAgICAgICAgICAgbWVyY2hhbnROYW1lOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5tZXJjaGFudE5hbWUhLFxuICAgICAgICAgICAgICAgICAgICBwZW5kaW5nQ2FzaGJhY2s6IE51bWJlcihjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5wZW5kaW5nQ2FzaGJhY2shLnRvRml4ZWQoMikpXG4gICAgICAgICAgICAgICAgfSwgTm90aWZpY2F0aW9uVHlwZS5OZXdRdWFsaWZ5aW5nT2ZmZXJBdmFpbGFibGUpO1xuXG4gICAgICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSBtb2JpbGUgcHVzaCBub3RpZmljYXRpb24gd2FzIHN1Y2Nlc3NmdWxseSBzZW50IG9yIG5vdFxuICAgICAgICAgICAgICAgIGlmICghc2VuZE1vYmlsZVB1c2hOb3RpZmljYXRpb25SZXNwb25zZSB8fCBzZW5kTW9iaWxlUHVzaE5vdGlmaWNhdGlvblJlc3BvbnNlLmVycm9yTWVzc2FnZSB8fFxuICAgICAgICAgICAgICAgICAgICBzZW5kTW9iaWxlUHVzaE5vdGlmaWNhdGlvblJlc3BvbnNlLmVycm9yVHlwZSB8fCAhc2VuZE1vYmlsZVB1c2hOb3RpZmljYXRpb25SZXNwb25zZS5yZXF1ZXN0SWQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE1vYmlsZSBwdXNoIG5vdGlmaWNhdGlvbiBzZW5kaW5nIHRocm91Z2ggdGhlIFBPU1QgQ291cmllciBzZW5kIHB1c2ggbm90aWZpY2F0aW9uIG1lc3NhZ2UgY2FsbCBmYWlsZWQgJHtKU09OLnN0cmluZ2lmeShzZW5kTW9iaWxlUHVzaE5vdGlmaWNhdGlvblJlc3BvbnNlKX1gXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHNldCB0aGUgbm90aWZpY2F0aW9uIGlkLCBmcm9tIHRoZSBDb3VyaWVyIGNhbGwgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQubm90aWZpY2F0aW9uSWQgPSBzZW5kTW9iaWxlUHVzaE5vdGlmaWNhdGlvblJlc3BvbnNlLnJlcXVlc3RJZCE7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gY3JlYXRlIGEgRHluYW1vIERCIHN0cnVjdHVyZSBhcnJheSwgdG8gaG9sZCB0aGUgaW5jb21pbmcgZXhwbyBwdXNoIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBleHBvUHVzaFRva2VuczogQXR0cmlidXRlVmFsdWVbXSA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHB1c2hUb2tlbiBvZiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5leHBvUHVzaFRva2Vucykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXhwb1B1c2hUb2tlbnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b2tlbklkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBwdXNoVG9rZW4hXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIHN0b3JlIHRoZSBzdWNjZXNzZnVsbHkgc2VudCBub3RpZmljYXRpb24gb2JqZWN0XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IFB1dEl0ZW1Db21tYW5kKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuTk9USUZJQ0FUSU9OU19UQUJMRSEsXG4gICAgICAgICAgICAgICAgICAgICAgICBJdGVtOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuaWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBOOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC50aW1lc3RhbXAhLnRvU3RyaW5nKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbklkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0Lm5vdGlmaWNhdGlvbklkIVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwb1B1c2hUb2tlbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTDogZXhwb1B1c2hUb2tlbnNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1czoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5zdGF0dXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5uZWxUeXBlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmNoYW5uZWxUeXBlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5jcmVhdGVkQXQhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVkQXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQudXBkYXRlZEF0IVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uKGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmFjdGlvblVybCAmJiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvblVybDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuYWN0aW9uVXJsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgc3VjY2Vzc2Z1bGx5IHNlbnQgbm90aWZpY2F0aW9uIGluZm9ybWF0aW9uXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dCBhcyBOb3RpZmljYXRpb25cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYEludmFsaWQgaW5mb3JtYXRpb24gcGFzc2VkIGluLCB0byBwcm9jZXNzIGEgbm90aWZpY2F0aW9uIHRocm91Z2ggJHtjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5jaGFubmVsVHlwZX0sIGZvciBub3RpZmljYXRpb24gdHlwZSAke2NyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnR5cGV9YDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuc3VwcG9ydGVkIG5vdGlmaWNhdGlvbiBjaGFubmVsICR7Y3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuY2hhbm5lbFR5cGV9LCBmb3Igbm90aWZpY2F0aW9uIHR5cGUgJHtjcmVhdGVOb3RpZmljYXRpb25JbnB1dC50eXBlfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHVzZWQgdG8gbm90aWZ5IHVzZXJzIHdoZW4gdGhleSBzdWNjZXNzZnVsbHkgY29tcGxldGUgYSBzaWdudXAgcHJvY2Vzcy5cbiAqXG4gKiBAcGFyYW0gY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQgY3JlYXRlIG5vdGlmaWNhdGlvbnMgaW5wdXQgb2JqZWN0LCB1c2VkIHRvIGNyZWF0ZSBhIG5vdGlmaWNhdGlvblxuICogZm9yIGEgbmV3IHVzZXIgc2lnbnVwL3JlZ2lzdHJhdGlvbiBldmVudC5cbiAqIEBwYXJhbSBjb3VyaWVyQ2xpZW50IENvdXJpZXIgY2xpZW50IHVzZWQgdG8gc2VuZCBub3RpZmljYXRpb25zXG4gKiBAcGFyYW0gZHluYW1vRGJDbGllbnQgRHluYW1vIERCIGNsaWVudCB1c2VkIHRvIHN0b3JlIHRoZSBub3RpZmljYXRpb24gaW50ZXJuYWxseVxuICpcbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgQ3JlYXRlTm90aWZpY2F0aW9uUmVzcG9uc2V9XG4gKi9cbmNvbnN0IG5ld1VzZXJTaWduVXBOb3RpZmljYXRpb24gPSBhc3luYyAoY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQ6IENyZWF0ZU5vdGlmaWNhdGlvbklucHV0LCBjb3VyaWVyQ2xpZW50OiBDb3VyaWVyQ2xpZW50LCBkeW5hbW9EYkNsaWVudDogRHluYW1vREJDbGllbnQpOiBQcm9taXNlPENyZWF0ZU5vdGlmaWNhdGlvblJlc3BvbnNlPiA9PiB7XG4gICAgY29uc29sZS5sb2coJ1NlbmRpbmcgbmV3IHVzZXIgc2lnbnVwIG5vdGlmaWNhdGlvbnMnKTtcbiAgICBzd2l0Y2ggKGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmNoYW5uZWxUeXBlKSB7XG4gICAgICAgIGNhc2UgTm90aWZpY2F0aW9uQ2hhbm5lbFR5cGUuRW1haWw6XG4gICAgICAgICAgICAvLyB2YWxpZGF0ZSB0aGF0IHdlIGhhdmUgdGhlIG5lY2Vzc2FyeSBpbmZvcm1hdGlvbiB0byBzZW5kIGFuIGVtYWlsXG4gICAgICAgICAgICBpZiAoY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuZW1haWxEZXN0aW5hdGlvbiAmJiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5lbWFpbERlc3RpbmF0aW9uLmxlbmd0aCAhPT0gMCAmJlxuICAgICAgICAgICAgICAgIGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnVzZXJGdWxsTmFtZSAmJiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC51c2VyRnVsbE5hbWUubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgLy8gYXR0ZW1wdCB0byBzZW5kIGFuIGVtYWlsIG5vdGlmaWNhdGlvbiBmaXJzdCB0aHJvdWdoIENvdXJpZXJcbiAgICAgICAgICAgICAgICBjb25zdCBzZW5kRW1haWxOb3RpZmljYXRpb25SZXNwb25zZTogTm90aWZpY2F0aW9uUmVzcG9uc2UgPSBhd2FpdCBjb3VyaWVyQ2xpZW50LnNlbmRFbWFpbE5vdGlmaWNhdGlvbih7XG4gICAgICAgICAgICAgICAgICAgIGVtYWlsRGVzdGluYXRpb246IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmVtYWlsRGVzdGluYXRpb24hLFxuICAgICAgICAgICAgICAgICAgICB1c2VyRnVsbE5hbWU6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnVzZXJGdWxsTmFtZSFcbiAgICAgICAgICAgICAgICB9LCBOb3RpZmljYXRpb25UeXBlLk5ld1VzZXJTaWdudXApO1xuXG4gICAgICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSBlbWFpbCBub3RpZmljYXRpb24gd2FzIHN1Y2Nlc3NmdWxseSBzZW50IG9yIG5vdFxuICAgICAgICAgICAgICAgIGlmICghc2VuZEVtYWlsTm90aWZpY2F0aW9uUmVzcG9uc2UgfHwgc2VuZEVtYWlsTm90aWZpY2F0aW9uUmVzcG9uc2UuZXJyb3JNZXNzYWdlIHx8XG4gICAgICAgICAgICAgICAgICAgIHNlbmRFbWFpbE5vdGlmaWNhdGlvblJlc3BvbnNlLmVycm9yVHlwZSB8fCAhc2VuZEVtYWlsTm90aWZpY2F0aW9uUmVzcG9uc2UucmVxdWVzdElkKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBFbWFpbCBub3RpZmljYXRpb24gc2VuZGluZyB0aHJvdWdoIHRoZSBQT1NUIENvdXJpZXIgc2VuZCBlbWFpbCBtZXNzYWdlIGNhbGwgZmFpbGVkICR7SlNPTi5zdHJpbmdpZnkoc2VuZEVtYWlsTm90aWZpY2F0aW9uUmVzcG9uc2UpfWBcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gc2V0IHRoZSBub3RpZmljYXRpb24gaWQsIGZyb20gdGhlIENvdXJpZXIgY2FsbCByZXNwb25zZVxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5ub3RpZmljYXRpb25JZCA9IHNlbmRFbWFpbE5vdGlmaWNhdGlvblJlc3BvbnNlLnJlcXVlc3RJZCE7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gc3RvcmUgdGhlIHN1Y2Nlc3NmdWxseSBzZW50IG5vdGlmaWNhdGlvbiBvYmplY3RcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgZHluYW1vRGJDbGllbnQuc2VuZChuZXcgUHV0SXRlbUNvbW1hbmQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5OT1RJRklDQVRJT05TX1RBQkxFISxcbiAgICAgICAgICAgICAgICAgICAgICAgIEl0ZW06IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5pZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE46IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnRpbWVzdGFtcCEudG9TdHJpbmcoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uSWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQubm90aWZpY2F0aW9uSWQhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbWFpbERlc3RpbmF0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmVtYWlsRGVzdGluYXRpb24hXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VyRnVsbE5hbWU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQudXNlckZ1bGxOYW1lIVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnN0YXR1c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhbm5lbFR5cGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuY2hhbm5lbFR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQudHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEF0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmNyZWF0ZWRBdCFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRBdDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC51cGRhdGVkQXQhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi4oY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuYWN0aW9uVXJsICYmIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uVXJsOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5hY3Rpb25VcmxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBzdWNjZXNzZnVsbHkgc2VudCBub3RpZmljYXRpb24gaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0IGFzIE5vdGlmaWNhdGlvblxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgSW52YWxpZCBpbmZvcm1hdGlvbiBwYXNzZWQgaW4sIHRvIHByb2Nlc3MgYSBub3RpZmljYXRpb24gdGhyb3VnaCAke2NyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmNoYW5uZWxUeXBlfSwgZm9yIG5vdGlmaWNhdGlvbiB0eXBlICR7Y3JlYXRlTm90aWZpY2F0aW9uSW5wdXQudHlwZX1gO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5zdXBwb3J0ZWQgbm90aWZpY2F0aW9uIGNoYW5uZWwgJHtjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5jaGFubmVsVHlwZX0sIGZvciBub3RpZmljYXRpb24gdHlwZSAke2NyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnR5cGV9YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgIH1cbiAgICB9XG59XG4iXX0=