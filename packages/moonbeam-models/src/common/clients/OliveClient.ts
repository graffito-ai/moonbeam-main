import {Card, CardLinkErrorType, CardLinkResponse, MemberResponse, RemoveCardResponse} from "../GraphqlExports";
import {BaseAPIClient} from "./BaseAPIClient";
import {Constants} from "../Constants";
import axios from "axios";

/**
 * Class used as the base/generic client for all Olive card linking related calls.
 */
export class OliveClient extends BaseAPIClient {
    /**
     *  The unique ID of a card linking user.
     *
     * @private
     */
    private readonly userId: string;

    /**
     * Generic constructor for the client.
     *
     * @param environment the AWS environment passed in from the Lambda resolver.
     * @param region the AWS region passed in from the Lambda resolver.
     * @param card card information provided by the customer.
     * @param userId unique user ID of a card linking user.
     */
    constructor(environment: string, region: string, userId: string) {
        super(region, environment);

        this.userId = userId;
    }

    /**
     * Function used to complete the linking of an individual's card on the platform.
     *
     * @param createdAt card linked object creation date
     * @param updatedAt card linked object update date
     * @param card card information to be used during the enrollment/linking process
     *
     * @return a {@link Promise} of {@link CardLinkResponse} representing the
     * card link response object obtained from the linking call
     */
    async link(createdAt: string, updatedAt: string, card: Card): Promise<CardLinkResponse> {
        // easily identifiable API endpoint information
        const endpointInfo = 'POST /members/signup Olive API';

        try {
            // retrieve the API Key and Base URL, needed in order to make the card linking call through the client
            const [oliveBaseURL, olivePublicKey, olivePrivateKey] = await super.retrieveServiceCredentials(Constants.AWSPairConstants.OLIVE_SECRET_NAME);

            // check to see if we obtained any invalid secret values from the call above
            if (oliveBaseURL === null || oliveBaseURL.length === 0 ||
                olivePublicKey === null || olivePublicKey.length === 0 ||
                olivePrivateKey === null || olivePrivateKey!.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Olive API call!";
                console.log(errorMessage);

                return {
                    errorMessage: errorMessage,
                    errorType: CardLinkErrorType.UnexpectedError
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
                    extMemberId: this.userId,
                    cashbackProgram: true,
                    roundingProgram: false
                },
                ...(card.additionalProgramID && card.additionalProgramID.length !== 0 && {
                    loyaltyProgramId: card.additionalProgramID
                })
            };
            console.log(`Olive API request Object: ${JSON.stringify(requestData)}`);
            return axios.post(`${oliveBaseURL}/members/signup`, requestData, {
                headers: {
                    "Content-Type": "application/json",
                    "Olive-Key": olivePrivateKey
                },
                timeout: 15000, // in milliseconds here
                timeoutErrorMessage: 'Olive API timed out after 15000ms!'
            }).then(cardLinkedResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(cardLinkedResponse.data)}`);

                /**
                 * if we reached this, then we assume that a 2xx response code was returned.
                 * check the contents of the response, and act appropriately.
                 */
                if (cardLinkedResponse.data
                    && cardLinkedResponse.data["member"] && cardLinkedResponse.data["member"]["id"]
                    && cardLinkedResponse.data["card"] && cardLinkedResponse.data["card"]["id"]
                    && cardLinkedResponse.data["card"] && cardLinkedResponse.data["card"]["last4Digits"]) {
                    // match the last 4 from the request. Always go by the /members/signup last 4 in case they don't match
                    if (cardLinkedResponse.data["card"]["last4Digits"] !== card.last4) {
                        card.last4 = cardLinkedResponse.data["card"]["last4Digits"];
                    }

                    return {
                        data: {
                            id: this.userId,
                            memberId: cardLinkedResponse.data["member"]["id"],
                            createdAt: createdAt,
                            updatedAt: updatedAt,
                            cards: [{
                                ...card,
                                id: cardLinkedResponse.data["card"]["id"]
                            }]
                        }
                    }
                } else {
                    return {
                        errorMessage: `Invalid response structure returned from ${endpointInfo} response!`,
                        errorType: CardLinkErrorType.ValidationError
                    }
                }
            }).catch(error => {
                if (error.response) {
                    /**
                     * The request was made and the server responded with a status code
                     *                   * that falls out of the range of 2xx.
                     */
                    const errorMessage = `Non 2xxx response while calling the ${endpointInfo} Olive API, with status ${error.response.status}, and response ${JSON.stringify(error.response.data)}`;
                    console.log(errorMessage);

                    // filter based on the type of incoming error
                    const incomingErrorResponse = error.response.data;
                    // unknown scheme
                    if (incomingErrorResponse && !incomingErrorResponse.success && incomingErrorResponse.messages.includes("Scheme unknown not supported.")) {
                        return {
                            errorMessage: `Unsupported card scheme.`,
                            errorType: CardLinkErrorType.InvalidCardScheme
                        }
                    }

                    // any other specific errors to be filtered below
                    return {
                        errorMessage: errorMessage,
                        errorType: CardLinkErrorType.UnexpectedError
                    };
                } else if (error.request) {
                    /**
                     * The request was made but no response was received
                     * `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                     *  http.ClientRequest in node.js.
                     */
                    const errorMessage = `No response received while calling the ${endpointInfo} Olive API, for request ${error.request}`;
                    console.log(errorMessage);

                    return {
                        errorMessage: errorMessage,
                        errorType: CardLinkErrorType.UnexpectedError
                    };
                } else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Olive API, ${error.message}`;
                    console.log(errorMessage);

                    return {
                        errorMessage: errorMessage,
                        errorType: CardLinkErrorType.UnexpectedError
                    };
                }
            });
        } catch (err) {
            const errorMessage = `Unexpected error while initiating card linking through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);

            return {
                errorMessage: errorMessage,
                errorType: CardLinkErrorType.UnexpectedError
            };
        }
    }

    /**
     * Function used to add a new card to an existing member.
     *
     * @param memberId member id, retrieved from Olive, which the card will be added to
     * @param createdAt card linked object creation date
     * @param updatedAt card linked object update date
     * @param card card information to be used in adding a new card to a member
     *
     * @return a {@link Promise} of {@link CardLinkResponse} representing the
     * card link response object obtained from the add card call
     */
    async addCard(memberId: string, createdAt: string, updatedAt: string, card: Card): Promise<CardLinkResponse> {
        // easily identifiable API endpoint information
        const endpointInfo = 'POST /cards Olive API';

        try {
            // retrieve the API Key and Base URL, needed in order to make the card linking call through the client
            const [oliveBaseURL, olivePublicKey, olivePrivateKey] = await super.retrieveServiceCredentials(Constants.AWSPairConstants.OLIVE_SECRET_NAME);

            // check to see if we obtained any invalid secret values from the call above
            if (oliveBaseURL === null || oliveBaseURL.length === 0 ||
                olivePublicKey === null || olivePublicKey.length === 0 ||
                olivePrivateKey === null || olivePrivateKey!.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Olive API call!";
                console.log(errorMessage);

                return {
                    errorMessage: errorMessage,
                    errorType: CardLinkErrorType.UnexpectedError
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
            return axios.post(`${oliveBaseURL}/cards`, requestData, {
                headers: {
                    "Content-Type": "application/json",
                    "Olive-Key": olivePrivateKey
                },
                timeout: 15000, // in milliseconds here
                timeoutErrorMessage: 'Olive API timed out after 15000ms!'
            }).then(addCardResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(addCardResponse.data)}`);

                /**
                 * if we reached this, then we assume that a 2xx response code was returned.
                 * check the contents of the response, and act appropriately.
                 */
                if (addCardResponse.data && addCardResponse.data["memberId"] && addCardResponse.data["id"] && addCardResponse.data["last4Digits"]) {
                    // match the last 4 from the request. Always go by the /cards last 4 in case they don't match
                    if (addCardResponse.data["last4Digits"] !== card.last4) {
                        card.last4 = addCardResponse.data["last4Digits"];
                    }

                    return {
                        data: {
                            id: this.userId,
                            memberId: addCardResponse.data["memberId"],
                            createdAt: createdAt,
                            updatedAt: updatedAt,
                            cards: [{
                                ...card,
                                id: addCardResponse.data["id"]
                            }]
                        }
                    }
                } else {
                    return {
                        errorMessage: `Invalid response structure returned from ${endpointInfo} response!`,
                        errorType: CardLinkErrorType.ValidationError
                    }
                }
            }).catch(error => {
                if (error.response) {
                    /**
                     * The request was made and the server responded with a status code
                     *                   * that falls out of the range of 2xx.
                     */
                    const errorMessage = `Non 2xxx response while calling the ${endpointInfo} Olive API, with status ${error.response.status}, and response ${JSON.stringify(error.response.data)}`;
                    console.log(errorMessage);

                    // filter based on the type of incoming error
                    const incomingErrorResponse = error.response.data;
                    // unknown scheme
                    if (incomingErrorResponse && !incomingErrorResponse.success && incomingErrorResponse.messages.includes("Scheme unknown not supported.")) {
                        return {
                            errorMessage: `Unsupported card scheme.`,
                            errorType: CardLinkErrorType.InvalidCardScheme
                        }
                    }

                    // any other specific errors to be filtered below
                    return {
                        errorMessage: errorMessage,
                        errorType: CardLinkErrorType.UnexpectedError
                    };
                } else if (error.request) {
                    /**
                     * The request was made but no response was received
                     * `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                     *  http.ClientRequest in node.js.
                     */
                    const errorMessage = `No response received while calling the ${endpointInfo} Olive API, for request ${error.request}`;
                    console.log(errorMessage);

                    return {
                        errorMessage: errorMessage,
                        errorType: CardLinkErrorType.UnexpectedError
                    };
                } else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Olive API, ${error.message}`;
                    console.log(errorMessage);

                    return {
                        errorMessage: errorMessage,
                        errorType: CardLinkErrorType.UnexpectedError
                    };
                }
            });
        } catch (err) {
            const errorMessage = `Unexpected error while initiating the card addition through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);

            return {
                errorMessage: errorMessage,
                errorType: CardLinkErrorType.UnexpectedError
            };
        }
    }

    /**
     * Function used to update a member's status, to either active or inactive.
     *
     * @param memberId member id, retrieved from Olive, which the status will be updated for
     * @param memberFlag flag to indicate what the status of the member, will be updated to
     * @param updatedAt card linked object update date
     *
     * @return a {@link Promise} of {@link MemberResponse} representing the
     * member's contents after the update is performed
     */
    async updateMemberStatus(memberId: string, memberFlag: boolean, updatedAt: string): Promise<MemberResponse> {
        // easily identifiable API endpoint information
        const endpointInfo = 'POST /members/{id} Olive API';

        try {
            // retrieve the API Key and Base URL, needed in order to make the card linking call through the client
            const [oliveBaseURL, olivePublicKey, olivePrivateKey] = await super.retrieveServiceCredentials(Constants.AWSPairConstants.OLIVE_SECRET_NAME);

            // check to see if we obtained any invalid secret values from the call above
            if (oliveBaseURL === null || oliveBaseURL.length === 0 ||
                olivePublicKey === null || olivePublicKey.length === 0 ||
                olivePrivateKey === null || olivePrivateKey!.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Olive API call!";
                console.log(errorMessage);

                return {
                    errorMessage: errorMessage,
                    errorType: CardLinkErrorType.UnexpectedError
                };
            }

            /**
             * POST /members/{id}
             * @link https://developer.oliveltd.com/reference/edit-member
             *
             * build the Olive API request body to be passed in, and perform a POST to it with the appropriate information
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            const requestData = {
                tcAcceptedDate: updatedAt,
                extMemberId: this.userId,
                // for this call we know for sure that at client initialization time, a member flag will be passed in
                isActive: memberFlag,
                cashbackProgram: true,
                roundingProgram: false
            };
            console.log(`Olive API request Object: ${JSON.stringify(requestData)}`);

            return axios.put(`${oliveBaseURL}/members/${memberId}`, requestData, {
                headers: {
                    "Content-Type": "application/json",
                    "Olive-Key": olivePrivateKey
                },
                timeout: 15000, // in milliseconds here
                timeoutErrorMessage: 'Olive API timed out after 15000ms!'
            }).then(updateMemberResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(updateMemberResponse.data)}`);

                /**
                 * if we reached this, then we assume that a 2xx response code was returned.
                 * check the contents of the response, and act appropriately.
                 */
                if (updateMemberResponse.data && updateMemberResponse.data["id"] && updateMemberResponse.data["extMemberId"] && (updateMemberResponse.data["isActive"] !== null || updateMemberResponse.data["isActive"] !== undefined)) {
                    return {
                        data: {
                            id: updateMemberResponse.data["extMemberId"],
                            memberId: updateMemberResponse.data["id"],
                            isActive: updateMemberResponse.data["isActive"]
                        }
                    }
                } else {
                    return {
                        errorMessage: `Invalid response structure returned from ${endpointInfo} response!`,
                        errorType: CardLinkErrorType.ValidationError
                    }
                }
            }).catch(error => {
                if (error.response) {
                    /**
                     * The request was made and the server responded with a status code
                     *                   * that falls out of the range of 2xx.
                     */
                    const errorMessage = `Non 2xxx response while calling the ${endpointInfo} Olive API, with status ${error.response.status}, and response ${JSON.stringify(error.response.data)}`;
                    console.log(errorMessage);

                    // any other specific errors to be filtered below
                    return {
                        errorMessage: errorMessage,
                        errorType: CardLinkErrorType.UnexpectedError
                    };
                } else if (error.request) {
                    /**
                     * The request was made but no response was received
                     * `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                     *  http.ClientRequest in node.js.
                     */
                    const errorMessage = `No response received while calling the ${endpointInfo} Olive API, for request ${error.request}`;
                    console.log(errorMessage);

                    return {
                        errorMessage: errorMessage,
                        errorType: CardLinkErrorType.UnexpectedError
                    };
                } else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Olive API, ${error.message}`;
                    console.log(errorMessage);

                    return {
                        errorMessage: errorMessage,
                        errorType: CardLinkErrorType.UnexpectedError
                    };
                }
            });
        } catch (err) {
            const errorMessage = `Unexpected error while initiating member update status through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);

            return {
                errorMessage: errorMessage,
                errorType: CardLinkErrorType.UnexpectedError
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
    async removeCard(cardId: string): Promise<RemoveCardResponse> {
        // easily identifiable API endpoint information
        const endpointInfo = 'POST /cards/{id}/deactivate Olive API';

        try {
            // retrieve the API Key and Base URL, needed in order to make the card linking call through the client
            const [oliveBaseURL, olivePublicKey, olivePrivateKey] = await super.retrieveServiceCredentials(Constants.AWSPairConstants.OLIVE_SECRET_NAME);

            // check to see if we obtained any invalid secret values from the call above
            if (oliveBaseURL === null || oliveBaseURL.length === 0 ||
                olivePublicKey === null || olivePublicKey.length === 0 ||
                olivePrivateKey === null || olivePrivateKey!.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Olive API call!";
                console.log(errorMessage);

                return {
                    errorMessage: errorMessage,
                    errorType: CardLinkErrorType.UnexpectedError
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
            // for this call we know for sure that at client initialization time, a card ID will be passed in
            return axios.post(`${oliveBaseURL}/cards/${cardId}/deactivate`, {}, {
                headers: {
                    "Content-Type": "application/json",
                    "Olive-Key": olivePrivateKey
                },
                timeout: 15000, // in milliseconds here
                timeoutErrorMessage: 'Olive API timed out after 15000ms!'
            }).then(removeCardResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(removeCardResponse.data)}`);

                /**
                 * if we reached this, then we assume that a 2xx response code was returned.
                 */
                if (removeCardResponse.data) {
                    return {
                        data: true
                    }
                } else {
                    return {
                        errorMessage: `Invalid response structure returned from ${endpointInfo} response!`,
                        errorType: CardLinkErrorType.ValidationError
                    }
                }
            }).catch(error => {
                if (error.response) {
                    /**
                     * The request was made and the server responded with a status code
                     *                   * that falls out of the range of 2xx.
                     */
                    const errorMessage = `Non 2xxx response while calling the ${endpointInfo} Olive API, with status ${error.response.status}, and response ${JSON.stringify(error.response.data)}`;
                    console.log(errorMessage);

                    // any other specific errors to be filtered below
                    return {
                        errorMessage: errorMessage,
                        errorType: CardLinkErrorType.UnexpectedError
                    };
                } else if (error.request) {
                    /**
                     * The request was made but no response was received
                     * `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                     *  http.ClientRequest in node.js.
                     */
                    const errorMessage = `No response received while calling the ${endpointInfo} Olive API, for request ${error.request}`;
                    console.log(errorMessage);

                    return {
                        errorMessage: errorMessage,
                        errorType: CardLinkErrorType.UnexpectedError
                    };
                } else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Olive API, ${error.message}`;
                    console.log(errorMessage);

                    return {
                        errorMessage: errorMessage,
                        errorType: CardLinkErrorType.UnexpectedError
                    };
                }
            });
        } catch (err) {
            const errorMessage = `Unexpected error while initiating the card removal through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);

            return {
                errorMessage: errorMessage,
                errorType: CardLinkErrorType.UnexpectedError
            };
        }
    }
}
