import * as AWS from 'aws-sdk';
import {CreateReferralInput, ReferralErrorType, ReferralResponse} from "@moonbeam/moonbeam-models";

/**
 * CreateReferral resolver
 *
 * @param createInput referral object to be created
 * @returns {@link Promise} of {@link ReferralResponse}
 */
export const createReferral = async (createInput: CreateReferralInput): Promise<ReferralResponse> => {
    // initializing the DynamoDB document client
    const docClient = new AWS.DynamoDB.DocumentClient();

    try {
        // store the referral object
        await docClient.put({
            TableName: process.env.REFERRAL_TABLE!,
            Item: createInput
        }).promise();

        // return the referral object
        return {
            data: [createInput]
        }
    } catch (err) {
        console.log(`Unexpected error while executing createReferral mutation {}`, err);
        return {
            errorMessage: `Unexpected error while executing createReferral mutation. ${err}`,
            errorType: ReferralErrorType.UnexpectedError
        };
    }
}
