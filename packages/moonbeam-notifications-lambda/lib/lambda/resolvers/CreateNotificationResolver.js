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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXRlTm90aWZpY2F0aW9uUmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL3Jlc29sdmVycy9DcmVhdGVOb3RpZmljYXRpb25SZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw4REFBd0c7QUFDeEcsK0RBU21DO0FBRW5DOzs7Ozs7O0dBT0c7QUFDSSxNQUFNLGtCQUFrQixHQUFHLEtBQUssRUFBRSxTQUFpQixFQUFFLHVCQUFnRCxFQUF1QyxFQUFFO0lBQ2pKLElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsNENBQTRDO1FBQzVDLE1BQU0sY0FBYyxHQUFHLElBQUksZ0NBQWMsQ0FBQyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBRTVELG9DQUFvQztRQUNwQyxNQUFNLFNBQVMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzNDLHVCQUF1QixDQUFDLFNBQVMsR0FBRyx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLHVCQUF1QixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNsSSx1QkFBdUIsQ0FBQyxTQUFTLEdBQUcsdUJBQXVCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUN0SCx1QkFBdUIsQ0FBQyxTQUFTLEdBQUcsdUJBQXVCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUV0SDs7O1dBR0c7UUFDSCxNQUFNLHVCQUF1QixHQUFHLE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLGdDQUFj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LENBQUMsU0FBUyxJQUFJO2dDQUNyQyxTQUFTLEVBQUU7b0NBQ1AsQ0FBQyxFQUFFLHVCQUF1QixDQUFDLFNBQVM7aUNBQ3ZDOzZCQUNKLENBQUM7eUJBQ0w7cUJBQ0osQ0FBQyxDQUFDLENBQUM7b0JBRUosd0RBQXdEO29CQUN4RCxPQUFPO3dCQUNILEVBQUUsRUFBRSx1QkFBdUIsQ0FBQyxFQUFFO3dCQUM5QixJQUFJLEVBQUUsdUJBQXVDO3FCQUNoRCxDQUFBO2lCQUNKO2FBQ0o7aUJBQU07Z0JBQ0gsTUFBTSxZQUFZLEdBQUcsb0VBQW9FLHVCQUF1QixDQUFDLFdBQVcsMkJBQTJCLHVCQUF1QixDQUFDLElBQUksRUFBRSxDQUFDO2dCQUN0TCxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUMxQixPQUFPO29CQUNILFlBQVksRUFBRSxZQUFZO29CQUMxQixTQUFTLEVBQUUsd0NBQXNCLENBQUMsZUFBZTtpQkFDcEQsQ0FBQTthQUNKO1FBQ0w7WUFDSSxNQUFNLFlBQVksR0FBRyxvQ0FBb0MsdUJBQXVCLENBQUMsV0FBVywyQkFBMkIsdUJBQXVCLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDdEosT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUMxQixPQUFPO2dCQUNILFlBQVksRUFBRSxZQUFZO2dCQUMxQixTQUFTLEVBQUUsd0NBQXNCLENBQUMsZUFBZTthQUNwRCxDQUFBO0tBQ1I7QUFDTCxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0F0dHJpYnV0ZVZhbHVlLCBEeW5hbW9EQkNsaWVudCwgR2V0SXRlbUNvbW1hbmQsIFB1dEl0ZW1Db21tYW5kfSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LWR5bmFtb2RiXCI7XG5pbXBvcnQge1xuICAgIENvdXJpZXJDbGllbnQsXG4gICAgQ3JlYXRlTm90aWZpY2F0aW9uSW5wdXQsXG4gICAgQ3JlYXRlTm90aWZpY2F0aW9uUmVzcG9uc2UsXG4gICAgTm90aWZpY2F0aW9uLFxuICAgIE5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlLFxuICAgIE5vdGlmaWNhdGlvblJlc3BvbnNlLFxuICAgIE5vdGlmaWNhdGlvbnNFcnJvclR5cGUsXG4gICAgTm90aWZpY2F0aW9uVHlwZVxufSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuXG4vKipcbiAqIENyZWF0ZU5vdGlmaWNhdGlvbiByZXNvbHZlclxuICpcbiAqIEBwYXJhbSBmaWVsZE5hbWUgbmFtZSBvZiB0aGUgcmVzb2x2ZXIgcGF0aCBmcm9tIHRoZSBBcHBTeW5jIGV2ZW50XG4gKiBAcGFyYW0gY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQgY3JlYXRlIG5vdGlmaWNhdGlvbnMgaW5wdXQgb2JqZWN0LCB1c2VkIHRvIGNyZWF0ZSBhIG5vdGlmaWNhdGlvblxuICogYmFzZWQgb24gYW4gZXZlbnQgKHJlaW1idXJzZW1lbnQsIHRyYW5zYWN0aW9uLCBjYXJkIGV4cGlyYXRpb24sIHN1Y2Nlc3NmdWwgcmVnaXN0cmF0aW9uKS5cbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgQ3JlYXRlTm90aWZpY2F0aW9uUmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCBjcmVhdGVOb3RpZmljYXRpb24gPSBhc3luYyAoZmllbGROYW1lOiBzdHJpbmcsIGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0OiBDcmVhdGVOb3RpZmljYXRpb25JbnB1dCk6IFByb21pc2U8Q3JlYXRlTm90aWZpY2F0aW9uUmVzcG9uc2U+ID0+IHtcbiAgICB0cnkge1xuICAgICAgICAvLyByZXRyaWV2aW5nIHRoZSBjdXJyZW50IGZ1bmN0aW9uIHJlZ2lvblxuICAgICAgICBjb25zdCByZWdpb24gPSBwcm9jZXNzLmVudi5BV1NfUkVHSU9OITtcblxuICAgICAgICAvLyBpbml0aWFsaXppbmcgdGhlIER5bmFtb0RCIGRvY3VtZW50IGNsaWVudFxuICAgICAgICBjb25zdCBkeW5hbW9EYkNsaWVudCA9IG5ldyBEeW5hbW9EQkNsaWVudCh7cmVnaW9uOiByZWdpb259KTtcblxuICAgICAgICAvLyB1cGRhdGUgdGhlIHRpbWVzdGFtcHMgYWNjb3JkaW5nbHlcbiAgICAgICAgY29uc3QgY3JlYXRlZEF0ID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgICAgICBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC50aW1lc3RhbXAgPSBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC50aW1lc3RhbXAgPyBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC50aW1lc3RhbXAgOiBEYXRlLnBhcnNlKGNyZWF0ZWRBdCk7XG4gICAgICAgIGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmNyZWF0ZWRBdCA9IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmNyZWF0ZWRBdCA/IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmNyZWF0ZWRBdCA6IGNyZWF0ZWRBdDtcbiAgICAgICAgY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQudXBkYXRlZEF0ID0gY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQudXBkYXRlZEF0ID8gY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQudXBkYXRlZEF0IDogY3JlYXRlZEF0O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBjaGVjayB0byBzZWUgaWYgdGhlIHNhbWUgbm90aWZpY2F0aW9ucyBhbHJlYWR5IGV4aXN0cyBpbiB0aGUgREIuIEFsdGhvdWdoIHRoaXMgaXMgYSB2ZXJ5IHJhcmUgc2l0dWF0aW9uIChpZiBhdCBhbGwpLFxuICAgICAgICAgKiB3ZSB3YW50IHRvIHB1dCBhIHNhZmVndWFyZCBhcm91bmQgZHVwbGljYXRlcyBldmVuIGhlcmUuXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBwcmVFeGlzdGluZ05vdGlmaWNhdGlvbiA9IGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IEdldEl0ZW1Db21tYW5kKHtcbiAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuTk9USUZJQ0FUSU9OU19UQUJMRSEsXG4gICAgICAgICAgICBLZXk6IHtcbiAgICAgICAgICAgICAgICBpZDoge1xuICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5pZFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGltZXN0YW1wOiB7XG4gICAgICAgICAgICAgICAgICAgIE46IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnRpbWVzdGFtcC50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogd2UncmUgbm90IGludGVyZXN0ZWQgaW4gZ2V0dGluZyBhbGwgdGhlIGRhdGEgZm9yIHRoaXMgY2FsbCwganVzdCB0aGUgbWluaW11bSBmb3IgdXMgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdGhpcyBpcyBhIGR1cGxpY2F0ZSBvciBub3RcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBAbGluayBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vYW1hem9uZHluYW1vZGIvbGF0ZXN0L2RldmVsb3Blcmd1aWRlL1Jlc2VydmVkV29yZHMuaHRtbFxuICAgICAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2FtYXpvbmR5bmFtb2RiL2xhdGVzdC9kZXZlbG9wZXJndWlkZS9FeHByZXNzaW9ucy5FeHByZXNzaW9uQXR0cmlidXRlTmFtZXMuaHRtbFxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBQcm9qZWN0aW9uRXhwcmVzc2lvbjogJyNpZGYsICN0JyxcbiAgICAgICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lczoge1xuICAgICAgICAgICAgICAgICcjaWRmJzogJ2lkJyxcbiAgICAgICAgICAgICAgICAnI3QnOiAndGltZXN0YW1wJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG5cbiAgICAgICAgLy8gaWYgdGhlcmUgaXMgYW4gaXRlbSByZXRyaWV2ZWQsIHRoZW4gd2UgcmV0dXJuIGFuIGVycm9yXG4gICAgICAgIGlmIChwcmVFeGlzdGluZ05vdGlmaWNhdGlvbiAmJiBwcmVFeGlzdGluZ05vdGlmaWNhdGlvbi5JdGVtKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIGlmIHRoZXJlIGlzIGEgcHJlLWV4aXN0aW5nIG5vdGlmaWNhdGlvbiB3aXRoIHRoZSBzYW1lIGNvbXBvc2l0ZSBwcmltYXJ5IGtleSAodXNlcklkL2lkLCB0aW1lc3RhbXApIGNvbWJpbmF0aW9uLFxuICAgICAgICAgICAgICogdGhlbiB3ZSBjYW5ub3QgZHVwbGljYXRlIHRoYXQsIHNvIHdlIHdpbGwgcmV0dXJuIGFuIGVycm9yLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgRHVwbGljYXRlIG5vdGlmaWNhdGlvbiBmb3VuZCFgO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuRHVwbGljYXRlT2JqZWN0Rm91bmRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogZmlyc3QsIHdlIG5lZWQgdG8gY2FsbCB0aGUgYXBwcm9wcmlhdGUgQ291cmllciBBUEkgKHdpdGggdGhlIGFwcHJvcHJpYXRlIGltcGxlbWVudGF0aW9uKSwgZGVwZW5kaW5nIG9uIHRoZSBOb3RpZmljYXRpb25cbiAgICAgICAgICAgICAqIHR5cGUsIGFzIHdlbGwgYXMgdGhlIGNoYW5uZWwsIHRvIGJlIHBhc3NlZCBpbi5cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBpbml0aWFsaXplIHRoZSBDb3VyaWVyIENsaWVudCBBUEkgaGVyZSwgaW4gb3JkZXIgdG8gY2FsbCB0aGUgYXBwcm9wcmlhdGUgZW5kcG9pbnRzIGZvciB0aGlzIGhhbmRsZXJcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgY29uc3QgY291cmllckNsaWVudCA9IG5ldyBDb3VyaWVyQ2xpZW50KHByb2Nlc3MuZW52LkVOVl9OQU1FISwgcmVnaW9uKTtcbiAgICAgICAgICAgIC8vIHN3aXRjaCBiYXNlZCBvbiB0aGUgdHlwZSBmaXJzdFxuICAgICAgICAgICAgc3dpdGNoIChjcmVhdGVOb3RpZmljYXRpb25JbnB1dC50eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBOb3RpZmljYXRpb25UeXBlLk5ld1VzZXJTaWdudXA6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXdVc2VyU2lnblVwTm90aWZpY2F0aW9uKGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LCBjb3VyaWVyQ2xpZW50LCBkeW5hbW9EYkNsaWVudCk7XG4gICAgICAgICAgICAgICAgY2FzZSBOb3RpZmljYXRpb25UeXBlLk5ld1F1YWxpZnlpbmdPZmZlckF2YWlsYWJsZTpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ld1VzZXJRdWFsaWZ5aW5nT2ZmZXJOb3RpZmljYXRpb24oY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQsIGNvdXJpZXJDbGllbnQsIGR5bmFtb0RiQ2xpZW50KTtcbiAgICAgICAgICAgICAgICBjYXNlIE5vdGlmaWNhdGlvblR5cGUuTWlsaXRhcnlTdGF0dXNDaGFuZ2VkUGVuZGluZ1RvUmVqZWN0ZWQ6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtaWxpdGFyeVN0YXR1c1VwZGF0ZU5vdGlmaWNhdGlvbihjcmVhdGVOb3RpZmljYXRpb25JbnB1dCwgY291cmllckNsaWVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGR5bmFtb0RiQ2xpZW50LCBOb3RpZmljYXRpb25UeXBlLk1pbGl0YXJ5U3RhdHVzQ2hhbmdlZFBlbmRpbmdUb1JlamVjdGVkKTtcbiAgICAgICAgICAgICAgICBjYXNlIE5vdGlmaWNhdGlvblR5cGUuTWlsaXRhcnlTdGF0dXNDaGFuZ2VkUGVuZGluZ1RvVmVyaWZpZWQ6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtaWxpdGFyeVN0YXR1c1VwZGF0ZU5vdGlmaWNhdGlvbihjcmVhdGVOb3RpZmljYXRpb25JbnB1dCwgY291cmllckNsaWVudCwgZHluYW1vRGJDbGllbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBOb3RpZmljYXRpb25UeXBlLk1pbGl0YXJ5U3RhdHVzQ2hhbmdlZFBlbmRpbmdUb1ZlcmlmaWVkKTtcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBub3RpZmljYXRpb24gdHlwZSAke2NyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnR5cGV9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvclxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgZXhlY3V0aW5nICR7ZmllbGROYW1lfSBtdXRhdGlvbiAke2Vycn1gO1xuICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdXNlZCB0byBub3RpZnkgdXNlcnMgd2hlbiB0aGV5IGdldCB0aGVpciBtaWxpdGFyeSB2ZXJpZmljYXRpb24gc3RhdHVzIHVwZGF0ZWQuXG4gKlxuICogQHBhcmFtIGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0IGNyZWF0ZSBub3RpZmljYXRpb25zIGlucHV0IG9iamVjdCwgdXNlZCB0byBjcmVhdGUgYSBub3RpZmljYXRpb25cbiAqIGZvciBhIHVzZXIgbWlsaXRhcnkgdmVyaWZpY2F0aW9uIHN0YXR1cyB1cGRhdGUuXG4gKiBAcGFyYW0gY291cmllckNsaWVudCBDb3VyaWVyIGNsaWVudCB1c2VkIHRvIHNlbmQgbm90aWZpY2F0aW9uc1xuICogQHBhcmFtIGR5bmFtb0RiQ2xpZW50IER5bmFtbyBEQiBjbGllbnQgdXNlZCB0byBzdG9yZSB0aGUgbm90aWZpY2F0aW9uIGludGVybmFsbHlcbiAqIEBwYXJhbSBub3RpZmljYXRpb25UeXBlIHR5cGUgb2Ygbm90aWZpY2F0aW9uIHBhc3NlZCBpbiwgdXNlZCB0byBkZXRlcm1pbmUgdGhlIHN0YXR1cyB1cGRhdGUgdHlwZXMgdGhhdCB3ZSBhcmUgcGVyZm9ybWluZ1xuICpcbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgQ3JlYXRlTm90aWZpY2F0aW9uUmVzcG9uc2V9XG4gKi9cbmNvbnN0IG1pbGl0YXJ5U3RhdHVzVXBkYXRlTm90aWZpY2F0aW9uID0gYXN5bmMgKGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0OiBDcmVhdGVOb3RpZmljYXRpb25JbnB1dCwgY291cmllckNsaWVudDogQ291cmllckNsaWVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGR5bmFtb0RiQ2xpZW50OiBEeW5hbW9EQkNsaWVudCwgbm90aWZpY2F0aW9uVHlwZTogTm90aWZpY2F0aW9uVHlwZSk6IFByb21pc2U8Q3JlYXRlTm90aWZpY2F0aW9uUmVzcG9uc2U+ID0+IHtcbiAgICBjb25zb2xlLmxvZygnU2VuZGluZyBtaWxpdGFyeSBzdGF0dXMgdXBkYXRlIG5vdGlmaWNhdGlvbnMnKTtcbiAgICBzd2l0Y2ggKGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmNoYW5uZWxUeXBlKSB7XG4gICAgICAgIGNhc2UgTm90aWZpY2F0aW9uQ2hhbm5lbFR5cGUuRW1haWw6XG4gICAgICAgICAgICAvLyB2YWxpZGF0ZSB0aGF0IHdlIGhhdmUgdGhlIG5lY2Vzc2FyeSBpbmZvcm1hdGlvbiB0byBzZW5kIGFuIGVtYWlsXG4gICAgICAgICAgICBpZiAoY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuZW1haWxEZXN0aW5hdGlvbiAmJiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5lbWFpbERlc3RpbmF0aW9uLmxlbmd0aCAhPT0gMCAmJlxuICAgICAgICAgICAgICAgIGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnVzZXJGdWxsTmFtZSAmJiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC51c2VyRnVsbE5hbWUubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgLy8gYXR0ZW1wdCB0byBzZW5kIGFuIGVtYWlsIG5vdGlmaWNhdGlvbiBmaXJzdCB0aHJvdWdoIENvdXJpZXJcbiAgICAgICAgICAgICAgICBjb25zdCBzZW5kRW1haWxOb3RpZmljYXRpb25SZXNwb25zZTogTm90aWZpY2F0aW9uUmVzcG9uc2UgPSBhd2FpdCBjb3VyaWVyQ2xpZW50LnNlbmRFbWFpbE5vdGlmaWNhdGlvbih7XG4gICAgICAgICAgICAgICAgICAgIGVtYWlsRGVzdGluYXRpb246IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmVtYWlsRGVzdGluYXRpb24hLFxuICAgICAgICAgICAgICAgICAgICB1c2VyRnVsbE5hbWU6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnVzZXJGdWxsTmFtZSFcbiAgICAgICAgICAgICAgICB9LCBub3RpZmljYXRpb25UeXBlKTtcblxuICAgICAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGUgZW1haWwgbm90aWZpY2F0aW9uIHdhcyBzdWNjZXNzZnVsbHkgc2VudCBvciBub3RcbiAgICAgICAgICAgICAgICBpZiAoIXNlbmRFbWFpbE5vdGlmaWNhdGlvblJlc3BvbnNlIHx8IHNlbmRFbWFpbE5vdGlmaWNhdGlvblJlc3BvbnNlLmVycm9yTWVzc2FnZSB8fFxuICAgICAgICAgICAgICAgICAgICBzZW5kRW1haWxOb3RpZmljYXRpb25SZXNwb25zZS5lcnJvclR5cGUgfHwgIXNlbmRFbWFpbE5vdGlmaWNhdGlvblJlc3BvbnNlLnJlcXVlc3RJZCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgRW1haWwgbm90aWZpY2F0aW9uIHNlbmRpbmcgdGhyb3VnaCB0aGUgUE9TVCBDb3VyaWVyIHNlbmQgZW1haWwgbWVzc2FnZSBjYWxsIGZhaWxlZCAke0pTT04uc3RyaW5naWZ5KHNlbmRFbWFpbE5vdGlmaWNhdGlvblJlc3BvbnNlKX1gXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHNldCB0aGUgbm90aWZpY2F0aW9uIGlkLCBmcm9tIHRoZSBDb3VyaWVyIGNhbGwgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQubm90aWZpY2F0aW9uSWQgPSBzZW5kRW1haWxOb3RpZmljYXRpb25SZXNwb25zZS5yZXF1ZXN0SWQhO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIHN0b3JlIHRoZSBzdWNjZXNzZnVsbHkgc2VudCBub3RpZmljYXRpb24gb2JqZWN0XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IFB1dEl0ZW1Db21tYW5kKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuTk9USUZJQ0FUSU9OU19UQUJMRSEsXG4gICAgICAgICAgICAgICAgICAgICAgICBJdGVtOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuaWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBOOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC50aW1lc3RhbXAhLnRvU3RyaW5nKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbklkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0Lm5vdGlmaWNhdGlvbklkIVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW1haWxEZXN0aW5hdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5lbWFpbERlc3RpbmF0aW9uIVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlckZ1bGxOYW1lOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnVzZXJGdWxsTmFtZSFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1czoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5zdGF0dXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5uZWxUeXBlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmNoYW5uZWxUeXBlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5jcmVhdGVkQXQhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVkQXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQudXBkYXRlZEF0IVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uKGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmFjdGlvblVybCAmJiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvblVybDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuYWN0aW9uVXJsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgc3VjY2Vzc2Z1bGx5IHNlbnQgbm90aWZpY2F0aW9uIGluZm9ybWF0aW9uXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dCBhcyBOb3RpZmljYXRpb25cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYEludmFsaWQgaW5mb3JtYXRpb24gcGFzc2VkIGluLCB0byBwcm9jZXNzIGEgbm90aWZpY2F0aW9uIHRocm91Z2ggJHtjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5jaGFubmVsVHlwZX0sIGZvciBub3RpZmljYXRpb24gdHlwZSAke2NyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnR5cGV9YDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICBjYXNlIE5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlLlB1c2g6XG4gICAgICAgICAgICAvLyB2YWxpZGF0ZSB0aGF0IHdlIGhhdmUgdGhlIG5lY2Vzc2FyeSBpbmZvcm1hdGlvbiB0byBzZW5kIGEgbW9iaWxlIHB1c2hcbiAgICAgICAgICAgIGlmIChjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5leHBvUHVzaFRva2VucyAmJiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5leHBvUHVzaFRva2Vucy5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgICAgICAvLyBhdHRlbXB0IHRvIHNlbmQgYSBtb2JpbGUgcHVzaCBub3RpZmljYXRpb24gZmlyc3QgdGhyb3VnaCBDb3VyaWVyXG4gICAgICAgICAgICAgICAgY29uc3Qgc2VuZE1vYmlsZVB1c2hOb3RpZmljYXRpb25SZXNwb25zZTogTm90aWZpY2F0aW9uUmVzcG9uc2UgPSBhd2FpdCBjb3VyaWVyQ2xpZW50LnNlbmRNb2JpbGVQdXNoTm90aWZpY2F0aW9uKHtcbiAgICAgICAgICAgICAgICAgICAgZXhwb1B1c2hUb2tlbnM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmV4cG9QdXNoVG9rZW5zIVxuICAgICAgICAgICAgICAgIH0sIG5vdGlmaWNhdGlvblR5cGUpO1xuXG4gICAgICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSBtb2JpbGUgcHVzaCBub3RpZmljYXRpb24gd2FzIHN1Y2Nlc3NmdWxseSBzZW50IG9yIG5vdFxuICAgICAgICAgICAgICAgIGlmICghc2VuZE1vYmlsZVB1c2hOb3RpZmljYXRpb25SZXNwb25zZSB8fCBzZW5kTW9iaWxlUHVzaE5vdGlmaWNhdGlvblJlc3BvbnNlLmVycm9yTWVzc2FnZSB8fFxuICAgICAgICAgICAgICAgICAgICBzZW5kTW9iaWxlUHVzaE5vdGlmaWNhdGlvblJlc3BvbnNlLmVycm9yVHlwZSB8fCAhc2VuZE1vYmlsZVB1c2hOb3RpZmljYXRpb25SZXNwb25zZS5yZXF1ZXN0SWQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE1vYmlsZSBwdXNoIG5vdGlmaWNhdGlvbiBzZW5kaW5nIHRocm91Z2ggdGhlIFBPU1QgQ291cmllciBzZW5kIHB1c2ggbm90aWZpY2F0aW9uIG1lc3NhZ2UgY2FsbCBmYWlsZWQgJHtKU09OLnN0cmluZ2lmeShzZW5kTW9iaWxlUHVzaE5vdGlmaWNhdGlvblJlc3BvbnNlKX1gXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHNldCB0aGUgbm90aWZpY2F0aW9uIGlkLCBmcm9tIHRoZSBDb3VyaWVyIGNhbGwgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQubm90aWZpY2F0aW9uSWQgPSBzZW5kTW9iaWxlUHVzaE5vdGlmaWNhdGlvblJlc3BvbnNlLnJlcXVlc3RJZCE7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gY3JlYXRlIGEgRHluYW1vIERCIHN0cnVjdHVyZSBhcnJheSwgdG8gaG9sZCB0aGUgaW5jb21pbmcgZXhwbyBwdXNoIHRva2Vuc1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBleHBvUHVzaFRva2VuczogQXR0cmlidXRlVmFsdWVbXSA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHB1c2hUb2tlbiBvZiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5leHBvUHVzaFRva2Vucykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXhwb1B1c2hUb2tlbnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b2tlbklkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBwdXNoVG9rZW4hXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIHN0b3JlIHRoZSBzdWNjZXNzZnVsbHkgc2VudCBub3RpZmljYXRpb24gb2JqZWN0XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IFB1dEl0ZW1Db21tYW5kKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuTk9USUZJQ0FUSU9OU19UQUJMRSEsXG4gICAgICAgICAgICAgICAgICAgICAgICBJdGVtOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuaWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBOOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC50aW1lc3RhbXAhLnRvU3RyaW5nKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbklkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0Lm5vdGlmaWNhdGlvbklkIVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwb1B1c2hUb2tlbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTDogZXhwb1B1c2hUb2tlbnNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1czoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5zdGF0dXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5uZWxUeXBlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmNoYW5uZWxUeXBlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5jcmVhdGVkQXQhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVkQXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQudXBkYXRlZEF0IVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uKGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmFjdGlvblVybCAmJiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvblVybDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuYWN0aW9uVXJsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgc3VjY2Vzc2Z1bGx5IHNlbnQgbm90aWZpY2F0aW9uIGluZm9ybWF0aW9uXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dCBhcyBOb3RpZmljYXRpb25cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYEludmFsaWQgaW5mb3JtYXRpb24gcGFzc2VkIGluLCB0byBwcm9jZXNzIGEgbm90aWZpY2F0aW9uIHRocm91Z2ggJHtjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5jaGFubmVsVHlwZX0sIGZvciBub3RpZmljYXRpb24gdHlwZSAke2NyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnR5cGV9YDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuc3VwcG9ydGVkIG5vdGlmaWNhdGlvbiBjaGFubmVsICR7Y3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuY2hhbm5lbFR5cGV9LCBmb3Igbm90aWZpY2F0aW9uIHR5cGUgJHtjcmVhdGVOb3RpZmljYXRpb25JbnB1dC50eXBlfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHVzZWQgdG8gbm90aWZ5IHVzZXJzIHdoZW4gdGhleSBzdWNjZXNzZnVsbHkgcXVhbGlmeSBmb3IgYW4gb2ZmZXIuXG4gKlxuICogQHBhcmFtIGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0IGNyZWF0ZSBub3RpZmljYXRpb25zIGlucHV0IG9iamVjdCwgdXNlZCB0byBjcmVhdGUgYSBub3RpZmljYXRpb25cbiAqIGZvciBhIG5ldyB1c2VyIHF1YWxpZnlpbmcgb2ZmZXIuXG4gKiBAcGFyYW0gY291cmllckNsaWVudCBDb3VyaWVyIGNsaWVudCB1c2VkIHRvIHNlbmQgbm90aWZpY2F0aW9uc1xuICogQHBhcmFtIGR5bmFtb0RiQ2xpZW50IER5bmFtbyBEQiBjbGllbnQgdXNlZCB0byBzdG9yZSB0aGUgbm90aWZpY2F0aW9uIGludGVybmFsbHlcbiAqXG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIENyZWF0ZU5vdGlmaWNhdGlvblJlc3BvbnNlfVxuICovXG5jb25zdCBuZXdVc2VyUXVhbGlmeWluZ09mZmVyTm90aWZpY2F0aW9uID0gYXN5bmMgKGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0OiBDcmVhdGVOb3RpZmljYXRpb25JbnB1dCwgY291cmllckNsaWVudDogQ291cmllckNsaWVudCwgZHluYW1vRGJDbGllbnQ6IER5bmFtb0RCQ2xpZW50KTogUHJvbWlzZTxDcmVhdGVOb3RpZmljYXRpb25SZXNwb25zZT4gPT4ge1xuICAgIGNvbnNvbGUubG9nKCdTZW5kaW5nIG5ldyB1c2VyIHF1YWxpZnlpbmcgb2ZmZXIgbm90aWZpY2F0aW9ucycpO1xuICAgIHN3aXRjaCAoY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuY2hhbm5lbFR5cGUpIHtcbiAgICAgICAgY2FzZSBOb3RpZmljYXRpb25DaGFubmVsVHlwZS5QdXNoOlxuICAgICAgICAgICAgLy8gdmFsaWRhdGUgdGhhdCB3ZSBoYXZlIHRoZSBuZWNlc3NhcnkgaW5mb3JtYXRpb24gdG8gc2VuZCBhIG1vYmlsZSBwdXNoXG4gICAgICAgICAgICBpZiAoY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuZXhwb1B1c2hUb2tlbnMgJiYgY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuZXhwb1B1c2hUb2tlbnMubGVuZ3RoICE9PSAwICYmXG4gICAgICAgICAgICAgICAgY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQucGVuZGluZ0Nhc2hiYWNrICYmIGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0Lm1lcmNoYW50TmFtZSAmJiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5tZXJjaGFudE5hbWUubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgLy8gYXR0ZW1wdCB0byBzZW5kIGEgbW9iaWxlIHB1c2ggbm90aWZpY2F0aW9uIGZpcnN0IHRocm91Z2ggQ291cmllclxuICAgICAgICAgICAgICAgIGNvbnN0IHNlbmRNb2JpbGVQdXNoTm90aWZpY2F0aW9uUmVzcG9uc2U6IE5vdGlmaWNhdGlvblJlc3BvbnNlID0gYXdhaXQgY291cmllckNsaWVudC5zZW5kTW9iaWxlUHVzaE5vdGlmaWNhdGlvbih7XG4gICAgICAgICAgICAgICAgICAgIGV4cG9QdXNoVG9rZW5zOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5leHBvUHVzaFRva2VucyEsXG4gICAgICAgICAgICAgICAgICAgIG1lcmNoYW50TmFtZTogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQubWVyY2hhbnROYW1lISxcbiAgICAgICAgICAgICAgICAgICAgcGVuZGluZ0Nhc2hiYWNrOiBOdW1iZXIoY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQucGVuZGluZ0Nhc2hiYWNrIS50b0ZpeGVkKDIpKVxuICAgICAgICAgICAgICAgIH0sIE5vdGlmaWNhdGlvblR5cGUuTmV3UXVhbGlmeWluZ09mZmVyQXZhaWxhYmxlKTtcblxuICAgICAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGUgbW9iaWxlIHB1c2ggbm90aWZpY2F0aW9uIHdhcyBzdWNjZXNzZnVsbHkgc2VudCBvciBub3RcbiAgICAgICAgICAgICAgICBpZiAoIXNlbmRNb2JpbGVQdXNoTm90aWZpY2F0aW9uUmVzcG9uc2UgfHwgc2VuZE1vYmlsZVB1c2hOb3RpZmljYXRpb25SZXNwb25zZS5lcnJvck1lc3NhZ2UgfHxcbiAgICAgICAgICAgICAgICAgICAgc2VuZE1vYmlsZVB1c2hOb3RpZmljYXRpb25SZXNwb25zZS5lcnJvclR5cGUgfHwgIXNlbmRNb2JpbGVQdXNoTm90aWZpY2F0aW9uUmVzcG9uc2UucmVxdWVzdElkKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBNb2JpbGUgcHVzaCBub3RpZmljYXRpb24gc2VuZGluZyB0aHJvdWdoIHRoZSBQT1NUIENvdXJpZXIgc2VuZCBwdXNoIG5vdGlmaWNhdGlvbiBtZXNzYWdlIGNhbGwgZmFpbGVkICR7SlNPTi5zdHJpbmdpZnkoc2VuZE1vYmlsZVB1c2hOb3RpZmljYXRpb25SZXNwb25zZSl9YFxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBzZXQgdGhlIG5vdGlmaWNhdGlvbiBpZCwgZnJvbSB0aGUgQ291cmllciBjYWxsIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0Lm5vdGlmaWNhdGlvbklkID0gc2VuZE1vYmlsZVB1c2hOb3RpZmljYXRpb25SZXNwb25zZS5yZXF1ZXN0SWQhO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGNyZWF0ZSBhIER5bmFtbyBEQiBzdHJ1Y3R1cmUgYXJyYXksIHRvIGhvbGQgdGhlIGluY29taW5nIGV4cG8gcHVzaCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXhwb1B1c2hUb2tlbnM6IEF0dHJpYnV0ZVZhbHVlW10gPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBwdXNoVG9rZW4gb2YgY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuZXhwb1B1c2hUb2tlbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4cG9QdXNoVG9rZW5zLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE06IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW5JZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogcHVzaFRva2VuIVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBzdG9yZSB0aGUgc3VjY2Vzc2Z1bGx5IHNlbnQgbm90aWZpY2F0aW9uIG9iamVjdFxuICAgICAgICAgICAgICAgICAgICBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBQdXRJdGVtQ29tbWFuZCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52Lk5PVElGSUNBVElPTlNfVEFCTEUhLFxuICAgICAgICAgICAgICAgICAgICAgICAgSXRlbToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmlkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTjogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQudGltZXN0YW1wIS50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3RpZmljYXRpb25JZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5ub3RpZmljYXRpb25JZCFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cG9QdXNoVG9rZW5zOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEw6IGV4cG9QdXNoVG9rZW5zXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuc3RhdHVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFubmVsVHlwZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5jaGFubmVsVHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC50eXBlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuY3JlYXRlZEF0IVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlZEF0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnVwZGF0ZWRBdCFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLihjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5hY3Rpb25VcmwgJiYge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb25Vcmw6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmFjdGlvblVybFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIHN1Y2Nlc3NmdWxseSBzZW50IG5vdGlmaWNhdGlvbiBpbmZvcm1hdGlvblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQgYXMgTm90aWZpY2F0aW9uXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBJbnZhbGlkIGluZm9ybWF0aW9uIHBhc3NlZCBpbiwgdG8gcHJvY2VzcyBhIG5vdGlmaWNhdGlvbiB0aHJvdWdoICR7Y3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuY2hhbm5lbFR5cGV9LCBmb3Igbm90aWZpY2F0aW9uIHR5cGUgJHtjcmVhdGVOb3RpZmljYXRpb25JbnB1dC50eXBlfWA7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvclxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbnN1cHBvcnRlZCBub3RpZmljYXRpb24gY2hhbm5lbCAke2NyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmNoYW5uZWxUeXBlfSwgZm9yIG5vdGlmaWNhdGlvbiB0eXBlICR7Y3JlYXRlTm90aWZpY2F0aW9uSW5wdXQudHlwZX1gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvclxuICAgICAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB1c2VkIHRvIG5vdGlmeSB1c2VycyB3aGVuIHRoZXkgc3VjY2Vzc2Z1bGx5IGNvbXBsZXRlIGEgc2lnbnVwIHByb2Nlc3MuXG4gKlxuICogQHBhcmFtIGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0IGNyZWF0ZSBub3RpZmljYXRpb25zIGlucHV0IG9iamVjdCwgdXNlZCB0byBjcmVhdGUgYSBub3RpZmljYXRpb25cbiAqIGZvciBhIG5ldyB1c2VyIHNpZ251cC9yZWdpc3RyYXRpb24gZXZlbnQuXG4gKiBAcGFyYW0gY291cmllckNsaWVudCBDb3VyaWVyIGNsaWVudCB1c2VkIHRvIHNlbmQgbm90aWZpY2F0aW9uc1xuICogQHBhcmFtIGR5bmFtb0RiQ2xpZW50IER5bmFtbyBEQiBjbGllbnQgdXNlZCB0byBzdG9yZSB0aGUgbm90aWZpY2F0aW9uIGludGVybmFsbHlcbiAqXG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIENyZWF0ZU5vdGlmaWNhdGlvblJlc3BvbnNlfVxuICovXG5jb25zdCBuZXdVc2VyU2lnblVwTm90aWZpY2F0aW9uID0gYXN5bmMgKGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0OiBDcmVhdGVOb3RpZmljYXRpb25JbnB1dCwgY291cmllckNsaWVudDogQ291cmllckNsaWVudCwgZHluYW1vRGJDbGllbnQ6IER5bmFtb0RCQ2xpZW50KTogUHJvbWlzZTxDcmVhdGVOb3RpZmljYXRpb25SZXNwb25zZT4gPT4ge1xuICAgIGNvbnNvbGUubG9nKCdTZW5kaW5nIG5ldyB1c2VyIHNpZ251cCBub3RpZmljYXRpb25zJyk7XG4gICAgc3dpdGNoIChjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5jaGFubmVsVHlwZSkge1xuICAgICAgICBjYXNlIE5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlLkVtYWlsOlxuICAgICAgICAgICAgLy8gdmFsaWRhdGUgdGhhdCB3ZSBoYXZlIHRoZSBuZWNlc3NhcnkgaW5mb3JtYXRpb24gdG8gc2VuZCBhbiBlbWFpbFxuICAgICAgICAgICAgaWYgKGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmVtYWlsRGVzdGluYXRpb24gJiYgY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuZW1haWxEZXN0aW5hdGlvbi5sZW5ndGggIT09IDAgJiZcbiAgICAgICAgICAgICAgICBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC51c2VyRnVsbE5hbWUgJiYgY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQudXNlckZ1bGxOYW1lLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgICAgIC8vIGF0dGVtcHQgdG8gc2VuZCBhbiBlbWFpbCBub3RpZmljYXRpb24gZmlyc3QgdGhyb3VnaCBDb3VyaWVyXG4gICAgICAgICAgICAgICAgY29uc3Qgc2VuZEVtYWlsTm90aWZpY2F0aW9uUmVzcG9uc2U6IE5vdGlmaWNhdGlvblJlc3BvbnNlID0gYXdhaXQgY291cmllckNsaWVudC5zZW5kRW1haWxOb3RpZmljYXRpb24oe1xuICAgICAgICAgICAgICAgICAgICBlbWFpbERlc3RpbmF0aW9uOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5lbWFpbERlc3RpbmF0aW9uISxcbiAgICAgICAgICAgICAgICAgICAgdXNlckZ1bGxOYW1lOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC51c2VyRnVsbE5hbWUhXG4gICAgICAgICAgICAgICAgfSwgTm90aWZpY2F0aW9uVHlwZS5OZXdVc2VyU2lnbnVwKTtcblxuICAgICAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGUgZW1haWwgbm90aWZpY2F0aW9uIHdhcyBzdWNjZXNzZnVsbHkgc2VudCBvciBub3RcbiAgICAgICAgICAgICAgICBpZiAoIXNlbmRFbWFpbE5vdGlmaWNhdGlvblJlc3BvbnNlIHx8IHNlbmRFbWFpbE5vdGlmaWNhdGlvblJlc3BvbnNlLmVycm9yTWVzc2FnZSB8fFxuICAgICAgICAgICAgICAgICAgICBzZW5kRW1haWxOb3RpZmljYXRpb25SZXNwb25zZS5lcnJvclR5cGUgfHwgIXNlbmRFbWFpbE5vdGlmaWNhdGlvblJlc3BvbnNlLnJlcXVlc3RJZCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgRW1haWwgbm90aWZpY2F0aW9uIHNlbmRpbmcgdGhyb3VnaCB0aGUgUE9TVCBDb3VyaWVyIHNlbmQgZW1haWwgbWVzc2FnZSBjYWxsIGZhaWxlZCAke0pTT04uc3RyaW5naWZ5KHNlbmRFbWFpbE5vdGlmaWNhdGlvblJlc3BvbnNlKX1gXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHNldCB0aGUgbm90aWZpY2F0aW9uIGlkLCBmcm9tIHRoZSBDb3VyaWVyIGNhbGwgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQubm90aWZpY2F0aW9uSWQgPSBzZW5kRW1haWxOb3RpZmljYXRpb25SZXNwb25zZS5yZXF1ZXN0SWQhO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIHN0b3JlIHRoZSBzdWNjZXNzZnVsbHkgc2VudCBub3RpZmljYXRpb24gb2JqZWN0XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IFB1dEl0ZW1Db21tYW5kKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuTk9USUZJQ0FUSU9OU19UQUJMRSEsXG4gICAgICAgICAgICAgICAgICAgICAgICBJdGVtOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuaWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBOOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC50aW1lc3RhbXAhLnRvU3RyaW5nKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbklkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0Lm5vdGlmaWNhdGlvbklkIVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW1haWxEZXN0aW5hdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5lbWFpbERlc3RpbmF0aW9uIVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlckZ1bGxOYW1lOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnVzZXJGdWxsTmFtZSFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1czoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5zdGF0dXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5uZWxUeXBlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmNoYW5uZWxUeXBlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5jcmVhdGVkQXQhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVkQXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQudXBkYXRlZEF0IVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uKGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmFjdGlvblVybCAmJiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvblVybDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuYWN0aW9uVXJsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgc3VjY2Vzc2Z1bGx5IHNlbnQgbm90aWZpY2F0aW9uIGluZm9ybWF0aW9uXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dCBhcyBOb3RpZmljYXRpb25cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYEludmFsaWQgaW5mb3JtYXRpb24gcGFzc2VkIGluLCB0byBwcm9jZXNzIGEgbm90aWZpY2F0aW9uIHRocm91Z2ggJHtjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5jaGFubmVsVHlwZX0sIGZvciBub3RpZmljYXRpb24gdHlwZSAke2NyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnR5cGV9YDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuc3VwcG9ydGVkIG5vdGlmaWNhdGlvbiBjaGFubmVsICR7Y3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuY2hhbm5lbFR5cGV9LCBmb3Igbm90aWZpY2F0aW9uIHR5cGUgJHtjcmVhdGVOb3RpZmljYXRpb25JbnB1dC50eXBlfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICB9XG4gICAgfVxufVxuIl19