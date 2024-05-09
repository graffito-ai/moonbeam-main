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
        // the Session gets created with a status of INITIATED to begin with
        createPlaidLinkingSessionInput.status = moonbeam_models_1.PlaidLinkingSessionStatus.Initiated;
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
                    N: Date.parse(createPlaidLinkingSessionInput.createdAt).toString()
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
                            S: createPlaidLinkingSessionInput.createdAt
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
                            N: Date.parse(createPlaidLinkingSessionInput.createdAt).toString()
                        },
                        status: {
                            S: plaidLinkingSession.status
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvblJlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9yZXNvbHZlcnMvQ3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvblJlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtEQVdtQztBQUNuQyw4REFBd0Y7QUFFeEY7Ozs7Ozs7R0FPRztBQUNJLE1BQU0seUJBQXlCLEdBQUcsS0FBSyxFQUFFLFNBQWlCLEVBQUUsOEJBQThELEVBQXdDLEVBQUU7SUFDdkssSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2Qyw0Q0FBNEM7UUFDNUMsTUFBTSxjQUFjLEdBQUcsSUFBSSxnQ0FBYyxDQUFDLEVBQUMsTUFBTSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7UUFFNUQseURBQXlEO1FBQ3pELE1BQU0sU0FBUyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDM0MsOEJBQThCLENBQUMsV0FBVyxHQUFHLGtCQUFrQixDQUFDO1FBQ2hFLDhCQUE4QixDQUFDLHVCQUF1QixHQUFHLHFCQUFxQixDQUFDO1FBQy9FLDhCQUE4QixDQUFDLFNBQVMsR0FBRyw4QkFBOEIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLDhCQUE4QixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQzNJLDhCQUE4QixDQUFDLFNBQVMsR0FBRyw4QkFBOEIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLDhCQUE4QixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQzNJLDhCQUE4QixDQUFDLGFBQWEsR0FBRyxDQUFDLG1DQUFpQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3RFLDhCQUE4QixDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsR0FB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Uzt5QkFDbkM7d0JBQ0QsZUFBZSxFQUFFOzRCQUNiLENBQUMsRUFBRSxtQkFBbUIsQ0FBQyxlQUFlO3lCQUN6Qzt3QkFDRCxVQUFVLEVBQUU7NEJBQ1IsQ0FBQyxFQUFFLG1CQUFtQixDQUFDLFVBQVU7eUJBQ3BDO3dCQUNELFVBQVUsRUFBRTs0QkFDUixDQUFDLEVBQUUsbUJBQW1CLENBQUMsVUFBVTt5QkFDcEM7d0JBQ0QsU0FBUyxFQUFFOzRCQUNQLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLDhCQUE4QixDQUFDLFNBQVMsQ0FBQyxDQUFDLFFBQVEsRUFBRTt5QkFDckU7d0JBQ0QsTUFBTSxFQUFFOzRCQUNKLENBQUMsRUFBRSxtQkFBbUIsQ0FBQyxNQUFPO3lCQUNqQztxQkFDSjtpQkFDSixDQUFDLENBQUMsQ0FBQztnQkFFSiwwQ0FBMEM7Z0JBQzFDLE9BQU87b0JBQ0gsSUFBSSxFQUFFLG1CQUFtQjtpQkFDNUIsQ0FBQTthQUNKO2lCQUFNO2dCQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsbUVBQW1FLENBQUMsQ0FBQztnQkFFakYsc0hBQXNIO2dCQUN0SCxPQUFPO29CQUNILFlBQVksRUFBRSxRQUFRLENBQUMsWUFBWTtvQkFDbkMsU0FBUyxFQUFFLHVDQUFxQixDQUFDLGVBQWU7aUJBQ25ELENBQUE7YUFDSjtTQUNKO0tBQ0o7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNWLE1BQU0sWUFBWSxHQUFHLG9DQUFvQyxTQUFTLGFBQWEsR0FBRyxFQUFFLENBQUM7UUFDckYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMxQixPQUFPO1lBQ0gsWUFBWSxFQUFFLFlBQVk7WUFDMUIsU0FBUyxFQUFFLHVDQUFxQixDQUFDLGVBQWU7U0FDbkQsQ0FBQTtLQUNKO0FBQ0wsQ0FBQyxDQUFBO0FBM0lZLFFBQUEseUJBQXlCLDZCQTJJckMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICAgIENyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dCxcbiAgICBQbGFpZENsaWVudCxcbiAgICBQbGFpZENvdW50cnlDb2RlcyxcbiAgICBQbGFpZExhbmd1YWdlcywgUGxhaWRMaW5raW5nQWNjb3VudFN1YnR5cGUsXG4gICAgUGxhaWRMaW5raW5nRXJyb3JUeXBlLFxuICAgIFBsYWlkTGlua2luZ1Nlc3Npb24sXG4gICAgUGxhaWRMaW5raW5nU2Vzc2lvblJlc3BvbnNlLFxuICAgIFBsYWlkUHJvZHVjdHMsXG4gICAgUGxhaWRMaW5raW5nU2Vzc2lvblN0YXR1cyxcbiAgICBTdGFnZXNcbn0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcbmltcG9ydCB7RHluYW1vREJDbGllbnQsIEdldEl0ZW1Db21tYW5kLCBQdXRJdGVtQ29tbWFuZH0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1keW5hbW9kYlwiO1xuXG4vKipcbiAqIENyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb24gcmVzb2x2ZXJcbiAqXG4gKiBAcGFyYW0gZmllbGROYW1lIG5hbWUgb2YgdGhlIHJlc29sdmVyIHBhdGggZnJvbSB0aGUgQXBwU3luYyBldmVudFxuICogQHBhcmFtIGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dCBwbGFpZCBzZXNzaW9uIGxpbmtpbmcgaW5wdXQgb2JqZWN0LCB1c2VkIHRvIGNyZWF0ZSBhIHBsYWlkIGxpbmtpbmdcbiAqIHNlc3Npb24gb2JqZWN0XG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIFBsYWlkTGlua2luZ1Nlc3Npb25SZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb24gPSBhc3luYyAoZmllbGROYW1lOiBzdHJpbmcsIGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dDogQ3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0KTogUHJvbWlzZTxQbGFpZExpbmtpbmdTZXNzaW9uUmVzcG9uc2U+ID0+IHtcbiAgICB0cnkge1xuICAgICAgICAvLyByZXRyaWV2aW5nIHRoZSBjdXJyZW50IGZ1bmN0aW9uIHJlZ2lvblxuICAgICAgICBjb25zdCByZWdpb24gPSBwcm9jZXNzLmVudi5BV1NfUkVHSU9OITtcblxuICAgICAgICAvLyBpbml0aWFsaXppbmcgdGhlIER5bmFtb0RCIGRvY3VtZW50IGNsaWVudFxuICAgICAgICBjb25zdCBkeW5hbW9EYkNsaWVudCA9IG5ldyBEeW5hbW9EQkNsaWVudCh7cmVnaW9uOiByZWdpb259KTtcblxuICAgICAgICAvLyB1cGRhdGUgdGhlIGFwcHJvcHJpYXRlIHBhcmFtZXRlcnMgaW4gdGhlIHNlc3Npb24gaW5wdXRcbiAgICAgICAgY29uc3QgY3JlYXRlZEF0ID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgICAgICBjcmVhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQuY2xpZW50X25hbWUgPSAnTW9vbmJlYW0gRmluYW5jZSc7XG4gICAgICAgIGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC5saW5rX2N1c3RvbWl6YXRpb25fbmFtZSA9ICdtb29uYmVhbV9wbGFpZF9saW5rJztcbiAgICAgICAgY3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0LmNyZWF0ZWRBdCA9IGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC5jcmVhdGVkQXQgPyBjcmVhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQuY3JlYXRlZEF0IDogY3JlYXRlZEF0O1xuICAgICAgICBjcmVhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQudXBkYXRlZEF0ID0gY3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0LnVwZGF0ZWRBdCA/IGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC51cGRhdGVkQXQgOiBjcmVhdGVkQXQ7XG4gICAgICAgIGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC5jb3VudHJ5X2NvZGVzID0gW1BsYWlkQ291bnRyeUNvZGVzLlVzXTtcbiAgICAgICAgY3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0LndlYmhvb2sgPSBwcm9jZXNzLmVudi5FTlZfTkFNRSEgPT09IFN0YWdlcy5ERVZcbiAgICAgICAgICAgID8gXCJodHRwczovL2FwaS1wbGFpZC1kZXYubW9vbmJlYW0udmV0L3BsYWlkQWNrbm93bGVkZ21lbnRcIlxuICAgICAgICAgICAgOiBcImh0dHBzOi8vYXBpLXBsYWlkLm1vb25iZWFtLnZldC9wbGFpZEFja25vd2xlZGdtZW50XCI7XG4gICAgICAgIGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC5sYW5ndWFnZSA9IFBsYWlkTGFuZ3VhZ2VzLkVuO1xuICAgICAgICBjcmVhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQucHJvZHVjdHMgPSBbUGxhaWRQcm9kdWN0cy5BdXRoLCBQbGFpZFByb2R1Y3RzLlRyYW5zYWN0aW9uc107XG4gICAgICAgIGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC50cmFuc2FjdGlvbnMgPSB7XG4gICAgICAgICAgICBkYXlzX3JlcXVlc3RlZDogMVxuICAgICAgICB9XG4gICAgICAgIGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC5hY2NvdW50X2ZpbHRlcnMgPSB7XG4gICAgICAgICAgICBkZXBvc2l0b3J5OiB7XG4gICAgICAgICAgICAgICAgYWNjb3VudF9zdWJ0eXBlczogW1BsYWlkTGlua2luZ0FjY291bnRTdWJ0eXBlLkNoZWNraW5nXVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIHRoZSBTZXNzaW9uIGdldHMgY3JlYXRlZCB3aXRoIGEgc3RhdHVzIG9mIElOSVRJQVRFRCB0byBiZWdpbiB3aXRoXG4gICAgICAgIGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC5zdGF0dXMgPSBQbGFpZExpbmtpbmdTZXNzaW9uU3RhdHVzLkluaXRpYXRlZFxuICAgICAgICAvKipcbiAgICAgICAgICogSWYgdXNpbmcgSG9zdGVkIExpbmssIHRoZSByZWRpcmVjdF91cmkgbXVzdCBiZSBzZXQgdG8gaHR0cHM6Ly9ob3N0ZWQucGxhaWQuY29tL29hdXRoL3JlZGlyZWN0XG4gICAgICAgICAqIHtAbGluayBodHRwczovL3BsYWlkLmNvbS9kb2NzL2FwaS90b2tlbnMvI2xpbmt0b2tlbmNyZWF0ZX1cbiAgICAgICAgICovXG4gICAgICAgIGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC5yZWRpcmVjdF91cmkgPSAnaHR0cHM6Ly9ob3N0ZWQucGxhaWQuY29tL29hdXRoL3JlZGlyZWN0JztcblxuICAgICAgICAvKipcbiAgICAgICAgICogY2hlY2sgdG8gc2VlIGlmIHRoZSBsaW5raW5nIHNlc3Npb24gYWxyZWFkeSBleGlzdHMuIElmIGl0IGRvZXMsIHRoZW4gcmV0dXJuIGFuIGVycm9yLlxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3QgcHJlRXhpc3RpbmdQbGFpZExpbmtpbmdTZXNzaW9uID0gYXdhaXQgZHluYW1vRGJDbGllbnQuc2VuZChuZXcgR2V0SXRlbUNvbW1hbmQoe1xuICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5QTEFJRF9MSU5LSU5HX1NFU1NJT05TX1RBQkxFISxcbiAgICAgICAgICAgIEtleToge1xuICAgICAgICAgICAgICAgIGlkOiB7XG4gICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC51c2VyLmNsaWVudF91c2VyX2lkXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IHtcbiAgICAgICAgICAgICAgICAgICAgTjogRGF0ZS5wYXJzZShjcmVhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQuY3JlYXRlZEF0KS50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogd2UncmUgbm90IGludGVyZXN0ZWQgaW4gZ2V0dGluZyBhbGwgdGhlIGRhdGEgZm9yIHRoaXMgY2FsbCwganVzdCB0aGUgbWluaW11bSBmb3IgdXMgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdGhpcyBpcyBhIGR1cGxpY2F0ZSBvciBub3RcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBAbGluayBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vYW1hem9uZHluYW1vZGIvbGF0ZXN0L2RldmVsb3Blcmd1aWRlL1Jlc2VydmVkV29yZHMuaHRtbFxuICAgICAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2FtYXpvbmR5bmFtb2RiL2xhdGVzdC9kZXZlbG9wZXJndWlkZS9FeHByZXNzaW9ucy5FeHByZXNzaW9uQXR0cmlidXRlTmFtZXMuaHRtbFxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBQcm9qZWN0aW9uRXhwcmVzc2lvbjogJyNpZGYnLFxuICAgICAgICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzOiB7XG4gICAgICAgICAgICAgICAgJyNpZGYnOiAnaWQnXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKTtcblxuICAgICAgICAvLyBpZiB0aGVyZSBpcyBhbiBpdGVtIHJldHJpZXZlZCwgdGhlbiB3ZSByZXR1cm4gYW4gZXJyb3JcbiAgICAgICAgaWYgKHByZUV4aXN0aW5nUGxhaWRMaW5raW5nU2Vzc2lvbiAmJiBwcmVFeGlzdGluZ1BsYWlkTGlua2luZ1Nlc3Npb24uSXRlbSkge1xuICAgICAgICAgICAgLy8gaWYgdGhlcmUgaXMgYW4gZXhpc3RlbnQgbGluayBvYmplY3QsIHRoZW4gd2UgY2Fubm90IGR1cGxpY2F0ZSB0aGF0LCBzbyB3ZSB3aWxsIHJldHVybiBhbiBlcnJvclxuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFByZS1leGlzdGluZyBQbGFpZCBsaW5raW5nIHNlc3Npb24gb2JqZWN0LiBEZWxldGUgaXQgYmVmb3JlIGFkZGluZyBhIG5ldyBvbmUhYDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBQbGFpZExpbmtpbmdFcnJvclR5cGUuRHVwbGljYXRlT2JqZWN0Rm91bmRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGluaXRpYWxpemUgdGhlIFBsYWlkIENsaWVudCBBUEkgaGVyZSwgaW4gb3JkZXIgdG8gY2FsbCB0aGUgYXBwcm9wcmlhdGUgZW5kcG9pbnRzIGZvciB0aGlzIHJlc29sdmVyXG4gICAgICAgICAgICBjb25zdCBwbGFpZENsaWVudCA9IG5ldyBQbGFpZENsaWVudChwcm9jZXNzLmVudi5FTlZfTkFNRSEsIHJlZ2lvbik7XG5cbiAgICAgICAgICAgIC8vIGV4ZWN1dGUgdGhlIG1lbWJlciBsaW5raW5nIHNlc3Npb24gY3JlYXRpb24gY2FsbFxuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2U6IFBsYWlkTGlua2luZ1Nlc3Npb25SZXNwb25zZSA9IGF3YWl0IHBsYWlkQ2xpZW50LmNyZWF0ZVBsYWlkTGlua1Nlc3Npb24oY3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0KTtcblxuICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoZSBsaW5raW5nIHNlc3Npb24gY3JlYXRpb24gY2FsbCB3YXMgZXhlY3V0ZWQgc3VjY2Vzc2Z1bGx5XG4gICAgICAgICAgICBpZiAocmVzcG9uc2UgJiYgIXJlc3BvbnNlLmVycm9yTWVzc2FnZSAmJiAhcmVzcG9uc2UuZXJyb3JUeXBlICYmIHJlc3BvbnNlLmRhdGEpIHtcbiAgICAgICAgICAgICAgICAvLyBjb252ZXJ0IHRoZSBpbmNvbWluZyBsaW5rZWQgc2Vzc2lvbiBkYXRhIGludG8gYSBQbGFpZExpbmtpbmdTZXNzaW9uIG9iamVjdFxuICAgICAgICAgICAgICAgIGNvbnN0IHBsYWlkTGlua2luZ1Nlc3Npb24gPSByZXNwb25zZS5kYXRhIGFzIFBsYWlkTGlua2luZ1Nlc3Npb247XG5cbiAgICAgICAgICAgICAgICAvLyBzdG9yZSB0aGUgUGxhaWQgbGlua2luZyBzZXNzaW9uIG9iamVjdFxuICAgICAgICAgICAgICAgIGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IFB1dEl0ZW1Db21tYW5kKHtcbiAgICAgICAgICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5QTEFJRF9MSU5LSU5HX1NFU1NJT05TX1RBQkxFISxcbiAgICAgICAgICAgICAgICAgICAgSXRlbToge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBwbGFpZExpbmtpbmdTZXNzaW9uLmlkXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgZXhwaXJhdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IHBsYWlkTGlua2luZ1Nlc3Npb24uZXhwaXJhdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC5jcmVhdGVkQXRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVkQXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBwbGFpZExpbmtpbmdTZXNzaW9uLnVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhvc3RlZF9saW5rX3VybDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IHBsYWlkTGlua2luZ1Nlc3Npb24uaG9zdGVkX2xpbmtfdXJsXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgbGlua190b2tlbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IHBsYWlkTGlua2luZ1Nlc3Npb24ubGlua190b2tlblxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVlc3RfaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBwbGFpZExpbmtpbmdTZXNzaW9uLnJlcXVlc3RfaWRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBOOiBEYXRlLnBhcnNlKGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC5jcmVhdGVkQXQpLnRvU3RyaW5nKClcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBwbGFpZExpbmtpbmdTZXNzaW9uLnN0YXR1cyFcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIHBsYWlkIGxpbmtpbmcgc2Vzc2lvbiBvYmplY3RcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiBwbGFpZExpbmtpbmdTZXNzaW9uXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgVW5leHBlY3RlZCBlcnJvciByZXR1cm5lZCBmcm9tIHRoZSBsaW5raW5nIHNlc3Npb24gY3JlYXRpb24gY2FsbCFgKTtcblxuICAgICAgICAgICAgICAgIC8vIGlmIHRoZXJlIGFyZSBlcnJvcnMgYXNzb2NpYXRlZCB3aXRoIHRoZSBjYWxsLCBqdXN0IHJldHVybiB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgZXJyb3IgdHlwZSBmcm9tIHRoZSB1cHN0cmVhbSBjbGllbnRcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IHJlc3BvbnNlLmVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBQbGFpZExpbmtpbmdFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyAke2ZpZWxkTmFtZX0gbXV0YXRpb24gJHtlcnJ9YDtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBQbGFpZExpbmtpbmdFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=