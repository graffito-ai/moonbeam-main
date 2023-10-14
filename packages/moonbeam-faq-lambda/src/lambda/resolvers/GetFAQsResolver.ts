import {AttributeValue, DynamoDBClient, ScanCommand} from "@aws-sdk/client-dynamodb";
import {Fact, FactType, Faq, FaqErrorType, FaqResponse} from "@moonbeam/moonbeam-models";

/**
 * GetFAQs resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @returns {@link Promise} of {@link FaqResponse}
 */
export const getFAQs = async (fieldName: string): Promise<FaqResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initializing the DynamoDB document client
        const dynamoDbClient = new DynamoDBClient({region: region});

        /**
         * the data to be retrieved from the Query Command
         * the eligible user Items returned from the Query Command, all aggregated together
         * the last evaluated key, to help with the pagination of results
         */
        let result: Record<string, AttributeValue>[] = [];
        let retrievedData;

        do {
            /**
             * retrieve all the FAQs
             *
             * Limit of 1 MB per paginated response data, but we won't have that many FAQs anyway for now, which means that we won't
             * need to do pagination here.
             *
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.Pagination.html}
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.html}
             */
            retrievedData = await dynamoDbClient.send(new ScanCommand({
                TableName: process.env.FAQ_TABLE!,
                Limit: 1000, // for now, we don't need to worry about this limit
            }));

            result = result.concat(retrievedData.Items);
        } while (retrievedData && retrievedData.Count && retrievedData.Items &&
        retrievedData.Items.length && retrievedData.Count !== 0 &&
        retrievedData.Items.length !== 0 && retrievedData.LastEvaluatedKey);

        // if there are eligible users retrieved, then return them accordingly
        if (result && result.length !== 0) {
            // convert the Dynamo DB data from Dynamo DB JSON format to a FAQ data format
            const faqsData: Faq[] = [];
            result.forEach(faqResult => {
                const facts: Fact[] = [];
                faqResult.facts.L && faqResult.facts.L!.forEach(fact => {
                    const newFact: Fact = {
                        description: fact.M!.description.S!,
                        ...(fact.M!.linkableKeyword && {
                            linkableKeyword: fact.M!.linkableKeyword.S!
                        }),
                        ...(fact.M!.linkLocation && {
                            linkLocation: fact.M!.linkLocation.S!
                        }),
                        type: fact.M!.type.S! as FactType
                    }
                    facts.push(newFact);
                })
                const faq: Faq = {
                    id: faqResult.id.S!,
                    title: faqResult.title.S!,
                    facts: facts,
                    createdAt: faqResult.createdAt.S!,
                    updatedAt: faqResult.updatedAt.S!,
                };
                faqsData.push(faq);
            });
            // return the list of FAQs retrieved
            return {
                data: faqsData
            }
        } else {
            const errorMessage = `No FAQs found!`;
            console.log(errorMessage);

            return {
                errorMessage: errorMessage,
                errorType: FaqErrorType.NoneOrAbsent
            }
        }
    } catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} query ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: FaqErrorType.UnexpectedError
        };
    }
}
