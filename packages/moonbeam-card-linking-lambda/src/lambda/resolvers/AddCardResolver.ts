import {
    AddCardInput,
    Card,
    CardLink,
    CardLinkErrorType,
    CardLinkingStatus,
    CardLinkResponse,
    CardResponse, CardType,
    MemberResponse,
    OliveClient
} from "@moonbeam/moonbeam-models";
import {DynamoDBClient, GetItemCommand, UpdateItemCommand} from "@aws-sdk/client-dynamodb";
import {v4 as uuidv4} from 'uuid';

/**
 * AddCard resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param addCardInput add card input object, used to add/link a card object to an existing user/
 * card linked object.
 * @returns {@link Promise} of {@link CardResponse}
 */
export const addCard = async (fieldName: string, addCardInput: AddCardInput): Promise<CardLinkResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initializing the DynamoDB document client
        const dynamoDbClient = new DynamoDBClient({region: region});

        // update the timestamps accordingly
        addCardInput.updatedAt = addCardInput.updatedAt ? addCardInput.updatedAt : new Date().toISOString();

        // retrieve the card linking object, given the add card input object
        const retrievedData = await dynamoDbClient.send(new GetItemCommand({
            TableName: process.env.CARD_LINKING_TABLE!,
            Key: {
                id: {
                    S: addCardInput.id
                }
            },
            /**
             * we're not interested in getting all the data for this call, just the minimum for us to determine whether this is a duplicate or not
             *
             * @link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html
             * @link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ExpressionAttributeNames.html
             */
            ProjectionExpression: '#idf, #c',
            ExpressionAttributeNames: {
                '#idf': 'id',
                '#c': 'cards'
            }
        }));

        /**
         * if there is an item retrieved, and it contains threes cards in it, then we cannot add another card to it,
         * since our limit is three cards per customer
         */
        if (retrievedData && retrievedData.Item && retrievedData.Item.cards.L!.length === 3) {
            const errorMessage = `Maximum number of cards exceeded (3). Delete one before adding a new one!`;
            console.log(errorMessage);

            return {
                errorMessage: errorMessage,
                errorType: CardLinkErrorType.AlreadyExistent
            }
        } else {
            // generate a unique application identifier for the card, to be passed in to Olive as the "referenceAppId"
            addCardInput.card.applicationID = uuidv4();

            // initialize the Olive Client API here, in order to call the appropriate endpoints for this resolver
            const oliveClient = new OliveClient(process.env.ENV_NAME!, region);

            // first execute the member update call, to re-activate the member
            const updateMemberResponse: MemberResponse = await oliveClient.updateMemberStatus(addCardInput.id, addCardInput.memberId, true, addCardInput.updatedAt!);

            // check to see if the update member status call was executed successfully
            if (updateMemberResponse && !updateMemberResponse.errorMessage && !updateMemberResponse.errorType
                && updateMemberResponse.data && updateMemberResponse.data.isActive === true
                && updateMemberResponse.data.id === addCardInput.id && updateMemberResponse.data.memberId === addCardInput.memberId) {

                // check to see if there are any previously added cards that we need to append the newly added card to
                const updatedCardList: any[] = [];
                const responseCardList: Card[] = [];
                if (retrievedData && retrievedData.Item && retrievedData.Item.cards.L!.length > 0) {
                    for (const preExistingCard of retrievedData.Item.cards.L!) {
                        updatedCardList.push(preExistingCard);
                        responseCardList.push({
                            id: preExistingCard.M!.id.S!,
                            applicationID: preExistingCard.M!.applicationID.S!,
                            ...(preExistingCard.M!.additionalProgramID && preExistingCard.M!.additionalProgramID.S! && {
                                additionalProgramID: preExistingCard.M!.additionalProgramID.S!,
                            }),
                            last4: preExistingCard.M!.last4.S!,
                            name: preExistingCard.M!.name.S!,
                            token: preExistingCard.M!.token.S!,
                            type: preExistingCard.M!.type.S! as CardType,
                        })
                    }
                }

                // add the new card into the list of pre-existing cards, if and only if it does not have the same token
                const duplicateCard = responseCardList.filter(responseCard => responseCard.token === addCardInput.card.token);
                if (duplicateCard.length === 0) {
                    // then execute the add card call, to add a card to the member
                    const addCardResponse: CardLinkResponse = await oliveClient.addCard(addCardInput.id, addCardInput.memberId, addCardInput.updatedAt!, addCardInput.updatedAt!, addCardInput.card as Card);

                    // check to see if the add card call was executed successfully
                    if (addCardResponse && !addCardResponse.errorMessage && !addCardResponse.errorType && addCardResponse.data) {
                        // convert the incoming linked data into a CardLink object
                        const cardLinkedResponse = addCardResponse.data as CardLink;

                        responseCardList.push(cardLinkedResponse.cards[0]!);
                        updatedCardList.push({
                            M: {
                                id: {
                                    S: cardLinkedResponse.cards[0]!.id
                                },
                                applicationID: {
                                    S: cardLinkedResponse.cards[0]!.applicationID
                                },
                                ...(addCardInput.card.additionalProgramID && {
                                    additionalProgramID: {
                                        S: addCardInput.card.additionalProgramID!
                                    }
                                }),
                                last4: {
                                    S: addCardInput.card.last4
                                },
                                name: {
                                    S: addCardInput.card.name
                                },
                                token: {
                                    S: addCardInput.card.token
                                },
                                type: {
                                    S: addCardInput.card.type
                                }
                            }
                        });

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
                                "#UA": "updatedAt",
                                "#ST": "status"
                            },
                            ExpressionAttributeValues: {
                                ":list": {
                                    L: updatedCardList
                                },
                                ":ua": {
                                    S: addCardInput.updatedAt!
                                },
                                ":st": {
                                    S: cardLinkedResponse.status
                                }
                            },
                            UpdateExpression: "SET #CA = :list, #UA = :ua, #ST = :st",
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
                                cards: responseCardList,
                                status: cardLinkedResponse.status
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
                    // this card is already existent, there's no need to add it anywhere else, just return it in the list of cards available
                    return {
                        data: {
                            id: addCardInput.id,
                            memberId: addCardInput.memberId,
                            /**
                             * this is not the actual creation date, because we're not interested in returning the accurate one
                             * (since we don't modify it, and thus we don't retrieve it from the database), but rather the update date.
                             */
                            createdAt: addCardInput.updatedAt,
                            updatedAt: addCardInput.updatedAt,
                            cards: responseCardList,
                            status: CardLinkingStatus.Linked // we know that if we got here, there is at least one linked card in the object
                        }
                    }
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
        const errorMessage = `Unexpected error while executing ${fieldName} mutation ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: CardLinkErrorType.UnexpectedError
        }
    }
}
