"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotificationReminders = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * GetNotificationReminders resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @returns {@link Promise} of {@link NotificationReminderResponse}
 */
const getNotificationReminders = async (fieldName) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        // initializing the DynamoDB document client
        const dynamoDbClient = new client_dynamodb_1.DynamoDBClient({ region: region });
        /**
         * the data to be retrieved from the Query Command
         * the eligible user Items returned from the Query Command, all aggregated together
         * the last evaluated key, to help with the pagination of results
         */
        let result = [];
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
            retrievedData = await dynamoDbClient.send(new client_dynamodb_1.ScanCommand({
                TableName: process.env.NOTIFICATION_REMINDER_TABLE,
                Limit: 1000, // for now, we don't need to worry about this limit
            }));
            result = result.concat(retrievedData.Items);
        } while (retrievedData && retrievedData.Count && retrievedData.Items &&
            retrievedData.Items.length && retrievedData.Count !== 0 &&
            retrievedData.Items.length !== 0 && retrievedData.LastEvaluatedKey);
        // if there are eligible users retrieved, then return them accordingly
        if (result && result.length !== 0) {
            // convert the Dynamo DB data from Dynamo DB JSON format to a Notification Reminder data format
            const notificationReminderData = [];
            result.forEach(notificationReminderResult => {
                console.log(JSON.stringify(notificationReminderResult));
                const notificationChannelType = [];
                notificationReminderResult.notificationChannelType.L &&
                    notificationReminderResult.notificationChannelType.L.forEach(notificationChannelTypeResult => {
                        notificationChannelType.push(notificationChannelTypeResult.S);
                    });
                notificationReminderData.push({
                    id: notificationReminderResult.id.S,
                    createdAt: notificationReminderResult.createdAt.S,
                    updatedAt: notificationReminderResult.updatedAt.S,
                    nextTriggerAt: notificationReminderResult.nextTriggerAt.S,
                    notificationChannelType: notificationChannelType,
                    notificationReminderCadence: notificationReminderResult.notificationReminderCadence.S,
                    notificationReminderCount: Number(notificationReminderResult.notificationReminderCount.N),
                    notificationReminderStatus: notificationReminderResult.notificationReminderStatus.S,
                    notificationReminderType: notificationReminderResult.notificationReminderType.S
                });
            });
            // return the list of Notification Reminders retrieved
            return {
                data: notificationReminderData
            };
        }
        else {
            const errorMessage = `No Notification Reminders found!`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.NotificationReminderErrorType.NoneOrAbsent
            };
        }
    }
    catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} query ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: moonbeam_models_1.NotificationReminderErrorType.UnexpectedError
        };
    }
};
exports.getNotificationReminders = getNotificationReminders;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2V0Tm90aWZpY2F0aW9uUmVtaW5kZXJSZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL0dldE5vdGlmaWNhdGlvblJlbWluZGVyUmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsOERBQXFGO0FBQ3JGLCtEQVFtQztBQUVuQzs7Ozs7R0FLRztBQUNJLE1BQU0sd0JBQXdCLEdBQUcsS0FBSyxFQUFFLFNBQWlCLEVBQXlDLEVBQUU7SUFDdkcsSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2Qyw0Q0FBNEM7UUFDNUMsTUFBTSxjQUFjLEdBQUcsSUFBSSxnQ0FBYyxDQUFDLEVBQUMsTUFBTSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7UUFFNUQ7Ozs7V0FJRztRQUNILElBQUksTUFBTSxHQUFxQyxFQUFFLENBQUM7UUFDbEQsSUFBSSxhQUFhLENBQUM7UUFFbEIsR0FBRztZQUNDOzs7Ozs7OztlQVFHO1lBQ0gsYUFBYSxHQUFHLE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLDZCQUFXLENBQUM7Z0JBQ3RELFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLDJCQUE0QjtnQkFDbkQsS0FBSyxFQUFFLElBQUksRUFBRSxtREFBbUQ7YUFDbkUsQ0FBQyxDQUFDLENBQUM7WUFFSixNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDL0MsUUFBUSxhQUFhLElBQUksYUFBYSxDQUFDLEtBQUssSUFBSSxhQUFhLENBQUMsS0FBSztZQUNwRSxhQUFhLENBQUMsS0FBSyxDQUFDLE1BQU0sSUFBSSxhQUFhLENBQUMsS0FBSyxLQUFLLENBQUM7WUFDdkQsYUFBYSxDQUFDLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLGFBQWEsQ0FBQyxnQkFBZ0IsRUFBRTtRQUVwRSxzRUFBc0U7UUFDdEUsSUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDL0IsK0ZBQStGO1lBQy9GLE1BQU0sd0JBQXdCLEdBQTJCLEVBQUUsQ0FBQztZQUM1RCxNQUFNLENBQUMsT0FBTyxDQUFDLDBCQUEwQixDQUFDLEVBQUU7Z0JBQ3hDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLENBQUM7Z0JBRXhELE1BQU0sdUJBQXVCLEdBQThCLEVBQUUsQ0FBQztnQkFDOUQsMEJBQTBCLENBQUMsdUJBQXVCLENBQUMsQ0FBQztvQkFDcEQsMEJBQTBCLENBQUMsdUJBQXVCLENBQUMsQ0FBRSxDQUFDLE9BQU8sQ0FBQyw2QkFBNkIsQ0FBQyxFQUFFO3dCQUMxRix1QkFBdUIsQ0FBQyxJQUFJLENBQUMsNkJBQTZCLENBQUMsQ0FBNkIsQ0FBQyxDQUFDO29CQUM5RixDQUFDLENBQUMsQ0FBQztnQkFDSCx3QkFBd0IsQ0FBQyxJQUFJLENBQUM7b0JBQzFCLEVBQUUsRUFBRSwwQkFBMEIsQ0FBQyxFQUFFLENBQUMsQ0FBRTtvQkFDcEMsU0FBUyxFQUFFLDBCQUEwQixDQUFDLFNBQVMsQ0FBQyxDQUFFO29CQUNsRCxTQUFTLEVBQUUsMEJBQTBCLENBQUMsU0FBUyxDQUFDLENBQUU7b0JBQ2xELGFBQWEsRUFBRSwwQkFBMEIsQ0FBQyxhQUFhLENBQUMsQ0FBRTtvQkFDMUQsdUJBQXVCLEVBQUUsdUJBQXVCO29CQUNoRCwyQkFBMkIsRUFBRSwwQkFBMEIsQ0FBQywyQkFBMkIsQ0FBQyxDQUFpQztvQkFDckgseUJBQXlCLEVBQUUsTUFBTSxDQUFDLDBCQUEwQixDQUFDLHlCQUF5QixDQUFDLENBQUUsQ0FBQztvQkFDMUYsMEJBQTBCLEVBQUUsMEJBQTBCLENBQUMsMEJBQTBCLENBQUMsQ0FBZ0M7b0JBQ2xILHdCQUF3QixFQUFFLDBCQUEwQixDQUFDLHdCQUF3QixDQUFDLENBQThCO2lCQUMvRyxDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQztZQUNILHNEQUFzRDtZQUN0RCxPQUFPO2dCQUNILElBQUksRUFBRSx3QkFBd0I7YUFDakMsQ0FBQTtTQUNKO2FBQU07WUFDSCxNQUFNLFlBQVksR0FBRyxrQ0FBa0MsQ0FBQztZQUN4RCxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRTFCLE9BQU87Z0JBQ0gsWUFBWSxFQUFFLFlBQVk7Z0JBQzFCLFNBQVMsRUFBRSwrQ0FBNkIsQ0FBQyxZQUFZO2FBQ3hELENBQUE7U0FDSjtLQUNKO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDVixNQUFNLFlBQVksR0FBRyxvQ0FBb0MsU0FBUyxVQUFVLEdBQUcsRUFBRSxDQUFDO1FBQ2xGLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDMUIsT0FBTztZQUNILFlBQVksRUFBRSxZQUFZO1lBQzFCLFNBQVMsRUFBRSwrQ0FBNkIsQ0FBQyxlQUFlO1NBQzNELENBQUM7S0FDTDtBQUNMLENBQUMsQ0FBQTtBQWpGWSxRQUFBLHdCQUF3Qiw0QkFpRnBDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtBdHRyaWJ1dGVWYWx1ZSwgRHluYW1vREJDbGllbnQsIFNjYW5Db21tYW5kfSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LWR5bmFtb2RiXCI7XG5pbXBvcnQge1xuICAgIE5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlLFxuICAgIE5vdGlmaWNhdGlvblJlbWluZGVyLFxuICAgIE5vdGlmaWNhdGlvblJlbWluZGVyQ2FkZW5jZSxcbiAgICBOb3RpZmljYXRpb25SZW1pbmRlckVycm9yVHlwZSxcbiAgICBOb3RpZmljYXRpb25SZW1pbmRlclJlc3BvbnNlLFxuICAgIE5vdGlmaWNhdGlvblJlbWluZGVyU3RhdHVzLFxuICAgIE5vdGlmaWNhdGlvblJlbWluZGVyVHlwZVxufSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuXG4vKipcbiAqIEdldE5vdGlmaWNhdGlvblJlbWluZGVycyByZXNvbHZlclxuICpcbiAqIEBwYXJhbSBmaWVsZE5hbWUgbmFtZSBvZiB0aGUgcmVzb2x2ZXIgcGF0aCBmcm9tIHRoZSBBcHBTeW5jIGV2ZW50XG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIE5vdGlmaWNhdGlvblJlbWluZGVyUmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCBnZXROb3RpZmljYXRpb25SZW1pbmRlcnMgPSBhc3luYyAoZmllbGROYW1lOiBzdHJpbmcpOiBQcm9taXNlPE5vdGlmaWNhdGlvblJlbWluZGVyUmVzcG9uc2U+ID0+IHtcbiAgICB0cnkge1xuICAgICAgICAvLyByZXRyaWV2aW5nIHRoZSBjdXJyZW50IGZ1bmN0aW9uIHJlZ2lvblxuICAgICAgICBjb25zdCByZWdpb24gPSBwcm9jZXNzLmVudi5BV1NfUkVHSU9OITtcblxuICAgICAgICAvLyBpbml0aWFsaXppbmcgdGhlIER5bmFtb0RCIGRvY3VtZW50IGNsaWVudFxuICAgICAgICBjb25zdCBkeW5hbW9EYkNsaWVudCA9IG5ldyBEeW5hbW9EQkNsaWVudCh7cmVnaW9uOiByZWdpb259KTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogdGhlIGRhdGEgdG8gYmUgcmV0cmlldmVkIGZyb20gdGhlIFF1ZXJ5IENvbW1hbmRcbiAgICAgICAgICogdGhlIGVsaWdpYmxlIHVzZXIgSXRlbXMgcmV0dXJuZWQgZnJvbSB0aGUgUXVlcnkgQ29tbWFuZCwgYWxsIGFnZ3JlZ2F0ZWQgdG9nZXRoZXJcbiAgICAgICAgICogdGhlIGxhc3QgZXZhbHVhdGVkIGtleSwgdG8gaGVscCB3aXRoIHRoZSBwYWdpbmF0aW9uIG9mIHJlc3VsdHNcbiAgICAgICAgICovXG4gICAgICAgIGxldCByZXN1bHQ6IFJlY29yZDxzdHJpbmcsIEF0dHJpYnV0ZVZhbHVlPltdID0gW107XG4gICAgICAgIGxldCByZXRyaWV2ZWREYXRhO1xuXG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogcmV0cmlldmUgYWxsIHRoZSBOb3RpZmljYXRpb24gUmVtaW5kZXJzXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogTGltaXQgb2YgMSBNQiBwZXIgcGFnaW5hdGVkIHJlc3BvbnNlIGRhdGEsIGJ1dCB3ZSB3b24ndCBoYXZlIHRoYXQgbWFueSBOb3RpZmljYXRpb24gUmVtaW5kZXJzIGFueXdheSBmb3Igbm93LFxuICAgICAgICAgICAgICogd2hpY2ggbWVhbnMgdGhhdCB3ZSB3b24ndCBuZWVkIHRvIGRvIHBhZ2luYXRpb24gaGVyZS5cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBAbGluayB7aHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2FtYXpvbmR5bmFtb2RiL2xhdGVzdC9kZXZlbG9wZXJndWlkZS9RdWVyeS5QYWdpbmF0aW9uLmh0bWx9XG4gICAgICAgICAgICAgKiBAbGluayB7aHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2FtYXpvbmR5bmFtb2RiL2xhdGVzdC9kZXZlbG9wZXJndWlkZS9RdWVyeS5odG1sfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICByZXRyaWV2ZWREYXRhID0gYXdhaXQgZHluYW1vRGJDbGllbnQuc2VuZChuZXcgU2NhbkNvbW1hbmQoe1xuICAgICAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuTk9USUZJQ0FUSU9OX1JFTUlOREVSX1RBQkxFISxcbiAgICAgICAgICAgICAgICBMaW1pdDogMTAwMCwgLy8gZm9yIG5vdywgd2UgZG9uJ3QgbmVlZCB0byB3b3JyeSBhYm91dCB0aGlzIGxpbWl0XG4gICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5jb25jYXQocmV0cmlldmVkRGF0YS5JdGVtcyk7XG4gICAgICAgIH0gd2hpbGUgKHJldHJpZXZlZERhdGEgJiYgcmV0cmlldmVkRGF0YS5Db3VudCAmJiByZXRyaWV2ZWREYXRhLkl0ZW1zICYmXG4gICAgICAgIHJldHJpZXZlZERhdGEuSXRlbXMubGVuZ3RoICYmIHJldHJpZXZlZERhdGEuQ291bnQgIT09IDAgJiZcbiAgICAgICAgcmV0cmlldmVkRGF0YS5JdGVtcy5sZW5ndGggIT09IDAgJiYgcmV0cmlldmVkRGF0YS5MYXN0RXZhbHVhdGVkS2V5KTtcblxuICAgICAgICAvLyBpZiB0aGVyZSBhcmUgZWxpZ2libGUgdXNlcnMgcmV0cmlldmVkLCB0aGVuIHJldHVybiB0aGVtIGFjY29yZGluZ2x5XG4gICAgICAgIGlmIChyZXN1bHQgJiYgcmVzdWx0Lmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgLy8gY29udmVydCB0aGUgRHluYW1vIERCIGRhdGEgZnJvbSBEeW5hbW8gREIgSlNPTiBmb3JtYXQgdG8gYSBOb3RpZmljYXRpb24gUmVtaW5kZXIgZGF0YSBmb3JtYXRcbiAgICAgICAgICAgIGNvbnN0IG5vdGlmaWNhdGlvblJlbWluZGVyRGF0YTogTm90aWZpY2F0aW9uUmVtaW5kZXJbXSA9IFtdO1xuICAgICAgICAgICAgcmVzdWx0LmZvckVhY2gobm90aWZpY2F0aW9uUmVtaW5kZXJSZXN1bHQgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KG5vdGlmaWNhdGlvblJlbWluZGVyUmVzdWx0KSk7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBub3RpZmljYXRpb25DaGFubmVsVHlwZTogTm90aWZpY2F0aW9uQ2hhbm5lbFR5cGVbXSA9IFtdO1xuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvblJlbWluZGVyUmVzdWx0Lm5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlLkwgJiZcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25SZW1pbmRlclJlc3VsdC5ub3RpZmljYXRpb25DaGFubmVsVHlwZS5MIS5mb3JFYWNoKG5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlUmVzdWx0ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uQ2hhbm5lbFR5cGUucHVzaChub3RpZmljYXRpb25DaGFubmVsVHlwZVJlc3VsdC5TISBhcyBOb3RpZmljYXRpb25DaGFubmVsVHlwZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uUmVtaW5kZXJEYXRhLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBpZDogbm90aWZpY2F0aW9uUmVtaW5kZXJSZXN1bHQuaWQuUyEsXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDogbm90aWZpY2F0aW9uUmVtaW5kZXJSZXN1bHQuY3JlYXRlZEF0LlMhLFxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVkQXQ6IG5vdGlmaWNhdGlvblJlbWluZGVyUmVzdWx0LnVwZGF0ZWRBdC5TISxcbiAgICAgICAgICAgICAgICAgICAgbmV4dFRyaWdnZXJBdDogbm90aWZpY2F0aW9uUmVtaW5kZXJSZXN1bHQubmV4dFRyaWdnZXJBdC5TISxcbiAgICAgICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uQ2hhbm5lbFR5cGU6IG5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlLFxuICAgICAgICAgICAgICAgICAgICBub3RpZmljYXRpb25SZW1pbmRlckNhZGVuY2U6IG5vdGlmaWNhdGlvblJlbWluZGVyUmVzdWx0Lm5vdGlmaWNhdGlvblJlbWluZGVyQ2FkZW5jZS5TISBhcyBOb3RpZmljYXRpb25SZW1pbmRlckNhZGVuY2UsXG4gICAgICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvblJlbWluZGVyQ291bnQ6IE51bWJlcihub3RpZmljYXRpb25SZW1pbmRlclJlc3VsdC5ub3RpZmljYXRpb25SZW1pbmRlckNvdW50Lk4hKSxcbiAgICAgICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uUmVtaW5kZXJTdGF0dXM6IG5vdGlmaWNhdGlvblJlbWluZGVyUmVzdWx0Lm5vdGlmaWNhdGlvblJlbWluZGVyU3RhdHVzLlMhIGFzIE5vdGlmaWNhdGlvblJlbWluZGVyU3RhdHVzLFxuICAgICAgICAgICAgICAgICAgICBub3RpZmljYXRpb25SZW1pbmRlclR5cGU6IG5vdGlmaWNhdGlvblJlbWluZGVyUmVzdWx0Lm5vdGlmaWNhdGlvblJlbWluZGVyVHlwZS5TISBhcyBOb3RpZmljYXRpb25SZW1pbmRlclR5cGVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBsaXN0IG9mIE5vdGlmaWNhdGlvbiBSZW1pbmRlcnMgcmV0cmlldmVkXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRhdGE6IG5vdGlmaWNhdGlvblJlbWluZGVyRGF0YVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vIE5vdGlmaWNhdGlvbiBSZW1pbmRlcnMgZm91bmQhYDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25SZW1pbmRlckVycm9yVHlwZS5Ob25lT3JBYnNlbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgJHtmaWVsZE5hbWV9IHF1ZXJ5ICR7ZXJyfWA7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uUmVtaW5kZXJFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgIH07XG4gICAgfVxufVxuIl19