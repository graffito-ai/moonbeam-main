"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTransaction = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * UpdateTransaction resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param updateTransactionInput update transaction input, used to update an existent transaction
 * @returns {@link Promise} of {@link MoonbeamUpdatedTransactionResponse}
 */
const updateTransaction = async (fieldName, updateTransactionInput) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        // initializing the DynamoDB document client
        const dynamoDbClient = new client_dynamodb_1.DynamoDBClient({ region: region });
        // update the timestamps accordingly
        const updatedAt = new Date().toISOString();
        updateTransactionInput.updatedAt = updateTransactionInput.updatedAt ? updateTransactionInput.updatedAt : updatedAt;
        // check to see if there is a transaction object to update. If there's none, then return an error accordingly.
        const preExistingTransactionObject = await dynamoDbClient.send(new client_dynamodb_1.GetItemCommand({
            TableName: process.env.TRANSACTIONS_TABLE,
            Key: {
                id: {
                    S: updateTransactionInput.id
                },
                timestamp: {
                    N: updateTransactionInput.timestamp.toString()
                }
            }
        }));
        // if there is an item retrieved to be updated, then we proceed accordingly. Otherwise, we throw an error.
        if (preExistingTransactionObject && preExistingTransactionObject.Item) {
            // update the transaction object based on the passed in object - for now only containing the status details
            await dynamoDbClient.send(new client_dynamodb_1.UpdateItemCommand({
                TableName: process.env.TRANSACTIONS_TABLE,
                Key: {
                    id: {
                        S: updateTransactionInput.id
                    },
                    timestamp: {
                        N: updateTransactionInput.timestamp.toString()
                    }
                },
                ExpressionAttributeNames: {
                    "#tstat": "transactionStatus",
                    "#uat": "updatedAt"
                },
                ExpressionAttributeValues: {
                    ":stat": {
                        S: updateTransactionInput.transactionStatus
                    },
                    ":at": {
                        S: updateTransactionInput.updatedAt
                    }
                },
                UpdateExpression: "SET #tstat = :stat, #uat = :at",
                ReturnValues: "UPDATED_NEW"
            }));
            // return the updated transaction details
            return {
                data: {
                    id: updateTransactionInput.id,
                    timestamp: updateTransactionInput.timestamp,
                    transactionId: updateTransactionInput.transactionId,
                    transactionStatus: updateTransactionInput.transactionStatus,
                    updatedAt: updateTransactionInput.updatedAt
                }
            };
        }
        else {
            const errorMessage = `Unknown transaction object to update!`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.TransactionsErrorType.NoneOrAbsent
            };
        }
    }
    catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} mutation ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: moonbeam_models_1.TransactionsErrorType.UnexpectedError
        };
    }
};
exports.updateTransaction = updateTransaction;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXBkYXRlVHJhbnNhY3Rpb25SZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL1VwZGF0ZVRyYW5zYWN0aW9uUmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsOERBQTJGO0FBQzNGLCtEQUltQztBQUVuQzs7Ozs7O0dBTUc7QUFDSSxNQUFNLGlCQUFpQixHQUFHLEtBQUssRUFBRSxTQUFpQixFQUFFLHNCQUE4QyxFQUErQyxFQUFFO0lBQ3RKLElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsNENBQTRDO1FBQzVDLE1BQU0sY0FBYyxHQUFHLElBQUksZ0NBQWMsQ0FBQyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBRTVELG9DQUFvQztRQUNwQyxNQUFNLFNBQVMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzNDLHNCQUFzQixDQUFDLFNBQVMsR0FBRyxzQkFBc0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLHNCQUFzQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBRW5ILDhHQUE4RztRQUM5RyxNQUFNLDRCQUE0QixHQUFHLE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLGdDQUFjLENBQUM7WUFDOUUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQW1CO1lBQzFDLEdBQUcsRUFBRTtnQkFDRCxFQUFFLEVBQUU7b0JBQ0EsQ0FBQyxFQUFFLHNCQUFzQixDQUFDLEVBQUU7aUJBQy9CO2dCQUNELFNBQVMsRUFBRTtvQkFDUCxDQUFDLEVBQUUsc0JBQXNCLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRTtpQkFDakQ7YUFDSjtTQUNKLENBQUMsQ0FBQyxDQUFDO1FBRUosMEdBQTBHO1FBQzFHLElBQUksNEJBQTRCLElBQUksNEJBQTRCLENBQUMsSUFBSSxFQUFFO1lBQ25FLDJHQUEyRztZQUMzRyxNQUFNLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxtQ0FBaUIsQ0FBQztnQkFDNUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQW1CO2dCQUMxQyxHQUFHLEVBQUU7b0JBQ0QsRUFBRSxFQUFFO3dCQUNBLENBQUMsRUFBRSxzQkFBc0IsQ0FBQyxFQUFFO3FCQUMvQjtvQkFDRCxTQUFTLEVBQUU7d0JBQ1AsQ0FBQyxFQUFFLHNCQUFzQixDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUU7cUJBQ2pEO2lCQUNKO2dCQUNELHdCQUF3QixFQUFFO29CQUN0QixRQUFRLEVBQUUsbUJBQW1CO29CQUM3QixNQUFNLEVBQUUsV0FBVztpQkFDdEI7Z0JBQ0QseUJBQXlCLEVBQUU7b0JBQ3ZCLE9BQU8sRUFBRTt3QkFDTCxDQUFDLEVBQUUsc0JBQXNCLENBQUMsaUJBQWlCO3FCQUM5QztvQkFDRCxLQUFLLEVBQUU7d0JBQ0gsQ0FBQyxFQUFFLHNCQUFzQixDQUFDLFNBQVM7cUJBQ3RDO2lCQUNKO2dCQUNELGdCQUFnQixFQUFFLGdDQUFnQztnQkFDbEQsWUFBWSxFQUFFLGFBQWE7YUFDOUIsQ0FBQyxDQUFDLENBQUM7WUFFSix5Q0FBeUM7WUFDekMsT0FBTztnQkFDSCxJQUFJLEVBQUU7b0JBQ0YsRUFBRSxFQUFFLHNCQUFzQixDQUFDLEVBQUU7b0JBQzdCLFNBQVMsRUFBRSxzQkFBc0IsQ0FBQyxTQUFTO29CQUMzQyxhQUFhLEVBQUUsc0JBQXNCLENBQUMsYUFBYTtvQkFDbkQsaUJBQWlCLEVBQUUsc0JBQXNCLENBQUMsaUJBQWlCO29CQUMzRCxTQUFTLEVBQUUsc0JBQXNCLENBQUMsU0FBUztpQkFDOUM7YUFDSixDQUFBO1NBQ0o7YUFBTTtZQUNILE1BQU0sWUFBWSxHQUFHLHVDQUF1QyxDQUFDO1lBQzdELE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7WUFFMUIsT0FBTztnQkFDSCxZQUFZLEVBQUUsWUFBWTtnQkFDMUIsU0FBUyxFQUFFLHVDQUFxQixDQUFDLFlBQVk7YUFDaEQsQ0FBQTtTQUNKO0tBQ0o7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNWLE1BQU0sWUFBWSxHQUFHLG9DQUFvQyxTQUFTLGFBQWEsR0FBRyxFQUFFLENBQUM7UUFDckYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMxQixPQUFPO1lBQ0gsWUFBWSxFQUFFLFlBQVk7WUFDMUIsU0FBUyxFQUFFLHVDQUFxQixDQUFDLGVBQWU7U0FDbkQsQ0FBQTtLQUNKO0FBQ0wsQ0FBQyxDQUFBO0FBakZZLFFBQUEsaUJBQWlCLHFCQWlGN0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0R5bmFtb0RCQ2xpZW50LCBHZXRJdGVtQ29tbWFuZCwgVXBkYXRlSXRlbUNvbW1hbmR9IGZyb20gXCJAYXdzLXNkay9jbGllbnQtZHluYW1vZGJcIjtcbmltcG9ydCB7XG4gICAgTW9vbmJlYW1VcGRhdGVkVHJhbnNhY3Rpb25SZXNwb25zZSxcbiAgICBUcmFuc2FjdGlvbnNFcnJvclR5cGUsXG4gICAgVXBkYXRlVHJhbnNhY3Rpb25JbnB1dCxcbn0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcblxuLyoqXG4gKiBVcGRhdGVUcmFuc2FjdGlvbiByZXNvbHZlclxuICpcbiAqIEBwYXJhbSBmaWVsZE5hbWUgbmFtZSBvZiB0aGUgcmVzb2x2ZXIgcGF0aCBmcm9tIHRoZSBBcHBTeW5jIGV2ZW50XG4gKiBAcGFyYW0gdXBkYXRlVHJhbnNhY3Rpb25JbnB1dCB1cGRhdGUgdHJhbnNhY3Rpb24gaW5wdXQsIHVzZWQgdG8gdXBkYXRlIGFuIGV4aXN0ZW50IHRyYW5zYWN0aW9uXG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIE1vb25iZWFtVXBkYXRlZFRyYW5zYWN0aW9uUmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCB1cGRhdGVUcmFuc2FjdGlvbiA9IGFzeW5jIChmaWVsZE5hbWU6IHN0cmluZywgdXBkYXRlVHJhbnNhY3Rpb25JbnB1dDogVXBkYXRlVHJhbnNhY3Rpb25JbnB1dCk6IFByb21pc2U8TW9vbmJlYW1VcGRhdGVkVHJhbnNhY3Rpb25SZXNwb25zZT4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgIC8vIGluaXRpYWxpemluZyB0aGUgRHluYW1vREIgZG9jdW1lbnQgY2xpZW50XG4gICAgICAgIGNvbnN0IGR5bmFtb0RiQ2xpZW50ID0gbmV3IER5bmFtb0RCQ2xpZW50KHtyZWdpb246IHJlZ2lvbn0pO1xuXG4gICAgICAgIC8vIHVwZGF0ZSB0aGUgdGltZXN0YW1wcyBhY2NvcmRpbmdseVxuICAgICAgICBjb25zdCB1cGRhdGVkQXQgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgICAgIHVwZGF0ZVRyYW5zYWN0aW9uSW5wdXQudXBkYXRlZEF0ID0gdXBkYXRlVHJhbnNhY3Rpb25JbnB1dC51cGRhdGVkQXQgPyB1cGRhdGVUcmFuc2FjdGlvbklucHV0LnVwZGF0ZWRBdCA6IHVwZGF0ZWRBdDtcblxuICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlcmUgaXMgYSB0cmFuc2FjdGlvbiBvYmplY3QgdG8gdXBkYXRlLiBJZiB0aGVyZSdzIG5vbmUsIHRoZW4gcmV0dXJuIGFuIGVycm9yIGFjY29yZGluZ2x5LlxuICAgICAgICBjb25zdCBwcmVFeGlzdGluZ1RyYW5zYWN0aW9uT2JqZWN0ID0gYXdhaXQgZHluYW1vRGJDbGllbnQuc2VuZChuZXcgR2V0SXRlbUNvbW1hbmQoe1xuICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5UUkFOU0FDVElPTlNfVEFCTEUhLFxuICAgICAgICAgICAgS2V5OiB7XG4gICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgUzogdXBkYXRlVHJhbnNhY3Rpb25JbnB1dC5pZFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGltZXN0YW1wOiB7XG4gICAgICAgICAgICAgICAgICAgIE46IHVwZGF0ZVRyYW5zYWN0aW9uSW5wdXQudGltZXN0YW1wLnRvU3RyaW5nKClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKTtcblxuICAgICAgICAvLyBpZiB0aGVyZSBpcyBhbiBpdGVtIHJldHJpZXZlZCB0byBiZSB1cGRhdGVkLCB0aGVuIHdlIHByb2NlZWQgYWNjb3JkaW5nbHkuIE90aGVyd2lzZSwgd2UgdGhyb3cgYW4gZXJyb3IuXG4gICAgICAgIGlmIChwcmVFeGlzdGluZ1RyYW5zYWN0aW9uT2JqZWN0ICYmIHByZUV4aXN0aW5nVHJhbnNhY3Rpb25PYmplY3QuSXRlbSkge1xuICAgICAgICAgICAgLy8gdXBkYXRlIHRoZSB0cmFuc2FjdGlvbiBvYmplY3QgYmFzZWQgb24gdGhlIHBhc3NlZCBpbiBvYmplY3QgLSBmb3Igbm93IG9ubHkgY29udGFpbmluZyB0aGUgc3RhdHVzIGRldGFpbHNcbiAgICAgICAgICAgIGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IFVwZGF0ZUl0ZW1Db21tYW5kKHtcbiAgICAgICAgICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52LlRSQU5TQUNUSU9OU19UQUJMRSEsXG4gICAgICAgICAgICAgICAgS2V5OiB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTOiB1cGRhdGVUcmFuc2FjdGlvbklucHV0LmlkXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgTjogdXBkYXRlVHJhbnNhY3Rpb25JbnB1dC50aW1lc3RhbXAudG9TdHJpbmcoKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBFeHByZXNzaW9uQXR0cmlidXRlTmFtZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCIjdHN0YXRcIjogXCJ0cmFuc2FjdGlvblN0YXR1c1wiLFxuICAgICAgICAgICAgICAgICAgICBcIiN1YXRcIjogXCJ1cGRhdGVkQXRcIlxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlczoge1xuICAgICAgICAgICAgICAgICAgICBcIjpzdGF0XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IHVwZGF0ZVRyYW5zYWN0aW9uSW5wdXQudHJhbnNhY3Rpb25TdGF0dXNcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgXCI6YXRcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogdXBkYXRlVHJhbnNhY3Rpb25JbnB1dC51cGRhdGVkQXRcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgVXBkYXRlRXhwcmVzc2lvbjogXCJTRVQgI3RzdGF0ID0gOnN0YXQsICN1YXQgPSA6YXRcIixcbiAgICAgICAgICAgICAgICBSZXR1cm5WYWx1ZXM6IFwiVVBEQVRFRF9ORVdcIlxuICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICAvLyByZXR1cm4gdGhlIHVwZGF0ZWQgdHJhbnNhY3Rpb24gZGV0YWlsc1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiB1cGRhdGVUcmFuc2FjdGlvbklucHV0LmlkLFxuICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IHVwZGF0ZVRyYW5zYWN0aW9uSW5wdXQudGltZXN0YW1wLFxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbklkOiB1cGRhdGVUcmFuc2FjdGlvbklucHV0LnRyYW5zYWN0aW9uSWQsXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uU3RhdHVzOiB1cGRhdGVUcmFuc2FjdGlvbklucHV0LnRyYW5zYWN0aW9uU3RhdHVzLFxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVkQXQ6IHVwZGF0ZVRyYW5zYWN0aW9uSW5wdXQudXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVua25vd24gdHJhbnNhY3Rpb24gb2JqZWN0IHRvIHVwZGF0ZSFgO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5Ob25lT3JBYnNlbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgJHtmaWVsZE5hbWV9IG11dGF0aW9uICR7ZXJyfWA7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICB9XG4gICAgfVxufVxuIl19