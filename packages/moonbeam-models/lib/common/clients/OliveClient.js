"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OliveClient = void 0;
const GraphqlExports_1 = require("../GraphqlExports");
const BaseAPIClient_1 = require("./BaseAPIClient");
const Constants_1 = require("../Constants");
const axios_1 = __importDefault(require("axios"));
/**
 * Class used as the base/generic client for all Olive card linking related calls.
 */
class OliveClient extends BaseAPIClient_1.BaseAPIClient {
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
     * Function used to complete the linking of an individual's card on the platform.
     *
     * @param userId unique user ID of a card linking user.
     * @param createdAt card linked object creation date
     * @param updatedAt card linked object update date
     * @param card card information to be used during the enrollment/linking process
     *
     * @return a {@link Promise} of {@link CardLinkResponse} representing the
     * card link response object obtained from the linking call
     */
    async link(userId, createdAt, updatedAt, card) {
        // easily identifiable API endpoint information
        const endpointInfo = 'POST /members/signup Olive API';
        try {
            // retrieve the API Key and Base URL, needed in order to make the card linking call through the client
            const [oliveBaseURL, olivePublicKey, olivePrivateKey] = await super.retrieveServiceCredentials(Constants_1.Constants.AWSPairConstants.OLIVE_SECRET_NAME);
            // check to see if we obtained any invalid secret values from the call above
            if (oliveBaseURL === null || oliveBaseURL.length === 0 ||
                olivePublicKey === null || olivePublicKey.length === 0 ||
                olivePrivateKey === null || olivePrivateKey.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Olive API call!";
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: GraphqlExports_1.CardLinkErrorType.UnexpectedError
                };
            }
            /**
             * POST /members/signup
             * @link https://developer.oliveltd.com/docs/2-enroll-your-customer-in-olive-programs
             *
             * build the Olive API request body to be passed in, and perform a POST to it with the appropriate information
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            const requestData = {
                cardToken: card.token,
                nickname: card.name,
                member: {
                    tcAcceptedDate: createdAt,
                    referenceAppId: card.applicationID,
                    extMemberId: userId,
                    cashbackProgram: true,
                    roundingProgram: false
                },
                ...(card.additionalProgramID && card.additionalProgramID.length !== 0 && {
                    loyaltyProgramId: card.additionalProgramID
                })
            };
            console.log(`Olive API request Object: ${JSON.stringify(requestData)}`);
            return axios_1.default.post(`${oliveBaseURL}/members/signup`, requestData, {
                headers: {
                    "Content-Type": "application/json",
                    "Olive-Key": olivePrivateKey
                },
                timeout: 15000,
                timeoutErrorMessage: 'Olive API timed out after 15000ms!'
            }).then(cardLinkedResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(cardLinkedResponse.data)}`);
                /**
                 * if we reached this, then we assume that a 2xx response code was returned.
                 * check the contents of the response, and act appropriately.
                 */
                if (cardLinkedResponse.data !== undefined && cardLinkedResponse.data["member"] !== undefined &&
                    cardLinkedResponse.data["member"]["id"] !== undefined && cardLinkedResponse.data["card"] !== undefined &&
                    cardLinkedResponse.data["card"]["id"] !== undefined && cardLinkedResponse.data["card"] !== undefined &&
                    cardLinkedResponse.data["card"]["last4Digits"] !== undefined) {
                    // match the last 4 from the request. Always go by the /members/signup last 4 in case they don't match
                    if (cardLinkedResponse.data["card"]["last4Digits"] !== card.last4) {
                        card.last4 = cardLinkedResponse.data["card"]["last4Digits"];
                    }
                    return {
                        data: {
                            id: userId,
                            memberId: cardLinkedResponse.data["member"]["id"],
                            createdAt: createdAt,
                            updatedAt: updatedAt,
                            cards: [{
                                    ...card,
                                    id: cardLinkedResponse.data["card"]["id"]
                                }],
                            // whenever we create a new member, then we automatically put the card linking object in a Linked status
                            status: GraphqlExports_1.CardLinkingStatus.Linked
                        }
                    };
                }
                else {
                    return {
                        errorMessage: `Invalid response structure returned from ${endpointInfo} response!`,
                        errorType: GraphqlExports_1.CardLinkErrorType.ValidationError
                    };
                }
            }).catch(error => {
                if (error.response) {
                    /**
                     * The request was made and the server responded with a status code
                     * that falls out of the range of 2xx.
                     */
                    const errorMessage = `Non 2xxx response while calling the ${endpointInfo} Olive API, with status ${error.response.status}, and response ${JSON.stringify(error.response.data)}`;
                    console.log(errorMessage);
                    // filter based on the type of incoming error
                    const incomingErrorResponse = error.response.data;
                    // unknown scheme
                    if (incomingErrorResponse && !incomingErrorResponse.success && incomingErrorResponse.messages.includes("Scheme unknown not supported.")) {
                        return {
                            errorMessage: `Unsupported card scheme.`,
                            errorType: GraphqlExports_1.CardLinkErrorType.InvalidCardScheme
                        };
                    }
                    // any other specific errors to be filtered below
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.CardLinkErrorType.UnexpectedError
                    };
                }
                else if (error.request) {
                    /**
                     * The request was made but no response was received
                     * `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                     *  http.ClientRequest in node.js.
                     */
                    const errorMessage = `No response received while calling the ${endpointInfo} Olive API, for request ${error.request}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.CardLinkErrorType.UnexpectedError
                    };
                }
                else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Olive API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.CardLinkErrorType.UnexpectedError
                    };
                }
            });
        }
        catch (err) {
            const errorMessage = `Unexpected error while initiating card linking through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                errorMessage: errorMessage,
                errorType: GraphqlExports_1.CardLinkErrorType.UnexpectedError
            };
        }
    }
    /**
     * Function used to add a new card to an existing member.
     *
     * @param userId unique user ID of a card linking user.
     * @param memberId member id, retrieved from Olive, which the card will be added to
     * @param createdAt card linked object creation date
     * @param updatedAt card linked object update date
     * @param card card information to be used in adding a new card to a member
     *
     * @return a {@link Promise} of {@link CardLinkResponse} representing the
     * card link response object obtained from the add card call
     */
    async addCard(userId, memberId, createdAt, updatedAt, card) {
        // easily identifiable API endpoint information
        const endpointInfo = 'POST /cards Olive API';
        try {
            // retrieve the API Key and Base URL, needed in order to make the POST add card through the client
            const [oliveBaseURL, olivePublicKey, olivePrivateKey] = await super.retrieveServiceCredentials(Constants_1.Constants.AWSPairConstants.OLIVE_SECRET_NAME);
            // check to see if we obtained any invalid secret values from the call above
            if (oliveBaseURL === null || oliveBaseURL.length === 0 ||
                olivePublicKey === null || olivePublicKey.length === 0 ||
                olivePrivateKey === null || olivePrivateKey.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Olive API call!";
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: GraphqlExports_1.CardLinkErrorType.UnexpectedError
                };
            }
            /**
             * POST /cards
             * @link https://developer.oliveltd.com/docs/2-enroll-your-customer-in-olive-programs
             *
             * build the Olive API request body to be passed in, and perform a POST to it with the appropriate information
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            const requestData = {
                memberId: memberId,
                nickname: card.name,
                cardToken: card.token
            };
            console.log(`Olive API request Object: ${JSON.stringify(requestData)}`);
            return axios_1.default.post(`${oliveBaseURL}/cards`, requestData, {
                headers: {
                    "Content-Type": "application/json",
                    "Olive-Key": olivePrivateKey
                },
                timeout: 15000,
                timeoutErrorMessage: 'Olive API timed out after 15000ms!'
            }).then(addCardResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(addCardResponse.data)}`);
                /**
                 * if we reached this, then we assume that a 2xx response code was returned.
                 * check the contents of the response, and act appropriately.
                 */
                if (addCardResponse.data !== undefined && addCardResponse.data["memberId"] !== undefined &&
                    addCardResponse.data["id"] !== undefined && addCardResponse.data["last4Digits"] !== undefined) {
                    // match the last 4 from the request. Always go by the /cards last 4 in case they don't match
                    if (addCardResponse.data["last4Digits"] !== card.last4) {
                        card.last4 = addCardResponse.data["last4Digits"];
                    }
                    return {
                        data: {
                            id: userId,
                            memberId: addCardResponse.data["memberId"],
                            createdAt: createdAt,
                            updatedAt: updatedAt,
                            cards: [{
                                    ...card,
                                    id: addCardResponse.data["id"]
                                }],
                            // whenever add a card to an existing member, then we automatically put the card linking object in a Linked status
                            status: GraphqlExports_1.CardLinkingStatus.Linked
                        }
                    };
                }
                else {
                    return {
                        errorMessage: `Invalid response structure returned from ${endpointInfo} response!`,
                        errorType: GraphqlExports_1.CardLinkErrorType.ValidationError
                    };
                }
            }).catch(error => {
                if (error.response) {
                    /**
                     * The request was made and the server responded with a status code
                     * that falls out of the range of 2xx.
                     */
                    const errorMessage = `Non 2xxx response while calling the ${endpointInfo} Olive API, with status ${error.response.status}, and response ${JSON.stringify(error.response.data)}`;
                    console.log(errorMessage);
                    // filter based on the type of incoming error
                    const incomingErrorResponse = error.response.data;
                    // unknown scheme
                    if (incomingErrorResponse && !incomingErrorResponse.success && incomingErrorResponse.messages.includes("Scheme unknown not supported.")) {
                        return {
                            errorMessage: `Unsupported card scheme.`,
                            errorType: GraphqlExports_1.CardLinkErrorType.InvalidCardScheme
                        };
                    }
                    // any other specific errors to be filtered below
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.CardLinkErrorType.UnexpectedError
                    };
                }
                else if (error.request) {
                    /**
                     * The request was made but no response was received
                     * `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                     *  http.ClientRequest in node.js.
                     */
                    const errorMessage = `No response received while calling the ${endpointInfo} Olive API, for request ${error.request}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.CardLinkErrorType.UnexpectedError
                    };
                }
                else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Olive API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.CardLinkErrorType.UnexpectedError
                    };
                }
            });
        }
        catch (err) {
            const errorMessage = `Unexpected error while initiating the card addition through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                errorMessage: errorMessage,
                errorType: GraphqlExports_1.CardLinkErrorType.UnexpectedError
            };
        }
    }
    /**
     * Function used to update a member's status, to either active or inactive.
     *
     * @param userId unique user ID of a card linking user.
     * @param memberId member id, retrieved from Olive, which the status will be updated for
     * @param memberFlag flag to indicate what the status of the member, will be updated to
     * @param updatedAt card linked object update date
     *
     * @return a {@link Promise} of {@link MemberResponse} representing the
     * member's contents after the update is performed
     */
    async updateMemberStatus(userId, memberId, memberFlag, updatedAt) {
        // easily identifiable API endpoint information
        const endpointInfo = 'POST /members/{id} Olive API';
        try {
            // retrieve the API Key and Base URL, needed in order to make the PUT member update call through the client
            const [oliveBaseURL, olivePublicKey, olivePrivateKey] = await super.retrieveServiceCredentials(Constants_1.Constants.AWSPairConstants.OLIVE_SECRET_NAME);
            // check to see if we obtained any invalid secret values from the call above
            if (oliveBaseURL === null || oliveBaseURL.length === 0 ||
                olivePublicKey === null || olivePublicKey.length === 0 ||
                olivePrivateKey === null || olivePrivateKey.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Olive API call!";
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: GraphqlExports_1.CardLinkErrorType.UnexpectedError
                };
            }
            /**
             * PUT /members/{id}
             * @link https://developer.oliveltd.com/reference/edit-member
             *
             * build the Olive API request body to be passed in, and perform a PUT to it with the appropriate information
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            const requestData = {
                tcAcceptedDate: updatedAt,
                extMemberId: userId,
                // for this call we know for sure that at client initialization time, a member flag will be passed in
                isActive: memberFlag,
                cashbackProgram: true,
                roundingProgram: false
            };
            console.log(`Olive API request Object: ${JSON.stringify(requestData)}`);
            return axios_1.default.put(`${oliveBaseURL}/members/${memberId}`, requestData, {
                headers: {
                    "Content-Type": "application/json",
                    "Olive-Key": olivePrivateKey
                },
                timeout: 15000,
                timeoutErrorMessage: 'Olive API timed out after 15000ms!'
            }).then(updateMemberResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(updateMemberResponse.data)}`);
                /**
                 * if we reached this, then we assume that a 2xx response code was returned.
                 * check the contents of the response, and act appropriately.
                 */
                if (updateMemberResponse.data !== undefined && updateMemberResponse.data["id"] !== undefined &&
                    updateMemberResponse.data["extMemberId"] !== undefined && (updateMemberResponse.data["isActive"] !== null || updateMemberResponse.data["isActive"] !== undefined)) {
                    return {
                        data: {
                            id: updateMemberResponse.data["extMemberId"],
                            memberId: updateMemberResponse.data["id"],
                            isActive: updateMemberResponse.data["isActive"]
                        }
                    };
                }
                else {
                    return {
                        errorMessage: `Invalid response structure returned from ${endpointInfo} response!`,
                        errorType: GraphqlExports_1.CardLinkErrorType.ValidationError
                    };
                }
            }).catch(error => {
                if (error.response) {
                    /**
                     * The request was made and the server responded with a status code
                     *  that falls out of the range of 2xx.
                     */
                    const errorMessage = `Non 2xxx response while calling the ${endpointInfo} Olive API, with status ${error.response.status}, and response ${JSON.stringify(error.response.data)}`;
                    console.log(errorMessage);
                    // any other specific errors to be filtered below
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.CardLinkErrorType.UnexpectedError
                    };
                }
                else if (error.request) {
                    /**
                     * The request was made but no response was received
                     * `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                     *  http.ClientRequest in node.js.
                     */
                    const errorMessage = `No response received while calling the ${endpointInfo} Olive API, for request ${error.request}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.CardLinkErrorType.UnexpectedError
                    };
                }
                else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Olive API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.CardLinkErrorType.UnexpectedError
                    };
                }
            });
        }
        catch (err) {
            const errorMessage = `Unexpected error while initiating member update status through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                errorMessage: errorMessage,
                errorType: GraphqlExports_1.CardLinkErrorType.UnexpectedError
            };
        }
    }
    /**
     * Function used to remove/deactivate a card, given its ID.
     *
     * @param cardId the id of the card to be removed/deleted/deactivated
     *
     * @return a {@link Promise} of {@link RemoveCardResponse} representing the
     * card removal response.
     */
    async removeCard(cardId) {
        // easily identifiable API endpoint information
        const endpointInfo = 'POST /cards/{id}/deactivate Olive API';
        try {
            // retrieve the API Key and Base URL, needed in order to make the POST card deactivate call through the client
            const [oliveBaseURL, olivePublicKey, olivePrivateKey] = await super.retrieveServiceCredentials(Constants_1.Constants.AWSPairConstants.OLIVE_SECRET_NAME);
            // check to see if we obtained any invalid secret values from the call above
            if (oliveBaseURL === null || oliveBaseURL.length === 0 ||
                olivePublicKey === null || olivePublicKey.length === 0 ||
                olivePrivateKey === null || olivePrivateKey.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Olive API call!";
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: GraphqlExports_1.CardLinkErrorType.UnexpectedError
                };
            }
            /**
             * POST /cards/{id}/deactivate
             * @link https://developer.oliveltd.com/reference/delete-card
             *
             * build the Olive API request body to be passed in, and perform a POST to it with the appropriate information
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            return axios_1.default.post(`${oliveBaseURL}/cards/${cardId}/deactivate`, undefined, {
                headers: {
                    "Content-Type": "application/json",
                    "Olive-Key": olivePrivateKey
                },
                timeout: 15000,
                timeoutErrorMessage: 'Olive API timed out after 15000ms!'
            }).then(removeCardResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(removeCardResponse.data)}`);
                /**
                 * if we reached this, then we assume that a 2xx response code was returned.
                 */
                if (removeCardResponse.data === "") {
                    return {
                        data: true
                    };
                }
                else {
                    return {
                        errorMessage: `Invalid response structure returned from ${endpointInfo} response!`,
                        errorType: GraphqlExports_1.CardLinkErrorType.ValidationError
                    };
                }
            }).catch(error => {
                if (error.response) {
                    /**
                     * The request was made and the server responded with a status code
                     * that falls out of the range of 2xx.
                     */
                    const errorMessage = `Non 2xxx response while calling the ${endpointInfo} Olive API, with status ${error.response.status}, and response ${JSON.stringify(error.response.data)}`;
                    console.log(errorMessage);
                    // any other specific errors to be filtered below
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.CardLinkErrorType.UnexpectedError
                    };
                }
                else if (error.request) {
                    /**
                     * The request was made but no response was received
                     * `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                     *  http.ClientRequest in node.js.
                     */
                    const errorMessage = `No response received while calling the ${endpointInfo} Olive API, for request ${error.request}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.CardLinkErrorType.UnexpectedError
                    };
                }
                else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Olive API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.CardLinkErrorType.UnexpectedError
                    };
                }
            });
        }
        catch (err) {
            const errorMessage = `Unexpected error while initiating the card removal through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                errorMessage: errorMessage,
                errorType: GraphqlExports_1.CardLinkErrorType.UnexpectedError
            };
        }
    }
    /**
     * Function used to retrieve the details of a given card, given its corresponding id.
     *
     * @param cardId the id of the card to retrieve the details for
     *
     * @return a {link Promise} of {@link CardDetailsResponse} representing the expiration date of
     * the card to be retrieved.
     */
    async getCardDetails(cardId) {
        // easily identifiable API endpoint information
        const endpointInfo = 'GET /cards/{id} Olive API';
        try {
            // retrieve the API Key and Base URL, needed in order to make the GET card details call through the client
            const [oliveBaseURL, olivePublicKey, olivePrivateKey] = await super.retrieveServiceCredentials(Constants_1.Constants.AWSPairConstants.OLIVE_SECRET_NAME);
            // check to see if we obtained any invalid secret values from the call above
            if (oliveBaseURL === null || oliveBaseURL.length === 0 ||
                olivePublicKey === null || olivePublicKey.length === 0 ||
                olivePrivateKey === null || olivePrivateKey.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Olive API call!";
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: GraphqlExports_1.CardLinkErrorType.UnexpectedError
                };
            }
            /**
             * GET /cards/{id}
             * @link https://developer.oliveltd.com/reference/get-card
             *
             * build the Olive API request body to be passed in, and perform a GET to it with the appropriate information
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            return axios_1.default.get(`${oliveBaseURL}/cards/${cardId}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Olive-Key": olivePrivateKey
                },
                timeout: 15000,
                timeoutErrorMessage: 'Olive API timed out after 15000ms!'
            }).then(cardDetailsResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(cardDetailsResponse.data)}`);
                /**
                 * if we reached this, then we assume that a 2xx response code was returned.
                 * check the contents of the response, and act appropriately.
                 */
                if (cardDetailsResponse.data !== undefined && cardDetailsResponse.data["id"] !== undefined &&
                    cardDetailsResponse.data["expiryMonth"] !== undefined && cardDetailsResponse.data["expiryYear"] !== undefined &&
                    cardDetailsResponse.data["id"] === cardId) {
                    // return the card details from the response (expiration date for now)
                    return {
                        data: `${cardDetailsResponse.data["expiryMonth"]}/${cardDetailsResponse.data["expiryYear"]}`
                    };
                }
                else {
                    return {
                        errorMessage: `Invalid response structure returned from ${endpointInfo} response!`,
                        errorType: GraphqlExports_1.CardLinkErrorType.ValidationError
                    };
                }
            }).catch(error => {
                if (error.response) {
                    /**
                     * The request was made and the server responded with a status code
                     * that falls out of the range of 2xx.
                     */
                    const errorMessage = `Non 2xxx response while calling the ${endpointInfo} Olive API, with status ${error.response.status}, and response ${JSON.stringify(error.response.data)}`;
                    console.log(errorMessage);
                    // any other specific errors to be filtered below
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.CardLinkErrorType.UnexpectedError
                    };
                }
                else if (error.request) {
                    /**
                     * The request was made but no response was received
                     * `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                     *  http.ClientRequest in node.js.
                     */
                    const errorMessage = `No response received while calling the ${endpointInfo} Olive API, for request ${error.request}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.CardLinkErrorType.UnexpectedError
                    };
                }
                else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Olive API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.CardLinkErrorType.UnexpectedError
                    };
                }
            });
        }
        catch (err) {
            const errorMessage = `Unexpected error while initiating the card details retrieval through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                errorMessage: errorMessage,
                errorType: GraphqlExports_1.CardLinkErrorType.UnexpectedError
            };
        }
    }
    /**
     * Function used to retrieve the brand details, given a brand ID.
     *
     * @param transaction the transaction object, populated by the initial details
     * passed in by Olive. This object will be used to set even more information for
     * it, obtained from this brand call.
     *
     * @return a {@link Promise} of {@link TransactionResponse} representing the
     * transaction object, populated with the brand details
     */
    async getBrandDetails(transaction) {
        // easily identifiable API endpoint information
        const endpointInfo = 'GET /brands/{id} Olive API';
        try {
            // retrieve the API Key and Base URL, needed in order to make the GET brand details call through the client
            const [oliveBaseURL, olivePublicKey, olivePrivateKey] = await super.retrieveServiceCredentials(Constants_1.Constants.AWSPairConstants.OLIVE_SECRET_NAME);
            // check to see if we obtained any invalid secret values from the call above
            if (oliveBaseURL === null || oliveBaseURL.length === 0 ||
                olivePublicKey === null || olivePublicKey.length === 0 ||
                olivePrivateKey === null || olivePrivateKey.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Olive API call!";
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: GraphqlExports_1.TransactionsErrorType.UnexpectedError
                };
            }
            /**
             * GET /brands/{id}
             * @link https://developer.oliveltd.com/reference/get-brand
             *
             * build the Olive API request body to be passed in, and perform a GET to it with the appropriate information
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            return axios_1.default.get(`${oliveBaseURL}/brands/${transaction.brandId}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Olive-Key": olivePrivateKey
                },
                timeout: 15000,
                timeoutErrorMessage: 'Olive API timed out after 15000ms!'
            }).then(brandDetailsResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(brandDetailsResponse.data)}`);
                /**
                 * if we reached this, then we assume that a 2xx response code was returned.
                 * check the contents of the response, and act appropriately.
                 */
                if (brandDetailsResponse.data !== undefined && brandDetailsResponse.data["dba"] !== undefined && brandDetailsResponse.data["logoUrl"] !== undefined) {
                    // set the brand details for the transaction object, from the response
                    transaction.transactionBrandName = brandDetailsResponse.data["dba"];
                    transaction.transactionBrandLogoUrl = brandDetailsResponse.data["logoUrl"];
                    transaction.transactionBrandURLAddress = brandDetailsResponse.data["website"] !== undefined ? brandDetailsResponse.data["website"] : 'Not Available';
                    return {
                        data: transaction
                    };
                }
                else {
                    return {
                        errorMessage: `Invalid response structure returned from ${endpointInfo} response!`,
                        errorType: GraphqlExports_1.TransactionsErrorType.ValidationError
                    };
                }
            }).catch(error => {
                if (error.response) {
                    /**
                     * The request was made and the server responded with a status code
                     * that falls out of the range of 2xx.
                     */
                    const errorMessage = `Non 2xxx response while calling the ${endpointInfo} Olive API, with status ${error.response.status}, and response ${JSON.stringify(error.response.data)}`;
                    console.log(errorMessage);
                    // any other specific errors to be filtered below
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.TransactionsErrorType.UnexpectedError
                    };
                }
                else if (error.request) {
                    /**
                     * The request was made but no response was received
                     * `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                     *  http.ClientRequest in node.js.
                     */
                    const errorMessage = `No response received while calling the ${endpointInfo} Olive API, for request ${error.request}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.TransactionsErrorType.UnexpectedError
                    };
                }
                else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Olive API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.TransactionsErrorType.UnexpectedError
                    };
                }
            });
        }
        catch (err) {
            const errorMessage = `Unexpected error while initiating the brand details retrieval through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                errorMessage: errorMessage,
                errorType: GraphqlExports_1.TransactionsErrorType.UnexpectedError
            };
        }
    }
    /**
     * Function used to retrieve the store details, given a store ID.
     *
     * @param transaction the transaction object, populated by the initial details
     * passed in by Olive. This object will be used to set even more information for
     * it, obtained from this brand call.
     *
     * @return a {@link Promise} of {@link TransactionResponse} representing the transaction
     * with the store details obtained, included in it.
     */
    async getStoreDetails(transaction) {
        // easily identifiable API endpoint information
        const endpointInfo = 'GET /stores/{id} Olive API';
        try {
            // retrieve the API Key and Base URL, needed in order to make the GET store details call through the client
            const [oliveBaseURL, olivePublicKey, olivePrivateKey] = await super.retrieveServiceCredentials(Constants_1.Constants.AWSPairConstants.OLIVE_SECRET_NAME);
            // check to see if we obtained any invalid secret values from the call above
            if (oliveBaseURL === null || oliveBaseURL.length === 0 ||
                olivePublicKey === null || olivePublicKey.length === 0 ||
                olivePrivateKey === null || olivePrivateKey.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Olive API call!";
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: GraphqlExports_1.TransactionsErrorType.UnexpectedError
                };
            }
            /**
             * GET /stores/{id}
             * @link https://developer.oliveltd.com/reference/get-store
             *
             * build the Olive API request body to be passed in, and perform a GET to it with the appropriate information
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            return axios_1.default.get(`${oliveBaseURL}/stores/${transaction.storeId}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Olive-Key": olivePrivateKey
                },
                timeout: 15000,
                timeoutErrorMessage: 'Olive API timed out after 15000ms!'
            }).then(storeDetailsResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(storeDetailsResponse.data)}`);
                /**
                 * if we reached this, then we assume that a 2xx response code was returned.
                 * check the contents of the response, and act appropriately.
                 */
                if (storeDetailsResponse.data !== undefined && storeDetailsResponse.data["address1"] !== undefined && storeDetailsResponse.data["city"] !== undefined &&
                    storeDetailsResponse.data["postcode"] !== undefined && storeDetailsResponse.data["state"] !== undefined && storeDetailsResponse.data["countryCode"] !== undefined &&
                    storeDetailsResponse.data["isOnline"] !== undefined) {
                    // set the store details for the transaction object, from the response
                    transaction.transactionIsOnline = storeDetailsResponse.data["isOnline"];
                    transaction.transactionBrandAddress = `${storeDetailsResponse.data["address1"]}, ${storeDetailsResponse.data["city"]}, ${storeDetailsResponse.data["state"]}, ${storeDetailsResponse.data["postcode"]}, ${storeDetailsResponse.data["countryCode"]}`;
                    return {
                        data: transaction
                    };
                }
                else {
                    return {
                        errorMessage: `Invalid response structure returned from ${endpointInfo} response!`,
                        errorType: GraphqlExports_1.TransactionsErrorType.ValidationError
                    };
                }
            }).catch(error => {
                if (error.response) {
                    /**
                     * The request was made and the server responded with a status code
                     * that falls out of the range of 2xx.
                     */
                    const errorMessage = `Non 2xxx response while calling the ${endpointInfo} Olive API, with status ${error.response.status}, and response ${JSON.stringify(error.response.data)}`;
                    console.log(errorMessage);
                    // any other specific errors to be filtered below
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.TransactionsErrorType.UnexpectedError
                    };
                }
                else if (error.request) {
                    /**
                     * The request was made but no response was received
                     * `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                     *  http.ClientRequest in node.js.
                     */
                    const errorMessage = `No response received while calling the ${endpointInfo} Olive API, for request ${error.request}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.TransactionsErrorType.UnexpectedError
                    };
                }
                else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Olive API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.TransactionsErrorType.UnexpectedError
                    };
                }
            });
        }
        catch (err) {
            const errorMessage = `Unexpected error while initiating the store details retrieval through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                errorMessage: errorMessage,
                errorType: GraphqlExports_1.TransactionsErrorType.UnexpectedError
            };
        }
    }
    /**
     * Function used to retrieve the member details, specifically the extMemberId, which is Moonbeam's unique user ID
     * set at creation time, given a member ID.
     *
     * @param memberId member ID obtained from Olive at creation time, used to retrieve the
     * other member details.
     *
     * @return a {@link Promise} of {@link MemberDetailsResponse} representing the member details
     */
    async getMemberDetails(memberId) {
        // easily identifiable API endpoint information
        const endpointInfo = 'GET /members/{id} Olive API';
        try {
            // retrieve the API Key and Base URL, needed in order to make the GET member details call through the client
            const [oliveBaseURL, olivePublicKey, olivePrivateKey] = await super.retrieveServiceCredentials(Constants_1.Constants.AWSPairConstants.OLIVE_SECRET_NAME);
            // check to see if we obtained any invalid secret values from the call above
            if (oliveBaseURL === null || oliveBaseURL.length === 0 ||
                olivePublicKey === null || olivePublicKey.length === 0 ||
                olivePrivateKey === null || olivePrivateKey.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Olive API call!";
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: GraphqlExports_1.TransactionsErrorType.UnexpectedError
                };
            }
            /**
             * GET /members/{id}
             * @link https://developer.oliveltd.com/reference/get-member
             *
             * build the Olive API request body to be passed in, and perform a GET to it with the appropriate information
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            return axios_1.default.get(`${oliveBaseURL}/members/${memberId}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Olive-Key": olivePrivateKey
                },
                timeout: 15000,
                timeoutErrorMessage: 'Olive API timed out after 15000ms!'
            }).then(memberDetailsResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(memberDetailsResponse.data)}`);
                /**
                 * if we reached this, then we assume that a 2xx response code was returned.
                 * check the contents of the response, and act appropriately.
                 */
                if (memberDetailsResponse.data !== undefined && memberDetailsResponse.data["extMemberId"] !== undefined) {
                    // return the external member id (extMemberId)
                    return {
                        data: memberDetailsResponse.data["extMemberId"]
                    };
                }
                else {
                    return {
                        errorMessage: `Invalid response structure returned from ${endpointInfo} response!`,
                        errorType: GraphqlExports_1.TransactionsErrorType.ValidationError
                    };
                }
            }).catch(error => {
                if (error.response) {
                    /**
                     * The request was made and the server responded with a status code
                     * that falls out of the range of 2xx.
                     */
                    const errorMessage = `Non 2xxx response while calling the ${endpointInfo} Olive API, with status ${error.response.status}, and response ${JSON.stringify(error.response.data)}`;
                    console.log(errorMessage);
                    // any other specific errors to be filtered below
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.TransactionsErrorType.UnexpectedError
                    };
                }
                else if (error.request) {
                    /**
                     * The request was made but no response was received
                     * `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                     *  http.ClientRequest in node.js.
                     */
                    const errorMessage = `No response received while calling the ${endpointInfo} Olive API, for request ${error.request}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.TransactionsErrorType.UnexpectedError
                    };
                }
                else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Olive API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.TransactionsErrorType.UnexpectedError
                    };
                }
            });
        }
        catch (err) {
            const errorMessage = `Unexpected error while initiating the member details retrieval through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                errorMessage: errorMessage,
                errorType: GraphqlExports_1.TransactionsErrorType.UnexpectedError
            };
        }
    }
    /**
     * Function used to retrieve the transaction details, given a transaction ID (used for updated
     * transactional events purposes).
     *
     * @param updatedTransactionEvent the updated transaction event object, populated by the
     * initial details passed by Olive in the updated webhook call. This object will be used
     * to set even more information for it, obtained from this transaction details call.
     *
     * @return a {@link Promise} of {@link UpdatedTransactionEventResponse} representing the
     * updated transaction event object, populated with the additional transaction details
     * that we retrieved
     */
    async getUpdatedTransactionDetails(updatedTransactionEvent) {
        // easily identifiable API endpoint information
        const endpointInfo = 'GET /transactions/{id} Olive API';
        try {
            // retrieve the API Key and Base URL, needed in order to make the GET transaction details call through the client
            const [oliveBaseURL, olivePublicKey, olivePrivateKey] = await super.retrieveServiceCredentials(Constants_1.Constants.AWSPairConstants.OLIVE_SECRET_NAME);
            // check to see if we obtained any invalid secret values from the call above
            if (oliveBaseURL === null || oliveBaseURL.length === 0 ||
                olivePublicKey === null || olivePublicKey.length === 0 ||
                olivePrivateKey === null || olivePrivateKey.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Olive API call!";
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: GraphqlExports_1.TransactionsErrorType.UnexpectedError
                };
            }
            /**
             * GET /transactions/{id}
             * @link https://developer.oliveltd.com/reference/show-transaction-details
             *
             * build the Olive API request body to be passed in, and perform a GET to it with the appropriate information
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            return axios_1.default.get(`${oliveBaseURL}/transactions/${updatedTransactionEvent.data.transaction.id}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Olive-Key": olivePrivateKey
                },
                timeout: 15000,
                timeoutErrorMessage: 'Olive API timed out after 15000ms!'
            }).then(transactionDetailsResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(transactionDetailsResponse.data)}`);
                /**
                 * if we reached this, then we assume that a 2xx response code was returned.
                 * check the contents of the response, and act appropriately.
                 */
                if (transactionDetailsResponse.data !== undefined && transactionDetailsResponse.data["storeId"] && transactionDetailsResponse.data["brandId"] &&
                    transactionDetailsResponse.data["loyaltyProgramId"] && transactionDetailsResponse.data["merchantCategoryCode"]) {
                    // set the transaction details for the updated transaction object, from the response, and convert any information accordingly
                    updatedTransactionEvent.data.transaction.storeId = transactionDetailsResponse.data["storeId"];
                    updatedTransactionEvent.data.transaction.brandId = transactionDetailsResponse.data["brandId"];
                    updatedTransactionEvent.data.transaction.loyaltyProgramId = transactionDetailsResponse.data["loyaltyProgramId"];
                    updatedTransactionEvent.data.transaction.roundingRuleId = transactionDetailsResponse.data["roundingRuleId"] !== undefined
                        && transactionDetailsResponse.data["roundingRuleId"] !== null ? transactionDetailsResponse.data["roundingRuleId"] : 'N/A';
                    updatedTransactionEvent.data.transaction.merchantCategoryCode = transactionDetailsResponse.data["merchantCategoryCode"];
                    updatedTransactionEvent.data.transaction.amount = transactionDetailsResponse.data["amount"] !== undefined
                        && transactionDetailsResponse.data["amount"] !== null ? transactionDetailsResponse.data["amount"] : 0;
                    updatedTransactionEvent.data.transaction.roundedAmount = transactionDetailsResponse.data["roundedAmount"] !== undefined
                        && transactionDetailsResponse.data["roundedAmount"] !== null ? transactionDetailsResponse.data["roundedAmount"] : 0;
                    updatedTransactionEvent.data.transaction.matchingAmount = transactionDetailsResponse.data["matchingAmount"] !== undefined
                        && transactionDetailsResponse.data["matchingAmount"] !== null ? transactionDetailsResponse.data["matchingAmount"] : 0;
                    updatedTransactionEvent.data.transaction.created = new Date(Date.now()).toISOString();
                    return {
                        data: updatedTransactionEvent
                    };
                }
                else {
                    const errorMessage = `Invalid response structure returned from ${endpointInfo} response!`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.TransactionsErrorType.ValidationError
                    };
                }
            }).catch(error => {
                if (error.response) {
                    /**
                     * The request was made and the server responded with a status code
                     * that falls out of the range of 2xx.
                     */
                    const errorMessage = `Non 2xxx response while calling the ${endpointInfo} Olive API, with status ${error.response.status}, and response ${JSON.stringify(error.response.data)}`;
                    console.log(errorMessage);
                    // any other specific errors to be filtered below
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.TransactionsErrorType.UnexpectedError
                    };
                }
                else if (error.request) {
                    /**
                     * The request was made but no response was received
                     * `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                     *  http.ClientRequest in node.js.
                     */
                    const errorMessage = `No response received while calling the ${endpointInfo} Olive API, for request ${error.request}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.TransactionsErrorType.UnexpectedError
                    };
                }
                else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Olive API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.TransactionsErrorType.UnexpectedError
                    };
                }
            });
        }
        catch (err) {
            const errorMessage = `Unexpected error while initiating the updated transaction details retrieval through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                errorMessage: errorMessage,
                errorType: GraphqlExports_1.TransactionsErrorType.UnexpectedError
            };
        }
    }
    /**
     * Function used to retrieve the type of offer redemption, obtained from the offer object.
     *
     * @param offerId the id of the offer, used to retrieve the type of redemption for.
     *
     * @return a {@link Promise} of {@link OfferRedemptionTypeResponse} representing the redemption
     * type, obtained from the offer object.
     */
    async getOfferRedemptionType(offerId) {
        // easily identifiable API endpoint information
        const endpointInfo = 'GET /offers/{id} Olive API';
        try {
            // retrieve the API Key and Base URL, needed in order to make the GET offers details call through the client
            const [oliveBaseURL, olivePublicKey, olivePrivateKey] = await super.retrieveServiceCredentials(Constants_1.Constants.AWSPairConstants.OLIVE_SECRET_NAME);
            // check to see if we obtained any invalid secret values from the call above
            if (oliveBaseURL === null || oliveBaseURL.length === 0 ||
                olivePublicKey === null || olivePublicKey.length === 0 ||
                olivePrivateKey === null || olivePrivateKey.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Olive API call!";
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: GraphqlExports_1.TransactionsErrorType.UnexpectedError
                };
            }
            /**
             * GET /offers/{id}
             * @link https://developer.oliveltd.com/reference/get-offer
             *
             * build the Olive API request body to be passed in, and perform a GET to it with the appropriate information
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            return axios_1.default.get(`${oliveBaseURL}/offers/${offerId}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Olive-Key": olivePrivateKey
                },
                timeout: 15000,
                timeoutErrorMessage: 'Olive API timed out after 15000ms!'
            }).then(offerDetailsResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(offerDetailsResponse.data)}`);
                /**
                 * if we reached this, then we assume that a 2xx response code was returned.
                 * check the contents of the response, and act appropriately.
                 */
                if (offerDetailsResponse.data !== undefined && offerDetailsResponse.data["redemptionType"] !== undefined &&
                    offerDetailsResponse.data["redemptionType"] !== null) {
                    // return the offer id, obtained from the transaction details
                    return {
                        data: offerDetailsResponse.data["redemptionType"]
                    };
                }
                else {
                    return {
                        errorMessage: `Invalid response structure returned from ${endpointInfo} response!`,
                        errorType: GraphqlExports_1.TransactionsErrorType.ValidationError
                    };
                }
            }).catch(error => {
                if (error.response) {
                    /**
                     * The request was made and the server responded with a status code
                     * that falls out of the range of 2xx.
                     */
                    const errorMessage = `Non 2xxx response while calling the ${endpointInfo} Olive API, with status ${error.response.status}, and response ${JSON.stringify(error.response.data)}`;
                    console.log(errorMessage);
                    // any other specific errors to be filtered below
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.TransactionsErrorType.UnexpectedError
                    };
                }
                else if (error.request) {
                    /**
                     * The request was made but no response was received
                     * `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                     *  http.ClientRequest in node.js.
                     */
                    const errorMessage = `No response received while calling the ${endpointInfo} Olive API, for request ${error.request}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.TransactionsErrorType.UnexpectedError
                    };
                }
                else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Olive API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.TransactionsErrorType.UnexpectedError
                    };
                }
            });
        }
        catch (err) {
            const errorMessage = `Unexpected error while initiating the offer redemption type retrieval through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                errorMessage: errorMessage,
                errorType: GraphqlExports_1.TransactionsErrorType.UnexpectedError
            };
        }
    }
    /**
     * Function used to retrieve the offer id, obtained from a transaction object, given
     * a transaction identifier (used for transactional purposes).
     *
     * @param transactionId the id of the transaction, used to retrieve the offer id
     * from.
     *
     * @return a {@link Promise} of {@link OfferIdResponse} representing the offer id
     * and/or the redeemed offer id, obtained from the transaction details.
     */
    async getOfferId(transactionId) {
        // easily identifiable API endpoint information
        const endpointInfo = 'GET /transactions/{id} Olive API used for retrieving offer id';
        try {
            // retrieve the API Key and Base URL, needed in order to make the GET transaction details call through the client
            const [oliveBaseURL, olivePublicKey, olivePrivateKey] = await super.retrieveServiceCredentials(Constants_1.Constants.AWSPairConstants.OLIVE_SECRET_NAME);
            // check to see if we obtained any invalid secret values from the call above
            if (oliveBaseURL === null || oliveBaseURL.length === 0 ||
                olivePublicKey === null || olivePublicKey.length === 0 ||
                olivePrivateKey === null || olivePrivateKey.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Olive API call!";
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: GraphqlExports_1.TransactionsErrorType.UnexpectedError
                };
            }
            /**
             * GET /transactions/{id}
             * @link https://developer.oliveltd.com/reference/show-transaction-details
             *
             * build the Olive API request body to be passed in, and perform a GET to it with the appropriate information
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            return axios_1.default.get(`${oliveBaseURL}/transactions/${transactionId}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Olive-Key": olivePrivateKey
                },
                timeout: 15000,
                timeoutErrorMessage: 'Olive API timed out after 15000ms!'
            }).then(transactionDetailsResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(transactionDetailsResponse.data)}`);
                /**
                 * if we reached this, then we assume that a 2xx response code was returned.
                 * check the contents of the response, and act appropriately.
                 */
                if (transactionDetailsResponse.data !== undefined && transactionDetailsResponse.data["redeemedOfferId"] !== undefined &&
                    transactionDetailsResponse.data["redeemedOfferId"] !== null && transactionDetailsResponse.data["reward"] !== undefined &&
                    transactionDetailsResponse.data["reward"] !== null && transactionDetailsResponse.data["reward"]["offerId"] !== undefined &&
                    transactionDetailsResponse.data["reward"]["offerId"] !== null &&
                    transactionDetailsResponse.data["redeemedOfferId"] === transactionDetailsResponse.data["reward"]["offerId"]) {
                    // return the offer id, obtained from the transaction details
                    return {
                        data: transactionDetailsResponse.data["redeemedOfferId"]
                    };
                }
                else {
                    return {
                        errorMessage: `Invalid response structure returned from ${endpointInfo} response!`,
                        errorType: GraphqlExports_1.TransactionsErrorType.ValidationError
                    };
                }
            }).catch(error => {
                if (error.response) {
                    /**
                     * The request was made and the server responded with a status code
                     * that falls out of the range of 2xx.
                     */
                    const errorMessage = `Non 2xxx response while calling the ${endpointInfo} Olive API, with status ${error.response.status}, and response ${JSON.stringify(error.response.data)}`;
                    console.log(errorMessage);
                    // any other specific errors to be filtered below
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.TransactionsErrorType.UnexpectedError
                    };
                }
                else if (error.request) {
                    /**
                     * The request was made but no response was received
                     * `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                     *  http.ClientRequest in node.js.
                     */
                    const errorMessage = `No response received while calling the ${endpointInfo} Olive API, for request ${error.request}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.TransactionsErrorType.UnexpectedError
                    };
                }
                else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Olive API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.TransactionsErrorType.UnexpectedError
                    };
                }
            });
        }
        catch (err) {
            const errorMessage = `Unexpected error while initiating the offer ID retrieval through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                errorMessage: errorMessage,
                errorType: GraphqlExports_1.TransactionsErrorType.UnexpectedError
            };
        }
    }
    /**
     * Function used to retrieve the transaction details, given a transaction ID.
     *
     * @param transaction the transaction object, populated by the initial details
     * passed in by Olive. This object will be used to set even more information for
     * it, obtained from this transaction details call.
     *
     * @return a {@link Promise} of {@link TransactionResponse} representing the
     * transaction object, populated with the additional transaction details that
     * we retrieved.
     */
    async getTransactionDetails(transaction) {
        // easily identifiable API endpoint information
        const endpointInfo = 'GET /transactions/{id} Olive API';
        try {
            // retrieve the API Key and Base URL, needed in order to make the GET transaction details call through the client
            const [oliveBaseURL, olivePublicKey, olivePrivateKey] = await super.retrieveServiceCredentials(Constants_1.Constants.AWSPairConstants.OLIVE_SECRET_NAME);
            // check to see if we obtained any invalid secret values from the call above
            if (oliveBaseURL === null || oliveBaseURL.length === 0 ||
                olivePublicKey === null || olivePublicKey.length === 0 ||
                olivePrivateKey === null || olivePrivateKey.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Olive API call!";
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: GraphqlExports_1.TransactionsErrorType.UnexpectedError
                };
            }
            /**
             * GET /transactions/{id}
             * @link https://developer.oliveltd.com/reference/show-transaction-details
             *
             * build the Olive API request body to be passed in, and perform a GET to it with the appropriate information
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            return axios_1.default.get(`${oliveBaseURL}/transactions/${transaction.transactionId}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Olive-Key": olivePrivateKey
                },
                timeout: 15000,
                timeoutErrorMessage: 'Olive API timed out after 15000ms!'
            }).then(transactionDetailsResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(transactionDetailsResponse.data)}`);
                /**
                 * if we reached this, then we assume that a 2xx response code was returned.
                 * check the contents of the response, and act appropriately.
                 */
                if (transactionDetailsResponse.data !== undefined && transactionDetailsResponse.data["purchaseDateTime"] !== undefined) {
                    // set the transaction details for the transaction object, from the response, and convert any information accordingly
                    transaction.timestamp = Date.parse(new Date(transactionDetailsResponse.data["purchaseDateTime"]).toISOString());
                    return {
                        data: transaction
                    };
                }
                else {
                    return {
                        errorMessage: `Invalid response structure returned from ${endpointInfo} response!`,
                        errorType: GraphqlExports_1.TransactionsErrorType.ValidationError
                    };
                }
            }).catch(error => {
                if (error.response) {
                    /**
                     * The request was made and the server responded with a status code
                     * that falls out of the range of 2xx.
                     */
                    const errorMessage = `Non 2xxx response while calling the ${endpointInfo} Olive API, with status ${error.response.status}, and response ${JSON.stringify(error.response.data)}`;
                    console.log(errorMessage);
                    // any other specific errors to be filtered below
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.TransactionsErrorType.UnexpectedError
                    };
                }
                else if (error.request) {
                    /**
                     * The request was made but no response was received
                     * `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                     *  http.ClientRequest in node.js.
                     */
                    const errorMessage = `No response received while calling the ${endpointInfo} Olive API, for request ${error.request}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.TransactionsErrorType.UnexpectedError
                    };
                }
                else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Olive API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.TransactionsErrorType.UnexpectedError
                    };
                }
            });
        }
        catch (err) {
            const errorMessage = `Unexpected error while initiating the transaction details retrieval through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                errorMessage: errorMessage,
                errorType: GraphqlExports_1.TransactionsErrorType.UnexpectedError
            };
        }
    }
    /**
     * Function used to update a transaction by specifying the amount distributed to the member
     * during a cash-out/reimbursement, given its transaction ID.
     * (used for reimbursements/cash-out purposes).
     *
     * @param transactionId the id of the transaction to be updated
     * @param distributedToMemberAmount the amount distributed to the member during the cash-out/reimbursement
     *
     * @return a {@link Promise} of {@link ReimbursementProcessingResponse} representing a
     * flag indicating whether the reimbursement process can continue or not.
     */
    async updateTransactionStatus(transactionId, distributedToMemberAmount) {
        // easily identifiable API endpoint information
        const endpointInfo = 'PUT transactions/{id}/reward Olive API';
        try {
            // retrieve the API Key and Base URL, needed in order to make the PUT transaction status/amount call through the client
            const [oliveBaseURL, olivePublicKey, olivePrivateKey] = await super.retrieveServiceCredentials(Constants_1.Constants.AWSPairConstants.OLIVE_SECRET_NAME);
            // check to see if we obtained any invalid secret values from the call above
            if (oliveBaseURL === null || oliveBaseURL.length === 0 ||
                olivePublicKey === null || olivePublicKey.length === 0 ||
                olivePrivateKey === null || olivePrivateKey.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Olive API call!";
                console.log(errorMessage);
                return {
                    data: GraphqlExports_1.ReimbursementProcessingStatus.Failed,
                    errorMessage: errorMessage,
                    errorType: GraphqlExports_1.ReimbursementsErrorType.UnexpectedError
                };
            }
            /**
             * PUT transactions/{id}/reward
             * @link https://developer.oliveltd.com/reference/update-reward-status
             *
             * build the Olive API request body to be passed in, and perform a GET to it with the appropriate information
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            const requestData = {
                distributedToMemberAmount: distributedToMemberAmount.toFixed(2)
            };
            console.log(`Olive API request Object: ${JSON.stringify(requestData)}`);
            return axios_1.default.put(`${oliveBaseURL}/transactions/${transactionId}/reward`, requestData, {
                headers: {
                    "Content-Type": "application/json",
                    "Olive-Key": olivePrivateKey
                },
                timeout: 15000,
                timeoutErrorMessage: 'Olive API timed out after 15000ms!'
            }).then(updateRewardStatusResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(updateRewardStatusResponse.data)}`);
                /**
                 * if we reached this, then we assume that a 2xx response code was returned.
                 * for this API, we know that if we return a 204, then the reward status has been updated.
                 */
                if (updateRewardStatusResponse.status === 204) {
                    // return a flag indicating that the reimbursement process may continue accordingly
                    return {
                        data: GraphqlExports_1.ReimbursementProcessingStatus.Success
                    };
                }
                else {
                    return {
                        data: GraphqlExports_1.ReimbursementProcessingStatus.Failed,
                        errorMessage: `Invalid response structure returned from ${endpointInfo} response!`,
                        errorType: GraphqlExports_1.ReimbursementsErrorType.ValidationError
                    };
                }
            }).catch(error => {
                if (error.response) {
                    /**
                     * The request was made and the server responded with a status code
                     * that falls out of the range of 2xx.
                     */
                    const errorMessage = `Non 2xxx response while calling the ${endpointInfo} Olive API, with status ${error.response.status}, and response ${JSON.stringify(error.response.data)}`;
                    console.log(errorMessage);
                    // any other specific errors to be filtered below
                    return {
                        data: GraphqlExports_1.ReimbursementProcessingStatus.Failed,
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.ReimbursementsErrorType.UnexpectedError
                    };
                }
                else if (error.request) {
                    /**
                     * The request was made but no response was received
                     * `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                     *  http.ClientRequest in node.js.
                     */
                    const errorMessage = `No response received while calling the ${endpointInfo} Olive API, for request ${error.request}`;
                    console.log(errorMessage);
                    return {
                        data: GraphqlExports_1.ReimbursementProcessingStatus.Failed,
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.ReimbursementsErrorType.UnexpectedError
                    };
                }
                else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Olive API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);
                    return {
                        data: GraphqlExports_1.ReimbursementProcessingStatus.Failed,
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.ReimbursementsErrorType.UnexpectedError
                    };
                }
            });
        }
        catch (err) {
            const errorMessage = `Unexpected error while initiating the transaction reward status update through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                data: GraphqlExports_1.ReimbursementProcessingStatus.Failed,
                errorMessage: errorMessage,
                errorType: GraphqlExports_1.ReimbursementsErrorType.UnexpectedError
            };
        }
    }
    /**
     * Function used to search an offer, given certain filters to be passed in.
     *
     * @param searchOffersInput the offers input, containing the filtering information
     * used to search any applicable/matching offers.
     *
     * @returns a {@link OffersResponse} representing the matched offers' information.
     */
    async searchOffers(searchOffersInput) {
        // easily identifiable API endpoint information
        const endpointInfo = 'GET /offers Olive API for searching offers';
        try {
            // retrieve the API Key and Base URL, needed in order to make the GET offers call through the client
            const [oliveBaseURL, olivePublicKey, olivePrivateKey, moonbeamDefaultLoyalty, moonbeamFidelisDefaultLoyalty, moonbeamOnlineLoyalty, moonbeamPremierOnlineLoyalty, moonbeamPremierNearbyLoyalty, moonbeamVeteransDayLoyalty, moonbeamClickLoyalty, moonbeamPremierClickLoyalty] = await super.retrieveServiceCredentials(Constants_1.Constants.AWSPairConstants.OLIVE_SECRET_NAME, undefined, undefined, true);
            // check to see if we obtained any invalid secret values from the call above
            if (oliveBaseURL === null || oliveBaseURL.length === 0 ||
                olivePublicKey === null || olivePublicKey.length === 0 ||
                olivePrivateKey === null || olivePrivateKey.length === 0 ||
                moonbeamDefaultLoyalty === null || moonbeamDefaultLoyalty.length === 0 ||
                moonbeamFidelisDefaultLoyalty === null || moonbeamFidelisDefaultLoyalty.length === 0 ||
                moonbeamOnlineLoyalty === null || moonbeamOnlineLoyalty.length === 0 ||
                moonbeamVeteransDayLoyalty === null || moonbeamVeteransDayLoyalty.length === 0 ||
                moonbeamClickLoyalty === null || moonbeamClickLoyalty.length === 0 ||
                moonbeamPremierClickLoyalty === null || moonbeamPremierClickLoyalty.length === 0 ||
                moonbeamPremierOnlineLoyalty === null || moonbeamPremierOnlineLoyalty.length === 0 ||
                moonbeamPremierNearbyLoyalty === null || moonbeamPremierNearbyLoyalty.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Olive API call!";
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: GraphqlExports_1.OffersErrorType.UnexpectedError
                };
            }
            /**
             * GET /offers
             * @link https://developer.oliveltd.com/reference/list-offers
             *
             * build the Olive API request params to be passed in, and perform a GET to it with the appropriate information
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            let requestURL = `${oliveBaseURL}/offers`;
            // the loyalty program id is defaulted to the default loyalty program
            const defaultLoyaltyProgramId = moonbeamDefaultLoyalty;
            // build the search offers URL
            requestURL += `?loyaltyProgramId=${defaultLoyaltyProgramId}&countryCode=US&pageSize=1000&pageNumber=1&offerStates=active&offerStates=scheduled`;
            requestURL += (searchOffersInput.radius && searchOffersInput.radiusLatitude && searchOffersInput.radiusLongitude)
                ? `&radiusLatitude=${searchOffersInput.radiusLatitude}&radiusLongitude=${searchOffersInput.radiusLongitude}&radius=${searchOffersInput.radius}`
                : ``;
            requestURL += `&search=\"${encodeURIComponent(searchOffersInput.searchText)}\"`;
            // log the request URL, since we are doing a lot of filtering, for sanity purposes
            console.log(`Request URL for Olive ${requestURL}`);
            return axios_1.default.get(requestURL, {
                headers: {
                    "Content-Type": "application/json",
                    "Olive-Key": olivePrivateKey
                },
                timeout: 25000,
                timeoutErrorMessage: 'Olive API timed out after 25000ms!'
            }).then(async (getOffersResponse) => {
                /**
                 * if we reached this, then we assume that a 2xx response code was returned.
                 * check the contents of the response, and act appropriately.
                 */
                if (getOffersResponse.data !== undefined && getOffersResponse.data["totalNumberOfPages"] !== undefined &&
                    getOffersResponse.data["totalNumberOfRecords"] !== undefined && getOffersResponse.data["items"] !== undefined) {
                    // return the array of offer items accordingly
                    return {
                        data: {
                            offers: getOffersResponse.data["items"],
                            totalNumberOfPages: getOffersResponse.data["totalNumberOfPages"],
                            totalNumberOfRecords: getOffersResponse.data["totalNumberOfRecords"]
                        }
                    };
                }
                else {
                    return {
                        errorMessage: `Invalid response structure returned from ${endpointInfo} response ${JSON.stringify(getOffersResponse)}!`,
                        errorType: GraphqlExports_1.OffersErrorType.ValidationError
                    };
                }
            }).catch(error => {
                if (error.response) {
                    /**
                     * The request was made and the server responded with a status code
                     * that falls out of the range of 2xx.
                     */
                    const errorMessage = `Non 2xxx response while calling the ${endpointInfo} Olive API, with status ${error.response.status}, and response ${JSON.stringify(error.response.data)}`;
                    console.log(errorMessage);
                    // any other specific errors to be filtered below
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.OffersErrorType.UnexpectedError
                    };
                }
                else if (error.request) {
                    /**
                     * The request was made but no response was received
                     * `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                     *  http.ClientRequest in node.js.
                     */
                    const errorMessage = `No response received while calling the ${endpointInfo} Olive API, for request ${error.request}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.OffersErrorType.UnexpectedError
                    };
                }
                else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Olive API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.OffersErrorType.UnexpectedError
                    };
                }
            });
        }
        catch (err) {
            const errorMessage = `Unexpected error while initiating the offers retrieval through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                errorMessage: errorMessage,
                errorType: GraphqlExports_1.OffersErrorType.UnexpectedError
            };
        }
    }
    /**
     * Function used to get all the offers, given certain filters to be passed in.
     *
     * @param getOffersInput the offers input, containing the filtering information
     * used to retrieve all the applicable/matching offers.
     * @param numberOfRetries this optional param is applied in extreme circumstances,
     * when the number of records returned does not match to the number of records parameter.
     * @param pageNumber this optional param is applied in extreme circumstances,
     * when the number of records returned does not match to the number of records parameter,
     * and we need to decrease the page number forcefully.
     *
     * @returns a {@link OffersResponse} representing the matched offers' information.
     */
    async getOffers(getOffersInput, numberOfRetries, pageNumber) {
        // easily identifiable API endpoint information
        const endpointInfo = 'GET /offers Olive API';
        try {
            // retrieve the API Key and Base URL, needed in order to make the GET offers call through the client
            const [oliveBaseURL, olivePublicKey, olivePrivateKey, moonbeamDefaultLoyalty, moonbeamFidelisDefaultLoyalty, moonbeamOnlineLoyalty, moonbeamPremierOnlineLoyalty, moonbeamPremierNearbyLoyalty, moonbeamVeteransDayLoyalty, moonbeamClickLoyalty, moonbeamPremierClickLoyalty] = await super.retrieveServiceCredentials(Constants_1.Constants.AWSPairConstants.OLIVE_SECRET_NAME, undefined, undefined, true);
            // check to see if we obtained any invalid secret values from the call above
            if (oliveBaseURL === null || oliveBaseURL.length === 0 ||
                olivePublicKey === null || olivePublicKey.length === 0 ||
                olivePrivateKey === null || olivePrivateKey.length === 0 ||
                moonbeamDefaultLoyalty === null || moonbeamDefaultLoyalty.length === 0 ||
                moonbeamFidelisDefaultLoyalty === null || moonbeamFidelisDefaultLoyalty.length === 0 ||
                moonbeamOnlineLoyalty === null || moonbeamOnlineLoyalty.length === 0 ||
                moonbeamVeteransDayLoyalty === null || moonbeamVeteransDayLoyalty.length === 0 ||
                moonbeamClickLoyalty === null || moonbeamClickLoyalty.length === 0 ||
                moonbeamPremierClickLoyalty === null || moonbeamPremierClickLoyalty.length === 0 ||
                moonbeamPremierOnlineLoyalty === null || moonbeamPremierOnlineLoyalty.length === 0 ||
                moonbeamPremierNearbyLoyalty === null || moonbeamPremierNearbyLoyalty.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Olive API call!";
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: GraphqlExports_1.OffersErrorType.UnexpectedError
                };
            }
            /**
             * GET /offers
             * @link https://developer.oliveltd.com/reference/list-offers
             *
             * build the Olive API request params to be passed in, and perform a GET to it with the appropriate information
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            let requestURL = `${oliveBaseURL}/offers`;
            // switch the loyalty program id according to the filter passed in
            let loyaltyProgramId = 'NA';
            switch (getOffersInput.filterType) {
                case GraphqlExports_1.OfferFilter.Fidelis:
                    loyaltyProgramId = moonbeamFidelisDefaultLoyalty;
                    break;
                case GraphqlExports_1.OfferFilter.CategorizedNearby:
                case GraphqlExports_1.OfferFilter.Nearby:
                    loyaltyProgramId = moonbeamDefaultLoyalty;
                    break;
                case GraphqlExports_1.OfferFilter.CategorizedOnline:
                case GraphqlExports_1.OfferFilter.Online:
                    // if the redemption type is click, then we go to the default program for the affiliate networks
                    if (getOffersInput.redemptionType === GraphqlExports_1.RedemptionType.Click) {
                        loyaltyProgramId = moonbeamClickLoyalty;
                    }
                    else {
                        loyaltyProgramId = moonbeamOnlineLoyalty;
                    }
                    break;
                case GraphqlExports_1.OfferFilter.PremierOnline:
                    // if the redemption type is click, then we go to the default program for the affiliate networks
                    if (getOffersInput.redemptionType === GraphqlExports_1.RedemptionType.Click) {
                        loyaltyProgramId = moonbeamPremierClickLoyalty;
                    }
                    else {
                        loyaltyProgramId = moonbeamPremierOnlineLoyalty;
                    }
                    break;
                case GraphqlExports_1.OfferFilter.PremierNearby:
                    loyaltyProgramId = moonbeamPremierNearbyLoyalty;
                    break;
                case GraphqlExports_1.OfferFilter.VeteransDay:
                    loyaltyProgramId = moonbeamVeteransDayLoyalty;
                    break;
                case GraphqlExports_1.OfferFilter.SeasonalOnline:
                case GraphqlExports_1.OfferFilter.SeasonalNearby:
                    loyaltyProgramId =
                        getOffersInput.offerSeasonalType === GraphqlExports_1.OfferSeasonalType.VeteransDay
                            ? moonbeamVeteransDayLoyalty
                            : '';
                    break;
                default:
                    console.log(`Unknown offer filter passed in ${getOffersInput.filterType} resulting in invalid loyalty program id!`);
                    break;
            }
            requestURL += `?loyaltyProgramId=${loyaltyProgramId}`;
            // Olive deprecated the `redemptionType=all` and replaced it with its removal
            requestURL += getOffersInput.redemptionType !== GraphqlExports_1.RedemptionType.All ? `&redemptionType=${getOffersInput.redemptionType}` : ``;
            // Olive wants us to not pass anything for the `availability=all` parameter/filtering
            requestURL += getOffersInput.availability !== GraphqlExports_1.OfferAvailability.All ? `&availability=${getOffersInput.availability}` : ``;
            requestURL += `&countryCode=${getOffersInput.countryCode}&pageSize=${getOffersInput.pageSize}&pageNumber=${pageNumber !== null && pageNumber !== undefined ? pageNumber : getOffersInput.pageNumber}`;
            getOffersInput.offerStates.forEach(state => {
                requestURL += `&offerStates=${state}`;
            });
            requestURL += (getOffersInput.filterType === GraphqlExports_1.OfferFilter.Nearby
                || getOffersInput.filterType === GraphqlExports_1.OfferFilter.PremierNearby
                || getOffersInput.filterType === GraphqlExports_1.OfferFilter.CategorizedNearby
                || getOffersInput.filterType === GraphqlExports_1.OfferFilter.SeasonalNearby)
                ? `&radiusLatitude=${getOffersInput.radiusLatitude}&radiusLongitude=${getOffersInput.radiusLongitude}&radius=${getOffersInput.radius}&radiusIncludeOnlineStores=${getOffersInput.radiusIncludeOnlineStores}`
                : ``;
            requestURL += getOffersInput.brandName
                ? `&brandDba=${encodeURIComponent(getOffersInput.brandName)}`
                : ``;
            requestURL += getOffersInput.offerCategory
                ? `&brandParentCategory=${getOffersInput.offerCategory}`
                : ``;
            // log the request URL, since we are doing a lot of filtering, for sanity purposes
            console.log(`Request URL for Olive ${requestURL}`);
            return axios_1.default.get(requestURL, {
                headers: {
                    "Content-Type": "application/json",
                    "Olive-Key": olivePrivateKey
                },
                timeout: 25000,
                timeoutErrorMessage: 'Olive API timed out after 25000ms!'
            }).then(async (getOffersResponse) => {
                // we don't want to log this in case of success responses, because the offer responses are very long (frugality)
                // console.log(`${endpointInfo} response ${JSON.stringify(getOffersResponse.data)}`);
                /**
                 * if we reached this, then we assume that a 2xx response code was returned.
                 * check the contents of the response, and act appropriately.
                 */
                if (getOffersResponse.data !== undefined && getOffersResponse.data["totalNumberOfPages"] !== undefined &&
                    getOffersResponse.data["totalNumberOfRecords"] !== undefined && getOffersResponse.data["items"] !== undefined) {
                    // if we somehow get an un-matching number of records to records returned, then retry this call at most, twice
                    if (getOffersResponse.data["totalNumberOfRecords"] > 0 && getOffersResponse.data["items"].length === 0) {
                        if (numberOfRetries === undefined || numberOfRetries === 0) {
                            // return the array of offer items accordingly
                            return {
                                data: {
                                    offers: getOffersResponse.data["items"],
                                    totalNumberOfPages: getOffersResponse.data["totalNumberOfPages"],
                                    totalNumberOfRecords: getOffersResponse.data["totalNumberOfRecords"]
                                }
                            };
                        }
                        else {
                            await delay(1000); // delay 1 seconds between calls
                            console.log(`Re-attempting to retrieve offers due to mismatch items/records retrieved!`);
                            return this.getOffers(getOffersInput, numberOfRetries - 1, getOffersInput.pageNumber > 1
                                ? getOffersInput.pageNumber - 1
                                : undefined);
                        }
                    }
                    else {
                        // return the array of offer items accordingly
                        return {
                            data: {
                                offers: getOffersResponse.data["items"],
                                totalNumberOfPages: getOffersResponse.data["totalNumberOfPages"],
                                totalNumberOfRecords: getOffersResponse.data["totalNumberOfRecords"]
                            }
                        };
                    }
                }
                else {
                    return {
                        errorMessage: `Invalid response structure returned from ${endpointInfo} response ${JSON.stringify(getOffersResponse)}!`,
                        errorType: GraphqlExports_1.OffersErrorType.ValidationError
                    };
                }
            }).catch(error => {
                if (error.response) {
                    /**
                     * The request was made and the server responded with a status code
                     * that falls out of the range of 2xx.
                     */
                    const errorMessage = `Non 2xxx response while calling the ${endpointInfo} Olive API, with status ${error.response.status}, and response ${JSON.stringify(error.response.data)}`;
                    console.log(errorMessage);
                    // any other specific errors to be filtered below
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.OffersErrorType.UnexpectedError
                    };
                }
                else if (error.request) {
                    /**
                     * The request was made but no response was received
                     * `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                     *  http.ClientRequest in node.js.
                     */
                    const errorMessage = `No response received while calling the ${endpointInfo} Olive API, for request ${error.request}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.OffersErrorType.UnexpectedError
                    };
                }
                else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Olive API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.OffersErrorType.UnexpectedError
                    };
                }
            });
        }
        catch (err) {
            const errorMessage = `Unexpected error while initiating the offers retrieval through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                errorMessage: errorMessage,
                errorType: GraphqlExports_1.OffersErrorType.UnexpectedError
            };
        }
    }
    /**
     * Function used to retrieve a user's card linking ID, given their Moonbeam
     * internal unique ID.
     *
     * @param getUserCardLinkingIdInput the input object containing the unique Moonbeam
     * internal ID, to be used while retrieving the user's card linking ID.
     *
     * @return a {@link Promise} of {@link GetUserCardLinkingIdResponse} representing the response
     * object, containing the user's card linking id.
     */
    async getUserCardLinkingId(getUserCardLinkingIdInput) {
        // easily identifiable API endpoint information
        const endpointInfo = 'GET /members?extMemberId={id} Olive API';
        try {
            // retrieve the API Key and Base URL, needed in order to make the GET member details call through the client
            const [oliveBaseURL, olivePublicKey, olivePrivateKey] = await super.retrieveServiceCredentials(Constants_1.Constants.AWSPairConstants.OLIVE_SECRET_NAME);
            // check to see if we obtained any invalid secret values from the call above
            if (oliveBaseURL === null || oliveBaseURL.length === 0 ||
                olivePublicKey === null || olivePublicKey.length === 0 ||
                olivePrivateKey === null || olivePrivateKey.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Olive API call!";
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: GraphqlExports_1.CardLinkErrorType.UnexpectedError
                };
            }
            /**
             * GET /members?extMemberId={id}
             * @link https://developer.oliveltd.com/reference/list-members
             *
             * build the Olive API request body to be passed in, and perform a GET to it with the appropriate information
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            return axios_1.default.get(`${oliveBaseURL}/members?extMemberId=${getUserCardLinkingIdInput.id}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Olive-Key": olivePrivateKey
                },
                timeout: 15000,
                timeoutErrorMessage: 'Olive API timed out after 15000ms!'
            }).then(memberDetailsResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(memberDetailsResponse.data)}`);
                /**
                 * if we reached this, then we assume that a 2xx response code was returned.
                 * check the contents of the response, and act appropriately.
                 */
                if (memberDetailsResponse.data !== undefined && memberDetailsResponse.data !== null &&
                    memberDetailsResponse.data["totalNumberOfPages"] !== undefined && memberDetailsResponse.data["totalNumberOfPages"] !== null && memberDetailsResponse.data["totalNumberOfPages"] === 1 &&
                    memberDetailsResponse.data["totalNumberOfRecords"] !== undefined && memberDetailsResponse.data["totalNumberOfRecords"] !== null && memberDetailsResponse.data["totalNumberOfRecords"] === 1 &&
                    memberDetailsResponse.data["items"] !== undefined && memberDetailsResponse.data["items"] !== null && memberDetailsResponse.data["items"].length === 1 &&
                    memberDetailsResponse.data["items"][0]["id"] !== undefined && memberDetailsResponse.data["items"][0]["id"] !== null) {
                    // return the user's card linking id accordingly
                    return {
                        data: memberDetailsResponse.data["items"][0]["id"]
                    };
                }
                else {
                    // if there are no users matching that ID, then we return a do not found error, otherwise we return a validation error
                    if (memberDetailsResponse.data["totalNumberOfPages"] !== undefined && memberDetailsResponse.data["totalNumberOfPages"] !== null && memberDetailsResponse.data["totalNumberOfPages"] === 0 &&
                        memberDetailsResponse.data["totalNumberOfRecords"] !== undefined && memberDetailsResponse.data["totalNumberOfRecords"] !== null && memberDetailsResponse.data["totalNumberOfRecords"] === 0) {
                        return {
                            errorMessage: `Card-Linking user not found for id ${getUserCardLinkingIdInput.id}`,
                            errorType: GraphqlExports_1.CardLinkErrorType.NoneOrAbsent
                        };
                    }
                    else {
                        return {
                            errorMessage: `Invalid response structure returned from ${endpointInfo} response!`,
                            errorType: GraphqlExports_1.CardLinkErrorType.ValidationError
                        };
                    }
                }
            }).catch(error => {
                if (error.response) {
                    /**
                     * The request was made and the server responded with a status code
                     * that falls out of the range of 2xx.
                     */
                    const errorMessage = `Non 2xxx response while calling the ${endpointInfo} Olive API, with status ${error.response.status}, and response ${JSON.stringify(error.response.data)}`;
                    console.log(errorMessage);
                    // any other specific errors to be filtered below
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.CardLinkErrorType.UnexpectedError
                    };
                }
                else if (error.request) {
                    /**
                     * The request was made but no response was received
                     * `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                     *  http.ClientRequest in node.js.
                     */
                    const errorMessage = `No response received while calling the ${endpointInfo} Olive API, for request ${error.request}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.CardLinkErrorType.UnexpectedError
                    };
                }
                else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Olive API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.CardLinkErrorType.UnexpectedError
                    };
                }
            });
        }
        catch (err) {
            const errorMessage = `Unexpected error while initiating the member details retrieval through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                errorMessage: errorMessage,
                errorType: GraphqlExports_1.CardLinkErrorType.UnexpectedError
            };
        }
    }
}
exports.OliveClient = OliveClient;
/**
 * Function used as a delay
 *
 * @param ms number of milliseconds to delay by
 *
 * @returns a {@link Promise}
 */
const delay = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT2xpdmVDbGllbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbW9uL2NsaWVudHMvT2xpdmVDbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsc0RBOEIyQjtBQUMzQixtREFBOEM7QUFDOUMsNENBQXVDO0FBQ3ZDLGtEQUEwQjtBQUUxQjs7R0FFRztBQUNILE1BQWEsV0FBWSxTQUFRLDZCQUFhO0lBRTFDOzs7OztPQUtHO0lBQ0gsWUFBWSxXQUFtQixFQUFFLE1BQWM7UUFDM0MsS0FBSyxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRUQ7Ozs7Ozs7Ozs7T0FVRztJQUNILEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBYyxFQUFFLFNBQWlCLEVBQUUsU0FBaUIsRUFBRSxJQUFVO1FBQ3ZFLCtDQUErQztRQUMvQyxNQUFNLFlBQVksR0FBRyxnQ0FBZ0MsQ0FBQztRQUV0RCxJQUFJO1lBQ0Esc0dBQXNHO1lBQ3RHLE1BQU0sQ0FBQyxZQUFZLEVBQUUsY0FBYyxFQUFFLGVBQWUsQ0FBQyxHQUFHLE1BQU0sS0FBSyxDQUFDLDBCQUEwQixDQUFDLHFCQUFTLENBQUMsZ0JBQWdCLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUU3SSw0RUFBNEU7WUFDNUUsSUFBSSxZQUFZLEtBQUssSUFBSSxJQUFJLFlBQVksQ0FBQyxNQUFNLEtBQUssQ0FBQztnQkFDbEQsY0FBYyxLQUFLLElBQUksSUFBSSxjQUFjLENBQUMsTUFBTSxLQUFLLENBQUM7Z0JBQ3RELGVBQWUsS0FBSyxJQUFJLElBQUksZUFBZ0IsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUMzRCxNQUFNLFlBQVksR0FBRyw4Q0FBOEMsQ0FBQztnQkFDcEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFFMUIsT0FBTztvQkFDSCxZQUFZLEVBQUUsWUFBWTtvQkFDMUIsU0FBUyxFQUFFLGtDQUFp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RyxDQUFDLEVBQVUsRUFBZ0IsRUFBRTtJQUN2QyxPQUFPLElBQUksT0FBTyxDQUFFLE9BQU8sQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBRSxDQUFDO0FBQzdELENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gICAgQ2FyZCxcbiAgICBDYXJkRGV0YWlsc1Jlc3BvbnNlLFxuICAgIENhcmRMaW5rRXJyb3JUeXBlLFxuICAgIENhcmRMaW5raW5nU3RhdHVzLFxuICAgIENhcmRMaW5rUmVzcG9uc2UsXG4gICAgR2V0T2ZmZXJzSW5wdXQsXG4gICAgR2V0VXNlckNhcmRMaW5raW5nSWRJbnB1dCxcbiAgICBHZXRVc2VyQ2FyZExpbmtpbmdJZFJlc3BvbnNlLFxuICAgIE1lbWJlckRldGFpbHNSZXNwb25zZSxcbiAgICBNZW1iZXJSZXNwb25zZSxcbiAgICBPZmZlcixcbiAgICBPZmZlckF2YWlsYWJpbGl0eSxcbiAgICBPZmZlckZpbHRlcixcbiAgICBPZmZlcklkUmVzcG9uc2UsXG4gICAgT2ZmZXJSZWRlbXB0aW9uVHlwZVJlc3BvbnNlLFxuICAgIE9mZmVyU2Vhc29uYWxUeXBlLFxuICAgIE9mZmVyc0Vycm9yVHlwZSxcbiAgICBPZmZlcnNSZXNwb25zZSxcbiAgICBSZWRlbXB0aW9uVHlwZSxcbiAgICBSZWltYnVyc2VtZW50UHJvY2Vzc2luZ1Jlc3BvbnNlLFxuICAgIFJlaW1idXJzZW1lbnRQcm9jZXNzaW5nU3RhdHVzLFxuICAgIFJlaW1idXJzZW1lbnRzRXJyb3JUeXBlLFxuICAgIFJlbW92ZUNhcmRSZXNwb25zZSxcbiAgICBTZWFyY2hPZmZlcnNJbnB1dCxcbiAgICBUcmFuc2FjdGlvbixcbiAgICBUcmFuc2FjdGlvblJlc3BvbnNlLFxuICAgIFRyYW5zYWN0aW9uc0Vycm9yVHlwZSxcbiAgICBVcGRhdGVkVHJhbnNhY3Rpb25FdmVudCxcbiAgICBVcGRhdGVkVHJhbnNhY3Rpb25FdmVudFJlc3BvbnNlLFxufSBmcm9tIFwiLi4vR3JhcGhxbEV4cG9ydHNcIjtcbmltcG9ydCB7QmFzZUFQSUNsaWVudH0gZnJvbSBcIi4vQmFzZUFQSUNsaWVudFwiO1xuaW1wb3J0IHtDb25zdGFudHN9IGZyb20gXCIuLi9Db25zdGFudHNcIjtcbmltcG9ydCBheGlvcyBmcm9tIFwiYXhpb3NcIjtcblxuLyoqXG4gKiBDbGFzcyB1c2VkIGFzIHRoZSBiYXNlL2dlbmVyaWMgY2xpZW50IGZvciBhbGwgT2xpdmUgY2FyZCBsaW5raW5nIHJlbGF0ZWQgY2FsbHMuXG4gKi9cbmV4cG9ydCBjbGFzcyBPbGl2ZUNsaWVudCBleHRlbmRzIEJhc2VBUElDbGllbnQge1xuXG4gICAgLyoqXG4gICAgICogR2VuZXJpYyBjb25zdHJ1Y3RvciBmb3IgdGhlIGNsaWVudC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBlbnZpcm9ubWVudCB0aGUgQVdTIGVudmlyb25tZW50IHBhc3NlZCBpbiBmcm9tIHRoZSBMYW1iZGEgcmVzb2x2ZXIuXG4gICAgICogQHBhcmFtIHJlZ2lvbiB0aGUgQVdTIHJlZ2lvbiBwYXNzZWQgaW4gZnJvbSB0aGUgTGFtYmRhIHJlc29sdmVyLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGVudmlyb25tZW50OiBzdHJpbmcsIHJlZ2lvbjogc3RyaW5nKSB7XG4gICAgICAgIHN1cGVyKHJlZ2lvbiwgZW52aXJvbm1lbnQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHVzZWQgdG8gY29tcGxldGUgdGhlIGxpbmtpbmcgb2YgYW4gaW5kaXZpZHVhbCdzIGNhcmQgb24gdGhlIHBsYXRmb3JtLlxuICAgICAqXG4gICAgICogQHBhcmFtIHVzZXJJZCB1bmlxdWUgdXNlciBJRCBvZiBhIGNhcmQgbGlua2luZyB1c2VyLlxuICAgICAqIEBwYXJhbSBjcmVhdGVkQXQgY2FyZCBsaW5rZWQgb2JqZWN0IGNyZWF0aW9uIGRhdGVcbiAgICAgKiBAcGFyYW0gdXBkYXRlZEF0IGNhcmQgbGlua2VkIG9iamVjdCB1cGRhdGUgZGF0ZVxuICAgICAqIEBwYXJhbSBjYXJkIGNhcmQgaW5mb3JtYXRpb24gdG8gYmUgdXNlZCBkdXJpbmcgdGhlIGVucm9sbG1lbnQvbGlua2luZyBwcm9jZXNzXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIGEge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBDYXJkTGlua1Jlc3BvbnNlfSByZXByZXNlbnRpbmcgdGhlXG4gICAgICogY2FyZCBsaW5rIHJlc3BvbnNlIG9iamVjdCBvYnRhaW5lZCBmcm9tIHRoZSBsaW5raW5nIGNhbGxcbiAgICAgKi9cbiAgICBhc3luYyBsaW5rKHVzZXJJZDogc3RyaW5nLCBjcmVhdGVkQXQ6IHN0cmluZywgdXBkYXRlZEF0OiBzdHJpbmcsIGNhcmQ6IENhcmQpOiBQcm9taXNlPENhcmRMaW5rUmVzcG9uc2U+IHtcbiAgICAgICAgLy8gZWFzaWx5IGlkZW50aWZpYWJsZSBBUEkgZW5kcG9pbnQgaW5mb3JtYXRpb25cbiAgICAgICAgY29uc3QgZW5kcG9pbnRJbmZvID0gJ1BPU1QgL21lbWJlcnMvc2lnbnVwIE9saXZlIEFQSSc7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBBUEkgS2V5IGFuZCBCYXNlIFVSTCwgbmVlZGVkIGluIG9yZGVyIHRvIG1ha2UgdGhlIGNhcmQgbGlua2luZyBjYWxsIHRocm91Z2ggdGhlIGNsaWVudFxuICAgICAgICAgICAgY29uc3QgW29saXZlQmFzZVVSTCwgb2xpdmVQdWJsaWNLZXksIG9saXZlUHJpdmF0ZUtleV0gPSBhd2FpdCBzdXBlci5yZXRyaWV2ZVNlcnZpY2VDcmVkZW50aWFscyhDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5PTElWRV9TRUNSRVRfTkFNRSk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB3ZSBvYnRhaW5lZCBhbnkgaW52YWxpZCBzZWNyZXQgdmFsdWVzIGZyb20gdGhlIGNhbGwgYWJvdmVcbiAgICAgICAgICAgIGlmIChvbGl2ZUJhc2VVUkwgPT09IG51bGwgfHwgb2xpdmVCYXNlVVJMLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG9saXZlUHVibGljS2V5ID09PSBudWxsIHx8IG9saXZlUHVibGljS2V5Lmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG9saXZlUHJpdmF0ZUtleSA9PT0gbnVsbCB8fCBvbGl2ZVByaXZhdGVLZXkhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IFwiSW52YWxpZCBTZWNyZXRzIG9idGFpbmVkIGZvciBPbGl2ZSBBUEkgY2FsbCFcIjtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBQT1NUIC9tZW1iZXJzL3NpZ251cFxuICAgICAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIub2xpdmVsdGQuY29tL2RvY3MvMi1lbnJvbGwteW91ci1jdXN0b21lci1pbi1vbGl2ZS1wcm9ncmFtc1xuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIGJ1aWxkIHRoZSBPbGl2ZSBBUEkgcmVxdWVzdCBib2R5IHRvIGJlIHBhc3NlZCBpbiwgYW5kIHBlcmZvcm0gYSBQT1NUIHRvIGl0IHdpdGggdGhlIGFwcHJvcHJpYXRlIGluZm9ybWF0aW9uXG4gICAgICAgICAgICAgKiB3ZSBpbXBseSB0aGF0IGlmIHRoZSBBUEkgZG9lcyBub3QgcmVzcG9uZCBpbiAxNSBzZWNvbmRzLCB0aGVuIHdlIGF1dG9tYXRpY2FsbHkgY2F0Y2ggdGhhdCwgYW5kIHJldHVybiBhblxuICAgICAgICAgICAgICogZXJyb3IgZm9yIGEgYmV0dGVyIGN1c3RvbWVyIGV4cGVyaWVuY2UuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGNvbnN0IHJlcXVlc3REYXRhID0ge1xuICAgICAgICAgICAgICAgIGNhcmRUb2tlbjogY2FyZC50b2tlbixcbiAgICAgICAgICAgICAgICBuaWNrbmFtZTogY2FyZC5uYW1lLFxuICAgICAgICAgICAgICAgIG1lbWJlcjoge1xuICAgICAgICAgICAgICAgICAgICB0Y0FjY2VwdGVkRGF0ZTogY3JlYXRlZEF0LFxuICAgICAgICAgICAgICAgICAgICByZWZlcmVuY2VBcHBJZDogY2FyZC5hcHBsaWNhdGlvbklELFxuICAgICAgICAgICAgICAgICAgICBleHRNZW1iZXJJZDogdXNlcklkLFxuICAgICAgICAgICAgICAgICAgICBjYXNoYmFja1Byb2dyYW06IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHJvdW5kaW5nUHJvZ3JhbTogZmFsc2VcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIC4uLihjYXJkLmFkZGl0aW9uYWxQcm9ncmFtSUQgJiYgY2FyZC5hZGRpdGlvbmFsUHJvZ3JhbUlELmxlbmd0aCAhPT0gMCAmJiB7XG4gICAgICAgICAgICAgICAgICAgIGxveWFsdHlQcm9ncmFtSWQ6IGNhcmQuYWRkaXRpb25hbFByb2dyYW1JRFxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc29sZS5sb2coYE9saXZlIEFQSSByZXF1ZXN0IE9iamVjdDogJHtKU09OLnN0cmluZ2lmeShyZXF1ZXN0RGF0YSl9YCk7XG4gICAgICAgICAgICByZXR1cm4gYXhpb3MucG9zdChgJHtvbGl2ZUJhc2VVUkx9L21lbWJlcnMvc2lnbnVwYCwgcmVxdWVzdERhdGEsIHtcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgICAgICBcIk9saXZlLUtleVwiOiBvbGl2ZVByaXZhdGVLZXlcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDE1MDAwLCAvLyBpbiBtaWxsaXNlY29uZHMgaGVyZVxuICAgICAgICAgICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2U6ICdPbGl2ZSBBUEkgdGltZWQgb3V0IGFmdGVyIDE1MDAwbXMhJ1xuICAgICAgICAgICAgfSkudGhlbihjYXJkTGlua2VkUmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShjYXJkTGlua2VkUmVzcG9uc2UuZGF0YSl9YCk7XG5cbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiBpZiB3ZSByZWFjaGVkIHRoaXMsIHRoZW4gd2UgYXNzdW1lIHRoYXQgYSAyeHggcmVzcG9uc2UgY29kZSB3YXMgcmV0dXJuZWQuXG4gICAgICAgICAgICAgICAgICogY2hlY2sgdGhlIGNvbnRlbnRzIG9mIHRoZSByZXNwb25zZSwgYW5kIGFjdCBhcHByb3ByaWF0ZWx5LlxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGlmIChjYXJkTGlua2VkUmVzcG9uc2UuZGF0YSAhPT0gdW5kZWZpbmVkICYmIGNhcmRMaW5rZWRSZXNwb25zZS5kYXRhW1wibWVtYmVyXCJdICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgY2FyZExpbmtlZFJlc3BvbnNlLmRhdGFbXCJtZW1iZXJcIl1bXCJpZFwiXSAhPT0gdW5kZWZpbmVkICYmIGNhcmRMaW5rZWRSZXNwb25zZS5kYXRhW1wiY2FyZFwiXSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgICAgICAgICAgIGNhcmRMaW5rZWRSZXNwb25zZS5kYXRhW1wiY2FyZFwiXVtcImlkXCJdICE9PSB1bmRlZmluZWQgJiYgY2FyZExpbmtlZFJlc3BvbnNlLmRhdGFbXCJjYXJkXCJdICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgY2FyZExpbmtlZFJlc3BvbnNlLmRhdGFbXCJjYXJkXCJdW1wibGFzdDREaWdpdHNcIl0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBtYXRjaCB0aGUgbGFzdCA0IGZyb20gdGhlIHJlcXVlc3QuIEFsd2F5cyBnbyBieSB0aGUgL21lbWJlcnMvc2lnbnVwIGxhc3QgNCBpbiBjYXNlIHRoZXkgZG9uJ3QgbWF0Y2hcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNhcmRMaW5rZWRSZXNwb25zZS5kYXRhW1wiY2FyZFwiXVtcImxhc3Q0RGlnaXRzXCJdICE9PSBjYXJkLmxhc3Q0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXJkLmxhc3Q0ID0gY2FyZExpbmtlZFJlc3BvbnNlLmRhdGFbXCJjYXJkXCJdW1wibGFzdDREaWdpdHNcIl07XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB1c2VySWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVtYmVySWQ6IGNhcmRMaW5rZWRSZXNwb25zZS5kYXRhW1wibWVtYmVyXCJdW1wiaWRcIl0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEF0OiBjcmVhdGVkQXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlZEF0OiB1cGRhdGVkQXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FyZHM6IFt7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLmNhcmQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjYXJkTGlua2VkUmVzcG9uc2UuZGF0YVtcImNhcmRcIl1bXCJpZFwiXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1dLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdoZW5ldmVyIHdlIGNyZWF0ZSBhIG5ldyBtZW1iZXIsIHRoZW4gd2UgYXV0b21hdGljYWxseSBwdXQgdGhlIGNhcmQgbGlua2luZyBvYmplY3QgaW4gYSBMaW5rZWQgc3RhdHVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiBDYXJkTGlua2luZ1N0YXR1cy5MaW5rZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBJbnZhbGlkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tICR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSFgLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IucmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGFuZCB0aGUgc2VydmVyIHJlc3BvbmRlZCB3aXRoIGEgc3RhdHVzIGNvZGVcbiAgICAgICAgICAgICAgICAgICAgICogdGhhdCBmYWxscyBvdXQgb2YgdGhlIHJhbmdlIG9mIDJ4eC5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBOb24gMnh4eCByZXNwb25zZSB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gT2xpdmUgQVBJLCB3aXRoIHN0YXR1cyAke2Vycm9yLnJlc3BvbnNlLnN0YXR1c30sIGFuZCByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGVycm9yLnJlc3BvbnNlLmRhdGEpfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gZmlsdGVyIGJhc2VkIG9uIHRoZSB0eXBlIG9mIGluY29taW5nIGVycm9yXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGluY29taW5nRXJyb3JSZXNwb25zZSA9IGVycm9yLnJlc3BvbnNlLmRhdGE7XG4gICAgICAgICAgICAgICAgICAgIC8vIHVua25vd24gc2NoZW1lXG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmNvbWluZ0Vycm9yUmVzcG9uc2UgJiYgIWluY29taW5nRXJyb3JSZXNwb25zZS5zdWNjZXNzICYmIGluY29taW5nRXJyb3JSZXNwb25zZS5tZXNzYWdlcy5pbmNsdWRlcyhcIlNjaGVtZSB1bmtub3duIG5vdCBzdXBwb3J0ZWQuXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogYFVuc3VwcG9ydGVkIGNhcmQgc2NoZW1lLmAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5JbnZhbGlkQ2FyZFNjaGVtZVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gYW55IG90aGVyIHNwZWNpZmljIGVycm9ycyB0byBiZSBmaWx0ZXJlZCBiZWxvd1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3IucmVxdWVzdCkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYnV0IG5vIHJlc3BvbnNlIHdhcyByZWNlaXZlZFxuICAgICAgICAgICAgICAgICAgICAgKiBgZXJyb3IucmVxdWVzdGAgaXMgYW4gaW5zdGFuY2Ugb2YgWE1MSHR0cFJlcXVlc3QgaW4gdGhlIGJyb3dzZXIgYW5kIGFuIGluc3RhbmNlIG9mXG4gICAgICAgICAgICAgICAgICAgICAqICBodHRwLkNsaWVudFJlcXVlc3QgaW4gbm9kZS5qcy5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBObyByZXNwb25zZSByZWNlaXZlZCB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gT2xpdmUgQVBJLCBmb3IgcmVxdWVzdCAke2Vycm9yLnJlcXVlc3R9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNvbWV0aGluZyBoYXBwZW5lZCBpbiBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IHRoYXQgdHJpZ2dlcmVkIGFuIEVycm9yXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgZm9yIHRoZSAke2VuZHBvaW50SW5mb30gT2xpdmUgQVBJLCAkeyhlcnJvciAmJiBlcnJvci5tZXNzYWdlKSAmJiBlcnJvci5tZXNzYWdlfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBpbml0aWF0aW5nIGNhcmQgbGlua2luZyB0aHJvdWdoICR7ZW5kcG9pbnRJbmZvfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9ICR7ZXJyfWApO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdXNlZCB0byBhZGQgYSBuZXcgY2FyZCB0byBhbiBleGlzdGluZyBtZW1iZXIuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gdXNlcklkIHVuaXF1ZSB1c2VyIElEIG9mIGEgY2FyZCBsaW5raW5nIHVzZXIuXG4gICAgICogQHBhcmFtIG1lbWJlcklkIG1lbWJlciBpZCwgcmV0cmlldmVkIGZyb20gT2xpdmUsIHdoaWNoIHRoZSBjYXJkIHdpbGwgYmUgYWRkZWQgdG9cbiAgICAgKiBAcGFyYW0gY3JlYXRlZEF0IGNhcmQgbGlua2VkIG9iamVjdCBjcmVhdGlvbiBkYXRlXG4gICAgICogQHBhcmFtIHVwZGF0ZWRBdCBjYXJkIGxpbmtlZCBvYmplY3QgdXBkYXRlIGRhdGVcbiAgICAgKiBAcGFyYW0gY2FyZCBjYXJkIGluZm9ybWF0aW9uIHRvIGJlIHVzZWQgaW4gYWRkaW5nIGEgbmV3IGNhcmQgdG8gYSBtZW1iZXJcbiAgICAgKlxuICAgICAqIEByZXR1cm4gYSB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIENhcmRMaW5rUmVzcG9uc2V9IHJlcHJlc2VudGluZyB0aGVcbiAgICAgKiBjYXJkIGxpbmsgcmVzcG9uc2Ugb2JqZWN0IG9idGFpbmVkIGZyb20gdGhlIGFkZCBjYXJkIGNhbGxcbiAgICAgKi9cbiAgICBhc3luYyBhZGRDYXJkKHVzZXJJZDogc3RyaW5nLCBtZW1iZXJJZDogc3RyaW5nLCBjcmVhdGVkQXQ6IHN0cmluZywgdXBkYXRlZEF0OiBzdHJpbmcsIGNhcmQ6IENhcmQpOiBQcm9taXNlPENhcmRMaW5rUmVzcG9uc2U+IHtcbiAgICAgICAgLy8gZWFzaWx5IGlkZW50aWZpYWJsZSBBUEkgZW5kcG9pbnQgaW5mb3JtYXRpb25cbiAgICAgICAgY29uc3QgZW5kcG9pbnRJbmZvID0gJ1BPU1QgL2NhcmRzIE9saXZlIEFQSSc7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBBUEkgS2V5IGFuZCBCYXNlIFVSTCwgbmVlZGVkIGluIG9yZGVyIHRvIG1ha2UgdGhlIFBPU1QgYWRkIGNhcmQgdGhyb3VnaCB0aGUgY2xpZW50XG4gICAgICAgICAgICBjb25zdCBbb2xpdmVCYXNlVVJMLCBvbGl2ZVB1YmxpY0tleSwgb2xpdmVQcml2YXRlS2V5XSA9IGF3YWl0IHN1cGVyLnJldHJpZXZlU2VydmljZUNyZWRlbnRpYWxzKENvbnN0YW50cy5BV1NQYWlyQ29uc3RhbnRzLk9MSVZFX1NFQ1JFVF9OQU1FKTtcblxuICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHdlIG9idGFpbmVkIGFueSBpbnZhbGlkIHNlY3JldCB2YWx1ZXMgZnJvbSB0aGUgY2FsbCBhYm92ZVxuICAgICAgICAgICAgaWYgKG9saXZlQmFzZVVSTCA9PT0gbnVsbCB8fCBvbGl2ZUJhc2VVUkwubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgb2xpdmVQdWJsaWNLZXkgPT09IG51bGwgfHwgb2xpdmVQdWJsaWNLZXkubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgb2xpdmVQcml2YXRlS2V5ID09PSBudWxsIHx8IG9saXZlUHJpdmF0ZUtleSEubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gXCJJbnZhbGlkIFNlY3JldHMgb2J0YWluZWQgZm9yIE9saXZlIEFQSSBjYWxsIVwiO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFBPU1QgL2NhcmRzXG4gICAgICAgICAgICAgKiBAbGluayBodHRwczovL2RldmVsb3Blci5vbGl2ZWx0ZC5jb20vZG9jcy8yLWVucm9sbC15b3VyLWN1c3RvbWVyLWluLW9saXZlLXByb2dyYW1zXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogYnVpbGQgdGhlIE9saXZlIEFQSSByZXF1ZXN0IGJvZHkgdG8gYmUgcGFzc2VkIGluLCBhbmQgcGVyZm9ybSBhIFBPU1QgdG8gaXQgd2l0aCB0aGUgYXBwcm9wcmlhdGUgaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAqIHdlIGltcGx5IHRoYXQgaWYgdGhlIEFQSSBkb2VzIG5vdCByZXNwb25kIGluIDE1IHNlY29uZHMsIHRoZW4gd2UgYXV0b21hdGljYWxseSBjYXRjaCB0aGF0LCBhbmQgcmV0dXJuIGFuXG4gICAgICAgICAgICAgKiBlcnJvciBmb3IgYSBiZXR0ZXIgY3VzdG9tZXIgZXhwZXJpZW5jZS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgY29uc3QgcmVxdWVzdERhdGEgPSB7XG4gICAgICAgICAgICAgICAgbWVtYmVySWQ6IG1lbWJlcklkLFxuICAgICAgICAgICAgICAgIG5pY2tuYW1lOiBjYXJkLm5hbWUsXG4gICAgICAgICAgICAgICAgY2FyZFRva2VuOiBjYXJkLnRva2VuXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc29sZS5sb2coYE9saXZlIEFQSSByZXF1ZXN0IE9iamVjdDogJHtKU09OLnN0cmluZ2lmeShyZXF1ZXN0RGF0YSl9YCk7XG4gICAgICAgICAgICByZXR1cm4gYXhpb3MucG9zdChgJHtvbGl2ZUJhc2VVUkx9L2NhcmRzYCwgcmVxdWVzdERhdGEsIHtcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgICAgICBcIk9saXZlLUtleVwiOiBvbGl2ZVByaXZhdGVLZXlcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDE1MDAwLCAvLyBpbiBtaWxsaXNlY29uZHMgaGVyZVxuICAgICAgICAgICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2U6ICdPbGl2ZSBBUEkgdGltZWQgb3V0IGFmdGVyIDE1MDAwbXMhJ1xuICAgICAgICAgICAgfSkudGhlbihhZGRDYXJkUmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShhZGRDYXJkUmVzcG9uc2UuZGF0YSl9YCk7XG5cbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiBpZiB3ZSByZWFjaGVkIHRoaXMsIHRoZW4gd2UgYXNzdW1lIHRoYXQgYSAyeHggcmVzcG9uc2UgY29kZSB3YXMgcmV0dXJuZWQuXG4gICAgICAgICAgICAgICAgICogY2hlY2sgdGhlIGNvbnRlbnRzIG9mIHRoZSByZXNwb25zZSwgYW5kIGFjdCBhcHByb3ByaWF0ZWx5LlxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGlmIChhZGRDYXJkUmVzcG9uc2UuZGF0YSAhPT0gdW5kZWZpbmVkICYmIGFkZENhcmRSZXNwb25zZS5kYXRhW1wibWVtYmVySWRcIl0gIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgICAgICAgICBhZGRDYXJkUmVzcG9uc2UuZGF0YVtcImlkXCJdICE9PSB1bmRlZmluZWQgJiYgYWRkQ2FyZFJlc3BvbnNlLmRhdGFbXCJsYXN0NERpZ2l0c1wiXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIG1hdGNoIHRoZSBsYXN0IDQgZnJvbSB0aGUgcmVxdWVzdC4gQWx3YXlzIGdvIGJ5IHRoZSAvY2FyZHMgbGFzdCA0IGluIGNhc2UgdGhleSBkb24ndCBtYXRjaFxuICAgICAgICAgICAgICAgICAgICBpZiAoYWRkQ2FyZFJlc3BvbnNlLmRhdGFbXCJsYXN0NERpZ2l0c1wiXSAhPT0gY2FyZC5sYXN0NCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FyZC5sYXN0NCA9IGFkZENhcmRSZXNwb25zZS5kYXRhW1wibGFzdDREaWdpdHNcIl07XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB1c2VySWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVtYmVySWQ6IGFkZENhcmRSZXNwb25zZS5kYXRhW1wibWVtYmVySWRcIl0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEF0OiBjcmVhdGVkQXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlZEF0OiB1cGRhdGVkQXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FyZHM6IFt7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLmNhcmQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBhZGRDYXJkUmVzcG9uc2UuZGF0YVtcImlkXCJdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2hlbmV2ZXIgYWRkIGEgY2FyZCB0byBhbiBleGlzdGluZyBtZW1iZXIsIHRoZW4gd2UgYXV0b21hdGljYWxseSBwdXQgdGhlIGNhcmQgbGlua2luZyBvYmplY3QgaW4gYSBMaW5rZWQgc3RhdHVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiBDYXJkTGlua2luZ1N0YXR1cy5MaW5rZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBJbnZhbGlkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tICR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSFgLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IucmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGFuZCB0aGUgc2VydmVyIHJlc3BvbmRlZCB3aXRoIGEgc3RhdHVzIGNvZGVcbiAgICAgICAgICAgICAgICAgICAgICogdGhhdCBmYWxscyBvdXQgb2YgdGhlIHJhbmdlIG9mIDJ4eC5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBOb24gMnh4eCByZXNwb25zZSB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gT2xpdmUgQVBJLCB3aXRoIHN0YXR1cyAke2Vycm9yLnJlc3BvbnNlLnN0YXR1c30sIGFuZCByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGVycm9yLnJlc3BvbnNlLmRhdGEpfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gZmlsdGVyIGJhc2VkIG9uIHRoZSB0eXBlIG9mIGluY29taW5nIGVycm9yXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGluY29taW5nRXJyb3JSZXNwb25zZSA9IGVycm9yLnJlc3BvbnNlLmRhdGE7XG4gICAgICAgICAgICAgICAgICAgIC8vIHVua25vd24gc2NoZW1lXG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmNvbWluZ0Vycm9yUmVzcG9uc2UgJiYgIWluY29taW5nRXJyb3JSZXNwb25zZS5zdWNjZXNzICYmIGluY29taW5nRXJyb3JSZXNwb25zZS5tZXNzYWdlcy5pbmNsdWRlcyhcIlNjaGVtZSB1bmtub3duIG5vdCBzdXBwb3J0ZWQuXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogYFVuc3VwcG9ydGVkIGNhcmQgc2NoZW1lLmAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5JbnZhbGlkQ2FyZFNjaGVtZVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gYW55IG90aGVyIHNwZWNpZmljIGVycm9ycyB0byBiZSBmaWx0ZXJlZCBiZWxvd1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3IucmVxdWVzdCkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYnV0IG5vIHJlc3BvbnNlIHdhcyByZWNlaXZlZFxuICAgICAgICAgICAgICAgICAgICAgKiBgZXJyb3IucmVxdWVzdGAgaXMgYW4gaW5zdGFuY2Ugb2YgWE1MSHR0cFJlcXVlc3QgaW4gdGhlIGJyb3dzZXIgYW5kIGFuIGluc3RhbmNlIG9mXG4gICAgICAgICAgICAgICAgICAgICAqICBodHRwLkNsaWVudFJlcXVlc3QgaW4gbm9kZS5qcy5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBObyByZXNwb25zZSByZWNlaXZlZCB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gT2xpdmUgQVBJLCBmb3IgcmVxdWVzdCAke2Vycm9yLnJlcXVlc3R9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNvbWV0aGluZyBoYXBwZW5lZCBpbiBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IHRoYXQgdHJpZ2dlcmVkIGFuIEVycm9yXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgZm9yIHRoZSAke2VuZHBvaW50SW5mb30gT2xpdmUgQVBJLCAkeyhlcnJvciAmJiBlcnJvci5tZXNzYWdlKSAmJiBlcnJvci5tZXNzYWdlfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBpbml0aWF0aW5nIHRoZSBjYXJkIGFkZGl0aW9uIHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJ9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB1c2VkIHRvIHVwZGF0ZSBhIG1lbWJlcidzIHN0YXR1cywgdG8gZWl0aGVyIGFjdGl2ZSBvciBpbmFjdGl2ZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB1c2VySWQgdW5pcXVlIHVzZXIgSUQgb2YgYSBjYXJkIGxpbmtpbmcgdXNlci5cbiAgICAgKiBAcGFyYW0gbWVtYmVySWQgbWVtYmVyIGlkLCByZXRyaWV2ZWQgZnJvbSBPbGl2ZSwgd2hpY2ggdGhlIHN0YXR1cyB3aWxsIGJlIHVwZGF0ZWQgZm9yXG4gICAgICogQHBhcmFtIG1lbWJlckZsYWcgZmxhZyB0byBpbmRpY2F0ZSB3aGF0IHRoZSBzdGF0dXMgb2YgdGhlIG1lbWJlciwgd2lsbCBiZSB1cGRhdGVkIHRvXG4gICAgICogQHBhcmFtIHVwZGF0ZWRBdCBjYXJkIGxpbmtlZCBvYmplY3QgdXBkYXRlIGRhdGVcbiAgICAgKlxuICAgICAqIEByZXR1cm4gYSB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIE1lbWJlclJlc3BvbnNlfSByZXByZXNlbnRpbmcgdGhlXG4gICAgICogbWVtYmVyJ3MgY29udGVudHMgYWZ0ZXIgdGhlIHVwZGF0ZSBpcyBwZXJmb3JtZWRcbiAgICAgKi9cbiAgICBhc3luYyB1cGRhdGVNZW1iZXJTdGF0dXModXNlcklkOiBzdHJpbmcsIG1lbWJlcklkOiBzdHJpbmcsIG1lbWJlckZsYWc6IGJvb2xlYW4sIHVwZGF0ZWRBdDogc3RyaW5nKTogUHJvbWlzZTxNZW1iZXJSZXNwb25zZT4ge1xuICAgICAgICAvLyBlYXNpbHkgaWRlbnRpZmlhYmxlIEFQSSBlbmRwb2ludCBpbmZvcm1hdGlvblxuICAgICAgICBjb25zdCBlbmRwb2ludEluZm8gPSAnUE9TVCAvbWVtYmVycy97aWR9IE9saXZlIEFQSSc7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBBUEkgS2V5IGFuZCBCYXNlIFVSTCwgbmVlZGVkIGluIG9yZGVyIHRvIG1ha2UgdGhlIFBVVCBtZW1iZXIgdXBkYXRlIGNhbGwgdGhyb3VnaCB0aGUgY2xpZW50XG4gICAgICAgICAgICBjb25zdCBbb2xpdmVCYXNlVVJMLCBvbGl2ZVB1YmxpY0tleSwgb2xpdmVQcml2YXRlS2V5XSA9IGF3YWl0IHN1cGVyLnJldHJpZXZlU2VydmljZUNyZWRlbnRpYWxzKENvbnN0YW50cy5BV1NQYWlyQ29uc3RhbnRzLk9MSVZFX1NFQ1JFVF9OQU1FKTtcblxuICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHdlIG9idGFpbmVkIGFueSBpbnZhbGlkIHNlY3JldCB2YWx1ZXMgZnJvbSB0aGUgY2FsbCBhYm92ZVxuICAgICAgICAgICAgaWYgKG9saXZlQmFzZVVSTCA9PT0gbnVsbCB8fCBvbGl2ZUJhc2VVUkwubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgb2xpdmVQdWJsaWNLZXkgPT09IG51bGwgfHwgb2xpdmVQdWJsaWNLZXkubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgb2xpdmVQcml2YXRlS2V5ID09PSBudWxsIHx8IG9saXZlUHJpdmF0ZUtleSEubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gXCJJbnZhbGlkIFNlY3JldHMgb2J0YWluZWQgZm9yIE9saXZlIEFQSSBjYWxsIVwiO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFBVVCAvbWVtYmVycy97aWR9XG4gICAgICAgICAgICAgKiBAbGluayBodHRwczovL2RldmVsb3Blci5vbGl2ZWx0ZC5jb20vcmVmZXJlbmNlL2VkaXQtbWVtYmVyXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogYnVpbGQgdGhlIE9saXZlIEFQSSByZXF1ZXN0IGJvZHkgdG8gYmUgcGFzc2VkIGluLCBhbmQgcGVyZm9ybSBhIFBVVCB0byBpdCB3aXRoIHRoZSBhcHByb3ByaWF0ZSBpbmZvcm1hdGlvblxuICAgICAgICAgICAgICogd2UgaW1wbHkgdGhhdCBpZiB0aGUgQVBJIGRvZXMgbm90IHJlc3BvbmQgaW4gMTUgc2Vjb25kcywgdGhlbiB3ZSBhdXRvbWF0aWNhbGx5IGNhdGNoIHRoYXQsIGFuZCByZXR1cm4gYW5cbiAgICAgICAgICAgICAqIGVycm9yIGZvciBhIGJldHRlciBjdXN0b21lciBleHBlcmllbmNlLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBjb25zdCByZXF1ZXN0RGF0YSA9IHtcbiAgICAgICAgICAgICAgICB0Y0FjY2VwdGVkRGF0ZTogdXBkYXRlZEF0LFxuICAgICAgICAgICAgICAgIGV4dE1lbWJlcklkOiB1c2VySWQsXG4gICAgICAgICAgICAgICAgLy8gZm9yIHRoaXMgY2FsbCB3ZSBrbm93IGZvciBzdXJlIHRoYXQgYXQgY2xpZW50IGluaXRpYWxpemF0aW9uIHRpbWUsIGEgbWVtYmVyIGZsYWcgd2lsbCBiZSBwYXNzZWQgaW5cbiAgICAgICAgICAgICAgICBpc0FjdGl2ZTogbWVtYmVyRmxhZyxcbiAgICAgICAgICAgICAgICBjYXNoYmFja1Byb2dyYW06IHRydWUsXG4gICAgICAgICAgICAgICAgcm91bmRpbmdQcm9ncmFtOiBmYWxzZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBPbGl2ZSBBUEkgcmVxdWVzdCBPYmplY3Q6ICR7SlNPTi5zdHJpbmdpZnkocmVxdWVzdERhdGEpfWApO1xuXG4gICAgICAgICAgICByZXR1cm4gYXhpb3MucHV0KGAke29saXZlQmFzZVVSTH0vbWVtYmVycy8ke21lbWJlcklkfWAsIHJlcXVlc3REYXRhLCB7XG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAgICAgXCJPbGl2ZS1LZXlcIjogb2xpdmVQcml2YXRlS2V5XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiAxNTAwMCwgLy8gaW4gbWlsbGlzZWNvbmRzIGhlcmVcbiAgICAgICAgICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlOiAnT2xpdmUgQVBJIHRpbWVkIG91dCBhZnRlciAxNTAwMG1zISdcbiAgICAgICAgICAgIH0pLnRoZW4odXBkYXRlTWVtYmVyUmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeSh1cGRhdGVNZW1iZXJSZXNwb25zZS5kYXRhKX1gKTtcblxuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIGlmIHdlIHJlYWNoZWQgdGhpcywgdGhlbiB3ZSBhc3N1bWUgdGhhdCBhIDJ4eCByZXNwb25zZSBjb2RlIHdhcyByZXR1cm5lZC5cbiAgICAgICAgICAgICAgICAgKiBjaGVjayB0aGUgY29udGVudHMgb2YgdGhlIHJlc3BvbnNlLCBhbmQgYWN0IGFwcHJvcHJpYXRlbHkuXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgaWYgKHVwZGF0ZU1lbWJlclJlc3BvbnNlLmRhdGEgIT09IHVuZGVmaW5lZCAmJiB1cGRhdGVNZW1iZXJSZXNwb25zZS5kYXRhW1wiaWRcIl0gIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVNZW1iZXJSZXNwb25zZS5kYXRhW1wiZXh0TWVtYmVySWRcIl0gIT09IHVuZGVmaW5lZCAmJiAodXBkYXRlTWVtYmVyUmVzcG9uc2UuZGF0YVtcImlzQWN0aXZlXCJdICE9PSBudWxsIHx8IHVwZGF0ZU1lbWJlclJlc3BvbnNlLmRhdGFbXCJpc0FjdGl2ZVwiXSAhPT0gdW5kZWZpbmVkKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB1cGRhdGVNZW1iZXJSZXNwb25zZS5kYXRhW1wiZXh0TWVtYmVySWRcIl0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVtYmVySWQ6IHVwZGF0ZU1lbWJlclJlc3BvbnNlLmRhdGFbXCJpZFwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0FjdGl2ZTogdXBkYXRlTWVtYmVyUmVzcG9uc2UuZGF0YVtcImlzQWN0aXZlXCJdXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgSW52YWxpZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UhYCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yLnJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBhbmQgdGhlIHNlcnZlciByZXNwb25kZWQgd2l0aCBhIHN0YXR1cyBjb2RlXG4gICAgICAgICAgICAgICAgICAgICAqICB0aGF0IGZhbGxzIG91dCBvZiB0aGUgcmFuZ2Ugb2YgMnh4LlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vbiAyeHh4IHJlc3BvbnNlIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBPbGl2ZSBBUEksIHdpdGggc3RhdHVzICR7ZXJyb3IucmVzcG9uc2Uuc3RhdHVzfSwgYW5kIHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZXJyb3IucmVzcG9uc2UuZGF0YSl9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBhbnkgb3RoZXIgc3BlY2lmaWMgZXJyb3JzIHRvIGJlIGZpbHRlcmVkIGJlbG93XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5yZXF1ZXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBidXQgbm8gcmVzcG9uc2Ugd2FzIHJlY2VpdmVkXG4gICAgICAgICAgICAgICAgICAgICAqIGBlcnJvci5yZXF1ZXN0YCBpcyBhbiBpbnN0YW5jZSBvZiBYTUxIdHRwUmVxdWVzdCBpbiB0aGUgYnJvd3NlciBhbmQgYW4gaW5zdGFuY2Ugb2ZcbiAgICAgICAgICAgICAgICAgICAgICogIGh0dHAuQ2xpZW50UmVxdWVzdCBpbiBub2RlLmpzLlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vIHJlc3BvbnNlIHJlY2VpdmVkIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBPbGl2ZSBBUEksIGZvciByZXF1ZXN0ICR7ZXJyb3IucmVxdWVzdH1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU29tZXRoaW5nIGhhcHBlbmVkIGluIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgdGhhdCB0cmlnZ2VyZWQgYW4gRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgc2V0dGluZyB1cCB0aGUgcmVxdWVzdCBmb3IgdGhlICR7ZW5kcG9pbnRJbmZvfSBPbGl2ZSBBUEksICR7KGVycm9yICYmIGVycm9yLm1lc3NhZ2UpICYmIGVycm9yLm1lc3NhZ2V9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGluaXRpYXRpbmcgbWVtYmVyIHVwZGF0ZSBzdGF0dXMgdGhyb3VnaCAke2VuZHBvaW50SW5mb31gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfSAke2Vycn1gKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHVzZWQgdG8gcmVtb3ZlL2RlYWN0aXZhdGUgYSBjYXJkLCBnaXZlbiBpdHMgSUQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gY2FyZElkIHRoZSBpZCBvZiB0aGUgY2FyZCB0byBiZSByZW1vdmVkL2RlbGV0ZWQvZGVhY3RpdmF0ZWRcbiAgICAgKlxuICAgICAqIEByZXR1cm4gYSB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIFJlbW92ZUNhcmRSZXNwb25zZX0gcmVwcmVzZW50aW5nIHRoZVxuICAgICAqIGNhcmQgcmVtb3ZhbCByZXNwb25zZS5cbiAgICAgKi9cbiAgICBhc3luYyByZW1vdmVDYXJkKGNhcmRJZDogc3RyaW5nKTogUHJvbWlzZTxSZW1vdmVDYXJkUmVzcG9uc2U+IHtcbiAgICAgICAgLy8gZWFzaWx5IGlkZW50aWZpYWJsZSBBUEkgZW5kcG9pbnQgaW5mb3JtYXRpb25cbiAgICAgICAgY29uc3QgZW5kcG9pbnRJbmZvID0gJ1BPU1QgL2NhcmRzL3tpZH0vZGVhY3RpdmF0ZSBPbGl2ZSBBUEknO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgQVBJIEtleSBhbmQgQmFzZSBVUkwsIG5lZWRlZCBpbiBvcmRlciB0byBtYWtlIHRoZSBQT1NUIGNhcmQgZGVhY3RpdmF0ZSBjYWxsIHRocm91Z2ggdGhlIGNsaWVudFxuICAgICAgICAgICAgY29uc3QgW29saXZlQmFzZVVSTCwgb2xpdmVQdWJsaWNLZXksIG9saXZlUHJpdmF0ZUtleV0gPSBhd2FpdCBzdXBlci5yZXRyaWV2ZVNlcnZpY2VDcmVkZW50aWFscyhDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5PTElWRV9TRUNSRVRfTkFNRSk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB3ZSBvYnRhaW5lZCBhbnkgaW52YWxpZCBzZWNyZXQgdmFsdWVzIGZyb20gdGhlIGNhbGwgYWJvdmVcbiAgICAgICAgICAgIGlmIChvbGl2ZUJhc2VVUkwgPT09IG51bGwgfHwgb2xpdmVCYXNlVVJMLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG9saXZlUHVibGljS2V5ID09PSBudWxsIHx8IG9saXZlUHVibGljS2V5Lmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG9saXZlUHJpdmF0ZUtleSA9PT0gbnVsbCB8fCBvbGl2ZVByaXZhdGVLZXkhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IFwiSW52YWxpZCBTZWNyZXRzIG9idGFpbmVkIGZvciBPbGl2ZSBBUEkgY2FsbCFcIjtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBQT1NUIC9jYXJkcy97aWR9L2RlYWN0aXZhdGVcbiAgICAgICAgICAgICAqIEBsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm9saXZlbHRkLmNvbS9yZWZlcmVuY2UvZGVsZXRlLWNhcmRcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBidWlsZCB0aGUgT2xpdmUgQVBJIHJlcXVlc3QgYm9keSB0byBiZSBwYXNzZWQgaW4sIGFuZCBwZXJmb3JtIGEgUE9TVCB0byBpdCB3aXRoIHRoZSBhcHByb3ByaWF0ZSBpbmZvcm1hdGlvblxuICAgICAgICAgICAgICogd2UgaW1wbHkgdGhhdCBpZiB0aGUgQVBJIGRvZXMgbm90IHJlc3BvbmQgaW4gMTUgc2Vjb25kcywgdGhlbiB3ZSBhdXRvbWF0aWNhbGx5IGNhdGNoIHRoYXQsIGFuZCByZXR1cm4gYW5cbiAgICAgICAgICAgICAqIGVycm9yIGZvciBhIGJldHRlciBjdXN0b21lciBleHBlcmllbmNlLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICByZXR1cm4gYXhpb3MucG9zdChgJHtvbGl2ZUJhc2VVUkx9L2NhcmRzLyR7Y2FyZElkfS9kZWFjdGl2YXRlYCwgdW5kZWZpbmVkLCB7XG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAgICAgXCJPbGl2ZS1LZXlcIjogb2xpdmVQcml2YXRlS2V5XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiAxNTAwMCwgLy8gaW4gbWlsbGlzZWNvbmRzIGhlcmVcbiAgICAgICAgICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlOiAnT2xpdmUgQVBJIHRpbWVkIG91dCBhZnRlciAxNTAwMG1zISdcbiAgICAgICAgICAgIH0pLnRoZW4ocmVtb3ZlQ2FyZFJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlbmRwb2ludEluZm99IHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkocmVtb3ZlQ2FyZFJlc3BvbnNlLmRhdGEpfWApO1xuXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogaWYgd2UgcmVhY2hlZCB0aGlzLCB0aGVuIHdlIGFzc3VtZSB0aGF0IGEgMnh4IHJlc3BvbnNlIGNvZGUgd2FzIHJldHVybmVkLlxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGlmIChyZW1vdmVDYXJkUmVzcG9uc2UuZGF0YSA9PT0gXCJcIikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogdHJ1ZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogYEludmFsaWQgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gJHtlbmRwb2ludEluZm99IHJlc3BvbnNlIWAsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvclxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvci5yZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYW5kIHRoZSBzZXJ2ZXIgcmVzcG9uZGVkIHdpdGggYSBzdGF0dXMgY29kZVxuICAgICAgICAgICAgICAgICAgICAgKiB0aGF0IGZhbGxzIG91dCBvZiB0aGUgcmFuZ2Ugb2YgMnh4LlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vbiAyeHh4IHJlc3BvbnNlIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBPbGl2ZSBBUEksIHdpdGggc3RhdHVzICR7ZXJyb3IucmVzcG9uc2Uuc3RhdHVzfSwgYW5kIHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZXJyb3IucmVzcG9uc2UuZGF0YSl9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBhbnkgb3RoZXIgc3BlY2lmaWMgZXJyb3JzIHRvIGJlIGZpbHRlcmVkIGJlbG93XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5yZXF1ZXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBidXQgbm8gcmVzcG9uc2Ugd2FzIHJlY2VpdmVkXG4gICAgICAgICAgICAgICAgICAgICAqIGBlcnJvci5yZXF1ZXN0YCBpcyBhbiBpbnN0YW5jZSBvZiBYTUxIdHRwUmVxdWVzdCBpbiB0aGUgYnJvd3NlciBhbmQgYW4gaW5zdGFuY2Ugb2ZcbiAgICAgICAgICAgICAgICAgICAgICogIGh0dHAuQ2xpZW50UmVxdWVzdCBpbiBub2RlLmpzLlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vIHJlc3BvbnNlIHJlY2VpdmVkIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBPbGl2ZSBBUEksIGZvciByZXF1ZXN0ICR7ZXJyb3IucmVxdWVzdH1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU29tZXRoaW5nIGhhcHBlbmVkIGluIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgdGhhdCB0cmlnZ2VyZWQgYW4gRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgc2V0dGluZyB1cCB0aGUgcmVxdWVzdCBmb3IgdGhlICR7ZW5kcG9pbnRJbmZvfSBPbGl2ZSBBUEksICR7KGVycm9yICYmIGVycm9yLm1lc3NhZ2UpICYmIGVycm9yLm1lc3NhZ2V9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGluaXRpYXRpbmcgdGhlIGNhcmQgcmVtb3ZhbCB0aHJvdWdoICR7ZW5kcG9pbnRJbmZvfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9ICR7ZXJyfWApO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdXNlZCB0byByZXRyaWV2ZSB0aGUgZGV0YWlscyBvZiBhIGdpdmVuIGNhcmQsIGdpdmVuIGl0cyBjb3JyZXNwb25kaW5nIGlkLlxuICAgICAqXG4gICAgICogQHBhcmFtIGNhcmRJZCB0aGUgaWQgb2YgdGhlIGNhcmQgdG8gcmV0cmlldmUgdGhlIGRldGFpbHMgZm9yXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIGEge2xpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIENhcmREZXRhaWxzUmVzcG9uc2V9IHJlcHJlc2VudGluZyB0aGUgZXhwaXJhdGlvbiBkYXRlIG9mXG4gICAgICogdGhlIGNhcmQgdG8gYmUgcmV0cmlldmVkLlxuICAgICAqL1xuICAgIGFzeW5jIGdldENhcmREZXRhaWxzKGNhcmRJZDogc3RyaW5nKTogUHJvbWlzZTxDYXJkRGV0YWlsc1Jlc3BvbnNlPiB7XG4gICAgICAgIC8vIGVhc2lseSBpZGVudGlmaWFibGUgQVBJIGVuZHBvaW50IGluZm9ybWF0aW9uXG4gICAgICAgIGNvbnN0IGVuZHBvaW50SW5mbyA9ICdHRVQgL2NhcmRzL3tpZH0gT2xpdmUgQVBJJztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIEFQSSBLZXkgYW5kIEJhc2UgVVJMLCBuZWVkZWQgaW4gb3JkZXIgdG8gbWFrZSB0aGUgR0VUIGNhcmQgZGV0YWlscyBjYWxsIHRocm91Z2ggdGhlIGNsaWVudFxuICAgICAgICAgICAgY29uc3QgW29saXZlQmFzZVVSTCwgb2xpdmVQdWJsaWNLZXksIG9saXZlUHJpdmF0ZUtleV0gPSBhd2FpdCBzdXBlci5yZXRyaWV2ZVNlcnZpY2VDcmVkZW50aWFscyhDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5PTElWRV9TRUNSRVRfTkFNRSk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB3ZSBvYnRhaW5lZCBhbnkgaW52YWxpZCBzZWNyZXQgdmFsdWVzIGZyb20gdGhlIGNhbGwgYWJvdmVcbiAgICAgICAgICAgIGlmIChvbGl2ZUJhc2VVUkwgPT09IG51bGwgfHwgb2xpdmVCYXNlVVJMLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG9saXZlUHVibGljS2V5ID09PSBudWxsIHx8IG9saXZlUHVibGljS2V5Lmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG9saXZlUHJpdmF0ZUtleSA9PT0gbnVsbCB8fCBvbGl2ZVByaXZhdGVLZXkhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IFwiSW52YWxpZCBTZWNyZXRzIG9idGFpbmVkIGZvciBPbGl2ZSBBUEkgY2FsbCFcIjtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBHRVQgL2NhcmRzL3tpZH1cbiAgICAgICAgICAgICAqIEBsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm9saXZlbHRkLmNvbS9yZWZlcmVuY2UvZ2V0LWNhcmRcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBidWlsZCB0aGUgT2xpdmUgQVBJIHJlcXVlc3QgYm9keSB0byBiZSBwYXNzZWQgaW4sIGFuZCBwZXJmb3JtIGEgR0VUIHRvIGl0IHdpdGggdGhlIGFwcHJvcHJpYXRlIGluZm9ybWF0aW9uXG4gICAgICAgICAgICAgKiB3ZSBpbXBseSB0aGF0IGlmIHRoZSBBUEkgZG9lcyBub3QgcmVzcG9uZCBpbiAxNSBzZWNvbmRzLCB0aGVuIHdlIGF1dG9tYXRpY2FsbHkgY2F0Y2ggdGhhdCwgYW5kIHJldHVybiBhblxuICAgICAgICAgICAgICogZXJyb3IgZm9yIGEgYmV0dGVyIGN1c3RvbWVyIGV4cGVyaWVuY2UuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHJldHVybiBheGlvcy5nZXQoYCR7b2xpdmVCYXNlVVJMfS9jYXJkcy8ke2NhcmRJZH1gLCB7XG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAgICAgXCJPbGl2ZS1LZXlcIjogb2xpdmVQcml2YXRlS2V5XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiAxNTAwMCwgLy8gaW4gbWlsbGlzZWNvbmRzIGhlcmVcbiAgICAgICAgICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlOiAnT2xpdmUgQVBJIHRpbWVkIG91dCBhZnRlciAxNTAwMG1zISdcbiAgICAgICAgICAgIH0pLnRoZW4oY2FyZERldGFpbHNSZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGNhcmREZXRhaWxzUmVzcG9uc2UuZGF0YSl9YCk7XG5cbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiBpZiB3ZSByZWFjaGVkIHRoaXMsIHRoZW4gd2UgYXNzdW1lIHRoYXQgYSAyeHggcmVzcG9uc2UgY29kZSB3YXMgcmV0dXJuZWQuXG4gICAgICAgICAgICAgICAgICogY2hlY2sgdGhlIGNvbnRlbnRzIG9mIHRoZSByZXNwb25zZSwgYW5kIGFjdCBhcHByb3ByaWF0ZWx5LlxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGlmIChjYXJkRGV0YWlsc1Jlc3BvbnNlLmRhdGEgIT09IHVuZGVmaW5lZCAmJiBjYXJkRGV0YWlsc1Jlc3BvbnNlLmRhdGFbXCJpZFwiXSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgICAgICAgICAgIGNhcmREZXRhaWxzUmVzcG9uc2UuZGF0YVtcImV4cGlyeU1vbnRoXCJdICE9PSB1bmRlZmluZWQgJiYgY2FyZERldGFpbHNSZXNwb25zZS5kYXRhW1wiZXhwaXJ5WWVhclwiXSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgICAgICAgICAgIGNhcmREZXRhaWxzUmVzcG9uc2UuZGF0YVtcImlkXCJdID09PSBjYXJkSWQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBjYXJkIGRldGFpbHMgZnJvbSB0aGUgcmVzcG9uc2UgKGV4cGlyYXRpb24gZGF0ZSBmb3Igbm93KVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogYCR7Y2FyZERldGFpbHNSZXNwb25zZS5kYXRhW1wiZXhwaXJ5TW9udGhcIl19LyR7Y2FyZERldGFpbHNSZXNwb25zZS5kYXRhW1wiZXhwaXJ5WWVhclwiXX1gXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgSW52YWxpZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UhYCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yLnJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBhbmQgdGhlIHNlcnZlciByZXNwb25kZWQgd2l0aCBhIHN0YXR1cyBjb2RlXG4gICAgICAgICAgICAgICAgICAgICAqIHRoYXQgZmFsbHMgb3V0IG9mIHRoZSByYW5nZSBvZiAyeHguXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm9uIDJ4eHggcmVzcG9uc2Ugd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE9saXZlIEFQSSwgd2l0aCBzdGF0dXMgJHtlcnJvci5yZXNwb25zZS5zdGF0dXN9LCBhbmQgcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShlcnJvci5yZXNwb25zZS5kYXRhKX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGFueSBvdGhlciBzcGVjaWZpYyBlcnJvcnMgdG8gYmUgZmlsdGVyZWQgYmVsb3dcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVycm9yLnJlcXVlc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGJ1dCBubyByZXNwb25zZSB3YXMgcmVjZWl2ZWRcbiAgICAgICAgICAgICAgICAgICAgICogYGVycm9yLnJlcXVlc3RgIGlzIGFuIGluc3RhbmNlIG9mIFhNTEh0dHBSZXF1ZXN0IGluIHRoZSBicm93c2VyIGFuZCBhbiBpbnN0YW5jZSBvZlxuICAgICAgICAgICAgICAgICAgICAgKiAgaHR0cC5DbGllbnRSZXF1ZXN0IGluIG5vZGUuanMuXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm8gcmVzcG9uc2UgcmVjZWl2ZWQgd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE9saXZlIEFQSSwgZm9yIHJlcXVlc3QgJHtlcnJvci5yZXF1ZXN0fWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBTb21ldGhpbmcgaGFwcGVuZWQgaW4gc2V0dGluZyB1cCB0aGUgcmVxdWVzdCB0aGF0IHRyaWdnZXJlZCBhbiBFcnJvclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IGZvciB0aGUgJHtlbmRwb2ludEluZm99IE9saXZlIEFQSSwgJHsoZXJyb3IgJiYgZXJyb3IubWVzc2FnZSkgJiYgZXJyb3IubWVzc2FnZX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgaW5pdGlhdGluZyB0aGUgY2FyZCBkZXRhaWxzIHJldHJpZXZhbCB0aHJvdWdoICR7ZW5kcG9pbnRJbmZvfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9ICR7ZXJyfWApO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdXNlZCB0byByZXRyaWV2ZSB0aGUgYnJhbmQgZGV0YWlscywgZ2l2ZW4gYSBicmFuZCBJRC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB0cmFuc2FjdGlvbiB0aGUgdHJhbnNhY3Rpb24gb2JqZWN0LCBwb3B1bGF0ZWQgYnkgdGhlIGluaXRpYWwgZGV0YWlsc1xuICAgICAqIHBhc3NlZCBpbiBieSBPbGl2ZS4gVGhpcyBvYmplY3Qgd2lsbCBiZSB1c2VkIHRvIHNldCBldmVuIG1vcmUgaW5mb3JtYXRpb24gZm9yXG4gICAgICogaXQsIG9idGFpbmVkIGZyb20gdGhpcyBicmFuZCBjYWxsLlxuICAgICAqXG4gICAgICogQHJldHVybiBhIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgVHJhbnNhY3Rpb25SZXNwb25zZX0gcmVwcmVzZW50aW5nIHRoZVxuICAgICAqIHRyYW5zYWN0aW9uIG9iamVjdCwgcG9wdWxhdGVkIHdpdGggdGhlIGJyYW5kIGRldGFpbHNcbiAgICAgKi9cbiAgICBhc3luYyBnZXRCcmFuZERldGFpbHModHJhbnNhY3Rpb246IFRyYW5zYWN0aW9uKTogUHJvbWlzZTxUcmFuc2FjdGlvblJlc3BvbnNlPiB7XG4gICAgICAgIC8vIGVhc2lseSBpZGVudGlmaWFibGUgQVBJIGVuZHBvaW50IGluZm9ybWF0aW9uXG4gICAgICAgIGNvbnN0IGVuZHBvaW50SW5mbyA9ICdHRVQgL2JyYW5kcy97aWR9IE9saXZlIEFQSSc7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBBUEkgS2V5IGFuZCBCYXNlIFVSTCwgbmVlZGVkIGluIG9yZGVyIHRvIG1ha2UgdGhlIEdFVCBicmFuZCBkZXRhaWxzIGNhbGwgdGhyb3VnaCB0aGUgY2xpZW50XG4gICAgICAgICAgICBjb25zdCBbb2xpdmVCYXNlVVJMLCBvbGl2ZVB1YmxpY0tleSwgb2xpdmVQcml2YXRlS2V5XSA9IGF3YWl0IHN1cGVyLnJldHJpZXZlU2VydmljZUNyZWRlbnRpYWxzKENvbnN0YW50cy5BV1NQYWlyQ29uc3RhbnRzLk9MSVZFX1NFQ1JFVF9OQU1FKTtcblxuICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHdlIG9idGFpbmVkIGFueSBpbnZhbGlkIHNlY3JldCB2YWx1ZXMgZnJvbSB0aGUgY2FsbCBhYm92ZVxuICAgICAgICAgICAgaWYgKG9saXZlQmFzZVVSTCA9PT0gbnVsbCB8fCBvbGl2ZUJhc2VVUkwubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgb2xpdmVQdWJsaWNLZXkgPT09IG51bGwgfHwgb2xpdmVQdWJsaWNLZXkubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgb2xpdmVQcml2YXRlS2V5ID09PSBudWxsIHx8IG9saXZlUHJpdmF0ZUtleSEubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gXCJJbnZhbGlkIFNlY3JldHMgb2J0YWluZWQgZm9yIE9saXZlIEFQSSBjYWxsIVwiO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBHRVQgL2JyYW5kcy97aWR9XG4gICAgICAgICAgICAgKiBAbGluayBodHRwczovL2RldmVsb3Blci5vbGl2ZWx0ZC5jb20vcmVmZXJlbmNlL2dldC1icmFuZFxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIGJ1aWxkIHRoZSBPbGl2ZSBBUEkgcmVxdWVzdCBib2R5IHRvIGJlIHBhc3NlZCBpbiwgYW5kIHBlcmZvcm0gYSBHRVQgdG8gaXQgd2l0aCB0aGUgYXBwcm9wcmlhdGUgaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAqIHdlIGltcGx5IHRoYXQgaWYgdGhlIEFQSSBkb2VzIG5vdCByZXNwb25kIGluIDE1IHNlY29uZHMsIHRoZW4gd2UgYXV0b21hdGljYWxseSBjYXRjaCB0aGF0LCBhbmQgcmV0dXJuIGFuXG4gICAgICAgICAgICAgKiBlcnJvciBmb3IgYSBiZXR0ZXIgY3VzdG9tZXIgZXhwZXJpZW5jZS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgcmV0dXJuIGF4aW9zLmdldChgJHtvbGl2ZUJhc2VVUkx9L2JyYW5kcy8ke3RyYW5zYWN0aW9uLmJyYW5kSWR9YCwge1xuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiT2xpdmUtS2V5XCI6IG9saXZlUHJpdmF0ZUtleVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGltZW91dDogMTUwMDAsIC8vIGluIG1pbGxpc2Vjb25kcyBoZXJlXG4gICAgICAgICAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZTogJ09saXZlIEFQSSB0aW1lZCBvdXQgYWZ0ZXIgMTUwMDBtcyEnXG4gICAgICAgICAgICB9KS50aGVuKGJyYW5kRGV0YWlsc1Jlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlbmRwb2ludEluZm99IHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoYnJhbmREZXRhaWxzUmVzcG9uc2UuZGF0YSl9YCk7XG5cbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiBpZiB3ZSByZWFjaGVkIHRoaXMsIHRoZW4gd2UgYXNzdW1lIHRoYXQgYSAyeHggcmVzcG9uc2UgY29kZSB3YXMgcmV0dXJuZWQuXG4gICAgICAgICAgICAgICAgICogY2hlY2sgdGhlIGNvbnRlbnRzIG9mIHRoZSByZXNwb25zZSwgYW5kIGFjdCBhcHByb3ByaWF0ZWx5LlxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGlmIChicmFuZERldGFpbHNSZXNwb25zZS5kYXRhICE9PSB1bmRlZmluZWQgJiYgYnJhbmREZXRhaWxzUmVzcG9uc2UuZGF0YVtcImRiYVwiXSAhPT0gdW5kZWZpbmVkICYmIGJyYW5kRGV0YWlsc1Jlc3BvbnNlLmRhdGFbXCJsb2dvVXJsXCJdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gc2V0IHRoZSBicmFuZCBkZXRhaWxzIGZvciB0aGUgdHJhbnNhY3Rpb24gb2JqZWN0LCBmcm9tIHRoZSByZXNwb25zZVxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbi50cmFuc2FjdGlvbkJyYW5kTmFtZSA9IGJyYW5kRGV0YWlsc1Jlc3BvbnNlLmRhdGFbXCJkYmFcIl07XG4gICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uLnRyYW5zYWN0aW9uQnJhbmRMb2dvVXJsID0gYnJhbmREZXRhaWxzUmVzcG9uc2UuZGF0YVtcImxvZ29VcmxcIl07XG4gICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uLnRyYW5zYWN0aW9uQnJhbmRVUkxBZGRyZXNzID0gYnJhbmREZXRhaWxzUmVzcG9uc2UuZGF0YVtcIndlYnNpdGVcIl0gIT09IHVuZGVmaW5lZCA/IGJyYW5kRGV0YWlsc1Jlc3BvbnNlLmRhdGFbXCJ3ZWJzaXRlXCJdIDogJ05vdCBBdmFpbGFibGUnO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogdHJhbnNhY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBJbnZhbGlkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tICR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSFgLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yLnJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBhbmQgdGhlIHNlcnZlciByZXNwb25kZWQgd2l0aCBhIHN0YXR1cyBjb2RlXG4gICAgICAgICAgICAgICAgICAgICAqIHRoYXQgZmFsbHMgb3V0IG9mIHRoZSByYW5nZSBvZiAyeHguXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm9uIDJ4eHggcmVzcG9uc2Ugd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE9saXZlIEFQSSwgd2l0aCBzdGF0dXMgJHtlcnJvci5yZXNwb25zZS5zdGF0dXN9LCBhbmQgcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShlcnJvci5yZXNwb25zZS5kYXRhKX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGFueSBvdGhlciBzcGVjaWZpYyBlcnJvcnMgdG8gYmUgZmlsdGVyZWQgYmVsb3dcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5yZXF1ZXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBidXQgbm8gcmVzcG9uc2Ugd2FzIHJlY2VpdmVkXG4gICAgICAgICAgICAgICAgICAgICAqIGBlcnJvci5yZXF1ZXN0YCBpcyBhbiBpbnN0YW5jZSBvZiBYTUxIdHRwUmVxdWVzdCBpbiB0aGUgYnJvd3NlciBhbmQgYW4gaW5zdGFuY2Ugb2ZcbiAgICAgICAgICAgICAgICAgICAgICogIGh0dHAuQ2xpZW50UmVxdWVzdCBpbiBub2RlLmpzLlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vIHJlc3BvbnNlIHJlY2VpdmVkIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBPbGl2ZSBBUEksIGZvciByZXF1ZXN0ICR7ZXJyb3IucmVxdWVzdH1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNvbWV0aGluZyBoYXBwZW5lZCBpbiBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IHRoYXQgdHJpZ2dlcmVkIGFuIEVycm9yXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgZm9yIHRoZSAke2VuZHBvaW50SW5mb30gT2xpdmUgQVBJLCAkeyhlcnJvciAmJiBlcnJvci5tZXNzYWdlKSAmJiBlcnJvci5tZXNzYWdlfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgaW5pdGlhdGluZyB0aGUgYnJhbmQgZGV0YWlscyByZXRyaWV2YWwgdGhyb3VnaCAke2VuZHBvaW50SW5mb31gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfSAke2Vycn1gKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB1c2VkIHRvIHJldHJpZXZlIHRoZSBzdG9yZSBkZXRhaWxzLCBnaXZlbiBhIHN0b3JlIElELlxuICAgICAqXG4gICAgICogQHBhcmFtIHRyYW5zYWN0aW9uIHRoZSB0cmFuc2FjdGlvbiBvYmplY3QsIHBvcHVsYXRlZCBieSB0aGUgaW5pdGlhbCBkZXRhaWxzXG4gICAgICogcGFzc2VkIGluIGJ5IE9saXZlLiBUaGlzIG9iamVjdCB3aWxsIGJlIHVzZWQgdG8gc2V0IGV2ZW4gbW9yZSBpbmZvcm1hdGlvbiBmb3JcbiAgICAgKiBpdCwgb2J0YWluZWQgZnJvbSB0aGlzIGJyYW5kIGNhbGwuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIGEge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBUcmFuc2FjdGlvblJlc3BvbnNlfSByZXByZXNlbnRpbmcgdGhlIHRyYW5zYWN0aW9uXG4gICAgICogd2l0aCB0aGUgc3RvcmUgZGV0YWlscyBvYnRhaW5lZCwgaW5jbHVkZWQgaW4gaXQuXG4gICAgICovXG4gICAgYXN5bmMgZ2V0U3RvcmVEZXRhaWxzKHRyYW5zYWN0aW9uOiBUcmFuc2FjdGlvbik6IFByb21pc2U8VHJhbnNhY3Rpb25SZXNwb25zZT4ge1xuICAgICAgICAvLyBlYXNpbHkgaWRlbnRpZmlhYmxlIEFQSSBlbmRwb2ludCBpbmZvcm1hdGlvblxuICAgICAgICBjb25zdCBlbmRwb2ludEluZm8gPSAnR0VUIC9zdG9yZXMve2lkfSBPbGl2ZSBBUEknO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgQVBJIEtleSBhbmQgQmFzZSBVUkwsIG5lZWRlZCBpbiBvcmRlciB0byBtYWtlIHRoZSBHRVQgc3RvcmUgZGV0YWlscyBjYWxsIHRocm91Z2ggdGhlIGNsaWVudFxuICAgICAgICAgICAgY29uc3QgW29saXZlQmFzZVVSTCwgb2xpdmVQdWJsaWNLZXksIG9saXZlUHJpdmF0ZUtleV0gPSBhd2FpdCBzdXBlci5yZXRyaWV2ZVNlcnZpY2VDcmVkZW50aWFscyhDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5PTElWRV9TRUNSRVRfTkFNRSk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB3ZSBvYnRhaW5lZCBhbnkgaW52YWxpZCBzZWNyZXQgdmFsdWVzIGZyb20gdGhlIGNhbGwgYWJvdmVcbiAgICAgICAgICAgIGlmIChvbGl2ZUJhc2VVUkwgPT09IG51bGwgfHwgb2xpdmVCYXNlVVJMLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG9saXZlUHVibGljS2V5ID09PSBudWxsIHx8IG9saXZlUHVibGljS2V5Lmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG9saXZlUHJpdmF0ZUtleSA9PT0gbnVsbCB8fCBvbGl2ZVByaXZhdGVLZXkhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IFwiSW52YWxpZCBTZWNyZXRzIG9idGFpbmVkIGZvciBPbGl2ZSBBUEkgY2FsbCFcIjtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogR0VUIC9zdG9yZXMve2lkfVxuICAgICAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIub2xpdmVsdGQuY29tL3JlZmVyZW5jZS9nZXQtc3RvcmVcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBidWlsZCB0aGUgT2xpdmUgQVBJIHJlcXVlc3QgYm9keSB0byBiZSBwYXNzZWQgaW4sIGFuZCBwZXJmb3JtIGEgR0VUIHRvIGl0IHdpdGggdGhlIGFwcHJvcHJpYXRlIGluZm9ybWF0aW9uXG4gICAgICAgICAgICAgKiB3ZSBpbXBseSB0aGF0IGlmIHRoZSBBUEkgZG9lcyBub3QgcmVzcG9uZCBpbiAxNSBzZWNvbmRzLCB0aGVuIHdlIGF1dG9tYXRpY2FsbHkgY2F0Y2ggdGhhdCwgYW5kIHJldHVybiBhblxuICAgICAgICAgICAgICogZXJyb3IgZm9yIGEgYmV0dGVyIGN1c3RvbWVyIGV4cGVyaWVuY2UuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHJldHVybiBheGlvcy5nZXQoYCR7b2xpdmVCYXNlVVJMfS9zdG9yZXMvJHt0cmFuc2FjdGlvbi5zdG9yZUlkfWAsIHtcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgICAgICBcIk9saXZlLUtleVwiOiBvbGl2ZVByaXZhdGVLZXlcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDE1MDAwLCAvLyBpbiBtaWxsaXNlY29uZHMgaGVyZVxuICAgICAgICAgICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2U6ICdPbGl2ZSBBUEkgdGltZWQgb3V0IGFmdGVyIDE1MDAwbXMhJ1xuICAgICAgICAgICAgfSkudGhlbihzdG9yZURldGFpbHNSZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KHN0b3JlRGV0YWlsc1Jlc3BvbnNlLmRhdGEpfWApO1xuXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogaWYgd2UgcmVhY2hlZCB0aGlzLCB0aGVuIHdlIGFzc3VtZSB0aGF0IGEgMnh4IHJlc3BvbnNlIGNvZGUgd2FzIHJldHVybmVkLlxuICAgICAgICAgICAgICAgICAqIGNoZWNrIHRoZSBjb250ZW50cyBvZiB0aGUgcmVzcG9uc2UsIGFuZCBhY3QgYXBwcm9wcmlhdGVseS5cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBpZiAoc3RvcmVEZXRhaWxzUmVzcG9uc2UuZGF0YSAhPT0gdW5kZWZpbmVkICYmIHN0b3JlRGV0YWlsc1Jlc3BvbnNlLmRhdGFbXCJhZGRyZXNzMVwiXSAhPT0gdW5kZWZpbmVkICYmIHN0b3JlRGV0YWlsc1Jlc3BvbnNlLmRhdGFbXCJjaXR5XCJdICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgc3RvcmVEZXRhaWxzUmVzcG9uc2UuZGF0YVtcInBvc3Rjb2RlXCJdICE9PSB1bmRlZmluZWQgJiYgc3RvcmVEZXRhaWxzUmVzcG9uc2UuZGF0YVtcInN0YXRlXCJdICE9PSB1bmRlZmluZWQgJiYgc3RvcmVEZXRhaWxzUmVzcG9uc2UuZGF0YVtcImNvdW50cnlDb2RlXCJdICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgc3RvcmVEZXRhaWxzUmVzcG9uc2UuZGF0YVtcImlzT25saW5lXCJdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gc2V0IHRoZSBzdG9yZSBkZXRhaWxzIGZvciB0aGUgdHJhbnNhY3Rpb24gb2JqZWN0LCBmcm9tIHRoZSByZXNwb25zZVxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbi50cmFuc2FjdGlvbklzT25saW5lID0gc3RvcmVEZXRhaWxzUmVzcG9uc2UuZGF0YVtcImlzT25saW5lXCJdO1xuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbi50cmFuc2FjdGlvbkJyYW5kQWRkcmVzcyA9IGAke3N0b3JlRGV0YWlsc1Jlc3BvbnNlLmRhdGFbXCJhZGRyZXNzMVwiXX0sICR7c3RvcmVEZXRhaWxzUmVzcG9uc2UuZGF0YVtcImNpdHlcIl19LCAke3N0b3JlRGV0YWlsc1Jlc3BvbnNlLmRhdGFbXCJzdGF0ZVwiXX0sICR7c3RvcmVEZXRhaWxzUmVzcG9uc2UuZGF0YVtcInBvc3Rjb2RlXCJdfSwgJHtzdG9yZURldGFpbHNSZXNwb25zZS5kYXRhW1wiY291bnRyeUNvZGVcIl19YDtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogdHJhbnNhY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBJbnZhbGlkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tICR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSFgLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yLnJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBhbmQgdGhlIHNlcnZlciByZXNwb25kZWQgd2l0aCBhIHN0YXR1cyBjb2RlXG4gICAgICAgICAgICAgICAgICAgICAqIHRoYXQgZmFsbHMgb3V0IG9mIHRoZSByYW5nZSBvZiAyeHguXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm9uIDJ4eHggcmVzcG9uc2Ugd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE9saXZlIEFQSSwgd2l0aCBzdGF0dXMgJHtlcnJvci5yZXNwb25zZS5zdGF0dXN9LCBhbmQgcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShlcnJvci5yZXNwb25zZS5kYXRhKX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGFueSBvdGhlciBzcGVjaWZpYyBlcnJvcnMgdG8gYmUgZmlsdGVyZWQgYmVsb3dcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5yZXF1ZXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBidXQgbm8gcmVzcG9uc2Ugd2FzIHJlY2VpdmVkXG4gICAgICAgICAgICAgICAgICAgICAqIGBlcnJvci5yZXF1ZXN0YCBpcyBhbiBpbnN0YW5jZSBvZiBYTUxIdHRwUmVxdWVzdCBpbiB0aGUgYnJvd3NlciBhbmQgYW4gaW5zdGFuY2Ugb2ZcbiAgICAgICAgICAgICAgICAgICAgICogIGh0dHAuQ2xpZW50UmVxdWVzdCBpbiBub2RlLmpzLlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vIHJlc3BvbnNlIHJlY2VpdmVkIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBPbGl2ZSBBUEksIGZvciByZXF1ZXN0ICR7ZXJyb3IucmVxdWVzdH1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNvbWV0aGluZyBoYXBwZW5lZCBpbiBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IHRoYXQgdHJpZ2dlcmVkIGFuIEVycm9yXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgZm9yIHRoZSAke2VuZHBvaW50SW5mb30gT2xpdmUgQVBJLCAkeyhlcnJvciAmJiBlcnJvci5tZXNzYWdlKSAmJiBlcnJvci5tZXNzYWdlfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgaW5pdGlhdGluZyB0aGUgc3RvcmUgZGV0YWlscyByZXRyaWV2YWwgdGhyb3VnaCAke2VuZHBvaW50SW5mb31gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfSAke2Vycn1gKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB1c2VkIHRvIHJldHJpZXZlIHRoZSBtZW1iZXIgZGV0YWlscywgc3BlY2lmaWNhbGx5IHRoZSBleHRNZW1iZXJJZCwgd2hpY2ggaXMgTW9vbmJlYW0ncyB1bmlxdWUgdXNlciBJRFxuICAgICAqIHNldCBhdCBjcmVhdGlvbiB0aW1lLCBnaXZlbiBhIG1lbWJlciBJRC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBtZW1iZXJJZCBtZW1iZXIgSUQgb2J0YWluZWQgZnJvbSBPbGl2ZSBhdCBjcmVhdGlvbiB0aW1lLCB1c2VkIHRvIHJldHJpZXZlIHRoZVxuICAgICAqIG90aGVyIG1lbWJlciBkZXRhaWxzLlxuICAgICAqXG4gICAgICogQHJldHVybiBhIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgTWVtYmVyRGV0YWlsc1Jlc3BvbnNlfSByZXByZXNlbnRpbmcgdGhlIG1lbWJlciBkZXRhaWxzXG4gICAgICovXG4gICAgYXN5bmMgZ2V0TWVtYmVyRGV0YWlscyhtZW1iZXJJZDogc3RyaW5nKTogUHJvbWlzZTxNZW1iZXJEZXRhaWxzUmVzcG9uc2U+IHtcbiAgICAgICAgLy8gZWFzaWx5IGlkZW50aWZpYWJsZSBBUEkgZW5kcG9pbnQgaW5mb3JtYXRpb25cbiAgICAgICAgY29uc3QgZW5kcG9pbnRJbmZvID0gJ0dFVCAvbWVtYmVycy97aWR9IE9saXZlIEFQSSc7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBBUEkgS2V5IGFuZCBCYXNlIFVSTCwgbmVlZGVkIGluIG9yZGVyIHRvIG1ha2UgdGhlIEdFVCBtZW1iZXIgZGV0YWlscyBjYWxsIHRocm91Z2ggdGhlIGNsaWVudFxuICAgICAgICAgICAgY29uc3QgW29saXZlQmFzZVVSTCwgb2xpdmVQdWJsaWNLZXksIG9saXZlUHJpdmF0ZUtleV0gPSBhd2FpdCBzdXBlci5yZXRyaWV2ZVNlcnZpY2VDcmVkZW50aWFscyhDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5PTElWRV9TRUNSRVRfTkFNRSk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB3ZSBvYnRhaW5lZCBhbnkgaW52YWxpZCBzZWNyZXQgdmFsdWVzIGZyb20gdGhlIGNhbGwgYWJvdmVcbiAgICAgICAgICAgIGlmIChvbGl2ZUJhc2VVUkwgPT09IG51bGwgfHwgb2xpdmVCYXNlVVJMLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG9saXZlUHVibGljS2V5ID09PSBudWxsIHx8IG9saXZlUHVibGljS2V5Lmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG9saXZlUHJpdmF0ZUtleSA9PT0gbnVsbCB8fCBvbGl2ZVByaXZhdGVLZXkhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IFwiSW52YWxpZCBTZWNyZXRzIG9idGFpbmVkIGZvciBPbGl2ZSBBUEkgY2FsbCFcIjtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogR0VUIC9tZW1iZXJzL3tpZH1cbiAgICAgICAgICAgICAqIEBsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm9saXZlbHRkLmNvbS9yZWZlcmVuY2UvZ2V0LW1lbWJlclxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIGJ1aWxkIHRoZSBPbGl2ZSBBUEkgcmVxdWVzdCBib2R5IHRvIGJlIHBhc3NlZCBpbiwgYW5kIHBlcmZvcm0gYSBHRVQgdG8gaXQgd2l0aCB0aGUgYXBwcm9wcmlhdGUgaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAqIHdlIGltcGx5IHRoYXQgaWYgdGhlIEFQSSBkb2VzIG5vdCByZXNwb25kIGluIDE1IHNlY29uZHMsIHRoZW4gd2UgYXV0b21hdGljYWxseSBjYXRjaCB0aGF0LCBhbmQgcmV0dXJuIGFuXG4gICAgICAgICAgICAgKiBlcnJvciBmb3IgYSBiZXR0ZXIgY3VzdG9tZXIgZXhwZXJpZW5jZS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgcmV0dXJuIGF4aW9zLmdldChgJHtvbGl2ZUJhc2VVUkx9L21lbWJlcnMvJHttZW1iZXJJZH1gLCB7XG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAgICAgXCJPbGl2ZS1LZXlcIjogb2xpdmVQcml2YXRlS2V5XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiAxNTAwMCwgLy8gaW4gbWlsbGlzZWNvbmRzIGhlcmVcbiAgICAgICAgICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlOiAnT2xpdmUgQVBJIHRpbWVkIG91dCBhZnRlciAxNTAwMG1zISdcbiAgICAgICAgICAgIH0pLnRoZW4obWVtYmVyRGV0YWlsc1Jlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlbmRwb2ludEluZm99IHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkobWVtYmVyRGV0YWlsc1Jlc3BvbnNlLmRhdGEpfWApO1xuXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogaWYgd2UgcmVhY2hlZCB0aGlzLCB0aGVuIHdlIGFzc3VtZSB0aGF0IGEgMnh4IHJlc3BvbnNlIGNvZGUgd2FzIHJldHVybmVkLlxuICAgICAgICAgICAgICAgICAqIGNoZWNrIHRoZSBjb250ZW50cyBvZiB0aGUgcmVzcG9uc2UsIGFuZCBhY3QgYXBwcm9wcmlhdGVseS5cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBpZiAobWVtYmVyRGV0YWlsc1Jlc3BvbnNlLmRhdGEgIT09IHVuZGVmaW5lZCAmJiBtZW1iZXJEZXRhaWxzUmVzcG9uc2UuZGF0YVtcImV4dE1lbWJlcklkXCJdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBleHRlcm5hbCBtZW1iZXIgaWQgKGV4dE1lbWJlcklkKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogbWVtYmVyRGV0YWlsc1Jlc3BvbnNlLmRhdGFbXCJleHRNZW1iZXJJZFwiXVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogYEludmFsaWQgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gJHtlbmRwb2ludEluZm99IHJlc3BvbnNlIWAsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IucmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGFuZCB0aGUgc2VydmVyIHJlc3BvbmRlZCB3aXRoIGEgc3RhdHVzIGNvZGVcbiAgICAgICAgICAgICAgICAgICAgICogdGhhdCBmYWxscyBvdXQgb2YgdGhlIHJhbmdlIG9mIDJ4eC5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBOb24gMnh4eCByZXNwb25zZSB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gT2xpdmUgQVBJLCB3aXRoIHN0YXR1cyAke2Vycm9yLnJlc3BvbnNlLnN0YXR1c30sIGFuZCByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGVycm9yLnJlc3BvbnNlLmRhdGEpfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gYW55IG90aGVyIHNwZWNpZmljIGVycm9ycyB0byBiZSBmaWx0ZXJlZCBiZWxvd1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVycm9yLnJlcXVlc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGJ1dCBubyByZXNwb25zZSB3YXMgcmVjZWl2ZWRcbiAgICAgICAgICAgICAgICAgICAgICogYGVycm9yLnJlcXVlc3RgIGlzIGFuIGluc3RhbmNlIG9mIFhNTEh0dHBSZXF1ZXN0IGluIHRoZSBicm93c2VyIGFuZCBhbiBpbnN0YW5jZSBvZlxuICAgICAgICAgICAgICAgICAgICAgKiAgaHR0cC5DbGllbnRSZXF1ZXN0IGluIG5vZGUuanMuXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm8gcmVzcG9uc2UgcmVjZWl2ZWQgd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE9saXZlIEFQSSwgZm9yIHJlcXVlc3QgJHtlcnJvci5yZXF1ZXN0fWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU29tZXRoaW5nIGhhcHBlbmVkIGluIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgdGhhdCB0cmlnZ2VyZWQgYW4gRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgc2V0dGluZyB1cCB0aGUgcmVxdWVzdCBmb3IgdGhlICR7ZW5kcG9pbnRJbmZvfSBPbGl2ZSBBUEksICR7KGVycm9yICYmIGVycm9yLm1lc3NhZ2UpICYmIGVycm9yLm1lc3NhZ2V9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBpbml0aWF0aW5nIHRoZSBtZW1iZXIgZGV0YWlscyByZXRyaWV2YWwgdGhyb3VnaCAke2VuZHBvaW50SW5mb31gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfSAke2Vycn1gKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB1c2VkIHRvIHJldHJpZXZlIHRoZSB0cmFuc2FjdGlvbiBkZXRhaWxzLCBnaXZlbiBhIHRyYW5zYWN0aW9uIElEICh1c2VkIGZvciB1cGRhdGVkXG4gICAgICogdHJhbnNhY3Rpb25hbCBldmVudHMgcHVycG9zZXMpLlxuICAgICAqXG4gICAgICogQHBhcmFtIHVwZGF0ZWRUcmFuc2FjdGlvbkV2ZW50IHRoZSB1cGRhdGVkIHRyYW5zYWN0aW9uIGV2ZW50IG9iamVjdCwgcG9wdWxhdGVkIGJ5IHRoZVxuICAgICAqIGluaXRpYWwgZGV0YWlscyBwYXNzZWQgYnkgT2xpdmUgaW4gdGhlIHVwZGF0ZWQgd2ViaG9vayBjYWxsLiBUaGlzIG9iamVjdCB3aWxsIGJlIHVzZWRcbiAgICAgKiB0byBzZXQgZXZlbiBtb3JlIGluZm9ybWF0aW9uIGZvciBpdCwgb2J0YWluZWQgZnJvbSB0aGlzIHRyYW5zYWN0aW9uIGRldGFpbHMgY2FsbC5cbiAgICAgKlxuICAgICAqIEByZXR1cm4gYSB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIFVwZGF0ZWRUcmFuc2FjdGlvbkV2ZW50UmVzcG9uc2V9IHJlcHJlc2VudGluZyB0aGVcbiAgICAgKiB1cGRhdGVkIHRyYW5zYWN0aW9uIGV2ZW50IG9iamVjdCwgcG9wdWxhdGVkIHdpdGggdGhlIGFkZGl0aW9uYWwgdHJhbnNhY3Rpb24gZGV0YWlsc1xuICAgICAqIHRoYXQgd2UgcmV0cmlldmVkXG4gICAgICovXG4gICAgYXN5bmMgZ2V0VXBkYXRlZFRyYW5zYWN0aW9uRGV0YWlscyh1cGRhdGVkVHJhbnNhY3Rpb25FdmVudDogVXBkYXRlZFRyYW5zYWN0aW9uRXZlbnQpOiBQcm9taXNlPFVwZGF0ZWRUcmFuc2FjdGlvbkV2ZW50UmVzcG9uc2U+IHtcbiAgICAgICAgLy8gZWFzaWx5IGlkZW50aWZpYWJsZSBBUEkgZW5kcG9pbnQgaW5mb3JtYXRpb25cbiAgICAgICAgY29uc3QgZW5kcG9pbnRJbmZvID0gJ0dFVCAvdHJhbnNhY3Rpb25zL3tpZH0gT2xpdmUgQVBJJztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIEFQSSBLZXkgYW5kIEJhc2UgVVJMLCBuZWVkZWQgaW4gb3JkZXIgdG8gbWFrZSB0aGUgR0VUIHRyYW5zYWN0aW9uIGRldGFpbHMgY2FsbCB0aHJvdWdoIHRoZSBjbGllbnRcbiAgICAgICAgICAgIGNvbnN0IFtvbGl2ZUJhc2VVUkwsIG9saXZlUHVibGljS2V5LCBvbGl2ZVByaXZhdGVLZXldID0gYXdhaXQgc3VwZXIucmV0cmlldmVTZXJ2aWNlQ3JlZGVudGlhbHMoQ29uc3RhbnRzLkFXU1BhaXJDb25zdGFudHMuT0xJVkVfU0VDUkVUX05BTUUpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgd2Ugb2J0YWluZWQgYW55IGludmFsaWQgc2VjcmV0IHZhbHVlcyBmcm9tIHRoZSBjYWxsIGFib3ZlXG4gICAgICAgICAgICBpZiAob2xpdmVCYXNlVVJMID09PSBudWxsIHx8IG9saXZlQmFzZVVSTC5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBvbGl2ZVB1YmxpY0tleSA9PT0gbnVsbCB8fCBvbGl2ZVB1YmxpY0tleS5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBvbGl2ZVByaXZhdGVLZXkgPT09IG51bGwgfHwgb2xpdmVQcml2YXRlS2V5IS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBcIkludmFsaWQgU2VjcmV0cyBvYnRhaW5lZCBmb3IgT2xpdmUgQVBJIGNhbGwhXCI7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEdFVCAvdHJhbnNhY3Rpb25zL3tpZH1cbiAgICAgICAgICAgICAqIEBsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm9saXZlbHRkLmNvbS9yZWZlcmVuY2Uvc2hvdy10cmFuc2FjdGlvbi1kZXRhaWxzXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogYnVpbGQgdGhlIE9saXZlIEFQSSByZXF1ZXN0IGJvZHkgdG8gYmUgcGFzc2VkIGluLCBhbmQgcGVyZm9ybSBhIEdFVCB0byBpdCB3aXRoIHRoZSBhcHByb3ByaWF0ZSBpbmZvcm1hdGlvblxuICAgICAgICAgICAgICogd2UgaW1wbHkgdGhhdCBpZiB0aGUgQVBJIGRvZXMgbm90IHJlc3BvbmQgaW4gMTUgc2Vjb25kcywgdGhlbiB3ZSBhdXRvbWF0aWNhbGx5IGNhdGNoIHRoYXQsIGFuZCByZXR1cm4gYW5cbiAgICAgICAgICAgICAqIGVycm9yIGZvciBhIGJldHRlciBjdXN0b21lciBleHBlcmllbmNlLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICByZXR1cm4gYXhpb3MuZ2V0KGAke29saXZlQmFzZVVSTH0vdHJhbnNhY3Rpb25zLyR7dXBkYXRlZFRyYW5zYWN0aW9uRXZlbnQuZGF0YS50cmFuc2FjdGlvbi5pZH1gLCB7XG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAgICAgXCJPbGl2ZS1LZXlcIjogb2xpdmVQcml2YXRlS2V5XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiAxNTAwMCwgLy8gaW4gbWlsbGlzZWNvbmRzIGhlcmVcbiAgICAgICAgICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlOiAnT2xpdmUgQVBJIHRpbWVkIG91dCBhZnRlciAxNTAwMG1zISdcbiAgICAgICAgICAgIH0pLnRoZW4odHJhbnNhY3Rpb25EZXRhaWxzUmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeSh0cmFuc2FjdGlvbkRldGFpbHNSZXNwb25zZS5kYXRhKX1gKTtcblxuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIGlmIHdlIHJlYWNoZWQgdGhpcywgdGhlbiB3ZSBhc3N1bWUgdGhhdCBhIDJ4eCByZXNwb25zZSBjb2RlIHdhcyByZXR1cm5lZC5cbiAgICAgICAgICAgICAgICAgKiBjaGVjayB0aGUgY29udGVudHMgb2YgdGhlIHJlc3BvbnNlLCBhbmQgYWN0IGFwcHJvcHJpYXRlbHkuXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgaWYgKHRyYW5zYWN0aW9uRGV0YWlsc1Jlc3BvbnNlLmRhdGEgIT09IHVuZGVmaW5lZCAmJiB0cmFuc2FjdGlvbkRldGFpbHNSZXNwb25zZS5kYXRhW1wic3RvcmVJZFwiXSAmJiB0cmFuc2FjdGlvbkRldGFpbHNSZXNwb25zZS5kYXRhW1wiYnJhbmRJZFwiXSAmJlxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbkRldGFpbHNSZXNwb25zZS5kYXRhW1wibG95YWx0eVByb2dyYW1JZFwiXSAmJiB0cmFuc2FjdGlvbkRldGFpbHNSZXNwb25zZS5kYXRhW1wibWVyY2hhbnRDYXRlZ29yeUNvZGVcIl0pIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gc2V0IHRoZSB0cmFuc2FjdGlvbiBkZXRhaWxzIGZvciB0aGUgdXBkYXRlZCB0cmFuc2FjdGlvbiBvYmplY3QsIGZyb20gdGhlIHJlc3BvbnNlLCBhbmQgY29udmVydCBhbnkgaW5mb3JtYXRpb24gYWNjb3JkaW5nbHlcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlZFRyYW5zYWN0aW9uRXZlbnQuZGF0YS50cmFuc2FjdGlvbi5zdG9yZUlkID0gdHJhbnNhY3Rpb25EZXRhaWxzUmVzcG9uc2UuZGF0YVtcInN0b3JlSWRcIl07XG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRUcmFuc2FjdGlvbkV2ZW50LmRhdGEudHJhbnNhY3Rpb24uYnJhbmRJZCA9IHRyYW5zYWN0aW9uRGV0YWlsc1Jlc3BvbnNlLmRhdGFbXCJicmFuZElkXCJdO1xuICAgICAgICAgICAgICAgICAgICB1cGRhdGVkVHJhbnNhY3Rpb25FdmVudC5kYXRhLnRyYW5zYWN0aW9uLmxveWFsdHlQcm9ncmFtSWQgPSB0cmFuc2FjdGlvbkRldGFpbHNSZXNwb25zZS5kYXRhW1wibG95YWx0eVByb2dyYW1JZFwiXTtcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlZFRyYW5zYWN0aW9uRXZlbnQuZGF0YS50cmFuc2FjdGlvbi5yb3VuZGluZ1J1bGVJZCA9IHRyYW5zYWN0aW9uRGV0YWlsc1Jlc3BvbnNlLmRhdGFbXCJyb3VuZGluZ1J1bGVJZFwiXSAhPT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgICAgICYmIHRyYW5zYWN0aW9uRGV0YWlsc1Jlc3BvbnNlLmRhdGFbXCJyb3VuZGluZ1J1bGVJZFwiXSAhPT0gbnVsbCA/IHRyYW5zYWN0aW9uRGV0YWlsc1Jlc3BvbnNlLmRhdGFbXCJyb3VuZGluZ1J1bGVJZFwiXSA6ICdOL0EnO1xuICAgICAgICAgICAgICAgICAgICB1cGRhdGVkVHJhbnNhY3Rpb25FdmVudC5kYXRhLnRyYW5zYWN0aW9uLm1lcmNoYW50Q2F0ZWdvcnlDb2RlID0gdHJhbnNhY3Rpb25EZXRhaWxzUmVzcG9uc2UuZGF0YVtcIm1lcmNoYW50Q2F0ZWdvcnlDb2RlXCJdO1xuICAgICAgICAgICAgICAgICAgICB1cGRhdGVkVHJhbnNhY3Rpb25FdmVudC5kYXRhLnRyYW5zYWN0aW9uLmFtb3VudCA9IHRyYW5zYWN0aW9uRGV0YWlsc1Jlc3BvbnNlLmRhdGFbXCJhbW91bnRcIl0gIT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICAmJiB0cmFuc2FjdGlvbkRldGFpbHNSZXNwb25zZS5kYXRhW1wiYW1vdW50XCJdICE9PSBudWxsID8gdHJhbnNhY3Rpb25EZXRhaWxzUmVzcG9uc2UuZGF0YVtcImFtb3VudFwiXSA6IDA7XG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRUcmFuc2FjdGlvbkV2ZW50LmRhdGEudHJhbnNhY3Rpb24ucm91bmRlZEFtb3VudCA9IHRyYW5zYWN0aW9uRGV0YWlsc1Jlc3BvbnNlLmRhdGFbXCJyb3VuZGVkQW1vdW50XCJdICE9PSB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICAgICAgJiYgdHJhbnNhY3Rpb25EZXRhaWxzUmVzcG9uc2UuZGF0YVtcInJvdW5kZWRBbW91bnRcIl0gIT09IG51bGwgPyB0cmFuc2FjdGlvbkRldGFpbHNSZXNwb25zZS5kYXRhW1wicm91bmRlZEFtb3VudFwiXSA6IDA7XG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRUcmFuc2FjdGlvbkV2ZW50LmRhdGEudHJhbnNhY3Rpb24ubWF0Y2hpbmdBbW91bnQgPSB0cmFuc2FjdGlvbkRldGFpbHNSZXNwb25zZS5kYXRhW1wibWF0Y2hpbmdBbW91bnRcIl0gIT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICAmJiB0cmFuc2FjdGlvbkRldGFpbHNSZXNwb25zZS5kYXRhW1wibWF0Y2hpbmdBbW91bnRcIl0gIT09IG51bGwgPyB0cmFuc2FjdGlvbkRldGFpbHNSZXNwb25zZS5kYXRhW1wibWF0Y2hpbmdBbW91bnRcIl0gOiAwO1xuICAgICAgICAgICAgICAgICAgICB1cGRhdGVkVHJhbnNhY3Rpb25FdmVudC5kYXRhLnRyYW5zYWN0aW9uLmNyZWF0ZWQgPSBuZXcgRGF0ZShEYXRlLm5vdygpKS50b0lTT1N0cmluZygpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogdXBkYXRlZFRyYW5zYWN0aW9uRXZlbnRcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBJbnZhbGlkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tICR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSFgO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IucmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGFuZCB0aGUgc2VydmVyIHJlc3BvbmRlZCB3aXRoIGEgc3RhdHVzIGNvZGVcbiAgICAgICAgICAgICAgICAgICAgICogdGhhdCBmYWxscyBvdXQgb2YgdGhlIHJhbmdlIG9mIDJ4eC5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBOb24gMnh4eCByZXNwb25zZSB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gT2xpdmUgQVBJLCB3aXRoIHN0YXR1cyAke2Vycm9yLnJlc3BvbnNlLnN0YXR1c30sIGFuZCByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGVycm9yLnJlc3BvbnNlLmRhdGEpfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gYW55IG90aGVyIHNwZWNpZmljIGVycm9ycyB0byBiZSBmaWx0ZXJlZCBiZWxvd1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVycm9yLnJlcXVlc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGJ1dCBubyByZXNwb25zZSB3YXMgcmVjZWl2ZWRcbiAgICAgICAgICAgICAgICAgICAgICogYGVycm9yLnJlcXVlc3RgIGlzIGFuIGluc3RhbmNlIG9mIFhNTEh0dHBSZXF1ZXN0IGluIHRoZSBicm93c2VyIGFuZCBhbiBpbnN0YW5jZSBvZlxuICAgICAgICAgICAgICAgICAgICAgKiAgaHR0cC5DbGllbnRSZXF1ZXN0IGluIG5vZGUuanMuXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm8gcmVzcG9uc2UgcmVjZWl2ZWQgd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE9saXZlIEFQSSwgZm9yIHJlcXVlc3QgJHtlcnJvci5yZXF1ZXN0fWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU29tZXRoaW5nIGhhcHBlbmVkIGluIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgdGhhdCB0cmlnZ2VyZWQgYW4gRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgc2V0dGluZyB1cCB0aGUgcmVxdWVzdCBmb3IgdGhlICR7ZW5kcG9pbnRJbmZvfSBPbGl2ZSBBUEksICR7KGVycm9yICYmIGVycm9yLm1lc3NhZ2UpICYmIGVycm9yLm1lc3NhZ2V9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBpbml0aWF0aW5nIHRoZSB1cGRhdGVkIHRyYW5zYWN0aW9uIGRldGFpbHMgcmV0cmlldmFsIHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJ9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdXNlZCB0byByZXRyaWV2ZSB0aGUgdHlwZSBvZiBvZmZlciByZWRlbXB0aW9uLCBvYnRhaW5lZCBmcm9tIHRoZSBvZmZlciBvYmplY3QuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gb2ZmZXJJZCB0aGUgaWQgb2YgdGhlIG9mZmVyLCB1c2VkIHRvIHJldHJpZXZlIHRoZSB0eXBlIG9mIHJlZGVtcHRpb24gZm9yLlxuICAgICAqXG4gICAgICogQHJldHVybiBhIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgT2ZmZXJSZWRlbXB0aW9uVHlwZVJlc3BvbnNlfSByZXByZXNlbnRpbmcgdGhlIHJlZGVtcHRpb25cbiAgICAgKiB0eXBlLCBvYnRhaW5lZCBmcm9tIHRoZSBvZmZlciBvYmplY3QuXG4gICAgICovXG4gICAgYXN5bmMgZ2V0T2ZmZXJSZWRlbXB0aW9uVHlwZShvZmZlcklkOiBzdHJpbmcpOiBQcm9taXNlPE9mZmVyUmVkZW1wdGlvblR5cGVSZXNwb25zZT4ge1xuICAgICAgICAvLyBlYXNpbHkgaWRlbnRpZmlhYmxlIEFQSSBlbmRwb2ludCBpbmZvcm1hdGlvblxuICAgICAgICBjb25zdCBlbmRwb2ludEluZm8gPSAnR0VUIC9vZmZlcnMve2lkfSBPbGl2ZSBBUEknO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgQVBJIEtleSBhbmQgQmFzZSBVUkwsIG5lZWRlZCBpbiBvcmRlciB0byBtYWtlIHRoZSBHRVQgb2ZmZXJzIGRldGFpbHMgY2FsbCB0aHJvdWdoIHRoZSBjbGllbnRcbiAgICAgICAgICAgIGNvbnN0IFtvbGl2ZUJhc2VVUkwsIG9saXZlUHVibGljS2V5LCBvbGl2ZVByaXZhdGVLZXldID0gYXdhaXQgc3VwZXIucmV0cmlldmVTZXJ2aWNlQ3JlZGVudGlhbHMoQ29uc3RhbnRzLkFXU1BhaXJDb25zdGFudHMuT0xJVkVfU0VDUkVUX05BTUUpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgd2Ugb2J0YWluZWQgYW55IGludmFsaWQgc2VjcmV0IHZhbHVlcyBmcm9tIHRoZSBjYWxsIGFib3ZlXG4gICAgICAgICAgICBpZiAob2xpdmVCYXNlVVJMID09PSBudWxsIHx8IG9saXZlQmFzZVVSTC5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBvbGl2ZVB1YmxpY0tleSA9PT0gbnVsbCB8fCBvbGl2ZVB1YmxpY0tleS5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBvbGl2ZVByaXZhdGVLZXkgPT09IG51bGwgfHwgb2xpdmVQcml2YXRlS2V5IS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBcIkludmFsaWQgU2VjcmV0cyBvYnRhaW5lZCBmb3IgT2xpdmUgQVBJIGNhbGwhXCI7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEdFVCAvb2ZmZXJzL3tpZH1cbiAgICAgICAgICAgICAqIEBsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm9saXZlbHRkLmNvbS9yZWZlcmVuY2UvZ2V0LW9mZmVyXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogYnVpbGQgdGhlIE9saXZlIEFQSSByZXF1ZXN0IGJvZHkgdG8gYmUgcGFzc2VkIGluLCBhbmQgcGVyZm9ybSBhIEdFVCB0byBpdCB3aXRoIHRoZSBhcHByb3ByaWF0ZSBpbmZvcm1hdGlvblxuICAgICAgICAgICAgICogd2UgaW1wbHkgdGhhdCBpZiB0aGUgQVBJIGRvZXMgbm90IHJlc3BvbmQgaW4gMTUgc2Vjb25kcywgdGhlbiB3ZSBhdXRvbWF0aWNhbGx5IGNhdGNoIHRoYXQsIGFuZCByZXR1cm4gYW5cbiAgICAgICAgICAgICAqIGVycm9yIGZvciBhIGJldHRlciBjdXN0b21lciBleHBlcmllbmNlLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICByZXR1cm4gYXhpb3MuZ2V0KGAke29saXZlQmFzZVVSTH0vb2ZmZXJzLyR7b2ZmZXJJZH1gLCB7XG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAgICAgXCJPbGl2ZS1LZXlcIjogb2xpdmVQcml2YXRlS2V5XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiAxNTAwMCwgLy8gaW4gbWlsbGlzZWNvbmRzIGhlcmVcbiAgICAgICAgICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlOiAnT2xpdmUgQVBJIHRpbWVkIG91dCBhZnRlciAxNTAwMG1zISdcbiAgICAgICAgICAgIH0pLnRoZW4ob2ZmZXJEZXRhaWxzUmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShvZmZlckRldGFpbHNSZXNwb25zZS5kYXRhKX1gKTtcblxuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIGlmIHdlIHJlYWNoZWQgdGhpcywgdGhlbiB3ZSBhc3N1bWUgdGhhdCBhIDJ4eCByZXNwb25zZSBjb2RlIHdhcyByZXR1cm5lZC5cbiAgICAgICAgICAgICAgICAgKiBjaGVjayB0aGUgY29udGVudHMgb2YgdGhlIHJlc3BvbnNlLCBhbmQgYWN0IGFwcHJvcHJpYXRlbHkuXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgaWYgKG9mZmVyRGV0YWlsc1Jlc3BvbnNlLmRhdGEgIT09IHVuZGVmaW5lZCAmJiBvZmZlckRldGFpbHNSZXNwb25zZS5kYXRhW1wicmVkZW1wdGlvblR5cGVcIl0gIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgICAgICAgICBvZmZlckRldGFpbHNSZXNwb25zZS5kYXRhW1wicmVkZW1wdGlvblR5cGVcIl0gIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBvZmZlciBpZCwgb2J0YWluZWQgZnJvbSB0aGUgdHJhbnNhY3Rpb24gZGV0YWlsc1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogb2ZmZXJEZXRhaWxzUmVzcG9uc2UuZGF0YVtcInJlZGVtcHRpb25UeXBlXCJdIGFzIFJlZGVtcHRpb25UeXBlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgSW52YWxpZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UhYCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvclxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvci5yZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYW5kIHRoZSBzZXJ2ZXIgcmVzcG9uZGVkIHdpdGggYSBzdGF0dXMgY29kZVxuICAgICAgICAgICAgICAgICAgICAgKiB0aGF0IGZhbGxzIG91dCBvZiB0aGUgcmFuZ2Ugb2YgMnh4LlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vbiAyeHh4IHJlc3BvbnNlIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBPbGl2ZSBBUEksIHdpdGggc3RhdHVzICR7ZXJyb3IucmVzcG9uc2Uuc3RhdHVzfSwgYW5kIHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZXJyb3IucmVzcG9uc2UuZGF0YSl9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBhbnkgb3RoZXIgc3BlY2lmaWMgZXJyb3JzIHRvIGJlIGZpbHRlcmVkIGJlbG93XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3IucmVxdWVzdCkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYnV0IG5vIHJlc3BvbnNlIHdhcyByZWNlaXZlZFxuICAgICAgICAgICAgICAgICAgICAgKiBgZXJyb3IucmVxdWVzdGAgaXMgYW4gaW5zdGFuY2Ugb2YgWE1MSHR0cFJlcXVlc3QgaW4gdGhlIGJyb3dzZXIgYW5kIGFuIGluc3RhbmNlIG9mXG4gICAgICAgICAgICAgICAgICAgICAqICBodHRwLkNsaWVudFJlcXVlc3QgaW4gbm9kZS5qcy5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBObyByZXNwb25zZSByZWNlaXZlZCB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gT2xpdmUgQVBJLCBmb3IgcmVxdWVzdCAke2Vycm9yLnJlcXVlc3R9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBTb21ldGhpbmcgaGFwcGVuZWQgaW4gc2V0dGluZyB1cCB0aGUgcmVxdWVzdCB0aGF0IHRyaWdnZXJlZCBhbiBFcnJvclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IGZvciB0aGUgJHtlbmRwb2ludEluZm99IE9saXZlIEFQSSwgJHsoZXJyb3IgJiYgZXJyb3IubWVzc2FnZSkgJiYgZXJyb3IubWVzc2FnZX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGluaXRpYXRpbmcgdGhlIG9mZmVyIHJlZGVtcHRpb24gdHlwZSByZXRyaWV2YWwgdGhyb3VnaCAke2VuZHBvaW50SW5mb31gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfSAke2Vycn1gKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB1c2VkIHRvIHJldHJpZXZlIHRoZSBvZmZlciBpZCwgb2J0YWluZWQgZnJvbSBhIHRyYW5zYWN0aW9uIG9iamVjdCwgZ2l2ZW5cbiAgICAgKiBhIHRyYW5zYWN0aW9uIGlkZW50aWZpZXIgKHVzZWQgZm9yIHRyYW5zYWN0aW9uYWwgcHVycG9zZXMpLlxuICAgICAqXG4gICAgICogQHBhcmFtIHRyYW5zYWN0aW9uSWQgdGhlIGlkIG9mIHRoZSB0cmFuc2FjdGlvbiwgdXNlZCB0byByZXRyaWV2ZSB0aGUgb2ZmZXIgaWRcbiAgICAgKiBmcm9tLlxuICAgICAqXG4gICAgICogQHJldHVybiBhIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgT2ZmZXJJZFJlc3BvbnNlfSByZXByZXNlbnRpbmcgdGhlIG9mZmVyIGlkXG4gICAgICogYW5kL29yIHRoZSByZWRlZW1lZCBvZmZlciBpZCwgb2J0YWluZWQgZnJvbSB0aGUgdHJhbnNhY3Rpb24gZGV0YWlscy5cbiAgICAgKi9cbiAgICBhc3luYyBnZXRPZmZlcklkKHRyYW5zYWN0aW9uSWQ6IHN0cmluZyk6IFByb21pc2U8T2ZmZXJJZFJlc3BvbnNlPiB7XG4gICAgICAgIC8vIGVhc2lseSBpZGVudGlmaWFibGUgQVBJIGVuZHBvaW50IGluZm9ybWF0aW9uXG4gICAgICAgIGNvbnN0IGVuZHBvaW50SW5mbyA9ICdHRVQgL3RyYW5zYWN0aW9ucy97aWR9IE9saXZlIEFQSSB1c2VkIGZvciByZXRyaWV2aW5nIG9mZmVyIGlkJztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIEFQSSBLZXkgYW5kIEJhc2UgVVJMLCBuZWVkZWQgaW4gb3JkZXIgdG8gbWFrZSB0aGUgR0VUIHRyYW5zYWN0aW9uIGRldGFpbHMgY2FsbCB0aHJvdWdoIHRoZSBjbGllbnRcbiAgICAgICAgICAgIGNvbnN0IFtvbGl2ZUJhc2VVUkwsIG9saXZlUHVibGljS2V5LCBvbGl2ZVByaXZhdGVLZXldID0gYXdhaXQgc3VwZXIucmV0cmlldmVTZXJ2aWNlQ3JlZGVudGlhbHMoQ29uc3RhbnRzLkFXU1BhaXJDb25zdGFudHMuT0xJVkVfU0VDUkVUX05BTUUpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgd2Ugb2J0YWluZWQgYW55IGludmFsaWQgc2VjcmV0IHZhbHVlcyBmcm9tIHRoZSBjYWxsIGFib3ZlXG4gICAgICAgICAgICBpZiAob2xpdmVCYXNlVVJMID09PSBudWxsIHx8IG9saXZlQmFzZVVSTC5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBvbGl2ZVB1YmxpY0tleSA9PT0gbnVsbCB8fCBvbGl2ZVB1YmxpY0tleS5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBvbGl2ZVByaXZhdGVLZXkgPT09IG51bGwgfHwgb2xpdmVQcml2YXRlS2V5IS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBcIkludmFsaWQgU2VjcmV0cyBvYnRhaW5lZCBmb3IgT2xpdmUgQVBJIGNhbGwhXCI7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEdFVCAvdHJhbnNhY3Rpb25zL3tpZH1cbiAgICAgICAgICAgICAqIEBsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm9saXZlbHRkLmNvbS9yZWZlcmVuY2Uvc2hvdy10cmFuc2FjdGlvbi1kZXRhaWxzXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogYnVpbGQgdGhlIE9saXZlIEFQSSByZXF1ZXN0IGJvZHkgdG8gYmUgcGFzc2VkIGluLCBhbmQgcGVyZm9ybSBhIEdFVCB0byBpdCB3aXRoIHRoZSBhcHByb3ByaWF0ZSBpbmZvcm1hdGlvblxuICAgICAgICAgICAgICogd2UgaW1wbHkgdGhhdCBpZiB0aGUgQVBJIGRvZXMgbm90IHJlc3BvbmQgaW4gMTUgc2Vjb25kcywgdGhlbiB3ZSBhdXRvbWF0aWNhbGx5IGNhdGNoIHRoYXQsIGFuZCByZXR1cm4gYW5cbiAgICAgICAgICAgICAqIGVycm9yIGZvciBhIGJldHRlciBjdXN0b21lciBleHBlcmllbmNlLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICByZXR1cm4gYXhpb3MuZ2V0KGAke29saXZlQmFzZVVSTH0vdHJhbnNhY3Rpb25zLyR7dHJhbnNhY3Rpb25JZH1gLCB7XG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAgICAgXCJPbGl2ZS1LZXlcIjogb2xpdmVQcml2YXRlS2V5XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiAxNTAwMCwgLy8gaW4gbWlsbGlzZWNvbmRzIGhlcmVcbiAgICAgICAgICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlOiAnT2xpdmUgQVBJIHRpbWVkIG91dCBhZnRlciAxNTAwMG1zISdcbiAgICAgICAgICAgIH0pLnRoZW4odHJhbnNhY3Rpb25EZXRhaWxzUmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeSh0cmFuc2FjdGlvbkRldGFpbHNSZXNwb25zZS5kYXRhKX1gKTtcblxuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIGlmIHdlIHJlYWNoZWQgdGhpcywgdGhlbiB3ZSBhc3N1bWUgdGhhdCBhIDJ4eCByZXNwb25zZSBjb2RlIHdhcyByZXR1cm5lZC5cbiAgICAgICAgICAgICAgICAgKiBjaGVjayB0aGUgY29udGVudHMgb2YgdGhlIHJlc3BvbnNlLCBhbmQgYWN0IGFwcHJvcHJpYXRlbHkuXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgaWYgKHRyYW5zYWN0aW9uRGV0YWlsc1Jlc3BvbnNlLmRhdGEgIT09IHVuZGVmaW5lZCAmJiB0cmFuc2FjdGlvbkRldGFpbHNSZXNwb25zZS5kYXRhW1wicmVkZWVtZWRPZmZlcklkXCJdICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25EZXRhaWxzUmVzcG9uc2UuZGF0YVtcInJlZGVlbWVkT2ZmZXJJZFwiXSAhPT0gbnVsbCAmJiB0cmFuc2FjdGlvbkRldGFpbHNSZXNwb25zZS5kYXRhW1wicmV3YXJkXCJdICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25EZXRhaWxzUmVzcG9uc2UuZGF0YVtcInJld2FyZFwiXSAhPT0gbnVsbCAmJiB0cmFuc2FjdGlvbkRldGFpbHNSZXNwb25zZS5kYXRhW1wicmV3YXJkXCJdW1wib2ZmZXJJZFwiXSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uRGV0YWlsc1Jlc3BvbnNlLmRhdGFbXCJyZXdhcmRcIl1bXCJvZmZlcklkXCJdICE9PSBudWxsICYmXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uRGV0YWlsc1Jlc3BvbnNlLmRhdGFbXCJyZWRlZW1lZE9mZmVySWRcIl0gPT09IHRyYW5zYWN0aW9uRGV0YWlsc1Jlc3BvbnNlLmRhdGFbXCJyZXdhcmRcIl1bXCJvZmZlcklkXCJdKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgb2ZmZXIgaWQsIG9idGFpbmVkIGZyb20gdGhlIHRyYW5zYWN0aW9uIGRldGFpbHNcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHRyYW5zYWN0aW9uRGV0YWlsc1Jlc3BvbnNlLmRhdGFbXCJyZWRlZW1lZE9mZmVySWRcIl1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBJbnZhbGlkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tICR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSFgLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yLnJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBhbmQgdGhlIHNlcnZlciByZXNwb25kZWQgd2l0aCBhIHN0YXR1cyBjb2RlXG4gICAgICAgICAgICAgICAgICAgICAqIHRoYXQgZmFsbHMgb3V0IG9mIHRoZSByYW5nZSBvZiAyeHguXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm9uIDJ4eHggcmVzcG9uc2Ugd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE9saXZlIEFQSSwgd2l0aCBzdGF0dXMgJHtlcnJvci5yZXNwb25zZS5zdGF0dXN9LCBhbmQgcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShlcnJvci5yZXNwb25zZS5kYXRhKX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGFueSBvdGhlciBzcGVjaWZpYyBlcnJvcnMgdG8gYmUgZmlsdGVyZWQgYmVsb3dcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5yZXF1ZXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBidXQgbm8gcmVzcG9uc2Ugd2FzIHJlY2VpdmVkXG4gICAgICAgICAgICAgICAgICAgICAqIGBlcnJvci5yZXF1ZXN0YCBpcyBhbiBpbnN0YW5jZSBvZiBYTUxIdHRwUmVxdWVzdCBpbiB0aGUgYnJvd3NlciBhbmQgYW4gaW5zdGFuY2Ugb2ZcbiAgICAgICAgICAgICAgICAgICAgICogIGh0dHAuQ2xpZW50UmVxdWVzdCBpbiBub2RlLmpzLlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vIHJlc3BvbnNlIHJlY2VpdmVkIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBPbGl2ZSBBUEksIGZvciByZXF1ZXN0ICR7ZXJyb3IucmVxdWVzdH1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNvbWV0aGluZyBoYXBwZW5lZCBpbiBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IHRoYXQgdHJpZ2dlcmVkIGFuIEVycm9yXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgZm9yIHRoZSAke2VuZHBvaW50SW5mb30gT2xpdmUgQVBJLCAkeyhlcnJvciAmJiBlcnJvci5tZXNzYWdlKSAmJiBlcnJvci5tZXNzYWdlfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgaW5pdGlhdGluZyB0aGUgb2ZmZXIgSUQgcmV0cmlldmFsIHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJ9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdXNlZCB0byByZXRyaWV2ZSB0aGUgdHJhbnNhY3Rpb24gZGV0YWlscywgZ2l2ZW4gYSB0cmFuc2FjdGlvbiBJRC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB0cmFuc2FjdGlvbiB0aGUgdHJhbnNhY3Rpb24gb2JqZWN0LCBwb3B1bGF0ZWQgYnkgdGhlIGluaXRpYWwgZGV0YWlsc1xuICAgICAqIHBhc3NlZCBpbiBieSBPbGl2ZS4gVGhpcyBvYmplY3Qgd2lsbCBiZSB1c2VkIHRvIHNldCBldmVuIG1vcmUgaW5mb3JtYXRpb24gZm9yXG4gICAgICogaXQsIG9idGFpbmVkIGZyb20gdGhpcyB0cmFuc2FjdGlvbiBkZXRhaWxzIGNhbGwuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIGEge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBUcmFuc2FjdGlvblJlc3BvbnNlfSByZXByZXNlbnRpbmcgdGhlXG4gICAgICogdHJhbnNhY3Rpb24gb2JqZWN0LCBwb3B1bGF0ZWQgd2l0aCB0aGUgYWRkaXRpb25hbCB0cmFuc2FjdGlvbiBkZXRhaWxzIHRoYXRcbiAgICAgKiB3ZSByZXRyaWV2ZWQuXG4gICAgICovXG4gICAgYXN5bmMgZ2V0VHJhbnNhY3Rpb25EZXRhaWxzKHRyYW5zYWN0aW9uOiBUcmFuc2FjdGlvbik6IFByb21pc2U8VHJhbnNhY3Rpb25SZXNwb25zZT4ge1xuICAgICAgICAvLyBlYXNpbHkgaWRlbnRpZmlhYmxlIEFQSSBlbmRwb2ludCBpbmZvcm1hdGlvblxuICAgICAgICBjb25zdCBlbmRwb2ludEluZm8gPSAnR0VUIC90cmFuc2FjdGlvbnMve2lkfSBPbGl2ZSBBUEknO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgQVBJIEtleSBhbmQgQmFzZSBVUkwsIG5lZWRlZCBpbiBvcmRlciB0byBtYWtlIHRoZSBHRVQgdHJhbnNhY3Rpb24gZGV0YWlscyBjYWxsIHRocm91Z2ggdGhlIGNsaWVudFxuICAgICAgICAgICAgY29uc3QgW29saXZlQmFzZVVSTCwgb2xpdmVQdWJsaWNLZXksIG9saXZlUHJpdmF0ZUtleV0gPSBhd2FpdCBzdXBlci5yZXRyaWV2ZVNlcnZpY2VDcmVkZW50aWFscyhDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5PTElWRV9TRUNSRVRfTkFNRSk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB3ZSBvYnRhaW5lZCBhbnkgaW52YWxpZCBzZWNyZXQgdmFsdWVzIGZyb20gdGhlIGNhbGwgYWJvdmVcbiAgICAgICAgICAgIGlmIChvbGl2ZUJhc2VVUkwgPT09IG51bGwgfHwgb2xpdmVCYXNlVVJMLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG9saXZlUHVibGljS2V5ID09PSBudWxsIHx8IG9saXZlUHVibGljS2V5Lmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG9saXZlUHJpdmF0ZUtleSA9PT0gbnVsbCB8fCBvbGl2ZVByaXZhdGVLZXkhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IFwiSW52YWxpZCBTZWNyZXRzIG9idGFpbmVkIGZvciBPbGl2ZSBBUEkgY2FsbCFcIjtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogR0VUIC90cmFuc2FjdGlvbnMve2lkfVxuICAgICAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIub2xpdmVsdGQuY29tL3JlZmVyZW5jZS9zaG93LXRyYW5zYWN0aW9uLWRldGFpbHNcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBidWlsZCB0aGUgT2xpdmUgQVBJIHJlcXVlc3QgYm9keSB0byBiZSBwYXNzZWQgaW4sIGFuZCBwZXJmb3JtIGEgR0VUIHRvIGl0IHdpdGggdGhlIGFwcHJvcHJpYXRlIGluZm9ybWF0aW9uXG4gICAgICAgICAgICAgKiB3ZSBpbXBseSB0aGF0IGlmIHRoZSBBUEkgZG9lcyBub3QgcmVzcG9uZCBpbiAxNSBzZWNvbmRzLCB0aGVuIHdlIGF1dG9tYXRpY2FsbHkgY2F0Y2ggdGhhdCwgYW5kIHJldHVybiBhblxuICAgICAgICAgICAgICogZXJyb3IgZm9yIGEgYmV0dGVyIGN1c3RvbWVyIGV4cGVyaWVuY2UuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHJldHVybiBheGlvcy5nZXQoYCR7b2xpdmVCYXNlVVJMfS90cmFuc2FjdGlvbnMvJHt0cmFuc2FjdGlvbi50cmFuc2FjdGlvbklkfWAsIHtcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgICAgICBcIk9saXZlLUtleVwiOiBvbGl2ZVByaXZhdGVLZXlcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDE1MDAwLCAvLyBpbiBtaWxsaXNlY29uZHMgaGVyZVxuICAgICAgICAgICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2U6ICdPbGl2ZSBBUEkgdGltZWQgb3V0IGFmdGVyIDE1MDAwbXMhJ1xuICAgICAgICAgICAgfSkudGhlbih0cmFuc2FjdGlvbkRldGFpbHNSZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KHRyYW5zYWN0aW9uRGV0YWlsc1Jlc3BvbnNlLmRhdGEpfWApO1xuXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogaWYgd2UgcmVhY2hlZCB0aGlzLCB0aGVuIHdlIGFzc3VtZSB0aGF0IGEgMnh4IHJlc3BvbnNlIGNvZGUgd2FzIHJldHVybmVkLlxuICAgICAgICAgICAgICAgICAqIGNoZWNrIHRoZSBjb250ZW50cyBvZiB0aGUgcmVzcG9uc2UsIGFuZCBhY3QgYXBwcm9wcmlhdGVseS5cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBpZiAodHJhbnNhY3Rpb25EZXRhaWxzUmVzcG9uc2UuZGF0YSAhPT0gdW5kZWZpbmVkICYmIHRyYW5zYWN0aW9uRGV0YWlsc1Jlc3BvbnNlLmRhdGFbXCJwdXJjaGFzZURhdGVUaW1lXCJdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gc2V0IHRoZSB0cmFuc2FjdGlvbiBkZXRhaWxzIGZvciB0aGUgdHJhbnNhY3Rpb24gb2JqZWN0LCBmcm9tIHRoZSByZXNwb25zZSwgYW5kIGNvbnZlcnQgYW55IGluZm9ybWF0aW9uIGFjY29yZGluZ2x5XG4gICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uLnRpbWVzdGFtcCA9IERhdGUucGFyc2UobmV3IERhdGUodHJhbnNhY3Rpb25EZXRhaWxzUmVzcG9uc2UuZGF0YVtcInB1cmNoYXNlRGF0ZVRpbWVcIl0pLnRvSVNPU3RyaW5nKCkpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogdHJhbnNhY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBJbnZhbGlkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tICR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSFgLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yLnJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBhbmQgdGhlIHNlcnZlciByZXNwb25kZWQgd2l0aCBhIHN0YXR1cyBjb2RlXG4gICAgICAgICAgICAgICAgICAgICAqIHRoYXQgZmFsbHMgb3V0IG9mIHRoZSByYW5nZSBvZiAyeHguXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm9uIDJ4eHggcmVzcG9uc2Ugd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE9saXZlIEFQSSwgd2l0aCBzdGF0dXMgJHtlcnJvci5yZXNwb25zZS5zdGF0dXN9LCBhbmQgcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShlcnJvci5yZXNwb25zZS5kYXRhKX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGFueSBvdGhlciBzcGVjaWZpYyBlcnJvcnMgdG8gYmUgZmlsdGVyZWQgYmVsb3dcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5yZXF1ZXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBidXQgbm8gcmVzcG9uc2Ugd2FzIHJlY2VpdmVkXG4gICAgICAgICAgICAgICAgICAgICAqIGBlcnJvci5yZXF1ZXN0YCBpcyBhbiBpbnN0YW5jZSBvZiBYTUxIdHRwUmVxdWVzdCBpbiB0aGUgYnJvd3NlciBhbmQgYW4gaW5zdGFuY2Ugb2ZcbiAgICAgICAgICAgICAgICAgICAgICogIGh0dHAuQ2xpZW50UmVxdWVzdCBpbiBub2RlLmpzLlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vIHJlc3BvbnNlIHJlY2VpdmVkIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBPbGl2ZSBBUEksIGZvciByZXF1ZXN0ICR7ZXJyb3IucmVxdWVzdH1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNvbWV0aGluZyBoYXBwZW5lZCBpbiBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IHRoYXQgdHJpZ2dlcmVkIGFuIEVycm9yXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgZm9yIHRoZSAke2VuZHBvaW50SW5mb30gT2xpdmUgQVBJLCAkeyhlcnJvciAmJiBlcnJvci5tZXNzYWdlKSAmJiBlcnJvci5tZXNzYWdlfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgaW5pdGlhdGluZyB0aGUgdHJhbnNhY3Rpb24gZGV0YWlscyByZXRyaWV2YWwgdGhyb3VnaCAke2VuZHBvaW50SW5mb31gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfSAke2Vycn1gKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB1c2VkIHRvIHVwZGF0ZSBhIHRyYW5zYWN0aW9uIGJ5IHNwZWNpZnlpbmcgdGhlIGFtb3VudCBkaXN0cmlidXRlZCB0byB0aGUgbWVtYmVyXG4gICAgICogZHVyaW5nIGEgY2FzaC1vdXQvcmVpbWJ1cnNlbWVudCwgZ2l2ZW4gaXRzIHRyYW5zYWN0aW9uIElELlxuICAgICAqICh1c2VkIGZvciByZWltYnVyc2VtZW50cy9jYXNoLW91dCBwdXJwb3NlcykuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gdHJhbnNhY3Rpb25JZCB0aGUgaWQgb2YgdGhlIHRyYW5zYWN0aW9uIHRvIGJlIHVwZGF0ZWRcbiAgICAgKiBAcGFyYW0gZGlzdHJpYnV0ZWRUb01lbWJlckFtb3VudCB0aGUgYW1vdW50IGRpc3RyaWJ1dGVkIHRvIHRoZSBtZW1iZXIgZHVyaW5nIHRoZSBjYXNoLW91dC9yZWltYnVyc2VtZW50XG4gICAgICpcbiAgICAgKiBAcmV0dXJuIGEge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBSZWltYnVyc2VtZW50UHJvY2Vzc2luZ1Jlc3BvbnNlfSByZXByZXNlbnRpbmcgYVxuICAgICAqIGZsYWcgaW5kaWNhdGluZyB3aGV0aGVyIHRoZSByZWltYnVyc2VtZW50IHByb2Nlc3MgY2FuIGNvbnRpbnVlIG9yIG5vdC5cbiAgICAgKi9cbiAgICBhc3luYyB1cGRhdGVUcmFuc2FjdGlvblN0YXR1cyh0cmFuc2FjdGlvbklkOiBzdHJpbmcsIGRpc3RyaWJ1dGVkVG9NZW1iZXJBbW91bnQ6IG51bWJlcik6IFByb21pc2U8UmVpbWJ1cnNlbWVudFByb2Nlc3NpbmdSZXNwb25zZT4ge1xuICAgICAgICAvLyBlYXNpbHkgaWRlbnRpZmlhYmxlIEFQSSBlbmRwb2ludCBpbmZvcm1hdGlvblxuICAgICAgICBjb25zdCBlbmRwb2ludEluZm8gPSAnUFVUIHRyYW5zYWN0aW9ucy97aWR9L3Jld2FyZCBPbGl2ZSBBUEknO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgQVBJIEtleSBhbmQgQmFzZSBVUkwsIG5lZWRlZCBpbiBvcmRlciB0byBtYWtlIHRoZSBQVVQgdHJhbnNhY3Rpb24gc3RhdHVzL2Ftb3VudCBjYWxsIHRocm91Z2ggdGhlIGNsaWVudFxuICAgICAgICAgICAgY29uc3QgW29saXZlQmFzZVVSTCwgb2xpdmVQdWJsaWNLZXksIG9saXZlUHJpdmF0ZUtleV0gPSBhd2FpdCBzdXBlci5yZXRyaWV2ZVNlcnZpY2VDcmVkZW50aWFscyhDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5PTElWRV9TRUNSRVRfTkFNRSk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB3ZSBvYnRhaW5lZCBhbnkgaW52YWxpZCBzZWNyZXQgdmFsdWVzIGZyb20gdGhlIGNhbGwgYWJvdmVcbiAgICAgICAgICAgIGlmIChvbGl2ZUJhc2VVUkwgPT09IG51bGwgfHwgb2xpdmVCYXNlVVJMLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG9saXZlUHVibGljS2V5ID09PSBudWxsIHx8IG9saXZlUHVibGljS2V5Lmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG9saXZlUHJpdmF0ZUtleSA9PT0gbnVsbCB8fCBvbGl2ZVByaXZhdGVLZXkhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IFwiSW52YWxpZCBTZWNyZXRzIG9idGFpbmVkIGZvciBPbGl2ZSBBUEkgY2FsbCFcIjtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogUmVpbWJ1cnNlbWVudFByb2Nlc3NpbmdTdGF0dXMuRmFpbGVkLFxuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBSZWltYnVyc2VtZW50c0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFBVVCB0cmFuc2FjdGlvbnMve2lkfS9yZXdhcmRcbiAgICAgICAgICAgICAqIEBsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm9saXZlbHRkLmNvbS9yZWZlcmVuY2UvdXBkYXRlLXJld2FyZC1zdGF0dXNcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBidWlsZCB0aGUgT2xpdmUgQVBJIHJlcXVlc3QgYm9keSB0byBiZSBwYXNzZWQgaW4sIGFuZCBwZXJmb3JtIGEgR0VUIHRvIGl0IHdpdGggdGhlIGFwcHJvcHJpYXRlIGluZm9ybWF0aW9uXG4gICAgICAgICAgICAgKiB3ZSBpbXBseSB0aGF0IGlmIHRoZSBBUEkgZG9lcyBub3QgcmVzcG9uZCBpbiAxNSBzZWNvbmRzLCB0aGVuIHdlIGF1dG9tYXRpY2FsbHkgY2F0Y2ggdGhhdCwgYW5kIHJldHVybiBhblxuICAgICAgICAgICAgICogZXJyb3IgZm9yIGEgYmV0dGVyIGN1c3RvbWVyIGV4cGVyaWVuY2UuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGNvbnN0IHJlcXVlc3REYXRhID0ge1xuICAgICAgICAgICAgICAgIGRpc3RyaWJ1dGVkVG9NZW1iZXJBbW91bnQ6IGRpc3RyaWJ1dGVkVG9NZW1iZXJBbW91bnQudG9GaXhlZCgyKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBPbGl2ZSBBUEkgcmVxdWVzdCBPYmplY3Q6ICR7SlNPTi5zdHJpbmdpZnkocmVxdWVzdERhdGEpfWApO1xuICAgICAgICAgICAgcmV0dXJuIGF4aW9zLnB1dChgJHtvbGl2ZUJhc2VVUkx9L3RyYW5zYWN0aW9ucy8ke3RyYW5zYWN0aW9uSWR9L3Jld2FyZGAsIHJlcXVlc3REYXRhLCB7XG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAgICAgXCJPbGl2ZS1LZXlcIjogb2xpdmVQcml2YXRlS2V5XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiAxNTAwMCwgLy8gaW4gbWlsbGlzZWNvbmRzIGhlcmVcbiAgICAgICAgICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlOiAnT2xpdmUgQVBJIHRpbWVkIG91dCBhZnRlciAxNTAwMG1zISdcbiAgICAgICAgICAgIH0pLnRoZW4odXBkYXRlUmV3YXJkU3RhdHVzUmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeSh1cGRhdGVSZXdhcmRTdGF0dXNSZXNwb25zZS5kYXRhKX1gKTtcblxuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIGlmIHdlIHJlYWNoZWQgdGhpcywgdGhlbiB3ZSBhc3N1bWUgdGhhdCBhIDJ4eCByZXNwb25zZSBjb2RlIHdhcyByZXR1cm5lZC5cbiAgICAgICAgICAgICAgICAgKiBmb3IgdGhpcyBBUEksIHdlIGtub3cgdGhhdCBpZiB3ZSByZXR1cm4gYSAyMDQsIHRoZW4gdGhlIHJld2FyZCBzdGF0dXMgaGFzIGJlZW4gdXBkYXRlZC5cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBpZiAodXBkYXRlUmV3YXJkU3RhdHVzUmVzcG9uc2Uuc3RhdHVzID09PSAyMDQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIGEgZmxhZyBpbmRpY2F0aW5nIHRoYXQgdGhlIHJlaW1idXJzZW1lbnQgcHJvY2VzcyBtYXkgY29udGludWUgYWNjb3JkaW5nbHlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IFJlaW1idXJzZW1lbnRQcm9jZXNzaW5nU3RhdHVzLlN1Y2Nlc3NcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBSZWltYnVyc2VtZW50UHJvY2Vzc2luZ1N0YXR1cy5GYWlsZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBJbnZhbGlkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tICR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSFgLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBSZWltYnVyc2VtZW50c0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IucmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGFuZCB0aGUgc2VydmVyIHJlc3BvbmRlZCB3aXRoIGEgc3RhdHVzIGNvZGVcbiAgICAgICAgICAgICAgICAgICAgICogdGhhdCBmYWxscyBvdXQgb2YgdGhlIHJhbmdlIG9mIDJ4eC5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBOb24gMnh4eCByZXNwb25zZSB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gT2xpdmUgQVBJLCB3aXRoIHN0YXR1cyAke2Vycm9yLnJlc3BvbnNlLnN0YXR1c30sIGFuZCByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGVycm9yLnJlc3BvbnNlLmRhdGEpfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gYW55IG90aGVyIHNwZWNpZmljIGVycm9ycyB0byBiZSBmaWx0ZXJlZCBiZWxvd1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogUmVpbWJ1cnNlbWVudFByb2Nlc3NpbmdTdGF0dXMuRmFpbGVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFJlaW1idXJzZW1lbnRzRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3IucmVxdWVzdCkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYnV0IG5vIHJlc3BvbnNlIHdhcyByZWNlaXZlZFxuICAgICAgICAgICAgICAgICAgICAgKiBgZXJyb3IucmVxdWVzdGAgaXMgYW4gaW5zdGFuY2Ugb2YgWE1MSHR0cFJlcXVlc3QgaW4gdGhlIGJyb3dzZXIgYW5kIGFuIGluc3RhbmNlIG9mXG4gICAgICAgICAgICAgICAgICAgICAqICBodHRwLkNsaWVudFJlcXVlc3QgaW4gbm9kZS5qcy5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBObyByZXNwb25zZSByZWNlaXZlZCB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gT2xpdmUgQVBJLCBmb3IgcmVxdWVzdCAke2Vycm9yLnJlcXVlc3R9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogUmVpbWJ1cnNlbWVudFByb2Nlc3NpbmdTdGF0dXMuRmFpbGVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFJlaW1idXJzZW1lbnRzRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNvbWV0aGluZyBoYXBwZW5lZCBpbiBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IHRoYXQgdHJpZ2dlcmVkIGFuIEVycm9yXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgZm9yIHRoZSAke2VuZHBvaW50SW5mb30gT2xpdmUgQVBJLCAkeyhlcnJvciAmJiBlcnJvci5tZXNzYWdlKSAmJiBlcnJvci5tZXNzYWdlfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IFJlaW1idXJzZW1lbnRQcm9jZXNzaW5nU3RhdHVzLkZhaWxlZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBSZWltYnVyc2VtZW50c0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBpbml0aWF0aW5nIHRoZSB0cmFuc2FjdGlvbiByZXdhcmQgc3RhdHVzIHVwZGF0ZSB0aHJvdWdoICR7ZW5kcG9pbnRJbmZvfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9ICR7ZXJyfWApO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRhdGE6IFJlaW1idXJzZW1lbnRQcm9jZXNzaW5nU3RhdHVzLkZhaWxlZCxcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFJlaW1idXJzZW1lbnRzRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHVzZWQgdG8gc2VhcmNoIGFuIG9mZmVyLCBnaXZlbiBjZXJ0YWluIGZpbHRlcnMgdG8gYmUgcGFzc2VkIGluLlxuICAgICAqXG4gICAgICogQHBhcmFtIHNlYXJjaE9mZmVyc0lucHV0IHRoZSBvZmZlcnMgaW5wdXQsIGNvbnRhaW5pbmcgdGhlIGZpbHRlcmluZyBpbmZvcm1hdGlvblxuICAgICAqIHVzZWQgdG8gc2VhcmNoIGFueSBhcHBsaWNhYmxlL21hdGNoaW5nIG9mZmVycy5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIGEge0BsaW5rIE9mZmVyc1Jlc3BvbnNlfSByZXByZXNlbnRpbmcgdGhlIG1hdGNoZWQgb2ZmZXJzJyBpbmZvcm1hdGlvbi5cbiAgICAgKi9cbiAgICBhc3luYyBzZWFyY2hPZmZlcnMoc2VhcmNoT2ZmZXJzSW5wdXQ6IFNlYXJjaE9mZmVyc0lucHV0KTogUHJvbWlzZTxPZmZlcnNSZXNwb25zZT4ge1xuICAgICAgICAvLyBlYXNpbHkgaWRlbnRpZmlhYmxlIEFQSSBlbmRwb2ludCBpbmZvcm1hdGlvblxuICAgICAgICBjb25zdCBlbmRwb2ludEluZm8gPSAnR0VUIC9vZmZlcnMgT2xpdmUgQVBJIGZvciBzZWFyY2hpbmcgb2ZmZXJzJztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIEFQSSBLZXkgYW5kIEJhc2UgVVJMLCBuZWVkZWQgaW4gb3JkZXIgdG8gbWFrZSB0aGUgR0VUIG9mZmVycyBjYWxsIHRocm91Z2ggdGhlIGNsaWVudFxuICAgICAgICAgICAgY29uc3QgW29saXZlQmFzZVVSTCwgb2xpdmVQdWJsaWNLZXksIG9saXZlUHJpdmF0ZUtleSxcbiAgICAgICAgICAgICAgICBtb29uYmVhbURlZmF1bHRMb3lhbHR5LCBtb29uYmVhbUZpZGVsaXNEZWZhdWx0TG95YWx0eSwgbW9vbmJlYW1PbmxpbmVMb3lhbHR5LFxuICAgICAgICAgICAgICAgIG1vb25iZWFtUHJlbWllck9ubGluZUxveWFsdHksIG1vb25iZWFtUHJlbWllck5lYXJieUxveWFsdHksIG1vb25iZWFtVmV0ZXJhbnNEYXlMb3lhbHR5LFxuICAgICAgICAgICAgICAgIG1vb25iZWFtQ2xpY2tMb3lhbHR5LCBtb29uYmVhbVByZW1pZXJDbGlja0xveWFsdHldID1cbiAgICAgICAgICAgICAgICBhd2FpdCBzdXBlci5yZXRyaWV2ZVNlcnZpY2VDcmVkZW50aWFscyhcbiAgICAgICAgICAgICAgICAgICAgQ29uc3RhbnRzLkFXU1BhaXJDb25zdGFudHMuT0xJVkVfU0VDUkVUX05BTUUsXG4gICAgICAgICAgICAgICAgICAgIHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICB0cnVlKTtcblxuICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHdlIG9idGFpbmVkIGFueSBpbnZhbGlkIHNlY3JldCB2YWx1ZXMgZnJvbSB0aGUgY2FsbCBhYm92ZVxuICAgICAgICAgICAgaWYgKG9saXZlQmFzZVVSTCA9PT0gbnVsbCB8fCBvbGl2ZUJhc2VVUkwubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgb2xpdmVQdWJsaWNLZXkgPT09IG51bGwgfHwgb2xpdmVQdWJsaWNLZXkubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgb2xpdmVQcml2YXRlS2V5ID09PSBudWxsIHx8IG9saXZlUHJpdmF0ZUtleSEubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgbW9vbmJlYW1EZWZhdWx0TG95YWx0eSA9PT0gbnVsbCB8fCBtb29uYmVhbURlZmF1bHRMb3lhbHR5IS5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBtb29uYmVhbUZpZGVsaXNEZWZhdWx0TG95YWx0eSA9PT0gbnVsbCB8fCBtb29uYmVhbUZpZGVsaXNEZWZhdWx0TG95YWx0eSEubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgbW9vbmJlYW1PbmxpbmVMb3lhbHR5ID09PSBudWxsIHx8IG1vb25iZWFtT25saW5lTG95YWx0eSEubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgbW9vbmJlYW1WZXRlcmFuc0RheUxveWFsdHkgPT09IG51bGwgfHwgbW9vbmJlYW1WZXRlcmFuc0RheUxveWFsdHkhLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG1vb25iZWFtQ2xpY2tMb3lhbHR5ID09PSBudWxsIHx8IG1vb25iZWFtQ2xpY2tMb3lhbHR5IS5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBtb29uYmVhbVByZW1pZXJDbGlja0xveWFsdHkgPT09IG51bGwgfHwgbW9vbmJlYW1QcmVtaWVyQ2xpY2tMb3lhbHR5IS5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBtb29uYmVhbVByZW1pZXJPbmxpbmVMb3lhbHR5ID09PSBudWxsIHx8IG1vb25iZWFtUHJlbWllck9ubGluZUxveWFsdHkhLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG1vb25iZWFtUHJlbWllck5lYXJieUxveWFsdHkgPT09IG51bGwgfHwgbW9vbmJlYW1QcmVtaWVyTmVhcmJ5TG95YWx0eSEubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gXCJJbnZhbGlkIFNlY3JldHMgb2J0YWluZWQgZm9yIE9saXZlIEFQSSBjYWxsIVwiO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBPZmZlcnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBHRVQgL29mZmVyc1xuICAgICAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIub2xpdmVsdGQuY29tL3JlZmVyZW5jZS9saXN0LW9mZmVyc1xuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIGJ1aWxkIHRoZSBPbGl2ZSBBUEkgcmVxdWVzdCBwYXJhbXMgdG8gYmUgcGFzc2VkIGluLCBhbmQgcGVyZm9ybSBhIEdFVCB0byBpdCB3aXRoIHRoZSBhcHByb3ByaWF0ZSBpbmZvcm1hdGlvblxuICAgICAgICAgICAgICogd2UgaW1wbHkgdGhhdCBpZiB0aGUgQVBJIGRvZXMgbm90IHJlc3BvbmQgaW4gMTUgc2Vjb25kcywgdGhlbiB3ZSBhdXRvbWF0aWNhbGx5IGNhdGNoIHRoYXQsIGFuZCByZXR1cm4gYW5cbiAgICAgICAgICAgICAqIGVycm9yIGZvciBhIGJldHRlciBjdXN0b21lciBleHBlcmllbmNlLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBsZXQgcmVxdWVzdFVSTCA9IGAke29saXZlQmFzZVVSTH0vb2ZmZXJzYDtcbiAgICAgICAgICAgIC8vIHRoZSBsb3lhbHR5IHByb2dyYW0gaWQgaXMgZGVmYXVsdGVkIHRvIHRoZSBkZWZhdWx0IGxveWFsdHkgcHJvZ3JhbVxuICAgICAgICAgICAgY29uc3QgZGVmYXVsdExveWFsdHlQcm9ncmFtSWQ6IHN0cmluZyB8IHVuZGVmaW5lZCA9IG1vb25iZWFtRGVmYXVsdExveWFsdHk7XG4gICAgICAgICAgICAvLyBidWlsZCB0aGUgc2VhcmNoIG9mZmVycyBVUkxcbiAgICAgICAgICAgIHJlcXVlc3RVUkwgKz0gYD9sb3lhbHR5UHJvZ3JhbUlkPSR7ZGVmYXVsdExveWFsdHlQcm9ncmFtSWR9JmNvdW50cnlDb2RlPVVTJnBhZ2VTaXplPTEwMDAmcGFnZU51bWJlcj0xJm9mZmVyU3RhdGVzPWFjdGl2ZSZvZmZlclN0YXRlcz1zY2hlZHVsZWRgO1xuICAgICAgICAgICAgcmVxdWVzdFVSTCArPSAoc2VhcmNoT2ZmZXJzSW5wdXQucmFkaXVzICYmIHNlYXJjaE9mZmVyc0lucHV0LnJhZGl1c0xhdGl0dWRlICYmIHNlYXJjaE9mZmVyc0lucHV0LnJhZGl1c0xvbmdpdHVkZSlcbiAgICAgICAgICAgICAgICA/IGAmcmFkaXVzTGF0aXR1ZGU9JHtzZWFyY2hPZmZlcnNJbnB1dC5yYWRpdXNMYXRpdHVkZSF9JnJhZGl1c0xvbmdpdHVkZT0ke3NlYXJjaE9mZmVyc0lucHV0LnJhZGl1c0xvbmdpdHVkZSF9JnJhZGl1cz0ke3NlYXJjaE9mZmVyc0lucHV0LnJhZGl1cyF9YFxuICAgICAgICAgICAgICAgIDogYGA7XG4gICAgICAgICAgICByZXF1ZXN0VVJMICs9IGAmc2VhcmNoPVxcXCIke2VuY29kZVVSSUNvbXBvbmVudChzZWFyY2hPZmZlcnNJbnB1dC5zZWFyY2hUZXh0KX1cXFwiYDtcbiAgICAgICAgICAgIC8vIGxvZyB0aGUgcmVxdWVzdCBVUkwsIHNpbmNlIHdlIGFyZSBkb2luZyBhIGxvdCBvZiBmaWx0ZXJpbmcsIGZvciBzYW5pdHkgcHVycG9zZXNcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBSZXF1ZXN0IFVSTCBmb3IgT2xpdmUgJHtyZXF1ZXN0VVJMfWApO1xuICAgICAgICAgICAgcmV0dXJuIGF4aW9zLmdldChyZXF1ZXN0VVJMLCB7XG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAgICAgXCJPbGl2ZS1LZXlcIjogb2xpdmVQcml2YXRlS2V5XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiAyNTAwMCwgLy8gaW4gbWlsbGlzZWNvbmRzIGhlcmVcbiAgICAgICAgICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlOiAnT2xpdmUgQVBJIHRpbWVkIG91dCBhZnRlciAyNTAwMG1zISdcbiAgICAgICAgICAgIH0pLnRoZW4oYXN5bmMgZ2V0T2ZmZXJzUmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIGlmIHdlIHJlYWNoZWQgdGhpcywgdGhlbiB3ZSBhc3N1bWUgdGhhdCBhIDJ4eCByZXNwb25zZSBjb2RlIHdhcyByZXR1cm5lZC5cbiAgICAgICAgICAgICAgICAgKiBjaGVjayB0aGUgY29udGVudHMgb2YgdGhlIHJlc3BvbnNlLCBhbmQgYWN0IGFwcHJvcHJpYXRlbHkuXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgaWYgKGdldE9mZmVyc1Jlc3BvbnNlLmRhdGEgIT09IHVuZGVmaW5lZCAmJiBnZXRPZmZlcnNSZXNwb25zZS5kYXRhW1widG90YWxOdW1iZXJPZlBhZ2VzXCJdICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgZ2V0T2ZmZXJzUmVzcG9uc2UuZGF0YVtcInRvdGFsTnVtYmVyT2ZSZWNvcmRzXCJdICE9PSB1bmRlZmluZWQgJiYgZ2V0T2ZmZXJzUmVzcG9uc2UuZGF0YVtcIml0ZW1zXCJdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBhcnJheSBvZiBvZmZlciBpdGVtcyBhY2NvcmRpbmdseVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9mZmVyczogZ2V0T2ZmZXJzUmVzcG9uc2UuZGF0YVtcIml0ZW1zXCJdIGFzIE9mZmVyW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxOdW1iZXJPZlBhZ2VzOiBnZXRPZmZlcnNSZXNwb25zZS5kYXRhW1widG90YWxOdW1iZXJPZlBhZ2VzXCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsTnVtYmVyT2ZSZWNvcmRzOiBnZXRPZmZlcnNSZXNwb25zZS5kYXRhW1widG90YWxOdW1iZXJPZlJlY29yZHNcIl1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBJbnZhbGlkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tICR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGdldE9mZmVyc1Jlc3BvbnNlKX0hYCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogT2ZmZXJzRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvclxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvci5yZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYW5kIHRoZSBzZXJ2ZXIgcmVzcG9uZGVkIHdpdGggYSBzdGF0dXMgY29kZVxuICAgICAgICAgICAgICAgICAgICAgKiB0aGF0IGZhbGxzIG91dCBvZiB0aGUgcmFuZ2Ugb2YgMnh4LlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vbiAyeHh4IHJlc3BvbnNlIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBPbGl2ZSBBUEksIHdpdGggc3RhdHVzICR7ZXJyb3IucmVzcG9uc2Uuc3RhdHVzfSwgYW5kIHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZXJyb3IucmVzcG9uc2UuZGF0YSl9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBhbnkgb3RoZXIgc3BlY2lmaWMgZXJyb3JzIHRvIGJlIGZpbHRlcmVkIGJlbG93XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogT2ZmZXJzRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3IucmVxdWVzdCkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYnV0IG5vIHJlc3BvbnNlIHdhcyByZWNlaXZlZFxuICAgICAgICAgICAgICAgICAgICAgKiBgZXJyb3IucmVxdWVzdGAgaXMgYW4gaW5zdGFuY2Ugb2YgWE1MSHR0cFJlcXVlc3QgaW4gdGhlIGJyb3dzZXIgYW5kIGFuIGluc3RhbmNlIG9mXG4gICAgICAgICAgICAgICAgICAgICAqICBodHRwLkNsaWVudFJlcXVlc3QgaW4gbm9kZS5qcy5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBObyByZXNwb25zZSByZWNlaXZlZCB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gT2xpdmUgQVBJLCBmb3IgcmVxdWVzdCAke2Vycm9yLnJlcXVlc3R9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE9mZmVyc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBTb21ldGhpbmcgaGFwcGVuZWQgaW4gc2V0dGluZyB1cCB0aGUgcmVxdWVzdCB0aGF0IHRyaWdnZXJlZCBhbiBFcnJvclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IGZvciB0aGUgJHtlbmRwb2ludEluZm99IE9saXZlIEFQSSwgJHsoZXJyb3IgJiYgZXJyb3IubWVzc2FnZSkgJiYgZXJyb3IubWVzc2FnZX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogT2ZmZXJzRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGluaXRpYXRpbmcgdGhlIG9mZmVycyByZXRyaWV2YWwgdGhyb3VnaCAke2VuZHBvaW50SW5mb31gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfSAke2Vycn1gKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE9mZmVyc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB1c2VkIHRvIGdldCBhbGwgdGhlIG9mZmVycywgZ2l2ZW4gY2VydGFpbiBmaWx0ZXJzIHRvIGJlIHBhc3NlZCBpbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBnZXRPZmZlcnNJbnB1dCB0aGUgb2ZmZXJzIGlucHV0LCBjb250YWluaW5nIHRoZSBmaWx0ZXJpbmcgaW5mb3JtYXRpb25cbiAgICAgKiB1c2VkIHRvIHJldHJpZXZlIGFsbCB0aGUgYXBwbGljYWJsZS9tYXRjaGluZyBvZmZlcnMuXG4gICAgICogQHBhcmFtIG51bWJlck9mUmV0cmllcyB0aGlzIG9wdGlvbmFsIHBhcmFtIGlzIGFwcGxpZWQgaW4gZXh0cmVtZSBjaXJjdW1zdGFuY2VzLFxuICAgICAqIHdoZW4gdGhlIG51bWJlciBvZiByZWNvcmRzIHJldHVybmVkIGRvZXMgbm90IG1hdGNoIHRvIHRoZSBudW1iZXIgb2YgcmVjb3JkcyBwYXJhbWV0ZXIuXG4gICAgICogQHBhcmFtIHBhZ2VOdW1iZXIgdGhpcyBvcHRpb25hbCBwYXJhbSBpcyBhcHBsaWVkIGluIGV4dHJlbWUgY2lyY3Vtc3RhbmNlcyxcbiAgICAgKiB3aGVuIHRoZSBudW1iZXIgb2YgcmVjb3JkcyByZXR1cm5lZCBkb2VzIG5vdCBtYXRjaCB0byB0aGUgbnVtYmVyIG9mIHJlY29yZHMgcGFyYW1ldGVyLFxuICAgICAqIGFuZCB3ZSBuZWVkIHRvIGRlY3JlYXNlIHRoZSBwYWdlIG51bWJlciBmb3JjZWZ1bGx5LlxuICAgICAqXG4gICAgICogQHJldHVybnMgYSB7QGxpbmsgT2ZmZXJzUmVzcG9uc2V9IHJlcHJlc2VudGluZyB0aGUgbWF0Y2hlZCBvZmZlcnMnIGluZm9ybWF0aW9uLlxuICAgICAqL1xuICAgIGFzeW5jIGdldE9mZmVycyhnZXRPZmZlcnNJbnB1dDogR2V0T2ZmZXJzSW5wdXQsIG51bWJlck9mUmV0cmllcz86IG51bWJlciwgcGFnZU51bWJlcj86IG51bWJlcik6IFByb21pc2U8T2ZmZXJzUmVzcG9uc2U+IHtcbiAgICAgICAgLy8gZWFzaWx5IGlkZW50aWZpYWJsZSBBUEkgZW5kcG9pbnQgaW5mb3JtYXRpb25cbiAgICAgICAgY29uc3QgZW5kcG9pbnRJbmZvID0gJ0dFVCAvb2ZmZXJzIE9saXZlIEFQSSc7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBBUEkgS2V5IGFuZCBCYXNlIFVSTCwgbmVlZGVkIGluIG9yZGVyIHRvIG1ha2UgdGhlIEdFVCBvZmZlcnMgY2FsbCB0aHJvdWdoIHRoZSBjbGllbnRcbiAgICAgICAgICAgIGNvbnN0IFtvbGl2ZUJhc2VVUkwsIG9saXZlUHVibGljS2V5LCBvbGl2ZVByaXZhdGVLZXksXG4gICAgICAgICAgICAgICAgbW9vbmJlYW1EZWZhdWx0TG95YWx0eSwgbW9vbmJlYW1GaWRlbGlzRGVmYXVsdExveWFsdHksIG1vb25iZWFtT25saW5lTG95YWx0eSxcbiAgICAgICAgICAgICAgICBtb29uYmVhbVByZW1pZXJPbmxpbmVMb3lhbHR5LCBtb29uYmVhbVByZW1pZXJOZWFyYnlMb3lhbHR5LCBtb29uYmVhbVZldGVyYW5zRGF5TG95YWx0eSxcbiAgICAgICAgICAgICAgICBtb29uYmVhbUNsaWNrTG95YWx0eSwgbW9vbmJlYW1QcmVtaWVyQ2xpY2tMb3lhbHR5XSA9XG4gICAgICAgICAgICAgICAgYXdhaXQgc3VwZXIucmV0cmlldmVTZXJ2aWNlQ3JlZGVudGlhbHMoXG4gICAgICAgICAgICAgICAgICAgIENvbnN0YW50cy5BV1NQYWlyQ29uc3RhbnRzLk9MSVZFX1NFQ1JFVF9OQU1FLFxuICAgICAgICAgICAgICAgICAgICB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgIHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgdHJ1ZSk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB3ZSBvYnRhaW5lZCBhbnkgaW52YWxpZCBzZWNyZXQgdmFsdWVzIGZyb20gdGhlIGNhbGwgYWJvdmVcbiAgICAgICAgICAgIGlmIChvbGl2ZUJhc2VVUkwgPT09IG51bGwgfHwgb2xpdmVCYXNlVVJMLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG9saXZlUHVibGljS2V5ID09PSBudWxsIHx8IG9saXZlUHVibGljS2V5Lmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG9saXZlUHJpdmF0ZUtleSA9PT0gbnVsbCB8fCBvbGl2ZVByaXZhdGVLZXkhLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG1vb25iZWFtRGVmYXVsdExveWFsdHkgPT09IG51bGwgfHwgbW9vbmJlYW1EZWZhdWx0TG95YWx0eSEubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgbW9vbmJlYW1GaWRlbGlzRGVmYXVsdExveWFsdHkgPT09IG51bGwgfHwgbW9vbmJlYW1GaWRlbGlzRGVmYXVsdExveWFsdHkhLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG1vb25iZWFtT25saW5lTG95YWx0eSA9PT0gbnVsbCB8fCBtb29uYmVhbU9ubGluZUxveWFsdHkhLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG1vb25iZWFtVmV0ZXJhbnNEYXlMb3lhbHR5ID09PSBudWxsIHx8IG1vb25iZWFtVmV0ZXJhbnNEYXlMb3lhbHR5IS5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBtb29uYmVhbUNsaWNrTG95YWx0eSA9PT0gbnVsbCB8fCBtb29uYmVhbUNsaWNrTG95YWx0eSEubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgbW9vbmJlYW1QcmVtaWVyQ2xpY2tMb3lhbHR5ID09PSBudWxsIHx8IG1vb25iZWFtUHJlbWllckNsaWNrTG95YWx0eSEubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgbW9vbmJlYW1QcmVtaWVyT25saW5lTG95YWx0eSA9PT0gbnVsbCB8fCBtb29uYmVhbVByZW1pZXJPbmxpbmVMb3lhbHR5IS5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBtb29uYmVhbVByZW1pZXJOZWFyYnlMb3lhbHR5ID09PSBudWxsIHx8IG1vb25iZWFtUHJlbWllck5lYXJieUxveWFsdHkhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IFwiSW52YWxpZCBTZWNyZXRzIG9idGFpbmVkIGZvciBPbGl2ZSBBUEkgY2FsbCFcIjtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogT2ZmZXJzRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogR0VUIC9vZmZlcnNcbiAgICAgICAgICAgICAqIEBsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm9saXZlbHRkLmNvbS9yZWZlcmVuY2UvbGlzdC1vZmZlcnNcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBidWlsZCB0aGUgT2xpdmUgQVBJIHJlcXVlc3QgcGFyYW1zIHRvIGJlIHBhc3NlZCBpbiwgYW5kIHBlcmZvcm0gYSBHRVQgdG8gaXQgd2l0aCB0aGUgYXBwcm9wcmlhdGUgaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAqIHdlIGltcGx5IHRoYXQgaWYgdGhlIEFQSSBkb2VzIG5vdCByZXNwb25kIGluIDE1IHNlY29uZHMsIHRoZW4gd2UgYXV0b21hdGljYWxseSBjYXRjaCB0aGF0LCBhbmQgcmV0dXJuIGFuXG4gICAgICAgICAgICAgKiBlcnJvciBmb3IgYSBiZXR0ZXIgY3VzdG9tZXIgZXhwZXJpZW5jZS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgbGV0IHJlcXVlc3RVUkwgPSBgJHtvbGl2ZUJhc2VVUkx9L29mZmVyc2A7XG4gICAgICAgICAgICAvLyBzd2l0Y2ggdGhlIGxveWFsdHkgcHJvZ3JhbSBpZCBhY2NvcmRpbmcgdG8gdGhlIGZpbHRlciBwYXNzZWQgaW5cbiAgICAgICAgICAgIGxldCBsb3lhbHR5UHJvZ3JhbUlkOiBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkID0gJ05BJztcbiAgICAgICAgICAgIHN3aXRjaCAoZ2V0T2ZmZXJzSW5wdXQuZmlsdGVyVHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgT2ZmZXJGaWx0ZXIuRmlkZWxpczpcbiAgICAgICAgICAgICAgICAgICAgbG95YWx0eVByb2dyYW1JZCA9IG1vb25iZWFtRmlkZWxpc0RlZmF1bHRMb3lhbHR5O1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIE9mZmVyRmlsdGVyLkNhdGVnb3JpemVkTmVhcmJ5OlxuICAgICAgICAgICAgICAgIGNhc2UgT2ZmZXJGaWx0ZXIuTmVhcmJ5OlxuICAgICAgICAgICAgICAgICAgICBsb3lhbHR5UHJvZ3JhbUlkID0gbW9vbmJlYW1EZWZhdWx0TG95YWx0eTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBPZmZlckZpbHRlci5DYXRlZ29yaXplZE9ubGluZTpcbiAgICAgICAgICAgICAgICBjYXNlIE9mZmVyRmlsdGVyLk9ubGluZTpcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgdGhlIHJlZGVtcHRpb24gdHlwZSBpcyBjbGljaywgdGhlbiB3ZSBnbyB0byB0aGUgZGVmYXVsdCBwcm9ncmFtIGZvciB0aGUgYWZmaWxpYXRlIG5ldHdvcmtzXG4gICAgICAgICAgICAgICAgICAgIGlmIChnZXRPZmZlcnNJbnB1dC5yZWRlbXB0aW9uVHlwZSA9PT0gUmVkZW1wdGlvblR5cGUuQ2xpY2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxveWFsdHlQcm9ncmFtSWQgPSBtb29uYmVhbUNsaWNrTG95YWx0eTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxveWFsdHlQcm9ncmFtSWQgPSBtb29uYmVhbU9ubGluZUxveWFsdHk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBPZmZlckZpbHRlci5QcmVtaWVyT25saW5lOlxuICAgICAgICAgICAgICAgICAgICAvLyBpZiB0aGUgcmVkZW1wdGlvbiB0eXBlIGlzIGNsaWNrLCB0aGVuIHdlIGdvIHRvIHRoZSBkZWZhdWx0IHByb2dyYW0gZm9yIHRoZSBhZmZpbGlhdGUgbmV0d29ya3NcbiAgICAgICAgICAgICAgICAgICAgaWYgKGdldE9mZmVyc0lucHV0LnJlZGVtcHRpb25UeXBlID09PSBSZWRlbXB0aW9uVHlwZS5DbGljaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG95YWx0eVByb2dyYW1JZCA9IG1vb25iZWFtUHJlbWllckNsaWNrTG95YWx0eTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxveWFsdHlQcm9ncmFtSWQgPSBtb29uYmVhbVByZW1pZXJPbmxpbmVMb3lhbHR5O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgT2ZmZXJGaWx0ZXIuUHJlbWllck5lYXJieTpcbiAgICAgICAgICAgICAgICAgICAgbG95YWx0eVByb2dyYW1JZCA9IG1vb25iZWFtUHJlbWllck5lYXJieUxveWFsdHk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgT2ZmZXJGaWx0ZXIuVmV0ZXJhbnNEYXk6XG4gICAgICAgICAgICAgICAgICAgIGxveWFsdHlQcm9ncmFtSWQgPSBtb29uYmVhbVZldGVyYW5zRGF5TG95YWx0eTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBPZmZlckZpbHRlci5TZWFzb25hbE9ubGluZTpcbiAgICAgICAgICAgICAgICBjYXNlIE9mZmVyRmlsdGVyLlNlYXNvbmFsTmVhcmJ5OlxuICAgICAgICAgICAgICAgICAgICBsb3lhbHR5UHJvZ3JhbUlkID1cbiAgICAgICAgICAgICAgICAgICAgICAgIGdldE9mZmVyc0lucHV0Lm9mZmVyU2Vhc29uYWxUeXBlID09PSBPZmZlclNlYXNvbmFsVHlwZS5WZXRlcmFuc0RheVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gbW9vbmJlYW1WZXRlcmFuc0RheUxveWFsdHlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6ICcnO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgVW5rbm93biBvZmZlciBmaWx0ZXIgcGFzc2VkIGluICR7Z2V0T2ZmZXJzSW5wdXQuZmlsdGVyVHlwZX0gcmVzdWx0aW5nIGluIGludmFsaWQgbG95YWx0eSBwcm9ncmFtIGlkIWApO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlcXVlc3RVUkwgKz0gYD9sb3lhbHR5UHJvZ3JhbUlkPSR7bG95YWx0eVByb2dyYW1JZH1gO1xuICAgICAgICAgICAgLy8gT2xpdmUgZGVwcmVjYXRlZCB0aGUgYHJlZGVtcHRpb25UeXBlPWFsbGAgYW5kIHJlcGxhY2VkIGl0IHdpdGggaXRzIHJlbW92YWxcbiAgICAgICAgICAgIHJlcXVlc3RVUkwgKz0gZ2V0T2ZmZXJzSW5wdXQucmVkZW1wdGlvblR5cGUgIT09IFJlZGVtcHRpb25UeXBlLkFsbCA/IGAmcmVkZW1wdGlvblR5cGU9JHtnZXRPZmZlcnNJbnB1dC5yZWRlbXB0aW9uVHlwZX1gIDogYGA7XG4gICAgICAgICAgICAvLyBPbGl2ZSB3YW50cyB1cyB0byBub3QgcGFzcyBhbnl0aGluZyBmb3IgdGhlIGBhdmFpbGFiaWxpdHk9YWxsYCBwYXJhbWV0ZXIvZmlsdGVyaW5nXG4gICAgICAgICAgICByZXF1ZXN0VVJMICs9IGdldE9mZmVyc0lucHV0LmF2YWlsYWJpbGl0eSAhPT0gT2ZmZXJBdmFpbGFiaWxpdHkuQWxsID8gYCZhdmFpbGFiaWxpdHk9JHtnZXRPZmZlcnNJbnB1dC5hdmFpbGFiaWxpdHl9YCA6IGBgO1xuICAgICAgICAgICAgcmVxdWVzdFVSTCArPSBgJmNvdW50cnlDb2RlPSR7Z2V0T2ZmZXJzSW5wdXQuY291bnRyeUNvZGV9JnBhZ2VTaXplPSR7Z2V0T2ZmZXJzSW5wdXQucGFnZVNpemV9JnBhZ2VOdW1iZXI9JHtwYWdlTnVtYmVyICE9PSBudWxsICYmIHBhZ2VOdW1iZXIgIT09IHVuZGVmaW5lZCA/IHBhZ2VOdW1iZXIgOiBnZXRPZmZlcnNJbnB1dC5wYWdlTnVtYmVyfWA7XG4gICAgICAgICAgICBnZXRPZmZlcnNJbnB1dC5vZmZlclN0YXRlcy5mb3JFYWNoKHN0YXRlID0+IHtcbiAgICAgICAgICAgICAgICByZXF1ZXN0VVJMICs9IGAmb2ZmZXJTdGF0ZXM9JHtzdGF0ZX1gO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIHJlcXVlc3RVUkwgKz0gKFxuICAgICAgICAgICAgICAgIGdldE9mZmVyc0lucHV0LmZpbHRlclR5cGUgPT09IE9mZmVyRmlsdGVyLk5lYXJieVxuICAgICAgICAgICAgICAgIHx8IGdldE9mZmVyc0lucHV0LmZpbHRlclR5cGUgPT09IE9mZmVyRmlsdGVyLlByZW1pZXJOZWFyYnlcbiAgICAgICAgICAgICAgICB8fCBnZXRPZmZlcnNJbnB1dC5maWx0ZXJUeXBlID09PSBPZmZlckZpbHRlci5DYXRlZ29yaXplZE5lYXJieVxuICAgICAgICAgICAgICAgIHx8IGdldE9mZmVyc0lucHV0LmZpbHRlclR5cGUgPT09IE9mZmVyRmlsdGVyLlNlYXNvbmFsTmVhcmJ5XG4gICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgPyBgJnJhZGl1c0xhdGl0dWRlPSR7Z2V0T2ZmZXJzSW5wdXQucmFkaXVzTGF0aXR1ZGUhfSZyYWRpdXNMb25naXR1ZGU9JHtnZXRPZmZlcnNJbnB1dC5yYWRpdXNMb25naXR1ZGUhfSZyYWRpdXM9JHtnZXRPZmZlcnNJbnB1dC5yYWRpdXMhfSZyYWRpdXNJbmNsdWRlT25saW5lU3RvcmVzPSR7Z2V0T2ZmZXJzSW5wdXQucmFkaXVzSW5jbHVkZU9ubGluZVN0b3JlcyF9YFxuICAgICAgICAgICAgICAgIDogYGA7XG4gICAgICAgICAgICByZXF1ZXN0VVJMICs9IGdldE9mZmVyc0lucHV0LmJyYW5kTmFtZVxuICAgICAgICAgICAgICAgID8gYCZicmFuZERiYT0ke2VuY29kZVVSSUNvbXBvbmVudChnZXRPZmZlcnNJbnB1dC5icmFuZE5hbWUpfWBcbiAgICAgICAgICAgICAgICA6IGBgO1xuICAgICAgICAgICAgcmVxdWVzdFVSTCArPSBnZXRPZmZlcnNJbnB1dC5vZmZlckNhdGVnb3J5XG4gICAgICAgICAgICAgICAgPyBgJmJyYW5kUGFyZW50Q2F0ZWdvcnk9JHtnZXRPZmZlcnNJbnB1dC5vZmZlckNhdGVnb3J5fWBcbiAgICAgICAgICAgICAgICA6IGBgO1xuICAgICAgICAgICAgLy8gbG9nIHRoZSByZXF1ZXN0IFVSTCwgc2luY2Ugd2UgYXJlIGRvaW5nIGEgbG90IG9mIGZpbHRlcmluZywgZm9yIHNhbml0eSBwdXJwb3Nlc1xuICAgICAgICAgICAgY29uc29sZS5sb2coYFJlcXVlc3QgVVJMIGZvciBPbGl2ZSAke3JlcXVlc3RVUkx9YCk7XG4gICAgICAgICAgICByZXR1cm4gYXhpb3MuZ2V0KHJlcXVlc3RVUkwsIHtcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgICAgICBcIk9saXZlLUtleVwiOiBvbGl2ZVByaXZhdGVLZXlcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDI1MDAwLCAvLyBpbiBtaWxsaXNlY29uZHMgaGVyZVxuICAgICAgICAgICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2U6ICdPbGl2ZSBBUEkgdGltZWQgb3V0IGFmdGVyIDI1MDAwbXMhJ1xuICAgICAgICAgICAgfSkudGhlbihhc3luYyBnZXRPZmZlcnNSZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gd2UgZG9uJ3Qgd2FudCB0byBsb2cgdGhpcyBpbiBjYXNlIG9mIHN1Y2Nlc3MgcmVzcG9uc2VzLCBiZWNhdXNlIHRoZSBvZmZlciByZXNwb25zZXMgYXJlIHZlcnkgbG9uZyAoZnJ1Z2FsaXR5KVxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShnZXRPZmZlcnNSZXNwb25zZS5kYXRhKX1gKTtcblxuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIGlmIHdlIHJlYWNoZWQgdGhpcywgdGhlbiB3ZSBhc3N1bWUgdGhhdCBhIDJ4eCByZXNwb25zZSBjb2RlIHdhcyByZXR1cm5lZC5cbiAgICAgICAgICAgICAgICAgKiBjaGVjayB0aGUgY29udGVudHMgb2YgdGhlIHJlc3BvbnNlLCBhbmQgYWN0IGFwcHJvcHJpYXRlbHkuXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgaWYgKGdldE9mZmVyc1Jlc3BvbnNlLmRhdGEgIT09IHVuZGVmaW5lZCAmJiBnZXRPZmZlcnNSZXNwb25zZS5kYXRhW1widG90YWxOdW1iZXJPZlBhZ2VzXCJdICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgZ2V0T2ZmZXJzUmVzcG9uc2UuZGF0YVtcInRvdGFsTnVtYmVyT2ZSZWNvcmRzXCJdICE9PSB1bmRlZmluZWQgJiYgZ2V0T2ZmZXJzUmVzcG9uc2UuZGF0YVtcIml0ZW1zXCJdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgd2Ugc29tZWhvdyBnZXQgYW4gdW4tbWF0Y2hpbmcgbnVtYmVyIG9mIHJlY29yZHMgdG8gcmVjb3JkcyByZXR1cm5lZCwgdGhlbiByZXRyeSB0aGlzIGNhbGwgYXQgbW9zdCwgdHdpY2VcbiAgICAgICAgICAgICAgICAgICAgaWYgKGdldE9mZmVyc1Jlc3BvbnNlLmRhdGFbXCJ0b3RhbE51bWJlck9mUmVjb3Jkc1wiXSA+IDAgJiYgZ2V0T2ZmZXJzUmVzcG9uc2UuZGF0YVtcIml0ZW1zXCJdLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG51bWJlck9mUmV0cmllcyA9PT0gdW5kZWZpbmVkIHx8IG51bWJlck9mUmV0cmllcyA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgYXJyYXkgb2Ygb2ZmZXIgaXRlbXMgYWNjb3JkaW5nbHlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvZmZlcnM6IGdldE9mZmVyc1Jlc3BvbnNlLmRhdGFbXCJpdGVtc1wiXSBhcyBPZmZlcltdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxOdW1iZXJPZlBhZ2VzOiBnZXRPZmZlcnNSZXNwb25zZS5kYXRhW1widG90YWxOdW1iZXJPZlBhZ2VzXCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxOdW1iZXJPZlJlY29yZHM6IGdldE9mZmVyc1Jlc3BvbnNlLmRhdGFbXCJ0b3RhbE51bWJlck9mUmVjb3Jkc1wiXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBkZWxheSgxMDAwKTsgLy8gZGVsYXkgMSBzZWNvbmRzIGJldHdlZW4gY2FsbHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgUmUtYXR0ZW1wdGluZyB0byByZXRyaWV2ZSBvZmZlcnMgZHVlIHRvIG1pc21hdGNoIGl0ZW1zL3JlY29yZHMgcmV0cmlldmVkIWApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldE9mZmVycyhnZXRPZmZlcnNJbnB1dCwgbnVtYmVyT2ZSZXRyaWVzLTEsIGdldE9mZmVyc0lucHV0LnBhZ2VOdW1iZXIgPiAxXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gZ2V0T2ZmZXJzSW5wdXQucGFnZU51bWJlciAtIDFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiB1bmRlZmluZWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBhcnJheSBvZiBvZmZlciBpdGVtcyBhY2NvcmRpbmdseVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9mZmVyczogZ2V0T2ZmZXJzUmVzcG9uc2UuZGF0YVtcIml0ZW1zXCJdIGFzIE9mZmVyW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsTnVtYmVyT2ZQYWdlczogZ2V0T2ZmZXJzUmVzcG9uc2UuZGF0YVtcInRvdGFsTnVtYmVyT2ZQYWdlc1wiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxOdW1iZXJPZlJlY29yZHM6IGdldE9mZmVyc1Jlc3BvbnNlLmRhdGFbXCJ0b3RhbE51bWJlck9mUmVjb3Jkc1wiXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBJbnZhbGlkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tICR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGdldE9mZmVyc1Jlc3BvbnNlKX0hYCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogT2ZmZXJzRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvclxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvci5yZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYW5kIHRoZSBzZXJ2ZXIgcmVzcG9uZGVkIHdpdGggYSBzdGF0dXMgY29kZVxuICAgICAgICAgICAgICAgICAgICAgKiB0aGF0IGZhbGxzIG91dCBvZiB0aGUgcmFuZ2Ugb2YgMnh4LlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vbiAyeHh4IHJlc3BvbnNlIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBPbGl2ZSBBUEksIHdpdGggc3RhdHVzICR7ZXJyb3IucmVzcG9uc2Uuc3RhdHVzfSwgYW5kIHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZXJyb3IucmVzcG9uc2UuZGF0YSl9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBhbnkgb3RoZXIgc3BlY2lmaWMgZXJyb3JzIHRvIGJlIGZpbHRlcmVkIGJlbG93XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogT2ZmZXJzRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3IucmVxdWVzdCkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYnV0IG5vIHJlc3BvbnNlIHdhcyByZWNlaXZlZFxuICAgICAgICAgICAgICAgICAgICAgKiBgZXJyb3IucmVxdWVzdGAgaXMgYW4gaW5zdGFuY2Ugb2YgWE1MSHR0cFJlcXVlc3QgaW4gdGhlIGJyb3dzZXIgYW5kIGFuIGluc3RhbmNlIG9mXG4gICAgICAgICAgICAgICAgICAgICAqICBodHRwLkNsaWVudFJlcXVlc3QgaW4gbm9kZS5qcy5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBObyByZXNwb25zZSByZWNlaXZlZCB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gT2xpdmUgQVBJLCBmb3IgcmVxdWVzdCAke2Vycm9yLnJlcXVlc3R9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE9mZmVyc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBTb21ldGhpbmcgaGFwcGVuZWQgaW4gc2V0dGluZyB1cCB0aGUgcmVxdWVzdCB0aGF0IHRyaWdnZXJlZCBhbiBFcnJvclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IGZvciB0aGUgJHtlbmRwb2ludEluZm99IE9saXZlIEFQSSwgJHsoZXJyb3IgJiYgZXJyb3IubWVzc2FnZSkgJiYgZXJyb3IubWVzc2FnZX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogT2ZmZXJzRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGluaXRpYXRpbmcgdGhlIG9mZmVycyByZXRyaWV2YWwgdGhyb3VnaCAke2VuZHBvaW50SW5mb31gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfSAke2Vycn1gKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE9mZmVyc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB1c2VkIHRvIHJldHJpZXZlIGEgdXNlcidzIGNhcmQgbGlua2luZyBJRCwgZ2l2ZW4gdGhlaXIgTW9vbmJlYW1cbiAgICAgKiBpbnRlcm5hbCB1bmlxdWUgSUQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZ2V0VXNlckNhcmRMaW5raW5nSWRJbnB1dCB0aGUgaW5wdXQgb2JqZWN0IGNvbnRhaW5pbmcgdGhlIHVuaXF1ZSBNb29uYmVhbVxuICAgICAqIGludGVybmFsIElELCB0byBiZSB1c2VkIHdoaWxlIHJldHJpZXZpbmcgdGhlIHVzZXIncyBjYXJkIGxpbmtpbmcgSUQuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIGEge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBHZXRVc2VyQ2FyZExpbmtpbmdJZFJlc3BvbnNlfSByZXByZXNlbnRpbmcgdGhlIHJlc3BvbnNlXG4gICAgICogb2JqZWN0LCBjb250YWluaW5nIHRoZSB1c2VyJ3MgY2FyZCBsaW5raW5nIGlkLlxuICAgICAqL1xuICAgIGFzeW5jIGdldFVzZXJDYXJkTGlua2luZ0lkKGdldFVzZXJDYXJkTGlua2luZ0lkSW5wdXQ6IEdldFVzZXJDYXJkTGlua2luZ0lkSW5wdXQpOiBQcm9taXNlPEdldFVzZXJDYXJkTGlua2luZ0lkUmVzcG9uc2U+IHtcbiAgICAgICAgLy8gZWFzaWx5IGlkZW50aWZpYWJsZSBBUEkgZW5kcG9pbnQgaW5mb3JtYXRpb25cbiAgICAgICAgY29uc3QgZW5kcG9pbnRJbmZvID0gJ0dFVCAvbWVtYmVycz9leHRNZW1iZXJJZD17aWR9IE9saXZlIEFQSSc7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBBUEkgS2V5IGFuZCBCYXNlIFVSTCwgbmVlZGVkIGluIG9yZGVyIHRvIG1ha2UgdGhlIEdFVCBtZW1iZXIgZGV0YWlscyBjYWxsIHRocm91Z2ggdGhlIGNsaWVudFxuICAgICAgICAgICAgY29uc3QgW29saXZlQmFzZVVSTCwgb2xpdmVQdWJsaWNLZXksIG9saXZlUHJpdmF0ZUtleV0gPSBhd2FpdCBzdXBlci5yZXRyaWV2ZVNlcnZpY2VDcmVkZW50aWFscyhDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5PTElWRV9TRUNSRVRfTkFNRSk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB3ZSBvYnRhaW5lZCBhbnkgaW52YWxpZCBzZWNyZXQgdmFsdWVzIGZyb20gdGhlIGNhbGwgYWJvdmVcbiAgICAgICAgICAgIGlmIChvbGl2ZUJhc2VVUkwgPT09IG51bGwgfHwgb2xpdmVCYXNlVVJMLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG9saXZlUHVibGljS2V5ID09PSBudWxsIHx8IG9saXZlUHVibGljS2V5Lmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG9saXZlUHJpdmF0ZUtleSA9PT0gbnVsbCB8fCBvbGl2ZVByaXZhdGVLZXkhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IFwiSW52YWxpZCBTZWNyZXRzIG9idGFpbmVkIGZvciBPbGl2ZSBBUEkgY2FsbCFcIjtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBHRVQgL21lbWJlcnM/ZXh0TWVtYmVySWQ9e2lkfVxuICAgICAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIub2xpdmVsdGQuY29tL3JlZmVyZW5jZS9saXN0LW1lbWJlcnNcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBidWlsZCB0aGUgT2xpdmUgQVBJIHJlcXVlc3QgYm9keSB0byBiZSBwYXNzZWQgaW4sIGFuZCBwZXJmb3JtIGEgR0VUIHRvIGl0IHdpdGggdGhlIGFwcHJvcHJpYXRlIGluZm9ybWF0aW9uXG4gICAgICAgICAgICAgKiB3ZSBpbXBseSB0aGF0IGlmIHRoZSBBUEkgZG9lcyBub3QgcmVzcG9uZCBpbiAxNSBzZWNvbmRzLCB0aGVuIHdlIGF1dG9tYXRpY2FsbHkgY2F0Y2ggdGhhdCwgYW5kIHJldHVybiBhblxuICAgICAgICAgICAgICogZXJyb3IgZm9yIGEgYmV0dGVyIGN1c3RvbWVyIGV4cGVyaWVuY2UuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHJldHVybiBheGlvcy5nZXQoYCR7b2xpdmVCYXNlVVJMfS9tZW1iZXJzP2V4dE1lbWJlcklkPSR7Z2V0VXNlckNhcmRMaW5raW5nSWRJbnB1dC5pZH1gLCB7XG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAgICAgXCJPbGl2ZS1LZXlcIjogb2xpdmVQcml2YXRlS2V5XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiAxNTAwMCwgLy8gaW4gbWlsbGlzZWNvbmRzIGhlcmVcbiAgICAgICAgICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlOiAnT2xpdmUgQVBJIHRpbWVkIG91dCBhZnRlciAxNTAwMG1zISdcbiAgICAgICAgICAgIH0pLnRoZW4obWVtYmVyRGV0YWlsc1Jlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlbmRwb2ludEluZm99IHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkobWVtYmVyRGV0YWlsc1Jlc3BvbnNlLmRhdGEpfWApO1xuXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogaWYgd2UgcmVhY2hlZCB0aGlzLCB0aGVuIHdlIGFzc3VtZSB0aGF0IGEgMnh4IHJlc3BvbnNlIGNvZGUgd2FzIHJldHVybmVkLlxuICAgICAgICAgICAgICAgICAqIGNoZWNrIHRoZSBjb250ZW50cyBvZiB0aGUgcmVzcG9uc2UsIGFuZCBhY3QgYXBwcm9wcmlhdGVseS5cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBpZiAobWVtYmVyRGV0YWlsc1Jlc3BvbnNlLmRhdGEgIT09IHVuZGVmaW5lZCAmJiBtZW1iZXJEZXRhaWxzUmVzcG9uc2UuZGF0YSAhPT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgICAgICBtZW1iZXJEZXRhaWxzUmVzcG9uc2UuZGF0YVtcInRvdGFsTnVtYmVyT2ZQYWdlc1wiXSAhPT0gdW5kZWZpbmVkICYmIG1lbWJlckRldGFpbHNSZXNwb25zZS5kYXRhW1widG90YWxOdW1iZXJPZlBhZ2VzXCJdICE9PSBudWxsICYmIG1lbWJlckRldGFpbHNSZXNwb25zZS5kYXRhW1widG90YWxOdW1iZXJPZlBhZ2VzXCJdID09PSAxICYmXG4gICAgICAgICAgICAgICAgICAgIG1lbWJlckRldGFpbHNSZXNwb25zZS5kYXRhW1widG90YWxOdW1iZXJPZlJlY29yZHNcIl0gIT09IHVuZGVmaW5lZCAmJiBtZW1iZXJEZXRhaWxzUmVzcG9uc2UuZGF0YVtcInRvdGFsTnVtYmVyT2ZSZWNvcmRzXCJdICE9PSBudWxsICYmIG1lbWJlckRldGFpbHNSZXNwb25zZS5kYXRhW1widG90YWxOdW1iZXJPZlJlY29yZHNcIl0gPT09IDEgJiZcbiAgICAgICAgICAgICAgICAgICAgbWVtYmVyRGV0YWlsc1Jlc3BvbnNlLmRhdGFbXCJpdGVtc1wiXSAhPT0gdW5kZWZpbmVkICYmIG1lbWJlckRldGFpbHNSZXNwb25zZS5kYXRhW1wiaXRlbXNcIl0gIT09IG51bGwgJiYgbWVtYmVyRGV0YWlsc1Jlc3BvbnNlLmRhdGFbXCJpdGVtc1wiXS5sZW5ndGggPT09IDEgJiZcbiAgICAgICAgICAgICAgICAgICAgbWVtYmVyRGV0YWlsc1Jlc3BvbnNlLmRhdGFbXCJpdGVtc1wiXVswXVtcImlkXCJdICE9PSB1bmRlZmluZWQgJiYgbWVtYmVyRGV0YWlsc1Jlc3BvbnNlLmRhdGFbXCJpdGVtc1wiXVswXVtcImlkXCJdICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgdXNlcidzIGNhcmQgbGlua2luZyBpZCBhY2NvcmRpbmdseVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogbWVtYmVyRGV0YWlsc1Jlc3BvbnNlLmRhdGFbXCJpdGVtc1wiXVswXVtcImlkXCJdXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBpZiB0aGVyZSBhcmUgbm8gdXNlcnMgbWF0Y2hpbmcgdGhhdCBJRCwgdGhlbiB3ZSByZXR1cm4gYSBkbyBub3QgZm91bmQgZXJyb3IsIG90aGVyd2lzZSB3ZSByZXR1cm4gYSB2YWxpZGF0aW9uIGVycm9yXG4gICAgICAgICAgICAgICAgICAgIGlmIChtZW1iZXJEZXRhaWxzUmVzcG9uc2UuZGF0YVtcInRvdGFsTnVtYmVyT2ZQYWdlc1wiXSAhPT0gdW5kZWZpbmVkICYmIG1lbWJlckRldGFpbHNSZXNwb25zZS5kYXRhW1widG90YWxOdW1iZXJPZlBhZ2VzXCJdICE9PSBudWxsICYmIG1lbWJlckRldGFpbHNSZXNwb25zZS5kYXRhW1widG90YWxOdW1iZXJPZlBhZ2VzXCJdID09PSAwICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBtZW1iZXJEZXRhaWxzUmVzcG9uc2UuZGF0YVtcInRvdGFsTnVtYmVyT2ZSZWNvcmRzXCJdICE9PSB1bmRlZmluZWQgJiYgbWVtYmVyRGV0YWlsc1Jlc3BvbnNlLmRhdGFbXCJ0b3RhbE51bWJlck9mUmVjb3Jkc1wiXSAhPT0gbnVsbCAmJiBtZW1iZXJEZXRhaWxzUmVzcG9uc2UuZGF0YVtcInRvdGFsTnVtYmVyT2ZSZWNvcmRzXCJdID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogYENhcmQtTGlua2luZyB1c2VyIG5vdCBmb3VuZCBmb3IgaWQgJHtnZXRVc2VyQ2FyZExpbmtpbmdJZElucHV0LmlkfWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5Ob25lT3JBYnNlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgSW52YWxpZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UhYCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvci5yZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYW5kIHRoZSBzZXJ2ZXIgcmVzcG9uZGVkIHdpdGggYSBzdGF0dXMgY29kZVxuICAgICAgICAgICAgICAgICAgICAgKiB0aGF0IGZhbGxzIG91dCBvZiB0aGUgcmFuZ2Ugb2YgMnh4LlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vbiAyeHh4IHJlc3BvbnNlIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBPbGl2ZSBBUEksIHdpdGggc3RhdHVzICR7ZXJyb3IucmVzcG9uc2Uuc3RhdHVzfSwgYW5kIHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZXJyb3IucmVzcG9uc2UuZGF0YSl9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBhbnkgb3RoZXIgc3BlY2lmaWMgZXJyb3JzIHRvIGJlIGZpbHRlcmVkIGJlbG93XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5yZXF1ZXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBidXQgbm8gcmVzcG9uc2Ugd2FzIHJlY2VpdmVkXG4gICAgICAgICAgICAgICAgICAgICAqIGBlcnJvci5yZXF1ZXN0YCBpcyBhbiBpbnN0YW5jZSBvZiBYTUxIdHRwUmVxdWVzdCBpbiB0aGUgYnJvd3NlciBhbmQgYW4gaW5zdGFuY2Ugb2ZcbiAgICAgICAgICAgICAgICAgICAgICogIGh0dHAuQ2xpZW50UmVxdWVzdCBpbiBub2RlLmpzLlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vIHJlc3BvbnNlIHJlY2VpdmVkIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBPbGl2ZSBBUEksIGZvciByZXF1ZXN0ICR7ZXJyb3IucmVxdWVzdH1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU29tZXRoaW5nIGhhcHBlbmVkIGluIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgdGhhdCB0cmlnZ2VyZWQgYW4gRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgc2V0dGluZyB1cCB0aGUgcmVxdWVzdCBmb3IgdGhlICR7ZW5kcG9pbnRJbmZvfSBPbGl2ZSBBUEksICR7KGVycm9yICYmIGVycm9yLm1lc3NhZ2UpICYmIGVycm9yLm1lc3NhZ2V9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGluaXRpYXRpbmcgdGhlIG1lbWJlciBkZXRhaWxzIHJldHJpZXZhbCB0aHJvdWdoICR7ZW5kcG9pbnRJbmZvfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9ICR7ZXJyfWApO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHVzZWQgYXMgYSBkZWxheVxuICpcbiAqIEBwYXJhbSBtcyBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRvIGRlbGF5IGJ5XG4gKlxuICogQHJldHVybnMgYSB7QGxpbmsgUHJvbWlzZX1cbiAqL1xuY29uc3QgZGVsYXkgPSAobXM6IG51bWJlcik6IFByb21pc2U8YW55PiA9PiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKCByZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgbXMpICk7XG59XG5cbiJdfQ==