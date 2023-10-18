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
                    cards: cards,
                    status: retrievedData.Item.status.S
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2V0Q2FyZExpbmtSZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL0dldENhcmRMaW5rUmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsOERBQXdFO0FBQ3hFLCtEQU9tQztBQUVuQzs7Ozs7O0dBTUc7QUFDSSxNQUFNLFdBQVcsR0FBRyxLQUFLLEVBQUUsU0FBaUIsRUFBRSxnQkFBa0MsRUFBNkIsRUFBRTtJQUNsSCxJQUFJO1FBQ0EseUNBQXlDO1FBQ3pDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVyxDQUFDO1FBRXZDLDRDQUE0QztRQUM1QyxNQUFNLGNBQWMsR0FBRyxJQUFJLGdDQUFjLENBQUMsRUFBQyxNQUFNLEVBQUUsTUFBTSxFQUFDLENBQUMsQ0FBQztRQUU1RCx3RUFBd0U7UUFDeEUsTUFBTSxhQUFhLEdBQUcsTUFBTSxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksZ0NBQWMsQ0FBQztZQUMvRCxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBbUI7WUFDMUMsR0FBRyxFQUFFO2dCQUNELEVBQUUsRUFBRTtvQkFDQSxDQUFDLEVBQUUsZ0JBQWdCLENBQUMsRUFBRTtpQkFDekI7YUFDSjtTQUNKLENBQUMsQ0FBQyxDQUFDO1FBRUosNERBQTREO1FBQzVELElBQUksYUFBYSxJQUFJLGFBQWEsQ0FBQyxJQUFJLEVBQUU7WUFDckMsd0lBQXdJO1lBQ3hJLE1BQU0sS0FBSyxHQUFXLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUUsQ0FBQyxNQUFNLEtBQUssQ0FBQztnQkFDMUQsQ0FBQyxDQUFDLENBQUM7d0JBQ0MsS0FBSyxFQUFFLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFFLENBQUMsS0FBSyxDQUFDLENBQUU7d0JBQ2pELElBQUksRUFBRSxhQUFhLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBRSxDQUFDLElBQUksQ0FBQyxDQUFFO3dCQUMvQyxFQUFFLEVBQUUsYUFBYSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRTt3QkFDM0MsYUFBYSxFQUFFLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFFLENBQUMsYUFBYSxDQUFDLENBQUU7d0JBQ2pFLElBQUksRUFBRSxhQUFhLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBRSxDQUFDLElBQUksQ0FBQyxDQUFjO3dCQUMzRCxLQUFLLEVBQUUsYUFBYSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBRTtxQkFDcEQsQ0FBQztnQkFDRixDQUFDLENBQUMsRUFBRSxDQUFDO1lBRVQsMkNBQTJDO1lBQzNDLE9BQU87Z0JBQ0gsSUFBSSxFQUFFO29CQUNGLEVBQUUsRUFBRSxhQUFhLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFFO29CQUM1QixRQUFRLEVBQUUsYUFBYSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBRTtvQkFDeEMsU0FBUyxFQUFFLGFBQWEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUU7b0JBQzFDLFNBQVMsRUFBRSxhQUFhLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFFO29CQUMxQyxLQUFLLEVBQUUsS0FBSztvQkFDWixNQUFNLEVBQUUsYUFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBdUI7aUJBQzVEO2FBQ0osQ0FBQTtTQUNKO2FBQU07WUFDSCxNQUFNLFlBQVksR0FBRyxvQ0FBb0MsZ0JBQWdCLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDL0UsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUUxQixPQUFPO2dCQUNILFlBQVksRUFBRSxZQUFZO2dCQUMxQixTQUFTLEVBQUUsbUNBQWlCLENBQUMsWUFBWTthQUM1QyxDQUFBO1NBQ0o7S0FFSjtJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1YsTUFBTSxZQUFZLEdBQUcsb0NBQW9DLFNBQVMsVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUNsRixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzFCLE9BQU87WUFDSCxZQUFZLEVBQUUsWUFBWTtZQUMxQixTQUFTLEVBQUUsbUNBQWlCLENBQUMsZUFBZTtTQUMvQyxDQUFDO0tBQ0w7QUFDTCxDQUFDLENBQUE7QUE3RFksUUFBQSxXQUFXLGVBNkR2QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RHluYW1vREJDbGllbnQsIEdldEl0ZW1Db21tYW5kfSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LWR5bmFtb2RiXCI7XG5pbXBvcnQge1xuICAgIENhcmQsXG4gICAgQ2FyZExpbmtFcnJvclR5cGUsXG4gICAgQ2FyZExpbmtpbmdTdGF0dXMsXG4gICAgQ2FyZExpbmtSZXNwb25zZSxcbiAgICBDYXJkVHlwZSxcbiAgICBHZXRDYXJkTGlua0lucHV0XG59IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5cbi8qKlxuICogR2V0Q2FyZExpbmsgcmVzb2x2ZXJcbiAqXG4gKiBAcGFyYW0gZmllbGROYW1lIG5hbWUgb2YgdGhlIHJlc29sdmVyIHBhdGggZnJvbSB0aGUgQXBwU3luYyBldmVudFxuICogQHBhcmFtIGdldENhcmRMaW5rSW5wdXQgY2FyZCBsaW5rIGlucHV0IHVzZWQgZm9yIHRoZSBsaW5raW5nIG9iamVjdCB0byBiZSByZXRyaWV2ZWRcbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgQ2FyZExpbmtSZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IGdldENhcmRMaW5rID0gYXN5bmMgKGZpZWxkTmFtZTogc3RyaW5nLCBnZXRDYXJkTGlua0lucHV0OiBHZXRDYXJkTGlua0lucHV0KTogUHJvbWlzZTxDYXJkTGlua1Jlc3BvbnNlPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gcmV0cmlldmluZyB0aGUgY3VycmVudCBmdW5jdGlvbiByZWdpb25cbiAgICAgICAgY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiE7XG5cbiAgICAgICAgLy8gaW5pdGlhbGl6aW5nIHRoZSBEeW5hbW9EQiBkb2N1bWVudCBjbGllbnRcbiAgICAgICAgY29uc3QgZHluYW1vRGJDbGllbnQgPSBuZXcgRHluYW1vREJDbGllbnQoe3JlZ2lvbjogcmVnaW9ufSk7XG5cbiAgICAgICAgLy8gcmV0cmlldmUgdGhlIGNhcmQgbGlua2luZyBvYmplY3QsIGdpdmVuIHRoZSBjYXJkIGxpbmtpbmcgaW5wdXQgb2JqZWN0XG4gICAgICAgIGNvbnN0IHJldHJpZXZlZERhdGEgPSBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBHZXRJdGVtQ29tbWFuZCh7XG4gICAgICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52LkNBUkRfTElOS0lOR19UQUJMRSEsXG4gICAgICAgICAgICBLZXk6IHtcbiAgICAgICAgICAgICAgICBpZDoge1xuICAgICAgICAgICAgICAgICAgICBTOiBnZXRDYXJkTGlua0lucHV0LmlkXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG5cbiAgICAgICAgLy8gaWYgdGhlcmUgaXMgYW4gaXRlbSByZXRyaWV2ZWQsIHRoZW4gcmV0dXJuIGl0IGFjY29yZGluZ2x5XG4gICAgICAgIGlmIChyZXRyaWV2ZWREYXRhICYmIHJldHJpZXZlZERhdGEuSXRlbSkge1xuICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZXJlIGFyZSBhbnkgY2FyZHMgaW4gdGhlIGxpc3Qgb2YgY2FyZHMgZm9yIHRoZSBjYXJkIGxpbmtlZCBvYmplY3QsIGFuZCBwb3B1bGF0ZSB0aGUgcmV0dXJuZWQgY2FyZCBhcnJheSBhY2NvcmRpbmdseVxuICAgICAgICAgICAgY29uc3QgY2FyZHM6IENhcmRbXSA9IHJldHJpZXZlZERhdGEuSXRlbS5jYXJkcy5MIS5sZW5ndGggIT09IDBcbiAgICAgICAgICAgICAgICA/IFt7XG4gICAgICAgICAgICAgICAgICAgIGxhc3Q0OiByZXRyaWV2ZWREYXRhLkl0ZW0uY2FyZHMuTCFbMF0uTSEubGFzdDQuUyEsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IHJldHJpZXZlZERhdGEuSXRlbS5jYXJkcy5MIVswXS5NIS5uYW1lLlMhLFxuICAgICAgICAgICAgICAgICAgICBpZDogcmV0cmlldmVkRGF0YS5JdGVtLmNhcmRzLkwhWzBdLk0hLmlkLlMhLFxuICAgICAgICAgICAgICAgICAgICBhcHBsaWNhdGlvbklEOiByZXRyaWV2ZWREYXRhLkl0ZW0uY2FyZHMuTCFbMF0uTSEuYXBwbGljYXRpb25JRC5TISxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogcmV0cmlldmVkRGF0YS5JdGVtLmNhcmRzLkwhWzBdLk0hLnR5cGUuUyEgYXMgQ2FyZFR5cGUsXG4gICAgICAgICAgICAgICAgICAgIHRva2VuOiByZXRyaWV2ZWREYXRhLkl0ZW0uY2FyZHMuTCFbMF0uTSEudG9rZW4uUyFcbiAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgICAgIDogW107XG5cbiAgICAgICAgICAgIC8vIHJldHVybiB0aGUgcmV0cmlldmVkIGNhcmQgbGlua2luZyBvYmplY3RcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICBpZDogcmV0cmlldmVkRGF0YS5JdGVtLmlkLlMhLFxuICAgICAgICAgICAgICAgICAgICBtZW1iZXJJZDogcmV0cmlldmVkRGF0YS5JdGVtLm1lbWJlcklkLlMhLFxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IHJldHJpZXZlZERhdGEuSXRlbS5jcmVhdGVkQXQuUyEsXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRBdDogcmV0cmlldmVkRGF0YS5JdGVtLnVwZGF0ZWRBdC5TISxcbiAgICAgICAgICAgICAgICAgICAgY2FyZHM6IGNhcmRzLFxuICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IHJldHJpZXZlZERhdGEuSXRlbS5zdGF0dXMuUyEgYXMgQ2FyZExpbmtpbmdTdGF0dXNcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgQ2FyZCBMaW5rZWQgb2JqZWN0IG5vdCBmb3VuZCBmb3IgJHtnZXRDYXJkTGlua0lucHV0LmlkfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuTm9uZU9yQWJzZW50XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgJHtmaWVsZE5hbWV9IHF1ZXJ5ICR7ZXJyfWA7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgIH07XG4gICAgfVxufVxuIl19