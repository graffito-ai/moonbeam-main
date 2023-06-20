import {CardLinkErrorType, CardResponse, DeleteCardInput} from "@moonbeam/moonbeam-models";
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
                //

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

                // return the updated IDs and timestamp
                return {
                    data: {
                        id: deleteCardInput.id,
                        cardId: deleteCardInput.cardId,
                        updatedAt: deleteCardInput.updatedAt!
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
