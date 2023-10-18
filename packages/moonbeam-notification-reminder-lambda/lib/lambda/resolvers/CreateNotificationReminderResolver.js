"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotificationReminder = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const uuid_1 = require("uuid");
/**
 * CreateNotificationReminder resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param createNotificationReminderInput Notification Reminder input object, used to create a new Notification Reminder object.
 * @returns {@link Promise} of {@link NotificationReminderResponse}
 */
const createNotificationReminder = async (fieldName, createNotificationReminderInput) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        // initializing the DynamoDB document client
        const dynamoDbClient = new client_dynamodb_1.DynamoDBClient({ region: region });
        // update the timestamps accordingly
        const createdAt = new Date().toISOString();
        createNotificationReminderInput.createdAt = createNotificationReminderInput.createdAt ? createNotificationReminderInput.createdAt : createdAt;
        createNotificationReminderInput.updatedAt = createNotificationReminderInput.updatedAt ? createNotificationReminderInput.updatedAt : createdAt;
        /**
         * check to see if there is an existing Notification Reminder with the same ID, in case there is
         * an id passed in.
         */
        const preExistingNotificationReminder = createNotificationReminderInput.id && await dynamoDbClient.send(new client_dynamodb_1.GetItemCommand({
            TableName: process.env.NOTIFICATION_REMINDER_TABLE,
            Key: {
                id: {
                    S: createNotificationReminderInput.id
                }
            },
            /**
             * we're not interested in getting all the data for this call, just the minimum for us to determine whether this is a duplicate or not
             *
             * @link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html
             * @link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ExpressionAttributeNames.html
             */
            ProjectionExpression: '#idf',
            ExpressionAttributeNames: {
                '#idf': 'id'
            }
        }));
        // if there is an item retrieved, then we return an error
        if (preExistingNotificationReminder && preExistingNotificationReminder.Item) {
            // if there is an existent Notification Reminder object, then we cannot duplicate that, so we will return an error
            const errorMessage = `Duplicate Notification Reminder object found!`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.NotificationReminderErrorType.DuplicateObjectFound
            };
        }
        else {
            // generate a unique application identifier for the Notification Reminder, if not already passed in
            createNotificationReminderInput.id = createNotificationReminderInput.id ? createNotificationReminderInput.id : (0, uuid_1.v4)();
            // create the notification channel type array from the input
            const notificationChannelType = [];
            createNotificationReminderInput.notificationChannelType.forEach(notificationChannel => {
                notificationChannelType.push({
                    S: notificationChannel
                });
            });
            // store the next trigger date/time, to start the next day
            const triggerDate = new Date(Date.now());
            triggerDate.setDate(triggerDate.getDate() + 1);
            triggerDate.setHours(19, 0, 0, 0); // set the UTC time to match 12 PM MST/ 2 PM CST / 3 PM EST
            createNotificationReminderInput.nextTriggerAt = triggerDate.toISOString();
            // initially set this as 0 times since this has never been triggered at the creation time
            createNotificationReminderInput.notificationReminderCount = 0;
            // store the Notification Reminder object
            await dynamoDbClient.send(new client_dynamodb_1.PutItemCommand({
                TableName: process.env.NOTIFICATION_REMINDER_TABLE,
                Item: {
                    id: {
                        S: createNotificationReminderInput.id
                    },
                    notificationReminderType: {
                        S: createNotificationReminderInput.notificationReminderType
                    },
                    notificationReminderStatus: {
                        S: createNotificationReminderInput.notificationReminderStatus
                    },
                    notificationReminderCadence: {
                        S: createNotificationReminderInput.notificationReminderCadence
                    },
                    createdAt: {
                        S: createNotificationReminderInput.createdAt
                    },
                    updatedAt: {
                        S: createNotificationReminderInput.updatedAt
                    },
                    nextTriggerAt: {
                        S: createNotificationReminderInput.nextTriggerAt
                    },
                    notificationReminderCount: {
                        N: createNotificationReminderInput.notificationReminderCount.toString()
                    },
                    notificationChannelType: {
                        L: notificationChannelType
                    }
                }
            }));
            // return the Notification Reminder object
            return {
                data: [createNotificationReminderInput]
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
exports.createNotificationReminder = createNotificationReminder;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJSZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL0NyZWF0ZU5vdGlmaWNhdGlvblJlbWluZGVyUmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsOERBQXdHO0FBQ3hHLCtEQUttQztBQUNuQywrQkFBa0M7QUFFbEM7Ozs7OztHQU1HO0FBQ0ksTUFBTSwwQkFBMEIsR0FBRyxLQUFLLEVBQUUsU0FBaUIsRUFBRSwrQkFBZ0UsRUFBeUMsRUFBRTtJQUMzSyxJQUFJO1FBQ0EseUNBQXlDO1FBQ3pDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVyxDQUFDO1FBRXZDLDRDQUE0QztRQUM1QyxNQUFNLGNBQWMsR0FBRyxJQUFJLGdDQUFjLENBQUMsRUFBQyxNQUFNLEVBQUUsTUFBTSxFQUFDLENBQUMsQ0FBQztRQUU1RCxvQ0FBb0M7UUFDcEMsTUFBTSxTQUFTLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUMzQywrQkFBK0IsQ0FBQyxTQUFTLEdBQUcsK0JBQStCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQywrQkFBK0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUM5SSwrQkFBK0IsQ0FBQyxTQUFTLEdBQUcsK0JBQStCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQywrQkFBK0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUU5STs7O1dBR0c7UUFDSCxNQUFNLCtCQUErQixHQUFHLCtCQUErQixDQUFDLEVBQUUsSUFBSSxNQUFNLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxnQ0FBYyxDQUFDO1lBQ3ZILFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLDJCQUE0QjtZQUNuRCxHQUFHLEVBQUU7Z0JBQ0QsRUFBRSxF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R0FBRyxFQUFFO1FBQ1YsTUFBTSxZQUFZLEdBQUcsb0NBQW9DLFNBQVMsYUFBYSxHQUFHLEVBQUUsQ0FBQztRQUNyRixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzFCLE9BQU87WUFDSCxZQUFZLEVBQUUsWUFBWTtZQUMxQixTQUFTLEVBQUUsK0NBQTZCLENBQUMsZUFBZTtTQUMzRCxDQUFBO0tBQ0o7QUFDTCxDQUFDLENBQUE7QUFsSFksUUFBQSwwQkFBMEIsOEJBa0h0QyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7QXR0cmlidXRlVmFsdWUsIER5bmFtb0RCQ2xpZW50LCBHZXRJdGVtQ29tbWFuZCwgUHV0SXRlbUNvbW1hbmR9IGZyb20gXCJAYXdzLXNkay9jbGllbnQtZHluYW1vZGJcIjtcbmltcG9ydCB7XG4gICAgQ3JlYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dCxcbiAgICBOb3RpZmljYXRpb25SZW1pbmRlcixcbiAgICBOb3RpZmljYXRpb25SZW1pbmRlckVycm9yVHlwZSxcbiAgICBOb3RpZmljYXRpb25SZW1pbmRlclJlc3BvbnNlXG59IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5pbXBvcnQge3Y0IGFzIHV1aWR2NH0gZnJvbSAndXVpZCc7XG5cbi8qKlxuICogQ3JlYXRlTm90aWZpY2F0aW9uUmVtaW5kZXIgcmVzb2x2ZXJcbiAqXG4gKiBAcGFyYW0gZmllbGROYW1lIG5hbWUgb2YgdGhlIHJlc29sdmVyIHBhdGggZnJvbSB0aGUgQXBwU3luYyBldmVudFxuICogQHBhcmFtIGNyZWF0ZU5vdGlmaWNhdGlvblJlbWluZGVySW5wdXQgTm90aWZpY2F0aW9uIFJlbWluZGVyIGlucHV0IG9iamVjdCwgdXNlZCB0byBjcmVhdGUgYSBuZXcgTm90aWZpY2F0aW9uIFJlbWluZGVyIG9iamVjdC5cbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgTm90aWZpY2F0aW9uUmVtaW5kZXJSZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IGNyZWF0ZU5vdGlmaWNhdGlvblJlbWluZGVyID0gYXN5bmMgKGZpZWxkTmFtZTogc3RyaW5nLCBjcmVhdGVOb3RpZmljYXRpb25SZW1pbmRlcklucHV0OiBDcmVhdGVOb3RpZmljYXRpb25SZW1pbmRlcklucHV0KTogUHJvbWlzZTxOb3RpZmljYXRpb25SZW1pbmRlclJlc3BvbnNlPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gcmV0cmlldmluZyB0aGUgY3VycmVudCBmdW5jdGlvbiByZWdpb25cbiAgICAgICAgY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiE7XG5cbiAgICAgICAgLy8gaW5pdGlhbGl6aW5nIHRoZSBEeW5hbW9EQiBkb2N1bWVudCBjbGllbnRcbiAgICAgICAgY29uc3QgZHluYW1vRGJDbGllbnQgPSBuZXcgRHluYW1vREJDbGllbnQoe3JlZ2lvbjogcmVnaW9ufSk7XG5cbiAgICAgICAgLy8gdXBkYXRlIHRoZSB0aW1lc3RhbXBzIGFjY29yZGluZ2x5XG4gICAgICAgIGNvbnN0IGNyZWF0ZWRBdCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICAgICAgY3JlYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dC5jcmVhdGVkQXQgPSBjcmVhdGVOb3RpZmljYXRpb25SZW1pbmRlcklucHV0LmNyZWF0ZWRBdCA/IGNyZWF0ZU5vdGlmaWNhdGlvblJlbWluZGVySW5wdXQuY3JlYXRlZEF0IDogY3JlYXRlZEF0O1xuICAgICAgICBjcmVhdGVOb3RpZmljYXRpb25SZW1pbmRlcklucHV0LnVwZGF0ZWRBdCA9IGNyZWF0ZU5vdGlmaWNhdGlvblJlbWluZGVySW5wdXQudXBkYXRlZEF0ID8gY3JlYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dC51cGRhdGVkQXQgOiBjcmVhdGVkQXQ7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIGNoZWNrIHRvIHNlZSBpZiB0aGVyZSBpcyBhbiBleGlzdGluZyBOb3RpZmljYXRpb24gUmVtaW5kZXIgd2l0aCB0aGUgc2FtZSBJRCwgaW4gY2FzZSB0aGVyZSBpc1xuICAgICAgICAgKiBhbiBpZCBwYXNzZWQgaW4uXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBwcmVFeGlzdGluZ05vdGlmaWNhdGlvblJlbWluZGVyID0gY3JlYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dC5pZCAmJiBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBHZXRJdGVtQ29tbWFuZCh7XG4gICAgICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52Lk5PVElGSUNBVElPTl9SRU1JTkRFUl9UQUJMRSEsXG4gICAgICAgICAgICBLZXk6IHtcbiAgICAgICAgICAgICAgICBpZDoge1xuICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVOb3RpZmljYXRpb25SZW1pbmRlcklucHV0LmlkXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogd2UncmUgbm90IGludGVyZXN0ZWQgaW4gZ2V0dGluZyBhbGwgdGhlIGRhdGEgZm9yIHRoaXMgY2FsbCwganVzdCB0aGUgbWluaW11bSBmb3IgdXMgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdGhpcyBpcyBhIGR1cGxpY2F0ZSBvciBub3RcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBAbGluayBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vYW1hem9uZHluYW1vZGIvbGF0ZXN0L2RldmVsb3Blcmd1aWRlL1Jlc2VydmVkV29yZHMuaHRtbFxuICAgICAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2FtYXpvbmR5bmFtb2RiL2xhdGVzdC9kZXZlbG9wZXJndWlkZS9FeHByZXNzaW9ucy5FeHByZXNzaW9uQXR0cmlidXRlTmFtZXMuaHRtbFxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBQcm9qZWN0aW9uRXhwcmVzc2lvbjogJyNpZGYnLFxuICAgICAgICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzOiB7XG4gICAgICAgICAgICAgICAgJyNpZGYnOiAnaWQnXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKTtcblxuICAgICAgICAvLyBpZiB0aGVyZSBpcyBhbiBpdGVtIHJldHJpZXZlZCwgdGhlbiB3ZSByZXR1cm4gYW4gZXJyb3JcbiAgICAgICAgaWYgKHByZUV4aXN0aW5nTm90aWZpY2F0aW9uUmVtaW5kZXIgJiYgcHJlRXhpc3RpbmdOb3RpZmljYXRpb25SZW1pbmRlci5JdGVtKSB7XG4gICAgICAgICAgICAvLyBpZiB0aGVyZSBpcyBhbiBleGlzdGVudCBOb3RpZmljYXRpb24gUmVtaW5kZXIgb2JqZWN0LCB0aGVuIHdlIGNhbm5vdCBkdXBsaWNhdGUgdGhhdCwgc28gd2Ugd2lsbCByZXR1cm4gYW4gZXJyb3JcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBEdXBsaWNhdGUgTm90aWZpY2F0aW9uIFJlbWluZGVyIG9iamVjdCBmb3VuZCFgO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvblJlbWluZGVyRXJyb3JUeXBlLkR1cGxpY2F0ZU9iamVjdEZvdW5kXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBnZW5lcmF0ZSBhIHVuaXF1ZSBhcHBsaWNhdGlvbiBpZGVudGlmaWVyIGZvciB0aGUgTm90aWZpY2F0aW9uIFJlbWluZGVyLCBpZiBub3QgYWxyZWFkeSBwYXNzZWQgaW5cbiAgICAgICAgICAgIGNyZWF0ZU5vdGlmaWNhdGlvblJlbWluZGVySW5wdXQuaWQgPSBjcmVhdGVOb3RpZmljYXRpb25SZW1pbmRlcklucHV0LmlkID8gY3JlYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dC5pZCA6IHV1aWR2NCgpO1xuXG4gICAgICAgICAgICAvLyBjcmVhdGUgdGhlIG5vdGlmaWNhdGlvbiBjaGFubmVsIHR5cGUgYXJyYXkgZnJvbSB0aGUgaW5wdXRcbiAgICAgICAgICAgIGNvbnN0IG5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlOiBBdHRyaWJ1dGVWYWx1ZVtdID0gW107XG4gICAgICAgICAgICBjcmVhdGVOb3RpZmljYXRpb25SZW1pbmRlcklucHV0Lm5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlLmZvckVhY2gobm90aWZpY2F0aW9uQ2hhbm5lbCA9PiB7XG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uQ2hhbm5lbFR5cGUucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIFM6IG5vdGlmaWNhdGlvbkNoYW5uZWwhXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBzdG9yZSB0aGUgbmV4dCB0cmlnZ2VyIGRhdGUvdGltZSwgdG8gc3RhcnQgdGhlIG5leHQgZGF5XG4gICAgICAgICAgICBjb25zdCB0cmlnZ2VyRGF0ZSA9IG5ldyBEYXRlKERhdGUubm93KCkpO1xuICAgICAgICAgICAgdHJpZ2dlckRhdGUuc2V0RGF0ZSh0cmlnZ2VyRGF0ZS5nZXREYXRlKCkgKyAxKTtcbiAgICAgICAgICAgIHRyaWdnZXJEYXRlLnNldEhvdXJzKDE5LCAwLDAsMCk7IC8vIHNldCB0aGUgVVRDIHRpbWUgdG8gbWF0Y2ggMTIgUE0gTVNULyAyIFBNIENTVCAvIDMgUE0gRVNUXG4gICAgICAgICAgICBjcmVhdGVOb3RpZmljYXRpb25SZW1pbmRlcklucHV0Lm5leHRUcmlnZ2VyQXQgPSB0cmlnZ2VyRGF0ZS50b0lTT1N0cmluZygpO1xuXG4gICAgICAgICAgICAvLyBpbml0aWFsbHkgc2V0IHRoaXMgYXMgMCB0aW1lcyBzaW5jZSB0aGlzIGhhcyBuZXZlciBiZWVuIHRyaWdnZXJlZCBhdCB0aGUgY3JlYXRpb24gdGltZVxuICAgICAgICAgICAgY3JlYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dC5ub3RpZmljYXRpb25SZW1pbmRlckNvdW50ID0gMDtcblxuICAgICAgICAgICAgLy8gc3RvcmUgdGhlIE5vdGlmaWNhdGlvbiBSZW1pbmRlciBvYmplY3RcbiAgICAgICAgICAgIGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IFB1dEl0ZW1Db21tYW5kKHtcbiAgICAgICAgICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52Lk5PVElGSUNBVElPTl9SRU1JTkRFUl9UQUJMRSEsXG4gICAgICAgICAgICAgICAgSXRlbToge1xuICAgICAgICAgICAgICAgICAgICBpZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dC5pZCFcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uUmVtaW5kZXJUeXBlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVOb3RpZmljYXRpb25SZW1pbmRlcklucHV0Lm5vdGlmaWNhdGlvblJlbWluZGVyVHlwZSFcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uUmVtaW5kZXJTdGF0dXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvblJlbWluZGVySW5wdXQubm90aWZpY2F0aW9uUmVtaW5kZXJTdGF0dXMhXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvblJlbWluZGVyQ2FkZW5jZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dC5ub3RpZmljYXRpb25SZW1pbmRlckNhZGVuY2UhXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dC5jcmVhdGVkQXQhXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRBdDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dC51cGRhdGVkQXQhXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIG5leHRUcmlnZ2VyQXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvblJlbWluZGVySW5wdXQubmV4dFRyaWdnZXJBdCFcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uUmVtaW5kZXJDb3VudDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgTjogY3JlYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dC5ub3RpZmljYXRpb25SZW1pbmRlckNvdW50IS50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBMOiBub3RpZmljYXRpb25DaGFubmVsVHlwZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICAvLyByZXR1cm4gdGhlIE5vdGlmaWNhdGlvbiBSZW1pbmRlciBvYmplY3RcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZGF0YTogW2NyZWF0ZU5vdGlmaWNhdGlvblJlbWluZGVySW5wdXQgYXMgTm90aWZpY2F0aW9uUmVtaW5kZXJdXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgZXhlY3V0aW5nICR7ZmllbGROYW1lfSBtdXRhdGlvbiAke2Vycn1gO1xuICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvblJlbWluZGVyRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICB9XG4gICAgfVxufVxuIl19