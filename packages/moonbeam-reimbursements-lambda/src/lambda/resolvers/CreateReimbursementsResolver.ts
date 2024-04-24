import {AttributeValue, DynamoDBClient, GetItemCommand, PutItemCommand} from "@aws-sdk/client-dynamodb";
import {
    CreateReimbursementInput,
    MoonbeamClient,
    OliveClient,
    Reimbursement,
    ReimbursementResponse,
    ReimbursementsErrorType,
    TransactionsStatus,
    TransactionType
} from "@moonbeam/moonbeam-models";
import {v4 as uuidv4} from "uuid";

/**
 * CreateReimbursement resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param createReimbursementInput create reimbursement input object, used to create a reimbursement.
 * @returns {@link Promise} of {@link ReimbursementResponse}
 */
export const createReimbursement = async (fieldName: string, createReimbursementInput: CreateReimbursementInput): Promise<ReimbursementResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initializing the DynamoDB document client
        const dynamoDbClient = new DynamoDBClient({region: region});

        // initialize the appropriate Clients
        const moonbeamClient = new MoonbeamClient(process.env.ENV_NAME!, region);
        const oliveClient = new OliveClient(process.env.ENV_NAME!, region);

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
        createReimbursementInput.reimbursementId = createReimbursementInput.reimbursementId ? createReimbursementInput.reimbursementId : uuidv4();

        // go through each transaction within the incoming transaction and make sure that they get updated internally and externally accordingly
        let transactionUpdatesSucceeded = true;
        for (const transaction of createReimbursementInput.transactions) {
            if (transaction !== null) {
                if ((transaction.transactionType !== TransactionType.OliveIneligibleMatched) && (transaction.transactionType !== TransactionType.OliveIneligibleUnmatched)) {
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
                        transactionStatus: transaction.transactionStatus === TransactionsStatus.Processed
                            ? TransactionsStatus.Fronted
                            : (transaction.transactionStatus === TransactionsStatus.Funded
                                    ? TransactionsStatus.Credited
                                    : transaction.transactionStatus
                            )
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
                } else {
                    // 3) Call the /updateTransaction internal Moonbeam AWS AppSync API
                    const moonbeamUpdatedTransactionResponse = await moonbeamClient.updateTransaction({
                        id: transaction.id,
                        timestamp: transaction.timestamp,
                        transactionId: transaction.transactionId,
                        /**
                         * for incoming PROCESSED -> update to FRONTED (specifying that we cashed out a transaction before receiving the money from Olive for it)
                         * for incoming FUNDED -> update to CREDITED (specifying that we cashed out a transaction, and we received the money from Olive for it)
                         */
                        transactionStatus: transaction.transactionStatus === TransactionsStatus.Processed
                            ? TransactionsStatus.Fronted
                            : (transaction.transactionStatus === TransactionsStatus.Funded
                                    ? TransactionsStatus.Credited
                                    : transaction.transactionStatus
                            )
                    });
                    // check to make sure that we can continue with the reimbursement process
                    if (!moonbeamUpdatedTransactionResponse || moonbeamUpdatedTransactionResponse.errorType ||
                        moonbeamUpdatedTransactionResponse.errorMessage || !moonbeamUpdatedTransactionResponse.data) {
                        // set the failure flag accordingly
                        transactionUpdatesSucceeded = false;
                        break;
                    }
                }
            } else {
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
                errorType: ReimbursementsErrorType.UnexpectedError
            }
        } else {
            /**
             * 4) Store the reimbursement in the table, with the appropriate transaction statuses updated in it, both from an external (Olive) perspective,
             * and an internal (Moonbeam) perspective.
             *
             * check to see if the reimbursement already exists in the DB. Although this is a very rare situation, since we have so many resilient
             * methods, we want to put a safeguard around duplicates even here.
             */
            const preExistingReimbursement = await dynamoDbClient.send(new GetItemCommand({
                TableName: process.env.REIMBURSEMENTS_TABLE!,
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
                    errorType: ReimbursementsErrorType.DuplicateObjectFound
                }
            } else {
                // create the transaction array pertaining to the reimbursements, to store
                const transactions: AttributeValue[] = [];
                createReimbursementInput.transactions.forEach(transaction => {
                    // modify the transaction statuses and amounts to be returned
                    transaction!.transactionStatus =
                        transaction!.transactionStatus === TransactionsStatus.Processed
                            ? TransactionsStatus.Fronted
                            : (transaction!.transactionStatus === TransactionsStatus.Funded
                                    ? TransactionsStatus.Credited
                                    : transaction!.transactionStatus
                            );
                    transaction!.pendingCashbackAmount = 0.00;
                    transaction!.creditedCashbackAmount = Number(transaction!.rewardAmount.toFixed(2));

                    // push the transaction in the list of transactions to be stored
                    transactions.push({
                        M: {
                            id: {
                                S: transaction!.id
                            },
                            timestamp: {
                                N: transaction!.timestamp.toString()
                            },
                            transactionId: {
                                S: transaction!.transactionId
                            },
                            transactionStatus: {
                                S: transaction!.transactionStatus
                            },
                            transactionType: {
                                S: transaction!.transactionType
                            },
                            createdAt: {
                                S: transaction!.createdAt
                            },
                            updatedAt: {
                                S: transaction!.updatedAt
                            },
                            cardId: {
                                S: transaction!.cardId
                            },
                            memberId: {
                                S: transaction!.memberId
                            },
                            brandId: {
                                S: transaction!.brandId
                            },
                            storeId: {
                                S: transaction!.storeId
                            },
                            category: {
                                S: transaction!.category
                            },
                            currencyCode: {
                                S: transaction!.currencyCode
                            },
                            rewardAmount: {
                                N: transaction!.rewardAmount.toFixed(2).toString()
                            },
                            totalAmount: {
                                N: transaction!.totalAmount.toFixed(2).toString()
                            },
                            pendingCashbackAmount: {
                                N: transaction!.pendingCashbackAmount.toFixed(2).toString()
                            },
                            creditedCashbackAmount: {
                                N: transaction!.creditedCashbackAmount.toFixed(2).toString()
                            },
                            transactionBrandName: {
                                S: transaction!.transactionBrandName
                            },
                            transactionBrandAddress: {
                                S: transaction!.transactionBrandAddress
                            },
                            transactionBrandLogoUrl: {
                                S: transaction!.transactionBrandLogoUrl
                            },
                            transactionBrandURLAddress: {
                                S: transaction!.transactionBrandURLAddress
                            },
                            transactionIsOnline: {
                                BOOL: transaction!.transactionIsOnline
                            }
                        }
                    })
                });

                // store the reimbursements object
                await dynamoDbClient.send(new PutItemCommand({
                    TableName: process.env.REIMBURSEMENTS_TABLE!,
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
                    data: [createReimbursementInput as Reimbursement]
                }
            }
        }
    } catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} mutation ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: ReimbursementsErrorType.UnexpectedError
        }
    }
}
