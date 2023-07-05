"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCard = void 0;
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
/**
 * DeleteCard resolver
 *
 * @param deleteCardInput delete card input object, used to delete/unlink a card object from an existing user/
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
                // call the Olive Client API here, in order to call the appropriate endpoints for this resolver
                const oliveClient = new moonbeam_models_1.OliveClient(process.env.ENV_NAME, region);
                // first execute the member update call, to deactivate the member
                const updateMemberResponse = await oliveClient.updateMemberStatus(deleteCardInput.id, deleteCardInput.memberId, false, deleteCardInput.updatedAt);
                // check to see if the update member status call was executed successfully
                if (updateMemberResponse && !updateMemberResponse.errorMessage && !updateMemberResponse.errorType
                    && updateMemberResponse.data && updateMemberResponse.data.isActive === false
                    && updateMemberResponse.data.id === deleteCardInput.id && updateMemberResponse.data.memberId === deleteCardInput.memberId) {
                    // then execute the remove card call, to remove/deactivate a card to the member
                    const removeCardResponse = await oliveClient.removeCard(deleteCardInput.cardId);
                    // check to see if the remove card call was executed successfully
                    if (removeCardResponse && !removeCardResponse.errorMessage && !removeCardResponse.errorType && removeCardResponse.data) {
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
                        // return the card response object
                        return {
                            data: {
                                id: deleteCardInput.id,
                                cardId: deleteCardInput.cardId,
                                updatedAt: deleteCardInput.updatedAt
                            }
                        };
                    }
                    else {
                        console.log(`Unexpected response structure returned from the remove card call!`);
                        // if there are errors associated with the remove card call, just return the error message and error type from the upstream client
                        return {
                            errorMessage: removeCardResponse.errorMessage,
                            errorType: removeCardResponse.errorType
                        };
                    }
                }
                else {
                    console.log(`Unexpected response structure returned from the update member status call!`);
                    // if there are errors associated with the update member status call, just return the error message and error type from the upstream client
                    return {
                        errorMessage: updateMemberResponse.errorMessage,
                        errorType: updateMemberResponse.errorType
                    };
                }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVsZXRlQ2FyZFJlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9yZXNvbHZlcnMvRGVsZXRlQ2FyZFJlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtEQU9tQztBQUNuQyw4REFBMkY7QUFFM0Y7Ozs7OztHQU1HO0FBQ0ksTUFBTSxVQUFVLEdBQUcsS0FBSyxFQUFFLGVBQWdDLEVBQXlCLEVBQUU7SUFDeEYsSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2Qyw0Q0FBNEM7UUFDNUMsTUFBTSxjQUFjLEdBQUcsSUFBSSxnQ0FBYyxDQUFDLEVBQUMsTUFBTSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7UUFFNUQsb0NBQW9DO1FBQ3BDLGVBQWUsQ0FBQyxTQUFTLEdBQUcsZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUU3Ryx1RUFBdUU7UUFDdkUsTUFBTSxhQUFhLEdBQUksTUFBTSxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksZ0NBQWMsQ0FBQztZQUNoRSxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBbUI7WUFDMUMsR0FBRyxFQUFFO2dCQUNELEVBQUUsRUFBRTtvQkFDQSxDQUFDLEVBQUUsZUFBZSxDQUFDLEVBQUU7aUJBQ3hCO2FBQ0o7U0FDSixDQUFDLENBQUMsQ0FBQztRQUVKLDhGQUE4RjtRQUM5RixJQUFJLGFBQWEsSUFBSSxhQUFhLENBQUMsSUFBSSxFQUFFO1lBQ3JDLGtHQUFrRztZQUNsRyxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLGFBQWEsQ0FBQyxJQUFJLENB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QUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUUxQixPQUFPO29CQUNILFlBQVksRUFBRSxZQUFZO29CQUMxQixTQUFTLEVBQUUsbUNBQWlCLENBQUMsWUFBWTtpQkFDNUMsQ0FBQTthQUNKO1NBQ0o7YUFBTTtZQUNILE1BQU0sWUFBWSxHQUFHLDhDQUE4QyxlQUFlLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDeEYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUUxQixPQUFPO2dCQUNILFlBQVksRUFBRSxZQUFZO2dCQUMxQixTQUFTLEVBQUUsbUNBQWlCLENBQUMsWUFBWTthQUM1QyxDQUFBO1NBQ0o7S0FFSjtJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1YsTUFBTSxZQUFZLEdBQUcsd0RBQXdELEdBQUcsRUFBRSxDQUFDO1FBQ25GLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDMUIsT0FBTztZQUNILFlBQVksRUFBRSxZQUFZO1lBQzFCLFNBQVMsRUFBRSxtQ0FBaUIsQ0FBQyxlQUFlO1NBQy9DLENBQUE7S0FDSjtBQUNMLENBQUMsQ0FBQTtBQXRIWSxRQUFBLFVBQVUsY0FzSHRCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgICBDYXJkTGlua0Vycm9yVHlwZSxcbiAgICBDYXJkUmVzcG9uc2UsXG4gICAgRGVsZXRlQ2FyZElucHV0LFxuICAgIE1lbWJlclJlc3BvbnNlLFxuICAgIE9saXZlQ2xpZW50LFxuICAgIFJlbW92ZUNhcmRSZXNwb25zZVxufSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuaW1wb3J0IHtEeW5hbW9EQkNsaWVudCwgR2V0SXRlbUNvbW1hbmQsIFVwZGF0ZUl0ZW1Db21tYW5kfSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LWR5bmFtb2RiXCI7XG5cbi8qKlxuICogRGVsZXRlQ2FyZCByZXNvbHZlclxuICpcbiAqIEBwYXJhbSBkZWxldGVDYXJkSW5wdXQgZGVsZXRlIGNhcmQgaW5wdXQgb2JqZWN0LCB1c2VkIHRvIGRlbGV0ZS91bmxpbmsgYSBjYXJkIG9iamVjdCBmcm9tIGFuIGV4aXN0aW5nIHVzZXIvXG4gKiBjYXJkIGxpbmtlZCBvYmplY3QuXG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIENhcmRSZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IGRlbGV0ZUNhcmQgPSBhc3luYyAoZGVsZXRlQ2FyZElucHV0OiBEZWxldGVDYXJkSW5wdXQpOiBQcm9taXNlPENhcmRSZXNwb25zZT4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgIC8vIGluaXRpYWxpemluZyB0aGUgRHluYW1vREIgZG9jdW1lbnQgY2xpZW50XG4gICAgICAgIGNvbnN0IGR5bmFtb0RiQ2xpZW50ID0gbmV3IER5bmFtb0RCQ2xpZW50KHtyZWdpb246IHJlZ2lvbn0pO1xuXG4gICAgICAgIC8vIHVwZGF0ZSB0aGUgdGltZXN0YW1wcyBhY2NvcmRpbmdseVxuICAgICAgICBkZWxldGVDYXJkSW5wdXQudXBkYXRlZEF0ID0gZGVsZXRlQ2FyZElucHV0LnVwZGF0ZWRBdCA/IGRlbGV0ZUNhcmRJbnB1dC51cGRhdGVkQXQgOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG5cbiAgICAgICAgLy8gcmV0cmlldmUgdGhlIGNhcmQgbGlua2luZyBvYmplY3QsIGdpdmVuIHRoZSBkZWxldGUgY2FyZCBpbnB1dCBvYmplY3RcbiAgICAgICAgY29uc3QgcmV0cmlldmVkRGF0YSA9ICBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBHZXRJdGVtQ29tbWFuZCh7XG4gICAgICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52LkNBUkRfTElOS0lOR19UQUJMRSEsXG4gICAgICAgICAgICBLZXk6IHtcbiAgICAgICAgICAgICAgICBpZDoge1xuICAgICAgICAgICAgICAgICAgICBTOiBkZWxldGVDYXJkSW5wdXQuaWRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKTtcblxuICAgICAgICAvLyBpZiB0aGVyZSBpcyBhbiBpdGVtIHJldHJpZXZlZCwgdGhlbiBwcm9jZWVkIHdpdGggdGhlIGRlbGV0aW9uL3VubGlua2luZyBwcm9jZXNzIGFjY29yZGluZ2x5XG4gICAgICAgIGlmIChyZXRyaWV2ZWREYXRhICYmIHJldHJpZXZlZERhdGEuSXRlbSkge1xuICAgICAgICAgICAgLy8gY2hlY2sgaWYgdGhlcmUgaXMgYSBjYXJkIHdpdGggdGhlIHJlcXVlc3RlZCBJRCwgaW4gdGhlIHJldHJpZXZlZCBvYmplY3QsIHRvIGJlIGRlbGV0ZWQvdW5saW5rZWRcbiAgICAgICAgICAgIGlmIChyZXRyaWV2ZWREYXRhLkl0ZW0uY2FyZHMuTCEubGVuZ3RoICE9PSAwICYmIHJldHJpZXZlZERhdGEuSXRlbS5jYXJkcy5MIVswXS5NIS5pZC5TISA9PT0gZGVsZXRlQ2FyZElucHV0LmNhcmRJZCkge1xuICAgICAgICAgICAgICAgIC8vIGNhbGwgdGhlIE9saXZlIENsaWVudCBBUEkgaGVyZSwgaW4gb3JkZXIgdG8gY2FsbCB0aGUgYXBwcm9wcmlhdGUgZW5kcG9pbnRzIGZvciB0aGlzIHJlc29sdmVyXG4gICAgICAgICAgICAgICAgY29uc3Qgb2xpdmVDbGllbnQgPSBuZXcgT2xpdmVDbGllbnQocHJvY2Vzcy5lbnYuRU5WX05BTUUhLCByZWdpb24pO1xuXG4gICAgICAgICAgICAgICAgLy8gZmlyc3QgZXhlY3V0ZSB0aGUgbWVtYmVyIHVwZGF0ZSBjYWxsLCB0byBkZWFjdGl2YXRlIHRoZSBtZW1iZXJcbiAgICAgICAgICAgICAgICBjb25zdCB1cGRhdGVNZW1iZXJSZXNwb25zZTogTWVtYmVyUmVzcG9uc2UgPSBhd2FpdCBvbGl2ZUNsaWVudC51cGRhdGVNZW1iZXJTdGF0dXMoZGVsZXRlQ2FyZElucHV0LmlkLCBkZWxldGVDYXJkSW5wdXQubWVtYmVySWQsIGZhbHNlLCBkZWxldGVDYXJkSW5wdXQudXBkYXRlZEF0ISk7XG5cbiAgICAgICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIHVwZGF0ZSBtZW1iZXIgc3RhdHVzIGNhbGwgd2FzIGV4ZWN1dGVkIHN1Y2Nlc3NmdWxseVxuICAgICAgICAgICAgICAgIGlmICh1cGRhdGVNZW1iZXJSZXNwb25zZSAmJiAhdXBkYXRlTWVtYmVyUmVzcG9uc2UuZXJyb3JNZXNzYWdlICYmICF1cGRhdGVNZW1iZXJSZXNwb25zZS5lcnJvclR5cGVcbiAgICAgICAgICAgICAgICAgICAgJiYgdXBkYXRlTWVtYmVyUmVzcG9uc2UuZGF0YSAmJiB1cGRhdGVNZW1iZXJSZXNwb25zZS5kYXRhLmlzQWN0aXZlID09PSBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAmJiB1cGRhdGVNZW1iZXJSZXNwb25zZS5kYXRhLmlkID09PSBkZWxldGVDYXJkSW5wdXQuaWQgJiYgdXBkYXRlTWVtYmVyUmVzcG9uc2UuZGF0YS5tZW1iZXJJZCA9PT0gZGVsZXRlQ2FyZElucHV0Lm1lbWJlcklkKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gdGhlbiBleGVjdXRlIHRoZSByZW1vdmUgY2FyZCBjYWxsLCB0byByZW1vdmUvZGVhY3RpdmF0ZSBhIGNhcmQgdG8gdGhlIG1lbWJlclxuICAgICAgICAgICAgICAgICAgICBjb25zdCByZW1vdmVDYXJkUmVzcG9uc2U6IFJlbW92ZUNhcmRSZXNwb25zZSA9IGF3YWl0IG9saXZlQ2xpZW50LnJlbW92ZUNhcmQoZGVsZXRlQ2FyZElucHV0LmNhcmRJZCk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSByZW1vdmUgY2FyZCBjYWxsIHdhcyBleGVjdXRlZCBzdWNjZXNzZnVsbHlcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlbW92ZUNhcmRSZXNwb25zZSAmJiAhcmVtb3ZlQ2FyZFJlc3BvbnNlLmVycm9yTWVzc2FnZSAmJiAhcmVtb3ZlQ2FyZFJlc3BvbnNlLmVycm9yVHlwZSAmJiByZW1vdmVDYXJkUmVzcG9uc2UuZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZmluYWxseSwgdXBkYXRlIHRoZSBjYXJkIGxpbmtlZCBvYmplY3QsIGJ5IHJlbW92aW5nIHRoZSB1bmxpbmtlZCBjYXJkIGZyb20gaXRcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IFVwZGF0ZUl0ZW1Db21tYW5kKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52LkNBUkRfTElOS0lOR19UQUJMRSEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgS2V5OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBkZWxldGVDYXJkSW5wdXQuaWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiI0NBXCI6IFwiY2FyZHNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIjVUFcIjogXCJ1cGRhdGVkQXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIjpsaXN0XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEw6IFtdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiOnVhXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGRlbGV0ZUNhcmRJbnB1dC51cGRhdGVkQXQhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFVwZGF0ZUV4cHJlc3Npb246IFwiU0VUICNDQSA9IDpsaXN0LCAjVUEgPSA6dWFcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZXR1cm5WYWx1ZXM6IFwiVVBEQVRFRF9ORVdcIlxuICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIGNhcmQgcmVzcG9uc2Ugb2JqZWN0XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGRlbGV0ZUNhcmRJbnB1dC5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FyZElkOiBkZWxldGVDYXJkSW5wdXQuY2FyZElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVkQXQ6IGRlbGV0ZUNhcmRJbnB1dC51cGRhdGVkQXQhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFVuZXhwZWN0ZWQgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gdGhlIHJlbW92ZSBjYXJkIGNhbGwhYCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIHRoZXJlIGFyZSBlcnJvcnMgYXNzb2NpYXRlZCB3aXRoIHRoZSByZW1vdmUgY2FyZCBjYWxsLCBqdXN0IHJldHVybiB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgZXJyb3IgdHlwZSBmcm9tIHRoZSB1cHN0cmVhbSBjbGllbnRcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiByZW1vdmVDYXJkUmVzcG9uc2UuZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogcmVtb3ZlQ2FyZFJlc3BvbnNlLmVycm9yVHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFVuZXhwZWN0ZWQgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gdGhlIHVwZGF0ZSBtZW1iZXIgc3RhdHVzIGNhbGwhYCk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgdGhlcmUgYXJlIGVycm9ycyBhc3NvY2lhdGVkIHdpdGggdGhlIHVwZGF0ZSBtZW1iZXIgc3RhdHVzIGNhbGwsIGp1c3QgcmV0dXJuIHRoZSBlcnJvciBtZXNzYWdlIGFuZCBlcnJvciB0eXBlIGZyb20gdGhlIHVwc3RyZWFtIGNsaWVudFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiB1cGRhdGVNZW1iZXJSZXNwb25zZS5lcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IHVwZGF0ZU1lbWJlclJlc3BvbnNlLmVycm9yVHlwZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgQ2FyZCBvYmplY3Qgbm90IGZvdW5kIHRvIGJlIHJlbW92ZWQgJHtkZWxldGVDYXJkSW5wdXQuY2FyZElkfWA7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLk5vbmVPckFic2VudFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBDYXJkIExpbmtlZCBvYmplY3Qgbm90IGZvdW5kIHRvIGJlIHJlbW92ZWQgJHtkZWxldGVDYXJkSW5wdXQuaWR9YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5Ob25lT3JBYnNlbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyBkZWxldGVDYXJkIG11dGF0aW9uICR7ZXJyfWA7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=