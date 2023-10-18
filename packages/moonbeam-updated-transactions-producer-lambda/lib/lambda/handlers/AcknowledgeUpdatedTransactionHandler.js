"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.acknowledgeUpdatedTransaction = void 0;
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const client_sns_1 = require("@aws-sdk/client-sns");
/**
 * AcknowledgeUpdatedTransaction handler
 *
 * @param route request route, composed of HTTP Verb and HTTP Path
 * @param requestBody request body input, passed by the caller through the API Gateway event
 *
 * @returns {@link Promise} of {@link APIGatewayProxyResult}
 */
const acknowledgeUpdatedTransaction = async (route, requestBody) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        // first check whether we have a valid request body.
        if (requestBody !== undefined && requestBody !== null && requestBody.length !== 0) {
            // parse the incoming request body data as a JSON object
            const requestBodyParsed = JSON.parse(requestBody);
            const requestData = requestBodyParsed["data"] ? requestBodyParsed["data"] : null;
            // perform some validations based on what is expected in terms of the incoming data model and its mapping
            if (requestBodyParsed["id"] !== undefined && requestBodyParsed["id"] !== null &&
                requestBodyParsed["subscriptionId"] !== undefined && requestBodyParsed["subscriptionId"] !== null &&
                requestBodyParsed["timestamp"] !== undefined && requestBodyParsed["timestamp"] !== null &&
                requestBodyParsed["callbackUrl"] !== undefined && requestBodyParsed["callbackUrl"] !== null &&
                requestBodyParsed["topic"] !== undefined && requestBodyParsed["topic"] !== null &&
                requestBodyParsed["data"] !== undefined && requestBodyParsed["data"] !== null &&
                requestData !== undefined && requestData !== null &&
                requestData["webhookEventType"] !== undefined && requestData["webhookEventType"] !== null &&
                requestData["transactionId"] !== undefined && requestData["transactionId"] !== null &&
                requestData["cardId"] !== undefined && requestData["cardId"] !== null &&
                requestData["memberId"] !== undefined && requestData["memberId"] !== null &&
                requestData["offerId"] !== undefined && requestData["offerId"] !== null &&
                requestData["amount"] !== undefined && requestData["amount"] !== null &&
                requestData["status"] !== undefined && requestData["status"] !== null &&
                requestData["previousStatus"] !== undefined && requestData["previousStatus"] !== null &&
                requestData["distributedToMemberAmount"] !== undefined && requestData["distributedToMemberAmount"] !== null) {
                // initializing the SNS Client
                const snsClient = new client_sns_1.SNSClient({ region: region });
                /**
                 * drop the updated transaction as a message to the updated transactions processing topic
                 */
                const updatedTransactionReceipt = await snsClient.send(new client_sns_1.PublishCommand({
                    TopicArn: process.env.UPDATED_TRANSACTIONS_PROCESSING_TOPIC_ARN,
                    Message: requestBody,
                    /**
                     * the message group id, will be represented by the Olive member id, so that we can group update transaction messages for a particular member id,
                     * associated to a Moonbeam user id, and sort them in the FIFO processing topic accordingly.
                     */
                    MessageGroupId: requestData["memberId"]
                }));
                // ensure that the updated transaction message was properly sent to the appropriate processing topic
                if (updatedTransactionReceipt && updatedTransactionReceipt.MessageId && updatedTransactionReceipt.MessageId.length !== 0 &&
                    updatedTransactionReceipt.SequenceNumber && updatedTransactionReceipt.SequenceNumber.length !== 0) {
                    /**
                     * the updated transaction has been successfully dropped into the topic, and will be picked up by the updated transactions consumer and other
                     * services, like the notifications service consumer.
                     */
                    console.log(`Updated Transaction event successfully sent to topic for processing with receipt information: ${updatedTransactionReceipt.MessageId} ${updatedTransactionReceipt.SequenceNumber}`);
                    return {
                        statusCode: 202,
                        body: JSON.stringify({
                            data: `Updated transaction acknowledged!`
                        })
                    };
                }
                else {
                    const errorMessage = `Unexpected error while sending the updated transaction message further!`;
                    console.log(errorMessage);
                    /**
                     * if there are errors associated with sending the message to the topic.
                     * Olive will retry sending this message upon receiving of a non 2XX code
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
            }
            else {
                // invalid request object
                const errorMessage = `Invalid request body passed in.`;
                console.log(`${errorMessage} ${requestBody}`);
                /**
                 * return the error accordingly
                 * Olive will retry sending this message upon receiving of a non 2XX code
                 */
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        data: null,
                        errorType: moonbeam_models_1.TransactionsErrorType.ValidationError,
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
             * Olive will retry sending this message upon receiving of a non 2XX code
             */
            return {
                statusCode: 400,
                body: JSON.stringify({
                    data: null,
                    errorType: moonbeam_models_1.TransactionsErrorType.ValidationError,
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
         * Olive will retry sending this message upon receiving of a non 2XX code
         */
        return {
            statusCode: 500,
            body: JSON.stringify({
                data: null,
                errorType: moonbeam_models_1.TransactionsErrorType.UnexpectedError,
                errorMessage: errorMessage
            })
        };
    }
};
exports.acknowledgeUpdatedTransaction = acknowledgeUpdatedTransaction;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNrbm93bGVkZ2VVcGRhdGVkVHJhbnNhY3Rpb25IYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9oYW5kbGVycy9BY2tub3dsZWRnZVVwZGF0ZWRUcmFuc2FjdGlvbkhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsK0RBQWdFO0FBQ2hFLG9EQUE4RDtBQUU5RDs7Ozs7OztHQU9HO0FBQ0ksTUFBTSw2QkFBNkIsR0FBRyxLQUFLLEVBQUUsS0FBYSxFQUFFLFdBQTBCLEVBQWtDLEVBQUU7SUFDN0gsSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2QyxvREFBb0Q7UUFDcEQsSUFBSSxXQUFXLEtBQUssU0FBUyxJQUFJLFdBQVcsS0FBSyxJQUFJLElBQUksV0FBVyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDL0Usd0RBQXdEO1lBQ3hELE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNsRCxNQUFNLFdBQVcsR0FBRyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUVqRix5R0FBeUc7WUFDekcsSUFBSSxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxTQUFTLElBQUksaUJBQWlCLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSTtnQkFDekUsaUJBQWlCLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxTQUFTLElBQUksaUJBQWlCLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxJQUFJO2dCQUNqRyxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsS0FBSyxTQUFTLElBQUksaUJBQWlCLENBQUMsV0FBVyxDQUFDLEtBQUssSUFBSTtnQkFDdkYsaUJBQWlCLENBQUMs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QixJQUFJLEVBQUUsSUFBSTtnQkFDVixTQUFTLEVBQUUsdUNBQXFCLENBQUMsZUFBZTtnQkFDaEQsWUFBWSxFQUFFLFlBQVk7YUFDN0IsQ0FBQztTQUNMLENBQUE7S0FDSjtBQUNMLENBQUMsQ0FBQTtBQWxJWSxRQUFBLDZCQUE2QixpQ0FrSXpDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtBUElHYXRld2F5UHJveHlSZXN1bHR9IGZyb20gXCJhd3MtbGFtYmRhL3RyaWdnZXIvYXBpLWdhdGV3YXktcHJveHlcIjtcbmltcG9ydCB7VHJhbnNhY3Rpb25zRXJyb3JUeXBlfSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuaW1wb3J0IHtQdWJsaXNoQ29tbWFuZCwgU05TQ2xpZW50fSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LXNuc1wiO1xuXG4vKipcbiAqIEFja25vd2xlZGdlVXBkYXRlZFRyYW5zYWN0aW9uIGhhbmRsZXJcbiAqXG4gKiBAcGFyYW0gcm91dGUgcmVxdWVzdCByb3V0ZSwgY29tcG9zZWQgb2YgSFRUUCBWZXJiIGFuZCBIVFRQIFBhdGhcbiAqIEBwYXJhbSByZXF1ZXN0Qm9keSByZXF1ZXN0IGJvZHkgaW5wdXQsIHBhc3NlZCBieSB0aGUgY2FsbGVyIHRocm91Z2ggdGhlIEFQSSBHYXRld2F5IGV2ZW50XG4gKlxuICogQHJldHVybnMge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBBUElHYXRld2F5UHJveHlSZXN1bHR9XG4gKi9cbmV4cG9ydCBjb25zdCBhY2tub3dsZWRnZVVwZGF0ZWRUcmFuc2FjdGlvbiA9IGFzeW5jIChyb3V0ZTogc3RyaW5nLCByZXF1ZXN0Qm9keTogc3RyaW5nIHwgbnVsbCk6IFByb21pc2U8QVBJR2F0ZXdheVByb3h5UmVzdWx0PiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gcmV0cmlldmluZyB0aGUgY3VycmVudCBmdW5jdGlvbiByZWdpb25cbiAgICAgICAgY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiE7XG5cbiAgICAgICAgLy8gZmlyc3QgY2hlY2sgd2hldGhlciB3ZSBoYXZlIGEgdmFsaWQgcmVxdWVzdCBib2R5LlxuICAgICAgICBpZiAocmVxdWVzdEJvZHkgIT09IHVuZGVmaW5lZCAmJiByZXF1ZXN0Qm9keSAhPT0gbnVsbCAmJiByZXF1ZXN0Qm9keS5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgIC8vIHBhcnNlIHRoZSBpbmNvbWluZyByZXF1ZXN0IGJvZHkgZGF0YSBhcyBhIEpTT04gb2JqZWN0XG4gICAgICAgICAgICBjb25zdCByZXF1ZXN0Qm9keVBhcnNlZCA9IEpTT04ucGFyc2UocmVxdWVzdEJvZHkpO1xuICAgICAgICAgICAgY29uc3QgcmVxdWVzdERhdGEgPSByZXF1ZXN0Qm9keVBhcnNlZFtcImRhdGFcIl0gPyByZXF1ZXN0Qm9keVBhcnNlZFtcImRhdGFcIl0gOiBudWxsO1xuXG4gICAgICAgICAgICAvLyBwZXJmb3JtIHNvbWUgdmFsaWRhdGlvbnMgYmFzZWQgb24gd2hhdCBpcyBleHBlY3RlZCBpbiB0ZXJtcyBvZiB0aGUgaW5jb21pbmcgZGF0YSBtb2RlbCBhbmQgaXRzIG1hcHBpbmdcbiAgICAgICAgICAgIGlmIChyZXF1ZXN0Qm9keVBhcnNlZFtcImlkXCJdICE9PSB1bmRlZmluZWQgJiYgcmVxdWVzdEJvZHlQYXJzZWRbXCJpZFwiXSAhPT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgIHJlcXVlc3RCb2R5UGFyc2VkW1wic3Vic2NyaXB0aW9uSWRcIl0gIT09IHVuZGVmaW5lZCAmJiByZXF1ZXN0Qm9keVBhcnNlZFtcInN1YnNjcmlwdGlvbklkXCJdICE9PSBudWxsICYmXG4gICAgICAgICAgICAgICAgcmVxdWVzdEJvZHlQYXJzZWRbXCJ0aW1lc3RhbXBcIl0gIT09IHVuZGVmaW5lZCAmJiByZXF1ZXN0Qm9keVBhcnNlZFtcInRpbWVzdGFtcFwiXSAhPT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgIHJlcXVlc3RCb2R5UGFyc2VkW1wiY2FsbGJhY2tVcmxcIl0gIT09IHVuZGVmaW5lZCAmJiByZXF1ZXN0Qm9keVBhcnNlZFtcImNhbGxiYWNrVXJsXCJdICE9PSBudWxsICYmXG4gICAgICAgICAgICAgICAgcmVxdWVzdEJvZHlQYXJzZWRbXCJ0b3BpY1wiXSAhPT0gdW5kZWZpbmVkICYmIHJlcXVlc3RCb2R5UGFyc2VkW1widG9waWNcIl0gIT09IG51bGwgJiZcbiAgICAgICAgICAgICAgICByZXF1ZXN0Qm9keVBhcnNlZFtcImRhdGFcIl0gICE9PSB1bmRlZmluZWQgJiYgcmVxdWVzdEJvZHlQYXJzZWRbXCJkYXRhXCJdICAhPT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgIHJlcXVlc3REYXRhICE9PSB1bmRlZmluZWQgJiYgcmVxdWVzdERhdGEgIT09IG51bGwgJiZcbiAgICAgICAgICAgICAgICByZXF1ZXN0RGF0YVtcIndlYmhvb2tFdmVudFR5cGVcIl0gIT09IHVuZGVmaW5lZCAmJiByZXF1ZXN0RGF0YVtcIndlYmhvb2tFdmVudFR5cGVcIl0gIT09IG51bGwgJiZcbiAgICAgICAgICAgICAgICByZXF1ZXN0RGF0YVtcInRyYW5zYWN0aW9uSWRcIl0gIT09IHVuZGVmaW5lZCAmJiByZXF1ZXN0RGF0YVtcInRyYW5zYWN0aW9uSWRcIl0gIT09IG51bGwgJiZcbiAgICAgICAgICAgICAgICByZXF1ZXN0RGF0YVtcImNhcmRJZFwiXSAhPT0gdW5kZWZpbmVkICYmIHJlcXVlc3REYXRhW1wiY2FyZElkXCJdICE9PSBudWxsICYmXG4gICAgICAgICAgICAgICAgcmVxdWVzdERhdGFbXCJtZW1iZXJJZFwiXSAhPT0gdW5kZWZpbmVkICYmIHJlcXVlc3REYXRhW1wibWVtYmVySWRcIl0gIT09IG51bGwgJiZcbiAgICAgICAgICAgICAgICByZXF1ZXN0RGF0YVtcIm9mZmVySWRcIl0gIT09IHVuZGVmaW5lZCAmJiByZXF1ZXN0RGF0YVtcIm9mZmVySWRcIl0gIT09IG51bGwgJiZcbiAgICAgICAgICAgICAgICByZXF1ZXN0RGF0YVtcImFtb3VudFwiXSAhPT0gdW5kZWZpbmVkICYmIHJlcXVlc3REYXRhW1wiYW1vdW50XCJdICE9PSBudWxsICYmXG4gICAgICAgICAgICAgICAgcmVxdWVzdERhdGFbXCJzdGF0dXNcIl0gIT09IHVuZGVmaW5lZCAmJiByZXF1ZXN0RGF0YVtcInN0YXR1c1wiXSAhPT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgIHJlcXVlc3REYXRhW1wicHJldmlvdXNTdGF0dXNcIl0gIT09IHVuZGVmaW5lZCAmJiByZXF1ZXN0RGF0YVtcInByZXZpb3VzU3RhdHVzXCJdICE9PSBudWxsICYmXG4gICAgICAgICAgICAgICAgcmVxdWVzdERhdGFbXCJkaXN0cmlidXRlZFRvTWVtYmVyQW1vdW50XCJdICE9PSB1bmRlZmluZWQgJiYgcmVxdWVzdERhdGFbXCJkaXN0cmlidXRlZFRvTWVtYmVyQW1vdW50XCJdICE9PSBudWxsKSB7XG5cbiAgICAgICAgICAgICAgICAvLyBpbml0aWFsaXppbmcgdGhlIFNOUyBDbGllbnRcbiAgICAgICAgICAgICAgICBjb25zdCBzbnNDbGllbnQgPSBuZXcgU05TQ2xpZW50KHtyZWdpb246IHJlZ2lvbn0pO1xuXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogZHJvcCB0aGUgdXBkYXRlZCB0cmFuc2FjdGlvbiBhcyBhIG1lc3NhZ2UgdG8gdGhlIHVwZGF0ZWQgdHJhbnNhY3Rpb25zIHByb2Nlc3NpbmcgdG9waWNcbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBjb25zdCB1cGRhdGVkVHJhbnNhY3Rpb25SZWNlaXB0ID0gYXdhaXQgc25zQ2xpZW50LnNlbmQobmV3IFB1Ymxpc2hDb21tYW5kKHtcbiAgICAgICAgICAgICAgICAgICAgVG9waWNBcm46IHByb2Nlc3MuZW52LlVQREFURURfVFJBTlNBQ1RJT05TX1BST0NFU1NJTkdfVE9QSUNfQVJOISxcbiAgICAgICAgICAgICAgICAgICAgTWVzc2FnZTogcmVxdWVzdEJvZHksXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiB0aGUgbWVzc2FnZSBncm91cCBpZCwgd2lsbCBiZSByZXByZXNlbnRlZCBieSB0aGUgT2xpdmUgbWVtYmVyIGlkLCBzbyB0aGF0IHdlIGNhbiBncm91cCB1cGRhdGUgdHJhbnNhY3Rpb24gbWVzc2FnZXMgZm9yIGEgcGFydGljdWxhciBtZW1iZXIgaWQsXG4gICAgICAgICAgICAgICAgICAgICAqIGFzc29jaWF0ZWQgdG8gYSBNb29uYmVhbSB1c2VyIGlkLCBhbmQgc29ydCB0aGVtIGluIHRoZSBGSUZPIHByb2Nlc3NpbmcgdG9waWMgYWNjb3JkaW5nbHkuXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBNZXNzYWdlR3JvdXBJZDogcmVxdWVzdERhdGFbXCJtZW1iZXJJZFwiXVxuICAgICAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgICAgIC8vIGVuc3VyZSB0aGF0IHRoZSB1cGRhdGVkIHRyYW5zYWN0aW9uIG1lc3NhZ2Ugd2FzIHByb3Blcmx5IHNlbnQgdG8gdGhlIGFwcHJvcHJpYXRlIHByb2Nlc3NpbmcgdG9waWNcbiAgICAgICAgICAgICAgICBpZiAodXBkYXRlZFRyYW5zYWN0aW9uUmVjZWlwdCAmJiB1cGRhdGVkVHJhbnNhY3Rpb25SZWNlaXB0Lk1lc3NhZ2VJZCAmJiB1cGRhdGVkVHJhbnNhY3Rpb25SZWNlaXB0Lk1lc3NhZ2VJZC5sZW5ndGggIT09IDAgJiZcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlZFRyYW5zYWN0aW9uUmVjZWlwdC5TZXF1ZW5jZU51bWJlciAmJiB1cGRhdGVkVHJhbnNhY3Rpb25SZWNlaXB0LlNlcXVlbmNlTnVtYmVyLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogdGhlIHVwZGF0ZWQgdHJhbnNhY3Rpb24gaGFzIGJlZW4gc3VjY2Vzc2Z1bGx5IGRyb3BwZWQgaW50byB0aGUgdG9waWMsIGFuZCB3aWxsIGJlIHBpY2tlZCB1cCBieSB0aGUgdXBkYXRlZCB0cmFuc2FjdGlvbnMgY29uc3VtZXIgYW5kIG90aGVyXG4gICAgICAgICAgICAgICAgICAgICAqIHNlcnZpY2VzLCBsaWtlIHRoZSBub3RpZmljYXRpb25zIHNlcnZpY2UgY29uc3VtZXIuXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgVXBkYXRlZCBUcmFuc2FjdGlvbiBldmVudCBzdWNjZXNzZnVsbHkgc2VudCB0byB0b3BpYyBmb3IgcHJvY2Vzc2luZyB3aXRoIHJlY2VpcHQgaW5mb3JtYXRpb246ICR7dXBkYXRlZFRyYW5zYWN0aW9uUmVjZWlwdC5NZXNzYWdlSWR9ICR7dXBkYXRlZFRyYW5zYWN0aW9uUmVjZWlwdC5TZXF1ZW5jZU51bWJlcn1gKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzQ29kZTogMjAyLFxuICAgICAgICAgICAgICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGBVcGRhdGVkIHRyYW5zYWN0aW9uIGFja25vd2xlZGdlZCFgXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgc2VuZGluZyB0aGUgdXBkYXRlZCB0cmFuc2FjdGlvbiBtZXNzYWdlIGZ1cnRoZXIhYDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogaWYgdGhlcmUgYXJlIGVycm9ycyBhc3NvY2lhdGVkIHdpdGggc2VuZGluZyB0aGUgbWVzc2FnZSB0byB0aGUgdG9waWMuXG4gICAgICAgICAgICAgICAgICAgICAqIE9saXZlIHdpbGwgcmV0cnkgc2VuZGluZyB0aGlzIG1lc3NhZ2UgdXBvbiByZWNlaXZpbmcgb2YgYSBub24gMlhYIGNvZGVcbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXNDb2RlOiA0MjQsXG4gICAgICAgICAgICAgICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5VbnByb2Nlc3NhYmxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBpbnZhbGlkIHJlcXVlc3Qgb2JqZWN0XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYEludmFsaWQgcmVxdWVzdCBib2R5IHBhc3NlZCBpbi5gO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtyZXF1ZXN0Qm9keX1gKTtcblxuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIHJldHVybiB0aGUgZXJyb3IgYWNjb3JkaW5nbHlcbiAgICAgICAgICAgICAgICAgKiBPbGl2ZSB3aWxsIHJldHJ5IHNlbmRpbmcgdGhpcyBtZXNzYWdlIHVwb24gcmVjZWl2aW5nIG9mIGEgbm9uIDJYWCBjb2RlXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzQ29kZTogNDAwLFxuICAgICAgICAgICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBpZiB0aGUgcmVxdWVzdCBib2R5IGlzIG51bGwsIHJldHVybiBhIHZhbGlkYXRpb24gZXJyb3IgYWNjb3JkaW5nbHlcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBJbnZhbGlkIHJlcXVlc3QgYm9keSBwYXNzZWQgaW4uYDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtyZXF1ZXN0Qm9keX1gKTtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiByZXR1cm4gdGhlIGVycm9yIGFjY29yZGluZ2x5XG4gICAgICAgICAgICAgKiBPbGl2ZSB3aWxsIHJldHJ5IHNlbmRpbmcgdGhpcyBtZXNzYWdlIHVwb24gcmVjZWl2aW5nIG9mIGEgbm9uIDJYWCBjb2RlXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc3RhdHVzQ29kZTogNDAwLFxuICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBUcmFuc2FjdGlvbnNFcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yLFxuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBwcm9jZXNzaW5nICR7cm91dGV9IHJlcXVlc3RgO1xuICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9ICR7ZXJyb3J9YCk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIHJldHVybiB0aGUgZXJyb3IgYWNjb3JkaW5nbHlcbiAgICAgICAgICogT2xpdmUgd2lsbCByZXRyeSBzZW5kaW5nIHRoaXMgbWVzc2FnZSB1cG9uIHJlY2VpdmluZyBvZiBhIG5vbiAyWFggY29kZVxuICAgICAgICAgKi9cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN0YXR1c0NvZGU6IDUwMCxcbiAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICBkYXRhOiBudWxsLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvcixcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==