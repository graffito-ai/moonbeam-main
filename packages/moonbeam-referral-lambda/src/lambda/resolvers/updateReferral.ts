import * as AWS from 'aws-sdk';
import {Referral, ReferralErrorType, ReferralResponse, UpdateReferralInput} from "@moonbeam/moonbeam-models";
import {TableName, UpdateExpression} from 'aws-sdk/clients/dynamodb';

/**
 * Mapping out the update parameters to pass in to the DynamoDB client
 */
type UpdateParams = {
    TableName: TableName
    Key: any,
    ExpressionAttributeValues: any,
    ExpressionAttributeNames: any,
    UpdateExpression: UpdateExpression,
    ReturnValues: string
}

/**
 * UpdateReferral resolver
 *
 * @param updateReferralInput input to update a referral to
 * @returns {@link Promise} of {@link ReferralResponse}
 */
export const updateReferral = async (updateReferralInput: UpdateReferralInput): Promise<ReferralResponse> => {
    // initializing the DynamoDB document client
    const docClient = new AWS.DynamoDB.DocumentClient();

    try {
        // update the timestamps accordingly
        updateReferralInput.updatedAt = new Date().toISOString();

        // build the parameters to passed in, in order to update the referral object
        let params: UpdateParams = {
            TableName: process.env.REFERRAL_TABLE!,
            Key: {
                id: updateReferralInput.id
            },
            ExpressionAttributeValues: {},
            ExpressionAttributeNames: {},
            UpdateExpression: "",
            ReturnValues: "UPDATED_NEW"
        };
        let prefix = "set ";
        let attributes = Object.keys(updateReferralInput);
        for (let i=0; i < attributes.length; i++) {
            let attribute = attributes[i];
            if (attribute !== "id") {
                params["UpdateExpression"] += prefix + "#" + attribute + " = :" + attribute;
                // @ts-ignore
                params["ExpressionAttributeValues"][":" + attribute] = updateReferralInput[attribute];
                params["ExpressionAttributeNames"]["#" + attribute] = attribute;
                prefix = ", ";
            }
        }

        // update the referral based on the passed in object
        await docClient.update(params).promise();

        // return the updated referral object
        return {
            data: [updateReferralInput as Referral]
        }
    } catch (err) {
        console.log(`Unexpected error while executing updateReferral mutation {}`, err);
        return {
            errorMessage: `Unexpected error while executing updateReferral mutation. ${err}`,
            errorType: ReferralErrorType.UnexpectedError
        };
    }
}
