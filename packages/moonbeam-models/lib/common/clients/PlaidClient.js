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
     * Function used to retrieve the Plaid Item Auth details, given an access_token.
     *
     * @param accessToken access_token used to retrieve the PLaid Auth Item for.
     *
     * @return a {@link Promise} of {@link PlaidAuthResponse} representing the
     * Plaid Item Auth response obtained, or an error, as applicable.
     */
    async getPlaidAuth(accessToken) {
        // easily identifiable API endpoint information
        const endpointInfo = 'POST /auth/get Plaid API';
        try {
            // retrieve the API Key and Base URL, needed in order to make the token exchange call through the client
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
            /**
             * POST /auth/get
             * @link https://plaid.com/docs/api/products/auth/#authget
             *
             * build the Plaid API request body to be passed in, and perform a POST to it with the appropriate information
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            return axios_1.default.post(`${plaidBaseURL}/auth/get`, {
                client_id: plaidClientId,
                secret: plaidSecretKey,
                access_token: accessToken
            }, {
                headers: {
                    "Content-Type": "application/json"
                },
                timeout: 15000,
                timeoutErrorMessage: 'Plaid API timed out after 15000ms!'
            }).then(plaidItemAuthResponse => {
                /**
                 * if we reached this, then we assume that a 2xx response code was returned.
                 * check the contents of the response, and act appropriately.
                 */
                if (plaidItemAuthResponse.data !== undefined && plaidItemAuthResponse.data["accounts"] !== undefined &&
                    plaidItemAuthResponse.data["accounts"].length !== 0 && plaidItemAuthResponse.data["item"] !== undefined &&
                    plaidItemAuthResponse.data["item"]["item_id"] !== undefined && plaidItemAuthResponse.data["item"]["institution_id"] !== undefined &&
                    plaidItemAuthResponse.data["numbers"] !== undefined && plaidItemAuthResponse.data["numbers"]["ach"] !== undefined &&
                    plaidItemAuthResponse.data["numbers"]["ach"].length !== 0) {
                    // ensure that there is a checking account associated with the Linked Item
                    let validAccount = false;
                    // counters to keep track of the account and ach counts
                    let accountCount = 0;
                    let achAccountCount = 0;
                    // target counters to highlight which account and ach object to use for the return object
                    let accountCountTarget = 0;
                    let achAccountCountTarget = 0;
                    plaidItemAuthResponse.data["accounts"].forEach(account => {
                        // make sure that the account information is valid
                        if (account["account_id"] !== undefined && account["mask"] !== undefined &&
                            account["name"] !== undefined && account["official_name"] !== undefined &&
                            account["persistent_account_id"] !== undefined && account["subtype"] !== undefined &&
                            account["type"] !== undefined && account["subtype"].toLowerCase() === GraphqlExports_1.PlaidLinkingAccountSubtype.Checking.toLowerCase() &&
                            account["type"].toLowerCase() === GraphqlExports_1.PlaidLinkingAccountType.Depository.toLowerCase()) {
                            // for that particular account, loop through the ACH numbers, and see if we have valid numbers
                            plaidItemAuthResponse.data["numbers"]["ach"].forEach(ach => {
                                if (ach["account_id"] !== undefined && ach["account_id"] === account["account_id"] &&
                                    ach["account"] !== undefined && ach["routing"] !== undefined && ach["wire_routing"] !== undefined) {
                                    // set the target counters and flag accordingly
                                    validAccount = true;
                                    accountCountTarget = accountCount;
                                    achAccountCountTarget = achAccountCount;
                                }
                                else {
                                    validAccount = false;
                                }
                                achAccountCount += 1;
                            });
                        }
                        accountCount += 1;
                    });
                    // if there's no valid account and ACH numbers associated with that account, then return an error
                    if (!validAccount) {
                        return {
                            errorMessage: `Invalid account response structure returned from ${endpointInfo} response!`,
                            errorType: GraphqlExports_1.PlaidLinkingErrorType.ValidationError
                        };
                    }
                    else {
                        // for a valid Plaid Auth Item, use the appropriate parameters to build the Auth Object to return
                        return {
                            data: {
                                institution_id: plaidItemAuthResponse.data["item"]["institution_id"],
                                item_id: plaidItemAuthResponse.data["item"]["item_id"],
                                account: [{
                                        account: plaidItemAuthResponse.data["numbers"]["ach"][achAccountCountTarget]["account"],
                                        account_id: plaidItemAuthResponse.data["accounts"][accountCountTarget]["account_id"],
                                        mask: plaidItemAuthResponse.data["accounts"][accountCountTarget]["mask"],
                                        name: plaidItemAuthResponse.data["accounts"][accountCountTarget]["name"],
                                        official_name: plaidItemAuthResponse.data["accounts"][accountCountTarget]["official_name"],
                                        persistent_account_id: plaidItemAuthResponse.data["accounts"][accountCountTarget]["persistent_account_id"],
                                        routing: plaidItemAuthResponse.data["numbers"]["ach"][achAccountCountTarget]["routing"],
                                        subtype: GraphqlExports_1.PlaidLinkingAccountSubtype.Checking,
                                        type: GraphqlExports_1.PlaidLinkingAccountType.Depository,
                                        wire_routing: plaidItemAuthResponse.data["numbers"]["ach"][achAccountCountTarget]["wire_routing"]
                                    }]
                            }
                        };
                    }
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
            const errorMessage = `Unexpected error while initiating the Plaid Item Auth retrieval through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                errorMessage: errorMessage,
                errorType: GraphqlExports_1.PlaidLinkingErrorType.UnexpectedError
            };
        }
    }
    /**
     * Function used to retrieve institution details given an institution id.
     *
     * @param institutionId institution_id to retrieve institution details for.
     *
     * @return a {@link Promise} of {@link InstitutionResponse} representing the
     * institution details response obtained, or an error, as applicable.
     */
    async getInstitutionById(institutionId) {
        // easily identifiable API endpoint information
        const endpointInfo = 'POST /institutions/get_by_id Plaid API';
        try {
            // retrieve the API Key and Base URL, needed in order to make the token exchange call through the client
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
            /**
             * POST /institutions/get_by_id
             * @link https://plaid.com/docs/api/institutions/#institutionsget_by_id
             *
             * build the Plaid API request body to be passed in, and perform a POST to it with the appropriate information
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            return axios_1.default.post(`${plaidBaseURL}/institutions/get_by_id`, {
                client_id: plaidClientId,
                secret: plaidSecretKey,
                country_codes: ["US"],
                institution_id: institutionId
            }, {
                headers: {
                    "Content-Type": "application/json"
                },
                timeout: 15000,
                timeoutErrorMessage: 'Plaid API timed out after 15000ms!'
            }).then(plaidInstitutionResponse => {
                /**
                 * if we reached this, then we assume that a 2xx response code was returned.
                 * check the contents of the response, and act appropriately.
                 */
                if (plaidInstitutionResponse.data !== undefined && plaidInstitutionResponse.data["institution"] !== undefined &&
                    plaidInstitutionResponse.data["institution"]["institution_id"] !== undefined &&
                    plaidInstitutionResponse.data["institution"]["institution_id"] !== institutionId &&
                    plaidInstitutionResponse.data["institution"]["name"] !== undefined) {
                    return {
                        data: {
                            name: plaidInstitutionResponse.data["institution"]["name"],
                            institution_id: plaidInstitutionResponse.data["institution"]["institution_id"]
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
            const errorMessage = `Unexpected error while retrieving the Plaid Institution details through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                errorMessage: errorMessage,
                errorType: GraphqlExports_1.PlaidLinkingErrorType.UnexpectedError
            };
        }
    }
    /**
     * Function used to exchange a Plaid public token for an access_token.
     *
     * @param publicToken public_token to exchange for an access_token.
     *
     * @return a {@link Promise} of {@link TokenExchangeResponse} representing the
     * access_token response obtained from the exchange, or an error, as applicable.
     */
    async exchangePlaidToken(publicToken) {
        // easily identifiable API endpoint information
        const endpointInfo = 'POST /item/public_token/exchange Plaid API';
        try {
            // retrieve the API Key and Base URL, needed in order to make the token exchange call through the client
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
            /**
             * POST /item/public_token/exchange
             * @link https://plaid.com/docs/api/tokens/#itempublic_tokenexchange
             *
             * build the Plaid API request body to be passed in, and perform a POST to it with the appropriate information
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            return axios_1.default.post(`${plaidBaseURL}/item/public_token/exchange`, {
                client_id: plaidClientId,
                secret: plaidSecretKey,
                public_token: publicToken
            }, {
                headers: {
                    "Content-Type": "application/json"
                },
                timeout: 15000,
                timeoutErrorMessage: 'Plaid API timed out after 15000ms!'
            }).then(plaidTokenExchangeResponse => {
                /**
                 * if we reached this, then we assume that a 2xx response code was returned.
                 * check the contents of the response, and act appropriately.
                 */
                if (plaidTokenExchangeResponse.data !== undefined && plaidTokenExchangeResponse.data["access_token"] !== undefined &&
                    plaidTokenExchangeResponse.data["item_id"] !== undefined && plaidTokenExchangeResponse.data["request_id"] !== undefined) {
                    return {
                        data: {
                            access_token: plaidTokenExchangeResponse.data["access_token"],
                            item_id: plaidTokenExchangeResponse.data["item_id"],
                            request_id: plaidTokenExchangeResponse.data["request_id"]
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
            const errorMessage = `Unexpected error while initiating the Plaid token exchange through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                errorMessage: errorMessage,
                errorType: GraphqlExports_1.PlaidLinkingErrorType.UnexpectedError
            };
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhaWRDbGllbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbW9uL2NsaWVudHMvUGxhaWRDbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsbURBQThDO0FBQzlDLHNEQVEyQjtBQUMzQiw0Q0FBdUM7QUFDdkMsa0RBQTBCO0FBRTFCOztHQUVHO0FBQ0gsTUFBYSxXQUFZLFNBQVEsNkJBQWE7SUFFMUM7Ozs7O09BS0c7SUFDSCxZQUFZLFdBQW1CLEVBQUUsTUFBYztRQUMzQyxLQUFLLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQy9CLENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0gsS0FBSyxDQUFDLFlBQVksQ0FBQyxXQUFtQjtRQUNsQywrQ0FBK0M7UUFDL0MsTUFBTSxZQUFZLEdBQUcsMEJBQTBCLENBQUM7UUFFaEQsSUFBSTtZQUNBLHdHQUF3RztZQUN4RyxNQUFNLENBQUMsWUFBWSxFQUFFLGFBQWEsRUFBRSxjQUFjLENBQUMsR0FBRyxNQUFNLEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxxQkFBUyxDQUFDLGdCQUFnQixDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFFM0ksNEVBQTRFO1lBQzVFLElBQUksWUFBWSxLQUFLLElBQUksSUFBSSxZQUFZLENBQUMsTUFBTSxLQUFLLENBQUM7Z0JBQ2xELGFBQWEsS0FBSyxJQUFJLElBQUksYUFBYSxDQUFDLE1BQU0sS0FBSyxDQUFDO2dCQUNwRCxjQUFjLEtBQUssSUFBSSxJQUFJLGNBQWUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUN6RCxNQUFNLFlBQVksR0FBRyw4Q0FBOEMsQ0FBQztnQkFDcEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFFMUIsT0FBTztvQkFDSCxZQUFZLEVBQUUsWUFBWTtvQkFDMUIsU0FBUyxFQUFFLHNDQUFxQixDQUFDLGVBQWU7aUJBQ25ELENBQUM7YUFDTDtZQUVEOzs7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IFwiLi9CYXNlQVBJQ2xpZW50XCI7XG5pbXBvcnQge1xuICAgIENyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dCwgSW5zdGl0dXRpb25SZXNwb25zZSxcbiAgICBQbGFpZEF1dGhSZXNwb25zZSxcbiAgICBQbGFpZExpbmtpbmdBY2NvdW50U3VidHlwZSxcbiAgICBQbGFpZExpbmtpbmdBY2NvdW50VHlwZSxcbiAgICBQbGFpZExpbmtpbmdFcnJvclR5cGUsXG4gICAgUGxhaWRMaW5raW5nU2Vzc2lvblJlc3BvbnNlLFxuICAgIFRva2VuRXhjaGFuZ2VSZXNwb25zZVxufSBmcm9tIFwiLi4vR3JhcGhxbEV4cG9ydHNcIjtcbmltcG9ydCB7Q29uc3RhbnRzfSBmcm9tIFwiLi4vQ29uc3RhbnRzXCI7XG5pbXBvcnQgYXhpb3MgZnJvbSBcImF4aW9zXCI7XG5cbi8qKlxuICogQ2xhc3MgdXNlZCBhcyB0aGUgYmFzZS9nZW5lcmljIGNsaWVudCBmb3IgYWxsIFBsYWlkL25vdGlmaWNhdGlvbi1yZWxhdGVkIGNhbGxzLlxuICovXG5leHBvcnQgY2xhc3MgUGxhaWRDbGllbnQgZXh0ZW5kcyBCYXNlQVBJQ2xpZW50IHtcblxuICAgIC8qKlxuICAgICAqIEdlbmVyaWMgY29uc3RydWN0b3IgZm9yIHRoZSBjbGllbnQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZW52aXJvbm1lbnQgdGhlIEFXUyBlbnZpcm9ubWVudCBwYXNzZWQgaW4gZnJvbSB0aGUgTGFtYmRhIHJlc29sdmVyLlxuICAgICAqIEBwYXJhbSByZWdpb24gdGhlIEFXUyByZWdpb24gcGFzc2VkIGluIGZyb20gdGhlIExhbWJkYSByZXNvbHZlci5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihlbnZpcm9ubWVudDogc3RyaW5nLCByZWdpb246IHN0cmluZykge1xuICAgICAgICBzdXBlcihyZWdpb24sIGVudmlyb25tZW50KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB1c2VkIHRvIHJldHJpZXZlIHRoZSBQbGFpZCBJdGVtIEF1dGggZGV0YWlscywgZ2l2ZW4gYW4gYWNjZXNzX3Rva2VuLlxuICAgICAqXG4gICAgICogQHBhcmFtIGFjY2Vzc1Rva2VuIGFjY2Vzc190b2tlbiB1c2VkIHRvIHJldHJpZXZlIHRoZSBQTGFpZCBBdXRoIEl0ZW0gZm9yLlxuICAgICAqXG4gICAgICogQHJldHVybiBhIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgUGxhaWRBdXRoUmVzcG9uc2V9IHJlcHJlc2VudGluZyB0aGVcbiAgICAgKiBQbGFpZCBJdGVtIEF1dGggcmVzcG9uc2Ugb2J0YWluZWQsIG9yIGFuIGVycm9yLCBhcyBhcHBsaWNhYmxlLlxuICAgICAqL1xuICAgIGFzeW5jIGdldFBsYWlkQXV0aChhY2Nlc3NUb2tlbjogU3RyaW5nKTogUHJvbWlzZTxQbGFpZEF1dGhSZXNwb25zZT4ge1xuICAgICAgICAvLyBlYXNpbHkgaWRlbnRpZmlhYmxlIEFQSSBlbmRwb2ludCBpbmZvcm1hdGlvblxuICAgICAgICBjb25zdCBlbmRwb2ludEluZm8gPSAnUE9TVCAvYXV0aC9nZXQgUGxhaWQgQVBJJztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIEFQSSBLZXkgYW5kIEJhc2UgVVJMLCBuZWVkZWQgaW4gb3JkZXIgdG8gbWFrZSB0aGUgdG9rZW4gZXhjaGFuZ2UgY2FsbCB0aHJvdWdoIHRoZSBjbGllbnRcbiAgICAgICAgICAgIGNvbnN0IFtwbGFpZEJhc2VVUkwsIHBsYWlkQ2xpZW50SWQsIHBsYWlkU2VjcmV0S2V5XSA9IGF3YWl0IHN1cGVyLnJldHJpZXZlU2VydmljZUNyZWRlbnRpYWxzKENvbnN0YW50cy5BV1NQYWlyQ29uc3RhbnRzLlBMQUlEX1NFQ1JFVF9OQU1FKTtcblxuICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHdlIG9idGFpbmVkIGFueSBpbnZhbGlkIHNlY3JldCB2YWx1ZXMgZnJvbSB0aGUgY2FsbCBhYm92ZVxuICAgICAgICAgICAgaWYgKHBsYWlkQmFzZVVSTCA9PT0gbnVsbCB8fCBwbGFpZEJhc2VVUkwubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgcGxhaWRDbGllbnRJZCA9PT0gbnVsbCB8fCBwbGFpZENsaWVudElkLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIHBsYWlkU2VjcmV0S2V5ID09PSBudWxsIHx8IHBsYWlkU2VjcmV0S2V5IS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBcIkludmFsaWQgU2VjcmV0cyBvYnRhaW5lZCBmb3IgUGxhaWQgQVBJIGNhbGwhXCI7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFBsYWlkTGlua2luZ0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFBPU1QgL2F1dGgvZ2V0XG4gICAgICAgICAgICAgKiBAbGluayBodHRwczovL3BsYWlkLmNvbS9kb2NzL2FwaS9wcm9kdWN0cy9hdXRoLyNhdXRoZ2V0XG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogYnVpbGQgdGhlIFBsYWlkIEFQSSByZXF1ZXN0IGJvZHkgdG8gYmUgcGFzc2VkIGluLCBhbmQgcGVyZm9ybSBhIFBPU1QgdG8gaXQgd2l0aCB0aGUgYXBwcm9wcmlhdGUgaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAqIHdlIGltcGx5IHRoYXQgaWYgdGhlIEFQSSBkb2VzIG5vdCByZXNwb25kIGluIDE1IHNlY29uZHMsIHRoZW4gd2UgYXV0b21hdGljYWxseSBjYXRjaCB0aGF0LCBhbmQgcmV0dXJuIGFuXG4gICAgICAgICAgICAgKiBlcnJvciBmb3IgYSBiZXR0ZXIgY3VzdG9tZXIgZXhwZXJpZW5jZS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgcmV0dXJuIGF4aW9zLnBvc3QoYCR7cGxhaWRCYXNlVVJMfS9hdXRoL2dldGAsIHtcbiAgICAgICAgICAgICAgICBjbGllbnRfaWQ6IHBsYWlkQ2xpZW50SWQsXG4gICAgICAgICAgICAgICAgc2VjcmV0OiBwbGFpZFNlY3JldEtleSxcbiAgICAgICAgICAgICAgICBhY2Nlc3NfdG9rZW46IGFjY2Vzc1Rva2VuXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIlxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGltZW91dDogMTUwMDAsIC8vIGluIG1pbGxpc2Vjb25kcyBoZXJlXG4gICAgICAgICAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZTogJ1BsYWlkIEFQSSB0aW1lZCBvdXQgYWZ0ZXIgMTUwMDBtcyEnXG4gICAgICAgICAgICB9KS50aGVuKHBsYWlkSXRlbUF1dGhSZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogaWYgd2UgcmVhY2hlZCB0aGlzLCB0aGVuIHdlIGFzc3VtZSB0aGF0IGEgMnh4IHJlc3BvbnNlIGNvZGUgd2FzIHJldHVybmVkLlxuICAgICAgICAgICAgICAgICAqIGNoZWNrIHRoZSBjb250ZW50cyBvZiB0aGUgcmVzcG9uc2UsIGFuZCBhY3QgYXBwcm9wcmlhdGVseS5cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBpZiAocGxhaWRJdGVtQXV0aFJlc3BvbnNlLmRhdGEgIT09IHVuZGVmaW5lZCAmJiBwbGFpZEl0ZW1BdXRoUmVzcG9uc2UuZGF0YVtcImFjY291bnRzXCJdICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgcGxhaWRJdGVtQXV0aFJlc3BvbnNlLmRhdGFbXCJhY2NvdW50c1wiXS5sZW5ndGggIT09IDAgJiYgcGxhaWRJdGVtQXV0aFJlc3BvbnNlLmRhdGFbXCJpdGVtXCJdICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgcGxhaWRJdGVtQXV0aFJlc3BvbnNlLmRhdGFbXCJpdGVtXCJdW1wiaXRlbV9pZFwiXSAhPT0gdW5kZWZpbmVkICYmIHBsYWlkSXRlbUF1dGhSZXNwb25zZS5kYXRhW1wiaXRlbVwiXVtcImluc3RpdHV0aW9uX2lkXCJdICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgcGxhaWRJdGVtQXV0aFJlc3BvbnNlLmRhdGFbXCJudW1iZXJzXCJdICE9PSB1bmRlZmluZWQgJiYgcGxhaWRJdGVtQXV0aFJlc3BvbnNlLmRhdGFbXCJudW1iZXJzXCJdW1wiYWNoXCJdICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgcGxhaWRJdGVtQXV0aFJlc3BvbnNlLmRhdGFbXCJudW1iZXJzXCJdW1wiYWNoXCJdLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBlbnN1cmUgdGhhdCB0aGVyZSBpcyBhIGNoZWNraW5nIGFjY291bnQgYXNzb2NpYXRlZCB3aXRoIHRoZSBMaW5rZWQgSXRlbVxuICAgICAgICAgICAgICAgICAgICBsZXQgdmFsaWRBY2NvdW50OiBib29sZWFuID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNvdW50ZXJzIHRvIGtlZXAgdHJhY2sgb2YgdGhlIGFjY291bnQgYW5kIGFjaCBjb3VudHNcbiAgICAgICAgICAgICAgICAgICAgbGV0IGFjY291bnRDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGxldCBhY2hBY2NvdW50Q291bnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICAvLyB0YXJnZXQgY291bnRlcnMgdG8gaGlnaGxpZ2h0IHdoaWNoIGFjY291bnQgYW5kIGFjaCBvYmplY3QgdG8gdXNlIGZvciB0aGUgcmV0dXJuIG9iamVjdFxuICAgICAgICAgICAgICAgICAgICBsZXQgYWNjb3VudENvdW50VGFyZ2V0ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGFjaEFjY291bnRDb3VudFRhcmdldCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHBsYWlkSXRlbUF1dGhSZXNwb25zZS5kYXRhW1wiYWNjb3VudHNcIl0uZm9yRWFjaChhY2NvdW50ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG1ha2Ugc3VyZSB0aGF0IHRoZSBhY2NvdW50IGluZm9ybWF0aW9uIGlzIHZhbGlkXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYWNjb3VudFtcImFjY291bnRfaWRcIl0gIT09IHVuZGVmaW5lZCAmJiBhY2NvdW50W1wibWFza1wiXSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWNjb3VudFtcIm5hbWVcIl0gIT09IHVuZGVmaW5lZCAmJiBhY2NvdW50W1wib2ZmaWNpYWxfbmFtZVwiXSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWNjb3VudFtcInBlcnNpc3RlbnRfYWNjb3VudF9pZFwiXSAhPT0gdW5kZWZpbmVkICYmIGFjY291bnRbXCJzdWJ0eXBlXCJdICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY2NvdW50W1widHlwZVwiXSAhPT0gdW5kZWZpbmVkICYmIGFjY291bnRbXCJzdWJ0eXBlXCJdLnRvTG93ZXJDYXNlKCkgPT09IFBsYWlkTGlua2luZ0FjY291bnRTdWJ0eXBlLkNoZWNraW5nLnRvTG93ZXJDYXNlKCkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY2NvdW50W1widHlwZVwiXS50b0xvd2VyQ2FzZSgpID09PSBQbGFpZExpbmtpbmdBY2NvdW50VHlwZS5EZXBvc2l0b3J5LnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBmb3IgdGhhdCBwYXJ0aWN1bGFyIGFjY291bnQsIGxvb3AgdGhyb3VnaCB0aGUgQUNIIG51bWJlcnMsIGFuZCBzZWUgaWYgd2UgaGF2ZSB2YWxpZCBudW1iZXJzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxhaWRJdGVtQXV0aFJlc3BvbnNlLmRhdGFbXCJudW1iZXJzXCJdW1wiYWNoXCJdLmZvckVhY2goYWNoID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFjaFtcImFjY291bnRfaWRcIl0gIT09IHVuZGVmaW5lZCAmJiBhY2hbXCJhY2NvdW50X2lkXCJdID09PSBhY2NvdW50W1wiYWNjb3VudF9pZFwiXSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWNoW1wiYWNjb3VudFwiXSAhPT0gdW5kZWZpbmVkICYmIGFjaFtcInJvdXRpbmdcIl0gIT09IHVuZGVmaW5lZCAmJiBhY2hbXCJ3aXJlX3JvdXRpbmdcIl0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2V0IHRoZSB0YXJnZXQgY291bnRlcnMgYW5kIGZsYWcgYWNjb3JkaW5nbHlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkQWNjb3VudCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY2NvdW50Q291bnRUYXJnZXQgPSBhY2NvdW50Q291bnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY2hBY2NvdW50Q291bnRUYXJnZXQgPSBhY2hBY2NvdW50Q291bnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWxpZEFjY291bnQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY2hBY2NvdW50Q291bnQgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgYWNjb3VudENvdW50ICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIHRoZXJlJ3Mgbm8gdmFsaWQgYWNjb3VudCBhbmQgQUNIIG51bWJlcnMgYXNzb2NpYXRlZCB3aXRoIHRoYXQgYWNjb3VudCwgdGhlbiByZXR1cm4gYW4gZXJyb3JcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF2YWxpZEFjY291bnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgSW52YWxpZCBhY2NvdW50IHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tICR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSFgLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogUGxhaWRMaW5raW5nRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZm9yIGEgdmFsaWQgUGxhaWQgQXV0aCBJdGVtLCB1c2UgdGhlIGFwcHJvcHJpYXRlIHBhcmFtZXRlcnMgdG8gYnVpbGQgdGhlIEF1dGggT2JqZWN0IHRvIHJldHVyblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc3RpdHV0aW9uX2lkOiBwbGFpZEl0ZW1BdXRoUmVzcG9uc2UuZGF0YVtcIml0ZW1cIl1bXCJpbnN0aXR1dGlvbl9pZFwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbV9pZDogcGxhaWRJdGVtQXV0aFJlc3BvbnNlLmRhdGFbXCJpdGVtXCJdW1wiaXRlbV9pZFwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWNjb3VudDogW3tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjY291bnQ6IHBsYWlkSXRlbUF1dGhSZXNwb25zZS5kYXRhW1wibnVtYmVyc1wiXVtcImFjaFwiXVthY2hBY2NvdW50Q291bnRUYXJnZXRdW1wiYWNjb3VudFwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjY291bnRfaWQ6IHBsYWlkSXRlbUF1dGhSZXNwb25zZS5kYXRhW1wiYWNjb3VudHNcIl1bYWNjb3VudENvdW50VGFyZ2V0XVtcImFjY291bnRfaWRcIl0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXNrOiBwbGFpZEl0ZW1BdXRoUmVzcG9uc2UuZGF0YVtcImFjY291bnRzXCJdW2FjY291bnRDb3VudFRhcmdldF1bXCJtYXNrXCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogcGxhaWRJdGVtQXV0aFJlc3BvbnNlLmRhdGFbXCJhY2NvdW50c1wiXVthY2NvdW50Q291bnRUYXJnZXRdW1wibmFtZVwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9mZmljaWFsX25hbWU6IHBsYWlkSXRlbUF1dGhSZXNwb25zZS5kYXRhW1wiYWNjb3VudHNcIl1bYWNjb3VudENvdW50VGFyZ2V0XVtcIm9mZmljaWFsX25hbWVcIl0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwZXJzaXN0ZW50X2FjY291bnRfaWQ6IHBsYWlkSXRlbUF1dGhSZXNwb25zZS5kYXRhW1wiYWNjb3VudHNcIl1bYWNjb3VudENvdW50VGFyZ2V0XVtcInBlcnNpc3RlbnRfYWNjb3VudF9pZFwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvdXRpbmc6IHBsYWlkSXRlbUF1dGhSZXNwb25zZS5kYXRhW1wibnVtYmVyc1wiXVtcImFjaFwiXVthY2hBY2NvdW50Q291bnRUYXJnZXRdW1wicm91dGluZ1wiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1YnR5cGU6IFBsYWlkTGlua2luZ0FjY291bnRTdWJ0eXBlLkNoZWNraW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogUGxhaWRMaW5raW5nQWNjb3VudFR5cGUuRGVwb3NpdG9yeSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpcmVfcm91dGluZzogcGxhaWRJdGVtQXV0aFJlc3BvbnNlLmRhdGFbXCJudW1iZXJzXCJdW1wiYWNoXCJdW2FjaEFjY291bnRDb3VudFRhcmdldF1bXCJ3aXJlX3JvdXRpbmdcIl1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgSW52YWxpZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UhYCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogUGxhaWRMaW5raW5nRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvclxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvci5yZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYW5kIHRoZSBzZXJ2ZXIgcmVzcG9uZGVkIHdpdGggYSBzdGF0dXMgY29kZVxuICAgICAgICAgICAgICAgICAgICAgKiB0aGF0IGZhbGxzIG91dCBvZiB0aGUgcmFuZ2Ugb2YgMnh4LlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vbiAyeHh4IHJlc3BvbnNlIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBQbGFpZCBBUEksIHdpdGggc3RhdHVzICR7ZXJyb3IucmVzcG9uc2Uuc3RhdHVzfSwgYW5kIHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZXJyb3IucmVzcG9uc2UuZGF0YSl9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFBsYWlkTGlua2luZ0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVycm9yLnJlcXVlc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGJ1dCBubyByZXNwb25zZSB3YXMgcmVjZWl2ZWRcbiAgICAgICAgICAgICAgICAgICAgICogYGVycm9yLnJlcXVlc3RgIGlzIGFuIGluc3RhbmNlIG9mIFhNTEh0dHBSZXF1ZXN0IGluIHRoZSBicm93c2VyIGFuZCBhbiBpbnN0YW5jZSBvZlxuICAgICAgICAgICAgICAgICAgICAgKiAgaHR0cC5DbGllbnRSZXF1ZXN0IGluIG5vZGUuanMuXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm8gcmVzcG9uc2UgcmVjZWl2ZWQgd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IFBsYWlkIEFQSSwgZm9yIHJlcXVlc3QgJHtlcnJvci5yZXF1ZXN0fWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBQbGFpZExpbmtpbmdFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU29tZXRoaW5nIGhhcHBlbmVkIGluIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgdGhhdCB0cmlnZ2VyZWQgYW4gRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgc2V0dGluZyB1cCB0aGUgcmVxdWVzdCBmb3IgdGhlICR7ZW5kcG9pbnRJbmZvfSBQbGFpZCBBUEksICR7KGVycm9yICYmIGVycm9yLm1lc3NhZ2UpICYmIGVycm9yLm1lc3NhZ2V9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFBsYWlkTGlua2luZ0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBpbml0aWF0aW5nIHRoZSBQbGFpZCBJdGVtIEF1dGggcmV0cmlldmFsIHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJ9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBQbGFpZExpbmtpbmdFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdXNlZCB0byByZXRyaWV2ZSBpbnN0aXR1dGlvbiBkZXRhaWxzIGdpdmVuIGFuIGluc3RpdHV0aW9uIGlkLlxuICAgICAqXG4gICAgICogQHBhcmFtIGluc3RpdHV0aW9uSWQgaW5zdGl0dXRpb25faWQgdG8gcmV0cmlldmUgaW5zdGl0dXRpb24gZGV0YWlscyBmb3IuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIGEge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBJbnN0aXR1dGlvblJlc3BvbnNlfSByZXByZXNlbnRpbmcgdGhlXG4gICAgICogaW5zdGl0dXRpb24gZGV0YWlscyByZXNwb25zZSBvYnRhaW5lZCwgb3IgYW4gZXJyb3IsIGFzIGFwcGxpY2FibGUuXG4gICAgICovXG4gICAgYXN5bmMgZ2V0SW5zdGl0dXRpb25CeUlkKGluc3RpdHV0aW9uSWQ6IFN0cmluZyk6IFByb21pc2U8SW5zdGl0dXRpb25SZXNwb25zZT4ge1xuICAgICAgICAvLyBlYXNpbHkgaWRlbnRpZmlhYmxlIEFQSSBlbmRwb2ludCBpbmZvcm1hdGlvblxuICAgICAgICBjb25zdCBlbmRwb2ludEluZm8gPSAnUE9TVCAvaW5zdGl0dXRpb25zL2dldF9ieV9pZCBQbGFpZCBBUEknO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgQVBJIEtleSBhbmQgQmFzZSBVUkwsIG5lZWRlZCBpbiBvcmRlciB0byBtYWtlIHRoZSB0b2tlbiBleGNoYW5nZSBjYWxsIHRocm91Z2ggdGhlIGNsaWVudFxuICAgICAgICAgICAgY29uc3QgW3BsYWlkQmFzZVVSTCwgcGxhaWRDbGllbnRJZCwgcGxhaWRTZWNyZXRLZXldID0gYXdhaXQgc3VwZXIucmV0cmlldmVTZXJ2aWNlQ3JlZGVudGlhbHMoQ29uc3RhbnRzLkFXU1BhaXJDb25zdGFudHMuUExBSURfU0VDUkVUX05BTUUpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgd2Ugb2J0YWluZWQgYW55IGludmFsaWQgc2VjcmV0IHZhbHVlcyBmcm9tIHRoZSBjYWxsIGFib3ZlXG4gICAgICAgICAgICBpZiAocGxhaWRCYXNlVVJMID09PSBudWxsIHx8IHBsYWlkQmFzZVVSTC5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBwbGFpZENsaWVudElkID09PSBudWxsIHx8IHBsYWlkQ2xpZW50SWQubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgcGxhaWRTZWNyZXRLZXkgPT09IG51bGwgfHwgcGxhaWRTZWNyZXRLZXkhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IFwiSW52YWxpZCBTZWNyZXRzIG9idGFpbmVkIGZvciBQbGFpZCBBUEkgY2FsbCFcIjtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogUGxhaWRMaW5raW5nRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogUE9TVCAvaW5zdGl0dXRpb25zL2dldF9ieV9pZFxuICAgICAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9wbGFpZC5jb20vZG9jcy9hcGkvaW5zdGl0dXRpb25zLyNpbnN0aXR1dGlvbnNnZXRfYnlfaWRcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBidWlsZCB0aGUgUGxhaWQgQVBJIHJlcXVlc3QgYm9keSB0byBiZSBwYXNzZWQgaW4sIGFuZCBwZXJmb3JtIGEgUE9TVCB0byBpdCB3aXRoIHRoZSBhcHByb3ByaWF0ZSBpbmZvcm1hdGlvblxuICAgICAgICAgICAgICogd2UgaW1wbHkgdGhhdCBpZiB0aGUgQVBJIGRvZXMgbm90IHJlc3BvbmQgaW4gMTUgc2Vjb25kcywgdGhlbiB3ZSBhdXRvbWF0aWNhbGx5IGNhdGNoIHRoYXQsIGFuZCByZXR1cm4gYW5cbiAgICAgICAgICAgICAqIGVycm9yIGZvciBhIGJldHRlciBjdXN0b21lciBleHBlcmllbmNlLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICByZXR1cm4gYXhpb3MucG9zdChgJHtwbGFpZEJhc2VVUkx9L2luc3RpdHV0aW9ucy9nZXRfYnlfaWRgLCB7XG4gICAgICAgICAgICAgICAgY2xpZW50X2lkOiBwbGFpZENsaWVudElkLFxuICAgICAgICAgICAgICAgIHNlY3JldDogcGxhaWRTZWNyZXRLZXksXG4gICAgICAgICAgICAgICAgY291bnRyeV9jb2RlczogW1wiVVNcIl0sXG4gICAgICAgICAgICAgICAgaW5zdGl0dXRpb25faWQ6IGluc3RpdHV0aW9uSWRcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiAxNTAwMCwgLy8gaW4gbWlsbGlzZWNvbmRzIGhlcmVcbiAgICAgICAgICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlOiAnUGxhaWQgQVBJIHRpbWVkIG91dCBhZnRlciAxNTAwMG1zISdcbiAgICAgICAgICAgIH0pLnRoZW4ocGxhaWRJbnN0aXR1dGlvblJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiBpZiB3ZSByZWFjaGVkIHRoaXMsIHRoZW4gd2UgYXNzdW1lIHRoYXQgYSAyeHggcmVzcG9uc2UgY29kZSB3YXMgcmV0dXJuZWQuXG4gICAgICAgICAgICAgICAgICogY2hlY2sgdGhlIGNvbnRlbnRzIG9mIHRoZSByZXNwb25zZSwgYW5kIGFjdCBhcHByb3ByaWF0ZWx5LlxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGlmIChwbGFpZEluc3RpdHV0aW9uUmVzcG9uc2UuZGF0YSAhPT0gdW5kZWZpbmVkICYmIHBsYWlkSW5zdGl0dXRpb25SZXNwb25zZS5kYXRhW1wiaW5zdGl0dXRpb25cIl0gIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgICAgICAgICBwbGFpZEluc3RpdHV0aW9uUmVzcG9uc2UuZGF0YVtcImluc3RpdHV0aW9uXCJdW1wiaW5zdGl0dXRpb25faWRcIl0gIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgICAgICAgICBwbGFpZEluc3RpdHV0aW9uUmVzcG9uc2UuZGF0YVtcImluc3RpdHV0aW9uXCJdW1wiaW5zdGl0dXRpb25faWRcIl0gIT09IGluc3RpdHV0aW9uSWQgJiZcbiAgICAgICAgICAgICAgICAgICAgcGxhaWRJbnN0aXR1dGlvblJlc3BvbnNlLmRhdGFbXCJpbnN0aXR1dGlvblwiXVtcIm5hbWVcIl0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHBsYWlkSW5zdGl0dXRpb25SZXNwb25zZS5kYXRhW1wiaW5zdGl0dXRpb25cIl1bXCJuYW1lXCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc3RpdHV0aW9uX2lkOiBwbGFpZEluc3RpdHV0aW9uUmVzcG9uc2UuZGF0YVtcImluc3RpdHV0aW9uXCJdW1wiaW5zdGl0dXRpb25faWRcIl1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBJbnZhbGlkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tICR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSFgLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBQbGFpZExpbmtpbmdFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yLnJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBhbmQgdGhlIHNlcnZlciByZXNwb25kZWQgd2l0aCBhIHN0YXR1cyBjb2RlXG4gICAgICAgICAgICAgICAgICAgICAqIHRoYXQgZmFsbHMgb3V0IG9mIHRoZSByYW5nZSBvZiAyeHguXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm9uIDJ4eHggcmVzcG9uc2Ugd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IFBsYWlkIEFQSSwgd2l0aCBzdGF0dXMgJHtlcnJvci5yZXNwb25zZS5zdGF0dXN9LCBhbmQgcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShlcnJvci5yZXNwb25zZS5kYXRhKX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogUGxhaWRMaW5raW5nRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3IucmVxdWVzdCkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYnV0IG5vIHJlc3BvbnNlIHdhcyByZWNlaXZlZFxuICAgICAgICAgICAgICAgICAgICAgKiBgZXJyb3IucmVxdWVzdGAgaXMgYW4gaW5zdGFuY2Ugb2YgWE1MSHR0cFJlcXVlc3QgaW4gdGhlIGJyb3dzZXIgYW5kIGFuIGluc3RhbmNlIG9mXG4gICAgICAgICAgICAgICAgICAgICAqICBodHRwLkNsaWVudFJlcXVlc3QgaW4gbm9kZS5qcy5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBObyByZXNwb25zZSByZWNlaXZlZCB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gUGxhaWQgQVBJLCBmb3IgcmVxdWVzdCAke2Vycm9yLnJlcXVlc3R9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFBsYWlkTGlua2luZ0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBTb21ldGhpbmcgaGFwcGVuZWQgaW4gc2V0dGluZyB1cCB0aGUgcmVxdWVzdCB0aGF0IHRyaWdnZXJlZCBhbiBFcnJvclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IGZvciB0aGUgJHtlbmRwb2ludEluZm99IFBsYWlkIEFQSSwgJHsoZXJyb3IgJiYgZXJyb3IubWVzc2FnZSkgJiYgZXJyb3IubWVzc2FnZX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogUGxhaWRMaW5raW5nRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHJldHJpZXZpbmcgdGhlIFBsYWlkIEluc3RpdHV0aW9uIGRldGFpbHMgdGhyb3VnaCAke2VuZHBvaW50SW5mb31gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfSAke2Vycn1gKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFBsYWlkTGlua2luZ0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB1c2VkIHRvIGV4Y2hhbmdlIGEgUGxhaWQgcHVibGljIHRva2VuIGZvciBhbiBhY2Nlc3NfdG9rZW4uXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcHVibGljVG9rZW4gcHVibGljX3Rva2VuIHRvIGV4Y2hhbmdlIGZvciBhbiBhY2Nlc3NfdG9rZW4uXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIGEge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBUb2tlbkV4Y2hhbmdlUmVzcG9uc2V9IHJlcHJlc2VudGluZyB0aGVcbiAgICAgKiBhY2Nlc3NfdG9rZW4gcmVzcG9uc2Ugb2J0YWluZWQgZnJvbSB0aGUgZXhjaGFuZ2UsIG9yIGFuIGVycm9yLCBhcyBhcHBsaWNhYmxlLlxuICAgICAqL1xuICAgIGFzeW5jIGV4Y2hhbmdlUGxhaWRUb2tlbihwdWJsaWNUb2tlbjogU3RyaW5nKTogUHJvbWlzZTxUb2tlbkV4Y2hhbmdlUmVzcG9uc2U+IHtcbiAgICAgICAgLy8gZWFzaWx5IGlkZW50aWZpYWJsZSBBUEkgZW5kcG9pbnQgaW5mb3JtYXRpb25cbiAgICAgICAgY29uc3QgZW5kcG9pbnRJbmZvID0gJ1BPU1QgL2l0ZW0vcHVibGljX3Rva2VuL2V4Y2hhbmdlIFBsYWlkIEFQSSc7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBBUEkgS2V5IGFuZCBCYXNlIFVSTCwgbmVlZGVkIGluIG9yZGVyIHRvIG1ha2UgdGhlIHRva2VuIGV4Y2hhbmdlIGNhbGwgdGhyb3VnaCB0aGUgY2xpZW50XG4gICAgICAgICAgICBjb25zdCBbcGxhaWRCYXNlVVJMLCBwbGFpZENsaWVudElkLCBwbGFpZFNlY3JldEtleV0gPSBhd2FpdCBzdXBlci5yZXRyaWV2ZVNlcnZpY2VDcmVkZW50aWFscyhDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5QTEFJRF9TRUNSRVRfTkFNRSk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB3ZSBvYnRhaW5lZCBhbnkgaW52YWxpZCBzZWNyZXQgdmFsdWVzIGZyb20gdGhlIGNhbGwgYWJvdmVcbiAgICAgICAgICAgIGlmIChwbGFpZEJhc2VVUkwgPT09IG51bGwgfHwgcGxhaWRCYXNlVVJMLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIHBsYWlkQ2xpZW50SWQgPT09IG51bGwgfHwgcGxhaWRDbGllbnRJZC5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBwbGFpZFNlY3JldEtleSA9PT0gbnVsbCB8fCBwbGFpZFNlY3JldEtleSEubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gXCJJbnZhbGlkIFNlY3JldHMgb2J0YWluZWQgZm9yIFBsYWlkIEFQSSBjYWxsIVwiO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBQbGFpZExpbmtpbmdFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBQT1NUIC9pdGVtL3B1YmxpY190b2tlbi9leGNoYW5nZVxuICAgICAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9wbGFpZC5jb20vZG9jcy9hcGkvdG9rZW5zLyNpdGVtcHVibGljX3Rva2VuZXhjaGFuZ2VcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBidWlsZCB0aGUgUGxhaWQgQVBJIHJlcXVlc3QgYm9keSB0byBiZSBwYXNzZWQgaW4sIGFuZCBwZXJmb3JtIGEgUE9TVCB0byBpdCB3aXRoIHRoZSBhcHByb3ByaWF0ZSBpbmZvcm1hdGlvblxuICAgICAgICAgICAgICogd2UgaW1wbHkgdGhhdCBpZiB0aGUgQVBJIGRvZXMgbm90IHJlc3BvbmQgaW4gMTUgc2Vjb25kcywgdGhlbiB3ZSBhdXRvbWF0aWNhbGx5IGNhdGNoIHRoYXQsIGFuZCByZXR1cm4gYW5cbiAgICAgICAgICAgICAqIGVycm9yIGZvciBhIGJldHRlciBjdXN0b21lciBleHBlcmllbmNlLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICByZXR1cm4gYXhpb3MucG9zdChgJHtwbGFpZEJhc2VVUkx9L2l0ZW0vcHVibGljX3Rva2VuL2V4Y2hhbmdlYCwge1xuICAgICAgICAgICAgICAgIGNsaWVudF9pZDogcGxhaWRDbGllbnRJZCxcbiAgICAgICAgICAgICAgICBzZWNyZXQ6IHBsYWlkU2VjcmV0S2V5LFxuICAgICAgICAgICAgICAgIHB1YmxpY190b2tlbjogcHVibGljVG9rZW5cbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiAxNTAwMCwgLy8gaW4gbWlsbGlzZWNvbmRzIGhlcmVcbiAgICAgICAgICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlOiAnUGxhaWQgQVBJIHRpbWVkIG91dCBhZnRlciAxNTAwMG1zISdcbiAgICAgICAgICAgIH0pLnRoZW4ocGxhaWRUb2tlbkV4Y2hhbmdlUmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIGlmIHdlIHJlYWNoZWQgdGhpcywgdGhlbiB3ZSBhc3N1bWUgdGhhdCBhIDJ4eCByZXNwb25zZSBjb2RlIHdhcyByZXR1cm5lZC5cbiAgICAgICAgICAgICAgICAgKiBjaGVjayB0aGUgY29udGVudHMgb2YgdGhlIHJlc3BvbnNlLCBhbmQgYWN0IGFwcHJvcHJpYXRlbHkuXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgaWYgKHBsYWlkVG9rZW5FeGNoYW5nZVJlc3BvbnNlLmRhdGEgIT09IHVuZGVmaW5lZCAmJiBwbGFpZFRva2VuRXhjaGFuZ2VSZXNwb25zZS5kYXRhW1wiYWNjZXNzX3Rva2VuXCJdICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgcGxhaWRUb2tlbkV4Y2hhbmdlUmVzcG9uc2UuZGF0YVtcIml0ZW1faWRcIl0gIT09IHVuZGVmaW5lZCAmJiBwbGFpZFRva2VuRXhjaGFuZ2VSZXNwb25zZS5kYXRhW1wicmVxdWVzdF9pZFwiXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWNjZXNzX3Rva2VuOiBwbGFpZFRva2VuRXhjaGFuZ2VSZXNwb25zZS5kYXRhW1wiYWNjZXNzX3Rva2VuXCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1faWQ6IHBsYWlkVG9rZW5FeGNoYW5nZVJlc3BvbnNlLmRhdGFbXCJpdGVtX2lkXCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVlc3RfaWQ6IHBsYWlkVG9rZW5FeGNoYW5nZVJlc3BvbnNlLmRhdGFbXCJyZXF1ZXN0X2lkXCJdXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgSW52YWxpZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UhYCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogUGxhaWRMaW5raW5nRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvclxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvci5yZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYW5kIHRoZSBzZXJ2ZXIgcmVzcG9uZGVkIHdpdGggYSBzdGF0dXMgY29kZVxuICAgICAgICAgICAgICAgICAgICAgKiB0aGF0IGZhbGxzIG91dCBvZiB0aGUgcmFuZ2Ugb2YgMnh4LlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vbiAyeHh4IHJlc3BvbnNlIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBQbGFpZCBBUEksIHdpdGggc3RhdHVzICR7ZXJyb3IucmVzcG9uc2Uuc3RhdHVzfSwgYW5kIHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZXJyb3IucmVzcG9uc2UuZGF0YSl9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFBsYWlkTGlua2luZ0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVycm9yLnJlcXVlc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGJ1dCBubyByZXNwb25zZSB3YXMgcmVjZWl2ZWRcbiAgICAgICAgICAgICAgICAgICAgICogYGVycm9yLnJlcXVlc3RgIGlzIGFuIGluc3RhbmNlIG9mIFhNTEh0dHBSZXF1ZXN0IGluIHRoZSBicm93c2VyIGFuZCBhbiBpbnN0YW5jZSBvZlxuICAgICAgICAgICAgICAgICAgICAgKiAgaHR0cC5DbGllbnRSZXF1ZXN0IGluIG5vZGUuanMuXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm8gcmVzcG9uc2UgcmVjZWl2ZWQgd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IFBsYWlkIEFQSSwgZm9yIHJlcXVlc3QgJHtlcnJvci5yZXF1ZXN0fWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBQbGFpZExpbmtpbmdFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU29tZXRoaW5nIGhhcHBlbmVkIGluIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgdGhhdCB0cmlnZ2VyZWQgYW4gRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgc2V0dGluZyB1cCB0aGUgcmVxdWVzdCBmb3IgdGhlICR7ZW5kcG9pbnRJbmZvfSBQbGFpZCBBUEksICR7KGVycm9yICYmIGVycm9yLm1lc3NhZ2UpICYmIGVycm9yLm1lc3NhZ2V9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFBsYWlkTGlua2luZ0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBpbml0aWF0aW5nIHRoZSBQbGFpZCB0b2tlbiBleGNoYW5nZSB0aHJvdWdoICR7ZW5kcG9pbnRJbmZvfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9ICR7ZXJyfWApO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogUGxhaWRMaW5raW5nRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHVzZWQgdG8gaW5pdGlhdGUgYSBQbGFpZCBIb3N0ZWQgTGlua2luZyBTZXNzaW9uLlxuICAgICAqXG4gICAgICogQHBhcmFtIGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dCBjcmVhdGUgUGxhaWQgbGlua2luZyBzZXNzaW9uIGlucHV0LCB1c2VkIHRvXG4gICAgICogY3JlYXRlIGEgUGxhaWQgTGlua2luZyBIb3N0ZWQgc2Vzc2lvbi5cbiAgICAgKlxuICAgICAqIEByZXR1cm4gYSB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIFBsYWlkTGlua2luZ1Nlc3Npb25SZXNwb25zZX0gcmVwcmVzZW50aW5nIHRoZVxuICAgICAqIFBsYWlkIGxpbmtpbmcgc2Vzc2lvbiByZXNwb25zZSBvYmplY3Qgb2J0YWluZWQgZnJvbSB0aGUgbGlua2luZyBzZXNzaW9uIGNhbGxcbiAgICAgKlxuICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgKi9cbiAgICBhc3luYyBjcmVhdGVQbGFpZExpbmtTZXNzaW9uKGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dDogQ3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0KTogUHJvbWlzZTxQbGFpZExpbmtpbmdTZXNzaW9uUmVzcG9uc2U+IHtcbiAgICAgICAgLy8gZWFzaWx5IGlkZW50aWZpYWJsZSBBUEkgZW5kcG9pbnQgaW5mb3JtYXRpb25cbiAgICAgICAgY29uc3QgZW5kcG9pbnRJbmZvID0gJ1BPU1QgL2xpbmsvdG9rZW4vY3JlYXRlIFBsYWlkIEFQSSc7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBBUEkgS2V5IGFuZCBCYXNlIFVSTCwgbmVlZGVkIGluIG9yZGVyIHRvIG1ha2UgdGhlIGNhcmQgbGlua2luZyBjYWxsIHRocm91Z2ggdGhlIGNsaWVudFxuICAgICAgICAgICAgY29uc3QgW3BsYWlkQmFzZVVSTCwgcGxhaWRDbGllbnRJZCwgcGxhaWRTZWNyZXRLZXldID0gYXdhaXQgc3VwZXIucmV0cmlldmVTZXJ2aWNlQ3JlZGVudGlhbHMoQ29uc3RhbnRzLkFXU1BhaXJDb25zdGFudHMuUExBSURfU0VDUkVUX05BTUUpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgd2Ugb2J0YWluZWQgYW55IGludmFsaWQgc2VjcmV0IHZhbHVlcyBmcm9tIHRoZSBjYWxsIGFib3ZlXG4gICAgICAgICAgICBpZiAocGxhaWRCYXNlVVJMID09PSBudWxsIHx8IHBsYWlkQmFzZVVSTC5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBwbGFpZENsaWVudElkID09PSBudWxsIHx8IHBsYWlkQ2xpZW50SWQubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgcGxhaWRTZWNyZXRLZXkgPT09IG51bGwgfHwgcGxhaWRTZWNyZXRLZXkhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IFwiSW52YWxpZCBTZWNyZXRzIG9idGFpbmVkIGZvciBQbGFpZCBBUEkgY2FsbCFcIjtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogUGxhaWRMaW5raW5nRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGZpbGwgaW4gdGhlIG5lY2Vzc2FyeSBkZXRhaWxzIGluIHRoZSBpbnB1dCBvYmplY3QsIHNvIHdlIGNhbiB0aGVuIHVzZSB0aGVtIGluIHRoZSByZXF1ZXN0IG9iamVjdFxuICAgICAgICAgICAgY3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0LmNsaWVudF9pZCA9IHBsYWlkQ2xpZW50SWQ7XG4gICAgICAgICAgICBjcmVhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQuc2VjcmV0ID0gcGxhaWRTZWNyZXRLZXk7XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogUE9TVCAvbGluay90b2tlbi9jcmVhdGVcbiAgICAgICAgICAgICAqIEBsaW5rIGh0dHBzOi8vcGxhaWQuY29tL2RvY3MvYXBpL3Rva2Vucy8jbGlua3Rva2VuY3JlYXRlXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogYnVpbGQgdGhlIFBsYWlkIEFQSSByZXF1ZXN0IGJvZHkgdG8gYmUgcGFzc2VkIGluLCBhbmQgcGVyZm9ybSBhIFBPU1QgdG8gaXQgd2l0aCB0aGUgYXBwcm9wcmlhdGUgaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAqIHdlIGltcGx5IHRoYXQgaWYgdGhlIEFQSSBkb2VzIG5vdCByZXNwb25kIGluIDE1IHNlY29uZHMsIHRoZW4gd2UgYXV0b21hdGljYWxseSBjYXRjaCB0aGF0LCBhbmQgcmV0dXJuIGFuXG4gICAgICAgICAgICAgKiBlcnJvciBmb3IgYSBiZXR0ZXIgY3VzdG9tZXIgZXhwZXJpZW5jZS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgcmV0dXJuIGF4aW9zLnBvc3QoYCR7cGxhaWRCYXNlVVJMfS9saW5rL3Rva2VuL2NyZWF0ZWAsIHtcbiAgICAgICAgICAgICAgICBjbGllbnRfbmFtZTogY3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0LmNsaWVudF9uYW1lLFxuICAgICAgICAgICAgICAgIGNsaWVudF9pZDogY3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0LmNsaWVudF9pZCxcbiAgICAgICAgICAgICAgICBzZWNyZXQ6IGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC5zZWNyZXQsXG4gICAgICAgICAgICAgICAgdXNlcjogY3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0LnVzZXIsXG4gICAgICAgICAgICAgICAgcHJvZHVjdHM6IGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC5wcm9kdWN0cyxcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbnM6IGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC50cmFuc2FjdGlvbnMsXG4gICAgICAgICAgICAgICAgY291bnRyeV9jb2RlczogY3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0LmNvdW50cnlfY29kZXMsXG4gICAgICAgICAgICAgICAgcmVkaXJlY3RfdXJpOiBjcmVhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQucmVkaXJlY3RfdXJpLFxuICAgICAgICAgICAgICAgIGxhbmd1YWdlOiBjcmVhdGVQbGFpZExpbmtpbmdTZXNzaW9uSW5wdXQubGFuZ3VhZ2UsXG4gICAgICAgICAgICAgICAgd2ViaG9vazogY3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0LndlYmhvb2ssXG4gICAgICAgICAgICAgICAgaG9zdGVkX2xpbms6IGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC5ob3N0ZWRfbGluayxcbiAgICAgICAgICAgICAgICBhY2NvdW50X2ZpbHRlcnM6IGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC5hY2NvdW50X2ZpbHRlcnNcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiAxNTAwMCwgLy8gaW4gbWlsbGlzZWNvbmRzIGhlcmVcbiAgICAgICAgICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlOiAnUGxhaWQgQVBJIHRpbWVkIG91dCBhZnRlciAxNTAwMG1zISdcbiAgICAgICAgICAgIH0pLnRoZW4ocGxhaWRMaW5raW5nU2Vzc2lvblJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiBpZiB3ZSByZWFjaGVkIHRoaXMsIHRoZW4gd2UgYXNzdW1lIHRoYXQgYSAyeHggcmVzcG9uc2UgY29kZSB3YXMgcmV0dXJuZWQuXG4gICAgICAgICAgICAgICAgICogY2hlY2sgdGhlIGNvbnRlbnRzIG9mIHRoZSByZXNwb25zZSwgYW5kIGFjdCBhcHByb3ByaWF0ZWx5LlxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGlmIChwbGFpZExpbmtpbmdTZXNzaW9uUmVzcG9uc2UuZGF0YSAhPT0gdW5kZWZpbmVkICYmIHBsYWlkTGlua2luZ1Nlc3Npb25SZXNwb25zZS5kYXRhW1wiZXhwaXJhdGlvblwiXSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgICAgICAgICAgIHBsYWlkTGlua2luZ1Nlc3Npb25SZXNwb25zZS5kYXRhW1wiaG9zdGVkX2xpbmtfdXJsXCJdICE9PSB1bmRlZmluZWQgJiYgcGxhaWRMaW5raW5nU2Vzc2lvblJlc3BvbnNlLmRhdGFbXCJsaW5rX3Rva2VuXCJdICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgcGxhaWRMaW5raW5nU2Vzc2lvblJlc3BvbnNlLmRhdGFbXCJyZXF1ZXN0X2lkXCJdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogY3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0LnVzZXIuY2xpZW50X3VzZXJfaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiBEYXRlLnBhcnNlKGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC5jcmVhdGVkQXQhKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC5jcmVhdGVkQXQhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRBdDogY3JlYXRlUGxhaWRMaW5raW5nU2Vzc2lvbklucHV0LmNyZWF0ZWRBdCEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwaXJhdGlvbjogcGxhaWRMaW5raW5nU2Vzc2lvblJlc3BvbnNlLmRhdGFbXCJleHBpcmF0aW9uXCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhvc3RlZF9saW5rX3VybDogcGxhaWRMaW5raW5nU2Vzc2lvblJlc3BvbnNlLmRhdGFbXCJob3N0ZWRfbGlua191cmxcIl0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlua190b2tlbjogcGxhaWRMaW5raW5nU2Vzc2lvblJlc3BvbnNlLmRhdGFbXCJsaW5rX3Rva2VuXCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVlc3RfaWQ6IHBsYWlkTGlua2luZ1Nlc3Npb25SZXNwb25zZS5kYXRhW1wicmVxdWVzdF9pZFwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IGNyZWF0ZVBsYWlkTGlua2luZ1Nlc3Npb25JbnB1dC5zdGF0dXMhXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgSW52YWxpZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UhYCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogUGxhaWRMaW5raW5nRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvclxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvci5yZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYW5kIHRoZSBzZXJ2ZXIgcmVzcG9uZGVkIHdpdGggYSBzdGF0dXMgY29kZVxuICAgICAgICAgICAgICAgICAgICAgKiB0aGF0IGZhbGxzIG91dCBvZiB0aGUgcmFuZ2Ugb2YgMnh4LlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vbiAyeHh4IHJlc3BvbnNlIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBQbGFpZCBBUEksIHdpdGggc3RhdHVzICR7ZXJyb3IucmVzcG9uc2Uuc3RhdHVzfSwgYW5kIHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZXJyb3IucmVzcG9uc2UuZGF0YSl9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFBsYWlkTGlua2luZ0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVycm9yLnJlcXVlc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGJ1dCBubyByZXNwb25zZSB3YXMgcmVjZWl2ZWRcbiAgICAgICAgICAgICAgICAgICAgICogYGVycm9yLnJlcXVlc3RgIGlzIGFuIGluc3RhbmNlIG9mIFhNTEh0dHBSZXF1ZXN0IGluIHRoZSBicm93c2VyIGFuZCBhbiBpbnN0YW5jZSBvZlxuICAgICAgICAgICAgICAgICAgICAgKiAgaHR0cC5DbGllbnRSZXF1ZXN0IGluIG5vZGUuanMuXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm8gcmVzcG9uc2UgcmVjZWl2ZWQgd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IFBsYWlkIEFQSSwgZm9yIHJlcXVlc3QgJHtlcnJvci5yZXF1ZXN0fWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBQbGFpZExpbmtpbmdFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU29tZXRoaW5nIGhhcHBlbmVkIGluIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgdGhhdCB0cmlnZ2VyZWQgYW4gRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgc2V0dGluZyB1cCB0aGUgcmVxdWVzdCBmb3IgdGhlICR7ZW5kcG9pbnRJbmZvfSBQbGFpZCBBUEksICR7KGVycm9yICYmIGVycm9yLm1lc3NhZ2UpICYmIGVycm9yLm1lc3NhZ2V9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFBsYWlkTGlua2luZ0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBpbml0aWF0aW5nIHRoZSBQbGFpZCBsaW5raW5nIHNlc3Npb24gdGhyb3VnaCAke2VuZHBvaW50SW5mb31gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfSAke2Vycn1gKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFBsYWlkTGlua2luZ0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbn1cbiJdfQ==