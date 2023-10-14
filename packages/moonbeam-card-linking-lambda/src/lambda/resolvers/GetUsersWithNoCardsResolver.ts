import {
    CardLinkErrorType,
    CardLinkingStatus,
    IneligibleLinkedUsersResponse,
    MoonbeamClient,
    UserForNotificationReminderResponse
} from "@moonbeam/moonbeam-models";
import {AttributeValue, DynamoDBClient, QueryCommand} from "@aws-sdk/client-dynamodb";

/**
 * GetUsersWithNoCards resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @returns {@link Promise} of {@link IneligibleLinkedUsersResponse}
 */
export const getUsersWithNoCards = async (fieldName: string): Promise<IneligibleLinkedUsersResponse> => {
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
        let eligibleUsersResult: Record<string, AttributeValue>[] = [];
        let exclusiveStartKey, retrievedData;

        do {
            /**
             * retrieve all the eligible linked users, given the global secondary index, as well as the LINKED status to be queried by
             *
             * Limit of 1 MB per paginated response data (in our case 5,700 items). An average size for an Item is about 133 bytes, which means that we won't
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
                Limit: 5700, // 5,700 * 133 bytes = 758,100 bytes = 0.7581 MB (leave a margin of error here up to 1 MB)
                /**
                 * we're not interested in getting all the data for this call, just the minimum for us to return the necessary information
                 *
                 * @link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html
                 * @link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ExpressionAttributeNames.html
                 */
                ProjectionExpression: '#idf, #mid, #card' + '[0].id',
                ExpressionAttributeNames: {
                    '#idf': 'id',
                    '#card': 'cards',
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
            eligibleUsersResult = eligibleUsersResult.concat(retrievedData.Items);
        } while (retrievedData && retrievedData.Count && retrievedData.Items &&
        retrievedData.Items.length && retrievedData.Count !== 0 &&
        retrievedData.Items.length !== 0 && retrievedData.LastEvaluatedKey);

        /**
         * retrieve the list of all existent users from our Cognito user pool (eligible + ineligible)
         *
         * first, initialize the Moonbeam Client API here, in order to call the appropriate endpoints for this handler
         */
        const moonbeamClient = new MoonbeamClient(process.env.ENV_NAME!, region);
        const usersForNotificationReminderResponse: UserForNotificationReminderResponse = await moonbeamClient.getAllUsersForNotificationReminders();

        // check to see if the get all users call was successful or not
        if (usersForNotificationReminderResponse && !usersForNotificationReminderResponse.errorMessage && !usersForNotificationReminderResponse.errorType &&
            usersForNotificationReminderResponse.data && usersForNotificationReminderResponse.data.length !== 0) {
            // if there are eligible users retrieved, then remove them from the list of all users retrieved (since we only need ineligible users returned)
            if (eligibleUsersResult && eligibleUsersResult.length !== 0) {
                // build out an array of eligible IDs from the list of DynamoDB records, representing eligible users returned
                console.log(`Found some eligible linked users, needed to get filtered out from the list of all users`);
                const eligibleIds: string[] = [];
                eligibleUsersResult.forEach(eligibleUserResult => eligibleIds.push(eligibleUserResult.id.S!));

                // filter out and return the eligible users from the list of all users retrieved
                return {
                    data: usersForNotificationReminderResponse.data.filter(user => !eligibleIds.includes(user!.id))
                };
            } else {
                // if there are no eligible users found, then we can conclude that all users retrieved are ineligible/have no linked cards
                const errorMessage = `Eligible linked users not found, returning all linked users instead!`;
                console.log(errorMessage);

                return {
                    data: usersForNotificationReminderResponse.data
                }
            }
        } else {
            const errorMessage = `Retrieving all users through the getAllUsersForNotificationReminders call failed`;
            console.log(errorMessage);

            return {
                errorMessage: errorMessage,
                errorType: CardLinkErrorType.UnexpectedError
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
