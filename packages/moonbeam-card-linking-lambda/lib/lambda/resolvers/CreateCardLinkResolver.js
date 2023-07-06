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
            return {
                errorMessage: `Unsupported card scheme.`,
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
         * with a new card, for an existing customer whom already has a linked card. In order to change a card for a customer, we will require them to first call
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
        // if there is an item retrieved, then we need to check its contents
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
                        cards: [cardLinkedResponse.cards[0]]
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXRlQ2FyZExpbmtSZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL0NyZWF0ZUNhcmRMaW5rUmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsOERBQXdGO0FBQ3hGLCtEQVFtQztBQUNuQywrQkFBa0M7QUFFbEM7Ozs7Ozs7R0FPRztBQUNJLE1BQU0sY0FBYyxHQUFHLEtBQUssRUFBRSxTQUFpQixFQUFFLG1CQUF3QyxFQUE2QixFQUFFO0lBQzNILElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsK0VBQStFO1FBQy9FLElBQUksbUJBQW1CLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSywwQkFBUSxDQUFDLE9BQU8sRUFBRTtZQUNwRCxPQUFPO2dCQUNILFlBQVksRUFBRSwwQkFBMEI7Z0JBQ3hDLFNBQVMsRUFBRSxtQ0FBaUIsQ0FBQyxpQkFBaUI7YUFDakQsQ0FBQTtTQUNKO1FBRUQsNENBQTRDO1FBQzVDLE1BQU0sY0FBYyxHQUFHLElBQUksZ0NBQWMsQ0FBQyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBRTVELG9DQUFvQztRQUNwQyxNQUFNLFNBQVMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzNDLG1CQUFtQixDQUFDLFNBQVMsR0FBRyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQzFHLG1CQUFtQixDQUFDLFNBQVMsR0FBRyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBRTFHOzs7O1dBSUc7UUFDSCxNQUFNLHNCQUFzQixH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LENBQUMsQ0FBQTtBQW5KWSxRQUFBLGNBQWMsa0JBbUoxQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RHluYW1vREJDbGllbnQsIEdldEl0ZW1Db21tYW5kLCBQdXRJdGVtQ29tbWFuZH0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1keW5hbW9kYlwiO1xuaW1wb3J0IHtcbiAgICBDYXJkLFxuICAgIENhcmRMaW5rLFxuICAgIENhcmRMaW5rRXJyb3JUeXBlLFxuICAgIENhcmRMaW5rUmVzcG9uc2UsXG4gICAgQ2FyZFR5cGUsXG4gICAgQ3JlYXRlQ2FyZExpbmtJbnB1dCxcbiAgICBPbGl2ZUNsaWVudFxufSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuaW1wb3J0IHt2NCBhcyB1dWlkdjR9IGZyb20gJ3V1aWQnO1xuXG4vKipcbiAqIENyZWF0ZUNhcmRMaW5rIHJlc29sdmVyXG4gKlxuICogQHBhcmFtIGZpZWxkTmFtZSBuYW1lIG9mIHRoZSByZXNvbHZlciBwYXRoIGZyb20gdGhlIEFwcFN5bmMgZXZlbnRcbiAqIEBwYXJhbSBjcmVhdGVDYXJkTGlua0lucHV0IGNhcmQgbGluayBpbnB1dCBvYmplY3QsIHVzZWQgdG8gY3JlYXRlIGEgY2FyZCBsaW5rIG9iamVjdCBhbmQvb3IgYWRkIGEgbmV3IGNhcmQgdG9cbiAqIGFuIGV4aXN0aW5nIGxpbmtpbmcgb2JqZWN0XG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIENhcmRMaW5rUmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCBjcmVhdGVDYXJkTGluayA9IGFzeW5jIChmaWVsZE5hbWU6IHN0cmluZywgY3JlYXRlQ2FyZExpbmtJbnB1dDogQ3JlYXRlQ2FyZExpbmtJbnB1dCk6IFByb21pc2U8Q2FyZExpbmtSZXNwb25zZT4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgIC8vIGNoZWNrIGlmIGFuIGludmFsaWQgY2FyZCB0eXBlIGlzIHBhc3NlZCBpbiwgdGhlbiByZXR1cm4gYW4gZXJyb3IgYWNjb3JkaW5nbHlcbiAgICAgICAgaWYgKGNyZWF0ZUNhcmRMaW5rSW5wdXQuY2FyZC50eXBlID09PSBDYXJkVHlwZS5JbnZhbGlkKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogYFVuc3VwcG9ydGVkIGNhcmQgc2NoZW1lLmAsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5JbnZhbGlkQ2FyZFNjaGVtZVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gaW5pdGlhbGl6aW5nIHRoZSBEeW5hbW9EQiBkb2N1bWVudCBjbGllbnRcbiAgICAgICAgY29uc3QgZHluYW1vRGJDbGllbnQgPSBuZXcgRHluYW1vREJDbGllbnQoe3JlZ2lvbjogcmVnaW9ufSk7XG5cbiAgICAgICAgLy8gdXBkYXRlIHRoZSB0aW1lc3RhbXBzIGFjY29yZGluZ2x5XG4gICAgICAgIGNvbnN0IGNyZWF0ZWRBdCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICAgICAgY3JlYXRlQ2FyZExpbmtJbnB1dC5jcmVhdGVkQXQgPSBjcmVhdGVDYXJkTGlua0lucHV0LmNyZWF0ZWRBdCA/IGNyZWF0ZUNhcmRMaW5rSW5wdXQuY3JlYXRlZEF0IDogY3JlYXRlZEF0O1xuICAgICAgICBjcmVhdGVDYXJkTGlua0lucHV0LnVwZGF0ZWRBdCA9IGNyZWF0ZUNhcmRMaW5rSW5wdXQudXBkYXRlZEF0ID8gY3JlYXRlQ2FyZExpbmtJbnB1dC51cGRhdGVkQXQgOiBjcmVhdGVkQXQ7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIGNoZWNrIHRvIHNlZSBpZiB0aGUgdXNlciBhbHJlYWR5IGhhcyBhIGNhcmQgZW5yb2xsZWQgaW4uIElmIHRoZXkgZG8sIHRoZW4gcmV0dXJuIGFuIGVycm9yLCBzaW5jZSB3ZSBvbmx5IGRvbid0IHdhbnQgdG8gY3JlYXRlIGEgYnJhbmQtbmV3IGN1c3RvbWVyXG4gICAgICAgICAqIHdpdGggYSBuZXcgY2FyZCwgZm9yIGFuIGV4aXN0aW5nIGN1c3RvbWVyIHdob20gYWxyZWFkeSBoYXMgYSBsaW5rZWQgY2FyZC4gSW4gb3JkZXIgdG8gY2hhbmdlIGEgY2FyZCBmb3IgYSBjdXN0b21lciwgd2Ugd2lsbCByZXF1aXJlIHRoZW0gdG8gZmlyc3QgY2FsbFxuICAgICAgICAgKiBvdXIgZGVsZXRlQ2FyZCBBUEksIGZvbGxvd2VkIGJ5IGFkZENhcmQgQVBJLlxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3QgcHJlRXhpc3RpbmdDYXJkRm9yTGluayA9ICBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBHZXRJdGVtQ29tbWFuZCh7XG4gICAgICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52LkNBUkRfTElOS0lOR19UQUJMRSEsXG4gICAgICAgICAgICBLZXk6IHtcbiAgICAgICAgICAgICAgICBpZDoge1xuICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVDYXJkTGlua0lucHV0LmlkXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogd2UncmUgbm90IGludGVyZXN0ZWQgaW4gZ2V0dGluZyBhbGwgdGhlIGRhdGEgZm9yIHRoaXMgY2FsbCwganVzdCB0aGUgbWluaW11bSBmb3IgdXMgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdGhpcyBpcyBhIGR1cGxpY2F0ZSBvciBub3RcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBAbGluayBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vYW1hem9uZHluYW1vZGIvbGF0ZXN0L2RldmVsb3Blcmd1aWRlL1Jlc2VydmVkV29yZHMuaHRtbFxuICAgICAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2FtYXpvbmR5bmFtb2RiL2xhdGVzdC9kZXZlbG9wZXJndWlkZS9FeHByZXNzaW9ucy5FeHByZXNzaW9uQXR0cmlidXRlTmFtZXMuaHRtbFxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBQcm9qZWN0aW9uRXhwcmVzc2lvbjogJyNpZGYnLFxuICAgICAgICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzOiB7XG4gICAgICAgICAgICAgICAgJyNpZGYnOiAnaWQnXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKTtcblxuICAgICAgICAvLyBpZiB0aGVyZSBpcyBhbiBpdGVtIHJldHJpZXZlZCwgdGhlbiB3ZSBuZWVkIHRvIGNoZWNrIGl0cyBjb250ZW50c1xuICAgICAgICBpZiAocHJlRXhpc3RpbmdDYXJkRm9yTGluayAmJiBwcmVFeGlzdGluZ0NhcmRGb3JMaW5rLkl0ZW0pIHtcbiAgICAgICAgICAgIC8vIGlmIHRoZXJlIGlzIGFuIGV4aXN0ZW50IGxpbmsgb2JqZWN0LCB0aGVuIHdlIGNhbm5vdCBkdXBsaWNhdGUgdGhhdCwgc28gd2Ugd2lsbCByZXR1cm4gYW4gZXJyb3JcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBQcmUtZXhpc3RpbmcgY2FyZCBsaW5rZWQgb2JqZWN0LiBEZWxldGUgaXQgYmVmb3JlIGFkZGluZyBhIG5ldyBvbmUhYDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5BbHJlYWR5RXhpc3RlbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBObyBjYXJkIGxpbmsgZXhpc3RlbnQgaW4gREIgZm9yIHVzZXIgJHtjcmVhdGVDYXJkTGlua0lucHV0LmlkfWApO1xuXG4gICAgICAgICAgICAvLyBnZW5lcmF0ZSBhIHVuaXF1ZSBhcHBsaWNhdGlvbiBpZGVudGlmaWVyIGZvciB0aGUgY2FyZCwgdG8gYmUgcGFzc2VkIGluIHRvIE9saXZlIGFzIHRoZSBcInJlZmVyZW5jZUFwcElkXCJcbiAgICAgICAgICAgIGNyZWF0ZUNhcmRMaW5rSW5wdXQuY2FyZC5hcHBsaWNhdGlvbklEID0gdXVpZHY0KCk7XG5cbiAgICAgICAgICAgIC8vIGluaXRpYWxpemUgdGhlIE9saXZlIENsaWVudCBBUEkgaGVyZSwgaW4gb3JkZXIgdG8gY2FsbCB0aGUgYXBwcm9wcmlhdGUgZW5kcG9pbnRzIGZvciB0aGlzIHJlc29sdmVyXG4gICAgICAgICAgICBjb25zdCBvbGl2ZUNsaWVudCA9IG5ldyBPbGl2ZUNsaWVudChwcm9jZXNzLmVudi5FTlZfTkFNRSEsIHJlZ2lvbik7XG5cbiAgICAgICAgICAgIC8vIGV4ZWN1dGUgdGhlIG1lbWJlciBsaW5raW5nL2Vucm9sbG1lbnQgY2FsbFxuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2U6IENhcmRMaW5rUmVzcG9uc2UgPSBhd2FpdCBvbGl2ZUNsaWVudC5saW5rKGNyZWF0ZUNhcmRMaW5rSW5wdXQuaWQsIGNyZWF0ZUNhcmRMaW5rSW5wdXQuY3JlYXRlZEF0LCBjcmVhdGVDYXJkTGlua0lucHV0LnVwZGF0ZWRBdCwgY3JlYXRlQ2FyZExpbmtJbnB1dC5jYXJkIGFzIENhcmQpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIGNhcmQgbGlua2luZyBjYWxsIHdhcyBleGVjdXRlZCBzdWNjZXNzZnVsbHlcbiAgICAgICAgICAgIGlmIChyZXNwb25zZSAmJiAhcmVzcG9uc2UuZXJyb3JNZXNzYWdlICYmICFyZXNwb25zZS5lcnJvclR5cGUgJiYgcmVzcG9uc2UuZGF0YSkge1xuICAgICAgICAgICAgICAgIC8vIGNvbnZlcnQgdGhlIGluY29taW5nIGxpbmtlZCBkYXRhIGludG8gYSBDYXJkTGluayBvYmplY3RcbiAgICAgICAgICAgICAgICBjb25zdCBjYXJkTGlua2VkUmVzcG9uc2UgPSByZXNwb25zZS5kYXRhIGFzIENhcmRMaW5rO1xuXG4gICAgICAgICAgICAgICAgLy8gc3RvcmUgdGhlIGNhcmQgbGlua2luZyBvYmplY3RcbiAgICAgICAgICAgICAgICBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBQdXRJdGVtQ29tbWFuZCh7XG4gICAgICAgICAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuQ0FSRF9MSU5LSU5HX1RBQkxFISxcbiAgICAgICAgICAgICAgICAgICAgSXRlbToge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjYXJkTGlua2VkUmVzcG9uc2UuaWRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBtZW1iZXJJZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNhcmRMaW5rZWRSZXNwb25zZS5tZW1iZXJJZFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZUNhcmRMaW5rSW5wdXQuY3JlYXRlZEF0IVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRBdDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZUNhcmRMaW5rSW5wdXQudXBkYXRlZEF0IVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBNOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY2FyZExpbmtlZFJlc3BvbnNlLmNhcmRzWzBdIS5pZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwbGljYXRpb25JRDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjYXJkTGlua2VkUmVzcG9uc2UuY2FyZHNbMF0hLmFwcGxpY2F0aW9uSURcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLihjYXJkTGlua2VkUmVzcG9uc2UuY2FyZHNbMF0hLmFkZGl0aW9uYWxQcm9ncmFtSUQgJiYge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGRpdGlvbmFsUHJvZ3JhbUlEOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjYXJkTGlua2VkUmVzcG9uc2UuY2FyZHNbMF0hLmFkZGl0aW9uYWxQcm9ncmFtSUQhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0NDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjYXJkTGlua2VkUmVzcG9uc2UuY2FyZHNbMF0hLmxhc3Q0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNhcmRMaW5rZWRSZXNwb25zZS5jYXJkc1swXSEubmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW46IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY2FyZExpbmtlZFJlc3BvbnNlLmNhcmRzWzBdIS50b2tlblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjYXJkTGlua2VkUmVzcG9uc2UuY2FyZHNbMF0hLnR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBjYXJkIGxpbmtpbmcgb2JqZWN0XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNhcmRMaW5rZWRSZXNwb25zZS5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lbWJlcklkOiBjYXJkTGlua2VkUmVzcG9uc2UubWVtYmVySWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IGNyZWF0ZUNhcmRMaW5rSW5wdXQuY3JlYXRlZEF0ISxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRBdDogY3JlYXRlQ2FyZExpbmtJbnB1dC51cGRhdGVkQXQhLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FyZHM6IFtjYXJkTGlua2VkUmVzcG9uc2UuY2FyZHNbMF0hIGFzIENhcmRdXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBVbmV4cGVjdGVkIGVycm9yIHJldHVybmVkIGZyb20gdGhlIGxpbmtpbmcgY2FsbCFgKTtcblxuICAgICAgICAgICAgICAgIC8vIGlmIHRoZXJlIGFyZSBlcnJvcnMgYXNzb2NpYXRlZCB3aXRoIHRoZSBjYWxsLCBqdXN0IHJldHVybiB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgZXJyb3IgdHlwZSBmcm9tIHRoZSB1cHN0cmVhbSBjbGllbnRcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgZXhlY3V0aW5nICR7ZmllbGROYW1lfSBtdXRhdGlvbiAke2Vycn1gO1xuICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICB9XG4gICAgfVxufVxuIl19