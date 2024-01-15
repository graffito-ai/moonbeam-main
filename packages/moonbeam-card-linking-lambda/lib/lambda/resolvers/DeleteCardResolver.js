"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCard = void 0;
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
/**
 * DeleteCard resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param deleteCardInput delete card input object, used to delete/unlink a card object from an existing user/
 * card linked object.
 * @returns {@link Promise} of {@link CardResponse}
 */
const deleteCard = async (fieldName, deleteCardInput) => {
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
            if (retrievedData.Item.cards.L.length !== 0) {
                const updatedCardList = [];
                const responseCardList = [];
                if (retrievedData && retrievedData.Item && retrievedData.Item.cards.L.length > 0) {
                    for (const preExistingCard of retrievedData.Item.cards.L) {
                        responseCardList.push({
                            id: preExistingCard.M.id.S,
                            applicationID: preExistingCard.M.applicationID.S,
                            ...(preExistingCard.M.additionalProgramID && preExistingCard.M.additionalProgramID.S && {
                                additionalProgramID: preExistingCard.M.additionalProgramID.S,
                            }),
                            last4: preExistingCard.M.last4.S,
                            name: preExistingCard.M.name.S,
                            token: preExistingCard.M.token.S,
                            type: preExistingCard.M.type.S,
                        });
                    }
                }
                const matchedCard = responseCardList.filter(responseCard => responseCard.id === deleteCardInput.cardId);
                if (matchedCard.length !== 0) {
                    // initialize the Olive Client API here, in order to call the appropriate endpoints for this resolver
                    const oliveClient = new moonbeam_models_1.OliveClient(process.env.ENV_NAME, region);
                    // first execute the remove card call, to remove/deactivate a card from the member
                    const removeCardResponse = await oliveClient.removeCard(deleteCardInput.cardId);
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
                                });
                            }
                        }
                        // check depending on how many cards we have left in the list of cards, whether we also need to deactivate the member or not
                        if (updatedCardList.length === 0) {
                            console.log(`Member ${deleteCardInput.memberId} for user ${deleteCardInput.id} needs to be deactivated!`);
                            // execute the member update call, to deactivate the member
                            const updateMemberResponse = await oliveClient.updateMemberStatus(deleteCardInput.id, deleteCardInput.memberId, false, deleteCardInput.updatedAt);
                            // check to see if the update member status call was executed successfully
                            if (updateMemberResponse && !updateMemberResponse.errorMessage && !updateMemberResponse.errorType
                                && updateMemberResponse.data && updateMemberResponse.data.isActive === false
                                && updateMemberResponse.data.id === deleteCardInput.id && updateMemberResponse.data.memberId === deleteCardInput.memberId) {
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
                                        "#UA": "updatedAt",
                                        "#ST": "status"
                                    },
                                    ExpressionAttributeValues: {
                                        ":list": {
                                            L: updatedCardList
                                        },
                                        ":ua": {
                                            S: deleteCardInput.updatedAt
                                        },
                                        ":st": {
                                            S: moonbeam_models_1.CardLinkingStatus.NotLinked
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
                                        updatedAt: deleteCardInput.updatedAt
                                    }
                                };
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
                            console.log(`Member ${deleteCardInput.memberId} for user ${deleteCardInput.id} does not need to be deactivated!`);
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
                                    "#UA": "updatedAt",
                                    "#ST": "status"
                                },
                                ExpressionAttributeValues: {
                                    ":list": {
                                        L: updatedCardList
                                    },
                                    ":ua": {
                                        S: deleteCardInput.updatedAt
                                    },
                                    ":st": {
                                        S: moonbeam_models_1.CardLinkingStatus.NotLinked
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
                                    updatedAt: deleteCardInput.updatedAt
                                }
                            };
                        }
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
                    const errorMessage = `Card object not found to be removed ${deleteCardInput.cardId}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: moonbeam_models_1.CardLinkErrorType.NoneOrAbsent
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
        const errorMessage = `Unexpected error while executing ${fieldName} mutation ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: moonbeam_models_1.CardLinkErrorType.UnexpectedError
        };
    }
};
exports.deleteCard = deleteCard;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVsZXRlQ2FyZFJlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9yZXNvbHZlcnMvRGVsZXRlQ2FyZFJlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtEQVFtQztBQUNuQyw4REFBMkY7QUFFM0Y7Ozs7Ozs7R0FPRztBQUNJLE1BQU0sVUFBVSxHQUFHLEtBQUssRUFBRSxTQUFpQixFQUFFLGVBQWdDLEVBQXlCLEVBQUU7SUFDM0csSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2Qyw0Q0FBNEM7UUFDNUMsTUFBTSxjQUFjLEdBQUcsSUFBSSxnQ0FBYyxDQUFDLEVBQUMsTUFBTSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7UUFFNUQsb0NBQW9DO1FBQ3BDLGVBQWUsQ0FBQyxTQUFTLEdBQUcsZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUU3Ryx1RUFBdUU7UUFDdkUsTUFBTSxhQUFhLEdBQUcsTUFBTSxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksZ0NBQWMsQ0FBQztZQUMvRCxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBbUI7WUFDMUMsR0FBRyxFQUFFO2dCQUNELEVBQUUsRUFBRTtvQkFDQSxDQUFDLEVBQUUsZUFBZSxDQUFDLEVBQUU7aUJBQ3hCO2FBQ0o7U0FDSixDQUFDLENBQUMsQ0FBQztRQUVKLDhGQUE4RjtRQUM5RixJQUFJLGFBQWEsSUFBSSxhQUFhLENBQUMsSUFBSSxFQUFFO1lBQ3JDLGtHQUFrRztZQUNsRyxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUMx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QUFpQixDQUFDLFlBQVk7aUJBQzVDLENBQUE7YUFDSjtTQUNKO2FBQU07WUFDSCxNQUFNLFlBQVksR0FBRyw4Q0FBOEMsZUFBZSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ3hGLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7WUFFMUIsT0FBTztnQkFDSCxZQUFZLEVBQUUsWUFBWTtnQkFDMUIsU0FBUyxFQUFFLG1DQUFpQixDQUFDLFlBQVk7YUFDNUMsQ0FBQTtTQUNKO0tBRUo7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNWLE1BQU0sWUFBWSxHQUFHLG9DQUFvQyxTQUFTLGFBQWEsR0FBRyxFQUFFLENBQUM7UUFDckYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMxQixPQUFPO1lBQ0gsWUFBWSxFQUFFLFlBQVk7WUFDMUIsU0FBUyxFQUFFLG1DQUFpQixDQUFDLGVBQWU7U0FDL0MsQ0FBQTtLQUNKO0FBQ0wsQ0FBQyxDQUFBO0FBbE9ZLFFBQUEsVUFBVSxjQWtPdEIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICAgIENhcmQsXG4gICAgQ2FyZExpbmtFcnJvclR5cGUsIENhcmRMaW5raW5nU3RhdHVzLFxuICAgIENhcmRSZXNwb25zZSwgQ2FyZFR5cGUsXG4gICAgRGVsZXRlQ2FyZElucHV0LFxuICAgIE1lbWJlclJlc3BvbnNlLFxuICAgIE9saXZlQ2xpZW50LFxuICAgIFJlbW92ZUNhcmRSZXNwb25zZVxufSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuaW1wb3J0IHtEeW5hbW9EQkNsaWVudCwgR2V0SXRlbUNvbW1hbmQsIFVwZGF0ZUl0ZW1Db21tYW5kfSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LWR5bmFtb2RiXCI7XG5cbi8qKlxuICogRGVsZXRlQ2FyZCByZXNvbHZlclxuICpcbiAqIEBwYXJhbSBmaWVsZE5hbWUgbmFtZSBvZiB0aGUgcmVzb2x2ZXIgcGF0aCBmcm9tIHRoZSBBcHBTeW5jIGV2ZW50XG4gKiBAcGFyYW0gZGVsZXRlQ2FyZElucHV0IGRlbGV0ZSBjYXJkIGlucHV0IG9iamVjdCwgdXNlZCB0byBkZWxldGUvdW5saW5rIGEgY2FyZCBvYmplY3QgZnJvbSBhbiBleGlzdGluZyB1c2VyL1xuICogY2FyZCBsaW5rZWQgb2JqZWN0LlxuICogQHJldHVybnMge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBDYXJkUmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCBkZWxldGVDYXJkID0gYXN5bmMgKGZpZWxkTmFtZTogc3RyaW5nLCBkZWxldGVDYXJkSW5wdXQ6IERlbGV0ZUNhcmRJbnB1dCk6IFByb21pc2U8Q2FyZFJlc3BvbnNlPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gcmV0cmlldmluZyB0aGUgY3VycmVudCBmdW5jdGlvbiByZWdpb25cbiAgICAgICAgY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiE7XG5cbiAgICAgICAgLy8gaW5pdGlhbGl6aW5nIHRoZSBEeW5hbW9EQiBkb2N1bWVudCBjbGllbnRcbiAgICAgICAgY29uc3QgZHluYW1vRGJDbGllbnQgPSBuZXcgRHluYW1vREJDbGllbnQoe3JlZ2lvbjogcmVnaW9ufSk7XG5cbiAgICAgICAgLy8gdXBkYXRlIHRoZSB0aW1lc3RhbXBzIGFjY29yZGluZ2x5XG4gICAgICAgIGRlbGV0ZUNhcmRJbnB1dC51cGRhdGVkQXQgPSBkZWxldGVDYXJkSW5wdXQudXBkYXRlZEF0ID8gZGVsZXRlQ2FyZElucHV0LnVwZGF0ZWRBdCA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcblxuICAgICAgICAvLyByZXRyaWV2ZSB0aGUgY2FyZCBsaW5raW5nIG9iamVjdCwgZ2l2ZW4gdGhlIGRlbGV0ZSBjYXJkIGlucHV0IG9iamVjdFxuICAgICAgICBjb25zdCByZXRyaWV2ZWREYXRhID0gYXdhaXQgZHluYW1vRGJDbGllbnQuc2VuZChuZXcgR2V0SXRlbUNvbW1hbmQoe1xuICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5DQVJEX0xJTktJTkdfVEFCTEUhLFxuICAgICAgICAgICAgS2V5OiB7XG4gICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgUzogZGVsZXRlQ2FyZElucHV0LmlkXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG5cbiAgICAgICAgLy8gaWYgdGhlcmUgaXMgYW4gaXRlbSByZXRyaWV2ZWQsIHRoZW4gcHJvY2VlZCB3aXRoIHRoZSBkZWxldGlvbi91bmxpbmtpbmcgcHJvY2VzcyBhY2NvcmRpbmdseVxuICAgICAgICBpZiAocmV0cmlldmVkRGF0YSAmJiByZXRyaWV2ZWREYXRhLkl0ZW0pIHtcbiAgICAgICAgICAgIC8vIGNoZWNrIGlmIHRoZXJlIGlzIGEgY2FyZCB3aXRoIHRoZSByZXF1ZXN0ZWQgSUQsIGluIHRoZSByZXRyaWV2ZWQgb2JqZWN0LCB0byBiZSBkZWxldGVkL3VubGlua2VkXG4gICAgICAgICAgICBpZiAocmV0cmlldmVkRGF0YS5JdGVtLmNhcmRzLkwhLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHVwZGF0ZWRDYXJkTGlzdDogYW55W10gPSBbXTtcbiAgICAgICAgICAgICAgICBjb25zdCByZXNwb25zZUNhcmRMaXN0OiBDYXJkW10gPSBbXTtcbiAgICAgICAgICAgICAgICBpZiAocmV0cmlldmVkRGF0YSAmJiByZXRyaWV2ZWREYXRhLkl0ZW0gJiYgcmV0cmlldmVkRGF0YS5JdGVtLmNhcmRzLkwhLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBwcmVFeGlzdGluZ0NhcmQgb2YgcmV0cmlldmVkRGF0YS5JdGVtLmNhcmRzLkwhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNwb25zZUNhcmRMaXN0LnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBwcmVFeGlzdGluZ0NhcmQuTSEuaWQuUyEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwbGljYXRpb25JRDogcHJlRXhpc3RpbmdDYXJkLk0hLmFwcGxpY2F0aW9uSUQuUyEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uKHByZUV4aXN0aW5nQ2FyZC5NIS5hZGRpdGlvbmFsUHJvZ3JhbUlEICYmIHByZUV4aXN0aW5nQ2FyZC5NIS5hZGRpdGlvbmFsUHJvZ3JhbUlELlMhICYmIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkaXRpb25hbFByb2dyYW1JRDogcHJlRXhpc3RpbmdDYXJkLk0hLmFkZGl0aW9uYWxQcm9ncmFtSUQuUyEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdDQ6IHByZUV4aXN0aW5nQ2FyZC5NIS5sYXN0NC5TISxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBwcmVFeGlzdGluZ0NhcmQuTSEubmFtZS5TISxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b2tlbjogcHJlRXhpc3RpbmdDYXJkLk0hLnRva2VuLlMhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IHByZUV4aXN0aW5nQ2FyZC5NIS50eXBlLlMhIGFzIENhcmRUeXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBtYXRjaGVkQ2FyZCA9IHJlc3BvbnNlQ2FyZExpc3QuZmlsdGVyKHJlc3BvbnNlQ2FyZCA9PiByZXNwb25zZUNhcmQuaWQgPT09IGRlbGV0ZUNhcmRJbnB1dC5jYXJkSWQpO1xuICAgICAgICAgICAgICAgIGlmIChtYXRjaGVkQ2FyZC5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gaW5pdGlhbGl6ZSB0aGUgT2xpdmUgQ2xpZW50IEFQSSBoZXJlLCBpbiBvcmRlciB0byBjYWxsIHRoZSBhcHByb3ByaWF0ZSBlbmRwb2ludHMgZm9yIHRoaXMgcmVzb2x2ZXJcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgb2xpdmVDbGllbnQgPSBuZXcgT2xpdmVDbGllbnQocHJvY2Vzcy5lbnYuRU5WX05BTUUhLCByZWdpb24pO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGZpcnN0IGV4ZWN1dGUgdGhlIHJlbW92ZSBjYXJkIGNhbGwsIHRvIHJlbW92ZS9kZWFjdGl2YXRlIGEgY2FyZCBmcm9tIHRoZSBtZW1iZXJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVtb3ZlQ2FyZFJlc3BvbnNlOiBSZW1vdmVDYXJkUmVzcG9uc2UgPSBhd2FpdCBvbGl2ZUNsaWVudC5yZW1vdmVDYXJkKGRlbGV0ZUNhcmRJbnB1dC5jYXJkSWQpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGUgcmVtb3ZlIGNhcmQgY2FsbCB3YXMgZXhlY3V0ZWQgc3VjY2Vzc2Z1bGx5XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZW1vdmVDYXJkUmVzcG9uc2UgJiYgIXJlbW92ZUNhcmRSZXNwb25zZS5lcnJvck1lc3NhZ2UgJiYgIXJlbW92ZUNhcmRSZXNwb25zZS5lcnJvclR5cGUgJiYgcmVtb3ZlQ2FyZFJlc3BvbnNlLmRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbnN0cnVjdCB0aGUgbGlzdCBvZiBjYXJkcyB0byBiZSB1cGRhdGVkLCBjb250YWluaW5nIGFsbCBwcmUtZXhpc3RpbmcgY2FyZHMgYnV0IHRoZSBvbmUgdGhhdCB3YXMgcmVtb3ZlZFxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBwcmVFeGlzdGluZ0NhcmQgb2YgcmVzcG9uc2VDYXJkTGlzdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwcmVFeGlzdGluZ0NhcmQuaWQgIT09IGRlbGV0ZUNhcmRJbnB1dC5jYXJkSWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlZENhcmRMaXN0LnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJNXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImlkXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJTXCI6IHByZUV4aXN0aW5nQ2FyZC5pZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJhcHBsaWNhdGlvbklEXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJTXCI6IHByZUV4aXN0aW5nQ2FyZC5hcHBsaWNhdGlvbklEXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi4ocHJlRXhpc3RpbmdDYXJkLmFkZGl0aW9uYWxQcm9ncmFtSUQgJiYge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImFwcGxpY2F0aW9uSURcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJTXCI6IHByZUV4aXN0aW5nQ2FyZC5hZGRpdGlvbmFsUHJvZ3JhbUlEXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJsYXN0NFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiU1wiOiBwcmVFeGlzdGluZ0NhcmQubGFzdDRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibmFtZVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiU1wiOiBwcmVFeGlzdGluZ0NhcmQubmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0b2tlblwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiU1wiOiBwcmVFeGlzdGluZ0NhcmQudG9rZW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiU1wiOiBwcmVFeGlzdGluZ0NhcmQudHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNoZWNrIGRlcGVuZGluZyBvbiBob3cgbWFueSBjYXJkcyB3ZSBoYXZlIGxlZnQgaW4gdGhlIGxpc3Qgb2YgY2FyZHMsIHdoZXRoZXIgd2UgYWxzbyBuZWVkIHRvIGRlYWN0aXZhdGUgdGhlIG1lbWJlciBvciBub3RcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh1cGRhdGVkQ2FyZExpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYE1lbWJlciAke2RlbGV0ZUNhcmRJbnB1dC5tZW1iZXJJZH0gZm9yIHVzZXIgJHtkZWxldGVDYXJkSW5wdXQuaWR9IG5lZWRzIHRvIGJlIGRlYWN0aXZhdGVkIWApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZXhlY3V0ZSB0aGUgbWVtYmVyIHVwZGF0ZSBjYWxsLCB0byBkZWFjdGl2YXRlIHRoZSBtZW1iZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1cGRhdGVNZW1iZXJSZXNwb25zZTogTWVtYmVyUmVzcG9uc2UgPSBhd2FpdCBvbGl2ZUNsaWVudC51cGRhdGVNZW1iZXJTdGF0dXMoZGVsZXRlQ2FyZElucHV0LmlkLCBkZWxldGVDYXJkSW5wdXQubWVtYmVySWQsIGZhbHNlLCBkZWxldGVDYXJkSW5wdXQudXBkYXRlZEF0ISk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIHVwZGF0ZSBtZW1iZXIgc3RhdHVzIGNhbGwgd2FzIGV4ZWN1dGVkIHN1Y2Nlc3NmdWxseVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh1cGRhdGVNZW1iZXJSZXNwb25zZSAmJiAhdXBkYXRlTWVtYmVyUmVzcG9uc2UuZXJyb3JNZXNzYWdlICYmICF1cGRhdGVNZW1iZXJSZXNwb25zZS5lcnJvclR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJiYgdXBkYXRlTWVtYmVyUmVzcG9uc2UuZGF0YSAmJiB1cGRhdGVNZW1iZXJSZXNwb25zZS5kYXRhLmlzQWN0aXZlID09PSBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAmJiB1cGRhdGVNZW1iZXJSZXNwb25zZS5kYXRhLmlkID09PSBkZWxldGVDYXJkSW5wdXQuaWQgJiYgdXBkYXRlTWVtYmVyUmVzcG9uc2UuZGF0YS5tZW1iZXJJZCA9PT0gZGVsZXRlQ2FyZElucHV0Lm1lbWJlcklkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZpbmFsbHksIHVwZGF0ZSB0aGUgY2FyZCBsaW5rZWQgb2JqZWN0LCBieSByZW1vdmluZyB0aGUgdW5saW5rZWQgY2FyZCBmcm9tIGl0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IFVwZGF0ZUl0ZW1Db21tYW5kKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuQ0FSRF9MSU5LSU5HX1RBQkxFISxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEtleToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGRlbGV0ZUNhcmRJbnB1dC5pZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBFeHByZXNzaW9uQXR0cmlidXRlTmFtZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiNDQVwiOiBcImNhcmRzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIjVUFcIjogXCJ1cGRhdGVkQXRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiNTVFwiOiBcInN0YXR1c1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiOmxpc3RcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBMOiB1cGRhdGVkQ2FyZExpc3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiOnVhXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogZGVsZXRlQ2FyZElucHV0LnVwZGF0ZWRBdCFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiOnN0XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogQ2FyZExpbmtpbmdTdGF0dXMuTm90TGlua2VkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFVwZGF0ZUV4cHJlc3Npb246IFwiU0VUICNDQSA9IDpsaXN0LCAjVUEgPSA6dWEsICNTVCA9IDpzdFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUmV0dXJuVmFsdWVzOiBcIlVQREFURURfTkVXXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgY2FyZCByZXNwb25zZSBvYmplY3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogZGVsZXRlQ2FyZElucHV0LmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRJZDogZGVsZXRlQ2FyZElucHV0LmNhcmRJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVkQXQ6IGRlbGV0ZUNhcmRJbnB1dC51cGRhdGVkQXQhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgVW5leHBlY3RlZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSB0aGUgdXBkYXRlIG1lbWJlciBzdGF0dXMgY2FsbCFgKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpZiB0aGVyZSBhcmUgZXJyb3JzIGFzc29jaWF0ZWQgd2l0aCB0aGUgdXBkYXRlIG1lbWJlciBzdGF0dXMgY2FsbCwganVzdCByZXR1cm4gdGhlIGVycm9yIG1lc3NhZ2UgYW5kIGVycm9yIHR5cGUgZnJvbSB0aGUgdXBzdHJlYW0gY2xpZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IHVwZGF0ZU1lbWJlclJlc3BvbnNlLmVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogdXBkYXRlTWVtYmVyUmVzcG9uc2UuZXJyb3JUeXBlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBNZW1iZXIgJHtkZWxldGVDYXJkSW5wdXQubWVtYmVySWR9IGZvciB1c2VyICR7ZGVsZXRlQ2FyZElucHV0LmlkfSBkb2VzIG5vdCBuZWVkIHRvIGJlIGRlYWN0aXZhdGVkIWApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZmluYWxseSwgdXBkYXRlIHRoZSBjYXJkIGxpbmtlZCBvYmplY3QsIGJ5IHJlbW92aW5nIHRoZSB1bmxpbmtlZCBjYXJkIGZyb20gaXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBVcGRhdGVJdGVtQ29tbWFuZCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuQ0FSRF9MSU5LSU5HX1RBQkxFISxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgS2V5OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGRlbGV0ZUNhcmRJbnB1dC5pZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBFeHByZXNzaW9uQXR0cmlidXRlTmFtZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiI0NBXCI6IFwiY2FyZHNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiI1VBXCI6IFwidXBkYXRlZEF0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiNTVFwiOiBcInN0YXR1c1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiOmxpc3RcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEw6IHVwZGF0ZWRDYXJkTGlzdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiOnVhXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBkZWxldGVDYXJkSW5wdXQudXBkYXRlZEF0IVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiOnN0XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBDYXJkTGlua2luZ1N0YXR1cy5Ob3RMaW5rZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVXBkYXRlRXhwcmVzc2lvbjogXCJTRVQgI0NBID0gOmxpc3QsICNVQSA9IDp1YSwgI1NUID0gOnN0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJldHVyblZhbHVlczogXCJVUERBVEVEX05FV1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBjYXJkIHJlc3BvbnNlIG9iamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBkZWxldGVDYXJkSW5wdXQuaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXJkSWQ6IGRlbGV0ZUNhcmRJbnB1dC5jYXJkSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVkQXQ6IGRlbGV0ZUNhcmRJbnB1dC51cGRhdGVkQXQhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgVW5leHBlY3RlZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSB0aGUgcmVtb3ZlIGNhcmQgY2FsbCFgKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWYgdGhlcmUgYXJlIGVycm9ycyBhc3NvY2lhdGVkIHdpdGggdGhlIHJlbW92ZSBjYXJkIGNhbGwsIGp1c3QgcmV0dXJuIHRoZSBlcnJvciBtZXNzYWdlIGFuZCBlcnJvciB0eXBlIGZyb20gdGhlIHVwc3RyZWFtIGNsaWVudFxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IHJlbW92ZUNhcmRSZXNwb25zZS5lcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiByZW1vdmVDYXJkUmVzcG9uc2UuZXJyb3JUeXBlXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgQ2FyZCBvYmplY3Qgbm90IGZvdW5kIHRvIGJlIHJlbW92ZWQgJHtkZWxldGVDYXJkSW5wdXQuY2FyZElkfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5Ob25lT3JBYnNlbnRcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYENhcmQgb2JqZWN0IG5vdCBmb3VuZCB0byBiZSByZW1vdmVkICR7ZGVsZXRlQ2FyZElucHV0LmNhcmRJZH1gO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5Ob25lT3JBYnNlbnRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgQ2FyZCBMaW5rZWQgb2JqZWN0IG5vdCBmb3VuZCB0byBiZSByZW1vdmVkICR7ZGVsZXRlQ2FyZElucHV0LmlkfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuTm9uZU9yQWJzZW50XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgJHtmaWVsZE5hbWV9IG11dGF0aW9uICR7ZXJyfWA7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=