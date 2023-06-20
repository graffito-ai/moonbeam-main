import {AddCardInput, CardLinkErrorType, CardResponse} from "@moonbeam/moonbeam-models";
import {DynamoDBClient, GetItemCommand, UpdateItemCommand} from "@aws-sdk/client-dynamodb";

/**
 * AddCard resolver
 *
 * @param addCardInput add card input object, used to add/link a card object to an existing user/
 * card linked object.
 * @returns {@link Promise} of {@link CardResponse}
 */
export const addCard = async (addCardInput: AddCardInput): Promise<CardResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initializing the DynamoDB document client
        const dynamoDbClient = new DynamoDBClient({region: region});

        // update the timestamps accordingly
        addCardInput.updatedAt = addCardInput.updatedAt ? addCardInput.updatedAt : new Date().toISOString();

        // retrieve the card linking object, given the add card input object
        const retrievedData =  await dynamoDbClient.send(new GetItemCommand({
            TableName: process.env.CARD_LINKING_TABLE!,
            Key: {
                id: {
                    S: addCardInput.id
                }
            }
        }));

        /**
         * if there is an item retrieved, and it contains a card in it, then we cannot add another card to it,
         * since our limit is one card per customer
         */
        if (retrievedData && retrievedData.Item && retrievedData.Item.cards.L!.length !== 0) {
            const errorMessage = `Pre-existing card already existent. Delete it before adding a new one!`;
            console.log(errorMessage);

            return {
                errorMessage: errorMessage,
                errorType: CardLinkErrorType.AlreadyExistent
            }
        } else {
            // proceed with the new card addition



            // finally, update the card linked object, by adding/linking a new card to it
            await dynamoDbClient.send(new UpdateItemCommand({
                TableName: process.env.CARD_LINKING_TABLE!,
                Key: {
                    id: {
                        S: addCardInput.id
                    }
                },
                ExpressionAttributeNames: {
                    "#CA": "cards",
                    "#UA": "updatedAt"
                },
                ExpressionAttributeValues: {
                    ":list": {
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
                    },
                    ":ua": {
                        S: addCardInput.updatedAt!
                    }
                },
                UpdateExpression: "SET #CA = :list, #UA = :ua",
                ReturnValues: "UPDATED_NEW"
            }));

        }

    } catch (err) {
        const errorMessage = `Unexpected error while executing addCard mutation ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: CardLinkErrorType.UnexpectedError
        }
    }
}
