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
     * Function used to get the notification assets for a particular user.
     *
     * @param getUserNotificationAssetsInput input passed in, which will be used in retrieving the notifications
     * assets for the user accordingly.
     *
     * @returns a {@link UserNotificationAssetsResponse}, representing the retrieved notification assets, if any applicable.
     */
    async getUserNotificationAssets(getUserNotificationAssetsInput) {
        // easily identifiable API endpoint information
        const endpointInfo = 'getUserNotificationAssets Query Moonbeam GraphQL API';
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
             * getUserNotificationAssets Query
             *
             * build the Moonbeam AppSync API GraphQL query, and perform a POST to it,
             * with the appropriate information.
             *
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            return axios_1.default.post(`${moonbeamBaseURL}`, {
                query: Queries_1.getUserNotificationAssets,
                variables: {
                    getUserNotificationAssetsInput: getUserNotificationAssetsInput
                }
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": moonbeamPrivateKey
                },
                timeout: 15000,
                timeoutErrorMessage: 'Moonbeam API timed out after 15000ms!'
            }).then(getUserNotificationAssetsResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(getUserNotificationAssetsResponse.data)}`);
                // retrieve the data block from the response
                const responseData = (getUserNotificationAssetsResponse && getUserNotificationAssetsResponse.data)
                    ? getUserNotificationAssetsResponse.data.data
                    : null;
                // check if there are any errors in the returned response
                if (responseData && responseData.getUserNotificationAssets.errorMessage === null) {
                    // returned the successfully retrieved notification assets
                    return {
                        data: responseData.getUserNotificationAssets.data
                    };
                }
                else {
                    return responseData ?
                        // return the error message and type, from the original AppSync call
                        {
                            errorMessage: responseData.getUserNotificationAssets.errorMessage,
                            errorType: responseData.getUserNotificationAssets.errorType
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
            const errorMessage = `Unexpected error while retrieving user notification assets through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                errorMessage: errorMessage,
                errorType: GraphqlExports_1.NotificationsErrorType.UnexpectedError
            };
        }
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
                    // returned the successfully retrieved notification
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
     * Function used to get all the users ineligible for a reimbursement.
     *
     * @returns a {@link UserForNotificationReminderResponse}, representing each individual users'
     * user ID, first, last name and email.
     *
     * @protected
     */
    async getAllUsersIneligibleForReimbursements() {
        // easily identifiable API endpoint information
        const endpointInfo = 'getAllUsersIneligibleForReimbursements Query Moonbeam GraphQL API';
        try {
            // retrieve the API Key and Base URL, needed in order to make the get all users ineligible for reimbursements retrieval call through the client
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
             * getAllUsersIneligibleForReimbursements Query
             *
             * build the Moonbeam AppSync API GraphQL query, and perform a POST to it,
             * with the appropriate information.
             *
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            return axios_1.default.post(`${moonbeamBaseURL}`, {
                query: Queries_1.getAllUsersIneligibleForReimbursements,
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": moonbeamPrivateKey
                },
                timeout: 15000,
                timeoutErrorMessage: 'Moonbeam API timed out after 15000ms!'
            }).then(getAllUsersIneligibleForReimbursementsResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(getAllUsersIneligibleForReimbursementsResponse.data)}`);
                // retrieve the data block from the response
                const responseData = (getAllUsersIneligibleForReimbursementsResponse && getAllUsersIneligibleForReimbursementsResponse.data) ? getAllUsersIneligibleForReimbursementsResponse.data.data : null;
                // check if there are any errors in the returned response
                if (responseData && responseData.getAllUsersIneligibleForReimbursements.errorMessage === null) {
                    // returned the successfully retrieved users
                    return {
                        data: responseData.getAllUsersIneligibleForReimbursements.data
                    };
                }
                else {
                    return responseData ?
                        // return the error message and type, from the original AppSync call
                        {
                            errorMessage: responseData.getAllUsersIneligibleForReimbursements.errorMessage,
                            errorType: responseData.getAllUsersIneligibleForReimbursements.errorType
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
            const errorMessage = `Unexpected error while retrieving users ineligible for reimbursements by status through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                errorMessage: errorMessage,
                errorType: GraphqlExports_1.NotificationReminderErrorType.UnexpectedError
            };
        }
    }
    /**
     * Function used to get all the users eligible for a reimbursement.
     *
     * @returns a {@link UserForNotificationReminderResponse}, representing each individual users'
     * user ID, first, last name and email.
     */
    async getAllUsersEligibleForReimbursements() {
        // easily identifiable API endpoint information
        const endpointInfo = 'getAllUsersEligibleForReimbursements Query Moonbeam GraphQL API';
        try {
            // retrieve the API Key and Base URL, needed in order to make the get all users eligible for reimbursements retrieval call through the client
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
             * getAllUsersEligibleForReimbursements Query
             *
             * build the Moonbeam AppSync API GraphQL query, and perform a POST to it,
             * with the appropriate information.
             *
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            return axios_1.default.post(`${moonbeamBaseURL}`, {
                query: Queries_1.getAllUsersEligibleForReimbursements,
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": moonbeamPrivateKey
                },
                timeout: 15000,
                timeoutErrorMessage: 'Moonbeam API timed out after 15000ms!'
            }).then(getAllUsersEligibleForReimbursementsResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(getAllUsersEligibleForReimbursementsResponse.data)}`);
                // retrieve the data block from the response
                const responseData = (getAllUsersEligibleForReimbursementsResponse && getAllUsersEligibleForReimbursementsResponse.data) ? getAllUsersEligibleForReimbursementsResponse.data.data : null;
                // check if there are any errors in the returned response
                if (responseData && responseData.getAllUsersEligibleForReimbursements.errorMessage === null) {
                    // returned the successfully retrieved users
                    return {
                        data: responseData.getAllUsersEligibleForReimbursements.data
                    };
                }
                else {
                    return responseData ?
                        // return the error message and type, from the original AppSync call
                        {
                            errorMessage: responseData.getAllUsersEligibleForReimbursements.errorMessage,
                            errorType: responseData.getAllUsersEligibleForReimbursements.errorType
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
            const errorMessage = `Unexpected error while retrieving users eligible for reimbursements by status through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                errorMessage: errorMessage,
                errorType: GraphqlExports_1.NotificationReminderErrorType.UnexpectedError
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
     * Function used to get a user's email, given their custom user:id.
     *
     * @param userId the user id to be passed in, used to retrieve someone's email
     *
     * @returns a {@link EmailFromCognitoResponse} representing the user's email obtained
     * from Cognito.
     */
    async getEmailByUserId(userId) {
        // easily identifiable API endpoint information
        const endpointInfo = '/listUsers for getEmailByUserId Cognito SDK call';
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
             * execute thew List Users command, without any filters, in order to retrieve a user's email given their custom user ID,
             * from their attributes.
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
                let matchedEmail = null;
                let noOfMatches = 0;
                userResults.forEach(cognitoUser => {
                    if (cognitoUser.Attributes !== undefined && cognitoUser.Attributes.length === 2 &&
                        cognitoUser.Attributes[0] !== undefined && cognitoUser.Attributes[0].Value.length !== 0 &&
                        cognitoUser.Attributes[1] !== undefined && cognitoUser.Attributes[1].Value.length !== 0) {
                        // make sure that there if there is a matched user, then we will set the matched email accordingly
                        if (cognitoUser.Attributes[1].Value.trim() === userId.trim()) {
                            matchedEmail = cognitoUser.Attributes[0].Value;
                            noOfMatches += 1;
                        }
                    }
                });
                if (noOfMatches === 1) {
                    return {
                        data: matchedEmail
                    };
                }
                else {
                    const errorMessage = `Couldn't find user in Cognito with user id = ${userId}`;
                    console.log(`${errorMessage}`);
                    return {
                        data: null,
                        errorType: GraphqlExports_1.NotificationsErrorType.ValidationError,
                        errorMessage: errorMessage
                    };
                }
            }
            else {
                const errorMessage = `Empty user list array, obtained while calling the get List Users Cognito command`;
                console.log(`${errorMessage}`);
                return {
                    errorType: GraphqlExports_1.NotificationsErrorType.NoneOrAbsent,
                    errorMessage: errorMessage
                };
            }
        }
        catch (err) {
            const errorMessage = `Unexpected error while retrieving email given id for user from Cognito through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                data: null,
                errorType: GraphqlExports_1.NotificationsErrorType.UnexpectedError,
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
     * Function used to get all transactions, in a particular time range.
     *
     * @param getTransactionsInRangeInput the transaction in range input object to be passed in,
     * containing all the necessary filtering for retrieving the transactions in a particular time range.
     *
     * @returns a {@link MoonbeamTransactionsResponse} representing the transactional data.
     *
     * @protected
     */
    async getTransactionsInRange(getTransactionsInRangeInput) {
        // easily identifiable API endpoint information
        const endpointInfo = 'getTransactionsInRange Query Moonbeam GraphQL API';
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
             * getTransactionsInRange Query
             *
             * build the Moonbeam AppSync API GraphQL query, and perform a POST to it,
             * with the appropriate information.
             *
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            return axios_1.default.post(`${moonbeamBaseURL}`, {
                query: Queries_1.getTransactionsInRange,
                variables: {
                    getTransactionsInRangeInput: getTransactionsInRangeInput
                }
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": moonbeamPrivateKey
                },
                timeout: 15000,
                timeoutErrorMessage: 'Moonbeam API timed out after 15000ms!'
            }).then(getTransactionsInRangeResponse => {
                // we don't want to log this in case of success responses, because the transaction responses are very long (frugality)
                // console.log(`${endpointInfo} response ${JSON.stringify(getTransactionsResponses.data)}`);
                // retrieve the data block from the response
                const responseData = (getTransactionsInRangeResponse && getTransactionsInRangeResponse.data) ? getTransactionsInRangeResponse.data.data : null;
                // check if there are any errors in the returned response
                if (responseData && responseData.getTransactionsInRange.errorMessage === null) {
                    // returned the successfully retrieved transactions for a given user
                    return {
                        data: responseData.getTransactionsInRange.data
                    };
                }
                else {
                    return responseData ?
                        // return the error message and type, from the original AppSync call
                        {
                            errorMessage: responseData.getTransactionsInRange.errorMessage,
                            errorType: responseData.getTransactionsInRange.errorType
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
            const errorMessage = `Unexpected error while retrieving transactions for a particular time range, through ${endpointInfo}`;
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
             * updateTransaction Mutation
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
     * Function used to create a bulk notification.
     *
     * @param createBulkNotificationInput the bulk notification details to be passed in, in order to create a new
     * bulk notification
     *
     * @returns a {@link CreateBulkNotificationResponse} representing the newly created bulk notification data
     */
    async createBulkNotification(createBulkNotificationInput) {
        // easily identifiable API endpoint information
        const endpointInfo = 'createBulkNotification Mutation Moonbeam GraphQL API';
        try {
            // retrieve the API Key and Base URL, needed in order to make a bulk notification creation call through the client
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
             * createBulkNotification Mutation
             *
             * build the Moonbeam AppSync API GraphQL query, and perform a POST to it,
             * with the appropriate information.
             *
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            return axios_1.default.post(`${moonbeamBaseURL}`, {
                query: Mutations_1.createBulkNotification,
                variables: {
                    createBulkNotificationInput: createBulkNotificationInput
                }
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": moonbeamPrivateKey
                },
                timeout: 15000,
                timeoutErrorMessage: 'Moonbeam API timed out after 15000ms!'
            }).then(createBulkNotificationResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(createBulkNotificationResponse.data)}`);
                // retrieve the data block from the response
                const responseData = (createBulkNotificationResponse && createBulkNotificationResponse.data) ? createBulkNotificationResponse.data.data : null;
                // check if there are any errors in the returned response
                if (responseData && responseData.createBulkNotification.errorMessage === null) {
                    // returned the successfully created bulk notification
                    return {
                        data: responseData.createBulkNotification.data
                    };
                }
                else {
                    return responseData ?
                        // return the error message and type, from the original AppSync call
                        {
                            errorMessage: responseData.createBulkNotification.errorMessage,
                            errorType: responseData.createBulkNotification.errorType
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
            const errorMessage = `Unexpected error while creating a bulk notification, through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                errorMessage: errorMessage,
                errorType: GraphqlExports_1.NotificationsErrorType.UnexpectedError
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
             * createNotification Mutation
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
     * Function used to create daily earning summaries for all applicable users, who spent
     * in a particular day.
     *
     * @param createDailyEarningsSummaryInput the daily earnings summary input to be passed in, in order to
     * create all applicable daily earning summaries.
     *
     * @returns a {@link DailyEarningsSummaryResponse} {@link Promise}, representing the newly created daily summaries,
     * for all applicable users.
     */
    async createDailyEarningsSummary(createDailyEarningsSummaryInput) {
        // easily identifiable API endpoint information
        const endpointInfo = 'createDailyEarningsSummary Mutation Moonbeam GraphQL API';
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
                    errorType: GraphqlExports_1.DailySummaryErrorType.UnexpectedError
                };
            }
            /**
             * createDailyEarningsSummary Mutation
             *
             * build the Moonbeam AppSync API GraphQL query, and perform a POST to it,
             * with the appropriate information.
             *
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            return axios_1.default.post(`${moonbeamBaseURL}`, {
                query: Mutations_1.createDailyEarningsSummary,
                variables: {
                    createDailyEarningsSummaryInput: createDailyEarningsSummaryInput
                }
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": moonbeamPrivateKey
                },
                timeout: 15000,
                timeoutErrorMessage: 'Moonbeam API timed out after 15000ms!'
            }).then(createDailyEarningsSummaryResponse => {
                // retrieve the data block from the response
                const responseData = (createDailyEarningsSummaryResponse && createDailyEarningsSummaryResponse.data) ? createDailyEarningsSummaryResponse.data.data : null;
                // check if there are any errors in the returned response
                if (responseData && responseData.createDailyEarningsSummary.errorMessage === null) {
                    // returned the successfully retrieved physical devices for a given user
                    return {
                        data: responseData.createDailyEarningsSummary.data
                    };
                }
                else {
                    return responseData ?
                        // return the error message and type, from the original AppSync call
                        {
                            errorMessage: responseData.createDailyEarningsSummary.errorMessage,
                            errorType: responseData.createDailyEarningsSummary.errorType
                        } :
                        // return the error response indicating an invalid structure returned
                        {
                            errorMessage: `Invalid response structure returned from ${endpointInfo} response!`,
                            errorType: GraphqlExports_1.DailySummaryErrorType.ValidationError
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
                        errorType: GraphqlExports_1.DailySummaryErrorType.UnexpectedError
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
                        errorType: GraphqlExports_1.DailySummaryErrorType.UnexpectedError
                    };
                }
                else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Moonbeam API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.DailySummaryErrorType.UnexpectedError
                    };
                }
            });
        }
        catch (err) {
            const errorMessage = `Unexpected error while creating daily earning summaries, through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                errorMessage: errorMessage,
                errorType: GraphqlExports_1.DailySummaryErrorType.UnexpectedError
            };
        }
    }
    /**
     * Function used to get all devices which have a linked push token.
     *
     * @returns a {@link UserDevicesResponse} representing the matched physical devices' information.
     */
    async getAllDevices() {
        // easily identifiable API endpoint information
        const endpointInfo = 'getAllDevices Query Moonbeam GraphQL API';
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
             * getAllDevices Query
             *
             * build the Moonbeam AppSync API GraphQL query, and perform a POST to it,
             * with the appropriate information.
             *
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            return axios_1.default.post(`${moonbeamBaseURL}`, {
                query: Queries_1.getAllDevices
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": moonbeamPrivateKey
                },
                timeout: 15000,
                timeoutErrorMessage: 'Moonbeam API timed out after 15000ms!'
            }).then(getAllDevicesResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(getAllDevicesResponse.data)}`);
                // retrieve the data block from the response
                const responseData = (getAllDevicesResponse && getAllDevicesResponse.data) ? getAllDevicesResponse.data.data : null;
                // check if there are any errors in the returned response
                if (responseData && responseData.getAllDevices.errorMessage === null) {
                    // returned the successfully retrieved physical devices for all users
                    return {
                        data: responseData.getAllDevices.data
                    };
                }
                else {
                    return responseData ?
                        // return the error message and type, from the original AppSync call
                        {
                            errorMessage: responseData.getAllDevices.errorMessage,
                            errorType: responseData.getAllDevices.errorType
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
            const errorMessage = `Unexpected error while retrieving all physical devices, through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                errorMessage: errorMessage,
                errorType: GraphqlExports_1.UserDeviceErrorType.UnexpectedError
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW9vbmJlYW1DbGllbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbW9uL2NsaWVudHMvTW9vbmJlYW1DbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsbURBQThDO0FBQzlDLDRDQUF1QztBQUN2QyxzREE4RDJCO0FBQzNCLGtEQUEwQjtBQUMxQixpRUFVMkM7QUFDM0MsMkRBZ0J1QztBQUV2QyxnR0FNbUQ7QUFFbkQ7OztHQUdHO0FBQ0gsTUFBYSxjQUFlLFNBQVEsNkJBQWE7SUFFN0M7Ozs7O09BS0c7SUFDSCxZQUFZLFdBQW1CLEVBQUUsTUFBYztRQUMzQyxLQUFLLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQy9CLENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0gsS0FBSyxDQUFDLHlCQUF5QixDQUFDLDhCQUE4RDtRQUMxRiwrQ0FBK0M7UUFDL0MsTUFBTSxZQUFZLEdBQUcsc0RBQXNELENBQUM7UUFFNUUsSUFBSTtZQUNBLG9IQUFvSDtZQUNwSCxNQUFNLENBQUMsZUFBZSxFQUFFLGtCQUFrQixDQUFDLEdBQUcsTUFBTSxLQUFLLENBQUMsMEJBQTBCLENBQUMscUJBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO1lBRS9JLDRFQUE0RTtZQUM1RSxJQUFJLGVBQWUsS0FBSyxJQUFJLElBQUksZUFBZSxDQUFDLE1BQU0sS0FBSyxDQUFDO2dCQUN4RCxrQkFBa0IsS0FBSyxJQUFJLElBQUksa0JBQWtCLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDaEUsTUFBTSxZQUFZLEdBQUcsaURBQWlELENBQUM7Z0JBQ3ZFLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBRTFCLE9BQU87b0JBQ0gsWUFBWSxFQUFFLFlBQVk7b0JBQzFCLFNBQVMsRUFBRSx1Q0FBc0IsQ0FBQyxlQUFlO2lCQUNwRCxDQUFDO2FBQ0w7WUFFRDs7Ozs7Ozs7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b0JBQ3ZFLE1BQU0sWUFBWSxHQUFHLHlEQUF5RCxZQUFZLGtCQUFrQixDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO29CQUN4SixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO29CQUUxQixPQUFPO3dCQUNILFlBQVksRUFBRSxZQUFZO3dCQUMxQixTQUFTLEVBQUUsb0NBQW1CLENBQUMsZUFBZTtxQkFDakQsQ0FBQztpQkFDTDtZQUNMLENBQUMsQ0FBQyxDQUFDO1NBQ047UUFBQyxPQUFPLEdBQUcsRUFBRTtZQUNWLE1BQU0sWUFBWSxHQUFHLHFGQUFxRixZQUFZLEVBQUUsQ0FBQztZQUN6SCxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsWUFBWSxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFFdEMsT0FBTztnQkFDSCxZQUFZLEVBQUUsWUFBWTtnQkFDMUIsU0FBUyxFQUFFLG9DQUFtQixDQUFDLGVBQWU7YUFDakQsQ0FBQztTQUNMO0lBQ0wsQ0FBQztDQUNKO0FBcnpIRCx3Q0FxekhDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtCYXNlQVBJQ2xpZW50fSBmcm9tIFwiLi9CYXNlQVBJQ2xpZW50XCI7XG5pbXBvcnQge0NvbnN0YW50c30gZnJvbSBcIi4uL0NvbnN0YW50c1wiO1xuaW1wb3J0IHtcbiAgICBDYXJkTGlua0Vycm9yVHlwZSxcbiAgICBDcmVhdGVCdWxrTm90aWZpY2F0aW9uSW5wdXQsXG4gICAgQ3JlYXRlQnVsa05vdGlmaWNhdGlvblJlc3BvbnNlLFxuICAgIENyZWF0ZURhaWx5RWFybmluZ3NTdW1tYXJ5SW5wdXQsXG4gICAgQ3JlYXRlTm90aWZpY2F0aW9uSW5wdXQsXG4gICAgQ3JlYXRlTm90aWZpY2F0aW9uUmVzcG9uc2UsXG4gICAgQ3JlYXRlVHJhbnNhY3Rpb25JbnB1dCxcbiAgICBEYWlseUVhcm5pbmdzU3VtbWFyeSxcbiAgICBEYWlseUVhcm5pbmdzU3VtbWFyeVJlc3BvbnNlLFxuICAgIERhaWx5U3VtbWFyeUVycm9yVHlwZSxcbiAgICBFbGlnaWJsZUxpbmtlZFVzZXIsXG4gICAgRWxpZ2libGVMaW5rZWRVc2Vyc1Jlc3BvbnNlLFxuICAgIEVtYWlsRnJvbUNvZ25pdG9SZXNwb25zZSxcbiAgICBGaWxlLFxuICAgIEdldERldmljZXNGb3JVc2VySW5wdXQsXG4gICAgR2V0TWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbklucHV0LFxuICAgIEdldE5vdGlmaWNhdGlvbkJ5VHlwZUlucHV0LFxuICAgIEdldE5vdGlmaWNhdGlvbkJ5VHlwZVJlc3BvbnNlLFxuICAgIEdldFJlZmVycmFsc0J5U3RhdHVzSW5wdXQsXG4gICAgR2V0U3RvcmFnZUlucHV0LFxuICAgIEdldFRyYW5zYWN0aW9uQnlTdGF0dXNJbnB1dCxcbiAgICBHZXRUcmFuc2FjdGlvbklucHV0LFxuICAgIEdldFRyYW5zYWN0aW9uc0luUmFuZ2VJbnB1dCxcbiAgICBHZXRVc2VyTm90aWZpY2F0aW9uQXNzZXRzSW5wdXQsXG4gICAgR2V0VXNlcnNCeUdlb2dyYXBoaWNhbExvY2F0aW9uSW5wdXQsXG4gICAgSW5lbGlnaWJsZUxpbmtlZFVzZXJzUmVzcG9uc2UsXG4gICAgTWlsaXRhcnlWZXJpZmljYXRpb25FcnJvclR5cGUsXG4gICAgTWlsaXRhcnlWZXJpZmljYXRpb25Ob3RpZmljYXRpb25VcGRhdGUsXG4gICAgTWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRpbmdFcnJvclR5cGUsXG4gICAgTWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRpbmdJbmZvcm1hdGlvbixcbiAgICBNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydGluZ0luZm9ybWF0aW9uUmVzcG9uc2UsXG4gICAgTWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRSZXNwb25zZSxcbiAgICBNb29uYmVhbVRyYW5zYWN0aW9uLFxuICAgIE1vb25iZWFtVHJhbnNhY3Rpb25CeVN0YXR1cyxcbiAgICBNb29uYmVhbVRyYW5zYWN0aW9uUmVzcG9uc2UsXG4gICAgTW9vbmJlYW1UcmFuc2FjdGlvbnNCeVN0YXR1c1Jlc3BvbnNlLFxuICAgIE1vb25iZWFtVHJhbnNhY3Rpb25zUmVzcG9uc2UsXG4gICAgTW9vbmJlYW1VcGRhdGVkVHJhbnNhY3Rpb24sXG4gICAgTW9vbmJlYW1VcGRhdGVkVHJhbnNhY3Rpb25SZXNwb25zZSxcbiAgICBOb3RpZmljYXRpb24sXG4gICAgTm90aWZpY2F0aW9uUmVtaW5kZXIsXG4gICAgTm90aWZpY2F0aW9uUmVtaW5kZXJFcnJvclR5cGUsXG4gICAgTm90aWZpY2F0aW9uUmVtaW5kZXJSZXNwb25zZSxcbiAgICBOb3RpZmljYXRpb25zRXJyb3JUeXBlLFxuICAgIFB1c2hEZXZpY2UsXG4gICAgUHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRJbnB1dCxcbiAgICBSZWZlcnJhbCxcbiAgICBSZWZlcnJhbEVycm9yVHlwZSxcbiAgICBSZWZlcnJhbFJlc3BvbnNlLFxuICAgIFJldHJpZXZlVXNlckRldGFpbHNGb3JOb3RpZmljYXRpb25zLFxuICAgIFN0b3JhZ2VFcnJvclR5cGUsXG4gICAgU3RvcmFnZVJlc3BvbnNlLFxuICAgIFRyYW5zYWN0aW9uc0Vycm9yVHlwZSxcbiAgICBVcGRhdGVDYXJkSW5wdXQsXG4gICAgVXBkYXRlZFRyYW5zYWN0aW9uRXZlbnQsXG4gICAgVXBkYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJJbnB1dCxcbiAgICBVcGRhdGVSZWZlcnJhbElucHV0LFxuICAgIFVwZGF0ZVRyYW5zYWN0aW9uSW5wdXQsXG4gICAgVXNlckRldmljZUVycm9yVHlwZSxcbiAgICBVc2VyRGV2aWNlc1Jlc3BvbnNlLFxuICAgIFVzZXJGb3JOb3RpZmljYXRpb25SZW1pbmRlclJlc3BvbnNlLCBVc2VyTm90aWZpY2F0aW9uQXNzZXRzUmVzcG9uc2UsIFVzZXJOb3RpZmljYXRpb25zQXNzZXRzXG59IGZyb20gXCIuLi9HcmFwaHFsRXhwb3J0c1wiO1xuaW1wb3J0IGF4aW9zIGZyb20gXCJheGlvc1wiO1xuaW1wb3J0IHtcbiAgICBjcmVhdGVEYWlseUVhcm5pbmdzU3VtbWFyeSxcbiAgICBjcmVhdGVOb3RpZmljYXRpb24sXG4gICAgY3JlYXRlQnVsa05vdGlmaWNhdGlvbixcbiAgICBjcmVhdGVUcmFuc2FjdGlvbixcbiAgICBwdXRNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydCxcbiAgICB1cGRhdGVDYXJkLFxuICAgIHVwZGF0ZU5vdGlmaWNhdGlvblJlbWluZGVyLFxuICAgIHVwZGF0ZVJlZmVycmFsLFxuICAgIHVwZGF0ZVRyYW5zYWN0aW9uXG59IGZyb20gXCIuLi8uLi9ncmFwaHFsL211dGF0aW9ucy9NdXRhdGlvbnNcIjtcbmltcG9ydCB7XG4gICAgZ2V0QWxsVXNlcnNFbGlnaWJsZUZvclJlaW1idXJzZW1lbnRzLFxuICAgIGdldEFsbFVzZXJzSW5lbGlnaWJsZUZvclJlaW1idXJzZW1lbnRzLFxuICAgIGdldERldmljZXNGb3JVc2VyLFxuICAgIGdldEFsbERldmljZXMsXG4gICAgZ2V0RWxpZ2libGVMaW5rZWRVc2VycyxcbiAgICBnZXRNaWxpdGFyeVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uLFxuICAgIGdldE5vdGlmaWNhdGlvbkJ5VHlwZSxcbiAgICBnZXROb3RpZmljYXRpb25SZW1pbmRlcnMsXG4gICAgZ2V0UmVmZXJyYWxzQnlTdGF0dXMsXG4gICAgZ2V0U3RvcmFnZSxcbiAgICBnZXRUcmFuc2FjdGlvbixcbiAgICBnZXRUcmFuc2FjdGlvbkJ5U3RhdHVzLFxuICAgIGdldFRyYW5zYWN0aW9uc0luUmFuZ2UsXG4gICAgZ2V0VXNlcnNXaXRoTm9DYXJkcyxcbiAgICBnZXRVc2VyTm90aWZpY2F0aW9uQXNzZXRzXG59IGZyb20gXCIuLi8uLi9ncmFwaHFsL3F1ZXJpZXMvUXVlcmllc1wiO1xuaW1wb3J0IHtBUElHYXRld2F5UHJveHlSZXN1bHR9IGZyb20gXCJhd3MtbGFtYmRhL3RyaWdnZXIvYXBpLWdhdGV3YXktcHJveHlcIjtcbmltcG9ydCB7XG4gICAgQ29nbml0b0lkZW50aXR5UHJvdmlkZXJDbGllbnQsXG4gICAgTGlzdFVzZXJzQ29tbWFuZCxcbiAgICBMaXN0VXNlcnNDb21tYW5kSW5wdXQsXG4gICAgTGlzdFVzZXJzQ29tbWFuZE91dHB1dCxcbiAgICBVc2VyVHlwZVxufSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LWNvZ25pdG8taWRlbnRpdHktcHJvdmlkZXJcIjtcblxuLyoqXG4gKiBDbGFzcyB1c2VkIGFzIHRoZSBiYXNlL2dlbmVyaWMgY2xpZW50IGZvciBhbGwgTW9vbmJlYW0gaW50ZXJuYWwgQXBwU3luY1xuICogYW5kL29yIEFQSSBHYXRld2F5IEFQSXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBNb29uYmVhbUNsaWVudCBleHRlbmRzIEJhc2VBUElDbGllbnQge1xuXG4gICAgLyoqXG4gICAgICogR2VuZXJpYyBjb25zdHJ1Y3RvciBmb3IgdGhlIGNsaWVudC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBlbnZpcm9ubWVudCB0aGUgQVdTIGVudmlyb25tZW50IHBhc3NlZCBpbiBmcm9tIHRoZSBMYW1iZGEgcmVzb2x2ZXIuXG4gICAgICogQHBhcmFtIHJlZ2lvbiB0aGUgQVdTIHJlZ2lvbiBwYXNzZWQgaW4gZnJvbSB0aGUgTGFtYmRhIHJlc29sdmVyLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGVudmlyb25tZW50OiBzdHJpbmcsIHJlZ2lvbjogc3RyaW5nKSB7XG4gICAgICAgIHN1cGVyKHJlZ2lvbiwgZW52aXJvbm1lbnQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHVzZWQgdG8gZ2V0IHRoZSBub3RpZmljYXRpb24gYXNzZXRzIGZvciBhIHBhcnRpY3VsYXIgdXNlci5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBnZXRVc2VyTm90aWZpY2F0aW9uQXNzZXRzSW5wdXQgaW5wdXQgcGFzc2VkIGluLCB3aGljaCB3aWxsIGJlIHVzZWQgaW4gcmV0cmlldmluZyB0aGUgbm90aWZpY2F0aW9uc1xuICAgICAqIGFzc2V0cyBmb3IgdGhlIHVzZXIgYWNjb3JkaW5nbHkuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBhIHtAbGluayBVc2VyTm90aWZpY2F0aW9uQXNzZXRzUmVzcG9uc2V9LCByZXByZXNlbnRpbmcgdGhlIHJldHJpZXZlZCBub3RpZmljYXRpb24gYXNzZXRzLCBpZiBhbnkgYXBwbGljYWJsZS5cbiAgICAgKi9cbiAgICBhc3luYyBnZXRVc2VyTm90aWZpY2F0aW9uQXNzZXRzKGdldFVzZXJOb3RpZmljYXRpb25Bc3NldHNJbnB1dDogR2V0VXNlck5vdGlmaWNhdGlvbkFzc2V0c0lucHV0KTogUHJvbWlzZTxVc2VyTm90aWZpY2F0aW9uQXNzZXRzUmVzcG9uc2U+IHtcbiAgICAgICAgLy8gZWFzaWx5IGlkZW50aWZpYWJsZSBBUEkgZW5kcG9pbnQgaW5mb3JtYXRpb25cbiAgICAgICAgY29uc3QgZW5kcG9pbnRJbmZvID0gJ2dldFVzZXJOb3RpZmljYXRpb25Bc3NldHMgUXVlcnkgTW9vbmJlYW0gR3JhcGhRTCBBUEknO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgQVBJIEtleSBhbmQgQmFzZSBVUkwsIG5lZWRlZCBpbiBvcmRlciB0byBtYWtlIHRoZSBzdG9yYWdlIGZpbGUgVVJMIHJldHJpZXZhbCBjYWxsIHRocm91Z2ggdGhlIGNsaWVudFxuICAgICAgICAgICAgY29uc3QgW21vb25iZWFtQmFzZVVSTCwgbW9vbmJlYW1Qcml2YXRlS2V5XSA9IGF3YWl0IHN1cGVyLnJldHJpZXZlU2VydmljZUNyZWRlbnRpYWxzKENvbnN0YW50cy5BV1NQYWlyQ29uc3RhbnRzLk1PT05CRUFNX0lOVEVSTkFMX1NFQ1JFVF9OQU1FKTtcblxuICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHdlIG9idGFpbmVkIGFueSBpbnZhbGlkIHNlY3JldCB2YWx1ZXMgZnJvbSB0aGUgY2FsbCBhYm92ZVxuICAgICAgICAgICAgaWYgKG1vb25iZWFtQmFzZVVSTCA9PT0gbnVsbCB8fCBtb29uYmVhbUJhc2VVUkwubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgbW9vbmJlYW1Qcml2YXRlS2V5ID09PSBudWxsIHx8IG1vb25iZWFtUHJpdmF0ZUtleS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBcIkludmFsaWQgU2VjcmV0cyBvYnRhaW5lZCBmb3IgTW9vbmJlYW0gQVBJIGNhbGwhXCI7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBnZXRVc2VyTm90aWZpY2F0aW9uQXNzZXRzIFF1ZXJ5XG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogYnVpbGQgdGhlIE1vb25iZWFtIEFwcFN5bmMgQVBJIEdyYXBoUUwgcXVlcnksIGFuZCBwZXJmb3JtIGEgUE9TVCB0byBpdCxcbiAgICAgICAgICAgICAqIHdpdGggdGhlIGFwcHJvcHJpYXRlIGluZm9ybWF0aW9uLlxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIHdlIGltcGx5IHRoYXQgaWYgdGhlIEFQSSBkb2VzIG5vdCByZXNwb25kIGluIDE1IHNlY29uZHMsIHRoZW4gd2UgYXV0b21hdGljYWxseSBjYXRjaCB0aGF0LCBhbmQgcmV0dXJuIGFuXG4gICAgICAgICAgICAgKiBlcnJvciBmb3IgYSBiZXR0ZXIgY3VzdG9tZXIgZXhwZXJpZW5jZS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgcmV0dXJuIGF4aW9zLnBvc3QoYCR7bW9vbmJlYW1CYXNlVVJMfWAsIHtcbiAgICAgICAgICAgICAgICBxdWVyeTogZ2V0VXNlck5vdGlmaWNhdGlvbkFzc2V0cyxcbiAgICAgICAgICAgICAgICB2YXJpYWJsZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgZ2V0VXNlck5vdGlmaWNhdGlvbkFzc2V0c0lucHV0OiBnZXRVc2VyTm90aWZpY2F0aW9uQXNzZXRzSW5wdXRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAgICAgXCJ4LWFwaS1rZXlcIjogbW9vbmJlYW1Qcml2YXRlS2V5XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiAxNTAwMCwgLy8gaW4gbWlsbGlzZWNvbmRzIGhlcmVcbiAgICAgICAgICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlOiAnTW9vbmJlYW0gQVBJIHRpbWVkIG91dCBhZnRlciAxNTAwMG1zISdcbiAgICAgICAgICAgIH0pLnRoZW4oZ2V0VXNlck5vdGlmaWNhdGlvbkFzc2V0c1Jlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlbmRwb2ludEluZm99IHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZ2V0VXNlck5vdGlmaWNhdGlvbkFzc2V0c1Jlc3BvbnNlLmRhdGEpfWApO1xuXG4gICAgICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIGRhdGEgYmxvY2sgZnJvbSB0aGUgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICBjb25zdCByZXNwb25zZURhdGEgPSAoZ2V0VXNlck5vdGlmaWNhdGlvbkFzc2V0c1Jlc3BvbnNlICYmIGdldFVzZXJOb3RpZmljYXRpb25Bc3NldHNSZXNwb25zZS5kYXRhKVxuICAgICAgICAgICAgICAgICAgICA/IGdldFVzZXJOb3RpZmljYXRpb25Bc3NldHNSZXNwb25zZS5kYXRhLmRhdGFcbiAgICAgICAgICAgICAgICAgICAgOiBudWxsO1xuXG4gICAgICAgICAgICAgICAgLy8gY2hlY2sgaWYgdGhlcmUgYXJlIGFueSBlcnJvcnMgaW4gdGhlIHJldHVybmVkIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlRGF0YSAmJiByZXNwb25zZURhdGEuZ2V0VXNlck5vdGlmaWNhdGlvbkFzc2V0cy5lcnJvck1lc3NhZ2UgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuZWQgdGhlIHN1Y2Nlc3NmdWxseSByZXRyaWV2ZWQgbm90aWZpY2F0aW9uIGFzc2V0c1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogcmVzcG9uc2VEYXRhLmdldFVzZXJOb3RpZmljYXRpb25Bc3NldHMuZGF0YSBhcyBVc2VyTm90aWZpY2F0aW9uc0Fzc2V0c1tdXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2VEYXRhID9cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgdHlwZSwgZnJvbSB0aGUgb3JpZ2luYWwgQXBwU3luYyBjYWxsXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiByZXNwb25zZURhdGEuZ2V0VXNlck5vdGlmaWNhdGlvbkFzc2V0cy5lcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiByZXNwb25zZURhdGEuZ2V0VXNlck5vdGlmaWNhdGlvbkFzc2V0cy5lcnJvclR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gOlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBlcnJvciByZXNwb25zZSBpbmRpY2F0aW5nIGFuIGludmFsaWQgc3RydWN0dXJlIHJldHVybmVkXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgSW52YWxpZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UhYCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvci5yZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYW5kIHRoZSBzZXJ2ZXIgcmVzcG9uZGVkIHdpdGggYSBzdGF0dXMgY29kZVxuICAgICAgICAgICAgICAgICAgICAgKiB0aGF0IGZhbGxzIG91dCBvZiB0aGUgcmFuZ2Ugb2YgMnh4LlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vbiAyeHh4IHJlc3BvbnNlIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBNb29uYmVhbSBBUEksIHdpdGggc3RhdHVzICR7ZXJyb3IucmVzcG9uc2Uuc3RhdHVzfSwgYW5kIHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZXJyb3IucmVzcG9uc2UuZGF0YSl9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBhbnkgb3RoZXIgc3BlY2lmaWMgZXJyb3JzIHRvIGJlIGZpbHRlcmVkIGJlbG93XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVycm9yLnJlcXVlc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGJ1dCBubyByZXNwb25zZSB3YXMgcmVjZWl2ZWRcbiAgICAgICAgICAgICAgICAgICAgICogYGVycm9yLnJlcXVlc3RgIGlzIGFuIGluc3RhbmNlIG9mIFhNTEh0dHBSZXF1ZXN0IGluIHRoZSBicm93c2VyIGFuZCBhbiBpbnN0YW5jZSBvZlxuICAgICAgICAgICAgICAgICAgICAgKiAgaHR0cC5DbGllbnRSZXF1ZXN0IGluIG5vZGUuanMuXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm8gcmVzcG9uc2UgcmVjZWl2ZWQgd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgZm9yIHJlcXVlc3QgJHtlcnJvci5yZXF1ZXN0fWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNvbWV0aGluZyBoYXBwZW5lZCBpbiBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IHRoYXQgdHJpZ2dlcmVkIGFuIEVycm9yXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgZm9yIHRoZSAke2VuZHBvaW50SW5mb30gTW9vbmJlYW0gQVBJLCAkeyhlcnJvciAmJiBlcnJvci5tZXNzYWdlKSAmJiBlcnJvci5tZXNzYWdlfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHJldHJpZXZpbmcgdXNlciBub3RpZmljYXRpb24gYXNzZXRzIHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJ9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHVzZWQgdG8gZ2V0IHRoZSBub3RpZmljYXRpb25zIGJ5IHRoZWlyIHR5cGUsIHNvcnRlZCBieSBhIHBhcnRpY3VsYXIgZGF0ZS90aW1lLlxuICAgICAqXG4gICAgICogQHBhcmFtIGdldE5vdGlmaWNhdGlvbkJ5VHlwZUlucHV0IGlucHV0IHBhc3NlZCBpbiwgd2hpY2ggd2lsbCBiZSB1c2VkIGluIHJldHJpZXZpbmcgdGhlIG5vdGlmaWNhdGlvbnNcbiAgICAgKiBieSB0eXBlIGFwcHJvcHJpYXRlbHkuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBhIHtAbGluayBHZXROb3RpZmljYXRpb25CeVR5cGVSZXNwb25zZX0sIHJlcHJlc2VudGluZyB0aGUgZmlsdGVyZWQgbm90aWZpY2F0aW9ucywgaWYgYW55IGFwcGxpY2FibGUuXG4gICAgICovXG4gICAgYXN5bmMgZ2V0Tm90aWZpY2F0aW9uQnlUeXBlKGdldE5vdGlmaWNhdGlvbkJ5VHlwZUlucHV0OiBHZXROb3RpZmljYXRpb25CeVR5cGVJbnB1dCk6IFByb21pc2U8R2V0Tm90aWZpY2F0aW9uQnlUeXBlUmVzcG9uc2U+IHtcbiAgICAgICAgLy8gZWFzaWx5IGlkZW50aWZpYWJsZSBBUEkgZW5kcG9pbnQgaW5mb3JtYXRpb25cbiAgICAgICAgY29uc3QgZW5kcG9pbnRJbmZvID0gJ2dldE5vdGlmaWNhdGlvbkJ5VHlwZSBRdWVyeSBNb29uYmVhbSBHcmFwaFFMIEFQSSc7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBBUEkgS2V5IGFuZCBCYXNlIFVSTCwgbmVlZGVkIGluIG9yZGVyIHRvIG1ha2UgdGhlIHN0b3JhZ2UgZmlsZSBVUkwgcmV0cmlldmFsIGNhbGwgdGhyb3VnaCB0aGUgY2xpZW50XG4gICAgICAgICAgICBjb25zdCBbbW9vbmJlYW1CYXNlVVJMLCBtb29uYmVhbVByaXZhdGVLZXldID0gYXdhaXQgc3VwZXIucmV0cmlldmVTZXJ2aWNlQ3JlZGVudGlhbHMoQ29uc3RhbnRzLkFXU1BhaXJDb25zdGFudHMuTU9PTkJFQU1fSU5URVJOQUxfU0VDUkVUX05BTUUpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgd2Ugb2J0YWluZWQgYW55IGludmFsaWQgc2VjcmV0IHZhbHVlcyBmcm9tIHRoZSBjYWxsIGFib3ZlXG4gICAgICAgICAgICBpZiAobW9vbmJlYW1CYXNlVVJMID09PSBudWxsIHx8IG1vb25iZWFtQmFzZVVSTC5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBtb29uYmVhbVByaXZhdGVLZXkgPT09IG51bGwgfHwgbW9vbmJlYW1Qcml2YXRlS2V5Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IFwiSW52YWxpZCBTZWNyZXRzIG9idGFpbmVkIGZvciBNb29uYmVhbSBBUEkgY2FsbCFcIjtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIGdldE5vdGlmaWNhdGlvbkJ5VHlwZSBRdWVyeVxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIGJ1aWxkIHRoZSBNb29uYmVhbSBBcHBTeW5jIEFQSSBHcmFwaFFMIHF1ZXJ5LCBhbmQgcGVyZm9ybSBhIFBPU1QgdG8gaXQsXG4gICAgICAgICAgICAgKiB3aXRoIHRoZSBhcHByb3ByaWF0ZSBpbmZvcm1hdGlvbi5cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiB3ZSBpbXBseSB0aGF0IGlmIHRoZSBBUEkgZG9lcyBub3QgcmVzcG9uZCBpbiAxNSBzZWNvbmRzLCB0aGVuIHdlIGF1dG9tYXRpY2FsbHkgY2F0Y2ggdGhhdCwgYW5kIHJldHVybiBhblxuICAgICAgICAgICAgICogZXJyb3IgZm9yIGEgYmV0dGVyIGN1c3RvbWVyIGV4cGVyaWVuY2UuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHJldHVybiBheGlvcy5wb3N0KGAke21vb25iZWFtQmFzZVVSTH1gLCB7XG4gICAgICAgICAgICAgICAgcXVlcnk6IGdldE5vdGlmaWNhdGlvbkJ5VHlwZSxcbiAgICAgICAgICAgICAgICB2YXJpYWJsZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgZ2V0Tm90aWZpY2F0aW9uQnlUeXBlSW5wdXQ6IGdldE5vdGlmaWNhdGlvbkJ5VHlwZUlucHV0XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgICAgIFwieC1hcGkta2V5XCI6IG1vb25iZWFtUHJpdmF0ZUtleVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGltZW91dDogMTUwMDAsIC8vIGluIG1pbGxpc2Vjb25kcyBoZXJlXG4gICAgICAgICAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZTogJ01vb25iZWFtIEFQSSB0aW1lZCBvdXQgYWZ0ZXIgMTUwMDBtcyEnXG4gICAgICAgICAgICB9KS50aGVuKGdldE5vdGlmaWNhdGlvbkJ5VHlwZVJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlbmRwb2ludEluZm99IHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZ2V0Tm90aWZpY2F0aW9uQnlUeXBlUmVzcG9uc2UuZGF0YSl9YCk7XG5cbiAgICAgICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgZGF0YSBibG9jayBmcm9tIHRoZSByZXNwb25zZVxuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlRGF0YSA9IChnZXROb3RpZmljYXRpb25CeVR5cGVSZXNwb25zZSAmJiBnZXROb3RpZmljYXRpb25CeVR5cGVSZXNwb25zZS5kYXRhKVxuICAgICAgICAgICAgICAgICAgICA/IGdldE5vdGlmaWNhdGlvbkJ5VHlwZVJlc3BvbnNlLmRhdGEuZGF0YVxuICAgICAgICAgICAgICAgICAgICA6IG51bGw7XG5cbiAgICAgICAgICAgICAgICAvLyBjaGVjayBpZiB0aGVyZSBhcmUgYW55IGVycm9ycyBpbiB0aGUgcmV0dXJuZWQgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2VEYXRhICYmIHJlc3BvbnNlRGF0YS5nZXROb3RpZmljYXRpb25CeVR5cGUuZXJyb3JNZXNzYWdlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHJldHVybmVkIHRoZSBzdWNjZXNzZnVsbHkgcmV0cmlldmVkIG5vdGlmaWNhdGlvblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogcmVzcG9uc2VEYXRhLmdldE5vdGlmaWNhdGlvbkJ5VHlwZS5kYXRhIGFzIE5vdGlmaWNhdGlvbltdXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2VEYXRhID9cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgdHlwZSwgZnJvbSB0aGUgb3JpZ2luYWwgQXBwU3luYyBjYWxsXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiByZXNwb25zZURhdGEuZ2V0Tm90aWZpY2F0aW9uQnlUeXBlLmVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IHJlc3BvbnNlRGF0YS5nZXROb3RpZmljYXRpb25CeVR5cGUuZXJyb3JUeXBlXG4gICAgICAgICAgICAgICAgICAgICAgICB9IDpcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgZXJyb3IgcmVzcG9uc2UgaW5kaWNhdGluZyBhbiBpbnZhbGlkIHN0cnVjdHVyZSByZXR1cm5lZFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogYEludmFsaWQgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gJHtlbmRwb2ludEluZm99IHJlc3BvbnNlIWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IucmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGFuZCB0aGUgc2VydmVyIHJlc3BvbmRlZCB3aXRoIGEgc3RhdHVzIGNvZGVcbiAgICAgICAgICAgICAgICAgICAgICogdGhhdCBmYWxscyBvdXQgb2YgdGhlIHJhbmdlIG9mIDJ4eC5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBOb24gMnh4eCByZXNwb25zZSB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gTW9vbmJlYW0gQVBJLCB3aXRoIHN0YXR1cyAke2Vycm9yLnJlc3BvbnNlLnN0YXR1c30sIGFuZCByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGVycm9yLnJlc3BvbnNlLmRhdGEpfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gYW55IG90aGVyIHNwZWNpZmljIGVycm9ycyB0byBiZSBmaWx0ZXJlZCBiZWxvd1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5yZXF1ZXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBidXQgbm8gcmVzcG9uc2Ugd2FzIHJlY2VpdmVkXG4gICAgICAgICAgICAgICAgICAgICAqIGBlcnJvci5yZXF1ZXN0YCBpcyBhbiBpbnN0YW5jZSBvZiBYTUxIdHRwUmVxdWVzdCBpbiB0aGUgYnJvd3NlciBhbmQgYW4gaW5zdGFuY2Ugb2ZcbiAgICAgICAgICAgICAgICAgICAgICogIGh0dHAuQ2xpZW50UmVxdWVzdCBpbiBub2RlLmpzLlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vIHJlc3BvbnNlIHJlY2VpdmVkIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBNb29uYmVhbSBBUEksIGZvciByZXF1ZXN0ICR7ZXJyb3IucmVxdWVzdH1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBTb21ldGhpbmcgaGFwcGVuZWQgaW4gc2V0dGluZyB1cCB0aGUgcmVxdWVzdCB0aGF0IHRyaWdnZXJlZCBhbiBFcnJvclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IGZvciB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgJHsoZXJyb3IgJiYgZXJyb3IubWVzc2FnZSkgJiYgZXJyb3IubWVzc2FnZX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSByZXRyaWV2aW5nIG5vdGlmaWNhdGlvbnMgYnkgdHlwZSB0aHJvdWdoICR7ZW5kcG9pbnRJbmZvfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9ICR7ZXJyfWApO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB1c2VkIHRvIHVwZGF0ZSBhbmQvb3IgY3JlYXRlIGFuIGV4aXN0aW5nL25ldyBtaWxpdGFyeSB2ZXJpZmljYXRpb24gcmVwb3J0XG4gICAgICogZmlsZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBwdXRNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydElucHV0IHRoZSBpbnB1dCBjb250YWluaW5nIHRoZSBpbmZvcm1hdGlvbiB0aGF0IG5lZWRzIHRvIGJlXG4gICAgICogdHJhbnNmZXJyZWQgaW50byB0aGUgbWlsaXRhcnkgdmVyaWZpY2F0aW9uIHJlcG9ydCBmaWxlLlxuICAgICAqXG4gICAgICogQHJldHVybnMgYSB7QGxpbmsgTWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRSZXNwb25zZX0sIHJlcHJlc2VudGluZyBhIGZsYWcgaGlnaGxpZ2h0aW5nIHdoZXRoZXJcbiAgICAgKiB0aGUgZmlsZSB3YXMgc3VjY2Vzc2Z1bGx5IHVwZGF0ZWQgb3Igbm90LlxuICAgICAqL1xuICAgIGFzeW5jIHB1dE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0KHB1dE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0SW5wdXQ6IFB1dE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0SW5wdXQpOiBQcm9taXNlPE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0UmVzcG9uc2U+IHtcbiAgICAgICAgLy8gZWFzaWx5IGlkZW50aWZpYWJsZSBBUEkgZW5kcG9pbnQgaW5mb3JtYXRpb25cbiAgICAgICAgY29uc3QgZW5kcG9pbnRJbmZvID0gJ3B1dE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0IFF1ZXJ5IE1vb25iZWFtIEdyYXBoUUwgQVBJJztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIEFQSSBLZXkgYW5kIEJhc2UgVVJMLCBuZWVkZWQgaW4gb3JkZXIgdG8gbWFrZSB0aGUgcmVmZXJyYWwgdXBkYXRlZCBjYWxsIHRocm91Z2ggdGhlIGNsaWVudFxuICAgICAgICAgICAgY29uc3QgW21vb25iZWFtQmFzZVVSTCwgbW9vbmJlYW1Qcml2YXRlS2V5XSA9IGF3YWl0IHN1cGVyLnJldHJpZXZlU2VydmljZUNyZWRlbnRpYWxzKENvbnN0YW50cy5BV1NQYWlyQ29uc3RhbnRzLk1PT05CRUFNX0lOVEVSTkFMX1NFQ1JFVF9OQU1FKTtcblxuICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHdlIG9idGFpbmVkIGFueSBpbnZhbGlkIHNlY3JldCB2YWx1ZXMgZnJvbSB0aGUgY2FsbCBhYm92ZVxuICAgICAgICAgICAgaWYgKG1vb25iZWFtQmFzZVVSTCA9PT0gbnVsbCB8fCBtb29uYmVhbUJhc2VVUkwubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgbW9vbmJlYW1Qcml2YXRlS2V5ID09PSBudWxsIHx8IG1vb25iZWFtUHJpdmF0ZUtleS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBcIkludmFsaWQgU2VjcmV0cyBvYnRhaW5lZCBmb3IgTW9vbmJlYW0gQVBJIGNhbGwhXCI7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFN0b3JhZ2VFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBwdXRNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydCBRdWVyeVxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIGJ1aWxkIHRoZSBNb29uYmVhbSBBcHBTeW5jIEFQSSBHcmFwaFFMIHF1ZXJ5LCBhbmQgcGVyZm9ybSBhIFBPU1QgdG8gaXQsXG4gICAgICAgICAgICAgKiB3aXRoIHRoZSBhcHByb3ByaWF0ZSBpbmZvcm1hdGlvbi5cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiB3ZSBpbXBseSB0aGF0IGlmIHRoZSBBUEkgZG9lcyBub3QgcmVzcG9uZCBpbiAxNSBzZWNvbmRzLCB0aGVuIHdlIGF1dG9tYXRpY2FsbHkgY2F0Y2ggdGhhdCwgYW5kIHJldHVybiBhblxuICAgICAgICAgICAgICogZXJyb3IgZm9yIGEgYmV0dGVyIGN1c3RvbWVyIGV4cGVyaWVuY2UuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHJldHVybiBheGlvcy5wb3N0KGAke21vb25iZWFtQmFzZVVSTH1gLCB7XG4gICAgICAgICAgICAgICAgcXVlcnk6IHB1dE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0LFxuICAgICAgICAgICAgICAgIHZhcmlhYmxlczoge1xuICAgICAgICAgICAgICAgICAgICBwdXRNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydElucHV0OiBwdXRNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydElucHV0XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgICAgIFwieC1hcGkta2V5XCI6IG1vb25iZWFtUHJpdmF0ZUtleVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGltZW91dDogMTUwMDAsIC8vIGluIG1pbGxpc2Vjb25kcyBoZXJlXG4gICAgICAgICAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZTogJ01vb25iZWFtIEFQSSB0aW1lZCBvdXQgYWZ0ZXIgMTUwMDBtcyEnXG4gICAgICAgICAgICB9KS50aGVuKHB1dE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0UmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShwdXRNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydFJlc3BvbnNlLmRhdGEpfWApO1xuXG4gICAgICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIGRhdGEgYmxvY2sgZnJvbSB0aGUgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICBjb25zdCByZXNwb25zZURhdGEgPSAocHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRSZXNwb25zZSAmJiBwdXRNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydFJlc3BvbnNlLmRhdGEpXG4gICAgICAgICAgICAgICAgICAgID8gcHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRSZXNwb25zZS5kYXRhLmRhdGFcbiAgICAgICAgICAgICAgICAgICAgOiBudWxsO1xuXG4gICAgICAgICAgICAgICAgLy8gY2hlY2sgaWYgdGhlcmUgYXJlIGFueSBlcnJvcnMgaW4gdGhlIHJldHVybmVkIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlRGF0YSAmJiByZXNwb25zZURhdGEucHV0TWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnQuZXJyb3JNZXNzYWdlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHJldHVybmVkIHRoZSBzdWNjZXNzZnVsbHkgcmV0cmlldmVkIHJlZmVycmFsc1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogcmVzcG9uc2VEYXRhLnB1dE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0LmRhdGEgYXMgc3RyaW5nXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2VEYXRhID9cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgdHlwZSwgZnJvbSB0aGUgb3JpZ2luYWwgQXBwU3luYyBjYWxsXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiByZXNwb25zZURhdGEudXBkYXRlUmVmZXJyYWwuZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogcmVzcG9uc2VEYXRhLnVwZGF0ZVJlZmVycmFsLmVycm9yVHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIGVycm9yIHJlc3BvbnNlIGluZGljYXRpbmcgYW4gaW52YWxpZCBzdHJ1Y3R1cmUgcmV0dXJuZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBJbnZhbGlkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tICR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSFgLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogU3RvcmFnZUVycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yLnJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBhbmQgdGhlIHNlcnZlciByZXNwb25kZWQgd2l0aCBhIHN0YXR1cyBjb2RlXG4gICAgICAgICAgICAgICAgICAgICAqIHRoYXQgZmFsbHMgb3V0IG9mIHRoZSByYW5nZSBvZiAyeHguXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm9uIDJ4eHggcmVzcG9uc2Ugd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgd2l0aCBzdGF0dXMgJHtlcnJvci5yZXNwb25zZS5zdGF0dXN9LCBhbmQgcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShlcnJvci5yZXNwb25zZS5kYXRhKX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGFueSBvdGhlciBzcGVjaWZpYyBlcnJvcnMgdG8gYmUgZmlsdGVyZWQgYmVsb3dcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBTdG9yYWdlRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3IucmVxdWVzdCkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYnV0IG5vIHJlc3BvbnNlIHdhcyByZWNlaXZlZFxuICAgICAgICAgICAgICAgICAgICAgKiBgZXJyb3IucmVxdWVzdGAgaXMgYW4gaW5zdGFuY2Ugb2YgWE1MSHR0cFJlcXVlc3QgaW4gdGhlIGJyb3dzZXIgYW5kIGFuIGluc3RhbmNlIG9mXG4gICAgICAgICAgICAgICAgICAgICAqICBodHRwLkNsaWVudFJlcXVlc3QgaW4gbm9kZS5qcy5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBObyByZXNwb25zZSByZWNlaXZlZCB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gTW9vbmJlYW0gQVBJLCBmb3IgcmVxdWVzdCAke2Vycm9yLnJlcXVlc3R9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFN0b3JhZ2VFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU29tZXRoaW5nIGhhcHBlbmVkIGluIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgdGhhdCB0cmlnZ2VyZWQgYW4gRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgc2V0dGluZyB1cCB0aGUgcmVxdWVzdCBmb3IgdGhlICR7ZW5kcG9pbnRJbmZvfSBNb29uYmVhbSBBUEksICR7KGVycm9yICYmIGVycm9yLm1lc3NhZ2UpICYmIGVycm9yLm1lc3NhZ2V9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFN0b3JhZ2VFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgdXBkYXRpbmcgcmVmZXJyYWwgdGhyb3VnaCAke2VuZHBvaW50SW5mb31gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfSAke2Vycn1gKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFN0b3JhZ2VFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdXNlZCB0byByZXRyaWV2ZSBhIGZpbGUncyBVUkwgZnJvbSBzdG9yYWdlIHZpYSBDbG91ZEZyb250IGFuZCBTMy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBnZXRTdG9yYWdlSW5wdXQgaW5wdXQgcGFzc2VkIGluLCB3aGljaCB3aWxsIGJlIHVzZWQgaW4gcmV0dXJuaW5nIHRoZSBhcHByb3ByaWF0ZVxuICAgICAqIFVSTCBmb3IgYSBnaXZlbiBmaWxlLlxuICAgICAqXG4gICAgICogQHJldHVybnMgYSAge0BsaW5rIFN0b3JhZ2VSZXNwb25zZX0sIHJlcHJlc2VudGluZyB0aGUgcmV0cmlldmVkIGNob3NlIGZpbGUncyBVUkwuXG4gICAgICovXG4gICAgYXN5bmMgZ2V0U3RvcmFnZUZpbGVVcmwoZ2V0U3RvcmFnZUlucHV0OiBHZXRTdG9yYWdlSW5wdXQpOiBQcm9taXNlPFN0b3JhZ2VSZXNwb25zZT4ge1xuICAgICAgICAvLyBlYXNpbHkgaWRlbnRpZmlhYmxlIEFQSSBlbmRwb2ludCBpbmZvcm1hdGlvblxuICAgICAgICBjb25zdCBlbmRwb2ludEluZm8gPSAnZ2V0U3RvcmFnZSBRdWVyeSBNb29uYmVhbSBHcmFwaFFMIEFQSSc7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBBUEkgS2V5IGFuZCBCYXNlIFVSTCwgbmVlZGVkIGluIG9yZGVyIHRvIG1ha2UgdGhlIHN0b3JhZ2UgZmlsZSBVUkwgcmV0cmlldmFsIGNhbGwgdGhyb3VnaCB0aGUgY2xpZW50XG4gICAgICAgICAgICBjb25zdCBbbW9vbmJlYW1CYXNlVVJMLCBtb29uYmVhbVByaXZhdGVLZXldID0gYXdhaXQgc3VwZXIucmV0cmlldmVTZXJ2aWNlQ3JlZGVudGlhbHMoQ29uc3RhbnRzLkFXU1BhaXJDb25zdGFudHMuTU9PTkJFQU1fSU5URVJOQUxfU0VDUkVUX05BTUUpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgd2Ugb2J0YWluZWQgYW55IGludmFsaWQgc2VjcmV0IHZhbHVlcyBmcm9tIHRoZSBjYWxsIGFib3ZlXG4gICAgICAgICAgICBpZiAobW9vbmJlYW1CYXNlVVJMID09PSBudWxsIHx8IG1vb25iZWFtQmFzZVVSTC5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBtb29uYmVhbVByaXZhdGVLZXkgPT09IG51bGwgfHwgbW9vbmJlYW1Qcml2YXRlS2V5Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IFwiSW52YWxpZCBTZWNyZXRzIG9idGFpbmVkIGZvciBNb29uYmVhbSBBUEkgY2FsbCFcIjtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogU3RvcmFnZUVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIGdldFN0b3JhZ2UgUXVlcnlcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBidWlsZCB0aGUgTW9vbmJlYW0gQXBwU3luYyBBUEkgR3JhcGhRTCBxdWVyeSwgYW5kIHBlcmZvcm0gYSBQT1NUIHRvIGl0LFxuICAgICAgICAgICAgICogd2l0aCB0aGUgYXBwcm9wcmlhdGUgaW5mb3JtYXRpb24uXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogd2UgaW1wbHkgdGhhdCBpZiB0aGUgQVBJIGRvZXMgbm90IHJlc3BvbmQgaW4gMTUgc2Vjb25kcywgdGhlbiB3ZSBhdXRvbWF0aWNhbGx5IGNhdGNoIHRoYXQsIGFuZCByZXR1cm4gYW5cbiAgICAgICAgICAgICAqIGVycm9yIGZvciBhIGJldHRlciBjdXN0b21lciBleHBlcmllbmNlLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICByZXR1cm4gYXhpb3MucG9zdChgJHttb29uYmVhbUJhc2VVUkx9YCwge1xuICAgICAgICAgICAgICAgIHF1ZXJ5OiBnZXRTdG9yYWdlLFxuICAgICAgICAgICAgICAgIHZhcmlhYmxlczoge1xuICAgICAgICAgICAgICAgICAgICBnZXRTdG9yYWdlSW5wdXQ6IGdldFN0b3JhZ2VJbnB1dFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgICAgICBcIngtYXBpLWtleVwiOiBtb29uYmVhbVByaXZhdGVLZXlcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDE1MDAwLCAvLyBpbiBtaWxsaXNlY29uZHMgaGVyZVxuICAgICAgICAgICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2U6ICdNb29uYmVhbSBBUEkgdGltZWQgb3V0IGFmdGVyIDE1MDAwbXMhJ1xuICAgICAgICAgICAgfSkudGhlbihnZXRTdG9yYWdlUmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShnZXRTdG9yYWdlUmVzcG9uc2UuZGF0YSl9YCk7XG5cbiAgICAgICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgZGF0YSBibG9jayBmcm9tIHRoZSByZXNwb25zZVxuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlRGF0YSA9IChnZXRTdG9yYWdlUmVzcG9uc2UgJiYgZ2V0U3RvcmFnZVJlc3BvbnNlLmRhdGEpXG4gICAgICAgICAgICAgICAgICAgID8gZ2V0U3RvcmFnZVJlc3BvbnNlLmRhdGEuZGF0YVxuICAgICAgICAgICAgICAgICAgICA6IG51bGw7XG5cbiAgICAgICAgICAgICAgICAvLyBjaGVjayBpZiB0aGVyZSBhcmUgYW55IGVycm9ycyBpbiB0aGUgcmV0dXJuZWQgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2VEYXRhICYmIHJlc3BvbnNlRGF0YS5nZXRTdG9yYWdlLmVycm9yTWVzc2FnZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm5lZCB0aGUgc3VjY2Vzc2Z1bGx5IHJldHJpZXZlZCBmaWxlIFVSTCBmcm9tIHN0b3JhZ2VcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHJlc3BvbnNlRGF0YS5nZXRTdG9yYWdlLmRhdGEgYXMgRmlsZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlRGF0YSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIGVycm9yIG1lc3NhZ2UgYW5kIHR5cGUsIGZyb20gdGhlIG9yaWdpbmFsIEFwcFN5bmMgY2FsbFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogcmVzcG9uc2VEYXRhLmdldFN0b3JhZ2UuZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogcmVzcG9uc2VEYXRhLmdldFN0b3JhZ2UuZXJyb3JUeXBlXG4gICAgICAgICAgICAgICAgICAgICAgICB9IDpcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgZXJyb3IgcmVzcG9uc2UgaW5kaWNhdGluZyBhbiBpbnZhbGlkIHN0cnVjdHVyZSByZXR1cm5lZFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogYEludmFsaWQgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gJHtlbmRwb2ludEluZm99IHJlc3BvbnNlIWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBTdG9yYWdlRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IucmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGFuZCB0aGUgc2VydmVyIHJlc3BvbmRlZCB3aXRoIGEgc3RhdHVzIGNvZGVcbiAgICAgICAgICAgICAgICAgICAgICogdGhhdCBmYWxscyBvdXQgb2YgdGhlIHJhbmdlIG9mIDJ4eC5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBOb24gMnh4eCByZXNwb25zZSB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gTW9vbmJlYW0gQVBJLCB3aXRoIHN0YXR1cyAke2Vycm9yLnJlc3BvbnNlLnN0YXR1c30sIGFuZCByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGVycm9yLnJlc3BvbnNlLmRhdGEpfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gYW55IG90aGVyIHNwZWNpZmljIGVycm9ycyB0byBiZSBmaWx0ZXJlZCBiZWxvd1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFN0b3JhZ2VFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5yZXF1ZXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBidXQgbm8gcmVzcG9uc2Ugd2FzIHJlY2VpdmVkXG4gICAgICAgICAgICAgICAgICAgICAqIGBlcnJvci5yZXF1ZXN0YCBpcyBhbiBpbnN0YW5jZSBvZiBYTUxIdHRwUmVxdWVzdCBpbiB0aGUgYnJvd3NlciBhbmQgYW4gaW5zdGFuY2Ugb2ZcbiAgICAgICAgICAgICAgICAgICAgICogIGh0dHAuQ2xpZW50UmVxdWVzdCBpbiBub2RlLmpzLlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vIHJlc3BvbnNlIHJlY2VpdmVkIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBNb29uYmVhbSBBUEksIGZvciByZXF1ZXN0ICR7ZXJyb3IucmVxdWVzdH1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogU3RvcmFnZUVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBTb21ldGhpbmcgaGFwcGVuZWQgaW4gc2V0dGluZyB1cCB0aGUgcmVxdWVzdCB0aGF0IHRyaWdnZXJlZCBhbiBFcnJvclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IGZvciB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgJHsoZXJyb3IgJiYgZXJyb3IubWVzc2FnZSkgJiYgZXJyb3IubWVzc2FnZX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogU3RvcmFnZUVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSByZXRyaWV2aW5nIGEgZmlsZSdzIFVSTCBmcm9tIHN0b3JhZ2UgdGhyb3VnaCAke2VuZHBvaW50SW5mb31gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfSAke2Vycn1gKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFN0b3JhZ2VFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdXNlZCB0byBnZXQgdGhlIG1pbGl0YXJ5IHZlcmlmaWNhdGlvbiBpbmZvcm1hdGlvbiBvZiBvbmVcbiAgICAgKiBvciBtdWx0aXBsZSB1c2VycywgZGVwZW5kaW5nIG9uIHRoZSBmaWx0ZXJzIHBhc3NlZCBpbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBnZXRNaWxpdGFyeVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uSW5wdXQgdGhlIGlucHV0IGNvbnRhaW5pbmcgdGhlIG1pbGl0YXJ5XG4gICAgICogdmVyaWZpY2F0aW9uIHJlbGV2YW50IGZpbHRlcmluZy5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIGEge0BsaW5rIE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0aW5nSW5mb3JtYXRpb25SZXNwb25zZX0sIHJlcHJlc2VudGluZyB0aGUgZmlsdGVyZWRcbiAgICAgKiBtaWxpdGFyeSB2ZXJpZmljYXRpb24gaW5mb3JtYXRpb24gcmVjb3Jkcy5cbiAgICAgKi9cbiAgICBhc3luYyBnZXRNaWxpdGFyeVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uKGdldE1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5mb3JtYXRpb25JbnB1dDogR2V0TWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbklucHV0KTogUHJvbWlzZTxNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydGluZ0luZm9ybWF0aW9uUmVzcG9uc2U+IHtcbiAgICAgICAgLy8gZWFzaWx5IGlkZW50aWZpYWJsZSBBUEkgZW5kcG9pbnQgaW5mb3JtYXRpb25cbiAgICAgICAgY29uc3QgZW5kcG9pbnRJbmZvID0gJ2dldE1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5mb3JtYXRpb24gUXVlcnkgTW9vbmJlYW0gR3JhcGhRTCBBUEknO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgQVBJIEtleSBhbmQgQmFzZSBVUkwsIG5lZWRlZCBpbiBvcmRlciB0byBtYWtlIHRoZSBtaWxpdGFyeSB2ZXJpZmljYXRpb24gaW5mb3JtYXRpb24gcmV0cmlldmFsIGNhbGwgdGhyb3VnaCB0aGUgY2xpZW50XG4gICAgICAgICAgICBjb25zdCBbbW9vbmJlYW1CYXNlVVJMLCBtb29uYmVhbVByaXZhdGVLZXldID0gYXdhaXQgc3VwZXIucmV0cmlldmVTZXJ2aWNlQ3JlZGVudGlhbHMoQ29uc3RhbnRzLkFXU1BhaXJDb25zdGFudHMuTU9PTkJFQU1fSU5URVJOQUxfU0VDUkVUX05BTUUpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgd2Ugb2J0YWluZWQgYW55IGludmFsaWQgc2VjcmV0IHZhbHVlcyBmcm9tIHRoZSBjYWxsIGFib3ZlXG4gICAgICAgICAgICBpZiAobW9vbmJlYW1CYXNlVVJMID09PSBudWxsIHx8IG1vb25iZWFtQmFzZVVSTC5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBtb29uYmVhbVByaXZhdGVLZXkgPT09IG51bGwgfHwgbW9vbmJlYW1Qcml2YXRlS2V5Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IFwiSW52YWxpZCBTZWNyZXRzIG9idGFpbmVkIGZvciBNb29uYmVhbSBBUEkgY2FsbCFcIjtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRpbmdFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBnZXRNaWxpdGFyeVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uIFF1ZXJ5XG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogYnVpbGQgdGhlIE1vb25iZWFtIEFwcFN5bmMgQVBJIEdyYXBoUUwgcXVlcnksIGFuZCBwZXJmb3JtIGEgUE9TVCB0byBpdCxcbiAgICAgICAgICAgICAqIHdpdGggdGhlIGFwcHJvcHJpYXRlIGluZm9ybWF0aW9uLlxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIHdlIGltcGx5IHRoYXQgaWYgdGhlIEFQSSBkb2VzIG5vdCByZXNwb25kIGluIDE1IHNlY29uZHMsIHRoZW4gd2UgYXV0b21hdGljYWxseSBjYXRjaCB0aGF0LCBhbmQgcmV0dXJuIGFuXG4gICAgICAgICAgICAgKiBlcnJvciBmb3IgYSBiZXR0ZXIgY3VzdG9tZXIgZXhwZXJpZW5jZS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgcmV0dXJuIGF4aW9zLnBvc3QoYCR7bW9vbmJlYW1CYXNlVVJMfWAsIHtcbiAgICAgICAgICAgICAgICBxdWVyeTogZ2V0TWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbixcbiAgICAgICAgICAgICAgICB2YXJpYWJsZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgZ2V0TWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbklucHV0OiBnZXRNaWxpdGFyeVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uSW5wdXRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAgICAgXCJ4LWFwaS1rZXlcIjogbW9vbmJlYW1Qcml2YXRlS2V5XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiAxNTAwMCwgLy8gaW4gbWlsbGlzZWNvbmRzIGhlcmVcbiAgICAgICAgICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlOiAnTW9vbmJlYW0gQVBJIHRpbWVkIG91dCBhZnRlciAxNTAwMG1zISdcbiAgICAgICAgICAgIH0pLnRoZW4oZ2V0TWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbklucHV0UmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShnZXRNaWxpdGFyeVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uSW5wdXRSZXNwb25zZS5kYXRhKX1gKTtcblxuICAgICAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBkYXRhIGJsb2NrIGZyb20gdGhlIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2VEYXRhID0gKGdldE1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5mb3JtYXRpb25JbnB1dFJlc3BvbnNlICYmIGdldE1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5mb3JtYXRpb25JbnB1dFJlc3BvbnNlLmRhdGEpXG4gICAgICAgICAgICAgICAgICAgID8gZ2V0TWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbklucHV0UmVzcG9uc2UuZGF0YS5kYXRhXG4gICAgICAgICAgICAgICAgICAgIDogbnVsbDtcblxuICAgICAgICAgICAgICAgIC8vIGNoZWNrIGlmIHRoZXJlIGFyZSBhbnkgZXJyb3JzIGluIHRoZSByZXR1cm5lZCByZXNwb25zZVxuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZURhdGEgJiYgcmVzcG9uc2VEYXRhLmdldE1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5mb3JtYXRpb24uZXJyb3JNZXNzYWdlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHJldHVybmVkIHRoZSBzdWNjZXNzZnVsbHkgcmV0cmlldmVkIHJlZmVycmFsc1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogcmVzcG9uc2VEYXRhLmdldE1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5mb3JtYXRpb24uZGF0YSBhcyBNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydGluZ0luZm9ybWF0aW9uW11cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZURhdGEgP1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBlcnJvciBtZXNzYWdlIGFuZCB0eXBlLCBmcm9tIHRoZSBvcmlnaW5hbCBBcHBTeW5jIGNhbGxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IHJlc3BvbnNlRGF0YS51cGRhdGVSZWZlcnJhbC5lcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiByZXNwb25zZURhdGEudXBkYXRlUmVmZXJyYWwuZXJyb3JUeXBlXG4gICAgICAgICAgICAgICAgICAgICAgICB9IDpcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgZXJyb3IgcmVzcG9uc2UgaW5kaWNhdGluZyBhbiBpbnZhbGlkIHN0cnVjdHVyZSByZXR1cm5lZFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogYEludmFsaWQgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gJHtlbmRwb2ludEluZm99IHJlc3BvbnNlIWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydGluZ0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yLnJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBhbmQgdGhlIHNlcnZlciByZXNwb25kZWQgd2l0aCBhIHN0YXR1cyBjb2RlXG4gICAgICAgICAgICAgICAgICAgICAqIHRoYXQgZmFsbHMgb3V0IG9mIHRoZSByYW5nZSBvZiAyeHguXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm9uIDJ4eHggcmVzcG9uc2Ugd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgd2l0aCBzdGF0dXMgJHtlcnJvci5yZXNwb25zZS5zdGF0dXN9LCBhbmQgcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShlcnJvci5yZXNwb25zZS5kYXRhKX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGFueSBvdGhlciBzcGVjaWZpYyBlcnJvcnMgdG8gYmUgZmlsdGVyZWQgYmVsb3dcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydGluZ0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVycm9yLnJlcXVlc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGJ1dCBubyByZXNwb25zZSB3YXMgcmVjZWl2ZWRcbiAgICAgICAgICAgICAgICAgICAgICogYGVycm9yLnJlcXVlc3RgIGlzIGFuIGluc3RhbmNlIG9mIFhNTEh0dHBSZXF1ZXN0IGluIHRoZSBicm93c2VyIGFuZCBhbiBpbnN0YW5jZSBvZlxuICAgICAgICAgICAgICAgICAgICAgKiAgaHR0cC5DbGllbnRSZXF1ZXN0IGluIG5vZGUuanMuXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm8gcmVzcG9uc2UgcmVjZWl2ZWQgd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgZm9yIHJlcXVlc3QgJHtlcnJvci5yZXF1ZXN0fWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydGluZ0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBTb21ldGhpbmcgaGFwcGVuZWQgaW4gc2V0dGluZyB1cCB0aGUgcmVxdWVzdCB0aGF0IHRyaWdnZXJlZCBhbiBFcnJvclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IGZvciB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgJHsoZXJyb3IgJiYgZXJyb3IubWVzc2FnZSkgJiYgZXJyb3IubWVzc2FnZX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRpbmdFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgcmV0cmlldmluZyBtaWxpdGFyeSB2ZXJpZmljYXRpb24gaW5mb3JtYXRpb24gdGhyb3VnaCAke2VuZHBvaW50SW5mb31gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfSAke2Vycn1gKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0aW5nRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHVzZWQgdG8gdXBkYXRlIGEgcmVmZXJyYWwncyBwYXJ0aWN1bGFyIGluZm9ybWF0aW9uLlxuICAgICAqXG4gICAgICogQHBhcmFtIHVwZGF0ZVJlZmVycmFsSW5wdXQgdGhlIGlucHV0IGNvbnRhaW5pbmcgYW55IGluZm9ybWF0aW9uIHJlbGV2YW50IGluXG4gICAgICogdXBkYXRpbmcgYW4gZXhpc3RpbmcgcmVmZXJyYWwgb2JqZWN0XG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBhIHtAbGluayBSZWZlcnJhbFJlc3BvbnNlfSwgcmVwcmVzZW50aW5nIHRoZSB1cGRhdGVkIHJlZmVycmFsIGluZm9ybWF0aW9uLlxuICAgICAqXG4gICAgICogQHByb3RlY3RlZFxuICAgICAqL1xuICAgIGFzeW5jIHVwZGF0ZVJlZmVycmFsKHVwZGF0ZVJlZmVycmFsSW5wdXQ6IFVwZGF0ZVJlZmVycmFsSW5wdXQpOiBQcm9taXNlPFJlZmVycmFsUmVzcG9uc2U+IHtcbiAgICAgICAgLy8gZWFzaWx5IGlkZW50aWZpYWJsZSBBUEkgZW5kcG9pbnQgaW5mb3JtYXRpb25cbiAgICAgICAgY29uc3QgZW5kcG9pbnRJbmZvID0gJ3VwZGF0ZVJlZmVycmFsIFF1ZXJ5IE1vb25iZWFtIEdyYXBoUUwgQVBJJztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIEFQSSBLZXkgYW5kIEJhc2UgVVJMLCBuZWVkZWQgaW4gb3JkZXIgdG8gbWFrZSB0aGUgcmVmZXJyYWwgdXBkYXRlZCBjYWxsIHRocm91Z2ggdGhlIGNsaWVudFxuICAgICAgICAgICAgY29uc3QgW21vb25iZWFtQmFzZVVSTCwgbW9vbmJlYW1Qcml2YXRlS2V5XSA9IGF3YWl0IHN1cGVyLnJldHJpZXZlU2VydmljZUNyZWRlbnRpYWxzKENvbnN0YW50cy5BV1NQYWlyQ29uc3RhbnRzLk1PT05CRUFNX0lOVEVSTkFMX1NFQ1JFVF9OQU1FKTtcblxuICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHdlIG9idGFpbmVkIGFueSBpbnZhbGlkIHNlY3JldCB2YWx1ZXMgZnJvbSB0aGUgY2FsbCBhYm92ZVxuICAgICAgICAgICAgaWYgKG1vb25iZWFtQmFzZVVSTCA9PT0gbnVsbCB8fCBtb29uYmVhbUJhc2VVUkwubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgbW9vbmJlYW1Qcml2YXRlS2V5ID09PSBudWxsIHx8IG1vb25iZWFtUHJpdmF0ZUtleS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBcIkludmFsaWQgU2VjcmV0cyBvYnRhaW5lZCBmb3IgTW9vbmJlYW0gQVBJIGNhbGwhXCI7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFJlZmVycmFsRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogdXBkYXRlUmVmZXJyYWwgUXVlcnlcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBidWlsZCB0aGUgTW9vbmJlYW0gQXBwU3luYyBBUEkgR3JhcGhRTCBxdWVyeSwgYW5kIHBlcmZvcm0gYSBQT1NUIHRvIGl0LFxuICAgICAgICAgICAgICogd2l0aCB0aGUgYXBwcm9wcmlhdGUgaW5mb3JtYXRpb24uXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogd2UgaW1wbHkgdGhhdCBpZiB0aGUgQVBJIGRvZXMgbm90IHJlc3BvbmQgaW4gMTUgc2Vjb25kcywgdGhlbiB3ZSBhdXRvbWF0aWNhbGx5IGNhdGNoIHRoYXQsIGFuZCByZXR1cm4gYW5cbiAgICAgICAgICAgICAqIGVycm9yIGZvciBhIGJldHRlciBjdXN0b21lciBleHBlcmllbmNlLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICByZXR1cm4gYXhpb3MucG9zdChgJHttb29uYmVhbUJhc2VVUkx9YCwge1xuICAgICAgICAgICAgICAgIHF1ZXJ5OiB1cGRhdGVSZWZlcnJhbCxcbiAgICAgICAgICAgICAgICB2YXJpYWJsZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlUmVmZXJyYWxJbnB1dDogdXBkYXRlUmVmZXJyYWxJbnB1dFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgICAgICBcIngtYXBpLWtleVwiOiBtb29uYmVhbVByaXZhdGVLZXlcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDE1MDAwLCAvLyBpbiBtaWxsaXNlY29uZHMgaGVyZVxuICAgICAgICAgICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2U6ICdNb29uYmVhbSBBUEkgdGltZWQgb3V0IGFmdGVyIDE1MDAwbXMhJ1xuICAgICAgICAgICAgfSkudGhlbih1cGRhdGVSZWZlcnJhbFJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlbmRwb2ludEluZm99IHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkodXBkYXRlUmVmZXJyYWxSZXNwb25zZS5kYXRhKX1gKTtcblxuICAgICAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBkYXRhIGJsb2NrIGZyb20gdGhlIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2VEYXRhID0gKHVwZGF0ZVJlZmVycmFsUmVzcG9uc2UgJiYgdXBkYXRlUmVmZXJyYWxSZXNwb25zZS5kYXRhKSA/IHVwZGF0ZVJlZmVycmFsUmVzcG9uc2UuZGF0YS5kYXRhIDogbnVsbDtcblxuICAgICAgICAgICAgICAgIC8vIGNoZWNrIGlmIHRoZXJlIGFyZSBhbnkgZXJyb3JzIGluIHRoZSByZXR1cm5lZCByZXNwb25zZVxuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZURhdGEgJiYgcmVzcG9uc2VEYXRhLnVwZGF0ZVJlZmVycmFsLmVycm9yTWVzc2FnZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm5lZCB0aGUgc3VjY2Vzc2Z1bGx5IHJldHJpZXZlZCByZWZlcnJhbHNcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHJlc3BvbnNlRGF0YS51cGRhdGVSZWZlcnJhbC5kYXRhIGFzIFJlZmVycmFsW11cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZURhdGEgP1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBlcnJvciBtZXNzYWdlIGFuZCB0eXBlLCBmcm9tIHRoZSBvcmlnaW5hbCBBcHBTeW5jIGNhbGxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IHJlc3BvbnNlRGF0YS51cGRhdGVSZWZlcnJhbC5lcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiByZXNwb25zZURhdGEudXBkYXRlUmVmZXJyYWwuZXJyb3JUeXBlXG4gICAgICAgICAgICAgICAgICAgICAgICB9IDpcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgZXJyb3IgcmVzcG9uc2UgaW5kaWNhdGluZyBhbiBpbnZhbGlkIHN0cnVjdHVyZSByZXR1cm5lZFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogYEludmFsaWQgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gJHtlbmRwb2ludEluZm99IHJlc3BvbnNlIWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBSZWZlcnJhbEVycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yLnJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBhbmQgdGhlIHNlcnZlciByZXNwb25kZWQgd2l0aCBhIHN0YXR1cyBjb2RlXG4gICAgICAgICAgICAgICAgICAgICAqIHRoYXQgZmFsbHMgb3V0IG9mIHRoZSByYW5nZSBvZiAyeHguXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm9uIDJ4eHggcmVzcG9uc2Ugd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgd2l0aCBzdGF0dXMgJHtlcnJvci5yZXNwb25zZS5zdGF0dXN9LCBhbmQgcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShlcnJvci5yZXNwb25zZS5kYXRhKX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGFueSBvdGhlciBzcGVjaWZpYyBlcnJvcnMgdG8gYmUgZmlsdGVyZWQgYmVsb3dcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBSZWZlcnJhbEVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVycm9yLnJlcXVlc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGJ1dCBubyByZXNwb25zZSB3YXMgcmVjZWl2ZWRcbiAgICAgICAgICAgICAgICAgICAgICogYGVycm9yLnJlcXVlc3RgIGlzIGFuIGluc3RhbmNlIG9mIFhNTEh0dHBSZXF1ZXN0IGluIHRoZSBicm93c2VyIGFuZCBhbiBpbnN0YW5jZSBvZlxuICAgICAgICAgICAgICAgICAgICAgKiAgaHR0cC5DbGllbnRSZXF1ZXN0IGluIG5vZGUuanMuXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm8gcmVzcG9uc2UgcmVjZWl2ZWQgd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgZm9yIHJlcXVlc3QgJHtlcnJvci5yZXF1ZXN0fWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBSZWZlcnJhbEVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBTb21ldGhpbmcgaGFwcGVuZWQgaW4gc2V0dGluZyB1cCB0aGUgcmVxdWVzdCB0aGF0IHRyaWdnZXJlZCBhbiBFcnJvclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IGZvciB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgJHsoZXJyb3IgJiYgZXJyb3IubWVzc2FnZSkgJiYgZXJyb3IubWVzc2FnZX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogUmVmZXJyYWxFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgdXBkYXRpbmcgcmVmZXJyYWwgdGhyb3VnaCAke2VuZHBvaW50SW5mb31gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfSAke2Vycn1gKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFJlZmVycmFsRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHVzZWQgdG8gZ2V0IGV4aXN0aW5nIHJlZmVycmFscyBmaWx0ZXJlZCBieSBhIHBhcnRpY3VsYXIgc3RhdHVzLlxuICAgICAqXG4gICAgICogQHBhcmFtIGdldFJlZmVycmFsc0J5U3RhdHVzSW5wdXQgdGhlIGlucHV0IGNvbnRhaW5pbmcgYW55IGZpbHRlcmluZyBpbmZvcm1hdGlvblxuICAgICAqIHBlcnRhaW5pbmcgdGhlIHJlZmVycmFsIHN0YXR1cyB0aGF0IHdlIHdvdWxkIHVzZSB0byBmaWx0ZXIgZXhpc3RpbmcgcmVmZXJyYWxzIGJ5LlxuICAgICAqXG4gICAgICogQHJldHVybnMgYSB7QGxpbmsgUmVmZXJyYWxSZXNwb25zZX0sIHJlcHJlc2VudGluZyB0aGUgcmVmZXJyYWwgaW5mb3JtYXRpb24gZmlsdGVyZWRcbiAgICAgKiBieSBzdGF0dXMuXG4gICAgICpcbiAgICAgKiBAcHJvdGVjdGVkXG4gICAgICovXG4gICAgYXN5bmMgZ2V0UmVmZXJyYWxCeVN0YXR1cyhnZXRSZWZlcnJhbHNCeVN0YXR1c0lucHV0OiBHZXRSZWZlcnJhbHNCeVN0YXR1c0lucHV0KTogUHJvbWlzZTxSZWZlcnJhbFJlc3BvbnNlPiB7XG4gICAgICAgIC8vIGVhc2lseSBpZGVudGlmaWFibGUgQVBJIGVuZHBvaW50IGluZm9ybWF0aW9uXG4gICAgICAgIGNvbnN0IGVuZHBvaW50SW5mbyA9ICdnZXRSZWZlcnJhbEJ5U3RhdHVzIFF1ZXJ5IE1vb25iZWFtIEdyYXBoUUwgQVBJJztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIEFQSSBLZXkgYW5kIEJhc2UgVVJMLCBuZWVkZWQgaW4gb3JkZXIgdG8gbWFrZSB0aGUgcmVmZXJyYWwgYnkgc3RhdHVzIHJldHJpZXZhbCBjYWxsIHRocm91Z2ggdGhlIGNsaWVudFxuICAgICAgICAgICAgY29uc3QgW21vb25iZWFtQmFzZVVSTCwgbW9vbmJlYW1Qcml2YXRlS2V5XSA9IGF3YWl0IHN1cGVyLnJldHJpZXZlU2VydmljZUNyZWRlbnRpYWxzKENvbnN0YW50cy5BV1NQYWlyQ29uc3RhbnRzLk1PT05CRUFNX0lOVEVSTkFMX1NFQ1JFVF9OQU1FKTtcblxuICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHdlIG9idGFpbmVkIGFueSBpbnZhbGlkIHNlY3JldCB2YWx1ZXMgZnJvbSB0aGUgY2FsbCBhYm92ZVxuICAgICAgICAgICAgaWYgKG1vb25iZWFtQmFzZVVSTCA9PT0gbnVsbCB8fCBtb29uYmVhbUJhc2VVUkwubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgbW9vbmJlYW1Qcml2YXRlS2V5ID09PSBudWxsIHx8IG1vb25iZWFtUHJpdmF0ZUtleS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBcIkludmFsaWQgU2VjcmV0cyBvYnRhaW5lZCBmb3IgTW9vbmJlYW0gQVBJIGNhbGwhXCI7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFJlZmVycmFsRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogZ2V0UmVmZXJyYWxCeVN0YXR1cyBRdWVyeVxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIGJ1aWxkIHRoZSBNb29uYmVhbSBBcHBTeW5jIEFQSSBHcmFwaFFMIHF1ZXJ5LCBhbmQgcGVyZm9ybSBhIFBPU1QgdG8gaXQsXG4gICAgICAgICAgICAgKiB3aXRoIHRoZSBhcHByb3ByaWF0ZSBpbmZvcm1hdGlvbi5cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiB3ZSBpbXBseSB0aGF0IGlmIHRoZSBBUEkgZG9lcyBub3QgcmVzcG9uZCBpbiAxNSBzZWNvbmRzLCB0aGVuIHdlIGF1dG9tYXRpY2FsbHkgY2F0Y2ggdGhhdCwgYW5kIHJldHVybiBhblxuICAgICAgICAgICAgICogZXJyb3IgZm9yIGEgYmV0dGVyIGN1c3RvbWVyIGV4cGVyaWVuY2UuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHJldHVybiBheGlvcy5wb3N0KGAke21vb25iZWFtQmFzZVVSTH1gLCB7XG4gICAgICAgICAgICAgICAgcXVlcnk6IGdldFJlZmVycmFsc0J5U3RhdHVzLFxuICAgICAgICAgICAgICAgIHZhcmlhYmxlczoge1xuICAgICAgICAgICAgICAgICAgICBnZXRSZWZlcnJhbHNCeVN0YXR1c0lucHV0OiBnZXRSZWZlcnJhbHNCeVN0YXR1c0lucHV0XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgICAgIFwieC1hcGkta2V5XCI6IG1vb25iZWFtUHJpdmF0ZUtleVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGltZW91dDogMTUwMDAsIC8vIGluIG1pbGxpc2Vjb25kcyBoZXJlXG4gICAgICAgICAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZTogJ01vb25iZWFtIEFQSSB0aW1lZCBvdXQgYWZ0ZXIgMTUwMDBtcyEnXG4gICAgICAgICAgICB9KS50aGVuKGdldFJlZmVycmFsc0J5U3RhdHVzUmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShnZXRSZWZlcnJhbHNCeVN0YXR1c1Jlc3BvbnNlLmRhdGEpfWApO1xuXG4gICAgICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIGRhdGEgYmxvY2sgZnJvbSB0aGUgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICBjb25zdCByZXNwb25zZURhdGEgPSAoZ2V0UmVmZXJyYWxzQnlTdGF0dXNSZXNwb25zZSAmJiBnZXRSZWZlcnJhbHNCeVN0YXR1c1Jlc3BvbnNlLmRhdGEpID8gZ2V0UmVmZXJyYWxzQnlTdGF0dXNSZXNwb25zZS5kYXRhLmRhdGEgOiBudWxsO1xuXG4gICAgICAgICAgICAgICAgLy8gY2hlY2sgaWYgdGhlcmUgYXJlIGFueSBlcnJvcnMgaW4gdGhlIHJldHVybmVkIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlRGF0YSAmJiByZXNwb25zZURhdGEuZ2V0UmVmZXJyYWxzQnlTdGF0dXMuZXJyb3JNZXNzYWdlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHJldHVybmVkIHRoZSBzdWNjZXNzZnVsbHkgcmV0cmlldmVkIHJlZmVycmFsc1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogcmVzcG9uc2VEYXRhLmdldFJlZmVycmFsc0J5U3RhdHVzLmRhdGEgYXMgUmVmZXJyYWxbXVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlRGF0YSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIGVycm9yIG1lc3NhZ2UgYW5kIHR5cGUsIGZyb20gdGhlIG9yaWdpbmFsIEFwcFN5bmMgY2FsbFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogcmVzcG9uc2VEYXRhLmdldFJlZmVycmFsc0J5U3RhdHVzLmVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IHJlc3BvbnNlRGF0YS5nZXRSZWZlcnJhbHNCeVN0YXR1cy5lcnJvclR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gOlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBlcnJvciByZXNwb25zZSBpbmRpY2F0aW5nIGFuIGludmFsaWQgc3RydWN0dXJlIHJldHVybmVkXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgSW52YWxpZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UhYCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFJlZmVycmFsRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IucmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGFuZCB0aGUgc2VydmVyIHJlc3BvbmRlZCB3aXRoIGEgc3RhdHVzIGNvZGVcbiAgICAgICAgICAgICAgICAgICAgICogdGhhdCBmYWxscyBvdXQgb2YgdGhlIHJhbmdlIG9mIDJ4eC5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBOb24gMnh4eCByZXNwb25zZSB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gTW9vbmJlYW0gQVBJLCB3aXRoIHN0YXR1cyAke2Vycm9yLnJlc3BvbnNlLnN0YXR1c30sIGFuZCByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGVycm9yLnJlc3BvbnNlLmRhdGEpfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gYW55IG90aGVyIHNwZWNpZmljIGVycm9ycyB0byBiZSBmaWx0ZXJlZCBiZWxvd1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFJlZmVycmFsRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3IucmVxdWVzdCkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYnV0IG5vIHJlc3BvbnNlIHdhcyByZWNlaXZlZFxuICAgICAgICAgICAgICAgICAgICAgKiBgZXJyb3IucmVxdWVzdGAgaXMgYW4gaW5zdGFuY2Ugb2YgWE1MSHR0cFJlcXVlc3QgaW4gdGhlIGJyb3dzZXIgYW5kIGFuIGluc3RhbmNlIG9mXG4gICAgICAgICAgICAgICAgICAgICAqICBodHRwLkNsaWVudFJlcXVlc3QgaW4gbm9kZS5qcy5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBObyByZXNwb25zZSByZWNlaXZlZCB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gTW9vbmJlYW0gQVBJLCBmb3IgcmVxdWVzdCAke2Vycm9yLnJlcXVlc3R9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFJlZmVycmFsRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNvbWV0aGluZyBoYXBwZW5lZCBpbiBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IHRoYXQgdHJpZ2dlcmVkIGFuIEVycm9yXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgZm9yIHRoZSAke2VuZHBvaW50SW5mb30gTW9vbmJlYW0gQVBJLCAkeyhlcnJvciAmJiBlcnJvci5tZXNzYWdlKSAmJiBlcnJvci5tZXNzYWdlfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBSZWZlcnJhbEVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSByZXRyaWV2aW5nIHJlZmVycmFscyBieSBzdGF0dXMgdGhyb3VnaCAke2VuZHBvaW50SW5mb31gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfSAke2Vycn1gKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFJlZmVycmFsRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHVzZWQgdG8gZ2V0IGEgdXNlcidzIGNvbnRhY3QgaW5mb3JtYXRpb24sIGJhc2VkIG9uIGNlcnRhaW5cbiAgICAgKiBmaWx0ZXJzLlxuICAgICAqXG4gICAgICogQHBhcmFtIGNvbnRhY3RJbmZvcm1hdGlvbklucHV0IGNvbnRhY3QgaW5mb3JtYXRpb24gaW5wdXQgcGFzc2VkIGluLCBjb250YWluaW5nIHRoZVxuICAgICAqIGZpbHRlcnMgdXNlZCB0byByZXRyaWV2ZSB0aGUgdXNlcidzIGNvbnRhY3QgaW5mb3JtYXRpb24uXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBhIHtAbGluayBNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydGluZ0luZm9ybWF0aW9uUmVzcG9uc2V9LCByZXByZXNlbnRpbmcgdGhlIHVzZXIncyBmaWx0ZXJlZFxuICAgICAqIGNvbnRhY3QgaW5mb3JtYXRpb24uXG4gICAgICovXG4gICAgYXN5bmMgcmV0cmlldmVDb250YWN0SW5mb3JtYXRpb25Gb3JVc2VyKGNvbnRhY3RJbmZvcm1hdGlvbklucHV0OiBNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydGluZ0luZm9ybWF0aW9uKTogUHJvbWlzZTxNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydGluZ0luZm9ybWF0aW9uUmVzcG9uc2U+IHtcbiAgICAgICAgLy8gZWFzaWx5IGlkZW50aWZpYWJsZSBBUEkgZW5kcG9pbnQgaW5mb3JtYXRpb25cbiAgICAgICAgY29uc3QgZW5kcG9pbnRJbmZvID0gJy9saXN0VXNlcnMgZm9yIHJldHJpZXZlQ29udGFjdEluZm9ybWF0aW9uRm9yVXNlciBDb2duaXRvIFNESyBjYWxsJztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIENvZ25pdG8gYWNjZXNzIGtleSwgc2VjcmV0IGtleSBhbmQgdXNlciBwb29sIGlkLCBuZWVkZWQgaW4gb3JkZXIgdG8gcmV0cmlldmUgdGhlIGZpbHRlcmVkIHVzZXJzLCB0aHJvdWdoIHRoZSBDb2duaXRvIElkZW50aXR5IHByb3ZpZGVyIGNsaWVudFxuICAgICAgICAgICAgY29uc3QgW2NvZ25pdG9BY2Nlc3NLZXlJZCwgY29nbml0b1NlY3JldEtleSwgY29nbml0b1VzZXJQb29sSWRdID0gYXdhaXQgc3VwZXIucmV0cmlldmVTZXJ2aWNlQ3JlZGVudGlhbHMoQ29uc3RhbnRzLkFXU1BhaXJDb25zdGFudHMuTU9PTkJFQU1fSU5URVJOQUxfU0VDUkVUX05BTUUsXG4gICAgICAgICAgICAgICAgdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgdHJ1ZSk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB3ZSBvYnRhaW5lZCBhbnkgaW52YWxpZCBzZWNyZXQgdmFsdWVzIGZyb20gdGhlIGNhbGwgYWJvdmVcbiAgICAgICAgICAgIGlmIChjb2duaXRvQWNjZXNzS2V5SWQgPT09IG51bGwgfHwgY29nbml0b0FjY2Vzc0tleUlkLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIGNvZ25pdG9TZWNyZXRLZXkgPT09IG51bGwgfHwgY29nbml0b1NlY3JldEtleS5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBjb2duaXRvVXNlclBvb2xJZCA9PT0gbnVsbCB8fCAoY29nbml0b1VzZXJQb29sSWQgJiYgY29nbml0b1VzZXJQb29sSWQubGVuZ3RoID09PSAwKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IFwiSW52YWxpZCBTZWNyZXRzIG9idGFpbmVkIGZvciBDb2duaXRvIFNESyBjYWxsIGNhbGwhXCI7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVwb3J0aW5nRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGluaXRpYWxpemUgdGhlIENvZ25pdG8gSWRlbnRpdHkgUHJvdmlkZXIgY2xpZW50IHVzaW5nIHRoZSBjcmVkZW50aWFscyBvYnRhaW5lZCBhYm92ZVxuICAgICAgICAgICAgY29uc3QgY29nbml0b0lkZW50aXR5UHJvdmlkZXJDbGllbnQgPSBuZXcgQ29nbml0b0lkZW50aXR5UHJvdmlkZXJDbGllbnQoe1xuICAgICAgICAgICAgICAgIHJlZ2lvbjogdGhpcy5yZWdpb24sXG4gICAgICAgICAgICAgICAgY3JlZGVudGlhbHM6IHtcbiAgICAgICAgICAgICAgICAgICAgYWNjZXNzS2V5SWQ6IGNvZ25pdG9BY2Nlc3NLZXlJZCxcbiAgICAgICAgICAgICAgICAgICAgc2VjcmV0QWNjZXNzS2V5OiBjb2duaXRvU2VjcmV0S2V5XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogZXhlY3V0ZSB0aGUgTGlzdCBVc2VycyBjb21tYW5kLCB1c2luZyBmaWx0ZXJzLCBpbiBvcmRlciB0byByZXRyaWV2ZSBhIHVzZXIncyBjb250YWN0IGluZm9ybWF0aW9uXG4gICAgICAgICAgICAgKiAoZW1haWwgYW5kIHBob25lIG51bWJlcikgZnJvbSB0aGVpciBhdHRyaWJ1dGVzLlxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIFJldHJpZXZlIHRoZSB1c2VyIGJ5IHRoZWlyIGZhbWlseV9uYW1lLiBJZiB0aGVyZSBhcmUgaXMgbW9yZSB0aGFuIDEgbWF0Y2ggcmV0dXJuZWQsIHRoZW4gd2Ugd2lsbCBtYXRjaFxuICAgICAgICAgICAgICogdGhlIHVzZXIgYmFzZWQgb24gdGhlaXIgdW5pcXVlIGlkLCBmcm9tIHRoZSBjdXN0b206dXNlcklkIGF0dHJpYnV0ZVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBjb25zdCBsaXN0VXNlcnNSZXNwb25zZTogTGlzdFVzZXJzQ29tbWFuZE91dHB1dCA9IGF3YWl0IGNvZ25pdG9JZGVudGl0eVByb3ZpZGVyQ2xpZW50LnNlbmQobmV3IExpc3RVc2Vyc0NvbW1hbmQoe1xuICAgICAgICAgICAgICAgIFVzZXJQb29sSWQ6IGNvZ25pdG9Vc2VyUG9vbElkLFxuICAgICAgICAgICAgICAgIEF0dHJpYnV0ZXNUb0dldDogWydlbWFpbCcsICdwaG9uZV9udW1iZXInLCAnY3VzdG9tOnVzZXJJZCddLFxuICAgICAgICAgICAgICAgIEZpbHRlcjogYGZhbWlseV9uYW1lPSBcIiR7YCR7Y29udGFjdEluZm9ybWF0aW9uSW5wdXQubGFzdE5hbWV9YC5yZXBsYWNlQWxsKFwiXFxcIlwiLCBcIlxcXFxcXFwiXCIpfVwiYFxuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgLy8gY2hlY2sgZm9yIGEgdmFsaWQgcmVzcG9uc2UgZnJvbSB0aGUgQ29nbml0byBMaXN0IFVzZXJzIENvbW1hbmQgY2FsbFxuICAgICAgICAgICAgaWYgKGxpc3RVc2Vyc1Jlc3BvbnNlICE9PSBudWxsICYmIGxpc3RVc2Vyc1Jlc3BvbnNlLiRtZXRhZGF0YSAhPT0gbnVsbCAmJiBsaXN0VXNlcnNSZXNwb25zZS4kbWV0YWRhdGEuaHR0cFN0YXR1c0NvZGUgIT09IG51bGwgJiZcbiAgICAgICAgICAgICAgICBsaXN0VXNlcnNSZXNwb25zZS4kbWV0YWRhdGEuaHR0cFN0YXR1c0NvZGUgIT09IHVuZGVmaW5lZCAmJiBsaXN0VXNlcnNSZXNwb25zZS4kbWV0YWRhdGEuaHR0cFN0YXR1c0NvZGUgPT09IDIwMCAmJlxuICAgICAgICAgICAgICAgIGxpc3RVc2Vyc1Jlc3BvbnNlLlVzZXJzICE9PSBudWxsICYmIGxpc3RVc2Vyc1Jlc3BvbnNlLlVzZXJzICE9PSB1bmRlZmluZWQgJiYgbGlzdFVzZXJzUmVzcG9uc2UuVXNlcnMhLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgICAgIC8vIElmIHRoZXJlIGFyZSBpcyBtb3JlIHRoYW4gMSBtYXRjaCByZXR1cm5lZCwgdGhlbiB3ZSB3aWxsIG1hdGNoIHRoZSB1c2VyIGJhc2VkIG9uIHRoZWlyIHVuaXF1ZSBpZCwgZnJvbSB0aGUgY3VzdG9tOnVzZXJJZCBhdHRyaWJ1dGVcbiAgICAgICAgICAgICAgICBsZXQgaW52YWxpZEF0dHJpYnV0ZXNGbGFnID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgbGlzdFVzZXJzUmVzcG9uc2UuVXNlcnMuZm9yRWFjaChjb2duaXRvVXNlciA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb2duaXRvVXNlci5BdHRyaWJ1dGVzID09PSBudWxsIHx8IGNvZ25pdG9Vc2VyLkF0dHJpYnV0ZXMgPT09IHVuZGVmaW5lZCB8fCBjb2duaXRvVXNlci5BdHRyaWJ1dGVzLmxlbmd0aCAhPT0gMykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW52YWxpZEF0dHJpYnV0ZXNGbGFnID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIC8vIGNoZWNrIGZvciB2YWxpZCB1c2VyIGF0dHJpYnV0ZXNcbiAgICAgICAgICAgICAgICBpZiAoIWludmFsaWRBdHRyaWJ1dGVzRmxhZykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbWF0Y2hlZEVtYWlsOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1hdGNoZWRQaG9uZU51bWJlcjogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG5cbiAgICAgICAgICAgICAgICAgICAgbGV0IG5vT2ZNYXRjaGVzID0gMDtcbiAgICAgICAgICAgICAgICAgICAgbGlzdFVzZXJzUmVzcG9uc2UuVXNlcnMuZm9yRWFjaChjb2duaXRvVXNlciA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29nbml0b1VzZXIuQXR0cmlidXRlcyFbMl0uVmFsdWUhLnRyaW0oKSA9PT0gY29udGFjdEluZm9ybWF0aW9uSW5wdXQuaWQudHJpbSgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2hlZEVtYWlsID0gY29nbml0b1VzZXIuQXR0cmlidXRlcyFbMF0uVmFsdWUhO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoZWRQaG9uZU51bWJlciA9IGNvZ25pdG9Vc2VyLkF0dHJpYnV0ZXMhWzFdLlZhbHVlITtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub09mTWF0Y2hlcyArPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vT2ZNYXRjaGVzID09PSAxICYmIG1hdGNoZWRFbWFpbCAhPT0gbnVsbCAmJiBtYXRjaGVkUGhvbmVOdW1iZXIgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhY3RJbmZvcm1hdGlvbklucHV0LnBob25lTnVtYmVyID0gbWF0Y2hlZFBob25lTnVtYmVyO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGFjdEluZm9ybWF0aW9uSW5wdXQuZW1haWxBZGRyZXNzID0gbWF0Y2hlZEVtYWlsO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBbY29udGFjdEluZm9ybWF0aW9uSW5wdXRdXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgQ291bGRuJ3QgZmluZCB1c2VyIGluIENvZ25pdG8gZm9yICR7Y29udGFjdEluZm9ybWF0aW9uSW5wdXQuaWR9YDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX1gKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRpbmdFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYEludmFsaWQgdXNlciBhdHRyaWJ1dGVzIG9idGFpbmVkYDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfWApO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydGluZ0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYEludmFsaWQgc3RydWN0dXJlIG9idGFpbmVkIHdoaWxlIGNhbGxpbmcgdGhlIGdldCBMaXN0IFVzZXJzIENvZ25pdG8gY29tbWFuZGA7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfWApO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBNaWxpdGFyeVZlcmlmaWNhdGlvblJlcG9ydGluZ0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3IsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSByZXRyaWV2aW5nIHRoZSBjb250YWN0IGluZm9ybWF0aW9uIGZvciB1c2VyICR7Y29udGFjdEluZm9ybWF0aW9uSW5wdXQuaWR9LCBmcm9tIENvZ25pdG8gdGhyb3VnaCAke2VuZHBvaW50SW5mb31gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfSAke2Vycn1gKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBkYXRhOiBudWxsLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTWlsaXRhcnlWZXJpZmljYXRpb25SZXBvcnRpbmdFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yLFxuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdXNlZCB0byBnZXQgYWxsIHRoZSB1c2VycyB1c2VkIHRvIGRlbGl2ZXIgbm90aWZpY2F0aW9uIHJlbWluZGVycyB0byxcbiAgICAgKiBzb3J0ZWQgYnkgYSBwYXJ0aWN1bGFyIGxvY2F0aW9uLlxuICAgICAqXG4gICAgICogQHBhcmFtIGdldFVzZXJzQnlHZW9ncmFwaGljYWxMb2NhdGlvbklucHV0IHRoZSBnZW9sb2NhdGlvbiBpbnB1dCB0aGF0IHdlIGZpbHRlciB1c2VycyBieVxuICAgICAqXG4gICAgICogQHJldHVybnMgYSB7QGxpbmsgVXNlckZvck5vdGlmaWNhdGlvblJlbWluZGVyUmVzcG9uc2V9LCByZXByZXNlbnRpbmcgZWFjaCBpbmRpdmlkdWFsIHVzZXJzJ1xuICAgICAqIHVzZXIgSUQsIGZpcnN0LCBsYXN0IG5hbWUgYW5kIGVtYWlsLCBzb3J0ZWQgYnkgYSBwYXJ0aWN1bGFyIGxvY2F0aW9uIChjaXR5ICYgc3RhdGUgY29tYmluYXRpb24pLlxuICAgICAqL1xuICAgIGFzeW5jIGdldFVzZXJzQnlHZW9ncmFwaHlGb3JOb3RpZmljYXRpb25SZW1pbmRlcnMoZ2V0VXNlcnNCeUdlb2dyYXBoaWNhbExvY2F0aW9uSW5wdXQ6IEdldFVzZXJzQnlHZW9ncmFwaGljYWxMb2NhdGlvbklucHV0KTogUHJvbWlzZTxVc2VyRm9yTm90aWZpY2F0aW9uUmVtaW5kZXJSZXNwb25zZT4ge1xuICAgICAgICAvLyBlYXNpbHkgaWRlbnRpZmlhYmxlIEFQSSBlbmRwb2ludCBpbmZvcm1hdGlvblxuICAgICAgICBjb25zdCBlbmRwb2ludEluZm8gPSAnL2xpc3RVc2VycyBmb3IgZ2V0VXNlcnNCeUdlb2dyYXBoeUZvck5vdGlmaWNhdGlvblJlbWluZGVycyBDb2duaXRvIFNESyBjYWxsJztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIENvZ25pdG8gYWNjZXNzIGtleSwgc2VjcmV0IGtleSBhbmQgdXNlciBwb29sIGlkLCBuZWVkZWQgaW4gb3JkZXIgdG8gcmV0cmlldmUgYWxsIHVzZXJzIHNvcnRlZCBieSBsb2NhdGlvbiwgdGhyb3VnaCB0aGUgQ29nbml0byBJZGVudGl0eSBwcm92aWRlciBjbGllbnRcbiAgICAgICAgICAgIGNvbnN0IFtjb2duaXRvQWNjZXNzS2V5SWQsIGNvZ25pdG9TZWNyZXRLZXksIGNvZ25pdG9Vc2VyUG9vbElkXSA9IGF3YWl0IHN1cGVyLnJldHJpZXZlU2VydmljZUNyZWRlbnRpYWxzKENvbnN0YW50cy5BV1NQYWlyQ29uc3RhbnRzLk1PT05CRUFNX0lOVEVSTkFMX1NFQ1JFVF9OQU1FLFxuICAgICAgICAgICAgICAgIHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIHRydWUpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgd2Ugb2J0YWluZWQgYW55IGludmFsaWQgc2VjcmV0IHZhbHVlcyBmcm9tIHRoZSBjYWxsIGFib3ZlXG4gICAgICAgICAgICBpZiAoY29nbml0b0FjY2Vzc0tleUlkID09PSBudWxsIHx8IGNvZ25pdG9BY2Nlc3NLZXlJZC5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBjb2duaXRvU2VjcmV0S2V5ID09PSBudWxsIHx8IGNvZ25pdG9TZWNyZXRLZXkubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgY29nbml0b1VzZXJQb29sSWQgPT09IG51bGwgfHwgKGNvZ25pdG9Vc2VyUG9vbElkICYmIGNvZ25pdG9Vc2VyUG9vbElkLmxlbmd0aCA9PT0gMCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBcIkludmFsaWQgU2VjcmV0cyBvYnRhaW5lZCBmb3IgQ29nbml0byBTREsgY2FsbCBjYWxsIVwiO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25SZW1pbmRlckVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBpbml0aWFsaXplIHRoZSBDb2duaXRvIElkZW50aXR5IFByb3ZpZGVyIGNsaWVudCB1c2luZyB0aGUgY3JlZGVudGlhbHMgb2J0YWluZWQgYWJvdmVcbiAgICAgICAgICAgIGNvbnN0IGNvZ25pdG9JZGVudGl0eVByb3ZpZGVyQ2xpZW50ID0gbmV3IENvZ25pdG9JZGVudGl0eVByb3ZpZGVyQ2xpZW50KHtcbiAgICAgICAgICAgICAgICByZWdpb246IHRoaXMucmVnaW9uLFxuICAgICAgICAgICAgICAgIGNyZWRlbnRpYWxzOiB7XG4gICAgICAgICAgICAgICAgICAgIGFjY2Vzc0tleUlkOiBjb2duaXRvQWNjZXNzS2V5SWQsXG4gICAgICAgICAgICAgICAgICAgIHNlY3JldEFjY2Vzc0tleTogY29nbml0b1NlY3JldEtleVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIGV4ZWN1dGUgdGhldyBMaXN0IFVzZXJzIGNvbW1hbmQsIHdpdGhvdXQgYW55IGZpbHRlcnMsIGluIG9yZGVyIHRvIHJldHJpZXZlIGEgdXNlcidzIGVtYWlsLCBhZGRyZXNzXG4gICAgICAgICAgICAgKiBhbmQgdGhlaXIgY3VzdG9tIHVzZXIgSUQsIGZyb20gdGhlaXIgYXR0cmlidXRlcy5cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBUaGVzZSByZXN1bHRzIGFyZSBnb2luZyB0byBiZSBwYWdpbmF0ZWQsIHNvIHdlIHdpbGwgbGltaXQgdGhlIHBhZ2Ugc2l6ZSB0byA2MCB1c2VycyAobWF4aW11bSBhbGxvd2VkIHRocm91Z2ggdGhpc1xuICAgICAgICAgICAgICogY2FsbCksIGFuZCBrZWVwIHRyYWNrIG9mIHRoZSBudW1iZXIgb2YgcGFnZXMgYW5kIGxhY2sgdGhlcmVvZiwgdGhyb3VnaCBhIGZsYWcuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGNvbnN0IHVzZXJSZXN1bHRzOiBVc2VyVHlwZVtdID0gW107XG4gICAgICAgICAgICBsZXQgbGFzdFBhZ2luYXRpb25Ub2tlbjogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgICAgICAgICAgbGV0IGlucHV0OiBMaXN0VXNlcnNDb21tYW5kSW5wdXQgPSB7XG4gICAgICAgICAgICAgICAgVXNlclBvb2xJZDogY29nbml0b1VzZXJQb29sSWQsXG4gICAgICAgICAgICAgICAgQXR0cmlidXRlc1RvR2V0OiBbJ2dpdmVuX25hbWUnLCAnZmFtaWx5X25hbWUnLCAnZW1haWwnLCAnY3VzdG9tOnVzZXJJZCcsICdhZGRyZXNzJ10sXG4gICAgICAgICAgICAgICAgTGltaXQ6IDYwLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIC8vIGtlZXAgZ2V0dGluZyB1c2VycyBhbmQgdXBkYXRpbmcgdGhlIHJlc3VsdHMgYXJyYXkgZm9yIHVzZXJzIHJldHJpZXZlZCwgdW50aWwgd2UgcnVuIG91dCBvZiB1c2VycyB0byByZXRyaWV2ZVxuICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgIC8vIGV4ZWN1dGUgdGhlIExpc3QgVXNlcnMgY29tbWFuZCwgZ2l2ZW4gdGhlIGlucHV0IHByb3ZpZGVkIGFib3ZlXG4gICAgICAgICAgICAgICAgY29uc3QgbGlzdFVzZXJzUmVzcG9uc2U6IExpc3RVc2Vyc0NvbW1hbmRPdXRwdXQgPSBhd2FpdCBjb2duaXRvSWRlbnRpdHlQcm92aWRlckNsaWVudC5zZW5kKFxuICAgICAgICAgICAgICAgICAgICBuZXcgTGlzdFVzZXJzQ29tbWFuZChpbnB1dClcbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogY2hlY2sgd2hldGhlciB0aGUgTGlzdCBVc2VycyBDb21tYW5kIGhhcyBhIHZhbGlkIHJlc3BvbnNlLyB2YWxpZCBsaXN0IG9mIHVzZXJzIHRvIGJlIHJldHVybmVkLFxuICAgICAgICAgICAgICAgICAqIGFuZCBpZiBzbyBhZGQgaW4gdGhlIHJlc3VsdGluZyBsaXN0IGFjY29yZGluZ2x5LlxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGxpc3RVc2Vyc1Jlc3BvbnNlLiRtZXRhZGF0YSAhPT0gbnVsbCAmJiBsaXN0VXNlcnNSZXNwb25zZS4kbWV0YWRhdGEuaHR0cFN0YXR1c0NvZGUgIT09IG51bGwgJiZcbiAgICAgICAgICAgICAgICBsaXN0VXNlcnNSZXNwb25zZS4kbWV0YWRhdGEuaHR0cFN0YXR1c0NvZGUgIT09IHVuZGVmaW5lZCAmJiBsaXN0VXNlcnNSZXNwb25zZS4kbWV0YWRhdGEuaHR0cFN0YXR1c0NvZGUgPT09IDIwMCAmJlxuICAgICAgICAgICAgICAgIGxpc3RVc2Vyc1Jlc3BvbnNlLlVzZXJzICE9PSBudWxsICYmIGxpc3RVc2Vyc1Jlc3BvbnNlLlVzZXJzICE9PSB1bmRlZmluZWQgJiYgbGlzdFVzZXJzUmVzcG9uc2UuVXNlcnMhLmxlbmd0aCAhPT0gMCAmJlxuICAgICAgICAgICAgICAgIHVzZXJSZXN1bHRzLnB1c2goLi4ubGlzdFVzZXJzUmVzcG9uc2UuVXNlcnMpO1xuXG4gICAgICAgICAgICAgICAgLy8gZ2V0IHRoZSBsYXN0IHBhZ2luYXRpb24gdG9rZW4gZnJvbSB0aGUgcmV0cmlldmVkIG91dHB1dCwgYW5kIHNldCB0aGUgbmV4dCBpbnB1dCBjb21tYW5kJ3MgcGFnaW5hdGlvbiB0b2tlbiBhY2NvcmRpbmcgdG8gdGhhdFxuICAgICAgICAgICAgICAgIGxhc3RQYWdpbmF0aW9uVG9rZW4gPSBsaXN0VXNlcnNSZXNwb25zZS5QYWdpbmF0aW9uVG9rZW47XG4gICAgICAgICAgICAgICAgaW5wdXQuUGFnaW5hdGlvblRva2VuID0gbGFzdFBhZ2luYXRpb25Ub2tlbjtcbiAgICAgICAgICAgIH0gd2hpbGUgKHR5cGVvZiBsYXN0UGFnaW5hdGlvblRva2VuICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIGxhc3RQYWdpbmF0aW9uVG9rZW4gIT09ICd1bmRlZmluZWQnICYmIGxhc3RQYWdpbmF0aW9uVG9rZW4gIT09IHVuZGVmaW5lZCk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIGZvciBhIHZhbGlkIHJlc3BvbnNlIGxpc3QsIG9idGFpbmVkIGZyb20gdGhlIENvZ25pdG8gTGlzdCBVc2VycyBDb21tYW5kIGNhbGxcbiAgICAgICAgICAgIGlmICh1c2VyUmVzdWx0cy5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgICAgICAvLyBsb29wIHRocm91Z2ggdGhlIGxpc3Qgb2YgdXNlcnMgb2J0YWluZWQgdGhyb3VnaCBjb21tYW5kLCBhbmQgcmV0dXJuIHRoZWlyIGVtYWlscyBhbmQgY3VzdG9tIHVzZXIgSURzXG4gICAgICAgICAgICAgICAgY29uc3QgdXNlckRldGFpbHNGb3JOb3RpZmljYXRpb25SZW1pbmRlcjogUmV0cmlldmVVc2VyRGV0YWlsc0Zvck5vdGlmaWNhdGlvbnNbXSA9IFtdO1xuICAgICAgICAgICAgICAgIHVzZXJSZXN1bHRzLmZvckVhY2goY29nbml0b1VzZXIgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY29nbml0b1VzZXIuQXR0cmlidXRlcyAhPT0gdW5kZWZpbmVkICYmIGNvZ25pdG9Vc2VyLkF0dHJpYnV0ZXMhLmxlbmd0aCA9PT0gNSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgY29nbml0b1VzZXIuQXR0cmlidXRlcyFbMF0gIT09IHVuZGVmaW5lZCAmJiBjb2duaXRvVXNlci5BdHRyaWJ1dGVzIVswXS5WYWx1ZSEubGVuZ3RoICE9PSAwICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2duaXRvVXNlci5BdHRyaWJ1dGVzIVsxXSAhPT0gdW5kZWZpbmVkICYmIGNvZ25pdG9Vc2VyLkF0dHJpYnV0ZXMhWzFdLlZhbHVlIS5sZW5ndGggIT09IDAgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZ25pdG9Vc2VyLkF0dHJpYnV0ZXMhWzJdICE9PSB1bmRlZmluZWQgJiYgY29nbml0b1VzZXIuQXR0cmlidXRlcyFbMl0uVmFsdWUhLmxlbmd0aCAhPT0gMCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgY29nbml0b1VzZXIuQXR0cmlidXRlcyFbM10gIT09IHVuZGVmaW5lZCAmJiBjb2duaXRvVXNlci5BdHRyaWJ1dGVzIVszXS5WYWx1ZSEubGVuZ3RoICE9PSAwICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2duaXRvVXNlci5BdHRyaWJ1dGVzIVs0XSAhPT0gdW5kZWZpbmVkICYmIGNvZ25pdG9Vc2VyLkF0dHJpYnV0ZXMhWzRdLlZhbHVlIS5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG1ha2Ugc3VyZSB0aGF0IHRoZSB1c2VycyByZXRyaWV2ZWQgYXJlIHJlc2lkaW5nIGluIHRoZSBjaXR5IGFuZCBzdGF0ZSBwcm92aWRlZCBpbiB0aGUgaW5wdXRcbiAgICAgICAgICAgICAgICAgICAgICAgIGdldFVzZXJzQnlHZW9ncmFwaGljYWxMb2NhdGlvbklucHV0LnppcENvZGVzLmZvckVhY2goemlwQ29kZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHppcENvZGUgIT09IG51bGwgJiYgY29nbml0b1VzZXIuQXR0cmlidXRlcyFbMF0uVmFsdWUhLmluY2x1ZGVzKHppcENvZGUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHB1c2ggdGhlIG5ldyB1c2VyIGRldGFpbHMgaW4gdGhlIHVzZXIgZGV0YWlscyBhcnJheSB0byBiZSByZXR1cm5lZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VyRGV0YWlsc0Zvck5vdGlmaWNhdGlvblJlbWluZGVyLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNvZ25pdG9Vc2VyLkF0dHJpYnV0ZXMhWzRdLlZhbHVlISxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVtYWlsOiBjb2duaXRvVXNlci5BdHRyaWJ1dGVzIVszXS5WYWx1ZSEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaXJzdE5hbWU6IGNvZ25pdG9Vc2VyLkF0dHJpYnV0ZXMhWzFdLlZhbHVlISxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3ROYW1lOiBjb2duaXRvVXNlci5BdHRyaWJ1dGVzIVsyXS5WYWx1ZSEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIHVzZXIgZGV0YWlscyByZXN1bHRzXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogdXNlckRldGFpbHNGb3JOb3RpZmljYXRpb25SZW1pbmRlclxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYEVtcHR5IHVzZXIgbGlzdCBhcnJheSwgb2J0YWluZWQgd2hpbGUgY2FsbGluZyB0aGUgZ2V0IExpc3QgVXNlcnMgQ29nbml0byBjb21tYW5kYDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9YCk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25SZW1pbmRlckVycm9yVHlwZS5Ob25lT3JBYnNlbnQsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSByZXRyaWV2aW5nIHVzZXJzIGJ5IHRoZWlyIGN1c3RvbSBsb2NhdGlvbiAke0pTT04uc3RyaW5naWZ5KGdldFVzZXJzQnlHZW9ncmFwaGljYWxMb2NhdGlvbklucHV0LnppcENvZGVzKX0gZnJvbSBDb2duaXRvIHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJ9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvblJlbWluZGVyRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvcixcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHVzZWQgdG8gZ2V0IGFsbCB0aGUgdXNlcnMgaW5lbGlnaWJsZSBmb3IgYSByZWltYnVyc2VtZW50LlxuICAgICAqXG4gICAgICogQHJldHVybnMgYSB7QGxpbmsgVXNlckZvck5vdGlmaWNhdGlvblJlbWluZGVyUmVzcG9uc2V9LCByZXByZXNlbnRpbmcgZWFjaCBpbmRpdmlkdWFsIHVzZXJzJ1xuICAgICAqIHVzZXIgSUQsIGZpcnN0LCBsYXN0IG5hbWUgYW5kIGVtYWlsLlxuICAgICAqXG4gICAgICogQHByb3RlY3RlZFxuICAgICAqL1xuICAgIGFzeW5jIGdldEFsbFVzZXJzSW5lbGlnaWJsZUZvclJlaW1idXJzZW1lbnRzKCk6IFByb21pc2U8VXNlckZvck5vdGlmaWNhdGlvblJlbWluZGVyUmVzcG9uc2U+IHtcbiAgICAgICAgLy8gZWFzaWx5IGlkZW50aWZpYWJsZSBBUEkgZW5kcG9pbnQgaW5mb3JtYXRpb25cbiAgICAgICAgY29uc3QgZW5kcG9pbnRJbmZvID0gJ2dldEFsbFVzZXJzSW5lbGlnaWJsZUZvclJlaW1idXJzZW1lbnRzIFF1ZXJ5IE1vb25iZWFtIEdyYXBoUUwgQVBJJztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIEFQSSBLZXkgYW5kIEJhc2UgVVJMLCBuZWVkZWQgaW4gb3JkZXIgdG8gbWFrZSB0aGUgZ2V0IGFsbCB1c2VycyBpbmVsaWdpYmxlIGZvciByZWltYnVyc2VtZW50cyByZXRyaWV2YWwgY2FsbCB0aHJvdWdoIHRoZSBjbGllbnRcbiAgICAgICAgICAgIGNvbnN0IFttb29uYmVhbUJhc2VVUkwsIG1vb25iZWFtUHJpdmF0ZUtleV0gPSBhd2FpdCBzdXBlci5yZXRyaWV2ZVNlcnZpY2VDcmVkZW50aWFscyhDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5NT09OQkVBTV9JTlRFUk5BTF9TRUNSRVRfTkFNRSk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB3ZSBvYnRhaW5lZCBhbnkgaW52YWxpZCBzZWNyZXQgdmFsdWVzIGZyb20gdGhlIGNhbGwgYWJvdmVcbiAgICAgICAgICAgIGlmIChtb29uYmVhbUJhc2VVUkwgPT09IG51bGwgfHwgbW9vbmJlYW1CYXNlVVJMLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG1vb25iZWFtUHJpdmF0ZUtleSA9PT0gbnVsbCB8fCBtb29uYmVhbVByaXZhdGVLZXkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gXCJJbnZhbGlkIFNlY3JldHMgb2J0YWluZWQgZm9yIE1vb25iZWFtIEFQSSBjYWxsIVwiO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25SZW1pbmRlckVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIGdldEFsbFVzZXJzSW5lbGlnaWJsZUZvclJlaW1idXJzZW1lbnRzIFF1ZXJ5XG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogYnVpbGQgdGhlIE1vb25iZWFtIEFwcFN5bmMgQVBJIEdyYXBoUUwgcXVlcnksIGFuZCBwZXJmb3JtIGEgUE9TVCB0byBpdCxcbiAgICAgICAgICAgICAqIHdpdGggdGhlIGFwcHJvcHJpYXRlIGluZm9ybWF0aW9uLlxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIHdlIGltcGx5IHRoYXQgaWYgdGhlIEFQSSBkb2VzIG5vdCByZXNwb25kIGluIDE1IHNlY29uZHMsIHRoZW4gd2UgYXV0b21hdGljYWxseSBjYXRjaCB0aGF0LCBhbmQgcmV0dXJuIGFuXG4gICAgICAgICAgICAgKiBlcnJvciBmb3IgYSBiZXR0ZXIgY3VzdG9tZXIgZXhwZXJpZW5jZS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgcmV0dXJuIGF4aW9zLnBvc3QoYCR7bW9vbmJlYW1CYXNlVVJMfWAsIHtcbiAgICAgICAgICAgICAgICBxdWVyeTogZ2V0QWxsVXNlcnNJbmVsaWdpYmxlRm9yUmVpbWJ1cnNlbWVudHMsXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAgICAgXCJ4LWFwaS1rZXlcIjogbW9vbmJlYW1Qcml2YXRlS2V5XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiAxNTAwMCwgLy8gaW4gbWlsbGlzZWNvbmRzIGhlcmVcbiAgICAgICAgICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlOiAnTW9vbmJlYW0gQVBJIHRpbWVkIG91dCBhZnRlciAxNTAwMG1zISdcbiAgICAgICAgICAgIH0pLnRoZW4oZ2V0QWxsVXNlcnNJbmVsaWdpYmxlRm9yUmVpbWJ1cnNlbWVudHNSZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGdldEFsbFVzZXJzSW5lbGlnaWJsZUZvclJlaW1idXJzZW1lbnRzUmVzcG9uc2UuZGF0YSl9YCk7XG5cbiAgICAgICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgZGF0YSBibG9jayBmcm9tIHRoZSByZXNwb25zZVxuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlRGF0YSA9IChnZXRBbGxVc2Vyc0luZWxpZ2libGVGb3JSZWltYnVyc2VtZW50c1Jlc3BvbnNlICYmIGdldEFsbFVzZXJzSW5lbGlnaWJsZUZvclJlaW1idXJzZW1lbnRzUmVzcG9uc2UuZGF0YSkgPyBnZXRBbGxVc2Vyc0luZWxpZ2libGVGb3JSZWltYnVyc2VtZW50c1Jlc3BvbnNlLmRhdGEuZGF0YSA6IG51bGw7XG5cbiAgICAgICAgICAgICAgICAvLyBjaGVjayBpZiB0aGVyZSBhcmUgYW55IGVycm9ycyBpbiB0aGUgcmV0dXJuZWQgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2VEYXRhICYmIHJlc3BvbnNlRGF0YS5nZXRBbGxVc2Vyc0luZWxpZ2libGVGb3JSZWltYnVyc2VtZW50cy5lcnJvck1lc3NhZ2UgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuZWQgdGhlIHN1Y2Nlc3NmdWxseSByZXRyaWV2ZWQgdXNlcnNcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHJlc3BvbnNlRGF0YS5nZXRBbGxVc2Vyc0luZWxpZ2libGVGb3JSZWltYnVyc2VtZW50cy5kYXRhIGFzIFJldHJpZXZlVXNlckRldGFpbHNGb3JOb3RpZmljYXRpb25zW11cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZURhdGEgP1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBlcnJvciBtZXNzYWdlIGFuZCB0eXBlLCBmcm9tIHRoZSBvcmlnaW5hbCBBcHBTeW5jIGNhbGxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IHJlc3BvbnNlRGF0YS5nZXRBbGxVc2Vyc0luZWxpZ2libGVGb3JSZWltYnVyc2VtZW50cy5lcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiByZXNwb25zZURhdGEuZ2V0QWxsVXNlcnNJbmVsaWdpYmxlRm9yUmVpbWJ1cnNlbWVudHMuZXJyb3JUeXBlXG4gICAgICAgICAgICAgICAgICAgICAgICB9IDpcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgZXJyb3IgcmVzcG9uc2UgaW5kaWNhdGluZyBhbiBpbnZhbGlkIHN0cnVjdHVyZSByZXR1cm5lZFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogYEludmFsaWQgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gJHtlbmRwb2ludEluZm99IHJlc3BvbnNlIWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25SZW1pbmRlckVycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yLnJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBhbmQgdGhlIHNlcnZlciByZXNwb25kZWQgd2l0aCBhIHN0YXR1cyBjb2RlXG4gICAgICAgICAgICAgICAgICAgICAqIHRoYXQgZmFsbHMgb3V0IG9mIHRoZSByYW5nZSBvZiAyeHguXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm9uIDJ4eHggcmVzcG9uc2Ugd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgd2l0aCBzdGF0dXMgJHtlcnJvci5yZXNwb25zZS5zdGF0dXN9LCBhbmQgcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShlcnJvci5yZXNwb25zZS5kYXRhKX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGFueSBvdGhlciBzcGVjaWZpYyBlcnJvcnMgdG8gYmUgZmlsdGVyZWQgYmVsb3dcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25SZW1pbmRlckVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVycm9yLnJlcXVlc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGJ1dCBubyByZXNwb25zZSB3YXMgcmVjZWl2ZWRcbiAgICAgICAgICAgICAgICAgICAgICogYGVycm9yLnJlcXVlc3RgIGlzIGFuIGluc3RhbmNlIG9mIFhNTEh0dHBSZXF1ZXN0IGluIHRoZSBicm93c2VyIGFuZCBhbiBpbnN0YW5jZSBvZlxuICAgICAgICAgICAgICAgICAgICAgKiAgaHR0cC5DbGllbnRSZXF1ZXN0IGluIG5vZGUuanMuXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm8gcmVzcG9uc2UgcmVjZWl2ZWQgd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgZm9yIHJlcXVlc3QgJHtlcnJvci5yZXF1ZXN0fWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25SZW1pbmRlckVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBTb21ldGhpbmcgaGFwcGVuZWQgaW4gc2V0dGluZyB1cCB0aGUgcmVxdWVzdCB0aGF0IHRyaWdnZXJlZCBhbiBFcnJvclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IGZvciB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgJHsoZXJyb3IgJiYgZXJyb3IubWVzc2FnZSkgJiYgZXJyb3IubWVzc2FnZX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uUmVtaW5kZXJFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgcmV0cmlldmluZyB1c2VycyBpbmVsaWdpYmxlIGZvciByZWltYnVyc2VtZW50cyBieSBzdGF0dXMgdGhyb3VnaCAke2VuZHBvaW50SW5mb31gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfSAke2Vycn1gKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvblJlbWluZGVyRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHVzZWQgdG8gZ2V0IGFsbCB0aGUgdXNlcnMgZWxpZ2libGUgZm9yIGEgcmVpbWJ1cnNlbWVudC5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIGEge0BsaW5rIFVzZXJGb3JOb3RpZmljYXRpb25SZW1pbmRlclJlc3BvbnNlfSwgcmVwcmVzZW50aW5nIGVhY2ggaW5kaXZpZHVhbCB1c2VycydcbiAgICAgKiB1c2VyIElELCBmaXJzdCwgbGFzdCBuYW1lIGFuZCBlbWFpbC5cbiAgICAgKi9cbiAgICBhc3luYyBnZXRBbGxVc2Vyc0VsaWdpYmxlRm9yUmVpbWJ1cnNlbWVudHMoKTogUHJvbWlzZTxVc2VyRm9yTm90aWZpY2F0aW9uUmVtaW5kZXJSZXNwb25zZT4ge1xuICAgICAgICAvLyBlYXNpbHkgaWRlbnRpZmlhYmxlIEFQSSBlbmRwb2ludCBpbmZvcm1hdGlvblxuICAgICAgICBjb25zdCBlbmRwb2ludEluZm8gPSAnZ2V0QWxsVXNlcnNFbGlnaWJsZUZvclJlaW1idXJzZW1lbnRzIFF1ZXJ5IE1vb25iZWFtIEdyYXBoUUwgQVBJJztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIEFQSSBLZXkgYW5kIEJhc2UgVVJMLCBuZWVkZWQgaW4gb3JkZXIgdG8gbWFrZSB0aGUgZ2V0IGFsbCB1c2VycyBlbGlnaWJsZSBmb3IgcmVpbWJ1cnNlbWVudHMgcmV0cmlldmFsIGNhbGwgdGhyb3VnaCB0aGUgY2xpZW50XG4gICAgICAgICAgICBjb25zdCBbbW9vbmJlYW1CYXNlVVJMLCBtb29uYmVhbVByaXZhdGVLZXldID0gYXdhaXQgc3VwZXIucmV0cmlldmVTZXJ2aWNlQ3JlZGVudGlhbHMoQ29uc3RhbnRzLkFXU1BhaXJDb25zdGFudHMuTU9PTkJFQU1fSU5URVJOQUxfU0VDUkVUX05BTUUpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgd2Ugb2J0YWluZWQgYW55IGludmFsaWQgc2VjcmV0IHZhbHVlcyBmcm9tIHRoZSBjYWxsIGFib3ZlXG4gICAgICAgICAgICBpZiAobW9vbmJlYW1CYXNlVVJMID09PSBudWxsIHx8IG1vb25iZWFtQmFzZVVSTC5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBtb29uYmVhbVByaXZhdGVLZXkgPT09IG51bGwgfHwgbW9vbmJlYW1Qcml2YXRlS2V5Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IFwiSW52YWxpZCBTZWNyZXRzIG9idGFpbmVkIGZvciBNb29uYmVhbSBBUEkgY2FsbCFcIjtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uUmVtaW5kZXJFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBnZXRBbGxVc2Vyc0VsaWdpYmxlRm9yUmVpbWJ1cnNlbWVudHMgUXVlcnlcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBidWlsZCB0aGUgTW9vbmJlYW0gQXBwU3luYyBBUEkgR3JhcGhRTCBxdWVyeSwgYW5kIHBlcmZvcm0gYSBQT1NUIHRvIGl0LFxuICAgICAgICAgICAgICogd2l0aCB0aGUgYXBwcm9wcmlhdGUgaW5mb3JtYXRpb24uXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogd2UgaW1wbHkgdGhhdCBpZiB0aGUgQVBJIGRvZXMgbm90IHJlc3BvbmQgaW4gMTUgc2Vjb25kcywgdGhlbiB3ZSBhdXRvbWF0aWNhbGx5IGNhdGNoIHRoYXQsIGFuZCByZXR1cm4gYW5cbiAgICAgICAgICAgICAqIGVycm9yIGZvciBhIGJldHRlciBjdXN0b21lciBleHBlcmllbmNlLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICByZXR1cm4gYXhpb3MucG9zdChgJHttb29uYmVhbUJhc2VVUkx9YCwge1xuICAgICAgICAgICAgICAgIHF1ZXJ5OiBnZXRBbGxVc2Vyc0VsaWdpYmxlRm9yUmVpbWJ1cnNlbWVudHMsXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAgICAgXCJ4LWFwaS1rZXlcIjogbW9vbmJlYW1Qcml2YXRlS2V5XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiAxNTAwMCwgLy8gaW4gbWlsbGlzZWNvbmRzIGhlcmVcbiAgICAgICAgICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlOiAnTW9vbmJlYW0gQVBJIHRpbWVkIG91dCBhZnRlciAxNTAwMG1zISdcbiAgICAgICAgICAgIH0pLnRoZW4oZ2V0QWxsVXNlcnNFbGlnaWJsZUZvclJlaW1idXJzZW1lbnRzUmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShnZXRBbGxVc2Vyc0VsaWdpYmxlRm9yUmVpbWJ1cnNlbWVudHNSZXNwb25zZS5kYXRhKX1gKTtcblxuICAgICAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBkYXRhIGJsb2NrIGZyb20gdGhlIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2VEYXRhID0gKGdldEFsbFVzZXJzRWxpZ2libGVGb3JSZWltYnVyc2VtZW50c1Jlc3BvbnNlICYmIGdldEFsbFVzZXJzRWxpZ2libGVGb3JSZWltYnVyc2VtZW50c1Jlc3BvbnNlLmRhdGEpID8gZ2V0QWxsVXNlcnNFbGlnaWJsZUZvclJlaW1idXJzZW1lbnRzUmVzcG9uc2UuZGF0YS5kYXRhIDogbnVsbDtcblxuICAgICAgICAgICAgICAgIC8vIGNoZWNrIGlmIHRoZXJlIGFyZSBhbnkgZXJyb3JzIGluIHRoZSByZXR1cm5lZCByZXNwb25zZVxuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZURhdGEgJiYgcmVzcG9uc2VEYXRhLmdldEFsbFVzZXJzRWxpZ2libGVGb3JSZWltYnVyc2VtZW50cy5lcnJvck1lc3NhZ2UgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuZWQgdGhlIHN1Y2Nlc3NmdWxseSByZXRyaWV2ZWQgdXNlcnNcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHJlc3BvbnNlRGF0YS5nZXRBbGxVc2Vyc0VsaWdpYmxlRm9yUmVpbWJ1cnNlbWVudHMuZGF0YSBhcyBSZXRyaWV2ZVVzZXJEZXRhaWxzRm9yTm90aWZpY2F0aW9uc1tdXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2VEYXRhID9cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgdHlwZSwgZnJvbSB0aGUgb3JpZ2luYWwgQXBwU3luYyBjYWxsXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiByZXNwb25zZURhdGEuZ2V0QWxsVXNlcnNFbGlnaWJsZUZvclJlaW1idXJzZW1lbnRzLmVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IHJlc3BvbnNlRGF0YS5nZXRBbGxVc2Vyc0VsaWdpYmxlRm9yUmVpbWJ1cnNlbWVudHMuZXJyb3JUeXBlXG4gICAgICAgICAgICAgICAgICAgICAgICB9IDpcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgZXJyb3IgcmVzcG9uc2UgaW5kaWNhdGluZyBhbiBpbnZhbGlkIHN0cnVjdHVyZSByZXR1cm5lZFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogYEludmFsaWQgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gJHtlbmRwb2ludEluZm99IHJlc3BvbnNlIWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25SZW1pbmRlckVycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yLnJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBhbmQgdGhlIHNlcnZlciByZXNwb25kZWQgd2l0aCBhIHN0YXR1cyBjb2RlXG4gICAgICAgICAgICAgICAgICAgICAqIHRoYXQgZmFsbHMgb3V0IG9mIHRoZSByYW5nZSBvZiAyeHguXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm9uIDJ4eHggcmVzcG9uc2Ugd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgd2l0aCBzdGF0dXMgJHtlcnJvci5yZXNwb25zZS5zdGF0dXN9LCBhbmQgcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShlcnJvci5yZXNwb25zZS5kYXRhKX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGFueSBvdGhlciBzcGVjaWZpYyBlcnJvcnMgdG8gYmUgZmlsdGVyZWQgYmVsb3dcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25SZW1pbmRlckVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVycm9yLnJlcXVlc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGJ1dCBubyByZXNwb25zZSB3YXMgcmVjZWl2ZWRcbiAgICAgICAgICAgICAgICAgICAgICogYGVycm9yLnJlcXVlc3RgIGlzIGFuIGluc3RhbmNlIG9mIFhNTEh0dHBSZXF1ZXN0IGluIHRoZSBicm93c2VyIGFuZCBhbiBpbnN0YW5jZSBvZlxuICAgICAgICAgICAgICAgICAgICAgKiAgaHR0cC5DbGllbnRSZXF1ZXN0IGluIG5vZGUuanMuXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm8gcmVzcG9uc2UgcmVjZWl2ZWQgd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgZm9yIHJlcXVlc3QgJHtlcnJvci5yZXF1ZXN0fWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25SZW1pbmRlckVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBTb21ldGhpbmcgaGFwcGVuZWQgaW4gc2V0dGluZyB1cCB0aGUgcmVxdWVzdCB0aGF0IHRyaWdnZXJlZCBhbiBFcnJvclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IGZvciB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgJHsoZXJyb3IgJiYgZXJyb3IubWVzc2FnZSkgJiYgZXJyb3IubWVzc2FnZX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uUmVtaW5kZXJFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgcmV0cmlldmluZyB1c2VycyBlbGlnaWJsZSBmb3IgcmVpbWJ1cnNlbWVudHMgYnkgc3RhdHVzIHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJ9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25SZW1pbmRlckVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB1c2VkIHRvIGdldCBhbGwgdGhlIHVzZXJzIHVzZWQgdG8gZGVsaXZlciBub3RpZmljYXRpb24gcmVtaW5kZXJzIHRvLlxuICAgICAqXG4gICAgICogQHJldHVybnMgYSB7QGxpbmsgVXNlckZvck5vdGlmaWNhdGlvblJlbWluZGVyUmVzcG9uc2V9LCByZXByZXNlbnRpbmcgZWFjaCBpbmRpdmlkdWFsIHVzZXJzJ1xuICAgICAqIHVzZXIgSUQsIGZpcnN0LCBsYXN0IG5hbWUgYW5kIGVtYWlsLlxuICAgICAqL1xuICAgIGFzeW5jIGdldEFsbFVzZXJzRm9yTm90aWZpY2F0aW9uUmVtaW5kZXJzKCk6IFByb21pc2U8VXNlckZvck5vdGlmaWNhdGlvblJlbWluZGVyUmVzcG9uc2U+IHtcbiAgICAgICAgLy8gZWFzaWx5IGlkZW50aWZpYWJsZSBBUEkgZW5kcG9pbnQgaW5mb3JtYXRpb25cbiAgICAgICAgY29uc3QgZW5kcG9pbnRJbmZvID0gJy9saXN0VXNlcnMgZm9yIGdldEFsbFVzZXJzRm9yTm90aWZpY2F0aW9uUmVtaW5kZXIgQ29nbml0byBTREsgY2FsbCc7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBDb2duaXRvIGFjY2VzcyBrZXksIHNlY3JldCBrZXkgYW5kIHVzZXIgcG9vbCBpZCwgbmVlZGVkIGluIG9yZGVyIHRvIHJldHJpZXZlIGFsbCB1c2VycyB0aHJvdWdoIHRoZSBDb2duaXRvIElkZW50aXR5IHByb3ZpZGVyIGNsaWVudFxuICAgICAgICAgICAgY29uc3QgW2NvZ25pdG9BY2Nlc3NLZXlJZCwgY29nbml0b1NlY3JldEtleSwgY29nbml0b1VzZXJQb29sSWRdID0gYXdhaXQgc3VwZXIucmV0cmlldmVTZXJ2aWNlQ3JlZGVudGlhbHMoQ29uc3RhbnRzLkFXU1BhaXJDb25zdGFudHMuTU9PTkJFQU1fSU5URVJOQUxfU0VDUkVUX05BTUUsXG4gICAgICAgICAgICAgICAgdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgdHJ1ZSk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB3ZSBvYnRhaW5lZCBhbnkgaW52YWxpZCBzZWNyZXQgdmFsdWVzIGZyb20gdGhlIGNhbGwgYWJvdmVcbiAgICAgICAgICAgIGlmIChjb2duaXRvQWNjZXNzS2V5SWQgPT09IG51bGwgfHwgY29nbml0b0FjY2Vzc0tleUlkLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIGNvZ25pdG9TZWNyZXRLZXkgPT09IG51bGwgfHwgY29nbml0b1NlY3JldEtleS5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBjb2duaXRvVXNlclBvb2xJZCA9PT0gbnVsbCB8fCAoY29nbml0b1VzZXJQb29sSWQgJiYgY29nbml0b1VzZXJQb29sSWQubGVuZ3RoID09PSAwKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IFwiSW52YWxpZCBTZWNyZXRzIG9idGFpbmVkIGZvciBDb2duaXRvIFNESyBjYWxsIGNhbGwhXCI7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvblJlbWluZGVyRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGluaXRpYWxpemUgdGhlIENvZ25pdG8gSWRlbnRpdHkgUHJvdmlkZXIgY2xpZW50IHVzaW5nIHRoZSBjcmVkZW50aWFscyBvYnRhaW5lZCBhYm92ZVxuICAgICAgICAgICAgY29uc3QgY29nbml0b0lkZW50aXR5UHJvdmlkZXJDbGllbnQgPSBuZXcgQ29nbml0b0lkZW50aXR5UHJvdmlkZXJDbGllbnQoe1xuICAgICAgICAgICAgICAgIHJlZ2lvbjogdGhpcy5yZWdpb24sXG4gICAgICAgICAgICAgICAgY3JlZGVudGlhbHM6IHtcbiAgICAgICAgICAgICAgICAgICAgYWNjZXNzS2V5SWQ6IGNvZ25pdG9BY2Nlc3NLZXlJZCxcbiAgICAgICAgICAgICAgICAgICAgc2VjcmV0QWNjZXNzS2V5OiBjb2duaXRvU2VjcmV0S2V5XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogZXhlY3V0ZSB0aGV3IExpc3QgVXNlcnMgY29tbWFuZCwgd2l0aG91dCBhbnkgZmlsdGVycywgaW4gb3JkZXIgdG8gcmV0cmlldmUgYSB1c2VyJ3MgZW1haWwgYW5kIHRoZWlyXG4gICAgICAgICAgICAgKiBjdXN0b20gdXNlciBJRCwgZnJvbSB0aGVpciBhdHRyaWJ1dGVzLlxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIFRoZXNlIHJlc3VsdHMgYXJlIGdvaW5nIHRvIGJlIHBhZ2luYXRlZCwgc28gd2Ugd2lsbCBsaW1pdCB0aGUgcGFnZSBzaXplIHRvIDYwIHVzZXJzIChtYXhpbXVtIGFsbG93ZWQgdGhyb3VnaCB0aGlzXG4gICAgICAgICAgICAgKiBjYWxsKSwgYW5kIGtlZXAgdHJhY2sgb2YgdGhlIG51bWJlciBvZiBwYWdlcyBhbmQgbGFjayB0aGVyZW9mLCB0aHJvdWdoIGEgZmxhZy5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgY29uc3QgdXNlclJlc3VsdHM6IFVzZXJUeXBlW10gPSBbXTtcbiAgICAgICAgICAgIGxldCBsYXN0UGFnaW5hdGlvblRva2VuOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgICAgICAgICBsZXQgaW5wdXQ6IExpc3RVc2Vyc0NvbW1hbmRJbnB1dCA9IHtcbiAgICAgICAgICAgICAgICBVc2VyUG9vbElkOiBjb2duaXRvVXNlclBvb2xJZCxcbiAgICAgICAgICAgICAgICBBdHRyaWJ1dGVzVG9HZXQ6IFsnZ2l2ZW5fbmFtZScsICdmYW1pbHlfbmFtZScsICdlbWFpbCcsICdjdXN0b206dXNlcklkJ10sXG4gICAgICAgICAgICAgICAgTGltaXQ6IDYwLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIC8vIGtlZXAgZ2V0dGluZyB1c2VycyBhbmQgdXBkYXRpbmcgdGhlIHJlc3VsdHMgYXJyYXkgZm9yIHVzZXJzIHJldHJpZXZlZCwgdW50aWwgd2UgcnVuIG91dCBvZiB1c2VycyB0byByZXRyaWV2ZVxuICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgIC8vIGV4ZWN1dGUgdGhlIExpc3QgVXNlcnMgY29tbWFuZCwgZ2l2ZW4gdGhlIGlucHV0IHByb3ZpZGVkIGFib3ZlXG4gICAgICAgICAgICAgICAgY29uc3QgbGlzdFVzZXJzUmVzcG9uc2U6IExpc3RVc2Vyc0NvbW1hbmRPdXRwdXQgPSBhd2FpdCBjb2duaXRvSWRlbnRpdHlQcm92aWRlckNsaWVudC5zZW5kKFxuICAgICAgICAgICAgICAgICAgICBuZXcgTGlzdFVzZXJzQ29tbWFuZChpbnB1dClcbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogY2hlY2sgd2hldGhlciB0aGUgTGlzdCBVc2VycyBDb21tYW5kIGhhcyBhIHZhbGlkIHJlc3BvbnNlLyB2YWxpZCBsaXN0IG9mIHVzZXJzIHRvIGJlIHJldHVybmVkLFxuICAgICAgICAgICAgICAgICAqIGFuZCBpZiBzbyBhZGQgaW4gdGhlIHJlc3VsdGluZyBsaXN0IGFjY29yZGluZ2x5LlxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGxpc3RVc2Vyc1Jlc3BvbnNlLiRtZXRhZGF0YSAhPT0gbnVsbCAmJiBsaXN0VXNlcnNSZXNwb25zZS4kbWV0YWRhdGEuaHR0cFN0YXR1c0NvZGUgIT09IG51bGwgJiZcbiAgICAgICAgICAgICAgICBsaXN0VXNlcnNSZXNwb25zZS4kbWV0YWRhdGEuaHR0cFN0YXR1c0NvZGUgIT09IHVuZGVmaW5lZCAmJiBsaXN0VXNlcnNSZXNwb25zZS4kbWV0YWRhdGEuaHR0cFN0YXR1c0NvZGUgPT09IDIwMCAmJlxuICAgICAgICAgICAgICAgIGxpc3RVc2Vyc1Jlc3BvbnNlLlVzZXJzICE9PSBudWxsICYmIGxpc3RVc2Vyc1Jlc3BvbnNlLlVzZXJzICE9PSB1bmRlZmluZWQgJiYgbGlzdFVzZXJzUmVzcG9uc2UuVXNlcnMhLmxlbmd0aCAhPT0gMCAmJlxuICAgICAgICAgICAgICAgIHVzZXJSZXN1bHRzLnB1c2goLi4ubGlzdFVzZXJzUmVzcG9uc2UuVXNlcnMpO1xuXG4gICAgICAgICAgICAgICAgLy8gZ2V0IHRoZSBsYXN0IHBhZ2luYXRpb24gdG9rZW4gZnJvbSB0aGUgcmV0cmlldmVkIG91dHB1dCwgYW5kIHNldCB0aGUgbmV4dCBpbnB1dCBjb21tYW5kJ3MgcGFnaW5hdGlvbiB0b2tlbiBhY2NvcmRpbmcgdG8gdGhhdFxuICAgICAgICAgICAgICAgIGxhc3RQYWdpbmF0aW9uVG9rZW4gPSBsaXN0VXNlcnNSZXNwb25zZS5QYWdpbmF0aW9uVG9rZW47XG4gICAgICAgICAgICAgICAgaW5wdXQuUGFnaW5hdGlvblRva2VuID0gbGFzdFBhZ2luYXRpb25Ub2tlbjtcbiAgICAgICAgICAgIH0gd2hpbGUgKHR5cGVvZiBsYXN0UGFnaW5hdGlvblRva2VuICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIGxhc3RQYWdpbmF0aW9uVG9rZW4gIT09ICd1bmRlZmluZWQnICYmIGxhc3RQYWdpbmF0aW9uVG9rZW4gIT09IHVuZGVmaW5lZCk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIGZvciBhIHZhbGlkIHJlc3BvbnNlIGxpc3QsIG9idGFpbmVkIGZyb20gdGhlIENvZ25pdG8gTGlzdCBVc2VycyBDb21tYW5kIGNhbGxcbiAgICAgICAgICAgIGlmICh1c2VyUmVzdWx0cy5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgICAgICAvLyBsb29wIHRocm91Z2ggdGhlIGxpc3Qgb2YgdXNlcnMgb2J0YWluZWQgdGhyb3VnaCBjb21tYW5kLCBhbmQgcmV0dXJuIHRoZWlyIGVtYWlscyBhbmQgY3VzdG9tIHVzZXIgSURzXG4gICAgICAgICAgICAgICAgY29uc3QgdXNlckRldGFpbHNGb3JOb3RpZmljYXRpb25SZW1pbmRlcjogUmV0cmlldmVVc2VyRGV0YWlsc0Zvck5vdGlmaWNhdGlvbnNbXSA9IFtdO1xuICAgICAgICAgICAgICAgIHVzZXJSZXN1bHRzLmZvckVhY2goY29nbml0b1VzZXIgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY29nbml0b1VzZXIuQXR0cmlidXRlcyAhPT0gdW5kZWZpbmVkICYmIGNvZ25pdG9Vc2VyLkF0dHJpYnV0ZXMhLmxlbmd0aCA9PT0gNCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgY29nbml0b1VzZXIuQXR0cmlidXRlcyFbMF0gIT09IHVuZGVmaW5lZCAmJiBjb2duaXRvVXNlci5BdHRyaWJ1dGVzIVswXS5WYWx1ZSEubGVuZ3RoICE9PSAwICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2duaXRvVXNlci5BdHRyaWJ1dGVzIVsxXSAhPT0gdW5kZWZpbmVkICYmIGNvZ25pdG9Vc2VyLkF0dHJpYnV0ZXMhWzFdLlZhbHVlIS5sZW5ndGggIT09IDAgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZ25pdG9Vc2VyLkF0dHJpYnV0ZXMhWzJdICE9PSB1bmRlZmluZWQgJiYgY29nbml0b1VzZXIuQXR0cmlidXRlcyFbMl0uVmFsdWUhLmxlbmd0aCAhPT0gMCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgY29nbml0b1VzZXIuQXR0cmlidXRlcyFbM10gIT09IHVuZGVmaW5lZCAmJiBjb2duaXRvVXNlci5BdHRyaWJ1dGVzIVszXS5WYWx1ZSEubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBwdXNoIHRoZSBuZXcgdXNlciBkZXRhaWxzIGluIHRoZSB1c2VyIGRldGFpbHMgYXJyYXkgdG8gYmUgcmV0dXJuZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJEZXRhaWxzRm9yTm90aWZpY2F0aW9uUmVtaW5kZXIucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNvZ25pdG9Vc2VyLkF0dHJpYnV0ZXMhWzNdLlZhbHVlISxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbWFpbDogY29nbml0b1VzZXIuQXR0cmlidXRlcyFbMl0uVmFsdWUhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0TmFtZTogY29nbml0b1VzZXIuQXR0cmlidXRlcyFbMF0uVmFsdWUhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3ROYW1lOiBjb2duaXRvVXNlci5BdHRyaWJ1dGVzIVsxXS5WYWx1ZSEsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIC8vIGVuc3VyZSB0aGF0IHRoZSBzaXplIG9mIHRoZSBsaXN0IG9mIHVzZXIgZGV0YWlscyB0byBiZSByZXR1cm5lZCwgbWF0Y2hlcyB0aGUgbnVtYmVyIG9mIHVzZXJzIHJldHJpZXZlZCB0aHJvdWdoIHRoZSBMaXN0IFVzZXJzIENvbW1hbmRcbiAgICAgICAgICAgICAgICBpZiAodXNlckRldGFpbHNGb3JOb3RpZmljYXRpb25SZW1pbmRlci5sZW5ndGggPT09IHVzZXJSZXN1bHRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIHJlc3VsdHMgYXBwcm9wcmlhdGVseVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogdXNlckRldGFpbHNGb3JOb3RpZmljYXRpb25SZW1pbmRlclxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVzZXIgZGV0YWlsIGxpc3QgbGVuZ3RoIGRvZXMgbm90IG1hdGNoIHRoZSByZXRyaWV2ZWQgdXNlciBsaXN0YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfWApO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25SZW1pbmRlckVycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYEludmFsaWQvRW1wdHkgdXNlciBsaXN0IGFycmF5LCBvYnRhaW5lZCB3aGlsZSBjYWxsaW5nIHRoZSBnZXQgTGlzdCBVc2VycyBDb2duaXRvIGNvbW1hbmRgO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX1gKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uUmVtaW5kZXJFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yLFxuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgcmV0cmlldmluZyBlbWFpbCBhbmQgY3VzdG9tIGlkIGZvciBub3RpZmljYXRpb24gcmVtaW5kZXJzIGZvciB1c2VycywgZnJvbSBDb2duaXRvIHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJ9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvblJlbWluZGVyRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvcixcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHVzZWQgdG8gZ2V0IGEgdXNlcidzIGVtYWlsLCBnaXZlbiB0aGVpciBjdXN0b20gdXNlcjppZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB1c2VySWQgdGhlIHVzZXIgaWQgdG8gYmUgcGFzc2VkIGluLCB1c2VkIHRvIHJldHJpZXZlIHNvbWVvbmUncyBlbWFpbFxuICAgICAqXG4gICAgICogQHJldHVybnMgYSB7QGxpbmsgRW1haWxGcm9tQ29nbml0b1Jlc3BvbnNlfSByZXByZXNlbnRpbmcgdGhlIHVzZXIncyBlbWFpbCBvYnRhaW5lZFxuICAgICAqIGZyb20gQ29nbml0by5cbiAgICAgKi9cbiAgICBhc3luYyBnZXRFbWFpbEJ5VXNlcklkKHVzZXJJZDogU3RyaW5nKTogUHJvbWlzZTxFbWFpbEZyb21Db2duaXRvUmVzcG9uc2U+IHtcbiAgICAgICAgLy8gZWFzaWx5IGlkZW50aWZpYWJsZSBBUEkgZW5kcG9pbnQgaW5mb3JtYXRpb25cbiAgICAgICAgY29uc3QgZW5kcG9pbnRJbmZvID0gJy9saXN0VXNlcnMgZm9yIGdldEVtYWlsQnlVc2VySWQgQ29nbml0byBTREsgY2FsbCc7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBDb2duaXRvIGFjY2VzcyBrZXksIHNlY3JldCBrZXkgYW5kIHVzZXIgcG9vbCBpZCwgbmVlZGVkIGluIG9yZGVyIHRvIHJldHJpZXZlIHRoZSB1c2VyIGVtYWlsIHRocm91Z2ggdGhlIENvZ25pdG8gSWRlbnRpdHkgcHJvdmlkZXIgY2xpZW50XG4gICAgICAgICAgICBjb25zdCBbY29nbml0b0FjY2Vzc0tleUlkLCBjb2duaXRvU2VjcmV0S2V5LCBjb2duaXRvVXNlclBvb2xJZF0gPSBhd2FpdCBzdXBlci5yZXRyaWV2ZVNlcnZpY2VDcmVkZW50aWFscyhDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5NT09OQkVBTV9JTlRFUk5BTF9TRUNSRVRfTkFNRSxcbiAgICAgICAgICAgICAgICB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICB0cnVlKTtcblxuICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHdlIG9idGFpbmVkIGFueSBpbnZhbGlkIHNlY3JldCB2YWx1ZXMgZnJvbSB0aGUgY2FsbCBhYm92ZVxuICAgICAgICAgICAgaWYgKGNvZ25pdG9BY2Nlc3NLZXlJZCA9PT0gbnVsbCB8fCBjb2duaXRvQWNjZXNzS2V5SWQubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgY29nbml0b1NlY3JldEtleSA9PT0gbnVsbCB8fCBjb2duaXRvU2VjcmV0S2V5Lmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIGNvZ25pdG9Vc2VyUG9vbElkID09PSBudWxsIHx8IChjb2duaXRvVXNlclBvb2xJZCAmJiBjb2duaXRvVXNlclBvb2xJZC5sZW5ndGggPT09IDApKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gXCJJbnZhbGlkIFNlY3JldHMgb2J0YWluZWQgZm9yIENvZ25pdG8gU0RLIGNhbGwgY2FsbCFcIjtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBpbml0aWFsaXplIHRoZSBDb2duaXRvIElkZW50aXR5IFByb3ZpZGVyIGNsaWVudCB1c2luZyB0aGUgY3JlZGVudGlhbHMgb2J0YWluZWQgYWJvdmVcbiAgICAgICAgICAgIGNvbnN0IGNvZ25pdG9JZGVudGl0eVByb3ZpZGVyQ2xpZW50ID0gbmV3IENvZ25pdG9JZGVudGl0eVByb3ZpZGVyQ2xpZW50KHtcbiAgICAgICAgICAgICAgICByZWdpb246IHRoaXMucmVnaW9uLFxuICAgICAgICAgICAgICAgIGNyZWRlbnRpYWxzOiB7XG4gICAgICAgICAgICAgICAgICAgIGFjY2Vzc0tleUlkOiBjb2duaXRvQWNjZXNzS2V5SWQsXG4gICAgICAgICAgICAgICAgICAgIHNlY3JldEFjY2Vzc0tleTogY29nbml0b1NlY3JldEtleVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIGV4ZWN1dGUgdGhldyBMaXN0IFVzZXJzIGNvbW1hbmQsIHdpdGhvdXQgYW55IGZpbHRlcnMsIGluIG9yZGVyIHRvIHJldHJpZXZlIGEgdXNlcidzIGVtYWlsIGdpdmVuIHRoZWlyIGN1c3RvbSB1c2VyIElELFxuICAgICAgICAgICAgICogZnJvbSB0aGVpciBhdHRyaWJ1dGVzLlxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIFRoZXNlIHJlc3VsdHMgYXJlIGdvaW5nIHRvIGJlIHBhZ2luYXRlZCwgc28gd2Ugd2lsbCBsaW1pdCB0aGUgcGFnZSBzaXplIHRvIDYwIHVzZXJzIChtYXhpbXVtIGFsbG93ZWQgdGhyb3VnaCB0aGlzXG4gICAgICAgICAgICAgKiBjYWxsKSwgYW5kIGtlZXAgdHJhY2sgb2YgdGhlIG51bWJlciBvZiBwYWdlcyBhbmQgbGFjayB0aGVyZW9mLCB0aHJvdWdoIGEgZmxhZy5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgY29uc3QgdXNlclJlc3VsdHM6IFVzZXJUeXBlW10gPSBbXTtcbiAgICAgICAgICAgIGxldCBsYXN0UGFnaW5hdGlvblRva2VuOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgICAgICAgICBsZXQgaW5wdXQ6IExpc3RVc2Vyc0NvbW1hbmRJbnB1dCA9IHtcbiAgICAgICAgICAgICAgICBVc2VyUG9vbElkOiBjb2duaXRvVXNlclBvb2xJZCxcbiAgICAgICAgICAgICAgICBBdHRyaWJ1dGVzVG9HZXQ6IFsnZW1haWwnLCAnY3VzdG9tOnVzZXJJZCddLFxuICAgICAgICAgICAgICAgIExpbWl0OiA2MCxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICAvLyBrZWVwIGdldHRpbmcgdXNlcnMgYW5kIHVwZGF0aW5nIHRoZSByZXN1bHRzIGFycmF5IGZvciB1c2VycyByZXRyaWV2ZWQsIHVudGlsIHdlIHJ1biBvdXQgb2YgdXNlcnMgdG8gcmV0cmlldmVcbiAgICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgICAgICAvLyBleGVjdXRlIHRoZSBMaXN0IFVzZXJzIGNvbW1hbmQsIGdpdmVuIHRoZSBpbnB1dCBwcm92aWRlZCBhYm92ZVxuICAgICAgICAgICAgICAgIGNvbnN0IGxpc3RVc2Vyc1Jlc3BvbnNlOiBMaXN0VXNlcnNDb21tYW5kT3V0cHV0ID0gYXdhaXQgY29nbml0b0lkZW50aXR5UHJvdmlkZXJDbGllbnQuc2VuZChcbiAgICAgICAgICAgICAgICAgICAgbmV3IExpc3RVc2Vyc0NvbW1hbmQoaW5wdXQpXG4gICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIGNoZWNrIHdoZXRoZXIgdGhlIExpc3QgVXNlcnMgQ29tbWFuZCBoYXMgYSB2YWxpZCByZXNwb25zZS8gdmFsaWQgbGlzdCBvZiB1c2VycyB0byBiZSByZXR1cm5lZCxcbiAgICAgICAgICAgICAgICAgKiBhbmQgaWYgc28gYWRkIGluIHRoZSByZXN1bHRpbmcgbGlzdCBhY2NvcmRpbmdseS5cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBsaXN0VXNlcnNSZXNwb25zZS4kbWV0YWRhdGEgIT09IG51bGwgJiYgbGlzdFVzZXJzUmVzcG9uc2UuJG1ldGFkYXRhLmh0dHBTdGF0dXNDb2RlICE9PSBudWxsICYmXG4gICAgICAgICAgICAgICAgbGlzdFVzZXJzUmVzcG9uc2UuJG1ldGFkYXRhLmh0dHBTdGF0dXNDb2RlICE9PSB1bmRlZmluZWQgJiYgbGlzdFVzZXJzUmVzcG9uc2UuJG1ldGFkYXRhLmh0dHBTdGF0dXNDb2RlID09PSAyMDAgJiZcbiAgICAgICAgICAgICAgICBsaXN0VXNlcnNSZXNwb25zZS5Vc2VycyAhPT0gbnVsbCAmJiBsaXN0VXNlcnNSZXNwb25zZS5Vc2VycyAhPT0gdW5kZWZpbmVkICYmIGxpc3RVc2Vyc1Jlc3BvbnNlLlVzZXJzIS5sZW5ndGggIT09IDAgJiZcbiAgICAgICAgICAgICAgICB1c2VyUmVzdWx0cy5wdXNoKC4uLmxpc3RVc2Vyc1Jlc3BvbnNlLlVzZXJzKTtcblxuICAgICAgICAgICAgICAgIC8vIGdldCB0aGUgbGFzdCBwYWdpbmF0aW9uIHRva2VuIGZyb20gdGhlIHJldHJpZXZlZCBvdXRwdXQsIGFuZCBzZXQgdGhlIG5leHQgaW5wdXQgY29tbWFuZCdzIHBhZ2luYXRpb24gdG9rZW4gYWNjb3JkaW5nIHRvIHRoYXRcbiAgICAgICAgICAgICAgICBsYXN0UGFnaW5hdGlvblRva2VuID0gbGlzdFVzZXJzUmVzcG9uc2UuUGFnaW5hdGlvblRva2VuO1xuICAgICAgICAgICAgICAgIGlucHV0LlBhZ2luYXRpb25Ub2tlbiA9IGxhc3RQYWdpbmF0aW9uVG9rZW47XG4gICAgICAgICAgICB9IHdoaWxlICh0eXBlb2YgbGFzdFBhZ2luYXRpb25Ub2tlbiAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiBsYXN0UGFnaW5hdGlvblRva2VuICE9PSAndW5kZWZpbmVkJyAmJiBsYXN0UGFnaW5hdGlvblRva2VuICE9PSB1bmRlZmluZWQpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayBmb3IgYSB2YWxpZCByZXNwb25zZSBsaXN0LCBvYnRhaW5lZCBmcm9tIHRoZSBDb2duaXRvIExpc3QgVXNlcnMgQ29tbWFuZCBjYWxsXG4gICAgICAgICAgICBpZiAodXNlclJlc3VsdHMubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgbGV0IG1hdGNoZWRFbWFpbDogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG4gICAgICAgICAgICAgICAgbGV0IG5vT2ZNYXRjaGVzID0gMDtcbiAgICAgICAgICAgICAgICB1c2VyUmVzdWx0cy5mb3JFYWNoKGNvZ25pdG9Vc2VyID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvZ25pdG9Vc2VyLkF0dHJpYnV0ZXMgIT09IHVuZGVmaW5lZCAmJiBjb2duaXRvVXNlci5BdHRyaWJ1dGVzIS5sZW5ndGggPT09IDIgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZ25pdG9Vc2VyLkF0dHJpYnV0ZXMhWzBdICE9PSB1bmRlZmluZWQgJiYgY29nbml0b1VzZXIuQXR0cmlidXRlcyFbMF0uVmFsdWUhLmxlbmd0aCAhPT0gMCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgY29nbml0b1VzZXIuQXR0cmlidXRlcyFbMV0gIT09IHVuZGVmaW5lZCAmJiBjb2duaXRvVXNlci5BdHRyaWJ1dGVzIVsxXS5WYWx1ZSEubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBtYWtlIHN1cmUgdGhhdCB0aGVyZSBpZiB0aGVyZSBpcyBhIG1hdGNoZWQgdXNlciwgdGhlbiB3ZSB3aWxsIHNldCB0aGUgbWF0Y2hlZCBlbWFpbCBhY2NvcmRpbmdseVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvZ25pdG9Vc2VyLkF0dHJpYnV0ZXMhWzFdLlZhbHVlIS50cmltKCkgPT09IHVzZXJJZC50cmltKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXRjaGVkRW1haWwgPSBjb2duaXRvVXNlci5BdHRyaWJ1dGVzIVswXS5WYWx1ZSE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9PZk1hdGNoZXMgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKG5vT2ZNYXRjaGVzID09PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBtYXRjaGVkRW1haWxcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBDb3VsZG4ndCBmaW5kIHVzZXIgaW4gQ29nbml0byB3aXRoIHVzZXIgaWQgPSAke3VzZXJJZH1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9YCk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBFbXB0eSB1c2VyIGxpc3QgYXJyYXksIG9idGFpbmVkIHdoaWxlIGNhbGxpbmcgdGhlIGdldCBMaXN0IFVzZXJzIENvZ25pdG8gY29tbWFuZGA7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfWApO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLk5vbmVPckFic2VudCxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHJldHJpZXZpbmcgZW1haWwgZ2l2ZW4gaWQgZm9yIHVzZXIgZnJvbSBDb2duaXRvIHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJ9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yLFxuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdXNlZCB0byBnZXQgYSB1c2VyJ3MgZW1haWwsIGdpdmVuIGNlcnRhaW4gZmlsdGVycyB0byBiZSBwYXNzZWQgaW4uXG4gICAgICpcbiAgICAgKiBAcGFyYW0gbWlsaXRhcnlWZXJpZmljYXRpb25Ob3RpZmljYXRpb25VcGRhdGUgdGhlIG1pbGl0YXJ5IHZlcmlmaWNhdGlvbiBub3RpZmljYXRpb24gdXBkYXRlXG4gICAgICogb2JqZWN0cywgdXNlZCB0byBmaWx0ZXIgdGhyb3VnaCB0aGUgQ29nbml0byB1c2VyIHBvb2wsIGluIG9yZGVyIHRvIG9idGFpbiBhIHVzZXIncyBlbWFpbC5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIGEge0BsaW5rIEVtYWlsRnJvbUNvZ25pdG9SZXNwb25zZX0gcmVwcmVzZW50aW5nIHRoZSB1c2VyJ3MgZW1haWwgb2J0YWluZWRcbiAgICAgKiBmcm9tIENvZ25pdG8uXG4gICAgICovXG4gICAgYXN5bmMgZ2V0RW1haWxGb3JVc2VyKG1pbGl0YXJ5VmVyaWZpY2F0aW9uTm90aWZpY2F0aW9uVXBkYXRlOiBNaWxpdGFyeVZlcmlmaWNhdGlvbk5vdGlmaWNhdGlvblVwZGF0ZSk6IFByb21pc2U8RW1haWxGcm9tQ29nbml0b1Jlc3BvbnNlPiB7XG4gICAgICAgIC8vIGVhc2lseSBpZGVudGlmaWFibGUgQVBJIGVuZHBvaW50IGluZm9ybWF0aW9uXG4gICAgICAgIGNvbnN0IGVuZHBvaW50SW5mbyA9ICcvbGlzdFVzZXJzIGZvciBnZXRFbWFpbEZvclVzZXIgQ29nbml0byBTREsgY2FsbCc7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBDb2duaXRvIGFjY2VzcyBrZXksIHNlY3JldCBrZXkgYW5kIHVzZXIgcG9vbCBpZCwgbmVlZGVkIGluIG9yZGVyIHRvIHJldHJpZXZlIHRoZSB1c2VyIGVtYWlsIHRocm91Z2ggdGhlIENvZ25pdG8gSWRlbnRpdHkgcHJvdmlkZXIgY2xpZW50XG4gICAgICAgICAgICBjb25zdCBbY29nbml0b0FjY2Vzc0tleUlkLCBjb2duaXRvU2VjcmV0S2V5LCBjb2duaXRvVXNlclBvb2xJZF0gPSBhd2FpdCBzdXBlci5yZXRyaWV2ZVNlcnZpY2VDcmVkZW50aWFscyhDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5NT09OQkVBTV9JTlRFUk5BTF9TRUNSRVRfTkFNRSxcbiAgICAgICAgICAgICAgICB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICB0cnVlKTtcblxuICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHdlIG9idGFpbmVkIGFueSBpbnZhbGlkIHNlY3JldCB2YWx1ZXMgZnJvbSB0aGUgY2FsbCBhYm92ZVxuICAgICAgICAgICAgaWYgKGNvZ25pdG9BY2Nlc3NLZXlJZCA9PT0gbnVsbCB8fCBjb2duaXRvQWNjZXNzS2V5SWQubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgY29nbml0b1NlY3JldEtleSA9PT0gbnVsbCB8fCBjb2duaXRvU2VjcmV0S2V5Lmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIGNvZ25pdG9Vc2VyUG9vbElkID09PSBudWxsIHx8IChjb2duaXRvVXNlclBvb2xJZCAmJiBjb2duaXRvVXNlclBvb2xJZC5sZW5ndGggPT09IDApKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gXCJJbnZhbGlkIFNlY3JldHMgb2J0YWluZWQgZm9yIENvZ25pdG8gU0RLIGNhbGwgY2FsbCFcIjtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBpbml0aWFsaXplIHRoZSBDb2duaXRvIElkZW50aXR5IFByb3ZpZGVyIGNsaWVudCB1c2luZyB0aGUgY3JlZGVudGlhbHMgb2J0YWluZWQgYWJvdmVcbiAgICAgICAgICAgIGNvbnN0IGNvZ25pdG9JZGVudGl0eVByb3ZpZGVyQ2xpZW50ID0gbmV3IENvZ25pdG9JZGVudGl0eVByb3ZpZGVyQ2xpZW50KHtcbiAgICAgICAgICAgICAgICByZWdpb246IHRoaXMucmVnaW9uLFxuICAgICAgICAgICAgICAgIGNyZWRlbnRpYWxzOiB7XG4gICAgICAgICAgICAgICAgICAgIGFjY2Vzc0tleUlkOiBjb2duaXRvQWNjZXNzS2V5SWQsXG4gICAgICAgICAgICAgICAgICAgIHNlY3JldEFjY2Vzc0tleTogY29nbml0b1NlY3JldEtleVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIGV4ZWN1dGUgdGhlIExpc3QgVXNlcnMgY29tbWFuZCwgdXNpbmcgZmlsdGVycywgaW4gb3JkZXIgdG8gcmV0cmlldmUgYSB1c2VyJ3MgZW1haWwgZnJvbSB0aGVpciBhdHRyaWJ1dGVzLlxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIFJldHJpZXZlIHRoZSB1c2VyIGJ5IHRoZWlyIGZhbWlseV9uYW1lLiBJZiB0aGVyZSBhcmUgaXMgbW9yZSB0aGFuIDEgbWF0Y2ggcmV0dXJuZWQsIHRoZW4gd2Ugd2lsbCBtYXRjaFxuICAgICAgICAgICAgICogdGhlIHVzZXIgYmFzZWQgb24gdGhlaXIgdW5pcXVlIGlkLCBmcm9tIHRoZSBjdXN0b206dXNlcklkIGF0dHJpYnV0ZVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBjb25zdCBsaXN0VXNlcnNSZXNwb25zZTogTGlzdFVzZXJzQ29tbWFuZE91dHB1dCA9IGF3YWl0IGNvZ25pdG9JZGVudGl0eVByb3ZpZGVyQ2xpZW50LnNlbmQobmV3IExpc3RVc2Vyc0NvbW1hbmQoe1xuICAgICAgICAgICAgICAgIFVzZXJQb29sSWQ6IGNvZ25pdG9Vc2VyUG9vbElkLFxuICAgICAgICAgICAgICAgIEF0dHJpYnV0ZXNUb0dldDogWydlbWFpbCcsICdjdXN0b206dXNlcklkJ10sXG4gICAgICAgICAgICAgICAgRmlsdGVyOiBgZmFtaWx5X25hbWU9IFwiJHtgJHttaWxpdGFyeVZlcmlmaWNhdGlvbk5vdGlmaWNhdGlvblVwZGF0ZS5sYXN0TmFtZX1gLnJlcGxhY2VBbGwoXCJcXFwiXCIsIFwiXFxcXFxcXCJcIil9XCJgXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAvLyBjaGVjayBmb3IgYSB2YWxpZCByZXNwb25zZSBmcm9tIHRoZSBDb2duaXRvIExpc3QgVXNlcnMgQ29tbWFuZCBjYWxsXG4gICAgICAgICAgICBpZiAobGlzdFVzZXJzUmVzcG9uc2UgIT09IG51bGwgJiYgbGlzdFVzZXJzUmVzcG9uc2UuJG1ldGFkYXRhICE9PSBudWxsICYmIGxpc3RVc2Vyc1Jlc3BvbnNlLiRtZXRhZGF0YS5odHRwU3RhdHVzQ29kZSAhPT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgIGxpc3RVc2Vyc1Jlc3BvbnNlLiRtZXRhZGF0YS5odHRwU3RhdHVzQ29kZSAhPT0gdW5kZWZpbmVkICYmIGxpc3RVc2Vyc1Jlc3BvbnNlLiRtZXRhZGF0YS5odHRwU3RhdHVzQ29kZSA9PT0gMjAwICYmXG4gICAgICAgICAgICAgICAgbGlzdFVzZXJzUmVzcG9uc2UuVXNlcnMgIT09IG51bGwgJiYgbGlzdFVzZXJzUmVzcG9uc2UuVXNlcnMgIT09IHVuZGVmaW5lZCAmJiBsaXN0VXNlcnNSZXNwb25zZS5Vc2VycyEubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlcmUgYXJlIGlzIG1vcmUgdGhhbiAxIG1hdGNoIHJldHVybmVkLCB0aGVuIHdlIHdpbGwgbWF0Y2ggdGhlIHVzZXIgYmFzZWQgb24gdGhlaXIgdW5pcXVlIGlkLCBmcm9tIHRoZSBjdXN0b206dXNlcklkIGF0dHJpYnV0ZVxuICAgICAgICAgICAgICAgIGxldCBpbnZhbGlkQXR0cmlidXRlc0ZsYWcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBsaXN0VXNlcnNSZXNwb25zZS5Vc2Vycy5mb3JFYWNoKGNvZ25pdG9Vc2VyID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvZ25pdG9Vc2VyLkF0dHJpYnV0ZXMgPT09IG51bGwgfHwgY29nbml0b1VzZXIuQXR0cmlidXRlcyA9PT0gdW5kZWZpbmVkIHx8IGNvZ25pdG9Vc2VyLkF0dHJpYnV0ZXMubGVuZ3RoICE9PSAyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnZhbGlkQXR0cmlidXRlc0ZsYWcgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgLy8gY2hlY2sgZm9yIHZhbGlkIHVzZXIgYXR0cmlidXRlc1xuICAgICAgICAgICAgICAgIGlmICghaW52YWxpZEF0dHJpYnV0ZXNGbGFnKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBtYXRjaGVkRW1haWw6IHN0cmluZyB8IG51bGwgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICBsZXQgbm9PZk1hdGNoZXMgPSAwO1xuICAgICAgICAgICAgICAgICAgICBsaXN0VXNlcnNSZXNwb25zZS5Vc2Vycy5mb3JFYWNoKGNvZ25pdG9Vc2VyID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb2duaXRvVXNlci5BdHRyaWJ1dGVzIVsxXS5WYWx1ZSEudHJpbSgpID09PSBtaWxpdGFyeVZlcmlmaWNhdGlvbk5vdGlmaWNhdGlvblVwZGF0ZS5pZC50cmltKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXRjaGVkRW1haWwgPSBjb2duaXRvVXNlci5BdHRyaWJ1dGVzIVswXS5WYWx1ZSE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9PZk1hdGNoZXMgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChub09mTWF0Y2hlcyA9PT0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBtYXRjaGVkRW1haWxcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBDb3VsZG4ndCBmaW5kIHVzZXIgaW4gQ29nbml0byBmb3IgJHttaWxpdGFyeVZlcmlmaWNhdGlvbk5vdGlmaWNhdGlvblVwZGF0ZS5pZH1gO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfWApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBJbnZhbGlkIHVzZXIgYXR0cmlidXRlcyBvYnRhaW5lZGA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX1gKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYEludmFsaWQgc3RydWN0dXJlIG9idGFpbmVkIHdoaWxlIGNhbGxpbmcgdGhlIGdldCBMaXN0IFVzZXJzIENvZ25pdG8gY29tbWFuZGA7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfWApO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvcixcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHJldHJpZXZpbmcgZW1haWwgZm9yIHVzZXIgZnJvbSBDb2duaXRvIHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJ9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yLFxuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB1c2VkIHRvIHNlbmQgYSBuZXcgbWlsaXRhcnkgdmVyaWZpY2F0aW9uIHN0YXR1cyBhY2tub3dsZWRnbWVudCwgc28gd2UgY2FuIGtpY2stc3RhcnQgdGhlIG1pbGl0YXJ5IHZlcmlmaWNhdGlvblxuICAgICAqIHN0YXR1cyB1cGRhdGUgbm90aWZpY2F0aW9uIHByb2Nlc3MgdGhyb3VnaCB0aGUgcHJvZHVjZXIuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gbWlsaXRhcnlWZXJpZmljYXRpb25Ob3RpZmljYXRpb25VcGRhdGUgbWlsaXRhcnkgdmVyaWZpY2F0aW9uIHVwZGF0ZSBvYmplY3RcbiAgICAgKlxuICAgICAqIEByZXR1cm4gYSB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIEFQSUdhdGV3YXlQcm94eVJlc3VsdH0gcmVwcmVzZW50aW5nIHRoZSBBUEkgR2F0ZXdheSByZXN1bHRcbiAgICAgKiBzZW50IGJ5IHRoZSBtaWxpdGFyeSB2ZXJpZmljYXRpb24gdXBkYXRlIHByb2R1Y2VyIExhbWJkYSwgdG8gdmFsaWRhdGUgd2hldGhlciB0aGUgbWlsaXRhcnkgdmVyaWZpY2F0aW9uXG4gICAgICogbm90aWZpY2F0aW9uIHVwZGF0ZSBwcm9jZXNzIGtpY2stc3RhcnRlZCBvciBub3RcbiAgICAgKi9cbiAgICBhc3luYyBtaWxpdGFyeVZlcmlmaWNhdGlvblVwZGF0ZXNBY2tub3dsZWRnbWVudChtaWxpdGFyeVZlcmlmaWNhdGlvbk5vdGlmaWNhdGlvblVwZGF0ZTogTWlsaXRhcnlWZXJpZmljYXRpb25Ob3RpZmljYXRpb25VcGRhdGUpOiBQcm9taXNlPEFQSUdhdGV3YXlQcm94eVJlc3VsdD4ge1xuICAgICAgICAvLyBlYXNpbHkgaWRlbnRpZmlhYmxlIEFQSSBlbmRwb2ludCBpbmZvcm1hdGlvblxuICAgICAgICBjb25zdCBlbmRwb2ludEluZm8gPSAnUE9TVCAvbWlsaXRhcnlWZXJpZmljYXRpb25VcGRhdGVzQWNrbm93bGVkZ21lbnQgTW9vbmJlYW0gUkVTVCBBUEknO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgQVBJIEtleSBhbmQgQmFzZSBVUkwsIG5lZWRlZCBpbiBvcmRlciB0byBtYWtlIHRoZSBtaWxpdGFyeSBzdGF0dXMgdXBkYXRlcyBhY2tub3dsZWRnbWVudCBjYWxsIHRocm91Z2ggdGhlIGNsaWVudFxuICAgICAgICAgICAgY29uc3QgW21vb25iZWFtQmFzZVVSTCwgbW9vbmJlYW1Qcml2YXRlS2V5XSA9IGF3YWl0IHN1cGVyLnJldHJpZXZlU2VydmljZUNyZWRlbnRpYWxzKENvbnN0YW50cy5BV1NQYWlyQ29uc3RhbnRzLk1PT05CRUFNX0lOVEVSTkFMX1NFQ1JFVF9OQU1FLCB0cnVlKTtcblxuICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHdlIG9idGFpbmVkIGFueSBpbnZhbGlkIHNlY3JldCB2YWx1ZXMgZnJvbSB0aGUgY2FsbCBhYm92ZVxuICAgICAgICAgICAgaWYgKG1vb25iZWFtQmFzZVVSTCA9PT0gbnVsbCB8fCBtb29uYmVhbUJhc2VVUkwubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgbW9vbmJlYW1Qcml2YXRlS2V5ID09PSBudWxsIHx8IG1vb25iZWFtUHJpdmF0ZUtleS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBcIkludmFsaWQgU2VjcmV0cyBvYnRhaW5lZCBmb3IgTW9vbmJlYW0gUkVTVCBBUEkgY2FsbCFcIjtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzQ29kZTogNTAwLFxuICAgICAgICAgICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBNaWxpdGFyeVZlcmlmaWNhdGlvbkVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogUE9TVCAvbWlsaXRhcnlWZXJpZmljYXRpb25VcGRhdGVzQWNrbm93bGVkZ21lbnRcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBidWlsZCB0aGUgaW50ZXJuYWwgTW9vbmJlYW0gQVBJIHJlcXVlc3QgYm9keSB0byBiZSBwYXNzZWQgaW4sIGFuZCBwZXJmb3JtIGEgUE9TVCB0byBpdCB3aXRoIHRoZSBhcHByb3ByaWF0ZSBpbmZvcm1hdGlvblxuICAgICAgICAgICAgICogd2UgaW1wbHkgdGhhdCBpZiB0aGUgQVBJIGRvZXMgbm90IHJlc3BvbmQgaW4gMTUgc2Vjb25kcywgdGhlbiB3ZSBhdXRvbWF0aWNhbGx5IGNhdGNoIHRoYXQsIGFuZCByZXR1cm4gYW5cbiAgICAgICAgICAgICAqIGVycm9yIGZvciBhIGJldHRlciBjdXN0b21lciBleHBlcmllbmNlLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgTW9vbmJlYW0gUkVTVCBBUEkgcmVxdWVzdCBPYmplY3Q6ICR7SlNPTi5zdHJpbmdpZnkobWlsaXRhcnlWZXJpZmljYXRpb25Ob3RpZmljYXRpb25VcGRhdGUpfWApO1xuICAgICAgICAgICAgcmV0dXJuIGF4aW9zLnBvc3QoYCR7bW9vbmJlYW1CYXNlVVJMfS9taWxpdGFyeVZlcmlmaWNhdGlvblVwZGF0ZXNBY2tub3dsZWRnbWVudGAsIEpTT04uc3RyaW5naWZ5KG1pbGl0YXJ5VmVyaWZpY2F0aW9uTm90aWZpY2F0aW9uVXBkYXRlKSwge1xuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgICAgIFwieC1hcGkta2V5XCI6IG1vb25iZWFtUHJpdmF0ZUtleVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGltZW91dDogMTUwMDAsIC8vIGluIG1pbGxpc2Vjb25kcyBoZXJlXG4gICAgICAgICAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZTogJ01vb25iZWFtIFJFU1QgQVBJIHRpbWVkIG91dCBhZnRlciAxNTAwMG1zISdcbiAgICAgICAgICAgIH0pLnRoZW4obWlsaXRhcnlTdGF0dXNVcGRhdGVSZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KG1pbGl0YXJ5U3RhdHVzVXBkYXRlUmVzcG9uc2UuZGF0YSl9YCk7XG5cbiAgICAgICAgICAgICAgICAvLyBjaGVjayBpZiB0aGVyZSBhcmUgYW55IGVycm9ycyBpbiB0aGUgcmV0dXJuZWQgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICBpZiAobWlsaXRhcnlTdGF0dXNVcGRhdGVSZXNwb25zZS5kYXRhICYmIG1pbGl0YXJ5U3RhdHVzVXBkYXRlUmVzcG9uc2UuZGF0YS5kYXRhICE9PSBudWxsXG4gICAgICAgICAgICAgICAgICAgICYmICFtaWxpdGFyeVN0YXR1c1VwZGF0ZVJlc3BvbnNlLmRhdGEuZXJyb3JNZXNzYWdlICYmICFtaWxpdGFyeVN0YXR1c1VwZGF0ZVJlc3BvbnNlLmRhdGEuZXJyb3JUeXBlXG4gICAgICAgICAgICAgICAgICAgICYmIG1pbGl0YXJ5U3RhdHVzVXBkYXRlUmVzcG9uc2Uuc3RhdHVzID09PSAyMDIpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuZWQgdGhlIG1pbGl0YXJ5IHZlcmlmaWNhdGlvbiB1cGRhdGUgYWNrbm93bGVkZ21lbnQgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1c0NvZGU6IG1pbGl0YXJ5U3RhdHVzVXBkYXRlUmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgYm9keTogbWlsaXRhcnlTdGF0dXNVcGRhdGVSZXNwb25zZS5kYXRhLmRhdGFcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtaWxpdGFyeVN0YXR1c1VwZGF0ZVJlc3BvbnNlLmRhdGEgJiYgbWlsaXRhcnlTdGF0dXNVcGRhdGVSZXNwb25zZS5kYXRhLmVycm9yTWVzc2FnZSAhPT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgICAgICYmIG1pbGl0YXJ5U3RhdHVzVXBkYXRlUmVzcG9uc2UuZGF0YS5lcnJvck1lc3NhZ2UgIT09IG51bGwgP1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBlcnJvciBtZXNzYWdlIGFuZCB0eXBlLCBmcm9tIHRoZSBvcmlnaW5hbCBSRVNUIEFQSSBjYWxsXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzQ29kZTogbWlsaXRhcnlTdGF0dXNVcGRhdGVSZXNwb25zZS5zdGF0dXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9keTogbWlsaXRhcnlTdGF0dXNVcGRhdGVSZXNwb25zZS5kYXRhLmVycm9yTWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIGVycm9yIHJlc3BvbnNlIGluZGljYXRpbmcgYW4gaW52YWxpZCBzdHJ1Y3R1cmUgcmV0dXJuZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXNDb2RlOiA1MDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBJbnZhbGlkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tICR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSFgLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE1pbGl0YXJ5VmVyaWZpY2F0aW9uRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvci5yZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYW5kIHRoZSBzZXJ2ZXIgcmVzcG9uZGVkIHdpdGggYSBzdGF0dXMgY29kZVxuICAgICAgICAgICAgICAgICAgICAgKiB0aGF0IGZhbGxzIG91dCBvZiB0aGUgcmFuZ2Ugb2YgMnh4LlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vbiAyeHh4IHJlc3BvbnNlIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBNb29uYmVhbSBSRVNUIEFQSSwgd2l0aCBzdGF0dXMgJHtlcnJvci5yZXNwb25zZS5zdGF0dXN9LCBhbmQgcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShlcnJvci5yZXNwb25zZS5kYXRhKX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGFueSBvdGhlciBzcGVjaWZpYyBlcnJvcnMgdG8gYmUgZmlsdGVyZWQgYmVsb3dcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1c0NvZGU6IGVycm9yLnJlc3BvbnNlLnN0YXR1cyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogZXJyb3IucmVzcG9uc2UuZGF0YS5lcnJvclR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvci5yZXNwb25zZS5kYXRhLmVycm9yTWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVycm9yLnJlcXVlc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGJ1dCBubyByZXNwb25zZSB3YXMgcmVjZWl2ZWRcbiAgICAgICAgICAgICAgICAgICAgICogYGVycm9yLnJlcXVlc3RgIGlzIGFuIGluc3RhbmNlIG9mIFhNTEh0dHBSZXF1ZXN0IGluIHRoZSBicm93c2VyIGFuZCBhbiBpbnN0YW5jZSBvZlxuICAgICAgICAgICAgICAgICAgICAgKiAgaHR0cC5DbGllbnRSZXF1ZXN0IGluIG5vZGUuanMuXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm8gcmVzcG9uc2UgcmVjZWl2ZWQgd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgZm9yIHJlcXVlc3QgJHtlcnJvci5yZXF1ZXN0fWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1c0NvZGU6IDUwMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTWlsaXRhcnlWZXJpZmljYXRpb25FcnJvclR5cGUuVW5leHBlY3RlZEVycm9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNvbWV0aGluZyBoYXBwZW5lZCBpbiBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IHRoYXQgdHJpZ2dlcmVkIGFuIEVycm9yXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgZm9yIHRoZSAke2VuZHBvaW50SW5mb30gTW9vbmJlYW0gQVBJLCAkeyhlcnJvciAmJiBlcnJvci5tZXNzYWdlKSAmJiBlcnJvci5tZXNzYWdlfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1c0NvZGU6IDUwMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTWlsaXRhcnlWZXJpZmljYXRpb25FcnJvclR5cGUuVW5leHBlY3RlZEVycm9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHBvc3RpbmcgdGhlIG1pbGl0YXJ5IHZlcmlmaWNhdGlvbiBzdGF0dXMgYWNrbm93bGVkZ21lbnQgb2JqZWN0IHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJ9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc3RhdHVzQ29kZTogNTAwLFxuICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBNaWxpdGFyeVZlcmlmaWNhdGlvbkVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3IsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB1c2VkIHRvIHNlbmQgYSBuZXcgdHJhbnNhY3Rpb24gYWNrbm93bGVkZ21lbnQsIGZvciBhbiB1cGRhdGVkIHRyYW5zYWN0aW9uLCBzbyB3ZSBjYW4ga2ljay1zdGFydCB0aGVcbiAgICAgKiB0cmFuc2FjdGlvbiBwcm9jZXNzIHRocm91Z2ggdGhlIHRyYW5zYWN0aW9uIHByb2R1Y2VyLlxuICAgICAqXG4gICAgICogQHBhcmFtIHVwZGF0ZWRUcmFuc2FjdGlvbkV2ZW50IHVwZGF0ZWQgdHJhbnNhY3Rpb24gZXZlbnQgdG8gYmUgcGFzc2VkIGluXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIGEge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBBUElHYXRld2F5UHJveHlSZXN1bHR9IHJlcHJlc2VudGluZyB0aGUgQVBJIEdhdGV3YXkgcmVzdWx0XG4gICAgICogc2VudCBieSB0aGUgcmVpbWJ1cnNlbWVudCBwcm9kdWNlciBMYW1iZGEsIHRvIHZhbGlkYXRlIHdoZXRoZXIgdGhlIHRyYW5zYWN0aW9ucyBwcm9jZXNzIHdhc1xuICAgICAqIGtpY2stc3RhcnRlZCBvciBub3QuXG4gICAgICovXG4gICAgYXN5bmMgdHJhbnNhY3Rpb25zQWNrbm93bGVkZ21lbnQodXBkYXRlZFRyYW5zYWN0aW9uRXZlbnQ6IFVwZGF0ZWRUcmFuc2FjdGlvbkV2ZW50KTogUHJvbWlzZTxBUElHYXRld2F5UHJveHlSZXN1bHQ+IHtcbiAgICAgICAgLy8gZWFzaWx5IGlkZW50aWZpYWJsZSBBUEkgZW5kcG9pbnQgaW5mb3JtYXRpb25cbiAgICAgICAgY29uc3QgZW5kcG9pbnRJbmZvID0gJ1BPU1QgL3RyYW5zYWN0aW9uc0Fja25vd2xlZGdtZW50IE1vb25iZWFtIFJFU1QgQVBJJztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIEFQSSBLZXkgYW5kIEJhc2UgVVJMLCBuZWVkZWQgaW4gb3JkZXIgdG8gbWFrZSB0aGUgdHJhbnNhY3Rpb24gYWNrbm93bGVkZ21lbnQgY2FsbCB0aHJvdWdoIHRoZSBjbGllbnRcbiAgICAgICAgICAgIGNvbnN0IFttb29uYmVhbUJhc2VVUkwsIG1vb25iZWFtUHJpdmF0ZUtleV0gPSBhd2FpdCBzdXBlci5yZXRyaWV2ZVNlcnZpY2VDcmVkZW50aWFscyhDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5NT09OQkVBTV9JTlRFUk5BTF9TRUNSRVRfTkFNRSwgdHJ1ZSk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB3ZSBvYnRhaW5lZCBhbnkgaW52YWxpZCBzZWNyZXQgdmFsdWVzIGZyb20gdGhlIGNhbGwgYWJvdmVcbiAgICAgICAgICAgIGlmIChtb29uYmVhbUJhc2VVUkwgPT09IG51bGwgfHwgbW9vbmJlYW1CYXNlVVJMLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG1vb25iZWFtUHJpdmF0ZUtleSA9PT0gbnVsbCB8fCBtb29uYmVhbVByaXZhdGVLZXkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gXCJJbnZhbGlkIFNlY3JldHMgb2J0YWluZWQgZm9yIE1vb25iZWFtIFJFU1QgQVBJIGNhbGwhXCI7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1c0NvZGU6IDUwMCxcbiAgICAgICAgICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBQT1NUIC90cmFuc2FjdGlvbnNBY2tub3dsZWRnbWVudFxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIGJ1aWxkIHRoZSBpbnRlcm5hbCBNb29uYmVhbSBBUEkgcmVxdWVzdCBib2R5IHRvIGJlIHBhc3NlZCBpbiwgYW5kIHBlcmZvcm0gYSBQT1NUIHRvIGl0IHdpdGggdGhlIGFwcHJvcHJpYXRlIGluZm9ybWF0aW9uXG4gICAgICAgICAgICAgKiB3ZSBpbXBseSB0aGF0IGlmIHRoZSBBUEkgZG9lcyBub3QgcmVzcG9uZCBpbiAxNSBzZWNvbmRzLCB0aGVuIHdlIGF1dG9tYXRpY2FsbHkgY2F0Y2ggdGhhdCwgYW5kIHJldHVybiBhblxuICAgICAgICAgICAgICogZXJyb3IgZm9yIGEgYmV0dGVyIGN1c3RvbWVyIGV4cGVyaWVuY2UuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBNb29uYmVhbSBSRVNUIEFQSSByZXF1ZXN0IE9iamVjdDogJHtKU09OLnN0cmluZ2lmeSh1cGRhdGVkVHJhbnNhY3Rpb25FdmVudCl9YCk7XG4gICAgICAgICAgICByZXR1cm4gYXhpb3MucG9zdChgJHttb29uYmVhbUJhc2VVUkx9L3RyYW5zYWN0aW9uc0Fja25vd2xlZGdtZW50YCwgSlNPTi5zdHJpbmdpZnkodXBkYXRlZFRyYW5zYWN0aW9uRXZlbnQpLCB7XG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAgICAgXCJ4LWFwaS1rZXlcIjogbW9vbmJlYW1Qcml2YXRlS2V5XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiAxNTAwMCwgLy8gaW4gbWlsbGlzZWNvbmRzIGhlcmVcbiAgICAgICAgICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlOiAnTW9vbmJlYW0gUkVTVCBBUEkgdGltZWQgb3V0IGFmdGVyIDE1MDAwbXMhJ1xuICAgICAgICAgICAgfSkudGhlbih0cmFuc2FjdGlvbnNBY2tub3dsZWRnbWVudFJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlbmRwb2ludEluZm99IHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkodHJhbnNhY3Rpb25zQWNrbm93bGVkZ21lbnRSZXNwb25zZS5kYXRhKX1gKTtcblxuICAgICAgICAgICAgICAgIC8vIGNoZWNrIGlmIHRoZXJlIGFyZSBhbnkgZXJyb3JzIGluIHRoZSByZXR1cm5lZCByZXNwb25zZVxuICAgICAgICAgICAgICAgIGlmICh0cmFuc2FjdGlvbnNBY2tub3dsZWRnbWVudFJlc3BvbnNlLmRhdGEgJiYgdHJhbnNhY3Rpb25zQWNrbm93bGVkZ21lbnRSZXNwb25zZS5kYXRhLmRhdGEgIT09IG51bGxcbiAgICAgICAgICAgICAgICAgICAgJiYgIXRyYW5zYWN0aW9uc0Fja25vd2xlZGdtZW50UmVzcG9uc2UuZGF0YS5lcnJvck1lc3NhZ2UgJiYgIXRyYW5zYWN0aW9uc0Fja25vd2xlZGdtZW50UmVzcG9uc2UuZGF0YS5lcnJvclR5cGVcbiAgICAgICAgICAgICAgICAgICAgJiYgdHJhbnNhY3Rpb25zQWNrbm93bGVkZ21lbnRSZXNwb25zZS5zdGF0dXMgPT09IDIwMikge1xuICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm5lZCB0aGUgdHJhbnNhY3Rpb24gYWNrbm93bGVkZ21lbnQgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1c0NvZGU6IHRyYW5zYWN0aW9uc0Fja25vd2xlZGdtZW50UmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgYm9keTogdHJhbnNhY3Rpb25zQWNrbm93bGVkZ21lbnRSZXNwb25zZS5kYXRhLmRhdGFcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cmFuc2FjdGlvbnNBY2tub3dsZWRnbWVudFJlc3BvbnNlLmRhdGEgJiYgdHJhbnNhY3Rpb25zQWNrbm93bGVkZ21lbnRSZXNwb25zZS5kYXRhLmVycm9yTWVzc2FnZSAhPT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgICAgICYmIHRyYW5zYWN0aW9uc0Fja25vd2xlZGdtZW50UmVzcG9uc2UuZGF0YS5lcnJvck1lc3NhZ2UgIT09IG51bGwgP1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBlcnJvciBtZXNzYWdlIGFuZCB0eXBlLCBmcm9tIHRoZSBvcmlnaW5hbCBSRVNUIEFQSSBjYWxsXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzQ29kZTogdHJhbnNhY3Rpb25zQWNrbm93bGVkZ21lbnRSZXNwb25zZS5zdGF0dXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9keTogdHJhbnNhY3Rpb25zQWNrbm93bGVkZ21lbnRSZXNwb25zZS5kYXRhLmVycm9yTWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIGVycm9yIHJlc3BvbnNlIGluZGljYXRpbmcgYW4gaW52YWxpZCBzdHJ1Y3R1cmUgcmV0dXJuZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXNDb2RlOiA1MDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBJbnZhbGlkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tICR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSFgLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IucmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGFuZCB0aGUgc2VydmVyIHJlc3BvbmRlZCB3aXRoIGEgc3RhdHVzIGNvZGVcbiAgICAgICAgICAgICAgICAgICAgICogdGhhdCBmYWxscyBvdXQgb2YgdGhlIHJhbmdlIG9mIDJ4eC5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBOb24gMnh4eCByZXNwb25zZSB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gTW9vbmJlYW0gUkVTVCBBUEksIHdpdGggc3RhdHVzICR7ZXJyb3IucmVzcG9uc2Uuc3RhdHVzfSwgYW5kIHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZXJyb3IucmVzcG9uc2UuZGF0YSl9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBhbnkgb3RoZXIgc3BlY2lmaWMgZXJyb3JzIHRvIGJlIGZpbHRlcmVkIGJlbG93XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXNDb2RlOiBlcnJvci5yZXNwb25zZS5zdGF0dXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IGVycm9yLnJlc3BvbnNlLmRhdGEuZXJyb3JUeXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3IucmVzcG9uc2UuZGF0YS5lcnJvck1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5yZXF1ZXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBidXQgbm8gcmVzcG9uc2Ugd2FzIHJlY2VpdmVkXG4gICAgICAgICAgICAgICAgICAgICAqIGBlcnJvci5yZXF1ZXN0YCBpcyBhbiBpbnN0YW5jZSBvZiBYTUxIdHRwUmVxdWVzdCBpbiB0aGUgYnJvd3NlciBhbmQgYW4gaW5zdGFuY2Ugb2ZcbiAgICAgICAgICAgICAgICAgICAgICogIGh0dHAuQ2xpZW50UmVxdWVzdCBpbiBub2RlLmpzLlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vIHJlc3BvbnNlIHJlY2VpdmVkIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBNb29uYmVhbSBBUEksIGZvciByZXF1ZXN0ICR7ZXJyb3IucmVxdWVzdH1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXNDb2RlOiA1MDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU29tZXRoaW5nIGhhcHBlbmVkIGluIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgdGhhdCB0cmlnZ2VyZWQgYW4gRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgc2V0dGluZyB1cCB0aGUgcmVxdWVzdCBmb3IgdGhlICR7ZW5kcG9pbnRJbmZvfSBNb29uYmVhbSBBUEksICR7KGVycm9yICYmIGVycm9yLm1lc3NhZ2UpICYmIGVycm9yLm1lc3NhZ2V9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzQ29kZTogNTAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHBvc3RpbmcgdGhlIHRyYW5zYWN0aW9ucyBhY2tub3dsZWRnbWVudCBvYmplY3QgdGhyb3VnaCAke2VuZHBvaW50SW5mb31gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfSAke2Vycn1gKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBzdGF0dXNDb2RlOiA1MDAsXG4gICAgICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3IsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB1c2VkIHRvIGdldCBhbGwgQUNUSVZFIG5vdGlmaWNhdGlvbiByZW1pbmRlcnMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBhIHtAbGluayBOb3RpZmljYXRpb25SZW1pbmRlclJlc3BvbnNlfSwgcmVwcmVzZW50aW5nIHRoZSBBQ1RJVkUgbm90aWZpY2F0aW9uXG4gICAgICogcmVtaW5kZXJzLlxuICAgICAqL1xuICAgIGFzeW5jIGdldE5vdGlmaWNhdGlvblJlbWluZGVycygpOiBQcm9taXNlPE5vdGlmaWNhdGlvblJlbWluZGVyUmVzcG9uc2U+IHtcbiAgICAgICAgLy8gZWFzaWx5IGlkZW50aWZpYWJsZSBBUEkgZW5kcG9pbnQgaW5mb3JtYXRpb25cbiAgICAgICAgY29uc3QgZW5kcG9pbnRJbmZvID0gJ2dldE5vdGlmaWNhdGlvblJlbWluZGVycyBRdWVyeSBNb29uYmVhbSBHcmFwaFFMIEFQSSc7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBBUEkgS2V5IGFuZCBCYXNlIFVSTCwgbmVlZGVkIGluIG9yZGVyIHRvIG1ha2UgdGhlIGVsaWdpYmxlIHVzZXIgcmV0cmlldmFsIGNhbGwgdGhyb3VnaCB0aGUgY2xpZW50XG4gICAgICAgICAgICBjb25zdCBbbW9vbmJlYW1CYXNlVVJMLCBtb29uYmVhbVByaXZhdGVLZXldID0gYXdhaXQgc3VwZXIucmV0cmlldmVTZXJ2aWNlQ3JlZGVudGlhbHMoQ29uc3RhbnRzLkFXU1BhaXJDb25zdGFudHMuTU9PTkJFQU1fSU5URVJOQUxfU0VDUkVUX05BTUUpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgd2Ugb2J0YWluZWQgYW55IGludmFsaWQgc2VjcmV0IHZhbHVlcyBmcm9tIHRoZSBjYWxsIGFib3ZlXG4gICAgICAgICAgICBpZiAobW9vbmJlYW1CYXNlVVJMID09PSBudWxsIHx8IG1vb25iZWFtQmFzZVVSTC5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBtb29uYmVhbVByaXZhdGVLZXkgPT09IG51bGwgfHwgbW9vbmJlYW1Qcml2YXRlS2V5Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IFwiSW52YWxpZCBTZWNyZXRzIG9idGFpbmVkIGZvciBNb29uYmVhbSBBUEkgY2FsbCFcIjtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uUmVtaW5kZXJFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBnZXROb3RpZmljYXRpb25SZW1pbmRlciBRdWVyeVxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIGJ1aWxkIHRoZSBNb29uYmVhbSBBcHBTeW5jIEFQSSBHcmFwaFFMIHF1ZXJ5LCBhbmQgcGVyZm9ybSBhIFBPU1QgdG8gaXQsXG4gICAgICAgICAgICAgKiB3aXRoIHRoZSBhcHByb3ByaWF0ZSBpbmZvcm1hdGlvbi5cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiB3ZSBpbXBseSB0aGF0IGlmIHRoZSBBUEkgZG9lcyBub3QgcmVzcG9uZCBpbiAxNSBzZWNvbmRzLCB0aGVuIHdlIGF1dG9tYXRpY2FsbHkgY2F0Y2ggdGhhdCwgYW5kIHJldHVybiBhblxuICAgICAgICAgICAgICogZXJyb3IgZm9yIGEgYmV0dGVyIGN1c3RvbWVyIGV4cGVyaWVuY2UuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHJldHVybiBheGlvcy5wb3N0KGAke21vb25iZWFtQmFzZVVSTH1gLCB7XG4gICAgICAgICAgICAgICAgcXVlcnk6IGdldE5vdGlmaWNhdGlvblJlbWluZGVyc1xuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgICAgIFwieC1hcGkta2V5XCI6IG1vb25iZWFtUHJpdmF0ZUtleVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGltZW91dDogMTUwMDAsIC8vIGluIG1pbGxpc2Vjb25kcyBoZXJlXG4gICAgICAgICAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZTogJ01vb25iZWFtIEFQSSB0aW1lZCBvdXQgYWZ0ZXIgMTUwMDBtcyEnXG4gICAgICAgICAgICB9KS50aGVuKGdldE5vdGlmaWNhdGlvblJlbWluZGVyc1Jlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlbmRwb2ludEluZm99IHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZ2V0Tm90aWZpY2F0aW9uUmVtaW5kZXJzUmVzcG9uc2UuZGF0YSl9YCk7XG5cbiAgICAgICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgZGF0YSBibG9jayBmcm9tIHRoZSByZXNwb25zZVxuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlRGF0YSA9IChnZXROb3RpZmljYXRpb25SZW1pbmRlcnNSZXNwb25zZSAmJiBnZXROb3RpZmljYXRpb25SZW1pbmRlcnNSZXNwb25zZS5kYXRhKSA/IGdldE5vdGlmaWNhdGlvblJlbWluZGVyc1Jlc3BvbnNlLmRhdGEuZGF0YSA6IG51bGw7XG5cbiAgICAgICAgICAgICAgICAvLyBjaGVjayBpZiB0aGVyZSBhcmUgYW55IGVycm9ycyBpbiB0aGUgcmV0dXJuZWQgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2VEYXRhICYmIHJlc3BvbnNlRGF0YS5nZXROb3RpZmljYXRpb25SZW1pbmRlcnMuZXJyb3JNZXNzYWdlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHJldHVybmVkIHRoZSBzdWNjZXNzZnVsbHkgcmV0cmlldmVkIG5vdGlmaWNhdGlvbiByZW1pbmRlcnNcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHJlc3BvbnNlRGF0YS5nZXROb3RpZmljYXRpb25SZW1pbmRlcnMuZGF0YSBhcyBOb3RpZmljYXRpb25SZW1pbmRlcltdXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2VEYXRhID9cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgdHlwZSwgZnJvbSB0aGUgb3JpZ2luYWwgQXBwU3luYyBjYWxsXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiByZXNwb25zZURhdGEuZ2V0Tm90aWZpY2F0aW9uUmVtaW5kZXJzLmVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IHJlc3BvbnNlRGF0YS5nZXROb3RpZmljYXRpb25SZW1pbmRlcnMuZXJyb3JUeXBlXG4gICAgICAgICAgICAgICAgICAgICAgICB9IDpcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgZXJyb3IgcmVzcG9uc2UgaW5kaWNhdGluZyBhbiBpbnZhbGlkIHN0cnVjdHVyZSByZXR1cm5lZFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogYEludmFsaWQgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gJHtlbmRwb2ludEluZm99IHJlc3BvbnNlIWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25SZW1pbmRlckVycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yLnJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBhbmQgdGhlIHNlcnZlciByZXNwb25kZWQgd2l0aCBhIHN0YXR1cyBjb2RlXG4gICAgICAgICAgICAgICAgICAgICAqIHRoYXQgZmFsbHMgb3V0IG9mIHRoZSByYW5nZSBvZiAyeHguXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm9uIDJ4eHggcmVzcG9uc2Ugd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgd2l0aCBzdGF0dXMgJHtlcnJvci5yZXNwb25zZS5zdGF0dXN9LCBhbmQgcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShlcnJvci5yZXNwb25zZS5kYXRhKX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGFueSBvdGhlciBzcGVjaWZpYyBlcnJvcnMgdG8gYmUgZmlsdGVyZWQgYmVsb3dcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25SZW1pbmRlckVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVycm9yLnJlcXVlc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGJ1dCBubyByZXNwb25zZSB3YXMgcmVjZWl2ZWRcbiAgICAgICAgICAgICAgICAgICAgICogYGVycm9yLnJlcXVlc3RgIGlzIGFuIGluc3RhbmNlIG9mIFhNTEh0dHBSZXF1ZXN0IGluIHRoZSBicm93c2VyIGFuZCBhbiBpbnN0YW5jZSBvZlxuICAgICAgICAgICAgICAgICAgICAgKiAgaHR0cC5DbGllbnRSZXF1ZXN0IGluIG5vZGUuanMuXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm8gcmVzcG9uc2UgcmVjZWl2ZWQgd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgZm9yIHJlcXVlc3QgJHtlcnJvci5yZXF1ZXN0fWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25SZW1pbmRlckVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBTb21ldGhpbmcgaGFwcGVuZWQgaW4gc2V0dGluZyB1cCB0aGUgcmVxdWVzdCB0aGF0IHRyaWdnZXJlZCBhbiBFcnJvclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IGZvciB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgJHsoZXJyb3IgJiYgZXJyb3IubWVzc2FnZSkgJiYgZXJyb3IubWVzc2FnZX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uUmVtaW5kZXJFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgcmV0cmlldmluZyBub3RpZmljYXRpb24gcmVtaW5kZXJzIHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJ9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25SZW1pbmRlckVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB1c2VkIHRvIHVwZGF0ZSBhIHNwZWNpZmljIG5vdGlmaWNhdGlvbiByZW1pbmRlci5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB1cGRhdGVOb3RpZmljYXRpb25SZW1pbmRlcklucHV0IHRoZSBub3RpZmljYXRpb24gcmVtaW5kZXIgaW5wdXQsIGNvbnRhaW5pbmcgYW55IGluZm9ybWF0aW9uIHVzZWQgdG9cbiAgICAgKiB1cGRhdGUgYW4gYXBwbGljYWJsZSBub3RpZmljYXRpb24gcmVtaW5kZXIuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBhIHtAbGluayBOb3RpZmljYXRpb25SZW1pbmRlclJlc3BvbnNlfSwgcmVwcmVzZW50aW5nIHRoZSB1cGRhdGUgbm90aWZpY2F0aW9uIHJlbWluZGVyLlxuICAgICAqXG4gICAgICogQHByb3RlY3RlZFxuICAgICAqL1xuICAgIGFzeW5jIHVwZGF0ZU5vdGlmaWNhdGlvblJlbWluZGVyKHVwZGF0ZU5vdGlmaWNhdGlvblJlbWluZGVySW5wdXQ6IFVwZGF0ZU5vdGlmaWNhdGlvblJlbWluZGVySW5wdXQpOiBQcm9taXNlPE5vdGlmaWNhdGlvblJlbWluZGVyUmVzcG9uc2U+IHtcbiAgICAgICAgLy8gZWFzaWx5IGlkZW50aWZpYWJsZSBBUEkgZW5kcG9pbnQgaW5mb3JtYXRpb25cbiAgICAgICAgY29uc3QgZW5kcG9pbnRJbmZvID0gJ3VwZGF0ZU5vdGlmaWNhdGlvblJlbWluZGVyIE11dGF0aW9uIE1vb25iZWFtIEdyYXBoUUwgQVBJJztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIEFQSSBLZXkgYW5kIEJhc2UgVVJMLCBuZWVkZWQgaW4gb3JkZXIgdG8gbWFrZSB0aGUgZWxpZ2libGUgdXNlciByZXRyaWV2YWwgY2FsbCB0aHJvdWdoIHRoZSBjbGllbnRcbiAgICAgICAgICAgIGNvbnN0IFttb29uYmVhbUJhc2VVUkwsIG1vb25iZWFtUHJpdmF0ZUtleV0gPSBhd2FpdCBzdXBlci5yZXRyaWV2ZVNlcnZpY2VDcmVkZW50aWFscyhDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5NT09OQkVBTV9JTlRFUk5BTF9TRUNSRVRfTkFNRSk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB3ZSBvYnRhaW5lZCBhbnkgaW52YWxpZCBzZWNyZXQgdmFsdWVzIGZyb20gdGhlIGNhbGwgYWJvdmVcbiAgICAgICAgICAgIGlmIChtb29uYmVhbUJhc2VVUkwgPT09IG51bGwgfHwgbW9vbmJlYW1CYXNlVVJMLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG1vb25iZWFtUHJpdmF0ZUtleSA9PT0gbnVsbCB8fCBtb29uYmVhbVByaXZhdGVLZXkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gXCJJbnZhbGlkIFNlY3JldHMgb2J0YWluZWQgZm9yIE1vb25iZWFtIEFQSSBjYWxsIVwiO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25SZW1pbmRlckVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIHVwZGF0ZU5vdGlmaWNhdGlvblJlbWluZGVyIE11dGF0aW9uXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogYnVpbGQgdGhlIE1vb25iZWFtIEFwcFN5bmMgQVBJIEdyYXBoUUwgcXVlcnksIGFuZCBwZXJmb3JtIGEgUE9TVCB0byBpdCxcbiAgICAgICAgICAgICAqIHdpdGggdGhlIGFwcHJvcHJpYXRlIGluZm9ybWF0aW9uLlxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIHdlIGltcGx5IHRoYXQgaWYgdGhlIEFQSSBkb2VzIG5vdCByZXNwb25kIGluIDE1IHNlY29uZHMsIHRoZW4gd2UgYXV0b21hdGljYWxseSBjYXRjaCB0aGF0LCBhbmQgcmV0dXJuIGFuXG4gICAgICAgICAgICAgKiBlcnJvciBmb3IgYSBiZXR0ZXIgY3VzdG9tZXIgZXhwZXJpZW5jZS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgcmV0dXJuIGF4aW9zLnBvc3QoYCR7bW9vbmJlYW1CYXNlVVJMfWAsIHtcbiAgICAgICAgICAgICAgICBxdWVyeTogdXBkYXRlTm90aWZpY2F0aW9uUmVtaW5kZXIsXG4gICAgICAgICAgICAgICAgdmFyaWFibGVzOiB7XG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZU5vdGlmaWNhdGlvblJlbWluZGVySW5wdXQ6IHVwZGF0ZU5vdGlmaWNhdGlvblJlbWluZGVySW5wdXRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAgICAgXCJ4LWFwaS1rZXlcIjogbW9vbmJlYW1Qcml2YXRlS2V5XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiAxNTAwMCwgLy8gaW4gbWlsbGlzZWNvbmRzIGhlcmVcbiAgICAgICAgICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlOiAnTW9vbmJlYW0gQVBJIHRpbWVkIG91dCBhZnRlciAxNTAwMG1zISdcbiAgICAgICAgICAgIH0pLnRoZW4odXBkYXRlTm90aWZpY2F0aW9uUmVtaW5kZXJSZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KHVwZGF0ZU5vdGlmaWNhdGlvblJlbWluZGVyUmVzcG9uc2UuZGF0YSl9YCk7XG5cbiAgICAgICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgZGF0YSBibG9jayBmcm9tIHRoZSByZXNwb25zZVxuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlRGF0YSA9ICh1cGRhdGVOb3RpZmljYXRpb25SZW1pbmRlclJlc3BvbnNlICYmIHVwZGF0ZU5vdGlmaWNhdGlvblJlbWluZGVyUmVzcG9uc2UuZGF0YSkgPyB1cGRhdGVOb3RpZmljYXRpb25SZW1pbmRlclJlc3BvbnNlLmRhdGEuZGF0YSA6IG51bGw7XG5cbiAgICAgICAgICAgICAgICAvLyBjaGVjayBpZiB0aGVyZSBhcmUgYW55IGVycm9ycyBpbiB0aGUgcmV0dXJuZWQgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2VEYXRhICYmIHJlc3BvbnNlRGF0YS51cGRhdGVOb3RpZmljYXRpb25SZW1pbmRlci5lcnJvck1lc3NhZ2UgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuZWQgdGhlIHN1Y2Nlc3NmdWxseSB1cGRhdGVkIG5vdGlmaWNhdGlvbiByZW1pbmRlclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogcmVzcG9uc2VEYXRhLnVwZGF0ZU5vdGlmaWNhdGlvblJlbWluZGVyLmRhdGEgYXMgTm90aWZpY2F0aW9uUmVtaW5kZXJbXVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlRGF0YSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIGVycm9yIG1lc3NhZ2UgYW5kIHR5cGUsIGZyb20gdGhlIG9yaWdpbmFsIEFwcFN5bmMgY2FsbFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogcmVzcG9uc2VEYXRhLnVwZGF0ZU5vdGlmaWNhdGlvblJlbWluZGVyLmVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IHJlc3BvbnNlRGF0YS51cGRhdGVOb3RpZmljYXRpb25SZW1pbmRlci5lcnJvclR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gOlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBlcnJvciByZXNwb25zZSBpbmRpY2F0aW5nIGFuIGludmFsaWQgc3RydWN0dXJlIHJldHVybmVkXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgSW52YWxpZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UhYCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvblJlbWluZGVyRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IucmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGFuZCB0aGUgc2VydmVyIHJlc3BvbmRlZCB3aXRoIGEgc3RhdHVzIGNvZGVcbiAgICAgICAgICAgICAgICAgICAgICogdGhhdCBmYWxscyBvdXQgb2YgdGhlIHJhbmdlIG9mIDJ4eC5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBOb24gMnh4eCByZXNwb25zZSB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gTW9vbmJlYW0gQVBJLCB3aXRoIHN0YXR1cyAke2Vycm9yLnJlc3BvbnNlLnN0YXR1c30sIGFuZCByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGVycm9yLnJlc3BvbnNlLmRhdGEpfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gYW55IG90aGVyIHNwZWNpZmljIGVycm9ycyB0byBiZSBmaWx0ZXJlZCBiZWxvd1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvblJlbWluZGVyRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3IucmVxdWVzdCkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYnV0IG5vIHJlc3BvbnNlIHdhcyByZWNlaXZlZFxuICAgICAgICAgICAgICAgICAgICAgKiBgZXJyb3IucmVxdWVzdGAgaXMgYW4gaW5zdGFuY2Ugb2YgWE1MSHR0cFJlcXVlc3QgaW4gdGhlIGJyb3dzZXIgYW5kIGFuIGluc3RhbmNlIG9mXG4gICAgICAgICAgICAgICAgICAgICAqICBodHRwLkNsaWVudFJlcXVlc3QgaW4gbm9kZS5qcy5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBObyByZXNwb25zZSByZWNlaXZlZCB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gTW9vbmJlYW0gQVBJLCBmb3IgcmVxdWVzdCAke2Vycm9yLnJlcXVlc3R9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvblJlbWluZGVyRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNvbWV0aGluZyBoYXBwZW5lZCBpbiBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IHRoYXQgdHJpZ2dlcmVkIGFuIEVycm9yXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgZm9yIHRoZSAke2VuZHBvaW50SW5mb30gTW9vbmJlYW0gQVBJLCAkeyhlcnJvciAmJiBlcnJvci5tZXNzYWdlKSAmJiBlcnJvci5tZXNzYWdlfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25SZW1pbmRlckVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSB1cGRhdGluZyB0aGUgbm90aWZpY2F0aW9uIHJlbWluZGVyIHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJ9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25SZW1pbmRlckVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB1c2VkIHRvIGdldCB0aGUgdXNlcnMgd2l0aCBubyBsaW5rZWQgY2FyZHMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBhIHtAbGluayBJbmVsaWdpYmxlTGlua2VkVXNlcnNSZXNwb25zZX0sIHJlcHJlc2VudGluZyB0aGUgdXNlcnNcbiAgICAgKiB3aGljaCBhcmUgbm90IGVsaWdpYmxlIGZvciBhIHJlaW1idXJzZW1lbnQsIHNpbmNlIHRoZXkgaGF2ZSBubyBsaW5rZWQgY2FyZHMuXG4gICAgICovXG4gICAgYXN5bmMgZ2V0VXNlcnNXaXRoTm9DYXJkcygpOiBQcm9taXNlPEluZWxpZ2libGVMaW5rZWRVc2Vyc1Jlc3BvbnNlPiB7XG4gICAgICAgIC8vIGVhc2lseSBpZGVudGlmaWFibGUgQVBJIGVuZHBvaW50IGluZm9ybWF0aW9uXG4gICAgICAgIGNvbnN0IGVuZHBvaW50SW5mbyA9ICdnZXRVc2Vyc1dpdGhOb0NhcmRzIFF1ZXJ5IE1vb25iZWFtIEdyYXBoUUwgQVBJJztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIEFQSSBLZXkgYW5kIEJhc2UgVVJMLCBuZWVkZWQgaW4gb3JkZXIgdG8gbWFrZSB0aGUgdXNlcnMgd2l0aCBubyBsaW5rZWQgY2FyZHMgcmV0cmlldmFsIGNhbGwgdGhyb3VnaCB0aGUgY2xpZW50XG4gICAgICAgICAgICBjb25zdCBbbW9vbmJlYW1CYXNlVVJMLCBtb29uYmVhbVByaXZhdGVLZXldID0gYXdhaXQgc3VwZXIucmV0cmlldmVTZXJ2aWNlQ3JlZGVudGlhbHMoQ29uc3RhbnRzLkFXU1BhaXJDb25zdGFudHMuTU9PTkJFQU1fSU5URVJOQUxfU0VDUkVUX05BTUUpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgd2Ugb2J0YWluZWQgYW55IGludmFsaWQgc2VjcmV0IHZhbHVlcyBmcm9tIHRoZSBjYWxsIGFib3ZlXG4gICAgICAgICAgICBpZiAobW9vbmJlYW1CYXNlVVJMID09PSBudWxsIHx8IG1vb25iZWFtQmFzZVVSTC5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBtb29uYmVhbVByaXZhdGVLZXkgPT09IG51bGwgfHwgbW9vbmJlYW1Qcml2YXRlS2V5Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IFwiSW52YWxpZCBTZWNyZXRzIG9idGFpbmVkIGZvciBNb29uYmVhbSBBUEkgY2FsbCFcIjtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBnZXRVc2Vyc1dpdGhOb0NhcmRzIFF1ZXJ5XG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogYnVpbGQgdGhlIE1vb25iZWFtIEFwcFN5bmMgQVBJIEdyYXBoUUwgcXVlcnksIGFuZCBwZXJmb3JtIGEgUE9TVCB0byBpdCxcbiAgICAgICAgICAgICAqIHdpdGggdGhlIGFwcHJvcHJpYXRlIGluZm9ybWF0aW9uLlxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIHdlIGltcGx5IHRoYXQgaWYgdGhlIEFQSSBkb2VzIG5vdCByZXNwb25kIGluIDE1IHNlY29uZHMsIHRoZW4gd2UgYXV0b21hdGljYWxseSBjYXRjaCB0aGF0LCBhbmQgcmV0dXJuIGFuXG4gICAgICAgICAgICAgKiBlcnJvciBmb3IgYSBiZXR0ZXIgY3VzdG9tZXIgZXhwZXJpZW5jZS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgcmV0dXJuIGF4aW9zLnBvc3QoYCR7bW9vbmJlYW1CYXNlVVJMfWAsIHtcbiAgICAgICAgICAgICAgICBxdWVyeTogZ2V0VXNlcnNXaXRoTm9DYXJkc1xuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgICAgIFwieC1hcGkta2V5XCI6IG1vb25iZWFtUHJpdmF0ZUtleVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGltZW91dDogMTUwMDAsIC8vIGluIG1pbGxpc2Vjb25kcyBoZXJlXG4gICAgICAgICAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZTogJ01vb25iZWFtIEFQSSB0aW1lZCBvdXQgYWZ0ZXIgMTUwMDBtcyEnXG4gICAgICAgICAgICB9KS50aGVuKGdldFVzZXJzV2l0aE5vQ2FyZHNSZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGdldFVzZXJzV2l0aE5vQ2FyZHNSZXNwb25zZS5kYXRhKX1gKTtcblxuICAgICAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBkYXRhIGJsb2NrIGZyb20gdGhlIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2VEYXRhID0gKGdldFVzZXJzV2l0aE5vQ2FyZHNSZXNwb25zZSAmJiBnZXRVc2Vyc1dpdGhOb0NhcmRzUmVzcG9uc2UuZGF0YSkgPyBnZXRVc2Vyc1dpdGhOb0NhcmRzUmVzcG9uc2UuZGF0YS5kYXRhIDogbnVsbDtcblxuICAgICAgICAgICAgICAgIC8vIGNoZWNrIGlmIHRoZXJlIGFyZSBhbnkgZXJyb3JzIGluIHRoZSByZXR1cm5lZCByZXNwb25zZVxuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZURhdGEgJiYgcmVzcG9uc2VEYXRhLmdldFVzZXJzV2l0aE5vQ2FyZHMuZXJyb3JNZXNzYWdlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHJldHVybmVkIHRoZSBzdWNjZXNzZnVsbHkgcmV0cmlldmVkIHVzZXJzIHdpdGggbm8gbGlua2VkIGNhcmRzXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiByZXNwb25zZURhdGEuZ2V0VXNlcnNXaXRoTm9DYXJkcy5kYXRhIGFzIFJldHJpZXZlVXNlckRldGFpbHNGb3JOb3RpZmljYXRpb25zW11cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZURhdGEgP1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBlcnJvciBtZXNzYWdlIGFuZCB0eXBlLCBmcm9tIHRoZSBvcmlnaW5hbCBBcHBTeW5jIGNhbGxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IHJlc3BvbnNlRGF0YS5nZXRVc2Vyc1dpdGhOb0NhcmRzLmVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IHJlc3BvbnNlRGF0YS5nZXRVc2Vyc1dpdGhOb0NhcmRzLmVycm9yVHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIGVycm9yIHJlc3BvbnNlIGluZGljYXRpbmcgYW4gaW52YWxpZCBzdHJ1Y3R1cmUgcmV0dXJuZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBJbnZhbGlkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tICR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSFgLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvci5yZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYW5kIHRoZSBzZXJ2ZXIgcmVzcG9uZGVkIHdpdGggYSBzdGF0dXMgY29kZVxuICAgICAgICAgICAgICAgICAgICAgKiB0aGF0IGZhbGxzIG91dCBvZiB0aGUgcmFuZ2Ugb2YgMnh4LlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vbiAyeHh4IHJlc3BvbnNlIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBNb29uYmVhbSBBUEksIHdpdGggc3RhdHVzICR7ZXJyb3IucmVzcG9uc2Uuc3RhdHVzfSwgYW5kIHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZXJyb3IucmVzcG9uc2UuZGF0YSl9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBhbnkgb3RoZXIgc3BlY2lmaWMgZXJyb3JzIHRvIGJlIGZpbHRlcmVkIGJlbG93XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5yZXF1ZXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBidXQgbm8gcmVzcG9uc2Ugd2FzIHJlY2VpdmVkXG4gICAgICAgICAgICAgICAgICAgICAqIGBlcnJvci5yZXF1ZXN0YCBpcyBhbiBpbnN0YW5jZSBvZiBYTUxIdHRwUmVxdWVzdCBpbiB0aGUgYnJvd3NlciBhbmQgYW4gaW5zdGFuY2Ugb2ZcbiAgICAgICAgICAgICAgICAgICAgICogIGh0dHAuQ2xpZW50UmVxdWVzdCBpbiBub2RlLmpzLlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vIHJlc3BvbnNlIHJlY2VpdmVkIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBNb29uYmVhbSBBUEksIGZvciByZXF1ZXN0ICR7ZXJyb3IucmVxdWVzdH1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU29tZXRoaW5nIGhhcHBlbmVkIGluIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgdGhhdCB0cmlnZ2VyZWQgYW4gRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgc2V0dGluZyB1cCB0aGUgcmVxdWVzdCBmb3IgdGhlICR7ZW5kcG9pbnRJbmZvfSBNb29uYmVhbSBBUEksICR7KGVycm9yICYmIGVycm9yLm1lc3NhZ2UpICYmIGVycm9yLm1lc3NhZ2V9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHJldHJpZXZpbmcgdXNlcnMgd2l0aCBubyBsaW5rZWQgY2FyZHMgdGhyb3VnaCAke2VuZHBvaW50SW5mb31gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfSAke2Vycn1gKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHVzZWQgdG8gcmV0cmlldmUgdGhlIHVwZGF0ZSB0aGUgZGV0YWlscyBvZiBhIGdpdmVuIGNhcmQuIFRoaXMgd2lsbCBlc3BlY2lhbGx5IGJlIHVzZWRcbiAgICAgKiB3aGVuIHVwZGF0aW5nIGl0cyBleHBpcmF0aW9uIGRhdGUuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIGEge2xpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIEVsaWdpYmxlTGlua2VkVXNlcnNSZXNwb25zZX0gcmVwcmVzZW50aW5nIHRoZSB1c2VyIHdpdGggdGhlXG4gICAgICogdXBkYXRlZCBjYXJkIGRldGFpbHMuXG4gICAgICovXG4gICAgYXN5bmMgdXBkYXRlQ2FyZERldGFpbHModXBkYXRlQ2FyZElucHV0OiBVcGRhdGVDYXJkSW5wdXQpOiBQcm9taXNlPEVsaWdpYmxlTGlua2VkVXNlcnNSZXNwb25zZT4ge1xuICAgICAgICAvLyBlYXNpbHkgaWRlbnRpZmlhYmxlIEFQSSBlbmRwb2ludCBpbmZvcm1hdGlvblxuICAgICAgICBjb25zdCBlbmRwb2ludEluZm8gPSAndXBkYXRlQ2FyZCBNdXRhdGlvbiBNb29uYmVhbSBHcmFwaFFMIEFQSSc7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBBUEkgS2V5IGFuZCBCYXNlIFVSTCwgbmVlZGVkIGluIG9yZGVyIHRvIG1ha2UgdGhlIGVsaWdpYmxlIHVzZXIgcmV0cmlldmFsIGNhbGwgdGhyb3VnaCB0aGUgY2xpZW50XG4gICAgICAgICAgICBjb25zdCBbbW9vbmJlYW1CYXNlVVJMLCBtb29uYmVhbVByaXZhdGVLZXldID0gYXdhaXQgc3VwZXIucmV0cmlldmVTZXJ2aWNlQ3JlZGVudGlhbHMoQ29uc3RhbnRzLkFXU1BhaXJDb25zdGFudHMuTU9PTkJFQU1fSU5URVJOQUxfU0VDUkVUX05BTUUpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgd2Ugb2J0YWluZWQgYW55IGludmFsaWQgc2VjcmV0IHZhbHVlcyBmcm9tIHRoZSBjYWxsIGFib3ZlXG4gICAgICAgICAgICBpZiAobW9vbmJlYW1CYXNlVVJMID09PSBudWxsIHx8IG1vb25iZWFtQmFzZVVSTC5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBtb29uYmVhbVByaXZhdGVLZXkgPT09IG51bGwgfHwgbW9vbmJlYW1Qcml2YXRlS2V5Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IFwiSW52YWxpZCBTZWNyZXRzIG9idGFpbmVkIGZvciBNb29uYmVhbSBBUEkgY2FsbCFcIjtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiB1cGRhdGVDYXJkIFF1ZXJ5XG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogYnVpbGQgdGhlIE1vb25iZWFtIEFwcFN5bmMgQVBJIEdyYXBoUUwgcXVlcnksIGFuZCBwZXJmb3JtIGEgUE9TVCB0byBpdCxcbiAgICAgICAgICAgICAqIHdpdGggdGhlIGFwcHJvcHJpYXRlIGluZm9ybWF0aW9uLlxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIHdlIGltcGx5IHRoYXQgaWYgdGhlIEFQSSBkb2VzIG5vdCByZXNwb25kIGluIDE1IHNlY29uZHMsIHRoZW4gd2UgYXV0b21hdGljYWxseSBjYXRjaCB0aGF0LCBhbmQgcmV0dXJuIGFuXG4gICAgICAgICAgICAgKiBlcnJvciBmb3IgYSBiZXR0ZXIgY3VzdG9tZXIgZXhwZXJpZW5jZS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgcmV0dXJuIGF4aW9zLnBvc3QoYCR7bW9vbmJlYW1CYXNlVVJMfWAsIHtcbiAgICAgICAgICAgICAgICBxdWVyeTogdXBkYXRlQ2FyZCxcbiAgICAgICAgICAgICAgICB2YXJpYWJsZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlQ2FyZElucHV0OiB1cGRhdGVDYXJkSW5wdXRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAgICAgXCJ4LWFwaS1rZXlcIjogbW9vbmJlYW1Qcml2YXRlS2V5XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiAxNTAwMCwgLy8gaW4gbWlsbGlzZWNvbmRzIGhlcmVcbiAgICAgICAgICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlOiAnTW9vbmJlYW0gQVBJIHRpbWVkIG91dCBhZnRlciAxNTAwMG1zISdcbiAgICAgICAgICAgIH0pLnRoZW4odXBkYXRlQ2FyZElucHV0UmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeSh1cGRhdGVDYXJkSW5wdXRSZXNwb25zZS5kYXRhKX1gKTtcblxuICAgICAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBkYXRhIGJsb2NrIGZyb20gdGhlIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2VEYXRhID0gKHVwZGF0ZUNhcmRJbnB1dFJlc3BvbnNlICYmIHVwZGF0ZUNhcmRJbnB1dFJlc3BvbnNlLmRhdGEpID8gdXBkYXRlQ2FyZElucHV0UmVzcG9uc2UuZGF0YS5kYXRhIDogbnVsbDtcblxuICAgICAgICAgICAgICAgIC8vIGNoZWNrIGlmIHRoZXJlIGFyZSBhbnkgZXJyb3JzIGluIHRoZSByZXR1cm5lZCByZXNwb25zZVxuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZURhdGEgJiYgcmVzcG9uc2VEYXRhLnVwZGF0ZUNhcmQuZXJyb3JNZXNzYWdlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHJldHVybmVkIHRoZSBzdWNjZXNzZnVsbHkgdXBkYXRlZCBjYXJkIGRldGFpbHNcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHJlc3BvbnNlRGF0YS51cGRhdGVDYXJkLmRhdGEgYXMgRWxpZ2libGVMaW5rZWRVc2VyW11cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZURhdGEgP1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBlcnJvciBtZXNzYWdlIGFuZCB0eXBlLCBmcm9tIHRoZSBvcmlnaW5hbCBBcHBTeW5jIGNhbGxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IHJlc3BvbnNlRGF0YS51cGRhdGVDYXJkLmVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IHJlc3BvbnNlRGF0YS51cGRhdGVDYXJkLmVycm9yVHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIGVycm9yIHJlc3BvbnNlIGluZGljYXRpbmcgYW4gaW52YWxpZCBzdHJ1Y3R1cmUgcmV0dXJuZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBJbnZhbGlkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tICR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSFgLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvci5yZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYW5kIHRoZSBzZXJ2ZXIgcmVzcG9uZGVkIHdpdGggYSBzdGF0dXMgY29kZVxuICAgICAgICAgICAgICAgICAgICAgKiB0aGF0IGZhbGxzIG91dCBvZiB0aGUgcmFuZ2Ugb2YgMnh4LlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vbiAyeHh4IHJlc3BvbnNlIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBNb29uYmVhbSBBUEksIHdpdGggc3RhdHVzICR7ZXJyb3IucmVzcG9uc2Uuc3RhdHVzfSwgYW5kIHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZXJyb3IucmVzcG9uc2UuZGF0YSl9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBhbnkgb3RoZXIgc3BlY2lmaWMgZXJyb3JzIHRvIGJlIGZpbHRlcmVkIGJlbG93XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5yZXF1ZXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBidXQgbm8gcmVzcG9uc2Ugd2FzIHJlY2VpdmVkXG4gICAgICAgICAgICAgICAgICAgICAqIGBlcnJvci5yZXF1ZXN0YCBpcyBhbiBpbnN0YW5jZSBvZiBYTUxIdHRwUmVxdWVzdCBpbiB0aGUgYnJvd3NlciBhbmQgYW4gaW5zdGFuY2Ugb2ZcbiAgICAgICAgICAgICAgICAgICAgICogIGh0dHAuQ2xpZW50UmVxdWVzdCBpbiBub2RlLmpzLlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vIHJlc3BvbnNlIHJlY2VpdmVkIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBNb29uYmVhbSBBUEksIGZvciByZXF1ZXN0ICR7ZXJyb3IucmVxdWVzdH1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU29tZXRoaW5nIGhhcHBlbmVkIGluIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgdGhhdCB0cmlnZ2VyZWQgYW4gRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgc2V0dGluZyB1cCB0aGUgcmVxdWVzdCBmb3IgdGhlICR7ZW5kcG9pbnRJbmZvfSBNb29uYmVhbSBBUEksICR7KGVycm9yICYmIGVycm9yLm1lc3NhZ2UpICYmIGVycm9yLm1lc3NhZ2V9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHVwZGF0aW5nIGNhcmQgZGV0YWlscyB0aHJvdWdoICR7ZW5kcG9pbnRJbmZvfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9ICR7ZXJyfWApO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdXNlZCB0byByZXRyaWV2ZSB0aGUgbGlzdCBvZiBlbGlnaWJsZSBsaW5rZWQgdXNlcnMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIGEge2xpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIEVsaWdpYmxlTGlua2VkVXNlcnNSZXNwb25zZX0gcmVwcmVzZW50aW5nIHRoZSBsaXN0IG9mIGVsaWdpYmxlXG4gICAgICogdXNlcnNcbiAgICAgKi9cbiAgICBhc3luYyBnZXRFbGlnaWJsZUxpbmtlZFVzZXJzKCk6IFByb21pc2U8RWxpZ2libGVMaW5rZWRVc2Vyc1Jlc3BvbnNlPiB7XG4gICAgICAgIC8vIGVhc2lseSBpZGVudGlmaWFibGUgQVBJIGVuZHBvaW50IGluZm9ybWF0aW9uXG4gICAgICAgIGNvbnN0IGVuZHBvaW50SW5mbyA9ICdnZXRFbGlnaWJsZUxpbmtlZFVzZXJzIFF1ZXJ5IE1vb25iZWFtIEdyYXBoUUwgQVBJJztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIEFQSSBLZXkgYW5kIEJhc2UgVVJMLCBuZWVkZWQgaW4gb3JkZXIgdG8gbWFrZSB0aGUgZWxpZ2libGUgdXNlciByZXRyaWV2YWwgY2FsbCB0aHJvdWdoIHRoZSBjbGllbnRcbiAgICAgICAgICAgIGNvbnN0IFttb29uYmVhbUJhc2VVUkwsIG1vb25iZWFtUHJpdmF0ZUtleV0gPSBhd2FpdCBzdXBlci5yZXRyaWV2ZVNlcnZpY2VDcmVkZW50aWFscyhDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5NT09OQkVBTV9JTlRFUk5BTF9TRUNSRVRfTkFNRSk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB3ZSBvYnRhaW5lZCBhbnkgaW52YWxpZCBzZWNyZXQgdmFsdWVzIGZyb20gdGhlIGNhbGwgYWJvdmVcbiAgICAgICAgICAgIGlmIChtb29uYmVhbUJhc2VVUkwgPT09IG51bGwgfHwgbW9vbmJlYW1CYXNlVVJMLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG1vb25iZWFtUHJpdmF0ZUtleSA9PT0gbnVsbCB8fCBtb29uYmVhbVByaXZhdGVLZXkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gXCJJbnZhbGlkIFNlY3JldHMgb2J0YWluZWQgZm9yIE1vb25iZWFtIEFQSSBjYWxsIVwiO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIGdldEVsaWdpYmxlTGlua2VkVXNlcnMgUXVlcnlcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBidWlsZCB0aGUgTW9vbmJlYW0gQXBwU3luYyBBUEkgR3JhcGhRTCBxdWVyeSwgYW5kIHBlcmZvcm0gYSBQT1NUIHRvIGl0LFxuICAgICAgICAgICAgICogd2l0aCB0aGUgYXBwcm9wcmlhdGUgaW5mb3JtYXRpb24uXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogd2UgaW1wbHkgdGhhdCBpZiB0aGUgQVBJIGRvZXMgbm90IHJlc3BvbmQgaW4gMTUgc2Vjb25kcywgdGhlbiB3ZSBhdXRvbWF0aWNhbGx5IGNhdGNoIHRoYXQsIGFuZCByZXR1cm4gYW5cbiAgICAgICAgICAgICAqIGVycm9yIGZvciBhIGJldHRlciBjdXN0b21lciBleHBlcmllbmNlLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICByZXR1cm4gYXhpb3MucG9zdChgJHttb29uYmVhbUJhc2VVUkx9YCwge1xuICAgICAgICAgICAgICAgIHF1ZXJ5OiBnZXRFbGlnaWJsZUxpbmtlZFVzZXJzXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAgICAgXCJ4LWFwaS1rZXlcIjogbW9vbmJlYW1Qcml2YXRlS2V5XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiAxNTAwMCwgLy8gaW4gbWlsbGlzZWNvbmRzIGhlcmVcbiAgICAgICAgICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlOiAnTW9vbmJlYW0gQVBJIHRpbWVkIG91dCBhZnRlciAxNTAwMG1zISdcbiAgICAgICAgICAgIH0pLnRoZW4oZ2V0RWxpZ2libGVMaW5rZWRVc2Vyc1Jlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlbmRwb2ludEluZm99IHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZ2V0RWxpZ2libGVMaW5rZWRVc2Vyc1Jlc3BvbnNlLmRhdGEpfWApO1xuXG4gICAgICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIGRhdGEgYmxvY2sgZnJvbSB0aGUgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICBjb25zdCByZXNwb25zZURhdGEgPSAoZ2V0RWxpZ2libGVMaW5rZWRVc2Vyc1Jlc3BvbnNlICYmIGdldEVsaWdpYmxlTGlua2VkVXNlcnNSZXNwb25zZS5kYXRhKSA/IGdldEVsaWdpYmxlTGlua2VkVXNlcnNSZXNwb25zZS5kYXRhLmRhdGEgOiBudWxsO1xuXG4gICAgICAgICAgICAgICAgLy8gY2hlY2sgaWYgdGhlcmUgYXJlIGFueSBlcnJvcnMgaW4gdGhlIHJldHVybmVkIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlRGF0YSAmJiByZXNwb25zZURhdGEuZ2V0RWxpZ2libGVMaW5rZWRVc2Vycy5lcnJvck1lc3NhZ2UgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuZWQgdGhlIHN1Y2Nlc3NmdWxseSByZXRyaWV2ZWQgZWxpZ2libGUgbGlua2VkIHVzZXJzXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiByZXNwb25zZURhdGEuZ2V0RWxpZ2libGVMaW5rZWRVc2Vycy5kYXRhIGFzIEVsaWdpYmxlTGlua2VkVXNlcltdXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2VEYXRhID9cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgdHlwZSwgZnJvbSB0aGUgb3JpZ2luYWwgQXBwU3luYyBjYWxsXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiByZXNwb25zZURhdGEuZ2V0RWxpZ2libGVMaW5rZWRVc2Vycy5lcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiByZXNwb25zZURhdGEuZ2V0RWxpZ2libGVMaW5rZWRVc2Vycy5lcnJvclR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gOlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBlcnJvciByZXNwb25zZSBpbmRpY2F0aW5nIGFuIGludmFsaWQgc3RydWN0dXJlIHJldHVybmVkXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgSW52YWxpZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UhYCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IucmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGFuZCB0aGUgc2VydmVyIHJlc3BvbmRlZCB3aXRoIGEgc3RhdHVzIGNvZGVcbiAgICAgICAgICAgICAgICAgICAgICogdGhhdCBmYWxscyBvdXQgb2YgdGhlIHJhbmdlIG9mIDJ4eC5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBOb24gMnh4eCByZXNwb25zZSB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gTW9vbmJlYW0gQVBJLCB3aXRoIHN0YXR1cyAke2Vycm9yLnJlc3BvbnNlLnN0YXR1c30sIGFuZCByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGVycm9yLnJlc3BvbnNlLmRhdGEpfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gYW55IG90aGVyIHNwZWNpZmljIGVycm9ycyB0byBiZSBmaWx0ZXJlZCBiZWxvd1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3IucmVxdWVzdCkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYnV0IG5vIHJlc3BvbnNlIHdhcyByZWNlaXZlZFxuICAgICAgICAgICAgICAgICAgICAgKiBgZXJyb3IucmVxdWVzdGAgaXMgYW4gaW5zdGFuY2Ugb2YgWE1MSHR0cFJlcXVlc3QgaW4gdGhlIGJyb3dzZXIgYW5kIGFuIGluc3RhbmNlIG9mXG4gICAgICAgICAgICAgICAgICAgICAqICBodHRwLkNsaWVudFJlcXVlc3QgaW4gbm9kZS5qcy5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBObyByZXNwb25zZSByZWNlaXZlZCB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gTW9vbmJlYW0gQVBJLCBmb3IgcmVxdWVzdCAke2Vycm9yLnJlcXVlc3R9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IENhcmRMaW5rRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNvbWV0aGluZyBoYXBwZW5lZCBpbiBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IHRoYXQgdHJpZ2dlcmVkIGFuIEVycm9yXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgZm9yIHRoZSAke2VuZHBvaW50SW5mb30gTW9vbmJlYW0gQVBJLCAkeyhlcnJvciAmJiBlcnJvci5tZXNzYWdlKSAmJiBlcnJvci5tZXNzYWdlfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBDYXJkTGlua0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSByZXRyaWV2aW5nIGVsaWdpYmxlIGxpbmtlZCB1c2VycyB0aHJvdWdoICR7ZW5kcG9pbnRJbmZvfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9ICR7ZXJyfWApO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogQ2FyZExpbmtFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdXNlZCB0byBjcmVhdGUgYSBuZXcgdHJhbnNhY3Rpb24gaW50ZXJuYWxseSwgZnJvbSBhbiBpbmNvbWluZyB0cmFuc2FjdGlvblxuICAgICAqIG9idGFpbmVkIGZyb20gdGhlIFNRUyBtZXNzYWdlL2V2ZW50XG4gICAgICpcbiAgICAgKiBAcGFyYW0gdHJhbnNhY3Rpb24gdHJhbnNhY3Rpb24gcGFzc2VkIGluIGZyb20gdGhlIFNRUyBtZXNzYWdlL2V2ZW50XG4gICAgICpcbiAgICAgKiBAcmV0dXJuIGEge2xpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIE1vb25iZWFtVHJhbnNhY3Rpb25SZXNwb25zZX0gcmVwcmVzZW50aW5nIHRoZSB0cmFuc2FjdGlvblxuICAgICAqIGRldGFpbHMgdGhhdCB3ZXJlIHN0b3JlZCBpbiBEeW5hbW8gREJcbiAgICAgKi9cbiAgICBhc3luYyBjcmVhdGVUcmFuc2FjdGlvbih0cmFuc2FjdGlvbjogTW9vbmJlYW1UcmFuc2FjdGlvbik6IFByb21pc2U8TW9vbmJlYW1UcmFuc2FjdGlvblJlc3BvbnNlPiB7XG4gICAgICAgIC8vIGVhc2lseSBpZGVudGlmaWFibGUgQVBJIGVuZHBvaW50IGluZm9ybWF0aW9uXG4gICAgICAgIGNvbnN0IGVuZHBvaW50SW5mbyA9ICdjcmVhdGVUcmFuc2FjdGlvbiBNdXRhdGlvbiBNb29uYmVhbSBHcmFwaFFMIEFQSSc7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBBUEkgS2V5IGFuZCBCYXNlIFVSTCwgbmVlZGVkIGluIG9yZGVyIHRvIG1ha2UgdGhlIGNhcmQgbGlua2luZyBjYWxsIHRocm91Z2ggdGhlIGNsaWVudFxuICAgICAgICAgICAgY29uc3QgW21vb25iZWFtQmFzZVVSTCwgbW9vbmJlYW1Qcml2YXRlS2V5XSA9IGF3YWl0IHN1cGVyLnJldHJpZXZlU2VydmljZUNyZWRlbnRpYWxzKENvbnN0YW50cy5BV1NQYWlyQ29uc3RhbnRzLk1PT05CRUFNX0lOVEVSTkFMX1NFQ1JFVF9OQU1FKTtcblxuICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHdlIG9idGFpbmVkIGFueSBpbnZhbGlkIHNlY3JldCB2YWx1ZXMgZnJvbSB0aGUgY2FsbCBhYm92ZVxuICAgICAgICAgICAgaWYgKG1vb25iZWFtQmFzZVVSTCA9PT0gbnVsbCB8fCBtb29uYmVhbUJhc2VVUkwubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgbW9vbmJlYW1Qcml2YXRlS2V5ID09PSBudWxsIHx8IG1vb25iZWFtUHJpdmF0ZUtleS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBcIkludmFsaWQgU2VjcmV0cyBvYnRhaW5lZCBmb3IgTW9vbmJlYW0gQVBJIGNhbGwhXCI7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIGNyZWF0ZVRyYW5zYWN0aW9uIE11dGF0aW9uXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogYnVpbGQgdGhlIE1vb25iZWFtIEFwcFN5bmMgQVBJIEdyYXBoUUwgbXV0YXRpb24gYm9keSB0byBiZSBwYXNzZWQgaW4gd2l0aCBpdHMgdmFyaWFibGVzLCBhbmQgcGVyZm9ybSBhIFBPU1QgdG8gaXQsXG4gICAgICAgICAgICAgKiB3aXRoIHRoZSBhcHByb3ByaWF0ZSBpbmZvcm1hdGlvblxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIHdlIGltcGx5IHRoYXQgaWYgdGhlIEFQSSBkb2VzIG5vdCByZXNwb25kIGluIDE1IHNlY29uZHMsIHRoZW4gd2UgYXV0b21hdGljYWxseSBjYXRjaCB0aGF0LCBhbmQgcmV0dXJuIGFuXG4gICAgICAgICAgICAgKiBlcnJvciBmb3IgYSBiZXR0ZXIgY3VzdG9tZXIgZXhwZXJpZW5jZS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgY29uc29sZS5sb2coYE1vb25iZWFtIEFwcFN5bmMgQVBJIHJlcXVlc3QgT2JqZWN0OiAke0pTT04uc3RyaW5naWZ5KHRyYW5zYWN0aW9uIGFzIENyZWF0ZVRyYW5zYWN0aW9uSW5wdXQpfWApO1xuICAgICAgICAgICAgcmV0dXJuIGF4aW9zLnBvc3QoYCR7bW9vbmJlYW1CYXNlVVJMfWAsIHtcbiAgICAgICAgICAgICAgICBxdWVyeTogY3JlYXRlVHJhbnNhY3Rpb24sXG4gICAgICAgICAgICAgICAgdmFyaWFibGVzOiB7XG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZVRyYW5zYWN0aW9uSW5wdXQ6IHRyYW5zYWN0aW9uIGFzIENyZWF0ZVRyYW5zYWN0aW9uSW5wdXRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAgICAgXCJ4LWFwaS1rZXlcIjogbW9vbmJlYW1Qcml2YXRlS2V5XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiAxNTAwMCwgLy8gaW4gbWlsbGlzZWNvbmRzIGhlcmVcbiAgICAgICAgICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlOiAnTW9vbmJlYW0gQVBJIHRpbWVkIG91dCBhZnRlciAxNTAwMG1zISdcbiAgICAgICAgICAgIH0pLnRoZW4oY3JlYXRlVHJhbnNhY3Rpb25SZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGNyZWF0ZVRyYW5zYWN0aW9uUmVzcG9uc2UuZGF0YSl9YCk7XG5cbiAgICAgICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgZGF0YSBibG9jayBmcm9tIHRoZSByZXNwb25zZVxuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlRGF0YSA9IChjcmVhdGVUcmFuc2FjdGlvblJlc3BvbnNlICYmIGNyZWF0ZVRyYW5zYWN0aW9uUmVzcG9uc2UuZGF0YSkgPyBjcmVhdGVUcmFuc2FjdGlvblJlc3BvbnNlLmRhdGEuZGF0YSA6IG51bGw7XG5cbiAgICAgICAgICAgICAgICAvLyBjaGVjayBpZiB0aGVyZSBhcmUgYW55IGVycm9ycyBpbiB0aGUgcmV0dXJuZWQgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2VEYXRhICYmIHJlc3BvbnNlRGF0YS5jcmVhdGVUcmFuc2FjdGlvbi5lcnJvck1lc3NhZ2UgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuZWQgdGhlIHN1Y2Nlc3NmdWxseSBzdG9yZWQgdHJhbnNhY3Rpb24sIGFzIHdlbGwgYXMgaXRzIElEIGluIHRoZSBwYXJlbnQgb2JqZWN0LCBmb3Igc3Vic2NyaXB0aW9uIHB1cnBvc2VzXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogdHJhbnNhY3Rpb24uaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB0cmFuc2FjdGlvblxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlRGF0YSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIGVycm9yIG1lc3NhZ2UgYW5kIHR5cGUsIGZyb20gdGhlIG9yaWdpbmFsIEFwcFN5bmMgY2FsbFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogcmVzcG9uc2VEYXRhLmNyZWF0ZVRyYW5zYWN0aW9uLmVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IHJlc3BvbnNlRGF0YS5jcmVhdGVUcmFuc2FjdGlvbi5lcnJvclR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gOlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBlcnJvciByZXNwb25zZSBpbmRpY2F0aW5nIGFuIGludmFsaWQgc3RydWN0dXJlIHJldHVybmVkXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgSW52YWxpZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UhYCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yLnJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBhbmQgdGhlIHNlcnZlciByZXNwb25kZWQgd2l0aCBhIHN0YXR1cyBjb2RlXG4gICAgICAgICAgICAgICAgICAgICAqIHRoYXQgZmFsbHMgb3V0IG9mIHRoZSByYW5nZSBvZiAyeHguXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm9uIDJ4eHggcmVzcG9uc2Ugd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgd2l0aCBzdGF0dXMgJHtlcnJvci5yZXNwb25zZS5zdGF0dXN9LCBhbmQgcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShlcnJvci5yZXNwb25zZS5kYXRhKX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGFueSBvdGhlciBzcGVjaWZpYyBlcnJvcnMgdG8gYmUgZmlsdGVyZWQgYmVsb3dcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5yZXF1ZXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBidXQgbm8gcmVzcG9uc2Ugd2FzIHJlY2VpdmVkXG4gICAgICAgICAgICAgICAgICAgICAqIGBlcnJvci5yZXF1ZXN0YCBpcyBhbiBpbnN0YW5jZSBvZiBYTUxIdHRwUmVxdWVzdCBpbiB0aGUgYnJvd3NlciBhbmQgYW4gaW5zdGFuY2Ugb2ZcbiAgICAgICAgICAgICAgICAgICAgICogIGh0dHAuQ2xpZW50UmVxdWVzdCBpbiBub2RlLmpzLlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vIHJlc3BvbnNlIHJlY2VpdmVkIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBNb29uYmVhbSBBUEksIGZvciByZXF1ZXN0ICR7ZXJyb3IucmVxdWVzdH1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNvbWV0aGluZyBoYXBwZW5lZCBpbiBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IHRoYXQgdHJpZ2dlcmVkIGFuIEVycm9yXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgZm9yIHRoZSAke2VuZHBvaW50SW5mb30gTW9vbmJlYW0gQVBJLCAkeyhlcnJvciAmJiBlcnJvci5tZXNzYWdlKSAmJiBlcnJvci5tZXNzYWdlfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgY3JlYXRpbmcgYSBuZXcgdHJhbnNhY3Rpb24gdGhyb3VnaCAke2VuZHBvaW50SW5mb31gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfSAke2Vycn1gKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB1c2VkIHRvIGdldCBhbGwgdHJhbnNhY3Rpb25zLCBmb3IgYSBwYXJ0aWN1bGFyIHVzZXIsIGZpbHRlcmVkXG4gICAgICogYnkgdGhlaXIgc3RhdHVzLlxuICAgICAqXG4gICAgICogQHBhcmFtIGdldFRyYW5zYWN0aW9uQnlTdGF0dXNJbnB1dCB0aGUgdHJhbnNhY3Rpb24gYnkgc3RhdHVzIGlucHV0IG9iamVjdCBvdCBiZSBwYXNzZWQgaW4sXG4gICAgICogY29udGFpbmluZyBhbGwgdGhlIG5lY2Vzc2FyeSBmaWx0ZXJpbmcgZm9yIHJldHJpZXZpbmcgdGhlIHRyYW5zYWN0aW9ucy5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIGEge0BsaW5rIE1vb25iZWFtVHJhbnNhY3Rpb25zQnlTdGF0dXNSZXNwb25zZX0gcmVwcmVzZW50aW5nIHRoZSB0cmFuc2FjdGlvbmFsIGRhdGEsXG4gICAgICogZmlsdGVyZWQgYnkgc3RhdHVzIHJlc3BvbnNlXG4gICAgICovXG4gICAgYXN5bmMgZ2V0VHJhbnNhY3Rpb25CeVN0YXR1cyhnZXRUcmFuc2FjdGlvbkJ5U3RhdHVzSW5wdXQ6IEdldFRyYW5zYWN0aW9uQnlTdGF0dXNJbnB1dCk6IFByb21pc2U8TW9vbmJlYW1UcmFuc2FjdGlvbnNCeVN0YXR1c1Jlc3BvbnNlPiB7XG4gICAgICAgIC8vIGVhc2lseSBpZGVudGlmaWFibGUgQVBJIGVuZHBvaW50IGluZm9ybWF0aW9uXG4gICAgICAgIGNvbnN0IGVuZHBvaW50SW5mbyA9ICdnZXRUcmFuc2FjdGlvbkJ5U3RhdHVzIFF1ZXJ5IE1vb25iZWFtIEdyYXBoUUwgQVBJJztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIEFQSSBLZXkgYW5kIEJhc2UgVVJMLCBuZWVkZWQgaW4gb3JkZXIgdG8gbWFrZSB0aGUgdHJhbnNhY3Rpb24gYnkgc3RhdHVzIHJldHJpZXZhbCBjYWxsIHRocm91Z2ggdGhlIGNsaWVudFxuICAgICAgICAgICAgY29uc3QgW21vb25iZWFtQmFzZVVSTCwgbW9vbmJlYW1Qcml2YXRlS2V5XSA9IGF3YWl0IHN1cGVyLnJldHJpZXZlU2VydmljZUNyZWRlbnRpYWxzKENvbnN0YW50cy5BV1NQYWlyQ29uc3RhbnRzLk1PT05CRUFNX0lOVEVSTkFMX1NFQ1JFVF9OQU1FKTtcblxuICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHdlIG9idGFpbmVkIGFueSBpbnZhbGlkIHNlY3JldCB2YWx1ZXMgZnJvbSB0aGUgY2FsbCBhYm92ZVxuICAgICAgICAgICAgaWYgKG1vb25iZWFtQmFzZVVSTCA9PT0gbnVsbCB8fCBtb29uYmVhbUJhc2VVUkwubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgbW9vbmJlYW1Qcml2YXRlS2V5ID09PSBudWxsIHx8IG1vb25iZWFtUHJpdmF0ZUtleS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBcIkludmFsaWQgU2VjcmV0cyBvYnRhaW5lZCBmb3IgTW9vbmJlYW0gQVBJIGNhbGwhXCI7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIGdldFRyYW5zYWN0aW9uQnlTdGF0dXMgUXVlcnlcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBidWlsZCB0aGUgTW9vbmJlYW0gQXBwU3luYyBBUEkgR3JhcGhRTCBxdWVyeSwgYW5kIHBlcmZvcm0gYSBQT1NUIHRvIGl0LFxuICAgICAgICAgICAgICogd2l0aCB0aGUgYXBwcm9wcmlhdGUgaW5mb3JtYXRpb24uXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogd2UgaW1wbHkgdGhhdCBpZiB0aGUgQVBJIGRvZXMgbm90IHJlc3BvbmQgaW4gMTUgc2Vjb25kcywgdGhlbiB3ZSBhdXRvbWF0aWNhbGx5IGNhdGNoIHRoYXQsIGFuZCByZXR1cm4gYW5cbiAgICAgICAgICAgICAqIGVycm9yIGZvciBhIGJldHRlciBjdXN0b21lciBleHBlcmllbmNlLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICByZXR1cm4gYXhpb3MucG9zdChgJHttb29uYmVhbUJhc2VVUkx9YCwge1xuICAgICAgICAgICAgICAgIHF1ZXJ5OiBnZXRUcmFuc2FjdGlvbkJ5U3RhdHVzLFxuICAgICAgICAgICAgICAgIHZhcmlhYmxlczoge1xuICAgICAgICAgICAgICAgICAgICBnZXRUcmFuc2FjdGlvbkJ5U3RhdHVzSW5wdXQ6IGdldFRyYW5zYWN0aW9uQnlTdGF0dXNJbnB1dFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgICAgICBcIngtYXBpLWtleVwiOiBtb29uYmVhbVByaXZhdGVLZXlcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDE1MDAwLCAvLyBpbiBtaWxsaXNlY29uZHMgaGVyZVxuICAgICAgICAgICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2U6ICdNb29uYmVhbSBBUEkgdGltZWQgb3V0IGFmdGVyIDE1MDAwbXMhJ1xuICAgICAgICAgICAgfSkudGhlbihnZXRUcmFuc2FjdGlvbkJ5U3RhdHVzUmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShnZXRUcmFuc2FjdGlvbkJ5U3RhdHVzUmVzcG9uc2UuZGF0YSl9YCk7XG5cbiAgICAgICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgZGF0YSBibG9jayBmcm9tIHRoZSByZXNwb25zZVxuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlRGF0YSA9IChnZXRUcmFuc2FjdGlvbkJ5U3RhdHVzUmVzcG9uc2UgJiYgZ2V0VHJhbnNhY3Rpb25CeVN0YXR1c1Jlc3BvbnNlLmRhdGEpID8gZ2V0VHJhbnNhY3Rpb25CeVN0YXR1c1Jlc3BvbnNlLmRhdGEuZGF0YSA6IG51bGw7XG5cbiAgICAgICAgICAgICAgICAvLyBjaGVjayBpZiB0aGVyZSBhcmUgYW55IGVycm9ycyBpbiB0aGUgcmV0dXJuZWQgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2VEYXRhICYmIHJlc3BvbnNlRGF0YS5nZXRUcmFuc2FjdGlvbkJ5U3RhdHVzLmVycm9yTWVzc2FnZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm5lZCB0aGUgc3VjY2Vzc2Z1bGx5IHJldHJpZXZlZCB0cmFuc2FjdGlvbnMgZm9yIGEgZ2l2ZW4gdXNlciwgZmlsdGVyZWQgYnkgdGhlaXIgc3RhdHVzXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiByZXNwb25zZURhdGEuZ2V0VHJhbnNhY3Rpb25CeVN0YXR1cy5kYXRhIGFzIE1vb25iZWFtVHJhbnNhY3Rpb25CeVN0YXR1c1tdXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2VEYXRhID9cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgdHlwZSwgZnJvbSB0aGUgb3JpZ2luYWwgQXBwU3luYyBjYWxsXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiByZXNwb25zZURhdGEuZ2V0VHJhbnNhY3Rpb25CeVN0YXR1cy5lcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiByZXNwb25zZURhdGEuZ2V0VHJhbnNhY3Rpb25CeVN0YXR1cy5lcnJvclR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gOlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBlcnJvciByZXNwb25zZSBpbmRpY2F0aW5nIGFuIGludmFsaWQgc3RydWN0dXJlIHJldHVybmVkXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgSW52YWxpZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UhYCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yLnJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBhbmQgdGhlIHNlcnZlciByZXNwb25kZWQgd2l0aCBhIHN0YXR1cyBjb2RlXG4gICAgICAgICAgICAgICAgICAgICAqIHRoYXQgZmFsbHMgb3V0IG9mIHRoZSByYW5nZSBvZiAyeHguXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm9uIDJ4eHggcmVzcG9uc2Ugd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgd2l0aCBzdGF0dXMgJHtlcnJvci5yZXNwb25zZS5zdGF0dXN9LCBhbmQgcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShlcnJvci5yZXNwb25zZS5kYXRhKX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGFueSBvdGhlciBzcGVjaWZpYyBlcnJvcnMgdG8gYmUgZmlsdGVyZWQgYmVsb3dcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5yZXF1ZXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBidXQgbm8gcmVzcG9uc2Ugd2FzIHJlY2VpdmVkXG4gICAgICAgICAgICAgICAgICAgICAqIGBlcnJvci5yZXF1ZXN0YCBpcyBhbiBpbnN0YW5jZSBvZiBYTUxIdHRwUmVxdWVzdCBpbiB0aGUgYnJvd3NlciBhbmQgYW4gaW5zdGFuY2Ugb2ZcbiAgICAgICAgICAgICAgICAgICAgICogIGh0dHAuQ2xpZW50UmVxdWVzdCBpbiBub2RlLmpzLlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vIHJlc3BvbnNlIHJlY2VpdmVkIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBNb29uYmVhbSBBUEksIGZvciByZXF1ZXN0ICR7ZXJyb3IucmVxdWVzdH1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNvbWV0aGluZyBoYXBwZW5lZCBpbiBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IHRoYXQgdHJpZ2dlcmVkIGFuIEVycm9yXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgZm9yIHRoZSAke2VuZHBvaW50SW5mb30gTW9vbmJlYW0gQVBJLCAkeyhlcnJvciAmJiBlcnJvci5tZXNzYWdlKSAmJiBlcnJvci5tZXNzYWdlfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgcmV0cmlldmluZyB0cmFuc2FjdGlvbnMgZm9yIGEgcGFydGljdWxhciB1c2VyLCBmaWx0ZXJlZCBieSB0aGVpciBzdGF0dXMgdGhyb3VnaCAke2VuZHBvaW50SW5mb31gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfSAke2Vycn1gKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB1c2VkIHRvIGdldCBhbGwgdHJhbnNhY3Rpb25zLCBpbiBhIHBhcnRpY3VsYXIgdGltZSByYW5nZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBnZXRUcmFuc2FjdGlvbnNJblJhbmdlSW5wdXQgdGhlIHRyYW5zYWN0aW9uIGluIHJhbmdlIGlucHV0IG9iamVjdCB0byBiZSBwYXNzZWQgaW4sXG4gICAgICogY29udGFpbmluZyBhbGwgdGhlIG5lY2Vzc2FyeSBmaWx0ZXJpbmcgZm9yIHJldHJpZXZpbmcgdGhlIHRyYW5zYWN0aW9ucyBpbiBhIHBhcnRpY3VsYXIgdGltZSByYW5nZS5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIGEge0BsaW5rIE1vb25iZWFtVHJhbnNhY3Rpb25zUmVzcG9uc2V9IHJlcHJlc2VudGluZyB0aGUgdHJhbnNhY3Rpb25hbCBkYXRhLlxuICAgICAqXG4gICAgICogQHByb3RlY3RlZFxuICAgICAqL1xuICAgIGFzeW5jIGdldFRyYW5zYWN0aW9uc0luUmFuZ2UoZ2V0VHJhbnNhY3Rpb25zSW5SYW5nZUlucHV0OiBHZXRUcmFuc2FjdGlvbnNJblJhbmdlSW5wdXQpOiBQcm9taXNlPE1vb25iZWFtVHJhbnNhY3Rpb25zUmVzcG9uc2U+IHtcbiAgICAgICAgLy8gZWFzaWx5IGlkZW50aWZpYWJsZSBBUEkgZW5kcG9pbnQgaW5mb3JtYXRpb25cbiAgICAgICAgY29uc3QgZW5kcG9pbnRJbmZvID0gJ2dldFRyYW5zYWN0aW9uc0luUmFuZ2UgUXVlcnkgTW9vbmJlYW0gR3JhcGhRTCBBUEknO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgQVBJIEtleSBhbmQgQmFzZSBVUkwsIG5lZWRlZCBpbiBvcmRlciB0byBtYWtlIHRoZSB0cmFuc2FjdGlvbiByZXRyaWV2YWwgY2FsbCB0aHJvdWdoIHRoZSBjbGllbnRcbiAgICAgICAgICAgIGNvbnN0IFttb29uYmVhbUJhc2VVUkwsIG1vb25iZWFtUHJpdmF0ZUtleV0gPSBhd2FpdCBzdXBlci5yZXRyaWV2ZVNlcnZpY2VDcmVkZW50aWFscyhDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5NT09OQkVBTV9JTlRFUk5BTF9TRUNSRVRfTkFNRSk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB3ZSBvYnRhaW5lZCBhbnkgaW52YWxpZCBzZWNyZXQgdmFsdWVzIGZyb20gdGhlIGNhbGwgYWJvdmVcbiAgICAgICAgICAgIGlmIChtb29uYmVhbUJhc2VVUkwgPT09IG51bGwgfHwgbW9vbmJlYW1CYXNlVVJMLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG1vb25iZWFtUHJpdmF0ZUtleSA9PT0gbnVsbCB8fCBtb29uYmVhbVByaXZhdGVLZXkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gXCJJbnZhbGlkIFNlY3JldHMgb2J0YWluZWQgZm9yIE1vb25iZWFtIEFQSSBjYWxsIVwiO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBnZXRUcmFuc2FjdGlvbnNJblJhbmdlIFF1ZXJ5XG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogYnVpbGQgdGhlIE1vb25iZWFtIEFwcFN5bmMgQVBJIEdyYXBoUUwgcXVlcnksIGFuZCBwZXJmb3JtIGEgUE9TVCB0byBpdCxcbiAgICAgICAgICAgICAqIHdpdGggdGhlIGFwcHJvcHJpYXRlIGluZm9ybWF0aW9uLlxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIHdlIGltcGx5IHRoYXQgaWYgdGhlIEFQSSBkb2VzIG5vdCByZXNwb25kIGluIDE1IHNlY29uZHMsIHRoZW4gd2UgYXV0b21hdGljYWxseSBjYXRjaCB0aGF0LCBhbmQgcmV0dXJuIGFuXG4gICAgICAgICAgICAgKiBlcnJvciBmb3IgYSBiZXR0ZXIgY3VzdG9tZXIgZXhwZXJpZW5jZS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgcmV0dXJuIGF4aW9zLnBvc3QoYCR7bW9vbmJlYW1CYXNlVVJMfWAsIHtcbiAgICAgICAgICAgICAgICBxdWVyeTogZ2V0VHJhbnNhY3Rpb25zSW5SYW5nZSxcbiAgICAgICAgICAgICAgICB2YXJpYWJsZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgZ2V0VHJhbnNhY3Rpb25zSW5SYW5nZUlucHV0OiBnZXRUcmFuc2FjdGlvbnNJblJhbmdlSW5wdXRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAgICAgXCJ4LWFwaS1rZXlcIjogbW9vbmJlYW1Qcml2YXRlS2V5XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiAxNTAwMCwgLy8gaW4gbWlsbGlzZWNvbmRzIGhlcmVcbiAgICAgICAgICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlOiAnTW9vbmJlYW0gQVBJIHRpbWVkIG91dCBhZnRlciAxNTAwMG1zISdcbiAgICAgICAgICAgIH0pLnRoZW4oZ2V0VHJhbnNhY3Rpb25zSW5SYW5nZVJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICAvLyB3ZSBkb24ndCB3YW50IHRvIGxvZyB0aGlzIGluIGNhc2Ugb2Ygc3VjY2VzcyByZXNwb25zZXMsIGJlY2F1c2UgdGhlIHRyYW5zYWN0aW9uIHJlc3BvbnNlcyBhcmUgdmVyeSBsb25nIChmcnVnYWxpdHkpXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coYCR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGdldFRyYW5zYWN0aW9uc1Jlc3BvbnNlcy5kYXRhKX1gKTtcblxuICAgICAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBkYXRhIGJsb2NrIGZyb20gdGhlIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2VEYXRhID0gKGdldFRyYW5zYWN0aW9uc0luUmFuZ2VSZXNwb25zZSAmJiBnZXRUcmFuc2FjdGlvbnNJblJhbmdlUmVzcG9uc2UuZGF0YSkgPyBnZXRUcmFuc2FjdGlvbnNJblJhbmdlUmVzcG9uc2UuZGF0YS5kYXRhIDogbnVsbDtcblxuICAgICAgICAgICAgICAgIC8vIGNoZWNrIGlmIHRoZXJlIGFyZSBhbnkgZXJyb3JzIGluIHRoZSByZXR1cm5lZCByZXNwb25zZVxuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZURhdGEgJiYgcmVzcG9uc2VEYXRhLmdldFRyYW5zYWN0aW9uc0luUmFuZ2UuZXJyb3JNZXNzYWdlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHJldHVybmVkIHRoZSBzdWNjZXNzZnVsbHkgcmV0cmlldmVkIHRyYW5zYWN0aW9ucyBmb3IgYSBnaXZlbiB1c2VyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiByZXNwb25zZURhdGEuZ2V0VHJhbnNhY3Rpb25zSW5SYW5nZS5kYXRhIGFzIE1vb25iZWFtVHJhbnNhY3Rpb25bXVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlRGF0YSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIGVycm9yIG1lc3NhZ2UgYW5kIHR5cGUsIGZyb20gdGhlIG9yaWdpbmFsIEFwcFN5bmMgY2FsbFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogcmVzcG9uc2VEYXRhLmdldFRyYW5zYWN0aW9uc0luUmFuZ2UuZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogcmVzcG9uc2VEYXRhLmdldFRyYW5zYWN0aW9uc0luUmFuZ2UuZXJyb3JUeXBlXG4gICAgICAgICAgICAgICAgICAgICAgICB9IDpcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgZXJyb3IgcmVzcG9uc2UgaW5kaWNhdGluZyBhbiBpbnZhbGlkIHN0cnVjdHVyZSByZXR1cm5lZFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogYEludmFsaWQgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gJHtlbmRwb2ludEluZm99IHJlc3BvbnNlIWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvci5yZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYW5kIHRoZSBzZXJ2ZXIgcmVzcG9uZGVkIHdpdGggYSBzdGF0dXMgY29kZVxuICAgICAgICAgICAgICAgICAgICAgKiB0aGF0IGZhbGxzIG91dCBvZiB0aGUgcmFuZ2Ugb2YgMnh4LlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vbiAyeHh4IHJlc3BvbnNlIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBNb29uYmVhbSBBUEksIHdpdGggc3RhdHVzICR7ZXJyb3IucmVzcG9uc2Uuc3RhdHVzfSwgYW5kIHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZXJyb3IucmVzcG9uc2UuZGF0YSl9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBhbnkgb3RoZXIgc3BlY2lmaWMgZXJyb3JzIHRvIGJlIGZpbHRlcmVkIGJlbG93XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3IucmVxdWVzdCkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYnV0IG5vIHJlc3BvbnNlIHdhcyByZWNlaXZlZFxuICAgICAgICAgICAgICAgICAgICAgKiBgZXJyb3IucmVxdWVzdGAgaXMgYW4gaW5zdGFuY2Ugb2YgWE1MSHR0cFJlcXVlc3QgaW4gdGhlIGJyb3dzZXIgYW5kIGFuIGluc3RhbmNlIG9mXG4gICAgICAgICAgICAgICAgICAgICAqICBodHRwLkNsaWVudFJlcXVlc3QgaW4gbm9kZS5qcy5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBObyByZXNwb25zZSByZWNlaXZlZCB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gTW9vbmJlYW0gQVBJLCBmb3IgcmVxdWVzdCAke2Vycm9yLnJlcXVlc3R9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBTb21ldGhpbmcgaGFwcGVuZWQgaW4gc2V0dGluZyB1cCB0aGUgcmVxdWVzdCB0aGF0IHRyaWdnZXJlZCBhbiBFcnJvclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IGZvciB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgJHsoZXJyb3IgJiYgZXJyb3IubWVzc2FnZSkgJiYgZXJyb3IubWVzc2FnZX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHJldHJpZXZpbmcgdHJhbnNhY3Rpb25zIGZvciBhIHBhcnRpY3VsYXIgdGltZSByYW5nZSwgdGhyb3VnaCAke2VuZHBvaW50SW5mb31gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfSAke2Vycn1gKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB1c2VkIHRvIGdldCBhbGwgdHJhbnNhY3Rpb25zLCBmb3IgYSBwYXJ0aWN1bGFyIHVzZXIuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZ2V0VHJhbnNhY3Rpb25JbnB1dCB0aGUgdHJhbnNhY3Rpb24gaW5wdXQgb2JqZWN0IHRvIGJlIHBhc3NlZCBpbixcbiAgICAgKiBjb250YWluaW5nIGFsbCB0aGUgbmVjZXNzYXJ5IGZpbHRlcmluZyBmb3IgcmV0cmlldmluZyB0aGUgdHJhbnNhY3Rpb25zIGZvciBhIHBhcnRpY3VsYXIgdXNlci5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIGEge0BsaW5rIE1vb25iZWFtVHJhbnNhY3Rpb25zUmVzcG9uc2V9IHJlcHJlc2VudGluZyB0aGUgdHJhbnNhY3Rpb25hbCBkYXRhLlxuICAgICAqL1xuICAgIGFzeW5jIGdldFRyYW5zYWN0aW9uKGdldFRyYW5zYWN0aW9uSW5wdXQ6IEdldFRyYW5zYWN0aW9uSW5wdXQpOiBQcm9taXNlPE1vb25iZWFtVHJhbnNhY3Rpb25zUmVzcG9uc2U+IHtcbiAgICAgICAgLy8gZWFzaWx5IGlkZW50aWZpYWJsZSBBUEkgZW5kcG9pbnQgaW5mb3JtYXRpb25cbiAgICAgICAgY29uc3QgZW5kcG9pbnRJbmZvID0gJ2dldFRyYW5zYWN0aW9uIFF1ZXJ5IE1vb25iZWFtIEdyYXBoUUwgQVBJJztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIEFQSSBLZXkgYW5kIEJhc2UgVVJMLCBuZWVkZWQgaW4gb3JkZXIgdG8gbWFrZSB0aGUgdHJhbnNhY3Rpb24gcmV0cmlldmFsIGNhbGwgdGhyb3VnaCB0aGUgY2xpZW50XG4gICAgICAgICAgICBjb25zdCBbbW9vbmJlYW1CYXNlVVJMLCBtb29uYmVhbVByaXZhdGVLZXldID0gYXdhaXQgc3VwZXIucmV0cmlldmVTZXJ2aWNlQ3JlZGVudGlhbHMoQ29uc3RhbnRzLkFXU1BhaXJDb25zdGFudHMuTU9PTkJFQU1fSU5URVJOQUxfU0VDUkVUX05BTUUpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgd2Ugb2J0YWluZWQgYW55IGludmFsaWQgc2VjcmV0IHZhbHVlcyBmcm9tIHRoZSBjYWxsIGFib3ZlXG4gICAgICAgICAgICBpZiAobW9vbmJlYW1CYXNlVVJMID09PSBudWxsIHx8IG1vb25iZWFtQmFzZVVSTC5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBtb29uYmVhbVByaXZhdGVLZXkgPT09IG51bGwgfHwgbW9vbmJlYW1Qcml2YXRlS2V5Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IFwiSW52YWxpZCBTZWNyZXRzIG9idGFpbmVkIGZvciBNb29uYmVhbSBBUEkgY2FsbCFcIjtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogZ2V0VHJhbnNhY3Rpb24gUXVlcnlcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBidWlsZCB0aGUgTW9vbmJlYW0gQXBwU3luYyBBUEkgR3JhcGhRTCBxdWVyeSwgYW5kIHBlcmZvcm0gYSBQT1NUIHRvIGl0LFxuICAgICAgICAgICAgICogd2l0aCB0aGUgYXBwcm9wcmlhdGUgaW5mb3JtYXRpb24uXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogd2UgaW1wbHkgdGhhdCBpZiB0aGUgQVBJIGRvZXMgbm90IHJlc3BvbmQgaW4gMTUgc2Vjb25kcywgdGhlbiB3ZSBhdXRvbWF0aWNhbGx5IGNhdGNoIHRoYXQsIGFuZCByZXR1cm4gYW5cbiAgICAgICAgICAgICAqIGVycm9yIGZvciBhIGJldHRlciBjdXN0b21lciBleHBlcmllbmNlLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICByZXR1cm4gYXhpb3MucG9zdChgJHttb29uYmVhbUJhc2VVUkx9YCwge1xuICAgICAgICAgICAgICAgIHF1ZXJ5OiBnZXRUcmFuc2FjdGlvbixcbiAgICAgICAgICAgICAgICB2YXJpYWJsZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgZ2V0VHJhbnNhY3Rpb25JbnB1dDogZ2V0VHJhbnNhY3Rpb25JbnB1dFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgICAgICBcIngtYXBpLWtleVwiOiBtb29uYmVhbVByaXZhdGVLZXlcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDE1MDAwLCAvLyBpbiBtaWxsaXNlY29uZHMgaGVyZVxuICAgICAgICAgICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2U6ICdNb29uYmVhbSBBUEkgdGltZWQgb3V0IGFmdGVyIDE1MDAwbXMhJ1xuICAgICAgICAgICAgfSkudGhlbihnZXRUcmFuc2FjdGlvbnNSZXNwb25zZXMgPT4ge1xuICAgICAgICAgICAgICAgIC8vIHdlIGRvbid0IHdhbnQgdG8gbG9nIHRoaXMgaW4gY2FzZSBvZiBzdWNjZXNzIHJlc3BvbnNlcywgYmVjYXVzZSB0aGUgdHJhbnNhY3Rpb24gcmVzcG9uc2VzIGFyZSB2ZXJ5IGxvbmcgKGZydWdhbGl0eSlcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhgJHtlbmRwb2ludEluZm99IHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZ2V0VHJhbnNhY3Rpb25zUmVzcG9uc2VzLmRhdGEpfWApO1xuXG4gICAgICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIGRhdGEgYmxvY2sgZnJvbSB0aGUgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICBjb25zdCByZXNwb25zZURhdGEgPSAoZ2V0VHJhbnNhY3Rpb25zUmVzcG9uc2VzICYmIGdldFRyYW5zYWN0aW9uc1Jlc3BvbnNlcy5kYXRhKSA/IGdldFRyYW5zYWN0aW9uc1Jlc3BvbnNlcy5kYXRhLmRhdGEgOiBudWxsO1xuXG4gICAgICAgICAgICAgICAgLy8gY2hlY2sgaWYgdGhlcmUgYXJlIGFueSBlcnJvcnMgaW4gdGhlIHJldHVybmVkIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlRGF0YSAmJiByZXNwb25zZURhdGEuZ2V0VHJhbnNhY3Rpb24uZXJyb3JNZXNzYWdlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHJldHVybmVkIHRoZSBzdWNjZXNzZnVsbHkgcmV0cmlldmVkIHRyYW5zYWN0aW9ucyBmb3IgYSBnaXZlbiB1c2VyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiByZXNwb25zZURhdGEuZ2V0VHJhbnNhY3Rpb24uZGF0YSBhcyBNb29uYmVhbVRyYW5zYWN0aW9uW11cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZURhdGEgP1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBlcnJvciBtZXNzYWdlIGFuZCB0eXBlLCBmcm9tIHRoZSBvcmlnaW5hbCBBcHBTeW5jIGNhbGxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IHJlc3BvbnNlRGF0YS5nZXRUcmFuc2FjdGlvbi5lcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiByZXNwb25zZURhdGEuZ2V0VHJhbnNhY3Rpb24uZXJyb3JUeXBlXG4gICAgICAgICAgICAgICAgICAgICAgICB9IDpcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgZXJyb3IgcmVzcG9uc2UgaW5kaWNhdGluZyBhbiBpbnZhbGlkIHN0cnVjdHVyZSByZXR1cm5lZFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogYEludmFsaWQgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gJHtlbmRwb2ludEluZm99IHJlc3BvbnNlIWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvci5yZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYW5kIHRoZSBzZXJ2ZXIgcmVzcG9uZGVkIHdpdGggYSBzdGF0dXMgY29kZVxuICAgICAgICAgICAgICAgICAgICAgKiB0aGF0IGZhbGxzIG91dCBvZiB0aGUgcmFuZ2Ugb2YgMnh4LlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vbiAyeHh4IHJlc3BvbnNlIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBNb29uYmVhbSBBUEksIHdpdGggc3RhdHVzICR7ZXJyb3IucmVzcG9uc2Uuc3RhdHVzfSwgYW5kIHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZXJyb3IucmVzcG9uc2UuZGF0YSl9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBhbnkgb3RoZXIgc3BlY2lmaWMgZXJyb3JzIHRvIGJlIGZpbHRlcmVkIGJlbG93XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3IucmVxdWVzdCkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYnV0IG5vIHJlc3BvbnNlIHdhcyByZWNlaXZlZFxuICAgICAgICAgICAgICAgICAgICAgKiBgZXJyb3IucmVxdWVzdGAgaXMgYW4gaW5zdGFuY2Ugb2YgWE1MSHR0cFJlcXVlc3QgaW4gdGhlIGJyb3dzZXIgYW5kIGFuIGluc3RhbmNlIG9mXG4gICAgICAgICAgICAgICAgICAgICAqICBodHRwLkNsaWVudFJlcXVlc3QgaW4gbm9kZS5qcy5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBObyByZXNwb25zZSByZWNlaXZlZCB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gTW9vbmJlYW0gQVBJLCBmb3IgcmVxdWVzdCAke2Vycm9yLnJlcXVlc3R9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBTb21ldGhpbmcgaGFwcGVuZWQgaW4gc2V0dGluZyB1cCB0aGUgcmVxdWVzdCB0aGF0IHRyaWdnZXJlZCBhbiBFcnJvclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IGZvciB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgJHsoZXJyb3IgJiYgZXJyb3IubWVzc2FnZSkgJiYgZXJyb3IubWVzc2FnZX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHJldHJpZXZpbmcgdHJhbnNhY3Rpb25zIGZvciBhIHBhcnRpY3VsYXIgdXNlciwgdGhyb3VnaCAke2VuZHBvaW50SW5mb31gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfSAke2Vycn1gKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB1c2VkIHRvIHVwZGF0ZSBhbiBleGlzdGluZyB0cmFuc2FjdGlvbidzIGRldGFpbHMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gdXBkYXRlVHJhbnNhY3Rpb25JbnB1dCB0aGUgdHJhbnNhY3Rpb24gZGV0YWlscyB0byBiZSBwYXNzZWQgaW4sIGluIG9yZGVyIHRvIHVwZGF0ZVxuICAgICAqIGFuIGV4aXN0aW5nIHRyYW5zYWN0aW9uXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBhIHtAbGluayBNb29uYmVhbVVwZGF0ZWRUcmFuc2FjdGlvblJlc3BvbnNlfSByZXByZXNlbnRpbmcgdGhlIHVwZGF0ZSB0cmFuc2FjdGlvbidzXG4gICAgICogZGF0YVxuICAgICAqL1xuICAgIGFzeW5jIHVwZGF0ZVRyYW5zYWN0aW9uKHVwZGF0ZVRyYW5zYWN0aW9uSW5wdXQ6IFVwZGF0ZVRyYW5zYWN0aW9uSW5wdXQpOiBQcm9taXNlPE1vb25iZWFtVXBkYXRlZFRyYW5zYWN0aW9uUmVzcG9uc2U+IHtcbiAgICAgICAgLy8gZWFzaWx5IGlkZW50aWZpYWJsZSBBUEkgZW5kcG9pbnQgaW5mb3JtYXRpb25cbiAgICAgICAgY29uc3QgZW5kcG9pbnRJbmZvID0gJ3VwZGF0ZVRyYW5zYWN0aW9uIE11dGF0aW9uIE1vb25iZWFtIEdyYXBoUUwgQVBJJztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIEFQSSBLZXkgYW5kIEJhc2UgVVJMLCBuZWVkZWQgaW4gb3JkZXIgdG8gbWFrZSB0aGUgdHJhbnNhY3Rpb24gdXBkYXRlZCBjYWxsIHRocm91Z2ggdGhlIGNsaWVudFxuICAgICAgICAgICAgY29uc3QgW21vb25iZWFtQmFzZVVSTCwgbW9vbmJlYW1Qcml2YXRlS2V5XSA9IGF3YWl0IHN1cGVyLnJldHJpZXZlU2VydmljZUNyZWRlbnRpYWxzKENvbnN0YW50cy5BV1NQYWlyQ29uc3RhbnRzLk1PT05CRUFNX0lOVEVSTkFMX1NFQ1JFVF9OQU1FKTtcblxuICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHdlIG9idGFpbmVkIGFueSBpbnZhbGlkIHNlY3JldCB2YWx1ZXMgZnJvbSB0aGUgY2FsbCBhYm92ZVxuICAgICAgICAgICAgaWYgKG1vb25iZWFtQmFzZVVSTCA9PT0gbnVsbCB8fCBtb29uYmVhbUJhc2VVUkwubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgbW9vbmJlYW1Qcml2YXRlS2V5ID09PSBudWxsIHx8IG1vb25iZWFtUHJpdmF0ZUtleS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBcIkludmFsaWQgU2VjcmV0cyBvYnRhaW5lZCBmb3IgTW9vbmJlYW0gQVBJIGNhbGwhXCI7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIHVwZGF0ZVRyYW5zYWN0aW9uIE11dGF0aW9uXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogYnVpbGQgdGhlIE1vb25iZWFtIEFwcFN5bmMgQVBJIEdyYXBoUUwgcXVlcnksIGFuZCBwZXJmb3JtIGEgUE9TVCB0byBpdCxcbiAgICAgICAgICAgICAqIHdpdGggdGhlIGFwcHJvcHJpYXRlIGluZm9ybWF0aW9uLlxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIHdlIGltcGx5IHRoYXQgaWYgdGhlIEFQSSBkb2VzIG5vdCByZXNwb25kIGluIDE1IHNlY29uZHMsIHRoZW4gd2UgYXV0b21hdGljYWxseSBjYXRjaCB0aGF0LCBhbmQgcmV0dXJuIGFuXG4gICAgICAgICAgICAgKiBlcnJvciBmb3IgYSBiZXR0ZXIgY3VzdG9tZXIgZXhwZXJpZW5jZS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgcmV0dXJuIGF4aW9zLnBvc3QoYCR7bW9vbmJlYW1CYXNlVVJMfWAsIHtcbiAgICAgICAgICAgICAgICBxdWVyeTogdXBkYXRlVHJhbnNhY3Rpb24sXG4gICAgICAgICAgICAgICAgdmFyaWFibGVzOiB7XG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZVRyYW5zYWN0aW9uSW5wdXQ6IHVwZGF0ZVRyYW5zYWN0aW9uSW5wdXRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAgICAgXCJ4LWFwaS1rZXlcIjogbW9vbmJlYW1Qcml2YXRlS2V5XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiAxNTAwMCwgLy8gaW4gbWlsbGlzZWNvbmRzIGhlcmVcbiAgICAgICAgICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlOiAnTW9vbmJlYW0gQVBJIHRpbWVkIG91dCBhZnRlciAxNTAwMG1zISdcbiAgICAgICAgICAgIH0pLnRoZW4odXBkYXRlVHJhbnNhY3Rpb25SZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KHVwZGF0ZVRyYW5zYWN0aW9uUmVzcG9uc2UuZGF0YSl9YCk7XG5cbiAgICAgICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgZGF0YSBibG9jayBmcm9tIHRoZSByZXNwb25zZVxuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlRGF0YSA9ICh1cGRhdGVUcmFuc2FjdGlvblJlc3BvbnNlICYmIHVwZGF0ZVRyYW5zYWN0aW9uUmVzcG9uc2UuZGF0YSkgPyB1cGRhdGVUcmFuc2FjdGlvblJlc3BvbnNlLmRhdGEuZGF0YSA6IG51bGw7XG5cbiAgICAgICAgICAgICAgICAvLyBjaGVjayBpZiB0aGVyZSBhcmUgYW55IGVycm9ycyBpbiB0aGUgcmV0dXJuZWQgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2VEYXRhICYmIHJlc3BvbnNlRGF0YS51cGRhdGVUcmFuc2FjdGlvbi5lcnJvck1lc3NhZ2UgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuZWQgdGhlIHN1Y2Nlc3NmdWxseSB1cGRhdGVkIHRyYW5zYWN0aW9uYWwgaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHJlc3BvbnNlRGF0YS51cGRhdGVUcmFuc2FjdGlvbi5kYXRhIGFzIE1vb25iZWFtVXBkYXRlZFRyYW5zYWN0aW9uXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2VEYXRhID9cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgdHlwZSwgZnJvbSB0aGUgb3JpZ2luYWwgQXBwU3luYyBjYWxsXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiByZXNwb25zZURhdGEudXBkYXRlVHJhbnNhY3Rpb24uZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogcmVzcG9uc2VEYXRhLnVwZGF0ZVRyYW5zYWN0aW9uLmVycm9yVHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIGVycm9yIHJlc3BvbnNlIGluZGljYXRpbmcgYW4gaW52YWxpZCBzdHJ1Y3R1cmUgcmV0dXJuZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBJbnZhbGlkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tICR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSFgLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IucmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGFuZCB0aGUgc2VydmVyIHJlc3BvbmRlZCB3aXRoIGEgc3RhdHVzIGNvZGVcbiAgICAgICAgICAgICAgICAgICAgICogdGhhdCBmYWxscyBvdXQgb2YgdGhlIHJhbmdlIG9mIDJ4eC5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBOb24gMnh4eCByZXNwb25zZSB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gTW9vbmJlYW0gQVBJLCB3aXRoIHN0YXR1cyAke2Vycm9yLnJlc3BvbnNlLnN0YXR1c30sIGFuZCByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGVycm9yLnJlc3BvbnNlLmRhdGEpfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gYW55IG90aGVyIHNwZWNpZmljIGVycm9ycyB0byBiZSBmaWx0ZXJlZCBiZWxvd1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVycm9yLnJlcXVlc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGJ1dCBubyByZXNwb25zZSB3YXMgcmVjZWl2ZWRcbiAgICAgICAgICAgICAgICAgICAgICogYGVycm9yLnJlcXVlc3RgIGlzIGFuIGluc3RhbmNlIG9mIFhNTEh0dHBSZXF1ZXN0IGluIHRoZSBicm93c2VyIGFuZCBhbiBpbnN0YW5jZSBvZlxuICAgICAgICAgICAgICAgICAgICAgKiAgaHR0cC5DbGllbnRSZXF1ZXN0IGluIG5vZGUuanMuXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm8gcmVzcG9uc2UgcmVjZWl2ZWQgd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgZm9yIHJlcXVlc3QgJHtlcnJvci5yZXF1ZXN0fWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU29tZXRoaW5nIGhhcHBlbmVkIGluIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgdGhhdCB0cmlnZ2VyZWQgYW4gRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgc2V0dGluZyB1cCB0aGUgcmVxdWVzdCBmb3IgdGhlICR7ZW5kcG9pbnRJbmZvfSBNb29uYmVhbSBBUEksICR7KGVycm9yICYmIGVycm9yLm1lc3NhZ2UpICYmIGVycm9yLm1lc3NhZ2V9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSB1cGRhdGluZyB0cmFuc2FjdGlvbmFsIGRhdGEsIHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJ9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdXNlZCB0byBjcmVhdGUgYSBidWxrIG5vdGlmaWNhdGlvbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBjcmVhdGVCdWxrTm90aWZpY2F0aW9uSW5wdXQgdGhlIGJ1bGsgbm90aWZpY2F0aW9uIGRldGFpbHMgdG8gYmUgcGFzc2VkIGluLCBpbiBvcmRlciB0byBjcmVhdGUgYSBuZXdcbiAgICAgKiBidWxrIG5vdGlmaWNhdGlvblxuICAgICAqXG4gICAgICogQHJldHVybnMgYSB7QGxpbmsgQ3JlYXRlQnVsa05vdGlmaWNhdGlvblJlc3BvbnNlfSByZXByZXNlbnRpbmcgdGhlIG5ld2x5IGNyZWF0ZWQgYnVsayBub3RpZmljYXRpb24gZGF0YVxuICAgICAqL1xuICAgIGFzeW5jIGNyZWF0ZUJ1bGtOb3RpZmljYXRpb24oY3JlYXRlQnVsa05vdGlmaWNhdGlvbklucHV0OiBDcmVhdGVCdWxrTm90aWZpY2F0aW9uSW5wdXQpOiBQcm9taXNlPENyZWF0ZUJ1bGtOb3RpZmljYXRpb25SZXNwb25zZT4ge1xuICAgICAgICAvLyBlYXNpbHkgaWRlbnRpZmlhYmxlIEFQSSBlbmRwb2ludCBpbmZvcm1hdGlvblxuICAgICAgICBjb25zdCBlbmRwb2ludEluZm8gPSAnY3JlYXRlQnVsa05vdGlmaWNhdGlvbiBNdXRhdGlvbiBNb29uYmVhbSBHcmFwaFFMIEFQSSc7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBBUEkgS2V5IGFuZCBCYXNlIFVSTCwgbmVlZGVkIGluIG9yZGVyIHRvIG1ha2UgYSBidWxrIG5vdGlmaWNhdGlvbiBjcmVhdGlvbiBjYWxsIHRocm91Z2ggdGhlIGNsaWVudFxuICAgICAgICAgICAgY29uc3QgW21vb25iZWFtQmFzZVVSTCwgbW9vbmJlYW1Qcml2YXRlS2V5XSA9IGF3YWl0IHN1cGVyLnJldHJpZXZlU2VydmljZUNyZWRlbnRpYWxzKENvbnN0YW50cy5BV1NQYWlyQ29uc3RhbnRzLk1PT05CRUFNX0lOVEVSTkFMX1NFQ1JFVF9OQU1FKTtcblxuICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHdlIG9idGFpbmVkIGFueSBpbnZhbGlkIHNlY3JldCB2YWx1ZXMgZnJvbSB0aGUgY2FsbCBhYm92ZVxuICAgICAgICAgICAgaWYgKG1vb25iZWFtQmFzZVVSTCA9PT0gbnVsbCB8fCBtb29uYmVhbUJhc2VVUkwubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgbW9vbmJlYW1Qcml2YXRlS2V5ID09PSBudWxsIHx8IG1vb25iZWFtUHJpdmF0ZUtleS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBcIkludmFsaWQgU2VjcmV0cyBvYnRhaW5lZCBmb3IgTW9vbmJlYW0gQVBJIGNhbGwhXCI7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBjcmVhdGVCdWxrTm90aWZpY2F0aW9uIE11dGF0aW9uXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogYnVpbGQgdGhlIE1vb25iZWFtIEFwcFN5bmMgQVBJIEdyYXBoUUwgcXVlcnksIGFuZCBwZXJmb3JtIGEgUE9TVCB0byBpdCxcbiAgICAgICAgICAgICAqIHdpdGggdGhlIGFwcHJvcHJpYXRlIGluZm9ybWF0aW9uLlxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIHdlIGltcGx5IHRoYXQgaWYgdGhlIEFQSSBkb2VzIG5vdCByZXNwb25kIGluIDE1IHNlY29uZHMsIHRoZW4gd2UgYXV0b21hdGljYWxseSBjYXRjaCB0aGF0LCBhbmQgcmV0dXJuIGFuXG4gICAgICAgICAgICAgKiBlcnJvciBmb3IgYSBiZXR0ZXIgY3VzdG9tZXIgZXhwZXJpZW5jZS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgcmV0dXJuIGF4aW9zLnBvc3QoYCR7bW9vbmJlYW1CYXNlVVJMfWAsIHtcbiAgICAgICAgICAgICAgICBxdWVyeTogY3JlYXRlQnVsa05vdGlmaWNhdGlvbixcbiAgICAgICAgICAgICAgICB2YXJpYWJsZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlQnVsa05vdGlmaWNhdGlvbklucHV0OiBjcmVhdGVCdWxrTm90aWZpY2F0aW9uSW5wdXRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAgICAgXCJ4LWFwaS1rZXlcIjogbW9vbmJlYW1Qcml2YXRlS2V5XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiAxNTAwMCwgLy8gaW4gbWlsbGlzZWNvbmRzIGhlcmVcbiAgICAgICAgICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlOiAnTW9vbmJlYW0gQVBJIHRpbWVkIG91dCBhZnRlciAxNTAwMG1zISdcbiAgICAgICAgICAgIH0pLnRoZW4oY3JlYXRlQnVsa05vdGlmaWNhdGlvblJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlbmRwb2ludEluZm99IHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoY3JlYXRlQnVsa05vdGlmaWNhdGlvblJlc3BvbnNlLmRhdGEpfWApO1xuXG4gICAgICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIGRhdGEgYmxvY2sgZnJvbSB0aGUgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICBjb25zdCByZXNwb25zZURhdGEgPSAoY3JlYXRlQnVsa05vdGlmaWNhdGlvblJlc3BvbnNlICYmIGNyZWF0ZUJ1bGtOb3RpZmljYXRpb25SZXNwb25zZS5kYXRhKSA/IGNyZWF0ZUJ1bGtOb3RpZmljYXRpb25SZXNwb25zZS5kYXRhLmRhdGEgOiBudWxsO1xuXG4gICAgICAgICAgICAgICAgLy8gY2hlY2sgaWYgdGhlcmUgYXJlIGFueSBlcnJvcnMgaW4gdGhlIHJldHVybmVkIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlRGF0YSAmJiByZXNwb25zZURhdGEuY3JlYXRlQnVsa05vdGlmaWNhdGlvbi5lcnJvck1lc3NhZ2UgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuZWQgdGhlIHN1Y2Nlc3NmdWxseSBjcmVhdGVkIGJ1bGsgbm90aWZpY2F0aW9uXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiByZXNwb25zZURhdGEuY3JlYXRlQnVsa05vdGlmaWNhdGlvbi5kYXRhIGFzIE5vdGlmaWNhdGlvbltdXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2VEYXRhID9cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgdHlwZSwgZnJvbSB0aGUgb3JpZ2luYWwgQXBwU3luYyBjYWxsXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiByZXNwb25zZURhdGEuY3JlYXRlQnVsa05vdGlmaWNhdGlvbi5lcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiByZXNwb25zZURhdGEuY3JlYXRlQnVsa05vdGlmaWNhdGlvbi5lcnJvclR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gOlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBlcnJvciByZXNwb25zZSBpbmRpY2F0aW5nIGFuIGludmFsaWQgc3RydWN0dXJlIHJldHVybmVkXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgSW52YWxpZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UhYCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvci5yZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYW5kIHRoZSBzZXJ2ZXIgcmVzcG9uZGVkIHdpdGggYSBzdGF0dXMgY29kZVxuICAgICAgICAgICAgICAgICAgICAgKiB0aGF0IGZhbGxzIG91dCBvZiB0aGUgcmFuZ2Ugb2YgMnh4LlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vbiAyeHh4IHJlc3BvbnNlIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBNb29uYmVhbSBBUEksIHdpdGggc3RhdHVzICR7ZXJyb3IucmVzcG9uc2Uuc3RhdHVzfSwgYW5kIHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZXJyb3IucmVzcG9uc2UuZGF0YSl9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBhbnkgb3RoZXIgc3BlY2lmaWMgZXJyb3JzIHRvIGJlIGZpbHRlcmVkIGJlbG93XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVycm9yLnJlcXVlc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGJ1dCBubyByZXNwb25zZSB3YXMgcmVjZWl2ZWRcbiAgICAgICAgICAgICAgICAgICAgICogYGVycm9yLnJlcXVlc3RgIGlzIGFuIGluc3RhbmNlIG9mIFhNTEh0dHBSZXF1ZXN0IGluIHRoZSBicm93c2VyIGFuZCBhbiBpbnN0YW5jZSBvZlxuICAgICAgICAgICAgICAgICAgICAgKiAgaHR0cC5DbGllbnRSZXF1ZXN0IGluIG5vZGUuanMuXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm8gcmVzcG9uc2UgcmVjZWl2ZWQgd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgZm9yIHJlcXVlc3QgJHtlcnJvci5yZXF1ZXN0fWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNvbWV0aGluZyBoYXBwZW5lZCBpbiBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IHRoYXQgdHJpZ2dlcmVkIGFuIEVycm9yXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgZm9yIHRoZSAke2VuZHBvaW50SW5mb30gTW9vbmJlYW0gQVBJLCAkeyhlcnJvciAmJiBlcnJvci5tZXNzYWdlKSAmJiBlcnJvci5tZXNzYWdlfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGNyZWF0aW5nIGEgYnVsayBub3RpZmljYXRpb24sIHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJ9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHVzZWQgdG8gY3JlYXRlIGEgbm90aWZpY2F0aW9uLlxuICAgICAqXG4gICAgICogQHBhcmFtIGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0IHRoZSBub3RpZmljYXRpb24gZGV0YWlscyB0byBiZSBwYXNzZWQgaW4sIGluIG9yZGVyIHRvIGNyZWF0ZSBhIG5ld1xuICAgICAqIG5vdGlmaWNhdGlvblxuICAgICAqXG4gICAgICogQHJldHVybnMgYSB7QGxpbmsgQ3JlYXRlTm90aWZpY2F0aW9uUmVzcG9uc2V9IHJlcHJlc2VudGluZyB0aGUgbmV3bHkgY3JlYXRlZCBub3RpZmljYXRpb24gZGF0YVxuICAgICAqL1xuICAgIGFzeW5jIGNyZWF0ZU5vdGlmaWNhdGlvbihjcmVhdGVOb3RpZmljYXRpb25JbnB1dDogQ3JlYXRlTm90aWZpY2F0aW9uSW5wdXQpOiBQcm9taXNlPENyZWF0ZU5vdGlmaWNhdGlvblJlc3BvbnNlPiB7XG4gICAgICAgIC8vIGVhc2lseSBpZGVudGlmaWFibGUgQVBJIGVuZHBvaW50IGluZm9ybWF0aW9uXG4gICAgICAgIGNvbnN0IGVuZHBvaW50SW5mbyA9ICdjcmVhdGVOb3RpZmljYXRpb24gTXV0YXRpb24gTW9vbmJlYW0gR3JhcGhRTCBBUEknO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgQVBJIEtleSBhbmQgQmFzZSBVUkwsIG5lZWRlZCBpbiBvcmRlciB0byBtYWtlIGEgbm90aWZpY2F0aW9uIGNyZWF0aW9uIGNhbGwgdGhyb3VnaCB0aGUgY2xpZW50XG4gICAgICAgICAgICBjb25zdCBbbW9vbmJlYW1CYXNlVVJMLCBtb29uYmVhbVByaXZhdGVLZXldID0gYXdhaXQgc3VwZXIucmV0cmlldmVTZXJ2aWNlQ3JlZGVudGlhbHMoQ29uc3RhbnRzLkFXU1BhaXJDb25zdGFudHMuTU9PTkJFQU1fSU5URVJOQUxfU0VDUkVUX05BTUUpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgd2Ugb2J0YWluZWQgYW55IGludmFsaWQgc2VjcmV0IHZhbHVlcyBmcm9tIHRoZSBjYWxsIGFib3ZlXG4gICAgICAgICAgICBpZiAobW9vbmJlYW1CYXNlVVJMID09PSBudWxsIHx8IG1vb25iZWFtQmFzZVVSTC5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBtb29uYmVhbVByaXZhdGVLZXkgPT09IG51bGwgfHwgbW9vbmJlYW1Qcml2YXRlS2V5Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IFwiSW52YWxpZCBTZWNyZXRzIG9idGFpbmVkIGZvciBNb29uYmVhbSBBUEkgY2FsbCFcIjtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIGNyZWF0ZU5vdGlmaWNhdGlvbiBNdXRhdGlvblxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIGJ1aWxkIHRoZSBNb29uYmVhbSBBcHBTeW5jIEFQSSBHcmFwaFFMIHF1ZXJ5LCBhbmQgcGVyZm9ybSBhIFBPU1QgdG8gaXQsXG4gICAgICAgICAgICAgKiB3aXRoIHRoZSBhcHByb3ByaWF0ZSBpbmZvcm1hdGlvbi5cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiB3ZSBpbXBseSB0aGF0IGlmIHRoZSBBUEkgZG9lcyBub3QgcmVzcG9uZCBpbiAxNSBzZWNvbmRzLCB0aGVuIHdlIGF1dG9tYXRpY2FsbHkgY2F0Y2ggdGhhdCwgYW5kIHJldHVybiBhblxuICAgICAgICAgICAgICogZXJyb3IgZm9yIGEgYmV0dGVyIGN1c3RvbWVyIGV4cGVyaWVuY2UuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHJldHVybiBheGlvcy5wb3N0KGAke21vb25iZWFtQmFzZVVSTH1gLCB7XG4gICAgICAgICAgICAgICAgcXVlcnk6IGNyZWF0ZU5vdGlmaWNhdGlvbixcbiAgICAgICAgICAgICAgICB2YXJpYWJsZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlTm90aWZpY2F0aW9uSW5wdXQ6IGNyZWF0ZU5vdGlmaWNhdGlvbklucHV0XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgICAgIFwieC1hcGkta2V5XCI6IG1vb25iZWFtUHJpdmF0ZUtleVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGltZW91dDogMTUwMDAsIC8vIGluIG1pbGxpc2Vjb25kcyBoZXJlXG4gICAgICAgICAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZTogJ01vb25iZWFtIEFQSSB0aW1lZCBvdXQgYWZ0ZXIgMTUwMDBtcyEnXG4gICAgICAgICAgICB9KS50aGVuKGNyZWF0ZU5vdGlmaWNhdGlvblJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlbmRwb2ludEluZm99IHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoY3JlYXRlTm90aWZpY2F0aW9uUmVzcG9uc2UuZGF0YSl9YCk7XG5cbiAgICAgICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgZGF0YSBibG9jayBmcm9tIHRoZSByZXNwb25zZVxuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlRGF0YSA9IChjcmVhdGVOb3RpZmljYXRpb25SZXNwb25zZSAmJiBjcmVhdGVOb3RpZmljYXRpb25SZXNwb25zZS5kYXRhKSA/IGNyZWF0ZU5vdGlmaWNhdGlvblJlc3BvbnNlLmRhdGEuZGF0YSA6IG51bGw7XG5cbiAgICAgICAgICAgICAgICAvLyBjaGVjayBpZiB0aGVyZSBhcmUgYW55IGVycm9ycyBpbiB0aGUgcmV0dXJuZWQgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2VEYXRhICYmIHJlc3BvbnNlRGF0YS5jcmVhdGVOb3RpZmljYXRpb24uZXJyb3JNZXNzYWdlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHJldHVybmVkIHRoZSBzdWNjZXNzZnVsbHkgY3JlYXRlZCBub3RpZmljYXRpb25cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiByZXNwb25zZURhdGEuY3JlYXRlTm90aWZpY2F0aW9uLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogcmVzcG9uc2VEYXRhLmNyZWF0ZU5vdGlmaWNhdGlvbi5kYXRhIGFzIE5vdGlmaWNhdGlvblxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlRGF0YSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIGVycm9yIG1lc3NhZ2UgYW5kIHR5cGUsIGZyb20gdGhlIG9yaWdpbmFsIEFwcFN5bmMgY2FsbFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogcmVzcG9uc2VEYXRhLmNyZWF0ZU5vdGlmaWNhdGlvbi5lcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiByZXNwb25zZURhdGEuY3JlYXRlTm90aWZpY2F0aW9uLmVycm9yVHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIGVycm9yIHJlc3BvbnNlIGluZGljYXRpbmcgYW4gaW52YWxpZCBzdHJ1Y3R1cmUgcmV0dXJuZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBJbnZhbGlkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tICR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSFgLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yLnJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBhbmQgdGhlIHNlcnZlciByZXNwb25kZWQgd2l0aCBhIHN0YXR1cyBjb2RlXG4gICAgICAgICAgICAgICAgICAgICAqIHRoYXQgZmFsbHMgb3V0IG9mIHRoZSByYW5nZSBvZiAyeHguXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm9uIDJ4eHggcmVzcG9uc2Ugd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgd2l0aCBzdGF0dXMgJHtlcnJvci5yZXNwb25zZS5zdGF0dXN9LCBhbmQgcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShlcnJvci5yZXNwb25zZS5kYXRhKX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGFueSBvdGhlciBzcGVjaWZpYyBlcnJvcnMgdG8gYmUgZmlsdGVyZWQgYmVsb3dcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3IucmVxdWVzdCkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYnV0IG5vIHJlc3BvbnNlIHdhcyByZWNlaXZlZFxuICAgICAgICAgICAgICAgICAgICAgKiBgZXJyb3IucmVxdWVzdGAgaXMgYW4gaW5zdGFuY2Ugb2YgWE1MSHR0cFJlcXVlc3QgaW4gdGhlIGJyb3dzZXIgYW5kIGFuIGluc3RhbmNlIG9mXG4gICAgICAgICAgICAgICAgICAgICAqICBodHRwLkNsaWVudFJlcXVlc3QgaW4gbm9kZS5qcy5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBObyByZXNwb25zZSByZWNlaXZlZCB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gTW9vbmJlYW0gQVBJLCBmb3IgcmVxdWVzdCAke2Vycm9yLnJlcXVlc3R9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU29tZXRoaW5nIGhhcHBlbmVkIGluIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgdGhhdCB0cmlnZ2VyZWQgYW4gRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgc2V0dGluZyB1cCB0aGUgcmVxdWVzdCBmb3IgdGhlICR7ZW5kcG9pbnRJbmZvfSBNb29uYmVhbSBBUEksICR7KGVycm9yICYmIGVycm9yLm1lc3NhZ2UpICYmIGVycm9yLm1lc3NhZ2V9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgY3JlYXRpbmcgYSBub3RpZmljYXRpb24sIHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJ9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHVzZWQgdG8gY3JlYXRlIGRhaWx5IGVhcm5pbmcgc3VtbWFyaWVzIGZvciBhbGwgYXBwbGljYWJsZSB1c2Vycywgd2hvIHNwZW50XG4gICAgICogaW4gYSBwYXJ0aWN1bGFyIGRheS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBjcmVhdGVEYWlseUVhcm5pbmdzU3VtbWFyeUlucHV0IHRoZSBkYWlseSBlYXJuaW5ncyBzdW1tYXJ5IGlucHV0IHRvIGJlIHBhc3NlZCBpbiwgaW4gb3JkZXIgdG9cbiAgICAgKiBjcmVhdGUgYWxsIGFwcGxpY2FibGUgZGFpbHkgZWFybmluZyBzdW1tYXJpZXMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBhIHtAbGluayBEYWlseUVhcm5pbmdzU3VtbWFyeVJlc3BvbnNlfSB7QGxpbmsgUHJvbWlzZX0sIHJlcHJlc2VudGluZyB0aGUgbmV3bHkgY3JlYXRlZCBkYWlseSBzdW1tYXJpZXMsXG4gICAgICogZm9yIGFsbCBhcHBsaWNhYmxlIHVzZXJzLlxuICAgICAqL1xuICAgIGFzeW5jIGNyZWF0ZURhaWx5RWFybmluZ3NTdW1tYXJ5KGNyZWF0ZURhaWx5RWFybmluZ3NTdW1tYXJ5SW5wdXQ6IENyZWF0ZURhaWx5RWFybmluZ3NTdW1tYXJ5SW5wdXQpOiBQcm9taXNlPERhaWx5RWFybmluZ3NTdW1tYXJ5UmVzcG9uc2U+IHtcbiAgICAgICAgLy8gZWFzaWx5IGlkZW50aWZpYWJsZSBBUEkgZW5kcG9pbnQgaW5mb3JtYXRpb25cbiAgICAgICAgY29uc3QgZW5kcG9pbnRJbmZvID0gJ2NyZWF0ZURhaWx5RWFybmluZ3NTdW1tYXJ5IE11dGF0aW9uIE1vb25iZWFtIEdyYXBoUUwgQVBJJztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIEFQSSBLZXkgYW5kIEJhc2UgVVJMLCBuZWVkZWQgaW4gb3JkZXIgdG8gbWFrZSB0aGUgZGV2aWNlcyBmb3IgdXNlciByZXRyaWV2YWwgY2FsbCB0aHJvdWdoIHRoZSBjbGllbnRcbiAgICAgICAgICAgIGNvbnN0IFttb29uYmVhbUJhc2VVUkwsIG1vb25iZWFtUHJpdmF0ZUtleV0gPSBhd2FpdCBzdXBlci5yZXRyaWV2ZVNlcnZpY2VDcmVkZW50aWFscyhDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5NT09OQkVBTV9JTlRFUk5BTF9TRUNSRVRfTkFNRSk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB3ZSBvYnRhaW5lZCBhbnkgaW52YWxpZCBzZWNyZXQgdmFsdWVzIGZyb20gdGhlIGNhbGwgYWJvdmVcbiAgICAgICAgICAgIGlmIChtb29uYmVhbUJhc2VVUkwgPT09IG51bGwgfHwgbW9vbmJlYW1CYXNlVVJMLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG1vb25iZWFtUHJpdmF0ZUtleSA9PT0gbnVsbCB8fCBtb29uYmVhbVByaXZhdGVLZXkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gXCJJbnZhbGlkIFNlY3JldHMgb2J0YWluZWQgZm9yIE1vb25iZWFtIEFQSSBjYWxsIVwiO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBEYWlseVN1bW1hcnlFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBjcmVhdGVEYWlseUVhcm5pbmdzU3VtbWFyeSBNdXRhdGlvblxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIGJ1aWxkIHRoZSBNb29uYmVhbSBBcHBTeW5jIEFQSSBHcmFwaFFMIHF1ZXJ5LCBhbmQgcGVyZm9ybSBhIFBPU1QgdG8gaXQsXG4gICAgICAgICAgICAgKiB3aXRoIHRoZSBhcHByb3ByaWF0ZSBpbmZvcm1hdGlvbi5cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiB3ZSBpbXBseSB0aGF0IGlmIHRoZSBBUEkgZG9lcyBub3QgcmVzcG9uZCBpbiAxNSBzZWNvbmRzLCB0aGVuIHdlIGF1dG9tYXRpY2FsbHkgY2F0Y2ggdGhhdCwgYW5kIHJldHVybiBhblxuICAgICAgICAgICAgICogZXJyb3IgZm9yIGEgYmV0dGVyIGN1c3RvbWVyIGV4cGVyaWVuY2UuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHJldHVybiBheGlvcy5wb3N0KGAke21vb25iZWFtQmFzZVVSTH1gLCB7XG4gICAgICAgICAgICAgICAgcXVlcnk6IGNyZWF0ZURhaWx5RWFybmluZ3NTdW1tYXJ5LFxuICAgICAgICAgICAgICAgIHZhcmlhYmxlczoge1xuICAgICAgICAgICAgICAgICAgICBjcmVhdGVEYWlseUVhcm5pbmdzU3VtbWFyeUlucHV0OiBjcmVhdGVEYWlseUVhcm5pbmdzU3VtbWFyeUlucHV0XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgICAgIFwieC1hcGkta2V5XCI6IG1vb25iZWFtUHJpdmF0ZUtleVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGltZW91dDogMTUwMDAsIC8vIGluIG1pbGxpc2Vjb25kcyBoZXJlXG4gICAgICAgICAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZTogJ01vb25iZWFtIEFQSSB0aW1lZCBvdXQgYWZ0ZXIgMTUwMDBtcyEnXG4gICAgICAgICAgICB9KS50aGVuKGNyZWF0ZURhaWx5RWFybmluZ3NTdW1tYXJ5UmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBkYXRhIGJsb2NrIGZyb20gdGhlIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2VEYXRhID0gKGNyZWF0ZURhaWx5RWFybmluZ3NTdW1tYXJ5UmVzcG9uc2UgJiYgY3JlYXRlRGFpbHlFYXJuaW5nc1N1bW1hcnlSZXNwb25zZS5kYXRhKSA/IGNyZWF0ZURhaWx5RWFybmluZ3NTdW1tYXJ5UmVzcG9uc2UuZGF0YS5kYXRhIDogbnVsbDtcblxuICAgICAgICAgICAgICAgIC8vIGNoZWNrIGlmIHRoZXJlIGFyZSBhbnkgZXJyb3JzIGluIHRoZSByZXR1cm5lZCByZXNwb25zZVxuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZURhdGEgJiYgcmVzcG9uc2VEYXRhLmNyZWF0ZURhaWx5RWFybmluZ3NTdW1tYXJ5LmVycm9yTWVzc2FnZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm5lZCB0aGUgc3VjY2Vzc2Z1bGx5IHJldHJpZXZlZCBwaHlzaWNhbCBkZXZpY2VzIGZvciBhIGdpdmVuIHVzZXJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHJlc3BvbnNlRGF0YS5jcmVhdGVEYWlseUVhcm5pbmdzU3VtbWFyeS5kYXRhIGFzIERhaWx5RWFybmluZ3NTdW1tYXJ5W11cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZURhdGEgP1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBlcnJvciBtZXNzYWdlIGFuZCB0eXBlLCBmcm9tIHRoZSBvcmlnaW5hbCBBcHBTeW5jIGNhbGxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IHJlc3BvbnNlRGF0YS5jcmVhdGVEYWlseUVhcm5pbmdzU3VtbWFyeS5lcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiByZXNwb25zZURhdGEuY3JlYXRlRGFpbHlFYXJuaW5nc1N1bW1hcnkuZXJyb3JUeXBlXG4gICAgICAgICAgICAgICAgICAgICAgICB9IDpcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgZXJyb3IgcmVzcG9uc2UgaW5kaWNhdGluZyBhbiBpbnZhbGlkIHN0cnVjdHVyZSByZXR1cm5lZFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogYEludmFsaWQgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gJHtlbmRwb2ludEluZm99IHJlc3BvbnNlIWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBEYWlseVN1bW1hcnlFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvci5yZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYW5kIHRoZSBzZXJ2ZXIgcmVzcG9uZGVkIHdpdGggYSBzdGF0dXMgY29kZVxuICAgICAgICAgICAgICAgICAgICAgKiB0aGF0IGZhbGxzIG91dCBvZiB0aGUgcmFuZ2Ugb2YgMnh4LlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vbiAyeHh4IHJlc3BvbnNlIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBNb29uYmVhbSBBUEksIHdpdGggc3RhdHVzICR7ZXJyb3IucmVzcG9uc2Uuc3RhdHVzfSwgYW5kIHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZXJyb3IucmVzcG9uc2UuZGF0YSl9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBhbnkgb3RoZXIgc3BlY2lmaWMgZXJyb3JzIHRvIGJlIGZpbHRlcmVkIGJlbG93XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogRGFpbHlTdW1tYXJ5RXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3IucmVxdWVzdCkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYnV0IG5vIHJlc3BvbnNlIHdhcyByZWNlaXZlZFxuICAgICAgICAgICAgICAgICAgICAgKiBgZXJyb3IucmVxdWVzdGAgaXMgYW4gaW5zdGFuY2Ugb2YgWE1MSHR0cFJlcXVlc3QgaW4gdGhlIGJyb3dzZXIgYW5kIGFuIGluc3RhbmNlIG9mXG4gICAgICAgICAgICAgICAgICAgICAqICBodHRwLkNsaWVudFJlcXVlc3QgaW4gbm9kZS5qcy5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBObyByZXNwb25zZSByZWNlaXZlZCB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gTW9vbmJlYW0gQVBJLCBmb3IgcmVxdWVzdCAke2Vycm9yLnJlcXVlc3R9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IERhaWx5U3VtbWFyeUVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBTb21ldGhpbmcgaGFwcGVuZWQgaW4gc2V0dGluZyB1cCB0aGUgcmVxdWVzdCB0aGF0IHRyaWdnZXJlZCBhbiBFcnJvclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IGZvciB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgJHsoZXJyb3IgJiYgZXJyb3IubWVzc2FnZSkgJiYgZXJyb3IubWVzc2FnZX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogRGFpbHlTdW1tYXJ5RXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGNyZWF0aW5nIGRhaWx5IGVhcm5pbmcgc3VtbWFyaWVzLCB0aHJvdWdoICR7ZW5kcG9pbnRJbmZvfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9ICR7ZXJyfWApO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogRGFpbHlTdW1tYXJ5RXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHVzZWQgdG8gZ2V0IGFsbCBkZXZpY2VzIHdoaWNoIGhhdmUgYSBsaW5rZWQgcHVzaCB0b2tlbi5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIGEge0BsaW5rIFVzZXJEZXZpY2VzUmVzcG9uc2V9IHJlcHJlc2VudGluZyB0aGUgbWF0Y2hlZCBwaHlzaWNhbCBkZXZpY2VzJyBpbmZvcm1hdGlvbi5cbiAgICAgKi9cbiAgICBhc3luYyBnZXRBbGxEZXZpY2VzKCk6IFByb21pc2U8VXNlckRldmljZXNSZXNwb25zZT4ge1xuICAgICAgICAvLyBlYXNpbHkgaWRlbnRpZmlhYmxlIEFQSSBlbmRwb2ludCBpbmZvcm1hdGlvblxuICAgICAgICBjb25zdCBlbmRwb2ludEluZm8gPSAnZ2V0QWxsRGV2aWNlcyBRdWVyeSBNb29uYmVhbSBHcmFwaFFMIEFQSSc7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBBUEkgS2V5IGFuZCBCYXNlIFVSTCwgbmVlZGVkIGluIG9yZGVyIHRvIG1ha2UgdGhlIGRldmljZXMgZm9yIHVzZXIgcmV0cmlldmFsIGNhbGwgdGhyb3VnaCB0aGUgY2xpZW50XG4gICAgICAgICAgICBjb25zdCBbbW9vbmJlYW1CYXNlVVJMLCBtb29uYmVhbVByaXZhdGVLZXldID0gYXdhaXQgc3VwZXIucmV0cmlldmVTZXJ2aWNlQ3JlZGVudGlhbHMoQ29uc3RhbnRzLkFXU1BhaXJDb25zdGFudHMuTU9PTkJFQU1fSU5URVJOQUxfU0VDUkVUX05BTUUpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgd2Ugb2J0YWluZWQgYW55IGludmFsaWQgc2VjcmV0IHZhbHVlcyBmcm9tIHRoZSBjYWxsIGFib3ZlXG4gICAgICAgICAgICBpZiAobW9vbmJlYW1CYXNlVVJMID09PSBudWxsIHx8IG1vb25iZWFtQmFzZVVSTC5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBtb29uYmVhbVByaXZhdGVLZXkgPT09IG51bGwgfHwgbW9vbmJlYW1Qcml2YXRlS2V5Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IFwiSW52YWxpZCBTZWNyZXRzIG9idGFpbmVkIGZvciBNb29uYmVhbSBBUEkgY2FsbCFcIjtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVXNlckRldmljZUVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIGdldEFsbERldmljZXMgUXVlcnlcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBidWlsZCB0aGUgTW9vbmJlYW0gQXBwU3luYyBBUEkgR3JhcGhRTCBxdWVyeSwgYW5kIHBlcmZvcm0gYSBQT1NUIHRvIGl0LFxuICAgICAgICAgICAgICogd2l0aCB0aGUgYXBwcm9wcmlhdGUgaW5mb3JtYXRpb24uXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogd2UgaW1wbHkgdGhhdCBpZiB0aGUgQVBJIGRvZXMgbm90IHJlc3BvbmQgaW4gMTUgc2Vjb25kcywgdGhlbiB3ZSBhdXRvbWF0aWNhbGx5IGNhdGNoIHRoYXQsIGFuZCByZXR1cm4gYW5cbiAgICAgICAgICAgICAqIGVycm9yIGZvciBhIGJldHRlciBjdXN0b21lciBleHBlcmllbmNlLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICByZXR1cm4gYXhpb3MucG9zdChgJHttb29uYmVhbUJhc2VVUkx9YCwge1xuICAgICAgICAgICAgICAgIHF1ZXJ5OiBnZXRBbGxEZXZpY2VzXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAgICAgXCJ4LWFwaS1rZXlcIjogbW9vbmJlYW1Qcml2YXRlS2V5XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiAxNTAwMCwgLy8gaW4gbWlsbGlzZWNvbmRzIGhlcmVcbiAgICAgICAgICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlOiAnTW9vbmJlYW0gQVBJIHRpbWVkIG91dCBhZnRlciAxNTAwMG1zISdcbiAgICAgICAgICAgIH0pLnRoZW4oZ2V0QWxsRGV2aWNlc1Jlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlbmRwb2ludEluZm99IHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZ2V0QWxsRGV2aWNlc1Jlc3BvbnNlLmRhdGEpfWApO1xuXG4gICAgICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIGRhdGEgYmxvY2sgZnJvbSB0aGUgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICBjb25zdCByZXNwb25zZURhdGEgPSAoZ2V0QWxsRGV2aWNlc1Jlc3BvbnNlICYmIGdldEFsbERldmljZXNSZXNwb25zZS5kYXRhKSA/IGdldEFsbERldmljZXNSZXNwb25zZS5kYXRhLmRhdGEgOiBudWxsO1xuXG4gICAgICAgICAgICAgICAgLy8gY2hlY2sgaWYgdGhlcmUgYXJlIGFueSBlcnJvcnMgaW4gdGhlIHJldHVybmVkIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlRGF0YSAmJiByZXNwb25zZURhdGEuZ2V0QWxsRGV2aWNlcy5lcnJvck1lc3NhZ2UgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuZWQgdGhlIHN1Y2Nlc3NmdWxseSByZXRyaWV2ZWQgcGh5c2ljYWwgZGV2aWNlcyBmb3IgYWxsIHVzZXJzXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiByZXNwb25zZURhdGEuZ2V0QWxsRGV2aWNlcy5kYXRhIGFzIFB1c2hEZXZpY2VbXVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlRGF0YSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIGVycm9yIG1lc3NhZ2UgYW5kIHR5cGUsIGZyb20gdGhlIG9yaWdpbmFsIEFwcFN5bmMgY2FsbFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogcmVzcG9uc2VEYXRhLmdldEFsbERldmljZXMuZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogcmVzcG9uc2VEYXRhLmdldEFsbERldmljZXMuZXJyb3JUeXBlXG4gICAgICAgICAgICAgICAgICAgICAgICB9IDpcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgZXJyb3IgcmVzcG9uc2UgaW5kaWNhdGluZyBhbiBpbnZhbGlkIHN0cnVjdHVyZSByZXR1cm5lZFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogYEludmFsaWQgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gJHtlbmRwb2ludEluZm99IHJlc3BvbnNlIWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBVc2VyRGV2aWNlRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IucmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGFuZCB0aGUgc2VydmVyIHJlc3BvbmRlZCB3aXRoIGEgc3RhdHVzIGNvZGVcbiAgICAgICAgICAgICAgICAgICAgICogdGhhdCBmYWxscyBvdXQgb2YgdGhlIHJhbmdlIG9mIDJ4eC5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBOb24gMnh4eCByZXNwb25zZSB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gTW9vbmJlYW0gQVBJLCB3aXRoIHN0YXR1cyAke2Vycm9yLnJlc3BvbnNlLnN0YXR1c30sIGFuZCByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGVycm9yLnJlc3BvbnNlLmRhdGEpfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gYW55IG90aGVyIHNwZWNpZmljIGVycm9ycyB0byBiZSBmaWx0ZXJlZCBiZWxvd1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFVzZXJEZXZpY2VFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5yZXF1ZXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBidXQgbm8gcmVzcG9uc2Ugd2FzIHJlY2VpdmVkXG4gICAgICAgICAgICAgICAgICAgICAqIGBlcnJvci5yZXF1ZXN0YCBpcyBhbiBpbnN0YW5jZSBvZiBYTUxIdHRwUmVxdWVzdCBpbiB0aGUgYnJvd3NlciBhbmQgYW4gaW5zdGFuY2Ugb2ZcbiAgICAgICAgICAgICAgICAgICAgICogIGh0dHAuQ2xpZW50UmVxdWVzdCBpbiBub2RlLmpzLlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vIHJlc3BvbnNlIHJlY2VpdmVkIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBNb29uYmVhbSBBUEksIGZvciByZXF1ZXN0ICR7ZXJyb3IucmVxdWVzdH1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVXNlckRldmljZUVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBTb21ldGhpbmcgaGFwcGVuZWQgaW4gc2V0dGluZyB1cCB0aGUgcmVxdWVzdCB0aGF0IHRyaWdnZXJlZCBhbiBFcnJvclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IGZvciB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgJHsoZXJyb3IgJiYgZXJyb3IubWVzc2FnZSkgJiYgZXJyb3IubWVzc2FnZX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVXNlckRldmljZUVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSByZXRyaWV2aW5nIGFsbCBwaHlzaWNhbCBkZXZpY2VzLCB0aHJvdWdoICR7ZW5kcG9pbnRJbmZvfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9ICR7ZXJyfWApO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVXNlckRldmljZUVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB1c2VkIHRvIGdldCBhbGwgdGhlIHBoeXNpY2FsIGRldmljZXMgYXNzb2NpYXRlZCB3aXRoIGEgcGFydGljdWxhciB1c2VyLlxuICAgICAqXG4gICAgICogQHBhcmFtIGdldERldmljZXNGb3JVc2VySW5wdXQgdGhlIGRldmljZXMgZm9yIHVzZXIgaW5wdXQsIGNvbnRhaW5pbmcgdGhlIGZpbHRlcmluZyBpbmZvcm1hdGlvblxuICAgICAqIHVzZWQgdG8gcmV0cmlldmUgYWxsIHRoZSBwaHlzaWNhbCBkZXZpY2VzIGZvciBhIHBhcnRpY3VsYXIgdXNlci5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIGEge0BsaW5rIFVzZXJEZXZpY2VzUmVzcG9uc2V9IHJlcHJlc2VudGluZyB0aGUgbWF0Y2hlZCBwaHlzaWNhbCBkZXZpY2VzJyBpbmZvcm1hdGlvbi5cbiAgICAgKi9cbiAgICBhc3luYyBnZXREZXZpY2VzRm9yVXNlcihnZXREZXZpY2VzRm9yVXNlcklucHV0OiBHZXREZXZpY2VzRm9yVXNlcklucHV0KTogUHJvbWlzZTxVc2VyRGV2aWNlc1Jlc3BvbnNlPiB7XG4gICAgICAgIC8vIGVhc2lseSBpZGVudGlmaWFibGUgQVBJIGVuZHBvaW50IGluZm9ybWF0aW9uXG4gICAgICAgIGNvbnN0IGVuZHBvaW50SW5mbyA9ICdnZXREZXZpY2VzRm9yVXNlciBRdWVyeSBNb29uYmVhbSBHcmFwaFFMIEFQSSc7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBBUEkgS2V5IGFuZCBCYXNlIFVSTCwgbmVlZGVkIGluIG9yZGVyIHRvIG1ha2UgdGhlIGRldmljZXMgZm9yIHVzZXIgcmV0cmlldmFsIGNhbGwgdGhyb3VnaCB0aGUgY2xpZW50XG4gICAgICAgICAgICBjb25zdCBbbW9vbmJlYW1CYXNlVVJMLCBtb29uYmVhbVByaXZhdGVLZXldID0gYXdhaXQgc3VwZXIucmV0cmlldmVTZXJ2aWNlQ3JlZGVudGlhbHMoQ29uc3RhbnRzLkFXU1BhaXJDb25zdGFudHMuTU9PTkJFQU1fSU5URVJOQUxfU0VDUkVUX05BTUUpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgd2Ugb2J0YWluZWQgYW55IGludmFsaWQgc2VjcmV0IHZhbHVlcyBmcm9tIHRoZSBjYWxsIGFib3ZlXG4gICAgICAgICAgICBpZiAobW9vbmJlYW1CYXNlVVJMID09PSBudWxsIHx8IG1vb25iZWFtQmFzZVVSTC5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBtb29uYmVhbVByaXZhdGVLZXkgPT09IG51bGwgfHwgbW9vbmJlYW1Qcml2YXRlS2V5Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IFwiSW52YWxpZCBTZWNyZXRzIG9idGFpbmVkIGZvciBNb29uYmVhbSBBUEkgY2FsbCFcIjtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVXNlckRldmljZUVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIGdldERldmljZXNGb3JVc2VyIFF1ZXJ5XG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogYnVpbGQgdGhlIE1vb25iZWFtIEFwcFN5bmMgQVBJIEdyYXBoUUwgcXVlcnksIGFuZCBwZXJmb3JtIGEgUE9TVCB0byBpdCxcbiAgICAgICAgICAgICAqIHdpdGggdGhlIGFwcHJvcHJpYXRlIGluZm9ybWF0aW9uLlxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIHdlIGltcGx5IHRoYXQgaWYgdGhlIEFQSSBkb2VzIG5vdCByZXNwb25kIGluIDE1IHNlY29uZHMsIHRoZW4gd2UgYXV0b21hdGljYWxseSBjYXRjaCB0aGF0LCBhbmQgcmV0dXJuIGFuXG4gICAgICAgICAgICAgKiBlcnJvciBmb3IgYSBiZXR0ZXIgY3VzdG9tZXIgZXhwZXJpZW5jZS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgcmV0dXJuIGF4aW9zLnBvc3QoYCR7bW9vbmJlYW1CYXNlVVJMfWAsIHtcbiAgICAgICAgICAgICAgICBxdWVyeTogZ2V0RGV2aWNlc0ZvclVzZXIsXG4gICAgICAgICAgICAgICAgdmFyaWFibGVzOiB7XG4gICAgICAgICAgICAgICAgICAgIGdldERldmljZXNGb3JVc2VySW5wdXQ6IGdldERldmljZXNGb3JVc2VySW5wdXRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAgICAgXCJ4LWFwaS1rZXlcIjogbW9vbmJlYW1Qcml2YXRlS2V5XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiAxNTAwMCwgLy8gaW4gbWlsbGlzZWNvbmRzIGhlcmVcbiAgICAgICAgICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlOiAnTW9vbmJlYW0gQVBJIHRpbWVkIG91dCBhZnRlciAxNTAwMG1zISdcbiAgICAgICAgICAgIH0pLnRoZW4oZ2V0RGV2aWNlc0ZvclVzZXJSZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGdldERldmljZXNGb3JVc2VyUmVzcG9uc2UuZGF0YSl9YCk7XG5cbiAgICAgICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgZGF0YSBibG9jayBmcm9tIHRoZSByZXNwb25zZVxuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlRGF0YSA9IChnZXREZXZpY2VzRm9yVXNlclJlc3BvbnNlICYmIGdldERldmljZXNGb3JVc2VyUmVzcG9uc2UuZGF0YSkgPyBnZXREZXZpY2VzRm9yVXNlclJlc3BvbnNlLmRhdGEuZGF0YSA6IG51bGw7XG5cbiAgICAgICAgICAgICAgICAvLyBjaGVjayBpZiB0aGVyZSBhcmUgYW55IGVycm9ycyBpbiB0aGUgcmV0dXJuZWQgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2VEYXRhICYmIHJlc3BvbnNlRGF0YS5nZXREZXZpY2VzRm9yVXNlci5lcnJvck1lc3NhZ2UgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuZWQgdGhlIHN1Y2Nlc3NmdWxseSByZXRyaWV2ZWQgcGh5c2ljYWwgZGV2aWNlcyBmb3IgYSBnaXZlbiB1c2VyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiByZXNwb25zZURhdGEuZ2V0RGV2aWNlc0ZvclVzZXIuZGF0YSBhcyBQdXNoRGV2aWNlW11cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZURhdGEgP1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBlcnJvciBtZXNzYWdlIGFuZCB0eXBlLCBmcm9tIHRoZSBvcmlnaW5hbCBBcHBTeW5jIGNhbGxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IHJlc3BvbnNlRGF0YS5nZXREZXZpY2VzRm9yVXNlci5lcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiByZXNwb25zZURhdGEuZ2V0RGV2aWNlc0ZvclVzZXIuZXJyb3JUeXBlXG4gICAgICAgICAgICAgICAgICAgICAgICB9IDpcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgZXJyb3IgcmVzcG9uc2UgaW5kaWNhdGluZyBhbiBpbnZhbGlkIHN0cnVjdHVyZSByZXR1cm5lZFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogYEludmFsaWQgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gJHtlbmRwb2ludEluZm99IHJlc3BvbnNlIWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBVc2VyRGV2aWNlRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IucmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGFuZCB0aGUgc2VydmVyIHJlc3BvbmRlZCB3aXRoIGEgc3RhdHVzIGNvZGVcbiAgICAgICAgICAgICAgICAgICAgICogdGhhdCBmYWxscyBvdXQgb2YgdGhlIHJhbmdlIG9mIDJ4eC5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBOb24gMnh4eCByZXNwb25zZSB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gTW9vbmJlYW0gQVBJLCB3aXRoIHN0YXR1cyAke2Vycm9yLnJlc3BvbnNlLnN0YXR1c30sIGFuZCByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGVycm9yLnJlc3BvbnNlLmRhdGEpfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gYW55IG90aGVyIHNwZWNpZmljIGVycm9ycyB0byBiZSBmaWx0ZXJlZCBiZWxvd1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFVzZXJEZXZpY2VFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5yZXF1ZXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBidXQgbm8gcmVzcG9uc2Ugd2FzIHJlY2VpdmVkXG4gICAgICAgICAgICAgICAgICAgICAqIGBlcnJvci5yZXF1ZXN0YCBpcyBhbiBpbnN0YW5jZSBvZiBYTUxIdHRwUmVxdWVzdCBpbiB0aGUgYnJvd3NlciBhbmQgYW4gaW5zdGFuY2Ugb2ZcbiAgICAgICAgICAgICAgICAgICAgICogIGh0dHAuQ2xpZW50UmVxdWVzdCBpbiBub2RlLmpzLlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vIHJlc3BvbnNlIHJlY2VpdmVkIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBNb29uYmVhbSBBUEksIGZvciByZXF1ZXN0ICR7ZXJyb3IucmVxdWVzdH1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVXNlckRldmljZUVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBTb21ldGhpbmcgaGFwcGVuZWQgaW4gc2V0dGluZyB1cCB0aGUgcmVxdWVzdCB0aGF0IHRyaWdnZXJlZCBhbiBFcnJvclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IGZvciB0aGUgJHtlbmRwb2ludEluZm99IE1vb25iZWFtIEFQSSwgJHsoZXJyb3IgJiYgZXJyb3IubWVzc2FnZSkgJiYgZXJyb3IubWVzc2FnZX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVXNlckRldmljZUVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSByZXRyaWV2aW5nIHBoeXNpY2FsIGRldmljZXMgZm9yIGEgcGFydGljdWxhciB1c2VyLCB0aHJvdWdoICR7ZW5kcG9pbnRJbmZvfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9ICR7ZXJyfWApO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVXNlckRldmljZUVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=