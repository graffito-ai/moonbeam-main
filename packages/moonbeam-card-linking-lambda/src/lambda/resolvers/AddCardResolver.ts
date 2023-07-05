import {
    AddCardInput,
    Card,
    CardLink,
    CardLinkErrorType,
    CardLinkResponse,
    CardResponse, MemberResponse,
    OliveClient
} from "@moonbeam/moonbeam-models";
import {DynamoDBClient, GetItemCommand, UpdateItemCommand} from "@aws-sdk/client-dynamodb";
import {v4 as uuidv4} from 'uuid';

/**
 * AddCard resolver
 *
 * @param addCardInput add card input object, used to add/link a card object to an existing user/
 * card linked object.
 * @returns {@link Promise} of {@link CardResponse}
 */
export const addCard = async (addCardInput: AddCardInput): Promise<CardLinkResponse> => {
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
            // generate a unique application identifier for the card, to be passed in to Olive as the "referenceAppId"
            addCardInput.card.applicationID = uuidv4();

            // call the Olive Client API here, in order to call the appropriate endpoints for this resolver
            const oliveClient = new OliveClient(process.env.ENV_NAME!, region);

            // first execute the member update call, to re-activate the member
            const updateMemberResponse: MemberResponse = await oliveClient.updateMemberStatus(addCardInput.id, addCardInput.memberId, true, addCardInput.updatedAt!);

            // check to see if the update member status call was executed successfully
            if (updateMemberResponse && !updateMemberResponse.errorMessage && !updateMemberResponse.errorType
                && updateMemberResponse.data && updateMemberResponse.data.isActive === true
                && updateMemberResponse.data.id === addCardInput.id && updateMemberResponse.data.memberId === addCardInput.memberId) {

                // then execute the add card call, to add a card to the member
                const addCardResponse: CardLinkResponse = await oliveClient.addCard(addCardInput.id, addCardInput.memberId, addCardInput.updatedAt!, addCardInput.updatedAt!, addCardInput.card as Card);

                // check to see if the add card call was executed successfully
                if (addCardResponse && !addCardResponse.errorMessage && !addCardResponse.errorType && addCardResponse.data) {
                    // convert the incoming linked data into a CardLink object
                    const cardLinkedResponse = addCardResponse.data as CardLink;

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

                    // return the card response object
                    return {
                        data: {
                            id: cardLinkedResponse.id,
                            memberId: cardLinkedResponse.memberId,
                            /**
                             * this is not the actual creation date, because we're not interested in returning the accurate one
                             * (since we don't modify it, and thus we don't retrieve it from the database), but rather the update date.
                             */
                            createdAt: cardLinkedResponse.createdAt,
                            updatedAt: cardLinkedResponse.updatedAt,
                            cards: [
                                cardLinkedResponse.cards[0]
                            ]
                        }
                    }

                } else {
                    console.log(`Unexpected response structure returned from the add card call!`);

                    // if there are errors associated with add card call, just return the error message and error type from the upstream client
                    return {
                        errorMessage: addCardResponse.errorMessage,
                        errorType: addCardResponse.errorType
                    };
                }
            } else {
                console.log(`Unexpected response structure returned from the update member status call!`);

                // if there are errors associated with the update member status call, just return the error message and error type from the upstream client
                return {
                    errorMessage: updateMemberResponse.errorMessage,
                    errorType: updateMemberResponse.errorType
                }
            }
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
