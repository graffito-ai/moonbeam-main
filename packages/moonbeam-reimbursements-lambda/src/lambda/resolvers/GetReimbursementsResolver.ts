import {AttributeValue, DynamoDBClient, QueryCommand} from "@aws-sdk/client-dynamodb";
import {
    CardType,
    CurrencyCodeType,
    GetReimbursementsInput,
    Reimbursement,
    ReimbursementResponse,
    ReimbursementsErrorType,
    ReimbursementStatus,
    Transaction,
    TransactionsStatus,
    TransactionType
} from "@moonbeam/moonbeam-models";

/**
 * GetReimbursements resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getReimbursementsInput get reimbursements input object, used to retrieve reimbursement information.
 *
 * @returns {@link Promise} of {@link ReimbursementResponse}
 */
export const getReimbursements = async (fieldName: string, getReimbursementsInput: GetReimbursementsInput): Promise<ReimbursementResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initializing the DynamoDB document client
        const dynamoDbClient = new DynamoDBClient({region: region});

        // converting the AWSDateTime to Timestamp, for comparison and sorting purposes, based on the primary key's sort key
        const startDateTimestamp = getReimbursementsInput.startDate && Date.parse(new Date(getReimbursementsInput.startDate).toISOString());
        const endDateTimestamp = Date.parse(new Date(getReimbursementsInput.endDate).toISOString());

        /**
         * determine whether this range of creation time of a reimbursement, falls within particular
         * upper and lower bounds, or just within a particular bound.
         */
        const conditionalExpression = startDateTimestamp
            ? '#idf = :idf and #t BETWEEN :tStart and :tEnd'
            : '#idf = :idf and #t <= :tEnd';

        /**
         * the data to be retrieved from the Query Command
         * the reimbursement Items returned from the Query Command, all aggregated together
         * the last evaluated key, to help with the pagination of results
         */
        let result: Record<string, AttributeValue>[] = [];
        let exclusiveStartKey, retrievedData;

        do {
            /**
             * retrieve the reimbursement data, given the get reimbursement input filtering/information
             *
             * Limit of 1 MB per paginated response data (in our case 300 items). We cannot really determine the average size for an Item,
             * because a reimbursement can have multiple potential transactions. Nevertheless, we do not need to do pagination, until we actually
             * decide to display reimbursements in a statement format.
             *
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.Pagination.html}
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.html}
             */
            retrievedData = await dynamoDbClient.send(new QueryCommand({
                TableName: process.env.REIMBURSEMENTS_TABLE!,
                ...(exclusiveStartKey && {ExclusiveStartKey: exclusiveStartKey}),
                Limit: 300,
                ExpressionAttributeNames: {
                    '#idf': 'id',
                    '#t': 'timestamp'
                },
                ExpressionAttributeValues: {
                    ":idf": {
                        S: getReimbursementsInput.id
                    },
                    ":tEnd": {
                        N: endDateTimestamp.toString()
                    },
                    ...(startDateTimestamp && {
                        ":tStart": {
                            N: startDateTimestamp.toString()
                        }
                    })
                },
                KeyConditionExpression: conditionalExpression
            }));

            exclusiveStartKey = retrievedData.LastEvaluatedKey;
            result = result.concat(retrievedData.Items);
        } while (retrievedData && retrievedData.Count && retrievedData.Items &&
        retrievedData.Items.length && retrievedData.Count !== 0 &&
        retrievedData.Items.length !== 0 && retrievedData.LastEvaluatedKey);

        // if there is any reimbursement data retrieved, then return it accordingly
        if (result && result.length !== 0) {
            // convert the Dynamo DB data from Dynamo DB JSON format to a Moonbeam Reimbursement data format
            const reimbursementData: Reimbursement[] = [];
            result.forEach(reimbursementResult => {
                // first build the transaction array data to return for reimbursements
                const transactions: Transaction[] = [];
                reimbursementResult.transactions.L && reimbursementResult.transactions.L!.forEach(transactionResult => {
                    const newTransaction: Transaction = {
                        brandId: transactionResult.M!.brandId.S!,
                        cardId: transactionResult.M!.cardId.S!,
                        category: transactionResult.M!.category.S!,
                        createdAt: transactionResult.M!.createdAt.S!,
                        creditedCashbackAmount: Number(transactionResult.M!.creditedCashbackAmount.N!),
                        currencyCode: transactionResult.M!.currencyCode.S! as CurrencyCodeType,
                        id: transactionResult.M!.id.S!,
                        memberId: transactionResult.M!.memberId.S!,
                        pendingCashbackAmount: Number(transactionResult.M!.pendingCashbackAmount.N!),
                        rewardAmount: Number(transactionResult.M!.rewardAmount.N!),
                        storeId: transactionResult.M!.storeId.S!,
                        timestamp: Number(transactionResult.M!.timestamp.N!),
                        totalAmount: Number(transactionResult.M!.totalAmount.N!),
                        transactionBrandAddress: transactionResult.M!.transactionBrandAddress.S!,
                        transactionBrandLogoUrl: transactionResult.M!.transactionBrandLogoUrl.S!,
                        transactionBrandName: transactionResult.M!.transactionBrandName.S!,
                        transactionBrandURLAddress: transactionResult.M!.transactionBrandURLAddress.S!,
                        transactionId: transactionResult.M!.transactionId.S!,
                        transactionIsOnline: transactionResult.M!.transactionIsOnline.BOOL!,
                        transactionStatus: transactionResult.M!.transactionStatus.S! as TransactionsStatus,
                        transactionType: transactionResult.M!.transactionType.S! as TransactionType,
                        updatedAt: transactionResult.M!.updatedAt.S!
                    }
                    transactions.push(newTransaction);
                });
                // build out each reimbursement object to return
                const reimbursement: Reimbursement = {
                    amount: Number(reimbursementResult.amount.N!),
                    cardId: reimbursementResult.cardId.S!,
                    cardLast4: reimbursementResult.cardLast4.S!,
                    cardType: reimbursementResult.cardType.S! as CardType,
                    createdAt: reimbursementResult.createdAt.S!,
                    id: reimbursementResult.id.S!,
                    reimbursementId: reimbursementResult.reimbursementId.S!,
                    status: reimbursementResult.status.S! as ReimbursementStatus,
                    timestamp: Number(reimbursementResult.timestamp.N!),
                    transactions: transactions,
                    updatedAt: reimbursementResult.updatedAt.S!,
                }
                // add each reimbursement object to the reimbursements array to be returned
                reimbursementData.push(reimbursement);
            });


            // return the retrieved reimbursements
            return {
                data: reimbursementData
            }
        } else {
            const errorMessage = `Reimbursements data not found for ${getReimbursementsInput.id}, and ${getReimbursementsInput.endDate}`;
            console.log(errorMessage);

            return {
                data: [],
                errorMessage: errorMessage,
                errorType: ReimbursementsErrorType.NoneOrAbsent
            }
        }

    } catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} query ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: ReimbursementsErrorType.UnexpectedError
        };
    }
}
