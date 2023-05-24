"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMilitaryVerificationStatus = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * GetMilitaryVerificationStatus resolver
 *
 * @param getMilitaryVerificationInput military verification input used for the verification status to be retrieved
 * @returns {@link Promise} of {@link GetMilitaryVerificationResponse}
 */
const getMilitaryVerificationStatus = async (getMilitaryVerificationInput) => {
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
        const errorMessage = `Unexpected error while executing getMilitaryVerificationStatus query ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: moonbeam_models_1.MilitaryVerificationErrorType.UnexpectedError
        };
    }
};
exports.getMilitaryVerificationStatus = getMilitaryVerificationStatus;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2V0TWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNSZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL0dldE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzUmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsOERBQXdFO0FBQ3hFLCtEQUltQztBQUVuQzs7Ozs7R0FLRztBQUNJLE1BQU0sNkJBQTZCLEdBQUcsS0FBSyxFQUFFLDRCQUEwRCxFQUF5QyxFQUFFO0lBQ3JKLElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsNENBQTRDO1FBQzVDLE1BQU0sY0FBYyxHQUFHLElBQUksZ0NBQWMsQ0FBQyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBRTVELGdGQUFnRjtRQUNoRixNQUFNLGFBQWEsR0FBSSxNQUFNLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxnQ0FBYyxDQUFDO1lBQ2hFLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLDJCQUE0QjtZQUNuRCxHQUFHLEVBQUU7Z0JBQ0QsRUFBRSxFQUFFO29CQUNBLENBQUMsRUFBRSw0QkFBNEIsQ0FBQyxFQUFFO2lCQUNyQzthQUNKO1NBQ0osQ0FBQyxDQUFDLENBQUM7UUFFSixxRUFBcUU7UUFDckUsSUFBSSxhQUFhLElBQUksYUFBYSxDQUFDLElBQUksRUFBRTtZQUNyQywyQ0FBMkM7WUFDM0MsT0FBTztnQkFDSCxJQUFJLEVBQUU7b0JBQ0YsMEJBQTBCLEVBQUUsYUFBYSxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxDQUFvQztpQkFDakg7YUFDSixDQUFBO1NBQ0o7YUFBTTtZQUNILE1BQU0sWUFBWSxHQUFHLHFDQUFxQyw0QkFBNEIsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUM1RixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRTFCLE9BQU87Z0JBQ0gsWUFBWSxFQUFFLFlBQVk7Z0JBQzFCLFNBQVMsRUFBRSwrQ0FBNkIsQ0FBQyxZQUFZO2FBQ3hELENBQUE7U0FDSjtLQUVKO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDVixNQUFNLFlBQVksR0FBRyx3RUFBd0UsR0FBRyxFQUFFLENBQUM7UUFDbkcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMxQixPQUFPO1lBQ0gsWUFBWSxFQUFFLFlBQVk7WUFDMUIsU0FBUyxFQUFFLCtDQUE2QixDQUFDLGVBQWU7U0FDM0QsQ0FBQztLQUNMO0FBQ0wsQ0FBQyxDQUFBO0FBNUNZLFFBQUEsNkJBQTZCLGlDQTRDekMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0R5bmFtb0RCQ2xpZW50LCBHZXRJdGVtQ29tbWFuZH0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1keW5hbW9kYlwiO1xuaW1wb3J0IHtcbiAgICBHZXRNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0LFxuICAgIE1pbGl0YXJ5VmVyaWZpY2F0aW9uRXJyb3JUeXBlLCBNaWxpdGFyeVZlcmlmaWNhdGlvblJlc3BvbnNlLFxuICAgIE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZVxufSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuXG4vKipcbiAqIEdldE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzIHJlc29sdmVyXG4gKlxuICogQHBhcmFtIGdldE1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQgbWlsaXRhcnkgdmVyaWZpY2F0aW9uIGlucHV0IHVzZWQgZm9yIHRoZSB2ZXJpZmljYXRpb24gc3RhdHVzIHRvIGJlIHJldHJpZXZlZFxuICogQHJldHVybnMge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBHZXRNaWxpdGFyeVZlcmlmaWNhdGlvblJlc3BvbnNlfVxuICovXG5leHBvcnQgY29uc3QgZ2V0TWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXMgPSBhc3luYyAoZ2V0TWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dDogR2V0TWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dCk6IFByb21pc2U8TWlsaXRhcnlWZXJpZmljYXRpb25SZXNwb25zZT4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgIC8vIGluaXRpYWxpemluZyB0aGUgRHluYW1vREIgZG9jdW1lbnQgY2xpZW50XG4gICAgICAgIGNvbnN0IGR5bmFtb0RiQ2xpZW50ID0gbmV3IER5bmFtb0RCQ2xpZW50KHtyZWdpb246IHJlZ2lvbn0pO1xuXG4gICAgICAgIC8vIHJldHJpZXZlIHRoZSBtaWxpdGFyeSB2ZXJpZmljYXRpb24gc3RhdHVzIGdpdmVuIHRoZSB2ZXJpZmljYXRpb24gaW5wdXQgb2JqZWN0XG4gICAgICAgIGNvbnN0IHJldHJpZXZlZERhdGEgPSAgYXdhaXQgZHluYW1vRGJDbGllbnQuc2VuZChuZXcgR2V0SXRlbUNvbW1hbmQoe1xuICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5NSUxJVEFSWV9WRVJJRklDQVRJT05fVEFCTEUhLFxuICAgICAgICAgICAgS2V5OiB7XG4gICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgUzogZ2V0TWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dC5pZFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuXG4gICAgICAgIC8vIGlmIHRoZXJlIGlzIGFuIGl0ZW0gcmV0cmlldmVkLCB0aGVuIHJldHVybiBpdHMgdmVyaWZpY2F0aW9uIHN0YXR1c1xuICAgICAgICBpZiAocmV0cmlldmVkRGF0YSAmJiByZXRyaWV2ZWREYXRhLkl0ZW0pIHtcbiAgICAgICAgICAgIC8vIHJldHVybiB0aGUgcmV0cmlldmVkIHZlcmlmaWNhdGlvbiBzdGF0dXNcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICBtaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1czogcmV0cmlldmVkRGF0YS5JdGVtLm1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzLlMhIGFzIE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBWZXJpZmljYXRpb24gb2JqZWN0IG5vdCBmb3VuZCBmb3IgJHtnZXRNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0LmlkfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTWlsaXRhcnlWZXJpZmljYXRpb25FcnJvclR5cGUuTm9uZU9yQWJzZW50XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgZ2V0TWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXMgcXVlcnkgJHtlcnJ9YDtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBNaWxpdGFyeVZlcmlmaWNhdGlvbkVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgfTtcbiAgICB9XG59XG4iXX0=