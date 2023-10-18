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
            ProjectionExpression: '#idf, #tId, #dSt',
            ExpressionAttributeNames: {
                '#idf': 'id',
                '#tId': 'tokenId',
                '#dSt': 'deviceState'
            }
        }));
        // if there is an item retrieved, then we return an error
        if (preExistingPhysicalDevice && preExistingPhysicalDevice.Item) {
            /**
             * if there is a pre-existing device with the same composite primary key (userId/id, tokenId) combination,
             * then we check if that device is active. If so, then cannot duplicate that, so we will return an error.
             * Otherwise, we will update that device's state to active accordingly, so that we can 'revive' an old
             * device.
             */
            if (preExistingPhysicalDevice.Item.deviceState.S === moonbeam_models_1.UserDeviceState.Inactive) {
                console.log(`Reviving old device ${createDeviceInput.tokenId} for account id ${createDeviceInput.id}`);
                // update the physical device object based on the passed in object
                await dynamoDbClient.send(new client_dynamodb_1.UpdateItemCommand({
                    TableName: process.env.PHYSICAL_DEVICES_TABLE,
                    Key: {
                        id: {
                            S: createDeviceInput.id
                        },
                        tokenId: {
                            S: createDeviceInput.tokenId
                        }
                    },
                    ExpressionAttributeNames: {
                        "#dst": "deviceState",
                        "#llog": "lastLoginDate"
                    },
                    ExpressionAttributeValues: {
                        ":dst": {
                            S: createDeviceInput.deviceState
                        },
                        ":llog": {
                            S: createDeviceInput.lastLoginDate
                        }
                    },
                    UpdateExpression: "SET #dst = :dst, #llog = :llog",
                    ReturnValues: "UPDATED_NEW"
                }));
                // return the updated physical device object
                return {
                    data: createDeviceInput
                };
            }
            else {
                const errorMessage = `Duplicate physical device found!`;
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: moonbeam_models_1.UserDeviceErrorType.DuplicateObjectFound
                };
            }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXRlRGV2aWNlUmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL3Jlc29sdmVycy9DcmVhdGVEZXZpY2VSZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw4REFBMkc7QUFDM0csK0RBTW1DO0FBRW5DOzs7Ozs7R0FNRztBQUNJLE1BQU0sWUFBWSxHQUFHLEtBQUssRUFBRSxTQUFpQixFQUFFLGlCQUFvQyxFQUErQixFQUFFO0lBQ3ZILElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsNENBQTRDO1FBQzVDLE1BQU0sY0FBYyxHQUFHLElBQUksZ0NBQWMsQ0FBQyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBRTVELG9DQUFvQztRQUNwQyxNQUFNLFNBQVMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzNDLGlCQUFpQixDQUFDLGFBQWEsR0FBRyxpQkFBaUIsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBRWhIOztXQUVHO1FBQ0gsTUFBTSx5QkFBeUIsR0FBRyxNQUFNLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxnQ0FBYyxDQUFDO1lBQzNFLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUF1QjtZQUM5QyxHQUFHLEVBQUU7Z0JBQ0QsRUFBRSxFQUFFO29CQUNBLENBQUMsRUFBRSxpQkFBaUIsQ0FBQyxFQUFFO2lCQUMxQjtnQkFDRCxPQUFPLEVBQUU7b0JBQ0wsQ0FBQyxFQUFFLGlCQUFpQixDQUFDLE9BQU87aUJBQy9CO2FBQ0o7WUFDRDs7Ozs7ZUFLRztZQUNILG9CQUFvQixFQUFFLGtCQUFrQjtZQUN4Qyx3QkFBd0IsRUFBRTtnQkFDdEIsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFNBQVM7Z0JBQ2pCLE1BQU0sRUFBRSxhQUFhO2FBQ3hCO1NBQ0osQ0FBQyxDQUFDLENBQUM7UUFFSix5REFBeUQ7UUFDekQsSUFBSSx5QkFBeUIsSUFBSSx5QkFBeUIsQ0FBQyxJQUFJLEVBQUU7WUFDN0Q7Ozs7O2VBS0c7WUFDSCxJQUFJLHlCQUF5QixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBRSxLQUFLLGlDQUFlLENBQUMsUUFBUSxFQUFFO2dCQUM1RSxPQUFPLENBQUMsR0FBRyxDQUFDLHVCQUF1QixpQkFBaUIsQ0FBQyxPQUFPLG1CQUFtQixpQkFBaUIsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUV2RyxrRUFBa0U7Z0JBQ2xFLE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLG1DQUFpQixDQUFDO29CQUM1QyxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBdUI7b0JBQzlDLEdBQUcsRUFBRTt3QkFDRCxFQUFFLEVBQUU7NEJBQ0EsQ0FBQyxFQUFFLGlCQUFpQixDQUFDLEVBQUU7eUJBQzFCO3dCQUNELE9BQU8sRUFBRTs0QkFDTCxDQUFDLEVBQUUsaUJBQWlCLENBQUMsT0FBTzt5QkFDL0I7cUJBQ0o7b0JBQ0Qsd0JBQXdCLEVBQUU7d0JBQ3RCLE1BQU0sRUFBRSxhQUFhO3dCQUNyQixPQUFPLEVBQUUsZUFBZTtxQkFDM0I7b0JBQ0QseUJBQXlCLEVBQUU7d0JBQ3ZCLE1BQU0sRUFBRTs0QkFDSixDQUFDLEVBQUUsaUJBQWlCLENBQUMsV0FBVzt5QkFDbkM7d0JBQ0QsT0FBTyxFQUFFOzRCQUNMLENBQUMsRUFBRSxpQkFBaUIsQ0FBQyxhQUFhO3lCQUNyQztxQkFDSjtvQkFDRCxnQkFBZ0IsRUFBRSxnQ0FBZ0M7b0JBQ2xELFlBQVksRUFBRSxhQUFhO2lCQUM5QixDQUFDLENBQUMsQ0FBQztnQkFFSiw0Q0FBNEM7Z0JBQzVDLE9BQU87b0JBQ0gsSUFBSSxFQUFFLGlCQUErQjtpQkFDeEMsQ0FBQTthQUNKO2lCQUFNO2dCQUNILE1BQU0sWUFBWSxHQUFHLGtDQUFrQyxDQUFDO2dCQUN4RCxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUUxQixPQUFPO29CQUNILFlBQVksRUFBRSxZQUFZO29CQUMxQixTQUFTLEVBQUUscUNBQW1CLENBQUMsb0JBQW9CO2lCQUN0RCxDQUFBO2FBQ0o7U0FDSjthQUFNO1lBQ0gsbUNBQW1DO1lBQ25DLE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLGdDQUFjLENBQUM7Z0JBQ3pDLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUF1QjtnQkFDOUMsSUFBSSxFQUFFO29CQUNGLEVBQUUsRUFBRTt3QkFDQSxDQUFDLEVBQUUsaUJBQWlCLENBQUMsRUFBRTtxQkFDMUI7b0JBQ0QsT0FBTyxFQUFFO3dCQUNMLENBQUMsRUFBRSxpQkFBaUIsQ0FBQyxPQUFPO3FCQUMvQjtvQkFDRCxXQUFXLEVBQUU7d0JBQ1QsQ0FBQyxFQUFFLGlCQUFpQixDQUFDLFdBQVc7cUJBQ25DO29CQUNELGFBQWEsRUFBRTt3QkFDWCxDQUFDLEVBQUUsaUJBQWlCLENBQUMsYUFBYTtxQkFDckM7aUJBQ0o7YUFDSixDQUFDLENBQUMsQ0FBQztZQUVKLG9DQUFvQztZQUNwQyxPQUFPO2dCQUNILElBQUksRUFBRSxpQkFBK0I7YUFDeEMsQ0FBQTtTQUNKO0tBQ0o7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNWLE1BQU0sWUFBWSxHQUFHLG9DQUFvQyxTQUFTLGFBQWEsR0FBRyxFQUFFLENBQUM7UUFDckYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMxQixPQUFPO1lBQ0gsWUFBWSxFQUFFLFlBQVk7WUFDMUIsU0FBUyxFQUFFLHFDQUFtQixDQUFDLGVBQWU7U0FDakQsQ0FBQTtLQUNKO0FBQ0wsQ0FBQyxDQUFBO0FBM0hZLFFBQUEsWUFBWSxnQkEySHhCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtEeW5hbW9EQkNsaWVudCwgR2V0SXRlbUNvbW1hbmQsIFB1dEl0ZW1Db21tYW5kLCBVcGRhdGVJdGVtQ29tbWFuZH0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1keW5hbW9kYlwiO1xuaW1wb3J0IHtcbiAgICBDcmVhdGVEZXZpY2VJbnB1dCxcbiAgICBVc2VyRGV2aWNlUmVzcG9uc2UsXG4gICAgUHVzaERldmljZSxcbiAgICBVc2VyRGV2aWNlRXJyb3JUeXBlLFxuICAgIFVzZXJEZXZpY2VTdGF0ZVxufSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuXG4vKipcbiAqIENyZWF0ZURldmljZSByZXNvbHZlclxuICpcbiAqIEBwYXJhbSBmaWVsZE5hbWUgbmFtZSBvZiB0aGUgcmVzb2x2ZXIgcGF0aCBmcm9tIHRoZSBBcHBTeW5jIGV2ZW50XG4gKiBAcGFyYW0gY3JlYXRlRGV2aWNlSW5wdXQgY3JlYXRlIGRldmljZSBpbnB1dCBvYmplY3QsIHVzZWQgdG8gY3JlYXRlIGEgcGh5c2ljYWwgZGV2aWNlLlxuICogQHJldHVybnMge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBVc2VyRGV2aWNlUmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCBjcmVhdGVEZXZpY2UgPSBhc3luYyAoZmllbGROYW1lOiBzdHJpbmcsIGNyZWF0ZURldmljZUlucHV0OiBDcmVhdGVEZXZpY2VJbnB1dCk6IFByb21pc2U8VXNlckRldmljZVJlc3BvbnNlPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gcmV0cmlldmluZyB0aGUgY3VycmVudCBmdW5jdGlvbiByZWdpb25cbiAgICAgICAgY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiE7XG5cbiAgICAgICAgLy8gaW5pdGlhbGl6aW5nIHRoZSBEeW5hbW9EQiBkb2N1bWVudCBjbGllbnRcbiAgICAgICAgY29uc3QgZHluYW1vRGJDbGllbnQgPSBuZXcgRHluYW1vREJDbGllbnQoe3JlZ2lvbjogcmVnaW9ufSk7XG5cbiAgICAgICAgLy8gdXBkYXRlIHRoZSB0aW1lc3RhbXBzIGFjY29yZGluZ2x5XG4gICAgICAgIGNvbnN0IGNyZWF0ZWRBdCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICAgICAgY3JlYXRlRGV2aWNlSW5wdXQubGFzdExvZ2luRGF0ZSA9IGNyZWF0ZURldmljZUlucHV0Lmxhc3RMb2dpbkRhdGUgPyBjcmVhdGVEZXZpY2VJbnB1dC5sYXN0TG9naW5EYXRlIDogY3JlYXRlZEF0O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBjaGVjayB0byBzZWUgaWYgdGhlIHNhbWUgdXNlciBpZC9kZXZpY2UgY29tYmluYXRpb24gYWxyZWFkeSBleGlzdHMgaW4gdGhlIERCLlxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3QgcHJlRXhpc3RpbmdQaHlzaWNhbERldmljZSA9IGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IEdldEl0ZW1Db21tYW5kKHtcbiAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuUEhZU0lDQUxfREVWSUNFU19UQUJMRSEsXG4gICAgICAgICAgICBLZXk6IHtcbiAgICAgICAgICAgICAgICBpZDoge1xuICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVEZXZpY2VJbnB1dC5pZFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdG9rZW5JZDoge1xuICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVEZXZpY2VJbnB1dC50b2tlbklkXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogd2UncmUgbm90IGludGVyZXN0ZWQgaW4gZ2V0dGluZyBhbGwgdGhlIGRhdGEgZm9yIHRoaXMgY2FsbCwganVzdCB0aGUgbWluaW11bSBmb3IgdXMgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdGhpcyBpcyBhIGR1cGxpY2F0ZSBvciBub3RcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBAbGluayBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vYW1hem9uZHluYW1vZGIvbGF0ZXN0L2RldmVsb3Blcmd1aWRlL1Jlc2VydmVkV29yZHMuaHRtbFxuICAgICAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2FtYXpvbmR5bmFtb2RiL2xhdGVzdC9kZXZlbG9wZXJndWlkZS9FeHByZXNzaW9ucy5FeHByZXNzaW9uQXR0cmlidXRlTmFtZXMuaHRtbFxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBQcm9qZWN0aW9uRXhwcmVzc2lvbjogJyNpZGYsICN0SWQsICNkU3QnLFxuICAgICAgICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzOiB7XG4gICAgICAgICAgICAgICAgJyNpZGYnOiAnaWQnLFxuICAgICAgICAgICAgICAgICcjdElkJzogJ3Rva2VuSWQnLFxuICAgICAgICAgICAgICAgICcjZFN0JzogJ2RldmljZVN0YXRlJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG5cbiAgICAgICAgLy8gaWYgdGhlcmUgaXMgYW4gaXRlbSByZXRyaWV2ZWQsIHRoZW4gd2UgcmV0dXJuIGFuIGVycm9yXG4gICAgICAgIGlmIChwcmVFeGlzdGluZ1BoeXNpY2FsRGV2aWNlICYmIHByZUV4aXN0aW5nUGh5c2ljYWxEZXZpY2UuSXRlbSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBpZiB0aGVyZSBpcyBhIHByZS1leGlzdGluZyBkZXZpY2Ugd2l0aCB0aGUgc2FtZSBjb21wb3NpdGUgcHJpbWFyeSBrZXkgKHVzZXJJZC9pZCwgdG9rZW5JZCkgY29tYmluYXRpb24sXG4gICAgICAgICAgICAgKiB0aGVuIHdlIGNoZWNrIGlmIHRoYXQgZGV2aWNlIGlzIGFjdGl2ZS4gSWYgc28sIHRoZW4gY2Fubm90IGR1cGxpY2F0ZSB0aGF0LCBzbyB3ZSB3aWxsIHJldHVybiBhbiBlcnJvci5cbiAgICAgICAgICAgICAqIE90aGVyd2lzZSwgd2Ugd2lsbCB1cGRhdGUgdGhhdCBkZXZpY2UncyBzdGF0ZSB0byBhY3RpdmUgYWNjb3JkaW5nbHksIHNvIHRoYXQgd2UgY2FuICdyZXZpdmUnIGFuIG9sZFxuICAgICAgICAgICAgICogZGV2aWNlLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBpZiAocHJlRXhpc3RpbmdQaHlzaWNhbERldmljZS5JdGVtLmRldmljZVN0YXRlLlMhID09PSBVc2VyRGV2aWNlU3RhdGUuSW5hY3RpdmUpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgUmV2aXZpbmcgb2xkIGRldmljZSAke2NyZWF0ZURldmljZUlucHV0LnRva2VuSWR9IGZvciBhY2NvdW50IGlkICR7Y3JlYXRlRGV2aWNlSW5wdXQuaWR9YCk7XG5cbiAgICAgICAgICAgICAgICAvLyB1cGRhdGUgdGhlIHBoeXNpY2FsIGRldmljZSBvYmplY3QgYmFzZWQgb24gdGhlIHBhc3NlZCBpbiBvYmplY3RcbiAgICAgICAgICAgICAgICBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBVcGRhdGVJdGVtQ29tbWFuZCh7XG4gICAgICAgICAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuUEhZU0lDQUxfREVWSUNFU19UQUJMRSEsXG4gICAgICAgICAgICAgICAgICAgIEtleToge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVEZXZpY2VJbnB1dC5pZFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRva2VuSWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVEZXZpY2VJbnB1dC50b2tlbklkXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCIjZHN0XCI6IFwiZGV2aWNlU3RhdGVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiI2xsb2dcIjogXCJsYXN0TG9naW5EYXRlXCJcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCI6ZHN0XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVEZXZpY2VJbnB1dC5kZXZpY2VTdGF0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiOmxsb2dcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZURldmljZUlucHV0Lmxhc3RMb2dpbkRhdGVcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgVXBkYXRlRXhwcmVzc2lvbjogXCJTRVQgI2RzdCA9IDpkc3QsICNsbG9nID0gOmxsb2dcIixcbiAgICAgICAgICAgICAgICAgICAgUmV0dXJuVmFsdWVzOiBcIlVQREFURURfTkVXXCJcbiAgICAgICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIHVwZGF0ZWQgcGh5c2ljYWwgZGV2aWNlIG9iamVjdFxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IGNyZWF0ZURldmljZUlucHV0IGFzIFB1c2hEZXZpY2VcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBEdXBsaWNhdGUgcGh5c2ljYWwgZGV2aWNlIGZvdW5kIWA7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFVzZXJEZXZpY2VFcnJvclR5cGUuRHVwbGljYXRlT2JqZWN0Rm91bmRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBzdG9yZSB0aGUgcGh5c2ljYWwgZGV2aWNlIG9iamVjdFxuICAgICAgICAgICAgYXdhaXQgZHluYW1vRGJDbGllbnQuc2VuZChuZXcgUHV0SXRlbUNvbW1hbmQoe1xuICAgICAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuUEhZU0lDQUxfREVWSUNFU19UQUJMRSEsXG4gICAgICAgICAgICAgICAgSXRlbToge1xuICAgICAgICAgICAgICAgICAgICBpZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlRGV2aWNlSW5wdXQuaWRcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5JZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlRGV2aWNlSW5wdXQudG9rZW5JZFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBkZXZpY2VTdGF0ZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlRGV2aWNlSW5wdXQuZGV2aWNlU3RhdGVcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgbGFzdExvZ2luRGF0ZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlRGV2aWNlSW5wdXQubGFzdExvZ2luRGF0ZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBwaHlzaWNhbCBkZXZpY2Ugb2JqZWN0XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRhdGE6IGNyZWF0ZURldmljZUlucHV0IGFzIFB1c2hEZXZpY2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgJHtmaWVsZE5hbWV9IG11dGF0aW9uICR7ZXJyfWA7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgIGVycm9yVHlwZTogVXNlckRldmljZUVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==