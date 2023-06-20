import {Card, CardLinkErrorType, CardLinkResponse, MemberResponse, RemoveCardResponse} from "../GraphqlExports";
import {BaseAPIClient} from "./BaseAPIClient";
import {Constants} from "../Constants";
import axios from "axios";

/**
 * Class used as the base/generic client for all Olive card linking related calls.
 */
export class OliveClient extends BaseAPIClient {
    /**
     * The card input, provided by the customer, used to finalize the linking
     * and/enrollment process of a card.
     *
     * @private
     */
    private readonly card: Card;

    /**
     *  The unique ID of a card linking user.
     *
     * @private
     */
    private readonly userId: string;

    /**
     * Member ID, obtained from Olive.
     *
     * @private
     */
    private readonly memberId: string | undefined;

    /**
     * Member flag to be passed in, signifying whether
     * a member is active or not.
     *
     * @private
     */
    private readonly memberFlag: boolean | undefined;

    /**
     * Card ID, obtained from Olive.
     *
     * @private
     */
    private readonly cardId: string | undefined;

    /**
     * Timestamps to be passed in at client initialization, to be
     * used in subsequent API calls.
     *
     * @private
     */
    private readonly createdAt: string;
    private readonly updatedAt: string;

    /**
     * Generic constructor for the client.
     *
     * @param environment the AWS environment passed in from the Lambda resolver.
     * @param region the AWS region passed in from the Lambda resolver.
     * @param card card information provided by the customer.
     * @param userId unique user ID of a card linking user.
     * @param createdAt creation date to be passed in.
     * @param updatedAt update date to be passed in.
     * @param memberId member id of user, obtained from Olive, optional, depending on the
     *                 type of API calls to be made via client.
     * @param memberFlag flag to indicate whether a member is active or not, optional, depending on the
     *                   type of API calls to be made via the client.
     * @param cardId card ID to be passed in, optional, depending on the type of API calls to be made via
     *               the client.
     */
    constructor(environment: string, region: string, card: Card, userId: string,
                createdAt: string, updatedAt: string, memberId?: string,
                memberFlag?: boolean, cardId?: string) {
        super(region, environment);

        this.card = card;
        this.userId = userId;
        this.memberId = memberId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.memberFlag = memberFlag;
        this.cardId = cardId;
    }

    /**
     * Function used to complete the linking of an individual's card on the platform.
     *
     * @return a {@link Promise} of {@link CardLinkResponse} representing the
     * military verification status obtained from the client verification call
     */
    async link(): Promise<CardLinkResponse> {
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
                cardToken: this.card.token,
                nickname: this.card.name,
                member: {
                    tcAcceptedDate: this.updatedAt,
                    referenceAppId: this.card.applicationID,
                    extMemberId: this.userId,
                    cashbackProgram: true,
                    roundingProgram: false
                },
                ...(this.card.additionalProgramID && this.card.additionalProgramID.length !== 0 && {
                    loyaltyProgramId: this.card.additionalProgramID
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
                /**
                 * if we reached this, then we assume that a 2xx response code was returned.
                 * check the contents of the response, and act appropriately.
                 */
                if (cardLinkedResponse.data
                    && cardLinkedResponse.data["member"] && cardLinkedResponse.data["member"]["id"]
                    && cardLinkedResponse.data["card"] && cardLinkedResponse.data["card"]["id"]
                    && cardLinkedResponse.data["card"] && cardLinkedResponse.data["card"]["last4Digits"]) {
                    // match the last 4 from the request. Always go by the /members/signup last 4 in case they don't match
                    if (cardLinkedResponse.data["card"]["last4Digits"] !== this.card.last4) {
                        this.card.last4 = cardLinkedResponse.data["card"]["last4Digits"];
                    }

                    return {
                        data: {
                            id: this.userId,
                            memberId: cardLinkedResponse.data["member"]["id"],
                            createdAt: this.createdAt,
                            updatedAt: this.updatedAt,
                            cards: [{
                                ...this.card,
                                id: cardLinkedResponse.data["card"]["id"]
                            }]
                        }
                    }
                } else {
                    return {
                        errorMessage: `Invalid response structure returned!`,
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
     * @return a {@link Promise} of {@link CardLinkResponse} representing the
     * card link response object obtained from the add card call
     */
    async addCard(): Promise<CardLinkResponse> {
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
                // for this call we know for sure that at client initialization time, a member ID will be passed in
                memberId: this.memberId!,
                nickname: this.card.name,
                cardToken: this.card.token
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
                /**
                 * if we reached this, then we assume that a 2xx response code was returned.
                 * check the contents of the response, and act appropriately.
                 */
                if (addCardResponse.data && addCardResponse.data["memberId"] && addCardResponse.data["id"] && addCardResponse.data["last4Digits"]) {
                    // match the last 4 from the request. Always go by the /cards last 4 in case they don't match
                    if (addCardResponse.data["last4Digits"] !== this.card.last4) {
                        this.card.last4 = addCardResponse.data["last4Digits"];
                    }

                    return {
                        data: {
                            id: this.userId,
                            memberId: addCardResponse.data["memberId"],
                            createdAt: this.createdAt,
                            updatedAt: this.updatedAt,
                            cards: [{
                                ...this.card,
                                id: addCardResponse.data["id"]
                            }]
                        }
                    }
                } else {
                    return {
                        errorMessage: `Invalid response structure returned!`,
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
     * @return a {@link Promise} of {@link MemberResponse} representing the
     * member's contents after the update is performed
     */
    async updateMemberStatus?(): Promise<MemberResponse> {
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
             * we imply that if the API does not respond in 10 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            const requestData = {
                tcAcceptedDate: this.updatedAt,
                extMemberId: this.userId,
                // for this call we know for sure that at client initialization time, a member flag will be passed in
                isActive: this.memberFlag!,
                cashbackProgram: true,
                roundingProgram: false
            };
            console.log(`Olive API request Object: ${JSON.stringify(requestData)}`);
            // for this call we know for sure that at client initialization time, a member ID will be passed in
            return axios.post(`${oliveBaseURL}/members/${this.memberId!}`, requestData, {
                headers: {
                    "Content-Type": "application/json",
                    "Olive-Key": olivePrivateKey
                },
                timeout: 10000, // in milliseconds here
                timeoutErrorMessage: 'Olive API timed out after 10000ms!'
            }).then(updateMemberResponse => {
                /**
                 * if we reached this, then we assume that a 2xx response code was returned.
                 * check the contents of the response, and act appropriately.
                 */
                if (updateMemberResponse.data && updateMemberResponse.data["Id"] && updateMemberResponse.data["externalMemberId"] && updateMemberResponse.data["IsActive"]) {
                    return {
                        data: {
                            id: updateMemberResponse.data["Id"],
                            memberId: updateMemberResponse.data["externalMemberId"],
                            isActive: updateMemberResponse.data["IsActive"]
                        }
                    }
                } else {
                    return {
                        errorMessage: `Invalid response structure returned!`,
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
     * @return a {@link Promise} of {@link RemoveCardResponse} representing the
     * card removal response.
     *
     * @protected
     */
    async removeCard?(): Promise<RemoveCardResponse> {
        // easily identifiable API endpoint information
        const endpointInfo = 'POST /cards/deactivate/{id} Olive API';

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
             * POST /cards/deactivate/{id}
             * @link https://developer.oliveltd.com/reference/delete-card
             *
             * build the Olive API request body to be passed in, and perform a POST to it with the appropriate information
             * we imply that if the API does not respond in 10 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            // for this call we know for sure that at client initialization time, a card ID will be passed in
            return axios.post(`${oliveBaseURL}/cards/deactivate/${this.cardId!}`, {}, {
                headers: {
                    "Content-Type": "application/json",
                    "Olive-Key": olivePrivateKey
                },
                timeout: 10000, // in milliseconds here
                timeoutErrorMessage: 'Olive API timed out after 10000ms!'
            }).then(removeCardResponse => {
                /**
                 * if we reached this, then we assume that a 2xx response code was returned.
                 */
                if (removeCardResponse.data) {
                    return {
                        data: true
                    }
                } else {
                    return {
                        errorMessage: `Invalid response structure returned!`,
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
