import {BaseAPIClient} from "./BaseAPIClient";
import {
    CreatePlaidLinkingSessionInput, InstitutionResponse,
    PlaidAuthResponse,
    PlaidLinkingAccountSubtype,
    PlaidLinkingAccountType,
    PlaidLinkingErrorType,
    PlaidLinkingSessionResponse,
    TokenExchangeResponse
} from "../GraphqlExports";
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
     * Function used to retrieve the Plaid Item Auth details, given an access_token.
     *
     * @param accessToken access_token used to retrieve the PLaid Auth Item for.
     *
     * @return a {@link Promise} of {@link PlaidAuthResponse} representing the
     * Plaid Item Auth response obtained, or an error, as applicable.
     */
    async getPlaidAuth(accessToken: String): Promise<PlaidAuthResponse> {
        // easily identifiable API endpoint information
        const endpointInfo = 'POST /auth/get Plaid API';

        try {
            // retrieve the API Key and Base URL, needed in order to make the token exchange call through the client
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

            /**
             * POST /auth/get
             * @link https://plaid.com/docs/api/products/auth/#authget
             *
             * build the Plaid API request body to be passed in, and perform a POST to it with the appropriate information
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            return axios.post(`${plaidBaseURL}/auth/get`, {
                client_id: plaidClientId,
                secret: plaidSecretKey,
                access_token: accessToken
            }, {
                headers: {
                    "Content-Type": "application/json"
                },
                timeout: 15000, // in milliseconds here
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
                    let validAccount: boolean = false;
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
                            account["type"] !== undefined && account["subtype"].toLowerCase() === PlaidLinkingAccountSubtype.Checking.toLowerCase() &&
                            account["type"].toLowerCase() === PlaidLinkingAccountType.Depository.toLowerCase()) {
                            // for that particular account, loop through the ACH numbers, and see if we have valid numbers
                            plaidItemAuthResponse.data["numbers"]["ach"].forEach(ach => {
                                if (ach["account_id"] !== undefined && ach["account_id"] === account["account_id"] &&
                                    ach["account"] !== undefined && ach["routing"] !== undefined && ach["wire_routing"] !== undefined) {
                                    // set the target counters and flag accordingly
                                    validAccount = true;
                                    accountCountTarget = accountCount;
                                    achAccountCountTarget = achAccountCount;
                                } else {
                                    validAccount = false;
                                }
                                achAccountCount += 1;
                            })
                        }
                        accountCount += 1;
                    })
                    // if there's no valid account and ACH numbers associated with that account, then return an error
                    if (!validAccount) {
                        return {
                            errorMessage: `Invalid account response structure returned from ${endpointInfo} response!`,
                            errorType: PlaidLinkingErrorType.ValidationError
                        }
                    } else {
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
                                    subtype: PlaidLinkingAccountSubtype.Checking,
                                    type: PlaidLinkingAccountType.Depository,
                                    wire_routing: plaidItemAuthResponse.data["numbers"]["ach"][achAccountCountTarget]["wire_routing"]
                                }]
                            }
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
            const errorMessage = `Unexpected error while initiating the Plaid Item Auth retrieval through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);

            return {
                errorMessage: errorMessage,
                errorType: PlaidLinkingErrorType.UnexpectedError
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
    async getInstitutionById(institutionId: String): Promise<InstitutionResponse> {
        // easily identifiable API endpoint information
        const endpointInfo = 'POST /institutions/get_by_id Plaid API';

        try {
            // retrieve the API Key and Base URL, needed in order to make the token exchange call through the client
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

            /**
             * POST /institutions/get_by_id
             * @link https://plaid.com/docs/api/institutions/#institutionsget_by_id
             *
             * build the Plaid API request body to be passed in, and perform a POST to it with the appropriate information
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            return axios.post(`${plaidBaseURL}/institutions/get_by_id`, {
                client_id: plaidClientId,
                secret: plaidSecretKey,
                country_codes: ["US"],
                institution_id: institutionId
            }, {
                headers: {
                    "Content-Type": "application/json"
                },
                timeout: 15000, // in milliseconds here
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
            const errorMessage = `Unexpected error while retrieving the Plaid Institution details through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);

            return {
                errorMessage: errorMessage,
                errorType: PlaidLinkingErrorType.UnexpectedError
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
    async exchangePlaidToken(publicToken: String): Promise<TokenExchangeResponse> {
        // easily identifiable API endpoint information
        const endpointInfo = 'POST /item/public_token/exchange Plaid API';

        try {
            // retrieve the API Key and Base URL, needed in order to make the token exchange call through the client
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

            /**
             * POST /item/public_token/exchange
             * @link https://plaid.com/docs/api/tokens/#itempublic_tokenexchange
             *
             * build the Plaid API request body to be passed in, and perform a POST to it with the appropriate information
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            return axios.post(`${plaidBaseURL}/item/public_token/exchange`, {
                client_id: plaidClientId,
                secret: plaidSecretKey,
                public_token: publicToken
            }, {
                headers: {
                    "Content-Type": "application/json"
                },
                timeout: 15000, // in milliseconds here
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
            const errorMessage = `Unexpected error while initiating the Plaid token exchange through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);

            return {
                errorMessage: errorMessage,
                errorType: PlaidLinkingErrorType.UnexpectedError
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
                hosted_link: createPlaidLinkingSessionInput.hosted_link,
                account_filters: createPlaidLinkingSessionInput.account_filters
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
                            request_id: plaidLinkingSessionResponse.data["request_id"],
                            status: createPlaidLinkingSessionInput.status!
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
