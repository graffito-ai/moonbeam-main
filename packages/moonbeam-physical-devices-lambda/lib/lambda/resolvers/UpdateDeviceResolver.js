"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDevice = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * UpdateDevice resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param updateDeviceInput update device input, used to update an existent physical device
 * @returns {@link Promise} of {@link UserDeviceResponse}
 */
const updateDevice = async (fieldName, updateDeviceInput) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        // initializing the DynamoDB document client
        const dynamoDbClient = new client_dynamodb_1.DynamoDBClient({ region: region });
        // update the timestamps accordingly
        const updatedAt = new Date().toISOString();
        updateDeviceInput.lastLoginDate = updateDeviceInput.lastLoginDate ? updateDeviceInput.lastLoginDate : updatedAt;
        // check to see if there is a physical device object to update. If there's none, then return an error accordingly.
        const preExistingPhysicalDevice = await dynamoDbClient.send(new client_dynamodb_1.GetItemCommand({
            TableName: process.env.PHYSICAL_DEVICES_TABLE,
            Key: {
                id: {
                    S: updateDeviceInput.id
                },
                tokenId: {
                    S: updateDeviceInput.tokenId
                }
            },
            /**
             * we're not interested in getting all the data for this call, just the minimum for us to determine whether this is a duplicate or not
             *
             * @link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html
             * @link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ExpressionAttributeNames.html
             */
            ProjectionExpression: '#idf, #tId',
            ExpressionAttributeNames: {
                '#idf': 'id',
                '#tId': 'tokenId'
            }
        }));
        // if there is an item retrieved, then we need to check its contents
        if (preExistingPhysicalDevice && preExistingPhysicalDevice.Item) {
            // update the physical device object based on the passed in object
            await dynamoDbClient.send(new client_dynamodb_1.UpdateItemCommand({
                TableName: process.env.PHYSICAL_DEVICES_TABLE,
                Key: {
                    id: {
                        S: updateDeviceInput.id
                    },
                    tokenId: {
                        S: updateDeviceInput.tokenId
                    }
                },
                ExpressionAttributeNames: {
                    "#dst": "deviceState",
                    "#llog": "lastLoginDate"
                },
                ExpressionAttributeValues: {
                    ":dst": {
                        S: updateDeviceInput.deviceState
                    },
                    ":llog": {
                        S: updateDeviceInput.lastLoginDate
                    }
                },
                UpdateExpression: "SET #dst = :dst, #llog = :llog",
                ReturnValues: "UPDATED_NEW"
            }));
            // return the updated physical device object
            return {
                data: updateDeviceInput
            };
        }
        else {
            const errorMessage = `Unknown physical device object to update!`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.UserDeviceErrorType.NoneOrAbsent
            };
        }
    }
    catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} mutation ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: moonbeam_models_1.UserDeviceErrorType.UnexpectedError
        };
    }
};
exports.updateDevice = updateDevice;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXBkYXRlRGV2aWNlUmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL3Jlc29sdmVycy9VcGRhdGVEZXZpY2VSZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw4REFBMkY7QUFDM0YsK0RBQWlIO0FBRWpIOzs7Ozs7R0FNRztBQUNJLE1BQU0sWUFBWSxHQUFHLEtBQUssRUFBRSxTQUFpQixFQUFFLGlCQUFvQyxFQUErQixFQUFFO0lBQ3ZILElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsNENBQTRDO1FBQzVDLE1BQU0sY0FBYyxHQUFHLElBQUksZ0NBQWMsQ0FBQyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBRTVELG9DQUFvQztRQUNwQyxNQUFNLFNBQVMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzNDLGlCQUFpQixDQUFDLGFBQWEsR0FBRyxpQkFBaUIsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBRWhILGtIQUFrSDtRQUNsSCxNQUFNLHlCQUF5QixHQUFHLE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLGdDQUFjLENBQUM7WUFDM0UsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsc0JBQXVCO1lBQzlDLEdBQUcsRUFBRTtnQkFDRCxFQUFFLEVBQUU7b0JBQ0EsQ0FBQyxFQUFFLGlCQUFpQixDQUFDLEVBQUU7aUJBQzFCO2dCQUNELE9BQU8sRUFBRTtvQkFDTCxDQUFDLEVBQUUsaUJBQWlCLENBQUMsT0FBTztpQkFDL0I7YUFDSjtZQUNEOzs7OztlQUtHO1lBQ0gsb0JBQW9CLEVBQUUsWUFBWTtZQUNsQyx3QkFBd0IsRUFBRTtnQkFDdEIsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFNBQVM7YUFDcEI7U0FDSixDQUFDLENBQUMsQ0FBQztRQUVKLG9FQUFvRTtRQUNwRSxJQUFJLHlCQUF5QixJQUFJLHlCQUF5QixDQUFDLElBQUksRUFBRTtZQUM3RCxrRUFBa0U7WUFDbEUsTUFBTSxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksbUNBQWlCLENBQUM7Z0JBQzVDLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUF1QjtnQkFDOUMsR0FBRyxFQUFFO29CQUNELEVBQUUsRUFBRTt3QkFDQSxDQUFDLEVBQUUsaUJBQWlCLENBQUMsRUFBRTtxQkFDMUI7b0JBQ0QsT0FBTyxFQUFFO3dCQUNMLENBQUMsRUFBRSxpQkFBaUIsQ0FBQyxPQUFPO3FCQUMvQjtpQkFDSjtnQkFDRCx3QkFBd0IsRUFBRTtvQkFDdEIsTUFBTSxFQUFFLGFBQWE7b0JBQ3JCLE9BQU8sRUFBRSxlQUFlO2lCQUMzQjtnQkFDRCx5QkFBeUIsRUFBRTtvQkFDdkIsTUFBTSxFQUFFO3dCQUNKLENBQUMsRUFBRSxpQkFBaUIsQ0FBQyxXQUFXO3FCQUNuQztvQkFDRCxPQUFPLEVBQUU7d0JBQ0wsQ0FBQyxFQUFFLGlCQUFpQixDQUFDLGFBQWE7cUJBQ3JDO2lCQUNKO2dCQUNELGdCQUFnQixFQUFFLGdDQUFnQztnQkFDbEQsWUFBWSxFQUFFLGFBQWE7YUFDOUIsQ0FBQyxDQUFDLENBQUM7WUFFSiw0Q0FBNEM7WUFDNUMsT0FBTztnQkFDSCxJQUFJLEVBQUUsaUJBQStCO2FBQ3hDLENBQUE7U0FDSjthQUFNO1lBQ0gsTUFBTSxZQUFZLEdBQUcsMkNBQTJDLENBQUM7WUFDakUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUUxQixPQUFPO2dCQUNILFlBQVksRUFBRSxZQUFZO2dCQUMxQixTQUFTLEVBQUUscUNBQW1CLENBQUMsWUFBWTthQUM5QyxDQUFBO1NBQ0o7S0FDSjtJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1YsTUFBTSxZQUFZLEdBQUcsb0NBQW9DLFNBQVMsYUFBYSxHQUFHLEVBQUUsQ0FBQztRQUNyRixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzFCLE9BQU87WUFDSCxZQUFZLEVBQUUsWUFBWTtZQUMxQixTQUFTLEVBQUUscUNBQW1CLENBQUMsZUFBZTtTQUNqRCxDQUFBO0tBQ0o7QUFDTCxDQUFDLENBQUE7QUF0RlksUUFBQSxZQUFZLGdCQXNGeEIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0R5bmFtb0RCQ2xpZW50LCBHZXRJdGVtQ29tbWFuZCwgVXBkYXRlSXRlbUNvbW1hbmR9IGZyb20gXCJAYXdzLXNkay9jbGllbnQtZHluYW1vZGJcIjtcbmltcG9ydCB7VXBkYXRlRGV2aWNlSW5wdXQsIFVzZXJEZXZpY2VFcnJvclR5cGUsIFVzZXJEZXZpY2VSZXNwb25zZSwgUHVzaERldmljZX0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcblxuLyoqXG4gKiBVcGRhdGVEZXZpY2UgcmVzb2x2ZXJcbiAqXG4gKiBAcGFyYW0gZmllbGROYW1lIG5hbWUgb2YgdGhlIHJlc29sdmVyIHBhdGggZnJvbSB0aGUgQXBwU3luYyBldmVudFxuICogQHBhcmFtIHVwZGF0ZURldmljZUlucHV0IHVwZGF0ZSBkZXZpY2UgaW5wdXQsIHVzZWQgdG8gdXBkYXRlIGFuIGV4aXN0ZW50IHBoeXNpY2FsIGRldmljZVxuICogQHJldHVybnMge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBVc2VyRGV2aWNlUmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCB1cGRhdGVEZXZpY2UgPSBhc3luYyAoZmllbGROYW1lOiBzdHJpbmcsIHVwZGF0ZURldmljZUlucHV0OiBVcGRhdGVEZXZpY2VJbnB1dCk6IFByb21pc2U8VXNlckRldmljZVJlc3BvbnNlPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gcmV0cmlldmluZyB0aGUgY3VycmVudCBmdW5jdGlvbiByZWdpb25cbiAgICAgICAgY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiE7XG5cbiAgICAgICAgLy8gaW5pdGlhbGl6aW5nIHRoZSBEeW5hbW9EQiBkb2N1bWVudCBjbGllbnRcbiAgICAgICAgY29uc3QgZHluYW1vRGJDbGllbnQgPSBuZXcgRHluYW1vREJDbGllbnQoe3JlZ2lvbjogcmVnaW9ufSk7XG5cbiAgICAgICAgLy8gdXBkYXRlIHRoZSB0aW1lc3RhbXBzIGFjY29yZGluZ2x5XG4gICAgICAgIGNvbnN0IHVwZGF0ZWRBdCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICAgICAgdXBkYXRlRGV2aWNlSW5wdXQubGFzdExvZ2luRGF0ZSA9IHVwZGF0ZURldmljZUlucHV0Lmxhc3RMb2dpbkRhdGUgPyB1cGRhdGVEZXZpY2VJbnB1dC5sYXN0TG9naW5EYXRlIDogdXBkYXRlZEF0O1xuXG4gICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGVyZSBpcyBhIHBoeXNpY2FsIGRldmljZSBvYmplY3QgdG8gdXBkYXRlLiBJZiB0aGVyZSdzIG5vbmUsIHRoZW4gcmV0dXJuIGFuIGVycm9yIGFjY29yZGluZ2x5LlxuICAgICAgICBjb25zdCBwcmVFeGlzdGluZ1BoeXNpY2FsRGV2aWNlID0gYXdhaXQgZHluYW1vRGJDbGllbnQuc2VuZChuZXcgR2V0SXRlbUNvbW1hbmQoe1xuICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5QSFlTSUNBTF9ERVZJQ0VTX1RBQkxFISxcbiAgICAgICAgICAgIEtleToge1xuICAgICAgICAgICAgICAgIGlkOiB7XG4gICAgICAgICAgICAgICAgICAgIFM6IHVwZGF0ZURldmljZUlucHV0LmlkXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0b2tlbklkOiB7XG4gICAgICAgICAgICAgICAgICAgIFM6IHVwZGF0ZURldmljZUlucHV0LnRva2VuSWRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiB3ZSdyZSBub3QgaW50ZXJlc3RlZCBpbiBnZXR0aW5nIGFsbCB0aGUgZGF0YSBmb3IgdGhpcyBjYWxsLCBqdXN0IHRoZSBtaW5pbXVtIGZvciB1cyB0byBkZXRlcm1pbmUgd2hldGhlciB0aGlzIGlzIGEgZHVwbGljYXRlIG9yIG5vdFxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIEBsaW5rIGh0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9hbWF6b25keW5hbW9kYi9sYXRlc3QvZGV2ZWxvcGVyZ3VpZGUvUmVzZXJ2ZWRXb3Jkcy5odG1sXG4gICAgICAgICAgICAgKiBAbGluayBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vYW1hem9uZHluYW1vZGIvbGF0ZXN0L2RldmVsb3Blcmd1aWRlL0V4cHJlc3Npb25zLkV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lcy5odG1sXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIFByb2plY3Rpb25FeHByZXNzaW9uOiAnI2lkZiwgI3RJZCcsXG4gICAgICAgICAgICBFeHByZXNzaW9uQXR0cmlidXRlTmFtZXM6IHtcbiAgICAgICAgICAgICAgICAnI2lkZic6ICdpZCcsXG4gICAgICAgICAgICAgICAgJyN0SWQnOiAndG9rZW5JZCdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuXG4gICAgICAgIC8vIGlmIHRoZXJlIGlzIGFuIGl0ZW0gcmV0cmlldmVkLCB0aGVuIHdlIG5lZWQgdG8gY2hlY2sgaXRzIGNvbnRlbnRzXG4gICAgICAgIGlmIChwcmVFeGlzdGluZ1BoeXNpY2FsRGV2aWNlICYmIHByZUV4aXN0aW5nUGh5c2ljYWxEZXZpY2UuSXRlbSkge1xuICAgICAgICAgICAgLy8gdXBkYXRlIHRoZSBwaHlzaWNhbCBkZXZpY2Ugb2JqZWN0IGJhc2VkIG9uIHRoZSBwYXNzZWQgaW4gb2JqZWN0XG4gICAgICAgICAgICBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBVcGRhdGVJdGVtQ29tbWFuZCh7XG4gICAgICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5QSFlTSUNBTF9ERVZJQ0VTX1RBQkxFISxcbiAgICAgICAgICAgICAgICBLZXk6IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IHVwZGF0ZURldmljZUlucHV0LmlkXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHRva2VuSWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IHVwZGF0ZURldmljZUlucHV0LnRva2VuSWRcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiI2RzdFwiOiBcImRldmljZVN0YXRlXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiI2xsb2dcIjogXCJsYXN0TG9naW5EYXRlXCJcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCI6ZHN0XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IHVwZGF0ZURldmljZUlucHV0LmRldmljZVN0YXRlXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIFwiOmxsb2dcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogdXBkYXRlRGV2aWNlSW5wdXQubGFzdExvZ2luRGF0ZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBVcGRhdGVFeHByZXNzaW9uOiBcIlNFVCAjZHN0ID0gOmRzdCwgI2xsb2cgPSA6bGxvZ1wiLFxuICAgICAgICAgICAgICAgIFJldHVyblZhbHVlczogXCJVUERBVEVEX05FV1wiXG4gICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgIC8vIHJldHVybiB0aGUgdXBkYXRlZCBwaHlzaWNhbCBkZXZpY2Ugb2JqZWN0XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRhdGE6IHVwZGF0ZURldmljZUlucHV0IGFzIFB1c2hEZXZpY2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmtub3duIHBoeXNpY2FsIGRldmljZSBvYmplY3QgdG8gdXBkYXRlIWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVXNlckRldmljZUVycm9yVHlwZS5Ob25lT3JBYnNlbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgJHtmaWVsZE5hbWV9IG11dGF0aW9uICR7ZXJyfWA7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgIGVycm9yVHlwZTogVXNlckRldmljZUVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==