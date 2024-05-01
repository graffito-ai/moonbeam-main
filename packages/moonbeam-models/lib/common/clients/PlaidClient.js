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
                hosted_link: createPlaidLinkingSessionInput.hosted_link
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
                            request_id: plaidLinkingSessionResponse.data["request_id"]
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhaWRDbGllbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbW9uL2NsaWVudHMvUGxhaWRDbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsbURBQThDO0FBQzlDLHNEQUFxSDtBQUNySCw0Q0FBdUM7QUFDdkMsa0RBQTBCO0FBRTFCOztHQUVHO0FBQ0gsTUFBYSxXQUFZLFNBQVEsNkJBQWE7SUFFMUM7Ozs7O09BS0c7SUFDSCxZQUFZLFdBQW1CLEVBQUUsTUFBYztRQUMzQyxLQUFLLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQy9CLENBQUM7SUFFRDs7Ozs7Ozs7OztPQVVHO0lBQ0gsS0FBSyxDQUFDLHNCQUFzQixDQUFDLDhCQUE4RDtRQUN2RiwrQ0FBK0M7UUFDL0MsTUFBTSxZQUFZLEdBQUcsbUNBQW1DLENBQUM7UUFFekQsSUFBSTtZQUNBLHNHQUFzRztZQUN0RyxNQUFNLENBQUMsWUFBWSxFQUFFLGFBQWEsRUFBRSxjQUFjLENBQUMsR0FBRyxNQUFNLEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxxQkFBUyxDQUFDLGdCQUFnQixDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFFM0ksNEVBQTRFO1lBQzVFLElBQUksWUFBWSxLQUFLLElBQUksSUFBSSxZQUFZLENBQUMsTUFBTSxLQUFLLENBQUM7Z0JBQ2xELGFBQWEsS0FBSyxJQUFJLElBQUksYUFBYSxDQUFDLE1BQU0sS0FBSyxDQUFDO2dCQUNwRCxjQUFjLEtBQUssSUFBSSxJQUFJLGNBQWUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUN6RCxNQUFNLFlBQVksR0FBRyw4Q0FBOEMsQ0FBQztnQkFDcEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFFMUIsT0FBTztvQkFDSCxZQUFZLEVBQUUsWUFBWTtvQkFDMUIsU0FBUyxFQUFFLHNDQUFxQixDQUFDLGVBQWU7aUJBQ25ELENBQUM7YUFDTDtZ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cUJBQU0sSUFBSSxLQUFLLENBQUMsT0FBTyxFQUFFO29CQUN0Qjs7Ozt1QkFJRztvQkFDSCxNQUFNLFlBQVksR0FBRywwQ0FBMEMsWUFBWSwyQkFBMkIsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO29CQUN0SCxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO29CQUUxQixPQUFPO3dCQUNILFlBQVksRUFBRSxZQUFZO3dCQUMxQixTQUFTLEVBQUUsc0NBQXFCLENBQUMsZUFBZTtxQkFDbkQsQ0FBQztpQkFDTDtxQkFBTTtvQkFDSCx1RUFBdUU7b0JBQ3ZFLE1BQU0sWUFBWSxHQUFHLHlEQUF5RCxZQUFZLGVBQWUsQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztvQkFDckosT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztvQkFFMUIsT0FBTzt3QkFDSCxZQUFZLEVBQUUsWUFBWTt3QkFDMUIsU0FBUyxFQUFFLHNDQUFxQixDQUFDLGVBQWU7cUJBQ25ELENBQUM7aUJBQ0w7WUFDTCxDQUFDLENBQUMsQ0FBQztTQUNOO1FBQUMsT0FBTyxHQUFHLEVBQUU7WUFDVixNQUFNLFlBQVksR0FBRyx1RUFBdUUsWUFBWSxFQUFFLENBQUM7WUFDM0csT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFlBQVksSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBRXRDLE9BQU87Z0JBQ0gsWUFBWSxFQUFFLFlBQVk7Z0JBQzFCLFNBQVMsRUFBRSxzQ0FBcUIsQ0FBQyxlQUFlO2FBQ25ELENBQUM7U0FDTDtJQUNMLENBQUM7Q0FFSjtBQXBKRCxrQ0FvSkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0Jhc2VBUElDbGllbnR9IGZyb20gXCIuL0Jhc2VBUElDbGllbnRcIjtcbmltcG9ydCB7Q3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0LCBQbGFpZExpbmtpbmdFcnJvclR5cGUsIFBsYWlkTGlua2luZ1Nlc3Npb25SZXNwb25zZX0gZnJvbSBcIi4uL0dyYXBocWxFeHBvcnRzXCI7XG5pbXBvcnQge0NvbnN0YW50c30gZnJvbSBcIi4uL0NvbnN0YW50c1wiO1xuaW1wb3J0IGF4aW9zIGZyb20gXCJheGlvc1wiO1xuXG4vKipcbiAqIENsYXNzIHVzZWQgYXMgdGhlIGJhc2UvZ2VuZXJpYyBjbGllbnQgZm9yIGFsbCBQbGFpZC9ub3RpZmljYXRpb24tcmVsYXRlZCBjYWxscy5cbiAqL1xuZXhwb3J0IGNsYXNzIFBsYWlkQ2xpZW50IGV4dGVuZHMgQmFzZUFQSUNsaWVudCB7XG5cbiAgICAvKipcbiAgICAgKiBHZW5lcmljIGNvbnN0cnVjdG9yIGZvciB0aGUgY2xpZW50LlxuICAgICAqXG4gICAgICogQHBhcmFtIGVudmlyb25tZW50IHRoZSBBV1MgZW52aXJvbm1lbnQgcGFzc2VkIGluIGZyb20gdGhlIExhbWJkYSByZXNvbHZlci5cbiAgICAgKiBAcGFyYW0gcmVnaW9uIHRoZSBBV1MgcmVnaW9uIHBhc3NlZCBpbiBmcm9tIHRoZSBMYW1iZGEgcmVzb2x2ZXIuXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZW52aXJvbm1lbnQ6IHN0cmluZywgcmVnaW9uOiBzdHJpbmcpIHtcbiAgICAgICAgc3VwZXIocmVnaW9uLCBlbnZpcm9ubWVudCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdXNlZCB0byBpbml0aWF0ZSBhIFBsYWlkIEhvc3RlZCBMaW5raW5nIFNlc3Npb24uXG4gICAgICpcbiAgICAgKiBAcGFyYW0gY3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0IGNyZWF0ZSBQbGFpZCBsaW5raW5nIHNlc3Npb24gaW5wdXQsIHVzZWQgdG9cbiAgICAgKiBjcmVhdGUgYSBQbGFpZCBMaW5raW5nIEhvc3RlZCBzZXNzaW9uLlxuICAgICAqXG4gICAgICogQHJldHVybiBhIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgUGxhaWRMaW5raW5nU2Vzc2lvblJlc3BvbnNlfSByZXByZXNlbnRpbmcgdGhlXG4gICAgICogUGxhaWQgbGlua2luZyBzZXNzaW9uIHJlc3BvbnNlIG9iamVjdCBvYnRhaW5lZCBmcm9tIHRoZSBsaW5raW5nIHNlc3Npb24gY2FsbFxuICAgICAqXG4gICAgICogQHByb3RlY3RlZFxuICAgICAqL1xuICAgIGFzeW5jIGNyZWF0ZVBsYWlkTGlua1Nlc3Npb24oY3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0OiBDcmVhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQpOiBQcm9taXNlPFBsYWlkTGlua2luZ1Nlc3Npb25SZXNwb25zZT4ge1xuICAgICAgICAvLyBlYXNpbHkgaWRlbnRpZmlhYmxlIEFQSSBlbmRwb2ludCBpbmZvcm1hdGlvblxuICAgICAgICBjb25zdCBlbmRwb2ludEluZm8gPSAnUE9TVCAvbGluay90b2tlbi9jcmVhdGUgUGxhaWQgQVBJJztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIEFQSSBLZXkgYW5kIEJhc2UgVVJMLCBuZWVkZWQgaW4gb3JkZXIgdG8gbWFrZSB0aGUgY2FyZCBsaW5raW5nIGNhbGwgdGhyb3VnaCB0aGUgY2xpZW50XG4gICAgICAgICAgICBjb25zdCBbcGxhaWRCYXNlVVJMLCBwbGFpZENsaWVudElkLCBwbGFpZFNlY3JldEtleV0gPSBhd2FpdCBzdXBlci5yZXRyaWV2ZVNlcnZpY2VDcmVkZW50aWFscyhDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5QTEFJRF9TRUNSRVRfTkFNRSk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB3ZSBvYnRhaW5lZCBhbnkgaW52YWxpZCBzZWNyZXQgdmFsdWVzIGZyb20gdGhlIGNhbGwgYWJvdmVcbiAgICAgICAgICAgIGlmIChwbGFpZEJhc2VVUkwgPT09IG51bGwgfHwgcGxhaWRCYXNlVVJMLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIHBsYWlkQ2xpZW50SWQgPT09IG51bGwgfHwgcGxhaWRDbGllbnRJZC5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBwbGFpZFNlY3JldEtleSA9PT0gbnVsbCB8fCBwbGFpZFNlY3JldEtleSEubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gXCJJbnZhbGlkIFNlY3JldHMgb2J0YWluZWQgZm9yIFBsYWlkIEFQSSBjYWxsIVwiO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBQbGFpZExpbmtpbmdFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gZmlsbCBpbiB0aGUgbmVjZXNzYXJ5IGRldGFpbHMgaW4gdGhlIGlucHV0IG9iamVjdCwgc28gd2UgY2FuIHRoZW4gdXNlIHRoZW0gaW4gdGhlIHJlcXVlc3Qgb2JqZWN0XG4gICAgICAgICAgICBjcmVhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQuY2xpZW50X2lkID0gcGxhaWRDbGllbnRJZDtcbiAgICAgICAgICAgIGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC5zZWNyZXQgPSBwbGFpZFNlY3JldEtleTtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBQT1NUIC9saW5rL3Rva2VuL2NyZWF0ZVxuICAgICAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9wbGFpZC5jb20vZG9jcy9hcGkvdG9rZW5zLyNsaW5rdG9rZW5jcmVhdGVcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBidWlsZCB0aGUgUGxhaWQgQVBJIHJlcXVlc3QgYm9keSB0byBiZSBwYXNzZWQgaW4sIGFuZCBwZXJmb3JtIGEgUE9TVCB0byBpdCB3aXRoIHRoZSBhcHByb3ByaWF0ZSBpbmZvcm1hdGlvblxuICAgICAgICAgICAgICogd2UgaW1wbHkgdGhhdCBpZiB0aGUgQVBJIGRvZXMgbm90IHJlc3BvbmQgaW4gMTUgc2Vjb25kcywgdGhlbiB3ZSBhdXRvbWF0aWNhbGx5IGNhdGNoIHRoYXQsIGFuZCByZXR1cm4gYW5cbiAgICAgICAgICAgICAqIGVycm9yIGZvciBhIGJldHRlciBjdXN0b21lciBleHBlcmllbmNlLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICByZXR1cm4gYXhpb3MucG9zdChgJHtwbGFpZEJhc2VVUkx9L2xpbmsvdG9rZW4vY3JlYXRlYCwge1xuICAgICAgICAgICAgICAgIGNsaWVudF9uYW1lOiBjcmVhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQuY2xpZW50X25hbWUsXG4gICAgICAgICAgICAgICAgY2xpZW50X2lkOiBjcmVhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQuY2xpZW50X2lkLFxuICAgICAgICAgICAgICAgIHNlY3JldDogY3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0LnNlY3JldCxcbiAgICAgICAgICAgICAgICB1c2VyOiBjcmVhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQudXNlcixcbiAgICAgICAgICAgICAgICBwcm9kdWN0czogY3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0LnByb2R1Y3RzLFxuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uczogY3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0LnRyYW5zYWN0aW9ucyxcbiAgICAgICAgICAgICAgICBjb3VudHJ5X2NvZGVzOiBjcmVhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQuY291bnRyeV9jb2RlcyxcbiAgICAgICAgICAgICAgICByZWRpcmVjdF91cmk6IGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC5yZWRpcmVjdF91cmksXG4gICAgICAgICAgICAgICAgbGFuZ3VhZ2U6IGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC5sYW5ndWFnZSxcbiAgICAgICAgICAgICAgICB3ZWJob29rOiBjcmVhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQud2ViaG9vayxcbiAgICAgICAgICAgICAgICBob3N0ZWRfbGluazogY3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0Lmhvc3RlZF9saW5rXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIlxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGltZW91dDogMTUwMDAsIC8vIGluIG1pbGxpc2Vjb25kcyBoZXJlXG4gICAgICAgICAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZTogJ1BsYWlkIEFQSSB0aW1lZCBvdXQgYWZ0ZXIgMTUwMDBtcyEnXG4gICAgICAgICAgICB9KS50aGVuKHBsYWlkTGlua2luZ1Nlc3Npb25SZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogaWYgd2UgcmVhY2hlZCB0aGlzLCB0aGVuIHdlIGFzc3VtZSB0aGF0IGEgMnh4IHJlc3BvbnNlIGNvZGUgd2FzIHJldHVybmVkLlxuICAgICAgICAgICAgICAgICAqIGNoZWNrIHRoZSBjb250ZW50cyBvZiB0aGUgcmVzcG9uc2UsIGFuZCBhY3QgYXBwcm9wcmlhdGVseS5cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBpZiAocGxhaWRMaW5raW5nU2Vzc2lvblJlc3BvbnNlLmRhdGEgIT09IHVuZGVmaW5lZCAmJiBwbGFpZExpbmtpbmdTZXNzaW9uUmVzcG9uc2UuZGF0YVtcImV4cGlyYXRpb25cIl0gIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgICAgICAgICBwbGFpZExpbmtpbmdTZXNzaW9uUmVzcG9uc2UuZGF0YVtcImhvc3RlZF9saW5rX3VybFwiXSAhPT0gdW5kZWZpbmVkICYmIHBsYWlkTGlua2luZ1Nlc3Npb25SZXNwb25zZS5kYXRhW1wibGlua190b2tlblwiXSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgICAgICAgICAgIHBsYWlkTGlua2luZ1Nlc3Npb25SZXNwb25zZS5kYXRhW1wicmVxdWVzdF9pZFwiXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC51c2VyLmNsaWVudF91c2VyX2lkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5wYXJzZShjcmVhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQuY3JlYXRlZEF0ISksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEF0OiBjcmVhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQuY3JlYXRlZEF0ISxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVkQXQ6IGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC5jcmVhdGVkQXQhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cGlyYXRpb246IHBsYWlkTGlua2luZ1Nlc3Npb25SZXNwb25zZS5kYXRhW1wiZXhwaXJhdGlvblwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBob3N0ZWRfbGlua191cmw6IHBsYWlkTGlua2luZ1Nlc3Npb25SZXNwb25zZS5kYXRhW1wiaG9zdGVkX2xpbmtfdXJsXCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmtfdG9rZW46IHBsYWlkTGlua2luZ1Nlc3Npb25SZXNwb25zZS5kYXRhW1wibGlua190b2tlblwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0X2lkOiBwbGFpZExpbmtpbmdTZXNzaW9uUmVzcG9uc2UuZGF0YVtcInJlcXVlc3RfaWRcIl1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBJbnZhbGlkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tICR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSFgLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBQbGFpZExpbmtpbmdFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yLnJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBhbmQgdGhlIHNlcnZlciByZXNwb25kZWQgd2l0aCBhIHN0YXR1cyBjb2RlXG4gICAgICAgICAgICAgICAgICAgICAqIHRoYXQgZmFsbHMgb3V0IG9mIHRoZSByYW5nZSBvZiAyeHguXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm9uIDJ4eHggcmVzcG9uc2Ugd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IFBsYWlkIEFQSSwgd2l0aCBzdGF0dXMgJHtlcnJvci5yZXNwb25zZS5zdGF0dXN9LCBhbmQgcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShlcnJvci5yZXNwb25zZS5kYXRhKX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogUGxhaWRMaW5raW5nRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3IucmVxdWVzdCkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYnV0IG5vIHJlc3BvbnNlIHdhcyByZWNlaXZlZFxuICAgICAgICAgICAgICAgICAgICAgKiBgZXJyb3IucmVxdWVzdGAgaXMgYW4gaW5zdGFuY2Ugb2YgWE1MSHR0cFJlcXVlc3QgaW4gdGhlIGJyb3dzZXIgYW5kIGFuIGluc3RhbmNlIG9mXG4gICAgICAgICAgICAgICAgICAgICAqICBodHRwLkNsaWVudFJlcXVlc3QgaW4gbm9kZS5qcy5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBObyByZXNwb25zZSByZWNlaXZlZCB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gUGxhaWQgQVBJLCBmb3IgcmVxdWVzdCAke2Vycm9yLnJlcXVlc3R9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFBsYWlkTGlua2luZ0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBTb21ldGhpbmcgaGFwcGVuZWQgaW4gc2V0dGluZyB1cCB0aGUgcmVxdWVzdCB0aGF0IHRyaWdnZXJlZCBhbiBFcnJvclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IGZvciB0aGUgJHtlbmRwb2ludEluZm99IFBsYWlkIEFQSSwgJHsoZXJyb3IgJiYgZXJyb3IubWVzc2FnZSkgJiYgZXJyb3IubWVzc2FnZX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogUGxhaWRMaW5raW5nRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGluaXRpYXRpbmcgdGhlIFBsYWlkIGxpbmtpbmcgc2Vzc2lvbiB0aHJvdWdoICR7ZW5kcG9pbnRJbmZvfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9ICR7ZXJyfWApO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogUGxhaWRMaW5raW5nRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxufVxuIl19