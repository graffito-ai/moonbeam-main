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
                        profile: {
                            expo: {
                                tokens: mobilePushNotificationInput.expoPushTokens
                            },
                            user_id: `expo_${Date.parse(new Date().toISOString())}`
                        },
                        template: notificationTemplateId,
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
                if (ingestBulkJobUsersForMobilePushResponse.data &&
                    (!ingestBulkJobUsersForMobilePushResponse.data["errors"] || (ingestBulkJobUsersForMobilePushResponse.data["errors"] && ingestBulkJobUsersForMobilePushResponse.data["errors"].length === 0)) &&
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
                        profile: {
                            email: emailNotificationInput.emailDestination,
                            userId: `email_${Date.parse(new Date().toISOString())}`
                        },
                        template: notificationTemplateId,
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
                if (ingestBulkJobUsersForEmailResponse.data &&
                    (!ingestBulkJobUsersForEmailResponse.data["errors"] || (ingestBulkJobUsersForEmailResponse.data["errors"] && ingestBulkJobUsersForEmailResponse.data["errors"].length === 0)) &&
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
                ...(notificationChannelType === GraphqlExports_1.NotificationChannelType.Email && {
                    message: {
                        event: notificationTemplateId
                    }
                }),
                ...(notificationChannelType === GraphqlExports_1.NotificationChannelType.Push && {
                    message: {
                        event: notificationTemplateId,
                        providers: {
                            expo: {
                                override: {
                                    ttl: 300,
                                    sound: "default",
                                    priority: "high"
                                }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ291cmllckNsaWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tb24vY2xpZW50cy9Db3VyaWVyQ2xpZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLG1EQUE4QztBQUM5QyxzREFTMkI7QUFDM0IsNENBQXVDO0FBQ3ZDLGtEQUEwQjtBQUUxQjs7R0FFRztBQUNILE1BQWEsYUFBYyxTQUFRLDZCQUFhO0lBRTVDOzs7OztPQUtHO0lBQ0gsWUFBWSxXQUFtQixFQUFFLE1BQWM7UUFDM0MsS0FBSyxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRUQ7Ozs7Ozs7Ozs7T0FVRztJQUNILEtBQUssQ0FBQywwQkFBMEIsQ0FBQywrQkFBZ0UsRUFBRSxnQkFBa0M7UUFDakksK0NBQStDO1FBQy9DLE1BQU0sWUFBWSxHQUFHLG9DQUFvQyxDQUFDO1FBRTFELElBQUk7WUFDQSx1SEFBdUg7WUFDdkgsTUFBTSxDQUFDLGNBQWMsRUFBRSxxQkFBcUIsRUFBRSxzQkFBc0IsQ0FBQyxHQUFHLE1BQU0sS0FBSyxDQUFDLDBCQUEwQixDQUFDLHFCQUFTLENBQUMsZ0JBQWdCLENBQUMsNEJBQTRCLEVBQ2xLLFNBQVMsRUFBRSxnQkFBZ0IsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLHdDQUF1QixDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXJGLDRFQUE0RTtZQUM1RSxJQUFJLGNBQWMsS0FBSyxJQUFJLElBQUksY0FBYyxDQUFDLE1BQU0sS0FBSyxDQUFDO2dCQUN0RCxxQkFBcUIsS0FBSyxJQUFJLElBQUkscUJBQXFCLENBQUMsTUFBTSxLQUFLLENBQUM7Z0JBQ3BFLHNCQUFzQixLQUFLLElBQUksSUFBSSxzQkFBdUIsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUN6RSxNQUFNLFlBQVksR0FBRyxnREFBZ0QsQ0FBQztnQkFDdEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENB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LENBQUM7WUFDdkcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFlBQVksSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBRXRDLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7SUFDTCxDQUFDO0NBQ0o7QUFwNkJELHNDQW82QkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0Jhc2VBUElDbGllbnR9IGZyb20gXCIuL0Jhc2VBUElDbGllbnRcIjtcbmltcG9ydCB7XG4gICAgTm90aWZpY2F0aW9uQ2hhbm5lbFR5cGUsXG4gICAgTm90aWZpY2F0aW9uUmVzcG9uc2UsXG4gICAgTm90aWZpY2F0aW9uc0Vycm9yVHlwZSxcbiAgICBOb3RpZmljYXRpb25UeXBlLFxuICAgIFNlbmRCdWxrRW1haWxOb3RpZmljYXRpb25JbnB1dCxcbiAgICBTZW5kQnVsa01vYmlsZVB1c2hOb3RpZmljYXRpb25JbnB1dCxcbiAgICBTZW5kRW1haWxOb3RpZmljYXRpb25JbnB1dCxcbiAgICBTZW5kTW9iaWxlUHVzaE5vdGlmaWNhdGlvbklucHV0XG59IGZyb20gXCIuLi9HcmFwaHFsRXhwb3J0c1wiO1xuaW1wb3J0IHtDb25zdGFudHN9IGZyb20gXCIuLi9Db25zdGFudHNcIjtcbmltcG9ydCBheGlvcyBmcm9tIFwiYXhpb3NcIjtcblxuLyoqXG4gKiBDbGFzcyB1c2VkIGFzIHRoZSBiYXNlL2dlbmVyaWMgY2xpZW50IGZvciBhbGwgQ291cmllci9ub3RpZmljYXRpb24tcmVsYXRlZCBjYWxscy5cbiAqL1xuZXhwb3J0IGNsYXNzIENvdXJpZXJDbGllbnQgZXh0ZW5kcyBCYXNlQVBJQ2xpZW50IHtcblxuICAgIC8qKlxuICAgICAqIEdlbmVyaWMgY29uc3RydWN0b3IgZm9yIHRoZSBjbGllbnQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZW52aXJvbm1lbnQgdGhlIEFXUyBlbnZpcm9ubWVudCBwYXNzZWQgaW4gZnJvbSB0aGUgTGFtYmRhIHJlc29sdmVyLlxuICAgICAqIEBwYXJhbSByZWdpb24gdGhlIEFXUyByZWdpb24gcGFzc2VkIGluIGZyb20gdGhlIExhbWJkYSByZXNvbHZlci5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihlbnZpcm9ubWVudDogc3RyaW5nLCByZWdpb246IHN0cmluZykge1xuICAgICAgICBzdXBlcihyZWdpb24sIGVudmlyb25tZW50KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB1c2VkIHRvIHNlbmQgYSBtb2JpbGUgcHVzaCBub3RpZmljYXRpb24uXG4gICAgICpcbiAgICAgKiBAcGFyYW0gc2VuZE1vYmlsZVB1c2hOb3RpZmljYXRpb25JbnB1dCB0aGUgbm90aWZpY2F0aW9uIGlucHV0IGRldGFpbHMgdG8gYmUgcGFzc2VkIGluLCBpbiBvcmRlciB0byBzZW5kXG4gICAgICogYSBtb2JpbGUgcHVzaCBub3RpZmljYXRpb25cbiAgICAgKiBAcGFyYW0gbm90aWZpY2F0aW9uVHlwZSB0aGUgdHlwZSBvZiBub3RpZmljYXRpb24gdG8gc2VuZCBtb2JpbGUgcHVzaCBub3RpZmljYXRpb25zIGZvclxuICAgICAqXG4gICAgICogQHJldHVybnMgYSB7QGxpbmsgTm90aWZpY2F0aW9uUmVzcG9uc2V9IHJlcHJlc2VudGluZyB0aGUgQ291cmllciBub3RpZmljYXRpb24gcmVzcG9uc2VcbiAgICAgKlxuICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgKi9cbiAgICBhc3luYyBzZW5kTW9iaWxlUHVzaE5vdGlmaWNhdGlvbihzZW5kTW9iaWxlUHVzaE5vdGlmaWNhdGlvbklucHV0OiBTZW5kTW9iaWxlUHVzaE5vdGlmaWNhdGlvbklucHV0LCBub3RpZmljYXRpb25UeXBlOiBOb3RpZmljYXRpb25UeXBlKTogUHJvbWlzZTxOb3RpZmljYXRpb25SZXNwb25zZT4ge1xuICAgICAgICAvLyBlYXNpbHkgaWRlbnRpZmlhYmxlIEFQSSBlbmRwb2ludCBpbmZvcm1hdGlvblxuICAgICAgICBjb25zdCBlbmRwb2ludEluZm8gPSAnUE9TVCAvc2VuZCBtb2JpbGUgcHVzaCBDb3VyaWVyIEFQSSc7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBBUEkgS2V5IGFuZCBCYXNlIFVSTCwgbmVlZGVkIGluIG9yZGVyIHRvIG1ha2UgdGhlIFBPU1Qgc2VuZCBtb2JpbGUgcHVzaCBub3RpZmljYXRpb24gdGhyb3VnaCB0aGUgY2xpZW50XG4gICAgICAgICAgICBjb25zdCBbY291cmllckJhc2VVUkwsIG5vdGlmaWNhdGlvbkF1dGhUb2tlbiwgbm90aWZpY2F0aW9uVGVtcGxhdGVJZF0gPSBhd2FpdCBzdXBlci5yZXRyaWV2ZVNlcnZpY2VDcmVkZW50aWFscyhDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5DT1VSSUVSX0lOVEVSTkFMX1NFQ1JFVF9OQU1FLFxuICAgICAgICAgICAgICAgIHVuZGVmaW5lZCwgbm90aWZpY2F0aW9uVHlwZSwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIE5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlLlB1c2gpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgd2Ugb2J0YWluZWQgYW55IGludmFsaWQgc2VjcmV0IHZhbHVlcyBmcm9tIHRoZSBjYWxsIGFib3ZlXG4gICAgICAgICAgICBpZiAoY291cmllckJhc2VVUkwgPT09IG51bGwgfHwgY291cmllckJhc2VVUkwubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uQXV0aFRva2VuID09PSBudWxsIHx8IG5vdGlmaWNhdGlvbkF1dGhUb2tlbi5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25UZW1wbGF0ZUlkID09PSBudWxsIHx8IG5vdGlmaWNhdGlvblRlbXBsYXRlSWQhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IFwiSW52YWxpZCBTZWNyZXRzIG9idGFpbmVkIGZvciBDb3VyaWVyIEFQSSBjYWxsIVwiO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogUE9TVCAvc2VuZFxuICAgICAgICAgICAgICogQGxpbmsgaHR0cHM6Ly93d3cuY291cmllci5jb20vZG9jcy9yZWZlcmVuY2Uvc2VuZC9tZXNzYWdlL1xuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIGJ1aWxkIHRoZSBDb3VyaWVyIEFQSSByZXF1ZXN0IGJvZHkgdG8gYmUgcGFzc2VkIGluLCBhbmQgcGVyZm9ybSBhIFBPU1QgdG8gaXQgd2l0aCB0aGUgYXBwcm9wcmlhdGUgaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAqIHdlIGltcGx5IHRoYXQgaWYgdGhlIEFQSSBkb2VzIG5vdCByZXNwb25kIGluIDE1IHNlY29uZHMsIHRoZW4gd2UgYXV0b21hdGljYWxseSBjYXRjaCB0aGF0LCBhbmQgcmV0dXJuIGFuXG4gICAgICAgICAgICAgKiBlcnJvciBmb3IgYSBiZXR0ZXIgY3VzdG9tZXIgZXhwZXJpZW5jZS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgY29uc3QgcmVxdWVzdERhdGEgPSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZToge1xuICAgICAgICAgICAgICAgICAgICB0bzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXhwbzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRva2Vuczogc2VuZE1vYmlsZVB1c2hOb3RpZmljYXRpb25JbnB1dC5leHBvUHVzaFRva2Vuc1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogbm90aWZpY2F0aW9uVGVtcGxhdGVJZCxcbiAgICAgICAgICAgICAgICAgICAgcHJvdmlkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBleHBvOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3ZlcnJpZGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHRsOiAzMDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdW5kOiBcImRlZmF1bHRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJpb3JpdHk6IFwiaGlnaFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAuLi4oc2VuZE1vYmlsZVB1c2hOb3RpZmljYXRpb25JbnB1dC5pbmVsaWdpYmxlVHJhbnNhY3Rpb25BbW91bnQgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgc2VuZE1vYmlsZVB1c2hOb3RpZmljYXRpb25JbnB1dC5pbmVsaWdpYmxlVHJhbnNhY3Rpb25BbW91bnQgIT09IG51bGwgJiYge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5lbGlnaWJsZVRyYW5zYWN0aW9uQW1vdW50OiBzZW5kTW9iaWxlUHVzaE5vdGlmaWNhdGlvbklucHV0LmluZWxpZ2libGVUcmFuc2FjdGlvbkFtb3VudCFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgLi4uKChzZW5kTW9iaWxlUHVzaE5vdGlmaWNhdGlvbklucHV0LnBlbmRpbmdDYXNoYmFjayA9PT0gdW5kZWZpbmVkIHx8IHNlbmRNb2JpbGVQdXNoTm90aWZpY2F0aW9uSW5wdXQucGVuZGluZ0Nhc2hiYWNrID09PSBudWxsKVxuICAgICAgICAgICAgICAgICAgICAgICAgJiYgc2VuZE1vYmlsZVB1c2hOb3RpZmljYXRpb25JbnB1dC5tZXJjaGFudE5hbWUgIT09IHVuZGVmaW5lZCAmJiBzZW5kTW9iaWxlUHVzaE5vdGlmaWNhdGlvbklucHV0Lm1lcmNoYW50TmFtZSAhPT0gbnVsbFxuICAgICAgICAgICAgICAgICAgICAgICAgJiYgc2VuZE1vYmlsZVB1c2hOb3RpZmljYXRpb25JbnB1dC5tZXJjaGFudE5hbWUubGVuZ3RoICE9PSAwICYmIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lcmNoYW50TmFtZTogc2VuZE1vYmlsZVB1c2hOb3RpZmljYXRpb25JbnB1dC5tZXJjaGFudE5hbWUhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIC4uLihzZW5kTW9iaWxlUHVzaE5vdGlmaWNhdGlvbklucHV0LnBlbmRpbmdDYXNoYmFjayAhPT0gdW5kZWZpbmVkICYmIHNlbmRNb2JpbGVQdXNoTm90aWZpY2F0aW9uSW5wdXQucGVuZGluZ0Nhc2hiYWNrICE9PSBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAmJiBzZW5kTW9iaWxlUHVzaE5vdGlmaWNhdGlvbklucHV0Lm1lcmNoYW50TmFtZSAhPT0gdW5kZWZpbmVkICYmIHNlbmRNb2JpbGVQdXNoTm90aWZpY2F0aW9uSW5wdXQubWVyY2hhbnROYW1lICE9PSBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAmJiBzZW5kTW9iaWxlUHVzaE5vdGlmaWNhdGlvbklucHV0Lm1lcmNoYW50TmFtZS5sZW5ndGggIT09IDAgJiYge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGVuZGluZ0Nhc2hiYWNrOiBzZW5kTW9iaWxlUHVzaE5vdGlmaWNhdGlvbklucHV0LnBlbmRpbmdDYXNoYmFjayEudG9TdHJpbmcoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVyY2hhbnROYW1lOiBzZW5kTW9iaWxlUHVzaE5vdGlmaWNhdGlvbklucHV0Lm1lcmNoYW50TmFtZSFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgLi4uKHNlbmRNb2JpbGVQdXNoTm90aWZpY2F0aW9uSW5wdXQuZGFpbHlFYXJuaW5nc1N1bW1hcnlBbW91bnQgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgc2VuZE1vYmlsZVB1c2hOb3RpZmljYXRpb25JbnB1dC5kYWlseUVhcm5pbmdzU3VtbWFyeUFtb3VudCAhPT0gbnVsbCAmJiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYWlseUVhcm5pbmdzU3VtbWFyeUFtb3VudDogc2VuZE1vYmlsZVB1c2hOb3RpZmljYXRpb25JbnB1dC5kYWlseUVhcm5pbmdzU3VtbWFyeUFtb3VudCEudG9TdHJpbmcoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBDb3VyaWVyIEFQSSByZXF1ZXN0IE9iamVjdDogJHtKU09OLnN0cmluZ2lmeShyZXF1ZXN0RGF0YSl9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiBheGlvcy5wb3N0KGAke2NvdXJpZXJCYXNlVVJMfS9zZW5kYCwgcmVxdWVzdERhdGEsIHtcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgICAgICBcIkF1dGhvcml6YXRpb25cIjogYEJlYXJlciAke25vdGlmaWNhdGlvbkF1dGhUb2tlbn1gXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiAxNTAwMCwgLy8gaW4gbWlsbGlzZWNvbmRzIGhlcmVcbiAgICAgICAgICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlOiAnQ291cmllciBBUEkgdGltZWQgb3V0IGFmdGVyIDE1MDAwbXMhJ1xuICAgICAgICAgICAgfSkudGhlbihzZW5kTW9iaWxlUHVzaFJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlbmRwb2ludEluZm99IHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoc2VuZE1vYmlsZVB1c2hSZXNwb25zZS5kYXRhKX1gKTtcblxuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIGlmIHdlIHJlYWNoZWQgdGhpcywgdGhlbiB3ZSBhc3N1bWUgdGhhdCBhIDJ4eCByZXNwb25zZSBjb2RlIHdhcyByZXR1cm5lZC5cbiAgICAgICAgICAgICAgICAgKiBjaGVjayB0aGUgY29udGVudHMgb2YgdGhlIHJlc3BvbnNlLCBhbmQgYWN0IGFwcHJvcHJpYXRlbHkuXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgaWYgKHNlbmRNb2JpbGVQdXNoUmVzcG9uc2UuZGF0YSAmJiBzZW5kTW9iaWxlUHVzaFJlc3BvbnNlLmRhdGFbXCJyZXF1ZXN0SWRcIl0pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVlc3RJZDogc2VuZE1vYmlsZVB1c2hSZXNwb25zZS5kYXRhW1wicmVxdWVzdElkXCJdXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgSW52YWxpZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UhYCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IucmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGFuZCB0aGUgc2VydmVyIHJlc3BvbmRlZCB3aXRoIGEgc3RhdHVzIGNvZGVcbiAgICAgICAgICAgICAgICAgICAgICogdGhhdCBmYWxscyBvdXQgb2YgdGhlIHJhbmdlIG9mIDJ4eC5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBOb24gMnh4eCByZXNwb25zZSB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gQ291cmllciBBUEksIHdpdGggc3RhdHVzICR7ZXJyb3IucmVzcG9uc2Uuc3RhdHVzfSwgYW5kIHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZXJyb3IucmVzcG9uc2UuZGF0YSl9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBhbnkgb3RoZXIgc3BlY2lmaWMgZXJyb3JzIHRvIGJlIGZpbHRlcmVkIGJlbG93XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVycm9yLnJlcXVlc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGJ1dCBubyByZXNwb25zZSB3YXMgcmVjZWl2ZWRcbiAgICAgICAgICAgICAgICAgICAgICogYGVycm9yLnJlcXVlc3RgIGlzIGFuIGluc3RhbmNlIG9mIFhNTEh0dHBSZXF1ZXN0IGluIHRoZSBicm93c2VyIGFuZCBhbiBpbnN0YW5jZSBvZlxuICAgICAgICAgICAgICAgICAgICAgKiAgaHR0cC5DbGllbnRSZXF1ZXN0IGluIG5vZGUuanMuXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm8gcmVzcG9uc2UgcmVjZWl2ZWQgd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IENvdXJpZXIgQVBJLCBmb3IgcmVxdWVzdCAke2Vycm9yLnJlcXVlc3R9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU29tZXRoaW5nIGhhcHBlbmVkIGluIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgdGhhdCB0cmlnZ2VyZWQgYW4gRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgc2V0dGluZyB1cCB0aGUgcmVxdWVzdCBmb3IgdGhlICR7ZW5kcG9pbnRJbmZvfSBDb3VyaWVyIEFQSSwgJHsoZXJyb3IgJiYgZXJyb3IubWVzc2FnZSkgJiYgZXJyb3IubWVzc2FnZX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBpbml0aWF0aW5nIHRoZSBtb2JpbGUgcHVzaCBub3RpZmljYXRpb24gc2VuZGluZyB0aHJvdWdoICR7ZW5kcG9pbnRJbmZvfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9ICR7ZXJyfWApO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB1c2VkIHRvIHNlbmQgYW4gZW1haWwgbm90aWZpY2F0aW9uLlxuICAgICAqXG4gICAgICogQHBhcmFtIHNlbmRFbWFpbE5vdGlmaWNhdGlvbklucHV0IHRoZSBub3RpZmljYXRpb24gaW5wdXQgZGV0YWlscyB0byBiZSBwYXNzZWQgaW4sIGluIG9yZGVyIHRvIHNlbmRcbiAgICAgKiBhbiBlbWFpbCBub3RpZmljYXRpb25cbiAgICAgKiBAcGFyYW0gbm90aWZpY2F0aW9uVHlwZSB0aGUgdHlwZSBvZiBub3RpZmljYXRpb24gdG8gc2VuZCBlbWFpbCBub3RpZmljYXRpb25zIGZvclxuICAgICAqXG4gICAgICogQHJldHVybnMgYSB7QGxpbmsgTm90aWZpY2F0aW9uUmVzcG9uc2V9IHJlcHJlc2VudGluZyB0aGUgQ291cmllciBub3RpZmljYXRpb24gcmVzcG9uc2VcbiAgICAgKi9cbiAgICBhc3luYyBzZW5kRW1haWxOb3RpZmljYXRpb24oc2VuZEVtYWlsTm90aWZpY2F0aW9uSW5wdXQ6IFNlbmRFbWFpbE5vdGlmaWNhdGlvbklucHV0LCBub3RpZmljYXRpb25UeXBlOiBOb3RpZmljYXRpb25UeXBlKTogUHJvbWlzZTxOb3RpZmljYXRpb25SZXNwb25zZT4ge1xuICAgICAgICAvLyBlYXNpbHkgaWRlbnRpZmlhYmxlIEFQSSBlbmRwb2ludCBpbmZvcm1hdGlvblxuICAgICAgICBjb25zdCBlbmRwb2ludEluZm8gPSAnUE9TVCAvc2VuZCBlbWFpbCBDb3VyaWVyIEFQSSc7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBBUEkgS2V5IGFuZCBCYXNlIFVSTCwgbmVlZGVkIGluIG9yZGVyIHRvIG1ha2UgdGhlIFBPU1Qgc2VuZCBlbWFpbCBub3RpZmljYXRpb24gdGhyb3VnaCB0aGUgY2xpZW50XG4gICAgICAgICAgICBjb25zdCBbY291cmllckJhc2VVUkwsIG5vdGlmaWNhdGlvbkF1dGhUb2tlbiwgbm90aWZpY2F0aW9uVGVtcGxhdGVJZF0gPSBhd2FpdCBzdXBlci5yZXRyaWV2ZVNlcnZpY2VDcmVkZW50aWFscyhDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5DT1VSSUVSX0lOVEVSTkFMX1NFQ1JFVF9OQU1FLFxuICAgICAgICAgICAgICAgIHVuZGVmaW5lZCwgbm90aWZpY2F0aW9uVHlwZSwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIE5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlLkVtYWlsKTtcblxuICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHdlIG9idGFpbmVkIGFueSBpbnZhbGlkIHNlY3JldCB2YWx1ZXMgZnJvbSB0aGUgY2FsbCBhYm92ZVxuICAgICAgICAgICAgaWYgKGNvdXJpZXJCYXNlVVJMID09PSBudWxsIHx8IGNvdXJpZXJCYXNlVVJMLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbkF1dGhUb2tlbiA9PT0gbnVsbCB8fCBub3RpZmljYXRpb25BdXRoVG9rZW4ubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uVGVtcGxhdGVJZCA9PT0gbnVsbCB8fCBub3RpZmljYXRpb25UZW1wbGF0ZUlkIS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBcIkludmFsaWQgU2VjcmV0cyBvYnRhaW5lZCBmb3IgQ291cmllciBBUEkgY2FsbCFcIjtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFBPU1QgL3NlbmRcbiAgICAgICAgICAgICAqIEBsaW5rIGh0dHBzOi8vd3d3LmNvdXJpZXIuY29tL2RvY3MvcmVmZXJlbmNlL3NlbmQvbWVzc2FnZS9cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBidWlsZCB0aGUgQ291cmllciBBUEkgcmVxdWVzdCBib2R5IHRvIGJlIHBhc3NlZCBpbiwgYW5kIHBlcmZvcm0gYSBQT1NUIHRvIGl0IHdpdGggdGhlIGFwcHJvcHJpYXRlIGluZm9ybWF0aW9uXG4gICAgICAgICAgICAgKiB3ZSBpbXBseSB0aGF0IGlmIHRoZSBBUEkgZG9lcyBub3QgcmVzcG9uZCBpbiAxNSBzZWNvbmRzLCB0aGVuIHdlIGF1dG9tYXRpY2FsbHkgY2F0Y2ggdGhhdCwgYW5kIHJldHVybiBhblxuICAgICAgICAgICAgICogZXJyb3IgZm9yIGEgYmV0dGVyIGN1c3RvbWVyIGV4cGVyaWVuY2UuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGNvbnN0IHJlcXVlc3REYXRhID0ge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IHtcbiAgICAgICAgICAgICAgICAgICAgdG86IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVtYWlsOiBzZW5kRW1haWxOb3RpZmljYXRpb25JbnB1dC5lbWFpbERlc3RpbmF0aW9uXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBub3RpZmljYXRpb25UZW1wbGF0ZUlkLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmdWxsTmFtZTogc2VuZEVtYWlsTm90aWZpY2F0aW9uSW5wdXQudXNlckZ1bGxOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uKHNlbmRFbWFpbE5vdGlmaWNhdGlvbklucHV0LnRyYW5zYWN0aW9ucyAhPT0gdW5kZWZpbmVkICYmIHNlbmRFbWFpbE5vdGlmaWNhdGlvbklucHV0LnRyYW5zYWN0aW9ucyAhPT0gbnVsbCAmJiBzZW5kRW1haWxOb3RpZmljYXRpb25JbnB1dC50cmFuc2FjdGlvbnMubGVuZ3RoICE9PSAwICYmIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbnM6IHNlbmRFbWFpbE5vdGlmaWNhdGlvbklucHV0LnRyYW5zYWN0aW9ucyFcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uKHNlbmRFbWFpbE5vdGlmaWNhdGlvbklucHV0LmRhaWx5RWFybmluZ3NTdW1tYXJ5QW1vdW50ICE9PSB1bmRlZmluZWQgJiYgc2VuZEVtYWlsTm90aWZpY2F0aW9uSW5wdXQuZGFpbHlFYXJuaW5nc1N1bW1hcnlBbW91bnQgIT09IG51bGwgJiYge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhaWx5RWFybmluZ3NTdW1tYXJ5QW1vdW50OiBzZW5kRW1haWxOb3RpZmljYXRpb25JbnB1dC5kYWlseUVhcm5pbmdzU3VtbWFyeUFtb3VudCFcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBDb3VyaWVyIEFQSSByZXF1ZXN0IE9iamVjdDogJHtKU09OLnN0cmluZ2lmeShyZXF1ZXN0RGF0YSl9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiBheGlvcy5wb3N0KGAke2NvdXJpZXJCYXNlVVJMfS9zZW5kYCwgcmVxdWVzdERhdGEsIHtcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgICAgICBcIkF1dGhvcml6YXRpb25cIjogYEJlYXJlciAke25vdGlmaWNhdGlvbkF1dGhUb2tlbn1gXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiAxNTAwMCwgLy8gaW4gbWlsbGlzZWNvbmRzIGhlcmVcbiAgICAgICAgICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlOiAnQ291cmllciBBUEkgdGltZWQgb3V0IGFmdGVyIDE1MDAwbXMhJ1xuICAgICAgICAgICAgfSkudGhlbihzZW5kRW1haWxSZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KHNlbmRFbWFpbFJlc3BvbnNlLmRhdGEpfWApO1xuXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogaWYgd2UgcmVhY2hlZCB0aGlzLCB0aGVuIHdlIGFzc3VtZSB0aGF0IGEgMnh4IHJlc3BvbnNlIGNvZGUgd2FzIHJldHVybmVkLlxuICAgICAgICAgICAgICAgICAqIGNoZWNrIHRoZSBjb250ZW50cyBvZiB0aGUgcmVzcG9uc2UsIGFuZCBhY3QgYXBwcm9wcmlhdGVseS5cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBpZiAoc2VuZEVtYWlsUmVzcG9uc2UuZGF0YSAmJiBzZW5kRW1haWxSZXNwb25zZS5kYXRhW1wicmVxdWVzdElkXCJdKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0SWQ6IHNlbmRFbWFpbFJlc3BvbnNlLmRhdGFbXCJyZXF1ZXN0SWRcIl1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBJbnZhbGlkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tICR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSFgLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvclxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvci5yZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYW5kIHRoZSBzZXJ2ZXIgcmVzcG9uZGVkIHdpdGggYSBzdGF0dXMgY29kZVxuICAgICAgICAgICAgICAgICAgICAgKiB0aGF0IGZhbGxzIG91dCBvZiB0aGUgcmFuZ2Ugb2YgMnh4LlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vbiAyeHh4IHJlc3BvbnNlIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBDb3VyaWVyIEFQSSwgd2l0aCBzdGF0dXMgJHtlcnJvci5yZXNwb25zZS5zdGF0dXN9LCBhbmQgcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShlcnJvci5yZXNwb25zZS5kYXRhKX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGFueSBvdGhlciBzcGVjaWZpYyBlcnJvcnMgdG8gYmUgZmlsdGVyZWQgYmVsb3dcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3IucmVxdWVzdCkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYnV0IG5vIHJlc3BvbnNlIHdhcyByZWNlaXZlZFxuICAgICAgICAgICAgICAgICAgICAgKiBgZXJyb3IucmVxdWVzdGAgaXMgYW4gaW5zdGFuY2Ugb2YgWE1MSHR0cFJlcXVlc3QgaW4gdGhlIGJyb3dzZXIgYW5kIGFuIGluc3RhbmNlIG9mXG4gICAgICAgICAgICAgICAgICAgICAqICBodHRwLkNsaWVudFJlcXVlc3QgaW4gbm9kZS5qcy5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBObyByZXNwb25zZSByZWNlaXZlZCB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gQ291cmllciBBUEksIGZvciByZXF1ZXN0ICR7ZXJyb3IucmVxdWVzdH1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBTb21ldGhpbmcgaGFwcGVuZWQgaW4gc2V0dGluZyB1cCB0aGUgcmVxdWVzdCB0aGF0IHRyaWdnZXJlZCBhbiBFcnJvclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IGZvciB0aGUgJHtlbmRwb2ludEluZm99IENvdXJpZXIgQVBJLCAkeyhlcnJvciAmJiBlcnJvci5tZXNzYWdlKSAmJiBlcnJvci5tZXNzYWdlfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGluaXRpYXRpbmcgdGhlIGVtYWlsIG5vdGlmaWNhdGlvbiBzZW5kaW5nIHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJ9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHVzZWQgdG8gc2VuZCBhIGJ1bGsgbW9iaWxlIHB1c2ggbm90aWZpY2F0aW9uLlxuICAgICAqXG4gICAgICogQHBhcmFtIHNlbmRCdWxrTW9iaWxlUHVzaE5vdGlmaWNhdGlvbklucHV0IHRoZSBub3RpZmljYXRpb24gaW5wdXQgZGV0YWlscyB0byBiZSBwYXNzZWQgaW4sIGluIG9yZGVyIHRvIHNlbmRcbiAgICAgKiBhIGJ1bGsgbW9iaWxlIHB1c2ggbm90aWZpY2F0aW9uXG4gICAgICogQHBhcmFtIG5vdGlmaWNhdGlvblR5cGUgdGhlIHR5cGUgb2Ygbm90aWZpY2F0aW9uIHRvIHNlbmQgZW1haWwgbm90aWZpY2F0aW9ucyBmb3JcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIGEge0BsaW5rIE5vdGlmaWNhdGlvblJlc3BvbnNlfSByZXByZXNlbnRpbmcgdGhlIENvdXJpZXIgbm90aWZpY2F0aW9uIHJlc3BvbnNlXG4gICAgICovXG4gICAgYXN5bmMgc2VuZEJ1bGtNb2JpbGVQdXNoTm90aWZpY2F0aW9uKHNlbmRCdWxrTW9iaWxlUHVzaE5vdGlmaWNhdGlvbklucHV0OiBTZW5kQnVsa01vYmlsZVB1c2hOb3RpZmljYXRpb25JbnB1dCwgbm90aWZpY2F0aW9uVHlwZTogTm90aWZpY2F0aW9uVHlwZSk6IFByb21pc2U8Tm90aWZpY2F0aW9uUmVzcG9uc2U+IHtcbiAgICAgICAgLy8gZWFzaWx5IGlkZW50aWZpYWJsZSBBUEkgZW5kcG9pbnQgaW5mb3JtYXRpb25cbiAgICAgICAgY29uc3QgZW5kcG9pbnRJbmZvID0gJ1BPU1QgL3NlbmQgQlVMSyBtb2JpbGUgcHVzaCBDb3VyaWVyIEFQSSc7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNlbmRpbmcgYSBidWxrIG5vdGlmaWNhdGlvbiBjb25zaXN0cyBvZiB0aGUgZm9sbG93aW5nIHN0ZXBzOlxuICAgICAgICAgKlxuICAgICAgICAgKiAxKSBDcmVhdGUgYSBidWxrIGpvYiBhbmQgb2J0YWluaW5nIGl0cyBqb2IgaWQgZnJvbSB0aGUgcmVzcG9uc2UuXG4gICAgICAgICAqIDIpIFVzZSB0aGF0IGJ1bGsgam9iIHRvIGFkZCBhbGwgYXBwbGljYWJsZSB1c2VycyB0byBpdC5cbiAgICAgICAgICogMykgU2NoZWR1bGUvc3RhcnQgdGhhdCBqb2IuXG4gICAgICAgICAqL1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gMSkgQ3JlYXRlIGEgYnVsayBqb2IgYW5kIG9idGFpbmluZyBpdHMgam9iIGlkIGZyb20gdGhlIHJlc3BvbnNlLlxuICAgICAgICAgICAgY29uc3QgYnVsa05vdGlmaWNhdGlvbkpvYklkID0gYXdhaXQgdGhpcy5jcmVhdGVCdWxrTm90aWZpY2F0aW9uSm9iKG5vdGlmaWNhdGlvblR5cGUsIE5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlLlB1c2gpO1xuICAgICAgICAgICAgLy8gZW5zdXJlIHRoYXQgdGhlIGJ1bGsgam9iIGNyZWF0aW9uIHN1Y2NlZWRlZFxuICAgICAgICAgICAgaWYgKGJ1bGtOb3RpZmljYXRpb25Kb2JJZCAhPT0gbnVsbCAmJiBidWxrTm90aWZpY2F0aW9uSm9iSWQubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgLy8gMikgVXNlIHRoYXQgYnVsayBqb2IgdG8gYWRkIGFsbCBhcHBsaWNhYmxlIHVzZXJzIHRvIGl0LlxuICAgICAgICAgICAgICAgIGNvbnN0IGJ1bGtVc2Vyc0luZ2VzdGlvbkZsYWcgPSBhd2FpdCB0aGlzLmluZ2VzdEJ1bGtKb2JVc2Vyc0Zvck1vYmlsZVB1c2goYnVsa05vdGlmaWNhdGlvbkpvYklkLCBub3RpZmljYXRpb25UeXBlLCBOb3RpZmljYXRpb25DaGFubmVsVHlwZS5QdXNoLCBzZW5kQnVsa01vYmlsZVB1c2hOb3RpZmljYXRpb25JbnB1dCk7XG4gICAgICAgICAgICAgICAgLy8gZW5zdXJlIHRoYXQgdGhlIHVzZXJzIGluZ2VzdGlvbiB3YXMgc3VjY2Vzc2Z1bFxuICAgICAgICAgICAgICAgIGlmIChidWxrVXNlcnNJbmdlc3Rpb25GbGFnKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIDMpIFNjaGVkdWxlL3N0YXJ0IHRoYXQgam9iLlxuICAgICAgICAgICAgICAgICAgICBjb25zdCBidWxrSm9iUnVuRmxhZyA9IGF3YWl0IHRoaXMucnVuQnVsa05vdGlmaWNhdGlvbkpvYihidWxrTm90aWZpY2F0aW9uSm9iSWQsIG5vdGlmaWNhdGlvblR5cGUsIE5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlLlB1c2gpO1xuICAgICAgICAgICAgICAgICAgICAvLyBlbnN1cmUgdGhhdCB0aGUgYnVsayBqb2IgcmFuIHN1Y2Nlc3NmdWxseVxuICAgICAgICAgICAgICAgICAgICBpZiAoYnVsa0pvYlJ1bkZsYWcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgam9iIGlkXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVlc3RJZDogYnVsa05vdGlmaWNhdGlvbkpvYklkIVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgcnVubmluZy9zY2hlZHVsaW5nIHRoZSBidWxrIGpvYiBmb3IgbW9iaWxlIHB1c2ggbm90aWZpY2F0aW9ucyB0aHJvdWdoICR7ZW5kcG9pbnRJbmZvfWA7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBpbmdlc3RpbmcgdXNlcnMgZm9yIHRoZSBidWxrIGpvYiBmb3IgbW9iaWxlIHB1c2ggbm90aWZpY2F0aW9ucyB0aHJvdWdoICR7ZW5kcG9pbnRJbmZvfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgY3JlYXRpbmcgdGhlIGJ1bGsgam9iIGZvciBtb2JpbGUgcHVzaCBub3RpZmljYXRpb25zIHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGluaXRpYXRpbmcgdGhlIGJ1bGsgbW9iaWxlIHB1c2ggbm90aWZpY2F0aW9uIHNlbmRpbmcgdGhyb3VnaCAke2VuZHBvaW50SW5mb31gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfSAke2Vycn1gKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdXNlZCB0byBzZW5kIGEgYnVsayBlbWFpbCBub3RpZmljYXRpb24uXG4gICAgICpcbiAgICAgKiBAcGFyYW0gc2VuZEJ1bGtFbWFpbE5vdGlmaWNhdGlvbklucHV0IHRoZSBub3RpZmljYXRpb24gaW5wdXQgZGV0YWlscyB0byBiZSBwYXNzZWQgaW4sIGluIG9yZGVyIHRvIHNlbmRcbiAgICAgKiBhIGJ1bGsgZW1haWwgbm90aWZpY2F0aW9uXG4gICAgICogQHBhcmFtIG5vdGlmaWNhdGlvblR5cGUgdGhlIHR5cGUgb2Ygbm90aWZpY2F0aW9uIHRvIHNlbmQgZW1haWwgbm90aWZpY2F0aW9ucyBmb3JcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIGEge0BsaW5rIE5vdGlmaWNhdGlvblJlc3BvbnNlfSByZXByZXNlbnRpbmcgdGhlIENvdXJpZXIgbm90aWZpY2F0aW9uIHJlc3BvbnNlXG4gICAgICovXG4gICAgYXN5bmMgc2VuZEJ1bGtFbWFpbE5vdGlmaWNhdGlvbihzZW5kQnVsa0VtYWlsTm90aWZpY2F0aW9uSW5wdXQ6IFNlbmRCdWxrRW1haWxOb3RpZmljYXRpb25JbnB1dCwgbm90aWZpY2F0aW9uVHlwZTogTm90aWZpY2F0aW9uVHlwZSk6IFByb21pc2U8Tm90aWZpY2F0aW9uUmVzcG9uc2U+IHtcbiAgICAgICAgLy8gZWFzaWx5IGlkZW50aWZpYWJsZSBBUEkgZW5kcG9pbnQgaW5mb3JtYXRpb25cbiAgICAgICAgY29uc3QgZW5kcG9pbnRJbmZvID0gJ1BPU1QgL3NlbmQgQlVMSyBlbWFpbCBDb3VyaWVyIEFQSSc7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNlbmRpbmcgYSBidWxrIG5vdGlmaWNhdGlvbiBjb25zaXN0cyBvZiB0aGUgZm9sbG93aW5nIHN0ZXBzOlxuICAgICAgICAgKlxuICAgICAgICAgKiAxKSBDcmVhdGUgYSBidWxrIGpvYiBhbmQgb2J0YWluaW5nIGl0cyBqb2IgaWQgZnJvbSB0aGUgcmVzcG9uc2UuXG4gICAgICAgICAqIDIpIFVzZSB0aGF0IGJ1bGsgam9iIHRvIGFkZCBhbGwgYXBwbGljYWJsZSB1c2VycyB0byBpdC5cbiAgICAgICAgICogMykgU2NoZWR1bGUvc3RhcnQgdGhhdCBqb2IuXG4gICAgICAgICAqL1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gMSkgQ3JlYXRlIGEgYnVsayBqb2IgYW5kIG9idGFpbmluZyBpdHMgam9iIGlkIGZyb20gdGhlIHJlc3BvbnNlLlxuICAgICAgICAgICAgY29uc3QgYnVsa05vdGlmaWNhdGlvbkpvYklkID0gYXdhaXQgdGhpcy5jcmVhdGVCdWxrTm90aWZpY2F0aW9uSm9iKG5vdGlmaWNhdGlvblR5cGUsIE5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlLkVtYWlsKTtcbiAgICAgICAgICAgIC8vIGVuc3VyZSB0aGF0IHRoZSBidWxrIGpvYiBjcmVhdGlvbiBzdWNjZWVkZWRcbiAgICAgICAgICAgIGlmIChidWxrTm90aWZpY2F0aW9uSm9iSWQgIT09IG51bGwgJiYgYnVsa05vdGlmaWNhdGlvbkpvYklkLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgICAgIC8vIDIpIFVzZSB0aGF0IGJ1bGsgam9iIHRvIGFkZCBhbGwgYXBwbGljYWJsZSB1c2VycyB0byBpdC5cbiAgICAgICAgICAgICAgICBjb25zdCBidWxrVXNlcnNJbmdlc3Rpb25GbGFnID0gYXdhaXQgdGhpcy5pbmdlc3RCdWxrSm9iVXNlcnNGb3JFbWFpbChidWxrTm90aWZpY2F0aW9uSm9iSWQsIG5vdGlmaWNhdGlvblR5cGUsIE5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlLkVtYWlsLCBzZW5kQnVsa0VtYWlsTm90aWZpY2F0aW9uSW5wdXQpO1xuICAgICAgICAgICAgICAgIC8vIGVuc3VyZSB0aGF0IHRoZSB1c2VycyBpbmdlc3Rpb24gd2FzIHN1Y2Nlc3NmdWxcbiAgICAgICAgICAgICAgICBpZiAoYnVsa1VzZXJzSW5nZXN0aW9uRmxhZykge1xuICAgICAgICAgICAgICAgICAgICAvLyAzKSBTY2hlZHVsZS9zdGFydCB0aGF0IGpvYi5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYnVsa0pvYlJ1bkZsYWcgPSBhd2FpdCB0aGlzLnJ1bkJ1bGtOb3RpZmljYXRpb25Kb2IoYnVsa05vdGlmaWNhdGlvbkpvYklkLCBub3RpZmljYXRpb25UeXBlLCBOb3RpZmljYXRpb25DaGFubmVsVHlwZS5FbWFpbCk7XG4gICAgICAgICAgICAgICAgICAgIC8vIGVuc3VyZSB0aGF0IHRoZSBidWxrIGpvYiByYW4gc3VjY2Vzc2Z1bGx5XG4gICAgICAgICAgICAgICAgICAgIGlmIChidWxrSm9iUnVuRmxhZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBqb2IgaWRcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdElkOiBidWxrTm90aWZpY2F0aW9uSm9iSWQhXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBydW5uaW5nL3NjaGVkdWxpbmcgdGhlIGJ1bGsgam9iIGZvciBlbWFpbCBub3RpZmljYXRpb25zIHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGluZ2VzdGluZyB1c2VycyBmb3IgdGhlIGJ1bGsgam9iIGZvciBlbWFpbCBub3RpZmljYXRpb25zIHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBjcmVhdGluZyB0aGUgYnVsayBqb2IgZm9yIGVtYWlsIG5vdGlmaWNhdGlvbnMgdGhyb3VnaCAke2VuZHBvaW50SW5mb31gO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgaW5pdGlhdGluZyB0aGUgYnVsayBlbWFpbCBub3RpZmljYXRpb24gc2VuZGluZyB0aHJvdWdoICR7ZW5kcG9pbnRJbmZvfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9ICR7ZXJyfWApO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB1c2VkIHRvIHN0YXJ0L3NjaGVkdWxlIGEgYnVsayBqb2IuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gam9iSWQgdGhlIGlkIG9mIHRoZSBqb2IgdG8gc3RhcnQvc2NoZWR1bGluZyBmb3IgcnVubmluZ1xuICAgICAqIEBwYXJhbSBub3RpZmljYXRpb25UeXBlIG5vdGlmaWNhdGlvbiB0eXBlIHRvIHN0YXJ0IHRoZSBqb2IgZm9yXG4gICAgICogQHBhcmFtIG5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlIHRoZSB0eXBlIG9mIG5vdGlmaWNhdGlvbiBjaGFubmVsXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIGEge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBib29sZWFufSBkZXBlbmRpbmcgb24gd2hldGhlciB0aGUgam9iIHJ1biB3YXMgc3VjY2Vzc2Z1bCBvciBub3QuXG4gICAgICovXG4gICAgYXN5bmMgcnVuQnVsa05vdGlmaWNhdGlvbkpvYihqb2JJZDogc3RyaW5nLCBub3RpZmljYXRpb25UeXBlOiBOb3RpZmljYXRpb25UeXBlLCBub3RpZmljYXRpb25DaGFubmVsVHlwZTogTm90aWZpY2F0aW9uQ2hhbm5lbFR5cGUpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgLy8gZWFzaWx5IGlkZW50aWZpYWJsZSBBUEkgZW5kcG9pbnQgaW5mb3JtYXRpb25cbiAgICAgICAgY29uc3QgZW5kcG9pbnRJbmZvID0gJ1BPU1QgL2J1bGsve2pvYklkfS9ydW4gQ291cmllciBBUEknO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyByZXRyaWV2ZSB0aGUgQVBJIEtleSBhbmQgQmFzZSBVUkwsIG5lZWRlZCBpbiBvcmRlciB0byBtYWtlIHRoZSBQT1NUIHNlbmQgZW1haWwgbm90aWZpY2F0aW9uIHRocm91Z2ggdGhlIGNsaWVudFxuICAgICAgICAgICAgY29uc3QgW2NvdXJpZXJCYXNlVVJMLCBub3RpZmljYXRpb25BdXRoVG9rZW4sIG5vdGlmaWNhdGlvblRlbXBsYXRlSWRdID0gYXdhaXQgc3VwZXIucmV0cmlldmVTZXJ2aWNlQ3JlZGVudGlhbHMoQ29uc3RhbnRzLkFXU1BhaXJDb25zdGFudHMuQ09VUklFUl9JTlRFUk5BTF9TRUNSRVRfTkFNRSxcbiAgICAgICAgICAgICAgICB1bmRlZmluZWQsIG5vdGlmaWNhdGlvblR5cGUsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBub3RpZmljYXRpb25DaGFubmVsVHlwZSk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB3ZSBvYnRhaW5lZCBhbnkgaW52YWxpZCBzZWNyZXQgdmFsdWVzIGZyb20gdGhlIGNhbGwgYWJvdmVcbiAgICAgICAgICAgIGlmIChjb3VyaWVyQmFzZVVSTCA9PT0gbnVsbCB8fCBjb3VyaWVyQmFzZVVSTC5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25BdXRoVG9rZW4gPT09IG51bGwgfHwgbm90aWZpY2F0aW9uQXV0aFRva2VuLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvblRlbXBsYXRlSWQgPT09IG51bGwgfHwgbm90aWZpY2F0aW9uVGVtcGxhdGVJZCEubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gXCJJbnZhbGlkIFNlY3JldHMgb2J0YWluZWQgZm9yIENvdXJpZXIgQVBJIGNhbGwhXCI7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBQT1NUIC9idWxrL3tqb2JJZH0vcnVuXG4gICAgICAgICAgICAgKiBAbGluayBodHRwczovL3d3dy5jb3VyaWVyLmNvbS9kb2NzL3R1dG9yaWFscy9ob3ctdG8tc2VuZC1idWxrLW5vdGlmaWNhdGlvbnMvXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogYnVpbGQgdGhlIENvdXJpZXIgQVBJIHJlcXVlc3QgYm9keSB0byBiZSBwYXNzZWQgaW4sIGFuZCBwZXJmb3JtIGEgUE9TVCB0byBpdCB3aXRoIHRoZSBhcHByb3ByaWF0ZSBpbmZvcm1hdGlvblxuICAgICAgICAgICAgICogd2UgaW1wbHkgdGhhdCBpZiB0aGUgQVBJIGRvZXMgbm90IHJlc3BvbmQgaW4gMTUgc2Vjb25kcywgdGhlbiB3ZSBhdXRvbWF0aWNhbGx5IGNhdGNoIHRoYXQsIGFuZCByZXR1cm4gYW5cbiAgICAgICAgICAgICAqIGVycm9yIGZvciBhIGJldHRlciBjdXN0b21lciBleHBlcmllbmNlLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICByZXR1cm4gYXhpb3MucG9zdChgJHtjb3VyaWVyQmFzZVVSTH0vYnVsay8ke2pvYklkfS9ydW5gLCB7fSwge1xuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiQXV0aG9yaXphdGlvblwiOiBgQmVhcmVyICR7bm90aWZpY2F0aW9uQXV0aFRva2VufWBcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDE1MDAwLCAvLyBpbiBtaWxsaXNlY29uZHMgaGVyZVxuICAgICAgICAgICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2U6ICdDb3VyaWVyIEFQSSB0aW1lZCBvdXQgYWZ0ZXIgMTUwMDBtcyEnXG4gICAgICAgICAgICB9KS50aGVuKHN0YXJ0QnVsa0pvYk5vdGlmaWNhdGlvblJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlbmRwb2ludEluZm99IHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoc3RhcnRCdWxrSm9iTm90aWZpY2F0aW9uUmVzcG9uc2UuZGF0YSl9YCk7XG5cbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiBpZiB3ZSByZWFjaGVkIHRoaXMsIHRoZW4gd2UgYXNzdW1lIHRoYXQgYSAyeHggcmVzcG9uc2UgY29kZSB3YXMgcmV0dXJuZWQuXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yLnJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBhbmQgdGhlIHNlcnZlciByZXNwb25kZWQgd2l0aCBhIHN0YXR1cyBjb2RlXG4gICAgICAgICAgICAgICAgICAgICAqIHRoYXQgZmFsbHMgb3V0IG9mIHRoZSByYW5nZSBvZiAyeHguXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm9uIDJ4eHggcmVzcG9uc2Ugd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IENvdXJpZXIgQVBJLCB3aXRoIHN0YXR1cyAke2Vycm9yLnJlc3BvbnNlLnN0YXR1c30sIGFuZCByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGVycm9yLnJlc3BvbnNlLmRhdGEpfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gYW55IG90aGVyIHNwZWNpZmljIGVycm9ycyB0byBiZSBmaWx0ZXJlZCBiZWxvd1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5yZXF1ZXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBidXQgbm8gcmVzcG9uc2Ugd2FzIHJlY2VpdmVkXG4gICAgICAgICAgICAgICAgICAgICAqIGBlcnJvci5yZXF1ZXN0YCBpcyBhbiBpbnN0YW5jZSBvZiBYTUxIdHRwUmVxdWVzdCBpbiB0aGUgYnJvd3NlciBhbmQgYW4gaW5zdGFuY2Ugb2ZcbiAgICAgICAgICAgICAgICAgICAgICogIGh0dHAuQ2xpZW50UmVxdWVzdCBpbiBub2RlLmpzLlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vIHJlc3BvbnNlIHJlY2VpdmVkIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBDb3VyaWVyIEFQSSwgZm9yIHJlcXVlc3QgJHtlcnJvci5yZXF1ZXN0fWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNvbWV0aGluZyBoYXBwZW5lZCBpbiBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IHRoYXQgdHJpZ2dlcmVkIGFuIEVycm9yXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgZm9yIHRoZSAke2VuZHBvaW50SW5mb30gQ291cmllciBBUEksICR7KGVycm9yICYmIGVycm9yLm1lc3NhZ2UpICYmIGVycm9yLm1lc3NhZ2V9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgaW5pdGlhdGluZyB0aGUgYnVsayBqb2IgcnVuIHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJ9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHVzZWQgdG8gaW5nZXN0IHVzZXJzIGZvciBhIG1vYmlsZS1wdXNoIGJhc2VkIGJ1bGsgam9iIG5lZWRpbmcgdG8gYmUgcnVuLlxuICAgICAqXG4gICAgICogQHBhcmFtIGpvYklkIHRoZSBpZCBvZiB0aGUgam9iIHdoaWNoIHdlIGFyZSBpbmdlc3RpbmcgdGhlIHVzZXJzIGZvclxuICAgICAqIEBwYXJhbSBub3RpZmljYXRpb25UeXBlIHRoZSB0eXBlIG9mIG5vdGlmaWNhdGlvbiBmb3Igd2hpY2ggd2UgYXJlIGluZ2VzdGluZyB1c2VycyBmb3JcbiAgICAgKiBAcGFyYW0gbm90aWZpY2F0aW9uQ2hhbm5lbFR5cGUgdGhlIHR5cGUgb2Ygbm90aWZpY2F0aW9uIGNoYW5uZWxcbiAgICAgKiBAcGFyYW0gc2VuZEJ1bGtNb2JpbGVQdXNoTm90aWZpY2F0aW9uSW5wdXQgdGhlIGJ1bGsgbW9iaWxlIHB1c2ggaW5wdXQsIHVzZWQgdG8gaW5nZXN0IHVzZXJzXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIGEge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBib29sZWFufSByZXByZXNlbnRpbmcgYSBmbGFnIHRvIGhpZ2hsaWdodCB3aGV0aGVyIHRoZVxuICAgICAqIHVzZXIgaW5nZXN0aW9uIGFjdGl2aXR5IHdhcyBzdWNjZXNzZnVsIG9yIG5vdC5cbiAgICAgKi9cbiAgICBhc3luYyBpbmdlc3RCdWxrSm9iVXNlcnNGb3JNb2JpbGVQdXNoKGpvYklkOiBzdHJpbmcsIG5vdGlmaWNhdGlvblR5cGU6IE5vdGlmaWNhdGlvblR5cGUsIG5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlOiBOb3RpZmljYXRpb25DaGFubmVsVHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbmRCdWxrTW9iaWxlUHVzaE5vdGlmaWNhdGlvbklucHV0OiBTZW5kQnVsa01vYmlsZVB1c2hOb3RpZmljYXRpb25JbnB1dCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgICAvLyBlYXNpbHkgaWRlbnRpZmlhYmxlIEFQSSBlbmRwb2ludCBpbmZvcm1hdGlvblxuICAgICAgICBjb25zdCBlbmRwb2ludEluZm8gPSAnUE9TVCAvYnVsay97am9iSWR9IG1vYmlsZSBwdXNoIENvdXJpZXIgQVBJJztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIEFQSSBLZXkgYW5kIEJhc2UgVVJMLCBuZWVkZWQgaW4gb3JkZXIgdG8gbWFrZSB0aGUgUE9TVCBzZW5kIGVtYWlsIG5vdGlmaWNhdGlvbiB0aHJvdWdoIHRoZSBjbGllbnRcbiAgICAgICAgICAgIGNvbnN0IFtjb3VyaWVyQmFzZVVSTCwgbm90aWZpY2F0aW9uQXV0aFRva2VuLCBub3RpZmljYXRpb25UZW1wbGF0ZUlkXSA9IGF3YWl0IHN1cGVyLnJldHJpZXZlU2VydmljZUNyZWRlbnRpYWxzKENvbnN0YW50cy5BV1NQYWlyQ29uc3RhbnRzLkNPVVJJRVJfSU5URVJOQUxfU0VDUkVUX05BTUUsXG4gICAgICAgICAgICAgICAgdW5kZWZpbmVkLCBub3RpZmljYXRpb25UeXBlLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgbm90aWZpY2F0aW9uQ2hhbm5lbFR5cGUpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgd2Ugb2J0YWluZWQgYW55IGludmFsaWQgc2VjcmV0IHZhbHVlcyBmcm9tIHRoZSBjYWxsIGFib3ZlXG4gICAgICAgICAgICBpZiAoY291cmllckJhc2VVUkwgPT09IG51bGwgfHwgY291cmllckJhc2VVUkwubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uQXV0aFRva2VuID09PSBudWxsIHx8IG5vdGlmaWNhdGlvbkF1dGhUb2tlbi5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25UZW1wbGF0ZUlkID09PSBudWxsIHx8IG5vdGlmaWNhdGlvblRlbXBsYXRlSWQhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IFwiSW52YWxpZCBTZWNyZXRzIG9idGFpbmVkIGZvciBDb3VyaWVyIEFQSSBjYWxsIVwiO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogUE9TVCAvYnVsay97am9iSWR9XG4gICAgICAgICAgICAgKiBAbGluayBodHRwczovL3d3dy5jb3VyaWVyLmNvbS9kb2NzL3R1dG9yaWFscy9ob3ctdG8tc2VuZC1idWxrLW5vdGlmaWNhdGlvbnMvXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogYnVpbGQgdGhlIENvdXJpZXIgQVBJIHJlcXVlc3QgYm9keSB0byBiZSBwYXNzZWQgaW4sIGFuZCBwZXJmb3JtIGEgUE9TVCB0byBpdCB3aXRoIHRoZSBhcHByb3ByaWF0ZSBpbmZvcm1hdGlvblxuICAgICAgICAgICAgICogd2UgaW1wbHkgdGhhdCBpZiB0aGUgQVBJIGRvZXMgbm90IHJlc3BvbmQgaW4gMTUgc2Vjb25kcywgdGhlbiB3ZSBhdXRvbWF0aWNhbGx5IGNhdGNoIHRoYXQsIGFuZCByZXR1cm4gYW5cbiAgICAgICAgICAgICAqIGVycm9yIGZvciBhIGJldHRlciBjdXN0b21lciBleHBlcmllbmNlLlxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIEZpcnN0IGJ1aWxkIHRoZSByZXF1ZXN0IGRhdGEgZnJvbSB0aGUgYnVsayBpbnB1dCBwYXNzZWQgaW5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgY29uc3QgaW5nZXN0ZWRVc2VyczogYW55W10gPSBbXTtcbiAgICAgICAgICAgIHNlbmRCdWxrTW9iaWxlUHVzaE5vdGlmaWNhdGlvbklucHV0Lm1vYmlsZVB1c2hOb3RpZmljYXRpb25JbnB1dHMuZm9yRWFjaChtb2JpbGVQdXNoTm90aWZpY2F0aW9uSW5wdXQgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChtb2JpbGVQdXNoTm90aWZpY2F0aW9uSW5wdXQgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5nZXN0ZWRVc2Vycy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2ZpbGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHBvOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRva2VuczogbW9iaWxlUHVzaE5vdGlmaWNhdGlvbklucHV0LmV4cG9QdXNoVG9rZW5zXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VyX2lkOiBgZXhwb18ke0RhdGUucGFyc2UobmV3IERhdGUoKS50b0lTT1N0cmluZygpKX1gXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IG5vdGlmaWNhdGlvblRlbXBsYXRlSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICB0bzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cG86IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW5zOiBtb2JpbGVQdXNoTm90aWZpY2F0aW9uSW5wdXQuZXhwb1B1c2hUb2tlbnNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uKG1vYmlsZVB1c2hOb3RpZmljYXRpb25JbnB1dC5pbmVsaWdpYmxlVHJhbnNhY3Rpb25BbW91bnQgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vYmlsZVB1c2hOb3RpZmljYXRpb25JbnB1dC5pbmVsaWdpYmxlVHJhbnNhY3Rpb25BbW91bnQgIT09IG51bGwgJiYge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmVsaWdpYmxlVHJhbnNhY3Rpb25BbW91bnQ6IG1vYmlsZVB1c2hOb3RpZmljYXRpb25JbnB1dC5pbmVsaWdpYmxlVHJhbnNhY3Rpb25BbW91bnQhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLigobW9iaWxlUHVzaE5vdGlmaWNhdGlvbklucHV0LnBlbmRpbmdDYXNoYmFjayA9PT0gdW5kZWZpbmVkIHx8IG1vYmlsZVB1c2hOb3RpZmljYXRpb25JbnB1dC5wZW5kaW5nQ2FzaGJhY2sgPT09IG51bGwpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJiYgbW9iaWxlUHVzaE5vdGlmaWNhdGlvbklucHV0Lm1lcmNoYW50TmFtZSAhPT0gdW5kZWZpbmVkICYmIG1vYmlsZVB1c2hOb3RpZmljYXRpb25JbnB1dC5tZXJjaGFudE5hbWUgIT09IG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAmJiBtb2JpbGVQdXNoTm90aWZpY2F0aW9uSW5wdXQubWVyY2hhbnROYW1lLmxlbmd0aCAhPT0gMCAmJiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lcmNoYW50TmFtZTogbW9iaWxlUHVzaE5vdGlmaWNhdGlvbklucHV0Lm1lcmNoYW50TmFtZSFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uKG1vYmlsZVB1c2hOb3RpZmljYXRpb25JbnB1dC5wZW5kaW5nQ2FzaGJhY2sgIT09IHVuZGVmaW5lZCAmJiBtb2JpbGVQdXNoTm90aWZpY2F0aW9uSW5wdXQucGVuZGluZ0Nhc2hiYWNrICE9PSBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJiYgbW9iaWxlUHVzaE5vdGlmaWNhdGlvbklucHV0Lm1lcmNoYW50TmFtZSAhPT0gdW5kZWZpbmVkICYmIG1vYmlsZVB1c2hOb3RpZmljYXRpb25JbnB1dC5tZXJjaGFudE5hbWUgIT09IG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAmJiBtb2JpbGVQdXNoTm90aWZpY2F0aW9uSW5wdXQubWVyY2hhbnROYW1lLmxlbmd0aCAhPT0gMCAmJiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBlbmRpbmdDYXNoYmFjazogbW9iaWxlUHVzaE5vdGlmaWNhdGlvbklucHV0LnBlbmRpbmdDYXNoYmFjayEudG9TdHJpbmcoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lcmNoYW50TmFtZTogbW9iaWxlUHVzaE5vdGlmaWNhdGlvbklucHV0Lm1lcmNoYW50TmFtZSFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uKG1vYmlsZVB1c2hOb3RpZmljYXRpb25JbnB1dC5kYWlseUVhcm5pbmdzU3VtbWFyeUFtb3VudCAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9iaWxlUHVzaE5vdGlmaWNhdGlvbklucHV0LmRhaWx5RWFybmluZ3NTdW1tYXJ5QW1vdW50ICE9PSBudWxsICYmIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGFpbHlFYXJuaW5nc1N1bW1hcnlBbW91bnQ6IG1vYmlsZVB1c2hOb3RpZmljYXRpb25JbnB1dC5kYWlseUVhcm5pbmdzU3VtbWFyeUFtb3VudCEudG9TdHJpbmcoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjb25zdCByZXF1ZXN0RGF0YSA9IHtcbiAgICAgICAgICAgICAgICB1c2VyczogaW5nZXN0ZWRVc2Vyc1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBheGlvcy5wb3N0KGAke2NvdXJpZXJCYXNlVVJMfS9idWxrLyR7am9iSWR9YCwgcmVxdWVzdERhdGEsIHtcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgICAgICBcIkF1dGhvcml6YXRpb25cIjogYEJlYXJlciAke25vdGlmaWNhdGlvbkF1dGhUb2tlbn1gXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiAxNTAwMCwgLy8gaW4gbWlsbGlzZWNvbmRzIGhlcmVcbiAgICAgICAgICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlOiAnQ291cmllciBBUEkgdGltZWQgb3V0IGFmdGVyIDE1MDAwbXMhJ1xuICAgICAgICAgICAgfSkudGhlbihpbmdlc3RCdWxrSm9iVXNlcnNGb3JNb2JpbGVQdXNoUmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShpbmdlc3RCdWxrSm9iVXNlcnNGb3JNb2JpbGVQdXNoUmVzcG9uc2UuZGF0YSl9YCk7XG5cbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiBpZiB3ZSByZWFjaGVkIHRoaXMsIHRoZW4gd2UgYXNzdW1lIHRoYXQgYSAyeHggcmVzcG9uc2UgY29kZSB3YXMgcmV0dXJuZWQuXG4gICAgICAgICAgICAgICAgICogY2hlY2sgdGhlIGNvbnRlbnRzIG9mIHRoZSByZXNwb25zZSwgYW5kIGFjdCBhcHByb3ByaWF0ZWx5LlxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGlmIChpbmdlc3RCdWxrSm9iVXNlcnNGb3JNb2JpbGVQdXNoUmVzcG9uc2UuZGF0YSAmJlxuICAgICAgICAgICAgICAgICAgICAoIWluZ2VzdEJ1bGtKb2JVc2Vyc0Zvck1vYmlsZVB1c2hSZXNwb25zZS5kYXRhW1wiZXJyb3JzXCJdIHx8IChpbmdlc3RCdWxrSm9iVXNlcnNGb3JNb2JpbGVQdXNoUmVzcG9uc2UuZGF0YVtcImVycm9yc1wiXSAmJiBpbmdlc3RCdWxrSm9iVXNlcnNGb3JNb2JpbGVQdXNoUmVzcG9uc2UuZGF0YVtcImVycm9yc1wiXS5sZW5ndGggPT09IDApKSAmJlxuICAgICAgICAgICAgICAgICAgICBpbmdlc3RCdWxrSm9iVXNlcnNGb3JNb2JpbGVQdXNoUmVzcG9uc2UuZGF0YVtcInRvdGFsXCJdICYmIGluZ2VzdEJ1bGtKb2JVc2Vyc0Zvck1vYmlsZVB1c2hSZXNwb25zZS5kYXRhW1widG90YWxcIl0gPT09IGluZ2VzdGVkVXNlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yLnJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBhbmQgdGhlIHNlcnZlciByZXNwb25kZWQgd2l0aCBhIHN0YXR1cyBjb2RlXG4gICAgICAgICAgICAgICAgICAgICAqIHRoYXQgZmFsbHMgb3V0IG9mIHRoZSByYW5nZSBvZiAyeHguXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm9uIDJ4eHggcmVzcG9uc2Ugd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IENvdXJpZXIgQVBJLCB3aXRoIHN0YXR1cyAke2Vycm9yLnJlc3BvbnNlLnN0YXR1c30sIGFuZCByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGVycm9yLnJlc3BvbnNlLmRhdGEpfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gYW55IG90aGVyIHNwZWNpZmljIGVycm9ycyB0byBiZSBmaWx0ZXJlZCBiZWxvd1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5yZXF1ZXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBidXQgbm8gcmVzcG9uc2Ugd2FzIHJlY2VpdmVkXG4gICAgICAgICAgICAgICAgICAgICAqIGBlcnJvci5yZXF1ZXN0YCBpcyBhbiBpbnN0YW5jZSBvZiBYTUxIdHRwUmVxdWVzdCBpbiB0aGUgYnJvd3NlciBhbmQgYW4gaW5zdGFuY2Ugb2ZcbiAgICAgICAgICAgICAgICAgICAgICogIGh0dHAuQ2xpZW50UmVxdWVzdCBpbiBub2RlLmpzLlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vIHJlc3BvbnNlIHJlY2VpdmVkIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBDb3VyaWVyIEFQSSwgZm9yIHJlcXVlc3QgJHtlcnJvci5yZXF1ZXN0fWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNvbWV0aGluZyBoYXBwZW5lZCBpbiBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IHRoYXQgdHJpZ2dlcmVkIGFuIEVycm9yXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgZm9yIHRoZSAke2VuZHBvaW50SW5mb30gQ291cmllciBBUEksICR7KGVycm9yICYmIGVycm9yLm1lc3NhZ2UpICYmIGVycm9yLm1lc3NhZ2V9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgaW5nZXN0aW5nIHVzZXJzIHRocm91Z2ggdGhlIG1vYmlsZSBwdXNoIGJ1bGsgam9iIHVwZGF0ZSB0aHJvdWdoICR7ZW5kcG9pbnRJbmZvfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9ICR7ZXJyfWApO1xuXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB1c2VkIHRvIGluZ2VzdCB1c2VycyBmb3IgYW4gZW1haWwtYmFzZWQgYnVsayBqb2IgbmVlZGluZyB0byBiZSBydW4uXG4gICAgICpcbiAgICAgKiBAcGFyYW0gam9iSWQgdGhlIGlkIG9mIHRoZSBqb2Igd2hpY2ggd2UgYXJlIGluZ2VzdGluZyB0aGUgdXNlcnMgZm9yXG4gICAgICogQHBhcmFtIG5vdGlmaWNhdGlvblR5cGUgdGhlIHR5cGUgb2Ygbm90aWZpY2F0aW9uIGZvciB3aGljaCB3ZSBhcmUgaW5nZXN0aW5nIHVzZXJzIGZvclxuICAgICAqIEBwYXJhbSBub3RpZmljYXRpb25DaGFubmVsVHlwZSB0aGUgdHlwZSBvZiBub3RpZmljYXRpb24gY2hhbm5lbFxuICAgICAqIEBwYXJhbSBzZW5kQnVsa0VtYWlsTm90aWZpY2F0aW9uSW5wdXQgdGhlIGJ1bGsgZW1haWwgaW5wdXQsIHVzZWQgdG8gaW5nZXN0IHVzZXJzXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIGEge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBib29sZWFufSByZXByZXNlbnRpbmcgYSBmbGFnIHRvIGhpZ2hsaWdodCB3aGV0aGVyIHRoZVxuICAgICAqIHVzZXIgaW5nZXN0aW9uIGFjdGl2aXR5IHdhcyBzdWNjZXNzZnVsIG9yIG5vdC5cbiAgICAgKi9cbiAgICBhc3luYyBpbmdlc3RCdWxrSm9iVXNlcnNGb3JFbWFpbChqb2JJZDogc3RyaW5nLCBub3RpZmljYXRpb25UeXBlOiBOb3RpZmljYXRpb25UeXBlLCBub3RpZmljYXRpb25DaGFubmVsVHlwZTogTm90aWZpY2F0aW9uQ2hhbm5lbFR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VuZEJ1bGtFbWFpbE5vdGlmaWNhdGlvbklucHV0OiBTZW5kQnVsa0VtYWlsTm90aWZpY2F0aW9uSW5wdXQpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgLy8gZWFzaWx5IGlkZW50aWZpYWJsZSBBUEkgZW5kcG9pbnQgaW5mb3JtYXRpb25cbiAgICAgICAgY29uc3QgZW5kcG9pbnRJbmZvID0gJ1BPU1QgL2J1bGsve2pvYklkfSBlbWFpbCBDb3VyaWVyIEFQSSc7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBBUEkgS2V5IGFuZCBCYXNlIFVSTCwgbmVlZGVkIGluIG9yZGVyIHRvIG1ha2UgdGhlIFBPU1Qgc2VuZCBlbWFpbCBub3RpZmljYXRpb24gdGhyb3VnaCB0aGUgY2xpZW50XG4gICAgICAgICAgICBjb25zdCBbY291cmllckJhc2VVUkwsIG5vdGlmaWNhdGlvbkF1dGhUb2tlbiwgbm90aWZpY2F0aW9uVGVtcGxhdGVJZF0gPSBhd2FpdCBzdXBlci5yZXRyaWV2ZVNlcnZpY2VDcmVkZW50aWFscyhDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5DT1VSSUVSX0lOVEVSTkFMX1NFQ1JFVF9OQU1FLFxuICAgICAgICAgICAgICAgIHVuZGVmaW5lZCwgbm90aWZpY2F0aW9uVHlwZSwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIG5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlKTtcblxuICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHdlIG9idGFpbmVkIGFueSBpbnZhbGlkIHNlY3JldCB2YWx1ZXMgZnJvbSB0aGUgY2FsbCBhYm92ZVxuICAgICAgICAgICAgaWYgKGNvdXJpZXJCYXNlVVJMID09PSBudWxsIHx8IGNvdXJpZXJCYXNlVVJMLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbkF1dGhUb2tlbiA9PT0gbnVsbCB8fCBub3RpZmljYXRpb25BdXRoVG9rZW4ubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uVGVtcGxhdGVJZCA9PT0gbnVsbCB8fCBub3RpZmljYXRpb25UZW1wbGF0ZUlkIS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBcIkludmFsaWQgU2VjcmV0cyBvYnRhaW5lZCBmb3IgQ291cmllciBBUEkgY2FsbCFcIjtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFBPU1QgL2J1bGsve2pvYklkfVxuICAgICAgICAgICAgICogQGxpbmsgaHR0cHM6Ly93d3cuY291cmllci5jb20vZG9jcy90dXRvcmlhbHMvaG93LXRvLXNlbmQtYnVsay1ub3RpZmljYXRpb25zL1xuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIGJ1aWxkIHRoZSBDb3VyaWVyIEFQSSByZXF1ZXN0IGJvZHkgdG8gYmUgcGFzc2VkIGluLCBhbmQgcGVyZm9ybSBhIFBPU1QgdG8gaXQgd2l0aCB0aGUgYXBwcm9wcmlhdGUgaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAqIHdlIGltcGx5IHRoYXQgaWYgdGhlIEFQSSBkb2VzIG5vdCByZXNwb25kIGluIDE1IHNlY29uZHMsIHRoZW4gd2UgYXV0b21hdGljYWxseSBjYXRjaCB0aGF0LCBhbmQgcmV0dXJuIGFuXG4gICAgICAgICAgICAgKiBlcnJvciBmb3IgYSBiZXR0ZXIgY3VzdG9tZXIgZXhwZXJpZW5jZS5cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBGaXJzdCBidWlsZCB0aGUgcmVxdWVzdCBkYXRhIGZyb20gdGhlIGJ1bGsgaW5wdXQgcGFzc2VkIGluXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGNvbnN0IGluZ2VzdGVkVXNlcnM6IGFueVtdID0gW107XG4gICAgICAgICAgICBzZW5kQnVsa0VtYWlsTm90aWZpY2F0aW9uSW5wdXQuZW1haWxOb3RpZmljYXRpb25JbnB1dHMuZm9yRWFjaChlbWFpbE5vdGlmaWNhdGlvbklucHV0ID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZW1haWxOb3RpZmljYXRpb25JbnB1dCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBpbmdlc3RlZFVzZXJzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvZmlsZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVtYWlsOiBlbWFpbE5vdGlmaWNhdGlvbklucHV0LmVtYWlsRGVzdGluYXRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlcklkOiBgZW1haWxfJHtEYXRlLnBhcnNlKG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSl9YFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBub3RpZmljYXRpb25UZW1wbGF0ZUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG86IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbWFpbDogZW1haWxOb3RpZmljYXRpb25JbnB1dC5lbWFpbERlc3RpbmF0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZ1bGxOYW1lOiBlbWFpbE5vdGlmaWNhdGlvbklucHV0LnVzZXJGdWxsTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi4oZW1haWxOb3RpZmljYXRpb25JbnB1dC50cmFuc2FjdGlvbnMgIT09IHVuZGVmaW5lZCAmJiBlbWFpbE5vdGlmaWNhdGlvbklucHV0LnRyYW5zYWN0aW9ucyAhPT0gbnVsbCAmJiBlbWFpbE5vdGlmaWNhdGlvbklucHV0LnRyYW5zYWN0aW9ucy5sZW5ndGggIT09IDAgJiYge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbnM6IGVtYWlsTm90aWZpY2F0aW9uSW5wdXQudHJhbnNhY3Rpb25zIVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLihlbWFpbE5vdGlmaWNhdGlvbklucHV0LmRhaWx5RWFybmluZ3NTdW1tYXJ5QW1vdW50ICE9PSB1bmRlZmluZWQgJiYgZW1haWxOb3RpZmljYXRpb25JbnB1dC5kYWlseUVhcm5pbmdzU3VtbWFyeUFtb3VudCAhPT0gbnVsbCAmJiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhaWx5RWFybmluZ3NTdW1tYXJ5QW1vdW50OiBlbWFpbE5vdGlmaWNhdGlvbklucHV0LmRhaWx5RWFybmluZ3NTdW1tYXJ5QW1vdW50IVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgY29uc3QgcmVxdWVzdERhdGEgPSB7XG4gICAgICAgICAgICAgICAgdXNlcnM6IGluZ2VzdGVkVXNlcnNcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gYXhpb3MucG9zdChgJHtjb3VyaWVyQmFzZVVSTH0vYnVsay8ke2pvYklkfWAsIHJlcXVlc3REYXRhLCB7XG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAgICAgXCJBdXRob3JpemF0aW9uXCI6IGBCZWFyZXIgJHtub3RpZmljYXRpb25BdXRoVG9rZW59YFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGltZW91dDogMTUwMDAsIC8vIGluIG1pbGxpc2Vjb25kcyBoZXJlXG4gICAgICAgICAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZTogJ0NvdXJpZXIgQVBJIHRpbWVkIG91dCBhZnRlciAxNTAwMG1zISdcbiAgICAgICAgICAgIH0pLnRoZW4oaW5nZXN0QnVsa0pvYlVzZXJzRm9yRW1haWxSZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGluZ2VzdEJ1bGtKb2JVc2Vyc0ZvckVtYWlsUmVzcG9uc2UuZGF0YSl9YCk7XG5cbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiBpZiB3ZSByZWFjaGVkIHRoaXMsIHRoZW4gd2UgYXNzdW1lIHRoYXQgYSAyeHggcmVzcG9uc2UgY29kZSB3YXMgcmV0dXJuZWQuXG4gICAgICAgICAgICAgICAgICogY2hlY2sgdGhlIGNvbnRlbnRzIG9mIHRoZSByZXNwb25zZSwgYW5kIGFjdCBhcHByb3ByaWF0ZWx5LlxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGlmIChpbmdlc3RCdWxrSm9iVXNlcnNGb3JFbWFpbFJlc3BvbnNlLmRhdGEgJiZcbiAgICAgICAgICAgICAgICAgICAgKCFpbmdlc3RCdWxrSm9iVXNlcnNGb3JFbWFpbFJlc3BvbnNlLmRhdGFbXCJlcnJvcnNcIl0gfHwgKGluZ2VzdEJ1bGtKb2JVc2Vyc0ZvckVtYWlsUmVzcG9uc2UuZGF0YVtcImVycm9yc1wiXSAmJiBpbmdlc3RCdWxrSm9iVXNlcnNGb3JFbWFpbFJlc3BvbnNlLmRhdGFbXCJlcnJvcnNcIl0ubGVuZ3RoID09PSAwKSkgJiZcbiAgICAgICAgICAgICAgICAgICAgaW5nZXN0QnVsa0pvYlVzZXJzRm9yRW1haWxSZXNwb25zZS5kYXRhW1widG90YWxcIl0gJiYgaW5nZXN0QnVsa0pvYlVzZXJzRm9yRW1haWxSZXNwb25zZS5kYXRhW1widG90YWxcIl0gPT09IGluZ2VzdGVkVXNlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yLnJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBhbmQgdGhlIHNlcnZlciByZXNwb25kZWQgd2l0aCBhIHN0YXR1cyBjb2RlXG4gICAgICAgICAgICAgICAgICAgICAqIHRoYXQgZmFsbHMgb3V0IG9mIHRoZSByYW5nZSBvZiAyeHguXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm9uIDJ4eHggcmVzcG9uc2Ugd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IENvdXJpZXIgQVBJLCB3aXRoIHN0YXR1cyAke2Vycm9yLnJlc3BvbnNlLnN0YXR1c30sIGFuZCByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGVycm9yLnJlc3BvbnNlLmRhdGEpfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gYW55IG90aGVyIHNwZWNpZmljIGVycm9ycyB0byBiZSBmaWx0ZXJlZCBiZWxvd1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5yZXF1ZXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBidXQgbm8gcmVzcG9uc2Ugd2FzIHJlY2VpdmVkXG4gICAgICAgICAgICAgICAgICAgICAqIGBlcnJvci5yZXF1ZXN0YCBpcyBhbiBpbnN0YW5jZSBvZiBYTUxIdHRwUmVxdWVzdCBpbiB0aGUgYnJvd3NlciBhbmQgYW4gaW5zdGFuY2Ugb2ZcbiAgICAgICAgICAgICAgICAgICAgICogIGh0dHAuQ2xpZW50UmVxdWVzdCBpbiBub2RlLmpzLlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vIHJlc3BvbnNlIHJlY2VpdmVkIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBDb3VyaWVyIEFQSSwgZm9yIHJlcXVlc3QgJHtlcnJvci5yZXF1ZXN0fWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNvbWV0aGluZyBoYXBwZW5lZCBpbiBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IHRoYXQgdHJpZ2dlcmVkIGFuIEVycm9yXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgZm9yIHRoZSAke2VuZHBvaW50SW5mb30gQ291cmllciBBUEksICR7KGVycm9yICYmIGVycm9yLm1lc3NhZ2UpICYmIGVycm9yLm1lc3NhZ2V9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgaW5nZXN0aW5nIHVzZXJzIHRocm91Z2ggdGhlIGVtYWlsIGJ1bGsgam9iIHVwZGF0ZSB0aHJvdWdoICR7ZW5kcG9pbnRJbmZvfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9ICR7ZXJyfWApO1xuXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB1c2VkIHRvIGNyZWF0ZSBhIGJ1bGsgbm90aWZpY2F0aW9uIG1lYW50IHRvIGhlbHAgd2l0aFxuICAgICAqIHNjaGVkdWxpbmcgYnVsayBlbWFpbCBhbmQgbW9iaWxlIHB1c2ggbm90aWZpY2F0aW9uIGpvYnMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gbm90aWZpY2F0aW9uVHlwZSB0aGUgdHlwZSBvZiBub3RpZmljYXRpb24gdG8gc2NoZWR1bGUgdGhlIGJ1bGtcbiAgICAgKiBqb2IgZm9yLlxuICAgICAqIEBwYXJhbSBub3RpZmljYXRpb25DaGFubmVsVHlwZSB0aGUgdHlwZSBvZiBub3RpZmljYXRpb24gY2hhbm5lbFxuICAgICAqXG4gICAgICogQHJldHVybiBhIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgc3RyaW5nfSBvciB7QGxpbmsgbnVsbH0gZGVwZW5kaW5nIG9uXG4gICAgICogd2hldGhlciB0aGUgam9iIHNjaGVkdWxpbmcgd2FzIHN1Y2Nlc3NmdWwgb3Igbm90LlxuICAgICAqL1xuICAgIGFzeW5jIGNyZWF0ZUJ1bGtOb3RpZmljYXRpb25Kb2Iobm90aWZpY2F0aW9uVHlwZTogTm90aWZpY2F0aW9uVHlwZSwgbm90aWZpY2F0aW9uQ2hhbm5lbFR5cGU6IE5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlKTogUHJvbWlzZTxzdHJpbmcgfCBudWxsPiB7XG4gICAgICAgIC8vIGVhc2lseSBpZGVudGlmaWFibGUgQVBJIGVuZHBvaW50IGluZm9ybWF0aW9uXG4gICAgICAgIGNvbnN0IGVuZHBvaW50SW5mbyA9ICdQT1NUIC9idWxrIENvdXJpZXIgQVBJJztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIEFQSSBLZXkgYW5kIEJhc2UgVVJMLCBuZWVkZWQgaW4gb3JkZXIgdG8gbWFrZSB0aGUgUE9TVCBzZW5kIGVtYWlsIG5vdGlmaWNhdGlvbiB0aHJvdWdoIHRoZSBjbGllbnRcbiAgICAgICAgICAgIGNvbnN0IFtjb3VyaWVyQmFzZVVSTCwgbm90aWZpY2F0aW9uQXV0aFRva2VuLCBub3RpZmljYXRpb25UZW1wbGF0ZUlkXSA9IGF3YWl0IHN1cGVyLnJldHJpZXZlU2VydmljZUNyZWRlbnRpYWxzKENvbnN0YW50cy5BV1NQYWlyQ29uc3RhbnRzLkNPVVJJRVJfSU5URVJOQUxfU0VDUkVUX05BTUUsXG4gICAgICAgICAgICAgICAgdW5kZWZpbmVkLCBub3RpZmljYXRpb25UeXBlLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgbm90aWZpY2F0aW9uQ2hhbm5lbFR5cGUpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgd2Ugb2J0YWluZWQgYW55IGludmFsaWQgc2VjcmV0IHZhbHVlcyBmcm9tIHRoZSBjYWxsIGFib3ZlXG4gICAgICAgICAgICBpZiAoY291cmllckJhc2VVUkwgPT09IG51bGwgfHwgY291cmllckJhc2VVUkwubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uQXV0aFRva2VuID09PSBudWxsIHx8IG5vdGlmaWNhdGlvbkF1dGhUb2tlbi5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25UZW1wbGF0ZUlkID09PSBudWxsIHx8IG5vdGlmaWNhdGlvblRlbXBsYXRlSWQhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IFwiSW52YWxpZCBTZWNyZXRzIG9idGFpbmVkIGZvciBDb3VyaWVyIEFQSSBjYWxsIVwiO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBQT1NUIC9idWxrXG4gICAgICAgICAgICAgKiBAbGluayBodHRwczovL3d3dy5jb3VyaWVyLmNvbS9kb2NzL3R1dG9yaWFscy9ob3ctdG8tc2VuZC1idWxrLW5vdGlmaWNhdGlvbnMvXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogYnVpbGQgdGhlIENvdXJpZXIgQVBJIHJlcXVlc3QgYm9keSB0byBiZSBwYXNzZWQgaW4sIGFuZCBwZXJmb3JtIGEgUE9TVCB0byBpdCB3aXRoIHRoZSBhcHByb3ByaWF0ZSBpbmZvcm1hdGlvblxuICAgICAgICAgICAgICogd2UgaW1wbHkgdGhhdCBpZiB0aGUgQVBJIGRvZXMgbm90IHJlc3BvbmQgaW4gMTUgc2Vjb25kcywgdGhlbiB3ZSBhdXRvbWF0aWNhbGx5IGNhdGNoIHRoYXQsIGFuZCByZXR1cm4gYW5cbiAgICAgICAgICAgICAqIGVycm9yIGZvciBhIGJldHRlciBjdXN0b21lciBleHBlcmllbmNlLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBjb25zdCByZXF1ZXN0RGF0YSA9IHtcbiAgICAgICAgICAgICAgICAuLi4obm90aWZpY2F0aW9uQ2hhbm5lbFR5cGUgPT09IE5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlLkVtYWlsICYmIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQ6IG5vdGlmaWNhdGlvblRlbXBsYXRlSWRcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIC4uLihub3RpZmljYXRpb25DaGFubmVsVHlwZSA9PT0gTm90aWZpY2F0aW9uQ2hhbm5lbFR5cGUuUHVzaCAmJiB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50OiBub3RpZmljYXRpb25UZW1wbGF0ZUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwbzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdmVycmlkZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHRsOiAzMDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VuZDogXCJkZWZhdWx0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmlvcml0eTogXCJoaWdoXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc29sZS5sb2coYENvdXJpZXIgQVBJIHJlcXVlc3QgT2JqZWN0OiAke0pTT04uc3RyaW5naWZ5KHJlcXVlc3REYXRhKX1gKTtcblxuICAgICAgICAgICAgcmV0dXJuIGF4aW9zLnBvc3QoYCR7Y291cmllckJhc2VVUkx9L2J1bGtgLCByZXF1ZXN0RGF0YSwge1xuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiQXV0aG9yaXphdGlvblwiOiBgQmVhcmVyICR7bm90aWZpY2F0aW9uQXV0aFRva2VufWBcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDE1MDAwLCAvLyBpbiBtaWxsaXNlY29uZHMgaGVyZVxuICAgICAgICAgICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2U6ICdDb3VyaWVyIEFQSSB0aW1lZCBvdXQgYWZ0ZXIgMTUwMDBtcyEnXG4gICAgICAgICAgICB9KS50aGVuKGNyZWF0ZUJ1bGtOb3RpZmljYXRpb25SZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGNyZWF0ZUJ1bGtOb3RpZmljYXRpb25SZXNwb25zZS5kYXRhKX1gKTtcblxuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIGlmIHdlIHJlYWNoZWQgdGhpcywgdGhlbiB3ZSBhc3N1bWUgdGhhdCBhIDJ4eCByZXNwb25zZSBjb2RlIHdhcyByZXR1cm5lZC5cbiAgICAgICAgICAgICAgICAgKiBjaGVjayB0aGUgY29udGVudHMgb2YgdGhlIHJlc3BvbnNlLCBhbmQgYWN0IGFwcHJvcHJpYXRlbHkuXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgaWYgKGNyZWF0ZUJ1bGtOb3RpZmljYXRpb25SZXNwb25zZS5kYXRhICYmIGNyZWF0ZUJ1bGtOb3RpZmljYXRpb25SZXNwb25zZS5kYXRhW1wiam9iSWRcIl0pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZUJ1bGtOb3RpZmljYXRpb25SZXNwb25zZS5kYXRhW1wiam9iSWRcIl07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvci5yZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYW5kIHRoZSBzZXJ2ZXIgcmVzcG9uZGVkIHdpdGggYSBzdGF0dXMgY29kZVxuICAgICAgICAgICAgICAgICAgICAgKiB0aGF0IGZhbGxzIG91dCBvZiB0aGUgcmFuZ2Ugb2YgMnh4LlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vbiAyeHh4IHJlc3BvbnNlIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBDb3VyaWVyIEFQSSwgd2l0aCBzdGF0dXMgJHtlcnJvci5yZXNwb25zZS5zdGF0dXN9LCBhbmQgcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShlcnJvci5yZXNwb25zZS5kYXRhKX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGFueSBvdGhlciBzcGVjaWZpYyBlcnJvcnMgdG8gYmUgZmlsdGVyZWQgYmVsb3dcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5yZXF1ZXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBidXQgbm8gcmVzcG9uc2Ugd2FzIHJlY2VpdmVkXG4gICAgICAgICAgICAgICAgICAgICAqIGBlcnJvci5yZXF1ZXN0YCBpcyBhbiBpbnN0YW5jZSBvZiBYTUxIdHRwUmVxdWVzdCBpbiB0aGUgYnJvd3NlciBhbmQgYW4gaW5zdGFuY2Ugb2ZcbiAgICAgICAgICAgICAgICAgICAgICogIGh0dHAuQ2xpZW50UmVxdWVzdCBpbiBub2RlLmpzLlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vIHJlc3BvbnNlIHJlY2VpdmVkIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBDb3VyaWVyIEFQSSwgZm9yIHJlcXVlc3QgJHtlcnJvci5yZXF1ZXN0fWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU29tZXRoaW5nIGhhcHBlbmVkIGluIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgdGhhdCB0cmlnZ2VyZWQgYW4gRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgc2V0dGluZyB1cCB0aGUgcmVxdWVzdCBmb3IgdGhlICR7ZW5kcG9pbnRJbmZvfSBDb3VyaWVyIEFQSSwgJHsoZXJyb3IgJiYgZXJyb3IubWVzc2FnZSkgJiYgZXJyb3IubWVzc2FnZX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGluaXRpYXRpbmcgdGhlIGJ1bGsgam9iIGNyZWF0aW9uIHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJ9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19