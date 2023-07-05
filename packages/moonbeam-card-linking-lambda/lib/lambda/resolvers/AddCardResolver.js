"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addCard = void 0;
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const uuid_1 = require("uuid");
/**
 * AddCard resolver
 *
 * @param addCardInput add card input object, used to add/link a card object to an existing user/
 * card linked object.
 * @returns {@link Promise} of {@link CardResponse}
 */
const addCard = async (addCardInput) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        // initializing the DynamoDB document client
        const dynamoDbClient = new client_dynamodb_1.DynamoDBClient({ region: region });
        // update the timestamps accordingly
        addCardInput.updatedAt = addCardInput.updatedAt ? addCardInput.updatedAt : new Date().toISOString();
        // retrieve the card linking object, given the add card input object
        const retrievedData = await dynamoDbClient.send(new client_dynamodb_1.GetItemCommand({
            TableName: process.env.CARD_LINKING_TABLE,
            Key: {
                id: {
                    S: addCardInput.id
                }
            }
        }));
        /**
         * if there is an item retrieved, and it contains a card in it, then we cannot add another card to it,
         * since our limit is one card per customer
         */
        if (retrievedData && retrievedData.Item && retrievedData.Item.cards.L.length !== 0) {
            const errorMessage = `Pre-existing card already existent. Delete it before adding a new one!`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.CardLinkErrorType.AlreadyExistent
            };
        }
        else {
            // generate a unique application identifier for the card, to be passed in to Olive as the "referenceAppId"
            addCardInput.card.applicationID = (0, uuid_1.v4)();
            // call the Olive Client API here, in order to call the appropriate endpoints for this resolver
            const oliveClient = new moonbeam_models_1.OliveClient(process.env.ENV_NAME, region);
            // first execute the member update call, to re-activate the member
            const updateMemberResponse = await oliveClient.updateMemberStatus(addCardInput.id, addCardInput.memberId, true, addCardInput.updatedAt);
            // check to see if the update member status call was executed successfully
            if (updateMemberResponse && !updateMemberResponse.errorMessage && !updateMemberResponse.errorType
                && updateMemberResponse.data && updateMemberResponse.data.isActive === true
                && updateMemberResponse.data.id === addCardInput.id && updateMemberResponse.data.memberId === addCardInput.memberId) {
                // then execute the add card call, to add a card to the member
                const addCardResponse = await oliveClient.addCard(addCardInput.id, addCardInput.memberId, addCardInput.updatedAt, addCardInput.updatedAt, addCardInput.card);
                // check to see if the add card call was executed successfully
                if (addCardResponse && !addCardResponse.errorMessage && !addCardResponse.errorType && addCardResponse.data) {
                    // convert the incoming linked data into a CardLink object
                    const cardLinkedResponse = addCardResponse.data;
                    // finally, update the card linked object, by adding/linking a new card to it
                    await dynamoDbClient.send(new client_dynamodb_1.UpdateItemCommand({
                        TableName: process.env.CARD_LINKING_TABLE,
                        Key: {
                            id: {
                                S: addCardInput.id
                            }
                        },
                        ExpressionAttributeNames: {
                            "#CA": "cards",
                            "#UA": "updatedAt"
                        },
                        ExpressionAttributeValues: {
                            ":list": {
                                L: [
                                    {
                                        M: {
                                            id: {
                                                S: cardLinkedResponse.cards[0].id
                                            },
                                            applicationID: {
                                                S: cardLinkedResponse.cards[0].applicationID
                                            },
                                            ...(cardLinkedResponse.cards[0].additionalProgramID && {
                                                additionalProgramID: {
                                                    S: cardLinkedResponse.cards[0].additionalProgramID
                                                }
                                            }),
                                            last4: {
                                                S: cardLinkedResponse.cards[0].last4
                                            },
                                            name: {
                                                S: cardLinkedResponse.cards[0].name
                                            },
                                            token: {
                                                S: cardLinkedResponse.cards[0].token
                                            },
                                            type: {
                                                S: cardLinkedResponse.cards[0].type
                                            }
                                        }
                                    }
                                ]
                            },
                            ":ua": {
                                S: addCardInput.updatedAt
                            }
                        },
                        UpdateExpression: "SET #CA = :list, #UA = :ua",
                        ReturnValues: "UPDATED_NEW"
                    }));
                    // return the card response object
                    return {
                        data: {
                            id: cardLinkedResponse.id,
                            memberId: cardLinkedResponse.memberId,
                            /**
                             * this is not the actual creation date, because we're not interested in returning the accurate one
                             * (since we don't modify it, and thus we don't retrieve it from the database), but rather the update date.
                             */
                            createdAt: cardLinkedResponse.createdAt,
                            updatedAt: cardLinkedResponse.updatedAt,
                            cards: [
                                cardLinkedResponse.cards[0]
                            ]
                        }
                    };
                }
                else {
                    console.log(`Unexpected response structure returned from the add card call!`);
                    // if there are errors associated with add card call, just return the error message and error type from the upstream client
                    return {
                        errorMessage: addCardResponse.errorMessage,
                        errorType: addCardResponse.errorType
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
    }
    catch (err) {
        const errorMessage = `Unexpected error while executing addCard mutation ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: moonbeam_models_1.CardLinkErrorType.UnexpectedError
        };
    }
};
exports.addCard = addCard;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRkQ2FyZFJlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9yZXNvbHZlcnMvQWRkQ2FyZFJlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtEQVFtQztBQUNuQyw4REFBMkY7QUFDM0YsK0JBQWtDO0FBRWxDOzs7Ozs7R0FNRztBQUNJLE1BQU0sT0FBTyxHQUFHLEtBQUssRUFBRSxZQUEwQixFQUE2QixFQUFFO0lBQ25GLElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsNENBQTRDO1FBQzVDLE1BQU0sY0FBYyxHQUFHLElBQUksZ0NBQWMsQ0FBQyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBRTVELG9DQUFvQztRQUNwQyxZQUFZLENBQUMsU0FBUyxHQUFHLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7UUFFcEcsb0VBQW9FO1FBQ3BFLE1BQU0sYUFBYSxHQUFJLE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLGdDQUFjLENBQUM7WUFDaEUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQW1CO1lBQzFDLEdBQUcsRUFBRTtnQkFDRCxFQUFFLEVBQUU7b0JBQ0EsQ0FBQyxFQUFFLFlBQVksQ0FBQyxFQUFFO2lCQUNyQjthQUNKO1NBQ0osQ0FBQyxDQUFDLENBQUM7UUFFSjs7O1dBR0c7UUFDSCxJQUFJLGFBQWEsSUFBSSxhQUFhLENBQUMsSUFBSSxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ2pGLE1BQU0sWUFBWSxHQUFHLHdFQUF3RSxDQUFDO1lB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U0FBUyxFQUFFLG9CQUFvQixDQUFDLFNBQVM7aUJBQzVDLENBQUE7YUFDSjtTQUNKO0tBRUo7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNWLE1BQU0sWUFBWSxHQUFHLHFEQUFxRCxHQUFHLEVBQUUsQ0FBQztRQUNoRixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzFCLE9BQU87WUFDSCxZQUFZLEVBQUUsWUFBWTtZQUMxQixTQUFTLEVBQUUsbUNBQWlCLENBQUMsZUFBZTtTQUMvQyxDQUFBO0tBQ0o7QUFDTCxDQUFDLENBQUE7QUF6SlksUUFBQSxPQUFPLFdBeUpuQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gICAgQWRkQ2FyZElucHV0LFxuICAgIENhcmQsXG4gICAgQ2FyZExpbmssXG4gICAgQ2FyZExpbmtFcnJvclR5cGUsXG4gICAgQ2FyZExpbmtSZXNwb25zZSxcbiAgICBDYXJkUmVzcG9uc2UsIE1lbWJlclJlc3BvbnNlLFxuICAgIE9saXZlQ2xpZW50XG59IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5pbXBvcnQge0R5bmFtb0RCQ2xpZW50LCBHZXRJdGVtQ29tbWFuZCwgVXBkYXRlSXRlbUNvbW1hbmR9IGZyb20gXCJAYXdzLXNkay9jbGllbnQtZHluYW1vZGJcIjtcbmltcG9ydCB7djQgYXMgdXVpZHY0fSBmcm9tICd1dWlkJztcblxuLyoqXG4gKiBBZGRDYXJkIHJlc29sdmVyXG4gKlxuICogQHBhcmFtIGFkZENhcmRJbnB1dCBhZGQgY2FyZCBpbnB1dCBvYmplY3QsIHVzZWQgdG8gYWRkL2xpbmsgYSBjYXJkIG9iamVjdCB0byBhbiBleGlzdGluZyB1c2VyL1xuICogY2FyZCBsaW5rZWQgb2JqZWN0LlxuICogQHJldHVybnMge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBDYXJkUmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCBhZGRDYXJkID0gYXN5bmMgKGFkZENhcmRJbnB1dDogQWRkQ2FyZElucHV0KTogUHJvbWlzZTxDYXJkTGlua1Jlc3BvbnNlPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gcmV0cmlldmluZyB0aGUgY3VycmVudCBmdW5jdGlvbiByZWdpb25cbiAgICAgICAgY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiE7XG5cbiAgICAgICAgLy8gaW5pdGlhbGl6aW5nIHRoZSBEeW5hbW9EQiBkb2N1bWVudCBjbGllbnRcbiAgICAgICAgY29uc3QgZHluYW1vRGJDbGllbnQgPSBuZXcgRHluYW1vREJDbGllbnQoe3JlZ2lvbjogcmVnaW9ufSk7XG5cbiAgICAgICAgLy8gdXBkYXRlIHRoZSB0aW1lc3RhbXBzIGFjY29yZGluZ2x5XG4gICAgICAgIGFkZENhcmRJbnB1dC51cGRhdGVkQXQgPSBhZGRDYXJkSW5wdXQudXBkYXRlZEF0ID8gYWRkQ2FyZElucHV0LnVwZGF0ZWRBdCA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcblxuICAgICAgICAvLyByZXRyaWV2ZSB0aGUgY2FyZCBsaW5raW5nIG9iamVjdCwgZ2l2ZW4gdGhlIGFkZCBjYXJkIGlucHV0IG9iamVjdFxuICAgICAgICBjb25zdCByZXRyaWV2ZWREYXRhID0gIGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IEdldEl0ZW1Db21tYW5kKHtcbiAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuQ0FSRF9MSU5LSU5HX1RBQkxFISxcbiAgICAgICAgICAgIEtleToge1xuICAgICAgICAgICAgICAgIGlkOiB7XG4gICAgICAgICAgICAgICAgICAgIFM6IGFkZENhcmRJbnB1dC5pZFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBpZiB0aGVyZSBpcyBhbiBpdGVtIHJldHJpZXZlZCwgYW5kIGl0IGNvbnRhaW5zIGEgY2FyZCBpbiBpdCwgdGhlbiB3ZSBjYW5ub3QgYWRkIGFub3RoZXIgY2FyZCB0byBpdCxcbiAgICAgICAgICogc2luY2Ugb3VyIGxpbWl0IGlzIG9uZSBjYXJkIHBlciBjdXN0b21lclxuICAgICAgICAgKi9cbiAgICAgICAgaWYgKHJldHJpZXZlZERhdGEgJiYgcmV0cmlldmVkRGF0YS5JdGVtICYmIHJldHJpZXZlZERhdGEuSXRlbS5jYXJkcy5MIS5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBQcmUtZXhpc3RpbmcgY2FyZCBhbHJlYWR5IGV4aXN0ZW50LiBEZWxldGUgaXQgYmVmb3JlIGFkZGluZyBhIG5ldyBvbmUhYDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5BbHJlYWR5RXhpc3RlbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGdlbmVyYXRlIGEgdW5pcXVlIGFwcGxpY2F0aW9uIGlkZW50aWZpZXIgZm9yIHRoZSBjYXJkLCB0byBiZSBwYXNzZWQgaW4gdG8gT2xpdmUgYXMgdGhlIFwicmVmZXJlbmNlQXBwSWRcIlxuICAgICAgICAgICAgYWRkQ2FyZElucHV0LmNhcmQuYXBwbGljYXRpb25JRCA9IHV1aWR2NCgpO1xuXG4gICAgICAgICAgICAvLyBjYWxsIHRoZSBPbGl2ZSBDbGllbnQgQVBJIGhlcmUsIGluIG9yZGVyIHRvIGNhbGwgdGhlIGFwcHJvcHJpYXRlIGVuZHBvaW50cyBmb3IgdGhpcyByZXNvbHZlclxuICAgICAgICAgICAgY29uc3Qgb2xpdmVDbGllbnQgPSBuZXcgT2xpdmVDbGllbnQocHJvY2Vzcy5lbnYuRU5WX05BTUUhLCByZWdpb24pO1xuXG4gICAgICAgICAgICAvLyBmaXJzdCBleGVjdXRlIHRoZSBtZW1iZXIgdXBkYXRlIGNhbGwsIHRvIHJlLWFjdGl2YXRlIHRoZSBtZW1iZXJcbiAgICAgICAgICAgIGNvbnN0IHVwZGF0ZU1lbWJlclJlc3BvbnNlOiBNZW1iZXJSZXNwb25zZSA9IGF3YWl0IG9saXZlQ2xpZW50LnVwZGF0ZU1lbWJlclN0YXR1cyhhZGRDYXJkSW5wdXQuaWQsIGFkZENhcmRJbnB1dC5tZW1iZXJJZCwgdHJ1ZSwgYWRkQ2FyZElucHV0LnVwZGF0ZWRBdCEpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIHVwZGF0ZSBtZW1iZXIgc3RhdHVzIGNhbGwgd2FzIGV4ZWN1dGVkIHN1Y2Nlc3NmdWxseVxuICAgICAgICAgICAgaWYgKHVwZGF0ZU1lbWJlclJlc3BvbnNlICYmICF1cGRhdGVNZW1iZXJSZXNwb25zZS5lcnJvck1lc3NhZ2UgJiYgIXVwZGF0ZU1lbWJlclJlc3BvbnNlLmVycm9yVHlwZVxuICAgICAgICAgICAgICAgICYmIHVwZGF0ZU1lbWJlclJlc3BvbnNlLmRhdGEgJiYgdXBkYXRlTWVtYmVyUmVzcG9uc2UuZGF0YS5pc0FjdGl2ZSA9PT0gdHJ1ZVxuICAgICAgICAgICAgICAgICYmIHVwZGF0ZU1lbWJlclJlc3BvbnNlLmRhdGEuaWQgPT09IGFkZENhcmRJbnB1dC5pZCAmJiB1cGRhdGVNZW1iZXJSZXNwb25zZS5kYXRhLm1lbWJlcklkID09PSBhZGRDYXJkSW5wdXQubWVtYmVySWQpIHtcblxuICAgICAgICAgICAgICAgIC8vIHRoZW4gZXhlY3V0ZSB0aGUgYWRkIGNhcmQgY2FsbCwgdG8gYWRkIGEgY2FyZCB0byB0aGUgbWVtYmVyXG4gICAgICAgICAgICAgICAgY29uc3QgYWRkQ2FyZFJlc3BvbnNlOiBDYXJkTGlua1Jlc3BvbnNlID0gYXdhaXQgb2xpdmVDbGllbnQuYWRkQ2FyZChhZGRDYXJkSW5wdXQuaWQsIGFkZENhcmRJbnB1dC5tZW1iZXJJZCwgYWRkQ2FyZElucHV0LnVwZGF0ZWRBdCEsIGFkZENhcmRJbnB1dC51cGRhdGVkQXQhLCBhZGRDYXJkSW5wdXQuY2FyZCBhcyBDYXJkKTtcblxuICAgICAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGUgYWRkIGNhcmQgY2FsbCB3YXMgZXhlY3V0ZWQgc3VjY2Vzc2Z1bGx5XG4gICAgICAgICAgICAgICAgaWYgKGFkZENhcmRSZXNwb25zZSAmJiAhYWRkQ2FyZFJlc3BvbnNlLmVycm9yTWVzc2FnZSAmJiAhYWRkQ2FyZFJlc3BvbnNlLmVycm9yVHlwZSAmJiBhZGRDYXJkUmVzcG9uc2UuZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBjb252ZXJ0IHRoZSBpbmNvbWluZyBsaW5rZWQgZGF0YSBpbnRvIGEgQ2FyZExpbmsgb2JqZWN0XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNhcmRMaW5rZWRSZXNwb25zZSA9IGFkZENhcmRSZXNwb25zZS5kYXRhIGFzIENhcmRMaW5rO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGZpbmFsbHksIHVwZGF0ZSB0aGUgY2FyZCBsaW5rZWQgb2JqZWN0LCBieSBhZGRpbmcvbGlua2luZyBhIG5ldyBjYXJkIHRvIGl0XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IFVwZGF0ZUl0ZW1Db21tYW5kKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuQ0FSRF9MSU5LSU5HX1RBQkxFISxcbiAgICAgICAgICAgICAgICAgICAgICAgIEtleToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGFkZENhcmRJbnB1dC5pZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBFeHByZXNzaW9uQXR0cmlidXRlTmFtZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiNDQVwiOiBcImNhcmRzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIjVUFcIjogXCJ1cGRhdGVkQXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIjpsaXN0XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE06IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNhcmRMaW5rZWRSZXNwb25zZS5jYXJkc1swXSEuaWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwbGljYXRpb25JRDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY2FyZExpbmtlZFJlc3BvbnNlLmNhcmRzWzBdIS5hcHBsaWNhdGlvbklEXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLihjYXJkTGlua2VkUmVzcG9uc2UuY2FyZHNbMF0hLmFkZGl0aW9uYWxQcm9ncmFtSUQgJiYge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkaXRpb25hbFByb2dyYW1JRDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNhcmRMaW5rZWRSZXNwb25zZS5jYXJkc1swXSEuYWRkaXRpb25hbFByb2dyYW1JRCFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3Q0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjYXJkTGlua2VkUmVzcG9uc2UuY2FyZHNbMF0hLmxhc3Q0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNhcmRMaW5rZWRSZXNwb25zZS5jYXJkc1swXSEubmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b2tlbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY2FyZExpbmtlZFJlc3BvbnNlLmNhcmRzWzBdIS50b2tlblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjYXJkTGlua2VkUmVzcG9uc2UuY2FyZHNbMF0hLnR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCI6dWFcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBhZGRDYXJkSW5wdXQudXBkYXRlZEF0IVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBVcGRhdGVFeHByZXNzaW9uOiBcIlNFVCAjQ0EgPSA6bGlzdCwgI1VBID0gOnVhXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBSZXR1cm5WYWx1ZXM6IFwiVVBEQVRFRF9ORVdcIlxuICAgICAgICAgICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBjYXJkIHJlc3BvbnNlIG9iamVjdFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjYXJkTGlua2VkUmVzcG9uc2UuaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVtYmVySWQ6IGNhcmRMaW5rZWRSZXNwb25zZS5tZW1iZXJJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiB0aGlzIGlzIG5vdCB0aGUgYWN0dWFsIGNyZWF0aW9uIGRhdGUsIGJlY2F1c2Ugd2UncmUgbm90IGludGVyZXN0ZWQgaW4gcmV0dXJuaW5nIHRoZSBhY2N1cmF0ZSBvbmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiAoc2luY2Ugd2UgZG9uJ3QgbW9kaWZ5IGl0LCBhbmQgdGh1cyB3ZSBkb24ndCByZXRyaWV2ZSBpdCBmcm9tIHRoZSBkYXRhYmFzZSksIGJ1dCByYXRoZXIgdGhlIHVwZGF0ZSBkYXRlLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDogY2FyZExpbmtlZFJlc3BvbnNlLmNyZWF0ZWRBdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVkQXQ6IGNhcmRMaW5rZWRSZXNwb25zZS51cGRhdGVkQXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FyZHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FyZExpbmtlZFJlc3BvbnNlLmNhcmRzWzBdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgVW5leHBlY3RlZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSB0aGUgYWRkIGNhcmQgY2FsbCFgKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBpZiB0aGVyZSBhcmUgZXJyb3JzIGFzc29jaWF0ZWQgd2l0aCBhZGQgY2FyZCBjYWxsLCBqdXN0IHJldHVybiB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgZXJyb3IgdHlwZSBmcm9tIHRoZSB1cHN0cmVhbSBjbGllbnRcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogYWRkQ2FyZFJlc3BvbnNlLmVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogYWRkQ2FyZFJlc3BvbnNlLmVycm9yVHlwZVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFVuZXhwZWN0ZWQgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gdGhlIHVwZGF0ZSBtZW1iZXIgc3RhdHVzIGNhbGwhYCk7XG5cbiAgICAgICAgICAgICAgICAvLyBpZiB0aGVyZSBhcmUgZXJyb3JzIGFzc29jaWF0ZWQgd2l0aCB0aGUgdXBkYXRlIG1lbWJlciBzdGF0dXMgY2FsbCwganVzdCByZXR1cm4gdGhlIGVycm9yIG1lc3NhZ2UgYW5kIGVycm9yIHR5cGUgZnJvbSB0aGUgdXBzdHJlYW0gY2xpZW50XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiB1cGRhdGVNZW1iZXJSZXNwb25zZS5lcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogdXBkYXRlTWVtYmVyUmVzcG9uc2UuZXJyb3JUeXBlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgZXhlY3V0aW5nIGFkZENhcmQgbXV0YXRpb24gJHtlcnJ9YDtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==