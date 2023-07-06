"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMilitaryVerification = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const VAClient_1 = require("../clients/VAClient");
const QuandisClient_1 = require("../clients/QuandisClient");
/**
 * CreateMilitaryVerification resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param createMilitaryVerificationInput military verification object to be created
 * @returns {@link Promise} of {@link CreateMilitaryVerificationResponse}
 */
const createMilitaryVerification = async (fieldName, createMilitaryVerificationInput) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        // initializing the DynamoDB document client
        const dynamoDbClient = new client_dynamodb_1.DynamoDBClient({ region: region });
        // update the timestamps accordingly
        const createdAt = new Date().toISOString();
        createMilitaryVerificationInput.createdAt = createMilitaryVerificationInput.createdAt ? createMilitaryVerificationInput.createdAt : createdAt;
        createMilitaryVerificationInput.updatedAt = createMilitaryVerificationInput.updatedAt ? createMilitaryVerificationInput.updatedAt : createdAt;
        // call the verification Client APIs here, in order to get the appropriate initial verification status for the object
        const lighthouseClient = new VAClient_1.VAClient(createMilitaryVerificationInput, process.env.ENV_NAME, region);
        const lighthouseVerificationStatus = await lighthouseClient.verify();
        console.log(`Lighthouse status ${lighthouseVerificationStatus}`);
        const quandisClient = new QuandisClient_1.QuandisClient(createMilitaryVerificationInput, process.env.ENV_NAME, region);
        const quandisVerificationStatus = await quandisClient.verify();
        console.log(`Quandis status ${quandisVerificationStatus}`);
        // resolve the resulting status accordingly
        let verificationStatus;
        if (lighthouseVerificationStatus === moonbeam_models_1.MilitaryVerificationStatusType.Verified || quandisVerificationStatus === moonbeam_models_1.MilitaryVerificationStatusType.Verified) {
            verificationStatus = moonbeam_models_1.MilitaryVerificationStatusType.Verified;
        }
        else {
            verificationStatus = moonbeam_models_1.MilitaryVerificationStatusType.Pending;
        }
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
                enlistmentYear: {
                    S: createMilitaryVerificationInput.enlistmentYear
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
                    S: verificationStatus
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
            data: {
                ...createMilitaryVerificationInput,
                militaryVerificationStatus: verificationStatus
            }
        };
    }
    catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} mutation ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: moonbeam_models_1.MilitaryVerificationErrorType.UnexpectedError
        };
    }
};
exports.createMilitaryVerification = createMilitaryVerification;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25SZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL0NyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsOERBQXdFO0FBQ3hFLCtEQU1tQztBQUNuQyxrREFBNkM7QUFDN0MsNERBQXVEO0FBRXZEOzs7Ozs7R0FNRztBQUNJLE1BQU0sMEJBQTBCLEdBQUcsS0FBSyxFQUFFLFNBQWlCLEVBQUUsK0JBQWdFLEVBQStDLEVBQUU7SUFDakwsSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2Qyw0Q0FBNEM7UUFDNUMsTUFBTSxjQUFjLEdBQUcsSUFBSSxnQ0FBYyxDQUFDLEVBQUMsTUFBTSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7UUFFNUQsb0NBQW9DO1FBQ3BDLE1BQU0sU0FBUyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDM0MsK0JBQStCLENBQUMsU0FBUyxHQUFHLCtCQUErQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsK0JBQStCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDOUksK0JBQStCLENBQUMsU0FBUyxHQUFHLCtCQUErQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsK0JBQStCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFFOUkscUhBQXFIO1FBQ3JILE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxtQkFBUSxDQUFDLCtCQUFrRSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3pJLE1BQU0sNEJBQTRCLEdBQUcsTUFBTSxnQkFBZ0IsQ0FBQyxNQUFNLEVB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InNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RHluYW1vREJDbGllbnQsIFB1dEl0ZW1Db21tYW5kfSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LWR5bmFtb2RiXCI7XG5pbXBvcnQge1xuICAgIENyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQsXG4gICAgQ3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25SZXNwb25zZSxcbiAgICBNaWxpdGFyeVZlcmlmaWNhdGlvbkVycm9yVHlwZSxcbiAgICBNaWxpdGFyeVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uLFxuICAgIE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZSxcbn0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcbmltcG9ydCB7VkFDbGllbnR9IGZyb20gXCIuLi9jbGllbnRzL1ZBQ2xpZW50XCI7XG5pbXBvcnQge1F1YW5kaXNDbGllbnR9IGZyb20gXCIuLi9jbGllbnRzL1F1YW5kaXNDbGllbnRcIjtcblxuLyoqXG4gKiBDcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbiByZXNvbHZlclxuICpcbiAqIEBwYXJhbSBmaWVsZE5hbWUgbmFtZSBvZiB0aGUgcmVzb2x2ZXIgcGF0aCBmcm9tIHRoZSBBcHBTeW5jIGV2ZW50XG4gKiBAcGFyYW0gY3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dCBtaWxpdGFyeSB2ZXJpZmljYXRpb24gb2JqZWN0IHRvIGJlIGNyZWF0ZWRcbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgQ3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25SZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IGNyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uID0gYXN5bmMgKGZpZWxkTmFtZTogc3RyaW5nLCBjcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0OiBDcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0KTogUHJvbWlzZTxDcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvblJlc3BvbnNlPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gcmV0cmlldmluZyB0aGUgY3VycmVudCBmdW5jdGlvbiByZWdpb25cbiAgICAgICAgY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiE7XG5cbiAgICAgICAgLy8gaW5pdGlhbGl6aW5nIHRoZSBEeW5hbW9EQiBkb2N1bWVudCBjbGllbnRcbiAgICAgICAgY29uc3QgZHluYW1vRGJDbGllbnQgPSBuZXcgRHluYW1vREJDbGllbnQoe3JlZ2lvbjogcmVnaW9ufSk7XG5cbiAgICAgICAgLy8gdXBkYXRlIHRoZSB0aW1lc3RhbXBzIGFjY29yZGluZ2x5XG4gICAgICAgIGNvbnN0IGNyZWF0ZWRBdCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICAgICAgY3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dC5jcmVhdGVkQXQgPSBjcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0LmNyZWF0ZWRBdCA/IGNyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQuY3JlYXRlZEF0IDogY3JlYXRlZEF0O1xuICAgICAgICBjcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0LnVwZGF0ZWRBdCA9IGNyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQudXBkYXRlZEF0ID8gY3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dC51cGRhdGVkQXQgOiBjcmVhdGVkQXQ7XG5cbiAgICAgICAgLy8gY2FsbCB0aGUgdmVyaWZpY2F0aW9uIENsaWVudCBBUElzIGhlcmUsIGluIG9yZGVyIHRvIGdldCB0aGUgYXBwcm9wcmlhdGUgaW5pdGlhbCB2ZXJpZmljYXRpb24gc3RhdHVzIGZvciB0aGUgb2JqZWN0XG4gICAgICAgIGNvbnN0IGxpZ2h0aG91c2VDbGllbnQgPSBuZXcgVkFDbGllbnQoY3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dCBhcyBNaWxpdGFyeVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uLCBwcm9jZXNzLmVudi5FTlZfTkFNRSEsIHJlZ2lvbik7XG4gICAgICAgIGNvbnN0IGxpZ2h0aG91c2VWZXJpZmljYXRpb25TdGF0dXMgPSBhd2FpdCBsaWdodGhvdXNlQ2xpZW50LnZlcmlmeSgpO1xuICAgICAgICBjb25zb2xlLmxvZyhgTGlnaHRob3VzZSBzdGF0dXMgJHtsaWdodGhvdXNlVmVyaWZpY2F0aW9uU3RhdHVzfWApO1xuXG4gICAgICAgIGNvbnN0IHF1YW5kaXNDbGllbnQgPSBuZXcgUXVhbmRpc0NsaWVudChjcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0IGFzIE1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5mb3JtYXRpb24sIHByb2Nlc3MuZW52LkVOVl9OQU1FISwgcmVnaW9uKTtcbiAgICAgICAgY29uc3QgcXVhbmRpc1ZlcmlmaWNhdGlvblN0YXR1cyA9IGF3YWl0IHF1YW5kaXNDbGllbnQudmVyaWZ5KCk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBRdWFuZGlzIHN0YXR1cyAke3F1YW5kaXNWZXJpZmljYXRpb25TdGF0dXN9YCk7XG5cbiAgICAgICAgLy8gcmVzb2x2ZSB0aGUgcmVzdWx0aW5nIHN0YXR1cyBhY2NvcmRpbmdseVxuICAgICAgICBsZXQgdmVyaWZpY2F0aW9uU3RhdHVzOiBNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1R5cGU7XG4gICAgICAgIGlmIChsaWdodGhvdXNlVmVyaWZpY2F0aW9uU3RhdHVzID09PSBNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1R5cGUuVmVyaWZpZWQgfHwgcXVhbmRpc1ZlcmlmaWNhdGlvblN0YXR1cyA9PT0gTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNUeXBlLlZlcmlmaWVkKSB7XG4gICAgICAgICAgICB2ZXJpZmljYXRpb25TdGF0dXMgPSBNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1R5cGUuVmVyaWZpZWQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2ZXJpZmljYXRpb25TdGF0dXMgPSBNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1R5cGUuUGVuZGluZztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHN0b3JlIHRoZSBtaWxpdGFyeSB2ZXJpZmljYXRpb24gb2JqZWN0XG4gICAgICAgIGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IFB1dEl0ZW1Db21tYW5kKHtcbiAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuTUlMSVRBUllfVkVSSUZJQ0FUSU9OX1RBQkxFISxcbiAgICAgICAgICAgIEl0ZW06IHtcbiAgICAgICAgICAgICAgICBpZDoge1xuICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0LmlkXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBmaXJzdE5hbWU6IHtcbiAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dC5maXJzdE5hbWVcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGxhc3ROYW1lOiB7XG4gICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQubGFzdE5hbWVcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRhdGVPZkJpcnRoOiB7XG4gICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQuZGF0ZU9mQmlydGhcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGVubGlzdG1lbnRZZWFyOiB7XG4gICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQuZW5saXN0bWVudFllYXJcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGFkZHJlc3NMaW5lOiB7XG4gICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQuYWRkcmVzc0xpbmVcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNpdHk6IHtcbiAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dC5jaXR5XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzdGF0ZToge1xuICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0LnN0YXRlXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB6aXBDb2RlOiB7XG4gICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQuemlwQ29kZVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbWlsaXRhcnlBZmZpbGlhdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0Lm1pbGl0YXJ5QWZmaWxpYXRpb25cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG1pbGl0YXJ5QnJhbmNoOiB7XG4gICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQubWlsaXRhcnlCcmFuY2hcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG1pbGl0YXJ5RHV0eVN0YXR1czoge1xuICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0Lm1pbGl0YXJ5RHV0eVN0YXR1c1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXM6IHtcbiAgICAgICAgICAgICAgICAgICAgUzogdmVyaWZpY2F0aW9uU3RhdHVzXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dC5jcmVhdGVkQXRcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdDoge1xuICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0LnVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pKTtcblxuICAgICAgICAvLyByZXR1cm4gdGhlIG1pbGl0YXJ5IHZlcmlmaWNhdGlvbiBvYmplY3RcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAuLi5jcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0LFxuICAgICAgICAgICAgICAgIG1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzOiB2ZXJpZmljYXRpb25TdGF0dXNcbiAgICAgICAgICAgIH0gYXMgTWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvblxuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyAke2ZpZWxkTmFtZX0gbXV0YXRpb24gJHtlcnJ9YDtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBNaWxpdGFyeVZlcmlmaWNhdGlvbkVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==