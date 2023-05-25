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
        // call the verification Client APIs here, in order to get the appropriate initial verification status for the object
        const lighthouseClient = new VAClient_1.VAClient(createMilitaryVerificationInput, process.env.ENV_NAME, region);
        const lighthouseVerificationStatus = await lighthouseClient.verify();
        console.log(`Lighthouse status ${lighthouseVerificationStatus}`);
        const quandisClient = new QuandisClient_1.QuandisClient(createMilitaryVerificationInput, process.env.ENV_NAME, region);
        const quandisVerificationStatus = await quandisClient.verify();
        console.log(`Quandis status ${quandisVerificationStatus}`);
        // base the stored military verification status, on the responses of both verification client calls
        let verificationStatus;
        if (lighthouseVerificationStatus === moonbeam_models_1.MilitaryVerificationStatusType.Verified
            || quandisVerificationStatus === moonbeam_models_1.MilitaryVerificationStatusType.Verified) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25SZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL0NyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsOERBQXdFO0FBQ3hFLCtEQU1tQztBQUNuQyxrREFBNkM7QUFDN0MsNERBQXVEO0FBRXZEOzs7OztHQUtHO0FBQ0ksTUFBTSwwQkFBMEIsR0FBRyxLQUFLLEVBQUUsK0JBQWdFLEVBQStDLEVBQUU7SUFDOUosSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2Qyw0Q0FBNEM7UUFDNUMsTUFBTSxjQUFjLEdBQUcsSUFBSSxnQ0FBYyxDQUFDLEVBQUMsTUFBTSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7UUFFNUQsb0NBQW9DO1FBQ3BDLE1BQU0sU0FBUyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDM0MsK0JBQStCLENBQUMsU0FBUyxHQUFHLCtCQUErQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsK0JBQStCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDOUksK0JBQStCLENBQUMsU0FBUyxHQUFHLCtCQUErQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsK0JBQStCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFFOUkscUhBQXFIO1FBQ3JILE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxtQkFBUSxDQUFDLCtCQUFrRSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3pJLE1BQU0sNEJBQTRCLEdBQUcsTUFBTSxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNy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IFwiQGF3cy1zZGsvY2xpZW50LWR5bmFtb2RiXCI7XG5pbXBvcnQge1xuICAgIENyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQsXG4gICAgQ3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25SZXNwb25zZSxcbiAgICBNaWxpdGFyeVZlcmlmaWNhdGlvbkVycm9yVHlwZSxcbiAgICBNaWxpdGFyeVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uLFxuICAgIE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZSxcbn0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcbmltcG9ydCB7VkFDbGllbnR9IGZyb20gXCIuLi9jbGllbnRzL1ZBQ2xpZW50XCI7XG5pbXBvcnQge1F1YW5kaXNDbGllbnR9IGZyb20gXCIuLi9jbGllbnRzL1F1YW5kaXNDbGllbnRcIjtcblxuLyoqXG4gKiBDcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbiByZXNvbHZlclxuICpcbiAqIEBwYXJhbSBjcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0IG1pbGl0YXJ5IHZlcmlmaWNhdGlvbiBvYmplY3QgdG8gYmUgY3JlYXRlZFxuICogQHJldHVybnMge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBNaWxpdGFyeVZlcmlmaWNhdGlvblJlc3BvbnNlfVxuICovXG5leHBvcnQgY29uc3QgY3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb24gPSBhc3luYyAoY3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dDogQ3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dCk6IFByb21pc2U8Q3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25SZXNwb25zZT4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgIC8vIGluaXRpYWxpemluZyB0aGUgRHluYW1vREIgZG9jdW1lbnQgY2xpZW50XG4gICAgICAgIGNvbnN0IGR5bmFtb0RiQ2xpZW50ID0gbmV3IER5bmFtb0RCQ2xpZW50KHtyZWdpb246IHJlZ2lvbn0pO1xuXG4gICAgICAgIC8vIHVwZGF0ZSB0aGUgdGltZXN0YW1wcyBhY2NvcmRpbmdseVxuICAgICAgICBjb25zdCBjcmVhdGVkQXQgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgICAgIGNyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQuY3JlYXRlZEF0ID0gY3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dC5jcmVhdGVkQXQgPyBjcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0LmNyZWF0ZWRBdCA6IGNyZWF0ZWRBdDtcbiAgICAgICAgY3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dC51cGRhdGVkQXQgPSBjcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0LnVwZGF0ZWRBdCA/IGNyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQudXBkYXRlZEF0IDogY3JlYXRlZEF0O1xuXG4gICAgICAgIC8vIGNhbGwgdGhlIHZlcmlmaWNhdGlvbiBDbGllbnQgQVBJcyBoZXJlLCBpbiBvcmRlciB0byBnZXQgdGhlIGFwcHJvcHJpYXRlIGluaXRpYWwgdmVyaWZpY2F0aW9uIHN0YXR1cyBmb3IgdGhlIG9iamVjdFxuICAgICAgICBjb25zdCBsaWdodGhvdXNlQ2xpZW50ID0gbmV3IFZBQ2xpZW50KGNyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQgYXMgTWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbiwgcHJvY2Vzcy5lbnYuRU5WX05BTUUhLCByZWdpb24pO1xuICAgICAgICBjb25zdCBsaWdodGhvdXNlVmVyaWZpY2F0aW9uU3RhdHVzID0gYXdhaXQgbGlnaHRob3VzZUNsaWVudC52ZXJpZnkoKTtcbiAgICAgICAgY29uc29sZS5sb2coYExpZ2h0aG91c2Ugc3RhdHVzICR7bGlnaHRob3VzZVZlcmlmaWNhdGlvblN0YXR1c31gKTtcblxuICAgICAgICBjb25zdCBxdWFuZGlzQ2xpZW50ID0gbmV3IFF1YW5kaXNDbGllbnQoY3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dCBhcyBNaWxpdGFyeVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uLCBwcm9jZXNzLmVudi5FTlZfTkFNRSEsIHJlZ2lvbik7XG4gICAgICAgIGNvbnN0IHF1YW5kaXNWZXJpZmljYXRpb25TdGF0dXMgPSBhd2FpdCBxdWFuZGlzQ2xpZW50LnZlcmlmeSgpO1xuICAgICAgICBjb25zb2xlLmxvZyhgUXVhbmRpcyBzdGF0dXMgJHtxdWFuZGlzVmVyaWZpY2F0aW9uU3RhdHVzfWApO1xuXG4gICAgICAgIC8vIGJhc2UgdGhlIHN0b3JlZCBtaWxpdGFyeSB2ZXJpZmljYXRpb24gc3RhdHVzLCBvbiB0aGUgcmVzcG9uc2VzIG9mIGJvdGggdmVyaWZpY2F0aW9uIGNsaWVudCBjYWxsc1xuICAgICAgICBsZXQgdmVyaWZpY2F0aW9uU3RhdHVzOiBNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1R5cGU7XG4gICAgICAgIGlmIChsaWdodGhvdXNlVmVyaWZpY2F0aW9uU3RhdHVzID09PSBNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1R5cGUuVmVyaWZpZWRcbiAgICAgICAgICAgIHx8IHF1YW5kaXNWZXJpZmljYXRpb25TdGF0dXMgPT09IE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZS5WZXJpZmllZCkge1xuICAgICAgICAgICAgdmVyaWZpY2F0aW9uU3RhdHVzID0gTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNUeXBlLlZlcmlmaWVkO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmVyaWZpY2F0aW9uU3RhdHVzID0gTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNUeXBlLlBlbmRpbmc7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzdG9yZSB0aGUgbWlsaXRhcnkgdmVyaWZpY2F0aW9uIG9iamVjdFxuICAgICAgICBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBQdXRJdGVtQ29tbWFuZCh7XG4gICAgICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52Lk1JTElUQVJZX1ZFUklGSUNBVElPTl9UQUJMRSEsXG4gICAgICAgICAgICBJdGVtOiB7XG4gICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dC5pZFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZmlyc3ROYW1lOiB7XG4gICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQuZmlyc3ROYW1lXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBsYXN0TmFtZToge1xuICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0Lmxhc3ROYW1lXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBkYXRlT2ZCaXJ0aDoge1xuICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0LmRhdGVPZkJpcnRoXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBlbmxpc3RtZW50WWVhcjoge1xuICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0LmVubGlzdG1lbnRZZWFyXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBhZGRyZXNzTGluZToge1xuICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0LmFkZHJlc3NMaW5lXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjaXR5OiB7XG4gICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQuY2l0eVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc3RhdGU6IHtcbiAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dC5zdGF0ZVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgemlwQ29kZToge1xuICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0LnppcENvZGVcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG1pbGl0YXJ5QWZmaWxpYXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dC5taWxpdGFyeUFmZmlsaWF0aW9uXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBtaWxpdGFyeUJyYW5jaDoge1xuICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0Lm1pbGl0YXJ5QnJhbmNoXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBtaWxpdGFyeUR1dHlTdGF0dXM6IHtcbiAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dC5taWxpdGFyeUR1dHlTdGF0dXNcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzOiB7XG4gICAgICAgICAgICAgICAgICAgIFM6IHZlcmlmaWNhdGlvblN0YXR1c1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0OiB7XG4gICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQuY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dC51cGRhdGVkQXRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICB9KSk7XG5cbiAgICAgICAgLy8gcmV0dXJuIHRoZSBtaWxpdGFyeSB2ZXJpZmljYXRpb24gb2JqZWN0XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkYXRhOiBjcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0IGFzIE1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5mb3JtYXRpb25cbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgY3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb24gbXV0YXRpb24gJHtlcnJ9YDtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBNaWxpdGFyeVZlcmlmaWNhdGlvbkVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==