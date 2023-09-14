"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMilitaryVerificationStatus = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * UpdateMilitaryVerificationStatus resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param updateMilitaryVerificationInput military verification input, used to update an existent one
 * @returns {@link Promise} of {@link UpdateMilitaryVerificationResponse}
 */
const updateMilitaryVerificationStatus = async (fieldName, updateMilitaryVerificationInput) => {
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
            /**
             * once the military verification status has been successfully updated, send a notification accordingly,
             * by triggering the military verification update producer accordingly.
             *
             * call the POST/militaryVerificationUpdatesAcknowledgment Moonbeam internal endpoint
             */
            const response = await new moonbeam_models_1.MoonbeamClient(process.env.ENV_NAME, region).militaryVerificationUpdatesAcknowledgment({
                id: updateMilitaryVerificationInput.id,
                newMilitaryVerificationStatus: updateMilitaryVerificationInput.militaryVerificationStatus,
                originalMilitaryVerificationStatus: preExistingVerificationObject.Item.militaryVerificationStatus.S,
                addressLine: preExistingVerificationObject.Item.addressLine.S,
                city: preExistingVerificationObject.Item.city.S,
                dateOfBirth: preExistingVerificationObject.Item.dateOfBirth.S,
                enlistmentYear: preExistingVerificationObject.Item.enlistmentYear.S,
                firstName: preExistingVerificationObject.Item.firstName.S,
                lastName: preExistingVerificationObject.Item.lastName.S,
                state: preExistingVerificationObject.Item.state.S,
                zipCode: preExistingVerificationObject.Item.zipCode.S,
            });
            // check to see if the military verification update acknowledgment call was executed successfully
            if (response.statusCode === 202 && response.body !== null && response.body !== undefined &&
                response.body === "Military verification update acknowledged!") {
                console.log(`Successfully acknowledged military verification status update for user - ${updateMilitaryVerificationInput.id}!`);
                // return the updated military verification status
                return {
                    id: updateMilitaryVerificationInput.id,
                    militaryVerificationStatus: updateMilitaryVerificationInput.militaryVerificationStatus
                };
            }
            else {
                // for military status updates which won't trigger a notification, acknowledge that but don't return an error
                if (response.statusCode === 400 && response.body !== null && response.body !== undefined &&
                    response.body.includes("Invalid military verification status transition for notification process to get triggered!")) {
                    console.log(`Not necessary to acknowledge the military verification status update for user - ${updateMilitaryVerificationInput.id}!`);
                    // return the updated military verification status
                    return {
                        id: updateMilitaryVerificationInput.id,
                        militaryVerificationStatus: updateMilitaryVerificationInput.militaryVerificationStatus
                    };
                }
                else {
                    /**
                     * for any users which the military verification status update has not been acknowledged for, return the errors accordingly.
                     */
                    const errorMessage = `Unexpected response structure returned from the military verification status update acknowledgment call!`;
                    console.log(`${errorMessage} ${response && JSON.stringify(response)}`);
                    return {
                        errorMessage: errorMessage,
                        errorType: moonbeam_models_1.MilitaryVerificationErrorType.UnexpectedError
                    };
                }
            }
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
        const errorMessage = `Unexpected error while executing ${fieldName} mutation ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: moonbeam_models_1.MilitaryVerificationErrorType.UnexpectedError
        };
    }
};
exports.updateMilitaryVerificationStatus = updateMilitaryVerificationStatus;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNSZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL1VwZGF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzUmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsOERBQTJGO0FBQzNGLCtEQUttQztBQUduQzs7Ozs7O0dBTUc7QUFDSSxNQUFNLGdDQUFnQyxHQUFHLEtBQUssRUFBRSxTQUFpQixFQUFFLCtCQUFnRSxFQUErQyxFQUFFO0lBQ3ZMLElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsNENBQTRDO1FBQzVDLE1BQU0sY0FBYyxHQUFHLElBQUksZ0NBQWMsQ0FBQyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBRTVELG9DQUFvQztRQUNwQyxNQUFNLFNBQVMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzNDLCtCQUErQixDQUFDLFNBQVMsR0FBRywrQkFBK0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLCtCQUErQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBRTlJLHdIQUF3SDtRQUN4SCxNQUFNLDZCQUE2QixHQUFHLE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLGdDQUFjLENBQUM7WUFDL0UsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsMkJBQTRCO1lBQ25ELEdBQUcsRUFBRTtnQkFDRCxFQUFFLEVBQUU7b0JBQ0EsQ0FBQyxFQUFFLCtCQUErQixDQUFDLEVBQUU7aUJBQ3hDO2FBQ0o7U0FDSixDQUFDLENBQUMsQ0FBQztRQUVKLDBHQUEwRztRQUMxRyxJQUFJLDZCQUE2QixJQUFJLDZCQUE2QixDQUFDLElBQUksRUFB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QStCLENBQUMsMEJBQTBCO3FCQUN6RixDQUFBO2lCQUNKO3FCQUFNO29CQUNIOzt1QkFFRztvQkFDSCxNQUFNLFlBQVksR0FBRywwR0FBMEcsQ0FBQztvQkFDaEksT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFlBQVksSUFBSSxRQUFRLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBRXZFLE9BQU87d0JBQ0gsWUFBWSxFQUFFLFlBQVk7d0JBQzFCLFNBQVMsRUFBRSwrQ0FBNkIsQ0FBQyxlQUFlO3FCQUMzRCxDQUFBO2lCQUNKO2FBQ0o7U0FDSjthQUFNO1lBQ0gsTUFBTSxZQUFZLEdBQUcsaURBQWlELENBQUM7WUFDdkUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUUxQixPQUFPO2dCQUNILFlBQVksRUFBRSxZQUFZO2dCQUMxQixTQUFTLEVBQUUsK0NBQTZCLENBQUMsWUFBWTthQUN4RCxDQUFBO1NBQ0o7S0FDSjtJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1YsTUFBTSxZQUFZLEdBQUcsb0NBQW9DLFNBQVMsYUFBYSxHQUFHLEVBQUUsQ0FBQztRQUNyRixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzFCLE9BQU87WUFDSCxZQUFZLEVBQUUsWUFBWTtZQUMxQixTQUFTLEVBQUUsK0NBQTZCLENBQUMsZUFBZTtTQUMzRCxDQUFBO0tBQ0o7QUFDTCxDQUFDLENBQUE7QUF2SFksUUFBQSxnQ0FBZ0Msb0NBdUg1QyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RHluYW1vREJDbGllbnQsIEdldEl0ZW1Db21tYW5kLCBVcGRhdGVJdGVtQ29tbWFuZH0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1keW5hbW9kYlwiO1xuaW1wb3J0IHtcbiAgICBNaWxpdGFyeVZlcmlmaWNhdGlvbkVycm9yVHlwZSwgTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNUeXBlLFxuICAgIE1vb25iZWFtQ2xpZW50LFxuICAgIFVwZGF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQsXG4gICAgVXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25SZXNwb25zZSxcbn0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcbmltcG9ydCB7QVBJR2F0ZXdheVByb3h5UmVzdWx0fSBmcm9tIFwiYXdzLWxhbWJkYVwiO1xuXG4vKipcbiAqIFVwZGF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzIHJlc29sdmVyXG4gKlxuICogQHBhcmFtIGZpZWxkTmFtZSBuYW1lIG9mIHRoZSByZXNvbHZlciBwYXRoIGZyb20gdGhlIEFwcFN5bmMgZXZlbnRcbiAqIEBwYXJhbSB1cGRhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0IG1pbGl0YXJ5IHZlcmlmaWNhdGlvbiBpbnB1dCwgdXNlZCB0byB1cGRhdGUgYW4gZXhpc3RlbnQgb25lXG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIFVwZGF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCB1cGRhdGVNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1cyA9IGFzeW5jIChmaWVsZE5hbWU6IHN0cmluZywgdXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dDogVXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dCk6IFByb21pc2U8VXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25SZXNwb25zZT4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgIC8vIGluaXRpYWxpemluZyB0aGUgRHluYW1vREIgZG9jdW1lbnQgY2xpZW50XG4gICAgICAgIGNvbnN0IGR5bmFtb0RiQ2xpZW50ID0gbmV3IER5bmFtb0RCQ2xpZW50KHtyZWdpb246IHJlZ2lvbn0pO1xuXG4gICAgICAgIC8vIHVwZGF0ZSB0aGUgdGltZXN0YW1wcyBhY2NvcmRpbmdseVxuICAgICAgICBjb25zdCB1cGRhdGVkQXQgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgICAgIHVwZGF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQudXBkYXRlZEF0ID0gdXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dC51cGRhdGVkQXQgPyB1cGRhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0LnVwZGF0ZWRBdCA6IHVwZGF0ZWRBdDtcblxuICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlcmUgaXMgYSBtaWxpdGFyeSB2ZXJpZmljYXRpb24gb2JqZWN0IHRvIHVwZGF0ZS4gSWYgdGhlcmUncyBub25lLCB0aGVuIHJldHVybiBhbiBlcnJvciBhY2NvcmRpbmdseS5cbiAgICAgICAgY29uc3QgcHJlRXhpc3RpbmdWZXJpZmljYXRpb25PYmplY3QgPSBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBHZXRJdGVtQ29tbWFuZCh7XG4gICAgICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52Lk1JTElUQVJZX1ZFUklGSUNBVElPTl9UQUJMRSEsXG4gICAgICAgICAgICBLZXk6IHtcbiAgICAgICAgICAgICAgICBpZDoge1xuICAgICAgICAgICAgICAgICAgICBTOiB1cGRhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0LmlkXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG5cbiAgICAgICAgLy8gaWYgdGhlcmUgaXMgYW4gaXRlbSByZXRyaWV2ZWQgdG8gYmUgdXBkYXRlZCwgdGhlbiB3ZSBwcm9jZWVkIGFjY29yZGluZ2x5LiBPdGhlcndpc2UsIHdlIHRocm93IGFuIGVycm9yLlxuICAgICAgICBpZiAocHJlRXhpc3RpbmdWZXJpZmljYXRpb25PYmplY3QgJiYgcHJlRXhpc3RpbmdWZXJpZmljYXRpb25PYmplY3QuSXRlbSkge1xuICAgICAgICAgICAgLy8gdXBkYXRlIHRoZSBtaWxpdGFyeSB2ZXJpZmljYXRpb24gb2JqZWN0IGJhc2VkIG9uIHRoZSBwYXNzZWQgaW4gb2JqZWN0XG4gICAgICAgICAgICBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBVcGRhdGVJdGVtQ29tbWFuZCh7XG4gICAgICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5NSUxJVEFSWV9WRVJJRklDQVRJT05fVEFCTEUhLFxuICAgICAgICAgICAgICAgIEtleToge1xuICAgICAgICAgICAgICAgICAgICBpZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogdXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dC5pZFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBFeHByZXNzaW9uQXR0cmlidXRlTmFtZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCIjTVZTXCI6IFwibWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNcIixcbiAgICAgICAgICAgICAgICAgICAgXCIjVUFcIjogXCJ1cGRhdGVkQXRcIlxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlczoge1xuICAgICAgICAgICAgICAgICAgICBcIjptdnNcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogdXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dC5taWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBcIjp1YVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTOiB1cGRhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0LnVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBVcGRhdGVFeHByZXNzaW9uOiBcIlNFVCAjTVZTID0gOm12cywgI1VBID0gOnVhXCIsXG4gICAgICAgICAgICAgICAgUmV0dXJuVmFsdWVzOiBcIlVQREFURURfTkVXXCJcbiAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBvbmNlIHRoZSBtaWxpdGFyeSB2ZXJpZmljYXRpb24gc3RhdHVzIGhhcyBiZWVuIHN1Y2Nlc3NmdWxseSB1cGRhdGVkLCBzZW5kIGEgbm90aWZpY2F0aW9uIGFjY29yZGluZ2x5LFxuICAgICAgICAgICAgICogYnkgdHJpZ2dlcmluZyB0aGUgbWlsaXRhcnkgdmVyaWZpY2F0aW9uIHVwZGF0ZSBwcm9kdWNlciBhY2NvcmRpbmdseS5cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBjYWxsIHRoZSBQT1NUL21pbGl0YXJ5VmVyaWZpY2F0aW9uVXBkYXRlc0Fja25vd2xlZGdtZW50IE1vb25iZWFtIGludGVybmFsIGVuZHBvaW50XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlOiBBUElHYXRld2F5UHJveHlSZXN1bHQgPSBhd2FpdCBuZXcgTW9vbmJlYW1DbGllbnQocHJvY2Vzcy5lbnYuRU5WX05BTUUhLCByZWdpb24pLm1pbGl0YXJ5VmVyaWZpY2F0aW9uVXBkYXRlc0Fja25vd2xlZGdtZW50KHtcbiAgICAgICAgICAgICAgICBpZDogdXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dC5pZCxcbiAgICAgICAgICAgICAgICBuZXdNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1czogdXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dC5taWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1cyxcbiAgICAgICAgICAgICAgICBvcmlnaW5hbE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzOiBwcmVFeGlzdGluZ1ZlcmlmaWNhdGlvbk9iamVjdC5JdGVtLm1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzLlMhIGFzIE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZSxcbiAgICAgICAgICAgICAgICBhZGRyZXNzTGluZTogcHJlRXhpc3RpbmdWZXJpZmljYXRpb25PYmplY3QuSXRlbS5hZGRyZXNzTGluZS5TISxcbiAgICAgICAgICAgICAgICBjaXR5OiBwcmVFeGlzdGluZ1ZlcmlmaWNhdGlvbk9iamVjdC5JdGVtLmNpdHkuUyEsXG4gICAgICAgICAgICAgICAgZGF0ZU9mQmlydGg6IHByZUV4aXN0aW5nVmVyaWZpY2F0aW9uT2JqZWN0Lkl0ZW0uZGF0ZU9mQmlydGguUyEsXG4gICAgICAgICAgICAgICAgZW5saXN0bWVudFllYXI6IHByZUV4aXN0aW5nVmVyaWZpY2F0aW9uT2JqZWN0Lkl0ZW0uZW5saXN0bWVudFllYXIuUyEsXG4gICAgICAgICAgICAgICAgZmlyc3ROYW1lOiBwcmVFeGlzdGluZ1ZlcmlmaWNhdGlvbk9iamVjdC5JdGVtLmZpcnN0TmFtZS5TISxcbiAgICAgICAgICAgICAgICBsYXN0TmFtZTogcHJlRXhpc3RpbmdWZXJpZmljYXRpb25PYmplY3QuSXRlbS5sYXN0TmFtZS5TISxcbiAgICAgICAgICAgICAgICBzdGF0ZTogcHJlRXhpc3RpbmdWZXJpZmljYXRpb25PYmplY3QuSXRlbS5zdGF0ZS5TISxcbiAgICAgICAgICAgICAgICB6aXBDb2RlOiBwcmVFeGlzdGluZ1ZlcmlmaWNhdGlvbk9iamVjdC5JdGVtLnppcENvZGUuUyEsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSBtaWxpdGFyeSB2ZXJpZmljYXRpb24gdXBkYXRlIGFja25vd2xlZGdtZW50IGNhbGwgd2FzIGV4ZWN1dGVkIHN1Y2Nlc3NmdWxseVxuICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1c0NvZGUgPT09IDIwMiAmJiByZXNwb25zZS5ib2R5ICE9PSBudWxsICYmIHJlc3BvbnNlLmJvZHkgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgICAgIHJlc3BvbnNlLmJvZHkgPT09IFwiTWlsaXRhcnkgdmVyaWZpY2F0aW9uIHVwZGF0ZSBhY2tub3dsZWRnZWQhXCIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgU3VjY2Vzc2Z1bGx5IGFja25vd2xlZGdlZCBtaWxpdGFyeSB2ZXJpZmljYXRpb24gc3RhdHVzIHVwZGF0ZSBmb3IgdXNlciAtICR7dXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dC5pZH0hYCk7XG5cbiAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIHVwZGF0ZWQgbWlsaXRhcnkgdmVyaWZpY2F0aW9uIHN0YXR1c1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiB1cGRhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0LmlkLFxuICAgICAgICAgICAgICAgICAgICBtaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1czogdXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dC5taWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gZm9yIG1pbGl0YXJ5IHN0YXR1cyB1cGRhdGVzIHdoaWNoIHdvbid0IHRyaWdnZXIgYSBub3RpZmljYXRpb24sIGFja25vd2xlZGdlIHRoYXQgYnV0IGRvbid0IHJldHVybiBhbiBlcnJvclxuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5zdGF0dXNDb2RlID09PSA0MDAgJiYgcmVzcG9uc2UuYm9keSAhPT0gbnVsbCAmJiByZXNwb25zZS5ib2R5ICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2UuYm9keS5pbmNsdWRlcyhcIkludmFsaWQgbWlsaXRhcnkgdmVyaWZpY2F0aW9uIHN0YXR1cyB0cmFuc2l0aW9uIGZvciBub3RpZmljYXRpb24gcHJvY2VzcyB0byBnZXQgdHJpZ2dlcmVkIVwiKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgTm90IG5lY2Vzc2FyeSB0byBhY2tub3dsZWRnZSB0aGUgbWlsaXRhcnkgdmVyaWZpY2F0aW9uIHN0YXR1cyB1cGRhdGUgZm9yIHVzZXIgLSAke3VwZGF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQuaWR9IWApO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgdXBkYXRlZCBtaWxpdGFyeSB2ZXJpZmljYXRpb24gc3RhdHVzXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogdXBkYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dC5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzOiB1cGRhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0Lm1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogZm9yIGFueSB1c2VycyB3aGljaCB0aGUgbWlsaXRhcnkgdmVyaWZpY2F0aW9uIHN0YXR1cyB1cGRhdGUgaGFzIG5vdCBiZWVuIGFja25vd2xlZGdlZCBmb3IsIHJldHVybiB0aGUgZXJyb3JzIGFjY29yZGluZ2x5LlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gdGhlIG1pbGl0YXJ5IHZlcmlmaWNhdGlvbiBzdGF0dXMgdXBkYXRlIGFja25vd2xlZGdtZW50IGNhbGwhYDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfSAke3Jlc3BvbnNlICYmIEpTT04uc3RyaW5naWZ5KHJlc3BvbnNlKX1gKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE1pbGl0YXJ5VmVyaWZpY2F0aW9uRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVua25vd24gbWlsaXRhcnkgdmVyaWZpY2F0aW9uIG9iamVjdCB0byB1cGRhdGUhYDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBNaWxpdGFyeVZlcmlmaWNhdGlvbkVycm9yVHlwZS5Ob25lT3JBYnNlbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgJHtmaWVsZE5hbWV9IG11dGF0aW9uICR7ZXJyfWA7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgIGVycm9yVHlwZTogTWlsaXRhcnlWZXJpZmljYXRpb25FcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=