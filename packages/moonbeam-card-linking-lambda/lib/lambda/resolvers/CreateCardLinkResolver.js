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
            // if there is an existent link, then it will contain a card, so we will return an error
            const errorMessage = `Pre-existing card already linked. Unlink that one before adding a new one!`;
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
            const oliveClient = new moonbeam_models_1.OliveClient(process.env.ENV_NAME, region, createCardLinkInput.card, createCardLinkInput.id, createCardLinkInput.createdAt, createCardLinkInput.updatedAt);
            const response = await oliveClient.link();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXRlQ2FyZExpbmtSZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL0NyZWF0ZUNhcmRMaW5rUmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsOERBQXdGO0FBQ3hGLCtEQU9tQztBQUNuQywrQkFBa0M7QUFFbEM7Ozs7OztHQU1HO0FBQ0ksTUFBTSxjQUFjLEdBQUcsS0FBSyxFQUFFLG1CQUF3QyxFQUE2QixFQUFFO0lBQ3hHLElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsK0VBQStFO1FBQy9FLElBQUksbUJBQW1CLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSywwQkFBUSxDQUFDLE9BQU8sRUFBRTtZQUNwRCxPQUFPO2dCQUNILFlBQVksRUFBRSwwQkFBMEI7Z0JBQ3hDLFNBQVMsRUFBRSxtQ0FBaUIsQ0FBQyxpQkFBaUI7YUFDakQsQ0FBQTtTQUNKO1FBRUQsNENBQTRDO1FBQzVDLE1BQU0sY0FBYyxHQUFHLElBQUksZ0NBQWMsQ0FBQyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBRTVELG9DQUFvQztRQUNwQyxNQUFNLFNBQVMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzNDLG1CQUFtQixDQUFDLFNBQVMsR0FBRyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQzFHLG1CQUFtQixDQUFDLFNBQVMsR0FBRyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBRTFHOzs7O1dBSUc7UUFDSCxNQUFNLHNCQUFzQixHQUFJLE1BQU0sY0FB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QUMsQ0FBRSxDQUFDLElBQUk7eUNBQ3ZDO3dDQUNELEtBQUssRUFBRTs0Q0FDSCxDQUFDLEVBQUUsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBRSxDQUFDLEtBQUs7eUNBQ3hDO3dDQUNELElBQUksRUFBRTs0Q0FDRixDQUFDLEVBQUUsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBRSxDQUFDLElBQUk7eUNBQ3ZDO3FDQUNKO2lDQUNKOzZCQUNKO3lCQUNKO3FCQUNKO2lCQUNKLENBQUMsQ0FBQyxDQUFDO2dCQUVKLGlDQUFpQztnQkFDakMsT0FBTztvQkFDSCxJQUFJLEVBQUU7d0JBQ0YsRUFBRSxFQUFFLGtCQUFrQixDQUFDLEVBQUU7d0JBQ3pCLFFBQVEsRUFBRSxrQkFBa0IsQ0FBQyxRQUFRO3dCQUNyQyxTQUFTLEVBQUUsbUJBQW1CLENBQUMsU0FBVTt3QkFDekMsU0FBUyxFQUFFLG1CQUFtQixDQUFDLFNBQVU7d0JBQ3pDLEtBQUssRUFBRSxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQVUsQ0FBQztxQkFDaEQ7aUJBQ0osQ0FBQTthQUNKO2lCQUFNO2dCQUNILHNIQUFzSDtnQkFDdEgsT0FBTyxRQUFRLENBQUM7YUFDbkI7U0FDSjtLQUNKO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDVixNQUFNLFlBQVksR0FBRyw0REFBNEQsR0FBRyxFQUFFLENBQUM7UUFDdkYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMxQixPQUFPO1lBQ0gsWUFBWSxFQUFFLFlBQVk7WUFDMUIsU0FBUyxFQUFFLG1DQUFpQixDQUFDLGVBQWU7U0FDL0MsQ0FBQTtLQUNKO0FBQ0wsQ0FBQyxDQUFBO0FBdElZLFFBQUEsY0FBYyxrQkFzSTFCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtEeW5hbW9EQkNsaWVudCwgR2V0SXRlbUNvbW1hbmQsIFB1dEl0ZW1Db21tYW5kfSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LWR5bmFtb2RiXCI7XG5pbXBvcnQge1xuICAgIENhcmQsIENhcmRMaW5rLFxuICAgIENhcmRMaW5rRXJyb3JUeXBlLFxuICAgIENhcmRMaW5rUmVzcG9uc2UsXG4gICAgQ2FyZFR5cGUsXG4gICAgQ3JlYXRlQ2FyZExpbmtJbnB1dCxcbiAgICBPbGl2ZUNsaWVudFxufSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuaW1wb3J0IHt2NCBhcyB1dWlkdjR9IGZyb20gJ3V1aWQnO1xuXG4vKipcbiAqIENyZWF0ZUNhcmRMaW5rIHJlc29sdmVyXG4gKlxuICogQHBhcmFtIGNyZWF0ZUNhcmRMaW5rSW5wdXQgY2FyZCBsaW5rIGlucHV0IG9iamVjdCwgdXNlZCB0byBjcmVhdGUgYSBjYXJkIGxpbmsgb2JqZWN0IGFuZC9vciBhZGQgYSBuZXcgY2FyZCB0b1xuICogYW4gZXhpc3RpbmcgbGlua2luZyBvYmplY3RcbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgQ2FyZExpbmtSZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IGNyZWF0ZUNhcmRMaW5rID0gYXN5bmMgKGNyZWF0ZUNhcmRMaW5rSW5wdXQ6IENyZWF0ZUNhcmRMaW5rSW5wdXQpOiBQcm9taXNlPENhcmRMaW5rUmVzcG9uc2U+ID0+IHtcbiAgICB0cnkge1xuICAgICAgICAvLyByZXRyaWV2aW5nIHRoZSBjdXJyZW50IGZ1bmN0aW9uIHJlZ2lvblxuICAgICAgICBjb25zdCByZWdpb24gPSBwcm9jZXNzLmVudi5BV1NfUkVHSU9OITtcblxuICAgICAgICAvLyBjaGVjayBpZiBhbiBpbnZhbGlkIGNhcmQgdHlwZSBpcyBwYXNzZWQgaW4sIHRoZW4gcmV0dXJuIGFuIGVycm9yIGFjY29yZGluZ2x5XG4gICAgICAgIGlmIChjcmVhdGVDYXJkTGlua0lucHV0LmNhcmQudHlwZSA9PT0gQ2FyZFR5cGUuSW52YWxpZCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBVbnN1cHBvcnRlZCBjYXJkIHNjaGVtZS5gLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuSW52YWxpZENhcmRTY2hlbWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGluaXRpYWxpemluZyB0aGUgRHluYW1vREIgZG9jdW1lbnQgY2xpZW50XG4gICAgICAgIGNvbnN0IGR5bmFtb0RiQ2xpZW50ID0gbmV3IER5bmFtb0RCQ2xpZW50KHtyZWdpb246IHJlZ2lvbn0pO1xuXG4gICAgICAgIC8vIHVwZGF0ZSB0aGUgdGltZXN0YW1wcyBhY2NvcmRpbmdseVxuICAgICAgICBjb25zdCBjcmVhdGVkQXQgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgICAgIGNyZWF0ZUNhcmRMaW5rSW5wdXQuY3JlYXRlZEF0ID0gY3JlYXRlQ2FyZExpbmtJbnB1dC5jcmVhdGVkQXQgPyBjcmVhdGVDYXJkTGlua0lucHV0LmNyZWF0ZWRBdCA6IGNyZWF0ZWRBdDtcbiAgICAgICAgY3JlYXRlQ2FyZExpbmtJbnB1dC51cGRhdGVkQXQgPSBjcmVhdGVDYXJkTGlua0lucHV0LnVwZGF0ZWRBdCA/IGNyZWF0ZUNhcmRMaW5rSW5wdXQudXBkYXRlZEF0IDogY3JlYXRlZEF0O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBjaGVjayB0byBzZWUgaWYgdGhlIHVzZXIgYWxyZWFkeSBoYXMgYSBjYXJkIGVucm9sbGVkIGluLiBJZiB0aGV5IGRvLCB0aGVuIHJldHVybiBhbiBlcnJvciwgc2luY2Ugd2Ugb25seSBkb24ndCB3YW50IHRvIGNyZWF0ZSBhIGJyYW5kLW5ldyBjdXN0b21lclxuICAgICAgICAgKiB3aXRoIGEgbmV3IGNhcmQsIGZvciBhbiBleGlzdGluZyBjdXN0b21lciB3aG9tIGFscmVhZHkgaGFzIGEgbGlua2VkIGNhcmQuIEluIG9yZGVyIHRvIGNoYW5nZSBhIGNhcmQgZm9yIGEgY3VzdG9tZXIsIHdlIHdpbGwgcmVxdWlyZSB0aGVtIHRvIGZpcnN0IGNhbGxcbiAgICAgICAgICogb3VyIGRlbGV0ZUNhcmQgQVBJLCBmb2xsb3dlZCBieSBhZGRDYXJkIEFQSS5cbiAgICAgICAgICovXG4gICAgICAgIGNvbnN0IHByZUV4aXN0aW5nQ2FyZEZvckxpbmsgPSAgYXdhaXQgZHluYW1vRGJDbGllbnQuc2VuZChuZXcgR2V0SXRlbUNvbW1hbmQoe1xuICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5DQVJEX0xJTktJTkdfVEFCTEUhLFxuICAgICAgICAgICAgS2V5OiB7XG4gICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlQ2FyZExpbmtJbnB1dC5pZFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuXG4gICAgICAgIC8vIGlmIHRoZXJlIGlzIGFuIGl0ZW0gcmV0cmlldmVkLCB0aGVuIHdlIG5lZWQgdG8gY2hlY2sgaXRzIGNvbnRlbnRzXG4gICAgICAgIGlmIChwcmVFeGlzdGluZ0NhcmRGb3JMaW5rICYmIHByZUV4aXN0aW5nQ2FyZEZvckxpbmsuSXRlbSkge1xuICAgICAgICAgICAgLy8gaWYgdGhlcmUgaXMgYW4gZXhpc3RlbnQgbGluaywgdGhlbiBpdCB3aWxsIGNvbnRhaW4gYSBjYXJkLCBzbyB3ZSB3aWxsIHJldHVybiBhbiBlcnJvclxuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFByZS1leGlzdGluZyBjYXJkIGFscmVhZHkgbGlua2VkLiBVbmxpbmsgdGhhdCBvbmUgYmVmb3JlIGFkZGluZyBhIG5ldyBvbmUhYDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5BbHJlYWR5RXhpc3RlbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBObyBjYXJkIGxpbmsgZXhpc3RlbnQgaW4gREIgZm9yIHVzZXIgJHtjcmVhdGVDYXJkTGlua0lucHV0LmlkfWApO1xuXG4gICAgICAgICAgICAvLyBnZW5lcmF0ZSBhIHVuaXF1ZSBhcHBsaWNhdGlvbiBpZGVudGlmaWVyIGZvciB0aGUgY2FyZCwgdG8gYmUgcGFzc2VkIGluIHRvIE9saXZlIGFzIHRoZSBcInJlZmVyZW5jZUFwcElkXCJcbiAgICAgICAgICAgIGNyZWF0ZUNhcmRMaW5rSW5wdXQuY2FyZC5hcHBsaWNhdGlvbklEID0gdXVpZHY0KCk7XG5cbiAgICAgICAgICAgIC8vIGNhbGwgdGhlIE9saXZlIENsaWVudCBBUEkgaGVyZSwgaW4gb3JkZXIgdG8gY2FsbCB0aGUgYXBwcm9wcmlhdGUgZW5kcG9pbnRzIGZvciB0aGlzIHJlc29sdmVyXG4gICAgICAgICAgICBjb25zdCBvbGl2ZUNsaWVudCA9IG5ldyBPbGl2ZUNsaWVudChwcm9jZXNzLmVudi5FTlZfTkFNRSEsIHJlZ2lvbiwgY3JlYXRlQ2FyZExpbmtJbnB1dC5jYXJkIGFzIENhcmQsXG4gICAgICAgICAgICAgICAgY3JlYXRlQ2FyZExpbmtJbnB1dC5pZCwgY3JlYXRlQ2FyZExpbmtJbnB1dC5jcmVhdGVkQXQsIGNyZWF0ZUNhcmRMaW5rSW5wdXQudXBkYXRlZEF0KTtcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgb2xpdmVDbGllbnQubGluaygpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIGNhcmQgbGlua2luZyBjYWxsIHdhcyBleGVjdXRlZCBzdWNjZXNzZnVsbHlcbiAgICAgICAgICAgIGlmIChyZXNwb25zZSAmJiAhcmVzcG9uc2UuZXJyb3JNZXNzYWdlICYmICFyZXNwb25zZS5lcnJvclR5cGUgJiYgcmVzcG9uc2UuZGF0YSkge1xuICAgICAgICAgICAgICAgIC8vIGNvbnZlcnQgdGhlIGluY29taW5nIGxpbmtlZCBkYXRhIGludG8gYSBDYXJkTGluayBvYmplY3RcbiAgICAgICAgICAgICAgICBjb25zdCBjYXJkTGlua2VkUmVzcG9uc2UgPSByZXNwb25zZS5kYXRhIGFzIENhcmRMaW5rO1xuXG4gICAgICAgICAgICAgICAgLy8gc3RvcmUgdGhlIGNhcmQgbGlua2luZyBvYmplY3RcbiAgICAgICAgICAgICAgICBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBQdXRJdGVtQ29tbWFuZCh7XG4gICAgICAgICAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuQ0FSRF9MSU5LSU5HX1RBQkxFISxcbiAgICAgICAgICAgICAgICAgICAgSXRlbToge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjYXJkTGlua2VkUmVzcG9uc2UuaWRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBtZW1iZXJJZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNhcmRMaW5rZWRSZXNwb25zZS5tZW1iZXJJZFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZUNhcmRMaW5rSW5wdXQuY3JlYXRlZEF0IVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRBdDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZUNhcmRMaW5rSW5wdXQudXBkYXRlZEF0IVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBNOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY2FyZExpbmtlZFJlc3BvbnNlLmNhcmRzWzBdIS5pZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwbGljYXRpb25JRDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjYXJkTGlua2VkUmVzcG9uc2UuY2FyZHNbMF0hLmFwcGxpY2F0aW9uSURcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLihjYXJkTGlua2VkUmVzcG9uc2UuY2FyZHNbMF0hLmFkZGl0aW9uYWxQcm9ncmFtSUQgJiYge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGRpdGlvbmFsUHJvZ3JhbUlEOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjYXJkTGlua2VkUmVzcG9uc2UuY2FyZHNbMF0hLmFkZGl0aW9uYWxQcm9ncmFtSUQhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0NDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjYXJkTGlua2VkUmVzcG9uc2UuY2FyZHNbMF0hLmxhc3Q0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNhcmRMaW5rZWRSZXNwb25zZS5jYXJkc1swXSEubmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW46IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY2FyZExpbmtlZFJlc3BvbnNlLmNhcmRzWzBdIS50b2tlblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjYXJkTGlua2VkUmVzcG9uc2UuY2FyZHNbMF0hLnR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBjYXJkIGxpbmtpbmcgb2JqZWN0XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNhcmRMaW5rZWRSZXNwb25zZS5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lbWJlcklkOiBjYXJkTGlua2VkUmVzcG9uc2UubWVtYmVySWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IGNyZWF0ZUNhcmRMaW5rSW5wdXQuY3JlYXRlZEF0ISxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRBdDogY3JlYXRlQ2FyZExpbmtJbnB1dC51cGRhdGVkQXQhLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FyZHM6IFtjYXJkTGlua2VkUmVzcG9uc2UuY2FyZHNbMF0hIGFzIENhcmRdXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIGlmIHRoZXJlIGFyZSBlcnJvcnMgYXNzb2NpYXRlZCB3aXRoIHRoZSBjYWxsLCBqdXN0IHJldHVybiB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgZXJyb3IgdHlwZSBmcm9tIHRoZSB1cHN0cmVhbSBjbGllbnRcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgZXhlY3V0aW5nIGNyZWF0ZUNhcmRMaW5rIG11dGF0aW9uICR7ZXJyfWA7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=