"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCardLink = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const uuid_1 = require("uuid");
/**
 * CreateCardLink resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param createCardLinkInput card link input object, used to create a card link object and/or add a new card to
 * an existing linking object
 * @returns {@link Promise} of {@link CardLinkResponse}
 */
const createCardLink = async (fieldName, createCardLinkInput) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        // check if an invalid card type is passed in, then return an error accordingly
        if (createCardLinkInput.card.type === moonbeam_models_1.CardType.Invalid) {
            const errorMessage = `Unsupported card scheme.`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.CardLinkErrorType.InvalidCardScheme
            };
        }
        // initializing the DynamoDB document client
        const dynamoDbClient = new client_dynamodb_1.DynamoDBClient({ region: region });
        // update the timestamps accordingly
        const createdAt = new Date().toISOString();
        createCardLinkInput.createdAt = createCardLinkInput.createdAt ? createCardLinkInput.createdAt : createdAt;
        createCardLinkInput.updatedAt = createCardLinkInput.updatedAt ? createCardLinkInput.updatedAt : createdAt;
        /**
         * check to see if the user already has a card enrolled in. If they do, then return an error, since we only don't want to create a brand-new customer
         * with a new card, for an existing customer whom already has a linked card. In order to change/add a card for a customer, we will require them to first call
         * our deleteCard API, followed by addCard API.
         */
        const preExistingCardForLink = await dynamoDbClient.send(new client_dynamodb_1.GetItemCommand({
            TableName: process.env.CARD_LINKING_TABLE,
            Key: {
                id: {
                    S: createCardLinkInput.id
                }
            },
            /**
             * we're not interested in getting all the data for this call, just the minimum for us to determine whether this is a duplicate or not
             *
             * @link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html
             * @link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ExpressionAttributeNames.html
             */
            ProjectionExpression: '#idf',
            ExpressionAttributeNames: {
                '#idf': 'id'
            }
        }));
        // if there is an item retrieved, then we return an error
        if (preExistingCardForLink && preExistingCardForLink.Item) {
            // if there is an existent link object, then we cannot duplicate that, so we will return an error
            const errorMessage = `Pre-existing card linked object. Delete it before adding a new one!`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.CardLinkErrorType.AlreadyExistent
            };
        }
        else {
            console.log(`No card link existent in DB for user ${createCardLinkInput.id}`);
            // generate a unique application identifier for the card, to be passed in to Olive as the "referenceAppId"
            createCardLinkInput.card.applicationID = (0, uuid_1.v4)();
            // initialize the Olive Client API here, in order to call the appropriate endpoints for this resolver
            const oliveClient = new moonbeam_models_1.OliveClient(process.env.ENV_NAME, region);
            // execute the member linking/enrollment call
            const response = await oliveClient.link(createCardLinkInput.id, createCardLinkInput.createdAt, createCardLinkInput.updatedAt, createCardLinkInput.card);
            // check to see if the card linking call was executed successfully
            if (response && !response.errorMessage && !response.errorType && response.data) {
                // convert the incoming linked data into a CardLink object
                const cardLinkedResponse = response.data;
                // store the card linking object
                await dynamoDbClient.send(new client_dynamodb_1.PutItemCommand({
                    TableName: process.env.CARD_LINKING_TABLE,
                    Item: {
                        id: {
                            S: cardLinkedResponse.id
                        },
                        memberId: {
                            S: cardLinkedResponse.memberId
                        },
                        createdAt: {
                            S: createCardLinkInput.createdAt
                        },
                        updatedAt: {
                            S: createCardLinkInput.updatedAt
                        },
                        status: {
                            S: cardLinkedResponse.status
                        },
                        cards: {
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
                        }
                    },
                }));
                // return the card linking object
                return {
                    data: {
                        id: cardLinkedResponse.id,
                        memberId: cardLinkedResponse.memberId,
                        createdAt: createCardLinkInput.createdAt,
                        updatedAt: createCardLinkInput.updatedAt,
                        cards: [cardLinkedResponse.cards[0]],
                        status: cardLinkedResponse.status
                    }
                };
            }
            else {
                console.log(`Unexpected error returned from the linking call!`);
                // if there are errors associated with the call, just return the error message and error type from the upstream client
                return response;
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
exports.createCardLink = createCardLink;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXRlQ2FyZExpbmtSZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL0NyZWF0ZUNhcmRMaW5rUmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsOERBQXdGO0FBQ3hGLCtEQVFtQztBQUNuQywrQkFBa0M7QUFFbEM7Ozs7Ozs7R0FPRztBQUNJLE1BQU0sY0FBYyxHQUFHLEtBQUssRUFBRSxTQUFpQixFQUFFLG1CQUF3QyxFQUE2QixFQUFFO0lBQzNILElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsK0VBQStFO1FBQy9FLElBQUksbUJBQW1CLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSywwQkFBUSxDQUFDLE9BQU8sRUFBRTtZQUNwRCxNQUFNLFlBQVksR0FBRywwQkFBMEIsQ0FBQztZQUNoRCxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRTFCLE9BQU87Z0JBQ0gsWUFBWSxFQUFFLFlBQVk7Z0JBQzFCLFNBQVMsRUFBRSxtQ0FBaUIsQ0FBQyxpQkFBaUI7YUFDakQsQ0FBQTtTQUNKO1FBRUQsNENBQTRDO1FBQzVDLE1BQU0sY0FBYyxHQUFHLElBQUksZ0NBQWMsQ0FBQyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBRTVELG9DQUFvQztRQUNwQyxNQUFNLFNBQVMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzNDLG1CQUFtQixDQUFDLFNBQVMsR0FBRyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQzFHLG1CQUFtQixDQUFDLFNBQVMsR0FBRyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLG1C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R0FBRyxvQ0FBb0MsU0FBUyxhQUFhLEdBQUcsRUFBRSxDQUFDO1FBQ3JGLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDMUIsT0FBTztZQUNILFlBQVksRUFBRSxZQUFZO1lBQzFCLFNBQVMsRUFBRSxtQ0FBaUIsQ0FBQyxlQUFlO1NBQy9DLENBQUE7S0FDSjtBQUNMLENBQUMsQ0FBQTtBQTFKWSxRQUFBLGNBQWMsa0JBMEoxQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RHluYW1vREJDbGllbnQsIEdldEl0ZW1Db21tYW5kLCBQdXRJdGVtQ29tbWFuZH0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1keW5hbW9kYlwiO1xuaW1wb3J0IHtcbiAgICBDYXJkLFxuICAgIENhcmRMaW5rLFxuICAgIENhcmRMaW5rRXJyb3JUeXBlLFxuICAgIENhcmRMaW5rUmVzcG9uc2UsXG4gICAgQ2FyZFR5cGUsXG4gICAgQ3JlYXRlQ2FyZExpbmtJbnB1dCxcbiAgICBPbGl2ZUNsaWVudFxufSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuaW1wb3J0IHt2NCBhcyB1dWlkdjR9IGZyb20gJ3V1aWQnO1xuXG4vKipcbiAqIENyZWF0ZUNhcmRMaW5rIHJlc29sdmVyXG4gKlxuICogQHBhcmFtIGZpZWxkTmFtZSBuYW1lIG9mIHRoZSByZXNvbHZlciBwYXRoIGZyb20gdGhlIEFwcFN5bmMgZXZlbnRcbiAqIEBwYXJhbSBjcmVhdGVDYXJkTGlua0lucHV0IGNhcmQgbGluayBpbnB1dCBvYmplY3QsIHVzZWQgdG8gY3JlYXRlIGEgY2FyZCBsaW5rIG9iamVjdCBhbmQvb3IgYWRkIGEgbmV3IGNhcmQgdG9cbiAqIGFuIGV4aXN0aW5nIGxpbmtpbmcgb2JqZWN0XG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIENhcmRMaW5rUmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCBjcmVhdGVDYXJkTGluayA9IGFzeW5jIChmaWVsZE5hbWU6IHN0cmluZywgY3JlYXRlQ2FyZExpbmtJbnB1dDogQ3JlYXRlQ2FyZExpbmtJbnB1dCk6IFByb21pc2U8Q2FyZExpbmtSZXNwb25zZT4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgIC8vIGNoZWNrIGlmIGFuIGludmFsaWQgY2FyZCB0eXBlIGlzIHBhc3NlZCBpbiwgdGhlbiByZXR1cm4gYW4gZXJyb3IgYWNjb3JkaW5nbHlcbiAgICAgICAgaWYgKGNyZWF0ZUNhcmRMaW5rSW5wdXQuY2FyZC50eXBlID09PSBDYXJkVHlwZS5JbnZhbGlkKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5zdXBwb3J0ZWQgY2FyZCBzY2hlbWUuYDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5JbnZhbGlkQ2FyZFNjaGVtZVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gaW5pdGlhbGl6aW5nIHRoZSBEeW5hbW9EQiBkb2N1bWVudCBjbGllbnRcbiAgICAgICAgY29uc3QgZHluYW1vRGJDbGllbnQgPSBuZXcgRHluYW1vREJDbGllbnQoe3JlZ2lvbjogcmVnaW9ufSk7XG5cbiAgICAgICAgLy8gdXBkYXRlIHRoZSB0aW1lc3RhbXBzIGFjY29yZGluZ2x5XG4gICAgICAgIGNvbnN0IGNyZWF0ZWRBdCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICAgICAgY3JlYXRlQ2FyZExpbmtJbnB1dC5jcmVhdGVkQXQgPSBjcmVhdGVDYXJkTGlua0lucHV0LmNyZWF0ZWRBdCA/IGNyZWF0ZUNhcmRMaW5rSW5wdXQuY3JlYXRlZEF0IDogY3JlYXRlZEF0O1xuICAgICAgICBjcmVhdGVDYXJkTGlua0lucHV0LnVwZGF0ZWRBdCA9IGNyZWF0ZUNhcmRMaW5rSW5wdXQudXBkYXRlZEF0ID8gY3JlYXRlQ2FyZExpbmtJbnB1dC51cGRhdGVkQXQgOiBjcmVhdGVkQXQ7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIGNoZWNrIHRvIHNlZSBpZiB0aGUgdXNlciBhbHJlYWR5IGhhcyBhIGNhcmQgZW5yb2xsZWQgaW4uIElmIHRoZXkgZG8sIHRoZW4gcmV0dXJuIGFuIGVycm9yLCBzaW5jZSB3ZSBvbmx5IGRvbid0IHdhbnQgdG8gY3JlYXRlIGEgYnJhbmQtbmV3IGN1c3RvbWVyXG4gICAgICAgICAqIHdpdGggYSBuZXcgY2FyZCwgZm9yIGFuIGV4aXN0aW5nIGN1c3RvbWVyIHdob20gYWxyZWFkeSBoYXMgYSBsaW5rZWQgY2FyZC4gSW4gb3JkZXIgdG8gY2hhbmdlL2FkZCBhIGNhcmQgZm9yIGEgY3VzdG9tZXIsIHdlIHdpbGwgcmVxdWlyZSB0aGVtIHRvIGZpcnN0IGNhbGxcbiAgICAgICAgICogb3VyIGRlbGV0ZUNhcmQgQVBJLCBmb2xsb3dlZCBieSBhZGRDYXJkIEFQSS5cbiAgICAgICAgICovXG4gICAgICAgIGNvbnN0IHByZUV4aXN0aW5nQ2FyZEZvckxpbmsgPSAgYXdhaXQgZHluYW1vRGJDbGllbnQuc2VuZChuZXcgR2V0SXRlbUNvbW1hbmQoe1xuICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5DQVJEX0xJTktJTkdfVEFCTEUhLFxuICAgICAgICAgICAgS2V5OiB7XG4gICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlQ2FyZExpbmtJbnB1dC5pZFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIHdlJ3JlIG5vdCBpbnRlcmVzdGVkIGluIGdldHRpbmcgYWxsIHRoZSBkYXRhIGZvciB0aGlzIGNhbGwsIGp1c3QgdGhlIG1pbmltdW0gZm9yIHVzIHRvIGRldGVybWluZSB3aGV0aGVyIHRoaXMgaXMgYSBkdXBsaWNhdGUgb3Igbm90XG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2FtYXpvbmR5bmFtb2RiL2xhdGVzdC9kZXZlbG9wZXJndWlkZS9SZXNlcnZlZFdvcmRzLmh0bWxcbiAgICAgICAgICAgICAqIEBsaW5rIGh0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9hbWF6b25keW5hbW9kYi9sYXRlc3QvZGV2ZWxvcGVyZ3VpZGUvRXhwcmVzc2lvbnMuRXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzLmh0bWxcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgUHJvamVjdGlvbkV4cHJlc3Npb246ICcjaWRmJyxcbiAgICAgICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lczoge1xuICAgICAgICAgICAgICAgICcjaWRmJzogJ2lkJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG5cbiAgICAgICAgLy8gaWYgdGhlcmUgaXMgYW4gaXRlbSByZXRyaWV2ZWQsIHRoZW4gd2UgcmV0dXJuIGFuIGVycm9yXG4gICAgICAgIGlmIChwcmVFeGlzdGluZ0NhcmRGb3JMaW5rICYmIHByZUV4aXN0aW5nQ2FyZEZvckxpbmsuSXRlbSkge1xuICAgICAgICAgICAgLy8gaWYgdGhlcmUgaXMgYW4gZXhpc3RlbnQgbGluayBvYmplY3QsIHRoZW4gd2UgY2Fubm90IGR1cGxpY2F0ZSB0aGF0LCBzbyB3ZSB3aWxsIHJldHVybiBhbiBlcnJvclxuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFByZS1leGlzdGluZyBjYXJkIGxpbmtlZCBvYmplY3QuIERlbGV0ZSBpdCBiZWZvcmUgYWRkaW5nIGEgbmV3IG9uZSFgO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLkFscmVhZHlFeGlzdGVudFxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYE5vIGNhcmQgbGluayBleGlzdGVudCBpbiBEQiBmb3IgdXNlciAke2NyZWF0ZUNhcmRMaW5rSW5wdXQuaWR9YCk7XG5cbiAgICAgICAgICAgIC8vIGdlbmVyYXRlIGEgdW5pcXVlIGFwcGxpY2F0aW9uIGlkZW50aWZpZXIgZm9yIHRoZSBjYXJkLCB0byBiZSBwYXNzZWQgaW4gdG8gT2xpdmUgYXMgdGhlIFwicmVmZXJlbmNlQXBwSWRcIlxuICAgICAgICAgICAgY3JlYXRlQ2FyZExpbmtJbnB1dC5jYXJkLmFwcGxpY2F0aW9uSUQgPSB1dWlkdjQoKTtcblxuICAgICAgICAgICAgLy8gaW5pdGlhbGl6ZSB0aGUgT2xpdmUgQ2xpZW50IEFQSSBoZXJlLCBpbiBvcmRlciB0byBjYWxsIHRoZSBhcHByb3ByaWF0ZSBlbmRwb2ludHMgZm9yIHRoaXMgcmVzb2x2ZXJcbiAgICAgICAgICAgIGNvbnN0IG9saXZlQ2xpZW50ID0gbmV3IE9saXZlQ2xpZW50KHByb2Nlc3MuZW52LkVOVl9OQU1FISwgcmVnaW9uKTtcblxuICAgICAgICAgICAgLy8gZXhlY3V0ZSB0aGUgbWVtYmVyIGxpbmtpbmcvZW5yb2xsbWVudCBjYWxsXG4gICAgICAgICAgICBjb25zdCByZXNwb25zZTogQ2FyZExpbmtSZXNwb25zZSA9IGF3YWl0IG9saXZlQ2xpZW50LmxpbmsoY3JlYXRlQ2FyZExpbmtJbnB1dC5pZCwgY3JlYXRlQ2FyZExpbmtJbnB1dC5jcmVhdGVkQXQsIGNyZWF0ZUNhcmRMaW5rSW5wdXQudXBkYXRlZEF0LCBjcmVhdGVDYXJkTGlua0lucHV0LmNhcmQgYXMgQ2FyZCk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGUgY2FyZCBsaW5raW5nIGNhbGwgd2FzIGV4ZWN1dGVkIHN1Y2Nlc3NmdWxseVxuICAgICAgICAgICAgaWYgKHJlc3BvbnNlICYmICFyZXNwb25zZS5lcnJvck1lc3NhZ2UgJiYgIXJlc3BvbnNlLmVycm9yVHlwZSAmJiByZXNwb25zZS5kYXRhKSB7XG4gICAgICAgICAgICAgICAgLy8gY29udmVydCB0aGUgaW5jb21pbmcgbGlua2VkIGRhdGEgaW50byBhIENhcmRMaW5rIG9iamVjdFxuICAgICAgICAgICAgICAgIGNvbnN0IGNhcmRMaW5rZWRSZXNwb25zZSA9IHJlc3BvbnNlLmRhdGEgYXMgQ2FyZExpbms7XG5cbiAgICAgICAgICAgICAgICAvLyBzdG9yZSB0aGUgY2FyZCBsaW5raW5nIG9iamVjdFxuICAgICAgICAgICAgICAgIGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IFB1dEl0ZW1Db21tYW5kKHtcbiAgICAgICAgICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5DQVJEX0xJTktJTkdfVEFCTEUhLFxuICAgICAgICAgICAgICAgICAgICBJdGVtOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNhcmRMaW5rZWRSZXNwb25zZS5pZFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lbWJlcklkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY2FyZExpbmtlZFJlc3BvbnNlLm1lbWJlcklkXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEF0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlQ2FyZExpbmtJbnB1dC5jcmVhdGVkQXQhXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlZEF0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlQ2FyZExpbmtJbnB1dC51cGRhdGVkQXQhXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY2FyZExpbmtlZFJlc3BvbnNlLnN0YXR1c1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBNOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY2FyZExpbmtlZFJlc3BvbnNlLmNhcmRzWzBdIS5pZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwbGljYXRpb25JRDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjYXJkTGlua2VkUmVzcG9uc2UuY2FyZHNbMF0hLmFwcGxpY2F0aW9uSURcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLihjYXJkTGlua2VkUmVzcG9uc2UuY2FyZHNbMF0hLmFkZGl0aW9uYWxQcm9ncmFtSUQgJiYge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGRpdGlvbmFsUHJvZ3JhbUlEOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjYXJkTGlua2VkUmVzcG9uc2UuY2FyZHNbMF0hLmFkZGl0aW9uYWxQcm9ncmFtSUQhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0NDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjYXJkTGlua2VkUmVzcG9uc2UuY2FyZHNbMF0hLmxhc3Q0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNhcmRMaW5rZWRSZXNwb25zZS5jYXJkc1swXSEubmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW46IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY2FyZExpbmtlZFJlc3BvbnNlLmNhcmRzWzBdIS50b2tlblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjYXJkTGlua2VkUmVzcG9uc2UuY2FyZHNbMF0hLnR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBjYXJkIGxpbmtpbmcgb2JqZWN0XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNhcmRMaW5rZWRSZXNwb25zZS5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lbWJlcklkOiBjYXJkTGlua2VkUmVzcG9uc2UubWVtYmVySWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IGNyZWF0ZUNhcmRMaW5rSW5wdXQuY3JlYXRlZEF0ISxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRBdDogY3JlYXRlQ2FyZExpbmtJbnB1dC51cGRhdGVkQXQhLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FyZHM6IFtjYXJkTGlua2VkUmVzcG9uc2UuY2FyZHNbMF0hIGFzIENhcmRdLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiBjYXJkTGlua2VkUmVzcG9uc2Uuc3RhdHVzXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBVbmV4cGVjdGVkIGVycm9yIHJldHVybmVkIGZyb20gdGhlIGxpbmtpbmcgY2FsbCFgKTtcblxuICAgICAgICAgICAgICAgIC8vIGlmIHRoZXJlIGFyZSBlcnJvcnMgYXNzb2NpYXRlZCB3aXRoIHRoZSBjYWxsLCBqdXN0IHJldHVybiB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgZXJyb3IgdHlwZSBmcm9tIHRoZSB1cHN0cmVhbSBjbGllbnRcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgZXhlY3V0aW5nICR7ZmllbGROYW1lfSBtdXRhdGlvbiAke2Vycn1gO1xuICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICB9XG4gICAgfVxufVxuIl19