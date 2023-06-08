import {DynamoDBClient, GetItemCommand, PutItemCommand} from "@aws-sdk/client-dynamodb";
import {Card, CardLinkErrorType, CardLinkResponse, CreateCardLinkInput, OliveClient} from "@moonbeam/moonbeam-models";
import {v4 as uuidv4} from 'uuid';

/**
 * CreateCardLink resolver
 *
 * @param createCardLinkInput card link input object, used to create a card link object and/or add a new card to
 * an existing linking object
 * @returns {@link Promise} of {@link CardLinkResponse}
 */
export const createCardLink = async (createCardLinkInput: CreateCardLinkInput): Promise<CardLinkResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initializing the DynamoDB document client
        const dynamoDbClient = new DynamoDBClient({region: region});

        // update the timestamps accordingly
        const createdAt = new Date().toISOString();
        createCardLinkInput.card.createdAt = createCardLinkInput.card.createdAt ? createCardLinkInput.card.createdAt : createdAt;
        createCardLinkInput.card.updatedAt = createCardLinkInput.card.updatedAt ? createCardLinkInput.card.updatedAt : createdAt;

        // check to see if the user already has a card enrolled in. If they do, then return an error since we only support one card linking per customer as of now.
        const preExistingCardForLink =  await dynamoDbClient.send(new GetItemCommand({
            TableName: process.env.CARD_LINKING_TABLE!,
            Key: {
                id: {
                    S: createCardLinkInput.id
                }
            }
        }));
        // if there is an item retrieved, then we need to check its contents
        if (preExistingCardForLink && preExistingCardForLink.Item) {
            // if there is an existent link, then it will contain a card, so we will return an error
            const errorMessage = `Pre-existing card already linked. Unlink that one before adding a new one!`;
            console.log(errorMessage);

            return {
                errorMessage: errorMessage,
                errorType: CardLinkErrorType.AlreadyExistent
            }
        } else {
            // there is no card link available in the DB, so we will create one with the appropriate card.

            // generate a unique identifier for the card, to be passed in to Olive as the enrollment identifier
            createCardLinkInput.card.id = uuidv4();

            // call the Olive Client API here, in order to call the appropriate endpoints for this resolver
            const oliveClient = new OliveClient(createCardLinkInput.card as Card, createCardLinkInput.id, process.env.ENV_NAME!, region);
            const cardLinkResponse = await oliveClient.link();

            // check to see if the card linking call was executed successfully
            if (cardLinkResponse && !cardLinkResponse.errorMessage && !cardLinkResponse.errorType && cardLinkResponse.data) {
                // store the card linking object
                await dynamoDbClient.send(new PutItemCommand({
                    TableName: process.env.CARD_LINKING_TABLE!,
                    Item: {
                        id: {
                            S: createCardLinkInput.id
                        },
                        cards: {
                            L: [
                                {
                                    M: {
                                        id: {
                                            S: createCardLinkInput.card.id!
                                        },
                                        ...(createCardLinkInput.card.additionalProgramID && {
                                            additionalProgramID: {
                                                S: createCardLinkInput.card.additionalProgramID!
                                            }
                                        }),
                                        createdAt: {
                                            S: createCardLinkInput.card.createdAt
                                        },
                                        updatedAt: {
                                            S: createCardLinkInput.card.updatedAt
                                        },
                                        last4: {
                                            S: createCardLinkInput.card.last4
                                        },
                                        name: {
                                            S: createCardLinkInput.card.name
                                        },
                                        token: {
                                            S: createCardLinkInput.card.token
                                        },
                                        type: {
                                            S: createCardLinkInput.card.type
                                        }
                                    }
                                }
                            ]
                        }
                    },
                }));

                // return the card linking object
                return {
                    data: {
                        id: createCardLinkInput.id,
                        cards: [createCardLinkInput.card as Card]
                    }
                }
            } else {
                // if there are errors associated with the call, just return the error message and error type from the upstream client
                return cardLinkResponse;
            }
        }
    } catch (err) {
        const errorMessage = `Unexpected error while executing createCardLink mutation ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: CardLinkErrorType.UnexpectedError
        }
    }
}
