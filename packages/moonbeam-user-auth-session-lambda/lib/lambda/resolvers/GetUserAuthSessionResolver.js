"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserAuthSession = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * GetUserAuthSession resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getUserAuthSessionInput user auth session input, used to retrieved the appropriate session
 * @returns {@link Promise} of {@link UserAuthSessionResponse}
 */
const getUserAuthSession = async (fieldName, getUserAuthSessionInput) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        // initializing the DynamoDB document client
        const dynamoDbClient = new client_dynamodb_1.DynamoDBClient({ region: region });
        // retrieve the User Auth Session given the input
        const retrievedData = await dynamoDbClient.send(new client_dynamodb_1.GetItemCommand({
            TableName: process.env.USER_AUTH_SESSION_TABLE,
            Key: {
                id: {
                    S: getUserAuthSessionInput.id
                }
            }
        }));
        // if there is an item retrieved, then return all of its contents
        if (retrievedData && retrievedData.Item) {
            // return the user auth session response
            return {
                data: {
                    id: retrievedData.Item.id.S,
                    createdAt: retrievedData.Item.createdAt.S,
                    updatedAt: retrievedData.Item.updatedAt.S,
                    numberOfSessions: Number(retrievedData.Item.numberOfSessions.N)
                }
            };
        }
        else {
            const errorMessage = `User Auth session not found for ${getUserAuthSessionInput.id}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.UserAuthSessionErrorType.NoneOrAbsent
            };
        }
    }
    catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} query ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: moonbeam_models_1.UserAuthSessionErrorType.UnexpectedError
        };
    }
};
exports.getUserAuthSession = getUserAuthSession;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2V0VXNlckF1dGhTZXNzaW9uUmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL3Jlc29sdmVycy9HZXRVc2VyQXV0aFNlc3Npb25SZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw4REFBd0U7QUFDeEUsK0RBQXFIO0FBRXJIOzs7Ozs7R0FNRztBQUNJLE1BQU0sa0JBQWtCLEdBQUcsS0FBSyxFQUFFLFNBQWlCLEVBQUUsdUJBQWdELEVBQW9DLEVBQUU7SUFDOUksSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2Qyw0Q0FBNEM7UUFDNUMsTUFBTSxjQUFjLEdBQUcsSUFBSSxnQ0FBYyxDQUFDLEVBQUMsTUFBTSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7UUFFNUQsaURBQWlEO1FBQ2pELE1BQU0sYUFBYSxHQUFHLE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLGdDQUFjLENBQUM7WUFDL0QsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsdUJBQXdCO1lBQy9DLEdBQUcsRUFBRTtnQkFDRCxFQUFFLEVBQUU7b0JBQ0EsQ0FBQyxFQUFFLHVCQUF1QixDQUFDLEVBQUU7aUJBQ2hDO2FBQ0o7U0FDSixDQUFDLENBQUMsQ0FBQztRQUVKLGlFQUFpRTtRQUNqRSxJQUFJLGFBQWEsSUFBSSxhQUFhLENBQUMsSUFBSSxFQUFFO1lBQ3JDLHdDQUF3QztZQUN4QyxPQUFPO2dCQUNILElBQUksRUFBRTtvQkFDRixFQUFFLEVBQUUsYUFBYSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBRTtvQkFDNUIsU0FBUyxFQUFFLGFBQWEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUU7b0JBQzFDLFNBQVMsRUFBRSxhQUFhLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFFO29CQUMxQyxnQkFBZ0IsRUFBRSxNQUFNLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFFLENBQUM7aUJBQ25FO2FBQ0osQ0FBQTtTQUNKO2FBQU07WUFDSCxNQUFNLFlBQVksR0FBRyxtQ0FBbUMsdUJBQXVCLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDckYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUUxQixPQUFPO2dCQUNILFlBQVksRUFBRSxZQUFZO2dCQUMxQixTQUFTLEVBQUUsMENBQXdCLENBQUMsWUFBWTthQUNuRCxDQUFBO1NBQ0o7S0FFSjtJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1YsTUFBTSxZQUFZLEdBQUcsb0NBQW9DLFNBQVMsVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUNsRixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzFCLE9BQU87WUFDSCxZQUFZLEVBQUUsWUFBWTtZQUMxQixTQUFTLEVBQUUsMENBQXdCLENBQUMsZUFBZTtTQUN0RCxDQUFDO0tBQ0w7QUFDTCxDQUFDLENBQUE7QUEvQ1ksUUFBQSxrQkFBa0Isc0JBK0M5QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RHluYW1vREJDbGllbnQsIEdldEl0ZW1Db21tYW5kfSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LWR5bmFtb2RiXCI7XG5pbXBvcnQge0dldFVzZXJBdXRoU2Vzc2lvbklucHV0LCBVc2VyQXV0aFNlc3Npb25FcnJvclR5cGUsIFVzZXJBdXRoU2Vzc2lvblJlc3BvbnNlfSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuXG4vKipcbiAqIEdldFVzZXJBdXRoU2Vzc2lvbiByZXNvbHZlclxuICpcbiAqIEBwYXJhbSBmaWVsZE5hbWUgbmFtZSBvZiB0aGUgcmVzb2x2ZXIgcGF0aCBmcm9tIHRoZSBBcHBTeW5jIGV2ZW50XG4gKiBAcGFyYW0gZ2V0VXNlckF1dGhTZXNzaW9uSW5wdXQgdXNlciBhdXRoIHNlc3Npb24gaW5wdXQsIHVzZWQgdG8gcmV0cmlldmVkIHRoZSBhcHByb3ByaWF0ZSBzZXNzaW9uXG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIFVzZXJBdXRoU2Vzc2lvblJlc3BvbnNlfVxuICovXG5leHBvcnQgY29uc3QgZ2V0VXNlckF1dGhTZXNzaW9uID0gYXN5bmMgKGZpZWxkTmFtZTogc3RyaW5nLCBnZXRVc2VyQXV0aFNlc3Npb25JbnB1dDogR2V0VXNlckF1dGhTZXNzaW9uSW5wdXQpOiBQcm9taXNlPFVzZXJBdXRoU2Vzc2lvblJlc3BvbnNlPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gcmV0cmlldmluZyB0aGUgY3VycmVudCBmdW5jdGlvbiByZWdpb25cbiAgICAgICAgY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiE7XG5cbiAgICAgICAgLy8gaW5pdGlhbGl6aW5nIHRoZSBEeW5hbW9EQiBkb2N1bWVudCBjbGllbnRcbiAgICAgICAgY29uc3QgZHluYW1vRGJDbGllbnQgPSBuZXcgRHluYW1vREJDbGllbnQoe3JlZ2lvbjogcmVnaW9ufSk7XG5cbiAgICAgICAgLy8gcmV0cmlldmUgdGhlIFVzZXIgQXV0aCBTZXNzaW9uIGdpdmVuIHRoZSBpbnB1dFxuICAgICAgICBjb25zdCByZXRyaWV2ZWREYXRhID0gYXdhaXQgZHluYW1vRGJDbGllbnQuc2VuZChuZXcgR2V0SXRlbUNvbW1hbmQoe1xuICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5VU0VSX0FVVEhfU0VTU0lPTl9UQUJMRSEsXG4gICAgICAgICAgICBLZXk6IHtcbiAgICAgICAgICAgICAgICBpZDoge1xuICAgICAgICAgICAgICAgICAgICBTOiBnZXRVc2VyQXV0aFNlc3Npb25JbnB1dC5pZFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuXG4gICAgICAgIC8vIGlmIHRoZXJlIGlzIGFuIGl0ZW0gcmV0cmlldmVkLCB0aGVuIHJldHVybiBhbGwgb2YgaXRzIGNvbnRlbnRzXG4gICAgICAgIGlmIChyZXRyaWV2ZWREYXRhICYmIHJldHJpZXZlZERhdGEuSXRlbSkge1xuICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSB1c2VyIGF1dGggc2Vzc2lvbiByZXNwb25zZVxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiByZXRyaWV2ZWREYXRhLkl0ZW0uaWQuUyEsXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDogcmV0cmlldmVkRGF0YS5JdGVtLmNyZWF0ZWRBdC5TISxcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlZEF0OiByZXRyaWV2ZWREYXRhLkl0ZW0udXBkYXRlZEF0LlMhLFxuICAgICAgICAgICAgICAgICAgICBudW1iZXJPZlNlc3Npb25zOiBOdW1iZXIocmV0cmlldmVkRGF0YS5JdGVtLm51bWJlck9mU2Vzc2lvbnMuTiEpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVzZXIgQXV0aCBzZXNzaW9uIG5vdCBmb3VuZCBmb3IgJHtnZXRVc2VyQXV0aFNlc3Npb25JbnB1dC5pZH1gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFVzZXJBdXRoU2Vzc2lvbkVycm9yVHlwZS5Ob25lT3JBYnNlbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyAke2ZpZWxkTmFtZX0gcXVlcnkgJHtlcnJ9YDtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBVc2VyQXV0aFNlc3Npb25FcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgIH07XG4gICAgfVxufVxuIl19