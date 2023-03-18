import * as AWS from 'aws-sdk';
import {CreateReferralInput, Referral, ReferralErrorType, ReferralResponse} from "@moonbeam/moonbeam-models";

/**
 * CreateReferral resolver
 *
 * @param createReferralInput referral object to be created
 * @returns {@link Promise} of {@link ReferralResponse}
 */
export const createReferral = async (createReferralInput: CreateReferralInput): Promise<ReferralResponse> => {
    try {
        // initializing the DynamoDB document client
        const docClient = new AWS.DynamoDB.DocumentClient();

        // update the timestamps accordingly
        const createdAt = new Date().toISOString();
        createReferralInput.createdAt = createdAt;
        createReferralInput.updatedAt = createdAt

        // store the referral object
        await docClient.put({
            TableName: process.env.REFERRAL_TABLE!,
            Item: createReferralInput
        }).promise();

        // return the referral object
        return {
            data: [createReferralInput as Referral]
        }
    } catch (err) {
        console.log(`Unexpected error while executing createReferral mutation {}`, err);
        return {
            errorMessage: `Unexpected error while executing createReferral mutation ${err}`,
            errorType: ReferralErrorType.UnexpectedError
        };
    }
}
