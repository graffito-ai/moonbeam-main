import * as AWS from 'aws-sdk';
import {
    AccountLinkDetails,
    AccountLinkResponse,
    LinkErrorType,
    UpdateAccountLinkInput
} from "@moonbeam/moonbeam-models";
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
 * UpdateAccountLink resolver
 *
 * @param updateAccountLinkInput input to update an account link to
 * @returns {@link Promise} of {@link ReferralResponse}
 */
export const updateAccountLink = async (updateAccountLinkInput: UpdateAccountLinkInput): Promise<AccountLinkResponse> => {
    // initializing the DynamoDB document client
    const docClient = new AWS.DynamoDB.DocumentClient();

    try {
        // validating that the appropriate update link parameters are passed in
        if (!updateAccountLinkInput.accountLinkError &&
            (
                (!updateAccountLinkInput.accounts && !updateAccountLinkInput.accessToken) ||
                (updateAccountLinkInput.accounts && (updateAccountLinkInput.accounts.length === 0 || !updateAccountLinkInput.accessToken)) ||
                (!updateAccountLinkInput.accounts && updateAccountLinkInput.accessToken)
            )) {
            console.log(`Invalid link parameters to update account link with {}`, JSON.stringify(updateAccountLinkInput));
            return {
                errorMessage: `Invalid link parameters to update account link with ${JSON.stringify(updateAccountLinkInput)}`,
                errorType: LinkErrorType.ValidationError
            };
        }

        // build the parameters to passed in, in order to update the account link object
        let params: UpdateParams = {
            TableName: process.env.ACCOUNT_LINKS!,
            Key: {
                id: updateAccountLinkInput.id
            },
            ExpressionAttributeValues: {},
            ExpressionAttributeNames: {},
            UpdateExpression: "",
            ReturnValues: "UPDATED_NEW"
        };
        let prefix = "set ";
        let attributes = Object.keys(updateAccountLinkInput);
        for (let i = 0; i < attributes.length; i++) {
            let attribute = attributes[i];
            if (attribute !== "id") {
                params["UpdateExpression"] += prefix + "#" + attribute + " = :" + attribute;
                // @ts-ignore
                params["ExpressionAttributeValues"][":" + attribute] = updateAccountLinkInput[attribute];
                params["ExpressionAttributeNames"]["#" + attribute] = attribute;
                prefix = ", ";
            }
        }

        // update the account link based on the passed in object
        await docClient.update(params).promise();

        // return the updated referral object
        return {
            data: updateAccountLinkInput as AccountLinkDetails
        }
    } catch (err) {
        console.log(`Unexpected error while executing updateAccountLink mutation {}`, err);
        return {
            errorMessage: `Unexpected error while executing updateAccountLink mutation. ${err}`,
            errorType: LinkErrorType.UnexpectedError
        };
    }
}
