import {
    BankingAccount,
    BankingAccountStatus,
    BankingItemErrorType,
    BankingItemResponse,
    BankingItemStatus,
    CreateBankingItemInput
} from "@moonbeam/moonbeam-models";
import {DynamoDBClient, GetItemCommand, PutItemCommand} from "@aws-sdk/client-dynamodb";
import {v4 as uuidv4} from 'uuid';

/**
 * CreateBankingItem resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param createBankingItemInput banking item input object, used to create a new Plaid Banking Item
 * session object
 * @returns {@link Promise} of {@link BankingItemResponse}
 */
export const createBankingItem = async (fieldName: string, createBankingItemInput: CreateBankingItemInput): Promise<BankingItemResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initializing the DynamoDB document client
        const dynamoDbClient = new DynamoDBClient({region: region});

        // update the create and update times, in the Banking Item input
        const createdAt = new Date().toISOString();
        createBankingItemInput.timestamp = createBankingItemInput.timestamp ? createBankingItemInput.timestamp : Date.parse(createdAt);
        createBankingItemInput.createdAt = createBankingItemInput.createdAt ? createBankingItemInput.createdAt : createdAt;
        createBankingItemInput.updatedAt = createBankingItemInput.updatedAt ? createBankingItemInput.updatedAt : createdAt;
        createBankingItemInput.status = createBankingItemInput.status ? createBankingItemInput.status : BankingItemStatus.Initiated;

        /**
         * check to see if the Plaid Banking Item already exists. If it does, then return an error.
         */
        const preExistingPlaidBankingItem = await dynamoDbClient.send(new GetItemCommand({
            TableName: process.env.BANKING_ITEMS_TABLE!,
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
                errorType: BankingItemErrorType.DuplicateObjectFound
            }
        } else {
            // the array of accounts to store for the Banking Item
            const accountList: any[] = [];
            // the array of accounts to be returned, as part of the returned object
            const resultAccounts: BankingAccount[] = [];
            // build the list of accounts to store
            createBankingItemInput.accounts.forEach(account => {
                if (account !== null) {
                    const accountId = uuidv4();
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
                                S: BankingAccountStatus.Active
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
                        createdAt: createBankingItemInput.createdAt!,
                        id: accountId,
                        persistentAccountId: account.persistentAccountId,
                        routingNumber: account.routingNumber,
                        status: BankingAccountStatus.Active,
                        subType: account.subType,
                        type: account.type,
                        updatedAt: createBankingItemInput.updatedAt!,
                        wireRoutingNumber: account.wireRoutingNumber
                    })
                }
            });
            // store the Banking Item using the information received in the input
            await dynamoDbClient.send(new PutItemCommand({
                TableName: process.env.BANKING_ITEMS_TABLE!,
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
                    createdAt: createBankingItemInput.createdAt!,
                    updatedAt: createBankingItemInput.updatedAt!,
                    accessToken: createBankingItemInput.accessToken!,
                    linkToken: createBankingItemInput.linkToken,
                    publicToken: createBankingItemInput.publicToken,
                    accounts: resultAccounts,
                    status: createBankingItemInput.status
                }
            }
        }
    } catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} mutation ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: BankingItemErrorType.UnexpectedError
        }
    }
}
