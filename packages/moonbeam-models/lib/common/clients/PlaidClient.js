"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaidClient = void 0;
const BaseAPIClient_1 = require("./BaseAPIClient");
const GraphqlExports_1 = require("../GraphqlExports");
const Constants_1 = require("../Constants");
const axios_1 = __importDefault(require("axios"));
/**
 * Class used as the base/generic client for all Plaid/notification-related calls.
 */
class PlaidClient extends BaseAPIClient_1.BaseAPIClient {
    /**
     * Generic constructor for the client.
     *
     * @param environment the AWS environment passed in from the Lambda resolver.
     * @param region the AWS region passed in from the Lambda resolver.
     */
    constructor(environment, region) {
        super(region, environment);
    }
    /**
     * Function used to initiate a Plaid Hosted Linking Session.
     *
     * @param createPlaidLinkingSessionInput create Plaid linking session input, used to
     * create a Plaid Linking Hosted session.
     *
     * @return a {@link Promise} of {@link PlaidLinkingSessionResponse} representing the
     * Plaid linking session response object obtained from the linking session call
     *
     * @protected
     */
    async createPlaidLinkSession(createPlaidLinkingSessionInput) {
        // easily identifiable API endpoint information
        const endpointInfo = 'POST /link/token/create Plaid API';
        try {
            // retrieve the API Key and Base URL, needed in order to make the card linking call through the client
            const [plaidBaseURL, plaidClientId, plaidSecretKey] = await super.retrieveServiceCredentials(Constants_1.Constants.AWSPairConstants.PLAID_SECRET_NAME);
            // check to see if we obtained any invalid secret values from the call above
            if (plaidBaseURL === null || plaidBaseURL.length === 0 ||
                plaidClientId === null || plaidClientId.length === 0 ||
                plaidSecretKey === null || plaidSecretKey.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Plaid API call!";
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: GraphqlExports_1.PlaidLinkingErrorType.UnexpectedError
                };
            }
            // fill in the necessary details in the input object, so we can then use them in the request object
            createPlaidLinkingSessionInput.client_id = plaidClientId;
            createPlaidLinkingSessionInput.secret = plaidSecretKey;
            /**
             * POST /link/token/create
             * @link https://plaid.com/docs/api/tokens/#linktokencreate
             *
             * build the Plaid API request body to be passed in, and perform a POST to it with the appropriate information
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            return axios_1.default.post(`${plaidBaseURL}/link/token/create`, {
                client_name: createPlaidLinkingSessionInput.client_name,
                client_id: createPlaidLinkingSessionInput.client_id,
                secret: createPlaidLinkingSessionInput.secret,
                user: createPlaidLinkingSessionInput.user,
                products: createPlaidLinkingSessionInput.products,
                transactions: createPlaidLinkingSessionInput.transactions,
                country_codes: createPlaidLinkingSessionInput.country_codes,
                redirect_uri: createPlaidLinkingSessionInput.redirect_uri,
                language: createPlaidLinkingSessionInput.language,
                webhook: createPlaidLinkingSessionInput.webhook,
                hosted_link: createPlaidLinkingSessionInput.hosted_link,
                account_filters: createPlaidLinkingSessionInput.account_filters
            }, {
                headers: {
                    "Content-Type": "application/json"
                },
                timeout: 15000,
                timeoutErrorMessage: 'Plaid API timed out after 15000ms!'
            }).then(plaidLinkingSessionResponse => {
                /**
                 * if we reached this, then we assume that a 2xx response code was returned.
                 * check the contents of the response, and act appropriately.
                 */
                if (plaidLinkingSessionResponse.data !== undefined && plaidLinkingSessionResponse.data["expiration"] !== undefined &&
                    plaidLinkingSessionResponse.data["hosted_link_url"] !== undefined && plaidLinkingSessionResponse.data["link_token"] !== undefined &&
                    plaidLinkingSessionResponse.data["request_id"] !== undefined) {
                    return {
                        data: {
                            id: createPlaidLinkingSessionInput.user.client_user_id,
                            timestamp: Date.parse(createPlaidLinkingSessionInput.createdAt),
                            createdAt: createPlaidLinkingSessionInput.createdAt,
                            updatedAt: createPlaidLinkingSessionInput.createdAt,
                            expiration: plaidLinkingSessionResponse.data["expiration"],
                            hosted_link_url: plaidLinkingSessionResponse.data["hosted_link_url"],
                            link_token: plaidLinkingSessionResponse.data["link_token"],
                            request_id: plaidLinkingSessionResponse.data["request_id"],
                            status: createPlaidLinkingSessionInput.status
                        }
                    };
                }
                else {
                    return {
                        errorMessage: `Invalid response structure returned from ${endpointInfo} response!`,
                        errorType: GraphqlExports_1.PlaidLinkingErrorType.ValidationError
                    };
                }
            }).catch(error => {
                if (error.response) {
                    /**
                     * The request was made and the server responded with a status code
                     * that falls out of the range of 2xx.
                     */
                    const errorMessage = `Non 2xxx response while calling the ${endpointInfo} Plaid API, with status ${error.response.status}, and response ${JSON.stringify(error.response.data)}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.PlaidLinkingErrorType.UnexpectedError
                    };
                }
                else if (error.request) {
                    /**
                     * The request was made but no response was received
                     * `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                     *  http.ClientRequest in node.js.
                     */
                    const errorMessage = `No response received while calling the ${endpointInfo} Plaid API, for request ${error.request}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.PlaidLinkingErrorType.UnexpectedError
                    };
                }
                else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Plaid API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.PlaidLinkingErrorType.UnexpectedError
                    };
                }
            });
        }
        catch (err) {
            const errorMessage = `Unexpected error while initiating the Plaid linking session through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                errorMessage: errorMessage,
                errorType: GraphqlExports_1.PlaidLinkingErrorType.UnexpectedError
            };
        }
    }
}
exports.PlaidClient = PlaidClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhaWRDbGllbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbW9uL2NsaWVudHMvUGxhaWRDbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsbURBQThDO0FBQzlDLHNEQUFxSDtBQUNySCw0Q0FBdUM7QUFDdkMsa0RBQTBCO0FBRTFCOztHQUVHO0FBQ0gsTUFBYSxXQUFZLFNBQVEsNkJBQWE7SUFFMUM7Ozs7O09BS0c7SUFDSCxZQUFZLFdBQW1CLEVBQUUsTUFBYztRQUMzQyxLQUFLLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQy9CLENBQUM7SUFFRDs7Ozs7Ozs7OztPQVVHO0lBQ0gsS0FBSyxDQUFDLHNCQUFzQixDQUFDLDhCQUE4RDtRQUN2RiwrQ0FBK0M7UUFDL0MsTUFBTSxZQUFZLEdBQUcsbUNBQW1DLENBQUM7UUFFekQsSUFBSTtZQUNBLHNHQUFzRztZQUN0RyxNQUFNLENBQUMsWUFBWSxFQUFFLGFBQWEsRUFBRSxjQUFjLENBQUMsR0FBRyxNQUFNLEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxxQkFBUyxDQUFDLGdCQUFnQixDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFFM0ksNEVBQTRFO1lBQzVFLElBQUksWUFBWSxLQUFLLElBQUksSUFBSSxZQUFZLENBQUMsTUFBTSxLQUFLLENBQUM7Z0JBQ2xELGFBQWEsS0FBSyxJQUFJLElBQUksYUFBYSxDQUFDLE1BQU0sS0FBSyxDQUFDO2dCQUNwRCxjQUFjLEtBQUssSUFBSSxJQUFJLGNBQWUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUN6RCxNQUFNLFlBQVksR0FBRyw4Q0FBOEMsQ0FBQztnQkFDcEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFFMUIsT0FBTztvQkFDSCxZQUFZLEVBQUUsWUFBWTtvQkFDMUIsU0FBUyxFQUFFLHNDQUFxQixDQUFDLGVBQWU7aUJBQ25ELENBQUM7YUFDTDtZ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LFlBQVksRUFBRSxZQUFZO3dCQUMxQixTQUFTLEVBQUUsc0NBQXFCLENBQUMsZUFBZTtxQkFDbkQsQ0FBQztpQkFDTDtxQkFBTSxJQUFJLEtBQUssQ0FBQyxPQUFPLEVBQUU7b0JBQ3RCOzs7O3VCQUlHO29CQUNILE1BQU0sWUFBWSxHQUFHLDBDQUEwQyxZQUFZLDJCQUEyQixLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7b0JBQ3RILE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7b0JBRTFCLE9BQU87d0JBQ0gsWUFBWSxFQUFFLFlBQVk7d0JBQzFCLFNBQVMsRUFBRSxzQ0FBcUIsQ0FBQyxlQUFlO3FCQUNuRCxDQUFDO2lCQUNMO3FCQUFNO29CQUNILHVFQUF1RTtvQkFDdkUsTUFBTSxZQUFZLEdBQUcseURBQXlELFlBQVksZUFBZSxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO29CQUNySixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO29CQUUxQixPQUFPO3dCQUNILFlBQVksRUFBRSxZQUFZO3dCQUMxQixTQUFTLEVBQUUsc0NBQXFCLENBQUMsZUFBZTtxQkFDbkQsQ0FBQztpQkFDTDtZQUNMLENBQUMsQ0FBQyxDQUFDO1NBQ047UUFBQyxPQUFPLEdBQUcsRUFBRTtZQUNWLE1BQU0sWUFBWSxHQUFHLHVFQUF1RSxZQUFZLEVBQUUsQ0FBQztZQUMzRyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsWUFBWSxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFFdEMsT0FBTztnQkFDSCxZQUFZLEVBQUUsWUFBWTtnQkFDMUIsU0FBUyxFQUFFLHNDQUFxQixDQUFDLGVBQWU7YUFDbkQsQ0FBQztTQUNMO0lBQ0wsQ0FBQztDQUVKO0FBdEpELGtDQXNKQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7QmFzZUFQSUNsaWVudH0gZnJvbSBcIi4vQmFzZUFQSUNsaWVudFwiO1xuaW1wb3J0IHtDcmVhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQsIFBsYWlkTGlua2luZ0Vycm9yVHlwZSwgUGxhaWRMaW5raW5nU2Vzc2lvblJlc3BvbnNlfSBmcm9tIFwiLi4vR3JhcGhxbEV4cG9ydHNcIjtcbmltcG9ydCB7Q29uc3RhbnRzfSBmcm9tIFwiLi4vQ29uc3RhbnRzXCI7XG5pbXBvcnQgYXhpb3MgZnJvbSBcImF4aW9zXCI7XG5cbi8qKlxuICogQ2xhc3MgdXNlZCBhcyB0aGUgYmFzZS9nZW5lcmljIGNsaWVudCBmb3IgYWxsIFBsYWlkL25vdGlmaWNhdGlvbi1yZWxhdGVkIGNhbGxzLlxuICovXG5leHBvcnQgY2xhc3MgUGxhaWRDbGllbnQgZXh0ZW5kcyBCYXNlQVBJQ2xpZW50IHtcblxuICAgIC8qKlxuICAgICAqIEdlbmVyaWMgY29uc3RydWN0b3IgZm9yIHRoZSBjbGllbnQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZW52aXJvbm1lbnQgdGhlIEFXUyBlbnZpcm9ubWVudCBwYXNzZWQgaW4gZnJvbSB0aGUgTGFtYmRhIHJlc29sdmVyLlxuICAgICAqIEBwYXJhbSByZWdpb24gdGhlIEFXUyByZWdpb24gcGFzc2VkIGluIGZyb20gdGhlIExhbWJkYSByZXNvbHZlci5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihlbnZpcm9ubWVudDogc3RyaW5nLCByZWdpb246IHN0cmluZykge1xuICAgICAgICBzdXBlcihyZWdpb24sIGVudmlyb25tZW50KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB1c2VkIHRvIGluaXRpYXRlIGEgUGxhaWQgSG9zdGVkIExpbmtpbmcgU2Vzc2lvbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBjcmVhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQgY3JlYXRlIFBsYWlkIGxpbmtpbmcgc2Vzc2lvbiBpbnB1dCwgdXNlZCB0b1xuICAgICAqIGNyZWF0ZSBhIFBsYWlkIExpbmtpbmcgSG9zdGVkIHNlc3Npb24uXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIGEge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBQbGFpZExpbmtpbmdTZXNzaW9uUmVzcG9uc2V9IHJlcHJlc2VudGluZyB0aGVcbiAgICAgKiBQbGFpZCBsaW5raW5nIHNlc3Npb24gcmVzcG9uc2Ugb2JqZWN0IG9idGFpbmVkIGZyb20gdGhlIGxpbmtpbmcgc2Vzc2lvbiBjYWxsXG4gICAgICpcbiAgICAgKiBAcHJvdGVjdGVkXG4gICAgICovXG4gICAgYXN5bmMgY3JlYXRlUGxhaWRMaW5rU2Vzc2lvbihjcmVhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQ6IENyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dCk6IFByb21pc2U8UGxhaWRMaW5raW5nU2Vzc2lvblJlc3BvbnNlPiB7XG4gICAgICAgIC8vIGVhc2lseSBpZGVudGlmaWFibGUgQVBJIGVuZHBvaW50IGluZm9ybWF0aW9uXG4gICAgICAgIGNvbnN0IGVuZHBvaW50SW5mbyA9ICdQT1NUIC9saW5rL3Rva2VuL2NyZWF0ZSBQbGFpZCBBUEknO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgQVBJIEtleSBhbmQgQmFzZSBVUkwsIG5lZWRlZCBpbiBvcmRlciB0byBtYWtlIHRoZSBjYXJkIGxpbmtpbmcgY2FsbCB0aHJvdWdoIHRoZSBjbGllbnRcbiAgICAgICAgICAgIGNvbnN0IFtwbGFpZEJhc2VVUkwsIHBsYWlkQ2xpZW50SWQsIHBsYWlkU2VjcmV0S2V5XSA9IGF3YWl0IHN1cGVyLnJldHJpZXZlU2VydmljZUNyZWRlbnRpYWxzKENvbnN0YW50cy5BV1NQYWlyQ29uc3RhbnRzLlBMQUlEX1NFQ1JFVF9OQU1FKTtcblxuICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHdlIG9idGFpbmVkIGFueSBpbnZhbGlkIHNlY3JldCB2YWx1ZXMgZnJvbSB0aGUgY2FsbCBhYm92ZVxuICAgICAgICAgICAgaWYgKHBsYWlkQmFzZVVSTCA9PT0gbnVsbCB8fCBwbGFpZEJhc2VVUkwubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgcGxhaWRDbGllbnRJZCA9PT0gbnVsbCB8fCBwbGFpZENsaWVudElkLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIHBsYWlkU2VjcmV0S2V5ID09PSBudWxsIHx8IHBsYWlkU2VjcmV0S2V5IS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBcIkludmFsaWQgU2VjcmV0cyBvYnRhaW5lZCBmb3IgUGxhaWQgQVBJIGNhbGwhXCI7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFBsYWlkTGlua2luZ0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBmaWxsIGluIHRoZSBuZWNlc3NhcnkgZGV0YWlscyBpbiB0aGUgaW5wdXQgb2JqZWN0LCBzbyB3ZSBjYW4gdGhlbiB1c2UgdGhlbSBpbiB0aGUgcmVxdWVzdCBvYmplY3RcbiAgICAgICAgICAgIGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC5jbGllbnRfaWQgPSBwbGFpZENsaWVudElkO1xuICAgICAgICAgICAgY3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0LnNlY3JldCA9IHBsYWlkU2VjcmV0S2V5O1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFBPU1QgL2xpbmsvdG9rZW4vY3JlYXRlXG4gICAgICAgICAgICAgKiBAbGluayBodHRwczovL3BsYWlkLmNvbS9kb2NzL2FwaS90b2tlbnMvI2xpbmt0b2tlbmNyZWF0ZVxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIGJ1aWxkIHRoZSBQbGFpZCBBUEkgcmVxdWVzdCBib2R5IHRvIGJlIHBhc3NlZCBpbiwgYW5kIHBlcmZvcm0gYSBQT1NUIHRvIGl0IHdpdGggdGhlIGFwcHJvcHJpYXRlIGluZm9ybWF0aW9uXG4gICAgICAgICAgICAgKiB3ZSBpbXBseSB0aGF0IGlmIHRoZSBBUEkgZG9lcyBub3QgcmVzcG9uZCBpbiAxNSBzZWNvbmRzLCB0aGVuIHdlIGF1dG9tYXRpY2FsbHkgY2F0Y2ggdGhhdCwgYW5kIHJldHVybiBhblxuICAgICAgICAgICAgICogZXJyb3IgZm9yIGEgYmV0dGVyIGN1c3RvbWVyIGV4cGVyaWVuY2UuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHJldHVybiBheGlvcy5wb3N0KGAke3BsYWlkQmFzZVVSTH0vbGluay90b2tlbi9jcmVhdGVgLCB7XG4gICAgICAgICAgICAgICAgY2xpZW50X25hbWU6IGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC5jbGllbnRfbmFtZSxcbiAgICAgICAgICAgICAgICBjbGllbnRfaWQ6IGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC5jbGllbnRfaWQsXG4gICAgICAgICAgICAgICAgc2VjcmV0OiBjcmVhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQuc2VjcmV0LFxuICAgICAgICAgICAgICAgIHVzZXI6IGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC51c2VyLFxuICAgICAgICAgICAgICAgIHByb2R1Y3RzOiBjcmVhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQucHJvZHVjdHMsXG4gICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25zOiBjcmVhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQudHJhbnNhY3Rpb25zLFxuICAgICAgICAgICAgICAgIGNvdW50cnlfY29kZXM6IGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC5jb3VudHJ5X2NvZGVzLFxuICAgICAgICAgICAgICAgIHJlZGlyZWN0X3VyaTogY3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0LnJlZGlyZWN0X3VyaSxcbiAgICAgICAgICAgICAgICBsYW5ndWFnZTogY3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0Lmxhbmd1YWdlLFxuICAgICAgICAgICAgICAgIHdlYmhvb2s6IGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC53ZWJob29rLFxuICAgICAgICAgICAgICAgIGhvc3RlZF9saW5rOiBjcmVhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQuaG9zdGVkX2xpbmssXG4gICAgICAgICAgICAgICAgYWNjb3VudF9maWx0ZXJzOiBjcmVhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQuYWNjb3VudF9maWx0ZXJzXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIlxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGltZW91dDogMTUwMDAsIC8vIGluIG1pbGxpc2Vjb25kcyBoZXJlXG4gICAgICAgICAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZTogJ1BsYWlkIEFQSSB0aW1lZCBvdXQgYWZ0ZXIgMTUwMDBtcyEnXG4gICAgICAgICAgICB9KS50aGVuKHBsYWlkTGlua2luZ1Nlc3Npb25SZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogaWYgd2UgcmVhY2hlZCB0aGlzLCB0aGVuIHdlIGFzc3VtZSB0aGF0IGEgMnh4IHJlc3BvbnNlIGNvZGUgd2FzIHJldHVybmVkLlxuICAgICAgICAgICAgICAgICAqIGNoZWNrIHRoZSBjb250ZW50cyBvZiB0aGUgcmVzcG9uc2UsIGFuZCBhY3QgYXBwcm9wcmlhdGVseS5cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBpZiAocGxhaWRMaW5raW5nU2Vzc2lvblJlc3BvbnNlLmRhdGEgIT09IHVuZGVmaW5lZCAmJiBwbGFpZExpbmtpbmdTZXNzaW9uUmVzcG9uc2UuZGF0YVtcImV4cGlyYXRpb25cIl0gIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgICAgICAgICBwbGFpZExpbmtpbmdTZXNzaW9uUmVzcG9uc2UuZGF0YVtcImhvc3RlZF9saW5rX3VybFwiXSAhPT0gdW5kZWZpbmVkICYmIHBsYWlkTGlua2luZ1Nlc3Npb25SZXNwb25zZS5kYXRhW1wibGlua190b2tlblwiXSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgICAgICAgICAgIHBsYWlkTGlua2luZ1Nlc3Npb25SZXNwb25zZS5kYXRhW1wicmVxdWVzdF9pZFwiXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC51c2VyLmNsaWVudF91c2VyX2lkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5wYXJzZShjcmVhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQuY3JlYXRlZEF0ISksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEF0OiBjcmVhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQuY3JlYXRlZEF0ISxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVkQXQ6IGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC5jcmVhdGVkQXQhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cGlyYXRpb246IHBsYWlkTGlua2luZ1Nlc3Npb25SZXNwb25zZS5kYXRhW1wiZXhwaXJhdGlvblwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBob3N0ZWRfbGlua191cmw6IHBsYWlkTGlua2luZ1Nlc3Npb25SZXNwb25zZS5kYXRhW1wiaG9zdGVkX2xpbmtfdXJsXCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmtfdG9rZW46IHBsYWlkTGlua2luZ1Nlc3Npb25SZXNwb25zZS5kYXRhW1wibGlua190b2tlblwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0X2lkOiBwbGFpZExpbmtpbmdTZXNzaW9uUmVzcG9uc2UuZGF0YVtcInJlcXVlc3RfaWRcIl0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiBjcmVhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQuc3RhdHVzIVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogYEludmFsaWQgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gJHtlbmRwb2ludEluZm99IHJlc3BvbnNlIWAsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFBsYWlkTGlua2luZ0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IucmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGFuZCB0aGUgc2VydmVyIHJlc3BvbmRlZCB3aXRoIGEgc3RhdHVzIGNvZGVcbiAgICAgICAgICAgICAgICAgICAgICogdGhhdCBmYWxscyBvdXQgb2YgdGhlIHJhbmdlIG9mIDJ4eC5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBOb24gMnh4eCByZXNwb25zZSB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gUGxhaWQgQVBJLCB3aXRoIHN0YXR1cyAke2Vycm9yLnJlc3BvbnNlLnN0YXR1c30sIGFuZCByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGVycm9yLnJlc3BvbnNlLmRhdGEpfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBQbGFpZExpbmtpbmdFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5yZXF1ZXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBidXQgbm8gcmVzcG9uc2Ugd2FzIHJlY2VpdmVkXG4gICAgICAgICAgICAgICAgICAgICAqIGBlcnJvci5yZXF1ZXN0YCBpcyBhbiBpbnN0YW5jZSBvZiBYTUxIdHRwUmVxdWVzdCBpbiB0aGUgYnJvd3NlciBhbmQgYW4gaW5zdGFuY2Ugb2ZcbiAgICAgICAgICAgICAgICAgICAgICogIGh0dHAuQ2xpZW50UmVxdWVzdCBpbiBub2RlLmpzLlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vIHJlc3BvbnNlIHJlY2VpdmVkIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBQbGFpZCBBUEksIGZvciByZXF1ZXN0ICR7ZXJyb3IucmVxdWVzdH1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogUGxhaWRMaW5raW5nRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNvbWV0aGluZyBoYXBwZW5lZCBpbiBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IHRoYXQgdHJpZ2dlcmVkIGFuIEVycm9yXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgZm9yIHRoZSAke2VuZHBvaW50SW5mb30gUGxhaWQgQVBJLCAkeyhlcnJvciAmJiBlcnJvci5tZXNzYWdlKSAmJiBlcnJvci5tZXNzYWdlfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBQbGFpZExpbmtpbmdFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgaW5pdGlhdGluZyB0aGUgUGxhaWQgbGlua2luZyBzZXNzaW9uIHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJ9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBQbGFpZExpbmtpbmdFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG59XG4iXX0=