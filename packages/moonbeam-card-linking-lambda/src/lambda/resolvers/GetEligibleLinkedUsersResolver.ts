import {AttributeValue, DynamoDBClient, QueryCommand} from "@aws-sdk/client-dynamodb";
import {
    CardLinkErrorType,
    CardLinkingStatus,
    EligibleLinkedUser,
    EligibleLinkedUsersResponse
} from "@moonbeam/moonbeam-models";

/**
 * GetEligibleLinkedUsers resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @returns {@link Promise} of {@link EligibleLinkedUsersResponse}
 */
export const getEligibleLinkedUsers = async (fieldName: string): Promise<EligibleLinkedUsersResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initializing the DynamoDB document client
        const dynamoDbClient = new DynamoDBClient({region: region});

        /**
         * the data to be retrieved from the Query Command
         * the eligible user Items returned from the Query Command, all aggregated together
         * the last evaluated key, to help with the pagination of results
         */
        let result: Record<string, AttributeValue>[] = [];
        let exclusiveStartKey, retrievedData;

        do {
            /**
             * retrieve all the eligible linked users, given the global secondary index, as well as the LINKED status to be queried by
             *
             * Limit of 1 MB per paginated response data (in our case 1,200 items). An average size for an Item is about 645 bytes, which means that we won't
             * need to do pagination here, since we actually retrieve all users in a looped format, and we account for
             * paginated responses.
             *
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.Pagination.html}
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.html}
             */
            retrievedData = await dynamoDbClient.send(new QueryCommand({
                TableName: process.env.CARD_LINKING_TABLE!,
                IndexName: `${process.env.CARD_LINKING_STATUS_GLOBAL_INDEX!}-${process.env.ENV_NAME!}-${region}`,
                ...(exclusiveStartKey && {ExclusiveStartKey: exclusiveStartKey}),
                Limit: 1200, // 1,200 * 645 bytes = 774,000 bytes = 0.774 MB (leave a margin of error here up to 1 MB)
                /**
                 * we're not interested in getting all the data for this call, just the minimum for us to return the necessary information
                 *
                 * @link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html
                 * @link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ExpressionAttributeNames.html
                 */
                ProjectionExpression: '#idf, #mid, #cards',
                ExpressionAttributeNames: {
                    '#idf': 'id',
                    '#cards': 'cards',
                    '#mid': 'memberId',
                    '#st': 'status'
                },
                ExpressionAttributeValues: {
                    ":st": {
                        S: CardLinkingStatus.Linked
                    }
                },
                KeyConditionExpression: '#st = :st'
            }));

            exclusiveStartKey = retrievedData.LastEvaluatedKey;
            result = result.concat(retrievedData.Items);
        } while (retrievedData && retrievedData.Count && retrievedData.Items &&
        retrievedData.Items.length && retrievedData.Count !== 0 &&
        retrievedData.Items.length !== 0 && retrievedData.LastEvaluatedKey);

        // if there are eligible users retrieved, then return them accordingly
        if (result && result.length !== 0) {
            // convert the Dynamo DB data from Dynamo DB JSON format to a Moonbeam eligible users data format
            const eligibleUsersData: EligibleLinkedUser[] = [];
            result.forEach(eligibleUserResult => {
                // get all card ids for the eligible user
                const cardIDs: string[] = [];
                for (const linkedCard of eligibleUserResult.cards.L!) {
                    cardIDs.push(linkedCard.M!.id.S!);
                }
                // construct an eligible user to return in the list of users
                const eligibleUser: EligibleLinkedUser = {
                    id: eligibleUserResult.id.S!,
                    memberId: eligibleUserResult.memberId.S!,
                    cardIds: cardIDs
                };
                eligibleUsersData.push(eligibleUser);
            });
            // return the list of eligible users
            return {
                data: eligibleUsersData
            }
        } else {
            const errorMessage = `Eligible linked users not found!`;
            console.log(errorMessage);

            return {
                errorMessage: errorMessage,
                errorType: CardLinkErrorType.NoneOrAbsent
            }
        }
    } catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} query ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: CardLinkErrorType.UnexpectedError
        };
    }
}
