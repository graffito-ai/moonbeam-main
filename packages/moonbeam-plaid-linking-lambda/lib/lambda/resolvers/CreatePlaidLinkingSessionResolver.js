"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPlaidLinkingSession = void 0;
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
/**
 * CreatePlaidLinkingSession resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param createPlaidLinkingSessionInput plaid session linking input object, used to create a plaid linking
 * session object
 * @returns {@link Promise} of {@link PlaidLinkingSessionResponse}
 */
const createPlaidLinkingSession = async (fieldName, createPlaidLinkingSessionInput) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        // initializing the DynamoDB document client
        const dynamoDbClient = new client_dynamodb_1.DynamoDBClient({ region: region });
        // update the appropriate parameters in the session input
        const createdAt = new Date().toISOString();
        createPlaidLinkingSessionInput.client_name = 'Moonbeam Finance';
        createPlaidLinkingSessionInput.link_customization_name = 'moonbeam_plaid_link';
        createPlaidLinkingSessionInput.createdAt = createPlaidLinkingSessionInput.createdAt ? createPlaidLinkingSessionInput.createdAt : createdAt;
        createPlaidLinkingSessionInput.updatedAt = createPlaidLinkingSessionInput.updatedAt ? createPlaidLinkingSessionInput.updatedAt : createdAt;
        createPlaidLinkingSessionInput.country_codes = [moonbeam_models_1.PlaidCountryCodes.Us];
        createPlaidLinkingSessionInput.webhook = process.env.ENV_NAME === moonbeam_models_1.Stages.DEV
            ? "https://api-plaid-dev.moonbeam.vet/plaidAcknowledgment"
            : "https://api-plaid.moonbeam.vet/plaidAcknowledgment";
        createPlaidLinkingSessionInput.language = moonbeam_models_1.PlaidLanguages.En;
        createPlaidLinkingSessionInput.products = [moonbeam_models_1.PlaidProducts.Auth, moonbeam_models_1.PlaidProducts.Transactions];
        createPlaidLinkingSessionInput.transactions = {
            days_requested: 1
        };
        createPlaidLinkingSessionInput.account_filters = {
            depository: {
                account_subtypes: [moonbeam_models_1.PlaidLinkingAccountSubtype.Checking]
            }
        };
        /**
         * If using Hosted Link, the redirect_uri must be set to https://hosted.plaid.com/oauth/redirect
         * {@link https://plaid.com/docs/api/tokens/#linktokencreate}
         */
        createPlaidLinkingSessionInput.redirect_uri = 'https://hosted.plaid.com/oauth/redirect';
        /**
         * check to see if the linking session already exists. If it does, then return an error.
         */
        const preExistingPlaidLinkingSession = await dynamoDbClient.send(new client_dynamodb_1.GetItemCommand({
            TableName: process.env.PLAID_LINKING_SESSIONS_TABLE,
            Key: {
                id: {
                    S: createPlaidLinkingSessionInput.user.client_user_id
                },
                timestamp: {
                    N: Date.parse(createdAt).toString()
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
        // if there is an item retrieved, then we return an error
        if (preExistingPlaidLinkingSession && preExistingPlaidLinkingSession.Item) {
            // if there is an existent link object, then we cannot duplicate that, so we will return an error
            const errorMessage = `Pre-existing Plaid linking session object. Delete it before adding a new one!`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.PlaidLinkingErrorType.DuplicateObjectFound
            };
        }
        else {
            // initialize the Plaid Client API here, in order to call the appropriate endpoints for this resolver
            const plaidClient = new moonbeam_models_1.PlaidClient(process.env.ENV_NAME, region);
            // execute the member linking session creation call
            const response = await plaidClient.createPlaidLinkSession(createPlaidLinkingSessionInput);
            // check to see if the linking session creation call was executed successfully
            if (response && !response.errorMessage && !response.errorType && response.data) {
                // convert the incoming linked session data into a PlaidLinkingSession object
                const plaidLinkingSession = response.data;
                // store the Plaid linking session object
                await dynamoDbClient.send(new client_dynamodb_1.PutItemCommand({
                    TableName: process.env.PLAID_LINKING_SESSIONS_TABLE,
                    Item: {
                        id: {
                            S: plaidLinkingSession.id
                        },
                        expiration: {
                            S: plaidLinkingSession.expiration
                        },
                        createdAt: {
                            S: plaidLinkingSession.createdAt
                        },
                        updatedAt: {
                            S: plaidLinkingSession.updatedAt
                        },
                        hosted_link_url: {
                            S: plaidLinkingSession.hosted_link_url
                        },
                        link_token: {
                            S: plaidLinkingSession.link_token
                        },
                        request_id: {
                            S: plaidLinkingSession.request_id
                        },
                        timestamp: {
                            N: Date.parse(createdAt).toString()
                        },
                        session_id: {
                            S: plaidLinkingSession.session_id
                        }
                    },
                }));
                // return the plaid linking session object
                return {
                    data: plaidLinkingSession
                };
            }
            else {
                console.log(`Unexpected error returned from the linking session creation call!`);
                // if there are errors associated with the call, just return the error message and error type from the upstream client
                return {
                    errorMessage: response.errorMessage,
                    errorType: moonbeam_models_1.PlaidLinkingErrorType.ValidationError
                };
            }
        }
    }
    catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} mutation ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: moonbeam_models_1.PlaidLinkingErrorType.UnexpectedError
        };
    }
};
exports.createPlaidLinkingSession = createPlaidLinkingSession;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvblJlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9yZXNvbHZlcnMvQ3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvblJlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtEQVVtQztBQUNuQyw4REFBd0Y7QUFFeEY7Ozs7Ozs7R0FPRztBQUNJLE1BQU0seUJBQXlCLEdBQUcsS0FBSyxFQUFFLFNBQWlCLEVBQUUsOEJBQThELEVBQXdDLEVBQUU7SUFDdkssSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2Qyw0Q0FBNEM7UUFDNUMsTUFBTSxjQUFjLEdBQUcsSUFBSSxnQ0FBYyxDQUFDLEVBQUMsTUFBTSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7UUFFNUQseURBQXlEO1FBQ3pELE1BQU0sU0FBUyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDM0MsOEJBQThCLENBQUMsV0FBVyxHQUFHLGtCQUFrQixDQUFDO1FBQ2hFLDhCQUE4QixDQUFDLHVCQUF1QixHQUFHLHFCQUFxQixDQUFDO1FBQy9FLDhCQUE4QixDQUFDLFNBQVMsR0FBRyw4QkFBOEIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLDhCQUE4QixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQzNJLDhCQUE4QixDQUFDLFNBQVMsR0FBRyw4QkFBOEIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLDhCQUE4QixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQzNJLDhCQUE4QixDQUFDLGFBQWEsR0FBRyxDQUFDLG1DQUFpQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3RFLDhCQUE4QixDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVMsS0FBSyx3QkFBTSxDQUFDLEdBQUc7WUFDekUsQ0FBQyxDQUFDLHdEQUF3RDtZQUMxRCxDQUFDLENBQUMsb0RBQW9ELENBQUM7UUFDM0QsOEJBQThCLENBQUMsUUFBUSxHQUFHLGdDQUFjLENBQUMsRUFBRSxDQUFDO1FBQzVELDhCQUE4QixDQUFDLFFBQVEsR0FBRyxDQUFDLCtCQUFhLENBQUMsSUFBSSxFQUFFLCtCQUFhLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDM0YsOEJBQThCLENBQUMsWUFBWSxHQUFHO1lBQzFDLGNBQWMsRUFBRSxDQUFDO1NBQ3BCLENBQUE7UUFDRCw4QkFBOEIsQ0FBQyxlQUFlLEdBQUc7WUFDN0MsVUFBVSxFQUFFO2dCQUNSLGdCQUFnQixFQUFFLENBQUMsNENBQTBCLENBQUMsUUFBUSxDQUFDO2FBQzFEO1NBQ0osQ0FBQTtRQUNEOzs7V0FHRztRQUNILDhCQUE4QixDQUFDLFlBQVksR0FBRyx5Q0FBeUMsQ0FBQztRQUV4Rjs7V0FFRztRQUNILE1BQU0sOEJBQThCLEdBQUcsTUFBTSxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksZ0NBQWMsQ0FBQztZQUNoRixTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyw0QkFBNkI7WUFDcEQsR0FBRyxFQUFFO2dCQUNELEVBQUUsRUFBRTtvQkFDQSxDQUFDLEVBQUUsOEJBQThCLENBQUMsSUFBSSxDQUFDLGNBQWM7aUJBQ3hEO2dCQUNELFNBQVMsRUFBRTtvQkFDUCxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxRQUFRLEVBQUU7aUJBQ3RDO2FBQ0o7WUFDRDs7Ozs7ZUFLRztZQUNILG9CQUFvQixFQUFFLE1BQU07WUFDNUIsd0JBQXdCLEVBQUU7Z0JBQ3RCLE1BQU0sRUFBRSxJQUFJO2FBQ2Y7U0FDSixDQUFDLENBQUMsQ0FBQztRQUVKLHlEQUF5RDtRQUN6RCxJQUFJLDhCQUE4QixJQUFJLDhCQUE4QixDQUFDLElBQUksRUFBRTtZQUN2RSxpR0FBaUc7WUFDakcsTUFBTSxZQUFZLEdBQUcsK0VBQStFLENBQUM7WUFDckcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUUxQixPQUFPO2dCQUNILFlBQVksRUFBRSxZQUFZO2dCQUMxQixTQUFTLEVBQUUsdUNBQXFCLENBQUMsb0JBQW9CO2FBQ3hELENBQUE7U0FDSjthQUFNO1lBQ0gscUdBQXFHO1lBQ3JHLE1BQU0sV0FBVyxHQUFHLElBQUksNkJBQVcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUVuRSxtREFBbUQ7WUFDbkQsTUFBTSxRQUFRLEdBQWdDLE1BQU0sV0FBVyxDQUFDLHNCQUFzQixDQUFDLDhCQUE4QixDQUFDLENBQUM7WUFFdkgsOEVBQThFO1lBQzlFLElBQUksUUFBUSxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLElBQUksUUFBUSxDQUFDLElBQUksRUFBRTtnQkFDNUUsNkVBQTZFO2dCQUM3RSxNQUFNLG1CQUFtQixHQUFHLFFBQVEsQ0FBQyxJQUEyQixDQUFDO2dCQUVqRSx5Q0FBeUM7Z0JBQ3pDLE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLGdDQUFjLENBQUM7b0JBQ3pDLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLDRCQUE2QjtvQkFDcEQsSUFBSSxFQUFFO3dCQUNGLEVBQUUsRUFBRTs0QkFDQSxDQUFDLEVBQUUsbUJBQW1CLENBQUMsRUFBRTt5QkFDNUI7d0JBQ0QsVUFBVSxFQUFFOzRCQUNSLENBQUMsRUFBRSxtQkFBbUIsQ0FBQyxVQUFVO3lCQUNwQzt3QkFDRCxTQUFTLEVBQUU7NEJBQ1AsQ0FBQyxFQUFFLG1CQUFtQixDQUFDLFNBQVM7eUJBQ25DO3dCQUNELFNBQVMsRUFBRTs0QkFDUCxDQUFDLEVBQUUsbUJBQW1CLENBQUMsU0FBUzt5QkFDbkM7d0JBQ0QsZUFBZSxFQUFFOzRCQUNiLENBQUMsRUFBRSxtQkFBbUIsQ0FBQyxlQUFlO3lCQUN6Qzt3QkFDRCxVQUFVLEVBQUU7NEJBQ1IsQ0FBQyxFQUFFLG1CQUFtQixDQUFDLFVBQVU7eUJBQ3BDO3dCQUNELFVBQVUsRUFBRTs0QkFDUixDQUFDLEVBQUUsbUJBQW1CLENBQUMsVUFBVTt5QkFDcEM7d0JBQ0QsU0FBUyxFQUFFOzRCQUNQLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLFFBQVEsRUFBRTt5QkFDdEM7d0JBQ0QsVUFBVSxFQUFFOzRCQUNSLENBQUMsRUFBRSxtQkFBbUIsQ0FBQyxVQUFVO3lCQUNwQztxQkFDSjtpQkFDSixDQUFDLENBQUMsQ0FBQztnQkFFSiwwQ0FBMEM7Z0JBQzFDLE9BQU87b0JBQ0gsSUFBSSxFQUFFLG1CQUFtQjtpQkFDNUIsQ0FBQTthQUNKO2lCQUFNO2dCQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsbUVBQW1FLENBQUMsQ0FBQztnQkFFakYsc0hBQXNIO2dCQUN0SCxPQUFPO29CQUNILFlBQVksRUFBRSxRQUFRLENBQUMsWUFBWTtvQkFDbkMsU0FBUyxFQUFFLHVDQUFxQixDQUFDLGVBQWU7aUJBQ25ELENBQUE7YUFDSjtTQUNKO0tBQ0o7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNWLE1BQU0sWUFBWSxHQUFHLG9DQUFvQyxTQUFTLGFBQWEsR0FBRyxFQUFFLENBQUM7UUFDckYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMxQixPQUFPO1lBQ0gsWUFBWSxFQUFFLFlBQVk7WUFDMUIsU0FBUyxFQUFFLHVDQUFxQixDQUFDLGVBQWU7U0FDbkQsQ0FBQTtLQUNKO0FBQ0wsQ0FBQyxDQUFBO0FBeklZLFFBQUEseUJBQXlCLDZCQXlJckMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICAgIENyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dCxcbiAgICBQbGFpZENsaWVudCxcbiAgICBQbGFpZENvdW50cnlDb2RlcyxcbiAgICBQbGFpZExhbmd1YWdlcywgUGxhaWRMaW5raW5nQWNjb3VudFN1YnR5cGUsXG4gICAgUGxhaWRMaW5raW5nRXJyb3JUeXBlLFxuICAgIFBsYWlkTGlua2luZ1Nlc3Npb24sXG4gICAgUGxhaWRMaW5raW5nU2Vzc2lvblJlc3BvbnNlLFxuICAgIFBsYWlkUHJvZHVjdHMsXG4gICAgU3RhZ2VzXG59IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5pbXBvcnQge0R5bmFtb0RCQ2xpZW50LCBHZXRJdGVtQ29tbWFuZCwgUHV0SXRlbUNvbW1hbmR9IGZyb20gXCJAYXdzLXNkay9jbGllbnQtZHluYW1vZGJcIjtcblxuLyoqXG4gKiBDcmVhdGVQbGFpZExpbmtpbmdTZXNzaW9uIHJlc29sdmVyXG4gKlxuICogQHBhcmFtIGZpZWxkTmFtZSBuYW1lIG9mIHRoZSByZXNvbHZlciBwYXRoIGZyb20gdGhlIEFwcFN5bmMgZXZlbnRcbiAqIEBwYXJhbSBjcmVhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQgcGxhaWQgc2Vzc2lvbiBsaW5raW5nIGlucHV0IG9iamVjdCwgdXNlZCB0byBjcmVhdGUgYSBwbGFpZCBsaW5raW5nXG4gKiBzZXNzaW9uIG9iamVjdFxuICogQHJldHVybnMge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBQbGFpZExpbmtpbmdTZXNzaW9uUmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCBjcmVhdGVQbGFpZExpbmtpbmdTZXNzaW9uID0gYXN5bmMgKGZpZWxkTmFtZTogc3RyaW5nLCBjcmVhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQ6IENyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dCk6IFByb21pc2U8UGxhaWRMaW5raW5nU2Vzc2lvblJlc3BvbnNlPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gcmV0cmlldmluZyB0aGUgY3VycmVudCBmdW5jdGlvbiByZWdpb25cbiAgICAgICAgY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiE7XG5cbiAgICAgICAgLy8gaW5pdGlhbGl6aW5nIHRoZSBEeW5hbW9EQiBkb2N1bWVudCBjbGllbnRcbiAgICAgICAgY29uc3QgZHluYW1vRGJDbGllbnQgPSBuZXcgRHluYW1vREJDbGllbnQoe3JlZ2lvbjogcmVnaW9ufSk7XG5cbiAgICAgICAgLy8gdXBkYXRlIHRoZSBhcHByb3ByaWF0ZSBwYXJhbWV0ZXJzIGluIHRoZSBzZXNzaW9uIGlucHV0XG4gICAgICAgIGNvbnN0IGNyZWF0ZWRBdCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICAgICAgY3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0LmNsaWVudF9uYW1lID0gJ01vb25iZWFtIEZpbmFuY2UnO1xuICAgICAgICBjcmVhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQubGlua19jdXN0b21pemF0aW9uX25hbWUgPSAnbW9vbmJlYW1fcGxhaWRfbGluayc7XG4gICAgICAgIGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC5jcmVhdGVkQXQgPSBjcmVhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQuY3JlYXRlZEF0ID8gY3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0LmNyZWF0ZWRBdCA6IGNyZWF0ZWRBdDtcbiAgICAgICAgY3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0LnVwZGF0ZWRBdCA9IGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC51cGRhdGVkQXQgPyBjcmVhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQudXBkYXRlZEF0IDogY3JlYXRlZEF0O1xuICAgICAgICBjcmVhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQuY291bnRyeV9jb2RlcyA9IFtQbGFpZENvdW50cnlDb2Rlcy5Vc107XG4gICAgICAgIGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC53ZWJob29rID0gcHJvY2Vzcy5lbnYuRU5WX05BTUUhID09PSBTdGFnZXMuREVWXG4gICAgICAgICAgICA/IFwiaHR0cHM6Ly9hcGktcGxhaWQtZGV2Lm1vb25iZWFtLnZldC9wbGFpZEFja25vd2xlZGdtZW50XCJcbiAgICAgICAgICAgIDogXCJodHRwczovL2FwaS1wbGFpZC5tb29uYmVhbS52ZXQvcGxhaWRBY2tub3dsZWRnbWVudFwiO1xuICAgICAgICBjcmVhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQubGFuZ3VhZ2UgPSBQbGFpZExhbmd1YWdlcy5FbjtcbiAgICAgICAgY3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0LnByb2R1Y3RzID0gW1BsYWlkUHJvZHVjdHMuQXV0aCwgUGxhaWRQcm9kdWN0cy5UcmFuc2FjdGlvbnNdO1xuICAgICAgICBjcmVhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQudHJhbnNhY3Rpb25zID0ge1xuICAgICAgICAgICAgZGF5c19yZXF1ZXN0ZWQ6IDFcbiAgICAgICAgfVxuICAgICAgICBjcmVhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQuYWNjb3VudF9maWx0ZXJzID0ge1xuICAgICAgICAgICAgZGVwb3NpdG9yeToge1xuICAgICAgICAgICAgICAgIGFjY291bnRfc3VidHlwZXM6IFtQbGFpZExpbmtpbmdBY2NvdW50U3VidHlwZS5DaGVja2luZ11cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvKipcbiAgICAgICAgICogSWYgdXNpbmcgSG9zdGVkIExpbmssIHRoZSByZWRpcmVjdF91cmkgbXVzdCBiZSBzZXQgdG8gaHR0cHM6Ly9ob3N0ZWQucGxhaWQuY29tL29hdXRoL3JlZGlyZWN0XG4gICAgICAgICAqIHtAbGluayBodHRwczovL3BsYWlkLmNvbS9kb2NzL2FwaS90b2tlbnMvI2xpbmt0b2tlbmNyZWF0ZX1cbiAgICAgICAgICovXG4gICAgICAgIGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC5yZWRpcmVjdF91cmkgPSAnaHR0cHM6Ly9ob3N0ZWQucGxhaWQuY29tL29hdXRoL3JlZGlyZWN0JztcblxuICAgICAgICAvKipcbiAgICAgICAgICogY2hlY2sgdG8gc2VlIGlmIHRoZSBsaW5raW5nIHNlc3Npb24gYWxyZWFkeSBleGlzdHMuIElmIGl0IGRvZXMsIHRoZW4gcmV0dXJuIGFuIGVycm9yLlxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3QgcHJlRXhpc3RpbmdQbGFpZExpbmtpbmdTZXNzaW9uID0gYXdhaXQgZHluYW1vRGJDbGllbnQuc2VuZChuZXcgR2V0SXRlbUNvbW1hbmQoe1xuICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5QTEFJRF9MSU5LSU5HX1NFU1NJT05TX1RBQkxFISxcbiAgICAgICAgICAgIEtleToge1xuICAgICAgICAgICAgICAgIGlkOiB7XG4gICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC51c2VyLmNsaWVudF91c2VyX2lkXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IHtcbiAgICAgICAgICAgICAgICAgICAgTjogRGF0ZS5wYXJzZShjcmVhdGVkQXQpLnRvU3RyaW5nKClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiB3ZSdyZSBub3QgaW50ZXJlc3RlZCBpbiBnZXR0aW5nIGFsbCB0aGUgZGF0YSBmb3IgdGhpcyBjYWxsLCBqdXN0IHRoZSBtaW5pbXVtIGZvciB1cyB0byBkZXRlcm1pbmUgd2hldGhlciB0aGlzIGlzIGEgZHVwbGljYXRlIG9yIG5vdFxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIEBsaW5rIGh0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9hbWF6b25keW5hbW9kYi9sYXRlc3QvZGV2ZWxvcGVyZ3VpZGUvUmVzZXJ2ZWRXb3Jkcy5odG1sXG4gICAgICAgICAgICAgKiBAbGluayBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vYW1hem9uZHluYW1vZGIvbGF0ZXN0L2RldmVsb3Blcmd1aWRlL0V4cHJlc3Npb25zLkV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lcy5odG1sXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIFByb2plY3Rpb25FeHByZXNzaW9uOiAnI2lkZicsXG4gICAgICAgICAgICBFeHByZXNzaW9uQXR0cmlidXRlTmFtZXM6IHtcbiAgICAgICAgICAgICAgICAnI2lkZic6ICdpZCdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuXG4gICAgICAgIC8vIGlmIHRoZXJlIGlzIGFuIGl0ZW0gcmV0cmlldmVkLCB0aGVuIHdlIHJldHVybiBhbiBlcnJvclxuICAgICAgICBpZiAocHJlRXhpc3RpbmdQbGFpZExpbmtpbmdTZXNzaW9uICYmIHByZUV4aXN0aW5nUGxhaWRMaW5raW5nU2Vzc2lvbi5JdGVtKSB7XG4gICAgICAgICAgICAvLyBpZiB0aGVyZSBpcyBhbiBleGlzdGVudCBsaW5rIG9iamVjdCwgdGhlbiB3ZSBjYW5ub3QgZHVwbGljYXRlIHRoYXQsIHNvIHdlIHdpbGwgcmV0dXJuIGFuIGVycm9yXG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgUHJlLWV4aXN0aW5nIFBsYWlkIGxpbmtpbmcgc2Vzc2lvbiBvYmplY3QuIERlbGV0ZSBpdCBiZWZvcmUgYWRkaW5nIGEgbmV3IG9uZSFgO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFBsYWlkTGlua2luZ0Vycm9yVHlwZS5EdXBsaWNhdGVPYmplY3RGb3VuZFxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gaW5pdGlhbGl6ZSB0aGUgUGxhaWQgQ2xpZW50IEFQSSBoZXJlLCBpbiBvcmRlciB0byBjYWxsIHRoZSBhcHByb3ByaWF0ZSBlbmRwb2ludHMgZm9yIHRoaXMgcmVzb2x2ZXJcbiAgICAgICAgICAgIGNvbnN0IHBsYWlkQ2xpZW50ID0gbmV3IFBsYWlkQ2xpZW50KHByb2Nlc3MuZW52LkVOVl9OQU1FISwgcmVnaW9uKTtcblxuICAgICAgICAgICAgLy8gZXhlY3V0ZSB0aGUgbWVtYmVyIGxpbmtpbmcgc2Vzc2lvbiBjcmVhdGlvbiBjYWxsXG4gICAgICAgICAgICBjb25zdCByZXNwb25zZTogUGxhaWRMaW5raW5nU2Vzc2lvblJlc3BvbnNlID0gYXdhaXQgcGxhaWRDbGllbnQuY3JlYXRlUGxhaWRMaW5rU2Vzc2lvbihjcmVhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIGxpbmtpbmcgc2Vzc2lvbiBjcmVhdGlvbiBjYWxsIHdhcyBleGVjdXRlZCBzdWNjZXNzZnVsbHlcbiAgICAgICAgICAgIGlmIChyZXNwb25zZSAmJiAhcmVzcG9uc2UuZXJyb3JNZXNzYWdlICYmICFyZXNwb25zZS5lcnJvclR5cGUgJiYgcmVzcG9uc2UuZGF0YSkge1xuICAgICAgICAgICAgICAgIC8vIGNvbnZlcnQgdGhlIGluY29taW5nIGxpbmtlZCBzZXNzaW9uIGRhdGEgaW50byBhIFBsYWlkTGlua2luZ1Nlc3Npb24gb2JqZWN0XG4gICAgICAgICAgICAgICAgY29uc3QgcGxhaWRMaW5raW5nU2Vzc2lvbiA9IHJlc3BvbnNlLmRhdGEgYXMgUGxhaWRMaW5raW5nU2Vzc2lvbjtcblxuICAgICAgICAgICAgICAgIC8vIHN0b3JlIHRoZSBQbGFpZCBsaW5raW5nIHNlc3Npb24gb2JqZWN0XG4gICAgICAgICAgICAgICAgYXdhaXQgZHluYW1vRGJDbGllbnQuc2VuZChuZXcgUHV0SXRlbUNvbW1hbmQoe1xuICAgICAgICAgICAgICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52LlBMQUlEX0xJTktJTkdfU0VTU0lPTlNfVEFCTEUhLFxuICAgICAgICAgICAgICAgICAgICBJdGVtOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IHBsYWlkTGlua2luZ1Nlc3Npb24uaWRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBleHBpcmF0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogcGxhaWRMaW5raW5nU2Vzc2lvbi5leHBpcmF0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEF0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogcGxhaWRMaW5raW5nU2Vzc2lvbi5jcmVhdGVkQXRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVkQXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBwbGFpZExpbmtpbmdTZXNzaW9uLnVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhvc3RlZF9saW5rX3VybDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IHBsYWlkTGlua2luZ1Nlc3Npb24uaG9zdGVkX2xpbmtfdXJsXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgbGlua190b2tlbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IHBsYWlkTGlua2luZ1Nlc3Npb24ubGlua190b2tlblxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVlc3RfaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBwbGFpZExpbmtpbmdTZXNzaW9uLnJlcXVlc3RfaWRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBOOiBEYXRlLnBhcnNlKGNyZWF0ZWRBdCkudG9TdHJpbmcoKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25faWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBwbGFpZExpbmtpbmdTZXNzaW9uLnNlc3Npb25faWRcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIHBsYWlkIGxpbmtpbmcgc2Vzc2lvbiBvYmplY3RcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiBwbGFpZExpbmtpbmdTZXNzaW9uXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgVW5leHBlY3RlZCBlcnJvciByZXR1cm5lZCBmcm9tIHRoZSBsaW5raW5nIHNlc3Npb24gY3JlYXRpb24gY2FsbCFgKTtcblxuICAgICAgICAgICAgICAgIC8vIGlmIHRoZXJlIGFyZSBlcnJvcnMgYXNzb2NpYXRlZCB3aXRoIHRoZSBjYWxsLCBqdXN0IHJldHVybiB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgZXJyb3IgdHlwZSBmcm9tIHRoZSB1cHN0cmVhbSBjbGllbnRcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IHJlc3BvbnNlLmVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBQbGFpZExpbmtpbmdFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyAke2ZpZWxkTmFtZX0gbXV0YXRpb24gJHtlcnJ9YDtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBQbGFpZExpbmtpbmdFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=