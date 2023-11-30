import {
    MarketingCampaignCode,
    ReferralErrorType,
    ReferralResponse,
    UpdateReferralInput
} from "@moonbeam/moonbeam-models";
import {DynamoDBClient, GetItemCommand, UpdateItemCommand} from "@aws-sdk/client-dynamodb";

/**
 * UpdateReferral resolver
 *
 * @param updateReferralInput the input needed to update an existing referral's data
 * @param fieldName name of the resolver path from the AppSync event
 * @returns {@link Promise} of {@link ReferralResponse}
 */
export const updateReferral = async (fieldName: string, updateReferralInput: UpdateReferralInput): Promise<ReferralResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initializing the DynamoDB document client
        const dynamoDbClient = new DynamoDBClient({region: region});

        // update the timestamps accordingly
        const updatedAt = new Date().toISOString();
        updateReferralInput.updatedAt = updateReferralInput.updatedAt ? updateReferralInput.updatedAt : updatedAt;

        // check to see if there is a referral object to update. If there's none, then return an error accordingly.
        const preExistingReferralObject = await dynamoDbClient.send(new GetItemCommand({
            TableName: process.env.REFERRAL_TABLE!,
            Key: {
                fromId: {
                    S: updateReferralInput.fromId
                },
                timestamp: {
                    N: updateReferralInput.timestamp.toString()
                }
            }
        }));

        // if there is an item retrieved to be updated, then we proceed accordingly. Otherwise, we throw an error.
        if (preExistingReferralObject && preExistingReferralObject.Item) {
            // update the referral object based on the passed in object - for now only containing the status details
            await dynamoDbClient.send(new UpdateItemCommand({
                TableName: process.env.REFERRAL_TABLE!,
                Key: {
                    fromId: {
                        S: updateReferralInput.fromId
                    },
                    timestamp: {
                        N: updateReferralInput.timestamp.toString()
                    }
                },
                ExpressionAttributeNames: {
                    "#stat": "status",
                    "#uat": "updatedAt"
                },
                ExpressionAttributeValues: {
                    ":stat": {
                        S: updateReferralInput.status
                    },
                    ":at": {
                        S: updateReferralInput.updatedAt
                    }
                },
                UpdateExpression: "SET #stat = :stat, #uat = :at",
                ReturnValues: "UPDATED_NEW"
            }));

            // return the updated referral details
            return {
                data: [
                    {
                        fromId: updateReferralInput.fromId,
                        timestamp: updateReferralInput.timestamp,
                        toId: preExistingReferralObject.Item.toId.S!,
                        createdAt: preExistingReferralObject.Item.createdAt.S!,
                        updatedAt: updateReferralInput.updatedAt,
                        campaignCode: preExistingReferralObject.Item.campaignCode.S! as MarketingCampaignCode,
                        status: updateReferralInput.status
                    }
                ]
            }
        } else {
            const errorMessage = `Unknown referral object to update!`;
            console.log(errorMessage);

            return {
                errorMessage: errorMessage,
                errorType: ReferralErrorType.NoneOrAbsent
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
