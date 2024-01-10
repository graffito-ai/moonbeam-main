import {DynamoDBClient, GetItemCommand} from "@aws-sdk/client-dynamodb";
import {
    Card,
    CardLinkErrorType,
    CardLinkingStatus,
    CardLinkResponse,
    CardType,
    GetCardLinkInput
} from "@moonbeam/moonbeam-models";

/**
 * GetCardLink resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getCardLinkInput card link input used for the linking object to be retrieved
 * @returns {@link Promise} of {@link CardLinkResponse}
 */
export const getCardLink = async (fieldName: string, getCardLinkInput: GetCardLinkInput): Promise<CardLinkResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initializing the DynamoDB document client
        const dynamoDbClient = new DynamoDBClient({region: region});

        // retrieve the card linking object, given the card linking input object
        const retrievedData = await dynamoDbClient.send(new GetItemCommand({
            TableName: process.env.CARD_LINKING_TABLE!,
            Key: {
                id: {
                    S: getCardLinkInput.id
                }
            }
        }));

        // if there is an item retrieved, then return it accordingly
        if (retrievedData && retrievedData.Item) {
            // check to see if there are any cards in the list of cards for the card linked object, and populate the returned card array accordingly
            if (retrievedData.Item.cards.L!.length !== 0) {
                // go through the list of cards retrieved and populate it accordingly
                const cards: Card[] = [];
                for (const retrievedCardData of retrievedData.Item.cards.L!) {
                    // create the new card object from the retrieve card data object
                    const cardObject: Card = {
                        last4: retrievedCardData.M!.last4.S!,
                        name: retrievedCardData.M!.name.S!,
                        id: retrievedCardData.M!.id.S!,
                        applicationID: retrievedCardData.M!.applicationID.S!,
                        type: retrievedCardData.M!.type.S! as CardType,
                        token: retrievedCardData.M!.token.S!
                    }
                    cards.push(cardObject);
                }

                // return the retrieved card linking object
                return {
                    data: {
                        id: retrievedData.Item.id.S!,
                        memberId: retrievedData.Item.memberId.S!,
                        createdAt: retrievedData.Item.createdAt.S!,
                        updatedAt: retrievedData.Item.updatedAt.S!,
                        cards: cards,
                        status: retrievedData.Item.status.S! as CardLinkingStatus
                    }
                }
            } else {
                console.log(`No cards in the card linked object for user ${getCardLinkInput.id}`);

                // return the retrieved card linking object
                return {
                    data: {
                        id: retrievedData.Item.id.S!,
                        memberId: retrievedData.Item.memberId.S!,
                        createdAt: retrievedData.Item.createdAt.S!,
                        updatedAt: retrievedData.Item.updatedAt.S!,
                        cards: [],
                        status: retrievedData.Item.status.S! as CardLinkingStatus
                    }
                }
            }
        } else {
            const errorMessage = `Card Linked object not found for ${getCardLinkInput.id}`;
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
