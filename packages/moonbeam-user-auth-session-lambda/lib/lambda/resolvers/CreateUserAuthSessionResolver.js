"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserAuthSession = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * CreateUserAuthSession resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param createUserAuthSessionInput User Auth Session input object, used to create a new User Auth Session object.
 * @returns {@link Promise} of {@link UserAuthSessionResponse}
 */
const createUserAuthSession = async (fieldName, createUserAuthSessionInput) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        // initializing the DynamoDB document client
        const dynamoDbClient = new client_dynamodb_1.DynamoDBClient({ region: region });
        // update the timestamps accordingly
        const createdAt = new Date().toISOString();
        createUserAuthSessionInput.createdAt = createUserAuthSessionInput.createdAt ? createUserAuthSessionInput.createdAt : createdAt;
        createUserAuthSessionInput.updatedAt = createUserAuthSessionInput.updatedAt ? createUserAuthSessionInput.updatedAt : createdAt;
        /**
         * check to see if there is an existing User Auth Session with the same ID, in case there is
         * an id passed in.
         */
        const preExistingAuthSession = createUserAuthSessionInput.id && await dynamoDbClient.send(new client_dynamodb_1.GetItemCommand({
            TableName: process.env.USER_AUTH_SESSION_TABLE,
            Key: {
                id: {
                    S: createUserAuthSessionInput.id
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
        if (preExistingAuthSession && preExistingAuthSession.Item) {
            // if there is an existent link object, then we cannot duplicate that, so we will return an error
            const errorMessage = `Duplicate User Auth Session object found!`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.UserAuthSessionErrorType.DuplicateObjectFound
            };
        }
        else {
            // store the new User Auth Session
            await dynamoDbClient.send(new client_dynamodb_1.PutItemCommand({
                TableName: process.env.USER_AUTH_SESSION_TABLE,
                Item: {
                    id: {
                        S: createUserAuthSessionInput.id
                    },
                    createdAt: {
                        S: createUserAuthSessionInput.createdAt
                    },
                    updatedAt: {
                        S: createUserAuthSessionInput.updatedAt
                    },
                    numberOfSessions: {
                        N: "1" // hardcoding this first number of sessions to one
                    }
                },
            }));
            // return the User Auth Session object
            return {
                data: {
                    id: createUserAuthSessionInput.id,
                    createdAt: createUserAuthSessionInput.createdAt,
                    updatedAt: createUserAuthSessionInput.updatedAt,
                    numberOfSessions: 1 // hardcoding this first number of sessions to one
                }
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
exports.createUserAuthSession = createUserAuthSession;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXRlVXNlckF1dGhTZXNzaW9uUmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL3Jlc29sdmVycy9DcmVhdGVVc2VyQXV0aFNlc3Npb25SZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw4REFBd0Y7QUFDeEYsK0RBSW1DO0FBRW5DOzs7Ozs7R0FNRztBQUNJLE1BQU0scUJBQXFCLEdBQUcsS0FBSyxFQUFFLFNBQWlCLEVBQUUsMEJBQXNELEVBQW9DLEVBQUU7SUFDdkosSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2Qyw0Q0FBNEM7UUFDNUMsTUFBTSxjQUFjLEdBQUcsSUFBSSxnQ0FBYyxDQUFDLEVBQUMsTUFBTSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7UUFFNUQsb0NBQW9DO1FBQ3BDLE1BQU0sU0FBUyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDM0MsMEJBQTBCLENBQUMsU0FBUyxHQUFHLDBCQUEwQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsMEJBQTBCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDL0gsMEJBQTBCLENBQUMsU0FBUyxHQUFHLDBCQUEwQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsMEJBQTBCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFFL0g7OztXQUdHO1FBQ0gsTUFBTSxzQkFBc0IsR0FBRywwQkFBMEIsQ0FBQyxFQUFFLElBQUksTUFBTSxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksZ0NBQWMsQ0FBQztZQUN6RyxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1QkFBd0I7WUFDL0MsR0FBRyxFQUFFO2dCQUNELEVBQUUsRUFBRTtvQkFDQSxDQUFDLEVBQUUsMEJBQTBCLENBQUMsRUFBRTtpQkFDbkM7YUFDSjtZQUNEOzs7OztlQUtHO1lBQ0gsb0JBQW9CLEVBQUUsTUFBTTtZQUM1Qix3QkFBd0IsRUFBRTtnQkFDdEIsTUFBTSxFQUFFLElBQUk7YUFDZjtTQUNKLENBQUMsQ0FBQyxDQUFDO1FBRUoseURBQXlEO1FBQ3pELElBQUksc0JBQXNCLElBQUksc0JBQXNCLENBQUMsSUFBSSxFQUFFO1lBQ3ZELGlHQUFpRztZQUNqRyxNQUFNLFlBQVksR0FBRywyQ0FBMkMsQ0FBQztZQUNqRSxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRTFCLE9BQU87Z0JBQ0gsWUFBWSxFQUFFLFlBQVk7Z0JBQzFCLFNBQVMsRUFBRSwwQ0FBd0IsQ0FBQyxvQkFBb0I7YUFDM0QsQ0FBQTtTQUNKO2FBQU07WUFDSCxrQ0FBa0M7WUFDbEMsTUFBTSxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksZ0NBQWMsQ0FBQztnQkFDekMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsdUJBQXdCO2dCQUMvQyxJQUFJLEVBQUU7b0JBQ0YsRUFBRSxFQUFFO3dCQUNBLENBQUMsRUFBRSwwQkFBMEIsQ0FBQyxFQUFHO3FCQUNwQztvQkFDRCxTQUFTLEVBQUU7d0JBQ1AsQ0FBQyxFQUFFLDBCQUEwQixDQUFDLFNBQVU7cUJBQzNDO29CQUNELFNBQVMsRUFBRTt3QkFDUCxDQUFDLEVBQUUsMEJBQTBCLENBQUMsU0FBVTtxQkFDM0M7b0JBQ0QsZ0JBQWdCLEVBQUU7d0JBQ2QsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxrREFBa0Q7cUJBQzVEO2lCQUNKO2FBQ0osQ0FBQyxDQUFDLENBQUM7WUFFSixzQ0FBc0M7WUFDdEMsT0FBTztnQkFDSCxJQUFJLEVBQUU7b0JBQ0YsRUFBRSxFQUFFLDBCQUEwQixDQUFDLEVBQUU7b0JBQ2pDLFNBQVMsRUFBRSwwQkFBMEIsQ0FBQyxTQUFTO29CQUMvQyxTQUFTLEVBQUUsMEJBQTBCLENBQUMsU0FBUztvQkFDL0MsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDLGtEQUFrRDtpQkFDekU7YUFDSixDQUFBO1NBQ0o7S0FDSjtJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1YsTUFBTSxZQUFZLEdBQUcsb0NBQW9DLFNBQVMsYUFBYSxHQUFHLEVBQUUsQ0FBQztRQUNyRixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzFCLE9BQU87WUFDSCxZQUFZLEVBQUUsWUFBWTtZQUMxQixTQUFTLEVBQUUsMENBQXdCLENBQUMsZUFBZTtTQUN0RCxDQUFBO0tBQ0o7QUFDTCxDQUFDLENBQUE7QUFwRlksUUFBQSxxQkFBcUIseUJBb0ZqQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RHluYW1vREJDbGllbnQsIEdldEl0ZW1Db21tYW5kLCBQdXRJdGVtQ29tbWFuZH0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1keW5hbW9kYlwiO1xuaW1wb3J0IHtcbiAgICBDcmVhdGVVc2VyQXV0aFNlc3Npb25JbnB1dCxcbiAgICBVc2VyQXV0aFNlc3Npb25FcnJvclR5cGUsXG4gICAgVXNlckF1dGhTZXNzaW9uUmVzcG9uc2Vcbn0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcblxuLyoqXG4gKiBDcmVhdGVVc2VyQXV0aFNlc3Npb24gcmVzb2x2ZXJcbiAqXG4gKiBAcGFyYW0gZmllbGROYW1lIG5hbWUgb2YgdGhlIHJlc29sdmVyIHBhdGggZnJvbSB0aGUgQXBwU3luYyBldmVudFxuICogQHBhcmFtIGNyZWF0ZVVzZXJBdXRoU2Vzc2lvbklucHV0IFVzZXIgQXV0aCBTZXNzaW9uIGlucHV0IG9iamVjdCwgdXNlZCB0byBjcmVhdGUgYSBuZXcgVXNlciBBdXRoIFNlc3Npb24gb2JqZWN0LlxuICogQHJldHVybnMge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBVc2VyQXV0aFNlc3Npb25SZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IGNyZWF0ZVVzZXJBdXRoU2Vzc2lvbiA9IGFzeW5jIChmaWVsZE5hbWU6IHN0cmluZywgY3JlYXRlVXNlckF1dGhTZXNzaW9uSW5wdXQ6IENyZWF0ZVVzZXJBdXRoU2Vzc2lvbklucHV0KTogUHJvbWlzZTxVc2VyQXV0aFNlc3Npb25SZXNwb25zZT4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgIC8vIGluaXRpYWxpemluZyB0aGUgRHluYW1vREIgZG9jdW1lbnQgY2xpZW50XG4gICAgICAgIGNvbnN0IGR5bmFtb0RiQ2xpZW50ID0gbmV3IER5bmFtb0RCQ2xpZW50KHtyZWdpb246IHJlZ2lvbn0pO1xuXG4gICAgICAgIC8vIHVwZGF0ZSB0aGUgdGltZXN0YW1wcyBhY2NvcmRpbmdseVxuICAgICAgICBjb25zdCBjcmVhdGVkQXQgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgICAgIGNyZWF0ZVVzZXJBdXRoU2Vzc2lvbklucHV0LmNyZWF0ZWRBdCA9IGNyZWF0ZVVzZXJBdXRoU2Vzc2lvbklucHV0LmNyZWF0ZWRBdCA/IGNyZWF0ZVVzZXJBdXRoU2Vzc2lvbklucHV0LmNyZWF0ZWRBdCA6IGNyZWF0ZWRBdDtcbiAgICAgICAgY3JlYXRlVXNlckF1dGhTZXNzaW9uSW5wdXQudXBkYXRlZEF0ID0gY3JlYXRlVXNlckF1dGhTZXNzaW9uSW5wdXQudXBkYXRlZEF0ID8gY3JlYXRlVXNlckF1dGhTZXNzaW9uSW5wdXQudXBkYXRlZEF0IDogY3JlYXRlZEF0O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBjaGVjayB0byBzZWUgaWYgdGhlcmUgaXMgYW4gZXhpc3RpbmcgVXNlciBBdXRoIFNlc3Npb24gd2l0aCB0aGUgc2FtZSBJRCwgaW4gY2FzZSB0aGVyZSBpc1xuICAgICAgICAgKiBhbiBpZCBwYXNzZWQgaW4uXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBwcmVFeGlzdGluZ0F1dGhTZXNzaW9uID0gY3JlYXRlVXNlckF1dGhTZXNzaW9uSW5wdXQuaWQgJiYgYXdhaXQgZHluYW1vRGJDbGllbnQuc2VuZChuZXcgR2V0SXRlbUNvbW1hbmQoe1xuICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5VU0VSX0FVVEhfU0VTU0lPTl9UQUJMRSEsXG4gICAgICAgICAgICBLZXk6IHtcbiAgICAgICAgICAgICAgICBpZDoge1xuICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVVc2VyQXV0aFNlc3Npb25JbnB1dC5pZFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIHdlJ3JlIG5vdCBpbnRlcmVzdGVkIGluIGdldHRpbmcgYWxsIHRoZSBkYXRhIGZvciB0aGlzIGNhbGwsIGp1c3QgdGhlIG1pbmltdW0gZm9yIHVzIHRvIGRldGVybWluZSB3aGV0aGVyIHRoaXMgaXMgYSBkdXBsaWNhdGUgb3Igbm90XG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2FtYXpvbmR5bmFtb2RiL2xhdGVzdC9kZXZlbG9wZXJndWlkZS9SZXNlcnZlZFdvcmRzLmh0bWxcbiAgICAgICAgICAgICAqIEBsaW5rIGh0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9hbWF6b25keW5hbW9kYi9sYXRlc3QvZGV2ZWxvcGVyZ3VpZGUvRXhwcmVzc2lvbnMuRXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzLmh0bWxcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgUHJvamVjdGlvbkV4cHJlc3Npb246ICcjaWRmJyxcbiAgICAgICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lczoge1xuICAgICAgICAgICAgICAgICcjaWRmJzogJ2lkJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG5cbiAgICAgICAgLy8gaWYgdGhlcmUgaXMgYW4gaXRlbSByZXRyaWV2ZWQsIHRoZW4gd2UgcmV0dXJuIGFuIGVycm9yXG4gICAgICAgIGlmIChwcmVFeGlzdGluZ0F1dGhTZXNzaW9uICYmIHByZUV4aXN0aW5nQXV0aFNlc3Npb24uSXRlbSkge1xuICAgICAgICAgICAgLy8gaWYgdGhlcmUgaXMgYW4gZXhpc3RlbnQgbGluayBvYmplY3QsIHRoZW4gd2UgY2Fubm90IGR1cGxpY2F0ZSB0aGF0LCBzbyB3ZSB3aWxsIHJldHVybiBhbiBlcnJvclxuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYER1cGxpY2F0ZSBVc2VyIEF1dGggU2Vzc2lvbiBvYmplY3QgZm91bmQhYDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBVc2VyQXV0aFNlc3Npb25FcnJvclR5cGUuRHVwbGljYXRlT2JqZWN0Rm91bmRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIHN0b3JlIHRoZSBuZXcgVXNlciBBdXRoIFNlc3Npb25cbiAgICAgICAgICAgIGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IFB1dEl0ZW1Db21tYW5kKHtcbiAgICAgICAgICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52LlVTRVJfQVVUSF9TRVNTSU9OX1RBQkxFISxcbiAgICAgICAgICAgICAgICBJdGVtOiB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVVc2VyQXV0aFNlc3Npb25JbnB1dC5pZCFcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEF0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVVc2VyQXV0aFNlc3Npb25JbnB1dC5jcmVhdGVkQXQhXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRBdDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlVXNlckF1dGhTZXNzaW9uSW5wdXQudXBkYXRlZEF0IVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBudW1iZXJPZlNlc3Npb25zOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBOOiBcIjFcIiAvLyBoYXJkY29kaW5nIHRoaXMgZmlyc3QgbnVtYmVyIG9mIHNlc3Npb25zIHRvIG9uZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBVc2VyIEF1dGggU2Vzc2lvbiBvYmplY3RcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICBpZDogY3JlYXRlVXNlckF1dGhTZXNzaW9uSW5wdXQuaWQsXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDogY3JlYXRlVXNlckF1dGhTZXNzaW9uSW5wdXQuY3JlYXRlZEF0LFxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVkQXQ6IGNyZWF0ZVVzZXJBdXRoU2Vzc2lvbklucHV0LnVwZGF0ZWRBdCxcbiAgICAgICAgICAgICAgICAgICAgbnVtYmVyT2ZTZXNzaW9uczogMSAvLyBoYXJkY29kaW5nIHRoaXMgZmlyc3QgbnVtYmVyIG9mIHNlc3Npb25zIHRvIG9uZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgJHtmaWVsZE5hbWV9IG11dGF0aW9uICR7ZXJyfWA7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgIGVycm9yVHlwZTogVXNlckF1dGhTZXNzaW9uRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICB9XG4gICAgfVxufVxuIl19