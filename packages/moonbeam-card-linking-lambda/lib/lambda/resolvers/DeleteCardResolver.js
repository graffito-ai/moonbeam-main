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
                const oliveClient = new moonbeam_models_1.OliveClient(process.env.ENV_NAME, region, deleteCardInput.id);
                // first execute the member update call, to deactivate the member
                const updateMemberResponse = await oliveClient.updateMemberStatus(deleteCardInput.memberId, false, deleteCardInput.updatedAt);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVsZXRlQ2FyZFJlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9yZXNvbHZlcnMvRGVsZXRlQ2FyZFJlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtEQUF3RztBQUN4Ryw4REFBMkY7QUFFM0Y7Ozs7OztHQU1HO0FBQ0ksTUFBTSxVQUFVLEdBQUcsS0FBSyxFQUFFLGVBQWdDLEVBQXlCLEVBQUU7SUFDeEYsSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2Qyw0Q0FBNEM7UUFDNUMsTUFBTSxjQUFjLEdBQUcsSUFBSSxnQ0FBYyxDQUFDLEVBQUMsTUFBTSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7UUFFNUQsb0NBQW9DO1FBQ3BDLGVBQWUsQ0FBQyxTQUFTLEdBQUcsZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUU3Ryx1RUFBdUU7UUFDdkUsTUFBTSxhQUFhLEdBQUksTUFBTSxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksZ0NBQWMsQ0FBQztZQUNoRSxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBbUI7WUFDMUMsR0FBRyxFQUFFO2dCQUNELEVBQUUsRUFBRTtvQkFDQSxDQUFDLEVBQUUsZUFBZSxDQUFDLEVBQUU7aUJBQ3hCO2FBQ0o7U0FDSixDQUFDLENBQUMsQ0FBQztRQUVKLDhGQUE4RjtRQUM5RixJQUFJLGFBQWEsSUFBSSxhQUFhLENBQUMsSUFBSSxFQUFFO1lBQ3JDLGtHQUFrRztZQUNsRyxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLGFBQWEsQ0FBQyxJQUFJLENB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LEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFFMUIsT0FBTztvQkFDSCxZQUFZLEVBQUUsWUFBWTtvQkFDMUIsU0FBUyxFQUFFLG1DQUFpQixDQUFDLFlBQVk7aUJBQzVDLENBQUE7YUFDSjtTQUNKO2FBQU07WUFDSCxNQUFNLFlBQVksR0FBRyw4Q0FBOEMsZUFBZSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ3hGLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7WUFFMUIsT0FBTztnQkFDSCxZQUFZLEVBQUUsWUFBWTtnQkFDMUIsU0FBUyxFQUFFLG1DQUFpQixDQUFDLFlBQVk7YUFDNUMsQ0FBQTtTQUNKO0tBRUo7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNWLE1BQU0sWUFBWSxHQUFHLHdEQUF3RCxHQUFHLEVBQUUsQ0FBQztRQUNuRixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzFCLE9BQU87WUFDSCxZQUFZLEVBQUUsWUFBWTtZQUMxQixTQUFTLEVBQUUsbUNBQWlCLENBQUMsZUFBZTtTQUMvQyxDQUFBO0tBQ0o7QUFDTCxDQUFDLENBQUE7QUF0SFksUUFBQSxVQUFVLGNBc0h0QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q2FyZExpbmtFcnJvclR5cGUsIENhcmRSZXNwb25zZSwgRGVsZXRlQ2FyZElucHV0LCBPbGl2ZUNsaWVudH0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcbmltcG9ydCB7RHluYW1vREJDbGllbnQsIEdldEl0ZW1Db21tYW5kLCBVcGRhdGVJdGVtQ29tbWFuZH0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1keW5hbW9kYlwiO1xuXG4vKipcbiAqIERlbGV0ZUNhcmQgcmVzb2x2ZXJcbiAqXG4gKiBAcGFyYW0gZGVsZXRlQ2FyZElucHV0IGRlbGV0ZSBjYXJkIGlucHV0IG9iamVjdCwgdXNlZCB0byBkZWxldGUvdW5saW5rIGEgY2FyZCBvYmplY3QgZnJvbSBhbiBleGlzdGluZyB1c2VyL1xuICogY2FyZCBsaW5rZWQgb2JqZWN0LlxuICogQHJldHVybnMge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBDYXJkUmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCBkZWxldGVDYXJkID0gYXN5bmMgKGRlbGV0ZUNhcmRJbnB1dDogRGVsZXRlQ2FyZElucHV0KTogUHJvbWlzZTxDYXJkUmVzcG9uc2U+ID0+IHtcbiAgICB0cnkge1xuICAgICAgICAvLyByZXRyaWV2aW5nIHRoZSBjdXJyZW50IGZ1bmN0aW9uIHJlZ2lvblxuICAgICAgICBjb25zdCByZWdpb24gPSBwcm9jZXNzLmVudi5BV1NfUkVHSU9OITtcblxuICAgICAgICAvLyBpbml0aWFsaXppbmcgdGhlIER5bmFtb0RCIGRvY3VtZW50IGNsaWVudFxuICAgICAgICBjb25zdCBkeW5hbW9EYkNsaWVudCA9IG5ldyBEeW5hbW9EQkNsaWVudCh7cmVnaW9uOiByZWdpb259KTtcblxuICAgICAgICAvLyB1cGRhdGUgdGhlIHRpbWVzdGFtcHMgYWNjb3JkaW5nbHlcbiAgICAgICAgZGVsZXRlQ2FyZElucHV0LnVwZGF0ZWRBdCA9IGRlbGV0ZUNhcmRJbnB1dC51cGRhdGVkQXQgPyBkZWxldGVDYXJkSW5wdXQudXBkYXRlZEF0IDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuXG4gICAgICAgIC8vIHJldHJpZXZlIHRoZSBjYXJkIGxpbmtpbmcgb2JqZWN0LCBnaXZlbiB0aGUgZGVsZXRlIGNhcmQgaW5wdXQgb2JqZWN0XG4gICAgICAgIGNvbnN0IHJldHJpZXZlZERhdGEgPSAgYXdhaXQgZHluYW1vRGJDbGllbnQuc2VuZChuZXcgR2V0SXRlbUNvbW1hbmQoe1xuICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5DQVJEX0xJTktJTkdfVEFCTEUhLFxuICAgICAgICAgICAgS2V5OiB7XG4gICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgUzogZGVsZXRlQ2FyZElucHV0LmlkXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG5cbiAgICAgICAgLy8gaWYgdGhlcmUgaXMgYW4gaXRlbSByZXRyaWV2ZWQsIHRoZW4gcHJvY2VlZCB3aXRoIHRoZSBkZWxldGlvbi91bmxpbmtpbmcgcHJvY2VzcyBhY2NvcmRpbmdseVxuICAgICAgICBpZiAocmV0cmlldmVkRGF0YSAmJiByZXRyaWV2ZWREYXRhLkl0ZW0pIHtcbiAgICAgICAgICAgIC8vIGNoZWNrIGlmIHRoZXJlIGlzIGEgY2FyZCB3aXRoIHRoZSByZXF1ZXN0ZWQgSUQsIGluIHRoZSByZXRyaWV2ZWQgb2JqZWN0LCB0byBiZSBkZWxldGVkL3VubGlua2VkXG4gICAgICAgICAgICBpZiAocmV0cmlldmVkRGF0YS5JdGVtLmNhcmRzLkwhLmxlbmd0aCAhPT0gMCAmJiByZXRyaWV2ZWREYXRhLkl0ZW0uY2FyZHMuTCFbMF0uTSEuaWQuUyEgPT09IGRlbGV0ZUNhcmRJbnB1dC5jYXJkSWQpIHtcbiAgICAgICAgICAgICAgICAvLyBjYWxsIHRoZSBPbGl2ZSBDbGllbnQgQVBJIGhlcmUsIGluIG9yZGVyIHRvIGNhbGwgdGhlIGFwcHJvcHJpYXRlIGVuZHBvaW50cyBmb3IgdGhpcyByZXNvbHZlclxuICAgICAgICAgICAgICAgIGNvbnN0IG9saXZlQ2xpZW50ID0gbmV3IE9saXZlQ2xpZW50KHByb2Nlc3MuZW52LkVOVl9OQU1FISwgcmVnaW9uLCBkZWxldGVDYXJkSW5wdXQuaWQpO1xuXG4gICAgICAgICAgICAgICAgLy8gZmlyc3QgZXhlY3V0ZSB0aGUgbWVtYmVyIHVwZGF0ZSBjYWxsLCB0byBkZWFjdGl2YXRlIHRoZSBtZW1iZXJcbiAgICAgICAgICAgICAgICBjb25zdCB1cGRhdGVNZW1iZXJSZXNwb25zZSA9IGF3YWl0IG9saXZlQ2xpZW50LnVwZGF0ZU1lbWJlclN0YXR1cyhkZWxldGVDYXJkSW5wdXQubWVtYmVySWQsIGZhbHNlLCBkZWxldGVDYXJkSW5wdXQudXBkYXRlZEF0ISk7XG5cbiAgICAgICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIHVwZGF0ZSBtZW1iZXIgc3RhdHVzIGNhbGwgd2FzIGV4ZWN1dGVkIHN1Y2Nlc3NmdWxseVxuICAgICAgICAgICAgICAgIGlmICh1cGRhdGVNZW1iZXJSZXNwb25zZSAmJiAhdXBkYXRlTWVtYmVyUmVzcG9uc2UuZXJyb3JNZXNzYWdlICYmICF1cGRhdGVNZW1iZXJSZXNwb25zZS5lcnJvclR5cGVcbiAgICAgICAgICAgICAgICAgICAgJiYgdXBkYXRlTWVtYmVyUmVzcG9uc2UuZGF0YSAmJiB1cGRhdGVNZW1iZXJSZXNwb25zZS5kYXRhLmlzQWN0aXZlID09PSBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAmJiB1cGRhdGVNZW1iZXJSZXNwb25zZS5kYXRhLmlkID09PSBkZWxldGVDYXJkSW5wdXQuaWQgJiYgdXBkYXRlTWVtYmVyUmVzcG9uc2UuZGF0YS5tZW1iZXJJZCA9PT0gZGVsZXRlQ2FyZElucHV0Lm1lbWJlcklkKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gdGhlbiBleGVjdXRlIHRoZSByZW1vdmUgY2FyZCBjYWxsLCB0byByZW1vdmUvZGVhY3RpdmF0ZSBhIGNhcmQgdG8gdGhlIG1lbWJlclxuICAgICAgICAgICAgICAgICAgICBjb25zdCByZW1vdmVDYXJkUmVzcG9uc2UgPSBhd2FpdCBvbGl2ZUNsaWVudC5yZW1vdmVDYXJkKGRlbGV0ZUNhcmRJbnB1dC5jYXJkSWQpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGUgcmVtb3ZlIGNhcmQgY2FsbCB3YXMgZXhlY3V0ZWQgc3VjY2Vzc2Z1bGx5XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZW1vdmVDYXJkUmVzcG9uc2UgJiYgIXJlbW92ZUNhcmRSZXNwb25zZS5lcnJvck1lc3NhZ2UgJiYgIXJlbW92ZUNhcmRSZXNwb25zZS5lcnJvclR5cGUgJiYgcmVtb3ZlQ2FyZFJlc3BvbnNlLmRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZpbmFsbHksIHVwZGF0ZSB0aGUgY2FyZCBsaW5rZWQgb2JqZWN0LCBieSByZW1vdmluZyB0aGUgdW5saW5rZWQgY2FyZCBmcm9tIGl0XG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBVcGRhdGVJdGVtQ29tbWFuZCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5DQVJEX0xJTktJTkdfVEFCTEUhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEtleToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogZGVsZXRlQ2FyZElucHV0LmlkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiNDQVwiOiBcImNhcmRzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiI1VBXCI6IFwidXBkYXRlZEF0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCI6bGlzdFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBMOiBbXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIjp1YVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBkZWxldGVDYXJkSW5wdXQudXBkYXRlZEF0IVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBVcGRhdGVFeHByZXNzaW9uOiBcIlNFVCAjQ0EgPSA6bGlzdCwgI1VBID0gOnVhXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmV0dXJuVmFsdWVzOiBcIlVQREFURURfTkVXXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBjYXJkIHJlc3BvbnNlIG9iamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBkZWxldGVDYXJkSW5wdXQuaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRJZDogZGVsZXRlQ2FyZElucHV0LmNhcmRJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlZEF0OiBkZWxldGVDYXJkSW5wdXQudXBkYXRlZEF0IVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBVbmV4cGVjdGVkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tIHRoZSByZW1vdmUgY2FyZCBjYWxsIWApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpZiB0aGVyZSBhcmUgZXJyb3JzIGFzc29jaWF0ZWQgd2l0aCB0aGUgcmVtb3ZlIGNhcmQgY2FsbCwganVzdCByZXR1cm4gdGhlIGVycm9yIG1lc3NhZ2UgYW5kIGVycm9yIHR5cGUgZnJvbSB0aGUgdXBzdHJlYW0gY2xpZW50XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogcmVtb3ZlQ2FyZFJlc3BvbnNlLmVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IHJlbW92ZUNhcmRSZXNwb25zZS5lcnJvclR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBVbmV4cGVjdGVkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tIHRoZSB1cGRhdGUgbWVtYmVyIHN0YXR1cyBjYWxsIWApO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIHRoZXJlIGFyZSBlcnJvcnMgYXNzb2NpYXRlZCB3aXRoIHRoZSB1cGRhdGUgbWVtYmVyIHN0YXR1cyBjYWxsLCBqdXN0IHJldHVybiB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgZXJyb3IgdHlwZSBmcm9tIHRoZSB1cHN0cmVhbSBjbGllbnRcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogdXBkYXRlTWVtYmVyUmVzcG9uc2UuZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiB1cGRhdGVNZW1iZXJSZXNwb25zZS5lcnJvclR5cGVcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYENhcmQgb2JqZWN0IG5vdCBmb3VuZCB0byBiZSByZW1vdmVkICR7ZGVsZXRlQ2FyZElucHV0LmNhcmRJZH1gO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5Ob25lT3JBYnNlbnRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgQ2FyZCBMaW5rZWQgb2JqZWN0IG5vdCBmb3VuZCB0byBiZSByZW1vdmVkICR7ZGVsZXRlQ2FyZElucHV0LmlkfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuTm9uZU9yQWJzZW50XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgZGVsZXRlQ2FyZCBtdXRhdGlvbiAke2Vycn1gO1xuICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICB9XG4gICAgfVxufVxuIl19