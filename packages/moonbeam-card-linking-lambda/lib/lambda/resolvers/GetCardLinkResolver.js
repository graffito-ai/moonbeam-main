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
            const cards = retrievedData.Item.cards.L.length !== 0
                ? [{
                        last4: retrievedData.Item.cards.L[0].M.last4.S,
                        name: retrievedData.Item.cards.L[0].M.name.S,
                        id: retrievedData.Item.cards.L[0].M.id.S,
                        applicationID: retrievedData.Item.cards.L[0].M.applicationID.S,
                        type: retrievedData.Item.cards.L[0].M.type.S,
                        token: retrievedData.Item.cards.L[0].M.token.S
                    }]
                : [];
            // return the retrieved card linking object
            return {
                data: {
                    id: retrievedData.Item.id.S,
                    memberId: retrievedData.Item.memberId.S,
                    createdAt: retrievedData.Item.createdAt.S,
                    updatedAt: retrievedData.Item.updatedAt.S,
                    cards: cards
                }
            };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2V0Q2FyZExpbmtSZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL0dldENhcmRMaW5rUmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsOERBQXdFO0FBQ3hFLCtEQUFnSDtBQUVoSDs7Ozs7O0dBTUc7QUFDSSxNQUFNLFdBQVcsR0FBRyxLQUFLLEVBQUUsU0FBaUIsRUFBRSxnQkFBa0MsRUFBNkIsRUFBRTtJQUNsSCxJQUFJO1FBQ0EseUNBQXlDO1FBQ3pDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVyxDQUFDO1FBRXZDLDRDQUE0QztRQUM1QyxNQUFNLGNBQWMsR0FBRyxJQUFJLGdDQUFjLENBQUMsRUFBQyxNQUFNLEVBQUUsTUFBTSxFQUFDLENBQUMsQ0FBQztRQUU1RCx3RUFBd0U7UUFDeEUsTUFBTSxhQUFhLEdBQUcsTUFBTSxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksZ0NBQWMsQ0FBQztZQUMvRCxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBbUI7WUFDMUMsR0FBRyxFQUFFO2dCQUNELEVBQUUsRUFBRTtvQkFDQSxDQUFDLEVBQUUsZ0JBQWdCLENBQUMsRUFBRTtpQkFDekI7YUFDSjtTQUNKLENBQUMsQ0FBQyxDQUFDO1FBRUosNERBQTREO1FBQzVELElBQUksYUFBYSxJQUFJLGFBQWEsQ0FBQyxJQUFJLEVBQUU7WUFDckMsd0lBQXdJO1lBQ3hJLE1BQU0sS0FBSyxHQUFXLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUUsQ0FBQyxNQUFNLEtBQUssQ0FBQztnQkFDMUQsQ0FBQyxDQUFDLENBQUM7d0JBQ0MsS0FBSyxFQUFFLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFFLENBQUMsS0FBSyxDQUFDLENBQUU7d0JBQ2pELElBQUksRUFBRSxhQUFhLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBRSxDQUFDLElBQUksQ0FBQyxDQUFFO3dCQUMvQyxFQUFFLEVBQUUsYUFBYSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRTt3QkFDM0MsYUFBYSxFQUFFLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFFLENBQUMsYUFBYSxDQUFDLENBQUU7d0JBQ2pFLElBQUksRUFBRSxhQUFhLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBRSxDQUFDLElBQUksQ0FBQyxDQUFjO3dCQUMzRCxLQUFLLEVBQUUsYUFBYSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBRTtxQkFDcEQsQ0FBQztnQkFDRixDQUFDLENBQUMsRUFBRSxDQUFDO1lBRVQsMkNBQTJDO1lBQzNDLE9BQU87Z0JBQ0gsSUFBSSxFQUFFO29CQUNGLEVBQUUsRUFBRSxhQUFhLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFFO29CQUM1QixRQUFRLEVBQUUsYUFBYSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBRTtvQkFDeEMsU0FBUyxFQUFFLGFBQWEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUU7b0JBQzFDLFNBQVMsRUFBRSxhQUFhLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFFO29CQUMxQyxLQUFLLEVBQUUsS0FBSztpQkFDZjthQUNKLENBQUE7U0FDSjthQUFNO1lBQ0gsTUFBTSxZQUFZLEdBQUcsb0NBQW9DLGdCQUFnQixDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQy9FLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7WUFFMUIsT0FBTztnQkFDSCxZQUFZLEVBQUUsWUFBWTtnQkFDMUIsU0FBUyxFQUFFLG1DQUFpQixDQUFDLFlBQVk7YUFDNUMsQ0FBQTtTQUNKO0tBRUo7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNWLE1BQU0sWUFBWSxHQUFHLG9DQUFvQyxTQUFTLFVBQVUsR0FBRyxFQUFFLENBQUM7UUFDbEYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMxQixPQUFPO1lBQ0gsWUFBWSxFQUFFLFlBQVk7WUFDMUIsU0FBUyxFQUFFLG1DQUFpQixDQUFDLGVBQWU7U0FDL0MsQ0FBQztLQUNMO0FBQ0wsQ0FBQyxDQUFBO0FBNURZLFFBQUEsV0FBVyxlQTREdkIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0R5bmFtb0RCQ2xpZW50LCBHZXRJdGVtQ29tbWFuZH0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1keW5hbW9kYlwiO1xuaW1wb3J0IHtDYXJkLCBDYXJkTGlua0Vycm9yVHlwZSwgQ2FyZExpbmtSZXNwb25zZSwgQ2FyZFR5cGUsIEdldENhcmRMaW5rSW5wdXR9IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5cbi8qKlxuICogR2V0Q2FyZExpbmsgcmVzb2x2ZXJcbiAqXG4gKiBAcGFyYW0gZmllbGROYW1lIG5hbWUgb2YgdGhlIHJlc29sdmVyIHBhdGggZnJvbSB0aGUgQXBwU3luYyBldmVudFxuICogQHBhcmFtIGdldENhcmRMaW5rSW5wdXQgY2FyZCBsaW5rIGlucHV0IHVzZWQgZm9yIHRoZSBsaW5raW5nIG9iamVjdCB0byBiZSByZXRyaWV2ZWRcbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgQ2FyZExpbmtSZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IGdldENhcmRMaW5rID0gYXN5bmMgKGZpZWxkTmFtZTogc3RyaW5nLCBnZXRDYXJkTGlua0lucHV0OiBHZXRDYXJkTGlua0lucHV0KTogUHJvbWlzZTxDYXJkTGlua1Jlc3BvbnNlPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gcmV0cmlldmluZyB0aGUgY3VycmVudCBmdW5jdGlvbiByZWdpb25cbiAgICAgICAgY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiE7XG5cbiAgICAgICAgLy8gaW5pdGlhbGl6aW5nIHRoZSBEeW5hbW9EQiBkb2N1bWVudCBjbGllbnRcbiAgICAgICAgY29uc3QgZHluYW1vRGJDbGllbnQgPSBuZXcgRHluYW1vREJDbGllbnQoe3JlZ2lvbjogcmVnaW9ufSk7XG5cbiAgICAgICAgLy8gcmV0cmlldmUgdGhlIGNhcmQgbGlua2luZyBvYmplY3QsIGdpdmVuIHRoZSBjYXJkIGxpbmtpbmcgaW5wdXQgb2JqZWN0XG4gICAgICAgIGNvbnN0IHJldHJpZXZlZERhdGEgPSBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBHZXRJdGVtQ29tbWFuZCh7XG4gICAgICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52LkNBUkRfTElOS0lOR19UQUJMRSEsXG4gICAgICAgICAgICBLZXk6IHtcbiAgICAgICAgICAgICAgICBpZDoge1xuICAgICAgICAgICAgICAgICAgICBTOiBnZXRDYXJkTGlua0lucHV0LmlkXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG5cbiAgICAgICAgLy8gaWYgdGhlcmUgaXMgYW4gaXRlbSByZXRyaWV2ZWQsIHRoZW4gcmV0dXJuIGl0IGFjY29yZGluZ2x5XG4gICAgICAgIGlmIChyZXRyaWV2ZWREYXRhICYmIHJldHJpZXZlZERhdGEuSXRlbSkge1xuICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZXJlIGFyZSBhbnkgY2FyZHMgaW4gdGhlIGxpc3Qgb2YgY2FyZHMgZm9yIHRoZSBjYXJkIGxpbmtlZCBvYmplY3QsIGFuZCBwb3B1bGF0ZSB0aGUgcmV0dXJuZWQgY2FyZCBhcnJheSBhY2NvcmRpbmdseVxuICAgICAgICAgICAgY29uc3QgY2FyZHM6IENhcmRbXSA9IHJldHJpZXZlZERhdGEuSXRlbS5jYXJkcy5MIS5sZW5ndGggIT09IDBcbiAgICAgICAgICAgICAgICA/IFt7XG4gICAgICAgICAgICAgICAgICAgIGxhc3Q0OiByZXRyaWV2ZWREYXRhLkl0ZW0uY2FyZHMuTCFbMF0uTSEubGFzdDQuUyEsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IHJldHJpZXZlZERhdGEuSXRlbS5jYXJkcy5MIVswXS5NIS5uYW1lLlMhLFxuICAgICAgICAgICAgICAgICAgICBpZDogcmV0cmlldmVkRGF0YS5JdGVtLmNhcmRzLkwhWzBdLk0hLmlkLlMhLFxuICAgICAgICAgICAgICAgICAgICBhcHBsaWNhdGlvbklEOiByZXRyaWV2ZWREYXRhLkl0ZW0uY2FyZHMuTCFbMF0uTSEuYXBwbGljYXRpb25JRC5TISxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogcmV0cmlldmVkRGF0YS5JdGVtLmNhcmRzLkwhWzBdLk0hLnR5cGUuUyEgYXMgQ2FyZFR5cGUsXG4gICAgICAgICAgICAgICAgICAgIHRva2VuOiByZXRyaWV2ZWREYXRhLkl0ZW0uY2FyZHMuTCFbMF0uTSEudG9rZW4uUyFcbiAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgICAgIDogW107XG5cbiAgICAgICAgICAgIC8vIHJldHVybiB0aGUgcmV0cmlldmVkIGNhcmQgbGlua2luZyBvYmplY3RcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICBpZDogcmV0cmlldmVkRGF0YS5JdGVtLmlkLlMhLFxuICAgICAgICAgICAgICAgICAgICBtZW1iZXJJZDogcmV0cmlldmVkRGF0YS5JdGVtLm1lbWJlcklkLlMhLFxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IHJldHJpZXZlZERhdGEuSXRlbS5jcmVhdGVkQXQuUyEsXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRBdDogcmV0cmlldmVkRGF0YS5JdGVtLnVwZGF0ZWRBdC5TISxcbiAgICAgICAgICAgICAgICAgICAgY2FyZHM6IGNhcmRzXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYENhcmQgTGlua2VkIG9iamVjdCBub3QgZm91bmQgZm9yICR7Z2V0Q2FyZExpbmtJbnB1dC5pZH1gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLk5vbmVPckFic2VudFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgZXhlY3V0aW5nICR7ZmllbGROYW1lfSBxdWVyeSAke2Vycn1gO1xuICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICB9O1xuICAgIH1cbn1cbiJdfQ==