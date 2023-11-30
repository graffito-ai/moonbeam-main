"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReferral = void 0;
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
/**
 * UpdateReferral resolver
 *
 * @param updateReferralInput the input needed to update an existing referral's data
 * @param fieldName name of the resolver path from the AppSync event
 * @returns {@link Promise} of {@link ReferralResponse}
 */
const updateReferral = async (fieldName, updateReferralInput) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        // initializing the DynamoDB document client
        const dynamoDbClient = new client_dynamodb_1.DynamoDBClient({ region: region });
        // update the timestamps accordingly
        const updatedAt = new Date().toISOString();
        updateReferralInput.updatedAt = updateReferralInput.updatedAt ? updateReferralInput.updatedAt : updatedAt;
        // check to see if there is a referral object to update. If there's none, then return an error accordingly.
        const preExistingReferralObject = await dynamoDbClient.send(new client_dynamodb_1.GetItemCommand({
            TableName: process.env.REFERRAL_TABLE,
            Key: {
                fromId: {
                    S: updateReferralInput.fromId
                },
                timestamp: {
                    N: updateReferralInput.timestamp.toString()
                }
            }
        }));
        // if there is an item retrieved to be updated, then we proceed accordingly. Otherwise, we throw an error.
        if (preExistingReferralObject && preExistingReferralObject.Item) {
            // update the referral object based on the passed in object - for now only containing the status details
            await dynamoDbClient.send(new client_dynamodb_1.UpdateItemCommand({
                TableName: process.env.REFERRAL_TABLE,
                Key: {
                    fromId: {
                        S: updateReferralInput.fromId
                    },
                    timestamp: {
                        N: updateReferralInput.timestamp.toString()
                    }
                },
                ExpressionAttributeNames: {
                    "#stat": "status",
                    "#uat": "updatedAt"
                },
                ExpressionAttributeValues: {
                    ":stat": {
                        S: updateReferralInput.status
                    },
                    ":at": {
                        S: updateReferralInput.updatedAt
                    }
                },
                UpdateExpression: "SET #stat = :stat, #uat = :at",
                ReturnValues: "UPDATED_NEW"
            }));
            // return the updated referral details
            return {
                data: [
                    {
                        fromId: updateReferralInput.fromId,
                        timestamp: updateReferralInput.timestamp,
                        toId: preExistingReferralObject.Item.toId.S,
                        createdAt: preExistingReferralObject.Item.createdAt.S,
                        updatedAt: updateReferralInput.updatedAt,
                        campaignCode: preExistingReferralObject.Item.campaignCode.S,
                        status: updateReferralInput.status
                    }
                ]
            };
        }
        else {
            const errorMessage = `Unknown referral object to update!`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.ReferralErrorType.NoneOrAbsent
            };
        }
    }
    catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} mutation ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: moonbeam_models_1.ReferralErrorType.UnexpectedError
        };
    }
};
exports.updateReferral = updateReferral;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXBkYXRlUmVmZXJyYWxSZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL1VwZGF0ZVJlZmVycmFsUmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsK0RBS21DO0FBQ25DLDhEQUEyRjtBQUUzRjs7Ozs7O0dBTUc7QUFDSSxNQUFNLGNBQWMsR0FBRyxLQUFLLEVBQUUsU0FBaUIsRUFBRSxtQkFBd0MsRUFBNkIsRUFBRTtJQUMzSCxJQUFJO1FBQ0EseUNBQXlDO1FBQ3pDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVyxDQUFDO1FBRXZDLDRDQUE0QztRQUM1QyxNQUFNLGNBQWMsR0FBRyxJQUFJLGdDQUFjLENBQUMsRUFBQyxNQUFNLEVBQUUsTUFBTSxFQUFDLENBQUMsQ0FBQztRQUU1RCxvQ0FBb0M7UUFDcEMsTUFBTSxTQUFTLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUMzQyxtQkFBbUIsQ0FBQyxTQUFTLEdBQUcsbUJBQW1CLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUUxRywyR0FBMkc7UUFDM0csTUFBTSx5QkFBeUIsR0FBRyxNQUFNLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxnQ0FBYyxDQUFDO1lBQzNFLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWU7WUFDdEMsR0FBRyxFQUFFO2dCQUNELE1BQU0sRUFBRTtvQkFDSixDQUFDLEVBQUUsbUJBQW1CLENBQUMsTUFBTTtpQkFDaEM7Z0JBQ0QsU0FBUyxFQUFFO29CQUNQLENBQUMsRUFBRSxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFO2lCQUM5QzthQUNKO1NBQ0osQ0FBQyxDQUFDLENBQUM7UUFFSiwwR0FBMEc7UUFDMUcsSUFBSSx5QkFBeUIsSUFBSSx5QkFBeUIsQ0FBQyxJQUFJLEVBQUU7WUFDN0Qsd0dBQXdHO1lBQ3hHLE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLG1DQUFpQixDQUFDO2dCQUM1QyxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFlO2dCQUN0QyxHQUFHLEVBQUU7b0JBQ0QsTUFBTSxFQUFFO3dCQUNKLENBQUMsRUFBRSxtQkFBbUIsQ0FBQyxNQUFNO3FCQUNoQztvQkFDRCxTQUFTLEVBQUU7d0JBQ1AsQ0FBQyxFQUFFLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUU7cUJBQzlDO2lCQUNKO2dCQUNELHdCQUF3QixFQUFFO29CQUN0QixPQUFPLEVBQUUsUUFBUTtvQkFDakIsTUFBTSxFQUFFLFdBQVc7aUJBQ3RCO2dCQUNELHlCQUF5QixFQUFFO29CQUN2QixPQUFPLEVBQUU7d0JBQ0wsQ0FBQyxFQUFFLG1CQUFtQixDQUFDLE1BQU07cUJBQ2hDO29CQUNELEtBQUssRUFBRTt3QkFDSCxDQUFDLEVBQUUsbUJBQW1CLENBQUMsU0FBUztxQkFDbkM7aUJBQ0o7Z0JBQ0QsZ0JBQWdCLEVBQUUsK0JBQStCO2dCQUNqRCxZQUFZLEVBQUUsYUFBYTthQUM5QixDQUFDLENBQUMsQ0FBQztZQUVKLHNDQUFzQztZQUN0QyxPQUFPO2dCQUNILElBQUksRUFBRTtvQkFDRjt3QkFDSSxNQUFNLEVBQUUsbUJBQW1CLENBQUMsTUFBTTt3QkFDbEMsU0FBUyxFQUFFLG1CQUFtQixDQUFDLFNBQVM7d0JBQ3hDLElBQUksRUFBRSx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUU7d0JBQzVDLFNBQVMsRUFBRSx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUU7d0JBQ3RELFNBQVMsRUFBRSxtQkFBbUIsQ0FBQyxTQUFTO3dCQUN4QyxZQUFZLEVBQUUseUJBQXlCLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUEyQjt3QkFDckYsTUFBTSxFQUFFLG1CQUFtQixDQUFDLE1BQU07cUJBQ3JDO2lCQUNKO2FBQ0osQ0FBQTtTQUNKO2FBQU07WUFDSCxNQUFNLFlBQVksR0FBRyxvQ0FBb0MsQ0FBQztZQUMxRCxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRTFCLE9BQU87Z0JBQ0gsWUFBWSxFQUFFLFlBQVk7Z0JBQzFCLFNBQVMsRUFBRSxtQ0FBaUIsQ0FBQyxZQUFZO2FBQzVDLENBQUE7U0FDSjtLQUNKO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDVixNQUFNLFlBQVksR0FBRyxvQ0FBb0MsU0FBUyxhQUFhLEdBQUcsRUFBRSxDQUFDO1FBQ3JGLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDMUIsT0FBTztZQUNILFlBQVksRUFBRSxZQUFZO1lBQzFCLFNBQVMsRUFBRSxtQ0FBaUIsQ0FBQyxlQUFlO1NBQy9DLENBQUE7S0FDSjtBQUNMLENBQUMsQ0FBQTtBQXJGWSxRQUFBLGNBQWMsa0JBcUYxQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gICAgTWFya2V0aW5nQ2FtcGFpZ25Db2RlLFxuICAgIFJlZmVycmFsRXJyb3JUeXBlLFxuICAgIFJlZmVycmFsUmVzcG9uc2UsXG4gICAgVXBkYXRlUmVmZXJyYWxJbnB1dFxufSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuaW1wb3J0IHtEeW5hbW9EQkNsaWVudCwgR2V0SXRlbUNvbW1hbmQsIFVwZGF0ZUl0ZW1Db21tYW5kfSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LWR5bmFtb2RiXCI7XG5cbi8qKlxuICogVXBkYXRlUmVmZXJyYWwgcmVzb2x2ZXJcbiAqXG4gKiBAcGFyYW0gdXBkYXRlUmVmZXJyYWxJbnB1dCB0aGUgaW5wdXQgbmVlZGVkIHRvIHVwZGF0ZSBhbiBleGlzdGluZyByZWZlcnJhbCdzIGRhdGFcbiAqIEBwYXJhbSBmaWVsZE5hbWUgbmFtZSBvZiB0aGUgcmVzb2x2ZXIgcGF0aCBmcm9tIHRoZSBBcHBTeW5jIGV2ZW50XG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIFJlZmVycmFsUmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCB1cGRhdGVSZWZlcnJhbCA9IGFzeW5jIChmaWVsZE5hbWU6IHN0cmluZywgdXBkYXRlUmVmZXJyYWxJbnB1dDogVXBkYXRlUmVmZXJyYWxJbnB1dCk6IFByb21pc2U8UmVmZXJyYWxSZXNwb25zZT4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgIC8vIGluaXRpYWxpemluZyB0aGUgRHluYW1vREIgZG9jdW1lbnQgY2xpZW50XG4gICAgICAgIGNvbnN0IGR5bmFtb0RiQ2xpZW50ID0gbmV3IER5bmFtb0RCQ2xpZW50KHtyZWdpb246IHJlZ2lvbn0pO1xuXG4gICAgICAgIC8vIHVwZGF0ZSB0aGUgdGltZXN0YW1wcyBhY2NvcmRpbmdseVxuICAgICAgICBjb25zdCB1cGRhdGVkQXQgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgICAgIHVwZGF0ZVJlZmVycmFsSW5wdXQudXBkYXRlZEF0ID0gdXBkYXRlUmVmZXJyYWxJbnB1dC51cGRhdGVkQXQgPyB1cGRhdGVSZWZlcnJhbElucHV0LnVwZGF0ZWRBdCA6IHVwZGF0ZWRBdDtcblxuICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlcmUgaXMgYSByZWZlcnJhbCBvYmplY3QgdG8gdXBkYXRlLiBJZiB0aGVyZSdzIG5vbmUsIHRoZW4gcmV0dXJuIGFuIGVycm9yIGFjY29yZGluZ2x5LlxuICAgICAgICBjb25zdCBwcmVFeGlzdGluZ1JlZmVycmFsT2JqZWN0ID0gYXdhaXQgZHluYW1vRGJDbGllbnQuc2VuZChuZXcgR2V0SXRlbUNvbW1hbmQoe1xuICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5SRUZFUlJBTF9UQUJMRSEsXG4gICAgICAgICAgICBLZXk6IHtcbiAgICAgICAgICAgICAgICBmcm9tSWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgUzogdXBkYXRlUmVmZXJyYWxJbnB1dC5mcm9tSWRcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRpbWVzdGFtcDoge1xuICAgICAgICAgICAgICAgICAgICBOOiB1cGRhdGVSZWZlcnJhbElucHV0LnRpbWVzdGFtcC50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG5cbiAgICAgICAgLy8gaWYgdGhlcmUgaXMgYW4gaXRlbSByZXRyaWV2ZWQgdG8gYmUgdXBkYXRlZCwgdGhlbiB3ZSBwcm9jZWVkIGFjY29yZGluZ2x5LiBPdGhlcndpc2UsIHdlIHRocm93IGFuIGVycm9yLlxuICAgICAgICBpZiAocHJlRXhpc3RpbmdSZWZlcnJhbE9iamVjdCAmJiBwcmVFeGlzdGluZ1JlZmVycmFsT2JqZWN0Lkl0ZW0pIHtcbiAgICAgICAgICAgIC8vIHVwZGF0ZSB0aGUgcmVmZXJyYWwgb2JqZWN0IGJhc2VkIG9uIHRoZSBwYXNzZWQgaW4gb2JqZWN0IC0gZm9yIG5vdyBvbmx5IGNvbnRhaW5pbmcgdGhlIHN0YXR1cyBkZXRhaWxzXG4gICAgICAgICAgICBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBVcGRhdGVJdGVtQ29tbWFuZCh7XG4gICAgICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5SRUZFUlJBTF9UQUJMRSEsXG4gICAgICAgICAgICAgICAgS2V5OiB7XG4gICAgICAgICAgICAgICAgICAgIGZyb21JZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogdXBkYXRlUmVmZXJyYWxJbnB1dC5mcm9tSWRcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBOOiB1cGRhdGVSZWZlcnJhbElucHV0LnRpbWVzdGFtcC50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lczoge1xuICAgICAgICAgICAgICAgICAgICBcIiNzdGF0XCI6IFwic3RhdHVzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiI3VhdFwiOiBcInVwZGF0ZWRBdFwiXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBFeHByZXNzaW9uQXR0cmlidXRlVmFsdWVzOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiOnN0YXRcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogdXBkYXRlUmVmZXJyYWxJbnB1dC5zdGF0dXNcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgXCI6YXRcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogdXBkYXRlUmVmZXJyYWxJbnB1dC51cGRhdGVkQXRcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgVXBkYXRlRXhwcmVzc2lvbjogXCJTRVQgI3N0YXQgPSA6c3RhdCwgI3VhdCA9IDphdFwiLFxuICAgICAgICAgICAgICAgIFJldHVyblZhbHVlczogXCJVUERBVEVEX05FV1wiXG4gICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgIC8vIHJldHVybiB0aGUgdXBkYXRlZCByZWZlcnJhbCBkZXRhaWxzXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRhdGE6IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgZnJvbUlkOiB1cGRhdGVSZWZlcnJhbElucHV0LmZyb21JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogdXBkYXRlUmVmZXJyYWxJbnB1dC50aW1lc3RhbXAsXG4gICAgICAgICAgICAgICAgICAgICAgICB0b0lkOiBwcmVFeGlzdGluZ1JlZmVycmFsT2JqZWN0Lkl0ZW0udG9JZC5TISxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDogcHJlRXhpc3RpbmdSZWZlcnJhbE9iamVjdC5JdGVtLmNyZWF0ZWRBdC5TISxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRBdDogdXBkYXRlUmVmZXJyYWxJbnB1dC51cGRhdGVkQXQsXG4gICAgICAgICAgICAgICAgICAgICAgICBjYW1wYWlnbkNvZGU6IHByZUV4aXN0aW5nUmVmZXJyYWxPYmplY3QuSXRlbS5jYW1wYWlnbkNvZGUuUyEgYXMgTWFya2V0aW5nQ2FtcGFpZ25Db2RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiB1cGRhdGVSZWZlcnJhbElucHV0LnN0YXR1c1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVua25vd24gcmVmZXJyYWwgb2JqZWN0IHRvIHVwZGF0ZSFgO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFJlZmVycmFsRXJyb3JUeXBlLk5vbmVPckFic2VudFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyAke2ZpZWxkTmFtZX0gbXV0YXRpb24gJHtlcnJ9YDtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBSZWZlcnJhbEVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==