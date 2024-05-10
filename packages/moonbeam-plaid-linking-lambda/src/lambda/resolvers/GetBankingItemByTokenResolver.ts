import {BankingItemErrorType, BankingItemResponse, GetBankingItemByTokenInput} from "@moonbeam/moonbeam-models";
import {AttributeValue, DynamoDBClient, QueryCommand} from "@aws-sdk/client-dynamodb";

/**
 * GetBankingItemByToken resolver
 *
 * @param getBankingItemByTokenInput the input needed to retrieve an existing Plaid Banking Item
 * by its link token
 * @param fieldName name of the resolver path from the AppSync event
 * @returns {@link Promise} of {@link BankingItemResponse}
 */
export const getBankingItemByToken = async (fieldName: string, getBankingItemByTokenInput: GetBankingItemByTokenInput): Promise<BankingItemResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initializing the DynamoDB document client
        const dynamoDbClient = new DynamoDBClient({region: region});

        /**
         * the data to be retrieved from the Query Command
         * the eligible Plaid Banking Items returned from the Query Command, all aggregated together
         * the last evaluated key, to help with the pagination of results
         */
        let result: Record<string, AttributeValue>[] = [];
        let exclusiveStartKey, retrievedData;

        do {
            /**
             * retrieve the Plaid Banking Item by the link token, given the local secondary index to be queried by.
             *
             * Limit of 1 MB per paginated response data (in our case 1,000 items). An average size for an Item is about 765 bytes, which means that we won't
             * need to do pagination here, since we actually retrieve all Plaid Bank Items in a looped format, and we account for paginated responses.
             *
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.Pagination.html}
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.html}
             */
            retrievedData = await dynamoDbClient.send(new QueryCommand({
                TableName: process.env.BANKING_ITEMS_TABLE!,
                IndexName: `${process.env.BANKING_ITEM_LINK_TOKEN_LOCAL_INDEX!}-${process.env.ENV_NAME!}-${region}`,
                ...(exclusiveStartKey && {ExclusiveStartKey: exclusiveStartKey}),
                Limit: 1000, // 1,000 * 765 bytes = 765,000 bytes = 0.765 MB (leave a margin of error here up to 1 MB)
                ExpressionAttributeNames: {
                    '#id': 'id',
                    '#lTk': 'link_token'
                },
                ExpressionAttributeValues: {
                    ':id': {
                        S: getBankingItemByTokenInput.id
                    },
                    ':lTk': {
                        S: getBankingItemByTokenInput.linkToken
                    }
                },
                KeyConditionExpression: '#id = :id AND #lTk = :lTk'
            }));

            exclusiveStartKey = retrievedData.LastEvaluatedKey;
            result = result.concat(retrievedData.Items);
        } while (retrievedData && retrievedData.Count && retrievedData.Items &&
        retrievedData.Items.length && retrievedData.Count !== 0 &&
        retrievedData.Items.length !== 0 && retrievedData.LastEvaluatedKey);

        // there needs to be only 1 Plaid Bank Item returned. For more than one, return an error accordingly
        if (result && result.length === 1) {
            // return the queried Plaid Banking Item's details
            return {

            }
        } else {
            // see if we have no or more than one Plaid Banking Item retrieved and return the appropriate error and message
            if (result.length === 0) {
                const errorMessage = `No Plaid Banking Item found for user ${getBankingItemByTokenInput.id}, and token ${getBankingItemByTokenInput.linkToken}!`;
                console.log(errorMessage);

                return {
                    errorMessage: errorMessage,
                    errorType: BankingItemErrorType.NoneOrAbsent
                }
            } else if (result.length > 1) {
                const errorMessage = `More than one Plaid Banking Item retrieved for user ${getBankingItemByTokenInput.id}, and token ${getBankingItemByTokenInput.linkToken}!`;
                console.log(errorMessage);

                return {
                    errorMessage: errorMessage,
                    errorType: BankingItemErrorType.DuplicateObjectFound
                }
            } else {
                const errorMessage = `Issues while retrieving Plaid Banking Item for user ${getBankingItemByTokenInput.id}, and token ${getBankingItemByTokenInput.linkToken}!`;
                console.log(errorMessage);

                return {
                    errorMessage: errorMessage,
                    errorType: BankingItemErrorType.UnexpectedError
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
