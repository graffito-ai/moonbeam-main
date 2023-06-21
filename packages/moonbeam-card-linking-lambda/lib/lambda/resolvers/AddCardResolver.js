"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addCard = void 0;
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const uuid_1 = require("uuid");
/**
 * AddCard resolver
 *
 * @param addCardInput add card input object, used to add/link a card object to an existing user/
 * card linked object.
 * @returns {@link Promise} of {@link CardResponse}
 */
const addCard = async (addCardInput) => {
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
            // call the Olive Client API here, in order to call the appropriate endpoints for this resolver
            const oliveClient = new moonbeam_models_1.OliveClient(process.env.ENV_NAME, region, addCardInput.id);
            // first execute the member update call, to re-activate the member
            const updateMemberResponse = await oliveClient.updateMemberStatus(addCardInput.memberId, true, addCardInput.updatedAt);
            // check to see if the update member status call was executed successfully
            if (updateMemberResponse && !updateMemberResponse.errorMessage && !updateMemberResponse.errorType
                && updateMemberResponse.data && updateMemberResponse.data.isActive === true
                && updateMemberResponse.data.id === addCardInput.id && updateMemberResponse.data.memberId === addCardInput.memberId) {
                // then execute the add card call, to add a card to the member
                const addCardResponse = await oliveClient.addCard(addCardInput.memberId, addCardInput.updatedAt, addCardInput.updatedAt, addCardInput.card);
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
        const errorMessage = `Unexpected error while executing addCard mutation ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: moonbeam_models_1.CardLinkErrorType.UnexpectedError
        };
    }
};
exports.addCard = addCard;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRkQ2FyZFJlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9yZXNvbHZlcnMvQWRkQ2FyZFJlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtEQVFtQztBQUNuQyw4REFBMkY7QUFDM0YsK0JBQWtDO0FBRWxDOzs7Ozs7R0FNRztBQUNJLE1BQU0sT0FBTyxHQUFHLEtBQUssRUFBRSxZQUEwQixFQUE2QixFQUFFO0lBQ25GLElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsNENBQTRDO1FBQzVDLE1BQU0sY0FBYyxHQUFHLElBQUksZ0NBQWMsQ0FBQyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBRTVELG9DQUFvQztRQUNwQyxZQUFZLENBQUMsU0FBUyxHQUFHLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7UUFFcEcsb0VBQW9FO1FBQ3BFLE1BQU0sYUFBYSxHQUFJLE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLGdDQUFjLENBQUM7WUFDaEUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQW1CO1lBQzFDLEdBQUcsRUFBRTtnQkFDRCxFQUFFLEVBQUU7b0JBQ0EsQ0FBQyxFQUFFLFlBQVksQ0FBQyxFQUFFO2lCQUNyQjthQUNKO1NBQ0osQ0FBQyxDQUFDLENBQUM7UUFFSjs7O1dBR0c7UUFDSCxJQUFJLGFBQWEsSUFBSSxhQUFhLENBQUMsSUFBSSxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ2pGLE1BQU0sWUFBWSxHQUFHLHdFQUF3RSxDQUFDO1lBQzlGLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7WUFFMUIsT0FBTztnQkFDSCxZQUFZLEVBQUUsWUFBWTtnQkFDMUIsU0FBUyxFQUFFLG1DQUFpQixDQUFDLGVBQWU7YUFDL0MsQ0FBQTtTQUNKO2FBQU07WUFDSCwwR0FBMEc7WUFDMUcsWUFBWSxDQUFDLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBQSxTQUFNLEdBQUUsQ0FBQztZQUUzQywrRkFBK0Y7WUFDL0YsTUFBTSxXQUFXLEdBQUcsSUFBSSw2QkFBVyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUyxFQUFFLE1BQU0sRUFBRSxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUM7WUFFcEYsa0VBQWtFO1lBQ2xFLE1BQU0sb0JBQW9CLEdBQUcsTUFBTSxXQUFXLENBQUMsa0JBQWtCLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsWUFBWSxDQUFDLFNBQVUsQ0FBQyxDQUFDO1lBRXhILDBFQUEwRTtZQUMxRSxJQUFJLG9CQUFvQixJQUFJLENBQUMsb0JBQW9CLENBQUMsWUFBWSxJQUFJLENBQUMsb0JBQW9CLENBQUMsU0FBUzttQkFDMUYsb0JBQW9CLENBQUMsSUFBSSxJQUFJLG9CQUFvQixDQUFDLElBQUksQ0FBQyxRQUFRLEtBQUssSUFBSTttQkFDeEUsb0JBQW9CLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxZQUFZLENBQUMsRUFBRSxJQUFJLG9CQUFvQixDQUFDLElBQUksQ0FBQyxRQUFRLEtBQUssWUFBWSxDQUFDLFFBQVEsRUFBRTtnQkFFckgsOERBQThEO2dCQUM5RCxNQUFNLGVBQWUsR0FBRyxNQUFNLFdBQVcsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxZQUFZLENBQUMsU0FBVSxFQUFFLFlBQVksQ0FBQyxTQUFVLEVBQUUsWUFBWSxDQUFDLElBQVksQ0FBQyxDQUFDO2dCQUV0Siw4REFBOEQ7Z0JBQzlELElBQUksZUFBZSxJQUFJLENBQUMsZUFBZSxDQUFDLFlBQVksSUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLElBQUksZUFBZSxDQUFDLElBQUksRUFBRTtvQkFDeEcsMERBQTBEO29CQUMxRCxNQUFNLGtCQUFrQixHQUFHLGVBQWUsQ0FBQyxJQUFnQixDQUFDO29CQUU1RCw2RUFBNkU7b0JBQzdFLE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLG1DQUFpQixDQUFDO3dCQUM1QyxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBbUI7d0JBQzFDLEdBQUcsRUFBRTs0QkFDRCxFQUFFLEVBQUU7Z0NBQ0EsQ0FBQyxFQUFFLFlBQVksQ0FBQyxFQUFFOzZCQUNyQjt5QkFDSjt3QkFDRCx3QkFBd0IsRUFBRTs0QkFDdEIsS0FBSyxFQUFFLE9BQU87NEJBQ2QsS0FBSyxFQUFFLFdBQVc7eUJBQ3JCO3dCQUNELHlCQUF5QixFQUFFOzRCQUN2QixPQUFPLEVBQUU7Z0NBQ0wsQ0FBQyxFQUFFO29DQUNDO3dDQUNJLENBQUMsRUFBRTs0Q0FDQyxFQUFFLEVBQUU7Z0RBQ0EsQ0FBQyxFQUFFLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUUsQ0FBQyxFQUFFOzZDQUNyQzs0Q0FDRCxhQUFhLEVBQUU7Z0RBQ1gsQ0FBQyxFQUFFLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUUsQ0FBQyxhQUFhOzZDQUNoRDs0Q0FDRCxHQUFHLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBRSxDQUFDLG1CQUFtQixJQUFJO2dEQUNwRCxtQkFBbUIsRUFBRTtvREFDakIsQ0FBQyxFQUFFLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUUsQ0FBQyxtQkFBb0I7aURBQ3ZEOzZDQUNKLENBQUM7NENBQ0YsS0FBSyxFQUFFO2dEQUNILENBQUMsRUFBRSxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFFLENBQUMsS0FBSzs2Q0FDeEM7NENBQ0QsSUFBSSxFQUFFO2dEQUNGLENBQUMsRUFBRSxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFFLENBQUMsSUFBSTs2Q0FDdkM7NENBQ0QsS0FBSyxFQUFFO2dEQUNILENBQUMsRUFBRSxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFFLENBQUMsS0FBSzs2Q0FDeEM7NENBQ0QsSUFBSSxFQUFFO2dEQUNGLENBQUMsRUFBRSxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFFLENBQUMsSUFBSTs2Q0FDdkM7eUNBQ0o7cUNBQ0o7aUNBQ0o7NkJBQ0o7NEJBQ0QsS0FBSyxFQUFFO2dDQUNILENBQUMsRUFBRSxZQUFZLENBQUMsU0FBVTs2QkFDN0I7eUJBQ0o7d0JBQ0QsZ0JBQWdCLEVBQUUsNEJBQTRCO3dCQUM5QyxZQUFZLEVBQUUsYUFBYTtxQkFDOUIsQ0FBQyxDQUFDLENBQUM7b0JBRUosa0NBQWtDO29CQUNsQyxPQUFPO3dCQUNILElBQUksRUFBRTs0QkFDRixFQUFFLEVBQUUsa0JBQWtCLENBQUMsRUFBRTs0QkFDekIsUUFBUSxFQUFFLGtCQUFrQixDQUFDLFFBQVE7NEJBQ3JDOzs7K0JBR0c7NEJBQ0gsU0FBUyxFQUFFLGtCQUFrQixDQUFDLFNBQVM7NEJBQ3ZDLFNBQVMsRUFBRSxrQkFBa0IsQ0FBQyxTQUFTOzRCQUN2QyxLQUFLLEVBQUU7Z0NBQ0gsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQzs2QkFDOUI7eUJBQ0o7cUJBQ0osQ0FBQTtpQkFFSjtxQkFBTTtvQkFDSCxPQUFPLENBQUMsR0FBRyxDQUFDLGdFQUFnRSxDQUFDLENBQUM7b0JBRTlFLDJIQUEySDtvQkFDM0gsT0FBTzt3QkFDSCxZQUFZLEVBQUUsZUFBZSxDQUFDLFlBQVk7d0JBQzFDLFNBQVMsRUFBRSxlQUFlLENBQUMsU0FBUztxQkFDdkMsQ0FBQztpQkFDTDthQUNKO2lCQUFNO2dCQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsNEVBQTRFLENBQUMsQ0FBQztnQkFFMUYsMklBQTJJO2dCQUMzSSxPQUFPO29CQUNILFlBQVksRUFBRSxvQkFBb0IsQ0FBQyxZQUFZO29CQUMvQyxTQUFTLEVBQUUsb0JBQW9CLENBQUMsU0FBUztpQkFDNUMsQ0FBQTthQUNKO1NBQ0o7S0FFSjtJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1YsTUFBTSxZQUFZLEdBQUcscURBQXFELEdBQUcsRUFBRSxDQUFDO1FBQ2hGLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDMUIsT0FBTztZQUNILFlBQVksRUFBRSxZQUFZO1lBQzFCLFNBQVMsRUFBRSxtQ0FBaUIsQ0FBQyxlQUFlO1NBQy9DLENBQUE7S0FDSjtBQUNMLENBQUMsQ0FBQTtBQXpKWSxRQUFBLE9BQU8sV0F5Sm5CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgICBBZGRDYXJkSW5wdXQsXG4gICAgQ2FyZCxcbiAgICBDYXJkTGluayxcbiAgICBDYXJkTGlua0Vycm9yVHlwZSxcbiAgICBDYXJkTGlua1Jlc3BvbnNlLFxuICAgIENhcmRSZXNwb25zZSxcbiAgICBPbGl2ZUNsaWVudFxufSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuaW1wb3J0IHtEeW5hbW9EQkNsaWVudCwgR2V0SXRlbUNvbW1hbmQsIFVwZGF0ZUl0ZW1Db21tYW5kfSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LWR5bmFtb2RiXCI7XG5pbXBvcnQge3Y0IGFzIHV1aWR2NH0gZnJvbSAndXVpZCc7XG5cbi8qKlxuICogQWRkQ2FyZCByZXNvbHZlclxuICpcbiAqIEBwYXJhbSBhZGRDYXJkSW5wdXQgYWRkIGNhcmQgaW5wdXQgb2JqZWN0LCB1c2VkIHRvIGFkZC9saW5rIGEgY2FyZCBvYmplY3QgdG8gYW4gZXhpc3RpbmcgdXNlci9cbiAqIGNhcmQgbGlua2VkIG9iamVjdC5cbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgQ2FyZFJlc3BvbnNlfVxuICovXG5leHBvcnQgY29uc3QgYWRkQ2FyZCA9IGFzeW5jIChhZGRDYXJkSW5wdXQ6IEFkZENhcmRJbnB1dCk6IFByb21pc2U8Q2FyZExpbmtSZXNwb25zZT4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgIC8vIGluaXRpYWxpemluZyB0aGUgRHluYW1vREIgZG9jdW1lbnQgY2xpZW50XG4gICAgICAgIGNvbnN0IGR5bmFtb0RiQ2xpZW50ID0gbmV3IER5bmFtb0RCQ2xpZW50KHtyZWdpb246IHJlZ2lvbn0pO1xuXG4gICAgICAgIC8vIHVwZGF0ZSB0aGUgdGltZXN0YW1wcyBhY2NvcmRpbmdseVxuICAgICAgICBhZGRDYXJkSW5wdXQudXBkYXRlZEF0ID0gYWRkQ2FyZElucHV0LnVwZGF0ZWRBdCA/IGFkZENhcmRJbnB1dC51cGRhdGVkQXQgOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG5cbiAgICAgICAgLy8gcmV0cmlldmUgdGhlIGNhcmQgbGlua2luZyBvYmplY3QsIGdpdmVuIHRoZSBhZGQgY2FyZCBpbnB1dCBvYmplY3RcbiAgICAgICAgY29uc3QgcmV0cmlldmVkRGF0YSA9ICBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBHZXRJdGVtQ29tbWFuZCh7XG4gICAgICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52LkNBUkRfTElOS0lOR19UQUJMRSEsXG4gICAgICAgICAgICBLZXk6IHtcbiAgICAgICAgICAgICAgICBpZDoge1xuICAgICAgICAgICAgICAgICAgICBTOiBhZGRDYXJkSW5wdXQuaWRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogaWYgdGhlcmUgaXMgYW4gaXRlbSByZXRyaWV2ZWQsIGFuZCBpdCBjb250YWlucyBhIGNhcmQgaW4gaXQsIHRoZW4gd2UgY2Fubm90IGFkZCBhbm90aGVyIGNhcmQgdG8gaXQsXG4gICAgICAgICAqIHNpbmNlIG91ciBsaW1pdCBpcyBvbmUgY2FyZCBwZXIgY3VzdG9tZXJcbiAgICAgICAgICovXG4gICAgICAgIGlmIChyZXRyaWV2ZWREYXRhICYmIHJldHJpZXZlZERhdGEuSXRlbSAmJiByZXRyaWV2ZWREYXRhLkl0ZW0uY2FyZHMuTCEubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgUHJlLWV4aXN0aW5nIGNhcmQgYWxyZWFkeSBleGlzdGVudC4gRGVsZXRlIGl0IGJlZm9yZSBhZGRpbmcgYSBuZXcgb25lIWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuQWxyZWFkeUV4aXN0ZW50XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBnZW5lcmF0ZSBhIHVuaXF1ZSBhcHBsaWNhdGlvbiBpZGVudGlmaWVyIGZvciB0aGUgY2FyZCwgdG8gYmUgcGFzc2VkIGluIHRvIE9saXZlIGFzIHRoZSBcInJlZmVyZW5jZUFwcElkXCJcbiAgICAgICAgICAgIGFkZENhcmRJbnB1dC5jYXJkLmFwcGxpY2F0aW9uSUQgPSB1dWlkdjQoKTtcblxuICAgICAgICAgICAgLy8gY2FsbCB0aGUgT2xpdmUgQ2xpZW50IEFQSSBoZXJlLCBpbiBvcmRlciB0byBjYWxsIHRoZSBhcHByb3ByaWF0ZSBlbmRwb2ludHMgZm9yIHRoaXMgcmVzb2x2ZXJcbiAgICAgICAgICAgIGNvbnN0IG9saXZlQ2xpZW50ID0gbmV3IE9saXZlQ2xpZW50KHByb2Nlc3MuZW52LkVOVl9OQU1FISwgcmVnaW9uLCBhZGRDYXJkSW5wdXQuaWQpO1xuXG4gICAgICAgICAgICAvLyBmaXJzdCBleGVjdXRlIHRoZSBtZW1iZXIgdXBkYXRlIGNhbGwsIHRvIHJlLWFjdGl2YXRlIHRoZSBtZW1iZXJcbiAgICAgICAgICAgIGNvbnN0IHVwZGF0ZU1lbWJlclJlc3BvbnNlID0gYXdhaXQgb2xpdmVDbGllbnQudXBkYXRlTWVtYmVyU3RhdHVzKGFkZENhcmRJbnB1dC5tZW1iZXJJZCwgdHJ1ZSwgYWRkQ2FyZElucHV0LnVwZGF0ZWRBdCEpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIHVwZGF0ZSBtZW1iZXIgc3RhdHVzIGNhbGwgd2FzIGV4ZWN1dGVkIHN1Y2Nlc3NmdWxseVxuICAgICAgICAgICAgaWYgKHVwZGF0ZU1lbWJlclJlc3BvbnNlICYmICF1cGRhdGVNZW1iZXJSZXNwb25zZS5lcnJvck1lc3NhZ2UgJiYgIXVwZGF0ZU1lbWJlclJlc3BvbnNlLmVycm9yVHlwZVxuICAgICAgICAgICAgICAgICYmIHVwZGF0ZU1lbWJlclJlc3BvbnNlLmRhdGEgJiYgdXBkYXRlTWVtYmVyUmVzcG9uc2UuZGF0YS5pc0FjdGl2ZSA9PT0gdHJ1ZVxuICAgICAgICAgICAgICAgICYmIHVwZGF0ZU1lbWJlclJlc3BvbnNlLmRhdGEuaWQgPT09IGFkZENhcmRJbnB1dC5pZCAmJiB1cGRhdGVNZW1iZXJSZXNwb25zZS5kYXRhLm1lbWJlcklkID09PSBhZGRDYXJkSW5wdXQubWVtYmVySWQpIHtcblxuICAgICAgICAgICAgICAgIC8vIHRoZW4gZXhlY3V0ZSB0aGUgYWRkIGNhcmQgY2FsbCwgdG8gYWRkIGEgY2FyZCB0byB0aGUgbWVtYmVyXG4gICAgICAgICAgICAgICAgY29uc3QgYWRkQ2FyZFJlc3BvbnNlID0gYXdhaXQgb2xpdmVDbGllbnQuYWRkQ2FyZChhZGRDYXJkSW5wdXQubWVtYmVySWQsIGFkZENhcmRJbnB1dC51cGRhdGVkQXQhLCBhZGRDYXJkSW5wdXQudXBkYXRlZEF0ISwgYWRkQ2FyZElucHV0LmNhcmQgYXMgQ2FyZCk7XG5cbiAgICAgICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIGFkZCBjYXJkIGNhbGwgd2FzIGV4ZWN1dGVkIHN1Y2Nlc3NmdWxseVxuICAgICAgICAgICAgICAgIGlmIChhZGRDYXJkUmVzcG9uc2UgJiYgIWFkZENhcmRSZXNwb25zZS5lcnJvck1lc3NhZ2UgJiYgIWFkZENhcmRSZXNwb25zZS5lcnJvclR5cGUgJiYgYWRkQ2FyZFJlc3BvbnNlLmRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gY29udmVydCB0aGUgaW5jb21pbmcgbGlua2VkIGRhdGEgaW50byBhIENhcmRMaW5rIG9iamVjdFxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjYXJkTGlua2VkUmVzcG9uc2UgPSBhZGRDYXJkUmVzcG9uc2UuZGF0YSBhcyBDYXJkTGluaztcblxuICAgICAgICAgICAgICAgICAgICAvLyBmaW5hbGx5LCB1cGRhdGUgdGhlIGNhcmQgbGlua2VkIG9iamVjdCwgYnkgYWRkaW5nL2xpbmtpbmcgYSBuZXcgY2FyZCB0byBpdFxuICAgICAgICAgICAgICAgICAgICBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBVcGRhdGVJdGVtQ29tbWFuZCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52LkNBUkRfTElOS0lOR19UQUJMRSEsXG4gICAgICAgICAgICAgICAgICAgICAgICBLZXk6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBhZGRDYXJkSW5wdXQuaWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIjQ0FcIjogXCJjYXJkc1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiI1VBXCI6IFwidXBkYXRlZEF0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBFeHByZXNzaW9uQXR0cmlidXRlVmFsdWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCI6bGlzdFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEw6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBNOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjYXJkTGlua2VkUmVzcG9uc2UuY2FyZHNbMF0hLmlkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcGxpY2F0aW9uSUQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNhcmRMaW5rZWRSZXNwb25zZS5jYXJkc1swXSEuYXBwbGljYXRpb25JRFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi4oY2FyZExpbmtlZFJlc3BvbnNlLmNhcmRzWzBdIS5hZGRpdGlvbmFsUHJvZ3JhbUlEICYmIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZGl0aW9uYWxQcm9ncmFtSUQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjYXJkTGlua2VkUmVzcG9uc2UuY2FyZHNbMF0hLmFkZGl0aW9uYWxQcm9ncmFtSUQhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0NDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY2FyZExpbmtlZFJlc3BvbnNlLmNhcmRzWzBdIS5sYXN0NFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjYXJkTGlua2VkUmVzcG9uc2UuY2FyZHNbMF0hLm5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW46IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNhcmRMaW5rZWRSZXNwb25zZS5jYXJkc1swXSEudG9rZW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY2FyZExpbmtlZFJlc3BvbnNlLmNhcmRzWzBdIS50eXBlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiOnVhXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogYWRkQ2FyZElucHV0LnVwZGF0ZWRBdCFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgVXBkYXRlRXhwcmVzc2lvbjogXCJTRVQgI0NBID0gOmxpc3QsICNVQSA9IDp1YVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgUmV0dXJuVmFsdWVzOiBcIlVQREFURURfTkVXXCJcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgY2FyZCByZXNwb25zZSBvYmplY3RcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogY2FyZExpbmtlZFJlc3BvbnNlLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lbWJlcklkOiBjYXJkTGlua2VkUmVzcG9uc2UubWVtYmVySWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICogdGhpcyBpcyBub3QgdGhlIGFjdHVhbCBjcmVhdGlvbiBkYXRlLCBiZWNhdXNlIHdlJ3JlIG5vdCBpbnRlcmVzdGVkIGluIHJldHVybmluZyB0aGUgYWNjdXJhdGUgb25lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICogKHNpbmNlIHdlIGRvbid0IG1vZGlmeSBpdCwgYW5kIHRodXMgd2UgZG9uJ3QgcmV0cmlldmUgaXQgZnJvbSB0aGUgZGF0YWJhc2UpLCBidXQgcmF0aGVyIHRoZSB1cGRhdGUgZGF0ZS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IGNhcmRMaW5rZWRSZXNwb25zZS5jcmVhdGVkQXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlZEF0OiBjYXJkTGlua2VkUmVzcG9uc2UudXBkYXRlZEF0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRMaW5rZWRSZXNwb25zZS5jYXJkc1swXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFVuZXhwZWN0ZWQgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gdGhlIGFkZCBjYXJkIGNhbGwhYCk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgdGhlcmUgYXJlIGVycm9ycyBhc3NvY2lhdGVkIHdpdGggYWRkIGNhcmQgY2FsbCwganVzdCByZXR1cm4gdGhlIGVycm9yIG1lc3NhZ2UgYW5kIGVycm9yIHR5cGUgZnJvbSB0aGUgdXBzdHJlYW0gY2xpZW50XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGFkZENhcmRSZXNwb25zZS5lcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IGFkZENhcmRSZXNwb25zZS5lcnJvclR5cGVcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBVbmV4cGVjdGVkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tIHRoZSB1cGRhdGUgbWVtYmVyIHN0YXR1cyBjYWxsIWApO1xuXG4gICAgICAgICAgICAgICAgLy8gaWYgdGhlcmUgYXJlIGVycm9ycyBhc3NvY2lhdGVkIHdpdGggdGhlIHVwZGF0ZSBtZW1iZXIgc3RhdHVzIGNhbGwsIGp1c3QgcmV0dXJuIHRoZSBlcnJvciBtZXNzYWdlIGFuZCBlcnJvciB0eXBlIGZyb20gdGhlIHVwc3RyZWFtIGNsaWVudFxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogdXBkYXRlTWVtYmVyUmVzcG9uc2UuZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IHVwZGF0ZU1lbWJlclJlc3BvbnNlLmVycm9yVHlwZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyBhZGRDYXJkIG11dGF0aW9uICR7ZXJyfWA7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=