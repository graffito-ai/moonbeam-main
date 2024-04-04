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
                        fullName: sendEmailNotificationInput.userFullName
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
}
exports.CourierClient = CourierClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ291cmllckNsaWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tb24vY2xpZW50cy9Db3VyaWVyQ2xpZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLG1EQUE4QztBQUM5QyxzREFPMkI7QUFDM0IsNENBQXVDO0FBQ3ZDLGtEQUEwQjtBQUUxQjs7R0FFRztBQUNILE1BQWEsYUFBYyxTQUFRLDZCQUFhO0lBRTVDOzs7OztPQUtHO0lBQ0gsWUFBWSxXQUFtQixFQUFFLE1BQWM7UUFDM0MsS0FBSyxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRUQ7Ozs7Ozs7Ozs7T0FVRztJQUNILEtBQUssQ0FBQywwQkFBMEIsQ0FBQywrQkFBZ0UsRUFBRSxnQkFBa0M7UUFDakksK0NBQStDO1FBQy9DLE1BQU0sWUFBWSxHQUFHLG9DQUFvQyxDQUFDO1FBRTFELElBQUk7WUFDQSx1SEFBdUg7WUFDdkgsTUFBTSxDQUFDLGNBQWMsRUFBRSxxQkFBcUIsRUFBRSxzQkFBc0IsQ0FBQyxHQUFHLE1BQU0sS0FBSyxDQUFDLDBCQUEwQixDQUFDLHFCQUFTLENBQUMsZ0JBQWdCLENBQUMsNEJBQTRCLEVBQ2xLLFNBQVMsRUFBRSxnQkFBZ0IsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLHdDQUF1QixDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXJGLDRFQUE0RTtZQUM1RSxJQUFJLGNBQWMsS0FBSyxJQUFJLElBQUksY0FBYyxDQUFDLE1BQU0sS0FBSyxDQUFDO2dCQUN0RCxxQkFBcUIsS0FBSyxJQUFJLElBQUkscUJBQXFCLENBQUMsTUFBTSxLQUFLLENBQUM7Z0JBQ3BFLHNCQUFzQixLQUFLLElBQUksSUFBSSxzQkFBdUIsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUN6RSxNQUFNLFlBQVksR0FBRyxnREFBZ0QsQ0FBQztnQkFDdEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENB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Y2VzQ29udGVudCI6WyJpbXBvcnQge0Jhc2VBUElDbGllbnR9IGZyb20gXCIuL0Jhc2VBUElDbGllbnRcIjtcbmltcG9ydCB7XG4gICAgTm90aWZpY2F0aW9uQ2hhbm5lbFR5cGUsXG4gICAgTm90aWZpY2F0aW9uUmVzcG9uc2UsXG4gICAgTm90aWZpY2F0aW9uc0Vycm9yVHlwZSxcbiAgICBOb3RpZmljYXRpb25UeXBlLFxuICAgIFNlbmRFbWFpbE5vdGlmaWNhdGlvbklucHV0LFxuICAgIFNlbmRNb2JpbGVQdXNoTm90aWZpY2F0aW9uSW5wdXRcbn0gZnJvbSBcIi4uL0dyYXBocWxFeHBvcnRzXCI7XG5pbXBvcnQge0NvbnN0YW50c30gZnJvbSBcIi4uL0NvbnN0YW50c1wiO1xuaW1wb3J0IGF4aW9zIGZyb20gXCJheGlvc1wiO1xuXG4vKipcbiAqIENsYXNzIHVzZWQgYXMgdGhlIGJhc2UvZ2VuZXJpYyBjbGllbnQgZm9yIGFsbCBDb3VyaWVyL25vdGlmaWNhdGlvbi1yZWxhdGVkIGNhbGxzLlxuICovXG5leHBvcnQgY2xhc3MgQ291cmllckNsaWVudCBleHRlbmRzIEJhc2VBUElDbGllbnQge1xuXG4gICAgLyoqXG4gICAgICogR2VuZXJpYyBjb25zdHJ1Y3RvciBmb3IgdGhlIGNsaWVudC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBlbnZpcm9ubWVudCB0aGUgQVdTIGVudmlyb25tZW50IHBhc3NlZCBpbiBmcm9tIHRoZSBMYW1iZGEgcmVzb2x2ZXIuXG4gICAgICogQHBhcmFtIHJlZ2lvbiB0aGUgQVdTIHJlZ2lvbiBwYXNzZWQgaW4gZnJvbSB0aGUgTGFtYmRhIHJlc29sdmVyLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGVudmlyb25tZW50OiBzdHJpbmcsIHJlZ2lvbjogc3RyaW5nKSB7XG4gICAgICAgIHN1cGVyKHJlZ2lvbiwgZW52aXJvbm1lbnQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHVzZWQgdG8gc2VuZCBhIG1vYmlsZSBwdXNoIG5vdGlmaWNhdGlvbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBzZW5kTW9iaWxlUHVzaE5vdGlmaWNhdGlvbklucHV0IHRoZSBub3RpZmljYXRpb24gaW5wdXQgZGV0YWlscyB0byBiZSBwYXNzZWQgaW4sIGluIG9yZGVyIHRvIHNlbmRcbiAgICAgKiBhIG1vYmlsZSBwdXNoIG5vdGlmaWNhdGlvblxuICAgICAqIEBwYXJhbSBub3RpZmljYXRpb25UeXBlIHRoZSB0eXBlIG9mIG5vdGlmaWNhdGlvbiB0byBzZW5kIG1vYmlsZSBwdXNoIG5vdGlmaWNhdGlvbnMgZm9yXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBhIHtAbGluayBOb3RpZmljYXRpb25SZXNwb25zZX0gcmVwcmVzZW50aW5nIHRoZSBDb3VyaWVyIG5vdGlmaWNhdGlvbiByZXNwb25zZVxuICAgICAqXG4gICAgICogQHByb3RlY3RlZFxuICAgICAqL1xuICAgIGFzeW5jIHNlbmRNb2JpbGVQdXNoTm90aWZpY2F0aW9uKHNlbmRNb2JpbGVQdXNoTm90aWZpY2F0aW9uSW5wdXQ6IFNlbmRNb2JpbGVQdXNoTm90aWZpY2F0aW9uSW5wdXQsIG5vdGlmaWNhdGlvblR5cGU6IE5vdGlmaWNhdGlvblR5cGUpOiBQcm9taXNlPE5vdGlmaWNhdGlvblJlc3BvbnNlPiB7XG4gICAgICAgIC8vIGVhc2lseSBpZGVudGlmaWFibGUgQVBJIGVuZHBvaW50IGluZm9ybWF0aW9uXG4gICAgICAgIGNvbnN0IGVuZHBvaW50SW5mbyA9ICdQT1NUIC9zZW5kIG1vYmlsZSBwdXNoIENvdXJpZXIgQVBJJztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIEFQSSBLZXkgYW5kIEJhc2UgVVJMLCBuZWVkZWQgaW4gb3JkZXIgdG8gbWFrZSB0aGUgUE9TVCBzZW5kIG1vYmlsZSBwdXNoIG5vdGlmaWNhdGlvbiB0aHJvdWdoIHRoZSBjbGllbnRcbiAgICAgICAgICAgIGNvbnN0IFtjb3VyaWVyQmFzZVVSTCwgbm90aWZpY2F0aW9uQXV0aFRva2VuLCBub3RpZmljYXRpb25UZW1wbGF0ZUlkXSA9IGF3YWl0IHN1cGVyLnJldHJpZXZlU2VydmljZUNyZWRlbnRpYWxzKENvbnN0YW50cy5BV1NQYWlyQ29uc3RhbnRzLkNPVVJJRVJfSU5URVJOQUxfU0VDUkVUX05BTUUsXG4gICAgICAgICAgICAgICAgdW5kZWZpbmVkLCBub3RpZmljYXRpb25UeXBlLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgTm90aWZpY2F0aW9uQ2hhbm5lbFR5cGUuUHVzaCk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB3ZSBvYnRhaW5lZCBhbnkgaW52YWxpZCBzZWNyZXQgdmFsdWVzIGZyb20gdGhlIGNhbGwgYWJvdmVcbiAgICAgICAgICAgIGlmIChjb3VyaWVyQmFzZVVSTCA9PT0gbnVsbCB8fCBjb3VyaWVyQmFzZVVSTC5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25BdXRoVG9rZW4gPT09IG51bGwgfHwgbm90aWZpY2F0aW9uQXV0aFRva2VuLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvblRlbXBsYXRlSWQgPT09IG51bGwgfHwgbm90aWZpY2F0aW9uVGVtcGxhdGVJZCEubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gXCJJbnZhbGlkIFNlY3JldHMgb2J0YWluZWQgZm9yIENvdXJpZXIgQVBJIGNhbGwhXCI7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBQT1NUIC9zZW5kXG4gICAgICAgICAgICAgKiBAbGluayBodHRwczovL3d3dy5jb3VyaWVyLmNvbS9kb2NzL3JlZmVyZW5jZS9zZW5kL21lc3NhZ2UvXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogYnVpbGQgdGhlIENvdXJpZXIgQVBJIHJlcXVlc3QgYm9keSB0byBiZSBwYXNzZWQgaW4sIGFuZCBwZXJmb3JtIGEgUE9TVCB0byBpdCB3aXRoIHRoZSBhcHByb3ByaWF0ZSBpbmZvcm1hdGlvblxuICAgICAgICAgICAgICogd2UgaW1wbHkgdGhhdCBpZiB0aGUgQVBJIGRvZXMgbm90IHJlc3BvbmQgaW4gMTUgc2Vjb25kcywgdGhlbiB3ZSBhdXRvbWF0aWNhbGx5IGNhdGNoIHRoYXQsIGFuZCByZXR1cm4gYW5cbiAgICAgICAgICAgICAqIGVycm9yIGZvciBhIGJldHRlciBjdXN0b21lciBleHBlcmllbmNlLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBjb25zdCByZXF1ZXN0RGF0YSA9IHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiB7XG4gICAgICAgICAgICAgICAgICAgIHRvOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBleHBvOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW5zOiBzZW5kTW9iaWxlUHVzaE5vdGlmaWNhdGlvbklucHV0LmV4cG9QdXNoVG9rZW5zXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBub3RpZmljYXRpb25UZW1wbGF0ZUlkLFxuICAgICAgICAgICAgICAgICAgICBwcm92aWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4cG86IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdmVycmlkZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0dGw6IDMwMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc291bmQ6IFwiZGVmYXVsdFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmlvcml0eTogXCJoaWdoXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIC4uLigoc2VuZE1vYmlsZVB1c2hOb3RpZmljYXRpb25JbnB1dC5wZW5kaW5nQ2FzaGJhY2sgPT09IHVuZGVmaW5lZCB8fCBzZW5kTW9iaWxlUHVzaE5vdGlmaWNhdGlvbklucHV0LnBlbmRpbmdDYXNoYmFjayA9PT0gbnVsbClcbiAgICAgICAgICAgICAgICAgICAgICAgICYmIHNlbmRNb2JpbGVQdXNoTm90aWZpY2F0aW9uSW5wdXQubWVyY2hhbnROYW1lICE9PSB1bmRlZmluZWQgJiYgc2VuZE1vYmlsZVB1c2hOb3RpZmljYXRpb25JbnB1dC5tZXJjaGFudE5hbWUgIT09IG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgICYmIHNlbmRNb2JpbGVQdXNoTm90aWZpY2F0aW9uSW5wdXQubWVyY2hhbnROYW1lLmxlbmd0aCAhPT0gMCAmJiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXJjaGFudE5hbWU6IHNlbmRNb2JpbGVQdXNoTm90aWZpY2F0aW9uSW5wdXQubWVyY2hhbnROYW1lIVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAuLi4oc2VuZE1vYmlsZVB1c2hOb3RpZmljYXRpb25JbnB1dC5wZW5kaW5nQ2FzaGJhY2sgIT09IHVuZGVmaW5lZCAmJiBzZW5kTW9iaWxlUHVzaE5vdGlmaWNhdGlvbklucHV0LnBlbmRpbmdDYXNoYmFjayAhPT0gbnVsbFxuICAgICAgICAgICAgICAgICAgICAgICAgJiYgc2VuZE1vYmlsZVB1c2hOb3RpZmljYXRpb25JbnB1dC5tZXJjaGFudE5hbWUgIT09IHVuZGVmaW5lZCAmJiBzZW5kTW9iaWxlUHVzaE5vdGlmaWNhdGlvbklucHV0Lm1lcmNoYW50TmFtZSAhPT0gbnVsbFxuICAgICAgICAgICAgICAgICAgICAgICAgJiYgc2VuZE1vYmlsZVB1c2hOb3RpZmljYXRpb25JbnB1dC5tZXJjaGFudE5hbWUubGVuZ3RoICE9PSAwICYmIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBlbmRpbmdDYXNoYmFjazogc2VuZE1vYmlsZVB1c2hOb3RpZmljYXRpb25JbnB1dC5wZW5kaW5nQ2FzaGJhY2shLnRvU3RyaW5nKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lcmNoYW50TmFtZTogc2VuZE1vYmlsZVB1c2hOb3RpZmljYXRpb25JbnB1dC5tZXJjaGFudE5hbWUhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBDb3VyaWVyIEFQSSByZXF1ZXN0IE9iamVjdDogJHtKU09OLnN0cmluZ2lmeShyZXF1ZXN0RGF0YSl9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiBheGlvcy5wb3N0KGAke2NvdXJpZXJCYXNlVVJMfS9zZW5kYCwgcmVxdWVzdERhdGEsIHtcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgICAgICBcIkF1dGhvcml6YXRpb25cIjogYEJlYXJlciAke25vdGlmaWNhdGlvbkF1dGhUb2tlbn1gXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiAxNTAwMCwgLy8gaW4gbWlsbGlzZWNvbmRzIGhlcmVcbiAgICAgICAgICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlOiAnQ291cmllciBBUEkgdGltZWQgb3V0IGFmdGVyIDE1MDAwbXMhJ1xuICAgICAgICAgICAgfSkudGhlbihzZW5kTW9iaWxlUHVzaFJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlbmRwb2ludEluZm99IHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoc2VuZE1vYmlsZVB1c2hSZXNwb25zZS5kYXRhKX1gKTtcblxuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIGlmIHdlIHJlYWNoZWQgdGhpcywgdGhlbiB3ZSBhc3N1bWUgdGhhdCBhIDJ4eCByZXNwb25zZSBjb2RlIHdhcyByZXR1cm5lZC5cbiAgICAgICAgICAgICAgICAgKiBjaGVjayB0aGUgY29udGVudHMgb2YgdGhlIHJlc3BvbnNlLCBhbmQgYWN0IGFwcHJvcHJpYXRlbHkuXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgaWYgKHNlbmRNb2JpbGVQdXNoUmVzcG9uc2UuZGF0YSAmJiBzZW5kTW9iaWxlUHVzaFJlc3BvbnNlLmRhdGFbXCJyZXF1ZXN0SWRcIl0pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVlc3RJZDogc2VuZE1vYmlsZVB1c2hSZXNwb25zZS5kYXRhW1wicmVxdWVzdElkXCJdXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgSW52YWxpZCByZXNwb25zZSBzdHJ1Y3R1cmUgcmV0dXJuZWQgZnJvbSAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UhYCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IucmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGFuZCB0aGUgc2VydmVyIHJlc3BvbmRlZCB3aXRoIGEgc3RhdHVzIGNvZGVcbiAgICAgICAgICAgICAgICAgICAgICogdGhhdCBmYWxscyBvdXQgb2YgdGhlIHJhbmdlIG9mIDJ4eC5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBOb24gMnh4eCByZXNwb25zZSB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gQ291cmllciBBUEksIHdpdGggc3RhdHVzICR7ZXJyb3IucmVzcG9uc2Uuc3RhdHVzfSwgYW5kIHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoZXJyb3IucmVzcG9uc2UuZGF0YSl9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBhbnkgb3RoZXIgc3BlY2lmaWMgZXJyb3JzIHRvIGJlIGZpbHRlcmVkIGJlbG93XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVycm9yLnJlcXVlc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRoZSByZXF1ZXN0IHdhcyBtYWRlIGJ1dCBubyByZXNwb25zZSB3YXMgcmVjZWl2ZWRcbiAgICAgICAgICAgICAgICAgICAgICogYGVycm9yLnJlcXVlc3RgIGlzIGFuIGluc3RhbmNlIG9mIFhNTEh0dHBSZXF1ZXN0IGluIHRoZSBicm93c2VyIGFuZCBhbiBpbnN0YW5jZSBvZlxuICAgICAgICAgICAgICAgICAgICAgKiAgaHR0cC5DbGllbnRSZXF1ZXN0IGluIG5vZGUuanMuXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm8gcmVzcG9uc2UgcmVjZWl2ZWQgd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IENvdXJpZXIgQVBJLCBmb3IgcmVxdWVzdCAke2Vycm9yLnJlcXVlc3R9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU29tZXRoaW5nIGhhcHBlbmVkIGluIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgdGhhdCB0cmlnZ2VyZWQgYW4gRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgc2V0dGluZyB1cCB0aGUgcmVxdWVzdCBmb3IgdGhlICR7ZW5kcG9pbnRJbmZvfSBDb3VyaWVyIEFQSSwgJHsoZXJyb3IgJiYgZXJyb3IubWVzc2FnZSkgJiYgZXJyb3IubWVzc2FnZX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBpbml0aWF0aW5nIHRoZSBtb2JpbGUgcHVzaCBub3RpZmljYXRpb24gc2VuZGluZyB0aHJvdWdoICR7ZW5kcG9pbnRJbmZvfWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9ICR7ZXJyfWApO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB1c2VkIHRvIHNlbmQgYW4gZW1haWwgbm90aWZpY2F0aW9uLlxuICAgICAqXG4gICAgICogQHBhcmFtIHNlbmRFbWFpbE5vdGlmaWNhdGlvbklucHV0IHRoZSBub3RpZmljYXRpb24gaW5wdXQgZGV0YWlscyB0byBiZSBwYXNzZWQgaW4sIGluIG9yZGVyIHRvIHNlbmRcbiAgICAgKiBhbiBlbWFpbCBub3RpZmljYXRpb25cbiAgICAgKiBAcGFyYW0gbm90aWZpY2F0aW9uVHlwZSB0aGUgdHlwZSBvZiBub3RpZmljYXRpb24gdG8gc2VuZCBlbWFpbCBub3RpZmljYXRpb25zIGZvclxuICAgICAqXG4gICAgICogQHJldHVybnMgYSB7QGxpbmsgTm90aWZpY2F0aW9uUmVzcG9uc2V9IHJlcHJlc2VudGluZyB0aGUgQ291cmllciBub3RpZmljYXRpb24gcmVzcG9uc2VcbiAgICAgKi9cbiAgICBhc3luYyBzZW5kRW1haWxOb3RpZmljYXRpb24oc2VuZEVtYWlsTm90aWZpY2F0aW9uSW5wdXQ6IFNlbmRFbWFpbE5vdGlmaWNhdGlvbklucHV0LCBub3RpZmljYXRpb25UeXBlOiBOb3RpZmljYXRpb25UeXBlKTogUHJvbWlzZTxOb3RpZmljYXRpb25SZXNwb25zZT4ge1xuICAgICAgICAvLyBlYXNpbHkgaWRlbnRpZmlhYmxlIEFQSSBlbmRwb2ludCBpbmZvcm1hdGlvblxuICAgICAgICBjb25zdCBlbmRwb2ludEluZm8gPSAnUE9TVCAvc2VuZCBlbWFpbCBDb3VyaWVyIEFQSSc7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHJldHJpZXZlIHRoZSBBUEkgS2V5IGFuZCBCYXNlIFVSTCwgbmVlZGVkIGluIG9yZGVyIHRvIG1ha2UgdGhlIFBPU1Qgc2VuZCBlbWFpbCBub3RpZmljYXRpb24gdGhyb3VnaCB0aGUgY2xpZW50XG4gICAgICAgICAgICBjb25zdCBbY291cmllckJhc2VVUkwsIG5vdGlmaWNhdGlvbkF1dGhUb2tlbiwgbm90aWZpY2F0aW9uVGVtcGxhdGVJZF0gPSBhd2FpdCBzdXBlci5yZXRyaWV2ZVNlcnZpY2VDcmVkZW50aWFscyhDb25zdGFudHMuQVdTUGFpckNvbnN0YW50cy5DT1VSSUVSX0lOVEVSTkFMX1NFQ1JFVF9OQU1FLFxuICAgICAgICAgICAgICAgIHVuZGVmaW5lZCwgbm90aWZpY2F0aW9uVHlwZSwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIE5vdGlmaWNhdGlvbkNoYW5uZWxUeXBlLkVtYWlsKTtcblxuICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHdlIG9idGFpbmVkIGFueSBpbnZhbGlkIHNlY3JldCB2YWx1ZXMgZnJvbSB0aGUgY2FsbCBhYm92ZVxuICAgICAgICAgICAgaWYgKGNvdXJpZXJCYXNlVVJMID09PSBudWxsIHx8IGNvdXJpZXJCYXNlVVJMLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbkF1dGhUb2tlbiA9PT0gbnVsbCB8fCBub3RpZmljYXRpb25BdXRoVG9rZW4ubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uVGVtcGxhdGVJZCA9PT0gbnVsbCB8fCBub3RpZmljYXRpb25UZW1wbGF0ZUlkIS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBcIkludmFsaWQgU2VjcmV0cyBvYnRhaW5lZCBmb3IgQ291cmllciBBUEkgY2FsbCFcIjtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFBPU1QgL3NlbmRcbiAgICAgICAgICAgICAqIEBsaW5rIGh0dHBzOi8vd3d3LmNvdXJpZXIuY29tL2RvY3MvcmVmZXJlbmNlL3NlbmQvbWVzc2FnZS9cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBidWlsZCB0aGUgQ291cmllciBBUEkgcmVxdWVzdCBib2R5IHRvIGJlIHBhc3NlZCBpbiwgYW5kIHBlcmZvcm0gYSBQT1NUIHRvIGl0IHdpdGggdGhlIGFwcHJvcHJpYXRlIGluZm9ybWF0aW9uXG4gICAgICAgICAgICAgKiB3ZSBpbXBseSB0aGF0IGlmIHRoZSBBUEkgZG9lcyBub3QgcmVzcG9uZCBpbiAxNSBzZWNvbmRzLCB0aGVuIHdlIGF1dG9tYXRpY2FsbHkgY2F0Y2ggdGhhdCwgYW5kIHJldHVybiBhblxuICAgICAgICAgICAgICogZXJyb3IgZm9yIGEgYmV0dGVyIGN1c3RvbWVyIGV4cGVyaWVuY2UuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGNvbnN0IHJlcXVlc3REYXRhID0ge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IHtcbiAgICAgICAgICAgICAgICAgICAgdG86IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVtYWlsOiBzZW5kRW1haWxOb3RpZmljYXRpb25JbnB1dC5lbWFpbERlc3RpbmF0aW9uXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBub3RpZmljYXRpb25UZW1wbGF0ZUlkLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmdWxsTmFtZTogc2VuZEVtYWlsTm90aWZpY2F0aW9uSW5wdXQudXNlckZ1bGxOYW1lXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc29sZS5sb2coYENvdXJpZXIgQVBJIHJlcXVlc3QgT2JqZWN0OiAke0pTT04uc3RyaW5naWZ5KHJlcXVlc3REYXRhKX1gKTtcblxuICAgICAgICAgICAgcmV0dXJuIGF4aW9zLnBvc3QoYCR7Y291cmllckJhc2VVUkx9L3NlbmRgLCByZXF1ZXN0RGF0YSwge1xuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiQXV0aG9yaXphdGlvblwiOiBgQmVhcmVyICR7bm90aWZpY2F0aW9uQXV0aFRva2VufWBcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDE1MDAwLCAvLyBpbiBtaWxsaXNlY29uZHMgaGVyZVxuICAgICAgICAgICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2U6ICdDb3VyaWVyIEFQSSB0aW1lZCBvdXQgYWZ0ZXIgMTUwMDBtcyEnXG4gICAgICAgICAgICB9KS50aGVuKHNlbmRFbWFpbFJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlbmRwb2ludEluZm99IHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoc2VuZEVtYWlsUmVzcG9uc2UuZGF0YSl9YCk7XG5cbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiBpZiB3ZSByZWFjaGVkIHRoaXMsIHRoZW4gd2UgYXNzdW1lIHRoYXQgYSAyeHggcmVzcG9uc2UgY29kZSB3YXMgcmV0dXJuZWQuXG4gICAgICAgICAgICAgICAgICogY2hlY2sgdGhlIGNvbnRlbnRzIG9mIHRoZSByZXNwb25zZSwgYW5kIGFjdCBhcHByb3ByaWF0ZWx5LlxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGlmIChzZW5kRW1haWxSZXNwb25zZS5kYXRhICYmIHNlbmRFbWFpbFJlc3BvbnNlLmRhdGFbXCJyZXF1ZXN0SWRcIl0pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVlc3RJZDogc2VuZEVtYWlsUmVzcG9uc2UuZGF0YVtcInJlcXVlc3RJZFwiXVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogYEludmFsaWQgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gJHtlbmRwb2ludEluZm99IHJlc3BvbnNlIWAsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yLnJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBhbmQgdGhlIHNlcnZlciByZXNwb25kZWQgd2l0aCBhIHN0YXR1cyBjb2RlXG4gICAgICAgICAgICAgICAgICAgICAqIHRoYXQgZmFsbHMgb3V0IG9mIHRoZSByYW5nZSBvZiAyeHguXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm9uIDJ4eHggcmVzcG9uc2Ugd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IENvdXJpZXIgQVBJLCB3aXRoIHN0YXR1cyAke2Vycm9yLnJlc3BvbnNlLnN0YXR1c30sIGFuZCByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGVycm9yLnJlc3BvbnNlLmRhdGEpfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gYW55IG90aGVyIHNwZWNpZmljIGVycm9ycyB0byBiZSBmaWx0ZXJlZCBiZWxvd1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5yZXF1ZXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBidXQgbm8gcmVzcG9uc2Ugd2FzIHJlY2VpdmVkXG4gICAgICAgICAgICAgICAgICAgICAqIGBlcnJvci5yZXF1ZXN0YCBpcyBhbiBpbnN0YW5jZSBvZiBYTUxIdHRwUmVxdWVzdCBpbiB0aGUgYnJvd3NlciBhbmQgYW4gaW5zdGFuY2Ugb2ZcbiAgICAgICAgICAgICAgICAgICAgICogIGh0dHAuQ2xpZW50UmVxdWVzdCBpbiBub2RlLmpzLlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vIHJlc3BvbnNlIHJlY2VpdmVkIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBDb3VyaWVyIEFQSSwgZm9yIHJlcXVlc3QgJHtlcnJvci5yZXF1ZXN0fWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNvbWV0aGluZyBoYXBwZW5lZCBpbiBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IHRoYXQgdHJpZ2dlcmVkIGFuIEVycm9yXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgZm9yIHRoZSAke2VuZHBvaW50SW5mb30gQ291cmllciBBUEksICR7KGVycm9yICYmIGVycm9yLm1lc3NhZ2UpICYmIGVycm9yLm1lc3NhZ2V9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgaW5pdGlhdGluZyB0aGUgZW1haWwgbm90aWZpY2F0aW9uIHNlbmRpbmcgdGhyb3VnaCAke2VuZHBvaW50SW5mb31gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfSAke2Vycn1gKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxufVxuIl19