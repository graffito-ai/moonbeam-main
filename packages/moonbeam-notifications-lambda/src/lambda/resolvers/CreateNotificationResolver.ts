import {AttributeValue, DynamoDBClient, GetItemCommand, PutItemCommand} from "@aws-sdk/client-dynamodb";
import {
    CourierClient,
    CreateNotificationInput,
    CreateNotificationResponse,
    Notification,
    NotificationChannelType,
    NotificationResponse,
    NotificationsErrorType,
    NotificationType
} from "@moonbeam/moonbeam-models";

/**
 * CreateNotification resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param createNotificationInput create notifications input object, used to create a notification
 * based on an event (reimbursement, transaction, card expiration, successful registration).
 * @returns {@link Promise} of {@link CreateNotificationResponse}
 */
export const createNotification = async (fieldName: string, createNotificationInput: CreateNotificationInput): Promise<CreateNotificationResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initializing the DynamoDB document client
        const dynamoDbClient = new DynamoDBClient({region: region});

        // update the timestamps accordingly
        const createdAt = new Date().toISOString();
        createNotificationInput.timestamp = createNotificationInput.timestamp ? createNotificationInput.timestamp : Date.parse(createdAt);
        createNotificationInput.createdAt = createNotificationInput.createdAt ? createNotificationInput.createdAt : createdAt;
        createNotificationInput.updatedAt = createNotificationInput.updatedAt ? createNotificationInput.updatedAt : createdAt;

        /**
         * check to see if the same notifications already exists in the DB. Although this is a very rare situation (if at all),
         * we want to put a safeguard around duplicates even here.
         */
        const preExistingNotification = await dynamoDbClient.send(new GetItemCommand({
            TableName: process.env.NOTIFICATIONS_TABLE!,
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
                errorType: NotificationsErrorType.DuplicateObjectFound
            }
        } else {
            /**
             * first, we need to call the appropriate Courier API (with the appropriate implementation), depending on the Notification
             * type, as well as the channel, to be passed in.
             *
             * initialize the Courier Client API here, in order to call the appropriate endpoints for this handler
             */
            const courierClient = new CourierClient(process.env.ENV_NAME!, region);
            // switch based on the type first
            switch (createNotificationInput.type) {
                case NotificationType.NewUserSignup:
                    // for each notification type, depending on the notification channel, determine how to structure the notification
                    if (createNotificationInput.channelType === NotificationChannelType.Email) {
                        // validate that we have the necessary information to send an email
                        if (createNotificationInput.emailDestination && createNotificationInput.emailDestination.length !== 0 &&
                            createNotificationInput.userFullName && createNotificationInput.userFullName.length !== 0) {
                            // attempt to send an email notification first through Courier
                            const sendEmailNotificationResponse: NotificationResponse = await courierClient.sendEmailNotification({
                                emailDestination: createNotificationInput.emailDestination!,
                                userFullName: createNotificationInput.userFullName!
                            });

                            // check to see if the email notification was successfully sent or not
                            if (!sendEmailNotificationResponse || sendEmailNotificationResponse.errorMessage ||
                                sendEmailNotificationResponse.errorType || !sendEmailNotificationResponse.requestId) {
                                const errorMessage = `Email notification sending through the POST Courier send email message call failed ${JSON.stringify(sendEmailNotificationResponse)}`
                                console.log(errorMessage);
                                return {
                                    errorMessage: errorMessage,
                                    errorType: NotificationsErrorType.UnexpectedError
                                }
                            } else {
                                // set the notification id, from the Courier call response
                                createNotificationInput.notificationId = sendEmailNotificationResponse.requestId!;

                                // store the successfully sent notification object
                                await dynamoDbClient.send(new PutItemCommand({
                                    TableName: process.env.NOTIFICATIONS_TABLE!,
                                    Item: {
                                        id: {
                                            S: createNotificationInput.id
                                        },
                                        timestamp: {
                                            N: createNotificationInput.timestamp.toString()
                                        },
                                        notificationId: {
                                            S: createNotificationInput.notificationId!
                                        },
                                        emailDestination: {
                                            S: createNotificationInput.emailDestination!
                                        },
                                        userFullName: {
                                            S: createNotificationInput.userFullName!
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
                                    data: createNotificationInput as Notification
                                }
                            }
                        } else {
                            const errorMessage = `Invalid information passed in, to process a notification through ${createNotificationInput.channelType}, for notification type ${createNotificationInput.type}`;
                            console.log(errorMessage);
                            return {
                                errorMessage: errorMessage,
                                errorType: NotificationsErrorType.ValidationError
                            }
                        }
                    } else {
                        const errorMessage = `Unsupported notification channel ${createNotificationInput.channelType}, for notification type ${createNotificationInput.type}`;
                        console.log(errorMessage);
                        return {
                            errorMessage: errorMessage,
                            errorType: NotificationsErrorType.ValidationError
                        }
                    }
                case NotificationType.NewQualifyingOfferAvailable:
                    // for each notification type, depending on the notification channel, determine how to structure the notification
                    if (createNotificationInput.channelType === NotificationChannelType.Push) {
                        // validate that we have the necessary information to send a mobile push
                        if (createNotificationInput.expoPushTokens && createNotificationInput.expoPushTokens.length !== 0 &&
                            createNotificationInput.pendingCashback && createNotificationInput.merchantName && createNotificationInput.merchantName.length !== 0) {
                            // attempt to send a mobile push notification first through Courier
                            const sendMobilePushNotificationResponse: NotificationResponse = await courierClient.sendMobilePushNotification({
                                expoPushTokens: createNotificationInput.expoPushTokens!,
                                merchantName: createNotificationInput.merchantName!,
                                pendingCashback: createNotificationInput.pendingCashback!
                            });

                            // check to see if the mobile push notification was successfully sent or not
                            if (!sendMobilePushNotificationResponse || sendMobilePushNotificationResponse.errorMessage ||
                                sendMobilePushNotificationResponse.errorType || !sendMobilePushNotificationResponse.requestId) {
                                const errorMessage = `Mobile push notification sending through the POST Courier send push notification message call failed ${JSON.stringify(sendMobilePushNotificationResponse)}`
                                console.log(errorMessage);
                                return {
                                    errorMessage: errorMessage,
                                    errorType: NotificationsErrorType.UnexpectedError
                                }
                            } else {
                                // set the notification id, from the Courier call response
                                createNotificationInput.notificationId = sendMobilePushNotificationResponse.requestId!;

                                // create a Dynamo DB structure array, to hold the incoming expo push tokens
                                const expoPushTokens: AttributeValue[] = [];
                                for (const pushToken of createNotificationInput.expoPushTokens) {
                                    expoPushTokens.push({
                                        M: {
                                            tokenId: {
                                                S: pushToken!
                                            }
                                        }
                                    })
                                }
                                // store the successfully sent notification object
                                await dynamoDbClient.send(new PutItemCommand({
                                    TableName: process.env.NOTIFICATIONS_TABLE!,
                                    Item: {
                                        id: {
                                            S: createNotificationInput.id
                                        },
                                        timestamp: {
                                            N: createNotificationInput.timestamp.toString()
                                        },
                                        notificationId: {
                                            S: createNotificationInput.notificationId!
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
                                    data: createNotificationInput as Notification
                                }
                            }
                        } else {
                            const errorMessage = `Invalid information passed in, to process a notification through ${createNotificationInput.channelType}, for notification type ${createNotificationInput.type}`;
                            console.log(errorMessage);
                            return {
                                errorMessage: errorMessage,
                                errorType: NotificationsErrorType.ValidationError
                            }
                        }
                    } else {
                        const errorMessage = `Unsupported notification channel ${createNotificationInput.channelType}, for notification type ${createNotificationInput.type}`;
                        console.log(errorMessage);
                        return {
                            errorMessage: errorMessage,
                            errorType: NotificationsErrorType.ValidationError
                        }
                    }
                default:
                    const errorMessage = `Unexpected notification type ${createNotificationInput.type}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: NotificationsErrorType.ValidationError
                    }
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
