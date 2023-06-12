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
            console.log(`No card link existent in DB for user ${createCardLinkInput.id}`);
            // generate a unique application identifier for the card, to be passed in to Olive as the "referenceAppId"
            createCardLinkInput.card.applicationID = (0, uuid_1.v4)();
            // call the Olive Client API here, in order to call the appropriate endpoints for this resolver
            const oliveClient = new moonbeam_models_1.OliveClient(createCardLinkInput.card, createCardLinkInput.id, process.env.ENV_NAME, region);
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
                                        createdAt: {
                                            S: cardLinkedResponse.cards[0].createdAt
                                        },
                                        updatedAt: {
                                            S: cardLinkedResponse.cards[0].updatedAt
                                        },
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXRlQ2FyZExpbmtSZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL0NyZWF0ZUNhcmRMaW5rUmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsOERBQXdGO0FBQ3hGLCtEQU9tQztBQUNuQywrQkFBa0M7QUFFbEM7Ozs7OztHQU1HO0FBQ0ksTUFBTSxjQUFjLEdBQUcsS0FBSyxFQUFFLG1CQUF3QyxFQUE2QixFQUFFO0lBQ3hHLElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsK0VBQStFO1FBQy9FLElBQUksbUJBQW1CLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSywwQkFBUSxDQUFDLE9BQU8sRUFBRTtZQUNwRCxPQUFPO2dCQUNILFlBQVksRUFBRSwwQkFBMEI7Z0JBQ3hDLFNBQVMsRUFBRSxtQ0FBaUIsQ0FBQyxpQkFBaUI7YUFDakQsQ0FBQTtTQUNKO1FBRUQsNENBQTRDO1FBQzVDLE1BQU0sY0FBYyxHQUFHLElBQUksZ0NBQWMsQ0FBQyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBRTVELG9DQUFvQztRQUNwQyxNQUFNLFNBQVMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzNDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsbUJBQW1CLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQ3pILG1CQUFtQixDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsbUJBQW1CLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBRXpILDJKQUEySjtRQUMzSixNQUFNLHNCQUFzQixHQUFJLE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLGdDQUFjLENBQUM7WUFDekUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQW1CO1lBQzFDLEdBQUcsRUFBRTtnQkFDRCxFQUFFLEVBQUU7b0JBQ0EsQ0FBQyxFQUFFLG1CQUFtQixDQUFDLEVBQUU7aUJBQzVCO2FBQ0o7U0FDSixDQUFDLENBQUMsQ0FBQztRQUVKLG9FQUFvRTtRQUNwRSxJQUFJLHNCQUFzQixJQUFJLHNCQUFzQixDQUFDLElBQUksRUFBRTtZQUN2RCx3RkFBd0Y7WUFDeEYsTUFBTSxZQUFZLEdBQUcsNEVBQTRFLENBQUM7WUFDbEcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUUxQixPQUFPO2dCQUNILFlBQVksRUFBRSxZQUFZO2dCQUMxQixTQUFTLEVBQUUsbUNBQWlCLENBQUMsZUFBZTthQUMvQyxDQUFBO1NBQ0o7YUFBTTtZQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsd0NBQXdDLG1CQUFtQixDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFFOUUsMEdBQTBHO1lBQzFHLG1CQUFtQixDQUFDLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBQSxTQUFNLEdBQUUsQ0FBQztZQUVsRCwrRkFBK0Y7WUFDL0YsTUFBTSxXQUFXLEdBQUcsSUFBSSw2QkFBVyxDQUFDLG1CQUFtQixDQUFDLElBQVksRUFBRSxtQkFBbUIsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDN0gsTUFBTSxRQUFRLEdBQUcsTUFBTSxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7WUFFMUMsa0VBQWtFO1lBQ2xFLElBQUksUUFBUSxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLElBQUksUUFBUSxDQUFDLElBQUksRUFBRTtnQkFDNUUsMERBQTBEO2dCQUMxRCxNQUFNLGtCQUFrQixHQUFHLFFBQVEsQ0FBQyxJQUFnQixDQUFDO2dCQUVyRCxnQ0FBZ0M7Z0JBQ2hDLE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLGdDQUFjLENBQUM7b0JBQ3pDLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFtQjtvQkFDMUMsSUFBSSxFQUFFO3dCQUNGLEVBQUUsRUFBRTs0QkFDQSxDQUFDLEVBQUUsa0JBQWtCLENBQUMsRUFBRTt5QkFDM0I7d0JBQ0QsUUFBUSxFQUFFOzRCQUNOLENBQUMsRUFBRSxrQkFBa0IsQ0FBQyxRQUFRO3lCQUNqQzt3QkFDRCxLQUFLLEVBQUU7NEJBQ0gsQ0FBQyxFQUFFO2dDQUNDO29DQUNJLENBQUMsRUFBRTt3Q0FDQyxFQUFFLEVBQUU7NENBQ0EsQ0FBQyxFQUFFLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUUsQ0FBQyxFQUFFO3lDQUNyQzt3Q0FDRCxhQUFhLEVBQUU7NENBQ1gsQ0FBQyxFQUFFLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUUsQ0FBQyxhQUFhO3lDQUNoRDt3Q0FDRCxHQUFHLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBRSxDQUFDLG1CQUFtQixJQUFJOzRDQUNwRCxtQkFBbUIsRUFBRTtnREFDakIsQ0FBQyxFQUFFLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUUsQ0FBQyxtQkFBb0I7NkNBQ3ZEO3lDQUNKLENBQUM7d0NBQ0YsU0FBUyxFQUFFOzRDQUNQLENBQUMsRUFBRSxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFFLENBQUMsU0FBUzt5Q0FDNUM7d0NBQ0QsU0FBUyxFQUFFOzRDQUNQLENBQUMsRUFBRSxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFFLENBQUMsU0FBUzt5Q0FDNUM7d0NBQ0QsS0FBSyxFQUFFOzRDQUNILENBQUMsRUFBRSxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFFLENBQUMsS0FBSzt5Q0FDeEM7d0NBQ0QsSUFBSSxFQUFFOzRDQUNGLENBQUMsRUFBRSxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFFLENBQUMsSUFBSTt5Q0FDdkM7d0NBQ0QsS0FBSyxFQUFFOzRDQUNILENBQUMsRUFBRSxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFFLENBQUMsS0FBSzt5Q0FDeEM7d0NBQ0QsSUFBSSxFQUFFOzRDQUNGLENBQUMsRUFBRSxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFFLENBQUMsSUFBSTt5Q0FDdkM7cUNBQ0o7aUNBQ0o7NkJBQ0o7eUJBQ0o7cUJBQ0o7aUJBQ0osQ0FBQyxDQUFDLENBQUM7Z0JBRUosaUNBQWlDO2dCQUNqQyxPQUFPO29CQUNILElBQUksRUFBRTt3QkFDRixFQUFFLEVBQUUsa0JBQWtCLENBQUMsRUFBRTt3QkFDekIsUUFBUSxFQUFFLGtCQUFrQixDQUFDLFFBQVE7d0JBQ3JDLEtBQUssRUFBRSxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQVUsQ0FBQztxQkFDaEQ7aUJBQ0osQ0FBQTthQUNKO2lCQUFNO2dCQUNILHNIQUFzSDtnQkFDdEgsT0FBTyxRQUFRLENBQUM7YUFDbkI7U0FDSjtLQUNKO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDVixNQUFNLFlBQVksR0FBRyw0REFBNEQsR0FBRyxFQUFFLENBQUM7UUFDdkYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMxQixPQUFPO1lBQ0gsWUFBWSxFQUFFLFlBQVk7WUFDMUIsU0FBUyxFQUFFLG1DQUFpQixDQUFDLGVBQWU7U0FDL0MsQ0FBQTtLQUNKO0FBQ0wsQ0FBQyxDQUFBO0FBL0hZLFFBQUEsY0FBYyxrQkErSDFCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtEeW5hbW9EQkNsaWVudCwgR2V0SXRlbUNvbW1hbmQsIFB1dEl0ZW1Db21tYW5kfSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LWR5bmFtb2RiXCI7XG5pbXBvcnQge1xuICAgIENhcmQsIENhcmRMaW5rLFxuICAgIENhcmRMaW5rRXJyb3JUeXBlLFxuICAgIENhcmRMaW5rUmVzcG9uc2UsXG4gICAgQ2FyZFR5cGUsXG4gICAgQ3JlYXRlQ2FyZExpbmtJbnB1dCxcbiAgICBPbGl2ZUNsaWVudFxufSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuaW1wb3J0IHt2NCBhcyB1dWlkdjR9IGZyb20gJ3V1aWQnO1xuXG4vKipcbiAqIENyZWF0ZUNhcmRMaW5rIHJlc29sdmVyXG4gKlxuICogQHBhcmFtIGNyZWF0ZUNhcmRMaW5rSW5wdXQgY2FyZCBsaW5rIGlucHV0IG9iamVjdCwgdXNlZCB0byBjcmVhdGUgYSBjYXJkIGxpbmsgb2JqZWN0IGFuZC9vciBhZGQgYSBuZXcgY2FyZCB0b1xuICogYW4gZXhpc3RpbmcgbGlua2luZyBvYmplY3RcbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgQ2FyZExpbmtSZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IGNyZWF0ZUNhcmRMaW5rID0gYXN5bmMgKGNyZWF0ZUNhcmRMaW5rSW5wdXQ6IENyZWF0ZUNhcmRMaW5rSW5wdXQpOiBQcm9taXNlPENhcmRMaW5rUmVzcG9uc2U+ID0+IHtcbiAgICB0cnkge1xuICAgICAgICAvLyByZXRyaWV2aW5nIHRoZSBjdXJyZW50IGZ1bmN0aW9uIHJlZ2lvblxuICAgICAgICBjb25zdCByZWdpb24gPSBwcm9jZXNzLmVudi5BV1NfUkVHSU9OITtcblxuICAgICAgICAvLyBjaGVjayBpZiBhbiBpbnZhbGlkIGNhcmQgdHlwZSBpcyBwYXNzZWQgaW4sIHRoZW4gcmV0dXJuIGFuIGVycm9yIGFjY29yZGluZ2x5XG4gICAgICAgIGlmIChjcmVhdGVDYXJkTGlua0lucHV0LmNhcmQudHlwZSA9PT0gQ2FyZFR5cGUuSW52YWxpZCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBVbnN1cHBvcnRlZCBjYXJkIHNjaGVtZS5gLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuSW52YWxpZENhcmRTY2hlbWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGluaXRpYWxpemluZyB0aGUgRHluYW1vREIgZG9jdW1lbnQgY2xpZW50XG4gICAgICAgIGNvbnN0IGR5bmFtb0RiQ2xpZW50ID0gbmV3IER5bmFtb0RCQ2xpZW50KHtyZWdpb246IHJlZ2lvbn0pO1xuXG4gICAgICAgIC8vIHVwZGF0ZSB0aGUgdGltZXN0YW1wcyBhY2NvcmRpbmdseVxuICAgICAgICBjb25zdCBjcmVhdGVkQXQgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgICAgIGNyZWF0ZUNhcmRMaW5rSW5wdXQuY2FyZC5jcmVhdGVkQXQgPSBjcmVhdGVDYXJkTGlua0lucHV0LmNhcmQuY3JlYXRlZEF0ID8gY3JlYXRlQ2FyZExpbmtJbnB1dC5jYXJkLmNyZWF0ZWRBdCA6IGNyZWF0ZWRBdDtcbiAgICAgICAgY3JlYXRlQ2FyZExpbmtJbnB1dC5jYXJkLnVwZGF0ZWRBdCA9IGNyZWF0ZUNhcmRMaW5rSW5wdXQuY2FyZC51cGRhdGVkQXQgPyBjcmVhdGVDYXJkTGlua0lucHV0LmNhcmQudXBkYXRlZEF0IDogY3JlYXRlZEF0O1xuXG4gICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGUgdXNlciBhbHJlYWR5IGhhcyBhIGNhcmQgZW5yb2xsZWQgaW4uIElmIHRoZXkgZG8sIHRoZW4gcmV0dXJuIGFuIGVycm9yIHNpbmNlIHdlIG9ubHkgc3VwcG9ydCBvbmUgY2FyZCBsaW5raW5nIHBlciBjdXN0b21lciBhcyBvZiBub3cuXG4gICAgICAgIGNvbnN0IHByZUV4aXN0aW5nQ2FyZEZvckxpbmsgPSAgYXdhaXQgZHluYW1vRGJDbGllbnQuc2VuZChuZXcgR2V0SXRlbUNvbW1hbmQoe1xuICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5DQVJEX0xJTktJTkdfVEFCTEUhLFxuICAgICAgICAgICAgS2V5OiB7XG4gICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlQ2FyZExpbmtJbnB1dC5pZFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuXG4gICAgICAgIC8vIGlmIHRoZXJlIGlzIGFuIGl0ZW0gcmV0cmlldmVkLCB0aGVuIHdlIG5lZWQgdG8gY2hlY2sgaXRzIGNvbnRlbnRzXG4gICAgICAgIGlmIChwcmVFeGlzdGluZ0NhcmRGb3JMaW5rICYmIHByZUV4aXN0aW5nQ2FyZEZvckxpbmsuSXRlbSkge1xuICAgICAgICAgICAgLy8gaWYgdGhlcmUgaXMgYW4gZXhpc3RlbnQgbGluaywgdGhlbiBpdCB3aWxsIGNvbnRhaW4gYSBjYXJkLCBzbyB3ZSB3aWxsIHJldHVybiBhbiBlcnJvclxuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFByZS1leGlzdGluZyBjYXJkIGFscmVhZHkgbGlua2VkLiBVbmxpbmsgdGhhdCBvbmUgYmVmb3JlIGFkZGluZyBhIG5ldyBvbmUhYDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5BbHJlYWR5RXhpc3RlbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBObyBjYXJkIGxpbmsgZXhpc3RlbnQgaW4gREIgZm9yIHVzZXIgJHtjcmVhdGVDYXJkTGlua0lucHV0LmlkfWApO1xuXG4gICAgICAgICAgICAvLyBnZW5lcmF0ZSBhIHVuaXF1ZSBhcHBsaWNhdGlvbiBpZGVudGlmaWVyIGZvciB0aGUgY2FyZCwgdG8gYmUgcGFzc2VkIGluIHRvIE9saXZlIGFzIHRoZSBcInJlZmVyZW5jZUFwcElkXCJcbiAgICAgICAgICAgIGNyZWF0ZUNhcmRMaW5rSW5wdXQuY2FyZC5hcHBsaWNhdGlvbklEID0gdXVpZHY0KCk7XG5cbiAgICAgICAgICAgIC8vIGNhbGwgdGhlIE9saXZlIENsaWVudCBBUEkgaGVyZSwgaW4gb3JkZXIgdG8gY2FsbCB0aGUgYXBwcm9wcmlhdGUgZW5kcG9pbnRzIGZvciB0aGlzIHJlc29sdmVyXG4gICAgICAgICAgICBjb25zdCBvbGl2ZUNsaWVudCA9IG5ldyBPbGl2ZUNsaWVudChjcmVhdGVDYXJkTGlua0lucHV0LmNhcmQgYXMgQ2FyZCwgY3JlYXRlQ2FyZExpbmtJbnB1dC5pZCwgcHJvY2Vzcy5lbnYuRU5WX05BTUUhLCByZWdpb24pO1xuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBvbGl2ZUNsaWVudC5saW5rKCk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGUgY2FyZCBsaW5raW5nIGNhbGwgd2FzIGV4ZWN1dGVkIHN1Y2Nlc3NmdWxseVxuICAgICAgICAgICAgaWYgKHJlc3BvbnNlICYmICFyZXNwb25zZS5lcnJvck1lc3NhZ2UgJiYgIXJlc3BvbnNlLmVycm9yVHlwZSAmJiByZXNwb25zZS5kYXRhKSB7XG4gICAgICAgICAgICAgICAgLy8gY29udmVydCB0aGUgaW5jb21pbmcgbGlua2VkIGRhdGEgaW50byBhIENhcmRMaW5rIG9iamVjdFxuICAgICAgICAgICAgICAgIGNvbnN0IGNhcmRMaW5rZWRSZXNwb25zZSA9IHJlc3BvbnNlLmRhdGEgYXMgQ2FyZExpbms7XG5cbiAgICAgICAgICAgICAgICAvLyBzdG9yZSB0aGUgY2FyZCBsaW5raW5nIG9iamVjdFxuICAgICAgICAgICAgICAgIGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IFB1dEl0ZW1Db21tYW5kKHtcbiAgICAgICAgICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5DQVJEX0xJTktJTkdfVEFCTEUhLFxuICAgICAgICAgICAgICAgICAgICBJdGVtOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNhcmRMaW5rZWRSZXNwb25zZS5pZFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lbWJlcklkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY2FyZExpbmtlZFJlc3BvbnNlLm1lbWJlcklkXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FyZHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBMOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE06IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjYXJkTGlua2VkUmVzcG9uc2UuY2FyZHNbMF0hLmlkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBsaWNhdGlvbklEOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNhcmRMaW5rZWRSZXNwb25zZS5jYXJkc1swXSEuYXBwbGljYXRpb25JRFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uKGNhcmRMaW5rZWRSZXNwb25zZS5jYXJkc1swXSEuYWRkaXRpb25hbFByb2dyYW1JRCAmJiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZGl0aW9uYWxQcm9ncmFtSUQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNhcmRMaW5rZWRSZXNwb25zZS5jYXJkc1swXSEuYWRkaXRpb25hbFByb2dyYW1JRCFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjYXJkTGlua2VkUmVzcG9uc2UuY2FyZHNbMF0hLmNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlZEF0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNhcmRMaW5rZWRSZXNwb25zZS5jYXJkc1swXSEudXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0NDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjYXJkTGlua2VkUmVzcG9uc2UuY2FyZHNbMF0hLmxhc3Q0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNhcmRMaW5rZWRSZXNwb25zZS5jYXJkc1swXSEubmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW46IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY2FyZExpbmtlZFJlc3BvbnNlLmNhcmRzWzBdIS50b2tlblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjYXJkTGlua2VkUmVzcG9uc2UuY2FyZHNbMF0hLnR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBjYXJkIGxpbmtpbmcgb2JqZWN0XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNhcmRMaW5rZWRSZXNwb25zZS5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lbWJlcklkOiBjYXJkTGlua2VkUmVzcG9uc2UubWVtYmVySWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXJkczogW2NhcmRMaW5rZWRSZXNwb25zZS5jYXJkc1swXSEgYXMgQ2FyZF1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gaWYgdGhlcmUgYXJlIGVycm9ycyBhc3NvY2lhdGVkIHdpdGggdGhlIGNhbGwsIGp1c3QgcmV0dXJuIHRoZSBlcnJvciBtZXNzYWdlIGFuZCBlcnJvciB0eXBlIGZyb20gdGhlIHVwc3RyZWFtIGNsaWVudFxuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgY3JlYXRlQ2FyZExpbmsgbXV0YXRpb24gJHtlcnJ9YDtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==