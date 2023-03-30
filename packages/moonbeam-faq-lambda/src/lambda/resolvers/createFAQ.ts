import * as AWS from 'aws-sdk';
import {CreateFaqInput, Faq, FaqErrorType, FaqResponse, FaqType} from "@moonbeam/moonbeam-models";

/**
 * CreateFAQ resolver
 *
 * @param createFaqInput object to be used when creating a new FAQ object
 * @returns {@link Promise} of {@link FaqResponse}
 */
export const createFAQ = async (createFaqInput: CreateFaqInput): Promise<FaqResponse> => {
    try {
        // initializing the DynamoDB document client
        const docClient = new AWS.DynamoDB.DocumentClient();

        // update the timestamps accordingly
        const createdAt = new Date().toISOString();
        createFaqInput.createdAt = createdAt;
        createFaqInput.updatedAt = createdAt

        // validating that the appropriate input object parameters are passed in according to the type of FAQ to be created
        switch (createFaqInput.type) {
            case FaqType.Linkable:
                // validate that there is an application link passed in, and that there are no facts in the FAQ object
                if (!createFaqInput.applicationLink || (createFaqInput.facts && createFaqInput.facts.length !== 0)) {
                    const invalidLinkableInputMessage = `Invalid ${FaqType.Linkable} input passed in!`;
                    return {
                        errorMessage: invalidLinkableInputMessage,
                        errorType: FaqErrorType.ValidationError
                    }
                }
                break;
            case FaqType.NonLinkable:
                // validate that there is no application link passed in, and that there is a least one fact in the FAQ object
                if (createFaqInput.applicationLink || (!createFaqInput.facts || createFaqInput.facts.length === 0)) {
                    const invalidNonLinkableInputMessage = `Invalid ${FaqType.NonLinkable} input passed in!`;
                    return {
                        errorMessage: invalidNonLinkableInputMessage,
                        errorType: FaqErrorType.ValidationError
                    }
                }
                break;
            default:
                const invalidFAQTypeMessage = `Invalid FAQ type passed in ${createFaqInput.type}`;
                console.log(invalidFAQTypeMessage);
                return {
                    errorMessage: invalidFAQTypeMessage,
                    errorType: FaqErrorType.ValidationError
                }
        }

        // store the FAQ object
        await docClient.put({
            TableName: process.env.FAQ_TABLE!,
            Item: createFaqInput
        }).promise();

        // return the FAQS object
        return {
            data: [createFaqInput as Faq]
        }
    } catch (err) {
        console.log(`Unexpected error while executing createFAQ mutation {}`, err);
        return {
            errorMessage: `Unexpected error while executing createFAQ mutation ${err}`,
            errorType: FaqErrorType.UnexpectedError
        };
    }
}
