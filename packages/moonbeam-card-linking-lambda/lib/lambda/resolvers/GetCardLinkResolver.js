"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCardLink = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * GetCardLink resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param getCardLinkInput card link input used for the linking object to be retrieved
 * @returns {@link Promise} of {@link CardLinkResponse}
 */
const getCardLink = async (fieldName, getCardLinkInput) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        // initializing the DynamoDB document client
        const dynamoDbClient = new client_dynamodb_1.DynamoDBClient({ region: region });
        // retrieve the card linking object, given the card linking input object
        const retrievedData = await dynamoDbClient.send(new client_dynamodb_1.GetItemCommand({
            TableName: process.env.CARD_LINKING_TABLE,
            Key: {
                id: {
                    S: getCardLinkInput.id
                }
            }
        }));
        // if there is an item retrieved, then return it accordingly
        if (retrievedData && retrievedData.Item) {
            // check to see if there are any cards in the list of cards for the card linked object, and populate the returned card array accordingly
            if (retrievedData.Item.cards.L.length !== 0) {
                // go through the list of cards retrieved and populate it accordingly
                const cards = [];
                for (const retrievedCardData of retrievedData.Item.cards.L) {
                    // create the new card object from the retrieve card data object
                    const cardObject = {
                        last4: retrievedCardData.M.last4.S,
                        name: retrievedCardData.M.name.S,
                        id: retrievedCardData.M.id.S,
                        applicationID: retrievedCardData.M.applicationID.S,
                        type: retrievedCardData.M.type.S,
                        token: retrievedCardData.M.token.S
                    };
                    cards.push(cardObject);
                }
                // return the retrieved card linking object
                return {
                    data: {
                        id: retrievedData.Item.id.S,
                        memberId: retrievedData.Item.memberId.S,
                        createdAt: retrievedData.Item.createdAt.S,
                        updatedAt: retrievedData.Item.updatedAt.S,
                        cards: cards,
                        status: retrievedData.Item.status.S
                    }
                };
            }
            else {
                console.log(`No cards in the card linked object for user ${getCardLinkInput.id}`);
                // return the retrieved card linking object
                return {
                    data: {
                        id: retrievedData.Item.id.S,
                        memberId: retrievedData.Item.memberId.S,
                        createdAt: retrievedData.Item.createdAt.S,
                        updatedAt: retrievedData.Item.updatedAt.S,
                        cards: [],
                        status: retrievedData.Item.status.S
                    }
                };
            }
        }
        else {
            const errorMessage = `Card Linked object not found for ${getCardLinkInput.id}`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.CardLinkErrorType.NoneOrAbsent
            };
        }
    }
    catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} query ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: moonbeam_models_1.CardLinkErrorType.UnexpectedError
        };
    }
};
exports.getCardLink = getCardLink;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2V0Q2FyZExpbmtSZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL0dldENhcmRMaW5rUmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsOERBQXdFO0FBQ3hFLCtEQU9tQztBQUVuQzs7Ozs7O0dBTUc7QUFDSSxNQUFNLFdBQVcsR0FBRyxLQUFLLEVBQUUsU0FBaUIsRUFBRSxnQkFBa0MsRUFBNkIsRUFBRTtJQUNsSCxJQUFJO1FBQ0EseUNBQXlDO1FBQ3pDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVyxDQUFDO1FBRXZDLDRDQUE0QztRQUM1QyxNQUFNLGNBQWMsR0FBRyxJQUFJLGdDQUFjLENBQUMsRUFBQyxNQUFNLEVBQUUsTUFBTSxFQUFDLENBQUMsQ0FBQztRQUU1RCx3RUFBd0U7UUFDeEUsTUFBTSxhQUFhLEdBQUcsTUFBTSxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksZ0NBQWMsQ0FBQztZQUMvRCxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBbUI7WUFDMUMsR0FBRyxFQUFFO2dCQUNELEVBQUUsRUFBRTtvQkFDQSxDQUFDLEVBQUUsZ0JBQWdCLENBQUMsRUFBRTtpQkFDekI7YUFDSjtTQUNKLENBQUMsQ0FBQyxDQUFDO1FBRUosNERBQTREO1FBQzVELElBQUksYUFBYSxJQUFJLGFBQWEsQ0FBQyxJQUFJLEVBQUU7WUFDckMsd0lBQXdJO1lBQ3hJLElBQUksYUFBYSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBRSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQzFDLHFFQUFxRTtnQkFDckUsTUFBTSxLQUFLLEdBQVcsRUFBRSxDQUFDO2dCQUN6QixLQUFLLE1BQU0saUJBQWlCLElBQUksYUFBYSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBRSxFQUFFO29CQUN6RCxnRUFBZ0U7b0JBQ2hFLE1BQU0sVUFBVSxHQUFTO3dCQUNyQixLQUFLLEVBQUUsaUJBQWlCLENBQUMsQ0FBRSxDQUFDLEtBQUssQ0FBQyxDQUFFO3dCQUNwQyxJQUFJLEVBQUUsaUJBQWlCLENBQUMsQ0FBRSxDQUFDLElBQUksQ0FBQyxDQUFFO3dCQUNsQyxFQUFFLEVBQUUsaUJBQWlCLENBQUMsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFO3dCQUM5QixhQUFhLEVBQUUsaUJBQWlCLENBQUMsQ0FBRSxDQUFDLGFBQWEsQ0FBQyxDQUFFO3dCQUNwRCxJQUFJLEVBQUUsaUJBQWlCLENBQUMsQ0FBRSxDQUFDLElBQUksQ0FBQyxDQUFjO3dCQUM5QyxLQUFLLEVBQUUsaUJBQWlCLENBQUMsQ0FBRSxDQUFDLEtBQUssQ0FBQyxDQUFFO3FCQUN2QyxDQUFBO29CQUNELEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7aUJBQzFCO2dCQUVELDJDQUEyQztnQkFDM0MsT0FBTztvQkFDSCxJQUFJLEVBQUU7d0JBQ0YsRUFBRSxFQUFFLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUU7d0JBQzVCLFFBQVEsRUFBRSxhQUFhLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFFO3dCQUN4QyxTQUFTLEVBQUUsYUFBYSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBRTt3QkFDMUMsU0FBUyxFQUFFLGFBQWEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUU7d0JBQzFDLEtBQUssRUFBRSxLQUFLO3dCQUNaLE1BQU0sRUFBRSxhQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUF1QjtxQkFDNUQ7aUJBQ0osQ0FBQTthQUNKO2lCQUFNO2dCQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsK0NBQStDLGdCQUFnQixDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBRWxGLDJDQUEyQztnQkFDM0MsT0FBTztvQkFDSCxJQUFJLEVBQUU7d0JBQ0YsRUFBRSxFQUFFLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUU7d0JBQzVCLFFBQVEsRUFBRSxhQUFhLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFFO3dCQUN4QyxTQUFTLEVBQUUsYUFBYSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBRTt3QkFDMUMsU0FBUyxFQUFFLGFBQWEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUU7d0JBQzFDLEtBQUssRUFBRSxFQUFFO3dCQUNULE1BQU0sRUFBRSxhQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUF1QjtxQkFDNUQ7aUJBQ0osQ0FBQTthQUNKO1NBQ0o7YUFBTTtZQUNILE1BQU0sWUFBWSxHQUFHLG9DQUFvQyxnQkFBZ0IsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUMvRSxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRTFCLE9BQU87Z0JBQ0gsWUFBWSxFQUFFLFlBQVk7Z0JBQzFCLFNBQVMsRUFBRSxtQ0FBaUIsQ0FBQyxZQUFZO2FBQzVDLENBQUE7U0FDSjtLQUVKO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDVixNQUFNLFlBQVksR0FBRyxvQ0FBb0MsU0FBUyxVQUFVLEdBQUcsRUFBRSxDQUFDO1FBQ2xGLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDMUIsT0FBTztZQUNILFlBQVksRUFBRSxZQUFZO1lBQzFCLFNBQVMsRUFBRSxtQ0FBaUIsQ0FBQyxlQUFlO1NBQy9DLENBQUM7S0FDTDtBQUNMLENBQUMsQ0FBQTtBQWpGWSxRQUFBLFdBQVcsZUFpRnZCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtEeW5hbW9EQkNsaWVudCwgR2V0SXRlbUNvbW1hbmR9IGZyb20gXCJAYXdzLXNkay9jbGllbnQtZHluYW1vZGJcIjtcbmltcG9ydCB7XG4gICAgQ2FyZCxcbiAgICBDYXJkTGlua0Vycm9yVHlwZSxcbiAgICBDYXJkTGlua2luZ1N0YXR1cyxcbiAgICBDYXJkTGlua1Jlc3BvbnNlLFxuICAgIENhcmRUeXBlLFxuICAgIEdldENhcmRMaW5rSW5wdXRcbn0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcblxuLyoqXG4gKiBHZXRDYXJkTGluayByZXNvbHZlclxuICpcbiAqIEBwYXJhbSBmaWVsZE5hbWUgbmFtZSBvZiB0aGUgcmVzb2x2ZXIgcGF0aCBmcm9tIHRoZSBBcHBTeW5jIGV2ZW50XG4gKiBAcGFyYW0gZ2V0Q2FyZExpbmtJbnB1dCBjYXJkIGxpbmsgaW5wdXQgdXNlZCBmb3IgdGhlIGxpbmtpbmcgb2JqZWN0IHRvIGJlIHJldHJpZXZlZFxuICogQHJldHVybnMge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBDYXJkTGlua1Jlc3BvbnNlfVxuICovXG5leHBvcnQgY29uc3QgZ2V0Q2FyZExpbmsgPSBhc3luYyAoZmllbGROYW1lOiBzdHJpbmcsIGdldENhcmRMaW5rSW5wdXQ6IEdldENhcmRMaW5rSW5wdXQpOiBQcm9taXNlPENhcmRMaW5rUmVzcG9uc2U+ID0+IHtcbiAgICB0cnkge1xuICAgICAgICAvLyByZXRyaWV2aW5nIHRoZSBjdXJyZW50IGZ1bmN0aW9uIHJlZ2lvblxuICAgICAgICBjb25zdCByZWdpb24gPSBwcm9jZXNzLmVudi5BV1NfUkVHSU9OITtcblxuICAgICAgICAvLyBpbml0aWFsaXppbmcgdGhlIER5bmFtb0RCIGRvY3VtZW50IGNsaWVudFxuICAgICAgICBjb25zdCBkeW5hbW9EYkNsaWVudCA9IG5ldyBEeW5hbW9EQkNsaWVudCh7cmVnaW9uOiByZWdpb259KTtcblxuICAgICAgICAvLyByZXRyaWV2ZSB0aGUgY2FyZCBsaW5raW5nIG9iamVjdCwgZ2l2ZW4gdGhlIGNhcmQgbGlua2luZyBpbnB1dCBvYmplY3RcbiAgICAgICAgY29uc3QgcmV0cmlldmVkRGF0YSA9IGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IEdldEl0ZW1Db21tYW5kKHtcbiAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuQ0FSRF9MSU5LSU5HX1RBQkxFISxcbiAgICAgICAgICAgIEtleToge1xuICAgICAgICAgICAgICAgIGlkOiB7XG4gICAgICAgICAgICAgICAgICAgIFM6IGdldENhcmRMaW5rSW5wdXQuaWRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKTtcblxuICAgICAgICAvLyBpZiB0aGVyZSBpcyBhbiBpdGVtIHJldHJpZXZlZCwgdGhlbiByZXR1cm4gaXQgYWNjb3JkaW5nbHlcbiAgICAgICAgaWYgKHJldHJpZXZlZERhdGEgJiYgcmV0cmlldmVkRGF0YS5JdGVtKSB7XG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlcmUgYXJlIGFueSBjYXJkcyBpbiB0aGUgbGlzdCBvZiBjYXJkcyBmb3IgdGhlIGNhcmQgbGlua2VkIG9iamVjdCwgYW5kIHBvcHVsYXRlIHRoZSByZXR1cm5lZCBjYXJkIGFycmF5IGFjY29yZGluZ2x5XG4gICAgICAgICAgICBpZiAocmV0cmlldmVkRGF0YS5JdGVtLmNhcmRzLkwhLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgICAgIC8vIGdvIHRocm91Z2ggdGhlIGxpc3Qgb2YgY2FyZHMgcmV0cmlldmVkIGFuZCBwb3B1bGF0ZSBpdCBhY2NvcmRpbmdseVxuICAgICAgICAgICAgICAgIGNvbnN0IGNhcmRzOiBDYXJkW10gPSBbXTtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHJldHJpZXZlZENhcmREYXRhIG9mIHJldHJpZXZlZERhdGEuSXRlbS5jYXJkcy5MISkge1xuICAgICAgICAgICAgICAgICAgICAvLyBjcmVhdGUgdGhlIG5ldyBjYXJkIG9iamVjdCBmcm9tIHRoZSByZXRyaWV2ZSBjYXJkIGRhdGEgb2JqZWN0XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNhcmRPYmplY3Q6IENhcmQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0NDogcmV0cmlldmVkQ2FyZERhdGEuTSEubGFzdDQuUyEsXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiByZXRyaWV2ZWRDYXJkRGF0YS5NIS5uYW1lLlMhLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHJldHJpZXZlZENhcmREYXRhLk0hLmlkLlMhLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwbGljYXRpb25JRDogcmV0cmlldmVkQ2FyZERhdGEuTSEuYXBwbGljYXRpb25JRC5TISxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IHJldHJpZXZlZENhcmREYXRhLk0hLnR5cGUuUyEgYXMgQ2FyZFR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0b2tlbjogcmV0cmlldmVkQ2FyZERhdGEuTSEudG9rZW4uUyFcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYXJkcy5wdXNoKGNhcmRPYmplY3QpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgcmV0cmlldmVkIGNhcmQgbGlua2luZyBvYmplY3RcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogcmV0cmlldmVkRGF0YS5JdGVtLmlkLlMhLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVtYmVySWQ6IHJldHJpZXZlZERhdGEuSXRlbS5tZW1iZXJJZC5TISxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDogcmV0cmlldmVkRGF0YS5JdGVtLmNyZWF0ZWRBdC5TISxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRBdDogcmV0cmlldmVkRGF0YS5JdGVtLnVwZGF0ZWRBdC5TISxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRzOiBjYXJkcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1czogcmV0cmlldmVkRGF0YS5JdGVtLnN0YXR1cy5TISBhcyBDYXJkTGlua2luZ1N0YXR1c1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgTm8gY2FyZHMgaW4gdGhlIGNhcmQgbGlua2VkIG9iamVjdCBmb3IgdXNlciAke2dldENhcmRMaW5rSW5wdXQuaWR9YCk7XG5cbiAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIHJldHJpZXZlZCBjYXJkIGxpbmtpbmcgb2JqZWN0XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHJldHJpZXZlZERhdGEuSXRlbS5pZC5TISxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lbWJlcklkOiByZXRyaWV2ZWREYXRhLkl0ZW0ubWVtYmVySWQuUyEsXG4gICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IHJldHJpZXZlZERhdGEuSXRlbS5jcmVhdGVkQXQuUyEsXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVkQXQ6IHJldHJpZXZlZERhdGEuSXRlbS51cGRhdGVkQXQuUyEsXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXJkczogW10sXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IHJldHJpZXZlZERhdGEuSXRlbS5zdGF0dXMuUyEgYXMgQ2FyZExpbmtpbmdTdGF0dXNcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBDYXJkIExpbmtlZCBvYmplY3Qgbm90IGZvdW5kIGZvciAke2dldENhcmRMaW5rSW5wdXQuaWR9YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5Ob25lT3JBYnNlbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyAke2ZpZWxkTmFtZX0gcXVlcnkgJHtlcnJ9YDtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgfTtcbiAgICB9XG59XG4iXX0=