"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourierClient = void 0;
const BaseAPIClient_1 = require("./BaseAPIClient");
const GraphqlExports_1 = require("../GraphqlExports");
const Constants_1 = require("../Constants");
const axios_1 = __importDefault(require("axios"));
/**
 * Class used as the base/generic client for all Courier/notification-related calls.
 */
class CourierClient extends BaseAPIClient_1.BaseAPIClient {
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
     * Function used to send a mobile push notification.
     *
     * @param sendMobilePushNotificationInput the notification input details to be passed in, in order to send
     * a mobile push notification
     * @param notificationType the type of notification to send mobile push notifications for
     *
     * @returns a {@link NotificationResponse} representing the Courier notification response
     *
     * @protected
     */
    async sendMobilePushNotification(sendMobilePushNotificationInput, notificationType) {
        // easily identifiable API endpoint information
        const endpointInfo = 'POST /send mobile push Courier API';
        try {
            // retrieve the API Key and Base URL, needed in order to make the POST send mobile push notification through the client
            const [courierBaseURL, notificationAuthToken, notificationTemplateId] = await super.retrieveServiceCredentials(Constants_1.Constants.AWSPairConstants.COURIER_INTERNAL_SECRET_NAME, undefined, notificationType, undefined, undefined, GraphqlExports_1.NotificationChannelType.Push);
            // check to see if we obtained any invalid secret values from the call above
            if (courierBaseURL === null || courierBaseURL.length === 0 ||
                notificationAuthToken === null || notificationAuthToken.length === 0 ||
                notificationTemplateId === null || notificationTemplateId.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Courier API call!";
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: GraphqlExports_1.NotificationsErrorType.UnexpectedError
                };
            }
            /**
             * POST /send
             * @link https://www.courier.com/docs/reference/send/message/
             *
             * build the Courier API request body to be passed in, and perform a POST to it with the appropriate information
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            const requestData = {
                message: {
                    to: {
                        expo: {
                            tokens: sendMobilePushNotificationInput.expoPushTokens
                        }
                    },
                    template: notificationTemplateId,
                    providers: {
                        expo: {
                            override: {
                                ttl: 300,
                                sound: "default",
                                priority: "high"
                            }
                        }
                    },
                    ...(sendMobilePushNotificationInput.ineligibleTransactionAmount !== undefined &&
                        sendMobilePushNotificationInput.ineligibleTransactionAmount !== null && {
                        data: {
                            ineligibleTransactionAmount: sendMobilePushNotificationInput.ineligibleTransactionAmount
                        }
                    }),
                    ...((sendMobilePushNotificationInput.pendingCashback === undefined || sendMobilePushNotificationInput.pendingCashback === null)
                        && sendMobilePushNotificationInput.merchantName !== undefined && sendMobilePushNotificationInput.merchantName !== null
                        && sendMobilePushNotificationInput.merchantName.length !== 0 && {
                        data: {
                            merchantName: sendMobilePushNotificationInput.merchantName
                        }
                    }),
                    ...(sendMobilePushNotificationInput.pendingCashback !== undefined && sendMobilePushNotificationInput.pendingCashback !== null
                        && sendMobilePushNotificationInput.merchantName !== undefined && sendMobilePushNotificationInput.merchantName !== null
                        && sendMobilePushNotificationInput.merchantName.length !== 0 && {
                        data: {
                            pendingCashback: sendMobilePushNotificationInput.pendingCashback.toString(),
                            merchantName: sendMobilePushNotificationInput.merchantName
                        }
                    }),
                    ...(sendMobilePushNotificationInput.dailyEarningsSummaryAmount !== undefined &&
                        sendMobilePushNotificationInput.dailyEarningsSummaryAmount !== null && {
                        data: {
                            dailyEarningsSummaryAmount: sendMobilePushNotificationInput.dailyEarningsSummaryAmount.toString()
                        }
                    })
                }
            };
            console.log(`Courier API request Object: ${JSON.stringify(requestData)}`);
            return axios_1.default.post(`${courierBaseURL}/send`, requestData, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${notificationAuthToken}`
                },
                timeout: 15000,
                timeoutErrorMessage: 'Courier API timed out after 15000ms!'
            }).then(sendMobilePushResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(sendMobilePushResponse.data)}`);
                /**
                 * if we reached this, then we assume that a 2xx response code was returned.
                 * check the contents of the response, and act appropriately.
                 */
                if (sendMobilePushResponse.data && sendMobilePushResponse.data["requestId"]) {
                    return {
                        requestId: sendMobilePushResponse.data["requestId"]
                    };
                }
                else {
                    return {
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
                    const errorMessage = `Non 2xxx response while calling the ${endpointInfo} Courier API, with status ${error.response.status}, and response ${JSON.stringify(error.response.data)}`;
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
                    const errorMessage = `No response received while calling the ${endpointInfo} Courier API, for request ${error.request}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.NotificationsErrorType.UnexpectedError
                    };
                }
                else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Courier API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.NotificationsErrorType.UnexpectedError
                    };
                }
            });
        }
        catch (err) {
            const errorMessage = `Unexpected error while initiating the mobile push notification sending through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                errorMessage: errorMessage,
                errorType: GraphqlExports_1.NotificationsErrorType.UnexpectedError
            };
        }
    }
    /**
     * Function used to send an email notification.
     *
     * @param sendEmailNotificationInput the notification input details to be passed in, in order to send
     * an email notification
     * @param notificationType the type of notification to send email notifications for
     *
     * @returns a {@link NotificationResponse} representing the Courier notification response
     */
    async sendEmailNotification(sendEmailNotificationInput, notificationType) {
        // easily identifiable API endpoint information
        const endpointInfo = 'POST /send email Courier API';
        try {
            // retrieve the API Key and Base URL, needed in order to make the POST send email notification through the client
            const [courierBaseURL, notificationAuthToken, notificationTemplateId] = await super.retrieveServiceCredentials(Constants_1.Constants.AWSPairConstants.COURIER_INTERNAL_SECRET_NAME, undefined, notificationType, undefined, undefined, GraphqlExports_1.NotificationChannelType.Email);
            // check to see if we obtained any invalid secret values from the call above
            if (courierBaseURL === null || courierBaseURL.length === 0 ||
                notificationAuthToken === null || notificationAuthToken.length === 0 ||
                notificationTemplateId === null || notificationTemplateId.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Courier API call!";
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: GraphqlExports_1.NotificationsErrorType.UnexpectedError
                };
            }
            /**
             * POST /send
             * @link https://www.courier.com/docs/reference/send/message/
             *
             * build the Courier API request body to be passed in, and perform a POST to it with the appropriate information
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            const requestData = {
                message: {
                    to: {
                        email: sendEmailNotificationInput.emailDestination
                    },
                    template: notificationTemplateId,
                    data: {
                        fullName: sendEmailNotificationInput.userFullName,
                        ...(sendEmailNotificationInput.transactions !== undefined && sendEmailNotificationInput.transactions !== null && sendEmailNotificationInput.transactions.length !== 0 && {
                            transactions: sendEmailNotificationInput.transactions
                        }),
                        ...(sendEmailNotificationInput.dailyEarningsSummaryAmount !== undefined && sendEmailNotificationInput.dailyEarningsSummaryAmount !== null && {
                            dailyEarningsSummaryAmount: sendEmailNotificationInput.dailyEarningsSummaryAmount
                        }),
                    }
                }
            };
            console.log(`Courier API request Object: ${JSON.stringify(requestData)}`);
            return axios_1.default.post(`${courierBaseURL}/send`, requestData, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${notificationAuthToken}`
                },
                timeout: 15000,
                timeoutErrorMessage: 'Courier API timed out after 15000ms!'
            }).then(sendEmailResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(sendEmailResponse.data)}`);
                /**
                 * if we reached this, then we assume that a 2xx response code was returned.
                 * check the contents of the response, and act appropriately.
                 */
                if (sendEmailResponse.data && sendEmailResponse.data["requestId"]) {
                    return {
                        requestId: sendEmailResponse.data["requestId"]
                    };
                }
                else {
                    return {
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
                    const errorMessage = `Non 2xxx response while calling the ${endpointInfo} Courier API, with status ${error.response.status}, and response ${JSON.stringify(error.response.data)}`;
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
                    const errorMessage = `No response received while calling the ${endpointInfo} Courier API, for request ${error.request}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.NotificationsErrorType.UnexpectedError
                    };
                }
                else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Courier API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.NotificationsErrorType.UnexpectedError
                    };
                }
            });
        }
        catch (err) {
            const errorMessage = `Unexpected error while initiating the email notification sending through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                errorMessage: errorMessage,
                errorType: GraphqlExports_1.NotificationsErrorType.UnexpectedError
            };
        }
    }
    /**
     * Function used to send a bulk mobile push notification.
     *
     * @param sendBulkMobilePushNotificationInput the notification input details to be passed in, in order to send
     * a bulk mobile push notification
     * @param notificationType the type of notification to send email notifications for
     *
     * @returns a {@link NotificationResponse} representing the Courier notification response
     */
    async sendBulkMobilePushNotification(sendBulkMobilePushNotificationInput, notificationType) {
        // easily identifiable API endpoint information
        const endpointInfo = 'POST /send BULK mobile push Courier API';
        /**
         * Sending a bulk notification consists of the following steps:
         *
         * 1) Create a bulk job and obtaining its job id from the response.
         * 2) Use that bulk job to add all applicable users to it.
         * 3) Schedule/start that job.
         */
        try {
            // 1) Create a bulk job and obtaining its job id from the response.
            const bulkNotificationJobId = await this.createBulkNotificationJob(notificationType, GraphqlExports_1.NotificationChannelType.Push);
            // ensure that the bulk job creation succeeded
            if (bulkNotificationJobId !== null && bulkNotificationJobId.length !== 0) {
                // 2) Use that bulk job to add all applicable users to it.
                const bulkUsersIngestionFlag = await this.ingestBulkJobUsersForMobilePush(bulkNotificationJobId, notificationType, GraphqlExports_1.NotificationChannelType.Push, sendBulkMobilePushNotificationInput);
                // ensure that the users ingestion was successful
                if (bulkUsersIngestionFlag) {
                    // 3) Schedule/start that job.
                    const bulkJobRunFlag = await this.runBulkNotificationJob(bulkNotificationJobId, notificationType, GraphqlExports_1.NotificationChannelType.Push);
                    // ensure that the bulk job ran successfully
                    if (bulkJobRunFlag) {
                        // return the job id
                        return {
                            requestId: bulkNotificationJobId
                        };
                    }
                    else {
                        const errorMessage = `Unexpected error while running/scheduling the bulk job for mobile push notifications through ${endpointInfo}`;
                        console.log(errorMessage);
                        return {
                            errorMessage: errorMessage,
                            errorType: GraphqlExports_1.NotificationsErrorType.UnexpectedError
                        };
                    }
                }
                else {
                    const errorMessage = `Unexpected error while ingesting users for the bulk job for mobile push notifications through ${endpointInfo}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.NotificationsErrorType.UnexpectedError
                    };
                }
            }
            else {
                const errorMessage = `Unexpected error while creating the bulk job for mobile push notifications through ${endpointInfo}`;
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: GraphqlExports_1.NotificationsErrorType.UnexpectedError
                };
            }
        }
        catch (err) {
            const errorMessage = `Unexpected error while initiating the bulk mobile push notification sending through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                errorMessage: errorMessage,
                errorType: GraphqlExports_1.NotificationsErrorType.UnexpectedError
            };
        }
    }
    /**
     * Function used to send a bulk email notification.
     *
     * @param sendBulkEmailNotificationInput the notification input details to be passed in, in order to send
     * a bulk email notification
     * @param notificationType the type of notification to send email notifications for
     *
     * @returns a {@link NotificationResponse} representing the Courier notification response
     */
    async sendBulkEmailNotification(sendBulkEmailNotificationInput, notificationType) {
        // easily identifiable API endpoint information
        const endpointInfo = 'POST /send BULK email Courier API';
        /**
         * Sending a bulk notification consists of the following steps:
         *
         * 1) Create a bulk job and obtaining its job id from the response.
         * 2) Use that bulk job to add all applicable users to it.
         * 3) Schedule/start that job.
         */
        try {
            // 1) Create a bulk job and obtaining its job id from the response.
            const bulkNotificationJobId = await this.createBulkNotificationJob(notificationType, GraphqlExports_1.NotificationChannelType.Email);
            // ensure that the bulk job creation succeeded
            if (bulkNotificationJobId !== null && bulkNotificationJobId.length !== 0) {
                // 2) Use that bulk job to add all applicable users to it.
                const bulkUsersIngestionFlag = await this.ingestBulkJobUsersForEmail(bulkNotificationJobId, notificationType, GraphqlExports_1.NotificationChannelType.Email, sendBulkEmailNotificationInput);
                // ensure that the users ingestion was successful
                if (bulkUsersIngestionFlag) {
                    // 3) Schedule/start that job.
                    const bulkJobRunFlag = await this.runBulkNotificationJob(bulkNotificationJobId, notificationType, GraphqlExports_1.NotificationChannelType.Email);
                    // ensure that the bulk job ran successfully
                    if (bulkJobRunFlag) {
                        // return the job id
                        return {
                            requestId: bulkNotificationJobId
                        };
                    }
                    else {
                        const errorMessage = `Unexpected error while running/scheduling the bulk job for email notifications through ${endpointInfo}`;
                        console.log(errorMessage);
                        return {
                            errorMessage: errorMessage,
                            errorType: GraphqlExports_1.NotificationsErrorType.UnexpectedError
                        };
                    }
                }
                else {
                    const errorMessage = `Unexpected error while ingesting users for the bulk job for email notifications through ${endpointInfo}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: GraphqlExports_1.NotificationsErrorType.UnexpectedError
                    };
                }
            }
            else {
                const errorMessage = `Unexpected error while creating the bulk job for email notifications through ${endpointInfo}`;
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: GraphqlExports_1.NotificationsErrorType.UnexpectedError
                };
            }
        }
        catch (err) {
            const errorMessage = `Unexpected error while initiating the bulk email notification sending through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return {
                errorMessage: errorMessage,
                errorType: GraphqlExports_1.NotificationsErrorType.UnexpectedError
            };
        }
    }
    /**
     * Function used to start/schedule a bulk job.
     *
     * @param jobId the id of the job to start/scheduling for running
     * @param notificationType notification type to start the job for
     * @param notificationChannelType the type of notification channel
     *
     * @return a {@link Promise} of {@link boolean} depending on whether the job run was successful or not.
     */
    async runBulkNotificationJob(jobId, notificationType, notificationChannelType) {
        // easily identifiable API endpoint information
        const endpointInfo = 'POST /bulk/{jobId}/run Courier API';
        try {
            // retrieve the API Key and Base URL, needed in order to make the POST send email notification through the client
            const [courierBaseURL, notificationAuthToken, notificationTemplateId] = await super.retrieveServiceCredentials(Constants_1.Constants.AWSPairConstants.COURIER_INTERNAL_SECRET_NAME, undefined, notificationType, undefined, undefined, notificationChannelType);
            // check to see if we obtained any invalid secret values from the call above
            if (courierBaseURL === null || courierBaseURL.length === 0 ||
                notificationAuthToken === null || notificationAuthToken.length === 0 ||
                notificationTemplateId === null || notificationTemplateId.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Courier API call!";
                console.log(errorMessage);
                return false;
            }
            /**
             * POST /bulk/{jobId}/run
             * @link https://www.courier.com/docs/tutorials/how-to-send-bulk-notifications/
             *
             * build the Courier API request body to be passed in, and perform a POST to it with the appropriate information
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            return axios_1.default.post(`${courierBaseURL}/bulk/${jobId}/run`, {}, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${notificationAuthToken}`
                },
                timeout: 15000,
                timeoutErrorMessage: 'Courier API timed out after 15000ms!'
            }).then(startBulkJobNotificationResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(startBulkJobNotificationResponse.data)}`);
                /**
                 * if we reached this, then we assume that a 2xx response code was returned.
                 */
                return true;
            }).catch(error => {
                if (error.response) {
                    /**
                     * The request was made and the server responded with a status code
                     * that falls out of the range of 2xx.
                     */
                    const errorMessage = `Non 2xxx response while calling the ${endpointInfo} Courier API, with status ${error.response.status}, and response ${JSON.stringify(error.response.data)}`;
                    console.log(errorMessage);
                    // any other specific errors to be filtered below
                    return false;
                }
                else if (error.request) {
                    /**
                     * The request was made but no response was received
                     * `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                     *  http.ClientRequest in node.js.
                     */
                    const errorMessage = `No response received while calling the ${endpointInfo} Courier API, for request ${error.request}`;
                    console.log(errorMessage);
                    return false;
                }
                else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Courier API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);
                    return false;
                }
            });
        }
        catch (err) {
            const errorMessage = `Unexpected error while initiating the bulk job run through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return false;
        }
    }
    /**
     * Function used to ingest users for a mobile-push based bulk job needing to be run.
     *
     * @param jobId the id of the job which we are ingesting the users for
     * @param notificationType the type of notification for which we are ingesting users for
     * @param notificationChannelType the type of notification channel
     * @param sendBulkMobilePushNotificationInput the bulk mobile push input, used to ingest users
     *
     * @return a {@link Promise} of {@link boolean} representing a flag to highlight whether the
     * user ingestion activity was successful or not.
     */
    async ingestBulkJobUsersForMobilePush(jobId, notificationType, notificationChannelType, sendBulkMobilePushNotificationInput) {
        // easily identifiable API endpoint information
        const endpointInfo = 'POST /bulk/{jobId} mobile push Courier API';
        try {
            // retrieve the API Key and Base URL, needed in order to make the POST send email notification through the client
            const [courierBaseURL, notificationAuthToken, notificationTemplateId] = await super.retrieveServiceCredentials(Constants_1.Constants.AWSPairConstants.COURIER_INTERNAL_SECRET_NAME, undefined, notificationType, undefined, undefined, notificationChannelType);
            // check to see if we obtained any invalid secret values from the call above
            if (courierBaseURL === null || courierBaseURL.length === 0 ||
                notificationAuthToken === null || notificationAuthToken.length === 0 ||
                notificationTemplateId === null || notificationTemplateId.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Courier API call!";
                console.log(errorMessage);
                return false;
            }
            /**
             * POST /bulk/{jobId}
             * @link https://www.courier.com/docs/tutorials/how-to-send-bulk-notifications/
             *
             * build the Courier API request body to be passed in, and perform a POST to it with the appropriate information
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             *
             * First build the request data from the bulk input passed in
             */
            const ingestedUsers = [];
            sendBulkMobilePushNotificationInput.mobilePushNotificationInputs.forEach(mobilePushNotificationInput => {
                if (mobilePushNotificationInput !== null) {
                    ingestedUsers.push({
                        to: {
                            expo: {
                                tokens: mobilePushNotificationInput.expoPushTokens
                            }
                        },
                        ...(mobilePushNotificationInput.ineligibleTransactionAmount !== undefined &&
                            mobilePushNotificationInput.ineligibleTransactionAmount !== null && {
                            data: {
                                ineligibleTransactionAmount: mobilePushNotificationInput.ineligibleTransactionAmount
                            }
                        }),
                        ...((mobilePushNotificationInput.pendingCashback === undefined || mobilePushNotificationInput.pendingCashback === null)
                            && mobilePushNotificationInput.merchantName !== undefined && mobilePushNotificationInput.merchantName !== null
                            && mobilePushNotificationInput.merchantName.length !== 0 && {
                            data: {
                                merchantName: mobilePushNotificationInput.merchantName
                            }
                        }),
                        ...(mobilePushNotificationInput.pendingCashback !== undefined && mobilePushNotificationInput.pendingCashback !== null
                            && mobilePushNotificationInput.merchantName !== undefined && mobilePushNotificationInput.merchantName !== null
                            && mobilePushNotificationInput.merchantName.length !== 0 && {
                            data: {
                                pendingCashback: mobilePushNotificationInput.pendingCashback.toString(),
                                merchantName: mobilePushNotificationInput.merchantName
                            }
                        }),
                        ...(mobilePushNotificationInput.dailyEarningsSummaryAmount !== undefined &&
                            mobilePushNotificationInput.dailyEarningsSummaryAmount !== null && {
                            data: {
                                dailyEarningsSummaryAmount: mobilePushNotificationInput.dailyEarningsSummaryAmount.toString()
                            }
                        })
                    });
                }
            });
            const requestData = {
                users: ingestedUsers
            };
            return axios_1.default.post(`${courierBaseURL}/bulk/${jobId}`, requestData, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${notificationAuthToken}`
                },
                timeout: 15000,
                timeoutErrorMessage: 'Courier API timed out after 15000ms!'
            }).then(ingestBulkJobUsersForMobilePushResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(ingestBulkJobUsersForMobilePushResponse.data)}`);
                /**
                 * if we reached this, then we assume that a 2xx response code was returned.
                 * check the contents of the response, and act appropriately.
                 */
                if (ingestBulkJobUsersForMobilePushResponse.data && !ingestBulkJobUsersForMobilePushResponse.data["errors"] &&
                    ingestBulkJobUsersForMobilePushResponse.data["total"] && ingestBulkJobUsersForMobilePushResponse.data["total"] === ingestedUsers.length) {
                    return true;
                }
                else {
                    return false;
                }
            }).catch(error => {
                if (error.response) {
                    /**
                     * The request was made and the server responded with a status code
                     * that falls out of the range of 2xx.
                     */
                    const errorMessage = `Non 2xxx response while calling the ${endpointInfo} Courier API, with status ${error.response.status}, and response ${JSON.stringify(error.response.data)}`;
                    console.log(errorMessage);
                    // any other specific errors to be filtered below
                    return false;
                }
                else if (error.request) {
                    /**
                     * The request was made but no response was received
                     * `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                     *  http.ClientRequest in node.js.
                     */
                    const errorMessage = `No response received while calling the ${endpointInfo} Courier API, for request ${error.request}`;
                    console.log(errorMessage);
                    return false;
                }
                else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Courier API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);
                    return false;
                }
            });
        }
        catch (err) {
            const errorMessage = `Unexpected error while ingesting users through the mobile push bulk job update through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return false;
        }
    }
    /**
     * Function used to ingest users for an email-based bulk job needing to be run.
     *
     * @param jobId the id of the job which we are ingesting the users for
     * @param notificationType the type of notification for which we are ingesting users for
     * @param notificationChannelType the type of notification channel
     * @param sendBulkEmailNotificationInput the bulk email input, used to ingest users
     *
     * @return a {@link Promise} of {@link boolean} representing a flag to highlight whether the
     * user ingestion activity was successful or not.
     */
    async ingestBulkJobUsersForEmail(jobId, notificationType, notificationChannelType, sendBulkEmailNotificationInput) {
        // easily identifiable API endpoint information
        const endpointInfo = 'POST /bulk/{jobId} email Courier API';
        try {
            // retrieve the API Key and Base URL, needed in order to make the POST send email notification through the client
            const [courierBaseURL, notificationAuthToken, notificationTemplateId] = await super.retrieveServiceCredentials(Constants_1.Constants.AWSPairConstants.COURIER_INTERNAL_SECRET_NAME, undefined, notificationType, undefined, undefined, notificationChannelType);
            // check to see if we obtained any invalid secret values from the call above
            if (courierBaseURL === null || courierBaseURL.length === 0 ||
                notificationAuthToken === null || notificationAuthToken.length === 0 ||
                notificationTemplateId === null || notificationTemplateId.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Courier API call!";
                console.log(errorMessage);
                return false;
            }
            /**
             * POST /bulk/{jobId}
             * @link https://www.courier.com/docs/tutorials/how-to-send-bulk-notifications/
             *
             * build the Courier API request body to be passed in, and perform a POST to it with the appropriate information
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             *
             * First build the request data from the bulk input passed in
             */
            const ingestedUsers = [];
            sendBulkEmailNotificationInput.emailNotificationInputs.forEach(emailNotificationInput => {
                if (emailNotificationInput !== null) {
                    ingestedUsers.push({
                        to: {
                            email: emailNotificationInput.emailDestination
                        },
                        data: {
                            fullName: emailNotificationInput.userFullName,
                            ...(emailNotificationInput.transactions !== undefined && emailNotificationInput.transactions !== null && emailNotificationInput.transactions.length !== 0 && {
                                transactions: emailNotificationInput.transactions
                            }),
                            ...(emailNotificationInput.dailyEarningsSummaryAmount !== undefined && emailNotificationInput.dailyEarningsSummaryAmount !== null && {
                                dailyEarningsSummaryAmount: emailNotificationInput.dailyEarningsSummaryAmount
                            }),
                        }
                    });
                }
            });
            const requestData = {
                users: ingestedUsers
            };
            return axios_1.default.post(`${courierBaseURL}/bulk/${jobId}`, requestData, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${notificationAuthToken}`
                },
                timeout: 15000,
                timeoutErrorMessage: 'Courier API timed out after 15000ms!'
            }).then(ingestBulkJobUsersForEmailResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(ingestBulkJobUsersForEmailResponse.data)}`);
                /**
                 * if we reached this, then we assume that a 2xx response code was returned.
                 * check the contents of the response, and act appropriately.
                 */
                if (ingestBulkJobUsersForEmailResponse.data && !ingestBulkJobUsersForEmailResponse.data["errors"] &&
                    ingestBulkJobUsersForEmailResponse.data["total"] && ingestBulkJobUsersForEmailResponse.data["total"] === ingestedUsers.length) {
                    return true;
                }
                else {
                    return false;
                }
            }).catch(error => {
                if (error.response) {
                    /**
                     * The request was made and the server responded with a status code
                     * that falls out of the range of 2xx.
                     */
                    const errorMessage = `Non 2xxx response while calling the ${endpointInfo} Courier API, with status ${error.response.status}, and response ${JSON.stringify(error.response.data)}`;
                    console.log(errorMessage);
                    // any other specific errors to be filtered below
                    return false;
                }
                else if (error.request) {
                    /**
                     * The request was made but no response was received
                     * `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                     *  http.ClientRequest in node.js.
                     */
                    const errorMessage = `No response received while calling the ${endpointInfo} Courier API, for request ${error.request}`;
                    console.log(errorMessage);
                    return false;
                }
                else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Courier API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);
                    return false;
                }
            });
        }
        catch (err) {
            const errorMessage = `Unexpected error while ingesting users through the email bulk job update through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return false;
        }
    }
    /**
     * Function used to create a bulk notification meant to help with
     * scheduling bulk email and mobile push notification jobs.
     *
     * @param notificationType the type of notification to schedule the bulk
     * job for.
     * @param notificationChannelType the type of notification channel
     *
     * @return a {@link Promise} of {@link string} or {@link null} depending on
     * whether the job scheduling was successful or not.
     */
    async createBulkNotificationJob(notificationType, notificationChannelType) {
        // easily identifiable API endpoint information
        const endpointInfo = 'POST /bulk Courier API';
        try {
            // retrieve the API Key and Base URL, needed in order to make the POST send email notification through the client
            const [courierBaseURL, notificationAuthToken, notificationTemplateId] = await super.retrieveServiceCredentials(Constants_1.Constants.AWSPairConstants.COURIER_INTERNAL_SECRET_NAME, undefined, notificationType, undefined, undefined, notificationChannelType);
            // check to see if we obtained any invalid secret values from the call above
            if (courierBaseURL === null || courierBaseURL.length === 0 ||
                notificationAuthToken === null || notificationAuthToken.length === 0 ||
                notificationTemplateId === null || notificationTemplateId.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Courier API call!";
                console.log(errorMessage);
                return null;
            }
            /**
             * POST /bulk
             * @link https://www.courier.com/docs/tutorials/how-to-send-bulk-notifications/
             *
             * build the Courier API request body to be passed in, and perform a POST to it with the appropriate information
             * we imply that if the API does not respond in 15 seconds, then we automatically catch that, and return an
             * error for a better customer experience.
             */
            const requestData = {
                message: {
                    event: notificationTemplateId,
                    locale: "en_US",
                    template: notificationTemplateId
                },
                ...(notificationChannelType === GraphqlExports_1.NotificationChannelType.Push && {
                    providers: {
                        expo: {
                            override: {
                                ttl: 300,
                                sound: "default",
                                priority: "high"
                            }
                        }
                    }
                })
            };
            console.log(`Courier API request Object: ${JSON.stringify(requestData)}`);
            return axios_1.default.post(`${courierBaseURL}/bulk`, requestData, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${notificationAuthToken}`
                },
                timeout: 15000,
                timeoutErrorMessage: 'Courier API timed out after 15000ms!'
            }).then(createBulkNotificationResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(createBulkNotificationResponse.data)}`);
                /**
                 * if we reached this, then we assume that a 2xx response code was returned.
                 * check the contents of the response, and act appropriately.
                 */
                if (createBulkNotificationResponse.data && createBulkNotificationResponse.data["jobId"]) {
                    return createBulkNotificationResponse.data["jobId"];
                }
                else {
                    return null;
                }
            }).catch(error => {
                if (error.response) {
                    /**
                     * The request was made and the server responded with a status code
                     * that falls out of the range of 2xx.
                     */
                    const errorMessage = `Non 2xxx response while calling the ${endpointInfo} Courier API, with status ${error.response.status}, and response ${JSON.stringify(error.response.data)}`;
                    console.log(errorMessage);
                    // any other specific errors to be filtered below
                    return null;
                }
                else if (error.request) {
                    /**
                     * The request was made but no response was received
                     * `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                     *  http.ClientRequest in node.js.
                     */
                    const errorMessage = `No response received while calling the ${endpointInfo} Courier API, for request ${error.request}`;
                    console.log(errorMessage);
                    return null;
                }
                else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Courier API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);
                    return null;
                }
            });
        }
        catch (err) {
            const errorMessage = `Unexpected error while initiating the bulk job creation through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);
            return null;
        }
    }
}
exports.CourierClient = CourierClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ291cmllckNsaWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tb24vY2xpZW50cy9Db3VyaWVyQ2xpZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLG1EQUE4QztBQUM5QyxzREFTMkI7QUFDM0IsNENBQXVDO0FBQ3ZDLGtEQUEwQjtBQUUxQjs7R0FFRztBQUNILE1BQWEsYUFBYyxTQUFRLDZCQUFhO0lBRTVDOzs7OztPQUtHO0lBQ0gsWUFBWSxXQUFtQixFQUFFLE1BQWM7UUFDM0MsS0FBSyxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRUQ7Ozs7Ozs7Ozs7T0FVRztJQUNILEtBQUssQ0FBQywwQkFBMEIsQ0FBQywrQkFBZ0UsRUFBRSxnQkFBa0M7UUFDakksK0NBQStDO1FBQy9DLE1BQU0sWUFBWSxHQUFHLG9DQUFvQyxDQUFDO1FBRTFELElBQUk7WUFDQSx1SEFBdUg7WUFDdkgsTUFBTSxDQUFDLGNBQWMsRUFBRSxxQkFBcUIsRUFBRSxzQkFBc0IsQ0FBQyxHQUFHLE1BQU0sS0FBSyxDQUFDLDBCQUEwQixDQUFDLHFCQUFTLENBQUMsZ0JBQWdCLENBQUMsNEJBQTRCLEVBQ2xLLFNBQVMsRUFBRSxnQkFBZ0IsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLHdDQUF1QixDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXJGLDRFQUE0RTtZQUM1RSxJQUFJLGNBQWMsS0FBSyxJQUFJLElBQUksY0FBYyxDQUFDLE1BQU0sS0FBSyxDQUFDO2dCQUN0RCxxQkFBcUIsS0FBSyxJQUFJLElBQUkscUJBQXFCLENBQUMsTUFBTSxLQUFLLENBQUM7Z0JBQ3BFLHNCQUFzQixLQUFLLElBQUksSUFBSSxzQkFBdUIsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUN6RSxNQUFNLFlBQVksR0FBRyxnREFBZ0QsQ0FBQztnQkFDdEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENB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b0JBQ3ZFLE1BQU0sWUFBWSxHQUFHLHlEQUF5RCxZQUFZLGlCQUFpQixDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO29CQUN2SixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO29CQUUxQixPQUFPLElBQUksQ0FBQztpQkFDZjtZQUNMLENBQUMsQ0FBQyxDQUFDO1NBQ047UUFBQyxPQUFPLEdBQUcsRUFBRTtZQUNWLE1BQU0sWUFBWSxHQUFHLG1FQUFtRSxZQUFZLEVBQUUsQ0FBQztZQUN2RyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsWUFBWSxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFFdEMsT0FBTyxJQUFJLENBQUM7U0FDZjtJQUNMLENBQUM7Q0FDSjtBQW41QkQsc0NBbTVCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7QmFzZUFQSUNsaWVudH0gZnJvbSBcIi4vQmFzZUFQSUNsaWVudFwiO1xuaW1wb3J0IHtcbiAgICBOb3RpZmljYXRpb25DaGFubmVsVHlwZSxcbiAgICBOb3RpZmljYXRpb25SZXNwb25zZSxcbiAgICBOb3RpZmljYXRpb25zRXJyb3JUeXBlLFxuICAgIE5vdGlmaWNhdGlvblR5cGUsXG4gICAgU2VuZEJ1bGtFbWFpbE5vdGlmaWNhdGlvbklucHV0LFxuICAgIFNlbmRCdWxrTW9iaWxlUHVzaE5vdGlmaWNhdGlvbklucHV0LFxuICAgIFNlbmRFbWFpbE5vdGlmaWNhdGlvbklucHV0LFxuICAgIFNlbmRNb2JpbGVQdXNoTm90aWZpY2F0aW9uSW5wdXRcbn0gZnJvbSBcIi4uL0dyYXBocWxFeHBvcnRzXCI7XG5pbXBvcnQge0NvbnN0YW50c30gZnJvbSBcIi4uL0NvbnN0YW50c1wiO1xuaW1wb3J0IGF4aW9zIGZyb20gXCJheGlvc1wiO1xuXG4vKipcbiAqIENsYXNzIHVzZWQgYXMgdGhlIGJhc2UvZ2VuZXJpYyBjbGllbnQgZm9yIGFsbCBDb3VyaWVyL25vdGlmaWNhdGlvbi1yZWxhdGVkIGNhbGxzLlxuICovXG5leHBvcnQgY2xhc3MgQ291cmllckNsaWVudCBleHRlbmRzIEJhc2VBUElDbGllbnQge1xuXG4gICAgLyoqXG4gICAgICogR2VuZXJpYyBjb25zdHJ1Y3RvciBmb3IgdGhlIGNsaWVudC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBlbnZpcm9ubWVudCB0aGUgQVdTIGVudmlyb25tZW50IHBhc3NlZCBpbiBmcm9tIHRoZSBMYW1iZGEgcmVzb2x2ZXIuXG4gICAgICogQHBhcmFtIHJlZ2lvbiB0aGUgQVdTIHJlZ2lvbiBwYXNzZWQgaW4gZnJvbSB0aGUgTGFtYmRhIHJlc29sdmVyLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGVudmlyb25tZW50OiBzdHJpbmcsIHJlZ2lvbjogc3RyaW5nKSB7XG4gICAgICAgIHN1cGVyKHJlZ2lvbiwgZW52aXJvbm1lbnQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHVzZWQgdG8gc2VuZCBhIG1vYmlsZSBwdXNoIG5vdGlmaWNhdGlvbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBzZW5kTW9iaWxlUHVzaE5vdGlmaWNhdGlvbklucHV0IHRoZSBub3RpZmljYXRpb24gaW5wdXQgZGV0YWlscyB0byBiZSBwYXNzZWQgaW4sIGluIG9yZGVyIHRvIHNlbmRcbiAgICAgKiBhIG1vYmlsZSBwdXNoIG5vdGlmaWNhdGlvblxuICAgICAqIEBwYXJhbSBub3RpZmljYXRpb25UeXBlIHRoZSB0eXBlIG9mIG5vdGlmaWNhdGlvbiB0byBzZW5kIG1vYmlsZSBwdXNoIG5vdGlmaWNhdGlvbnMgZm9yXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBhIHtAbGluayBOb3RpZmljYXRpb25SZXNwb25zZX0gcmVwcmVzZW50aW5nIHRoZSBDb3VyaWVyIG5vdGlmaWNhdGlvbiByZXNwb25zZVxuICAgICAqXG4gICAgICogQHByb3RlY3RlZFxuICAgICAqL1xuICAgIGFzeW5jIHNlbmRNb2JpbGVQdXNoTm90aWZpY2F0aW9uKHNlbmRNb2JpbGVQdXNoTm90aWZpY2F0aW9uSW5wdXQ6IFNlbmRNb2JpbGVQdXNoTm90aWZpY2F0aW9uSW5wdXQsIG5vdGlmaWNhdGlvblR5cGU6IE5vdGlmaWNhdGlvblR5cGUpOiBQcm9taXNlPE5vdGlmaWNhdGlvblJlc3BvbnNlPiB7XG4gICAgICAgIC8vIGVhc2lseSBpZGVudGlmaWFibGUgQVBJIGVuZHBvaW50IGluZm9ybWF0aW9uXG4gICAgICAgIGNvbnN0IGVuZHBvaW50SW5mbyA9ICdQT1NUIC9zZW5kIG1vYmlsZSBwdXNoIENvdXJpZXIgQVBJJztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIEFQSSBLZXkgYW5kIEJhc2UgVVJMLCBuZWVkZWQgaW4gb3JkZXIgdG8gbWFrZSB0aGUgUE9TVCBzZW5kIG1vYmlsZSBwdXNoIG5vdGlmaWNhdGlvbiB0aHJvdWdoIHRoZSBjbGllbnRcbiAgICAgICAgICAgIGNvbnN0IFtjb3VyaWVyQmFzZVVSTCwgbm90aWZpY2F0aW9uQXV0aFRva2VuLCBub3RpZmljYXRpb25UZW1wbGF0ZUlkXSA9IGF3YWl0IHN1cGVyLnJldHJpZXZlU2VydmljZUNyZWRlbnRpYWxzKENvbnN0YW50cy5BV1NQYWlyQ29uc3RhbnRzLkNPVVJJRVJfSU5URVJOQUxfU0VDUkVUX05BTUUsXG4gICAgICAgICAgICAgICAgdW5kZWZpbmVkLCBub3RpZmljYXRpb25UeXBlLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgTm90aWZpY2F0aW9uQ2hhbm5lbFR5cGUuUHVzaCk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB3ZSBvYnRhaW5lZCBhbnkgaW52YWxpZCBzZWNyZXQgdmFsdWVzIGZyb20gdGhlIGNhbGwgYWJvdmVcbiAgICAgICAgICAgIGlmIChjb3VyaWVyQmFzZVVSTCA9PT0gbnVsbCB8fCBjb3VyaWVyQmFzZVVSTC5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25BdXRoVG9rZW4gPT09IG51bGwgfHwgbm90aWZpY2F0aW9uQXV0aFRva2VuLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvblRlbXBsYXRlSWQgPT09IG51bGwgfHwgbm90aWZpY2F0aW9uVGVtcGxhdGVJZCEubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gXCJJbnZhbGlkIFNlY3JldHMgb2J0YWluZWQgZm9yIENvdXJpZXIgQVBJIGNhbGwhXCI7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBQT1NUIC9zZW5kXG4gICAgICAgICAgICAgKiBAbGluayBodHRwczovL3d3dy5jb3VyaWVyLmNvbS9kb2NzL3JlZmVyZW5jZS9zZW5kL21lc3NhZ2UvXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogYnVpbGQgdGhlIENvdXJpZXIgQVBJIHJlcXVlc3QgYm9keSB0byBiZSBwYXNzZWQgaW4sIGFuZCBwZXJmb3JtIGEgUE9TVCB0byBpdCB3aXRoIHRoZSBhcHByb3ByaWF0ZSBpbmZvcm1hdGlvblxuICAgICAgICAgICAgICogd2UgaW1wbHkgdGhhdCBpZiB0aGUgQVBJIGRvZXMgbm90IHJlc3BvbmQgaW4gMTUgc2Vjb25kcywgdGhlbiB3ZSBhdXRvbWF0aWNhbGx5IGNhdGNoIHRoYXQsIGFuZCByZXR1cm4gYW5cbiAgICAgICAgICAgICAqIGVycm9yIGZvciBhIGJldHRlciBjdXN0b21lciBleHBlcmllbmNlLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBjb25zdCByZXF1ZXN0RGF0YSA9IHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiB7XG4gICAgICAgICAgICAgICAgICAgIHRvOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBleHBvOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW5zOiBzZW5kTW9iaWxlUHVzaE5vdGlmaWNhdGlvbklucHV0LmV4cG9QdXNoVG9rZW5zXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBub3RpZmljYXRpb25UZW1wbGF0ZUlkLFxuICAgICAgICAgICAgICAgICAgICBwcm92aWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4cG86IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdmVycmlkZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0dGw6IDMwMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc291bmQ6IFwiZGVmYXVsdFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmlvcml0eTogXCJoaWdoXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIC4uLihzZW5kTW9iaWxlUHVzaE5vdGlmaWNhdGlvbklucHV0LmluZWxpZ2libGVUcmFuc2FjdGlvbkFtb3VudCAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBzZW5kTW9iaWxlUHVzaE5vdGlmaWNhdGlvbklucHV0LmluZWxpZ2libGVUcmFuc2FjdGlvbkFtb3VudCAhPT0gbnVsbCAmJiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmVsaWdpYmxlVHJhbnNhY3Rpb25BbW91bnQ6IHNlbmRNb2JpbGVQdXNoTm90aWZpY2F0aW9uSW5wdXQuaW5lbGlnaWJsZVRyYW5zYWN0aW9uQW1vdW50IVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAuLi4oKHNlbmRNb2JpbGVQdXNoTm90aWZpY2F0aW9uSW5wdXQucGVuZGluZ0Nhc2hiYWNrID09PSB1bmRlZmluZWQgfHwgc2VuZE1vYmlsZVB1c2hOb3RpZmljYXRpb25JbnB1dC5wZW5kaW5nQ2FzaGJhY2sgPT09IG51bGwpXG4gICAgICAgICAgICAgICAgICAgICAgICAmJiBzZW5kTW9iaWxlUHVzaE5vdGlmaWNhdGlvbklucHV0Lm1lcmNoYW50TmFtZSAhPT0gdW5kZWZpbmVkICYmIHNlbmRNb2JpbGVQdXNoTm90aWZpY2F0aW9uSW5wdXQubWVyY2hhbnROYW1lICE9PSBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAmJiBzZW5kTW9iaWxlUHVzaE5vdGlmaWNhdGlvbklucHV0Lm1lcmNoYW50TmFtZS5sZW5ndGggIT09IDAgJiYge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVyY2hhbnROYW1lOiBzZW5kTW9iaWxlUHVzaE5vdGlmaWNhdGlvbklucHV0Lm1lcmNoYW50TmFtZSFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgLi4uKHNlbmRNb2JpbGVQdXNoTm90aWZpY2F0aW9uSW5wdXQucGVuZGluZ0Nhc2hiYWNrICE9PSB1bmRlZmluZWQgJiYgc2VuZE1vYmlsZVB1c2hOb3RpZmljYXRpb25JbnB1dC5wZW5kaW5nQ2FzaGJhY2sgIT09IG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgICYmIHNlbmRNb2JpbGVQdXNoTm90aWZpY2F0aW9uSW5wdXQubWVyY2hhbnROYW1lICE9PSB1bmRlZmluZWQgJiYgc2VuZE1vYmlsZVB1c2hOb3RpZmljYXRpb25JbnB1dC5tZXJjaGFudE5hbWUgIT09IG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgICYmIHNlbmRNb2JpbGVQdXNoTm90aWZpY2F0aW9uSW5wdXQubWVyY2hhbnROYW1lLmxlbmd0aCAhPT0gMCAmJiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwZW5kaW5nQ2FzaGJhY2s6IHNlbmRNb2JpbGVQdXNoTm90aWZpY2F0aW9uSW5wdXQucGVuZGluZ0Nhc2hiYWNrIS50b1N0cmluZygpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXJjaGFudE5hbWU6IHNlbmRNb2JpbGVQdXNoTm90aWZpY2F0aW9uSW5wdXQubWVyY2hhbnROYW1lIVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAuLi4oc2VuZE1vYmlsZVB1c2hOb3RpZmljYXRpb25JbnB1dC5kYWlseUVhcm5pbmdzU3VtbWFyeUFtb3VudCAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBzZW5kTW9iaWxlUHVzaE5vdGlmaWNhdGlvbklucHV0LmRhaWx5RWFybmluZ3NTdW1tYXJ5QW1vdW50ICE9PSBudWxsICYmIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhaWx5RWFybmluZ3NTdW1tYXJ5QW1vdW50OiBzZW5kTW9iaWxlUHVzaE5vdGlmaWNhdGlvbklucHV0LmRhaWx5RWFybmluZ3NTdW1tYXJ5QW1vdW50IS50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc29sZS5sb2coYENvdXJpZXIgQVBJIHJlcXVlc3QgT2JqZWN0OiAke0pTT04uc3RyaW5naWZ5KHJlcXVlc3REYXRhKX1gKTtcblxuICAgICAgICAgICAgcmV0dXJuIGF4aW9zLnBvc3QoYCR7Y291cmllckJhc2VVUkx9L3NlbmRgLCByZXF1ZXN0RGF0YSwge1xuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiQXV0aG9yaXphdGlvblwiOiBgQmVhcmVyICR7bm90aWZpY2F0aW9uQXV0aFRva2VufWBcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDE1MDAwLCAvLyBpbiBtaWxsaXNlY29uZHMgaGVyZVxuICAgICAgICAgICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2U6ICdDb3VyaWVyIEFQSSB0aW1lZCBvdXQgYWZ0ZXIgMTUwMDBtcyEnXG4gICAgICAgICAgICB9KS50aGVuKHNlbmRNb2JpbGVQdXNoUmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShzZW5kTW9iaWxlUHVzaFJlc3BvbnNlLmRhdGEpfWApO1xuXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogaWYgd2UgcmVhY2hlZCB0aGlzLCB0aGVuIHdlIGFzc3VtZSB0aGF0IGEgMnh4IHJlc3BvbnNlIGNvZGUgd2FzIHJldHVybmVkLlxuICAgICAgICAgICAgICAgICAqIGNoZWNrIHRoZSBjb250ZW50cyBvZiB0aGUgcmVzcG9uc2UsIGFuZCBhY3QgYXBwcm9wcmlhdGVseS5cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBpZiAoc2VuZE1vYmlsZVB1c2hSZXNwb25zZS5kYXRhICYmIHNlbmRNb2JpbGVQdXNoUmVzcG9uc2UuZGF0YVtcInJlcXVlc3RJZFwiXSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdElkOiBzZW5kTW9iaWxlUHVzaFJlc3BvbnNlLmRhdGFbXCJyZXF1ZXN0SWRcIl1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBJbnZhbGlkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tICR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSFgLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvclxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvci5yZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYW5kIHRoZSBzZXJ2ZXIgcmVzcG9uZGVkIHdpdGggYSBzdGF0dXMgY29kZVxuICAgICAgICAgICAgICAgICAgICAgKiB0aGF0IGZhbGxzIG91dCBvZiB0aGUgcmFuZ2Ugb2YgMnh4LlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vbiAyeHh4IHJlc3BvbnNlIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBDb3VyaWVyIEFQSSwgd2l0aCBzdGF0dXMgJHtlcnJvci5yZXNwb25zZS5zdGF0dXN9LCBhbmQgcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShlcnJvci5yZXNwb25zZS5kYXRhKX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGFueSBvdGhlciBzcGVjaWZpYyBlcnJvcnMgdG8gYmUgZmlsdGVyZWQgYmVsb3dcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3IucmVxdWVzdCkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYnV0IG5vIHJlc3BvbnNlIHdhcyByZWNlaXZlZFxuICAgICAgICAgICAgICAgICAgICAgKiBgZXJyb3IucmVxdWVzdGAgaXMgYW4gaW5zdGFuY2Ugb2YgWE1MSHR0cFJlcXVlc3QgaW4gdGhlIGJyb3dzZXIgYW5kIGFuIGluc3RhbmNlIG9mXG4gICAgICAgICAgICAgICAgICAgICAqICBodHRwLkNsaWVudFJlcXVlc3QgaW4gbm9kZS5qcy5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBObyByZXNwb25zZSByZWNlaXZlZCB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gQ291cmllciBBUEksIGZvciByZXF1ZXN0ICR7ZXJyb3IucmVxdWVzdH1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBTb21ldGhpbmcgaGFwcGVuZWQgaW4gc2V0dGluZyB1cCB0aGUgcmVxdWVzdCB0aGF0IHRyaWdnZXJlZCBhbiBFcnJvclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IGZvciB0aGUgJHtlbmRwb2ludEluZm99IENvdXJpZXIgQVBJLCAkeyhlcnJvciAmJiBlcnJvci5tZXNzYWdlKSAmJiBlcnJvci5tZXNzYWdlfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGluaXRpYXRpbmcgdGhlIG1vYmlsZSBwdXNoIG5vdGlmaWNhdGlvbiBzZW5kaW5nIHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJ9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHVzZWQgdG8gc2VuZCBhbiBlbWFpbCBub3RpZmljYXRpb24uXG4gICAgICpcbiAgICAgKiBAcGFyYW0gc2VuZEVtYWlsTm90aWZpY2F0aW9uSW5wdXQgdGhlIG5vdGlmaWNhdGlvbiBpbnB1dCBkZXRhaWxzIHRvIGJlIHBhc3NlZCBpbiwgaW4gb3JkZXIgdG8gc2VuZFxuICAgICAqIGFuIGVtYWlsIG5vdGlmaWNhdGlvblxuICAgICAqIEBwYXJhbSBub3RpZmljYXRpb25UeXBlIHRoZSB0eXBlIG9mIG5vdGlmaWNhdGlvbiB0byBzZW5kIGVtYWlsIG5vdGlmaWNhdGlvbnMgZm9yXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBhIHtAbGluayBOb3RpZmljYXRpb25SZXNwb25zZX0gcmVwcmVzZW50aW5nIHRoZSBDb3VyaWVyIG5vdGlmaWNhdGlvbiByZXNwb25zZVxuICAgICAqL1xuICAgIGFzeW5jIHNlbmRFbWFpbE5vdGlmaWNhdGlvbihzZW5kRW1haWxOb3RpZmljYXRpb25JbnB1dDogU2VuZEVtYWlsTm90aWZpY2F0aW9uSW5wdXQsIG5vdGlmaWNhdGlvblR5cGU6IE5vdGlmaWNhdGlvblR5cGUpOiBQcm9taXNlPE5vdGlmaWNhdGlvblJlc3BvbnNlPiB7XG4gICAgICAgIC8vIGVhc2lseSBpZGVudGlmaWFibGUgQVBJIGVuZHBvaW50IGluZm9ybWF0aW9uXG4gICAgICAgIGNvbnN0IGVuZHBvaW50SW5mbyA9ICdQT1NUIC9zZW5kIGVtYWlsIENvdXJpZXIgQVBJJztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIEFQSSBLZXkgYW5kIEJhc2UgVVJMLCBuZWVkZWQgaW4gb3JkZXIgdG8gbWFrZSB0aGUgUE9TVCBzZW5kIGVtYWlsIG5vdGlmaWNhdGlvbiB0aHJvdWdoIHRoZSBjbGllbnRcbiAgICAgICAgICAgIGNvbnN0IFtjb3VyaWVyQmFzZVVSTCwgbm90aWZpY2F0aW9uQXV0aFRva2VuLCBub3RpZmljYXRpb25UZW1wbGF0ZUlkXSA9IGF3YWl0IHN1cGVyLnJldHJpZXZlU2VydmljZUNyZWRlbnRpYWxzKENvbnN0YW50cy5BV1NQYWlyQ29uc3RhbnRzLkNPVVJJRVJfSU5URVJOQUxfU0VDUkVUX05BTUUsXG4gICAgICAgICAgICAgICAgdW5kZWZpbmVkLCBub3RpZmljYXRpb25UeXBlLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgTm90aWZpY2F0aW9uQ2hhbm5lbFR5cGUuRW1haWwpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgd2Ugb2J0YWluZWQgYW55IGludmFsaWQgc2VjcmV0IHZhbHVlcyBmcm9tIHRoZSBjYWxsIGFib3ZlXG4gICAgICAgICAgICBpZiAoY291cmllckJhc2VVUkwgPT09IG51bGwgfHwgY291cmllckJhc2VVUkwubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uQXV0aFRva2VuID09PSBudWxsIHx8IG5vdGlmaWNhdGlvbkF1dGhUb2tlbi5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25UZW1wbGF0ZUlkID09PSBudWxsIHx8IG5vdGlmaWNhdGlvblRlbXBsYXRlSWQhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IFwiSW52YWxpZCBTZWNyZXRzIG9idGFpbmVkIGZvciBDb3VyaWVyIEFQSSBjYWxsIVwiO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogUE9TVCAvc2VuZFxuICAgICAgICAgICAgICogQGxpbmsgaHR0cHM6Ly93d3cuY291cmllci5jb20vZG9jcy9yZWZlcmVuY2Uvc2VuZC9tZXNzYWdlL1xuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIGJ1aWxkIHRoZSBDb3VyaWVyIEFQSSByZXF1ZXN0IGJvZHkgdG8gYmUgcGFzc2VkIGluLCBhbmQgcGVyZm9ybSBhIFBPU1QgdG8gaXQgd2l0aCB0aGUgYXBwcm9wcmlhdGUgaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAqIHdlIGltcGx5IHRoYXQgaWYgdGhlIEFQSSBkb2VzIG5vdCByZXNwb25kIGluIDE1IHNlY29uZHMsIHRoZW4gd2UgYXV0b21hdGljYWxseSBjYXRjaCB0aGF0LCBhbmQgcmV0dXJuIGFuXG4gICAgICAgICAgICAgKiBlcnJvciBmb3IgYSBiZXR0ZXIgY3VzdG9tZXIgZXhwZXJpZW5jZS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgY29uc3QgcmVxdWVzdERhdGEgPSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZToge1xuICAgICAgICAgICAgICAgICAgICB0bzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgZW1haWw6IHNlbmRFbWFpbE5vdGlmaWNhdGlvbklucHV0LmVtYWlsRGVzdGluYXRpb25cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IG5vdGlmaWNhdGlvblRlbXBsYXRlSWQsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bGxOYW1lOiBzZW5kRW1haWxOb3RpZmljYXRpb25JbnB1dC51c2VyRnVsbE5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi4oc2VuZEVtYWlsTm90aWZpY2F0aW9uSW5wdXQudHJhbnNhY3Rpb25zICE9PSB1bmRlZmluZWQgJiYgc2VuZEVtYWlsTm90aWZpY2F0aW9uSW5wdXQudHJhbnNhY3Rpb25zICE9PSBudWxsICYmIHNlbmRFbWFpbE5vdGlmaWNhdGlvbklucHV0LnRyYW5zYWN0aW9ucy5sZW5ndGggIT09IDAgJiYge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uczogc2VuZEVtYWlsTm90aWZpY2F0aW9uSW5wdXQudHJhbnNhY3Rpb25zIVxuICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi4oc2VuZEVtYWlsTm90aWZpY2F0aW9uSW5wdXQuZGFpbHlFYXJuaW5nc1N1bW1hcnlBbW91bnQgIT09IHVuZGVmaW5lZCAmJiBzZW5kRW1haWxOb3RpZmljYXRpb25JbnB1dC5kYWlseUVhcm5pbmdzU3VtbWFyeUFtb3VudCAhPT0gbnVsbCAmJiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGFpbHlFYXJuaW5nc1N1bW1hcnlBbW91bnQ6IHNlbmRFbWFpbE5vdGlmaWNhdGlvbklucHV0LmRhaWx5RWFybmluZ3NTdW1tYXJ5QW1vdW50IVxuICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc29sZS5sb2coYENvdXJpZXIgQVBJIHJlcXVlc3QgT2JqZWN0OiAke0pTT04uc3RyaW5naWZ5KHJlcXVlc3REYXRhKX1gKTtcblxuICAgICAgICAgICAgcmV0dXJuIGF4aW9zLnBvc3QoYCR7Y291cmllckJhc2VVUkx9L3NlbmRgLCByZXF1ZXN0RGF0YSwge1xuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiQXV0aG9yaXphdGlvblwiOiBgQmVhcmVyICR7bm90aWZpY2F0aW9uQXV0aFRva2VufWBcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDE1MDAwLCAvLyBpbiBtaWxsaXNlY29uZHMgaGVyZVxuICAgICAgICAgICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2U6ICdDb3VyaWVyIEFQSSB0aW1lZCBvdXQgYWZ0ZXIgMTUwMDBtcyEnXG4gICAgICAgICAgICB9KS50aGVuKHNlbmRFbWFpbFJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlbmRwb2ludEluZm99IHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoc2VuZEVtYWlsUmVzcG9uc2UuZGF0YSl9YCk7XG5cbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiBpZiB3ZSByZWFjaGVkIHRoaXMsIHRoZW4gd2UgYXNzdW1lIHRoYXQgYSAyeHggcmVzcG9uc2UgY29kZSB3YXMgcmV0dXJuZWQuXG4gICAgICAgICAgICAgICAgICogY2hlY2sgdGhlIGNvbnRlbnRzIG9mIHRoZSByZXNwb25zZSwgYW5kIGFjdCBhcHByb3ByaWF0ZWx5LlxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGlmIChzZW5kRW1haWxSZXNwb25zZS5kYXRhICYmIHNlbmRFbWFpbFJlc3BvbnNlLmRhdGFbXCJyZXF1ZXN0SWRcIl0pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVlc3RJZDogc2VuZEVtYWlsUmVzcG9uc2UuZGF0YVtcInJlcXVlc3RJZFwiXVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogYEludmFsaWQgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gJHtlbmRwb2ludEluZm99IHJlc3BvbnNlIWAsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yLnJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBhbmQgdGhlIHNlcnZlciByZXNwb25kZWQgd2l0aCBhIHN0YXR1cyBjb2RlXG4gICAgICAgICAgICAgICAgICAgICAqIHRoYXQgZmFsbHMgb3V0IG9mIHRoZSByYW5nZSBvZiAyeHguXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm9uIDJ4eHggcmVzcG9uc2Ugd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IENvdXJpZXIgQVBJLCB3aXRoIHN0YXR1cyAke2Vycm9yLnJlc3BvbnNlLnN0YXR1c30sIGFuZCByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGVycm9yLnJlc3BvbnNlLmRhdGEpfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gYW55IG90aGVyIHNwZWNpZmljIGVycm9ycyB0byBiZSBmaWx0ZXJlZCBiZWxvd1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5yZXF1ZXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBidXQgbm8gcmVzcG9uc2Ugd2FzIHJlY2VpdmVkXG4gICAgICAgICAgICAgICAgICAgICAqIGBlcnJvci5yZXF1ZXN0YCBpcyBhbiBpbnN0YW5jZSBvZiBYTUxIdHRwUmVxdWVzdCBpbiB0aGUgYnJvd3NlciBhbmQgYW4gaW5zdGFuY2Ugb2ZcbiAgICAgICAgICAgICAgICAgICAgICogIGh0dHAuQ2xpZW50UmVxdWVzdCBpbiBub2RlLmpzLlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vIHJlc3BvbnNlIHJlY2VpdmVkIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBDb3VyaWVyIEFQSSwgZm9yIHJlcXVlc3QgJHtlcnJvci5yZXF1ZXN0fWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNvbWV0aGluZyBoYXBwZW5lZCBpbiBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IHRoYXQgdHJpZ2dlcmVkIGFuIEVycm9yXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgZm9yIHRoZSAke2VuZHBvaW50SW5mb30gQ291cmllciBBUEksICR7KGVycm9yICYmIGVycm9yLm1lc3NhZ2UpICYmIGVycm9yLm1lc3NhZ2V9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgaW5pdGlhdGluZyB0aGUgZW1haWwgbm90aWZpY2F0aW9uIHNlbmRpbmcgdGhyb3VnaCAke2VuZHBvaW50SW5mb31gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfSAke2Vycn1gKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdXNlZCB0byBzZW5kIGEgYnVsayBtb2JpbGUgcHVzaCBub3RpZmljYXRpb24uXG4gICAgICpcbiAgICAgKiBAcGFyYW0gc2VuZEJ1bGtNb2JpbGVQdXNoTm90aWZpY2F0aW9uSW5wdXQgdGhlIG5vdGlmaWNhdGlvbiBpbnB1dCBkZXRhaWxzIHRvIGJlIHBhc3NlZCBpbiwgaW4gb3JkZXIgdG8gc2VuZFxuICAgICAqIGEgYnVsayBtb2JpbGUgcHVzaCBub3RpZmljYXRpb25cbiAgICAgKiBAcGFyYW0gbm90aWZpY2F0aW9uVHlwZSB0aGUgdHlwZSBvZiBub3RpZmljYXRpb24gdG8gc2VuZCBlbWFpbCBub3RpZmljYXRpb25zIGZvclxuICAgICAqXG4gICAgICogQHJldHVybnMgYSB7QGxpbmsgTm90aWZpY2F0aW9uUmVzcG9uc2V9IHJlcHJlc2VudGluZyB0aGUgQ291cmllciBub3RpZmljYXRpb24gcmVzcG9uc2VcbiAgICAgKi9cbiAgICBhc3luYyBzZW5kQnVsa01vYmlsZVB1c2hOb3RpZmljYXRpb24oc2VuZEJ1bGtNb2JpbGVQdXNoTm90aWZpY2F0aW9uSW5wdXQ6IFNlbmRCdWxrTW9iaWxlUHVzaE5vdGlmaWNhdGlvbklucHV0LCBub3RpZmljYXRpb25UeXBlOiBOb3RpZmljYXRpb25UeXBlKTogUHJvbWlzZTxOb3RpZmljYXRpb25SZXNwb25zZT4ge1xuICAgICAgICAvLyBlYXNpbHkgaWRlbnRpZmlhYmxlIEFQSSBlbmRwb2ludCBpbmZvcm1hdGlvblxuICAgICAgICBjb25zdCBlbmRwb2ludEluZm8gPSAnUE9TVCAvc2VuZCBCVUxLIG1vYmlsZSBwdXNoIENvdXJpZXIgQVBJJztcblxuICAgICAgICAvKipcbiAgICAgICAgICogU2VuZGluZyBhIGJ1bGsgbm90aWZpY2F0aW9uIGNvbnNpc3RzIG9mIHRoZSBmb2xsb3dpbmcgc3RlcHM6XG4gICAgICAgICAqXG4gICAgICAgICAqIDEpIENyZWF0ZSBhIGJ1bGsgam9iIGFuZCBvYnRhaW5pbmcgaXRzIGpvYiBpZCBmcm9tIHRoZSByZXNwb25zZS5cbiAgICAgICAgICogMikgVXNlIHRoYXQgYnVsayBqb2IgdG8gYWRkIGFsbCBhcHBsaWNhYmxlIHVzZXJzIHRvIGl0LlxuICAgICAgICAgKiAzKSBTY2hlZHVsZS9zdGFydCB0aGF0IGpvYi5cbiAgICAgICAgICovXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyAxKSBDcmVhdGUgYSBidWxrIGpvYiBhbmQgb2J0YWluaW5nIGl0cyBqb2IgaWQgZnJvbSB0aGUgcmVzcG9uc2UuXG4gICAgICAgICAgICBjb25zdCBidWxrTm90aWZpY2F0aW9uSm9iSWQgPSBhd2FpdCB0aGlzLmNyZWF0ZUJ1bGtOb3RpZmljYXRpb25Kb2Iobm90aWZpY2F0aW9uVHlwZSwgTm90aWZpY2F0aW9uQ2hhbm5lbFR5cGUuUHVzaCk7XG4gICAgICAgICAgICAvLyBlbnN1cmUgdGhhdCB0aGUgYnVsayBqb2IgY3JlYXRpb24gc3VjY2VlZGVkXG4gICAgICAgICAgICBpZiAoYnVsa05vdGlmaWNhdGlvbkpvYklkICE9PSBudWxsICYmIGJ1bGtOb3RpZmljYXRpb25Kb2JJZC5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgICAgICAvLyAyKSBVc2UgdGhhdCBidWxrIGpvYiB0byBhZGQgYWxsIGFwcGxpY2FibGUgdXNlcnMgdG8gaXQuXG4gICAgICAgICAgICAgICAgY29uc3QgYnVsa1VzZXJzSW5nZXN0aW9uRmxhZyA9IGF3YWl0IHRoaXMuaW5nZXN0QnVsa0pvYlVzZXJzRm9yTW9iaWxlUHVzaChidWxrTm90aWZpY2F0aW9uSm9iSWQsIG5vdGlmaWNhdGlvblR5cGUsIE5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlLlB1c2gsIHNlbmRCdWxrTW9iaWxlUHVzaE5vdGlmaWNhdGlvbklucHV0KTtcbiAgICAgICAgICAgICAgICAvLyBlbnN1cmUgdGhhdCB0aGUgdXNlcnMgaW5nZXN0aW9uIHdhcyBzdWNjZXNzZnVsXG4gICAgICAgICAgICAgICAgaWYgKGJ1bGtVc2Vyc0luZ2VzdGlvbkZsYWcpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gMykgU2NoZWR1bGUvc3RhcnQgdGhhdCBqb2IuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGJ1bGtKb2JSdW5GbGFnID0gYXdhaXQgdGhpcy5ydW5CdWxrTm90aWZpY2F0aW9uSm9iKGJ1bGtOb3RpZmljYXRpb25Kb2JJZCwgbm90aWZpY2F0aW9uVHlwZSwgTm90aWZpY2F0aW9uQ2hhbm5lbFR5cGUuUHVzaCk7XG4gICAgICAgICAgICAgICAgICAgIC8vIGVuc3VyZSB0aGF0IHRoZSBidWxrIGpvYiByYW4gc3VjY2Vzc2Z1bGx5XG4gICAgICAgICAgICAgICAgICAgIGlmIChidWxrSm9iUnVuRmxhZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBqb2IgaWRcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdElkOiBidWxrTm90aWZpY2F0aW9uSm9iSWQhXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBydW5uaW5nL3NjaGVkdWxpbmcgdGhlIGJ1bGsgam9iIGZvciBtb2JpbGUgcHVzaCBub3RpZmljYXRpb25zIHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGluZ2VzdGluZyB1c2VycyBmb3IgdGhlIGJ1bGsgam9iIGZvciBtb2JpbGUgcHVzaCBub3RpZmljYXRpb25zIHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBjcmVhdGluZyB0aGUgYnVsayBqb2IgZm9yIG1vYmlsZSBwdXNoIG5vdGlmaWNhdGlvbnMgdGhyb3VnaCAke2VuZHBvaW50SW5mb31gO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgaW5pdGlhdGluZyB0aGUgYnVsayBtb2JpbGUgcHVzaCBub3RpZmljYXRpb24gc2VuZGluZyB0aHJvdWdoICR7ZW5kcG9pbnRJbmZvfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9ICR7ZXJyfWApO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB1c2VkIHRvIHNlbmQgYSBidWxrIGVtYWlsIG5vdGlmaWNhdGlvbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBzZW5kQnVsa0VtYWlsTm90aWZpY2F0aW9uSW5wdXQgdGhlIG5vdGlmaWNhdGlvbiBpbnB1dCBkZXRhaWxzIHRvIGJlIHBhc3NlZCBpbiwgaW4gb3JkZXIgdG8gc2VuZFxuICAgICAqIGEgYnVsayBlbWFpbCBub3RpZmljYXRpb25cbiAgICAgKiBAcGFyYW0gbm90aWZpY2F0aW9uVHlwZSB0aGUgdHlwZSBvZiBub3RpZmljYXRpb24gdG8gc2VuZCBlbWFpbCBub3RpZmljYXRpb25zIGZvclxuICAgICAqXG4gICAgICogQHJldHVybnMgYSB7QGxpbmsgTm90aWZpY2F0aW9uUmVzcG9uc2V9IHJlcHJlc2VudGluZyB0aGUgQ291cmllciBub3RpZmljYXRpb24gcmVzcG9uc2VcbiAgICAgKi9cbiAgICBhc3luYyBzZW5kQnVsa0VtYWlsTm90aWZpY2F0aW9uKHNlbmRCdWxrRW1haWxOb3RpZmljYXRpb25JbnB1dDogU2VuZEJ1bGtFbWFpbE5vdGlmaWNhdGlvbklucHV0LCBub3RpZmljYXRpb25UeXBlOiBOb3RpZmljYXRpb25UeXBlKTogUHJvbWlzZTxOb3RpZmljYXRpb25SZXNwb25zZT4ge1xuICAgICAgICAvLyBlYXNpbHkgaWRlbnRpZmlhYmxlIEFQSSBlbmRwb2ludCBpbmZvcm1hdGlvblxuICAgICAgICBjb25zdCBlbmRwb2ludEluZm8gPSAnUE9TVCAvc2VuZCBCVUxLIGVtYWlsIENvdXJpZXIgQVBJJztcblxuICAgICAgICAvKipcbiAgICAgICAgICogU2VuZGluZyBhIGJ1bGsgbm90aWZpY2F0aW9uIGNvbnNpc3RzIG9mIHRoZSBmb2xsb3dpbmcgc3RlcHM6XG4gICAgICAgICAqXG4gICAgICAgICAqIDEpIENyZWF0ZSBhIGJ1bGsgam9iIGFuZCBvYnRhaW5pbmcgaXRzIGpvYiBpZCBmcm9tIHRoZSByZXNwb25zZS5cbiAgICAgICAgICogMikgVXNlIHRoYXQgYnVsayBqb2IgdG8gYWRkIGFsbCBhcHBsaWNhYmxlIHVzZXJzIHRvIGl0LlxuICAgICAgICAgKiAzKSBTY2hlZHVsZS9zdGFydCB0aGF0IGpvYi5cbiAgICAgICAgICovXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyAxKSBDcmVhdGUgYSBidWxrIGpvYiBhbmQgb2J0YWluaW5nIGl0cyBqb2IgaWQgZnJvbSB0aGUgcmVzcG9uc2UuXG4gICAgICAgICAgICBjb25zdCBidWxrTm90aWZpY2F0aW9uSm9iSWQgPSBhd2FpdCB0aGlzLmNyZWF0ZUJ1bGtOb3RpZmljYXRpb25Kb2Iobm90aWZpY2F0aW9uVHlwZSwgTm90aWZpY2F0aW9uQ2hhbm5lbFR5cGUuRW1haWwpO1xuICAgICAgICAgICAgLy8gZW5zdXJlIHRoYXQgdGhlIGJ1bGsgam9iIGNyZWF0aW9uIHN1Y2NlZWRlZFxuICAgICAgICAgICAgaWYgKGJ1bGtOb3RpZmljYXRpb25Kb2JJZCAhPT0gbnVsbCAmJiBidWxrTm90aWZpY2F0aW9uSm9iSWQubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgLy8gMikgVXNlIHRoYXQgYnVsayBqb2IgdG8gYWRkIGFsbCBhcHBsaWNhYmxlIHVzZXJzIHRvIGl0LlxuICAgICAgICAgICAgICAgIGNvbnN0IGJ1bGtVc2Vyc0luZ2VzdGlvbkZsYWcgPSBhd2FpdCB0aGlzLmluZ2VzdEJ1bGtKb2JVc2Vyc0ZvckVtYWlsKGJ1bGtOb3RpZmljYXRpb25Kb2JJZCwgbm90aWZpY2F0aW9uVHlwZSwgTm90aWZpY2F0aW9uQ2hhbm5lbFR5cGUuRW1haWwsIHNlbmRCdWxrRW1haWxOb3RpZmljYXRpb25JbnB1dCk7XG4gICAgICAgICAgICAgICAgLy8gZW5zdXJlIHRoYXQgdGhlIHVzZXJzIGluZ2VzdGlvbiB3YXMgc3VjY2Vzc2Z1bFxuICAgICAgICAgICAgICAgIGlmIChidWxrVXNlcnNJbmdlc3Rpb25GbGFnKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIDMpIFNjaGVkdWxlL3N0YXJ0IHRoYXQgam9iLlxuICAgICAgICAgICAgICAgICAgICBjb25zdCBidWxrSm9iUnVuRmxhZyA9IGF3YWl0IHRoaXMucnVuQnVsa05vdGlmaWNhdGlvbkpvYihidWxrTm90aWZpY2F0aW9uSm9iSWQsIG5vdGlmaWNhdGlvblR5cGUsIE5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlLkVtYWlsKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gZW5zdXJlIHRoYXQgdGhlIGJ1bGsgam9iIHJhbiBzdWNjZXNzZnVsbHlcbiAgICAgICAgICAgICAgICAgICAgaWYgKGJ1bGtKb2JSdW5GbGFnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIGpvYiBpZFxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0SWQ6IGJ1bGtOb3RpZmljYXRpb25Kb2JJZCFcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHJ1bm5pbmcvc2NoZWR1bGluZyB0aGUgYnVsayBqb2IgZm9yIGVtYWlsIG5vdGlmaWNhdGlvbnMgdGhyb3VnaCAke2VuZHBvaW50SW5mb31gO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgaW5nZXN0aW5nIHVzZXJzIGZvciB0aGUgYnVsayBqb2IgZm9yIGVtYWlsIG5vdGlmaWNhdGlvbnMgdGhyb3VnaCAke2VuZHBvaW50SW5mb31gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGNyZWF0aW5nIHRoZSBidWxrIGpvYiBmb3IgZW1haWwgbm90aWZpY2F0aW9ucyB0aHJvdWdoICR7ZW5kcG9pbnRJbmZvfWA7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBpbml0aWF0aW5nIHRoZSBidWxrIGVtYWlsIG5vdGlmaWNhdGlvbiBzZW5kaW5nIHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJ9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHVzZWQgdG8gc3RhcnQvc2NoZWR1bGUgYSBidWxrIGpvYi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBqb2JJZCB0aGUgaWQgb2YgdGhlIGpvYiB0byBzdGFydC9zY2hlZHVsaW5nIGZvciBydW5uaW5nXG4gICAgICogQHBhcmFtIG5vdGlmaWNhdGlvblR5cGUgbm90aWZpY2F0aW9uIHR5cGUgdG8gc3RhcnQgdGhlIGpvYiBmb3JcbiAgICAgKiBAcGFyYW0gbm90aWZpY2F0aW9uQ2hhbm5lbFR5cGUgdGhlIHR5cGUgb2Ygbm90aWZpY2F0aW9uIGNoYW5uZWxcbiAgICAgKlxuICAgICAqIEByZXR1cm4gYSB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIGJvb2xlYW59IGRlcGVuZGluZyBvbiB3aGV0aGVyIHRoZSBqb2IgcnVuIHdhcyBzdWNjZXNzZnVsIG9yIG5vdC5cbiAgICAgKi9cbiAgICBhc3luYyBydW5CdWxrTm90aWZpY2F0aW9uSm9iKGpvYklkOiBzdHJpbmcsIG5vdGlmaWNhdGlvblR5cGU6IE5vdGlmaWNhdGlvblR5cGUsIG5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlOiBOb3RpZmljYXRpb25DaGFubmVsVHlwZSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgICAvLyBlYXNpbHkgaWRlbnRpZmlhYmxlIEFQSSBlbmRwb2ludCBpbmZvcm1hdGlvblxuICAgICAgICBjb25zdCBlbmRwb2ludEluZm8gPSAnUE9TVCAvYnVsay97am9iSWR9L3J1biBDb3VyaWVyIEFQSSc7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBBUEkgS2V5IGFuZCBCYXNlIFVSTCwgbmVlZGVkIGluIG9yZGVyIHRvIG1ha2UgdGhlIFBPU1Qgc2VuZCBlbWFpbCBub3RpZmljYXRpb24gdGhyb3VnaCB0aGUgY2xpZW50XG4gICAgICAgICAgICBjb25zdCBbY291cmllckJhc2VVUkwsIG5vdGlmaWNhdGlvbkF1dGhUb2tlbiwgbm90aWZpY2F0aW9uVGVtcGxhdGVJZF0gPSBhd2FpdCBzdXBlci5yZXRyaWV2ZVNlcnZpY2VDcmVkZW50aWFscyhDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5DT1VSSUVSX0lOVEVSTkFMX1NFQ1JFVF9OQU1FLFxuICAgICAgICAgICAgICAgIHVuZGVmaW5lZCwgbm90aWZpY2F0aW9uVHlwZSwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIG5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlKTtcblxuICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHdlIG9idGFpbmVkIGFueSBpbnZhbGlkIHNlY3JldCB2YWx1ZXMgZnJvbSB0aGUgY2FsbCBhYm92ZVxuICAgICAgICAgICAgaWYgKGNvdXJpZXJCYXNlVVJMID09PSBudWxsIHx8IGNvdXJpZXJCYXNlVVJMLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbkF1dGhUb2tlbiA9PT0gbnVsbCB8fCBub3RpZmljYXRpb25BdXRoVG9rZW4ubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uVGVtcGxhdGVJZCA9PT0gbnVsbCB8fCBub3RpZmljYXRpb25UZW1wbGF0ZUlkIS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBcIkludmFsaWQgU2VjcmV0cyBvYnRhaW5lZCBmb3IgQ291cmllciBBUEkgY2FsbCFcIjtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFBPU1QgL2J1bGsve2pvYklkfS9ydW5cbiAgICAgICAgICAgICAqIEBsaW5rIGh0dHBzOi8vd3d3LmNvdXJpZXIuY29tL2RvY3MvdHV0b3JpYWxzL2hvdy10by1zZW5kLWJ1bGstbm90aWZpY2F0aW9ucy9cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBidWlsZCB0aGUgQ291cmllciBBUEkgcmVxdWVzdCBib2R5IHRvIGJlIHBhc3NlZCBpbiwgYW5kIHBlcmZvcm0gYSBQT1NUIHRvIGl0IHdpdGggdGhlIGFwcHJvcHJpYXRlIGluZm9ybWF0aW9uXG4gICAgICAgICAgICAgKiB3ZSBpbXBseSB0aGF0IGlmIHRoZSBBUEkgZG9lcyBub3QgcmVzcG9uZCBpbiAxNSBzZWNvbmRzLCB0aGVuIHdlIGF1dG9tYXRpY2FsbHkgY2F0Y2ggdGhhdCwgYW5kIHJldHVybiBhblxuICAgICAgICAgICAgICogZXJyb3IgZm9yIGEgYmV0dGVyIGN1c3RvbWVyIGV4cGVyaWVuY2UuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHJldHVybiBheGlvcy5wb3N0KGAke2NvdXJpZXJCYXNlVVJMfS9idWxrLyR7am9iSWR9L3J1bmAsIHt9LCB7XG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAgICAgXCJBdXRob3JpemF0aW9uXCI6IGBCZWFyZXIgJHtub3RpZmljYXRpb25BdXRoVG9rZW59YFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGltZW91dDogMTUwMDAsIC8vIGluIG1pbGxpc2Vjb25kcyBoZXJlXG4gICAgICAgICAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZTogJ0NvdXJpZXIgQVBJIHRpbWVkIG91dCBhZnRlciAxNTAwMG1zISdcbiAgICAgICAgICAgIH0pLnRoZW4oc3RhcnRCdWxrSm9iTm90aWZpY2F0aW9uUmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShzdGFydEJ1bGtKb2JOb3RpZmljYXRpb25SZXNwb25zZS5kYXRhKX1gKTtcblxuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIGlmIHdlIHJlYWNoZWQgdGhpcywgdGhlbiB3ZSBhc3N1bWUgdGhhdCBhIDJ4eCByZXNwb25zZSBjb2RlIHdhcyByZXR1cm5lZC5cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0pLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IucmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGFuZCB0aGUgc2VydmVyIHJlc3BvbmRlZCB3aXRoIGEgc3RhdHVzIGNvZGVcbiAgICAgICAgICAgICAgICAgICAgICogdGhhdCBmYWxscyBvdXQgb2YgdGhlIHJhbmdlIG9mIDJ4eC5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBOb24gMnh4eCByZXNwb25zZSB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gQ291cmllciBBUEksIHdpdGggc3RhdHVzICR7ZXJyb3IucmVzcG9uc2Uuc3RhdHVzfSwgYW5kIHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZXJyb3IucmVzcG9uc2UuZGF0YSl9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBhbnkgb3RoZXIgc3BlY2lmaWMgZXJyb3JzIHRvIGJlIGZpbHRlcmVkIGJlbG93XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVycm9yLnJlcXVlc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGJ1dCBubyByZXNwb25zZSB3YXMgcmVjZWl2ZWRcbiAgICAgICAgICAgICAgICAgICAgICogYGVycm9yLnJlcXVlc3RgIGlzIGFuIGluc3RhbmNlIG9mIFhNTEh0dHBSZXF1ZXN0IGluIHRoZSBicm93c2VyIGFuZCBhbiBpbnN0YW5jZSBvZlxuICAgICAgICAgICAgICAgICAgICAgKiAgaHR0cC5DbGllbnRSZXF1ZXN0IGluIG5vZGUuanMuXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm8gcmVzcG9uc2UgcmVjZWl2ZWQgd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IENvdXJpZXIgQVBJLCBmb3IgcmVxdWVzdCAke2Vycm9yLnJlcXVlc3R9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU29tZXRoaW5nIGhhcHBlbmVkIGluIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgdGhhdCB0cmlnZ2VyZWQgYW4gRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgc2V0dGluZyB1cCB0aGUgcmVxdWVzdCBmb3IgdGhlICR7ZW5kcG9pbnRJbmZvfSBDb3VyaWVyIEFQSSwgJHsoZXJyb3IgJiYgZXJyb3IubWVzc2FnZSkgJiYgZXJyb3IubWVzc2FnZX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBpbml0aWF0aW5nIHRoZSBidWxrIGpvYiBydW4gdGhyb3VnaCAke2VuZHBvaW50SW5mb31gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfSAke2Vycn1gKTtcblxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdXNlZCB0byBpbmdlc3QgdXNlcnMgZm9yIGEgbW9iaWxlLXB1c2ggYmFzZWQgYnVsayBqb2IgbmVlZGluZyB0byBiZSBydW4uXG4gICAgICpcbiAgICAgKiBAcGFyYW0gam9iSWQgdGhlIGlkIG9mIHRoZSBqb2Igd2hpY2ggd2UgYXJlIGluZ2VzdGluZyB0aGUgdXNlcnMgZm9yXG4gICAgICogQHBhcmFtIG5vdGlmaWNhdGlvblR5cGUgdGhlIHR5cGUgb2Ygbm90aWZpY2F0aW9uIGZvciB3aGljaCB3ZSBhcmUgaW5nZXN0aW5nIHVzZXJzIGZvclxuICAgICAqIEBwYXJhbSBub3RpZmljYXRpb25DaGFubmVsVHlwZSB0aGUgdHlwZSBvZiBub3RpZmljYXRpb24gY2hhbm5lbFxuICAgICAqIEBwYXJhbSBzZW5kQnVsa01vYmlsZVB1c2hOb3RpZmljYXRpb25JbnB1dCB0aGUgYnVsayBtb2JpbGUgcHVzaCBpbnB1dCwgdXNlZCB0byBpbmdlc3QgdXNlcnNcbiAgICAgKlxuICAgICAqIEByZXR1cm4gYSB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIGJvb2xlYW59IHJlcHJlc2VudGluZyBhIGZsYWcgdG8gaGlnaGxpZ2h0IHdoZXRoZXIgdGhlXG4gICAgICogdXNlciBpbmdlc3Rpb24gYWN0aXZpdHkgd2FzIHN1Y2Nlc3NmdWwgb3Igbm90LlxuICAgICAqL1xuICAgIGFzeW5jIGluZ2VzdEJ1bGtKb2JVc2Vyc0Zvck1vYmlsZVB1c2goam9iSWQ6IHN0cmluZywgbm90aWZpY2F0aW9uVHlwZTogTm90aWZpY2F0aW9uVHlwZSwgbm90aWZpY2F0aW9uQ2hhbm5lbFR5cGU6IE5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VuZEJ1bGtNb2JpbGVQdXNoTm90aWZpY2F0aW9uSW5wdXQ6IFNlbmRCdWxrTW9iaWxlUHVzaE5vdGlmaWNhdGlvbklucHV0KTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIC8vIGVhc2lseSBpZGVudGlmaWFibGUgQVBJIGVuZHBvaW50IGluZm9ybWF0aW9uXG4gICAgICAgIGNvbnN0IGVuZHBvaW50SW5mbyA9ICdQT1NUIC9idWxrL3tqb2JJZH0gbW9iaWxlIHB1c2ggQ291cmllciBBUEknO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgQVBJIEtleSBhbmQgQmFzZSBVUkwsIG5lZWRlZCBpbiBvcmRlciB0byBtYWtlIHRoZSBQT1NUIHNlbmQgZW1haWwgbm90aWZpY2F0aW9uIHRocm91Z2ggdGhlIGNsaWVudFxuICAgICAgICAgICAgY29uc3QgW2NvdXJpZXJCYXNlVVJMLCBub3RpZmljYXRpb25BdXRoVG9rZW4sIG5vdGlmaWNhdGlvblRlbXBsYXRlSWRdID0gYXdhaXQgc3VwZXIucmV0cmlldmVTZXJ2aWNlQ3JlZGVudGlhbHMoQ29uc3RhbnRzLkFXU1BhaXJDb25zdGFudHMuQ09VUklFUl9JTlRFUk5BTF9TRUNSRVRfTkFNRSxcbiAgICAgICAgICAgICAgICB1bmRlZmluZWQsIG5vdGlmaWNhdGlvblR5cGUsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBub3RpZmljYXRpb25DaGFubmVsVHlwZSk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB3ZSBvYnRhaW5lZCBhbnkgaW52YWxpZCBzZWNyZXQgdmFsdWVzIGZyb20gdGhlIGNhbGwgYWJvdmVcbiAgICAgICAgICAgIGlmIChjb3VyaWVyQmFzZVVSTCA9PT0gbnVsbCB8fCBjb3VyaWVyQmFzZVVSTC5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25BdXRoVG9rZW4gPT09IG51bGwgfHwgbm90aWZpY2F0aW9uQXV0aFRva2VuLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvblRlbXBsYXRlSWQgPT09IG51bGwgfHwgbm90aWZpY2F0aW9uVGVtcGxhdGVJZCEubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gXCJJbnZhbGlkIFNlY3JldHMgb2J0YWluZWQgZm9yIENvdXJpZXIgQVBJIGNhbGwhXCI7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBQT1NUIC9idWxrL3tqb2JJZH1cbiAgICAgICAgICAgICAqIEBsaW5rIGh0dHBzOi8vd3d3LmNvdXJpZXIuY29tL2RvY3MvdHV0b3JpYWxzL2hvdy10by1zZW5kLWJ1bGstbm90aWZpY2F0aW9ucy9cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBidWlsZCB0aGUgQ291cmllciBBUEkgcmVxdWVzdCBib2R5IHRvIGJlIHBhc3NlZCBpbiwgYW5kIHBlcmZvcm0gYSBQT1NUIHRvIGl0IHdpdGggdGhlIGFwcHJvcHJpYXRlIGluZm9ybWF0aW9uXG4gICAgICAgICAgICAgKiB3ZSBpbXBseSB0aGF0IGlmIHRoZSBBUEkgZG9lcyBub3QgcmVzcG9uZCBpbiAxNSBzZWNvbmRzLCB0aGVuIHdlIGF1dG9tYXRpY2FsbHkgY2F0Y2ggdGhhdCwgYW5kIHJldHVybiBhblxuICAgICAgICAgICAgICogZXJyb3IgZm9yIGEgYmV0dGVyIGN1c3RvbWVyIGV4cGVyaWVuY2UuXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogRmlyc3QgYnVpbGQgdGhlIHJlcXVlc3QgZGF0YSBmcm9tIHRoZSBidWxrIGlucHV0IHBhc3NlZCBpblxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBjb25zdCBpbmdlc3RlZFVzZXJzOiBhbnlbXSA9IFtdO1xuICAgICAgICAgICAgc2VuZEJ1bGtNb2JpbGVQdXNoTm90aWZpY2F0aW9uSW5wdXQubW9iaWxlUHVzaE5vdGlmaWNhdGlvbklucHV0cy5mb3JFYWNoKG1vYmlsZVB1c2hOb3RpZmljYXRpb25JbnB1dCA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKG1vYmlsZVB1c2hOb3RpZmljYXRpb25JbnB1dCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBpbmdlc3RlZFVzZXJzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgdG86IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHBvOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRva2VuczogbW9iaWxlUHVzaE5vdGlmaWNhdGlvbklucHV0LmV4cG9QdXNoVG9rZW5zXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLihtb2JpbGVQdXNoTm90aWZpY2F0aW9uSW5wdXQuaW5lbGlnaWJsZVRyYW5zYWN0aW9uQW1vdW50ICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2JpbGVQdXNoTm90aWZpY2F0aW9uSW5wdXQuaW5lbGlnaWJsZVRyYW5zYWN0aW9uQW1vdW50ICE9PSBudWxsICYmIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5lbGlnaWJsZVRyYW5zYWN0aW9uQW1vdW50OiBtb2JpbGVQdXNoTm90aWZpY2F0aW9uSW5wdXQuaW5lbGlnaWJsZVRyYW5zYWN0aW9uQW1vdW50IVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi4oKG1vYmlsZVB1c2hOb3RpZmljYXRpb25JbnB1dC5wZW5kaW5nQ2FzaGJhY2sgPT09IHVuZGVmaW5lZCB8fCBtb2JpbGVQdXNoTm90aWZpY2F0aW9uSW5wdXQucGVuZGluZ0Nhc2hiYWNrID09PSBudWxsKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICYmIG1vYmlsZVB1c2hOb3RpZmljYXRpb25JbnB1dC5tZXJjaGFudE5hbWUgIT09IHVuZGVmaW5lZCAmJiBtb2JpbGVQdXNoTm90aWZpY2F0aW9uSW5wdXQubWVyY2hhbnROYW1lICE9PSBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJiYgbW9iaWxlUHVzaE5vdGlmaWNhdGlvbklucHV0Lm1lcmNoYW50TmFtZS5sZW5ndGggIT09IDAgJiYge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXJjaGFudE5hbWU6IG1vYmlsZVB1c2hOb3RpZmljYXRpb25JbnB1dC5tZXJjaGFudE5hbWUhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLihtb2JpbGVQdXNoTm90aWZpY2F0aW9uSW5wdXQucGVuZGluZ0Nhc2hiYWNrICE9PSB1bmRlZmluZWQgJiYgbW9iaWxlUHVzaE5vdGlmaWNhdGlvbklucHV0LnBlbmRpbmdDYXNoYmFjayAhPT0gbnVsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICYmIG1vYmlsZVB1c2hOb3RpZmljYXRpb25JbnB1dC5tZXJjaGFudE5hbWUgIT09IHVuZGVmaW5lZCAmJiBtb2JpbGVQdXNoTm90aWZpY2F0aW9uSW5wdXQubWVyY2hhbnROYW1lICE9PSBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJiYgbW9iaWxlUHVzaE5vdGlmaWNhdGlvbklucHV0Lm1lcmNoYW50TmFtZS5sZW5ndGggIT09IDAgJiYge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwZW5kaW5nQ2FzaGJhY2s6IG1vYmlsZVB1c2hOb3RpZmljYXRpb25JbnB1dC5wZW5kaW5nQ2FzaGJhY2shLnRvU3RyaW5nKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXJjaGFudE5hbWU6IG1vYmlsZVB1c2hOb3RpZmljYXRpb25JbnB1dC5tZXJjaGFudE5hbWUhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLihtb2JpbGVQdXNoTm90aWZpY2F0aW9uSW5wdXQuZGFpbHlFYXJuaW5nc1N1bW1hcnlBbW91bnQgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vYmlsZVB1c2hOb3RpZmljYXRpb25JbnB1dC5kYWlseUVhcm5pbmdzU3VtbWFyeUFtb3VudCAhPT0gbnVsbCAmJiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhaWx5RWFybmluZ3NTdW1tYXJ5QW1vdW50OiBtb2JpbGVQdXNoTm90aWZpY2F0aW9uSW5wdXQuZGFpbHlFYXJuaW5nc1N1bW1hcnlBbW91bnQhLnRvU3RyaW5nKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29uc3QgcmVxdWVzdERhdGEgPSB7XG4gICAgICAgICAgICAgICAgdXNlcnM6IGluZ2VzdGVkVXNlcnNcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gYXhpb3MucG9zdChgJHtjb3VyaWVyQmFzZVVSTH0vYnVsay8ke2pvYklkfWAsIHJlcXVlc3REYXRhLCB7XG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAgICAgXCJBdXRob3JpemF0aW9uXCI6IGBCZWFyZXIgJHtub3RpZmljYXRpb25BdXRoVG9rZW59YFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGltZW91dDogMTUwMDAsIC8vIGluIG1pbGxpc2Vjb25kcyBoZXJlXG4gICAgICAgICAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZTogJ0NvdXJpZXIgQVBJIHRpbWVkIG91dCBhZnRlciAxNTAwMG1zISdcbiAgICAgICAgICAgIH0pLnRoZW4oaW5nZXN0QnVsa0pvYlVzZXJzRm9yTW9iaWxlUHVzaFJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlbmRwb2ludEluZm99IHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoaW5nZXN0QnVsa0pvYlVzZXJzRm9yTW9iaWxlUHVzaFJlc3BvbnNlLmRhdGEpfWApO1xuXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogaWYgd2UgcmVhY2hlZCB0aGlzLCB0aGVuIHdlIGFzc3VtZSB0aGF0IGEgMnh4IHJlc3BvbnNlIGNvZGUgd2FzIHJldHVybmVkLlxuICAgICAgICAgICAgICAgICAqIGNoZWNrIHRoZSBjb250ZW50cyBvZiB0aGUgcmVzcG9uc2UsIGFuZCBhY3QgYXBwcm9wcmlhdGVseS5cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBpZiAoaW5nZXN0QnVsa0pvYlVzZXJzRm9yTW9iaWxlUHVzaFJlc3BvbnNlLmRhdGEgJiYgIWluZ2VzdEJ1bGtKb2JVc2Vyc0Zvck1vYmlsZVB1c2hSZXNwb25zZS5kYXRhW1wiZXJyb3JzXCJdICYmXG4gICAgICAgICAgICAgICAgICAgIGluZ2VzdEJ1bGtKb2JVc2Vyc0Zvck1vYmlsZVB1c2hSZXNwb25zZS5kYXRhW1widG90YWxcIl0gJiYgaW5nZXN0QnVsa0pvYlVzZXJzRm9yTW9iaWxlUHVzaFJlc3BvbnNlLmRhdGFbXCJ0b3RhbFwiXSA9PT0gaW5nZXN0ZWRVc2Vycy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IucmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGFuZCB0aGUgc2VydmVyIHJlc3BvbmRlZCB3aXRoIGEgc3RhdHVzIGNvZGVcbiAgICAgICAgICAgICAgICAgICAgICogdGhhdCBmYWxscyBvdXQgb2YgdGhlIHJhbmdlIG9mIDJ4eC5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBOb24gMnh4eCByZXNwb25zZSB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gQ291cmllciBBUEksIHdpdGggc3RhdHVzICR7ZXJyb3IucmVzcG9uc2Uuc3RhdHVzfSwgYW5kIHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZXJyb3IucmVzcG9uc2UuZGF0YSl9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBhbnkgb3RoZXIgc3BlY2lmaWMgZXJyb3JzIHRvIGJlIGZpbHRlcmVkIGJlbG93XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVycm9yLnJlcXVlc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGJ1dCBubyByZXNwb25zZSB3YXMgcmVjZWl2ZWRcbiAgICAgICAgICAgICAgICAgICAgICogYGVycm9yLnJlcXVlc3RgIGlzIGFuIGluc3RhbmNlIG9mIFhNTEh0dHBSZXF1ZXN0IGluIHRoZSBicm93c2VyIGFuZCBhbiBpbnN0YW5jZSBvZlxuICAgICAgICAgICAgICAgICAgICAgKiAgaHR0cC5DbGllbnRSZXF1ZXN0IGluIG5vZGUuanMuXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm8gcmVzcG9uc2UgcmVjZWl2ZWQgd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IENvdXJpZXIgQVBJLCBmb3IgcmVxdWVzdCAke2Vycm9yLnJlcXVlc3R9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU29tZXRoaW5nIGhhcHBlbmVkIGluIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgdGhhdCB0cmlnZ2VyZWQgYW4gRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgc2V0dGluZyB1cCB0aGUgcmVxdWVzdCBmb3IgdGhlICR7ZW5kcG9pbnRJbmZvfSBDb3VyaWVyIEFQSSwgJHsoZXJyb3IgJiYgZXJyb3IubWVzc2FnZSkgJiYgZXJyb3IubWVzc2FnZX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBpbmdlc3RpbmcgdXNlcnMgdGhyb3VnaCB0aGUgbW9iaWxlIHB1c2ggYnVsayBqb2IgdXBkYXRlIHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJ9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHVzZWQgdG8gaW5nZXN0IHVzZXJzIGZvciBhbiBlbWFpbC1iYXNlZCBidWxrIGpvYiBuZWVkaW5nIHRvIGJlIHJ1bi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBqb2JJZCB0aGUgaWQgb2YgdGhlIGpvYiB3aGljaCB3ZSBhcmUgaW5nZXN0aW5nIHRoZSB1c2VycyBmb3JcbiAgICAgKiBAcGFyYW0gbm90aWZpY2F0aW9uVHlwZSB0aGUgdHlwZSBvZiBub3RpZmljYXRpb24gZm9yIHdoaWNoIHdlIGFyZSBpbmdlc3RpbmcgdXNlcnMgZm9yXG4gICAgICogQHBhcmFtIG5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlIHRoZSB0eXBlIG9mIG5vdGlmaWNhdGlvbiBjaGFubmVsXG4gICAgICogQHBhcmFtIHNlbmRCdWxrRW1haWxOb3RpZmljYXRpb25JbnB1dCB0aGUgYnVsayBlbWFpbCBpbnB1dCwgdXNlZCB0byBpbmdlc3QgdXNlcnNcbiAgICAgKlxuICAgICAqIEByZXR1cm4gYSB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIGJvb2xlYW59IHJlcHJlc2VudGluZyBhIGZsYWcgdG8gaGlnaGxpZ2h0IHdoZXRoZXIgdGhlXG4gICAgICogdXNlciBpbmdlc3Rpb24gYWN0aXZpdHkgd2FzIHN1Y2Nlc3NmdWwgb3Igbm90LlxuICAgICAqL1xuICAgIGFzeW5jIGluZ2VzdEJ1bGtKb2JVc2Vyc0ZvckVtYWlsKGpvYklkOiBzdHJpbmcsIG5vdGlmaWNhdGlvblR5cGU6IE5vdGlmaWNhdGlvblR5cGUsIG5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlOiBOb3RpZmljYXRpb25DaGFubmVsVHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZW5kQnVsa0VtYWlsTm90aWZpY2F0aW9uSW5wdXQ6IFNlbmRCdWxrRW1haWxOb3RpZmljYXRpb25JbnB1dCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgICAvLyBlYXNpbHkgaWRlbnRpZmlhYmxlIEFQSSBlbmRwb2ludCBpbmZvcm1hdGlvblxuICAgICAgICBjb25zdCBlbmRwb2ludEluZm8gPSAnUE9TVCAvYnVsay97am9iSWR9IGVtYWlsIENvdXJpZXIgQVBJJztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIEFQSSBLZXkgYW5kIEJhc2UgVVJMLCBuZWVkZWQgaW4gb3JkZXIgdG8gbWFrZSB0aGUgUE9TVCBzZW5kIGVtYWlsIG5vdGlmaWNhdGlvbiB0aHJvdWdoIHRoZSBjbGllbnRcbiAgICAgICAgICAgIGNvbnN0IFtjb3VyaWVyQmFzZVVSTCwgbm90aWZpY2F0aW9uQXV0aFRva2VuLCBub3RpZmljYXRpb25UZW1wbGF0ZUlkXSA9IGF3YWl0IHN1cGVyLnJldHJpZXZlU2VydmljZUNyZWRlbnRpYWxzKENvbnN0YW50cy5BV1NQYWlyQ29uc3RhbnRzLkNPVVJJRVJfSU5URVJOQUxfU0VDUkVUX05BTUUsXG4gICAgICAgICAgICAgICAgdW5kZWZpbmVkLCBub3RpZmljYXRpb25UeXBlLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgbm90aWZpY2F0aW9uQ2hhbm5lbFR5cGUpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgd2Ugb2J0YWluZWQgYW55IGludmFsaWQgc2VjcmV0IHZhbHVlcyBmcm9tIHRoZSBjYWxsIGFib3ZlXG4gICAgICAgICAgICBpZiAoY291cmllckJhc2VVUkwgPT09IG51bGwgfHwgY291cmllckJhc2VVUkwubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uQXV0aFRva2VuID09PSBudWxsIHx8IG5vdGlmaWNhdGlvbkF1dGhUb2tlbi5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25UZW1wbGF0ZUlkID09PSBudWxsIHx8IG5vdGlmaWNhdGlvblRlbXBsYXRlSWQhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IFwiSW52YWxpZCBTZWNyZXRzIG9idGFpbmVkIGZvciBDb3VyaWVyIEFQSSBjYWxsIVwiO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogUE9TVCAvYnVsay97am9iSWR9XG4gICAgICAgICAgICAgKiBAbGluayBodHRwczovL3d3dy5jb3VyaWVyLmNvbS9kb2NzL3R1dG9yaWFscy9ob3ctdG8tc2VuZC1idWxrLW5vdGlmaWNhdGlvbnMvXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogYnVpbGQgdGhlIENvdXJpZXIgQVBJIHJlcXVlc3QgYm9keSB0byBiZSBwYXNzZWQgaW4sIGFuZCBwZXJmb3JtIGEgUE9TVCB0byBpdCB3aXRoIHRoZSBhcHByb3ByaWF0ZSBpbmZvcm1hdGlvblxuICAgICAgICAgICAgICogd2UgaW1wbHkgdGhhdCBpZiB0aGUgQVBJIGRvZXMgbm90IHJlc3BvbmQgaW4gMTUgc2Vjb25kcywgdGhlbiB3ZSBhdXRvbWF0aWNhbGx5IGNhdGNoIHRoYXQsIGFuZCByZXR1cm4gYW5cbiAgICAgICAgICAgICAqIGVycm9yIGZvciBhIGJldHRlciBjdXN0b21lciBleHBlcmllbmNlLlxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIEZpcnN0IGJ1aWxkIHRoZSByZXF1ZXN0IGRhdGEgZnJvbSB0aGUgYnVsayBpbnB1dCBwYXNzZWQgaW5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgY29uc3QgaW5nZXN0ZWRVc2VyczogYW55W10gPSBbXTtcbiAgICAgICAgICAgIHNlbmRCdWxrRW1haWxOb3RpZmljYXRpb25JbnB1dC5lbWFpbE5vdGlmaWNhdGlvbklucHV0cy5mb3JFYWNoKGVtYWlsTm90aWZpY2F0aW9uSW5wdXQgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlbWFpbE5vdGlmaWNhdGlvbklucHV0ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGluZ2VzdGVkVXNlcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICB0bzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVtYWlsOiBlbWFpbE5vdGlmaWNhdGlvbklucHV0LmVtYWlsRGVzdGluYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVsbE5hbWU6IGVtYWlsTm90aWZpY2F0aW9uSW5wdXQudXNlckZ1bGxOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLihlbWFpbE5vdGlmaWNhdGlvbklucHV0LnRyYW5zYWN0aW9ucyAhPT0gdW5kZWZpbmVkICYmIGVtYWlsTm90aWZpY2F0aW9uSW5wdXQudHJhbnNhY3Rpb25zICE9PSBudWxsICYmIGVtYWlsTm90aWZpY2F0aW9uSW5wdXQudHJhbnNhY3Rpb25zLmxlbmd0aCAhPT0gMCAmJiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uczogZW1haWxOb3RpZmljYXRpb25JbnB1dC50cmFuc2FjdGlvbnMhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uKGVtYWlsTm90aWZpY2F0aW9uSW5wdXQuZGFpbHlFYXJuaW5nc1N1bW1hcnlBbW91bnQgIT09IHVuZGVmaW5lZCAmJiBlbWFpbE5vdGlmaWNhdGlvbklucHV0LmRhaWx5RWFybmluZ3NTdW1tYXJ5QW1vdW50ICE9PSBudWxsICYmIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGFpbHlFYXJuaW5nc1N1bW1hcnlBbW91bnQ6IGVtYWlsTm90aWZpY2F0aW9uSW5wdXQuZGFpbHlFYXJuaW5nc1N1bW1hcnlBbW91bnQhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBjb25zdCByZXF1ZXN0RGF0YSA9IHtcbiAgICAgICAgICAgICAgICB1c2VyczogaW5nZXN0ZWRVc2Vyc1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBheGlvcy5wb3N0KGAke2NvdXJpZXJCYXNlVVJMfS9idWxrLyR7am9iSWR9YCwgcmVxdWVzdERhdGEsIHtcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgICAgICBcIkF1dGhvcml6YXRpb25cIjogYEJlYXJlciAke25vdGlmaWNhdGlvbkF1dGhUb2tlbn1gXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiAxNTAwMCwgLy8gaW4gbWlsbGlzZWNvbmRzIGhlcmVcbiAgICAgICAgICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlOiAnQ291cmllciBBUEkgdGltZWQgb3V0IGFmdGVyIDE1MDAwbXMhJ1xuICAgICAgICAgICAgfSkudGhlbihpbmdlc3RCdWxrSm9iVXNlcnNGb3JFbWFpbFJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlbmRwb2ludEluZm99IHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoaW5nZXN0QnVsa0pvYlVzZXJzRm9yRW1haWxSZXNwb25zZS5kYXRhKX1gKTtcblxuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIGlmIHdlIHJlYWNoZWQgdGhpcywgdGhlbiB3ZSBhc3N1bWUgdGhhdCBhIDJ4eCByZXNwb25zZSBjb2RlIHdhcyByZXR1cm5lZC5cbiAgICAgICAgICAgICAgICAgKiBjaGVjayB0aGUgY29udGVudHMgb2YgdGhlIHJlc3BvbnNlLCBhbmQgYWN0IGFwcHJvcHJpYXRlbHkuXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgaWYgKGluZ2VzdEJ1bGtKb2JVc2Vyc0ZvckVtYWlsUmVzcG9uc2UuZGF0YSAmJiAhaW5nZXN0QnVsa0pvYlVzZXJzRm9yRW1haWxSZXNwb25zZS5kYXRhW1wiZXJyb3JzXCJdICYmXG4gICAgICAgICAgICAgICAgICAgIGluZ2VzdEJ1bGtKb2JVc2Vyc0ZvckVtYWlsUmVzcG9uc2UuZGF0YVtcInRvdGFsXCJdICYmIGluZ2VzdEJ1bGtKb2JVc2Vyc0ZvckVtYWlsUmVzcG9uc2UuZGF0YVtcInRvdGFsXCJdID09PSBpbmdlc3RlZFVzZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvci5yZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYW5kIHRoZSBzZXJ2ZXIgcmVzcG9uZGVkIHdpdGggYSBzdGF0dXMgY29kZVxuICAgICAgICAgICAgICAgICAgICAgKiB0aGF0IGZhbGxzIG91dCBvZiB0aGUgcmFuZ2Ugb2YgMnh4LlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vbiAyeHh4IHJlc3BvbnNlIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBDb3VyaWVyIEFQSSwgd2l0aCBzdGF0dXMgJHtlcnJvci5yZXNwb25zZS5zdGF0dXN9LCBhbmQgcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShlcnJvci5yZXNwb25zZS5kYXRhKX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGFueSBvdGhlciBzcGVjaWZpYyBlcnJvcnMgdG8gYmUgZmlsdGVyZWQgYmVsb3dcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3IucmVxdWVzdCkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYnV0IG5vIHJlc3BvbnNlIHdhcyByZWNlaXZlZFxuICAgICAgICAgICAgICAgICAgICAgKiBgZXJyb3IucmVxdWVzdGAgaXMgYW4gaW5zdGFuY2Ugb2YgWE1MSHR0cFJlcXVlc3QgaW4gdGhlIGJyb3dzZXIgYW5kIGFuIGluc3RhbmNlIG9mXG4gICAgICAgICAgICAgICAgICAgICAqICBodHRwLkNsaWVudFJlcXVlc3QgaW4gbm9kZS5qcy5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBObyByZXNwb25zZSByZWNlaXZlZCB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gQ291cmllciBBUEksIGZvciByZXF1ZXN0ICR7ZXJyb3IucmVxdWVzdH1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBTb21ldGhpbmcgaGFwcGVuZWQgaW4gc2V0dGluZyB1cCB0aGUgcmVxdWVzdCB0aGF0IHRyaWdnZXJlZCBhbiBFcnJvclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IGZvciB0aGUgJHtlbmRwb2ludEluZm99IENvdXJpZXIgQVBJLCAkeyhlcnJvciAmJiBlcnJvci5tZXNzYWdlKSAmJiBlcnJvci5tZXNzYWdlfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGluZ2VzdGluZyB1c2VycyB0aHJvdWdoIHRoZSBlbWFpbCBidWxrIGpvYiB1cGRhdGUgdGhyb3VnaCAke2VuZHBvaW50SW5mb31gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfSAke2Vycn1gKTtcblxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdXNlZCB0byBjcmVhdGUgYSBidWxrIG5vdGlmaWNhdGlvbiBtZWFudCB0byBoZWxwIHdpdGhcbiAgICAgKiBzY2hlZHVsaW5nIGJ1bGsgZW1haWwgYW5kIG1vYmlsZSBwdXNoIG5vdGlmaWNhdGlvbiBqb2JzLlxuICAgICAqXG4gICAgICogQHBhcmFtIG5vdGlmaWNhdGlvblR5cGUgdGhlIHR5cGUgb2Ygbm90aWZpY2F0aW9uIHRvIHNjaGVkdWxlIHRoZSBidWxrXG4gICAgICogam9iIGZvci5cbiAgICAgKiBAcGFyYW0gbm90aWZpY2F0aW9uQ2hhbm5lbFR5cGUgdGhlIHR5cGUgb2Ygbm90aWZpY2F0aW9uIGNoYW5uZWxcbiAgICAgKlxuICAgICAqIEByZXR1cm4gYSB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIHN0cmluZ30gb3Ige0BsaW5rIG51bGx9IGRlcGVuZGluZyBvblxuICAgICAqIHdoZXRoZXIgdGhlIGpvYiBzY2hlZHVsaW5nIHdhcyBzdWNjZXNzZnVsIG9yIG5vdC5cbiAgICAgKi9cbiAgICBhc3luYyBjcmVhdGVCdWxrTm90aWZpY2F0aW9uSm9iKG5vdGlmaWNhdGlvblR5cGU6IE5vdGlmaWNhdGlvblR5cGUsIG5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlOiBOb3RpZmljYXRpb25DaGFubmVsVHlwZSk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xuICAgICAgICAvLyBlYXNpbHkgaWRlbnRpZmlhYmxlIEFQSSBlbmRwb2ludCBpbmZvcm1hdGlvblxuICAgICAgICBjb25zdCBlbmRwb2ludEluZm8gPSAnUE9TVCAvYnVsayBDb3VyaWVyIEFQSSc7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBBUEkgS2V5IGFuZCBCYXNlIFVSTCwgbmVlZGVkIGluIG9yZGVyIHRvIG1ha2UgdGhlIFBPU1Qgc2VuZCBlbWFpbCBub3RpZmljYXRpb24gdGhyb3VnaCB0aGUgY2xpZW50XG4gICAgICAgICAgICBjb25zdCBbY291cmllckJhc2VVUkwsIG5vdGlmaWNhdGlvbkF1dGhUb2tlbiwgbm90aWZpY2F0aW9uVGVtcGxhdGVJZF0gPSBhd2FpdCBzdXBlci5yZXRyaWV2ZVNlcnZpY2VDcmVkZW50aWFscyhDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5DT1VSSUVSX0lOVEVSTkFMX1NFQ1JFVF9OQU1FLFxuICAgICAgICAgICAgICAgIHVuZGVmaW5lZCwgbm90aWZpY2F0aW9uVHlwZSwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIG5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlKTtcblxuICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHdlIG9idGFpbmVkIGFueSBpbnZhbGlkIHNlY3JldCB2YWx1ZXMgZnJvbSB0aGUgY2FsbCBhYm92ZVxuICAgICAgICAgICAgaWYgKGNvdXJpZXJCYXNlVVJMID09PSBudWxsIHx8IGNvdXJpZXJCYXNlVVJMLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbkF1dGhUb2tlbiA9PT0gbnVsbCB8fCBub3RpZmljYXRpb25BdXRoVG9rZW4ubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uVGVtcGxhdGVJZCA9PT0gbnVsbCB8fCBub3RpZmljYXRpb25UZW1wbGF0ZUlkIS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBcIkludmFsaWQgU2VjcmV0cyBvYnRhaW5lZCBmb3IgQ291cmllciBBUEkgY2FsbCFcIjtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogUE9TVCAvYnVsa1xuICAgICAgICAgICAgICogQGxpbmsgaHR0cHM6Ly93d3cuY291cmllci5jb20vZG9jcy90dXRvcmlhbHMvaG93LXRvLXNlbmQtYnVsay1ub3RpZmljYXRpb25zL1xuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIGJ1aWxkIHRoZSBDb3VyaWVyIEFQSSByZXF1ZXN0IGJvZHkgdG8gYmUgcGFzc2VkIGluLCBhbmQgcGVyZm9ybSBhIFBPU1QgdG8gaXQgd2l0aCB0aGUgYXBwcm9wcmlhdGUgaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAqIHdlIGltcGx5IHRoYXQgaWYgdGhlIEFQSSBkb2VzIG5vdCByZXNwb25kIGluIDE1IHNlY29uZHMsIHRoZW4gd2UgYXV0b21hdGljYWxseSBjYXRjaCB0aGF0LCBhbmQgcmV0dXJuIGFuXG4gICAgICAgICAgICAgKiBlcnJvciBmb3IgYSBiZXR0ZXIgY3VzdG9tZXIgZXhwZXJpZW5jZS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgY29uc3QgcmVxdWVzdERhdGEgPSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZToge1xuICAgICAgICAgICAgICAgICAgICBldmVudDogbm90aWZpY2F0aW9uVGVtcGxhdGVJZCxcbiAgICAgICAgICAgICAgICAgICAgbG9jYWxlOiBcImVuX1VTXCIsXG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBub3RpZmljYXRpb25UZW1wbGF0ZUlkXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAuLi4obm90aWZpY2F0aW9uQ2hhbm5lbFR5cGUgPT09IE5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlLlB1c2ggJiYge1xuICAgICAgICAgICAgICAgICAgICBwcm92aWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4cG86IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdmVycmlkZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0dGw6IDMwMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc291bmQ6IFwiZGVmYXVsdFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmlvcml0eTogXCJoaWdoXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBDb3VyaWVyIEFQSSByZXF1ZXN0IE9iamVjdDogJHtKU09OLnN0cmluZ2lmeShyZXF1ZXN0RGF0YSl9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiBheGlvcy5wb3N0KGAke2NvdXJpZXJCYXNlVVJMfS9idWxrYCwgcmVxdWVzdERhdGEsIHtcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgICAgICBcIkF1dGhvcml6YXRpb25cIjogYEJlYXJlciAke25vdGlmaWNhdGlvbkF1dGhUb2tlbn1gXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiAxNTAwMCwgLy8gaW4gbWlsbGlzZWNvbmRzIGhlcmVcbiAgICAgICAgICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlOiAnQ291cmllciBBUEkgdGltZWQgb3V0IGFmdGVyIDE1MDAwbXMhJ1xuICAgICAgICAgICAgfSkudGhlbihjcmVhdGVCdWxrTm90aWZpY2F0aW9uUmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShjcmVhdGVCdWxrTm90aWZpY2F0aW9uUmVzcG9uc2UuZGF0YSl9YCk7XG5cbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiBpZiB3ZSByZWFjaGVkIHRoaXMsIHRoZW4gd2UgYXNzdW1lIHRoYXQgYSAyeHggcmVzcG9uc2UgY29kZSB3YXMgcmV0dXJuZWQuXG4gICAgICAgICAgICAgICAgICogY2hlY2sgdGhlIGNvbnRlbnRzIG9mIHRoZSByZXNwb25zZSwgYW5kIGFjdCBhcHByb3ByaWF0ZWx5LlxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGlmIChjcmVhdGVCdWxrTm90aWZpY2F0aW9uUmVzcG9uc2UuZGF0YSAmJiBjcmVhdGVCdWxrTm90aWZpY2F0aW9uUmVzcG9uc2UuZGF0YVtcImpvYklkXCJdKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjcmVhdGVCdWxrTm90aWZpY2F0aW9uUmVzcG9uc2UuZGF0YVtcImpvYklkXCJdO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IucmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGFuZCB0aGUgc2VydmVyIHJlc3BvbmRlZCB3aXRoIGEgc3RhdHVzIGNvZGVcbiAgICAgICAgICAgICAgICAgICAgICogdGhhdCBmYWxscyBvdXQgb2YgdGhlIHJhbmdlIG9mIDJ4eC5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBOb24gMnh4eCByZXNwb25zZSB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gQ291cmllciBBUEksIHdpdGggc3RhdHVzICR7ZXJyb3IucmVzcG9uc2Uuc3RhdHVzfSwgYW5kIHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZXJyb3IucmVzcG9uc2UuZGF0YSl9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBhbnkgb3RoZXIgc3BlY2lmaWMgZXJyb3JzIHRvIGJlIGZpbHRlcmVkIGJlbG93XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3IucmVxdWVzdCkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYnV0IG5vIHJlc3BvbnNlIHdhcyByZWNlaXZlZFxuICAgICAgICAgICAgICAgICAgICAgKiBgZXJyb3IucmVxdWVzdGAgaXMgYW4gaW5zdGFuY2Ugb2YgWE1MSHR0cFJlcXVlc3QgaW4gdGhlIGJyb3dzZXIgYW5kIGFuIGluc3RhbmNlIG9mXG4gICAgICAgICAgICAgICAgICAgICAqICBodHRwLkNsaWVudFJlcXVlc3QgaW4gbm9kZS5qcy5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBObyByZXNwb25zZSByZWNlaXZlZCB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gQ291cmllciBBUEksIGZvciByZXF1ZXN0ICR7ZXJyb3IucmVxdWVzdH1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNvbWV0aGluZyBoYXBwZW5lZCBpbiBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IHRoYXQgdHJpZ2dlcmVkIGFuIEVycm9yXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgZm9yIHRoZSAke2VuZHBvaW50SW5mb30gQ291cmllciBBUEksICR7KGVycm9yICYmIGVycm9yLm1lc3NhZ2UpICYmIGVycm9yLm1lc3NhZ2V9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBpbml0aWF0aW5nIHRoZSBidWxrIGpvYiBjcmVhdGlvbiB0aHJvdWdoICR7ZW5kcG9pbnRJbmZvfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9ICR7ZXJyfWApO1xuXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==