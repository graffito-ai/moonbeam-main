import {DynamoDBClient, GetItemCommand, UpdateItemCommand} from "@aws-sdk/client-dynamodb";
import {CardLinkErrorType, EligibleLinkedUsersResponse, UpdateCardInput} from "@moonbeam/moonbeam-models";

/**
 * UpdateCard resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param updateCardInput card input used for updating a specific card's details
 * @returns {@link Promise} of {@link EligibleLinkedUsersResponse}
 */
export const updateCard = async (fieldName: string, updateCardInput: UpdateCardInput): Promise<EligibleLinkedUsersResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initializing the DynamoDB document client
        const dynamoDbClient = new DynamoDBClient({region: region});

        // update the timestamps accordingly
        updateCardInput.updatedAt = updateCardInput.updatedAt ? updateCardInput.updatedAt : new Date().toISOString();

        // retrieve the card linking object, given the update card input object
        const retrievedData = await dynamoDbClient.send(new GetItemCommand({
            TableName: process.env.CARD_LINKING_TABLE!,
            Key: {
                id: {
                    S: updateCardInput.id
                }
            }
        }));

        // if there is an item retrieved, then proceed to update it accordingly
        if (retrievedData && retrievedData.Item) {
            // check to see if there are any cards in the list of cards for the card linked object, and update the correct one, accordingly
            if (retrievedData.Item.cards.L!.length !== 0) {
                /**
                 * go through the list of cards retrieved and retrieve the matching one that we are updating.
                 * Keep track of all the cards in a list of cards that we will use for update purposes.
                 */
                let cardFoundToUpdate: boolean = false;
                const updatedCardList: any[] = [];
                for (const retrievedCardData of retrievedData.Item.cards.L!) {
                    if (retrievedCardData.M!.id.S! === updateCardInput.cardId) {
                        // make sure to update the card found flag accordingly
                        cardFoundToUpdate = true;

                        // update the updated card list details to use while updating the card
                        updatedCardList.push({
                            "M": {
                                "id": {
                                    "S": retrievedCardData.M!.id.S!
                                },
                                "applicationID": {
                                    "S": retrievedCardData.M!.applicationID.S!
                                },
                                ...(retrievedCardData.M!.additionalProgramID && retrievedCardData.M!.additionalProgramID.S! && {
                                    "applicationID": {
                                        "S": retrievedCardData.M!.additionalProgramID.S!
                                    },
                                }),
                                "last4": {
                                    "S": retrievedCardData.M!.last4.S!
                                },
                                "name": {
                                    "S": retrievedCardData.M!.name.S!
                                },
                                "token": {
                                    "S": retrievedCardData.M!.token.S!
                                },
                                "type": {
                                    "S": retrievedCardData.M!.type.S!
                                },
                                "expiration": {
                                    "S": updateCardInput.expirationDate
                                }
                            }
                        });
                    } else {
                        // update the updated card list details to use while updating the card
                        updatedCardList.push({
                            "M": {
                                "id": {
                                    "S": retrievedCardData.M!.id.S!
                                },
                                "applicationID": {
                                    "S": retrievedCardData.M!.applicationID.S!
                                },
                                ...(retrievedCardData.M!.additionalProgramID && retrievedCardData.M!.additionalProgramID.S! && {
                                    "applicationID": {
                                        "S": retrievedCardData.M!.additionalProgramID.S!
                                    },
                                }),
                                "last4": {
                                    "S": retrievedCardData.M!.last4.S!
                                },
                                "name": {
                                    "S": retrievedCardData.M!.name.S!
                                },
                                "token": {
                                    "S": retrievedCardData.M!.token.S!
                                },
                                "type": {
                                    "S": retrievedCardData.M!.type.S!
                                },
                                ...(retrievedCardData.M!.expiration && retrievedCardData.M!.expiration.S! && {
                                    "expiration": {
                                        "S": retrievedCardData.M!.expiration.S!
                                    },
                                }),
                            }
                        });
                    }
                }

                // if there was no matched card to update, then return an error accordingly
                if (!cardFoundToUpdate) {
                    const errorMessage = `No matched card ${updateCardInput.cardId} to update for user ${updateCardInput.id}`;
                    console.log(errorMessage);

                    return {
                        errorMessage: errorMessage,
                        errorType: CardLinkErrorType.NoneOrAbsent
                    }
                } else {
                    // finally, update the card object, by adding/removing appropriate details to/from it
                    await dynamoDbClient.send(new UpdateItemCommand({
                        TableName: process.env.CARD_LINKING_TABLE!,
                        Key: {
                            id: {
                                S: updateCardInput.id
                            }
                        },
                        ExpressionAttributeNames: {
                            "#CA": "cards",
                            "#UA": "updatedAt"
                        },
                        ExpressionAttributeValues: {
                            ":list": {
                                L: updatedCardList
                            },
                            ":ua": {
                                S: updateCardInput.updatedAt!
                            },
                        },
                        UpdateExpression: "SET #CA = :list, #UA = :ua",
                        ReturnValues: "UPDATED_NEW"
                    }));


                    // return the updated card details
                    return {
                        data: [{
                            id: updateCardInput.id,
                            memberId: updateCardInput.memberId,
                            cardIds: [updateCardInput.cardId]
                        }]
                    }
                }
            } else {
                const errorMessage = `No cards to update for user ${updateCardInput.id}`;
                console.log(errorMessage);

                return {
                    errorMessage: errorMessage,
                    errorType: CardLinkErrorType.NoneOrAbsent
                }
            }
        } else {
            const errorMessage = `No Card Linked object to update for ${updateCardInput.id}`;
            console.log(errorMessage);

            return {
                errorMessage: errorMessage,
                errorType: CardLinkErrorType.NoneOrAbsent
            }
        }

    } catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} query ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: CardLinkErrorType.UnexpectedError
        };
    }
}
