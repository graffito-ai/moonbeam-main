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
                    // for each notification type, depending on the notification channel, determine how to structure the notification
                    if (createNotificationInput.channelType === moonbeam_models_1.NotificationChannelType.Email) {
                        // validate that we have the necessary information to send an email
                        if (createNotificationInput.emailDestination && createNotificationInput.emailDestination.length !== 0 &&
                            createNotificationInput.userFullName && createNotificationInput.userFullName.length !== 0) {
                            // attempt to send an email notification first through Courier
                            const sendEmailNotificationResponse = await courierClient.sendEmailNotification({
                                emailDestination: createNotificationInput.emailDestination,
                                userFullName: createNotificationInput.userFullName
                            });
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
                    }
                    else {
                        const errorMessage = `Unsupported notification channel ${createNotificationInput.channelType}, for notification type ${createNotificationInput.type}`;
                        console.log(errorMessage);
                        return {
                            errorMessage: errorMessage,
                            errorType: moonbeam_models_1.NotificationsErrorType.ValidationError
                        };
                    }
                case moonbeam_models_1.NotificationType.NewQualifyingOfferAvailable:
                    // for each notification type, depending on the notification channel, determine how to structure the notification
                    if (createNotificationInput.channelType === moonbeam_models_1.NotificationChannelType.Push) {
                        // validate that we have the necessary information to send a mobile push
                        if (createNotificationInput.expoPushTokens && createNotificationInput.expoPushTokens.length !== 0 &&
                            createNotificationInput.pendingCashback && createNotificationInput.merchantName && createNotificationInput.merchantName.length !== 0) {
                            // attempt to send a mobile push notification first through Courier
                            const sendMobilePushNotificationResponse = await courierClient.sendMobilePushNotification({
                                expoPushTokens: createNotificationInput.expoPushTokens,
                                merchantName: createNotificationInput.merchantName,
                                pendingCashback: Number(createNotificationInput.pendingCashback.toFixed(2))
                            });
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
                    }
                    else {
                        const errorMessage = `Unsupported notification channel ${createNotificationInput.channelType}, for notification type ${createNotificationInput.type}`;
                        console.log(errorMessage);
                        return {
                            errorMessage: errorMessage,
                            errorType: moonbeam_models_1.NotificationsErrorType.ValidationError
                        };
                    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXRlTm90aWZpY2F0aW9uUmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL3Jlc29sdmVycy9DcmVhdGVOb3RpZmljYXRpb25SZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw4REFBd0c7QUFDeEcsK0RBU21DO0FBRW5DOzs7Ozs7O0dBT0c7QUFDSSxNQUFNLGtCQUFrQixHQUFHLEtBQUssRUFBRSxTQUFpQixFQUFFLHVCQUFnRCxFQUF1QyxFQUFFO0lBQ2pKLElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsNENBQTRDO1FBQzVDLE1BQU0sY0FBYyxHQUFHLElBQUksZ0NBQWMsQ0FBQyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBRTVELG9DQUFvQztRQUNwQyxNQUFNLFNBQVMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzNDLHVCQUF1QixDQUFDLFNBQVMsR0FBRyx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLHVCQUF1QixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNsSSx1QkFBdUIsQ0FBQyxTQUFTLEdBQUcsdUJBQXVCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUN0SCx1QkFBdUIsQ0FBQyxTQUFTLEdBQUcsdUJBQXVCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUV0SDs7O1dBR0c7UUFDSCxNQUFNLHVCQUF1QixHQUFHLE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLGdDQUFj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LFNBQVMsRUFBRSx3Q0FBc0IsQ0FBQyxlQUFlO3FCQUNwRCxDQUFBO2FBQ1I7U0FDSjtLQUNKO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDVixNQUFNLFlBQVksR0FBRyxvQ0FBb0MsU0FBUyxhQUFhLEdBQUcsRUFBRSxDQUFDO1FBQ3JGLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDMUIsT0FBTztZQUNILFlBQVksRUFBRSxZQUFZO1lBQzFCLFNBQVMsRUFBRSx3Q0FBc0IsQ0FBQyxlQUFlO1NBQ3BELENBQUE7S0FDSjtBQUNMLENBQUMsQ0FBQTtBQTVRWSxRQUFBLGtCQUFrQixzQkE0UTlCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtBdHRyaWJ1dGVWYWx1ZSwgRHluYW1vREJDbGllbnQsIEdldEl0ZW1Db21tYW5kLCBQdXRJdGVtQ29tbWFuZH0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1keW5hbW9kYlwiO1xuaW1wb3J0IHtcbiAgICBDb3VyaWVyQ2xpZW50LFxuICAgIENyZWF0ZU5vdGlmaWNhdGlvbklucHV0LFxuICAgIENyZWF0ZU5vdGlmaWNhdGlvblJlc3BvbnNlLFxuICAgIE5vdGlmaWNhdGlvbixcbiAgICBOb3RpZmljYXRpb25DaGFubmVsVHlwZSxcbiAgICBOb3RpZmljYXRpb25SZXNwb25zZSxcbiAgICBOb3RpZmljYXRpb25zRXJyb3JUeXBlLFxuICAgIE5vdGlmaWNhdGlvblR5cGVcbn0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcblxuLyoqXG4gKiBDcmVhdGVOb3RpZmljYXRpb24gcmVzb2x2ZXJcbiAqXG4gKiBAcGFyYW0gZmllbGROYW1lIG5hbWUgb2YgdGhlIHJlc29sdmVyIHBhdGggZnJvbSB0aGUgQXBwU3luYyBldmVudFxuICogQHBhcmFtIGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0IGNyZWF0ZSBub3RpZmljYXRpb25zIGlucHV0IG9iamVjdCwgdXNlZCB0byBjcmVhdGUgYSBub3RpZmljYXRpb25cbiAqIGJhc2VkIG9uIGFuIGV2ZW50IChyZWltYnVyc2VtZW50LCB0cmFuc2FjdGlvbiwgY2FyZCBleHBpcmF0aW9uLCBzdWNjZXNzZnVsIHJlZ2lzdHJhdGlvbikuXG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIENyZWF0ZU5vdGlmaWNhdGlvblJlc3BvbnNlfVxuICovXG5leHBvcnQgY29uc3QgY3JlYXRlTm90aWZpY2F0aW9uID0gYXN5bmMgKGZpZWxkTmFtZTogc3RyaW5nLCBjcmVhdGVOb3RpZmljYXRpb25JbnB1dDogQ3JlYXRlTm90aWZpY2F0aW9uSW5wdXQpOiBQcm9taXNlPENyZWF0ZU5vdGlmaWNhdGlvblJlc3BvbnNlPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gcmV0cmlldmluZyB0aGUgY3VycmVudCBmdW5jdGlvbiByZWdpb25cbiAgICAgICAgY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiE7XG5cbiAgICAgICAgLy8gaW5pdGlhbGl6aW5nIHRoZSBEeW5hbW9EQiBkb2N1bWVudCBjbGllbnRcbiAgICAgICAgY29uc3QgZHluYW1vRGJDbGllbnQgPSBuZXcgRHluYW1vREJDbGllbnQoe3JlZ2lvbjogcmVnaW9ufSk7XG5cbiAgICAgICAgLy8gdXBkYXRlIHRoZSB0aW1lc3RhbXBzIGFjY29yZGluZ2x5XG4gICAgICAgIGNvbnN0IGNyZWF0ZWRBdCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICAgICAgY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQudGltZXN0YW1wID0gY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQudGltZXN0YW1wID8gY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQudGltZXN0YW1wIDogRGF0ZS5wYXJzZShjcmVhdGVkQXQpO1xuICAgICAgICBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5jcmVhdGVkQXQgPSBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5jcmVhdGVkQXQgPyBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5jcmVhdGVkQXQgOiBjcmVhdGVkQXQ7XG4gICAgICAgIGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnVwZGF0ZWRBdCA9IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnVwZGF0ZWRBdCA/IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnVwZGF0ZWRBdCA6IGNyZWF0ZWRBdDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogY2hlY2sgdG8gc2VlIGlmIHRoZSBzYW1lIG5vdGlmaWNhdGlvbnMgYWxyZWFkeSBleGlzdHMgaW4gdGhlIERCLiBBbHRob3VnaCB0aGlzIGlzIGEgdmVyeSByYXJlIHNpdHVhdGlvbiAoaWYgYXQgYWxsKSxcbiAgICAgICAgICogd2Ugd2FudCB0byBwdXQgYSBzYWZlZ3VhcmQgYXJvdW5kIGR1cGxpY2F0ZXMgZXZlbiBoZXJlLlxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3QgcHJlRXhpc3RpbmdOb3RpZmljYXRpb24gPSBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBHZXRJdGVtQ29tbWFuZCh7XG4gICAgICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52Lk5PVElGSUNBVElPTlNfVEFCTEUhLFxuICAgICAgICAgICAgS2V5OiB7XG4gICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuaWRcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRpbWVzdGFtcDoge1xuICAgICAgICAgICAgICAgICAgICBOOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC50aW1lc3RhbXAudG9TdHJpbmcoKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIHdlJ3JlIG5vdCBpbnRlcmVzdGVkIGluIGdldHRpbmcgYWxsIHRoZSBkYXRhIGZvciB0aGlzIGNhbGwsIGp1c3QgdGhlIG1pbmltdW0gZm9yIHVzIHRvIGRldGVybWluZSB3aGV0aGVyIHRoaXMgaXMgYSBkdXBsaWNhdGUgb3Igbm90XG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2FtYXpvbmR5bmFtb2RiL2xhdGVzdC9kZXZlbG9wZXJndWlkZS9SZXNlcnZlZFdvcmRzLmh0bWxcbiAgICAgICAgICAgICAqIEBsaW5rIGh0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9hbWF6b25keW5hbW9kYi9sYXRlc3QvZGV2ZWxvcGVyZ3VpZGUvRXhwcmVzc2lvbnMuRXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzLmh0bWxcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgUHJvamVjdGlvbkV4cHJlc3Npb246ICcjaWRmLCAjdCcsXG4gICAgICAgICAgICBFeHByZXNzaW9uQXR0cmlidXRlTmFtZXM6IHtcbiAgICAgICAgICAgICAgICAnI2lkZic6ICdpZCcsXG4gICAgICAgICAgICAgICAgJyN0JzogJ3RpbWVzdGFtcCdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuXG4gICAgICAgIC8vIGlmIHRoZXJlIGlzIGFuIGl0ZW0gcmV0cmlldmVkLCB0aGVuIHdlIHJldHVybiBhbiBlcnJvclxuICAgICAgICBpZiAocHJlRXhpc3RpbmdOb3RpZmljYXRpb24gJiYgcHJlRXhpc3RpbmdOb3RpZmljYXRpb24uSXRlbSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBpZiB0aGVyZSBpcyBhIHByZS1leGlzdGluZyBub3RpZmljYXRpb24gd2l0aCB0aGUgc2FtZSBjb21wb3NpdGUgcHJpbWFyeSBrZXkgKHVzZXJJZC9pZCwgdGltZXN0YW1wKSBjb21iaW5hdGlvbixcbiAgICAgICAgICAgICAqIHRoZW4gd2UgY2Fubm90IGR1cGxpY2F0ZSB0aGF0LCBzbyB3ZSB3aWxsIHJldHVybiBhbiBlcnJvci5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYER1cGxpY2F0ZSBub3RpZmljYXRpb24gZm91bmQhYDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLkR1cGxpY2F0ZU9iamVjdEZvdW5kXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIGZpcnN0LCB3ZSBuZWVkIHRvIGNhbGwgdGhlIGFwcHJvcHJpYXRlIENvdXJpZXIgQVBJICh3aXRoIHRoZSBhcHByb3ByaWF0ZSBpbXBsZW1lbnRhdGlvbiksIGRlcGVuZGluZyBvbiB0aGUgTm90aWZpY2F0aW9uXG4gICAgICAgICAgICAgKiB0eXBlLCBhcyB3ZWxsIGFzIHRoZSBjaGFubmVsLCB0byBiZSBwYXNzZWQgaW4uXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogaW5pdGlhbGl6ZSB0aGUgQ291cmllciBDbGllbnQgQVBJIGhlcmUsIGluIG9yZGVyIHRvIGNhbGwgdGhlIGFwcHJvcHJpYXRlIGVuZHBvaW50cyBmb3IgdGhpcyBoYW5kbGVyXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGNvbnN0IGNvdXJpZXJDbGllbnQgPSBuZXcgQ291cmllckNsaWVudChwcm9jZXNzLmVudi5FTlZfTkFNRSEsIHJlZ2lvbik7XG4gICAgICAgICAgICAvLyBzd2l0Y2ggYmFzZWQgb24gdGhlIHR5cGUgZmlyc3RcbiAgICAgICAgICAgIHN3aXRjaCAoY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQudHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgTm90aWZpY2F0aW9uVHlwZS5OZXdVc2VyU2lnbnVwOlxuICAgICAgICAgICAgICAgICAgICAvLyBmb3IgZWFjaCBub3RpZmljYXRpb24gdHlwZSwgZGVwZW5kaW5nIG9uIHRoZSBub3RpZmljYXRpb24gY2hhbm5lbCwgZGV0ZXJtaW5lIGhvdyB0byBzdHJ1Y3R1cmUgdGhlIG5vdGlmaWNhdGlvblxuICAgICAgICAgICAgICAgICAgICBpZiAoY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuY2hhbm5lbFR5cGUgPT09IE5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlLkVtYWlsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB2YWxpZGF0ZSB0aGF0IHdlIGhhdmUgdGhlIG5lY2Vzc2FyeSBpbmZvcm1hdGlvbiB0byBzZW5kIGFuIGVtYWlsXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuZW1haWxEZXN0aW5hdGlvbiAmJiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5lbWFpbERlc3RpbmF0aW9uLmxlbmd0aCAhPT0gMCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnVzZXJGdWxsTmFtZSAmJiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC51c2VyRnVsbE5hbWUubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYXR0ZW1wdCB0byBzZW5kIGFuIGVtYWlsIG5vdGlmaWNhdGlvbiBmaXJzdCB0aHJvdWdoIENvdXJpZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzZW5kRW1haWxOb3RpZmljYXRpb25SZXNwb25zZTogTm90aWZpY2F0aW9uUmVzcG9uc2UgPSBhd2FpdCBjb3VyaWVyQ2xpZW50LnNlbmRFbWFpbE5vdGlmaWNhdGlvbih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVtYWlsRGVzdGluYXRpb246IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmVtYWlsRGVzdGluYXRpb24hLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VyRnVsbE5hbWU6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnVzZXJGdWxsTmFtZSFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGUgZW1haWwgbm90aWZpY2F0aW9uIHdhcyBzdWNjZXNzZnVsbHkgc2VudCBvciBub3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXNlbmRFbWFpbE5vdGlmaWNhdGlvblJlc3BvbnNlIHx8IHNlbmRFbWFpbE5vdGlmaWNhdGlvblJlc3BvbnNlLmVycm9yTWVzc2FnZSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZW5kRW1haWxOb3RpZmljYXRpb25SZXNwb25zZS5lcnJvclR5cGUgfHwgIXNlbmRFbWFpbE5vdGlmaWNhdGlvblJlc3BvbnNlLnJlcXVlc3RJZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgRW1haWwgbm90aWZpY2F0aW9uIHNlbmRpbmcgdGhyb3VnaCB0aGUgUE9TVCBDb3VyaWVyIHNlbmQgZW1haWwgbWVzc2FnZSBjYWxsIGZhaWxlZCAke0pTT04uc3RyaW5naWZ5KHNlbmRFbWFpbE5vdGlmaWNhdGlvblJlc3BvbnNlKX1gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNldCB0aGUgbm90aWZpY2F0aW9uIGlkLCBmcm9tIHRoZSBDb3VyaWVyIGNhbGwgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQubm90aWZpY2F0aW9uSWQgPSBzZW5kRW1haWxOb3RpZmljYXRpb25SZXNwb25zZS5yZXF1ZXN0SWQhO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHN0b3JlIHRoZSBzdWNjZXNzZnVsbHkgc2VudCBub3RpZmljYXRpb24gb2JqZWN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IFB1dEl0ZW1Db21tYW5kKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuTk9USUZJQ0FUSU9OU19UQUJMRSEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBJdGVtOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuaWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBOOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC50aW1lc3RhbXAudG9TdHJpbmcoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uSWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQubm90aWZpY2F0aW9uSWQhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbWFpbERlc3RpbmF0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmVtYWlsRGVzdGluYXRpb24hXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VyRnVsbE5hbWU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQudXNlckZ1bGxOYW1lIVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnN0YXR1c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhbm5lbFR5cGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuY2hhbm5lbFR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQudHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEF0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlZEF0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uKGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmFjdGlvblVybCAmJiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvblVybDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuYWN0aW9uVXJsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgc3VjY2Vzc2Z1bGx5IHNlbnQgbm90aWZpY2F0aW9uIGluZm9ybWF0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dCBhcyBOb3RpZmljYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYEludmFsaWQgaW5mb3JtYXRpb24gcGFzc2VkIGluLCB0byBwcm9jZXNzIGEgbm90aWZpY2F0aW9uIHRocm91Z2ggJHtjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5jaGFubmVsVHlwZX0sIGZvciBub3RpZmljYXRpb24gdHlwZSAke2NyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnR5cGV9YDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuc3VwcG9ydGVkIG5vdGlmaWNhdGlvbiBjaGFubmVsICR7Y3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuY2hhbm5lbFR5cGV9LCBmb3Igbm90aWZpY2F0aW9uIHR5cGUgJHtjcmVhdGVOb3RpZmljYXRpb25JbnB1dC50eXBlfWA7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXNlIE5vdGlmaWNhdGlvblR5cGUuTmV3UXVhbGlmeWluZ09mZmVyQXZhaWxhYmxlOlxuICAgICAgICAgICAgICAgICAgICAvLyBmb3IgZWFjaCBub3RpZmljYXRpb24gdHlwZSwgZGVwZW5kaW5nIG9uIHRoZSBub3RpZmljYXRpb24gY2hhbm5lbCwgZGV0ZXJtaW5lIGhvdyB0byBzdHJ1Y3R1cmUgdGhlIG5vdGlmaWNhdGlvblxuICAgICAgICAgICAgICAgICAgICBpZiAoY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuY2hhbm5lbFR5cGUgPT09IE5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlLlB1c2gpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHZhbGlkYXRlIHRoYXQgd2UgaGF2ZSB0aGUgbmVjZXNzYXJ5IGluZm9ybWF0aW9uIHRvIHNlbmQgYSBtb2JpbGUgcHVzaFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmV4cG9QdXNoVG9rZW5zICYmIGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmV4cG9QdXNoVG9rZW5zLmxlbmd0aCAhPT0gMCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnBlbmRpbmdDYXNoYmFjayAmJiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5tZXJjaGFudE5hbWUgJiYgY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQubWVyY2hhbnROYW1lLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGF0dGVtcHQgdG8gc2VuZCBhIG1vYmlsZSBwdXNoIG5vdGlmaWNhdGlvbiBmaXJzdCB0aHJvdWdoIENvdXJpZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzZW5kTW9iaWxlUHVzaE5vdGlmaWNhdGlvblJlc3BvbnNlOiBOb3RpZmljYXRpb25SZXNwb25zZSA9IGF3YWl0IGNvdXJpZXJDbGllbnQuc2VuZE1vYmlsZVB1c2hOb3RpZmljYXRpb24oe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHBvUHVzaFRva2VuczogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuZXhwb1B1c2hUb2tlbnMhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXJjaGFudE5hbWU6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0Lm1lcmNoYW50TmFtZSEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBlbmRpbmdDYXNoYmFjazogTnVtYmVyKGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnBlbmRpbmdDYXNoYmFjayEudG9GaXhlZCgyKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGUgbW9iaWxlIHB1c2ggbm90aWZpY2F0aW9uIHdhcyBzdWNjZXNzZnVsbHkgc2VudCBvciBub3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXNlbmRNb2JpbGVQdXNoTm90aWZpY2F0aW9uUmVzcG9uc2UgfHwgc2VuZE1vYmlsZVB1c2hOb3RpZmljYXRpb25SZXNwb25zZS5lcnJvck1lc3NhZ2UgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VuZE1vYmlsZVB1c2hOb3RpZmljYXRpb25SZXNwb25zZS5lcnJvclR5cGUgfHwgIXNlbmRNb2JpbGVQdXNoTm90aWZpY2F0aW9uUmVzcG9uc2UucmVxdWVzdElkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBNb2JpbGUgcHVzaCBub3RpZmljYXRpb24gc2VuZGluZyB0aHJvdWdoIHRoZSBQT1NUIENvdXJpZXIgc2VuZCBwdXNoIG5vdGlmaWNhdGlvbiBtZXNzYWdlIGNhbGwgZmFpbGVkICR7SlNPTi5zdHJpbmdpZnkoc2VuZE1vYmlsZVB1c2hOb3RpZmljYXRpb25SZXNwb25zZSl9YFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzZXQgdGhlIG5vdGlmaWNhdGlvbiBpZCwgZnJvbSB0aGUgQ291cmllciBjYWxsIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0Lm5vdGlmaWNhdGlvbklkID0gc2VuZE1vYmlsZVB1c2hOb3RpZmljYXRpb25SZXNwb25zZS5yZXF1ZXN0SWQhO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNyZWF0ZSBhIER5bmFtbyBEQiBzdHJ1Y3R1cmUgYXJyYXksIHRvIGhvbGQgdGhlIGluY29taW5nIGV4cG8gcHVzaCB0b2tlbnNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXhwb1B1c2hUb2tlbnM6IEF0dHJpYnV0ZVZhbHVlW10gPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBwdXNoVG9rZW4gb2YgY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuZXhwb1B1c2hUb2tlbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cG9QdXNoVG9rZW5zLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE06IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW5JZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogcHVzaFRva2VuIVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzdG9yZSB0aGUgc3VjY2Vzc2Z1bGx5IHNlbnQgbm90aWZpY2F0aW9uIG9iamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBQdXRJdGVtQ29tbWFuZCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52Lk5PVElGSUNBVElPTlNfVEFCTEUhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgSXRlbToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmlkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTjogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQudGltZXN0YW1wLnRvU3RyaW5nKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbklkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0Lm5vdGlmaWNhdGlvbklkIVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwb1B1c2hUb2tlbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTDogZXhwb1B1c2hUb2tlbnNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1czoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5zdGF0dXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5uZWxUeXBlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmNoYW5uZWxUeXBlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5jcmVhdGVkQXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRBdDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC51cGRhdGVkQXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLihjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5hY3Rpb25VcmwgJiYge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb25Vcmw6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmFjdGlvblVybFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIHN1Y2Nlc3NmdWxseSBzZW50IG5vdGlmaWNhdGlvbiBpbmZvcm1hdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQgYXMgTm90aWZpY2F0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBJbnZhbGlkIGluZm9ybWF0aW9uIHBhc3NlZCBpbiwgdG8gcHJvY2VzcyBhIG5vdGlmaWNhdGlvbiB0aHJvdWdoICR7Y3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuY2hhbm5lbFR5cGV9LCBmb3Igbm90aWZpY2F0aW9uIHR5cGUgJHtjcmVhdGVOb3RpZmljYXRpb25JbnB1dC50eXBlfWA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbnN1cHBvcnRlZCBub3RpZmljYXRpb24gY2hhbm5lbCAke2NyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmNoYW5uZWxUeXBlfSwgZm9yIG5vdGlmaWNhdGlvbiB0eXBlICR7Y3JlYXRlTm90aWZpY2F0aW9uSW5wdXQudHlwZX1gO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgbm90aWZpY2F0aW9uIHR5cGUgJHtjcmVhdGVOb3RpZmljYXRpb25JbnB1dC50eXBlfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyAke2ZpZWxkTmFtZX0gbXV0YXRpb24gJHtlcnJ9YDtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICB9XG4gICAgfVxufVxuIl19