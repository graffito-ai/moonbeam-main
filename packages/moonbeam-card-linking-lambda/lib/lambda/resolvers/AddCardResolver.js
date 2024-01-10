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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRkQ2FyZFJlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9yZXNvbHZlcnMvQWRkQ2FyZFJlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtEQVVtQztBQUNuQyw4REFBMkY7QUFDM0YsK0JBQWtDO0FBRWxDOzs7Ozs7O0dBT0c7QUFDSSxNQUFNLE9BQU8sR0FBRyxLQUFLLEVBQUUsU0FBaUIsRUFBRSxZQUEwQixFQUE2QixFQUFFO0lBQ3RHLElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsNENBQTRDO1FBQzVDLE1BQU0sY0FBYyxHQUFHLElBQUksZ0NBQWMsQ0FBQyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBRTVELG9DQUFvQztRQUNwQyxZQUFZLENBQUMsU0FBUyxHQUFHLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7UUFFcEcsb0VBQW9FO1FBQ3BFLE1BQU0sYUFBYSxHQUFHLE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLGdDQUFjLENBQUM7WUFDL0QsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQW1CO1lBQzFDLEdBQUcsRUFBRTtnQkFDRCxFQUFFLEVBQUU7b0JBQ0EsQ0FBQyxFQUFFLFlBQVksQ0FBQyxFQUFFO2lCQUNyQjthQUNKO1lBQ0Q7Ozs7O2VBS0c7WUFDSCxvQkFBb0IsRUFBRSxVQUFVO1lBQ2hDLHdCQUF3QixFQUFFO2dCQUN0QixNQUFNLEVBQUUsSUFBSTtnQkFDWixJQUFJLEVBQUUsT0FBTzthQUNoQjtTQUNKLENBQUMsQ0FBQyxDQUFDO1FBRUo7OztXQUdHO1FBQ0gsSUFBSSxhQUFhLElBQUks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dXQsXG4gICAgQ2FyZCxcbiAgICBDYXJkTGluayxcbiAgICBDYXJkTGlua0Vycm9yVHlwZSxcbiAgICBDYXJkTGlua2luZ1N0YXR1cyxcbiAgICBDYXJkTGlua1Jlc3BvbnNlLFxuICAgIENhcmRSZXNwb25zZSxcbiAgICBNZW1iZXJSZXNwb25zZSxcbiAgICBPbGl2ZUNsaWVudFxufSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuaW1wb3J0IHtEeW5hbW9EQkNsaWVudCwgR2V0SXRlbUNvbW1hbmQsIFVwZGF0ZUl0ZW1Db21tYW5kfSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LWR5bmFtb2RiXCI7XG5pbXBvcnQge3Y0IGFzIHV1aWR2NH0gZnJvbSAndXVpZCc7XG5cbi8qKlxuICogQWRkQ2FyZCByZXNvbHZlclxuICpcbiAqIEBwYXJhbSBmaWVsZE5hbWUgbmFtZSBvZiB0aGUgcmVzb2x2ZXIgcGF0aCBmcm9tIHRoZSBBcHBTeW5jIGV2ZW50XG4gKiBAcGFyYW0gYWRkQ2FyZElucHV0IGFkZCBjYXJkIGlucHV0IG9iamVjdCwgdXNlZCB0byBhZGQvbGluayBhIGNhcmQgb2JqZWN0IHRvIGFuIGV4aXN0aW5nIHVzZXIvXG4gKiBjYXJkIGxpbmtlZCBvYmplY3QuXG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIENhcmRSZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IGFkZENhcmQgPSBhc3luYyAoZmllbGROYW1lOiBzdHJpbmcsIGFkZENhcmRJbnB1dDogQWRkQ2FyZElucHV0KTogUHJvbWlzZTxDYXJkTGlua1Jlc3BvbnNlPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gcmV0cmlldmluZyB0aGUgY3VycmVudCBmdW5jdGlvbiByZWdpb25cbiAgICAgICAgY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiE7XG5cbiAgICAgICAgLy8gaW5pdGlhbGl6aW5nIHRoZSBEeW5hbW9EQiBkb2N1bWVudCBjbGllbnRcbiAgICAgICAgY29uc3QgZHluYW1vRGJDbGllbnQgPSBuZXcgRHluYW1vREJDbGllbnQoe3JlZ2lvbjogcmVnaW9ufSk7XG5cbiAgICAgICAgLy8gdXBkYXRlIHRoZSB0aW1lc3RhbXBzIGFjY29yZGluZ2x5XG4gICAgICAgIGFkZENhcmRJbnB1dC51cGRhdGVkQXQgPSBhZGRDYXJkSW5wdXQudXBkYXRlZEF0ID8gYWRkQ2FyZElucHV0LnVwZGF0ZWRBdCA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcblxuICAgICAgICAvLyByZXRyaWV2ZSB0aGUgY2FyZCBsaW5raW5nIG9iamVjdCwgZ2l2ZW4gdGhlIGFkZCBjYXJkIGlucHV0IG9iamVjdFxuICAgICAgICBjb25zdCByZXRyaWV2ZWREYXRhID0gYXdhaXQgZHluYW1vRGJDbGllbnQuc2VuZChuZXcgR2V0SXRlbUNvbW1hbmQoe1xuICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5DQVJEX0xJTktJTkdfVEFCTEUhLFxuICAgICAgICAgICAgS2V5OiB7XG4gICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgUzogYWRkQ2FyZElucHV0LmlkXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogd2UncmUgbm90IGludGVyZXN0ZWQgaW4gZ2V0dGluZyBhbGwgdGhlIGRhdGEgZm9yIHRoaXMgY2FsbCwganVzdCB0aGUgbWluaW11bSBmb3IgdXMgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdGhpcyBpcyBhIGR1cGxpY2F0ZSBvciBub3RcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBAbGluayBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vYW1hem9uZHluYW1vZGIvbGF0ZXN0L2RldmVsb3Blcmd1aWRlL1Jlc2VydmVkV29yZHMuaHRtbFxuICAgICAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2FtYXpvbmR5bmFtb2RiL2xhdGVzdC9kZXZlbG9wZXJndWlkZS9FeHByZXNzaW9ucy5FeHByZXNzaW9uQXR0cmlidXRlTmFtZXMuaHRtbFxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBQcm9qZWN0aW9uRXhwcmVzc2lvbjogJyNpZGYsICNjJyxcbiAgICAgICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lczoge1xuICAgICAgICAgICAgICAgICcjaWRmJzogJ2lkJyxcbiAgICAgICAgICAgICAgICAnI2MnOiAnY2FyZHMnXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogaWYgdGhlcmUgaXMgYW4gaXRlbSByZXRyaWV2ZWQsIGFuZCBpdCBjb250YWlucyB0aHJlZXMgY2FyZHMgaW4gaXQsIHRoZW4gd2UgY2Fubm90IGFkZCBhbm90aGVyIGNhcmQgdG8gaXQsXG4gICAgICAgICAqIHNpbmNlIG91ciBsaW1pdCBpcyB0aHJlZSBjYXJkcyBwZXIgY3VzdG9tZXJcbiAgICAgICAgICovXG4gICAgICAgIGlmIChyZXRyaWV2ZWREYXRhICYmIHJldHJpZXZlZERhdGEuSXRlbSAmJiByZXRyaWV2ZWREYXRhLkl0ZW0uY2FyZHMuTCEubGVuZ3RoID09PSAzKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTWF4aW11bSBudW1iZXIgb2YgY2FyZHMgZXhjZWVkZWQgKDMpLiBEZWxldGUgb25lIGJlZm9yZSBhZGRpbmcgYSBuZXcgb25lIWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuQWxyZWFkeUV4aXN0ZW50XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBnZW5lcmF0ZSBhIHVuaXF1ZSBhcHBsaWNhdGlvbiBpZGVudGlmaWVyIGZvciB0aGUgY2FyZCwgdG8gYmUgcGFzc2VkIGluIHRvIE9saXZlIGFzIHRoZSBcInJlZmVyZW5jZUFwcElkXCJcbiAgICAgICAgICAgIGFkZENhcmRJbnB1dC5jYXJkLmFwcGxpY2F0aW9uSUQgPSB1dWlkdjQoKTtcblxuICAgICAgICAgICAgLy8gaW5pdGlhbGl6ZSB0aGUgT2xpdmUgQ2xpZW50IEFQSSBoZXJlLCBpbiBvcmRlciB0byBjYWxsIHRoZSBhcHByb3ByaWF0ZSBlbmRwb2ludHMgZm9yIHRoaXMgcmVzb2x2ZXJcbiAgICAgICAgICAgIGNvbnN0IG9saXZlQ2xpZW50ID0gbmV3IE9saXZlQ2xpZW50KHByb2Nlc3MuZW52LkVOVl9OQU1FISwgcmVnaW9uKTtcblxuICAgICAgICAgICAgLy8gZmlyc3QgZXhlY3V0ZSB0aGUgbWVtYmVyIHVwZGF0ZSBjYWxsLCB0byByZS1hY3RpdmF0ZSB0aGUgbWVtYmVyXG4gICAgICAgICAgICBjb25zdCB1cGRhdGVNZW1iZXJSZXNwb25zZTogTWVtYmVyUmVzcG9uc2UgPSBhd2FpdCBvbGl2ZUNsaWVudC51cGRhdGVNZW1iZXJTdGF0dXMoYWRkQ2FyZElucHV0LmlkLCBhZGRDYXJkSW5wdXQubWVtYmVySWQsIHRydWUsIGFkZENhcmRJbnB1dC51cGRhdGVkQXQhKTtcblxuICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSB1cGRhdGUgbWVtYmVyIHN0YXR1cyBjYWxsIHdhcyBleGVjdXRlZCBzdWNjZXNzZnVsbHlcbiAgICAgICAgICAgIGlmICh1cGRhdGVNZW1iZXJSZXNwb25zZSAmJiAhdXBkYXRlTWVtYmVyUmVzcG9uc2UuZXJyb3JNZXNzYWdlICYmICF1cGRhdGVNZW1iZXJSZXNwb25zZS5lcnJvclR5cGVcbiAgICAgICAgICAgICAgICAmJiB1cGRhdGVNZW1iZXJSZXNwb25zZS5kYXRhICYmIHVwZGF0ZU1lbWJlclJlc3BvbnNlLmRhdGEuaXNBY3RpdmUgPT09IHRydWVcbiAgICAgICAgICAgICAgICAmJiB1cGRhdGVNZW1iZXJSZXNwb25zZS5kYXRhLmlkID09PSBhZGRDYXJkSW5wdXQuaWQgJiYgdXBkYXRlTWVtYmVyUmVzcG9uc2UuZGF0YS5tZW1iZXJJZCA9PT0gYWRkQ2FyZElucHV0Lm1lbWJlcklkKSB7XG5cbiAgICAgICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlcmUgYXJlIGFueSBwcmV2aW91c2x5IGFkZGVkIGNhcmRzIHRoYXQgd2UgbmVlZCB0byBhcHBlbmQgdGhlIG5ld2x5IGFkZGVkIGNhcmQgdG9cbiAgICAgICAgICAgICAgICBjb25zdCB1cGRhdGVkQ2FyZExpc3Q6IGFueVtdID0gW107XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2VDYXJkTGlzdDogQ2FyZFtdID0gW107XG4gICAgICAgICAgICAgICAgaWYgKHJldHJpZXZlZERhdGEgJiYgcmV0cmlldmVkRGF0YS5JdGVtICYmIHJldHJpZXZlZERhdGEuSXRlbS5jYXJkcy5MIS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgcHJlRXhpc3RpbmdDYXJkIG9mIHJldHJpZXZlZERhdGEuSXRlbS5jYXJkcy5MISkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlZENhcmRMaXN0LnB1c2gocHJlRXhpc3RpbmdDYXJkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlQ2FyZExpc3QucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHByZUV4aXN0aW5nQ2FyZC5NIS5pZC5TISxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBsaWNhdGlvbklEOiBwcmVFeGlzdGluZ0NhcmQuTSEuYXBwbGljYXRpb25JRC5TISxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi4ocHJlRXhpc3RpbmdDYXJkLk0hLmFkZGl0aW9uYWxQcm9ncmFtSUQgJiYgcHJlRXhpc3RpbmdDYXJkLk0hLmFkZGl0aW9uYWxQcm9ncmFtSUQuUyEgJiYge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGRpdGlvbmFsUHJvZ3JhbUlEOiBwcmVFeGlzdGluZ0NhcmQuTSEuYWRkaXRpb25hbFByb2dyYW1JRC5TISxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0NDogcHJlRXhpc3RpbmdDYXJkLk0hLmxhc3Q0LlMhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHByZUV4aXN0aW5nQ2FyZC5NIS5uYW1lLlMhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRva2VuOiBwcmVFeGlzdGluZ0NhcmQuTSEudG9rZW4uUyEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogcHJlRXhpc3RpbmdDYXJkLk0hLnR5cGUuUyEsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gYWRkIHRoZSBuZXcgY2FyZCBpbnRvIHRoZSBsaXN0IG9mIHByZS1leGlzdGluZyBjYXJkcywgaWYgYW5kIG9ubHkgaWYgaXQgZG9lcyBub3QgaGF2ZSB0aGUgc2FtZSB0b2tlblxuICAgICAgICAgICAgICAgIGNvbnN0IGR1cGxpY2F0ZUNhcmQgPSByZXNwb25zZUNhcmRMaXN0LmZpbHRlcihyZXNwb25zZUNhcmQgPT4gcmVzcG9uc2VDYXJkLnRva2VuID09PSBhZGRDYXJkSW5wdXQuY2FyZC50b2tlbik7XG4gICAgICAgICAgICAgICAgaWYgKGR1cGxpY2F0ZUNhcmQubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHRoZW4gZXhlY3V0ZSB0aGUgYWRkIGNhcmQgY2FsbCwgdG8gYWRkIGEgY2FyZCB0byB0aGUgbWVtYmVyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGFkZENhcmRSZXNwb25zZTogQ2FyZExpbmtSZXNwb25zZSA9IGF3YWl0IG9saXZlQ2xpZW50LmFkZENhcmQoYWRkQ2FyZElucHV0LmlkLCBhZGRDYXJkSW5wdXQubWVtYmVySWQsIGFkZENhcmRJbnB1dC51cGRhdGVkQXQhLCBhZGRDYXJkSW5wdXQudXBkYXRlZEF0ISwgYWRkQ2FyZElucHV0LmNhcmQgYXMgQ2FyZCk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSBhZGQgY2FyZCBjYWxsIHdhcyBleGVjdXRlZCBzdWNjZXNzZnVsbHlcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFkZENhcmRSZXNwb25zZSAmJiAhYWRkQ2FyZFJlc3BvbnNlLmVycm9yTWVzc2FnZSAmJiAhYWRkQ2FyZFJlc3BvbnNlLmVycm9yVHlwZSAmJiBhZGRDYXJkUmVzcG9uc2UuZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29udmVydCB0aGUgaW5jb21pbmcgbGlua2VkIGRhdGEgaW50byBhIENhcmRMaW5rIG9iamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2FyZExpbmtlZFJlc3BvbnNlID0gYWRkQ2FyZFJlc3BvbnNlLmRhdGEgYXMgQ2FyZExpbms7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlQ2FyZExpc3QucHVzaChjYXJkTGlua2VkUmVzcG9uc2UuY2FyZHNbMF0hKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRDYXJkTGlzdC5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjYXJkTGlua2VkUmVzcG9uc2UuY2FyZHNbMF0hLmlkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcGxpY2F0aW9uSUQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNhcmRMaW5rZWRSZXNwb25zZS5jYXJkc1swXSEuYXBwbGljYXRpb25JRFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi4oYWRkQ2FyZElucHV0LmNhcmQuYWRkaXRpb25hbFByb2dyYW1JRCAmJiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGRpdGlvbmFsUHJvZ3JhbUlEOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogYWRkQ2FyZElucHV0LmNhcmQuYWRkaXRpb25hbFByb2dyYW1JRCFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3Q0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBhZGRDYXJkSW5wdXQuY2FyZC5sYXN0NFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBhZGRDYXJkSW5wdXQuY2FyZC5uYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRva2VuOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBhZGRDYXJkSW5wdXQuY2FyZC50b2tlblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBhZGRDYXJkSW5wdXQuY2FyZC50eXBlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZmluYWxseSwgdXBkYXRlIHRoZSBjYXJkIGxpbmtlZCBvYmplY3QsIGJ5IGFkZGluZy9saW5raW5nIGEgbmV3IGNhcmQgdG8gaXRcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IFVwZGF0ZUl0ZW1Db21tYW5kKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52LkNBUkRfTElOS0lOR19UQUJMRSEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgS2V5OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBhZGRDYXJkSW5wdXQuaWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiI0NBXCI6IFwiY2FyZHNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIjVUFcIjogXCJ1cGRhdGVkQXRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIjU1RcIjogXCJzdGF0dXNcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIjpsaXN0XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEw6IHVwZGF0ZWRDYXJkTGlzdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIjp1YVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBhZGRDYXJkSW5wdXQudXBkYXRlZEF0IVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIjpzdFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjYXJkTGlua2VkUmVzcG9uc2Uuc3RhdHVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFVwZGF0ZUV4cHJlc3Npb246IFwiU0VUICNDQSA9IDpsaXN0LCAjVUEgPSA6dWEsICNTVCA9IDpzdFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJldHVyblZhbHVlczogXCJVUERBVEVEX05FV1wiXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgY2FyZCByZXNwb25zZSBvYmplY3RcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogY2FyZExpbmtlZFJlc3BvbnNlLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZW1iZXJJZDogY2FyZExpbmtlZFJlc3BvbnNlLm1lbWJlcklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICogdGhpcyBpcyBub3QgdGhlIGFjdHVhbCBjcmVhdGlvbiBkYXRlLCBiZWNhdXNlIHdlJ3JlIG5vdCBpbnRlcmVzdGVkIGluIHJldHVybmluZyB0aGUgYWNjdXJhdGUgb25lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIChzaW5jZSB3ZSBkb24ndCBtb2RpZnkgaXQsIGFuZCB0aHVzIHdlIGRvbid0IHJldHJpZXZlIGl0IGZyb20gdGhlIGRhdGFiYXNlKSwgYnV0IHJhdGhlciB0aGUgdXBkYXRlIGRhdGUuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IGNhcmRMaW5rZWRSZXNwb25zZS5jcmVhdGVkQXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRBdDogY2FyZExpbmtlZFJlc3BvbnNlLnVwZGF0ZWRBdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FyZHM6IHJlc3BvbnNlQ2FyZExpc3QsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1czogY2FyZExpbmtlZFJlc3BvbnNlLnN0YXR1c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFVuZXhwZWN0ZWQgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gdGhlIGFkZCBjYXJkIGNhbGwhYCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIHRoZXJlIGFyZSBlcnJvcnMgYXNzb2NpYXRlZCB3aXRoIGFkZCBjYXJkIGNhbGwsIGp1c3QgcmV0dXJuIHRoZSBlcnJvciBtZXNzYWdlIGFuZCBlcnJvciB0eXBlIGZyb20gdGhlIHVwc3RyZWFtIGNsaWVudFxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGFkZENhcmRSZXNwb25zZS5lcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBhZGRDYXJkUmVzcG9uc2UuZXJyb3JUeXBlXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gdGhpcyBjYXJkIGlzIGFscmVhZHkgZXhpc3RlbnQsIHRoZXJlJ3Mgbm8gbmVlZCB0byBhZGQgaXQgYW55d2hlcmUgZWxzZSwganVzdCByZXR1cm4gaXQgaW4gdGhlIGxpc3Qgb2YgY2FyZHMgYXZhaWxhYmxlXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGFkZENhcmRJbnB1dC5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZW1iZXJJZDogYWRkQ2FyZElucHV0Lm1lbWJlcklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIHRoaXMgaXMgbm90IHRoZSBhY3R1YWwgY3JlYXRpb24gZGF0ZSwgYmVjYXVzZSB3ZSdyZSBub3QgaW50ZXJlc3RlZCBpbiByZXR1cm5pbmcgdGhlIGFjY3VyYXRlIG9uZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIChzaW5jZSB3ZSBkb24ndCBtb2RpZnkgaXQsIGFuZCB0aHVzIHdlIGRvbid0IHJldHJpZXZlIGl0IGZyb20gdGhlIGRhdGFiYXNlKSwgYnV0IHJhdGhlciB0aGUgdXBkYXRlIGRhdGUuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEF0OiBhZGRDYXJkSW5wdXQudXBkYXRlZEF0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRBdDogYWRkQ2FyZElucHV0LnVwZGF0ZWRBdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXJkczogcmVzcG9uc2VDYXJkTGlzdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IENhcmRMaW5raW5nU3RhdHVzLkxpbmtlZCAvLyB3ZSBrbm93IHRoYXQgaWYgd2UgZ290IGhlcmUsIHRoZXJlIGlzIGF0IGxlYXN0IG9uZSBsaW5rZWQgY2FyZCBpbiB0aGUgb2JqZWN0XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBVbmV4cGVjdGVkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tIHRoZSB1cGRhdGUgbWVtYmVyIHN0YXR1cyBjYWxsIWApO1xuXG4gICAgICAgICAgICAgICAgLy8gaWYgdGhlcmUgYXJlIGVycm9ycyBhc3NvY2lhdGVkIHdpdGggdGhlIHVwZGF0ZSBtZW1iZXIgc3RhdHVzIGNhbGwsIGp1c3QgcmV0dXJuIHRoZSBlcnJvciBtZXNzYWdlIGFuZCBlcnJvciB0eXBlIGZyb20gdGhlIHVwc3RyZWFtIGNsaWVudFxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogdXBkYXRlTWVtYmVyUmVzcG9uc2UuZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IHVwZGF0ZU1lbWJlclJlc3BvbnNlLmVycm9yVHlwZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgJHtmaWVsZE5hbWV9IG11dGF0aW9uICR7ZXJyfWA7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=