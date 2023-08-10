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
                    // for each type, determine the type of notification that we need to send for the passed in channel
                    if (createNotificationInput.channelType === moonbeam_models_1.NotificationChannelType.Email) {
                        // validate that we have the necessary information to send an email
                        if (createNotificationInput.emailDestination && createNotificationInput.emailDestination.length !== 0 &&
                            createNotificationInput.userFullName && createNotificationInput.userFullName.length !== 0) {
                            // attempt to send an email notification first through Courier
                            const sendEmailNotificationResponse = await courierClient.sendEmailNotification({
                                emailDestination: createNotificationInput.emailDestination,
                                ...(createNotificationInput.message && {
                                    message: createNotificationInput.message
                                }),
                                ...(createNotificationInput.subject && {
                                    subject: createNotificationInput.subject
                                }),
                                ...(createNotificationInput.title && {
                                    title: createNotificationInput.title
                                }),
                                userFullName: createNotificationInput.userFullName
                            });
                            // check to see if the email notification was successfully sent or not
                            if (!sendEmailNotificationResponse || sendEmailNotificationResponse.errorMessage ||
                                sendEmailNotificationResponse.errorType || !sendEmailNotificationResponse.requestId) {
                                const errorMessage = `Email notification sending through the POST Courier send email message call failed ${sendEmailNotificationResponse}`;
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
                                        ...(createNotificationInput.title && {
                                            title: {
                                                S: createNotificationInput.title
                                            }
                                        }),
                                        ...(createNotificationInput.subject && {
                                            subject: {
                                                S: createNotificationInput.subject
                                            }
                                        }),
                                        ...(createNotificationInput.emailDestination && {
                                            emailDestination: {
                                                S: createNotificationInput.emailDestination
                                            }
                                        }),
                                        ...(createNotificationInput.userFullName && {
                                            userFullName: {
                                                S: createNotificationInput.userFullName
                                            }
                                        }),
                                        ...(createNotificationInput.message && {
                                            message: {
                                                S: createNotificationInput.message
                                            }
                                        }),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXRlTm90aWZpY2F0aW9uUmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL3Jlc29sdmVycy9DcmVhdGVOb3RpZmljYXRpb25SZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw4REFBd0Y7QUFDeEYsK0RBU21DO0FBRW5DOzs7Ozs7O0dBT0c7QUFDSSxNQUFNLGtCQUFrQixHQUFHLEtBQUssRUFBRSxTQUFpQixFQUFFLHVCQUFnRCxFQUF1QyxFQUFFO0lBQ2pKLElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsNENBQTRDO1FBQzVDLE1BQU0sY0FBYyxHQUFHLElBQUksZ0NBQWMsQ0FBQyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBRTVELG9DQUFvQztRQUNwQyxNQUFNLFNBQVMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzNDLHVCQUF1QixDQUFDLFNBQVMsR0FBRyx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLHVCQUF1QixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNsSSx1QkFBdUIsQ0FBQyxTQUFTLEdBQUcsdUJBQXVCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUN0SCx1QkFBdUIsQ0FBQyxTQUFTLEdBQUcsdUJBQXVCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUV0SDs7O1dBR0c7UUFDSCxNQUFNLHVCQUF1QixHQUFHLE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLGdDQUFjLENBQUM7WUFDekUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW9CO1lBQzNDLEdBQUcsRUFBRTtnQkFDRCxFQUFFLEVBQUU7b0JBQ0EsQ0FBQyxFQUFFLHVCQUF1QixDQUFDLEVBQUU7aUJBQ2hDO2dCQUNELFNBQVMsRUFBRTtvQkFDUCxDQUFDLEVBQUUsdUJBQXVCLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRTtpQkFDbEQ7YUFDSjtZQUNEOzs7OztlQUtHO1lBQ0gsb0JBQW9CLEVBQUUsVUFBVTtZQUNoQyx3QkFBd0IsRUFBRTtnQkFDdEIsTUFBTSxFQUFFLElBQUk7Z0JBQ1osSUFBSSxFQUFFLFdBQVc7YUFDcEI7U0FDSixDQUFDLENBQUMsQ0FBQztRQUVKLHlEQUF5RDtRQUN6RCxJQUFJLHVCQUF1QixJQUFJLHVCQUF1QixDQUFDLElBQUksRUFBRTtZQUN6RDs7O2VBR0c7WUFDSCxNQUFNLFlBQVksR0FBRywrQkFBK0IsQ0FBQztZQUNyRCxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRTFCLE9BQU87Z0JBQ0gsWUFBWSxFQUFFLFlBQVk7Z0JBQzFCLFNBQVMsRUFBRSx3Q0FBc0IsQ0FBQyxvQkFBb0I7YUFDekQsQ0FBQTtTQUNKO2FBQU07WUFDSDs7Ozs7ZUFLRztZQUNILE1BQU0sYUFBYSxHQUFHLElBQUksK0JBQWEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUN2RSxpQ0FBaUM7WUFDakMsUUFBUSx1QkFBdUIsQ0FBQyxJQUFJLEVBQUU7Z0JBQ2xDLEtBQUssa0NBQWdCLENBQUMsYUFBYTtvQkFDL0IsbUdBQW1HO29CQUNuRyxJQUFJLHVCQUF1QixDQUFDLFdBQVcsS0FBSyx5Q0FBdUIsQ0FBQyxLQUFLLEVBQUU7d0JBQ3ZFLG1FQUFtRTt3QkFDbkUsSUFBSSx1QkFBdUIsQ0FBQyxnQkFBZ0IsSUFBSSx1QkFBdUIsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEtBQUssQ0FBQzs0QkFDakcsdUJBQXVCLENBQUMsWUFBWSxJQUFJLHVCQUF1QixDQUFDLFlBQVksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFOzRCQUMzRiw4REFBOEQ7NEJBQzlELE1BQU0sNkJBQTZCLEdBQXlCLE1BQU0sYUFBYSxDQUFDLHFCQUFxQixDQUFDO2dDQUNsRyxnQkFBZ0IsRUFBRSx1QkFBdUIsQ0FBQyxnQkFBaUI7Z0NBQzNELEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLElBQUk7b0NBQ25DLE9BQU8sRUFBRSx1QkFBdUIsQ0FBQyxPQUFPO2lDQUMzQyxDQUFDO2dDQUNGLEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLElBQUk7b0NBQ25DLE9BQU8sRUFBRSx1QkFBdUIsQ0FBQyxPQUFPO2lDQUMzQyxDQUFDO2dDQUNGLEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxLQUFLLElBQUk7b0NBQ2pDLEtBQUssRUFBRSx1QkFBdUIsQ0FBQyxLQUFLO2lDQUN2QyxDQUFDO2dDQUNGLFlBQVksRUFBRSx1QkFBdUIsQ0FBQyxZQUFhOzZCQUN0RCxDQUFDLENBQUM7NEJBRUgsc0VBQXNFOzRCQUN0RSxJQUFJLENBQUMsNkJBQTZCLElBQUksNkJBQTZCLENBQUMsWUFBWTtnQ0FDNUUsNkJBQTZCLENBQUMsU0FBUyxJQUFJLENBQUMsNkJBQTZCLENBQUMsU0FBUyxFQUFFO2dDQUNyRixNQUFNLFlBQVksR0FBRyxzRkFBc0YsNkJBQTZCLEVBQUUsQ0FBQTtnQ0FDMUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQ0FDMUIsT0FBTztvQ0FDSCxZQUFZLEVBQUUsWUFBWTtvQ0FDMUIsU0FBUyxFQUFFLHdDQUFzQixDQUFDLGVBQWU7aUNBQ3BELENBQUE7NkJBQ0o7aUNBQU07Z0NBQ0gsMERBQTBEO2dDQUMxRCx1QkFBdUIsQ0FBQyxjQUFjLEdBQUcsNkJBQTZCLENBQUMsU0FBVSxDQUFDO2dDQUVsRixrREFBa0Q7Z0NBQ2xELE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLGdDQUFjLENBQUM7b0NBQ3pDLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFvQjtvQ0FDM0MsSUFBSSxFQUFFO3dDQUNGLEVBQUUsRUFBRTs0Q0FDQSxDQUFDLEVBQUUsdUJBQXVCLENBQUMsRUFBRTt5Q0FDaEM7d0NBQ0QsU0FBUyxFQUFFOzRDQUNQLENBQUMsRUFBRSx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFO3lDQUNsRDt3Q0FDRCxjQUFjLEVBQUU7NENBQ1osQ0FBQyxFQUFFLHVCQUF1QixDQUFDLGNBQWU7eUNBQzdDO3dDQUNELEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxLQUFLLElBQUk7NENBQ2pDLEtBQUssRUFBRTtnREFDSCxDQUFDLEVBQUUsdUJBQXVCLENBQUMsS0FBSzs2Q0FDbkM7eUNBQ0osQ0FBQzt3Q0FDRixHQUFHLENBQUMsdUJBQXVCLENBQUMsT0FBTyxJQUFJOzRDQUNuQyxPQUFPLEVBQUU7Z0RBQ0wsQ0FBQyxFQUFFLHVCQUF1QixDQUFDLE9BQU87NkNBQ3JDO3lDQUNKLENBQUM7d0NBQ0YsR0FBRyxDQUFDLHVCQUF1QixDQUFDLGdCQUFnQixJQUFJOzRDQUM1QyxnQkFBZ0IsRUFBRTtnREFDZCxDQUFDLEVBQUUsdUJBQXVCLENBQUMsZ0JBQWdCOzZDQUM5Qzt5Q0FDSixDQUFDO3dDQUNGLEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxZQUFZLElBQUk7NENBQ3hDLFlBQVksRUFBRTtnREFDVixDQUFDLEVBQUUsdUJBQXVCLENBQUMsWUFBWTs2Q0FDMUM7eUNBQ0osQ0FBQzt3Q0FDRixHQUFHLENBQUMsdUJBQXVCLENBQUMsT0FBTyxJQUFJOzRDQUNuQyxPQUFPLEVBQUU7Z0RBQ0wsQ0FBQyxFQUFFLHVCQUF1QixDQUFDLE9BQU87NkNBQ3JDO3lDQUNKLENBQUM7d0NBQ0YsTUFBTSxFQUFFOzRDQUNKLENBQUMsRUFBRSx1QkFBdUIsQ0FBQyxNQUFNO3lDQUNwQzt3Q0FDRCxXQUFXLEVBQUU7NENBQ1QsQ0FBQyxFQUFFLHVCQUF1QixDQUFDLFdBQVc7eUNBQ3pDO3dDQUNELElBQUksRUFBRTs0Q0FDRixDQUFDLEVBQUUsdUJBQXVCLENBQUMsSUFBSTt5Q0FDbEM7d0NBQ0QsU0FBUyxFQUFFOzRDQUNQLENBQUMsRUFBRSx1QkFBdUIsQ0FBQyxTQUFTO3lDQUN2Qzt3Q0FDRCxTQUFTLEVBQUU7NENBQ1AsQ0FBQyxFQUFFLHVCQUF1QixDQUFDLFNBQVM7eUNBQ3ZDO3dDQUNELEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLElBQUk7NENBQ3JDLFNBQVMsRUFBRTtnREFDUCxDQUFDLEVBQUUsdUJBQXVCLENBQUMsU0FBUzs2Q0FDdkM7eUNBQ0osQ0FBQztxQ0FDTDtpQ0FDSixDQUFDLENBQUMsQ0FBQztnQ0FFSix3REFBd0Q7Z0NBQ3hELE9BQU87b0NBQ0gsRUFBRSxFQUFFLHVCQUF1QixDQUFDLEVBQUU7b0NBQzlCLElBQUksRUFBRSx1QkFBdUM7aUNBQ2hELENBQUE7NkJBQ0o7eUJBQ0o7NkJBQU07NEJBQ0gsTUFBTSxZQUFZLEdBQUcsb0VBQW9FLHVCQUF1QixDQUFDLFdBQVcsMkJBQTJCLHVCQUF1QixDQUFDLElBQUksRUFBRSxDQUFDOzRCQUN0TCxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDOzRCQUMxQixPQUFPO2dDQUNILFlBQVksRUFBRSxZQUFZO2dDQUMxQixTQUFTLEVBQUUsd0NBQXNCLENBQUMsZUFBZTs2QkFDcEQsQ0FBQTt5QkFDSjtxQkFDSjt5QkFBTTt3QkFDSCxNQUFNLFlBQVksR0FBRyxvQ0FBb0MsdUJBQXVCLENBQUMsV0FBVywyQkFBMkIsdUJBQXVCLENBQUMsSUFBSSxFQUFFLENBQUM7d0JBQ3RKLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7d0JBQzFCLE9BQU87NEJBQ0gsWUFBWSxFQUFFLFlBQVk7NEJBQzFCLFNBQVMsRUFBRSx3Q0FBc0IsQ0FBQyxlQUFlO3lCQUNwRCxDQUFBO3FCQUNKO2dCQUNMO29CQUNJLE1BQU0sWUFBWSxHQUFHLGdDQUFnQyx1QkFBdUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDcEYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztvQkFDMUIsT0FBTzt3QkFDSCxZQUFZLEVBQUUsWUFBWTt3QkFDMUIsU0FBUyxFQUFFLHdDQUFzQixDQUFDLGVBQWU7cUJBQ3BELENBQUE7YUFDUjtTQUNKO0tBQ0o7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNWLE1BQU0sWUFBWSxHQUFHLG9DQUFvQyxTQUFTLGFBQWEsR0FBRyxFQUFFLENBQUM7UUFDckYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMxQixPQUFPO1lBQ0gsWUFBWSxFQUFFLFlBQVk7WUFDMUIsU0FBUyxFQUFFLHdDQUFzQixDQUFDLGVBQWU7U0FDcEQsQ0FBQTtLQUNKO0FBQ0wsQ0FBQyxDQUFBO0FBdE1ZLFFBQUEsa0JBQWtCLHNCQXNNOUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0R5bmFtb0RCQ2xpZW50LCBHZXRJdGVtQ29tbWFuZCwgUHV0SXRlbUNvbW1hbmR9IGZyb20gXCJAYXdzLXNkay9jbGllbnQtZHluYW1vZGJcIjtcbmltcG9ydCB7XG4gICAgQ291cmllckNsaWVudCxcbiAgICBDcmVhdGVOb3RpZmljYXRpb25JbnB1dCxcbiAgICBDcmVhdGVOb3RpZmljYXRpb25SZXNwb25zZSxcbiAgICBOb3RpZmljYXRpb24sXG4gICAgTm90aWZpY2F0aW9uQ2hhbm5lbFR5cGUsXG4gICAgTm90aWZpY2F0aW9uUmVzcG9uc2UsXG4gICAgTm90aWZpY2F0aW9uc0Vycm9yVHlwZSxcbiAgICBOb3RpZmljYXRpb25UeXBlXG59IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5cbi8qKlxuICogQ3JlYXRlTm90aWZpY2F0aW9uIHJlc29sdmVyXG4gKlxuICogQHBhcmFtIGZpZWxkTmFtZSBuYW1lIG9mIHRoZSByZXNvbHZlciBwYXRoIGZyb20gdGhlIEFwcFN5bmMgZXZlbnRcbiAqIEBwYXJhbSBjcmVhdGVOb3RpZmljYXRpb25JbnB1dCBjcmVhdGUgbm90aWZpY2F0aW9ucyBpbnB1dCBvYmplY3QsIHVzZWQgdG8gY3JlYXRlIGEgbm90aWZpY2F0aW9uXG4gKiBiYXNlZCBvbiBhbiBldmVudCAocmVpbWJ1cnNlbWVudCwgdHJhbnNhY3Rpb24sIGNhcmQgZXhwaXJhdGlvbiwgc3VjY2Vzc2Z1bCByZWdpc3RyYXRpb24pLlxuICogQHJldHVybnMge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBDcmVhdGVOb3RpZmljYXRpb25SZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IGNyZWF0ZU5vdGlmaWNhdGlvbiA9IGFzeW5jIChmaWVsZE5hbWU6IHN0cmluZywgY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQ6IENyZWF0ZU5vdGlmaWNhdGlvbklucHV0KTogUHJvbWlzZTxDcmVhdGVOb3RpZmljYXRpb25SZXNwb25zZT4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgIC8vIGluaXRpYWxpemluZyB0aGUgRHluYW1vREIgZG9jdW1lbnQgY2xpZW50XG4gICAgICAgIGNvbnN0IGR5bmFtb0RiQ2xpZW50ID0gbmV3IER5bmFtb0RCQ2xpZW50KHtyZWdpb246IHJlZ2lvbn0pO1xuXG4gICAgICAgIC8vIHVwZGF0ZSB0aGUgdGltZXN0YW1wcyBhY2NvcmRpbmdseVxuICAgICAgICBjb25zdCBjcmVhdGVkQXQgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgICAgIGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnRpbWVzdGFtcCA9IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnRpbWVzdGFtcCA/IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnRpbWVzdGFtcCA6IERhdGUucGFyc2UoY3JlYXRlZEF0KTtcbiAgICAgICAgY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuY3JlYXRlZEF0ID0gY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuY3JlYXRlZEF0ID8gY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuY3JlYXRlZEF0IDogY3JlYXRlZEF0O1xuICAgICAgICBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC51cGRhdGVkQXQgPSBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC51cGRhdGVkQXQgPyBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC51cGRhdGVkQXQgOiBjcmVhdGVkQXQ7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIGNoZWNrIHRvIHNlZSBpZiB0aGUgc2FtZSBub3RpZmljYXRpb25zIGFscmVhZHkgZXhpc3RzIGluIHRoZSBEQi4gQWx0aG91Z2ggdGhpcyBpcyBhIHZlcnkgcmFyZSBzaXR1YXRpb24gKGlmIGF0IGFsbCksXG4gICAgICAgICAqIHdlIHdhbnQgdG8gcHV0IGEgc2FmZWd1YXJkIGFyb3VuZCBkdXBsaWNhdGVzIGV2ZW4gaGVyZS5cbiAgICAgICAgICovXG4gICAgICAgIGNvbnN0IHByZUV4aXN0aW5nTm90aWZpY2F0aW9uID0gYXdhaXQgZHluYW1vRGJDbGllbnQuc2VuZChuZXcgR2V0SXRlbUNvbW1hbmQoe1xuICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5OT1RJRklDQVRJT05TX1RBQkxFISxcbiAgICAgICAgICAgIEtleToge1xuICAgICAgICAgICAgICAgIGlkOiB7XG4gICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmlkXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IHtcbiAgICAgICAgICAgICAgICAgICAgTjogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQudGltZXN0YW1wLnRvU3RyaW5nKClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiB3ZSdyZSBub3QgaW50ZXJlc3RlZCBpbiBnZXR0aW5nIGFsbCB0aGUgZGF0YSBmb3IgdGhpcyBjYWxsLCBqdXN0IHRoZSBtaW5pbXVtIGZvciB1cyB0byBkZXRlcm1pbmUgd2hldGhlciB0aGlzIGlzIGEgZHVwbGljYXRlIG9yIG5vdFxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIEBsaW5rIGh0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9hbWF6b25keW5hbW9kYi9sYXRlc3QvZGV2ZWxvcGVyZ3VpZGUvUmVzZXJ2ZWRXb3Jkcy5odG1sXG4gICAgICAgICAgICAgKiBAbGluayBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vYW1hem9uZHluYW1vZGIvbGF0ZXN0L2RldmVsb3Blcmd1aWRlL0V4cHJlc3Npb25zLkV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lcy5odG1sXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIFByb2plY3Rpb25FeHByZXNzaW9uOiAnI2lkZiwgI3QnLFxuICAgICAgICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzOiB7XG4gICAgICAgICAgICAgICAgJyNpZGYnOiAnaWQnLFxuICAgICAgICAgICAgICAgICcjdCc6ICd0aW1lc3RhbXAnXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKTtcblxuICAgICAgICAvLyBpZiB0aGVyZSBpcyBhbiBpdGVtIHJldHJpZXZlZCwgdGhlbiB3ZSByZXR1cm4gYW4gZXJyb3JcbiAgICAgICAgaWYgKHByZUV4aXN0aW5nTm90aWZpY2F0aW9uICYmIHByZUV4aXN0aW5nTm90aWZpY2F0aW9uLkl0ZW0pIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogaWYgdGhlcmUgaXMgYSBwcmUtZXhpc3Rpbmcgbm90aWZpY2F0aW9uIHdpdGggdGhlIHNhbWUgY29tcG9zaXRlIHByaW1hcnkga2V5ICh1c2VySWQvaWQsIHRpbWVzdGFtcCkgY29tYmluYXRpb24sXG4gICAgICAgICAgICAgKiB0aGVuIHdlIGNhbm5vdCBkdXBsaWNhdGUgdGhhdCwgc28gd2Ugd2lsbCByZXR1cm4gYW4gZXJyb3IuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBEdXBsaWNhdGUgbm90aWZpY2F0aW9uIGZvdW5kIWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5EdXBsaWNhdGVPYmplY3RGb3VuZFxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBmaXJzdCwgd2UgbmVlZCB0byBjYWxsIHRoZSBhcHByb3ByaWF0ZSBDb3VyaWVyIEFQSSAod2l0aCB0aGUgYXBwcm9wcmlhdGUgaW1wbGVtZW50YXRpb24pLCBkZXBlbmRpbmcgb24gdGhlIE5vdGlmaWNhdGlvblxuICAgICAgICAgICAgICogdHlwZSwgYXMgd2VsbCBhcyB0aGUgY2hhbm5lbCwgdG8gYmUgcGFzc2VkIGluLlxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIGluaXRpYWxpemUgdGhlIENvdXJpZXIgQ2xpZW50IEFQSSBoZXJlLCBpbiBvcmRlciB0byBjYWxsIHRoZSBhcHByb3ByaWF0ZSBlbmRwb2ludHMgZm9yIHRoaXMgaGFuZGxlclxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBjb25zdCBjb3VyaWVyQ2xpZW50ID0gbmV3IENvdXJpZXJDbGllbnQocHJvY2Vzcy5lbnYuRU5WX05BTUUhLCByZWdpb24pO1xuICAgICAgICAgICAgLy8gc3dpdGNoIGJhc2VkIG9uIHRoZSB0eXBlIGZpcnN0XG4gICAgICAgICAgICBzd2l0Y2ggKGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIE5vdGlmaWNhdGlvblR5cGUuTmV3VXNlclNpZ251cDpcbiAgICAgICAgICAgICAgICAgICAgLy8gZm9yIGVhY2ggdHlwZSwgZGV0ZXJtaW5lIHRoZSB0eXBlIG9mIG5vdGlmaWNhdGlvbiB0aGF0IHdlIG5lZWQgdG8gc2VuZCBmb3IgdGhlIHBhc3NlZCBpbiBjaGFubmVsXG4gICAgICAgICAgICAgICAgICAgIGlmIChjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5jaGFubmVsVHlwZSA9PT0gTm90aWZpY2F0aW9uQ2hhbm5lbFR5cGUuRW1haWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHZhbGlkYXRlIHRoYXQgd2UgaGF2ZSB0aGUgbmVjZXNzYXJ5IGluZm9ybWF0aW9uIHRvIHNlbmQgYW4gZW1haWxcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5lbWFpbERlc3RpbmF0aW9uICYmIGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmVtYWlsRGVzdGluYXRpb24ubGVuZ3RoICE9PSAwICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQudXNlckZ1bGxOYW1lICYmIGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnVzZXJGdWxsTmFtZS5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhdHRlbXB0IHRvIHNlbmQgYW4gZW1haWwgbm90aWZpY2F0aW9uIGZpcnN0IHRocm91Z2ggQ291cmllclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNlbmRFbWFpbE5vdGlmaWNhdGlvblJlc3BvbnNlOiBOb3RpZmljYXRpb25SZXNwb25zZSA9IGF3YWl0IGNvdXJpZXJDbGllbnQuc2VuZEVtYWlsTm90aWZpY2F0aW9uKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW1haWxEZXN0aW5hdGlvbjogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuZW1haWxEZXN0aW5hdGlvbiEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLihjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5tZXNzYWdlICYmIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0Lm1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLihjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5zdWJqZWN0ICYmIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1YmplY3Q6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnN1YmplY3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLihjcmVhdGVOb3RpZmljYXRpb25JbnB1dC50aXRsZSAmJiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQudGl0bGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJGdWxsTmFtZTogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQudXNlckZ1bGxOYW1lIVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSBlbWFpbCBub3RpZmljYXRpb24gd2FzIHN1Y2Nlc3NmdWxseSBzZW50IG9yIG5vdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghc2VuZEVtYWlsTm90aWZpY2F0aW9uUmVzcG9uc2UgfHwgc2VuZEVtYWlsTm90aWZpY2F0aW9uUmVzcG9uc2UuZXJyb3JNZXNzYWdlIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbmRFbWFpbE5vdGlmaWNhdGlvblJlc3BvbnNlLmVycm9yVHlwZSB8fCAhc2VuZEVtYWlsTm90aWZpY2F0aW9uUmVzcG9uc2UucmVxdWVzdElkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBFbWFpbCBub3RpZmljYXRpb24gc2VuZGluZyB0aHJvdWdoIHRoZSBQT1NUIENvdXJpZXIgc2VuZCBlbWFpbCBtZXNzYWdlIGNhbGwgZmFpbGVkICR7c2VuZEVtYWlsTm90aWZpY2F0aW9uUmVzcG9uc2V9YFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzZXQgdGhlIG5vdGlmaWNhdGlvbiBpZCwgZnJvbSB0aGUgQ291cmllciBjYWxsIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0Lm5vdGlmaWNhdGlvbklkID0gc2VuZEVtYWlsTm90aWZpY2F0aW9uUmVzcG9uc2UucmVxdWVzdElkITtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzdG9yZSB0aGUgc3VjY2Vzc2Z1bGx5IHNlbnQgbm90aWZpY2F0aW9uIG9iamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBQdXRJdGVtQ29tbWFuZCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52Lk5PVElGSUNBVElPTlNfVEFCTEUhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgSXRlbToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmlkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTjogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQudGltZXN0YW1wLnRvU3RyaW5nKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbklkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0Lm5vdGlmaWNhdGlvbklkIVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uKGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnRpdGxlICYmIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnRpdGxlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi4oY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuc3ViamVjdCAmJiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1YmplY3Q6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnN1YmplY3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLihjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5lbWFpbERlc3RpbmF0aW9uICYmIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW1haWxEZXN0aW5hdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuZW1haWxEZXN0aW5hdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uKGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnVzZXJGdWxsTmFtZSAmJiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJGdWxsTmFtZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQudXNlckZ1bGxOYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi4oY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQubWVzc2FnZSAmJiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0Lm1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1czoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5zdGF0dXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5uZWxUeXBlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmNoYW5uZWxUeXBlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LnR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5jcmVhdGVkQXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRBdDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVOb3RpZmljYXRpb25JbnB1dC51cGRhdGVkQXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLihjcmVhdGVOb3RpZmljYXRpb25JbnB1dC5hY3Rpb25VcmwgJiYge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb25Vcmw6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmFjdGlvblVybFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIHN1Y2Nlc3NmdWxseSBzZW50IG5vdGlmaWNhdGlvbiBpbmZvcm1hdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQgYXMgTm90aWZpY2F0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBJbnZhbGlkIGluZm9ybWF0aW9uIHBhc3NlZCBpbiwgdG8gcHJvY2VzcyBhIG5vdGlmaWNhdGlvbiB0aHJvdWdoICR7Y3JlYXRlTm90aWZpY2F0aW9uSW5wdXQuY2hhbm5lbFR5cGV9LCBmb3Igbm90aWZpY2F0aW9uIHR5cGUgJHtjcmVhdGVOb3RpZmljYXRpb25JbnB1dC50eXBlfWA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbnN1cHBvcnRlZCBub3RpZmljYXRpb24gY2hhbm5lbCAke2NyZWF0ZU5vdGlmaWNhdGlvbklucHV0LmNoYW5uZWxUeXBlfSwgZm9yIG5vdGlmaWNhdGlvbiB0eXBlICR7Y3JlYXRlTm90aWZpY2F0aW9uSW5wdXQudHlwZX1gO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgbm90aWZpY2F0aW9uIHR5cGUgJHtjcmVhdGVOb3RpZmljYXRpb25JbnB1dC50eXBlfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyAke2ZpZWxkTmFtZX0gbXV0YXRpb24gJHtlcnJ9YDtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICB9XG4gICAgfVxufVxuIl19