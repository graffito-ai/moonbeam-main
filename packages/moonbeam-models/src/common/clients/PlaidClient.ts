import {BaseAPIClient} from "./BaseAPIClient";
import {CreatePlaidLinkingSessionInput, PlaidLinkingErrorType, PlaidLinkingSessionResponse} from "../GraphqlExports";
import {Constants} from "../Constants";
import axios from "axios";

/**
 * Class used as the base/generic client for all Plaid/notification-related calls.
 */
export class PlaidClient extends BaseAPIClient {

    /**
     * Generic constructor for the client.
     *
     * @param environment the AWS environment passed in from the Lambda resolver.
     * @param region the AWS region passed in from the Lambda resolver.
     */
    constructor(environment: string, region: string) {
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
    async createPlaidLinkSession(createPlaidLinkingSessionInput: CreatePlaidLinkingSessionInput): Promise<PlaidLinkingSessionResponse> {
        // easily identifiable API endpoint information
        const endpointInfo = 'POST /link/token/create Plaid API';

        try {
            // retrieve the API Key and Base URL, needed in order to make the card linking call through the client
            const [plaidBaseURL, plaidClientId, plaidSecretKey] = await super.retrieveServiceCredentials(Constants.AWSPairConstants.PLAID_SECRET_NAME);

            // check to see if we obtained any invalid secret values from the call above
            if (plaidBaseURL === null || plaidBaseURL.length === 0 ||
                plaidClientId === null || plaidClientId.length === 0 ||
                plaidSecretKey === null || plaidSecretKey!.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Plaid API call!";
                console.log(errorMessage);

                return {
                    errorMessage: errorMessage,
                    errorType: PlaidLinkingErrorType.UnexpectedError
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
            return axios.post(`${plaidBaseURL}/link/token/create`, {
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
                timeout: 15000, // in milliseconds here
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
                            timestamp: Date.parse(createPlaidLinkingSessionInput.createdAt!),
                            createdAt: createPlaidLinkingSessionInput.createdAt!,
                            updatedAt: createPlaidLinkingSessionInput.createdAt!,
                            expiration: plaidLinkingSessionResponse.data["expiration"],
                            hosted_link_url: plaidLinkingSessionResponse.data["hosted_link_url"],
                            link_token: plaidLinkingSessionResponse.data["link_token"],
                            request_id: plaidLinkingSessionResponse.data["request_id"]
                        }
                    }
                } else {
                    return {
                        errorMessage: `Invalid response structure returned from ${endpointInfo} response!`,
                        errorType: PlaidLinkingErrorType.ValidationError
                    }
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
                        errorType: PlaidLinkingErrorType.UnexpectedError
                    };
                } else if (error.request) {
                    /**
                     * The request was made but no response was received
                     * `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                     *  http.ClientRequest in node.js.
                     */
                    const errorMessage = `No response received while calling the ${endpointInfo} Plaid API, for request ${error.request}`;
                    console.log(errorMessage);

                    return {
                        errorMessage: errorMessage,
                        errorType: PlaidLinkingErrorType.UnexpectedError
                    };
                } else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Plaid API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);

                    return {
                        errorMessage: errorMessage,
                        errorType: PlaidLinkingErrorType.UnexpectedError
                    };
                }
            });
        } catch (err) {
            const errorMessage = `Unexpected error while initiating the Plaid linking session through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);

            return {
                errorMessage: errorMessage,
                errorType: PlaidLinkingErrorType.UnexpectedError
            };
        }
    }

}
