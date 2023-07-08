"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransaction = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * CreateTransaction resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param createTransactionInput transaction input object, used to create a transaction based on an incoming
 * transaction event/message from SQS.
 * @returns {@link Promise} of {@link CardLinkResponse}
 */
const createTransaction = async (fieldName, createTransactionInput) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        // initializing the DynamoDB document client
        const dynamoDbClient = new client_dynamodb_1.DynamoDBClient({ region: region });
        /**
         * check to see if the transaction already exists in the DB. Although this is a very rare situation, since we have so many resilient
         * methods (such as Dead-Letter-Queue, retries, etc.) we want to put a safeguard around duplicates even here.
         */
        const preExistingTransaction = await dynamoDbClient.send(new client_dynamodb_1.GetItemCommand({
            TableName: process.env.TRANSACTIONS_TABLE,
            Key: {
                id: {
                    S: createTransactionInput.id
                },
                timestamp: {
                    N: createTransactionInput.timestamp.toString()
                }
            },
            /**
             * we're not interested in getting all the data for this call, just the minimum for us to determine whether this is a duplicate or not
             *
             * @link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html
             * @link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ExpressionAttributeNames.html
             */
            ProjectionExpression: '#idf, #t',
            ExpressionAttributeNames: {
                '#idf': 'id',
                '#t': 'timestamp'
            }
        }));
        // if there is an item retrieved, then we need to check its contents
        if (preExistingTransaction && preExistingTransaction.Item) {
            /**
             * if there is a pre-existing transaction with the same composite primary key (userId/id, timestamp) combination,
             * then we cannot duplicate that, so we will return an error.
             */
            const errorMessage = `Duplicate transaction found!`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.TransactionsErrorType.DuplicateObjectFound
            };
        }
        else {
            // store the transaction object
            await dynamoDbClient.send(new client_dynamodb_1.PutItemCommand({
                TableName: process.env.TRANSACTIONS_TABLE,
                Item: {
                    id: {
                        S: createTransactionInput.id
                    },
                    timestamp: {
                        N: createTransactionInput.timestamp.toString()
                    },
                    transactionId: {
                        S: createTransactionInput.transactionId
                    },
                    transactionStatus: {
                        S: createTransactionInput.transactionStatus
                    },
                    transactionType: {
                        S: createTransactionInput.transactionType
                    },
                    createdAt: {
                        S: createTransactionInput.createdAt
                    },
                    updatedAt: {
                        S: createTransactionInput.updatedAt
                    },
                    memberId: {
                        S: createTransactionInput.memberId
                    },
                    brandId: {
                        S: createTransactionInput.brandId
                    },
                    storeId: {
                        S: createTransactionInput.storeId
                    },
                    category: {
                        S: createTransactionInput.category
                    },
                    currencyCode: {
                        S: createTransactionInput.currencyCode
                    },
                    rewardAmount: {
                        N: createTransactionInput.rewardAmount.toString()
                    },
                    totalAmount: {
                        N: createTransactionInput.totalAmount.toString()
                    },
                    pendingCashbackAmount: {
                        N: createTransactionInput.pendingCashbackAmount.toString()
                    },
                    creditedCashbackAmount: {
                        N: createTransactionInput.creditedCashbackAmount.toString()
                    },
                    transactionBrandName: {
                        S: createTransactionInput.transactionBrandName
                    },
                    transactionBrandDescription: {
                        S: createTransactionInput.transactionBrandDescription
                    },
                    transactionBrandAddress: {
                        S: createTransactionInput.transactionBrandAddress
                    },
                    transactionBrandLogoUrl: {
                        S: createTransactionInput.transactionBrandLogoUrl
                    }
                },
            }));
            // return the transaction object
            return {
                id: createTransactionInput.id,
                data: createTransactionInput
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
exports.createTransaction = createTransaction;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXRlVHJhbnNhY3Rpb25SZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL0NyZWF0ZVRyYW5zYWN0aW9uUmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsOERBQXdGO0FBQ3hGLCtEQU1tQztBQUVuQzs7Ozs7OztHQU9HO0FBQ0ksTUFBTSxpQkFBaUIsR0FBRyxLQUFLLEVBQUUsU0FBaUIsRUFBRSxzQkFBOEMsRUFBd0MsRUFBRTtJQUMvSSxJQUFJO1FBQ0EseUNBQXlDO1FBQ3pDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVyxDQUFDO1FBRXZDLDRDQUE0QztRQUM1QyxNQUFNLGNBQWMsR0FBRyxJQUFJLGdDQUFjLENBQUMsRUFBQyxNQUFNLEVBQUUsTUFBTSxFQUFDLENBQUMsQ0FBQztRQUU1RDs7O1dBR0c7UUFDSCxNQUFNLHNCQUFzQixHQUFHLE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLGdDQUFjLENBQUM7WUFDeEUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQW1CO1lBQzFDLEdBQUcsRUFBRTtnQkFDRCxFQUFFLEVBQUU7b0JBQ0EsQ0FBQyxFQUFFLHNCQUFzQixDQUFDLEVBQUU7aUJBQy9CO2dCQUNELFNBQVMsRUFBRTtvQkFDUCxDQUFDLEVBQUUsc0JBQXNCLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRTtpQkFDakQ7YUFDSjtZQUNEOzs7OztlQUtHO1lBQ0gsb0JBQW9CLEVBQUUsVUFBVTtZQUNoQyx3QkFBd0IsRUFBRTtnQkFDdEIsTUFBTSxFQUFFLElBQUk7Z0JBQ1osSUFBSSxFQUFFLFdBQVc7YUFDcEI7U0FDSixDQUFDLENBQUMsQ0FBQztRQUVKLG9FQUFvRTtRQUNwRSxJQUFJLHNCQUFzQixJQUFJLHNCQUFzQixDQUFDLElBQUksRUFBRTtZQUN2RDs7O2VBR0c7WUFDSCxNQUFNLFlB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QWU7U0FDbkQsQ0FBQTtLQUNKO0FBQ0wsQ0FBQyxDQUFBO0FBbElZLFFBQUEsaUJBQWlCLHFCQWtJN0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0R5bmFtb0RCQ2xpZW50LCBHZXRJdGVtQ29tbWFuZCwgUHV0SXRlbUNvbW1hbmR9IGZyb20gXCJAYXdzLXNkay9jbGllbnQtZHluYW1vZGJcIjtcbmltcG9ydCB7XG4gICAgQ2FyZExpbmtSZXNwb25zZSxcbiAgICBDcmVhdGVUcmFuc2FjdGlvbklucHV0LFxuICAgIE1vb25iZWFtVHJhbnNhY3Rpb24sXG4gICAgTW9vbmJlYW1UcmFuc2FjdGlvblJlc3BvbnNlLFxuICAgIFRyYW5zYWN0aW9uc0Vycm9yVHlwZVxufSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuXG4vKipcbiAqIENyZWF0ZVRyYW5zYWN0aW9uIHJlc29sdmVyXG4gKlxuICogQHBhcmFtIGZpZWxkTmFtZSBuYW1lIG9mIHRoZSByZXNvbHZlciBwYXRoIGZyb20gdGhlIEFwcFN5bmMgZXZlbnRcbiAqIEBwYXJhbSBjcmVhdGVUcmFuc2FjdGlvbklucHV0IHRyYW5zYWN0aW9uIGlucHV0IG9iamVjdCwgdXNlZCB0byBjcmVhdGUgYSB0cmFuc2FjdGlvbiBiYXNlZCBvbiBhbiBpbmNvbWluZ1xuICogdHJhbnNhY3Rpb24gZXZlbnQvbWVzc2FnZSBmcm9tIFNRUy5cbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgQ2FyZExpbmtSZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IGNyZWF0ZVRyYW5zYWN0aW9uID0gYXN5bmMgKGZpZWxkTmFtZTogc3RyaW5nLCBjcmVhdGVUcmFuc2FjdGlvbklucHV0OiBDcmVhdGVUcmFuc2FjdGlvbklucHV0KTogUHJvbWlzZTxNb29uYmVhbVRyYW5zYWN0aW9uUmVzcG9uc2U+ID0+IHtcbiAgICB0cnkge1xuICAgICAgICAvLyByZXRyaWV2aW5nIHRoZSBjdXJyZW50IGZ1bmN0aW9uIHJlZ2lvblxuICAgICAgICBjb25zdCByZWdpb24gPSBwcm9jZXNzLmVudi5BV1NfUkVHSU9OITtcblxuICAgICAgICAvLyBpbml0aWFsaXppbmcgdGhlIER5bmFtb0RCIGRvY3VtZW50IGNsaWVudFxuICAgICAgICBjb25zdCBkeW5hbW9EYkNsaWVudCA9IG5ldyBEeW5hbW9EQkNsaWVudCh7cmVnaW9uOiByZWdpb259KTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogY2hlY2sgdG8gc2VlIGlmIHRoZSB0cmFuc2FjdGlvbiBhbHJlYWR5IGV4aXN0cyBpbiB0aGUgREIuIEFsdGhvdWdoIHRoaXMgaXMgYSB2ZXJ5IHJhcmUgc2l0dWF0aW9uLCBzaW5jZSB3ZSBoYXZlIHNvIG1hbnkgcmVzaWxpZW50XG4gICAgICAgICAqIG1ldGhvZHMgKHN1Y2ggYXMgRGVhZC1MZXR0ZXItUXVldWUsIHJldHJpZXMsIGV0Yy4pIHdlIHdhbnQgdG8gcHV0IGEgc2FmZWd1YXJkIGFyb3VuZCBkdXBsaWNhdGVzIGV2ZW4gaGVyZS5cbiAgICAgICAgICovXG4gICAgICAgIGNvbnN0IHByZUV4aXN0aW5nVHJhbnNhY3Rpb24gPSBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBHZXRJdGVtQ29tbWFuZCh7XG4gICAgICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52LlRSQU5TQUNUSU9OU19UQUJMRSEsXG4gICAgICAgICAgICBLZXk6IHtcbiAgICAgICAgICAgICAgICBpZDoge1xuICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVUcmFuc2FjdGlvbklucHV0LmlkXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IHtcbiAgICAgICAgICAgICAgICAgICAgTjogY3JlYXRlVHJhbnNhY3Rpb25JbnB1dC50aW1lc3RhbXAudG9TdHJpbmcoKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIHdlJ3JlIG5vdCBpbnRlcmVzdGVkIGluIGdldHRpbmcgYWxsIHRoZSBkYXRhIGZvciB0aGlzIGNhbGwsIGp1c3QgdGhlIG1pbmltdW0gZm9yIHVzIHRvIGRldGVybWluZSB3aGV0aGVyIHRoaXMgaXMgYSBkdXBsaWNhdGUgb3Igbm90XG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2FtYXpvbmR5bmFtb2RiL2xhdGVzdC9kZXZlbG9wZXJndWlkZS9SZXNlcnZlZFdvcmRzLmh0bWxcbiAgICAgICAgICAgICAqIEBsaW5rIGh0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9hbWF6b25keW5hbW9kYi9sYXRlc3QvZGV2ZWxvcGVyZ3VpZGUvRXhwcmVzc2lvbnMuRXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzLmh0bWxcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgUHJvamVjdGlvbkV4cHJlc3Npb246ICcjaWRmLCAjdCcsXG4gICAgICAgICAgICBFeHByZXNzaW9uQXR0cmlidXRlTmFtZXM6IHtcbiAgICAgICAgICAgICAgICAnI2lkZic6ICdpZCcsXG4gICAgICAgICAgICAgICAgJyN0JzogJ3RpbWVzdGFtcCdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuXG4gICAgICAgIC8vIGlmIHRoZXJlIGlzIGFuIGl0ZW0gcmV0cmlldmVkLCB0aGVuIHdlIG5lZWQgdG8gY2hlY2sgaXRzIGNvbnRlbnRzXG4gICAgICAgIGlmIChwcmVFeGlzdGluZ1RyYW5zYWN0aW9uICYmIHByZUV4aXN0aW5nVHJhbnNhY3Rpb24uSXRlbSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBpZiB0aGVyZSBpcyBhIHByZS1leGlzdGluZyB0cmFuc2FjdGlvbiB3aXRoIHRoZSBzYW1lIGNvbXBvc2l0ZSBwcmltYXJ5IGtleSAodXNlcklkL2lkLCB0aW1lc3RhbXApIGNvbWJpbmF0aW9uLFxuICAgICAgICAgICAgICogdGhlbiB3ZSBjYW5ub3QgZHVwbGljYXRlIHRoYXQsIHNvIHdlIHdpbGwgcmV0dXJuIGFuIGVycm9yLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgRHVwbGljYXRlIHRyYW5zYWN0aW9uIGZvdW5kIWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLkR1cGxpY2F0ZU9iamVjdEZvdW5kXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBzdG9yZSB0aGUgdHJhbnNhY3Rpb24gb2JqZWN0XG4gICAgICAgICAgICBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBQdXRJdGVtQ29tbWFuZCh7XG4gICAgICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5UUkFOU0FDVElPTlNfVEFCTEUhLFxuICAgICAgICAgICAgICAgIEl0ZW06IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZVRyYW5zYWN0aW9uSW5wdXQuaWRcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBOOiBjcmVhdGVUcmFuc2FjdGlvbklucHV0LnRpbWVzdGFtcC50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uSWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZVRyYW5zYWN0aW9uSW5wdXQudHJhbnNhY3Rpb25JZFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvblN0YXR1czoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlVHJhbnNhY3Rpb25JbnB1dC50cmFuc2FjdGlvblN0YXR1c1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvblR5cGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZVRyYW5zYWN0aW9uSW5wdXQudHJhbnNhY3Rpb25UeXBlXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlVHJhbnNhY3Rpb25JbnB1dC5jcmVhdGVkQXRcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlZEF0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVUcmFuc2FjdGlvbklucHV0LnVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBtZW1iZXJJZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlVHJhbnNhY3Rpb25JbnB1dC5tZW1iZXJJZFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBicmFuZElkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVUcmFuc2FjdGlvbklucHV0LmJyYW5kSWRcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgc3RvcmVJZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlVHJhbnNhY3Rpb25JbnB1dC5zdG9yZUlkXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVUcmFuc2FjdGlvbklucHV0LmNhdGVnb3J5XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbmN5Q29kZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlVHJhbnNhY3Rpb25JbnB1dC5jdXJyZW5jeUNvZGVcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgcmV3YXJkQW1vdW50OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBOOiBjcmVhdGVUcmFuc2FjdGlvbklucHV0LnJld2FyZEFtb3VudC50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHRvdGFsQW1vdW50OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBOOiBjcmVhdGVUcmFuc2FjdGlvbklucHV0LnRvdGFsQW1vdW50LnRvU3RyaW5nKClcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgcGVuZGluZ0Nhc2hiYWNrQW1vdW50OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBOOiBjcmVhdGVUcmFuc2FjdGlvbklucHV0LnBlbmRpbmdDYXNoYmFja0Ftb3VudC50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGNyZWRpdGVkQ2FzaGJhY2tBbW91bnQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIE46IGNyZWF0ZVRyYW5zYWN0aW9uSW5wdXQuY3JlZGl0ZWRDYXNoYmFja0Ftb3VudC50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uQnJhbmROYW1lOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVUcmFuc2FjdGlvbklucHV0LnRyYW5zYWN0aW9uQnJhbmROYW1lXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uQnJhbmREZXNjcmlwdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlVHJhbnNhY3Rpb25JbnB1dC50cmFuc2FjdGlvbkJyYW5kRGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25CcmFuZEFkZHJlc3M6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZVRyYW5zYWN0aW9uSW5wdXQudHJhbnNhY3Rpb25CcmFuZEFkZHJlc3NcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25CcmFuZExvZ29Vcmw6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZVRyYW5zYWN0aW9uSW5wdXQudHJhbnNhY3Rpb25CcmFuZExvZ29VcmxcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgIC8vIHJldHVybiB0aGUgdHJhbnNhY3Rpb24gb2JqZWN0XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGlkOiBjcmVhdGVUcmFuc2FjdGlvbklucHV0LmlkLFxuICAgICAgICAgICAgICAgIGRhdGE6IGNyZWF0ZVRyYW5zYWN0aW9uSW5wdXQgYXMgTW9vbmJlYW1UcmFuc2FjdGlvblxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyAke2ZpZWxkTmFtZX0gbXV0YXRpb24gJHtlcnJ9YDtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=