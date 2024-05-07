"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.acknowledgePlaidUpdate = void 0;
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const client_sns_1 = require("@aws-sdk/client-sns");
/**
 * AcknowledgePlaidUpdates handler
 *
 * @param route request route, composed of HTTP Verb and HTTP Path
 * @param requestBody request body input, passed by the caller through the API Gateway event
 *
 * @returns {@link Promise} of {@link APIGatewayProxyResult}
 */
const acknowledgePlaidUpdate = async (route, requestBody) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        // first check whether we have a valid request body.
        if (requestBody !== undefined && requestBody !== null && requestBody.length !== 0) {
            // parse the incoming request body data as a JSON object
            const requestBodyParsed = JSON.parse(requestBody);
            // perform some validations based on what is expected in terms of the incoming data model and its mapping
            if (requestBodyParsed["environment"] !== undefined && requestBodyParsed["environment"] !== null &&
                requestBodyParsed["status"] !== undefined && requestBodyParsed["status"] !== null &&
                requestBodyParsed["webhook_code"] !== undefined && requestBodyParsed["webhook_code"] !== null &&
                requestBodyParsed["webhook_type"] !== undefined && requestBodyParsed["webhook_type"] !== null &&
                requestBodyParsed["link_session_id"] !== undefined && requestBodyParsed["link_session_id"] !== null &&
                requestBodyParsed["link_token"] !== undefined && requestBodyParsed["link_token"] !== null) {
                // depending on the type of Webhook update, convert the incoming data accordingly
                switch (requestBodyParsed["webhook_type"]) {
                    case moonbeam_models_1.PlaidWebhookType.Link:
                        // convert the incoming data to a PlaidWebhookLinkInput object
                        const plaidWebhookLinkInput = requestBodyParsed;
                        // make sure that this particular webhook type input, is valid
                        if (plaidWebhookLinkInput.status === moonbeam_models_1.PlaidWebhookStatus.Success && (plaidWebhookLinkInput.public_token === undefined || plaidWebhookLinkInput.public_token === null)) {
                            // invalid request object
                            const errorMessage = `Invalid request Plaid update input passed in for type ${plaidWebhookLinkInput.webhook_type}.`;
                            console.log(`${errorMessage} ${requestBody}`);
                            /**
                             * return the error accordingly
                             * Plaid will retry sending this message upon receiving of a non 2XX code
                             */
                            return {
                                statusCode: 400,
                                body: JSON.stringify({
                                    data: null,
                                    errorType: moonbeam_models_1.PlaidLinkingErrorType.ValidationError,
                                    errorMessage: errorMessage
                                })
                            };
                        }
                        /**
                         * at this point we know that the input object/data is valid, so we will just need to drop this as a message
                         * into the appropriate SNS topic.
                         *
                         * initializing the SNS Client
                         */
                        const snsClient = new client_sns_1.SNSClient({ region: region });
                        /**
                         * drop the transaction as a message to the Plaid Link processing topic
                         */
                        const plaidLinkReceipt = await snsClient.send(new client_sns_1.PublishCommand({
                            TopicArn: process.env.PLAID_LINK_PROCESSING_TOPIC_ARN,
                            Message: JSON.stringify(plaidWebhookLinkInput),
                            /**
                             * the message group id, will be represented by the Plaid link token, so that we can group transaction messages for a particular link token,
                             * associated to a Moonbeam user id, and sort them in the FIFO processing topic accordingly.
                             */
                            MessageGroupId: plaidWebhookLinkInput.link_token
                        }));
                        // ensure that the Plaid Link message was properly sent to the appropriate processing topic
                        if (plaidLinkReceipt && plaidLinkReceipt.MessageId && plaidLinkReceipt.MessageId.length !== 0 &&
                            plaidLinkReceipt.SequenceNumber && plaidLinkReceipt.SequenceNumber.length !== 0) {
                            /**
                             * the Plaid Link has been successfully dropped into the topic, and will be picked up by the Plaid Linking consumer
                             * and other services
                             */
                            console.log(`Plaid Link update successfully sent to topic for processing with receipt information: ${plaidLinkReceipt.MessageId} ${plaidLinkReceipt.SequenceNumber}`);
                            return {
                                statusCode: 202,
                                body: JSON.stringify({
                                    data: `Plaid Link Update acknowledged!`
                                })
                            };
                        }
                        else {
                            const errorMessage = `Unexpected error while sending the Plaid Link message further!`;
                            console.log(errorMessage);
                            /**
                             * if there are errors associated with sending the message to the topic.
                             * Plaid will retry sending this message upon receiving of a non 2XX code
                             */
                            return {
                                statusCode: 424,
                                body: JSON.stringify({
                                    data: null,
                                    errorType: moonbeam_models_1.TransactionsErrorType.Unprocessable,
                                    errorMessage: errorMessage
                                })
                            };
                        }
                    default:
                        const errorMessage = `Unsupported Webhook update type received ${requestBodyParsed["webhook_type"]}`;
                        console.log(errorMessage);
                        /**
                         * return the error accordingly
                         * Plaid will retry sending this message upon receiving of a non 2XX code
                         */
                        return {
                            statusCode: 400,
                            body: JSON.stringify({
                                data: null,
                                errorType: moonbeam_models_1.PlaidLinkingErrorType.ValidationError,
                                errorMessage: errorMessage
                            })
                        };
                }
            }
            else {
                // invalid request object
                const errorMessage = `Invalid request body passed in.`;
                console.log(`${errorMessage} ${requestBody}`);
                /**
                 * return the error accordingly
                 * Plaid will retry sending this message upon receiving of a non 2XX code
                 */
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        data: null,
                        errorType: moonbeam_models_1.PlaidLinkingErrorType.ValidationError,
                        errorMessage: errorMessage
                    })
                };
            }
        }
        else {
            // if the request body is null, return a validation error accordingly
            const errorMessage = `Invalid request body passed in.`;
            console.log(`${errorMessage} ${requestBody}`);
            /**
             * return the error accordingly
             * Plaid will retry sending this message upon receiving of a non 2XX code
             */
            return {
                statusCode: 400,
                body: JSON.stringify({
                    data: null,
                    errorType: moonbeam_models_1.PlaidLinkingErrorType.ValidationError,
                    errorMessage: errorMessage
                })
            };
        }
    }
    catch (error) {
        const errorMessage = `Unexpected error while processing ${route} request`;
        console.log(`${errorMessage} ${error}`);
        /**
         * return the error accordingly
         * Plaid will retry sending this message upon receiving of a non 2XX code
         */
        return {
            statusCode: 500,
            body: JSON.stringify({
                data: null,
                errorType: moonbeam_models_1.PlaidLinkingErrorType.UnexpectedError,
                errorMessage: errorMessage
            })
        };
    }
};
exports.acknowledgePlaidUpdate = acknowledgePlaidUpdate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNrbm93bGVkZ2VQbGFpZFVwZGF0ZXNIYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9oYW5kbGVycy9BY2tub3dsZWRnZVBsYWlkVXBkYXRlc0hhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsK0RBS21DO0FBQ25DLG9EQUE4RDtBQUU5RDs7Ozs7OztHQU9HO0FBQ0ksTUFBTSxzQkFBc0IsR0FBRyxLQUFLLEVBQUUsS0FBYSxFQUFFLFdBQTBCLEVBQWtDLEVBQUU7SUFDdEgsSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2QyxvREFBb0Q7UUFDcEQsSUFBSSxXQUFXLEtBQUssU0FBUyxJQUFJLFdBQVcsS0FBSyxJQUFJLElBQUksV0FBVyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDL0Usd0RBQXdEO1lBQ3hELE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUVsRCx5R0FBeUc7WUFDekcsSUFBSSxpQkFBaUIsQ0FBQyxhQUFhLENBQUMsS0FBSyxTQUFTLElBQUksaUJBQWlCLENBQUMsYUFBYSxDQUFDLEtBQUssSUFBSTtnQkFDM0YsaUJBQWlCLENBQUMsUUFBUSxDQUFDLEtBQUssU0FBUyxJQUFJLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxLQUFLLElBQUk7Z0JBQ2pGLGlCQUFpQixDQUFDLGNBQWMsQ0FBQyxLQUFLLFNBQVMsSUFBSSxpQkFBaUIsQ0FBQyxjQUFjLENBQUMsS0FBSyxJQUFJO2dCQUM3RixpQkFBaUIsQ0FBQyxjQUFjLENBQUMsS0FBSyxTQUFTLElBQUksaUJBQWlCLENBQUMsY0FBYyxDQUFDLEtBQUssSUFBSTtnQkFDN0YsaUJBQWlCLENBQUMsaUJBQWlCLENBQUMsS0FBSyxTQUFTLElBQUksaUJBQWlCLENBQUMsaUJBQWlCLENBQUMsS0FBSyxJQUFJO2dCQUNuRyxpQkFBaUIsQ0FBQyxZQUFZLENBQUMsS0FBSyxTQUFTLElBQUksaUJBQWlCLENBQUMsWUFBWSxDQUFDLEtBQUssSUFBSSxFQUFFO2dCQUMzRixpRkFBaUY7Z0JBQ2pGLFFBQVEsaUJBQWlCLENBQUMsY0FBYyxDQUFxQixFQUFFO29CQUMzRCxLQUFLLGtDQUFnQixDQUFDLElBQUk7d0JBQ3RCLDhEQUE4RDt3QkFDOUQsTUFBTSxxQkFBcUIsR0FBMEIsaUJBQTBDLENBQUM7d0JBRWhHLDhEQUE4RDt3QkFDOUQsSUFBSSxxQkFBcUIsQ0FBQyxNQUFNLEtBQUssb0NBQWtCLENBQUMsT0FBTyxJQUFJLENBQUMscUJBQXFCLENBQUMsWUFBWSxLQUFLLFNBQVMsSUFBSSxxQkFBcUIsQ0FBQyxZQUFZLEtBQUssSUFBSSxDQUFDLEVBQUU7NEJBQ2xLLHlCQUF5Qjs0QkFDekIsTUFBTSxZQUFZLEdBQUcseURBQXlELHFCQUFxQixDQUFDLFlBQVksR0FBRyxDQUFDOzRCQUNwSCxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsWUFBWSxJQUFJLFdBQVcsRUFBRSxDQUFDLENBQUM7NEJBRTlDOzs7K0JBR0c7NEJBQ0gsT0FBTztnQ0FDSCxVQUFVLEVBQUUsR0FBRztnQ0FDZixJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQztvQ0FDakIsSUFBSSxFQUFFLElBQUk7b0NBQ1YsU0FBUyxFQUFFLHVDQUFxQixDQUFDLGVBQWU7b0NBQ2hELFlBQVksRUFBRSxZQUFZO2lDQUM3QixDQUFDOzZCQUNMLENBQUE7eUJBQ0o7d0JBRUQ7Ozs7OzJCQUtHO3dCQUNILE1BQU0sU0FBUyxHQUFHLElBQUksc0JBQVMsQ0FBQyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO3dCQUVsRDs7MkJBRUc7d0JBQ0gsTUFBTSxnQkFBZ0IsR0FBRyxNQUFNLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSwyQkFBYyxDQUFDOzRCQUM3RCxRQUFRLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQywrQkFBZ0M7NEJBQ3RELE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLHFCQUFxQixDQUFDOzRCQUM5Qzs7OytCQUdHOzRCQUNILGNBQWMsRUFBRSxxQkFBcUIsQ0FBQyxVQUFVO3lCQUNuRCxDQUFDLENBQUMsQ0FBQzt3QkFFSiwyRkFBMkY7d0JBQzNGLElBQUksZ0JBQWdCLElBQUksZ0JBQWdCLENBQUMsU0FBUyxJQUFJLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxNQUFNLEtBQUssQ0FBQzs0QkFDekYsZ0JBQWdCLENBQUMsY0FBYyxJQUFJLGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFOzRCQUNqRjs7OytCQUdHOzRCQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMseUZBQXlGLGdCQUFnQixDQUFDLFNBQVMsSUFBSSxnQkFBZ0IsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDOzRCQUV0SyxPQUFPO2dDQUNILFVBQVUsRUFBRSxHQUFHO2dDQUNmLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO29DQUNqQixJQUFJLEVBQUUsaUNBQWlDO2lDQUMxQyxDQUFDOzZCQUNMLENBQUE7eUJBQ0o7NkJBQU07NEJBQ0gsTUFBTSxZQUFZLEdBQUcsZ0VBQWdFLENBQUM7NEJBQ3RGLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7NEJBRTFCOzs7K0JBR0c7NEJBQ0gsT0FBTztnQ0FDSCxVQUFVLEVBQUUsR0FBRztnQ0FDZixJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQztvQ0FDakIsSUFBSSxFQUFFLElBQUk7b0NBQ1YsU0FBUyxFQUFFLHVDQUFxQixDQUFDLGFBQWE7b0NBQzlDLFlBQVksRUFBRSxZQUFZO2lDQUM3QixDQUFDOzZCQUNMLENBQUE7eUJBQ0o7b0JBQ0w7d0JBQ0ksTUFBTSxZQUFZLEdBQUcsNENBQTRDLGlCQUFpQixDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUM7d0JBQ3JHLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7d0JBRTFCOzs7MkJBR0c7d0JBQ0gsT0FBTzs0QkFDSCxVQUFVLEVBQUUsR0FBRzs0QkFDZixJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQztnQ0FDakIsSUFBSSxFQUFFLElBQUk7Z0NBQ1YsU0FBUyxFQUFFLHVDQUFxQixDQUFDLGVBQWU7Z0NBQ2hELFlBQVksRUFBRSxZQUFZOzZCQUM3QixDQUFDO3lCQUNMLENBQUE7aUJBQ1I7YUFDSjtpQkFBTTtnQkFDSCx5QkFBeUI7Z0JBQ3pCLE1BQU0sWUFBWSxHQUFHLGlDQUFpQyxDQUFDO2dCQUN2RCxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsWUFBWSxJQUFJLFdBQVcsRUFBRSxDQUFDLENBQUM7Z0JBRTlDOzs7bUJBR0c7Z0JBQ0gsT0FBTztvQkFDSCxVQUFVLEVBQUUsR0FBRztvQkFDZixJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQzt3QkFDakIsSUFBSSxFQUFFLElBQUk7d0JBQ1YsU0FBUyxFQUFFLHVDQUFxQixDQUFDLGVBQWU7d0JBQ2hELFlBQVksRUFBRSxZQUFZO3FCQUM3QixDQUFDO2lCQUNMLENBQUE7YUFDSjtTQUNKO2FBQU07WUFDSCxxRUFBcUU7WUFDckUsTUFBTSxZQUFZLEdBQUcsaUNBQWlDLENBQUM7WUFDdkQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFlBQVksSUFBSSxXQUFXLEVBQUUsQ0FBQyxDQUFDO1lBRTlDOzs7ZUFHRztZQUNILE9BQU87Z0JBQ0gsVUFBVSxFQUFFLEdBQUc7Z0JBQ2YsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUM7b0JBQ2pCLElBQUksRUFBRSxJQUFJO29CQUNWLFNBQVMsRUFBRSx1Q0FBcUIsQ0FBQyxlQUFlO29CQUNoRCxZQUFZLEVBQUUsWUFBWTtpQkFDN0IsQ0FBQzthQUNMLENBQUE7U0FDSjtLQUNKO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDWixNQUFNLFlBQVksR0FBRyxxQ0FBcUMsS0FBSyxVQUFVLENBQUM7UUFDMUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFlBQVksSUFBSSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBRXhDOzs7V0FHRztRQUNILE9BQU87WUFDSCxVQUFVLEVBQUUsR0FBRztZQUNmLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO2dCQUNqQixJQUFJLEVBQUUsSUFBSTtnQkFDVixTQUFTLEVBQUUsdUNBQXFCLENBQUMsZUFBZTtnQkFDaEQsWUFBWSxFQUFFLFlBQVk7YUFDN0IsQ0FBQztTQUNMLENBQUE7S0FDSjtBQUNMLENBQUMsQ0FBQTtBQXRLWSxRQUFBLHNCQUFzQiwwQkFzS2xDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtBUElHYXRld2F5UHJveHlSZXN1bHR9IGZyb20gXCJhd3MtbGFtYmRhL3RyaWdnZXIvYXBpLWdhdGV3YXktcHJveHlcIjtcbmltcG9ydCB7XG4gICAgUGxhaWRMaW5raW5nRXJyb3JUeXBlLFxuICAgIFBsYWlkV2ViaG9va0xpbmtJbnB1dCxcbiAgICBQbGFpZFdlYmhvb2tTdGF0dXMsXG4gICAgUGxhaWRXZWJob29rVHlwZSwgVHJhbnNhY3Rpb25zRXJyb3JUeXBlXG59IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5pbXBvcnQge1B1Ymxpc2hDb21tYW5kLCBTTlNDbGllbnR9IGZyb20gXCJAYXdzLXNkay9jbGllbnQtc25zXCI7XG5cbi8qKlxuICogQWNrbm93bGVkZ2VQbGFpZFVwZGF0ZXMgaGFuZGxlclxuICpcbiAqIEBwYXJhbSByb3V0ZSByZXF1ZXN0IHJvdXRlLCBjb21wb3NlZCBvZiBIVFRQIFZlcmIgYW5kIEhUVFAgUGF0aFxuICogQHBhcmFtIHJlcXVlc3RCb2R5IHJlcXVlc3QgYm9keSBpbnB1dCwgcGFzc2VkIGJ5IHRoZSBjYWxsZXIgdGhyb3VnaCB0aGUgQVBJIEdhdGV3YXkgZXZlbnRcbiAqXG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIEFQSUdhdGV3YXlQcm94eVJlc3VsdH1cbiAqL1xuZXhwb3J0IGNvbnN0IGFja25vd2xlZGdlUGxhaWRVcGRhdGUgPSBhc3luYyAocm91dGU6IHN0cmluZywgcmVxdWVzdEJvZHk6IHN0cmluZyB8IG51bGwpOiBQcm9taXNlPEFQSUdhdGV3YXlQcm94eVJlc3VsdD4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgIC8vIGZpcnN0IGNoZWNrIHdoZXRoZXIgd2UgaGF2ZSBhIHZhbGlkIHJlcXVlc3QgYm9keS5cbiAgICAgICAgaWYgKHJlcXVlc3RCb2R5ICE9PSB1bmRlZmluZWQgJiYgcmVxdWVzdEJvZHkgIT09IG51bGwgJiYgcmVxdWVzdEJvZHkubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAvLyBwYXJzZSB0aGUgaW5jb21pbmcgcmVxdWVzdCBib2R5IGRhdGEgYXMgYSBKU09OIG9iamVjdFxuICAgICAgICAgICAgY29uc3QgcmVxdWVzdEJvZHlQYXJzZWQgPSBKU09OLnBhcnNlKHJlcXVlc3RCb2R5KTtcblxuICAgICAgICAgICAgLy8gcGVyZm9ybSBzb21lIHZhbGlkYXRpb25zIGJhc2VkIG9uIHdoYXQgaXMgZXhwZWN0ZWQgaW4gdGVybXMgb2YgdGhlIGluY29taW5nIGRhdGEgbW9kZWwgYW5kIGl0cyBtYXBwaW5nXG4gICAgICAgICAgICBpZiAocmVxdWVzdEJvZHlQYXJzZWRbXCJlbnZpcm9ubWVudFwiXSAhPT0gdW5kZWZpbmVkICYmIHJlcXVlc3RCb2R5UGFyc2VkW1wiZW52aXJvbm1lbnRcIl0gIT09IG51bGwgJiZcbiAgICAgICAgICAgICAgICByZXF1ZXN0Qm9keVBhcnNlZFtcInN0YXR1c1wiXSAhPT0gdW5kZWZpbmVkICYmIHJlcXVlc3RCb2R5UGFyc2VkW1wic3RhdHVzXCJdICE9PSBudWxsICYmXG4gICAgICAgICAgICAgICAgcmVxdWVzdEJvZHlQYXJzZWRbXCJ3ZWJob29rX2NvZGVcIl0gIT09IHVuZGVmaW5lZCAmJiByZXF1ZXN0Qm9keVBhcnNlZFtcIndlYmhvb2tfY29kZVwiXSAhPT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgIHJlcXVlc3RCb2R5UGFyc2VkW1wid2ViaG9va190eXBlXCJdICE9PSB1bmRlZmluZWQgJiYgcmVxdWVzdEJvZHlQYXJzZWRbXCJ3ZWJob29rX3R5cGVcIl0gIT09IG51bGwgJiZcbiAgICAgICAgICAgICAgICByZXF1ZXN0Qm9keVBhcnNlZFtcImxpbmtfc2Vzc2lvbl9pZFwiXSAhPT0gdW5kZWZpbmVkICYmIHJlcXVlc3RCb2R5UGFyc2VkW1wibGlua19zZXNzaW9uX2lkXCJdICE9PSBudWxsICYmXG4gICAgICAgICAgICAgICAgcmVxdWVzdEJvZHlQYXJzZWRbXCJsaW5rX3Rva2VuXCJdICE9PSB1bmRlZmluZWQgJiYgcmVxdWVzdEJvZHlQYXJzZWRbXCJsaW5rX3Rva2VuXCJdICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgLy8gZGVwZW5kaW5nIG9uIHRoZSB0eXBlIG9mIFdlYmhvb2sgdXBkYXRlLCBjb252ZXJ0IHRoZSBpbmNvbWluZyBkYXRhIGFjY29yZGluZ2x5XG4gICAgICAgICAgICAgICAgc3dpdGNoIChyZXF1ZXN0Qm9keVBhcnNlZFtcIndlYmhvb2tfdHlwZVwiXSBhcyBQbGFpZFdlYmhvb2tUeXBlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgUGxhaWRXZWJob29rVHlwZS5MaW5rOlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29udmVydCB0aGUgaW5jb21pbmcgZGF0YSB0byBhIFBsYWlkV2ViaG9va0xpbmtJbnB1dCBvYmplY3RcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBsYWlkV2ViaG9va0xpbmtJbnB1dDogUGxhaWRXZWJob29rTGlua0lucHV0ID0gcmVxdWVzdEJvZHlQYXJzZWQgYXMgUGxhaWRXZWJob29rTGlua0lucHV0O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBtYWtlIHN1cmUgdGhhdCB0aGlzIHBhcnRpY3VsYXIgd2ViaG9vayB0eXBlIGlucHV0LCBpcyB2YWxpZFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBsYWlkV2ViaG9va0xpbmtJbnB1dC5zdGF0dXMgPT09IFBsYWlkV2ViaG9va1N0YXR1cy5TdWNjZXNzICYmIChwbGFpZFdlYmhvb2tMaW5rSW5wdXQucHVibGljX3Rva2VuID09PSB1bmRlZmluZWQgfHwgcGxhaWRXZWJob29rTGlua0lucHV0LnB1YmxpY190b2tlbiA9PT0gbnVsbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpbnZhbGlkIHJlcXVlc3Qgb2JqZWN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYEludmFsaWQgcmVxdWVzdCBQbGFpZCB1cGRhdGUgaW5wdXQgcGFzc2VkIGluIGZvciB0eXBlICR7cGxhaWRXZWJob29rTGlua0lucHV0LndlYmhvb2tfdHlwZX0uYDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9ICR7cmVxdWVzdEJvZHl9YCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiByZXR1cm4gdGhlIGVycm9yIGFjY29yZGluZ2x5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICogUGxhaWQgd2lsbCByZXRyeSBzZW5kaW5nIHRoaXMgbWVzc2FnZSB1cG9uIHJlY2VpdmluZyBvZiBhIG5vbiAyWFggY29kZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1c0NvZGU6IDQwMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogUGxhaWRMaW5raW5nRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIGF0IHRoaXMgcG9pbnQgd2Uga25vdyB0aGF0IHRoZSBpbnB1dCBvYmplY3QvZGF0YSBpcyB2YWxpZCwgc28gd2Ugd2lsbCBqdXN0IG5lZWQgdG8gZHJvcCB0aGlzIGFzIGEgbWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgICogaW50byB0aGUgYXBwcm9wcmlhdGUgU05TIHRvcGljLlxuICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIGluaXRpYWxpemluZyB0aGUgU05TIENsaWVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzbnNDbGllbnQgPSBuZXcgU05TQ2xpZW50KHtyZWdpb246IHJlZ2lvbn0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIGRyb3AgdGhlIHRyYW5zYWN0aW9uIGFzIGEgbWVzc2FnZSB0byB0aGUgUGxhaWQgTGluayBwcm9jZXNzaW5nIHRvcGljXG4gICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBsYWlkTGlua1JlY2VpcHQgPSBhd2FpdCBzbnNDbGllbnQuc2VuZChuZXcgUHVibGlzaENvbW1hbmQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRvcGljQXJuOiBwcm9jZXNzLmVudi5QTEFJRF9MSU5LX1BST0NFU1NJTkdfVE9QSUNfQVJOISxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNZXNzYWdlOiBKU09OLnN0cmluZ2lmeShwbGFpZFdlYmhvb2tMaW5rSW5wdXQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIHRoZSBtZXNzYWdlIGdyb3VwIGlkLCB3aWxsIGJlIHJlcHJlc2VudGVkIGJ5IHRoZSBQbGFpZCBsaW5rIHRva2VuLCBzbyB0aGF0IHdlIGNhbiBncm91cCB0cmFuc2FjdGlvbiBtZXNzYWdlcyBmb3IgYSBwYXJ0aWN1bGFyIGxpbmsgdG9rZW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICogYXNzb2NpYXRlZCB0byBhIE1vb25iZWFtIHVzZXIgaWQsIGFuZCBzb3J0IHRoZW0gaW4gdGhlIEZJRk8gcHJvY2Vzc2luZyB0b3BpYyBhY2NvcmRpbmdseS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNZXNzYWdlR3JvdXBJZDogcGxhaWRXZWJob29rTGlua0lucHV0LmxpbmtfdG9rZW5cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZW5zdXJlIHRoYXQgdGhlIFBsYWlkIExpbmsgbWVzc2FnZSB3YXMgcHJvcGVybHkgc2VudCB0byB0aGUgYXBwcm9wcmlhdGUgcHJvY2Vzc2luZyB0b3BpY1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBsYWlkTGlua1JlY2VpcHQgJiYgcGxhaWRMaW5rUmVjZWlwdC5NZXNzYWdlSWQgJiYgcGxhaWRMaW5rUmVjZWlwdC5NZXNzYWdlSWQubGVuZ3RoICE9PSAwICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxhaWRMaW5rUmVjZWlwdC5TZXF1ZW5jZU51bWJlciAmJiBwbGFpZExpbmtSZWNlaXB0LlNlcXVlbmNlTnVtYmVyLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIHRoZSBQbGFpZCBMaW5rIGhhcyBiZWVuIHN1Y2Nlc3NmdWxseSBkcm9wcGVkIGludG8gdGhlIHRvcGljLCBhbmQgd2lsbCBiZSBwaWNrZWQgdXAgYnkgdGhlIFBsYWlkIExpbmtpbmcgY29uc3VtZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiBhbmQgb3RoZXIgc2VydmljZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgUGxhaWQgTGluayB1cGRhdGUgc3VjY2Vzc2Z1bGx5IHNlbnQgdG8gdG9waWMgZm9yIHByb2Nlc3Npbmcgd2l0aCByZWNlaXB0IGluZm9ybWF0aW9uOiAke3BsYWlkTGlua1JlY2VpcHQuTWVzc2FnZUlkfSAke3BsYWlkTGlua1JlY2VpcHQuU2VxdWVuY2VOdW1iZXJ9YCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXNDb2RlOiAyMDIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGBQbGFpZCBMaW5rIFVwZGF0ZSBhY2tub3dsZWRnZWQhYFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgc2VuZGluZyB0aGUgUGxhaWQgTGluayBtZXNzYWdlIGZ1cnRoZXIhYDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICogaWYgdGhlcmUgYXJlIGVycm9ycyBhc3NvY2lhdGVkIHdpdGggc2VuZGluZyB0aGUgbWVzc2FnZSB0byB0aGUgdG9waWMuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICogUGxhaWQgd2lsbCByZXRyeSBzZW5kaW5nIHRoaXMgbWVzc2FnZSB1cG9uIHJlY2VpdmluZyBvZiBhIG5vbiAyWFggY29kZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1c0NvZGU6IDQyNCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlVucHJvY2Vzc2FibGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbnN1cHBvcnRlZCBXZWJob29rIHVwZGF0ZSB0eXBlIHJlY2VpdmVkICR7cmVxdWVzdEJvZHlQYXJzZWRbXCJ3ZWJob29rX3R5cGVcIl19YDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogcmV0dXJuIHRoZSBlcnJvciBhY2NvcmRpbmdseVxuICAgICAgICAgICAgICAgICAgICAgICAgICogUGxhaWQgd2lsbCByZXRyeSBzZW5kaW5nIHRoaXMgbWVzc2FnZSB1cG9uIHJlY2VpdmluZyBvZiBhIG5vbiAyWFggY29kZVxuICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1c0NvZGU6IDQwMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogUGxhaWRMaW5raW5nRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gaW52YWxpZCByZXF1ZXN0IG9iamVjdFxuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBJbnZhbGlkIHJlcXVlc3QgYm9keSBwYXNzZWQgaW4uYDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9ICR7cmVxdWVzdEJvZHl9YCk7XG5cbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiByZXR1cm4gdGhlIGVycm9yIGFjY29yZGluZ2x5XG4gICAgICAgICAgICAgICAgICogUGxhaWQgd2lsbCByZXRyeSBzZW5kaW5nIHRoaXMgbWVzc2FnZSB1cG9uIHJlY2VpdmluZyBvZiBhIG5vbiAyWFggY29kZVxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1c0NvZGU6IDQwMCxcbiAgICAgICAgICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogUGxhaWRMaW5raW5nRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gaWYgdGhlIHJlcXVlc3QgYm9keSBpcyBudWxsLCByZXR1cm4gYSB2YWxpZGF0aW9uIGVycm9yIGFjY29yZGluZ2x5XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgSW52YWxpZCByZXF1ZXN0IGJvZHkgcGFzc2VkIGluLmA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9ICR7cmVxdWVzdEJvZHl9YCk7XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogcmV0dXJuIHRoZSBlcnJvciBhY2NvcmRpbmdseVxuICAgICAgICAgICAgICogUGxhaWQgd2lsbCByZXRyeSBzZW5kaW5nIHRoaXMgbWVzc2FnZSB1cG9uIHJlY2VpdmluZyBvZiBhIG5vbiAyWFggY29kZVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHN0YXR1c0NvZGU6IDQwMCxcbiAgICAgICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogUGxhaWRMaW5raW5nRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvcixcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgcHJvY2Vzc2luZyAke3JvdXRlfSByZXF1ZXN0YDtcbiAgICAgICAgY29uc29sZS5sb2coYCR7ZXJyb3JNZXNzYWdlfSAke2Vycm9yfWApO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiByZXR1cm4gdGhlIGVycm9yIGFjY29yZGluZ2x5XG4gICAgICAgICAqIFBsYWlkIHdpbGwgcmV0cnkgc2VuZGluZyB0aGlzIG1lc3NhZ2UgdXBvbiByZWNlaXZpbmcgb2YgYSBub24gMlhYIGNvZGVcbiAgICAgICAgICovXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdGF0dXNDb2RlOiA1MDAsXG4gICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFBsYWlkTGlua2luZ0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3IsXG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=