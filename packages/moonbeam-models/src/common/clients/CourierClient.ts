import {BaseAPIClient} from "./BaseAPIClient";
import {
    NotificationChannelType,
    NotificationResponse,
    NotificationsErrorType,
    NotificationType,
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
                    ...(sendMobilePushNotificationInput.pendingCashback !== null && sendMobilePushNotificationInput.pendingCashback !== undefined
                        && sendMobilePushNotificationInput.merchantName !== null && sendMobilePushNotificationInput.merchantName !== undefined
                        && sendMobilePushNotificationInput.merchantName.length !== 0 && {
                            data: {
                                pendingCashback: sendMobilePushNotificationInput.pendingCashback!.toString(),
                                merchantName: sendMobilePushNotificationInput.merchantName!
                            }
                        }),
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
                        fullName: sendEmailNotificationInput.userFullName
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
}
