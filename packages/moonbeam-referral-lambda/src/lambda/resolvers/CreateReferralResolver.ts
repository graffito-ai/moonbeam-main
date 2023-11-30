import {
    CreateReferralInput,
    MarketingCampaignCode,
    Referral,
    ReferralErrorType,
    ReferralResponse,
    ReferralStatus
} from "@moonbeam/moonbeam-models";
import {DynamoDBClient, GetItemCommand, PutItemCommand} from "@aws-sdk/client-dynamodb";

/**
 * CreateReferral resolver
 *
 * @param createReferralInput the input needed to create a new referral
 * @param fieldName name of the resolver path from the AppSync event
 * @returns {@link Promise} of {@link ReferralResponse}
 */
export const createReferral = async (fieldName: string, createReferralInput: CreateReferralInput): Promise<ReferralResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initializing the DynamoDB document client
        const dynamoDbClient = new DynamoDBClient({region: region});

        // update the timestamps accordingly
        const createdAt = new Date().toISOString();
        const timestamp = Date.parse(createdAt);
        createReferralInput.createdAt = createReferralInput.createdAt ? createReferralInput.createdAt : createdAt;
        createReferralInput.updatedAt = createReferralInput.updatedAt ? createReferralInput.updatedAt : createdAt;

        /**
         * check to see if the referral already exists in the DB. Although this is a very rare situation, since we have so many resilient
         * methods (such as Dead-Letter-Queue, retries, etc.) we want to put a safeguard around duplicates even here.
         */
        const preExistingReferral = await dynamoDbClient.send(new GetItemCommand({
            TableName: process.env.REFERRAL_TABLE!,
            Key: {
                fromId: {
                    S: createReferralInput.fromId
                },
                timestamp: {
                    N: timestamp.toString()
                }
            },
            /**
             * we're not interested in getting all the data for this call, just the minimum for us to determine whether this is a duplicate or not
             *
             * @link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html
             * @link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ExpressionAttributeNames.html
             */
            ProjectionExpression: '#fId, #t',
            ExpressionAttributeNames: {
                '#fId': 'fromId',
                '#t': 'timestamp'
            }
        }));

        // if there is an item retrieved, then we return an error
        if (preExistingReferral && preExistingReferral.Item) {
            /**
             * if there is a pre-existing referral with the same composite primary key (fromId/toId) combination,
             * then we cannot duplicate that, so we will return an error.
             */
            const errorMessage = `Duplicate referral found!`;
            console.log(errorMessage);

            return {
                errorMessage: errorMessage,
                errorType: ReferralErrorType.DuplicateObjectFound
            }
        } else {
            // create an initial status of a referral depending on the type of campaign code passed in
            let referralStatus;

            switch (createReferralInput.campaignCode) {
                case MarketingCampaignCode.Raffleregdec23:
                    referralStatus = ReferralStatus.Pending;
                    break;
                case MarketingCampaignCode.Raffleregjan24:
                    referralStatus = ReferralStatus.Pending;
                    break;
                default:
                    console.log(`Unknown campaign code passed in ${createReferralInput.campaignCode}, falling back to a ${ReferralStatus.Pending} referral status`);
                    referralStatus = ReferralStatus.Pending;
            }

            // store the transaction object
            await dynamoDbClient.send(new PutItemCommand({
                TableName: process.env.REFERRAL_TABLE!,
                Item: {
                    fromId: {
                        S: createReferralInput.fromId
                    },
                    timestamp: {
                        N: timestamp.toString()
                    },
                    toId: {
                        S: createReferralInput.toId
                    },
                    createdAt: {
                        S: createReferralInput.createdAt
                    },
                    updatedAt: {
                        S: createReferralInput.updatedAt
                    },
                    campaignCode: {
                        S: createReferralInput.campaignCode
                    },
                    status: {
                        S: referralStatus
                    }
                }
            }));

            // return the referral object
            return {
                data: [{
                    ...createReferralInput,
                    timestamp: timestamp,
                    status: referralStatus
                } as Referral]
            }
        }
    } catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} mutation ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: ReferralErrorType.UnexpectedError
        }
    }
}
