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
             * we imply that if the API does not respond in 2 seconds, that we automatically catch that, and return a an
             * error for a better customer experience.
             */
            const verificationResponse = await axios.post(`${oliveBaseURL}/members/signup`,
                {
                    cardToken: this.card.token,
                    nickname: this.card.name,
                    member: {
                        tcAcceptedDate: this.card.createdAt,
                        referenceAppId: this.card.id,
                        extMemberId: this.userId,
                        cashbackProgram: true,
                        roundingProgram: false
                    },
                    ...(this.card.additionalProgramID && this.card.additionalProgramID.length !== 0 && {
                        loyaltyProgramId: this.card.additionalProgramID
                    })
                }, {
                headers: {
                    "Content-Type": "application/json",
                    "Olive-Key": olivePrivateKey
                },
                timeout: 2000, // in milliseconds here
                timeoutErrorMessage: 'Lighthouse API timed out after 2000ms!'
            });

            // check the status of the response, and act appropriately
            if (verificationResponse.status === 200) {
                // return the card linking information (which includes the card info and the id of the user)
                return {
                    data: {
                        id: this.userId,
                        cards: [this.card]
                    }
                }
            }

            // return an error for status codes that are not 200, in case the error block doesn't catch it
            const errorMessage = `Unexpected error while calling ${endpointInfo}, with status ${verificationResponse.status}, and response ${verificationResponse.data}`;
            console.log(errorMessage);

            return {
                errorMessage: errorMessage,
                errorType: CardLinkErrorType.UnexpectedError
            }
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
