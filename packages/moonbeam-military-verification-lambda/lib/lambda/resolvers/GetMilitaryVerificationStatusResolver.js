"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMilitaryVerificationStatus = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * GetMilitaryVerificationStatus resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getMilitaryVerificationInput military verification input used for the verification status to be retrieved
 * @returns {@link Promise} of {@link GetMilitaryVerificationResponse}
 */
const getMilitaryVerificationStatus = async (fieldName, getMilitaryVerificationInput) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        // initializing the DynamoDB document client
        const dynamoDbClient = new client_dynamodb_1.DynamoDBClient({ region: region });
        // retrieve the military verification status given the verification input object
        const retrievedData = await dynamoDbClient.send(new client_dynamodb_1.GetItemCommand({
            TableName: process.env.MILITARY_VERIFICATION_TABLE,
            Key: {
                id: {
                    S: getMilitaryVerificationInput.id
                }
            }
        }));
        // if there is an item retrieved, then return its verification status
        if (retrievedData && retrievedData.Item) {
            // return the retrieved verification status
            return {
                data: {
                    id: retrievedData.Item.id.S,
                    militaryVerificationStatus: retrievedData.Item.militaryVerificationStatus.S
                }
            };
        }
        else {
            const errorMessage = `Verification object not found for ${getMilitaryVerificationInput.id}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.MilitaryVerificationErrorType.NoneOrAbsent
            };
        }
    }
    catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} query ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: moonbeam_models_1.MilitaryVerificationErrorType.UnexpectedError
        };
    }
};
exports.getMilitaryVerificationStatus = getMilitaryVerificationStatus;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2V0TWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNSZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL0dldE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzUmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsOERBQXdFO0FBQ3hFLCtEQUttQztBQUVuQzs7Ozs7O0dBTUc7QUFDSSxNQUFNLDZCQUE2QixHQUFHLEtBQUssRUFBRSxTQUFpQixFQUFFLDRCQUEwRCxFQUE0QyxFQUFFO0lBQzNLLElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsNENBQTRDO1FBQzVDLE1BQU0sY0FBYyxHQUFHLElBQUksZ0NBQWMsQ0FBQyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBRTVELGdGQUFnRjtRQUNoRixNQUFNLGFBQWEsR0FBSSxNQUFNLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxnQ0FBYyxDQUFDO1lBQ2hFLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLDJCQUE0QjtZQUNuRCxHQUFHLEVBQUU7Z0JBQ0QsRUFBRSxFQUFFO29CQUNBLENBQUMsRUFBRSw0QkFBNEIsQ0FBQyxFQUFFO2lCQUNyQzthQUNKO1NBQ0osQ0FBQyxDQUFDLENBQUM7UUFFSixxRUFBcUU7UUFDckUsSUFBSSxhQUFhLElBQUksYUFBYSxDQUFDLElBQUksRUFBRTtZQUNyQywyQ0FBMkM7WUFDM0MsT0FBTztnQkFDSCxJQUFJLEVBQUU7b0JBQ0YsRUFBRSxFQUFFLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUU7b0JBQzVCLDBCQUEwQixFQUFFLGFBQWEsQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsQ0FBb0M7aUJBQ2pIO2FBQ0osQ0FBQTtTQUNKO2FBQU07WUFDSCxNQUFNLFlBQVksR0FBRyxxQ0FBcUMsNEJBQTRCLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDNUYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUUxQixPQUFPO2dCQUNILFlBQVksRUFBRSxZQUFZO2dCQUMxQixTQUFTLEVBQUUsK0NBQTZCLENBQUMsWUFBWTthQUN4RCxDQUFBO1NBQ0o7S0FFSjtJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1YsTUFBTSxZQUFZLEdBQUcsb0NBQW9DLFNBQVMsVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUNsRixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzFCLE9BQU87WUFDSCxZQUFZLEVBQUUsWUFBWTtZQUMxQixTQUFTLEVBQUUsK0NBQTZCLENBQUMsZUFBZTtTQUMzRCxDQUFDO0tBQ0w7QUFDTCxDQUFDLENBQUE7QUE3Q1ksUUFBQSw2QkFBNkIsaUNBNkN6QyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RHluYW1vREJDbGllbnQsIEdldEl0ZW1Db21tYW5kfSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LWR5bmFtb2RiXCI7XG5pbXBvcnQge1xuICAgIEdldE1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQsXG4gICAgR2V0TWlsaXRhcnlWZXJpZmljYXRpb25SZXNwb25zZSxcbiAgICBNaWxpdGFyeVZlcmlmaWNhdGlvbkVycm9yVHlwZSxcbiAgICBNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1R5cGVcbn0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcblxuLyoqXG4gKiBHZXRNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1cyByZXNvbHZlclxuICpcbiAqIEBwYXJhbSBmaWVsZE5hbWUgbmFtZSBvZiB0aGUgcmVzb2x2ZXIgcGF0aCBmcm9tIHRoZSBBcHBTeW5jIGV2ZW50XG4gKiBAcGFyYW0gZ2V0TWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dCBtaWxpdGFyeSB2ZXJpZmljYXRpb24gaW5wdXQgdXNlZCBmb3IgdGhlIHZlcmlmaWNhdGlvbiBzdGF0dXMgdG8gYmUgcmV0cmlldmVkXG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIEdldE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCBnZXRNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1cyA9IGFzeW5jIChmaWVsZE5hbWU6IHN0cmluZywgZ2V0TWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dDogR2V0TWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dCk6IFByb21pc2U8R2V0TWlsaXRhcnlWZXJpZmljYXRpb25SZXNwb25zZT4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgIC8vIGluaXRpYWxpemluZyB0aGUgRHluYW1vREIgZG9jdW1lbnQgY2xpZW50XG4gICAgICAgIGNvbnN0IGR5bmFtb0RiQ2xpZW50ID0gbmV3IER5bmFtb0RCQ2xpZW50KHtyZWdpb246IHJlZ2lvbn0pO1xuXG4gICAgICAgIC8vIHJldHJpZXZlIHRoZSBtaWxpdGFyeSB2ZXJpZmljYXRpb24gc3RhdHVzIGdpdmVuIHRoZSB2ZXJpZmljYXRpb24gaW5wdXQgb2JqZWN0XG4gICAgICAgIGNvbnN0IHJldHJpZXZlZERhdGEgPSAgYXdhaXQgZHluYW1vRGJDbGllbnQuc2VuZChuZXcgR2V0SXRlbUNvbW1hbmQoe1xuICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5NSUxJVEFSWV9WRVJJRklDQVRJT05fVEFCTEUhLFxuICAgICAgICAgICAgS2V5OiB7XG4gICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgUzogZ2V0TWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dC5pZFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuXG4gICAgICAgIC8vIGlmIHRoZXJlIGlzIGFuIGl0ZW0gcmV0cmlldmVkLCB0aGVuIHJldHVybiBpdHMgdmVyaWZpY2F0aW9uIHN0YXR1c1xuICAgICAgICBpZiAocmV0cmlldmVkRGF0YSAmJiByZXRyaWV2ZWREYXRhLkl0ZW0pIHtcbiAgICAgICAgICAgIC8vIHJldHVybiB0aGUgcmV0cmlldmVkIHZlcmlmaWNhdGlvbiBzdGF0dXNcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICBpZDogcmV0cmlldmVkRGF0YS5JdGVtLmlkLlMhLFxuICAgICAgICAgICAgICAgICAgICBtaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1czogcmV0cmlldmVkRGF0YS5JdGVtLm1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzLlMhIGFzIE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBWZXJpZmljYXRpb24gb2JqZWN0IG5vdCBmb3VuZCBmb3IgJHtnZXRNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0LmlkfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTWlsaXRhcnlWZXJpZmljYXRpb25FcnJvclR5cGUuTm9uZU9yQWJzZW50XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgJHtmaWVsZE5hbWV9IHF1ZXJ5ICR7ZXJyfWA7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgIGVycm9yVHlwZTogTWlsaXRhcnlWZXJpZmljYXRpb25FcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgIH07XG4gICAgfVxufVxuIl19