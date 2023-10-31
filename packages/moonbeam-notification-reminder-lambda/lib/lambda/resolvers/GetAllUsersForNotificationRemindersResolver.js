"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsersForNotificationReminders = void 0;
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * GetAllUsersForNotificationReminders resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @returns {@link Promise} of {@link UserForNotificationReminderResponse}
 */
const getAllUsersForNotificationReminders = async (fieldName) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        /**
         * retrieve the list of all existent users from our Cognito user pool
         *
         * first, initialize the Moonbeam Client API here, in order to call the appropriate endpoints for this handler
         */
        const moonbeamClient = new moonbeam_models_1.MoonbeamClient(process.env.ENV_NAME, region);
        const usersForNotificationReminderResponse = await moonbeamClient.getAllUsersForNotificationReminders();
        // check to see if the get all users call was successful or not
        if (usersForNotificationReminderResponse && !usersForNotificationReminderResponse.errorMessage && !usersForNotificationReminderResponse.errorType &&
            usersForNotificationReminderResponse.data && usersForNotificationReminderResponse.data.length !== 0) {
            // return all the users accordingly
            return {
                data: usersForNotificationReminderResponse.data
            };
        }
        else {
            const errorMessage = `Retrieving all users through the getAllUsersForNotificationReminders call failed`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.NotificationReminderErrorType.UnexpectedError
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
exports.getAllUsersForNotificationReminders = getAllUsersForNotificationReminders;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2V0QWxsVXNlcnNGb3JOb3RpZmljYXRpb25SZW1pbmRlcnNSZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL0dldEFsbFVzZXJzRm9yTm90aWZpY2F0aW9uUmVtaW5kZXJzUmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsK0RBQTZIO0FBRTdIOzs7OztHQUtHO0FBQ0ksTUFBTSxtQ0FBbUMsR0FBRyxLQUFLLEVBQUUsU0FBaUIsRUFBZ0QsRUFBRTtJQUN6SCxJQUFJO1FBQ0EseUNBQXlDO1FBQ3pDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVyxDQUFDO1FBRXZDOzs7O1dBSUc7UUFDSCxNQUFNLGNBQWMsR0FBRyxJQUFJLGdDQUFjLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDekUsTUFBTSxvQ0FBb0MsR0FBd0MsTUFBTSxjQUFjLENBQUMsbUNBQW1DLEVBQUUsQ0FBQztRQUU3SSwrREFBK0Q7UUFDL0QsSUFBSSxvQ0FBb0MsSUFBSSxDQUFDLG9DQUFvQyxDQUFDLFlBQVksSUFBSSxDQUFDLG9DQUFvQyxDQUFDLFNBQVM7WUFDN0ksb0NBQW9DLENBQUMsSUFBSSxJQUFJLG9DQUFvQyxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ3JHLG1DQUFtQztZQUNuQyxPQUFPO2dCQUNILElBQUksRUFBRSxvQ0FBb0MsQ0FBQyxJQUFJO2FBQ2xELENBQUM7U0FDTDthQUFNO1lBQ0gsTUFBTSxZQUFZLEdBQUcsa0ZBQWtGLENBQUM7WUFDeEcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUUxQixPQUFPO2dCQUNILFlBQVksRUFBRSxZQUFZO2dCQUMxQixTQUFTLEVBQUUsK0NBQTZCLENBQUMsZUFBZTthQUMzRCxDQUFBO1NBQ0o7S0FDSjtJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1YsTUFBTSxZQUFZLEdBQUcsb0NBQW9DLFNBQVMsVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUNsRixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzFCLE9BQU87WUFDSCxZQUFZLEVBQUUsWUFBWTtZQUMxQixTQUFTLEVBQUUsK0NBQTZCLENBQUMsZUFBZTtTQUMzRCxDQUFDO0tBQ0w7QUFDTCxDQUFDLENBQUE7QUFyQ1ksUUFBQSxtQ0FBbUMsdUNBcUMvQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Tm90aWZpY2F0aW9uUmVtaW5kZXJFcnJvclR5cGUsIE1vb25iZWFtQ2xpZW50LCBVc2VyRm9yTm90aWZpY2F0aW9uUmVtaW5kZXJSZXNwb25zZX0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcblxuLyoqXG4gKiBHZXRBbGxVc2Vyc0Zvck5vdGlmaWNhdGlvblJlbWluZGVycyByZXNvbHZlclxuICpcbiAqIEBwYXJhbSBmaWVsZE5hbWUgbmFtZSBvZiB0aGUgcmVzb2x2ZXIgcGF0aCBmcm9tIHRoZSBBcHBTeW5jIGV2ZW50XG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIFVzZXJGb3JOb3RpZmljYXRpb25SZW1pbmRlclJlc3BvbnNlfVxuICovXG5leHBvcnQgY29uc3QgZ2V0QWxsVXNlcnNGb3JOb3RpZmljYXRpb25SZW1pbmRlcnMgPSBhc3luYyAoZmllbGROYW1lOiBzdHJpbmcpOiBQcm9taXNlPFVzZXJGb3JOb3RpZmljYXRpb25SZW1pbmRlclJlc3BvbnNlPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gcmV0cmlldmluZyB0aGUgY3VycmVudCBmdW5jdGlvbiByZWdpb25cbiAgICAgICAgY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiE7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIHJldHJpZXZlIHRoZSBsaXN0IG9mIGFsbCBleGlzdGVudCB1c2VycyBmcm9tIG91ciBDb2duaXRvIHVzZXIgcG9vbFxuICAgICAgICAgKlxuICAgICAgICAgKiBmaXJzdCwgaW5pdGlhbGl6ZSB0aGUgTW9vbmJlYW0gQ2xpZW50IEFQSSBoZXJlLCBpbiBvcmRlciB0byBjYWxsIHRoZSBhcHByb3ByaWF0ZSBlbmRwb2ludHMgZm9yIHRoaXMgaGFuZGxlclxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3QgbW9vbmJlYW1DbGllbnQgPSBuZXcgTW9vbmJlYW1DbGllbnQocHJvY2Vzcy5lbnYuRU5WX05BTUUhLCByZWdpb24pO1xuICAgICAgICBjb25zdCB1c2Vyc0Zvck5vdGlmaWNhdGlvblJlbWluZGVyUmVzcG9uc2U6IFVzZXJGb3JOb3RpZmljYXRpb25SZW1pbmRlclJlc3BvbnNlID0gYXdhaXQgbW9vbmJlYW1DbGllbnQuZ2V0QWxsVXNlcnNGb3JOb3RpZmljYXRpb25SZW1pbmRlcnMoKTtcblxuICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIGdldCBhbGwgdXNlcnMgY2FsbCB3YXMgc3VjY2Vzc2Z1bCBvciBub3RcbiAgICAgICAgaWYgKHVzZXJzRm9yTm90aWZpY2F0aW9uUmVtaW5kZXJSZXNwb25zZSAmJiAhdXNlcnNGb3JOb3RpZmljYXRpb25SZW1pbmRlclJlc3BvbnNlLmVycm9yTWVzc2FnZSAmJiAhdXNlcnNGb3JOb3RpZmljYXRpb25SZW1pbmRlclJlc3BvbnNlLmVycm9yVHlwZSAmJlxuICAgICAgICAgICAgdXNlcnNGb3JOb3RpZmljYXRpb25SZW1pbmRlclJlc3BvbnNlLmRhdGEgJiYgdXNlcnNGb3JOb3RpZmljYXRpb25SZW1pbmRlclJlc3BvbnNlLmRhdGEubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAvLyByZXR1cm4gYWxsIHRoZSB1c2VycyBhY2NvcmRpbmdseVxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBkYXRhOiB1c2Vyc0Zvck5vdGlmaWNhdGlvblJlbWluZGVyUmVzcG9uc2UuZGF0YVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBSZXRyaWV2aW5nIGFsbCB1c2VycyB0aHJvdWdoIHRoZSBnZXRBbGxVc2Vyc0Zvck5vdGlmaWNhdGlvblJlbWluZGVycyBjYWxsIGZhaWxlZGA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uUmVtaW5kZXJFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgZXhlY3V0aW5nICR7ZmllbGROYW1lfSBxdWVyeSAke2Vycn1gO1xuICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvblJlbWluZGVyRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICB9O1xuICAgIH1cbn1cbiJdfQ==