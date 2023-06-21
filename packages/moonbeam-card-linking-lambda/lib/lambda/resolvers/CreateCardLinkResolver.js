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
            const oliveClient = new moonbeam_models_1.OliveClient(process.env.ENV_NAME, region, createCardLinkInput.id);
            // execute the member linking/enrollment call
            const response = await oliveClient.link(createCardLinkInput.createdAt, createCardLinkInput.updatedAt, createCardLinkInput.card);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXRlQ2FyZExpbmtSZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL0NyZWF0ZUNhcmRMaW5rUmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsOERBQXdGO0FBQ3hGLCtEQVFtQztBQUNuQywrQkFBa0M7QUFFbEM7Ozs7OztHQU1HO0FBQ0ksTUFBTSxjQUFjLEdBQUcsS0FBSyxFQUFFLG1CQUF3QyxFQUE2QixFQUFFO0lBQ3hHLElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsK0VBQStFO1FBQy9FLElBQUksbUJBQW1CLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSywwQkFBUSxDQUFDLE9BQU8sRUFBRTtZQUNwRCxPQUFPO2dCQUNILFlBQVksRUFBRSwwQkFBMEI7Z0JBQ3hDLFNBQVMsRUFBRSxtQ0FBaUIsQ0FBQyxpQkFBaUI7YUFDakQsQ0FBQTtTQUNKO1FBRUQsNENBQTRDO1FBQzVDLE1BQU0sY0FBYyxHQUFHLElBQUksZ0NBQWMsQ0FBQyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBRTVELG9DQUFvQztRQUNwQyxNQUFNLFNBQVMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzNDLG1CQUFtQixDQUFDLFNBQVMsR0FBRyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQzFHLG1CQUFtQixDQUFDLFNBQVMsR0FBRyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBRTFHOzs7O1dBSUc7UUFDSCxNQUFNLHNCQUFzQixHQUFJLE1BQU0sY0FB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bW1hbmR9IGZyb20gXCJAYXdzLXNkay9jbGllbnQtZHluYW1vZGJcIjtcbmltcG9ydCB7XG4gICAgQ2FyZCxcbiAgICBDYXJkTGluayxcbiAgICBDYXJkTGlua0Vycm9yVHlwZSxcbiAgICBDYXJkTGlua1Jlc3BvbnNlLFxuICAgIENhcmRUeXBlLFxuICAgIENyZWF0ZUNhcmRMaW5rSW5wdXQsXG4gICAgT2xpdmVDbGllbnRcbn0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcbmltcG9ydCB7djQgYXMgdXVpZHY0fSBmcm9tICd1dWlkJztcblxuLyoqXG4gKiBDcmVhdGVDYXJkTGluayByZXNvbHZlclxuICpcbiAqIEBwYXJhbSBjcmVhdGVDYXJkTGlua0lucHV0IGNhcmQgbGluayBpbnB1dCBvYmplY3QsIHVzZWQgdG8gY3JlYXRlIGEgY2FyZCBsaW5rIG9iamVjdCBhbmQvb3IgYWRkIGEgbmV3IGNhcmQgdG9cbiAqIGFuIGV4aXN0aW5nIGxpbmtpbmcgb2JqZWN0XG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIENhcmRMaW5rUmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCBjcmVhdGVDYXJkTGluayA9IGFzeW5jIChjcmVhdGVDYXJkTGlua0lucHV0OiBDcmVhdGVDYXJkTGlua0lucHV0KTogUHJvbWlzZTxDYXJkTGlua1Jlc3BvbnNlPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gcmV0cmlldmluZyB0aGUgY3VycmVudCBmdW5jdGlvbiByZWdpb25cbiAgICAgICAgY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiE7XG5cbiAgICAgICAgLy8gY2hlY2sgaWYgYW4gaW52YWxpZCBjYXJkIHR5cGUgaXMgcGFzc2VkIGluLCB0aGVuIHJldHVybiBhbiBlcnJvciBhY2NvcmRpbmdseVxuICAgICAgICBpZiAoY3JlYXRlQ2FyZExpbmtJbnB1dC5jYXJkLnR5cGUgPT09IENhcmRUeXBlLkludmFsaWQpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgVW5zdXBwb3J0ZWQgY2FyZCBzY2hlbWUuYCxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLkludmFsaWRDYXJkU2NoZW1lXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBpbml0aWFsaXppbmcgdGhlIER5bmFtb0RCIGRvY3VtZW50IGNsaWVudFxuICAgICAgICBjb25zdCBkeW5hbW9EYkNsaWVudCA9IG5ldyBEeW5hbW9EQkNsaWVudCh7cmVnaW9uOiByZWdpb259KTtcblxuICAgICAgICAvLyB1cGRhdGUgdGhlIHRpbWVzdGFtcHMgYWNjb3JkaW5nbHlcbiAgICAgICAgY29uc3QgY3JlYXRlZEF0ID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgICAgICBjcmVhdGVDYXJkTGlua0lucHV0LmNyZWF0ZWRBdCA9IGNyZWF0ZUNhcmRMaW5rSW5wdXQuY3JlYXRlZEF0ID8gY3JlYXRlQ2FyZExpbmtJbnB1dC5jcmVhdGVkQXQgOiBjcmVhdGVkQXQ7XG4gICAgICAgIGNyZWF0ZUNhcmRMaW5rSW5wdXQudXBkYXRlZEF0ID0gY3JlYXRlQ2FyZExpbmtJbnB1dC51cGRhdGVkQXQgPyBjcmVhdGVDYXJkTGlua0lucHV0LnVwZGF0ZWRBdCA6IGNyZWF0ZWRBdDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogY2hlY2sgdG8gc2VlIGlmIHRoZSB1c2VyIGFscmVhZHkgaGFzIGEgY2FyZCBlbnJvbGxlZCBpbi4gSWYgdGhleSBkbywgdGhlbiByZXR1cm4gYW4gZXJyb3IsIHNpbmNlIHdlIG9ubHkgZG9uJ3Qgd2FudCB0byBjcmVhdGUgYSBicmFuZC1uZXcgY3VzdG9tZXJcbiAgICAgICAgICogd2l0aCBhIG5ldyBjYXJkLCBmb3IgYW4gZXhpc3RpbmcgY3VzdG9tZXIgd2hvbSBhbHJlYWR5IGhhcyBhIGxpbmtlZCBjYXJkLiBJbiBvcmRlciB0byBjaGFuZ2UgYSBjYXJkIGZvciBhIGN1c3RvbWVyLCB3ZSB3aWxsIHJlcXVpcmUgdGhlbSB0byBmaXJzdCBjYWxsXG4gICAgICAgICAqIG91ciBkZWxldGVDYXJkIEFQSSwgZm9sbG93ZWQgYnkgYWRkQ2FyZCBBUEkuXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBwcmVFeGlzdGluZ0NhcmRGb3JMaW5rID0gIGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IEdldEl0ZW1Db21tYW5kKHtcbiAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuQ0FSRF9MSU5LSU5HX1RBQkxFISxcbiAgICAgICAgICAgIEtleToge1xuICAgICAgICAgICAgICAgIGlkOiB7XG4gICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZUNhcmRMaW5rSW5wdXQuaWRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKTtcblxuICAgICAgICAvLyBpZiB0aGVyZSBpcyBhbiBpdGVtIHJldHJpZXZlZCwgdGhlbiB3ZSBuZWVkIHRvIGNoZWNrIGl0cyBjb250ZW50c1xuICAgICAgICBpZiAocHJlRXhpc3RpbmdDYXJkRm9yTGluayAmJiBwcmVFeGlzdGluZ0NhcmRGb3JMaW5rLkl0ZW0pIHtcbiAgICAgICAgICAgIC8vIGlmIHRoZXJlIGlzIGFuIGV4aXN0ZW50IGxpbmsgb2JqZWN0LCB0aGVuIHdlIGNhbm5vdCBkdXBsaWNhdGUgdGhhdCwgc28gd2Ugd2lsbCByZXR1cm4gYW4gZXJyb3JcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBQcmUtZXhpc3RpbmcgY2FyZCBsaW5rZWQgb2JqZWN0LiBEZWxldGUgaXQgYmVmb3JlIGFkZGluZyBhIG5ldyBvbmUhYDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5BbHJlYWR5RXhpc3RlbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBObyBjYXJkIGxpbmsgZXhpc3RlbnQgaW4gREIgZm9yIHVzZXIgJHtjcmVhdGVDYXJkTGlua0lucHV0LmlkfWApO1xuXG4gICAgICAgICAgICAvLyBnZW5lcmF0ZSBhIHVuaXF1ZSBhcHBsaWNhdGlvbiBpZGVudGlmaWVyIGZvciB0aGUgY2FyZCwgdG8gYmUgcGFzc2VkIGluIHRvIE9saXZlIGFzIHRoZSBcInJlZmVyZW5jZUFwcElkXCJcbiAgICAgICAgICAgIGNyZWF0ZUNhcmRMaW5rSW5wdXQuY2FyZC5hcHBsaWNhdGlvbklEID0gdXVpZHY0KCk7XG5cbiAgICAgICAgICAgIC8vIGNhbGwgdGhlIE9saXZlIENsaWVudCBBUEkgaGVyZSwgaW4gb3JkZXIgdG8gY2FsbCB0aGUgYXBwcm9wcmlhdGUgZW5kcG9pbnRzIGZvciB0aGlzIHJlc29sdmVyXG4gICAgICAgICAgICBjb25zdCBvbGl2ZUNsaWVudCA9IG5ldyBPbGl2ZUNsaWVudChwcm9jZXNzLmVudi5FTlZfTkFNRSEsIHJlZ2lvbiwgY3JlYXRlQ2FyZExpbmtJbnB1dC5pZCk7XG5cbiAgICAgICAgICAgIC8vIGV4ZWN1dGUgdGhlIG1lbWJlciBsaW5raW5nL2Vucm9sbG1lbnQgY2FsbFxuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBvbGl2ZUNsaWVudC5saW5rKGNyZWF0ZUNhcmRMaW5rSW5wdXQuY3JlYXRlZEF0LCBjcmVhdGVDYXJkTGlua0lucHV0LnVwZGF0ZWRBdCwgY3JlYXRlQ2FyZExpbmtJbnB1dC5jYXJkIGFzIENhcmQpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIGNhcmQgbGlua2luZyBjYWxsIHdhcyBleGVjdXRlZCBzdWNjZXNzZnVsbHlcbiAgICAgICAgICAgIGlmIChyZXNwb25zZSAmJiAhcmVzcG9uc2UuZXJyb3JNZXNzYWdlICYmICFyZXNwb25zZS5lcnJvclR5cGUgJiYgcmVzcG9uc2UuZGF0YSkge1xuICAgICAgICAgICAgICAgIC8vIGNvbnZlcnQgdGhlIGluY29taW5nIGxpbmtlZCBkYXRhIGludG8gYSBDYXJkTGluayBvYmplY3RcbiAgICAgICAgICAgICAgICBjb25zdCBjYXJkTGlua2VkUmVzcG9uc2UgPSByZXNwb25zZS5kYXRhIGFzIENhcmRMaW5rO1xuXG4gICAgICAgICAgICAgICAgLy8gc3RvcmUgdGhlIGNhcmQgbGlua2luZyBvYmplY3RcbiAgICAgICAgICAgICAgICBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBQdXRJdGVtQ29tbWFuZCh7XG4gICAgICAgICAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuQ0FSRF9MSU5LSU5HX1RBQkxFISxcbiAgICAgICAgICAgICAgICAgICAgSXRlbToge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjYXJkTGlua2VkUmVzcG9uc2UuaWRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBtZW1iZXJJZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNhcmRMaW5rZWRSZXNwb25zZS5tZW1iZXJJZFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZUNhcmRMaW5rSW5wdXQuY3JlYXRlZEF0IVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRBdDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZUNhcmRMaW5rSW5wdXQudXBkYXRlZEF0IVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBNOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY2FyZExpbmtlZFJlc3BvbnNlLmNhcmRzWzBdIS5pZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwbGljYXRpb25JRDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjYXJkTGlua2VkUmVzcG9uc2UuY2FyZHNbMF0hLmFwcGxpY2F0aW9uSURcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLihjYXJkTGlua2VkUmVzcG9uc2UuY2FyZHNbMF0hLmFkZGl0aW9uYWxQcm9ncmFtSUQgJiYge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGRpdGlvbmFsUHJvZ3JhbUlEOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjYXJkTGlua2VkUmVzcG9uc2UuY2FyZHNbMF0hLmFkZGl0aW9uYWxQcm9ncmFtSUQhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0NDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjYXJkTGlua2VkUmVzcG9uc2UuY2FyZHNbMF0hLmxhc3Q0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNhcmRMaW5rZWRSZXNwb25zZS5jYXJkc1swXSEubmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW46IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY2FyZExpbmtlZFJlc3BvbnNlLmNhcmRzWzBdIS50b2tlblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjYXJkTGlua2VkUmVzcG9uc2UuY2FyZHNbMF0hLnR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBjYXJkIGxpbmtpbmcgb2JqZWN0XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNhcmRMaW5rZWRSZXNwb25zZS5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lbWJlcklkOiBjYXJkTGlua2VkUmVzcG9uc2UubWVtYmVySWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IGNyZWF0ZUNhcmRMaW5rSW5wdXQuY3JlYXRlZEF0ISxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRBdDogY3JlYXRlQ2FyZExpbmtJbnB1dC51cGRhdGVkQXQhLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FyZHM6IFtjYXJkTGlua2VkUmVzcG9uc2UuY2FyZHNbMF0hIGFzIENhcmRdXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBVbmV4cGVjdGVkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tIHRoZSBsaW5raW5nIGNhbGwhYCk7XG5cbiAgICAgICAgICAgICAgICAvLyBpZiB0aGVyZSBhcmUgZXJyb3JzIGFzc29jaWF0ZWQgd2l0aCB0aGUgY2FsbCwganVzdCByZXR1cm4gdGhlIGVycm9yIG1lc3NhZ2UgYW5kIGVycm9yIHR5cGUgZnJvbSB0aGUgdXBzdHJlYW0gY2xpZW50XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyBjcmVhdGVDYXJkTGluayBtdXRhdGlvbiAke2Vycn1gO1xuICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICB9XG4gICAgfVxufVxuIl19