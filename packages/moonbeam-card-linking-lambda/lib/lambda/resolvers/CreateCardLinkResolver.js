"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCardLink = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const uuid_1 = require("uuid");
/**
 * CreateCardLink resolver
 *
 * @param createCardLinkInput card link input object, used to create a card link object and/or add a new card to
 * an existing linking object
 * @returns {@link Promise} of {@link CardLinkResponse}
 */
const createCardLink = async (createCardLinkInput) => {
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
            // call the Olive Client API here, in order to call the appropriate endpoints for this resolver
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
                console.log(`Unexpected response structure returned from the linking call!`);
                // if there are errors associated with the call, just return the error message and error type from the upstream client
                return response;
            }
        }
    }
    catch (err) {
        const errorMessage = `Unexpected error while executing createCardLink mutation ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: moonbeam_models_1.CardLinkErrorType.UnexpectedError
        };
    }
};
exports.createCardLink = createCardLink;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXRlQ2FyZExpbmtSZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL0NyZWF0ZUNhcmRMaW5rUmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsOERBQXdGO0FBQ3hGLCtEQVFtQztBQUNuQywrQkFBa0M7QUFFbEM7Ozs7OztHQU1HO0FBQ0ksTUFBTSxjQUFjLEdBQUcsS0FBSyxFQUFFLG1CQUF3QyxFQUE2QixFQUFFO0lBQ3hHLElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsK0VBQStFO1FBQy9FLElBQUksbUJBQW1CLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSywwQkFBUSxDQUFDLE9BQU8sRUFBRTtZQUNwRCxPQUFPO2dCQUNILFlBQVksRUFBRSwwQkFBMEI7Z0JBQ3hDLFNBQVMsRUFBRSxtQ0FBaUIsQ0FBQyxpQkFBaUI7YUFDakQsQ0FBQTtTQUNKO1FBRUQsNENBQTRDO1FBQzVDLE1BQU0sY0FBYyxHQUFHLElBQUksZ0NBQWMsQ0FBQyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBRTVELG9DQUFvQztRQUNwQyxNQUFNLFNBQVMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzNDLG1CQUFtQixDQUFDLFNBQVMsR0FBRyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQzFHLG1CQUFtQixDQUFDLFNBQVMsR0FBRyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBRTFHOzs7O1dBSUc7UUFDSCxNQUFNLHNCQUFzQixHQUFJLE1BQU0sY0FB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b21tYW5kfSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LWR5bmFtb2RiXCI7XG5pbXBvcnQge1xuICAgIENhcmQsXG4gICAgQ2FyZExpbmssXG4gICAgQ2FyZExpbmtFcnJvclR5cGUsXG4gICAgQ2FyZExpbmtSZXNwb25zZSxcbiAgICBDYXJkVHlwZSxcbiAgICBDcmVhdGVDYXJkTGlua0lucHV0LFxuICAgIE9saXZlQ2xpZW50XG59IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5pbXBvcnQge3Y0IGFzIHV1aWR2NH0gZnJvbSAndXVpZCc7XG5cbi8qKlxuICogQ3JlYXRlQ2FyZExpbmsgcmVzb2x2ZXJcbiAqXG4gKiBAcGFyYW0gY3JlYXRlQ2FyZExpbmtJbnB1dCBjYXJkIGxpbmsgaW5wdXQgb2JqZWN0LCB1c2VkIHRvIGNyZWF0ZSBhIGNhcmQgbGluayBvYmplY3QgYW5kL29yIGFkZCBhIG5ldyBjYXJkIHRvXG4gKiBhbiBleGlzdGluZyBsaW5raW5nIG9iamVjdFxuICogQHJldHVybnMge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBDYXJkTGlua1Jlc3BvbnNlfVxuICovXG5leHBvcnQgY29uc3QgY3JlYXRlQ2FyZExpbmsgPSBhc3luYyAoY3JlYXRlQ2FyZExpbmtJbnB1dDogQ3JlYXRlQ2FyZExpbmtJbnB1dCk6IFByb21pc2U8Q2FyZExpbmtSZXNwb25zZT4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgIC8vIGNoZWNrIGlmIGFuIGludmFsaWQgY2FyZCB0eXBlIGlzIHBhc3NlZCBpbiwgdGhlbiByZXR1cm4gYW4gZXJyb3IgYWNjb3JkaW5nbHlcbiAgICAgICAgaWYgKGNyZWF0ZUNhcmRMaW5rSW5wdXQuY2FyZC50eXBlID09PSBDYXJkVHlwZS5JbnZhbGlkKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogYFVuc3VwcG9ydGVkIGNhcmQgc2NoZW1lLmAsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5JbnZhbGlkQ2FyZFNjaGVtZVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gaW5pdGlhbGl6aW5nIHRoZSBEeW5hbW9EQiBkb2N1bWVudCBjbGllbnRcbiAgICAgICAgY29uc3QgZHluYW1vRGJDbGllbnQgPSBuZXcgRHluYW1vREJDbGllbnQoe3JlZ2lvbjogcmVnaW9ufSk7XG5cbiAgICAgICAgLy8gdXBkYXRlIHRoZSB0aW1lc3RhbXBzIGFjY29yZGluZ2x5XG4gICAgICAgIGNvbnN0IGNyZWF0ZWRBdCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICAgICAgY3JlYXRlQ2FyZExpbmtJbnB1dC5jcmVhdGVkQXQgPSBjcmVhdGVDYXJkTGlua0lucHV0LmNyZWF0ZWRBdCA/IGNyZWF0ZUNhcmRMaW5rSW5wdXQuY3JlYXRlZEF0IDogY3JlYXRlZEF0O1xuICAgICAgICBjcmVhdGVDYXJkTGlua0lucHV0LnVwZGF0ZWRBdCA9IGNyZWF0ZUNhcmRMaW5rSW5wdXQudXBkYXRlZEF0ID8gY3JlYXRlQ2FyZExpbmtJbnB1dC51cGRhdGVkQXQgOiBjcmVhdGVkQXQ7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIGNoZWNrIHRvIHNlZSBpZiB0aGUgdXNlciBhbHJlYWR5IGhhcyBhIGNhcmQgZW5yb2xsZWQgaW4uIElmIHRoZXkgZG8sIHRoZW4gcmV0dXJuIGFuIGVycm9yLCBzaW5jZSB3ZSBvbmx5IGRvbid0IHdhbnQgdG8gY3JlYXRlIGEgYnJhbmQtbmV3IGN1c3RvbWVyXG4gICAgICAgICAqIHdpdGggYSBuZXcgY2FyZCwgZm9yIGFuIGV4aXN0aW5nIGN1c3RvbWVyIHdob20gYWxyZWFkeSBoYXMgYSBsaW5rZWQgY2FyZC4gSW4gb3JkZXIgdG8gY2hhbmdlIGEgY2FyZCBmb3IgYSBjdXN0b21lciwgd2Ugd2lsbCByZXF1aXJlIHRoZW0gdG8gZmlyc3QgY2FsbFxuICAgICAgICAgKiBvdXIgZGVsZXRlQ2FyZCBBUEksIGZvbGxvd2VkIGJ5IGFkZENhcmQgQVBJLlxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3QgcHJlRXhpc3RpbmdDYXJkRm9yTGluayA9ICBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBHZXRJdGVtQ29tbWFuZCh7XG4gICAgICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52LkNBUkRfTElOS0lOR19UQUJMRSEsXG4gICAgICAgICAgICBLZXk6IHtcbiAgICAgICAgICAgICAgICBpZDoge1xuICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVDYXJkTGlua0lucHV0LmlkXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG5cbiAgICAgICAgLy8gaWYgdGhlcmUgaXMgYW4gaXRlbSByZXRyaWV2ZWQsIHRoZW4gd2UgbmVlZCB0byBjaGVjayBpdHMgY29udGVudHNcbiAgICAgICAgaWYgKHByZUV4aXN0aW5nQ2FyZEZvckxpbmsgJiYgcHJlRXhpc3RpbmdDYXJkRm9yTGluay5JdGVtKSB7XG4gICAgICAgICAgICAvLyBpZiB0aGVyZSBpcyBhbiBleGlzdGVudCBsaW5rIG9iamVjdCwgdGhlbiB3ZSBjYW5ub3QgZHVwbGljYXRlIHRoYXQsIHNvIHdlIHdpbGwgcmV0dXJuIGFuIGVycm9yXG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgUHJlLWV4aXN0aW5nIGNhcmQgbGlua2VkIG9iamVjdC4gRGVsZXRlIGl0IGJlZm9yZSBhZGRpbmcgYSBuZXcgb25lIWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuQWxyZWFkeUV4aXN0ZW50XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgTm8gY2FyZCBsaW5rIGV4aXN0ZW50IGluIERCIGZvciB1c2VyICR7Y3JlYXRlQ2FyZExpbmtJbnB1dC5pZH1gKTtcblxuICAgICAgICAgICAgLy8gZ2VuZXJhdGUgYSB1bmlxdWUgYXBwbGljYXRpb24gaWRlbnRpZmllciBmb3IgdGhlIGNhcmQsIHRvIGJlIHBhc3NlZCBpbiB0byBPbGl2ZSBhcyB0aGUgXCJyZWZlcmVuY2VBcHBJZFwiXG4gICAgICAgICAgICBjcmVhdGVDYXJkTGlua0lucHV0LmNhcmQuYXBwbGljYXRpb25JRCA9IHV1aWR2NCgpO1xuXG4gICAgICAgICAgICAvLyBjYWxsIHRoZSBPbGl2ZSBDbGllbnQgQVBJIGhlcmUsIGluIG9yZGVyIHRvIGNhbGwgdGhlIGFwcHJvcHJpYXRlIGVuZHBvaW50cyBmb3IgdGhpcyByZXNvbHZlclxuICAgICAgICAgICAgY29uc3Qgb2xpdmVDbGllbnQgPSBuZXcgT2xpdmVDbGllbnQocHJvY2Vzcy5lbnYuRU5WX05BTUUhLCByZWdpb24pO1xuXG4gICAgICAgICAgICAvLyBleGVjdXRlIHRoZSBtZW1iZXIgbGlua2luZy9lbnJvbGxtZW50IGNhbGxcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlOiBDYXJkTGlua1Jlc3BvbnNlID0gYXdhaXQgb2xpdmVDbGllbnQubGluayhjcmVhdGVDYXJkTGlua0lucHV0LmlkLCBjcmVhdGVDYXJkTGlua0lucHV0LmNyZWF0ZWRBdCwgY3JlYXRlQ2FyZExpbmtJbnB1dC51cGRhdGVkQXQsIGNyZWF0ZUNhcmRMaW5rSW5wdXQuY2FyZCBhcyBDYXJkKTtcblxuICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSBjYXJkIGxpbmtpbmcgY2FsbCB3YXMgZXhlY3V0ZWQgc3VjY2Vzc2Z1bGx5XG4gICAgICAgICAgICBpZiAocmVzcG9uc2UgJiYgIXJlc3BvbnNlLmVycm9yTWVzc2FnZSAmJiAhcmVzcG9uc2UuZXJyb3JUeXBlICYmIHJlc3BvbnNlLmRhdGEpIHtcbiAgICAgICAgICAgICAgICAvLyBjb252ZXJ0IHRoZSBpbmNvbWluZyBsaW5rZWQgZGF0YSBpbnRvIGEgQ2FyZExpbmsgb2JqZWN0XG4gICAgICAgICAgICAgICAgY29uc3QgY2FyZExpbmtlZFJlc3BvbnNlID0gcmVzcG9uc2UuZGF0YSBhcyBDYXJkTGluaztcblxuICAgICAgICAgICAgICAgIC8vIHN0b3JlIHRoZSBjYXJkIGxpbmtpbmcgb2JqZWN0XG4gICAgICAgICAgICAgICAgYXdhaXQgZHluYW1vRGJDbGllbnQuc2VuZChuZXcgUHV0SXRlbUNvbW1hbmQoe1xuICAgICAgICAgICAgICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52LkNBUkRfTElOS0lOR19UQUJMRSEsXG4gICAgICAgICAgICAgICAgICAgIEl0ZW06IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY2FyZExpbmtlZFJlc3BvbnNlLmlkXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVtYmVySWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjYXJkTGlua2VkUmVzcG9uc2UubWVtYmVySWRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVDYXJkTGlua0lucHV0LmNyZWF0ZWRBdCFcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVkQXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVDYXJkTGlua0lucHV0LnVwZGF0ZWRBdCFcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXJkczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEw6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNhcmRMaW5rZWRSZXNwb25zZS5jYXJkc1swXSEuaWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcGxpY2F0aW9uSUQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY2FyZExpbmtlZFJlc3BvbnNlLmNhcmRzWzBdIS5hcHBsaWNhdGlvbklEXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi4oY2FyZExpbmtlZFJlc3BvbnNlLmNhcmRzWzBdIS5hZGRpdGlvbmFsUHJvZ3JhbUlEICYmIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkaXRpb25hbFByb2dyYW1JRDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY2FyZExpbmtlZFJlc3BvbnNlLmNhcmRzWzBdIS5hZGRpdGlvbmFsUHJvZ3JhbUlEIVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdDQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY2FyZExpbmtlZFJlc3BvbnNlLmNhcmRzWzBdIS5sYXN0NFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjYXJkTGlua2VkUmVzcG9uc2UuY2FyZHNbMF0hLm5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRva2VuOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNhcmRMaW5rZWRSZXNwb25zZS5jYXJkc1swXSEudG9rZW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY2FyZExpbmtlZFJlc3BvbnNlLmNhcmRzWzBdIS50eXBlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgY2FyZCBsaW5raW5nIG9iamVjdFxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjYXJkTGlua2VkUmVzcG9uc2UuaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZW1iZXJJZDogY2FyZExpbmtlZFJlc3BvbnNlLm1lbWJlcklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEF0OiBjcmVhdGVDYXJkTGlua0lucHV0LmNyZWF0ZWRBdCEsXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVkQXQ6IGNyZWF0ZUNhcmRMaW5rSW5wdXQudXBkYXRlZEF0ISxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRzOiBbY2FyZExpbmtlZFJlc3BvbnNlLmNhcmRzWzBdISBhcyBDYXJkXVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgVW5leHBlY3RlZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSB0aGUgbGlua2luZyBjYWxsIWApO1xuXG4gICAgICAgICAgICAgICAgLy8gaWYgdGhlcmUgYXJlIGVycm9ycyBhc3NvY2lhdGVkIHdpdGggdGhlIGNhbGwsIGp1c3QgcmV0dXJuIHRoZSBlcnJvciBtZXNzYWdlIGFuZCBlcnJvciB0eXBlIGZyb20gdGhlIHVwc3RyZWFtIGNsaWVudFxuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgY3JlYXRlQ2FyZExpbmsgbXV0YXRpb24gJHtlcnJ9YDtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==