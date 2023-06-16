import {Card, CardLinkErrorType, CardLinkResponse} from "../GraphqlExports";
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
     * Generic constructor for the client.
     *
     * @param card card information provided by the customer.
     * @param userId unique user ID of a card linking user.
     * @param region the AWS region passed in from the Lambda resolver.
     * @param environment the AWS environment passed in from the Lambda resolver.
     */
    constructor(card: Card, userId: string, environment: string, region: string) {
        super(region, environment);

        this.card = card;
        this.userId = userId;
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
                    tcAcceptedDate: this.card.createdAt,
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
                timeoutErrorMessage: 'Olive API timed out after 4000ms!'
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
                            memberId:  cardLinkedResponse.data["member"]["id"],
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
                    const errorMessage = `Non 2xxx response while calling the Olive API, with status ${error.response.status}, and response ${JSON.stringify(error.response.data)}`;
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
                    const errorMessage = `No response received while calling the Olive API, for request ${error.request}`;
                    console.log(errorMessage);

                    return {
                        errorMessage: errorMessage,
                        errorType: CardLinkErrorType.UnexpectedError
                    };
                } else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the Olive API, ${error.message}`;
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
}
