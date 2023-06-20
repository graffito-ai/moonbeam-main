"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCard = void 0;
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
/**
 * DeleteCard resolver
 *
 * @param deleteCardInput card link input object, used to delete/unlink a card object from an existing user/
 * card linked object.
 * @returns {@link Promise} of {@link CardResponse}
 */
const deleteCard = async (deleteCardInput) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        // initializing the DynamoDB document client
        const dynamoDbClient = new client_dynamodb_1.DynamoDBClient({ region: region });
        // update the timestamps accordingly
        deleteCardInput.updatedAt = deleteCardInput.updatedAt ? deleteCardInput.updatedAt : new Date().toISOString();
        // retrieve the card linking object, given the delete card input object
        const retrievedData = await dynamoDbClient.send(new client_dynamodb_1.GetItemCommand({
            TableName: process.env.CARD_LINKING_TABLE,
            Key: {
                id: {
                    S: deleteCardInput.id
                }
            }
        }));
        // if there is an item retrieved, then proceed with the deletion/unlinking process accordingly
        if (retrievedData && retrievedData.Item) {
            // check if there is a card with the requested ID, in the retrieved object, to be deleted/unlinked
            if (retrievedData.Item.cards.L.length !== 0 && retrievedData.Item.cards.L[0].M.id.S === deleteCardInput.cardId) {
                //
                // finally, update the card linked object, by removing the unlinked card from it
                await dynamoDbClient.send(new client_dynamodb_1.UpdateItemCommand({
                    TableName: process.env.CARD_LINKING_TABLE,
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
                            S: deleteCardInput.updatedAt
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
                        updatedAt: deleteCardInput.updatedAt
                    }
                };
            }
            else {
                const errorMessage = `Card object not found to be removed ${deleteCardInput.cardId}`;
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: moonbeam_models_1.CardLinkErrorType.NoneOrAbsent
                };
            }
        }
        else {
            const errorMessage = `Card Linked object not found to be removed ${deleteCardInput.id}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.CardLinkErrorType.NoneOrAbsent
            };
        }
    }
    catch (err) {
        const errorMessage = `Unexpected error while executing deleteCard mutation ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: moonbeam_models_1.CardLinkErrorType.UnexpectedError
        };
    }
};
exports.deleteCard = deleteCard;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVsZXRlQ2FyZFJlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9yZXNvbHZlcnMvRGVsZXRlQ2FyZFJlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtEQUEyRjtBQUMzRiw4REFBMkY7QUFFM0Y7Ozs7OztHQU1HO0FBQ0ksTUFBTSxVQUFVLEdBQUcsS0FBSyxFQUFFLGVBQWdDLEVBQXlCLEVBQUU7SUFDeEYsSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2Qyw0Q0FBNEM7UUFDNUMsTUFBTSxjQUFjLEdBQUcsSUFBSSxnQ0FBYyxDQUFDLEVBQUMsTUFBTSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7UUFFNUQsb0NBQW9DO1FBQ3BDLGVBQWUsQ0FBQyxTQUFTLEdBQUcsZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUU3Ryx1RUFBdUU7UUFDdkUsTUFBTSxhQUFhLEdBQUksTUFBTSxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksZ0NBQWMsQ0FBQztZQUNoRSxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBbUI7WUFDMUMsR0FBRyxFQUFFO2dCQUNELEVBQUUsRUFBRTtvQkFDQSxDQUFDLEVBQUUsZUFBZSxDQUFDLEVBQUU7aUJBQ3hCO2FBQ0o7U0FDSixDQUFDLENBQUMsQ0FBQztRQUVKLDhGQUE4RjtRQUM5RixJQUFJLGFBQWEsSUFBSSxhQUFhLENBQUMsSUFBSSxFQUFFO1lBQ3JDLGtHQUFrRztZQUNsRyxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsS0FBSyxlQUFlLENBQUMsTUFBTSxFQUFFO2dCQUNoSCxFQUFFO2dCQUVGLGdGQUFnRjtnQkFDaEYsTUFBTSxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksbUNBQWlCLENBQUM7b0JBQzVDLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFtQjtvQkFDMUMsR0FBRyxFQUFFO3dCQUNELEVBQUUsRUFBRTs0QkFDQSxDQUFDLEVBQUUsZUFBZSxDQUFDLEVBQUU7eUJBQ3hCO3FCQUNKO29CQUNELHdCQUF3QixFQUFFO3dCQUN0QixLQUFLLEVBQUUsT0FBTzt3QkFDZCxLQUFLLEVBQUUsV0FBVztxQkFDckI7b0JBQ0QseUJBQXlCLEVBQUU7d0JBQ3ZCLE9BQU8sRUFBRTs0QkFDTCxDQUFDLEVBQUUsRUFBRTt5QkFDUjt3QkFDRCxLQUFLLEVBQUU7NEJBQ0gsQ0FBQyxFQUFFLGVBQWUsQ0FBQyxTQUFVO3lCQUNoQztxQkFDSjtvQkFDRCxnQkFBZ0IsRUFBRSw0QkFBNEI7b0JBQzlDLFlBQVksRUFBRSxhQUFhO2lCQUM5QixDQUFDLENBQUMsQ0FBQztnQkFFSix1Q0FBdUM7Z0JBQ3ZDLE9BQU87b0JBQ0gsSUFBSSxFQUFFO3dCQUNGLEVBQUUsRUFBRSxlQUFlLENBQUMsRUFBRTt3QkFDdEIsTUFBTSxFQUFFLGVBQWUsQ0FBQyxNQUFNO3dCQUM5QixTQUFTLEVBQUUsZUFBZSxDQUFDLFNBQVU7cUJBQ3hDO2lCQUNKLENBQUE7YUFDSjtpQkFBTTtnQkFDSCxNQUFNLFlBQVksR0FBRyx1Q0FBdUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUNyRixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUUxQixPQUFPO29CQUNILFlBQVksRUFBRSxZQUFZO29CQUMxQixTQUFTLEVBQUUsbUNBQWlCLENBQUMsWUFBWTtpQkFDNUMsQ0FBQTthQUNKO1NBQ0o7YUFBTTtZQUNILE1BQU0sWUFBWSxHQUFHLDhDQUE4QyxlQUFlLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDeEYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUUxQixPQUFPO2dCQUNILFlBQVksRUFBRSxZQUFZO2dCQUMxQixTQUFTLEVBQUUsbUNBQWlCLENBQUMsWUFBWTthQUM1QyxDQUFBO1NBQ0o7S0FFSjtJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1YsTUFBTSxZQUFZLEdBQUcsd0RBQXdELEdBQUcsRUFBRSxDQUFDO1FBQ25GLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDMUIsT0FBTztZQUNILFlBQVksRUFBRSxZQUFZO1lBQzFCLFNBQVMsRUFBRSxtQ0FBaUIsQ0FBQyxlQUFlO1NBQy9DLENBQUE7S0FDSjtBQUNMLENBQUMsQ0FBQTtBQXRGWSxRQUFBLFVBQVUsY0FzRnRCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDYXJkTGlua0Vycm9yVHlwZSwgQ2FyZFJlc3BvbnNlLCBEZWxldGVDYXJkSW5wdXR9IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5pbXBvcnQge0R5bmFtb0RCQ2xpZW50LCBHZXRJdGVtQ29tbWFuZCwgVXBkYXRlSXRlbUNvbW1hbmR9IGZyb20gXCJAYXdzLXNkay9jbGllbnQtZHluYW1vZGJcIjtcblxuLyoqXG4gKiBEZWxldGVDYXJkIHJlc29sdmVyXG4gKlxuICogQHBhcmFtIGRlbGV0ZUNhcmRJbnB1dCBjYXJkIGxpbmsgaW5wdXQgb2JqZWN0LCB1c2VkIHRvIGRlbGV0ZS91bmxpbmsgYSBjYXJkIG9iamVjdCBmcm9tIGFuIGV4aXN0aW5nIHVzZXIvXG4gKiBjYXJkIGxpbmtlZCBvYmplY3QuXG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIENhcmRSZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IGRlbGV0ZUNhcmQgPSBhc3luYyAoZGVsZXRlQ2FyZElucHV0OiBEZWxldGVDYXJkSW5wdXQpOiBQcm9taXNlPENhcmRSZXNwb25zZT4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgIC8vIGluaXRpYWxpemluZyB0aGUgRHluYW1vREIgZG9jdW1lbnQgY2xpZW50XG4gICAgICAgIGNvbnN0IGR5bmFtb0RiQ2xpZW50ID0gbmV3IER5bmFtb0RCQ2xpZW50KHtyZWdpb246IHJlZ2lvbn0pO1xuXG4gICAgICAgIC8vIHVwZGF0ZSB0aGUgdGltZXN0YW1wcyBhY2NvcmRpbmdseVxuICAgICAgICBkZWxldGVDYXJkSW5wdXQudXBkYXRlZEF0ID0gZGVsZXRlQ2FyZElucHV0LnVwZGF0ZWRBdCA/IGRlbGV0ZUNhcmRJbnB1dC51cGRhdGVkQXQgOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG5cbiAgICAgICAgLy8gcmV0cmlldmUgdGhlIGNhcmQgbGlua2luZyBvYmplY3QsIGdpdmVuIHRoZSBkZWxldGUgY2FyZCBpbnB1dCBvYmplY3RcbiAgICAgICAgY29uc3QgcmV0cmlldmVkRGF0YSA9ICBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBHZXRJdGVtQ29tbWFuZCh7XG4gICAgICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52LkNBUkRfTElOS0lOR19UQUJMRSEsXG4gICAgICAgICAgICBLZXk6IHtcbiAgICAgICAgICAgICAgICBpZDoge1xuICAgICAgICAgICAgICAgICAgICBTOiBkZWxldGVDYXJkSW5wdXQuaWRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKTtcblxuICAgICAgICAvLyBpZiB0aGVyZSBpcyBhbiBpdGVtIHJldHJpZXZlZCwgdGhlbiBwcm9jZWVkIHdpdGggdGhlIGRlbGV0aW9uL3VubGlua2luZyBwcm9jZXNzIGFjY29yZGluZ2x5XG4gICAgICAgIGlmIChyZXRyaWV2ZWREYXRhICYmIHJldHJpZXZlZERhdGEuSXRlbSkge1xuICAgICAgICAgICAgLy8gY2hlY2sgaWYgdGhlcmUgaXMgYSBjYXJkIHdpdGggdGhlIHJlcXVlc3RlZCBJRCwgaW4gdGhlIHJldHJpZXZlZCBvYmplY3QsIHRvIGJlIGRlbGV0ZWQvdW5saW5rZWRcbiAgICAgICAgICAgIGlmIChyZXRyaWV2ZWREYXRhLkl0ZW0uY2FyZHMuTCEubGVuZ3RoICE9PSAwICYmIHJldHJpZXZlZERhdGEuSXRlbS5jYXJkcy5MIVswXS5NIS5pZC5TISA9PT0gZGVsZXRlQ2FyZElucHV0LmNhcmRJZCkge1xuICAgICAgICAgICAgICAgIC8vXG5cbiAgICAgICAgICAgICAgICAvLyBmaW5hbGx5LCB1cGRhdGUgdGhlIGNhcmQgbGlua2VkIG9iamVjdCwgYnkgcmVtb3ZpbmcgdGhlIHVubGlua2VkIGNhcmQgZnJvbSBpdFxuICAgICAgICAgICAgICAgIGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IFVwZGF0ZUl0ZW1Db21tYW5kKHtcbiAgICAgICAgICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5DQVJEX0xJTktJTkdfVEFCTEUhLFxuICAgICAgICAgICAgICAgICAgICBLZXk6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogZGVsZXRlQ2FyZElucHV0LmlkXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCIjQ0FcIjogXCJjYXJkc1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCIjVUFcIjogXCJ1cGRhdGVkQXRcIlxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBFeHByZXNzaW9uQXR0cmlidXRlVmFsdWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcIjpsaXN0XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBMOiBbXVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiOnVhXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBkZWxldGVDYXJkSW5wdXQudXBkYXRlZEF0IVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBVcGRhdGVFeHByZXNzaW9uOiBcIlNFVCAjQ0EgPSA6bGlzdCwgI1VBID0gOnVhXCIsXG4gICAgICAgICAgICAgICAgICAgIFJldHVyblZhbHVlczogXCJVUERBVEVEX05FV1wiXG4gICAgICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSB1cGRhdGVkIElEcyBhbmQgdGltZXN0YW1wXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGRlbGV0ZUNhcmRJbnB1dC5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRJZDogZGVsZXRlQ2FyZElucHV0LmNhcmRJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRBdDogZGVsZXRlQ2FyZElucHV0LnVwZGF0ZWRBdCFcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYENhcmQgb2JqZWN0IG5vdCBmb3VuZCB0byBiZSByZW1vdmVkICR7ZGVsZXRlQ2FyZElucHV0LmNhcmRJZH1gO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5Ob25lT3JBYnNlbnRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgQ2FyZCBMaW5rZWQgb2JqZWN0IG5vdCBmb3VuZCB0byBiZSByZW1vdmVkICR7ZGVsZXRlQ2FyZElucHV0LmlkfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuTm9uZU9yQWJzZW50XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgZGVsZXRlQ2FyZCBtdXRhdGlvbiAke2Vycn1gO1xuICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICB9XG4gICAgfVxufVxuIl19