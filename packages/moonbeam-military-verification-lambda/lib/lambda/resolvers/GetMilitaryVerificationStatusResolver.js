"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMilitaryVerificationStatus = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * GetMilitaryVerificationStatus resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getMilitaryVerificationInput military verification input used for the verification status
 * to be retrieved
 *
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2V0TWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNSZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL0dldE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzUmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsOERBQXdFO0FBQ3hFLCtEQUttQztBQUVuQzs7Ozs7Ozs7R0FRRztBQUNJLE1BQU0sNkJBQTZCLEdBQUcsS0FBSyxFQUFFLFNBQWlCLEVBQUUsNEJBQTBELEVBQTRDLEVBQUU7SUFDM0ssSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2Qyw0Q0FBNEM7UUFDNUMsTUFBTSxjQUFjLEdBQUcsSUFBSSxnQ0FBYyxDQUFDLEVBQUMsTUFBTSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7UUFFNUQsZ0ZBQWdGO1FBQ2hGLE1BQU0sYUFBYSxHQUFJLE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLGdDQUFjLENBQUM7WUFDaEUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsMkJBQTRCO1lBQ25ELEdBQUcsRUFBRTtnQkFDRCxFQUFFLEVBQUU7b0JBQ0EsQ0FBQyxFQUFFLDRCQUE0QixDQUFDLEVBQUU7aUJBQ3JDO2FBQ0o7U0FDSixDQUFDLENBQUMsQ0FBQztRQUVKLHFFQUFxRTtRQUNyRSxJQUFJLGFBQWEsSUFBSSxhQUFhLENBQUMsSUFBSSxFQUFFO1lBQ3JDLDJDQUEyQztZQUMzQyxPQUFPO2dCQUNILElBQUksRUFBRTtvQkFDRixFQUFFLEVBQUUsYUFBYSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBRTtvQkFDNUIsMEJBQTBCLEVBQUUsYUFBYSxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxDQUFvQztpQkFDakg7YUFDSixDQUFBO1NBQ0o7YUFBTTtZQUNILE1BQU0sWUFBWSxHQUFHLHFDQUFxQyw0QkFBNEIsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUM1RixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRTFCLE9BQU87Z0JBQ0gsWUFBWSxFQUFFLFlBQVk7Z0JBQzFCLFNBQVMsRUFBRSwrQ0FBNkIsQ0FBQyxZQUFZO2FBQ3hELENBQUE7U0FDSjtLQUVKO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDVixNQUFNLFlBQVksR0FBRyxvQ0FBb0MsU0FBUyxVQUFVLEdBQUcsRUFBRSxDQUFDO1FBQ2xGLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDMUIsT0FBTztZQUNILFlBQVksRUFBRSxZQUFZO1lBQzFCLFNBQVMsRUFBRSwrQ0FBNkIsQ0FBQyxlQUFlO1NBQzNELENBQUM7S0FDTDtBQUNMLENBQUMsQ0FBQTtBQTdDWSxRQUFBLDZCQUE2QixpQ0E2Q3pDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtEeW5hbW9EQkNsaWVudCwgR2V0SXRlbUNvbW1hbmR9IGZyb20gXCJAYXdzLXNkay9jbGllbnQtZHluYW1vZGJcIjtcbmltcG9ydCB7XG4gICAgR2V0TWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dCxcbiAgICBHZXRNaWxpdGFyeVZlcmlmaWNhdGlvblJlc3BvbnNlLFxuICAgIE1pbGl0YXJ5VmVyaWZpY2F0aW9uRXJyb3JUeXBlLFxuICAgIE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZVxufSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuXG4vKipcbiAqIEdldE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzIHJlc29sdmVyXG4gKlxuICogQHBhcmFtIGZpZWxkTmFtZSBuYW1lIG9mIHRoZSByZXNvbHZlciBwYXRoIGZyb20gdGhlIEFwcFN5bmMgZXZlbnRcbiAqIEBwYXJhbSBnZXRNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0IG1pbGl0YXJ5IHZlcmlmaWNhdGlvbiBpbnB1dCB1c2VkIGZvciB0aGUgdmVyaWZpY2F0aW9uIHN0YXR1c1xuICogdG8gYmUgcmV0cmlldmVkXG4gKlxuICogQHJldHVybnMge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBHZXRNaWxpdGFyeVZlcmlmaWNhdGlvblJlc3BvbnNlfVxuICovXG5leHBvcnQgY29uc3QgZ2V0TWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXMgPSBhc3luYyAoZmllbGROYW1lOiBzdHJpbmcsIGdldE1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQ6IEdldE1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQpOiBQcm9taXNlPEdldE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVzcG9uc2U+ID0+IHtcbiAgICB0cnkge1xuICAgICAgICAvLyByZXRyaWV2aW5nIHRoZSBjdXJyZW50IGZ1bmN0aW9uIHJlZ2lvblxuICAgICAgICBjb25zdCByZWdpb24gPSBwcm9jZXNzLmVudi5BV1NfUkVHSU9OITtcblxuICAgICAgICAvLyBpbml0aWFsaXppbmcgdGhlIER5bmFtb0RCIGRvY3VtZW50IGNsaWVudFxuICAgICAgICBjb25zdCBkeW5hbW9EYkNsaWVudCA9IG5ldyBEeW5hbW9EQkNsaWVudCh7cmVnaW9uOiByZWdpb259KTtcblxuICAgICAgICAvLyByZXRyaWV2ZSB0aGUgbWlsaXRhcnkgdmVyaWZpY2F0aW9uIHN0YXR1cyBnaXZlbiB0aGUgdmVyaWZpY2F0aW9uIGlucHV0IG9iamVjdFxuICAgICAgICBjb25zdCByZXRyaWV2ZWREYXRhID0gIGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IEdldEl0ZW1Db21tYW5kKHtcbiAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuTUlMSVRBUllfVkVSSUZJQ0FUSU9OX1RBQkxFISxcbiAgICAgICAgICAgIEtleToge1xuICAgICAgICAgICAgICAgIGlkOiB7XG4gICAgICAgICAgICAgICAgICAgIFM6IGdldE1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQuaWRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKTtcblxuICAgICAgICAvLyBpZiB0aGVyZSBpcyBhbiBpdGVtIHJldHJpZXZlZCwgdGhlbiByZXR1cm4gaXRzIHZlcmlmaWNhdGlvbiBzdGF0dXNcbiAgICAgICAgaWYgKHJldHJpZXZlZERhdGEgJiYgcmV0cmlldmVkRGF0YS5JdGVtKSB7XG4gICAgICAgICAgICAvLyByZXR1cm4gdGhlIHJldHJpZXZlZCB2ZXJpZmljYXRpb24gc3RhdHVzXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6IHJldHJpZXZlZERhdGEuSXRlbS5pZC5TISxcbiAgICAgICAgICAgICAgICAgICAgbWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXM6IHJldHJpZXZlZERhdGEuSXRlbS5taWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1cy5TISBhcyBNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1R5cGVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVmVyaWZpY2F0aW9uIG9iamVjdCBub3QgZm91bmQgZm9yICR7Z2V0TWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dC5pZH1gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE1pbGl0YXJ5VmVyaWZpY2F0aW9uRXJyb3JUeXBlLk5vbmVPckFic2VudFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgZXhlY3V0aW5nICR7ZmllbGROYW1lfSBxdWVyeSAke2Vycn1gO1xuICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICBlcnJvclR5cGU6IE1pbGl0YXJ5VmVyaWZpY2F0aW9uRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICB9O1xuICAgIH1cbn1cbiJdfQ==