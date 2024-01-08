import {BaseAPIClient} from "./BaseAPIClient";
import {Constants} from "../Constants";
import {
    CardLinkErrorType,
    CreateNotificationInput,
    CreateNotificationResponse,
    CreateTransactionInput,
    EligibleLinkedUser,
    EligibleLinkedUsersResponse,
    EmailFromCognitoResponse,
    GetDevicesForUserInput,
    GetMilitaryVerificationInformationInput,
    GetReferralsByStatusInput,
    GetTransactionByStatusInput,
    GetTransactionInput,
    IneligibleLinkedUsersResponse,
    MilitaryVerificationErrorType,
    MilitaryVerificationNotificationUpdate,
    MilitaryVerificationReportingErrorType,
    MilitaryVerificationReportingInformation,
    MilitaryVerificationReportingInformationResponse, MilitaryVerificationReportResponse,
    MoonbeamTransaction,
    MoonbeamTransactionByStatus,
    MoonbeamTransactionResponse,
    MoonbeamTransactionsByStatusResponse,
    MoonbeamTransactionsResponse,
    MoonbeamUpdatedTransaction,
    MoonbeamUpdatedTransactionResponse,
    Notification,
    NotificationReminder,
    NotificationReminderErrorType,
    NotificationReminderResponse,
    NotificationsErrorType,
    PushDevice, PutMilitaryVerificationReportInput,
    Referral,
    ReferralErrorType,
    ReferralResponse,
    RetrieveUserDetailsForNotifications, StorageErrorType,
    TransactionsErrorType,
    UpdatedTransactionEvent,
    UpdateNotificationReminderInput,
    UpdateReferralInput,
    UpdateTransactionInput,
    UserDeviceErrorType,
    UserDevicesResponse,
    UserForNotificationReminderResponse
} from "../GraphqlExports";
import axios from "axios";
import {
    createNotification,
    createTransaction,
    updateNotificationReminder,
    updateReferral,
    updateTransaction,
    putMilitaryVerificationReport
} from "../../graphql/mutations/Mutations";
import {
    getDevicesForUser,
    getEligibleLinkedUsers,
    getMilitaryVerificationInformation,
    getNotificationReminders,
    getReferralsByStatus,
    getTransaction,
    getTransactionByStatus,
    getUsersWithNoCards
} from "../../graphql/queries/Queries";
import {APIGatewayProxyResult} from "aws-lambda/trigger/api-gateway-proxy";
import {
    CognitoIdentityProviderClient,
    ListUsersCommand,
    ListUsersCommandInput,
    ListUsersCommandOutput,
    UserType
} from "@aws-sdk/client-cognito-identity-provider";

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
     * Function used to update and/or create an existing/new military verification report
     * file.
     *
     * @param putMilitaryVerificationReportInput the input containing the information that needs to be
     * transferred into the military verification report file.
     *
     * @returns a {@link MilitaryVerificationReportResponse}, representing a flag highlighting whether
     * the file was successfully updated or not.
     */
    async putMilitaryVerificationReport(putMilitaryVerificationReportInput: PutMilitaryVerificationReportInput): Promise<MilitaryVerificationReportResponse> {
        // easily identifiable API endpoint information
        const endpointInfo = 'putMilitaryVerificationReport Query Moonbeam GraphQL API';

        try {
            // retrieve the API Key and Base URL, needed in order to make the referral updated call through the client
            const [moonbeamBaseURL, moonbeamPrivateKey] = await super.retrieveServiceCredentials(Constants.AWSPairConstants.MOONBEAM_INTERNAL_SECRET_NAME);

            // check to see if we obtained any invalid secret values from the call above
            if (moonbeamBaseURL === null || moonbeamBaseURL.length === 0 ||
                moonbeamPrivateKey === null || moonbeamPrivateKey.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Moonbeam API call!";
                console.log(errorMessage);

                return {
                    errorMessage: errorMessage,
                    errorType: StorageErrorType.UnexpectedError
                };
            }

            /**
             * putMilitaryVerificationReport Query
             *
             * build the Moonbeam AppSync API GraphQL query, and perform a POST to it,
             * with the appropriate information.
             *
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            return axios.post(`${moonbeamBaseURL}`, {
                query: putMilitaryVerificationReport,
                variables: {
                    putMilitaryVerificationReportInput: putMilitaryVerificationReportInput
                }
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": moonbeamPrivateKey
                },
                timeout: 15000, // in milliseconds here
                timeoutErrorMessage: 'Moonbeam API timed out after 15000ms!'
            }).then(putMilitaryVerificationReportResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(putMilitaryVerificationReportResponse.data)}`);

                // retrieve the data block from the response
                const responseData = (putMilitaryVerificationReportResponse && putMilitaryVerificationReportResponse.data)
                    ? putMilitaryVerificationReportResponse.data.data
                    : null;

                // check if there are any errors in the returned response
                if (responseData && responseData.putMilitaryVerificationReport.errorMessage === null) {
                    // returned the successfully retrieved referrals
                    return {
                        data: responseData.putMilitaryVerificationReport.data as string
                    }
                } else {
                    return responseData ?
                        // return the error message and type, from the original AppSync call
                        {
                            errorMessage: responseData.updateReferral.errorMessage,
                            errorType: responseData.updateReferral.errorType
                        } :
                        // return the error response indicating an invalid structure returned
                        {
                            errorMessage: `Invalid response structure returned from ${endpointInfo} response!`,
                            errorType: StorageErrorType.ValidationError
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
                        errorType: StorageErrorType.UnexpectedError
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
                        errorType: StorageErrorType.UnexpectedError
                    };
                } else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Moonbeam API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);

                    return {
                        errorMessage: errorMessage,
                        errorType: StorageErrorType.UnexpectedError
                    };
                }
            });
        } catch (err) {
            const errorMessage = `Unexpected error while updating referral through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);

            return {
                errorMessage: errorMessage,
                errorType: StorageErrorType.UnexpectedError
            };
        }
    }

    /**
     * Function used to get the military verification information of one
     * or multiple users, depending on the filters passed in.
     *
     * @param getMilitaryVerificationInformationInput the input containing the military
     * verification relevant filtering.
     *
     * @returns a {@link MilitaryVerificationReportingInformationResponse}, representing the filtered
     * military verification information records.
     */
    async getMilitaryVerificationInformation(getMilitaryVerificationInformationInput: GetMilitaryVerificationInformationInput): Promise<MilitaryVerificationReportingInformationResponse> {
        // easily identifiable API endpoint information
        const endpointInfo = 'getMilitaryVerificationInformation Query Moonbeam GraphQL API';

        try {
            // retrieve the API Key and Base URL, needed in order to make the referral updated call through the client
            const [moonbeamBaseURL, moonbeamPrivateKey] = await super.retrieveServiceCredentials(Constants.AWSPairConstants.MOONBEAM_INTERNAL_SECRET_NAME);

            // check to see if we obtained any invalid secret values from the call above
            if (moonbeamBaseURL === null || moonbeamBaseURL.length === 0 ||
                moonbeamPrivateKey === null || moonbeamPrivateKey.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Moonbeam API call!";
                console.log(errorMessage);

                return {
                    errorMessage: errorMessage,
                    errorType: MilitaryVerificationReportingErrorType.UnexpectedError
                };
            }

            /**
             * getMilitaryVerificationInformation Query
             *
             * build the Moonbeam AppSync API GraphQL query, and perform a POST to it,
             * with the appropriate information.
             *
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            return axios.post(`${moonbeamBaseURL}`, {
                query: getMilitaryVerificationInformation,
                variables: {
                    getMilitaryVerificationInformationInput: getMilitaryVerificationInformationInput
                }
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": moonbeamPrivateKey
                },
                timeout: 15000, // in milliseconds here
                timeoutErrorMessage: 'Moonbeam API timed out after 15000ms!'
            }).then(getMilitaryVerificationInformationInputResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(getMilitaryVerificationInformationInputResponse.data)}`);

                // retrieve the data block from the response
                const responseData = (getMilitaryVerificationInformationInputResponse && getMilitaryVerificationInformationInputResponse.data)
                    ? getMilitaryVerificationInformationInputResponse.data.data
                    : null;

                // check if there are any errors in the returned response
                if (responseData && responseData.getMilitaryVerificationInformation.errorMessage === null) {
                    // returned the successfully retrieved referrals
                    return {
                        data: responseData.getMilitaryVerificationInformation.data as MilitaryVerificationReportingInformation[]
                    }
                } else {
                    return responseData ?
                        // return the error message and type, from the original AppSync call
                        {
                            errorMessage: responseData.updateReferral.errorMessage,
                            errorType: responseData.updateReferral.errorType
                        } :
                        // return the error response indicating an invalid structure returned
                        {
                            errorMessage: `Invalid response structure returned from ${endpointInfo} response!`,
                            errorType: MilitaryVerificationReportingErrorType.ValidationError
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
                        errorType: MilitaryVerificationReportingErrorType.UnexpectedError
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
                        errorType: MilitaryVerificationReportingErrorType.UnexpectedError
                    };
                } else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Moonbeam API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);

                    return {
                        errorMessage: errorMessage,
                        errorType: MilitaryVerificationReportingErrorType.UnexpectedError
                    };
                }
            });
        } catch (err) {
            const errorMessage = `Unexpected error while updating referral through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);

            return {
                errorMessage: errorMessage,
                errorType: MilitaryVerificationReportingErrorType.UnexpectedError
            };
        }
    }

    /**
     * Function used to update a referral's particular information.
     *
     * @param updateReferralInput the input containing any information relevant in
     * updating an existing referral object
     *
     * @returns a {@link ReferralResponse}, representing the updated referral information.
     *
     * @protected
     */
    async updateReferral(updateReferralInput: UpdateReferralInput): Promise<ReferralResponse> {
        // easily identifiable API endpoint information
        const endpointInfo = 'updateReferral Query Moonbeam GraphQL API';

        try {
            // retrieve the API Key and Base URL, needed in order to make the referral updated call through the client
            const [moonbeamBaseURL, moonbeamPrivateKey] = await super.retrieveServiceCredentials(Constants.AWSPairConstants.MOONBEAM_INTERNAL_SECRET_NAME);

            // check to see if we obtained any invalid secret values from the call above
            if (moonbeamBaseURL === null || moonbeamBaseURL.length === 0 ||
                moonbeamPrivateKey === null || moonbeamPrivateKey.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Moonbeam API call!";
                console.log(errorMessage);

                return {
                    errorMessage: errorMessage,
                    errorType: ReferralErrorType.UnexpectedError
                };
            }

            /**
             * updateReferral Query
             *
             * build the Moonbeam AppSync API GraphQL query, and perform a POST to it,
             * with the appropriate information.
             *
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            return axios.post(`${moonbeamBaseURL}`, {
                query: updateReferral,
                variables: {
                    updateReferralInput: updateReferralInput
                }
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": moonbeamPrivateKey
                },
                timeout: 15000, // in milliseconds here
                timeoutErrorMessage: 'Moonbeam API timed out after 15000ms!'
            }).then(updateReferralResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(updateReferralResponse.data)}`);

                // retrieve the data block from the response
                const responseData = (updateReferralResponse && updateReferralResponse.data) ? updateReferralResponse.data.data : null;

                // check if there are any errors in the returned response
                if (responseData && responseData.updateReferral.errorMessage === null) {
                    // returned the successfully retrieved referrals
                    return {
                        data: responseData.updateReferral.data as Referral[]
                    }
                } else {
                    return responseData ?
                        // return the error message and type, from the original AppSync call
                        {
                            errorMessage: responseData.updateReferral.errorMessage,
                            errorType: responseData.updateReferral.errorType
                        } :
                        // return the error response indicating an invalid structure returned
                        {
                            errorMessage: `Invalid response structure returned from ${endpointInfo} response!`,
                            errorType: ReferralErrorType.ValidationError
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
                        errorType: ReferralErrorType.UnexpectedError
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
                        errorType: ReferralErrorType.UnexpectedError
                    };
                } else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Moonbeam API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);

                    return {
                        errorMessage: errorMessage,
                        errorType: ReferralErrorType.UnexpectedError
                    };
                }
            });
        } catch (err) {
            const errorMessage = `Unexpected error while updating referral through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);

            return {
                errorMessage: errorMessage,
                errorType: ReferralErrorType.UnexpectedError
            };
        }
    }

    /**
     * Function used to get existing referrals filtered by a particular status.
     *
     * @param getReferralsByStatusInput the input containing any filtering information
     * pertaining the referral status that we would use to filter existing referrals by.
     *
     * @returns a {@link ReferralResponse}, representing the referral information filtered
     * by status.
     *
     * @protected
     */
    async getReferralByStatus(getReferralsByStatusInput: GetReferralsByStatusInput): Promise<ReferralResponse> {
        // easily identifiable API endpoint information
        const endpointInfo = 'getReferralByStatus Query Moonbeam GraphQL API';

        try {
            // retrieve the API Key and Base URL, needed in order to make the referral by status retrieval call through the client
            const [moonbeamBaseURL, moonbeamPrivateKey] = await super.retrieveServiceCredentials(Constants.AWSPairConstants.MOONBEAM_INTERNAL_SECRET_NAME);

            // check to see if we obtained any invalid secret values from the call above
            if (moonbeamBaseURL === null || moonbeamBaseURL.length === 0 ||
                moonbeamPrivateKey === null || moonbeamPrivateKey.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Moonbeam API call!";
                console.log(errorMessage);

                return {
                    errorMessage: errorMessage,
                    errorType: ReferralErrorType.UnexpectedError
                };
            }

            /**
             * getReferralByStatus Query
             *
             * build the Moonbeam AppSync API GraphQL query, and perform a POST to it,
             * with the appropriate information.
             *
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            return axios.post(`${moonbeamBaseURL}`, {
                query: getReferralsByStatus,
                variables: {
                    getReferralsByStatusInput: getReferralsByStatusInput
                }
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": moonbeamPrivateKey
                },
                timeout: 15000, // in milliseconds here
                timeoutErrorMessage: 'Moonbeam API timed out after 15000ms!'
            }).then(getReferralsByStatusResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(getReferralsByStatusResponse.data)}`);

                // retrieve the data block from the response
                const responseData = (getReferralsByStatusResponse && getReferralsByStatusResponse.data) ? getReferralsByStatusResponse.data.data : null;

                // check if there are any errors in the returned response
                if (responseData && responseData.getReferralsByStatus.errorMessage === null) {
                    // returned the successfully retrieved referrals
                    return {
                        data: responseData.getReferralsByStatus.data as Referral[]
                    }
                } else {
                    return responseData ?
                        // return the error message and type, from the original AppSync call
                        {
                            errorMessage: responseData.getReferralsByStatus.errorMessage,
                            errorType: responseData.getReferralsByStatus.errorType
                        } :
                        // return the error response indicating an invalid structure returned
                        {
                            errorMessage: `Invalid response structure returned from ${endpointInfo} response!`,
                            errorType: ReferralErrorType.ValidationError
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
                        errorType: ReferralErrorType.UnexpectedError
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
                        errorType: ReferralErrorType.UnexpectedError
                    };
                } else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Moonbeam API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);

                    return {
                        errorMessage: errorMessage,
                        errorType: ReferralErrorType.UnexpectedError
                    };
                }
            });
        } catch (err) {
            const errorMessage = `Unexpected error while retrieving referrals by status through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);

            return {
                errorMessage: errorMessage,
                errorType: ReferralErrorType.UnexpectedError
            };
        }
    }

    /**
     * Function used to get a user's contact information, based on certain
     * filters.
     *
     * @param contactInformationInput contact information input passed in, containing the
     * filters used to retrieve the user's contact information.
     *
     * @returns a {@link MilitaryVerificationReportingInformationResponse}, representing the user's filtered
     * contact information.
     */
    async retrieveContactInformationForUser(contactInformationInput: MilitaryVerificationReportingInformation): Promise<MilitaryVerificationReportingInformationResponse> {
        // easily identifiable API endpoint information
        const endpointInfo = '/listUsers for retrieveContactInformationForUser Cognito SDK call';

        try {
            // retrieve the Cognito access key, secret key and user pool id, needed in order to retrieve the filtered users, through the Cognito Identity provider client
            const [cognitoAccessKeyId, cognitoSecretKey, cognitoUserPoolId] = await super.retrieveServiceCredentials(Constants.AWSPairConstants.MOONBEAM_INTERNAL_SECRET_NAME,
                undefined,
                undefined,
                undefined,
                true);

            // check to see if we obtained any invalid secret values from the call above
            if (cognitoAccessKeyId === null || cognitoAccessKeyId.length === 0 ||
                cognitoSecretKey === null || cognitoSecretKey.length === 0 ||
                cognitoUserPoolId === null || (cognitoUserPoolId && cognitoUserPoolId.length === 0)) {
                const errorMessage = "Invalid Secrets obtained for Cognito SDK call call!";
                console.log(errorMessage);

                return {
                    errorMessage: errorMessage,
                    errorType: MilitaryVerificationReportingErrorType.UnexpectedError
                };
            }

            // initialize the Cognito Identity Provider client using the credentials obtained above
            const cognitoIdentityProviderClient = new CognitoIdentityProviderClient({
                region: this.region,
                credentials: {
                    accessKeyId: cognitoAccessKeyId,
                    secretAccessKey: cognitoSecretKey
                }
            });

            /**
             * execute the List Users command, using filters, in order to retrieve a user's contact information
             * (email and phone number) from their attributes.
             *
             * Retrieve the user by their family_name. If there are is more than 1 match returned, then we will match
             * the user based on their unique id, from the custom:userId attribute
             */
            const listUsersResponse: ListUsersCommandOutput = await cognitoIdentityProviderClient.send(new ListUsersCommand({
                UserPoolId: cognitoUserPoolId,
                AttributesToGet: ['email', 'phone_number', 'custom:userId'],
                Filter: `family_name= "${`${contactInformationInput.lastName}`.replaceAll("\"", "\\\"")}"`
            }));
            // check for a valid response from the Cognito List Users Command call
            if (listUsersResponse !== null && listUsersResponse.$metadata !== null && listUsersResponse.$metadata.httpStatusCode !== null &&
                listUsersResponse.$metadata.httpStatusCode !== undefined && listUsersResponse.$metadata.httpStatusCode === 200 &&
                listUsersResponse.Users !== null && listUsersResponse.Users !== undefined && listUsersResponse.Users!.length !== 0) {
                // If there are is more than 1 match returned, then we will match the user based on their unique id, from the custom:userId attribute
                let invalidAttributesFlag = false;
                listUsersResponse.Users.forEach(cognitoUser => {
                    if (cognitoUser.Attributes === null || cognitoUser.Attributes === undefined || cognitoUser.Attributes.length !== 3) {
                        invalidAttributesFlag = true;
                    }
                });
                // check for valid user attributes
                if (!invalidAttributesFlag) {
                    let matchedEmail: string | null = null;
                    let matchedPhoneNumber: string | null = null;

                    let noOfMatches = 0;
                    listUsersResponse.Users.forEach(cognitoUser => {
                        if (cognitoUser.Attributes![2].Value!.trim() === contactInformationInput.id.trim()) {
                            matchedEmail = cognitoUser.Attributes![0].Value!;
                            matchedPhoneNumber = cognitoUser.Attributes![1].Value!;
                            noOfMatches += 1;
                        }
                    });
                    if (noOfMatches === 1 && matchedEmail !== null && matchedPhoneNumber !== null) {
                        contactInformationInput.phoneNumber = matchedPhoneNumber;
                        contactInformationInput.emailAddress = matchedEmail;
                        return {
                            data: [contactInformationInput]
                        }
                    } else {
                        const errorMessage = `Couldn't find user in Cognito for ${contactInformationInput.id}`;
                        console.log(`${errorMessage}`);

                        return {
                            data: null,
                            errorType: MilitaryVerificationReportingErrorType.ValidationError,
                            errorMessage: errorMessage
                        };
                    }
                } else {
                    const errorMessage = `Invalid user attributes obtained`;
                    console.log(`${errorMessage}`);

                    return {
                        data: null,
                        errorType: MilitaryVerificationReportingErrorType.ValidationError,
                        errorMessage: errorMessage
                    };
                }
            } else {
                const errorMessage = `Invalid structure obtained while calling the get List Users Cognito command`;
                console.log(`${errorMessage}`);

                return {
                    data: null,
                    errorType: MilitaryVerificationReportingErrorType.ValidationError,
                    errorMessage: errorMessage
                };
            }
        } catch (err) {
            const errorMessage = `Unexpected error while retrieving the contact information for user ${contactInformationInput.id}, from Cognito through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);

            return {
                data: null,
                errorType: MilitaryVerificationReportingErrorType.UnexpectedError,
                errorMessage: errorMessage
            };
        }
    }

    /**
     * Function used to get all the users used to delivered
     * notification reminders to.
     *
     * @returns a {@link UserForNotificationReminderResponse}, representing each individual users'
     * user ID, first, last name and email.
     */
    async getAllUsersForNotificationReminders(): Promise<UserForNotificationReminderResponse> {
        // easily identifiable API endpoint information
        const endpointInfo = '/listUsers for getAllUsersForNotificationReminder Cognito SDK call';

        try {
            // retrieve the Cognito access key, secret key and user pool id, needed in order to retrieve all users through the Cognito Identity provider client
            const [cognitoAccessKeyId, cognitoSecretKey, cognitoUserPoolId] = await super.retrieveServiceCredentials(Constants.AWSPairConstants.MOONBEAM_INTERNAL_SECRET_NAME,
                undefined,
                undefined,
                undefined,
                true);

            // check to see if we obtained any invalid secret values from the call above
            if (cognitoAccessKeyId === null || cognitoAccessKeyId.length === 0 ||
                cognitoSecretKey === null || cognitoSecretKey.length === 0 ||
                cognitoUserPoolId === null || (cognitoUserPoolId && cognitoUserPoolId.length === 0)) {
                const errorMessage = "Invalid Secrets obtained for Cognito SDK call call!";
                console.log(errorMessage);

                return {
                    errorMessage: errorMessage,
                    errorType: NotificationReminderErrorType.UnexpectedError
                };
            }

            // initialize the Cognito Identity Provider client using the credentials obtained above
            const cognitoIdentityProviderClient = new CognitoIdentityProviderClient({
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
            const userResults: UserType[] = [];
            let lastPaginationToken: string | undefined;
            let input: ListUsersCommandInput = {
                UserPoolId: cognitoUserPoolId,
                AttributesToGet: ['given_name', 'family_name', 'email', 'custom:userId'],
                Limit: 60,
            };
            // keep getting users and updating the results array for users retrieved, until we run out of users to retrieve
            do {
                // execute the List Users command, given the input provided above
                const listUsersResponse: ListUsersCommandOutput = await cognitoIdentityProviderClient.send(
                    new ListUsersCommand(input)
                );

                /**
                 * check whether the List Users Command has a valid response/ valid list of users to be returned,
                 * and if so add in the resulting list accordingly.
                 */
                listUsersResponse.$metadata !== null && listUsersResponse.$metadata.httpStatusCode !== null &&
                listUsersResponse.$metadata.httpStatusCode !== undefined && listUsersResponse.$metadata.httpStatusCode === 200 &&
                listUsersResponse.Users !== null && listUsersResponse.Users !== undefined && listUsersResponse.Users!.length !== 0 &&
                userResults.push(...listUsersResponse.Users);

                // get the last pagination token from the retrieved output, and set the next input command's pagination token according to that
                lastPaginationToken = listUsersResponse.PaginationToken;
                input.PaginationToken = lastPaginationToken;
            } while (typeof lastPaginationToken !== undefined && typeof lastPaginationToken !== 'undefined' && lastPaginationToken !== undefined);

            // check for a valid response list, obtained from the Cognito List Users Command call
            if (userResults.length !== 0) {
                // loop through the list of users obtained through command, and return their emails and custom user IDs
                const userDetailsForNotificationReminder: RetrieveUserDetailsForNotifications[] = [];
                userResults.forEach(cognitoUser => {
                    if (cognitoUser.Attributes !== undefined && cognitoUser.Attributes!.length === 4 &&
                        cognitoUser.Attributes![0] !== undefined && cognitoUser.Attributes![0].Value!.length !== 0 &&
                        cognitoUser.Attributes![1] !== undefined && cognitoUser.Attributes![1].Value!.length !== 0 &&
                        cognitoUser.Attributes![2] !== undefined && cognitoUser.Attributes![2].Value!.length !== 0 &&
                        cognitoUser.Attributes![3] !== undefined && cognitoUser.Attributes![3].Value!.length !== 0) {
                        // push the new user details in the user details array to be returned
                        userDetailsForNotificationReminder.push({
                            id: cognitoUser.Attributes![3].Value!,
                            email: cognitoUser.Attributes![2].Value!,
                            firstName: cognitoUser.Attributes![0].Value!,
                            lastName: cognitoUser.Attributes![1].Value!,
                        });
                    }
                });
                // ensure that the size of the list of user details to be returned, matches the number of users retrieved through the List Users Command
                if (userDetailsForNotificationReminder.length === userResults.length) {
                    // return the results appropriately
                    return {
                        data: userDetailsForNotificationReminder
                    }
                } else {
                    const errorMessage = `User detail list length does not match the retrieved user list`;
                    console.log(`${errorMessage}`);

                    return {
                        data: null,
                        errorType: NotificationReminderErrorType.ValidationError,
                        errorMessage: errorMessage
                    };
                }
            } else {
                const errorMessage = `Invalid/Empty user list array, obtained while calling the get List Users Cognito command`;
                console.log(`${errorMessage}`);

                return {
                    data: null,
                    errorType: NotificationReminderErrorType.ValidationError,
                    errorMessage: errorMessage
                };
            }
        } catch (err) {
            const errorMessage = `Unexpected error while retrieving email and custom id for notification reminders for users, from Cognito through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);

            return {
                data: null,
                errorType: NotificationReminderErrorType.UnexpectedError,
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
    async getEmailForUser(militaryVerificationNotificationUpdate: MilitaryVerificationNotificationUpdate): Promise<EmailFromCognitoResponse> {
        // easily identifiable API endpoint information
        const endpointInfo = '/listUsers for getEmailForUser Cognito SDK call';

        try {
            // retrieve the Cognito access key, secret key and user pool id, needed in order to retrieve the user email through the Cognito Identity provider client
            const [cognitoAccessKeyId, cognitoSecretKey, cognitoUserPoolId] = await super.retrieveServiceCredentials(Constants.AWSPairConstants.MOONBEAM_INTERNAL_SECRET_NAME,
                undefined,
                undefined,
                undefined,
                true);

            // check to see if we obtained any invalid secret values from the call above
            if (cognitoAccessKeyId === null || cognitoAccessKeyId.length === 0 ||
                cognitoSecretKey === null || cognitoSecretKey.length === 0 ||
                cognitoUserPoolId === null || (cognitoUserPoolId && cognitoUserPoolId.length === 0)) {
                const errorMessage = "Invalid Secrets obtained for Cognito SDK call call!";
                console.log(errorMessage);

                return {
                    errorMessage: errorMessage,
                    errorType: NotificationsErrorType.UnexpectedError
                };
            }

            // initialize the Cognito Identity Provider client using the credentials obtained above
            const cognitoIdentityProviderClient = new CognitoIdentityProviderClient({
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
            const listUsersResponse: ListUsersCommandOutput = await cognitoIdentityProviderClient.send(new ListUsersCommand({
                UserPoolId: cognitoUserPoolId,
                AttributesToGet: ['email', 'custom:userId'],
                Filter: `family_name= "${`${militaryVerificationNotificationUpdate.lastName}`.replaceAll("\"", "\\\"")}"`
            }));
            // check for a valid response from the Cognito List Users Command call
            if (listUsersResponse !== null && listUsersResponse.$metadata !== null && listUsersResponse.$metadata.httpStatusCode !== null &&
                listUsersResponse.$metadata.httpStatusCode !== undefined && listUsersResponse.$metadata.httpStatusCode === 200 &&
                listUsersResponse.Users !== null && listUsersResponse.Users !== undefined && listUsersResponse.Users!.length !== 0) {
                // If there are is more than 1 match returned, then we will match the user based on their unique id, from the custom:userId attribute
                let invalidAttributesFlag = false;
                listUsersResponse.Users.forEach(cognitoUser => {
                    if (cognitoUser.Attributes === null || cognitoUser.Attributes === undefined || cognitoUser.Attributes.length !== 2) {
                        invalidAttributesFlag = true;
                    }
                });
                // check for valid user attributes
                if (!invalidAttributesFlag) {
                    let matchedEmail: string | null = null;
                    let noOfMatches = 0;
                    listUsersResponse.Users.forEach(cognitoUser => {
                        if (cognitoUser.Attributes![1].Value!.trim() === militaryVerificationNotificationUpdate.id.trim()) {
                            matchedEmail = cognitoUser.Attributes![0].Value!;
                            noOfMatches += 1;
                        }
                    });
                    if (noOfMatches === 1) {
                        return {
                            data: matchedEmail
                        }
                    } else {
                        const errorMessage = `Couldn't find user in Cognito for ${militaryVerificationNotificationUpdate.id}`;
                        console.log(`${errorMessage}`);

                        return {
                            data: null,
                            errorType: NotificationsErrorType.ValidationError,
                            errorMessage: errorMessage
                        };
                    }
                } else {
                    const errorMessage = `Invalid user attributes obtained`;
                    console.log(`${errorMessage}`);

                    return {
                        data: null,
                        errorType: NotificationsErrorType.ValidationError,
                        errorMessage: errorMessage
                    };
                }
            } else {
                const errorMessage = `Invalid structure obtained while calling the get List Users Cognito command`;
                console.log(`${errorMessage}`);

                return {
                    data: null,
                    errorType: NotificationsErrorType.ValidationError,
                    errorMessage: errorMessage
                };
            }
        } catch (err) {
            const errorMessage = `Unexpected error while retrieving email for user from Cognito through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);

            return {
                data: null,
                errorType: NotificationsErrorType.UnexpectedError,
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
    async militaryVerificationUpdatesAcknowledgment(militaryVerificationNotificationUpdate: MilitaryVerificationNotificationUpdate): Promise<APIGatewayProxyResult> {
        // easily identifiable API endpoint information
        const endpointInfo = 'POST /militaryVerificationUpdatesAcknowledgment Moonbeam REST API';

        try {
            // retrieve the API Key and Base URL, needed in order to make the military status updates acknowledgment call through the client
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
                        errorType: MilitaryVerificationErrorType.UnexpectedError,
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
            return axios.post(`${moonbeamBaseURL}/militaryVerificationUpdatesAcknowledgment`, JSON.stringify(militaryVerificationNotificationUpdate), {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": moonbeamPrivateKey
                },
                timeout: 15000, // in milliseconds here
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
                    }
                } else {
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
                                errorType: MilitaryVerificationErrorType.ValidationError
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
                            errorType: MilitaryVerificationErrorType.UnexpectedError,
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
                            errorType: MilitaryVerificationErrorType.UnexpectedError,
                            errorMessage: errorMessage
                        })
                    };
                }
            });
        } catch (err) {
            const errorMessage = `Unexpected error while posting the military verification status acknowledgment object through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);

            return {
                statusCode: 500,
                body: JSON.stringify({
                    data: null,
                    errorType: MilitaryVerificationErrorType.UnexpectedError,
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
    async transactionsAcknowledgment(updatedTransactionEvent: UpdatedTransactionEvent): Promise<APIGatewayProxyResult> {
        // easily identifiable API endpoint information
        const endpointInfo = 'POST /transactionsAcknowledgment Moonbeam REST API';

        try {
            // retrieve the API Key and Base URL, needed in order to make the transaction acknowledgment call through the client
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
                        errorType: TransactionsErrorType.UnexpectedError,
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
            return axios.post(`${moonbeamBaseURL}/transactionsAcknowledgment`, JSON.stringify(updatedTransactionEvent), {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": moonbeamPrivateKey
                },
                timeout: 15000, // in milliseconds here
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
                    }
                } else {
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
                                errorType: TransactionsErrorType.ValidationError
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
                            errorType: TransactionsErrorType.UnexpectedError,
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
                            errorType: TransactionsErrorType.UnexpectedError,
                            errorMessage: errorMessage
                        })
                    };
                }
            });
        } catch (err) {
            const errorMessage = `Unexpected error while posting the transactions acknowledgment object through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);

            return {
                statusCode: 500,
                body: JSON.stringify({
                    data: null,
                    errorType: TransactionsErrorType.UnexpectedError,
                    errorMessage: errorMessage
                })
            };
        }
    }

    /**
     * Function used to get all ACTIVE notification reminders.
     *
     * @returns a {@link NotificationReminderResponse}, representing the ACTIVE notification
     * reminders.
     */
    async getNotificationReminders(): Promise<NotificationReminderResponse> {
        // easily identifiable API endpoint information
        const endpointInfo = 'getNotificationReminders Query Moonbeam GraphQL API';

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
                    errorType: NotificationReminderErrorType.UnexpectedError
                };
            }

            /**
             * getNotificationReminder Query
             *
             * build the Moonbeam AppSync API GraphQL query, and perform a POST to it,
             * with the appropriate information.
             *
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            return axios.post(`${moonbeamBaseURL}`, {
                query: getNotificationReminders
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": moonbeamPrivateKey
                },
                timeout: 15000, // in milliseconds here
                timeoutErrorMessage: 'Moonbeam API timed out after 15000ms!'
            }).then(getNotificationRemindersResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(getNotificationRemindersResponse.data)}`);

                // retrieve the data block from the response
                const responseData = (getNotificationRemindersResponse && getNotificationRemindersResponse.data) ? getNotificationRemindersResponse.data.data : null;

                // check if there are any errors in the returned response
                if (responseData && responseData.getNotificationReminders.errorMessage === null) {
                    // returned the successfully retrieved notification reminders
                    return {
                        data: responseData.getNotificationReminders.data as NotificationReminder[]
                    }
                } else {
                    return responseData ?
                        // return the error message and type, from the original AppSync call
                        {
                            errorMessage: responseData.getNotificationReminders.errorMessage,
                            errorType: responseData.getNotificationReminders.errorType
                        } :
                        // return the error response indicating an invalid structure returned
                        {
                            errorMessage: `Invalid response structure returned from ${endpointInfo} response!`,
                            errorType: NotificationReminderErrorType.ValidationError
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
                        errorType: NotificationReminderErrorType.UnexpectedError
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
                        errorType: NotificationReminderErrorType.UnexpectedError
                    };
                } else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Moonbeam API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);

                    return {
                        errorMessage: errorMessage,
                        errorType: NotificationReminderErrorType.UnexpectedError
                    };
                }
            });
        } catch (err) {
            const errorMessage = `Unexpected error while retrieving notification reminders through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);

            return {
                errorMessage: errorMessage,
                errorType: NotificationReminderErrorType.UnexpectedError
            };
        }
    }

    /**
     * Function used to update a specific notification reminder.
     *
     * @param updateNotificationReminderInput the notification reminder input, containing any information used to
     * update an applicable notification reminder.
     *
     * @returns a {@link NotificationReminderResponse}, representing the update notification reminder.
     *
     * @protected
     */
    async updateNotificationReminder(updateNotificationReminderInput: UpdateNotificationReminderInput): Promise<NotificationReminderResponse> {
        // easily identifiable API endpoint information
        const endpointInfo = 'updateNotificationReminder Mutation Moonbeam GraphQL API';

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
                    errorType: NotificationReminderErrorType.UnexpectedError
                };
            }

            /**
             * updateNotificationReminder Mutation
             *
             * build the Moonbeam AppSync API GraphQL query, and perform a POST to it,
             * with the appropriate information.
             *
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            return axios.post(`${moonbeamBaseURL}`, {
                query: updateNotificationReminder,
                variables: {
                    updateNotificationReminderInput: updateNotificationReminderInput
                }
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": moonbeamPrivateKey
                },
                timeout: 15000, // in milliseconds here
                timeoutErrorMessage: 'Moonbeam API timed out after 15000ms!'
            }).then(updateNotificationReminderResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(updateNotificationReminderResponse.data)}`);

                // retrieve the data block from the response
                const responseData = (updateNotificationReminderResponse && updateNotificationReminderResponse.data) ? updateNotificationReminderResponse.data.data : null;

                // check if there are any errors in the returned response
                if (responseData && responseData.updateNotificationReminder.errorMessage === null) {
                    // returned the successfully updated notification reminder
                    return {
                        data: responseData.updateNotificationReminder.data as NotificationReminder[]
                    }
                } else {
                    return responseData ?
                        // return the error message and type, from the original AppSync call
                        {
                            errorMessage: responseData.updateNotificationReminder.errorMessage,
                            errorType: responseData.updateNotificationReminder.errorType
                        } :
                        // return the error response indicating an invalid structure returned
                        {
                            errorMessage: `Invalid response structure returned from ${endpointInfo} response!`,
                            errorType: NotificationReminderErrorType.ValidationError
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
                        errorType: NotificationReminderErrorType.UnexpectedError
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
                        errorType: NotificationReminderErrorType.UnexpectedError
                    };
                } else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Moonbeam API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);

                    return {
                        errorMessage: errorMessage,
                        errorType: NotificationReminderErrorType.UnexpectedError
                    };
                }
            });
        } catch (err) {
            const errorMessage = `Unexpected error while updating the notification reminder through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);

            return {
                errorMessage: errorMessage,
                errorType: NotificationReminderErrorType.UnexpectedError
            };
        }
    }

    /**
     * Function used to get the users with no linked cards.
     *
     * @returns a {@link IneligibleLinkedUsersResponse}, representing the users
     * which are not eligible for a reimbursement, since they have no linked cards.
     */
    async getUsersWithNoCards(): Promise<IneligibleLinkedUsersResponse> {
        // easily identifiable API endpoint information
        const endpointInfo = 'getUsersWithNoCards Query Moonbeam GraphQL API';

        try {
            // retrieve the API Key and Base URL, needed in order to make the users with no linked cards retrieval call through the client
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
             * getUsersWithNoCards Query
             *
             * build the Moonbeam AppSync API GraphQL query, and perform a POST to it,
             * with the appropriate information.
             *
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            return axios.post(`${moonbeamBaseURL}`, {
                query: getUsersWithNoCards
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": moonbeamPrivateKey
                },
                timeout: 15000, // in milliseconds here
                timeoutErrorMessage: 'Moonbeam API timed out after 15000ms!'
            }).then(getUsersWithNoCardsResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(getUsersWithNoCardsResponse.data)}`);

                // retrieve the data block from the response
                const responseData = (getUsersWithNoCardsResponse && getUsersWithNoCardsResponse.data) ? getUsersWithNoCardsResponse.data.data : null;

                // check if there are any errors in the returned response
                if (responseData && responseData.getUsersWithNoCards.errorMessage === null) {
                    // returned the successfully retrieved users with no linked cards
                    return {
                        data: responseData.getUsersWithNoCards.data as RetrieveUserDetailsForNotifications[]
                    }
                } else {
                    return responseData ?
                        // return the error message and type, from the original AppSync call
                        {
                            errorMessage: responseData.getUsersWithNoCards.errorMessage,
                            errorType: responseData.getUsersWithNoCards.errorType
                        } :
                        // return the error response indicating an invalid structure returned
                        {
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
            const errorMessage = `Unexpected error while retrieving users with no linked cards through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);

            return {
                errorMessage: errorMessage,
                errorType: CardLinkErrorType.UnexpectedError
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
     * Function used to get all transactions, for a particular user.
     *
     * @param getTransactionInput the transaction input object to be passed in,
     * containing all the necessary filtering for retrieving the transactions for a particular user.
     *
     * @returns a {@link MoonbeamTransactionsResponse} representing the transactional data.
     */
    async getTransaction(getTransactionInput: GetTransactionInput): Promise<MoonbeamTransactionsResponse> {
        // easily identifiable API endpoint information
        const endpointInfo = 'getTransaction Query Moonbeam GraphQL API';

        try {
            // retrieve the API Key and Base URL, needed in order to make the transaction retrieval call through the client
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
             * getTransaction Query
             *
             * build the Moonbeam AppSync API GraphQL query, and perform a POST to it,
             * with the appropriate information.
             *
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            return axios.post(`${moonbeamBaseURL}`, {
                query: getTransaction,
                variables: {
                    getTransactionInput: getTransactionInput
                }
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": moonbeamPrivateKey
                },
                timeout: 15000, // in milliseconds here
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
                        data: responseData.getTransaction.data as MoonbeamTransaction[]
                    }
                } else {
                    return responseData ?
                        // return the error message and type, from the original AppSync call
                        {
                            errorMessage: responseData.getTransaction.errorMessage,
                            errorType: responseData.getTransaction.errorType
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
            const errorMessage = `Unexpected error while retrieving transactions for a particular user, through ${endpointInfo}`;
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
     * Function used to create a notification.
     *
     * @param createNotificationInput the notification details to be passed in, in order to create a new
     * notification
     *
     * @returns a {@link CreateNotificationResponse} representing the newly created notification data
     */
    async createNotification(createNotificationInput: CreateNotificationInput): Promise<CreateNotificationResponse> {
        // easily identifiable API endpoint information
        const endpointInfo = 'createNotification Mutation Moonbeam GraphQL API';

        try {
            // retrieve the API Key and Base URL, needed in order to make a notification creation call through the client
            const [moonbeamBaseURL, moonbeamPrivateKey] = await super.retrieveServiceCredentials(Constants.AWSPairConstants.MOONBEAM_INTERNAL_SECRET_NAME);

            // check to see if we obtained any invalid secret values from the call above
            if (moonbeamBaseURL === null || moonbeamBaseURL.length === 0 ||
                moonbeamPrivateKey === null || moonbeamPrivateKey.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Moonbeam API call!";
                console.log(errorMessage);

                return {
                    errorMessage: errorMessage,
                    errorType: NotificationsErrorType.UnexpectedError
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
            return axios.post(`${moonbeamBaseURL}`, {
                query: createNotification,
                variables: {
                    createNotificationInput: createNotificationInput
                }
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": moonbeamPrivateKey
                },
                timeout: 15000, // in milliseconds here
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
                        data: responseData.createNotification.data as Notification
                    }
                } else {
                    return responseData ?
                        // return the error message and type, from the original AppSync call
                        {
                            errorMessage: responseData.createNotification.errorMessage,
                            errorType: responseData.createNotification.errorType
                        } :
                        // return the error response indicating an invalid structure returned
                        {
                            errorMessage: `Invalid response structure returned from ${endpointInfo} response!`,
                            errorType: NotificationsErrorType.ValidationError
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
                        errorType: NotificationsErrorType.UnexpectedError
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
                        errorType: NotificationsErrorType.UnexpectedError
                    };
                } else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Moonbeam API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);

                    return {
                        errorMessage: errorMessage,
                        errorType: NotificationsErrorType.UnexpectedError
                    };
                }
            });
        } catch (err) {
            const errorMessage = `Unexpected error while creating a notification, through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);

            return {
                errorMessage: errorMessage,
                errorType: NotificationsErrorType.UnexpectedError
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
    async getDevicesForUser(getDevicesForUserInput: GetDevicesForUserInput): Promise<UserDevicesResponse> {
        // easily identifiable API endpoint information
        const endpointInfo = 'getDevicesForUser Query Moonbeam GraphQL API';

        try {
            // retrieve the API Key and Base URL, needed in order to make the devices for user retrieval call through the client
            const [moonbeamBaseURL, moonbeamPrivateKey] = await super.retrieveServiceCredentials(Constants.AWSPairConstants.MOONBEAM_INTERNAL_SECRET_NAME);

            // check to see if we obtained any invalid secret values from the call above
            if (moonbeamBaseURL === null || moonbeamBaseURL.length === 0 ||
                moonbeamPrivateKey === null || moonbeamPrivateKey.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Moonbeam API call!";
                console.log(errorMessage);

                return {
                    errorMessage: errorMessage,
                    errorType: UserDeviceErrorType.UnexpectedError
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
            return axios.post(`${moonbeamBaseURL}`, {
                query: getDevicesForUser,
                variables: {
                    getDevicesForUserInput: getDevicesForUserInput
                }
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": moonbeamPrivateKey
                },
                timeout: 15000, // in milliseconds here
                timeoutErrorMessage: 'Moonbeam API timed out after 15000ms!'
            }).then(getDevicesForUserResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(getDevicesForUserResponse.data)}`);

                // retrieve the data block from the response
                const responseData = (getDevicesForUserResponse && getDevicesForUserResponse.data) ? getDevicesForUserResponse.data.data : null;

                // check if there are any errors in the returned response
                if (responseData && responseData.getDevicesForUser.errorMessage === null) {
                    // returned the successfully retrieved physical devices for a given user
                    return {
                        data: responseData.getDevicesForUser.data as PushDevice[]
                    }
                } else {
                    return responseData ?
                        // return the error message and type, from the original AppSync call
                        {
                            errorMessage: responseData.getDevicesForUser.errorMessage,
                            errorType: responseData.getDevicesForUser.errorType
                        } :
                        // return the error response indicating an invalid structure returned
                        {
                            errorMessage: `Invalid response structure returned from ${endpointInfo} response!`,
                            errorType: UserDeviceErrorType.ValidationError
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
                        errorType: UserDeviceErrorType.UnexpectedError
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
                        errorType: UserDeviceErrorType.UnexpectedError
                    };
                } else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Moonbeam API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);

                    return {
                        errorMessage: errorMessage,
                        errorType: UserDeviceErrorType.UnexpectedError
                    };
                }
            });
        } catch (err) {
            const errorMessage = `Unexpected error while retrieving physical devices for a particular user, through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);

            return {
                errorMessage: errorMessage,
                errorType: UserDeviceErrorType.UnexpectedError
            };
        }
    }
}
