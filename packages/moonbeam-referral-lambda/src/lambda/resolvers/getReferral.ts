import * as AWS from 'aws-sdk'
import {Referral, ReferralErrorType, ReferralResponse} from "@moonbeam/moonbeam-models";
import {unmarshall} from "@aws-sdk/util-dynamodb";

// @ts-ignore
export const getReferral = async (id: string): Promise<ReferralResponse> => {
    // initializing the DynamoDB document client
    // @ts-ignore
    const docClient = new AWS.DynamoDB.DocumentClient();

    // @ts-ignore
    const params = {
        TableName: process.env.REFERRAL_TABLE!,
        Key: {id: id}
    };

    try {
        const {Item} = await docClient.get(params).promise();
        const retrievedReferral = unmarshall(Item!) as Referral;
        return {
            data: [retrievedReferral]
        }
    } catch (err) {
        console.log(`Unexpected error while executing getReferral query {}`, err);

        return {
            data: [],
            errorMessage: `Unexpected error while executing getReferral query. ${err}`,
            errorType: ReferralErrorType.UnexpectedError
        };
    }
}
