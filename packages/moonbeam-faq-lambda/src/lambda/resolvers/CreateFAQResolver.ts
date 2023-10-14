import {AttributeValue, DynamoDBClient, GetItemCommand, PutItemCommand} from "@aws-sdk/client-dynamodb";
import {CreateFaqInput, Faq, FaqErrorType, FaqResponse} from "@moonbeam/moonbeam-models";
import {v4 as uuidv4} from 'uuid';

/**
 * CreateFAQ resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param createFAQInput FAQS input object, used to create a new FAQ object.
 * @returns {@link Promise} of {@link FaqResponse}
 */
export const createFAQ = async (fieldName: string, createFAQInput: CreateFaqInput): Promise<FaqResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initializing the DynamoDB document client
        const dynamoDbClient = new DynamoDBClient({region: region});

        // update the timestamps accordingly
        const createdAt = new Date().toISOString();
        createFAQInput.createdAt = createFAQInput.createdAt ? createFAQInput.createdAt : createdAt;
        createFAQInput.updatedAt = createFAQInput.updatedAt ? createFAQInput.updatedAt : createdAt;

        /**
         * check to see if there is an existing FAQ with the same ID, in case there is
         * an id passed in.
         */
        const preExistingFAQ = createFAQInput.id && await dynamoDbClient.send(new GetItemCommand({
            TableName: process.env.FAQ_TABLE!,
            Key: {
                id: {
                    S: createFAQInput.id
                }
            },
            /**
             * we're not interested in getting all the data for this call, just the minimum for us to determine whether this is a duplicate or not
             *
             * @link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html
             * @link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ExpressionAttributeNames.html
             */
            ProjectionExpression: '#idf',
            ExpressionAttributeNames: {
                '#idf': 'id'
            }
        }));

        // if there is an item retrieved, then we return an error
        if (preExistingFAQ && preExistingFAQ.Item) {
            // if there is an existent FAQ object, then we cannot duplicate that, so we will return an error
            const errorMessage = `Duplicate FAQ object found!`;
            console.log(errorMessage);

            return {
                errorMessage: errorMessage,
                errorType: FaqErrorType.DuplicateObjectFound
            }
        } else {
            // generate a unique application identifier for the FAQ, if not already passed in
            createFAQInput.id = createFAQInput.id ? createFAQInput.id : uuidv4();

            // store the FAQ object
            const facts: AttributeValue[] = [];
            createFAQInput.facts.forEach(fact => {
                facts.push({
                    M: {
                        description: {
                            S: fact!.description
                        },
                        ...(fact!.linkableKeyword && {
                            linkableKeyword: {
                                S: fact!.linkableKeyword!
                            }
                        }),
                        ...(fact!.linkLocation && {
                            linkLocation: {
                                S: fact!.linkLocation!
                            }
                        }),
                        type: {
                            S: fact!.type
                        }
                    }
                })
            });

            await dynamoDbClient.send(new PutItemCommand({
                TableName: process.env.FAQ_TABLE!,
                Item: {
                    id: {
                        S: createFAQInput.id!
                    },
                    title: {
                        S: createFAQInput.title
                    },
                    createdAt: {
                        S: createFAQInput.createdAt!
                    },
                    updatedAt: {
                        S: createFAQInput.updatedAt!
                    },
                    facts: {
                        L: facts
                    }
                },
            }));

            // return the FAQ object
            return {
                data: [createFAQInput as Faq]
            }
        }
    } catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} mutation ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: FaqErrorType.UnexpectedError
        }
    }
}
