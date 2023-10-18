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
            /**
             * update the next trigger date, depending on the cadence at which we are sending the notification reminder at
             *
             * only update this trigger, if the status is updated/ maintained as ACTIVE
             */
            let nextTriggerDate = new Date(Date.parse(preExistingNotificationReminderObject.Item.nextTriggerAt.S));
            if (updateNotificationReminderInput.notificationReminderStatus === moonbeam_models_1.NotificationReminderStatus.Active) {
                switch (preExistingNotificationReminderObject.Item.notificationReminderCadence.S) {
                    case moonbeam_models_1.NotificationReminderCadence.OneTime:
                        // if this was a one time trigger, then do not update the next trigger date/time
                        break;
                    case moonbeam_models_1.NotificationReminderCadence.Daily:
                        // add a day to the current trigger, so we can re-trigger this the next day as well;
                        nextTriggerDate.setDate(nextTriggerDate.getDate() + 1);
                        break;
                    case moonbeam_models_1.NotificationReminderCadence.Weekly:
                        // add 7 days to the current trigger, so we can re-trigger this the next week as well
                        nextTriggerDate.setDate(nextTriggerDate.getDate() + 7);
                        break;
                    case moonbeam_models_1.NotificationReminderCadence.BiWeekly:
                        // add 14 days to the current trigger, so we can re-trigger this the next week as well
                        nextTriggerDate.setDate(nextTriggerDate.getDate() + 14);
                        break;
                    case moonbeam_models_1.NotificationReminderCadence.Monthly:
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
                        N: Number(Number(preExistingNotificationReminderObject.Item.notificationReminderCount.N) + 1).toString()
                    },
                    ":rStat": {
                        S: updateNotificationReminderInput.notificationReminderStatus
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
                        notificationReminderCount: Number(preExistingNotificationReminderObject.Item.notificationReminderCount.N) + 1,
                        notificationReminderStatus: updateNotificationReminderInput.notificationReminderStatus,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXBkYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJSZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL1VwZGF0ZU5vdGlmaWNhdGlvblJlbWluZGVyUmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsOERBQTJGO0FBQzNGLCtEQVFtQztBQUVuQzs7Ozs7O0dBTUc7QUFDSSxNQUFNLDBCQUEwQixHQUFHLEtBQUssRUFBRSxTQUFpQixFQUFFLCtCQUFnRSxFQUF5QyxFQUFFO0lBQzNLLElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsNENBQTRDO1FBQzVDLE1BQU0sY0FBYyxHQUFHLElBQUksZ0NBQWMsQ0FBQyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBRTVELG9DQUFvQztRQUNwQyxNQUFNLFNBQVMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzNDLCtCQUErQixDQUFDLFNBQVMsR0FBRywrQkFBK0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLCtCQUErQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBRTlJLHdIQUF3SDtRQUN4SCxNQUFNLHFDQUFxQyxHQUFHLE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLGdDQUFjLENBQUM7WUFDdkYsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsMkJBQTRCO1lBQ25ELEdBQUcsRUFBRTtnQkFDRCxFQUFFLEVBQUU7b0JBQ0EsQ0FBQyxFQUFFLCtCQUErQixDQUFDLEVBQUU7aUJBQ3hDO2FBQ0o7U0FDSixDQUFDLENBQUMsQ0FBQztRQUVKLDBHQUEwRztRQUMxRyxJQUFJLHFDQUFxQyxJQUFJLHFDQUFxQyxDQUFDLElBQUksRUFBRTtZQUNyRjs7Oztl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QUFJLENBQUMsU0FBUyxDQUFDLENBQUU7d0JBQ2xFLFNBQVMsRUFBRSwrQkFBK0IsQ0FBQyxTQUFTO3dCQUNwRCxhQUFhLEVBQUUsZUFBZSxDQUFDLFdBQVcsRUFBRTt3QkFDNUMsdUJBQXVCLEVBQUUsd0JBQXdCO3dCQUNqRCwyQkFBMkIsRUFBRSxxQ0FBcUMsQ0FBQyxJQUFJLENBQUMsMkJBQTJCLENBQUMsQ0FBaUM7d0JBQ3JJLHlCQUF5QixFQUFFLE1BQU0sQ0FBQyxxQ0FBcUMsQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsQ0FBRSxDQUFDLEdBQUcsQ0FBQzt3QkFDOUcsMEJBQTBCLEVBQUUsK0JBQStCLENBQUMsMEJBQTBCO3dCQUN0Rix3QkFBd0IsRUFBRSxxQ0FBcUMsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBOEI7cUJBQy9IO2lCQUNKO2FBQ0osQ0FBQTtTQUNKO2FBQU07WUFDSCxNQUFNLFlBQVksR0FBRyxpREFBaUQsQ0FBQztZQUN2RSxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRTFCLE9BQU87Z0JBQ0gsWUFBWSxFQUFFLFlBQVk7Z0JBQzFCLFNBQVMsRUFBRSwrQ0FBNkIsQ0FBQyxZQUFZO2FBQ3hELENBQUE7U0FDSjtLQUNKO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDVixNQUFNLFlBQVksR0FBRyxvQ0FBb0MsU0FBUyxhQUFhLEdBQUcsRUFBRSxDQUFDO1FBQ3JGLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDMUIsT0FBTztZQUNILFlBQVksRUFBRSxZQUFZO1lBQzFCLFNBQVMsRUFBRSwrQ0FBNkIsQ0FBQyxlQUFlO1NBQzNELENBQUE7S0FDSjtBQUNMLENBQUMsQ0FBQTtBQS9IWSxRQUFBLDBCQUEwQiw4QkErSHRDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtEeW5hbW9EQkNsaWVudCwgR2V0SXRlbUNvbW1hbmQsIFVwZGF0ZUl0ZW1Db21tYW5kfSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LWR5bmFtb2RiXCI7XG5pbXBvcnQge1xuICAgIE5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlLFxuICAgIE5vdGlmaWNhdGlvblJlbWluZGVyQ2FkZW5jZSxcbiAgICBOb3RpZmljYXRpb25SZW1pbmRlckVycm9yVHlwZSxcbiAgICBOb3RpZmljYXRpb25SZW1pbmRlclJlc3BvbnNlLFxuICAgIE5vdGlmaWNhdGlvblJlbWluZGVyU3RhdHVzLFxuICAgIE5vdGlmaWNhdGlvblJlbWluZGVyVHlwZSxcbiAgICBVcGRhdGVOb3RpZmljYXRpb25SZW1pbmRlcklucHV0XG59IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5cbi8qKlxuICogVXBkYXRlTm90aWZpY2F0aW9uUmVtaW5kZXIgcmVzb2x2ZXJcbiAqXG4gKiBAcGFyYW0gZmllbGROYW1lIG5hbWUgb2YgdGhlIHJlc29sdmVyIHBhdGggZnJvbSB0aGUgQXBwU3luYyBldmVudFxuICogQHBhcmFtIHVwZGF0ZU5vdGlmaWNhdGlvblJlbWluZGVySW5wdXQgTm90aWZpY2F0aW9uIFJlbWluZGVyIGlucHV0IG9iamVjdCwgdXNlZCB0byB1cGRhdGUgYW4gZXhpc3RlbnQgTm90aWZpY2F0aW9uIFJlbWluZGVyIG9iamVjdC5cbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgTm90aWZpY2F0aW9uUmVtaW5kZXJSZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IHVwZGF0ZU5vdGlmaWNhdGlvblJlbWluZGVyID0gYXN5bmMgKGZpZWxkTmFtZTogc3RyaW5nLCB1cGRhdGVOb3RpZmljYXRpb25SZW1pbmRlcklucHV0OiBVcGRhdGVOb3RpZmljYXRpb25SZW1pbmRlcklucHV0KTogUHJvbWlzZTxOb3RpZmljYXRpb25SZW1pbmRlclJlc3BvbnNlPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gcmV0cmlldmluZyB0aGUgY3VycmVudCBmdW5jdGlvbiByZWdpb25cbiAgICAgICAgY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiE7XG5cbiAgICAgICAgLy8gaW5pdGlhbGl6aW5nIHRoZSBEeW5hbW9EQiBkb2N1bWVudCBjbGllbnRcbiAgICAgICAgY29uc3QgZHluYW1vRGJDbGllbnQgPSBuZXcgRHluYW1vREJDbGllbnQoe3JlZ2lvbjogcmVnaW9ufSk7XG5cbiAgICAgICAgLy8gdXBkYXRlIHRoZSB0aW1lc3RhbXBzIGFjY29yZGluZ2x5XG4gICAgICAgIGNvbnN0IHVwZGF0ZWRBdCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICAgICAgdXBkYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dC51cGRhdGVkQXQgPSB1cGRhdGVOb3RpZmljYXRpb25SZW1pbmRlcklucHV0LnVwZGF0ZWRBdCA/IHVwZGF0ZU5vdGlmaWNhdGlvblJlbWluZGVySW5wdXQudXBkYXRlZEF0IDogdXBkYXRlZEF0O1xuXG4gICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGVyZSBpcyBhIG5vdGlmaWNhdGlvbiByZW1pbmRlciBvYmplY3QgdG8gdXBkYXRlLiBJZiB0aGVyZSdzIG5vbmUsIHRoZW4gcmV0dXJuIGFuIGVycm9yIGFjY29yZGluZ2x5LlxuICAgICAgICBjb25zdCBwcmVFeGlzdGluZ05vdGlmaWNhdGlvblJlbWluZGVyT2JqZWN0ID0gYXdhaXQgZHluYW1vRGJDbGllbnQuc2VuZChuZXcgR2V0SXRlbUNvbW1hbmQoe1xuICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5OT1RJRklDQVRJT05fUkVNSU5ERVJfVEFCTEUhLFxuICAgICAgICAgICAgS2V5OiB7XG4gICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgUzogdXBkYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dC5pZFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuXG4gICAgICAgIC8vIGlmIHRoZXJlIGlzIGFuIGl0ZW0gcmV0cmlldmVkIHRvIGJlIHVwZGF0ZWQsIHRoZW4gd2UgcHJvY2VlZCBhY2NvcmRpbmdseS4gT3RoZXJ3aXNlLCB3ZSB0aHJvdyBhbiBlcnJvci5cbiAgICAgICAgaWYgKHByZUV4aXN0aW5nTm90aWZpY2F0aW9uUmVtaW5kZXJPYmplY3QgJiYgcHJlRXhpc3RpbmdOb3RpZmljYXRpb25SZW1pbmRlck9iamVjdC5JdGVtKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIHVwZGF0ZSB0aGUgbmV4dCB0cmlnZ2VyIGRhdGUsIGRlcGVuZGluZyBvbiB0aGUgY2FkZW5jZSBhdCB3aGljaCB3ZSBhcmUgc2VuZGluZyB0aGUgbm90aWZpY2F0aW9uIHJlbWluZGVyIGF0XG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogb25seSB1cGRhdGUgdGhpcyB0cmlnZ2VyLCBpZiB0aGUgc3RhdHVzIGlzIHVwZGF0ZWQvIG1haW50YWluZWQgYXMgQUNUSVZFXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGxldCBuZXh0VHJpZ2dlckRhdGU6IERhdGUgPSBuZXcgRGF0ZShEYXRlLnBhcnNlKHByZUV4aXN0aW5nTm90aWZpY2F0aW9uUmVtaW5kZXJPYmplY3QuSXRlbS5uZXh0VHJpZ2dlckF0LlMhKSk7XG4gICAgICAgICAgICBpZiAodXBkYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dC5ub3RpZmljYXRpb25SZW1pbmRlclN0YXR1cyA9PT0gTm90aWZpY2F0aW9uUmVtaW5kZXJTdGF0dXMuQWN0aXZlKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChwcmVFeGlzdGluZ05vdGlmaWNhdGlvblJlbWluZGVyT2JqZWN0Lkl0ZW0ubm90aWZpY2F0aW9uUmVtaW5kZXJDYWRlbmNlLlMhIGFzIE5vdGlmaWNhdGlvblJlbWluZGVyQ2FkZW5jZSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIE5vdGlmaWNhdGlvblJlbWluZGVyQ2FkZW5jZS5PbmVUaW1lOlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWYgdGhpcyB3YXMgYSBvbmUgdGltZSB0cmlnZ2VyLCB0aGVuIGRvIG5vdCB1cGRhdGUgdGhlIG5leHQgdHJpZ2dlciBkYXRlL3RpbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIE5vdGlmaWNhdGlvblJlbWluZGVyQ2FkZW5jZS5EYWlseTpcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFkZCBhIGRheSB0byB0aGUgY3VycmVudCB0cmlnZ2VyLCBzbyB3ZSBjYW4gcmUtdHJpZ2dlciB0aGlzIHRoZSBuZXh0IGRheSBhcyB3ZWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dFRyaWdnZXJEYXRlLnNldERhdGUobmV4dFRyaWdnZXJEYXRlLmdldERhdGUoKSArIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgTm90aWZpY2F0aW9uUmVtaW5kZXJDYWRlbmNlLldlZWtseTpcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFkZCA3IGRheXMgdG8gdGhlIGN1cnJlbnQgdHJpZ2dlciwgc28gd2UgY2FuIHJlLXRyaWdnZXIgdGhpcyB0aGUgbmV4dCB3ZWVrIGFzIHdlbGxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHRUcmlnZ2VyRGF0ZS5zZXREYXRlKG5leHRUcmlnZ2VyRGF0ZS5nZXREYXRlKCkgKyA3KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIE5vdGlmaWNhdGlvblJlbWluZGVyQ2FkZW5jZS5CaVdlZWtseTpcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFkZCAxNCBkYXlzIHRvIHRoZSBjdXJyZW50IHRyaWdnZXIsIHNvIHdlIGNhbiByZS10cmlnZ2VyIHRoaXMgdGhlIG5leHQgd2VlayBhcyB3ZWxsXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0VHJpZ2dlckRhdGUuc2V0RGF0ZShuZXh0VHJpZ2dlckRhdGUuZ2V0RGF0ZSgpICsgMTQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgTm90aWZpY2F0aW9uUmVtaW5kZXJDYWRlbmNlLk1vbnRobHk6XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBhZGQgMSBtb250aCB0byB0aGUgY3VycmVudCB0cmlnZ2VyLCBzbyB3ZSBjYW4gcmUtdHJpZ2dlciB0aGlzIHRoZSBuZXh0IHdlZWsgYXMgd2VsbFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dFRyaWdnZXJEYXRlLnNldE1vbnRoKG5leHRUcmlnZ2VyRGF0ZS5nZXRNb250aCgpICsgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gdXBkYXRlIHRoZSBub3RpZmljYXRpb24gcmVtaW5kZXIgb2JqZWN0IGJhc2VkIG9uIHRoZSBwYXNzZWQgaW4gb2JqZWN0XG4gICAgICAgICAgICBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBVcGRhdGVJdGVtQ29tbWFuZCh7XG4gICAgICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5OT1RJRklDQVRJT05fUkVNSU5ERVJfVEFCTEUhLFxuICAgICAgICAgICAgICAgIEtleToge1xuICAgICAgICAgICAgICAgICAgICBpZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogdXBkYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dC5pZFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBFeHByZXNzaW9uQXR0cmlidXRlTmFtZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCIjbkF0XCI6IFwibmV4dFRyaWdnZXJBdFwiLFxuICAgICAgICAgICAgICAgICAgICBcIiNyQ291bnRcIjogXCJub3RpZmljYXRpb25SZW1pbmRlckNvdW50XCIsXG4gICAgICAgICAgICAgICAgICAgIFwiI3JTdGF0XCI6IFwibm90aWZpY2F0aW9uUmVtaW5kZXJTdGF0dXNcIixcbiAgICAgICAgICAgICAgICAgICAgXCIjdWF0XCI6IFwidXBkYXRlZEF0XCJcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCI6bkF0XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IG5leHRUcmlnZ2VyRGF0ZS50b0lTT1N0cmluZygpXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIFwiOnJDb3VudFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBOOiBOdW1iZXIoTnVtYmVyKHByZUV4aXN0aW5nTm90aWZpY2F0aW9uUmVtaW5kZXJPYmplY3QuSXRlbS5ub3RpZmljYXRpb25SZW1pbmRlckNvdW50Lk4hKSArIDEpLnRvU3RyaW5nKClcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgXCI6clN0YXRcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogdXBkYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dC5ub3RpZmljYXRpb25SZW1pbmRlclN0YXR1c1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBcIjp1YXRcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogdXBkYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dC51cGRhdGVkQXRcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgVXBkYXRlRXhwcmVzc2lvbjogXCJTRVQgI25BdCA9IDpuQXQsICNyQ291bnQgPSA6ckNvdW50LCAjclN0YXQgPSA6clN0YXQsICN1YXQgPSA6dWF0XCIsXG4gICAgICAgICAgICAgICAgUmV0dXJuVmFsdWVzOiBcIlVQREFURURfTkVXXCJcbiAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgLy8gY3JlYXRlIHRoZSBub3RpZmljYXRpb24gY2hhbm5lbCB0eXBlIGFycmF5IGZyb20gdGhlIGlucHV0XG4gICAgICAgICAgICBjb25zdCBub3RpZmljYXRpb25DaGFubmVsVHlwZXM6IE5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlW10gPSBbXTtcbiAgICAgICAgICAgIHByZUV4aXN0aW5nTm90aWZpY2F0aW9uUmVtaW5kZXJPYmplY3QuSXRlbS5ub3RpZmljYXRpb25DaGFubmVsVHlwZS5MIS5mb3JFYWNoKG5vdGlmaWNhdGlvbkNoYW5uZWwgPT4ge1xuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlcy5wdXNoKG5vdGlmaWNhdGlvbkNoYW5uZWwuUyEgYXMgTm90aWZpY2F0aW9uQ2hhbm5lbFR5cGUpXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSB1cGRhdGVkIG5vdGlmaWNhdGlvbiByZW1pbmRlciBkZXRhaWxzXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRhdGE6IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHVwZGF0ZU5vdGlmaWNhdGlvblJlbWluZGVySW5wdXQuaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IHByZUV4aXN0aW5nTm90aWZpY2F0aW9uUmVtaW5kZXJPYmplY3QuSXRlbS5jcmVhdGVkQXQuUyEsXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVkQXQ6IHVwZGF0ZU5vdGlmaWNhdGlvblJlbWluZGVySW5wdXQudXBkYXRlZEF0LFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dFRyaWdnZXJBdDogbmV4dFRyaWdnZXJEYXRlLnRvSVNPU3RyaW5nKCksXG4gICAgICAgICAgICAgICAgICAgICAgICBub3RpZmljYXRpb25DaGFubmVsVHlwZTogbm90aWZpY2F0aW9uQ2hhbm5lbFR5cGVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uUmVtaW5kZXJDYWRlbmNlOiBwcmVFeGlzdGluZ05vdGlmaWNhdGlvblJlbWluZGVyT2JqZWN0Lkl0ZW0ubm90aWZpY2F0aW9uUmVtaW5kZXJDYWRlbmNlLlMhIGFzIE5vdGlmaWNhdGlvblJlbWluZGVyQ2FkZW5jZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvblJlbWluZGVyQ291bnQ6IE51bWJlcihwcmVFeGlzdGluZ05vdGlmaWNhdGlvblJlbWluZGVyT2JqZWN0Lkl0ZW0ubm90aWZpY2F0aW9uUmVtaW5kZXJDb3VudC5OISkgKyAxLFxuICAgICAgICAgICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uUmVtaW5kZXJTdGF0dXM6IHVwZGF0ZU5vdGlmaWNhdGlvblJlbWluZGVySW5wdXQubm90aWZpY2F0aW9uUmVtaW5kZXJTdGF0dXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBub3RpZmljYXRpb25SZW1pbmRlclR5cGU6IHByZUV4aXN0aW5nTm90aWZpY2F0aW9uUmVtaW5kZXJPYmplY3QuSXRlbS5ub3RpZmljYXRpb25SZW1pbmRlclR5cGUuUyEgYXMgTm90aWZpY2F0aW9uUmVtaW5kZXJUeXBlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5rbm93biBub3RpZmljYXRpb24gcmVtaW5kZXIgb2JqZWN0IHRvIHVwZGF0ZSFgO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvblJlbWluZGVyRXJyb3JUeXBlLk5vbmVPckFic2VudFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyAke2ZpZWxkTmFtZX0gbXV0YXRpb24gJHtlcnJ9YDtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25SZW1pbmRlckVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==