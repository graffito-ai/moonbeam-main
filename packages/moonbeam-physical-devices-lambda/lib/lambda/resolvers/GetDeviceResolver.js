"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDevice = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * GetDevice resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getDeviceInput device input used for the physical device object to be retrieved
 * @returns {@link Promise} of {@link UserDeviceResponse}
 */
const getDevice = async (fieldName, getDeviceInput) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        // initializing the DynamoDB document client
        const dynamoDbClient = new client_dynamodb_1.DynamoDBClient({ region: region });
        // retrieve the physical device object, given the device by token input object
        const retrievedData = await dynamoDbClient.send(new client_dynamodb_1.GetItemCommand({
            TableName: process.env.PHYSICAL_DEVICES_TABLE,
            Key: {
                id: {
                    S: getDeviceInput.id
                },
                tokenId: {
                    S: getDeviceInput.tokenId
                }
            }
        }));
        // if there is an item retrieved, then return it accordingly
        if (retrievedData && retrievedData.Item) {
            // return the retrieved physical device object
            return {
                data: {
                    id: retrievedData.Item.id.S,
                    tokenId: retrievedData.Item.tokenId.S,
                    deviceState: retrievedData.Item.deviceState.S,
                    lastLoginDate: retrievedData.Item.lastLoginDate.S
                }
            };
        }
        else {
            const errorMessage = `Physical device object not found for ${getDeviceInput.id}, with token ${getDeviceInput.tokenId}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.UserDeviceErrorType.NoneOrAbsent
            };
        }
    }
    catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} query ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: moonbeam_models_1.UserDeviceErrorType.UnexpectedError
        };
    }
};
exports.getDevice = getDevice;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2V0RGV2aWNlUmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL3Jlc29sdmVycy9HZXREZXZpY2VSZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw4REFBd0U7QUFDeEUsK0RBQW1IO0FBRW5IOzs7Ozs7R0FNRztBQUNJLE1BQU0sU0FBUyxHQUFHLEtBQUssRUFBRSxTQUFpQixFQUFFLGNBQThCLEVBQStCLEVBQUU7SUFDOUcsSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2Qyw0Q0FBNEM7UUFDNUMsTUFBTSxjQUFjLEdBQUcsSUFBSSxnQ0FBYyxDQUFDLEVBQUMsTUFBTSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7UUFFNUQsOEVBQThFO1FBQzlFLE1BQU0sYUFBYSxHQUFHLE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLGdDQUFjLENBQUM7WUFDL0QsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsc0JBQXVCO1lBQzlDLEdBQUcsRUFBRTtnQkFDRCxFQUFFLEVBQUU7b0JBQ0EsQ0FBQyxFQUFFLGNBQWMsQ0FBQyxFQUFFO2lCQUN2QjtnQkFDRCxPQUFPLEVBQUU7b0JBQ0wsQ0FBQyxFQUFFLGNBQWMsQ0FBQyxPQUFPO2lCQUM1QjthQUNKO1NBQ0osQ0FBQyxDQUFDLENBQUM7UUFFSiw0REFBNEQ7UUFDNUQsSUFBSSxhQUFhLElBQUksYUFBYSxDQUFDLElBQUksRUFBRTtZQUNyQyw4Q0FBOEM7WUFDOUMsT0FBTztnQkFDSCxJQUFJLEVBQUU7b0JBQ0YsRUFBRSxFQUFFLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUU7b0JBQzVCLE9BQU8sRUFBRSxhQUFhLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFFO29CQUN0QyxXQUFXLEVBQUUsYUFBYSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBcUI7b0JBQ2pFLGFBQWEsRUFBRSxhQUFhLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFFO2lCQUNyRDthQUNKLENBQUE7U0FDSjthQUFNO1lBQ0gsTUFBTSxZQUFZLEdBQUcsd0NBQXdDLGNBQWMsQ0FBQyxFQUFFLGdCQUFnQixjQUFjLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDdkgsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUUxQixPQUFPO2dCQUNILFlBQVksRUFBRSxZQUFZO2dCQUMxQixTQUFTLEVBQUUscUNBQW1CLENBQUMsWUFBWTthQUM5QyxDQUFBO1NBQ0o7S0FFSjtJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1YsTUFBTSxZQUFZLEdBQUcsb0NBQW9DLFNBQVMsVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUNsRixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzFCLE9BQU87WUFDSCxZQUFZLEVBQUUsWUFBWTtZQUMxQixTQUFTLEVBQUUscUNBQW1CLENBQUMsZUFBZTtTQUNqRCxDQUFDO0tBQ0w7QUFDTCxDQUFDLENBQUE7QUFsRFksUUFBQSxTQUFTLGFBa0RyQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RHluYW1vREJDbGllbnQsIEdldEl0ZW1Db21tYW5kfSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LWR5bmFtb2RiXCI7XG5pbXBvcnQge0dldERldmljZUlucHV0LCBVc2VyRGV2aWNlRXJyb3JUeXBlLCBVc2VyRGV2aWNlUmVzcG9uc2UsIFVzZXJEZXZpY2VTdGF0ZX0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcblxuLyoqXG4gKiBHZXREZXZpY2UgcmVzb2x2ZXJcbiAqXG4gKiBAcGFyYW0gZmllbGROYW1lIG5hbWUgb2YgdGhlIHJlc29sdmVyIHBhdGggZnJvbSB0aGUgQXBwU3luYyBldmVudFxuICogQHBhcmFtIGdldERldmljZUlucHV0IGRldmljZSBpbnB1dCB1c2VkIGZvciB0aGUgcGh5c2ljYWwgZGV2aWNlIG9iamVjdCB0byBiZSByZXRyaWV2ZWRcbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgVXNlckRldmljZVJlc3BvbnNlfVxuICovXG5leHBvcnQgY29uc3QgZ2V0RGV2aWNlID0gYXN5bmMgKGZpZWxkTmFtZTogc3RyaW5nLCBnZXREZXZpY2VJbnB1dDogR2V0RGV2aWNlSW5wdXQpOiBQcm9taXNlPFVzZXJEZXZpY2VSZXNwb25zZT4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgIC8vIGluaXRpYWxpemluZyB0aGUgRHluYW1vREIgZG9jdW1lbnQgY2xpZW50XG4gICAgICAgIGNvbnN0IGR5bmFtb0RiQ2xpZW50ID0gbmV3IER5bmFtb0RCQ2xpZW50KHtyZWdpb246IHJlZ2lvbn0pO1xuXG4gICAgICAgIC8vIHJldHJpZXZlIHRoZSBwaHlzaWNhbCBkZXZpY2Ugb2JqZWN0LCBnaXZlbiB0aGUgZGV2aWNlIGJ5IHRva2VuIGlucHV0IG9iamVjdFxuICAgICAgICBjb25zdCByZXRyaWV2ZWREYXRhID0gYXdhaXQgZHluYW1vRGJDbGllbnQuc2VuZChuZXcgR2V0SXRlbUNvbW1hbmQoe1xuICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5QSFlTSUNBTF9ERVZJQ0VTX1RBQkxFISxcbiAgICAgICAgICAgIEtleToge1xuICAgICAgICAgICAgICAgIGlkOiB7XG4gICAgICAgICAgICAgICAgICAgIFM6IGdldERldmljZUlucHV0LmlkXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0b2tlbklkOiB7XG4gICAgICAgICAgICAgICAgICAgIFM6IGdldERldmljZUlucHV0LnRva2VuSWRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKTtcblxuICAgICAgICAvLyBpZiB0aGVyZSBpcyBhbiBpdGVtIHJldHJpZXZlZCwgdGhlbiByZXR1cm4gaXQgYWNjb3JkaW5nbHlcbiAgICAgICAgaWYgKHJldHJpZXZlZERhdGEgJiYgcmV0cmlldmVkRGF0YS5JdGVtKSB7XG4gICAgICAgICAgICAvLyByZXR1cm4gdGhlIHJldHJpZXZlZCBwaHlzaWNhbCBkZXZpY2Ugb2JqZWN0XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6IHJldHJpZXZlZERhdGEuSXRlbS5pZC5TISxcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5JZDogcmV0cmlldmVkRGF0YS5JdGVtLnRva2VuSWQuUyEsXG4gICAgICAgICAgICAgICAgICAgIGRldmljZVN0YXRlOiByZXRyaWV2ZWREYXRhLkl0ZW0uZGV2aWNlU3RhdGUuUyEgYXMgVXNlckRldmljZVN0YXRlLFxuICAgICAgICAgICAgICAgICAgICBsYXN0TG9naW5EYXRlOiByZXRyaWV2ZWREYXRhLkl0ZW0ubGFzdExvZ2luRGF0ZS5TIVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBQaHlzaWNhbCBkZXZpY2Ugb2JqZWN0IG5vdCBmb3VuZCBmb3IgJHtnZXREZXZpY2VJbnB1dC5pZH0sIHdpdGggdG9rZW4gJHtnZXREZXZpY2VJbnB1dC50b2tlbklkfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVXNlckRldmljZUVycm9yVHlwZS5Ob25lT3JBYnNlbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyAke2ZpZWxkTmFtZX0gcXVlcnkgJHtlcnJ9YDtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBVc2VyRGV2aWNlRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICB9O1xuICAgIH1cbn1cbiJdfQ==