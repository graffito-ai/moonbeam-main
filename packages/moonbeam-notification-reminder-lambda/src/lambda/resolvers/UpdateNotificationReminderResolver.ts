import {DynamoDBClient, GetItemCommand, UpdateItemCommand} from "@aws-sdk/client-dynamodb";
import {
    NotificationChannelType,
    NotificationReminderCadence,
    NotificationReminderErrorType,
    NotificationReminderResponse,
    NotificationReminderStatus,
    NotificationReminderType,
    UpdateNotificationReminderInput
} from "@moonbeam/moonbeam-models";

/**
 * UpdateNotificationReminder resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param updateNotificationReminderInput Notification Reminder input object, used to update an existent Notification Reminder object.
 * @returns {@link Promise} of {@link NotificationReminderResponse}
 */
export const updateNotificationReminder = async (fieldName: string, updateNotificationReminderInput: UpdateNotificationReminderInput): Promise<NotificationReminderResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initializing the DynamoDB document client
        const dynamoDbClient = new DynamoDBClient({region: region});

        // update the timestamps accordingly
        const updatedAt = new Date().toISOString();
        updateNotificationReminderInput.updatedAt = updateNotificationReminderInput.updatedAt ? updateNotificationReminderInput.updatedAt : updatedAt;

        // check to see if there is a notification reminder object to update. If there's none, then return an error accordingly.
        const preExistingNotificationReminderObject = await dynamoDbClient.send(new GetItemCommand({
            TableName: process.env.NOTIFICATION_REMINDER_TABLE!,
            Key: {
                id: {
                    S: updateNotificationReminderInput.id
                }
            }
        }));

        // if there is an item retrieved to be updated, then we proceed accordingly. Otherwise, we throw an error.
        if (preExistingNotificationReminderObject && preExistingNotificationReminderObject.Item) {
            // check if we need to bump up the count for reminder or not
            let needToBumpCountFlag: boolean = false;
            // check if we need to deactivate the reminder or not
            let deactivationFlag: boolean = false;

            /**
             * update the next trigger date, depending on the cadence at which we are sending the notification reminder at
             *
             * only update this trigger, if the status is updated/ maintained as ACTIVE
             */
            let nextTriggerDate: Date = new Date(Date.parse(preExistingNotificationReminderObject.Item.nextTriggerAt.S!));
            if (updateNotificationReminderInput.notificationReminderStatus === NotificationReminderStatus.Active) {
                // check to see if we need to bump up the reminder count. For an ACTIVE notification reminder update, we need to update it.
                needToBumpCountFlag = true;
                const currentUpdatedTriggerCount = Number(preExistingNotificationReminderObject.Item.notificationReminderCount.N!) + 1;
                switch (preExistingNotificationReminderObject.Item.notificationReminderCadence.S! as NotificationReminderCadence) {
                    case NotificationReminderCadence.OneTime:
                        // we will deactivate the reminder since it was only supposed to run one time
                        deactivationFlag = currentUpdatedTriggerCount === 1;
                        // if this was a one time trigger, then do not update the next trigger date/time
                        break;
                    case NotificationReminderCadence.Daily:
                        // we will deactivate the reminder when it reaches the max count
                        deactivationFlag = currentUpdatedTriggerCount === Number(preExistingNotificationReminderObject.Item.notificationReminderMaxCount.N!);
                        // add a day to the current trigger, so we can re-trigger this the next day as well;
                        nextTriggerDate.setDate(nextTriggerDate.getDate() + 1);
                        break;
                    case NotificationReminderCadence.Weekly:
                        // we will deactivate the reminder when it reaches the max count
                        deactivationFlag = currentUpdatedTriggerCount === Number(preExistingNotificationReminderObject.Item.notificationReminderMaxCount.N!);
                        // add 7 days to the current trigger, so we can re-trigger this the next week as well
                        nextTriggerDate.setDate(nextTriggerDate.getDate() + 7);
                        break;
                    case NotificationReminderCadence.BiWeekly:
                        // we will deactivate the reminder when it reaches the max count
                        deactivationFlag = currentUpdatedTriggerCount === Number(preExistingNotificationReminderObject.Item.notificationReminderMaxCount.N!);
                        // add 14 days to the current trigger, so we can re-trigger this the next week as well
                        nextTriggerDate.setDate(nextTriggerDate.getDate() + 14);
                        break;
                    case NotificationReminderCadence.Monthly:
                        // we will deactivate the reminder when it reaches the max count
                        deactivationFlag = currentUpdatedTriggerCount === Number(preExistingNotificationReminderObject.Item.notificationReminderMaxCount.N!);
                        // add 1 month to the current trigger, so we can re-trigger this the next week as well
                        nextTriggerDate.setMonth(nextTriggerDate.getMonth() + 1);
                        break;
                    default:
                        break;
                }
            }

            // update the notification reminder object based on the passed in object
            await dynamoDbClient.send(new UpdateItemCommand({
                TableName: process.env.NOTIFICATION_REMINDER_TABLE!,
                Key: {
                    id: {
                        S: updateNotificationReminderInput.id
                    }
                },
                ExpressionAttributeNames: {
                    "#nAt": "nextTriggerAt",
                    "#rCount": "notificationReminderCount",
                    "#rStat": "notificationReminderStatus",
                    "#uat": "updatedAt"
                },
                ExpressionAttributeValues: {
                    ":nAt": {
                        S: nextTriggerDate.toISOString()
                    },
                    ":rCount": {
                        N: needToBumpCountFlag
                            ? Number(Number(preExistingNotificationReminderObject.Item.notificationReminderCount.N!) + 1).toString()
                            : Number(preExistingNotificationReminderObject.Item.notificationReminderCount.N!).toString()
                    },
                    ":rStat": {
                        S: deactivationFlag
                            ? NotificationReminderStatus.Inactive
                            : updateNotificationReminderInput.notificationReminderStatus
                    },
                    ":uat": {
                        S: updateNotificationReminderInput.updatedAt
                    }
                },
                UpdateExpression: "SET #nAt = :nAt, #rCount = :rCount, #rStat = :rStat, #uat = :uat",
                ReturnValues: "UPDATED_NEW"
            }));

            // create the notification channel type array from the input
            const notificationChannelTypes: NotificationChannelType[] = [];
            preExistingNotificationReminderObject.Item.notificationChannelType.L!.forEach(notificationChannel => {
                notificationChannelTypes.push(notificationChannel.S! as NotificationChannelType)
            });

            // return the updated notification reminder details
            return {
                data: [
                    {
                        id: updateNotificationReminderInput.id,
                        createdAt: preExistingNotificationReminderObject.Item.createdAt.S!,
                        updatedAt: updateNotificationReminderInput.updatedAt,
                        nextTriggerAt: nextTriggerDate.toISOString(),
                        notificationChannelType: notificationChannelTypes,
                        notificationReminderCadence: preExistingNotificationReminderObject.Item.notificationReminderCadence.S! as NotificationReminderCadence,
                        notificationReminderCount: needToBumpCountFlag
                            ? Number(preExistingNotificationReminderObject.Item.notificationReminderCount.N!) + 1
                            : Number(preExistingNotificationReminderObject.Item.notificationReminderCount.N!),
                        notificationReminderMaxCount: Number(preExistingNotificationReminderObject.Item.notificationReminderMaxCount.N!),
                        notificationReminderStatus: deactivationFlag
                            ? NotificationReminderStatus.Inactive
                            : updateNotificationReminderInput.notificationReminderStatus,
                        notificationReminderType: preExistingNotificationReminderObject.Item.notificationReminderType.S! as NotificationReminderType
                    }
                ]
            }
        } else {
            const errorMessage = `Unknown notification reminder object to update!`;
            console.log(errorMessage);

            return {
                errorMessage: errorMessage,
                errorType: NotificationReminderErrorType.NoneOrAbsent
            }
        }
    } catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} mutation ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: NotificationReminderErrorType.UnexpectedError
        }
    }
}
