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
            // store the next trigger date/time, to start the next day if there is no trigger date passed in
            if (createNotificationReminderInput.nextTriggerAt === null || createNotificationReminderInput.nextTriggerAt === undefined || createNotificationReminderInput.nextTriggerAt.length === 0) {
                const triggerDate = new Date(Date.now());
                triggerDate.setDate(triggerDate.getDate() + 1);
                triggerDate.setHours(19, 0, 0, 0); // set the UTC time to match 12 PM MST/ 2 PM CST / 3 PM EST
                createNotificationReminderInput.nextTriggerAt = triggerDate.toISOString();
            }
            // initially set this as 0 times since this has never been triggered at the creation time
            createNotificationReminderInput.notificationReminderCount = 0;
            // if there is no max count for the reminder, then set it to 999,999, otherwise set it according to what we get from the input
            switch (createNotificationReminderInput.notificationReminderCadence) {
                case moonbeam_models_1.NotificationReminderCadence.OneTime:
                    // for the one time run we set it to one regardless of what we get as the input
                    createNotificationReminderInput.notificationReminderMaxCount = 1;
                    break;
                case moonbeam_models_1.NotificationReminderCadence.Daily:
                case moonbeam_models_1.NotificationReminderCadence.Weekly:
                case moonbeam_models_1.NotificationReminderCadence.BiWeekly:
                case moonbeam_models_1.NotificationReminderCadence.Monthly:
                    createNotificationReminderInput.notificationReminderMaxCount =
                        createNotificationReminderInput.notificationReminderMaxCount === null || createNotificationReminderInput.notificationReminderMaxCount === undefined
                            ? 999999
                            : createNotificationReminderInput.notificationReminderMaxCount;
                    break;
                default:
                    createNotificationReminderInput.notificationReminderMaxCount = 999999;
                    break;
            }
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
                    notificationReminderMaxCount: {
                        N: createNotificationReminderInput.notificationReminderMaxCount.toString()
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJSZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL0NyZWF0ZU5vdGlmaWNhdGlvblJlbWluZGVyUmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsOERBQXdHO0FBQ3hHLCtEQU1tQztBQUNuQywrQkFBa0M7QUFFbEM7Ozs7OztHQU1HO0FBQ0ksTUFBTSwwQkFBMEIsR0FBRyxLQUFLLEVBQUUsU0FBaUIsRUFBRSwrQkFBZ0UsRUFBeUMsRUFBRTtJQUMzSyxJQUFJO1FBQ0EseUNBQXlDO1FBQ3pDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVyxDQUFDO1FBRXZDLDRDQUE0QztRQUM1QyxNQUFNLGNBQWMsR0FBRyxJQUFJLGdDQUFjLENBQUMsRUFBQyxNQUFNLEVBQUUsTUFBTSxFQUFDLENBQUMsQ0FBQztRQUU1RCxvQ0FBb0M7UUFDcEMsTUFBTSxTQUFTLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUMzQywrQkFBK0IsQ0FBQyxTQUFTLEdBQUcsK0JBQStCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQywrQkFBK0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUM5SSwrQkFBK0IsQ0FBQyxTQUFTLEdBQUcsK0JBQStCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQywrQkFBK0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUU5STs7O1dBR0c7UUFDSCxNQUFNLCtCQUErQixHQUFHLCtCQUErQixDQUFDLEVBQUUsSUFBSSxNQUFNLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxnQ0FBYyxDQUFDO1lBQ3ZILFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLDJCQUE0QjtZQUNuRCxHQUFHLEVBQUU7Z0JBQ0QsRUFBRSxF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LENBQUE7QUEzSVksUUFBQSwwQkFBMEIsOEJBMkl0QyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7QXR0cmlidXRlVmFsdWUsIER5bmFtb0RCQ2xpZW50LCBHZXRJdGVtQ29tbWFuZCwgUHV0SXRlbUNvbW1hbmR9IGZyb20gXCJAYXdzLXNkay9jbGllbnQtZHluYW1vZGJcIjtcbmltcG9ydCB7XG4gICAgQ3JlYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dCxcbiAgICBOb3RpZmljYXRpb25SZW1pbmRlcixcbiAgICBOb3RpZmljYXRpb25SZW1pbmRlckNhZGVuY2UsXG4gICAgTm90aWZpY2F0aW9uUmVtaW5kZXJFcnJvclR5cGUsXG4gICAgTm90aWZpY2F0aW9uUmVtaW5kZXJSZXNwb25zZVxufSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuaW1wb3J0IHt2NCBhcyB1dWlkdjR9IGZyb20gJ3V1aWQnO1xuXG4vKipcbiAqIENyZWF0ZU5vdGlmaWNhdGlvblJlbWluZGVyIHJlc29sdmVyXG4gKlxuICogQHBhcmFtIGZpZWxkTmFtZSBuYW1lIG9mIHRoZSByZXNvbHZlciBwYXRoIGZyb20gdGhlIEFwcFN5bmMgZXZlbnRcbiAqIEBwYXJhbSBjcmVhdGVOb3RpZmljYXRpb25SZW1pbmRlcklucHV0IE5vdGlmaWNhdGlvbiBSZW1pbmRlciBpbnB1dCBvYmplY3QsIHVzZWQgdG8gY3JlYXRlIGEgbmV3IE5vdGlmaWNhdGlvbiBSZW1pbmRlciBvYmplY3QuXG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIE5vdGlmaWNhdGlvblJlbWluZGVyUmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCBjcmVhdGVOb3RpZmljYXRpb25SZW1pbmRlciA9IGFzeW5jIChmaWVsZE5hbWU6IHN0cmluZywgY3JlYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dDogQ3JlYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dCk6IFByb21pc2U8Tm90aWZpY2F0aW9uUmVtaW5kZXJSZXNwb25zZT4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgIC8vIGluaXRpYWxpemluZyB0aGUgRHluYW1vREIgZG9jdW1lbnQgY2xpZW50XG4gICAgICAgIGNvbnN0IGR5bmFtb0RiQ2xpZW50ID0gbmV3IER5bmFtb0RCQ2xpZW50KHtyZWdpb246IHJlZ2lvbn0pO1xuXG4gICAgICAgIC8vIHVwZGF0ZSB0aGUgdGltZXN0YW1wcyBhY2NvcmRpbmdseVxuICAgICAgICBjb25zdCBjcmVhdGVkQXQgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgICAgIGNyZWF0ZU5vdGlmaWNhdGlvblJlbWluZGVySW5wdXQuY3JlYXRlZEF0ID0gY3JlYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dC5jcmVhdGVkQXQgPyBjcmVhdGVOb3RpZmljYXRpb25SZW1pbmRlcklucHV0LmNyZWF0ZWRBdCA6IGNyZWF0ZWRBdDtcbiAgICAgICAgY3JlYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dC51cGRhdGVkQXQgPSBjcmVhdGVOb3RpZmljYXRpb25SZW1pbmRlcklucHV0LnVwZGF0ZWRBdCA/IGNyZWF0ZU5vdGlmaWNhdGlvblJlbWluZGVySW5wdXQudXBkYXRlZEF0IDogY3JlYXRlZEF0O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBjaGVjayB0byBzZWUgaWYgdGhlcmUgaXMgYW4gZXhpc3RpbmcgTm90aWZpY2F0aW9uIFJlbWluZGVyIHdpdGggdGhlIHNhbWUgSUQsIGluIGNhc2UgdGhlcmUgaXNcbiAgICAgICAgICogYW4gaWQgcGFzc2VkIGluLlxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3QgcHJlRXhpc3RpbmdOb3RpZmljYXRpb25SZW1pbmRlciA9IGNyZWF0ZU5vdGlmaWNhdGlvblJlbWluZGVySW5wdXQuaWQgJiYgYXdhaXQgZHluYW1vRGJDbGllbnQuc2VuZChuZXcgR2V0SXRlbUNvbW1hbmQoe1xuICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5OT1RJRklDQVRJT05fUkVNSU5ERVJfVEFCTEUhLFxuICAgICAgICAgICAgS2V5OiB7XG4gICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dC5pZFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIHdlJ3JlIG5vdCBpbnRlcmVzdGVkIGluIGdldHRpbmcgYWxsIHRoZSBkYXRhIGZvciB0aGlzIGNhbGwsIGp1c3QgdGhlIG1pbmltdW0gZm9yIHVzIHRvIGRldGVybWluZSB3aGV0aGVyIHRoaXMgaXMgYSBkdXBsaWNhdGUgb3Igbm90XG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2FtYXpvbmR5bmFtb2RiL2xhdGVzdC9kZXZlbG9wZXJndWlkZS9SZXNlcnZlZFdvcmRzLmh0bWxcbiAgICAgICAgICAgICAqIEBsaW5rIGh0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9hbWF6b25keW5hbW9kYi9sYXRlc3QvZGV2ZWxvcGVyZ3VpZGUvRXhwcmVzc2lvbnMuRXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzLmh0bWxcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgUHJvamVjdGlvbkV4cHJlc3Npb246ICcjaWRmJyxcbiAgICAgICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lczoge1xuICAgICAgICAgICAgICAgICcjaWRmJzogJ2lkJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG5cbiAgICAgICAgLy8gaWYgdGhlcmUgaXMgYW4gaXRlbSByZXRyaWV2ZWQsIHRoZW4gd2UgcmV0dXJuIGFuIGVycm9yXG4gICAgICAgIGlmIChwcmVFeGlzdGluZ05vdGlmaWNhdGlvblJlbWluZGVyICYmIHByZUV4aXN0aW5nTm90aWZpY2F0aW9uUmVtaW5kZXIuSXRlbSkge1xuICAgICAgICAgICAgLy8gaWYgdGhlcmUgaXMgYW4gZXhpc3RlbnQgTm90aWZpY2F0aW9uIFJlbWluZGVyIG9iamVjdCwgdGhlbiB3ZSBjYW5ub3QgZHVwbGljYXRlIHRoYXQsIHNvIHdlIHdpbGwgcmV0dXJuIGFuIGVycm9yXG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgRHVwbGljYXRlIE5vdGlmaWNhdGlvbiBSZW1pbmRlciBvYmplY3QgZm91bmQhYDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25SZW1pbmRlckVycm9yVHlwZS5EdXBsaWNhdGVPYmplY3RGb3VuZFxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gZ2VuZXJhdGUgYSB1bmlxdWUgYXBwbGljYXRpb24gaWRlbnRpZmllciBmb3IgdGhlIE5vdGlmaWNhdGlvbiBSZW1pbmRlciwgaWYgbm90IGFscmVhZHkgcGFzc2VkIGluXG4gICAgICAgICAgICBjcmVhdGVOb3RpZmljYXRpb25SZW1pbmRlcklucHV0LmlkID0gY3JlYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dC5pZCA/IGNyZWF0ZU5vdGlmaWNhdGlvblJlbWluZGVySW5wdXQuaWQgOiB1dWlkdjQoKTtcblxuICAgICAgICAgICAgLy8gY3JlYXRlIHRoZSBub3RpZmljYXRpb24gY2hhbm5lbCB0eXBlIGFycmF5IGZyb20gdGhlIGlucHV0XG4gICAgICAgICAgICBjb25zdCBub3RpZmljYXRpb25DaGFubmVsVHlwZTogQXR0cmlidXRlVmFsdWVbXSA9IFtdO1xuICAgICAgICAgICAgY3JlYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dC5ub3RpZmljYXRpb25DaGFubmVsVHlwZS5mb3JFYWNoKG5vdGlmaWNhdGlvbkNoYW5uZWwgPT4ge1xuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBTOiBub3RpZmljYXRpb25DaGFubmVsIVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gc3RvcmUgdGhlIG5leHQgdHJpZ2dlciBkYXRlL3RpbWUsIHRvIHN0YXJ0IHRoZSBuZXh0IGRheSBpZiB0aGVyZSBpcyBubyB0cmlnZ2VyIGRhdGUgcGFzc2VkIGluXG4gICAgICAgICAgICBpZiAoY3JlYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dC5uZXh0VHJpZ2dlckF0ID09PSBudWxsIHx8IGNyZWF0ZU5vdGlmaWNhdGlvblJlbWluZGVySW5wdXQubmV4dFRyaWdnZXJBdCA9PT0gdW5kZWZpbmVkIHx8IGNyZWF0ZU5vdGlmaWNhdGlvblJlbWluZGVySW5wdXQubmV4dFRyaWdnZXJBdC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0cmlnZ2VyRGF0ZSA9IG5ldyBEYXRlKERhdGUubm93KCkpO1xuICAgICAgICAgICAgICAgIHRyaWdnZXJEYXRlLnNldERhdGUodHJpZ2dlckRhdGUuZ2V0RGF0ZSgpICsgMSk7XG4gICAgICAgICAgICAgICAgdHJpZ2dlckRhdGUuc2V0SG91cnMoMTksIDAsIDAsIDApOyAvLyBzZXQgdGhlIFVUQyB0aW1lIHRvIG1hdGNoIDEyIFBNIE1TVC8gMiBQTSBDU1QgLyAzIFBNIEVTVFxuICAgICAgICAgICAgICAgIGNyZWF0ZU5vdGlmaWNhdGlvblJlbWluZGVySW5wdXQubmV4dFRyaWdnZXJBdCA9IHRyaWdnZXJEYXRlLnRvSVNPU3RyaW5nKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGluaXRpYWxseSBzZXQgdGhpcyBhcyAwIHRpbWVzIHNpbmNlIHRoaXMgaGFzIG5ldmVyIGJlZW4gdHJpZ2dlcmVkIGF0IHRoZSBjcmVhdGlvbiB0aW1lXG4gICAgICAgICAgICBjcmVhdGVOb3RpZmljYXRpb25SZW1pbmRlcklucHV0Lm5vdGlmaWNhdGlvblJlbWluZGVyQ291bnQgPSAwO1xuXG4gICAgICAgICAgICAvLyBpZiB0aGVyZSBpcyBubyBtYXggY291bnQgZm9yIHRoZSByZW1pbmRlciwgdGhlbiBzZXQgaXQgdG8gOTk5LDk5OSwgb3RoZXJ3aXNlIHNldCBpdCBhY2NvcmRpbmcgdG8gd2hhdCB3ZSBnZXQgZnJvbSB0aGUgaW5wdXRcbiAgICAgICAgICAgIHN3aXRjaCAoY3JlYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dC5ub3RpZmljYXRpb25SZW1pbmRlckNhZGVuY2UpIHtcbiAgICAgICAgICAgICAgICBjYXNlIE5vdGlmaWNhdGlvblJlbWluZGVyQ2FkZW5jZS5PbmVUaW1lOlxuICAgICAgICAgICAgICAgICAgICAvLyBmb3IgdGhlIG9uZSB0aW1lIHJ1biB3ZSBzZXQgaXQgdG8gb25lIHJlZ2FyZGxlc3Mgb2Ygd2hhdCB3ZSBnZXQgYXMgdGhlIGlucHV0XG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZU5vdGlmaWNhdGlvblJlbWluZGVySW5wdXQubm90aWZpY2F0aW9uUmVtaW5kZXJNYXhDb3VudCA9IDE7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgTm90aWZpY2F0aW9uUmVtaW5kZXJDYWRlbmNlLkRhaWx5OlxuICAgICAgICAgICAgICAgIGNhc2UgTm90aWZpY2F0aW9uUmVtaW5kZXJDYWRlbmNlLldlZWtseTpcbiAgICAgICAgICAgICAgICBjYXNlIE5vdGlmaWNhdGlvblJlbWluZGVyQ2FkZW5jZS5CaVdlZWtseTpcbiAgICAgICAgICAgICAgICBjYXNlIE5vdGlmaWNhdGlvblJlbWluZGVyQ2FkZW5jZS5Nb250aGx5OlxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVOb3RpZmljYXRpb25SZW1pbmRlcklucHV0Lm5vdGlmaWNhdGlvblJlbWluZGVyTWF4Q291bnQgPVxuICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dC5ub3RpZmljYXRpb25SZW1pbmRlck1heENvdW50ID09PSBudWxsIHx8IGNyZWF0ZU5vdGlmaWNhdGlvblJlbWluZGVySW5wdXQubm90aWZpY2F0aW9uUmVtaW5kZXJNYXhDb3VudCA9PT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyA5OTk5OTlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IGNyZWF0ZU5vdGlmaWNhdGlvblJlbWluZGVySW5wdXQubm90aWZpY2F0aW9uUmVtaW5kZXJNYXhDb3VudDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dC5ub3RpZmljYXRpb25SZW1pbmRlck1heENvdW50ID0gOTk5OTk5O1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gc3RvcmUgdGhlIE5vdGlmaWNhdGlvbiBSZW1pbmRlciBvYmplY3RcbiAgICAgICAgICAgIGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IFB1dEl0ZW1Db21tYW5kKHtcbiAgICAgICAgICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52Lk5PVElGSUNBVElPTl9SRU1JTkRFUl9UQUJMRSEsXG4gICAgICAgICAgICAgICAgSXRlbToge1xuICAgICAgICAgICAgICAgICAgICBpZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dC5pZCFcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uUmVtaW5kZXJUeXBlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVOb3RpZmljYXRpb25SZW1pbmRlcklucHV0Lm5vdGlmaWNhdGlvblJlbWluZGVyVHlwZSFcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uUmVtaW5kZXJTdGF0dXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvblJlbWluZGVySW5wdXQubm90aWZpY2F0aW9uUmVtaW5kZXJTdGF0dXMhXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvblJlbWluZGVyQ2FkZW5jZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dC5ub3RpZmljYXRpb25SZW1pbmRlckNhZGVuY2UhXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dC5jcmVhdGVkQXQhXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRBdDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dC51cGRhdGVkQXQhXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIG5leHRUcmlnZ2VyQXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU5vdGlmaWNhdGlvblJlbWluZGVySW5wdXQubmV4dFRyaWdnZXJBdCFcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uUmVtaW5kZXJDb3VudDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgTjogY3JlYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dC5ub3RpZmljYXRpb25SZW1pbmRlckNvdW50IS50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvblJlbWluZGVyTWF4Q291bnQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIE46IGNyZWF0ZU5vdGlmaWNhdGlvblJlbWluZGVySW5wdXQubm90aWZpY2F0aW9uUmVtaW5kZXJNYXhDb3VudCEudG9TdHJpbmcoKVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBub3RpZmljYXRpb25DaGFubmVsVHlwZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgTDogbm90aWZpY2F0aW9uQ2hhbm5lbFR5cGVcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBOb3RpZmljYXRpb24gUmVtaW5kZXIgb2JqZWN0XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRhdGE6IFtjcmVhdGVOb3RpZmljYXRpb25SZW1pbmRlcklucHV0IGFzIE5vdGlmaWNhdGlvblJlbWluZGVyXVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyAke2ZpZWxkTmFtZX0gbXV0YXRpb24gJHtlcnJ9YDtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25SZW1pbmRlckVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==