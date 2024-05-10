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
            // build the list of accounts to store
            createBankingItemInput.accounts.forEach(account => {
                if (account !== null) {
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
                                S: (0, uuid_1.v4)()
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
                        S: moonbeam_models_1.BankingItemStatus.Initiated
                    }
                },
            }));
            // return the Plaid Banking Item
            return {
                data: createBankingItemInput
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXRlQmFua2luZ0l0ZW1SZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL0NyZWF0ZUJhbmtpbmdJdGVtUmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsK0RBS21DO0FBQ25DLDhEQUF3RjtBQUN4RiwrQkFBa0M7QUFFbEM7Ozs7Ozs7R0FPRztBQUNJLE1BQU0saUJBQWlCLEdBQUcsS0FBSyxFQUFFLFNBQWlCLEVBQUUsc0JBQThDLEVBQWdDLEVBQUU7SUFDdkksSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2Qyw0Q0FBNEM7UUFDNUMsTUFBTSxjQUFjLEdBQUcsSUFBSSxnQ0FBYyxDQUFDLEVBQUMsTUFBTSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7UUFFNUQsZ0VBQWdFO1FBQ2hFLE1BQU0sU0FBUyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDM0Msc0JBQXNCLENBQUMsU0FBUyxHQUFHLHNCQUFzQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsc0JBQXNCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQy9ILHNCQUFzQixDQUFDLFNBQVMsR0FBRyxzQkFBc0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLHNCQUFzQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQ25ILHNCQUFzQixDQUFDLFNBQVMsR0FBRyxzQkFBc0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLHNCQUFzQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBRW5IOztXQUVHO1FBQ0gsTUFBTSwyQkFBMkIsR0FBRyxNQUFNLGNBQWMsQ0FBQyxJQUFJLENBQUMs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ICAgIEJhbmtpbmdBY2NvdW50U3RhdHVzLCBCYW5raW5nSXRlbSxcbiAgICBCYW5raW5nSXRlbUVycm9yVHlwZSxcbiAgICBCYW5raW5nSXRlbVJlc3BvbnNlLCBCYW5raW5nSXRlbVN0YXR1cyxcbiAgICBDcmVhdGVCYW5raW5nSXRlbUlucHV0XG59IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5pbXBvcnQge0R5bmFtb0RCQ2xpZW50LCBHZXRJdGVtQ29tbWFuZCwgUHV0SXRlbUNvbW1hbmR9IGZyb20gXCJAYXdzLXNkay9jbGllbnQtZHluYW1vZGJcIjtcbmltcG9ydCB7djQgYXMgdXVpZHY0fSBmcm9tICd1dWlkJztcblxuLyoqXG4gKiBDcmVhdGVCYW5raW5nSXRlbSByZXNvbHZlclxuICpcbiAqIEBwYXJhbSBmaWVsZE5hbWUgbmFtZSBvZiB0aGUgcmVzb2x2ZXIgcGF0aCBmcm9tIHRoZSBBcHBTeW5jIGV2ZW50XG4gKiBAcGFyYW0gY3JlYXRlQmFua2luZ0l0ZW1JbnB1dCBiYW5raW5nIGl0ZW0gaW5wdXQgb2JqZWN0LCB1c2VkIHRvIGNyZWF0ZSBhIG5ldyBQbGFpZCBCYW5raW5nIEl0ZW1cbiAqIHNlc3Npb24gb2JqZWN0XG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIEJhbmtpbmdJdGVtUmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCBjcmVhdGVCYW5raW5nSXRlbSA9IGFzeW5jIChmaWVsZE5hbWU6IHN0cmluZywgY3JlYXRlQmFua2luZ0l0ZW1JbnB1dDogQ3JlYXRlQmFua2luZ0l0ZW1JbnB1dCk6IFByb21pc2U8QmFua2luZ0l0ZW1SZXNwb25zZT4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgIC8vIGluaXRpYWxpemluZyB0aGUgRHluYW1vREIgZG9jdW1lbnQgY2xpZW50XG4gICAgICAgIGNvbnN0IGR5bmFtb0RiQ2xpZW50ID0gbmV3IER5bmFtb0RCQ2xpZW50KHtyZWdpb246IHJlZ2lvbn0pO1xuXG4gICAgICAgIC8vIHVwZGF0ZSB0aGUgY3JlYXRlIGFuZCB1cGRhdGUgdGltZXMsIGluIHRoZSBCYW5raW5nIEl0ZW0gaW5wdXRcbiAgICAgICAgY29uc3QgY3JlYXRlZEF0ID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgICAgICBjcmVhdGVCYW5raW5nSXRlbUlucHV0LnRpbWVzdGFtcCA9IGNyZWF0ZUJhbmtpbmdJdGVtSW5wdXQudGltZXN0YW1wID8gY3JlYXRlQmFua2luZ0l0ZW1JbnB1dC50aW1lc3RhbXAgOiBEYXRlLnBhcnNlKGNyZWF0ZWRBdCk7XG4gICAgICAgIGNyZWF0ZUJhbmtpbmdJdGVtSW5wdXQuY3JlYXRlZEF0ID0gY3JlYXRlQmFua2luZ0l0ZW1JbnB1dC5jcmVhdGVkQXQgPyBjcmVhdGVCYW5raW5nSXRlbUlucHV0LmNyZWF0ZWRBdCA6IGNyZWF0ZWRBdDtcbiAgICAgICAgY3JlYXRlQmFua2luZ0l0ZW1JbnB1dC51cGRhdGVkQXQgPSBjcmVhdGVCYW5raW5nSXRlbUlucHV0LnVwZGF0ZWRBdCA/IGNyZWF0ZUJhbmtpbmdJdGVtSW5wdXQudXBkYXRlZEF0IDogY3JlYXRlZEF0O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBjaGVjayB0byBzZWUgaWYgdGhlIFBsYWlkIEJhbmtpbmcgSXRlbSBhbHJlYWR5IGV4aXN0cy4gSWYgaXQgZG9lcywgdGhlbiByZXR1cm4gYW4gZXJyb3IuXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBwcmVFeGlzdGluZ1BsYWlkQmFua2luZ0l0ZW0gPSBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBHZXRJdGVtQ29tbWFuZCh7XG4gICAgICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52LkJBTktJTkdfSVRFTVNfVEFCTEUhLFxuICAgICAgICAgICAgS2V5OiB7XG4gICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlQmFua2luZ0l0ZW1JbnB1dC5pZFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGltZXN0YW1wOiB7XG4gICAgICAgICAgICAgICAgICAgIE46IGNyZWF0ZUJhbmtpbmdJdGVtSW5wdXQudGltZXN0YW1wLnRvU3RyaW5nKClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiB3ZSdyZSBub3QgaW50ZXJlc3RlZCBpbiBnZXR0aW5nIGFsbCB0aGUgZGF0YSBmb3IgdGhpcyBjYWxsLCBqdXN0IHRoZSBtaW5pbXVtIGZvciB1cyB0byBkZXRlcm1pbmUgd2hldGhlciB0aGlzIGlzIGEgZHVwbGljYXRlIG9yIG5vdFxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIEBsaW5rIGh0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9hbWF6b25keW5hbW9kYi9sYXRlc3QvZGV2ZWxvcGVyZ3VpZGUvUmVzZXJ2ZWRXb3Jkcy5odG1sXG4gICAgICAgICAgICAgKiBAbGluayBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vYW1hem9uZHluYW1vZGIvbGF0ZXN0L2RldmVsb3Blcmd1aWRlL0V4cHJlc3Npb25zLkV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lcy5odG1sXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIFByb2plY3Rpb25FeHByZXNzaW9uOiAnI2lkZicsXG4gICAgICAgICAgICBFeHByZXNzaW9uQXR0cmlidXRlTmFtZXM6IHtcbiAgICAgICAgICAgICAgICAnI2lkZic6ICdpZCdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuXG4gICAgICAgIC8vIGlmIHRoZXJlIGlzIGFuIGl0ZW0gcmV0cmlldmVkLCB0aGVuIHdlIHJldHVybiBhbiBlcnJvclxuICAgICAgICBpZiAocHJlRXhpc3RpbmdQbGFpZEJhbmtpbmdJdGVtICYmIHByZUV4aXN0aW5nUGxhaWRCYW5raW5nSXRlbS5JdGVtKSB7XG4gICAgICAgICAgICAvLyBpZiB0aGVyZSBpcyBhbiBleGlzdGVudCBQTGFpZCBCYW5raW5nIEl0ZW0gb2JqZWN0LCB0aGVuIHdlIGNhbm5vdCBkdXBsaWNhdGUgdGhhdCwgc28gd2Ugd2lsbCByZXR1cm4gYW4gZXJyb3JcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBQcmUtZXhpc3RpbmcgUGxhaWQgQmFua2luZyBJdGVtIG9iamVjdC4gRGVsZXRlIGl0IGJlZm9yZSBhZGRpbmcgYSBuZXcgb25lIWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogQmFua2luZ0l0ZW1FcnJvclR5cGUuRHVwbGljYXRlT2JqZWN0Rm91bmRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIHRoZSBhcnJheSBvZiBhY2NvdW50cyB0byBzdG9yZSBmb3IgdGhlIEJhbmtpbmcgSXRlbVxuICAgICAgICAgICAgY29uc3QgYWNjb3VudExpc3Q6IGFueVtdID0gW107XG4gICAgICAgICAgICAvLyBidWlsZCB0aGUgbGlzdCBvZiBhY2NvdW50cyB0byBzdG9yZVxuICAgICAgICAgICAgY3JlYXRlQmFua2luZ0l0ZW1JbnB1dC5hY2NvdW50cy5mb3JFYWNoKGFjY291bnQgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChhY2NvdW50ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGFjY291bnRMaXN0LnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgTToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjY291bnRJZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBhY2NvdW50LmFjY291bnRJZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWNjb3VudE1hc2s6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogYWNjb3VudC5hY2NvdW50TWFza1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWNjb3VudE5hbWU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogYWNjb3VudC5hY2NvdW50TmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWNjb3VudE51bWJlcjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBhY2NvdW50LmFjY291bnROdW1iZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjY291bnRPZmZpY2lhbE5hbWU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogYWNjb3VudC5hY2NvdW50T2ZmaWNpYWxOYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlQmFua2luZ0l0ZW1JbnB1dC5jcmVhdGVkQXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IHV1aWR2NCgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwZXJzaXN0ZW50QWNjb3VudElkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGFjY291bnQucGVyc2lzdGVudEFjY291bnRJZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm91dGluZ051bWJlcjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBhY2NvdW50LnJvdXRpbmdOdW1iZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1czoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBCYW5raW5nQWNjb3VudFN0YXR1cy5BY3RpdmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1YlR5cGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogYWNjb3VudC5zdWJUeXBlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGFjY291bnQudHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlZEF0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZUJhbmtpbmdJdGVtSW5wdXQudXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aXJlUm91dGluZ051bWJlcjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBhY2NvdW50LndpcmVSb3V0aW5nTnVtYmVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIHN0b3JlIHRoZSBCYW5raW5nIEl0ZW0gdXNpbmcgdGhlIGluZm9ybWF0aW9uIHJlY2VpdmVkIGluIHRoZSBpbnB1dFxuICAgICAgICAgICAgYXdhaXQgZHluYW1vRGJDbGllbnQuc2VuZChuZXcgUHV0SXRlbUNvbW1hbmQoe1xuICAgICAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuQkFOS0lOR19JVEVNU19UQUJMRSEsXG4gICAgICAgICAgICAgICAgSXRlbToge1xuICAgICAgICAgICAgICAgICAgICBpZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlQmFua2luZ0l0ZW1JbnB1dC5pZFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIE46IGNyZWF0ZUJhbmtpbmdJdGVtSW5wdXQudGltZXN0YW1wLnRvU3RyaW5nKClcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgaXRlbUlkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVCYW5raW5nSXRlbUlucHV0Lml0ZW1JZFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBpbnN0aXR1dGlvbklkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVCYW5raW5nSXRlbUlucHV0Lmluc3RpdHV0aW9uSWRcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgbmFtZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlQmFua2luZ0l0ZW1JbnB1dC5uYW1lXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlQmFua2luZ0l0ZW1JbnB1dC5jcmVhdGVkQXRcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlZEF0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVCYW5raW5nSXRlbUlucHV0LnVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBhY2Nlc3NUb2tlbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlQmFua2luZ0l0ZW1JbnB1dC5hY2Nlc3NUb2tlblxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBsaW5rVG9rZW46IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZUJhbmtpbmdJdGVtSW5wdXQubGlua1Rva2VuXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHB1YmxpY1Rva2VuOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVCYW5raW5nSXRlbUlucHV0LnB1YmxpY1Rva2VuXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGFjY291bnRzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBMOiBhY2NvdW50TGlzdFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IEJhbmtpbmdJdGVtU3RhdHVzLkluaXRpYXRlZFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBQbGFpZCBCYW5raW5nIEl0ZW1cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZGF0YTogY3JlYXRlQmFua2luZ0l0ZW1JbnB1dCBhcyBCYW5raW5nSXRlbVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyAke2ZpZWxkTmFtZX0gbXV0YXRpb24gJHtlcnJ9YDtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBCYW5raW5nSXRlbUVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==