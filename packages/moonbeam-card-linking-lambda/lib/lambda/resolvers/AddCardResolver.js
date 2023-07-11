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
            // initialize the Olive Client API here, in order to call the appropriate endpoints for this resolver
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
        const errorMessage = `Unexpected error while executing ${fieldName} mutation ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: moonbeam_models_1.CardLinkErrorType.UnexpectedError
        };
    }
};
exports.addCard = addCard;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRkQ2FyZFJlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9yZXNvbHZlcnMvQWRkQ2FyZFJlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtEQVFtQztBQUNuQyw4REFBMkY7QUFDM0YsK0JBQWtDO0FBRWxDOzs7Ozs7O0dBT0c7QUFDSSxNQUFNLE9BQU8sR0FBRyxLQUFLLEVBQUUsU0FBaUIsRUFBRSxZQUEwQixFQUE2QixFQUFFO0lBQ3RHLElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsNENBQTRDO1FBQzVDLE1BQU0sY0FBYyxHQUFHLElBQUksZ0NBQWMsQ0FBQyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBRTVELG9DQUFvQztRQUNwQyxZQUFZLENBQUMsU0FBUyxHQUFHLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7UUFFcEcsb0VBQW9FO1FBQ3BFLE1BQU0sYUFBYSxHQUFJLE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLGdDQUFjLENBQUM7WUFDaEUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQW1CO1lBQzFDLEdBQUcsRUFBRTtnQkFDRCxFQUFFLEVBQUU7b0JBQ0EsQ0FBQyxFQUFFLFlBQVksQ0FBQyxFQUFFO2lCQUNyQjthQUNKO1lBQ0Q7Ozs7O2VBS0c7WUFDSCxvQkFBb0IsRUFBRSxVQUFVO1lBQ2hDLHdCQUF3QixFQUFFO2dCQUN0QixNQUFNLEVBQUUsSUFBSTtnQkFDWixJQUFJLEVBQUUsT0FBTzthQUNoQjtTQUNKLENBQUMsQ0FBQyxDQUFDO1FBRUo7OztXQUdHO1FBQ0gsSUFBSSxhQUFhLElBQUks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aUJBQU07Z0JBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyw0RUFBNEUsQ0FBQyxDQUFDO2dCQUUxRiwySUFBMkk7Z0JBQzNJLE9BQU87b0JBQ0gsWUFBWSxFQUFFLG9CQUFvQixDQUFDLFlBQVk7b0JBQy9DLFNBQVMsRUFBRSxvQkFBb0IsQ0FBQyxTQUFTO2lCQUM1QyxDQUFBO2FBQ0o7U0FDSjtLQUVKO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDVixNQUFNLFlBQVksR0FBRyxvQ0FBb0MsU0FBUyxhQUFhLEdBQUcsRUFBRSxDQUFDO1FBQ3JGLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDMUIsT0FBTztZQUNILFlBQVksRUFBRSxZQUFZO1lBQzFCLFNBQVMsRUFBRSxtQ0FBaUIsQ0FBQyxlQUFlO1NBQy9DLENBQUE7S0FDSjtBQUNMLENBQUMsQ0FBQTtBQXBLWSxRQUFBLE9BQU8sV0FvS25CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgICBBZGRDYXJkSW5wdXQsXG4gICAgQ2FyZCxcbiAgICBDYXJkTGluayxcbiAgICBDYXJkTGlua0Vycm9yVHlwZSxcbiAgICBDYXJkTGlua1Jlc3BvbnNlLFxuICAgIENhcmRSZXNwb25zZSwgTWVtYmVyUmVzcG9uc2UsXG4gICAgT2xpdmVDbGllbnRcbn0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcbmltcG9ydCB7RHluYW1vREJDbGllbnQsIEdldEl0ZW1Db21tYW5kLCBVcGRhdGVJdGVtQ29tbWFuZH0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1keW5hbW9kYlwiO1xuaW1wb3J0IHt2NCBhcyB1dWlkdjR9IGZyb20gJ3V1aWQnO1xuXG4vKipcbiAqIEFkZENhcmQgcmVzb2x2ZXJcbiAqXG4gKiBAcGFyYW0gZmllbGROYW1lIG5hbWUgb2YgdGhlIHJlc29sdmVyIHBhdGggZnJvbSB0aGUgQXBwU3luYyBldmVudFxuICogQHBhcmFtIGFkZENhcmRJbnB1dCBhZGQgY2FyZCBpbnB1dCBvYmplY3QsIHVzZWQgdG8gYWRkL2xpbmsgYSBjYXJkIG9iamVjdCB0byBhbiBleGlzdGluZyB1c2VyL1xuICogY2FyZCBsaW5rZWQgb2JqZWN0LlxuICogQHJldHVybnMge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBDYXJkUmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCBhZGRDYXJkID0gYXN5bmMgKGZpZWxkTmFtZTogc3RyaW5nLCBhZGRDYXJkSW5wdXQ6IEFkZENhcmRJbnB1dCk6IFByb21pc2U8Q2FyZExpbmtSZXNwb25zZT4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgIC8vIGluaXRpYWxpemluZyB0aGUgRHluYW1vREIgZG9jdW1lbnQgY2xpZW50XG4gICAgICAgIGNvbnN0IGR5bmFtb0RiQ2xpZW50ID0gbmV3IER5bmFtb0RCQ2xpZW50KHtyZWdpb246IHJlZ2lvbn0pO1xuXG4gICAgICAgIC8vIHVwZGF0ZSB0aGUgdGltZXN0YW1wcyBhY2NvcmRpbmdseVxuICAgICAgICBhZGRDYXJkSW5wdXQudXBkYXRlZEF0ID0gYWRkQ2FyZElucHV0LnVwZGF0ZWRBdCA/IGFkZENhcmRJbnB1dC51cGRhdGVkQXQgOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG5cbiAgICAgICAgLy8gcmV0cmlldmUgdGhlIGNhcmQgbGlua2luZyBvYmplY3QsIGdpdmVuIHRoZSBhZGQgY2FyZCBpbnB1dCBvYmplY3RcbiAgICAgICAgY29uc3QgcmV0cmlldmVkRGF0YSA9ICBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBHZXRJdGVtQ29tbWFuZCh7XG4gICAgICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52LkNBUkRfTElOS0lOR19UQUJMRSEsXG4gICAgICAgICAgICBLZXk6IHtcbiAgICAgICAgICAgICAgICBpZDoge1xuICAgICAgICAgICAgICAgICAgICBTOiBhZGRDYXJkSW5wdXQuaWRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiB3ZSdyZSBub3QgaW50ZXJlc3RlZCBpbiBnZXR0aW5nIGFsbCB0aGUgZGF0YSBmb3IgdGhpcyBjYWxsLCBqdXN0IHRoZSBtaW5pbXVtIGZvciB1cyB0byBkZXRlcm1pbmUgd2hldGhlciB0aGlzIGlzIGEgZHVwbGljYXRlIG9yIG5vdFxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIEBsaW5rIGh0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9hbWF6b25keW5hbW9kYi9sYXRlc3QvZGV2ZWxvcGVyZ3VpZGUvUmVzZXJ2ZWRXb3Jkcy5odG1sXG4gICAgICAgICAgICAgKiBAbGluayBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vYW1hem9uZHluYW1vZGIvbGF0ZXN0L2RldmVsb3Blcmd1aWRlL0V4cHJlc3Npb25zLkV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lcy5odG1sXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIFByb2plY3Rpb25FeHByZXNzaW9uOiAnI2lkZiwgI2MnLFxuICAgICAgICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzOiB7XG4gICAgICAgICAgICAgICAgJyNpZGYnOiAnaWQnLFxuICAgICAgICAgICAgICAgICcjYyc6ICdjYXJkcydcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBpZiB0aGVyZSBpcyBhbiBpdGVtIHJldHJpZXZlZCwgYW5kIGl0IGNvbnRhaW5zIGEgY2FyZCBpbiBpdCwgdGhlbiB3ZSBjYW5ub3QgYWRkIGFub3RoZXIgY2FyZCB0byBpdCxcbiAgICAgICAgICogc2luY2Ugb3VyIGxpbWl0IGlzIG9uZSBjYXJkIHBlciBjdXN0b21lclxuICAgICAgICAgKi9cbiAgICAgICAgaWYgKHJldHJpZXZlZERhdGEgJiYgcmV0cmlldmVkRGF0YS5JdGVtICYmIHJldHJpZXZlZERhdGEuSXRlbS5jYXJkcy5MIS5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBQcmUtZXhpc3RpbmcgY2FyZCBhbHJlYWR5IGV4aXN0ZW50LiBEZWxldGUgaXQgYmVmb3JlIGFkZGluZyBhIG5ldyBvbmUhYDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5BbHJlYWR5RXhpc3RlbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGdlbmVyYXRlIGEgdW5pcXVlIGFwcGxpY2F0aW9uIGlkZW50aWZpZXIgZm9yIHRoZSBjYXJkLCB0byBiZSBwYXNzZWQgaW4gdG8gT2xpdmUgYXMgdGhlIFwicmVmZXJlbmNlQXBwSWRcIlxuICAgICAgICAgICAgYWRkQ2FyZElucHV0LmNhcmQuYXBwbGljYXRpb25JRCA9IHV1aWR2NCgpO1xuXG4gICAgICAgICAgICAvLyBpbml0aWFsaXplIHRoZSBPbGl2ZSBDbGllbnQgQVBJIGhlcmUsIGluIG9yZGVyIHRvIGNhbGwgdGhlIGFwcHJvcHJpYXRlIGVuZHBvaW50cyBmb3IgdGhpcyByZXNvbHZlclxuICAgICAgICAgICAgY29uc3Qgb2xpdmVDbGllbnQgPSBuZXcgT2xpdmVDbGllbnQocHJvY2Vzcy5lbnYuRU5WX05BTUUhLCByZWdpb24pO1xuXG4gICAgICAgICAgICAvLyBmaXJzdCBleGVjdXRlIHRoZSBtZW1iZXIgdXBkYXRlIGNhbGwsIHRvIHJlLWFjdGl2YXRlIHRoZSBtZW1iZXJcbiAgICAgICAgICAgIGNvbnN0IHVwZGF0ZU1lbWJlclJlc3BvbnNlOiBNZW1iZXJSZXNwb25zZSA9IGF3YWl0IG9saXZlQ2xpZW50LnVwZGF0ZU1lbWJlclN0YXR1cyhhZGRDYXJkSW5wdXQuaWQsIGFkZENhcmRJbnB1dC5tZW1iZXJJZCwgdHJ1ZSwgYWRkQ2FyZElucHV0LnVwZGF0ZWRBdCEpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIHVwZGF0ZSBtZW1iZXIgc3RhdHVzIGNhbGwgd2FzIGV4ZWN1dGVkIHN1Y2Nlc3NmdWxseVxuICAgICAgICAgICAgaWYgKHVwZGF0ZU1lbWJlclJlc3BvbnNlICYmICF1cGRhdGVNZW1iZXJSZXNwb25zZS5lcnJvck1lc3NhZ2UgJiYgIXVwZGF0ZU1lbWJlclJlc3BvbnNlLmVycm9yVHlwZVxuICAgICAgICAgICAgICAgICYmIHVwZGF0ZU1lbWJlclJlc3BvbnNlLmRhdGEgJiYgdXBkYXRlTWVtYmVyUmVzcG9uc2UuZGF0YS5pc0FjdGl2ZSA9PT0gdHJ1ZVxuICAgICAgICAgICAgICAgICYmIHVwZGF0ZU1lbWJlclJlc3BvbnNlLmRhdGEuaWQgPT09IGFkZENhcmRJbnB1dC5pZCAmJiB1cGRhdGVNZW1iZXJSZXNwb25zZS5kYXRhLm1lbWJlcklkID09PSBhZGRDYXJkSW5wdXQubWVtYmVySWQpIHtcblxuICAgICAgICAgICAgICAgIC8vIHRoZW4gZXhlY3V0ZSB0aGUgYWRkIGNhcmQgY2FsbCwgdG8gYWRkIGEgY2FyZCB0byB0aGUgbWVtYmVyXG4gICAgICAgICAgICAgICAgY29uc3QgYWRkQ2FyZFJlc3BvbnNlOiBDYXJkTGlua1Jlc3BvbnNlID0gYXdhaXQgb2xpdmVDbGllbnQuYWRkQ2FyZChhZGRDYXJkSW5wdXQuaWQsIGFkZENhcmRJbnB1dC5tZW1iZXJJZCwgYWRkQ2FyZElucHV0LnVwZGF0ZWRBdCEsIGFkZENhcmRJbnB1dC51cGRhdGVkQXQhLCBhZGRDYXJkSW5wdXQuY2FyZCBhcyBDYXJkKTtcblxuICAgICAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGUgYWRkIGNhcmQgY2FsbCB3YXMgZXhlY3V0ZWQgc3VjY2Vzc2Z1bGx5XG4gICAgICAgICAgICAgICAgaWYgKGFkZENhcmRSZXNwb25zZSAmJiAhYWRkQ2FyZFJlc3BvbnNlLmVycm9yTWVzc2FnZSAmJiAhYWRkQ2FyZFJlc3BvbnNlLmVycm9yVHlwZSAmJiBhZGRDYXJkUmVzcG9uc2UuZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBjb252ZXJ0IHRoZSBpbmNvbWluZyBsaW5rZWQgZGF0YSBpbnRvIGEgQ2FyZExpbmsgb2JqZWN0XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNhcmRMaW5rZWRSZXNwb25zZSA9IGFkZENhcmRSZXNwb25zZS5kYXRhIGFzIENhcmRMaW5rO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGZpbmFsbHksIHVwZGF0ZSB0aGUgY2FyZCBsaW5rZWQgb2JqZWN0LCBieSBhZGRpbmcvbGlua2luZyBhIG5ldyBjYXJkIHRvIGl0XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IFVwZGF0ZUl0ZW1Db21tYW5kKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuQ0FSRF9MSU5LSU5HX1RBQkxFISxcbiAgICAgICAgICAgICAgICAgICAgICAgIEtleToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGFkZENhcmRJbnB1dC5pZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBFeHByZXNzaW9uQXR0cmlidXRlTmFtZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiNDQVwiOiBcImNhcmRzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIjVUFcIjogXCJ1cGRhdGVkQXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIjpsaXN0XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE06IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNhcmRMaW5rZWRSZXNwb25zZS5jYXJkc1swXSEuaWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwbGljYXRpb25JRDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY2FyZExpbmtlZFJlc3BvbnNlLmNhcmRzWzBdIS5hcHBsaWNhdGlvbklEXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLihjYXJkTGlua2VkUmVzcG9uc2UuY2FyZHNbMF0hLmFkZGl0aW9uYWxQcm9ncmFtSUQgJiYge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkaXRpb25hbFByb2dyYW1JRDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNhcmRMaW5rZWRSZXNwb25zZS5jYXJkc1swXSEuYWRkaXRpb25hbFByb2dyYW1JRCFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3Q0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjYXJkTGlua2VkUmVzcG9uc2UuY2FyZHNbMF0hLmxhc3Q0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNhcmRMaW5rZWRSZXNwb25zZS5jYXJkc1swXSEubmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b2tlbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY2FyZExpbmtlZFJlc3BvbnNlLmNhcmRzWzBdIS50b2tlblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjYXJkTGlua2VkUmVzcG9uc2UuY2FyZHNbMF0hLnR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCI6dWFcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBhZGRDYXJkSW5wdXQudXBkYXRlZEF0IVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBVcGRhdGVFeHByZXNzaW9uOiBcIlNFVCAjQ0EgPSA6bGlzdCwgI1VBID0gOnVhXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBSZXR1cm5WYWx1ZXM6IFwiVVBEQVRFRF9ORVdcIlxuICAgICAgICAgICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBjYXJkIHJlc3BvbnNlIG9iamVjdFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjYXJkTGlua2VkUmVzcG9uc2UuaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVtYmVySWQ6IGNhcmRMaW5rZWRSZXNwb25zZS5tZW1iZXJJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiB0aGlzIGlzIG5vdCB0aGUgYWN0dWFsIGNyZWF0aW9uIGRhdGUsIGJlY2F1c2Ugd2UncmUgbm90IGludGVyZXN0ZWQgaW4gcmV0dXJuaW5nIHRoZSBhY2N1cmF0ZSBvbmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiAoc2luY2Ugd2UgZG9uJ3QgbW9kaWZ5IGl0LCBhbmQgdGh1cyB3ZSBkb24ndCByZXRyaWV2ZSBpdCBmcm9tIHRoZSBkYXRhYmFzZSksIGJ1dCByYXRoZXIgdGhlIHVwZGF0ZSBkYXRlLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDogY2FyZExpbmtlZFJlc3BvbnNlLmNyZWF0ZWRBdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVkQXQ6IGNhcmRMaW5rZWRSZXNwb25zZS51cGRhdGVkQXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FyZHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FyZExpbmtlZFJlc3BvbnNlLmNhcmRzWzBdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgVW5leHBlY3RlZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSB0aGUgYWRkIGNhcmQgY2FsbCFgKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBpZiB0aGVyZSBhcmUgZXJyb3JzIGFzc29jaWF0ZWQgd2l0aCBhZGQgY2FyZCBjYWxsLCBqdXN0IHJldHVybiB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgZXJyb3IgdHlwZSBmcm9tIHRoZSB1cHN0cmVhbSBjbGllbnRcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogYWRkQ2FyZFJlc3BvbnNlLmVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogYWRkQ2FyZFJlc3BvbnNlLmVycm9yVHlwZVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFVuZXhwZWN0ZWQgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gdGhlIHVwZGF0ZSBtZW1iZXIgc3RhdHVzIGNhbGwhYCk7XG5cbiAgICAgICAgICAgICAgICAvLyBpZiB0aGVyZSBhcmUgZXJyb3JzIGFzc29jaWF0ZWQgd2l0aCB0aGUgdXBkYXRlIG1lbWJlciBzdGF0dXMgY2FsbCwganVzdCByZXR1cm4gdGhlIGVycm9yIG1lc3NhZ2UgYW5kIGVycm9yIHR5cGUgZnJvbSB0aGUgdXBzdHJlYW0gY2xpZW50XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiB1cGRhdGVNZW1iZXJSZXNwb25zZS5lcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogdXBkYXRlTWVtYmVyUmVzcG9uc2UuZXJyb3JUeXBlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgZXhlY3V0aW5nICR7ZmllbGROYW1lfSBtdXRhdGlvbiAke2Vycn1gO1xuICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICB9XG4gICAgfVxufVxuIl19