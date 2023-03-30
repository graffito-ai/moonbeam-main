import * as AWS from 'aws-sdk';
import {AccountResponse, FaqErrorType, FaqResponse, ListFaqInput} from "@moonbeam/moonbeam-models";

/**
 * ListFAQs resolver
 *
 * @param listFaqInput input to be passed in, which will help filter through all the FAQs
 * @returns {@link Promise} of {@link AccountResponse}
 */
export const listFAQs = async (listFaqInput: ListFaqInput): Promise<FaqResponse> => {
    try {
        // initializing the DynamoDB document client
        const docClient = new AWS.DynamoDB.DocumentClient();

        return {
            data: []
        }
    } catch (err) {
        console.log(`Unexpected error while executing listFAQs query {}`, err);

        return {
            errorMessage: `Unexpected error while executing listFAQs query. ${err}`,
            errorType: FaqErrorType.UnexpectedError
        };
    }
}
