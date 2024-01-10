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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVsZXRlQ2FyZFJlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9yZXNvbHZlcnMvRGVsZXRlQ2FyZFJlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtEQVFtQztBQUNuQyw4REFBMkY7QUFFM0Y7Ozs7Ozs7R0FPRztBQUNJLE1BQU0sVUFBVSxHQUFHLEtBQUssRUFBRSxTQUFpQixFQUFFLGVBQWdDLEVBQXlCLEVBQUU7SUFDM0csSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2Qyw0Q0FBNEM7UUFDNUMsTUFBTSxjQUFjLEdBQUcsSUFBSSxnQ0FBYyxDQUFDLEVBQUMsTUFBTSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7UUFFNUQsb0NBQW9DO1FBQ3BDLGVBQWUsQ0FBQyxTQUFTLEdBQUcsZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUU3Ryx1RUFBdUU7UUFDdkUsTUFBTSxhQUFhLEdBQUksTUFBTSxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksZ0NBQWMsQ0FBQztZQUNoRSxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBbUI7WUFDMUMsR0FBRyxFQUFFO2dCQUNELEVBQUUsRUFBRTtvQkFDQSxDQUFDLEVBQUUsZUFBZSxDQUFDLEVBQUU7aUJBQ3hCO2FBQ0o7U0FDSixDQUFDLENBQUMsQ0FBQztRQUVKLDhGQUE4RjtRQUM5RixJQUFJLGFBQWEsSUFBSSxhQUFhLENBQUMsSUFBSSxFQUFFO1lBQ3JDLGtHQUFrRztZQUNsRyxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUMx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QUM1QyxDQUFBO2FBQ0o7U0FDSjthQUFNO1lBQ0gsTUFBTSxZQUFZLEdBQUcsOENBQThDLGVBQWUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUN4RixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRTFCLE9BQU87Z0JBQ0gsWUFBWSxFQUFFLFlBQVk7Z0JBQzFCLFNBQVMsRUFBRSxtQ0FBaUIsQ0FBQyxZQUFZO2FBQzVDLENBQUE7U0FDSjtLQUVKO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDVixNQUFNLFlBQVksR0FBRyxvQ0FBb0MsU0FBUyxhQUFhLEdBQUcsRUFBRSxDQUFDO1FBQ3JGLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDMUIsT0FBTztZQUNILFlBQVksRUFBRSxZQUFZO1lBQzFCLFNBQVMsRUFBRSxtQ0FBaUIsQ0FBQyxlQUFlO1NBQy9DLENBQUE7S0FDSjtBQUNMLENBQUMsQ0FBQTtBQXJMWSxRQUFBLFVBQVUsY0FxTHRCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgICBDYXJkLFxuICAgIENhcmRMaW5rRXJyb3JUeXBlLCBDYXJkTGlua2luZ1N0YXR1cyxcbiAgICBDYXJkUmVzcG9uc2UsXG4gICAgRGVsZXRlQ2FyZElucHV0LFxuICAgIE1lbWJlclJlc3BvbnNlLFxuICAgIE9saXZlQ2xpZW50LFxuICAgIFJlbW92ZUNhcmRSZXNwb25zZVxufSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuaW1wb3J0IHtEeW5hbW9EQkNsaWVudCwgR2V0SXRlbUNvbW1hbmQsIFVwZGF0ZUl0ZW1Db21tYW5kfSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LWR5bmFtb2RiXCI7XG5cbi8qKlxuICogRGVsZXRlQ2FyZCByZXNvbHZlclxuICpcbiAqIEBwYXJhbSBmaWVsZE5hbWUgbmFtZSBvZiB0aGUgcmVzb2x2ZXIgcGF0aCBmcm9tIHRoZSBBcHBTeW5jIGV2ZW50XG4gKiBAcGFyYW0gZGVsZXRlQ2FyZElucHV0IGRlbGV0ZSBjYXJkIGlucHV0IG9iamVjdCwgdXNlZCB0byBkZWxldGUvdW5saW5rIGEgY2FyZCBvYmplY3QgZnJvbSBhbiBleGlzdGluZyB1c2VyL1xuICogY2FyZCBsaW5rZWQgb2JqZWN0LlxuICogQHJldHVybnMge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBDYXJkUmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCBkZWxldGVDYXJkID0gYXN5bmMgKGZpZWxkTmFtZTogc3RyaW5nLCBkZWxldGVDYXJkSW5wdXQ6IERlbGV0ZUNhcmRJbnB1dCk6IFByb21pc2U8Q2FyZFJlc3BvbnNlPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gcmV0cmlldmluZyB0aGUgY3VycmVudCBmdW5jdGlvbiByZWdpb25cbiAgICAgICAgY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiE7XG5cbiAgICAgICAgLy8gaW5pdGlhbGl6aW5nIHRoZSBEeW5hbW9EQiBkb2N1bWVudCBjbGllbnRcbiAgICAgICAgY29uc3QgZHluYW1vRGJDbGllbnQgPSBuZXcgRHluYW1vREJDbGllbnQoe3JlZ2lvbjogcmVnaW9ufSk7XG5cbiAgICAgICAgLy8gdXBkYXRlIHRoZSB0aW1lc3RhbXBzIGFjY29yZGluZ2x5XG4gICAgICAgIGRlbGV0ZUNhcmRJbnB1dC51cGRhdGVkQXQgPSBkZWxldGVDYXJkSW5wdXQudXBkYXRlZEF0ID8gZGVsZXRlQ2FyZElucHV0LnVwZGF0ZWRBdCA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcblxuICAgICAgICAvLyByZXRyaWV2ZSB0aGUgY2FyZCBsaW5raW5nIG9iamVjdCwgZ2l2ZW4gdGhlIGRlbGV0ZSBjYXJkIGlucHV0IG9iamVjdFxuICAgICAgICBjb25zdCByZXRyaWV2ZWREYXRhID0gIGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IEdldEl0ZW1Db21tYW5kKHtcbiAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuQ0FSRF9MSU5LSU5HX1RBQkxFISxcbiAgICAgICAgICAgIEtleToge1xuICAgICAgICAgICAgICAgIGlkOiB7XG4gICAgICAgICAgICAgICAgICAgIFM6IGRlbGV0ZUNhcmRJbnB1dC5pZFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuXG4gICAgICAgIC8vIGlmIHRoZXJlIGlzIGFuIGl0ZW0gcmV0cmlldmVkLCB0aGVuIHByb2NlZWQgd2l0aCB0aGUgZGVsZXRpb24vdW5saW5raW5nIHByb2Nlc3MgYWNjb3JkaW5nbHlcbiAgICAgICAgaWYgKHJldHJpZXZlZERhdGEgJiYgcmV0cmlldmVkRGF0YS5JdGVtKSB7XG4gICAgICAgICAgICAvLyBjaGVjayBpZiB0aGVyZSBpcyBhIGNhcmQgd2l0aCB0aGUgcmVxdWVzdGVkIElELCBpbiB0aGUgcmV0cmlldmVkIG9iamVjdCwgdG8gYmUgZGVsZXRlZC91bmxpbmtlZFxuICAgICAgICAgICAgaWYgKHJldHJpZXZlZERhdGEuSXRlbS5jYXJkcy5MIS5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCB1cGRhdGVkQ2FyZExpc3Q6IGFueVtdID0gW107XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2VDYXJkTGlzdDogQ2FyZFtdID0gW107XG4gICAgICAgICAgICAgICAgaWYgKHJldHJpZXZlZERhdGEgJiYgcmV0cmlldmVkRGF0YS5JdGVtICYmIHJldHJpZXZlZERhdGEuSXRlbS5jYXJkcy5MIS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgcHJlRXhpc3RpbmdDYXJkIG9mIHJldHJpZXZlZERhdGEuSXRlbS5jYXJkcy5MISkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2VDYXJkTGlzdC5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogcHJlRXhpc3RpbmdDYXJkLk0hLmlkLlMhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcGxpY2F0aW9uSUQ6IHByZUV4aXN0aW5nQ2FyZC5NIS5hcHBsaWNhdGlvbklELlMhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLihwcmVFeGlzdGluZ0NhcmQuTSEuYWRkaXRpb25hbFByb2dyYW1JRCAmJiBwcmVFeGlzdGluZ0NhcmQuTSEuYWRkaXRpb25hbFByb2dyYW1JRC5TISAmJiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZGl0aW9uYWxQcm9ncmFtSUQ6IHByZUV4aXN0aW5nQ2FyZC5NIS5hZGRpdGlvbmFsUHJvZ3JhbUlELlMhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3Q0OiBwcmVFeGlzdGluZ0NhcmQuTSEubGFzdDQuUyEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogcHJlRXhpc3RpbmdDYXJkLk0hLm5hbWUuUyEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW46IHByZUV4aXN0aW5nQ2FyZC5NIS50b2tlbi5TISxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBwcmVFeGlzdGluZ0NhcmQuTSEudHlwZS5TISxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgbWF0Y2hlZENhcmQgPSByZXNwb25zZUNhcmRMaXN0LmZpbHRlcihyZXNwb25zZUNhcmQgPT4gcmVzcG9uc2VDYXJkLmlkID09PSBkZWxldGVDYXJkSW5wdXQuY2FyZElkKTtcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2hlZENhcmQubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGluaXRpYWxpemUgdGhlIE9saXZlIENsaWVudCBBUEkgaGVyZSwgaW4gb3JkZXIgdG8gY2FsbCB0aGUgYXBwcm9wcmlhdGUgZW5kcG9pbnRzIGZvciB0aGlzIHJlc29sdmVyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG9saXZlQ2xpZW50ID0gbmV3IE9saXZlQ2xpZW50KHByb2Nlc3MuZW52LkVOVl9OQU1FISwgcmVnaW9uKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBmaXJzdCBleGVjdXRlIHRoZSBtZW1iZXIgdXBkYXRlIGNhbGwsIHRvIGRlYWN0aXZhdGUgdGhlIG1lbWJlclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB1cGRhdGVNZW1iZXJSZXNwb25zZTogTWVtYmVyUmVzcG9uc2UgPSBhd2FpdCBvbGl2ZUNsaWVudC51cGRhdGVNZW1iZXJTdGF0dXMoZGVsZXRlQ2FyZElucHV0LmlkLCBkZWxldGVDYXJkSW5wdXQubWVtYmVySWQsIGZhbHNlLCBkZWxldGVDYXJkSW5wdXQudXBkYXRlZEF0ISk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSB1cGRhdGUgbWVtYmVyIHN0YXR1cyBjYWxsIHdhcyBleGVjdXRlZCBzdWNjZXNzZnVsbHlcbiAgICAgICAgICAgICAgICAgICAgaWYgKHVwZGF0ZU1lbWJlclJlc3BvbnNlICYmICF1cGRhdGVNZW1iZXJSZXNwb25zZS5lcnJvck1lc3NhZ2UgJiYgIXVwZGF0ZU1lbWJlclJlc3BvbnNlLmVycm9yVHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgJiYgdXBkYXRlTWVtYmVyUmVzcG9uc2UuZGF0YSAmJiB1cGRhdGVNZW1iZXJSZXNwb25zZS5kYXRhLmlzQWN0aXZlID09PSBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgJiYgdXBkYXRlTWVtYmVyUmVzcG9uc2UuZGF0YS5pZCA9PT0gZGVsZXRlQ2FyZElucHV0LmlkICYmIHVwZGF0ZU1lbWJlclJlc3BvbnNlLmRhdGEubWVtYmVySWQgPT09IGRlbGV0ZUNhcmRJbnB1dC5tZW1iZXJJZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhlbiBleGVjdXRlIHRoZSByZW1vdmUgY2FyZCBjYWxsLCB0byByZW1vdmUvZGVhY3RpdmF0ZSBhIGNhcmQgdG8gdGhlIG1lbWJlclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVtb3ZlQ2FyZFJlc3BvbnNlOiBSZW1vdmVDYXJkUmVzcG9uc2UgPSBhd2FpdCBvbGl2ZUNsaWVudC5yZW1vdmVDYXJkKGRlbGV0ZUNhcmRJbnB1dC5jYXJkSWQpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIHJlbW92ZSBjYXJkIGNhbGwgd2FzIGV4ZWN1dGVkIHN1Y2Nlc3NmdWxseVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlbW92ZUNhcmRSZXNwb25zZSAmJiAhcmVtb3ZlQ2FyZFJlc3BvbnNlLmVycm9yTWVzc2FnZSAmJiAhcmVtb3ZlQ2FyZFJlc3BvbnNlLmVycm9yVHlwZSAmJiByZW1vdmVDYXJkUmVzcG9uc2UuZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbnN0cnVjdCB0aGUgbGlzdCBvZiBjYXJkcyB0byBiZSB1cGRhdGVkLCBjb250YWluaW5nIGFsbCBwcmUtZXhpc3RpbmcgY2FyZHMgYnV0IHRoZSBvbmUgdGhhdCB3YXMgcmVtb3ZlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgcHJlRXhpc3RpbmdDYXJkIG9mIHJlc3BvbnNlQ2FyZExpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByZUV4aXN0aW5nQ2FyZC5pZCAhPT0gZGVsZXRlQ2FyZElucHV0LmNhcmRJZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlZENhcmRMaXN0LnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiTVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaWRcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJTXCI6IHByZUV4aXN0aW5nQ2FyZC5pZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImFwcGxpY2F0aW9uSURcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJTXCI6IHByZUV4aXN0aW5nQ2FyZC5hcHBsaWNhdGlvbklEXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLihwcmVFeGlzdGluZ0NhcmQuYWRkaXRpb25hbFByb2dyYW1JRCAmJiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImFwcGxpY2F0aW9uSURcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiU1wiOiBwcmVFeGlzdGluZ0NhcmQuYWRkaXRpb25hbFByb2dyYW1JRFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibGFzdDRcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJTXCI6IHByZUV4aXN0aW5nQ2FyZC5sYXN0NFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm5hbWVcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJTXCI6IHByZUV4aXN0aW5nQ2FyZC5uYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidG9rZW5cIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJTXCI6IHByZUV4aXN0aW5nQ2FyZC50b2tlblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJTXCI6IHByZUV4aXN0aW5nQ2FyZC50eXBlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZpbmFsbHksIHVwZGF0ZSB0aGUgY2FyZCBsaW5rZWQgb2JqZWN0LCBieSByZW1vdmluZyB0aGUgdW5saW5rZWQgY2FyZCBmcm9tIGl0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgZHluYW1vRGJDbGllbnQuc2VuZChuZXcgVXBkYXRlSXRlbUNvbW1hbmQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52LkNBUkRfTElOS0lOR19UQUJMRSEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEtleToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBkZWxldGVDYXJkSW5wdXQuaWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiNDQVwiOiBcImNhcmRzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiNVQVwiOiBcInVwZGF0ZWRBdFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIjU1RcIjogXCJzdGF0dXNcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBFeHByZXNzaW9uQXR0cmlidXRlVmFsdWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIjpsaXN0XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBMOiB1cGRhdGVkQ2FyZExpc3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIjp1YVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogZGVsZXRlQ2FyZElucHV0LnVwZGF0ZWRBdCFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIjpzdFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogQ2FyZExpbmtpbmdTdGF0dXMuTm90TGlua2VkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFVwZGF0ZUV4cHJlc3Npb246IFwiU0VUICNDQSA9IDpsaXN0LCAjVUEgPSA6dWEsICNTVCA9IDpzdFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZXR1cm5WYWx1ZXM6IFwiVVBEQVRFRF9ORVdcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgY2FyZCByZXNwb25zZSBvYmplY3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogZGVsZXRlQ2FyZElucHV0LmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FyZElkOiBkZWxldGVDYXJkSW5wdXQuY2FyZElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlZEF0OiBkZWxldGVDYXJkSW5wdXQudXBkYXRlZEF0IVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgVW5leHBlY3RlZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSB0aGUgcmVtb3ZlIGNhcmQgY2FsbCFgKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIHRoZXJlIGFyZSBlcnJvcnMgYXNzb2NpYXRlZCB3aXRoIHRoZSByZW1vdmUgY2FyZCBjYWxsLCBqdXN0IHJldHVybiB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgZXJyb3IgdHlwZSBmcm9tIHRoZSB1cHN0cmVhbSBjbGllbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IHJlbW92ZUNhcmRSZXNwb25zZS5lcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogcmVtb3ZlQ2FyZFJlc3BvbnNlLmVycm9yVHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBVbmV4cGVjdGVkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tIHRoZSB1cGRhdGUgbWVtYmVyIHN0YXR1cyBjYWxsIWApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpZiB0aGVyZSBhcmUgZXJyb3JzIGFzc29jaWF0ZWQgd2l0aCB0aGUgdXBkYXRlIG1lbWJlciBzdGF0dXMgY2FsbCwganVzdCByZXR1cm4gdGhlIGVycm9yIG1lc3NhZ2UgYW5kIGVycm9yIHR5cGUgZnJvbSB0aGUgdXBzdHJlYW0gY2xpZW50XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogdXBkYXRlTWVtYmVyUmVzcG9uc2UuZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogdXBkYXRlTWVtYmVyUmVzcG9uc2UuZXJyb3JUeXBlXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgQ2FyZCBvYmplY3Qgbm90IGZvdW5kIHRvIGJlIHJlbW92ZWQgJHtkZWxldGVDYXJkSW5wdXQuY2FyZElkfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5Ob25lT3JBYnNlbnRcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYENhcmQgb2JqZWN0IG5vdCBmb3VuZCB0byBiZSByZW1vdmVkICR7ZGVsZXRlQ2FyZElucHV0LmNhcmRJZH1gO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5Ob25lT3JBYnNlbnRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgQ2FyZCBMaW5rZWQgb2JqZWN0IG5vdCBmb3VuZCB0byBiZSByZW1vdmVkICR7ZGVsZXRlQ2FyZElucHV0LmlkfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuTm9uZU9yQWJzZW50XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgJHtmaWVsZE5hbWV9IG11dGF0aW9uICR7ZXJyfWA7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=