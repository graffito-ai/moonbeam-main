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
                            "#UA": "updatedAt",
                            "#ST": "status"
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
                            cards: [
                                cardLinkedResponse.cards[0]
                            ],
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRkQ2FyZFJlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9yZXNvbHZlcnMvQWRkQ2FyZFJlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtEQVNtQztBQUNuQyw4REFBMkY7QUFDM0YsK0JBQWtDO0FBRWxDOzs7Ozs7O0dBT0c7QUFDSSxNQUFNLE9BQU8sR0FBRyxLQUFLLEVBQUUsU0FBaUIsRUFBRSxZQUEwQixFQUE2QixFQUFFO0lBQ3RHLElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsNENBQTRDO1FBQzVDLE1BQU0sY0FBYyxHQUFHLElBQUksZ0NBQWMsQ0FBQyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBRTVELG9DQUFvQztRQUNwQyxZQUFZLENBQUMsU0FBUyxHQUFHLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7UUFFcEcsb0VBQW9FO1FBQ3BFLE1BQU0sYUFBYSxHQUFHLE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLGdDQUFjLENBQUM7WUFDL0QsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQW1CO1lBQzFDLEdBQUcsRUFBRTtnQkFDRCxFQUFFLEVBQUU7b0JBQ0EsQ0FBQyxFQUFFLFlBQVksQ0FBQyxFQUFFO2lCQUNyQjthQUNKO1lBQ0Q7Ozs7O2VBS0c7WUFDSCxvQkFBb0IsRUFBRSxVQUFVO1lBQ2hDLHdCQUF3QixFQUFFO2dCQUN0QixNQUFNLEVBQUUsSUFBSTtnQkFDWixJQUFJLEVBQUUsT0FBTzthQUNoQjtTQUNKLENBQUMsQ0FBQyxDQUFDO1FBRUo7OztXQUdHO1FBQ0gsSUFBSSxhQUFhLElBQUks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b0JBRTlFLDJIQUEySDtvQkFDM0gsT0FBTzt3QkFDSCxZQUFZLEVBQUUsZUFBZSxDQUFDLFlBQVk7d0JBQzFDLFNBQVMsRUFBRSxlQUFlLENBQUMsU0FBUztxQkFDdkMsQ0FBQztpQkFDTDthQUNKO2lCQUFNO2dCQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsNEVBQTRFLENBQUMsQ0FBQztnQkFFMUYsMklBQTJJO2dCQUMzSSxPQUFPO29CQUNILFlBQVksRUFBRSxvQkFBb0IsQ0FBQyxZQUFZO29CQUMvQyxTQUFTLEVBQUUsb0JBQW9CLENBQUMsU0FBUztpQkFDNUMsQ0FBQTthQUNKO1NBQ0o7S0FFSjtJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1YsTUFBTSxZQUFZLEdBQUcsb0NBQW9DLFNBQVMsYUFBYSxHQUFHLEVBQUUsQ0FBQztRQUNyRixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzFCLE9BQU87WUFDSCxZQUFZLEVBQUUsWUFBWTtZQUMxQixTQUFTLEVBQUUsbUNBQWlCLENBQUMsZUFBZTtTQUMvQyxDQUFBO0tBQ0o7QUFDTCxDQUFDLENBQUE7QUF6S1ksUUFBQSxPQUFPLFdBeUtuQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gICAgQWRkQ2FyZElucHV0LFxuICAgIENhcmQsXG4gICAgQ2FyZExpbmssXG4gICAgQ2FyZExpbmtFcnJvclR5cGUsXG4gICAgQ2FyZExpbmtSZXNwb25zZSxcbiAgICBDYXJkUmVzcG9uc2UsXG4gICAgTWVtYmVyUmVzcG9uc2UsXG4gICAgT2xpdmVDbGllbnRcbn0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcbmltcG9ydCB7RHluYW1vREJDbGllbnQsIEdldEl0ZW1Db21tYW5kLCBVcGRhdGVJdGVtQ29tbWFuZH0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1keW5hbW9kYlwiO1xuaW1wb3J0IHt2NCBhcyB1dWlkdjR9IGZyb20gJ3V1aWQnO1xuXG4vKipcbiAqIEFkZENhcmQgcmVzb2x2ZXJcbiAqXG4gKiBAcGFyYW0gZmllbGROYW1lIG5hbWUgb2YgdGhlIHJlc29sdmVyIHBhdGggZnJvbSB0aGUgQXBwU3luYyBldmVudFxuICogQHBhcmFtIGFkZENhcmRJbnB1dCBhZGQgY2FyZCBpbnB1dCBvYmplY3QsIHVzZWQgdG8gYWRkL2xpbmsgYSBjYXJkIG9iamVjdCB0byBhbiBleGlzdGluZyB1c2VyL1xuICogY2FyZCBsaW5rZWQgb2JqZWN0LlxuICogQHJldHVybnMge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBDYXJkUmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCBhZGRDYXJkID0gYXN5bmMgKGZpZWxkTmFtZTogc3RyaW5nLCBhZGRDYXJkSW5wdXQ6IEFkZENhcmRJbnB1dCk6IFByb21pc2U8Q2FyZExpbmtSZXNwb25zZT4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgIC8vIGluaXRpYWxpemluZyB0aGUgRHluYW1vREIgZG9jdW1lbnQgY2xpZW50XG4gICAgICAgIGNvbnN0IGR5bmFtb0RiQ2xpZW50ID0gbmV3IER5bmFtb0RCQ2xpZW50KHtyZWdpb246IHJlZ2lvbn0pO1xuXG4gICAgICAgIC8vIHVwZGF0ZSB0aGUgdGltZXN0YW1wcyBhY2NvcmRpbmdseVxuICAgICAgICBhZGRDYXJkSW5wdXQudXBkYXRlZEF0ID0gYWRkQ2FyZElucHV0LnVwZGF0ZWRBdCA/IGFkZENhcmRJbnB1dC51cGRhdGVkQXQgOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG5cbiAgICAgICAgLy8gcmV0cmlldmUgdGhlIGNhcmQgbGlua2luZyBvYmplY3QsIGdpdmVuIHRoZSBhZGQgY2FyZCBpbnB1dCBvYmplY3RcbiAgICAgICAgY29uc3QgcmV0cmlldmVkRGF0YSA9IGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IEdldEl0ZW1Db21tYW5kKHtcbiAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuQ0FSRF9MSU5LSU5HX1RBQkxFISxcbiAgICAgICAgICAgIEtleToge1xuICAgICAgICAgICAgICAgIGlkOiB7XG4gICAgICAgICAgICAgICAgICAgIFM6IGFkZENhcmRJbnB1dC5pZFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIHdlJ3JlIG5vdCBpbnRlcmVzdGVkIGluIGdldHRpbmcgYWxsIHRoZSBkYXRhIGZvciB0aGlzIGNhbGwsIGp1c3QgdGhlIG1pbmltdW0gZm9yIHVzIHRvIGRldGVybWluZSB3aGV0aGVyIHRoaXMgaXMgYSBkdXBsaWNhdGUgb3Igbm90XG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2FtYXpvbmR5bmFtb2RiL2xhdGVzdC9kZXZlbG9wZXJndWlkZS9SZXNlcnZlZFdvcmRzLmh0bWxcbiAgICAgICAgICAgICAqIEBsaW5rIGh0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9hbWF6b25keW5hbW9kYi9sYXRlc3QvZGV2ZWxvcGVyZ3VpZGUvRXhwcmVzc2lvbnMuRXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzLmh0bWxcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgUHJvamVjdGlvbkV4cHJlc3Npb246ICcjaWRmLCAjYycsXG4gICAgICAgICAgICBFeHByZXNzaW9uQXR0cmlidXRlTmFtZXM6IHtcbiAgICAgICAgICAgICAgICAnI2lkZic6ICdpZCcsXG4gICAgICAgICAgICAgICAgJyNjJzogJ2NhcmRzJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIGlmIHRoZXJlIGlzIGFuIGl0ZW0gcmV0cmlldmVkLCBhbmQgaXQgY29udGFpbnMgYSBjYXJkIGluIGl0LCB0aGVuIHdlIGNhbm5vdCBhZGQgYW5vdGhlciBjYXJkIHRvIGl0LFxuICAgICAgICAgKiBzaW5jZSBvdXIgbGltaXQgaXMgb25lIGNhcmQgcGVyIGN1c3RvbWVyXG4gICAgICAgICAqL1xuICAgICAgICBpZiAocmV0cmlldmVkRGF0YSAmJiByZXRyaWV2ZWREYXRhLkl0ZW0gJiYgcmV0cmlldmVkRGF0YS5JdGVtLmNhcmRzLkwhLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFByZS1leGlzdGluZyBjYXJkIGFscmVhZHkgZXhpc3RlbnQuIERlbGV0ZSBpdCBiZWZvcmUgYWRkaW5nIGEgbmV3IG9uZSFgO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLkFscmVhZHlFeGlzdGVudFxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gZ2VuZXJhdGUgYSB1bmlxdWUgYXBwbGljYXRpb24gaWRlbnRpZmllciBmb3IgdGhlIGNhcmQsIHRvIGJlIHBhc3NlZCBpbiB0byBPbGl2ZSBhcyB0aGUgXCJyZWZlcmVuY2VBcHBJZFwiXG4gICAgICAgICAgICBhZGRDYXJkSW5wdXQuY2FyZC5hcHBsaWNhdGlvbklEID0gdXVpZHY0KCk7XG5cbiAgICAgICAgICAgIC8vIGluaXRpYWxpemUgdGhlIE9saXZlIENsaWVudCBBUEkgaGVyZSwgaW4gb3JkZXIgdG8gY2FsbCB0aGUgYXBwcm9wcmlhdGUgZW5kcG9pbnRzIGZvciB0aGlzIHJlc29sdmVyXG4gICAgICAgICAgICBjb25zdCBvbGl2ZUNsaWVudCA9IG5ldyBPbGl2ZUNsaWVudChwcm9jZXNzLmVudi5FTlZfTkFNRSEsIHJlZ2lvbik7XG5cbiAgICAgICAgICAgIC8vIGZpcnN0IGV4ZWN1dGUgdGhlIG1lbWJlciB1cGRhdGUgY2FsbCwgdG8gcmUtYWN0aXZhdGUgdGhlIG1lbWJlclxuICAgICAgICAgICAgY29uc3QgdXBkYXRlTWVtYmVyUmVzcG9uc2U6IE1lbWJlclJlc3BvbnNlID0gYXdhaXQgb2xpdmVDbGllbnQudXBkYXRlTWVtYmVyU3RhdHVzKGFkZENhcmRJbnB1dC5pZCwgYWRkQ2FyZElucHV0Lm1lbWJlcklkLCB0cnVlLCBhZGRDYXJkSW5wdXQudXBkYXRlZEF0ISk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGUgdXBkYXRlIG1lbWJlciBzdGF0dXMgY2FsbCB3YXMgZXhlY3V0ZWQgc3VjY2Vzc2Z1bGx5XG4gICAgICAgICAgICBpZiAodXBkYXRlTWVtYmVyUmVzcG9uc2UgJiYgIXVwZGF0ZU1lbWJlclJlc3BvbnNlLmVycm9yTWVzc2FnZSAmJiAhdXBkYXRlTWVtYmVyUmVzcG9uc2UuZXJyb3JUeXBlXG4gICAgICAgICAgICAgICAgJiYgdXBkYXRlTWVtYmVyUmVzcG9uc2UuZGF0YSAmJiB1cGRhdGVNZW1iZXJSZXNwb25zZS5kYXRhLmlzQWN0aXZlID09PSB0cnVlXG4gICAgICAgICAgICAgICAgJiYgdXBkYXRlTWVtYmVyUmVzcG9uc2UuZGF0YS5pZCA9PT0gYWRkQ2FyZElucHV0LmlkICYmIHVwZGF0ZU1lbWJlclJlc3BvbnNlLmRhdGEubWVtYmVySWQgPT09IGFkZENhcmRJbnB1dC5tZW1iZXJJZCkge1xuXG4gICAgICAgICAgICAgICAgLy8gdGhlbiBleGVjdXRlIHRoZSBhZGQgY2FyZCBjYWxsLCB0byBhZGQgYSBjYXJkIHRvIHRoZSBtZW1iZXJcbiAgICAgICAgICAgICAgICBjb25zdCBhZGRDYXJkUmVzcG9uc2U6IENhcmRMaW5rUmVzcG9uc2UgPSBhd2FpdCBvbGl2ZUNsaWVudC5hZGRDYXJkKGFkZENhcmRJbnB1dC5pZCwgYWRkQ2FyZElucHV0Lm1lbWJlcklkLCBhZGRDYXJkSW5wdXQudXBkYXRlZEF0ISwgYWRkQ2FyZElucHV0LnVwZGF0ZWRBdCEsIGFkZENhcmRJbnB1dC5jYXJkIGFzIENhcmQpO1xuXG4gICAgICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSBhZGQgY2FyZCBjYWxsIHdhcyBleGVjdXRlZCBzdWNjZXNzZnVsbHlcbiAgICAgICAgICAgICAgICBpZiAoYWRkQ2FyZFJlc3BvbnNlICYmICFhZGRDYXJkUmVzcG9uc2UuZXJyb3JNZXNzYWdlICYmICFhZGRDYXJkUmVzcG9uc2UuZXJyb3JUeXBlICYmIGFkZENhcmRSZXNwb25zZS5kYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnZlcnQgdGhlIGluY29taW5nIGxpbmtlZCBkYXRhIGludG8gYSBDYXJkTGluayBvYmplY3RcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2FyZExpbmtlZFJlc3BvbnNlID0gYWRkQ2FyZFJlc3BvbnNlLmRhdGEgYXMgQ2FyZExpbms7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gZmluYWxseSwgdXBkYXRlIHRoZSBjYXJkIGxpbmtlZCBvYmplY3QsIGJ5IGFkZGluZy9saW5raW5nIGEgbmV3IGNhcmQgdG8gaXRcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgZHluYW1vRGJDbGllbnQuc2VuZChuZXcgVXBkYXRlSXRlbUNvbW1hbmQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5DQVJEX0xJTktJTkdfVEFCTEUhLFxuICAgICAgICAgICAgICAgICAgICAgICAgS2V5OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogYWRkQ2FyZElucHV0LmlkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiI0NBXCI6IFwiY2FyZHNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiNVQVwiOiBcInVwZGF0ZWRBdFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiI1NUXCI6IFwic3RhdHVzXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBFeHByZXNzaW9uQXR0cmlidXRlVmFsdWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCI6bGlzdFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEw6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBNOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjYXJkTGlua2VkUmVzcG9uc2UuY2FyZHNbMF0hLmlkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcGxpY2F0aW9uSUQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNhcmRMaW5rZWRSZXNwb25zZS5jYXJkc1swXSEuYXBwbGljYXRpb25JRFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi4oY2FyZExpbmtlZFJlc3BvbnNlLmNhcmRzWzBdIS5hZGRpdGlvbmFsUHJvZ3JhbUlEICYmIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZGl0aW9uYWxQcm9ncmFtSUQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjYXJkTGlua2VkUmVzcG9uc2UuY2FyZHNbMF0hLmFkZGl0aW9uYWxQcm9ncmFtSUQhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0NDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY2FyZExpbmtlZFJlc3BvbnNlLmNhcmRzWzBdIS5sYXN0NFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjYXJkTGlua2VkUmVzcG9uc2UuY2FyZHNbMF0hLm5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW46IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNhcmRMaW5rZWRSZXNwb25zZS5jYXJkc1swXSEudG9rZW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY2FyZExpbmtlZFJlc3BvbnNlLmNhcmRzWzBdIS50eXBlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiOnVhXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogYWRkQ2FyZElucHV0LnVwZGF0ZWRBdCFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiOnN0XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY2FyZExpbmtlZFJlc3BvbnNlLnN0YXR1c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBVcGRhdGVFeHByZXNzaW9uOiBcIlNFVCAjQ0EgPSA6bGlzdCwgI1VBID0gOnVhLCAjU1QgPSA6c3RcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIFJldHVyblZhbHVlczogXCJVUERBVEVEX05FV1wiXG4gICAgICAgICAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIGNhcmQgcmVzcG9uc2Ugb2JqZWN0XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNhcmRMaW5rZWRSZXNwb25zZS5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZW1iZXJJZDogY2FyZExpbmtlZFJlc3BvbnNlLm1lbWJlcklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIHRoaXMgaXMgbm90IHRoZSBhY3R1YWwgY3JlYXRpb24gZGF0ZSwgYmVjYXVzZSB3ZSdyZSBub3QgaW50ZXJlc3RlZCBpbiByZXR1cm5pbmcgdGhlIGFjY3VyYXRlIG9uZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIChzaW5jZSB3ZSBkb24ndCBtb2RpZnkgaXQsIGFuZCB0aHVzIHdlIGRvbid0IHJldHJpZXZlIGl0IGZyb20gdGhlIGRhdGFiYXNlKSwgYnV0IHJhdGhlciB0aGUgdXBkYXRlIGRhdGUuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEF0OiBjYXJkTGlua2VkUmVzcG9uc2UuY3JlYXRlZEF0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRBdDogY2FyZExpbmtlZFJlc3BvbnNlLnVwZGF0ZWRBdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXJkczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXJkTGlua2VkUmVzcG9uc2UuY2FyZHNbMF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1czogY2FyZExpbmtlZFJlc3BvbnNlLnN0YXR1c1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgVW5leHBlY3RlZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSB0aGUgYWRkIGNhcmQgY2FsbCFgKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBpZiB0aGVyZSBhcmUgZXJyb3JzIGFzc29jaWF0ZWQgd2l0aCBhZGQgY2FyZCBjYWxsLCBqdXN0IHJldHVybiB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgZXJyb3IgdHlwZSBmcm9tIHRoZSB1cHN0cmVhbSBjbGllbnRcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogYWRkQ2FyZFJlc3BvbnNlLmVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogYWRkQ2FyZFJlc3BvbnNlLmVycm9yVHlwZVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFVuZXhwZWN0ZWQgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gdGhlIHVwZGF0ZSBtZW1iZXIgc3RhdHVzIGNhbGwhYCk7XG5cbiAgICAgICAgICAgICAgICAvLyBpZiB0aGVyZSBhcmUgZXJyb3JzIGFzc29jaWF0ZWQgd2l0aCB0aGUgdXBkYXRlIG1lbWJlciBzdGF0dXMgY2FsbCwganVzdCByZXR1cm4gdGhlIGVycm9yIG1lc3NhZ2UgYW5kIGVycm9yIHR5cGUgZnJvbSB0aGUgdXBzdHJlYW0gY2xpZW50XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiB1cGRhdGVNZW1iZXJSZXNwb25zZS5lcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogdXBkYXRlTWVtYmVyUmVzcG9uc2UuZXJyb3JUeXBlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgZXhlY3V0aW5nICR7ZmllbGROYW1lfSBtdXRhdGlvbiAke2Vycn1gO1xuICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICB9XG4gICAgfVxufVxuIl19