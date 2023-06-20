import {DynamoDBClient, GetItemCommand} from "@aws-sdk/client-dynamodb";
import {CardLinkErrorType, CardLinkResponse, CardType, GetCardLinkInput} from "@moonbeam/moonbeam-models";

/**
 * GetCardLink resolver
 *
 * @param getCardLinkInput card link input used for the linking object to be retrieved
 * @returns {@link Promise} of {@link CardLinkResponse}
 */
export const getCardLink = async (getCardLinkInput: GetCardLinkInput): Promise<CardLinkResponse> => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION!;

        // initializing the DynamoDB document client
        const dynamoDbClient = new DynamoDBClient({region: region});

        // retrieve the card linking object, given the card linking input object
        const retrievedData =  await dynamoDbClient.send(new GetItemCommand({
            TableName: process.env.CARD_LINKING_TABLE!,
            Key: {
                id: {
                    S: getCardLinkInput.id
                }
            }
        }));

        // if there is an item retrieved, then return it accordingly
        if (retrievedData && retrievedData.Item) {
            // return the retrieved card linking object
            return {
                data: {
                    id: retrievedData.Item.id.S!,
                    memberId: retrievedData.Item.memberId.S!,
                    createdAt: retrievedData.Item.createdAt.S!,
                    updatedAt: retrievedData.Item.updatedAt.S!,
                    cards: [
                        {
                            last4: retrievedData.Item.cards.L![0].M!.last4.S!,
                            name: retrievedData.Item.cards.L![0].M!.name.S!,
                            id: retrievedData.Item.cards.L![0].M!.id.S!,
                            applicationID: retrievedData.Item.cards.L![0].M!.applicationID.S!,
                            type: retrievedData.Item.cards.L![0].M!.type.S! as CardType,
                            token: retrievedData.Item.cards.L![0].M!.token.S!
                        }
                    ]
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
        const errorMessage = `Unexpected error while executing getCardLink query ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: CardLinkErrorType.UnexpectedError
        };
    }
}
