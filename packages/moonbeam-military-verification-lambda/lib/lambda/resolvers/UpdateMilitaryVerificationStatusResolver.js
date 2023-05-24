"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMilitaryVerificationStatus = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * UpdateMilitaryVerificationStatus resolver
 *
 * @param updateMilitaryVerificationInput military verification input, used to update an existent one
 * @returns {@link Promise} of {@link MilitaryVerificationResponse}
 */
const updateMilitaryVerificationStatus = async (updateMilitaryVerificationInput) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        // initializing the DynamoDB document client
        const dynamoDbClient = new client_dynamodb_1.DynamoDBClient({ region: region });
        // update the timestamps accordingly
        const updatedAt = new Date().toISOString();
        updateMilitaryVerificationInput.updatedAt = updateMilitaryVerificationInput.updatedAt ? updateMilitaryVerificationInput.updatedAt : updatedAt;
        // update the military verification object based on the passed in object
        await dynamoDbClient.send(new client_dynamodb_1.UpdateItemCommand({
            TableName: process.env.REFERRAL_TABLE,
            Key: {
                id: {
                    S: updateMilitaryVerificationInput.id
                }
            },
            ExpressionAttributeNames: {
                "#MVS": "militaryVerificationStatus",
                "#UA": "updatedAt"
            },
            ExpressionAttributeValues: {
                ":mvs": {
                    S: updateMilitaryVerificationInput.militaryVerificationStatus
                },
                ":ua": {
                    S: updateMilitaryVerificationInput.updatedAt
                }
            },
            UpdateExpression: "SET #MVS = :mvs, #UA = :ua",
            ReturnValues: "UPDATED_NEW"
        }));
        // return the updated military verification status
        return {
            data: {
                militaryVerificationStatus: updateMilitaryVerificationInput.militaryVerificationStatus
            }
        };
    }
    catch (err) {
        const errorMessage = `Unexpected error while executing createMilitaryVerification mutation ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: moonbeam_models_1.MilitaryVerificationErrorType.UnexpectedError
        };
    }
};
exports.updateMilitaryVerificationStatus = updateMilitaryVerificationStatus;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNSZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL1VwZGF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzUmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsOERBQTJFO0FBQzNFLCtEQUltQztBQUVuQzs7Ozs7R0FLRztBQUNJLE1BQU0sZ0NBQWdDLEdBQUcsS0FBSyxFQUFFLCtCQUFnRSxFQUF5QyxFQUFFO0lBQzlKLElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsNENBQTRDO1FBQzVDLE1BQU0sY0FBYyxHQUFHLElBQUksZ0NBQWMsQ0FBQyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBRTVELG9DQUFvQztRQUNwQyxNQUFNLFNBQVMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzNDLCtCQUErQixDQUFDLFNBQVMsR0FBRywrQkFBK0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLCtCQUErQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBRTlJLHdFQUF3RTtRQUN4RSxNQUFNLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxtQ0FBaUIsQ0FBQztZQUM1QyxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFlO1lBQ3RDLEdBQUcsRUFBRTtnQkFDRCxFQUFFLEVBQUU7b0JBQ0EsQ0FBQyxFQUFFLCtCQUErQixDQUFDLEVBQUU7aUJBQ3hDO2FBQ0o7WUFDRCx3QkFBd0IsRUFBRTtnQkFDdEIsTUFBTSxFQUFFLDRCQUE0QjtnQkFDcEMsS0FBSyxFQUFFLFdBQVc7YUFDckI7WUFDRCx5QkFBeUIsRUFBRTtnQkFDdkIsTUFBTSxFQUFFO29CQUNKLENBQUMsRUFBRSwrQkFBK0IsQ0FBQywwQkFBMEI7aUJBQ2hFO2dCQUNELEtBQUssRUFBRTtvQkFDSCxDQUFDLEVBQUUsK0JBQStCLENBQUMsU0FBUztpQkFDL0M7YUFDSjtZQUNELGdCQUFnQixFQUFFLDRCQUE0QjtZQUM5QyxZQUFZLEVBQUUsYUFBYTtTQUM5QixDQUFDLENBQUMsQ0FBQztRQUVKLGtEQUFrRDtRQUNsRCxPQUFPO1lBQ0gsSUFBSSxFQUFFO2dCQUNGLDBCQUEwQixFQUFFLCtCQUErQixDQUFDLDBCQUEwQjthQUN6RjtTQUNKLENBQUE7S0FDSjtJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1YsTUFBTSxZQUFZLEdBQUcsd0VBQXdFLEdBQUcsRUFBRSxDQUFDO1FBQ25HLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDMUIsT0FBTztZQUNILFlBQVksRUFBRSxZQUFZO1lBQzFCLFNBQVMsRUFBRSwrQ0FBNkIsQ0FBQyxlQUFlO1NBQzNELENBQUE7S0FDSjtBQUNMLENBQUMsQ0FBQTtBQWxEWSxRQUFBLGdDQUFnQyxvQ0FrRDVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtEeW5hbW9EQkNsaWVudCwgVXBkYXRlSXRlbUNvbW1hbmR9IGZyb20gXCJAYXdzLXNkay9jbGllbnQtZHluYW1vZGJcIjtcbmltcG9ydCB7XG4gICAgTWlsaXRhcnlWZXJpZmljYXRpb25FcnJvclR5cGUsXG4gICAgTWlsaXRhcnlWZXJpZmljYXRpb25SZXNwb25zZSxcbiAgICBVcGRhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0LFxufSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuXG4vKipcbiAqIFVwZGF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzIHJlc29sdmVyXG4gKlxuICogQHBhcmFtIHVwZGF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQgbWlsaXRhcnkgdmVyaWZpY2F0aW9uIGlucHV0LCB1c2VkIHRvIHVwZGF0ZSBhbiBleGlzdGVudCBvbmVcbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgTWlsaXRhcnlWZXJpZmljYXRpb25SZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IHVwZGF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzID0gYXN5bmMgKHVwZGF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQ6IFVwZGF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQpOiBQcm9taXNlPE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVzcG9uc2U+ID0+IHtcbiAgICB0cnkge1xuICAgICAgICAvLyByZXRyaWV2aW5nIHRoZSBjdXJyZW50IGZ1bmN0aW9uIHJlZ2lvblxuICAgICAgICBjb25zdCByZWdpb24gPSBwcm9jZXNzLmVudi5BV1NfUkVHSU9OITtcblxuICAgICAgICAvLyBpbml0aWFsaXppbmcgdGhlIER5bmFtb0RCIGRvY3VtZW50IGNsaWVudFxuICAgICAgICBjb25zdCBkeW5hbW9EYkNsaWVudCA9IG5ldyBEeW5hbW9EQkNsaWVudCh7cmVnaW9uOiByZWdpb259KTtcblxuICAgICAgICAvLyB1cGRhdGUgdGhlIHRpbWVzdGFtcHMgYWNjb3JkaW5nbHlcbiAgICAgICAgY29uc3QgdXBkYXRlZEF0ID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgICAgICB1cGRhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0LnVwZGF0ZWRBdCA9IHVwZGF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQudXBkYXRlZEF0ID8gdXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dC51cGRhdGVkQXQgOiB1cGRhdGVkQXQ7XG5cbiAgICAgICAgLy8gdXBkYXRlIHRoZSBtaWxpdGFyeSB2ZXJpZmljYXRpb24gb2JqZWN0IGJhc2VkIG9uIHRoZSBwYXNzZWQgaW4gb2JqZWN0XG4gICAgICAgIGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IFVwZGF0ZUl0ZW1Db21tYW5kKHtcbiAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuUkVGRVJSQUxfVEFCTEUhLFxuICAgICAgICAgICAgS2V5OiB7XG4gICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgUzogdXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dC5pZFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBFeHByZXNzaW9uQXR0cmlidXRlTmFtZXM6IHtcbiAgICAgICAgICAgICAgICBcIiNNVlNcIjogXCJtaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1wiLFxuICAgICAgICAgICAgICAgIFwiI1VBXCI6IFwidXBkYXRlZEF0XCJcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBFeHByZXNzaW9uQXR0cmlidXRlVmFsdWVzOiB7XG4gICAgICAgICAgICAgICAgXCI6bXZzXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgUzogdXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dC5taWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXCI6dWFcIjoge1xuICAgICAgICAgICAgICAgICAgICBTOiB1cGRhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0LnVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBVcGRhdGVFeHByZXNzaW9uOiBcIlNFVCAjTVZTID0gOm12cywgI1VBID0gOnVhXCIsXG4gICAgICAgICAgICBSZXR1cm5WYWx1ZXM6IFwiVVBEQVRFRF9ORVdcIlxuICAgICAgICB9KSk7XG5cbiAgICAgICAgLy8gcmV0dXJuIHRoZSB1cGRhdGVkIG1pbGl0YXJ5IHZlcmlmaWNhdGlvbiBzdGF0dXNcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICBtaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1czogdXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dC5taWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyBjcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbiBtdXRhdGlvbiAke2Vycn1gO1xuICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICBlcnJvclR5cGU6IE1pbGl0YXJ5VmVyaWZpY2F0aW9uRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICB9XG4gICAgfVxufVxuIl19