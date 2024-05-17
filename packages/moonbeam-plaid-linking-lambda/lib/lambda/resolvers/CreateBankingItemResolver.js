"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBankingItem = void 0;
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const uuid_1 = require("uuid");
/**
 * CreateBankingItem resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param createBankingItemInput banking item input object, used to create a new Plaid Banking Item
 * session object
 * @returns {@link Promise} of {@link BankingItemResponse}
 */
const createBankingItem = async (fieldName, createBankingItemInput) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        // initializing the DynamoDB document client
        const dynamoDbClient = new client_dynamodb_1.DynamoDBClient({ region: region });
        // update the create and update times, in the Banking Item input
        const createdAt = new Date().toISOString();
        createBankingItemInput.timestamp = createBankingItemInput.timestamp ? createBankingItemInput.timestamp : Date.parse(createdAt);
        createBankingItemInput.createdAt = createBankingItemInput.createdAt ? createBankingItemInput.createdAt : createdAt;
        createBankingItemInput.updatedAt = createBankingItemInput.updatedAt ? createBankingItemInput.updatedAt : createdAt;
        createBankingItemInput.status = createBankingItemInput.status ? createBankingItemInput.status : moonbeam_models_1.BankingItemStatus.Initiated;
        /**
         * check to see if the Plaid Banking Item already exists. If it does, then return an error.
         */
        const preExistingPlaidBankingItem = await dynamoDbClient.send(new client_dynamodb_1.GetItemCommand({
            TableName: process.env.BANKING_ITEMS_TABLE,
            Key: {
                id: {
                    S: createBankingItemInput.id
                },
                timestamp: {
                    N: createBankingItemInput.timestamp.toString()
                }
            },
            /**
             * we're not interested in getting all the data for this call, just the minimum for us to determine whether this is a duplicate or not
             *
             * @link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html
             * @link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ExpressionAttributeNames.html
             */
            ProjectionExpression: '#idf',
            ExpressionAttributeNames: {
                '#idf': 'id'
            }
        }));
        // if there is an item retrieved, then we return an error
        if (preExistingPlaidBankingItem && preExistingPlaidBankingItem.Item) {
            // if there is an existent PLaid Banking Item object, then we cannot duplicate that, so we will return an error
            const errorMessage = `Pre-existing Plaid Banking Item object. Delete it before adding a new one!`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.BankingItemErrorType.DuplicateObjectFound
            };
        }
        else {
            // the array of accounts to store for the Banking Item
            const accountList = [];
            // the array of accounts to be returned, as part of the returned object
            const resultAccounts = [];
            // build the list of accounts to store
            createBankingItemInput.accounts.forEach(account => {
                if (account !== null) {
                    const accountId = (0, uuid_1.v4)();
                    // build a list of accounts to store
                    accountList.push({
                        M: {
                            accountId: {
                                S: account.accountId
                            },
                            accountMask: {
                                S: account.accountMask
                            },
                            accountName: {
                                S: account.accountName
                            },
                            accountNumber: {
                                S: account.accountNumber
                            },
                            accountOfficialName: {
                                S: account.accountOfficialName
                            },
                            createdAt: {
                                S: createBankingItemInput.createdAt
                            },
                            id: {
                                S: accountId
                            },
                            persistentAccountId: {
                                S: account.persistentAccountId
                            },
                            routingNumber: {
                                S: account.routingNumber
                            },
                            status: {
                                S: moonbeam_models_1.BankingAccountStatus.Active
                            },
                            subType: {
                                S: account.subType
                            },
                            type: {
                                S: account.type
                            },
                            updatedAt: {
                                S: createBankingItemInput.updatedAt
                            },
                            wireRoutingNumber: {
                                S: account.wireRoutingNumber
                            }
                        }
                    });
                    // build a list of accounts to return
                    resultAccounts.push({
                        accountId: account.accountId,
                        accountMask: account.accountMask,
                        accountName: account.accountName,
                        accountNumber: account.accountNumber,
                        accountOfficialName: account.accountOfficialName,
                        createdAt: createBankingItemInput.createdAt,
                        id: accountId,
                        persistentAccountId: account.persistentAccountId,
                        routingNumber: account.routingNumber,
                        status: moonbeam_models_1.BankingAccountStatus.Active,
                        subType: account.subType,
                        type: account.type,
                        updatedAt: createBankingItemInput.updatedAt,
                        wireRoutingNumber: account.wireRoutingNumber
                    });
                }
            });
            // store the Banking Item using the information received in the input
            await dynamoDbClient.send(new client_dynamodb_1.PutItemCommand({
                TableName: process.env.BANKING_ITEMS_TABLE,
                Item: {
                    id: {
                        S: createBankingItemInput.id
                    },
                    timestamp: {
                        N: createBankingItemInput.timestamp.toString()
                    },
                    itemId: {
                        S: createBankingItemInput.itemId
                    },
                    institutionId: {
                        S: createBankingItemInput.institutionId
                    },
                    name: {
                        S: createBankingItemInput.name
                    },
                    createdAt: {
                        S: createBankingItemInput.createdAt
                    },
                    updatedAt: {
                        S: createBankingItemInput.updatedAt
                    },
                    accessToken: {
                        S: createBankingItemInput.accessToken
                    },
                    linkToken: {
                        S: createBankingItemInput.linkToken
                    },
                    publicToken: {
                        S: createBankingItemInput.publicToken
                    },
                    accounts: {
                        L: accountList
                    },
                    status: {
                        S: createBankingItemInput.status
                    }
                },
            }));
            // return the Plaid Banking Item
            return {
                data: {
                    id: createBankingItemInput.id,
                    timestamp: createBankingItemInput.timestamp,
                    itemId: createBankingItemInput.itemId,
                    institutionId: createBankingItemInput.institutionId,
                    name: createBankingItemInput.name,
                    createdAt: createBankingItemInput.createdAt,
                    updatedAt: createBankingItemInput.updatedAt,
                    accessToken: createBankingItemInput.accessToken,
                    linkToken: createBankingItemInput.linkToken,
                    publicToken: createBankingItemInput.publicToken,
                    accounts: resultAccounts,
                    status: createBankingItemInput.status
                }
            };
        }
    }
    catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} mutation ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: moonbeam_models_1.BankingItemErrorType.UnexpectedError
        };
    }
};
exports.createBankingItem = createBankingItem;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXRlQmFua2luZ0l0ZW1SZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL0NyZWF0ZUJhbmtpbmdJdGVtUmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsK0RBT21DO0FBQ25DLDhEQUF3RjtBQUN4RiwrQkFBa0M7QUFFbEM7Ozs7Ozs7R0FPRztBQUNJLE1BQU0saUJBQWlCLEdBQUcsS0FBSyxFQUFFLFNBQWlCLEVBQUUsc0JBQThDLEVBQWdDLEVBQUU7SUFDdkksSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2Qyw0Q0FBNEM7UUFDNUMsTUFBTSxjQUFjLEdBQUcsSUFBSSxnQ0FBYyxDQUFDLEVBQUMsTUFBTSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7UUFFNUQsZ0VBQWdFO1FBQ2hFLE1BQU0sU0FBUyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDM0Msc0JBQXNCLENBQUMsU0FBUyxHQUFHLHNCQUFzQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsc0JBQXNCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQy9ILHNCQUFzQixDQUFDLFNBQVMsR0FBRyxzQkFBc0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLHNCQUFzQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQ25ILHNCQUFzQixDQUFDLFNBQVMsR0FBRyxzQkFBc0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLHNCQUFzQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQ25ILHNCQUFzQixDQUFDLE1BQU0sR0FBRyxzQkFBc0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFD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QUFhLEdBQUcsRUFBRSxDQUFDO1FBQ3JGLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDMUIsT0FBTztZQUNILFlBQVksRUFBRSxZQUFZO1lBQzFCLFNBQVMsRUFBRSxzQ0FBb0IsQ0FBQyxlQUFlO1NBQ2xELENBQUE7S0FDSjtBQUNMLENBQUMsQ0FBQTtBQWxNWSxRQUFBLGlCQUFpQixxQkFrTTdCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgICBCYW5raW5nQWNjb3VudCxcbiAgICBCYW5raW5nQWNjb3VudFN0YXR1cyxcbiAgICBCYW5raW5nSXRlbUVycm9yVHlwZSxcbiAgICBCYW5raW5nSXRlbVJlc3BvbnNlLFxuICAgIEJhbmtpbmdJdGVtU3RhdHVzLFxuICAgIENyZWF0ZUJhbmtpbmdJdGVtSW5wdXRcbn0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcbmltcG9ydCB7RHluYW1vREJDbGllbnQsIEdldEl0ZW1Db21tYW5kLCBQdXRJdGVtQ29tbWFuZH0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1keW5hbW9kYlwiO1xuaW1wb3J0IHt2NCBhcyB1dWlkdjR9IGZyb20gJ3V1aWQnO1xuXG4vKipcbiAqIENyZWF0ZUJhbmtpbmdJdGVtIHJlc29sdmVyXG4gKlxuICogQHBhcmFtIGZpZWxkTmFtZSBuYW1lIG9mIHRoZSByZXNvbHZlciBwYXRoIGZyb20gdGhlIEFwcFN5bmMgZXZlbnRcbiAqIEBwYXJhbSBjcmVhdGVCYW5raW5nSXRlbUlucHV0IGJhbmtpbmcgaXRlbSBpbnB1dCBvYmplY3QsIHVzZWQgdG8gY3JlYXRlIGEgbmV3IFBsYWlkIEJhbmtpbmcgSXRlbVxuICogc2Vzc2lvbiBvYmplY3RcbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgQmFua2luZ0l0ZW1SZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IGNyZWF0ZUJhbmtpbmdJdGVtID0gYXN5bmMgKGZpZWxkTmFtZTogc3RyaW5nLCBjcmVhdGVCYW5raW5nSXRlbUlucHV0OiBDcmVhdGVCYW5raW5nSXRlbUlucHV0KTogUHJvbWlzZTxCYW5raW5nSXRlbVJlc3BvbnNlPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gcmV0cmlldmluZyB0aGUgY3VycmVudCBmdW5jdGlvbiByZWdpb25cbiAgICAgICAgY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiE7XG5cbiAgICAgICAgLy8gaW5pdGlhbGl6aW5nIHRoZSBEeW5hbW9EQiBkb2N1bWVudCBjbGllbnRcbiAgICAgICAgY29uc3QgZHluYW1vRGJDbGllbnQgPSBuZXcgRHluYW1vREJDbGllbnQoe3JlZ2lvbjogcmVnaW9ufSk7XG5cbiAgICAgICAgLy8gdXBkYXRlIHRoZSBjcmVhdGUgYW5kIHVwZGF0ZSB0aW1lcywgaW4gdGhlIEJhbmtpbmcgSXRlbSBpbnB1dFxuICAgICAgICBjb25zdCBjcmVhdGVkQXQgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgICAgIGNyZWF0ZUJhbmtpbmdJdGVtSW5wdXQudGltZXN0YW1wID0gY3JlYXRlQmFua2luZ0l0ZW1JbnB1dC50aW1lc3RhbXAgPyBjcmVhdGVCYW5raW5nSXRlbUlucHV0LnRpbWVzdGFtcCA6IERhdGUucGFyc2UoY3JlYXRlZEF0KTtcbiAgICAgICAgY3JlYXRlQmFua2luZ0l0ZW1JbnB1dC5jcmVhdGVkQXQgPSBjcmVhdGVCYW5raW5nSXRlbUlucHV0LmNyZWF0ZWRBdCA/IGNyZWF0ZUJhbmtpbmdJdGVtSW5wdXQuY3JlYXRlZEF0IDogY3JlYXRlZEF0O1xuICAgICAgICBjcmVhdGVCYW5raW5nSXRlbUlucHV0LnVwZGF0ZWRBdCA9IGNyZWF0ZUJhbmtpbmdJdGVtSW5wdXQudXBkYXRlZEF0ID8gY3JlYXRlQmFua2luZ0l0ZW1JbnB1dC51cGRhdGVkQXQgOiBjcmVhdGVkQXQ7XG4gICAgICAgIGNyZWF0ZUJhbmtpbmdJdGVtSW5wdXQuc3RhdHVzID0gY3JlYXRlQmFua2luZ0l0ZW1JbnB1dC5zdGF0dXMgPyBjcmVhdGVCYW5raW5nSXRlbUlucHV0LnN0YXR1cyA6IEJhbmtpbmdJdGVtU3RhdHVzLkluaXRpYXRlZDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogY2hlY2sgdG8gc2VlIGlmIHRoZSBQbGFpZCBCYW5raW5nIEl0ZW0gYWxyZWFkeSBleGlzdHMuIElmIGl0IGRvZXMsIHRoZW4gcmV0dXJuIGFuIGVycm9yLlxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3QgcHJlRXhpc3RpbmdQbGFpZEJhbmtpbmdJdGVtID0gYXdhaXQgZHluYW1vRGJDbGllbnQuc2VuZChuZXcgR2V0SXRlbUNvbW1hbmQoe1xuICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5CQU5LSU5HX0lURU1TX1RBQkxFISxcbiAgICAgICAgICAgIEtleToge1xuICAgICAgICAgICAgICAgIGlkOiB7XG4gICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZUJhbmtpbmdJdGVtSW5wdXQuaWRcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRpbWVzdGFtcDoge1xuICAgICAgICAgICAgICAgICAgICBOOiBjcmVhdGVCYW5raW5nSXRlbUlucHV0LnRpbWVzdGFtcC50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogd2UncmUgbm90IGludGVyZXN0ZWQgaW4gZ2V0dGluZyBhbGwgdGhlIGRhdGEgZm9yIHRoaXMgY2FsbCwganVzdCB0aGUgbWluaW11bSBmb3IgdXMgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdGhpcyBpcyBhIGR1cGxpY2F0ZSBvciBub3RcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBAbGluayBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vYW1hem9uZHluYW1vZGIvbGF0ZXN0L2RldmVsb3Blcmd1aWRlL1Jlc2VydmVkV29yZHMuaHRtbFxuICAgICAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2FtYXpvbmR5bmFtb2RiL2xhdGVzdC9kZXZlbG9wZXJndWlkZS9FeHByZXNzaW9ucy5FeHByZXNzaW9uQXR0cmlidXRlTmFtZXMuaHRtbFxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBQcm9qZWN0aW9uRXhwcmVzc2lvbjogJyNpZGYnLFxuICAgICAgICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzOiB7XG4gICAgICAgICAgICAgICAgJyNpZGYnOiAnaWQnXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKTtcblxuICAgICAgICAvLyBpZiB0aGVyZSBpcyBhbiBpdGVtIHJldHJpZXZlZCwgdGhlbiB3ZSByZXR1cm4gYW4gZXJyb3JcbiAgICAgICAgaWYgKHByZUV4aXN0aW5nUGxhaWRCYW5raW5nSXRlbSAmJiBwcmVFeGlzdGluZ1BsYWlkQmFua2luZ0l0ZW0uSXRlbSkge1xuICAgICAgICAgICAgLy8gaWYgdGhlcmUgaXMgYW4gZXhpc3RlbnQgUExhaWQgQmFua2luZyBJdGVtIG9iamVjdCwgdGhlbiB3ZSBjYW5ub3QgZHVwbGljYXRlIHRoYXQsIHNvIHdlIHdpbGwgcmV0dXJuIGFuIGVycm9yXG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgUHJlLWV4aXN0aW5nIFBsYWlkIEJhbmtpbmcgSXRlbSBvYmplY3QuIERlbGV0ZSBpdCBiZWZvcmUgYWRkaW5nIGEgbmV3IG9uZSFgO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IEJhbmtpbmdJdGVtRXJyb3JUeXBlLkR1cGxpY2F0ZU9iamVjdEZvdW5kXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyB0aGUgYXJyYXkgb2YgYWNjb3VudHMgdG8gc3RvcmUgZm9yIHRoZSBCYW5raW5nIEl0ZW1cbiAgICAgICAgICAgIGNvbnN0IGFjY291bnRMaXN0OiBhbnlbXSA9IFtdO1xuICAgICAgICAgICAgLy8gdGhlIGFycmF5IG9mIGFjY291bnRzIHRvIGJlIHJldHVybmVkLCBhcyBwYXJ0IG9mIHRoZSByZXR1cm5lZCBvYmplY3RcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdEFjY291bnRzOiBCYW5raW5nQWNjb3VudFtdID0gW107XG4gICAgICAgICAgICAvLyBidWlsZCB0aGUgbGlzdCBvZiBhY2NvdW50cyB0byBzdG9yZVxuICAgICAgICAgICAgY3JlYXRlQmFua2luZ0l0ZW1JbnB1dC5hY2NvdW50cy5mb3JFYWNoKGFjY291bnQgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChhY2NvdW50ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGFjY291bnRJZCA9IHV1aWR2NCgpO1xuICAgICAgICAgICAgICAgICAgICAvLyBidWlsZCBhIGxpc3Qgb2YgYWNjb3VudHMgdG8gc3RvcmVcbiAgICAgICAgICAgICAgICAgICAgYWNjb3VudExpc3QucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBNOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWNjb3VudElkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGFjY291bnQuYWNjb3VudElkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY2NvdW50TWFzazoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBhY2NvdW50LmFjY291bnRNYXNrXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY2NvdW50TmFtZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBhY2NvdW50LmFjY291bnROYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY2NvdW50TnVtYmVyOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGFjY291bnQuYWNjb3VudE51bWJlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWNjb3VudE9mZmljaWFsTmFtZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBhY2NvdW50LmFjY291bnRPZmZpY2lhbE5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVCYW5raW5nSXRlbUlucHV0LmNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogYWNjb3VudElkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwZXJzaXN0ZW50QWNjb3VudElkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGFjY291bnQucGVyc2lzdGVudEFjY291bnRJZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm91dGluZ051bWJlcjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBhY2NvdW50LnJvdXRpbmdOdW1iZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1czoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBCYW5raW5nQWNjb3VudFN0YXR1cy5BY3RpdmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1YlR5cGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogYWNjb3VudC5zdWJUeXBlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGFjY291bnQudHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlZEF0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZUJhbmtpbmdJdGVtSW5wdXQudXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aXJlUm91dGluZ051bWJlcjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBhY2NvdW50LndpcmVSb3V0aW5nTnVtYmVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgLy8gYnVpbGQgYSBsaXN0IG9mIGFjY291bnRzIHRvIHJldHVyblxuICAgICAgICAgICAgICAgICAgICByZXN1bHRBY2NvdW50cy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjY291bnRJZDogYWNjb3VudC5hY2NvdW50SWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBhY2NvdW50TWFzazogYWNjb3VudC5hY2NvdW50TWFzayxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjY291bnROYW1lOiBhY2NvdW50LmFjY291bnROYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgYWNjb3VudE51bWJlcjogYWNjb3VudC5hY2NvdW50TnVtYmVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgYWNjb3VudE9mZmljaWFsTmFtZTogYWNjb3VudC5hY2NvdW50T2ZmaWNpYWxOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEF0OiBjcmVhdGVCYW5raW5nSXRlbUlucHV0LmNyZWF0ZWRBdCEsXG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogYWNjb3VudElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGVyc2lzdGVudEFjY291bnRJZDogYWNjb3VudC5wZXJzaXN0ZW50QWNjb3VudElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgcm91dGluZ051bWJlcjogYWNjb3VudC5yb3V0aW5nTnVtYmVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiBCYW5raW5nQWNjb3VudFN0YXR1cy5BY3RpdmUsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdWJUeXBlOiBhY2NvdW50LnN1YlR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBhY2NvdW50LnR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVkQXQ6IGNyZWF0ZUJhbmtpbmdJdGVtSW5wdXQudXBkYXRlZEF0ISxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpcmVSb3V0aW5nTnVtYmVyOiBhY2NvdW50LndpcmVSb3V0aW5nTnVtYmVyXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBzdG9yZSB0aGUgQmFua2luZyBJdGVtIHVzaW5nIHRoZSBpbmZvcm1hdGlvbiByZWNlaXZlZCBpbiB0aGUgaW5wdXRcbiAgICAgICAgICAgIGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IFB1dEl0ZW1Db21tYW5kKHtcbiAgICAgICAgICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52LkJBTktJTkdfSVRFTVNfVEFCTEUhLFxuICAgICAgICAgICAgICAgIEl0ZW06IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZUJhbmtpbmdJdGVtSW5wdXQuaWRcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBOOiBjcmVhdGVCYW5raW5nSXRlbUlucHV0LnRpbWVzdGFtcC50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1JZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlQmFua2luZ0l0ZW1JbnB1dC5pdGVtSWRcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgaW5zdGl0dXRpb25JZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlQmFua2luZ0l0ZW1JbnB1dC5pbnN0aXR1dGlvbklkXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZUJhbmtpbmdJdGVtSW5wdXQubmFtZVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZUJhbmtpbmdJdGVtSW5wdXQuY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRBdDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlQmFua2luZ0l0ZW1JbnB1dC51cGRhdGVkQXRcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgYWNjZXNzVG9rZW46IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZUJhbmtpbmdJdGVtSW5wdXQuYWNjZXNzVG9rZW5cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgbGlua1Rva2VuOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVCYW5raW5nSXRlbUlucHV0LmxpbmtUb2tlblxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBwdWJsaWNUb2tlbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlQmFua2luZ0l0ZW1JbnB1dC5wdWJsaWNUb2tlblxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBhY2NvdW50czoge1xuICAgICAgICAgICAgICAgICAgICAgICAgTDogYWNjb3VudExpc3RcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVCYW5raW5nSXRlbUlucHV0LnN0YXR1c1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBQbGFpZCBCYW5raW5nIEl0ZW1cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICBpZDogY3JlYXRlQmFua2luZ0l0ZW1JbnB1dC5pZCxcbiAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiBjcmVhdGVCYW5raW5nSXRlbUlucHV0LnRpbWVzdGFtcCxcbiAgICAgICAgICAgICAgICAgICAgaXRlbUlkOiBjcmVhdGVCYW5raW5nSXRlbUlucHV0Lml0ZW1JZCxcbiAgICAgICAgICAgICAgICAgICAgaW5zdGl0dXRpb25JZDogY3JlYXRlQmFua2luZ0l0ZW1JbnB1dC5pbnN0aXR1dGlvbklkLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBjcmVhdGVCYW5raW5nSXRlbUlucHV0Lm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDogY3JlYXRlQmFua2luZ0l0ZW1JbnB1dC5jcmVhdGVkQXQhLFxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVkQXQ6IGNyZWF0ZUJhbmtpbmdJdGVtSW5wdXQudXBkYXRlZEF0ISxcbiAgICAgICAgICAgICAgICAgICAgYWNjZXNzVG9rZW46IGNyZWF0ZUJhbmtpbmdJdGVtSW5wdXQuYWNjZXNzVG9rZW4hLFxuICAgICAgICAgICAgICAgICAgICBsaW5rVG9rZW46IGNyZWF0ZUJhbmtpbmdJdGVtSW5wdXQubGlua1Rva2VuLFxuICAgICAgICAgICAgICAgICAgICBwdWJsaWNUb2tlbjogY3JlYXRlQmFua2luZ0l0ZW1JbnB1dC5wdWJsaWNUb2tlbixcbiAgICAgICAgICAgICAgICAgICAgYWNjb3VudHM6IHJlc3VsdEFjY291bnRzLFxuICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IGNyZWF0ZUJhbmtpbmdJdGVtSW5wdXQuc3RhdHVzXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyAke2ZpZWxkTmFtZX0gbXV0YXRpb24gJHtlcnJ9YDtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBCYW5raW5nSXRlbUVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==