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
     * Function used to retrieve the brand details, given a brand ID for an ineligible brand
     * resulted from an ineligible transaction.
     *
     * @param ineligibleTransaction the ineligible transaction object, populated by the initial details
     * passed in by Olive. This object will be used to set even more information for
     * it, obtained from this brand call.
     *
     * @return a {@link Promise} of {@link IneligibleTransactionResponse} representing the
     * ineligible transaction with the brand details obtained, included in it.
     *
     * @protected
     */
    async getIneligibleBrandDetails(ineligibleTransaction) {
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
            return axios_1.default.get(`${oliveBaseURL}/brands/${ineligibleTransaction.brandId}`, {
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
                    // set the brand details for the ineligible transaction object, from the response
                    ineligibleTransaction.transactionBrandName = brandDetailsResponse.data["dba"];
                    ineligibleTransaction.transactionBrandLogoUrl = brandDetailsResponse.data["logoUrl"];
                    ineligibleTransaction.transactionBrandURLAddress = brandDetailsResponse.data["website"] !== undefined ? brandDetailsResponse.data["website"] : 'Not Available';
                    return {
                        data: ineligibleTransaction
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT2xpdmVDbGllbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbW9uL2NsaWVudHMvT2xpdmVDbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsc0RBK0IyQjtBQUMzQixtREFBOEM7QUFDOUMsNENBQXVDO0FBQ3ZDLGtEQUEwQjtBQUUxQjs7R0FFRztBQUNILE1BQWEsV0FBWSxTQUFRLDZCQUFhO0lBRTFDOzs7OztPQUtHO0lBQ0gsWUFBWSxXQUFtQixFQUFFLE1BQWM7UUFDM0MsS0FBSyxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRUQ7Ozs7Ozs7Ozs7T0FVRztJQUNILEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBYyxFQUFFLFNBQWlCLEVBQUUsU0FBaUIsRUFBRSxJQUFVO1FBQ3ZFLCtDQUErQztRQUMvQyxNQUFNLFlBQVksR0FBRyxnQ0FBZ0MsQ0FBQztRQUV0RCxJQUFJO1lBQ0Esc0dBQXNHO1lBQ3RHLE1BQU0sQ0FBQyxZQUFZLEVBQUUsY0FBYyxFQUFFLGVBQWUsQ0FBQyxHQUFHLE1BQU0sS0FBSyxDQUFDLDBCQUEwQixDQUFDLHFCQUFTLENBQUMsZ0JBQWdCLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUU3SSw0RUFBNEU7WUFDNUUsSUFBSSxZQUFZLEtBQUssSUFBSSxJQUFJLFlBQVksQ0FBQyxNQUFNLEtBQUssQ0FBQztnQkFDbEQsY0FBYyxLQUFLLElBQUksSUFBSSxjQUFjLENBQUMsTUFBTSxLQUFLLENBQUM7Z0JBQ3RELGVBQWUsS0FBSyxJQUFJLElBQUksZUFBZ0IsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUMzRCxNQUFNLFlBQVksR0FBRyw4Q0FBOEMsQ0FBQztnQkFDcEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFFMUIsT0FBTztvQkFDSCxZQUFZLEVBQUUsWUFBWTtvQkFDMUIsU0FBUyxFQUFFLGtDQUFp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T0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFFLENBQUM7QUFDN0QsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgICBDYXJkLFxuICAgIENhcmREZXRhaWxzUmVzcG9uc2UsXG4gICAgQ2FyZExpbmtFcnJvclR5cGUsXG4gICAgQ2FyZExpbmtpbmdTdGF0dXMsXG4gICAgQ2FyZExpbmtSZXNwb25zZSxcbiAgICBHZXRPZmZlcnNJbnB1dCxcbiAgICBHZXRVc2VyQ2FyZExpbmtpbmdJZElucHV0LFxuICAgIEdldFVzZXJDYXJkTGlua2luZ0lkUmVzcG9uc2UsIEluZWxpZ2libGVUcmFuc2FjdGlvbixcbiAgICBJbmVsaWdpYmxlVHJhbnNhY3Rpb25SZXNwb25zZSxcbiAgICBNZW1iZXJEZXRhaWxzUmVzcG9uc2UsXG4gICAgTWVtYmVyUmVzcG9uc2UsXG4gICAgT2ZmZXIsXG4gICAgT2ZmZXJBdmFpbGFiaWxpdHksXG4gICAgT2ZmZXJGaWx0ZXIsXG4gICAgT2ZmZXJJZFJlc3BvbnNlLFxuICAgIE9mZmVyUmVkZW1wdGlvblR5cGVSZXNwb25zZSxcbiAgICBPZmZlclNlYXNvbmFsVHlwZSxcbiAgICBPZmZlcnNFcnJvclR5cGUsXG4gICAgT2ZmZXJzUmVzcG9uc2UsXG4gICAgUmVkZW1wdGlvblR5cGUsXG4gICAgUmVpbWJ1cnNlbWVudFByb2Nlc3NpbmdSZXNwb25zZSxcbiAgICBSZWltYnVyc2VtZW50UHJvY2Vzc2luZ1N0YXR1cyxcbiAgICBSZWltYnVyc2VtZW50c0Vycm9yVHlwZSxcbiAgICBSZW1vdmVDYXJkUmVzcG9uc2UsXG4gICAgU2VhcmNoT2ZmZXJzSW5wdXQsXG4gICAgVHJhbnNhY3Rpb24sXG4gICAgVHJhbnNhY3Rpb25SZXNwb25zZSxcbiAgICBUcmFuc2FjdGlvbnNFcnJvclR5cGUsXG4gICAgVXBkYXRlZFRyYW5zYWN0aW9uRXZlbnQsXG4gICAgVXBkYXRlZFRyYW5zYWN0aW9uRXZlbnRSZXNwb25zZSxcbn0gZnJvbSBcIi4uL0dyYXBocWxFeHBvcnRzXCI7XG5pbXBvcnQge0Jhc2VBUElDbGllbnR9IGZyb20gXCIuL0Jhc2VBUElDbGllbnRcIjtcbmltcG9ydCB7Q29uc3RhbnRzfSBmcm9tIFwiLi4vQ29uc3RhbnRzXCI7XG5pbXBvcnQgYXhpb3MgZnJvbSBcImF4aW9zXCI7XG5cbi8qKlxuICogQ2xhc3MgdXNlZCBhcyB0aGUgYmFzZS9nZW5lcmljIGNsaWVudCBmb3IgYWxsIE9saXZlIGNhcmQgbGlua2luZyByZWxhdGVkIGNhbGxzLlxuICovXG5leHBvcnQgY2xhc3MgT2xpdmVDbGllbnQgZXh0ZW5kcyBCYXNlQVBJQ2xpZW50IHtcblxuICAgIC8qKlxuICAgICAqIEdlbmVyaWMgY29uc3RydWN0b3IgZm9yIHRoZSBjbGllbnQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZW52aXJvbm1lbnQgdGhlIEFXUyBlbnZpcm9ubWVudCBwYXNzZWQgaW4gZnJvbSB0aGUgTGFtYmRhIHJlc29sdmVyLlxuICAgICAqIEBwYXJhbSByZWdpb24gdGhlIEFXUyByZWdpb24gcGFzc2VkIGluIGZyb20gdGhlIExhbWJkYSByZXNvbHZlci5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihlbnZpcm9ubWVudDogc3RyaW5nLCByZWdpb246IHN0cmluZykge1xuICAgICAgICBzdXBlcihyZWdpb24sIGVudmlyb25tZW50KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB1c2VkIHRvIGNvbXBsZXRlIHRoZSBsaW5raW5nIG9mIGFuIGluZGl2aWR1YWwncyBjYXJkIG9uIHRoZSBwbGF0Zm9ybS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB1c2VySWQgdW5pcXVlIHVzZXIgSUQgb2YgYSBjYXJkIGxpbmtpbmcgdXNlci5cbiAgICAgKiBAcGFyYW0gY3JlYXRlZEF0IGNhcmQgbGlua2VkIG9iamVjdCBjcmVhdGlvbiBkYXRlXG4gICAgICogQHBhcmFtIHVwZGF0ZWRBdCBjYXJkIGxpbmtlZCBvYmplY3QgdXBkYXRlIGRhdGVcbiAgICAgKiBAcGFyYW0gY2FyZCBjYXJkIGluZm9ybWF0aW9uIHRvIGJlIHVzZWQgZHVyaW5nIHRoZSBlbnJvbGxtZW50L2xpbmtpbmcgcHJvY2Vzc1xuICAgICAqXG4gICAgICogQHJldHVybiBhIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgQ2FyZExpbmtSZXNwb25zZX0gcmVwcmVzZW50aW5nIHRoZVxuICAgICAqIGNhcmQgbGluayByZXNwb25zZSBvYmplY3Qgb2J0YWluZWQgZnJvbSB0aGUgbGlua2luZyBjYWxsXG4gICAgICovXG4gICAgYXN5bmMgbGluayh1c2VySWQ6IHN0cmluZywgY3JlYXRlZEF0OiBzdHJpbmcsIHVwZGF0ZWRBdDogc3RyaW5nLCBjYXJkOiBDYXJkKTogUHJvbWlzZTxDYXJkTGlua1Jlc3BvbnNlPiB7XG4gICAgICAgIC8vIGVhc2lseSBpZGVudGlmaWFibGUgQVBJIGVuZHBvaW50IGluZm9ybWF0aW9uXG4gICAgICAgIGNvbnN0IGVuZHBvaW50SW5mbyA9ICdQT1NUIC9tZW1iZXJzL3NpZ251cCBPbGl2ZSBBUEknO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgQVBJIEtleSBhbmQgQmFzZSBVUkwsIG5lZWRlZCBpbiBvcmRlciB0byBtYWtlIHRoZSBjYXJkIGxpbmtpbmcgY2FsbCB0aHJvdWdoIHRoZSBjbGllbnRcbiAgICAgICAgICAgIGNvbnN0IFtvbGl2ZUJhc2VVUkwsIG9saXZlUHVibGljS2V5LCBvbGl2ZVByaXZhdGVLZXldID0gYXdhaXQgc3VwZXIucmV0cmlldmVTZXJ2aWNlQ3JlZGVudGlhbHMoQ29uc3RhbnRzLkFXU1BhaXJDb25zdGFudHMuT0xJVkVfU0VDUkVUX05BTUUpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgd2Ugb2J0YWluZWQgYW55IGludmFsaWQgc2VjcmV0IHZhbHVlcyBmcm9tIHRoZSBjYWxsIGFib3ZlXG4gICAgICAgICAgICBpZiAob2xpdmVCYXNlVVJMID09PSBudWxsIHx8IG9saXZlQmFzZVVSTC5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBvbGl2ZVB1YmxpY0tleSA9PT0gbnVsbCB8fCBvbGl2ZVB1YmxpY0tleS5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBvbGl2ZVByaXZhdGVLZXkgPT09IG51bGwgfHwgb2xpdmVQcml2YXRlS2V5IS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBcIkludmFsaWQgU2VjcmV0cyBvYnRhaW5lZCBmb3IgT2xpdmUgQVBJIGNhbGwhXCI7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogUE9TVCAvbWVtYmVycy9zaWdudXBcbiAgICAgICAgICAgICAqIEBsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm9saXZlbHRkLmNvbS9kb2NzLzItZW5yb2xsLXlvdXItY3VzdG9tZXItaW4tb2xpdmUtcHJvZ3JhbXNcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBidWlsZCB0aGUgT2xpdmUgQVBJIHJlcXVlc3QgYm9keSB0byBiZSBwYXNzZWQgaW4sIGFuZCBwZXJmb3JtIGEgUE9TVCB0byBpdCB3aXRoIHRoZSBhcHByb3ByaWF0ZSBpbmZvcm1hdGlvblxuICAgICAgICAgICAgICogd2UgaW1wbHkgdGhhdCBpZiB0aGUgQVBJIGRvZXMgbm90IHJlc3BvbmQgaW4gMTUgc2Vjb25kcywgdGhlbiB3ZSBhdXRvbWF0aWNhbGx5IGNhdGNoIHRoYXQsIGFuZCByZXR1cm4gYW5cbiAgICAgICAgICAgICAqIGVycm9yIGZvciBhIGJldHRlciBjdXN0b21lciBleHBlcmllbmNlLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBjb25zdCByZXF1ZXN0RGF0YSA9IHtcbiAgICAgICAgICAgICAgICBjYXJkVG9rZW46IGNhcmQudG9rZW4sXG4gICAgICAgICAgICAgICAgbmlja25hbWU6IGNhcmQubmFtZSxcbiAgICAgICAgICAgICAgICBtZW1iZXI6IHtcbiAgICAgICAgICAgICAgICAgICAgdGNBY2NlcHRlZERhdGU6IGNyZWF0ZWRBdCxcbiAgICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlQXBwSWQ6IGNhcmQuYXBwbGljYXRpb25JRCxcbiAgICAgICAgICAgICAgICAgICAgZXh0TWVtYmVySWQ6IHVzZXJJZCxcbiAgICAgICAgICAgICAgICAgICAgY2FzaGJhY2tQcm9ncmFtOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICByb3VuZGluZ1Byb2dyYW06IGZhbHNlXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAuLi4oY2FyZC5hZGRpdGlvbmFsUHJvZ3JhbUlEICYmIGNhcmQuYWRkaXRpb25hbFByb2dyYW1JRC5sZW5ndGggIT09IDAgJiYge1xuICAgICAgICAgICAgICAgICAgICBsb3lhbHR5UHJvZ3JhbUlkOiBjYXJkLmFkZGl0aW9uYWxQcm9ncmFtSURcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBPbGl2ZSBBUEkgcmVxdWVzdCBPYmplY3Q6ICR7SlNPTi5zdHJpbmdpZnkocmVxdWVzdERhdGEpfWApO1xuICAgICAgICAgICAgcmV0dXJuIGF4aW9zLnBvc3QoYCR7b2xpdmVCYXNlVVJMfS9tZW1iZXJzL3NpZ251cGAsIHJlcXVlc3REYXRhLCB7XG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAgICAgXCJPbGl2ZS1LZXlcIjogb2xpdmVQcml2YXRlS2V5XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiAxNTAwMCwgLy8gaW4gbWlsbGlzZWNvbmRzIGhlcmVcbiAgICAgICAgICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlOiAnT2xpdmUgQVBJIHRpbWVkIG91dCBhZnRlciAxNTAwMG1zISdcbiAgICAgICAgICAgIH0pLnRoZW4oY2FyZExpbmtlZFJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlbmRwb2ludEluZm99IHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoY2FyZExpbmtlZFJlc3BvbnNlLmRhdGEpfWApO1xuXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogaWYgd2UgcmVhY2hlZCB0aGlzLCB0aGVuIHdlIGFzc3VtZSB0aGF0IGEgMnh4IHJlc3BvbnNlIGNvZGUgd2FzIHJldHVybmVkLlxuICAgICAgICAgICAgICAgICAqIGNoZWNrIHRoZSBjb250ZW50cyBvZiB0aGUgcmVzcG9uc2UsIGFuZCBhY3QgYXBwcm9wcmlhdGVseS5cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBpZiAoY2FyZExpbmtlZFJlc3BvbnNlLmRhdGEgIT09IHVuZGVmaW5lZCAmJiBjYXJkTGlua2VkUmVzcG9uc2UuZGF0YVtcIm1lbWJlclwiXSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgICAgICAgICAgIGNhcmRMaW5rZWRSZXNwb25zZS5kYXRhW1wibWVtYmVyXCJdW1wiaWRcIl0gIT09IHVuZGVmaW5lZCAmJiBjYXJkTGlua2VkUmVzcG9uc2UuZGF0YVtcImNhcmRcIl0gIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgICAgICAgICBjYXJkTGlua2VkUmVzcG9uc2UuZGF0YVtcImNhcmRcIl1bXCJpZFwiXSAhPT0gdW5kZWZpbmVkICYmIGNhcmRMaW5rZWRSZXNwb25zZS5kYXRhW1wiY2FyZFwiXSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgICAgICAgICAgIGNhcmRMaW5rZWRSZXNwb25zZS5kYXRhW1wiY2FyZFwiXVtcImxhc3Q0RGlnaXRzXCJdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gbWF0Y2ggdGhlIGxhc3QgNCBmcm9tIHRoZSByZXF1ZXN0LiBBbHdheXMgZ28gYnkgdGhlIC9tZW1iZXJzL3NpZ251cCBsYXN0IDQgaW4gY2FzZSB0aGV5IGRvbid0IG1hdGNoXG4gICAgICAgICAgICAgICAgICAgIGlmIChjYXJkTGlua2VkUmVzcG9uc2UuZGF0YVtcImNhcmRcIl1bXCJsYXN0NERpZ2l0c1wiXSAhPT0gY2FyZC5sYXN0NCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FyZC5sYXN0NCA9IGNhcmRMaW5rZWRSZXNwb25zZS5kYXRhW1wiY2FyZFwiXVtcImxhc3Q0RGlnaXRzXCJdO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogdXNlcklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lbWJlcklkOiBjYXJkTGlua2VkUmVzcG9uc2UuZGF0YVtcIm1lbWJlclwiXVtcImlkXCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDogY3JlYXRlZEF0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRBdDogdXBkYXRlZEF0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRzOiBbe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi5jYXJkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogY2FyZExpbmtlZFJlc3BvbnNlLmRhdGFbXCJjYXJkXCJdW1wiaWRcIl1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB3aGVuZXZlciB3ZSBjcmVhdGUgYSBuZXcgbWVtYmVyLCB0aGVuIHdlIGF1dG9tYXRpY2FsbHkgcHV0IHRoZSBjYXJkIGxpbmtpbmcgb2JqZWN0IGluIGEgTGlua2VkIHN0YXR1c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1czogQ2FyZExpbmtpbmdTdGF0dXMuTGlua2VkXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgSW52YWxpZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UhYCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yLnJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBhbmQgdGhlIHNlcnZlciByZXNwb25kZWQgd2l0aCBhIHN0YXR1cyBjb2RlXG4gICAgICAgICAgICAgICAgICAgICAqIHRoYXQgZmFsbHMgb3V0IG9mIHRoZSByYW5nZSBvZiAyeHguXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm9uIDJ4eHggcmVzcG9uc2Ugd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE9saXZlIEFQSSwgd2l0aCBzdGF0dXMgJHtlcnJvci5yZXNwb25zZS5zdGF0dXN9LCBhbmQgcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShlcnJvci5yZXNwb25zZS5kYXRhKX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGZpbHRlciBiYXNlZCBvbiB0aGUgdHlwZSBvZiBpbmNvbWluZyBlcnJvclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBpbmNvbWluZ0Vycm9yUmVzcG9uc2UgPSBlcnJvci5yZXNwb25zZS5kYXRhO1xuICAgICAgICAgICAgICAgICAgICAvLyB1bmtub3duIHNjaGVtZVxuICAgICAgICAgICAgICAgICAgICBpZiAoaW5jb21pbmdFcnJvclJlc3BvbnNlICYmICFpbmNvbWluZ0Vycm9yUmVzcG9uc2Uuc3VjY2VzcyAmJiBpbmNvbWluZ0Vycm9yUmVzcG9uc2UubWVzc2FnZXMuaW5jbHVkZXMoXCJTY2hlbWUgdW5rbm93biBub3Qgc3VwcG9ydGVkLlwiKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBVbnN1cHBvcnRlZCBjYXJkIHNjaGVtZS5gLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuSW52YWxpZENhcmRTY2hlbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIGFueSBvdGhlciBzcGVjaWZpYyBlcnJvcnMgdG8gYmUgZmlsdGVyZWQgYmVsb3dcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVycm9yLnJlcXVlc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGJ1dCBubyByZXNwb25zZSB3YXMgcmVjZWl2ZWRcbiAgICAgICAgICAgICAgICAgICAgICogYGVycm9yLnJlcXVlc3RgIGlzIGFuIGluc3RhbmNlIG9mIFhNTEh0dHBSZXF1ZXN0IGluIHRoZSBicm93c2VyIGFuZCBhbiBpbnN0YW5jZSBvZlxuICAgICAgICAgICAgICAgICAgICAgKiAgaHR0cC5DbGllbnRSZXF1ZXN0IGluIG5vZGUuanMuXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm8gcmVzcG9uc2UgcmVjZWl2ZWQgd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE9saXZlIEFQSSwgZm9yIHJlcXVlc3QgJHtlcnJvci5yZXF1ZXN0fWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBTb21ldGhpbmcgaGFwcGVuZWQgaW4gc2V0dGluZyB1cCB0aGUgcmVxdWVzdCB0aGF0IHRyaWdnZXJlZCBhbiBFcnJvclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IGZvciB0aGUgJHtlbmRwb2ludEluZm99IE9saXZlIEFQSSwgJHsoZXJyb3IgJiYgZXJyb3IubWVzc2FnZSkgJiYgZXJyb3IubWVzc2FnZX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgaW5pdGlhdGluZyBjYXJkIGxpbmtpbmcgdGhyb3VnaCAke2VuZHBvaW50SW5mb31gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfSAke2Vycn1gKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHVzZWQgdG8gYWRkIGEgbmV3IGNhcmQgdG8gYW4gZXhpc3RpbmcgbWVtYmVyLlxuICAgICAqXG4gICAgICogQHBhcmFtIHVzZXJJZCB1bmlxdWUgdXNlciBJRCBvZiBhIGNhcmQgbGlua2luZyB1c2VyLlxuICAgICAqIEBwYXJhbSBtZW1iZXJJZCBtZW1iZXIgaWQsIHJldHJpZXZlZCBmcm9tIE9saXZlLCB3aGljaCB0aGUgY2FyZCB3aWxsIGJlIGFkZGVkIHRvXG4gICAgICogQHBhcmFtIGNyZWF0ZWRBdCBjYXJkIGxpbmtlZCBvYmplY3QgY3JlYXRpb24gZGF0ZVxuICAgICAqIEBwYXJhbSB1cGRhdGVkQXQgY2FyZCBsaW5rZWQgb2JqZWN0IHVwZGF0ZSBkYXRlXG4gICAgICogQHBhcmFtIGNhcmQgY2FyZCBpbmZvcm1hdGlvbiB0byBiZSB1c2VkIGluIGFkZGluZyBhIG5ldyBjYXJkIHRvIGEgbWVtYmVyXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIGEge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBDYXJkTGlua1Jlc3BvbnNlfSByZXByZXNlbnRpbmcgdGhlXG4gICAgICogY2FyZCBsaW5rIHJlc3BvbnNlIG9iamVjdCBvYnRhaW5lZCBmcm9tIHRoZSBhZGQgY2FyZCBjYWxsXG4gICAgICovXG4gICAgYXN5bmMgYWRkQ2FyZCh1c2VySWQ6IHN0cmluZywgbWVtYmVySWQ6IHN0cmluZywgY3JlYXRlZEF0OiBzdHJpbmcsIHVwZGF0ZWRBdDogc3RyaW5nLCBjYXJkOiBDYXJkKTogUHJvbWlzZTxDYXJkTGlua1Jlc3BvbnNlPiB7XG4gICAgICAgIC8vIGVhc2lseSBpZGVudGlmaWFibGUgQVBJIGVuZHBvaW50IGluZm9ybWF0aW9uXG4gICAgICAgIGNvbnN0IGVuZHBvaW50SW5mbyA9ICdQT1NUIC9jYXJkcyBPbGl2ZSBBUEknO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgQVBJIEtleSBhbmQgQmFzZSBVUkwsIG5lZWRlZCBpbiBvcmRlciB0byBtYWtlIHRoZSBQT1NUIGFkZCBjYXJkIHRocm91Z2ggdGhlIGNsaWVudFxuICAgICAgICAgICAgY29uc3QgW29saXZlQmFzZVVSTCwgb2xpdmVQdWJsaWNLZXksIG9saXZlUHJpdmF0ZUtleV0gPSBhd2FpdCBzdXBlci5yZXRyaWV2ZVNlcnZpY2VDcmVkZW50aWFscyhDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5PTElWRV9TRUNSRVRfTkFNRSk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB3ZSBvYnRhaW5lZCBhbnkgaW52YWxpZCBzZWNyZXQgdmFsdWVzIGZyb20gdGhlIGNhbGwgYWJvdmVcbiAgICAgICAgICAgIGlmIChvbGl2ZUJhc2VVUkwgPT09IG51bGwgfHwgb2xpdmVCYXNlVVJMLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG9saXZlUHVibGljS2V5ID09PSBudWxsIHx8IG9saXZlUHVibGljS2V5Lmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG9saXZlUHJpdmF0ZUtleSA9PT0gbnVsbCB8fCBvbGl2ZVByaXZhdGVLZXkhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IFwiSW52YWxpZCBTZWNyZXRzIG9idGFpbmVkIGZvciBPbGl2ZSBBUEkgY2FsbCFcIjtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBQT1NUIC9jYXJkc1xuICAgICAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIub2xpdmVsdGQuY29tL2RvY3MvMi1lbnJvbGwteW91ci1jdXN0b21lci1pbi1vbGl2ZS1wcm9ncmFtc1xuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIGJ1aWxkIHRoZSBPbGl2ZSBBUEkgcmVxdWVzdCBib2R5IHRvIGJlIHBhc3NlZCBpbiwgYW5kIHBlcmZvcm0gYSBQT1NUIHRvIGl0IHdpdGggdGhlIGFwcHJvcHJpYXRlIGluZm9ybWF0aW9uXG4gICAgICAgICAgICAgKiB3ZSBpbXBseSB0aGF0IGlmIHRoZSBBUEkgZG9lcyBub3QgcmVzcG9uZCBpbiAxNSBzZWNvbmRzLCB0aGVuIHdlIGF1dG9tYXRpY2FsbHkgY2F0Y2ggdGhhdCwgYW5kIHJldHVybiBhblxuICAgICAgICAgICAgICogZXJyb3IgZm9yIGEgYmV0dGVyIGN1c3RvbWVyIGV4cGVyaWVuY2UuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGNvbnN0IHJlcXVlc3REYXRhID0ge1xuICAgICAgICAgICAgICAgIG1lbWJlcklkOiBtZW1iZXJJZCxcbiAgICAgICAgICAgICAgICBuaWNrbmFtZTogY2FyZC5uYW1lLFxuICAgICAgICAgICAgICAgIGNhcmRUb2tlbjogY2FyZC50b2tlblxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBPbGl2ZSBBUEkgcmVxdWVzdCBPYmplY3Q6ICR7SlNPTi5zdHJpbmdpZnkocmVxdWVzdERhdGEpfWApO1xuICAgICAgICAgICAgcmV0dXJuIGF4aW9zLnBvc3QoYCR7b2xpdmVCYXNlVVJMfS9jYXJkc2AsIHJlcXVlc3REYXRhLCB7XG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAgICAgXCJPbGl2ZS1LZXlcIjogb2xpdmVQcml2YXRlS2V5XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiAxNTAwMCwgLy8gaW4gbWlsbGlzZWNvbmRzIGhlcmVcbiAgICAgICAgICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlOiAnT2xpdmUgQVBJIHRpbWVkIG91dCBhZnRlciAxNTAwMG1zISdcbiAgICAgICAgICAgIH0pLnRoZW4oYWRkQ2FyZFJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlbmRwb2ludEluZm99IHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoYWRkQ2FyZFJlc3BvbnNlLmRhdGEpfWApO1xuXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogaWYgd2UgcmVhY2hlZCB0aGlzLCB0aGVuIHdlIGFzc3VtZSB0aGF0IGEgMnh4IHJlc3BvbnNlIGNvZGUgd2FzIHJldHVybmVkLlxuICAgICAgICAgICAgICAgICAqIGNoZWNrIHRoZSBjb250ZW50cyBvZiB0aGUgcmVzcG9uc2UsIGFuZCBhY3QgYXBwcm9wcmlhdGVseS5cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBpZiAoYWRkQ2FyZFJlc3BvbnNlLmRhdGEgIT09IHVuZGVmaW5lZCAmJiBhZGRDYXJkUmVzcG9uc2UuZGF0YVtcIm1lbWJlcklkXCJdICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgYWRkQ2FyZFJlc3BvbnNlLmRhdGFbXCJpZFwiXSAhPT0gdW5kZWZpbmVkICYmIGFkZENhcmRSZXNwb25zZS5kYXRhW1wibGFzdDREaWdpdHNcIl0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBtYXRjaCB0aGUgbGFzdCA0IGZyb20gdGhlIHJlcXVlc3QuIEFsd2F5cyBnbyBieSB0aGUgL2NhcmRzIGxhc3QgNCBpbiBjYXNlIHRoZXkgZG9uJ3QgbWF0Y2hcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFkZENhcmRSZXNwb25zZS5kYXRhW1wibGFzdDREaWdpdHNcIl0gIT09IGNhcmQubGFzdDQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhcmQubGFzdDQgPSBhZGRDYXJkUmVzcG9uc2UuZGF0YVtcImxhc3Q0RGlnaXRzXCJdO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogdXNlcklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lbWJlcklkOiBhZGRDYXJkUmVzcG9uc2UuZGF0YVtcIm1lbWJlcklkXCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDogY3JlYXRlZEF0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRBdDogdXBkYXRlZEF0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRzOiBbe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi5jYXJkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogYWRkQ2FyZFJlc3BvbnNlLmRhdGFbXCJpZFwiXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1dLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdoZW5ldmVyIGFkZCBhIGNhcmQgdG8gYW4gZXhpc3RpbmcgbWVtYmVyLCB0aGVuIHdlIGF1dG9tYXRpY2FsbHkgcHV0IHRoZSBjYXJkIGxpbmtpbmcgb2JqZWN0IGluIGEgTGlua2VkIHN0YXR1c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1czogQ2FyZExpbmtpbmdTdGF0dXMuTGlua2VkXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgSW52YWxpZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UhYCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yLnJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBhbmQgdGhlIHNlcnZlciByZXNwb25kZWQgd2l0aCBhIHN0YXR1cyBjb2RlXG4gICAgICAgICAgICAgICAgICAgICAqIHRoYXQgZmFsbHMgb3V0IG9mIHRoZSByYW5nZSBvZiAyeHguXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm9uIDJ4eHggcmVzcG9uc2Ugd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE9saXZlIEFQSSwgd2l0aCBzdGF0dXMgJHtlcnJvci5yZXNwb25zZS5zdGF0dXN9LCBhbmQgcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShlcnJvci5yZXNwb25zZS5kYXRhKX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGZpbHRlciBiYXNlZCBvbiB0aGUgdHlwZSBvZiBpbmNvbWluZyBlcnJvclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBpbmNvbWluZ0Vycm9yUmVzcG9uc2UgPSBlcnJvci5yZXNwb25zZS5kYXRhO1xuICAgICAgICAgICAgICAgICAgICAvLyB1bmtub3duIHNjaGVtZVxuICAgICAgICAgICAgICAgICAgICBpZiAoaW5jb21pbmdFcnJvclJlc3BvbnNlICYmICFpbmNvbWluZ0Vycm9yUmVzcG9uc2Uuc3VjY2VzcyAmJiBpbmNvbWluZ0Vycm9yUmVzcG9uc2UubWVzc2FnZXMuaW5jbHVkZXMoXCJTY2hlbWUgdW5rbm93biBub3Qgc3VwcG9ydGVkLlwiKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBVbnN1cHBvcnRlZCBjYXJkIHNjaGVtZS5gLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuSW52YWxpZENhcmRTY2hlbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIGFueSBvdGhlciBzcGVjaWZpYyBlcnJvcnMgdG8gYmUgZmlsdGVyZWQgYmVsb3dcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVycm9yLnJlcXVlc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGJ1dCBubyByZXNwb25zZSB3YXMgcmVjZWl2ZWRcbiAgICAgICAgICAgICAgICAgICAgICogYGVycm9yLnJlcXVlc3RgIGlzIGFuIGluc3RhbmNlIG9mIFhNTEh0dHBSZXF1ZXN0IGluIHRoZSBicm93c2VyIGFuZCBhbiBpbnN0YW5jZSBvZlxuICAgICAgICAgICAgICAgICAgICAgKiAgaHR0cC5DbGllbnRSZXF1ZXN0IGluIG5vZGUuanMuXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm8gcmVzcG9uc2UgcmVjZWl2ZWQgd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE9saXZlIEFQSSwgZm9yIHJlcXVlc3QgJHtlcnJvci5yZXF1ZXN0fWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBTb21ldGhpbmcgaGFwcGVuZWQgaW4gc2V0dGluZyB1cCB0aGUgcmVxdWVzdCB0aGF0IHRyaWdnZXJlZCBhbiBFcnJvclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IGZvciB0aGUgJHtlbmRwb2ludEluZm99IE9saXZlIEFQSSwgJHsoZXJyb3IgJiYgZXJyb3IubWVzc2FnZSkgJiYgZXJyb3IubWVzc2FnZX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgaW5pdGlhdGluZyB0aGUgY2FyZCBhZGRpdGlvbiB0aHJvdWdoICR7ZW5kcG9pbnRJbmZvfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9ICR7ZXJyfWApO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdXNlZCB0byB1cGRhdGUgYSBtZW1iZXIncyBzdGF0dXMsIHRvIGVpdGhlciBhY3RpdmUgb3IgaW5hY3RpdmUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gdXNlcklkIHVuaXF1ZSB1c2VyIElEIG9mIGEgY2FyZCBsaW5raW5nIHVzZXIuXG4gICAgICogQHBhcmFtIG1lbWJlcklkIG1lbWJlciBpZCwgcmV0cmlldmVkIGZyb20gT2xpdmUsIHdoaWNoIHRoZSBzdGF0dXMgd2lsbCBiZSB1cGRhdGVkIGZvclxuICAgICAqIEBwYXJhbSBtZW1iZXJGbGFnIGZsYWcgdG8gaW5kaWNhdGUgd2hhdCB0aGUgc3RhdHVzIG9mIHRoZSBtZW1iZXIsIHdpbGwgYmUgdXBkYXRlZCB0b1xuICAgICAqIEBwYXJhbSB1cGRhdGVkQXQgY2FyZCBsaW5rZWQgb2JqZWN0IHVwZGF0ZSBkYXRlXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIGEge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBNZW1iZXJSZXNwb25zZX0gcmVwcmVzZW50aW5nIHRoZVxuICAgICAqIG1lbWJlcidzIGNvbnRlbnRzIGFmdGVyIHRoZSB1cGRhdGUgaXMgcGVyZm9ybWVkXG4gICAgICovXG4gICAgYXN5bmMgdXBkYXRlTWVtYmVyU3RhdHVzKHVzZXJJZDogc3RyaW5nLCBtZW1iZXJJZDogc3RyaW5nLCBtZW1iZXJGbGFnOiBib29sZWFuLCB1cGRhdGVkQXQ6IHN0cmluZyk6IFByb21pc2U8TWVtYmVyUmVzcG9uc2U+IHtcbiAgICAgICAgLy8gZWFzaWx5IGlkZW50aWZpYWJsZSBBUEkgZW5kcG9pbnQgaW5mb3JtYXRpb25cbiAgICAgICAgY29uc3QgZW5kcG9pbnRJbmZvID0gJ1BPU1QgL21lbWJlcnMve2lkfSBPbGl2ZSBBUEknO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgQVBJIEtleSBhbmQgQmFzZSBVUkwsIG5lZWRlZCBpbiBvcmRlciB0byBtYWtlIHRoZSBQVVQgbWVtYmVyIHVwZGF0ZSBjYWxsIHRocm91Z2ggdGhlIGNsaWVudFxuICAgICAgICAgICAgY29uc3QgW29saXZlQmFzZVVSTCwgb2xpdmVQdWJsaWNLZXksIG9saXZlUHJpdmF0ZUtleV0gPSBhd2FpdCBzdXBlci5yZXRyaWV2ZVNlcnZpY2VDcmVkZW50aWFscyhDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5PTElWRV9TRUNSRVRfTkFNRSk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB3ZSBvYnRhaW5lZCBhbnkgaW52YWxpZCBzZWNyZXQgdmFsdWVzIGZyb20gdGhlIGNhbGwgYWJvdmVcbiAgICAgICAgICAgIGlmIChvbGl2ZUJhc2VVUkwgPT09IG51bGwgfHwgb2xpdmVCYXNlVVJMLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG9saXZlUHVibGljS2V5ID09PSBudWxsIHx8IG9saXZlUHVibGljS2V5Lmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG9saXZlUHJpdmF0ZUtleSA9PT0gbnVsbCB8fCBvbGl2ZVByaXZhdGVLZXkhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IFwiSW52YWxpZCBTZWNyZXRzIG9idGFpbmVkIGZvciBPbGl2ZSBBUEkgY2FsbCFcIjtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBQVVQgL21lbWJlcnMve2lkfVxuICAgICAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIub2xpdmVsdGQuY29tL3JlZmVyZW5jZS9lZGl0LW1lbWJlclxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIGJ1aWxkIHRoZSBPbGl2ZSBBUEkgcmVxdWVzdCBib2R5IHRvIGJlIHBhc3NlZCBpbiwgYW5kIHBlcmZvcm0gYSBQVVQgdG8gaXQgd2l0aCB0aGUgYXBwcm9wcmlhdGUgaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAqIHdlIGltcGx5IHRoYXQgaWYgdGhlIEFQSSBkb2VzIG5vdCByZXNwb25kIGluIDE1IHNlY29uZHMsIHRoZW4gd2UgYXV0b21hdGljYWxseSBjYXRjaCB0aGF0LCBhbmQgcmV0dXJuIGFuXG4gICAgICAgICAgICAgKiBlcnJvciBmb3IgYSBiZXR0ZXIgY3VzdG9tZXIgZXhwZXJpZW5jZS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgY29uc3QgcmVxdWVzdERhdGEgPSB7XG4gICAgICAgICAgICAgICAgdGNBY2NlcHRlZERhdGU6IHVwZGF0ZWRBdCxcbiAgICAgICAgICAgICAgICBleHRNZW1iZXJJZDogdXNlcklkLFxuICAgICAgICAgICAgICAgIC8vIGZvciB0aGlzIGNhbGwgd2Uga25vdyBmb3Igc3VyZSB0aGF0IGF0IGNsaWVudCBpbml0aWFsaXphdGlvbiB0aW1lLCBhIG1lbWJlciBmbGFnIHdpbGwgYmUgcGFzc2VkIGluXG4gICAgICAgICAgICAgICAgaXNBY3RpdmU6IG1lbWJlckZsYWcsXG4gICAgICAgICAgICAgICAgY2FzaGJhY2tQcm9ncmFtOiB0cnVlLFxuICAgICAgICAgICAgICAgIHJvdW5kaW5nUHJvZ3JhbTogZmFsc2VcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgT2xpdmUgQVBJIHJlcXVlc3QgT2JqZWN0OiAke0pTT04uc3RyaW5naWZ5KHJlcXVlc3REYXRhKX1gKTtcblxuICAgICAgICAgICAgcmV0dXJuIGF4aW9zLnB1dChgJHtvbGl2ZUJhc2VVUkx9L21lbWJlcnMvJHttZW1iZXJJZH1gLCByZXF1ZXN0RGF0YSwge1xuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiT2xpdmUtS2V5XCI6IG9saXZlUHJpdmF0ZUtleVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGltZW91dDogMTUwMDAsIC8vIGluIG1pbGxpc2Vjb25kcyBoZXJlXG4gICAgICAgICAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZTogJ09saXZlIEFQSSB0aW1lZCBvdXQgYWZ0ZXIgMTUwMDBtcyEnXG4gICAgICAgICAgICB9KS50aGVuKHVwZGF0ZU1lbWJlclJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlbmRwb2ludEluZm99IHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkodXBkYXRlTWVtYmVyUmVzcG9uc2UuZGF0YSl9YCk7XG5cbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiBpZiB3ZSByZWFjaGVkIHRoaXMsIHRoZW4gd2UgYXNzdW1lIHRoYXQgYSAyeHggcmVzcG9uc2UgY29kZSB3YXMgcmV0dXJuZWQuXG4gICAgICAgICAgICAgICAgICogY2hlY2sgdGhlIGNvbnRlbnRzIG9mIHRoZSByZXNwb25zZSwgYW5kIGFjdCBhcHByb3ByaWF0ZWx5LlxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGlmICh1cGRhdGVNZW1iZXJSZXNwb25zZS5kYXRhICE9PSB1bmRlZmluZWQgJiYgdXBkYXRlTWVtYmVyUmVzcG9uc2UuZGF0YVtcImlkXCJdICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlTWVtYmVyUmVzcG9uc2UuZGF0YVtcImV4dE1lbWJlcklkXCJdICE9PSB1bmRlZmluZWQgJiYgKHVwZGF0ZU1lbWJlclJlc3BvbnNlLmRhdGFbXCJpc0FjdGl2ZVwiXSAhPT0gbnVsbCB8fCB1cGRhdGVNZW1iZXJSZXNwb25zZS5kYXRhW1wiaXNBY3RpdmVcIl0gIT09IHVuZGVmaW5lZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogdXBkYXRlTWVtYmVyUmVzcG9uc2UuZGF0YVtcImV4dE1lbWJlcklkXCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lbWJlcklkOiB1cGRhdGVNZW1iZXJSZXNwb25zZS5kYXRhW1wiaWRcIl0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNBY3RpdmU6IHVwZGF0ZU1lbWJlclJlc3BvbnNlLmRhdGFbXCJpc0FjdGl2ZVwiXVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogYEludmFsaWQgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gJHtlbmRwb2ludEluZm99IHJlc3BvbnNlIWAsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvclxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvci5yZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYW5kIHRoZSBzZXJ2ZXIgcmVzcG9uZGVkIHdpdGggYSBzdGF0dXMgY29kZVxuICAgICAgICAgICAgICAgICAgICAgKiAgdGhhdCBmYWxscyBvdXQgb2YgdGhlIHJhbmdlIG9mIDJ4eC5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBOb24gMnh4eCByZXNwb25zZSB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gT2xpdmUgQVBJLCB3aXRoIHN0YXR1cyAke2Vycm9yLnJlc3BvbnNlLnN0YXR1c30sIGFuZCByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGVycm9yLnJlc3BvbnNlLmRhdGEpfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gYW55IG90aGVyIHNwZWNpZmljIGVycm9ycyB0byBiZSBmaWx0ZXJlZCBiZWxvd1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3IucmVxdWVzdCkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYnV0IG5vIHJlc3BvbnNlIHdhcyByZWNlaXZlZFxuICAgICAgICAgICAgICAgICAgICAgKiBgZXJyb3IucmVxdWVzdGAgaXMgYW4gaW5zdGFuY2Ugb2YgWE1MSHR0cFJlcXVlc3QgaW4gdGhlIGJyb3dzZXIgYW5kIGFuIGluc3RhbmNlIG9mXG4gICAgICAgICAgICAgICAgICAgICAqICBodHRwLkNsaWVudFJlcXVlc3QgaW4gbm9kZS5qcy5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBObyByZXNwb25zZSByZWNlaXZlZCB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gT2xpdmUgQVBJLCBmb3IgcmVxdWVzdCAke2Vycm9yLnJlcXVlc3R9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNvbWV0aGluZyBoYXBwZW5lZCBpbiBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IHRoYXQgdHJpZ2dlcmVkIGFuIEVycm9yXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgZm9yIHRoZSAke2VuZHBvaW50SW5mb30gT2xpdmUgQVBJLCAkeyhlcnJvciAmJiBlcnJvci5tZXNzYWdlKSAmJiBlcnJvci5tZXNzYWdlfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBpbml0aWF0aW5nIG1lbWJlciB1cGRhdGUgc3RhdHVzIHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJ9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB1c2VkIHRvIHJlbW92ZS9kZWFjdGl2YXRlIGEgY2FyZCwgZ2l2ZW4gaXRzIElELlxuICAgICAqXG4gICAgICogQHBhcmFtIGNhcmRJZCB0aGUgaWQgb2YgdGhlIGNhcmQgdG8gYmUgcmVtb3ZlZC9kZWxldGVkL2RlYWN0aXZhdGVkXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIGEge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBSZW1vdmVDYXJkUmVzcG9uc2V9IHJlcHJlc2VudGluZyB0aGVcbiAgICAgKiBjYXJkIHJlbW92YWwgcmVzcG9uc2UuXG4gICAgICovXG4gICAgYXN5bmMgcmVtb3ZlQ2FyZChjYXJkSWQ6IHN0cmluZyk6IFByb21pc2U8UmVtb3ZlQ2FyZFJlc3BvbnNlPiB7XG4gICAgICAgIC8vIGVhc2lseSBpZGVudGlmaWFibGUgQVBJIGVuZHBvaW50IGluZm9ybWF0aW9uXG4gICAgICAgIGNvbnN0IGVuZHBvaW50SW5mbyA9ICdQT1NUIC9jYXJkcy97aWR9L2RlYWN0aXZhdGUgT2xpdmUgQVBJJztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIEFQSSBLZXkgYW5kIEJhc2UgVVJMLCBuZWVkZWQgaW4gb3JkZXIgdG8gbWFrZSB0aGUgUE9TVCBjYXJkIGRlYWN0aXZhdGUgY2FsbCB0aHJvdWdoIHRoZSBjbGllbnRcbiAgICAgICAgICAgIGNvbnN0IFtvbGl2ZUJhc2VVUkwsIG9saXZlUHVibGljS2V5LCBvbGl2ZVByaXZhdGVLZXldID0gYXdhaXQgc3VwZXIucmV0cmlldmVTZXJ2aWNlQ3JlZGVudGlhbHMoQ29uc3RhbnRzLkFXU1BhaXJDb25zdGFudHMuT0xJVkVfU0VDUkVUX05BTUUpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgd2Ugb2J0YWluZWQgYW55IGludmFsaWQgc2VjcmV0IHZhbHVlcyBmcm9tIHRoZSBjYWxsIGFib3ZlXG4gICAgICAgICAgICBpZiAob2xpdmVCYXNlVVJMID09PSBudWxsIHx8IG9saXZlQmFzZVVSTC5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBvbGl2ZVB1YmxpY0tleSA9PT0gbnVsbCB8fCBvbGl2ZVB1YmxpY0tleS5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBvbGl2ZVByaXZhdGVLZXkgPT09IG51bGwgfHwgb2xpdmVQcml2YXRlS2V5IS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBcIkludmFsaWQgU2VjcmV0cyBvYnRhaW5lZCBmb3IgT2xpdmUgQVBJIGNhbGwhXCI7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogUE9TVCAvY2FyZHMve2lkfS9kZWFjdGl2YXRlXG4gICAgICAgICAgICAgKiBAbGluayBodHRwczovL2RldmVsb3Blci5vbGl2ZWx0ZC5jb20vcmVmZXJlbmNlL2RlbGV0ZS1jYXJkXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogYnVpbGQgdGhlIE9saXZlIEFQSSByZXF1ZXN0IGJvZHkgdG8gYmUgcGFzc2VkIGluLCBhbmQgcGVyZm9ybSBhIFBPU1QgdG8gaXQgd2l0aCB0aGUgYXBwcm9wcmlhdGUgaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAqIHdlIGltcGx5IHRoYXQgaWYgdGhlIEFQSSBkb2VzIG5vdCByZXNwb25kIGluIDE1IHNlY29uZHMsIHRoZW4gd2UgYXV0b21hdGljYWxseSBjYXRjaCB0aGF0LCBhbmQgcmV0dXJuIGFuXG4gICAgICAgICAgICAgKiBlcnJvciBmb3IgYSBiZXR0ZXIgY3VzdG9tZXIgZXhwZXJpZW5jZS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgcmV0dXJuIGF4aW9zLnBvc3QoYCR7b2xpdmVCYXNlVVJMfS9jYXJkcy8ke2NhcmRJZH0vZGVhY3RpdmF0ZWAsIHVuZGVmaW5lZCwge1xuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiT2xpdmUtS2V5XCI6IG9saXZlUHJpdmF0ZUtleVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGltZW91dDogMTUwMDAsIC8vIGluIG1pbGxpc2Vjb25kcyBoZXJlXG4gICAgICAgICAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZTogJ09saXZlIEFQSSB0aW1lZCBvdXQgYWZ0ZXIgMTUwMDBtcyEnXG4gICAgICAgICAgICB9KS50aGVuKHJlbW92ZUNhcmRSZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KHJlbW92ZUNhcmRSZXNwb25zZS5kYXRhKX1gKTtcblxuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIGlmIHdlIHJlYWNoZWQgdGhpcywgdGhlbiB3ZSBhc3N1bWUgdGhhdCBhIDJ4eCByZXNwb25zZSBjb2RlIHdhcyByZXR1cm5lZC5cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBpZiAocmVtb3ZlQ2FyZFJlc3BvbnNlLmRhdGEgPT09IFwiXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBJbnZhbGlkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tICR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSFgLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IucmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGFuZCB0aGUgc2VydmVyIHJlc3BvbmRlZCB3aXRoIGEgc3RhdHVzIGNvZGVcbiAgICAgICAgICAgICAgICAgICAgICogdGhhdCBmYWxscyBvdXQgb2YgdGhlIHJhbmdlIG9mIDJ4eC5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBOb24gMnh4eCByZXNwb25zZSB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gT2xpdmUgQVBJLCB3aXRoIHN0YXR1cyAke2Vycm9yLnJlc3BvbnNlLnN0YXR1c30sIGFuZCByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGVycm9yLnJlc3BvbnNlLmRhdGEpfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gYW55IG90aGVyIHNwZWNpZmljIGVycm9ycyB0byBiZSBmaWx0ZXJlZCBiZWxvd1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3IucmVxdWVzdCkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYnV0IG5vIHJlc3BvbnNlIHdhcyByZWNlaXZlZFxuICAgICAgICAgICAgICAgICAgICAgKiBgZXJyb3IucmVxdWVzdGAgaXMgYW4gaW5zdGFuY2Ugb2YgWE1MSHR0cFJlcXVlc3QgaW4gdGhlIGJyb3dzZXIgYW5kIGFuIGluc3RhbmNlIG9mXG4gICAgICAgICAgICAgICAgICAgICAqICBodHRwLkNsaWVudFJlcXVlc3QgaW4gbm9kZS5qcy5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBObyByZXNwb25zZSByZWNlaXZlZCB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gT2xpdmUgQVBJLCBmb3IgcmVxdWVzdCAke2Vycm9yLnJlcXVlc3R9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNvbWV0aGluZyBoYXBwZW5lZCBpbiBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IHRoYXQgdHJpZ2dlcmVkIGFuIEVycm9yXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgZm9yIHRoZSAke2VuZHBvaW50SW5mb30gT2xpdmUgQVBJLCAkeyhlcnJvciAmJiBlcnJvci5tZXNzYWdlKSAmJiBlcnJvci5tZXNzYWdlfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBpbml0aWF0aW5nIHRoZSBjYXJkIHJlbW92YWwgdGhyb3VnaCAke2VuZHBvaW50SW5mb31gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfSAke2Vycn1gKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHVzZWQgdG8gcmV0cmlldmUgdGhlIGRldGFpbHMgb2YgYSBnaXZlbiBjYXJkLCBnaXZlbiBpdHMgY29ycmVzcG9uZGluZyBpZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBjYXJkSWQgdGhlIGlkIG9mIHRoZSBjYXJkIHRvIHJldHJpZXZlIHRoZSBkZXRhaWxzIGZvclxuICAgICAqXG4gICAgICogQHJldHVybiBhIHtsaW5rIFByb21pc2V9IG9mIHtAbGluayBDYXJkRGV0YWlsc1Jlc3BvbnNlfSByZXByZXNlbnRpbmcgdGhlIGV4cGlyYXRpb24gZGF0ZSBvZlxuICAgICAqIHRoZSBjYXJkIHRvIGJlIHJldHJpZXZlZC5cbiAgICAgKi9cbiAgICBhc3luYyBnZXRDYXJkRGV0YWlscyhjYXJkSWQ6IHN0cmluZyk6IFByb21pc2U8Q2FyZERldGFpbHNSZXNwb25zZT4ge1xuICAgICAgICAvLyBlYXNpbHkgaWRlbnRpZmlhYmxlIEFQSSBlbmRwb2ludCBpbmZvcm1hdGlvblxuICAgICAgICBjb25zdCBlbmRwb2ludEluZm8gPSAnR0VUIC9jYXJkcy97aWR9IE9saXZlIEFQSSc7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBBUEkgS2V5IGFuZCBCYXNlIFVSTCwgbmVlZGVkIGluIG9yZGVyIHRvIG1ha2UgdGhlIEdFVCBjYXJkIGRldGFpbHMgY2FsbCB0aHJvdWdoIHRoZSBjbGllbnRcbiAgICAgICAgICAgIGNvbnN0IFtvbGl2ZUJhc2VVUkwsIG9saXZlUHVibGljS2V5LCBvbGl2ZVByaXZhdGVLZXldID0gYXdhaXQgc3VwZXIucmV0cmlldmVTZXJ2aWNlQ3JlZGVudGlhbHMoQ29uc3RhbnRzLkFXU1BhaXJDb25zdGFudHMuT0xJVkVfU0VDUkVUX05BTUUpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgd2Ugb2J0YWluZWQgYW55IGludmFsaWQgc2VjcmV0IHZhbHVlcyBmcm9tIHRoZSBjYWxsIGFib3ZlXG4gICAgICAgICAgICBpZiAob2xpdmVCYXNlVVJMID09PSBudWxsIHx8IG9saXZlQmFzZVVSTC5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBvbGl2ZVB1YmxpY0tleSA9PT0gbnVsbCB8fCBvbGl2ZVB1YmxpY0tleS5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBvbGl2ZVByaXZhdGVLZXkgPT09IG51bGwgfHwgb2xpdmVQcml2YXRlS2V5IS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBcIkludmFsaWQgU2VjcmV0cyBvYnRhaW5lZCBmb3IgT2xpdmUgQVBJIGNhbGwhXCI7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogR0VUIC9jYXJkcy97aWR9XG4gICAgICAgICAgICAgKiBAbGluayBodHRwczovL2RldmVsb3Blci5vbGl2ZWx0ZC5jb20vcmVmZXJlbmNlL2dldC1jYXJkXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogYnVpbGQgdGhlIE9saXZlIEFQSSByZXF1ZXN0IGJvZHkgdG8gYmUgcGFzc2VkIGluLCBhbmQgcGVyZm9ybSBhIEdFVCB0byBpdCB3aXRoIHRoZSBhcHByb3ByaWF0ZSBpbmZvcm1hdGlvblxuICAgICAgICAgICAgICogd2UgaW1wbHkgdGhhdCBpZiB0aGUgQVBJIGRvZXMgbm90IHJlc3BvbmQgaW4gMTUgc2Vjb25kcywgdGhlbiB3ZSBhdXRvbWF0aWNhbGx5IGNhdGNoIHRoYXQsIGFuZCByZXR1cm4gYW5cbiAgICAgICAgICAgICAqIGVycm9yIGZvciBhIGJldHRlciBjdXN0b21lciBleHBlcmllbmNlLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICByZXR1cm4gYXhpb3MuZ2V0KGAke29saXZlQmFzZVVSTH0vY2FyZHMvJHtjYXJkSWR9YCwge1xuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiT2xpdmUtS2V5XCI6IG9saXZlUHJpdmF0ZUtleVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGltZW91dDogMTUwMDAsIC8vIGluIG1pbGxpc2Vjb25kcyBoZXJlXG4gICAgICAgICAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZTogJ09saXZlIEFQSSB0aW1lZCBvdXQgYWZ0ZXIgMTUwMDBtcyEnXG4gICAgICAgICAgICB9KS50aGVuKGNhcmREZXRhaWxzUmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShjYXJkRGV0YWlsc1Jlc3BvbnNlLmRhdGEpfWApO1xuXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogaWYgd2UgcmVhY2hlZCB0aGlzLCB0aGVuIHdlIGFzc3VtZSB0aGF0IGEgMnh4IHJlc3BvbnNlIGNvZGUgd2FzIHJldHVybmVkLlxuICAgICAgICAgICAgICAgICAqIGNoZWNrIHRoZSBjb250ZW50cyBvZiB0aGUgcmVzcG9uc2UsIGFuZCBhY3QgYXBwcm9wcmlhdGVseS5cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBpZiAoY2FyZERldGFpbHNSZXNwb25zZS5kYXRhICE9PSB1bmRlZmluZWQgJiYgY2FyZERldGFpbHNSZXNwb25zZS5kYXRhW1wiaWRcIl0gIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgICAgICAgICBjYXJkRGV0YWlsc1Jlc3BvbnNlLmRhdGFbXCJleHBpcnlNb250aFwiXSAhPT0gdW5kZWZpbmVkICYmIGNhcmREZXRhaWxzUmVzcG9uc2UuZGF0YVtcImV4cGlyeVllYXJcIl0gIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgICAgICAgICBjYXJkRGV0YWlsc1Jlc3BvbnNlLmRhdGFbXCJpZFwiXSA9PT0gY2FyZElkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgY2FyZCBkZXRhaWxzIGZyb20gdGhlIHJlc3BvbnNlIChleHBpcmF0aW9uIGRhdGUgZm9yIG5vdylcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGAke2NhcmREZXRhaWxzUmVzcG9uc2UuZGF0YVtcImV4cGlyeU1vbnRoXCJdfS8ke2NhcmREZXRhaWxzUmVzcG9uc2UuZGF0YVtcImV4cGlyeVllYXJcIl19YFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogYEludmFsaWQgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gJHtlbmRwb2ludEluZm99IHJlc3BvbnNlIWAsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvclxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvci5yZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYW5kIHRoZSBzZXJ2ZXIgcmVzcG9uZGVkIHdpdGggYSBzdGF0dXMgY29kZVxuICAgICAgICAgICAgICAgICAgICAgKiB0aGF0IGZhbGxzIG91dCBvZiB0aGUgcmFuZ2Ugb2YgMnh4LlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vbiAyeHh4IHJlc3BvbnNlIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBPbGl2ZSBBUEksIHdpdGggc3RhdHVzICR7ZXJyb3IucmVzcG9uc2Uuc3RhdHVzfSwgYW5kIHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZXJyb3IucmVzcG9uc2UuZGF0YSl9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBhbnkgb3RoZXIgc3BlY2lmaWMgZXJyb3JzIHRvIGJlIGZpbHRlcmVkIGJlbG93XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5yZXF1ZXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBidXQgbm8gcmVzcG9uc2Ugd2FzIHJlY2VpdmVkXG4gICAgICAgICAgICAgICAgICAgICAqIGBlcnJvci5yZXF1ZXN0YCBpcyBhbiBpbnN0YW5jZSBvZiBYTUxIdHRwUmVxdWVzdCBpbiB0aGUgYnJvd3NlciBhbmQgYW4gaW5zdGFuY2Ugb2ZcbiAgICAgICAgICAgICAgICAgICAgICogIGh0dHAuQ2xpZW50UmVxdWVzdCBpbiBub2RlLmpzLlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vIHJlc3BvbnNlIHJlY2VpdmVkIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBPbGl2ZSBBUEksIGZvciByZXF1ZXN0ICR7ZXJyb3IucmVxdWVzdH1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU29tZXRoaW5nIGhhcHBlbmVkIGluIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgdGhhdCB0cmlnZ2VyZWQgYW4gRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgc2V0dGluZyB1cCB0aGUgcmVxdWVzdCBmb3IgdGhlICR7ZW5kcG9pbnRJbmZvfSBPbGl2ZSBBUEksICR7KGVycm9yICYmIGVycm9yLm1lc3NhZ2UpICYmIGVycm9yLm1lc3NhZ2V9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGluaXRpYXRpbmcgdGhlIGNhcmQgZGV0YWlscyByZXRyaWV2YWwgdGhyb3VnaCAke2VuZHBvaW50SW5mb31gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfSAke2Vycn1gKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHVzZWQgdG8gcmV0cmlldmUgdGhlIGJyYW5kIGRldGFpbHMsIGdpdmVuIGEgYnJhbmQgSUQgZm9yIGFuIGluZWxpZ2libGUgYnJhbmRcbiAgICAgKiByZXN1bHRlZCBmcm9tIGFuIGluZWxpZ2libGUgdHJhbnNhY3Rpb24uXG4gICAgICpcbiAgICAgKiBAcGFyYW0gaW5lbGlnaWJsZVRyYW5zYWN0aW9uIHRoZSBpbmVsaWdpYmxlIHRyYW5zYWN0aW9uIG9iamVjdCwgcG9wdWxhdGVkIGJ5IHRoZSBpbml0aWFsIGRldGFpbHNcbiAgICAgKiBwYXNzZWQgaW4gYnkgT2xpdmUuIFRoaXMgb2JqZWN0IHdpbGwgYmUgdXNlZCB0byBzZXQgZXZlbiBtb3JlIGluZm9ybWF0aW9uIGZvclxuICAgICAqIGl0LCBvYnRhaW5lZCBmcm9tIHRoaXMgYnJhbmQgY2FsbC5cbiAgICAgKlxuICAgICAqIEByZXR1cm4gYSB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIEluZWxpZ2libGVUcmFuc2FjdGlvblJlc3BvbnNlfSByZXByZXNlbnRpbmcgdGhlXG4gICAgICogaW5lbGlnaWJsZSB0cmFuc2FjdGlvbiB3aXRoIHRoZSBicmFuZCBkZXRhaWxzIG9idGFpbmVkLCBpbmNsdWRlZCBpbiBpdC5cbiAgICAgKlxuICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgKi9cbiAgICBhc3luYyBnZXRJbmVsaWdpYmxlQnJhbmREZXRhaWxzKGluZWxpZ2libGVUcmFuc2FjdGlvbjogSW5lbGlnaWJsZVRyYW5zYWN0aW9uKTogUHJvbWlzZTxJbmVsaWdpYmxlVHJhbnNhY3Rpb25SZXNwb25zZT4ge1xuICAgICAgICAvLyBlYXNpbHkgaWRlbnRpZmlhYmxlIEFQSSBlbmRwb2ludCBpbmZvcm1hdGlvblxuICAgICAgICBjb25zdCBlbmRwb2ludEluZm8gPSAnR0VUIC9icmFuZHMve2lkfSBPbGl2ZSBBUEknO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgQVBJIEtleSBhbmQgQmFzZSBVUkwsIG5lZWRlZCBpbiBvcmRlciB0byBtYWtlIHRoZSBHRVQgYnJhbmQgZGV0YWlscyBjYWxsIHRocm91Z2ggdGhlIGNsaWVudFxuICAgICAgICAgICAgY29uc3QgW29saXZlQmFzZVVSTCwgb2xpdmVQdWJsaWNLZXksIG9saXZlUHJpdmF0ZUtleV0gPSBhd2FpdCBzdXBlci5yZXRyaWV2ZVNlcnZpY2VDcmVkZW50aWFscyhDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5PTElWRV9TRUNSRVRfTkFNRSk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB3ZSBvYnRhaW5lZCBhbnkgaW52YWxpZCBzZWNyZXQgdmFsdWVzIGZyb20gdGhlIGNhbGwgYWJvdmVcbiAgICAgICAgICAgIGlmIChvbGl2ZUJhc2VVUkwgPT09IG51bGwgfHwgb2xpdmVCYXNlVVJMLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG9saXZlUHVibGljS2V5ID09PSBudWxsIHx8IG9saXZlUHVibGljS2V5Lmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG9saXZlUHJpdmF0ZUtleSA9PT0gbnVsbCB8fCBvbGl2ZVByaXZhdGVLZXkhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IFwiSW52YWxpZCBTZWNyZXRzIG9idGFpbmVkIGZvciBPbGl2ZSBBUEkgY2FsbCFcIjtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogR0VUIC9icmFuZHMve2lkfVxuICAgICAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIub2xpdmVsdGQuY29tL3JlZmVyZW5jZS9nZXQtYnJhbmRcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBidWlsZCB0aGUgT2xpdmUgQVBJIHJlcXVlc3QgYm9keSB0byBiZSBwYXNzZWQgaW4sIGFuZCBwZXJmb3JtIGEgR0VUIHRvIGl0IHdpdGggdGhlIGFwcHJvcHJpYXRlIGluZm9ybWF0aW9uXG4gICAgICAgICAgICAgKiB3ZSBpbXBseSB0aGF0IGlmIHRoZSBBUEkgZG9lcyBub3QgcmVzcG9uZCBpbiAxNSBzZWNvbmRzLCB0aGVuIHdlIGF1dG9tYXRpY2FsbHkgY2F0Y2ggdGhhdCwgYW5kIHJldHVybiBhblxuICAgICAgICAgICAgICogZXJyb3IgZm9yIGEgYmV0dGVyIGN1c3RvbWVyIGV4cGVyaWVuY2UuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHJldHVybiBheGlvcy5nZXQoYCR7b2xpdmVCYXNlVVJMfS9icmFuZHMvJHtpbmVsaWdpYmxlVHJhbnNhY3Rpb24uYnJhbmRJZH1gLCB7XG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAgICAgXCJPbGl2ZS1LZXlcIjogb2xpdmVQcml2YXRlS2V5XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiAxNTAwMCwgLy8gaW4gbWlsbGlzZWNvbmRzIGhlcmVcbiAgICAgICAgICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlOiAnT2xpdmUgQVBJIHRpbWVkIG91dCBhZnRlciAxNTAwMG1zISdcbiAgICAgICAgICAgIH0pLnRoZW4oYnJhbmREZXRhaWxzUmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShicmFuZERldGFpbHNSZXNwb25zZS5kYXRhKX1gKTtcblxuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIGlmIHdlIHJlYWNoZWQgdGhpcywgdGhlbiB3ZSBhc3N1bWUgdGhhdCBhIDJ4eCByZXNwb25zZSBjb2RlIHdhcyByZXR1cm5lZC5cbiAgICAgICAgICAgICAgICAgKiBjaGVjayB0aGUgY29udGVudHMgb2YgdGhlIHJlc3BvbnNlLCBhbmQgYWN0IGFwcHJvcHJpYXRlbHkuXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgaWYgKGJyYW5kRGV0YWlsc1Jlc3BvbnNlLmRhdGEgIT09IHVuZGVmaW5lZCAmJiBicmFuZERldGFpbHNSZXNwb25zZS5kYXRhW1wiZGJhXCJdICE9PSB1bmRlZmluZWQgJiYgYnJhbmREZXRhaWxzUmVzcG9uc2UuZGF0YVtcImxvZ29VcmxcIl0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBzZXQgdGhlIGJyYW5kIGRldGFpbHMgZm9yIHRoZSBpbmVsaWdpYmxlIHRyYW5zYWN0aW9uIG9iamVjdCwgZnJvbSB0aGUgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICAgICAgaW5lbGlnaWJsZVRyYW5zYWN0aW9uLnRyYW5zYWN0aW9uQnJhbmROYW1lID0gYnJhbmREZXRhaWxzUmVzcG9uc2UuZGF0YVtcImRiYVwiXTtcbiAgICAgICAgICAgICAgICAgICAgaW5lbGlnaWJsZVRyYW5zYWN0aW9uLnRyYW5zYWN0aW9uQnJhbmRMb2dvVXJsID0gYnJhbmREZXRhaWxzUmVzcG9uc2UuZGF0YVtcImxvZ29VcmxcIl07XG4gICAgICAgICAgICAgICAgICAgIGluZWxpZ2libGVUcmFuc2FjdGlvbi50cmFuc2FjdGlvbkJyYW5kVVJMQWRkcmVzcyA9IGJyYW5kRGV0YWlsc1Jlc3BvbnNlLmRhdGFbXCJ3ZWJzaXRlXCJdICE9PSB1bmRlZmluZWQgPyBicmFuZERldGFpbHNSZXNwb25zZS5kYXRhW1wid2Vic2l0ZVwiXSA6ICdOb3QgQXZhaWxhYmxlJztcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGluZWxpZ2libGVUcmFuc2FjdGlvblxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogYEludmFsaWQgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gJHtlbmRwb2ludEluZm99IHJlc3BvbnNlIWAsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IucmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGFuZCB0aGUgc2VydmVyIHJlc3BvbmRlZCB3aXRoIGEgc3RhdHVzIGNvZGVcbiAgICAgICAgICAgICAgICAgICAgICogdGhhdCBmYWxscyBvdXQgb2YgdGhlIHJhbmdlIG9mIDJ4eC5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBOb24gMnh4eCByZXNwb25zZSB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gT2xpdmUgQVBJLCB3aXRoIHN0YXR1cyAke2Vycm9yLnJlc3BvbnNlLnN0YXR1c30sIGFuZCByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGVycm9yLnJlc3BvbnNlLmRhdGEpfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gYW55IG90aGVyIHNwZWNpZmljIGVycm9ycyB0byBiZSBmaWx0ZXJlZCBiZWxvd1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVycm9yLnJlcXVlc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGJ1dCBubyByZXNwb25zZSB3YXMgcmVjZWl2ZWRcbiAgICAgICAgICAgICAgICAgICAgICogYGVycm9yLnJlcXVlc3RgIGlzIGFuIGluc3RhbmNlIG9mIFhNTEh0dHBSZXF1ZXN0IGluIHRoZSBicm93c2VyIGFuZCBhbiBpbnN0YW5jZSBvZlxuICAgICAgICAgICAgICAgICAgICAgKiAgaHR0cC5DbGllbnRSZXF1ZXN0IGluIG5vZGUuanMuXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm8gcmVzcG9uc2UgcmVjZWl2ZWQgd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE9saXZlIEFQSSwgZm9yIHJlcXVlc3QgJHtlcnJvci5yZXF1ZXN0fWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU29tZXRoaW5nIGhhcHBlbmVkIGluIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgdGhhdCB0cmlnZ2VyZWQgYW4gRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgc2V0dGluZyB1cCB0aGUgcmVxdWVzdCBmb3IgdGhlICR7ZW5kcG9pbnRJbmZvfSBPbGl2ZSBBUEksICR7KGVycm9yICYmIGVycm9yLm1lc3NhZ2UpICYmIGVycm9yLm1lc3NhZ2V9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBpbml0aWF0aW5nIHRoZSBicmFuZCBkZXRhaWxzIHJldHJpZXZhbCB0aHJvdWdoICR7ZW5kcG9pbnRJbmZvfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9ICR7ZXJyfWApO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHVzZWQgdG8gcmV0cmlldmUgdGhlIGJyYW5kIGRldGFpbHMsIGdpdmVuIGEgYnJhbmQgSUQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gdHJhbnNhY3Rpb24gdGhlIHRyYW5zYWN0aW9uIG9iamVjdCwgcG9wdWxhdGVkIGJ5IHRoZSBpbml0aWFsIGRldGFpbHNcbiAgICAgKiBwYXNzZWQgaW4gYnkgT2xpdmUuIFRoaXMgb2JqZWN0IHdpbGwgYmUgdXNlZCB0byBzZXQgZXZlbiBtb3JlIGluZm9ybWF0aW9uIGZvclxuICAgICAqIGl0LCBvYnRhaW5lZCBmcm9tIHRoaXMgYnJhbmQgY2FsbC5cbiAgICAgKlxuICAgICAqIEByZXR1cm4gYSB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIFRyYW5zYWN0aW9uUmVzcG9uc2V9IHJlcHJlc2VudGluZyB0aGVcbiAgICAgKiB0cmFuc2FjdGlvbiBvYmplY3QsIHBvcHVsYXRlZCB3aXRoIHRoZSBicmFuZCBkZXRhaWxzXG4gICAgICovXG4gICAgYXN5bmMgZ2V0QnJhbmREZXRhaWxzKHRyYW5zYWN0aW9uOiBUcmFuc2FjdGlvbik6IFByb21pc2U8VHJhbnNhY3Rpb25SZXNwb25zZT4ge1xuICAgICAgICAvLyBlYXNpbHkgaWRlbnRpZmlhYmxlIEFQSSBlbmRwb2ludCBpbmZvcm1hdGlvblxuICAgICAgICBjb25zdCBlbmRwb2ludEluZm8gPSAnR0VUIC9icmFuZHMve2lkfSBPbGl2ZSBBUEknO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgQVBJIEtleSBhbmQgQmFzZSBVUkwsIG5lZWRlZCBpbiBvcmRlciB0byBtYWtlIHRoZSBHRVQgYnJhbmQgZGV0YWlscyBjYWxsIHRocm91Z2ggdGhlIGNsaWVudFxuICAgICAgICAgICAgY29uc3QgW29saXZlQmFzZVVSTCwgb2xpdmVQdWJsaWNLZXksIG9saXZlUHJpdmF0ZUtleV0gPSBhd2FpdCBzdXBlci5yZXRyaWV2ZVNlcnZpY2VDcmVkZW50aWFscyhDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5PTElWRV9TRUNSRVRfTkFNRSk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB3ZSBvYnRhaW5lZCBhbnkgaW52YWxpZCBzZWNyZXQgdmFsdWVzIGZyb20gdGhlIGNhbGwgYWJvdmVcbiAgICAgICAgICAgIGlmIChvbGl2ZUJhc2VVUkwgPT09IG51bGwgfHwgb2xpdmVCYXNlVVJMLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG9saXZlUHVibGljS2V5ID09PSBudWxsIHx8IG9saXZlUHVibGljS2V5Lmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG9saXZlUHJpdmF0ZUtleSA9PT0gbnVsbCB8fCBvbGl2ZVByaXZhdGVLZXkhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IFwiSW52YWxpZCBTZWNyZXRzIG9idGFpbmVkIGZvciBPbGl2ZSBBUEkgY2FsbCFcIjtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogR0VUIC9icmFuZHMve2lkfVxuICAgICAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIub2xpdmVsdGQuY29tL3JlZmVyZW5jZS9nZXQtYnJhbmRcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBidWlsZCB0aGUgT2xpdmUgQVBJIHJlcXVlc3QgYm9keSB0byBiZSBwYXNzZWQgaW4sIGFuZCBwZXJmb3JtIGEgR0VUIHRvIGl0IHdpdGggdGhlIGFwcHJvcHJpYXRlIGluZm9ybWF0aW9uXG4gICAgICAgICAgICAgKiB3ZSBpbXBseSB0aGF0IGlmIHRoZSBBUEkgZG9lcyBub3QgcmVzcG9uZCBpbiAxNSBzZWNvbmRzLCB0aGVuIHdlIGF1dG9tYXRpY2FsbHkgY2F0Y2ggdGhhdCwgYW5kIHJldHVybiBhblxuICAgICAgICAgICAgICogZXJyb3IgZm9yIGEgYmV0dGVyIGN1c3RvbWVyIGV4cGVyaWVuY2UuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHJldHVybiBheGlvcy5nZXQoYCR7b2xpdmVCYXNlVVJMfS9icmFuZHMvJHt0cmFuc2FjdGlvbi5icmFuZElkfWAsIHtcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgICAgICBcIk9saXZlLUtleVwiOiBvbGl2ZVByaXZhdGVLZXlcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDE1MDAwLCAvLyBpbiBtaWxsaXNlY29uZHMgaGVyZVxuICAgICAgICAgICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2U6ICdPbGl2ZSBBUEkgdGltZWQgb3V0IGFmdGVyIDE1MDAwbXMhJ1xuICAgICAgICAgICAgfSkudGhlbihicmFuZERldGFpbHNSZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGJyYW5kRGV0YWlsc1Jlc3BvbnNlLmRhdGEpfWApO1xuXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogaWYgd2UgcmVhY2hlZCB0aGlzLCB0aGVuIHdlIGFzc3VtZSB0aGF0IGEgMnh4IHJlc3BvbnNlIGNvZGUgd2FzIHJldHVybmVkLlxuICAgICAgICAgICAgICAgICAqIGNoZWNrIHRoZSBjb250ZW50cyBvZiB0aGUgcmVzcG9uc2UsIGFuZCBhY3QgYXBwcm9wcmlhdGVseS5cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBpZiAoYnJhbmREZXRhaWxzUmVzcG9uc2UuZGF0YSAhPT0gdW5kZWZpbmVkICYmIGJyYW5kRGV0YWlsc1Jlc3BvbnNlLmRhdGFbXCJkYmFcIl0gIT09IHVuZGVmaW5lZCAmJiBicmFuZERldGFpbHNSZXNwb25zZS5kYXRhW1wibG9nb1VybFwiXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHNldCB0aGUgYnJhbmQgZGV0YWlscyBmb3IgdGhlIHRyYW5zYWN0aW9uIG9iamVjdCwgZnJvbSB0aGUgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb24udHJhbnNhY3Rpb25CcmFuZE5hbWUgPSBicmFuZERldGFpbHNSZXNwb25zZS5kYXRhW1wiZGJhXCJdO1xuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbi50cmFuc2FjdGlvbkJyYW5kTG9nb1VybCA9IGJyYW5kRGV0YWlsc1Jlc3BvbnNlLmRhdGFbXCJsb2dvVXJsXCJdO1xuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbi50cmFuc2FjdGlvbkJyYW5kVVJMQWRkcmVzcyA9IGJyYW5kRGV0YWlsc1Jlc3BvbnNlLmRhdGFbXCJ3ZWJzaXRlXCJdICE9PSB1bmRlZmluZWQgPyBicmFuZERldGFpbHNSZXNwb25zZS5kYXRhW1wid2Vic2l0ZVwiXSA6ICdOb3QgQXZhaWxhYmxlJztcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHRyYW5zYWN0aW9uXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgSW52YWxpZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UhYCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvclxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvci5yZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYW5kIHRoZSBzZXJ2ZXIgcmVzcG9uZGVkIHdpdGggYSBzdGF0dXMgY29kZVxuICAgICAgICAgICAgICAgICAgICAgKiB0aGF0IGZhbGxzIG91dCBvZiB0aGUgcmFuZ2Ugb2YgMnh4LlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vbiAyeHh4IHJlc3BvbnNlIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBPbGl2ZSBBUEksIHdpdGggc3RhdHVzICR7ZXJyb3IucmVzcG9uc2Uuc3RhdHVzfSwgYW5kIHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZXJyb3IucmVzcG9uc2UuZGF0YSl9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBhbnkgb3RoZXIgc3BlY2lmaWMgZXJyb3JzIHRvIGJlIGZpbHRlcmVkIGJlbG93XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3IucmVxdWVzdCkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYnV0IG5vIHJlc3BvbnNlIHdhcyByZWNlaXZlZFxuICAgICAgICAgICAgICAgICAgICAgKiBgZXJyb3IucmVxdWVzdGAgaXMgYW4gaW5zdGFuY2Ugb2YgWE1MSHR0cFJlcXVlc3QgaW4gdGhlIGJyb3dzZXIgYW5kIGFuIGluc3RhbmNlIG9mXG4gICAgICAgICAgICAgICAgICAgICAqICBodHRwLkNsaWVudFJlcXVlc3QgaW4gbm9kZS5qcy5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBObyByZXNwb25zZSByZWNlaXZlZCB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gT2xpdmUgQVBJLCBmb3IgcmVxdWVzdCAke2Vycm9yLnJlcXVlc3R9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBTb21ldGhpbmcgaGFwcGVuZWQgaW4gc2V0dGluZyB1cCB0aGUgcmVxdWVzdCB0aGF0IHRyaWdnZXJlZCBhbiBFcnJvclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IGZvciB0aGUgJHtlbmRwb2ludEluZm99IE9saXZlIEFQSSwgJHsoZXJyb3IgJiYgZXJyb3IubWVzc2FnZSkgJiYgZXJyb3IubWVzc2FnZX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGluaXRpYXRpbmcgdGhlIGJyYW5kIGRldGFpbHMgcmV0cmlldmFsIHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJ9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdXNlZCB0byByZXRyaWV2ZSB0aGUgc3RvcmUgZGV0YWlscywgZ2l2ZW4gYSBzdG9yZSBJRC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB0cmFuc2FjdGlvbiB0aGUgdHJhbnNhY3Rpb24gb2JqZWN0LCBwb3B1bGF0ZWQgYnkgdGhlIGluaXRpYWwgZGV0YWlsc1xuICAgICAqIHBhc3NlZCBpbiBieSBPbGl2ZS4gVGhpcyBvYmplY3Qgd2lsbCBiZSB1c2VkIHRvIHNldCBldmVuIG1vcmUgaW5mb3JtYXRpb24gZm9yXG4gICAgICogaXQsIG9idGFpbmVkIGZyb20gdGhpcyBicmFuZCBjYWxsLlxuICAgICAqXG4gICAgICogQHJldHVybiBhIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgVHJhbnNhY3Rpb25SZXNwb25zZX0gcmVwcmVzZW50aW5nIHRoZSB0cmFuc2FjdGlvblxuICAgICAqIHdpdGggdGhlIHN0b3JlIGRldGFpbHMgb2J0YWluZWQsIGluY2x1ZGVkIGluIGl0LlxuICAgICAqL1xuICAgIGFzeW5jIGdldFN0b3JlRGV0YWlscyh0cmFuc2FjdGlvbjogVHJhbnNhY3Rpb24pOiBQcm9taXNlPFRyYW5zYWN0aW9uUmVzcG9uc2U+IHtcbiAgICAgICAgLy8gZWFzaWx5IGlkZW50aWZpYWJsZSBBUEkgZW5kcG9pbnQgaW5mb3JtYXRpb25cbiAgICAgICAgY29uc3QgZW5kcG9pbnRJbmZvID0gJ0dFVCAvc3RvcmVzL3tpZH0gT2xpdmUgQVBJJztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIEFQSSBLZXkgYW5kIEJhc2UgVVJMLCBuZWVkZWQgaW4gb3JkZXIgdG8gbWFrZSB0aGUgR0VUIHN0b3JlIGRldGFpbHMgY2FsbCB0aHJvdWdoIHRoZSBjbGllbnRcbiAgICAgICAgICAgIGNvbnN0IFtvbGl2ZUJhc2VVUkwsIG9saXZlUHVibGljS2V5LCBvbGl2ZVByaXZhdGVLZXldID0gYXdhaXQgc3VwZXIucmV0cmlldmVTZXJ2aWNlQ3JlZGVudGlhbHMoQ29uc3RhbnRzLkFXU1BhaXJDb25zdGFudHMuT0xJVkVfU0VDUkVUX05BTUUpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgd2Ugb2J0YWluZWQgYW55IGludmFsaWQgc2VjcmV0IHZhbHVlcyBmcm9tIHRoZSBjYWxsIGFib3ZlXG4gICAgICAgICAgICBpZiAob2xpdmVCYXNlVVJMID09PSBudWxsIHx8IG9saXZlQmFzZVVSTC5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBvbGl2ZVB1YmxpY0tleSA9PT0gbnVsbCB8fCBvbGl2ZVB1YmxpY0tleS5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBvbGl2ZVByaXZhdGVLZXkgPT09IG51bGwgfHwgb2xpdmVQcml2YXRlS2V5IS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBcIkludmFsaWQgU2VjcmV0cyBvYnRhaW5lZCBmb3IgT2xpdmUgQVBJIGNhbGwhXCI7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEdFVCAvc3RvcmVzL3tpZH1cbiAgICAgICAgICAgICAqIEBsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm9saXZlbHRkLmNvbS9yZWZlcmVuY2UvZ2V0LXN0b3JlXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogYnVpbGQgdGhlIE9saXZlIEFQSSByZXF1ZXN0IGJvZHkgdG8gYmUgcGFzc2VkIGluLCBhbmQgcGVyZm9ybSBhIEdFVCB0byBpdCB3aXRoIHRoZSBhcHByb3ByaWF0ZSBpbmZvcm1hdGlvblxuICAgICAgICAgICAgICogd2UgaW1wbHkgdGhhdCBpZiB0aGUgQVBJIGRvZXMgbm90IHJlc3BvbmQgaW4gMTUgc2Vjb25kcywgdGhlbiB3ZSBhdXRvbWF0aWNhbGx5IGNhdGNoIHRoYXQsIGFuZCByZXR1cm4gYW5cbiAgICAgICAgICAgICAqIGVycm9yIGZvciBhIGJldHRlciBjdXN0b21lciBleHBlcmllbmNlLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICByZXR1cm4gYXhpb3MuZ2V0KGAke29saXZlQmFzZVVSTH0vc3RvcmVzLyR7dHJhbnNhY3Rpb24uc3RvcmVJZH1gLCB7XG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAgICAgXCJPbGl2ZS1LZXlcIjogb2xpdmVQcml2YXRlS2V5XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiAxNTAwMCwgLy8gaW4gbWlsbGlzZWNvbmRzIGhlcmVcbiAgICAgICAgICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlOiAnT2xpdmUgQVBJIHRpbWVkIG91dCBhZnRlciAxNTAwMG1zISdcbiAgICAgICAgICAgIH0pLnRoZW4oc3RvcmVEZXRhaWxzUmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShzdG9yZURldGFpbHNSZXNwb25zZS5kYXRhKX1gKTtcblxuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIGlmIHdlIHJlYWNoZWQgdGhpcywgdGhlbiB3ZSBhc3N1bWUgdGhhdCBhIDJ4eCByZXNwb25zZSBjb2RlIHdhcyByZXR1cm5lZC5cbiAgICAgICAgICAgICAgICAgKiBjaGVjayB0aGUgY29udGVudHMgb2YgdGhlIHJlc3BvbnNlLCBhbmQgYWN0IGFwcHJvcHJpYXRlbHkuXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgaWYgKHN0b3JlRGV0YWlsc1Jlc3BvbnNlLmRhdGEgIT09IHVuZGVmaW5lZCAmJiBzdG9yZURldGFpbHNSZXNwb25zZS5kYXRhW1wiYWRkcmVzczFcIl0gIT09IHVuZGVmaW5lZCAmJiBzdG9yZURldGFpbHNSZXNwb25zZS5kYXRhW1wiY2l0eVwiXSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgICAgICAgICAgIHN0b3JlRGV0YWlsc1Jlc3BvbnNlLmRhdGFbXCJwb3N0Y29kZVwiXSAhPT0gdW5kZWZpbmVkICYmIHN0b3JlRGV0YWlsc1Jlc3BvbnNlLmRhdGFbXCJzdGF0ZVwiXSAhPT0gdW5kZWZpbmVkICYmIHN0b3JlRGV0YWlsc1Jlc3BvbnNlLmRhdGFbXCJjb3VudHJ5Q29kZVwiXSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgICAgICAgICAgIHN0b3JlRGV0YWlsc1Jlc3BvbnNlLmRhdGFbXCJpc09ubGluZVwiXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHNldCB0aGUgc3RvcmUgZGV0YWlscyBmb3IgdGhlIHRyYW5zYWN0aW9uIG9iamVjdCwgZnJvbSB0aGUgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb24udHJhbnNhY3Rpb25Jc09ubGluZSA9IHN0b3JlRGV0YWlsc1Jlc3BvbnNlLmRhdGFbXCJpc09ubGluZVwiXTtcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb24udHJhbnNhY3Rpb25CcmFuZEFkZHJlc3MgPSBgJHtzdG9yZURldGFpbHNSZXNwb25zZS5kYXRhW1wiYWRkcmVzczFcIl19LCAke3N0b3JlRGV0YWlsc1Jlc3BvbnNlLmRhdGFbXCJjaXR5XCJdfSwgJHtzdG9yZURldGFpbHNSZXNwb25zZS5kYXRhW1wic3RhdGVcIl19LCAke3N0b3JlRGV0YWlsc1Jlc3BvbnNlLmRhdGFbXCJwb3N0Y29kZVwiXX0sICR7c3RvcmVEZXRhaWxzUmVzcG9uc2UuZGF0YVtcImNvdW50cnlDb2RlXCJdfWA7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHRyYW5zYWN0aW9uXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgSW52YWxpZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UhYCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvclxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvci5yZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYW5kIHRoZSBzZXJ2ZXIgcmVzcG9uZGVkIHdpdGggYSBzdGF0dXMgY29kZVxuICAgICAgICAgICAgICAgICAgICAgKiB0aGF0IGZhbGxzIG91dCBvZiB0aGUgcmFuZ2Ugb2YgMnh4LlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vbiAyeHh4IHJlc3BvbnNlIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBPbGl2ZSBBUEksIHdpdGggc3RhdHVzICR7ZXJyb3IucmVzcG9uc2Uuc3RhdHVzfSwgYW5kIHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZXJyb3IucmVzcG9uc2UuZGF0YSl9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBhbnkgb3RoZXIgc3BlY2lmaWMgZXJyb3JzIHRvIGJlIGZpbHRlcmVkIGJlbG93XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3IucmVxdWVzdCkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYnV0IG5vIHJlc3BvbnNlIHdhcyByZWNlaXZlZFxuICAgICAgICAgICAgICAgICAgICAgKiBgZXJyb3IucmVxdWVzdGAgaXMgYW4gaW5zdGFuY2Ugb2YgWE1MSHR0cFJlcXVlc3QgaW4gdGhlIGJyb3dzZXIgYW5kIGFuIGluc3RhbmNlIG9mXG4gICAgICAgICAgICAgICAgICAgICAqICBodHRwLkNsaWVudFJlcXVlc3QgaW4gbm9kZS5qcy5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBObyByZXNwb25zZSByZWNlaXZlZCB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gT2xpdmUgQVBJLCBmb3IgcmVxdWVzdCAke2Vycm9yLnJlcXVlc3R9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBTb21ldGhpbmcgaGFwcGVuZWQgaW4gc2V0dGluZyB1cCB0aGUgcmVxdWVzdCB0aGF0IHRyaWdnZXJlZCBhbiBFcnJvclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IGZvciB0aGUgJHtlbmRwb2ludEluZm99IE9saXZlIEFQSSwgJHsoZXJyb3IgJiYgZXJyb3IubWVzc2FnZSkgJiYgZXJyb3IubWVzc2FnZX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGluaXRpYXRpbmcgdGhlIHN0b3JlIGRldGFpbHMgcmV0cmlldmFsIHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJ9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdXNlZCB0byByZXRyaWV2ZSB0aGUgbWVtYmVyIGRldGFpbHMsIHNwZWNpZmljYWxseSB0aGUgZXh0TWVtYmVySWQsIHdoaWNoIGlzIE1vb25iZWFtJ3MgdW5pcXVlIHVzZXIgSURcbiAgICAgKiBzZXQgYXQgY3JlYXRpb24gdGltZSwgZ2l2ZW4gYSBtZW1iZXIgSUQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gbWVtYmVySWQgbWVtYmVyIElEIG9idGFpbmVkIGZyb20gT2xpdmUgYXQgY3JlYXRpb24gdGltZSwgdXNlZCB0byByZXRyaWV2ZSB0aGVcbiAgICAgKiBvdGhlciBtZW1iZXIgZGV0YWlscy5cbiAgICAgKlxuICAgICAqIEByZXR1cm4gYSB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIE1lbWJlckRldGFpbHNSZXNwb25zZX0gcmVwcmVzZW50aW5nIHRoZSBtZW1iZXIgZGV0YWlsc1xuICAgICAqL1xuICAgIGFzeW5jIGdldE1lbWJlckRldGFpbHMobWVtYmVySWQ6IHN0cmluZyk6IFByb21pc2U8TWVtYmVyRGV0YWlsc1Jlc3BvbnNlPiB7XG4gICAgICAgIC8vIGVhc2lseSBpZGVudGlmaWFibGUgQVBJIGVuZHBvaW50IGluZm9ybWF0aW9uXG4gICAgICAgIGNvbnN0IGVuZHBvaW50SW5mbyA9ICdHRVQgL21lbWJlcnMve2lkfSBPbGl2ZSBBUEknO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgQVBJIEtleSBhbmQgQmFzZSBVUkwsIG5lZWRlZCBpbiBvcmRlciB0byBtYWtlIHRoZSBHRVQgbWVtYmVyIGRldGFpbHMgY2FsbCB0aHJvdWdoIHRoZSBjbGllbnRcbiAgICAgICAgICAgIGNvbnN0IFtvbGl2ZUJhc2VVUkwsIG9saXZlUHVibGljS2V5LCBvbGl2ZVByaXZhdGVLZXldID0gYXdhaXQgc3VwZXIucmV0cmlldmVTZXJ2aWNlQ3JlZGVudGlhbHMoQ29uc3RhbnRzLkFXU1BhaXJDb25zdGFudHMuT0xJVkVfU0VDUkVUX05BTUUpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgd2Ugb2J0YWluZWQgYW55IGludmFsaWQgc2VjcmV0IHZhbHVlcyBmcm9tIHRoZSBjYWxsIGFib3ZlXG4gICAgICAgICAgICBpZiAob2xpdmVCYXNlVVJMID09PSBudWxsIHx8IG9saXZlQmFzZVVSTC5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBvbGl2ZVB1YmxpY0tleSA9PT0gbnVsbCB8fCBvbGl2ZVB1YmxpY0tleS5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBvbGl2ZVByaXZhdGVLZXkgPT09IG51bGwgfHwgb2xpdmVQcml2YXRlS2V5IS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBcIkludmFsaWQgU2VjcmV0cyBvYnRhaW5lZCBmb3IgT2xpdmUgQVBJIGNhbGwhXCI7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEdFVCAvbWVtYmVycy97aWR9XG4gICAgICAgICAgICAgKiBAbGluayBodHRwczovL2RldmVsb3Blci5vbGl2ZWx0ZC5jb20vcmVmZXJlbmNlL2dldC1tZW1iZXJcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBidWlsZCB0aGUgT2xpdmUgQVBJIHJlcXVlc3QgYm9keSB0byBiZSBwYXNzZWQgaW4sIGFuZCBwZXJmb3JtIGEgR0VUIHRvIGl0IHdpdGggdGhlIGFwcHJvcHJpYXRlIGluZm9ybWF0aW9uXG4gICAgICAgICAgICAgKiB3ZSBpbXBseSB0aGF0IGlmIHRoZSBBUEkgZG9lcyBub3QgcmVzcG9uZCBpbiAxNSBzZWNvbmRzLCB0aGVuIHdlIGF1dG9tYXRpY2FsbHkgY2F0Y2ggdGhhdCwgYW5kIHJldHVybiBhblxuICAgICAgICAgICAgICogZXJyb3IgZm9yIGEgYmV0dGVyIGN1c3RvbWVyIGV4cGVyaWVuY2UuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHJldHVybiBheGlvcy5nZXQoYCR7b2xpdmVCYXNlVVJMfS9tZW1iZXJzLyR7bWVtYmVySWR9YCwge1xuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiT2xpdmUtS2V5XCI6IG9saXZlUHJpdmF0ZUtleVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGltZW91dDogMTUwMDAsIC8vIGluIG1pbGxpc2Vjb25kcyBoZXJlXG4gICAgICAgICAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZTogJ09saXZlIEFQSSB0aW1lZCBvdXQgYWZ0ZXIgMTUwMDBtcyEnXG4gICAgICAgICAgICB9KS50aGVuKG1lbWJlckRldGFpbHNSZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KG1lbWJlckRldGFpbHNSZXNwb25zZS5kYXRhKX1gKTtcblxuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIGlmIHdlIHJlYWNoZWQgdGhpcywgdGhlbiB3ZSBhc3N1bWUgdGhhdCBhIDJ4eCByZXNwb25zZSBjb2RlIHdhcyByZXR1cm5lZC5cbiAgICAgICAgICAgICAgICAgKiBjaGVjayB0aGUgY29udGVudHMgb2YgdGhlIHJlc3BvbnNlLCBhbmQgYWN0IGFwcHJvcHJpYXRlbHkuXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgaWYgKG1lbWJlckRldGFpbHNSZXNwb25zZS5kYXRhICE9PSB1bmRlZmluZWQgJiYgbWVtYmVyRGV0YWlsc1Jlc3BvbnNlLmRhdGFbXCJleHRNZW1iZXJJZFwiXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgZXh0ZXJuYWwgbWVtYmVyIGlkIChleHRNZW1iZXJJZClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IG1lbWJlckRldGFpbHNSZXNwb25zZS5kYXRhW1wiZXh0TWVtYmVySWRcIl1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBJbnZhbGlkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tICR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSFgLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yLnJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBhbmQgdGhlIHNlcnZlciByZXNwb25kZWQgd2l0aCBhIHN0YXR1cyBjb2RlXG4gICAgICAgICAgICAgICAgICAgICAqIHRoYXQgZmFsbHMgb3V0IG9mIHRoZSByYW5nZSBvZiAyeHguXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm9uIDJ4eHggcmVzcG9uc2Ugd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE9saXZlIEFQSSwgd2l0aCBzdGF0dXMgJHtlcnJvci5yZXNwb25zZS5zdGF0dXN9LCBhbmQgcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShlcnJvci5yZXNwb25zZS5kYXRhKX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGFueSBvdGhlciBzcGVjaWZpYyBlcnJvcnMgdG8gYmUgZmlsdGVyZWQgYmVsb3dcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5yZXF1ZXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBidXQgbm8gcmVzcG9uc2Ugd2FzIHJlY2VpdmVkXG4gICAgICAgICAgICAgICAgICAgICAqIGBlcnJvci5yZXF1ZXN0YCBpcyBhbiBpbnN0YW5jZSBvZiBYTUxIdHRwUmVxdWVzdCBpbiB0aGUgYnJvd3NlciBhbmQgYW4gaW5zdGFuY2Ugb2ZcbiAgICAgICAgICAgICAgICAgICAgICogIGh0dHAuQ2xpZW50UmVxdWVzdCBpbiBub2RlLmpzLlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vIHJlc3BvbnNlIHJlY2VpdmVkIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBPbGl2ZSBBUEksIGZvciByZXF1ZXN0ICR7ZXJyb3IucmVxdWVzdH1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNvbWV0aGluZyBoYXBwZW5lZCBpbiBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IHRoYXQgdHJpZ2dlcmVkIGFuIEVycm9yXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgZm9yIHRoZSAke2VuZHBvaW50SW5mb30gT2xpdmUgQVBJLCAkeyhlcnJvciAmJiBlcnJvci5tZXNzYWdlKSAmJiBlcnJvci5tZXNzYWdlfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgaW5pdGlhdGluZyB0aGUgbWVtYmVyIGRldGFpbHMgcmV0cmlldmFsIHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJ9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdXNlZCB0byByZXRyaWV2ZSB0aGUgdHJhbnNhY3Rpb24gZGV0YWlscywgZ2l2ZW4gYSB0cmFuc2FjdGlvbiBJRCAodXNlZCBmb3IgdXBkYXRlZFxuICAgICAqIHRyYW5zYWN0aW9uYWwgZXZlbnRzIHB1cnBvc2VzKS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB1cGRhdGVkVHJhbnNhY3Rpb25FdmVudCB0aGUgdXBkYXRlZCB0cmFuc2FjdGlvbiBldmVudCBvYmplY3QsIHBvcHVsYXRlZCBieSB0aGVcbiAgICAgKiBpbml0aWFsIGRldGFpbHMgcGFzc2VkIGJ5IE9saXZlIGluIHRoZSB1cGRhdGVkIHdlYmhvb2sgY2FsbC4gVGhpcyBvYmplY3Qgd2lsbCBiZSB1c2VkXG4gICAgICogdG8gc2V0IGV2ZW4gbW9yZSBpbmZvcm1hdGlvbiBmb3IgaXQsIG9idGFpbmVkIGZyb20gdGhpcyB0cmFuc2FjdGlvbiBkZXRhaWxzIGNhbGwuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIGEge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBVcGRhdGVkVHJhbnNhY3Rpb25FdmVudFJlc3BvbnNlfSByZXByZXNlbnRpbmcgdGhlXG4gICAgICogdXBkYXRlZCB0cmFuc2FjdGlvbiBldmVudCBvYmplY3QsIHBvcHVsYXRlZCB3aXRoIHRoZSBhZGRpdGlvbmFsIHRyYW5zYWN0aW9uIGRldGFpbHNcbiAgICAgKiB0aGF0IHdlIHJldHJpZXZlZFxuICAgICAqL1xuICAgIGFzeW5jIGdldFVwZGF0ZWRUcmFuc2FjdGlvbkRldGFpbHModXBkYXRlZFRyYW5zYWN0aW9uRXZlbnQ6IFVwZGF0ZWRUcmFuc2FjdGlvbkV2ZW50KTogUHJvbWlzZTxVcGRhdGVkVHJhbnNhY3Rpb25FdmVudFJlc3BvbnNlPiB7XG4gICAgICAgIC8vIGVhc2lseSBpZGVudGlmaWFibGUgQVBJIGVuZHBvaW50IGluZm9ybWF0aW9uXG4gICAgICAgIGNvbnN0IGVuZHBvaW50SW5mbyA9ICdHRVQgL3RyYW5zYWN0aW9ucy97aWR9IE9saXZlIEFQSSc7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBBUEkgS2V5IGFuZCBCYXNlIFVSTCwgbmVlZGVkIGluIG9yZGVyIHRvIG1ha2UgdGhlIEdFVCB0cmFuc2FjdGlvbiBkZXRhaWxzIGNhbGwgdGhyb3VnaCB0aGUgY2xpZW50XG4gICAgICAgICAgICBjb25zdCBbb2xpdmVCYXNlVVJMLCBvbGl2ZVB1YmxpY0tleSwgb2xpdmVQcml2YXRlS2V5XSA9IGF3YWl0IHN1cGVyLnJldHJpZXZlU2VydmljZUNyZWRlbnRpYWxzKENvbnN0YW50cy5BV1NQYWlyQ29uc3RhbnRzLk9MSVZFX1NFQ1JFVF9OQU1FKTtcblxuICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHdlIG9idGFpbmVkIGFueSBpbnZhbGlkIHNlY3JldCB2YWx1ZXMgZnJvbSB0aGUgY2FsbCBhYm92ZVxuICAgICAgICAgICAgaWYgKG9saXZlQmFzZVVSTCA9PT0gbnVsbCB8fCBvbGl2ZUJhc2VVUkwubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgb2xpdmVQdWJsaWNLZXkgPT09IG51bGwgfHwgb2xpdmVQdWJsaWNLZXkubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgb2xpdmVQcml2YXRlS2V5ID09PSBudWxsIHx8IG9saXZlUHJpdmF0ZUtleSEubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gXCJJbnZhbGlkIFNlY3JldHMgb2J0YWluZWQgZm9yIE9saXZlIEFQSSBjYWxsIVwiO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBHRVQgL3RyYW5zYWN0aW9ucy97aWR9XG4gICAgICAgICAgICAgKiBAbGluayBodHRwczovL2RldmVsb3Blci5vbGl2ZWx0ZC5jb20vcmVmZXJlbmNlL3Nob3ctdHJhbnNhY3Rpb24tZGV0YWlsc1xuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIGJ1aWxkIHRoZSBPbGl2ZSBBUEkgcmVxdWVzdCBib2R5IHRvIGJlIHBhc3NlZCBpbiwgYW5kIHBlcmZvcm0gYSBHRVQgdG8gaXQgd2l0aCB0aGUgYXBwcm9wcmlhdGUgaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAqIHdlIGltcGx5IHRoYXQgaWYgdGhlIEFQSSBkb2VzIG5vdCByZXNwb25kIGluIDE1IHNlY29uZHMsIHRoZW4gd2UgYXV0b21hdGljYWxseSBjYXRjaCB0aGF0LCBhbmQgcmV0dXJuIGFuXG4gICAgICAgICAgICAgKiBlcnJvciBmb3IgYSBiZXR0ZXIgY3VzdG9tZXIgZXhwZXJpZW5jZS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgcmV0dXJuIGF4aW9zLmdldChgJHtvbGl2ZUJhc2VVUkx9L3RyYW5zYWN0aW9ucy8ke3VwZGF0ZWRUcmFuc2FjdGlvbkV2ZW50LmRhdGEudHJhbnNhY3Rpb24uaWR9YCwge1xuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiT2xpdmUtS2V5XCI6IG9saXZlUHJpdmF0ZUtleVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGltZW91dDogMTUwMDAsIC8vIGluIG1pbGxpc2Vjb25kcyBoZXJlXG4gICAgICAgICAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZTogJ09saXZlIEFQSSB0aW1lZCBvdXQgYWZ0ZXIgMTUwMDBtcyEnXG4gICAgICAgICAgICB9KS50aGVuKHRyYW5zYWN0aW9uRGV0YWlsc1Jlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlbmRwb2ludEluZm99IHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkodHJhbnNhY3Rpb25EZXRhaWxzUmVzcG9uc2UuZGF0YSl9YCk7XG5cbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiBpZiB3ZSByZWFjaGVkIHRoaXMsIHRoZW4gd2UgYXNzdW1lIHRoYXQgYSAyeHggcmVzcG9uc2UgY29kZSB3YXMgcmV0dXJuZWQuXG4gICAgICAgICAgICAgICAgICogY2hlY2sgdGhlIGNvbnRlbnRzIG9mIHRoZSByZXNwb25zZSwgYW5kIGFjdCBhcHByb3ByaWF0ZWx5LlxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGlmICh0cmFuc2FjdGlvbkRldGFpbHNSZXNwb25zZS5kYXRhICE9PSB1bmRlZmluZWQgJiYgdHJhbnNhY3Rpb25EZXRhaWxzUmVzcG9uc2UuZGF0YVtcInN0b3JlSWRcIl0gJiYgdHJhbnNhY3Rpb25EZXRhaWxzUmVzcG9uc2UuZGF0YVtcImJyYW5kSWRcIl0gJiZcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25EZXRhaWxzUmVzcG9uc2UuZGF0YVtcImxveWFsdHlQcm9ncmFtSWRcIl0gJiYgdHJhbnNhY3Rpb25EZXRhaWxzUmVzcG9uc2UuZGF0YVtcIm1lcmNoYW50Q2F0ZWdvcnlDb2RlXCJdKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHNldCB0aGUgdHJhbnNhY3Rpb24gZGV0YWlscyBmb3IgdGhlIHVwZGF0ZWQgdHJhbnNhY3Rpb24gb2JqZWN0LCBmcm9tIHRoZSByZXNwb25zZSwgYW5kIGNvbnZlcnQgYW55IGluZm9ybWF0aW9uIGFjY29yZGluZ2x5XG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRUcmFuc2FjdGlvbkV2ZW50LmRhdGEudHJhbnNhY3Rpb24uc3RvcmVJZCA9IHRyYW5zYWN0aW9uRGV0YWlsc1Jlc3BvbnNlLmRhdGFbXCJzdG9yZUlkXCJdO1xuICAgICAgICAgICAgICAgICAgICB1cGRhdGVkVHJhbnNhY3Rpb25FdmVudC5kYXRhLnRyYW5zYWN0aW9uLmJyYW5kSWQgPSB0cmFuc2FjdGlvbkRldGFpbHNSZXNwb25zZS5kYXRhW1wiYnJhbmRJZFwiXTtcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlZFRyYW5zYWN0aW9uRXZlbnQuZGF0YS50cmFuc2FjdGlvbi5sb3lhbHR5UHJvZ3JhbUlkID0gdHJhbnNhY3Rpb25EZXRhaWxzUmVzcG9uc2UuZGF0YVtcImxveWFsdHlQcm9ncmFtSWRcIl07XG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRUcmFuc2FjdGlvbkV2ZW50LmRhdGEudHJhbnNhY3Rpb24ucm91bmRpbmdSdWxlSWQgPSB0cmFuc2FjdGlvbkRldGFpbHNSZXNwb25zZS5kYXRhW1wicm91bmRpbmdSdWxlSWRcIl0gIT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICAmJiB0cmFuc2FjdGlvbkRldGFpbHNSZXNwb25zZS5kYXRhW1wicm91bmRpbmdSdWxlSWRcIl0gIT09IG51bGwgPyB0cmFuc2FjdGlvbkRldGFpbHNSZXNwb25zZS5kYXRhW1wicm91bmRpbmdSdWxlSWRcIl0gOiAnTi9BJztcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlZFRyYW5zYWN0aW9uRXZlbnQuZGF0YS50cmFuc2FjdGlvbi5tZXJjaGFudENhdGVnb3J5Q29kZSA9IHRyYW5zYWN0aW9uRGV0YWlsc1Jlc3BvbnNlLmRhdGFbXCJtZXJjaGFudENhdGVnb3J5Q29kZVwiXTtcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlZFRyYW5zYWN0aW9uRXZlbnQuZGF0YS50cmFuc2FjdGlvbi5hbW91bnQgPSB0cmFuc2FjdGlvbkRldGFpbHNSZXNwb25zZS5kYXRhW1wiYW1vdW50XCJdICE9PSB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICAgICAgJiYgdHJhbnNhY3Rpb25EZXRhaWxzUmVzcG9uc2UuZGF0YVtcImFtb3VudFwiXSAhPT0gbnVsbCA/IHRyYW5zYWN0aW9uRGV0YWlsc1Jlc3BvbnNlLmRhdGFbXCJhbW91bnRcIl0gOiAwO1xuICAgICAgICAgICAgICAgICAgICB1cGRhdGVkVHJhbnNhY3Rpb25FdmVudC5kYXRhLnRyYW5zYWN0aW9uLnJvdW5kZWRBbW91bnQgPSB0cmFuc2FjdGlvbkRldGFpbHNSZXNwb25zZS5kYXRhW1wicm91bmRlZEFtb3VudFwiXSAhPT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgICAgICYmIHRyYW5zYWN0aW9uRGV0YWlsc1Jlc3BvbnNlLmRhdGFbXCJyb3VuZGVkQW1vdW50XCJdICE9PSBudWxsID8gdHJhbnNhY3Rpb25EZXRhaWxzUmVzcG9uc2UuZGF0YVtcInJvdW5kZWRBbW91bnRcIl0gOiAwO1xuICAgICAgICAgICAgICAgICAgICB1cGRhdGVkVHJhbnNhY3Rpb25FdmVudC5kYXRhLnRyYW5zYWN0aW9uLm1hdGNoaW5nQW1vdW50ID0gdHJhbnNhY3Rpb25EZXRhaWxzUmVzcG9uc2UuZGF0YVtcIm1hdGNoaW5nQW1vdW50XCJdICE9PSB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICAgICAgJiYgdHJhbnNhY3Rpb25EZXRhaWxzUmVzcG9uc2UuZGF0YVtcIm1hdGNoaW5nQW1vdW50XCJdICE9PSBudWxsID8gdHJhbnNhY3Rpb25EZXRhaWxzUmVzcG9uc2UuZGF0YVtcIm1hdGNoaW5nQW1vdW50XCJdIDogMDtcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlZFRyYW5zYWN0aW9uRXZlbnQuZGF0YS50cmFuc2FjdGlvbi5jcmVhdGVkID0gbmV3IERhdGUoRGF0ZS5ub3coKSkudG9JU09TdHJpbmcoKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHVwZGF0ZWRUcmFuc2FjdGlvbkV2ZW50XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgSW52YWxpZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UhYDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yLnJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBhbmQgdGhlIHNlcnZlciByZXNwb25kZWQgd2l0aCBhIHN0YXR1cyBjb2RlXG4gICAgICAgICAgICAgICAgICAgICAqIHRoYXQgZmFsbHMgb3V0IG9mIHRoZSByYW5nZSBvZiAyeHguXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm9uIDJ4eHggcmVzcG9uc2Ugd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE9saXZlIEFQSSwgd2l0aCBzdGF0dXMgJHtlcnJvci5yZXNwb25zZS5zdGF0dXN9LCBhbmQgcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShlcnJvci5yZXNwb25zZS5kYXRhKX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGFueSBvdGhlciBzcGVjaWZpYyBlcnJvcnMgdG8gYmUgZmlsdGVyZWQgYmVsb3dcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5yZXF1ZXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBidXQgbm8gcmVzcG9uc2Ugd2FzIHJlY2VpdmVkXG4gICAgICAgICAgICAgICAgICAgICAqIGBlcnJvci5yZXF1ZXN0YCBpcyBhbiBpbnN0YW5jZSBvZiBYTUxIdHRwUmVxdWVzdCBpbiB0aGUgYnJvd3NlciBhbmQgYW4gaW5zdGFuY2Ugb2ZcbiAgICAgICAgICAgICAgICAgICAgICogIGh0dHAuQ2xpZW50UmVxdWVzdCBpbiBub2RlLmpzLlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vIHJlc3BvbnNlIHJlY2VpdmVkIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBPbGl2ZSBBUEksIGZvciByZXF1ZXN0ICR7ZXJyb3IucmVxdWVzdH1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNvbWV0aGluZyBoYXBwZW5lZCBpbiBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IHRoYXQgdHJpZ2dlcmVkIGFuIEVycm9yXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgZm9yIHRoZSAke2VuZHBvaW50SW5mb30gT2xpdmUgQVBJLCAkeyhlcnJvciAmJiBlcnJvci5tZXNzYWdlKSAmJiBlcnJvci5tZXNzYWdlfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgaW5pdGlhdGluZyB0aGUgdXBkYXRlZCB0cmFuc2FjdGlvbiBkZXRhaWxzIHJldHJpZXZhbCB0aHJvdWdoICR7ZW5kcG9pbnRJbmZvfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9ICR7ZXJyfWApO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHVzZWQgdG8gcmV0cmlldmUgdGhlIHR5cGUgb2Ygb2ZmZXIgcmVkZW1wdGlvbiwgb2J0YWluZWQgZnJvbSB0aGUgb2ZmZXIgb2JqZWN0LlxuICAgICAqXG4gICAgICogQHBhcmFtIG9mZmVySWQgdGhlIGlkIG9mIHRoZSBvZmZlciwgdXNlZCB0byByZXRyaWV2ZSB0aGUgdHlwZSBvZiByZWRlbXB0aW9uIGZvci5cbiAgICAgKlxuICAgICAqIEByZXR1cm4gYSB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIE9mZmVyUmVkZW1wdGlvblR5cGVSZXNwb25zZX0gcmVwcmVzZW50aW5nIHRoZSByZWRlbXB0aW9uXG4gICAgICogdHlwZSwgb2J0YWluZWQgZnJvbSB0aGUgb2ZmZXIgb2JqZWN0LlxuICAgICAqL1xuICAgIGFzeW5jIGdldE9mZmVyUmVkZW1wdGlvblR5cGUob2ZmZXJJZDogc3RyaW5nKTogUHJvbWlzZTxPZmZlclJlZGVtcHRpb25UeXBlUmVzcG9uc2U+IHtcbiAgICAgICAgLy8gZWFzaWx5IGlkZW50aWZpYWJsZSBBUEkgZW5kcG9pbnQgaW5mb3JtYXRpb25cbiAgICAgICAgY29uc3QgZW5kcG9pbnRJbmZvID0gJ0dFVCAvb2ZmZXJzL3tpZH0gT2xpdmUgQVBJJztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIEFQSSBLZXkgYW5kIEJhc2UgVVJMLCBuZWVkZWQgaW4gb3JkZXIgdG8gbWFrZSB0aGUgR0VUIG9mZmVycyBkZXRhaWxzIGNhbGwgdGhyb3VnaCB0aGUgY2xpZW50XG4gICAgICAgICAgICBjb25zdCBbb2xpdmVCYXNlVVJMLCBvbGl2ZVB1YmxpY0tleSwgb2xpdmVQcml2YXRlS2V5XSA9IGF3YWl0IHN1cGVyLnJldHJpZXZlU2VydmljZUNyZWRlbnRpYWxzKENvbnN0YW50cy5BV1NQYWlyQ29uc3RhbnRzLk9MSVZFX1NFQ1JFVF9OQU1FKTtcblxuICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHdlIG9idGFpbmVkIGFueSBpbnZhbGlkIHNlY3JldCB2YWx1ZXMgZnJvbSB0aGUgY2FsbCBhYm92ZVxuICAgICAgICAgICAgaWYgKG9saXZlQmFzZVVSTCA9PT0gbnVsbCB8fCBvbGl2ZUJhc2VVUkwubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgb2xpdmVQdWJsaWNLZXkgPT09IG51bGwgfHwgb2xpdmVQdWJsaWNLZXkubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgb2xpdmVQcml2YXRlS2V5ID09PSBudWxsIHx8IG9saXZlUHJpdmF0ZUtleSEubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gXCJJbnZhbGlkIFNlY3JldHMgb2J0YWluZWQgZm9yIE9saXZlIEFQSSBjYWxsIVwiO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBHRVQgL29mZmVycy97aWR9XG4gICAgICAgICAgICAgKiBAbGluayBodHRwczovL2RldmVsb3Blci5vbGl2ZWx0ZC5jb20vcmVmZXJlbmNlL2dldC1vZmZlclxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIGJ1aWxkIHRoZSBPbGl2ZSBBUEkgcmVxdWVzdCBib2R5IHRvIGJlIHBhc3NlZCBpbiwgYW5kIHBlcmZvcm0gYSBHRVQgdG8gaXQgd2l0aCB0aGUgYXBwcm9wcmlhdGUgaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAqIHdlIGltcGx5IHRoYXQgaWYgdGhlIEFQSSBkb2VzIG5vdCByZXNwb25kIGluIDE1IHNlY29uZHMsIHRoZW4gd2UgYXV0b21hdGljYWxseSBjYXRjaCB0aGF0LCBhbmQgcmV0dXJuIGFuXG4gICAgICAgICAgICAgKiBlcnJvciBmb3IgYSBiZXR0ZXIgY3VzdG9tZXIgZXhwZXJpZW5jZS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgcmV0dXJuIGF4aW9zLmdldChgJHtvbGl2ZUJhc2VVUkx9L29mZmVycy8ke29mZmVySWR9YCwge1xuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiT2xpdmUtS2V5XCI6IG9saXZlUHJpdmF0ZUtleVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGltZW91dDogMTUwMDAsIC8vIGluIG1pbGxpc2Vjb25kcyBoZXJlXG4gICAgICAgICAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZTogJ09saXZlIEFQSSB0aW1lZCBvdXQgYWZ0ZXIgMTUwMDBtcyEnXG4gICAgICAgICAgICB9KS50aGVuKG9mZmVyRGV0YWlsc1Jlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlbmRwb2ludEluZm99IHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkob2ZmZXJEZXRhaWxzUmVzcG9uc2UuZGF0YSl9YCk7XG5cbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiBpZiB3ZSByZWFjaGVkIHRoaXMsIHRoZW4gd2UgYXNzdW1lIHRoYXQgYSAyeHggcmVzcG9uc2UgY29kZSB3YXMgcmV0dXJuZWQuXG4gICAgICAgICAgICAgICAgICogY2hlY2sgdGhlIGNvbnRlbnRzIG9mIHRoZSByZXNwb25zZSwgYW5kIGFjdCBhcHByb3ByaWF0ZWx5LlxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGlmIChvZmZlckRldGFpbHNSZXNwb25zZS5kYXRhICE9PSB1bmRlZmluZWQgJiYgb2ZmZXJEZXRhaWxzUmVzcG9uc2UuZGF0YVtcInJlZGVtcHRpb25UeXBlXCJdICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgb2ZmZXJEZXRhaWxzUmVzcG9uc2UuZGF0YVtcInJlZGVtcHRpb25UeXBlXCJdICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgb2ZmZXIgaWQsIG9idGFpbmVkIGZyb20gdGhlIHRyYW5zYWN0aW9uIGRldGFpbHNcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IG9mZmVyRGV0YWlsc1Jlc3BvbnNlLmRhdGFbXCJyZWRlbXB0aW9uVHlwZVwiXSBhcyBSZWRlbXB0aW9uVHlwZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogYEludmFsaWQgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gJHtlbmRwb2ludEluZm99IHJlc3BvbnNlIWAsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IucmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGFuZCB0aGUgc2VydmVyIHJlc3BvbmRlZCB3aXRoIGEgc3RhdHVzIGNvZGVcbiAgICAgICAgICAgICAgICAgICAgICogdGhhdCBmYWxscyBvdXQgb2YgdGhlIHJhbmdlIG9mIDJ4eC5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBOb24gMnh4eCByZXNwb25zZSB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gT2xpdmUgQVBJLCB3aXRoIHN0YXR1cyAke2Vycm9yLnJlc3BvbnNlLnN0YXR1c30sIGFuZCByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGVycm9yLnJlc3BvbnNlLmRhdGEpfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gYW55IG90aGVyIHNwZWNpZmljIGVycm9ycyB0byBiZSBmaWx0ZXJlZCBiZWxvd1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVycm9yLnJlcXVlc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGJ1dCBubyByZXNwb25zZSB3YXMgcmVjZWl2ZWRcbiAgICAgICAgICAgICAgICAgICAgICogYGVycm9yLnJlcXVlc3RgIGlzIGFuIGluc3RhbmNlIG9mIFhNTEh0dHBSZXF1ZXN0IGluIHRoZSBicm93c2VyIGFuZCBhbiBpbnN0YW5jZSBvZlxuICAgICAgICAgICAgICAgICAgICAgKiAgaHR0cC5DbGllbnRSZXF1ZXN0IGluIG5vZGUuanMuXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm8gcmVzcG9uc2UgcmVjZWl2ZWQgd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE9saXZlIEFQSSwgZm9yIHJlcXVlc3QgJHtlcnJvci5yZXF1ZXN0fWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU29tZXRoaW5nIGhhcHBlbmVkIGluIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgdGhhdCB0cmlnZ2VyZWQgYW4gRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgc2V0dGluZyB1cCB0aGUgcmVxdWVzdCBmb3IgdGhlICR7ZW5kcG9pbnRJbmZvfSBPbGl2ZSBBUEksICR7KGVycm9yICYmIGVycm9yLm1lc3NhZ2UpICYmIGVycm9yLm1lc3NhZ2V9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBpbml0aWF0aW5nIHRoZSBvZmZlciByZWRlbXB0aW9uIHR5cGUgcmV0cmlldmFsIHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJ9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdXNlZCB0byByZXRyaWV2ZSB0aGUgb2ZmZXIgaWQsIG9idGFpbmVkIGZyb20gYSB0cmFuc2FjdGlvbiBvYmplY3QsIGdpdmVuXG4gICAgICogYSB0cmFuc2FjdGlvbiBpZGVudGlmaWVyICh1c2VkIGZvciB0cmFuc2FjdGlvbmFsIHB1cnBvc2VzKS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB0cmFuc2FjdGlvbklkIHRoZSBpZCBvZiB0aGUgdHJhbnNhY3Rpb24sIHVzZWQgdG8gcmV0cmlldmUgdGhlIG9mZmVyIGlkXG4gICAgICogZnJvbS5cbiAgICAgKlxuICAgICAqIEByZXR1cm4gYSB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIE9mZmVySWRSZXNwb25zZX0gcmVwcmVzZW50aW5nIHRoZSBvZmZlciBpZFxuICAgICAqIGFuZC9vciB0aGUgcmVkZWVtZWQgb2ZmZXIgaWQsIG9idGFpbmVkIGZyb20gdGhlIHRyYW5zYWN0aW9uIGRldGFpbHMuXG4gICAgICovXG4gICAgYXN5bmMgZ2V0T2ZmZXJJZCh0cmFuc2FjdGlvbklkOiBzdHJpbmcpOiBQcm9taXNlPE9mZmVySWRSZXNwb25zZT4ge1xuICAgICAgICAvLyBlYXNpbHkgaWRlbnRpZmlhYmxlIEFQSSBlbmRwb2ludCBpbmZvcm1hdGlvblxuICAgICAgICBjb25zdCBlbmRwb2ludEluZm8gPSAnR0VUIC90cmFuc2FjdGlvbnMve2lkfSBPbGl2ZSBBUEkgdXNlZCBmb3IgcmV0cmlldmluZyBvZmZlciBpZCc7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBBUEkgS2V5IGFuZCBCYXNlIFVSTCwgbmVlZGVkIGluIG9yZGVyIHRvIG1ha2UgdGhlIEdFVCB0cmFuc2FjdGlvbiBkZXRhaWxzIGNhbGwgdGhyb3VnaCB0aGUgY2xpZW50XG4gICAgICAgICAgICBjb25zdCBbb2xpdmVCYXNlVVJMLCBvbGl2ZVB1YmxpY0tleSwgb2xpdmVQcml2YXRlS2V5XSA9IGF3YWl0IHN1cGVyLnJldHJpZXZlU2VydmljZUNyZWRlbnRpYWxzKENvbnN0YW50cy5BV1NQYWlyQ29uc3RhbnRzLk9MSVZFX1NFQ1JFVF9OQU1FKTtcblxuICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHdlIG9idGFpbmVkIGFueSBpbnZhbGlkIHNlY3JldCB2YWx1ZXMgZnJvbSB0aGUgY2FsbCBhYm92ZVxuICAgICAgICAgICAgaWYgKG9saXZlQmFzZVVSTCA9PT0gbnVsbCB8fCBvbGl2ZUJhc2VVUkwubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgb2xpdmVQdWJsaWNLZXkgPT09IG51bGwgfHwgb2xpdmVQdWJsaWNLZXkubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgb2xpdmVQcml2YXRlS2V5ID09PSBudWxsIHx8IG9saXZlUHJpdmF0ZUtleSEubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gXCJJbnZhbGlkIFNlY3JldHMgb2J0YWluZWQgZm9yIE9saXZlIEFQSSBjYWxsIVwiO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBHRVQgL3RyYW5zYWN0aW9ucy97aWR9XG4gICAgICAgICAgICAgKiBAbGluayBodHRwczovL2RldmVsb3Blci5vbGl2ZWx0ZC5jb20vcmVmZXJlbmNlL3Nob3ctdHJhbnNhY3Rpb24tZGV0YWlsc1xuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIGJ1aWxkIHRoZSBPbGl2ZSBBUEkgcmVxdWVzdCBib2R5IHRvIGJlIHBhc3NlZCBpbiwgYW5kIHBlcmZvcm0gYSBHRVQgdG8gaXQgd2l0aCB0aGUgYXBwcm9wcmlhdGUgaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAqIHdlIGltcGx5IHRoYXQgaWYgdGhlIEFQSSBkb2VzIG5vdCByZXNwb25kIGluIDE1IHNlY29uZHMsIHRoZW4gd2UgYXV0b21hdGljYWxseSBjYXRjaCB0aGF0LCBhbmQgcmV0dXJuIGFuXG4gICAgICAgICAgICAgKiBlcnJvciBmb3IgYSBiZXR0ZXIgY3VzdG9tZXIgZXhwZXJpZW5jZS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgcmV0dXJuIGF4aW9zLmdldChgJHtvbGl2ZUJhc2VVUkx9L3RyYW5zYWN0aW9ucy8ke3RyYW5zYWN0aW9uSWR9YCwge1xuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiT2xpdmUtS2V5XCI6IG9saXZlUHJpdmF0ZUtleVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGltZW91dDogMTUwMDAsIC8vIGluIG1pbGxpc2Vjb25kcyBoZXJlXG4gICAgICAgICAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZTogJ09saXZlIEFQSSB0aW1lZCBvdXQgYWZ0ZXIgMTUwMDBtcyEnXG4gICAgICAgICAgICB9KS50aGVuKHRyYW5zYWN0aW9uRGV0YWlsc1Jlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlbmRwb2ludEluZm99IHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkodHJhbnNhY3Rpb25EZXRhaWxzUmVzcG9uc2UuZGF0YSl9YCk7XG5cbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiBpZiB3ZSByZWFjaGVkIHRoaXMsIHRoZW4gd2UgYXNzdW1lIHRoYXQgYSAyeHggcmVzcG9uc2UgY29kZSB3YXMgcmV0dXJuZWQuXG4gICAgICAgICAgICAgICAgICogY2hlY2sgdGhlIGNvbnRlbnRzIG9mIHRoZSByZXNwb25zZSwgYW5kIGFjdCBhcHByb3ByaWF0ZWx5LlxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGlmICh0cmFuc2FjdGlvbkRldGFpbHNSZXNwb25zZS5kYXRhICE9PSB1bmRlZmluZWQgJiYgdHJhbnNhY3Rpb25EZXRhaWxzUmVzcG9uc2UuZGF0YVtcInJlZGVlbWVkT2ZmZXJJZFwiXSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uRGV0YWlsc1Jlc3BvbnNlLmRhdGFbXCJyZWRlZW1lZE9mZmVySWRcIl0gIT09IG51bGwgJiYgdHJhbnNhY3Rpb25EZXRhaWxzUmVzcG9uc2UuZGF0YVtcInJld2FyZFwiXSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uRGV0YWlsc1Jlc3BvbnNlLmRhdGFbXCJyZXdhcmRcIl0gIT09IG51bGwgJiYgdHJhbnNhY3Rpb25EZXRhaWxzUmVzcG9uc2UuZGF0YVtcInJld2FyZFwiXVtcIm9mZmVySWRcIl0gIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbkRldGFpbHNSZXNwb25zZS5kYXRhW1wicmV3YXJkXCJdW1wib2ZmZXJJZFwiXSAhPT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbkRldGFpbHNSZXNwb25zZS5kYXRhW1wicmVkZWVtZWRPZmZlcklkXCJdID09PSB0cmFuc2FjdGlvbkRldGFpbHNSZXNwb25zZS5kYXRhW1wicmV3YXJkXCJdW1wib2ZmZXJJZFwiXSkge1xuICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIG9mZmVyIGlkLCBvYnRhaW5lZCBmcm9tIHRoZSB0cmFuc2FjdGlvbiBkZXRhaWxzXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB0cmFuc2FjdGlvbkRldGFpbHNSZXNwb25zZS5kYXRhW1wicmVkZWVtZWRPZmZlcklkXCJdXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgSW52YWxpZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UhYCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvclxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvci5yZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYW5kIHRoZSBzZXJ2ZXIgcmVzcG9uZGVkIHdpdGggYSBzdGF0dXMgY29kZVxuICAgICAgICAgICAgICAgICAgICAgKiB0aGF0IGZhbGxzIG91dCBvZiB0aGUgcmFuZ2Ugb2YgMnh4LlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vbiAyeHh4IHJlc3BvbnNlIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBPbGl2ZSBBUEksIHdpdGggc3RhdHVzICR7ZXJyb3IucmVzcG9uc2Uuc3RhdHVzfSwgYW5kIHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZXJyb3IucmVzcG9uc2UuZGF0YSl9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBhbnkgb3RoZXIgc3BlY2lmaWMgZXJyb3JzIHRvIGJlIGZpbHRlcmVkIGJlbG93XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3IucmVxdWVzdCkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYnV0IG5vIHJlc3BvbnNlIHdhcyByZWNlaXZlZFxuICAgICAgICAgICAgICAgICAgICAgKiBgZXJyb3IucmVxdWVzdGAgaXMgYW4gaW5zdGFuY2Ugb2YgWE1MSHR0cFJlcXVlc3QgaW4gdGhlIGJyb3dzZXIgYW5kIGFuIGluc3RhbmNlIG9mXG4gICAgICAgICAgICAgICAgICAgICAqICBodHRwLkNsaWVudFJlcXVlc3QgaW4gbm9kZS5qcy5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBObyByZXNwb25zZSByZWNlaXZlZCB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gT2xpdmUgQVBJLCBmb3IgcmVxdWVzdCAke2Vycm9yLnJlcXVlc3R9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBTb21ldGhpbmcgaGFwcGVuZWQgaW4gc2V0dGluZyB1cCB0aGUgcmVxdWVzdCB0aGF0IHRyaWdnZXJlZCBhbiBFcnJvclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IGZvciB0aGUgJHtlbmRwb2ludEluZm99IE9saXZlIEFQSSwgJHsoZXJyb3IgJiYgZXJyb3IubWVzc2FnZSkgJiYgZXJyb3IubWVzc2FnZX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGluaXRpYXRpbmcgdGhlIG9mZmVyIElEIHJldHJpZXZhbCB0aHJvdWdoICR7ZW5kcG9pbnRJbmZvfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9ICR7ZXJyfWApO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHVzZWQgdG8gcmV0cmlldmUgdGhlIHRyYW5zYWN0aW9uIGRldGFpbHMsIGdpdmVuIGEgdHJhbnNhY3Rpb24gSUQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gdHJhbnNhY3Rpb24gdGhlIHRyYW5zYWN0aW9uIG9iamVjdCwgcG9wdWxhdGVkIGJ5IHRoZSBpbml0aWFsIGRldGFpbHNcbiAgICAgKiBwYXNzZWQgaW4gYnkgT2xpdmUuIFRoaXMgb2JqZWN0IHdpbGwgYmUgdXNlZCB0byBzZXQgZXZlbiBtb3JlIGluZm9ybWF0aW9uIGZvclxuICAgICAqIGl0LCBvYnRhaW5lZCBmcm9tIHRoaXMgdHJhbnNhY3Rpb24gZGV0YWlscyBjYWxsLlxuICAgICAqXG4gICAgICogQHJldHVybiBhIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgVHJhbnNhY3Rpb25SZXNwb25zZX0gcmVwcmVzZW50aW5nIHRoZVxuICAgICAqIHRyYW5zYWN0aW9uIG9iamVjdCwgcG9wdWxhdGVkIHdpdGggdGhlIGFkZGl0aW9uYWwgdHJhbnNhY3Rpb24gZGV0YWlscyB0aGF0XG4gICAgICogd2UgcmV0cmlldmVkLlxuICAgICAqL1xuICAgIGFzeW5jIGdldFRyYW5zYWN0aW9uRGV0YWlscyh0cmFuc2FjdGlvbjogVHJhbnNhY3Rpb24pOiBQcm9taXNlPFRyYW5zYWN0aW9uUmVzcG9uc2U+IHtcbiAgICAgICAgLy8gZWFzaWx5IGlkZW50aWZpYWJsZSBBUEkgZW5kcG9pbnQgaW5mb3JtYXRpb25cbiAgICAgICAgY29uc3QgZW5kcG9pbnRJbmZvID0gJ0dFVCAvdHJhbnNhY3Rpb25zL3tpZH0gT2xpdmUgQVBJJztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIEFQSSBLZXkgYW5kIEJhc2UgVVJMLCBuZWVkZWQgaW4gb3JkZXIgdG8gbWFrZSB0aGUgR0VUIHRyYW5zYWN0aW9uIGRldGFpbHMgY2FsbCB0aHJvdWdoIHRoZSBjbGllbnRcbiAgICAgICAgICAgIGNvbnN0IFtvbGl2ZUJhc2VVUkwsIG9saXZlUHVibGljS2V5LCBvbGl2ZVByaXZhdGVLZXldID0gYXdhaXQgc3VwZXIucmV0cmlldmVTZXJ2aWNlQ3JlZGVudGlhbHMoQ29uc3RhbnRzLkFXU1BhaXJDb25zdGFudHMuT0xJVkVfU0VDUkVUX05BTUUpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgd2Ugb2J0YWluZWQgYW55IGludmFsaWQgc2VjcmV0IHZhbHVlcyBmcm9tIHRoZSBjYWxsIGFib3ZlXG4gICAgICAgICAgICBpZiAob2xpdmVCYXNlVVJMID09PSBudWxsIHx8IG9saXZlQmFzZVVSTC5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBvbGl2ZVB1YmxpY0tleSA9PT0gbnVsbCB8fCBvbGl2ZVB1YmxpY0tleS5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBvbGl2ZVByaXZhdGVLZXkgPT09IG51bGwgfHwgb2xpdmVQcml2YXRlS2V5IS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBcIkludmFsaWQgU2VjcmV0cyBvYnRhaW5lZCBmb3IgT2xpdmUgQVBJIGNhbGwhXCI7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEdFVCAvdHJhbnNhY3Rpb25zL3tpZH1cbiAgICAgICAgICAgICAqIEBsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm9saXZlbHRkLmNvbS9yZWZlcmVuY2Uvc2hvdy10cmFuc2FjdGlvbi1kZXRhaWxzXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogYnVpbGQgdGhlIE9saXZlIEFQSSByZXF1ZXN0IGJvZHkgdG8gYmUgcGFzc2VkIGluLCBhbmQgcGVyZm9ybSBhIEdFVCB0byBpdCB3aXRoIHRoZSBhcHByb3ByaWF0ZSBpbmZvcm1hdGlvblxuICAgICAgICAgICAgICogd2UgaW1wbHkgdGhhdCBpZiB0aGUgQVBJIGRvZXMgbm90IHJlc3BvbmQgaW4gMTUgc2Vjb25kcywgdGhlbiB3ZSBhdXRvbWF0aWNhbGx5IGNhdGNoIHRoYXQsIGFuZCByZXR1cm4gYW5cbiAgICAgICAgICAgICAqIGVycm9yIGZvciBhIGJldHRlciBjdXN0b21lciBleHBlcmllbmNlLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICByZXR1cm4gYXhpb3MuZ2V0KGAke29saXZlQmFzZVVSTH0vdHJhbnNhY3Rpb25zLyR7dHJhbnNhY3Rpb24udHJhbnNhY3Rpb25JZH1gLCB7XG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAgICAgXCJPbGl2ZS1LZXlcIjogb2xpdmVQcml2YXRlS2V5XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiAxNTAwMCwgLy8gaW4gbWlsbGlzZWNvbmRzIGhlcmVcbiAgICAgICAgICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlOiAnT2xpdmUgQVBJIHRpbWVkIG91dCBhZnRlciAxNTAwMG1zISdcbiAgICAgICAgICAgIH0pLnRoZW4odHJhbnNhY3Rpb25EZXRhaWxzUmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeSh0cmFuc2FjdGlvbkRldGFpbHNSZXNwb25zZS5kYXRhKX1gKTtcblxuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIGlmIHdlIHJlYWNoZWQgdGhpcywgdGhlbiB3ZSBhc3N1bWUgdGhhdCBhIDJ4eCByZXNwb25zZSBjb2RlIHdhcyByZXR1cm5lZC5cbiAgICAgICAgICAgICAgICAgKiBjaGVjayB0aGUgY29udGVudHMgb2YgdGhlIHJlc3BvbnNlLCBhbmQgYWN0IGFwcHJvcHJpYXRlbHkuXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgaWYgKHRyYW5zYWN0aW9uRGV0YWlsc1Jlc3BvbnNlLmRhdGEgIT09IHVuZGVmaW5lZCAmJiB0cmFuc2FjdGlvbkRldGFpbHNSZXNwb25zZS5kYXRhW1wicHVyY2hhc2VEYXRlVGltZVwiXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHNldCB0aGUgdHJhbnNhY3Rpb24gZGV0YWlscyBmb3IgdGhlIHRyYW5zYWN0aW9uIG9iamVjdCwgZnJvbSB0aGUgcmVzcG9uc2UsIGFuZCBjb252ZXJ0IGFueSBpbmZvcm1hdGlvbiBhY2NvcmRpbmdseVxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbi50aW1lc3RhbXAgPSBEYXRlLnBhcnNlKG5ldyBEYXRlKHRyYW5zYWN0aW9uRGV0YWlsc1Jlc3BvbnNlLmRhdGFbXCJwdXJjaGFzZURhdGVUaW1lXCJdKS50b0lTT1N0cmluZygpKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHRyYW5zYWN0aW9uXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgSW52YWxpZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UhYCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvclxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvci5yZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYW5kIHRoZSBzZXJ2ZXIgcmVzcG9uZGVkIHdpdGggYSBzdGF0dXMgY29kZVxuICAgICAgICAgICAgICAgICAgICAgKiB0aGF0IGZhbGxzIG91dCBvZiB0aGUgcmFuZ2Ugb2YgMnh4LlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vbiAyeHh4IHJlc3BvbnNlIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBPbGl2ZSBBUEksIHdpdGggc3RhdHVzICR7ZXJyb3IucmVzcG9uc2Uuc3RhdHVzfSwgYW5kIHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZXJyb3IucmVzcG9uc2UuZGF0YSl9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBhbnkgb3RoZXIgc3BlY2lmaWMgZXJyb3JzIHRvIGJlIGZpbHRlcmVkIGJlbG93XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3IucmVxdWVzdCkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYnV0IG5vIHJlc3BvbnNlIHdhcyByZWNlaXZlZFxuICAgICAgICAgICAgICAgICAgICAgKiBgZXJyb3IucmVxdWVzdGAgaXMgYW4gaW5zdGFuY2Ugb2YgWE1MSHR0cFJlcXVlc3QgaW4gdGhlIGJyb3dzZXIgYW5kIGFuIGluc3RhbmNlIG9mXG4gICAgICAgICAgICAgICAgICAgICAqICBodHRwLkNsaWVudFJlcXVlc3QgaW4gbm9kZS5qcy5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBObyByZXNwb25zZSByZWNlaXZlZCB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gT2xpdmUgQVBJLCBmb3IgcmVxdWVzdCAke2Vycm9yLnJlcXVlc3R9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBTb21ldGhpbmcgaGFwcGVuZWQgaW4gc2V0dGluZyB1cCB0aGUgcmVxdWVzdCB0aGF0IHRyaWdnZXJlZCBhbiBFcnJvclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IGZvciB0aGUgJHtlbmRwb2ludEluZm99IE9saXZlIEFQSSwgJHsoZXJyb3IgJiYgZXJyb3IubWVzc2FnZSkgJiYgZXJyb3IubWVzc2FnZX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGluaXRpYXRpbmcgdGhlIHRyYW5zYWN0aW9uIGRldGFpbHMgcmV0cmlldmFsIHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJ9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdXNlZCB0byB1cGRhdGUgYSB0cmFuc2FjdGlvbiBieSBzcGVjaWZ5aW5nIHRoZSBhbW91bnQgZGlzdHJpYnV0ZWQgdG8gdGhlIG1lbWJlclxuICAgICAqIGR1cmluZyBhIGNhc2gtb3V0L3JlaW1idXJzZW1lbnQsIGdpdmVuIGl0cyB0cmFuc2FjdGlvbiBJRC5cbiAgICAgKiAodXNlZCBmb3IgcmVpbWJ1cnNlbWVudHMvY2FzaC1vdXQgcHVycG9zZXMpLlxuICAgICAqXG4gICAgICogQHBhcmFtIHRyYW5zYWN0aW9uSWQgdGhlIGlkIG9mIHRoZSB0cmFuc2FjdGlvbiB0byBiZSB1cGRhdGVkXG4gICAgICogQHBhcmFtIGRpc3RyaWJ1dGVkVG9NZW1iZXJBbW91bnQgdGhlIGFtb3VudCBkaXN0cmlidXRlZCB0byB0aGUgbWVtYmVyIGR1cmluZyB0aGUgY2FzaC1vdXQvcmVpbWJ1cnNlbWVudFxuICAgICAqXG4gICAgICogQHJldHVybiBhIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgUmVpbWJ1cnNlbWVudFByb2Nlc3NpbmdSZXNwb25zZX0gcmVwcmVzZW50aW5nIGFcbiAgICAgKiBmbGFnIGluZGljYXRpbmcgd2hldGhlciB0aGUgcmVpbWJ1cnNlbWVudCBwcm9jZXNzIGNhbiBjb250aW51ZSBvciBub3QuXG4gICAgICovXG4gICAgYXN5bmMgdXBkYXRlVHJhbnNhY3Rpb25TdGF0dXModHJhbnNhY3Rpb25JZDogc3RyaW5nLCBkaXN0cmlidXRlZFRvTWVtYmVyQW1vdW50OiBudW1iZXIpOiBQcm9taXNlPFJlaW1idXJzZW1lbnRQcm9jZXNzaW5nUmVzcG9uc2U+IHtcbiAgICAgICAgLy8gZWFzaWx5IGlkZW50aWZpYWJsZSBBUEkgZW5kcG9pbnQgaW5mb3JtYXRpb25cbiAgICAgICAgY29uc3QgZW5kcG9pbnRJbmZvID0gJ1BVVCB0cmFuc2FjdGlvbnMve2lkfS9yZXdhcmQgT2xpdmUgQVBJJztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIEFQSSBLZXkgYW5kIEJhc2UgVVJMLCBuZWVkZWQgaW4gb3JkZXIgdG8gbWFrZSB0aGUgUFVUIHRyYW5zYWN0aW9uIHN0YXR1cy9hbW91bnQgY2FsbCB0aHJvdWdoIHRoZSBjbGllbnRcbiAgICAgICAgICAgIGNvbnN0IFtvbGl2ZUJhc2VVUkwsIG9saXZlUHVibGljS2V5LCBvbGl2ZVByaXZhdGVLZXldID0gYXdhaXQgc3VwZXIucmV0cmlldmVTZXJ2aWNlQ3JlZGVudGlhbHMoQ29uc3RhbnRzLkFXU1BhaXJDb25zdGFudHMuT0xJVkVfU0VDUkVUX05BTUUpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgd2Ugb2J0YWluZWQgYW55IGludmFsaWQgc2VjcmV0IHZhbHVlcyBmcm9tIHRoZSBjYWxsIGFib3ZlXG4gICAgICAgICAgICBpZiAob2xpdmVCYXNlVVJMID09PSBudWxsIHx8IG9saXZlQmFzZVVSTC5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBvbGl2ZVB1YmxpY0tleSA9PT0gbnVsbCB8fCBvbGl2ZVB1YmxpY0tleS5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBvbGl2ZVByaXZhdGVLZXkgPT09IG51bGwgfHwgb2xpdmVQcml2YXRlS2V5IS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBcIkludmFsaWQgU2VjcmV0cyBvYnRhaW5lZCBmb3IgT2xpdmUgQVBJIGNhbGwhXCI7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IFJlaW1idXJzZW1lbnRQcm9jZXNzaW5nU3RhdHVzLkZhaWxlZCxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogUmVpbWJ1cnNlbWVudHNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBQVVQgdHJhbnNhY3Rpb25zL3tpZH0vcmV3YXJkXG4gICAgICAgICAgICAgKiBAbGluayBodHRwczovL2RldmVsb3Blci5vbGl2ZWx0ZC5jb20vcmVmZXJlbmNlL3VwZGF0ZS1yZXdhcmQtc3RhdHVzXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogYnVpbGQgdGhlIE9saXZlIEFQSSByZXF1ZXN0IGJvZHkgdG8gYmUgcGFzc2VkIGluLCBhbmQgcGVyZm9ybSBhIEdFVCB0byBpdCB3aXRoIHRoZSBhcHByb3ByaWF0ZSBpbmZvcm1hdGlvblxuICAgICAgICAgICAgICogd2UgaW1wbHkgdGhhdCBpZiB0aGUgQVBJIGRvZXMgbm90IHJlc3BvbmQgaW4gMTUgc2Vjb25kcywgdGhlbiB3ZSBhdXRvbWF0aWNhbGx5IGNhdGNoIHRoYXQsIGFuZCByZXR1cm4gYW5cbiAgICAgICAgICAgICAqIGVycm9yIGZvciBhIGJldHRlciBjdXN0b21lciBleHBlcmllbmNlLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBjb25zdCByZXF1ZXN0RGF0YSA9IHtcbiAgICAgICAgICAgICAgICBkaXN0cmlidXRlZFRvTWVtYmVyQW1vdW50OiBkaXN0cmlidXRlZFRvTWVtYmVyQW1vdW50LnRvRml4ZWQoMilcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgT2xpdmUgQVBJIHJlcXVlc3QgT2JqZWN0OiAke0pTT04uc3RyaW5naWZ5KHJlcXVlc3REYXRhKX1gKTtcbiAgICAgICAgICAgIHJldHVybiBheGlvcy5wdXQoYCR7b2xpdmVCYXNlVVJMfS90cmFuc2FjdGlvbnMvJHt0cmFuc2FjdGlvbklkfS9yZXdhcmRgLCByZXF1ZXN0RGF0YSwge1xuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiT2xpdmUtS2V5XCI6IG9saXZlUHJpdmF0ZUtleVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGltZW91dDogMTUwMDAsIC8vIGluIG1pbGxpc2Vjb25kcyBoZXJlXG4gICAgICAgICAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZTogJ09saXZlIEFQSSB0aW1lZCBvdXQgYWZ0ZXIgMTUwMDBtcyEnXG4gICAgICAgICAgICB9KS50aGVuKHVwZGF0ZVJld2FyZFN0YXR1c1Jlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlbmRwb2ludEluZm99IHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkodXBkYXRlUmV3YXJkU3RhdHVzUmVzcG9uc2UuZGF0YSl9YCk7XG5cbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiBpZiB3ZSByZWFjaGVkIHRoaXMsIHRoZW4gd2UgYXNzdW1lIHRoYXQgYSAyeHggcmVzcG9uc2UgY29kZSB3YXMgcmV0dXJuZWQuXG4gICAgICAgICAgICAgICAgICogZm9yIHRoaXMgQVBJLCB3ZSBrbm93IHRoYXQgaWYgd2UgcmV0dXJuIGEgMjA0LCB0aGVuIHRoZSByZXdhcmQgc3RhdHVzIGhhcyBiZWVuIHVwZGF0ZWQuXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgaWYgKHVwZGF0ZVJld2FyZFN0YXR1c1Jlc3BvbnNlLnN0YXR1cyA9PT0gMjA0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiBhIGZsYWcgaW5kaWNhdGluZyB0aGF0IHRoZSByZWltYnVyc2VtZW50IHByb2Nlc3MgbWF5IGNvbnRpbnVlIGFjY29yZGluZ2x5XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBSZWltYnVyc2VtZW50UHJvY2Vzc2luZ1N0YXR1cy5TdWNjZXNzXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogUmVpbWJ1cnNlbWVudFByb2Nlc3NpbmdTdGF0dXMuRmFpbGVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgSW52YWxpZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UhYCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogUmVpbWJ1cnNlbWVudHNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yLnJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBhbmQgdGhlIHNlcnZlciByZXNwb25kZWQgd2l0aCBhIHN0YXR1cyBjb2RlXG4gICAgICAgICAgICAgICAgICAgICAqIHRoYXQgZmFsbHMgb3V0IG9mIHRoZSByYW5nZSBvZiAyeHguXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm9uIDJ4eHggcmVzcG9uc2Ugd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE9saXZlIEFQSSwgd2l0aCBzdGF0dXMgJHtlcnJvci5yZXNwb25zZS5zdGF0dXN9LCBhbmQgcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShlcnJvci5yZXNwb25zZS5kYXRhKX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGFueSBvdGhlciBzcGVjaWZpYyBlcnJvcnMgdG8gYmUgZmlsdGVyZWQgYmVsb3dcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IFJlaW1idXJzZW1lbnRQcm9jZXNzaW5nU3RhdHVzLkZhaWxlZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBSZWltYnVyc2VtZW50c0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVycm9yLnJlcXVlc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGJ1dCBubyByZXNwb25zZSB3YXMgcmVjZWl2ZWRcbiAgICAgICAgICAgICAgICAgICAgICogYGVycm9yLnJlcXVlc3RgIGlzIGFuIGluc3RhbmNlIG9mIFhNTEh0dHBSZXF1ZXN0IGluIHRoZSBicm93c2VyIGFuZCBhbiBpbnN0YW5jZSBvZlxuICAgICAgICAgICAgICAgICAgICAgKiAgaHR0cC5DbGllbnRSZXF1ZXN0IGluIG5vZGUuanMuXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm8gcmVzcG9uc2UgcmVjZWl2ZWQgd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE9saXZlIEFQSSwgZm9yIHJlcXVlc3QgJHtlcnJvci5yZXF1ZXN0fWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IFJlaW1idXJzZW1lbnRQcm9jZXNzaW5nU3RhdHVzLkZhaWxlZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBSZWltYnVyc2VtZW50c0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBTb21ldGhpbmcgaGFwcGVuZWQgaW4gc2V0dGluZyB1cCB0aGUgcmVxdWVzdCB0aGF0IHRyaWdnZXJlZCBhbiBFcnJvclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IGZvciB0aGUgJHtlbmRwb2ludEluZm99IE9saXZlIEFQSSwgJHsoZXJyb3IgJiYgZXJyb3IubWVzc2FnZSkgJiYgZXJyb3IubWVzc2FnZX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBSZWltYnVyc2VtZW50UHJvY2Vzc2luZ1N0YXR1cy5GYWlsZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogUmVpbWJ1cnNlbWVudHNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgaW5pdGlhdGluZyB0aGUgdHJhbnNhY3Rpb24gcmV3YXJkIHN0YXR1cyB1cGRhdGUgdGhyb3VnaCAke2VuZHBvaW50SW5mb31gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfSAke2Vycn1gKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBkYXRhOiBSZWltYnVyc2VtZW50UHJvY2Vzc2luZ1N0YXR1cy5GYWlsZWQsXG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBSZWltYnVyc2VtZW50c0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB1c2VkIHRvIHNlYXJjaCBhbiBvZmZlciwgZ2l2ZW4gY2VydGFpbiBmaWx0ZXJzIHRvIGJlIHBhc3NlZCBpbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBzZWFyY2hPZmZlcnNJbnB1dCB0aGUgb2ZmZXJzIGlucHV0LCBjb250YWluaW5nIHRoZSBmaWx0ZXJpbmcgaW5mb3JtYXRpb25cbiAgICAgKiB1c2VkIHRvIHNlYXJjaCBhbnkgYXBwbGljYWJsZS9tYXRjaGluZyBvZmZlcnMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBhIHtAbGluayBPZmZlcnNSZXNwb25zZX0gcmVwcmVzZW50aW5nIHRoZSBtYXRjaGVkIG9mZmVycycgaW5mb3JtYXRpb24uXG4gICAgICovXG4gICAgYXN5bmMgc2VhcmNoT2ZmZXJzKHNlYXJjaE9mZmVyc0lucHV0OiBTZWFyY2hPZmZlcnNJbnB1dCk6IFByb21pc2U8T2ZmZXJzUmVzcG9uc2U+IHtcbiAgICAgICAgLy8gZWFzaWx5IGlkZW50aWZpYWJsZSBBUEkgZW5kcG9pbnQgaW5mb3JtYXRpb25cbiAgICAgICAgY29uc3QgZW5kcG9pbnRJbmZvID0gJ0dFVCAvb2ZmZXJzIE9saXZlIEFQSSBmb3Igc2VhcmNoaW5nIG9mZmVycyc7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBBUEkgS2V5IGFuZCBCYXNlIFVSTCwgbmVlZGVkIGluIG9yZGVyIHRvIG1ha2UgdGhlIEdFVCBvZmZlcnMgY2FsbCB0aHJvdWdoIHRoZSBjbGllbnRcbiAgICAgICAgICAgIGNvbnN0IFtvbGl2ZUJhc2VVUkwsIG9saXZlUHVibGljS2V5LCBvbGl2ZVByaXZhdGVLZXksXG4gICAgICAgICAgICAgICAgbW9vbmJlYW1EZWZhdWx0TG95YWx0eSwgbW9vbmJlYW1GaWRlbGlzRGVmYXVsdExveWFsdHksIG1vb25iZWFtT25saW5lTG95YWx0eSxcbiAgICAgICAgICAgICAgICBtb29uYmVhbVByZW1pZXJPbmxpbmVMb3lhbHR5LCBtb29uYmVhbVByZW1pZXJOZWFyYnlMb3lhbHR5LCBtb29uYmVhbVZldGVyYW5zRGF5TG95YWx0eSxcbiAgICAgICAgICAgICAgICBtb29uYmVhbUNsaWNrTG95YWx0eSwgbW9vbmJlYW1QcmVtaWVyQ2xpY2tMb3lhbHR5XSA9XG4gICAgICAgICAgICAgICAgYXdhaXQgc3VwZXIucmV0cmlldmVTZXJ2aWNlQ3JlZGVudGlhbHMoXG4gICAgICAgICAgICAgICAgICAgIENvbnN0YW50cy5BV1NQYWlyQ29uc3RhbnRzLk9MSVZFX1NFQ1JFVF9OQU1FLFxuICAgICAgICAgICAgICAgICAgICB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgIHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgdHJ1ZSk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB3ZSBvYnRhaW5lZCBhbnkgaW52YWxpZCBzZWNyZXQgdmFsdWVzIGZyb20gdGhlIGNhbGwgYWJvdmVcbiAgICAgICAgICAgIGlmIChvbGl2ZUJhc2VVUkwgPT09IG51bGwgfHwgb2xpdmVCYXNlVVJMLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG9saXZlUHVibGljS2V5ID09PSBudWxsIHx8IG9saXZlUHVibGljS2V5Lmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG9saXZlUHJpdmF0ZUtleSA9PT0gbnVsbCB8fCBvbGl2ZVByaXZhdGVLZXkhLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG1vb25iZWFtRGVmYXVsdExveWFsdHkgPT09IG51bGwgfHwgbW9vbmJlYW1EZWZhdWx0TG95YWx0eSEubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgbW9vbmJlYW1GaWRlbGlzRGVmYXVsdExveWFsdHkgPT09IG51bGwgfHwgbW9vbmJlYW1GaWRlbGlzRGVmYXVsdExveWFsdHkhLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG1vb25iZWFtT25saW5lTG95YWx0eSA9PT0gbnVsbCB8fCBtb29uYmVhbU9ubGluZUxveWFsdHkhLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG1vb25iZWFtVmV0ZXJhbnNEYXlMb3lhbHR5ID09PSBudWxsIHx8IG1vb25iZWFtVmV0ZXJhbnNEYXlMb3lhbHR5IS5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBtb29uYmVhbUNsaWNrTG95YWx0eSA9PT0gbnVsbCB8fCBtb29uYmVhbUNsaWNrTG95YWx0eSEubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgbW9vbmJlYW1QcmVtaWVyQ2xpY2tMb3lhbHR5ID09PSBudWxsIHx8IG1vb25iZWFtUHJlbWllckNsaWNrTG95YWx0eSEubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgbW9vbmJlYW1QcmVtaWVyT25saW5lTG95YWx0eSA9PT0gbnVsbCB8fCBtb29uYmVhbVByZW1pZXJPbmxpbmVMb3lhbHR5IS5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBtb29uYmVhbVByZW1pZXJOZWFyYnlMb3lhbHR5ID09PSBudWxsIHx8IG1vb25iZWFtUHJlbWllck5lYXJieUxveWFsdHkhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IFwiSW52YWxpZCBTZWNyZXRzIG9idGFpbmVkIGZvciBPbGl2ZSBBUEkgY2FsbCFcIjtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogT2ZmZXJzRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogR0VUIC9vZmZlcnNcbiAgICAgICAgICAgICAqIEBsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm9saXZlbHRkLmNvbS9yZWZlcmVuY2UvbGlzdC1vZmZlcnNcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBidWlsZCB0aGUgT2xpdmUgQVBJIHJlcXVlc3QgcGFyYW1zIHRvIGJlIHBhc3NlZCBpbiwgYW5kIHBlcmZvcm0gYSBHRVQgdG8gaXQgd2l0aCB0aGUgYXBwcm9wcmlhdGUgaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAqIHdlIGltcGx5IHRoYXQgaWYgdGhlIEFQSSBkb2VzIG5vdCByZXNwb25kIGluIDE1IHNlY29uZHMsIHRoZW4gd2UgYXV0b21hdGljYWxseSBjYXRjaCB0aGF0LCBhbmQgcmV0dXJuIGFuXG4gICAgICAgICAgICAgKiBlcnJvciBmb3IgYSBiZXR0ZXIgY3VzdG9tZXIgZXhwZXJpZW5jZS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgbGV0IHJlcXVlc3RVUkwgPSBgJHtvbGl2ZUJhc2VVUkx9L29mZmVyc2A7XG4gICAgICAgICAgICAvLyB0aGUgbG95YWx0eSBwcm9ncmFtIGlkIGlzIGRlZmF1bHRlZCB0byB0aGUgZGVmYXVsdCBsb3lhbHR5IHByb2dyYW1cbiAgICAgICAgICAgIGNvbnN0IGRlZmF1bHRMb3lhbHR5UHJvZ3JhbUlkOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBtb29uYmVhbURlZmF1bHRMb3lhbHR5O1xuICAgICAgICAgICAgLy8gYnVpbGQgdGhlIHNlYXJjaCBvZmZlcnMgVVJMXG4gICAgICAgICAgICByZXF1ZXN0VVJMICs9IGA/bG95YWx0eVByb2dyYW1JZD0ke2RlZmF1bHRMb3lhbHR5UHJvZ3JhbUlkfSZjb3VudHJ5Q29kZT1VUyZwYWdlU2l6ZT0xMDAwJnBhZ2VOdW1iZXI9MSZvZmZlclN0YXRlcz1hY3RpdmUmb2ZmZXJTdGF0ZXM9c2NoZWR1bGVkYDtcbiAgICAgICAgICAgIHJlcXVlc3RVUkwgKz0gKHNlYXJjaE9mZmVyc0lucHV0LnJhZGl1cyAmJiBzZWFyY2hPZmZlcnNJbnB1dC5yYWRpdXNMYXRpdHVkZSAmJiBzZWFyY2hPZmZlcnNJbnB1dC5yYWRpdXNMb25naXR1ZGUpXG4gICAgICAgICAgICAgICAgPyBgJnJhZGl1c0xhdGl0dWRlPSR7c2VhcmNoT2ZmZXJzSW5wdXQucmFkaXVzTGF0aXR1ZGUhfSZyYWRpdXNMb25naXR1ZGU9JHtzZWFyY2hPZmZlcnNJbnB1dC5yYWRpdXNMb25naXR1ZGUhfSZyYWRpdXM9JHtzZWFyY2hPZmZlcnNJbnB1dC5yYWRpdXMhfWBcbiAgICAgICAgICAgICAgICA6IGBgO1xuICAgICAgICAgICAgcmVxdWVzdFVSTCArPSBgJnNlYXJjaD1cXFwiJHtlbmNvZGVVUklDb21wb25lbnQoc2VhcmNoT2ZmZXJzSW5wdXQuc2VhcmNoVGV4dCl9XFxcImA7XG4gICAgICAgICAgICAvLyBsb2cgdGhlIHJlcXVlc3QgVVJMLCBzaW5jZSB3ZSBhcmUgZG9pbmcgYSBsb3Qgb2YgZmlsdGVyaW5nLCBmb3Igc2FuaXR5IHB1cnBvc2VzXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgUmVxdWVzdCBVUkwgZm9yIE9saXZlICR7cmVxdWVzdFVSTH1gKTtcbiAgICAgICAgICAgIHJldHVybiBheGlvcy5nZXQocmVxdWVzdFVSTCwge1xuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiT2xpdmUtS2V5XCI6IG9saXZlUHJpdmF0ZUtleVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGltZW91dDogMjUwMDAsIC8vIGluIG1pbGxpc2Vjb25kcyBoZXJlXG4gICAgICAgICAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZTogJ09saXZlIEFQSSB0aW1lZCBvdXQgYWZ0ZXIgMjUwMDBtcyEnXG4gICAgICAgICAgICB9KS50aGVuKGFzeW5jIGdldE9mZmVyc1Jlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiBpZiB3ZSByZWFjaGVkIHRoaXMsIHRoZW4gd2UgYXNzdW1lIHRoYXQgYSAyeHggcmVzcG9uc2UgY29kZSB3YXMgcmV0dXJuZWQuXG4gICAgICAgICAgICAgICAgICogY2hlY2sgdGhlIGNvbnRlbnRzIG9mIHRoZSByZXNwb25zZSwgYW5kIGFjdCBhcHByb3ByaWF0ZWx5LlxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGlmIChnZXRPZmZlcnNSZXNwb25zZS5kYXRhICE9PSB1bmRlZmluZWQgJiYgZ2V0T2ZmZXJzUmVzcG9uc2UuZGF0YVtcInRvdGFsTnVtYmVyT2ZQYWdlc1wiXSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgICAgICAgICAgIGdldE9mZmVyc1Jlc3BvbnNlLmRhdGFbXCJ0b3RhbE51bWJlck9mUmVjb3Jkc1wiXSAhPT0gdW5kZWZpbmVkICYmIGdldE9mZmVyc1Jlc3BvbnNlLmRhdGFbXCJpdGVtc1wiXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgYXJyYXkgb2Ygb2ZmZXIgaXRlbXMgYWNjb3JkaW5nbHlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvZmZlcnM6IGdldE9mZmVyc1Jlc3BvbnNlLmRhdGFbXCJpdGVtc1wiXSBhcyBPZmZlcltdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsTnVtYmVyT2ZQYWdlczogZ2V0T2ZmZXJzUmVzcG9uc2UuZGF0YVtcInRvdGFsTnVtYmVyT2ZQYWdlc1wiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3RhbE51bWJlck9mUmVjb3JkczogZ2V0T2ZmZXJzUmVzcG9uc2UuZGF0YVtcInRvdGFsTnVtYmVyT2ZSZWNvcmRzXCJdXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgSW52YWxpZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShnZXRPZmZlcnNSZXNwb25zZSl9IWAsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE9mZmVyc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IucmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGFuZCB0aGUgc2VydmVyIHJlc3BvbmRlZCB3aXRoIGEgc3RhdHVzIGNvZGVcbiAgICAgICAgICAgICAgICAgICAgICogdGhhdCBmYWxscyBvdXQgb2YgdGhlIHJhbmdlIG9mIDJ4eC5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBOb24gMnh4eCByZXNwb25zZSB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gT2xpdmUgQVBJLCB3aXRoIHN0YXR1cyAke2Vycm9yLnJlc3BvbnNlLnN0YXR1c30sIGFuZCByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGVycm9yLnJlc3BvbnNlLmRhdGEpfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gYW55IG90aGVyIHNwZWNpZmljIGVycm9ycyB0byBiZSBmaWx0ZXJlZCBiZWxvd1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE9mZmVyc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVycm9yLnJlcXVlc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGJ1dCBubyByZXNwb25zZSB3YXMgcmVjZWl2ZWRcbiAgICAgICAgICAgICAgICAgICAgICogYGVycm9yLnJlcXVlc3RgIGlzIGFuIGluc3RhbmNlIG9mIFhNTEh0dHBSZXF1ZXN0IGluIHRoZSBicm93c2VyIGFuZCBhbiBpbnN0YW5jZSBvZlxuICAgICAgICAgICAgICAgICAgICAgKiAgaHR0cC5DbGllbnRSZXF1ZXN0IGluIG5vZGUuanMuXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm8gcmVzcG9uc2UgcmVjZWl2ZWQgd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE9saXZlIEFQSSwgZm9yIHJlcXVlc3QgJHtlcnJvci5yZXF1ZXN0fWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBPZmZlcnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU29tZXRoaW5nIGhhcHBlbmVkIGluIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgdGhhdCB0cmlnZ2VyZWQgYW4gRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgc2V0dGluZyB1cCB0aGUgcmVxdWVzdCBmb3IgdGhlICR7ZW5kcG9pbnRJbmZvfSBPbGl2ZSBBUEksICR7KGVycm9yICYmIGVycm9yLm1lc3NhZ2UpICYmIGVycm9yLm1lc3NhZ2V9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE9mZmVyc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBpbml0aWF0aW5nIHRoZSBvZmZlcnMgcmV0cmlldmFsIHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJ9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBPZmZlcnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdXNlZCB0byBnZXQgYWxsIHRoZSBvZmZlcnMsIGdpdmVuIGNlcnRhaW4gZmlsdGVycyB0byBiZSBwYXNzZWQgaW4uXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZ2V0T2ZmZXJzSW5wdXQgdGhlIG9mZmVycyBpbnB1dCwgY29udGFpbmluZyB0aGUgZmlsdGVyaW5nIGluZm9ybWF0aW9uXG4gICAgICogdXNlZCB0byByZXRyaWV2ZSBhbGwgdGhlIGFwcGxpY2FibGUvbWF0Y2hpbmcgb2ZmZXJzLlxuICAgICAqIEBwYXJhbSBudW1iZXJPZlJldHJpZXMgdGhpcyBvcHRpb25hbCBwYXJhbSBpcyBhcHBsaWVkIGluIGV4dHJlbWUgY2lyY3Vtc3RhbmNlcyxcbiAgICAgKiB3aGVuIHRoZSBudW1iZXIgb2YgcmVjb3JkcyByZXR1cm5lZCBkb2VzIG5vdCBtYXRjaCB0byB0aGUgbnVtYmVyIG9mIHJlY29yZHMgcGFyYW1ldGVyLlxuICAgICAqIEBwYXJhbSBwYWdlTnVtYmVyIHRoaXMgb3B0aW9uYWwgcGFyYW0gaXMgYXBwbGllZCBpbiBleHRyZW1lIGNpcmN1bXN0YW5jZXMsXG4gICAgICogd2hlbiB0aGUgbnVtYmVyIG9mIHJlY29yZHMgcmV0dXJuZWQgZG9lcyBub3QgbWF0Y2ggdG8gdGhlIG51bWJlciBvZiByZWNvcmRzIHBhcmFtZXRlcixcbiAgICAgKiBhbmQgd2UgbmVlZCB0byBkZWNyZWFzZSB0aGUgcGFnZSBudW1iZXIgZm9yY2VmdWxseS5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIGEge0BsaW5rIE9mZmVyc1Jlc3BvbnNlfSByZXByZXNlbnRpbmcgdGhlIG1hdGNoZWQgb2ZmZXJzJyBpbmZvcm1hdGlvbi5cbiAgICAgKi9cbiAgICBhc3luYyBnZXRPZmZlcnMoZ2V0T2ZmZXJzSW5wdXQ6IEdldE9mZmVyc0lucHV0LCBudW1iZXJPZlJldHJpZXM/OiBudW1iZXIsIHBhZ2VOdW1iZXI/OiBudW1iZXIpOiBQcm9taXNlPE9mZmVyc1Jlc3BvbnNlPiB7XG4gICAgICAgIC8vIGVhc2lseSBpZGVudGlmaWFibGUgQVBJIGVuZHBvaW50IGluZm9ybWF0aW9uXG4gICAgICAgIGNvbnN0IGVuZHBvaW50SW5mbyA9ICdHRVQgL29mZmVycyBPbGl2ZSBBUEknO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgQVBJIEtleSBhbmQgQmFzZSBVUkwsIG5lZWRlZCBpbiBvcmRlciB0byBtYWtlIHRoZSBHRVQgb2ZmZXJzIGNhbGwgdGhyb3VnaCB0aGUgY2xpZW50XG4gICAgICAgICAgICBjb25zdCBbb2xpdmVCYXNlVVJMLCBvbGl2ZVB1YmxpY0tleSwgb2xpdmVQcml2YXRlS2V5LFxuICAgICAgICAgICAgICAgIG1vb25iZWFtRGVmYXVsdExveWFsdHksIG1vb25iZWFtRmlkZWxpc0RlZmF1bHRMb3lhbHR5LCBtb29uYmVhbU9ubGluZUxveWFsdHksXG4gICAgICAgICAgICAgICAgbW9vbmJlYW1QcmVtaWVyT25saW5lTG95YWx0eSwgbW9vbmJlYW1QcmVtaWVyTmVhcmJ5TG95YWx0eSwgbW9vbmJlYW1WZXRlcmFuc0RheUxveWFsdHksXG4gICAgICAgICAgICAgICAgbW9vbmJlYW1DbGlja0xveWFsdHksIG1vb25iZWFtUHJlbWllckNsaWNrTG95YWx0eV0gPVxuICAgICAgICAgICAgICAgIGF3YWl0IHN1cGVyLnJldHJpZXZlU2VydmljZUNyZWRlbnRpYWxzKFxuICAgICAgICAgICAgICAgICAgICBDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5PTElWRV9TRUNSRVRfTkFNRSxcbiAgICAgICAgICAgICAgICAgICAgdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgIHRydWUpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgd2Ugb2J0YWluZWQgYW55IGludmFsaWQgc2VjcmV0IHZhbHVlcyBmcm9tIHRoZSBjYWxsIGFib3ZlXG4gICAgICAgICAgICBpZiAob2xpdmVCYXNlVVJMID09PSBudWxsIHx8IG9saXZlQmFzZVVSTC5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBvbGl2ZVB1YmxpY0tleSA9PT0gbnVsbCB8fCBvbGl2ZVB1YmxpY0tleS5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBvbGl2ZVByaXZhdGVLZXkgPT09IG51bGwgfHwgb2xpdmVQcml2YXRlS2V5IS5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBtb29uYmVhbURlZmF1bHRMb3lhbHR5ID09PSBudWxsIHx8IG1vb25iZWFtRGVmYXVsdExveWFsdHkhLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG1vb25iZWFtRmlkZWxpc0RlZmF1bHRMb3lhbHR5ID09PSBudWxsIHx8IG1vb25iZWFtRmlkZWxpc0RlZmF1bHRMb3lhbHR5IS5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBtb29uYmVhbU9ubGluZUxveWFsdHkgPT09IG51bGwgfHwgbW9vbmJlYW1PbmxpbmVMb3lhbHR5IS5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBtb29uYmVhbVZldGVyYW5zRGF5TG95YWx0eSA9PT0gbnVsbCB8fCBtb29uYmVhbVZldGVyYW5zRGF5TG95YWx0eSEubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgbW9vbmJlYW1DbGlja0xveWFsdHkgPT09IG51bGwgfHwgbW9vbmJlYW1DbGlja0xveWFsdHkhLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG1vb25iZWFtUHJlbWllckNsaWNrTG95YWx0eSA9PT0gbnVsbCB8fCBtb29uYmVhbVByZW1pZXJDbGlja0xveWFsdHkhLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG1vb25iZWFtUHJlbWllck9ubGluZUxveWFsdHkgPT09IG51bGwgfHwgbW9vbmJlYW1QcmVtaWVyT25saW5lTG95YWx0eSEubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgbW9vbmJlYW1QcmVtaWVyTmVhcmJ5TG95YWx0eSA9PT0gbnVsbCB8fCBtb29uYmVhbVByZW1pZXJOZWFyYnlMb3lhbHR5IS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBcIkludmFsaWQgU2VjcmV0cyBvYnRhaW5lZCBmb3IgT2xpdmUgQVBJIGNhbGwhXCI7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE9mZmVyc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEdFVCAvb2ZmZXJzXG4gICAgICAgICAgICAgKiBAbGluayBodHRwczovL2RldmVsb3Blci5vbGl2ZWx0ZC5jb20vcmVmZXJlbmNlL2xpc3Qtb2ZmZXJzXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogYnVpbGQgdGhlIE9saXZlIEFQSSByZXF1ZXN0IHBhcmFtcyB0byBiZSBwYXNzZWQgaW4sIGFuZCBwZXJmb3JtIGEgR0VUIHRvIGl0IHdpdGggdGhlIGFwcHJvcHJpYXRlIGluZm9ybWF0aW9uXG4gICAgICAgICAgICAgKiB3ZSBpbXBseSB0aGF0IGlmIHRoZSBBUEkgZG9lcyBub3QgcmVzcG9uZCBpbiAxNSBzZWNvbmRzLCB0aGVuIHdlIGF1dG9tYXRpY2FsbHkgY2F0Y2ggdGhhdCwgYW5kIHJldHVybiBhblxuICAgICAgICAgICAgICogZXJyb3IgZm9yIGEgYmV0dGVyIGN1c3RvbWVyIGV4cGVyaWVuY2UuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGxldCByZXF1ZXN0VVJMID0gYCR7b2xpdmVCYXNlVVJMfS9vZmZlcnNgO1xuICAgICAgICAgICAgLy8gc3dpdGNoIHRoZSBsb3lhbHR5IHByb2dyYW0gaWQgYWNjb3JkaW5nIHRvIHRoZSBmaWx0ZXIgcGFzc2VkIGluXG4gICAgICAgICAgICBsZXQgbG95YWx0eVByb2dyYW1JZDogc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZCA9ICdOQSc7XG4gICAgICAgICAgICBzd2l0Y2ggKGdldE9mZmVyc0lucHV0LmZpbHRlclR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIE9mZmVyRmlsdGVyLkZpZGVsaXM6XG4gICAgICAgICAgICAgICAgICAgIGxveWFsdHlQcm9ncmFtSWQgPSBtb29uYmVhbUZpZGVsaXNEZWZhdWx0TG95YWx0eTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBPZmZlckZpbHRlci5DYXRlZ29yaXplZE5lYXJieTpcbiAgICAgICAgICAgICAgICBjYXNlIE9mZmVyRmlsdGVyLk5lYXJieTpcbiAgICAgICAgICAgICAgICAgICAgbG95YWx0eVByb2dyYW1JZCA9IG1vb25iZWFtRGVmYXVsdExveWFsdHk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgT2ZmZXJGaWx0ZXIuQ2F0ZWdvcml6ZWRPbmxpbmU6XG4gICAgICAgICAgICAgICAgY2FzZSBPZmZlckZpbHRlci5PbmxpbmU6XG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIHRoZSByZWRlbXB0aW9uIHR5cGUgaXMgY2xpY2ssIHRoZW4gd2UgZ28gdG8gdGhlIGRlZmF1bHQgcHJvZ3JhbSBmb3IgdGhlIGFmZmlsaWF0ZSBuZXR3b3Jrc1xuICAgICAgICAgICAgICAgICAgICBpZiAoZ2V0T2ZmZXJzSW5wdXQucmVkZW1wdGlvblR5cGUgPT09IFJlZGVtcHRpb25UeXBlLkNsaWNrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb3lhbHR5UHJvZ3JhbUlkID0gbW9vbmJlYW1DbGlja0xveWFsdHk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb3lhbHR5UHJvZ3JhbUlkID0gbW9vbmJlYW1PbmxpbmVMb3lhbHR5O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgT2ZmZXJGaWx0ZXIuUHJlbWllck9ubGluZTpcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgdGhlIHJlZGVtcHRpb24gdHlwZSBpcyBjbGljaywgdGhlbiB3ZSBnbyB0byB0aGUgZGVmYXVsdCBwcm9ncmFtIGZvciB0aGUgYWZmaWxpYXRlIG5ldHdvcmtzXG4gICAgICAgICAgICAgICAgICAgIGlmIChnZXRPZmZlcnNJbnB1dC5yZWRlbXB0aW9uVHlwZSA9PT0gUmVkZW1wdGlvblR5cGUuQ2xpY2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxveWFsdHlQcm9ncmFtSWQgPSBtb29uYmVhbVByZW1pZXJDbGlja0xveWFsdHk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb3lhbHR5UHJvZ3JhbUlkID0gbW9vbmJlYW1QcmVtaWVyT25saW5lTG95YWx0eTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIE9mZmVyRmlsdGVyLlByZW1pZXJOZWFyYnk6XG4gICAgICAgICAgICAgICAgICAgIGxveWFsdHlQcm9ncmFtSWQgPSBtb29uYmVhbVByZW1pZXJOZWFyYnlMb3lhbHR5O1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIE9mZmVyRmlsdGVyLlZldGVyYW5zRGF5OlxuICAgICAgICAgICAgICAgICAgICBsb3lhbHR5UHJvZ3JhbUlkID0gbW9vbmJlYW1WZXRlcmFuc0RheUxveWFsdHk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgT2ZmZXJGaWx0ZXIuU2Vhc29uYWxPbmxpbmU6XG4gICAgICAgICAgICAgICAgY2FzZSBPZmZlckZpbHRlci5TZWFzb25hbE5lYXJieTpcbiAgICAgICAgICAgICAgICAgICAgbG95YWx0eVByb2dyYW1JZCA9XG4gICAgICAgICAgICAgICAgICAgICAgICBnZXRPZmZlcnNJbnB1dC5vZmZlclNlYXNvbmFsVHlwZSA9PT0gT2ZmZXJTZWFzb25hbFR5cGUuVmV0ZXJhbnNEYXlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IG1vb25iZWFtVmV0ZXJhbnNEYXlMb3lhbHR5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAnJztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFVua25vd24gb2ZmZXIgZmlsdGVyIHBhc3NlZCBpbiAke2dldE9mZmVyc0lucHV0LmZpbHRlclR5cGV9IHJlc3VsdGluZyBpbiBpbnZhbGlkIGxveWFsdHkgcHJvZ3JhbSBpZCFgKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXF1ZXN0VVJMICs9IGA/bG95YWx0eVByb2dyYW1JZD0ke2xveWFsdHlQcm9ncmFtSWR9YDtcbiAgICAgICAgICAgIC8vIE9saXZlIGRlcHJlY2F0ZWQgdGhlIGByZWRlbXB0aW9uVHlwZT1hbGxgIGFuZCByZXBsYWNlZCBpdCB3aXRoIGl0cyByZW1vdmFsXG4gICAgICAgICAgICByZXF1ZXN0VVJMICs9IGdldE9mZmVyc0lucHV0LnJlZGVtcHRpb25UeXBlICE9PSBSZWRlbXB0aW9uVHlwZS5BbGwgPyBgJnJlZGVtcHRpb25UeXBlPSR7Z2V0T2ZmZXJzSW5wdXQucmVkZW1wdGlvblR5cGV9YCA6IGBgO1xuICAgICAgICAgICAgLy8gT2xpdmUgd2FudHMgdXMgdG8gbm90IHBhc3MgYW55dGhpbmcgZm9yIHRoZSBgYXZhaWxhYmlsaXR5PWFsbGAgcGFyYW1ldGVyL2ZpbHRlcmluZ1xuICAgICAgICAgICAgcmVxdWVzdFVSTCArPSBnZXRPZmZlcnNJbnB1dC5hdmFpbGFiaWxpdHkgIT09IE9mZmVyQXZhaWxhYmlsaXR5LkFsbCA/IGAmYXZhaWxhYmlsaXR5PSR7Z2V0T2ZmZXJzSW5wdXQuYXZhaWxhYmlsaXR5fWAgOiBgYDtcbiAgICAgICAgICAgIHJlcXVlc3RVUkwgKz0gYCZjb3VudHJ5Q29kZT0ke2dldE9mZmVyc0lucHV0LmNvdW50cnlDb2RlfSZwYWdlU2l6ZT0ke2dldE9mZmVyc0lucHV0LnBhZ2VTaXplfSZwYWdlTnVtYmVyPSR7cGFnZU51bWJlciAhPT0gbnVsbCAmJiBwYWdlTnVtYmVyICE9PSB1bmRlZmluZWQgPyBwYWdlTnVtYmVyIDogZ2V0T2ZmZXJzSW5wdXQucGFnZU51bWJlcn1gO1xuICAgICAgICAgICAgZ2V0T2ZmZXJzSW5wdXQub2ZmZXJTdGF0ZXMuZm9yRWFjaChzdGF0ZSA9PiB7XG4gICAgICAgICAgICAgICAgcmVxdWVzdFVSTCArPSBgJm9mZmVyU3RhdGVzPSR7c3RhdGV9YDtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICByZXF1ZXN0VVJMICs9IChcbiAgICAgICAgICAgICAgICBnZXRPZmZlcnNJbnB1dC5maWx0ZXJUeXBlID09PSBPZmZlckZpbHRlci5OZWFyYnlcbiAgICAgICAgICAgICAgICB8fCBnZXRPZmZlcnNJbnB1dC5maWx0ZXJUeXBlID09PSBPZmZlckZpbHRlci5QcmVtaWVyTmVhcmJ5XG4gICAgICAgICAgICAgICAgfHwgZ2V0T2ZmZXJzSW5wdXQuZmlsdGVyVHlwZSA9PT0gT2ZmZXJGaWx0ZXIuQ2F0ZWdvcml6ZWROZWFyYnlcbiAgICAgICAgICAgICAgICB8fCBnZXRPZmZlcnNJbnB1dC5maWx0ZXJUeXBlID09PSBPZmZlckZpbHRlci5TZWFzb25hbE5lYXJieVxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgID8gYCZyYWRpdXNMYXRpdHVkZT0ke2dldE9mZmVyc0lucHV0LnJhZGl1c0xhdGl0dWRlIX0mcmFkaXVzTG9uZ2l0dWRlPSR7Z2V0T2ZmZXJzSW5wdXQucmFkaXVzTG9uZ2l0dWRlIX0mcmFkaXVzPSR7Z2V0T2ZmZXJzSW5wdXQucmFkaXVzIX0mcmFkaXVzSW5jbHVkZU9ubGluZVN0b3Jlcz0ke2dldE9mZmVyc0lucHV0LnJhZGl1c0luY2x1ZGVPbmxpbmVTdG9yZXMhfWBcbiAgICAgICAgICAgICAgICA6IGBgO1xuICAgICAgICAgICAgcmVxdWVzdFVSTCArPSBnZXRPZmZlcnNJbnB1dC5icmFuZE5hbWVcbiAgICAgICAgICAgICAgICA/IGAmYnJhbmREYmE9JHtlbmNvZGVVUklDb21wb25lbnQoZ2V0T2ZmZXJzSW5wdXQuYnJhbmROYW1lKX1gXG4gICAgICAgICAgICAgICAgOiBgYDtcbiAgICAgICAgICAgIHJlcXVlc3RVUkwgKz0gZ2V0T2ZmZXJzSW5wdXQub2ZmZXJDYXRlZ29yeVxuICAgICAgICAgICAgICAgID8gYCZicmFuZFBhcmVudENhdGVnb3J5PSR7Z2V0T2ZmZXJzSW5wdXQub2ZmZXJDYXRlZ29yeX1gXG4gICAgICAgICAgICAgICAgOiBgYDtcbiAgICAgICAgICAgIC8vIGxvZyB0aGUgcmVxdWVzdCBVUkwsIHNpbmNlIHdlIGFyZSBkb2luZyBhIGxvdCBvZiBmaWx0ZXJpbmcsIGZvciBzYW5pdHkgcHVycG9zZXNcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBSZXF1ZXN0IFVSTCBmb3IgT2xpdmUgJHtyZXF1ZXN0VVJMfWApO1xuICAgICAgICAgICAgcmV0dXJuIGF4aW9zLmdldChyZXF1ZXN0VVJMLCB7XG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAgICAgXCJPbGl2ZS1LZXlcIjogb2xpdmVQcml2YXRlS2V5XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiAyNTAwMCwgLy8gaW4gbWlsbGlzZWNvbmRzIGhlcmVcbiAgICAgICAgICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlOiAnT2xpdmUgQVBJIHRpbWVkIG91dCBhZnRlciAyNTAwMG1zISdcbiAgICAgICAgICAgIH0pLnRoZW4oYXN5bmMgZ2V0T2ZmZXJzUmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIC8vIHdlIGRvbid0IHdhbnQgdG8gbG9nIHRoaXMgaW4gY2FzZSBvZiBzdWNjZXNzIHJlc3BvbnNlcywgYmVjYXVzZSB0aGUgb2ZmZXIgcmVzcG9uc2VzIGFyZSB2ZXJ5IGxvbmcgKGZydWdhbGl0eSlcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhgJHtlbmRwb2ludEluZm99IHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZ2V0T2ZmZXJzUmVzcG9uc2UuZGF0YSl9YCk7XG5cbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiBpZiB3ZSByZWFjaGVkIHRoaXMsIHRoZW4gd2UgYXNzdW1lIHRoYXQgYSAyeHggcmVzcG9uc2UgY29kZSB3YXMgcmV0dXJuZWQuXG4gICAgICAgICAgICAgICAgICogY2hlY2sgdGhlIGNvbnRlbnRzIG9mIHRoZSByZXNwb25zZSwgYW5kIGFjdCBhcHByb3ByaWF0ZWx5LlxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGlmIChnZXRPZmZlcnNSZXNwb25zZS5kYXRhICE9PSB1bmRlZmluZWQgJiYgZ2V0T2ZmZXJzUmVzcG9uc2UuZGF0YVtcInRvdGFsTnVtYmVyT2ZQYWdlc1wiXSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgICAgICAgICAgIGdldE9mZmVyc1Jlc3BvbnNlLmRhdGFbXCJ0b3RhbE51bWJlck9mUmVjb3Jkc1wiXSAhPT0gdW5kZWZpbmVkICYmIGdldE9mZmVyc1Jlc3BvbnNlLmRhdGFbXCJpdGVtc1wiXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIHdlIHNvbWVob3cgZ2V0IGFuIHVuLW1hdGNoaW5nIG51bWJlciBvZiByZWNvcmRzIHRvIHJlY29yZHMgcmV0dXJuZWQsIHRoZW4gcmV0cnkgdGhpcyBjYWxsIGF0IG1vc3QsIHR3aWNlXG4gICAgICAgICAgICAgICAgICAgIGlmIChnZXRPZmZlcnNSZXNwb25zZS5kYXRhW1widG90YWxOdW1iZXJPZlJlY29yZHNcIl0gPiAwICYmIGdldE9mZmVyc1Jlc3BvbnNlLmRhdGFbXCJpdGVtc1wiXS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChudW1iZXJPZlJldHJpZXMgPT09IHVuZGVmaW5lZCB8fCBudW1iZXJPZlJldHJpZXMgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIGFycmF5IG9mIG9mZmVyIGl0ZW1zIGFjY29yZGluZ2x5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2ZmZXJzOiBnZXRPZmZlcnNSZXNwb25zZS5kYXRhW1wiaXRlbXNcIl0gYXMgT2ZmZXJbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsTnVtYmVyT2ZQYWdlczogZ2V0T2ZmZXJzUmVzcG9uc2UuZGF0YVtcInRvdGFsTnVtYmVyT2ZQYWdlc1wiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsTnVtYmVyT2ZSZWNvcmRzOiBnZXRPZmZlcnNSZXNwb25zZS5kYXRhW1widG90YWxOdW1iZXJPZlJlY29yZHNcIl1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgZGVsYXkoMTAwMCk7IC8vIGRlbGF5IDEgc2Vjb25kcyBiZXR3ZWVuIGNhbGxzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFJlLWF0dGVtcHRpbmcgdG8gcmV0cmlldmUgb2ZmZXJzIGR1ZSB0byBtaXNtYXRjaCBpdGVtcy9yZWNvcmRzIHJldHJpZXZlZCFgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRPZmZlcnMoZ2V0T2ZmZXJzSW5wdXQsIG51bWJlck9mUmV0cmllcy0xLCBnZXRPZmZlcnNJbnB1dC5wYWdlTnVtYmVyID4gMVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IGdldE9mZmVyc0lucHV0LnBhZ2VOdW1iZXIgLSAxXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogdW5kZWZpbmVkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgYXJyYXkgb2Ygb2ZmZXIgaXRlbXMgYWNjb3JkaW5nbHlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvZmZlcnM6IGdldE9mZmVyc1Jlc3BvbnNlLmRhdGFbXCJpdGVtc1wiXSBhcyBPZmZlcltdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3RhbE51bWJlck9mUGFnZXM6IGdldE9mZmVyc1Jlc3BvbnNlLmRhdGFbXCJ0b3RhbE51bWJlck9mUGFnZXNcIl0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsTnVtYmVyT2ZSZWNvcmRzOiBnZXRPZmZlcnNSZXNwb25zZS5kYXRhW1widG90YWxOdW1iZXJPZlJlY29yZHNcIl1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgSW52YWxpZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShnZXRPZmZlcnNSZXNwb25zZSl9IWAsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE9mZmVyc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IucmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGFuZCB0aGUgc2VydmVyIHJlc3BvbmRlZCB3aXRoIGEgc3RhdHVzIGNvZGVcbiAgICAgICAgICAgICAgICAgICAgICogdGhhdCBmYWxscyBvdXQgb2YgdGhlIHJhbmdlIG9mIDJ4eC5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBOb24gMnh4eCByZXNwb25zZSB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gT2xpdmUgQVBJLCB3aXRoIHN0YXR1cyAke2Vycm9yLnJlc3BvbnNlLnN0YXR1c30sIGFuZCByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGVycm9yLnJlc3BvbnNlLmRhdGEpfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gYW55IG90aGVyIHNwZWNpZmljIGVycm9ycyB0byBiZSBmaWx0ZXJlZCBiZWxvd1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE9mZmVyc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVycm9yLnJlcXVlc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGJ1dCBubyByZXNwb25zZSB3YXMgcmVjZWl2ZWRcbiAgICAgICAgICAgICAgICAgICAgICogYGVycm9yLnJlcXVlc3RgIGlzIGFuIGluc3RhbmNlIG9mIFhNTEh0dHBSZXF1ZXN0IGluIHRoZSBicm93c2VyIGFuZCBhbiBpbnN0YW5jZSBvZlxuICAgICAgICAgICAgICAgICAgICAgKiAgaHR0cC5DbGllbnRSZXF1ZXN0IGluIG5vZGUuanMuXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm8gcmVzcG9uc2UgcmVjZWl2ZWQgd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE9saXZlIEFQSSwgZm9yIHJlcXVlc3QgJHtlcnJvci5yZXF1ZXN0fWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBPZmZlcnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU29tZXRoaW5nIGhhcHBlbmVkIGluIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgdGhhdCB0cmlnZ2VyZWQgYW4gRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgc2V0dGluZyB1cCB0aGUgcmVxdWVzdCBmb3IgdGhlICR7ZW5kcG9pbnRJbmZvfSBPbGl2ZSBBUEksICR7KGVycm9yICYmIGVycm9yLm1lc3NhZ2UpICYmIGVycm9yLm1lc3NhZ2V9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE9mZmVyc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBpbml0aWF0aW5nIHRoZSBvZmZlcnMgcmV0cmlldmFsIHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJ9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBPZmZlcnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdXNlZCB0byByZXRyaWV2ZSBhIHVzZXIncyBjYXJkIGxpbmtpbmcgSUQsIGdpdmVuIHRoZWlyIE1vb25iZWFtXG4gICAgICogaW50ZXJuYWwgdW5pcXVlIElELlxuICAgICAqXG4gICAgICogQHBhcmFtIGdldFVzZXJDYXJkTGlua2luZ0lkSW5wdXQgdGhlIGlucHV0IG9iamVjdCBjb250YWluaW5nIHRoZSB1bmlxdWUgTW9vbmJlYW1cbiAgICAgKiBpbnRlcm5hbCBJRCwgdG8gYmUgdXNlZCB3aGlsZSByZXRyaWV2aW5nIHRoZSB1c2VyJ3MgY2FyZCBsaW5raW5nIElELlxuICAgICAqXG4gICAgICogQHJldHVybiBhIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgR2V0VXNlckNhcmRMaW5raW5nSWRSZXNwb25zZX0gcmVwcmVzZW50aW5nIHRoZSByZXNwb25zZVxuICAgICAqIG9iamVjdCwgY29udGFpbmluZyB0aGUgdXNlcidzIGNhcmQgbGlua2luZyBpZC5cbiAgICAgKi9cbiAgICBhc3luYyBnZXRVc2VyQ2FyZExpbmtpbmdJZChnZXRVc2VyQ2FyZExpbmtpbmdJZElucHV0OiBHZXRVc2VyQ2FyZExpbmtpbmdJZElucHV0KTogUHJvbWlzZTxHZXRVc2VyQ2FyZExpbmtpbmdJZFJlc3BvbnNlPiB7XG4gICAgICAgIC8vIGVhc2lseSBpZGVudGlmaWFibGUgQVBJIGVuZHBvaW50IGluZm9ybWF0aW9uXG4gICAgICAgIGNvbnN0IGVuZHBvaW50SW5mbyA9ICdHRVQgL21lbWJlcnM/ZXh0TWVtYmVySWQ9e2lkfSBPbGl2ZSBBUEknO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgQVBJIEtleSBhbmQgQmFzZSBVUkwsIG5lZWRlZCBpbiBvcmRlciB0byBtYWtlIHRoZSBHRVQgbWVtYmVyIGRldGFpbHMgY2FsbCB0aHJvdWdoIHRoZSBjbGllbnRcbiAgICAgICAgICAgIGNvbnN0IFtvbGl2ZUJhc2VVUkwsIG9saXZlUHVibGljS2V5LCBvbGl2ZVByaXZhdGVLZXldID0gYXdhaXQgc3VwZXIucmV0cmlldmVTZXJ2aWNlQ3JlZGVudGlhbHMoQ29uc3RhbnRzLkFXU1BhaXJDb25zdGFudHMuT0xJVkVfU0VDUkVUX05BTUUpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgd2Ugb2J0YWluZWQgYW55IGludmFsaWQgc2VjcmV0IHZhbHVlcyBmcm9tIHRoZSBjYWxsIGFib3ZlXG4gICAgICAgICAgICBpZiAob2xpdmVCYXNlVVJMID09PSBudWxsIHx8IG9saXZlQmFzZVVSTC5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBvbGl2ZVB1YmxpY0tleSA9PT0gbnVsbCB8fCBvbGl2ZVB1YmxpY0tleS5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBvbGl2ZVByaXZhdGVLZXkgPT09IG51bGwgfHwgb2xpdmVQcml2YXRlS2V5IS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBcIkludmFsaWQgU2VjcmV0cyBvYnRhaW5lZCBmb3IgT2xpdmUgQVBJIGNhbGwhXCI7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogR0VUIC9tZW1iZXJzP2V4dE1lbWJlcklkPXtpZH1cbiAgICAgICAgICAgICAqIEBsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm9saXZlbHRkLmNvbS9yZWZlcmVuY2UvbGlzdC1tZW1iZXJzXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogYnVpbGQgdGhlIE9saXZlIEFQSSByZXF1ZXN0IGJvZHkgdG8gYmUgcGFzc2VkIGluLCBhbmQgcGVyZm9ybSBhIEdFVCB0byBpdCB3aXRoIHRoZSBhcHByb3ByaWF0ZSBpbmZvcm1hdGlvblxuICAgICAgICAgICAgICogd2UgaW1wbHkgdGhhdCBpZiB0aGUgQVBJIGRvZXMgbm90IHJlc3BvbmQgaW4gMTUgc2Vjb25kcywgdGhlbiB3ZSBhdXRvbWF0aWNhbGx5IGNhdGNoIHRoYXQsIGFuZCByZXR1cm4gYW5cbiAgICAgICAgICAgICAqIGVycm9yIGZvciBhIGJldHRlciBjdXN0b21lciBleHBlcmllbmNlLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICByZXR1cm4gYXhpb3MuZ2V0KGAke29saXZlQmFzZVVSTH0vbWVtYmVycz9leHRNZW1iZXJJZD0ke2dldFVzZXJDYXJkTGlua2luZ0lkSW5wdXQuaWR9YCwge1xuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiT2xpdmUtS2V5XCI6IG9saXZlUHJpdmF0ZUtleVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGltZW91dDogMTUwMDAsIC8vIGluIG1pbGxpc2Vjb25kcyBoZXJlXG4gICAgICAgICAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZTogJ09saXZlIEFQSSB0aW1lZCBvdXQgYWZ0ZXIgMTUwMDBtcyEnXG4gICAgICAgICAgICB9KS50aGVuKG1lbWJlckRldGFpbHNSZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KG1lbWJlckRldGFpbHNSZXNwb25zZS5kYXRhKX1gKTtcblxuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIGlmIHdlIHJlYWNoZWQgdGhpcywgdGhlbiB3ZSBhc3N1bWUgdGhhdCBhIDJ4eCByZXNwb25zZSBjb2RlIHdhcyByZXR1cm5lZC5cbiAgICAgICAgICAgICAgICAgKiBjaGVjayB0aGUgY29udGVudHMgb2YgdGhlIHJlc3BvbnNlLCBhbmQgYWN0IGFwcHJvcHJpYXRlbHkuXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgaWYgKG1lbWJlckRldGFpbHNSZXNwb25zZS5kYXRhICE9PSB1bmRlZmluZWQgJiYgbWVtYmVyRGV0YWlsc1Jlc3BvbnNlLmRhdGEgIT09IG51bGwgJiZcbiAgICAgICAgICAgICAgICAgICAgbWVtYmVyRGV0YWlsc1Jlc3BvbnNlLmRhdGFbXCJ0b3RhbE51bWJlck9mUGFnZXNcIl0gIT09IHVuZGVmaW5lZCAmJiBtZW1iZXJEZXRhaWxzUmVzcG9uc2UuZGF0YVtcInRvdGFsTnVtYmVyT2ZQYWdlc1wiXSAhPT0gbnVsbCAmJiBtZW1iZXJEZXRhaWxzUmVzcG9uc2UuZGF0YVtcInRvdGFsTnVtYmVyT2ZQYWdlc1wiXSA9PT0gMSAmJlxuICAgICAgICAgICAgICAgICAgICBtZW1iZXJEZXRhaWxzUmVzcG9uc2UuZGF0YVtcInRvdGFsTnVtYmVyT2ZSZWNvcmRzXCJdICE9PSB1bmRlZmluZWQgJiYgbWVtYmVyRGV0YWlsc1Jlc3BvbnNlLmRhdGFbXCJ0b3RhbE51bWJlck9mUmVjb3Jkc1wiXSAhPT0gbnVsbCAmJiBtZW1iZXJEZXRhaWxzUmVzcG9uc2UuZGF0YVtcInRvdGFsTnVtYmVyT2ZSZWNvcmRzXCJdID09PSAxICYmXG4gICAgICAgICAgICAgICAgICAgIG1lbWJlckRldGFpbHNSZXNwb25zZS5kYXRhW1wiaXRlbXNcIl0gIT09IHVuZGVmaW5lZCAmJiBtZW1iZXJEZXRhaWxzUmVzcG9uc2UuZGF0YVtcIml0ZW1zXCJdICE9PSBudWxsICYmIG1lbWJlckRldGFpbHNSZXNwb25zZS5kYXRhW1wiaXRlbXNcIl0ubGVuZ3RoID09PSAxICYmXG4gICAgICAgICAgICAgICAgICAgIG1lbWJlckRldGFpbHNSZXNwb25zZS5kYXRhW1wiaXRlbXNcIl1bMF1bXCJpZFwiXSAhPT0gdW5kZWZpbmVkICYmIG1lbWJlckRldGFpbHNSZXNwb25zZS5kYXRhW1wiaXRlbXNcIl1bMF1bXCJpZFwiXSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIHVzZXIncyBjYXJkIGxpbmtpbmcgaWQgYWNjb3JkaW5nbHlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IG1lbWJlckRldGFpbHNSZXNwb25zZS5kYXRhW1wiaXRlbXNcIl1bMF1bXCJpZFwiXVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgdGhlcmUgYXJlIG5vIHVzZXJzIG1hdGNoaW5nIHRoYXQgSUQsIHRoZW4gd2UgcmV0dXJuIGEgZG8gbm90IGZvdW5kIGVycm9yLCBvdGhlcndpc2Ugd2UgcmV0dXJuIGEgdmFsaWRhdGlvbiBlcnJvclxuICAgICAgICAgICAgICAgICAgICBpZiAobWVtYmVyRGV0YWlsc1Jlc3BvbnNlLmRhdGFbXCJ0b3RhbE51bWJlck9mUGFnZXNcIl0gIT09IHVuZGVmaW5lZCAmJiBtZW1iZXJEZXRhaWxzUmVzcG9uc2UuZGF0YVtcInRvdGFsTnVtYmVyT2ZQYWdlc1wiXSAhPT0gbnVsbCAmJiBtZW1iZXJEZXRhaWxzUmVzcG9uc2UuZGF0YVtcInRvdGFsTnVtYmVyT2ZQYWdlc1wiXSA9PT0gMCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgbWVtYmVyRGV0YWlsc1Jlc3BvbnNlLmRhdGFbXCJ0b3RhbE51bWJlck9mUmVjb3Jkc1wiXSAhPT0gdW5kZWZpbmVkICYmIG1lbWJlckRldGFpbHNSZXNwb25zZS5kYXRhW1widG90YWxOdW1iZXJPZlJlY29yZHNcIl0gIT09IG51bGwgJiYgbWVtYmVyRGV0YWlsc1Jlc3BvbnNlLmRhdGFbXCJ0b3RhbE51bWJlck9mUmVjb3Jkc1wiXSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBDYXJkLUxpbmtpbmcgdXNlciBub3QgZm91bmQgZm9yIGlkICR7Z2V0VXNlckNhcmRMaW5raW5nSWRJbnB1dC5pZH1gLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuTm9uZU9yQWJzZW50XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogYEludmFsaWQgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gJHtlbmRwb2ludEluZm99IHJlc3BvbnNlIWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IucmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGFuZCB0aGUgc2VydmVyIHJlc3BvbmRlZCB3aXRoIGEgc3RhdHVzIGNvZGVcbiAgICAgICAgICAgICAgICAgICAgICogdGhhdCBmYWxscyBvdXQgb2YgdGhlIHJhbmdlIG9mIDJ4eC5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBOb24gMnh4eCByZXNwb25zZSB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gT2xpdmUgQVBJLCB3aXRoIHN0YXR1cyAke2Vycm9yLnJlc3BvbnNlLnN0YXR1c30sIGFuZCByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGVycm9yLnJlc3BvbnNlLmRhdGEpfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gYW55IG90aGVyIHNwZWNpZmljIGVycm9ycyB0byBiZSBmaWx0ZXJlZCBiZWxvd1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3IucmVxdWVzdCkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYnV0IG5vIHJlc3BvbnNlIHdhcyByZWNlaXZlZFxuICAgICAgICAgICAgICAgICAgICAgKiBgZXJyb3IucmVxdWVzdGAgaXMgYW4gaW5zdGFuY2Ugb2YgWE1MSHR0cFJlcXVlc3QgaW4gdGhlIGJyb3dzZXIgYW5kIGFuIGluc3RhbmNlIG9mXG4gICAgICAgICAgICAgICAgICAgICAqICBodHRwLkNsaWVudFJlcXVlc3QgaW4gbm9kZS5qcy5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBObyByZXNwb25zZSByZWNlaXZlZCB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gT2xpdmUgQVBJLCBmb3IgcmVxdWVzdCAke2Vycm9yLnJlcXVlc3R9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNvbWV0aGluZyBoYXBwZW5lZCBpbiBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IHRoYXQgdHJpZ2dlcmVkIGFuIEVycm9yXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgZm9yIHRoZSAke2VuZHBvaW50SW5mb30gT2xpdmUgQVBJLCAkeyhlcnJvciAmJiBlcnJvci5tZXNzYWdlKSAmJiBlcnJvci5tZXNzYWdlfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBpbml0aWF0aW5nIHRoZSBtZW1iZXIgZGV0YWlscyByZXRyaWV2YWwgdGhyb3VnaCAke2VuZHBvaW50SW5mb31gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfSAke2Vycn1gKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB1c2VkIGFzIGEgZGVsYXlcbiAqXG4gKiBAcGFyYW0gbXMgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyB0byBkZWxheSBieVxuICpcbiAqIEByZXR1cm5zIGEge0BsaW5rIFByb21pc2V9XG4gKi9cbmNvbnN0IGRlbGF5ID0gKG1zOiBudW1iZXIpOiBQcm9taXNlPGFueT4gPT4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSggcmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIG1zKSApO1xufVxuXG4iXX0=