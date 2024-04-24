"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReimbursement = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const uuid_1 = require("uuid");
/**
 * CreateReimbursement resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param createReimbursementInput create reimbursement input object, used to create a reimbursement.
 * @returns {@link Promise} of {@link ReimbursementResponse}
 */
const createReimbursement = async (fieldName, createReimbursementInput) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        // initializing the DynamoDB document client
        const dynamoDbClient = new client_dynamodb_1.DynamoDBClient({ region: region });
        // initialize the appropriate Clients
        const moonbeamClient = new moonbeam_models_1.MoonbeamClient(process.env.ENV_NAME, region);
        const oliveClient = new moonbeam_models_1.OliveClient(process.env.ENV_NAME, region);
        /**
         * Creating a reimbursement involves multiple steps:
         *
         * 1) Call the POST/createClientTransaction (/transactions/authorizations) Olive API, to integrate with a payment
         * provider, and actually push money into someone's card.
         * ToDo: Need to integrate step 1) into this overall process once Olive enables payment provider integration.
         *
         * For each transaction within the incoming mapped transactions, execute steps 2) and 3), as follows:
         *
         * 2) Call the PUT/updateRewardStatus (/transactions/{id}/reward) Olive API, in order to specify the amount that
         * got distributed to the end user's card, in step 1). For now we will not allow for partial cash-outs, only for full
         * amounts (this is only for non 1 cent related transactions).
         *
         * 3) Call the /updateTransaction internal Moonbeam AWS AppSync API, in order to update each one of the incoming transactions
         * mapped to the reimbursement internally as well. This call updates 3 things:
         *
         * - transactionStatus:
         *   for incoming PROCESSED -> update to FRONTED (specifying that we cashed out a transaction before receiving the money from Olive for it)
         *   for incoming FUNDED -> update to CREDITED (specifying that we cashed out a transaction, and we received the money from Olive for it)
         *
         * - pendingCashbackAmount (done internally within the API call):
         *   this will have to be reduced to 0.00 for each transaction, specifying that there are $0.00 pending to credit for that transaction
         *
         * - creditedCashbackAmount (done internally within the API call):
         *   this will have to be equal to the 'rewardAmount', specifying the amount that has been credited to the end-user
         *
         * 4) Store the reimbursement in the table, with the appropriate transaction statuses updated in it, both from an external (Olive) perspective,
         * and an internal (Moonbeam) perspective.
         *
         * first update the timestamps accordingly
         */
        const createdAt = new Date().toISOString();
        createReimbursementInput.timestamp = createReimbursementInput.timestamp ? createReimbursementInput.timestamp : Date.parse(createdAt);
        createReimbursementInput.createdAt = createReimbursementInput.createdAt ? createReimbursementInput.createdAt : createdAt;
        createReimbursementInput.updatedAt = createReimbursementInput.updatedAt ? createReimbursementInput.updatedAt : createdAt;
        // generate a unique identifier for the reimbursement, if not already passed in
        createReimbursementInput.reimbursementId = createReimbursementInput.reimbursementId ? createReimbursementInput.reimbursementId : (0, uuid_1.v4)();
        // go through each transaction within the incoming transaction and make sure that they get updated internally and externally accordingly
        let transactionUpdatesSucceeded = true;
        for (const transaction of createReimbursementInput.transactions) {
            if (transaction !== null) {
                if ((transaction.transactionType !== moonbeam_models_1.TransactionType.OliveIneligibleMatched) && (transaction.transactionType !== moonbeam_models_1.TransactionType.OliveIneligibleUnmatched)) {
                    // 2) Call the PUT/updateRewardStatus (/transactions/{id}/reward) Olive API (this is only for the non 1 cent related transactions).
                    await oliveClient.updateTransactionStatus(transaction.transactionId, transaction.rewardAmount);
                    // 3) Call the /updateTransaction internal Moonbeam AWS AppSync API
                    const moonbeamUpdatedTransactionResponse = await moonbeamClient.updateTransaction({
                        id: transaction.id,
                        timestamp: transaction.timestamp,
                        transactionId: transaction.transactionId,
                        /**
                         * for incoming PROCESSED -> update to FRONTED (specifying that we cashed out a transaction before receiving the money from Olive for it)
                         * for incoming FUNDED -> update to CREDITED (specifying that we cashed out a transaction, and we received the money from Olive for it)
                         */
                        transactionStatus: transaction.transactionStatus === moonbeam_models_1.TransactionsStatus.Processed
                            ? moonbeam_models_1.TransactionsStatus.Fronted
                            : (transaction.transactionStatus === moonbeam_models_1.TransactionsStatus.Funded
                                ? moonbeam_models_1.TransactionsStatus.Credited
                                : transaction.transactionStatus)
                    });
                    // check to make sure that we can continue with the reimbursement process
                    if (!moonbeamUpdatedTransactionResponse || moonbeamUpdatedTransactionResponse.errorType ||
                        moonbeamUpdatedTransactionResponse.errorMessage || !moonbeamUpdatedTransactionResponse.data) {
                        // set the failure flag accordingly
                        transactionUpdatesSucceeded = false;
                        break;
                    }
                    // check to make sure that we can continue with the reimbursement process
                    // if (oliveUpdatedTransactionResponse.data !== undefined && oliveUpdatedTransactionResponse.data !== null &&
                    //     oliveUpdatedTransactionResponse.data === ReimbursementProcessingStatus.Success) {
                    //
                    // } else {
                    //     // set the failure flag accordingly
                    //     transactionUpdatesSucceeded = false;
                    //     break;
                    // }
                }
                else {
                    // 3) Call the /updateTransaction internal Moonbeam AWS AppSync API
                    const moonbeamUpdatedTransactionResponse = await moonbeamClient.updateTransaction({
                        id: transaction.id,
                        timestamp: transaction.timestamp,
                        transactionId: transaction.transactionId,
                        /**
                         * for incoming PROCESSED -> update to FRONTED (specifying that we cashed out a transaction before receiving the money from Olive for it)
                         * for incoming FUNDED -> update to CREDITED (specifying that we cashed out a transaction, and we received the money from Olive for it)
                         */
                        transactionStatus: transaction.transactionStatus === moonbeam_models_1.TransactionsStatus.Processed
                            ? moonbeam_models_1.TransactionsStatus.Fronted
                            : (transaction.transactionStatus === moonbeam_models_1.TransactionsStatus.Funded
                                ? moonbeam_models_1.TransactionsStatus.Credited
                                : transaction.transactionStatus)
                    });
                    // check to make sure that we can continue with the reimbursement process
                    if (!moonbeamUpdatedTransactionResponse || moonbeamUpdatedTransactionResponse.errorType ||
                        moonbeamUpdatedTransactionResponse.errorMessage || !moonbeamUpdatedTransactionResponse.data) {
                        // set the failure flag accordingly
                        transactionUpdatesSucceeded = false;
                        break;
                    }
                }
            }
            else {
                // set the failure flag accordingly
                transactionUpdatesSucceeded = false;
                break;
            }
        }
        // make sure that we only proceed if all transactions have been updated accordingly
        if (!transactionUpdatesSucceeded) {
            const errorMessage = `Unexpected error while updating reimbursement related transactions!`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.ReimbursementsErrorType.UnexpectedError
            };
        }
        else {
            /**
             * 4) Store the reimbursement in the table, with the appropriate transaction statuses updated in it, both from an external (Olive) perspective,
             * and an internal (Moonbeam) perspective.
             *
             * check to see if the reimbursement already exists in the DB. Although this is a very rare situation, since we have so many resilient
             * methods, we want to put a safeguard around duplicates even here.
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
                // create the transaction array pertaining to the reimbursements, to store
                const transactions = [];
                createReimbursementInput.transactions.forEach(transaction => {
                    // modify the transaction statuses and amounts to be returned
                    transaction.transactionStatus =
                        transaction.transactionStatus === moonbeam_models_1.TransactionsStatus.Processed
                            ? moonbeam_models_1.TransactionsStatus.Fronted
                            : (transaction.transactionStatus === moonbeam_models_1.TransactionsStatus.Funded
                                ? moonbeam_models_1.TransactionsStatus.Credited
                                : transaction.transactionStatus);
                    transaction.pendingCashbackAmount = 0.00;
                    transaction.creditedCashbackAmount = Number(transaction.rewardAmount.toFixed(2));
                    // push the transaction in the list of transactions to be stored
                    transactions.push({
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
                            },
                            transactionType: {
                                S: transaction.transactionType
                            },
                            createdAt: {
                                S: transaction.createdAt
                            },
                            updatedAt: {
                                S: transaction.updatedAt
                            },
                            cardId: {
                                S: transaction.cardId
                            },
                            memberId: {
                                S: transaction.memberId
                            },
                            brandId: {
                                S: transaction.brandId
                            },
                            storeId: {
                                S: transaction.storeId
                            },
                            category: {
                                S: transaction.category
                            },
                            currencyCode: {
                                S: transaction.currencyCode
                            },
                            rewardAmount: {
                                N: transaction.rewardAmount.toFixed(2).toString()
                            },
                            totalAmount: {
                                N: transaction.totalAmount.toFixed(2).toString()
                            },
                            pendingCashbackAmount: {
                                N: transaction.pendingCashbackAmount.toFixed(2).toString()
                            },
                            creditedCashbackAmount: {
                                N: transaction.creditedCashbackAmount.toFixed(2).toString()
                            },
                            transactionBrandName: {
                                S: transaction.transactionBrandName
                            },
                            transactionBrandAddress: {
                                S: transaction.transactionBrandAddress
                            },
                            transactionBrandLogoUrl: {
                                S: transaction.transactionBrandLogoUrl
                            },
                            transactionBrandURLAddress: {
                                S: transaction.transactionBrandURLAddress
                            },
                            transactionIsOnline: {
                                BOOL: transaction.transactionIsOnline
                            }
                        }
                    });
                });
                // store the reimbursements object
                await dynamoDbClient.send(new client_dynamodb_1.PutItemCommand({
                    TableName: process.env.REIMBURSEMENTS_TABLE,
                    Item: {
                        amount: {
                            N: createReimbursementInput.amount.toFixed(2).toString()
                        },
                        cardId: {
                            S: createReimbursementInput.cardId
                        },
                        cardLast4: {
                            S: createReimbursementInput.cardLast4
                        },
                        cardType: {
                            S: createReimbursementInput.cardType
                        },
                        id: {
                            S: createReimbursementInput.id
                        },
                        reimbursementId: {
                            S: createReimbursementInput.reimbursementId
                        },
                        status: {
                            S: createReimbursementInput.status
                        },
                        timestamp: {
                            N: createReimbursementInput.timestamp.toString()
                        },
                        createdAt: {
                            S: createReimbursementInput.createdAt
                        },
                        updatedAt: {
                            S: createReimbursementInput.updatedAt
                        },
                        transactions: {
                            L: transactions
                        }
                    },
                }));
                // return the reimbursements object created
                return {
                    data: [createReimbursementInput]
                };
            }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXRlUmVpbWJ1cnNlbWVudHNSZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL0NyZWF0ZVJlaW1idXJzZW1lbnRzUmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsOERBQXdHO0FBQ3hHLCtEQVNtQztBQUNuQywrQkFBa0M7QUFFbEM7Ozs7OztHQU1HO0FBQ0ksTUFBTSxtQkFBbUIsR0FBRyxLQUFLLEVBQUUsU0FBaUIsRUFBRSx3QkFBa0QsRUFBa0MsRUFBRTtJQUMvSSxJQUFJO1FBQ0EseUNBQXlDO1FBQ3pDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVyxDQUFDO1FBRXZDLDRDQUE0QztRQUM1QyxNQUFNLGNBQWMsR0FBRyxJQUFJLGdDQUFjLENBQUMsRUFBQyxNQUFNLEVBQUUsTUFBTSxFQUFDLENBQUMsQ0FBQztRQUU1RCxxQ0FBcUM7UUFDckMsTUFBTSxjQUFjLEdBQUcsSUFBSSxnQ0FBYyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3pFLE1BQU0sV0FBVyxHQUFHLElBQUksNkJBQVcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUVuRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1dBOEJHO1FBQ0gsTUFBTSxTQUFTLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUMzQyx3QkFBd0IsQ0FBQyxTQUFTLEdBQUcsd0JBQXdCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyx3QkFBd0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDckksd0JBQXdCLENBQUMsU0FBUyxHQUFHLHdCQUF3QixDQUFDLFNBQVMsQ0FBQyxDQUFD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RTs0QkFDUCxDQUFDLEVBQUUsd0JBQXdCLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRTt5QkFDbkQ7d0JBQ0QsU0FBUyxFQUFFOzRCQUNQLENBQUMsRUFBRSx3QkFBd0IsQ0FBQyxTQUFTO3lCQUN4Qzt3QkFDRCxTQUFTLEVBQUU7NEJBQ1AsQ0FBQyxFQUFFLHdCQUF3QixDQUFDLFNBQVM7eUJBQ3hDO3dCQUNELFlBQVksRUFBRTs0QkFDVixDQUFDLEVBQUUsWUFBWTt5QkFDbEI7cUJBQ0o7aUJBQ0osQ0FBQyxDQUFDLENBQUM7Z0JBRUosMkNBQTJDO2dCQUMzQyxPQUFPO29CQUNILElBQUksRUFBRSxDQUFDLHdCQUF5QyxDQUFDO2lCQUNwRCxDQUFBO2FBQ0o7U0FDSjtLQUNKO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDVixNQUFNLFlBQVksR0FBRyxvQ0FBb0MsU0FBUyxhQUFhLEdBQUcsRUFBRSxDQUFDO1FBQ3JGLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDMUIsT0FBTztZQUNILFlBQVksRUFBRSxZQUFZO1lBQzFCLFNBQVMsRUFBRSx5Q0FBdUIsQ0FBQyxlQUFlO1NBQ3JELENBQUE7S0FDSjtBQUNMLENBQUMsQ0FBQTtBQTdUWSxRQUFBLG1CQUFtQix1QkE2VC9CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtBdHRyaWJ1dGVWYWx1ZSwgRHluYW1vREJDbGllbnQsIEdldEl0ZW1Db21tYW5kLCBQdXRJdGVtQ29tbWFuZH0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1keW5hbW9kYlwiO1xuaW1wb3J0IHtcbiAgICBDcmVhdGVSZWltYnVyc2VtZW50SW5wdXQsXG4gICAgTW9vbmJlYW1DbGllbnQsXG4gICAgT2xpdmVDbGllbnQsXG4gICAgUmVpbWJ1cnNlbWVudCxcbiAgICBSZWltYnVyc2VtZW50UmVzcG9uc2UsXG4gICAgUmVpbWJ1cnNlbWVudHNFcnJvclR5cGUsXG4gICAgVHJhbnNhY3Rpb25zU3RhdHVzLFxuICAgIFRyYW5zYWN0aW9uVHlwZVxufSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuaW1wb3J0IHt2NCBhcyB1dWlkdjR9IGZyb20gXCJ1dWlkXCI7XG5cbi8qKlxuICogQ3JlYXRlUmVpbWJ1cnNlbWVudCByZXNvbHZlclxuICpcbiAqIEBwYXJhbSBmaWVsZE5hbWUgbmFtZSBvZiB0aGUgcmVzb2x2ZXIgcGF0aCBmcm9tIHRoZSBBcHBTeW5jIGV2ZW50XG4gKiBAcGFyYW0gY3JlYXRlUmVpbWJ1cnNlbWVudElucHV0IGNyZWF0ZSByZWltYnVyc2VtZW50IGlucHV0IG9iamVjdCwgdXNlZCB0byBjcmVhdGUgYSByZWltYnVyc2VtZW50LlxuICogQHJldHVybnMge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBSZWltYnVyc2VtZW50UmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCBjcmVhdGVSZWltYnVyc2VtZW50ID0gYXN5bmMgKGZpZWxkTmFtZTogc3RyaW5nLCBjcmVhdGVSZWltYnVyc2VtZW50SW5wdXQ6IENyZWF0ZVJlaW1idXJzZW1lbnRJbnB1dCk6IFByb21pc2U8UmVpbWJ1cnNlbWVudFJlc3BvbnNlPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gcmV0cmlldmluZyB0aGUgY3VycmVudCBmdW5jdGlvbiByZWdpb25cbiAgICAgICAgY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiE7XG5cbiAgICAgICAgLy8gaW5pdGlhbGl6aW5nIHRoZSBEeW5hbW9EQiBkb2N1bWVudCBjbGllbnRcbiAgICAgICAgY29uc3QgZHluYW1vRGJDbGllbnQgPSBuZXcgRHluYW1vREJDbGllbnQoe3JlZ2lvbjogcmVnaW9ufSk7XG5cbiAgICAgICAgLy8gaW5pdGlhbGl6ZSB0aGUgYXBwcm9wcmlhdGUgQ2xpZW50c1xuICAgICAgICBjb25zdCBtb29uYmVhbUNsaWVudCA9IG5ldyBNb29uYmVhbUNsaWVudChwcm9jZXNzLmVudi5FTlZfTkFNRSEsIHJlZ2lvbik7XG4gICAgICAgIGNvbnN0IG9saXZlQ2xpZW50ID0gbmV3IE9saXZlQ2xpZW50KHByb2Nlc3MuZW52LkVOVl9OQU1FISwgcmVnaW9uKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQ3JlYXRpbmcgYSByZWltYnVyc2VtZW50IGludm9sdmVzIG11bHRpcGxlIHN0ZXBzOlxuICAgICAgICAgKlxuICAgICAgICAgKiAxKSBDYWxsIHRoZSBQT1NUL2NyZWF0ZUNsaWVudFRyYW5zYWN0aW9uICgvdHJhbnNhY3Rpb25zL2F1dGhvcml6YXRpb25zKSBPbGl2ZSBBUEksIHRvIGludGVncmF0ZSB3aXRoIGEgcGF5bWVudFxuICAgICAgICAgKiBwcm92aWRlciwgYW5kIGFjdHVhbGx5IHB1c2ggbW9uZXkgaW50byBzb21lb25lJ3MgY2FyZC5cbiAgICAgICAgICogVG9EbzogTmVlZCB0byBpbnRlZ3JhdGUgc3RlcCAxKSBpbnRvIHRoaXMgb3ZlcmFsbCBwcm9jZXNzIG9uY2UgT2xpdmUgZW5hYmxlcyBwYXltZW50IHByb3ZpZGVyIGludGVncmF0aW9uLlxuICAgICAgICAgKlxuICAgICAgICAgKiBGb3IgZWFjaCB0cmFuc2FjdGlvbiB3aXRoaW4gdGhlIGluY29taW5nIG1hcHBlZCB0cmFuc2FjdGlvbnMsIGV4ZWN1dGUgc3RlcHMgMikgYW5kIDMpLCBhcyBmb2xsb3dzOlxuICAgICAgICAgKlxuICAgICAgICAgKiAyKSBDYWxsIHRoZSBQVVQvdXBkYXRlUmV3YXJkU3RhdHVzICgvdHJhbnNhY3Rpb25zL3tpZH0vcmV3YXJkKSBPbGl2ZSBBUEksIGluIG9yZGVyIHRvIHNwZWNpZnkgdGhlIGFtb3VudCB0aGF0XG4gICAgICAgICAqIGdvdCBkaXN0cmlidXRlZCB0byB0aGUgZW5kIHVzZXIncyBjYXJkLCBpbiBzdGVwIDEpLiBGb3Igbm93IHdlIHdpbGwgbm90IGFsbG93IGZvciBwYXJ0aWFsIGNhc2gtb3V0cywgb25seSBmb3IgZnVsbFxuICAgICAgICAgKiBhbW91bnRzICh0aGlzIGlzIG9ubHkgZm9yIG5vbiAxIGNlbnQgcmVsYXRlZCB0cmFuc2FjdGlvbnMpLlxuICAgICAgICAgKlxuICAgICAgICAgKiAzKSBDYWxsIHRoZSAvdXBkYXRlVHJhbnNhY3Rpb24gaW50ZXJuYWwgTW9vbmJlYW0gQVdTIEFwcFN5bmMgQVBJLCBpbiBvcmRlciB0byB1cGRhdGUgZWFjaCBvbmUgb2YgdGhlIGluY29taW5nIHRyYW5zYWN0aW9uc1xuICAgICAgICAgKiBtYXBwZWQgdG8gdGhlIHJlaW1idXJzZW1lbnQgaW50ZXJuYWxseSBhcyB3ZWxsLiBUaGlzIGNhbGwgdXBkYXRlcyAzIHRoaW5nczpcbiAgICAgICAgICpcbiAgICAgICAgICogLSB0cmFuc2FjdGlvblN0YXR1czpcbiAgICAgICAgICogICBmb3IgaW5jb21pbmcgUFJPQ0VTU0VEIC0+IHVwZGF0ZSB0byBGUk9OVEVEIChzcGVjaWZ5aW5nIHRoYXQgd2UgY2FzaGVkIG91dCBhIHRyYW5zYWN0aW9uIGJlZm9yZSByZWNlaXZpbmcgdGhlIG1vbmV5IGZyb20gT2xpdmUgZm9yIGl0KVxuICAgICAgICAgKiAgIGZvciBpbmNvbWluZyBGVU5ERUQgLT4gdXBkYXRlIHRvIENSRURJVEVEIChzcGVjaWZ5aW5nIHRoYXQgd2UgY2FzaGVkIG91dCBhIHRyYW5zYWN0aW9uLCBhbmQgd2UgcmVjZWl2ZWQgdGhlIG1vbmV5IGZyb20gT2xpdmUgZm9yIGl0KVxuICAgICAgICAgKlxuICAgICAgICAgKiAtIHBlbmRpbmdDYXNoYmFja0Ftb3VudCAoZG9uZSBpbnRlcm5hbGx5IHdpdGhpbiB0aGUgQVBJIGNhbGwpOlxuICAgICAgICAgKiAgIHRoaXMgd2lsbCBoYXZlIHRvIGJlIHJlZHVjZWQgdG8gMC4wMCBmb3IgZWFjaCB0cmFuc2FjdGlvbiwgc3BlY2lmeWluZyB0aGF0IHRoZXJlIGFyZSAkMC4wMCBwZW5kaW5nIHRvIGNyZWRpdCBmb3IgdGhhdCB0cmFuc2FjdGlvblxuICAgICAgICAgKlxuICAgICAgICAgKiAtIGNyZWRpdGVkQ2FzaGJhY2tBbW91bnQgKGRvbmUgaW50ZXJuYWxseSB3aXRoaW4gdGhlIEFQSSBjYWxsKTpcbiAgICAgICAgICogICB0aGlzIHdpbGwgaGF2ZSB0byBiZSBlcXVhbCB0byB0aGUgJ3Jld2FyZEFtb3VudCcsIHNwZWNpZnlpbmcgdGhlIGFtb3VudCB0aGF0IGhhcyBiZWVuIGNyZWRpdGVkIHRvIHRoZSBlbmQtdXNlclxuICAgICAgICAgKlxuICAgICAgICAgKiA0KSBTdG9yZSB0aGUgcmVpbWJ1cnNlbWVudCBpbiB0aGUgdGFibGUsIHdpdGggdGhlIGFwcHJvcHJpYXRlIHRyYW5zYWN0aW9uIHN0YXR1c2VzIHVwZGF0ZWQgaW4gaXQsIGJvdGggZnJvbSBhbiBleHRlcm5hbCAoT2xpdmUpIHBlcnNwZWN0aXZlLFxuICAgICAgICAgKiBhbmQgYW4gaW50ZXJuYWwgKE1vb25iZWFtKSBwZXJzcGVjdGl2ZS5cbiAgICAgICAgICpcbiAgICAgICAgICogZmlyc3QgdXBkYXRlIHRoZSB0aW1lc3RhbXBzIGFjY29yZGluZ2x5XG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBjcmVhdGVkQXQgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgICAgIGNyZWF0ZVJlaW1idXJzZW1lbnRJbnB1dC50aW1lc3RhbXAgPSBjcmVhdGVSZWltYnVyc2VtZW50SW5wdXQudGltZXN0YW1wID8gY3JlYXRlUmVpbWJ1cnNlbWVudElucHV0LnRpbWVzdGFtcCA6IERhdGUucGFyc2UoY3JlYXRlZEF0KTtcbiAgICAgICAgY3JlYXRlUmVpbWJ1cnNlbWVudElucHV0LmNyZWF0ZWRBdCA9IGNyZWF0ZVJlaW1idXJzZW1lbnRJbnB1dC5jcmVhdGVkQXQgPyBjcmVhdGVSZWltYnVyc2VtZW50SW5wdXQuY3JlYXRlZEF0IDogY3JlYXRlZEF0O1xuICAgICAgICBjcmVhdGVSZWltYnVyc2VtZW50SW5wdXQudXBkYXRlZEF0ID0gY3JlYXRlUmVpbWJ1cnNlbWVudElucHV0LnVwZGF0ZWRBdCA/IGNyZWF0ZVJlaW1idXJzZW1lbnRJbnB1dC51cGRhdGVkQXQgOiBjcmVhdGVkQXQ7XG5cbiAgICAgICAgLy8gZ2VuZXJhdGUgYSB1bmlxdWUgaWRlbnRpZmllciBmb3IgdGhlIHJlaW1idXJzZW1lbnQsIGlmIG5vdCBhbHJlYWR5IHBhc3NlZCBpblxuICAgICAgICBjcmVhdGVSZWltYnVyc2VtZW50SW5wdXQucmVpbWJ1cnNlbWVudElkID0gY3JlYXRlUmVpbWJ1cnNlbWVudElucHV0LnJlaW1idXJzZW1lbnRJZCA/IGNyZWF0ZVJlaW1idXJzZW1lbnRJbnB1dC5yZWltYnVyc2VtZW50SWQgOiB1dWlkdjQoKTtcblxuICAgICAgICAvLyBnbyB0aHJvdWdoIGVhY2ggdHJhbnNhY3Rpb24gd2l0aGluIHRoZSBpbmNvbWluZyB0cmFuc2FjdGlvbiBhbmQgbWFrZSBzdXJlIHRoYXQgdGhleSBnZXQgdXBkYXRlZCBpbnRlcm5hbGx5IGFuZCBleHRlcm5hbGx5IGFjY29yZGluZ2x5XG4gICAgICAgIGxldCB0cmFuc2FjdGlvblVwZGF0ZXNTdWNjZWVkZWQgPSB0cnVlO1xuICAgICAgICBmb3IgKGNvbnN0IHRyYW5zYWN0aW9uIG9mIGNyZWF0ZVJlaW1idXJzZW1lbnRJbnB1dC50cmFuc2FjdGlvbnMpIHtcbiAgICAgICAgICAgIGlmICh0cmFuc2FjdGlvbiAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGlmICgodHJhbnNhY3Rpb24udHJhbnNhY3Rpb25UeXBlICE9PSBUcmFuc2FjdGlvblR5cGUuT2xpdmVJbmVsaWdpYmxlTWF0Y2hlZCkgJiYgKHRyYW5zYWN0aW9uLnRyYW5zYWN0aW9uVHlwZSAhPT0gVHJhbnNhY3Rpb25UeXBlLk9saXZlSW5lbGlnaWJsZVVubWF0Y2hlZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gMikgQ2FsbCB0aGUgUFVUL3VwZGF0ZVJld2FyZFN0YXR1cyAoL3RyYW5zYWN0aW9ucy97aWR9L3Jld2FyZCkgT2xpdmUgQVBJICh0aGlzIGlzIG9ubHkgZm9yIHRoZSBub24gMSBjZW50IHJlbGF0ZWQgdHJhbnNhY3Rpb25zKS5cbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgb2xpdmVDbGllbnQudXBkYXRlVHJhbnNhY3Rpb25TdGF0dXModHJhbnNhY3Rpb24udHJhbnNhY3Rpb25JZCwgdHJhbnNhY3Rpb24ucmV3YXJkQW1vdW50KTtcblxuICAgICAgICAgICAgICAgICAgICAvLyAzKSBDYWxsIHRoZSAvdXBkYXRlVHJhbnNhY3Rpb24gaW50ZXJuYWwgTW9vbmJlYW0gQVdTIEFwcFN5bmMgQVBJXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG1vb25iZWFtVXBkYXRlZFRyYW5zYWN0aW9uUmVzcG9uc2UgPSBhd2FpdCBtb29uYmVhbUNsaWVudC51cGRhdGVUcmFuc2FjdGlvbih7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogdHJhbnNhY3Rpb24uaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IHRyYW5zYWN0aW9uLnRpbWVzdGFtcCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uSWQ6IHRyYW5zYWN0aW9uLnRyYW5zYWN0aW9uSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIGZvciBpbmNvbWluZyBQUk9DRVNTRUQgLT4gdXBkYXRlIHRvIEZST05URUQgKHNwZWNpZnlpbmcgdGhhdCB3ZSBjYXNoZWQgb3V0IGEgdHJhbnNhY3Rpb24gYmVmb3JlIHJlY2VpdmluZyB0aGUgbW9uZXkgZnJvbSBPbGl2ZSBmb3IgaXQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBmb3IgaW5jb21pbmcgRlVOREVEIC0+IHVwZGF0ZSB0byBDUkVESVRFRCAoc3BlY2lmeWluZyB0aGF0IHdlIGNhc2hlZCBvdXQgYSB0cmFuc2FjdGlvbiwgYW5kIHdlIHJlY2VpdmVkIHRoZSBtb25leSBmcm9tIE9saXZlIGZvciBpdClcbiAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25TdGF0dXM6IHRyYW5zYWN0aW9uLnRyYW5zYWN0aW9uU3RhdHVzID09PSBUcmFuc2FjdGlvbnNTdGF0dXMuUHJvY2Vzc2VkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBUcmFuc2FjdGlvbnNTdGF0dXMuRnJvbnRlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogKHRyYW5zYWN0aW9uLnRyYW5zYWN0aW9uU3RhdHVzID09PSBUcmFuc2FjdGlvbnNTdGF0dXMuRnVuZGVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IFRyYW5zYWN0aW9uc1N0YXR1cy5DcmVkaXRlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiB0cmFuc2FjdGlvbi50cmFuc2FjdGlvblN0YXR1c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNoZWNrIHRvIG1ha2Ugc3VyZSB0aGF0IHdlIGNhbiBjb250aW51ZSB3aXRoIHRoZSByZWltYnVyc2VtZW50IHByb2Nlc3NcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFtb29uYmVhbVVwZGF0ZWRUcmFuc2FjdGlvblJlc3BvbnNlIHx8IG1vb25iZWFtVXBkYXRlZFRyYW5zYWN0aW9uUmVzcG9uc2UuZXJyb3JUeXBlIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICBtb29uYmVhbVVwZGF0ZWRUcmFuc2FjdGlvblJlc3BvbnNlLmVycm9yTWVzc2FnZSB8fCAhbW9vbmJlYW1VcGRhdGVkVHJhbnNhY3Rpb25SZXNwb25zZS5kYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzZXQgdGhlIGZhaWx1cmUgZmxhZyBhY2NvcmRpbmdseVxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25VcGRhdGVzU3VjY2VlZGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIGNoZWNrIHRvIG1ha2Ugc3VyZSB0aGF0IHdlIGNhbiBjb250aW51ZSB3aXRoIHRoZSByZWltYnVyc2VtZW50IHByb2Nlc3NcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgKG9saXZlVXBkYXRlZFRyYW5zYWN0aW9uUmVzcG9uc2UuZGF0YSAhPT0gdW5kZWZpbmVkICYmIG9saXZlVXBkYXRlZFRyYW5zYWN0aW9uUmVzcG9uc2UuZGF0YSAhPT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgb2xpdmVVcGRhdGVkVHJhbnNhY3Rpb25SZXNwb25zZS5kYXRhID09PSBSZWltYnVyc2VtZW50UHJvY2Vzc2luZ1N0YXR1cy5TdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgICAgIC8vIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAvLyBzZXQgdGhlIGZhaWx1cmUgZmxhZyBhY2NvcmRpbmdseVxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgdHJhbnNhY3Rpb25VcGRhdGVzU3VjY2VlZGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIDMpIENhbGwgdGhlIC91cGRhdGVUcmFuc2FjdGlvbiBpbnRlcm5hbCBNb29uYmVhbSBBV1MgQXBwU3luYyBBUElcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbW9vbmJlYW1VcGRhdGVkVHJhbnNhY3Rpb25SZXNwb25zZSA9IGF3YWl0IG1vb25iZWFtQ2xpZW50LnVwZGF0ZVRyYW5zYWN0aW9uKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB0cmFuc2FjdGlvbi5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogdHJhbnNhY3Rpb24udGltZXN0YW1wLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25JZDogdHJhbnNhY3Rpb24udHJhbnNhY3Rpb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogZm9yIGluY29taW5nIFBST0NFU1NFRCAtPiB1cGRhdGUgdG8gRlJPTlRFRCAoc3BlY2lmeWluZyB0aGF0IHdlIGNhc2hlZCBvdXQgYSB0cmFuc2FjdGlvbiBiZWZvcmUgcmVjZWl2aW5nIHRoZSBtb25leSBmcm9tIE9saXZlIGZvciBpdClcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIGZvciBpbmNvbWluZyBGVU5ERUQgLT4gdXBkYXRlIHRvIENSRURJVEVEIChzcGVjaWZ5aW5nIHRoYXQgd2UgY2FzaGVkIG91dCBhIHRyYW5zYWN0aW9uLCBhbmQgd2UgcmVjZWl2ZWQgdGhlIG1vbmV5IGZyb20gT2xpdmUgZm9yIGl0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvblN0YXR1czogdHJhbnNhY3Rpb24udHJhbnNhY3Rpb25TdGF0dXMgPT09IFRyYW5zYWN0aW9uc1N0YXR1cy5Qcm9jZXNzZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IFRyYW5zYWN0aW9uc1N0YXR1cy5Gcm9udGVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAodHJhbnNhY3Rpb24udHJhbnNhY3Rpb25TdGF0dXMgPT09IFRyYW5zYWN0aW9uc1N0YXR1cy5GdW5kZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gVHJhbnNhY3Rpb25zU3RhdHVzLkNyZWRpdGVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IHRyYW5zYWN0aW9uLnRyYW5zYWN0aW9uU3RhdHVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgLy8gY2hlY2sgdG8gbWFrZSBzdXJlIHRoYXQgd2UgY2FuIGNvbnRpbnVlIHdpdGggdGhlIHJlaW1idXJzZW1lbnQgcHJvY2Vzc1xuICAgICAgICAgICAgICAgICAgICBpZiAoIW1vb25iZWFtVXBkYXRlZFRyYW5zYWN0aW9uUmVzcG9uc2UgfHwgbW9vbmJlYW1VcGRhdGVkVHJhbnNhY3Rpb25SZXNwb25zZS5lcnJvclR5cGUgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vb25iZWFtVXBkYXRlZFRyYW5zYWN0aW9uUmVzcG9uc2UuZXJyb3JNZXNzYWdlIHx8ICFtb29uYmVhbVVwZGF0ZWRUcmFuc2FjdGlvblJlc3BvbnNlLmRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNldCB0aGUgZmFpbHVyZSBmbGFnIGFjY29yZGluZ2x5XG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvblVwZGF0ZXNTdWNjZWVkZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBzZXQgdGhlIGZhaWx1cmUgZmxhZyBhY2NvcmRpbmdseVxuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uVXBkYXRlc1N1Y2NlZWRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIG1ha2Ugc3VyZSB0aGF0IHdlIG9ubHkgcHJvY2VlZCBpZiBhbGwgdHJhbnNhY3Rpb25zIGhhdmUgYmVlbiB1cGRhdGVkIGFjY29yZGluZ2x5XG4gICAgICAgIGlmICghdHJhbnNhY3Rpb25VcGRhdGVzU3VjY2VlZGVkKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSB1cGRhdGluZyByZWltYnVyc2VtZW50IHJlbGF0ZWQgdHJhbnNhY3Rpb25zIWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFJlaW1idXJzZW1lbnRzRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiA0KSBTdG9yZSB0aGUgcmVpbWJ1cnNlbWVudCBpbiB0aGUgdGFibGUsIHdpdGggdGhlIGFwcHJvcHJpYXRlIHRyYW5zYWN0aW9uIHN0YXR1c2VzIHVwZGF0ZWQgaW4gaXQsIGJvdGggZnJvbSBhbiBleHRlcm5hbCAoT2xpdmUpIHBlcnNwZWN0aXZlLFxuICAgICAgICAgICAgICogYW5kIGFuIGludGVybmFsIChNb29uYmVhbSkgcGVyc3BlY3RpdmUuXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogY2hlY2sgdG8gc2VlIGlmIHRoZSByZWltYnVyc2VtZW50IGFscmVhZHkgZXhpc3RzIGluIHRoZSBEQi4gQWx0aG91Z2ggdGhpcyBpcyBhIHZlcnkgcmFyZSBzaXR1YXRpb24sIHNpbmNlIHdlIGhhdmUgc28gbWFueSByZXNpbGllbnRcbiAgICAgICAgICAgICAqIG1ldGhvZHMsIHdlIHdhbnQgdG8gcHV0IGEgc2FmZWd1YXJkIGFyb3VuZCBkdXBsaWNhdGVzIGV2ZW4gaGVyZS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgY29uc3QgcHJlRXhpc3RpbmdSZWltYnVyc2VtZW50ID0gYXdhaXQgZHluYW1vRGJDbGllbnQuc2VuZChuZXcgR2V0SXRlbUNvbW1hbmQoe1xuICAgICAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuUkVJTUJVUlNFTUVOVFNfVEFCTEUhLFxuICAgICAgICAgICAgICAgIEtleToge1xuICAgICAgICAgICAgICAgICAgICBpZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlUmVpbWJ1cnNlbWVudElucHV0LmlkXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgTjogY3JlYXRlUmVpbWJ1cnNlbWVudElucHV0LnRpbWVzdGFtcC50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIHdlJ3JlIG5vdCBpbnRlcmVzdGVkIGluIGdldHRpbmcgYWxsIHRoZSBkYXRhIGZvciB0aGlzIGNhbGwsIGp1c3QgdGhlIG1pbmltdW0gZm9yIHVzIHRvIGRldGVybWluZSB3aGV0aGVyIHRoaXMgaXMgYSBkdXBsaWNhdGUgb3Igbm90XG4gICAgICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAgICAgKiBAbGluayBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vYW1hem9uZHluYW1vZGIvbGF0ZXN0L2RldmVsb3Blcmd1aWRlL1Jlc2VydmVkV29yZHMuaHRtbFxuICAgICAgICAgICAgICAgICAqIEBsaW5rIGh0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9hbWF6b25keW5hbW9kYi9sYXRlc3QvZGV2ZWxvcGVyZ3VpZGUvRXhwcmVzc2lvbnMuRXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzLmh0bWxcbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBQcm9qZWN0aW9uRXhwcmVzc2lvbjogJyNpZGYsICN0JyxcbiAgICAgICAgICAgICAgICBFeHByZXNzaW9uQXR0cmlidXRlTmFtZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgJyNpZGYnOiAnaWQnLFxuICAgICAgICAgICAgICAgICAgICAnI3QnOiAndGltZXN0YW1wJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgLy8gaWYgdGhlcmUgaXMgYW4gaXRlbSByZXRyaWV2ZWQsIHRoZW4gd2UgcmV0dXJuIGFuIGVycm9yXG4gICAgICAgICAgICBpZiAocHJlRXhpc3RpbmdSZWltYnVyc2VtZW50ICYmIHByZUV4aXN0aW5nUmVpbWJ1cnNlbWVudC5JdGVtKSB7XG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogaWYgdGhlcmUgaXMgYSBwcmUtZXhpc3RpbmcgcmVpbWJ1cnNlbWVudCB3aXRoIHRoZSBzYW1lIGNvbXBvc2l0ZSBwcmltYXJ5IGtleSAodXNlcklkL2lkLCB0aW1lc3RhbXApIGNvbWJpbmF0aW9uLFxuICAgICAgICAgICAgICAgICAqIHRoZW4gd2UgY2Fubm90IGR1cGxpY2F0ZSB0aGF0LCBzbyB3ZSB3aWxsIHJldHVybiBhbiBlcnJvci5cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgRHVwbGljYXRlIHJlaW1idXJzZW1lbnQgZm91bmQhYDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogUmVpbWJ1cnNlbWVudHNFcnJvclR5cGUuRHVwbGljYXRlT2JqZWN0Rm91bmRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIGNyZWF0ZSB0aGUgdHJhbnNhY3Rpb24gYXJyYXkgcGVydGFpbmluZyB0byB0aGUgcmVpbWJ1cnNlbWVudHMsIHRvIHN0b3JlXG4gICAgICAgICAgICAgICAgY29uc3QgdHJhbnNhY3Rpb25zOiBBdHRyaWJ1dGVWYWx1ZVtdID0gW107XG4gICAgICAgICAgICAgICAgY3JlYXRlUmVpbWJ1cnNlbWVudElucHV0LnRyYW5zYWN0aW9ucy5mb3JFYWNoKHRyYW5zYWN0aW9uID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gbW9kaWZ5IHRoZSB0cmFuc2FjdGlvbiBzdGF0dXNlcyBhbmQgYW1vdW50cyB0byBiZSByZXR1cm5lZFxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbiEudHJhbnNhY3Rpb25TdGF0dXMgPVxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb24hLnRyYW5zYWN0aW9uU3RhdHVzID09PSBUcmFuc2FjdGlvbnNTdGF0dXMuUHJvY2Vzc2VkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBUcmFuc2FjdGlvbnNTdGF0dXMuRnJvbnRlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogKHRyYW5zYWN0aW9uIS50cmFuc2FjdGlvblN0YXR1cyA9PT0gVHJhbnNhY3Rpb25zU3RhdHVzLkZ1bmRlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBUcmFuc2FjdGlvbnNTdGF0dXMuQ3JlZGl0ZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogdHJhbnNhY3Rpb24hLnRyYW5zYWN0aW9uU3RhdHVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb24hLnBlbmRpbmdDYXNoYmFja0Ftb3VudCA9IDAuMDA7XG4gICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uIS5jcmVkaXRlZENhc2hiYWNrQW1vdW50ID0gTnVtYmVyKHRyYW5zYWN0aW9uIS5yZXdhcmRBbW91bnQudG9GaXhlZCgyKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gcHVzaCB0aGUgdHJhbnNhY3Rpb24gaW4gdGhlIGxpc3Qgb2YgdHJhbnNhY3Rpb25zIHRvIGJlIHN0b3JlZFxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBNOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogdHJhbnNhY3Rpb24hLmlkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTjogdHJhbnNhY3Rpb24hLnRpbWVzdGFtcC50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbklkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IHRyYW5zYWN0aW9uIS50cmFuc2FjdGlvbklkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvblN0YXR1czoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiB0cmFuc2FjdGlvbiEudHJhbnNhY3Rpb25TdGF0dXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uVHlwZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiB0cmFuc2FjdGlvbiEudHJhbnNhY3Rpb25UeXBlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogdHJhbnNhY3Rpb24hLmNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlZEF0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IHRyYW5zYWN0aW9uIS51cGRhdGVkQXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRJZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiB0cmFuc2FjdGlvbiEuY2FyZElkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZW1iZXJJZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiB0cmFuc2FjdGlvbiEubWVtYmVySWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyYW5kSWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogdHJhbnNhY3Rpb24hLmJyYW5kSWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0b3JlSWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogdHJhbnNhY3Rpb24hLnN0b3JlSWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IHRyYW5zYWN0aW9uIS5jYXRlZ29yeVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVuY3lDb2RlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IHRyYW5zYWN0aW9uIS5jdXJyZW5jeUNvZGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJld2FyZEFtb3VudDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBOOiB0cmFuc2FjdGlvbiEucmV3YXJkQW1vdW50LnRvRml4ZWQoMikudG9TdHJpbmcoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxBbW91bnQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTjogdHJhbnNhY3Rpb24hLnRvdGFsQW1vdW50LnRvRml4ZWQoMikudG9TdHJpbmcoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGVuZGluZ0Nhc2hiYWNrQW1vdW50OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE46IHRyYW5zYWN0aW9uIS5wZW5kaW5nQ2FzaGJhY2tBbW91bnQudG9GaXhlZCgyKS50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcmVkaXRlZENhc2hiYWNrQW1vdW50OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE46IHRyYW5zYWN0aW9uIS5jcmVkaXRlZENhc2hiYWNrQW1vdW50LnRvRml4ZWQoMikudG9TdHJpbmcoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25CcmFuZE5hbWU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogdHJhbnNhY3Rpb24hLnRyYW5zYWN0aW9uQnJhbmROYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbkJyYW5kQWRkcmVzczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiB0cmFuc2FjdGlvbiEudHJhbnNhY3Rpb25CcmFuZEFkZHJlc3NcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uQnJhbmRMb2dvVXJsOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IHRyYW5zYWN0aW9uIS50cmFuc2FjdGlvbkJyYW5kTG9nb1VybFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25CcmFuZFVSTEFkZHJlc3M6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogdHJhbnNhY3Rpb24hLnRyYW5zYWN0aW9uQnJhbmRVUkxBZGRyZXNzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbklzT25saW5lOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEJPT0w6IHRyYW5zYWN0aW9uIS50cmFuc2FjdGlvbklzT25saW5lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gc3RvcmUgdGhlIHJlaW1idXJzZW1lbnRzIG9iamVjdFxuICAgICAgICAgICAgICAgIGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IFB1dEl0ZW1Db21tYW5kKHtcbiAgICAgICAgICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5SRUlNQlVSU0VNRU5UU19UQUJMRSEsXG4gICAgICAgICAgICAgICAgICAgIEl0ZW06IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFtb3VudDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE46IGNyZWF0ZVJlaW1idXJzZW1lbnRJbnB1dC5hbW91bnQudG9GaXhlZCgyKS50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FyZElkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlUmVpbWJ1cnNlbWVudElucHV0LmNhcmRJZFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRMYXN0NDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZVJlaW1idXJzZW1lbnRJbnB1dC5jYXJkTGFzdDRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXJkVHlwZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZVJlaW1idXJzZW1lbnRJbnB1dC5jYXJkVHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlUmVpbWJ1cnNlbWVudElucHV0LmlkXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVpbWJ1cnNlbWVudElkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlUmVpbWJ1cnNlbWVudElucHV0LnJlaW1idXJzZW1lbnRJZFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1czoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZVJlaW1idXJzZW1lbnRJbnB1dC5zdGF0dXNcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBOOiBjcmVhdGVSZWltYnVyc2VtZW50SW5wdXQudGltZXN0YW1wLnRvU3RyaW5nKClcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVSZWltYnVyc2VtZW50SW5wdXQuY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlZEF0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlUmVpbWJ1cnNlbWVudElucHV0LnVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEw6IHRyYW5zYWN0aW9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgcmVpbWJ1cnNlbWVudHMgb2JqZWN0IGNyZWF0ZWRcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiBbY3JlYXRlUmVpbWJ1cnNlbWVudElucHV0IGFzIFJlaW1idXJzZW1lbnRdXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyAke2ZpZWxkTmFtZX0gbXV0YXRpb24gJHtlcnJ9YDtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBSZWltYnVyc2VtZW50c0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==