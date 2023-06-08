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
        // initializing the DynamoDB document client
        const dynamoDbClient = new client_dynamodb_1.DynamoDBClient({ region: region });
        // update the timestamps accordingly
        const createdAt = new Date().toISOString();
        createCardLinkInput.card.createdAt = createCardLinkInput.card.createdAt ? createCardLinkInput.card.createdAt : createdAt;
        createCardLinkInput.card.updatedAt = createCardLinkInput.card.updatedAt ? createCardLinkInput.card.updatedAt : createdAt;
        // check to see if the user already has a card enrolled in. If they do, then return an error since we only support one card linking per customer as of now.
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
            // there is no card link available in the DB, so we will create one with the appropriate card.
            // generate a unique identifier for the card, to be passed in to Olive as the enrollment identifier
            createCardLinkInput.card.id = (0, uuid_1.v4)();
            // call the Olive Client API here, in order to call the appropriate endpoints for this resolver
            const oliveClient = new moonbeam_models_1.OliveClient(createCardLinkInput.card, createCardLinkInput.id, process.env.ENV_NAME, region);
            const cardLinkResponse = await oliveClient.link();
            // check to see if the card linking call was executed successfully
            if (cardLinkResponse && !cardLinkResponse.errorMessage && !cardLinkResponse.errorType && cardLinkResponse.data) {
                // store the card linking object
                await dynamoDbClient.send(new client_dynamodb_1.PutItemCommand({
                    TableName: process.env.CARD_LINKING_TABLE,
                    Item: {
                        id: {
                            S: createCardLinkInput.id
                        },
                        cards: {
                            L: [
                                {
                                    M: {
                                        id: {
                                            S: createCardLinkInput.card.id
                                        },
                                        ...(createCardLinkInput.card.additionalProgramID && {
                                            additionalProgramID: {
                                                S: createCardLinkInput.card.additionalProgramID
                                            }
                                        }),
                                        createdAt: {
                                            S: createCardLinkInput.card.createdAt
                                        },
                                        updatedAt: {
                                            S: createCardLinkInput.card.updatedAt
                                        },
                                        last4: {
                                            S: createCardLinkInput.card.last4
                                        },
                                        name: {
                                            S: createCardLinkInput.card.name
                                        },
                                        token: {
                                            S: createCardLinkInput.card.token
                                        },
                                        type: {
                                            S: createCardLinkInput.card.type
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
                        id: createCardLinkInput.id,
                        cards: [createCardLinkInput.card]
                    }
                };
            }
            else {
                // if there are errors associated with the call, just return the error message and error type from the upstream client
                return cardLinkResponse;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXRlQ2FyZExpbmtSZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL0NyZWF0ZUNhcmRMaW5rUmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsOERBQXdGO0FBQ3hGLCtEQUFzSDtBQUN0SCwrQkFBa0M7QUFFbEM7Ozs7OztHQU1HO0FBQ0ksTUFBTSxjQUFjLEdBQUcsS0FBSyxFQUFFLG1CQUF3QyxFQUE2QixFQUFFO0lBQ3hHLElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsNENBQTRDO1FBQzVDLE1BQU0sY0FBYyxHQUFHLElBQUksZ0NBQWMsQ0FBQyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBRTVELG9DQUFvQztRQUNwQyxNQUFNLFNBQVMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzNDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsbUJBQW1CLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQ3pILG1CQUFtQixDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsbUJBQW1CLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBRXpILDJKQUEySjtRQUMzSixNQUFNLHNCQUFzQixHQUFJLE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLGdDQUFjLENBQUM7WUFDekUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQW1CO1lBQzFDLEdBQUcsRUFBRTtnQkFDRCxFQUFF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QVksR0FBRyw0REFBNEQsR0FBRyxFQUFFLENBQUM7UUFDdkYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMxQixPQUFPO1lBQ0gsWUFBWSxFQUFFLFlBQVk7WUFDMUIsU0FBUyxFQUFFLG1DQUFpQixDQUFDLGVBQWU7U0FDL0MsQ0FBQTtLQUNKO0FBQ0wsQ0FBQyxDQUFBO0FBNUdZLFFBQUEsY0FBYyxrQkE0RzFCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtEeW5hbW9EQkNsaWVudCwgR2V0SXRlbUNvbW1hbmQsIFB1dEl0ZW1Db21tYW5kfSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LWR5bmFtb2RiXCI7XG5pbXBvcnQge0NhcmQsIENhcmRMaW5rRXJyb3JUeXBlLCBDYXJkTGlua1Jlc3BvbnNlLCBDcmVhdGVDYXJkTGlua0lucHV0LCBPbGl2ZUNsaWVudH0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcbmltcG9ydCB7djQgYXMgdXVpZHY0fSBmcm9tICd1dWlkJztcblxuLyoqXG4gKiBDcmVhdGVDYXJkTGluayByZXNvbHZlclxuICpcbiAqIEBwYXJhbSBjcmVhdGVDYXJkTGlua0lucHV0IGNhcmQgbGluayBpbnB1dCBvYmplY3QsIHVzZWQgdG8gY3JlYXRlIGEgY2FyZCBsaW5rIG9iamVjdCBhbmQvb3IgYWRkIGEgbmV3IGNhcmQgdG9cbiAqIGFuIGV4aXN0aW5nIGxpbmtpbmcgb2JqZWN0XG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIENhcmRMaW5rUmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCBjcmVhdGVDYXJkTGluayA9IGFzeW5jIChjcmVhdGVDYXJkTGlua0lucHV0OiBDcmVhdGVDYXJkTGlua0lucHV0KTogUHJvbWlzZTxDYXJkTGlua1Jlc3BvbnNlPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gcmV0cmlldmluZyB0aGUgY3VycmVudCBmdW5jdGlvbiByZWdpb25cbiAgICAgICAgY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiE7XG5cbiAgICAgICAgLy8gaW5pdGlhbGl6aW5nIHRoZSBEeW5hbW9EQiBkb2N1bWVudCBjbGllbnRcbiAgICAgICAgY29uc3QgZHluYW1vRGJDbGllbnQgPSBuZXcgRHluYW1vREJDbGllbnQoe3JlZ2lvbjogcmVnaW9ufSk7XG5cbiAgICAgICAgLy8gdXBkYXRlIHRoZSB0aW1lc3RhbXBzIGFjY29yZGluZ2x5XG4gICAgICAgIGNvbnN0IGNyZWF0ZWRBdCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICAgICAgY3JlYXRlQ2FyZExpbmtJbnB1dC5jYXJkLmNyZWF0ZWRBdCA9IGNyZWF0ZUNhcmRMaW5rSW5wdXQuY2FyZC5jcmVhdGVkQXQgPyBjcmVhdGVDYXJkTGlua0lucHV0LmNhcmQuY3JlYXRlZEF0IDogY3JlYXRlZEF0O1xuICAgICAgICBjcmVhdGVDYXJkTGlua0lucHV0LmNhcmQudXBkYXRlZEF0ID0gY3JlYXRlQ2FyZExpbmtJbnB1dC5jYXJkLnVwZGF0ZWRBdCA/IGNyZWF0ZUNhcmRMaW5rSW5wdXQuY2FyZC51cGRhdGVkQXQgOiBjcmVhdGVkQXQ7XG5cbiAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSB1c2VyIGFscmVhZHkgaGFzIGEgY2FyZCBlbnJvbGxlZCBpbi4gSWYgdGhleSBkbywgdGhlbiByZXR1cm4gYW4gZXJyb3Igc2luY2Ugd2Ugb25seSBzdXBwb3J0IG9uZSBjYXJkIGxpbmtpbmcgcGVyIGN1c3RvbWVyIGFzIG9mIG5vdy5cbiAgICAgICAgY29uc3QgcHJlRXhpc3RpbmdDYXJkRm9yTGluayA9ICBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBHZXRJdGVtQ29tbWFuZCh7XG4gICAgICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52LkNBUkRfTElOS0lOR19UQUJMRSEsXG4gICAgICAgICAgICBLZXk6IHtcbiAgICAgICAgICAgICAgICBpZDoge1xuICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVDYXJkTGlua0lucHV0LmlkXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG4gICAgICAgIC8vIGlmIHRoZXJlIGlzIGFuIGl0ZW0gcmV0cmlldmVkLCB0aGVuIHdlIG5lZWQgdG8gY2hlY2sgaXRzIGNvbnRlbnRzXG4gICAgICAgIGlmIChwcmVFeGlzdGluZ0NhcmRGb3JMaW5rICYmIHByZUV4aXN0aW5nQ2FyZEZvckxpbmsuSXRlbSkge1xuICAgICAgICAgICAgLy8gaWYgdGhlcmUgaXMgYW4gZXhpc3RlbnQgbGluaywgdGhlbiBpdCB3aWxsIGNvbnRhaW4gYSBjYXJkLCBzbyB3ZSB3aWxsIHJldHVybiBhbiBlcnJvclxuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFByZS1leGlzdGluZyBjYXJkIGFscmVhZHkgbGlua2VkLiBVbmxpbmsgdGhhdCBvbmUgYmVmb3JlIGFkZGluZyBhIG5ldyBvbmUhYDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5BbHJlYWR5RXhpc3RlbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIHRoZXJlIGlzIG5vIGNhcmQgbGluayBhdmFpbGFibGUgaW4gdGhlIERCLCBzbyB3ZSB3aWxsIGNyZWF0ZSBvbmUgd2l0aCB0aGUgYXBwcm9wcmlhdGUgY2FyZC5cblxuICAgICAgICAgICAgLy8gZ2VuZXJhdGUgYSB1bmlxdWUgaWRlbnRpZmllciBmb3IgdGhlIGNhcmQsIHRvIGJlIHBhc3NlZCBpbiB0byBPbGl2ZSBhcyB0aGUgZW5yb2xsbWVudCBpZGVudGlmaWVyXG4gICAgICAgICAgICBjcmVhdGVDYXJkTGlua0lucHV0LmNhcmQuaWQgPSB1dWlkdjQoKTtcblxuICAgICAgICAgICAgLy8gY2FsbCB0aGUgT2xpdmUgQ2xpZW50IEFQSSBoZXJlLCBpbiBvcmRlciB0byBjYWxsIHRoZSBhcHByb3ByaWF0ZSBlbmRwb2ludHMgZm9yIHRoaXMgcmVzb2x2ZXJcbiAgICAgICAgICAgIGNvbnN0IG9saXZlQ2xpZW50ID0gbmV3IE9saXZlQ2xpZW50KGNyZWF0ZUNhcmRMaW5rSW5wdXQuY2FyZCBhcyBDYXJkLCBjcmVhdGVDYXJkTGlua0lucHV0LmlkLCBwcm9jZXNzLmVudi5FTlZfTkFNRSEsIHJlZ2lvbik7XG4gICAgICAgICAgICBjb25zdCBjYXJkTGlua1Jlc3BvbnNlID0gYXdhaXQgb2xpdmVDbGllbnQubGluaygpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIGNhcmQgbGlua2luZyBjYWxsIHdhcyBleGVjdXRlZCBzdWNjZXNzZnVsbHlcbiAgICAgICAgICAgIGlmIChjYXJkTGlua1Jlc3BvbnNlICYmICFjYXJkTGlua1Jlc3BvbnNlLmVycm9yTWVzc2FnZSAmJiAhY2FyZExpbmtSZXNwb25zZS5lcnJvclR5cGUgJiYgY2FyZExpbmtSZXNwb25zZS5kYXRhKSB7XG4gICAgICAgICAgICAgICAgLy8gc3RvcmUgdGhlIGNhcmQgbGlua2luZyBvYmplY3RcbiAgICAgICAgICAgICAgICBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBQdXRJdGVtQ29tbWFuZCh7XG4gICAgICAgICAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuQ0FSRF9MSU5LSU5HX1RBQkxFISxcbiAgICAgICAgICAgICAgICAgICAgSXRlbToge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVDYXJkTGlua0lucHV0LmlkXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FyZHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBMOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE06IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVDYXJkTGlua0lucHV0LmNhcmQuaWQhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi4oY3JlYXRlQ2FyZExpbmtJbnB1dC5jYXJkLmFkZGl0aW9uYWxQcm9ncmFtSUQgJiYge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGRpdGlvbmFsUHJvZ3JhbUlEOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVDYXJkTGlua0lucHV0LmNhcmQuYWRkaXRpb25hbFByb2dyYW1JRCFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVDYXJkTGlua0lucHV0LmNhcmQuY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVkQXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlQ2FyZExpbmtJbnB1dC5jYXJkLnVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdDQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlQ2FyZExpbmtJbnB1dC5jYXJkLmxhc3Q0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZUNhcmRMaW5rSW5wdXQuY2FyZC5uYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b2tlbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVDYXJkTGlua0lucHV0LmNhcmQudG9rZW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlQ2FyZExpbmtJbnB1dC5jYXJkLnR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBjYXJkIGxpbmtpbmcgb2JqZWN0XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNyZWF0ZUNhcmRMaW5rSW5wdXQuaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXJkczogW2NyZWF0ZUNhcmRMaW5rSW5wdXQuY2FyZCBhcyBDYXJkXVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBpZiB0aGVyZSBhcmUgZXJyb3JzIGFzc29jaWF0ZWQgd2l0aCB0aGUgY2FsbCwganVzdCByZXR1cm4gdGhlIGVycm9yIG1lc3NhZ2UgYW5kIGVycm9yIHR5cGUgZnJvbSB0aGUgdXBzdHJlYW0gY2xpZW50XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhcmRMaW5rUmVzcG9uc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgZXhlY3V0aW5nIGNyZWF0ZUNhcmRMaW5rIG11dGF0aW9uICR7ZXJyfWA7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=