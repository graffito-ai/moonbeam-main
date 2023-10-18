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
            if (retrievedData.Item.cards.L.length !== 0 && retrievedData.Item.cards.L[0].M.id.S === deleteCardInput.cardId) {
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
                                    L: []
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVsZXRlQ2FyZFJlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9yZXNvbHZlcnMvRGVsZXRlQ2FyZFJlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtEQU9tQztBQUNuQyw4REFBMkY7QUFFM0Y7Ozs7Ozs7R0FPRztBQUNJLE1BQU0sVUFBVSxHQUFHLEtBQUssRUFBRSxTQUFpQixFQUFFLGVBQWdDLEVBQXlCLEVBQUU7SUFDM0csSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2Qyw0Q0FBNEM7UUFDNUMsTUFBTSxjQUFjLEdBQUcsSUFBSSxnQ0FBYyxDQUFDLEVBQUMsTUFBTSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7UUFFNUQsb0NBQW9DO1FBQ3BDLGVBQWUsQ0FBQyxTQUFTLEdBQUcsZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUU3Ryx1RUFBdUU7UUFDdkUsTUFBTSxhQUFhLEdBQUksTUFBTSxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksZ0NBQWMsQ0FBQztZQUNoRSxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBbUI7WUFDMUMsR0FBRyxFQUFFO2dCQUNELEVBQUUsRUFBRTtvQkFDQSxDQUFDLEVBQUUsZUFBZSxDQUFDLEVBQUU7aUJBQ3hCO2FBQ0o7U0FDSixDQUFDLENBQUMsQ0FBQztRQUVKLDhGQUE4RjtRQUM5RixJQUFJLGFBQWEsSUFBSSxhQUFhLENBQUMsSUFBSSxFQUFFO1lBQ3JDLGtHQUFrRztZQUNsRyxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLGFBQWEs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LENBQUE7aUJBQ0o7YUFDSjtpQkFBTTtnQkFDSCxNQUFNLFlBQVksR0FBRyx1Q0FBdUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUNyRixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUUxQixPQUFPO29CQUNILFlBQVksRUFBRSxZQUFZO29CQUMxQixTQUFTLEVBQUUsbUNBQWlCLENBQUMsWUFBWTtpQkFDNUMsQ0FBQTthQUNKO1NBQ0o7YUFBTTtZQUNILE1BQU0sWUFBWSxHQUFHLDhDQUE4QyxlQUFlLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDeEYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUUxQixPQUFPO2dCQUNILFlBQVksRUFBRSxZQUFZO2dCQUMxQixTQUFTLEVBQUUsbUNBQWlCLENBQUMsWUFBWTthQUM1QyxDQUFBO1NBQ0o7S0FFSjtJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1YsTUFBTSxZQUFZLEdBQUcsb0NBQW9DLFNBQVMsYUFBYSxHQUFHLEVBQUUsQ0FBQztRQUNyRixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzFCLE9BQU87WUFDSCxZQUFZLEVBQUUsWUFBWTtZQUMxQixTQUFTLEVBQUUsbUNBQWlCLENBQUMsZUFBZTtTQUMvQyxDQUFBO0tBQ0o7QUFDTCxDQUFDLENBQUE7QUExSFksUUFBQSxVQUFVLGNBMEh0QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gICAgQ2FyZExpbmtFcnJvclR5cGUsIENhcmRMaW5raW5nU3RhdHVzLFxuICAgIENhcmRSZXNwb25zZSxcbiAgICBEZWxldGVDYXJkSW5wdXQsXG4gICAgTWVtYmVyUmVzcG9uc2UsXG4gICAgT2xpdmVDbGllbnQsXG4gICAgUmVtb3ZlQ2FyZFJlc3BvbnNlXG59IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5pbXBvcnQge0R5bmFtb0RCQ2xpZW50LCBHZXRJdGVtQ29tbWFuZCwgVXBkYXRlSXRlbUNvbW1hbmR9IGZyb20gXCJAYXdzLXNkay9jbGllbnQtZHluYW1vZGJcIjtcblxuLyoqXG4gKiBEZWxldGVDYXJkIHJlc29sdmVyXG4gKlxuICogQHBhcmFtIGZpZWxkTmFtZSBuYW1lIG9mIHRoZSByZXNvbHZlciBwYXRoIGZyb20gdGhlIEFwcFN5bmMgZXZlbnRcbiAqIEBwYXJhbSBkZWxldGVDYXJkSW5wdXQgZGVsZXRlIGNhcmQgaW5wdXQgb2JqZWN0LCB1c2VkIHRvIGRlbGV0ZS91bmxpbmsgYSBjYXJkIG9iamVjdCBmcm9tIGFuIGV4aXN0aW5nIHVzZXIvXG4gKiBjYXJkIGxpbmtlZCBvYmplY3QuXG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIENhcmRSZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IGRlbGV0ZUNhcmQgPSBhc3luYyAoZmllbGROYW1lOiBzdHJpbmcsIGRlbGV0ZUNhcmRJbnB1dDogRGVsZXRlQ2FyZElucHV0KTogUHJvbWlzZTxDYXJkUmVzcG9uc2U+ID0+IHtcbiAgICB0cnkge1xuICAgICAgICAvLyByZXRyaWV2aW5nIHRoZSBjdXJyZW50IGZ1bmN0aW9uIHJlZ2lvblxuICAgICAgICBjb25zdCByZWdpb24gPSBwcm9jZXNzLmVudi5BV1NfUkVHSU9OITtcblxuICAgICAgICAvLyBpbml0aWFsaXppbmcgdGhlIER5bmFtb0RCIGRvY3VtZW50IGNsaWVudFxuICAgICAgICBjb25zdCBkeW5hbW9EYkNsaWVudCA9IG5ldyBEeW5hbW9EQkNsaWVudCh7cmVnaW9uOiByZWdpb259KTtcblxuICAgICAgICAvLyB1cGRhdGUgdGhlIHRpbWVzdGFtcHMgYWNjb3JkaW5nbHlcbiAgICAgICAgZGVsZXRlQ2FyZElucHV0LnVwZGF0ZWRBdCA9IGRlbGV0ZUNhcmRJbnB1dC51cGRhdGVkQXQgPyBkZWxldGVDYXJkSW5wdXQudXBkYXRlZEF0IDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuXG4gICAgICAgIC8vIHJldHJpZXZlIHRoZSBjYXJkIGxpbmtpbmcgb2JqZWN0LCBnaXZlbiB0aGUgZGVsZXRlIGNhcmQgaW5wdXQgb2JqZWN0XG4gICAgICAgIGNvbnN0IHJldHJpZXZlZERhdGEgPSAgYXdhaXQgZHluYW1vRGJDbGllbnQuc2VuZChuZXcgR2V0SXRlbUNvbW1hbmQoe1xuICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5DQVJEX0xJTktJTkdfVEFCTEUhLFxuICAgICAgICAgICAgS2V5OiB7XG4gICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgUzogZGVsZXRlQ2FyZElucHV0LmlkXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG5cbiAgICAgICAgLy8gaWYgdGhlcmUgaXMgYW4gaXRlbSByZXRyaWV2ZWQsIHRoZW4gcHJvY2VlZCB3aXRoIHRoZSBkZWxldGlvbi91bmxpbmtpbmcgcHJvY2VzcyBhY2NvcmRpbmdseVxuICAgICAgICBpZiAocmV0cmlldmVkRGF0YSAmJiByZXRyaWV2ZWREYXRhLkl0ZW0pIHtcbiAgICAgICAgICAgIC8vIGNoZWNrIGlmIHRoZXJlIGlzIGEgY2FyZCB3aXRoIHRoZSByZXF1ZXN0ZWQgSUQsIGluIHRoZSByZXRyaWV2ZWQgb2JqZWN0LCB0byBiZSBkZWxldGVkL3VubGlua2VkXG4gICAgICAgICAgICBpZiAocmV0cmlldmVkRGF0YS5JdGVtLmNhcmRzLkwhLmxlbmd0aCAhPT0gMCAmJiByZXRyaWV2ZWREYXRhLkl0ZW0uY2FyZHMuTCFbMF0uTSEuaWQuUyEgPT09IGRlbGV0ZUNhcmRJbnB1dC5jYXJkSWQpIHtcbiAgICAgICAgICAgICAgICAvLyBpbml0aWFsaXplIHRoZSBPbGl2ZSBDbGllbnQgQVBJIGhlcmUsIGluIG9yZGVyIHRvIGNhbGwgdGhlIGFwcHJvcHJpYXRlIGVuZHBvaW50cyBmb3IgdGhpcyByZXNvbHZlclxuICAgICAgICAgICAgICAgIGNvbnN0IG9saXZlQ2xpZW50ID0gbmV3IE9saXZlQ2xpZW50KHByb2Nlc3MuZW52LkVOVl9OQU1FISwgcmVnaW9uKTtcblxuICAgICAgICAgICAgICAgIC8vIGZpcnN0IGV4ZWN1dGUgdGhlIG1lbWJlciB1cGRhdGUgY2FsbCwgdG8gZGVhY3RpdmF0ZSB0aGUgbWVtYmVyXG4gICAgICAgICAgICAgICAgY29uc3QgdXBkYXRlTWVtYmVyUmVzcG9uc2U6IE1lbWJlclJlc3BvbnNlID0gYXdhaXQgb2xpdmVDbGllbnQudXBkYXRlTWVtYmVyU3RhdHVzKGRlbGV0ZUNhcmRJbnB1dC5pZCwgZGVsZXRlQ2FyZElucHV0Lm1lbWJlcklkLCBmYWxzZSwgZGVsZXRlQ2FyZElucHV0LnVwZGF0ZWRBdCEpO1xuXG4gICAgICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSB1cGRhdGUgbWVtYmVyIHN0YXR1cyBjYWxsIHdhcyBleGVjdXRlZCBzdWNjZXNzZnVsbHlcbiAgICAgICAgICAgICAgICBpZiAodXBkYXRlTWVtYmVyUmVzcG9uc2UgJiYgIXVwZGF0ZU1lbWJlclJlc3BvbnNlLmVycm9yTWVzc2FnZSAmJiAhdXBkYXRlTWVtYmVyUmVzcG9uc2UuZXJyb3JUeXBlXG4gICAgICAgICAgICAgICAgICAgICYmIHVwZGF0ZU1lbWJlclJlc3BvbnNlLmRhdGEgJiYgdXBkYXRlTWVtYmVyUmVzcG9uc2UuZGF0YS5pc0FjdGl2ZSA9PT0gZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgJiYgdXBkYXRlTWVtYmVyUmVzcG9uc2UuZGF0YS5pZCA9PT0gZGVsZXRlQ2FyZElucHV0LmlkICYmIHVwZGF0ZU1lbWJlclJlc3BvbnNlLmRhdGEubWVtYmVySWQgPT09IGRlbGV0ZUNhcmRJbnB1dC5tZW1iZXJJZCkge1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIHRoZW4gZXhlY3V0ZSB0aGUgcmVtb3ZlIGNhcmQgY2FsbCwgdG8gcmVtb3ZlL2RlYWN0aXZhdGUgYSBjYXJkIHRvIHRoZSBtZW1iZXJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVtb3ZlQ2FyZFJlc3BvbnNlOiBSZW1vdmVDYXJkUmVzcG9uc2UgPSBhd2FpdCBvbGl2ZUNsaWVudC5yZW1vdmVDYXJkKGRlbGV0ZUNhcmRJbnB1dC5jYXJkSWQpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGUgcmVtb3ZlIGNhcmQgY2FsbCB3YXMgZXhlY3V0ZWQgc3VjY2Vzc2Z1bGx5XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZW1vdmVDYXJkUmVzcG9uc2UgJiYgIXJlbW92ZUNhcmRSZXNwb25zZS5lcnJvck1lc3NhZ2UgJiYgIXJlbW92ZUNhcmRSZXNwb25zZS5lcnJvclR5cGUgJiYgcmVtb3ZlQ2FyZFJlc3BvbnNlLmRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZpbmFsbHksIHVwZGF0ZSB0aGUgY2FyZCBsaW5rZWQgb2JqZWN0LCBieSByZW1vdmluZyB0aGUgdW5saW5rZWQgY2FyZCBmcm9tIGl0XG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBVcGRhdGVJdGVtQ29tbWFuZCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5DQVJEX0xJTktJTkdfVEFCTEUhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEtleToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogZGVsZXRlQ2FyZElucHV0LmlkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiNDQVwiOiBcImNhcmRzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiI1VBXCI6IFwidXBkYXRlZEF0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiI1NUXCI6IFwic3RhdHVzXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCI6bGlzdFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBMOiBbXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIjp1YVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBkZWxldGVDYXJkSW5wdXQudXBkYXRlZEF0IVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIjpzdFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBDYXJkTGlua2luZ1N0YXR1cy5Ob3RMaW5rZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgVXBkYXRlRXhwcmVzc2lvbjogXCJTRVQgI0NBID0gOmxpc3QsICNVQSA9IDp1YSwgI1NUID0gOnN0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmV0dXJuVmFsdWVzOiBcIlVQREFURURfTkVXXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBjYXJkIHJlc3BvbnNlIG9iamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBkZWxldGVDYXJkSW5wdXQuaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRJZDogZGVsZXRlQ2FyZElucHV0LmNhcmRJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlZEF0OiBkZWxldGVDYXJkSW5wdXQudXBkYXRlZEF0IVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBVbmV4cGVjdGVkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tIHRoZSByZW1vdmUgY2FyZCBjYWxsIWApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpZiB0aGVyZSBhcmUgZXJyb3JzIGFzc29jaWF0ZWQgd2l0aCB0aGUgcmVtb3ZlIGNhcmQgY2FsbCwganVzdCByZXR1cm4gdGhlIGVycm9yIG1lc3NhZ2UgYW5kIGVycm9yIHR5cGUgZnJvbSB0aGUgdXBzdHJlYW0gY2xpZW50XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogcmVtb3ZlQ2FyZFJlc3BvbnNlLmVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IHJlbW92ZUNhcmRSZXNwb25zZS5lcnJvclR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBVbmV4cGVjdGVkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tIHRoZSB1cGRhdGUgbWVtYmVyIHN0YXR1cyBjYWxsIWApO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIHRoZXJlIGFyZSBlcnJvcnMgYXNzb2NpYXRlZCB3aXRoIHRoZSB1cGRhdGUgbWVtYmVyIHN0YXR1cyBjYWxsLCBqdXN0IHJldHVybiB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgZXJyb3IgdHlwZSBmcm9tIHRoZSB1cHN0cmVhbSBjbGllbnRcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogdXBkYXRlTWVtYmVyUmVzcG9uc2UuZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiB1cGRhdGVNZW1iZXJSZXNwb25zZS5lcnJvclR5cGVcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYENhcmQgb2JqZWN0IG5vdCBmb3VuZCB0byBiZSByZW1vdmVkICR7ZGVsZXRlQ2FyZElucHV0LmNhcmRJZH1gO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5Ob25lT3JBYnNlbnRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgQ2FyZCBMaW5rZWQgb2JqZWN0IG5vdCBmb3VuZCB0byBiZSByZW1vdmVkICR7ZGVsZXRlQ2FyZElucHV0LmlkfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuTm9uZU9yQWJzZW50XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgJHtmaWVsZE5hbWV9IG11dGF0aW9uICR7ZXJyfWA7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=