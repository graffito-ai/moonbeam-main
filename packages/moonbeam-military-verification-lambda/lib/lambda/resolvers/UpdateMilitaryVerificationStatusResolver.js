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
        // check to see if there is a military verification object to update. If there's none, then return an error accordingly.
        const preExistingVerificationObject = await dynamoDbClient.send(new client_dynamodb_1.GetItemCommand({
            TableName: process.env.MILITARY_VERIFICATION_TABLE,
            Key: {
                id: {
                    S: updateMilitaryVerificationInput.id
                }
            }
        }));
        // if there is an item retrieved to be updated, then we proceed accordingly. Otherwise, we throw an error.
        if (preExistingVerificationObject && preExistingVerificationObject.Item) {
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
        else {
            const errorMessage = `Unknown military verification object to update!`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.MilitaryVerificationErrorType.NoneOrAbsent
            };
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNSZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL1VwZGF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzUmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsOERBQTJGO0FBQzNGLCtEQUltQztBQUVuQzs7Ozs7R0FLRztBQUNJLE1BQU0sZ0NBQWdDLEdBQUcsS0FBSyxFQUFFLCtCQUFnRSxFQUErQyxFQUFFO0lBQ3BLLElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsNENBQTRDO1FBQzVDLE1BQU0sY0FBYyxHQUFHLElBQUksZ0NBQWMsQ0FBQyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBRTVELG9DQUFvQztRQUNwQyxNQUFNLFNBQVMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzNDLCtCQUErQixDQUFDLFNBQVMsR0FBRywrQkFBK0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLCtCQUErQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBRTlJLHdIQUF3SDtRQUN4SCxNQUFNLDZCQUE2QixHQUFJLE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLGdDQUFjLENBQUM7WUFDaEYsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsMkJBQTRCO1lBQ25ELEdBQUcsRUFBRTtnQkFDRCxFQUFFLEVBQUU7b0JBQ0EsQ0FBQyxFQUFFLCtCQUErQixDQUFDLEVBQUU7aUJBQ3hDO2FBQ0o7U0FDSixDQUFDLENBQUMsQ0FBQztRQUVKLDBHQUEwRztRQUMxRyxJQUFJLDZCQUE2QixJQUFJLDZCQUE2QixDQUFDLElBQUksRUFBRTtZQUNyRSx3RUFBd0U7WUFDeEUsTUFBTSxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksbUNBQWlCLENBQUM7Z0JBQzVDLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLDJCQUE0QjtnQkFDbkQsR0FBRyxFQUFFO29CQUNELEVBQUUsRUFBRTt3QkFDQSxDQUFDLEVBQUUsK0JBQStCLENBQUMsRUFBRTtxQkFDeEM7aUJBQ0o7Z0JBQ0Qsd0JBQXdCLEVBQUU7b0JBQ3RCLE1BQU0sRUFBRSw0QkFBNEI7b0JBQ3BDLEtBQUssRUFBRSxXQUFXO2lCQUNyQjtnQkFDRCx5QkFBeUIsRUFBRTtvQkFDdkIsTUFBTSxFQUFFO3dCQUNKLENBQUMsRUFBRSwrQkFBK0IsQ0FBQywwQkFBMEI7cUJBQ2hFO29CQUNELEtBQUssRUFBRTt3QkFDSCxDQUFDLEVBQUUsK0JBQStCLENBQUMsU0FBUztxQkFDL0M7aUJBQ0o7Z0JBQ0QsZ0JBQWdCLEVBQUUsNEJBQTRCO2dCQUM5QyxZQUFZLEVBQUUsYUFBYTthQUM5QixDQUFDLENBQUMsQ0FBQztZQUVKLGtEQUFrRDtZQUNsRCxPQUFPO2dCQUNILEVBQUUsRUFBRSwrQkFBK0IsQ0FBQyxFQUFFO2dCQUN0QywwQkFBMEIsRUFBRSwrQkFBK0IsQ0FBQywwQkFBMEI7YUFDekYsQ0FBQTtTQUNKO2FBQU07WUFDSCxNQUFNLFlBQVksR0FBRyxpREFBaUQsQ0FBQztZQUN2RSxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRTFCLE9BQU87Z0JBQ0gsWUFBWSxFQUFFLFlBQVk7Z0JBQzFCLFNBQVMsRUFBRSwrQ0FBNkIsQ0FBQyxZQUFZO2FBQ3hELENBQUE7U0FDSjtLQUNKO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDVixNQUFNLFlBQVksR0FBRyx3RUFBd0UsR0FBRyxFQUFFLENBQUM7UUFDbkcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMxQixPQUFPO1lBQ0gsWUFBWSxFQUFFLFlBQVk7WUFDMUIsU0FBUyxFQUFFLCtDQUE2QixDQUFDLGVBQWU7U0FDM0QsQ0FBQTtLQUNKO0FBQ0wsQ0FBQyxDQUFBO0FBdEVZLFFBQUEsZ0NBQWdDLG9DQXNFNUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0R5bmFtb0RCQ2xpZW50LCBHZXRJdGVtQ29tbWFuZCwgVXBkYXRlSXRlbUNvbW1hbmR9IGZyb20gXCJAYXdzLXNkay9jbGllbnQtZHluYW1vZGJcIjtcbmltcG9ydCB7XG4gICAgTWlsaXRhcnlWZXJpZmljYXRpb25FcnJvclR5cGUsXG4gICAgVXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dCxcbiAgICBVcGRhdGVNaWxpdGFyeVZlcmlmaWNhdGlvblJlc3BvbnNlLFxufSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuXG4vKipcbiAqIFVwZGF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzIHJlc29sdmVyXG4gKlxuICogQHBhcmFtIHVwZGF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQgbWlsaXRhcnkgdmVyaWZpY2F0aW9uIGlucHV0LCB1c2VkIHRvIHVwZGF0ZSBhbiBleGlzdGVudCBvbmVcbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgVXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25SZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IHVwZGF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzID0gYXN5bmMgKHVwZGF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQ6IFVwZGF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQpOiBQcm9taXNlPFVwZGF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVzcG9uc2U+ID0+IHtcbiAgICB0cnkge1xuICAgICAgICAvLyByZXRyaWV2aW5nIHRoZSBjdXJyZW50IGZ1bmN0aW9uIHJlZ2lvblxuICAgICAgICBjb25zdCByZWdpb24gPSBwcm9jZXNzLmVudi5BV1NfUkVHSU9OITtcblxuICAgICAgICAvLyBpbml0aWFsaXppbmcgdGhlIER5bmFtb0RCIGRvY3VtZW50IGNsaWVudFxuICAgICAgICBjb25zdCBkeW5hbW9EYkNsaWVudCA9IG5ldyBEeW5hbW9EQkNsaWVudCh7cmVnaW9uOiByZWdpb259KTtcblxuICAgICAgICAvLyB1cGRhdGUgdGhlIHRpbWVzdGFtcHMgYWNjb3JkaW5nbHlcbiAgICAgICAgY29uc3QgdXBkYXRlZEF0ID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgICAgICB1cGRhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0LnVwZGF0ZWRBdCA9IHVwZGF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQudXBkYXRlZEF0ID8gdXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dC51cGRhdGVkQXQgOiB1cGRhdGVkQXQ7XG5cbiAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZXJlIGlzIGEgbWlsaXRhcnkgdmVyaWZpY2F0aW9uIG9iamVjdCB0byB1cGRhdGUuIElmIHRoZXJlJ3Mgbm9uZSwgdGhlbiByZXR1cm4gYW4gZXJyb3IgYWNjb3JkaW5nbHkuXG4gICAgICAgIGNvbnN0IHByZUV4aXN0aW5nVmVyaWZpY2F0aW9uT2JqZWN0ID0gIGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IEdldEl0ZW1Db21tYW5kKHtcbiAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuTUlMSVRBUllfVkVSSUZJQ0FUSU9OX1RBQkxFISxcbiAgICAgICAgICAgIEtleToge1xuICAgICAgICAgICAgICAgIGlkOiB7XG4gICAgICAgICAgICAgICAgICAgIFM6IHVwZGF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQuaWRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKTtcblxuICAgICAgICAvLyBpZiB0aGVyZSBpcyBhbiBpdGVtIHJldHJpZXZlZCB0byBiZSB1cGRhdGVkLCB0aGVuIHdlIHByb2NlZWQgYWNjb3JkaW5nbHkuIE90aGVyd2lzZSwgd2UgdGhyb3cgYW4gZXJyb3IuXG4gICAgICAgIGlmIChwcmVFeGlzdGluZ1ZlcmlmaWNhdGlvbk9iamVjdCAmJiBwcmVFeGlzdGluZ1ZlcmlmaWNhdGlvbk9iamVjdC5JdGVtKSB7XG4gICAgICAgICAgICAvLyB1cGRhdGUgdGhlIG1pbGl0YXJ5IHZlcmlmaWNhdGlvbiBvYmplY3QgYmFzZWQgb24gdGhlIHBhc3NlZCBpbiBvYmplY3RcbiAgICAgICAgICAgIGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IFVwZGF0ZUl0ZW1Db21tYW5kKHtcbiAgICAgICAgICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52Lk1JTElUQVJZX1ZFUklGSUNBVElPTl9UQUJMRSEsXG4gICAgICAgICAgICAgICAgS2V5OiB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTOiB1cGRhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0LmlkXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lczoge1xuICAgICAgICAgICAgICAgICAgICBcIiNNVlNcIjogXCJtaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1wiLFxuICAgICAgICAgICAgICAgICAgICBcIiNVQVwiOiBcInVwZGF0ZWRBdFwiXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBFeHByZXNzaW9uQXR0cmlidXRlVmFsdWVzOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiOm12c1wiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTOiB1cGRhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0Lm1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIFwiOnVhXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IHVwZGF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQudXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIFVwZGF0ZUV4cHJlc3Npb246IFwiU0VUICNNVlMgPSA6bXZzLCAjVUEgPSA6dWFcIixcbiAgICAgICAgICAgICAgICBSZXR1cm5WYWx1ZXM6IFwiVVBEQVRFRF9ORVdcIlxuICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICAvLyByZXR1cm4gdGhlIHVwZGF0ZWQgbWlsaXRhcnkgdmVyaWZpY2F0aW9uIHN0YXR1c1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBpZDogdXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dC5pZCxcbiAgICAgICAgICAgICAgICBtaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1czogdXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dC5taWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVua25vd24gbWlsaXRhcnkgdmVyaWZpY2F0aW9uIG9iamVjdCB0byB1cGRhdGUhYDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBNaWxpdGFyeVZlcmlmaWNhdGlvbkVycm9yVHlwZS5Ob25lT3JBYnNlbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgY3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb24gbXV0YXRpb24gJHtlcnJ9YDtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBNaWxpdGFyeVZlcmlmaWNhdGlvbkVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==