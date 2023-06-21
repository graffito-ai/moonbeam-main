import {CardLinkErrorType, CardResponse, DeleteCardInput, OliveClient} from "@moonbeam/moonbeam-models";
import {DynamoDBClient, GetItemCommand, UpdateItemCommand} from "@aws-sdk/client-dynamodb";

/**
 * DeleteCard resolver
 *
 * @param deleteCardInput delete card input object, used to delete/unlink a card object from an existing user/
 * card linked object.
 * @returns {@link Promise} of {@link CardResponse}
 */
export const deleteCard = async (deleteCardInput: DeleteCardInput): Promise<CardResponse> => {
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
            if (retrievedData.Item.cards.L!.length !== 0 && retrievedData.Item.cards.L![0].M!.id.S! === deleteCardInput.cardId) {
                // call the Olive Client API here, in order to call the appropriate endpoints for this resolver
                const oliveClient = new OliveClient(process.env.ENV_NAME!, region, deleteCardInput.id);

                // first execute the member update call, to deactivate the member
                const updateMemberResponse = await oliveClient.updateMemberStatus(deleteCardInput.memberId, false, deleteCardInput.updatedAt!);

                // check to see if the update member status call was executed successfully
                if (updateMemberResponse && !updateMemberResponse.errorMessage && !updateMemberResponse.errorType
                    && updateMemberResponse.data && updateMemberResponse.data.isActive === false
                    && updateMemberResponse.data.id === deleteCardInput.id && updateMemberResponse.data.memberId === deleteCardInput.memberId) {

                    // then execute the remove card call, to remove/deactivate a card to the member
                    const removeCardResponse = await oliveClient.removeCard(deleteCardInput.cardId);

                    // check to see if the remove card call was executed successfully
                    if (removeCardResponse && !removeCardResponse.errorMessage && !removeCardResponse.errorType && removeCardResponse.data) {
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
                                "#UA": "updatedAt"
                            },
                            ExpressionAttributeValues: {
                                ":list": {
                                    L: []
                                },
                                ":ua": {
                                    S: deleteCardInput.updatedAt!
                                }
                            },
                            UpdateExpression: "SET #CA = :list, #UA = :ua",
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
            const errorMessage = `Card Linked object not found to be removed ${deleteCardInput.id}`;
            console.log(errorMessage);

            return {
                errorMessage: errorMessage,
                errorType: CardLinkErrorType.NoneOrAbsent
            }
        }

    } catch (err) {
        const errorMessage = `Unexpected error while executing deleteCard mutation ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: CardLinkErrorType.UnexpectedError
        }
    }
}
