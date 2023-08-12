"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDevice = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * CreateDevice resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param createDeviceInput create device input object, used to create a physical device.
 * @returns {@link Promise} of {@link UserDeviceResponse}
 */
const createDevice = async (fieldName, createDeviceInput) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        // initializing the DynamoDB document client
        const dynamoDbClient = new client_dynamodb_1.DynamoDBClient({ region: region });
        // update the timestamps accordingly
        const createdAt = new Date().toISOString();
        createDeviceInput.lastLoginDate = createDeviceInput.lastLoginDate ? createDeviceInput.lastLoginDate : createdAt;
        /**
         * check to see if the same user id/device combination already exists in the DB.
         */
        const preExistingPhysicalDevice = await dynamoDbClient.send(new client_dynamodb_1.GetItemCommand({
            TableName: process.env.PHYSICAL_DEVICES_TABLE,
            Key: {
                id: {
                    S: createDeviceInput.id
                },
                tokenId: {
                    S: createDeviceInput.tokenId
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
        // if there is an item retrieved, then we return an error
        if (preExistingPhysicalDevice && preExistingPhysicalDevice.Item) {
            /**
             * if there is a pre-existing device with the same composite primary key (userId/id, tokenId) combination,
             * then we cannot duplicate that, so we will return an error.
             */
            const errorMessage = `Duplicate physical device found!`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.UserDeviceErrorType.DuplicateObjectFound
            };
        }
        else {
            // store the physical device object
            await dynamoDbClient.send(new client_dynamodb_1.PutItemCommand({
                TableName: process.env.PHYSICAL_DEVICES_TABLE,
                Item: {
                    id: {
                        S: createDeviceInput.id
                    },
                    tokenId: {
                        S: createDeviceInput.tokenId
                    },
                    deviceState: {
                        S: createDeviceInput.deviceState
                    },
                    lastLoginDate: {
                        S: createDeviceInput.lastLoginDate
                    }
                },
            }));
            // return the physical device object
            return {
                data: createDeviceInput
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
exports.createDevice = createDevice;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXRlRGV2aWNlUmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL3Jlc29sdmVycy9DcmVhdGVEZXZpY2VSZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw4REFBd0Y7QUFDeEYsK0RBQWlIO0FBRWpIOzs7Ozs7R0FNRztBQUNJLE1BQU0sWUFBWSxHQUFHLEtBQUssRUFBRSxTQUFpQixFQUFFLGlCQUFvQyxFQUErQixFQUFFO0lBQ3ZILElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsNENBQTRDO1FBQzVDLE1BQU0sY0FBYyxHQUFHLElBQUksZ0NBQWMsQ0FBQyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBRTVELG9DQUFvQztRQUNwQyxNQUFNLFNBQVMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzNDLGlCQUFpQixDQUFDLGFBQWEsR0FBRyxpQkFBaUIsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBRWhIOztXQUVHO1FBQ0gsTUFBTSx5QkFBeUIsR0FBRyxNQUFNLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxnQ0FBYyxDQUFDO1lBQzNFLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUF1QjtZQUM5QyxHQUFHLEVBQUU7Z0JBQ0QsRUFBRSxFQUFFO29CQUNBLENBQUMsRUFBRSxpQkFBaUIsQ0FBQyxFQUFFO2lCQUMxQjtnQkFDRCxPQUFPLEVBQUU7b0JBQ0wsQ0FBQyxFQUFFLGlCQUFpQixDQUFDLE9BQU87aUJBQy9CO2FBQ0o7WUFDRDs7Ozs7ZUFLRztZQUNILG9CQUFvQixFQUFFLFlBQVk7WUFDbEMsd0JBQXdCLEVBQUU7Z0JBQ3RCLE1BQU0sRUFBRSxJQUFJO2dCQUNaLE1BQU0sRUFBRSxTQUFTO2FBQ3BCO1NBQ0osQ0FBQyxDQUFDLENBQUM7UUFFSix5REFBeUQ7UUFDekQsSUFBSSx5QkFBeUIsSUFBSSx5QkFBeUIsQ0FBQyxJQUFJLEVBQUU7WUFDN0Q7OztlQUdHO1lBQ0gsTUFBTSxZQUFZLEdBQUcsa0NBQWtDLENBQUM7WUFDeEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUUxQixPQUFPO2dCQUNILFlBQVksRUFBRSxZQUFZO2dCQUMxQixTQUFTLEVBQUUscUNBQW1CLENBQUMsb0JBQW9CO2FBQ3RELENBQUE7U0FDSjthQUFNO1lBQ0gsbUNBQW1DO1lBQ25DLE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLGdDQUFjLENBQUM7Z0JBQ3pDLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUF1QjtnQkFDOUMsSUFBSSxFQUFFO29CQUNGLEVBQUUsRUFBRTt3QkFDQSxDQUFDLEVBQUUsaUJBQWlCLENBQUMsRUFBRTtxQkFDMUI7b0JBQ0QsT0FBTyxFQUFFO3dCQUNMLENBQUMsRUFBRSxpQkFBaUIsQ0FBQyxPQUFPO3FCQUMvQjtvQkFDRCxXQUFXLEVBQUU7d0JBQ1QsQ0FBQyxFQUFFLGlCQUFpQixDQUFDLFdBQVc7cUJBQ25DO29CQUNELGFBQWEsRUFBRTt3QkFDWCxDQUFDLEVBQUUsaUJBQWlCLENBQUMsYUFBYTtxQkFDckM7aUJBQ0o7YUFDSixDQUFDLENBQUMsQ0FBQztZQUVKLG9DQUFvQztZQUNwQyxPQUFPO2dCQUNILElBQUksRUFBRSxpQkFBK0I7YUFDeEMsQ0FBQTtTQUNKO0tBQ0o7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNWLE1BQU0sWUFBWSxHQUFHLG9DQUFvQyxTQUFTLGFBQWEsR0FBRyxFQUFFLENBQUM7UUFDckYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMxQixPQUFPO1lBQ0gsWUFBWSxFQUFFLFlBQVk7WUFDMUIsU0FBUyxFQUFFLHFDQUFtQixDQUFDLGVBQWU7U0FDakQsQ0FBQTtLQUNKO0FBQ0wsQ0FBQyxDQUFBO0FBcEZZLFFBQUEsWUFBWSxnQkFvRnhCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtEeW5hbW9EQkNsaWVudCwgR2V0SXRlbUNvbW1hbmQsIFB1dEl0ZW1Db21tYW5kfSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LWR5bmFtb2RiXCI7XG5pbXBvcnQge0NyZWF0ZURldmljZUlucHV0LCBVc2VyRGV2aWNlUmVzcG9uc2UsIFB1c2hEZXZpY2UsIFVzZXJEZXZpY2VFcnJvclR5cGV9IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5cbi8qKlxuICogQ3JlYXRlRGV2aWNlIHJlc29sdmVyXG4gKlxuICogQHBhcmFtIGZpZWxkTmFtZSBuYW1lIG9mIHRoZSByZXNvbHZlciBwYXRoIGZyb20gdGhlIEFwcFN5bmMgZXZlbnRcbiAqIEBwYXJhbSBjcmVhdGVEZXZpY2VJbnB1dCBjcmVhdGUgZGV2aWNlIGlucHV0IG9iamVjdCwgdXNlZCB0byBjcmVhdGUgYSBwaHlzaWNhbCBkZXZpY2UuXG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIFVzZXJEZXZpY2VSZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IGNyZWF0ZURldmljZSA9IGFzeW5jIChmaWVsZE5hbWU6IHN0cmluZywgY3JlYXRlRGV2aWNlSW5wdXQ6IENyZWF0ZURldmljZUlucHV0KTogUHJvbWlzZTxVc2VyRGV2aWNlUmVzcG9uc2U+ID0+IHtcbiAgICB0cnkge1xuICAgICAgICAvLyByZXRyaWV2aW5nIHRoZSBjdXJyZW50IGZ1bmN0aW9uIHJlZ2lvblxuICAgICAgICBjb25zdCByZWdpb24gPSBwcm9jZXNzLmVudi5BV1NfUkVHSU9OITtcblxuICAgICAgICAvLyBpbml0aWFsaXppbmcgdGhlIER5bmFtb0RCIGRvY3VtZW50IGNsaWVudFxuICAgICAgICBjb25zdCBkeW5hbW9EYkNsaWVudCA9IG5ldyBEeW5hbW9EQkNsaWVudCh7cmVnaW9uOiByZWdpb259KTtcblxuICAgICAgICAvLyB1cGRhdGUgdGhlIHRpbWVzdGFtcHMgYWNjb3JkaW5nbHlcbiAgICAgICAgY29uc3QgY3JlYXRlZEF0ID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgICAgICBjcmVhdGVEZXZpY2VJbnB1dC5sYXN0TG9naW5EYXRlID0gY3JlYXRlRGV2aWNlSW5wdXQubGFzdExvZ2luRGF0ZSA/IGNyZWF0ZURldmljZUlucHV0Lmxhc3RMb2dpbkRhdGUgOiBjcmVhdGVkQXQ7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIGNoZWNrIHRvIHNlZSBpZiB0aGUgc2FtZSB1c2VyIGlkL2RldmljZSBjb21iaW5hdGlvbiBhbHJlYWR5IGV4aXN0cyBpbiB0aGUgREIuXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBwcmVFeGlzdGluZ1BoeXNpY2FsRGV2aWNlID0gYXdhaXQgZHluYW1vRGJDbGllbnQuc2VuZChuZXcgR2V0SXRlbUNvbW1hbmQoe1xuICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5QSFlTSUNBTF9ERVZJQ0VTX1RBQkxFISxcbiAgICAgICAgICAgIEtleToge1xuICAgICAgICAgICAgICAgIGlkOiB7XG4gICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZURldmljZUlucHV0LmlkXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0b2tlbklkOiB7XG4gICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZURldmljZUlucHV0LnRva2VuSWRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiB3ZSdyZSBub3QgaW50ZXJlc3RlZCBpbiBnZXR0aW5nIGFsbCB0aGUgZGF0YSBmb3IgdGhpcyBjYWxsLCBqdXN0IHRoZSBtaW5pbXVtIGZvciB1cyB0byBkZXRlcm1pbmUgd2hldGhlciB0aGlzIGlzIGEgZHVwbGljYXRlIG9yIG5vdFxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIEBsaW5rIGh0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9hbWF6b25keW5hbW9kYi9sYXRlc3QvZGV2ZWxvcGVyZ3VpZGUvUmVzZXJ2ZWRXb3Jkcy5odG1sXG4gICAgICAgICAgICAgKiBAbGluayBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vYW1hem9uZHluYW1vZGIvbGF0ZXN0L2RldmVsb3Blcmd1aWRlL0V4cHJlc3Npb25zLkV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lcy5odG1sXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIFByb2plY3Rpb25FeHByZXNzaW9uOiAnI2lkZiwgI3RJZCcsXG4gICAgICAgICAgICBFeHByZXNzaW9uQXR0cmlidXRlTmFtZXM6IHtcbiAgICAgICAgICAgICAgICAnI2lkZic6ICdpZCcsXG4gICAgICAgICAgICAgICAgJyN0SWQnOiAndG9rZW5JZCdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuXG4gICAgICAgIC8vIGlmIHRoZXJlIGlzIGFuIGl0ZW0gcmV0cmlldmVkLCB0aGVuIHdlIHJldHVybiBhbiBlcnJvclxuICAgICAgICBpZiAocHJlRXhpc3RpbmdQaHlzaWNhbERldmljZSAmJiBwcmVFeGlzdGluZ1BoeXNpY2FsRGV2aWNlLkl0ZW0pIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogaWYgdGhlcmUgaXMgYSBwcmUtZXhpc3RpbmcgZGV2aWNlIHdpdGggdGhlIHNhbWUgY29tcG9zaXRlIHByaW1hcnkga2V5ICh1c2VySWQvaWQsIHRva2VuSWQpIGNvbWJpbmF0aW9uLFxuICAgICAgICAgICAgICogdGhlbiB3ZSBjYW5ub3QgZHVwbGljYXRlIHRoYXQsIHNvIHdlIHdpbGwgcmV0dXJuIGFuIGVycm9yLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgRHVwbGljYXRlIHBoeXNpY2FsIGRldmljZSBmb3VuZCFgO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFVzZXJEZXZpY2VFcnJvclR5cGUuRHVwbGljYXRlT2JqZWN0Rm91bmRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIHN0b3JlIHRoZSBwaHlzaWNhbCBkZXZpY2Ugb2JqZWN0XG4gICAgICAgICAgICBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBQdXRJdGVtQ29tbWFuZCh7XG4gICAgICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5QSFlTSUNBTF9ERVZJQ0VTX1RBQkxFISxcbiAgICAgICAgICAgICAgICBJdGVtOiB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVEZXZpY2VJbnB1dC5pZFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB0b2tlbklkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVEZXZpY2VJbnB1dC50b2tlbklkXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGRldmljZVN0YXRlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVEZXZpY2VJbnB1dC5kZXZpY2VTdGF0ZVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBsYXN0TG9naW5EYXRlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVEZXZpY2VJbnB1dC5sYXN0TG9naW5EYXRlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICAvLyByZXR1cm4gdGhlIHBoeXNpY2FsIGRldmljZSBvYmplY3RcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZGF0YTogY3JlYXRlRGV2aWNlSW5wdXQgYXMgUHVzaERldmljZVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyAke2ZpZWxkTmFtZX0gbXV0YXRpb24gJHtlcnJ9YDtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBVc2VyRGV2aWNlRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICB9XG4gICAgfVxufVxuIl19