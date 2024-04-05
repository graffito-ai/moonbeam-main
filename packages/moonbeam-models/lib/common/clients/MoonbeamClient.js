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
     * Function used to get the notifications by their type, sorted by a particular date/time.
     *
     * @param getNotificationByTypeInput input passed in, which will be used in retrieving the notifications
     * by type appropriately.
     *
     * @returns a {@link GetNotificationByTypeResponse}, representing the filtered notifications, if any applicable.
     */
    async getNotificationByType(getNotificationByTypeInput) {
        // easily identifiable API endpoint information
        const endpointInfo = 'getNotificationByType Query Moonbeam GraphQL API';
        try {
            // retrieve the API Key and Base URL, needed in order to make the storage file URL retrieval call through the client
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
             * getNotificationByType Query
             *
             * build the Moonbeam AppSync API GraphQL query, and perform a POST to it,
             * with the appropriate information.
             *
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            return axios_1.default.post(`${moonbeamBaseURL}`, {
                query: Queries_1.getNotificationByType,
                variables: {
                    getNotificationByTypeInput: getNotificationByTypeInput
                }
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": moonbeamPrivateKey
                },
                timeout: 15000,
                timeoutErrorMessage: 'Moonbeam API timed out after 15000ms!'
            }).then(getNotificationByTypeResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(getNotificationByTypeResponse.data)}`);
                // retrieve the data block from the response
                const responseData = (getNotificationByTypeResponse && getNotificationByTypeResponse.data)
                    ? getNotificationByTypeResponse.data.data
                    : null;
                // check if there are any errors in the returned response
                if (responseData && responseData.getNotificationByType.errorMessage === null) {
                    // returned the successfully retrieved file URL from storage
                    return {
                        data: responseData.getNotificationByType.data
                    };
                }
                else {
                    return responseData ?
                        // return the error message and type, from the original AppSync call
                        {
                            errorMessage: responseData.getNotificationByType.errorMessage,
                            errorType: responseData.getNotificationByType.errorType
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
            const errorMessage = `Unexpected error while retrieving notifications by type through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                errorMessage: errorMessage,
                errorType: GraphqlExports_1.NotificationsErrorType.UnexpectedError
            };
        }
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
    async putMilitaryVerificationReport(putMilitaryVerificationReportInput) {
        // easily identifiable API endpoint information
        const endpointInfo = 'putMilitaryVerificationReport Query Moonbeam GraphQL API';
        try {
            // retrieve the API Key and Base URL, needed in order to make the referral updated call through the client
            const [moonbeamBaseURL, moonbeamPrivateKey] = await super.retrieveServiceCredentials(Constants_1.Constants.AWSPairConstants.MOONBEAM_INTERNAL_SECRET_NAME);
            // check to see if we obtained any invalid secret values from the call above
            if (moonbeamBaseURL === null || moonbeamBaseURL.length === 0 ||
                moonbeamPrivateKey === null || moonbeamPrivateKey.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Moonbeam API call!";
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: GraphqlExports_1.StorageErrorType.UnexpectedError
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
            return axios_1.default.post(`${moonbeamBaseURL}`, {
                query: Mutations_1.putMilitaryVerificationReport,
                variables: {
                    putMilitaryVerificationReportInput: putMilitaryVerificationReportInput
                }
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": moonbeamPrivateKey
                },
                timeout: 15000,
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
                        data: responseData.putMilitaryVerificationReport.data
                    };
                }
                else {
                    return responseData ?
                        // return the error message and type, from the original AppSync call
                        {
                            errorMessage: responseData.updateReferral.errorMessage,
                            errorType: responseData.updateReferral.errorType
                        } :
                        // return the error response indicating an invalid structure returned
                        {
                            errorMessage: `Invalid response structure returned from ${endpointInfo} response!`,
                            errorType: GraphqlExports_1.StorageErrorType.ValidationError
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
                        errorType: GraphqlExports_1.StorageErrorType.UnexpectedError
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
                        errorType: GraphqlExports_1.StorageErrorType.UnexpectedError
                    };
                }
                else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Moonbeam API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.StorageErrorType.UnexpectedError
                    };
                }
            });
        }
        catch (err) {
            const errorMessage = `Unexpected error while updating referral through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                errorMessage: errorMessage,
                errorType: GraphqlExports_1.StorageErrorType.UnexpectedError
            };
        }
    }
    /**
     * Function used to retrieve a file's URL from storage via CloudFront and S3.
     *
     * @param getStorageInput input passed in, which will be used in returning the appropriate
     * URL for a given file.
     *
     * @returns a  {@link StorageResponse}, representing the retrieved chose file's URL.
     */
    async getStorageFileUrl(getStorageInput) {
        // easily identifiable API endpoint information
        const endpointInfo = 'getStorage Query Moonbeam GraphQL API';
        try {
            // retrieve the API Key and Base URL, needed in order to make the storage file URL retrieval call through the client
            const [moonbeamBaseURL, moonbeamPrivateKey] = await super.retrieveServiceCredentials(Constants_1.Constants.AWSPairConstants.MOONBEAM_INTERNAL_SECRET_NAME);
            // check to see if we obtained any invalid secret values from the call above
            if (moonbeamBaseURL === null || moonbeamBaseURL.length === 0 ||
                moonbeamPrivateKey === null || moonbeamPrivateKey.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Moonbeam API call!";
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: GraphqlExports_1.StorageErrorType.UnexpectedError
                };
            }
            /**
             * getStorage Query
             *
             * build the Moonbeam AppSync API GraphQL query, and perform a POST to it,
             * with the appropriate information.
             *
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            return axios_1.default.post(`${moonbeamBaseURL}`, {
                query: Queries_1.getStorage,
                variables: {
                    getStorageInput: getStorageInput
                }
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": moonbeamPrivateKey
                },
                timeout: 15000,
                timeoutErrorMessage: 'Moonbeam API timed out after 15000ms!'
            }).then(getStorageResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(getStorageResponse.data)}`);
                // retrieve the data block from the response
                const responseData = (getStorageResponse && getStorageResponse.data)
                    ? getStorageResponse.data.data
                    : null;
                // check if there are any errors in the returned response
                if (responseData && responseData.getStorage.errorMessage === null) {
                    // returned the successfully retrieved file URL from storage
                    return {
                        data: responseData.getStorage.data
                    };
                }
                else {
                    return responseData ?
                        // return the error message and type, from the original AppSync call
                        {
                            errorMessage: responseData.getStorage.errorMessage,
                            errorType: responseData.getStorage.errorType
                        } :
                        // return the error response indicating an invalid structure returned
                        {
                            errorMessage: `Invalid response structure returned from ${endpointInfo} response!`,
                            errorType: GraphqlExports_1.StorageErrorType.ValidationError
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
                        errorType: GraphqlExports_1.StorageErrorType.UnexpectedError
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
                        errorType: GraphqlExports_1.StorageErrorType.UnexpectedError
                    };
                }
                else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Moonbeam API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.StorageErrorType.UnexpectedError
                    };
                }
            });
        }
        catch (err) {
            const errorMessage = `Unexpected error while retrieving a file's URL from storage through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                errorMessage: errorMessage,
                errorType: GraphqlExports_1.StorageErrorType.UnexpectedError
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
    async getMilitaryVerificationInformation(getMilitaryVerificationInformationInput) {
        // easily identifiable API endpoint information
        const endpointInfo = 'getMilitaryVerificationInformation Query Moonbeam GraphQL API';
        try {
            // retrieve the API Key and Base URL, needed in order to make the military verification information retrieval call through the client
            const [moonbeamBaseURL, moonbeamPrivateKey] = await super.retrieveServiceCredentials(Constants_1.Constants.AWSPairConstants.MOONBEAM_INTERNAL_SECRET_NAME);
            // check to see if we obtained any invalid secret values from the call above
            if (moonbeamBaseURL === null || moonbeamBaseURL.length === 0 ||
                moonbeamPrivateKey === null || moonbeamPrivateKey.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Moonbeam API call!";
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: GraphqlExports_1.MilitaryVerificationReportingErrorType.UnexpectedError
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
            return axios_1.default.post(`${moonbeamBaseURL}`, {
                query: Queries_1.getMilitaryVerificationInformation,
                variables: {
                    getMilitaryVerificationInformationInput: getMilitaryVerificationInformationInput
                }
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": moonbeamPrivateKey
                },
                timeout: 15000,
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
                        data: responseData.getMilitaryVerificationInformation.data
                    };
                }
                else {
                    return responseData ?
                        // return the error message and type, from the original AppSync call
                        {
                            errorMessage: responseData.updateReferral.errorMessage,
                            errorType: responseData.updateReferral.errorType
                        } :
                        // return the error response indicating an invalid structure returned
                        {
                            errorMessage: `Invalid response structure returned from ${endpointInfo} response!`,
                            errorType: GraphqlExports_1.MilitaryVerificationReportingErrorType.ValidationError
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
                        errorType: GraphqlExports_1.MilitaryVerificationReportingErrorType.UnexpectedError
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
                        errorType: GraphqlExports_1.MilitaryVerificationReportingErrorType.UnexpectedError
                    };
                }
                else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Moonbeam API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.MilitaryVerificationReportingErrorType.UnexpectedError
                    };
                }
            });
        }
        catch (err) {
            const errorMessage = `Unexpected error while retrieving military verification information through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                errorMessage: errorMessage,
                errorType: GraphqlExports_1.MilitaryVerificationReportingErrorType.UnexpectedError
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
    async updateReferral(updateReferralInput) {
        // easily identifiable API endpoint information
        const endpointInfo = 'updateReferral Query Moonbeam GraphQL API';
        try {
            // retrieve the API Key and Base URL, needed in order to make the referral updated call through the client
            const [moonbeamBaseURL, moonbeamPrivateKey] = await super.retrieveServiceCredentials(Constants_1.Constants.AWSPairConstants.MOONBEAM_INTERNAL_SECRET_NAME);
            // check to see if we obtained any invalid secret values from the call above
            if (moonbeamBaseURL === null || moonbeamBaseURL.length === 0 ||
                moonbeamPrivateKey === null || moonbeamPrivateKey.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Moonbeam API call!";
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: GraphqlExports_1.ReferralErrorType.UnexpectedError
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
            return axios_1.default.post(`${moonbeamBaseURL}`, {
                query: Mutations_1.updateReferral,
                variables: {
                    updateReferralInput: updateReferralInput
                }
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": moonbeamPrivateKey
                },
                timeout: 15000,
                timeoutErrorMessage: 'Moonbeam API timed out after 15000ms!'
            }).then(updateReferralResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(updateReferralResponse.data)}`);
                // retrieve the data block from the response
                const responseData = (updateReferralResponse && updateReferralResponse.data) ? updateReferralResponse.data.data : null;
                // check if there are any errors in the returned response
                if (responseData && responseData.updateReferral.errorMessage === null) {
                    // returned the successfully retrieved referrals
                    return {
                        data: responseData.updateReferral.data
                    };
                }
                else {
                    return responseData ?
                        // return the error message and type, from the original AppSync call
                        {
                            errorMessage: responseData.updateReferral.errorMessage,
                            errorType: responseData.updateReferral.errorType
                        } :
                        // return the error response indicating an invalid structure returned
                        {
                            errorMessage: `Invalid response structure returned from ${endpointInfo} response!`,
                            errorType: GraphqlExports_1.ReferralErrorType.ValidationError
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
                        errorType: GraphqlExports_1.ReferralErrorType.UnexpectedError
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
                        errorType: GraphqlExports_1.ReferralErrorType.UnexpectedError
                    };
                }
                else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Moonbeam API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.ReferralErrorType.UnexpectedError
                    };
                }
            });
        }
        catch (err) {
            const errorMessage = `Unexpected error while updating referral through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                errorMessage: errorMessage,
                errorType: GraphqlExports_1.ReferralErrorType.UnexpectedError
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
    async getReferralByStatus(getReferralsByStatusInput) {
        // easily identifiable API endpoint information
        const endpointInfo = 'getReferralByStatus Query Moonbeam GraphQL API';
        try {
            // retrieve the API Key and Base URL, needed in order to make the referral by status retrieval call through the client
            const [moonbeamBaseURL, moonbeamPrivateKey] = await super.retrieveServiceCredentials(Constants_1.Constants.AWSPairConstants.MOONBEAM_INTERNAL_SECRET_NAME);
            // check to see if we obtained any invalid secret values from the call above
            if (moonbeamBaseURL === null || moonbeamBaseURL.length === 0 ||
                moonbeamPrivateKey === null || moonbeamPrivateKey.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Moonbeam API call!";
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: GraphqlExports_1.ReferralErrorType.UnexpectedError
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
            return axios_1.default.post(`${moonbeamBaseURL}`, {
                query: Queries_1.getReferralsByStatus,
                variables: {
                    getReferralsByStatusInput: getReferralsByStatusInput
                }
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": moonbeamPrivateKey
                },
                timeout: 15000,
                timeoutErrorMessage: 'Moonbeam API timed out after 15000ms!'
            }).then(getReferralsByStatusResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(getReferralsByStatusResponse.data)}`);
                // retrieve the data block from the response
                const responseData = (getReferralsByStatusResponse && getReferralsByStatusResponse.data) ? getReferralsByStatusResponse.data.data : null;
                // check if there are any errors in the returned response
                if (responseData && responseData.getReferralsByStatus.errorMessage === null) {
                    // returned the successfully retrieved referrals
                    return {
                        data: responseData.getReferralsByStatus.data
                    };
                }
                else {
                    return responseData ?
                        // return the error message and type, from the original AppSync call
                        {
                            errorMessage: responseData.getReferralsByStatus.errorMessage,
                            errorType: responseData.getReferralsByStatus.errorType
                        } :
                        // return the error response indicating an invalid structure returned
                        {
                            errorMessage: `Invalid response structure returned from ${endpointInfo} response!`,
                            errorType: GraphqlExports_1.ReferralErrorType.ValidationError
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
                        errorType: GraphqlExports_1.ReferralErrorType.UnexpectedError
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
                        errorType: GraphqlExports_1.ReferralErrorType.UnexpectedError
                    };
                }
                else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Moonbeam API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.ReferralErrorType.UnexpectedError
                    };
                }
            });
        }
        catch (err) {
            const errorMessage = `Unexpected error while retrieving referrals by status through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                errorMessage: errorMessage,
                errorType: GraphqlExports_1.ReferralErrorType.UnexpectedError
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
    async retrieveContactInformationForUser(contactInformationInput) {
        // easily identifiable API endpoint information
        const endpointInfo = '/listUsers for retrieveContactInformationForUser Cognito SDK call';
        try {
            // retrieve the Cognito access key, secret key and user pool id, needed in order to retrieve the filtered users, through the Cognito Identity provider client
            const [cognitoAccessKeyId, cognitoSecretKey, cognitoUserPoolId] = await super.retrieveServiceCredentials(Constants_1.Constants.AWSPairConstants.MOONBEAM_INTERNAL_SECRET_NAME, undefined, undefined, undefined, true);
            // check to see if we obtained any invalid secret values from the call above
            if (cognitoAccessKeyId === null || cognitoAccessKeyId.length === 0 ||
                cognitoSecretKey === null || cognitoSecretKey.length === 0 ||
                cognitoUserPoolId === null || (cognitoUserPoolId && cognitoUserPoolId.length === 0)) {
                const errorMessage = "Invalid Secrets obtained for Cognito SDK call call!";
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: GraphqlExports_1.MilitaryVerificationReportingErrorType.UnexpectedError
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
             * execute the List Users command, using filters, in order to retrieve a user's contact information
             * (email and phone number) from their attributes.
             *
             * Retrieve the user by their family_name. If there are is more than 1 match returned, then we will match
             * the user based on their unique id, from the custom:userId attribute
             */
            const listUsersResponse = await cognitoIdentityProviderClient.send(new client_cognito_identity_provider_1.ListUsersCommand({
                UserPoolId: cognitoUserPoolId,
                AttributesToGet: ['email', 'phone_number', 'custom:userId'],
                Filter: `family_name= "${`${contactInformationInput.lastName}`.replaceAll("\"", "\\\"")}"`
            }));
            // check for a valid response from the Cognito List Users Command call
            if (listUsersResponse !== null && listUsersResponse.$metadata !== null && listUsersResponse.$metadata.httpStatusCode !== null &&
                listUsersResponse.$metadata.httpStatusCode !== undefined && listUsersResponse.$metadata.httpStatusCode === 200 &&
                listUsersResponse.Users !== null && listUsersResponse.Users !== undefined && listUsersResponse.Users.length !== 0) {
                // If there are is more than 1 match returned, then we will match the user based on their unique id, from the custom:userId attribute
                let invalidAttributesFlag = false;
                listUsersResponse.Users.forEach(cognitoUser => {
                    if (cognitoUser.Attributes === null || cognitoUser.Attributes === undefined || cognitoUser.Attributes.length !== 3) {
                        invalidAttributesFlag = true;
                    }
                });
                // check for valid user attributes
                if (!invalidAttributesFlag) {
                    let matchedEmail = null;
                    let matchedPhoneNumber = null;
                    let noOfMatches = 0;
                    listUsersResponse.Users.forEach(cognitoUser => {
                        if (cognitoUser.Attributes[2].Value.trim() === contactInformationInput.id.trim()) {
                            matchedEmail = cognitoUser.Attributes[0].Value;
                            matchedPhoneNumber = cognitoUser.Attributes[1].Value;
                            noOfMatches += 1;
                        }
                    });
                    if (noOfMatches === 1 && matchedEmail !== null && matchedPhoneNumber !== null) {
                        contactInformationInput.phoneNumber = matchedPhoneNumber;
                        contactInformationInput.emailAddress = matchedEmail;
                        return {
                            data: [contactInformationInput]
                        };
                    }
                    else {
                        const errorMessage = `Couldn't find user in Cognito for ${contactInformationInput.id}`;
                        console.log(`${errorMessage}`);
                        return {
                            data: null,
                            errorType: GraphqlExports_1.MilitaryVerificationReportingErrorType.ValidationError,
                            errorMessage: errorMessage
                        };
                    }
                }
                else {
                    const errorMessage = `Invalid user attributes obtained`;
                    console.log(`${errorMessage}`);
                    return {
                        data: null,
                        errorType: GraphqlExports_1.MilitaryVerificationReportingErrorType.ValidationError,
                        errorMessage: errorMessage
                    };
                }
            }
            else {
                const errorMessage = `Invalid structure obtained while calling the get List Users Cognito command`;
                console.log(`${errorMessage}`);
                return {
                    data: null,
                    errorType: GraphqlExports_1.MilitaryVerificationReportingErrorType.ValidationError,
                    errorMessage: errorMessage
                };
            }
        }
        catch (err) {
            const errorMessage = `Unexpected error while retrieving the contact information for user ${contactInformationInput.id}, from Cognito through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                data: null,
                errorType: GraphqlExports_1.MilitaryVerificationReportingErrorType.UnexpectedError,
                errorMessage: errorMessage
            };
        }
    }
    /**
     * Function used to get all the users used to deliver notification reminders to,
     * sorted by a particular location.
     *
     * @param getUsersByGeographicalLocationInput the geolocation input that we filter users by
     *
     * @returns a {@link UserForNotificationReminderResponse}, representing each individual users'
     * user ID, first, last name and email, sorted by a particular location (city & state combination).
     */
    async getUsersByGeographyForNotificationReminders(getUsersByGeographicalLocationInput) {
        // easily identifiable API endpoint information
        const endpointInfo = '/listUsers for getUsersByGeographyForNotificationReminders Cognito SDK call';
        try {
            // retrieve the Cognito access key, secret key and user pool id, needed in order to retrieve all users sorted by location, through the Cognito Identity provider client
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
             * execute thew List Users command, without any filters, in order to retrieve a user's email, address
             * and their custom user ID, from their attributes.
             *
             * These results are going to be paginated, so we will limit the page size to 60 users (maximum allowed through this
             * call), and keep track of the number of pages and lack thereof, through a flag.
             */
            const userResults = [];
            let lastPaginationToken;
            let input = {
                UserPoolId: cognitoUserPoolId,
                AttributesToGet: ['given_name', 'family_name', 'email', 'custom:userId', 'address'],
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
                    if (cognitoUser.Attributes !== undefined && cognitoUser.Attributes.length === 5 &&
                        cognitoUser.Attributes[0] !== undefined && cognitoUser.Attributes[0].Value.length !== 0 &&
                        cognitoUser.Attributes[1] !== undefined && cognitoUser.Attributes[1].Value.length !== 0 &&
                        cognitoUser.Attributes[2] !== undefined && cognitoUser.Attributes[2].Value.length !== 0 &&
                        cognitoUser.Attributes[3] !== undefined && cognitoUser.Attributes[3].Value.length !== 0 &&
                        cognitoUser.Attributes[4] !== undefined && cognitoUser.Attributes[4].Value.length !== 0) {
                        // make sure that the users retrieved are residing in the city and state provided in the input
                        getUsersByGeographicalLocationInput.zipCodes.forEach(zipCode => {
                            if (zipCode !== null && cognitoUser.Attributes[0].Value.includes(zipCode)) {
                                // push the new user details in the user details array to be returned
                                userDetailsForNotificationReminder.push({
                                    id: cognitoUser.Attributes[4].Value,
                                    email: cognitoUser.Attributes[3].Value,
                                    firstName: cognitoUser.Attributes[1].Value,
                                    lastName: cognitoUser.Attributes[2].Value,
                                });
                            }
                        });
                    }
                });
                // return the user details results
                return {
                    data: userDetailsForNotificationReminder
                };
            }
            else {
                const errorMessage = `Empty user list array, obtained while calling the get List Users Cognito command`;
                console.log(`${errorMessage}`);
                return {
                    data: [],
                    errorType: GraphqlExports_1.NotificationReminderErrorType.NoneOrAbsent,
                    errorMessage: errorMessage
                };
            }
        }
        catch (err) {
            const errorMessage = `Unexpected error while retrieving users by their custom location ${JSON.stringify(getUsersByGeographicalLocationInput.zipCodes)} from Cognito through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                data: null,
                errorType: GraphqlExports_1.NotificationReminderErrorType.UnexpectedError,
                errorMessage: errorMessage
            };
        }
    }
    /**
     * Function used to get all the users eligible for reimbursements.
     *
     * @returns a {@link UserForNotificationReminderResponse}, representing each individual eligible users'
     * user ID, first, last name and email.
     */
    async getAllUsersEligibleForReimbursements() {
        // easily identifiable API endpoint information
        const endpointInfo = '/getAllUsersEligibleForReimbursements call';
        try {
            // first we will attempt to call the /getAllUsersForNotificationReminders, in order to capture all users.
            const allUsersEligibleForReimbursementsResponse = await this.getAllUsersForNotificationReminders();
            // check to see if the user retrieval was successful or not
            if (allUsersEligibleForReimbursementsResponse && !allUsersEligibleForReimbursementsResponse.errorMessage && !allUsersEligibleForReimbursementsResponse.errorType &&
                allUsersEligibleForReimbursementsResponse.data !== undefined && allUsersEligibleForReimbursementsResponse.data !== null && allUsersEligibleForReimbursementsResponse.data.length !== 0) {
                // for each user in the list of users, call the getTransactionByStatus AppSync API in order to see if they are eligible for a reimbursement
                const usersToNotify = [];
                for (const eligibleUser of allUsersEligibleForReimbursementsResponse.data) {
                    if (eligibleUser !== null) {
                        // flag to represent the user's reimbursement eligibility
                        let eligibleForReimbursementNotification = false;
                        // first retrieve the PROCESSED transactions
                        const processedTransactionsResponse = await this.getTransactionByStatus({
                            id: eligibleUser.id,
                            status: GraphqlExports_1.TransactionsStatus.Processed
                        });
                        // check to see if the call was successful and if we have any PROCESSED transactions
                        if (processedTransactionsResponse && !processedTransactionsResponse.errorMessage && !processedTransactionsResponse.errorType &&
                            processedTransactionsResponse.data !== undefined && processedTransactionsResponse.data !== null) {
                            eligibleForReimbursementNotification = true;
                        }
                        else {
                            console.log(`PROCESSED transactions call for user ${eligibleUser.id} call failed`);
                            eligibleForReimbursementNotification = false;
                        }
                        // retrieve the FUNDED transactions
                        const fundedTransactionsResponse = await this.getTransactionByStatus({
                            id: eligibleUser.id,
                            status: GraphqlExports_1.TransactionsStatus.Funded
                        });
                        // check to see if the call was successful and if we have any FUNDED transactions
                        if (fundedTransactionsResponse && !fundedTransactionsResponse.errorMessage && !fundedTransactionsResponse.errorType &&
                            fundedTransactionsResponse.data !== undefined && fundedTransactionsResponse.data !== null) {
                            eligibleForReimbursementNotification = true;
                        }
                        else {
                            console.log(`FUNDED transactions call for user ${eligibleUser.id} call failed`);
                            eligibleForReimbursementNotification = false;
                        }
                        /**
                         * at this point if the flag above is true, then we know we must have a valid list of 0 or more PROCESSED and/or FUNDED transactions.
                         * Loop through all these transactions and see if their total pendingCashbackAmount is $20 or more. If so add them in the list, otherwise
                         * do not.
                         */
                        if (eligibleForReimbursementNotification) {
                            let pendingCashbackAmount = 0.00;
                            // loop through PROCESSED transactions and add up
                            processedTransactionsResponse.data.forEach(processedTransaction => {
                                if (processedTransaction !== null) {
                                    pendingCashbackAmount += processedTransaction.pendingCashbackAmount;
                                }
                            });
                            // loop through FUNDED transactions and add up
                            fundedTransactionsResponse.data.forEach(fundedTransaction => {
                                if (fundedTransaction !== null) {
                                    pendingCashbackAmount += fundedTransaction.pendingCashbackAmount;
                                }
                            });
                            if (pendingCashbackAmount >= 20.00) {
                                usersToNotify.push(eligibleUser);
                            }
                        }
                    }
                }
                // return all eligible users for reimbursements, needing to get notified.
                return {
                    data: usersToNotify
                };
            }
            else {
                const errorMessage = `Error while retrieving all users!`;
                console.log(`${errorMessage}`);
                return {
                    data: null,
                    errorType: GraphqlExports_1.NotificationReminderErrorType.ValidationError,
                    errorMessage: errorMessage
                };
            }
        }
        catch (err) {
            const errorMessage = `Unexpected error while retrieving all users eligible for reimbursements, through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                data: null,
                errorType: GraphqlExports_1.NotificationReminderErrorType.UnexpectedError,
                errorMessage: errorMessage
            };
        }
    }
    /**
     * Function used to get all the users used to deliver notification reminders to.
     *
     * @returns a {@link UserForNotificationReminderResponse}, representing each individual users'
     * user ID, first, last name and email.
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
                AttributesToGet: ['given_name', 'family_name', 'email', 'custom:userId'],
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
                    if (cognitoUser.Attributes !== undefined && cognitoUser.Attributes.length === 4 &&
                        cognitoUser.Attributes[0] !== undefined && cognitoUser.Attributes[0].Value.length !== 0 &&
                        cognitoUser.Attributes[1] !== undefined && cognitoUser.Attributes[1].Value.length !== 0 &&
                        cognitoUser.Attributes[2] !== undefined && cognitoUser.Attributes[2].Value.length !== 0 &&
                        cognitoUser.Attributes[3] !== undefined && cognitoUser.Attributes[3].Value.length !== 0) {
                        // push the new user details in the user details array to be returned
                        userDetailsForNotificationReminder.push({
                            id: cognitoUser.Attributes[3].Value,
                            email: cognitoUser.Attributes[2].Value,
                            firstName: cognitoUser.Attributes[0].Value,
                            lastName: cognitoUser.Attributes[1].Value,
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
     * Function used to get all ACTIVE notification reminders.
     *
     * @returns a {@link NotificationReminderResponse}, representing the ACTIVE notification
     * reminders.
     */
    async getNotificationReminders() {
        // easily identifiable API endpoint information
        const endpointInfo = 'getNotificationReminders Query Moonbeam GraphQL API';
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
                    errorType: GraphqlExports_1.NotificationReminderErrorType.UnexpectedError
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
            return axios_1.default.post(`${moonbeamBaseURL}`, {
                query: Queries_1.getNotificationReminders
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": moonbeamPrivateKey
                },
                timeout: 15000,
                timeoutErrorMessage: 'Moonbeam API timed out after 15000ms!'
            }).then(getNotificationRemindersResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(getNotificationRemindersResponse.data)}`);
                // retrieve the data block from the response
                const responseData = (getNotificationRemindersResponse && getNotificationRemindersResponse.data) ? getNotificationRemindersResponse.data.data : null;
                // check if there are any errors in the returned response
                if (responseData && responseData.getNotificationReminders.errorMessage === null) {
                    // returned the successfully retrieved notification reminders
                    return {
                        data: responseData.getNotificationReminders.data
                    };
                }
                else {
                    return responseData ?
                        // return the error message and type, from the original AppSync call
                        {
                            errorMessage: responseData.getNotificationReminders.errorMessage,
                            errorType: responseData.getNotificationReminders.errorType
                        } :
                        // return the error response indicating an invalid structure returned
                        {
                            errorMessage: `Invalid response structure returned from ${endpointInfo} response!`,
                            errorType: GraphqlExports_1.NotificationReminderErrorType.ValidationError
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
                        errorType: GraphqlExports_1.NotificationReminderErrorType.UnexpectedError
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
                        errorType: GraphqlExports_1.NotificationReminderErrorType.UnexpectedError
                    };
                }
                else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Moonbeam API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.NotificationReminderErrorType.UnexpectedError
                    };
                }
            });
        }
        catch (err) {
            const errorMessage = `Unexpected error while retrieving notification reminders through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                errorMessage: errorMessage,
                errorType: GraphqlExports_1.NotificationReminderErrorType.UnexpectedError
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
    async updateNotificationReminder(updateNotificationReminderInput) {
        // easily identifiable API endpoint information
        const endpointInfo = 'updateNotificationReminder Mutation Moonbeam GraphQL API';
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
                    errorType: GraphqlExports_1.NotificationReminderErrorType.UnexpectedError
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
            return axios_1.default.post(`${moonbeamBaseURL}`, {
                query: Mutations_1.updateNotificationReminder,
                variables: {
                    updateNotificationReminderInput: updateNotificationReminderInput
                }
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": moonbeamPrivateKey
                },
                timeout: 15000,
                timeoutErrorMessage: 'Moonbeam API timed out after 15000ms!'
            }).then(updateNotificationReminderResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(updateNotificationReminderResponse.data)}`);
                // retrieve the data block from the response
                const responseData = (updateNotificationReminderResponse && updateNotificationReminderResponse.data) ? updateNotificationReminderResponse.data.data : null;
                // check if there are any errors in the returned response
                if (responseData && responseData.updateNotificationReminder.errorMessage === null) {
                    // returned the successfully updated notification reminder
                    return {
                        data: responseData.updateNotificationReminder.data
                    };
                }
                else {
                    return responseData ?
                        // return the error message and type, from the original AppSync call
                        {
                            errorMessage: responseData.updateNotificationReminder.errorMessage,
                            errorType: responseData.updateNotificationReminder.errorType
                        } :
                        // return the error response indicating an invalid structure returned
                        {
                            errorMessage: `Invalid response structure returned from ${endpointInfo} response!`,
                            errorType: GraphqlExports_1.NotificationReminderErrorType.ValidationError
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
                        errorType: GraphqlExports_1.NotificationReminderErrorType.UnexpectedError
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
                        errorType: GraphqlExports_1.NotificationReminderErrorType.UnexpectedError
                    };
                }
                else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Moonbeam API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.NotificationReminderErrorType.UnexpectedError
                    };
                }
            });
        }
        catch (err) {
            const errorMessage = `Unexpected error while updating the notification reminder through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                errorMessage: errorMessage,
                errorType: GraphqlExports_1.NotificationReminderErrorType.UnexpectedError
            };
        }
    }
    /**
     * Function used to get the users with no linked cards.
     *
     * @returns a {@link IneligibleLinkedUsersResponse}, representing the users
     * which are not eligible for a reimbursement, since they have no linked cards.
     */
    async getUsersWithNoCards() {
        // easily identifiable API endpoint information
        const endpointInfo = 'getUsersWithNoCards Query Moonbeam GraphQL API';
        try {
            // retrieve the API Key and Base URL, needed in order to make the users with no linked cards retrieval call through the client
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
             * getUsersWithNoCards Query
             *
             * build the Moonbeam AppSync API GraphQL query, and perform a POST to it,
             * with the appropriate information.
             *
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            return axios_1.default.post(`${moonbeamBaseURL}`, {
                query: Queries_1.getUsersWithNoCards
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": moonbeamPrivateKey
                },
                timeout: 15000,
                timeoutErrorMessage: 'Moonbeam API timed out after 15000ms!'
            }).then(getUsersWithNoCardsResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(getUsersWithNoCardsResponse.data)}`);
                // retrieve the data block from the response
                const responseData = (getUsersWithNoCardsResponse && getUsersWithNoCardsResponse.data) ? getUsersWithNoCardsResponse.data.data : null;
                // check if there are any errors in the returned response
                if (responseData && responseData.getUsersWithNoCards.errorMessage === null) {
                    // returned the successfully retrieved users with no linked cards
                    return {
                        data: responseData.getUsersWithNoCards.data
                    };
                }
                else {
                    return responseData ?
                        // return the error message and type, from the original AppSync call
                        {
                            errorMessage: responseData.getUsersWithNoCards.errorMessage,
                            errorType: responseData.getUsersWithNoCards.errorType
                        } :
                        // return the error response indicating an invalid structure returned
                        {
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
            const errorMessage = `Unexpected error while retrieving users with no linked cards through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                errorMessage: errorMessage,
                errorType: GraphqlExports_1.CardLinkErrorType.UnexpectedError
            };
        }
    }
    /**
     * Function used to retrieve the update the details of a given card. This will especially be used
     * when updating its expiration date.
     *
     * @return a {link Promise} of {@link EligibleLinkedUsersResponse} representing the user with the
     * updated card details.
     */
    async updateCardDetails(updateCardInput) {
        // easily identifiable API endpoint information
        const endpointInfo = 'updateCard Mutation Moonbeam GraphQL API';
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
             * updateCard Query
             *
             * build the Moonbeam AppSync API GraphQL query, and perform a POST to it,
             * with the appropriate information.
             *
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            return axios_1.default.post(`${moonbeamBaseURL}`, {
                query: Mutations_1.updateCard,
                variables: {
                    updateCardInput: updateCardInput
                }
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": moonbeamPrivateKey
                },
                timeout: 15000,
                timeoutErrorMessage: 'Moonbeam API timed out after 15000ms!'
            }).then(updateCardInputResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(updateCardInputResponse.data)}`);
                // retrieve the data block from the response
                const responseData = (updateCardInputResponse && updateCardInputResponse.data) ? updateCardInputResponse.data.data : null;
                // check if there are any errors in the returned response
                if (responseData && responseData.updateCard.errorMessage === null) {
                    // returned the successfully updated card details
                    return {
                        data: responseData.updateCard.data
                    };
                }
                else {
                    return responseData ?
                        // return the error message and type, from the original AppSync call
                        {
                            errorMessage: responseData.updateCard.errorMessage,
                            errorType: responseData.updateCard.errorType
                        } :
                        // return the error response indicating an invalid structure returned
                        {
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
            const errorMessage = `Unexpected error while updating card details through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                errorMessage: errorMessage,
                errorType: GraphqlExports_1.CardLinkErrorType.UnexpectedError
            };
        }
    }
    /**
     * Function used to retrieve the list of eligible linked users.
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
                            errorType: GraphqlExports_1.CardLinkErrorType.ValidationError
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW9vbmJlYW1DbGllbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbW9uL2NsaWVudHMvTW9vbmJlYW1DbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsbURBQThDO0FBQzlDLDRDQUF1QztBQUN2QyxzREF1RDJCO0FBQzNCLGtEQUEwQjtBQUMxQixpRUFRMkM7QUFDM0MsMkRBV3VDO0FBRXZDLGdHQU1tRDtBQUVuRDs7O0dBR0c7QUFDSCxNQUFhLGNBQWUsU0FBUSw2QkFBYTtJQUU3Qzs7Ozs7T0FLRztJQUNILFlBQVksV0FBbUIsRUFBRSxNQUFjO1FBQzNDLEtBQUssQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUVEOzs7Ozs7O09BT0c7SUFDSCxLQUFLLENBQUMscUJBQXFCLENBQUMsMEJBQXNEO1FBQzlFLCtDQUErQztRQUMvQyxNQUFNLFlBQVksR0FBRyxrREFBa0QsQ0FBQztRQUV4RSxJQUFJO1lBQ0Esb0hBQW9IO1lBQ3BILE1BQU0sQ0FBQyxlQUFlLEVBQUUsa0JBQWtCLENBQUMsR0FBRyxNQUFNLEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxxQkFBUyxDQUFDLGdCQUFnQixDQUFDLDZCQUE2QixDQUFDLENBQUM7WUFFL0ksNEVBQTRFO1lBQzVFLElBQUksZUFBZSxLQUFLLElBQUksSUFBSSxlQUFlLENBQUMsTUFBTSxLQUFLLENBQUM7Z0JBQ3hELGtCQUFrQixLQUFLLElBQUksSUFBSSxrQkFBa0IsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUNoRSxNQUFNLFlBQVksR0FBRyxpREFBaUQsQ0FBQztnQkFDdkUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFFMUIsT0FBTztvQkFDSCxZQUFZLEVBQUUsWUFBWTtvQkFDMUIsU0FBUyxFQUFFLHVDQUFzQixDQUFDLGVBQWU7aUJBQ3BELENBQUM7YUFDTDtZQUVEOzs7Ozs7Oztl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WUFBWTtnQkFDMUIsU0FBUyxFQUFFLG9DQUFtQixDQUFDLGVBQWU7YUFDakQsQ0FBQztTQUNMO0lBQ0wsQ0FBQztDQUNKO0FBMThGRCx3Q0EwOEZDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtCYXNlQVBJQ2xpZW50fSBmcm9tIFwiLi9CYXNlQVBJQ2xpZW50XCI7XG5pbXBvcnQge0NvbnN0YW50c30gZnJvbSBcIi4uL0NvbnN0YW50c1wiO1xuaW1wb3J0IHtcbiAgICBDYXJkTGlua0Vycm9yVHlwZSxcbiAgICBDcmVhdGVOb3RpZmljYXRpb25JbnB1dCxcbiAgICBDcmVhdGVOb3RpZmljYXRpb25SZXNwb25zZSxcbiAgICBDcmVhdGVUcmFuc2FjdGlvbklucHV0LFxuICAgIEVsaWdpYmxlTGlua2VkVXNlcixcbiAgICBFbGlnaWJsZUxpbmtlZFVzZXJzUmVzcG9uc2UsXG4gICAgRW1haWxGcm9tQ29nbml0b1Jlc3BvbnNlLFxuICAgIEZpbGUsXG4gICAgR2V0RGV2aWNlc0ZvclVzZXJJbnB1dCxcbiAgICBHZXRNaWxpdGFyeVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uSW5wdXQsXG4gICAgR2V0Tm90aWZpY2F0aW9uQnlUeXBlSW5wdXQsXG4gICAgR2V0Tm90aWZpY2F0aW9uQnlUeXBlUmVzcG9uc2UsXG4gICAgR2V0UmVmZXJyYWxzQnlTdGF0dXNJbnB1dCxcbiAgICBHZXRTdG9yYWdlSW5wdXQsXG4gICAgR2V0VHJhbnNhY3Rpb25CeVN0YXR1c0lucHV0LFxuICAgIEdldFRyYW5zYWN0aW9uSW5wdXQsXG4gICAgR2V0VXNlcnNCeUdlb2dyYXBoaWNhbExvY2F0aW9uSW5wdXQsXG4gICAgSW5lbGlnaWJsZUxpbmtlZFVzZXJzUmVzcG9uc2UsXG4gICAgTWlsaXRhcnlWZXJpZmljYXRpb25FcnJvclR5cGUsXG4gICAgTWlsaXRhcnlWZXJpZmljYXRpb25Ob3RpZmljYXRpb25VcGRhdGUsXG4gICAgTWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRpbmdFcnJvclR5cGUsXG4gICAgTWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRpbmdJbmZvcm1hdGlvbixcbiAgICBNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydGluZ0luZm9ybWF0aW9uUmVzcG9uc2UsXG4gICAgTWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRSZXNwb25zZSxcbiAgICBNb29uYmVhbVRyYW5zYWN0aW9uLFxuICAgIE1vb25iZWFtVHJhbnNhY3Rpb25CeVN0YXR1cyxcbiAgICBNb29uYmVhbVRyYW5zYWN0aW9uUmVzcG9uc2UsXG4gICAgTW9vbmJlYW1UcmFuc2FjdGlvbnNCeVN0YXR1c1Jlc3BvbnNlLFxuICAgIE1vb25iZWFtVHJhbnNhY3Rpb25zUmVzcG9uc2UsXG4gICAgTW9vbmJlYW1VcGRhdGVkVHJhbnNhY3Rpb24sXG4gICAgTW9vbmJlYW1VcGRhdGVkVHJhbnNhY3Rpb25SZXNwb25zZSxcbiAgICBOb3RpZmljYXRpb24sXG4gICAgTm90aWZpY2F0aW9uUmVtaW5kZXIsXG4gICAgTm90aWZpY2F0aW9uUmVtaW5kZXJFcnJvclR5cGUsXG4gICAgTm90aWZpY2F0aW9uUmVtaW5kZXJSZXNwb25zZSxcbiAgICBOb3RpZmljYXRpb25zRXJyb3JUeXBlLFxuICAgIFB1c2hEZXZpY2UsXG4gICAgUHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRJbnB1dCxcbiAgICBSZWZlcnJhbCxcbiAgICBSZWZlcnJhbEVycm9yVHlwZSxcbiAgICBSZWZlcnJhbFJlc3BvbnNlLFxuICAgIFJldHJpZXZlVXNlckRldGFpbHNGb3JOb3RpZmljYXRpb25zLFxuICAgIFN0b3JhZ2VFcnJvclR5cGUsXG4gICAgU3RvcmFnZVJlc3BvbnNlLFxuICAgIFRyYW5zYWN0aW9uc0Vycm9yVHlwZSxcbiAgICBUcmFuc2FjdGlvbnNTdGF0dXMsXG4gICAgVXBkYXRlQ2FyZElucHV0LFxuICAgIFVwZGF0ZWRUcmFuc2FjdGlvbkV2ZW50LFxuICAgIFVwZGF0ZU5vdGlmaWNhdGlvblJlbWluZGVySW5wdXQsXG4gICAgVXBkYXRlUmVmZXJyYWxJbnB1dCxcbiAgICBVcGRhdGVUcmFuc2FjdGlvbklucHV0LFxuICAgIFVzZXJEZXZpY2VFcnJvclR5cGUsXG4gICAgVXNlckRldmljZXNSZXNwb25zZSxcbiAgICBVc2VyRm9yTm90aWZpY2F0aW9uUmVtaW5kZXJSZXNwb25zZVxufSBmcm9tIFwiLi4vR3JhcGhxbEV4cG9ydHNcIjtcbmltcG9ydCBheGlvcyBmcm9tIFwiYXhpb3NcIjtcbmltcG9ydCB7XG4gICAgY3JlYXRlTm90aWZpY2F0aW9uLFxuICAgIGNyZWF0ZVRyYW5zYWN0aW9uLFxuICAgIHB1dE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0LFxuICAgIHVwZGF0ZUNhcmQsXG4gICAgdXBkYXRlTm90aWZpY2F0aW9uUmVtaW5kZXIsXG4gICAgdXBkYXRlUmVmZXJyYWwsXG4gICAgdXBkYXRlVHJhbnNhY3Rpb25cbn0gZnJvbSBcIi4uLy4uL2dyYXBocWwvbXV0YXRpb25zL011dGF0aW9uc1wiO1xuaW1wb3J0IHtcbiAgICBnZXREZXZpY2VzRm9yVXNlcixcbiAgICBnZXRFbGlnaWJsZUxpbmtlZFVzZXJzLFxuICAgIGdldE1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5mb3JtYXRpb24sXG4gICAgZ2V0Tm90aWZpY2F0aW9uQnlUeXBlLFxuICAgIGdldE5vdGlmaWNhdGlvblJlbWluZGVycyxcbiAgICBnZXRSZWZlcnJhbHNCeVN0YXR1cyxcbiAgICBnZXRTdG9yYWdlLFxuICAgIGdldFRyYW5zYWN0aW9uLFxuICAgIGdldFRyYW5zYWN0aW9uQnlTdGF0dXMsXG4gICAgZ2V0VXNlcnNXaXRoTm9DYXJkc1xufSBmcm9tIFwiLi4vLi4vZ3JhcGhxbC9xdWVyaWVzL1F1ZXJpZXNcIjtcbmltcG9ydCB7QVBJR2F0ZXdheVByb3h5UmVzdWx0fSBmcm9tIFwiYXdzLWxhbWJkYS90cmlnZ2VyL2FwaS1nYXRld2F5LXByb3h5XCI7XG5pbXBvcnQge1xuICAgIENvZ25pdG9JZGVudGl0eVByb3ZpZGVyQ2xpZW50LFxuICAgIExpc3RVc2Vyc0NvbW1hbmQsXG4gICAgTGlzdFVzZXJzQ29tbWFuZElucHV0LFxuICAgIExpc3RVc2Vyc0NvbW1hbmRPdXRwdXQsXG4gICAgVXNlclR5cGVcbn0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1jb2duaXRvLWlkZW50aXR5LXByb3ZpZGVyXCI7XG5cbi8qKlxuICogQ2xhc3MgdXNlZCBhcyB0aGUgYmFzZS9nZW5lcmljIGNsaWVudCBmb3IgYWxsIE1vb25iZWFtIGludGVybmFsIEFwcFN5bmNcbiAqIGFuZC9vciBBUEkgR2F0ZXdheSBBUElzLlxuICovXG5leHBvcnQgY2xhc3MgTW9vbmJlYW1DbGllbnQgZXh0ZW5kcyBCYXNlQVBJQ2xpZW50IHtcblxuICAgIC8qKlxuICAgICAqIEdlbmVyaWMgY29uc3RydWN0b3IgZm9yIHRoZSBjbGllbnQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZW52aXJvbm1lbnQgdGhlIEFXUyBlbnZpcm9ubWVudCBwYXNzZWQgaW4gZnJvbSB0aGUgTGFtYmRhIHJlc29sdmVyLlxuICAgICAqIEBwYXJhbSByZWdpb24gdGhlIEFXUyByZWdpb24gcGFzc2VkIGluIGZyb20gdGhlIExhbWJkYSByZXNvbHZlci5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihlbnZpcm9ubWVudDogc3RyaW5nLCByZWdpb246IHN0cmluZykge1xuICAgICAgICBzdXBlcihyZWdpb24sIGVudmlyb25tZW50KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB1c2VkIHRvIGdldCB0aGUgbm90aWZpY2F0aW9ucyBieSB0aGVpciB0eXBlLCBzb3J0ZWQgYnkgYSBwYXJ0aWN1bGFyIGRhdGUvdGltZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBnZXROb3RpZmljYXRpb25CeVR5cGVJbnB1dCBpbnB1dCBwYXNzZWQgaW4sIHdoaWNoIHdpbGwgYmUgdXNlZCBpbiByZXRyaWV2aW5nIHRoZSBub3RpZmljYXRpb25zXG4gICAgICogYnkgdHlwZSBhcHByb3ByaWF0ZWx5LlxuICAgICAqXG4gICAgICogQHJldHVybnMgYSB7QGxpbmsgR2V0Tm90aWZpY2F0aW9uQnlUeXBlUmVzcG9uc2V9LCByZXByZXNlbnRpbmcgdGhlIGZpbHRlcmVkIG5vdGlmaWNhdGlvbnMsIGlmIGFueSBhcHBsaWNhYmxlLlxuICAgICAqL1xuICAgIGFzeW5jIGdldE5vdGlmaWNhdGlvbkJ5VHlwZShnZXROb3RpZmljYXRpb25CeVR5cGVJbnB1dDogR2V0Tm90aWZpY2F0aW9uQnlUeXBlSW5wdXQpOiBQcm9taXNlPEdldE5vdGlmaWNhdGlvbkJ5VHlwZVJlc3BvbnNlPiB7XG4gICAgICAgIC8vIGVhc2lseSBpZGVudGlmaWFibGUgQVBJIGVuZHBvaW50IGluZm9ybWF0aW9uXG4gICAgICAgIGNvbnN0IGVuZHBvaW50SW5mbyA9ICdnZXROb3RpZmljYXRpb25CeVR5cGUgUXVlcnkgTW9vbmJlYW0gR3JhcGhRTCBBUEknO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgQVBJIEtleSBhbmQgQmFzZSBVUkwsIG5lZWRlZCBpbiBvcmRlciB0byBtYWtlIHRoZSBzdG9yYWdlIGZpbGUgVVJMIHJldHJpZXZhbCBjYWxsIHRocm91Z2ggdGhlIGNsaWVudFxuICAgICAgICAgICAgY29uc3QgW21vb25iZWFtQmFzZVVSTCwgbW9vbmJlYW1Qcml2YXRlS2V5XSA9IGF3YWl0IHN1cGVyLnJldHJpZXZlU2VydmljZUNyZWRlbnRpYWxzKENvbnN0YW50cy5BV1NQYWlyQ29uc3RhbnRzLk1PT05CRUFNX0lOVEVSTkFMX1NFQ1JFVF9OQU1FKTtcblxuICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHdlIG9idGFpbmVkIGFueSBpbnZhbGlkIHNlY3JldCB2YWx1ZXMgZnJvbSB0aGUgY2FsbCBhYm92ZVxuICAgICAgICAgICAgaWYgKG1vb25iZWFtQmFzZVVSTCA9PT0gbnVsbCB8fCBtb29uYmVhbUJhc2VVUkwubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgbW9vbmJlYW1Qcml2YXRlS2V5ID09PSBudWxsIHx8IG1vb25iZWFtUHJpdmF0ZUtleS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBcIkludmFsaWQgU2VjcmV0cyBvYnRhaW5lZCBmb3IgTW9vbmJlYW0gQVBJIGNhbGwhXCI7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBnZXROb3RpZmljYXRpb25CeVR5cGUgUXVlcnlcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBidWlsZCB0aGUgTW9vbmJlYW0gQXBwU3luYyBBUEkgR3JhcGhRTCBxdWVyeSwgYW5kIHBlcmZvcm0gYSBQT1NUIHRvIGl0LFxuICAgICAgICAgICAgICogd2l0aCB0aGUgYXBwcm9wcmlhdGUgaW5mb3JtYXRpb24uXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogd2UgaW1wbHkgdGhhdCBpZiB0aGUgQVBJIGRvZXMgbm90IHJlc3BvbmQgaW4gMTUgc2Vjb25kcywgdGhlbiB3ZSBhdXRvbWF0aWNhbGx5IGNhdGNoIHRoYXQsIGFuZCByZXR1cm4gYW5cbiAgICAgICAgICAgICAqIGVycm9yIGZvciBhIGJldHRlciBjdXN0b21lciBleHBlcmllbmNlLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICByZXR1cm4gYXhpb3MucG9zdChgJHttb29uYmVhbUJhc2VVUkx9YCwge1xuICAgICAgICAgICAgICAgIHF1ZXJ5OiBnZXROb3RpZmljYXRpb25CeVR5cGUsXG4gICAgICAgICAgICAgICAgdmFyaWFibGVzOiB7XG4gICAgICAgICAgICAgICAgICAgIGdldE5vdGlmaWNhdGlvbkJ5VHlwZUlucHV0OiBnZXROb3RpZmljYXRpb25CeVR5cGVJbnB1dFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgICAgICBcIngtYXBpLWtleVwiOiBtb29uYmVhbVByaXZhdGVLZXlcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDE1MDAwLCAvLyBpbiBtaWxsaXNlY29uZHMgaGVyZVxuICAgICAgICAgICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2U6ICdNb29uYmVhbSBBUEkgdGltZWQgb3V0IGFmdGVyIDE1MDAwbXMhJ1xuICAgICAgICAgICAgfSkudGhlbihnZXROb3RpZmljYXRpb25CeVR5cGVSZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGdldE5vdGlmaWNhdGlvbkJ5VHlwZVJlc3BvbnNlLmRhdGEpfWApO1xuXG4gICAgICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIGRhdGEgYmxvY2sgZnJvbSB0aGUgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICBjb25zdCByZXNwb25zZURhdGEgPSAoZ2V0Tm90aWZpY2F0aW9uQnlUeXBlUmVzcG9uc2UgJiYgZ2V0Tm90aWZpY2F0aW9uQnlUeXBlUmVzcG9uc2UuZGF0YSlcbiAgICAgICAgICAgICAgICAgICAgPyBnZXROb3RpZmljYXRpb25CeVR5cGVSZXNwb25zZS5kYXRhLmRhdGFcbiAgICAgICAgICAgICAgICAgICAgOiBudWxsO1xuXG4gICAgICAgICAgICAgICAgLy8gY2hlY2sgaWYgdGhlcmUgYXJlIGFueSBlcnJvcnMgaW4gdGhlIHJldHVybmVkIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlRGF0YSAmJiByZXNwb25zZURhdGEuZ2V0Tm90aWZpY2F0aW9uQnlUeXBlLmVycm9yTWVzc2FnZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm5lZCB0aGUgc3VjY2Vzc2Z1bGx5IHJldHJpZXZlZCBmaWxlIFVSTCBmcm9tIHN0b3JhZ2VcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHJlc3BvbnNlRGF0YS5nZXROb3RpZmljYXRpb25CeVR5cGUuZGF0YSBhcyBOb3RpZmljYXRpb25bXVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlRGF0YSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIGVycm9yIG1lc3NhZ2UgYW5kIHR5cGUsIGZyb20gdGhlIG9yaWdpbmFsIEFwcFN5bmMgY2FsbFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogcmVzcG9uc2VEYXRhLmdldE5vdGlmaWNhdGlvbkJ5VHlwZS5lcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiByZXNwb25zZURhdGEuZ2V0Tm90aWZpY2F0aW9uQnlUeXBlLmVycm9yVHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIGVycm9yIHJlc3BvbnNlIGluZGljYXRpbmcgYW4gaW52YWxpZCBzdHJ1Y3R1cmUgcmV0dXJuZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBJbnZhbGlkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tICR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSFgLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yLnJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBhbmQgdGhlIHNlcnZlciByZXNwb25kZWQgd2l0aCBhIHN0YXR1cyBjb2RlXG4gICAgICAgICAgICAgICAgICAgICAqIHRoYXQgZmFsbHMgb3V0IG9mIHRoZSByYW5nZSBvZiAyeHguXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm9uIDJ4eHggcmVzcG9uc2Ugd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgd2l0aCBzdGF0dXMgJHtlcnJvci5yZXNwb25zZS5zdGF0dXN9LCBhbmQgcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShlcnJvci5yZXNwb25zZS5kYXRhKX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGFueSBvdGhlciBzcGVjaWZpYyBlcnJvcnMgdG8gYmUgZmlsdGVyZWQgYmVsb3dcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3IucmVxdWVzdCkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYnV0IG5vIHJlc3BvbnNlIHdhcyByZWNlaXZlZFxuICAgICAgICAgICAgICAgICAgICAgKiBgZXJyb3IucmVxdWVzdGAgaXMgYW4gaW5zdGFuY2Ugb2YgWE1MSHR0cFJlcXVlc3QgaW4gdGhlIGJyb3dzZXIgYW5kIGFuIGluc3RhbmNlIG9mXG4gICAgICAgICAgICAgICAgICAgICAqICBodHRwLkNsaWVudFJlcXVlc3QgaW4gbm9kZS5qcy5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBObyByZXNwb25zZSByZWNlaXZlZCB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gTW9vbmJlYW0gQVBJLCBmb3IgcmVxdWVzdCAke2Vycm9yLnJlcXVlc3R9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU29tZXRoaW5nIGhhcHBlbmVkIGluIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgdGhhdCB0cmlnZ2VyZWQgYW4gRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgc2V0dGluZyB1cCB0aGUgcmVxdWVzdCBmb3IgdGhlICR7ZW5kcG9pbnRJbmZvfSBNb29uYmVhbSBBUEksICR7KGVycm9yICYmIGVycm9yLm1lc3NhZ2UpICYmIGVycm9yLm1lc3NhZ2V9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgcmV0cmlldmluZyBub3RpZmljYXRpb25zIGJ5IHR5cGUgdGhyb3VnaCAke2VuZHBvaW50SW5mb31gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfSAke2Vycn1gKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdXNlZCB0byB1cGRhdGUgYW5kL29yIGNyZWF0ZSBhbiBleGlzdGluZy9uZXcgbWlsaXRhcnkgdmVyaWZpY2F0aW9uIHJlcG9ydFxuICAgICAqIGZpbGUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRJbnB1dCB0aGUgaW5wdXQgY29udGFpbmluZyB0aGUgaW5mb3JtYXRpb24gdGhhdCBuZWVkcyB0byBiZVxuICAgICAqIHRyYW5zZmVycmVkIGludG8gdGhlIG1pbGl0YXJ5IHZlcmlmaWNhdGlvbiByZXBvcnQgZmlsZS5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIGEge0BsaW5rIE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0UmVzcG9uc2V9LCByZXByZXNlbnRpbmcgYSBmbGFnIGhpZ2hsaWdodGluZyB3aGV0aGVyXG4gICAgICogdGhlIGZpbGUgd2FzIHN1Y2Nlc3NmdWxseSB1cGRhdGVkIG9yIG5vdC5cbiAgICAgKi9cbiAgICBhc3luYyBwdXRNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydChwdXRNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydElucHV0OiBQdXRNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydElucHV0KTogUHJvbWlzZTxNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydFJlc3BvbnNlPiB7XG4gICAgICAgIC8vIGVhc2lseSBpZGVudGlmaWFibGUgQVBJIGVuZHBvaW50IGluZm9ybWF0aW9uXG4gICAgICAgIGNvbnN0IGVuZHBvaW50SW5mbyA9ICdwdXRNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydCBRdWVyeSBNb29uYmVhbSBHcmFwaFFMIEFQSSc7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBBUEkgS2V5IGFuZCBCYXNlIFVSTCwgbmVlZGVkIGluIG9yZGVyIHRvIG1ha2UgdGhlIHJlZmVycmFsIHVwZGF0ZWQgY2FsbCB0aHJvdWdoIHRoZSBjbGllbnRcbiAgICAgICAgICAgIGNvbnN0IFttb29uYmVhbUJhc2VVUkwsIG1vb25iZWFtUHJpdmF0ZUtleV0gPSBhd2FpdCBzdXBlci5yZXRyaWV2ZVNlcnZpY2VDcmVkZW50aWFscyhDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5NT09OQkVBTV9JTlRFUk5BTF9TRUNSRVRfTkFNRSk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB3ZSBvYnRhaW5lZCBhbnkgaW52YWxpZCBzZWNyZXQgdmFsdWVzIGZyb20gdGhlIGNhbGwgYWJvdmVcbiAgICAgICAgICAgIGlmIChtb29uYmVhbUJhc2VVUkwgPT09IG51bGwgfHwgbW9vbmJlYW1CYXNlVVJMLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG1vb25iZWFtUHJpdmF0ZUtleSA9PT0gbnVsbCB8fCBtb29uYmVhbVByaXZhdGVLZXkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gXCJJbnZhbGlkIFNlY3JldHMgb2J0YWluZWQgZm9yIE1vb25iZWFtIEFQSSBjYWxsIVwiO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBTdG9yYWdlRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogcHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnQgUXVlcnlcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBidWlsZCB0aGUgTW9vbmJlYW0gQXBwU3luYyBBUEkgR3JhcGhRTCBxdWVyeSwgYW5kIHBlcmZvcm0gYSBQT1NUIHRvIGl0LFxuICAgICAgICAgICAgICogd2l0aCB0aGUgYXBwcm9wcmlhdGUgaW5mb3JtYXRpb24uXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogd2UgaW1wbHkgdGhhdCBpZiB0aGUgQVBJIGRvZXMgbm90IHJlc3BvbmQgaW4gMTUgc2Vjb25kcywgdGhlbiB3ZSBhdXRvbWF0aWNhbGx5IGNhdGNoIHRoYXQsIGFuZCByZXR1cm4gYW5cbiAgICAgICAgICAgICAqIGVycm9yIGZvciBhIGJldHRlciBjdXN0b21lciBleHBlcmllbmNlLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICByZXR1cm4gYXhpb3MucG9zdChgJHttb29uYmVhbUJhc2VVUkx9YCwge1xuICAgICAgICAgICAgICAgIHF1ZXJ5OiBwdXRNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydCxcbiAgICAgICAgICAgICAgICB2YXJpYWJsZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgcHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRJbnB1dDogcHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRJbnB1dFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgICAgICBcIngtYXBpLWtleVwiOiBtb29uYmVhbVByaXZhdGVLZXlcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDE1MDAwLCAvLyBpbiBtaWxsaXNlY29uZHMgaGVyZVxuICAgICAgICAgICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2U6ICdNb29uYmVhbSBBUEkgdGltZWQgb3V0IGFmdGVyIDE1MDAwbXMhJ1xuICAgICAgICAgICAgfSkudGhlbihwdXRNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydFJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlbmRwb2ludEluZm99IHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkocHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRSZXNwb25zZS5kYXRhKX1gKTtcblxuICAgICAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBkYXRhIGJsb2NrIGZyb20gdGhlIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2VEYXRhID0gKHB1dE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0UmVzcG9uc2UgJiYgcHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRSZXNwb25zZS5kYXRhKVxuICAgICAgICAgICAgICAgICAgICA/IHB1dE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0UmVzcG9uc2UuZGF0YS5kYXRhXG4gICAgICAgICAgICAgICAgICAgIDogbnVsbDtcblxuICAgICAgICAgICAgICAgIC8vIGNoZWNrIGlmIHRoZXJlIGFyZSBhbnkgZXJyb3JzIGluIHRoZSByZXR1cm5lZCByZXNwb25zZVxuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZURhdGEgJiYgcmVzcG9uc2VEYXRhLnB1dE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0LmVycm9yTWVzc2FnZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm5lZCB0aGUgc3VjY2Vzc2Z1bGx5IHJldHJpZXZlZCByZWZlcnJhbHNcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHJlc3BvbnNlRGF0YS5wdXRNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydC5kYXRhIGFzIHN0cmluZ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlRGF0YSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIGVycm9yIG1lc3NhZ2UgYW5kIHR5cGUsIGZyb20gdGhlIG9yaWdpbmFsIEFwcFN5bmMgY2FsbFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogcmVzcG9uc2VEYXRhLnVwZGF0ZVJlZmVycmFsLmVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IHJlc3BvbnNlRGF0YS51cGRhdGVSZWZlcnJhbC5lcnJvclR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gOlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBlcnJvciByZXNwb25zZSBpbmRpY2F0aW5nIGFuIGludmFsaWQgc3RydWN0dXJlIHJldHVybmVkXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgSW52YWxpZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UhYCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFN0b3JhZ2VFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvci5yZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYW5kIHRoZSBzZXJ2ZXIgcmVzcG9uZGVkIHdpdGggYSBzdGF0dXMgY29kZVxuICAgICAgICAgICAgICAgICAgICAgKiB0aGF0IGZhbGxzIG91dCBvZiB0aGUgcmFuZ2Ugb2YgMnh4LlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vbiAyeHh4IHJlc3BvbnNlIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBNb29uYmVhbSBBUEksIHdpdGggc3RhdHVzICR7ZXJyb3IucmVzcG9uc2Uuc3RhdHVzfSwgYW5kIHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZXJyb3IucmVzcG9uc2UuZGF0YSl9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBhbnkgb3RoZXIgc3BlY2lmaWMgZXJyb3JzIHRvIGJlIGZpbHRlcmVkIGJlbG93XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogU3RvcmFnZUVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVycm9yLnJlcXVlc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGJ1dCBubyByZXNwb25zZSB3YXMgcmVjZWl2ZWRcbiAgICAgICAgICAgICAgICAgICAgICogYGVycm9yLnJlcXVlc3RgIGlzIGFuIGluc3RhbmNlIG9mIFhNTEh0dHBSZXF1ZXN0IGluIHRoZSBicm93c2VyIGFuZCBhbiBpbnN0YW5jZSBvZlxuICAgICAgICAgICAgICAgICAgICAgKiAgaHR0cC5DbGllbnRSZXF1ZXN0IGluIG5vZGUuanMuXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm8gcmVzcG9uc2UgcmVjZWl2ZWQgd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgZm9yIHJlcXVlc3QgJHtlcnJvci5yZXF1ZXN0fWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBTdG9yYWdlRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNvbWV0aGluZyBoYXBwZW5lZCBpbiBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IHRoYXQgdHJpZ2dlcmVkIGFuIEVycm9yXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgZm9yIHRoZSAke2VuZHBvaW50SW5mb30gTW9vbmJlYW0gQVBJLCAkeyhlcnJvciAmJiBlcnJvci5tZXNzYWdlKSAmJiBlcnJvci5tZXNzYWdlfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBTdG9yYWdlRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHVwZGF0aW5nIHJlZmVycmFsIHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJ9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBTdG9yYWdlRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHVzZWQgdG8gcmV0cmlldmUgYSBmaWxlJ3MgVVJMIGZyb20gc3RvcmFnZSB2aWEgQ2xvdWRGcm9udCBhbmQgUzMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZ2V0U3RvcmFnZUlucHV0IGlucHV0IHBhc3NlZCBpbiwgd2hpY2ggd2lsbCBiZSB1c2VkIGluIHJldHVybmluZyB0aGUgYXBwcm9wcmlhdGVcbiAgICAgKiBVUkwgZm9yIGEgZ2l2ZW4gZmlsZS5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIGEgIHtAbGluayBTdG9yYWdlUmVzcG9uc2V9LCByZXByZXNlbnRpbmcgdGhlIHJldHJpZXZlZCBjaG9zZSBmaWxlJ3MgVVJMLlxuICAgICAqL1xuICAgIGFzeW5jIGdldFN0b3JhZ2VGaWxlVXJsKGdldFN0b3JhZ2VJbnB1dDogR2V0U3RvcmFnZUlucHV0KTogUHJvbWlzZTxTdG9yYWdlUmVzcG9uc2U+IHtcbiAgICAgICAgLy8gZWFzaWx5IGlkZW50aWZpYWJsZSBBUEkgZW5kcG9pbnQgaW5mb3JtYXRpb25cbiAgICAgICAgY29uc3QgZW5kcG9pbnRJbmZvID0gJ2dldFN0b3JhZ2UgUXVlcnkgTW9vbmJlYW0gR3JhcGhRTCBBUEknO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgQVBJIEtleSBhbmQgQmFzZSBVUkwsIG5lZWRlZCBpbiBvcmRlciB0byBtYWtlIHRoZSBzdG9yYWdlIGZpbGUgVVJMIHJldHJpZXZhbCBjYWxsIHRocm91Z2ggdGhlIGNsaWVudFxuICAgICAgICAgICAgY29uc3QgW21vb25iZWFtQmFzZVVSTCwgbW9vbmJlYW1Qcml2YXRlS2V5XSA9IGF3YWl0IHN1cGVyLnJldHJpZXZlU2VydmljZUNyZWRlbnRpYWxzKENvbnN0YW50cy5BV1NQYWlyQ29uc3RhbnRzLk1PT05CRUFNX0lOVEVSTkFMX1NFQ1JFVF9OQU1FKTtcblxuICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHdlIG9idGFpbmVkIGFueSBpbnZhbGlkIHNlY3JldCB2YWx1ZXMgZnJvbSB0aGUgY2FsbCBhYm92ZVxuICAgICAgICAgICAgaWYgKG1vb25iZWFtQmFzZVVSTCA9PT0gbnVsbCB8fCBtb29uYmVhbUJhc2VVUkwubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgbW9vbmJlYW1Qcml2YXRlS2V5ID09PSBudWxsIHx8IG1vb25iZWFtUHJpdmF0ZUtleS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBcIkludmFsaWQgU2VjcmV0cyBvYnRhaW5lZCBmb3IgTW9vbmJlYW0gQVBJIGNhbGwhXCI7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFN0b3JhZ2VFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBnZXRTdG9yYWdlIFF1ZXJ5XG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogYnVpbGQgdGhlIE1vb25iZWFtIEFwcFN5bmMgQVBJIEdyYXBoUUwgcXVlcnksIGFuZCBwZXJmb3JtIGEgUE9TVCB0byBpdCxcbiAgICAgICAgICAgICAqIHdpdGggdGhlIGFwcHJvcHJpYXRlIGluZm9ybWF0aW9uLlxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIHdlIGltcGx5IHRoYXQgaWYgdGhlIEFQSSBkb2VzIG5vdCByZXNwb25kIGluIDE1IHNlY29uZHMsIHRoZW4gd2UgYXV0b21hdGljYWxseSBjYXRjaCB0aGF0LCBhbmQgcmV0dXJuIGFuXG4gICAgICAgICAgICAgKiBlcnJvciBmb3IgYSBiZXR0ZXIgY3VzdG9tZXIgZXhwZXJpZW5jZS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgcmV0dXJuIGF4aW9zLnBvc3QoYCR7bW9vbmJlYW1CYXNlVVJMfWAsIHtcbiAgICAgICAgICAgICAgICBxdWVyeTogZ2V0U3RvcmFnZSxcbiAgICAgICAgICAgICAgICB2YXJpYWJsZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgZ2V0U3RvcmFnZUlucHV0OiBnZXRTdG9yYWdlSW5wdXRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAgICAgXCJ4LWFwaS1rZXlcIjogbW9vbmJlYW1Qcml2YXRlS2V5XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiAxNTAwMCwgLy8gaW4gbWlsbGlzZWNvbmRzIGhlcmVcbiAgICAgICAgICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlOiAnTW9vbmJlYW0gQVBJIHRpbWVkIG91dCBhZnRlciAxNTAwMG1zISdcbiAgICAgICAgICAgIH0pLnRoZW4oZ2V0U3RvcmFnZVJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlbmRwb2ludEluZm99IHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZ2V0U3RvcmFnZVJlc3BvbnNlLmRhdGEpfWApO1xuXG4gICAgICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIGRhdGEgYmxvY2sgZnJvbSB0aGUgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICBjb25zdCByZXNwb25zZURhdGEgPSAoZ2V0U3RvcmFnZVJlc3BvbnNlICYmIGdldFN0b3JhZ2VSZXNwb25zZS5kYXRhKVxuICAgICAgICAgICAgICAgICAgICA/IGdldFN0b3JhZ2VSZXNwb25zZS5kYXRhLmRhdGFcbiAgICAgICAgICAgICAgICAgICAgOiBudWxsO1xuXG4gICAgICAgICAgICAgICAgLy8gY2hlY2sgaWYgdGhlcmUgYXJlIGFueSBlcnJvcnMgaW4gdGhlIHJldHVybmVkIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlRGF0YSAmJiByZXNwb25zZURhdGEuZ2V0U3RvcmFnZS5lcnJvck1lc3NhZ2UgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuZWQgdGhlIHN1Y2Nlc3NmdWxseSByZXRyaWV2ZWQgZmlsZSBVUkwgZnJvbSBzdG9yYWdlXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiByZXNwb25zZURhdGEuZ2V0U3RvcmFnZS5kYXRhIGFzIEZpbGVcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZURhdGEgP1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBlcnJvciBtZXNzYWdlIGFuZCB0eXBlLCBmcm9tIHRoZSBvcmlnaW5hbCBBcHBTeW5jIGNhbGxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IHJlc3BvbnNlRGF0YS5nZXRTdG9yYWdlLmVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IHJlc3BvbnNlRGF0YS5nZXRTdG9yYWdlLmVycm9yVHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIGVycm9yIHJlc3BvbnNlIGluZGljYXRpbmcgYW4gaW52YWxpZCBzdHJ1Y3R1cmUgcmV0dXJuZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBJbnZhbGlkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tICR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSFgLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogU3RvcmFnZUVycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yLnJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBhbmQgdGhlIHNlcnZlciByZXNwb25kZWQgd2l0aCBhIHN0YXR1cyBjb2RlXG4gICAgICAgICAgICAgICAgICAgICAqIHRoYXQgZmFsbHMgb3V0IG9mIHRoZSByYW5nZSBvZiAyeHguXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm9uIDJ4eHggcmVzcG9uc2Ugd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgd2l0aCBzdGF0dXMgJHtlcnJvci5yZXNwb25zZS5zdGF0dXN9LCBhbmQgcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShlcnJvci5yZXNwb25zZS5kYXRhKX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGFueSBvdGhlciBzcGVjaWZpYyBlcnJvcnMgdG8gYmUgZmlsdGVyZWQgYmVsb3dcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBTdG9yYWdlRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3IucmVxdWVzdCkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYnV0IG5vIHJlc3BvbnNlIHdhcyByZWNlaXZlZFxuICAgICAgICAgICAgICAgICAgICAgKiBgZXJyb3IucmVxdWVzdGAgaXMgYW4gaW5zdGFuY2Ugb2YgWE1MSHR0cFJlcXVlc3QgaW4gdGhlIGJyb3dzZXIgYW5kIGFuIGluc3RhbmNlIG9mXG4gICAgICAgICAgICAgICAgICAgICAqICBodHRwLkNsaWVudFJlcXVlc3QgaW4gbm9kZS5qcy5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBObyByZXNwb25zZSByZWNlaXZlZCB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gTW9vbmJlYW0gQVBJLCBmb3IgcmVxdWVzdCAke2Vycm9yLnJlcXVlc3R9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFN0b3JhZ2VFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU29tZXRoaW5nIGhhcHBlbmVkIGluIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgdGhhdCB0cmlnZ2VyZWQgYW4gRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgc2V0dGluZyB1cCB0aGUgcmVxdWVzdCBmb3IgdGhlICR7ZW5kcG9pbnRJbmZvfSBNb29uYmVhbSBBUEksICR7KGVycm9yICYmIGVycm9yLm1lc3NhZ2UpICYmIGVycm9yLm1lc3NhZ2V9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFN0b3JhZ2VFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgcmV0cmlldmluZyBhIGZpbGUncyBVUkwgZnJvbSBzdG9yYWdlIHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJ9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBTdG9yYWdlRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHVzZWQgdG8gZ2V0IHRoZSBtaWxpdGFyeSB2ZXJpZmljYXRpb24gaW5mb3JtYXRpb24gb2Ygb25lXG4gICAgICogb3IgbXVsdGlwbGUgdXNlcnMsIGRlcGVuZGluZyBvbiB0aGUgZmlsdGVycyBwYXNzZWQgaW4uXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZ2V0TWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbklucHV0IHRoZSBpbnB1dCBjb250YWluaW5nIHRoZSBtaWxpdGFyeVxuICAgICAqIHZlcmlmaWNhdGlvbiByZWxldmFudCBmaWx0ZXJpbmcuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBhIHtAbGluayBNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydGluZ0luZm9ybWF0aW9uUmVzcG9uc2V9LCByZXByZXNlbnRpbmcgdGhlIGZpbHRlcmVkXG4gICAgICogbWlsaXRhcnkgdmVyaWZpY2F0aW9uIGluZm9ybWF0aW9uIHJlY29yZHMuXG4gICAgICovXG4gICAgYXN5bmMgZ2V0TWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbihnZXRNaWxpdGFyeVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uSW5wdXQ6IEdldE1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5mb3JtYXRpb25JbnB1dCk6IFByb21pc2U8TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRpbmdJbmZvcm1hdGlvblJlc3BvbnNlPiB7XG4gICAgICAgIC8vIGVhc2lseSBpZGVudGlmaWFibGUgQVBJIGVuZHBvaW50IGluZm9ybWF0aW9uXG4gICAgICAgIGNvbnN0IGVuZHBvaW50SW5mbyA9ICdnZXRNaWxpdGFyeVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uIFF1ZXJ5IE1vb25iZWFtIEdyYXBoUUwgQVBJJztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIEFQSSBLZXkgYW5kIEJhc2UgVVJMLCBuZWVkZWQgaW4gb3JkZXIgdG8gbWFrZSB0aGUgbWlsaXRhcnkgdmVyaWZpY2F0aW9uIGluZm9ybWF0aW9uIHJldHJpZXZhbCBjYWxsIHRocm91Z2ggdGhlIGNsaWVudFxuICAgICAgICAgICAgY29uc3QgW21vb25iZWFtQmFzZVVSTCwgbW9vbmJlYW1Qcml2YXRlS2V5XSA9IGF3YWl0IHN1cGVyLnJldHJpZXZlU2VydmljZUNyZWRlbnRpYWxzKENvbnN0YW50cy5BV1NQYWlyQ29uc3RhbnRzLk1PT05CRUFNX0lOVEVSTkFMX1NFQ1JFVF9OQU1FKTtcblxuICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHdlIG9idGFpbmVkIGFueSBpbnZhbGlkIHNlY3JldCB2YWx1ZXMgZnJvbSB0aGUgY2FsbCBhYm92ZVxuICAgICAgICAgICAgaWYgKG1vb25iZWFtQmFzZVVSTCA9PT0gbnVsbCB8fCBtb29uYmVhbUJhc2VVUkwubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgbW9vbmJlYW1Qcml2YXRlS2V5ID09PSBudWxsIHx8IG1vb25iZWFtUHJpdmF0ZUtleS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBcIkludmFsaWQgU2VjcmV0cyBvYnRhaW5lZCBmb3IgTW9vbmJlYW0gQVBJIGNhbGwhXCI7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0aW5nRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogZ2V0TWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbiBRdWVyeVxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIGJ1aWxkIHRoZSBNb29uYmVhbSBBcHBTeW5jIEFQSSBHcmFwaFFMIHF1ZXJ5LCBhbmQgcGVyZm9ybSBhIFBPU1QgdG8gaXQsXG4gICAgICAgICAgICAgKiB3aXRoIHRoZSBhcHByb3ByaWF0ZSBpbmZvcm1hdGlvbi5cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiB3ZSBpbXBseSB0aGF0IGlmIHRoZSBBUEkgZG9lcyBub3QgcmVzcG9uZCBpbiAxNSBzZWNvbmRzLCB0aGVuIHdlIGF1dG9tYXRpY2FsbHkgY2F0Y2ggdGhhdCwgYW5kIHJldHVybiBhblxuICAgICAgICAgICAgICogZXJyb3IgZm9yIGEgYmV0dGVyIGN1c3RvbWVyIGV4cGVyaWVuY2UuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHJldHVybiBheGlvcy5wb3N0KGAke21vb25iZWFtQmFzZVVSTH1gLCB7XG4gICAgICAgICAgICAgICAgcXVlcnk6IGdldE1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5mb3JtYXRpb24sXG4gICAgICAgICAgICAgICAgdmFyaWFibGVzOiB7XG4gICAgICAgICAgICAgICAgICAgIGdldE1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5mb3JtYXRpb25JbnB1dDogZ2V0TWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbklucHV0XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgICAgIFwieC1hcGkta2V5XCI6IG1vb25iZWFtUHJpdmF0ZUtleVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGltZW91dDogMTUwMDAsIC8vIGluIG1pbGxpc2Vjb25kcyBoZXJlXG4gICAgICAgICAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZTogJ01vb25iZWFtIEFQSSB0aW1lZCBvdXQgYWZ0ZXIgMTUwMDBtcyEnXG4gICAgICAgICAgICB9KS50aGVuKGdldE1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5mb3JtYXRpb25JbnB1dFJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlbmRwb2ludEluZm99IHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZ2V0TWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbklucHV0UmVzcG9uc2UuZGF0YSl9YCk7XG5cbiAgICAgICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgZGF0YSBibG9jayBmcm9tIHRoZSByZXNwb25zZVxuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlRGF0YSA9IChnZXRNaWxpdGFyeVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uSW5wdXRSZXNwb25zZSAmJiBnZXRNaWxpdGFyeVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uSW5wdXRSZXNwb25zZS5kYXRhKVxuICAgICAgICAgICAgICAgICAgICA/IGdldE1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5mb3JtYXRpb25JbnB1dFJlc3BvbnNlLmRhdGEuZGF0YVxuICAgICAgICAgICAgICAgICAgICA6IG51bGw7XG5cbiAgICAgICAgICAgICAgICAvLyBjaGVjayBpZiB0aGVyZSBhcmUgYW55IGVycm9ycyBpbiB0aGUgcmV0dXJuZWQgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2VEYXRhICYmIHJlc3BvbnNlRGF0YS5nZXRNaWxpdGFyeVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uLmVycm9yTWVzc2FnZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm5lZCB0aGUgc3VjY2Vzc2Z1bGx5IHJldHJpZXZlZCByZWZlcnJhbHNcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHJlc3BvbnNlRGF0YS5nZXRNaWxpdGFyeVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uLmRhdGEgYXMgTWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRpbmdJbmZvcm1hdGlvbltdXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2VEYXRhID9cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgdHlwZSwgZnJvbSB0aGUgb3JpZ2luYWwgQXBwU3luYyBjYWxsXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiByZXNwb25zZURhdGEudXBkYXRlUmVmZXJyYWwuZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogcmVzcG9uc2VEYXRhLnVwZGF0ZVJlZmVycmFsLmVycm9yVHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIGVycm9yIHJlc3BvbnNlIGluZGljYXRpbmcgYW4gaW52YWxpZCBzdHJ1Y3R1cmUgcmV0dXJuZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBJbnZhbGlkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tICR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSFgLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRpbmdFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvci5yZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYW5kIHRoZSBzZXJ2ZXIgcmVzcG9uZGVkIHdpdGggYSBzdGF0dXMgY29kZVxuICAgICAgICAgICAgICAgICAgICAgKiB0aGF0IGZhbGxzIG91dCBvZiB0aGUgcmFuZ2Ugb2YgMnh4LlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vbiAyeHh4IHJlc3BvbnNlIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBNb29uYmVhbSBBUEksIHdpdGggc3RhdHVzICR7ZXJyb3IucmVzcG9uc2Uuc3RhdHVzfSwgYW5kIHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZXJyb3IucmVzcG9uc2UuZGF0YSl9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBhbnkgb3RoZXIgc3BlY2lmaWMgZXJyb3JzIHRvIGJlIGZpbHRlcmVkIGJlbG93XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRpbmdFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5yZXF1ZXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBidXQgbm8gcmVzcG9uc2Ugd2FzIHJlY2VpdmVkXG4gICAgICAgICAgICAgICAgICAgICAqIGBlcnJvci5yZXF1ZXN0YCBpcyBhbiBpbnN0YW5jZSBvZiBYTUxIdHRwUmVxdWVzdCBpbiB0aGUgYnJvd3NlciBhbmQgYW4gaW5zdGFuY2Ugb2ZcbiAgICAgICAgICAgICAgICAgICAgICogIGh0dHAuQ2xpZW50UmVxdWVzdCBpbiBub2RlLmpzLlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vIHJlc3BvbnNlIHJlY2VpdmVkIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBNb29uYmVhbSBBUEksIGZvciByZXF1ZXN0ICR7ZXJyb3IucmVxdWVzdH1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRpbmdFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU29tZXRoaW5nIGhhcHBlbmVkIGluIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgdGhhdCB0cmlnZ2VyZWQgYW4gRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgc2V0dGluZyB1cCB0aGUgcmVxdWVzdCBmb3IgdGhlICR7ZW5kcG9pbnRJbmZvfSBNb29uYmVhbSBBUEksICR7KGVycm9yICYmIGVycm9yLm1lc3NhZ2UpICYmIGVycm9yLm1lc3NhZ2V9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0aW5nRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHJldHJpZXZpbmcgbWlsaXRhcnkgdmVyaWZpY2F0aW9uIGluZm9ybWF0aW9uIHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJ9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydGluZ0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB1c2VkIHRvIHVwZGF0ZSBhIHJlZmVycmFsJ3MgcGFydGljdWxhciBpbmZvcm1hdGlvbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB1cGRhdGVSZWZlcnJhbElucHV0IHRoZSBpbnB1dCBjb250YWluaW5nIGFueSBpbmZvcm1hdGlvbiByZWxldmFudCBpblxuICAgICAqIHVwZGF0aW5nIGFuIGV4aXN0aW5nIHJlZmVycmFsIG9iamVjdFxuICAgICAqXG4gICAgICogQHJldHVybnMgYSB7QGxpbmsgUmVmZXJyYWxSZXNwb25zZX0sIHJlcHJlc2VudGluZyB0aGUgdXBkYXRlZCByZWZlcnJhbCBpbmZvcm1hdGlvbi5cbiAgICAgKlxuICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgKi9cbiAgICBhc3luYyB1cGRhdGVSZWZlcnJhbCh1cGRhdGVSZWZlcnJhbElucHV0OiBVcGRhdGVSZWZlcnJhbElucHV0KTogUHJvbWlzZTxSZWZlcnJhbFJlc3BvbnNlPiB7XG4gICAgICAgIC8vIGVhc2lseSBpZGVudGlmaWFibGUgQVBJIGVuZHBvaW50IGluZm9ybWF0aW9uXG4gICAgICAgIGNvbnN0IGVuZHBvaW50SW5mbyA9ICd1cGRhdGVSZWZlcnJhbCBRdWVyeSBNb29uYmVhbSBHcmFwaFFMIEFQSSc7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBBUEkgS2V5IGFuZCBCYXNlIFVSTCwgbmVlZGVkIGluIG9yZGVyIHRvIG1ha2UgdGhlIHJlZmVycmFsIHVwZGF0ZWQgY2FsbCB0aHJvdWdoIHRoZSBjbGllbnRcbiAgICAgICAgICAgIGNvbnN0IFttb29uYmVhbUJhc2VVUkwsIG1vb25iZWFtUHJpdmF0ZUtleV0gPSBhd2FpdCBzdXBlci5yZXRyaWV2ZVNlcnZpY2VDcmVkZW50aWFscyhDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5NT09OQkVBTV9JTlRFUk5BTF9TRUNSRVRfTkFNRSk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB3ZSBvYnRhaW5lZCBhbnkgaW52YWxpZCBzZWNyZXQgdmFsdWVzIGZyb20gdGhlIGNhbGwgYWJvdmVcbiAgICAgICAgICAgIGlmIChtb29uYmVhbUJhc2VVUkwgPT09IG51bGwgfHwgbW9vbmJlYW1CYXNlVVJMLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG1vb25iZWFtUHJpdmF0ZUtleSA9PT0gbnVsbCB8fCBtb29uYmVhbVByaXZhdGVLZXkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gXCJJbnZhbGlkIFNlY3JldHMgb2J0YWluZWQgZm9yIE1vb25iZWFtIEFQSSBjYWxsIVwiO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBSZWZlcnJhbEVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIHVwZGF0ZVJlZmVycmFsIFF1ZXJ5XG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogYnVpbGQgdGhlIE1vb25iZWFtIEFwcFN5bmMgQVBJIEdyYXBoUUwgcXVlcnksIGFuZCBwZXJmb3JtIGEgUE9TVCB0byBpdCxcbiAgICAgICAgICAgICAqIHdpdGggdGhlIGFwcHJvcHJpYXRlIGluZm9ybWF0aW9uLlxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIHdlIGltcGx5IHRoYXQgaWYgdGhlIEFQSSBkb2VzIG5vdCByZXNwb25kIGluIDE1IHNlY29uZHMsIHRoZW4gd2UgYXV0b21hdGljYWxseSBjYXRjaCB0aGF0LCBhbmQgcmV0dXJuIGFuXG4gICAgICAgICAgICAgKiBlcnJvciBmb3IgYSBiZXR0ZXIgY3VzdG9tZXIgZXhwZXJpZW5jZS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgcmV0dXJuIGF4aW9zLnBvc3QoYCR7bW9vbmJlYW1CYXNlVVJMfWAsIHtcbiAgICAgICAgICAgICAgICBxdWVyeTogdXBkYXRlUmVmZXJyYWwsXG4gICAgICAgICAgICAgICAgdmFyaWFibGVzOiB7XG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZVJlZmVycmFsSW5wdXQ6IHVwZGF0ZVJlZmVycmFsSW5wdXRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAgICAgXCJ4LWFwaS1rZXlcIjogbW9vbmJlYW1Qcml2YXRlS2V5XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiAxNTAwMCwgLy8gaW4gbWlsbGlzZWNvbmRzIGhlcmVcbiAgICAgICAgICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlOiAnTW9vbmJlYW0gQVBJIHRpbWVkIG91dCBhZnRlciAxNTAwMG1zISdcbiAgICAgICAgICAgIH0pLnRoZW4odXBkYXRlUmVmZXJyYWxSZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KHVwZGF0ZVJlZmVycmFsUmVzcG9uc2UuZGF0YSl9YCk7XG5cbiAgICAgICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgZGF0YSBibG9jayBmcm9tIHRoZSByZXNwb25zZVxuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlRGF0YSA9ICh1cGRhdGVSZWZlcnJhbFJlc3BvbnNlICYmIHVwZGF0ZVJlZmVycmFsUmVzcG9uc2UuZGF0YSkgPyB1cGRhdGVSZWZlcnJhbFJlc3BvbnNlLmRhdGEuZGF0YSA6IG51bGw7XG5cbiAgICAgICAgICAgICAgICAvLyBjaGVjayBpZiB0aGVyZSBhcmUgYW55IGVycm9ycyBpbiB0aGUgcmV0dXJuZWQgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2VEYXRhICYmIHJlc3BvbnNlRGF0YS51cGRhdGVSZWZlcnJhbC5lcnJvck1lc3NhZ2UgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuZWQgdGhlIHN1Y2Nlc3NmdWxseSByZXRyaWV2ZWQgcmVmZXJyYWxzXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiByZXNwb25zZURhdGEudXBkYXRlUmVmZXJyYWwuZGF0YSBhcyBSZWZlcnJhbFtdXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2VEYXRhID9cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgdHlwZSwgZnJvbSB0aGUgb3JpZ2luYWwgQXBwU3luYyBjYWxsXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiByZXNwb25zZURhdGEudXBkYXRlUmVmZXJyYWwuZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogcmVzcG9uc2VEYXRhLnVwZGF0ZVJlZmVycmFsLmVycm9yVHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIGVycm9yIHJlc3BvbnNlIGluZGljYXRpbmcgYW4gaW52YWxpZCBzdHJ1Y3R1cmUgcmV0dXJuZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBJbnZhbGlkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tICR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSFgLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogUmVmZXJyYWxFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvci5yZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYW5kIHRoZSBzZXJ2ZXIgcmVzcG9uZGVkIHdpdGggYSBzdGF0dXMgY29kZVxuICAgICAgICAgICAgICAgICAgICAgKiB0aGF0IGZhbGxzIG91dCBvZiB0aGUgcmFuZ2Ugb2YgMnh4LlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vbiAyeHh4IHJlc3BvbnNlIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBNb29uYmVhbSBBUEksIHdpdGggc3RhdHVzICR7ZXJyb3IucmVzcG9uc2Uuc3RhdHVzfSwgYW5kIHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZXJyb3IucmVzcG9uc2UuZGF0YSl9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBhbnkgb3RoZXIgc3BlY2lmaWMgZXJyb3JzIHRvIGJlIGZpbHRlcmVkIGJlbG93XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogUmVmZXJyYWxFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5yZXF1ZXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBidXQgbm8gcmVzcG9uc2Ugd2FzIHJlY2VpdmVkXG4gICAgICAgICAgICAgICAgICAgICAqIGBlcnJvci5yZXF1ZXN0YCBpcyBhbiBpbnN0YW5jZSBvZiBYTUxIdHRwUmVxdWVzdCBpbiB0aGUgYnJvd3NlciBhbmQgYW4gaW5zdGFuY2Ugb2ZcbiAgICAgICAgICAgICAgICAgICAgICogIGh0dHAuQ2xpZW50UmVxdWVzdCBpbiBub2RlLmpzLlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vIHJlc3BvbnNlIHJlY2VpdmVkIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBNb29uYmVhbSBBUEksIGZvciByZXF1ZXN0ICR7ZXJyb3IucmVxdWVzdH1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogUmVmZXJyYWxFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU29tZXRoaW5nIGhhcHBlbmVkIGluIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgdGhhdCB0cmlnZ2VyZWQgYW4gRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgc2V0dGluZyB1cCB0aGUgcmVxdWVzdCBmb3IgdGhlICR7ZW5kcG9pbnRJbmZvfSBNb29uYmVhbSBBUEksICR7KGVycm9yICYmIGVycm9yLm1lc3NhZ2UpICYmIGVycm9yLm1lc3NhZ2V9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFJlZmVycmFsRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHVwZGF0aW5nIHJlZmVycmFsIHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJ9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBSZWZlcnJhbEVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB1c2VkIHRvIGdldCBleGlzdGluZyByZWZlcnJhbHMgZmlsdGVyZWQgYnkgYSBwYXJ0aWN1bGFyIHN0YXR1cy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBnZXRSZWZlcnJhbHNCeVN0YXR1c0lucHV0IHRoZSBpbnB1dCBjb250YWluaW5nIGFueSBmaWx0ZXJpbmcgaW5mb3JtYXRpb25cbiAgICAgKiBwZXJ0YWluaW5nIHRoZSByZWZlcnJhbCBzdGF0dXMgdGhhdCB3ZSB3b3VsZCB1c2UgdG8gZmlsdGVyIGV4aXN0aW5nIHJlZmVycmFscyBieS5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIGEge0BsaW5rIFJlZmVycmFsUmVzcG9uc2V9LCByZXByZXNlbnRpbmcgdGhlIHJlZmVycmFsIGluZm9ybWF0aW9uIGZpbHRlcmVkXG4gICAgICogYnkgc3RhdHVzLlxuICAgICAqXG4gICAgICogQHByb3RlY3RlZFxuICAgICAqL1xuICAgIGFzeW5jIGdldFJlZmVycmFsQnlTdGF0dXMoZ2V0UmVmZXJyYWxzQnlTdGF0dXNJbnB1dDogR2V0UmVmZXJyYWxzQnlTdGF0dXNJbnB1dCk6IFByb21pc2U8UmVmZXJyYWxSZXNwb25zZT4ge1xuICAgICAgICAvLyBlYXNpbHkgaWRlbnRpZmlhYmxlIEFQSSBlbmRwb2ludCBpbmZvcm1hdGlvblxuICAgICAgICBjb25zdCBlbmRwb2ludEluZm8gPSAnZ2V0UmVmZXJyYWxCeVN0YXR1cyBRdWVyeSBNb29uYmVhbSBHcmFwaFFMIEFQSSc7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBBUEkgS2V5IGFuZCBCYXNlIFVSTCwgbmVlZGVkIGluIG9yZGVyIHRvIG1ha2UgdGhlIHJlZmVycmFsIGJ5IHN0YXR1cyByZXRyaWV2YWwgY2FsbCB0aHJvdWdoIHRoZSBjbGllbnRcbiAgICAgICAgICAgIGNvbnN0IFttb29uYmVhbUJhc2VVUkwsIG1vb25iZWFtUHJpdmF0ZUtleV0gPSBhd2FpdCBzdXBlci5yZXRyaWV2ZVNlcnZpY2VDcmVkZW50aWFscyhDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5NT09OQkVBTV9JTlRFUk5BTF9TRUNSRVRfTkFNRSk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB3ZSBvYnRhaW5lZCBhbnkgaW52YWxpZCBzZWNyZXQgdmFsdWVzIGZyb20gdGhlIGNhbGwgYWJvdmVcbiAgICAgICAgICAgIGlmIChtb29uYmVhbUJhc2VVUkwgPT09IG51bGwgfHwgbW9vbmJlYW1CYXNlVVJMLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG1vb25iZWFtUHJpdmF0ZUtleSA9PT0gbnVsbCB8fCBtb29uYmVhbVByaXZhdGVLZXkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gXCJJbnZhbGlkIFNlY3JldHMgb2J0YWluZWQgZm9yIE1vb25iZWFtIEFQSSBjYWxsIVwiO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBSZWZlcnJhbEVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIGdldFJlZmVycmFsQnlTdGF0dXMgUXVlcnlcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBidWlsZCB0aGUgTW9vbmJlYW0gQXBwU3luYyBBUEkgR3JhcGhRTCBxdWVyeSwgYW5kIHBlcmZvcm0gYSBQT1NUIHRvIGl0LFxuICAgICAgICAgICAgICogd2l0aCB0aGUgYXBwcm9wcmlhdGUgaW5mb3JtYXRpb24uXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogd2UgaW1wbHkgdGhhdCBpZiB0aGUgQVBJIGRvZXMgbm90IHJlc3BvbmQgaW4gMTUgc2Vjb25kcywgdGhlbiB3ZSBhdXRvbWF0aWNhbGx5IGNhdGNoIHRoYXQsIGFuZCByZXR1cm4gYW5cbiAgICAgICAgICAgICAqIGVycm9yIGZvciBhIGJldHRlciBjdXN0b21lciBleHBlcmllbmNlLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICByZXR1cm4gYXhpb3MucG9zdChgJHttb29uYmVhbUJhc2VVUkx9YCwge1xuICAgICAgICAgICAgICAgIHF1ZXJ5OiBnZXRSZWZlcnJhbHNCeVN0YXR1cyxcbiAgICAgICAgICAgICAgICB2YXJpYWJsZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgZ2V0UmVmZXJyYWxzQnlTdGF0dXNJbnB1dDogZ2V0UmVmZXJyYWxzQnlTdGF0dXNJbnB1dFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgICAgICBcIngtYXBpLWtleVwiOiBtb29uYmVhbVByaXZhdGVLZXlcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDE1MDAwLCAvLyBpbiBtaWxsaXNlY29uZHMgaGVyZVxuICAgICAgICAgICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2U6ICdNb29uYmVhbSBBUEkgdGltZWQgb3V0IGFmdGVyIDE1MDAwbXMhJ1xuICAgICAgICAgICAgfSkudGhlbihnZXRSZWZlcnJhbHNCeVN0YXR1c1Jlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlbmRwb2ludEluZm99IHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZ2V0UmVmZXJyYWxzQnlTdGF0dXNSZXNwb25zZS5kYXRhKX1gKTtcblxuICAgICAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBkYXRhIGJsb2NrIGZyb20gdGhlIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2VEYXRhID0gKGdldFJlZmVycmFsc0J5U3RhdHVzUmVzcG9uc2UgJiYgZ2V0UmVmZXJyYWxzQnlTdGF0dXNSZXNwb25zZS5kYXRhKSA/IGdldFJlZmVycmFsc0J5U3RhdHVzUmVzcG9uc2UuZGF0YS5kYXRhIDogbnVsbDtcblxuICAgICAgICAgICAgICAgIC8vIGNoZWNrIGlmIHRoZXJlIGFyZSBhbnkgZXJyb3JzIGluIHRoZSByZXR1cm5lZCByZXNwb25zZVxuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZURhdGEgJiYgcmVzcG9uc2VEYXRhLmdldFJlZmVycmFsc0J5U3RhdHVzLmVycm9yTWVzc2FnZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm5lZCB0aGUgc3VjY2Vzc2Z1bGx5IHJldHJpZXZlZCByZWZlcnJhbHNcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHJlc3BvbnNlRGF0YS5nZXRSZWZlcnJhbHNCeVN0YXR1cy5kYXRhIGFzIFJlZmVycmFsW11cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZURhdGEgP1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBlcnJvciBtZXNzYWdlIGFuZCB0eXBlLCBmcm9tIHRoZSBvcmlnaW5hbCBBcHBTeW5jIGNhbGxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IHJlc3BvbnNlRGF0YS5nZXRSZWZlcnJhbHNCeVN0YXR1cy5lcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiByZXNwb25zZURhdGEuZ2V0UmVmZXJyYWxzQnlTdGF0dXMuZXJyb3JUeXBlXG4gICAgICAgICAgICAgICAgICAgICAgICB9IDpcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgZXJyb3IgcmVzcG9uc2UgaW5kaWNhdGluZyBhbiBpbnZhbGlkIHN0cnVjdHVyZSByZXR1cm5lZFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogYEludmFsaWQgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gJHtlbmRwb2ludEluZm99IHJlc3BvbnNlIWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBSZWZlcnJhbEVycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yLnJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBhbmQgdGhlIHNlcnZlciByZXNwb25kZWQgd2l0aCBhIHN0YXR1cyBjb2RlXG4gICAgICAgICAgICAgICAgICAgICAqIHRoYXQgZmFsbHMgb3V0IG9mIHRoZSByYW5nZSBvZiAyeHguXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm9uIDJ4eHggcmVzcG9uc2Ugd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgd2l0aCBzdGF0dXMgJHtlcnJvci5yZXNwb25zZS5zdGF0dXN9LCBhbmQgcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShlcnJvci5yZXNwb25zZS5kYXRhKX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGFueSBvdGhlciBzcGVjaWZpYyBlcnJvcnMgdG8gYmUgZmlsdGVyZWQgYmVsb3dcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBSZWZlcnJhbEVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVycm9yLnJlcXVlc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGJ1dCBubyByZXNwb25zZSB3YXMgcmVjZWl2ZWRcbiAgICAgICAgICAgICAgICAgICAgICogYGVycm9yLnJlcXVlc3RgIGlzIGFuIGluc3RhbmNlIG9mIFhNTEh0dHBSZXF1ZXN0IGluIHRoZSBicm93c2VyIGFuZCBhbiBpbnN0YW5jZSBvZlxuICAgICAgICAgICAgICAgICAgICAgKiAgaHR0cC5DbGllbnRSZXF1ZXN0IGluIG5vZGUuanMuXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm8gcmVzcG9uc2UgcmVjZWl2ZWQgd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgZm9yIHJlcXVlc3QgJHtlcnJvci5yZXF1ZXN0fWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBSZWZlcnJhbEVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBTb21ldGhpbmcgaGFwcGVuZWQgaW4gc2V0dGluZyB1cCB0aGUgcmVxdWVzdCB0aGF0IHRyaWdnZXJlZCBhbiBFcnJvclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IGZvciB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgJHsoZXJyb3IgJiYgZXJyb3IubWVzc2FnZSkgJiYgZXJyb3IubWVzc2FnZX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogUmVmZXJyYWxFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgcmV0cmlldmluZyByZWZlcnJhbHMgYnkgc3RhdHVzIHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJ9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBSZWZlcnJhbEVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB1c2VkIHRvIGdldCBhIHVzZXIncyBjb250YWN0IGluZm9ybWF0aW9uLCBiYXNlZCBvbiBjZXJ0YWluXG4gICAgICogZmlsdGVycy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBjb250YWN0SW5mb3JtYXRpb25JbnB1dCBjb250YWN0IGluZm9ybWF0aW9uIGlucHV0IHBhc3NlZCBpbiwgY29udGFpbmluZyB0aGVcbiAgICAgKiBmaWx0ZXJzIHVzZWQgdG8gcmV0cmlldmUgdGhlIHVzZXIncyBjb250YWN0IGluZm9ybWF0aW9uLlxuICAgICAqXG4gICAgICogQHJldHVybnMgYSB7QGxpbmsgTWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRpbmdJbmZvcm1hdGlvblJlc3BvbnNlfSwgcmVwcmVzZW50aW5nIHRoZSB1c2VyJ3MgZmlsdGVyZWRcbiAgICAgKiBjb250YWN0IGluZm9ybWF0aW9uLlxuICAgICAqL1xuICAgIGFzeW5jIHJldHJpZXZlQ29udGFjdEluZm9ybWF0aW9uRm9yVXNlcihjb250YWN0SW5mb3JtYXRpb25JbnB1dDogTWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRpbmdJbmZvcm1hdGlvbik6IFByb21pc2U8TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRpbmdJbmZvcm1hdGlvblJlc3BvbnNlPiB7XG4gICAgICAgIC8vIGVhc2lseSBpZGVudGlmaWFibGUgQVBJIGVuZHBvaW50IGluZm9ybWF0aW9uXG4gICAgICAgIGNvbnN0IGVuZHBvaW50SW5mbyA9ICcvbGlzdFVzZXJzIGZvciByZXRyaWV2ZUNvbnRhY3RJbmZvcm1hdGlvbkZvclVzZXIgQ29nbml0byBTREsgY2FsbCc7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBDb2duaXRvIGFjY2VzcyBrZXksIHNlY3JldCBrZXkgYW5kIHVzZXIgcG9vbCBpZCwgbmVlZGVkIGluIG9yZGVyIHRvIHJldHJpZXZlIHRoZSBmaWx0ZXJlZCB1c2VycywgdGhyb3VnaCB0aGUgQ29nbml0byBJZGVudGl0eSBwcm92aWRlciBjbGllbnRcbiAgICAgICAgICAgIGNvbnN0IFtjb2duaXRvQWNjZXNzS2V5SWQsIGNvZ25pdG9TZWNyZXRLZXksIGNvZ25pdG9Vc2VyUG9vbElkXSA9IGF3YWl0IHN1cGVyLnJldHJpZXZlU2VydmljZUNyZWRlbnRpYWxzKENvbnN0YW50cy5BV1NQYWlyQ29uc3RhbnRzLk1PT05CRUFNX0lOVEVSTkFMX1NFQ1JFVF9OQU1FLFxuICAgICAgICAgICAgICAgIHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIHRydWUpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgd2Ugb2J0YWluZWQgYW55IGludmFsaWQgc2VjcmV0IHZhbHVlcyBmcm9tIHRoZSBjYWxsIGFib3ZlXG4gICAgICAgICAgICBpZiAoY29nbml0b0FjY2Vzc0tleUlkID09PSBudWxsIHx8IGNvZ25pdG9BY2Nlc3NLZXlJZC5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBjb2duaXRvU2VjcmV0S2V5ID09PSBudWxsIHx8IGNvZ25pdG9TZWNyZXRLZXkubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgY29nbml0b1VzZXJQb29sSWQgPT09IG51bGwgfHwgKGNvZ25pdG9Vc2VyUG9vbElkICYmIGNvZ25pdG9Vc2VyUG9vbElkLmxlbmd0aCA9PT0gMCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBcIkludmFsaWQgU2VjcmV0cyBvYnRhaW5lZCBmb3IgQ29nbml0byBTREsgY2FsbCBjYWxsIVwiO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydGluZ0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBpbml0aWFsaXplIHRoZSBDb2duaXRvIElkZW50aXR5IFByb3ZpZGVyIGNsaWVudCB1c2luZyB0aGUgY3JlZGVudGlhbHMgb2J0YWluZWQgYWJvdmVcbiAgICAgICAgICAgIGNvbnN0IGNvZ25pdG9JZGVudGl0eVByb3ZpZGVyQ2xpZW50ID0gbmV3IENvZ25pdG9JZGVudGl0eVByb3ZpZGVyQ2xpZW50KHtcbiAgICAgICAgICAgICAgICByZWdpb246IHRoaXMucmVnaW9uLFxuICAgICAgICAgICAgICAgIGNyZWRlbnRpYWxzOiB7XG4gICAgICAgICAgICAgICAgICAgIGFjY2Vzc0tleUlkOiBjb2duaXRvQWNjZXNzS2V5SWQsXG4gICAgICAgICAgICAgICAgICAgIHNlY3JldEFjY2Vzc0tleTogY29nbml0b1NlY3JldEtleVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIGV4ZWN1dGUgdGhlIExpc3QgVXNlcnMgY29tbWFuZCwgdXNpbmcgZmlsdGVycywgaW4gb3JkZXIgdG8gcmV0cmlldmUgYSB1c2VyJ3MgY29udGFjdCBpbmZvcm1hdGlvblxuICAgICAgICAgICAgICogKGVtYWlsIGFuZCBwaG9uZSBudW1iZXIpIGZyb20gdGhlaXIgYXR0cmlidXRlcy5cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBSZXRyaWV2ZSB0aGUgdXNlciBieSB0aGVpciBmYW1pbHlfbmFtZS4gSWYgdGhlcmUgYXJlIGlzIG1vcmUgdGhhbiAxIG1hdGNoIHJldHVybmVkLCB0aGVuIHdlIHdpbGwgbWF0Y2hcbiAgICAgICAgICAgICAqIHRoZSB1c2VyIGJhc2VkIG9uIHRoZWlyIHVuaXF1ZSBpZCwgZnJvbSB0aGUgY3VzdG9tOnVzZXJJZCBhdHRyaWJ1dGVcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgY29uc3QgbGlzdFVzZXJzUmVzcG9uc2U6IExpc3RVc2Vyc0NvbW1hbmRPdXRwdXQgPSBhd2FpdCBjb2duaXRvSWRlbnRpdHlQcm92aWRlckNsaWVudC5zZW5kKG5ldyBMaXN0VXNlcnNDb21tYW5kKHtcbiAgICAgICAgICAgICAgICBVc2VyUG9vbElkOiBjb2duaXRvVXNlclBvb2xJZCxcbiAgICAgICAgICAgICAgICBBdHRyaWJ1dGVzVG9HZXQ6IFsnZW1haWwnLCAncGhvbmVfbnVtYmVyJywgJ2N1c3RvbTp1c2VySWQnXSxcbiAgICAgICAgICAgICAgICBGaWx0ZXI6IGBmYW1pbHlfbmFtZT0gXCIke2Ake2NvbnRhY3RJbmZvcm1hdGlvbklucHV0Lmxhc3ROYW1lfWAucmVwbGFjZUFsbChcIlxcXCJcIiwgXCJcXFxcXFxcIlwiKX1cImBcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIC8vIGNoZWNrIGZvciBhIHZhbGlkIHJlc3BvbnNlIGZyb20gdGhlIENvZ25pdG8gTGlzdCBVc2VycyBDb21tYW5kIGNhbGxcbiAgICAgICAgICAgIGlmIChsaXN0VXNlcnNSZXNwb25zZSAhPT0gbnVsbCAmJiBsaXN0VXNlcnNSZXNwb25zZS4kbWV0YWRhdGEgIT09IG51bGwgJiYgbGlzdFVzZXJzUmVzcG9uc2UuJG1ldGFkYXRhLmh0dHBTdGF0dXNDb2RlICE9PSBudWxsICYmXG4gICAgICAgICAgICAgICAgbGlzdFVzZXJzUmVzcG9uc2UuJG1ldGFkYXRhLmh0dHBTdGF0dXNDb2RlICE9PSB1bmRlZmluZWQgJiYgbGlzdFVzZXJzUmVzcG9uc2UuJG1ldGFkYXRhLmh0dHBTdGF0dXNDb2RlID09PSAyMDAgJiZcbiAgICAgICAgICAgICAgICBsaXN0VXNlcnNSZXNwb25zZS5Vc2VycyAhPT0gbnVsbCAmJiBsaXN0VXNlcnNSZXNwb25zZS5Vc2VycyAhPT0gdW5kZWZpbmVkICYmIGxpc3RVc2Vyc1Jlc3BvbnNlLlVzZXJzIS5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgICAgICAvLyBJZiB0aGVyZSBhcmUgaXMgbW9yZSB0aGFuIDEgbWF0Y2ggcmV0dXJuZWQsIHRoZW4gd2Ugd2lsbCBtYXRjaCB0aGUgdXNlciBiYXNlZCBvbiB0aGVpciB1bmlxdWUgaWQsIGZyb20gdGhlIGN1c3RvbTp1c2VySWQgYXR0cmlidXRlXG4gICAgICAgICAgICAgICAgbGV0IGludmFsaWRBdHRyaWJ1dGVzRmxhZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGxpc3RVc2Vyc1Jlc3BvbnNlLlVzZXJzLmZvckVhY2goY29nbml0b1VzZXIgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY29nbml0b1VzZXIuQXR0cmlidXRlcyA9PT0gbnVsbCB8fCBjb2duaXRvVXNlci5BdHRyaWJ1dGVzID09PSB1bmRlZmluZWQgfHwgY29nbml0b1VzZXIuQXR0cmlidXRlcy5sZW5ndGggIT09IDMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGludmFsaWRBdHRyaWJ1dGVzRmxhZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAvLyBjaGVjayBmb3IgdmFsaWQgdXNlciBhdHRyaWJ1dGVzXG4gICAgICAgICAgICAgICAgaWYgKCFpbnZhbGlkQXR0cmlidXRlc0ZsYWcpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1hdGNoZWRFbWFpbDogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIGxldCBtYXRjaGVkUGhvbmVOdW1iZXI6IHN0cmluZyB8IG51bGwgPSBudWxsO1xuXG4gICAgICAgICAgICAgICAgICAgIGxldCBub09mTWF0Y2hlcyA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGxpc3RVc2Vyc1Jlc3BvbnNlLlVzZXJzLmZvckVhY2goY29nbml0b1VzZXIgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvZ25pdG9Vc2VyLkF0dHJpYnV0ZXMhWzJdLlZhbHVlIS50cmltKCkgPT09IGNvbnRhY3RJbmZvcm1hdGlvbklucHV0LmlkLnRyaW0oKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoZWRFbWFpbCA9IGNvZ25pdG9Vc2VyLkF0dHJpYnV0ZXMhWzBdLlZhbHVlITtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXRjaGVkUGhvbmVOdW1iZXIgPSBjb2duaXRvVXNlci5BdHRyaWJ1dGVzIVsxXS5WYWx1ZSE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9PZk1hdGNoZXMgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChub09mTWF0Y2hlcyA9PT0gMSAmJiBtYXRjaGVkRW1haWwgIT09IG51bGwgJiYgbWF0Y2hlZFBob25lTnVtYmVyICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250YWN0SW5mb3JtYXRpb25JbnB1dC5waG9uZU51bWJlciA9IG1hdGNoZWRQaG9uZU51bWJlcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhY3RJbmZvcm1hdGlvbklucHV0LmVtYWlsQWRkcmVzcyA9IG1hdGNoZWRFbWFpbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogW2NvbnRhY3RJbmZvcm1hdGlvbklucHV0XVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYENvdWxkbid0IGZpbmQgdXNlciBpbiBDb2duaXRvIGZvciAke2NvbnRhY3RJbmZvcm1hdGlvbklucHV0LmlkfWA7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9YCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0aW5nRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBJbnZhbGlkIHVzZXIgYXR0cmlidXRlcyBvYnRhaW5lZGA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX1gKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRpbmdFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBJbnZhbGlkIHN0cnVjdHVyZSBvYnRhaW5lZCB3aGlsZSBjYWxsaW5nIHRoZSBnZXQgTGlzdCBVc2VycyBDb2duaXRvIGNvbW1hbmRgO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX1gKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRpbmdFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yLFxuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgcmV0cmlldmluZyB0aGUgY29udGFjdCBpbmZvcm1hdGlvbiBmb3IgdXNlciAke2NvbnRhY3RJbmZvcm1hdGlvbklucHV0LmlkfSwgZnJvbSBDb2duaXRvIHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJ9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0aW5nRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvcixcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHVzZWQgdG8gZ2V0IGFsbCB0aGUgdXNlcnMgdXNlZCB0byBkZWxpdmVyIG5vdGlmaWNhdGlvbiByZW1pbmRlcnMgdG8sXG4gICAgICogc29ydGVkIGJ5IGEgcGFydGljdWxhciBsb2NhdGlvbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBnZXRVc2Vyc0J5R2VvZ3JhcGhpY2FsTG9jYXRpb25JbnB1dCB0aGUgZ2VvbG9jYXRpb24gaW5wdXQgdGhhdCB3ZSBmaWx0ZXIgdXNlcnMgYnlcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIGEge0BsaW5rIFVzZXJGb3JOb3RpZmljYXRpb25SZW1pbmRlclJlc3BvbnNlfSwgcmVwcmVzZW50aW5nIGVhY2ggaW5kaXZpZHVhbCB1c2VycydcbiAgICAgKiB1c2VyIElELCBmaXJzdCwgbGFzdCBuYW1lIGFuZCBlbWFpbCwgc29ydGVkIGJ5IGEgcGFydGljdWxhciBsb2NhdGlvbiAoY2l0eSAmIHN0YXRlIGNvbWJpbmF0aW9uKS5cbiAgICAgKi9cbiAgICBhc3luYyBnZXRVc2Vyc0J5R2VvZ3JhcGh5Rm9yTm90aWZpY2F0aW9uUmVtaW5kZXJzKGdldFVzZXJzQnlHZW9ncmFwaGljYWxMb2NhdGlvbklucHV0OiBHZXRVc2Vyc0J5R2VvZ3JhcGhpY2FsTG9jYXRpb25JbnB1dCk6IFByb21pc2U8VXNlckZvck5vdGlmaWNhdGlvblJlbWluZGVyUmVzcG9uc2U+IHtcbiAgICAgICAgLy8gZWFzaWx5IGlkZW50aWZpYWJsZSBBUEkgZW5kcG9pbnQgaW5mb3JtYXRpb25cbiAgICAgICAgY29uc3QgZW5kcG9pbnRJbmZvID0gJy9saXN0VXNlcnMgZm9yIGdldFVzZXJzQnlHZW9ncmFwaHlGb3JOb3RpZmljYXRpb25SZW1pbmRlcnMgQ29nbml0byBTREsgY2FsbCc7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBDb2duaXRvIGFjY2VzcyBrZXksIHNlY3JldCBrZXkgYW5kIHVzZXIgcG9vbCBpZCwgbmVlZGVkIGluIG9yZGVyIHRvIHJldHJpZXZlIGFsbCB1c2VycyBzb3J0ZWQgYnkgbG9jYXRpb24sIHRocm91Z2ggdGhlIENvZ25pdG8gSWRlbnRpdHkgcHJvdmlkZXIgY2xpZW50XG4gICAgICAgICAgICBjb25zdCBbY29nbml0b0FjY2Vzc0tleUlkLCBjb2duaXRvU2VjcmV0S2V5LCBjb2duaXRvVXNlclBvb2xJZF0gPSBhd2FpdCBzdXBlci5yZXRyaWV2ZVNlcnZpY2VDcmVkZW50aWFscyhDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5NT09OQkVBTV9JTlRFUk5BTF9TRUNSRVRfTkFNRSxcbiAgICAgICAgICAgICAgICB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICB0cnVlKTtcblxuICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHdlIG9idGFpbmVkIGFueSBpbnZhbGlkIHNlY3JldCB2YWx1ZXMgZnJvbSB0aGUgY2FsbCBhYm92ZVxuICAgICAgICAgICAgaWYgKGNvZ25pdG9BY2Nlc3NLZXlJZCA9PT0gbnVsbCB8fCBjb2duaXRvQWNjZXNzS2V5SWQubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgY29nbml0b1NlY3JldEtleSA9PT0gbnVsbCB8fCBjb2duaXRvU2VjcmV0S2V5Lmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIGNvZ25pdG9Vc2VyUG9vbElkID09PSBudWxsIHx8IChjb2duaXRvVXNlclBvb2xJZCAmJiBjb2duaXRvVXNlclBvb2xJZC5sZW5ndGggPT09IDApKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gXCJJbnZhbGlkIFNlY3JldHMgb2J0YWluZWQgZm9yIENvZ25pdG8gU0RLIGNhbGwgY2FsbCFcIjtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uUmVtaW5kZXJFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gaW5pdGlhbGl6ZSB0aGUgQ29nbml0byBJZGVudGl0eSBQcm92aWRlciBjbGllbnQgdXNpbmcgdGhlIGNyZWRlbnRpYWxzIG9idGFpbmVkIGFib3ZlXG4gICAgICAgICAgICBjb25zdCBjb2duaXRvSWRlbnRpdHlQcm92aWRlckNsaWVudCA9IG5ldyBDb2duaXRvSWRlbnRpdHlQcm92aWRlckNsaWVudCh7XG4gICAgICAgICAgICAgICAgcmVnaW9uOiB0aGlzLnJlZ2lvbixcbiAgICAgICAgICAgICAgICBjcmVkZW50aWFsczoge1xuICAgICAgICAgICAgICAgICAgICBhY2Nlc3NLZXlJZDogY29nbml0b0FjY2Vzc0tleUlkLFxuICAgICAgICAgICAgICAgICAgICBzZWNyZXRBY2Nlc3NLZXk6IGNvZ25pdG9TZWNyZXRLZXlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBleGVjdXRlIHRoZXcgTGlzdCBVc2VycyBjb21tYW5kLCB3aXRob3V0IGFueSBmaWx0ZXJzLCBpbiBvcmRlciB0byByZXRyaWV2ZSBhIHVzZXIncyBlbWFpbCwgYWRkcmVzc1xuICAgICAgICAgICAgICogYW5kIHRoZWlyIGN1c3RvbSB1c2VyIElELCBmcm9tIHRoZWlyIGF0dHJpYnV0ZXMuXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogVGhlc2UgcmVzdWx0cyBhcmUgZ29pbmcgdG8gYmUgcGFnaW5hdGVkLCBzbyB3ZSB3aWxsIGxpbWl0IHRoZSBwYWdlIHNpemUgdG8gNjAgdXNlcnMgKG1heGltdW0gYWxsb3dlZCB0aHJvdWdoIHRoaXNcbiAgICAgICAgICAgICAqIGNhbGwpLCBhbmQga2VlcCB0cmFjayBvZiB0aGUgbnVtYmVyIG9mIHBhZ2VzIGFuZCBsYWNrIHRoZXJlb2YsIHRocm91Z2ggYSBmbGFnLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBjb25zdCB1c2VyUmVzdWx0czogVXNlclR5cGVbXSA9IFtdO1xuICAgICAgICAgICAgbGV0IGxhc3RQYWdpbmF0aW9uVG9rZW46IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGxldCBpbnB1dDogTGlzdFVzZXJzQ29tbWFuZElucHV0ID0ge1xuICAgICAgICAgICAgICAgIFVzZXJQb29sSWQ6IGNvZ25pdG9Vc2VyUG9vbElkLFxuICAgICAgICAgICAgICAgIEF0dHJpYnV0ZXNUb0dldDogWydnaXZlbl9uYW1lJywgJ2ZhbWlseV9uYW1lJywgJ2VtYWlsJywgJ2N1c3RvbTp1c2VySWQnLCAnYWRkcmVzcyddLFxuICAgICAgICAgICAgICAgIExpbWl0OiA2MCxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICAvLyBrZWVwIGdldHRpbmcgdXNlcnMgYW5kIHVwZGF0aW5nIHRoZSByZXN1bHRzIGFycmF5IGZvciB1c2VycyByZXRyaWV2ZWQsIHVudGlsIHdlIHJ1biBvdXQgb2YgdXNlcnMgdG8gcmV0cmlldmVcbiAgICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgICAgICAvLyBleGVjdXRlIHRoZSBMaXN0IFVzZXJzIGNvbW1hbmQsIGdpdmVuIHRoZSBpbnB1dCBwcm92aWRlZCBhYm92ZVxuICAgICAgICAgICAgICAgIGNvbnN0IGxpc3RVc2Vyc1Jlc3BvbnNlOiBMaXN0VXNlcnNDb21tYW5kT3V0cHV0ID0gYXdhaXQgY29nbml0b0lkZW50aXR5UHJvdmlkZXJDbGllbnQuc2VuZChcbiAgICAgICAgICAgICAgICAgICAgbmV3IExpc3RVc2Vyc0NvbW1hbmQoaW5wdXQpXG4gICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIGNoZWNrIHdoZXRoZXIgdGhlIExpc3QgVXNlcnMgQ29tbWFuZCBoYXMgYSB2YWxpZCByZXNwb25zZS8gdmFsaWQgbGlzdCBvZiB1c2VycyB0byBiZSByZXR1cm5lZCxcbiAgICAgICAgICAgICAgICAgKiBhbmQgaWYgc28gYWRkIGluIHRoZSByZXN1bHRpbmcgbGlzdCBhY2NvcmRpbmdseS5cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBsaXN0VXNlcnNSZXNwb25zZS4kbWV0YWRhdGEgIT09IG51bGwgJiYgbGlzdFVzZXJzUmVzcG9uc2UuJG1ldGFkYXRhLmh0dHBTdGF0dXNDb2RlICE9PSBudWxsICYmXG4gICAgICAgICAgICAgICAgbGlzdFVzZXJzUmVzcG9uc2UuJG1ldGFkYXRhLmh0dHBTdGF0dXNDb2RlICE9PSB1bmRlZmluZWQgJiYgbGlzdFVzZXJzUmVzcG9uc2UuJG1ldGFkYXRhLmh0dHBTdGF0dXNDb2RlID09PSAyMDAgJiZcbiAgICAgICAgICAgICAgICBsaXN0VXNlcnNSZXNwb25zZS5Vc2VycyAhPT0gbnVsbCAmJiBsaXN0VXNlcnNSZXNwb25zZS5Vc2VycyAhPT0gdW5kZWZpbmVkICYmIGxpc3RVc2Vyc1Jlc3BvbnNlLlVzZXJzIS5sZW5ndGggIT09IDAgJiZcbiAgICAgICAgICAgICAgICB1c2VyUmVzdWx0cy5wdXNoKC4uLmxpc3RVc2Vyc1Jlc3BvbnNlLlVzZXJzKTtcblxuICAgICAgICAgICAgICAgIC8vIGdldCB0aGUgbGFzdCBwYWdpbmF0aW9uIHRva2VuIGZyb20gdGhlIHJldHJpZXZlZCBvdXRwdXQsIGFuZCBzZXQgdGhlIG5leHQgaW5wdXQgY29tbWFuZCdzIHBhZ2luYXRpb24gdG9rZW4gYWNjb3JkaW5nIHRvIHRoYXRcbiAgICAgICAgICAgICAgICBsYXN0UGFnaW5hdGlvblRva2VuID0gbGlzdFVzZXJzUmVzcG9uc2UuUGFnaW5hdGlvblRva2VuO1xuICAgICAgICAgICAgICAgIGlucHV0LlBhZ2luYXRpb25Ub2tlbiA9IGxhc3RQYWdpbmF0aW9uVG9rZW47XG4gICAgICAgICAgICB9IHdoaWxlICh0eXBlb2YgbGFzdFBhZ2luYXRpb25Ub2tlbiAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiBsYXN0UGFnaW5hdGlvblRva2VuICE9PSAndW5kZWZpbmVkJyAmJiBsYXN0UGFnaW5hdGlvblRva2VuICE9PSB1bmRlZmluZWQpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayBmb3IgYSB2YWxpZCByZXNwb25zZSBsaXN0LCBvYnRhaW5lZCBmcm9tIHRoZSBDb2duaXRvIExpc3QgVXNlcnMgQ29tbWFuZCBjYWxsXG4gICAgICAgICAgICBpZiAodXNlclJlc3VsdHMubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgLy8gbG9vcCB0aHJvdWdoIHRoZSBsaXN0IG9mIHVzZXJzIG9idGFpbmVkIHRocm91Z2ggY29tbWFuZCwgYW5kIHJldHVybiB0aGVpciBlbWFpbHMgYW5kIGN1c3RvbSB1c2VyIElEc1xuICAgICAgICAgICAgICAgIGNvbnN0IHVzZXJEZXRhaWxzRm9yTm90aWZpY2F0aW9uUmVtaW5kZXI6IFJldHJpZXZlVXNlckRldGFpbHNGb3JOb3RpZmljYXRpb25zW10gPSBbXTtcbiAgICAgICAgICAgICAgICB1c2VyUmVzdWx0cy5mb3JFYWNoKGNvZ25pdG9Vc2VyID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvZ25pdG9Vc2VyLkF0dHJpYnV0ZXMgIT09IHVuZGVmaW5lZCAmJiBjb2duaXRvVXNlci5BdHRyaWJ1dGVzIS5sZW5ndGggPT09IDUgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZ25pdG9Vc2VyLkF0dHJpYnV0ZXMhWzBdICE9PSB1bmRlZmluZWQgJiYgY29nbml0b1VzZXIuQXR0cmlidXRlcyFbMF0uVmFsdWUhLmxlbmd0aCAhPT0gMCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgY29nbml0b1VzZXIuQXR0cmlidXRlcyFbMV0gIT09IHVuZGVmaW5lZCAmJiBjb2duaXRvVXNlci5BdHRyaWJ1dGVzIVsxXS5WYWx1ZSEubGVuZ3RoICE9PSAwICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2duaXRvVXNlci5BdHRyaWJ1dGVzIVsyXSAhPT0gdW5kZWZpbmVkICYmIGNvZ25pdG9Vc2VyLkF0dHJpYnV0ZXMhWzJdLlZhbHVlIS5sZW5ndGggIT09IDAgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZ25pdG9Vc2VyLkF0dHJpYnV0ZXMhWzNdICE9PSB1bmRlZmluZWQgJiYgY29nbml0b1VzZXIuQXR0cmlidXRlcyFbM10uVmFsdWUhLmxlbmd0aCAhPT0gMCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgY29nbml0b1VzZXIuQXR0cmlidXRlcyFbNF0gIT09IHVuZGVmaW5lZCAmJiBjb2duaXRvVXNlci5BdHRyaWJ1dGVzIVs0XS5WYWx1ZSEubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBtYWtlIHN1cmUgdGhhdCB0aGUgdXNlcnMgcmV0cmlldmVkIGFyZSByZXNpZGluZyBpbiB0aGUgY2l0eSBhbmQgc3RhdGUgcHJvdmlkZWQgaW4gdGhlIGlucHV0XG4gICAgICAgICAgICAgICAgICAgICAgICBnZXRVc2Vyc0J5R2VvZ3JhcGhpY2FsTG9jYXRpb25JbnB1dC56aXBDb2Rlcy5mb3JFYWNoKHppcENvZGUgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh6aXBDb2RlICE9PSBudWxsICYmIGNvZ25pdG9Vc2VyLkF0dHJpYnV0ZXMhWzBdLlZhbHVlIS5pbmNsdWRlcyh6aXBDb2RlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBwdXNoIHRoZSBuZXcgdXNlciBkZXRhaWxzIGluIHRoZSB1c2VyIGRldGFpbHMgYXJyYXkgdG8gYmUgcmV0dXJuZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlckRldGFpbHNGb3JOb3RpZmljYXRpb25SZW1pbmRlci5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjb2duaXRvVXNlci5BdHRyaWJ1dGVzIVs0XS5WYWx1ZSEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbWFpbDogY29nbml0b1VzZXIuQXR0cmlidXRlcyFbM10uVmFsdWUhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3ROYW1lOiBjb2duaXRvVXNlci5BdHRyaWJ1dGVzIVsxXS5WYWx1ZSEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0TmFtZTogY29nbml0b1VzZXIuQXR0cmlidXRlcyFbMl0uVmFsdWUhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSB1c2VyIGRldGFpbHMgcmVzdWx0c1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHVzZXJEZXRhaWxzRm9yTm90aWZpY2F0aW9uUmVtaW5kZXJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBFbXB0eSB1c2VyIGxpc3QgYXJyYXksIG9idGFpbmVkIHdoaWxlIGNhbGxpbmcgdGhlIGdldCBMaXN0IFVzZXJzIENvZ25pdG8gY29tbWFuZGA7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfWApO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogW10sXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uUmVtaW5kZXJFcnJvclR5cGUuTm9uZU9yQWJzZW50LFxuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgcmV0cmlldmluZyB1c2VycyBieSB0aGVpciBjdXN0b20gbG9jYXRpb24gJHtKU09OLnN0cmluZ2lmeShnZXRVc2Vyc0J5R2VvZ3JhcGhpY2FsTG9jYXRpb25JbnB1dC56aXBDb2Rlcyl9IGZyb20gQ29nbml0byB0aHJvdWdoICR7ZW5kcG9pbnRJbmZvfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9ICR7ZXJyfWApO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25SZW1pbmRlckVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3IsXG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB1c2VkIHRvIGdldCBhbGwgdGhlIHVzZXJzIGVsaWdpYmxlIGZvciByZWltYnVyc2VtZW50cy5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIGEge0BsaW5rIFVzZXJGb3JOb3RpZmljYXRpb25SZW1pbmRlclJlc3BvbnNlfSwgcmVwcmVzZW50aW5nIGVhY2ggaW5kaXZpZHVhbCBlbGlnaWJsZSB1c2VycydcbiAgICAgKiB1c2VyIElELCBmaXJzdCwgbGFzdCBuYW1lIGFuZCBlbWFpbC5cbiAgICAgKi9cbiAgICBhc3luYyBnZXRBbGxVc2Vyc0VsaWdpYmxlRm9yUmVpbWJ1cnNlbWVudHMoKTogUHJvbWlzZTxVc2VyRm9yTm90aWZpY2F0aW9uUmVtaW5kZXJSZXNwb25zZT4ge1xuICAgICAgICAvLyBlYXNpbHkgaWRlbnRpZmlhYmxlIEFQSSBlbmRwb2ludCBpbmZvcm1hdGlvblxuICAgICAgICBjb25zdCBlbmRwb2ludEluZm8gPSAnL2dldEFsbFVzZXJzRWxpZ2libGVGb3JSZWltYnVyc2VtZW50cyBjYWxsJztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gZmlyc3Qgd2Ugd2lsbCBhdHRlbXB0IHRvIGNhbGwgdGhlIC9nZXRBbGxVc2Vyc0Zvck5vdGlmaWNhdGlvblJlbWluZGVycywgaW4gb3JkZXIgdG8gY2FwdHVyZSBhbGwgdXNlcnMuXG4gICAgICAgICAgICBjb25zdCBhbGxVc2Vyc0VsaWdpYmxlRm9yUmVpbWJ1cnNlbWVudHNSZXNwb25zZTogVXNlckZvck5vdGlmaWNhdGlvblJlbWluZGVyUmVzcG9uc2UgPSBhd2FpdCB0aGlzLmdldEFsbFVzZXJzRm9yTm90aWZpY2F0aW9uUmVtaW5kZXJzKCk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGUgdXNlciByZXRyaWV2YWwgd2FzIHN1Y2Nlc3NmdWwgb3Igbm90XG4gICAgICAgICAgICBpZiAoYWxsVXNlcnNFbGlnaWJsZUZvclJlaW1idXJzZW1lbnRzUmVzcG9uc2UgJiYgIWFsbFVzZXJzRWxpZ2libGVGb3JSZWltYnVyc2VtZW50c1Jlc3BvbnNlLmVycm9yTWVzc2FnZSAmJiAhYWxsVXNlcnNFbGlnaWJsZUZvclJlaW1idXJzZW1lbnRzUmVzcG9uc2UuZXJyb3JUeXBlICYmXG4gICAgICAgICAgICAgICAgYWxsVXNlcnNFbGlnaWJsZUZvclJlaW1idXJzZW1lbnRzUmVzcG9uc2UuZGF0YSAhPT0gdW5kZWZpbmVkICYmIGFsbFVzZXJzRWxpZ2libGVGb3JSZWltYnVyc2VtZW50c1Jlc3BvbnNlLmRhdGEgIT09IG51bGwgJiYgYWxsVXNlcnNFbGlnaWJsZUZvclJlaW1idXJzZW1lbnRzUmVzcG9uc2UuZGF0YS5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgICAgICAvLyBmb3IgZWFjaCB1c2VyIGluIHRoZSBsaXN0IG9mIHVzZXJzLCBjYWxsIHRoZSBnZXRUcmFuc2FjdGlvbkJ5U3RhdHVzIEFwcFN5bmMgQVBJIGluIG9yZGVyIHRvIHNlZSBpZiB0aGV5IGFyZSBlbGlnaWJsZSBmb3IgYSByZWltYnVyc2VtZW50XG4gICAgICAgICAgICAgICAgY29uc3QgdXNlcnNUb05vdGlmeTogUmV0cmlldmVVc2VyRGV0YWlsc0Zvck5vdGlmaWNhdGlvbnNbXSA9IFtdO1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgZWxpZ2libGVVc2VyIG9mIGFsbFVzZXJzRWxpZ2libGVGb3JSZWltYnVyc2VtZW50c1Jlc3BvbnNlLmRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVsaWdpYmxlVXNlciAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZmxhZyB0byByZXByZXNlbnQgdGhlIHVzZXIncyByZWltYnVyc2VtZW50IGVsaWdpYmlsaXR5XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZWxpZ2libGVGb3JSZWltYnVyc2VtZW50Tm90aWZpY2F0aW9uOiBib29sZWFuID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZpcnN0IHJldHJpZXZlIHRoZSBQUk9DRVNTRUQgdHJhbnNhY3Rpb25zXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwcm9jZXNzZWRUcmFuc2FjdGlvbnNSZXNwb25zZTogTW9vbmJlYW1UcmFuc2FjdGlvbnNCeVN0YXR1c1Jlc3BvbnNlID0gYXdhaXQgdGhpcy5nZXRUcmFuc2FjdGlvbkJ5U3RhdHVzKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogZWxpZ2libGVVc2VyLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1czogVHJhbnNhY3Rpb25zU3RhdHVzLlByb2Nlc3NlZFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIGNhbGwgd2FzIHN1Y2Nlc3NmdWwgYW5kIGlmIHdlIGhhdmUgYW55IFBST0NFU1NFRCB0cmFuc2FjdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwcm9jZXNzZWRUcmFuc2FjdGlvbnNSZXNwb25zZSAmJiAhcHJvY2Vzc2VkVHJhbnNhY3Rpb25zUmVzcG9uc2UuZXJyb3JNZXNzYWdlICYmICFwcm9jZXNzZWRUcmFuc2FjdGlvbnNSZXNwb25zZS5lcnJvclR5cGUgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9jZXNzZWRUcmFuc2FjdGlvbnNSZXNwb25zZS5kYXRhICE9PSB1bmRlZmluZWQgJiYgcHJvY2Vzc2VkVHJhbnNhY3Rpb25zUmVzcG9uc2UuZGF0YSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsaWdpYmxlRm9yUmVpbWJ1cnNlbWVudE5vdGlmaWNhdGlvbiA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBQUk9DRVNTRUQgdHJhbnNhY3Rpb25zIGNhbGwgZm9yIHVzZXIgJHtlbGlnaWJsZVVzZXIuaWR9IGNhbGwgZmFpbGVkYCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxpZ2libGVGb3JSZWltYnVyc2VtZW50Tm90aWZpY2F0aW9uID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBGVU5ERUQgdHJhbnNhY3Rpb25zXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmdW5kZWRUcmFuc2FjdGlvbnNSZXNwb25zZTogTW9vbmJlYW1UcmFuc2FjdGlvbnNCeVN0YXR1c1Jlc3BvbnNlID0gYXdhaXQgdGhpcy5nZXRUcmFuc2FjdGlvbkJ5U3RhdHVzKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogZWxpZ2libGVVc2VyLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1czogVHJhbnNhY3Rpb25zU3RhdHVzLkZ1bmRlZFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGUgY2FsbCB3YXMgc3VjY2Vzc2Z1bCBhbmQgaWYgd2UgaGF2ZSBhbnkgRlVOREVEIHRyYW5zYWN0aW9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZ1bmRlZFRyYW5zYWN0aW9uc1Jlc3BvbnNlICYmICFmdW5kZWRUcmFuc2FjdGlvbnNSZXNwb25zZS5lcnJvck1lc3NhZ2UgJiYgIWZ1bmRlZFRyYW5zYWN0aW9uc1Jlc3BvbnNlLmVycm9yVHlwZSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmRlZFRyYW5zYWN0aW9uc1Jlc3BvbnNlLmRhdGEgIT09IHVuZGVmaW5lZCAmJiBmdW5kZWRUcmFuc2FjdGlvbnNSZXNwb25zZS5kYXRhICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxpZ2libGVGb3JSZWltYnVyc2VtZW50Tm90aWZpY2F0aW9uID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYEZVTkRFRCB0cmFuc2FjdGlvbnMgY2FsbCBmb3IgdXNlciAke2VsaWdpYmxlVXNlci5pZH0gY2FsbCBmYWlsZWRgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGlnaWJsZUZvclJlaW1idXJzZW1lbnROb3RpZmljYXRpb24gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBhdCB0aGlzIHBvaW50IGlmIHRoZSBmbGFnIGFib3ZlIGlzIHRydWUsIHRoZW4gd2Uga25vdyB3ZSBtdXN0IGhhdmUgYSB2YWxpZCBsaXN0IG9mIDAgb3IgbW9yZSBQUk9DRVNTRUQgYW5kL29yIEZVTkRFRCB0cmFuc2FjdGlvbnMuXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBMb29wIHRocm91Z2ggYWxsIHRoZXNlIHRyYW5zYWN0aW9ucyBhbmQgc2VlIGlmIHRoZWlyIHRvdGFsIHBlbmRpbmdDYXNoYmFja0Ftb3VudCBpcyAkMjAgb3IgbW9yZS4gSWYgc28gYWRkIHRoZW0gaW4gdGhlIGxpc3QsIG90aGVyd2lzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICogZG8gbm90LlxuICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZWxpZ2libGVGb3JSZWltYnVyc2VtZW50Tm90aWZpY2F0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBlbmRpbmdDYXNoYmFja0Ftb3VudCA9IDAuMDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbG9vcCB0aHJvdWdoIFBST0NFU1NFRCB0cmFuc2FjdGlvbnMgYW5kIGFkZCB1cFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2Nlc3NlZFRyYW5zYWN0aW9uc1Jlc3BvbnNlLmRhdGEhLmZvckVhY2gocHJvY2Vzc2VkVHJhbnNhY3Rpb24gPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocHJvY2Vzc2VkVHJhbnNhY3Rpb24gIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBlbmRpbmdDYXNoYmFja0Ftb3VudCArPSBwcm9jZXNzZWRUcmFuc2FjdGlvbi5wZW5kaW5nQ2FzaGJhY2tBbW91bnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGxvb3AgdGhyb3VnaCBGVU5ERUQgdHJhbnNhY3Rpb25zIGFuZCBhZGQgdXBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdW5kZWRUcmFuc2FjdGlvbnNSZXNwb25zZS5kYXRhIS5mb3JFYWNoKGZ1bmRlZFRyYW5zYWN0aW9uID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZ1bmRlZFRyYW5zYWN0aW9uICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwZW5kaW5nQ2FzaGJhY2tBbW91bnQgKz0gZnVuZGVkVHJhbnNhY3Rpb24ucGVuZGluZ0Nhc2hiYWNrQW1vdW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBlbmRpbmdDYXNoYmFja0Ftb3VudCA+PSAyMC4wMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2Vyc1RvTm90aWZ5LnB1c2goZWxpZ2libGVVc2VyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gcmV0dXJuIGFsbCBlbGlnaWJsZSB1c2VycyBmb3IgcmVpbWJ1cnNlbWVudHMsIG5lZWRpbmcgdG8gZ2V0IG5vdGlmaWVkLlxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHVzZXJzVG9Ob3RpZnlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBFcnJvciB3aGlsZSByZXRyaWV2aW5nIGFsbCB1c2VycyFgO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX1gKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uUmVtaW5kZXJFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yLFxuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgcmV0cmlldmluZyBhbGwgdXNlcnMgZWxpZ2libGUgZm9yIHJlaW1idXJzZW1lbnRzLCB0aHJvdWdoICR7ZW5kcG9pbnRJbmZvfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9ICR7ZXJyfWApO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25SZW1pbmRlckVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3IsXG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB1c2VkIHRvIGdldCBhbGwgdGhlIHVzZXJzIHVzZWQgdG8gZGVsaXZlciBub3RpZmljYXRpb24gcmVtaW5kZXJzIHRvLlxuICAgICAqXG4gICAgICogQHJldHVybnMgYSB7QGxpbmsgVXNlckZvck5vdGlmaWNhdGlvblJlbWluZGVyUmVzcG9uc2V9LCByZXByZXNlbnRpbmcgZWFjaCBpbmRpdmlkdWFsIHVzZXJzJ1xuICAgICAqIHVzZXIgSUQsIGZpcnN0LCBsYXN0IG5hbWUgYW5kIGVtYWlsLlxuICAgICAqL1xuICAgIGFzeW5jIGdldEFsbFVzZXJzRm9yTm90aWZpY2F0aW9uUmVtaW5kZXJzKCk6IFByb21pc2U8VXNlckZvck5vdGlmaWNhdGlvblJlbWluZGVyUmVzcG9uc2U+IHtcbiAgICAgICAgLy8gZWFzaWx5IGlkZW50aWZpYWJsZSBBUEkgZW5kcG9pbnQgaW5mb3JtYXRpb25cbiAgICAgICAgY29uc3QgZW5kcG9pbnRJbmZvID0gJy9saXN0VXNlcnMgZm9yIGdldEFsbFVzZXJzRm9yTm90aWZpY2F0aW9uUmVtaW5kZXIgQ29nbml0byBTREsgY2FsbCc7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBDb2duaXRvIGFjY2VzcyBrZXksIHNlY3JldCBrZXkgYW5kIHVzZXIgcG9vbCBpZCwgbmVlZGVkIGluIG9yZGVyIHRvIHJldHJpZXZlIGFsbCB1c2VycyB0aHJvdWdoIHRoZSBDb2duaXRvIElkZW50aXR5IHByb3ZpZGVyIGNsaWVudFxuICAgICAgICAgICAgY29uc3QgW2NvZ25pdG9BY2Nlc3NLZXlJZCwgY29nbml0b1NlY3JldEtleSwgY29nbml0b1VzZXJQb29sSWRdID0gYXdhaXQgc3VwZXIucmV0cmlldmVTZXJ2aWNlQ3JlZGVudGlhbHMoQ29uc3RhbnRzLkFXU1BhaXJDb25zdGFudHMuTU9PTkJFQU1fSU5URVJOQUxfU0VDUkVUX05BTUUsXG4gICAgICAgICAgICAgICAgdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgdHJ1ZSk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB3ZSBvYnRhaW5lZCBhbnkgaW52YWxpZCBzZWNyZXQgdmFsdWVzIGZyb20gdGhlIGNhbGwgYWJvdmVcbiAgICAgICAgICAgIGlmIChjb2duaXRvQWNjZXNzS2V5SWQgPT09IG51bGwgfHwgY29nbml0b0FjY2Vzc0tleUlkLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIGNvZ25pdG9TZWNyZXRLZXkgPT09IG51bGwgfHwgY29nbml0b1NlY3JldEtleS5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBjb2duaXRvVXNlclBvb2xJZCA9PT0gbnVsbCB8fCAoY29nbml0b1VzZXJQb29sSWQgJiYgY29nbml0b1VzZXJQb29sSWQubGVuZ3RoID09PSAwKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IFwiSW52YWxpZCBTZWNyZXRzIG9idGFpbmVkIGZvciBDb2duaXRvIFNESyBjYWxsIGNhbGwhXCI7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvblJlbWluZGVyRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGluaXRpYWxpemUgdGhlIENvZ25pdG8gSWRlbnRpdHkgUHJvdmlkZXIgY2xpZW50IHVzaW5nIHRoZSBjcmVkZW50aWFscyBvYnRhaW5lZCBhYm92ZVxuICAgICAgICAgICAgY29uc3QgY29nbml0b0lkZW50aXR5UHJvdmlkZXJDbGllbnQgPSBuZXcgQ29nbml0b0lkZW50aXR5UHJvdmlkZXJDbGllbnQoe1xuICAgICAgICAgICAgICAgIHJlZ2lvbjogdGhpcy5yZWdpb24sXG4gICAgICAgICAgICAgICAgY3JlZGVudGlhbHM6IHtcbiAgICAgICAgICAgICAgICAgICAgYWNjZXNzS2V5SWQ6IGNvZ25pdG9BY2Nlc3NLZXlJZCxcbiAgICAgICAgICAgICAgICAgICAgc2VjcmV0QWNjZXNzS2V5OiBjb2duaXRvU2VjcmV0S2V5XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogZXhlY3V0ZSB0aGV3IExpc3QgVXNlcnMgY29tbWFuZCwgd2l0aG91dCBhbnkgZmlsdGVycywgaW4gb3JkZXIgdG8gcmV0cmlldmUgYSB1c2VyJ3MgZW1haWwgYW5kIHRoZWlyXG4gICAgICAgICAgICAgKiBjdXN0b20gdXNlciBJRCwgZnJvbSB0aGVpciBhdHRyaWJ1dGVzLlxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIFRoZXNlIHJlc3VsdHMgYXJlIGdvaW5nIHRvIGJlIHBhZ2luYXRlZCwgc28gd2Ugd2lsbCBsaW1pdCB0aGUgcGFnZSBzaXplIHRvIDYwIHVzZXJzIChtYXhpbXVtIGFsbG93ZWQgdGhyb3VnaCB0aGlzXG4gICAgICAgICAgICAgKiBjYWxsKSwgYW5kIGtlZXAgdHJhY2sgb2YgdGhlIG51bWJlciBvZiBwYWdlcyBhbmQgbGFjayB0aGVyZW9mLCB0aHJvdWdoIGEgZmxhZy5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgY29uc3QgdXNlclJlc3VsdHM6IFVzZXJUeXBlW10gPSBbXTtcbiAgICAgICAgICAgIGxldCBsYXN0UGFnaW5hdGlvblRva2VuOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgICAgICAgICBsZXQgaW5wdXQ6IExpc3RVc2Vyc0NvbW1hbmRJbnB1dCA9IHtcbiAgICAgICAgICAgICAgICBVc2VyUG9vbElkOiBjb2duaXRvVXNlclBvb2xJZCxcbiAgICAgICAgICAgICAgICBBdHRyaWJ1dGVzVG9HZXQ6IFsnZ2l2ZW5fbmFtZScsICdmYW1pbHlfbmFtZScsICdlbWFpbCcsICdjdXN0b206dXNlcklkJ10sXG4gICAgICAgICAgICAgICAgTGltaXQ6IDYwLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIC8vIGtlZXAgZ2V0dGluZyB1c2VycyBhbmQgdXBkYXRpbmcgdGhlIHJlc3VsdHMgYXJyYXkgZm9yIHVzZXJzIHJldHJpZXZlZCwgdW50aWwgd2UgcnVuIG91dCBvZiB1c2VycyB0byByZXRyaWV2ZVxuICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgIC8vIGV4ZWN1dGUgdGhlIExpc3QgVXNlcnMgY29tbWFuZCwgZ2l2ZW4gdGhlIGlucHV0IHByb3ZpZGVkIGFib3ZlXG4gICAgICAgICAgICAgICAgY29uc3QgbGlzdFVzZXJzUmVzcG9uc2U6IExpc3RVc2Vyc0NvbW1hbmRPdXRwdXQgPSBhd2FpdCBjb2duaXRvSWRlbnRpdHlQcm92aWRlckNsaWVudC5zZW5kKFxuICAgICAgICAgICAgICAgICAgICBuZXcgTGlzdFVzZXJzQ29tbWFuZChpbnB1dClcbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogY2hlY2sgd2hldGhlciB0aGUgTGlzdCBVc2VycyBDb21tYW5kIGhhcyBhIHZhbGlkIHJlc3BvbnNlLyB2YWxpZCBsaXN0IG9mIHVzZXJzIHRvIGJlIHJldHVybmVkLFxuICAgICAgICAgICAgICAgICAqIGFuZCBpZiBzbyBhZGQgaW4gdGhlIHJlc3VsdGluZyBsaXN0IGFjY29yZGluZ2x5LlxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGxpc3RVc2Vyc1Jlc3BvbnNlLiRtZXRhZGF0YSAhPT0gbnVsbCAmJiBsaXN0VXNlcnNSZXNwb25zZS4kbWV0YWRhdGEuaHR0cFN0YXR1c0NvZGUgIT09IG51bGwgJiZcbiAgICAgICAgICAgICAgICBsaXN0VXNlcnNSZXNwb25zZS4kbWV0YWRhdGEuaHR0cFN0YXR1c0NvZGUgIT09IHVuZGVmaW5lZCAmJiBsaXN0VXNlcnNSZXNwb25zZS4kbWV0YWRhdGEuaHR0cFN0YXR1c0NvZGUgPT09IDIwMCAmJlxuICAgICAgICAgICAgICAgIGxpc3RVc2Vyc1Jlc3BvbnNlLlVzZXJzICE9PSBudWxsICYmIGxpc3RVc2Vyc1Jlc3BvbnNlLlVzZXJzICE9PSB1bmRlZmluZWQgJiYgbGlzdFVzZXJzUmVzcG9uc2UuVXNlcnMhLmxlbmd0aCAhPT0gMCAmJlxuICAgICAgICAgICAgICAgIHVzZXJSZXN1bHRzLnB1c2goLi4ubGlzdFVzZXJzUmVzcG9uc2UuVXNlcnMpO1xuXG4gICAgICAgICAgICAgICAgLy8gZ2V0IHRoZSBsYXN0IHBhZ2luYXRpb24gdG9rZW4gZnJvbSB0aGUgcmV0cmlldmVkIG91dHB1dCwgYW5kIHNldCB0aGUgbmV4dCBpbnB1dCBjb21tYW5kJ3MgcGFnaW5hdGlvbiB0b2tlbiBhY2NvcmRpbmcgdG8gdGhhdFxuICAgICAgICAgICAgICAgIGxhc3RQYWdpbmF0aW9uVG9rZW4gPSBsaXN0VXNlcnNSZXNwb25zZS5QYWdpbmF0aW9uVG9rZW47XG4gICAgICAgICAgICAgICAgaW5wdXQuUGFnaW5hdGlvblRva2VuID0gbGFzdFBhZ2luYXRpb25Ub2tlbjtcbiAgICAgICAgICAgIH0gd2hpbGUgKHR5cGVvZiBsYXN0UGFnaW5hdGlvblRva2VuICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIGxhc3RQYWdpbmF0aW9uVG9rZW4gIT09ICd1bmRlZmluZWQnICYmIGxhc3RQYWdpbmF0aW9uVG9rZW4gIT09IHVuZGVmaW5lZCk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIGZvciBhIHZhbGlkIHJlc3BvbnNlIGxpc3QsIG9idGFpbmVkIGZyb20gdGhlIENvZ25pdG8gTGlzdCBVc2VycyBDb21tYW5kIGNhbGxcbiAgICAgICAgICAgIGlmICh1c2VyUmVzdWx0cy5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgICAgICAvLyBsb29wIHRocm91Z2ggdGhlIGxpc3Qgb2YgdXNlcnMgb2J0YWluZWQgdGhyb3VnaCBjb21tYW5kLCBhbmQgcmV0dXJuIHRoZWlyIGVtYWlscyBhbmQgY3VzdG9tIHVzZXIgSURzXG4gICAgICAgICAgICAgICAgY29uc3QgdXNlckRldGFpbHNGb3JOb3RpZmljYXRpb25SZW1pbmRlcjogUmV0cmlldmVVc2VyRGV0YWlsc0Zvck5vdGlmaWNhdGlvbnNbXSA9IFtdO1xuICAgICAgICAgICAgICAgIHVzZXJSZXN1bHRzLmZvckVhY2goY29nbml0b1VzZXIgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY29nbml0b1VzZXIuQXR0cmlidXRlcyAhPT0gdW5kZWZpbmVkICYmIGNvZ25pdG9Vc2VyLkF0dHJpYnV0ZXMhLmxlbmd0aCA9PT0gNCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgY29nbml0b1VzZXIuQXR0cmlidXRlcyFbMF0gIT09IHVuZGVmaW5lZCAmJiBjb2duaXRvVXNlci5BdHRyaWJ1dGVzIVswXS5WYWx1ZSEubGVuZ3RoICE9PSAwICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2duaXRvVXNlci5BdHRyaWJ1dGVzIVsxXSAhPT0gdW5kZWZpbmVkICYmIGNvZ25pdG9Vc2VyLkF0dHJpYnV0ZXMhWzFdLlZhbHVlIS5sZW5ndGggIT09IDAgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZ25pdG9Vc2VyLkF0dHJpYnV0ZXMhWzJdICE9PSB1bmRlZmluZWQgJiYgY29nbml0b1VzZXIuQXR0cmlidXRlcyFbMl0uVmFsdWUhLmxlbmd0aCAhPT0gMCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgY29nbml0b1VzZXIuQXR0cmlidXRlcyFbM10gIT09IHVuZGVmaW5lZCAmJiBjb2duaXRvVXNlci5BdHRyaWJ1dGVzIVszXS5WYWx1ZSEubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBwdXNoIHRoZSBuZXcgdXNlciBkZXRhaWxzIGluIHRoZSB1c2VyIGRldGFpbHMgYXJyYXkgdG8gYmUgcmV0dXJuZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJEZXRhaWxzRm9yTm90aWZpY2F0aW9uUmVtaW5kZXIucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNvZ25pdG9Vc2VyLkF0dHJpYnV0ZXMhWzNdLlZhbHVlISxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbWFpbDogY29nbml0b1VzZXIuQXR0cmlidXRlcyFbMl0uVmFsdWUhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0TmFtZTogY29nbml0b1VzZXIuQXR0cmlidXRlcyFbMF0uVmFsdWUhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3ROYW1lOiBjb2duaXRvVXNlci5BdHRyaWJ1dGVzIVsxXS5WYWx1ZSEsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIC8vIGVuc3VyZSB0aGF0IHRoZSBzaXplIG9mIHRoZSBsaXN0IG9mIHVzZXIgZGV0YWlscyB0byBiZSByZXR1cm5lZCwgbWF0Y2hlcyB0aGUgbnVtYmVyIG9mIHVzZXJzIHJldHJpZXZlZCB0aHJvdWdoIHRoZSBMaXN0IFVzZXJzIENvbW1hbmRcbiAgICAgICAgICAgICAgICBpZiAodXNlckRldGFpbHNGb3JOb3RpZmljYXRpb25SZW1pbmRlci5sZW5ndGggPT09IHVzZXJSZXN1bHRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIHJlc3VsdHMgYXBwcm9wcmlhdGVseVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogdXNlckRldGFpbHNGb3JOb3RpZmljYXRpb25SZW1pbmRlclxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVzZXIgZGV0YWlsIGxpc3QgbGVuZ3RoIGRvZXMgbm90IG1hdGNoIHRoZSByZXRyaWV2ZWQgdXNlciBsaXN0YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfWApO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25SZW1pbmRlckVycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYEludmFsaWQvRW1wdHkgdXNlciBsaXN0IGFycmF5LCBvYnRhaW5lZCB3aGlsZSBjYWxsaW5nIHRoZSBnZXQgTGlzdCBVc2VycyBDb2duaXRvIGNvbW1hbmRgO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX1gKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uUmVtaW5kZXJFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yLFxuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgcmV0cmlldmluZyBlbWFpbCBhbmQgY3VzdG9tIGlkIGZvciBub3RpZmljYXRpb24gcmVtaW5kZXJzIGZvciB1c2VycywgZnJvbSBDb2duaXRvIHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJ9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvblJlbWluZGVyRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvcixcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHVzZWQgdG8gZ2V0IGEgdXNlcidzIGVtYWlsLCBnaXZlbiBjZXJ0YWluIGZpbHRlcnMgdG8gYmUgcGFzc2VkIGluLlxuICAgICAqXG4gICAgICogQHBhcmFtIG1pbGl0YXJ5VmVyaWZpY2F0aW9uTm90aWZpY2F0aW9uVXBkYXRlIHRoZSBtaWxpdGFyeSB2ZXJpZmljYXRpb24gbm90aWZpY2F0aW9uIHVwZGF0ZVxuICAgICAqIG9iamVjdHMsIHVzZWQgdG8gZmlsdGVyIHRocm91Z2ggdGhlIENvZ25pdG8gdXNlciBwb29sLCBpbiBvcmRlciB0byBvYnRhaW4gYSB1c2VyJ3MgZW1haWwuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBhIHtAbGluayBFbWFpbEZyb21Db2duaXRvUmVzcG9uc2V9IHJlcHJlc2VudGluZyB0aGUgdXNlcidzIGVtYWlsIG9idGFpbmVkXG4gICAgICogZnJvbSBDb2duaXRvLlxuICAgICAqL1xuICAgIGFzeW5jIGdldEVtYWlsRm9yVXNlcihtaWxpdGFyeVZlcmlmaWNhdGlvbk5vdGlmaWNhdGlvblVwZGF0ZTogTWlsaXRhcnlWZXJpZmljYXRpb25Ob3RpZmljYXRpb25VcGRhdGUpOiBQcm9taXNlPEVtYWlsRnJvbUNvZ25pdG9SZXNwb25zZT4ge1xuICAgICAgICAvLyBlYXNpbHkgaWRlbnRpZmlhYmxlIEFQSSBlbmRwb2ludCBpbmZvcm1hdGlvblxuICAgICAgICBjb25zdCBlbmRwb2ludEluZm8gPSAnL2xpc3RVc2VycyBmb3IgZ2V0RW1haWxGb3JVc2VyIENvZ25pdG8gU0RLIGNhbGwnO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgQ29nbml0byBhY2Nlc3Mga2V5LCBzZWNyZXQga2V5IGFuZCB1c2VyIHBvb2wgaWQsIG5lZWRlZCBpbiBvcmRlciB0byByZXRyaWV2ZSB0aGUgdXNlciBlbWFpbCB0aHJvdWdoIHRoZSBDb2duaXRvIElkZW50aXR5IHByb3ZpZGVyIGNsaWVudFxuICAgICAgICAgICAgY29uc3QgW2NvZ25pdG9BY2Nlc3NLZXlJZCwgY29nbml0b1NlY3JldEtleSwgY29nbml0b1VzZXJQb29sSWRdID0gYXdhaXQgc3VwZXIucmV0cmlldmVTZXJ2aWNlQ3JlZGVudGlhbHMoQ29uc3RhbnRzLkFXU1BhaXJDb25zdGFudHMuTU9PTkJFQU1fSU5URVJOQUxfU0VDUkVUX05BTUUsXG4gICAgICAgICAgICAgICAgdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgdHJ1ZSk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB3ZSBvYnRhaW5lZCBhbnkgaW52YWxpZCBzZWNyZXQgdmFsdWVzIGZyb20gdGhlIGNhbGwgYWJvdmVcbiAgICAgICAgICAgIGlmIChjb2duaXRvQWNjZXNzS2V5SWQgPT09IG51bGwgfHwgY29nbml0b0FjY2Vzc0tleUlkLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIGNvZ25pdG9TZWNyZXRLZXkgPT09IG51bGwgfHwgY29nbml0b1NlY3JldEtleS5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBjb2duaXRvVXNlclBvb2xJZCA9PT0gbnVsbCB8fCAoY29nbml0b1VzZXJQb29sSWQgJiYgY29nbml0b1VzZXJQb29sSWQubGVuZ3RoID09PSAwKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IFwiSW52YWxpZCBTZWNyZXRzIG9idGFpbmVkIGZvciBDb2duaXRvIFNESyBjYWxsIGNhbGwhXCI7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gaW5pdGlhbGl6ZSB0aGUgQ29nbml0byBJZGVudGl0eSBQcm92aWRlciBjbGllbnQgdXNpbmcgdGhlIGNyZWRlbnRpYWxzIG9idGFpbmVkIGFib3ZlXG4gICAgICAgICAgICBjb25zdCBjb2duaXRvSWRlbnRpdHlQcm92aWRlckNsaWVudCA9IG5ldyBDb2duaXRvSWRlbnRpdHlQcm92aWRlckNsaWVudCh7XG4gICAgICAgICAgICAgICAgcmVnaW9uOiB0aGlzLnJlZ2lvbixcbiAgICAgICAgICAgICAgICBjcmVkZW50aWFsczoge1xuICAgICAgICAgICAgICAgICAgICBhY2Nlc3NLZXlJZDogY29nbml0b0FjY2Vzc0tleUlkLFxuICAgICAgICAgICAgICAgICAgICBzZWNyZXRBY2Nlc3NLZXk6IGNvZ25pdG9TZWNyZXRLZXlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBleGVjdXRlIHRoZSBMaXN0IFVzZXJzIGNvbW1hbmQsIHVzaW5nIGZpbHRlcnMsIGluIG9yZGVyIHRvIHJldHJpZXZlIGEgdXNlcidzIGVtYWlsIGZyb20gdGhlaXIgYXR0cmlidXRlcy5cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBSZXRyaWV2ZSB0aGUgdXNlciBieSB0aGVpciBmYW1pbHlfbmFtZS4gSWYgdGhlcmUgYXJlIGlzIG1vcmUgdGhhbiAxIG1hdGNoIHJldHVybmVkLCB0aGVuIHdlIHdpbGwgbWF0Y2hcbiAgICAgICAgICAgICAqIHRoZSB1c2VyIGJhc2VkIG9uIHRoZWlyIHVuaXF1ZSBpZCwgZnJvbSB0aGUgY3VzdG9tOnVzZXJJZCBhdHRyaWJ1dGVcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgY29uc3QgbGlzdFVzZXJzUmVzcG9uc2U6IExpc3RVc2Vyc0NvbW1hbmRPdXRwdXQgPSBhd2FpdCBjb2duaXRvSWRlbnRpdHlQcm92aWRlckNsaWVudC5zZW5kKG5ldyBMaXN0VXNlcnNDb21tYW5kKHtcbiAgICAgICAgICAgICAgICBVc2VyUG9vbElkOiBjb2duaXRvVXNlclBvb2xJZCxcbiAgICAgICAgICAgICAgICBBdHRyaWJ1dGVzVG9HZXQ6IFsnZW1haWwnLCAnY3VzdG9tOnVzZXJJZCddLFxuICAgICAgICAgICAgICAgIEZpbHRlcjogYGZhbWlseV9uYW1lPSBcIiR7YCR7bWlsaXRhcnlWZXJpZmljYXRpb25Ob3RpZmljYXRpb25VcGRhdGUubGFzdE5hbWV9YC5yZXBsYWNlQWxsKFwiXFxcIlwiLCBcIlxcXFxcXFwiXCIpfVwiYFxuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgLy8gY2hlY2sgZm9yIGEgdmFsaWQgcmVzcG9uc2UgZnJvbSB0aGUgQ29nbml0byBMaXN0IFVzZXJzIENvbW1hbmQgY2FsbFxuICAgICAgICAgICAgaWYgKGxpc3RVc2Vyc1Jlc3BvbnNlICE9PSBudWxsICYmIGxpc3RVc2Vyc1Jlc3BvbnNlLiRtZXRhZGF0YSAhPT0gbnVsbCAmJiBsaXN0VXNlcnNSZXNwb25zZS4kbWV0YWRhdGEuaHR0cFN0YXR1c0NvZGUgIT09IG51bGwgJiZcbiAgICAgICAgICAgICAgICBsaXN0VXNlcnNSZXNwb25zZS4kbWV0YWRhdGEuaHR0cFN0YXR1c0NvZGUgIT09IHVuZGVmaW5lZCAmJiBsaXN0VXNlcnNSZXNwb25zZS4kbWV0YWRhdGEuaHR0cFN0YXR1c0NvZGUgPT09IDIwMCAmJlxuICAgICAgICAgICAgICAgIGxpc3RVc2Vyc1Jlc3BvbnNlLlVzZXJzICE9PSBudWxsICYmIGxpc3RVc2Vyc1Jlc3BvbnNlLlVzZXJzICE9PSB1bmRlZmluZWQgJiYgbGlzdFVzZXJzUmVzcG9uc2UuVXNlcnMhLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgICAgIC8vIElmIHRoZXJlIGFyZSBpcyBtb3JlIHRoYW4gMSBtYXRjaCByZXR1cm5lZCwgdGhlbiB3ZSB3aWxsIG1hdGNoIHRoZSB1c2VyIGJhc2VkIG9uIHRoZWlyIHVuaXF1ZSBpZCwgZnJvbSB0aGUgY3VzdG9tOnVzZXJJZCBhdHRyaWJ1dGVcbiAgICAgICAgICAgICAgICBsZXQgaW52YWxpZEF0dHJpYnV0ZXNGbGFnID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgbGlzdFVzZXJzUmVzcG9uc2UuVXNlcnMuZm9yRWFjaChjb2duaXRvVXNlciA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb2duaXRvVXNlci5BdHRyaWJ1dGVzID09PSBudWxsIHx8IGNvZ25pdG9Vc2VyLkF0dHJpYnV0ZXMgPT09IHVuZGVmaW5lZCB8fCBjb2duaXRvVXNlci5BdHRyaWJ1dGVzLmxlbmd0aCAhPT0gMikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW52YWxpZEF0dHJpYnV0ZXNGbGFnID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIC8vIGNoZWNrIGZvciB2YWxpZCB1c2VyIGF0dHJpYnV0ZXNcbiAgICAgICAgICAgICAgICBpZiAoIWludmFsaWRBdHRyaWJ1dGVzRmxhZykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbWF0Y2hlZEVtYWlsOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5vT2ZNYXRjaGVzID0gMDtcbiAgICAgICAgICAgICAgICAgICAgbGlzdFVzZXJzUmVzcG9uc2UuVXNlcnMuZm9yRWFjaChjb2duaXRvVXNlciA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29nbml0b1VzZXIuQXR0cmlidXRlcyFbMV0uVmFsdWUhLnRyaW0oKSA9PT0gbWlsaXRhcnlWZXJpZmljYXRpb25Ob3RpZmljYXRpb25VcGRhdGUuaWQudHJpbSgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2hlZEVtYWlsID0gY29nbml0b1VzZXIuQXR0cmlidXRlcyFbMF0uVmFsdWUhO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vT2ZNYXRjaGVzICs9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBpZiAobm9PZk1hdGNoZXMgPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogbWF0Y2hlZEVtYWlsXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgQ291bGRuJ3QgZmluZCB1c2VyIGluIENvZ25pdG8gZm9yICR7bWlsaXRhcnlWZXJpZmljYXRpb25Ob3RpZmljYXRpb25VcGRhdGUuaWR9YDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX1gKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgSW52YWxpZCB1c2VyIGF0dHJpYnV0ZXMgb2J0YWluZWRgO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9YCk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBJbnZhbGlkIHN0cnVjdHVyZSBvYnRhaW5lZCB3aGlsZSBjYWxsaW5nIHRoZSBnZXQgTGlzdCBVc2VycyBDb2duaXRvIGNvbW1hbmRgO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX1gKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3IsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSByZXRyaWV2aW5nIGVtYWlsIGZvciB1c2VyIGZyb20gQ29nbml0byB0aHJvdWdoICR7ZW5kcG9pbnRJbmZvfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9ICR7ZXJyfWApO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvcixcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdXNlZCB0byBzZW5kIGEgbmV3IG1pbGl0YXJ5IHZlcmlmaWNhdGlvbiBzdGF0dXMgYWNrbm93bGVkZ21lbnQsIHNvIHdlIGNhbiBraWNrLXN0YXJ0IHRoZSBtaWxpdGFyeSB2ZXJpZmljYXRpb25cbiAgICAgKiBzdGF0dXMgdXBkYXRlIG5vdGlmaWNhdGlvbiBwcm9jZXNzIHRocm91Z2ggdGhlIHByb2R1Y2VyLlxuICAgICAqXG4gICAgICogQHBhcmFtIG1pbGl0YXJ5VmVyaWZpY2F0aW9uTm90aWZpY2F0aW9uVXBkYXRlIG1pbGl0YXJ5IHZlcmlmaWNhdGlvbiB1cGRhdGUgb2JqZWN0XG4gICAgICpcbiAgICAgKiBAcmV0dXJuIGEge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBBUElHYXRld2F5UHJveHlSZXN1bHR9IHJlcHJlc2VudGluZyB0aGUgQVBJIEdhdGV3YXkgcmVzdWx0XG4gICAgICogc2VudCBieSB0aGUgbWlsaXRhcnkgdmVyaWZpY2F0aW9uIHVwZGF0ZSBwcm9kdWNlciBMYW1iZGEsIHRvIHZhbGlkYXRlIHdoZXRoZXIgdGhlIG1pbGl0YXJ5IHZlcmlmaWNhdGlvblxuICAgICAqIG5vdGlmaWNhdGlvbiB1cGRhdGUgcHJvY2VzcyBraWNrLXN0YXJ0ZWQgb3Igbm90XG4gICAgICovXG4gICAgYXN5bmMgbWlsaXRhcnlWZXJpZmljYXRpb25VcGRhdGVzQWNrbm93bGVkZ21lbnQobWlsaXRhcnlWZXJpZmljYXRpb25Ob3RpZmljYXRpb25VcGRhdGU6IE1pbGl0YXJ5VmVyaWZpY2F0aW9uTm90aWZpY2F0aW9uVXBkYXRlKTogUHJvbWlzZTxBUElHYXRld2F5UHJveHlSZXN1bHQ+IHtcbiAgICAgICAgLy8gZWFzaWx5IGlkZW50aWZpYWJsZSBBUEkgZW5kcG9pbnQgaW5mb3JtYXRpb25cbiAgICAgICAgY29uc3QgZW5kcG9pbnRJbmZvID0gJ1BPU1QgL21pbGl0YXJ5VmVyaWZpY2F0aW9uVXBkYXRlc0Fja25vd2xlZGdtZW50IE1vb25iZWFtIFJFU1QgQVBJJztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIEFQSSBLZXkgYW5kIEJhc2UgVVJMLCBuZWVkZWQgaW4gb3JkZXIgdG8gbWFrZSB0aGUgbWlsaXRhcnkgc3RhdHVzIHVwZGF0ZXMgYWNrbm93bGVkZ21lbnQgY2FsbCB0aHJvdWdoIHRoZSBjbGllbnRcbiAgICAgICAgICAgIGNvbnN0IFttb29uYmVhbUJhc2VVUkwsIG1vb25iZWFtUHJpdmF0ZUtleV0gPSBhd2FpdCBzdXBlci5yZXRyaWV2ZVNlcnZpY2VDcmVkZW50aWFscyhDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5NT09OQkVBTV9JTlRFUk5BTF9TRUNSRVRfTkFNRSwgdHJ1ZSk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB3ZSBvYnRhaW5lZCBhbnkgaW52YWxpZCBzZWNyZXQgdmFsdWVzIGZyb20gdGhlIGNhbGwgYWJvdmVcbiAgICAgICAgICAgIGlmIChtb29uYmVhbUJhc2VVUkwgPT09IG51bGwgfHwgbW9vbmJlYW1CYXNlVVJMLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG1vb25iZWFtUHJpdmF0ZUtleSA9PT0gbnVsbCB8fCBtb29uYmVhbVByaXZhdGVLZXkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gXCJJbnZhbGlkIFNlY3JldHMgb2J0YWluZWQgZm9yIE1vb25iZWFtIFJFU1QgQVBJIGNhbGwhXCI7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1c0NvZGU6IDUwMCxcbiAgICAgICAgICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTWlsaXRhcnlWZXJpZmljYXRpb25FcnJvclR5cGUuVW5leHBlY3RlZEVycm9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFBPU1QgL21pbGl0YXJ5VmVyaWZpY2F0aW9uVXBkYXRlc0Fja25vd2xlZGdtZW50XG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogYnVpbGQgdGhlIGludGVybmFsIE1vb25iZWFtIEFQSSByZXF1ZXN0IGJvZHkgdG8gYmUgcGFzc2VkIGluLCBhbmQgcGVyZm9ybSBhIFBPU1QgdG8gaXQgd2l0aCB0aGUgYXBwcm9wcmlhdGUgaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAqIHdlIGltcGx5IHRoYXQgaWYgdGhlIEFQSSBkb2VzIG5vdCByZXNwb25kIGluIDE1IHNlY29uZHMsIHRoZW4gd2UgYXV0b21hdGljYWxseSBjYXRjaCB0aGF0LCBhbmQgcmV0dXJuIGFuXG4gICAgICAgICAgICAgKiBlcnJvciBmb3IgYSBiZXR0ZXIgY3VzdG9tZXIgZXhwZXJpZW5jZS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgY29uc29sZS5sb2coYE1vb25iZWFtIFJFU1QgQVBJIHJlcXVlc3QgT2JqZWN0OiAke0pTT04uc3RyaW5naWZ5KG1pbGl0YXJ5VmVyaWZpY2F0aW9uTm90aWZpY2F0aW9uVXBkYXRlKX1gKTtcbiAgICAgICAgICAgIHJldHVybiBheGlvcy5wb3N0KGAke21vb25iZWFtQmFzZVVSTH0vbWlsaXRhcnlWZXJpZmljYXRpb25VcGRhdGVzQWNrbm93bGVkZ21lbnRgLCBKU09OLnN0cmluZ2lmeShtaWxpdGFyeVZlcmlmaWNhdGlvbk5vdGlmaWNhdGlvblVwZGF0ZSksIHtcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgICAgICBcIngtYXBpLWtleVwiOiBtb29uYmVhbVByaXZhdGVLZXlcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDE1MDAwLCAvLyBpbiBtaWxsaXNlY29uZHMgaGVyZVxuICAgICAgICAgICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2U6ICdNb29uYmVhbSBSRVNUIEFQSSB0aW1lZCBvdXQgYWZ0ZXIgMTUwMDBtcyEnXG4gICAgICAgICAgICB9KS50aGVuKG1pbGl0YXJ5U3RhdHVzVXBkYXRlUmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShtaWxpdGFyeVN0YXR1c1VwZGF0ZVJlc3BvbnNlLmRhdGEpfWApO1xuXG4gICAgICAgICAgICAgICAgLy8gY2hlY2sgaWYgdGhlcmUgYXJlIGFueSBlcnJvcnMgaW4gdGhlIHJldHVybmVkIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgaWYgKG1pbGl0YXJ5U3RhdHVzVXBkYXRlUmVzcG9uc2UuZGF0YSAmJiBtaWxpdGFyeVN0YXR1c1VwZGF0ZVJlc3BvbnNlLmRhdGEuZGF0YSAhPT0gbnVsbFxuICAgICAgICAgICAgICAgICAgICAmJiAhbWlsaXRhcnlTdGF0dXNVcGRhdGVSZXNwb25zZS5kYXRhLmVycm9yTWVzc2FnZSAmJiAhbWlsaXRhcnlTdGF0dXNVcGRhdGVSZXNwb25zZS5kYXRhLmVycm9yVHlwZVxuICAgICAgICAgICAgICAgICAgICAmJiBtaWxpdGFyeVN0YXR1c1VwZGF0ZVJlc3BvbnNlLnN0YXR1cyA9PT0gMjAyKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHJldHVybmVkIHRoZSBtaWxpdGFyeSB2ZXJpZmljYXRpb24gdXBkYXRlIGFja25vd2xlZGdtZW50IHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXNDb2RlOiBtaWxpdGFyeVN0YXR1c1VwZGF0ZVJlc3BvbnNlLnN0YXR1cyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvZHk6IG1pbGl0YXJ5U3RhdHVzVXBkYXRlUmVzcG9uc2UuZGF0YS5kYXRhXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWlsaXRhcnlTdGF0dXNVcGRhdGVSZXNwb25zZS5kYXRhICYmIG1pbGl0YXJ5U3RhdHVzVXBkYXRlUmVzcG9uc2UuZGF0YS5lcnJvck1lc3NhZ2UgIT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICAmJiBtaWxpdGFyeVN0YXR1c1VwZGF0ZVJlc3BvbnNlLmRhdGEuZXJyb3JNZXNzYWdlICE9PSBudWxsID9cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgdHlwZSwgZnJvbSB0aGUgb3JpZ2luYWwgUkVTVCBBUEkgY2FsbFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1c0NvZGU6IG1pbGl0YXJ5U3RhdHVzVXBkYXRlUmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvZHk6IG1pbGl0YXJ5U3RhdHVzVXBkYXRlUmVzcG9uc2UuZGF0YS5lcnJvck1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gOlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBlcnJvciByZXNwb25zZSBpbmRpY2F0aW5nIGFuIGludmFsaWQgc3RydWN0dXJlIHJldHVybmVkXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzQ29kZTogNTAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgSW52YWxpZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UhYCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBNaWxpdGFyeVZlcmlmaWNhdGlvbkVycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IucmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGFuZCB0aGUgc2VydmVyIHJlc3BvbmRlZCB3aXRoIGEgc3RhdHVzIGNvZGVcbiAgICAgICAgICAgICAgICAgICAgICogdGhhdCBmYWxscyBvdXQgb2YgdGhlIHJhbmdlIG9mIDJ4eC5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBOb24gMnh4eCByZXNwb25zZSB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gTW9vbmJlYW0gUkVTVCBBUEksIHdpdGggc3RhdHVzICR7ZXJyb3IucmVzcG9uc2Uuc3RhdHVzfSwgYW5kIHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZXJyb3IucmVzcG9uc2UuZGF0YSl9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBhbnkgb3RoZXIgc3BlY2lmaWMgZXJyb3JzIHRvIGJlIGZpbHRlcmVkIGJlbG93XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXNDb2RlOiBlcnJvci5yZXNwb25zZS5zdGF0dXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IGVycm9yLnJlc3BvbnNlLmRhdGEuZXJyb3JUeXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3IucmVzcG9uc2UuZGF0YS5lcnJvck1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5yZXF1ZXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBidXQgbm8gcmVzcG9uc2Ugd2FzIHJlY2VpdmVkXG4gICAgICAgICAgICAgICAgICAgICAqIGBlcnJvci5yZXF1ZXN0YCBpcyBhbiBpbnN0YW5jZSBvZiBYTUxIdHRwUmVxdWVzdCBpbiB0aGUgYnJvd3NlciBhbmQgYW4gaW5zdGFuY2Ugb2ZcbiAgICAgICAgICAgICAgICAgICAgICogIGh0dHAuQ2xpZW50UmVxdWVzdCBpbiBub2RlLmpzLlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vIHJlc3BvbnNlIHJlY2VpdmVkIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBNb29uYmVhbSBBUEksIGZvciByZXF1ZXN0ICR7ZXJyb3IucmVxdWVzdH1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXNDb2RlOiA1MDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE1pbGl0YXJ5VmVyaWZpY2F0aW9uRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBTb21ldGhpbmcgaGFwcGVuZWQgaW4gc2V0dGluZyB1cCB0aGUgcmVxdWVzdCB0aGF0IHRyaWdnZXJlZCBhbiBFcnJvclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IGZvciB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgJHsoZXJyb3IgJiYgZXJyb3IubWVzc2FnZSkgJiYgZXJyb3IubWVzc2FnZX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXNDb2RlOiA1MDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE1pbGl0YXJ5VmVyaWZpY2F0aW9uRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBwb3N0aW5nIHRoZSBtaWxpdGFyeSB2ZXJpZmljYXRpb24gc3RhdHVzIGFja25vd2xlZGdtZW50IG9iamVjdCB0aHJvdWdoICR7ZW5kcG9pbnRJbmZvfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9ICR7ZXJyfWApO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHN0YXR1c0NvZGU6IDUwMCxcbiAgICAgICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTWlsaXRhcnlWZXJpZmljYXRpb25FcnJvclR5cGUuVW5leHBlY3RlZEVycm9yLFxuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdXNlZCB0byBzZW5kIGEgbmV3IHRyYW5zYWN0aW9uIGFja25vd2xlZGdtZW50LCBmb3IgYW4gdXBkYXRlZCB0cmFuc2FjdGlvbiwgc28gd2UgY2FuIGtpY2stc3RhcnQgdGhlXG4gICAgICogdHJhbnNhY3Rpb24gcHJvY2VzcyB0aHJvdWdoIHRoZSB0cmFuc2FjdGlvbiBwcm9kdWNlci5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB1cGRhdGVkVHJhbnNhY3Rpb25FdmVudCB1cGRhdGVkIHRyYW5zYWN0aW9uIGV2ZW50IHRvIGJlIHBhc3NlZCBpblxuICAgICAqXG4gICAgICogQHJldHVybiBhIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgQVBJR2F0ZXdheVByb3h5UmVzdWx0fSByZXByZXNlbnRpbmcgdGhlIEFQSSBHYXRld2F5IHJlc3VsdFxuICAgICAqIHNlbnQgYnkgdGhlIHJlaW1idXJzZW1lbnQgcHJvZHVjZXIgTGFtYmRhLCB0byB2YWxpZGF0ZSB3aGV0aGVyIHRoZSB0cmFuc2FjdGlvbnMgcHJvY2VzcyB3YXNcbiAgICAgKiBraWNrLXN0YXJ0ZWQgb3Igbm90LlxuICAgICAqL1xuICAgIGFzeW5jIHRyYW5zYWN0aW9uc0Fja25vd2xlZGdtZW50KHVwZGF0ZWRUcmFuc2FjdGlvbkV2ZW50OiBVcGRhdGVkVHJhbnNhY3Rpb25FdmVudCk6IFByb21pc2U8QVBJR2F0ZXdheVByb3h5UmVzdWx0PiB7XG4gICAgICAgIC8vIGVhc2lseSBpZGVudGlmaWFibGUgQVBJIGVuZHBvaW50IGluZm9ybWF0aW9uXG4gICAgICAgIGNvbnN0IGVuZHBvaW50SW5mbyA9ICdQT1NUIC90cmFuc2FjdGlvbnNBY2tub3dsZWRnbWVudCBNb29uYmVhbSBSRVNUIEFQSSc7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBBUEkgS2V5IGFuZCBCYXNlIFVSTCwgbmVlZGVkIGluIG9yZGVyIHRvIG1ha2UgdGhlIHRyYW5zYWN0aW9uIGFja25vd2xlZGdtZW50IGNhbGwgdGhyb3VnaCB0aGUgY2xpZW50XG4gICAgICAgICAgICBjb25zdCBbbW9vbmJlYW1CYXNlVVJMLCBtb29uYmVhbVByaXZhdGVLZXldID0gYXdhaXQgc3VwZXIucmV0cmlldmVTZXJ2aWNlQ3JlZGVudGlhbHMoQ29uc3RhbnRzLkFXU1BhaXJDb25zdGFudHMuTU9PTkJFQU1fSU5URVJOQUxfU0VDUkVUX05BTUUsIHRydWUpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgd2Ugb2J0YWluZWQgYW55IGludmFsaWQgc2VjcmV0IHZhbHVlcyBmcm9tIHRoZSBjYWxsIGFib3ZlXG4gICAgICAgICAgICBpZiAobW9vbmJlYW1CYXNlVVJMID09PSBudWxsIHx8IG1vb25iZWFtQmFzZVVSTC5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBtb29uYmVhbVByaXZhdGVLZXkgPT09IG51bGwgfHwgbW9vbmJlYW1Qcml2YXRlS2V5Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IFwiSW52YWxpZCBTZWNyZXRzIG9idGFpbmVkIGZvciBNb29uYmVhbSBSRVNUIEFQSSBjYWxsIVwiO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXNDb2RlOiA1MDAsXG4gICAgICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogUE9TVCAvdHJhbnNhY3Rpb25zQWNrbm93bGVkZ21lbnRcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBidWlsZCB0aGUgaW50ZXJuYWwgTW9vbmJlYW0gQVBJIHJlcXVlc3QgYm9keSB0byBiZSBwYXNzZWQgaW4sIGFuZCBwZXJmb3JtIGEgUE9TVCB0byBpdCB3aXRoIHRoZSBhcHByb3ByaWF0ZSBpbmZvcm1hdGlvblxuICAgICAgICAgICAgICogd2UgaW1wbHkgdGhhdCBpZiB0aGUgQVBJIGRvZXMgbm90IHJlc3BvbmQgaW4gMTUgc2Vjb25kcywgdGhlbiB3ZSBhdXRvbWF0aWNhbGx5IGNhdGNoIHRoYXQsIGFuZCByZXR1cm4gYW5cbiAgICAgICAgICAgICAqIGVycm9yIGZvciBhIGJldHRlciBjdXN0b21lciBleHBlcmllbmNlLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgTW9vbmJlYW0gUkVTVCBBUEkgcmVxdWVzdCBPYmplY3Q6ICR7SlNPTi5zdHJpbmdpZnkodXBkYXRlZFRyYW5zYWN0aW9uRXZlbnQpfWApO1xuICAgICAgICAgICAgcmV0dXJuIGF4aW9zLnBvc3QoYCR7bW9vbmJlYW1CYXNlVVJMfS90cmFuc2FjdGlvbnNBY2tub3dsZWRnbWVudGAsIEpTT04uc3RyaW5naWZ5KHVwZGF0ZWRUcmFuc2FjdGlvbkV2ZW50KSwge1xuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgICAgIFwieC1hcGkta2V5XCI6IG1vb25iZWFtUHJpdmF0ZUtleVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGltZW91dDogMTUwMDAsIC8vIGluIG1pbGxpc2Vjb25kcyBoZXJlXG4gICAgICAgICAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZTogJ01vb25iZWFtIFJFU1QgQVBJIHRpbWVkIG91dCBhZnRlciAxNTAwMG1zISdcbiAgICAgICAgICAgIH0pLnRoZW4odHJhbnNhY3Rpb25zQWNrbm93bGVkZ21lbnRSZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KHRyYW5zYWN0aW9uc0Fja25vd2xlZGdtZW50UmVzcG9uc2UuZGF0YSl9YCk7XG5cbiAgICAgICAgICAgICAgICAvLyBjaGVjayBpZiB0aGVyZSBhcmUgYW55IGVycm9ycyBpbiB0aGUgcmV0dXJuZWQgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICBpZiAodHJhbnNhY3Rpb25zQWNrbm93bGVkZ21lbnRSZXNwb25zZS5kYXRhICYmIHRyYW5zYWN0aW9uc0Fja25vd2xlZGdtZW50UmVzcG9uc2UuZGF0YS5kYXRhICE9PSBudWxsXG4gICAgICAgICAgICAgICAgICAgICYmICF0cmFuc2FjdGlvbnNBY2tub3dsZWRnbWVudFJlc3BvbnNlLmRhdGEuZXJyb3JNZXNzYWdlICYmICF0cmFuc2FjdGlvbnNBY2tub3dsZWRnbWVudFJlc3BvbnNlLmRhdGEuZXJyb3JUeXBlXG4gICAgICAgICAgICAgICAgICAgICYmIHRyYW5zYWN0aW9uc0Fja25vd2xlZGdtZW50UmVzcG9uc2Uuc3RhdHVzID09PSAyMDIpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuZWQgdGhlIHRyYW5zYWN0aW9uIGFja25vd2xlZGdtZW50IHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXNDb2RlOiB0cmFuc2FjdGlvbnNBY2tub3dsZWRnbWVudFJlc3BvbnNlLnN0YXR1cyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvZHk6IHRyYW5zYWN0aW9uc0Fja25vd2xlZGdtZW50UmVzcG9uc2UuZGF0YS5kYXRhXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJhbnNhY3Rpb25zQWNrbm93bGVkZ21lbnRSZXNwb25zZS5kYXRhICYmIHRyYW5zYWN0aW9uc0Fja25vd2xlZGdtZW50UmVzcG9uc2UuZGF0YS5lcnJvck1lc3NhZ2UgIT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICAmJiB0cmFuc2FjdGlvbnNBY2tub3dsZWRnbWVudFJlc3BvbnNlLmRhdGEuZXJyb3JNZXNzYWdlICE9PSBudWxsID9cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgdHlwZSwgZnJvbSB0aGUgb3JpZ2luYWwgUkVTVCBBUEkgY2FsbFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1c0NvZGU6IHRyYW5zYWN0aW9uc0Fja25vd2xlZGdtZW50UmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvZHk6IHRyYW5zYWN0aW9uc0Fja25vd2xlZGdtZW50UmVzcG9uc2UuZGF0YS5lcnJvck1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gOlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBlcnJvciByZXNwb25zZSBpbmRpY2F0aW5nIGFuIGludmFsaWQgc3RydWN0dXJlIHJldHVybmVkXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzQ29kZTogNTAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgSW52YWxpZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UhYCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yLnJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBhbmQgdGhlIHNlcnZlciByZXNwb25kZWQgd2l0aCBhIHN0YXR1cyBjb2RlXG4gICAgICAgICAgICAgICAgICAgICAqIHRoYXQgZmFsbHMgb3V0IG9mIHRoZSByYW5nZSBvZiAyeHguXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm9uIDJ4eHggcmVzcG9uc2Ugd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIFJFU1QgQVBJLCB3aXRoIHN0YXR1cyAke2Vycm9yLnJlc3BvbnNlLnN0YXR1c30sIGFuZCByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGVycm9yLnJlc3BvbnNlLmRhdGEpfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gYW55IG90aGVyIHNwZWNpZmljIGVycm9ycyB0byBiZSBmaWx0ZXJlZCBiZWxvd1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzQ29kZTogZXJyb3IucmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBlcnJvci5yZXNwb25zZS5kYXRhLmVycm9yVHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yLnJlc3BvbnNlLmRhdGEuZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3IucmVxdWVzdCkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYnV0IG5vIHJlc3BvbnNlIHdhcyByZWNlaXZlZFxuICAgICAgICAgICAgICAgICAgICAgKiBgZXJyb3IucmVxdWVzdGAgaXMgYW4gaW5zdGFuY2Ugb2YgWE1MSHR0cFJlcXVlc3QgaW4gdGhlIGJyb3dzZXIgYW5kIGFuIGluc3RhbmNlIG9mXG4gICAgICAgICAgICAgICAgICAgICAqICBodHRwLkNsaWVudFJlcXVlc3QgaW4gbm9kZS5qcy5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBObyByZXNwb25zZSByZWNlaXZlZCB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gTW9vbmJlYW0gQVBJLCBmb3IgcmVxdWVzdCAke2Vycm9yLnJlcXVlc3R9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzQ29kZTogNTAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNvbWV0aGluZyBoYXBwZW5lZCBpbiBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IHRoYXQgdHJpZ2dlcmVkIGFuIEVycm9yXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgZm9yIHRoZSAke2VuZHBvaW50SW5mb30gTW9vbmJlYW0gQVBJLCAkeyhlcnJvciAmJiBlcnJvci5tZXNzYWdlKSAmJiBlcnJvci5tZXNzYWdlfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1c0NvZGU6IDUwMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBwb3N0aW5nIHRoZSB0cmFuc2FjdGlvbnMgYWNrbm93bGVkZ21lbnQgb2JqZWN0IHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJ9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc3RhdHVzQ29kZTogNTAwLFxuICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yLFxuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdXNlZCB0byBnZXQgYWxsIEFDVElWRSBub3RpZmljYXRpb24gcmVtaW5kZXJzLlxuICAgICAqXG4gICAgICogQHJldHVybnMgYSB7QGxpbmsgTm90aWZpY2F0aW9uUmVtaW5kZXJSZXNwb25zZX0sIHJlcHJlc2VudGluZyB0aGUgQUNUSVZFIG5vdGlmaWNhdGlvblxuICAgICAqIHJlbWluZGVycy5cbiAgICAgKi9cbiAgICBhc3luYyBnZXROb3RpZmljYXRpb25SZW1pbmRlcnMoKTogUHJvbWlzZTxOb3RpZmljYXRpb25SZW1pbmRlclJlc3BvbnNlPiB7XG4gICAgICAgIC8vIGVhc2lseSBpZGVudGlmaWFibGUgQVBJIGVuZHBvaW50IGluZm9ybWF0aW9uXG4gICAgICAgIGNvbnN0IGVuZHBvaW50SW5mbyA9ICdnZXROb3RpZmljYXRpb25SZW1pbmRlcnMgUXVlcnkgTW9vbmJlYW0gR3JhcGhRTCBBUEknO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgQVBJIEtleSBhbmQgQmFzZSBVUkwsIG5lZWRlZCBpbiBvcmRlciB0byBtYWtlIHRoZSBlbGlnaWJsZSB1c2VyIHJldHJpZXZhbCBjYWxsIHRocm91Z2ggdGhlIGNsaWVudFxuICAgICAgICAgICAgY29uc3QgW21vb25iZWFtQmFzZVVSTCwgbW9vbmJlYW1Qcml2YXRlS2V5XSA9IGF3YWl0IHN1cGVyLnJldHJpZXZlU2VydmljZUNyZWRlbnRpYWxzKENvbnN0YW50cy5BV1NQYWlyQ29uc3RhbnRzLk1PT05CRUFNX0lOVEVSTkFMX1NFQ1JFVF9OQU1FKTtcblxuICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHdlIG9idGFpbmVkIGFueSBpbnZhbGlkIHNlY3JldCB2YWx1ZXMgZnJvbSB0aGUgY2FsbCBhYm92ZVxuICAgICAgICAgICAgaWYgKG1vb25iZWFtQmFzZVVSTCA9PT0gbnVsbCB8fCBtb29uYmVhbUJhc2VVUkwubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgbW9vbmJlYW1Qcml2YXRlS2V5ID09PSBudWxsIHx8IG1vb25iZWFtUHJpdmF0ZUtleS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBcIkludmFsaWQgU2VjcmV0cyBvYnRhaW5lZCBmb3IgTW9vbmJlYW0gQVBJIGNhbGwhXCI7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvblJlbWluZGVyRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogZ2V0Tm90aWZpY2F0aW9uUmVtaW5kZXIgUXVlcnlcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBidWlsZCB0aGUgTW9vbmJlYW0gQXBwU3luYyBBUEkgR3JhcGhRTCBxdWVyeSwgYW5kIHBlcmZvcm0gYSBQT1NUIHRvIGl0LFxuICAgICAgICAgICAgICogd2l0aCB0aGUgYXBwcm9wcmlhdGUgaW5mb3JtYXRpb24uXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogd2UgaW1wbHkgdGhhdCBpZiB0aGUgQVBJIGRvZXMgbm90IHJlc3BvbmQgaW4gMTUgc2Vjb25kcywgdGhlbiB3ZSBhdXRvbWF0aWNhbGx5IGNhdGNoIHRoYXQsIGFuZCByZXR1cm4gYW5cbiAgICAgICAgICAgICAqIGVycm9yIGZvciBhIGJldHRlciBjdXN0b21lciBleHBlcmllbmNlLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICByZXR1cm4gYXhpb3MucG9zdChgJHttb29uYmVhbUJhc2VVUkx9YCwge1xuICAgICAgICAgICAgICAgIHF1ZXJ5OiBnZXROb3RpZmljYXRpb25SZW1pbmRlcnNcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgICAgICBcIngtYXBpLWtleVwiOiBtb29uYmVhbVByaXZhdGVLZXlcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDE1MDAwLCAvLyBpbiBtaWxsaXNlY29uZHMgaGVyZVxuICAgICAgICAgICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2U6ICdNb29uYmVhbSBBUEkgdGltZWQgb3V0IGFmdGVyIDE1MDAwbXMhJ1xuICAgICAgICAgICAgfSkudGhlbihnZXROb3RpZmljYXRpb25SZW1pbmRlcnNSZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGdldE5vdGlmaWNhdGlvblJlbWluZGVyc1Jlc3BvbnNlLmRhdGEpfWApO1xuXG4gICAgICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIGRhdGEgYmxvY2sgZnJvbSB0aGUgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICBjb25zdCByZXNwb25zZURhdGEgPSAoZ2V0Tm90aWZpY2F0aW9uUmVtaW5kZXJzUmVzcG9uc2UgJiYgZ2V0Tm90aWZpY2F0aW9uUmVtaW5kZXJzUmVzcG9uc2UuZGF0YSkgPyBnZXROb3RpZmljYXRpb25SZW1pbmRlcnNSZXNwb25zZS5kYXRhLmRhdGEgOiBudWxsO1xuXG4gICAgICAgICAgICAgICAgLy8gY2hlY2sgaWYgdGhlcmUgYXJlIGFueSBlcnJvcnMgaW4gdGhlIHJldHVybmVkIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlRGF0YSAmJiByZXNwb25zZURhdGEuZ2V0Tm90aWZpY2F0aW9uUmVtaW5kZXJzLmVycm9yTWVzc2FnZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm5lZCB0aGUgc3VjY2Vzc2Z1bGx5IHJldHJpZXZlZCBub3RpZmljYXRpb24gcmVtaW5kZXJzXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiByZXNwb25zZURhdGEuZ2V0Tm90aWZpY2F0aW9uUmVtaW5kZXJzLmRhdGEgYXMgTm90aWZpY2F0aW9uUmVtaW5kZXJbXVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlRGF0YSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIGVycm9yIG1lc3NhZ2UgYW5kIHR5cGUsIGZyb20gdGhlIG9yaWdpbmFsIEFwcFN5bmMgY2FsbFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogcmVzcG9uc2VEYXRhLmdldE5vdGlmaWNhdGlvblJlbWluZGVycy5lcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiByZXNwb25zZURhdGEuZ2V0Tm90aWZpY2F0aW9uUmVtaW5kZXJzLmVycm9yVHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIGVycm9yIHJlc3BvbnNlIGluZGljYXRpbmcgYW4gaW52YWxpZCBzdHJ1Y3R1cmUgcmV0dXJuZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBJbnZhbGlkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tICR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSFgLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uUmVtaW5kZXJFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvci5yZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYW5kIHRoZSBzZXJ2ZXIgcmVzcG9uZGVkIHdpdGggYSBzdGF0dXMgY29kZVxuICAgICAgICAgICAgICAgICAgICAgKiB0aGF0IGZhbGxzIG91dCBvZiB0aGUgcmFuZ2Ugb2YgMnh4LlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vbiAyeHh4IHJlc3BvbnNlIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBNb29uYmVhbSBBUEksIHdpdGggc3RhdHVzICR7ZXJyb3IucmVzcG9uc2Uuc3RhdHVzfSwgYW5kIHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZXJyb3IucmVzcG9uc2UuZGF0YSl9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBhbnkgb3RoZXIgc3BlY2lmaWMgZXJyb3JzIHRvIGJlIGZpbHRlcmVkIGJlbG93XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uUmVtaW5kZXJFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5yZXF1ZXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBidXQgbm8gcmVzcG9uc2Ugd2FzIHJlY2VpdmVkXG4gICAgICAgICAgICAgICAgICAgICAqIGBlcnJvci5yZXF1ZXN0YCBpcyBhbiBpbnN0YW5jZSBvZiBYTUxIdHRwUmVxdWVzdCBpbiB0aGUgYnJvd3NlciBhbmQgYW4gaW5zdGFuY2Ugb2ZcbiAgICAgICAgICAgICAgICAgICAgICogIGh0dHAuQ2xpZW50UmVxdWVzdCBpbiBub2RlLmpzLlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vIHJlc3BvbnNlIHJlY2VpdmVkIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBNb29uYmVhbSBBUEksIGZvciByZXF1ZXN0ICR7ZXJyb3IucmVxdWVzdH1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uUmVtaW5kZXJFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU29tZXRoaW5nIGhhcHBlbmVkIGluIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgdGhhdCB0cmlnZ2VyZWQgYW4gRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgc2V0dGluZyB1cCB0aGUgcmVxdWVzdCBmb3IgdGhlICR7ZW5kcG9pbnRJbmZvfSBNb29uYmVhbSBBUEksICR7KGVycm9yICYmIGVycm9yLm1lc3NhZ2UpICYmIGVycm9yLm1lc3NhZ2V9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvblJlbWluZGVyRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHJldHJpZXZpbmcgbm90aWZpY2F0aW9uIHJlbWluZGVycyB0aHJvdWdoICR7ZW5kcG9pbnRJbmZvfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9ICR7ZXJyfWApO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uUmVtaW5kZXJFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdXNlZCB0byB1cGRhdGUgYSBzcGVjaWZpYyBub3RpZmljYXRpb24gcmVtaW5kZXIuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gdXBkYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dCB0aGUgbm90aWZpY2F0aW9uIHJlbWluZGVyIGlucHV0LCBjb250YWluaW5nIGFueSBpbmZvcm1hdGlvbiB1c2VkIHRvXG4gICAgICogdXBkYXRlIGFuIGFwcGxpY2FibGUgbm90aWZpY2F0aW9uIHJlbWluZGVyLlxuICAgICAqXG4gICAgICogQHJldHVybnMgYSB7QGxpbmsgTm90aWZpY2F0aW9uUmVtaW5kZXJSZXNwb25zZX0sIHJlcHJlc2VudGluZyB0aGUgdXBkYXRlIG5vdGlmaWNhdGlvbiByZW1pbmRlci5cbiAgICAgKlxuICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgKi9cbiAgICBhc3luYyB1cGRhdGVOb3RpZmljYXRpb25SZW1pbmRlcih1cGRhdGVOb3RpZmljYXRpb25SZW1pbmRlcklucHV0OiBVcGRhdGVOb3RpZmljYXRpb25SZW1pbmRlcklucHV0KTogUHJvbWlzZTxOb3RpZmljYXRpb25SZW1pbmRlclJlc3BvbnNlPiB7XG4gICAgICAgIC8vIGVhc2lseSBpZGVudGlmaWFibGUgQVBJIGVuZHBvaW50IGluZm9ybWF0aW9uXG4gICAgICAgIGNvbnN0IGVuZHBvaW50SW5mbyA9ICd1cGRhdGVOb3RpZmljYXRpb25SZW1pbmRlciBNdXRhdGlvbiBNb29uYmVhbSBHcmFwaFFMIEFQSSc7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBBUEkgS2V5IGFuZCBCYXNlIFVSTCwgbmVlZGVkIGluIG9yZGVyIHRvIG1ha2UgdGhlIGVsaWdpYmxlIHVzZXIgcmV0cmlldmFsIGNhbGwgdGhyb3VnaCB0aGUgY2xpZW50XG4gICAgICAgICAgICBjb25zdCBbbW9vbmJlYW1CYXNlVVJMLCBtb29uYmVhbVByaXZhdGVLZXldID0gYXdhaXQgc3VwZXIucmV0cmlldmVTZXJ2aWNlQ3JlZGVudGlhbHMoQ29uc3RhbnRzLkFXU1BhaXJDb25zdGFudHMuTU9PTkJFQU1fSU5URVJOQUxfU0VDUkVUX05BTUUpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgd2Ugb2J0YWluZWQgYW55IGludmFsaWQgc2VjcmV0IHZhbHVlcyBmcm9tIHRoZSBjYWxsIGFib3ZlXG4gICAgICAgICAgICBpZiAobW9vbmJlYW1CYXNlVVJMID09PSBudWxsIHx8IG1vb25iZWFtQmFzZVVSTC5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBtb29uYmVhbVByaXZhdGVLZXkgPT09IG51bGwgfHwgbW9vbmJlYW1Qcml2YXRlS2V5Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IFwiSW52YWxpZCBTZWNyZXRzIG9idGFpbmVkIGZvciBNb29uYmVhbSBBUEkgY2FsbCFcIjtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uUmVtaW5kZXJFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiB1cGRhdGVOb3RpZmljYXRpb25SZW1pbmRlciBNdXRhdGlvblxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIGJ1aWxkIHRoZSBNb29uYmVhbSBBcHBTeW5jIEFQSSBHcmFwaFFMIHF1ZXJ5LCBhbmQgcGVyZm9ybSBhIFBPU1QgdG8gaXQsXG4gICAgICAgICAgICAgKiB3aXRoIHRoZSBhcHByb3ByaWF0ZSBpbmZvcm1hdGlvbi5cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiB3ZSBpbXBseSB0aGF0IGlmIHRoZSBBUEkgZG9lcyBub3QgcmVzcG9uZCBpbiAxNSBzZWNvbmRzLCB0aGVuIHdlIGF1dG9tYXRpY2FsbHkgY2F0Y2ggdGhhdCwgYW5kIHJldHVybiBhblxuICAgICAgICAgICAgICogZXJyb3IgZm9yIGEgYmV0dGVyIGN1c3RvbWVyIGV4cGVyaWVuY2UuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHJldHVybiBheGlvcy5wb3N0KGAke21vb25iZWFtQmFzZVVSTH1gLCB7XG4gICAgICAgICAgICAgICAgcXVlcnk6IHVwZGF0ZU5vdGlmaWNhdGlvblJlbWluZGVyLFxuICAgICAgICAgICAgICAgIHZhcmlhYmxlczoge1xuICAgICAgICAgICAgICAgICAgICB1cGRhdGVOb3RpZmljYXRpb25SZW1pbmRlcklucHV0OiB1cGRhdGVOb3RpZmljYXRpb25SZW1pbmRlcklucHV0XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgICAgIFwieC1hcGkta2V5XCI6IG1vb25iZWFtUHJpdmF0ZUtleVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGltZW91dDogMTUwMDAsIC8vIGluIG1pbGxpc2Vjb25kcyBoZXJlXG4gICAgICAgICAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZTogJ01vb25iZWFtIEFQSSB0aW1lZCBvdXQgYWZ0ZXIgMTUwMDBtcyEnXG4gICAgICAgICAgICB9KS50aGVuKHVwZGF0ZU5vdGlmaWNhdGlvblJlbWluZGVyUmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeSh1cGRhdGVOb3RpZmljYXRpb25SZW1pbmRlclJlc3BvbnNlLmRhdGEpfWApO1xuXG4gICAgICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIGRhdGEgYmxvY2sgZnJvbSB0aGUgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICBjb25zdCByZXNwb25zZURhdGEgPSAodXBkYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJSZXNwb25zZSAmJiB1cGRhdGVOb3RpZmljYXRpb25SZW1pbmRlclJlc3BvbnNlLmRhdGEpID8gdXBkYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJSZXNwb25zZS5kYXRhLmRhdGEgOiBudWxsO1xuXG4gICAgICAgICAgICAgICAgLy8gY2hlY2sgaWYgdGhlcmUgYXJlIGFueSBlcnJvcnMgaW4gdGhlIHJldHVybmVkIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlRGF0YSAmJiByZXNwb25zZURhdGEudXBkYXRlTm90aWZpY2F0aW9uUmVtaW5kZXIuZXJyb3JNZXNzYWdlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHJldHVybmVkIHRoZSBzdWNjZXNzZnVsbHkgdXBkYXRlZCBub3RpZmljYXRpb24gcmVtaW5kZXJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHJlc3BvbnNlRGF0YS51cGRhdGVOb3RpZmljYXRpb25SZW1pbmRlci5kYXRhIGFzIE5vdGlmaWNhdGlvblJlbWluZGVyW11cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZURhdGEgP1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBlcnJvciBtZXNzYWdlIGFuZCB0eXBlLCBmcm9tIHRoZSBvcmlnaW5hbCBBcHBTeW5jIGNhbGxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IHJlc3BvbnNlRGF0YS51cGRhdGVOb3RpZmljYXRpb25SZW1pbmRlci5lcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiByZXNwb25zZURhdGEudXBkYXRlTm90aWZpY2F0aW9uUmVtaW5kZXIuZXJyb3JUeXBlXG4gICAgICAgICAgICAgICAgICAgICAgICB9IDpcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgZXJyb3IgcmVzcG9uc2UgaW5kaWNhdGluZyBhbiBpbnZhbGlkIHN0cnVjdHVyZSByZXR1cm5lZFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogYEludmFsaWQgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gJHtlbmRwb2ludEluZm99IHJlc3BvbnNlIWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25SZW1pbmRlckVycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yLnJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBhbmQgdGhlIHNlcnZlciByZXNwb25kZWQgd2l0aCBhIHN0YXR1cyBjb2RlXG4gICAgICAgICAgICAgICAgICAgICAqIHRoYXQgZmFsbHMgb3V0IG9mIHRoZSByYW5nZSBvZiAyeHguXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm9uIDJ4eHggcmVzcG9uc2Ugd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgd2l0aCBzdGF0dXMgJHtlcnJvci5yZXNwb25zZS5zdGF0dXN9LCBhbmQgcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShlcnJvci5yZXNwb25zZS5kYXRhKX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGFueSBvdGhlciBzcGVjaWZpYyBlcnJvcnMgdG8gYmUgZmlsdGVyZWQgYmVsb3dcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25SZW1pbmRlckVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVycm9yLnJlcXVlc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGJ1dCBubyByZXNwb25zZSB3YXMgcmVjZWl2ZWRcbiAgICAgICAgICAgICAgICAgICAgICogYGVycm9yLnJlcXVlc3RgIGlzIGFuIGluc3RhbmNlIG9mIFhNTEh0dHBSZXF1ZXN0IGluIHRoZSBicm93c2VyIGFuZCBhbiBpbnN0YW5jZSBvZlxuICAgICAgICAgICAgICAgICAgICAgKiAgaHR0cC5DbGllbnRSZXF1ZXN0IGluIG5vZGUuanMuXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm8gcmVzcG9uc2UgcmVjZWl2ZWQgd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgZm9yIHJlcXVlc3QgJHtlcnJvci5yZXF1ZXN0fWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25SZW1pbmRlckVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBTb21ldGhpbmcgaGFwcGVuZWQgaW4gc2V0dGluZyB1cCB0aGUgcmVxdWVzdCB0aGF0IHRyaWdnZXJlZCBhbiBFcnJvclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IGZvciB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgJHsoZXJyb3IgJiYgZXJyb3IubWVzc2FnZSkgJiYgZXJyb3IubWVzc2FnZX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uUmVtaW5kZXJFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgdXBkYXRpbmcgdGhlIG5vdGlmaWNhdGlvbiByZW1pbmRlciB0aHJvdWdoICR7ZW5kcG9pbnRJbmZvfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9ICR7ZXJyfWApO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uUmVtaW5kZXJFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdXNlZCB0byBnZXQgdGhlIHVzZXJzIHdpdGggbm8gbGlua2VkIGNhcmRzLlxuICAgICAqXG4gICAgICogQHJldHVybnMgYSB7QGxpbmsgSW5lbGlnaWJsZUxpbmtlZFVzZXJzUmVzcG9uc2V9LCByZXByZXNlbnRpbmcgdGhlIHVzZXJzXG4gICAgICogd2hpY2ggYXJlIG5vdCBlbGlnaWJsZSBmb3IgYSByZWltYnVyc2VtZW50LCBzaW5jZSB0aGV5IGhhdmUgbm8gbGlua2VkIGNhcmRzLlxuICAgICAqL1xuICAgIGFzeW5jIGdldFVzZXJzV2l0aE5vQ2FyZHMoKTogUHJvbWlzZTxJbmVsaWdpYmxlTGlua2VkVXNlcnNSZXNwb25zZT4ge1xuICAgICAgICAvLyBlYXNpbHkgaWRlbnRpZmlhYmxlIEFQSSBlbmRwb2ludCBpbmZvcm1hdGlvblxuICAgICAgICBjb25zdCBlbmRwb2ludEluZm8gPSAnZ2V0VXNlcnNXaXRoTm9DYXJkcyBRdWVyeSBNb29uYmVhbSBHcmFwaFFMIEFQSSc7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBBUEkgS2V5IGFuZCBCYXNlIFVSTCwgbmVlZGVkIGluIG9yZGVyIHRvIG1ha2UgdGhlIHVzZXJzIHdpdGggbm8gbGlua2VkIGNhcmRzIHJldHJpZXZhbCBjYWxsIHRocm91Z2ggdGhlIGNsaWVudFxuICAgICAgICAgICAgY29uc3QgW21vb25iZWFtQmFzZVVSTCwgbW9vbmJlYW1Qcml2YXRlS2V5XSA9IGF3YWl0IHN1cGVyLnJldHJpZXZlU2VydmljZUNyZWRlbnRpYWxzKENvbnN0YW50cy5BV1NQYWlyQ29uc3RhbnRzLk1PT05CRUFNX0lOVEVSTkFMX1NFQ1JFVF9OQU1FKTtcblxuICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHdlIG9idGFpbmVkIGFueSBpbnZhbGlkIHNlY3JldCB2YWx1ZXMgZnJvbSB0aGUgY2FsbCBhYm92ZVxuICAgICAgICAgICAgaWYgKG1vb25iZWFtQmFzZVVSTCA9PT0gbnVsbCB8fCBtb29uYmVhbUJhc2VVUkwubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgbW9vbmJlYW1Qcml2YXRlS2V5ID09PSBudWxsIHx8IG1vb25iZWFtUHJpdmF0ZUtleS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBcIkludmFsaWQgU2VjcmV0cyBvYnRhaW5lZCBmb3IgTW9vbmJlYW0gQVBJIGNhbGwhXCI7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogZ2V0VXNlcnNXaXRoTm9DYXJkcyBRdWVyeVxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIGJ1aWxkIHRoZSBNb29uYmVhbSBBcHBTeW5jIEFQSSBHcmFwaFFMIHF1ZXJ5LCBhbmQgcGVyZm9ybSBhIFBPU1QgdG8gaXQsXG4gICAgICAgICAgICAgKiB3aXRoIHRoZSBhcHByb3ByaWF0ZSBpbmZvcm1hdGlvbi5cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiB3ZSBpbXBseSB0aGF0IGlmIHRoZSBBUEkgZG9lcyBub3QgcmVzcG9uZCBpbiAxNSBzZWNvbmRzLCB0aGVuIHdlIGF1dG9tYXRpY2FsbHkgY2F0Y2ggdGhhdCwgYW5kIHJldHVybiBhblxuICAgICAgICAgICAgICogZXJyb3IgZm9yIGEgYmV0dGVyIGN1c3RvbWVyIGV4cGVyaWVuY2UuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHJldHVybiBheGlvcy5wb3N0KGAke21vb25iZWFtQmFzZVVSTH1gLCB7XG4gICAgICAgICAgICAgICAgcXVlcnk6IGdldFVzZXJzV2l0aE5vQ2FyZHNcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgICAgICBcIngtYXBpLWtleVwiOiBtb29uYmVhbVByaXZhdGVLZXlcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDE1MDAwLCAvLyBpbiBtaWxsaXNlY29uZHMgaGVyZVxuICAgICAgICAgICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2U6ICdNb29uYmVhbSBBUEkgdGltZWQgb3V0IGFmdGVyIDE1MDAwbXMhJ1xuICAgICAgICAgICAgfSkudGhlbihnZXRVc2Vyc1dpdGhOb0NhcmRzUmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShnZXRVc2Vyc1dpdGhOb0NhcmRzUmVzcG9uc2UuZGF0YSl9YCk7XG5cbiAgICAgICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgZGF0YSBibG9jayBmcm9tIHRoZSByZXNwb25zZVxuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlRGF0YSA9IChnZXRVc2Vyc1dpdGhOb0NhcmRzUmVzcG9uc2UgJiYgZ2V0VXNlcnNXaXRoTm9DYXJkc1Jlc3BvbnNlLmRhdGEpID8gZ2V0VXNlcnNXaXRoTm9DYXJkc1Jlc3BvbnNlLmRhdGEuZGF0YSA6IG51bGw7XG5cbiAgICAgICAgICAgICAgICAvLyBjaGVjayBpZiB0aGVyZSBhcmUgYW55IGVycm9ycyBpbiB0aGUgcmV0dXJuZWQgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2VEYXRhICYmIHJlc3BvbnNlRGF0YS5nZXRVc2Vyc1dpdGhOb0NhcmRzLmVycm9yTWVzc2FnZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm5lZCB0aGUgc3VjY2Vzc2Z1bGx5IHJldHJpZXZlZCB1c2VycyB3aXRoIG5vIGxpbmtlZCBjYXJkc1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogcmVzcG9uc2VEYXRhLmdldFVzZXJzV2l0aE5vQ2FyZHMuZGF0YSBhcyBSZXRyaWV2ZVVzZXJEZXRhaWxzRm9yTm90aWZpY2F0aW9uc1tdXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2VEYXRhID9cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgdHlwZSwgZnJvbSB0aGUgb3JpZ2luYWwgQXBwU3luYyBjYWxsXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiByZXNwb25zZURhdGEuZ2V0VXNlcnNXaXRoTm9DYXJkcy5lcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiByZXNwb25zZURhdGEuZ2V0VXNlcnNXaXRoTm9DYXJkcy5lcnJvclR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gOlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBlcnJvciByZXNwb25zZSBpbmRpY2F0aW5nIGFuIGludmFsaWQgc3RydWN0dXJlIHJldHVybmVkXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgSW52YWxpZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UhYCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IucmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGFuZCB0aGUgc2VydmVyIHJlc3BvbmRlZCB3aXRoIGEgc3RhdHVzIGNvZGVcbiAgICAgICAgICAgICAgICAgICAgICogdGhhdCBmYWxscyBvdXQgb2YgdGhlIHJhbmdlIG9mIDJ4eC5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBOb24gMnh4eCByZXNwb25zZSB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gTW9vbmJlYW0gQVBJLCB3aXRoIHN0YXR1cyAke2Vycm9yLnJlc3BvbnNlLnN0YXR1c30sIGFuZCByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGVycm9yLnJlc3BvbnNlLmRhdGEpfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gYW55IG90aGVyIHNwZWNpZmljIGVycm9ycyB0byBiZSBmaWx0ZXJlZCBiZWxvd1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3IucmVxdWVzdCkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYnV0IG5vIHJlc3BvbnNlIHdhcyByZWNlaXZlZFxuICAgICAgICAgICAgICAgICAgICAgKiBgZXJyb3IucmVxdWVzdGAgaXMgYW4gaW5zdGFuY2Ugb2YgWE1MSHR0cFJlcXVlc3QgaW4gdGhlIGJyb3dzZXIgYW5kIGFuIGluc3RhbmNlIG9mXG4gICAgICAgICAgICAgICAgICAgICAqICBodHRwLkNsaWVudFJlcXVlc3QgaW4gbm9kZS5qcy5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBObyByZXNwb25zZSByZWNlaXZlZCB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gTW9vbmJlYW0gQVBJLCBmb3IgcmVxdWVzdCAke2Vycm9yLnJlcXVlc3R9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNvbWV0aGluZyBoYXBwZW5lZCBpbiBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IHRoYXQgdHJpZ2dlcmVkIGFuIEVycm9yXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgZm9yIHRoZSAke2VuZHBvaW50SW5mb30gTW9vbmJlYW0gQVBJLCAkeyhlcnJvciAmJiBlcnJvci5tZXNzYWdlKSAmJiBlcnJvci5tZXNzYWdlfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSByZXRyaWV2aW5nIHVzZXJzIHdpdGggbm8gbGlua2VkIGNhcmRzIHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJ9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB1c2VkIHRvIHJldHJpZXZlIHRoZSB1cGRhdGUgdGhlIGRldGFpbHMgb2YgYSBnaXZlbiBjYXJkLiBUaGlzIHdpbGwgZXNwZWNpYWxseSBiZSB1c2VkXG4gICAgICogd2hlbiB1cGRhdGluZyBpdHMgZXhwaXJhdGlvbiBkYXRlLlxuICAgICAqXG4gICAgICogQHJldHVybiBhIHtsaW5rIFByb21pc2V9IG9mIHtAbGluayBFbGlnaWJsZUxpbmtlZFVzZXJzUmVzcG9uc2V9IHJlcHJlc2VudGluZyB0aGUgdXNlciB3aXRoIHRoZVxuICAgICAqIHVwZGF0ZWQgY2FyZCBkZXRhaWxzLlxuICAgICAqL1xuICAgIGFzeW5jIHVwZGF0ZUNhcmREZXRhaWxzKHVwZGF0ZUNhcmRJbnB1dDogVXBkYXRlQ2FyZElucHV0KTogUHJvbWlzZTxFbGlnaWJsZUxpbmtlZFVzZXJzUmVzcG9uc2U+IHtcbiAgICAgICAgLy8gZWFzaWx5IGlkZW50aWZpYWJsZSBBUEkgZW5kcG9pbnQgaW5mb3JtYXRpb25cbiAgICAgICAgY29uc3QgZW5kcG9pbnRJbmZvID0gJ3VwZGF0ZUNhcmQgTXV0YXRpb24gTW9vbmJlYW0gR3JhcGhRTCBBUEknO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgQVBJIEtleSBhbmQgQmFzZSBVUkwsIG5lZWRlZCBpbiBvcmRlciB0byBtYWtlIHRoZSBlbGlnaWJsZSB1c2VyIHJldHJpZXZhbCBjYWxsIHRocm91Z2ggdGhlIGNsaWVudFxuICAgICAgICAgICAgY29uc3QgW21vb25iZWFtQmFzZVVSTCwgbW9vbmJlYW1Qcml2YXRlS2V5XSA9IGF3YWl0IHN1cGVyLnJldHJpZXZlU2VydmljZUNyZWRlbnRpYWxzKENvbnN0YW50cy5BV1NQYWlyQ29uc3RhbnRzLk1PT05CRUFNX0lOVEVSTkFMX1NFQ1JFVF9OQU1FKTtcblxuICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHdlIG9idGFpbmVkIGFueSBpbnZhbGlkIHNlY3JldCB2YWx1ZXMgZnJvbSB0aGUgY2FsbCBhYm92ZVxuICAgICAgICAgICAgaWYgKG1vb25iZWFtQmFzZVVSTCA9PT0gbnVsbCB8fCBtb29uYmVhbUJhc2VVUkwubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgbW9vbmJlYW1Qcml2YXRlS2V5ID09PSBudWxsIHx8IG1vb25iZWFtUHJpdmF0ZUtleS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBcIkludmFsaWQgU2VjcmV0cyBvYnRhaW5lZCBmb3IgTW9vbmJlYW0gQVBJIGNhbGwhXCI7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogdXBkYXRlQ2FyZCBRdWVyeVxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIGJ1aWxkIHRoZSBNb29uYmVhbSBBcHBTeW5jIEFQSSBHcmFwaFFMIHF1ZXJ5LCBhbmQgcGVyZm9ybSBhIFBPU1QgdG8gaXQsXG4gICAgICAgICAgICAgKiB3aXRoIHRoZSBhcHByb3ByaWF0ZSBpbmZvcm1hdGlvbi5cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiB3ZSBpbXBseSB0aGF0IGlmIHRoZSBBUEkgZG9lcyBub3QgcmVzcG9uZCBpbiAxNSBzZWNvbmRzLCB0aGVuIHdlIGF1dG9tYXRpY2FsbHkgY2F0Y2ggdGhhdCwgYW5kIHJldHVybiBhblxuICAgICAgICAgICAgICogZXJyb3IgZm9yIGEgYmV0dGVyIGN1c3RvbWVyIGV4cGVyaWVuY2UuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHJldHVybiBheGlvcy5wb3N0KGAke21vb25iZWFtQmFzZVVSTH1gLCB7XG4gICAgICAgICAgICAgICAgcXVlcnk6IHVwZGF0ZUNhcmQsXG4gICAgICAgICAgICAgICAgdmFyaWFibGVzOiB7XG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZUNhcmRJbnB1dDogdXBkYXRlQ2FyZElucHV0XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgICAgIFwieC1hcGkta2V5XCI6IG1vb25iZWFtUHJpdmF0ZUtleVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGltZW91dDogMTUwMDAsIC8vIGluIG1pbGxpc2Vjb25kcyBoZXJlXG4gICAgICAgICAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZTogJ01vb25iZWFtIEFQSSB0aW1lZCBvdXQgYWZ0ZXIgMTUwMDBtcyEnXG4gICAgICAgICAgICB9KS50aGVuKHVwZGF0ZUNhcmRJbnB1dFJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlbmRwb2ludEluZm99IHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkodXBkYXRlQ2FyZElucHV0UmVzcG9uc2UuZGF0YSl9YCk7XG5cbiAgICAgICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgZGF0YSBibG9jayBmcm9tIHRoZSByZXNwb25zZVxuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlRGF0YSA9ICh1cGRhdGVDYXJkSW5wdXRSZXNwb25zZSAmJiB1cGRhdGVDYXJkSW5wdXRSZXNwb25zZS5kYXRhKSA/IHVwZGF0ZUNhcmRJbnB1dFJlc3BvbnNlLmRhdGEuZGF0YSA6IG51bGw7XG5cbiAgICAgICAgICAgICAgICAvLyBjaGVjayBpZiB0aGVyZSBhcmUgYW55IGVycm9ycyBpbiB0aGUgcmV0dXJuZWQgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2VEYXRhICYmIHJlc3BvbnNlRGF0YS51cGRhdGVDYXJkLmVycm9yTWVzc2FnZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm5lZCB0aGUgc3VjY2Vzc2Z1bGx5IHVwZGF0ZWQgY2FyZCBkZXRhaWxzXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiByZXNwb25zZURhdGEudXBkYXRlQ2FyZC5kYXRhIGFzIEVsaWdpYmxlTGlua2VkVXNlcltdXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2VEYXRhID9cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgdHlwZSwgZnJvbSB0aGUgb3JpZ2luYWwgQXBwU3luYyBjYWxsXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiByZXNwb25zZURhdGEudXBkYXRlQ2FyZC5lcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiByZXNwb25zZURhdGEudXBkYXRlQ2FyZC5lcnJvclR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gOlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBlcnJvciByZXNwb25zZSBpbmRpY2F0aW5nIGFuIGludmFsaWQgc3RydWN0dXJlIHJldHVybmVkXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgSW52YWxpZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UhYCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IucmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGFuZCB0aGUgc2VydmVyIHJlc3BvbmRlZCB3aXRoIGEgc3RhdHVzIGNvZGVcbiAgICAgICAgICAgICAgICAgICAgICogdGhhdCBmYWxscyBvdXQgb2YgdGhlIHJhbmdlIG9mIDJ4eC5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBOb24gMnh4eCByZXNwb25zZSB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gTW9vbmJlYW0gQVBJLCB3aXRoIHN0YXR1cyAke2Vycm9yLnJlc3BvbnNlLnN0YXR1c30sIGFuZCByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGVycm9yLnJlc3BvbnNlLmRhdGEpfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gYW55IG90aGVyIHNwZWNpZmljIGVycm9ycyB0byBiZSBmaWx0ZXJlZCBiZWxvd1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3IucmVxdWVzdCkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYnV0IG5vIHJlc3BvbnNlIHdhcyByZWNlaXZlZFxuICAgICAgICAgICAgICAgICAgICAgKiBgZXJyb3IucmVxdWVzdGAgaXMgYW4gaW5zdGFuY2Ugb2YgWE1MSHR0cFJlcXVlc3QgaW4gdGhlIGJyb3dzZXIgYW5kIGFuIGluc3RhbmNlIG9mXG4gICAgICAgICAgICAgICAgICAgICAqICBodHRwLkNsaWVudFJlcXVlc3QgaW4gbm9kZS5qcy5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBObyByZXNwb25zZSByZWNlaXZlZCB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gTW9vbmJlYW0gQVBJLCBmb3IgcmVxdWVzdCAke2Vycm9yLnJlcXVlc3R9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNvbWV0aGluZyBoYXBwZW5lZCBpbiBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IHRoYXQgdHJpZ2dlcmVkIGFuIEVycm9yXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgZm9yIHRoZSAke2VuZHBvaW50SW5mb30gTW9vbmJlYW0gQVBJLCAkeyhlcnJvciAmJiBlcnJvci5tZXNzYWdlKSAmJiBlcnJvci5tZXNzYWdlfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSB1cGRhdGluZyBjYXJkIGRldGFpbHMgdGhyb3VnaCAke2VuZHBvaW50SW5mb31gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfSAke2Vycn1gKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHVzZWQgdG8gcmV0cmlldmUgdGhlIGxpc3Qgb2YgZWxpZ2libGUgbGlua2VkIHVzZXJzLlxuICAgICAqXG4gICAgICogQHJldHVybiBhIHtsaW5rIFByb21pc2V9IG9mIHtAbGluayBFbGlnaWJsZUxpbmtlZFVzZXJzUmVzcG9uc2V9IHJlcHJlc2VudGluZyB0aGUgbGlzdCBvZiBlbGlnaWJsZVxuICAgICAqIHVzZXJzXG4gICAgICovXG4gICAgYXN5bmMgZ2V0RWxpZ2libGVMaW5rZWRVc2VycygpOiBQcm9taXNlPEVsaWdpYmxlTGlua2VkVXNlcnNSZXNwb25zZT4ge1xuICAgICAgICAvLyBlYXNpbHkgaWRlbnRpZmlhYmxlIEFQSSBlbmRwb2ludCBpbmZvcm1hdGlvblxuICAgICAgICBjb25zdCBlbmRwb2ludEluZm8gPSAnZ2V0RWxpZ2libGVMaW5rZWRVc2VycyBRdWVyeSBNb29uYmVhbSBHcmFwaFFMIEFQSSc7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBBUEkgS2V5IGFuZCBCYXNlIFVSTCwgbmVlZGVkIGluIG9yZGVyIHRvIG1ha2UgdGhlIGVsaWdpYmxlIHVzZXIgcmV0cmlldmFsIGNhbGwgdGhyb3VnaCB0aGUgY2xpZW50XG4gICAgICAgICAgICBjb25zdCBbbW9vbmJlYW1CYXNlVVJMLCBtb29uYmVhbVByaXZhdGVLZXldID0gYXdhaXQgc3VwZXIucmV0cmlldmVTZXJ2aWNlQ3JlZGVudGlhbHMoQ29uc3RhbnRzLkFXU1BhaXJDb25zdGFudHMuTU9PTkJFQU1fSU5URVJOQUxfU0VDUkVUX05BTUUpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgd2Ugb2J0YWluZWQgYW55IGludmFsaWQgc2VjcmV0IHZhbHVlcyBmcm9tIHRoZSBjYWxsIGFib3ZlXG4gICAgICAgICAgICBpZiAobW9vbmJlYW1CYXNlVVJMID09PSBudWxsIHx8IG1vb25iZWFtQmFzZVVSTC5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBtb29uYmVhbVByaXZhdGVLZXkgPT09IG51bGwgfHwgbW9vbmJlYW1Qcml2YXRlS2V5Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IFwiSW52YWxpZCBTZWNyZXRzIG9idGFpbmVkIGZvciBNb29uYmVhbSBBUEkgY2FsbCFcIjtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBnZXRFbGlnaWJsZUxpbmtlZFVzZXJzIFF1ZXJ5XG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogYnVpbGQgdGhlIE1vb25iZWFtIEFwcFN5bmMgQVBJIEdyYXBoUUwgcXVlcnksIGFuZCBwZXJmb3JtIGEgUE9TVCB0byBpdCxcbiAgICAgICAgICAgICAqIHdpdGggdGhlIGFwcHJvcHJpYXRlIGluZm9ybWF0aW9uLlxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIHdlIGltcGx5IHRoYXQgaWYgdGhlIEFQSSBkb2VzIG5vdCByZXNwb25kIGluIDE1IHNlY29uZHMsIHRoZW4gd2UgYXV0b21hdGljYWxseSBjYXRjaCB0aGF0LCBhbmQgcmV0dXJuIGFuXG4gICAgICAgICAgICAgKiBlcnJvciBmb3IgYSBiZXR0ZXIgY3VzdG9tZXIgZXhwZXJpZW5jZS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgcmV0dXJuIGF4aW9zLnBvc3QoYCR7bW9vbmJlYW1CYXNlVVJMfWAsIHtcbiAgICAgICAgICAgICAgICBxdWVyeTogZ2V0RWxpZ2libGVMaW5rZWRVc2Vyc1xuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgICAgIFwieC1hcGkta2V5XCI6IG1vb25iZWFtUHJpdmF0ZUtleVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGltZW91dDogMTUwMDAsIC8vIGluIG1pbGxpc2Vjb25kcyBoZXJlXG4gICAgICAgICAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZTogJ01vb25iZWFtIEFQSSB0aW1lZCBvdXQgYWZ0ZXIgMTUwMDBtcyEnXG4gICAgICAgICAgICB9KS50aGVuKGdldEVsaWdpYmxlTGlua2VkVXNlcnNSZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGdldEVsaWdpYmxlTGlua2VkVXNlcnNSZXNwb25zZS5kYXRhKX1gKTtcblxuICAgICAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBkYXRhIGJsb2NrIGZyb20gdGhlIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2VEYXRhID0gKGdldEVsaWdpYmxlTGlua2VkVXNlcnNSZXNwb25zZSAmJiBnZXRFbGlnaWJsZUxpbmtlZFVzZXJzUmVzcG9uc2UuZGF0YSkgPyBnZXRFbGlnaWJsZUxpbmtlZFVzZXJzUmVzcG9uc2UuZGF0YS5kYXRhIDogbnVsbDtcblxuICAgICAgICAgICAgICAgIC8vIGNoZWNrIGlmIHRoZXJlIGFyZSBhbnkgZXJyb3JzIGluIHRoZSByZXR1cm5lZCByZXNwb25zZVxuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZURhdGEgJiYgcmVzcG9uc2VEYXRhLmdldEVsaWdpYmxlTGlua2VkVXNlcnMuZXJyb3JNZXNzYWdlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHJldHVybmVkIHRoZSBzdWNjZXNzZnVsbHkgcmV0cmlldmVkIGVsaWdpYmxlIGxpbmtlZCB1c2Vyc1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogcmVzcG9uc2VEYXRhLmdldEVsaWdpYmxlTGlua2VkVXNlcnMuZGF0YSBhcyBFbGlnaWJsZUxpbmtlZFVzZXJbXVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlRGF0YSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIGVycm9yIG1lc3NhZ2UgYW5kIHR5cGUsIGZyb20gdGhlIG9yaWdpbmFsIEFwcFN5bmMgY2FsbFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogcmVzcG9uc2VEYXRhLmdldEVsaWdpYmxlTGlua2VkVXNlcnMuZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogcmVzcG9uc2VEYXRhLmdldEVsaWdpYmxlTGlua2VkVXNlcnMuZXJyb3JUeXBlXG4gICAgICAgICAgICAgICAgICAgICAgICB9IDpcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgZXJyb3IgcmVzcG9uc2UgaW5kaWNhdGluZyBhbiBpbnZhbGlkIHN0cnVjdHVyZSByZXR1cm5lZFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogYEludmFsaWQgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gJHtlbmRwb2ludEluZm99IHJlc3BvbnNlIWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yLnJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBhbmQgdGhlIHNlcnZlciByZXNwb25kZWQgd2l0aCBhIHN0YXR1cyBjb2RlXG4gICAgICAgICAgICAgICAgICAgICAqIHRoYXQgZmFsbHMgb3V0IG9mIHRoZSByYW5nZSBvZiAyeHguXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm9uIDJ4eHggcmVzcG9uc2Ugd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgd2l0aCBzdGF0dXMgJHtlcnJvci5yZXNwb25zZS5zdGF0dXN9LCBhbmQgcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShlcnJvci5yZXNwb25zZS5kYXRhKX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGFueSBvdGhlciBzcGVjaWZpYyBlcnJvcnMgdG8gYmUgZmlsdGVyZWQgYmVsb3dcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVycm9yLnJlcXVlc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGJ1dCBubyByZXNwb25zZSB3YXMgcmVjZWl2ZWRcbiAgICAgICAgICAgICAgICAgICAgICogYGVycm9yLnJlcXVlc3RgIGlzIGFuIGluc3RhbmNlIG9mIFhNTEh0dHBSZXF1ZXN0IGluIHRoZSBicm93c2VyIGFuZCBhbiBpbnN0YW5jZSBvZlxuICAgICAgICAgICAgICAgICAgICAgKiAgaHR0cC5DbGllbnRSZXF1ZXN0IGluIG5vZGUuanMuXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm8gcmVzcG9uc2UgcmVjZWl2ZWQgd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgZm9yIHJlcXVlc3QgJHtlcnJvci5yZXF1ZXN0fWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBTb21ldGhpbmcgaGFwcGVuZWQgaW4gc2V0dGluZyB1cCB0aGUgcmVxdWVzdCB0aGF0IHRyaWdnZXJlZCBhbiBFcnJvclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IGZvciB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgJHsoZXJyb3IgJiYgZXJyb3IubWVzc2FnZSkgJiYgZXJyb3IubWVzc2FnZX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgcmV0cmlldmluZyBlbGlnaWJsZSBsaW5rZWQgdXNlcnMgdGhyb3VnaCAke2VuZHBvaW50SW5mb31gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfSAke2Vycn1gKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHVzZWQgdG8gY3JlYXRlIGEgbmV3IHRyYW5zYWN0aW9uIGludGVybmFsbHksIGZyb20gYW4gaW5jb21pbmcgdHJhbnNhY3Rpb25cbiAgICAgKiBvYnRhaW5lZCBmcm9tIHRoZSBTUVMgbWVzc2FnZS9ldmVudFxuICAgICAqXG4gICAgICogQHBhcmFtIHRyYW5zYWN0aW9uIHRyYW5zYWN0aW9uIHBhc3NlZCBpbiBmcm9tIHRoZSBTUVMgbWVzc2FnZS9ldmVudFxuICAgICAqXG4gICAgICogQHJldHVybiBhIHtsaW5rIFByb21pc2V9IG9mIHtAbGluayBNb29uYmVhbVRyYW5zYWN0aW9uUmVzcG9uc2V9IHJlcHJlc2VudGluZyB0aGUgdHJhbnNhY3Rpb25cbiAgICAgKiBkZXRhaWxzIHRoYXQgd2VyZSBzdG9yZWQgaW4gRHluYW1vIERCXG4gICAgICovXG4gICAgYXN5bmMgY3JlYXRlVHJhbnNhY3Rpb24odHJhbnNhY3Rpb246IE1vb25iZWFtVHJhbnNhY3Rpb24pOiBQcm9taXNlPE1vb25iZWFtVHJhbnNhY3Rpb25SZXNwb25zZT4ge1xuICAgICAgICAvLyBlYXNpbHkgaWRlbnRpZmlhYmxlIEFQSSBlbmRwb2ludCBpbmZvcm1hdGlvblxuICAgICAgICBjb25zdCBlbmRwb2ludEluZm8gPSAnY3JlYXRlVHJhbnNhY3Rpb24gTXV0YXRpb24gTW9vbmJlYW0gR3JhcGhRTCBBUEknO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgQVBJIEtleSBhbmQgQmFzZSBVUkwsIG5lZWRlZCBpbiBvcmRlciB0byBtYWtlIHRoZSBjYXJkIGxpbmtpbmcgY2FsbCB0aHJvdWdoIHRoZSBjbGllbnRcbiAgICAgICAgICAgIGNvbnN0IFttb29uYmVhbUJhc2VVUkwsIG1vb25iZWFtUHJpdmF0ZUtleV0gPSBhd2FpdCBzdXBlci5yZXRyaWV2ZVNlcnZpY2VDcmVkZW50aWFscyhDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5NT09OQkVBTV9JTlRFUk5BTF9TRUNSRVRfTkFNRSk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB3ZSBvYnRhaW5lZCBhbnkgaW52YWxpZCBzZWNyZXQgdmFsdWVzIGZyb20gdGhlIGNhbGwgYWJvdmVcbiAgICAgICAgICAgIGlmIChtb29uYmVhbUJhc2VVUkwgPT09IG51bGwgfHwgbW9vbmJlYW1CYXNlVVJMLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG1vb25iZWFtUHJpdmF0ZUtleSA9PT0gbnVsbCB8fCBtb29uYmVhbVByaXZhdGVLZXkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gXCJJbnZhbGlkIFNlY3JldHMgb2J0YWluZWQgZm9yIE1vb25iZWFtIEFQSSBjYWxsIVwiO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBjcmVhdGVUcmFuc2FjdGlvbiBNdXRhdGlvblxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIGJ1aWxkIHRoZSBNb29uYmVhbSBBcHBTeW5jIEFQSSBHcmFwaFFMIG11dGF0aW9uIGJvZHkgdG8gYmUgcGFzc2VkIGluIHdpdGggaXRzIHZhcmlhYmxlcywgYW5kIHBlcmZvcm0gYSBQT1NUIHRvIGl0LFxuICAgICAgICAgICAgICogd2l0aCB0aGUgYXBwcm9wcmlhdGUgaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiB3ZSBpbXBseSB0aGF0IGlmIHRoZSBBUEkgZG9lcyBub3QgcmVzcG9uZCBpbiAxNSBzZWNvbmRzLCB0aGVuIHdlIGF1dG9tYXRpY2FsbHkgY2F0Y2ggdGhhdCwgYW5kIHJldHVybiBhblxuICAgICAgICAgICAgICogZXJyb3IgZm9yIGEgYmV0dGVyIGN1c3RvbWVyIGV4cGVyaWVuY2UuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBNb29uYmVhbSBBcHBTeW5jIEFQSSByZXF1ZXN0IE9iamVjdDogJHtKU09OLnN0cmluZ2lmeSh0cmFuc2FjdGlvbiBhcyBDcmVhdGVUcmFuc2FjdGlvbklucHV0KX1gKTtcbiAgICAgICAgICAgIHJldHVybiBheGlvcy5wb3N0KGAke21vb25iZWFtQmFzZVVSTH1gLCB7XG4gICAgICAgICAgICAgICAgcXVlcnk6IGNyZWF0ZVRyYW5zYWN0aW9uLFxuICAgICAgICAgICAgICAgIHZhcmlhYmxlczoge1xuICAgICAgICAgICAgICAgICAgICBjcmVhdGVUcmFuc2FjdGlvbklucHV0OiB0cmFuc2FjdGlvbiBhcyBDcmVhdGVUcmFuc2FjdGlvbklucHV0XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgICAgIFwieC1hcGkta2V5XCI6IG1vb25iZWFtUHJpdmF0ZUtleVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGltZW91dDogMTUwMDAsIC8vIGluIG1pbGxpc2Vjb25kcyBoZXJlXG4gICAgICAgICAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZTogJ01vb25iZWFtIEFQSSB0aW1lZCBvdXQgYWZ0ZXIgMTUwMDBtcyEnXG4gICAgICAgICAgICB9KS50aGVuKGNyZWF0ZVRyYW5zYWN0aW9uUmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShjcmVhdGVUcmFuc2FjdGlvblJlc3BvbnNlLmRhdGEpfWApO1xuXG4gICAgICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIGRhdGEgYmxvY2sgZnJvbSB0aGUgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICBjb25zdCByZXNwb25zZURhdGEgPSAoY3JlYXRlVHJhbnNhY3Rpb25SZXNwb25zZSAmJiBjcmVhdGVUcmFuc2FjdGlvblJlc3BvbnNlLmRhdGEpID8gY3JlYXRlVHJhbnNhY3Rpb25SZXNwb25zZS5kYXRhLmRhdGEgOiBudWxsO1xuXG4gICAgICAgICAgICAgICAgLy8gY2hlY2sgaWYgdGhlcmUgYXJlIGFueSBlcnJvcnMgaW4gdGhlIHJldHVybmVkIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlRGF0YSAmJiByZXNwb25zZURhdGEuY3JlYXRlVHJhbnNhY3Rpb24uZXJyb3JNZXNzYWdlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHJldHVybmVkIHRoZSBzdWNjZXNzZnVsbHkgc3RvcmVkIHRyYW5zYWN0aW9uLCBhcyB3ZWxsIGFzIGl0cyBJRCBpbiB0aGUgcGFyZW50IG9iamVjdCwgZm9yIHN1YnNjcmlwdGlvbiBwdXJwb3Nlc1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHRyYW5zYWN0aW9uLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogdHJhbnNhY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZURhdGEgP1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBlcnJvciBtZXNzYWdlIGFuZCB0eXBlLCBmcm9tIHRoZSBvcmlnaW5hbCBBcHBTeW5jIGNhbGxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IHJlc3BvbnNlRGF0YS5jcmVhdGVUcmFuc2FjdGlvbi5lcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiByZXNwb25zZURhdGEuY3JlYXRlVHJhbnNhY3Rpb24uZXJyb3JUeXBlXG4gICAgICAgICAgICAgICAgICAgICAgICB9IDpcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgZXJyb3IgcmVzcG9uc2UgaW5kaWNhdGluZyBhbiBpbnZhbGlkIHN0cnVjdHVyZSByZXR1cm5lZFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogYEludmFsaWQgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gJHtlbmRwb2ludEluZm99IHJlc3BvbnNlIWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvci5yZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYW5kIHRoZSBzZXJ2ZXIgcmVzcG9uZGVkIHdpdGggYSBzdGF0dXMgY29kZVxuICAgICAgICAgICAgICAgICAgICAgKiB0aGF0IGZhbGxzIG91dCBvZiB0aGUgcmFuZ2Ugb2YgMnh4LlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vbiAyeHh4IHJlc3BvbnNlIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBNb29uYmVhbSBBUEksIHdpdGggc3RhdHVzICR7ZXJyb3IucmVzcG9uc2Uuc3RhdHVzfSwgYW5kIHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZXJyb3IucmVzcG9uc2UuZGF0YSl9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBhbnkgb3RoZXIgc3BlY2lmaWMgZXJyb3JzIHRvIGJlIGZpbHRlcmVkIGJlbG93XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3IucmVxdWVzdCkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYnV0IG5vIHJlc3BvbnNlIHdhcyByZWNlaXZlZFxuICAgICAgICAgICAgICAgICAgICAgKiBgZXJyb3IucmVxdWVzdGAgaXMgYW4gaW5zdGFuY2Ugb2YgWE1MSHR0cFJlcXVlc3QgaW4gdGhlIGJyb3dzZXIgYW5kIGFuIGluc3RhbmNlIG9mXG4gICAgICAgICAgICAgICAgICAgICAqICBodHRwLkNsaWVudFJlcXVlc3QgaW4gbm9kZS5qcy5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBObyByZXNwb25zZSByZWNlaXZlZCB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gTW9vbmJlYW0gQVBJLCBmb3IgcmVxdWVzdCAke2Vycm9yLnJlcXVlc3R9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBTb21ldGhpbmcgaGFwcGVuZWQgaW4gc2V0dGluZyB1cCB0aGUgcmVxdWVzdCB0aGF0IHRyaWdnZXJlZCBhbiBFcnJvclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IGZvciB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgJHsoZXJyb3IgJiYgZXJyb3IubWVzc2FnZSkgJiYgZXJyb3IubWVzc2FnZX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGNyZWF0aW5nIGEgbmV3IHRyYW5zYWN0aW9uIHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJ9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdXNlZCB0byBnZXQgYWxsIHRyYW5zYWN0aW9ucywgZm9yIGEgcGFydGljdWxhciB1c2VyLCBmaWx0ZXJlZFxuICAgICAqIGJ5IHRoZWlyIHN0YXR1cy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBnZXRUcmFuc2FjdGlvbkJ5U3RhdHVzSW5wdXQgdGhlIHRyYW5zYWN0aW9uIGJ5IHN0YXR1cyBpbnB1dCBvYmplY3Qgb3QgYmUgcGFzc2VkIGluLFxuICAgICAqIGNvbnRhaW5pbmcgYWxsIHRoZSBuZWNlc3NhcnkgZmlsdGVyaW5nIGZvciByZXRyaWV2aW5nIHRoZSB0cmFuc2FjdGlvbnMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBhIHtAbGluayBNb29uYmVhbVRyYW5zYWN0aW9uc0J5U3RhdHVzUmVzcG9uc2V9IHJlcHJlc2VudGluZyB0aGUgdHJhbnNhY3Rpb25hbCBkYXRhLFxuICAgICAqIGZpbHRlcmVkIGJ5IHN0YXR1cyByZXNwb25zZVxuICAgICAqL1xuICAgIGFzeW5jIGdldFRyYW5zYWN0aW9uQnlTdGF0dXMoZ2V0VHJhbnNhY3Rpb25CeVN0YXR1c0lucHV0OiBHZXRUcmFuc2FjdGlvbkJ5U3RhdHVzSW5wdXQpOiBQcm9taXNlPE1vb25iZWFtVHJhbnNhY3Rpb25zQnlTdGF0dXNSZXNwb25zZT4ge1xuICAgICAgICAvLyBlYXNpbHkgaWRlbnRpZmlhYmxlIEFQSSBlbmRwb2ludCBpbmZvcm1hdGlvblxuICAgICAgICBjb25zdCBlbmRwb2ludEluZm8gPSAnZ2V0VHJhbnNhY3Rpb25CeVN0YXR1cyBRdWVyeSBNb29uYmVhbSBHcmFwaFFMIEFQSSc7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBBUEkgS2V5IGFuZCBCYXNlIFVSTCwgbmVlZGVkIGluIG9yZGVyIHRvIG1ha2UgdGhlIHRyYW5zYWN0aW9uIGJ5IHN0YXR1cyByZXRyaWV2YWwgY2FsbCB0aHJvdWdoIHRoZSBjbGllbnRcbiAgICAgICAgICAgIGNvbnN0IFttb29uYmVhbUJhc2VVUkwsIG1vb25iZWFtUHJpdmF0ZUtleV0gPSBhd2FpdCBzdXBlci5yZXRyaWV2ZVNlcnZpY2VDcmVkZW50aWFscyhDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5NT09OQkVBTV9JTlRFUk5BTF9TRUNSRVRfTkFNRSk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB3ZSBvYnRhaW5lZCBhbnkgaW52YWxpZCBzZWNyZXQgdmFsdWVzIGZyb20gdGhlIGNhbGwgYWJvdmVcbiAgICAgICAgICAgIGlmIChtb29uYmVhbUJhc2VVUkwgPT09IG51bGwgfHwgbW9vbmJlYW1CYXNlVVJMLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG1vb25iZWFtUHJpdmF0ZUtleSA9PT0gbnVsbCB8fCBtb29uYmVhbVByaXZhdGVLZXkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gXCJJbnZhbGlkIFNlY3JldHMgb2J0YWluZWQgZm9yIE1vb25iZWFtIEFQSSBjYWxsIVwiO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBnZXRUcmFuc2FjdGlvbkJ5U3RhdHVzIFF1ZXJ5XG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogYnVpbGQgdGhlIE1vb25iZWFtIEFwcFN5bmMgQVBJIEdyYXBoUUwgcXVlcnksIGFuZCBwZXJmb3JtIGEgUE9TVCB0byBpdCxcbiAgICAgICAgICAgICAqIHdpdGggdGhlIGFwcHJvcHJpYXRlIGluZm9ybWF0aW9uLlxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIHdlIGltcGx5IHRoYXQgaWYgdGhlIEFQSSBkb2VzIG5vdCByZXNwb25kIGluIDE1IHNlY29uZHMsIHRoZW4gd2UgYXV0b21hdGljYWxseSBjYXRjaCB0aGF0LCBhbmQgcmV0dXJuIGFuXG4gICAgICAgICAgICAgKiBlcnJvciBmb3IgYSBiZXR0ZXIgY3VzdG9tZXIgZXhwZXJpZW5jZS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgcmV0dXJuIGF4aW9zLnBvc3QoYCR7bW9vbmJlYW1CYXNlVVJMfWAsIHtcbiAgICAgICAgICAgICAgICBxdWVyeTogZ2V0VHJhbnNhY3Rpb25CeVN0YXR1cyxcbiAgICAgICAgICAgICAgICB2YXJpYWJsZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgZ2V0VHJhbnNhY3Rpb25CeVN0YXR1c0lucHV0OiBnZXRUcmFuc2FjdGlvbkJ5U3RhdHVzSW5wdXRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAgICAgXCJ4LWFwaS1rZXlcIjogbW9vbmJlYW1Qcml2YXRlS2V5XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiAxNTAwMCwgLy8gaW4gbWlsbGlzZWNvbmRzIGhlcmVcbiAgICAgICAgICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlOiAnTW9vbmJlYW0gQVBJIHRpbWVkIG91dCBhZnRlciAxNTAwMG1zISdcbiAgICAgICAgICAgIH0pLnRoZW4oZ2V0VHJhbnNhY3Rpb25CeVN0YXR1c1Jlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlbmRwb2ludEluZm99IHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZ2V0VHJhbnNhY3Rpb25CeVN0YXR1c1Jlc3BvbnNlLmRhdGEpfWApO1xuXG4gICAgICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIGRhdGEgYmxvY2sgZnJvbSB0aGUgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICBjb25zdCByZXNwb25zZURhdGEgPSAoZ2V0VHJhbnNhY3Rpb25CeVN0YXR1c1Jlc3BvbnNlICYmIGdldFRyYW5zYWN0aW9uQnlTdGF0dXNSZXNwb25zZS5kYXRhKSA/IGdldFRyYW5zYWN0aW9uQnlTdGF0dXNSZXNwb25zZS5kYXRhLmRhdGEgOiBudWxsO1xuXG4gICAgICAgICAgICAgICAgLy8gY2hlY2sgaWYgdGhlcmUgYXJlIGFueSBlcnJvcnMgaW4gdGhlIHJldHVybmVkIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlRGF0YSAmJiByZXNwb25zZURhdGEuZ2V0VHJhbnNhY3Rpb25CeVN0YXR1cy5lcnJvck1lc3NhZ2UgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuZWQgdGhlIHN1Y2Nlc3NmdWxseSByZXRyaWV2ZWQgdHJhbnNhY3Rpb25zIGZvciBhIGdpdmVuIHVzZXIsIGZpbHRlcmVkIGJ5IHRoZWlyIHN0YXR1c1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogcmVzcG9uc2VEYXRhLmdldFRyYW5zYWN0aW9uQnlTdGF0dXMuZGF0YSBhcyBNb29uYmVhbVRyYW5zYWN0aW9uQnlTdGF0dXNbXVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlRGF0YSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIGVycm9yIG1lc3NhZ2UgYW5kIHR5cGUsIGZyb20gdGhlIG9yaWdpbmFsIEFwcFN5bmMgY2FsbFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogcmVzcG9uc2VEYXRhLmdldFRyYW5zYWN0aW9uQnlTdGF0dXMuZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogcmVzcG9uc2VEYXRhLmdldFRyYW5zYWN0aW9uQnlTdGF0dXMuZXJyb3JUeXBlXG4gICAgICAgICAgICAgICAgICAgICAgICB9IDpcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgZXJyb3IgcmVzcG9uc2UgaW5kaWNhdGluZyBhbiBpbnZhbGlkIHN0cnVjdHVyZSByZXR1cm5lZFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogYEludmFsaWQgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gJHtlbmRwb2ludEluZm99IHJlc3BvbnNlIWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvci5yZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYW5kIHRoZSBzZXJ2ZXIgcmVzcG9uZGVkIHdpdGggYSBzdGF0dXMgY29kZVxuICAgICAgICAgICAgICAgICAgICAgKiB0aGF0IGZhbGxzIG91dCBvZiB0aGUgcmFuZ2Ugb2YgMnh4LlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vbiAyeHh4IHJlc3BvbnNlIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBNb29uYmVhbSBBUEksIHdpdGggc3RhdHVzICR7ZXJyb3IucmVzcG9uc2Uuc3RhdHVzfSwgYW5kIHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZXJyb3IucmVzcG9uc2UuZGF0YSl9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBhbnkgb3RoZXIgc3BlY2lmaWMgZXJyb3JzIHRvIGJlIGZpbHRlcmVkIGJlbG93XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3IucmVxdWVzdCkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYnV0IG5vIHJlc3BvbnNlIHdhcyByZWNlaXZlZFxuICAgICAgICAgICAgICAgICAgICAgKiBgZXJyb3IucmVxdWVzdGAgaXMgYW4gaW5zdGFuY2Ugb2YgWE1MSHR0cFJlcXVlc3QgaW4gdGhlIGJyb3dzZXIgYW5kIGFuIGluc3RhbmNlIG9mXG4gICAgICAgICAgICAgICAgICAgICAqICBodHRwLkNsaWVudFJlcXVlc3QgaW4gbm9kZS5qcy5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBObyByZXNwb25zZSByZWNlaXZlZCB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gTW9vbmJlYW0gQVBJLCBmb3IgcmVxdWVzdCAke2Vycm9yLnJlcXVlc3R9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBTb21ldGhpbmcgaGFwcGVuZWQgaW4gc2V0dGluZyB1cCB0aGUgcmVxdWVzdCB0aGF0IHRyaWdnZXJlZCBhbiBFcnJvclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IGZvciB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgJHsoZXJyb3IgJiYgZXJyb3IubWVzc2FnZSkgJiYgZXJyb3IubWVzc2FnZX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHJldHJpZXZpbmcgdHJhbnNhY3Rpb25zIGZvciBhIHBhcnRpY3VsYXIgdXNlciwgZmlsdGVyZWQgYnkgdGhlaXIgc3RhdHVzIHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJ9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdXNlZCB0byBnZXQgYWxsIHRyYW5zYWN0aW9ucywgZm9yIGEgcGFydGljdWxhciB1c2VyLlxuICAgICAqXG4gICAgICogQHBhcmFtIGdldFRyYW5zYWN0aW9uSW5wdXQgdGhlIHRyYW5zYWN0aW9uIGlucHV0IG9iamVjdCB0byBiZSBwYXNzZWQgaW4sXG4gICAgICogY29udGFpbmluZyBhbGwgdGhlIG5lY2Vzc2FyeSBmaWx0ZXJpbmcgZm9yIHJldHJpZXZpbmcgdGhlIHRyYW5zYWN0aW9ucyBmb3IgYSBwYXJ0aWN1bGFyIHVzZXIuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBhIHtAbGluayBNb29uYmVhbVRyYW5zYWN0aW9uc1Jlc3BvbnNlfSByZXByZXNlbnRpbmcgdGhlIHRyYW5zYWN0aW9uYWwgZGF0YS5cbiAgICAgKi9cbiAgICBhc3luYyBnZXRUcmFuc2FjdGlvbihnZXRUcmFuc2FjdGlvbklucHV0OiBHZXRUcmFuc2FjdGlvbklucHV0KTogUHJvbWlzZTxNb29uYmVhbVRyYW5zYWN0aW9uc1Jlc3BvbnNlPiB7XG4gICAgICAgIC8vIGVhc2lseSBpZGVudGlmaWFibGUgQVBJIGVuZHBvaW50IGluZm9ybWF0aW9uXG4gICAgICAgIGNvbnN0IGVuZHBvaW50SW5mbyA9ICdnZXRUcmFuc2FjdGlvbiBRdWVyeSBNb29uYmVhbSBHcmFwaFFMIEFQSSc7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBBUEkgS2V5IGFuZCBCYXNlIFVSTCwgbmVlZGVkIGluIG9yZGVyIHRvIG1ha2UgdGhlIHRyYW5zYWN0aW9uIHJldHJpZXZhbCBjYWxsIHRocm91Z2ggdGhlIGNsaWVudFxuICAgICAgICAgICAgY29uc3QgW21vb25iZWFtQmFzZVVSTCwgbW9vbmJlYW1Qcml2YXRlS2V5XSA9IGF3YWl0IHN1cGVyLnJldHJpZXZlU2VydmljZUNyZWRlbnRpYWxzKENvbnN0YW50cy5BV1NQYWlyQ29uc3RhbnRzLk1PT05CRUFNX0lOVEVSTkFMX1NFQ1JFVF9OQU1FKTtcblxuICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHdlIG9idGFpbmVkIGFueSBpbnZhbGlkIHNlY3JldCB2YWx1ZXMgZnJvbSB0aGUgY2FsbCBhYm92ZVxuICAgICAgICAgICAgaWYgKG1vb25iZWFtQmFzZVVSTCA9PT0gbnVsbCB8fCBtb29uYmVhbUJhc2VVUkwubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgbW9vbmJlYW1Qcml2YXRlS2V5ID09PSBudWxsIHx8IG1vb25iZWFtUHJpdmF0ZUtleS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBcIkludmFsaWQgU2VjcmV0cyBvYnRhaW5lZCBmb3IgTW9vbmJlYW0gQVBJIGNhbGwhXCI7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIGdldFRyYW5zYWN0aW9uIFF1ZXJ5XG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogYnVpbGQgdGhlIE1vb25iZWFtIEFwcFN5bmMgQVBJIEdyYXBoUUwgcXVlcnksIGFuZCBwZXJmb3JtIGEgUE9TVCB0byBpdCxcbiAgICAgICAgICAgICAqIHdpdGggdGhlIGFwcHJvcHJpYXRlIGluZm9ybWF0aW9uLlxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIHdlIGltcGx5IHRoYXQgaWYgdGhlIEFQSSBkb2VzIG5vdCByZXNwb25kIGluIDE1IHNlY29uZHMsIHRoZW4gd2UgYXV0b21hdGljYWxseSBjYXRjaCB0aGF0LCBhbmQgcmV0dXJuIGFuXG4gICAgICAgICAgICAgKiBlcnJvciBmb3IgYSBiZXR0ZXIgY3VzdG9tZXIgZXhwZXJpZW5jZS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgcmV0dXJuIGF4aW9zLnBvc3QoYCR7bW9vbmJlYW1CYXNlVVJMfWAsIHtcbiAgICAgICAgICAgICAgICBxdWVyeTogZ2V0VHJhbnNhY3Rpb24sXG4gICAgICAgICAgICAgICAgdmFyaWFibGVzOiB7XG4gICAgICAgICAgICAgICAgICAgIGdldFRyYW5zYWN0aW9uSW5wdXQ6IGdldFRyYW5zYWN0aW9uSW5wdXRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAgICAgXCJ4LWFwaS1rZXlcIjogbW9vbmJlYW1Qcml2YXRlS2V5XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiAxNTAwMCwgLy8gaW4gbWlsbGlzZWNvbmRzIGhlcmVcbiAgICAgICAgICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlOiAnTW9vbmJlYW0gQVBJIHRpbWVkIG91dCBhZnRlciAxNTAwMG1zISdcbiAgICAgICAgICAgIH0pLnRoZW4oZ2V0VHJhbnNhY3Rpb25zUmVzcG9uc2VzID0+IHtcbiAgICAgICAgICAgICAgICAvLyB3ZSBkb24ndCB3YW50IHRvIGxvZyB0aGlzIGluIGNhc2Ugb2Ygc3VjY2VzcyByZXNwb25zZXMsIGJlY2F1c2UgdGhlIHRyYW5zYWN0aW9uIHJlc3BvbnNlcyBhcmUgdmVyeSBsb25nIChmcnVnYWxpdHkpXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coYCR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGdldFRyYW5zYWN0aW9uc1Jlc3BvbnNlcy5kYXRhKX1gKTtcblxuICAgICAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBkYXRhIGJsb2NrIGZyb20gdGhlIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2VEYXRhID0gKGdldFRyYW5zYWN0aW9uc1Jlc3BvbnNlcyAmJiBnZXRUcmFuc2FjdGlvbnNSZXNwb25zZXMuZGF0YSkgPyBnZXRUcmFuc2FjdGlvbnNSZXNwb25zZXMuZGF0YS5kYXRhIDogbnVsbDtcblxuICAgICAgICAgICAgICAgIC8vIGNoZWNrIGlmIHRoZXJlIGFyZSBhbnkgZXJyb3JzIGluIHRoZSByZXR1cm5lZCByZXNwb25zZVxuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZURhdGEgJiYgcmVzcG9uc2VEYXRhLmdldFRyYW5zYWN0aW9uLmVycm9yTWVzc2FnZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm5lZCB0aGUgc3VjY2Vzc2Z1bGx5IHJldHJpZXZlZCB0cmFuc2FjdGlvbnMgZm9yIGEgZ2l2ZW4gdXNlclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogcmVzcG9uc2VEYXRhLmdldFRyYW5zYWN0aW9uLmRhdGEgYXMgTW9vbmJlYW1UcmFuc2FjdGlvbltdXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2VEYXRhID9cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgdHlwZSwgZnJvbSB0aGUgb3JpZ2luYWwgQXBwU3luYyBjYWxsXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiByZXNwb25zZURhdGEuZ2V0VHJhbnNhY3Rpb24uZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogcmVzcG9uc2VEYXRhLmdldFRyYW5zYWN0aW9uLmVycm9yVHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIGVycm9yIHJlc3BvbnNlIGluZGljYXRpbmcgYW4gaW52YWxpZCBzdHJ1Y3R1cmUgcmV0dXJuZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBJbnZhbGlkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tICR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSFgLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IucmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGFuZCB0aGUgc2VydmVyIHJlc3BvbmRlZCB3aXRoIGEgc3RhdHVzIGNvZGVcbiAgICAgICAgICAgICAgICAgICAgICogdGhhdCBmYWxscyBvdXQgb2YgdGhlIHJhbmdlIG9mIDJ4eC5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBOb24gMnh4eCByZXNwb25zZSB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gTW9vbmJlYW0gQVBJLCB3aXRoIHN0YXR1cyAke2Vycm9yLnJlc3BvbnNlLnN0YXR1c30sIGFuZCByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGVycm9yLnJlc3BvbnNlLmRhdGEpfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gYW55IG90aGVyIHNwZWNpZmljIGVycm9ycyB0byBiZSBmaWx0ZXJlZCBiZWxvd1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVycm9yLnJlcXVlc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGJ1dCBubyByZXNwb25zZSB3YXMgcmVjZWl2ZWRcbiAgICAgICAgICAgICAgICAgICAgICogYGVycm9yLnJlcXVlc3RgIGlzIGFuIGluc3RhbmNlIG9mIFhNTEh0dHBSZXF1ZXN0IGluIHRoZSBicm93c2VyIGFuZCBhbiBpbnN0YW5jZSBvZlxuICAgICAgICAgICAgICAgICAgICAgKiAgaHR0cC5DbGllbnRSZXF1ZXN0IGluIG5vZGUuanMuXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm8gcmVzcG9uc2UgcmVjZWl2ZWQgd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgZm9yIHJlcXVlc3QgJHtlcnJvci5yZXF1ZXN0fWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU29tZXRoaW5nIGhhcHBlbmVkIGluIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgdGhhdCB0cmlnZ2VyZWQgYW4gRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgc2V0dGluZyB1cCB0aGUgcmVxdWVzdCBmb3IgdGhlICR7ZW5kcG9pbnRJbmZvfSBNb29uYmVhbSBBUEksICR7KGVycm9yICYmIGVycm9yLm1lc3NhZ2UpICYmIGVycm9yLm1lc3NhZ2V9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSByZXRyaWV2aW5nIHRyYW5zYWN0aW9ucyBmb3IgYSBwYXJ0aWN1bGFyIHVzZXIsIHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJ9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdXNlZCB0byB1cGRhdGUgYW4gZXhpc3RpbmcgdHJhbnNhY3Rpb24ncyBkZXRhaWxzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHVwZGF0ZVRyYW5zYWN0aW9uSW5wdXQgdGhlIHRyYW5zYWN0aW9uIGRldGFpbHMgdG8gYmUgcGFzc2VkIGluLCBpbiBvcmRlciB0byB1cGRhdGVcbiAgICAgKiBhbiBleGlzdGluZyB0cmFuc2FjdGlvblxuICAgICAqXG4gICAgICogQHJldHVybnMgYSB7QGxpbmsgTW9vbmJlYW1VcGRhdGVkVHJhbnNhY3Rpb25SZXNwb25zZX0gcmVwcmVzZW50aW5nIHRoZSB1cGRhdGUgdHJhbnNhY3Rpb24nc1xuICAgICAqIGRhdGFcbiAgICAgKi9cbiAgICBhc3luYyB1cGRhdGVUcmFuc2FjdGlvbih1cGRhdGVUcmFuc2FjdGlvbklucHV0OiBVcGRhdGVUcmFuc2FjdGlvbklucHV0KTogUHJvbWlzZTxNb29uYmVhbVVwZGF0ZWRUcmFuc2FjdGlvblJlc3BvbnNlPiB7XG4gICAgICAgIC8vIGVhc2lseSBpZGVudGlmaWFibGUgQVBJIGVuZHBvaW50IGluZm9ybWF0aW9uXG4gICAgICAgIGNvbnN0IGVuZHBvaW50SW5mbyA9ICd1cGRhdGVUcmFuc2FjdGlvbiBNdXRhdGlvbiBNb29uYmVhbSBHcmFwaFFMIEFQSSc7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBBUEkgS2V5IGFuZCBCYXNlIFVSTCwgbmVlZGVkIGluIG9yZGVyIHRvIG1ha2UgdGhlIHRyYW5zYWN0aW9uIHVwZGF0ZWQgY2FsbCB0aHJvdWdoIHRoZSBjbGllbnRcbiAgICAgICAgICAgIGNvbnN0IFttb29uYmVhbUJhc2VVUkwsIG1vb25iZWFtUHJpdmF0ZUtleV0gPSBhd2FpdCBzdXBlci5yZXRyaWV2ZVNlcnZpY2VDcmVkZW50aWFscyhDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5NT09OQkVBTV9JTlRFUk5BTF9TRUNSRVRfTkFNRSk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB3ZSBvYnRhaW5lZCBhbnkgaW52YWxpZCBzZWNyZXQgdmFsdWVzIGZyb20gdGhlIGNhbGwgYWJvdmVcbiAgICAgICAgICAgIGlmIChtb29uYmVhbUJhc2VVUkwgPT09IG51bGwgfHwgbW9vbmJlYW1CYXNlVVJMLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG1vb25iZWFtUHJpdmF0ZUtleSA9PT0gbnVsbCB8fCBtb29uYmVhbVByaXZhdGVLZXkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gXCJJbnZhbGlkIFNlY3JldHMgb2J0YWluZWQgZm9yIE1vb25iZWFtIEFQSSBjYWxsIVwiO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiB1cGRhdGVUcmFuc2FjdGlvbiBRdWVyeVxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIGJ1aWxkIHRoZSBNb29uYmVhbSBBcHBTeW5jIEFQSSBHcmFwaFFMIHF1ZXJ5LCBhbmQgcGVyZm9ybSBhIFBPU1QgdG8gaXQsXG4gICAgICAgICAgICAgKiB3aXRoIHRoZSBhcHByb3ByaWF0ZSBpbmZvcm1hdGlvbi5cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiB3ZSBpbXBseSB0aGF0IGlmIHRoZSBBUEkgZG9lcyBub3QgcmVzcG9uZCBpbiAxNSBzZWNvbmRzLCB0aGVuIHdlIGF1dG9tYXRpY2FsbHkgY2F0Y2ggdGhhdCwgYW5kIHJldHVybiBhblxuICAgICAgICAgICAgICogZXJyb3IgZm9yIGEgYmV0dGVyIGN1c3RvbWVyIGV4cGVyaWVuY2UuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHJldHVybiBheGlvcy5wb3N0KGAke21vb25iZWFtQmFzZVVSTH1gLCB7XG4gICAgICAgICAgICAgICAgcXVlcnk6IHVwZGF0ZVRyYW5zYWN0aW9uLFxuICAgICAgICAgICAgICAgIHZhcmlhYmxlczoge1xuICAgICAgICAgICAgICAgICAgICB1cGRhdGVUcmFuc2FjdGlvbklucHV0OiB1cGRhdGVUcmFuc2FjdGlvbklucHV0XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgICAgIFwieC1hcGkta2V5XCI6IG1vb25iZWFtUHJpdmF0ZUtleVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGltZW91dDogMTUwMDAsIC8vIGluIG1pbGxpc2Vjb25kcyBoZXJlXG4gICAgICAgICAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZTogJ01vb25iZWFtIEFQSSB0aW1lZCBvdXQgYWZ0ZXIgMTUwMDBtcyEnXG4gICAgICAgICAgICB9KS50aGVuKHVwZGF0ZVRyYW5zYWN0aW9uUmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeSh1cGRhdGVUcmFuc2FjdGlvblJlc3BvbnNlLmRhdGEpfWApO1xuXG4gICAgICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIGRhdGEgYmxvY2sgZnJvbSB0aGUgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICBjb25zdCByZXNwb25zZURhdGEgPSAodXBkYXRlVHJhbnNhY3Rpb25SZXNwb25zZSAmJiB1cGRhdGVUcmFuc2FjdGlvblJlc3BvbnNlLmRhdGEpID8gdXBkYXRlVHJhbnNhY3Rpb25SZXNwb25zZS5kYXRhLmRhdGEgOiBudWxsO1xuXG4gICAgICAgICAgICAgICAgLy8gY2hlY2sgaWYgdGhlcmUgYXJlIGFueSBlcnJvcnMgaW4gdGhlIHJldHVybmVkIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlRGF0YSAmJiByZXNwb25zZURhdGEudXBkYXRlVHJhbnNhY3Rpb24uZXJyb3JNZXNzYWdlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHJldHVybmVkIHRoZSBzdWNjZXNzZnVsbHkgdXBkYXRlZCB0cmFuc2FjdGlvbmFsIGluZm9ybWF0aW9uXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiByZXNwb25zZURhdGEudXBkYXRlVHJhbnNhY3Rpb24uZGF0YSBhcyBNb29uYmVhbVVwZGF0ZWRUcmFuc2FjdGlvblxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlRGF0YSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIGVycm9yIG1lc3NhZ2UgYW5kIHR5cGUsIGZyb20gdGhlIG9yaWdpbmFsIEFwcFN5bmMgY2FsbFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogcmVzcG9uc2VEYXRhLnVwZGF0ZVRyYW5zYWN0aW9uLmVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IHJlc3BvbnNlRGF0YS51cGRhdGVUcmFuc2FjdGlvbi5lcnJvclR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gOlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBlcnJvciByZXNwb25zZSBpbmRpY2F0aW5nIGFuIGludmFsaWQgc3RydWN0dXJlIHJldHVybmVkXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgSW52YWxpZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UhYCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yLnJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBhbmQgdGhlIHNlcnZlciByZXNwb25kZWQgd2l0aCBhIHN0YXR1cyBjb2RlXG4gICAgICAgICAgICAgICAgICAgICAqIHRoYXQgZmFsbHMgb3V0IG9mIHRoZSByYW5nZSBvZiAyeHguXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm9uIDJ4eHggcmVzcG9uc2Ugd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgd2l0aCBzdGF0dXMgJHtlcnJvci5yZXNwb25zZS5zdGF0dXN9LCBhbmQgcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShlcnJvci5yZXNwb25zZS5kYXRhKX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGFueSBvdGhlciBzcGVjaWZpYyBlcnJvcnMgdG8gYmUgZmlsdGVyZWQgYmVsb3dcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5yZXF1ZXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBidXQgbm8gcmVzcG9uc2Ugd2FzIHJlY2VpdmVkXG4gICAgICAgICAgICAgICAgICAgICAqIGBlcnJvci5yZXF1ZXN0YCBpcyBhbiBpbnN0YW5jZSBvZiBYTUxIdHRwUmVxdWVzdCBpbiB0aGUgYnJvd3NlciBhbmQgYW4gaW5zdGFuY2Ugb2ZcbiAgICAgICAgICAgICAgICAgICAgICogIGh0dHAuQ2xpZW50UmVxdWVzdCBpbiBub2RlLmpzLlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vIHJlc3BvbnNlIHJlY2VpdmVkIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBNb29uYmVhbSBBUEksIGZvciByZXF1ZXN0ICR7ZXJyb3IucmVxdWVzdH1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNvbWV0aGluZyBoYXBwZW5lZCBpbiBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IHRoYXQgdHJpZ2dlcmVkIGFuIEVycm9yXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgZm9yIHRoZSAke2VuZHBvaW50SW5mb30gTW9vbmJlYW0gQVBJLCAkeyhlcnJvciAmJiBlcnJvci5tZXNzYWdlKSAmJiBlcnJvci5tZXNzYWdlfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgdXBkYXRpbmcgdHJhbnNhY3Rpb25hbCBkYXRhLCB0aHJvdWdoICR7ZW5kcG9pbnRJbmZvfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9ICR7ZXJyfWApO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHVzZWQgdG8gY3JlYXRlIGEgbm90aWZpY2F0aW9uLlxuICAgICAqXG4gICAgICogQHBhcmFtIGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0IHRoZSBub3RpZmljYXRpb24gZGV0YWlscyB0byBiZSBwYXNzZWQgaW4sIGluIG9yZGVyIHRvIGNyZWF0ZSBhIG5ld1xuICAgICAqIG5vdGlmaWNhdGlvblxuICAgICAqXG4gICAgICogQHJldHVybnMgYSB7QGxpbmsgQ3JlYXRlTm90aWZpY2F0aW9uUmVzcG9uc2V9IHJlcHJlc2VudGluZyB0aGUgbmV3bHkgY3JlYXRlZCBub3RpZmljYXRpb24gZGF0YVxuICAgICAqL1xuICAgIGFzeW5jIGNyZWF0ZU5vdGlmaWNhdGlvbihjcmVhdGVOb3RpZmljYXRpb25JbnB1dDogQ3JlYXRlTm90aWZpY2F0aW9uSW5wdXQpOiBQcm9taXNlPENyZWF0ZU5vdGlmaWNhdGlvblJlc3BvbnNlPiB7XG4gICAgICAgIC8vIGVhc2lseSBpZGVudGlmaWFibGUgQVBJIGVuZHBvaW50IGluZm9ybWF0aW9uXG4gICAgICAgIGNvbnN0IGVuZHBvaW50SW5mbyA9ICdjcmVhdGVOb3RpZmljYXRpb24gTXV0YXRpb24gTW9vbmJlYW0gR3JhcGhRTCBBUEknO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgQVBJIEtleSBhbmQgQmFzZSBVUkwsIG5lZWRlZCBpbiBvcmRlciB0byBtYWtlIGEgbm90aWZpY2F0aW9uIGNyZWF0aW9uIGNhbGwgdGhyb3VnaCB0aGUgY2xpZW50XG4gICAgICAgICAgICBjb25zdCBbbW9vbmJlYW1CYXNlVVJMLCBtb29uYmVhbVByaXZhdGVLZXldID0gYXdhaXQgc3VwZXIucmV0cmlldmVTZXJ2aWNlQ3JlZGVudGlhbHMoQ29uc3RhbnRzLkFXU1BhaXJDb25zdGFudHMuTU9PTkJFQU1fSU5URVJOQUxfU0VDUkVUX05BTUUpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgd2Ugb2J0YWluZWQgYW55IGludmFsaWQgc2VjcmV0IHZhbHVlcyBmcm9tIHRoZSBjYWxsIGFib3ZlXG4gICAgICAgICAgICBpZiAobW9vbmJlYW1CYXNlVVJMID09PSBudWxsIHx8IG1vb25iZWFtQmFzZVVSTC5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBtb29uYmVhbVByaXZhdGVLZXkgPT09IG51bGwgfHwgbW9vbmJlYW1Qcml2YXRlS2V5Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IFwiSW52YWxpZCBTZWNyZXRzIG9idGFpbmVkIGZvciBNb29uYmVhbSBBUEkgY2FsbCFcIjtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIGNyZWF0ZU5vdGlmaWNhdGlvbiBRdWVyeVxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIGJ1aWxkIHRoZSBNb29uYmVhbSBBcHBTeW5jIEFQSSBHcmFwaFFMIHF1ZXJ5LCBhbmQgcGVyZm9ybSBhIFBPU1QgdG8gaXQsXG4gICAgICAgICAgICAgKiB3aXRoIHRoZSBhcHByb3ByaWF0ZSBpbmZvcm1hdGlvbi5cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiB3ZSBpbXBseSB0aGF0IGlmIHRoZSBBUEkgZG9lcyBub3QgcmVzcG9uZCBpbiAxNSBzZWNvbmRzLCB0aGVuIHdlIGF1dG9tYXRpY2FsbHkgY2F0Y2ggdGhhdCwgYW5kIHJldHVybiBhblxuICAgICAgICAgICAgICogZXJyb3IgZm9yIGEgYmV0dGVyIGN1c3RvbWVyIGV4cGVyaWVuY2UuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHJldHVybiBheGlvcy5wb3N0KGAke21vb25iZWFtQmFzZVVSTH1gLCB7XG4gICAgICAgICAgICAgICAgcXVlcnk6IGNyZWF0ZU5vdGlmaWNhdGlvbixcbiAgICAgICAgICAgICAgICB2YXJpYWJsZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQ6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgICAgIFwieC1hcGkta2V5XCI6IG1vb25iZWFtUHJpdmF0ZUtleVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGltZW91dDogMTUwMDAsIC8vIGluIG1pbGxpc2Vjb25kcyBoZXJlXG4gICAgICAgICAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZTogJ01vb25iZWFtIEFQSSB0aW1lZCBvdXQgYWZ0ZXIgMTUwMDBtcyEnXG4gICAgICAgICAgICB9KS50aGVuKGNyZWF0ZU5vdGlmaWNhdGlvblJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlbmRwb2ludEluZm99IHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoY3JlYXRlTm90aWZpY2F0aW9uUmVzcG9uc2UuZGF0YSl9YCk7XG5cbiAgICAgICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgZGF0YSBibG9jayBmcm9tIHRoZSByZXNwb25zZVxuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlRGF0YSA9IChjcmVhdGVOb3RpZmljYXRpb25SZXNwb25zZSAmJiBjcmVhdGVOb3RpZmljYXRpb25SZXNwb25zZS5kYXRhKSA/IGNyZWF0ZU5vdGlmaWNhdGlvblJlc3BvbnNlLmRhdGEuZGF0YSA6IG51bGw7XG5cbiAgICAgICAgICAgICAgICAvLyBjaGVjayBpZiB0aGVyZSBhcmUgYW55IGVycm9ycyBpbiB0aGUgcmV0dXJuZWQgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2VEYXRhICYmIHJlc3BvbnNlRGF0YS5jcmVhdGVOb3RpZmljYXRpb24uZXJyb3JNZXNzYWdlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHJldHVybmVkIHRoZSBzdWNjZXNzZnVsbHkgY3JlYXRlZCBub3RpZmljYXRpb25cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiByZXNwb25zZURhdGEuY3JlYXRlTm90aWZpY2F0aW9uLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogcmVzcG9uc2VEYXRhLmNyZWF0ZU5vdGlmaWNhdGlvbi5kYXRhIGFzIE5vdGlmaWNhdGlvblxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlRGF0YSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIGVycm9yIG1lc3NhZ2UgYW5kIHR5cGUsIGZyb20gdGhlIG9yaWdpbmFsIEFwcFN5bmMgY2FsbFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogcmVzcG9uc2VEYXRhLmNyZWF0ZU5vdGlmaWNhdGlvbi5lcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiByZXNwb25zZURhdGEuY3JlYXRlTm90aWZpY2F0aW9uLmVycm9yVHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIGVycm9yIHJlc3BvbnNlIGluZGljYXRpbmcgYW4gaW52YWxpZCBzdHJ1Y3R1cmUgcmV0dXJuZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBJbnZhbGlkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tICR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSFgLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yLnJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBhbmQgdGhlIHNlcnZlciByZXNwb25kZWQgd2l0aCBhIHN0YXR1cyBjb2RlXG4gICAgICAgICAgICAgICAgICAgICAqIHRoYXQgZmFsbHMgb3V0IG9mIHRoZSByYW5nZSBvZiAyeHguXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm9uIDJ4eHggcmVzcG9uc2Ugd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgd2l0aCBzdGF0dXMgJHtlcnJvci5yZXNwb25zZS5zdGF0dXN9LCBhbmQgcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShlcnJvci5yZXNwb25zZS5kYXRhKX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGFueSBvdGhlciBzcGVjaWZpYyBlcnJvcnMgdG8gYmUgZmlsdGVyZWQgYmVsb3dcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3IucmVxdWVzdCkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYnV0IG5vIHJlc3BvbnNlIHdhcyByZWNlaXZlZFxuICAgICAgICAgICAgICAgICAgICAgKiBgZXJyb3IucmVxdWVzdGAgaXMgYW4gaW5zdGFuY2Ugb2YgWE1MSHR0cFJlcXVlc3QgaW4gdGhlIGJyb3dzZXIgYW5kIGFuIGluc3RhbmNlIG9mXG4gICAgICAgICAgICAgICAgICAgICAqICBodHRwLkNsaWVudFJlcXVlc3QgaW4gbm9kZS5qcy5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBObyByZXNwb25zZSByZWNlaXZlZCB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gTW9vbmJlYW0gQVBJLCBmb3IgcmVxdWVzdCAke2Vycm9yLnJlcXVlc3R9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU29tZXRoaW5nIGhhcHBlbmVkIGluIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgdGhhdCB0cmlnZ2VyZWQgYW4gRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgc2V0dGluZyB1cCB0aGUgcmVxdWVzdCBmb3IgdGhlICR7ZW5kcG9pbnRJbmZvfSBNb29uYmVhbSBBUEksICR7KGVycm9yICYmIGVycm9yLm1lc3NhZ2UpICYmIGVycm9yLm1lc3NhZ2V9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgY3JlYXRpbmcgYSBub3RpZmljYXRpb24sIHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJ9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHVzZWQgdG8gZ2V0IGFsbCB0aGUgcGh5c2ljYWwgZGV2aWNlcyBhc3NvY2lhdGVkIHdpdGggYSBwYXJ0aWN1bGFyIHVzZXIuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZ2V0RGV2aWNlc0ZvclVzZXJJbnB1dCB0aGUgZGV2aWNlcyBmb3IgdXNlciBpbnB1dCwgY29udGFpbmluZyB0aGUgZmlsdGVyaW5nIGluZm9ybWF0aW9uXG4gICAgICogdXNlZCB0byByZXRyaWV2ZSBhbGwgdGhlIHBoeXNpY2FsIGRldmljZXMgZm9yIGEgcGFydGljdWxhciB1c2VyLlxuICAgICAqXG4gICAgICogQHJldHVybnMgYSB7QGxpbmsgVXNlckRldmljZXNSZXNwb25zZX0gcmVwcmVzZW50aW5nIHRoZSBtYXRjaGVkIHBoeXNpY2FsIGRldmljZXMnIGluZm9ybWF0aW9uLlxuICAgICAqL1xuICAgIGFzeW5jIGdldERldmljZXNGb3JVc2VyKGdldERldmljZXNGb3JVc2VySW5wdXQ6IEdldERldmljZXNGb3JVc2VySW5wdXQpOiBQcm9taXNlPFVzZXJEZXZpY2VzUmVzcG9uc2U+IHtcbiAgICAgICAgLy8gZWFzaWx5IGlkZW50aWZpYWJsZSBBUEkgZW5kcG9pbnQgaW5mb3JtYXRpb25cbiAgICAgICAgY29uc3QgZW5kcG9pbnRJbmZvID0gJ2dldERldmljZXNGb3JVc2VyIFF1ZXJ5IE1vb25iZWFtIEdyYXBoUUwgQVBJJztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIEFQSSBLZXkgYW5kIEJhc2UgVVJMLCBuZWVkZWQgaW4gb3JkZXIgdG8gbWFrZSB0aGUgZGV2aWNlcyBmb3IgdXNlciByZXRyaWV2YWwgY2FsbCB0aHJvdWdoIHRoZSBjbGllbnRcbiAgICAgICAgICAgIGNvbnN0IFttb29uYmVhbUJhc2VVUkwsIG1vb25iZWFtUHJpdmF0ZUtleV0gPSBhd2FpdCBzdXBlci5yZXRyaWV2ZVNlcnZpY2VDcmVkZW50aWFscyhDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5NT09OQkVBTV9JTlRFUk5BTF9TRUNSRVRfTkFNRSk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB3ZSBvYnRhaW5lZCBhbnkgaW52YWxpZCBzZWNyZXQgdmFsdWVzIGZyb20gdGhlIGNhbGwgYWJvdmVcbiAgICAgICAgICAgIGlmIChtb29uYmVhbUJhc2VVUkwgPT09IG51bGwgfHwgbW9vbmJlYW1CYXNlVVJMLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG1vb25iZWFtUHJpdmF0ZUtleSA9PT0gbnVsbCB8fCBtb29uYmVhbVByaXZhdGVLZXkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gXCJJbnZhbGlkIFNlY3JldHMgb2J0YWluZWQgZm9yIE1vb25iZWFtIEFQSSBjYWxsIVwiO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBVc2VyRGV2aWNlRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogZ2V0RGV2aWNlc0ZvclVzZXIgUXVlcnlcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBidWlsZCB0aGUgTW9vbmJlYW0gQXBwU3luYyBBUEkgR3JhcGhRTCBxdWVyeSwgYW5kIHBlcmZvcm0gYSBQT1NUIHRvIGl0LFxuICAgICAgICAgICAgICogd2l0aCB0aGUgYXBwcm9wcmlhdGUgaW5mb3JtYXRpb24uXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogd2UgaW1wbHkgdGhhdCBpZiB0aGUgQVBJIGRvZXMgbm90IHJlc3BvbmQgaW4gMTUgc2Vjb25kcywgdGhlbiB3ZSBhdXRvbWF0aWNhbGx5IGNhdGNoIHRoYXQsIGFuZCByZXR1cm4gYW5cbiAgICAgICAgICAgICAqIGVycm9yIGZvciBhIGJldHRlciBjdXN0b21lciBleHBlcmllbmNlLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICByZXR1cm4gYXhpb3MucG9zdChgJHttb29uYmVhbUJhc2VVUkx9YCwge1xuICAgICAgICAgICAgICAgIHF1ZXJ5OiBnZXREZXZpY2VzRm9yVXNlcixcbiAgICAgICAgICAgICAgICB2YXJpYWJsZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgZ2V0RGV2aWNlc0ZvclVzZXJJbnB1dDogZ2V0RGV2aWNlc0ZvclVzZXJJbnB1dFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgICAgICBcIngtYXBpLWtleVwiOiBtb29uYmVhbVByaXZhdGVLZXlcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDE1MDAwLCAvLyBpbiBtaWxsaXNlY29uZHMgaGVyZVxuICAgICAgICAgICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2U6ICdNb29uYmVhbSBBUEkgdGltZWQgb3V0IGFmdGVyIDE1MDAwbXMhJ1xuICAgICAgICAgICAgfSkudGhlbihnZXREZXZpY2VzRm9yVXNlclJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlbmRwb2ludEluZm99IHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZ2V0RGV2aWNlc0ZvclVzZXJSZXNwb25zZS5kYXRhKX1gKTtcblxuICAgICAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBkYXRhIGJsb2NrIGZyb20gdGhlIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2VEYXRhID0gKGdldERldmljZXNGb3JVc2VyUmVzcG9uc2UgJiYgZ2V0RGV2aWNlc0ZvclVzZXJSZXNwb25zZS5kYXRhKSA/IGdldERldmljZXNGb3JVc2VyUmVzcG9uc2UuZGF0YS5kYXRhIDogbnVsbDtcblxuICAgICAgICAgICAgICAgIC8vIGNoZWNrIGlmIHRoZXJlIGFyZSBhbnkgZXJyb3JzIGluIHRoZSByZXR1cm5lZCByZXNwb25zZVxuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZURhdGEgJiYgcmVzcG9uc2VEYXRhLmdldERldmljZXNGb3JVc2VyLmVycm9yTWVzc2FnZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm5lZCB0aGUgc3VjY2Vzc2Z1bGx5IHJldHJpZXZlZCBwaHlzaWNhbCBkZXZpY2VzIGZvciBhIGdpdmVuIHVzZXJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHJlc3BvbnNlRGF0YS5nZXREZXZpY2VzRm9yVXNlci5kYXRhIGFzIFB1c2hEZXZpY2VbXVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlRGF0YSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIGVycm9yIG1lc3NhZ2UgYW5kIHR5cGUsIGZyb20gdGhlIG9yaWdpbmFsIEFwcFN5bmMgY2FsbFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogcmVzcG9uc2VEYXRhLmdldERldmljZXNGb3JVc2VyLmVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IHJlc3BvbnNlRGF0YS5nZXREZXZpY2VzRm9yVXNlci5lcnJvclR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gOlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBlcnJvciByZXNwb25zZSBpbmRpY2F0aW5nIGFuIGludmFsaWQgc3RydWN0dXJlIHJldHVybmVkXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgSW52YWxpZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UhYCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFVzZXJEZXZpY2VFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvci5yZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYW5kIHRoZSBzZXJ2ZXIgcmVzcG9uZGVkIHdpdGggYSBzdGF0dXMgY29kZVxuICAgICAgICAgICAgICAgICAgICAgKiB0aGF0IGZhbGxzIG91dCBvZiB0aGUgcmFuZ2Ugb2YgMnh4LlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vbiAyeHh4IHJlc3BvbnNlIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBNb29uYmVhbSBBUEksIHdpdGggc3RhdHVzICR7ZXJyb3IucmVzcG9uc2Uuc3RhdHVzfSwgYW5kIHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZXJyb3IucmVzcG9uc2UuZGF0YSl9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBhbnkgb3RoZXIgc3BlY2lmaWMgZXJyb3JzIHRvIGJlIGZpbHRlcmVkIGJlbG93XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVXNlckRldmljZUVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVycm9yLnJlcXVlc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGJ1dCBubyByZXNwb25zZSB3YXMgcmVjZWl2ZWRcbiAgICAgICAgICAgICAgICAgICAgICogYGVycm9yLnJlcXVlc3RgIGlzIGFuIGluc3RhbmNlIG9mIFhNTEh0dHBSZXF1ZXN0IGluIHRoZSBicm93c2VyIGFuZCBhbiBpbnN0YW5jZSBvZlxuICAgICAgICAgICAgICAgICAgICAgKiAgaHR0cC5DbGllbnRSZXF1ZXN0IGluIG5vZGUuanMuXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm8gcmVzcG9uc2UgcmVjZWl2ZWQgd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgZm9yIHJlcXVlc3QgJHtlcnJvci5yZXF1ZXN0fWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBVc2VyRGV2aWNlRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNvbWV0aGluZyBoYXBwZW5lZCBpbiBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IHRoYXQgdHJpZ2dlcmVkIGFuIEVycm9yXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgZm9yIHRoZSAke2VuZHBvaW50SW5mb30gTW9vbmJlYW0gQVBJLCAkeyhlcnJvciAmJiBlcnJvci5tZXNzYWdlKSAmJiBlcnJvci5tZXNzYWdlfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBVc2VyRGV2aWNlRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHJldHJpZXZpbmcgcGh5c2ljYWwgZGV2aWNlcyBmb3IgYSBwYXJ0aWN1bGFyIHVzZXIsIHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJ9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBVc2VyRGV2aWNlRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==