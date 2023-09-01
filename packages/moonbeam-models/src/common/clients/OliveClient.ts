import {
    Card,
    CardLinkErrorType,
    CardLinkingStatus,
    CardLinkResponse,
    GetOffersInput,
    MemberDetailsResponse,
    MemberResponse,
    Offer,
    OfferFilter,
    OffersErrorType,
    OffersResponse,
    RemoveCardResponse,
    Transaction,
    TransactionResponse,
    TransactionsErrorType,
    TransactionStatusDetailsResponse,
    UpdatedTransactionEvent,
    UpdatedTransactionEventResponse
} from "../GraphqlExports";
import {BaseAPIClient} from "./BaseAPIClient";
import {Constants} from "../Constants";
import axios from "axios";

/**
 * Class used as the base/generic client for all Olive card linking related calls.
 */
export class OliveClient extends BaseAPIClient {

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
    async link(userId: string, createdAt: string, updatedAt: string, card: Card): Promise<CardLinkResponse> {
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
                    extMemberId: userId,
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
                            status: CardLinkingStatus.Linked
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
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Olive API, ${(error && error.message) && error.message}`;
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
     * @param userId unique user ID of a card linking user.
     * @param memberId member id, retrieved from Olive, which the card will be added to
     * @param createdAt card linked object creation date
     * @param updatedAt card linked object update date
     * @param card card information to be used in adding a new card to a member
     *
     * @return a {@link Promise} of {@link CardLinkResponse} representing the
     * card link response object obtained from the add card call
     */
    async addCard(userId: string, memberId: string, createdAt: string, updatedAt: string, card: Card): Promise<CardLinkResponse> {
        // easily identifiable API endpoint information
        const endpointInfo = 'POST /cards Olive API';

        try {
            // retrieve the API Key and Base URL, needed in order to make the POST add card through the client
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
                            status: CardLinkingStatus.Linked
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
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Olive API, ${(error && error.message) && error.message}`;
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
     * @param userId unique user ID of a card linking user.
     * @param memberId member id, retrieved from Olive, which the status will be updated for
     * @param memberFlag flag to indicate what the status of the member, will be updated to
     * @param updatedAt card linked object update date
     *
     * @return a {@link Promise} of {@link MemberResponse} representing the
     * member's contents after the update is performed
     */
    async updateMemberStatus(userId: string, memberId: string, memberFlag: boolean, updatedAt: string): Promise<MemberResponse> {
        // easily identifiable API endpoint information
        const endpointInfo = 'POST /members/{id} Olive API';

        try {
            // retrieve the API Key and Base URL, needed in order to make the PUT member update call through the client
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
                if (updateMemberResponse.data !== undefined && updateMemberResponse.data["id"] !== undefined &&
                    updateMemberResponse.data["extMemberId"] !== undefined && (updateMemberResponse.data["isActive"] !== null || updateMemberResponse.data["isActive"] !== undefined)) {
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
                     *  that falls out of the range of 2xx.
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
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Olive API, ${(error && error.message) && error.message}`;
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
            // retrieve the API Key and Base URL, needed in order to make the POST card deactivate call through the client
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
            return axios.post(`${oliveBaseURL}/cards/${cardId}/deactivate`, undefined, {
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
                if (removeCardResponse.data === "") {
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
                     * that falls out of the range of 2xx.
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
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Olive API, ${(error && error.message) && error.message}`;
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
    async getBrandDetails(transaction: Transaction): Promise<TransactionResponse> {
        // easily identifiable API endpoint information
        const endpointInfo = 'GET /brands/{id} Olive API';

        try {
            // retrieve the API Key and Base URL, needed in order to make the GET brand details call through the client
            const [oliveBaseURL, olivePublicKey, olivePrivateKey] = await super.retrieveServiceCredentials(Constants.AWSPairConstants.OLIVE_SECRET_NAME);

            // check to see if we obtained any invalid secret values from the call above
            if (oliveBaseURL === null || oliveBaseURL.length === 0 ||
                olivePublicKey === null || olivePublicKey.length === 0 ||
                olivePrivateKey === null || olivePrivateKey!.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Olive API call!";
                console.log(errorMessage);

                return {
                    errorMessage: errorMessage,
                    errorType: TransactionsErrorType.UnexpectedError
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
            return axios.get(`${oliveBaseURL}/brands/${transaction.brandId}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Olive-Key": olivePrivateKey
                },
                timeout: 15000, // in milliseconds here
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
                    }
                } else {
                    return {
                        errorMessage: `Invalid response structure returned from ${endpointInfo} response!`,
                        errorType: TransactionsErrorType.ValidationError
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
                        errorType: TransactionsErrorType.UnexpectedError
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
                        errorType: TransactionsErrorType.UnexpectedError
                    };
                } else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Olive API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);

                    return {
                        errorMessage: errorMessage,
                        errorType: TransactionsErrorType.UnexpectedError
                    };
                }
            });
        } catch (err) {
            const errorMessage = `Unexpected error while initiating the brand details retrieval through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);

            return {
                errorMessage: errorMessage,
                errorType: TransactionsErrorType.UnexpectedError
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
    async getStoreDetails(transaction: Transaction): Promise<TransactionResponse> {
        // easily identifiable API endpoint information
        const endpointInfo = 'GET /stores/{id} Olive API';

        try {
            // retrieve the API Key and Base URL, needed in order to make the GET store details call through the client
            const [oliveBaseURL, olivePublicKey, olivePrivateKey] = await super.retrieveServiceCredentials(Constants.AWSPairConstants.OLIVE_SECRET_NAME);

            // check to see if we obtained any invalid secret values from the call above
            if (oliveBaseURL === null || oliveBaseURL.length === 0 ||
                olivePublicKey === null || olivePublicKey.length === 0 ||
                olivePrivateKey === null || olivePrivateKey!.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Olive API call!";
                console.log(errorMessage);

                return {
                    errorMessage: errorMessage,
                    errorType: TransactionsErrorType.UnexpectedError
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
            return axios.get(`${oliveBaseURL}/stores/${transaction.storeId}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Olive-Key": olivePrivateKey
                },
                timeout: 15000, // in milliseconds here
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
                    }
                } else {
                    return {
                        errorMessage: `Invalid response structure returned from ${endpointInfo} response!`,
                        errorType: TransactionsErrorType.ValidationError
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
                        errorType: TransactionsErrorType.UnexpectedError
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
                        errorType: TransactionsErrorType.UnexpectedError
                    };
                } else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Olive API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);

                    return {
                        errorMessage: errorMessage,
                        errorType: TransactionsErrorType.UnexpectedError
                    };
                }
            });
        } catch (err) {
            const errorMessage = `Unexpected error while initiating the store details retrieval through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);

            return {
                errorMessage: errorMessage,
                errorType: TransactionsErrorType.UnexpectedError
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
    async getMemberDetails(memberId: string): Promise<MemberDetailsResponse> {
        // easily identifiable API endpoint information
        const endpointInfo = 'GET /members/{id} Olive API';

        try {
            // retrieve the API Key and Base URL, needed in order to make the GET member details call through the client
            const [oliveBaseURL, olivePublicKey, olivePrivateKey] = await super.retrieveServiceCredentials(Constants.AWSPairConstants.OLIVE_SECRET_NAME);

            // check to see if we obtained any invalid secret values from the call above
            if (oliveBaseURL === null || oliveBaseURL.length === 0 ||
                olivePublicKey === null || olivePublicKey.length === 0 ||
                olivePrivateKey === null || olivePrivateKey!.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Olive API call!";
                console.log(errorMessage);

                return {
                    errorMessage: errorMessage,
                    errorType: TransactionsErrorType.UnexpectedError
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
            return axios.get(`${oliveBaseURL}/members/${memberId}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Olive-Key": olivePrivateKey
                },
                timeout: 15000, // in milliseconds here
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
                    }
                } else {
                    return {
                        errorMessage: `Invalid response structure returned from ${endpointInfo} response!`,
                        errorType: TransactionsErrorType.ValidationError
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
                        errorType: TransactionsErrorType.UnexpectedError
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
                        errorType: TransactionsErrorType.UnexpectedError
                    };
                } else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Olive API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);

                    return {
                        errorMessage: errorMessage,
                        errorType: TransactionsErrorType.UnexpectedError
                    };
                }
            });
        } catch (err) {
            const errorMessage = `Unexpected error while initiating the member details retrieval through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);

            return {
                errorMessage: errorMessage,
                errorType: TransactionsErrorType.UnexpectedError
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
    async getUpdatedTransactionDetails(updatedTransactionEvent: UpdatedTransactionEvent): Promise<UpdatedTransactionEventResponse> {
        // easily identifiable API endpoint information
        const endpointInfo = 'GET /transactions/{id} Olive API';

        try {
            // retrieve the API Key and Base URL, needed in order to make the GET transaction details call through the client
            const [oliveBaseURL, olivePublicKey, olivePrivateKey] = await super.retrieveServiceCredentials(Constants.AWSPairConstants.OLIVE_SECRET_NAME);

            // check to see if we obtained any invalid secret values from the call above
            if (oliveBaseURL === null || oliveBaseURL.length === 0 ||
                olivePublicKey === null || olivePublicKey.length === 0 ||
                olivePrivateKey === null || olivePrivateKey!.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Olive API call!";
                console.log(errorMessage);

                return {
                    errorMessage: errorMessage,
                    errorType: TransactionsErrorType.UnexpectedError
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
            return axios.get(`${oliveBaseURL}/transactions/${updatedTransactionEvent.data.transaction.id}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Olive-Key": olivePrivateKey
                },
                timeout: 15000, // in milliseconds here
                timeoutErrorMessage: 'Olive API timed out after 15000ms!'
            }).then(transactionDetailsResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(transactionDetailsResponse.data)}`);

                /**
                 * if we reached this, then we assume that a 2xx response code was returned.
                 * check the contents of the response, and act appropriately.
                 */
                if (transactionDetailsResponse.data !== undefined && transactionDetailsResponse.data["storeId"] && transactionDetailsResponse.data["brandId"] &&
                    transactionDetailsResponse.data["loyaltyProgramId"] && transactionDetailsResponse.data["roundingRuleId"] && transactionDetailsResponse.data["merchantCategoryCode"]) {
                    // set the transaction details for the updated transaction object, from the response, and convert any information accordingly
                    updatedTransactionEvent.data.transaction.storeId = transactionDetailsResponse.data["storeId"];
                    updatedTransactionEvent.data.transaction.brandId = transactionDetailsResponse.data["brandId"];
                    updatedTransactionEvent.data.transaction.loyaltyProgramId = transactionDetailsResponse.data["loyaltyProgramId"];
                    updatedTransactionEvent.data.transaction.roundingRuleId = transactionDetailsResponse.data["roundingRuleId"];
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
                    }
                } else {
                    return {
                        errorMessage: `Invalid response structure returned from ${endpointInfo} response!`,
                        errorType: TransactionsErrorType.ValidationError
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
                        errorType: TransactionsErrorType.UnexpectedError
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
                        errorType: TransactionsErrorType.UnexpectedError
                    };
                } else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Olive API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);

                    return {
                        errorMessage: errorMessage,
                        errorType: TransactionsErrorType.UnexpectedError
                    };
                }
            });
        } catch (err) {
            const errorMessage = `Unexpected error while initiating the updated transaction details retrieval through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);

            return {
                errorMessage: errorMessage,
                errorType: TransactionsErrorType.UnexpectedError
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
    async getTransactionDetails(transaction: Transaction): Promise<TransactionResponse> {
        // easily identifiable API endpoint information
        const endpointInfo = 'GET /transactions/{id} Olive API';

        try {
            // retrieve the API Key and Base URL, needed in order to make the GET transaction details call through the client
            const [oliveBaseURL, olivePublicKey, olivePrivateKey] = await super.retrieveServiceCredentials(Constants.AWSPairConstants.OLIVE_SECRET_NAME);

            // check to see if we obtained any invalid secret values from the call above
            if (oliveBaseURL === null || oliveBaseURL.length === 0 ||
                olivePublicKey === null || olivePublicKey.length === 0 ||
                olivePrivateKey === null || olivePrivateKey!.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Olive API call!";
                console.log(errorMessage);

                return {
                    errorMessage: errorMessage,
                    errorType: TransactionsErrorType.UnexpectedError
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
            return axios.get(`${oliveBaseURL}/transactions/${transaction.transactionId}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Olive-Key": olivePrivateKey
                },
                timeout: 15000, // in milliseconds here
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
                    }
                } else {
                    return {
                        errorMessage: `Invalid response structure returned from ${endpointInfo} response!`,
                        errorType: TransactionsErrorType.ValidationError
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
                        errorType: TransactionsErrorType.UnexpectedError
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
                        errorType: TransactionsErrorType.UnexpectedError
                    };
                } else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Olive API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);

                    return {
                        errorMessage: errorMessage,
                        errorType: TransactionsErrorType.UnexpectedError
                    };
                }
            });
        } catch (err) {
            const errorMessage = `Unexpected error while initiating the transaction details retrieval through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);

            return {
                errorMessage: errorMessage,
                errorType: TransactionsErrorType.UnexpectedError
            };
        }
    }

    /**
     * Function used to retrieve the transaction status details, given a transaction ID
     * (used for reimbursements purposes).
     *
     * @param transactionId the transaction id, to be passed in, in order to retrieve
     * the status details necessary for reimbursement-related purposes.
     *
     * @return a {@link Promise} of {@link TransactionStatusDetailsResponse} representing the
     * transaction status details object, populated with the transaction status details that we retrieved.
     */
    async getTransactionStatus(transactionId: string): Promise<TransactionStatusDetailsResponse> {
        // easily identifiable API endpoint information
        const endpointInfo = 'GET /transactions/{id} Olive API for status';

        try {
            // retrieve the API Key and Base URL, needed in order to make the GET transaction details call through the client
            const [oliveBaseURL, olivePublicKey, olivePrivateKey] = await super.retrieveServiceCredentials(Constants.AWSPairConstants.OLIVE_SECRET_NAME);

            // check to see if we obtained any invalid secret values from the call above
            if (oliveBaseURL === null || oliveBaseURL.length === 0 ||
                olivePublicKey === null || olivePublicKey.length === 0 ||
                olivePrivateKey === null || olivePrivateKey!.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Olive API call!";
                console.log(errorMessage);

                return {
                    errorMessage: errorMessage,
                    errorType: TransactionsErrorType.UnexpectedError
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
            return axios.get(`${oliveBaseURL}/transactions/${transactionId}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Olive-Key": olivePrivateKey
                },
                timeout: 15000, // in milliseconds here
                timeoutErrorMessage: 'Olive API timed out after 15000ms!'
            }).then(transactionDetailsResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(transactionDetailsResponse.data)}`);

                /**
                 * if we reached this, then we assume that a 2xx response code was returned.
                 * check the contents of the response, and act appropriately.
                 */
                if (transactionDetailsResponse.data !== undefined && transactionDetailsResponse.data["reward"] !== undefined && transactionDetailsResponse.data["reward"]["status"] !== undefined &&
                    transactionDetailsResponse.data["reward"]["cumulativePurchaseAmount"] !== undefined && transactionDetailsResponse.data["reward"]["amount"] !== undefined &&
                    transactionDetailsResponse.data["reward"]["owedToMemberAmount"] !== undefined && transactionDetailsResponse.data["reward"]["distributedToMemberAmount"] !== undefined) {
                    // set the transaction status for the transaction object, from the response, and convert any information accordingly
                    return {
                        data: {
                            creditedCashbackAmount: transactionDetailsResponse.data["reward"]["distributedToMemberAmount"],
                            oliveTransactionStatus: transactionDetailsResponse.data["reward"]["status"],
                            pendingCashbackAmount: transactionDetailsResponse.data["reward"]["owedToMemberAmount"],
                            rewardAmount: transactionDetailsResponse.data["reward"]["amount"],
                            totalAmount: transactionDetailsResponse.data["reward"]["cumulativePurchaseAmount"]
                        }
                    }
                } else {
                    return {
                        errorMessage: `Invalid response structure returned from ${endpointInfo} response!`,
                        errorType: TransactionsErrorType.ValidationError
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
                        errorType: TransactionsErrorType.UnexpectedError
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
                        errorType: TransactionsErrorType.UnexpectedError
                    };
                } else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Olive API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);

                    return {
                        errorMessage: errorMessage,
                        errorType: TransactionsErrorType.UnexpectedError
                    };
                }
            });
        } catch (err) {
            const errorMessage = `Unexpected error while initiating the transaction status retrieval through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);

            return {
                errorMessage: errorMessage,
                errorType: TransactionsErrorType.UnexpectedError
            };
        }
    }

    /**
     * Function used to get all the offers, given certain filters to be passed in.
     *
     * @param getOffersInput the offers input, containing the filtering information
     * used to retrieve all the applicable/matching offers.
     *
     * @returns a {@link OffersResponse} representing the matched offers' information.
     */
    async getOffers(getOffersInput: GetOffersInput): Promise<OffersResponse> {
        // easily identifiable API endpoint information
        const endpointInfo = 'GET /offers Olive API';

        try {
            // retrieve the API Key and Base URL, needed in order to make the GET offers call through the client
            const [oliveBaseURL, olivePublicKey, olivePrivateKey,
                moonbeamDefaultLoyalty, moonbeamFidelisDefaultLoyalty, moonbeamOnlineLoyalty] = await super.retrieveServiceCredentials(Constants.AWSPairConstants.OLIVE_SECRET_NAME, undefined,
                undefined, true);

            // check to see if we obtained any invalid secret values from the call above
            if (oliveBaseURL === null || oliveBaseURL.length === 0 ||
                olivePublicKey === null || olivePublicKey.length === 0 ||
                olivePrivateKey === null || olivePrivateKey!.length === 0 ||
                moonbeamDefaultLoyalty === null || moonbeamDefaultLoyalty!.length === 0 ||
                moonbeamFidelisDefaultLoyalty === null || moonbeamFidelisDefaultLoyalty!.length === 0 ||
                moonbeamOnlineLoyalty === null || moonbeamOnlineLoyalty!.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Olive API call!";
                console.log(errorMessage);

                return {
                    errorMessage: errorMessage,
                    errorType: OffersErrorType.UnexpectedError
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
            requestURL += getOffersInput.filterType === OfferFilter.Fidelis
                ? `?loyaltyProgramId=${moonbeamFidelisDefaultLoyalty}`
                : (
                    getOffersInput.filterType === OfferFilter.Nearby
                        ? `?loyaltyProgramId=${moonbeamDefaultLoyalty}`
                        : `?loyaltyProgramId=${moonbeamOnlineLoyalty}`
                );
            requestURL += `&availability=${getOffersInput.availability}&countryCode=${getOffersInput.countryCode}&redemptionType=${getOffersInput.redemptionType}&pageSize=${getOffersInput.pageSize}&pageNumber=${getOffersInput.pageNumber}`;
            getOffersInput.offerStates.forEach(state => {
                requestURL += `&offerStates=${state}`;
            })
            requestURL += getOffersInput.filterType === OfferFilter.Nearby
                ? `&radiusLatitude=${getOffersInput.radiusLatitude!}&radiusLongitude=${getOffersInput.radiusLongitude!}&radius=${getOffersInput.radius!}&radiusIncludeOnlineStores=${getOffersInput.radiusIncludeOnlineStores!}`
                : ``;
            requestURL += getOffersInput.brandName
                ? `&brandDba=${encodeURIComponent(getOffersInput.brandName)}`
                : ``;
            // log the request URL, since we are doing a lot of filtering, for sanity purposes
            console.log(`Request URL for Olive ${requestURL}`);
            return axios.get(requestURL, {
                headers: {
                    "Content-Type": "application/json",
                    "Olive-Key": olivePrivateKey
                },
                timeout: 15000, // in milliseconds here
                timeoutErrorMessage: 'Olive API timed out after 15000ms!'
            }).then(getOffersResponse => {
                // we don't want to log this in case of success responses, because the offer responses are very long (frugality)
                // console.log(`${endpointInfo} response ${JSON.stringify(getOffersResponse.data)}`);

                /**
                 * if we reached this, then we assume that a 2xx response code was returned.
                 * check the contents of the response, and act appropriately.
                 */
                if (getOffersResponse.data !== undefined && getOffersResponse.data["totalNumberOfPages"] !== undefined &&
                    getOffersResponse.data["totalNumberOfRecords"] !== undefined && getOffersResponse.data["items"] !== undefined) {
                    // return the array of offer items accordingly
                    return {
                        data: {
                            offers: getOffersResponse.data["items"] as Offer[],
                            totalNumberOfPages: getOffersResponse.data["totalNumberOfPages"],
                            totalNumberOfRecords: getOffersResponse.data["totalNumberOfRecords"]
                        }
                    }
                } else {
                    return {
                        errorMessage: `Invalid response structure returned from ${endpointInfo} response ${JSON.stringify(getOffersResponse)}!`,
                        errorType: OffersErrorType.ValidationError
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
                        errorType: OffersErrorType.UnexpectedError
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
                        errorType: OffersErrorType.UnexpectedError
                    };
                } else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Olive API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);

                    return {
                        errorMessage: errorMessage,
                        errorType: OffersErrorType.UnexpectedError
                    };
                }
            });
        } catch (err) {
            const errorMessage = `Unexpected error while initiating the offers retrieval through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);

            return {
                errorMessage: errorMessage,
                errorType: OffersErrorType.UnexpectedError
            };
        }
    }
}
