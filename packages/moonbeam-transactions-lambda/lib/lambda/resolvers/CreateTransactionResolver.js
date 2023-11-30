"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransaction = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * CreateTransaction resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param createTransactionInput create transaction input object, used to create a transaction
 * based on an incoming transaction event/message from SQS.
 * @returns {@link Promise} of {@link MoonbeamTransactionResponse}
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
        // if there is an item retrieved, then we return an error
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
                    cardId: {
                        S: createTransactionInput.cardId
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
                        N: createTransactionInput.rewardAmount.toFixed(2).toString()
                    },
                    totalAmount: {
                        N: createTransactionInput.totalAmount.toFixed(2).toString()
                    },
                    pendingCashbackAmount: {
                        N: createTransactionInput.pendingCashbackAmount.toFixed(2).toString()
                    },
                    creditedCashbackAmount: {
                        N: createTransactionInput.creditedCashbackAmount.toFixed(2).toString()
                    },
                    transactionBrandName: {
                        S: createTransactionInput.transactionBrandName
                    },
                    transactionBrandAddress: {
                        S: createTransactionInput.transactionBrandAddress
                    },
                    transactionBrandLogoUrl: {
                        S: createTransactionInput.transactionBrandLogoUrl
                    },
                    transactionBrandURLAddress: {
                        S: createTransactionInput.transactionBrandURLAddress
                    },
                    transactionIsOnline: {
                        BOOL: createTransactionInput.transactionIsOnline
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXRlVHJhbnNhY3Rpb25SZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL0NyZWF0ZVRyYW5zYWN0aW9uUmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsOERBQXdGO0FBQ3hGLCtEQUttQztBQUVuQzs7Ozs7OztHQU9HO0FBQ0ksTUFBTSxpQkFBaUIsR0FBRyxLQUFLLEVBQUUsU0FBaUIsRUFBRSxzQkFBOEMsRUFBd0MsRUFBRTtJQUMvSSxJQUFJO1FBQ0EseUNBQXlDO1FBQ3pDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVyxDQUFDO1FBRXZDLDRDQUE0QztRQUM1QyxNQUFNLGNBQWMsR0FBRyxJQUFJLGdDQUFjLENBQUMsRUFBQyxNQUFNLEVBQUUsTUFBTSxFQUFDLENBQUMsQ0FBQztRQUU1RDs7O1dBR0c7UUFDSCxNQUFNLHNCQUFzQixHQUFHLE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLGdDQUFjLENBQUM7WUFDeEUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQW1CO1lBQzFDLEdBQUcsRUFBRTtnQkFDRCxFQUFFLEVBQUU7b0JBQ0EsQ0FBQyxFQUFFLHNCQUFzQixDQUFDLEVBQUU7aUJBQy9CO2dCQUNELFNBQVMsRUFBRTtvQkFDUCxDQUFDLEVBQUUsc0JBQXNCLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRTtpQkFDakQ7YUFDSjtZQUNEOzs7OztlQUtHO1lBQ0gsb0JBQW9CLEVBQUUsVUFBVTtZQUNoQyx3QkFBd0IsRUFBRTtnQkFDdEIsTUFBTSxFQUFFLElBQUk7Z0JBQ1osSUFBSSxFQUFFLFdBQVc7YUFDcEI7U0FDSixDQUFDLENBQUMsQ0FBQztRQUVKLHlEQUF5RDtRQUN6RCxJQUFJLHNCQUFzQixJQUFJLHNCQUFzQixDQUFDLElBQUksRUFBRTtZQUN2RDs7O2VBR0c7WUFDSCxNQUFNLFlB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QUM3QixJQUFJLEVBQUUsc0JBQTZDO2FBQ3RELENBQUE7U0FDSjtLQUNKO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDVixNQUFNLFlBQVksR0FBRyxvQ0FBb0MsU0FBUyxhQUFhLEdBQUcsRUFBRSxDQUFDO1FBQ3JGLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDMUIsT0FBTztZQUNILFlBQVksRUFBRSxZQUFZO1lBQzFCLFNBQVMsRUFBRSx1Q0FBcUIsQ0FBQyxlQUFlO1NBQ25ELENBQUE7S0FDSjtBQUNMLENBQUMsQ0FBQTtBQXhJWSxRQUFBLGlCQUFpQixxQkF3STdCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtEeW5hbW9EQkNsaWVudCwgR2V0SXRlbUNvbW1hbmQsIFB1dEl0ZW1Db21tYW5kfSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LWR5bmFtb2RiXCI7XG5pbXBvcnQge1xuICAgIENyZWF0ZVRyYW5zYWN0aW9uSW5wdXQsXG4gICAgTW9vbmJlYW1UcmFuc2FjdGlvbixcbiAgICBNb29uYmVhbVRyYW5zYWN0aW9uUmVzcG9uc2UsXG4gICAgVHJhbnNhY3Rpb25zRXJyb3JUeXBlXG59IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5cbi8qKlxuICogQ3JlYXRlVHJhbnNhY3Rpb24gcmVzb2x2ZXJcbiAqXG4gKiBAcGFyYW0gZmllbGROYW1lIG5hbWUgb2YgdGhlIHJlc29sdmVyIHBhdGggZnJvbSB0aGUgQXBwU3luYyBldmVudFxuICogQHBhcmFtIGNyZWF0ZVRyYW5zYWN0aW9uSW5wdXQgY3JlYXRlIHRyYW5zYWN0aW9uIGlucHV0IG9iamVjdCwgdXNlZCB0byBjcmVhdGUgYSB0cmFuc2FjdGlvblxuICogYmFzZWQgb24gYW4gaW5jb21pbmcgdHJhbnNhY3Rpb24gZXZlbnQvbWVzc2FnZSBmcm9tIFNRUy5cbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgTW9vbmJlYW1UcmFuc2FjdGlvblJlc3BvbnNlfVxuICovXG5leHBvcnQgY29uc3QgY3JlYXRlVHJhbnNhY3Rpb24gPSBhc3luYyAoZmllbGROYW1lOiBzdHJpbmcsIGNyZWF0ZVRyYW5zYWN0aW9uSW5wdXQ6IENyZWF0ZVRyYW5zYWN0aW9uSW5wdXQpOiBQcm9taXNlPE1vb25iZWFtVHJhbnNhY3Rpb25SZXNwb25zZT4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgIC8vIGluaXRpYWxpemluZyB0aGUgRHluYW1vREIgZG9jdW1lbnQgY2xpZW50XG4gICAgICAgIGNvbnN0IGR5bmFtb0RiQ2xpZW50ID0gbmV3IER5bmFtb0RCQ2xpZW50KHtyZWdpb246IHJlZ2lvbn0pO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBjaGVjayB0byBzZWUgaWYgdGhlIHRyYW5zYWN0aW9uIGFscmVhZHkgZXhpc3RzIGluIHRoZSBEQi4gQWx0aG91Z2ggdGhpcyBpcyBhIHZlcnkgcmFyZSBzaXR1YXRpb24sIHNpbmNlIHdlIGhhdmUgc28gbWFueSByZXNpbGllbnRcbiAgICAgICAgICogbWV0aG9kcyAoc3VjaCBhcyBEZWFkLUxldHRlci1RdWV1ZSwgcmV0cmllcywgZXRjLikgd2Ugd2FudCB0byBwdXQgYSBzYWZlZ3VhcmQgYXJvdW5kIGR1cGxpY2F0ZXMgZXZlbiBoZXJlLlxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3QgcHJlRXhpc3RpbmdUcmFuc2FjdGlvbiA9IGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IEdldEl0ZW1Db21tYW5kKHtcbiAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuVFJBTlNBQ1RJT05TX1RBQkxFISxcbiAgICAgICAgICAgIEtleToge1xuICAgICAgICAgICAgICAgIGlkOiB7XG4gICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZVRyYW5zYWN0aW9uSW5wdXQuaWRcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRpbWVzdGFtcDoge1xuICAgICAgICAgICAgICAgICAgICBOOiBjcmVhdGVUcmFuc2FjdGlvbklucHV0LnRpbWVzdGFtcC50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogd2UncmUgbm90IGludGVyZXN0ZWQgaW4gZ2V0dGluZyBhbGwgdGhlIGRhdGEgZm9yIHRoaXMgY2FsbCwganVzdCB0aGUgbWluaW11bSBmb3IgdXMgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdGhpcyBpcyBhIGR1cGxpY2F0ZSBvciBub3RcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBAbGluayBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vYW1hem9uZHluYW1vZGIvbGF0ZXN0L2RldmVsb3Blcmd1aWRlL1Jlc2VydmVkV29yZHMuaHRtbFxuICAgICAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2FtYXpvbmR5bmFtb2RiL2xhdGVzdC9kZXZlbG9wZXJndWlkZS9FeHByZXNzaW9ucy5FeHByZXNzaW9uQXR0cmlidXRlTmFtZXMuaHRtbFxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBQcm9qZWN0aW9uRXhwcmVzc2lvbjogJyNpZGYsICN0JyxcbiAgICAgICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lczoge1xuICAgICAgICAgICAgICAgICcjaWRmJzogJ2lkJyxcbiAgICAgICAgICAgICAgICAnI3QnOiAndGltZXN0YW1wJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG5cbiAgICAgICAgLy8gaWYgdGhlcmUgaXMgYW4gaXRlbSByZXRyaWV2ZWQsIHRoZW4gd2UgcmV0dXJuIGFuIGVycm9yXG4gICAgICAgIGlmIChwcmVFeGlzdGluZ1RyYW5zYWN0aW9uICYmIHByZUV4aXN0aW5nVHJhbnNhY3Rpb24uSXRlbSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBpZiB0aGVyZSBpcyBhIHByZS1leGlzdGluZyB0cmFuc2FjdGlvbiB3aXRoIHRoZSBzYW1lIGNvbXBvc2l0ZSBwcmltYXJ5IGtleSAodXNlcklkL2lkLCB0aW1lc3RhbXApIGNvbWJpbmF0aW9uLFxuICAgICAgICAgICAgICogdGhlbiB3ZSBjYW5ub3QgZHVwbGljYXRlIHRoYXQsIHNvIHdlIHdpbGwgcmV0dXJuIGFuIGVycm9yLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgRHVwbGljYXRlIHRyYW5zYWN0aW9uIGZvdW5kIWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLkR1cGxpY2F0ZU9iamVjdEZvdW5kXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBzdG9yZSB0aGUgdHJhbnNhY3Rpb24gb2JqZWN0XG4gICAgICAgICAgICBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBQdXRJdGVtQ29tbWFuZCh7XG4gICAgICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5UUkFOU0FDVElPTlNfVEFCTEUhLFxuICAgICAgICAgICAgICAgIEl0ZW06IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZVRyYW5zYWN0aW9uSW5wdXQuaWRcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBOOiBjcmVhdGVUcmFuc2FjdGlvbklucHV0LnRpbWVzdGFtcC50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uSWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZVRyYW5zYWN0aW9uSW5wdXQudHJhbnNhY3Rpb25JZFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvblN0YXR1czoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlVHJhbnNhY3Rpb25JbnB1dC50cmFuc2FjdGlvblN0YXR1c1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvblR5cGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZVRyYW5zYWN0aW9uSW5wdXQudHJhbnNhY3Rpb25UeXBlXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlVHJhbnNhY3Rpb25JbnB1dC5jcmVhdGVkQXRcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlZEF0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVUcmFuc2FjdGlvbklucHV0LnVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBjYXJkSWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZVRyYW5zYWN0aW9uSW5wdXQuY2FyZElkXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIG1lbWJlcklkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVUcmFuc2FjdGlvbklucHV0Lm1lbWJlcklkXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGJyYW5kSWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZVRyYW5zYWN0aW9uSW5wdXQuYnJhbmRJZFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBzdG9yZUlkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVUcmFuc2FjdGlvbklucHV0LnN0b3JlSWRcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnk6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZVRyYW5zYWN0aW9uSW5wdXQuY2F0ZWdvcnlcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgY3VycmVuY3lDb2RlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVUcmFuc2FjdGlvbklucHV0LmN1cnJlbmN5Q29kZVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICByZXdhcmRBbW91bnQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIE46IGNyZWF0ZVRyYW5zYWN0aW9uSW5wdXQucmV3YXJkQW1vdW50LnRvRml4ZWQoMikudG9TdHJpbmcoKVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB0b3RhbEFtb3VudDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgTjogY3JlYXRlVHJhbnNhY3Rpb25JbnB1dC50b3RhbEFtb3VudC50b0ZpeGVkKDIpLnRvU3RyaW5nKClcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgcGVuZGluZ0Nhc2hiYWNrQW1vdW50OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBOOiBjcmVhdGVUcmFuc2FjdGlvbklucHV0LnBlbmRpbmdDYXNoYmFja0Ftb3VudC50b0ZpeGVkKDIpLnRvU3RyaW5nKClcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgY3JlZGl0ZWRDYXNoYmFja0Ftb3VudDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgTjogY3JlYXRlVHJhbnNhY3Rpb25JbnB1dC5jcmVkaXRlZENhc2hiYWNrQW1vdW50LnRvRml4ZWQoMikudG9TdHJpbmcoKVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbkJyYW5kTmFtZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlVHJhbnNhY3Rpb25JbnB1dC50cmFuc2FjdGlvbkJyYW5kTmFtZVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbkJyYW5kQWRkcmVzczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlVHJhbnNhY3Rpb25JbnB1dC50cmFuc2FjdGlvbkJyYW5kQWRkcmVzc1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbkJyYW5kTG9nb1VybDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlVHJhbnNhY3Rpb25JbnB1dC50cmFuc2FjdGlvbkJyYW5kTG9nb1VybFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbkJyYW5kVVJMQWRkcmVzczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlVHJhbnNhY3Rpb25JbnB1dC50cmFuc2FjdGlvbkJyYW5kVVJMQWRkcmVzc1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbklzT25saW5lOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBCT09MOiBjcmVhdGVUcmFuc2FjdGlvbklucHV0LnRyYW5zYWN0aW9uSXNPbmxpbmVcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgIC8vIHJldHVybiB0aGUgdHJhbnNhY3Rpb24gb2JqZWN0XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGlkOiBjcmVhdGVUcmFuc2FjdGlvbklucHV0LmlkLFxuICAgICAgICAgICAgICAgIGRhdGE6IGNyZWF0ZVRyYW5zYWN0aW9uSW5wdXQgYXMgTW9vbmJlYW1UcmFuc2FjdGlvblxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyAke2ZpZWxkTmFtZX0gbXV0YXRpb24gJHtlcnJ9YDtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=