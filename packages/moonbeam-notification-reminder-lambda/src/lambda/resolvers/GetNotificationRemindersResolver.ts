import {AttributeValue, DynamoDBClient, ScanCommand} from "@aws-sdk/client-dynamodb";
import {
    NotificationChannelType,
    NotificationReminder,
    NotificationReminderCadence,
    NotificationReminderErrorType,
    NotificationReminderResponse,
    NotificationReminderStatus,
    NotificationReminderType
} from "@moonbeam/moonbeam-models";

/**
 * GetNotificationReminders resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @returns {@link Promise} of {@link NotificationReminderResponse}
 */
export const getNotificationReminders = async (fieldName: string): Promise<NotificationReminderResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initializing the DynamoDB document client
        const dynamoDbClient = new DynamoDBClient({region: region});

        /**
         * the data to be retrieved from the Query Command
         * the eligible user Items returned from the Query Command, all aggregated together
         * the last evaluated key, to help with the pagination of results
         */
        let result: Record<string, AttributeValue>[] = [];
        let retrievedData;

        do {
            /**
             * retrieve all the Notification Reminders
             *
             * Limit of 1 MB per paginated response data, but we won't have that many Notification Reminders anyway for now,
             * which means that we won't need to do pagination here.
             *
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.Pagination.html}
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.html}
             */
            retrievedData = await dynamoDbClient.send(new ScanCommand({
                TableName: process.env.NOTIFICATION_REMINDER_TABLE!,
                Limit: 1000, // for now, we don't need to worry about this limit
            }));

            result = result.concat(retrievedData.Items);
        } while (retrievedData && retrievedData.Count && retrievedData.Items &&
        retrievedData.Items.length && retrievedData.Count !== 0 &&
        retrievedData.Items.length !== 0 && retrievedData.LastEvaluatedKey);

        // if there are eligible users retrieved, then return them accordingly
        if (result && result.length !== 0) {
            // convert the Dynamo DB data from Dynamo DB JSON format to a Notification Reminder data format
            const notificationReminderData: NotificationReminder[] = [];
            result.forEach(notificationReminderResult => {
                const notificationChannelType: NotificationChannelType[] = [];
                notificationReminderResult.notificationChannelType.L &&
                notificationReminderResult.notificationChannelType.L!.forEach(notificationChannelTypeResult => {
                    notificationChannelType.push(notificationChannelTypeResult.S! as NotificationChannelType);
                });
                notificationReminderData.push({
                    id: notificationReminderResult.id.S!,
                    createdAt: notificationReminderResult.createdAt.S!,
                    updatedAt: notificationReminderResult.updatedAt.S!,
                    nextTriggerAt: notificationReminderResult.nextTriggerAt.S!,
                    notificationChannelType: notificationChannelType,
                    notificationReminderCadence: notificationReminderResult.notificationReminderCadence.S! as NotificationReminderCadence,
                    notificationReminderCount: Number(notificationReminderResult.notificationReminderCount.N!),
                    notificationReminderStatus: notificationReminderResult.notificationReminderStatus.S! as NotificationReminderStatus,
                    notificationReminderType: notificationReminderResult.notificationReminderType.S! as NotificationReminderType
                });
            });
            // return the list of Notification Reminders retrieved
            return {
                data: notificationReminderData
            }
        } else {
            const errorMessage = `No Notification Reminders found!`;
            console.log(errorMessage);

            return {
                errorMessage: errorMessage,
                errorType: NotificationReminderErrorType.NoneOrAbsent
            }
        }
    } catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} query ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: NotificationReminderErrorType.UnexpectedError
        };
    }
}
