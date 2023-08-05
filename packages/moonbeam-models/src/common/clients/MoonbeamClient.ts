import {BaseAPIClient} from "./BaseAPIClient";
import {Constants} from "../Constants";
import {
    CardLinkErrorType,
    CreateReimbursementInput,
    CreateTransactionInput,
    EligibleLinkedUser,
    EligibleLinkedUsersResponse,
    GetTransactionByStatusInput,
    MoonbeamTransaction,
    MoonbeamTransactionByStatus,
    MoonbeamTransactionResponse,
    MoonbeamTransactionsByStatusResponse,
    MoonbeamUpdatedTransaction,
    MoonbeamUpdatedTransactionResponse,
    Reimbursement,
    ReimbursementResponse,
    ReimbursementsErrorType,
    TransactionsErrorType,
    UpdateReimbursementInput,
    UpdateTransactionInput
} from "../GraphqlExports";
import axios from "axios";
import {
    createReimbursement,
    createTransaction,
    updateReimbursement,
    updateTransaction
} from "../../graphql/mutations/Mutations";
import {getEligibleLinkedUsers, getTransactionByStatus} from "../../graphql/queries/Queries";
import {APIGatewayProxyResult} from "aws-lambda/trigger/api-gateway-proxy";

/**
 * Class used as the base/generic client for all Moonbeam internal AppSync
 * and/or API Gateway APIs.
 */
export class MoonbeamClient extends BaseAPIClient {

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
     * Function used to send a new reimbursement acknowledgment, for an eligible user with
     * a linked card, so we can kick-start the reimbursement process through the reimbursement
     * producer
     *
     * @param eligibleLinkedUser eligible linked user object to be passed in
     *
     * @return a {@link Promise} of {@link APIGatewayProxyResult} representing the API Gateway result
     * sent by the reimbursement producer Lambda, to validate whether the reimbursement process was
     * kick-started or not
     */
    async reimbursementsAcknowledgment(eligibleLinkedUser: EligibleLinkedUser): Promise<APIGatewayProxyResult> {
        // easily identifiable API endpoint information
        const endpointInfo = 'POST /reimbursementsAcknowledgment Moonbeam REST API';

        try {
            // retrieve the API Key and Base URL, needed in order to make the reimbursement acknowledgment call through the client
            const [moonbeamBaseURL, moonbeamPrivateKey] = await super.retrieveServiceCredentials(Constants.AWSPairConstants.MOONBEAM_INTERNAL_SECRET_NAME, true);

            // check to see if we obtained any invalid secret values from the call above
            if (moonbeamBaseURL === null || moonbeamBaseURL.length === 0 ||
                moonbeamPrivateKey === null || moonbeamPrivateKey.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Moonbeam REST API call!";
                console.log(errorMessage);

                return {
                    statusCode: 500,
                    body: JSON.stringify({
                        data: null,
                        errorType: ReimbursementsErrorType.UnexpectedError,
                        errorMessage: errorMessage
                    })
                };
            }

            /**
             * POST /reimbursementsAcknowledgment
             *
             * build the internal Moonbeam API request body to be passed in, and perform a POST to it with the appropriate information
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            console.log(`Moonbeam REST API request Object: ${JSON.stringify(eligibleLinkedUser)}`);
            return axios.post(`${moonbeamBaseURL}/reimbursementsAcknowledgment`, JSON.stringify(eligibleLinkedUser), {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": moonbeamPrivateKey
                },
                timeout: 15000, // in milliseconds here
                timeoutErrorMessage: 'Moonbeam REST API timed out after 15000ms!'
            }).then(reimbursementsAcknowledgmentResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(reimbursementsAcknowledgmentResponse.data)}`);

                // retrieve the data block from the response
                const responseData = (reimbursementsAcknowledgmentResponse && reimbursementsAcknowledgmentResponse.data) ? reimbursementsAcknowledgmentResponse.data : null;

                // check if there are any errors in the returned response
                if (responseData && responseData.data !== null && !responseData.errorMessage) {
                    // returned the successfully acknowledged reimbursement
                    return {
                        statusCode: reimbursementsAcknowledgmentResponse.status,
                        body: responseData
                    }
                } else {
                    return responseData ?
                        // return the error message and type, from the original REST API call
                        {
                            statusCode: reimbursementsAcknowledgmentResponse.status,
                            body: responseData
                        } :
                        // return the error response indicating an invalid structure returned
                        {
                            statusCode: 500,
                            body: JSON.stringify({
                                data: null,
                                errorMessage: `Invalid response structure returned from ${endpointInfo} response!`,
                                errorType: ReimbursementsErrorType.ValidationError
                            })
                        }
                }
            }).catch(error => {
                if (error.response) {
                    /**
                     * The request was made and the server responded with a status code
                     * that falls out of the range of 2xx.
                     */
                    const errorMessage = `Non 2xxx response while calling the ${endpointInfo} Moonbeam REST API, with status ${error.response.status}, and response ${JSON.stringify(error.response.data)}`;
                    console.log(errorMessage);

                    // any other specific errors to be filtered below
                    return {
                        statusCode: error.response.status,
                        body: JSON.stringify({
                            data: null,
                            errorType: error.response.data.errorType,
                            errorMessage: error.response.data.errorMessage
                        })
                    };
                } else if (error.request) {
                    /**
                     * The request was made but no response was received
                     * `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                     *  http.ClientRequest in node.js.
                     */
                    const errorMessage = `No response received while calling the ${endpointInfo} Moonbeam API, for request ${error.request}`;
                    console.log(errorMessage);

                    return {
                        statusCode: 500,
                        body: JSON.stringify({
                            data: null,
                            errorType: ReimbursementsErrorType.UnexpectedError,
                            errorMessage: errorMessage
                        })
                    };
                } else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Moonbeam API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);

                    return {
                        statusCode: 500,
                        body: JSON.stringify({
                            data: null,
                            errorType: ReimbursementsErrorType.UnexpectedError,
                            errorMessage: errorMessage
                        })
                    };
                }
            });
        } catch (err) {
            const errorMessage = `Unexpected error while posting the reimbursement acknowledgment object through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);

            return {
                statusCode: 500,
                body: JSON.stringify({
                    data: null,
                    errorType: ReimbursementsErrorType.UnexpectedError,
                    errorMessage: errorMessage
                })
            };
        }
    }

    /**
     * Function used to retrieve the list of eligible linked users, to be user during the reimbursements
     * process.
     *
     * @return a {link Promise} of {@link EligibleLinkedUsersResponse} representing the list of eligible
     * users
     */
    async getEligibleLinkedUsers(): Promise<EligibleLinkedUsersResponse> {
        // easily identifiable API endpoint information
        const endpointInfo = 'getEligibleLinkedUsers Query Moonbeam GraphQL API';

        try {
            // retrieve the API Key and Base URL, needed in order to make the eligible user retrieval call through the client
            const [moonbeamBaseURL, moonbeamPrivateKey] = await super.retrieveServiceCredentials(Constants.AWSPairConstants.MOONBEAM_INTERNAL_SECRET_NAME);

            // check to see if we obtained any invalid secret values from the call above
            if (moonbeamBaseURL === null || moonbeamBaseURL.length === 0 ||
                moonbeamPrivateKey === null || moonbeamPrivateKey.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Moonbeam API call!";
                console.log(errorMessage);

                return {
                    errorMessage: errorMessage,
                    errorType: CardLinkErrorType.UnexpectedError
                };
            }

            /**
             * getEligibleLinkedUsers Query
             *
             * build the Moonbeam AppSync API GraphQL query, and perform a POST to it,
             * with the appropriate information.
             *
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            return axios.post(`${moonbeamBaseURL}`, {
                query: getEligibleLinkedUsers
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": moonbeamPrivateKey
                },
                timeout: 15000, // in milliseconds here
                timeoutErrorMessage: 'Moonbeam API timed out after 15000ms!'
            }).then(getEligibleLinkedUsersResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(getEligibleLinkedUsersResponse.data)}`);

                // retrieve the data block from the response
                const responseData = (getEligibleLinkedUsersResponse && getEligibleLinkedUsersResponse.data) ? getEligibleLinkedUsersResponse.data.data : null;

                // check if there are any errors in the returned response
                if (responseData && responseData.getEligibleLinkedUsers.errorMessage === null) {
                    // returned the successfully retrieved eligible linked users
                    return {
                        data: responseData.getEligibleLinkedUsers.data as EligibleLinkedUser[]
                    }
                } else {
                    return responseData ?
                        // return the error message and type, from the original AppSync call
                        {
                            errorMessage: responseData.getEligibleLinkedUsers.errorMessage,
                            errorType: responseData.getEligibleLinkedUsers.errorType
                        } :
                        // return the error response indicating an invalid structure returned
                        {
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
                    const errorMessage = `Non 2xxx response while calling the ${endpointInfo} Moonbeam API, with status ${error.response.status}, and response ${JSON.stringify(error.response.data)}`;
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
                    const errorMessage = `No response received while calling the ${endpointInfo} Moonbeam API, for request ${error.request}`;
                    console.log(errorMessage);

                    return {
                        errorMessage: errorMessage,
                        errorType: CardLinkErrorType.UnexpectedError
                    };
                } else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Moonbeam API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);

                    return {
                        errorMessage: errorMessage,
                        errorType: CardLinkErrorType.UnexpectedError
                    };
                }
            });
        } catch (err) {
            const errorMessage = `Unexpected error while retrieving eligible linked users through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);

            return {
                errorMessage: errorMessage,
                errorType: CardLinkErrorType.UnexpectedError
            };
        }
    }

    /**
     * Function used to create a new transaction internally, from an incoming transaction
     * obtained from the SQS message/event
     *
     * @param transaction transaction passed in from the SQS message/event
     *
     * @return a {link Promise} of {@link MoonbeamTransactionResponse} representing the transaction
     * details that were stored in Dynamo DB
     */
    async createTransaction(transaction: MoonbeamTransaction): Promise<MoonbeamTransactionResponse> {
        // easily identifiable API endpoint information
        const endpointInfo = 'createTransaction Mutation Moonbeam GraphQL API';

        try {
            // retrieve the API Key and Base URL, needed in order to make the card linking call through the client
            const [moonbeamBaseURL, moonbeamPrivateKey] = await super.retrieveServiceCredentials(Constants.AWSPairConstants.MOONBEAM_INTERNAL_SECRET_NAME);

            // check to see if we obtained any invalid secret values from the call above
            if (moonbeamBaseURL === null || moonbeamBaseURL.length === 0 ||
                moonbeamPrivateKey === null || moonbeamPrivateKey.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Moonbeam API call!";
                console.log(errorMessage);

                return {
                    errorMessage: errorMessage,
                    errorType: TransactionsErrorType.UnexpectedError
                };
            }

            /**
             * createTransaction Mutation
             *
             * build the Moonbeam AppSync API GraphQL mutation body to be passed in with its variables, and perform a POST to it,
             * with the appropriate information
             *
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            console.log(`Moonbeam AppSync API request Object: ${JSON.stringify(transaction as CreateTransactionInput)}`);
            return axios.post(`${moonbeamBaseURL}`, {
                query: createTransaction,
                variables: {
                    createTransactionInput: transaction as CreateTransactionInput
                }
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": moonbeamPrivateKey
                },
                timeout: 15000, // in milliseconds here
                timeoutErrorMessage: 'Moonbeam API timed out after 15000ms!'
            }).then(createTransactionResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(createTransactionResponse.data)}`);

                // retrieve the data block from the response
                const responseData = (createTransactionResponse && createTransactionResponse.data) ? createTransactionResponse.data.data : null;

                // check if there are any errors in the returned response
                if (responseData && responseData.createTransaction.errorMessage === null) {
                    // returned the successfully stored transaction, as well as its ID in the parent object, for subscription purposes
                    return {
                        id: transaction.id,
                        data: transaction
                    }
                } else {
                    return responseData ?
                        // return the error message and type, from the original AppSync call
                        {
                            errorMessage: responseData.createTransaction.errorMessage,
                            errorType: responseData.createTransaction.errorType
                        } :
                        // return the error response indicating an invalid structure returned
                        {
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
                    const errorMessage = `Non 2xxx response while calling the ${endpointInfo} Moonbeam API, with status ${error.response.status}, and response ${JSON.stringify(error.response.data)}`;
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
                    const errorMessage = `No response received while calling the ${endpointInfo} Moonbeam API, for request ${error.request}`;
                    console.log(errorMessage);

                    return {
                        errorMessage: errorMessage,
                        errorType: TransactionsErrorType.UnexpectedError
                    };
                } else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Moonbeam API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);

                    return {
                        errorMessage: errorMessage,
                        errorType: TransactionsErrorType.UnexpectedError
                    };
                }
            });
        } catch (err) {
            const errorMessage = `Unexpected error while creating a new transaction through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);

            return {
                errorMessage: errorMessage,
                errorType: TransactionsErrorType.UnexpectedError
            };
        }
    }

    /**
     * Function used to get all transactions, for a particular user, filtered
     * by their status.
     *
     * @param getTransactionByStatusInput the transaction by status input object ot be passed in,
     * containing all the necessary filtering for retrieving the transactions.
     *
     * @returns a {@link MoonbeamTransactionsByStatusResponse} representing the transactional data,
     * filtered by status response
     */
    async getTransactionByStatus(getTransactionByStatusInput: GetTransactionByStatusInput): Promise<MoonbeamTransactionsByStatusResponse> {
        // easily identifiable API endpoint information
        const endpointInfo = 'getTransactionByStatus Query Moonbeam GraphQL API';

        try {
            // retrieve the API Key and Base URL, needed in order to make the transaction by status retrieval call through the client
            const [moonbeamBaseURL, moonbeamPrivateKey] = await super.retrieveServiceCredentials(Constants.AWSPairConstants.MOONBEAM_INTERNAL_SECRET_NAME);

            // check to see if we obtained any invalid secret values from the call above
            if (moonbeamBaseURL === null || moonbeamBaseURL.length === 0 ||
                moonbeamPrivateKey === null || moonbeamPrivateKey.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Moonbeam API call!";
                console.log(errorMessage);

                return {
                    errorMessage: errorMessage,
                    errorType: TransactionsErrorType.UnexpectedError
                };
            }

            /**
             * getTransactionByStatus Query
             *
             * build the Moonbeam AppSync API GraphQL query, and perform a POST to it,
             * with the appropriate information.
             *
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            return axios.post(`${moonbeamBaseURL}`, {
                query: getTransactionByStatus,
                variables: {
                    getTransactionByStatusInput: getTransactionByStatusInput
                }
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": moonbeamPrivateKey
                },
                timeout: 15000, // in milliseconds here
                timeoutErrorMessage: 'Moonbeam API timed out after 15000ms!'
            }).then(getTransactionByStatusResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(getTransactionByStatusResponse.data)}`);

                // retrieve the data block from the response
                const responseData = (getTransactionByStatusResponse && getTransactionByStatusResponse.data) ? getTransactionByStatusResponse.data.data : null;

                // check if there are any errors in the returned response
                if (responseData && responseData.getTransactionByStatus.errorMessage === null) {
                    // returned the successfully retrieved transactions for a given user, filtered by their status
                    return {
                        data: responseData.getTransactionByStatus.data as MoonbeamTransactionByStatus[]
                    }
                } else {
                    return responseData ?
                        // return the error message and type, from the original AppSync call
                        {
                            errorMessage: responseData.getTransactionByStatus.errorMessage,
                            errorType: responseData.getTransactionByStatus.errorType
                        } :
                        // return the error response indicating an invalid structure returned
                        {
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
                    const errorMessage = `Non 2xxx response while calling the ${endpointInfo} Moonbeam API, with status ${error.response.status}, and response ${JSON.stringify(error.response.data)}`;
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
                    const errorMessage = `No response received while calling the ${endpointInfo} Moonbeam API, for request ${error.request}`;
                    console.log(errorMessage);

                    return {
                        errorMessage: errorMessage,
                        errorType: TransactionsErrorType.UnexpectedError
                    };
                } else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Moonbeam API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);

                    return {
                        errorMessage: errorMessage,
                        errorType: TransactionsErrorType.UnexpectedError
                    };
                }
            });
        } catch (err) {
            const errorMessage = `Unexpected error while retrieving transactions for a particular user, filtered by their status through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);

            return {
                errorMessage: errorMessage,
                errorType: TransactionsErrorType.UnexpectedError
            };
        }
    }

    /**
     * Function used to update an existing transaction's details.
     *
     * @param updateTransactionInput the transaction details to be passed in, in order to update
     * an existing transaction
     *
     * @returns a {@link MoonbeamUpdatedTransactionResponse} representing the update transaction's
     * data
     */
    async updateTransaction(updateTransactionInput: UpdateTransactionInput): Promise<MoonbeamUpdatedTransactionResponse> {
        // easily identifiable API endpoint information
        const endpointInfo = 'updateTransaction Mutation Moonbeam GraphQL API';

        try {
            // retrieve the API Key and Base URL, needed in order to make the transaction updated call through the client
            const [moonbeamBaseURL, moonbeamPrivateKey] = await super.retrieveServiceCredentials(Constants.AWSPairConstants.MOONBEAM_INTERNAL_SECRET_NAME);

            // check to see if we obtained any invalid secret values from the call above
            if (moonbeamBaseURL === null || moonbeamBaseURL.length === 0 ||
                moonbeamPrivateKey === null || moonbeamPrivateKey.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Moonbeam API call!";
                console.log(errorMessage);

                return {
                    errorMessage: errorMessage,
                    errorType: TransactionsErrorType.UnexpectedError
                };
            }

            /**
             * updateTransaction Query
             *
             * build the Moonbeam AppSync API GraphQL query, and perform a POST to it,
             * with the appropriate information.
             *
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            return axios.post(`${moonbeamBaseURL}`, {
                query: updateTransaction,
                variables: {
                    updateTransactionInput: updateTransactionInput
                }
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": moonbeamPrivateKey
                },
                timeout: 15000, // in milliseconds here
                timeoutErrorMessage: 'Moonbeam API timed out after 15000ms!'
            }).then(updateTransactionResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(updateTransactionResponse.data)}`);

                // retrieve the data block from the response
                const responseData = (updateTransactionResponse && updateTransactionResponse.data) ? updateTransactionResponse.data.data : null;

                // check if there are any errors in the returned response
                if (responseData && responseData.updateTransaction.errorMessage === null) {
                    // returned the successfully updated transactional information
                    return {
                        data: responseData.updateTransaction.data as MoonbeamUpdatedTransaction
                    }
                } else {
                    return responseData ?
                        // return the error message and type, from the original AppSync call
                        {
                            errorMessage: responseData.updateTransaction.errorMessage,
                            errorType: responseData.updateTransaction.errorType
                        } :
                        // return the error response indicating an invalid structure returned
                        {
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
                    const errorMessage = `Non 2xxx response while calling the ${endpointInfo} Moonbeam API, with status ${error.response.status}, and response ${JSON.stringify(error.response.data)}`;
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
                    const errorMessage = `No response received while calling the ${endpointInfo} Moonbeam API, for request ${error.request}`;
                    console.log(errorMessage);

                    return {
                        errorMessage: errorMessage,
                        errorType: TransactionsErrorType.UnexpectedError
                    };
                } else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Moonbeam API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);

                    return {
                        errorMessage: errorMessage,
                        errorType: TransactionsErrorType.UnexpectedError
                    };
                }
            });
        } catch (err) {
            const errorMessage = `Unexpected error while updating transactional data, through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);

            return {
                errorMessage: errorMessage,
                errorType: TransactionsErrorType.UnexpectedError
            };
        }
    }

    /**
     * Function used to create a reimbursement internally, from an incoming trigger obtained from the
     * reimbursements trigger Lambda.
     *
     * @param createReimbursementInput the reimbursement input passed in from the cron Lambda trigger
     *
     * @returns a {@link ReimbursementResponse} representing the reimbursement details that were stored
     * in Dynamo DB
     */
    async createReimbursement(createReimbursementInput: CreateReimbursementInput): Promise<ReimbursementResponse> {
        // easily identifiable API endpoint information
        const endpointInfo = 'createReimbursement Mutation Moonbeam GraphQL API';

        try {
            // retrieve the API Key and Base URL, needed in order to make a reimbursement creation call through the client
            const [moonbeamBaseURL, moonbeamPrivateKey] = await super.retrieveServiceCredentials(Constants.AWSPairConstants.MOONBEAM_INTERNAL_SECRET_NAME);

            // check to see if we obtained any invalid secret values from the call above
            if (moonbeamBaseURL === null || moonbeamBaseURL.length === 0 ||
                moonbeamPrivateKey === null || moonbeamPrivateKey.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Moonbeam API call!";
                console.log(errorMessage);

                return {
                    errorMessage: errorMessage,
                    errorType: ReimbursementsErrorType.UnexpectedError
                };
            }

            /**
             * createReimbursement Query
             *
             * build the Moonbeam AppSync API GraphQL query, and perform a POST to it,
             * with the appropriate information.
             *
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            return axios.post(`${moonbeamBaseURL}`, {
                query: createReimbursement,
                variables: {
                    createReimbursementInput: createReimbursementInput
                }
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": moonbeamPrivateKey
                },
                timeout: 15000, // in milliseconds here
                timeoutErrorMessage: 'Moonbeam API timed out after 15000ms!'
            }).then(createReimbursementResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(createReimbursementResponse.data)}`);

                // retrieve the data block from the response
                const responseData = (createReimbursementResponse && createReimbursementResponse.data) ? createReimbursementResponse.data.data : null;

                // check if there are any errors in the returned response
                if (responseData && responseData.createReimbursement.errorMessage === null) {
                    // returned the successfully created reimbursement
                    return {
                        data: responseData.createReimbursement.data as Reimbursement,
                        id: responseData.createReimbursement.id
                    }
                } else {
                    return responseData ?
                        // return the error message and type, from the original AppSync call
                        {
                            errorMessage: responseData.createReimbursement.errorMessage,
                            errorType: responseData.createReimbursement.errorType
                        } :
                        // return the error response indicating an invalid structure returned
                        {
                            errorMessage: `Invalid response structure returned from ${endpointInfo} response!`,
                            errorType: ReimbursementsErrorType.ValidationError
                        }
                }
            }).catch(error => {
                if (error.response) {
                    /**
                     * The request was made and the server responded with a status code
                     * that falls out of the range of 2xx.
                     */
                    const errorMessage = `Non 2xxx response while calling the ${endpointInfo} Moonbeam API, with status ${error.response.status}, and response ${JSON.stringify(error.response.data)}`;
                    console.log(errorMessage);

                    // any other specific errors to be filtered below
                    return {
                        errorMessage: errorMessage,
                        errorType: ReimbursementsErrorType.UnexpectedError
                    };
                } else if (error.request) {
                    /**
                     * The request was made but no response was received
                     * `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                     *  http.ClientRequest in node.js.
                     */
                    const errorMessage = `No response received while calling the ${endpointInfo} Moonbeam API, for request ${error.request}`;
                    console.log(errorMessage);

                    return {
                        errorMessage: errorMessage,
                        errorType: ReimbursementsErrorType.UnexpectedError
                    };
                } else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Moonbeam API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);

                    return {
                        errorMessage: errorMessage,
                        errorType: ReimbursementsErrorType.UnexpectedError
                    };
                }
            });
        } catch (err) {
            const errorMessage = `Unexpected error while creating a reimbursement, through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);

            return {
                errorMessage: errorMessage,
                errorType: ReimbursementsErrorType.UnexpectedError
            };
        }
    }

    /**
     * Function used to update an existing reimbursement's details, from an incoming trigger obtained from the
     * reimbursements trigger Lambda.
     *
     * @param updateReimbursementInput the reimbursement input passed in from the cron Lambda trigger, to be used
     * while updating an existent reimbursement's details
     *
     * @returns a {@link ReimbursementResponse} representing the reimbursement details that were updated
     * in Dynamo DB
     */
    async updateReimbursement(updateReimbursementInput: UpdateReimbursementInput): Promise<ReimbursementResponse> {
        // easily identifiable API endpoint information
        const endpointInfo = 'updateReimbursement Mutation Moonbeam GraphQL API';

        try {
            // retrieve the API Key and Base URL, needed in order to make a reimbursement update call through the client
            const [moonbeamBaseURL, moonbeamPrivateKey] = await super.retrieveServiceCredentials(Constants.AWSPairConstants.MOONBEAM_INTERNAL_SECRET_NAME);

            // check to see if we obtained any invalid secret values from the call above
            if (moonbeamBaseURL === null || moonbeamBaseURL.length === 0 ||
                moonbeamPrivateKey === null || moonbeamPrivateKey.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Moonbeam API call!";
                console.log(errorMessage);

                return {
                    errorMessage: errorMessage,
                    errorType: ReimbursementsErrorType.UnexpectedError
                };
            }

            /**
             * updateReimbursement Query
             *
             * build the Moonbeam AppSync API GraphQL query, and perform a POST to it,
             * with the appropriate information.
             *
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            return axios.post(`${moonbeamBaseURL}`, {
                query: updateReimbursement,
                variables: {
                    updateReimbursementInput: updateReimbursementInput
                }
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": moonbeamPrivateKey
                },
                timeout: 15000, // in milliseconds here
                timeoutErrorMessage: 'Moonbeam API timed out after 15000ms!'
            }).then(updateReimbursementResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(updateReimbursementResponse.data)}`);

                // retrieve the data block from the response
                const responseData = (updateReimbursementResponse && updateReimbursementResponse.data) ? updateReimbursementResponse.data.data : null;

                // check if there are any errors in the returned response
                if (responseData && responseData.updateReimbursement.errorMessage === null) {
                    // returned the successfully updated reimbursement
                    return {
                        data: responseData.updateReimbursement.data as Reimbursement,
                        id: responseData.updateReimbursement.id
                    }
                } else {
                    return responseData ?
                        // return the error message and type, from the original AppSync call
                        {
                            errorMessage: responseData.updateReimbursement.errorMessage,
                            errorType: responseData.updateReimbursement.errorType
                        } :
                        // return the error response indicating an invalid structure returned
                        {
                            errorMessage: `Invalid response structure returned from ${endpointInfo} response!`,
                            errorType: ReimbursementsErrorType.ValidationError
                        }
                }
            }).catch(error => {
                if (error.response) {
                    /**
                     * The request was made and the server responded with a status code
                     * that falls out of the range of 2xx.
                     */
                    const errorMessage = `Non 2xxx response while calling the ${endpointInfo} Moonbeam API, with status ${error.response.status}, and response ${JSON.stringify(error.response.data)}`;
                    console.log(errorMessage);

                    // any other specific errors to be filtered below
                    return {
                        errorMessage: errorMessage,
                        errorType: ReimbursementsErrorType.UnexpectedError
                    };
                } else if (error.request) {
                    /**
                     * The request was made but no response was received
                     * `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                     *  http.ClientRequest in node.js.
                     */
                    const errorMessage = `No response received while calling the ${endpointInfo} Moonbeam API, for request ${error.request}`;
                    console.log(errorMessage);

                    return {
                        errorMessage: errorMessage,
                        errorType: ReimbursementsErrorType.UnexpectedError
                    };
                } else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Moonbeam API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);

                    return {
                        errorMessage: errorMessage,
                        errorType: ReimbursementsErrorType.UnexpectedError
                    };
                }
            });
        } catch (err) {
            const errorMessage = `Unexpected error while updating a reimbursement, through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);

            return {
                errorMessage: errorMessage,
                errorType: ReimbursementsErrorType.UnexpectedError
            };
        }
    }
}
