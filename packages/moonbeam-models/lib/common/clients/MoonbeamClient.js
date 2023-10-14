"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoonbeamClient = void 0;
const BaseAPIClient_1 = require("./BaseAPIClient");
const Constants_1 = require("../Constants");
const GraphqlExports_1 = require("../GraphqlExports");
const axios_1 = __importDefault(require("axios"));
const Mutations_1 = require("../../graphql/mutations/Mutations");
const Queries_1 = require("../../graphql/queries/Queries");
const client_cognito_identity_provider_1 = require("@aws-sdk/client-cognito-identity-provider");
/**
 * Class used as the base/generic client for all Moonbeam internal AppSync
 * and/or API Gateway APIs.
 */
class MoonbeamClient extends BaseAPIClient_1.BaseAPIClient {
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
     * Function used to get all users' emails and custom user IDs from Cognito.
     *
     * @returns a {@link UserForNotificationReminderResponse}, representing each individual users'
     * user ID and email attributes.
     */
    async getAllUsersForNotificationReminders() {
        // easily identifiable API endpoint information
        const endpointInfo = '/listUsers for getAllUsersForNotificationReminder Cognito SDK call';
        try {
            // retrieve the Cognito access key, secret key and user pool id, needed in order to retrieve all users through the Cognito Identity provider client
            const [cognitoAccessKeyId, cognitoSecretKey, cognitoUserPoolId] = await super.retrieveServiceCredentials(Constants_1.Constants.AWSPairConstants.MOONBEAM_INTERNAL_SECRET_NAME, undefined, undefined, undefined, true);
            // check to see if we obtained any invalid secret values from the call above
            if (cognitoAccessKeyId === null || cognitoAccessKeyId.length === 0 ||
                cognitoSecretKey === null || cognitoSecretKey.length === 0 ||
                cognitoUserPoolId === null || (cognitoUserPoolId && cognitoUserPoolId.length === 0)) {
                const errorMessage = "Invalid Secrets obtained for Cognito SDK call call!";
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: GraphqlExports_1.NotificationReminderErrorType.UnexpectedError
                };
            }
            // initialize the Cognito Identity Provider client using the credentials obtained above
            const cognitoIdentityProviderClient = new client_cognito_identity_provider_1.CognitoIdentityProviderClient({
                region: this.region,
                credentials: {
                    accessKeyId: cognitoAccessKeyId,
                    secretAccessKey: cognitoSecretKey
                }
            });
            /**
             * execute thew List Users command, without any filters, in order to retrieve a user's email and their
             * custom user ID, from their attributes.
             *
             * These results are going to be paginated, so we will limit the page size to 60 users (maximum allowed through this
             * call), and keep track of the number of pages and lack thereof, through a flag.
             */
            const userResults = [];
            let lastPaginationToken;
            let input = {
                UserPoolId: cognitoUserPoolId,
                AttributesToGet: ['email', 'custom:userId'],
                Limit: 60,
            };
            // keep getting users and updating the results array for users retrieved, until we run out of users to retrieve
            do {
                // execute the List Users command, given the input provided above
                const listUsersResponse = await cognitoIdentityProviderClient.send(new client_cognito_identity_provider_1.ListUsersCommand(input));
                /**
                 * check whether the List Users Command has a valid response/ valid list of users to be returned,
                 * and if so add in the resulting list accordingly.
                 */
                listUsersResponse.$metadata !== null && listUsersResponse.$metadata.httpStatusCode !== null &&
                    listUsersResponse.$metadata.httpStatusCode !== undefined && listUsersResponse.$metadata.httpStatusCode === 200 &&
                    listUsersResponse.Users !== null && listUsersResponse.Users !== undefined && listUsersResponse.Users.length !== 0 &&
                    userResults.push(...listUsersResponse.Users);
                // get the last pagination token from the retrieved output, and set the next input command's pagination token according to that
                lastPaginationToken = listUsersResponse.PaginationToken;
                input.PaginationToken = lastPaginationToken;
            } while (typeof lastPaginationToken !== undefined && typeof lastPaginationToken !== 'undefined' && lastPaginationToken !== undefined);
            // check for a valid response list, obtained from the Cognito List Users Command call
            if (userResults.length !== 0) {
                // loop through the list of users obtained through command, and return their emails and custom user IDs
                const userDetailsForNotificationReminder = [];
                userResults.forEach(cognitoUser => {
                    if (cognitoUser.Attributes !== undefined && cognitoUser.Attributes.length === 2 &&
                        cognitoUser.Attributes[0] !== undefined && cognitoUser.Attributes[0].Value.length !== 0 &&
                        cognitoUser.Attributes[1] !== undefined && cognitoUser.Attributes[1].Value.length !== 0) {
                        // push the new user details in the user details array to be returned
                        userDetailsForNotificationReminder.push({
                            id: cognitoUser.Attributes[1].Value,
                            email: cognitoUser.Attributes[0].Value
                        });
                    }
                });
                // ensure that the size of the list of user details to be returned, matches the number of users retrieved through the List Users Command
                if (userDetailsForNotificationReminder.length === userResults.length) {
                    // return the results appropriately
                    return {
                        data: userDetailsForNotificationReminder
                    };
                }
                else {
                    const errorMessage = `User detail list length does not match the retrieved user list`;
                    console.log(`${errorMessage}`);
                    return {
                        data: null,
                        errorType: GraphqlExports_1.NotificationReminderErrorType.ValidationError,
                        errorMessage: errorMessage
                    };
                }
            }
            else {
                const errorMessage = `Invalid/Empty user list array, obtained while calling the get List Users Cognito command`;
                console.log(`${errorMessage}`);
                return {
                    data: null,
                    errorType: GraphqlExports_1.NotificationReminderErrorType.ValidationError,
                    errorMessage: errorMessage
                };
            }
        }
        catch (err) {
            const errorMessage = `Unexpected error while retrieving email and custom id for notification reminders for users, from Cognito through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                data: null,
                errorType: GraphqlExports_1.NotificationReminderErrorType.UnexpectedError,
                errorMessage: errorMessage
            };
        }
    }
    /**
     * Function used to get a user's email, given certain filters to be passed in.
     *
     * @param militaryVerificationNotificationUpdate the military verification notification update
     * objects, used to filter through the Cognito user pool, in order to obtain a user's email.
     *
     * @returns a {@link EmailFromCognitoResponse} representing the user's email obtained
     * from Cognito.
     */
    async getEmailForUser(militaryVerificationNotificationUpdate) {
        // easily identifiable API endpoint information
        const endpointInfo = '/listUsers for getEmailForUser Cognito SDK call';
        try {
            // retrieve the Cognito access key, secret key and user pool id, needed in order to retrieve the user email through the Cognito Identity provider client
            const [cognitoAccessKeyId, cognitoSecretKey, cognitoUserPoolId] = await super.retrieveServiceCredentials(Constants_1.Constants.AWSPairConstants.MOONBEAM_INTERNAL_SECRET_NAME, undefined, undefined, undefined, true);
            // check to see if we obtained any invalid secret values from the call above
            if (cognitoAccessKeyId === null || cognitoAccessKeyId.length === 0 ||
                cognitoSecretKey === null || cognitoSecretKey.length === 0 ||
                cognitoUserPoolId === null || (cognitoUserPoolId && cognitoUserPoolId.length === 0)) {
                const errorMessage = "Invalid Secrets obtained for Cognito SDK call call!";
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: GraphqlExports_1.NotificationsErrorType.UnexpectedError
                };
            }
            // initialize the Cognito Identity Provider client using the credentials obtained above
            const cognitoIdentityProviderClient = new client_cognito_identity_provider_1.CognitoIdentityProviderClient({
                region: this.region,
                credentials: {
                    accessKeyId: cognitoAccessKeyId,
                    secretAccessKey: cognitoSecretKey
                }
            });
            /**
             * execute the List Users command, using filters, in order to retrieve a user's email from their attributes.
             *
             * Retrieve the user by their family_name. If there are is more than 1 match returned, then we will match
             * the user based on their unique id, from the custom:userId attribute
             */
            const listUsersResponse = await cognitoIdentityProviderClient.send(new client_cognito_identity_provider_1.ListUsersCommand({
                UserPoolId: cognitoUserPoolId,
                AttributesToGet: ['email', 'custom:userId'],
                Filter: `family_name= "${`${militaryVerificationNotificationUpdate.lastName}`.replaceAll("\"", "\\\"")}"`
            }));
            // check for a valid response from the Cognito List Users Command call
            if (listUsersResponse !== null && listUsersResponse.$metadata !== null && listUsersResponse.$metadata.httpStatusCode !== null &&
                listUsersResponse.$metadata.httpStatusCode !== undefined && listUsersResponse.$metadata.httpStatusCode === 200 &&
                listUsersResponse.Users !== null && listUsersResponse.Users !== undefined && listUsersResponse.Users.length !== 0) {
                // If there are is more than 1 match returned, then we will match the user based on their unique id, from the custom:userId attribute
                let invalidAttributesFlag = false;
                listUsersResponse.Users.forEach(cognitoUser => {
                    if (cognitoUser.Attributes === null || cognitoUser.Attributes === undefined || cognitoUser.Attributes.length !== 2) {
                        invalidAttributesFlag = true;
                    }
                });
                // check for valid user attributes
                if (!invalidAttributesFlag) {
                    let matchedEmail = null;
                    let noOfMatches = 0;
                    listUsersResponse.Users.forEach(cognitoUser => {
                        if (cognitoUser.Attributes[1].Value.trim() === militaryVerificationNotificationUpdate.id.trim()) {
                            matchedEmail = cognitoUser.Attributes[0].Value;
                            noOfMatches += 1;
                        }
                    });
                    if (noOfMatches === 1) {
                        return {
                            data: matchedEmail
                        };
                    }
                    else {
                        const errorMessage = `Couldn't find user in Cognito for ${militaryVerificationNotificationUpdate.id}`;
                        console.log(`${errorMessage}`);
                        return {
                            data: null,
                            errorType: GraphqlExports_1.NotificationsErrorType.ValidationError,
                            errorMessage: errorMessage
                        };
                    }
                }
                else {
                    const errorMessage = `Invalid user attributes obtained`;
                    console.log(`${errorMessage}`);
                    return {
                        data: null,
                        errorType: GraphqlExports_1.NotificationsErrorType.ValidationError,
                        errorMessage: errorMessage
                    };
                }
            }
            else {
                const errorMessage = `Invalid structure obtained while calling the get List Users Cognito command`;
                console.log(`${errorMessage}`);
                return {
                    data: null,
                    errorType: GraphqlExports_1.NotificationsErrorType.ValidationError,
                    errorMessage: errorMessage
                };
            }
        }
        catch (err) {
            const errorMessage = `Unexpected error while retrieving email for user from Cognito through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                data: null,
                errorType: GraphqlExports_1.NotificationsErrorType.UnexpectedError,
                errorMessage: errorMessage
            };
        }
    }
    /**
     * Function used to send a new military verification status acknowledgment, so we can kick-start the military verification
     * status update notification process through the producer.
     *
     * @param militaryVerificationNotificationUpdate military verification update object
     *
     * @return a {@link Promise} of {@link APIGatewayProxyResult} representing the API Gateway result
     * sent by the military verification update producer Lambda, to validate whether the military verification
     * notification update process kick-started or not
     */
    async militaryVerificationUpdatesAcknowledgment(militaryVerificationNotificationUpdate) {
        // easily identifiable API endpoint information
        const endpointInfo = 'POST /militaryVerificationUpdatesAcknowledgment Moonbeam REST API';
        try {
            // retrieve the API Key and Base URL, needed in order to make the military status updates acknowledgment call through the client
            const [moonbeamBaseURL, moonbeamPrivateKey] = await super.retrieveServiceCredentials(Constants_1.Constants.AWSPairConstants.MOONBEAM_INTERNAL_SECRET_NAME, true);
            // check to see if we obtained any invalid secret values from the call above
            if (moonbeamBaseURL === null || moonbeamBaseURL.length === 0 ||
                moonbeamPrivateKey === null || moonbeamPrivateKey.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Moonbeam REST API call!";
                console.log(errorMessage);
                return {
                    statusCode: 500,
                    body: JSON.stringify({
                        data: null,
                        errorType: GraphqlExports_1.MilitaryVerificationErrorType.UnexpectedError,
                        errorMessage: errorMessage
                    })
                };
            }
            /**
             * POST /militaryVerificationUpdatesAcknowledgment
             *
             * build the internal Moonbeam API request body to be passed in, and perform a POST to it with the appropriate information
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            console.log(`Moonbeam REST API request Object: ${JSON.stringify(militaryVerificationNotificationUpdate)}`);
            return axios_1.default.post(`${moonbeamBaseURL}/militaryVerificationUpdatesAcknowledgment`, JSON.stringify(militaryVerificationNotificationUpdate), {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": moonbeamPrivateKey
                },
                timeout: 15000,
                timeoutErrorMessage: 'Moonbeam REST API timed out after 15000ms!'
            }).then(militaryStatusUpdateResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(militaryStatusUpdateResponse.data)}`);
                // check if there are any errors in the returned response
                if (militaryStatusUpdateResponse.data && militaryStatusUpdateResponse.data.data !== null
                    && !militaryStatusUpdateResponse.data.errorMessage && !militaryStatusUpdateResponse.data.errorType
                    && militaryStatusUpdateResponse.status === 202) {
                    // returned the military verification update acknowledgment response
                    return {
                        statusCode: militaryStatusUpdateResponse.status,
                        body: militaryStatusUpdateResponse.data.data
                    };
                }
                else {
                    return militaryStatusUpdateResponse.data && militaryStatusUpdateResponse.data.errorMessage !== undefined
                        && militaryStatusUpdateResponse.data.errorMessage !== null ?
                        // return the error message and type, from the original REST API call
                        {
                            statusCode: militaryStatusUpdateResponse.status,
                            body: militaryStatusUpdateResponse.data.errorMessage
                        } :
                        // return the error response indicating an invalid structure returned
                        {
                            statusCode: 500,
                            body: JSON.stringify({
                                data: null,
                                errorMessage: `Invalid response structure returned from ${endpointInfo} response!`,
                                errorType: GraphqlExports_1.MilitaryVerificationErrorType.ValidationError
                            })
                        };
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
                }
                else if (error.request) {
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
                            errorType: GraphqlExports_1.MilitaryVerificationErrorType.UnexpectedError,
                            errorMessage: errorMessage
                        })
                    };
                }
                else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Moonbeam API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);
                    return {
                        statusCode: 500,
                        body: JSON.stringify({
                            data: null,
                            errorType: GraphqlExports_1.MilitaryVerificationErrorType.UnexpectedError,
                            errorMessage: errorMessage
                        })
                    };
                }
            });
        }
        catch (err) {
            const errorMessage = `Unexpected error while posting the military verification status acknowledgment object through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                statusCode: 500,
                body: JSON.stringify({
                    data: null,
                    errorType: GraphqlExports_1.MilitaryVerificationErrorType.UnexpectedError,
                    errorMessage: errorMessage
                })
            };
        }
    }
    /**
     * Function used to send a new transaction acknowledgment, for an updated transaction, so we can kick-start the
     * transaction process through the transaction producer.
     *
     * @param updatedTransactionEvent updated transaction event to be passed in
     *
     * @return a {@link Promise} of {@link APIGatewayProxyResult} representing the API Gateway result
     * sent by the reimbursement producer Lambda, to validate whether the transactions process was
     * kick-started or not.
     */
    async transactionsAcknowledgment(updatedTransactionEvent) {
        // easily identifiable API endpoint information
        const endpointInfo = 'POST /transactionsAcknowledgment Moonbeam REST API';
        try {
            // retrieve the API Key and Base URL, needed in order to make the transaction acknowledgment call through the client
            const [moonbeamBaseURL, moonbeamPrivateKey] = await super.retrieveServiceCredentials(Constants_1.Constants.AWSPairConstants.MOONBEAM_INTERNAL_SECRET_NAME, true);
            // check to see if we obtained any invalid secret values from the call above
            if (moonbeamBaseURL === null || moonbeamBaseURL.length === 0 ||
                moonbeamPrivateKey === null || moonbeamPrivateKey.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Moonbeam REST API call!";
                console.log(errorMessage);
                return {
                    statusCode: 500,
                    body: JSON.stringify({
                        data: null,
                        errorType: GraphqlExports_1.TransactionsErrorType.UnexpectedError,
                        errorMessage: errorMessage
                    })
                };
            }
            /**
             * POST /transactionsAcknowledgment
             *
             * build the internal Moonbeam API request body to be passed in, and perform a POST to it with the appropriate information
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            console.log(`Moonbeam REST API request Object: ${JSON.stringify(updatedTransactionEvent)}`);
            return axios_1.default.post(`${moonbeamBaseURL}/transactionsAcknowledgment`, JSON.stringify(updatedTransactionEvent), {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": moonbeamPrivateKey
                },
                timeout: 15000,
                timeoutErrorMessage: 'Moonbeam REST API timed out after 15000ms!'
            }).then(transactionsAcknowledgmentResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(transactionsAcknowledgmentResponse.data)}`);
                // check if there are any errors in the returned response
                if (transactionsAcknowledgmentResponse.data && transactionsAcknowledgmentResponse.data.data !== null
                    && !transactionsAcknowledgmentResponse.data.errorMessage && !transactionsAcknowledgmentResponse.data.errorType
                    && transactionsAcknowledgmentResponse.status === 202) {
                    // returned the transaction acknowledgment response
                    return {
                        statusCode: transactionsAcknowledgmentResponse.status,
                        body: transactionsAcknowledgmentResponse.data.data
                    };
                }
                else {
                    return transactionsAcknowledgmentResponse.data && transactionsAcknowledgmentResponse.data.errorMessage !== undefined
                        && transactionsAcknowledgmentResponse.data.errorMessage !== null ?
                        // return the error message and type, from the original REST API call
                        {
                            statusCode: transactionsAcknowledgmentResponse.status,
                            body: transactionsAcknowledgmentResponse.data.errorMessage
                        } :
                        // return the error response indicating an invalid structure returned
                        {
                            statusCode: 500,
                            body: JSON.stringify({
                                data: null,
                                errorMessage: `Invalid response structure returned from ${endpointInfo} response!`,
                                errorType: GraphqlExports_1.TransactionsErrorType.ValidationError
                            })
                        };
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
                }
                else if (error.request) {
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
                            errorType: GraphqlExports_1.TransactionsErrorType.UnexpectedError,
                            errorMessage: errorMessage
                        })
                    };
                }
                else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Moonbeam API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);
                    return {
                        statusCode: 500,
                        body: JSON.stringify({
                            data: null,
                            errorType: GraphqlExports_1.TransactionsErrorType.UnexpectedError,
                            errorMessage: errorMessage
                        })
                    };
                }
            });
        }
        catch (err) {
            const errorMessage = `Unexpected error while posting the transactions acknowledgment object through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                statusCode: 500,
                body: JSON.stringify({
                    data: null,
                    errorType: GraphqlExports_1.TransactionsErrorType.UnexpectedError,
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
    async getEligibleLinkedUsers() {
        // easily identifiable API endpoint information
        const endpointInfo = 'getEligibleLinkedUsers Query Moonbeam GraphQL API';
        try {
            // retrieve the API Key and Base URL, needed in order to make the eligible user retrieval call through the client
            const [moonbeamBaseURL, moonbeamPrivateKey] = await super.retrieveServiceCredentials(Constants_1.Constants.AWSPairConstants.MOONBEAM_INTERNAL_SECRET_NAME);
            // check to see if we obtained any invalid secret values from the call above
            if (moonbeamBaseURL === null || moonbeamBaseURL.length === 0 ||
                moonbeamPrivateKey === null || moonbeamPrivateKey.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Moonbeam API call!";
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: GraphqlExports_1.CardLinkErrorType.UnexpectedError
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
            return axios_1.default.post(`${moonbeamBaseURL}`, {
                query: Queries_1.getEligibleLinkedUsers
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": moonbeamPrivateKey
                },
                timeout: 15000,
                timeoutErrorMessage: 'Moonbeam API timed out after 15000ms!'
            }).then(getEligibleLinkedUsersResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(getEligibleLinkedUsersResponse.data)}`);
                // retrieve the data block from the response
                const responseData = (getEligibleLinkedUsersResponse && getEligibleLinkedUsersResponse.data) ? getEligibleLinkedUsersResponse.data.data : null;
                // check if there are any errors in the returned response
                if (responseData && responseData.getEligibleLinkedUsers.errorMessage === null) {
                    // returned the successfully retrieved eligible linked users
                    return {
                        data: responseData.getEligibleLinkedUsers.data
                    };
                }
                else {
                    return responseData ?
                        // return the error message and type, from the original AppSync call
                        {
                            errorMessage: responseData.getEligibleLinkedUsers.errorMessage,
                            errorType: responseData.getEligibleLinkedUsers.errorType
                        } :
                        // return the error response indicating an invalid structure returned
                        {
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
                    const errorMessage = `Non 2xxx response while calling the ${endpointInfo} Moonbeam API, with status ${error.response.status}, and response ${JSON.stringify(error.response.data)}`;
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
                    const errorMessage = `No response received while calling the ${endpointInfo} Moonbeam API, for request ${error.request}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.CardLinkErrorType.UnexpectedError
                    };
                }
                else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Moonbeam API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.CardLinkErrorType.UnexpectedError
                    };
                }
            });
        }
        catch (err) {
            const errorMessage = `Unexpected error while retrieving eligible linked users through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                errorMessage: errorMessage,
                errorType: GraphqlExports_1.CardLinkErrorType.UnexpectedError
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
    async createTransaction(transaction) {
        // easily identifiable API endpoint information
        const endpointInfo = 'createTransaction Mutation Moonbeam GraphQL API';
        try {
            // retrieve the API Key and Base URL, needed in order to make the card linking call through the client
            const [moonbeamBaseURL, moonbeamPrivateKey] = await super.retrieveServiceCredentials(Constants_1.Constants.AWSPairConstants.MOONBEAM_INTERNAL_SECRET_NAME);
            // check to see if we obtained any invalid secret values from the call above
            if (moonbeamBaseURL === null || moonbeamBaseURL.length === 0 ||
                moonbeamPrivateKey === null || moonbeamPrivateKey.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Moonbeam API call!";
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: GraphqlExports_1.TransactionsErrorType.UnexpectedError
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
            console.log(`Moonbeam AppSync API request Object: ${JSON.stringify(transaction)}`);
            return axios_1.default.post(`${moonbeamBaseURL}`, {
                query: Mutations_1.createTransaction,
                variables: {
                    createTransactionInput: transaction
                }
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": moonbeamPrivateKey
                },
                timeout: 15000,
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
                    };
                }
                else {
                    return responseData ?
                        // return the error message and type, from the original AppSync call
                        {
                            errorMessage: responseData.createTransaction.errorMessage,
                            errorType: responseData.createTransaction.errorType
                        } :
                        // return the error response indicating an invalid structure returned
                        {
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
                    const errorMessage = `Non 2xxx response while calling the ${endpointInfo} Moonbeam API, with status ${error.response.status}, and response ${JSON.stringify(error.response.data)}`;
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
                    const errorMessage = `No response received while calling the ${endpointInfo} Moonbeam API, for request ${error.request}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.TransactionsErrorType.UnexpectedError
                    };
                }
                else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Moonbeam API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.TransactionsErrorType.UnexpectedError
                    };
                }
            });
        }
        catch (err) {
            const errorMessage = `Unexpected error while creating a new transaction through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                errorMessage: errorMessage,
                errorType: GraphqlExports_1.TransactionsErrorType.UnexpectedError
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
    async getTransactionByStatus(getTransactionByStatusInput) {
        // easily identifiable API endpoint information
        const endpointInfo = 'getTransactionByStatus Query Moonbeam GraphQL API';
        try {
            // retrieve the API Key and Base URL, needed in order to make the transaction by status retrieval call through the client
            const [moonbeamBaseURL, moonbeamPrivateKey] = await super.retrieveServiceCredentials(Constants_1.Constants.AWSPairConstants.MOONBEAM_INTERNAL_SECRET_NAME);
            // check to see if we obtained any invalid secret values from the call above
            if (moonbeamBaseURL === null || moonbeamBaseURL.length === 0 ||
                moonbeamPrivateKey === null || moonbeamPrivateKey.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Moonbeam API call!";
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: GraphqlExports_1.TransactionsErrorType.UnexpectedError
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
            return axios_1.default.post(`${moonbeamBaseURL}`, {
                query: Queries_1.getTransactionByStatus,
                variables: {
                    getTransactionByStatusInput: getTransactionByStatusInput
                }
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": moonbeamPrivateKey
                },
                timeout: 15000,
                timeoutErrorMessage: 'Moonbeam API timed out after 15000ms!'
            }).then(getTransactionByStatusResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(getTransactionByStatusResponse.data)}`);
                // retrieve the data block from the response
                const responseData = (getTransactionByStatusResponse && getTransactionByStatusResponse.data) ? getTransactionByStatusResponse.data.data : null;
                // check if there are any errors in the returned response
                if (responseData && responseData.getTransactionByStatus.errorMessage === null) {
                    // returned the successfully retrieved transactions for a given user, filtered by their status
                    return {
                        data: responseData.getTransactionByStatus.data
                    };
                }
                else {
                    return responseData ?
                        // return the error message and type, from the original AppSync call
                        {
                            errorMessage: responseData.getTransactionByStatus.errorMessage,
                            errorType: responseData.getTransactionByStatus.errorType
                        } :
                        // return the error response indicating an invalid structure returned
                        {
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
                    const errorMessage = `Non 2xxx response while calling the ${endpointInfo} Moonbeam API, with status ${error.response.status}, and response ${JSON.stringify(error.response.data)}`;
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
                    const errorMessage = `No response received while calling the ${endpointInfo} Moonbeam API, for request ${error.request}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.TransactionsErrorType.UnexpectedError
                    };
                }
                else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Moonbeam API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.TransactionsErrorType.UnexpectedError
                    };
                }
            });
        }
        catch (err) {
            const errorMessage = `Unexpected error while retrieving transactions for a particular user, filtered by their status through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                errorMessage: errorMessage,
                errorType: GraphqlExports_1.TransactionsErrorType.UnexpectedError
            };
        }
    }
    /**
     * Function used to get all transactions, for a particular user.
     *
     * @param getTransactionInput the transaction input object to be passed in,
     * containing all the necessary filtering for retrieving the transactions for a particular user.
     *
     * @returns a {@link MoonbeamTransactionsResponse} representing the transactional data.
     */
    async getTransaction(getTransactionInput) {
        // easily identifiable API endpoint information
        const endpointInfo = 'getTransaction Query Moonbeam GraphQL API';
        try {
            // retrieve the API Key and Base URL, needed in order to make the transaction retrieval call through the client
            const [moonbeamBaseURL, moonbeamPrivateKey] = await super.retrieveServiceCredentials(Constants_1.Constants.AWSPairConstants.MOONBEAM_INTERNAL_SECRET_NAME);
            // check to see if we obtained any invalid secret values from the call above
            if (moonbeamBaseURL === null || moonbeamBaseURL.length === 0 ||
                moonbeamPrivateKey === null || moonbeamPrivateKey.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Moonbeam API call!";
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: GraphqlExports_1.TransactionsErrorType.UnexpectedError
                };
            }
            /**
             * getTransaction Query
             *
             * build the Moonbeam AppSync API GraphQL query, and perform a POST to it,
             * with the appropriate information.
             *
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            return axios_1.default.post(`${moonbeamBaseURL}`, {
                query: Queries_1.getTransaction,
                variables: {
                    getTransactionInput: getTransactionInput
                }
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": moonbeamPrivateKey
                },
                timeout: 15000,
                timeoutErrorMessage: 'Moonbeam API timed out after 15000ms!'
            }).then(getTransactionsResponses => {
                // we don't want to log this in case of success responses, because the transaction responses are very long (frugality)
                // console.log(`${endpointInfo} response ${JSON.stringify(getTransactionsResponses.data)}`);
                // retrieve the data block from the response
                const responseData = (getTransactionsResponses && getTransactionsResponses.data) ? getTransactionsResponses.data.data : null;
                // check if there are any errors in the returned response
                if (responseData && responseData.getTransaction.errorMessage === null) {
                    // returned the successfully retrieved transactions for a given user
                    return {
                        data: responseData.getTransaction.data
                    };
                }
                else {
                    return responseData ?
                        // return the error message and type, from the original AppSync call
                        {
                            errorMessage: responseData.getTransaction.errorMessage,
                            errorType: responseData.getTransaction.errorType
                        } :
                        // return the error response indicating an invalid structure returned
                        {
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
                    const errorMessage = `Non 2xxx response while calling the ${endpointInfo} Moonbeam API, with status ${error.response.status}, and response ${JSON.stringify(error.response.data)}`;
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
                    const errorMessage = `No response received while calling the ${endpointInfo} Moonbeam API, for request ${error.request}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.TransactionsErrorType.UnexpectedError
                    };
                }
                else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Moonbeam API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.TransactionsErrorType.UnexpectedError
                    };
                }
            });
        }
        catch (err) {
            const errorMessage = `Unexpected error while retrieving transactions for a particular user, through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                errorMessage: errorMessage,
                errorType: GraphqlExports_1.TransactionsErrorType.UnexpectedError
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
    async updateTransaction(updateTransactionInput) {
        // easily identifiable API endpoint information
        const endpointInfo = 'updateTransaction Mutation Moonbeam GraphQL API';
        try {
            // retrieve the API Key and Base URL, needed in order to make the transaction updated call through the client
            const [moonbeamBaseURL, moonbeamPrivateKey] = await super.retrieveServiceCredentials(Constants_1.Constants.AWSPairConstants.MOONBEAM_INTERNAL_SECRET_NAME);
            // check to see if we obtained any invalid secret values from the call above
            if (moonbeamBaseURL === null || moonbeamBaseURL.length === 0 ||
                moonbeamPrivateKey === null || moonbeamPrivateKey.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Moonbeam API call!";
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: GraphqlExports_1.TransactionsErrorType.UnexpectedError
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
            return axios_1.default.post(`${moonbeamBaseURL}`, {
                query: Mutations_1.updateTransaction,
                variables: {
                    updateTransactionInput: updateTransactionInput
                }
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": moonbeamPrivateKey
                },
                timeout: 15000,
                timeoutErrorMessage: 'Moonbeam API timed out after 15000ms!'
            }).then(updateTransactionResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(updateTransactionResponse.data)}`);
                // retrieve the data block from the response
                const responseData = (updateTransactionResponse && updateTransactionResponse.data) ? updateTransactionResponse.data.data : null;
                // check if there are any errors in the returned response
                if (responseData && responseData.updateTransaction.errorMessage === null) {
                    // returned the successfully updated transactional information
                    return {
                        data: responseData.updateTransaction.data
                    };
                }
                else {
                    return responseData ?
                        // return the error message and type, from the original AppSync call
                        {
                            errorMessage: responseData.updateTransaction.errorMessage,
                            errorType: responseData.updateTransaction.errorType
                        } :
                        // return the error response indicating an invalid structure returned
                        {
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
                    const errorMessage = `Non 2xxx response while calling the ${endpointInfo} Moonbeam API, with status ${error.response.status}, and response ${JSON.stringify(error.response.data)}`;
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
                    const errorMessage = `No response received while calling the ${endpointInfo} Moonbeam API, for request ${error.request}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.TransactionsErrorType.UnexpectedError
                    };
                }
                else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Moonbeam API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.TransactionsErrorType.UnexpectedError
                    };
                }
            });
        }
        catch (err) {
            const errorMessage = `Unexpected error while updating transactional data, through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                errorMessage: errorMessage,
                errorType: GraphqlExports_1.TransactionsErrorType.UnexpectedError
            };
        }
    }
    /**
     * Function used to create a notification.
     *
     * @param createNotificationInput the notification details to be passed in, in order to create a new
     * notification
     *
     * @returns a {@link CreateNotificationResponse} representing the newly created notification data
     */
    async createNotification(createNotificationInput) {
        // easily identifiable API endpoint information
        const endpointInfo = 'createNotification Mutation Moonbeam GraphQL API';
        try {
            // retrieve the API Key and Base URL, needed in order to make a notification creation call through the client
            const [moonbeamBaseURL, moonbeamPrivateKey] = await super.retrieveServiceCredentials(Constants_1.Constants.AWSPairConstants.MOONBEAM_INTERNAL_SECRET_NAME);
            // check to see if we obtained any invalid secret values from the call above
            if (moonbeamBaseURL === null || moonbeamBaseURL.length === 0 ||
                moonbeamPrivateKey === null || moonbeamPrivateKey.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Moonbeam API call!";
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: GraphqlExports_1.NotificationsErrorType.UnexpectedError
                };
            }
            /**
             * createNotification Query
             *
             * build the Moonbeam AppSync API GraphQL query, and perform a POST to it,
             * with the appropriate information.
             *
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            return axios_1.default.post(`${moonbeamBaseURL}`, {
                query: Mutations_1.createNotification,
                variables: {
                    createNotificationInput: createNotificationInput
                }
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": moonbeamPrivateKey
                },
                timeout: 15000,
                timeoutErrorMessage: 'Moonbeam API timed out after 15000ms!'
            }).then(createNotificationResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(createNotificationResponse.data)}`);
                // retrieve the data block from the response
                const responseData = (createNotificationResponse && createNotificationResponse.data) ? createNotificationResponse.data.data : null;
                // check if there are any errors in the returned response
                if (responseData && responseData.createNotification.errorMessage === null) {
                    // returned the successfully created notification
                    return {
                        id: responseData.createNotification.id,
                        data: responseData.createNotification.data
                    };
                }
                else {
                    return responseData ?
                        // return the error message and type, from the original AppSync call
                        {
                            errorMessage: responseData.createNotification.errorMessage,
                            errorType: responseData.createNotification.errorType
                        } :
                        // return the error response indicating an invalid structure returned
                        {
                            errorMessage: `Invalid response structure returned from ${endpointInfo} response!`,
                            errorType: GraphqlExports_1.NotificationsErrorType.ValidationError
                        };
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
                        errorType: GraphqlExports_1.NotificationsErrorType.UnexpectedError
                    };
                }
                else if (error.request) {
                    /**
                     * The request was made but no response was received
                     * `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                     *  http.ClientRequest in node.js.
                     */
                    const errorMessage = `No response received while calling the ${endpointInfo} Moonbeam API, for request ${error.request}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.NotificationsErrorType.UnexpectedError
                    };
                }
                else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Moonbeam API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.NotificationsErrorType.UnexpectedError
                    };
                }
            });
        }
        catch (err) {
            const errorMessage = `Unexpected error while creating a notification, through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                errorMessage: errorMessage,
                errorType: GraphqlExports_1.NotificationsErrorType.UnexpectedError
            };
        }
    }
    /**
     * Function used to get all the physical devices associated with a particular user.
     *
     * @param getDevicesForUserInput the devices for user input, containing the filtering information
     * used to retrieve all the physical devices for a particular user.
     *
     * @returns a {@link UserDevicesResponse} representing the matched physical devices' information.
     */
    async getDevicesForUser(getDevicesForUserInput) {
        // easily identifiable API endpoint information
        const endpointInfo = 'getDevicesForUser Query Moonbeam GraphQL API';
        try {
            // retrieve the API Key and Base URL, needed in order to make the devices for user retrieval call through the client
            const [moonbeamBaseURL, moonbeamPrivateKey] = await super.retrieveServiceCredentials(Constants_1.Constants.AWSPairConstants.MOONBEAM_INTERNAL_SECRET_NAME);
            // check to see if we obtained any invalid secret values from the call above
            if (moonbeamBaseURL === null || moonbeamBaseURL.length === 0 ||
                moonbeamPrivateKey === null || moonbeamPrivateKey.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Moonbeam API call!";
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: GraphqlExports_1.UserDeviceErrorType.UnexpectedError
                };
            }
            /**
             * getDevicesForUser Query
             *
             * build the Moonbeam AppSync API GraphQL query, and perform a POST to it,
             * with the appropriate information.
             *
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            return axios_1.default.post(`${moonbeamBaseURL}`, {
                query: Queries_1.getDevicesForUser,
                variables: {
                    getDevicesForUserInput: getDevicesForUserInput
                }
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": moonbeamPrivateKey
                },
                timeout: 15000,
                timeoutErrorMessage: 'Moonbeam API timed out after 15000ms!'
            }).then(getDevicesForUserResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(getDevicesForUserResponse.data)}`);
                // retrieve the data block from the response
                const responseData = (getDevicesForUserResponse && getDevicesForUserResponse.data) ? getDevicesForUserResponse.data.data : null;
                // check if there are any errors in the returned response
                if (responseData && responseData.getDevicesForUser.errorMessage === null) {
                    // returned the successfully retrieved physical devices for a given user
                    return {
                        data: responseData.getDevicesForUser.data
                    };
                }
                else {
                    return responseData ?
                        // return the error message and type, from the original AppSync call
                        {
                            errorMessage: responseData.getDevicesForUser.errorMessage,
                            errorType: responseData.getDevicesForUser.errorType
                        } :
                        // return the error response indicating an invalid structure returned
                        {
                            errorMessage: `Invalid response structure returned from ${endpointInfo} response!`,
                            errorType: GraphqlExports_1.UserDeviceErrorType.ValidationError
                        };
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
                        errorType: GraphqlExports_1.UserDeviceErrorType.UnexpectedError
                    };
                }
                else if (error.request) {
                    /**
                     * The request was made but no response was received
                     * `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                     *  http.ClientRequest in node.js.
                     */
                    const errorMessage = `No response received while calling the ${endpointInfo} Moonbeam API, for request ${error.request}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.UserDeviceErrorType.UnexpectedError
                    };
                }
                else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Moonbeam API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.UserDeviceErrorType.UnexpectedError
                    };
                }
            });
        }
        catch (err) {
            const errorMessage = `Unexpected error while retrieving physical devices for a particular user, through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                errorMessage: errorMessage,
                errorType: GraphqlExports_1.UserDeviceErrorType.UnexpectedError
            };
        }
    }
}
exports.MoonbeamClient = MoonbeamClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW9vbmJlYW1DbGllbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbW9uL2NsaWVudHMvTW9vbmJlYW1DbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsbURBQThDO0FBQzlDLDRDQUF1QztBQUN2QyxzREE4QjJCO0FBQzNCLGtEQUEwQjtBQUMxQixpRUFBMkc7QUFDM0csMkRBS3VDO0FBRXZDLGdHQU1tRDtBQUVuRDs7O0dBR0c7QUFDSCxNQUFhLGNBQWUsU0FBUSw2QkFBYTtJQUU3Qzs7Ozs7T0FLRztJQUNILFlBQVksV0FBbUIsRUFBRSxNQUFjO1FBQzNDLEtBQUssQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsS0FBSyxDQUFDLG1DQUFtQztRQUNyQywrQ0FBK0M7UUFDL0MsTUFBTSxZQUFZLEdBQUcsb0VBQW9FLENBQUM7UUFFMUYsSUFBSTtZQUNBLG1KQUFtSjtZQUNuSixNQUFNLENBQUMsa0JBQWtCLEVBQUUsZ0JBQWdCLEVBQUUsaUJBQWlCLENBQUMsR0FBRyxNQUFNLEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxxQkFBUyxDQUFDLGdCQUFnQixDQUFDLDZCQUE2QixFQUM3SixTQUFTLEVBQ1QsU0FBUyxFQUNULFNBQVMsRUFDVCxJQUFJLENBQUMsQ0FBQztZQUVWLDRFQUE0RTtZQUM1RSxJQUFJLGtCQUFrQixLQUFLLElBQUksSUFBSSxrQkFBa0IsQ0FBQyxNQUFNLEtBQUssQ0FBQztnQkFDOUQsZ0JBQWdCLEtBQUssSUFBSSxJQUFJLGdCQUFnQixDQUFDLE1BQU0sS0FBSyxDQUFDO2dCQUMxRCxpQkFBaUIsS0FBSyxJQUFJLElBQUksQ0FBQyxpQkFBaUIsSUFBSSxpQkFBaUIsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLEVBQUU7Z0JBQ3JGLE1BQU0sWUFBWSxHQUFHLHFEQUFxRCxDQUFDO2dCQUMzRSxPQUFPLENBQUMs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TSxZQUFZLEdBQUcsMENBQTBDLFlBQVksOEJBQThCLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztvQkFDekgsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztvQkFFMUIsT0FBTzt3QkFDSCxZQUFZLEVBQUUsWUFBWTt3QkFDMUIsU0FBUyxFQUFFLG9DQUFtQixDQUFDLGVBQWU7cUJBQ2pELENBQUM7aUJBQ0w7cUJBQU07b0JBQ0gsdUVBQXVFO29CQUN2RSxNQUFNLFlBQVksR0FBRyx5REFBeUQsWUFBWSxrQkFBa0IsQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztvQkFDeEosT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztvQkFFMUIsT0FBTzt3QkFDSCxZQUFZLEVBQUUsWUFBWTt3QkFDMUIsU0FBUyxFQUFFLG9DQUFtQixDQUFDLGVBQWU7cUJBQ2pELENBQUM7aUJBQ0w7WUFDTCxDQUFDLENBQUMsQ0FBQztTQUNOO1FBQUMsT0FBTyxHQUFHLEVBQUU7WUFDVixNQUFNLFlBQVksR0FBRyxxRkFBcUYsWUFBWSxFQUFFLENBQUM7WUFDekgsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFlBQVksSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBRXRDLE9BQU87Z0JBQ0gsWUFBWSxFQUFFLFlBQVk7Z0JBQzFCLFNBQVMsRUFBRSxvQ0FBbUIsQ0FBQyxlQUFlO2FBQ2pELENBQUM7U0FDTDtJQUNMLENBQUM7Q0FDSjtBQXQ0Q0Qsd0NBczRDQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7QmFzZUFQSUNsaWVudH0gZnJvbSBcIi4vQmFzZUFQSUNsaWVudFwiO1xuaW1wb3J0IHtDb25zdGFudHN9IGZyb20gXCIuLi9Db25zdGFudHNcIjtcbmltcG9ydCB7XG4gICAgQ2FyZExpbmtFcnJvclR5cGUsXG4gICAgQ3JlYXRlTm90aWZpY2F0aW9uSW5wdXQsXG4gICAgQ3JlYXRlTm90aWZpY2F0aW9uUmVzcG9uc2UsXG4gICAgQ3JlYXRlVHJhbnNhY3Rpb25JbnB1dCxcbiAgICBFbGlnaWJsZUxpbmtlZFVzZXIsXG4gICAgRWxpZ2libGVMaW5rZWRVc2Vyc1Jlc3BvbnNlLFxuICAgIEVtYWlsRnJvbUNvZ25pdG9SZXNwb25zZSxcbiAgICBHZXREZXZpY2VzRm9yVXNlcklucHV0LFxuICAgIEdldFRyYW5zYWN0aW9uQnlTdGF0dXNJbnB1dCxcbiAgICBHZXRUcmFuc2FjdGlvbklucHV0LFxuICAgIE1pbGl0YXJ5VmVyaWZpY2F0aW9uRXJyb3JUeXBlLFxuICAgIE1pbGl0YXJ5VmVyaWZpY2F0aW9uTm90aWZpY2F0aW9uVXBkYXRlLFxuICAgIE1vb25iZWFtVHJhbnNhY3Rpb24sXG4gICAgTW9vbmJlYW1UcmFuc2FjdGlvbkJ5U3RhdHVzLFxuICAgIE1vb25iZWFtVHJhbnNhY3Rpb25SZXNwb25zZSxcbiAgICBNb29uYmVhbVRyYW5zYWN0aW9uc0J5U3RhdHVzUmVzcG9uc2UsXG4gICAgTW9vbmJlYW1UcmFuc2FjdGlvbnNSZXNwb25zZSxcbiAgICBNb29uYmVhbVVwZGF0ZWRUcmFuc2FjdGlvbixcbiAgICBNb29uYmVhbVVwZGF0ZWRUcmFuc2FjdGlvblJlc3BvbnNlLFxuICAgIE5vdGlmaWNhdGlvbixcbiAgICBOb3RpZmljYXRpb25SZW1pbmRlckVycm9yVHlwZSxcbiAgICBOb3RpZmljYXRpb25zRXJyb3JUeXBlLFxuICAgIFB1c2hEZXZpY2UsXG4gICAgVHJhbnNhY3Rpb25zRXJyb3JUeXBlLFxuICAgIFVwZGF0ZWRUcmFuc2FjdGlvbkV2ZW50LFxuICAgIFVwZGF0ZVRyYW5zYWN0aW9uSW5wdXQsIFVzZXJEZXRhaWxzRm9yTm90aWZpY2F0aW9uUmVtaW5kZXIsXG4gICAgVXNlckRldmljZUVycm9yVHlwZSxcbiAgICBVc2VyRGV2aWNlc1Jlc3BvbnNlLFxuICAgIFVzZXJGb3JOb3RpZmljYXRpb25SZW1pbmRlclJlc3BvbnNlXG59IGZyb20gXCIuLi9HcmFwaHFsRXhwb3J0c1wiO1xuaW1wb3J0IGF4aW9zIGZyb20gXCJheGlvc1wiO1xuaW1wb3J0IHtjcmVhdGVOb3RpZmljYXRpb24sIGNyZWF0ZVRyYW5zYWN0aW9uLCB1cGRhdGVUcmFuc2FjdGlvbn0gZnJvbSBcIi4uLy4uL2dyYXBocWwvbXV0YXRpb25zL011dGF0aW9uc1wiO1xuaW1wb3J0IHtcbiAgICBnZXREZXZpY2VzRm9yVXNlcixcbiAgICBnZXRFbGlnaWJsZUxpbmtlZFVzZXJzLFxuICAgIGdldFRyYW5zYWN0aW9uLFxuICAgIGdldFRyYW5zYWN0aW9uQnlTdGF0dXNcbn0gZnJvbSBcIi4uLy4uL2dyYXBocWwvcXVlcmllcy9RdWVyaWVzXCI7XG5pbXBvcnQge0FQSUdhdGV3YXlQcm94eVJlc3VsdH0gZnJvbSBcImF3cy1sYW1iZGEvdHJpZ2dlci9hcGktZ2F0ZXdheS1wcm94eVwiO1xuaW1wb3J0IHtcbiAgICBDb2duaXRvSWRlbnRpdHlQcm92aWRlckNsaWVudCxcbiAgICBMaXN0VXNlcnNDb21tYW5kLFxuICAgIExpc3RVc2Vyc0NvbW1hbmRJbnB1dCxcbiAgICBMaXN0VXNlcnNDb21tYW5kT3V0cHV0LFxuICAgIFVzZXJUeXBlXG59IGZyb20gXCJAYXdzLXNkay9jbGllbnQtY29nbml0by1pZGVudGl0eS1wcm92aWRlclwiO1xuXG4vKipcbiAqIENsYXNzIHVzZWQgYXMgdGhlIGJhc2UvZ2VuZXJpYyBjbGllbnQgZm9yIGFsbCBNb29uYmVhbSBpbnRlcm5hbCBBcHBTeW5jXG4gKiBhbmQvb3IgQVBJIEdhdGV3YXkgQVBJcy5cbiAqL1xuZXhwb3J0IGNsYXNzIE1vb25iZWFtQ2xpZW50IGV4dGVuZHMgQmFzZUFQSUNsaWVudCB7XG5cbiAgICAvKipcbiAgICAgKiBHZW5lcmljIGNvbnN0cnVjdG9yIGZvciB0aGUgY2xpZW50LlxuICAgICAqXG4gICAgICogQHBhcmFtIGVudmlyb25tZW50IHRoZSBBV1MgZW52aXJvbm1lbnQgcGFzc2VkIGluIGZyb20gdGhlIExhbWJkYSByZXNvbHZlci5cbiAgICAgKiBAcGFyYW0gcmVnaW9uIHRoZSBBV1MgcmVnaW9uIHBhc3NlZCBpbiBmcm9tIHRoZSBMYW1iZGEgcmVzb2x2ZXIuXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZW52aXJvbm1lbnQ6IHN0cmluZywgcmVnaW9uOiBzdHJpbmcpIHtcbiAgICAgICAgc3VwZXIocmVnaW9uLCBlbnZpcm9ubWVudCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdXNlZCB0byBnZXQgYWxsIHVzZXJzJyBlbWFpbHMgYW5kIGN1c3RvbSB1c2VyIElEcyBmcm9tIENvZ25pdG8uXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBhIHtAbGluayBVc2VyRm9yTm90aWZpY2F0aW9uUmVtaW5kZXJSZXNwb25zZX0sIHJlcHJlc2VudGluZyBlYWNoIGluZGl2aWR1YWwgdXNlcnMnXG4gICAgICogdXNlciBJRCBhbmQgZW1haWwgYXR0cmlidXRlcy5cbiAgICAgKi9cbiAgICBhc3luYyBnZXRBbGxVc2Vyc0Zvck5vdGlmaWNhdGlvblJlbWluZGVycygpOiBQcm9taXNlPFVzZXJGb3JOb3RpZmljYXRpb25SZW1pbmRlclJlc3BvbnNlPiB7XG4gICAgICAgIC8vIGVhc2lseSBpZGVudGlmaWFibGUgQVBJIGVuZHBvaW50IGluZm9ybWF0aW9uXG4gICAgICAgIGNvbnN0IGVuZHBvaW50SW5mbyA9ICcvbGlzdFVzZXJzIGZvciBnZXRBbGxVc2Vyc0Zvck5vdGlmaWNhdGlvblJlbWluZGVyIENvZ25pdG8gU0RLIGNhbGwnO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgQ29nbml0byBhY2Nlc3Mga2V5LCBzZWNyZXQga2V5IGFuZCB1c2VyIHBvb2wgaWQsIG5lZWRlZCBpbiBvcmRlciB0byByZXRyaWV2ZSBhbGwgdXNlcnMgdGhyb3VnaCB0aGUgQ29nbml0byBJZGVudGl0eSBwcm92aWRlciBjbGllbnRcbiAgICAgICAgICAgIGNvbnN0IFtjb2duaXRvQWNjZXNzS2V5SWQsIGNvZ25pdG9TZWNyZXRLZXksIGNvZ25pdG9Vc2VyUG9vbElkXSA9IGF3YWl0IHN1cGVyLnJldHJpZXZlU2VydmljZUNyZWRlbnRpYWxzKENvbnN0YW50cy5BV1NQYWlyQ29uc3RhbnRzLk1PT05CRUFNX0lOVEVSTkFMX1NFQ1JFVF9OQU1FLFxuICAgICAgICAgICAgICAgIHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIHRydWUpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgd2Ugb2J0YWluZWQgYW55IGludmFsaWQgc2VjcmV0IHZhbHVlcyBmcm9tIHRoZSBjYWxsIGFib3ZlXG4gICAgICAgICAgICBpZiAoY29nbml0b0FjY2Vzc0tleUlkID09PSBudWxsIHx8IGNvZ25pdG9BY2Nlc3NLZXlJZC5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBjb2duaXRvU2VjcmV0S2V5ID09PSBudWxsIHx8IGNvZ25pdG9TZWNyZXRLZXkubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgY29nbml0b1VzZXJQb29sSWQgPT09IG51bGwgfHwgKGNvZ25pdG9Vc2VyUG9vbElkICYmIGNvZ25pdG9Vc2VyUG9vbElkLmxlbmd0aCA9PT0gMCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBcIkludmFsaWQgU2VjcmV0cyBvYnRhaW5lZCBmb3IgQ29nbml0byBTREsgY2FsbCBjYWxsIVwiO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25SZW1pbmRlckVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBpbml0aWFsaXplIHRoZSBDb2duaXRvIElkZW50aXR5IFByb3ZpZGVyIGNsaWVudCB1c2luZyB0aGUgY3JlZGVudGlhbHMgb2J0YWluZWQgYWJvdmVcbiAgICAgICAgICAgIGNvbnN0IGNvZ25pdG9JZGVudGl0eVByb3ZpZGVyQ2xpZW50ID0gbmV3IENvZ25pdG9JZGVudGl0eVByb3ZpZGVyQ2xpZW50KHtcbiAgICAgICAgICAgICAgICByZWdpb246IHRoaXMucmVnaW9uLFxuICAgICAgICAgICAgICAgIGNyZWRlbnRpYWxzOiB7XG4gICAgICAgICAgICAgICAgICAgIGFjY2Vzc0tleUlkOiBjb2duaXRvQWNjZXNzS2V5SWQsXG4gICAgICAgICAgICAgICAgICAgIHNlY3JldEFjY2Vzc0tleTogY29nbml0b1NlY3JldEtleVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIGV4ZWN1dGUgdGhldyBMaXN0IFVzZXJzIGNvbW1hbmQsIHdpdGhvdXQgYW55IGZpbHRlcnMsIGluIG9yZGVyIHRvIHJldHJpZXZlIGEgdXNlcidzIGVtYWlsIGFuZCB0aGVpclxuICAgICAgICAgICAgICogY3VzdG9tIHVzZXIgSUQsIGZyb20gdGhlaXIgYXR0cmlidXRlcy5cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBUaGVzZSByZXN1bHRzIGFyZSBnb2luZyB0byBiZSBwYWdpbmF0ZWQsIHNvIHdlIHdpbGwgbGltaXQgdGhlIHBhZ2Ugc2l6ZSB0byA2MCB1c2VycyAobWF4aW11bSBhbGxvd2VkIHRocm91Z2ggdGhpc1xuICAgICAgICAgICAgICogY2FsbCksIGFuZCBrZWVwIHRyYWNrIG9mIHRoZSBudW1iZXIgb2YgcGFnZXMgYW5kIGxhY2sgdGhlcmVvZiwgdGhyb3VnaCBhIGZsYWcuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGNvbnN0IHVzZXJSZXN1bHRzOiBVc2VyVHlwZVtdID0gW107XG4gICAgICAgICAgICBsZXQgbGFzdFBhZ2luYXRpb25Ub2tlbjogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgICAgICAgICAgbGV0IGlucHV0OiBMaXN0VXNlcnNDb21tYW5kSW5wdXQgPSB7XG4gICAgICAgICAgICAgICAgVXNlclBvb2xJZDogY29nbml0b1VzZXJQb29sSWQsXG4gICAgICAgICAgICAgICAgQXR0cmlidXRlc1RvR2V0OiBbJ2VtYWlsJywgJ2N1c3RvbTp1c2VySWQnXSxcbiAgICAgICAgICAgICAgICBMaW1pdDogNjAsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgLy8ga2VlcCBnZXR0aW5nIHVzZXJzIGFuZCB1cGRhdGluZyB0aGUgcmVzdWx0cyBhcnJheSBmb3IgdXNlcnMgcmV0cmlldmVkLCB1bnRpbCB3ZSBydW4gb3V0IG9mIHVzZXJzIHRvIHJldHJpZXZlXG4gICAgICAgICAgICBkbyB7XG4gICAgICAgICAgICAgICAgLy8gZXhlY3V0ZSB0aGUgTGlzdCBVc2VycyBjb21tYW5kLCBnaXZlbiB0aGUgaW5wdXQgcHJvdmlkZWQgYWJvdmVcbiAgICAgICAgICAgICAgICBjb25zdCBsaXN0VXNlcnNSZXNwb25zZTogTGlzdFVzZXJzQ29tbWFuZE91dHB1dCA9IGF3YWl0IGNvZ25pdG9JZGVudGl0eVByb3ZpZGVyQ2xpZW50LnNlbmQoXG4gICAgICAgICAgICAgICAgICAgIG5ldyBMaXN0VXNlcnNDb21tYW5kKGlucHV0KVxuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiBjaGVjayB3aGV0aGVyIHRoZSBMaXN0IFVzZXJzIENvbW1hbmQgaGFzIGEgdmFsaWQgcmVzcG9uc2UvIHZhbGlkIGxpc3Qgb2YgdXNlcnMgdG8gYmUgcmV0dXJuZWQsXG4gICAgICAgICAgICAgICAgICogYW5kIGlmIHNvIGFkZCBpbiB0aGUgcmVzdWx0aW5nIGxpc3QgYWNjb3JkaW5nbHkuXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgbGlzdFVzZXJzUmVzcG9uc2UuJG1ldGFkYXRhICE9PSBudWxsICYmIGxpc3RVc2Vyc1Jlc3BvbnNlLiRtZXRhZGF0YS5odHRwU3RhdHVzQ29kZSAhPT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgIGxpc3RVc2Vyc1Jlc3BvbnNlLiRtZXRhZGF0YS5odHRwU3RhdHVzQ29kZSAhPT0gdW5kZWZpbmVkICYmIGxpc3RVc2Vyc1Jlc3BvbnNlLiRtZXRhZGF0YS5odHRwU3RhdHVzQ29kZSA9PT0gMjAwICYmXG4gICAgICAgICAgICAgICAgbGlzdFVzZXJzUmVzcG9uc2UuVXNlcnMgIT09IG51bGwgJiYgbGlzdFVzZXJzUmVzcG9uc2UuVXNlcnMgIT09IHVuZGVmaW5lZCAmJiBsaXN0VXNlcnNSZXNwb25zZS5Vc2VycyEubGVuZ3RoICE9PSAwICYmXG4gICAgICAgICAgICAgICAgdXNlclJlc3VsdHMucHVzaCguLi5saXN0VXNlcnNSZXNwb25zZS5Vc2Vycyk7XG5cbiAgICAgICAgICAgICAgICAvLyBnZXQgdGhlIGxhc3QgcGFnaW5hdGlvbiB0b2tlbiBmcm9tIHRoZSByZXRyaWV2ZWQgb3V0cHV0LCBhbmQgc2V0IHRoZSBuZXh0IGlucHV0IGNvbW1hbmQncyBwYWdpbmF0aW9uIHRva2VuIGFjY29yZGluZyB0byB0aGF0XG4gICAgICAgICAgICAgICAgbGFzdFBhZ2luYXRpb25Ub2tlbiA9IGxpc3RVc2Vyc1Jlc3BvbnNlLlBhZ2luYXRpb25Ub2tlbjtcbiAgICAgICAgICAgICAgICBpbnB1dC5QYWdpbmF0aW9uVG9rZW4gPSBsYXN0UGFnaW5hdGlvblRva2VuO1xuICAgICAgICAgICAgfSB3aGlsZSAodHlwZW9mIGxhc3RQYWdpbmF0aW9uVG9rZW4gIT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgbGFzdFBhZ2luYXRpb25Ub2tlbiAhPT0gJ3VuZGVmaW5lZCcgJiYgbGFzdFBhZ2luYXRpb25Ub2tlbiAhPT0gdW5kZWZpbmVkKTtcblxuICAgICAgICAgICAgLy8gY2hlY2sgZm9yIGEgdmFsaWQgcmVzcG9uc2UgbGlzdCwgb2J0YWluZWQgZnJvbSB0aGUgQ29nbml0byBMaXN0IFVzZXJzIENvbW1hbmQgY2FsbFxuICAgICAgICAgICAgaWYgKHVzZXJSZXN1bHRzLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgICAgIC8vIGxvb3AgdGhyb3VnaCB0aGUgbGlzdCBvZiB1c2VycyBvYnRhaW5lZCB0aHJvdWdoIGNvbW1hbmQsIGFuZCByZXR1cm4gdGhlaXIgZW1haWxzIGFuZCBjdXN0b20gdXNlciBJRHNcbiAgICAgICAgICAgICAgICBjb25zdCB1c2VyRGV0YWlsc0Zvck5vdGlmaWNhdGlvblJlbWluZGVyOiBVc2VyRGV0YWlsc0Zvck5vdGlmaWNhdGlvblJlbWluZGVyW10gPSBbXTtcbiAgICAgICAgICAgICAgICB1c2VyUmVzdWx0cy5mb3JFYWNoKGNvZ25pdG9Vc2VyID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvZ25pdG9Vc2VyLkF0dHJpYnV0ZXMgIT09IHVuZGVmaW5lZCAmJiBjb2duaXRvVXNlci5BdHRyaWJ1dGVzIS5sZW5ndGggPT09IDIgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZ25pdG9Vc2VyLkF0dHJpYnV0ZXMhWzBdICE9PSB1bmRlZmluZWQgJiYgY29nbml0b1VzZXIuQXR0cmlidXRlcyFbMF0uVmFsdWUhLmxlbmd0aCAhPT0gMCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgY29nbml0b1VzZXIuQXR0cmlidXRlcyFbMV0gIT09IHVuZGVmaW5lZCAmJiBjb2duaXRvVXNlci5BdHRyaWJ1dGVzIVsxXS5WYWx1ZSEubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBwdXNoIHRoZSBuZXcgdXNlciBkZXRhaWxzIGluIHRoZSB1c2VyIGRldGFpbHMgYXJyYXkgdG8gYmUgcmV0dXJuZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJEZXRhaWxzRm9yTm90aWZpY2F0aW9uUmVtaW5kZXIucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNvZ25pdG9Vc2VyLkF0dHJpYnV0ZXMhWzFdLlZhbHVlISxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbWFpbDogY29nbml0b1VzZXIuQXR0cmlidXRlcyFbMF0uVmFsdWUhXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIC8vIGVuc3VyZSB0aGF0IHRoZSBzaXplIG9mIHRoZSBsaXN0IG9mIHVzZXIgZGV0YWlscyB0byBiZSByZXR1cm5lZCwgbWF0Y2hlcyB0aGUgbnVtYmVyIG9mIHVzZXJzIHJldHJpZXZlZCB0aHJvdWdoIHRoZSBMaXN0IFVzZXJzIENvbW1hbmRcbiAgICAgICAgICAgICAgICBpZiAodXNlckRldGFpbHNGb3JOb3RpZmljYXRpb25SZW1pbmRlci5sZW5ndGggPT09IHVzZXJSZXN1bHRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIHJlc3VsdHMgYXBwcm9wcmlhdGVseVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogdXNlckRldGFpbHNGb3JOb3RpZmljYXRpb25SZW1pbmRlclxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVzZXIgZGV0YWlsIGxpc3QgbGVuZ3RoIGRvZXMgbm90IG1hdGNoIHRoZSByZXRyaWV2ZWQgdXNlciBsaXN0YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfWApO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25SZW1pbmRlckVycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYEludmFsaWQvRW1wdHkgdXNlciBsaXN0IGFycmF5LCBvYnRhaW5lZCB3aGlsZSBjYWxsaW5nIHRoZSBnZXQgTGlzdCBVc2VycyBDb2duaXRvIGNvbW1hbmRgO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX1gKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uUmVtaW5kZXJFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yLFxuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgcmV0cmlldmluZyBlbWFpbCBhbmQgY3VzdG9tIGlkIGZvciBub3RpZmljYXRpb24gcmVtaW5kZXJzIGZvciB1c2VycywgZnJvbSBDb2duaXRvIHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJ9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvblJlbWluZGVyRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvcixcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHVzZWQgdG8gZ2V0IGEgdXNlcidzIGVtYWlsLCBnaXZlbiBjZXJ0YWluIGZpbHRlcnMgdG8gYmUgcGFzc2VkIGluLlxuICAgICAqXG4gICAgICogQHBhcmFtIG1pbGl0YXJ5VmVyaWZpY2F0aW9uTm90aWZpY2F0aW9uVXBkYXRlIHRoZSBtaWxpdGFyeSB2ZXJpZmljYXRpb24gbm90aWZpY2F0aW9uIHVwZGF0ZVxuICAgICAqIG9iamVjdHMsIHVzZWQgdG8gZmlsdGVyIHRocm91Z2ggdGhlIENvZ25pdG8gdXNlciBwb29sLCBpbiBvcmRlciB0byBvYnRhaW4gYSB1c2VyJ3MgZW1haWwuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBhIHtAbGluayBFbWFpbEZyb21Db2duaXRvUmVzcG9uc2V9IHJlcHJlc2VudGluZyB0aGUgdXNlcidzIGVtYWlsIG9idGFpbmVkXG4gICAgICogZnJvbSBDb2duaXRvLlxuICAgICAqL1xuICAgIGFzeW5jIGdldEVtYWlsRm9yVXNlcihtaWxpdGFyeVZlcmlmaWNhdGlvbk5vdGlmaWNhdGlvblVwZGF0ZTogTWlsaXRhcnlWZXJpZmljYXRpb25Ob3RpZmljYXRpb25VcGRhdGUpOiBQcm9taXNlPEVtYWlsRnJvbUNvZ25pdG9SZXNwb25zZT4ge1xuICAgICAgICAvLyBlYXNpbHkgaWRlbnRpZmlhYmxlIEFQSSBlbmRwb2ludCBpbmZvcm1hdGlvblxuICAgICAgICBjb25zdCBlbmRwb2ludEluZm8gPSAnL2xpc3RVc2VycyBmb3IgZ2V0RW1haWxGb3JVc2VyIENvZ25pdG8gU0RLIGNhbGwnO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgQ29nbml0byBhY2Nlc3Mga2V5LCBzZWNyZXQga2V5IGFuZCB1c2VyIHBvb2wgaWQsIG5lZWRlZCBpbiBvcmRlciB0byByZXRyaWV2ZSB0aGUgdXNlciBlbWFpbCB0aHJvdWdoIHRoZSBDb2duaXRvIElkZW50aXR5IHByb3ZpZGVyIGNsaWVudFxuICAgICAgICAgICAgY29uc3QgW2NvZ25pdG9BY2Nlc3NLZXlJZCwgY29nbml0b1NlY3JldEtleSwgY29nbml0b1VzZXJQb29sSWRdID0gYXdhaXQgc3VwZXIucmV0cmlldmVTZXJ2aWNlQ3JlZGVudGlhbHMoQ29uc3RhbnRzLkFXU1BhaXJDb25zdGFudHMuTU9PTkJFQU1fSU5URVJOQUxfU0VDUkVUX05BTUUsXG4gICAgICAgICAgICAgICAgdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgdHJ1ZSk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB3ZSBvYnRhaW5lZCBhbnkgaW52YWxpZCBzZWNyZXQgdmFsdWVzIGZyb20gdGhlIGNhbGwgYWJvdmVcbiAgICAgICAgICAgIGlmIChjb2duaXRvQWNjZXNzS2V5SWQgPT09IG51bGwgfHwgY29nbml0b0FjY2Vzc0tleUlkLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIGNvZ25pdG9TZWNyZXRLZXkgPT09IG51bGwgfHwgY29nbml0b1NlY3JldEtleS5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBjb2duaXRvVXNlclBvb2xJZCA9PT0gbnVsbCB8fCAoY29nbml0b1VzZXJQb29sSWQgJiYgY29nbml0b1VzZXJQb29sSWQubGVuZ3RoID09PSAwKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IFwiSW52YWxpZCBTZWNyZXRzIG9idGFpbmVkIGZvciBDb2duaXRvIFNESyBjYWxsIGNhbGwhXCI7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gaW5pdGlhbGl6ZSB0aGUgQ29nbml0byBJZGVudGl0eSBQcm92aWRlciBjbGllbnQgdXNpbmcgdGhlIGNyZWRlbnRpYWxzIG9idGFpbmVkIGFib3ZlXG4gICAgICAgICAgICBjb25zdCBjb2duaXRvSWRlbnRpdHlQcm92aWRlckNsaWVudCA9IG5ldyBDb2duaXRvSWRlbnRpdHlQcm92aWRlckNsaWVudCh7XG4gICAgICAgICAgICAgICAgcmVnaW9uOiB0aGlzLnJlZ2lvbixcbiAgICAgICAgICAgICAgICBjcmVkZW50aWFsczoge1xuICAgICAgICAgICAgICAgICAgICBhY2Nlc3NLZXlJZDogY29nbml0b0FjY2Vzc0tleUlkLFxuICAgICAgICAgICAgICAgICAgICBzZWNyZXRBY2Nlc3NLZXk6IGNvZ25pdG9TZWNyZXRLZXlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBleGVjdXRlIHRoZSBMaXN0IFVzZXJzIGNvbW1hbmQsIHVzaW5nIGZpbHRlcnMsIGluIG9yZGVyIHRvIHJldHJpZXZlIGEgdXNlcidzIGVtYWlsIGZyb20gdGhlaXIgYXR0cmlidXRlcy5cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBSZXRyaWV2ZSB0aGUgdXNlciBieSB0aGVpciBmYW1pbHlfbmFtZS4gSWYgdGhlcmUgYXJlIGlzIG1vcmUgdGhhbiAxIG1hdGNoIHJldHVybmVkLCB0aGVuIHdlIHdpbGwgbWF0Y2hcbiAgICAgICAgICAgICAqIHRoZSB1c2VyIGJhc2VkIG9uIHRoZWlyIHVuaXF1ZSBpZCwgZnJvbSB0aGUgY3VzdG9tOnVzZXJJZCBhdHRyaWJ1dGVcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgY29uc3QgbGlzdFVzZXJzUmVzcG9uc2U6IExpc3RVc2Vyc0NvbW1hbmRPdXRwdXQgPSBhd2FpdCBjb2duaXRvSWRlbnRpdHlQcm92aWRlckNsaWVudC5zZW5kKG5ldyBMaXN0VXNlcnNDb21tYW5kKHtcbiAgICAgICAgICAgICAgICBVc2VyUG9vbElkOiBjb2duaXRvVXNlclBvb2xJZCxcbiAgICAgICAgICAgICAgICBBdHRyaWJ1dGVzVG9HZXQ6IFsnZW1haWwnLCAnY3VzdG9tOnVzZXJJZCddLFxuICAgICAgICAgICAgICAgIEZpbHRlcjogYGZhbWlseV9uYW1lPSBcIiR7YCR7bWlsaXRhcnlWZXJpZmljYXRpb25Ob3RpZmljYXRpb25VcGRhdGUubGFzdE5hbWV9YC5yZXBsYWNlQWxsKFwiXFxcIlwiLCBcIlxcXFxcXFwiXCIpfVwiYFxuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgLy8gY2hlY2sgZm9yIGEgdmFsaWQgcmVzcG9uc2UgZnJvbSB0aGUgQ29nbml0byBMaXN0IFVzZXJzIENvbW1hbmQgY2FsbFxuICAgICAgICAgICAgaWYgKGxpc3RVc2Vyc1Jlc3BvbnNlICE9PSBudWxsICYmIGxpc3RVc2Vyc1Jlc3BvbnNlLiRtZXRhZGF0YSAhPT0gbnVsbCAmJiBsaXN0VXNlcnNSZXNwb25zZS4kbWV0YWRhdGEuaHR0cFN0YXR1c0NvZGUgIT09IG51bGwgJiZcbiAgICAgICAgICAgICAgICBsaXN0VXNlcnNSZXNwb25zZS4kbWV0YWRhdGEuaHR0cFN0YXR1c0NvZGUgIT09IHVuZGVmaW5lZCAmJiBsaXN0VXNlcnNSZXNwb25zZS4kbWV0YWRhdGEuaHR0cFN0YXR1c0NvZGUgPT09IDIwMCAmJlxuICAgICAgICAgICAgICAgIGxpc3RVc2Vyc1Jlc3BvbnNlLlVzZXJzICE9PSBudWxsICYmIGxpc3RVc2Vyc1Jlc3BvbnNlLlVzZXJzICE9PSB1bmRlZmluZWQgJiYgbGlzdFVzZXJzUmVzcG9uc2UuVXNlcnMhLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgICAgIC8vIElmIHRoZXJlIGFyZSBpcyBtb3JlIHRoYW4gMSBtYXRjaCByZXR1cm5lZCwgdGhlbiB3ZSB3aWxsIG1hdGNoIHRoZSB1c2VyIGJhc2VkIG9uIHRoZWlyIHVuaXF1ZSBpZCwgZnJvbSB0aGUgY3VzdG9tOnVzZXJJZCBhdHRyaWJ1dGVcbiAgICAgICAgICAgICAgICBsZXQgaW52YWxpZEF0dHJpYnV0ZXNGbGFnID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgbGlzdFVzZXJzUmVzcG9uc2UuVXNlcnMuZm9yRWFjaChjb2duaXRvVXNlciA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb2duaXRvVXNlci5BdHRyaWJ1dGVzID09PSBudWxsIHx8IGNvZ25pdG9Vc2VyLkF0dHJpYnV0ZXMgPT09IHVuZGVmaW5lZCB8fCBjb2duaXRvVXNlci5BdHRyaWJ1dGVzLmxlbmd0aCAhPT0gMikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW52YWxpZEF0dHJpYnV0ZXNGbGFnID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIC8vIGNoZWNrIGZvciB2YWxpZCB1c2VyIGF0dHJpYnV0ZXNcbiAgICAgICAgICAgICAgICBpZiAoIWludmFsaWRBdHRyaWJ1dGVzRmxhZykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbWF0Y2hlZEVtYWlsOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5vT2ZNYXRjaGVzID0gMDtcbiAgICAgICAgICAgICAgICAgICAgbGlzdFVzZXJzUmVzcG9uc2UuVXNlcnMuZm9yRWFjaChjb2duaXRvVXNlciA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29nbml0b1VzZXIuQXR0cmlidXRlcyFbMV0uVmFsdWUhLnRyaW0oKSA9PT0gbWlsaXRhcnlWZXJpZmljYXRpb25Ob3RpZmljYXRpb25VcGRhdGUuaWQudHJpbSgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2hlZEVtYWlsID0gY29nbml0b1VzZXIuQXR0cmlidXRlcyFbMF0uVmFsdWUhO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vT2ZNYXRjaGVzICs9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBpZiAobm9PZk1hdGNoZXMgPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogbWF0Y2hlZEVtYWlsXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgQ291bGRuJ3QgZmluZCB1c2VyIGluIENvZ25pdG8gZm9yICR7bWlsaXRhcnlWZXJpZmljYXRpb25Ob3RpZmljYXRpb25VcGRhdGUuaWR9YDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX1gKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgSW52YWxpZCB1c2VyIGF0dHJpYnV0ZXMgb2J0YWluZWRgO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9YCk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBJbnZhbGlkIHN0cnVjdHVyZSBvYnRhaW5lZCB3aGlsZSBjYWxsaW5nIHRoZSBnZXQgTGlzdCBVc2VycyBDb2duaXRvIGNvbW1hbmRgO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX1gKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3IsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSByZXRyaWV2aW5nIGVtYWlsIGZvciB1c2VyIGZyb20gQ29nbml0byB0aHJvdWdoICR7ZW5kcG9pbnRJbmZvfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9ICR7ZXJyfWApO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvcixcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdXNlZCB0byBzZW5kIGEgbmV3IG1pbGl0YXJ5IHZlcmlmaWNhdGlvbiBzdGF0dXMgYWNrbm93bGVkZ21lbnQsIHNvIHdlIGNhbiBraWNrLXN0YXJ0IHRoZSBtaWxpdGFyeSB2ZXJpZmljYXRpb25cbiAgICAgKiBzdGF0dXMgdXBkYXRlIG5vdGlmaWNhdGlvbiBwcm9jZXNzIHRocm91Z2ggdGhlIHByb2R1Y2VyLlxuICAgICAqXG4gICAgICogQHBhcmFtIG1pbGl0YXJ5VmVyaWZpY2F0aW9uTm90aWZpY2F0aW9uVXBkYXRlIG1pbGl0YXJ5IHZlcmlmaWNhdGlvbiB1cGRhdGUgb2JqZWN0XG4gICAgICpcbiAgICAgKiBAcmV0dXJuIGEge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBBUElHYXRld2F5UHJveHlSZXN1bHR9IHJlcHJlc2VudGluZyB0aGUgQVBJIEdhdGV3YXkgcmVzdWx0XG4gICAgICogc2VudCBieSB0aGUgbWlsaXRhcnkgdmVyaWZpY2F0aW9uIHVwZGF0ZSBwcm9kdWNlciBMYW1iZGEsIHRvIHZhbGlkYXRlIHdoZXRoZXIgdGhlIG1pbGl0YXJ5IHZlcmlmaWNhdGlvblxuICAgICAqIG5vdGlmaWNhdGlvbiB1cGRhdGUgcHJvY2VzcyBraWNrLXN0YXJ0ZWQgb3Igbm90XG4gICAgICovXG4gICAgYXN5bmMgbWlsaXRhcnlWZXJpZmljYXRpb25VcGRhdGVzQWNrbm93bGVkZ21lbnQobWlsaXRhcnlWZXJpZmljYXRpb25Ob3RpZmljYXRpb25VcGRhdGU6IE1pbGl0YXJ5VmVyaWZpY2F0aW9uTm90aWZpY2F0aW9uVXBkYXRlKTogUHJvbWlzZTxBUElHYXRld2F5UHJveHlSZXN1bHQ+IHtcbiAgICAgICAgLy8gZWFzaWx5IGlkZW50aWZpYWJsZSBBUEkgZW5kcG9pbnQgaW5mb3JtYXRpb25cbiAgICAgICAgY29uc3QgZW5kcG9pbnRJbmZvID0gJ1BPU1QgL21pbGl0YXJ5VmVyaWZpY2F0aW9uVXBkYXRlc0Fja25vd2xlZGdtZW50IE1vb25iZWFtIFJFU1QgQVBJJztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIEFQSSBLZXkgYW5kIEJhc2UgVVJMLCBuZWVkZWQgaW4gb3JkZXIgdG8gbWFrZSB0aGUgbWlsaXRhcnkgc3RhdHVzIHVwZGF0ZXMgYWNrbm93bGVkZ21lbnQgY2FsbCB0aHJvdWdoIHRoZSBjbGllbnRcbiAgICAgICAgICAgIGNvbnN0IFttb29uYmVhbUJhc2VVUkwsIG1vb25iZWFtUHJpdmF0ZUtleV0gPSBhd2FpdCBzdXBlci5yZXRyaWV2ZVNlcnZpY2VDcmVkZW50aWFscyhDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5NT09OQkVBTV9JTlRFUk5BTF9TRUNSRVRfTkFNRSwgdHJ1ZSk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB3ZSBvYnRhaW5lZCBhbnkgaW52YWxpZCBzZWNyZXQgdmFsdWVzIGZyb20gdGhlIGNhbGwgYWJvdmVcbiAgICAgICAgICAgIGlmIChtb29uYmVhbUJhc2VVUkwgPT09IG51bGwgfHwgbW9vbmJlYW1CYXNlVVJMLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG1vb25iZWFtUHJpdmF0ZUtleSA9PT0gbnVsbCB8fCBtb29uYmVhbVByaXZhdGVLZXkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gXCJJbnZhbGlkIFNlY3JldHMgb2J0YWluZWQgZm9yIE1vb25iZWFtIFJFU1QgQVBJIGNhbGwhXCI7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1c0NvZGU6IDUwMCxcbiAgICAgICAgICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTWlsaXRhcnlWZXJpZmljYXRpb25FcnJvclR5cGUuVW5leHBlY3RlZEVycm9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFBPU1QgL21pbGl0YXJ5VmVyaWZpY2F0aW9uVXBkYXRlc0Fja25vd2xlZGdtZW50XG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogYnVpbGQgdGhlIGludGVybmFsIE1vb25iZWFtIEFQSSByZXF1ZXN0IGJvZHkgdG8gYmUgcGFzc2VkIGluLCBhbmQgcGVyZm9ybSBhIFBPU1QgdG8gaXQgd2l0aCB0aGUgYXBwcm9wcmlhdGUgaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAqIHdlIGltcGx5IHRoYXQgaWYgdGhlIEFQSSBkb2VzIG5vdCByZXNwb25kIGluIDE1IHNlY29uZHMsIHRoZW4gd2UgYXV0b21hdGljYWxseSBjYXRjaCB0aGF0LCBhbmQgcmV0dXJuIGFuXG4gICAgICAgICAgICAgKiBlcnJvciBmb3IgYSBiZXR0ZXIgY3VzdG9tZXIgZXhwZXJpZW5jZS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgY29uc29sZS5sb2coYE1vb25iZWFtIFJFU1QgQVBJIHJlcXVlc3QgT2JqZWN0OiAke0pTT04uc3RyaW5naWZ5KG1pbGl0YXJ5VmVyaWZpY2F0aW9uTm90aWZpY2F0aW9uVXBkYXRlKX1gKTtcbiAgICAgICAgICAgIHJldHVybiBheGlvcy5wb3N0KGAke21vb25iZWFtQmFzZVVSTH0vbWlsaXRhcnlWZXJpZmljYXRpb25VcGRhdGVzQWNrbm93bGVkZ21lbnRgLCBKU09OLnN0cmluZ2lmeShtaWxpdGFyeVZlcmlmaWNhdGlvbk5vdGlmaWNhdGlvblVwZGF0ZSksIHtcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgICAgICBcIngtYXBpLWtleVwiOiBtb29uYmVhbVByaXZhdGVLZXlcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDE1MDAwLCAvLyBpbiBtaWxsaXNlY29uZHMgaGVyZVxuICAgICAgICAgICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2U6ICdNb29uYmVhbSBSRVNUIEFQSSB0aW1lZCBvdXQgYWZ0ZXIgMTUwMDBtcyEnXG4gICAgICAgICAgICB9KS50aGVuKG1pbGl0YXJ5U3RhdHVzVXBkYXRlUmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShtaWxpdGFyeVN0YXR1c1VwZGF0ZVJlc3BvbnNlLmRhdGEpfWApO1xuXG4gICAgICAgICAgICAgICAgLy8gY2hlY2sgaWYgdGhlcmUgYXJlIGFueSBlcnJvcnMgaW4gdGhlIHJldHVybmVkIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgaWYgKG1pbGl0YXJ5U3RhdHVzVXBkYXRlUmVzcG9uc2UuZGF0YSAmJiBtaWxpdGFyeVN0YXR1c1VwZGF0ZVJlc3BvbnNlLmRhdGEuZGF0YSAhPT0gbnVsbFxuICAgICAgICAgICAgICAgICAgICAmJiAhbWlsaXRhcnlTdGF0dXNVcGRhdGVSZXNwb25zZS5kYXRhLmVycm9yTWVzc2FnZSAmJiAhbWlsaXRhcnlTdGF0dXNVcGRhdGVSZXNwb25zZS5kYXRhLmVycm9yVHlwZVxuICAgICAgICAgICAgICAgICAgICAmJiBtaWxpdGFyeVN0YXR1c1VwZGF0ZVJlc3BvbnNlLnN0YXR1cyA9PT0gMjAyKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHJldHVybmVkIHRoZSBtaWxpdGFyeSB2ZXJpZmljYXRpb24gdXBkYXRlIGFja25vd2xlZGdtZW50IHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXNDb2RlOiBtaWxpdGFyeVN0YXR1c1VwZGF0ZVJlc3BvbnNlLnN0YXR1cyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvZHk6IG1pbGl0YXJ5U3RhdHVzVXBkYXRlUmVzcG9uc2UuZGF0YS5kYXRhXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWlsaXRhcnlTdGF0dXNVcGRhdGVSZXNwb25zZS5kYXRhICYmIG1pbGl0YXJ5U3RhdHVzVXBkYXRlUmVzcG9uc2UuZGF0YS5lcnJvck1lc3NhZ2UgIT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICAmJiBtaWxpdGFyeVN0YXR1c1VwZGF0ZVJlc3BvbnNlLmRhdGEuZXJyb3JNZXNzYWdlICE9PSBudWxsID9cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgdHlwZSwgZnJvbSB0aGUgb3JpZ2luYWwgUkVTVCBBUEkgY2FsbFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1c0NvZGU6IG1pbGl0YXJ5U3RhdHVzVXBkYXRlUmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvZHk6IG1pbGl0YXJ5U3RhdHVzVXBkYXRlUmVzcG9uc2UuZGF0YS5lcnJvck1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gOlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBlcnJvciByZXNwb25zZSBpbmRpY2F0aW5nIGFuIGludmFsaWQgc3RydWN0dXJlIHJldHVybmVkXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzQ29kZTogNTAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgSW52YWxpZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UhYCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBNaWxpdGFyeVZlcmlmaWNhdGlvbkVycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IucmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGFuZCB0aGUgc2VydmVyIHJlc3BvbmRlZCB3aXRoIGEgc3RhdHVzIGNvZGVcbiAgICAgICAgICAgICAgICAgICAgICogdGhhdCBmYWxscyBvdXQgb2YgdGhlIHJhbmdlIG9mIDJ4eC5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBOb24gMnh4eCByZXNwb25zZSB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gTW9vbmJlYW0gUkVTVCBBUEksIHdpdGggc3RhdHVzICR7ZXJyb3IucmVzcG9uc2Uuc3RhdHVzfSwgYW5kIHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZXJyb3IucmVzcG9uc2UuZGF0YSl9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBhbnkgb3RoZXIgc3BlY2lmaWMgZXJyb3JzIHRvIGJlIGZpbHRlcmVkIGJlbG93XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXNDb2RlOiBlcnJvci5yZXNwb25zZS5zdGF0dXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IGVycm9yLnJlc3BvbnNlLmRhdGEuZXJyb3JUeXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3IucmVzcG9uc2UuZGF0YS5lcnJvck1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5yZXF1ZXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBidXQgbm8gcmVzcG9uc2Ugd2FzIHJlY2VpdmVkXG4gICAgICAgICAgICAgICAgICAgICAqIGBlcnJvci5yZXF1ZXN0YCBpcyBhbiBpbnN0YW5jZSBvZiBYTUxIdHRwUmVxdWVzdCBpbiB0aGUgYnJvd3NlciBhbmQgYW4gaW5zdGFuY2Ugb2ZcbiAgICAgICAgICAgICAgICAgICAgICogIGh0dHAuQ2xpZW50UmVxdWVzdCBpbiBub2RlLmpzLlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vIHJlc3BvbnNlIHJlY2VpdmVkIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBNb29uYmVhbSBBUEksIGZvciByZXF1ZXN0ICR7ZXJyb3IucmVxdWVzdH1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXNDb2RlOiA1MDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE1pbGl0YXJ5VmVyaWZpY2F0aW9uRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBTb21ldGhpbmcgaGFwcGVuZWQgaW4gc2V0dGluZyB1cCB0aGUgcmVxdWVzdCB0aGF0IHRyaWdnZXJlZCBhbiBFcnJvclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IGZvciB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgJHsoZXJyb3IgJiYgZXJyb3IubWVzc2FnZSkgJiYgZXJyb3IubWVzc2FnZX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXNDb2RlOiA1MDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE1pbGl0YXJ5VmVyaWZpY2F0aW9uRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBwb3N0aW5nIHRoZSBtaWxpdGFyeSB2ZXJpZmljYXRpb24gc3RhdHVzIGFja25vd2xlZGdtZW50IG9iamVjdCB0aHJvdWdoICR7ZW5kcG9pbnRJbmZvfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9ICR7ZXJyfWApO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHN0YXR1c0NvZGU6IDUwMCxcbiAgICAgICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTWlsaXRhcnlWZXJpZmljYXRpb25FcnJvclR5cGUuVW5leHBlY3RlZEVycm9yLFxuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdXNlZCB0byBzZW5kIGEgbmV3IHRyYW5zYWN0aW9uIGFja25vd2xlZGdtZW50LCBmb3IgYW4gdXBkYXRlZCB0cmFuc2FjdGlvbiwgc28gd2UgY2FuIGtpY2stc3RhcnQgdGhlXG4gICAgICogdHJhbnNhY3Rpb24gcHJvY2VzcyB0aHJvdWdoIHRoZSB0cmFuc2FjdGlvbiBwcm9kdWNlci5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB1cGRhdGVkVHJhbnNhY3Rpb25FdmVudCB1cGRhdGVkIHRyYW5zYWN0aW9uIGV2ZW50IHRvIGJlIHBhc3NlZCBpblxuICAgICAqXG4gICAgICogQHJldHVybiBhIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgQVBJR2F0ZXdheVByb3h5UmVzdWx0fSByZXByZXNlbnRpbmcgdGhlIEFQSSBHYXRld2F5IHJlc3VsdFxuICAgICAqIHNlbnQgYnkgdGhlIHJlaW1idXJzZW1lbnQgcHJvZHVjZXIgTGFtYmRhLCB0byB2YWxpZGF0ZSB3aGV0aGVyIHRoZSB0cmFuc2FjdGlvbnMgcHJvY2VzcyB3YXNcbiAgICAgKiBraWNrLXN0YXJ0ZWQgb3Igbm90LlxuICAgICAqL1xuICAgIGFzeW5jIHRyYW5zYWN0aW9uc0Fja25vd2xlZGdtZW50KHVwZGF0ZWRUcmFuc2FjdGlvbkV2ZW50OiBVcGRhdGVkVHJhbnNhY3Rpb25FdmVudCk6IFByb21pc2U8QVBJR2F0ZXdheVByb3h5UmVzdWx0PiB7XG4gICAgICAgIC8vIGVhc2lseSBpZGVudGlmaWFibGUgQVBJIGVuZHBvaW50IGluZm9ybWF0aW9uXG4gICAgICAgIGNvbnN0IGVuZHBvaW50SW5mbyA9ICdQT1NUIC90cmFuc2FjdGlvbnNBY2tub3dsZWRnbWVudCBNb29uYmVhbSBSRVNUIEFQSSc7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBBUEkgS2V5IGFuZCBCYXNlIFVSTCwgbmVlZGVkIGluIG9yZGVyIHRvIG1ha2UgdGhlIHRyYW5zYWN0aW9uIGFja25vd2xlZGdtZW50IGNhbGwgdGhyb3VnaCB0aGUgY2xpZW50XG4gICAgICAgICAgICBjb25zdCBbbW9vbmJlYW1CYXNlVVJMLCBtb29uYmVhbVByaXZhdGVLZXldID0gYXdhaXQgc3VwZXIucmV0cmlldmVTZXJ2aWNlQ3JlZGVudGlhbHMoQ29uc3RhbnRzLkFXU1BhaXJDb25zdGFudHMuTU9PTkJFQU1fSU5URVJOQUxfU0VDUkVUX05BTUUsIHRydWUpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgd2Ugb2J0YWluZWQgYW55IGludmFsaWQgc2VjcmV0IHZhbHVlcyBmcm9tIHRoZSBjYWxsIGFib3ZlXG4gICAgICAgICAgICBpZiAobW9vbmJlYW1CYXNlVVJMID09PSBudWxsIHx8IG1vb25iZWFtQmFzZVVSTC5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBtb29uYmVhbVByaXZhdGVLZXkgPT09IG51bGwgfHwgbW9vbmJlYW1Qcml2YXRlS2V5Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IFwiSW52YWxpZCBTZWNyZXRzIG9idGFpbmVkIGZvciBNb29uYmVhbSBSRVNUIEFQSSBjYWxsIVwiO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXNDb2RlOiA1MDAsXG4gICAgICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogUE9TVCAvdHJhbnNhY3Rpb25zQWNrbm93bGVkZ21lbnRcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBidWlsZCB0aGUgaW50ZXJuYWwgTW9vbmJlYW0gQVBJIHJlcXVlc3QgYm9keSB0byBiZSBwYXNzZWQgaW4sIGFuZCBwZXJmb3JtIGEgUE9TVCB0byBpdCB3aXRoIHRoZSBhcHByb3ByaWF0ZSBpbmZvcm1hdGlvblxuICAgICAgICAgICAgICogd2UgaW1wbHkgdGhhdCBpZiB0aGUgQVBJIGRvZXMgbm90IHJlc3BvbmQgaW4gMTUgc2Vjb25kcywgdGhlbiB3ZSBhdXRvbWF0aWNhbGx5IGNhdGNoIHRoYXQsIGFuZCByZXR1cm4gYW5cbiAgICAgICAgICAgICAqIGVycm9yIGZvciBhIGJldHRlciBjdXN0b21lciBleHBlcmllbmNlLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgTW9vbmJlYW0gUkVTVCBBUEkgcmVxdWVzdCBPYmplY3Q6ICR7SlNPTi5zdHJpbmdpZnkodXBkYXRlZFRyYW5zYWN0aW9uRXZlbnQpfWApO1xuICAgICAgICAgICAgcmV0dXJuIGF4aW9zLnBvc3QoYCR7bW9vbmJlYW1CYXNlVVJMfS90cmFuc2FjdGlvbnNBY2tub3dsZWRnbWVudGAsIEpTT04uc3RyaW5naWZ5KHVwZGF0ZWRUcmFuc2FjdGlvbkV2ZW50KSwge1xuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgICAgIFwieC1hcGkta2V5XCI6IG1vb25iZWFtUHJpdmF0ZUtleVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGltZW91dDogMTUwMDAsIC8vIGluIG1pbGxpc2Vjb25kcyBoZXJlXG4gICAgICAgICAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZTogJ01vb25iZWFtIFJFU1QgQVBJIHRpbWVkIG91dCBhZnRlciAxNTAwMG1zISdcbiAgICAgICAgICAgIH0pLnRoZW4odHJhbnNhY3Rpb25zQWNrbm93bGVkZ21lbnRSZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KHRyYW5zYWN0aW9uc0Fja25vd2xlZGdtZW50UmVzcG9uc2UuZGF0YSl9YCk7XG5cbiAgICAgICAgICAgICAgICAvLyBjaGVjayBpZiB0aGVyZSBhcmUgYW55IGVycm9ycyBpbiB0aGUgcmV0dXJuZWQgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICBpZiAodHJhbnNhY3Rpb25zQWNrbm93bGVkZ21lbnRSZXNwb25zZS5kYXRhICYmIHRyYW5zYWN0aW9uc0Fja25vd2xlZGdtZW50UmVzcG9uc2UuZGF0YS5kYXRhICE9PSBudWxsXG4gICAgICAgICAgICAgICAgICAgICYmICF0cmFuc2FjdGlvbnNBY2tub3dsZWRnbWVudFJlc3BvbnNlLmRhdGEuZXJyb3JNZXNzYWdlICYmICF0cmFuc2FjdGlvbnNBY2tub3dsZWRnbWVudFJlc3BvbnNlLmRhdGEuZXJyb3JUeXBlXG4gICAgICAgICAgICAgICAgICAgICYmIHRyYW5zYWN0aW9uc0Fja25vd2xlZGdtZW50UmVzcG9uc2Uuc3RhdHVzID09PSAyMDIpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuZWQgdGhlIHRyYW5zYWN0aW9uIGFja25vd2xlZGdtZW50IHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXNDb2RlOiB0cmFuc2FjdGlvbnNBY2tub3dsZWRnbWVudFJlc3BvbnNlLnN0YXR1cyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvZHk6IHRyYW5zYWN0aW9uc0Fja25vd2xlZGdtZW50UmVzcG9uc2UuZGF0YS5kYXRhXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJhbnNhY3Rpb25zQWNrbm93bGVkZ21lbnRSZXNwb25zZS5kYXRhICYmIHRyYW5zYWN0aW9uc0Fja25vd2xlZGdtZW50UmVzcG9uc2UuZGF0YS5lcnJvck1lc3NhZ2UgIT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICAmJiB0cmFuc2FjdGlvbnNBY2tub3dsZWRnbWVudFJlc3BvbnNlLmRhdGEuZXJyb3JNZXNzYWdlICE9PSBudWxsID9cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgdHlwZSwgZnJvbSB0aGUgb3JpZ2luYWwgUkVTVCBBUEkgY2FsbFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1c0NvZGU6IHRyYW5zYWN0aW9uc0Fja25vd2xlZGdtZW50UmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvZHk6IHRyYW5zYWN0aW9uc0Fja25vd2xlZGdtZW50UmVzcG9uc2UuZGF0YS5lcnJvck1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gOlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBlcnJvciByZXNwb25zZSBpbmRpY2F0aW5nIGFuIGludmFsaWQgc3RydWN0dXJlIHJldHVybmVkXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzQ29kZTogNTAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgSW52YWxpZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UhYCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yLnJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBhbmQgdGhlIHNlcnZlciByZXNwb25kZWQgd2l0aCBhIHN0YXR1cyBjb2RlXG4gICAgICAgICAgICAgICAgICAgICAqIHRoYXQgZmFsbHMgb3V0IG9mIHRoZSByYW5nZSBvZiAyeHguXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm9uIDJ4eHggcmVzcG9uc2Ugd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIFJFU1QgQVBJLCB3aXRoIHN0YXR1cyAke2Vycm9yLnJlc3BvbnNlLnN0YXR1c30sIGFuZCByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGVycm9yLnJlc3BvbnNlLmRhdGEpfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gYW55IG90aGVyIHNwZWNpZmljIGVycm9ycyB0byBiZSBmaWx0ZXJlZCBiZWxvd1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzQ29kZTogZXJyb3IucmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBlcnJvci5yZXNwb25zZS5kYXRhLmVycm9yVHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yLnJlc3BvbnNlLmRhdGEuZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3IucmVxdWVzdCkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYnV0IG5vIHJlc3BvbnNlIHdhcyByZWNlaXZlZFxuICAgICAgICAgICAgICAgICAgICAgKiBgZXJyb3IucmVxdWVzdGAgaXMgYW4gaW5zdGFuY2Ugb2YgWE1MSHR0cFJlcXVlc3QgaW4gdGhlIGJyb3dzZXIgYW5kIGFuIGluc3RhbmNlIG9mXG4gICAgICAgICAgICAgICAgICAgICAqICBodHRwLkNsaWVudFJlcXVlc3QgaW4gbm9kZS5qcy5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBObyByZXNwb25zZSByZWNlaXZlZCB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gTW9vbmJlYW0gQVBJLCBmb3IgcmVxdWVzdCAke2Vycm9yLnJlcXVlc3R9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzQ29kZTogNTAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNvbWV0aGluZyBoYXBwZW5lZCBpbiBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IHRoYXQgdHJpZ2dlcmVkIGFuIEVycm9yXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgZm9yIHRoZSAke2VuZHBvaW50SW5mb30gTW9vbmJlYW0gQVBJLCAkeyhlcnJvciAmJiBlcnJvci5tZXNzYWdlKSAmJiBlcnJvci5tZXNzYWdlfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1c0NvZGU6IDUwMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBwb3N0aW5nIHRoZSB0cmFuc2FjdGlvbnMgYWNrbm93bGVkZ21lbnQgb2JqZWN0IHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJ9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc3RhdHVzQ29kZTogNTAwLFxuICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yLFxuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdXNlZCB0byByZXRyaWV2ZSB0aGUgbGlzdCBvZiBlbGlnaWJsZSBsaW5rZWQgdXNlcnMsIHRvIGJlIHVzZXIgZHVyaW5nIHRoZSByZWltYnVyc2VtZW50c1xuICAgICAqIHByb2Nlc3MuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIGEge2xpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIEVsaWdpYmxlTGlua2VkVXNlcnNSZXNwb25zZX0gcmVwcmVzZW50aW5nIHRoZSBsaXN0IG9mIGVsaWdpYmxlXG4gICAgICogdXNlcnNcbiAgICAgKi9cbiAgICBhc3luYyBnZXRFbGlnaWJsZUxpbmtlZFVzZXJzKCk6IFByb21pc2U8RWxpZ2libGVMaW5rZWRVc2Vyc1Jlc3BvbnNlPiB7XG4gICAgICAgIC8vIGVhc2lseSBpZGVudGlmaWFibGUgQVBJIGVuZHBvaW50IGluZm9ybWF0aW9uXG4gICAgICAgIGNvbnN0IGVuZHBvaW50SW5mbyA9ICdnZXRFbGlnaWJsZUxpbmtlZFVzZXJzIFF1ZXJ5IE1vb25iZWFtIEdyYXBoUUwgQVBJJztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIEFQSSBLZXkgYW5kIEJhc2UgVVJMLCBuZWVkZWQgaW4gb3JkZXIgdG8gbWFrZSB0aGUgZWxpZ2libGUgdXNlciByZXRyaWV2YWwgY2FsbCB0aHJvdWdoIHRoZSBjbGllbnRcbiAgICAgICAgICAgIGNvbnN0IFttb29uYmVhbUJhc2VVUkwsIG1vb25iZWFtUHJpdmF0ZUtleV0gPSBhd2FpdCBzdXBlci5yZXRyaWV2ZVNlcnZpY2VDcmVkZW50aWFscyhDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5NT09OQkVBTV9JTlRFUk5BTF9TRUNSRVRfTkFNRSk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB3ZSBvYnRhaW5lZCBhbnkgaW52YWxpZCBzZWNyZXQgdmFsdWVzIGZyb20gdGhlIGNhbGwgYWJvdmVcbiAgICAgICAgICAgIGlmIChtb29uYmVhbUJhc2VVUkwgPT09IG51bGwgfHwgbW9vbmJlYW1CYXNlVVJMLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG1vb25iZWFtUHJpdmF0ZUtleSA9PT0gbnVsbCB8fCBtb29uYmVhbVByaXZhdGVLZXkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gXCJJbnZhbGlkIFNlY3JldHMgb2J0YWluZWQgZm9yIE1vb25iZWFtIEFQSSBjYWxsIVwiO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIGdldEVsaWdpYmxlTGlua2VkVXNlcnMgUXVlcnlcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBidWlsZCB0aGUgTW9vbmJlYW0gQXBwU3luYyBBUEkgR3JhcGhRTCBxdWVyeSwgYW5kIHBlcmZvcm0gYSBQT1NUIHRvIGl0LFxuICAgICAgICAgICAgICogd2l0aCB0aGUgYXBwcm9wcmlhdGUgaW5mb3JtYXRpb24uXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogd2UgaW1wbHkgdGhhdCBpZiB0aGUgQVBJIGRvZXMgbm90IHJlc3BvbmQgaW4gMTUgc2Vjb25kcywgdGhlbiB3ZSBhdXRvbWF0aWNhbGx5IGNhdGNoIHRoYXQsIGFuZCByZXR1cm4gYW5cbiAgICAgICAgICAgICAqIGVycm9yIGZvciBhIGJldHRlciBjdXN0b21lciBleHBlcmllbmNlLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICByZXR1cm4gYXhpb3MucG9zdChgJHttb29uYmVhbUJhc2VVUkx9YCwge1xuICAgICAgICAgICAgICAgIHF1ZXJ5OiBnZXRFbGlnaWJsZUxpbmtlZFVzZXJzXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAgICAgXCJ4LWFwaS1rZXlcIjogbW9vbmJlYW1Qcml2YXRlS2V5XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiAxNTAwMCwgLy8gaW4gbWlsbGlzZWNvbmRzIGhlcmVcbiAgICAgICAgICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlOiAnTW9vbmJlYW0gQVBJIHRpbWVkIG91dCBhZnRlciAxNTAwMG1zISdcbiAgICAgICAgICAgIH0pLnRoZW4oZ2V0RWxpZ2libGVMaW5rZWRVc2Vyc1Jlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlbmRwb2ludEluZm99IHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZ2V0RWxpZ2libGVMaW5rZWRVc2Vyc1Jlc3BvbnNlLmRhdGEpfWApO1xuXG4gICAgICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIGRhdGEgYmxvY2sgZnJvbSB0aGUgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICBjb25zdCByZXNwb25zZURhdGEgPSAoZ2V0RWxpZ2libGVMaW5rZWRVc2Vyc1Jlc3BvbnNlICYmIGdldEVsaWdpYmxlTGlua2VkVXNlcnNSZXNwb25zZS5kYXRhKSA/IGdldEVsaWdpYmxlTGlua2VkVXNlcnNSZXNwb25zZS5kYXRhLmRhdGEgOiBudWxsO1xuXG4gICAgICAgICAgICAgICAgLy8gY2hlY2sgaWYgdGhlcmUgYXJlIGFueSBlcnJvcnMgaW4gdGhlIHJldHVybmVkIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlRGF0YSAmJiByZXNwb25zZURhdGEuZ2V0RWxpZ2libGVMaW5rZWRVc2Vycy5lcnJvck1lc3NhZ2UgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuZWQgdGhlIHN1Y2Nlc3NmdWxseSByZXRyaWV2ZWQgZWxpZ2libGUgbGlua2VkIHVzZXJzXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiByZXNwb25zZURhdGEuZ2V0RWxpZ2libGVMaW5rZWRVc2Vycy5kYXRhIGFzIEVsaWdpYmxlTGlua2VkVXNlcltdXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2VEYXRhID9cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgdHlwZSwgZnJvbSB0aGUgb3JpZ2luYWwgQXBwU3luYyBjYWxsXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiByZXNwb25zZURhdGEuZ2V0RWxpZ2libGVMaW5rZWRVc2Vycy5lcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiByZXNwb25zZURhdGEuZ2V0RWxpZ2libGVMaW5rZWRVc2Vycy5lcnJvclR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gOlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBlcnJvciByZXNwb25zZSBpbmRpY2F0aW5nIGFuIGludmFsaWQgc3RydWN0dXJlIHJldHVybmVkXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgSW52YWxpZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UhYCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yLnJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBhbmQgdGhlIHNlcnZlciByZXNwb25kZWQgd2l0aCBhIHN0YXR1cyBjb2RlXG4gICAgICAgICAgICAgICAgICAgICAqIHRoYXQgZmFsbHMgb3V0IG9mIHRoZSByYW5nZSBvZiAyeHguXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm9uIDJ4eHggcmVzcG9uc2Ugd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgd2l0aCBzdGF0dXMgJHtlcnJvci5yZXNwb25zZS5zdGF0dXN9LCBhbmQgcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShlcnJvci5yZXNwb25zZS5kYXRhKX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGFueSBvdGhlciBzcGVjaWZpYyBlcnJvcnMgdG8gYmUgZmlsdGVyZWQgYmVsb3dcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVycm9yLnJlcXVlc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGJ1dCBubyByZXNwb25zZSB3YXMgcmVjZWl2ZWRcbiAgICAgICAgICAgICAgICAgICAgICogYGVycm9yLnJlcXVlc3RgIGlzIGFuIGluc3RhbmNlIG9mIFhNTEh0dHBSZXF1ZXN0IGluIHRoZSBicm93c2VyIGFuZCBhbiBpbnN0YW5jZSBvZlxuICAgICAgICAgICAgICAgICAgICAgKiAgaHR0cC5DbGllbnRSZXF1ZXN0IGluIG5vZGUuanMuXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm8gcmVzcG9uc2UgcmVjZWl2ZWQgd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgZm9yIHJlcXVlc3QgJHtlcnJvci5yZXF1ZXN0fWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBTb21ldGhpbmcgaGFwcGVuZWQgaW4gc2V0dGluZyB1cCB0aGUgcmVxdWVzdCB0aGF0IHRyaWdnZXJlZCBhbiBFcnJvclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IGZvciB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgJHsoZXJyb3IgJiYgZXJyb3IubWVzc2FnZSkgJiYgZXJyb3IubWVzc2FnZX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgcmV0cmlldmluZyBlbGlnaWJsZSBsaW5rZWQgdXNlcnMgdGhyb3VnaCAke2VuZHBvaW50SW5mb31gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfSAke2Vycn1gKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHVzZWQgdG8gY3JlYXRlIGEgbmV3IHRyYW5zYWN0aW9uIGludGVybmFsbHksIGZyb20gYW4gaW5jb21pbmcgdHJhbnNhY3Rpb25cbiAgICAgKiBvYnRhaW5lZCBmcm9tIHRoZSBTUVMgbWVzc2FnZS9ldmVudFxuICAgICAqXG4gICAgICogQHBhcmFtIHRyYW5zYWN0aW9uIHRyYW5zYWN0aW9uIHBhc3NlZCBpbiBmcm9tIHRoZSBTUVMgbWVzc2FnZS9ldmVudFxuICAgICAqXG4gICAgICogQHJldHVybiBhIHtsaW5rIFByb21pc2V9IG9mIHtAbGluayBNb29uYmVhbVRyYW5zYWN0aW9uUmVzcG9uc2V9IHJlcHJlc2VudGluZyB0aGUgdHJhbnNhY3Rpb25cbiAgICAgKiBkZXRhaWxzIHRoYXQgd2VyZSBzdG9yZWQgaW4gRHluYW1vIERCXG4gICAgICovXG4gICAgYXN5bmMgY3JlYXRlVHJhbnNhY3Rpb24odHJhbnNhY3Rpb246IE1vb25iZWFtVHJhbnNhY3Rpb24pOiBQcm9taXNlPE1vb25iZWFtVHJhbnNhY3Rpb25SZXNwb25zZT4ge1xuICAgICAgICAvLyBlYXNpbHkgaWRlbnRpZmlhYmxlIEFQSSBlbmRwb2ludCBpbmZvcm1hdGlvblxuICAgICAgICBjb25zdCBlbmRwb2ludEluZm8gPSAnY3JlYXRlVHJhbnNhY3Rpb24gTXV0YXRpb24gTW9vbmJlYW0gR3JhcGhRTCBBUEknO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgQVBJIEtleSBhbmQgQmFzZSBVUkwsIG5lZWRlZCBpbiBvcmRlciB0byBtYWtlIHRoZSBjYXJkIGxpbmtpbmcgY2FsbCB0aHJvdWdoIHRoZSBjbGllbnRcbiAgICAgICAgICAgIGNvbnN0IFttb29uYmVhbUJhc2VVUkwsIG1vb25iZWFtUHJpdmF0ZUtleV0gPSBhd2FpdCBzdXBlci5yZXRyaWV2ZVNlcnZpY2VDcmVkZW50aWFscyhDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5NT09OQkVBTV9JTlRFUk5BTF9TRUNSRVRfTkFNRSk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB3ZSBvYnRhaW5lZCBhbnkgaW52YWxpZCBzZWNyZXQgdmFsdWVzIGZyb20gdGhlIGNhbGwgYWJvdmVcbiAgICAgICAgICAgIGlmIChtb29uYmVhbUJhc2VVUkwgPT09IG51bGwgfHwgbW9vbmJlYW1CYXNlVVJMLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG1vb25iZWFtUHJpdmF0ZUtleSA9PT0gbnVsbCB8fCBtb29uYmVhbVByaXZhdGVLZXkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gXCJJbnZhbGlkIFNlY3JldHMgb2J0YWluZWQgZm9yIE1vb25iZWFtIEFQSSBjYWxsIVwiO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBjcmVhdGVUcmFuc2FjdGlvbiBNdXRhdGlvblxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIGJ1aWxkIHRoZSBNb29uYmVhbSBBcHBTeW5jIEFQSSBHcmFwaFFMIG11dGF0aW9uIGJvZHkgdG8gYmUgcGFzc2VkIGluIHdpdGggaXRzIHZhcmlhYmxlcywgYW5kIHBlcmZvcm0gYSBQT1NUIHRvIGl0LFxuICAgICAgICAgICAgICogd2l0aCB0aGUgYXBwcm9wcmlhdGUgaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiB3ZSBpbXBseSB0aGF0IGlmIHRoZSBBUEkgZG9lcyBub3QgcmVzcG9uZCBpbiAxNSBzZWNvbmRzLCB0aGVuIHdlIGF1dG9tYXRpY2FsbHkgY2F0Y2ggdGhhdCwgYW5kIHJldHVybiBhblxuICAgICAgICAgICAgICogZXJyb3IgZm9yIGEgYmV0dGVyIGN1c3RvbWVyIGV4cGVyaWVuY2UuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBNb29uYmVhbSBBcHBTeW5jIEFQSSByZXF1ZXN0IE9iamVjdDogJHtKU09OLnN0cmluZ2lmeSh0cmFuc2FjdGlvbiBhcyBDcmVhdGVUcmFuc2FjdGlvbklucHV0KX1gKTtcbiAgICAgICAgICAgIHJldHVybiBheGlvcy5wb3N0KGAke21vb25iZWFtQmFzZVVSTH1gLCB7XG4gICAgICAgICAgICAgICAgcXVlcnk6IGNyZWF0ZVRyYW5zYWN0aW9uLFxuICAgICAgICAgICAgICAgIHZhcmlhYmxlczoge1xuICAgICAgICAgICAgICAgICAgICBjcmVhdGVUcmFuc2FjdGlvbklucHV0OiB0cmFuc2FjdGlvbiBhcyBDcmVhdGVUcmFuc2FjdGlvbklucHV0XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgICAgIFwieC1hcGkta2V5XCI6IG1vb25iZWFtUHJpdmF0ZUtleVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGltZW91dDogMTUwMDAsIC8vIGluIG1pbGxpc2Vjb25kcyBoZXJlXG4gICAgICAgICAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZTogJ01vb25iZWFtIEFQSSB0aW1lZCBvdXQgYWZ0ZXIgMTUwMDBtcyEnXG4gICAgICAgICAgICB9KS50aGVuKGNyZWF0ZVRyYW5zYWN0aW9uUmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShjcmVhdGVUcmFuc2FjdGlvblJlc3BvbnNlLmRhdGEpfWApO1xuXG4gICAgICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIGRhdGEgYmxvY2sgZnJvbSB0aGUgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICBjb25zdCByZXNwb25zZURhdGEgPSAoY3JlYXRlVHJhbnNhY3Rpb25SZXNwb25zZSAmJiBjcmVhdGVUcmFuc2FjdGlvblJlc3BvbnNlLmRhdGEpID8gY3JlYXRlVHJhbnNhY3Rpb25SZXNwb25zZS5kYXRhLmRhdGEgOiBudWxsO1xuXG4gICAgICAgICAgICAgICAgLy8gY2hlY2sgaWYgdGhlcmUgYXJlIGFueSBlcnJvcnMgaW4gdGhlIHJldHVybmVkIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlRGF0YSAmJiByZXNwb25zZURhdGEuY3JlYXRlVHJhbnNhY3Rpb24uZXJyb3JNZXNzYWdlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHJldHVybmVkIHRoZSBzdWNjZXNzZnVsbHkgc3RvcmVkIHRyYW5zYWN0aW9uLCBhcyB3ZWxsIGFzIGl0cyBJRCBpbiB0aGUgcGFyZW50IG9iamVjdCwgZm9yIHN1YnNjcmlwdGlvbiBwdXJwb3Nlc1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHRyYW5zYWN0aW9uLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogdHJhbnNhY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZURhdGEgP1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBlcnJvciBtZXNzYWdlIGFuZCB0eXBlLCBmcm9tIHRoZSBvcmlnaW5hbCBBcHBTeW5jIGNhbGxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IHJlc3BvbnNlRGF0YS5jcmVhdGVUcmFuc2FjdGlvbi5lcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiByZXNwb25zZURhdGEuY3JlYXRlVHJhbnNhY3Rpb24uZXJyb3JUeXBlXG4gICAgICAgICAgICAgICAgICAgICAgICB9IDpcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgZXJyb3IgcmVzcG9uc2UgaW5kaWNhdGluZyBhbiBpbnZhbGlkIHN0cnVjdHVyZSByZXR1cm5lZFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogYEludmFsaWQgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gJHtlbmRwb2ludEluZm99IHJlc3BvbnNlIWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvci5yZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYW5kIHRoZSBzZXJ2ZXIgcmVzcG9uZGVkIHdpdGggYSBzdGF0dXMgY29kZVxuICAgICAgICAgICAgICAgICAgICAgKiB0aGF0IGZhbGxzIG91dCBvZiB0aGUgcmFuZ2Ugb2YgMnh4LlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vbiAyeHh4IHJlc3BvbnNlIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBNb29uYmVhbSBBUEksIHdpdGggc3RhdHVzICR7ZXJyb3IucmVzcG9uc2Uuc3RhdHVzfSwgYW5kIHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZXJyb3IucmVzcG9uc2UuZGF0YSl9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBhbnkgb3RoZXIgc3BlY2lmaWMgZXJyb3JzIHRvIGJlIGZpbHRlcmVkIGJlbG93XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3IucmVxdWVzdCkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYnV0IG5vIHJlc3BvbnNlIHdhcyByZWNlaXZlZFxuICAgICAgICAgICAgICAgICAgICAgKiBgZXJyb3IucmVxdWVzdGAgaXMgYW4gaW5zdGFuY2Ugb2YgWE1MSHR0cFJlcXVlc3QgaW4gdGhlIGJyb3dzZXIgYW5kIGFuIGluc3RhbmNlIG9mXG4gICAgICAgICAgICAgICAgICAgICAqICBodHRwLkNsaWVudFJlcXVlc3QgaW4gbm9kZS5qcy5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBObyByZXNwb25zZSByZWNlaXZlZCB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gTW9vbmJlYW0gQVBJLCBmb3IgcmVxdWVzdCAke2Vycm9yLnJlcXVlc3R9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBTb21ldGhpbmcgaGFwcGVuZWQgaW4gc2V0dGluZyB1cCB0aGUgcmVxdWVzdCB0aGF0IHRyaWdnZXJlZCBhbiBFcnJvclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IGZvciB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgJHsoZXJyb3IgJiYgZXJyb3IubWVzc2FnZSkgJiYgZXJyb3IubWVzc2FnZX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGNyZWF0aW5nIGEgbmV3IHRyYW5zYWN0aW9uIHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJ9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdXNlZCB0byBnZXQgYWxsIHRyYW5zYWN0aW9ucywgZm9yIGEgcGFydGljdWxhciB1c2VyLCBmaWx0ZXJlZFxuICAgICAqIGJ5IHRoZWlyIHN0YXR1cy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBnZXRUcmFuc2FjdGlvbkJ5U3RhdHVzSW5wdXQgdGhlIHRyYW5zYWN0aW9uIGJ5IHN0YXR1cyBpbnB1dCBvYmplY3Qgb3QgYmUgcGFzc2VkIGluLFxuICAgICAqIGNvbnRhaW5pbmcgYWxsIHRoZSBuZWNlc3NhcnkgZmlsdGVyaW5nIGZvciByZXRyaWV2aW5nIHRoZSB0cmFuc2FjdGlvbnMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBhIHtAbGluayBNb29uYmVhbVRyYW5zYWN0aW9uc0J5U3RhdHVzUmVzcG9uc2V9IHJlcHJlc2VudGluZyB0aGUgdHJhbnNhY3Rpb25hbCBkYXRhLFxuICAgICAqIGZpbHRlcmVkIGJ5IHN0YXR1cyByZXNwb25zZVxuICAgICAqL1xuICAgIGFzeW5jIGdldFRyYW5zYWN0aW9uQnlTdGF0dXMoZ2V0VHJhbnNhY3Rpb25CeVN0YXR1c0lucHV0OiBHZXRUcmFuc2FjdGlvbkJ5U3RhdHVzSW5wdXQpOiBQcm9taXNlPE1vb25iZWFtVHJhbnNhY3Rpb25zQnlTdGF0dXNSZXNwb25zZT4ge1xuICAgICAgICAvLyBlYXNpbHkgaWRlbnRpZmlhYmxlIEFQSSBlbmRwb2ludCBpbmZvcm1hdGlvblxuICAgICAgICBjb25zdCBlbmRwb2ludEluZm8gPSAnZ2V0VHJhbnNhY3Rpb25CeVN0YXR1cyBRdWVyeSBNb29uYmVhbSBHcmFwaFFMIEFQSSc7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBBUEkgS2V5IGFuZCBCYXNlIFVSTCwgbmVlZGVkIGluIG9yZGVyIHRvIG1ha2UgdGhlIHRyYW5zYWN0aW9uIGJ5IHN0YXR1cyByZXRyaWV2YWwgY2FsbCB0aHJvdWdoIHRoZSBjbGllbnRcbiAgICAgICAgICAgIGNvbnN0IFttb29uYmVhbUJhc2VVUkwsIG1vb25iZWFtUHJpdmF0ZUtleV0gPSBhd2FpdCBzdXBlci5yZXRyaWV2ZVNlcnZpY2VDcmVkZW50aWFscyhDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5NT09OQkVBTV9JTlRFUk5BTF9TRUNSRVRfTkFNRSk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB3ZSBvYnRhaW5lZCBhbnkgaW52YWxpZCBzZWNyZXQgdmFsdWVzIGZyb20gdGhlIGNhbGwgYWJvdmVcbiAgICAgICAgICAgIGlmIChtb29uYmVhbUJhc2VVUkwgPT09IG51bGwgfHwgbW9vbmJlYW1CYXNlVVJMLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG1vb25iZWFtUHJpdmF0ZUtleSA9PT0gbnVsbCB8fCBtb29uYmVhbVByaXZhdGVLZXkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gXCJJbnZhbGlkIFNlY3JldHMgb2J0YWluZWQgZm9yIE1vb25iZWFtIEFQSSBjYWxsIVwiO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBnZXRUcmFuc2FjdGlvbkJ5U3RhdHVzIFF1ZXJ5XG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogYnVpbGQgdGhlIE1vb25iZWFtIEFwcFN5bmMgQVBJIEdyYXBoUUwgcXVlcnksIGFuZCBwZXJmb3JtIGEgUE9TVCB0byBpdCxcbiAgICAgICAgICAgICAqIHdpdGggdGhlIGFwcHJvcHJpYXRlIGluZm9ybWF0aW9uLlxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIHdlIGltcGx5IHRoYXQgaWYgdGhlIEFQSSBkb2VzIG5vdCByZXNwb25kIGluIDE1IHNlY29uZHMsIHRoZW4gd2UgYXV0b21hdGljYWxseSBjYXRjaCB0aGF0LCBhbmQgcmV0dXJuIGFuXG4gICAgICAgICAgICAgKiBlcnJvciBmb3IgYSBiZXR0ZXIgY3VzdG9tZXIgZXhwZXJpZW5jZS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgcmV0dXJuIGF4aW9zLnBvc3QoYCR7bW9vbmJlYW1CYXNlVVJMfWAsIHtcbiAgICAgICAgICAgICAgICBxdWVyeTogZ2V0VHJhbnNhY3Rpb25CeVN0YXR1cyxcbiAgICAgICAgICAgICAgICB2YXJpYWJsZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgZ2V0VHJhbnNhY3Rpb25CeVN0YXR1c0lucHV0OiBnZXRUcmFuc2FjdGlvbkJ5U3RhdHVzSW5wdXRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAgICAgXCJ4LWFwaS1rZXlcIjogbW9vbmJlYW1Qcml2YXRlS2V5XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiAxNTAwMCwgLy8gaW4gbWlsbGlzZWNvbmRzIGhlcmVcbiAgICAgICAgICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlOiAnTW9vbmJlYW0gQVBJIHRpbWVkIG91dCBhZnRlciAxNTAwMG1zISdcbiAgICAgICAgICAgIH0pLnRoZW4oZ2V0VHJhbnNhY3Rpb25CeVN0YXR1c1Jlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlbmRwb2ludEluZm99IHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZ2V0VHJhbnNhY3Rpb25CeVN0YXR1c1Jlc3BvbnNlLmRhdGEpfWApO1xuXG4gICAgICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIGRhdGEgYmxvY2sgZnJvbSB0aGUgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICBjb25zdCByZXNwb25zZURhdGEgPSAoZ2V0VHJhbnNhY3Rpb25CeVN0YXR1c1Jlc3BvbnNlICYmIGdldFRyYW5zYWN0aW9uQnlTdGF0dXNSZXNwb25zZS5kYXRhKSA/IGdldFRyYW5zYWN0aW9uQnlTdGF0dXNSZXNwb25zZS5kYXRhLmRhdGEgOiBudWxsO1xuXG4gICAgICAgICAgICAgICAgLy8gY2hlY2sgaWYgdGhlcmUgYXJlIGFueSBlcnJvcnMgaW4gdGhlIHJldHVybmVkIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlRGF0YSAmJiByZXNwb25zZURhdGEuZ2V0VHJhbnNhY3Rpb25CeVN0YXR1cy5lcnJvck1lc3NhZ2UgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuZWQgdGhlIHN1Y2Nlc3NmdWxseSByZXRyaWV2ZWQgdHJhbnNhY3Rpb25zIGZvciBhIGdpdmVuIHVzZXIsIGZpbHRlcmVkIGJ5IHRoZWlyIHN0YXR1c1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogcmVzcG9uc2VEYXRhLmdldFRyYW5zYWN0aW9uQnlTdGF0dXMuZGF0YSBhcyBNb29uYmVhbVRyYW5zYWN0aW9uQnlTdGF0dXNbXVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlRGF0YSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIGVycm9yIG1lc3NhZ2UgYW5kIHR5cGUsIGZyb20gdGhlIG9yaWdpbmFsIEFwcFN5bmMgY2FsbFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogcmVzcG9uc2VEYXRhLmdldFRyYW5zYWN0aW9uQnlTdGF0dXMuZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogcmVzcG9uc2VEYXRhLmdldFRyYW5zYWN0aW9uQnlTdGF0dXMuZXJyb3JUeXBlXG4gICAgICAgICAgICAgICAgICAgICAgICB9IDpcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgZXJyb3IgcmVzcG9uc2UgaW5kaWNhdGluZyBhbiBpbnZhbGlkIHN0cnVjdHVyZSByZXR1cm5lZFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogYEludmFsaWQgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gJHtlbmRwb2ludEluZm99IHJlc3BvbnNlIWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvci5yZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYW5kIHRoZSBzZXJ2ZXIgcmVzcG9uZGVkIHdpdGggYSBzdGF0dXMgY29kZVxuICAgICAgICAgICAgICAgICAgICAgKiB0aGF0IGZhbGxzIG91dCBvZiB0aGUgcmFuZ2Ugb2YgMnh4LlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vbiAyeHh4IHJlc3BvbnNlIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBNb29uYmVhbSBBUEksIHdpdGggc3RhdHVzICR7ZXJyb3IucmVzcG9uc2Uuc3RhdHVzfSwgYW5kIHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZXJyb3IucmVzcG9uc2UuZGF0YSl9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBhbnkgb3RoZXIgc3BlY2lmaWMgZXJyb3JzIHRvIGJlIGZpbHRlcmVkIGJlbG93XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3IucmVxdWVzdCkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYnV0IG5vIHJlc3BvbnNlIHdhcyByZWNlaXZlZFxuICAgICAgICAgICAgICAgICAgICAgKiBgZXJyb3IucmVxdWVzdGAgaXMgYW4gaW5zdGFuY2Ugb2YgWE1MSHR0cFJlcXVlc3QgaW4gdGhlIGJyb3dzZXIgYW5kIGFuIGluc3RhbmNlIG9mXG4gICAgICAgICAgICAgICAgICAgICAqICBodHRwLkNsaWVudFJlcXVlc3QgaW4gbm9kZS5qcy5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBObyByZXNwb25zZSByZWNlaXZlZCB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gTW9vbmJlYW0gQVBJLCBmb3IgcmVxdWVzdCAke2Vycm9yLnJlcXVlc3R9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBTb21ldGhpbmcgaGFwcGVuZWQgaW4gc2V0dGluZyB1cCB0aGUgcmVxdWVzdCB0aGF0IHRyaWdnZXJlZCBhbiBFcnJvclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IGZvciB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgJHsoZXJyb3IgJiYgZXJyb3IubWVzc2FnZSkgJiYgZXJyb3IubWVzc2FnZX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHJldHJpZXZpbmcgdHJhbnNhY3Rpb25zIGZvciBhIHBhcnRpY3VsYXIgdXNlciwgZmlsdGVyZWQgYnkgdGhlaXIgc3RhdHVzIHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJ9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdXNlZCB0byBnZXQgYWxsIHRyYW5zYWN0aW9ucywgZm9yIGEgcGFydGljdWxhciB1c2VyLlxuICAgICAqXG4gICAgICogQHBhcmFtIGdldFRyYW5zYWN0aW9uSW5wdXQgdGhlIHRyYW5zYWN0aW9uIGlucHV0IG9iamVjdCB0byBiZSBwYXNzZWQgaW4sXG4gICAgICogY29udGFpbmluZyBhbGwgdGhlIG5lY2Vzc2FyeSBmaWx0ZXJpbmcgZm9yIHJldHJpZXZpbmcgdGhlIHRyYW5zYWN0aW9ucyBmb3IgYSBwYXJ0aWN1bGFyIHVzZXIuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBhIHtAbGluayBNb29uYmVhbVRyYW5zYWN0aW9uc1Jlc3BvbnNlfSByZXByZXNlbnRpbmcgdGhlIHRyYW5zYWN0aW9uYWwgZGF0YS5cbiAgICAgKi9cbiAgICBhc3luYyBnZXRUcmFuc2FjdGlvbihnZXRUcmFuc2FjdGlvbklucHV0OiBHZXRUcmFuc2FjdGlvbklucHV0KTogUHJvbWlzZTxNb29uYmVhbVRyYW5zYWN0aW9uc1Jlc3BvbnNlPiB7XG4gICAgICAgIC8vIGVhc2lseSBpZGVudGlmaWFibGUgQVBJIGVuZHBvaW50IGluZm9ybWF0aW9uXG4gICAgICAgIGNvbnN0IGVuZHBvaW50SW5mbyA9ICdnZXRUcmFuc2FjdGlvbiBRdWVyeSBNb29uYmVhbSBHcmFwaFFMIEFQSSc7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBBUEkgS2V5IGFuZCBCYXNlIFVSTCwgbmVlZGVkIGluIG9yZGVyIHRvIG1ha2UgdGhlIHRyYW5zYWN0aW9uIHJldHJpZXZhbCBjYWxsIHRocm91Z2ggdGhlIGNsaWVudFxuICAgICAgICAgICAgY29uc3QgW21vb25iZWFtQmFzZVVSTCwgbW9vbmJlYW1Qcml2YXRlS2V5XSA9IGF3YWl0IHN1cGVyLnJldHJpZXZlU2VydmljZUNyZWRlbnRpYWxzKENvbnN0YW50cy5BV1NQYWlyQ29uc3RhbnRzLk1PT05CRUFNX0lOVEVSTkFMX1NFQ1JFVF9OQU1FKTtcblxuICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHdlIG9idGFpbmVkIGFueSBpbnZhbGlkIHNlY3JldCB2YWx1ZXMgZnJvbSB0aGUgY2FsbCBhYm92ZVxuICAgICAgICAgICAgaWYgKG1vb25iZWFtQmFzZVVSTCA9PT0gbnVsbCB8fCBtb29uYmVhbUJhc2VVUkwubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgbW9vbmJlYW1Qcml2YXRlS2V5ID09PSBudWxsIHx8IG1vb25iZWFtUHJpdmF0ZUtleS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBcIkludmFsaWQgU2VjcmV0cyBvYnRhaW5lZCBmb3IgTW9vbmJlYW0gQVBJIGNhbGwhXCI7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIGdldFRyYW5zYWN0aW9uIFF1ZXJ5XG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogYnVpbGQgdGhlIE1vb25iZWFtIEFwcFN5bmMgQVBJIEdyYXBoUUwgcXVlcnksIGFuZCBwZXJmb3JtIGEgUE9TVCB0byBpdCxcbiAgICAgICAgICAgICAqIHdpdGggdGhlIGFwcHJvcHJpYXRlIGluZm9ybWF0aW9uLlxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIHdlIGltcGx5IHRoYXQgaWYgdGhlIEFQSSBkb2VzIG5vdCByZXNwb25kIGluIDE1IHNlY29uZHMsIHRoZW4gd2UgYXV0b21hdGljYWxseSBjYXRjaCB0aGF0LCBhbmQgcmV0dXJuIGFuXG4gICAgICAgICAgICAgKiBlcnJvciBmb3IgYSBiZXR0ZXIgY3VzdG9tZXIgZXhwZXJpZW5jZS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgcmV0dXJuIGF4aW9zLnBvc3QoYCR7bW9vbmJlYW1CYXNlVVJMfWAsIHtcbiAgICAgICAgICAgICAgICBxdWVyeTogZ2V0VHJhbnNhY3Rpb24sXG4gICAgICAgICAgICAgICAgdmFyaWFibGVzOiB7XG4gICAgICAgICAgICAgICAgICAgIGdldFRyYW5zYWN0aW9uSW5wdXQ6IGdldFRyYW5zYWN0aW9uSW5wdXRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAgICAgXCJ4LWFwaS1rZXlcIjogbW9vbmJlYW1Qcml2YXRlS2V5XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiAxNTAwMCwgLy8gaW4gbWlsbGlzZWNvbmRzIGhlcmVcbiAgICAgICAgICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlOiAnTW9vbmJlYW0gQVBJIHRpbWVkIG91dCBhZnRlciAxNTAwMG1zISdcbiAgICAgICAgICAgIH0pLnRoZW4oZ2V0VHJhbnNhY3Rpb25zUmVzcG9uc2VzID0+IHtcbiAgICAgICAgICAgICAgICAvLyB3ZSBkb24ndCB3YW50IHRvIGxvZyB0aGlzIGluIGNhc2Ugb2Ygc3VjY2VzcyByZXNwb25zZXMsIGJlY2F1c2UgdGhlIHRyYW5zYWN0aW9uIHJlc3BvbnNlcyBhcmUgdmVyeSBsb25nIChmcnVnYWxpdHkpXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coYCR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGdldFRyYW5zYWN0aW9uc1Jlc3BvbnNlcy5kYXRhKX1gKTtcblxuICAgICAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBkYXRhIGJsb2NrIGZyb20gdGhlIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2VEYXRhID0gKGdldFRyYW5zYWN0aW9uc1Jlc3BvbnNlcyAmJiBnZXRUcmFuc2FjdGlvbnNSZXNwb25zZXMuZGF0YSkgPyBnZXRUcmFuc2FjdGlvbnNSZXNwb25zZXMuZGF0YS5kYXRhIDogbnVsbDtcblxuICAgICAgICAgICAgICAgIC8vIGNoZWNrIGlmIHRoZXJlIGFyZSBhbnkgZXJyb3JzIGluIHRoZSByZXR1cm5lZCByZXNwb25zZVxuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZURhdGEgJiYgcmVzcG9uc2VEYXRhLmdldFRyYW5zYWN0aW9uLmVycm9yTWVzc2FnZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm5lZCB0aGUgc3VjY2Vzc2Z1bGx5IHJldHJpZXZlZCB0cmFuc2FjdGlvbnMgZm9yIGEgZ2l2ZW4gdXNlclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogcmVzcG9uc2VEYXRhLmdldFRyYW5zYWN0aW9uLmRhdGEgYXMgTW9vbmJlYW1UcmFuc2FjdGlvbltdXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2VEYXRhID9cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgdHlwZSwgZnJvbSB0aGUgb3JpZ2luYWwgQXBwU3luYyBjYWxsXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiByZXNwb25zZURhdGEuZ2V0VHJhbnNhY3Rpb24uZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogcmVzcG9uc2VEYXRhLmdldFRyYW5zYWN0aW9uLmVycm9yVHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIGVycm9yIHJlc3BvbnNlIGluZGljYXRpbmcgYW4gaW52YWxpZCBzdHJ1Y3R1cmUgcmV0dXJuZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBJbnZhbGlkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tICR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSFgLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IucmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGFuZCB0aGUgc2VydmVyIHJlc3BvbmRlZCB3aXRoIGEgc3RhdHVzIGNvZGVcbiAgICAgICAgICAgICAgICAgICAgICogdGhhdCBmYWxscyBvdXQgb2YgdGhlIHJhbmdlIG9mIDJ4eC5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBOb24gMnh4eCByZXNwb25zZSB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gTW9vbmJlYW0gQVBJLCB3aXRoIHN0YXR1cyAke2Vycm9yLnJlc3BvbnNlLnN0YXR1c30sIGFuZCByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGVycm9yLnJlc3BvbnNlLmRhdGEpfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gYW55IG90aGVyIHNwZWNpZmljIGVycm9ycyB0byBiZSBmaWx0ZXJlZCBiZWxvd1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVycm9yLnJlcXVlc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGJ1dCBubyByZXNwb25zZSB3YXMgcmVjZWl2ZWRcbiAgICAgICAgICAgICAgICAgICAgICogYGVycm9yLnJlcXVlc3RgIGlzIGFuIGluc3RhbmNlIG9mIFhNTEh0dHBSZXF1ZXN0IGluIHRoZSBicm93c2VyIGFuZCBhbiBpbnN0YW5jZSBvZlxuICAgICAgICAgICAgICAgICAgICAgKiAgaHR0cC5DbGllbnRSZXF1ZXN0IGluIG5vZGUuanMuXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm8gcmVzcG9uc2UgcmVjZWl2ZWQgd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgZm9yIHJlcXVlc3QgJHtlcnJvci5yZXF1ZXN0fWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU29tZXRoaW5nIGhhcHBlbmVkIGluIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgdGhhdCB0cmlnZ2VyZWQgYW4gRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgc2V0dGluZyB1cCB0aGUgcmVxdWVzdCBmb3IgdGhlICR7ZW5kcG9pbnRJbmZvfSBNb29uYmVhbSBBUEksICR7KGVycm9yICYmIGVycm9yLm1lc3NhZ2UpICYmIGVycm9yLm1lc3NhZ2V9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSByZXRyaWV2aW5nIHRyYW5zYWN0aW9ucyBmb3IgYSBwYXJ0aWN1bGFyIHVzZXIsIHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJ9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdXNlZCB0byB1cGRhdGUgYW4gZXhpc3RpbmcgdHJhbnNhY3Rpb24ncyBkZXRhaWxzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHVwZGF0ZVRyYW5zYWN0aW9uSW5wdXQgdGhlIHRyYW5zYWN0aW9uIGRldGFpbHMgdG8gYmUgcGFzc2VkIGluLCBpbiBvcmRlciB0byB1cGRhdGVcbiAgICAgKiBhbiBleGlzdGluZyB0cmFuc2FjdGlvblxuICAgICAqXG4gICAgICogQHJldHVybnMgYSB7QGxpbmsgTW9vbmJlYW1VcGRhdGVkVHJhbnNhY3Rpb25SZXNwb25zZX0gcmVwcmVzZW50aW5nIHRoZSB1cGRhdGUgdHJhbnNhY3Rpb24nc1xuICAgICAqIGRhdGFcbiAgICAgKi9cbiAgICBhc3luYyB1cGRhdGVUcmFuc2FjdGlvbih1cGRhdGVUcmFuc2FjdGlvbklucHV0OiBVcGRhdGVUcmFuc2FjdGlvbklucHV0KTogUHJvbWlzZTxNb29uYmVhbVVwZGF0ZWRUcmFuc2FjdGlvblJlc3BvbnNlPiB7XG4gICAgICAgIC8vIGVhc2lseSBpZGVudGlmaWFibGUgQVBJIGVuZHBvaW50IGluZm9ybWF0aW9uXG4gICAgICAgIGNvbnN0IGVuZHBvaW50SW5mbyA9ICd1cGRhdGVUcmFuc2FjdGlvbiBNdXRhdGlvbiBNb29uYmVhbSBHcmFwaFFMIEFQSSc7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBBUEkgS2V5IGFuZCBCYXNlIFVSTCwgbmVlZGVkIGluIG9yZGVyIHRvIG1ha2UgdGhlIHRyYW5zYWN0aW9uIHVwZGF0ZWQgY2FsbCB0aHJvdWdoIHRoZSBjbGllbnRcbiAgICAgICAgICAgIGNvbnN0IFttb29uYmVhbUJhc2VVUkwsIG1vb25iZWFtUHJpdmF0ZUtleV0gPSBhd2FpdCBzdXBlci5yZXRyaWV2ZVNlcnZpY2VDcmVkZW50aWFscyhDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5NT09OQkVBTV9JTlRFUk5BTF9TRUNSRVRfTkFNRSk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB3ZSBvYnRhaW5lZCBhbnkgaW52YWxpZCBzZWNyZXQgdmFsdWVzIGZyb20gdGhlIGNhbGwgYWJvdmVcbiAgICAgICAgICAgIGlmIChtb29uYmVhbUJhc2VVUkwgPT09IG51bGwgfHwgbW9vbmJlYW1CYXNlVVJMLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG1vb25iZWFtUHJpdmF0ZUtleSA9PT0gbnVsbCB8fCBtb29uYmVhbVByaXZhdGVLZXkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gXCJJbnZhbGlkIFNlY3JldHMgb2J0YWluZWQgZm9yIE1vb25iZWFtIEFQSSBjYWxsIVwiO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiB1cGRhdGVUcmFuc2FjdGlvbiBRdWVyeVxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIGJ1aWxkIHRoZSBNb29uYmVhbSBBcHBTeW5jIEFQSSBHcmFwaFFMIHF1ZXJ5LCBhbmQgcGVyZm9ybSBhIFBPU1QgdG8gaXQsXG4gICAgICAgICAgICAgKiB3aXRoIHRoZSBhcHByb3ByaWF0ZSBpbmZvcm1hdGlvbi5cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiB3ZSBpbXBseSB0aGF0IGlmIHRoZSBBUEkgZG9lcyBub3QgcmVzcG9uZCBpbiAxNSBzZWNvbmRzLCB0aGVuIHdlIGF1dG9tYXRpY2FsbHkgY2F0Y2ggdGhhdCwgYW5kIHJldHVybiBhblxuICAgICAgICAgICAgICogZXJyb3IgZm9yIGEgYmV0dGVyIGN1c3RvbWVyIGV4cGVyaWVuY2UuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHJldHVybiBheGlvcy5wb3N0KGAke21vb25iZWFtQmFzZVVSTH1gLCB7XG4gICAgICAgICAgICAgICAgcXVlcnk6IHVwZGF0ZVRyYW5zYWN0aW9uLFxuICAgICAgICAgICAgICAgIHZhcmlhYmxlczoge1xuICAgICAgICAgICAgICAgICAgICB1cGRhdGVUcmFuc2FjdGlvbklucHV0OiB1cGRhdGVUcmFuc2FjdGlvbklucHV0XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgICAgIFwieC1hcGkta2V5XCI6IG1vb25iZWFtUHJpdmF0ZUtleVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGltZW91dDogMTUwMDAsIC8vIGluIG1pbGxpc2Vjb25kcyBoZXJlXG4gICAgICAgICAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZTogJ01vb25iZWFtIEFQSSB0aW1lZCBvdXQgYWZ0ZXIgMTUwMDBtcyEnXG4gICAgICAgICAgICB9KS50aGVuKHVwZGF0ZVRyYW5zYWN0aW9uUmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeSh1cGRhdGVUcmFuc2FjdGlvblJlc3BvbnNlLmRhdGEpfWApO1xuXG4gICAgICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIGRhdGEgYmxvY2sgZnJvbSB0aGUgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICBjb25zdCByZXNwb25zZURhdGEgPSAodXBkYXRlVHJhbnNhY3Rpb25SZXNwb25zZSAmJiB1cGRhdGVUcmFuc2FjdGlvblJlc3BvbnNlLmRhdGEpID8gdXBkYXRlVHJhbnNhY3Rpb25SZXNwb25zZS5kYXRhLmRhdGEgOiBudWxsO1xuXG4gICAgICAgICAgICAgICAgLy8gY2hlY2sgaWYgdGhlcmUgYXJlIGFueSBlcnJvcnMgaW4gdGhlIHJldHVybmVkIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlRGF0YSAmJiByZXNwb25zZURhdGEudXBkYXRlVHJhbnNhY3Rpb24uZXJyb3JNZXNzYWdlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHJldHVybmVkIHRoZSBzdWNjZXNzZnVsbHkgdXBkYXRlZCB0cmFuc2FjdGlvbmFsIGluZm9ybWF0aW9uXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiByZXNwb25zZURhdGEudXBkYXRlVHJhbnNhY3Rpb24uZGF0YSBhcyBNb29uYmVhbVVwZGF0ZWRUcmFuc2FjdGlvblxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlRGF0YSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIGVycm9yIG1lc3NhZ2UgYW5kIHR5cGUsIGZyb20gdGhlIG9yaWdpbmFsIEFwcFN5bmMgY2FsbFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogcmVzcG9uc2VEYXRhLnVwZGF0ZVRyYW5zYWN0aW9uLmVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IHJlc3BvbnNlRGF0YS51cGRhdGVUcmFuc2FjdGlvbi5lcnJvclR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gOlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBlcnJvciByZXNwb25zZSBpbmRpY2F0aW5nIGFuIGludmFsaWQgc3RydWN0dXJlIHJldHVybmVkXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgSW52YWxpZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UhYCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yLnJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBhbmQgdGhlIHNlcnZlciByZXNwb25kZWQgd2l0aCBhIHN0YXR1cyBjb2RlXG4gICAgICAgICAgICAgICAgICAgICAqIHRoYXQgZmFsbHMgb3V0IG9mIHRoZSByYW5nZSBvZiAyeHguXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm9uIDJ4eHggcmVzcG9uc2Ugd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgd2l0aCBzdGF0dXMgJHtlcnJvci5yZXNwb25zZS5zdGF0dXN9LCBhbmQgcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShlcnJvci5yZXNwb25zZS5kYXRhKX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGFueSBvdGhlciBzcGVjaWZpYyBlcnJvcnMgdG8gYmUgZmlsdGVyZWQgYmVsb3dcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5yZXF1ZXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBidXQgbm8gcmVzcG9uc2Ugd2FzIHJlY2VpdmVkXG4gICAgICAgICAgICAgICAgICAgICAqIGBlcnJvci5yZXF1ZXN0YCBpcyBhbiBpbnN0YW5jZSBvZiBYTUxIdHRwUmVxdWVzdCBpbiB0aGUgYnJvd3NlciBhbmQgYW4gaW5zdGFuY2Ugb2ZcbiAgICAgICAgICAgICAgICAgICAgICogIGh0dHAuQ2xpZW50UmVxdWVzdCBpbiBub2RlLmpzLlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vIHJlc3BvbnNlIHJlY2VpdmVkIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBNb29uYmVhbSBBUEksIGZvciByZXF1ZXN0ICR7ZXJyb3IucmVxdWVzdH1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNvbWV0aGluZyBoYXBwZW5lZCBpbiBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IHRoYXQgdHJpZ2dlcmVkIGFuIEVycm9yXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgZm9yIHRoZSAke2VuZHBvaW50SW5mb30gTW9vbmJlYW0gQVBJLCAkeyhlcnJvciAmJiBlcnJvci5tZXNzYWdlKSAmJiBlcnJvci5tZXNzYWdlfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgdXBkYXRpbmcgdHJhbnNhY3Rpb25hbCBkYXRhLCB0aHJvdWdoICR7ZW5kcG9pbnRJbmZvfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9ICR7ZXJyfWApO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHVzZWQgdG8gY3JlYXRlIGEgbm90aWZpY2F0aW9uLlxuICAgICAqXG4gICAgICogQHBhcmFtIGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0IHRoZSBub3RpZmljYXRpb24gZGV0YWlscyB0byBiZSBwYXNzZWQgaW4sIGluIG9yZGVyIHRvIGNyZWF0ZSBhIG5ld1xuICAgICAqIG5vdGlmaWNhdGlvblxuICAgICAqXG4gICAgICogQHJldHVybnMgYSB7QGxpbmsgQ3JlYXRlTm90aWZpY2F0aW9uUmVzcG9uc2V9IHJlcHJlc2VudGluZyB0aGUgbmV3bHkgY3JlYXRlZCBub3RpZmljYXRpb24gZGF0YVxuICAgICAqL1xuICAgIGFzeW5jIGNyZWF0ZU5vdGlmaWNhdGlvbihjcmVhdGVOb3RpZmljYXRpb25JbnB1dDogQ3JlYXRlTm90aWZpY2F0aW9uSW5wdXQpOiBQcm9taXNlPENyZWF0ZU5vdGlmaWNhdGlvblJlc3BvbnNlPiB7XG4gICAgICAgIC8vIGVhc2lseSBpZGVudGlmaWFibGUgQVBJIGVuZHBvaW50IGluZm9ybWF0aW9uXG4gICAgICAgIGNvbnN0IGVuZHBvaW50SW5mbyA9ICdjcmVhdGVOb3RpZmljYXRpb24gTXV0YXRpb24gTW9vbmJlYW0gR3JhcGhRTCBBUEknO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgQVBJIEtleSBhbmQgQmFzZSBVUkwsIG5lZWRlZCBpbiBvcmRlciB0byBtYWtlIGEgbm90aWZpY2F0aW9uIGNyZWF0aW9uIGNhbGwgdGhyb3VnaCB0aGUgY2xpZW50XG4gICAgICAgICAgICBjb25zdCBbbW9vbmJlYW1CYXNlVVJMLCBtb29uYmVhbVByaXZhdGVLZXldID0gYXdhaXQgc3VwZXIucmV0cmlldmVTZXJ2aWNlQ3JlZGVudGlhbHMoQ29uc3RhbnRzLkFXU1BhaXJDb25zdGFudHMuTU9PTkJFQU1fSU5URVJOQUxfU0VDUkVUX05BTUUpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgd2Ugb2J0YWluZWQgYW55IGludmFsaWQgc2VjcmV0IHZhbHVlcyBmcm9tIHRoZSBjYWxsIGFib3ZlXG4gICAgICAgICAgICBpZiAobW9vbmJlYW1CYXNlVVJMID09PSBudWxsIHx8IG1vb25iZWFtQmFzZVVSTC5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBtb29uYmVhbVByaXZhdGVLZXkgPT09IG51bGwgfHwgbW9vbmJlYW1Qcml2YXRlS2V5Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IFwiSW52YWxpZCBTZWNyZXRzIG9idGFpbmVkIGZvciBNb29uYmVhbSBBUEkgY2FsbCFcIjtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIGNyZWF0ZU5vdGlmaWNhdGlvbiBRdWVyeVxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIGJ1aWxkIHRoZSBNb29uYmVhbSBBcHBTeW5jIEFQSSBHcmFwaFFMIHF1ZXJ5LCBhbmQgcGVyZm9ybSBhIFBPU1QgdG8gaXQsXG4gICAgICAgICAgICAgKiB3aXRoIHRoZSBhcHByb3ByaWF0ZSBpbmZvcm1hdGlvbi5cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiB3ZSBpbXBseSB0aGF0IGlmIHRoZSBBUEkgZG9lcyBub3QgcmVzcG9uZCBpbiAxNSBzZWNvbmRzLCB0aGVuIHdlIGF1dG9tYXRpY2FsbHkgY2F0Y2ggdGhhdCwgYW5kIHJldHVybiBhblxuICAgICAgICAgICAgICogZXJyb3IgZm9yIGEgYmV0dGVyIGN1c3RvbWVyIGV4cGVyaWVuY2UuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHJldHVybiBheGlvcy5wb3N0KGAke21vb25iZWFtQmFzZVVSTH1gLCB7XG4gICAgICAgICAgICAgICAgcXVlcnk6IGNyZWF0ZU5vdGlmaWNhdGlvbixcbiAgICAgICAgICAgICAgICB2YXJpYWJsZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQ6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgICAgIFwieC1hcGkta2V5XCI6IG1vb25iZWFtUHJpdmF0ZUtleVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGltZW91dDogMTUwMDAsIC8vIGluIG1pbGxpc2Vjb25kcyBoZXJlXG4gICAgICAgICAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZTogJ01vb25iZWFtIEFQSSB0aW1lZCBvdXQgYWZ0ZXIgMTUwMDBtcyEnXG4gICAgICAgICAgICB9KS50aGVuKGNyZWF0ZU5vdGlmaWNhdGlvblJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlbmRwb2ludEluZm99IHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoY3JlYXRlTm90aWZpY2F0aW9uUmVzcG9uc2UuZGF0YSl9YCk7XG5cbiAgICAgICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgZGF0YSBibG9jayBmcm9tIHRoZSByZXNwb25zZVxuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlRGF0YSA9IChjcmVhdGVOb3RpZmljYXRpb25SZXNwb25zZSAmJiBjcmVhdGVOb3RpZmljYXRpb25SZXNwb25zZS5kYXRhKSA/IGNyZWF0ZU5vdGlmaWNhdGlvblJlc3BvbnNlLmRhdGEuZGF0YSA6IG51bGw7XG5cbiAgICAgICAgICAgICAgICAvLyBjaGVjayBpZiB0aGVyZSBhcmUgYW55IGVycm9ycyBpbiB0aGUgcmV0dXJuZWQgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2VEYXRhICYmIHJlc3BvbnNlRGF0YS5jcmVhdGVOb3RpZmljYXRpb24uZXJyb3JNZXNzYWdlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHJldHVybmVkIHRoZSBzdWNjZXNzZnVsbHkgY3JlYXRlZCBub3RpZmljYXRpb25cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiByZXNwb25zZURhdGEuY3JlYXRlTm90aWZpY2F0aW9uLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogcmVzcG9uc2VEYXRhLmNyZWF0ZU5vdGlmaWNhdGlvbi5kYXRhIGFzIE5vdGlmaWNhdGlvblxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlRGF0YSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIGVycm9yIG1lc3NhZ2UgYW5kIHR5cGUsIGZyb20gdGhlIG9yaWdpbmFsIEFwcFN5bmMgY2FsbFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogcmVzcG9uc2VEYXRhLmNyZWF0ZU5vdGlmaWNhdGlvbi5lcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiByZXNwb25zZURhdGEuY3JlYXRlTm90aWZpY2F0aW9uLmVycm9yVHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIGVycm9yIHJlc3BvbnNlIGluZGljYXRpbmcgYW4gaW52YWxpZCBzdHJ1Y3R1cmUgcmV0dXJuZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBJbnZhbGlkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tICR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSFgLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yLnJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBhbmQgdGhlIHNlcnZlciByZXNwb25kZWQgd2l0aCBhIHN0YXR1cyBjb2RlXG4gICAgICAgICAgICAgICAgICAgICAqIHRoYXQgZmFsbHMgb3V0IG9mIHRoZSByYW5nZSBvZiAyeHguXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm9uIDJ4eHggcmVzcG9uc2Ugd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgd2l0aCBzdGF0dXMgJHtlcnJvci5yZXNwb25zZS5zdGF0dXN9LCBhbmQgcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShlcnJvci5yZXNwb25zZS5kYXRhKX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGFueSBvdGhlciBzcGVjaWZpYyBlcnJvcnMgdG8gYmUgZmlsdGVyZWQgYmVsb3dcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3IucmVxdWVzdCkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYnV0IG5vIHJlc3BvbnNlIHdhcyByZWNlaXZlZFxuICAgICAgICAgICAgICAgICAgICAgKiBgZXJyb3IucmVxdWVzdGAgaXMgYW4gaW5zdGFuY2Ugb2YgWE1MSHR0cFJlcXVlc3QgaW4gdGhlIGJyb3dzZXIgYW5kIGFuIGluc3RhbmNlIG9mXG4gICAgICAgICAgICAgICAgICAgICAqICBodHRwLkNsaWVudFJlcXVlc3QgaW4gbm9kZS5qcy5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBObyByZXNwb25zZSByZWNlaXZlZCB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gTW9vbmJlYW0gQVBJLCBmb3IgcmVxdWVzdCAke2Vycm9yLnJlcXVlc3R9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU29tZXRoaW5nIGhhcHBlbmVkIGluIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgdGhhdCB0cmlnZ2VyZWQgYW4gRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgc2V0dGluZyB1cCB0aGUgcmVxdWVzdCBmb3IgdGhlICR7ZW5kcG9pbnRJbmZvfSBNb29uYmVhbSBBUEksICR7KGVycm9yICYmIGVycm9yLm1lc3NhZ2UpICYmIGVycm9yLm1lc3NhZ2V9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgY3JlYXRpbmcgYSBub3RpZmljYXRpb24sIHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJ9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHVzZWQgdG8gZ2V0IGFsbCB0aGUgcGh5c2ljYWwgZGV2aWNlcyBhc3NvY2lhdGVkIHdpdGggYSBwYXJ0aWN1bGFyIHVzZXIuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZ2V0RGV2aWNlc0ZvclVzZXJJbnB1dCB0aGUgZGV2aWNlcyBmb3IgdXNlciBpbnB1dCwgY29udGFpbmluZyB0aGUgZmlsdGVyaW5nIGluZm9ybWF0aW9uXG4gICAgICogdXNlZCB0byByZXRyaWV2ZSBhbGwgdGhlIHBoeXNpY2FsIGRldmljZXMgZm9yIGEgcGFydGljdWxhciB1c2VyLlxuICAgICAqXG4gICAgICogQHJldHVybnMgYSB7QGxpbmsgVXNlckRldmljZXNSZXNwb25zZX0gcmVwcmVzZW50aW5nIHRoZSBtYXRjaGVkIHBoeXNpY2FsIGRldmljZXMnIGluZm9ybWF0aW9uLlxuICAgICAqL1xuICAgIGFzeW5jIGdldERldmljZXNGb3JVc2VyKGdldERldmljZXNGb3JVc2VySW5wdXQ6IEdldERldmljZXNGb3JVc2VySW5wdXQpOiBQcm9taXNlPFVzZXJEZXZpY2VzUmVzcG9uc2U+IHtcbiAgICAgICAgLy8gZWFzaWx5IGlkZW50aWZpYWJsZSBBUEkgZW5kcG9pbnQgaW5mb3JtYXRpb25cbiAgICAgICAgY29uc3QgZW5kcG9pbnRJbmZvID0gJ2dldERldmljZXNGb3JVc2VyIFF1ZXJ5IE1vb25iZWFtIEdyYXBoUUwgQVBJJztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIEFQSSBLZXkgYW5kIEJhc2UgVVJMLCBuZWVkZWQgaW4gb3JkZXIgdG8gbWFrZSB0aGUgZGV2aWNlcyBmb3IgdXNlciByZXRyaWV2YWwgY2FsbCB0aHJvdWdoIHRoZSBjbGllbnRcbiAgICAgICAgICAgIGNvbnN0IFttb29uYmVhbUJhc2VVUkwsIG1vb25iZWFtUHJpdmF0ZUtleV0gPSBhd2FpdCBzdXBlci5yZXRyaWV2ZVNlcnZpY2VDcmVkZW50aWFscyhDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5NT09OQkVBTV9JTlRFUk5BTF9TRUNSRVRfTkFNRSk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB3ZSBvYnRhaW5lZCBhbnkgaW52YWxpZCBzZWNyZXQgdmFsdWVzIGZyb20gdGhlIGNhbGwgYWJvdmVcbiAgICAgICAgICAgIGlmIChtb29uYmVhbUJhc2VVUkwgPT09IG51bGwgfHwgbW9vbmJlYW1CYXNlVVJMLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG1vb25iZWFtUHJpdmF0ZUtleSA9PT0gbnVsbCB8fCBtb29uYmVhbVByaXZhdGVLZXkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gXCJJbnZhbGlkIFNlY3JldHMgb2J0YWluZWQgZm9yIE1vb25iZWFtIEFQSSBjYWxsIVwiO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBVc2VyRGV2aWNlRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogZ2V0RGV2aWNlc0ZvclVzZXIgUXVlcnlcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBidWlsZCB0aGUgTW9vbmJlYW0gQXBwU3luYyBBUEkgR3JhcGhRTCBxdWVyeSwgYW5kIHBlcmZvcm0gYSBQT1NUIHRvIGl0LFxuICAgICAgICAgICAgICogd2l0aCB0aGUgYXBwcm9wcmlhdGUgaW5mb3JtYXRpb24uXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogd2UgaW1wbHkgdGhhdCBpZiB0aGUgQVBJIGRvZXMgbm90IHJlc3BvbmQgaW4gMTUgc2Vjb25kcywgdGhlbiB3ZSBhdXRvbWF0aWNhbGx5IGNhdGNoIHRoYXQsIGFuZCByZXR1cm4gYW5cbiAgICAgICAgICAgICAqIGVycm9yIGZvciBhIGJldHRlciBjdXN0b21lciBleHBlcmllbmNlLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICByZXR1cm4gYXhpb3MucG9zdChgJHttb29uYmVhbUJhc2VVUkx9YCwge1xuICAgICAgICAgICAgICAgIHF1ZXJ5OiBnZXREZXZpY2VzRm9yVXNlcixcbiAgICAgICAgICAgICAgICB2YXJpYWJsZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgZ2V0RGV2aWNlc0ZvclVzZXJJbnB1dDogZ2V0RGV2aWNlc0ZvclVzZXJJbnB1dFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgICAgICBcIngtYXBpLWtleVwiOiBtb29uYmVhbVByaXZhdGVLZXlcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDE1MDAwLCAvLyBpbiBtaWxsaXNlY29uZHMgaGVyZVxuICAgICAgICAgICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2U6ICdNb29uYmVhbSBBUEkgdGltZWQgb3V0IGFmdGVyIDE1MDAwbXMhJ1xuICAgICAgICAgICAgfSkudGhlbihnZXREZXZpY2VzRm9yVXNlclJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlbmRwb2ludEluZm99IHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZ2V0RGV2aWNlc0ZvclVzZXJSZXNwb25zZS5kYXRhKX1gKTtcblxuICAgICAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBkYXRhIGJsb2NrIGZyb20gdGhlIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2VEYXRhID0gKGdldERldmljZXNGb3JVc2VyUmVzcG9uc2UgJiYgZ2V0RGV2aWNlc0ZvclVzZXJSZXNwb25zZS5kYXRhKSA/IGdldERldmljZXNGb3JVc2VyUmVzcG9uc2UuZGF0YS5kYXRhIDogbnVsbDtcblxuICAgICAgICAgICAgICAgIC8vIGNoZWNrIGlmIHRoZXJlIGFyZSBhbnkgZXJyb3JzIGluIHRoZSByZXR1cm5lZCByZXNwb25zZVxuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZURhdGEgJiYgcmVzcG9uc2VEYXRhLmdldERldmljZXNGb3JVc2VyLmVycm9yTWVzc2FnZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm5lZCB0aGUgc3VjY2Vzc2Z1bGx5IHJldHJpZXZlZCBwaHlzaWNhbCBkZXZpY2VzIGZvciBhIGdpdmVuIHVzZXJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHJlc3BvbnNlRGF0YS5nZXREZXZpY2VzRm9yVXNlci5kYXRhIGFzIFB1c2hEZXZpY2VbXVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlRGF0YSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIGVycm9yIG1lc3NhZ2UgYW5kIHR5cGUsIGZyb20gdGhlIG9yaWdpbmFsIEFwcFN5bmMgY2FsbFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogcmVzcG9uc2VEYXRhLmdldERldmljZXNGb3JVc2VyLmVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IHJlc3BvbnNlRGF0YS5nZXREZXZpY2VzRm9yVXNlci5lcnJvclR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gOlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBlcnJvciByZXNwb25zZSBpbmRpY2F0aW5nIGFuIGludmFsaWQgc3RydWN0dXJlIHJldHVybmVkXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgSW52YWxpZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UhYCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFVzZXJEZXZpY2VFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvci5yZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYW5kIHRoZSBzZXJ2ZXIgcmVzcG9uZGVkIHdpdGggYSBzdGF0dXMgY29kZVxuICAgICAgICAgICAgICAgICAgICAgKiB0aGF0IGZhbGxzIG91dCBvZiB0aGUgcmFuZ2Ugb2YgMnh4LlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vbiAyeHh4IHJlc3BvbnNlIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBNb29uYmVhbSBBUEksIHdpdGggc3RhdHVzICR7ZXJyb3IucmVzcG9uc2Uuc3RhdHVzfSwgYW5kIHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZXJyb3IucmVzcG9uc2UuZGF0YSl9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBhbnkgb3RoZXIgc3BlY2lmaWMgZXJyb3JzIHRvIGJlIGZpbHRlcmVkIGJlbG93XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVXNlckRldmljZUVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVycm9yLnJlcXVlc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGJ1dCBubyByZXNwb25zZSB3YXMgcmVjZWl2ZWRcbiAgICAgICAgICAgICAgICAgICAgICogYGVycm9yLnJlcXVlc3RgIGlzIGFuIGluc3RhbmNlIG9mIFhNTEh0dHBSZXF1ZXN0IGluIHRoZSBicm93c2VyIGFuZCBhbiBpbnN0YW5jZSBvZlxuICAgICAgICAgICAgICAgICAgICAgKiAgaHR0cC5DbGllbnRSZXF1ZXN0IGluIG5vZGUuanMuXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm8gcmVzcG9uc2UgcmVjZWl2ZWQgd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgZm9yIHJlcXVlc3QgJHtlcnJvci5yZXF1ZXN0fWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBVc2VyRGV2aWNlRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNvbWV0aGluZyBoYXBwZW5lZCBpbiBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IHRoYXQgdHJpZ2dlcmVkIGFuIEVycm9yXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgZm9yIHRoZSAke2VuZHBvaW50SW5mb30gTW9vbmJlYW0gQVBJLCAkeyhlcnJvciAmJiBlcnJvci5tZXNzYWdlKSAmJiBlcnJvci5tZXNzYWdlfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBVc2VyRGV2aWNlRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHJldHJpZXZpbmcgcGh5c2ljYWwgZGV2aWNlcyBmb3IgYSBwYXJ0aWN1bGFyIHVzZXIsIHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJ9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBVc2VyRGV2aWNlRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==