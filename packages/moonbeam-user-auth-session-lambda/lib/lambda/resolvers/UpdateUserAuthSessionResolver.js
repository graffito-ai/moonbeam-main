"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserAuthSession = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * UpdateUserAuthSession resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param updateUserAuthSessionInput User Auth Session input object, used to update an existing session object (if found).
 * @returns {@link Promise} of {@link UserAuthSessionResponse}
 */
const updateUserAuthSession = async (fieldName, updateUserAuthSessionInput) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        // initializing the DynamoDB document client
        const dynamoDbClient = new client_dynamodb_1.DynamoDBClient({ region: region });
        // update the timestamps accordingly
        const updatedAt = new Date().toISOString();
        updateUserAuthSessionInput.updatedAt = updateUserAuthSessionInput.updatedAt ? updateUserAuthSessionInput.updatedAt : updatedAt;
        /**
         * check to see if there is an existing User Auth Session with the same ID.
         */
        const preExistingUserAuthSession = updateUserAuthSessionInput.id && await dynamoDbClient.send(new client_dynamodb_1.GetItemCommand({
            TableName: process.env.USER_AUTH_SESSION_TABLE,
            Key: {
                id: {
                    S: updateUserAuthSessionInput.id
                }
            }
        }));
        // if there is an item to be retrieved, we update it accordingly
        if (preExistingUserAuthSession && preExistingUserAuthSession.Item) {
            // update the user auth session object, by increasing the number of sessions, and the latest updated timestamp
            const updatedNumberOfSessions = Number(Number(preExistingUserAuthSession.Item.numberOfSessions.N) + 1);
            await dynamoDbClient.send(new client_dynamodb_1.UpdateItemCommand({
                TableName: process.env.USER_AUTH_SESSION_TABLE,
                Key: {
                    id: {
                        S: updateUserAuthSessionInput.id
                    }
                },
                ExpressionAttributeNames: {
                    "#NOS": "numberOfSessions",
                    "#UA": "updatedAt"
                },
                ExpressionAttributeValues: {
                    ":nos": {
                        N: updatedNumberOfSessions.toString() // increase the existing number of sessions by 1
                    },
                    ":ua": {
                        S: updateUserAuthSessionInput.updatedAt
                    }
                },
                UpdateExpression: "SET #NOS = :nos, #UA = :ua",
                ReturnValues: "UPDATED_NEW"
            }));
            // return the updated user auth session object
            return {
                data: {
                    id: updateUserAuthSessionInput.id,
                    createdAt: preExistingUserAuthSession.Item.createdAt.S,
                    updatedAt: updateUserAuthSessionInput.updatedAt,
                    numberOfSessions: updatedNumberOfSessions
                }
            };
        }
        else {
            // if there is no item retrieved, then we return an error
            const errorMessage = `User Auth session not found for ${updateUserAuthSessionInput.id}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.UserAuthSessionErrorType.NoneOrAbsent
            };
        }
    }
    catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} mutation ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: moonbeam_models_1.UserAuthSessionErrorType.UnexpectedError
        };
    }
};
exports.updateUserAuthSession = updateUserAuthSession;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXBkYXRlVXNlckF1dGhTZXNzaW9uUmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL3Jlc29sdmVycy9VcGRhdGVVc2VyQXV0aFNlc3Npb25SZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw4REFBMkY7QUFDM0YsK0RBQXdIO0FBRXhIOzs7Ozs7R0FNRztBQUNJLE1BQU0scUJBQXFCLEdBQUcsS0FBSyxFQUFFLFNBQWlCLEVBQUUsMEJBQXNELEVBQW9DLEVBQUU7SUFDdkosSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2Qyw0Q0FBNEM7UUFDNUMsTUFBTSxjQUFjLEdBQUcsSUFBSSxnQ0FBYyxDQUFDLEVBQUMsTUFBTSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7UUFFNUQsb0NBQW9DO1FBQ3BDLE1BQU0sU0FBUyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDM0MsMEJBQTBCLENBQUMsU0FBUyxHQUFHLDBCQUEwQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsMEJBQTBCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFFL0g7O1dBRUc7UUFDSCxNQUFNLDBCQUEwQixHQUFHLDBCQUEwQixDQUFDLEVBQUUsSUFBSSxNQUFNLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxnQ0FBYyxDQUFDO1lBQzdHLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLHVCQUF3QjtZQUMvQyxHQUFHLEVBQUU7Z0JBQ0QsRUFBRSxFQUFFO29CQUNBLENBQUMsRUFBRSwwQkFBMEIsQ0FBQyxFQUFFO2lCQUNuQzthQUNKO1NBQ0osQ0FBQyxDQUFDLENBQUM7UUFFSixnRUFBZ0U7UUFDaEUsSUFBSSwwQkFBMEIsSUFBSSwwQkFBMEIsQ0FBQyxJQUFJLEVBQUU7WUFDL0QsOEdBQThHO1lBQzlHLE1BQU0sdUJBQXVCLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDeEcsTUFBTSxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksbUNBQWlCLENBQUM7Z0JBQzVDLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLHVCQUF3QjtnQkFDL0MsR0FBRyxFQUFFO29CQUNELEVBQUUsRUFBRTt3QkFDQSxDQUFDLEVBQUUsMEJBQTBCLENBQUMsRUFBRTtxQkFDbkM7aUJBQ0o7Z0JBQ0Qsd0JBQXdCLEVBQUU7b0JBQ3RCLE1BQU0sRUFBRSxrQkFBa0I7b0JBQzFCLEtBQUssRUFBRSxXQUFXO2lCQUNyQjtnQkFDRCx5QkFBeUIsRUFBRTtvQkFDdkIsTUFBTSxFQUFFO3dCQUNKLENBQUMsRUFBRSx1QkFBdUIsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxnREFBZ0Q7cUJBQ3pGO29CQUNELEtBQUssRUFBRTt3QkFDSCxDQUFDLEVBQUUsMEJBQTBCLENBQUMsU0FBUztxQkFDMUM7aUJBQ0o7Z0JBQ0QsZ0JBQWdCLEVBQUUsNEJBQTRCO2dCQUM5QyxZQUFZLEVBQUUsYUFBYTthQUM5QixDQUFDLENBQUMsQ0FBQztZQUVKLDhDQUE4QztZQUM5QyxPQUFPO2dCQUNILElBQUksRUFBRTtvQkFDRixFQUFFLEVBQUUsMEJBQTBCLENBQUMsRUFBRTtvQkFDakMsU0FBUyxFQUFFLDBCQUEwQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBRTtvQkFDdkQsU0FBUyxFQUFFLDBCQUEwQixDQUFDLFNBQVM7b0JBQy9DLGdCQUFnQixFQUFFLHVCQUF1QjtpQkFDNUM7YUFDSixDQUFBO1NBQ0o7YUFBTTtZQUNILHlEQUF5RDtZQUN6RCxNQUFNLFlBQVksR0FBRyxtQ0FBbUMsMEJBQTBCLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDeEYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUUxQixPQUFPO2dCQUNILFlBQVksRUFBRSxZQUFZO2dCQUMxQixTQUFTLEVBQUUsMENBQXdCLENBQUMsWUFBWTthQUNuRCxDQUFBO1NBQ0o7S0FDSjtJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1YsTUFBTSxZQUFZLEdBQUcsb0NBQW9DLFNBQVMsYUFBYSxHQUFHLEVBQUUsQ0FBQztRQUNyRixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzFCLE9BQU87WUFDSCxZQUFZLEVBQUUsWUFBWTtZQUMxQixTQUFTLEVBQUUsMENBQXdCLENBQUMsZUFBZTtTQUN0RCxDQUFBO0tBQ0o7QUFDTCxDQUFDLENBQUE7QUE5RVksUUFBQSxxQkFBcUIseUJBOEVqQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RHluYW1vREJDbGllbnQsIEdldEl0ZW1Db21tYW5kLCBVcGRhdGVJdGVtQ29tbWFuZH0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1keW5hbW9kYlwiO1xuaW1wb3J0IHtVcGRhdGVVc2VyQXV0aFNlc3Npb25JbnB1dCwgVXNlckF1dGhTZXNzaW9uRXJyb3JUeXBlLCBVc2VyQXV0aFNlc3Npb25SZXNwb25zZX0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcblxuLyoqXG4gKiBVcGRhdGVVc2VyQXV0aFNlc3Npb24gcmVzb2x2ZXJcbiAqXG4gKiBAcGFyYW0gZmllbGROYW1lIG5hbWUgb2YgdGhlIHJlc29sdmVyIHBhdGggZnJvbSB0aGUgQXBwU3luYyBldmVudFxuICogQHBhcmFtIHVwZGF0ZVVzZXJBdXRoU2Vzc2lvbklucHV0IFVzZXIgQXV0aCBTZXNzaW9uIGlucHV0IG9iamVjdCwgdXNlZCB0byB1cGRhdGUgYW4gZXhpc3Rpbmcgc2Vzc2lvbiBvYmplY3QgKGlmIGZvdW5kKS5cbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgVXNlckF1dGhTZXNzaW9uUmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCB1cGRhdGVVc2VyQXV0aFNlc3Npb24gPSBhc3luYyAoZmllbGROYW1lOiBzdHJpbmcsIHVwZGF0ZVVzZXJBdXRoU2Vzc2lvbklucHV0OiBVcGRhdGVVc2VyQXV0aFNlc3Npb25JbnB1dCk6IFByb21pc2U8VXNlckF1dGhTZXNzaW9uUmVzcG9uc2U+ID0+IHtcbiAgICB0cnkge1xuICAgICAgICAvLyByZXRyaWV2aW5nIHRoZSBjdXJyZW50IGZ1bmN0aW9uIHJlZ2lvblxuICAgICAgICBjb25zdCByZWdpb24gPSBwcm9jZXNzLmVudi5BV1NfUkVHSU9OITtcblxuICAgICAgICAvLyBpbml0aWFsaXppbmcgdGhlIER5bmFtb0RCIGRvY3VtZW50IGNsaWVudFxuICAgICAgICBjb25zdCBkeW5hbW9EYkNsaWVudCA9IG5ldyBEeW5hbW9EQkNsaWVudCh7cmVnaW9uOiByZWdpb259KTtcblxuICAgICAgICAvLyB1cGRhdGUgdGhlIHRpbWVzdGFtcHMgYWNjb3JkaW5nbHlcbiAgICAgICAgY29uc3QgdXBkYXRlZEF0ID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgICAgICB1cGRhdGVVc2VyQXV0aFNlc3Npb25JbnB1dC51cGRhdGVkQXQgPSB1cGRhdGVVc2VyQXV0aFNlc3Npb25JbnB1dC51cGRhdGVkQXQgPyB1cGRhdGVVc2VyQXV0aFNlc3Npb25JbnB1dC51cGRhdGVkQXQgOiB1cGRhdGVkQXQ7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIGNoZWNrIHRvIHNlZSBpZiB0aGVyZSBpcyBhbiBleGlzdGluZyBVc2VyIEF1dGggU2Vzc2lvbiB3aXRoIHRoZSBzYW1lIElELlxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3QgcHJlRXhpc3RpbmdVc2VyQXV0aFNlc3Npb24gPSB1cGRhdGVVc2VyQXV0aFNlc3Npb25JbnB1dC5pZCAmJiBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBHZXRJdGVtQ29tbWFuZCh7XG4gICAgICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52LlVTRVJfQVVUSF9TRVNTSU9OX1RBQkxFISxcbiAgICAgICAgICAgIEtleToge1xuICAgICAgICAgICAgICAgIGlkOiB7XG4gICAgICAgICAgICAgICAgICAgIFM6IHVwZGF0ZVVzZXJBdXRoU2Vzc2lvbklucHV0LmlkXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG5cbiAgICAgICAgLy8gaWYgdGhlcmUgaXMgYW4gaXRlbSB0byBiZSByZXRyaWV2ZWQsIHdlIHVwZGF0ZSBpdCBhY2NvcmRpbmdseVxuICAgICAgICBpZiAocHJlRXhpc3RpbmdVc2VyQXV0aFNlc3Npb24gJiYgcHJlRXhpc3RpbmdVc2VyQXV0aFNlc3Npb24uSXRlbSkge1xuICAgICAgICAgICAgLy8gdXBkYXRlIHRoZSB1c2VyIGF1dGggc2Vzc2lvbiBvYmplY3QsIGJ5IGluY3JlYXNpbmcgdGhlIG51bWJlciBvZiBzZXNzaW9ucywgYW5kIHRoZSBsYXRlc3QgdXBkYXRlZCB0aW1lc3RhbXBcbiAgICAgICAgICAgIGNvbnN0IHVwZGF0ZWROdW1iZXJPZlNlc3Npb25zID0gTnVtYmVyKE51bWJlcihwcmVFeGlzdGluZ1VzZXJBdXRoU2Vzc2lvbi5JdGVtLm51bWJlck9mU2Vzc2lvbnMuTiEpICsgMSk7XG4gICAgICAgICAgICBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBVcGRhdGVJdGVtQ29tbWFuZCh7XG4gICAgICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5VU0VSX0FVVEhfU0VTU0lPTl9UQUJMRSEsXG4gICAgICAgICAgICAgICAgS2V5OiB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTOiB1cGRhdGVVc2VyQXV0aFNlc3Npb25JbnB1dC5pZFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBFeHByZXNzaW9uQXR0cmlidXRlTmFtZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCIjTk9TXCI6IFwibnVtYmVyT2ZTZXNzaW9uc1wiLFxuICAgICAgICAgICAgICAgICAgICBcIiNVQVwiOiBcInVwZGF0ZWRBdFwiXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBFeHByZXNzaW9uQXR0cmlidXRlVmFsdWVzOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiOm5vc1wiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBOOiB1cGRhdGVkTnVtYmVyT2ZTZXNzaW9ucy50b1N0cmluZygpIC8vIGluY3JlYXNlIHRoZSBleGlzdGluZyBudW1iZXIgb2Ygc2Vzc2lvbnMgYnkgMVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBcIjp1YVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTOiB1cGRhdGVVc2VyQXV0aFNlc3Npb25JbnB1dC51cGRhdGVkQXRcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgVXBkYXRlRXhwcmVzc2lvbjogXCJTRVQgI05PUyA9IDpub3MsICNVQSA9IDp1YVwiLFxuICAgICAgICAgICAgICAgIFJldHVyblZhbHVlczogXCJVUERBVEVEX05FV1wiXG4gICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgIC8vIHJldHVybiB0aGUgdXBkYXRlZCB1c2VyIGF1dGggc2Vzc2lvbiBvYmplY3RcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICBpZDogdXBkYXRlVXNlckF1dGhTZXNzaW9uSW5wdXQuaWQsXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDogcHJlRXhpc3RpbmdVc2VyQXV0aFNlc3Npb24uSXRlbS5jcmVhdGVkQXQuUyEsXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRBdDogdXBkYXRlVXNlckF1dGhTZXNzaW9uSW5wdXQudXBkYXRlZEF0LFxuICAgICAgICAgICAgICAgICAgICBudW1iZXJPZlNlc3Npb25zOiB1cGRhdGVkTnVtYmVyT2ZTZXNzaW9uc1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGlmIHRoZXJlIGlzIG5vIGl0ZW0gcmV0cmlldmVkLCB0aGVuIHdlIHJldHVybiBhbiBlcnJvclxuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVzZXIgQXV0aCBzZXNzaW9uIG5vdCBmb3VuZCBmb3IgJHt1cGRhdGVVc2VyQXV0aFNlc3Npb25JbnB1dC5pZH1gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFVzZXJBdXRoU2Vzc2lvbkVycm9yVHlwZS5Ob25lT3JBYnNlbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgJHtmaWVsZE5hbWV9IG11dGF0aW9uICR7ZXJyfWA7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgIGVycm9yVHlwZTogVXNlckF1dGhTZXNzaW9uRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICB9XG4gICAgfVxufVxuIl19