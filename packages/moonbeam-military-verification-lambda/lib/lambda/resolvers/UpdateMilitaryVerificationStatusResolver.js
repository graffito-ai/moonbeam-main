"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMilitaryVerificationStatus = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * UpdateMilitaryVerificationStatus resolver
 *
 * @param updateMilitaryVerificationInput military verification input, used to update an existent one
 * @returns {@link Promise} of {@link UpdateMilitaryVerificationResponse}
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
            TableName: process.env.MILITARY_VERIFICATION_TABLE,
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
            id: updateMilitaryVerificationInput.id,
            militaryVerificationStatus: updateMilitaryVerificationInput.militaryVerificationStatus
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNSZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL1VwZGF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzUmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsOERBQTJFO0FBQzNFLCtEQUltQztBQUVuQzs7Ozs7R0FLRztBQUNJLE1BQU0sZ0NBQWdDLEdBQUcsS0FBSyxFQUFFLCtCQUFnRSxFQUErQyxFQUFFO0lBQ3BLLElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsNENBQTRDO1FBQzVDLE1BQU0sY0FBYyxHQUFHLElBQUksZ0NBQWMsQ0FBQyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBRTVELG9DQUFvQztRQUNwQyxNQUFNLFNBQVMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzNDLCtCQUErQixDQUFDLFNBQVMsR0FBRywrQkFBK0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLCtCQUErQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBRTlJLHdFQUF3RTtRQUN4RSxNQUFNLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxtQ0FBaUIsQ0FBQztZQUM1QyxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQywyQkFBNEI7WUFDbkQsR0FBRyxFQUFFO2dCQUNELEVBQUUsRUFBRTtvQkFDQSxDQUFDLEVBQUUsK0JBQStCLENBQUMsRUFBRTtpQkFDeEM7YUFDSjtZQUNELHdCQUF3QixFQUFFO2dCQUN0QixNQUFNLEVBQUUsNEJBQTRCO2dCQUNwQyxLQUFLLEVBQUUsV0FBVzthQUNyQjtZQUNELHlCQUF5QixFQUFFO2dCQUN2QixNQUFNLEVBQUU7b0JBQ0osQ0FBQyxFQUFFLCtCQUErQixDQUFDLDBCQUEwQjtpQkFDaEU7Z0JBQ0QsS0FBSyxFQUFFO29CQUNILENBQUMsRUFBRSwrQkFBK0IsQ0FBQyxTQUFTO2lCQUMvQzthQUNKO1lBQ0QsZ0JBQWdCLEVBQUUsNEJBQTRCO1lBQzlDLFlBQVksRUFBRSxhQUFhO1NBQzlCLENBQUMsQ0FBQyxDQUFDO1FBRUosa0RBQWtEO1FBQ2xELE9BQU87WUFDSCxFQUFFLEVBQUUsK0JBQStCLENBQUMsRUFBRTtZQUN0QywwQkFBMEIsRUFBRSwrQkFBK0IsQ0FBQywwQkFBMEI7U0FDekYsQ0FBQTtLQUNKO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDVixNQUFNLFlBQVksR0FBRyx3RUFBd0UsR0FBRyxFQUFFLENBQUM7UUFDbkcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMxQixPQUFPO1lBQ0gsWUFBWSxFQUFFLFlBQVk7WUFDMUIsU0FBUyxFQUFFLCtDQUE2QixDQUFDLGVBQWU7U0FDM0QsQ0FBQTtLQUNKO0FBQ0wsQ0FBQyxDQUFBO0FBakRZLFFBQUEsZ0NBQWdDLG9DQWlENUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0R5bmFtb0RCQ2xpZW50LCBVcGRhdGVJdGVtQ29tbWFuZH0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1keW5hbW9kYlwiO1xuaW1wb3J0IHtcbiAgICBNaWxpdGFyeVZlcmlmaWNhdGlvbkVycm9yVHlwZSxcbiAgICBVcGRhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0LFxuICAgIFVwZGF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVzcG9uc2UsXG59IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5cbi8qKlxuICogVXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXMgcmVzb2x2ZXJcbiAqXG4gKiBAcGFyYW0gdXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dCBtaWxpdGFyeSB2ZXJpZmljYXRpb24gaW5wdXQsIHVzZWQgdG8gdXBkYXRlIGFuIGV4aXN0ZW50IG9uZVxuICogQHJldHVybnMge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBVcGRhdGVNaWxpdGFyeVZlcmlmaWNhdGlvblJlc3BvbnNlfVxuICovXG5leHBvcnQgY29uc3QgdXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXMgPSBhc3luYyAodXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dDogVXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dCk6IFByb21pc2U8VXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25SZXNwb25zZT4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgIC8vIGluaXRpYWxpemluZyB0aGUgRHluYW1vREIgZG9jdW1lbnQgY2xpZW50XG4gICAgICAgIGNvbnN0IGR5bmFtb0RiQ2xpZW50ID0gbmV3IER5bmFtb0RCQ2xpZW50KHtyZWdpb246IHJlZ2lvbn0pO1xuXG4gICAgICAgIC8vIHVwZGF0ZSB0aGUgdGltZXN0YW1wcyBhY2NvcmRpbmdseVxuICAgICAgICBjb25zdCB1cGRhdGVkQXQgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgICAgIHVwZGF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQudXBkYXRlZEF0ID0gdXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dC51cGRhdGVkQXQgPyB1cGRhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0LnVwZGF0ZWRBdCA6IHVwZGF0ZWRBdDtcblxuICAgICAgICAvLyB1cGRhdGUgdGhlIG1pbGl0YXJ5IHZlcmlmaWNhdGlvbiBvYmplY3QgYmFzZWQgb24gdGhlIHBhc3NlZCBpbiBvYmplY3RcbiAgICAgICAgYXdhaXQgZHluYW1vRGJDbGllbnQuc2VuZChuZXcgVXBkYXRlSXRlbUNvbW1hbmQoe1xuICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5NSUxJVEFSWV9WRVJJRklDQVRJT05fVEFCTEUhLFxuICAgICAgICAgICAgS2V5OiB7XG4gICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgUzogdXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dC5pZFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBFeHByZXNzaW9uQXR0cmlidXRlTmFtZXM6IHtcbiAgICAgICAgICAgICAgICBcIiNNVlNcIjogXCJtaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1wiLFxuICAgICAgICAgICAgICAgIFwiI1VBXCI6IFwidXBkYXRlZEF0XCJcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBFeHByZXNzaW9uQXR0cmlidXRlVmFsdWVzOiB7XG4gICAgICAgICAgICAgICAgXCI6bXZzXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgUzogdXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dC5taWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXCI6dWFcIjoge1xuICAgICAgICAgICAgICAgICAgICBTOiB1cGRhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0LnVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBVcGRhdGVFeHByZXNzaW9uOiBcIlNFVCAjTVZTID0gOm12cywgI1VBID0gOnVhXCIsXG4gICAgICAgICAgICBSZXR1cm5WYWx1ZXM6IFwiVVBEQVRFRF9ORVdcIlxuICAgICAgICB9KSk7XG5cbiAgICAgICAgLy8gcmV0dXJuIHRoZSB1cGRhdGVkIG1pbGl0YXJ5IHZlcmlmaWNhdGlvbiBzdGF0dXNcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGlkOiB1cGRhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0LmlkLFxuICAgICAgICAgICAgbWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXM6IHVwZGF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQubWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgY3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb24gbXV0YXRpb24gJHtlcnJ9YDtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBNaWxpdGFyeVZlcmlmaWNhdGlvbkVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==