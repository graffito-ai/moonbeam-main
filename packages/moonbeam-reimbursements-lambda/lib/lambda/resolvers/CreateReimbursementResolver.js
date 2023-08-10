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
        // update the timestamps accordingly
        const createdAt = new Date().toISOString();
        createReimbursementInput.timestamp = createReimbursementInput.timestamp ? createReimbursementInput.timestamp : Date.parse(createdAt);
        createReimbursementInput.createdAt = createReimbursementInput.createdAt ? createReimbursementInput.createdAt : createdAt;
        createReimbursementInput.updatedAt = createReimbursementInput.updatedAt ? createReimbursementInput.updatedAt : createdAt;
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
        // if there is an item retrieved, then we return an error
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXRlUmVpbWJ1cnNlbWVudFJlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9yZXNvbHZlcnMvQ3JlYXRlUmVpbWJ1cnNlbWVudFJlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDhEQUF3RjtBQUN4RiwrREFLbUM7QUFFbkM7Ozs7Ozs7R0FPRztBQUNJLE1BQU0sbUJBQW1CLEdBQUcsS0FBSyxFQUFFLFNBQWlCLEVBQUUsd0JBQWtELEVBQWtDLEVBQUU7SUFDL0ksSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2Qyw0Q0FBNEM7UUFDNUMsTUFBTSxjQUFjLEdBQUcsSUFBSSxnQ0FBYyxDQUFDLEVBQUMsTUFBTSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7UUFFNUQsb0NBQW9DO1FBQ3BDLE1BQU0sU0FBUyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDM0Msd0JBQXdCLENBQUMsU0FBUyxHQUFHLHdCQUF3QixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsd0JBQXdCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3JJLHdCQUF3QixDQUFDLFNBQVMsR0FBRyx3QkFBd0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLHdCQUF3QixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQ3pILHdCQUF3QixDQUFDLFNBQVMsR0FBRyx3QkFBd0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLHdCQUF3QixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBRXpIOzs7V0FHRztRQUNILE1BQU0sd0JBQXdCLEdBQUcsTUFBTSxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksZ0NB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bUNvbW1hbmQsIFB1dEl0ZW1Db21tYW5kfSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LWR5bmFtb2RiXCI7XG5pbXBvcnQge1xuICAgIENyZWF0ZVJlaW1idXJzZW1lbnRJbnB1dCxcbiAgICBSZWltYnVyc2VtZW50LFxuICAgIFJlaW1idXJzZW1lbnRSZXNwb25zZSxcbiAgICBSZWltYnVyc2VtZW50c0Vycm9yVHlwZVxufSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuXG4vKipcbiAqIENyZWF0ZVJlaW1idXJzZW1lbnQgcmVzb2x2ZXJcbiAqXG4gKiBAcGFyYW0gZmllbGROYW1lIG5hbWUgb2YgdGhlIHJlc29sdmVyIHBhdGggZnJvbSB0aGUgQXBwU3luYyBldmVudFxuICogQHBhcmFtIGNyZWF0ZVJlaW1idXJzZW1lbnRJbnB1dCBjcmVhdGUgcmVpbWJ1cnNlbWVudCBpbnB1dCBvYmplY3QsIHVzZWQgdG8gY3JlYXRlIGEgcmVpbWJ1cnNlbWVudFxuICogYmFzZWQgb24gYSB0cmlnZ2VyZWQgY3JvbiBldmVudC5cbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgUmVpbWJ1cnNlbWVudFJlc3BvbnNlfVxuICovXG5leHBvcnQgY29uc3QgY3JlYXRlUmVpbWJ1cnNlbWVudCA9IGFzeW5jIChmaWVsZE5hbWU6IHN0cmluZywgY3JlYXRlUmVpbWJ1cnNlbWVudElucHV0OiBDcmVhdGVSZWltYnVyc2VtZW50SW5wdXQpOiBQcm9taXNlPFJlaW1idXJzZW1lbnRSZXNwb25zZT4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgIC8vIGluaXRpYWxpemluZyB0aGUgRHluYW1vREIgZG9jdW1lbnQgY2xpZW50XG4gICAgICAgIGNvbnN0IGR5bmFtb0RiQ2xpZW50ID0gbmV3IER5bmFtb0RCQ2xpZW50KHtyZWdpb246IHJlZ2lvbn0pO1xuXG4gICAgICAgIC8vIHVwZGF0ZSB0aGUgdGltZXN0YW1wcyBhY2NvcmRpbmdseVxuICAgICAgICBjb25zdCBjcmVhdGVkQXQgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgICAgIGNyZWF0ZVJlaW1idXJzZW1lbnRJbnB1dC50aW1lc3RhbXAgPSBjcmVhdGVSZWltYnVyc2VtZW50SW5wdXQudGltZXN0YW1wID8gY3JlYXRlUmVpbWJ1cnNlbWVudElucHV0LnRpbWVzdGFtcCA6IERhdGUucGFyc2UoY3JlYXRlZEF0KTtcbiAgICAgICAgY3JlYXRlUmVpbWJ1cnNlbWVudElucHV0LmNyZWF0ZWRBdCA9IGNyZWF0ZVJlaW1idXJzZW1lbnRJbnB1dC5jcmVhdGVkQXQgPyBjcmVhdGVSZWltYnVyc2VtZW50SW5wdXQuY3JlYXRlZEF0IDogY3JlYXRlZEF0O1xuICAgICAgICBjcmVhdGVSZWltYnVyc2VtZW50SW5wdXQudXBkYXRlZEF0ID0gY3JlYXRlUmVpbWJ1cnNlbWVudElucHV0LnVwZGF0ZWRBdCA/IGNyZWF0ZVJlaW1idXJzZW1lbnRJbnB1dC51cGRhdGVkQXQgOiBjcmVhdGVkQXQ7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIGNoZWNrIHRvIHNlZSBpZiB0aGUgcmVpbWJ1cnNlbWVudCBhbHJlYWR5IGV4aXN0cyBpbiB0aGUgREIuIEFsdGhvdWdoIHRoaXMgaXMgYSB2ZXJ5IHJhcmUgc2l0dWF0aW9uLCBzaW5jZSB3ZSBoYXZlIHNvIG1hbnkgcmVzaWxpZW50XG4gICAgICAgICAqIG1ldGhvZHMgKHN1Y2ggYXMgRGVhZC1MZXR0ZXItUXVldWUsIHJldHJpZXMsIGV0Yy4pIHdlIHdhbnQgdG8gcHV0IGEgc2FmZWd1YXJkIGFyb3VuZCBkdXBsaWNhdGVzIGV2ZW4gaGVyZS5cbiAgICAgICAgICovXG4gICAgICAgIGNvbnN0IHByZUV4aXN0aW5nUmVpbWJ1cnNlbWVudCA9IGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IEdldEl0ZW1Db21tYW5kKHtcbiAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuUkVJTUJVUlNFTUVOVFNfVEFCTEUhLFxuICAgICAgICAgICAgS2V5OiB7XG4gICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlUmVpbWJ1cnNlbWVudElucHV0LmlkXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IHtcbiAgICAgICAgICAgICAgICAgICAgTjogY3JlYXRlUmVpbWJ1cnNlbWVudElucHV0LnRpbWVzdGFtcC50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogd2UncmUgbm90IGludGVyZXN0ZWQgaW4gZ2V0dGluZyBhbGwgdGhlIGRhdGEgZm9yIHRoaXMgY2FsbCwganVzdCB0aGUgbWluaW11bSBmb3IgdXMgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdGhpcyBpcyBhIGR1cGxpY2F0ZSBvciBub3RcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBAbGluayBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vYW1hem9uZHluYW1vZGIvbGF0ZXN0L2RldmVsb3Blcmd1aWRlL1Jlc2VydmVkV29yZHMuaHRtbFxuICAgICAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2FtYXpvbmR5bmFtb2RiL2xhdGVzdC9kZXZlbG9wZXJndWlkZS9FeHByZXNzaW9ucy5FeHByZXNzaW9uQXR0cmlidXRlTmFtZXMuaHRtbFxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBQcm9qZWN0aW9uRXhwcmVzc2lvbjogJyNpZGYsICN0JyxcbiAgICAgICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lczoge1xuICAgICAgICAgICAgICAgICcjaWRmJzogJ2lkJyxcbiAgICAgICAgICAgICAgICAnI3QnOiAndGltZXN0YW1wJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG5cbiAgICAgICAgLy8gaWYgdGhlcmUgaXMgYW4gaXRlbSByZXRyaWV2ZWQsIHRoZW4gd2UgcmV0dXJuIGFuIGVycm9yXG4gICAgICAgIGlmIChwcmVFeGlzdGluZ1JlaW1idXJzZW1lbnQgJiYgcHJlRXhpc3RpbmdSZWltYnVyc2VtZW50Lkl0ZW0pIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogaWYgdGhlcmUgaXMgYSBwcmUtZXhpc3RpbmcgcmVpbWJ1cnNlbWVudCB3aXRoIHRoZSBzYW1lIGNvbXBvc2l0ZSBwcmltYXJ5IGtleSAodXNlcklkL2lkLCB0aW1lc3RhbXApIGNvbWJpbmF0aW9uLFxuICAgICAgICAgICAgICogdGhlbiB3ZSBjYW5ub3QgZHVwbGljYXRlIHRoYXQsIHNvIHdlIHdpbGwgcmV0dXJuIGFuIGVycm9yLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgRHVwbGljYXRlIHJlaW1idXJzZW1lbnQgZm91bmQhYDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBSZWltYnVyc2VtZW50c0Vycm9yVHlwZS5EdXBsaWNhdGVPYmplY3RGb3VuZFxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gbWFwIHRoZSBpbmNvbWluZyB0cmFuc2FjdGlvbnMgYXJyYXkgaW50byBhIER5bmFtb0RCIGxpc3QgYWNjb3JkaW5nbHlcbiAgICAgICAgICAgIGNvbnN0IG1hcHBlZFRyYW5zYWN0aW9uczogYW55W10gPSBbXTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgdHJhbnNhY3Rpb24gb2YgY3JlYXRlUmVpbWJ1cnNlbWVudElucHV0LnRyYW5zYWN0aW9ucykge1xuICAgICAgICAgICAgICAgIG1hcHBlZFRyYW5zYWN0aW9ucy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgTToge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiB0cmFuc2FjdGlvbiEuaWRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBOOiB0cmFuc2FjdGlvbiEudGltZXN0YW1wLnRvU3RyaW5nKClcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbklkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogdHJhbnNhY3Rpb24hLnRyYW5zYWN0aW9uSWRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvblN0YXR1czoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IHRyYW5zYWN0aW9uIS50cmFuc2FjdGlvblN0YXR1c1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIHN0b3JlIHRoZSByZWltYnVyc2VtZW50IG9iamVjdFxuICAgICAgICAgICAgYXdhaXQgZHluYW1vRGJDbGllbnQuc2VuZChuZXcgUHV0SXRlbUNvbW1hbmQoe1xuICAgICAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuUkVJTUJVUlNFTUVOVFNfVEFCTEUhLFxuICAgICAgICAgICAgICAgIEl0ZW06IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZVJlaW1idXJzZW1lbnRJbnB1dC5pZFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIE46IGNyZWF0ZVJlaW1idXJzZW1lbnRJbnB1dC50aW1lc3RhbXAudG9TdHJpbmcoKVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICByZWltYnVyc2VtZW50SWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZVJlaW1idXJzZW1lbnRJbnB1dC5yZWltYnVyc2VtZW50SWRcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgLi4uKGNyZWF0ZVJlaW1idXJzZW1lbnRJbnB1dC5jbGllbnRJZCAmJiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGllbnRJZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZVJlaW1idXJzZW1lbnRJbnB1dC5jbGllbnRJZFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgLi4uKGNyZWF0ZVJlaW1idXJzZW1lbnRJbnB1dC5wYXltZW50R2F0ZXdheUlkICYmIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBheW1lbnRHYXRld2F5SWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVSZWltYnVyc2VtZW50SW5wdXQucGF5bWVudEdhdGV3YXlJZFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgLi4uKGNyZWF0ZVJlaW1idXJzZW1lbnRJbnB1dC5zdWNjZWVkZWQgIT09IHVuZGVmaW5lZCAmJiBjcmVhdGVSZWltYnVyc2VtZW50SW5wdXQuc3VjY2VlZGVkICE9PSBudWxsICYmIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2NlZWRlZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEJPT0w6IGNyZWF0ZVJlaW1idXJzZW1lbnRJbnB1dC5zdWNjZWVkZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIC4uLihjcmVhdGVSZWltYnVyc2VtZW50SW5wdXQucHJvY2Vzc2luZ01lc3NhZ2UgJiYge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvY2Vzc2luZ01lc3NhZ2U6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVSZWltYnVyc2VtZW50SW5wdXQucHJvY2Vzc2luZ01lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIGNhcmRJZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlUmVpbWJ1cnNlbWVudElucHV0LmNhcmRJZFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICByZWltYnVyc2VtZW50U3RhdHVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVSZWltYnVyc2VtZW50SW5wdXQucmVpbWJ1cnNlbWVudFN0YXR1c1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBwZW5kaW5nQ2FzaGJhY2tBbW91bnQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIE46IGNyZWF0ZVJlaW1idXJzZW1lbnRJbnB1dC5wZW5kaW5nQ2FzaGJhY2tBbW91bnQudG9TdHJpbmcoKVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBjcmVkaXRlZENhc2hiYWNrQW1vdW50OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBOOiBjcmVhdGVSZWltYnVyc2VtZW50SW5wdXQuY3JlZGl0ZWRDYXNoYmFja0Ftb3VudC50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbmN5Q29kZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlUmVpbWJ1cnNlbWVudElucHV0LmN1cnJlbmN5Q29kZVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAuLi4oY3JlYXRlUmVpbWJ1cnNlbWVudElucHV0LnRyYW5zYWN0aW9ucy5sZW5ndGggIT09IDAgJiYge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25zOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTDogbWFwcGVkVHJhbnNhY3Rpb25zXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZVJlaW1idXJzZW1lbnRJbnB1dC5jcmVhdGVkQXRcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlZEF0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVSZWltYnVyc2VtZW50SW5wdXQudXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICAvLyByZXR1cm4gdGhlIHJlaW1idXJzZW1lbnQgb2JqZWN0XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGlkOiBjcmVhdGVSZWltYnVyc2VtZW50SW5wdXQuaWQsXG4gICAgICAgICAgICAgICAgZGF0YTogY3JlYXRlUmVpbWJ1cnNlbWVudElucHV0IGFzIFJlaW1idXJzZW1lbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgJHtmaWVsZE5hbWV9IG11dGF0aW9uICR7ZXJyfWA7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgIGVycm9yVHlwZTogUmVpbWJ1cnNlbWVudHNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=