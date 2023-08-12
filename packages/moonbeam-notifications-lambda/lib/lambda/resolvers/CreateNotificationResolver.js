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
                                pendingCashback: createNotificationInput.pendingCashback
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXRlTm90aWZpY2F0aW9uUmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL3Jlc29sdmVycy9DcmVhdGVOb3RpZmljYXRpb25SZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw4REFBd0c7QUFDeEcsK0RBU21DO0FBRW5DOzs7Ozs7O0dBT0c7QUFDSSxNQUFNLGtCQUFrQixHQUFHLEtBQUssRUFBRSxTQUFpQixFQUFFLHVCQUFnRCxFQUF1QyxFQUFFO0lBQ2pKLElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsNENBQTRDO1FBQzVDLE1BQU0sY0FBYyxHQUFHLElBQUksZ0NBQWMsQ0FBQyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBRTVELG9DQUFvQztRQUNwQyxNQUFNLFNBQVMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzNDLHVCQUF1QixDQUFDLFNBQVMsR0FBRyx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLHVCQUF1QixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNsSSx1QkFBdUIsQ0FBQyxTQUFTLEdBQUcsdUJBQXVCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUN0SCx1QkFBdUIsQ0FBQyxTQUFTLEdBQUcsdUJBQXVCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUV0SDs7O1dBR0c7UUFDSCxNQUFNLHVCQUF1QixHQUFHLE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLGdDQUFj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YUFDUjtTQUNKO0tBQ0o7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNWLE1BQU0sWUFBWSxHQUFHLG9DQUFvQyxTQUFTLGFBQWEsR0FBRyxFQUFFLENBQUM7UUFDckYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMxQixPQUFPO1lBQ0gsWUFBWSxFQUFFLFlBQVk7WUFDMUIsU0FBUyxFQUFFLHdDQUFzQixDQUFDLGVBQWU7U0FDcEQsQ0FBQTtLQUNKO0FBQ0wsQ0FBQyxDQUFBO0FBNVFZLFFBQUEsa0JBQWtCLHNCQTRROUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0F0dHJpYnV0ZVZhbHVlLCBEeW5hbW9EQkNsaWVudCwgR2V0SXRlbUNvbW1hbmQsIFB1dEl0ZW1Db21tYW5kfSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LWR5bmFtb2RiXCI7XG5pbXBvcnQge1xuICAgIENvdXJpZXJDbGllbnQsXG4gICAgQ3JlYXRlTm90aWZpY2F0aW9uSW5wdXQsXG4gICAgQ3JlYXRlTm90aWZpY2F0aW9uUmVzcG9uc2UsXG4gICAgTm90aWZpY2F0aW9uLFxuICAgIE5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlLFxuICAgIE5vdGlmaWNhdGlvblJlc3BvbnNlLFxuICAgIE5vdGlmaWNhdGlvbnNFcnJvclR5cGUsXG4gICAgTm90aWZpY2F0aW9uVHlwZVxufSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuXG4vKipcbiAqIENyZWF0ZU5vdGlmaWNhdGlvbiByZXNvbHZlclxuICpcbiAqIEBwYXJhbSBmaWVsZE5hbWUgbmFtZSBvZiB0aGUgcmVzb2x2ZXIgcGF0aCBmcm9tIHRoZSBBcHBTeW5jIGV2ZW50XG4gKiBAcGFyYW0gY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQgY3JlYXRlIG5vdGlmaWNhdGlvbnMgaW5wdXQgb2JqZWN0LCB1c2VkIHRvIGNyZWF0ZSBhIG5vdGlmaWNhdGlvblxuICogYmFzZWQgb24gYW4gZXZlbnQgKHJlaW1idXJzZW1lbnQsIHRyYW5zYWN0aW9uLCBjYXJkIGV4cGlyYXRpb24sIHN1Y2Nlc3NmdWwgcmVnaXN0cmF0aW9uKS5cbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgQ3JlYXRlTm90aWZpY2F0aW9uUmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCBjcmVhdGVOb3RpZmljYXRpb24gPSBhc3luYyAoZmllbGROYW1lOiBzdHJpbmcsIGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0OiBDcmVhdGVOb3RpZmljYXRpb25JbnB1dCk6IFByb21pc2U8Q3JlYXRlTm90aWZpY2F0aW9uUmVzcG9uc2U+ID0+IHtcbiAgICB0cnkge1xuICAgICAgICAvLyByZXRyaWV2aW5nIHRoZSBjdXJyZW50IGZ1bmN0aW9uIHJlZ2lvblxuICAgICAgICBjb25zdCByZWdpb24gPSBwcm9jZXNzLmVudi5BV1NfUkVHSU9OITtcblxuICAgICAgICAvLyBpbml0aWFsaXppbmcgdGhlIER5bmFtb0RCIGRvY3VtZW50IGNsaWVudFxuICAgICAgICBjb25zdCBkeW5hbW9EYkNsaWVudCA9IG5ldyBEeW5hbW9EQkNsaWVudCh7cmVnaW9uOiByZWdpb259KTtcblxuICAgICAgICAvLyB1cGRhdGUgdGhlIHRpbWVzdGFtcHMgYWNjb3JkaW5nbHlcbiAgICAgICAgY29uc3QgY3JlYXRlZEF0ID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgICAgICBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC50aW1lc3RhbXAgPSBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC50aW1lc3RhbXAgPyBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC50aW1lc3RhbXAgOiBEYXRlLnBhcnNlKGNyZWF0ZWRBdCk7XG4gICAgICAgIGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmNyZWF0ZWRBdCA9IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmNyZWF0ZWRBdCA/IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmNyZWF0ZWRBdCA6IGNyZWF0ZWRBdDtcbiAgICAgICAgY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQudXBkYXRlZEF0ID0gY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQudXBkYXRlZEF0ID8gY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQudXBkYXRlZEF0IDogY3JlYXRlZEF0O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBjaGVjayB0byBzZWUgaWYgdGhlIHNhbWUgbm90aWZpY2F0aW9ucyBhbHJlYWR5IGV4aXN0cyBpbiB0aGUgREIuIEFsdGhvdWdoIHRoaXMgaXMgYSB2ZXJ5IHJhcmUgc2l0dWF0aW9uIChpZiBhdCBhbGwpLFxuICAgICAgICAgKiB3ZSB3YW50IHRvIHB1dCBhIHNhZmVndWFyZCBhcm91bmQgZHVwbGljYXRlcyBldmVuIGhlcmUuXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBwcmVFeGlzdGluZ05vdGlmaWNhdGlvbiA9IGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IEdldEl0ZW1Db21tYW5kKHtcbiAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuTk9USUZJQ0FUSU9OU19UQUJMRSEsXG4gICAgICAgICAgICBLZXk6IHtcbiAgICAgICAgICAgICAgICBpZDoge1xuICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5pZFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGltZXN0YW1wOiB7XG4gICAgICAgICAgICAgICAgICAgIE46IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnRpbWVzdGFtcC50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogd2UncmUgbm90IGludGVyZXN0ZWQgaW4gZ2V0dGluZyBhbGwgdGhlIGRhdGEgZm9yIHRoaXMgY2FsbCwganVzdCB0aGUgbWluaW11bSBmb3IgdXMgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdGhpcyBpcyBhIGR1cGxpY2F0ZSBvciBub3RcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBAbGluayBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vYW1hem9uZHluYW1vZGIvbGF0ZXN0L2RldmVsb3Blcmd1aWRlL1Jlc2VydmVkV29yZHMuaHRtbFxuICAgICAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2FtYXpvbmR5bmFtb2RiL2xhdGVzdC9kZXZlbG9wZXJndWlkZS9FeHByZXNzaW9ucy5FeHByZXNzaW9uQXR0cmlidXRlTmFtZXMuaHRtbFxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBQcm9qZWN0aW9uRXhwcmVzc2lvbjogJyNpZGYsICN0JyxcbiAgICAgICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lczoge1xuICAgICAgICAgICAgICAgICcjaWRmJzogJ2lkJyxcbiAgICAgICAgICAgICAgICAnI3QnOiAndGltZXN0YW1wJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG5cbiAgICAgICAgLy8gaWYgdGhlcmUgaXMgYW4gaXRlbSByZXRyaWV2ZWQsIHRoZW4gd2UgcmV0dXJuIGFuIGVycm9yXG4gICAgICAgIGlmIChwcmVFeGlzdGluZ05vdGlmaWNhdGlvbiAmJiBwcmVFeGlzdGluZ05vdGlmaWNhdGlvbi5JdGVtKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIGlmIHRoZXJlIGlzIGEgcHJlLWV4aXN0aW5nIG5vdGlmaWNhdGlvbiB3aXRoIHRoZSBzYW1lIGNvbXBvc2l0ZSBwcmltYXJ5IGtleSAodXNlcklkL2lkLCB0aW1lc3RhbXApIGNvbWJpbmF0aW9uLFxuICAgICAgICAgICAgICogdGhlbiB3ZSBjYW5ub3QgZHVwbGljYXRlIHRoYXQsIHNvIHdlIHdpbGwgcmV0dXJuIGFuIGVycm9yLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgRHVwbGljYXRlIG5vdGlmaWNhdGlvbiBmb3VuZCFgO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuRHVwbGljYXRlT2JqZWN0Rm91bmRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogZmlyc3QsIHdlIG5lZWQgdG8gY2FsbCB0aGUgYXBwcm9wcmlhdGUgQ291cmllciBBUEkgKHdpdGggdGhlIGFwcHJvcHJpYXRlIGltcGxlbWVudGF0aW9uKSwgZGVwZW5kaW5nIG9uIHRoZSBOb3RpZmljYXRpb25cbiAgICAgICAgICAgICAqIHR5cGUsIGFzIHdlbGwgYXMgdGhlIGNoYW5uZWwsIHRvIGJlIHBhc3NlZCBpbi5cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBpbml0aWFsaXplIHRoZSBDb3VyaWVyIENsaWVudCBBUEkgaGVyZSwgaW4gb3JkZXIgdG8gY2FsbCB0aGUgYXBwcm9wcmlhdGUgZW5kcG9pbnRzIGZvciB0aGlzIGhhbmRsZXJcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgY29uc3QgY291cmllckNsaWVudCA9IG5ldyBDb3VyaWVyQ2xpZW50KHByb2Nlc3MuZW52LkVOVl9OQU1FISwgcmVnaW9uKTtcbiAgICAgICAgICAgIC8vIHN3aXRjaCBiYXNlZCBvbiB0aGUgdHlwZSBmaXJzdFxuICAgICAgICAgICAgc3dpdGNoIChjcmVhdGVOb3RpZmljYXRpb25JbnB1dC50eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBOb3RpZmljYXRpb25UeXBlLk5ld1VzZXJTaWdudXA6XG4gICAgICAgICAgICAgICAgICAgIC8vIGZvciBlYWNoIG5vdGlmaWNhdGlvbiB0eXBlLCBkZXBlbmRpbmcgb24gdGhlIG5vdGlmaWNhdGlvbiBjaGFubmVsLCBkZXRlcm1pbmUgaG93IHRvIHN0cnVjdHVyZSB0aGUgbm90aWZpY2F0aW9uXG4gICAgICAgICAgICAgICAgICAgIGlmIChjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5jaGFubmVsVHlwZSA9PT0gTm90aWZpY2F0aW9uQ2hhbm5lbFR5cGUuRW1haWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHZhbGlkYXRlIHRoYXQgd2UgaGF2ZSB0aGUgbmVjZXNzYXJ5IGluZm9ybWF0aW9uIHRvIHNlbmQgYW4gZW1haWxcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5lbWFpbERlc3RpbmF0aW9uICYmIGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmVtYWlsRGVzdGluYXRpb24ubGVuZ3RoICE9PSAwICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQudXNlckZ1bGxOYW1lICYmIGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnVzZXJGdWxsTmFtZS5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhdHRlbXB0IHRvIHNlbmQgYW4gZW1haWwgbm90aWZpY2F0aW9uIGZpcnN0IHRocm91Z2ggQ291cmllclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNlbmRFbWFpbE5vdGlmaWNhdGlvblJlc3BvbnNlOiBOb3RpZmljYXRpb25SZXNwb25zZSA9IGF3YWl0IGNvdXJpZXJDbGllbnQuc2VuZEVtYWlsTm90aWZpY2F0aW9uKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW1haWxEZXN0aW5hdGlvbjogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuZW1haWxEZXN0aW5hdGlvbiEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJGdWxsTmFtZTogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQudXNlckZ1bGxOYW1lIVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSBlbWFpbCBub3RpZmljYXRpb24gd2FzIHN1Y2Nlc3NmdWxseSBzZW50IG9yIG5vdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghc2VuZEVtYWlsTm90aWZpY2F0aW9uUmVzcG9uc2UgfHwgc2VuZEVtYWlsTm90aWZpY2F0aW9uUmVzcG9uc2UuZXJyb3JNZXNzYWdlIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbmRFbWFpbE5vdGlmaWNhdGlvblJlc3BvbnNlLmVycm9yVHlwZSB8fCAhc2VuZEVtYWlsTm90aWZpY2F0aW9uUmVzcG9uc2UucmVxdWVzdElkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBFbWFpbCBub3RpZmljYXRpb24gc2VuZGluZyB0aHJvdWdoIHRoZSBQT1NUIENvdXJpZXIgc2VuZCBlbWFpbCBtZXNzYWdlIGNhbGwgZmFpbGVkICR7SlNPTi5zdHJpbmdpZnkoc2VuZEVtYWlsTm90aWZpY2F0aW9uUmVzcG9uc2UpfWBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2V0IHRoZSBub3RpZmljYXRpb24gaWQsIGZyb20gdGhlIENvdXJpZXIgY2FsbCByZXNwb25zZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5ub3RpZmljYXRpb25JZCA9IHNlbmRFbWFpbE5vdGlmaWNhdGlvblJlc3BvbnNlLnJlcXVlc3RJZCE7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gc3RvcmUgdGhlIHN1Y2Nlc3NmdWxseSBzZW50IG5vdGlmaWNhdGlvbiBvYmplY3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgZHluYW1vRGJDbGllbnQuc2VuZChuZXcgUHV0SXRlbUNvbW1hbmQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5OT1RJRklDQVRJT05TX1RBQkxFISxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEl0ZW06IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5pZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE46IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnRpbWVzdGFtcC50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3RpZmljYXRpb25JZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5ub3RpZmljYXRpb25JZCFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVtYWlsRGVzdGluYXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuZW1haWxEZXN0aW5hdGlvbiFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJGdWxsTmFtZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC51c2VyRnVsbE5hbWUhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuc3RhdHVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFubmVsVHlwZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5jaGFubmVsVHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC50eXBlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVkQXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQudXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi4oY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuYWN0aW9uVXJsICYmIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uVXJsOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5hY3Rpb25VcmxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBzdWNjZXNzZnVsbHkgc2VudCBub3RpZmljYXRpb24gaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0IGFzIE5vdGlmaWNhdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgSW52YWxpZCBpbmZvcm1hdGlvbiBwYXNzZWQgaW4sIHRvIHByb2Nlc3MgYSBub3RpZmljYXRpb24gdGhyb3VnaCAke2NyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmNoYW5uZWxUeXBlfSwgZm9yIG5vdGlmaWNhdGlvbiB0eXBlICR7Y3JlYXRlTm90aWZpY2F0aW9uSW5wdXQudHlwZX1gO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5zdXBwb3J0ZWQgbm90aWZpY2F0aW9uIGNoYW5uZWwgJHtjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5jaGFubmVsVHlwZX0sIGZvciBub3RpZmljYXRpb24gdHlwZSAke2NyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnR5cGV9YDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhc2UgTm90aWZpY2F0aW9uVHlwZS5OZXdRdWFsaWZ5aW5nT2ZmZXJBdmFpbGFibGU6XG4gICAgICAgICAgICAgICAgICAgIC8vIGZvciBlYWNoIG5vdGlmaWNhdGlvbiB0eXBlLCBkZXBlbmRpbmcgb24gdGhlIG5vdGlmaWNhdGlvbiBjaGFubmVsLCBkZXRlcm1pbmUgaG93IHRvIHN0cnVjdHVyZSB0aGUgbm90aWZpY2F0aW9uXG4gICAgICAgICAgICAgICAgICAgIGlmIChjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5jaGFubmVsVHlwZSA9PT0gTm90aWZpY2F0aW9uQ2hhbm5lbFR5cGUuUHVzaCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdmFsaWRhdGUgdGhhdCB3ZSBoYXZlIHRoZSBuZWNlc3NhcnkgaW5mb3JtYXRpb24gdG8gc2VuZCBhIG1vYmlsZSBwdXNoXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuZXhwb1B1c2hUb2tlbnMgJiYgY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuZXhwb1B1c2hUb2tlbnMubGVuZ3RoICE9PSAwICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQucGVuZGluZ0Nhc2hiYWNrICYmIGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0Lm1lcmNoYW50TmFtZSAmJiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5tZXJjaGFudE5hbWUubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYXR0ZW1wdCB0byBzZW5kIGEgbW9iaWxlIHB1c2ggbm90aWZpY2F0aW9uIGZpcnN0IHRocm91Z2ggQ291cmllclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNlbmRNb2JpbGVQdXNoTm90aWZpY2F0aW9uUmVzcG9uc2U6IE5vdGlmaWNhdGlvblJlc3BvbnNlID0gYXdhaXQgY291cmllckNsaWVudC5zZW5kTW9iaWxlUHVzaE5vdGlmaWNhdGlvbih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cG9QdXNoVG9rZW5zOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5leHBvUHVzaFRva2VucyEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lcmNoYW50TmFtZTogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQubWVyY2hhbnROYW1lISxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGVuZGluZ0Nhc2hiYWNrOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5wZW5kaW5nQ2FzaGJhY2shXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIG1vYmlsZSBwdXNoIG5vdGlmaWNhdGlvbiB3YXMgc3VjY2Vzc2Z1bGx5IHNlbnQgb3Igbm90XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFzZW5kTW9iaWxlUHVzaE5vdGlmaWNhdGlvblJlc3BvbnNlIHx8IHNlbmRNb2JpbGVQdXNoTm90aWZpY2F0aW9uUmVzcG9uc2UuZXJyb3JNZXNzYWdlIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbmRNb2JpbGVQdXNoTm90aWZpY2F0aW9uUmVzcG9uc2UuZXJyb3JUeXBlIHx8ICFzZW5kTW9iaWxlUHVzaE5vdGlmaWNhdGlvblJlc3BvbnNlLnJlcXVlc3RJZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTW9iaWxlIHB1c2ggbm90aWZpY2F0aW9uIHNlbmRpbmcgdGhyb3VnaCB0aGUgUE9TVCBDb3VyaWVyIHNlbmQgcHVzaCBub3RpZmljYXRpb24gbWVzc2FnZSBjYWxsIGZhaWxlZCAke0pTT04uc3RyaW5naWZ5KHNlbmRNb2JpbGVQdXNoTm90aWZpY2F0aW9uUmVzcG9uc2UpfWBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2V0IHRoZSBub3RpZmljYXRpb24gaWQsIGZyb20gdGhlIENvdXJpZXIgY2FsbCByZXNwb25zZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5ub3RpZmljYXRpb25JZCA9IHNlbmRNb2JpbGVQdXNoTm90aWZpY2F0aW9uUmVzcG9uc2UucmVxdWVzdElkITtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjcmVhdGUgYSBEeW5hbW8gREIgc3RydWN0dXJlIGFycmF5LCB0byBob2xkIHRoZSBpbmNvbWluZyBleHBvIHB1c2ggdG9rZW5zXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGV4cG9QdXNoVG9rZW5zOiBBdHRyaWJ1dGVWYWx1ZVtdID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgcHVzaFRva2VuIG9mIGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmV4cG9QdXNoVG9rZW5zKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHBvUHVzaFRva2Vucy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBNOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRva2VuSWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IHB1c2hUb2tlbiFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gc3RvcmUgdGhlIHN1Y2Nlc3NmdWxseSBzZW50IG5vdGlmaWNhdGlvbiBvYmplY3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgZHluYW1vRGJDbGllbnQuc2VuZChuZXcgUHV0SXRlbUNvbW1hbmQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5OT1RJRklDQVRJT05TX1RBQkxFISxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEl0ZW06IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5pZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE46IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnRpbWVzdGFtcC50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3RpZmljYXRpb25JZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5ub3RpZmljYXRpb25JZCFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cG9QdXNoVG9rZW5zOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEw6IGV4cG9QdXNoVG9rZW5zXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuc3RhdHVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFubmVsVHlwZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5jaGFubmVsVHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC50eXBlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVkQXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQudXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi4oY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuYWN0aW9uVXJsICYmIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uVXJsOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5hY3Rpb25VcmxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBzdWNjZXNzZnVsbHkgc2VudCBub3RpZmljYXRpb24gaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0IGFzIE5vdGlmaWNhdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgSW52YWxpZCBpbmZvcm1hdGlvbiBwYXNzZWQgaW4sIHRvIHByb2Nlc3MgYSBub3RpZmljYXRpb24gdGhyb3VnaCAke2NyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmNoYW5uZWxUeXBlfSwgZm9yIG5vdGlmaWNhdGlvbiB0eXBlICR7Y3JlYXRlTm90aWZpY2F0aW9uSW5wdXQudHlwZX1gO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5zdXBwb3J0ZWQgbm90aWZpY2F0aW9uIGNoYW5uZWwgJHtjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5jaGFubmVsVHlwZX0sIGZvciBub3RpZmljYXRpb24gdHlwZSAke2NyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnR5cGV9YDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIG5vdGlmaWNhdGlvbiB0eXBlICR7Y3JlYXRlTm90aWZpY2F0aW9uSW5wdXQudHlwZX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgJHtmaWVsZE5hbWV9IG11dGF0aW9uICR7ZXJyfWA7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==