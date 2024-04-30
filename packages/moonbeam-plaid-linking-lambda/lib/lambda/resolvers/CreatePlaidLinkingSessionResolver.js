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
                return response;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvblJlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9yZXNvbHZlcnMvQ3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvblJlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtEQVNtQztBQUNuQyw4REFBd0Y7QUFFeEY7Ozs7Ozs7R0FPRztBQUNJLE1BQU0seUJBQXlCLEdBQUcsS0FBSyxFQUFFLFNBQWlCLEVBQUUsOEJBQThELEVBQXdDLEVBQUU7SUFDdkssSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2Qyw0Q0FBNEM7UUFDNUMsTUFBTSxjQUFjLEdBQUcsSUFBSSxnQ0FBYyxDQUFDLEVBQUMsTUFBTSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7UUFFNUQseURBQXlEO1FBQ3pELE1BQU0sU0FBUyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDM0MsOEJBQThCLENBQUMsV0FBVyxHQUFHLGtCQUFrQixDQUFDO1FBQ2hFLDhCQUE4QixDQUFDLHVCQUF1QixHQUFHLHFCQUFxQixDQUFDO1FBQy9FLDhCQUE4QixDQUFDLFNBQVMsR0FBRyw4QkFBOEIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLDhCQUE4QixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQzNJLDhCQUE4QixDQUFDLFNBQVMsR0FBRyw4QkFBOEIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLDhCQUE4QixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQzNJLDhCQUE4QixDQUFDLGFBQWEsR0FBRyxDQUFDLG1DQUFpQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3RFLDhCQUE4QixDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsR0FB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QUNELFNBQVMsRUFBRTs0QkFDUCxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxRQUFRLEVBQUU7eUJBQ3RDO3FCQUNKO2lCQUNKLENBQUMsQ0FBQyxDQUFDO2dCQUVKLDBDQUEwQztnQkFDMUMsT0FBTztvQkFDSCxJQUFJLEVBQUUsbUJBQW1CO2lCQUM1QixDQUFBO2FBQ0o7aUJBQU07Z0JBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtRUFBbUUsQ0FBQyxDQUFDO2dCQUVqRixzSEFBc0g7Z0JBQ3RILE9BQU8sUUFBUSxDQUFDO2FBQ25CO1NBQ0o7S0FDSjtJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1YsTUFBTSxZQUFZLEdBQUcsb0NBQW9DLFNBQVMsYUFBYSxHQUFHLEVBQUUsQ0FBQztRQUNyRixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzFCLE9BQU87WUFDSCxZQUFZLEVBQUUsWUFBWTtZQUMxQixTQUFTLEVBQUUsdUNBQXFCLENBQUMsZUFBZTtTQUNuRCxDQUFBO0tBQ0o7QUFDTCxDQUFDLENBQUE7QUE5SFksUUFBQSx5QkFBeUIsNkJBOEhyQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gICAgQ3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0LFxuICAgIFBsYWlkQ2xpZW50LFxuICAgIFBsYWlkQ291bnRyeUNvZGVzLFxuICAgIFBsYWlkTGFuZ3VhZ2VzLFxuICAgIFBsYWlkTGlua2luZ0Vycm9yVHlwZSxcbiAgICBQbGFpZExpbmtpbmdTZXNzaW9uLFxuICAgIFBsYWlkTGlua2luZ1Nlc3Npb25SZXNwb25zZSxcbiAgICBQbGFpZFByb2R1Y3RzLCBTdGFnZXNcbn0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcbmltcG9ydCB7RHluYW1vREJDbGllbnQsIEdldEl0ZW1Db21tYW5kLCBQdXRJdGVtQ29tbWFuZH0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1keW5hbW9kYlwiO1xuXG4vKipcbiAqIENyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb24gcmVzb2x2ZXJcbiAqXG4gKiBAcGFyYW0gZmllbGROYW1lIG5hbWUgb2YgdGhlIHJlc29sdmVyIHBhdGggZnJvbSB0aGUgQXBwU3luYyBldmVudFxuICogQHBhcmFtIGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dCBwbGFpZCBzZXNzaW9uIGxpbmtpbmcgaW5wdXQgb2JqZWN0LCB1c2VkIHRvIGNyZWF0ZSBhIHBsYWlkIGxpbmtpbmdcbiAqIHNlc3Npb24gb2JqZWN0XG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIFBsYWlkTGlua2luZ1Nlc3Npb25SZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb24gPSBhc3luYyAoZmllbGROYW1lOiBzdHJpbmcsIGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dDogQ3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0KTogUHJvbWlzZTxQbGFpZExpbmtpbmdTZXNzaW9uUmVzcG9uc2U+ID0+IHtcbiAgICB0cnkge1xuICAgICAgICAvLyByZXRyaWV2aW5nIHRoZSBjdXJyZW50IGZ1bmN0aW9uIHJlZ2lvblxuICAgICAgICBjb25zdCByZWdpb24gPSBwcm9jZXNzLmVudi5BV1NfUkVHSU9OITtcblxuICAgICAgICAvLyBpbml0aWFsaXppbmcgdGhlIER5bmFtb0RCIGRvY3VtZW50IGNsaWVudFxuICAgICAgICBjb25zdCBkeW5hbW9EYkNsaWVudCA9IG5ldyBEeW5hbW9EQkNsaWVudCh7cmVnaW9uOiByZWdpb259KTtcblxuICAgICAgICAvLyB1cGRhdGUgdGhlIGFwcHJvcHJpYXRlIHBhcmFtZXRlcnMgaW4gdGhlIHNlc3Npb24gaW5wdXRcbiAgICAgICAgY29uc3QgY3JlYXRlZEF0ID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgICAgICBjcmVhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQuY2xpZW50X25hbWUgPSAnTW9vbmJlYW0gRmluYW5jZSc7XG4gICAgICAgIGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC5saW5rX2N1c3RvbWl6YXRpb25fbmFtZSA9ICdtb29uYmVhbV9wbGFpZF9saW5rJztcbiAgICAgICAgY3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0LmNyZWF0ZWRBdCA9IGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC5jcmVhdGVkQXQgPyBjcmVhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQuY3JlYXRlZEF0IDogY3JlYXRlZEF0O1xuICAgICAgICBjcmVhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQudXBkYXRlZEF0ID0gY3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0LnVwZGF0ZWRBdCA/IGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC51cGRhdGVkQXQgOiBjcmVhdGVkQXQ7XG4gICAgICAgIGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC5jb3VudHJ5X2NvZGVzID0gW1BsYWlkQ291bnRyeUNvZGVzLlVzXTtcbiAgICAgICAgY3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0LndlYmhvb2sgPSBwcm9jZXNzLmVudi5FTlZfTkFNRSEgPT09IFN0YWdlcy5ERVZcbiAgICAgICAgICAgID8gXCJodHRwczovL2FwaS1wbGFpZC1kZXYubW9vbmJlYW0udmV0L3BsYWlkQWNrbm93bGVkZ21lbnRcIlxuICAgICAgICAgICAgOiBcImh0dHBzOi8vYXBpLXBsYWlkLm1vb25iZWFtLnZldC9wbGFpZEFja25vd2xlZGdtZW50XCI7XG4gICAgICAgIGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC5sYW5ndWFnZSA9IFBsYWlkTGFuZ3VhZ2VzLkVuO1xuICAgICAgICBjcmVhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQucHJvZHVjdHMgPSBbUGxhaWRQcm9kdWN0cy5BdXRoLCBQbGFpZFByb2R1Y3RzLlRyYW5zYWN0aW9uc107XG4gICAgICAgIGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC50cmFuc2FjdGlvbnMgPSB7XG4gICAgICAgICAgICBkYXlzX3JlcXVlc3RlZDogMVxuICAgICAgICB9XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBJZiB1c2luZyBIb3N0ZWQgTGluaywgdGhlIHJlZGlyZWN0X3VyaSBtdXN0IGJlIHNldCB0byBodHRwczovL2hvc3RlZC5wbGFpZC5jb20vb2F1dGgvcmVkaXJlY3RcbiAgICAgICAgICoge0BsaW5rIGh0dHBzOi8vcGxhaWQuY29tL2RvY3MvYXBpL3Rva2Vucy8jbGlua3Rva2VuY3JlYXRlfVxuICAgICAgICAgKi9cbiAgICAgICAgY3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0LnJlZGlyZWN0X3VyaSA9ICdodHRwczovL2hvc3RlZC5wbGFpZC5jb20vb2F1dGgvcmVkaXJlY3QnO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBjaGVjayB0byBzZWUgaWYgdGhlIGxpbmtpbmcgc2Vzc2lvbiBhbHJlYWR5IGV4aXN0cy4gSWYgaXQgZG9lcywgdGhlbiByZXR1cm4gYW4gZXJyb3IuXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBwcmVFeGlzdGluZ1BsYWlkTGlua2luZ1Nlc3Npb24gPSBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBHZXRJdGVtQ29tbWFuZCh7XG4gICAgICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52LlBMQUlEX0xJTktJTkdfU0VTU0lPTlNfVEFCTEUhLFxuICAgICAgICAgICAgS2V5OiB7XG4gICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0LnVzZXIuY2xpZW50X3VzZXJfaWRcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRpbWVzdGFtcDoge1xuICAgICAgICAgICAgICAgICAgICBOOiBEYXRlLnBhcnNlKGNyZWF0ZWRBdCkudG9TdHJpbmcoKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIHdlJ3JlIG5vdCBpbnRlcmVzdGVkIGluIGdldHRpbmcgYWxsIHRoZSBkYXRhIGZvciB0aGlzIGNhbGwsIGp1c3QgdGhlIG1pbmltdW0gZm9yIHVzIHRvIGRldGVybWluZSB3aGV0aGVyIHRoaXMgaXMgYSBkdXBsaWNhdGUgb3Igbm90XG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2FtYXpvbmR5bmFtb2RiL2xhdGVzdC9kZXZlbG9wZXJndWlkZS9SZXNlcnZlZFdvcmRzLmh0bWxcbiAgICAgICAgICAgICAqIEBsaW5rIGh0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9hbWF6b25keW5hbW9kYi9sYXRlc3QvZGV2ZWxvcGVyZ3VpZGUvRXhwcmVzc2lvbnMuRXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzLmh0bWxcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgUHJvamVjdGlvbkV4cHJlc3Npb246ICcjaWRmJyxcbiAgICAgICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lczoge1xuICAgICAgICAgICAgICAgICcjaWRmJzogJ2lkJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG5cbiAgICAgICAgLy8gaWYgdGhlcmUgaXMgYW4gaXRlbSByZXRyaWV2ZWQsIHRoZW4gd2UgcmV0dXJuIGFuIGVycm9yXG4gICAgICAgIGlmIChwcmVFeGlzdGluZ1BsYWlkTGlua2luZ1Nlc3Npb24gJiYgcHJlRXhpc3RpbmdQbGFpZExpbmtpbmdTZXNzaW9uLkl0ZW0pIHtcbiAgICAgICAgICAgIC8vIGlmIHRoZXJlIGlzIGFuIGV4aXN0ZW50IGxpbmsgb2JqZWN0LCB0aGVuIHdlIGNhbm5vdCBkdXBsaWNhdGUgdGhhdCwgc28gd2Ugd2lsbCByZXR1cm4gYW4gZXJyb3JcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBQcmUtZXhpc3RpbmcgUGxhaWQgbGlua2luZyBzZXNzaW9uIG9iamVjdC4gRGVsZXRlIGl0IGJlZm9yZSBhZGRpbmcgYSBuZXcgb25lIWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogUGxhaWRMaW5raW5nRXJyb3JUeXBlLkR1cGxpY2F0ZU9iamVjdEZvdW5kXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBpbml0aWFsaXplIHRoZSBQbGFpZCBDbGllbnQgQVBJIGhlcmUsIGluIG9yZGVyIHRvIGNhbGwgdGhlIGFwcHJvcHJpYXRlIGVuZHBvaW50cyBmb3IgdGhpcyByZXNvbHZlclxuICAgICAgICAgICAgY29uc3QgcGxhaWRDbGllbnQgPSBuZXcgUGxhaWRDbGllbnQocHJvY2Vzcy5lbnYuRU5WX05BTUUhLCByZWdpb24pO1xuXG4gICAgICAgICAgICAvLyBleGVjdXRlIHRoZSBtZW1iZXIgbGlua2luZyBzZXNzaW9uIGNyZWF0aW9uIGNhbGxcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlOiBQbGFpZExpbmtpbmdTZXNzaW9uUmVzcG9uc2UgPSBhd2FpdCBwbGFpZENsaWVudC5jcmVhdGVQbGFpZExpbmtTZXNzaW9uKGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dCk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGUgbGlua2luZyBzZXNzaW9uIGNyZWF0aW9uIGNhbGwgd2FzIGV4ZWN1dGVkIHN1Y2Nlc3NmdWxseVxuICAgICAgICAgICAgaWYgKHJlc3BvbnNlICYmICFyZXNwb25zZS5lcnJvck1lc3NhZ2UgJiYgIXJlc3BvbnNlLmVycm9yVHlwZSAmJiByZXNwb25zZS5kYXRhKSB7XG4gICAgICAgICAgICAgICAgLy8gY29udmVydCB0aGUgaW5jb21pbmcgbGlua2VkIHNlc3Npb24gZGF0YSBpbnRvIGEgUGxhaWRMaW5raW5nU2Vzc2lvbiBvYmplY3RcbiAgICAgICAgICAgICAgICBjb25zdCBwbGFpZExpbmtpbmdTZXNzaW9uID0gcmVzcG9uc2UuZGF0YSBhcyBQbGFpZExpbmtpbmdTZXNzaW9uO1xuXG4gICAgICAgICAgICAgICAgLy8gc3RvcmUgdGhlIFBsYWlkIGxpbmtpbmcgc2Vzc2lvbiBvYmplY3RcbiAgICAgICAgICAgICAgICBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBQdXRJdGVtQ29tbWFuZCh7XG4gICAgICAgICAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuUExBSURfTElOS0lOR19TRVNTSU9OU19UQUJMRSEsXG4gICAgICAgICAgICAgICAgICAgIEl0ZW06IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogcGxhaWRMaW5raW5nU2Vzc2lvbi5pZFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4cGlyYXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBwbGFpZExpbmtpbmdTZXNzaW9uLmV4cGlyYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBwbGFpZExpbmtpbmdTZXNzaW9uLmNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRBdDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IHBsYWlkTGlua2luZ1Nlc3Npb24udXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgaG9zdGVkX2xpbmtfdXJsOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogcGxhaWRMaW5raW5nU2Vzc2lvbi5ob3N0ZWRfbGlua191cmxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5rX3Rva2VuOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogcGxhaWRMaW5raW5nU2Vzc2lvbi5saW5rX3Rva2VuXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdF9pZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IHBsYWlkTGlua2luZ1Nlc3Npb24ucmVxdWVzdF9pZFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE46IERhdGUucGFyc2UoY3JlYXRlZEF0KS50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBwbGFpZCBsaW5raW5nIHNlc3Npb24gb2JqZWN0XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogcGxhaWRMaW5raW5nU2Vzc2lvblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFVuZXhwZWN0ZWQgZXJyb3IgcmV0dXJuZWQgZnJvbSB0aGUgbGlua2luZyBzZXNzaW9uIGNyZWF0aW9uIGNhbGwhYCk7XG5cbiAgICAgICAgICAgICAgICAvLyBpZiB0aGVyZSBhcmUgZXJyb3JzIGFzc29jaWF0ZWQgd2l0aCB0aGUgY2FsbCwganVzdCByZXR1cm4gdGhlIGVycm9yIG1lc3NhZ2UgYW5kIGVycm9yIHR5cGUgZnJvbSB0aGUgdXBzdHJlYW0gY2xpZW50XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyAke2ZpZWxkTmFtZX0gbXV0YXRpb24gJHtlcnJ9YDtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBQbGFpZExpbmtpbmdFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=