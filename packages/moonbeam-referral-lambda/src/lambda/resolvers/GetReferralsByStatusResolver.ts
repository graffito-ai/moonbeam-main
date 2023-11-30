import {
    GetReferralsByStatusInput,
    MarketingCampaignCode,
    Referral,
    ReferralErrorType,
    ReferralResponse
} from "@moonbeam/moonbeam-models";
import {AttributeValue, DynamoDBClient, QueryCommand} from "@aws-sdk/client-dynamodb";

/**
 * GetReferralsByStatus resolver
 *
 * @param getReferralsByStatusInput the input needed to create a new referral
 * @param fieldName name of the resolver path from the AppSync event
 * @returns {@link Promise} of {@link ReferralResponse}
 */
export const getReferralsByStatus = async (fieldName: string, getReferralsByStatusInput: GetReferralsByStatusInput): Promise<ReferralResponse> => {
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
             * retrieve all referrals by status, given the global secondary index, as well as the status to be queried by
             *
             * Limit of 1 MB per paginated response data (in our case 5,700 items). An average size for an Item is about 133 bytes, which means that we won't
             * need to do pagination here, since we actually retrieve all users in a looped format, and we account for
             * paginated responses.
             *
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.Pagination.html}
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.html}
             */
            retrievedData = await dynamoDbClient.send(new QueryCommand({
                TableName: process.env.REFERRAL_TABLE!,
                IndexName: `${process.env.REFERRAL_STATUS_GLOBAL_INDEX!}-${process.env.ENV_NAME!}-${region}`,
                ...(exclusiveStartKey && {ExclusiveStartKey: exclusiveStartKey}),
                Limit: 5700, // 5,700 * 133 bytes = 758,100 bytes = 0.7581 MB (leave a margin of error here up to 1 MB)
                ExpressionAttributeNames: {
                    '#st': 'status'
                },
                ExpressionAttributeValues: {
                    ":st": {
                        S: getReferralsByStatusInput.status
                    }
                },
                KeyConditionExpression: '#st = :st'
            }));

            exclusiveStartKey = retrievedData.LastEvaluatedKey;
            result = result.concat(retrievedData.Items);
        } while (retrievedData && retrievedData.Count && retrievedData.Items &&
        retrievedData.Items.length && retrievedData.Count !== 0 &&
        retrievedData.Items.length !== 0 && retrievedData.LastEvaluatedKey);

        // if there are referrals retrieved, then return all of them accordingly
        if (result && result.length !== 0) {
            // convert the Dynamo DB data from Dynamo DB JSON format to a Moonbeam Referral data format
            const referralData: Referral[] = [];
            result.forEach(referralResult => {
                const referral: Referral = {
                    fromId: referralResult.fromId.S!,
                    timestamp: Number(referralResult.timestamp.N!),
                    toId: referralResult.toId.S!,
                    status: getReferralsByStatusInput.status,
                    campaignCode: referralResult.campaignCode.S! as MarketingCampaignCode,
                    createdAt: referralResult.createdAt.S!,
                    updatedAt: referralResult.updatedAt.S!
                };
                referralData.push(referral);
            });
            // return the list of referrals
            return {
                data: referralData
            }
        } else {
            const errorMessage = `No matching referrals found!`;
            console.log(errorMessage);

            return {
                errorMessage: errorMessage,
                errorType: ReferralErrorType.NoneOrAbsent
            }
        }
    } catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} query ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: ReferralErrorType.UnexpectedError
        };
    }
}
