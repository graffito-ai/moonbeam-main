"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReimbursement = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * CreateReimbursement resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param createReimbursementInput create reimbursement input object, used to create a reimbursement
 * based on a triggered cron event.
 * @returns {@link Promise} of {@link ReimbursementResponse}
 */
const createReimbursement = async (fieldName, createReimbursementInput) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        // initializing the DynamoDB document client
        const dynamoDbClient = new client_dynamodb_1.DynamoDBClient({ region: region });
        /**
         * check to see if the reimbursement already exists in the DB. Although this is a very rare situation, since we have so many resilient
         * methods (such as Dead-Letter-Queue, retries, etc.) we want to put a safeguard around duplicates even here.
         */
        const preExistingReimbursement = await dynamoDbClient.send(new client_dynamodb_1.GetItemCommand({
            TableName: process.env.REIMBURSEMENTS_TABLE,
            Key: {
                id: {
                    S: createReimbursementInput.id
                },
                timestamp: {
                    N: createReimbursementInput.timestamp.toString()
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
        if (preExistingReimbursement && preExistingReimbursement.Item) {
            /**
             * if there is a pre-existing reimbursement with the same composite primary key (userId/id, timestamp) combination,
             * then we cannot duplicate that, so we will return an error.
             */
            const errorMessage = `Duplicate reimbursement found!`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.ReimbursementsErrorType.DuplicateObjectFound
            };
        }
        else {
            // map the incoming transactions array into a DynamoDB list accordingly
            const mappedTransactions = [];
            for (const transaction of createReimbursementInput.transactions) {
                mappedTransactions.push({
                    M: {
                        id: {
                            S: transaction.id
                        },
                        timestamp: {
                            N: transaction.timestamp.toString()
                        },
                        transactionId: {
                            S: transaction.transactionId
                        },
                        transactionStatus: {
                            S: transaction.transactionStatus
                        }
                    }
                });
            }
            // store the reimbursement object
            await dynamoDbClient.send(new client_dynamodb_1.PutItemCommand({
                TableName: process.env.REIMBURSEMENTS_TABLE,
                Item: {
                    id: {
                        S: createReimbursementInput.id
                    },
                    timestamp: {
                        N: createReimbursementInput.timestamp.toString()
                    },
                    reimbursementId: {
                        S: createReimbursementInput.reimbursementId
                    },
                    ...(createReimbursementInput.clientId && {
                        clientId: {
                            S: createReimbursementInput.clientId
                        }
                    }),
                    ...(createReimbursementInput.paymentGatewayId && {
                        paymentGatewayId: {
                            S: createReimbursementInput.paymentGatewayId
                        }
                    }),
                    ...(createReimbursementInput.succeeded !== undefined && createReimbursementInput.succeeded !== null && {
                        succeeded: {
                            BOOL: createReimbursementInput.succeeded
                        }
                    }),
                    ...(createReimbursementInput.processingMessage && {
                        processingMessage: {
                            S: createReimbursementInput.processingMessage
                        }
                    }),
                    cardId: {
                        S: createReimbursementInput.cardId
                    },
                    reimbursementStatus: {
                        S: createReimbursementInput.reimbursementStatus
                    },
                    pendingCashbackAmount: {
                        N: createReimbursementInput.pendingCashbackAmount.toString()
                    },
                    creditedCashbackAmount: {
                        N: createReimbursementInput.creditedCashbackAmount.toString()
                    },
                    currencyCode: {
                        S: createReimbursementInput.currencyCode
                    },
                    ...(createReimbursementInput.transactions.length !== 0 && {
                        transactions: {
                            L: mappedTransactions
                        }
                    }),
                    createdAt: {
                        S: createReimbursementInput.createdAt
                    },
                    updatedAt: {
                        S: createReimbursementInput.updatedAt
                    }
                },
            }));
            // return the reimbursement object
            return {
                id: createReimbursementInput.id,
                data: createReimbursementInput
            };
        }
    }
    catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} mutation ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: moonbeam_models_1.ReimbursementsErrorType.UnexpectedError
        };
    }
};
exports.createReimbursement = createReimbursement;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXRlUmVpbWJ1cnNlbWVudFJlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9yZXNvbHZlcnMvQ3JlYXRlUmVpbWJ1cnNlbWVudFJlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDhEQUF3RjtBQUN4RiwrREFLbUM7QUFFbkM7Ozs7Ozs7R0FPRztBQUNJLE1BQU0sbUJBQW1CLEdBQUcsS0FBSyxFQUFFLFNBQWlCLEVBQUUsd0JBQWtELEVBQWtDLEVBQUU7SUFDL0ksSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2Qyw0Q0FBNEM7UUFDNUMsTUFBTSxjQUFjLEdBQUcsSUFBSSxnQ0FBYyxDQUFDLEVBQUMsTUFBTSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7UUFFNUQ7OztXQUdHO1FBQ0gsTUFBTSx3QkFBd0IsR0FBRyxNQUFNLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxnQ0FBYyxDQUFDO1lBQzFFLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFxQjtZQUM1QyxHQUFHLEVBQUU7Z0JBQ0QsRUFBRSxFQUFFO29CQUNBLENBQUMsRUFBRSx3QkFBd0IsQ0FBQyxFQUFFO2lCQUNqQztnQkFDRCxTQUFTLEVBQUU7b0JBQ1AsQ0FBQyxFQUFFLHdCQUF3QixDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUU7aUJBQ25EO2FBQ0o7WUFDRDs7Ozs7ZUFLRztZQUNILG9CQUFvQixFQUFFLFVBQVU7WUFDaEMsd0JBQXdCLEVBQUU7Z0JBQ3RCLE1BQU0sRUFBRSxJQUFJO2dCQUNaLElBQUksRUFBRSxXQUFXO2FBQ3BCO1NBQ0osQ0FBQyxDQUFDLENBQUM7UUFFSixvRUFBb0U7UUFDcEUsSUFBSSx3QkFBd0IsSUFBSSx3QkFBd0IsQ0FBQyxJQUFJLEVBQUU7WUFDM0Q7OztlQUdHO1lBQ0gsTUFB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QUFDLEVBQUUsd0JBQXdCLENBQUMsU0FBUztxQkFDeEM7b0JBQ0QsU0FBUyxFQUFFO3dCQUNQLENBQUMsRUFBRSx3QkFBd0IsQ0FBQyxTQUFTO3FCQUN4QztpQkFDSjthQUNKLENBQUMsQ0FBQyxDQUFDO1lBRUosa0NBQWtDO1lBQ2xDLE9BQU87Z0JBQ0gsRUFBRSxFQUFFLHdCQUF3QixDQUFDLEVBQUU7Z0JBQy9CLElBQUksRUFBRSx3QkFBeUM7YUFDbEQsQ0FBQTtTQUNKO0tBQ0o7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNWLE1BQU0sWUFBWSxHQUFHLG9DQUFvQyxTQUFTLGFBQWEsR0FBRyxFQUFFLENBQUM7UUFDckYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMxQixPQUFPO1lBQ0gsWUFBWSxFQUFFLFlBQVk7WUFDMUIsU0FBUyxFQUFFLHlDQUF1QixDQUFDLGVBQWU7U0FDckQsQ0FBQTtLQUNKO0FBQ0wsQ0FBQyxDQUFBO0FBakpZLFFBQUEsbUJBQW1CLHVCQWlKL0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0R5bmFtb0RCQ2xpZW50LCBHZXRJdGVtQ29tbWFuZCwgUHV0SXRlbUNvbW1hbmR9IGZyb20gXCJAYXdzLXNkay9jbGllbnQtZHluYW1vZGJcIjtcbmltcG9ydCB7XG4gICAgQ3JlYXRlUmVpbWJ1cnNlbWVudElucHV0LFxuICAgIFJlaW1idXJzZW1lbnQsXG4gICAgUmVpbWJ1cnNlbWVudFJlc3BvbnNlLFxuICAgIFJlaW1idXJzZW1lbnRzRXJyb3JUeXBlXG59IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5cbi8qKlxuICogQ3JlYXRlUmVpbWJ1cnNlbWVudCByZXNvbHZlclxuICpcbiAqIEBwYXJhbSBmaWVsZE5hbWUgbmFtZSBvZiB0aGUgcmVzb2x2ZXIgcGF0aCBmcm9tIHRoZSBBcHBTeW5jIGV2ZW50XG4gKiBAcGFyYW0gY3JlYXRlUmVpbWJ1cnNlbWVudElucHV0IGNyZWF0ZSByZWltYnVyc2VtZW50IGlucHV0IG9iamVjdCwgdXNlZCB0byBjcmVhdGUgYSByZWltYnVyc2VtZW50XG4gKiBiYXNlZCBvbiBhIHRyaWdnZXJlZCBjcm9uIGV2ZW50LlxuICogQHJldHVybnMge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBSZWltYnVyc2VtZW50UmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCBjcmVhdGVSZWltYnVyc2VtZW50ID0gYXN5bmMgKGZpZWxkTmFtZTogc3RyaW5nLCBjcmVhdGVSZWltYnVyc2VtZW50SW5wdXQ6IENyZWF0ZVJlaW1idXJzZW1lbnRJbnB1dCk6IFByb21pc2U8UmVpbWJ1cnNlbWVudFJlc3BvbnNlPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gcmV0cmlldmluZyB0aGUgY3VycmVudCBmdW5jdGlvbiByZWdpb25cbiAgICAgICAgY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiE7XG5cbiAgICAgICAgLy8gaW5pdGlhbGl6aW5nIHRoZSBEeW5hbW9EQiBkb2N1bWVudCBjbGllbnRcbiAgICAgICAgY29uc3QgZHluYW1vRGJDbGllbnQgPSBuZXcgRHluYW1vREJDbGllbnQoe3JlZ2lvbjogcmVnaW9ufSk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIGNoZWNrIHRvIHNlZSBpZiB0aGUgcmVpbWJ1cnNlbWVudCBhbHJlYWR5IGV4aXN0cyBpbiB0aGUgREIuIEFsdGhvdWdoIHRoaXMgaXMgYSB2ZXJ5IHJhcmUgc2l0dWF0aW9uLCBzaW5jZSB3ZSBoYXZlIHNvIG1hbnkgcmVzaWxpZW50XG4gICAgICAgICAqIG1ldGhvZHMgKHN1Y2ggYXMgRGVhZC1MZXR0ZXItUXVldWUsIHJldHJpZXMsIGV0Yy4pIHdlIHdhbnQgdG8gcHV0IGEgc2FmZWd1YXJkIGFyb3VuZCBkdXBsaWNhdGVzIGV2ZW4gaGVyZS5cbiAgICAgICAgICovXG4gICAgICAgIGNvbnN0IHByZUV4aXN0aW5nUmVpbWJ1cnNlbWVudCA9IGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IEdldEl0ZW1Db21tYW5kKHtcbiAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuUkVJTUJVUlNFTUVOVFNfVEFCTEUhLFxuICAgICAgICAgICAgS2V5OiB7XG4gICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlUmVpbWJ1cnNlbWVudElucHV0LmlkXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IHtcbiAgICAgICAgICAgICAgICAgICAgTjogY3JlYXRlUmVpbWJ1cnNlbWVudElucHV0LnRpbWVzdGFtcC50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogd2UncmUgbm90IGludGVyZXN0ZWQgaW4gZ2V0dGluZyBhbGwgdGhlIGRhdGEgZm9yIHRoaXMgY2FsbCwganVzdCB0aGUgbWluaW11bSBmb3IgdXMgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdGhpcyBpcyBhIGR1cGxpY2F0ZSBvciBub3RcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBAbGluayBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vYW1hem9uZHluYW1vZGIvbGF0ZXN0L2RldmVsb3Blcmd1aWRlL1Jlc2VydmVkV29yZHMuaHRtbFxuICAgICAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2FtYXpvbmR5bmFtb2RiL2xhdGVzdC9kZXZlbG9wZXJndWlkZS9FeHByZXNzaW9ucy5FeHByZXNzaW9uQXR0cmlidXRlTmFtZXMuaHRtbFxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBQcm9qZWN0aW9uRXhwcmVzc2lvbjogJyNpZGYsICN0JyxcbiAgICAgICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lczoge1xuICAgICAgICAgICAgICAgICcjaWRmJzogJ2lkJyxcbiAgICAgICAgICAgICAgICAnI3QnOiAndGltZXN0YW1wJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG5cbiAgICAgICAgLy8gaWYgdGhlcmUgaXMgYW4gaXRlbSByZXRyaWV2ZWQsIHRoZW4gd2UgbmVlZCB0byBjaGVjayBpdHMgY29udGVudHNcbiAgICAgICAgaWYgKHByZUV4aXN0aW5nUmVpbWJ1cnNlbWVudCAmJiBwcmVFeGlzdGluZ1JlaW1idXJzZW1lbnQuSXRlbSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBpZiB0aGVyZSBpcyBhIHByZS1leGlzdGluZyByZWltYnVyc2VtZW50IHdpdGggdGhlIHNhbWUgY29tcG9zaXRlIHByaW1hcnkga2V5ICh1c2VySWQvaWQsIHRpbWVzdGFtcCkgY29tYmluYXRpb24sXG4gICAgICAgICAgICAgKiB0aGVuIHdlIGNhbm5vdCBkdXBsaWNhdGUgdGhhdCwgc28gd2Ugd2lsbCByZXR1cm4gYW4gZXJyb3IuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBEdXBsaWNhdGUgcmVpbWJ1cnNlbWVudCBmb3VuZCFgO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFJlaW1idXJzZW1lbnRzRXJyb3JUeXBlLkR1cGxpY2F0ZU9iamVjdEZvdW5kXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBtYXAgdGhlIGluY29taW5nIHRyYW5zYWN0aW9ucyBhcnJheSBpbnRvIGEgRHluYW1vREIgbGlzdCBhY2NvcmRpbmdseVxuICAgICAgICAgICAgY29uc3QgbWFwcGVkVHJhbnNhY3Rpb25zOiBhbnlbXSA9IFtdO1xuICAgICAgICAgICAgZm9yIChjb25zdCB0cmFuc2FjdGlvbiBvZiBjcmVhdGVSZWltYnVyc2VtZW50SW5wdXQudHJhbnNhY3Rpb25zKSB7XG4gICAgICAgICAgICAgICAgbWFwcGVkVHJhbnNhY3Rpb25zLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBNOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IHRyYW5zYWN0aW9uIS5pZFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE46IHRyYW5zYWN0aW9uIS50aW1lc3RhbXAudG9TdHJpbmcoKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uSWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiB0cmFuc2FjdGlvbiEudHJhbnNhY3Rpb25JZFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uU3RhdHVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogdHJhbnNhY3Rpb24hLnRyYW5zYWN0aW9uU3RhdHVzXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gc3RvcmUgdGhlIHJlaW1idXJzZW1lbnQgb2JqZWN0XG4gICAgICAgICAgICBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBQdXRJdGVtQ29tbWFuZCh7XG4gICAgICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5SRUlNQlVSU0VNRU5UU19UQUJMRSEsXG4gICAgICAgICAgICAgICAgSXRlbToge1xuICAgICAgICAgICAgICAgICAgICBpZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlUmVpbWJ1cnNlbWVudElucHV0LmlkXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgTjogY3JlYXRlUmVpbWJ1cnNlbWVudElucHV0LnRpbWVzdGFtcC50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHJlaW1idXJzZW1lbnRJZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlUmVpbWJ1cnNlbWVudElucHV0LnJlaW1idXJzZW1lbnRJZFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAuLi4oY3JlYXRlUmVpbWJ1cnNlbWVudElucHV0LmNsaWVudElkICYmIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsaWVudElkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlUmVpbWJ1cnNlbWVudElucHV0LmNsaWVudElkXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAuLi4oY3JlYXRlUmVpbWJ1cnNlbWVudElucHV0LnBheW1lbnRHYXRld2F5SWQgJiYge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGF5bWVudEdhdGV3YXlJZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZVJlaW1idXJzZW1lbnRJbnB1dC5wYXltZW50R2F0ZXdheUlkXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAuLi4oY3JlYXRlUmVpbWJ1cnNlbWVudElucHV0LnN1Y2NlZWRlZCAhPT0gdW5kZWZpbmVkICYmIGNyZWF0ZVJlaW1idXJzZW1lbnRJbnB1dC5zdWNjZWVkZWQgIT09IG51bGwgJiYge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VlZGVkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQk9PTDogY3JlYXRlUmVpbWJ1cnNlbWVudElucHV0LnN1Y2NlZWRlZFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgLi4uKGNyZWF0ZVJlaW1idXJzZW1lbnRJbnB1dC5wcm9jZXNzaW5nTWVzc2FnZSAmJiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9jZXNzaW5nTWVzc2FnZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZVJlaW1idXJzZW1lbnRJbnB1dC5wcm9jZXNzaW5nTWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgY2FyZElkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVSZWltYnVyc2VtZW50SW5wdXQuY2FyZElkXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHJlaW1idXJzZW1lbnRTdGF0dXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZVJlaW1idXJzZW1lbnRJbnB1dC5yZWltYnVyc2VtZW50U3RhdHVzXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHBlbmRpbmdDYXNoYmFja0Ftb3VudDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgTjogY3JlYXRlUmVpbWJ1cnNlbWVudElucHV0LnBlbmRpbmdDYXNoYmFja0Ftb3VudC50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGNyZWRpdGVkQ2FzaGJhY2tBbW91bnQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIE46IGNyZWF0ZVJlaW1idXJzZW1lbnRJbnB1dC5jcmVkaXRlZENhc2hiYWNrQW1vdW50LnRvU3RyaW5nKClcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgY3VycmVuY3lDb2RlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVSZWltYnVyc2VtZW50SW5wdXQuY3VycmVuY3lDb2RlXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIC4uLihjcmVhdGVSZWltYnVyc2VtZW50SW5wdXQudHJhbnNhY3Rpb25zLmxlbmd0aCAhPT0gMCAmJiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBMOiBtYXBwZWRUcmFuc2FjdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlUmVpbWJ1cnNlbWVudElucHV0LmNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVkQXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZVJlaW1idXJzZW1lbnRJbnB1dC51cGRhdGVkQXRcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgIC8vIHJldHVybiB0aGUgcmVpbWJ1cnNlbWVudCBvYmplY3RcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgaWQ6IGNyZWF0ZVJlaW1idXJzZW1lbnRJbnB1dC5pZCxcbiAgICAgICAgICAgICAgICBkYXRhOiBjcmVhdGVSZWltYnVyc2VtZW50SW5wdXQgYXMgUmVpbWJ1cnNlbWVudFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyAke2ZpZWxkTmFtZX0gbXV0YXRpb24gJHtlcnJ9YDtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBSZWltYnVyc2VtZW50c0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==