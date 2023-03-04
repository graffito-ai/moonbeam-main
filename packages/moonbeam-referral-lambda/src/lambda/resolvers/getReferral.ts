import * as AWS from 'aws-sdk'
import {ReferralErrorType, ReferralResponse} from "@moonbeam/moonbeam-models";
import { Referral } from '@moonbeam/moonbeam-models';

/**
 * GetReferral resolver
 *
 * @param id referral id, for the referral to be retrieved
 * @returns {@link Promise} of {@link ReferralResponse}
 */
export const getReferral = async (id: string): Promise<ReferralResponse> => {
    // initializing the DynamoDB document client
    const docClient = new AWS.DynamoDB.DocumentClient();

    const params = {
        TableName: process.env.REFERRAL_TABLE!,
        Key: {id: id}
    };

    try {
        const {Item} = await docClient.get(params).promise();
        return {
            data: [Item as Referral]
        }
    } catch (err) {
        console.log(`Unexpected error while executing getReferral query {}`, err);
        return {
            errorMessage: `Unexpected error while executing getReferral query. ${err}`,
            errorType: ReferralErrorType.UnexpectedError
        };
    }
}
