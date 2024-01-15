"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addCard = void 0;
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const uuid_1 = require("uuid");
/**
 * AddCard resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param addCardInput add card input object, used to add/link a card object to an existing user/
 * card linked object.
 * @returns {@link Promise} of {@link CardResponse}
 */
const addCard = async (fieldName, addCardInput) => {
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
            },
            /**
             * we're not interested in getting all the data for this call, just the minimum for us to determine whether this is a duplicate or not
             *
             * @link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html
             * @link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ExpressionAttributeNames.html
             */
            ProjectionExpression: '#idf, #c',
            ExpressionAttributeNames: {
                '#idf': 'id',
                '#c': 'cards'
            }
        }));
        /**
         * if there is an item retrieved, and it contains threes cards in it, then we cannot add another card to it,
         * since our limit is three cards per customer
         */
        if (retrievedData && retrievedData.Item && retrievedData.Item.cards.L.length === 3) {
            const errorMessage = `Maximum number of cards exceeded (3). Delete one before adding a new one!`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.CardLinkErrorType.AlreadyExistent
            };
        }
        else {
            // generate a unique application identifier for the card, to be passed in to Olive as the "referenceAppId"
            addCardInput.card.applicationID = (0, uuid_1.v4)();
            // initialize the Olive Client API here, in order to call the appropriate endpoints for this resolver
            const oliveClient = new moonbeam_models_1.OliveClient(process.env.ENV_NAME, region);
            // first execute the member update call, to re-activate the member
            const updateMemberResponse = await oliveClient.updateMemberStatus(addCardInput.id, addCardInput.memberId, true, addCardInput.updatedAt);
            // check to see if the update member status call was executed successfully
            if (updateMemberResponse && !updateMemberResponse.errorMessage && !updateMemberResponse.errorType
                && updateMemberResponse.data && updateMemberResponse.data.isActive === true
                && updateMemberResponse.data.id === addCardInput.id && updateMemberResponse.data.memberId === addCardInput.memberId) {
                // check to see if there are any previously added cards that we need to append the newly added card to
                const updatedCardList = [];
                const responseCardList = [];
                if (retrievedData && retrievedData.Item && retrievedData.Item.cards.L.length > 0) {
                    for (const preExistingCard of retrievedData.Item.cards.L) {
                        updatedCardList.push(preExistingCard);
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
                // add the new card into the list of pre-existing cards, if and only if it does not have the same token
                const duplicateCard = responseCardList.filter(responseCard => responseCard.token === addCardInput.card.token);
                if (duplicateCard.length === 0) {
                    // then execute the add card call, to add a card to the member
                    const addCardResponse = await oliveClient.addCard(addCardInput.id, addCardInput.memberId, addCardInput.updatedAt, addCardInput.updatedAt, addCardInput.card);
                    // check to see if the add card call was executed successfully
                    if (addCardResponse && !addCardResponse.errorMessage && !addCardResponse.errorType && addCardResponse.data) {
                        // convert the incoming linked data into a CardLink object
                        const cardLinkedResponse = addCardResponse.data;
                        responseCardList.push(cardLinkedResponse.cards[0]);
                        updatedCardList.push({
                            M: {
                                id: {
                                    S: cardLinkedResponse.cards[0].id
                                },
                                applicationID: {
                                    S: cardLinkedResponse.cards[0].applicationID
                                },
                                ...(addCardInput.card.additionalProgramID && {
                                    additionalProgramID: {
                                        S: addCardInput.card.additionalProgramID
                                    }
                                }),
                                last4: {
                                    S: addCardInput.card.last4
                                },
                                name: {
                                    S: addCardInput.card.name
                                },
                                token: {
                                    S: addCardInput.card.token
                                },
                                type: {
                                    S: addCardInput.card.type
                                }
                            }
                        });
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
                                "#UA": "updatedAt",
                                "#ST": "status"
                            },
                            ExpressionAttributeValues: {
                                ":list": {
                                    L: updatedCardList
                                },
                                ":ua": {
                                    S: addCardInput.updatedAt
                                },
                                ":st": {
                                    S: cardLinkedResponse.status
                                }
                            },
                            UpdateExpression: "SET #CA = :list, #UA = :ua, #ST = :st",
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
                                cards: responseCardList,
                                status: cardLinkedResponse.status
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
                    // this card is already existent, there's no need to add it anywhere else, just return it in the list of cards available
                    return {
                        data: {
                            id: addCardInput.id,
                            memberId: addCardInput.memberId,
                            /**
                             * this is not the actual creation date, because we're not interested in returning the accurate one
                             * (since we don't modify it, and thus we don't retrieve it from the database), but rather the update date.
                             */
                            createdAt: addCardInput.updatedAt,
                            updatedAt: addCardInput.updatedAt,
                            cards: responseCardList,
                            status: moonbeam_models_1.CardLinkingStatus.Linked // we know that if we got here, there is at least one linked card in the object
                        }
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
        const errorMessage = `Unexpected error while executing ${fieldName} mutation ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: moonbeam_models_1.CardLinkErrorType.UnexpectedError
        };
    }
};
exports.addCard = addCard;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRkQ2FyZFJlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9yZXNvbHZlcnMvQWRkQ2FyZFJlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtEQVVtQztBQUNuQyw4REFBMkY7QUFDM0YsK0JBQWtDO0FBRWxDOzs7Ozs7O0dBT0c7QUFDSSxNQUFNLE9BQU8sR0FBRyxLQUFLLEVBQUUsU0FBaUIsRUFBRSxZQUEwQixFQUE2QixFQUFFO0lBQ3RHLElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsNENBQTRDO1FBQzVDLE1BQU0sY0FBYyxHQUFHLElBQUksZ0NBQWMsQ0FBQyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBRTVELG9DQUFvQztRQUNwQyxZQUFZLENBQUMsU0FBUyxHQUFHLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7UUFFcEcsb0VBQW9FO1FBQ3BFLE1BQU0sYUFBYSxHQUFHLE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLGdDQUFjLENBQUM7WUFDL0QsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQW1CO1lBQzFDLEdBQUcsRUFBRTtnQkFDRCxFQUFFLEVBQUU7b0JBQ0EsQ0FBQyxFQUFFLFlBQVksQ0FBQyxFQUFFO2lCQUNyQjthQUNKO1lBQ0Q7Ozs7O2VBS0c7WUFDSCxvQkFBb0IsRUFBRSxVQUFVO1lBQ2hDLHdCQUF3QixFQUFFO2dCQUN0QixNQUFNLEVBQUUsSUFBSTtnQkFDWixJQUFJLEVBQUUsT0FBTzthQUNoQjtTQUNKLENBQUMsQ0FBQyxDQUFDO1FBRUo7OztXQUdHO1FBQ0gsSUFBSSxhQUFhLElBQUks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dXQsXG4gICAgQ2FyZCxcbiAgICBDYXJkTGluayxcbiAgICBDYXJkTGlua0Vycm9yVHlwZSxcbiAgICBDYXJkTGlua2luZ1N0YXR1cyxcbiAgICBDYXJkTGlua1Jlc3BvbnNlLFxuICAgIENhcmRSZXNwb25zZSwgQ2FyZFR5cGUsXG4gICAgTWVtYmVyUmVzcG9uc2UsXG4gICAgT2xpdmVDbGllbnRcbn0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcbmltcG9ydCB7RHluYW1vREJDbGllbnQsIEdldEl0ZW1Db21tYW5kLCBVcGRhdGVJdGVtQ29tbWFuZH0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1keW5hbW9kYlwiO1xuaW1wb3J0IHt2NCBhcyB1dWlkdjR9IGZyb20gJ3V1aWQnO1xuXG4vKipcbiAqIEFkZENhcmQgcmVzb2x2ZXJcbiAqXG4gKiBAcGFyYW0gZmllbGROYW1lIG5hbWUgb2YgdGhlIHJlc29sdmVyIHBhdGggZnJvbSB0aGUgQXBwU3luYyBldmVudFxuICogQHBhcmFtIGFkZENhcmRJbnB1dCBhZGQgY2FyZCBpbnB1dCBvYmplY3QsIHVzZWQgdG8gYWRkL2xpbmsgYSBjYXJkIG9iamVjdCB0byBhbiBleGlzdGluZyB1c2VyL1xuICogY2FyZCBsaW5rZWQgb2JqZWN0LlxuICogQHJldHVybnMge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBDYXJkUmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCBhZGRDYXJkID0gYXN5bmMgKGZpZWxkTmFtZTogc3RyaW5nLCBhZGRDYXJkSW5wdXQ6IEFkZENhcmRJbnB1dCk6IFByb21pc2U8Q2FyZExpbmtSZXNwb25zZT4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgIC8vIGluaXRpYWxpemluZyB0aGUgRHluYW1vREIgZG9jdW1lbnQgY2xpZW50XG4gICAgICAgIGNvbnN0IGR5bmFtb0RiQ2xpZW50ID0gbmV3IER5bmFtb0RCQ2xpZW50KHtyZWdpb246IHJlZ2lvbn0pO1xuXG4gICAgICAgIC8vIHVwZGF0ZSB0aGUgdGltZXN0YW1wcyBhY2NvcmRpbmdseVxuICAgICAgICBhZGRDYXJkSW5wdXQudXBkYXRlZEF0ID0gYWRkQ2FyZElucHV0LnVwZGF0ZWRBdCA/IGFkZENhcmRJbnB1dC51cGRhdGVkQXQgOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG5cbiAgICAgICAgLy8gcmV0cmlldmUgdGhlIGNhcmQgbGlua2luZyBvYmplY3QsIGdpdmVuIHRoZSBhZGQgY2FyZCBpbnB1dCBvYmplY3RcbiAgICAgICAgY29uc3QgcmV0cmlldmVkRGF0YSA9IGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IEdldEl0ZW1Db21tYW5kKHtcbiAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuQ0FSRF9MSU5LSU5HX1RBQkxFISxcbiAgICAgICAgICAgIEtleToge1xuICAgICAgICAgICAgICAgIGlkOiB7XG4gICAgICAgICAgICAgICAgICAgIFM6IGFkZENhcmRJbnB1dC5pZFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIHdlJ3JlIG5vdCBpbnRlcmVzdGVkIGluIGdldHRpbmcgYWxsIHRoZSBkYXRhIGZvciB0aGlzIGNhbGwsIGp1c3QgdGhlIG1pbmltdW0gZm9yIHVzIHRvIGRldGVybWluZSB3aGV0aGVyIHRoaXMgaXMgYSBkdXBsaWNhdGUgb3Igbm90XG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2FtYXpvbmR5bmFtb2RiL2xhdGVzdC9kZXZlbG9wZXJndWlkZS9SZXNlcnZlZFdvcmRzLmh0bWxcbiAgICAgICAgICAgICAqIEBsaW5rIGh0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9hbWF6b25keW5hbW9kYi9sYXRlc3QvZGV2ZWxvcGVyZ3VpZGUvRXhwcmVzc2lvbnMuRXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzLmh0bWxcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgUHJvamVjdGlvbkV4cHJlc3Npb246ICcjaWRmLCAjYycsXG4gICAgICAgICAgICBFeHByZXNzaW9uQXR0cmlidXRlTmFtZXM6IHtcbiAgICAgICAgICAgICAgICAnI2lkZic6ICdpZCcsXG4gICAgICAgICAgICAgICAgJyNjJzogJ2NhcmRzJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIGlmIHRoZXJlIGlzIGFuIGl0ZW0gcmV0cmlldmVkLCBhbmQgaXQgY29udGFpbnMgdGhyZWVzIGNhcmRzIGluIGl0LCB0aGVuIHdlIGNhbm5vdCBhZGQgYW5vdGhlciBjYXJkIHRvIGl0LFxuICAgICAgICAgKiBzaW5jZSBvdXIgbGltaXQgaXMgdGhyZWUgY2FyZHMgcGVyIGN1c3RvbWVyXG4gICAgICAgICAqL1xuICAgICAgICBpZiAocmV0cmlldmVkRGF0YSAmJiByZXRyaWV2ZWREYXRhLkl0ZW0gJiYgcmV0cmlldmVkRGF0YS5JdGVtLmNhcmRzLkwhLmxlbmd0aCA9PT0gMykge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE1heGltdW0gbnVtYmVyIG9mIGNhcmRzIGV4Y2VlZGVkICgzKS4gRGVsZXRlIG9uZSBiZWZvcmUgYWRkaW5nIGEgbmV3IG9uZSFgO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLkFscmVhZHlFeGlzdGVudFxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gZ2VuZXJhdGUgYSB1bmlxdWUgYXBwbGljYXRpb24gaWRlbnRpZmllciBmb3IgdGhlIGNhcmQsIHRvIGJlIHBhc3NlZCBpbiB0byBPbGl2ZSBhcyB0aGUgXCJyZWZlcmVuY2VBcHBJZFwiXG4gICAgICAgICAgICBhZGRDYXJkSW5wdXQuY2FyZC5hcHBsaWNhdGlvbklEID0gdXVpZHY0KCk7XG5cbiAgICAgICAgICAgIC8vIGluaXRpYWxpemUgdGhlIE9saXZlIENsaWVudCBBUEkgaGVyZSwgaW4gb3JkZXIgdG8gY2FsbCB0aGUgYXBwcm9wcmlhdGUgZW5kcG9pbnRzIGZvciB0aGlzIHJlc29sdmVyXG4gICAgICAgICAgICBjb25zdCBvbGl2ZUNsaWVudCA9IG5ldyBPbGl2ZUNsaWVudChwcm9jZXNzLmVudi5FTlZfTkFNRSEsIHJlZ2lvbik7XG5cbiAgICAgICAgICAgIC8vIGZpcnN0IGV4ZWN1dGUgdGhlIG1lbWJlciB1cGRhdGUgY2FsbCwgdG8gcmUtYWN0aXZhdGUgdGhlIG1lbWJlclxuICAgICAgICAgICAgY29uc3QgdXBkYXRlTWVtYmVyUmVzcG9uc2U6IE1lbWJlclJlc3BvbnNlID0gYXdhaXQgb2xpdmVDbGllbnQudXBkYXRlTWVtYmVyU3RhdHVzKGFkZENhcmRJbnB1dC5pZCwgYWRkQ2FyZElucHV0Lm1lbWJlcklkLCB0cnVlLCBhZGRDYXJkSW5wdXQudXBkYXRlZEF0ISk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGUgdXBkYXRlIG1lbWJlciBzdGF0dXMgY2FsbCB3YXMgZXhlY3V0ZWQgc3VjY2Vzc2Z1bGx5XG4gICAgICAgICAgICBpZiAodXBkYXRlTWVtYmVyUmVzcG9uc2UgJiYgIXVwZGF0ZU1lbWJlclJlc3BvbnNlLmVycm9yTWVzc2FnZSAmJiAhdXBkYXRlTWVtYmVyUmVzcG9uc2UuZXJyb3JUeXBlXG4gICAgICAgICAgICAgICAgJiYgdXBkYXRlTWVtYmVyUmVzcG9uc2UuZGF0YSAmJiB1cGRhdGVNZW1iZXJSZXNwb25zZS5kYXRhLmlzQWN0aXZlID09PSB0cnVlXG4gICAgICAgICAgICAgICAgJiYgdXBkYXRlTWVtYmVyUmVzcG9uc2UuZGF0YS5pZCA9PT0gYWRkQ2FyZElucHV0LmlkICYmIHVwZGF0ZU1lbWJlclJlc3BvbnNlLmRhdGEubWVtYmVySWQgPT09IGFkZENhcmRJbnB1dC5tZW1iZXJJZCkge1xuXG4gICAgICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZXJlIGFyZSBhbnkgcHJldmlvdXNseSBhZGRlZCBjYXJkcyB0aGF0IHdlIG5lZWQgdG8gYXBwZW5kIHRoZSBuZXdseSBhZGRlZCBjYXJkIHRvXG4gICAgICAgICAgICAgICAgY29uc3QgdXBkYXRlZENhcmRMaXN0OiBhbnlbXSA9IFtdO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlQ2FyZExpc3Q6IENhcmRbXSA9IFtdO1xuICAgICAgICAgICAgICAgIGlmIChyZXRyaWV2ZWREYXRhICYmIHJldHJpZXZlZERhdGEuSXRlbSAmJiByZXRyaWV2ZWREYXRhLkl0ZW0uY2FyZHMuTCEubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHByZUV4aXN0aW5nQ2FyZCBvZiByZXRyaWV2ZWREYXRhLkl0ZW0uY2FyZHMuTCEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRDYXJkTGlzdC5wdXNoKHByZUV4aXN0aW5nQ2FyZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNwb25zZUNhcmRMaXN0LnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBwcmVFeGlzdGluZ0NhcmQuTSEuaWQuUyEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwbGljYXRpb25JRDogcHJlRXhpc3RpbmdDYXJkLk0hLmFwcGxpY2F0aW9uSUQuUyEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uKHByZUV4aXN0aW5nQ2FyZC5NIS5hZGRpdGlvbmFsUHJvZ3JhbUlEICYmIHByZUV4aXN0aW5nQ2FyZC5NIS5hZGRpdGlvbmFsUHJvZ3JhbUlELlMhICYmIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkaXRpb25hbFByb2dyYW1JRDogcHJlRXhpc3RpbmdDYXJkLk0hLmFkZGl0aW9uYWxQcm9ncmFtSUQuUyEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdDQ6IHByZUV4aXN0aW5nQ2FyZC5NIS5sYXN0NC5TISxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBwcmVFeGlzdGluZ0NhcmQuTSEubmFtZS5TISxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b2tlbjogcHJlRXhpc3RpbmdDYXJkLk0hLnRva2VuLlMhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IHByZUV4aXN0aW5nQ2FyZC5NIS50eXBlLlMhIGFzIENhcmRUeXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIGFkZCB0aGUgbmV3IGNhcmQgaW50byB0aGUgbGlzdCBvZiBwcmUtZXhpc3RpbmcgY2FyZHMsIGlmIGFuZCBvbmx5IGlmIGl0IGRvZXMgbm90IGhhdmUgdGhlIHNhbWUgdG9rZW5cbiAgICAgICAgICAgICAgICBjb25zdCBkdXBsaWNhdGVDYXJkID0gcmVzcG9uc2VDYXJkTGlzdC5maWx0ZXIocmVzcG9uc2VDYXJkID0+IHJlc3BvbnNlQ2FyZC50b2tlbiA9PT0gYWRkQ2FyZElucHV0LmNhcmQudG9rZW4pO1xuICAgICAgICAgICAgICAgIGlmIChkdXBsaWNhdGVDYXJkLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAvLyB0aGVuIGV4ZWN1dGUgdGhlIGFkZCBjYXJkIGNhbGwsIHRvIGFkZCBhIGNhcmQgdG8gdGhlIG1lbWJlclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBhZGRDYXJkUmVzcG9uc2U6IENhcmRMaW5rUmVzcG9uc2UgPSBhd2FpdCBvbGl2ZUNsaWVudC5hZGRDYXJkKGFkZENhcmRJbnB1dC5pZCwgYWRkQ2FyZElucHV0Lm1lbWJlcklkLCBhZGRDYXJkSW5wdXQudXBkYXRlZEF0ISwgYWRkQ2FyZElucHV0LnVwZGF0ZWRBdCEsIGFkZENhcmRJbnB1dC5jYXJkIGFzIENhcmQpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGUgYWRkIGNhcmQgY2FsbCB3YXMgZXhlY3V0ZWQgc3VjY2Vzc2Z1bGx5XG4gICAgICAgICAgICAgICAgICAgIGlmIChhZGRDYXJkUmVzcG9uc2UgJiYgIWFkZENhcmRSZXNwb25zZS5lcnJvck1lc3NhZ2UgJiYgIWFkZENhcmRSZXNwb25zZS5lcnJvclR5cGUgJiYgYWRkQ2FyZFJlc3BvbnNlLmRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbnZlcnQgdGhlIGluY29taW5nIGxpbmtlZCBkYXRhIGludG8gYSBDYXJkTGluayBvYmplY3RcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNhcmRMaW5rZWRSZXNwb25zZSA9IGFkZENhcmRSZXNwb25zZS5kYXRhIGFzIENhcmRMaW5rO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNwb25zZUNhcmRMaXN0LnB1c2goY2FyZExpbmtlZFJlc3BvbnNlLmNhcmRzWzBdISk7XG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVkQ2FyZExpc3QucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY2FyZExpbmtlZFJlc3BvbnNlLmNhcmRzWzBdIS5pZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBsaWNhdGlvbklEOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjYXJkTGlua2VkUmVzcG9uc2UuY2FyZHNbMF0hLmFwcGxpY2F0aW9uSURcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uKGFkZENhcmRJbnB1dC5jYXJkLmFkZGl0aW9uYWxQcm9ncmFtSUQgJiYge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkaXRpb25hbFByb2dyYW1JRDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGFkZENhcmRJbnB1dC5jYXJkLmFkZGl0aW9uYWxQcm9ncmFtSUQhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0NDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogYWRkQ2FyZElucHV0LmNhcmQubGFzdDRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogYWRkQ2FyZElucHV0LmNhcmQubmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b2tlbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogYWRkQ2FyZElucHV0LmNhcmQudG9rZW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogYWRkQ2FyZElucHV0LmNhcmQudHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZpbmFsbHksIHVwZGF0ZSB0aGUgY2FyZCBsaW5rZWQgb2JqZWN0LCBieSBhZGRpbmcvbGlua2luZyBhIG5ldyBjYXJkIHRvIGl0XG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBVcGRhdGVJdGVtQ29tbWFuZCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5DQVJEX0xJTktJTkdfVEFCTEUhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEtleToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogYWRkQ2FyZElucHV0LmlkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiNDQVwiOiBcImNhcmRzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiI1VBXCI6IFwidXBkYXRlZEF0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiI1NUXCI6IFwic3RhdHVzXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCI6bGlzdFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBMOiB1cGRhdGVkQ2FyZExpc3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCI6dWFcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogYWRkQ2FyZElucHV0LnVwZGF0ZWRBdCFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCI6c3RcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY2FyZExpbmtlZFJlc3BvbnNlLnN0YXR1c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBVcGRhdGVFeHByZXNzaW9uOiBcIlNFVCAjQ0EgPSA6bGlzdCwgI1VBID0gOnVhLCAjU1QgPSA6c3RcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZXR1cm5WYWx1ZXM6IFwiVVBEQVRFRF9ORVdcIlxuICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIGNhcmQgcmVzcG9uc2Ugb2JqZWN0XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNhcmRMaW5rZWRSZXNwb25zZS5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVtYmVySWQ6IGNhcmRMaW5rZWRSZXNwb25zZS5tZW1iZXJJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIHRoaXMgaXMgbm90IHRoZSBhY3R1YWwgY3JlYXRpb24gZGF0ZSwgYmVjYXVzZSB3ZSdyZSBub3QgaW50ZXJlc3RlZCBpbiByZXR1cm5pbmcgdGhlIGFjY3VyYXRlIG9uZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiAoc2luY2Ugd2UgZG9uJ3QgbW9kaWZ5IGl0LCBhbmQgdGh1cyB3ZSBkb24ndCByZXRyaWV2ZSBpdCBmcm9tIHRoZSBkYXRhYmFzZSksIGJ1dCByYXRoZXIgdGhlIHVwZGF0ZSBkYXRlLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEF0OiBjYXJkTGlua2VkUmVzcG9uc2UuY3JlYXRlZEF0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVkQXQ6IGNhcmRMaW5rZWRSZXNwb25zZS51cGRhdGVkQXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRzOiByZXNwb25zZUNhcmRMaXN0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IGNhcmRMaW5rZWRSZXNwb25zZS5zdGF0dXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBVbmV4cGVjdGVkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tIHRoZSBhZGQgY2FyZCBjYWxsIWApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpZiB0aGVyZSBhcmUgZXJyb3JzIGFzc29jaWF0ZWQgd2l0aCBhZGQgY2FyZCBjYWxsLCBqdXN0IHJldHVybiB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgZXJyb3IgdHlwZSBmcm9tIHRoZSB1cHN0cmVhbSBjbGllbnRcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBhZGRDYXJkUmVzcG9uc2UuZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogYWRkQ2FyZFJlc3BvbnNlLmVycm9yVHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHRoaXMgY2FyZCBpcyBhbHJlYWR5IGV4aXN0ZW50LCB0aGVyZSdzIG5vIG5lZWQgdG8gYWRkIGl0IGFueXdoZXJlIGVsc2UsIGp1c3QgcmV0dXJuIGl0IGluIHRoZSBsaXN0IG9mIGNhcmRzIGF2YWlsYWJsZVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBhZGRDYXJkSW5wdXQuaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVtYmVySWQ6IGFkZENhcmRJbnB1dC5tZW1iZXJJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiB0aGlzIGlzIG5vdCB0aGUgYWN0dWFsIGNyZWF0aW9uIGRhdGUsIGJlY2F1c2Ugd2UncmUgbm90IGludGVyZXN0ZWQgaW4gcmV0dXJuaW5nIHRoZSBhY2N1cmF0ZSBvbmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiAoc2luY2Ugd2UgZG9uJ3QgbW9kaWZ5IGl0LCBhbmQgdGh1cyB3ZSBkb24ndCByZXRyaWV2ZSBpdCBmcm9tIHRoZSBkYXRhYmFzZSksIGJ1dCByYXRoZXIgdGhlIHVwZGF0ZSBkYXRlLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDogYWRkQ2FyZElucHV0LnVwZGF0ZWRBdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVkQXQ6IGFkZENhcmRJbnB1dC51cGRhdGVkQXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FyZHM6IHJlc3BvbnNlQ2FyZExpc3QsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiBDYXJkTGlua2luZ1N0YXR1cy5MaW5rZWQgLy8gd2Uga25vdyB0aGF0IGlmIHdlIGdvdCBoZXJlLCB0aGVyZSBpcyBhdCBsZWFzdCBvbmUgbGlua2VkIGNhcmQgaW4gdGhlIG9iamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgVW5leHBlY3RlZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSB0aGUgdXBkYXRlIG1lbWJlciBzdGF0dXMgY2FsbCFgKTtcblxuICAgICAgICAgICAgICAgIC8vIGlmIHRoZXJlIGFyZSBlcnJvcnMgYXNzb2NpYXRlZCB3aXRoIHRoZSB1cGRhdGUgbWVtYmVyIHN0YXR1cyBjYWxsLCBqdXN0IHJldHVybiB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgZXJyb3IgdHlwZSBmcm9tIHRoZSB1cHN0cmVhbSBjbGllbnRcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IHVwZGF0ZU1lbWJlclJlc3BvbnNlLmVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiB1cGRhdGVNZW1iZXJSZXNwb25zZS5lcnJvclR5cGVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgZXhlY3V0aW5nICR7ZmllbGROYW1lfSBtdXRhdGlvbiAke2Vycn1gO1xuICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICB9XG4gICAgfVxufVxuIl19