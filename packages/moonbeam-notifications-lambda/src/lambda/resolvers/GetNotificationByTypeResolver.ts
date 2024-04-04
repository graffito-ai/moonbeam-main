import {
    GetNotificationByTypeInput,
    GetNotificationByTypeResponse,
    Notification,
    NotificationChannelType,
    NotificationsErrorType,
    NotificationStatus,
    NotificationType,
} from "@moonbeam/moonbeam-models";
import {AttributeValue, DynamoDBClient, QueryCommand} from "@aws-sdk/client-dynamodb";

/**
 * GetReferralsByStatus resolver
 *
 * @param getNotificationByTypeInput the input needed to retrieve a notification by its type
 * @param fieldName name of the resolver path from the AppSync event
 * @returns {@link Promise} of {@link GetNotificationByTypeResponse}
 */
export const getNotificationByType = async (fieldName: string, getNotificationByTypeInput: GetNotificationByTypeInput): Promise<GetNotificationByTypeResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initializing the DynamoDB document client
        const dynamoDbClient = new DynamoDBClient({region: region});

        /**
         * the data to be retrieved from the Query Command
         * the notification Items returned from the Query Command, all aggregated together
         * the last evaluated key, to help with the pagination of results
         */
        let result: Record<string, AttributeValue>[] = [];
        let exclusiveStartKey, retrievedData;

        do {
            /**
             * retrieve all notifications by type, given the global secondary index, as well as the date/limit to sort them by.
             *
             * Limit of 1 MB per paginated response data (in our case 2,700 items). An average size for an Item is about 280 bytes, which means that we won't
             * need to do pagination here, since we actually retrieve all notifications in a looped format, and we account for
             * paginated responses.
             *
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.Pagination.html}
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.html}
             */
            retrievedData = await dynamoDbClient.send(new QueryCommand({
                TableName: process.env.NOTIFICATIONS_TABLE!,
                IndexName: `${process.env.NOTIFICATIONS_TYPE_AND_TIME_GLOBAL_INDEX!}-${process.env.ENV_NAME!}-${region}`,
                ...(exclusiveStartKey && {ExclusiveStartKey: exclusiveStartKey}),
                Limit: 2700, // 2,700 * 280 bytes = 756,000 bytes = 0.7600 MB (leave a margin of error here up to 1 MB)
                ExpressionAttributeNames: {
                    '#tp': 'type',
                    '#cAt': 'createdAt'
                },
                ExpressionAttributeValues: {
                    ":tp": {
                        S: getNotificationByTypeInput.type
                    },
                    ':start': {
                        S: getNotificationByTypeInput.endDate
                    },
                    ":end": {
                        S: new Date().toISOString()
                    }
                },
                KeyConditionExpression: '#tp = :tp AND #cAt BETWEEN :start AND :end'
            }));

            exclusiveStartKey = retrievedData.LastEvaluatedKey;
            result = result.concat(retrievedData.Items);
        } while (retrievedData && retrievedData.Count && retrievedData.Items &&
        retrievedData.Items.length && retrievedData.Count !== 0 &&
        retrievedData.Items.length !== 0 && retrievedData.LastEvaluatedKey);

        // if there are notifications retrieved, then return all of them accordingly
        if (result && result.length !== 0) {
            // convert the Dynamo DB data from Dynamo DB JSON format to a Moonbeam Notification data format
            const notificationData: Notification[] = [];
            result.forEach(notificationResult => {
                // check if there are any expo push tokens to retrieve, then do so accordingly
                const expoPushTokenList: string[] = [];
                if (notificationResult.expoPushTokens && notificationResult.expoPushTokens.L) {
                    notificationResult.expoPushTokens.L!.forEach(token => {
                        expoPushTokenList.push(token.M!.tokenId!.S!);
                    })
                }
                const notification: Notification = {
                    id: notificationResult.id.S!,
                    timestamp: Number(notificationResult.timestamp.N!),
                    notificationId: notificationResult.notificationId.S!,
                    ...(notificationResult.emailDestination && notificationResult.emailDestination.S && {
                        emailDestination: notificationResult.emailDestination.S!
                    }),
                    ...(notificationResult.userFullName && notificationResult.userFullName.S && {
                        userFullName: notificationResult.userFullName.S!
                    }),
                    status: notificationResult.status.S! as NotificationStatus,
                    channelType: notificationResult.channelType.S! as NotificationChannelType,
                    type: notificationResult.type.S! as NotificationType,
                    createdAt: notificationResult.createdAt.S!,
                    updatedAt: notificationResult.updatedAt.S!,
                    ...(notificationResult.actionUrl && notificationResult.actionUrl.S && {
                        actionUrl: notificationResult.actionUrl.S!
                    }),
                    ...(expoPushTokenList.length !== 0 && {
                        expoPushTokens: expoPushTokenList
                    })
                };
                notificationData.push(notification);
            });
            // return the list of notifications
            return {
                data: notificationData
            }
        } else {
            const errorMessage = `No matching notifications found!`;
            console.log(errorMessage);

            return {
                data: []
            }
        }
    } catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} query ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: NotificationsErrorType.UnexpectedError
        };
    }
}
