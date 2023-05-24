"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMilitaryVerification = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * CreateMilitaryVerification resolver
 *
 * @param createMilitaryVerificationInput military verification object to be created
 * @returns {@link Promise} of {@link MilitaryVerificationResponse}
 */
const createMilitaryVerification = async (createMilitaryVerificationInput) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        // initializing the DynamoDB document client
        const dynamoDbClient = new client_dynamodb_1.DynamoDBClient({ region: region });
        // update the timestamps accordingly
        const createdAt = new Date().toISOString();
        createMilitaryVerificationInput.createdAt = createMilitaryVerificationInput.createdAt ? createMilitaryVerificationInput.createdAt : createdAt;
        createMilitaryVerificationInput.updatedAt = createMilitaryVerificationInput.updatedAt ? createMilitaryVerificationInput.updatedAt : createdAt;
        // store the military verification object
        await dynamoDbClient.send(new client_dynamodb_1.PutItemCommand({
            TableName: process.env.MILITARY_VERIFICATION_TABLE,
            Item: {
                id: {
                    S: createMilitaryVerificationInput.id
                },
                firstName: {
                    S: createMilitaryVerificationInput.firstName
                },
                lastName: {
                    S: createMilitaryVerificationInput.lastName
                },
                dateOfBirth: {
                    S: createMilitaryVerificationInput.dateOfBirth
                },
                addressLine: {
                    S: createMilitaryVerificationInput.addressLine
                },
                city: {
                    S: createMilitaryVerificationInput.city
                },
                state: {
                    S: createMilitaryVerificationInput.state
                },
                zipCode: {
                    S: createMilitaryVerificationInput.zipCode
                },
                militaryAffiliation: {
                    S: createMilitaryVerificationInput.militaryAffiliation
                },
                militaryBranch: {
                    S: createMilitaryVerificationInput.militaryBranch
                },
                militaryDutyStatus: {
                    S: createMilitaryVerificationInput.militaryDutyStatus
                },
                militaryVerificationStatus: {
                    S: createMilitaryVerificationInput.militaryVerificationStatus
                },
                createdAt: {
                    S: createMilitaryVerificationInput.createdAt
                },
                updatedAt: {
                    S: createMilitaryVerificationInput.updatedAt
                }
            },
        }));
        // return the military verification object
        return {
            data: createMilitaryVerificationInput
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
exports.createMilitaryVerification = createMilitaryVerification;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25SZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL0NyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsOERBQXdFO0FBQ3hFLCtEQUltQztBQUVuQzs7Ozs7R0FLRztBQUNJLE1BQU0sMEJBQTBCLEdBQUcsS0FBSyxFQUFFLCtCQUFnRSxFQUErQyxFQUFFO0lBQzlKLElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsNENBQTRDO1FBQzVDLE1BQU0sY0FBYyxHQUFHLElBQUksZ0NBQWMsQ0FBQyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBRTVELG9DQUFvQztRQUNwQyxNQUFNLFNBQVMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzNDLCtCQUErQixDQUFDLFNBQVMsR0FBRywrQkFBK0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLCtCQUErQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQzlJLCtCQUErQixDQUFDLFNBQVMsR0FBRywrQkFBK0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLCtCQUErQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBRTlJLHlDQUF5QztRQUN6QyxNQUFNLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxnQ0FBYyxDQUFDO1lBQ3pDLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLDJCQUE0QjtZQUNuRCxJQUFJLEVBQUU7Z0JBQ0YsRUFBRSxFQUFFO29CQUNBLENBQUMsRUFBRSwrQkFBK0IsQ0FBQyxFQUFFO2lCQUN4QztnQkFDRCxTQUFTLEVBQUU7b0JBQ1AsQ0FBQyxFQUFFLCtCQUErQixDQUFDLFNBQVM7aUJBQy9DO2dCQUNELFFBQVEsRUFBRTtvQkFDTixDQUFDLEVBQUUsK0JBQStCLENBQUMsUUFBUTtpQkFDOUM7Z0JBQ0QsV0FBVyxFQUFFO29CQUNULENBQUMsRUFBRSwrQkFBK0IsQ0FBQyxXQUFXO2lCQUNqRDtnQkFDRCxXQUFXLEVBQUU7b0JBQ1QsQ0FBQyxFQUFFLCtCQUErQixDQUFDLFdBQVc7aUJBQ2pEO2dCQUNELElBQUksRUFBRTtvQkFDRixDQUFDLEVBQUUsK0JBQStCLENBQUMsSUFBSTtpQkFDMUM7Z0JBQ0QsS0FBSyxFQUFFO29CQUNILENBQUMsRUFBRSwrQkFBK0IsQ0FBQyxLQUFLO2lCQUMzQztnQkFDRCxPQUFPLEVBQUU7b0JBQ0wsQ0FBQyxFQUFFLCtCQUErQixDQUFDLE9BQU87aUJBQzdDO2dCQUNELG1CQUFtQixFQUFFO29CQUNqQixDQUFDLEVBQUUsK0JBQStCLENBQUMsbUJBQW1CO2lCQUN6RDtnQkFDRCxjQUFjLEVBQUU7b0JBQ1osQ0FBQyxFQUFFLCtCQUErQixDQUFDLGNBQWM7aUJBQ3BEO2dCQUNELGtCQUFrQixFQUFFO29CQUNoQixDQUFDLEVBQUUsK0JBQStCLENBQUMsa0JBQWtCO2lCQUN4RDtnQkFDRCwwQkFBMEIsRUFBRTtvQkFDeEIsQ0FBQyxFQUFFLCtCQUErQixDQUFDLDBCQUEwQjtpQkFDaEU7Z0JBQ0QsU0FBUyxFQUFFO29CQUNQLENBQUMsRUFBRSwrQkFBK0IsQ0FBQyxTQUFTO2lCQUMvQztnQkFDRCxTQUFTLEVBQUU7b0JBQ1AsQ0FBQyxFQUFFLCtCQUErQixDQUFDLFNBQVM7aUJBQy9DO2FBQ0o7U0FDSixDQUFDLENBQUMsQ0FBQztRQUVKLDBDQUEwQztRQUMxQyxPQUFPO1lBQ0gsSUFBSSxFQUFFLCtCQUFrRTtTQUMzRSxDQUFBO0tBQ0o7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNWLE1BQU0sWUFBWSxHQUFHLHdFQUF3RSxHQUFHLEVBQUUsQ0FBQztRQUNuRyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzFCLE9BQU87WUFDSCxZQUFZLEVBQUUsWUFBWTtZQUMxQixTQUFTLEVBQUUsK0NBQTZCLENBQUMsZUFBZTtTQUMzRCxDQUFBO0tBQ0o7QUFDTCxDQUFDLENBQUE7QUExRVksUUFBQSwwQkFBMEIsOEJBMEV0QyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RHluYW1vREJDbGllbnQsIFB1dEl0ZW1Db21tYW5kfSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LWR5bmFtb2RiXCI7XG5pbXBvcnQge1xuICAgIENyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQsIENyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVzcG9uc2UsXG4gICAgTWlsaXRhcnlWZXJpZmljYXRpb25FcnJvclR5cGUsXG4gICAgTWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbixcbn0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcblxuLyoqXG4gKiBDcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbiByZXNvbHZlclxuICpcbiAqIEBwYXJhbSBjcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0IG1pbGl0YXJ5IHZlcmlmaWNhdGlvbiBvYmplY3QgdG8gYmUgY3JlYXRlZFxuICogQHJldHVybnMge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBNaWxpdGFyeVZlcmlmaWNhdGlvblJlc3BvbnNlfVxuICovXG5leHBvcnQgY29uc3QgY3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb24gPSBhc3luYyAoY3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dDogQ3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dCk6IFByb21pc2U8Q3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25SZXNwb25zZT4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgIC8vIGluaXRpYWxpemluZyB0aGUgRHluYW1vREIgZG9jdW1lbnQgY2xpZW50XG4gICAgICAgIGNvbnN0IGR5bmFtb0RiQ2xpZW50ID0gbmV3IER5bmFtb0RCQ2xpZW50KHtyZWdpb246IHJlZ2lvbn0pO1xuXG4gICAgICAgIC8vIHVwZGF0ZSB0aGUgdGltZXN0YW1wcyBhY2NvcmRpbmdseVxuICAgICAgICBjb25zdCBjcmVhdGVkQXQgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgICAgIGNyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQuY3JlYXRlZEF0ID0gY3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dC5jcmVhdGVkQXQgPyBjcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0LmNyZWF0ZWRBdCA6IGNyZWF0ZWRBdDtcbiAgICAgICAgY3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dC51cGRhdGVkQXQgPSBjcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0LnVwZGF0ZWRBdCA/IGNyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQudXBkYXRlZEF0IDogY3JlYXRlZEF0O1xuXG4gICAgICAgIC8vIHN0b3JlIHRoZSBtaWxpdGFyeSB2ZXJpZmljYXRpb24gb2JqZWN0XG4gICAgICAgIGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IFB1dEl0ZW1Db21tYW5kKHtcbiAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuTUlMSVRBUllfVkVSSUZJQ0FUSU9OX1RBQkxFISxcbiAgICAgICAgICAgIEl0ZW06IHtcbiAgICAgICAgICAgICAgICBpZDoge1xuICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0LmlkXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBmaXJzdE5hbWU6IHtcbiAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dC5maXJzdE5hbWVcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGxhc3ROYW1lOiB7XG4gICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQubGFzdE5hbWVcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRhdGVPZkJpcnRoOiB7XG4gICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQuZGF0ZU9mQmlydGhcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGFkZHJlc3NMaW5lOiB7XG4gICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQuYWRkcmVzc0xpbmVcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNpdHk6IHtcbiAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dC5jaXR5XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzdGF0ZToge1xuICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0LnN0YXRlXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB6aXBDb2RlOiB7XG4gICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQuemlwQ29kZVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbWlsaXRhcnlBZmZpbGlhdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0Lm1pbGl0YXJ5QWZmaWxpYXRpb25cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG1pbGl0YXJ5QnJhbmNoOiB7XG4gICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQubWlsaXRhcnlCcmFuY2hcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG1pbGl0YXJ5RHV0eVN0YXR1czoge1xuICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0Lm1pbGl0YXJ5RHV0eVN0YXR1c1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXM6IHtcbiAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dC5taWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0OiB7XG4gICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQuY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dC51cGRhdGVkQXRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICB9KSk7XG5cbiAgICAgICAgLy8gcmV0dXJuIHRoZSBtaWxpdGFyeSB2ZXJpZmljYXRpb24gb2JqZWN0XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkYXRhOiBjcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0IGFzIE1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5mb3JtYXRpb25cbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgY3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb24gbXV0YXRpb24gJHtlcnJ9YDtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBNaWxpdGFyeVZlcmlmaWNhdGlvbkVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==