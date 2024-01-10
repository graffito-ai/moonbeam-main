import {
    Card,
    CardLinkErrorType, CardLinkingStatus,
    CardResponse, CardType,
    DeleteCardInput,
    MemberResponse,
    OliveClient,
    RemoveCardResponse
} from "@moonbeam/moonbeam-models";
import {DynamoDBClient, GetItemCommand, UpdateItemCommand} from "@aws-sdk/client-dynamodb";

/**
 * DeleteCard resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param deleteCardInput delete card input object, used to delete/unlink a card object from an existing user/
 * card linked object.
 * @returns {@link Promise} of {@link CardResponse}
 */
export const deleteCard = async (fieldName: string, deleteCardInput: DeleteCardInput): Promise<CardResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initializing the DynamoDB document client
        const dynamoDbClient = new DynamoDBClient({region: region});

        // update the timestamps accordingly
        deleteCardInput.updatedAt = deleteCardInput.updatedAt ? deleteCardInput.updatedAt : new Date().toISOString();

        // retrieve the card linking object, given the delete card input object
        const retrievedData =  await dynamoDbClient.send(new GetItemCommand({
            TableName: process.env.CARD_LINKING_TABLE!,
            Key: {
                id: {
                    S: deleteCardInput.id
                }
            }
        }));

        // if there is an item retrieved, then proceed with the deletion/unlinking process accordingly
        if (retrievedData && retrievedData.Item) {
            // check if there is a card with the requested ID, in the retrieved object, to be deleted/unlinked
            if (retrievedData.Item.cards.L!.length !== 0) {
                const updatedCardList: any[] = [];
                const responseCardList: Card[] = [];
                if (retrievedData && retrievedData.Item && retrievedData.Item.cards.L!.length > 0) {
                    for (const preExistingCard of retrievedData.Item.cards.L!) {
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
                const matchedCard = responseCardList.filter(responseCard => responseCard.id === deleteCardInput.cardId);
                if (matchedCard.length !== 0) {
                    // initialize the Olive Client API here, in order to call the appropriate endpoints for this resolver
                    const oliveClient = new OliveClient(process.env.ENV_NAME!, region);

                    // first execute the member update call, to deactivate the member
                    const updateMemberResponse: MemberResponse = await oliveClient.updateMemberStatus(deleteCardInput.id, deleteCardInput.memberId, false, deleteCardInput.updatedAt!);

                    // check to see if the update member status call was executed successfully
                    if (updateMemberResponse && !updateMemberResponse.errorMessage && !updateMemberResponse.errorType
                        && updateMemberResponse.data && updateMemberResponse.data.isActive === false
                        && updateMemberResponse.data.id === deleteCardInput.id && updateMemberResponse.data.memberId === deleteCardInput.memberId) {
                        // then execute the remove card call, to remove/deactivate a card to the member
                        const removeCardResponse: RemoveCardResponse = await oliveClient.removeCard(deleteCardInput.cardId);

                        // check to see if the remove card call was executed successfully
                        if (removeCardResponse && !removeCardResponse.errorMessage && !removeCardResponse.errorType && removeCardResponse.data) {
                            // construct the list of cards to be updated, containing all pre-existing cards but the one that was removed
                            for (const preExistingCard of responseCardList) {
                                if (preExistingCard.id !== deleteCardInput.cardId) {
                                    updatedCardList.push({
                                        "M": {
                                            "id": {
                                                "S": preExistingCard.id
                                            },
                                            "applicationID": {
                                                "S": preExistingCard.applicationID
                                            },
                                            ...(preExistingCard.additionalProgramID && {
                                                "applicationID": {
                                                    "S": preExistingCard.additionalProgramID
                                                },
                                            }),
                                            "last4": {
                                                "S": preExistingCard.last4
                                            },
                                            "name": {
                                                "S": preExistingCard.name
                                            },
                                            "token": {
                                                "S": preExistingCard.token
                                            },
                                            "type": {
                                                "S": preExistingCard.type
                                            }
                                        }
                                    })
                                }
                            }
                            // finally, update the card linked object, by removing the unlinked card from it
                            await dynamoDbClient.send(new UpdateItemCommand({
                                TableName: process.env.CARD_LINKING_TABLE!,
                                Key: {
                                    id: {
                                        S: deleteCardInput.id
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
                                        S: deleteCardInput.updatedAt!
                                    },
                                    ":st": {
                                        S: CardLinkingStatus.NotLinked
                                    }
                                },
                                UpdateExpression: "SET #CA = :list, #UA = :ua, #ST = :st",
                                ReturnValues: "UPDATED_NEW"
                            }));

                            // return the card response object
                            return {
                                data: {
                                    id: deleteCardInput.id,
                                    cardId: deleteCardInput.cardId,
                                    updatedAt: deleteCardInput.updatedAt!
                                }
                            }
                        } else {
                            console.log(`Unexpected response structure returned from the remove card call!`);

                            // if there are errors associated with the remove card call, just return the error message and error type from the upstream client
                            return {
                                errorMessage: removeCardResponse.errorMessage,
                                errorType: removeCardResponse.errorType
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
                } else {
                    const errorMessage = `Card object not found to be removed ${deleteCardInput.cardId}`;
                    console.log(errorMessage);

                    return {
                        errorMessage: errorMessage,
                        errorType: CardLinkErrorType.NoneOrAbsent
                    }
                }
            } else {
                const errorMessage = `Card object not found to be removed ${deleteCardInput.cardId}`;
                console.log(errorMessage);

                return {
                    errorMessage: errorMessage,
                    errorType: CardLinkErrorType.NoneOrAbsent
                }
            }
        } else {
            const errorMessage = `Card Linked object not found to be removed ${deleteCardInput.id}`;
            console.log(errorMessage);

            return {
                errorMessage: errorMessage,
                errorType: CardLinkErrorType.NoneOrAbsent
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
