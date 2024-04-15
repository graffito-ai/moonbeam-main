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
         * amounts.
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
         * as well as an internal (Moonbeam) perspective.
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
                // 2) Call the PUT/updateRewardStatus (/transactions/{id}/reward) Olive API
                const oliveUpdatedTransactionResponse = await oliveClient.updateTransactionStatus(transaction.transactionId, transaction.rewardAmount);
                // check to make sure that we can continue with the reimbursement process
                if (oliveUpdatedTransactionResponse.data !== undefined && oliveUpdatedTransactionResponse.data !== null &&
                    oliveUpdatedTransactionResponse.data === moonbeam_models_1.ReimbursementProcessingStatus.Success) {
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
                else {
                    // set the failure flag accordingly
                    transactionUpdatesSucceeded = false;
                    break;
                }
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
             * 4) Call the PUT/updateRewardStatus (/transactions/{id}/reward) Olive API.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXRlUmVpbWJ1cnNlbWVudHNSZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL0NyZWF0ZVJlaW1idXJzZW1lbnRzUmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsOERBQXdHO0FBQ3hHLCtEQVNtQztBQUNuQywrQkFBa0M7QUFFbEM7Ozs7OztHQU1HO0FBQ0ksTUFBTSxtQkFBbUIsR0FBRyxLQUFLLEVBQUUsU0FBaUIsRUFBRSx3QkFBa0QsRUFBa0MsRUFBRTtJQUMvSSxJQUFJO1FBQ0EseUNBQXlDO1FBQ3pDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVyxDQUFDO1FBRXZDLDRDQUE0QztRQUM1QyxNQUFNLGNBQWMsR0FBRyxJQUFJLGdDQUFjLENBQUMsRUFBQyxNQUFNLEVBQUUsTUFBTSxFQUFDLENBQUMsQ0FBQztRQUU1RCxxQ0FBcUM7UUFDckMsTUFBTSxjQUFjLEdBQUcsSUFBSSxnQ0FBYyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3pFLE1BQU0sV0FBVyxHQUFHLElBQUksNkJBQVcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUVuRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1dBOEJHO1FBQ0gsTUFBTSxTQUFTLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUMzQyx3QkFBd0IsQ0FBQyxTQUFTLEdBQUcsd0JBQXdCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyx3QkFBd0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDckksd0JBQXdCLENBQUMsU0FBUyxHQUFHLHdCQUF3QixDQUFDLFNBQVMsQ0FBQyxDQUFD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Q0FBQyxFQUFFLHdCQUF3QixDQUFDLFFBQVE7eUJBQ3ZDO3dCQUNELEVBQUUsRUFBRTs0QkFDQSxDQUFDLEVBQUUsd0JBQXdCLENBQUMsRUFBRTt5QkFDakM7d0JBQ0QsZUFBZSxFQUFFOzRCQUNiLENBQUMsRUFBRSx3QkFBd0IsQ0FBQyxlQUFlO3lCQUM5Qzt3QkFDRCxNQUFNLEVBQUU7NEJBQ0osQ0FBQyxFQUFFLHdCQUF3QixDQUFDLE1BQU07eUJBQ3JDO3dCQUNELFNBQVMsRUFBRTs0QkFDUCxDQUFDLEVBQUUsd0JBQXdCLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRTt5QkFDbkQ7d0JBQ0QsU0FBUyxFQUFFOzRCQUNQLENBQUMsRUFBRSx3QkFBd0IsQ0FBQyxTQUFTO3lCQUN4Qzt3QkFDRCxTQUFTLEVBQUU7NEJBQ1AsQ0FBQyxFQUFFLHdCQUF3QixDQUFDLFNBQVM7eUJBQ3hDO3dCQUNELFlBQVksRUFBRTs0QkFDVixDQUFDLEVBQUUsWUFBWTt5QkFDbEI7cUJBQ0o7aUJBQ0osQ0FBQyxDQUFDLENBQUM7Z0JBRUosMkNBQTJDO2dCQUMzQyxPQUFPO29CQUNILElBQUksRUFBRSxDQUFDLHdCQUF5QyxDQUFDO2lCQUNwRCxDQUFBO2FBQ0o7U0FDSjtLQUNKO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDVixNQUFNLFlBQVksR0FBRyxvQ0FBb0MsU0FBUyxhQUFhLEdBQUcsRUFBRSxDQUFDO1FBQ3JGLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDMUIsT0FBTztZQUNILFlBQVksRUFBRSxZQUFZO1lBQzFCLFNBQVMsRUFBRSx5Q0FBdUIsQ0FBQyxlQUFlO1NBQ3JELENBQUE7S0FDSjtBQUNMLENBQUMsQ0FBQTtBQTVSWSxRQUFBLG1CQUFtQix1QkE0Ui9CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtBdHRyaWJ1dGVWYWx1ZSwgRHluYW1vREJDbGllbnQsIEdldEl0ZW1Db21tYW5kLCBQdXRJdGVtQ29tbWFuZH0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1keW5hbW9kYlwiO1xuaW1wb3J0IHtcbiAgICBDcmVhdGVSZWltYnVyc2VtZW50SW5wdXQsXG4gICAgTW9vbmJlYW1DbGllbnQsXG4gICAgT2xpdmVDbGllbnQsXG4gICAgUmVpbWJ1cnNlbWVudCxcbiAgICBSZWltYnVyc2VtZW50UHJvY2Vzc2luZ1N0YXR1cyxcbiAgICBSZWltYnVyc2VtZW50UmVzcG9uc2UsXG4gICAgUmVpbWJ1cnNlbWVudHNFcnJvclR5cGUsXG4gICAgVHJhbnNhY3Rpb25zU3RhdHVzXG59IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5pbXBvcnQge3Y0IGFzIHV1aWR2NH0gZnJvbSBcInV1aWRcIjtcblxuLyoqXG4gKiBDcmVhdGVSZWltYnVyc2VtZW50IHJlc29sdmVyXG4gKlxuICogQHBhcmFtIGZpZWxkTmFtZSBuYW1lIG9mIHRoZSByZXNvbHZlciBwYXRoIGZyb20gdGhlIEFwcFN5bmMgZXZlbnRcbiAqIEBwYXJhbSBjcmVhdGVSZWltYnVyc2VtZW50SW5wdXQgY3JlYXRlIHJlaW1idXJzZW1lbnQgaW5wdXQgb2JqZWN0LCB1c2VkIHRvIGNyZWF0ZSBhIHJlaW1idXJzZW1lbnQuXG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIFJlaW1idXJzZW1lbnRSZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IGNyZWF0ZVJlaW1idXJzZW1lbnQgPSBhc3luYyAoZmllbGROYW1lOiBzdHJpbmcsIGNyZWF0ZVJlaW1idXJzZW1lbnRJbnB1dDogQ3JlYXRlUmVpbWJ1cnNlbWVudElucHV0KTogUHJvbWlzZTxSZWltYnVyc2VtZW50UmVzcG9uc2U+ID0+IHtcbiAgICB0cnkge1xuICAgICAgICAvLyByZXRyaWV2aW5nIHRoZSBjdXJyZW50IGZ1bmN0aW9uIHJlZ2lvblxuICAgICAgICBjb25zdCByZWdpb24gPSBwcm9jZXNzLmVudi5BV1NfUkVHSU9OITtcblxuICAgICAgICAvLyBpbml0aWFsaXppbmcgdGhlIER5bmFtb0RCIGRvY3VtZW50IGNsaWVudFxuICAgICAgICBjb25zdCBkeW5hbW9EYkNsaWVudCA9IG5ldyBEeW5hbW9EQkNsaWVudCh7cmVnaW9uOiByZWdpb259KTtcblxuICAgICAgICAvLyBpbml0aWFsaXplIHRoZSBhcHByb3ByaWF0ZSBDbGllbnRzXG4gICAgICAgIGNvbnN0IG1vb25iZWFtQ2xpZW50ID0gbmV3IE1vb25iZWFtQ2xpZW50KHByb2Nlc3MuZW52LkVOVl9OQU1FISwgcmVnaW9uKTtcbiAgICAgICAgY29uc3Qgb2xpdmVDbGllbnQgPSBuZXcgT2xpdmVDbGllbnQocHJvY2Vzcy5lbnYuRU5WX05BTUUhLCByZWdpb24pO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDcmVhdGluZyBhIHJlaW1idXJzZW1lbnQgaW52b2x2ZXMgbXVsdGlwbGUgc3RlcHM6XG4gICAgICAgICAqXG4gICAgICAgICAqIDEpIENhbGwgdGhlIFBPU1QvY3JlYXRlQ2xpZW50VHJhbnNhY3Rpb24gKC90cmFuc2FjdGlvbnMvYXV0aG9yaXphdGlvbnMpIE9saXZlIEFQSSwgdG8gaW50ZWdyYXRlIHdpdGggYSBwYXltZW50XG4gICAgICAgICAqIHByb3ZpZGVyLCBhbmQgYWN0dWFsbHkgcHVzaCBtb25leSBpbnRvIHNvbWVvbmUncyBjYXJkLlxuICAgICAgICAgKiBUb0RvOiBOZWVkIHRvIGludGVncmF0ZSBzdGVwIDEpIGludG8gdGhpcyBvdmVyYWxsIHByb2Nlc3Mgb25jZSBPbGl2ZSBlbmFibGVzIHBheW1lbnQgcHJvdmlkZXIgaW50ZWdyYXRpb24uXG4gICAgICAgICAqXG4gICAgICAgICAqIEZvciBlYWNoIHRyYW5zYWN0aW9uIHdpdGhpbiB0aGUgaW5jb21pbmcgbWFwcGVkIHRyYW5zYWN0aW9ucywgZXhlY3V0ZSBzdGVwcyAyKSBhbmQgMyksIGFzIGZvbGxvd3M6XG4gICAgICAgICAqXG4gICAgICAgICAqIDIpIENhbGwgdGhlIFBVVC91cGRhdGVSZXdhcmRTdGF0dXMgKC90cmFuc2FjdGlvbnMve2lkfS9yZXdhcmQpIE9saXZlIEFQSSwgaW4gb3JkZXIgdG8gc3BlY2lmeSB0aGUgYW1vdW50IHRoYXRcbiAgICAgICAgICogZ290IGRpc3RyaWJ1dGVkIHRvIHRoZSBlbmQgdXNlcidzIGNhcmQsIGluIHN0ZXAgMSkuIEZvciBub3cgd2Ugd2lsbCBub3QgYWxsb3cgZm9yIHBhcnRpYWwgY2FzaC1vdXRzLCBvbmx5IGZvciBmdWxsXG4gICAgICAgICAqIGFtb3VudHMuXG4gICAgICAgICAqXG4gICAgICAgICAqIDMpIENhbGwgdGhlIC91cGRhdGVUcmFuc2FjdGlvbiBpbnRlcm5hbCBNb29uYmVhbSBBV1MgQXBwU3luYyBBUEksIGluIG9yZGVyIHRvIHVwZGF0ZSBlYWNoIG9uZSBvZiB0aGUgaW5jb21pbmcgdHJhbnNhY3Rpb25zXG4gICAgICAgICAqIG1hcHBlZCB0byB0aGUgcmVpbWJ1cnNlbWVudCBpbnRlcm5hbGx5IGFzIHdlbGwuIFRoaXMgY2FsbCB1cGRhdGVzIDMgdGhpbmdzOlxuICAgICAgICAgKlxuICAgICAgICAgKiAtIHRyYW5zYWN0aW9uU3RhdHVzOlxuICAgICAgICAgKiAgIGZvciBpbmNvbWluZyBQUk9DRVNTRUQgLT4gdXBkYXRlIHRvIEZST05URUQgKHNwZWNpZnlpbmcgdGhhdCB3ZSBjYXNoZWQgb3V0IGEgdHJhbnNhY3Rpb24gYmVmb3JlIHJlY2VpdmluZyB0aGUgbW9uZXkgZnJvbSBPbGl2ZSBmb3IgaXQpXG4gICAgICAgICAqICAgZm9yIGluY29taW5nIEZVTkRFRCAtPiB1cGRhdGUgdG8gQ1JFRElURUQgKHNwZWNpZnlpbmcgdGhhdCB3ZSBjYXNoZWQgb3V0IGEgdHJhbnNhY3Rpb24sIGFuZCB3ZSByZWNlaXZlZCB0aGUgbW9uZXkgZnJvbSBPbGl2ZSBmb3IgaXQpXG4gICAgICAgICAqXG4gICAgICAgICAqIC0gcGVuZGluZ0Nhc2hiYWNrQW1vdW50IChkb25lIGludGVybmFsbHkgd2l0aGluIHRoZSBBUEkgY2FsbCk6XG4gICAgICAgICAqICAgdGhpcyB3aWxsIGhhdmUgdG8gYmUgcmVkdWNlZCB0byAwLjAwIGZvciBlYWNoIHRyYW5zYWN0aW9uLCBzcGVjaWZ5aW5nIHRoYXQgdGhlcmUgYXJlICQwLjAwIHBlbmRpbmcgdG8gY3JlZGl0IGZvciB0aGF0IHRyYW5zYWN0aW9uXG4gICAgICAgICAqXG4gICAgICAgICAqIC0gY3JlZGl0ZWRDYXNoYmFja0Ftb3VudCAoZG9uZSBpbnRlcm5hbGx5IHdpdGhpbiB0aGUgQVBJIGNhbGwpOlxuICAgICAgICAgKiAgIHRoaXMgd2lsbCBoYXZlIHRvIGJlIGVxdWFsIHRvIHRoZSAncmV3YXJkQW1vdW50Jywgc3BlY2lmeWluZyB0aGUgYW1vdW50IHRoYXQgaGFzIGJlZW4gY3JlZGl0ZWQgdG8gdGhlIGVuZC11c2VyXG4gICAgICAgICAqXG4gICAgICAgICAqIDQpIFN0b3JlIHRoZSByZWltYnVyc2VtZW50IGluIHRoZSB0YWJsZSwgd2l0aCB0aGUgYXBwcm9wcmlhdGUgdHJhbnNhY3Rpb24gc3RhdHVzZXMgdXBkYXRlZCBpbiBpdCwgYm90aCBmcm9tIGFuIGV4dGVybmFsIChPbGl2ZSkgcGVyc3BlY3RpdmUsXG4gICAgICAgICAqIGFzIHdlbGwgYXMgYW4gaW50ZXJuYWwgKE1vb25iZWFtKSBwZXJzcGVjdGl2ZS5cbiAgICAgICAgICpcbiAgICAgICAgICogZmlyc3QgdXBkYXRlIHRoZSB0aW1lc3RhbXBzIGFjY29yZGluZ2x5XG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBjcmVhdGVkQXQgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgICAgIGNyZWF0ZVJlaW1idXJzZW1lbnRJbnB1dC50aW1lc3RhbXAgPSBjcmVhdGVSZWltYnVyc2VtZW50SW5wdXQudGltZXN0YW1wID8gY3JlYXRlUmVpbWJ1cnNlbWVudElucHV0LnRpbWVzdGFtcCA6IERhdGUucGFyc2UoY3JlYXRlZEF0KTtcbiAgICAgICAgY3JlYXRlUmVpbWJ1cnNlbWVudElucHV0LmNyZWF0ZWRBdCA9IGNyZWF0ZVJlaW1idXJzZW1lbnRJbnB1dC5jcmVhdGVkQXQgPyBjcmVhdGVSZWltYnVyc2VtZW50SW5wdXQuY3JlYXRlZEF0IDogY3JlYXRlZEF0O1xuICAgICAgICBjcmVhdGVSZWltYnVyc2VtZW50SW5wdXQudXBkYXRlZEF0ID0gY3JlYXRlUmVpbWJ1cnNlbWVudElucHV0LnVwZGF0ZWRBdCA/IGNyZWF0ZVJlaW1idXJzZW1lbnRJbnB1dC51cGRhdGVkQXQgOiBjcmVhdGVkQXQ7XG5cbiAgICAgICAgLy8gZ2VuZXJhdGUgYSB1bmlxdWUgaWRlbnRpZmllciBmb3IgdGhlIHJlaW1idXJzZW1lbnQsIGlmIG5vdCBhbHJlYWR5IHBhc3NlZCBpblxuICAgICAgICBjcmVhdGVSZWltYnVyc2VtZW50SW5wdXQucmVpbWJ1cnNlbWVudElkID0gY3JlYXRlUmVpbWJ1cnNlbWVudElucHV0LnJlaW1idXJzZW1lbnRJZCA/IGNyZWF0ZVJlaW1idXJzZW1lbnRJbnB1dC5yZWltYnVyc2VtZW50SWQgOiB1dWlkdjQoKTtcblxuICAgICAgICAvLyBnbyB0aHJvdWdoIGVhY2ggdHJhbnNhY3Rpb24gd2l0aGluIHRoZSBpbmNvbWluZyB0cmFuc2FjdGlvbiBhbmQgbWFrZSBzdXJlIHRoYXQgdGhleSBnZXQgdXBkYXRlZCBpbnRlcm5hbGx5IGFuZCBleHRlcm5hbGx5IGFjY29yZGluZ2x5XG4gICAgICAgIGxldCB0cmFuc2FjdGlvblVwZGF0ZXNTdWNjZWVkZWQgPSB0cnVlO1xuICAgICAgICBmb3IgKGNvbnN0IHRyYW5zYWN0aW9uIG9mIGNyZWF0ZVJlaW1idXJzZW1lbnRJbnB1dC50cmFuc2FjdGlvbnMpIHtcbiAgICAgICAgICAgIGlmICh0cmFuc2FjdGlvbiAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIC8vIDIpIENhbGwgdGhlIFBVVC91cGRhdGVSZXdhcmRTdGF0dXMgKC90cmFuc2FjdGlvbnMve2lkfS9yZXdhcmQpIE9saXZlIEFQSVxuICAgICAgICAgICAgICAgIGNvbnN0IG9saXZlVXBkYXRlZFRyYW5zYWN0aW9uUmVzcG9uc2UgPSBhd2FpdCBvbGl2ZUNsaWVudC51cGRhdGVUcmFuc2FjdGlvblN0YXR1cyh0cmFuc2FjdGlvbi50cmFuc2FjdGlvbklkLCB0cmFuc2FjdGlvbi5yZXdhcmRBbW91bnQpO1xuXG4gICAgICAgICAgICAgICAgLy8gY2hlY2sgdG8gbWFrZSBzdXJlIHRoYXQgd2UgY2FuIGNvbnRpbnVlIHdpdGggdGhlIHJlaW1idXJzZW1lbnQgcHJvY2Vzc1xuICAgICAgICAgICAgICAgIGlmIChvbGl2ZVVwZGF0ZWRUcmFuc2FjdGlvblJlc3BvbnNlLmRhdGEgIT09IHVuZGVmaW5lZCAmJiBvbGl2ZVVwZGF0ZWRUcmFuc2FjdGlvblJlc3BvbnNlLmRhdGEgIT09IG51bGwgJiZcbiAgICAgICAgICAgICAgICAgICAgb2xpdmVVcGRhdGVkVHJhbnNhY3Rpb25SZXNwb25zZS5kYXRhID09PSBSZWltYnVyc2VtZW50UHJvY2Vzc2luZ1N0YXR1cy5TdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIDMpIENhbGwgdGhlIC91cGRhdGVUcmFuc2FjdGlvbiBpbnRlcm5hbCBNb29uYmVhbSBBV1MgQXBwU3luYyBBUElcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbW9vbmJlYW1VcGRhdGVkVHJhbnNhY3Rpb25SZXNwb25zZSA9IGF3YWl0IG1vb25iZWFtQ2xpZW50LnVwZGF0ZVRyYW5zYWN0aW9uKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB0cmFuc2FjdGlvbi5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogdHJhbnNhY3Rpb24udGltZXN0YW1wLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25JZDogdHJhbnNhY3Rpb24udHJhbnNhY3Rpb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogZm9yIGluY29taW5nIFBST0NFU1NFRCAtPiB1cGRhdGUgdG8gRlJPTlRFRCAoc3BlY2lmeWluZyB0aGF0IHdlIGNhc2hlZCBvdXQgYSB0cmFuc2FjdGlvbiBiZWZvcmUgcmVjZWl2aW5nIHRoZSBtb25leSBmcm9tIE9saXZlIGZvciBpdClcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIGZvciBpbmNvbWluZyBGVU5ERUQgLT4gdXBkYXRlIHRvIENSRURJVEVEIChzcGVjaWZ5aW5nIHRoYXQgd2UgY2FzaGVkIG91dCBhIHRyYW5zYWN0aW9uLCBhbmQgd2UgcmVjZWl2ZWQgdGhlIG1vbmV5IGZyb20gT2xpdmUgZm9yIGl0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvblN0YXR1czogdHJhbnNhY3Rpb24udHJhbnNhY3Rpb25TdGF0dXMgPT09IFRyYW5zYWN0aW9uc1N0YXR1cy5Qcm9jZXNzZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IFRyYW5zYWN0aW9uc1N0YXR1cy5Gcm9udGVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAodHJhbnNhY3Rpb24udHJhbnNhY3Rpb25TdGF0dXMgPT09IFRyYW5zYWN0aW9uc1N0YXR1cy5GdW5kZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gVHJhbnNhY3Rpb25zU3RhdHVzLkNyZWRpdGVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IHRyYW5zYWN0aW9uLnRyYW5zYWN0aW9uU3RhdHVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgLy8gY2hlY2sgdG8gbWFrZSBzdXJlIHRoYXQgd2UgY2FuIGNvbnRpbnVlIHdpdGggdGhlIHJlaW1idXJzZW1lbnQgcHJvY2Vzc1xuICAgICAgICAgICAgICAgICAgICBpZiAoIW1vb25iZWFtVXBkYXRlZFRyYW5zYWN0aW9uUmVzcG9uc2UgfHwgbW9vbmJlYW1VcGRhdGVkVHJhbnNhY3Rpb25SZXNwb25zZS5lcnJvclR5cGUgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vb25iZWFtVXBkYXRlZFRyYW5zYWN0aW9uUmVzcG9uc2UuZXJyb3JNZXNzYWdlIHx8ICFtb29uYmVhbVVwZGF0ZWRUcmFuc2FjdGlvblJlc3BvbnNlLmRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNldCB0aGUgZmFpbHVyZSBmbGFnIGFjY29yZGluZ2x5XG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvblVwZGF0ZXNTdWNjZWVkZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gc2V0IHRoZSBmYWlsdXJlIGZsYWcgYWNjb3JkaW5nbHlcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25VcGRhdGVzU3VjY2VlZGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBtYWtlIHN1cmUgdGhhdCB3ZSBvbmx5IHByb2NlZWQgaWYgYWxsIHRyYW5zYWN0aW9ucyBoYXZlIGJlZW4gdXBkYXRlZCBhY2NvcmRpbmdseVxuICAgICAgICBpZiAoIXRyYW5zYWN0aW9uVXBkYXRlc1N1Y2NlZWRlZCkge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgdXBkYXRpbmcgcmVpbWJ1cnNlbWVudCByZWxhdGVkIHRyYW5zYWN0aW9ucyFgO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBSZWltYnVyc2VtZW50c0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogNCkgQ2FsbCB0aGUgUFVUL3VwZGF0ZVJld2FyZFN0YXR1cyAoL3RyYW5zYWN0aW9ucy97aWR9L3Jld2FyZCkgT2xpdmUgQVBJLlxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIGNoZWNrIHRvIHNlZSBpZiB0aGUgcmVpbWJ1cnNlbWVudCBhbHJlYWR5IGV4aXN0cyBpbiB0aGUgREIuIEFsdGhvdWdoIHRoaXMgaXMgYSB2ZXJ5IHJhcmUgc2l0dWF0aW9uLCBzaW5jZSB3ZSBoYXZlIHNvIG1hbnkgcmVzaWxpZW50XG4gICAgICAgICAgICAgKiBtZXRob2RzLCB3ZSB3YW50IHRvIHB1dCBhIHNhZmVndWFyZCBhcm91bmQgZHVwbGljYXRlcyBldmVuIGhlcmUuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGNvbnN0IHByZUV4aXN0aW5nUmVpbWJ1cnNlbWVudCA9IGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IEdldEl0ZW1Db21tYW5kKHtcbiAgICAgICAgICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52LlJFSU1CVVJTRU1FTlRTX1RBQkxFISxcbiAgICAgICAgICAgICAgICBLZXk6IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZVJlaW1idXJzZW1lbnRJbnB1dC5pZFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIE46IGNyZWF0ZVJlaW1idXJzZW1lbnRJbnB1dC50aW1lc3RhbXAudG9TdHJpbmcoKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiB3ZSdyZSBub3QgaW50ZXJlc3RlZCBpbiBnZXR0aW5nIGFsbCB0aGUgZGF0YSBmb3IgdGhpcyBjYWxsLCBqdXN0IHRoZSBtaW5pbXVtIGZvciB1cyB0byBkZXRlcm1pbmUgd2hldGhlciB0aGlzIGlzIGEgZHVwbGljYXRlIG9yIG5vdFxuICAgICAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2FtYXpvbmR5bmFtb2RiL2xhdGVzdC9kZXZlbG9wZXJndWlkZS9SZXNlcnZlZFdvcmRzLmh0bWxcbiAgICAgICAgICAgICAgICAgKiBAbGluayBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vYW1hem9uZHluYW1vZGIvbGF0ZXN0L2RldmVsb3Blcmd1aWRlL0V4cHJlc3Npb25zLkV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lcy5odG1sXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgUHJvamVjdGlvbkV4cHJlc3Npb246ICcjaWRmLCAjdCcsXG4gICAgICAgICAgICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICcjaWRmJzogJ2lkJyxcbiAgICAgICAgICAgICAgICAgICAgJyN0JzogJ3RpbWVzdGFtcCdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgIC8vIGlmIHRoZXJlIGlzIGFuIGl0ZW0gcmV0cmlldmVkLCB0aGVuIHdlIHJldHVybiBhbiBlcnJvclxuICAgICAgICAgICAgaWYgKHByZUV4aXN0aW5nUmVpbWJ1cnNlbWVudCAmJiBwcmVFeGlzdGluZ1JlaW1idXJzZW1lbnQuSXRlbSkge1xuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIGlmIHRoZXJlIGlzIGEgcHJlLWV4aXN0aW5nIHJlaW1idXJzZW1lbnQgd2l0aCB0aGUgc2FtZSBjb21wb3NpdGUgcHJpbWFyeSBrZXkgKHVzZXJJZC9pZCwgdGltZXN0YW1wKSBjb21iaW5hdGlvbixcbiAgICAgICAgICAgICAgICAgKiB0aGVuIHdlIGNhbm5vdCBkdXBsaWNhdGUgdGhhdCwgc28gd2Ugd2lsbCByZXR1cm4gYW4gZXJyb3IuXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYER1cGxpY2F0ZSByZWltYnVyc2VtZW50IGZvdW5kIWA7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFJlaW1idXJzZW1lbnRzRXJyb3JUeXBlLkR1cGxpY2F0ZU9iamVjdEZvdW5kXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBjcmVhdGUgdGhlIHRyYW5zYWN0aW9uIGFycmF5IHBlcnRhaW5pbmcgdG8gdGhlIHJlaW1idXJzZW1lbnRzLCB0byBzdG9yZVxuICAgICAgICAgICAgICAgIGNvbnN0IHRyYW5zYWN0aW9uczogQXR0cmlidXRlVmFsdWVbXSA9IFtdO1xuICAgICAgICAgICAgICAgIGNyZWF0ZVJlaW1idXJzZW1lbnRJbnB1dC50cmFuc2FjdGlvbnMuZm9yRWFjaCh0cmFuc2FjdGlvbiA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIG1vZGlmeSB0aGUgdHJhbnNhY3Rpb24gc3RhdHVzZXMgYW5kIGFtb3VudHMgdG8gYmUgcmV0dXJuZWRcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb24hLnRyYW5zYWN0aW9uU3RhdHVzID1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uIS50cmFuc2FjdGlvblN0YXR1cyA9PT0gVHJhbnNhY3Rpb25zU3RhdHVzLlByb2Nlc3NlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gVHJhbnNhY3Rpb25zU3RhdHVzLkZyb250ZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6ICh0cmFuc2FjdGlvbiEudHJhbnNhY3Rpb25TdGF0dXMgPT09IFRyYW5zYWN0aW9uc1N0YXR1cy5GdW5kZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gVHJhbnNhY3Rpb25zU3RhdHVzLkNyZWRpdGVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IHRyYW5zYWN0aW9uIS50cmFuc2FjdGlvblN0YXR1c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uIS5wZW5kaW5nQ2FzaGJhY2tBbW91bnQgPSAwLjAwO1xuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbiEuY3JlZGl0ZWRDYXNoYmFja0Ftb3VudCA9IE51bWJlcih0cmFuc2FjdGlvbiEucmV3YXJkQW1vdW50LnRvRml4ZWQoMikpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIHB1c2ggdGhlIHRyYW5zYWN0aW9uIGluIHRoZSBsaXN0IG9mIHRyYW5zYWN0aW9ucyB0byBiZSBzdG9yZWRcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25zLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgTToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IHRyYW5zYWN0aW9uIS5pZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE46IHRyYW5zYWN0aW9uIS50aW1lc3RhbXAudG9TdHJpbmcoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25JZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiB0cmFuc2FjdGlvbiEudHJhbnNhY3Rpb25JZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25TdGF0dXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogdHJhbnNhY3Rpb24hLnRyYW5zYWN0aW9uU3RhdHVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvblR5cGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogdHJhbnNhY3Rpb24hLnRyYW5zYWN0aW9uVHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEF0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IHRyYW5zYWN0aW9uIS5jcmVhdGVkQXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRBdDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiB0cmFuc2FjdGlvbiEudXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXJkSWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogdHJhbnNhY3Rpb24hLmNhcmRJZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVtYmVySWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogdHJhbnNhY3Rpb24hLm1lbWJlcklkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmFuZElkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IHRyYW5zYWN0aW9uIS5icmFuZElkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdG9yZUlkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IHRyYW5zYWN0aW9uIS5zdG9yZUlkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiB0cmFuc2FjdGlvbiEuY2F0ZWdvcnlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbmN5Q29kZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiB0cmFuc2FjdGlvbiEuY3VycmVuY3lDb2RlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXdhcmRBbW91bnQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTjogdHJhbnNhY3Rpb24hLnJld2FyZEFtb3VudC50b0ZpeGVkKDIpLnRvU3RyaW5nKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsQW1vdW50OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE46IHRyYW5zYWN0aW9uIS50b3RhbEFtb3VudC50b0ZpeGVkKDIpLnRvU3RyaW5nKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBlbmRpbmdDYXNoYmFja0Ftb3VudDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBOOiB0cmFuc2FjdGlvbiEucGVuZGluZ0Nhc2hiYWNrQW1vdW50LnRvRml4ZWQoMikudG9TdHJpbmcoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlZGl0ZWRDYXNoYmFja0Ftb3VudDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBOOiB0cmFuc2FjdGlvbiEuY3JlZGl0ZWRDYXNoYmFja0Ftb3VudC50b0ZpeGVkKDIpLnRvU3RyaW5nKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uQnJhbmROYW1lOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IHRyYW5zYWN0aW9uIS50cmFuc2FjdGlvbkJyYW5kTmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25CcmFuZEFkZHJlc3M6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogdHJhbnNhY3Rpb24hLnRyYW5zYWN0aW9uQnJhbmRBZGRyZXNzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbkJyYW5kTG9nb1VybDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiB0cmFuc2FjdGlvbiEudHJhbnNhY3Rpb25CcmFuZExvZ29VcmxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uQnJhbmRVUkxBZGRyZXNzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IHRyYW5zYWN0aW9uIS50cmFuc2FjdGlvbkJyYW5kVVJMQWRkcmVzc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25Jc09ubGluZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCT09MOiB0cmFuc2FjdGlvbiEudHJhbnNhY3Rpb25Jc09ubGluZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vIHN0b3JlIHRoZSByZWltYnVyc2VtZW50cyBvYmplY3RcbiAgICAgICAgICAgICAgICBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBQdXRJdGVtQ29tbWFuZCh7XG4gICAgICAgICAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuUkVJTUJVUlNFTUVOVFNfVEFCTEUhLFxuICAgICAgICAgICAgICAgICAgICBJdGVtOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbW91bnQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBOOiBjcmVhdGVSZWltYnVyc2VtZW50SW5wdXQuYW1vdW50LnRvRml4ZWQoMikudG9TdHJpbmcoKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRJZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZVJlaW1idXJzZW1lbnRJbnB1dC5jYXJkSWRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXJkTGFzdDQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVSZWltYnVyc2VtZW50SW5wdXQuY2FyZExhc3Q0XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FyZFR5cGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVSZWltYnVyc2VtZW50SW5wdXQuY2FyZFR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBpZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZVJlaW1idXJzZW1lbnRJbnB1dC5pZFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlaW1idXJzZW1lbnRJZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZVJlaW1idXJzZW1lbnRJbnB1dC5yZWltYnVyc2VtZW50SWRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVSZWltYnVyc2VtZW50SW5wdXQuc3RhdHVzXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTjogY3JlYXRlUmVpbWJ1cnNlbWVudElucHV0LnRpbWVzdGFtcC50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEF0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlUmVpbWJ1cnNlbWVudElucHV0LmNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRBdDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZVJlaW1idXJzZW1lbnRJbnB1dC51cGRhdGVkQXRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBMOiB0cmFuc2FjdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIHJlaW1idXJzZW1lbnRzIG9iamVjdCBjcmVhdGVkXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogW2NyZWF0ZVJlaW1idXJzZW1lbnRJbnB1dCBhcyBSZWltYnVyc2VtZW50XVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgJHtmaWVsZE5hbWV9IG11dGF0aW9uICR7ZXJyfWA7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgIGVycm9yVHlwZTogUmVpbWJ1cnNlbWVudHNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=