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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvblJlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9yZXNvbHZlcnMvQ3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvblJlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtEQVVtQztBQUNuQyw4REFBd0Y7QUFFeEY7Ozs7Ozs7R0FPRztBQUNJLE1BQU0seUJBQXlCLEdBQUcsS0FBSyxFQUFFLFNBQWlCLEVBQUUsOEJBQThELEVBQXdDLEVBQUU7SUFDdkssSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2Qyw0Q0FBNEM7UUFDNUMsTUFBTSxjQUFjLEdBQUcsSUFBSSxnQ0FBYyxDQUFDLEVBQUMsTUFBTSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7UUFFNUQseURBQXlEO1FBQ3pELE1BQU0sU0FBUyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDM0MsOEJBQThCLENBQUMsV0FBVyxHQUFHLGtCQUFrQixDQUFDO1FBQ2hFLDhCQUE4QixDQUFDLHVCQUF1QixHQUFHLHFCQUFxQixDQUFDO1FBQy9FLDhCQUE4QixDQUFDLFNBQVMsR0FBRyw4QkFBOEIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLDhCQUE4QixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQzNJLDhCQUE4QixDQUFDLFNBQVMsR0FBRyw4QkFBOEIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLDhCQUE4QixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQzNJLDhCQUE4QixDQUFDLGFBQWEsR0FBRyxDQUFDLG1DQUFpQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3RFLDhCQUE4QixDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsR0FB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QUNELFNBQVMsRUFBRTs0QkFDUCxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxRQUFRLEVBQUU7eUJBQ3RDO3FCQUNKO2lCQUNKLENBQUMsQ0FBQyxDQUFDO2dCQUVKLDBDQUEwQztnQkFDMUMsT0FBTztvQkFDSCxJQUFJLEVBQUUsbUJBQW1CO2lCQUM1QixDQUFBO2FBQ0o7aUJBQU07Z0JBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtRUFBbUUsQ0FBQyxDQUFDO2dCQUVqRixzSEFBc0g7Z0JBQ3RILE9BQU87b0JBQ0gsWUFBWSxFQUFFLFFBQVEsQ0FBQyxZQUFZO29CQUNuQyxTQUFTLEVBQUUsdUNBQXFCLENBQUMsZUFBZTtpQkFDbkQsQ0FBQTthQUNKO1NBQ0o7S0FDSjtJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1YsTUFBTSxZQUFZLEdBQUcsb0NBQW9DLFNBQVMsYUFBYSxHQUFHLEVBQUUsQ0FBQztRQUNyRixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzFCLE9BQU87WUFDSCxZQUFZLEVBQUUsWUFBWTtZQUMxQixTQUFTLEVBQUUsdUNBQXFCLENBQUMsZUFBZTtTQUNuRCxDQUFBO0tBQ0o7QUFDTCxDQUFDLENBQUE7QUFqSVksUUFBQSx5QkFBeUIsNkJBaUlyQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gICAgQ3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0LFxuICAgIFBsYWlkQ2xpZW50LFxuICAgIFBsYWlkQ291bnRyeUNvZGVzLFxuICAgIFBsYWlkTGFuZ3VhZ2VzLFxuICAgIFBsYWlkTGlua2luZ0Vycm9yVHlwZSxcbiAgICBQbGFpZExpbmtpbmdTZXNzaW9uLFxuICAgIFBsYWlkTGlua2luZ1Nlc3Npb25SZXNwb25zZSxcbiAgICBQbGFpZFByb2R1Y3RzLFxuICAgIFN0YWdlc1xufSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuaW1wb3J0IHtEeW5hbW9EQkNsaWVudCwgR2V0SXRlbUNvbW1hbmQsIFB1dEl0ZW1Db21tYW5kfSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LWR5bmFtb2RiXCI7XG5cbi8qKlxuICogQ3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvbiByZXNvbHZlclxuICpcbiAqIEBwYXJhbSBmaWVsZE5hbWUgbmFtZSBvZiB0aGUgcmVzb2x2ZXIgcGF0aCBmcm9tIHRoZSBBcHBTeW5jIGV2ZW50XG4gKiBAcGFyYW0gY3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0IHBsYWlkIHNlc3Npb24gbGlua2luZyBpbnB1dCBvYmplY3QsIHVzZWQgdG8gY3JlYXRlIGEgcGxhaWQgbGlua2luZ1xuICogc2Vzc2lvbiBvYmplY3RcbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgUGxhaWRMaW5raW5nU2Vzc2lvblJlc3BvbnNlfVxuICovXG5leHBvcnQgY29uc3QgY3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvbiA9IGFzeW5jIChmaWVsZE5hbWU6IHN0cmluZywgY3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0OiBDcmVhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQpOiBQcm9taXNlPFBsYWlkTGlua2luZ1Nlc3Npb25SZXNwb25zZT4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgIC8vIGluaXRpYWxpemluZyB0aGUgRHluYW1vREIgZG9jdW1lbnQgY2xpZW50XG4gICAgICAgIGNvbnN0IGR5bmFtb0RiQ2xpZW50ID0gbmV3IER5bmFtb0RCQ2xpZW50KHtyZWdpb246IHJlZ2lvbn0pO1xuXG4gICAgICAgIC8vIHVwZGF0ZSB0aGUgYXBwcm9wcmlhdGUgcGFyYW1ldGVycyBpbiB0aGUgc2Vzc2lvbiBpbnB1dFxuICAgICAgICBjb25zdCBjcmVhdGVkQXQgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgICAgIGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC5jbGllbnRfbmFtZSA9ICdNb29uYmVhbSBGaW5hbmNlJztcbiAgICAgICAgY3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0LmxpbmtfY3VzdG9taXphdGlvbl9uYW1lID0gJ21vb25iZWFtX3BsYWlkX2xpbmsnO1xuICAgICAgICBjcmVhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQuY3JlYXRlZEF0ID0gY3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0LmNyZWF0ZWRBdCA/IGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC5jcmVhdGVkQXQgOiBjcmVhdGVkQXQ7XG4gICAgICAgIGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC51cGRhdGVkQXQgPSBjcmVhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQudXBkYXRlZEF0ID8gY3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0LnVwZGF0ZWRBdCA6IGNyZWF0ZWRBdDtcbiAgICAgICAgY3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0LmNvdW50cnlfY29kZXMgPSBbUGxhaWRDb3VudHJ5Q29kZXMuVXNdO1xuICAgICAgICBjcmVhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQud2ViaG9vayA9IHByb2Nlc3MuZW52LkVOVl9OQU1FISA9PT0gU3RhZ2VzLkRFVlxuICAgICAgICAgICAgPyBcImh0dHBzOi8vYXBpLXBsYWlkLWRldi5tb29uYmVhbS52ZXQvcGxhaWRBY2tub3dsZWRnbWVudFwiXG4gICAgICAgICAgICA6IFwiaHR0cHM6Ly9hcGktcGxhaWQubW9vbmJlYW0udmV0L3BsYWlkQWNrbm93bGVkZ21lbnRcIjtcbiAgICAgICAgY3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0Lmxhbmd1YWdlID0gUGxhaWRMYW5ndWFnZXMuRW47XG4gICAgICAgIGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC5wcm9kdWN0cyA9IFtQbGFpZFByb2R1Y3RzLkF1dGgsIFBsYWlkUHJvZHVjdHMuVHJhbnNhY3Rpb25zXTtcbiAgICAgICAgY3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0LnRyYW5zYWN0aW9ucyA9IHtcbiAgICAgICAgICAgIGRheXNfcmVxdWVzdGVkOiAxXG4gICAgICAgIH1cbiAgICAgICAgLyoqXG4gICAgICAgICAqIElmIHVzaW5nIEhvc3RlZCBMaW5rLCB0aGUgcmVkaXJlY3RfdXJpIG11c3QgYmUgc2V0IHRvIGh0dHBzOi8vaG9zdGVkLnBsYWlkLmNvbS9vYXV0aC9yZWRpcmVjdFxuICAgICAgICAgKiB7QGxpbmsgaHR0cHM6Ly9wbGFpZC5jb20vZG9jcy9hcGkvdG9rZW5zLyNsaW5rdG9rZW5jcmVhdGV9XG4gICAgICAgICAqL1xuICAgICAgICBjcmVhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQucmVkaXJlY3RfdXJpID0gJ2h0dHBzOi8vaG9zdGVkLnBsYWlkLmNvbS9vYXV0aC9yZWRpcmVjdCc7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIGNoZWNrIHRvIHNlZSBpZiB0aGUgbGlua2luZyBzZXNzaW9uIGFscmVhZHkgZXhpc3RzLiBJZiBpdCBkb2VzLCB0aGVuIHJldHVybiBhbiBlcnJvci5cbiAgICAgICAgICovXG4gICAgICAgIGNvbnN0IHByZUV4aXN0aW5nUGxhaWRMaW5raW5nU2Vzc2lvbiA9IGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IEdldEl0ZW1Db21tYW5kKHtcbiAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuUExBSURfTElOS0lOR19TRVNTSU9OU19UQUJMRSEsXG4gICAgICAgICAgICBLZXk6IHtcbiAgICAgICAgICAgICAgICBpZDoge1xuICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQudXNlci5jbGllbnRfdXNlcl9pZFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGltZXN0YW1wOiB7XG4gICAgICAgICAgICAgICAgICAgIE46IERhdGUucGFyc2UoY3JlYXRlZEF0KS50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogd2UncmUgbm90IGludGVyZXN0ZWQgaW4gZ2V0dGluZyBhbGwgdGhlIGRhdGEgZm9yIHRoaXMgY2FsbCwganVzdCB0aGUgbWluaW11bSBmb3IgdXMgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdGhpcyBpcyBhIGR1cGxpY2F0ZSBvciBub3RcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBAbGluayBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vYW1hem9uZHluYW1vZGIvbGF0ZXN0L2RldmVsb3Blcmd1aWRlL1Jlc2VydmVkV29yZHMuaHRtbFxuICAgICAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2FtYXpvbmR5bmFtb2RiL2xhdGVzdC9kZXZlbG9wZXJndWlkZS9FeHByZXNzaW9ucy5FeHByZXNzaW9uQXR0cmlidXRlTmFtZXMuaHRtbFxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBQcm9qZWN0aW9uRXhwcmVzc2lvbjogJyNpZGYnLFxuICAgICAgICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzOiB7XG4gICAgICAgICAgICAgICAgJyNpZGYnOiAnaWQnXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKTtcblxuICAgICAgICAvLyBpZiB0aGVyZSBpcyBhbiBpdGVtIHJldHJpZXZlZCwgdGhlbiB3ZSByZXR1cm4gYW4gZXJyb3JcbiAgICAgICAgaWYgKHByZUV4aXN0aW5nUGxhaWRMaW5raW5nU2Vzc2lvbiAmJiBwcmVFeGlzdGluZ1BsYWlkTGlua2luZ1Nlc3Npb24uSXRlbSkge1xuICAgICAgICAgICAgLy8gaWYgdGhlcmUgaXMgYW4gZXhpc3RlbnQgbGluayBvYmplY3QsIHRoZW4gd2UgY2Fubm90IGR1cGxpY2F0ZSB0aGF0LCBzbyB3ZSB3aWxsIHJldHVybiBhbiBlcnJvclxuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFByZS1leGlzdGluZyBQbGFpZCBsaW5raW5nIHNlc3Npb24gb2JqZWN0LiBEZWxldGUgaXQgYmVmb3JlIGFkZGluZyBhIG5ldyBvbmUhYDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBQbGFpZExpbmtpbmdFcnJvclR5cGUuRHVwbGljYXRlT2JqZWN0Rm91bmRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGluaXRpYWxpemUgdGhlIFBsYWlkIENsaWVudCBBUEkgaGVyZSwgaW4gb3JkZXIgdG8gY2FsbCB0aGUgYXBwcm9wcmlhdGUgZW5kcG9pbnRzIGZvciB0aGlzIHJlc29sdmVyXG4gICAgICAgICAgICBjb25zdCBwbGFpZENsaWVudCA9IG5ldyBQbGFpZENsaWVudChwcm9jZXNzLmVudi5FTlZfTkFNRSEsIHJlZ2lvbik7XG5cbiAgICAgICAgICAgIC8vIGV4ZWN1dGUgdGhlIG1lbWJlciBsaW5raW5nIHNlc3Npb24gY3JlYXRpb24gY2FsbFxuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2U6IFBsYWlkTGlua2luZ1Nlc3Npb25SZXNwb25zZSA9IGF3YWl0IHBsYWlkQ2xpZW50LmNyZWF0ZVBsYWlkTGlua1Nlc3Npb24oY3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0KTtcblxuICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSBsaW5raW5nIHNlc3Npb24gY3JlYXRpb24gY2FsbCB3YXMgZXhlY3V0ZWQgc3VjY2Vzc2Z1bGx5XG4gICAgICAgICAgICBpZiAocmVzcG9uc2UgJiYgIXJlc3BvbnNlLmVycm9yTWVzc2FnZSAmJiAhcmVzcG9uc2UuZXJyb3JUeXBlICYmIHJlc3BvbnNlLmRhdGEpIHtcbiAgICAgICAgICAgICAgICAvLyBjb252ZXJ0IHRoZSBpbmNvbWluZyBsaW5rZWQgc2Vzc2lvbiBkYXRhIGludG8gYSBQbGFpZExpbmtpbmdTZXNzaW9uIG9iamVjdFxuICAgICAgICAgICAgICAgIGNvbnN0IHBsYWlkTGlua2luZ1Nlc3Npb24gPSByZXNwb25zZS5kYXRhIGFzIFBsYWlkTGlua2luZ1Nlc3Npb247XG5cbiAgICAgICAgICAgICAgICAvLyBzdG9yZSB0aGUgUGxhaWQgbGlua2luZyBzZXNzaW9uIG9iamVjdFxuICAgICAgICAgICAgICAgIGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IFB1dEl0ZW1Db21tYW5kKHtcbiAgICAgICAgICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5QTEFJRF9MSU5LSU5HX1NFU1NJT05TX1RBQkxFISxcbiAgICAgICAgICAgICAgICAgICAgSXRlbToge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBwbGFpZExpbmtpbmdTZXNzaW9uLmlkXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgZXhwaXJhdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IHBsYWlkTGlua2luZ1Nlc3Npb24uZXhwaXJhdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IHBsYWlkTGlua2luZ1Nlc3Npb24uY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlZEF0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogcGxhaWRMaW5raW5nU2Vzc2lvbi51cGRhdGVkQXRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBob3N0ZWRfbGlua191cmw6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBwbGFpZExpbmtpbmdTZXNzaW9uLmhvc3RlZF9saW5rX3VybFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmtfdG9rZW46IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBwbGFpZExpbmtpbmdTZXNzaW9uLmxpbmtfdG9rZW5cbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0X2lkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogcGxhaWRMaW5raW5nU2Vzc2lvbi5yZXF1ZXN0X2lkXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTjogRGF0ZS5wYXJzZShjcmVhdGVkQXQpLnRvU3RyaW5nKClcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIHBsYWlkIGxpbmtpbmcgc2Vzc2lvbiBvYmplY3RcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiBwbGFpZExpbmtpbmdTZXNzaW9uXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgVW5leHBlY3RlZCBlcnJvciByZXR1cm5lZCBmcm9tIHRoZSBsaW5raW5nIHNlc3Npb24gY3JlYXRpb24gY2FsbCFgKTtcblxuICAgICAgICAgICAgICAgIC8vIGlmIHRoZXJlIGFyZSBlcnJvcnMgYXNzb2NpYXRlZCB3aXRoIHRoZSBjYWxsLCBqdXN0IHJldHVybiB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgZXJyb3IgdHlwZSBmcm9tIHRoZSB1cHN0cmVhbSBjbGllbnRcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IHJlc3BvbnNlLmVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBQbGFpZExpbmtpbmdFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyAke2ZpZWxkTmFtZX0gbXV0YXRpb24gJHtlcnJ9YDtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBQbGFpZExpbmtpbmdFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=