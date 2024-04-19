import {BaseAPIClient} from "./BaseAPIClient";
import {
    NotificationChannelType,
    NotificationResponse,
    NotificationsErrorType,
    NotificationType,
    SendBulkEmailNotificationInput,
    SendBulkMobilePushNotificationInput,
    SendEmailNotificationInput,
    SendMobilePushNotificationInput
} from "../GraphqlExports";
import {Constants} from "../Constants";
import axios from "axios";

/**
 * Class used as the base/generic client for all Courier/notification-related calls.
 */
export class CourierClient extends BaseAPIClient {

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
    async sendMobilePushNotification(sendMobilePushNotificationInput: SendMobilePushNotificationInput, notificationType: NotificationType): Promise<NotificationResponse> {
        // easily identifiable API endpoint information
        const endpointInfo = 'POST /send mobile push Courier API';

        try {
            // retrieve the API Key and Base URL, needed in order to make the POST send mobile push notification through the client
            const [courierBaseURL, notificationAuthToken, notificationTemplateId] = await super.retrieveServiceCredentials(Constants.AWSPairConstants.COURIER_INTERNAL_SECRET_NAME,
                undefined, notificationType, undefined, undefined, NotificationChannelType.Push);

            // check to see if we obtained any invalid secret values from the call above
            if (courierBaseURL === null || courierBaseURL.length === 0 ||
                notificationAuthToken === null || notificationAuthToken.length === 0 ||
                notificationTemplateId === null || notificationTemplateId!.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Courier API call!";
                console.log(errorMessage);

                return {
                    errorMessage: errorMessage,
                    errorType: NotificationsErrorType.UnexpectedError
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
                                ineligibleTransactionAmount: sendMobilePushNotificationInput.ineligibleTransactionAmount!
                            }
                        }),
                    ...((sendMobilePushNotificationInput.pendingCashback === undefined || sendMobilePushNotificationInput.pendingCashback === null)
                        && sendMobilePushNotificationInput.merchantName !== undefined && sendMobilePushNotificationInput.merchantName !== null
                        && sendMobilePushNotificationInput.merchantName.length !== 0 && {
                            data: {
                                merchantName: sendMobilePushNotificationInput.merchantName!
                            }
                        }),
                    ...(sendMobilePushNotificationInput.pendingCashback !== undefined && sendMobilePushNotificationInput.pendingCashback !== null
                        && sendMobilePushNotificationInput.merchantName !== undefined && sendMobilePushNotificationInput.merchantName !== null
                        && sendMobilePushNotificationInput.merchantName.length !== 0 && {
                            data: {
                                pendingCashback: sendMobilePushNotificationInput.pendingCashback!.toString(),
                                merchantName: sendMobilePushNotificationInput.merchantName!
                            }
                        }),
                    ...(sendMobilePushNotificationInput.dailyEarningsSummaryAmount !== undefined &&
                        sendMobilePushNotificationInput.dailyEarningsSummaryAmount !== null && {
                            data: {
                                dailyEarningsSummaryAmount: sendMobilePushNotificationInput.dailyEarningsSummaryAmount!.toString()
                            }
                        })
                }
            };
            console.log(`Courier API request Object: ${JSON.stringify(requestData)}`);

            return axios.post(`${courierBaseURL}/send`, requestData, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${notificationAuthToken}`
                },
                timeout: 15000, // in milliseconds here
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
                    }
                } else {
                    return {
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
                    const errorMessage = `Non 2xxx response while calling the ${endpointInfo} Courier API, with status ${error.response.status}, and response ${JSON.stringify(error.response.data)}`;
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
                    const errorMessage = `No response received while calling the ${endpointInfo} Courier API, for request ${error.request}`;
                    console.log(errorMessage);

                    return {
                        errorMessage: errorMessage,
                        errorType: NotificationsErrorType.UnexpectedError
                    };
                } else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Courier API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);

                    return {
                        errorMessage: errorMessage,
                        errorType: NotificationsErrorType.UnexpectedError
                    };
                }
            });
        } catch (err) {
            const errorMessage = `Unexpected error while initiating the mobile push notification sending through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);

            return {
                errorMessage: errorMessage,
                errorType: NotificationsErrorType.UnexpectedError
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
    async sendEmailNotification(sendEmailNotificationInput: SendEmailNotificationInput, notificationType: NotificationType): Promise<NotificationResponse> {
        // easily identifiable API endpoint information
        const endpointInfo = 'POST /send email Courier API';

        try {
            // retrieve the API Key and Base URL, needed in order to make the POST send email notification through the client
            const [courierBaseURL, notificationAuthToken, notificationTemplateId] = await super.retrieveServiceCredentials(Constants.AWSPairConstants.COURIER_INTERNAL_SECRET_NAME,
                undefined, notificationType, undefined, undefined, NotificationChannelType.Email);

            // check to see if we obtained any invalid secret values from the call above
            if (courierBaseURL === null || courierBaseURL.length === 0 ||
                notificationAuthToken === null || notificationAuthToken.length === 0 ||
                notificationTemplateId === null || notificationTemplateId!.length === 0) {
                const errorMessage = "Invalid Secrets obtained for Courier API call!";
                console.log(errorMessage);

                return {
                    errorMessage: errorMessage,
                    errorType: NotificationsErrorType.UnexpectedError
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
                            transactions: sendEmailNotificationInput.transactions!
                        }),
                        ...(sendEmailNotificationInput.dailyEarningsSummaryAmount !== undefined && sendEmailNotificationInput.dailyEarningsSummaryAmount !== null && {
                            dailyEarningsSummaryAmount: sendEmailNotificationInput.dailyEarningsSummaryAmount!
                        }),
                    }
                }
            };
            console.log(`Courier API request Object: ${JSON.stringify(requestData)}`);

            return axios.post(`${courierBaseURL}/send`, requestData, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${notificationAuthToken}`
                },
                timeout: 15000, // in milliseconds here
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
                    }
                } else {
                    return {
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
                    const errorMessage = `Non 2xxx response while calling the ${endpointInfo} Courier API, with status ${error.response.status}, and response ${JSON.stringify(error.response.data)}`;
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
                    const errorMessage = `No response received while calling the ${endpointInfo} Courier API, for request ${error.request}`;
                    console.log(errorMessage);

                    return {
                        errorMessage: errorMessage,
                        errorType: NotificationsErrorType.UnexpectedError
                    };
                } else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Courier API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);

                    return {
                        errorMessage: errorMessage,
                        errorType: NotificationsErrorType.UnexpectedError
                    };
                }
            });
        } catch (err) {
            const errorMessage = `Unexpected error while initiating the email notification sending through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);

            return {
                errorMessage: errorMessage,
                errorType: NotificationsErrorType.UnexpectedError
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
    async sendBulkMobilePushNotification(sendBulkMobilePushNotificationInput: SendBulkMobilePushNotificationInput, notificationType: NotificationType): Promise<NotificationResponse> {
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
            const bulkNotificationJobId = await this.createBulkNotificationJob(notificationType, NotificationChannelType.Push);
            // ensure that the bulk job creation succeeded
            if (bulkNotificationJobId !== null && bulkNotificationJobId.length !== 0) {
                // 2) Use that bulk job to add all applicable users to it.
                const bulkUsersIngestionFlag = await this.ingestBulkJobUsersForMobilePush(bulkNotificationJobId, notificationType, NotificationChannelType.Push, sendBulkMobilePushNotificationInput);
                // ensure that the users ingestion was successful
                if (bulkUsersIngestionFlag) {
                    // 3) Schedule/start that job.
                    const bulkJobRunFlag = await this.runBulkNotificationJob(bulkNotificationJobId, notificationType, NotificationChannelType.Push);
                    // ensure that the bulk job ran successfully
                    if (bulkJobRunFlag) {
                        // return the job id
                        return {
                            requestId: bulkNotificationJobId!
                        }
                    } else {
                        const errorMessage = `Unexpected error while running/scheduling the bulk job for mobile push notifications through ${endpointInfo}`;
                        console.log(errorMessage);

                        return {
                            errorMessage: errorMessage,
                            errorType: NotificationsErrorType.UnexpectedError
                        };
                    }
                } else {
                    const errorMessage = `Unexpected error while ingesting users for the bulk job for mobile push notifications through ${endpointInfo}`;
                    console.log(errorMessage);

                    return {
                        errorMessage: errorMessage,
                        errorType: NotificationsErrorType.UnexpectedError
                    };
                }
            } else {
                const errorMessage = `Unexpected error while creating the bulk job for mobile push notifications through ${endpointInfo}`;
                console.log(errorMessage);

                return {
                    errorMessage: errorMessage,
                    errorType: NotificationsErrorType.UnexpectedError
                };
            }
        } catch (err) {
            const errorMessage = `Unexpected error while initiating the bulk mobile push notification sending through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);

            return {
                errorMessage: errorMessage,
                errorType: NotificationsErrorType.UnexpectedError
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
    async sendBulkEmailNotification(sendBulkEmailNotificationInput: SendBulkEmailNotificationInput, notificationType: NotificationType): Promise<NotificationResponse> {
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
            const bulkNotificationJobId = await this.createBulkNotificationJob(notificationType, NotificationChannelType.Email);
            // ensure that the bulk job creation succeeded
            if (bulkNotificationJobId !== null && bulkNotificationJobId.length !== 0) {
                // 2) Use that bulk job to add all applicable users to it.
                const bulkUsersIngestionFlag = await this.ingestBulkJobUsersForEmail(bulkNotificationJobId, notificationType, NotificationChannelType.Email, sendBulkEmailNotificationInput);
                // ensure that the users ingestion was successful
                if (bulkUsersIngestionFlag) {
                    // 3) Schedule/start that job.
                    const bulkJobRunFlag = await this.runBulkNotificationJob(bulkNotificationJobId, notificationType, NotificationChannelType.Email);
                    // ensure that the bulk job ran successfully
                    if (bulkJobRunFlag) {
                        // return the job id
                        return {
                            requestId: bulkNotificationJobId!
                        }
                    } else {
                        const errorMessage = `Unexpected error while running/scheduling the bulk job for email notifications through ${endpointInfo}`;
                        console.log(errorMessage);

                        return {
                            errorMessage: errorMessage,
                            errorType: NotificationsErrorType.UnexpectedError
                        };
                    }
                } else {
                    const errorMessage = `Unexpected error while ingesting users for the bulk job for email notifications through ${endpointInfo}`;
                    console.log(errorMessage);

                    return {
                        errorMessage: errorMessage,
                        errorType: NotificationsErrorType.UnexpectedError
                    };
                }
            } else {
                const errorMessage = `Unexpected error while creating the bulk job for email notifications through ${endpointInfo}`;
                console.log(errorMessage);

                return {
                    errorMessage: errorMessage,
                    errorType: NotificationsErrorType.UnexpectedError
                };
            }
        } catch (err) {
            const errorMessage = `Unexpected error while initiating the bulk email notification sending through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);

            return {
                errorMessage: errorMessage,
                errorType: NotificationsErrorType.UnexpectedError
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
    async runBulkNotificationJob(jobId: string, notificationType: NotificationType, notificationChannelType: NotificationChannelType): Promise<boolean> {
        // easily identifiable API endpoint information
        const endpointInfo = 'POST /bulk/{jobId}/run Courier API';

        try {
            // retrieve the API Key and Base URL, needed in order to make the POST send email notification through the client
            const [courierBaseURL, notificationAuthToken, notificationTemplateId] = await super.retrieveServiceCredentials(Constants.AWSPairConstants.COURIER_INTERNAL_SECRET_NAME,
                undefined, notificationType, undefined, undefined, notificationChannelType);

            // check to see if we obtained any invalid secret values from the call above
            if (courierBaseURL === null || courierBaseURL.length === 0 ||
                notificationAuthToken === null || notificationAuthToken.length === 0 ||
                notificationTemplateId === null || notificationTemplateId!.length === 0) {
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
            return axios.post(`${courierBaseURL}/bulk/${jobId}/run`, {}, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${notificationAuthToken}`
                },
                timeout: 15000, // in milliseconds here
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
                } else if (error.request) {
                    /**
                     * The request was made but no response was received
                     * `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                     *  http.ClientRequest in node.js.
                     */
                    const errorMessage = `No response received while calling the ${endpointInfo} Courier API, for request ${error.request}`;
                    console.log(errorMessage);

                    return false;
                } else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Courier API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);

                    return false;
                }
            });
        } catch (err) {
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
    async ingestBulkJobUsersForMobilePush(jobId: string, notificationType: NotificationType, notificationChannelType: NotificationChannelType,
                                          sendBulkMobilePushNotificationInput: SendBulkMobilePushNotificationInput): Promise<boolean> {
        // easily identifiable API endpoint information
        const endpointInfo = 'POST /bulk/{jobId} mobile push Courier API';

        try {
            // retrieve the API Key and Base URL, needed in order to make the POST send email notification through the client
            const [courierBaseURL, notificationAuthToken, notificationTemplateId] = await super.retrieveServiceCredentials(Constants.AWSPairConstants.COURIER_INTERNAL_SECRET_NAME,
                undefined, notificationType, undefined, undefined, notificationChannelType);

            // check to see if we obtained any invalid secret values from the call above
            if (courierBaseURL === null || courierBaseURL.length === 0 ||
                notificationAuthToken === null || notificationAuthToken.length === 0 ||
                notificationTemplateId === null || notificationTemplateId!.length === 0) {
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
            const ingestedUsers: any[] = [];
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
                                    ineligibleTransactionAmount: mobilePushNotificationInput.ineligibleTransactionAmount!
                                }
                            }),
                        ...((mobilePushNotificationInput.pendingCashback === undefined || mobilePushNotificationInput.pendingCashback === null)
                            && mobilePushNotificationInput.merchantName !== undefined && mobilePushNotificationInput.merchantName !== null
                            && mobilePushNotificationInput.merchantName.length !== 0 && {
                                data: {
                                    merchantName: mobilePushNotificationInput.merchantName!
                                }
                            }),
                        ...(mobilePushNotificationInput.pendingCashback !== undefined && mobilePushNotificationInput.pendingCashback !== null
                            && mobilePushNotificationInput.merchantName !== undefined && mobilePushNotificationInput.merchantName !== null
                            && mobilePushNotificationInput.merchantName.length !== 0 && {
                                data: {
                                    pendingCashback: mobilePushNotificationInput.pendingCashback!.toString(),
                                    merchantName: mobilePushNotificationInput.merchantName!
                                }
                            }),
                        ...(mobilePushNotificationInput.dailyEarningsSummaryAmount !== undefined &&
                            mobilePushNotificationInput.dailyEarningsSummaryAmount !== null && {
                                data: {
                                    dailyEarningsSummaryAmount: mobilePushNotificationInput.dailyEarningsSummaryAmount!.toString()
                                }
                            })
                    });
                }
            });
            const requestData = {
                users: ingestedUsers
            };
            return axios.post(`${courierBaseURL}/bulk/${jobId}`, requestData, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${notificationAuthToken}`
                },
                timeout: 15000, // in milliseconds here
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
                } else {
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
                } else if (error.request) {
                    /**
                     * The request was made but no response was received
                     * `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                     *  http.ClientRequest in node.js.
                     */
                    const errorMessage = `No response received while calling the ${endpointInfo} Courier API, for request ${error.request}`;
                    console.log(errorMessage);

                    return false;
                } else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Courier API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);

                    return false;
                }
            });
        } catch (err) {
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
    async ingestBulkJobUsersForEmail(jobId: string, notificationType: NotificationType, notificationChannelType: NotificationChannelType,
                                     sendBulkEmailNotificationInput: SendBulkEmailNotificationInput): Promise<boolean> {
        // easily identifiable API endpoint information
        const endpointInfo = 'POST /bulk/{jobId} email Courier API';

        try {
            // retrieve the API Key and Base URL, needed in order to make the POST send email notification through the client
            const [courierBaseURL, notificationAuthToken, notificationTemplateId] = await super.retrieveServiceCredentials(Constants.AWSPairConstants.COURIER_INTERNAL_SECRET_NAME,
                undefined, notificationType, undefined, undefined, notificationChannelType);

            // check to see if we obtained any invalid secret values from the call above
            if (courierBaseURL === null || courierBaseURL.length === 0 ||
                notificationAuthToken === null || notificationAuthToken.length === 0 ||
                notificationTemplateId === null || notificationTemplateId!.length === 0) {
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
            const ingestedUsers: any[] = [];
            sendBulkEmailNotificationInput.emailNotificationInputs.forEach(emailNotificationInput => {
                if (emailNotificationInput !== null) {
                    ingestedUsers.push({
                        to: {
                            email: emailNotificationInput.emailDestination
                        },
                        data: {
                            fullName: emailNotificationInput.userFullName,
                            ...(emailNotificationInput.transactions !== undefined && emailNotificationInput.transactions !== null && emailNotificationInput.transactions.length !== 0 && {
                                transactions: emailNotificationInput.transactions!
                            }),
                            ...(emailNotificationInput.dailyEarningsSummaryAmount !== undefined && emailNotificationInput.dailyEarningsSummaryAmount !== null && {
                                dailyEarningsSummaryAmount: emailNotificationInput.dailyEarningsSummaryAmount!
                            }),
                        }
                    });
                }
            })
            const requestData = {
                users: ingestedUsers
            };
            return axios.post(`${courierBaseURL}/bulk/${jobId}`, requestData, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${notificationAuthToken}`
                },
                timeout: 15000, // in milliseconds here
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
                } else {
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
                } else if (error.request) {
                    /**
                     * The request was made but no response was received
                     * `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                     *  http.ClientRequest in node.js.
                     */
                    const errorMessage = `No response received while calling the ${endpointInfo} Courier API, for request ${error.request}`;
                    console.log(errorMessage);

                    return false;
                } else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Courier API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);

                    return false;
                }
            });
        } catch (err) {
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
    async createBulkNotificationJob(notificationType: NotificationType, notificationChannelType: NotificationChannelType): Promise<string | null> {
        // easily identifiable API endpoint information
        const endpointInfo = 'POST /bulk Courier API';

        try {
            // retrieve the API Key and Base URL, needed in order to make the POST send email notification through the client
            const [courierBaseURL, notificationAuthToken, notificationTemplateId] = await super.retrieveServiceCredentials(Constants.AWSPairConstants.COURIER_INTERNAL_SECRET_NAME,
                undefined, notificationType, undefined, undefined, notificationChannelType);

            // check to see if we obtained any invalid secret values from the call above
            if (courierBaseURL === null || courierBaseURL.length === 0 ||
                notificationAuthToken === null || notificationAuthToken.length === 0 ||
                notificationTemplateId === null || notificationTemplateId!.length === 0) {
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
                ...(notificationChannelType === NotificationChannelType.Push && {
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

            return axios.post(`${courierBaseURL}/bulk`, requestData, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${notificationAuthToken}`
                },
                timeout: 15000, // in milliseconds here
                timeoutErrorMessage: 'Courier API timed out after 15000ms!'
            }).then(createBulkNotificationResponse => {
                console.log(`${endpointInfo} response ${JSON.stringify(createBulkNotificationResponse.data)}`);

                /**
                 * if we reached this, then we assume that a 2xx response code was returned.
                 * check the contents of the response, and act appropriately.
                 */
                if (createBulkNotificationResponse.data && createBulkNotificationResponse.data["jobId"]) {
                    return createBulkNotificationResponse.data["jobId"];
                } else {
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
                } else if (error.request) {
                    /**
                     * The request was made but no response was received
                     * `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                     *  http.ClientRequest in node.js.
                     */
                    const errorMessage = `No response received while calling the ${endpointInfo} Courier API, for request ${error.request}`;
                    console.log(errorMessage);

                    return null;
                } else {
                    // Something happened in setting up the request that triggered an Error
                    const errorMessage = `Unexpected error while setting up the request for the ${endpointInfo} Courier API, ${(error && error.message) && error.message}`;
                    console.log(errorMessage);

                    return null;
                }
            });
        } catch (err) {
            const errorMessage = `Unexpected error while initiating the bulk job creation through ${endpointInfo}`;
            console.log(`${errorMessage} ${err}`);

            return null;
        }
    }
}
