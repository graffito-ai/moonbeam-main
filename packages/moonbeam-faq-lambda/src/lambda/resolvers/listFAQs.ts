import * as AWS from 'aws-sdk';
import {AccountResponse, Faq, FaqErrorType, FaqResponse, ListFaqInput} from "@moonbeam/moonbeam-models";

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

        // retrieving all FAQs in the database
        const result = await docClient.scan({
            TableName: process.env.FAQ_TABLE!,
        }).promise();

        // build FAQ data response
        const faqs: Faq[] = [];
        result.Items!.forEach((item) => {
            faqs.push(item as Faq)
        });

        // check to see if there is a type passed in, to filter by, and filter the retrieved FAQs by it
        if (listFaqInput.type) {
            const filteredAQs: Faq[] = [];
            faqs.filter((faq) => faq.type === listFaqInput.type).map((faq) => filteredAQs.push(faq));

            // returns the filtered FAQs as data
            return {
                data: filteredAQs
            }
        } else {
            // returns all FAQs as data
            return {
                data: faqs
            }
        }
    } catch (err) {
        console.log(`Unexpected error while executing listFAQs query {}`, err);

        return {
            errorMessage: `Unexpected error while executing listFAQs query. ${err}`,
            errorType: FaqErrorType.UnexpectedError
        };
    }
}
