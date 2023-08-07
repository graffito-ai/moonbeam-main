import {DynamoDBClient, GetItemCommand, PutItemCommand} from "@aws-sdk/client-dynamodb";
import {
    CreateReimbursementInput,
    Reimbursement,
    ReimbursementResponse,
    ReimbursementsErrorType
} from "@moonbeam/moonbeam-models";

/**
 * CreateReimbursement resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param createReimbursementInput create reimbursement input object, used to create a reimbursement
 * based on a triggered cron event.
 * @returns {@link Promise} of {@link ReimbursementResponse}
 */
export const createReimbursement = async (fieldName: string, createReimbursementInput: CreateReimbursementInput): Promise<ReimbursementResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initializing the DynamoDB document client
        const dynamoDbClient = new DynamoDBClient({region: region});

        // update the timestamps accordingly
        const createdAt = new Date().toISOString();
        createReimbursementInput.timestamp = createReimbursementInput.timestamp ? createReimbursementInput.timestamp : Date.parse(createdAt);
        createReimbursementInput.createdAt = createReimbursementInput.createdAt ? createReimbursementInput.createdAt : createdAt;
        createReimbursementInput.updatedAt = createReimbursementInput.updatedAt ? createReimbursementInput.updatedAt : createdAt;

        /**
         * check to see if the reimbursement already exists in the DB. Although this is a very rare situation, since we have so many resilient
         * methods (such as Dead-Letter-Queue, retries, etc.) we want to put a safeguard around duplicates even here.
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
                errorType: ReimbursementsErrorType.DuplicateObjectFound
            }
        } else {
            // map the incoming transactions array into a DynamoDB list accordingly
            const mappedTransactions: any[] = [];
            for (const transaction of createReimbursementInput.transactions) {
                mappedTransactions.push({
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
                        }
                    }
                })
            }
            // store the reimbursement object
            await dynamoDbClient.send(new PutItemCommand({
                TableName: process.env.REIMBURSEMENTS_TABLE!,
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
                data: createReimbursementInput as Reimbursement
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
