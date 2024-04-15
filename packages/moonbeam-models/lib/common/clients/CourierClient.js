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
}
exports.CourierClient = CourierClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ291cmllckNsaWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tb24vY2xpZW50cy9Db3VyaWVyQ2xpZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLG1EQUE4QztBQUM5QyxzREFPMkI7QUFDM0IsNENBQXVDO0FBQ3ZDLGtEQUEwQjtBQUUxQjs7R0FFRztBQUNILE1BQWEsYUFBYyxTQUFRLDZCQUFhO0lBRTVDOzs7OztPQUtHO0lBQ0gsWUFBWSxXQUFtQixFQUFFLE1BQWM7UUFDM0MsS0FBSyxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRUQ7Ozs7Ozs7Ozs7T0FVRztJQUNILEtBQUssQ0FBQywwQkFBMEIsQ0FBQywrQkFBZ0UsRUFBRSxnQkFBa0M7UUFDakksK0NBQStDO1FBQy9DLE1BQU0sWUFBWSxHQUFHLG9DQUFvQyxDQUFDO1FBRTFELElBQUk7WUFDQSx1SEFBdUg7WUFDdkgsTUFBTSxDQUFDLGNBQWMsRUFBRSxxQkFBcUIsRUFBRSxzQkFBc0IsQ0FBQyxHQUFHLE1BQU0sS0FBSyxDQUFDLDBCQUEwQixDQUFDLHFCQUFTLENBQUMsZ0JBQWdCLENBQUMsNEJBQTRCLEVBQ2xLLFNBQVMsRUFBRSxnQkFBZ0IsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLHdDQUF1QixDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXJGLDRFQUE0RTtZQUM1RSxJQUFJLGNBQWMsS0FBSyxJQUFJLElBQUksY0FBYyxDQUFDLE1BQU0sS0FBSyxDQUFDO2dCQUN0RCxxQkFBcUIsS0FBSyxJQUFJLElBQUkscUJBQXFCLENBQUMsTUFBTSxLQUFLLENBQUM7Z0JBQ3BFLHNCQUFzQixLQUFLLElBQUksSUFBSSxzQkFBdUIsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUN6RSxNQUFNLFlBQVksR0FBRyxnREFBZ0QsQ0FBQztnQkFDdEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENB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TyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztvQkFFMUIsT0FBTzt3QkFDSCxZQUFZLEVBQUUsWUFBWTt3QkFDMUIsU0FBUyxFQUFFLHVDQUFzQixDQUFDLGVBQWU7cUJBQ3BELENBQUM7aUJBQ0w7cUJBQU07b0JBQ0gsdUVBQXVFO29CQUN2RSxNQUFNLFlBQVksR0FBRyx5REFBeUQsWUFBWSxpQkFBaUIsQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztvQkFDdkosT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztvQkFFMUIsT0FBTzt3QkFDSCxZQUFZLEVBQUUsWUFBWTt3QkFDMUIsU0FBUyxFQUFFLHVDQUFzQixDQUFDLGVBQWU7cUJBQ3BELENBQUM7aUJBQ0w7WUFDTCxDQUFDLENBQUMsQ0FBQztTQUNOO1FBQUMsT0FBTyxHQUFHLEVBQUU7WUFDVixNQUFNLFlBQVksR0FBRyw0RUFBNEUsWUFBWSxFQUFFLENBQUM7WUFDaEgsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFlBQVksSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBRXRDLE9BQU87Z0JBQ0gsWUFBWSxFQUFFLFlBQVk7Z0JBQzFCLFNBQVMsRUFBRSx1Q0FBc0IsQ0FBQyxlQUFlO2FBQ3BELENBQUM7U0FDTDtJQUNMLENBQUM7Q0FDSjtBQWhURCxzQ0FnVEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0Jhc2VBUElDbGllbnR9IGZyb20gXCIuL0Jhc2VBUElDbGllbnRcIjtcbmltcG9ydCB7XG4gICAgTm90aWZpY2F0aW9uQ2hhbm5lbFR5cGUsXG4gICAgTm90aWZpY2F0aW9uUmVzcG9uc2UsXG4gICAgTm90aWZpY2F0aW9uc0Vycm9yVHlwZSxcbiAgICBOb3RpZmljYXRpb25UeXBlLFxuICAgIFNlbmRFbWFpbE5vdGlmaWNhdGlvbklucHV0LFxuICAgIFNlbmRNb2JpbGVQdXNoTm90aWZpY2F0aW9uSW5wdXRcbn0gZnJvbSBcIi4uL0dyYXBocWxFeHBvcnRzXCI7XG5pbXBvcnQge0NvbnN0YW50c30gZnJvbSBcIi4uL0NvbnN0YW50c1wiO1xuaW1wb3J0IGF4aW9zIGZyb20gXCJheGlvc1wiO1xuXG4vKipcbiAqIENsYXNzIHVzZWQgYXMgdGhlIGJhc2UvZ2VuZXJpYyBjbGllbnQgZm9yIGFsbCBDb3VyaWVyL25vdGlmaWNhdGlvbi1yZWxhdGVkIGNhbGxzLlxuICovXG5leHBvcnQgY2xhc3MgQ291cmllckNsaWVudCBleHRlbmRzIEJhc2VBUElDbGllbnQge1xuXG4gICAgLyoqXG4gICAgICogR2VuZXJpYyBjb25zdHJ1Y3RvciBmb3IgdGhlIGNsaWVudC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBlbnZpcm9ubWVudCB0aGUgQVdTIGVudmlyb25tZW50IHBhc3NlZCBpbiBmcm9tIHRoZSBMYW1iZGEgcmVzb2x2ZXIuXG4gICAgICogQHBhcmFtIHJlZ2lvbiB0aGUgQVdTIHJlZ2lvbiBwYXNzZWQgaW4gZnJvbSB0aGUgTGFtYmRhIHJlc29sdmVyLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGVudmlyb25tZW50OiBzdHJpbmcsIHJlZ2lvbjogc3RyaW5nKSB7XG4gICAgICAgIHN1cGVyKHJlZ2lvbiwgZW52aXJvbm1lbnQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHVzZWQgdG8gc2VuZCBhIG1vYmlsZSBwdXNoIG5vdGlmaWNhdGlvbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBzZW5kTW9iaWxlUHVzaE5vdGlmaWNhdGlvbklucHV0IHRoZSBub3RpZmljYXRpb24gaW5wdXQgZGV0YWlscyB0byBiZSBwYXNzZWQgaW4sIGluIG9yZGVyIHRvIHNlbmRcbiAgICAgKiBhIG1vYmlsZSBwdXNoIG5vdGlmaWNhdGlvblxuICAgICAqIEBwYXJhbSBub3RpZmljYXRpb25UeXBlIHRoZSB0eXBlIG9mIG5vdGlmaWNhdGlvbiB0byBzZW5kIG1vYmlsZSBwdXNoIG5vdGlmaWNhdGlvbnMgZm9yXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBhIHtAbGluayBOb3RpZmljYXRpb25SZXNwb25zZX0gcmVwcmVzZW50aW5nIHRoZSBDb3VyaWVyIG5vdGlmaWNhdGlvbiByZXNwb25zZVxuICAgICAqXG4gICAgICogQHByb3RlY3RlZFxuICAgICAqL1xuICAgIGFzeW5jIHNlbmRNb2JpbGVQdXNoTm90aWZpY2F0aW9uKHNlbmRNb2JpbGVQdXNoTm90aWZpY2F0aW9uSW5wdXQ6IFNlbmRNb2JpbGVQdXNoTm90aWZpY2F0aW9uSW5wdXQsIG5vdGlmaWNhdGlvblR5cGU6IE5vdGlmaWNhdGlvblR5cGUpOiBQcm9taXNlPE5vdGlmaWNhdGlvblJlc3BvbnNlPiB7XG4gICAgICAgIC8vIGVhc2lseSBpZGVudGlmaWFibGUgQVBJIGVuZHBvaW50IGluZm9ybWF0aW9uXG4gICAgICAgIGNvbnN0IGVuZHBvaW50SW5mbyA9ICdQT1NUIC9zZW5kIG1vYmlsZSBwdXNoIENvdXJpZXIgQVBJJztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIEFQSSBLZXkgYW5kIEJhc2UgVVJMLCBuZWVkZWQgaW4gb3JkZXIgdG8gbWFrZSB0aGUgUE9TVCBzZW5kIG1vYmlsZSBwdXNoIG5vdGlmaWNhdGlvbiB0aHJvdWdoIHRoZSBjbGllbnRcbiAgICAgICAgICAgIGNvbnN0IFtjb3VyaWVyQmFzZVVSTCwgbm90aWZpY2F0aW9uQXV0aFRva2VuLCBub3RpZmljYXRpb25UZW1wbGF0ZUlkXSA9IGF3YWl0IHN1cGVyLnJldHJpZXZlU2VydmljZUNyZWRlbnRpYWxzKENvbnN0YW50cy5BV1NQYWlyQ29uc3RhbnRzLkNPVVJJRVJfSU5URVJOQUxfU0VDUkVUX05BTUUsXG4gICAgICAgICAgICAgICAgdW5kZWZpbmVkLCBub3RpZmljYXRpb25UeXBlLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgTm90aWZpY2F0aW9uQ2hhbm5lbFR5cGUuUHVzaCk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB3ZSBvYnRhaW5lZCBhbnkgaW52YWxpZCBzZWNyZXQgdmFsdWVzIGZyb20gdGhlIGNhbGwgYWJvdmVcbiAgICAgICAgICAgIGlmIChjb3VyaWVyQmFzZVVSTCA9PT0gbnVsbCB8fCBjb3VyaWVyQmFzZVVSTC5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25BdXRoVG9rZW4gPT09IG51bGwgfHwgbm90aWZpY2F0aW9uQXV0aFRva2VuLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvblRlbXBsYXRlSWQgPT09IG51bGwgfHwgbm90aWZpY2F0aW9uVGVtcGxhdGVJZCEubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gXCJJbnZhbGlkIFNlY3JldHMgb2J0YWluZWQgZm9yIENvdXJpZXIgQVBJIGNhbGwhXCI7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBQT1NUIC9zZW5kXG4gICAgICAgICAgICAgKiBAbGluayBodHRwczovL3d3dy5jb3VyaWVyLmNvbS9kb2NzL3JlZmVyZW5jZS9zZW5kL21lc3NhZ2UvXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogYnVpbGQgdGhlIENvdXJpZXIgQVBJIHJlcXVlc3QgYm9keSB0byBiZSBwYXNzZWQgaW4sIGFuZCBwZXJmb3JtIGEgUE9TVCB0byBpdCB3aXRoIHRoZSBhcHByb3ByaWF0ZSBpbmZvcm1hdGlvblxuICAgICAgICAgICAgICogd2UgaW1wbHkgdGhhdCBpZiB0aGUgQVBJIGRvZXMgbm90IHJlc3BvbmQgaW4gMTUgc2Vjb25kcywgdGhlbiB3ZSBhdXRvbWF0aWNhbGx5IGNhdGNoIHRoYXQsIGFuZCByZXR1cm4gYW5cbiAgICAgICAgICAgICAqIGVycm9yIGZvciBhIGJldHRlciBjdXN0b21lciBleHBlcmllbmNlLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBjb25zdCByZXF1ZXN0RGF0YSA9IHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiB7XG4gICAgICAgICAgICAgICAgICAgIHRvOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBleHBvOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW5zOiBzZW5kTW9iaWxlUHVzaE5vdGlmaWNhdGlvbklucHV0LmV4cG9QdXNoVG9rZW5zXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBub3RpZmljYXRpb25UZW1wbGF0ZUlkLFxuICAgICAgICAgICAgICAgICAgICBwcm92aWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4cG86IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdmVycmlkZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0dGw6IDMwMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc291bmQ6IFwiZGVmYXVsdFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmlvcml0eTogXCJoaWdoXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIC4uLihzZW5kTW9iaWxlUHVzaE5vdGlmaWNhdGlvbklucHV0LmluZWxpZ2libGVUcmFuc2FjdGlvbkFtb3VudCAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBzZW5kTW9iaWxlUHVzaE5vdGlmaWNhdGlvbklucHV0LmluZWxpZ2libGVUcmFuc2FjdGlvbkFtb3VudCAhPT0gbnVsbCAmJiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmVsaWdpYmxlVHJhbnNhY3Rpb25BbW91bnQ6IHNlbmRNb2JpbGVQdXNoTm90aWZpY2F0aW9uSW5wdXQuaW5lbGlnaWJsZVRyYW5zYWN0aW9uQW1vdW50IVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAuLi4oKHNlbmRNb2JpbGVQdXNoTm90aWZpY2F0aW9uSW5wdXQucGVuZGluZ0Nhc2hiYWNrID09PSB1bmRlZmluZWQgfHwgc2VuZE1vYmlsZVB1c2hOb3RpZmljYXRpb25JbnB1dC5wZW5kaW5nQ2FzaGJhY2sgPT09IG51bGwpXG4gICAgICAgICAgICAgICAgICAgICAgICAmJiBzZW5kTW9iaWxlUHVzaE5vdGlmaWNhdGlvbklucHV0Lm1lcmNoYW50TmFtZSAhPT0gdW5kZWZpbmVkICYmIHNlbmRNb2JpbGVQdXNoTm90aWZpY2F0aW9uSW5wdXQubWVyY2hhbnROYW1lICE9PSBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAmJiBzZW5kTW9iaWxlUHVzaE5vdGlmaWNhdGlvbklucHV0Lm1lcmNoYW50TmFtZS5sZW5ndGggIT09IDAgJiYge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVyY2hhbnROYW1lOiBzZW5kTW9iaWxlUHVzaE5vdGlmaWNhdGlvbklucHV0Lm1lcmNoYW50TmFtZSFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgLi4uKHNlbmRNb2JpbGVQdXNoTm90aWZpY2F0aW9uSW5wdXQucGVuZGluZ0Nhc2hiYWNrICE9PSB1bmRlZmluZWQgJiYgc2VuZE1vYmlsZVB1c2hOb3RpZmljYXRpb25JbnB1dC5wZW5kaW5nQ2FzaGJhY2sgIT09IG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgICYmIHNlbmRNb2JpbGVQdXNoTm90aWZpY2F0aW9uSW5wdXQubWVyY2hhbnROYW1lICE9PSB1bmRlZmluZWQgJiYgc2VuZE1vYmlsZVB1c2hOb3RpZmljYXRpb25JbnB1dC5tZXJjaGFudE5hbWUgIT09IG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgICYmIHNlbmRNb2JpbGVQdXNoTm90aWZpY2F0aW9uSW5wdXQubWVyY2hhbnROYW1lLmxlbmd0aCAhPT0gMCAmJiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwZW5kaW5nQ2FzaGJhY2s6IHNlbmRNb2JpbGVQdXNoTm90aWZpY2F0aW9uSW5wdXQucGVuZGluZ0Nhc2hiYWNrIS50b1N0cmluZygpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXJjaGFudE5hbWU6IHNlbmRNb2JpbGVQdXNoTm90aWZpY2F0aW9uSW5wdXQubWVyY2hhbnROYW1lIVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAuLi4oc2VuZE1vYmlsZVB1c2hOb3RpZmljYXRpb25JbnB1dC5kYWlseUVhcm5pbmdzU3VtbWFyeUFtb3VudCAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBzZW5kTW9iaWxlUHVzaE5vdGlmaWNhdGlvbklucHV0LmRhaWx5RWFybmluZ3NTdW1tYXJ5QW1vdW50ICE9PSBudWxsICYmIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhaWx5RWFybmluZ3NTdW1tYXJ5QW1vdW50OiBzZW5kTW9iaWxlUHVzaE5vdGlmaWNhdGlvbklucHV0LmRhaWx5RWFybmluZ3NTdW1tYXJ5QW1vdW50IS50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc29sZS5sb2coYENvdXJpZXIgQVBJIHJlcXVlc3QgT2JqZWN0OiAke0pTT04uc3RyaW5naWZ5KHJlcXVlc3REYXRhKX1gKTtcblxuICAgICAgICAgICAgcmV0dXJuIGF4aW9zLnBvc3QoYCR7Y291cmllckJhc2VVUkx9L3NlbmRgLCByZXF1ZXN0RGF0YSwge1xuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiQXV0aG9yaXphdGlvblwiOiBgQmVhcmVyICR7bm90aWZpY2F0aW9uQXV0aFRva2VufWBcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDE1MDAwLCAvLyBpbiBtaWxsaXNlY29uZHMgaGVyZVxuICAgICAgICAgICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2U6ICdDb3VyaWVyIEFQSSB0aW1lZCBvdXQgYWZ0ZXIgMTUwMDBtcyEnXG4gICAgICAgICAgICB9KS50aGVuKHNlbmRNb2JpbGVQdXNoUmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2VuZHBvaW50SW5mb30gcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShzZW5kTW9iaWxlUHVzaFJlc3BvbnNlLmRhdGEpfWApO1xuXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogaWYgd2UgcmVhY2hlZCB0aGlzLCB0aGVuIHdlIGFzc3VtZSB0aGF0IGEgMnh4IHJlc3BvbnNlIGNvZGUgd2FzIHJldHVybmVkLlxuICAgICAgICAgICAgICAgICAqIGNoZWNrIHRoZSBjb250ZW50cyBvZiB0aGUgcmVzcG9uc2UsIGFuZCBhY3QgYXBwcm9wcmlhdGVseS5cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBpZiAoc2VuZE1vYmlsZVB1c2hSZXNwb25zZS5kYXRhICYmIHNlbmRNb2JpbGVQdXNoUmVzcG9uc2UuZGF0YVtcInJlcXVlc3RJZFwiXSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdElkOiBzZW5kTW9iaWxlUHVzaFJlc3BvbnNlLmRhdGFbXCJyZXF1ZXN0SWRcIl1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBJbnZhbGlkIHJlc3BvbnNlIHN0cnVjdHVyZSByZXR1cm5lZCBmcm9tICR7ZW5kcG9pbnRJbmZvfSByZXNwb25zZSFgLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvclxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvci5yZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYW5kIHRoZSBzZXJ2ZXIgcmVzcG9uZGVkIHdpdGggYSBzdGF0dXMgY29kZVxuICAgICAgICAgICAgICAgICAgICAgKiB0aGF0IGZhbGxzIG91dCBvZiB0aGUgcmFuZ2Ugb2YgMnh4LlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vbiAyeHh4IHJlc3BvbnNlIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBDb3VyaWVyIEFQSSwgd2l0aCBzdGF0dXMgJHtlcnJvci5yZXNwb25zZS5zdGF0dXN9LCBhbmQgcmVzcG9uc2UgJHtKU09OLnN0cmluZ2lmeShlcnJvci5yZXNwb25zZS5kYXRhKX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGFueSBvdGhlciBzcGVjaWZpYyBlcnJvcnMgdG8gYmUgZmlsdGVyZWQgYmVsb3dcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3IucmVxdWVzdCkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVGhlIHJlcXVlc3Qgd2FzIG1hZGUgYnV0IG5vIHJlc3BvbnNlIHdhcyByZWNlaXZlZFxuICAgICAgICAgICAgICAgICAgICAgKiBgZXJyb3IucmVxdWVzdGAgaXMgYW4gaW5zdGFuY2Ugb2YgWE1MSHR0cFJlcXVlc3QgaW4gdGhlIGJyb3dzZXIgYW5kIGFuIGluc3RhbmNlIG9mXG4gICAgICAgICAgICAgICAgICAgICAqICBodHRwLkNsaWVudFJlcXVlc3QgaW4gbm9kZS5qcy5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBObyByZXNwb25zZSByZWNlaXZlZCB3aGlsZSBjYWxsaW5nIHRoZSAke2VuZHBvaW50SW5mb30gQ291cmllciBBUEksIGZvciByZXF1ZXN0ICR7ZXJyb3IucmVxdWVzdH1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTm90aWZpY2F0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBTb21ldGhpbmcgaGFwcGVuZWQgaW4gc2V0dGluZyB1cCB0aGUgcmVxdWVzdCB0aGF0IHRyaWdnZXJlZCBhbiBFcnJvclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IGZvciB0aGUgJHtlbmRwb2ludEluZm99IENvdXJpZXIgQVBJLCAkeyhlcnJvciAmJiBlcnJvci5tZXNzYWdlKSAmJiBlcnJvci5tZXNzYWdlfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGluaXRpYXRpbmcgdGhlIG1vYmlsZSBwdXNoIG5vdGlmaWNhdGlvbiBzZW5kaW5nIHRocm91Z2ggJHtlbmRwb2ludEluZm99YDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJ9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHVzZWQgdG8gc2VuZCBhbiBlbWFpbCBub3RpZmljYXRpb24uXG4gICAgICpcbiAgICAgKiBAcGFyYW0gc2VuZEVtYWlsTm90aWZpY2F0aW9uSW5wdXQgdGhlIG5vdGlmaWNhdGlvbiBpbnB1dCBkZXRhaWxzIHRvIGJlIHBhc3NlZCBpbiwgaW4gb3JkZXIgdG8gc2VuZFxuICAgICAqIGFuIGVtYWlsIG5vdGlmaWNhdGlvblxuICAgICAqIEBwYXJhbSBub3RpZmljYXRpb25UeXBlIHRoZSB0eXBlIG9mIG5vdGlmaWNhdGlvbiB0byBzZW5kIGVtYWlsIG5vdGlmaWNhdGlvbnMgZm9yXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBhIHtAbGluayBOb3RpZmljYXRpb25SZXNwb25zZX0gcmVwcmVzZW50aW5nIHRoZSBDb3VyaWVyIG5vdGlmaWNhdGlvbiByZXNwb25zZVxuICAgICAqL1xuICAgIGFzeW5jIHNlbmRFbWFpbE5vdGlmaWNhdGlvbihzZW5kRW1haWxOb3RpZmljYXRpb25JbnB1dDogU2VuZEVtYWlsTm90aWZpY2F0aW9uSW5wdXQsIG5vdGlmaWNhdGlvblR5cGU6IE5vdGlmaWNhdGlvblR5cGUpOiBQcm9taXNlPE5vdGlmaWNhdGlvblJlc3BvbnNlPiB7XG4gICAgICAgIC8vIGVhc2lseSBpZGVudGlmaWFibGUgQVBJIGVuZHBvaW50IGluZm9ybWF0aW9uXG4gICAgICAgIGNvbnN0IGVuZHBvaW50SW5mbyA9ICdQT1NUIC9zZW5kIGVtYWlsIENvdXJpZXIgQVBJJztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gcmV0cmlldmUgdGhlIEFQSSBLZXkgYW5kIEJhc2UgVVJMLCBuZWVkZWQgaW4gb3JkZXIgdG8gbWFrZSB0aGUgUE9TVCBzZW5kIGVtYWlsIG5vdGlmaWNhdGlvbiB0aHJvdWdoIHRoZSBjbGllbnRcbiAgICAgICAgICAgIGNvbnN0IFtjb3VyaWVyQmFzZVVSTCwgbm90aWZpY2F0aW9uQXV0aFRva2VuLCBub3RpZmljYXRpb25UZW1wbGF0ZUlkXSA9IGF3YWl0IHN1cGVyLnJldHJpZXZlU2VydmljZUNyZWRlbnRpYWxzKENvbnN0YW50cy5BV1NQYWlyQ29uc3RhbnRzLkNPVVJJRVJfSU5URVJOQUxfU0VDUkVUX05BTUUsXG4gICAgICAgICAgICAgICAgdW5kZWZpbmVkLCBub3RpZmljYXRpb25UeXBlLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgTm90aWZpY2F0aW9uQ2hhbm5lbFR5cGUuRW1haWwpO1xuXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgd2Ugb2J0YWluZWQgYW55IGludmFsaWQgc2VjcmV0IHZhbHVlcyBmcm9tIHRoZSBjYWxsIGFib3ZlXG4gICAgICAgICAgICBpZiAoY291cmllckJhc2VVUkwgPT09IG51bGwgfHwgY291cmllckJhc2VVUkwubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uQXV0aFRva2VuID09PSBudWxsIHx8IG5vdGlmaWNhdGlvbkF1dGhUb2tlbi5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25UZW1wbGF0ZUlkID09PSBudWxsIHx8IG5vdGlmaWNhdGlvblRlbXBsYXRlSWQhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IFwiSW52YWxpZCBTZWNyZXRzIG9idGFpbmVkIGZvciBDb3VyaWVyIEFQSSBjYWxsIVwiO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogUE9TVCAvc2VuZFxuICAgICAgICAgICAgICogQGxpbmsgaHR0cHM6Ly93d3cuY291cmllci5jb20vZG9jcy9yZWZlcmVuY2Uvc2VuZC9tZXNzYWdlL1xuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIGJ1aWxkIHRoZSBDb3VyaWVyIEFQSSByZXF1ZXN0IGJvZHkgdG8gYmUgcGFzc2VkIGluLCBhbmQgcGVyZm9ybSBhIFBPU1QgdG8gaXQgd2l0aCB0aGUgYXBwcm9wcmlhdGUgaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAqIHdlIGltcGx5IHRoYXQgaWYgdGhlIEFQSSBkb2VzIG5vdCByZXNwb25kIGluIDE1IHNlY29uZHMsIHRoZW4gd2UgYXV0b21hdGljYWxseSBjYXRjaCB0aGF0LCBhbmQgcmV0dXJuIGFuXG4gICAgICAgICAgICAgKiBlcnJvciBmb3IgYSBiZXR0ZXIgY3VzdG9tZXIgZXhwZXJpZW5jZS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgY29uc3QgcmVxdWVzdERhdGEgPSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZToge1xuICAgICAgICAgICAgICAgICAgICB0bzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgZW1haWw6IHNlbmRFbWFpbE5vdGlmaWNhdGlvbklucHV0LmVtYWlsRGVzdGluYXRpb25cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IG5vdGlmaWNhdGlvblRlbXBsYXRlSWQsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bGxOYW1lOiBzZW5kRW1haWxOb3RpZmljYXRpb25JbnB1dC51c2VyRnVsbE5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi4oc2VuZEVtYWlsTm90aWZpY2F0aW9uSW5wdXQudHJhbnNhY3Rpb25zICE9PSB1bmRlZmluZWQgJiYgc2VuZEVtYWlsTm90aWZpY2F0aW9uSW5wdXQudHJhbnNhY3Rpb25zICE9PSBudWxsICYmIHNlbmRFbWFpbE5vdGlmaWNhdGlvbklucHV0LnRyYW5zYWN0aW9ucy5sZW5ndGggIT09IDAgJiYge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uczogc2VuZEVtYWlsTm90aWZpY2F0aW9uSW5wdXQudHJhbnNhY3Rpb25zIVxuICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi4oc2VuZEVtYWlsTm90aWZpY2F0aW9uSW5wdXQuZGFpbHlFYXJuaW5nc1N1bW1hcnlBbW91bnQgIT09IHVuZGVmaW5lZCAmJiBzZW5kRW1haWxOb3RpZmljYXRpb25JbnB1dC5kYWlseUVhcm5pbmdzU3VtbWFyeUFtb3VudCAhPT0gbnVsbCAmJiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGFpbHlFYXJuaW5nc1N1bW1hcnlBbW91bnQ6IHNlbmRFbWFpbE5vdGlmaWNhdGlvbklucHV0LmRhaWx5RWFybmluZ3NTdW1tYXJ5QW1vdW50IVxuICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc29sZS5sb2coYENvdXJpZXIgQVBJIHJlcXVlc3QgT2JqZWN0OiAke0pTT04uc3RyaW5naWZ5KHJlcXVlc3REYXRhKX1gKTtcblxuICAgICAgICAgICAgcmV0dXJuIGF4aW9zLnBvc3QoYCR7Y291cmllckJhc2VVUkx9L3NlbmRgLCByZXF1ZXN0RGF0YSwge1xuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiQXV0aG9yaXphdGlvblwiOiBgQmVhcmVyICR7bm90aWZpY2F0aW9uQXV0aFRva2VufWBcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDE1MDAwLCAvLyBpbiBtaWxsaXNlY29uZHMgaGVyZVxuICAgICAgICAgICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2U6ICdDb3VyaWVyIEFQSSB0aW1lZCBvdXQgYWZ0ZXIgMTUwMDBtcyEnXG4gICAgICAgICAgICB9KS50aGVuKHNlbmRFbWFpbFJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlbmRwb2ludEluZm99IHJlc3BvbnNlICR7SlNPTi5zdHJpbmdpZnkoc2VuZEVtYWlsUmVzcG9uc2UuZGF0YSl9YCk7XG5cbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiBpZiB3ZSByZWFjaGVkIHRoaXMsIHRoZW4gd2UgYXNzdW1lIHRoYXQgYSAyeHggcmVzcG9uc2UgY29kZSB3YXMgcmV0dXJuZWQuXG4gICAgICAgICAgICAgICAgICogY2hlY2sgdGhlIGNvbnRlbnRzIG9mIHRoZSByZXNwb25zZSwgYW5kIGFjdCBhcHByb3ByaWF0ZWx5LlxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGlmIChzZW5kRW1haWxSZXNwb25zZS5kYXRhICYmIHNlbmRFbWFpbFJlc3BvbnNlLmRhdGFbXCJyZXF1ZXN0SWRcIl0pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVlc3RJZDogc2VuZEVtYWlsUmVzcG9uc2UuZGF0YVtcInJlcXVlc3RJZFwiXVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogYEludmFsaWQgcmVzcG9uc2Ugc3RydWN0dXJlIHJldHVybmVkIGZyb20gJHtlbmRwb2ludEluZm99IHJlc3BvbnNlIWAsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yLnJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBhbmQgdGhlIHNlcnZlciByZXNwb25kZWQgd2l0aCBhIHN0YXR1cyBjb2RlXG4gICAgICAgICAgICAgICAgICAgICAqIHRoYXQgZmFsbHMgb3V0IG9mIHRoZSByYW5nZSBvZiAyeHguXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTm9uIDJ4eHggcmVzcG9uc2Ugd2hpbGUgY2FsbGluZyB0aGUgJHtlbmRwb2ludEluZm99IENvdXJpZXIgQVBJLCB3aXRoIHN0YXR1cyAke2Vycm9yLnJlc3BvbnNlLnN0YXR1c30sIGFuZCByZXNwb25zZSAke0pTT04uc3RyaW5naWZ5KGVycm9yLnJlc3BvbnNlLmRhdGEpfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gYW55IG90aGVyIHNwZWNpZmljIGVycm9ycyB0byBiZSBmaWx0ZXJlZCBiZWxvd1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5yZXF1ZXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGUgcmVxdWVzdCB3YXMgbWFkZSBidXQgbm8gcmVzcG9uc2Ugd2FzIHJlY2VpdmVkXG4gICAgICAgICAgICAgICAgICAgICAqIGBlcnJvci5yZXF1ZXN0YCBpcyBhbiBpbnN0YW5jZSBvZiBYTUxIdHRwUmVxdWVzdCBpbiB0aGUgYnJvd3NlciBhbmQgYW4gaW5zdGFuY2Ugb2ZcbiAgICAgICAgICAgICAgICAgICAgICogIGh0dHAuQ2xpZW50UmVxdWVzdCBpbiBub2RlLmpzLlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vIHJlc3BvbnNlIHJlY2VpdmVkIHdoaWxlIGNhbGxpbmcgdGhlICR7ZW5kcG9pbnRJbmZvfSBDb3VyaWVyIEFQSSwgZm9yIHJlcXVlc3QgJHtlcnJvci5yZXF1ZXN0fWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBOb3RpZmljYXRpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNvbWV0aGluZyBoYXBwZW5lZCBpbiBzZXR0aW5nIHVwIHRoZSByZXF1ZXN0IHRoYXQgdHJpZ2dlcmVkIGFuIEVycm9yXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHNldHRpbmcgdXAgdGhlIHJlcXVlc3QgZm9yIHRoZSAke2VuZHBvaW50SW5mb30gQ291cmllciBBUEksICR7KGVycm9yICYmIGVycm9yLm1lc3NhZ2UpICYmIGVycm9yLm1lc3NhZ2V9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgaW5pdGlhdGluZyB0aGUgZW1haWwgbm90aWZpY2F0aW9uIHNlbmRpbmcgdGhyb3VnaCAke2VuZHBvaW50SW5mb31gO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfSAke2Vycn1gKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE5vdGlmaWNhdGlvbnNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxufVxuIl19