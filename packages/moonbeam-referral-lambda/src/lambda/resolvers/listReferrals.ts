import * as AWS from 'aws-sdk'
import {ListReferralInput, ReferralErrorType, ReferralResponse} from "@moonbeam/moonbeam-models";

// @ts-ignore
export const listReferrals = async (filter: ListReferralInput): Promise<ReferralResponse> => {
    // initializing the DynamoDB document client
    // @ts-ignore
    const docClient = new AWS.DynamoDB.DocumentClient();

    // @ts-ignore
    const params = {
        TableName: process.env.REFERRAL_TABLE!,
    };

    try {
        // first check to see if the parameters are accurately passed in
        /**
         * first check to see if the incoming filter parameters are accurately passed in
         * we need to have one of either:
         * -
         */
        if (filter.inviteeEmail && filter.inviterEmail) {
            const validationErrMessage = "Invalid filters: inviteeEmail AND inviterEmail. Choose one or the other!";
            console.log(validationErrMessage);
            return {
                data: [],
                errorMessage: validationErrMessage,
                errorType: ReferralErrorType.UnexpectedError
            };
        }
        if (filter.statusInvitee && filter.statusInviter) {
            const validationErrMessage = "Invalid filters: statusInvitee AND statusInviter. Choose one or the other!";
            console.log(validationErrMessage);
            return {
                data: [],
                errorMessage: validationErrMessage,
                errorType: ReferralErrorType.UnexpectedError
            };
        }
        if ((filter.inviteeEmail && !filter.statusInvitee) || (!filter.inviteeEmail && filter.statusInvitee)) {
            const validationErrMessage = "Invalid filters: inviteeEmail AND statusInvitee are to be used together!";
            console.log(validationErrMessage);
            return {
                data: [],
                errorMessage: validationErrMessage,
                errorType: ReferralErrorType.UnexpectedError
            };
        }
        if ((filter.inviterEmail && !filter.statusInviter) || (!filter.inviterEmail && filter.statusInviter)) {
            const validationErrMessage = "Invalid filters: inviterEmail AND statusInviter are to be used together!";
            console.log(validationErrMessage);
            return {
                data: [],
                errorMessage: validationErrMessage,
                errorType: ReferralErrorType.UnexpectedError
            };
        }

        // build a response to return
        return {
            data: [],
            errorMessage: `Lala error mofo`,
            errorType: ReferralErrorType.UnexpectedError
        };
        // const referralData = await docClient.scan(params).promise();
        // return Item;
    } catch (err) {
        console.log(`Unexpected error while executing listReferrals query {}`, err);

        return {
            data: [],
            errorMessage: `Unexpected error while executing listReferrals query. ${err}`,
            errorType: ReferralErrorType.UnexpectedError
        };
    }
}
