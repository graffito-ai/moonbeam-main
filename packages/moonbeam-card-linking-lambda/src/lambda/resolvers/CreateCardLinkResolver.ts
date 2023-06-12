import {DynamoDBClient, GetItemCommand, PutItemCommand} from "@aws-sdk/client-dynamodb";
import {
    Card, CardLink,
    CardLinkErrorType,
    CardLinkResponse,
    CardType,
    CreateCardLinkInput,
    OliveClient
} from "@moonbeam/moonbeam-models";
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

        // check if an invalid card type is passed in, then return an error accordingly
        if (createCardLinkInput.card.type === CardType.Invalid) {
            return {
                errorMessage: `Unsupported card scheme.`,
                errorType: CardLinkErrorType.InvalidCardScheme
            }
        }

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
            console.log(`No card link existent in DB for user ${createCardLinkInput.id}`);

            // generate a unique application identifier for the card, to be passed in to Olive as the "referenceAppId"
            createCardLinkInput.card.applicationID = uuidv4();

            // call the Olive Client API here, in order to call the appropriate endpoints for this resolver
            const oliveClient = new OliveClient(createCardLinkInput.card as Card, createCardLinkInput.id, process.env.ENV_NAME!, region);
            const response = await oliveClient.link();

            // check to see if the card linking call was executed successfully
            if (response && !response.errorMessage && !response.errorType && response.data) {
                // convert the incoming linked data into a CardLink object
                const cardLinkedResponse = response.data as CardLink;

                // store the card linking object
                await dynamoDbClient.send(new PutItemCommand({
                    TableName: process.env.CARD_LINKING_TABLE!,
                    Item: {
                        id: {
                            S: cardLinkedResponse.id
                        },
                        memberId: {
                            S: cardLinkedResponse.memberId
                        },
                        cards: {
                            L: [
                                {
                                    M: {
                                        id: {
                                            S: cardLinkedResponse.cards[0]!.id
                                        },
                                        applicationID: {
                                            S: cardLinkedResponse.cards[0]!.applicationID
                                        },
                                        ...(cardLinkedResponse.cards[0]!.additionalProgramID && {
                                            additionalProgramID: {
                                                S: cardLinkedResponse.cards[0]!.additionalProgramID!
                                            }
                                        }),
                                        createdAt: {
                                            S: cardLinkedResponse.cards[0]!.createdAt
                                        },
                                        updatedAt: {
                                            S: cardLinkedResponse.cards[0]!.updatedAt
                                        },
                                        last4: {
                                            S: cardLinkedResponse.cards[0]!.last4
                                        },
                                        name: {
                                            S: cardLinkedResponse.cards[0]!.name
                                        },
                                        token: {
                                            S: cardLinkedResponse.cards[0]!.token
                                        },
                                        type: {
                                            S: cardLinkedResponse.cards[0]!.type
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
                        id: cardLinkedResponse.id,
                        memberId: cardLinkedResponse.memberId,
                        cards: [cardLinkedResponse.cards[0]! as Card]
                    }
                }
            } else {
                // if there are errors associated with the call, just return the error message and error type from the upstream client
                return response;
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
