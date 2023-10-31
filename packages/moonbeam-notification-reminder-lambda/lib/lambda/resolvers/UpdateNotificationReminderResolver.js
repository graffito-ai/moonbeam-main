"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNotificationReminder = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * UpdateNotificationReminder resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param updateNotificationReminderInput Notification Reminder input object, used to update an existent Notification Reminder object.
 * @returns {@link Promise} of {@link NotificationReminderResponse}
 */
const updateNotificationReminder = async (fieldName, updateNotificationReminderInput) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        // initializing the DynamoDB document client
        const dynamoDbClient = new client_dynamodb_1.DynamoDBClient({ region: region });
        // update the timestamps accordingly
        const updatedAt = new Date().toISOString();
        updateNotificationReminderInput.updatedAt = updateNotificationReminderInput.updatedAt ? updateNotificationReminderInput.updatedAt : updatedAt;
        // check to see if there is a notification reminder object to update. If there's none, then return an error accordingly.
        const preExistingNotificationReminderObject = await dynamoDbClient.send(new client_dynamodb_1.GetItemCommand({
            TableName: process.env.NOTIFICATION_REMINDER_TABLE,
            Key: {
                id: {
                    S: updateNotificationReminderInput.id
                }
            }
        }));
        // if there is an item retrieved to be updated, then we proceed accordingly. Otherwise, we throw an error.
        if (preExistingNotificationReminderObject && preExistingNotificationReminderObject.Item) {
            // check if we need to bump up the count for reminder or not
            let needToBumpCountFlag = false;
            // check if we need to deactivate the reminder or not
            let deactivationFlag = false;
            /**
             * update the next trigger date, depending on the cadence at which we are sending the notification reminder at
             *
             * only update this trigger, if the status is updated/ maintained as ACTIVE
             */
            let nextTriggerDate = new Date(Date.parse(preExistingNotificationReminderObject.Item.nextTriggerAt.S));
            if (updateNotificationReminderInput.notificationReminderStatus === moonbeam_models_1.NotificationReminderStatus.Active) {
                // check to see if we need to bump up the reminder count. For an ACTIVE notification reminder update, we need to update it.
                needToBumpCountFlag = true;
                const currentUpdatedTriggerCount = Number(preExistingNotificationReminderObject.Item.notificationReminderCount.N) + 1;
                switch (preExistingNotificationReminderObject.Item.notificationReminderCadence.S) {
                    case moonbeam_models_1.NotificationReminderCadence.OneTime:
                        // we will deactivate the reminder since it was only supposed to run one time
                        deactivationFlag = currentUpdatedTriggerCount === 1;
                        // if this was a one time trigger, then do not update the next trigger date/time
                        break;
                    case moonbeam_models_1.NotificationReminderCadence.Daily:
                        // we will deactivate the reminder when it reaches the max count
                        deactivationFlag = currentUpdatedTriggerCount === Number(preExistingNotificationReminderObject.Item.notificationReminderMaxCount.N);
                        // add a day to the current trigger, so we can re-trigger this the next day as well;
                        nextTriggerDate.setDate(nextTriggerDate.getDate() + 1);
                        break;
                    case moonbeam_models_1.NotificationReminderCadence.Weekly:
                        // we will deactivate the reminder when it reaches the max count
                        deactivationFlag = currentUpdatedTriggerCount === Number(preExistingNotificationReminderObject.Item.notificationReminderMaxCount.N);
                        // add 7 days to the current trigger, so we can re-trigger this the next week as well
                        nextTriggerDate.setDate(nextTriggerDate.getDate() + 7);
                        break;
                    case moonbeam_models_1.NotificationReminderCadence.BiWeekly:
                        // we will deactivate the reminder when it reaches the max count
                        deactivationFlag = currentUpdatedTriggerCount === Number(preExistingNotificationReminderObject.Item.notificationReminderMaxCount.N);
                        // add 14 days to the current trigger, so we can re-trigger this the next week as well
                        nextTriggerDate.setDate(nextTriggerDate.getDate() + 14);
                        break;
                    case moonbeam_models_1.NotificationReminderCadence.Monthly:
                        // we will deactivate the reminder when it reaches the max count
                        deactivationFlag = currentUpdatedTriggerCount === Number(preExistingNotificationReminderObject.Item.notificationReminderMaxCount.N);
                        // add 1 month to the current trigger, so we can re-trigger this the next week as well
                        nextTriggerDate.setMonth(nextTriggerDate.getMonth() + 1);
                        break;
                    default:
                        break;
                }
            }
            // update the notification reminder object based on the passed in object
            await dynamoDbClient.send(new client_dynamodb_1.UpdateItemCommand({
                TableName: process.env.NOTIFICATION_REMINDER_TABLE,
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
                            ? Number(Number(preExistingNotificationReminderObject.Item.notificationReminderCount.N) + 1).toString()
                            : Number(preExistingNotificationReminderObject.Item.notificationReminderCount.N).toString()
                    },
                    ":rStat": {
                        S: deactivationFlag
                            ? moonbeam_models_1.NotificationReminderStatus.Inactive
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
            const notificationChannelTypes = [];
            preExistingNotificationReminderObject.Item.notificationChannelType.L.forEach(notificationChannel => {
                notificationChannelTypes.push(notificationChannel.S);
            });
            // return the updated notification reminder details
            return {
                data: [
                    {
                        id: updateNotificationReminderInput.id,
                        createdAt: preExistingNotificationReminderObject.Item.createdAt.S,
                        updatedAt: updateNotificationReminderInput.updatedAt,
                        nextTriggerAt: nextTriggerDate.toISOString(),
                        notificationChannelType: notificationChannelTypes,
                        notificationReminderCadence: preExistingNotificationReminderObject.Item.notificationReminderCadence.S,
                        notificationReminderCount: needToBumpCountFlag
                            ? Number(preExistingNotificationReminderObject.Item.notificationReminderCount.N) + 1
                            : Number(preExistingNotificationReminderObject.Item.notificationReminderCount.N),
                        notificationReminderMaxCount: Number(preExistingNotificationReminderObject.Item.notificationReminderMaxCount.N),
                        notificationReminderStatus: deactivationFlag
                            ? moonbeam_models_1.NotificationReminderStatus.Inactive
                            : updateNotificationReminderInput.notificationReminderStatus,
                        notificationReminderType: preExistingNotificationReminderObject.Item.notificationReminderType.S
                    }
                ]
            };
        }
        else {
            const errorMessage = `Unknown notification reminder object to update!`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.NotificationReminderErrorType.NoneOrAbsent
            };
        }
    }
    catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} mutation ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: moonbeam_models_1.NotificationReminderErrorType.UnexpectedError
        };
    }
};
exports.updateNotificationReminder = updateNotificationReminder;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXBkYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJSZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL1VwZGF0ZU5vdGlmaWNhdGlvblJlbWluZGVyUmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsOERBQTJGO0FBQzNGLCtEQVFtQztBQUVuQzs7Ozs7O0dBTUc7QUFDSSxNQUFNLDBCQUEwQixHQUFHLEtBQUssRUFBRSxTQUFpQixFQUFFLCtCQUFnRSxFQUF5QyxFQUFFO0lBQzNLLElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsNENBQTRDO1FBQzVDLE1BQU0sY0FBYyxHQUFHLElBQUksZ0NBQWMsQ0FBQyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBRTVELG9DQUFvQztRQUNwQyxNQUFNLFNBQVMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzNDLCtCQUErQixDQUFDLFNBQVMsR0FBRywrQkFBK0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLCtCQUErQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBRTlJLHdIQUF3SDtRQUN4SCxNQUFNLHFDQUFxQyxHQUFHLE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLGdDQUFjLENBQUM7WUFDdkYsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsMkJBQTRCO1lBQ25ELEdBQUcsRUFBRTtnQkFDRCxFQUFFLEVBQUU7b0JBQ0EsQ0FBQyxFQUFFLCtCQUErQixDQUFDLEVBQUU7aUJBQ3hDO2FBQ0o7U0FDSixDQUFDLENBQUMsQ0FBQztRQUVKLDBHQUEwRztRQUMxRyxJQUFJLHFDQUFxQyxJQUFJLHFDQUFxQyxDQUFDLElBQUksRUFBRTtZQUNyRiw0REFB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RUFBRSwrQ0FBNkIsQ0FBQyxlQUFlO1NBQzNELENBQUE7S0FDSjtBQUNMLENBQUMsQ0FBQTtBQTFKWSxRQUFBLDBCQUEwQiw4QkEwSnRDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtEeW5hbW9EQkNsaWVudCwgR2V0SXRlbUNvbW1hbmQsIFVwZGF0ZUl0ZW1Db21tYW5kfSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LWR5bmFtb2RiXCI7XG5pbXBvcnQge1xuICAgIE5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlLFxuICAgIE5vdGlmaWNhdGlvblJlbWluZGVyQ2FkZW5jZSxcbiAgICBOb3RpZmljYXRpb25SZW1pbmRlckVycm9yVHlwZSxcbiAgICBOb3RpZmljYXRpb25SZW1pbmRlclJlc3BvbnNlLFxuICAgIE5vdGlmaWNhdGlvblJlbWluZGVyU3RhdHVzLFxuICAgIE5vdGlmaWNhdGlvblJlbWluZGVyVHlwZSxcbiAgICBVcGRhdGVOb3RpZmljYXRpb25SZW1pbmRlcklucHV0XG59IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5cbi8qKlxuICogVXBkYXRlTm90aWZpY2F0aW9uUmVtaW5kZXIgcmVzb2x2ZXJcbiAqXG4gKiBAcGFyYW0gZmllbGROYW1lIG5hbWUgb2YgdGhlIHJlc29sdmVyIHBhdGggZnJvbSB0aGUgQXBwU3luYyBldmVudFxuICogQHBhcmFtIHVwZGF0ZU5vdGlmaWNhdGlvblJlbWluZGVySW5wdXQgTm90aWZpY2F0aW9uIFJlbWluZGVyIGlucHV0IG9iamVjdCwgdXNlZCB0byB1cGRhdGUgYW4gZXhpc3RlbnQgTm90aWZpY2F0aW9uIFJlbWluZGVyIG9iamVjdC5cbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgTm90aWZpY2F0aW9uUmVtaW5kZXJSZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IHVwZGF0ZU5vdGlmaWNhdGlvblJlbWluZGVyID0gYXN5bmMgKGZpZWxkTmFtZTogc3RyaW5nLCB1cGRhdGVOb3RpZmljYXRpb25SZW1pbmRlcklucHV0OiBVcGRhdGVOb3RpZmljYXRpb25SZW1pbmRlcklucHV0KTogUHJvbWlzZTxOb3RpZmljYXRpb25SZW1pbmRlclJlc3BvbnNlPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gcmV0cmlldmluZyB0aGUgY3VycmVudCBmdW5jdGlvbiByZWdpb25cbiAgICAgICAgY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiE7XG5cbiAgICAgICAgLy8gaW5pdGlhbGl6aW5nIHRoZSBEeW5hbW9EQiBkb2N1bWVudCBjbGllbnRcbiAgICAgICAgY29uc3QgZHluYW1vRGJDbGllbnQgPSBuZXcgRHluYW1vREJDbGllbnQoe3JlZ2lvbjogcmVnaW9ufSk7XG5cbiAgICAgICAgLy8gdXBkYXRlIHRoZSB0aW1lc3RhbXBzIGFjY29yZGluZ2x5XG4gICAgICAgIGNvbnN0IHVwZGF0ZWRBdCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICAgICAgdXBkYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dC51cGRhdGVkQXQgPSB1cGRhdGVOb3RpZmljYXRpb25SZW1pbmRlcklucHV0LnVwZGF0ZWRBdCA/IHVwZGF0ZU5vdGlmaWNhdGlvblJlbWluZGVySW5wdXQudXBkYXRlZEF0IDogdXBkYXRlZEF0O1xuXG4gICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGVyZSBpcyBhIG5vdGlmaWNhdGlvbiByZW1pbmRlciBvYmplY3QgdG8gdXBkYXRlLiBJZiB0aGVyZSdzIG5vbmUsIHRoZW4gcmV0dXJuIGFuIGVycm9yIGFjY29yZGluZ2x5LlxuICAgICAgICBjb25zdCBwcmVFeGlzdGluZ05vdGlmaWNhdGlvblJlbWluZGVyT2JqZWN0ID0gYXdhaXQgZHluYW1vRGJDbGllbnQuc2VuZChuZXcgR2V0SXRlbUNvbW1hbmQoe1xuICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5OT1RJRklDQVRJT05fUkVNSU5ERVJfVEFCTEUhLFxuICAgICAgICAgICAgS2V5OiB7XG4gICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgUzogdXBkYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dC5pZFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuXG4gICAgICAgIC8vIGlmIHRoZXJlIGlzIGFuIGl0ZW0gcmV0cmlldmVkIHRvIGJlIHVwZGF0ZWQsIHRoZW4gd2UgcHJvY2VlZCBhY2NvcmRpbmdseS4gT3RoZXJ3aXNlLCB3ZSB0aHJvdyBhbiBlcnJvci5cbiAgICAgICAgaWYgKHByZUV4aXN0aW5nTm90aWZpY2F0aW9uUmVtaW5kZXJPYmplY3QgJiYgcHJlRXhpc3RpbmdOb3RpZmljYXRpb25SZW1pbmRlck9iamVjdC5JdGVtKSB7XG4gICAgICAgICAgICAvLyBjaGVjayBpZiB3ZSBuZWVkIHRvIGJ1bXAgdXAgdGhlIGNvdW50IGZvciByZW1pbmRlciBvciBub3RcbiAgICAgICAgICAgIGxldCBuZWVkVG9CdW1wQ291bnRGbGFnOiBib29sZWFuID0gZmFsc2U7XG4gICAgICAgICAgICAvLyBjaGVjayBpZiB3ZSBuZWVkIHRvIGRlYWN0aXZhdGUgdGhlIHJlbWluZGVyIG9yIG5vdFxuICAgICAgICAgICAgbGV0IGRlYWN0aXZhdGlvbkZsYWc6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiB1cGRhdGUgdGhlIG5leHQgdHJpZ2dlciBkYXRlLCBkZXBlbmRpbmcgb24gdGhlIGNhZGVuY2UgYXQgd2hpY2ggd2UgYXJlIHNlbmRpbmcgdGhlIG5vdGlmaWNhdGlvbiByZW1pbmRlciBhdFxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIG9ubHkgdXBkYXRlIHRoaXMgdHJpZ2dlciwgaWYgdGhlIHN0YXR1cyBpcyB1cGRhdGVkLyBtYWludGFpbmVkIGFzIEFDVElWRVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBsZXQgbmV4dFRyaWdnZXJEYXRlOiBEYXRlID0gbmV3IERhdGUoRGF0ZS5wYXJzZShwcmVFeGlzdGluZ05vdGlmaWNhdGlvblJlbWluZGVyT2JqZWN0Lkl0ZW0ubmV4dFRyaWdnZXJBdC5TISkpO1xuICAgICAgICAgICAgaWYgKHVwZGF0ZU5vdGlmaWNhdGlvblJlbWluZGVySW5wdXQubm90aWZpY2F0aW9uUmVtaW5kZXJTdGF0dXMgPT09IE5vdGlmaWNhdGlvblJlbWluZGVyU3RhdHVzLkFjdGl2ZSkge1xuICAgICAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB3ZSBuZWVkIHRvIGJ1bXAgdXAgdGhlIHJlbWluZGVyIGNvdW50LiBGb3IgYW4gQUNUSVZFIG5vdGlmaWNhdGlvbiByZW1pbmRlciB1cGRhdGUsIHdlIG5lZWQgdG8gdXBkYXRlIGl0LlxuICAgICAgICAgICAgICAgIG5lZWRUb0J1bXBDb3VudEZsYWcgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRVcGRhdGVkVHJpZ2dlckNvdW50ID0gTnVtYmVyKHByZUV4aXN0aW5nTm90aWZpY2F0aW9uUmVtaW5kZXJPYmplY3QuSXRlbS5ub3RpZmljYXRpb25SZW1pbmRlckNvdW50Lk4hKSArIDE7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChwcmVFeGlzdGluZ05vdGlmaWNhdGlvblJlbWluZGVyT2JqZWN0Lkl0ZW0ubm90aWZpY2F0aW9uUmVtaW5kZXJDYWRlbmNlLlMhIGFzIE5vdGlmaWNhdGlvblJlbWluZGVyQ2FkZW5jZSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIE5vdGlmaWNhdGlvblJlbWluZGVyQ2FkZW5jZS5PbmVUaW1lOlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2Ugd2lsbCBkZWFjdGl2YXRlIHRoZSByZW1pbmRlciBzaW5jZSBpdCB3YXMgb25seSBzdXBwb3NlZCB0byBydW4gb25lIHRpbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlYWN0aXZhdGlvbkZsYWcgPSBjdXJyZW50VXBkYXRlZFRyaWdnZXJDb3VudCA9PT0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIHRoaXMgd2FzIGEgb25lIHRpbWUgdHJpZ2dlciwgdGhlbiBkbyBub3QgdXBkYXRlIHRoZSBuZXh0IHRyaWdnZXIgZGF0ZS90aW1lXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBOb3RpZmljYXRpb25SZW1pbmRlckNhZGVuY2UuRGFpbHk6XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB3ZSB3aWxsIGRlYWN0aXZhdGUgdGhlIHJlbWluZGVyIHdoZW4gaXQgcmVhY2hlcyB0aGUgbWF4IGNvdW50XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWFjdGl2YXRpb25GbGFnID0gY3VycmVudFVwZGF0ZWRUcmlnZ2VyQ291bnQgPT09IE51bWJlcihwcmVFeGlzdGluZ05vdGlmaWNhdGlvblJlbWluZGVyT2JqZWN0Lkl0ZW0ubm90aWZpY2F0aW9uUmVtaW5kZXJNYXhDb3VudC5OISk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBhZGQgYSBkYXkgdG8gdGhlIGN1cnJlbnQgdHJpZ2dlciwgc28gd2UgY2FuIHJlLXRyaWdnZXIgdGhpcyB0aGUgbmV4dCBkYXkgYXMgd2VsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHRUcmlnZ2VyRGF0ZS5zZXREYXRlKG5leHRUcmlnZ2VyRGF0ZS5nZXREYXRlKCkgKyAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIE5vdGlmaWNhdGlvblJlbWluZGVyQ2FkZW5jZS5XZWVrbHk6XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB3ZSB3aWxsIGRlYWN0aXZhdGUgdGhlIHJlbWluZGVyIHdoZW4gaXQgcmVhY2hlcyB0aGUgbWF4IGNvdW50XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWFjdGl2YXRpb25GbGFnID0gY3VycmVudFVwZGF0ZWRUcmlnZ2VyQ291bnQgPT09IE51bWJlcihwcmVFeGlzdGluZ05vdGlmaWNhdGlvblJlbWluZGVyT2JqZWN0Lkl0ZW0ubm90aWZpY2F0aW9uUmVtaW5kZXJNYXhDb3VudC5OISk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBhZGQgNyBkYXlzIHRvIHRoZSBjdXJyZW50IHRyaWdnZXIsIHNvIHdlIGNhbiByZS10cmlnZ2VyIHRoaXMgdGhlIG5leHQgd2VlayBhcyB3ZWxsXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0VHJpZ2dlckRhdGUuc2V0RGF0ZShuZXh0VHJpZ2dlckRhdGUuZ2V0RGF0ZSgpICsgNyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBOb3RpZmljYXRpb25SZW1pbmRlckNhZGVuY2UuQmlXZWVrbHk6XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB3ZSB3aWxsIGRlYWN0aXZhdGUgdGhlIHJlbWluZGVyIHdoZW4gaXQgcmVhY2hlcyB0aGUgbWF4IGNvdW50XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWFjdGl2YXRpb25GbGFnID0gY3VycmVudFVwZGF0ZWRUcmlnZ2VyQ291bnQgPT09IE51bWJlcihwcmVFeGlzdGluZ05vdGlmaWNhdGlvblJlbWluZGVyT2JqZWN0Lkl0ZW0ubm90aWZpY2F0aW9uUmVtaW5kZXJNYXhDb3VudC5OISk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBhZGQgMTQgZGF5cyB0byB0aGUgY3VycmVudCB0cmlnZ2VyLCBzbyB3ZSBjYW4gcmUtdHJpZ2dlciB0aGlzIHRoZSBuZXh0IHdlZWsgYXMgd2VsbFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dFRyaWdnZXJEYXRlLnNldERhdGUobmV4dFRyaWdnZXJEYXRlLmdldERhdGUoKSArIDE0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIE5vdGlmaWNhdGlvblJlbWluZGVyQ2FkZW5jZS5Nb250aGx5OlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2Ugd2lsbCBkZWFjdGl2YXRlIHRoZSByZW1pbmRlciB3aGVuIGl0IHJlYWNoZXMgdGhlIG1heCBjb3VudFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVhY3RpdmF0aW9uRmxhZyA9IGN1cnJlbnRVcGRhdGVkVHJpZ2dlckNvdW50ID09PSBOdW1iZXIocHJlRXhpc3RpbmdOb3RpZmljYXRpb25SZW1pbmRlck9iamVjdC5JdGVtLm5vdGlmaWNhdGlvblJlbWluZGVyTWF4Q291bnQuTiEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYWRkIDEgbW9udGggdG8gdGhlIGN1cnJlbnQgdHJpZ2dlciwgc28gd2UgY2FuIHJlLXRyaWdnZXIgdGhpcyB0aGUgbmV4dCB3ZWVrIGFzIHdlbGxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHRUcmlnZ2VyRGF0ZS5zZXRNb250aChuZXh0VHJpZ2dlckRhdGUuZ2V0TW9udGgoKSArIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHVwZGF0ZSB0aGUgbm90aWZpY2F0aW9uIHJlbWluZGVyIG9iamVjdCBiYXNlZCBvbiB0aGUgcGFzc2VkIGluIG9iamVjdFxuICAgICAgICAgICAgYXdhaXQgZHluYW1vRGJDbGllbnQuc2VuZChuZXcgVXBkYXRlSXRlbUNvbW1hbmQoe1xuICAgICAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuTk9USUZJQ0FUSU9OX1JFTUlOREVSX1RBQkxFISxcbiAgICAgICAgICAgICAgICBLZXk6IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IHVwZGF0ZU5vdGlmaWNhdGlvblJlbWluZGVySW5wdXQuaWRcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiI25BdFwiOiBcIm5leHRUcmlnZ2VyQXRcIixcbiAgICAgICAgICAgICAgICAgICAgXCIjckNvdW50XCI6IFwibm90aWZpY2F0aW9uUmVtaW5kZXJDb3VudFwiLFxuICAgICAgICAgICAgICAgICAgICBcIiNyU3RhdFwiOiBcIm5vdGlmaWNhdGlvblJlbWluZGVyU3RhdHVzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiI3VhdFwiOiBcInVwZGF0ZWRBdFwiXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBFeHByZXNzaW9uQXR0cmlidXRlVmFsdWVzOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiOm5BdFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTOiBuZXh0VHJpZ2dlckRhdGUudG9JU09TdHJpbmcoKVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBcIjpyQ291bnRcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgTjogbmVlZFRvQnVtcENvdW50RmxhZ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gTnVtYmVyKE51bWJlcihwcmVFeGlzdGluZ05vdGlmaWNhdGlvblJlbWluZGVyT2JqZWN0Lkl0ZW0ubm90aWZpY2F0aW9uUmVtaW5kZXJDb3VudC5OISkgKyAxKS50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBOdW1iZXIocHJlRXhpc3RpbmdOb3RpZmljYXRpb25SZW1pbmRlck9iamVjdC5JdGVtLm5vdGlmaWNhdGlvblJlbWluZGVyQ291bnQuTiEpLnRvU3RyaW5nKClcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgXCI6clN0YXRcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogZGVhY3RpdmF0aW9uRmxhZ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gTm90aWZpY2F0aW9uUmVtaW5kZXJTdGF0dXMuSW5hY3RpdmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IHVwZGF0ZU5vdGlmaWNhdGlvblJlbWluZGVySW5wdXQubm90aWZpY2F0aW9uUmVtaW5kZXJTdGF0dXNcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgXCI6dWF0XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IHVwZGF0ZU5vdGlmaWNhdGlvblJlbWluZGVySW5wdXQudXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIFVwZGF0ZUV4cHJlc3Npb246IFwiU0VUICNuQXQgPSA6bkF0LCAjckNvdW50ID0gOnJDb3VudCwgI3JTdGF0ID0gOnJTdGF0LCAjdWF0ID0gOnVhdFwiLFxuICAgICAgICAgICAgICAgIFJldHVyblZhbHVlczogXCJVUERBVEVEX05FV1wiXG4gICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgIC8vIGNyZWF0ZSB0aGUgbm90aWZpY2F0aW9uIGNoYW5uZWwgdHlwZSBhcnJheSBmcm9tIHRoZSBpbnB1dFxuICAgICAgICAgICAgY29uc3Qgbm90aWZpY2F0aW9uQ2hhbm5lbFR5cGVzOiBOb3RpZmljYXRpb25DaGFubmVsVHlwZVtdID0gW107XG4gICAgICAgICAgICBwcmVFeGlzdGluZ05vdGlmaWNhdGlvblJlbWluZGVyT2JqZWN0Lkl0ZW0ubm90aWZpY2F0aW9uQ2hhbm5lbFR5cGUuTCEuZm9yRWFjaChub3RpZmljYXRpb25DaGFubmVsID0+IHtcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25DaGFubmVsVHlwZXMucHVzaChub3RpZmljYXRpb25DaGFubmVsLlMhIGFzIE5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlKVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIHJldHVybiB0aGUgdXBkYXRlZCBub3RpZmljYXRpb24gcmVtaW5kZXIgZGV0YWlsc1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBkYXRhOiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB1cGRhdGVOb3RpZmljYXRpb25SZW1pbmRlcklucHV0LmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEF0OiBwcmVFeGlzdGluZ05vdGlmaWNhdGlvblJlbWluZGVyT2JqZWN0Lkl0ZW0uY3JlYXRlZEF0LlMhLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlZEF0OiB1cGRhdGVOb3RpZmljYXRpb25SZW1pbmRlcklucHV0LnVwZGF0ZWRBdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHRUcmlnZ2VyQXQ6IG5leHRUcmlnZ2VyRGF0ZS50b0lTT1N0cmluZygpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uQ2hhbm5lbFR5cGU6IG5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvblJlbWluZGVyQ2FkZW5jZTogcHJlRXhpc3RpbmdOb3RpZmljYXRpb25SZW1pbmRlck9iamVjdC5JdGVtLm5vdGlmaWNhdGlvblJlbWluZGVyQ2FkZW5jZS5TISBhcyBOb3RpZmljYXRpb25SZW1pbmRlckNhZGVuY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBub3RpZmljYXRpb25SZW1pbmRlckNvdW50OiBuZWVkVG9CdW1wQ291bnRGbGFnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBOdW1iZXIocHJlRXhpc3RpbmdOb3RpZmljYXRpb25SZW1pbmRlck9iamVjdC5JdGVtLm5vdGlmaWNhdGlvblJlbWluZGVyQ291bnQuTiEpICsgMVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogTnVtYmVyKHByZUV4aXN0aW5nTm90aWZpY2F0aW9uUmVtaW5kZXJPYmplY3QuSXRlbS5ub3RpZmljYXRpb25SZW1pbmRlckNvdW50Lk4hKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvblJlbWluZGVyTWF4Q291bnQ6IE51bWJlcihwcmVFeGlzdGluZ05vdGlmaWNhdGlvblJlbWluZGVyT2JqZWN0Lkl0ZW0ubm90aWZpY2F0aW9uUmVtaW5kZXJNYXhDb3VudC5OISksXG4gICAgICAgICAgICAgICAgICAgICAgICBub3RpZmljYXRpb25SZW1pbmRlclN0YXR1czogZGVhY3RpdmF0aW9uRmxhZ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gTm90aWZpY2F0aW9uUmVtaW5kZXJTdGF0dXMuSW5hY3RpdmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IHVwZGF0ZU5vdGlmaWNhdGlvblJlbWluZGVySW5wdXQubm90aWZpY2F0aW9uUmVtaW5kZXJTdGF0dXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBub3RpZmljYXRpb25SZW1pbmRlclR5cGU6IHByZUV4aXN0aW5nTm90aWZpY2F0aW9uUmVtaW5kZXJPYmplY3QuSXRlbS5ub3RpZmljYXRpb25SZW1pbmRlclR5cGUuUyEgYXMgTm90aWZpY2F0aW9uUmVtaW5kZXJUeXBlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5rbm93biBub3RpZmljYXRpb24gcmVtaW5kZXIgb2JqZWN0IHRvIHVwZGF0ZSFgO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvblJlbWluZGVyRXJyb3JUeXBlLk5vbmVPckFic2VudFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyAke2ZpZWxkTmFtZX0gbXV0YXRpb24gJHtlcnJ9YDtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25SZW1pbmRlckVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==